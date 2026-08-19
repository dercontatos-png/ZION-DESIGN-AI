import React, { useState, useEffect, useRef, useCallback } from "react";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import { checkAdminOrOpenPlan, getAuthHeaders } from "../utils/userAuth";
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
  Loader2,
  Instagram,
  Copy
} from "lucide-react";

interface ChatFile {
  name: string;
  type: string;
  data: string; // base64 string
  size?: number;
  category?: "logo" | "design" | "subject" | "scene" | "style" | "info";
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
  onGenerateImage?: () => void;
}


const assistants: AssistantConfig[] = [
  // Top Featured Agents
  { id: "diretor-criativo", label: "Diretor Criativo IA", sublabel: "Direção de Arte & Marca", desc: "Avance além do bloqueio criativo com orientações estratégicas de design de alto impacto.", icon: <Eye size={14} />, color: "#ad8330" },
  { id: "copy-legendas-instagram", label: "Especialista em Legendas Instagram", sublabel: "Legendas, Engajamento & Hashtags", desc: "Crie legendas altamente engajadoras para Instagram com emojis, chamadas para ação e hashtags de alto alcance prontas para copiar.", icon: <Instagram size={14} />, color: "#e1306c" },
  
  // Designers / Creators
  { id: "gc-tv-specialist", label: "Gerador de Tarjas & Caracteres (TV)", sublabel: "Especialista em Transmissão", desc: "Crie tarjas, lower-thirds e elementos visuais profissionais para programas, matérias e transmissões ao vivo.", icon: <Zap size={14} />, color: "#38bdf8" },
  { id: "prompt-extrator", label: "Extrator de Instruções", sublabel: "Analista de Instruções Visuais", desc: "Decodifique a estrutura e os parâmetros técnicos de referências visuais para reprodução exata.", icon: <Code size={14} />, color: "#ad8330" },
  { id: "creative-assistant", label: "Assistente de Composição", sublabel: "Consultor de Estilo & Iluminação", desc: "Receba direcionamentos conceituais de iluminação, paletas de cores, enquadramento e cenografia.", icon: <Sparkles size={14} />, color: "#d4af37" },
  { id: "analisador-paginas", label: "Analisador de Design", sublabel: "Auditoria Visual & Usabilidade", desc: "Submeta artes e layouts para diagnósticos profissionais de hierarquia, contraste e legibilidade.", icon: <Search size={14} />, color: "#ffffff" },
  
  // Copywriters & Marketers
  { id: "copy-ads", label: "Redator de Anúncios", sublabel: "Especialista em Performance", desc: "Desenvolva textos de alta conversão estruturados com ganchos, quebra de objeções e chamadas para ação.", icon: <Megaphone size={14} />, color: "#ad8330" },
  { id: "copy-carroseis", label: "Redator de Carrosséis", sublabel: "Engajamento & Conteúdo", desc: "Crie narrativas envolventes em carrosséis que retêm a atenção e conduzem o público até a conversão.", icon: <Layers size={14} />, color: "#d4af37" },
  { id: "easy-copy", label: "Redator de Textos de Venda", sublabel: "Textos de Venda & Páginas", desc: "Produza copys completas para landing pages, e-mails e páginas de vendas em qualquer segmento.", icon: <FileText size={14} />, color: "#ad8330" },
  
  // Strategists
  { id: "analise-estrategica", label: "Análise Estratégica", sublabel: "Inteligência de Mercado", desc: "Mapeie dores reais do cliente, analise concorrentes e estruture propostas de valor irresistíveis.", icon: <Check size={14} />, color: "#4f46e5" },
  { id: "icp", label: "Cliente Ideal & Posicionamento", sublabel: "Estratégia de Marca", desc: "Defina o perfil de cliente ideal e consolide uma presença de marca com alta autoridade no mercado.", icon: <Check size={14} />, color: "#4f46e5" },
  
  // Sales
  { id: "atendimento", label: "Atendimento & Negociação", sublabel: "Gestão de Objeções", desc: "Conduza reuniões e diálogos comerciais com técnicas que aceleram a decisão do cliente.", icon: <Check size={14} />, color: "#10b981" },
  { id: "webson-vendedor", label: "Consultor de Vendas IA", sublabel: "Fechamento Comercial", desc: "Analise conversas com clientes em potencial e receba respostas prontas para superar objeções de negociação.", icon: <Check size={14} />, color: "#10b981" },
  
  // Dev & Sites
  { id: "estrutura-sites", label: "Arquiteto de Páginas de Venda", sublabel: "Arquitetura de Informação", desc: "Estruture wireframes e seções estratégicas otimizadas para taxa de conversão e navegabilidade.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-coder", label: "Assistente de Código para Sites", sublabel: "Desenvolvimento Front-end", desc: "Receba trechos de código limpo em HTML, CSS, JavaScript e React prontos para implementação.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-image", label: "Gerador Visual de Imagens", sublabel: "Sintetizador Gráfico", desc: "Gere imagens realistas e ilustrações técnicas com alto nível de detalhamento descritivo.", icon: <ImageIcon size={14} />, color: "#ec4899" },
];

const ASSISTANT_SUGGESTIONS: Record<string, string[]> = {
  "diretor-criativo": [
    "Como melhorar o contraste e a iluminação desta arte?",
    "Sugira uma paleta de cores premium para marca de luxo",
    "Crie uma ideia de composição minimalista para produto",
    "Qual tipografia combina com design corporativo moderno?"
  ],
  "copy-legendas-instagram": [
    "Crie uma legenda engajadora para carrossel sobre marketing",
    "Escreva um post anunciando novidade com CTA forte",
    "Gere 10 hashtags virais para designer gráfico / agência",
    "Escreva uma bio de Instagram de alto impacto"
  ],
  "gc-tv-specialist": [
    "Tarja de jornalismo urgente com cores vermelho e amarelo",
    "Placar de futebol para transmissão ao vivo com escudos",
    "Lower third minimalista para podcast de negócios",
    "Tarja de entrevista exclusiva com nome e cargo"
  ],
  "prompt-extrator": [
    "Como descrever esta iluminação cinematográfica em prompt?",
    "Extraia os parâmetros de textura e render 3D desta arte",
    "Prompt para estilo fotográfico editorial de alta costura"
  ],
  "creative-assistant": [
    "Ideias de fundo futurista com néon suave",
    "Como posicionar o sujeito em enquadramento regra dos terços",
    "Sugira cenário luxuoso para ensaio fotográfico"
  ],
  "analisador-paginas": [
    "Analise a hierarquia visual e legibilidade do meu layout",
    "Como melhorar a taxa de conversão desta arte de anúncio?"
  ],
  "copy-ads": [
    "Crie 3 opções de ganchos (hooks) fortes para anúncio em vídeo",
    "Texto de alta conversão para oferta de Black Friday"
  ],
  "copy-carroseis": [
    "Estruture um carrossel de 5 slides ensinando um passo a passo",
    "Roteiro de carrossel para quebrar a principal objeção de preço"
  ]
};

const DEFAULT_SUGGESTIONS = [
  "Como você pode me ajudar a melhorar meus designs?",
  "Sugira uma ideia criativa para o meu próximo post",
  "Otimize meu prompt para ficar cinematográfico"
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
  const textToRender = cleanText || "*Diretor Criativo: Configurações do painel prontas para você! Clique em 'Gerar Arte' para ver o resultado.*";

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
        <div key={i} className="my-2 p-3 bg-black border border-zinc-800 rounded-lg text-[12px] text-zinc-300 font-semibold">
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

const compressImage = (base64Str: string, maxWidth = 1280, maxHeight = 1280, quality = 0.82): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};




