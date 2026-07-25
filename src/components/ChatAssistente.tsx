import React, { useState, useEffect, useRef, useCallback } from "react";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import {
  Image as ImageIcon,
  MessageSquare,
  X,
  Send,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Paperclip,
  Code,
  Megaphone,
  Layers,
  FileText,
  Search,
  Eye,
  UploadCloud,
  Zap,
  Bot,
  Trash2,
  File,
  Check,
  Plus,
  FolderOpen,
  Maximize2, Settings,
  Minimize2,
  Loader2
} from "lucide-react";

interface ChatFile {
  name: string;
  type: string;
  data: string; // base64 string
  size?: number;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
  files?: ChatFile[];
}

interface AssistantConfig {
  id: string;
  label: string;
  sublabel: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

interface ChatAssistenteProps {
  customApiKey: string;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}


const assistants: AssistantConfig[] = [
  // Designers / Creators
  { id: "gc-tv-specialist", label: "Gerador de Tarjas & GCs (TV)", sublabel: "Especialista em Transmissão", desc: "Crie tarjas, lower-thirds e elementos visuais profissionais para programas, matérias e transmissões ao vivo.", icon: <Zap size={14} />, color: "#38bdf8" },
  { id: "prompt-extrator", label: "Extrator de Prompts", sublabel: "Analista de Engenharia Visual", desc: "Decodifique a estrutura e os parâmetros técnicos de referências visuais para reprodução exata.", icon: <Code size={14} />, color: "#ad8330" },
  { id: "creative-assistant", label: "Assistente de Composição", sublabel: "Consultor de Estilo & Iluminação", desc: "Receba direcionamentos conceituais de iluminação, paletas de cores, enquadramento e cenografia.", icon: <Sparkles size={14} />, color: "#d4af37" },
  { id: "diretor-criativo", label: "Diretor Criativo IA", sublabel: "Direção de Arte & Branding", desc: "Avançe além do bloqueio criativo com orientações estratégicas de design de alto impacto.", icon: <Eye size={14} />, color: "#ad8330" },
  { id: "analisador-paginas", label: "Analisador de Design", sublabel: "Auditoria Visual & UX", desc: "Submeta artes e layouts para diagnósticos profissionais de hierarquia, contraste e legibilidade.", icon: <Search size={14} />, color: "#ffffff" },
  
  // Copywriters & Marketers
  { id: "copy-ads", label: "Redator de Anúncios (Ads)", sublabel: "Especialista em Performance", desc: "Desenvolva textos de alta conversão estruturados com ganchos, quebra de objeções e chamadas para ação.", icon: <Megaphone size={14} />, color: "#ad8330" },
  { id: "copy-carroseis", label: "Redator de Carrosséis", sublabel: "Engajamento & Conteúdo", desc: "Crie narrativas envolventes em carrosséis que retêm a atenção e conduzem o público até a conversão.", icon: <Layers size={14} />, color: "#d4af37" },
  { id: "easy-copy", label: "Redator de Copywriting", sublabel: "Textos de Venda & LPs", desc: "Produza copys completas para landing pages, e-mails e páginas de vendas em qualquer segmento.", icon: <FileText size={14} />, color: "#ad8330" },
  
  // Strategists
  { id: "analise-estrategica", label: "Análise Estratégica", sublabel: "Inteligência de Mercado", desc: "Mapeie dores reais do cliente, analise concorrentes e estruture propostas de valor irresistíveis.", icon: <Check size={14} />, color: "#4f46e5" },
  { id: "icp", label: "ICP & Posicionamento", sublabel: "Estratégia de Marca", desc: "Defina o perfil de cliente ideal e consolide uma presença de marca com alta autoridade no mercado.", icon: <Check size={14} />, color: "#4f46e5" },
  
  // Sales
  { id: "atendimento", label: "Atendimento & Negociação", sublabel: "Gestão de Objeções", desc: "Conduza reuniões e diálogos comerciais com técnicas que aceleram a decisão do cliente.", icon: <Check size={14} />, color: "#10b981" },
  { id: "webson-vendedor", label: "Consultor de Vendas IA", sublabel: "Fechamento Comercial", desc: "Analise conversas com leads e receba respostas prontas para superar travas de negociação.", icon: <Check size={14} />, color: "#10b981" },
  
  // Dev & Sites
  { id: "estrutura-sites", label: "Arquiteto de Landing Pages", sublabel: "Arquitetura de Informação", desc: "Estruture wireframes e seções estratégicas otimizadas para taxa de conversão e navegabilidade.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-coder", label: "Assistente de Código Web", sublabel: "Desenvolvimento Front-end", desc: "Receba trechos de código limpo em HTML, CSS, JavaScript e React prontos para implementação.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-image", label: "Gerador Visual de Imagens", sublabel: "Sintetizador Gráfico", desc: "Gere imagens realistas e ilustrações técnicas com alto nível de detalhamento descritivo.", icon: <ImageIcon size={14} />, color: "#ec4899" },
];


const formatMessage = (text: string) => {
  // Strip out JSON code blocks containing configurations or general JSON objects completely from visual output
  let cleanText = text;
  
  // 1. Strip marked json code blocks
  cleanText = cleanText.replace(/```json\n[\s\S]*?\n```/g, '').replace(/```json[\s\S]*?```/g, '');
  
  // 2. Strip generic code blocks that look like JSON configurations (with curly braces)
  cleanText = cleanText.replace(/```\n?\{[\s\S]*?\}\n?```/g, '');
  
  // 3. Strip raw JSON objects that might not be wrapped in code blocks but have configuration keys
  cleanText = cleanText.replace(/\{[^{}]*"desativarSujeito"[^{}]*\}/g, '');
  cleanText = cleanText.replace(/\{[^{}]*"cores"[^{}]*\}/g, '');
  cleanText = cleanText.replace(/\{[^{}]*"additionalPrompt"[^{}]*\}/g, '');
  
  cleanText = cleanText.trim();

  // If there's nothing left after stripping (e.g. it only returned JSON), say "Configurações preparadas."
  const textToRender = cleanText || "*Diretor Criativo: Configurações do painel prontas para você! Clique em 'Gerar Background' para ver o resultado.*";

  const lines = textToRender.split("\n");
  
  // Sections to highlight
  const sections = ["Diretor:", "Extrator:", "Prompt:", "Passo:", "Análise:", "Plano:", "Diretor Criativo:"];
  
  return lines.map((line, i) => {
    let isHeader = false;
    for (const section of sections) {
        if (line.startsWith(section)) {
            isHeader = true;
            break;
        }
    }
    
    if (isHeader) {
      return (
        <div key={i} className="my-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[12px] text-zinc-300 font-semibold">
           {line}
        </div>
      );
    }
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-black text-[#c5a880]">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
  return Promise.resolve(base64Str);
};




export const ChatAssistente: React.FC<ChatAssistenteProps> = ({ customApiKey, showToast }) => {
  const store = useProjectStore();
  const { clients, activeClientId, setActiveClient, appendAiLearnings } = useClientStore();
  const { chatDrawerOpen, setChatDrawerOpen, chatActiveAssistantId, setChatActiveAssistantId } = useProjectStore();
  const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(assistants[0]);

  useEffect(() => {
    if (chatActiveAssistantId) {
      const found = assistants.find(a => a.id === chatActiveAssistantId);
      if (found) {
        setActiveAssistant(found);
        if (!chatDrawerOpen) setChatDrawerOpen(true);
      }
    }
  }, [chatActiveAssistantId]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.6-flash");
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    return Object.fromEntries(assistants.map((a) => [a.id, []]));
  });

  useEffect(() => {
    let isMounted = true;
    const loadChats = async () => {
      try {
        if (!store.activeProjectId) return;
        let savedObj = await idbGet(`zion_assistant_chats_${store.activeProjectId}`);
        if (!savedObj) {
          const savedStr = localStorage.getItem(`zion_assistant_chats_${store.activeProjectId}`);
          if (savedStr) savedObj = JSON.parse(savedStr);
        }
        
        if (isMounted) {
          if (savedObj) {
            setChats(savedObj);
          } else {
            setChats(Object.fromEntries(assistants.map((a) => [a.id, []])));
          }
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
        if (isMounted) setChats(Object.fromEntries(assistants.map((a) => [a.id, []])));
      }
    };
    loadChats();
    return () => { isMounted = false; };
  }, [store.activeProjectId]);

  useEffect(() => {
    try {
      if (store.activeProjectId) {
        idbSet(`zion_assistant_chats_${store.activeProjectId}`, chats).catch(e => console.error("Error saving chat history IDB:", e));
      }
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [chats, store.activeProjectId]);
  const [inputText, setInputText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMessages = chats[activeAssistant.id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeAssistant.id, isTyping]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAttachFiles = useCallback((files: FileList | File[], triggerFlow = false) => {
    setIsUploading(true);
    const fileList = Array.from(files);
    let count = 0;

    fileList.forEach(async (file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let b64 = reader.result as string;

        // Se for imagem, aplica compressão local para reduzir de MBs para KBs
        if (file.type.startsWith("image/")) {
          try {
            b64 = await compressImage(b64, 512, 512, 0.6);
          } catch (compressErr) {
            console.error("Erro na compressão automática do chat:", compressErr);
          }
        }

        const cleanBytes = b64.replace(/^data:[^;]+;base64,/, "");

        const newFile: ChatFile = {
          name: file.name,
          type: file.type || "application/octet-stream",
          data: cleanBytes,
          size: file.size
        };

        setAttachedFiles((prev) => [...prev, newFile]);
        count++;
        
        if (count === fileList.length) {
          setIsUploading(false);
          showToast(`${fileList.length} arquivo(s) anexado(s) com sucesso!`, "success");
        }

        if (triggerFlow && activeAssistant.id === "prompt-extrator" && file.type.startsWith("image/")) {
          setTimeout(() => {
            handleSendMessage("Por favor, analise a imagem e extraia o prompt.", [newFile]);
          }, 100);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [activeAssistant.id]);

  const handleSendMessage = async (overrideText?: string, overrideFiles?: ChatFile[]) => {
    const textToSend = overrideText || inputText;
    const filesToSend = overrideFiles || attachedFiles;
    
    if (!textToSend.trim() && filesToSend.length === 0) return;

    const userMsg: ChatMessage = { 
      role: "user", 
      content: textToSend.trim(), 
      files: filesToSend.length > 0 ? filesToSend : undefined 
    };

    const currentMessages = chats[activeAssistant.id] || [];
    setChats((prev) => ({ ...prev, [activeAssistant.id]: [...currentMessages, userMsg] }));
    if (!overrideText) setInputText("");
    if (!overrideFiles) setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    let currentActiveClientId = activeClientId;
    if (!currentActiveClientId) {
       const lowerText = (userMsg.content || "").toLowerCase();
       const matchedClient = clients.find(c => {
         const clientName = c.name.toLowerCase();
         const regex = new RegExp(`\\b${clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
         return regex.test(lowerText);
       });
       if (matchedClient) {
          currentActiveClientId = matchedClient.id;
          useClientStore.getState().setActiveClient(matchedClient.id);
       }
    }
    const activeClient = clients.find(c => c.id === currentActiveClientId);
    const clientContext = activeClient ? `\n\n[CONTEXTO DO CLIENTE ATUAL]:\nCliente: ${activeClient.name}\nNicho: ${activeClient.niche}\nPaleta de Cores: ${activeClient.paletaCores?.join(', ') || 'Nenhuma'}\nInfo Adicional: ${activeClient.infoExtra}\nHistórico IA: ${activeClient.bancoDeDadosIA}\n[IMPORTANTE]: Use essa paleta de cores e informações para guiar o design. Se aprender algo novo sobre o cliente, retorne no JSON no campo "aprendizado_cliente".` : "";

    const configContext = `
[ATENÇÃO DIRETOR CRIATIVO / ASSISTENTE]: Aja como um Diretor de Criação interagindo no bate-papo. Converse naturalmente com o usuário, tire dúvidas e dê opiniões como um humano. NÃO apenas vomite código.
Quando o usuário pedir para alterar o design, ou enviar arquivos de referência, você deve conversar com ele E incluir um bloco JSON OCULTO no final da sua mensagem para automatizar a interface.
IMPORTANTE: Você é um assistente. Você NÃO gera a imagem diretamente. Você apenas configura a interface. Sempre instrua o usuário a clicar no botão "GERAR IMAGEM" no painel principal após você preparar as configurações.

[CONFIGURAÇÃO ATUAL DO EDITOR]:
- Desativar Sujeito Principal: ${store.desativarSujeito ? "ATIVADO (O sujeito principal está DESATIVADO)" : "DESATIVADO (O sujeito principal está ATIVADO/HABILITADO)"}
- Sem Pessoas (noPeople): ${store.noPeople ? "ATIVADO (Não há pessoas)" : "DESATIVADO (Pode conter pessoas)"}
- Usar Referência de Cenário (useEnvRef): ${store.useEnvRef ? "ATIVADO" : "DESATIVADO"}
- Usar Logotipo (useLogo): ${store.useLogo ? "ATIVADO" : "DESATIVADO"}
- Habilitar Textos (enableTypography): ${store.enableTypography ? "ATIVADO" : "DESATIVADO"}
- Camadas de Texto Atuais no Editor (${store.camadasTexto?.length || 0} camadas):
${(store.camadasTexto || []).map((t, idx) => `  ${idx + 1}. [Função: "${t.funcao}"] [ID: "${t.id}"] Conteúdo: "${t.conteudo}" (Fonte: ${t.fonte || 'Outfit'}, Cor: ${t.cor || '#ffffff'})`).join("\n") || "  (Nenhuma camada de texto definida)"}
- Degradê de Leitura (degradeLeitura): ${store.degradeLeitura ? "ATIVADO" : "DESATIVADO"}
- Desfoque no Cenário (enableBlur): ${store.enableBlur ? "ATIVADO" : "DESATIVADO"}
- Degradê Lateral (lateralGradient): ${store.lateralGradient ? "ATIVADO" : "DESATIVADO"}
- Elementos Flutuantes (floatingElementsMode): ${store.floatingElementsMode} (personalizado: "${store.floatingElementsCustom}")
- Composição/Enquadramento (composicao): ${store.composicao} (personalizado: "${store.composicaoCustom}")
- Cores Atuais: Ambiente: ${store.cores.ambiente}, Recorte: ${store.cores.recorte}, Complementar: ${store.cores.complementar}
- Cores Automáticas: ${store.coresAutomaticas ? "ATIVADO" : "DESATIVADO"}
- Cor Dominante: ${store.corDominante} (Usar: ${store.useCorDominante ? "SIM" : "NÃO"})
- Proporção: ${store.dimensao}
- Nível Criativo / Sobriedade: ${store.nivelCriativo}%
- Habilitar Estilo Visual: ${store.enableEstiloVisual ? "ATIVADO" : "DESATIVADO"}
- Estilos Visuais Ativos: ${store.estilosVisuais.join(", ")}
- Estilo Visual Customizado: "${store.estiloVisualCustom || ""}"
- Posição Global do Texto (typographyPosition): "${store.typographyPosition || "CENTRO"}"
- Prompt Cenário: "${store.promptCenario}"
- Prompt Adicional Principal: "${store.additionalPrompt}"
- Prompt Negativo: "${store.negativePrompt}"
- Sujeitos Carregados: ${store.sujeitosBase64List?.length || 0} fotos
- Cenários Carregados: ${store.cenariosBase64List?.length || 0} fotos
- Logos Carregados: ${store.logosList?.length || 0} logos
- Qualidade / Modelo Ativo: ${store.resolucao} (usando o modelo: gemini-3-pro-image)

Regras de Automação do JSON (SEMPRE adicione no final se houver mudança de contexto):
- Se uma das imagens for CLARAMENTE um Logotipo de uma marca (fundo transparente, símbolo, escrita): ative "useLogo": true. NÃO descreva estilo visual para a logo, NÃO adicione como referência de cenário ou estilo. O gerador irá estampar a logo como ela é.
1. Se a arte NÃO deve ter pessoas ou sujeito, mude "desativarSujeito": true e "noPeople": true.
2. Se a arte TEM que ter sujeito ou pessoa, mude "desativarSujeito": false e "noPeople": false.
3. Se a arte precisa de logo, mude "useLogo": true. NÃO descreva o estilo visual da logo.
4. Se a arte precisa de textos, mude "enableTypography": true e preencha "camadasTexto" e "promptTipografia".
5. Se a arte exige uma cor específica, atualize "cores" e defina "coresAutomaticas": false. Se a arte NÃO exige uma cor específica, você DEVE definir "coresAutomaticas": true e omitir o objeto "cores".
6. REGRA CRÍTICA DE CENÁRIO: "useEnvRef" DEVE ser true APENAS se houver foto de cenário/imagem de fundo enviada ou anexada. Se NÃO houver imagem de referência de cenário enviada, defina OBRIGATORIAMENTE "useEnvRef": false.
7. O sistema suporta o preenchimento completo de TODAS as seções do editor:
   - Sujeito Principal: "desativarSujeito", "noPeople", "gender" ("Masculino"|"Feminino"|"Outros"), "multiplesPersons" (boolean), "gendersDescription", "poseDescription", "positioning" ("Esquerda"|"Centro"|"Direita").
   - Dimensões: "dimensao" ("1:1" | "3:4" | "9:16" | "16:9").
   - Tipografia: "enableTypography" (true), "camadasTexto" (array de { conteudo, funcao, fonte, cor }), "promptTipografia", "typographyPosition" ("ESQUERDA"|"CENTRO"|"DIREITA").
   - Cenário: "useEnvRef", "promptCenario".
   - Design Obrigatório: "promptDesign".
   - Logotipo: "useLogo".
   - Cores & Iluminação: "coresAutomaticas" (false), "cores" ({ ambiente, recorte, complementar }), "corDominante", "useCorDominante", "degradeLeitura".
   - Composição: "composicao" ("Close-up (Rosto)"|"Plano Médio (Busto)"|"Plano Americano"), "composicaoCustom".
   - Elementos Flutuantes: "floatingElementsMode" ("off"|"auto"|"custom"), "floatingElementsCustom".
   - Atributos Visuais & Estilo: "sobriedade" (0-100), "enableEstiloVisual" (true), "estilosVisuais" (array), "estiloVisualCustom", "enableBlur", "lateralGradient".
   - Entradas Manuais: "additionalPrompt", "negativePrompt".
   - Opções Avançadas: "resolucao" ("1K"|"2K"|"4K"), "formatoExportacao" ("AVIF"|"PNG"|"JPEG"|"WEBP"), "variations" (1-5), "somentePrompt" (boolean).
8. MANTENHA SIMPLES: Não gere descrições gigantes em "promptCenario", "estiloVisualCustom", "additionalPrompt" ou outros campos de texto. Seja extremamente DIRETO e CONCISO. Textos muito longos confundem o gerador de imagens e geram alucinações. Foque no que importa.
9. DADOS DA REFERÊNCIA: Se na imagem de referência houver logos de outras marcas, textos antigos, ou perfis de instagram, NÃO inclua isso na geração! Remova essas informações e use APENAS as informações enviadas pelo cliente.
10. POSICIONAMENTO EXATO: Instrua claramente na descrição o lugar EXATO onde deve ficar a logo, ícones, textos e efeitos (ex: "logo posicionada no topo ao centro", "texto centralizado na parte inferior"). Isso ajuda a IA a não espalhar as coisas aleatoriamente.
11. MODELOS PREMIUM DE ULTRA PRECISÃO: O sistema agora utiliza o modelo "gemini-3-pro-image" (suportando qualidades 1K, 2K e 4K) no GoogleGenAI. Para alterar o modelo/resolução ativo, passe a chave "resolucao": "1K" | "2K" | "4K" correspondente no JSON. Explique essa novidade ao usuário se ele pedir ajustes de qualidade!
12. REGRA ABSOLUTA DE FUNDO SÓLIDO / COR ÚNICA (PURE SOLID COLOR BACKGROUND):
    Se o usuário pedir apenas um fundo sólido, cor de fundo, canvas limpo ou cor única (ex: "CRIE UM FUNDO SOLIDO NA COR #0b1c32 4:5", "fundo liso azul", "cor sólida"):
    - "desativarSujeito": true, "noPeople": true, "enableTypography": false, "camadasTexto": [], "promptTipografia": "", "useLogo": false, "useEnvRef": false
    - "promptDesign": "Pure flat solid color canvas."
    - "promptCenario": "Pure solid dark blue background (#0b1c32), flat matte finish, no people, no text, no shapes, no gradients."
    - "additionalPrompt": "A completely blank pure solid color background canvas in exact hex color #0b1c32, zero models, zero subjects, zero text, zero graphics."
    - "negativePrompt": "people, human, model, male, female, person, text, typography, headline, flyer, poster, neon, glow, smartphone, 3d, gradient, shapes, objects"
    - "dimensao": "3:4" (se 4:5) ou "1:1"
    - "corDominante": "#0b1c32", "useCorDominante": true, "coresAutomaticas": false
    - JAMAIS adicione mockups de celular, frases de sindicato, modelos ou neon que o usuário NÃO solicitou!
13. REGRA ABSOLUTA DE EDIÇÃO, ALTERAÇÃO E REMOÇÃO DE ELEMENTOS:
    - Se o usuário pedir para ALTERAR ou MUDAR um texto ou valor (ex: "mude o valor para R$ 600", "troque locução por apresentadora", "corrija X"):
      * MANTENHA TODOS OS OUTROS TEXTOS do editor que já estavam certos e não foram mencionados pelo usuário.
      * Consulte a lista "[Camadas de Texto Atuais no Editor]" enviada no contexto acima e retorne em "camadasTexto" a lista COMPLETA das camadas com as alterações solicitadas.
    - Se o usuário pedir para REMOVER, EXCLUIR ou TIRAR um texto ou informação (ex: "remova a locução", "tire o valor", "apague a frase X"):
      * Envie a chave "removerCamadasTexto": ["Locução"] ou ["Função/Trecho do texto a remover"].
      * Ou envie "substituirCamadasTexto": true e em "camadasTexto" coloque apenas a lista das camadas que DEVEM PERMANECER.
    - Se o usuário pedir para REMOVER PESSOAS/MODELO: defina "desativarSujeito": true, "noPeople": true.
    - Se o usuário pedir para REMOVER CENÁRIO/FUNDO: defina "useEnvRef": false e "promptCenario": "".
    - Se o usuário pedir para REMOVER LOGO: defina "useLogo": false.
    - Se o usuário pedir para LIMPAR um prompt/observação/estilo: envie o campo correspondente como string vazia (ex: "additionalPrompt": "", "negativePrompt": "", "promptCenario": "").

Exemplo OBRIGATÓRIO de JSON no final da sua resposta (use o bloco \`\`\`json):
\`\`\`json
{
  "desativarSujeito": true,
  "noPeople": true,
  "dimensao": "3:4",
  "enableTypography": false,
  "camadasTexto": [],
  "typographyPosition": "CENTRO",
  "promptTipografia": "",
  "promptDesign": "Pure flat solid color canvas.",
  "promptCenario": "Pure solid dark blue background (#0b1c32), matte finish, clean solid color, no gradients, no text, no people.",
  "useLogo": false,
  "useEnvRef": false,
  "cores": {
    "ambiente": "#0b1c32",
    "recorte": "#0b1c32",
    "complementar": "#0b1c32"
  },
  "coresAutomaticas": false,
  "corDominante": "#0b1c32",
  "useCorDominante": true,
  "degradeLeitura": false,
  "sobriedade": 100,
  "enableEstiloVisual": false,
  "estilosVisuais": ["Clean"],
  "estiloVisualCustom": "Clean e minimalista com fundo de cor sólida.",
  "additionalPrompt": "A completely blank pure solid color background canvas in exact color #0b1c32 with zero models, zero text, zero graphics.",
  "negativePrompt": "people, human, person, model, text, typography, headline, flyer, poster, neon, glow, smartphone, 3d, gradient, shapes, objects",
  "resolucao": "1K",
  "formatoExportacao": "PNG",
  "variations": 1,
  "somentePrompt": false
}
\`\`\`
Lembre-se: converse como humano primeiro e só anexe o JSON no final se for necessário alterar a interface!`;

    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: (userMsg.content || "Analise os arquivos enviados.") + clientContext + configContext,
          attachedFiles: userMsg.files,
          history: currentMessages.map((m) => ({ 
            role: m.role, 
            content: m.content,
            files: m.files 
          })),
          customApiKey: customApiKey || localStorage.getItem("custom_gemini_api_key") || "",
          modelId: selectedModel
        })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro no servidor.");
      }
      const data = await res.json();
      setChats((prev) => ({
        ...prev,
        [activeAssistant.id]: [
          ...(prev[activeAssistant.id] || []),
          { role: "model", content: data.response || "Sem resposta." }
        ]
      }));

      const hasJsonBlock = (text: string) => {
        if (!text) return false;
        if (text.includes('```json')) return true;
        if (text.includes('```')) {
          const match = text.match(/```[\s\S]*?\{[\s\S]*?\}[\s\S]*?```/);
          if (match) return true;
        }
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx > startIdx) {
          const inner = text.slice(startIdx, endIdx + 1);
          return inner.includes('"cores"') || 
                 inner.includes('"desativarSujeito"') || 
                 inner.includes('"noPeople"') || 
                 inner.includes('"enableTypography"') || 
                 inner.includes('"additionalPrompt"') || 
                 inner.includes('"promptCenario"') ||
                 inner.includes('"coresAutomaticas"') ||
                 inner.includes('"estilosVisuais"');
        }
        return false;
      };

      if (data.response && (hasJsonBlock(data.response) || (userMsg.files && userMsg.files.length > 0))) {
        setTimeout(() => applyModelMessageToEditor(-1, data.response, userMsg.files), 100);
      }
    } catch (err: any) {
      showToast(err.message || "Falha na comunicação com a IA.", "error");
    } finally {
      setIsTyping(false);
    }
  };

  const handleAutoFillWithAi = async () => {
    const textPrompt = inputText.trim();
    if (attachedFiles.length === 0 && !textPrompt && !store.designRefBase64 && !store.tipografiaRefBase64 && !store.sujeitoBase64) {
      showToast("Por favor, digite instruções ou anexe imagens para o preenchimento automático.", "warning");
      return;
    }

    setIsTyping(true);
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    if (textPrompt) setInputText("");

    // 1. Adicionar mensagem do usuário no chat para feedback visual
    const autoFillUserMsg: ChatMessage = {
      role: "user",
      content: textPrompt 
        ? `[PREENCHER AUTOMÁTICO] Instruções do usuário: "${textPrompt}". Analise todos os textos e ${filesToSend.length} imagens anexadas e configure 100% de todas as seções do projeto automaticamente no editor.`
        : `[PREENCHER AUTOMÁTICO] Por favor, analise as ${filesToSend.length} imagens de referência anexadas e configure 100% de todas as seções do projeto automaticamente no editor.`,
      files: filesToSend
    };

    setChats((prev) => ({
      ...prev,
      [activeAssistant.id]: [
        ...(prev[activeAssistant.id] || []),
        autoFillUserMsg
      ]
    }));

    const activeClient = clients.find(c => c.id === activeClientId);
    const clientContext = activeClient ? `\n\n[CONTEXTO DO CLIENTE ATUAL]:\nCliente: ${activeClient.name}\nNicho: ${activeClient.niche}\nPaleta de Cores: ${activeClient.paletaCores?.join(', ') || 'Nenhuma'}\nInfo Adicional: ${activeClient.infoExtra}\nHistórico IA: ${activeClient.bancoDeDadosIA}` : "";

    const autoFillPrompt = `
Você é o Diretor Criativo e de Inteligência de Design da Zion. O usuário acabou de clicar no botão PREENCHER AUTOMÁTICO.
Sua missão absoluta é analisar detalhadamente todas as instruções em texto e/ou imagens anexadas (${filesToSend.length} imagens) e configurar 100% de TODAS as opções do editor de forma profissional, completa e estética.

Siga rigorosamente estas orientações de preenchimento para CADA SEÇÃO do editor:

1. TIPO DE PAINEL (tipoPainel):
   - Se a solicitação for de GC (Gerador de Caracteres), Tarja de TV, Lower Third, informações para programa de TV, notícias, esportes ou podcast, defina OBRIGATORIAMENTE "tipoPainel": "GC_TV".
   - Caso contrário, defina "tipoPainel": "DESIGNER" (ou "PRODUCT" para produtos, "LOGO" para logos).

2. MAPEAMENTO DE IMAGENS (mapeamentoImagens):
   - "logo": Logotipos. Ative "useLogo": true.
   - "subject": Sujeitos principais/modelos/produtos. Ative o sujeito ("desativarSujeito": false, "noPeople": false).
   - "scene": Cenários/fundo. Ative "useEnvRef": true.
   - "design": Imagem de Referência do Layout/Design.
   - "typography": Print/referência de texto/tipografia. Ative "enableTypography": true.
   - "style": Referências estéticas/visuais de estilo.

2. SUJEITO PRINCIPAL:
   - REGRA CRÍTICA DE DESATIVAÇÃO: Se a arte for de comunicado, aviso de sindicato, banner informativo, layout institucional, vetor ou se NÃO houver foto de pessoa/modelo/sujeito anexada, você DEVE definir OBRIGATORIAMENTE "desativarSujeito": true e "noPeople": true.
   - Apenas defina "desativarSujeito": false se houver uma foto clara de pessoa/modelo enviada para o sujeito ou se o usuário pediu explicitamente um modelo humano.
   - "gender": "Masculino" | "Feminino" | "Outros"
   - "multiplesPersons": true se houver mais de uma pessoa.
   - "gendersDescription": descrição dos gêneros.
   - "poseDescription": descrição da pose ou roupa.
   - "positioning": "Esquerda" | "Centro" | "Direita"

3. DIMENSÕES:
   - "dimensao": "1:1" (Feed) | "3:4" (Retrato) | "9:16" (Story) | "16:9" (Desktop)

4. TIPOGRAFIA (CAMADAS DE TEXTO):
   - "enableTypography": true
   - "camadasTexto": Crie todas as camadas necessárias com:
     - "funcao": "Headline Principal" | "Subheadline Secundário" | "CTA Botão" | "Corpo Descrição" | "Legenda / Detalhe" | "Badge / Selo" | "Preço / Valor" | "Data / Horário"
     - "conteudo": O texto exato da frase.
     - "fonte": Fonte identificada (ex: "Montserrat")
     - "cor": HEX da cor
   - "promptTipografia": Instruções completas de onde posicionar e extrair cada camada de texto, logo, botão e elemento.
   - "typographyPosition": "ESQUERDA" | "CENTRO" | "DIREITA"

5. CENÁRIO:
   - "useEnvRef": true se houver foto de fundo.
   - "promptCenario": Descrição técnica em inglês do fundo/cenário.

6. DESIGN OBRIGATÓRIO:
   - "promptDesign": Instruções sobre o layout, grid e enquadramento do design de referência.

7. LOGOTIPO DA MARCA:
   - "useLogo": true se houver logo.

8. CORES & ILUMINAÇÃO:
   - "cores": { "ambiente": "#HEX", "recorte": "#HEX", "complementar": "#HEX" }
   - "coresAutomaticas": false
   - "corDominante": "#HEX"
   - "useCorDominante": true
   - "degradeLeitura": true

9. COMPOSIÇÃO:
   - "composicao": "Close-up (Rosto)" | "Plano Médio (Busto)" | "Plano Americano" | customizada
   - "composicaoCustom": texto livre de composição se necessário

10. ELEMENTOS FLUTUANTES:
    - "floatingElementsMode": "off" | "auto" | "custom"
    - "floatingElementsCustom": texto livre

11. ATRIBUTOS VISUAIS E ESTILO:
    - "sobriedade": número de 0 a 100 (ex: 80)
    - "enableEstiloVisual": true
    - "estilosVisuais": array com os estilos (ex: ["Corporativo", "Clean", "Institucional"])
    - "estiloVisualCustom": descrição técnica do estilo
    - "enableBlur": true/false
    - "lateralGradient": true/false

12. ENTRADAS MANUAIS & AVANÇADAS:
    - "additionalPrompt": prompt mestre detalhado em inglês.
    - "negativePrompt": prompt negativo para evitar ruídos.
    - "resolucao": "1K" | "2K" | "4K"
    - "formatoExportacao": "AVIF" | "PNG" | "JPEG" | "WEBP"
    - "variations": 1 a 5
    - "somentePrompt": false
    - "substituirImagens": true
    - "substituirConfig": true

IMPORTANTE: Responda em português resumindo os pontos que você identificou e configurou. No FINAL da sua mensagem, inclua obrigatoriamente o bloco de código JSON completo em \`\`\`json.

Exemplo de JSON de saída:
\`\`\`json
{
  "desativarSujeito": true,
  "noPeople": true,
  "dimensao": "3:4",
  "enableTypography": false,
  "camadasTexto": [],
  "typographyPosition": "CENTRO",
  "promptTipografia": "",
  "promptDesign": "Pure flat solid color canvas.",
  "promptCenario": "Solid dark blue background (#0b1c32), matte finish, clean solid color canvas, no people, no text, no shapes.",
  "useLogo": false,
  "useEnvRef": false,
  "cores": { "ambiente": "#0b1c32", "recorte": "#0b1c32", "complementar": "#0b1c32" },
  "coresAutomaticas": false,
  "corDominante": "#0b1c32",
  "useCorDominante": true,
  "degradeLeitura": false,
  "sobriedade": 100,
  "enableEstiloVisual": false,
  "estilosVisuais": ["Clean"],
  "estiloVisualCustom": "Clean e minimalista com fundo de cor sólida.",
  "additionalPrompt": "A completely blank pure solid color background canvas in exact color #0b1c32, zero models, zero text, zero graphics.",
  "negativePrompt": "people, human, person, model, text, typography, headline, flyer, poster, neon, glow, smartphone, 3d, gradient, shapes, objects",
  "resolucao": "1K",
  "formatoExportacao": "PNG",
  "variations": 1,
  "somentePrompt": false,
  "substituirImagens": true,
  "substituirConfig": true
}
\`\`\`
`;

    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: autoFillPrompt + clientContext,
          attachedFiles: filesToSend,
          history: activeMessages.map((m) => ({ 
            role: m.role, 
            content: m.content,
            files: m.files 
          })),
          customApiKey: localStorage.getItem("custom_gemini_api_key") || "",
          modelId: selectedModel
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro no servidor.");
      }

      const data = await res.json();
      
      setChats((prev) => ({
        ...prev,
        [activeAssistant.id]: [
          ...(prev[activeAssistant.id] || []),
          { role: "model", content: data.response || "Preenchimento concluído com sucesso!" }
        ]
      }));

      if (data.response) {
        setTimeout(() => applyModelMessageToEditor(-1, data.response, filesToSend), 100);
        showToast("✨ Projeto preenchido e configurado pela IA com sucesso!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erro ao conectar com a IA.", "error");
    } finally {
      setIsTyping(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAttachFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleAttachFiles(e.clipboardData.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAttachFiles(e.target.files);
    }
  };

  const handleSend = () => {
    handleSendMessage();
  };

  const applyModelMessageToEditor = (msgIndex: number, content: string, attachedFilesOverride?: any[]) => {
    let filledItems: string[] = [];
    let logCount = 0;
    let newLogos: string[] = [];
    let desCount = 0;
    let newDesigns: string[] = [];
    let updates: any = {};
    let jsonImageMap: Record<string, string> = {};
    let jsonStyleDescMap: Record<string, string> = {};
    let parsedConfigJson: any = null;
    let isReplaceMode = false;

    // Helper robusto para mapear chaves da IA em português e inglês
    const mapConfigKeys = (configJson: any) => {
      const result: any = {};

      const getBool = (keys: string[]) => {
        for (const key of keys) {
          if (configJson[key] === undefined || configJson[key] === null) continue;
          if (typeof configJson[key] === "boolean") return configJson[key];
          const valStr = String(configJson[key]).trim().toLowerCase();
          if (["true", "1", "on", "sim", "yes", "ativado", "ativo", "ativar", "habilitado", "habilita", "habilitar"].includes(valStr)) return true;
          if (["false", "0", "off", "não", "nao", "no", "desativado", "inativo", "desativar", "desabilitado", "desabilita", "desabilitar"].includes(valStr)) return false;
        }
        return undefined;
      };

      const getString = (keys: string[]) => {
        for (const key of keys) {
          if (configJson[key] !== undefined && configJson[key] !== null) {
            return String(configJson[key]).trim();
          }
        }
        return undefined;
      };

      // desativarSujeito
      const desativar = getBool(["desativarSujeito", "desativar_sujeito", "disableSubject", "disable_subject"]);
      const noPeep = getBool(["noPeople", "no_people", "semPessoas", "sem_pessoas"]);
      const ativar = getBool(["ativarSujeito", "ativar_sujeito", "enableSubject", "enable_subject", "useSubject", "use_subject"]);

      if (desativar !== undefined) {
        result.desativarSujeito = desativar;
        result.noPeople = desativar;
      } else if (noPeep !== undefined) {
        result.desativarSujeito = noPeep;
        result.noPeople = noPeep;
      } else if (ativar !== undefined) {
        result.desativarSujeito = !ativar;
        result.noPeople = !ativar;
      }

      // useEnvRef
      const envRef = getBool(["useEnvRef", "use_env_ref", "usarCenario", "usar_cenario", "usarFotosCenario", "usar_fotos_cenario", "useSceneRef", "use_scene_ref"]);
      if (envRef !== undefined) result.useEnvRef = envRef;

      // useLogo
      const logo = getBool(["useLogo", "use_logo", "usarLogo", "usar_logo"]);
      if (logo !== undefined) result.useLogo = logo;

      // coresAutomaticas
      const coresAuto = getBool(["coresAutomaticas", "cores_automaticas", "autoCores", "auto_cores"]);
      if (coresAuto !== undefined) result.coresAutomaticas = coresAuto;

      // useCorDominante
      const corDom = getBool(["useCorDominante", "use_cor_dominante", "usarCorDominante", "usar_cor_dominante"]);
      if (corDom !== undefined) result.useCorDominante = corDom;

      // enableTypography
      const typo = getBool(["enableTypography", "enable_typography", "adicionarTexto", "adicionar_texto", "usarTexto", "usar_texto", "enableText", "enable_text"]);
      if (typo !== undefined) result.enableTypography = typo;

      // degradeLeitura
      const degLeitura = getBool(["degradeLeitura", "degrade_leitura", "degradeText", "degrade_text"]);
      if (degLeitura !== undefined) result.degradeLeitura = degLeitura;

      // enableBlur
      const blur = getBool(["enableBlur", "enable_blur", "usarDesfoque", "usar_desfoque", "blur", "desfoque"]);
      if (blur !== undefined) result.enableBlur = blur;

      // lateralGradient
      const latGrad = getBool(["lateralGradient", "lateral_gradient", "usarDegrade", "usar_degrade", "degradeLateral", "degrade_lateral"]);
      if (latGrad !== undefined) result.lateralGradient = latGrad;

      // floatingElementsMode
      const floatMode = getString(["floatingElementsMode", "floating_elements_mode", "elementosFlutuantes", "elementos_flutuantes"]);
      if (floatMode !== undefined) {
        if (["off", "auto", "custom"].includes(floatMode)) {
          result.floatingElementsMode = floatMode;
        } else if (floatMode === "true" || floatMode === "ativar" || floatMode === "on" || floatMode === "auto") {
          result.floatingElementsMode = "auto";
        } else if (floatMode === "false" || floatMode === "desativar" || floatMode === "off") {
          result.floatingElementsMode = "off";
        } else {
          result.floatingElementsMode = "custom";
          result.floatingElementsCustom = floatMode;
        }
      }

      // floatingElementsCustom
      const floatCustom = getString(["floatingElementsCustom", "floating_elements_custom", "descElementosFlutuantes", "desc_elementos_flutuantes", "customFloatingElements", "custom_floating_elements"]);
      if (floatCustom !== undefined) {
        result.floatingElementsCustom = floatCustom;
        result.floatingElementsMode = "custom";
      }

      // gender
      const g = getString(["gender", "genero", "gênero", "sex"]);
      if (g !== undefined) {
        if (g.toLowerCase().includes("fem")) result.gender = "Feminino";
        else if (g.toLowerCase().includes("masc")) result.gender = "Masculino";
        else if (g.trim() !== "") result.gender = "Outros";
      }

      // multiplesPersons
      const mp = getBool(["multiplesPersons", "multiples_persons", "multiplesPeople", "multiples_people", "multiplasPessoas", "multiplas_pessoas", "maisDeUmaPessoa", "mais_de_uma_pessoa"]);
      if (mp !== undefined) result.multiplesPersons = mp;

      // gendersDescription
      const gd = getString(["gendersDescription", "genders_description", "descricaoGeneros", "descricao_generos", "generosIndividuais", "generos_individuais", "descGenders"]);
      if (gd !== undefined) result.gendersDescription = gd;

      // poseDescription
      const pose = getString(["poseDescription", "pose_description", "descricaoPose", "descricao_pose", "pose"]);
      if (pose !== undefined) result.poseDescription = pose;

      // positioning
      const pos = getString(["positioning", "posicionamento", "posição", "posicao"]);
      if (pos !== undefined) result.positioning = pos;

      // typographyPosition
      const typoPos = getString(["typographyPosition", "typography_position", "posicaoTexto", "posicao_texto", "posicaoTextoGlobal", "posicao_texto_global", "posicaoGlobalTexto", "posicao_global_texto"]);
      if (typoPos !== undefined) {
        const typoPosUpper = typoPos.toUpperCase();
        if (typoPosUpper.includes("ESQ") || typoPosUpper.includes("LEFT") || typoPosUpper.includes("TOP") || typoPosUpper.includes("UP")) {
          result.typographyPosition = "ESQUERDA";
        } else if (typoPosUpper.includes("DIR") || typoPosUpper.includes("RIGHT") || typoPosUpper.includes("BOT") || typoPosUpper.includes("DOWN")) {
          result.typographyPosition = "DIREITA";
        } else {
          result.typographyPosition = "CENTRO";
        }
      }

      // enableEstiloVisual
      const styleVis = getBool(["enableEstiloVisual", "enable_estilo_visual", "ativarEstiloVisual", "ativar_estilo_visual", "usarEstiloVisual", "usar_estilo_visual", "styleVisualEnabled"]);
      if (styleVis !== undefined) result.enableEstiloVisual = styleVis;

      // estiloVisualCustom
      const customStyle = getString(["estiloVisualCustom", "estilo_visual_custom", "customStyleDescription", "custom_style_description", "estiloCustomizado", "estilo_customizado", "descreverEstiloCustomizado", "custom_visual_style"]);
      if (customStyle !== undefined) result.estiloVisualCustom = customStyle;

      // promptDesign
      const prDes = getString(["promptDesign", "prompt_design", "descricaoDesign", "descricao_design", "descDesign", "promptLayout", "prompt_layout"]);
      if (prDes !== undefined) result.promptDesign = prDes;

      // promptTipografia
      const prTyp = getString(["promptTipografia", "prompt_tipografia", "descricaoTipografia", "descricao_tipografia", "descTipografia", "promptTexto", "prompt_texto"]);
      if (prTyp !== undefined) result.promptTipografia = prTyp;

      // estilosVisuais
      if (configJson.estilosVisuais && Array.isArray(configJson.estilosVisuais)) {
        result.estilosVisuais = configJson.estilosVisuais;
      } else if (configJson.estiloVisual && typeof configJson.estiloVisual === "string") {
        result.estilosVisuais = [configJson.estiloVisual];
      }

      // composicao
      const comp = getString(["composicao", "composição", "framing", "camera_shot", "enquadramento"]);
      if (comp !== undefined) {
        const compLower = comp.toLowerCase();
        if (compLower.includes("close") || compLower.includes("rosto") || compLower.includes("closeup")) {
          result.composicao = "Close-up (Rosto)";
        } else if (compLower.includes("médio") || compLower.includes("medio") || compLower.includes("busto")) {
          result.composicao = "Plano Médio (Busto)";
        } else if (compLower.includes("americano") || compLower.includes("plano americano")) {
          result.composicao = "Plano Americano";
        } else {
          result.composicaoCustom = comp;
        }
      }

      // composicaoCustom
      const compCustom = getString(["composicaoCustom", "composicao_custom", "composiçãoCustom", "composição_custom"]);
      if (compCustom !== undefined) {
        result.composicaoCustom = compCustom;
      }

      // dimensao
      const dim = getString(["dimensao", "dimensão", "dimension", "dimensions", "aspectRatio", "aspect_ratio", "formato", "tamanho", "size", "proporcao", "proporção"]);
      if (dim !== undefined) {
        const dLower = dim.toLowerCase();
        if (dLower.includes("1080x1080") || dLower.includes("feed") || dLower.includes("quadrado") || dLower.includes("square") || dLower === "1:1") result.dimensao = "1:1";
        else if (dLower.includes("1080x1440") || dLower.includes("retrato") || dLower.includes("portrait") || dLower === "3:4" || dLower === "4:5") result.dimensao = "3:4";
        else if (dLower.includes("1080x1920") || dLower.includes("story") || dLower.includes("stories") || dLower.includes("vertical") || dLower === "9:16") result.dimensao = "9:16";
        else if (dLower.includes("1920x1080") || dLower.includes("desktop") || dLower.includes("landscape") || dLower.includes("horizontal") || dLower === "16:9") result.dimensao = "16:9";
        else result.dimensao = dim;
      }

      // tipoPainel
      const tp = getString(["tipoPainel", "tipo_painel", "panelType", "panel_type"]);
      if (tp !== undefined) {
        const tpUpper = tp.toUpperCase();
        if (["DESIGNER", "PRODUCT", "LOGO", "GC_TV"].includes(tpUpper)) {
          result.tipoPainel = tpUpper;
        } else if (tpUpper.includes("GC") || tpUpper.includes("TV")) {
          result.tipoPainel = "GC_TV";
        }
      }

      // promptCenario
      const prCen = getString(["promptCenario", "prompt_cenario", "descricaoCenario", "descricao_cenario", "descCenario", "promptFundo", "prompt_fundo"]);
      if (prCen !== undefined) result.promptCenario = prCen;

      // additionalPrompt
      const addPr = getString(["additionalPrompt", "additional_prompt", "promptAdicional", "prompt_adicional", "masterPrompt", "master_prompt"]);
      if (addPr !== undefined) result.additionalPrompt = addPr;

      // negativePrompt
      const negPr = getString(["negativePrompt", "negative_prompt", "promptNegativo", "prompt_negativo"]);
      if (negPr !== undefined) result.negativePrompt = negPr;

      // resolucao
      const resVal = getString(["resolucao", "resolução", "resolution", "quality", "qualidade", "tamanho", "size"]);
      if (resVal !== undefined) {
        const u = resVal.toUpperCase();
        if (u.includes("4K") || u.includes("4096")) result.resolucao = "4K";
        else if (u.includes("2K") || u.includes("2048")) result.resolucao = "2K";
        else if (u.includes("1K") || u.includes("1024") || u.includes("SD")) result.resolucao = "1K";
        else result.resolucao = "1K";
      }

      // formatoExportacao
      const formExp = getString(["formatoExportacao", "formato_exportacao", "exportFormat", "export_format", "formato", "format", "bitDepth", "bit_depth", "profundidadeCor", "profundidade_cor"]);
      if (formExp !== undefined) {
        const u = formExp.toUpperCase();
        if (u.includes("PNG") || u.includes("32BIT") || u.includes("32 BIT") || u.includes("32-BIT") || u.includes("32 BITS") || u.includes("32BITS")) result.formatoExportacao = "PNG";
        else if (u.includes("WEBP")) result.formatoExportacao = "WEBP";
        else if (u.includes("AVIF")) result.formatoExportacao = "AVIF";
        else if (u.includes("JPG") || u.includes("JPEG")) result.formatoExportacao = "JPEG";
      }

      // sobriedade / nivelCriativo
      if (configJson.sobriedade !== undefined && typeof configJson.sobriedade === "number") {
        result.sobriedade = configJson.sobriedade;
      } else if (configJson.nivelCriativo !== undefined && typeof configJson.nivelCriativo === "number") {
        result.sobriedade = configJson.nivelCriativo;
      }

      // variations
      if (configJson.variations !== undefined && typeof configJson.variations === "number") {
        result.variations = configJson.variations;
      }

      // somentePrompt
      const somPr = getBool(["somentePrompt", "somente_prompt", "onlyPrompt", "only_prompt"]);
      if (somPr !== undefined) result.somentePrompt = somPr;

      // corDominante
      const corDomStr = getString(["corDominante", "cor_dominante", "dominantColor", "dominant_color"]);
      if (corDomStr !== undefined) result.corDominante = corDomStr;

      return result;
    };

    // Tenta extrair JSON do texto gerado pela IA (incluindo bloco ou simples chaves)
    let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/) || content.match(/```\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        const potentialJson = content.slice(startIdx, endIdx + 1);
        if (potentialJson.includes('"cores"') || 
            potentialJson.includes('"desativarSujeito"') || 
            potentialJson.includes('"noPeople"') || 
            potentialJson.includes('"enableTypography"') || 
            potentialJson.includes('"additionalPrompt"') || 
            potentialJson.includes('"promptCenario"') ||
            potentialJson.includes('"coresAutomaticas"') ||
            potentialJson.includes('"estilosVisuais"')) {
          jsonMatch = [null, potentialJson] as any;
        }
      }
    }
    if (jsonMatch) {
      try {
        const configJson = JSON.parse(jsonMatch[1]);
        parsedConfigJson = configJson;
                
        if (configJson.substituirImagens === true || configJson.substituirConfig === true) {
          isReplaceMode = true;
          updates.camadasTexto = [];
          updates.additionalPrompt = "";
          updates.promptCenario = "";
          updates.promptDesign = "";
          updates.promptTipografia = "";
          updates.estiloVisualCustom = "";
          updates.poseDescription = "";
          updates.floatingElementsCustom = "";
          updates.negativePrompt = "";
        }

        if (configJson.mapeamentoImagens) {
          jsonImageMap = configJson.mapeamentoImagens;
        } else if (configJson.imagemAnexadaTipo) {
          jsonImageMap = { "*": configJson.imagemAnexadaTipo };
        }

        if (configJson.descricoesEstilo) {
          jsonStyleDescMap = configJson.descricoesEstilo;
        }

        // Aplicar o mapeamento robusto de chaves
        const mappedUpdates = mapConfigKeys(configJson);
        updates = { ...updates, ...mappedUpdates };

        if (configJson.cores && Object.keys(configJson.cores).length > 0) {
          updates.cores = { ...store.cores, ...configJson.cores };
          updates.coresAutomaticas = false;
          filledItems.push("Cores Específicas");
        }
        
        if (configJson.corDominante) {
          updates.corDominante = configJson.corDominante;
          if (typeof configJson.useCorDominante !== "boolean") {
            updates.useCorDominante = true;
          }
          filledItems.push("Cor Dominante");
        }

        if (updates.dimensao) {
          const dLower = String(updates.dimensao).toLowerCase();
          if (dLower.includes("1080x1080") || dLower.includes("feed") || dLower.includes("quadrado") || dLower === "1:1") updates.dimensao = "1:1";
          else if (dLower.includes("1080x1440") || dLower.includes("retrato") || dLower.includes("portrait") || dLower === "3:4" || dLower === "4:5") updates.dimensao = "3:4";
          else if (dLower.includes("1080x1920") || dLower.includes("story") || dLower.includes("stories") || dLower === "9:16") updates.dimensao = "9:16";
          else if (dLower.includes("1920x1080") || dLower.includes("desktop") || dLower.includes("landscape") || dLower === "16:9") updates.dimensao = "16:9";
          
          filledItems.push(`Proporção (${updates.dimensao})`);
        }

        const rawRes = configJson.resolucao || configJson.resolution || configJson.qualidade || configJson.quality;
        if (rawRes) {
          const resStr = String(rawRes).toUpperCase();
          if (resStr.includes("4K") || resStr.includes("4")) {
            updates.resolucao = "4K";
            filledItems.push("Qualidade (4K / Gemini 3 Pro Image)");
          } else if (resStr.includes("2K") || resStr.includes("2")) {
            updates.resolucao = "2K";
            filledItems.push("Qualidade (2K / Gemini 3 Pro Image)");
          } else if (resStr.includes("1K") || resStr.includes("1")) {
            updates.resolucao = "1K";
            filledItems.push("Qualidade (1K / Gemini 3 Pro Image)");
          }
        }

        const rawFmt = configJson.formatoExportacao || configJson.formato_exportacao || configJson.exportFormat || configJson.formato || configJson.format || configJson.bitDepth;
        if (rawFmt || updates.formatoExportacao) {
          const fmtStr = String(rawFmt || updates.formatoExportacao).toUpperCase();
          if (fmtStr.includes("PNG") || fmtStr.includes("32BIT") || fmtStr.includes("32 BIT") || fmtStr.includes("32BITS") || fmtStr.includes("32 BITS")) {
            updates.formatoExportacao = "PNG";
            filledItems.push("Formato (PNG 32-Bit)");
          } else if (fmtStr.includes("WEBP")) {
            updates.formatoExportacao = "WEBP";
            filledItems.push("Formato (WEBP)");
          } else if (fmtStr.includes("AVIF")) {
            updates.formatoExportacao = "AVIF";
            filledItems.push("Formato (AVIF)");
          } else if (fmtStr.includes("JPG") || fmtStr.includes("JPEG")) {
            updates.formatoExportacao = "JPEG";
            filledItems.push("Formato (JPEG)");
          }
        }
        
        if (typeof configJson.sobriedade === "number") {
          updates.nivelCriativo = configJson.sobriedade;
          filledItems.push(`Sobriedade (${configJson.sobriedade}%)`);
        } else if (typeof configJson.nivelCriativo === "number") {
          updates.nivelCriativo = configJson.nivelCriativo;
          filledItems.push(`Nível Criativo (${configJson.nivelCriativo}%)`);
        }

        // Suporte a remoção direcionada de camadas de texto por ID, função ou conteúdo
        let toRemove = configJson.removerCamadasTexto || configJson.removerTexto || configJson.removerCamadas || configJson.removerTextos || configJson.removerTextoIds || configJson.excluirTexto;
        if (typeof toRemove === "string") toRemove = [toRemove];
        if (Array.isArray(toRemove) && toRemove.length > 0) {
          const searchTerms = toRemove.map((s: any) => String(s).toLowerCase().trim()).filter(Boolean);
          const currentLayers = updates.camadasTexto || store.camadasTexto || [];
          updates.camadasTexto = currentLayers.filter(layer => {
            const lId = String(layer.id || "").toLowerCase();
            const lFunc = String(layer.funcao || "").toLowerCase();
            const lCont = String(layer.conteudo || "").toLowerCase();
            return !searchTerms.some(term => 
              lId.includes(term) || lFunc.includes(term) || lCont.includes(term) || term.includes(lFunc) || term.includes(lCont)
            );
          });
          filledItems.push(`${toRemove.length} Texto(s) Removido(s)`);
        }

        if (configJson.camadasTexto && Array.isArray(configJson.camadasTexto)) {
          if (configJson.camadasTexto.length > 0) {
            updates.enableTypography = true;
            const mappedNewLayers = configJson.camadasTexto.map((item, idx) => ({
                id: item.id || `text_${Date.now()}_${idx}`,
                conteudo: item.conteudo || "",
                funcao: item.funcao || "Corpo Descrição",
                fonte: item.fonte || "Outfit",
                cor: item.cor || "#ffffff"
            }));

            if (configJson.substituirCamadasTexto === true || configJson.substituirTextos === true || isReplaceMode) {
               updates.camadasTexto = mappedNewLayers;
               filledItems.push(`${updates.camadasTexto.length} Textos (Substituídos)`);
            } else {
               const updatedLayers = [...(updates.camadasTexto || store.camadasTexto || [])];
               configJson.camadasTexto.forEach((item, itemIdx) => {
                   let existingIdx = item.id ? updatedLayers.findIndex(l => l.id === item.id) : -1;
                   if (existingIdx === -1 && item.funcao) {
                     const matchingByFuncao = updatedLayers.filter(l => l.funcao === item.funcao);
                     if (matchingByFuncao.length === 1) {
                       existingIdx = updatedLayers.findIndex(l => l.funcao === item.funcao);
                     }
                   }
                   if (existingIdx === -1 && configJson.camadasTexto.length === updatedLayers.length) {
                     existingIdx = itemIdx;
                   }

                   if (existingIdx !== -1) {
                       updatedLayers[existingIdx] = {
                           ...updatedLayers[existingIdx],
                           conteudo: item.conteudo !== undefined ? item.conteudo : updatedLayers[existingIdx].conteudo,
                           funcao: item.funcao || updatedLayers[existingIdx].funcao,
                           fonte: item.fonte || updatedLayers[existingIdx].fonte,
                           cor: item.cor || updatedLayers[existingIdx].cor,
                       };
                   } else {
                       updatedLayers.push({
                           id: item.id || `text_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                           conteudo: item.conteudo || "",
                           funcao: item.funcao || "Corpo Descrição",
                           fonte: item.fonte || "Outfit",
                           cor: item.cor || "#ffffff"
                       });
                   }
               });
               updates.camadasTexto = updatedLayers;
               filledItems.push(`${configJson.camadasTexto.length} Textos (Atualizados/Adicionados)`);
            }
          } else if (isReplaceMode || configJson.substituirCamadasTexto === true || configJson.enableTypography === false) {
            updates.camadasTexto = [];
            if (configJson.enableTypography === false) updates.enableTypography = false;
          }
        }

        // Suporte a limpeza explícita de referências e mídias
        if (configJson.limparSujeitoRef || configJson.removerSujeitoRef || configJson.removerPessoaRef) {
          store.setSujeitoBase64List([]);
          store.setSujeitoBase64("");
          updates.desativarSujeito = true;
          updates.noPeople = true;
          filledItems.push("Sujeito Removido");
        }

        if (configJson.limparCenarioRef || configJson.removerCenarioRef) {
          store.setCenarioBase64List([]);
          store.setCenarioBase64("");
          updates.useEnvRef = false;
          updates.promptCenario = "";
          filledItems.push("Cenário Removido");
        }

        if (configJson.limparLogoRef || configJson.removerLogoRef) {
          store.setLogosList([]);
          updates.logoBase64 = "";
          updates.useLogo = false;
          filledItems.push("Logo Removido");
        }
        
        if (configJson.promptCenario !== undefined && typeof configJson.promptCenario === "string") {
          updates.promptCenario = configJson.promptCenario;
          if (configJson.promptCenario) filledItems.push("Cenário");
        }

        if (configJson.promptDesign !== undefined && typeof configJson.promptDesign === "string") {
          updates.promptDesign = configJson.promptDesign;
          if (configJson.promptDesign) filledItems.push("Ref. Design");
        } else if (updates.promptDesign) {
          filledItems.push("Ref. Design");
        }

        if (configJson.promptTipografia !== undefined && typeof configJson.promptTipografia === "string") {
          updates.promptTipografia = configJson.promptTipografia;
          if (configJson.promptTipografia) filledItems.push("Ref. Texto/Tipografia");
        } else if (updates.promptTipografia) {
          filledItems.push("Ref. Texto/Tipografia");
        }
        
        if (configJson.additionalPrompt !== undefined && typeof configJson.additionalPrompt === "string") {
          updates.additionalPrompt = configJson.additionalPrompt;
          if (configJson.additionalPrompt) filledItems.push("Prompt Principal");
        }
        
        if (configJson.negativePrompt !== undefined && typeof configJson.negativePrompt === "string") {
          updates.negativePrompt = configJson.negativePrompt;
          if (configJson.negativePrompt) filledItems.push("Prompt Negativo");
        }
        
        if (configJson.estilosVisuais && Array.isArray(configJson.estilosVisuais)) {
          updates.estilosVisuais = configJson.estilosVisuais;
          filledItems.push("Estilos Visuais");
        }

        if (configJson.multiplesPersons !== undefined) {
          updates.multiplesPersons = configJson.multiplesPersons;
          filledItems.push(configJson.multiplesPersons ? "Múltiplas Pessoas (Sim)" : "Múltiplas Pessoas (Não)");
        }

        if (configJson.gendersDescription !== undefined) {
          updates.gendersDescription = configJson.gendersDescription;
          filledItems.push("Gêneros Individuais");
        }

        // Registrar efeitos ativados/desativados para feedback visual do usuário
        if (updates.enableBlur !== undefined) filledItems.push(updates.enableBlur ? "Desfoque (Ativo)" : "Desfoque (Inativo)");
        if (updates.lateralGradient !== undefined) filledItems.push(updates.lateralGradient ? "Degradê Lateral (Ativo)" : "Degradê Lateral (Inativo)");
        if (updates.degradeLeitura !== undefined) filledItems.push(updates.degradeLeitura ? "Degradê Leitura (Ativo)" : "Degradê Leitura (Inativo)");
        if (updates.enableEstiloVisual !== undefined) {
          filledItems.push(updates.enableEstiloVisual ? "Estilo Visual (Ativo)" : "Estilo Visual (Inativo)");
        }
        if (updates.estiloVisualCustom !== undefined && updates.estiloVisualCustom !== "") {
          filledItems.push("Estilo Personalizado");
        }
        if (updates.typographyPosition !== undefined) {
          filledItems.push(`Posição Texto (${updates.typographyPosition})`);
        }
        if (updates.floatingElementsMode !== undefined) {
          filledItems.push(`Elementos Flutuantes (${updates.floatingElementsMode})`);
        }
        if (updates.composicao !== undefined) {
          filledItems.push(`Composição (${updates.composicao})`);
        }

        const vars = configJson.variations || configJson.variacoes || configJson.variações;
        if (typeof vars === "number") {
          updates.variations = Math.min(Math.max(vars, 1), 4);
          filledItems.push(`Variações (${updates.variations})`);
        }

        store.updateConfig(updates);
      } catch (e) {
        console.error("Falha ao fazer parse do JSON: ", e);
      }
    }

    // Se o JSON falhou ou não extraiu tudo, aplicar fallback de regex para o texto
    if (filledItems.length === 0) {
      // 1. Extrair e preencher cores em HEX
      const hexMatches = content.match(/#[0-9A-Fa-f]{6}\b/g);
      if (hexMatches && hexMatches.length > 0) {
        const uniqueColors = Array.from(new Set(hexMatches));
        
        const newColors = { ...store.cores, ...(updates.cores || {}) };
        if (uniqueColors[0]) newColors.ambiente = uniqueColors[0];
        if (uniqueColors[1]) newColors.recorte = uniqueColors[1];
        if (uniqueColors[2]) newColors.complementar = uniqueColors[2];
        
        store.updateConfig({ cores: newColors, coresAutomaticas: false });
        filledItems.push(`${uniqueColors.length} Cores`);
        
        if (uniqueColors.length === 1) {
          store.updateConfig({ corDominante: uniqueColors[0], useCorDominante: true });
        }
      }

      // 2. Extrair e preencher camadas de texto
      const lines = content.split("\n");
      const foundTexts: { conteudo: string; funcao: any }[] = [];
      
      lines.forEach(line => {
        const h1Match = line.match(/(?:Headline|Título|H1|Title):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Headline|Título|H1|Title):\s*([^\n]+)/i);
        if (h1Match) foundTexts.push({ conteudo: h1Match[1].trim(), funcao: "Headline Principal" });
        
        const h2Match = line.match(/(?:Subheadline|Subtítulo|H2|Subtitle):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Subheadline|Subtítulo|H2|Subtitle):\s*([^\n]+)/i);
        if (h2Match) foundTexts.push({ conteudo: h2Match[1].trim(), funcao: "Subheadline Secundário" });
        
        const ctaMatch = line.match(/(?:CTA|Botão|Button|Chamada):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:CTA|Botão|Button|Chamada):\s*([^\n]+)/i);
        if (ctaMatch) foundTexts.push({ conteudo: ctaMatch[1].trim(), funcao: "CTA Botão" });
        
        const captionMatch = line.match(/(?:Legenda|Caption|Texto|Corpo):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Legenda|Caption|Texto|Corpo):\s*([^\n]+)/i);
        if (captionMatch && !line.includes("Instagram")) {
          foundTexts.push({ conteudo: captionMatch[1].trim(), funcao: "Corpo Descrição" });
        }
      });
      
      if (foundTexts.length > 0) {
        if (updates && updates.enableTypography !== undefined) { store.updateConfig({ enableTypography: updates.enableTypography }); } else { store.updateConfig({ enableTypography: true }); }
        const currentLayers = [...(store.camadasTexto || [])];
        
        foundTexts.forEach(item => {
          const existingIdx = currentLayers.findIndex(l => l.funcao === item.funcao);
          if (existingIdx !== -1) {
            currentLayers[existingIdx] = { ...currentLayers[existingIdx], conteudo: item.conteudo };
          } else {
            currentLayers.push({
              id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              conteudo: item.conteudo,
              funcao: item.funcao,
              fonte: "Outfit",
              cor: "#ffffff"
            });
          }
        });
        
        store.updateConfig({ camadasTexto: currentLayers });
        filledItems.push(`${foundTexts.length} Textos`);
      }

      // 3. Extrair prompt (inglês ou blocos de código)
      let promptText = "";
      const promptMatch = content.match(/(?:PROMPT EXTRATOR|PROMPT|SUGESTÃO DE PROMPT|PROMPT SUGERIDO):\s*([\s\S]+)$/i) || content.match(/(?:PROMPT EXTRATOR|PROMPT):\s*(.+)/i);
      if (promptMatch) {
        promptText = promptMatch[1].trim();
        promptText = promptText.split(/\b(CORES|TEXTO|CAMADAS|FONTES):\b/i)[0].trim();
      } else {
        const codeBlockMatch = content.match(/```(?:prompt|text|english|)\n([\s\S]+?)```/i);
        if (codeBlockMatch) {
          promptText = codeBlockMatch[1].trim();
        }
      }

      if (!promptText && activeAssistant.id === "prompt-extrator") {
        promptText = content.replace(/PROMPT EXTRATOR:\s*/i, "").trim();
      }

      if (promptText) {
        if (promptText.startsWith('"') && promptText.endsWith('"')) {
          promptText = promptText.slice(1, -1);
        }
        store.updateConfig({ additionalPrompt: promptText });
        filledItems.push("Prompt");
      }

      // 2.5 Extrair Prompt Negativo
      const negativeMatch = content.match(/(?:Prompt Negativo|Negative Prompt):\s*["'“]?([^"'\n]+)["'”]?/i) || content.match(/(?:Prompt Negativo|Negative Prompt):\s*([\s\S]+?)(?=\n|$)/i);
      if (negativeMatch && negativeMatch[1].trim() !== "") {
        store.updateConfig({ negativePrompt: negativeMatch[1].trim() });
        filledItems.push("Prompt Negativo");
      }
    }

    // 4. Extrair e preencher imagens de referência do histórico (apenas do input imediatamente anterior do usuário)
    let precedingUserMsg = null;
    if (attachedFilesOverride && attachedFilesOverride.length > 0) {
       precedingUserMsg = { files: attachedFilesOverride, content: "" };
    } else if (msgIndex > 0) {
      const prevMsg = activeMessages[msgIndex - 1];
      if (prevMsg && prevMsg.role === 'user' && prevMsg.files && prevMsg.files.length > 0) {
        precedingUserMsg = prevMsg;
      }
    }

    if (precedingUserMsg && precedingUserMsg.files) {
      const imagesOnly = precedingUserMsg.files.filter(f => f.type.startsWith("image/"));
      if (imagesOnly.length > 0) {
        const textLower = content.toLowerCase() + " " + (precedingUserMsg.content || "").toLowerCase();
        
        let subCount = 0;
        let sceCount = 0;
        let styCount = 0;
        let typoCount = 0;
        
        let newSubjects: string[] = [];
        let newScenes: string[] = [];
        let newTypographies: string[] = [];
        
        const jsonMapKeys = Object.keys(jsonImageMap);
        const jsonStyleDescKeys = Object.keys(jsonStyleDescMap);
        const singleMappingVal = jsonMapKeys.length === 1 ? jsonImageMap[jsonMapKeys[0]] : null;
        const singleStyleDescVal = jsonStyleDescKeys.length === 1 ? jsonStyleDescMap[jsonStyleDescKeys[0]] : null;

        imagesOnly.forEach(img => {
          let targetType = activeAssistant.id === "diretor-criativo" ? "design" : "style";
          let styleDescription = "Referência de estilo gerada pelo assistente.";
          
          let matchedKey = null;
          
            if (img.name && jsonImageMap[img.name]) {
              matchedKey = img.name;
            } else if (img.name) {
              // fuzzy match
              const nameLower = img.name.toLowerCase();
              matchedKey = jsonMapKeys.find(k => k.toLowerCase() === nameLower || nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower.split('.')[0]));
            }

            if (matchedKey && jsonImageMap[matchedKey]) {
              targetType = jsonImageMap[matchedKey];
            } else if (imagesOnly.length === 1 && singleMappingVal) {
              targetType = singleMappingVal;
            } else if (jsonImageMap["*"]) {
              targetType = jsonImageMap["*"];
            } else if (textLower.includes("logo") || textLower.includes("marca") || textLower.includes("logomarca") || textLower.includes("logotipo")) {
              targetType = "logo";
            } else if (textLower.includes("sujeito") || textLower.includes("produto") || textLower.includes("subject") || textLower.includes("product") || textLower.includes("pessoa") || textLower.includes("modelo")) {
              targetType = "subject";
            } else if (textLower.includes("cenário") || textLower.includes("background") || textLower.includes("cenario") || textLower.includes("ambiente") || textLower.includes("scene") || textLower.includes("fundo")) {
              targetType = "scene";
            } else if (textLower.includes("texto") || textLower.includes("tipografia") || textLower.includes("typography") || textLower.includes("print") || textLower.includes("font") || textLower.includes("letter")) {
              targetType = "typography";
            } else if (textLower.includes("layout") || textLower.includes("design") || textLower.includes("referência principal") || textLower.includes("flyer") || textLower.includes("card")) {
              targetType = "design";
            }
          
          
          if (targetType === "style") {
             let descMatchedKey = null;
             if (img.name && jsonStyleDescMap[img.name]) {
               descMatchedKey = img.name;
             } else if (img.name) {
               const nameLower = img.name.toLowerCase();
               descMatchedKey = jsonStyleDescKeys.find(k => k.toLowerCase() === nameLower || nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower.split('.')[0]));
             }
             
             if (descMatchedKey && jsonStyleDescMap[descMatchedKey]) {
               styleDescription = jsonStyleDescMap[descMatchedKey];
             } else if (imagesOnly.length === 1 && singleStyleDescVal) {
               styleDescription = singleStyleDescVal;
             } else if (jsonStyleDescMap["*"]) {
               styleDescription = jsonStyleDescMap["*"];
             }
          }

          const rawBase64 = `data:${img.type};base64,${img.data}`;

          if (targetType === "subject") {
            newSubjects.push(rawBase64);
            subCount++;
          } else if (targetType === "scene") {
            newScenes.push(rawBase64);
            sceCount++;
          } else if (targetType === "logo") {
            newLogos.push(rawBase64);
            logCount++;
          } else if (targetType === "design") {
            newDesigns.push(rawBase64);
            desCount++;
          } else if (targetType === "typography") {
            newTypographies.push(rawBase64);
            typoCount++;
          } else {
            // style reference
            if (isReplaceMode && styCount === 0 && store.referenciasEstilo) {
              // Limpa as atuais se for a primeira do replace
              store.referenciasEstilo.forEach(r => store.removeReferenciaEstilo(r.id));
            }
            const existingRef = store.referenciasEstilo?.find(r => r.url === rawBase64);
            if (existingRef) {
              if (styleDescription && styleDescription !== "Referência de estilo gerada pelo assistente.") {
                store.updateReferenciaEstilo(existingRef.id, styleDescription);
              }
            } else {
                store.addReferenciaEstilo(rawBase64, styleDescription);
                styCount++;
            }
          }
        });
        