export const ChatAssistente: React.FC<ChatAssistenteProps> = ({ customApiKey, showToast, onGenerateImage }) => {
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
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [agentCategoryFilter, setAgentCategoryFilter] = useState<'all' | 'design' | 'copy' | 'vendas' | 'dev'>('all');
  const [agentSearch, setAgentSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.1-pro-preview");
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    return Object.fromEntries(assistants.map((a) => [a.id, []]));
  });
  const [copiedMsgIndex, setCopiedMsgIndex] = useState<number | null>(null);
  const isCopyOrTextAssistant = 
    activeAssistant.id === "copy-legendas-instagram" ||
    activeAssistant.id.startsWith("copy-") ||
    activeAssistant.id === "easy-copy" ||
    activeAssistant.id === "webson-vendedor" ||
    activeAssistant.id === "atendimento" ||
    activeAssistant.id === "analise-estrategica" ||
    activeAssistant.id === "icp";

  const handleCopyMessageText = (index: number, text: string) => {
    let clean = text.replace(/```json\n[\s\S]*?\n```/g, '').replace(/```json[\s\S]*?```/g, '').trim();
    
    // Extract caption text if enclosed in markdown separators (e.g. *** caption ***)
    if (clean.includes("***")) {
      const parts = clean.split("***").map(p => p.trim()).filter(Boolean);
      const captionPart = parts.find(p => p.includes("#") || p.length > 50) || parts[0];
      if (captionPart) {
        clean = captionPart.trim();
      }
    }
    
    // Clean conversational intros if any leaked
    clean = clean.replace(/^(Que arte espetacular|Aqui está a sua copy|Aqui está a legenda|Segue a legenda|Como Diretor de Arte|E já que a imagem está impecável)[^\n]*\n*/gi, '').trim();
    
    // Remove markdown asterisks (e.g. **texto** -> texto) since Instagram doesn't support markdown bold
    clean = clean.replace(/\*\*/g, '').replace(/\*/g, '');

    navigator.clipboard.writeText(clean || text);
    setCopiedMsgIndex(index);
    showToast("Texto copiado com sucesso!", "success");
    setTimeout(() => setCopiedMsgIndex(null), 2500);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);
    const loadChats = async () => {
      try {
        const projId = store.activeProjectId || "default_project";
        let savedObj = await idbGet(`zion_assistant_chats_${projId}`);
        if (!savedObj) {
          const savedStr = localStorage.getItem(`zion_assistant_chats_${projId}`);
          if (savedStr) savedObj = JSON.parse(savedStr);
        }

        // Recovery fallback to default key if current project has no history yet
        if (!savedObj || (typeof savedObj === 'object' && Object.values(savedObj).every((arr: any) => Array.isArray(arr) && arr.length === 0))) {
          const fallbackStr = localStorage.getItem("zion_assistant_chats_default") || localStorage.getItem("zion_assistant_chats_global");
          if (fallbackStr) {
            try { savedObj = JSON.parse(fallbackStr); } catch (e) {}
          }
        }
        
        if (isMounted) {
          if (savedObj && typeof savedObj === 'object') {
            setChats(savedObj);
          } else {
            setChats(Object.fromEntries(assistants.map((a) => [a.id, []])));
          }
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
        if (isMounted) {
          setChats(Object.fromEntries(assistants.map((a) => [a.id, []])));
          setIsLoaded(true);
        }
      }
    };
    loadChats();
    return () => { isMounted = false; };
  }, [store.activeProjectId]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const projId = store.activeProjectId || "default_project";
      idbSet(`zion_assistant_chats_${projId}`, chats).catch(e => console.error("Error saving chat history IDB:", e));
      localStorage.setItem(`zion_assistant_chats_${projId}`, JSON.stringify(chats));
      localStorage.setItem("zion_assistant_chats_default", JSON.stringify(chats));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [chats, store.activeProjectId, isLoaded]);
  const [inputText, setInputText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  // Estado para edição de mensagem enviada
  const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const fileInputInfoRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputDesignRef = useRef<HTMLInputElement>(null);
  const fileInputSubjectRef = useRef<HTMLInputElement>(null);
  const fileInputSceneRef = useRef<HTMLInputElement>(null);
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

  const handleAttachFiles = useCallback(async (
    files: FileList | File[], 
    forcedCategory?: "logo" | "design" | "subject" | "scene" | "style" | "info",
    triggerFlow = false
  ) => {
    setIsUploading(true);
    const fileList = Array.from(files);
    const successfullyAttached: ChatFile[] = [];

    try {
      for (const file of fileList) {
        if (file.size > 50 * 1024 * 1024) {
          showToast(`O arquivo ${file.name} excede o limite de 50MB. Por favor, envie um arquivo menor.`, "error");
          continue;
        }

        try {
          const b64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          let processedB64 = b64;
          let fileType = file.type || "application/octet-stream";
          if (file.type.startsWith("image/")) {
            try {
              processedB64 = await compressImage(b64, 1280, 1280, 0.82);
              fileType = "image/jpeg";
            } catch (compressErr) {
              console.error("Erro na compressão automática do chat:", compressErr);
            }
          }

          const cleanBytes = processedB64.replace(/^data:[^;]+;base64,/, "");

          let fileCat: "logo" | "design" | "subject" | "scene" | "style" | "info" = forcedCategory || (file.type.startsWith("image/") ? ("auto" as any) : "info");

          if (!forcedCategory) {
            const lowerName = file.name.toLowerCase();
            if (lowerName.includes("logo") || lowerName.includes("marca") || lowerName.includes("logomarca") || lowerName.includes("logotipo") || lowerName.includes("10anos") || lowerName.includes("icon") || lowerName.includes("symbol")) {
              fileCat = "logo";
            } else if (lowerName.includes("pessoa") || lowerName.includes("modelo") || lowerName.includes("sujeito") || lowerName.includes("homem") || lowerName.includes("mulher") || lowerName.includes("face") || lowerName.includes("portrait")) {
              fileCat = "subject";
            } else if (lowerName.includes("cenario") || lowerName.includes("background") || lowerName.includes("fundo") || lowerName.includes("scene") || lowerName.includes("ambiente")) {
              fileCat = "scene";
            } else if (lowerName.includes("estilo") || lowerName.includes("style")) {
              fileCat = "style";
            } else if (lowerName.includes("layout") || lowerName.includes("design") || lowerName.includes("flyer") || lowerName.includes("card") || lowerName.includes("ref")) {
              fileCat = "design";
            } else {
              fileCat = file.type.startsWith("image/") ? ("auto" as any) : "info";
            }
          }

          const newFile: ChatFile = {
            name: file.name,
            type: fileType,
            data: cleanBytes,
            size: file.size,
            category: fileCat
          };

          successfullyAttached.push(newFile);

          if (triggerFlow && activeAssistant.id === "prompt-extrator" && file.type.startsWith("image/")) {
            setTimeout(() => {
              handleSendMessage("Por favor, analise a imagem e extraia o prompt.", [newFile]);
            }, 100);
          }
        } catch (fileErr) {
          console.error("Erro ao ler arquivo:", fileErr);
          showToast(`Erro ao processar arquivo ${file.name}.`, "error");
        }
      }

      if (successfullyAttached.length > 0) {
        setAttachedFiles((prev) => [...prev, ...successfullyAttached]);
        showToast(`${successfullyAttached.length} ${successfullyAttached.length === 1 ? "arquivo anexado" : "arquivos anexados"} com sucesso!`, "success");
      }
    } finally {
      setIsUploading(false);
    }
  }, [activeAssistant.id]);

  const updateFileCategory = (idx: number, cat: "logo" | "design" | "subject" | "scene" | "style" | "info") => {
    setAttachedFiles((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], category: cat };
      }
      return next;
    });
  };

  const handleImprovePrompt = async () => {
    if (!inputText.trim()) {
      showToast("Escreva algo no campo de texto para a IA melhorar a instrução.", "warning");
      return;
    }

    if (!checkAdminOrOpenPlan(customApiKey)) return;
    setIsImprovingPrompt(true);
    try {
      const response = await fetch("/api/melhorar-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(customApiKey) },
        body: JSON.stringify({
          prompt: inputText,
          assistantId: activeAssistant.id,
          agentName: activeAssistant.label,
          customApiKey
        })
      });

      const data = await response.json();
      if (response.ok && data.improvedPrompt) {
        setInputText(data.improvedPrompt);
        showToast("Instrução aprimorada com sucesso! Confira e clique em enviar.", "success");
        if (textareaRef.current) {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
            }
          }, 50);
        }
      } else {
        showToast(data.error || "Não foi possível aprimorar a instrução.", "error");
      }
    } catch (err: any) {
      console.error("Erro ao aprimorar prompt:", err);
      showToast("Erro ao conectar ao serviço de aprimoramento de instrução.", "error");
    } finally {
      setIsImprovingPrompt(false);
    }
  };

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
    
    // Se estiver editando uma mensagem anterior, truncar o histórico naquele ponto
    if (editingMsgIndex !== null && !overrideText) {
      const truncatedMessages = currentMessages.slice(0, editingMsgIndex);
      setChats((prev) => ({ ...prev, [activeAssistant.id]: [...truncatedMessages, userMsg] }));
      setEditingMsgIndex(null);
    } else {
      setChats((prev) => ({ ...prev, [activeAssistant.id]: [...currentMessages, userMsg] }));
    }
    
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

    const configContext = isCopyOrTextAssistant ? "" : `
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
0. MAPEAMENTO E PREENCHIMENTO AUTOMÁTICO DE IMAGENS ANEXADAS (EDITAR FOTO / MELHORAR PROMPT / REFERÊNCIA):
   - IMPORTANTE (REGRA DE CORREÇÃO PONTUAL): Se o usuário pedir APENAS uma correção ou ajuste pontual (ex: "corrija o texto", "mude o valor para R$ 600", "aumente o título") e as imagens já estiverem configuradas no editor, NÃO refaça o mapeamento completo: retorne SOMENTE as chaves alteradas, JAMAIS "substituirConfig" nem "substituirImagens" (essas flags apagam as configurações e as referências de imagem existentes do editor) e JAMAIS "mapeamentoImagens". As referências já carregadas permanecem intactas.
   - Quando o usuário anexar 1 ou mais fotos/imagens ao chat (ou pedir para editar uma foto, melhorar o prompt, ou criar uma arte com base em uma foto):
     * VOCÊ DEVE OBRIGATORIAMENTE ANALISAR E ESCANEAR VISUALMENTE A IMAGEM ANEXADA COM SUA CAPACIDADE MULTIMODAL GEMINI.
     * VOCÊ DEVE RETORNAR EM 'mapeamentoImagens' NO JSON O MAPEAMENTO DO ARQUIVO para: 'design,scene,subject,style' (se houver sujeito na foto), ou 'design,scene,style' (se não houver pessoa/sujeito humano), ou 'logo' (se for logotipo de marca).
     * OBRIGATÓRIO: ATIVE 'useEnvRef': true (para preservar o fundo/cenário original), 'desativarSujeito': false e 'noPeople': false (se houver pessoa/sujeito).
     * OBRIGATÓRIO: VOCÊ DEVE ESCANEAR A FOTO E PREENCHER OS CAMPOS DE TEXTO DO JSON COM DESCRIÇÕES DETALHADAS EM PORTUGUÊS:
       - 'promptCenario': Descreva minuciosamente em Português o fundo, cenário, iluminação, cores e ambiente da foto original enviada.
       - 'promptDesign': Descreva minuciosamente em Português o enquadramento, composição visual e proporções da foto original.
       - 'poseDescription': Descreva minuciosamente em Português o sujeito/pessoa/modelo, suas roupas, pose, traços faciais e expressão.
       - 'promptEstilo': Descreva minuciosamente em Português o estilo fotográfico, tons, tratamento de pele, contraste e edição Lightroom.
       - 'additionalPrompt': Crie um prompt completo em Português unindo a descrição visual detalhada da foto original com TODAS as edições e remoções específicas pedidas pelo usuário (ex: remover coisas da mesa, remover sombras, desfocar o fundo, limpeza de pele), iniciando com: "MANDATO DE EDIÇÃO E REMOÇÃO DE OBJETOS: Manter o sujeito e enquadramento da foto enviada, aplicando OBRIGATORIAMENTE as seguintes edições e remoções solicitadas: [detalhar remoções e edições pedidas pelo usuário]".
- Se uma das imagens for CLARAMENTE um Logotipo de uma marca ou se o usuário disser "coloque a logo X" / "use a logo 10 anos": ative "useLogo": true e mapeie como "logo". NÃO crie camada de texto em "camadasTexto" para o nome da logo! O nome da logo refere-se ao ARQUIVO DE IMAGEM enviado pelo cliente.
1. REGRA ABSOLUTA DE LOGOTIPO vs CAMADA DE TEXTO:
   - Se o usuário enviar uma imagem de logo ou disser "coloque a logo 10 anos" / "use a logo X":
     * Defina "useLogo": true e mapeie o arquivo como "logo" em "mapeamentoImagens".
     * É TERMINANTEMENTE PROIBIDO CRIAR UMA CAMADA DE TEXTO em "camadasTexto" com o nome da logo (JAMAIS crie { conteudo: "10 anos" } ou { conteudo: "logo 10 anos" }).
     * O nome "10 anos" é o nome do arquivo/imagem do logotipo, NÃO um texto tipográfico para ser escrito!
2. POSICIONAMENTO DA LOGO E ZONA DE PROTEÇÃO DE CABELO E ROSTO:
   - A logo NUNCA PODE SER GERADA EM CIMA DO CABELO, ROSTO OU CORPO DO SUJEITO!
   - Se o sujeito tiver cabelo/cabeça alta no centro superior, instrua em "promptTipografia": "Posicionar o logotipo da marca estritamente em espaço negativo limpo no canto superior esquerdo ou superior direito, JAMAIS em cima do cabelo, rosto ou cabeça do sujeito."
3. IDIOMA DOS CAMPOS DE TEXTO DO EDITOR (PORTUGUÊS DO BRASIL):
   - É OBRIGATÓRIO preencher TODOS os campos de texto do JSON (promptCenario, promptDesign, promptTipografia, additionalPrompt, negativePrompt, poseDescription, floatingElementsCustom, composicaoCustom, estiloVisualCustom) EM PORTUGUÊS DO BRASIL.
   - O usuário precisa visualizar e ler todos esses textos no formulário do editor em Português.
   - O processamento e tradução técnica para o inglês do gerador de imagem ocorre automaticamente no servidor backend!
3. Se a arte NÃO deve ter pessoas ou sujeito, mude "desativarSujeito": true e "noPeople": true.
4. Se a arte TEM que ter sujeito ou pessoa, mude "desativarSujeito": false e "noPeople": false.
5. Se a arte precisa de textos verdadeiros, mude "enableTypography": true e preencha "camadasTexto" e "promptTipografia".
6. Se a arte exige uma cor específica, atualize "cores" e defina "coresAutomaticas": false. Se a arte NÃO exige uma cor específica, você DEVE definir "coresAutomaticas": true e omitir o objeto "cores".
7. REGRA CRÍTICA DE CENÁRIO: "useEnvRef" DEVE ser true APENAS se houver foto de cenário/imagem de fundo enviada ou anexada. Se NÃO houver imagem de referência de cenário enviada, defina OBRIGATORIAMENTE "useEnvRef": false.
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
11. REGRA ABSOLUTA DE RESOLUÇÃO E TAMANHO (NÃO PERGUNTE AO USUÁRIO):
    JAMAIS pergunte ao usuário se ele deseja resolução 1K, 2K ou 4K, e JAMAIS pergunte sobre dimensões/tamanhos de imagem ou inicie conversas sobre qualidade! O usuário define a resolução e tamanho manualmente no painel quando quiser. Assuma sempre altíssima qualidade automaticamente no background sem mencionar 1K, 2K ou 4K nas suas respostas de chat.
12. REGRA ABSOLUTA DE FUNDO SÓLIDO / COR ÚNICA (PURE SOLID COLOR BACKGROUND):
    Se o usuário pedir apenas um fundo sólido, cor de fundo, canvas limpo ou cor única (ex: "CRIE UM FUNDO SOLIDO NA COR #0b1c32 4:5", "fundo liso azul", "cor sólida"):
    - "desativarSujeito": true, "noPeople": true, "enableTypography": false, "camadasTexto": [], "promptTipografia": "", "useLogo": false, "useEnvRef": false
    - "promptDesign": "Tela plana e limpa de cor sólida."
    - "promptCenario": "Fundo azul escuro sólido (#0b1c32), acabamento fosco, cor limpa e uniforme, sem pessoas, sem texto, sem formas, sem gradientes."
    - "additionalPrompt": "Fundo totalmente limpo de cor sólida na cor exata #0b1c32, sem modelos, sem sujeitos, sem textos ou gráficos."
    - "negativePrompt": "pessoas, modelos, pessoas humanas, rosto, corpo, texto, frases, título, flyer, cartaz, neon, brilho, celular, gradientes, formas"
    - "dimensao": "3:4" (se 4:5) ou "1:1"
    - "corDominante": "#0b1c32", "useCorDominante": true, "coresAutomaticas": false
    - JAMAIS adicione mockups de celular, frases de sindicato, modelos ou neon que o usuário NÃO solicitou!
13. REGRA ABSOLUTA DE EDIÇÃO, ALTERAÇÃO E REMOÇÃO DE ELEMENTOS (SOMBRAS DE FLASH, OBJETOS, MESAS):
    - Se o usuário pedir para REMOVER, EXCLUIR, TIRAR ou APAGAR elementos, sombras ou objetos da imagem (ex: "tire sombras", "remova a sombra atrás da segunda menina", "tire as coisas da mesa", "remova o instagram"):
      * Preencha OBRIGATORIAMENTE no campo "negativePrompt" a lista exata dos itens a remover, ESPECIFICANDO o alvo em português: "sombras, sombra escura de contorno na parede, sombra pesada atrás da menina da direita, sombras fortes de flash, fundo branco de estúdio".
      * Preencha em "promptCenario": "MANTENHA A PAREDE, A COR DO FUNDO E O AMBIENTE EXATAMENTE ORIGINAIS DA FOTO. NÃO REMOVA O FUNDO E NÃO FAÇA FUNDO BRANCO. Apenas faça a parede atrás da segunda pessoa ficar clara, lisa e sem nenhuma sombra projetada pesada, mesclando e clonando a cor original da parede iluminada no lugar da sombra escura."
      * Preencha em "additionalPrompt" e "promptDesign": "MANDATO DE ABSOLUTA FIDELIDADE AOS ROSTOS, POSES E CENÁRIO + REMOÇÃO TOTAL DA SOMBRA DE FLASH: Manter 100% idênticos os rostos, traços faciais e poses das pessoas. Manter 100% o FUNDO ORIGINAL da foto. NUNCA DEIXE O FUNDO BRANCO OU REMOVA O CENÁRIO! ATENÇÃO MÁXIMA AO PEDIDO: VOCÊ DEVE APENAS PINTAR POR CIMA e DISSOLVER a sombra escura projetada na parede atrás da segunda pessoa (menina da direita). Substitua a sombra pintando a textura da própria parede (mesma cor da parede, sem fundo branco). NENHUMA sombra grossa deve restar atrás da segunda pessoa."
    - Se o usuário pedir para POSICIONAR OU COLOCAR A LOGO EM LUGAR MELHOR (ex: "coloque essa logo", "lugar melhor para a logo", "não coloque em cima do cabelo"):
      * Defina "useLogo": true, "logoInclusionType": "embedded" (a logo deve ser gerada JUNTO com a arte, substituindo a logo antiga da referência no mesmo local). NÃO use "overlay" a menos que o usuário peça explicitamente para colocar a logo por cima.
      * Preencha em "promptTipografia": "Posicionar o logotipo da marca no canto superior esquerdo ou superior direito em espaço limpo. REGRA CRÍTICA: O logotipo JAMAIS deve ficar em cima do cabelo, cabeça, rosto ou corpo do sujeito!"
    - Se o usuário pedir formato para Instagram retrato / post retrato / 4:5:
      * Defina "dimensao": "3:4".
    - Se o usuário pedir para ALTERAR, MUDAR OU FAZER MELHORIAS mantendo a referência original ou foto enviada (ex: "mude X mas mantenha o mesmo fundo original", "faça melhorias mantendo igual", "altere a iluminação", "troque a cor", "só faça melhorias"):
      * Mantenha as referências de imagem originais ativas no editor ("useEnvRef": true, "designRefBase64" mantido).
      * Preencha em "promptCenario": "Fundo e ambiente originais da foto de referência (manter o mesmo cômodo/parede da foto sem transformar em estúdio fotográfico)."
      * Preencha em "additionalPrompt": "MANDATO DE FIDELIDADE TOTAL: Manter 100% fiel o fundo, sujeito, iluminação e cenário original da foto/imagem de referência. Não alterar o cenário nem criar um fundo sintético de estúdio. Aplicar OBRIGATORIAMENTE APENAS as melhorias e alterações específicas solicitadas: [solicitação do usuário]."
    - Se o usuário pedir para ALTERAR ou MUDAR um texto ou valor (ex: "mude o valor para R$ 600", "troque locução por apresentadora", "corrija X"):
      * MANTENHA TODOS OS OUTROS TEXTOS do editor que já estavam certos e não foram mencionados pelo usuário.
      * Consulte a lista "[Camadas de Texto Atuais no Editor]" enviada no contexto acima e retorne em "camadasTexto" a lista COMPLETA das camadas com as alterações solicitadas.
    - Se o usuário pedir para REMOVER PESSOAS/MODELO: defina "desativarSujeito": true, "noPeople": true.
    - Se o usuário pedir para REMOVER CENÁRIO/FUNDO: defina "useEnvRef": false e "promptCenario": "".
    - Se o usuário pedir para REMOVER LOGO: defina "useLogo": false.
    - Se o usuário pedir para LIMPAR um prompt/observação/estilo: envie o campo correspondente como string vazia (ex: "additionalPrompt": "", "negativePrompt": "", "promptCenario": "").
14. REGRA ABSOLUTA DE PRESERVAÇÃO DE ROSTOS, EXPRESSÕES, POSES E POSIÇÕES DAS PESSOAS:
    - Sempre que houver pessoas na foto enviada ou em edição (a menos que o usuário peça explicitamente para remover ou trocar as pessoas):
      * É TERMINANTEMENTE PROIBIDO alterar a fisionomia, mudar feições faciais, trocar os rostos, alterar as poses corporais ou mudar as pessoas de lugar/posição!
      * JAMAIS mencione "estúdio fotográfico", "parede neutra de estúdio" ou "fundo sintético" em "promptCenario" ou "additionalPrompt" ao editar fotos, pois isso confunde a IA e faz com que ela redesenhe o cenário e os rostos das pessoas!
      * REGRA CRÍTICA DE ANÁLISE DE EXPRESSÃO FACIAL: Ao analisar a foto enviada, EXAMINE ATENTAMENTE A EXPRESSÃO INDIVIDUAL DE CADA PESSOA. NUNCA use termos genéricos como "pessoas sorrindo" ou "duas mulheres sorrindo" se apenas uma pessoa está sorrindo. Descreva a fisionomia e a expressão EXATA de cada pessoa separadamente (ex: "Mulher da esquerda sorrindo de dentes à mostra; mulher da direita com lábios fechados e expressão suave/serena sem sorrir de dentes").
      * OBRIGATÓRIO: Descreva em "poseDescription" os rostos, traços, roupas e a EXPRESSÃO FACIAL INDIVIDUAL EXATA de cada pessoa e reforce em "additionalPrompt": "MANDATO DE ROSTOS, POSES, EXPRESSÕES E POSIÇÕES IDÊNTICOS: Manter 100% idênticos os rostos, feições, fisionomia, idade, roupas, poses corporais, a expressão facial INDIVIDUAL exata de cada pessoa (respeitando quem está de boca fechada e quem está sorrindo sem forçar sorrisos) e a posição física exata de cada pessoa na foto de referência. Não alterar os rostos, não forçar sorrisos e não trocar as pessoas de lugar."
15. REGRA ABSOLUTA DE TRATAMENTO FOTOGRÁFICO ADOBE LIGHTROOM E REMOÇÃO DE SOMBRAS DE FLASH:
    - Sempre que o usuário solicitar tratamento, edição, melhoria ou correção estilo Lightroom/fotografia profissional:
      * Adicione em "promptEstilo" e "additionalPrompt" a suíte completa de ajustes Lightroom:
        1. AJUSTES BÁSICOS: Equilíbrio perfeito de Exposição, Contraste, Highlights (preservados sem estourar), Shadows (abertas e sem manchas pretas), Whites e Blacks limpos. Temperatura e Tint corrigidos para cores e pele 100% naturais. Vibrância inteligente com saturação sob controle.
        2. TEXTURA E IMPACTO: Aplicação de Texture, Clarity e Dehaze para máxima definição e nitidez nos fios de cabelo, roupas e detalhes.
        3. CURVA DE TONS (TONE CURVE): Curva S-Curve suave RGB para contraste de estúdio cinematográfico e pretos levemente elevados estilo filme profissional.
        4. HSL / COR INDIVIDUAL: Laranja ajustado para tom de pele dourado e natural, azuis profundos e verdes equilibrados.
        5. COLOR GRADING CINEMATOGRÁFICO: Sombras levemente frias, realces quentes dourados, balanço profissional Teal & Orange.
        6. MÁSCARAS E REMOÇÃO DE ERROS (HEALING): Máscara inteligente no sujeito para luz e nitidez no rosto. Remoção completa e absoluta de sombras de flash na parede e desordem na mesa. Nitidez refinada com redução de ruído de iluminação e cor. Leve vinheta e granulação fina.
16. REGRA ABSOLUTA DE EXTRAÇÃO TOTAL DE TEXTOS E CARDS (OCR DE ALTA PRECISÃO):
    - Sempre que o usuário anexar uma imagem de referência de card, flyer, banner, documento ou cartaz contendo textos:
      * VOCÊ DEVE OBRIGATORIAMENTE LER E EXTRAIR 100% DE TODOS OS TEXTOS VISÍVEIS na imagem do topo ao rodapé.
      * Crie uma camada em "camadasTexto" para CADA frase, título, subtítulo, oferta, preço, telefone, data, endereço ou botão CTA encontrado.
      * Ative OBRIGATORIAMENTE "enableTypography": true.
      * NUNCA remova ou omita nenhum texto da imagem de referência, A MENOS QUE o usuário peça explicitamente em texto para remover ou alterar algum trecho específico.

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

    if (!checkAdminOrOpenPlan(customApiKey)) return;
    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(customApiKey) },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: (userMsg.content || "Analise os arquivos enviados.") + clientContext + configContext,
          attachedFiles: userMsg.files,
          history: currentMessages.map((m, idx, arr) => ({ 
            role: m.role, 
            content: m.content,
            files: m.files ? m.files.map(f => ({
              name: f.name,
              type: f.type,
              category: f.category,
              data: (idx >= arr.length - 2) ? f.data : undefined
            })) : undefined 
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

      if (data.response && activeAssistant.id !== "prompt-extrator" && (hasJsonBlock(data.response) || (userMsg.files && userMsg.files.length > 0))) {
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
   - Se a solicitação for de Edição de Fotos, Retoque Fotográfico, Fotos de Pessoas/Modelos, Fotos de Comida/Restaurantes, Fotografia de Produtos com fundo real ou tratamento Lightroom, defina "tipoPainel": "FOTO".
   - Caso contrário, defina "tipoPainel": "DESIGNER" (ou "PRODUCT" para produtos soltos, "LOGO" para logos).

2. MAPEAMENTO DE IMAGENS (mapeamentoImagens):
   - "logo": Logotipos. Ative "useLogo": true.
   - "subject": Sujeitos principais/modelos/produtos. Ative o sujeito ("desativarSujeito": false, "noPeople": false).
   - "scene": Cenários/fundo. Ative "useEnvRef": true.
   - "design": Imagem de Referência do Layout/Design/Card.
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

4. TIPOGRAFIA E EXTRAÇÃO TOTAL DE TEXTO DE CARDS / REFERÊNCIAS (MANDATO CRÍTICO DE OCR E PRESERVAÇÃO):
   - REGRA ABSOLUTA: Sempre que houver qualquer imagem de referência de card, flyer, post, cartaz ou documento anexado (ou texto no prompt):
     * Você DEVE ESCANEAR E EXTRAIR 100% DE TODOS OS TEXTOS VISÍVEIS na imagem de referência, linha por linha (títulos, subtítulos, corpo de texto, preços, contatos, telefones, datas, endereço, botão CTA, selos e rodapé).
     * NUNCA OMITA NENHUM TEXTO DO CARD ORIGINAL, a não ser que o usuário peça EXPLICITAMENTE em texto para remover ou alterar algum trecho específico!
     * Ative OBRIGATORIAMENTE "enableTypography": true.
     * Crie uma camada em "camadasTexto" para CADA bloco de texto encontrado:
       - "funcao": "Headline Principal" | "Subheadline Secundário" | "CTA Botão" | "Corpo Descrição" | "Legenda / Detalhe" | "Badge / Selo" | "Preço / Valor" | "Data / Horário"
       - "conteudo": O texto EXATO extraído da imagem ou prompt.
       - "fonte": Fonte identificada (ex: "Montserrat", "Outfit", "Inter", "Impact")
       - "cor": HEX da cor aproximada (ex: "#FFFFFF", "#FFD700")
     * Preencha "promptTipografia" detalhando o posicionamento exato de cada camada de texto na tela.
     * "typographyPosition": "ESQUERDA" | "CENTRO" | "DIREITA"

5. CENÁRIO:
   - "useEnvRef": true se houver foto de fundo.
   - "promptCenario": Descrição técnica em PORTUGUÊS DO BRASIL do fundo/cenário.

6. DESIGN OBRIGATÓRIO:
   - "promptDesign": Instruções em PORTUGUÊS DO BRASIL sobre o layout, grid e enquadramento do design de referência.

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
   - "composicaoCustom": texto livre de composição em PORTUGUÊS DO BRASIL se necessário

10. ELEMENTOS FLUTUANTES:
    - "floatingElementsMode": "off" | "auto" | "custom"
    - "floatingElementsCustom": texto livre em PORTUGUÊS DO BRASIL

11. ATRIBUTOS VISUAIS E ESTILO:
    - "sobriedade": número de 0 a 100 (ex: 80)
    - "enableEstiloVisual": true
    - "estilosVisuais": array com os estilos (ex: ["Corporativo", "Clean", "Institucional"])
    - "estiloVisualCustom": descrição técnica do estilo em PORTUGUÊS DO BRASIL
    - "enableBlur": true/false
    - "lateralGradient": true/false

12. ENTRADAS MANUAIS & AVANÇADAS:
    - "additionalPrompt": detalhes adicionais, texturas e atmosfera em PORTUGUÊS DO BRASIL.
    - "negativePrompt": prompt negativo em PORTUGUÊS DO BRASIL para evitar ruídos.
    - "resolucao": "1K" | "2K" | "4K"
    - "formatoExportacao": "AVIF" | "PNG" | "JPEG" | "WEBP"
    - "variations": 1 a 5
    - "somentePrompt": false
    - "substituirImagens": true
    - "substituirConfig": true

REGRA DE IDIOMA MANDATÓRIA (PORTUGUÊS DO BRASIL):
Todos os campos de texto do JSON de resposta (promptCenario, promptDesign, promptTipografia, additionalPrompt, negativePrompt, poseDescription, etc.) DEVEM SER PREENCHIDOS EM PORTUGUÊS DO BRASIL para exibição direta no formulário do editor do usuário.

IMPORTANTE: Responda em português resumindo os pontos que você identificou e configurou. No FINAL da sua mensagem, inclua obrigatoriamente o bloco de código JSON completo em \`\`\`json.

Exemplo de JSON de saída:
\`\`\`json
{
  "tipoPainel": "DESIGNER",
  "desativarSujeito": false,
  "noPeople": false,
  "dimensao": "3:4",
  "enableTypography": true,
  "camadasTexto": [
    { "id": "text_1", "conteudo": "PROMOÇÃO DA SEMANA", "funcao": "Headline Principal", "fonte": "Montserrat", "cor": "#FFD700" },
    { "id": "text_2", "conteudo": "Aproveite até 50% de desconto em todo o estoque", "funcao": "Subheadline Secundário", "fonte": "Outfit", "cor": "#FFFFFF" },
    { "id": "text_3", "conteudo": "COMPRE AGORA NO SITE", "funcao": "CTA Botão", "fonte": "Inter", "cor": "#000000" }
  ],
  "typographyPosition": "CENTRO",
  "promptTipografia": "Headline em destaque na parte superior em amarelo (#FFD700), subheadline logo abaixo em branco (#FFFFFF) e botão CTA preto no rodapé.",
  "promptDesign": "Layout comercial moderno com grid limpo, contraste elevado e tipografia hierarquizada.",
  "promptCenario": "Fundo com atmosfera elegante, iluminação cinemática e profundidade de campo.",
  "additionalPrompt": "Design profissional de alta conversão, mantendo 100% dos textos originais extraídos do card.",
  "negativePrompt": "textos cortados, erros de ortografia, fontes ilegíveis, desordem visual",
  "useLogo": true,
  "useEnvRef": true,
  "cores": { "ambiente": "#111827", "recorte": "#FFD700", "complementar": "#3B82F6" },
  "coresAutomaticas": false,
  "corDominante": "#111827",
  "useCorDominante": true,
  "degradeLeitura": true,
  "sobriedade": 80,
  "enableEstiloVisual": true,
  "estilosVisuais": ["Comercial", "Clean"],
  "estiloVisualCustom": "Estilo comercial moderno de alta conversão.",
  "resolucao": "1K",
  "formatoExportacao": "PNG",
  "variations": 1,
  "somentePrompt": false,
  "substituirImagens": true,
  "substituirConfig": true
}
\`\`\`
`;

    const effectiveKey = localStorage.getItem("custom_gemini_api_key") || customApiKey || "";
    if (!checkAdminOrOpenPlan(effectiveKey)) return;
    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(effectiveKey) },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: autoFillPrompt + clientContext,
          attachedFiles: filesToSend,
          history: activeMessages.map((m, idx, arr) => ({ 
            role: m.role, 
            content: m.content,
            files: m.files ? m.files.map(f => ({
              name: f.name,
              type: f.type,
              category: f.category,
              data: (idx >= arr.length - 2) ? f.data : undefined
            })) : undefined 
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, forcedCat?: "logo" | "design" | "subject" | "scene" | "style" | "info") => {
    if (e.target.files && e.target.files.length > 0) {
      handleAttachFiles(e.target.files, forcedCat);
      e.target.value = "";
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

      // logoPosOverlay — posição de sobreposição da logo na imagem final
      const logoPosVal = getString(["logoPosOverlay", "logo_pos_overlay", "logoPosition", "logo_position", "posicaoLogo", "posicao_logo"]);
      if (logoPosVal !== undefined) {
        const posLower = logoPosVal.toLowerCase();
        if (posLower.includes("top") && posLower.includes("left")) result.logoPosOverlay = "top_left";
        else if (posLower.includes("top") && posLower.includes("right")) result.logoPosOverlay = "top_right";
        else if (posLower.includes("bottom") && posLower.includes("left")) result.logoPosOverlay = "bottom_left";
        else if (posLower.includes("bottom") && posLower.includes("right")) result.logoPosOverlay = "bottom_right";
        else if (posLower.includes("bottom") && posLower.includes("center")) result.logoPosOverlay = "bottom_center";
        else if (posLower.includes("center") || posLower.includes("centro") || posLower.includes("meio")) result.logoPosOverlay = "center";
        else if (posLower.includes("top") || posLower.includes("topo") || posLower.includes("superior")) result.logoPosOverlay = "top_center";
        else if (posLower.includes("bottom") || posLower.includes("rodapé") || posLower.includes("inferior")) result.logoPosOverlay = "bottom_center";
      }

      // logoSizeOverlay — tamanho percentual da logo na imagem final
      const logoSizeVal = configJson.logoSizeOverlay ?? configJson.logo_size_overlay ?? configJson.logoSize ?? configJson.logo_size ?? configJson.tamanhoLogo ?? configJson.tamanho_logo;
      if (logoSizeVal !== undefined && !isNaN(Number(logoSizeVal))) {
        result.logoSizeOverlay = Math.max(5, Math.min(80, Number(logoSizeVal)));
      }

      // logoInclusionType
      const logoType = getString(["logoInclusionType", "logo_inclusion_type", "tipoLogo", "tipo_logo"]);
      if (logoType !== undefined) {
        if (logoType === "overlay" || logoType === "embedded") result.logoInclusionType = logoType;
      }

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

            // Sanitize placeholder content from AI-generated text layers
            const isPlaceholder = (text: string): boolean => {
              if (!text || !text.trim()) return true;
              const t = text.trim();
              // Bracket-enclosed placeholders
              if (/^\[.*\]$/.test(t)) return true;
              // Contains bracket placeholders
              if (/\[(headline|subtítulo|subtitulo|chamada|texto|cta|inserir|rodapé|rodape|título|titulo|apoio|secundári[oa]|principal)[^\]]*\]/i.test(t)) return true;
              // Pure placeholder phrases without brackets
              if (/^(headline principal|chamada secund[áa]ria|texto de apoio|rodap[ée]|subt[ií]tulo|cta|call to action|seu t[ií]tulo|seu texto|inserir texto|your text here)$/i.test(t)) return true;
              return false;
            };

            const mappedNewLayers = configJson.camadasTexto
              .filter((item: any) => !isPlaceholder(item.conteudo))
              .map((item: any, idx: number) => ({
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
                   // Skip placeholder items
                   if (isPlaceholder(item.conteudo)) return;

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

        // LOGO PRESERVATION: If not in replace mode and the store already has a logo configured,
        // preserve the existing logo mapping unless the user explicitly asked to change it
        if (!isReplaceMode && jsonImageMap && store.useLogo && (store.logoBase64 || (store.logosList && store.logosList.length > 0))) {
          // Check if the AI is trying to remap existing logo files to non-logo types
          const existingLogoNames = (store.logosList || []).map((l: any) => l.name || l.fileName || "").filter(Boolean);
          if (existingLogoNames.length > 0) {
            existingLogoNames.forEach((logoName: string) => {
              if (jsonImageMap[logoName] && jsonImageMap[logoName] !== "logo") {
                // AI tried to remap a logo file — preserve it as logo
                jsonImageMap[logoName] = "logo";
              }
            });
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

        const hasExplicitLogo = imagesOnly.some(img => img.category === "logo");

        imagesOnly.forEach(img => {
          let styleDescription = "Referência de estilo gerada pelo assistente.";
          let targetType = "style";

          const nameLower = (img.name || "").toLowerCase();

          // 1. Categoria selecionada explicitamente pelo usuário no anexador
          if (img.category && img.category !== "info" && (img.category as string) !== "auto") {
            targetType = img.category;
          } 
          // 2. Mapeamento retornado pela IA no JSON para este arquivo específico
          else {
            let matchedKey = null;
            if (img.name && jsonImageMap[img.name]) {
              matchedKey = img.name;
            } else if (img.name) {
              matchedKey = jsonMapKeys.find(k => k.toLowerCase() === nameLower || nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower.split('.')[0]));
            }

            if (matchedKey && jsonImageMap[matchedKey]) {
              targetType = jsonImageMap[matchedKey];
            } else if (hasExplicitLogo && img.category !== "logo") {
              // Se outra imagem já foi marcada EXPLICITAMENTE como logo, esta imagem NUNCA deve ser logo!
              targetType = "design,scene,subject,style";
            } else if (imagesOnly.length === 1 && singleMappingVal) {
              targetType = singleMappingVal;
            } else if (jsonImageMap["*"]) {
              targetType = jsonImageMap["*"];
            } else if (parsedConfigJson?.imagemAnexadaTipo) {
              targetType = parsedConfigJson.imagemAnexadaTipo;
            }
            // 3. Detecção por nome do arquivo
            else if (nameLower.includes("logo") || nameLower.includes("marca") || nameLower.includes("logomarca") || nameLower.includes("logotipo") || nameLower.includes("10anos") || nameLower.includes("icon") || nameLower.includes("symbol")) {
              targetType = "logo";
            } else if (nameLower.includes("estilo") || nameLower.includes("style")) {
              targetType = "style";
            } else if (nameLower.includes("texto") || nameLower.includes("tipografia") || nameLower.includes("font")) {
              targetType = "typography";
            } else if (!hasExplicitLogo && imagesOnly.length === 1 && (textLower.includes("logo") || textLower.includes("marca") || textLower.includes("logomarca") || textLower.includes("logotipo"))) {
              // Apenas mapear por texto se houver APENAS UMA ÚNICA imagem enviada e nenhuma marcada como logo
              targetType = "logo";
            } else if (textLower.includes("estilo") || textLower.includes("style") || textLower.includes("vibe")) {
              targetType = "style";
            }
            // 4. Mapeamento Multicampo para Referência Completa (Design + Cenário + Sujeito)
            else {
              const isSubjectDisabled = updates.desativarSujeito === true || (updates.desativarSujeito === undefined && store.desativarSujeito === true);
              if (isSubjectDisabled) {
                targetType = "design,scene,style";
              } else {
                targetType = "design,scene,subject,style";
              }
            }
          }
          
          if (targetType.includes("style")) {
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
             } else if (parsedConfigJson?.promptEstilo) {
               styleDescription = parsedConfigJson.promptEstilo;
             } else if (parsedConfigJson?.estiloVisualCustom) {
               styleDescription = parsedConfigJson.estiloVisualCustom;
             } else if (parsedConfigJson?.additionalPrompt) {
               styleDescription = parsedConfigJson.additionalPrompt.substring(0, 300);
             } else {
               styleDescription = "Referência de estilo e edição fotográfica enviada.";
             }
          }

          const rawBase64 = img.data.startsWith("data:") ? img.data : `data:${img.type || "image/jpeg"};base64,${img.data}`;
          const typesList = targetType.split(",").map(t => t.trim().toLowerCase());

          if (typesList.includes("subject")) {
            newSubjects.push(rawBase64);
            subCount++;
          }
          if (typesList.includes("scene")) {
            newScenes.push(rawBase64);
            sceCount++;
          }
          if (typesList.includes("logo")) {
            newLogos.push(rawBase64);
            logCount++;
          }
          if (typesList.includes("design")) {
            newDesigns.push(rawBase64);
            desCount++;
          }
          if (typesList.includes("typography")) {
            newTypographies.push(rawBase64);
            typoCount++;
          }
          if (typesList.includes("style")) {
            // style reference
            if (isReplaceMode && styCount === 0 && store.referenciasEstilo) {
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
          if (updates && updates.useEnvRef !== undefined) {
             store.updateConfig({ useEnvRef: updates.useEnvRef });
          } else if ((store.cenariosBase64List || []).length === 0) {
             store.updateConfig({ useEnvRef: false });
          }
        }
        
        if (logCount > 0 || hasExplicitLogo) {
          const explicitLogoObj = imagesOnly.find(img => img.category === "logo");
          let rawLogoBase64 = explicitLogoObj 
            ? (explicitLogoObj.data.startsWith("data:") ? explicitLogoObj.data : `data:${explicitLogoObj.type || "image/jpeg"};base64,${explicitLogoObj.data}`)
            : (newLogos.length > 0 ? newLogos[newLogos.length - 1] : store.logoBase64);

          if (rawLogoBase64) {
            store.setLogosList([rawLogoBase64]);
            store.updateConfig({ logoBase64: rawLogoBase64, useLogo: true });
            filledItems.push(`Logo da Marca (${explicitLogoObj ? explicitLogoObj.name : "Selecionada"})`);
          }
        }

        if (typoCount > 0) {
          const currentList = isReplaceMode ? [] : (store.tipografiaRefsList || []);
          const uniqueList = Array.from(new Set([...currentList, ...newTypographies]));
          store.setTipografiaRefsList(uniqueList);
          filledItems.push(`${typoCount} Ref. Texto`);
        }
        
        if (desCount > 0) {
          const currentList = isReplaceMode ? [] : (store.designRefsList || []);
          const uniqueList = Array.from(new Set([...currentList, ...newDesigns]));
          store.setDesignRefsList(uniqueList);
          filledItems.push(`${desCount} Design(s)`);
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
      {/* Botão Flutuante Original */}
      <button
        onClick={() => {
          setChatDrawerOpen(!chatDrawerOpen);
          setIsDropdownOpen(false);
          setIsAttachMenuOpen(false);
        }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_4px_24px_rgba(197,168,128,0.25)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-black/90 border border-[#c5a880]/30 hover:border-[#c5a880]/60 text-[#c5a880]"
        title="Assistente ZION AI"
      >
        {chatDrawerOpen ? <X size={20} className="text-[#c5a880]" /> : <MessageSquare size={20} className="text-[#c5a880]" />}
        {!chatDrawerOpen && <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#c5a880]"></span>}
      </button>

      {/* Painel Interno do Assistente ZION AI */}
      {chatDrawerOpen && (
        <div className={`border border-[#c5a880]/25 bg-[#090a0f] shadow-[0_25px_80px_rgba(0,0,0,0.98)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transition-all ${isExpanded ? 'fixed inset-0 z-[100] rounded-none w-full h-full' : 'fixed sm:absolute bottom-20 right-4 left-4 sm:left-auto sm:right-0 sm:bottom-[68px] rounded-2xl sm:rounded-3xl w-[calc(100vw-32px)] sm:w-[460px] h-[600px] max-h-[85vh]'}`}>
          
          {/* Header Minimalista & Elegante */}
          <div className="shrink-0 px-4 py-3 border-b border-white/10 bg-[#0c0d14] flex items-center justify-between gap-2 relative z-20">
            {/* Seletor de Especialista */}
            <button
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsAttachMenuOpen(false); }}
              className="flex items-center gap-2.5 group cursor-pointer text-left min-w-0 flex-1 hover:opacity-90 transition-opacity"
              title="Trocar Assistente"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#ad8330] flex items-center justify-center text-zinc-950 font-black shadow-md shrink-0">
                {activeAssistant.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-[#c5a880] transition-colors truncate">
                    {activeAssistant.label}
                  </span>
                  <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#c5a880] transition-transform shrink-0" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-zinc-400 font-medium truncate">{activeAssistant.sublabel}</span>
                </div>
              </div>
            </button>

            {/* Ações Rápidas da Barra Superior */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Modelo de IA */}
              <button
                onClick={() => { setShowModelSettings(!showModelSettings); setIsDropdownOpen(false); setIsAttachMenuOpen(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
                title="Configurar Modelo de IA"
              >
                <Zap size={11} className="text-[#c5a880] fill-[#c5a880]" />
                <span>{selectedModel.includes("flash") ? "Modelo: Flash" : selectedModel.includes("image") ? "Modelo: Image" : "Modelo: Pro"}</span>
                <ChevronDown size={10} className="text-zinc-500" />
              </button>

              {/* Novo Chat */}
              <button
                onClick={() => {
                  store.createProject();
                  setChats({});
                  setAttachedFiles([]);
                  setActiveClient(null);
                  showToast("Nova conversa iniciada.", "success");
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#c5a880] hover:bg-white/5 transition-colors cursor-pointer"
                title="Nova Conversa"
              >
                <Plus size={15} />
              </button>

              {/* Histórico */}
              <button
                onClick={() => { setIsHistoryOpen(!isHistoryOpen); setIsDropdownOpen(false); setIsAttachMenuOpen(false); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isHistoryOpen ? 'text-[#c5a880] bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                title="Histórico de Conversas"
              >
                <FolderOpen size={15} />
              </button>

              {/* Expandir */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden sm:flex"
                title={isExpanded ? "Restaurar tamanho" : "Tela cheia"}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Fechar */}
              <button
                onClick={() => setChatDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ml-0.5"
                title="Fechar"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Popover de Modelos de IA */}
          {showModelSettings && (
            <div className="absolute top-14 right-4 z-50 bg-[#101218] border border-[#c5a880]/30 rounded-2xl shadow-2xl p-3 w-64 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880]">Modelo de IA</span>
                <button onClick={() => setShowModelSettings(false)} className="text-zinc-500 hover:text-white"><X size={11} /></button>
              </div>
              <div className="space-y-1">
                {[
                  { id: "gemini-3.1-pro-preview", label: "Gemini Pro 3.1", desc: "Melhor para Design e Raciocínio", icon: <Zap size={13} /> },
                  { id: "gemini-3.7-flash", label: "Gemini Flash 3.7", desc: "Ultra-rápido com Raciocínio Híbrido", icon: <Sparkles size={13} /> },
                  { id: "gemini-3-pro-image", label: "Gemini Image Pro", desc: "Engenharia de Prompts Visuais", icon: <ImageIcon size={13} /> }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setShowModelSettings(false); showToast(`Modelo: ${m.label}`, "success"); }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      selectedModel === m.id 
                        ? "bg-[#c5a880]/15 text-[#c5a880] border-[#c5a880]/40 font-bold" 
                        : "bg-black/40 text-zinc-300 hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <span className="text-[#c5a880]">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate leading-none">{m.label}</p>
                      <p className="text-[9px] text-zinc-500 truncate mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popover de Histórico de Conversas */}
          {isHistoryOpen && (
            <div className="absolute top-14 right-4 z-50 bg-[#101218] border border-[#c5a880]/30 rounded-2xl shadow-2xl p-3 w-72 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880]">Conversas Salvas</span>
                <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-500 hover:text-white"><X size={11} /></button>
              </div>
              <div className="space-y-1">
                {store.projectsList.map(p => {
                  const isCurrent = p.id === store.activeProjectId;
                  return (
                    <div 
                      key={p.id} 
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${isCurrent ? "bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880]" : "hover:bg-white/5 text-zinc-300 border border-transparent"}`}
                      onClick={() => {
                        store.loadProjectById(p.id);
                        setIsHistoryOpen(false);
                        showToast(`Conversa carregada.`, "success");
                      }}
                    >
                      <span className="text-xs font-medium truncate pr-2">{p.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.deleteProject(p.id);
                          showToast("Conversa excluída.", "success");
                          if (store.projectsList.length <= 1) setIsHistoryOpen(false);
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Overlay: Seletor de Especialistas */}
          {isDropdownOpen && (
            <div className="absolute inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
              {/* Header do Seletor */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Escolha o Especialista IA</h3>
                  <p className="text-[10px] text-zinc-400">16 especialistas treinados para cada etapa do seu fluxo</p>
                </div>
                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Busca */}
              <div className="relative mb-2.5">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="Buscar especialista..."
                  className="w-full bg-[#12141c] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Abas de Categorias */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 custom-scrollbar shrink-0">
                {[
                  { id: "all", label: "Todos" },
                  { id: "design", label: "🎨 Design" },
                  { id: "copy", label: "✍️ Copywriting" },
                  { id: "vendas", label: "📈 Vendas" },
                  { id: "dev", label: "💻 Sites" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAgentCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      agentCategoryFilter === cat.id
                        ? "bg-[#c5a880] text-zinc-950 font-extrabold shadow-sm"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Lista dos Especialistas */}
              <div className="overflow-y-auto flex-1 space-y-1.5 custom-scrollbar pr-1">
                {assistants
                  .filter(a => {
                    if (agentCategoryFilter === "design") return ["diretor-criativo", "gc-tv-specialist", "prompt-extrator", "creative-assistant", "analisador-paginas", "easy-image"].includes(a.id);
                    if (agentCategoryFilter === "copy") return ["copy-legendas-instagram", "copy-ads", "copy-carroseis", "easy-copy"].includes(a.id);
                    if (agentCategoryFilter === "vendas") return ["analise-estrategica", "icp", "atendimento", "webson-vendedor"].includes(a.id);
                    if (agentCategoryFilter === "dev") return ["estrutura-sites", "easy-coder"].includes(a.id);
                    return true;
                  })
                  .filter(a => {
                    if (!agentSearch.trim()) return true;
                    const q = agentSearch.toLowerCase();
                    return a.label.toLowerCase().includes(q) || a.sublabel.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
                  })
                  .map((a) => {
                    const isSelected = activeAssistant.id === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => switchAgent(a)}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left border ${
                          isSelected 
                            ? "bg-[#c5a880]/15 border-[#c5a880]/50 shadow-sm" 
                            : "bg-[#11131a] hover:bg-[#161922] border-white/5 hover:border-[#c5a880]/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${isSelected ? 'bg-[#c5a880] text-zinc-950' : 'bg-white/10 text-[#c5a880]'}`}>
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">{a.label}</span>
                            {isSelected && (
                              <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#c5a880] text-zinc-950 shrink-0">
                                Ativo
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-[#c5a880]/80 block truncate">{a.sublabel}</span>
                          <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{a.desc}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Área Principal de Mensagens */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 relative bg-[#07080c] custom-scrollbar"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            {/* Drag and Drop Zone */}
            {isDraggingOver && (
              <div className="absolute inset-3 bg-black/95 border-2 border-dashed border-[#c5a880] rounded-2xl flex flex-col items-center justify-center gap-2 z-30 animate-in fade-in duration-150">
                <UploadCloud size={28} className="text-[#c5a880] animate-bounce" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Solte o arquivo aqui</p>
              </div>
            )}

            {/* Empty State: Limpo, Direto e Atraente */}
            {activeMessages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center text-center px-2 py-6 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#ad8330] flex items-center justify-center text-zinc-950 shadow-lg shadow-[#c5a880]/20">
                  {activeAssistant.icon}
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-white">{activeAssistant.label}</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                    {activeAssistant.desc}
                  </p>
                </div>

                {/* 3 Sugestões Limpas */}
                <div className="w-full space-y-1.5 pt-2">
                  <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Sugestões de início:
                  </span>
                  <div className="space-y-1.5">
                    {(ASSISTANT_SUGGESTIONS[activeAssistant.id] || DEFAULT_SUGGESTIONS).slice(0, 3).map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setInputText(sug);
                          textareaRef.current?.focus();
                        }}
                        className="w-full text-xs font-medium p-2.5 rounded-xl bg-[#11131a] hover:bg-[#181b24] border border-white/5 hover:border-[#c5a880]/40 text-zinc-300 hover:text-white transition-all cursor-pointer text-left shadow-sm flex items-center justify-between gap-2 group"
                      >
                        <span className="truncate">{sug}</span>
                        <span className="text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Mensagens */}
            {activeMessages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div key={index} className={`flex flex-col gap-1.5 ${isModel ? "items-start" : "items-end"}`}>
                  
                  {/* Arquivos Renderizados Dentro da Mensagem */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-1 max-w-[85%]">
                      {msg.files.map((file, fIdx) => {
                        const isImg = file.type.startsWith("image/");
                        if (isImg) {
                          return (
                            <div key={fIdx} className="rounded-xl overflow-hidden border border-white/10 w-44 shadow-md bg-black/60 p-1">
                              <img src={`data:${file.type};base64,${file.data}`} className="w-full h-28 object-cover rounded-lg" alt={file.name} />
                            </div>
                          );
                        }
                        return (
                          <div 
                            key={fIdx} 
                            className="flex items-center gap-2 px-3 py-2 bg-[#11131a] border border-white/10 rounded-xl w-48 shadow-sm text-left"
                          >
                            <File size={15} className="text-[#c5a880] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">{file.name}</p>
                              <p className="text-[8px] text-zinc-500 uppercase mt-0.5">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Balão de Mensagem */}
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-medium shadow-sm transition-all duration-200 break-words overflow-hidden ${
                      isModel 
                        ? "bg-[#101218] border border-white/10 text-zinc-200 rounded-bl-sm" 
                        : "bg-[#18140c] border border-[#c5a880]/35 text-white rounded-br-sm shadow-md"
                    }`}
                  >
                    {isModel ? formatMessage(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>

                  {/* Ações da Mensagem da IA */}
                  {isModel && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {!isCopyOrTextAssistant && (
                        <button
                          onClick={() => {
                            applyModelMessageToEditor(index, msg.content);
                            if (onGenerateImage) {
                              onGenerateImage();
                              showToast("Gerando nova arte no estúdio...", "warning");
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all bg-gradient-to-r from-[#c5a880] to-[#ad8330] hover:brightness-110 text-zinc-950 shadow-sm"
                          title="Aplicar alterações e gerar imagem no estúdio"
                        >
                          <Zap size={11} className="fill-zinc-950 text-zinc-950" />
                          <span>Aplicar no Estúdio</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyMessageText(index, msg.content)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white"
                        title="Copiar texto"
                      >
                        {copiedMsgIndex === index ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Opção de Editar Mensagem do Usuário */}
                  {!isModel && (
                    <button
                      onClick={() => {
                        setEditingMsgIndex(index);
                        setInputText(msg.content);
                        if (msg.files && msg.files.length > 0) {
                          setAttachedFiles(msg.files.map(f => ({ ...f })));
                        }
                        setTimeout(() => {
                          textareaRef.current?.focus();
                          textareaRef.current?.select();
                        }, 80);
                      }}
                      className="text-[9px] font-semibold text-zinc-500 hover:text-[#c5a880] transition-colors cursor-pointer mr-1"
                      title="Editar mensagem"
                    >
                      Editar
                    </button>
                  )}
                </div>
              );
            })}

            {/* Indicador de Digitação */}
            {isTyping && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-zinc-950 bg-[#c5a880]">
                  {activeAssistant.icon}
                </div>
                <div className="px-3.5 py-2.5 bg-[#101218] border border-white/10 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#c5a880]" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#c5a880]" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#c5a880]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra Inferior Limpa de Entrada (Input Bar) */}
          <div className="shrink-0 p-3 border-t border-white/10 bg-[#0c0d14] relative">
            
            {/* Arquivos Anexados (Miniatura Limpa com Categoria) */}
            {attachedFiles.length > 0 && (
              <div className="flex items-center gap-2 mb-2 p-1.5 bg-[#12141c] border border-white/10 rounded-xl overflow-x-auto custom-scrollbar">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2 py-1 rounded-lg shrink-0">
                    <span className="text-[10px] font-medium text-zinc-300 truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => removeAttachedFile(idx)} className="text-zinc-500 hover:text-red-400"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Menu Popover de Anexos (quando clica no clipe) */}
            {isAttachMenuOpen && (
              <div className="absolute bottom-16 left-3 z-50 bg-[#12141c] border border-[#c5a880]/30 rounded-2xl shadow-2xl p-2 w-52 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">Anexar ao Editor:</p>
                <button
                  type="button"
                  onClick={() => { fileInputInfoRef.current?.click(); setIsAttachMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <Paperclip size={13} className="text-zinc-400" />
                  <span>📄 Arquivo / Documento</span>
                </button>
                {!isCopyOrTextAssistant && (
                  <>
                    <button
                      type="button"
                      onClick={() => { fileInputSubjectRef.current?.click(); setIsAttachMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-300 hover:bg-emerald-950/30 transition-colors text-left"
                    >
                      <span>👤 Sujeito / Pessoa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputLogoRef.current?.click(); setIsAttachMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#c5a880] hover:bg-[#c5a880]/10 transition-colors text-left"
                    >
                      <span>🏷️ Logotipo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputDesignRef.current?.click(); setIsAttachMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#c5a880] hover:bg-[#c5a880]/10 transition-colors text-left"
                    >
                      <span>📐 Referência de Design</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputSceneRef.current?.click(); setIsAttachMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#c5a880] hover:bg-[#c5a880]/10 transition-colors text-left"
                    >
                      <span>🏞️ Cenário / Fundo</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Inputs Ocultos de Arquivo */}
            <input type="file" ref={fileInputInfoRef} onChange={(e) => handleFileInput(e, "info")} className="hidden" multiple accept="*" />
            <input type="file" ref={fileInputSubjectRef} onChange={(e) => handleFileInput(e, "subject")} className="hidden" multiple accept="image/*" />
            <input type="file" ref={fileInputLogoRef} onChange={(e) => handleFileInput(e, "logo")} className="hidden" multiple accept="image/*" />
            <input type="file" ref={fileInputDesignRef} onChange={(e) => handleFileInput(e, "design")} className="hidden" multiple accept="image/*" />
            <input type="file" ref={fileInputSceneRef} onChange={(e) => handleFileInput(e, "scene")} className="hidden" multiple accept="image/*" />

            {/* Campo de Entrada com Botões Integrados */}
            <div className="flex items-end gap-1.5 bg-[#07080c] border border-white/10 focus-within:border-[#c5a880] rounded-2xl p-1.5 transition-colors">
              {/* Botão de Anexo */}
              <button
                type="button"
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${isAttachMenuOpen ? 'text-[#c5a880] bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                title="Anexar arquivos ou referências"
              >
                <Paperclip size={16} />
              </button>

              {/* Textarea */}
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
                placeholder={editingMsgIndex !== null ? "Edite sua mensagem e pressione Enter..." : `Converse com ${activeAssistant.label}...`}
                rows={1}
                className="flex-1 bg-transparent border-0 px-1 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none resize-none font-medium leading-relaxed"
                style={{ minHeight: "36px", maxHeight: "100px", scrollbarWidth: "none" }}
              />

              {/* Botão de Melhorar Prompt com IA */}
              <button
                type="button"
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt || isTyping || !inputText.trim()}
                className="p-2 rounded-xl text-zinc-400 hover:text-[#c5a880] hover:bg-white/5 transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Melhorar Prompt com Inteligência Artificial"
              >
                {isImprovingPrompt ? <Loader2 size={16} className="animate-spin text-[#c5a880]" /> : <Sparkles size={16} />}
              </button>

              {/* Botão de Enviar */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isTyping || isUploading || (inputText.trim() === "" && attachedFiles.length === 0)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-950 bg-gradient-to-r from-[#c5a880] to-[#ad8330] hover:brightness-110 cursor-pointer transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-md shadow-[#c5a880]/20"
                title="Enviar mensagem (Enter)"
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