        if (subCount > 0) {
          const currentList = isReplaceMode ? [] : (store.sujeitosBase64List || []);
          const uniqueList = Array.from(new Set([...currentList, ...newSubjects]));
          store.setSujeitoBase64List(uniqueList);
          if (updates && updates.desativarSujeito !== undefined) {
             store.updateConfig({ desativarSujeito: updates.desativarSujeito, noPeople: updates.noPeople !== undefined ? updates.noPeople : updates.desativarSujeito });
          } else {
             store.updateConfig({ noPeople: false, desativarSujeito: false });
          }
          filledItems.push(`${subCount} Sujeito(s)`);
        } else {
          if (isReplaceMode) store.setSujeitoBase64List([]);
          if (updates && updates.desativarSujeito !== undefined) {
             store.updateConfig({ desativarSujeito: updates.desativarSujeito, noPeople: updates.noPeople !== undefined ? updates.noPeople : updates.desativarSujeito });
          } else if ((store.sujeitosBase64List || []).length === 0) {
             store.updateConfig({ desativarSujeito: true, noPeople: true });
          }
        }
        if (sceCount > 0) {
          const currentList = isReplaceMode ? [] : (store.cenariosBase64List || []);
          const uniqueList = Array.from(new Set([...currentList, ...newScenes]));
          store.setCenarioBase64List(uniqueList);
          if (updates && updates.useEnvRef === false) {
             // respect AI
          } else {
             if (updates && updates.useEnvRef !== undefined) { store.updateConfig({ useEnvRef: updates.useEnvRef }); } else { store.updateConfig({ useEnvRef: true }); }
          }
          filledItems.push(`${sceCount} Cenário(s)`);
        } else {
          if (isReplaceMode) store.setCenarioBase64List([]);
          if (updates && updates.useEnvRef !== undefined) {
             store.updateConfig({ useEnvRef: updates.useEnvRef });
          } else if ((store.cenariosBase64List || []).length === 0) {
             store.updateConfig({ useEnvRef: false });
          }
        }
        
        if (logCount > 0) {
          const currentList = isReplaceMode ? [] : (store.logosList || []);
          let uniqueList = Array.from(new Set([...currentList, ...newLogos]));
          if (uniqueList.length > 1) uniqueList = [uniqueList[uniqueList.length - 1]]; // Keep only one logo
          store.setLogosList(uniqueList);
          if (updates && updates.useLogo !== undefined) {
            store.updateConfig({ useLogo: updates.useLogo });
          } else {
            store.updateConfig({ useLogo: true });
          }
          filledItems.push(`${logCount} Logo(s)`);
        } else if (isReplaceMode) {
          store.setLogosList([]);
        }

        if (typoCount > 0) {
          const currentList = isReplaceMode ? [] : (store.tipografiaRefsList || []);
          const uniqueList = Array.from(new Set([...currentList, ...newTypographies]));
          store.setTipografiaRefsList(uniqueList);
          filledItems.push(`${typoCount} Ref. Texto`);
        } else if (isReplaceMode) {
          store.setTipografiaRefsList([]);
        }
        
        if (desCount > 0) {
          const currentList = isReplaceMode ? [] : (store.designRefsList || []);
          const uniqueList = Array.from(new Set([...currentList, ...newDesigns]));
          store.setDesignRefsList(uniqueList);
          filledItems.push(`${desCount} Design(s)`);
        } else if (isReplaceMode) {
          store.setDesignRefsList([]);
        }

        if (desCount > 0) {
  
          // A referência de design agora atua APENAS como design/layout. Não duplicamos a imagem para logo, sujeito, etc.
          const defaultDesignPrompt = parsedConfigJson?.promptDesign || updates.promptDesign || "Copiar a proporção dos espaços vazios, o grid estrutural, e o posicionamento de composição de elementos deste card de referência.";
          store.updateConfig({ promptDesign: defaultDesignPrompt });
        }
  
        if (parsedConfigJson && parsedConfigJson.aprendizado_cliente && activeClientId) {
           appendAiLearnings(activeClientId, parsedConfigJson.aprendizado_cliente);
        }
  
        if (styCount > 0) {
          filledItems.push(`${styCount} Estilo(s)`);
        }
      }
    }

    // 5. Sempre aplicar dados do cliente se existir (Logo e Cores)
    if (activeClientId) {
      const client = clients.find(c => c.id === activeClientId);
      if (client) {
        // Aplica a Logo do cliente se existir
        if (client.logoBase64 && client.logoBase64.length > 50 && client.logoBase64 !== "undefined") {
          if (logCount === 0 && (!store.logosList || store.logosList.length === 0 || isReplaceMode)) {
             store.setLogosList([client.logoBase64]);
             if (updates && updates.useLogo !== undefined) {
               store.updateConfig({ useLogo: updates.useLogo });
             } else {
               store.updateConfig({ useLogo: true });
             }
             if (!filledItems.includes("Logo do Cliente")) filledItems.push("Logo do Cliente");
          }
        }
        
        // Aplica a Paleta de Cores do cliente
        if (client.paletaCores && client.paletaCores.length > 0) {
          const newColors = { ...store.cores };
          newColors.ambiente = client.paletaCores[0] || "#000000";
          newColors.recorte = client.paletaCores[1] || "#ffffff";
          newColors.complementar = client.paletaCores[2] || "#c5a880";
          delete newColors.paleta;
          
          store.updateConfig({ cores: newColors, coresAutomaticas: false });
          if (!filledItems.includes("Paleta do Cliente")) filledItems.push("Paleta do Cliente");
          
          if (client.paletaCores.length === 1) {
            store.updateConfig({ corDominante: client.paletaCores[0], useCorDominante: true });
          }
        }
        
        // Verifica se há novos aprendizados para adicionar (caso venha fora de imagem)
        if (parsedConfigJson && parsedConfigJson.aprendizado_cliente && !(precedingUserMsg && precedingUserMsg.files && precedingUserMsg.files.length > 0)) {
           appendAiLearnings(activeClientId, parsedConfigJson.aprendizado_cliente);
        }
      }
    }

    // Fallback
    if (filledItems.length === 0) {
      const fallbackText = content.length > 300 ? content.slice(0, 300) + "..." : content;
      store.updateConfig({ additionalPrompt: fallbackText });
      filledItems.push("Prompt (Mapeado)");
    }

    showToast(`Preenchido no editor: ${filledItems.join(", ")}!`, "success");
  };

  const switchAgent = (agent: AssistantConfig) => {
    setActiveAssistant(agent);
    setIsDropdownOpen(false);
    setAttachedFiles([]);
    setInputText("");
  };

  const clearChat = () => {
    setChats((prev) => ({ ...prev, [activeAssistant.id]: [] }));
    setAttachedFiles([]);
    showToast(`Conversa com ${activeAssistant.label} reiniciada.`, "success");
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div ref={chatPanelRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <button
        onClick={() => {
          setChatDrawerOpen(!chatDrawerOpen);
          setIsDropdownOpen(false);
        }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_4px_24px_rgba(197,168,128,0.25)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-[#0a0a0a]/90 border border-[#c5a880]/30 hover:border-[#c5a880]/60 text-[#c5a880]"
        title="Assistente ZION AI"
      >
        {chatDrawerOpen ? <X size={20} className="text-[#c5a880]" /> : <MessageSquare size={20} className="text-[#c5a880]" />}
        {!chatDrawerOpen && <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#c5a880]" />}
      </button>

      {chatDrawerOpen && (
        <div className={`border border-zinc-800 bg-[#070708] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transition-all ${isExpanded ? 'fixed inset-0 z-[100] rounded-none w-full h-full' : 'fixed sm:absolute bottom-20 right-4 left-4 sm:left-auto sm:right-0 sm:bottom-[68px] rounded-2xl w-[calc(100vw-32px)] sm:w-[440px] h-[560px] max-h-[82vh]'}`}>
          
          {/* Header */}
          <div className="shrink-0 p-3 sm:p-4 border-b border-zinc-900 bg-black/90 backdrop-blur-md relative z-20">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 flex-1 min-w-0 group cursor-pointer rounded-xl p-1 -ml-1 hover:bg-zinc-900/80 transition-colors"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-black bg-[#ad8330]">
                  {activeAssistant.icon}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wide truncate">{activeAssistant.label}</span>
                    <ChevronDown size={12} className="text-[#ad8330] group-hover:text-zinc-200 transition-all duration-200 shrink-0" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase block text-[#ad8330] truncate">{activeAssistant.sublabel}</span>
                </div>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowModelSettings(!showModelSettings)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${showModelSettings ? "text-[#ad8330] bg-zinc-900" : "text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900"}`}
                  title="Modelo de IA"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900 hidden sm:flex"
                  title={isExpanded ? "Restaurar tamanho" : "Expandir painel"}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>

                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${isHistoryOpen ? "text-[#ad8330] bg-zinc-900" : "text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900"}`}
                  title="Histórico de Conversas"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  onClick={() => {
                    store.createProject();
                    setChats({});
                    setAttachedFiles([]);
                    setActiveClient(null);
                    showToast("Nova conversa iniciada. Configurações zeradas.", "success");
                  }}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Nova Conversa"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={clearChat}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Limpar mensagens"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setChatDrawerOpen(false)}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Model Settings Dropdown */}
            {showModelSettings && (
              <div className="absolute top-14 left-3 right-3 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 block">Selecione o Modelo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModel("gemini-3.6-flash")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3.6-flash" ? "bg-[#ad8330]/20 text-[#d4af37] border border-[#ad8330]/50 font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/5"}`}
                  >
                    <Zap size={16} className="mb-1" />
                    Gemini Flash
                  </button>
                  <button
                    onClick={() => setSelectedModel("gemini-3-pro-image")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3-pro-image" ? "bg-[#ad8330]/20 text-[#d4af37] border border-[#ad8330]/50 font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/5"}`}
                  >
                    <Sparkles size={16} className="mb-1" />
                    Gemini Pro
                  </button>
                </div>
              </div>
            )}
            
            {/* History Dropdown */}
            {isHistoryOpen && (
              <div className="absolute top-14 right-3 left-3 z-50 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl p-3 max-h-60 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Suas Conversas Salvas</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {store.projectsList.map(p => {
                    const isProjGenerating = !!store.generatingProjectIds?.[p.id];
                    return (
                      <div 
                        key={p.id} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${p.id === store.activeProjectId ? "bg-[#ad8330]/10 border border-[#ad8330]/30" : "hover:bg-zinc-900 border border-transparent"}`}
                        onClick={() => {
                          store.loadProjectById(p.id);
                          setIsHistoryOpen(false);
                          showToast(`Conversa carregada.`, "success");
                        }}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {isProjGenerating && <Loader2 size={12} className="animate-spin text-[#ad8330] shrink-0" />}
                          <span className={`text-[11px] font-bold truncate ${p.id === store.activeProjectId ? "text-[#ad8330]" : "text-zinc-300"}`}>{p.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.deleteProject(p.id);
                            showToast("Conversa deletada.", "success");
                            if (store.projectsList.length <= 1) {
                              setIsHistoryOpen(false);
                            }
                          }}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-1 shrink-0"
                          title="Deletar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick agent bar */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 custom-scrollbar">
              {assistants.map((a) => {
                const isActive = activeAssistant.id === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => switchAgent(a)}
                    title={a.label}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-white transition-all duration-200 cursor-pointer relative group ${
                      isActive 
                        ? "ring-1 ring-[#ad8330] scale-105 shadow-md bg-zinc-900" 
                        : "opacity-50 hover:opacity-100 hover:scale-105 bg-zinc-950"
                    }`}
                  >
                    <span className={isActive ? "text-[#ad8330]" : "text-zinc-400"}>{a.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[115px] left-3 right-3 z-50 bg-[#09090b] border border-zinc-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2.5 border-b border-zinc-900 bg-zinc-950">
                <p className="text-[9px] font-black text-[#ad8330] uppercase tracking-widest">Escolha o Assistente Ideal</p>
              </div>
              <div className="overflow-y-auto max-h-[260px] sm:max-h-[320px] divide-y divide-zinc-900/60 custom-scrollbar">
                {assistants.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => switchAgent(a)}
                    className={`w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-zinc-900/60 transition-colors cursor-pointer text-left ${
                      activeAssistant.id === a.id ? "bg-[#c5a880]/10" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-black bg-[#ad8330] shadow-md">
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white tracking-wide truncate">{a.label}</span>
                        {activeAssistant.id === a.id && (
                          <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 bg-[#ad8330]/20 text-[#ad8330]">
                            Ativo
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest block text-zinc-400">{a.sublabel}</span>
                      <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">{a.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 relative bg-zinc-950/30 custom-scrollbar"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            {isDraggingOver && (
              <div className="absolute inset-3 bg-black/95 border-2 border-dashed border-[#ad8330] rounded-2xl flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in duration-150">
                <div className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce bg-[#ad8330]/10 border border-[#ad8330]/20">
                  <UploadCloud size={24} className="text-[#ad8330]" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Solte o arquivo aqui</p>
                <p className="text-[9px] text-zinc-400">Fotos, documentos, textos</p>
              </div>
            )}

            {activeMessages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-6 px-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#ad8330] shadow-xl bg-[#ad8330]/10 border border-[#ad8330]/20">
                  <Bot size={26} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white tracking-wide">{activeAssistant.label}</p>
                  <p className="text-[11px] text-zinc-400 max-w-[260px] leading-relaxed mt-1">{activeAssistant.desc}</p>
                  <p className="text-[9px] text-zinc-500 mt-3 leading-relaxed">
                    Envie mensagens, textos ou fotos para começar
                  </p>
                </div>
              </div>
            )}

            {activeMessages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div key={index} className={`flex flex-col gap-1.5 ${isModel ? "items-start" : "items-end"}`}>
                  
                  {/* File attachments renderer inside bubbles */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-1 max-w-[85%]">
                      {msg.files.map((file, fIdx) => {
                        const isImg = file.type.startsWith("image/");
                        if (isImg) {
                          return (
                            <div key={fIdx} className="rounded-xl overflow-hidden border border-zinc-800 w-40 shadow-md bg-zinc-900/60 p-1">
                              <img src={`data:${file.type};base64,${file.data}`} className="w-full h-24 object-cover rounded-lg" alt={file.name} />
                            </div>
                          );
                        }
                        return (
                          <div 
                            key={fIdx} 
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl w-44 shadow-sm text-left"
                          >
                            <File size={15} className="text-[#ad8330] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">{file.name}</p>
                              <p className="text-[8px] text-zinc-500 uppercase mt-0.5">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`max-w-[92%] sm:max-w-[88%] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-medium shadow-sm transition-all duration-200 break-words overflow-hidden ${
                      isModel 
                        ? "bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 rounded-bl-sm" 
                        : "bg-[#ad8330]/20 border border-[#ad8330]/30 text-white rounded-br-sm"
                    }`}
                  >
                    {isModel ? formatMessage(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>

                  {isModel && (
                    <button
                      onClick={() => applyModelMessageToEditor(index, msg.content)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-[#ad8330]"
                    >
                      <Zap size={10} />
                      <span>Aplicar no Editor</span>
                    </button>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-black bg-[#ad8330]">
                  {activeAssistant.icon}
                </div>
                <div className="px-4 py-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Area */}
          <div className="shrink-0 p-3 border-t border-zinc-900 bg-black/90 backdrop-blur-md space-y-2">
            
            {/* Multiple files preview before send */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-col gap-1.5 px-1 py-0.5 max-h-[90px] overflow-y-auto custom-scrollbar">
                {attachedFiles.map((file, idx) => {
                  const isImg = file.type.startsWith("image/");
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl animate-in slide-in-from-bottom-2 duration-150"
                    >
                      {isImg ? (
                        <div className="w-6 h-6 rounded-md overflow-hidden border border-zinc-700 shrink-0">
                          <img src={`data:${file.type};base64,${file.data}`} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      ) : (
                        <File size={13} className="text-[#ad8330] shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-zinc-300 truncate">{file.name}</p>
                        <p className="text-[8px] text-zinc-500">{formatFileSize(file.size)}</p>
                      </div>
                      
                      <button 
                        onClick={() => removeAttachedFile(idx)} 
                        className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-end gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInput} 
                className="hidden" 
                multiple 
                accept="*" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0 mb-0.5 disabled:opacity-40"
                title="Anexar arquivos ou fotos"
              >
                {isUploading ? <RefreshCw size={15} className="animate-spin text-[#ad8330]" /> : <Paperclip size={15} />}
              </button>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onPaste={handlePaste}
                placeholder={`Digite sua mensagem...`}
                rows={1}
                className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ad8330]/60 resize-none font-medium leading-relaxed transition-colors"
                style={{ minHeight: "38px", maxHeight: "90px", scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || isUploading || (inputText.trim() === "" && attachedFiles.length === 0)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-black bg-[#ad8330] cursor-pointer transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 shrink-0 shadow-md mb-0.5"
              >
                {isTyping ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
