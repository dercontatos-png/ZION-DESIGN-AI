import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Loader2,
  Send,
  User,
  ChevronDown,
  CheckCircle2,
  Paperclip,
  X,
  Copy,
  Check,
  Save,
  Trash2,
  Film,
  Lightbulb,
  MessageSquare,
  Layers,
  Plus,
  Pin,
  Edit3,
  Search,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Image as ImageIcon,
  Folder,
  Gem,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  FileText,
  Download,
  Archive
} from "lucide-react";
import { Client } from "../types";
import { safeStorageSetItem } from "../utils/imageStorageManager";
import { VoiceInputButton } from "./VoiceInputButton";
import {
  exportSingleScriptPdf,
  exportBatchScriptsZip,
  extractScriptsFromText,
  generateScriptPdf,
  extractClientSection,
  extractEditorSection,
  extractVideoTopic
} from "../utils/scriptPdfExport";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  images?: string[];
}

export interface EditingScriptModalState {
  isOpen: boolean;
  msgId?: string;
  target: "CLIENTE" | "EDITOR";
  activeScriptIndex: number;
  scripts: { index: number; topic: string; content: string }[];
  viewMode: "split" | "editor" | "preview";
}

export interface ChatSession {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const GENERAL_CLIENT: Client = {
  id: 999,
  name: "Equipe Zion / Geral",
  niche: "Marketing & Agência",
  status: "Ativo" as const,
  contact: "Geral",
  planValue: 0,
  dueDate: "01",
  paymentStatus: "Em dia" as const,
  roteirosChat: []
};

interface PdfSheetPreviewProps {
  scriptText: string;
  clientName: string;
  target: "CLIENTE" | "EDITOR";
}

function PdfSheetPreview({ scriptText, clientName, target }: PdfSheetPreviewProps) {
  const videoTopic = extractVideoTopic(scriptText);
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const displayContent = target === "CLIENTE"
    ? extractClientSection(scriptText)
    : extractEditorSection(scriptText);

  return (
    <div className="w-full h-full overflow-y-auto pr-1 bg-zinc-950 rounded-xl border border-zinc-800 p-2 sm:p-4 selection:bg-amber-500/30">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-1">
        {/* Top Gold Stripe */}
        <div className="h-1.5 w-full bg-[#c5a880]" />

        {/* Header Banner */}
        <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#c5a880] uppercase">
                {target === "CLIENTE" ? "ROTEIRO DE VÍDEO" : "GUIA TÉCNICO DE EDIÇÃO"}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  target === "CLIENTE"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                }`}
              >
                {target === "CLIENTE" ? "📱 ROTEIRO DE VÍDEO" : "🎬 FILMMAKER & EDITOR"}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wide">
              CLIENTE: {clientName.toUpperCase()}
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              TEMA: <span className="text-zinc-200">{videoTopic}</span>
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[11px] text-zinc-400 font-mono">
              DATA: <span className="text-zinc-200">{dateStr}</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-wider">
              DOCUMENTO OFICIAL
            </div>
          </div>
        </div>

        {/* Sheet Content Body */}
        <div className="p-5 sm:p-7 space-y-4 bg-zinc-900 text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-base sm:text-lg font-extrabold text-[#c5a880] border-b border-amber-500/20 pb-1.5 mt-4 mb-2 uppercase tracking-wide">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm sm:text-base font-bold text-zinc-100 border-b border-zinc-800 pb-1 mt-3 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs sm:text-sm font-semibold text-amber-200 mt-3 mb-1">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-2 leading-relaxed text-zinc-300 font-normal">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-zinc-100">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside my-2 space-y-1 text-zinc-300 pl-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside my-2 space-y-1 text-zinc-300 pl-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="my-0.5 text-zinc-300">{children}</li>
              ),
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto rounded-xl border border-zinc-800 shadow-md">
                  <table className="w-full text-left text-xs border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#c5a880]/15 text-[#c5a880] uppercase text-[11px] font-bold border-b border-amber-500/30">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/60">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-zinc-800/40 transition-colors">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="p-2.5 font-bold tracking-wider">{children}</th>
              ),
              td: ({ children }) => (
                <td className="p-2.5 text-zinc-300 align-top leading-relaxed">
                  {children}
                </td>
              )
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>

        {/* Footer Banner */}
        <div className="bg-zinc-950 px-5 py-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
          <span className="font-medium">
            {target === "CLIENTE" ? "ROTEIRO DE VÍDEO" : "GUIA TÉCNICO DE EDIÇÃO"} • {clientName}
          </span>
          <span className="font-mono">Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}

function getClientScriptContext(activeClient: Client, crossSessionMemory: string): string {
  return `
[CONTEXTO E IDENTIDADE DO CLIENTE ATIVO]
Cliente: ${activeClient.name}
Nicho: ${activeClient.niche || "Não informado"}
Informações Extra: ${activeClient.infoExtra || "Nenhuma"}
Paleta de Cores: ${(activeClient.paletaCores || []).join(", ") || "Não informada"}

[MEMÓRIA CONTINUA DE LONGO PRAZO DO CLIENTE (${activeClient.name})]
Você é o diretor de roteiros inteligente do cliente ${activeClient.name}.
Você possui MEMÓRIA CONTINUA DE LONGO PRAZO e APRENDIZADO ACUMULADO ACROSS ALL BATE-PAPOS.
Tudo o que o usuário conversou com você em outros bate-papos deste mesmo cliente foi gravado e acumulado abaixo.
Se o usuário abriu um novo bate-papo, VOCÊ MANTÉM TODO O CONHECIMENTO, tom de voz, regras de negócio, correções e preferências que aprendeu nas conversas anteriores deste cliente.

HISTÓRICO ACUMULADO DE OUTROS BATE-PAPOS DESTE CLIENTE:
${crossSessionMemory || "Nenhuma conversa anterior registrada ainda."}

[INSTRUÇÕES DO ASSISTENTE ESTILO GEMINI DIRETOR DE ROTEIROS]
1. Responda em Português do Brasil com estilo fluido, inteligente, moderno e prestativo como o Gemini.
2. FOCO EXCLUSIVO EM ROTEIROS (FALAS & VISUAL): Entregue estritamente roteiros de vídeo. NUNCA envie blocos de código JSON, configs de flyer ou objetos de interface.
3. ESTRUTURA MANDATÓRIA COM TÉCNICA AIDA (ATENÇÃO, INTERESSE, DESEJO, AÇÃO): Todo vídeo DEVE ser construído rigorosamente sobre a estrutura AIDA combinada com Início, Meio e Fim:
   - **A - ATENÇÃO (Início / Gatilho de 0 a 3s)**: Prenda o público imediatamente com ganchos disruptivos, quebrando padrões de pensamento ou iniciando com fofocas e conflitos.
   - **I - INTERESSE (Meio / Desenvolvimento)**: Conecte-se com a dor do público e crie uma progressão dramática para apresentar a oportunidade.
   - **D - DESEJO (Meio / Desenvolvimento)**: Desperte um desejo ardente através de descrições sensoriais e benefícios irresistíveis do produto/serviço do cliente.
   - **A - AÇÃO (Fim / Chamada para Ação - CTA)**: Faça um fechamento com uma ação direta, urgente e irresistível focada em converter.
4. OBRIGATÓRIO ENTREGAR 2 VERSÕES EM CADA ROTEIRO:
   a) 📱 **1. ROTEIRO PARA O CLIENTE**: Versão limpa, focada EXCLUSIVAMENTE nas falas e texto do apresentador para o cliente aprovar a mensagem do vídeo. DEVE conter:
      - TEMA DO VÍDEO: [Tema curto e explicativo do vídeo]
      - Estruturado estritamente em:
        * ATENÇÃO / INÍCIO (Gatilho de 0 a 3s) -> APENAS a fala do apresentador: - FALA & ÁUDIO: "..."
        * INTERESSE & DESEJO / MEIO (Desenvolvimento) -> APENAS a fala do apresentador: - FALA & ÁUDIO: "..."
        * AÇÃO / FIM (Chamada para Ação / CTA) -> APENAS a chamada para ação do apresentador: - FALA & ÁUDIO: "..."
      - ESTREITAMENTE PROIBIDO incluir descrições visuais, ações do apresentador, cortes ou movimentos de câmera (ex: "Pâmela aparece sorrindo...", "Takes rápidos...") nesta seção do cliente. Todas as ações visuais e de gravação pertencem 100% à versão do editor!
   b) 🎬 **2. ROTEIRO COMPLETO PARA O EDITOR & GRAVAÇÃO**: Guia técnico completo com todos os detalhes de como deve ser gravado e editado o vídeo:
      - Especificações Técnicas de Gravação (Enquadramento, Ângulo de Câmera, Iluminação, Tom e Ritmo da Fala, Posição no Cenário, Microfone/Lapela Lark M2 em modo luz azul para preservar textura natural).
      - Tabela Markdown Completa com 4 colunas: (Cena / Tempo | Visual & B-Roll / Câmera | Fala & Áudio | Texto na Tela, SFX & Cortes)
      - Diretrizes Detalhadas de Pós-Produção & Edição no CapCut (Uso de Keyframes para zoom dinâmico em takes estáticos, Match Cuts com post-it/objetos, Efeito Obturador Lento / Low Shutter, Filtros de Cor 'Conto de Verão' + 'Retrô Americano', Isolamento de Voz no CapCut + Efeito 'Super Grave'/'Podcast', e sincronia de texto palavra por palavra).
5. MÉTODO & STORYTELLING DE ALTA RETENÇÃO (FÓRMULA PERSUASIVA AIDA + GIULLYA BECKER):
   - **Ganchos Disruptivos & Tensão (Atenção)**: Iniciar quebrando padrões ou expondo contradições ("Você não cresce porque está sendo consistente do jeito errado", "Sem blazer!").
   - **3 Estímulos de Retenção e Venda (Interesse & Desejo)**: 1. Reconhecimento (identificação com a dor do público), 2. Progressão (Tensão -> Erro -> Consequência -> Virada/Solução) e 3. Continuidade (o CTA é a evolução natural do assunto).
   - **Fofoca & Abertura em Conflito (Atenção/Interesse)**: Começar no meio da ação ou com um looping de curiosidade indestrutível.
   - **Autoridade Percebida (Efeito HALO)**: Trazer evidências reais, bastidores e pontos de vista próprios ("Eu testei X e o resultado foi Y"), evitando jargões genéricos de IA ("virada de chave", "saia da caixa").
6. NUNCA insira os termos "Zion AI Studio" ou "RUÍDO ZERO" no texto do roteiro nem em títulos. Mantenha um tom limpo e extremamente profissional.
7. Leve sempre em consideração os aprendizados e a Base de Conhecimento acumulada sobre o cliente ${activeClient.name}.
8. QUANDO GERAR MÚLTIPLOS ROTEIROS DE UMA VEZ (ex: 2, 3, 4 ou mais roteiros):
   - Inicie cada roteiro obrigatoriamente com um cabeçalho claro: "### ROTEIRO 1: [TEMA/TÍTULO]", "### ROTEIRO 2: [TEMA/TÍTULO]", etc.
   - Cada bloco de roteiro deve conter as suas duas versões completas (1. ROTEIRO PARA O CLIENTE e 2. ROTEIRO COMPLETO PARA O EDITOR).
9. QUANDO O USUÁRIO PEDIR PARA MELHORAR/AJUSTAR UM ROTEIRO ESPECÍFICO (ex: 'melhore o roteiro 1', 'melhore o roteiro 2', 'ajuste o roteiro 3'):
   - Identifique qual roteiro foi solicitado.
   - Retorne a versão melhorada com o cabeçalho correspondente (ex: "### ROTEIRO 1 (VERSÃO MELHORADA): [TEMA DO VÍDEO]").
   - Forneça o roteiro aprimorado completo contendo ambas as seções (Cliente e Editor) refinadas.
10. VOCABULÁRIO HUMANO, NATURAL, PROFISSIONAL E POPULAR (PROIBIÇÃO RIGOROSA DE PALAVRAS ESTRANHAS, GÍRIAS INADEQUADAS, ANGLICISMOS E IA ROBÓTICA):
   - É STRICTLY PROIBIDO usar palavras pomposas, artificiais ou robóticas ("abundância", "abundante", "recusa economizar", "sem miséria", "revolucionar", "transforme", "empolgante", "saia da caixa", "virada de chave", "potencializar", "experiência única", "deleitar", "ímpar", "sublime").
   - PROIBIÇÃO ABSOLUTA DE GÍRIAS NÃO PROFISSIONAIS E ANGLICISMOS / TERMOS EM INGLÊS NA FALA:
     * NUNCA use "lotada de" ou "lotado de" (soa informal/não profissional). Prefira termos apetitosos e elegantes: "super recheada", "muito recheada", "bem recheada", "recheio caprichado", "recheado de verdade".
     * NUNCA use termos em inglês ou anglicismos como "upgrade", "feedbacks", "highlights", "outfit", "target", "mindset" nas falas do vídeo! O público das redes sociais precisa entender tudo instantaneamente em português simples e natural (ex: em vez de "dar um upgrade", use "pra quem quer um combo ainda mais completo").
   - PROIBIÇÃO ABSOLUTA DE METÁFORAS ERRADAS E EXPRESSÕES FORÇADAS NA FALA:
     * NUNCA crie expressões fisicamente sem sentido como "esfiha esticando" (esfiha e massa não esticam!).
     * NUNCA coloque a expressão "queijo puxando" como adjetivo na fala do áudio (ex: "pastel com queijo puxando" é uma frase estranha e não-natural na fala!). A ação de "puxar o queijo" é estritamente uma orientação VISUAL/B-ROLL da gravação.
     * Na fala do apresentador, use linguagem oral fluida, natural e apetitosa.
11. ORIGINALIDADE OBRIGATÓRIA E PROIBIÇÃO ABSOLUTA DE REPETIÇÃO DE CONTEÚDO E BORDÕES:
   - CADA ROTEIRO DEVE SER 100% INÉDITO E TER UM CONCEITO TOTALMENTE NOVO!
   - NUNCA repita os mesmos bordões, frases fixas ou adjetivos em vídeos diferentes do mesmo cliente (JAMAIS repita adjetivos como "queijo derretido" ou "massa fininha" em todos os roteiros!).
   - VARIE DIVERSAMENTE O VOCABULÁRIO SENSORIAL A CADA VÍDEO: Alterne o foco e os atributos (ex: um vídeo foca no "recheio farto e saboroso", outro no "sabor caseiro artesanal", outro na "massa crocante por fora e macia por dentro", outro no "tempero especial no ponto certo", outro no "aroma irresistível saindo do forno", outro no "molho de tomate especial da casa", outro nas "opções doces pra sobremesa").
   - NUNCA copie literalmente os exemplos dados nestas instruções. Use a sua criatividade para gerar scripts autênticos, variados e dinâmicos.
12. CHAMADA PARA AÇÃO (CTA) UNIVERSAL PARA REDES SOCIAIS / REELS / TIKTOK:
   - NUNCA assuma que existe um "botão aqui embaixo" ou "botão abaixo" no vídeo (vídeos orgânicos no Reels, TikTok e Instagram NÃO têm botões de compra no vídeo!).
   - USE SEMPRE CHAMADAS PARA AÇÃO (CTA) UNIVERSAIS E NATURAIS PARA DELIVERY E NEGÓCIOS LOCAIS, TUDO FOCADO NO LINK DA BIO, DIRECT OU WHATSAPP. Exemplos ideais:
      * "Acesse o link no nosso perfil e peça o seu pelo delivery!"
      * "Chame a gente no WhatsApp ou acesse o link no perfil!"
      * "Não passe vontade: o link para o nosso cardápio está na bio!"
 13. RIGOROSA CORREÇÃO GRAMATICAL, ZERO ERROS DE CONCORDÂNCIA E PORTUGUÊS IMPECÁVEL:
   - Respeite de forma absoluta e rigorosa as regras de gramática, ortografia, pontuação, acentuação e concordância verbal e nominal do Português do Brasil em todo o texto e em TODAS as falas do apresentador.
   - PROIBIÇÃO TOTAL DE ERROS DE CONCORDÂNCIA: Garanta que o sujeito concorde perfeitamente com o verbo (ex: "Eles querem", "Nós fazemos", "As novidades chegaram") e que os adjetivos e determinantes concordem em gênero e número com os substantivos (ex: "Esfihas deliciosas", "Cardápio variado", "Preços especiais").
   - REVISÃO MINUCIOSA ANTI-ERROS: Faça uma dupla validação interna de cada frase gerada para garantir que não haja letras faltando, digitações erradas (typos), cacofonias ou desvios da norma padrão do português falado de forma elegante e fluida nas redes sociais.
   - UNIFORMIDADE DOS PRONOMES E VERBOS (VOCÊ): Ao tratar o espectador por "você", mantenha a concordância gramatical uniforme de 3ª pessoa nos verbos do imperativo ("você ama... experimente os nossos... peça o seu... acesse o link... garanta o seu... não perca"). NUNCA misture "você ama" com imperativos da 2ª pessoa ("pede/clica").
   - IMPERATIVO NEGATIVO CORRETO: Em frases negativas com "não", use o imperativo negativo correto no subjuntivo para a pessoa "você":
     * Use "Não passe vontade" (JAMAIS "não passa vontade").
     * Use "Não perca tempo" (JAMAIS "não perde tempo").
     * Use "Não deixe para depois" (JAMAIS "não deixa para depois").
   - CONCORDÂNCIA VERBAL NO PLURAL E CAPITALIZAÇÃO CORRETA:
     * Use "Não podem faltar as esfihas doces" ou "As doces não podem faltar" (JAMAIS "não pode faltar as doces").
     * Use "Chegaram as novidades" (JAMAIS "chegou as novidades").
     * NUNCA use letras maiúsculas em substantivos comuns no meio da frase (ex: escreva "A reunião com os amigos", JAMAIS "A Reunião com os amigos").
   - NOME DO CLIENTE E MARCAS:
     * NUNCA coloque aspas duplas desconfiguradas em nomes de marcas (ex: ESCREVA "CLIENTE: ESFIHA'S HOUSE" com apóstrofo simples ', JAMAIS ESFIHA"S HOUSE).
`;
}

export function GeradorRoteiros({
  clients,
  setClients,
  savedNotes = [],
  setSavedNotes,
  saveToFirestoreDirectly
}: {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  savedNotes?: any[];
  setSavedNotes?: (notes: any[]) => void;
  saveToFirestoreDirectly?: (fields: any) => Promise<void>;
}) {
  const availableClients = [
    GENERAL_CLIENT,
    ...clients.filter((c) => c.id !== 999)
  ];

  // Active client ID
  const [activeClientId, setActiveClientId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("zion_active_roteiros_client_id");
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num)) return num;
      }
    } catch (e) {}
    return availableClients[0].id;
  });

  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showHeaderClientSelector, setShowHeaderClientSelector] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
  const [attachedImages, setAttachedImages] = useState<{ url: string; mimeType: string }[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for editing script manually with Live PDF Preview
  const [editingScriptModal, setEditingScriptModal] = useState<EditingScriptModalState | null>(null);

  // In-place script refinement state (updates existing script in place without creating new messages at bottom)
  const [activeRefinePanel, setActiveRefinePanel] = useState<{
    msgId: string;
    scriptIndex: number;
    topic: string;
  } | null>(null);
  const [customRefinePrompt, setCustomRefinePrompt] = useState<string>("");
  const [refineAttachedFiles, setRefineAttachedFiles] = useState<{ url: string; mimeType: string; name?: string }[]>([]);
  const [refiningScriptKey, setRefiningScriptKey] = useState<string | null>(null);
  const [isModalRefining, setIsModalRefining] = useState<boolean>(false);
  const [modalRefineInput, setModalRefineInput] = useState<string>("");

  // User prompt editing states
  const [editingUserMsgId, setEditingUserMsgId] = useState<string | null>(null);
  const [editingUserMsgText, setEditingUserMsgText] = useState<string>("");

  // Sidebar & Search State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active client reference
  const activeClient =
    availableClients.find((c) => c.id === activeClientId) || availableClients[0];

  // Retrieve sessions for active client
  const getClientSessions = (): ChatSession[] => {
    let rawData: any = null;

    try {
      const sessStr = localStorage.getItem(`zion_roteiros_sessions_${activeClient.id}`);
      if (sessStr) {
        const parsed = JSON.parse(sessStr);
        if (Array.isArray(parsed) && parsed.length > 0) rawData = parsed;
      }
    } catch (e) {}

    if (!rawData && activeClient && Array.isArray(activeClient.roteirosChat) && activeClient.roteirosChat.length > 0) {
      rawData = activeClient.roteirosChat;
    }

    if (!rawData) {
      try {
        const backup = localStorage.getItem(`zion_roteiros_history_${activeClient.id}`);
        if (backup) {
          const parsed = JSON.parse(backup);
          if (Array.isArray(parsed) && parsed.length > 0) rawData = parsed;
        }
      } catch (e) {}
    }

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [
        {
          id: `sess-${activeClient.id}-${Date.now()}`,
          title: "Conversa Principal",
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        }
      ];
    }

    const isSessionArray = rawData[0] && typeof rawData[0] === "object" && "messages" in rawData[0];
    if (isSessionArray) {
      return rawData as ChatSession[];
    } else {
      return [
        {
          id: `sess-${activeClient.id}-legacy`,
          title: "Conversa Principal",
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: rawData as Message[]
        }
      ];
    }
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => getClientSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const initS = getClientSessions();
    return initS[0] ? initS[0].id : `sess-${activeClientId}-${Date.now()}`;
  });

  // Knowledge Vault Modal State
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  // Read initial Knowledge for active client
  const loadClientKnowledge = (clientId: number, clientObj: Client): string => {
    let savedK = "";
    try {
      savedK = localStorage.getItem(`zion_client_knowledge_${clientId}`) || "";
    } catch (e) {}

    if (!savedK && clientObj) {
      savedK = clientObj.bancoDeDadosIA || clientObj.infoExtra || clientObj.notes || "";
    }
    return savedK;
  };

  const [knowledgeText, setKnowledgeText] = useState<string>(() =>
    loadClientKnowledge(activeClientId, activeClient)
  );

  // Re-sync Knowledge when activeClientId changes
  useEffect(() => {
    const loadedK = loadClientKnowledge(activeClientId, activeClient);
    setKnowledgeText(loadedK);
  }, [activeClientId, activeClient]);

  // Save Knowledge permanently to localStorage, Client object, and Firestore/Supabase
  const saveClientKnowledge = (newKnowledgeText: string) => {
    setKnowledgeText(newKnowledgeText);
    try {
      safeStorageSetItem(`zion_client_knowledge_${activeClient.id}`, newKnowledgeText);
    } catch (e) {}

    let updatedClients: Client[];
    if (clients.some((c) => c.id === activeClient.id)) {
      updatedClients = clients.map((c) =>
        c.id === activeClient.id
          ? {
              ...c,
              bancoDeDadosIA: newKnowledgeText,
              infoExtra: newKnowledgeText
            }
          : c
      );
    } else {
      updatedClients = [
        {
          ...activeClient,
          bancoDeDadosIA: newKnowledgeText,
          infoExtra: newKnowledgeText
        },
        ...clients
      ];
    }

    setClients(updatedClients);

    try {
      safeStorageSetItem("zion_clients", JSON.stringify(updatedClients));
    } catch (e) {}

    if (saveToFirestoreDirectly) {
      saveToFirestoreDirectly({ clients: updatedClients });
    }
  };

  // Helper to auto-append new facts into knowledgeText if user pastes menu/info in chat
  const autoAppendKnowledgeFromMessage = (userPrompt: string) => {
    if (!userPrompt || userPrompt.trim().length < 15) return;
    const lower = userPrompt.toLowerCase();

    const containsFacts =
      lower.includes("cardapio") ||
      lower.includes("cardápio") ||
      lower.includes("preço") ||
      lower.includes("preco") ||
      lower.includes("valor") ||
      lower.includes("r$") ||
      lower.includes("promoção") ||
      lower.includes("promocao") ||
      lower.includes("unidade") ||
      lower.includes("loja") ||
      lower.includes("filial") ||
      lower.includes("pâmela") ||
      lower.includes("letícia") ||
      lower.includes("cuscuz") ||
      lower.includes("esfiha") ||
      lower.includes("tapioca") ||
      lower.includes("pastel") ||
      lower.includes("combo") ||
      lower.includes("horário") ||
      lower.includes("horario") ||
      lower.includes("regras") ||
      lower.includes("equipe") ||
      lower.includes("transcrição") ||
      lower.includes("transcricao") ||
      lower.includes("conhecimento") ||
      lower.includes("vídeo") ||
      lower.includes("diretriz") ||
      lower.includes("diretrizes") ||
      lower.includes("método") ||
      lower.includes("enquadramento") ||
      lower.includes("storytelling") ||
      lower.includes("gatilho") ||
      lower.includes("julia becker") ||
      lower.includes("salve") ||
      lower.includes("guarde") ||
      lower.includes("lembre") ||
      lower.includes("grave") ||
      lower.includes("memorize") ||
      lower.includes("aprenda") ||
      lower.includes("informação") ||
      lower.includes("informacao") ||
      lower.includes("público-alvo") ||
      lower.includes("publico-alvo");

    if (containsFacts) {
      let currentK = knowledgeText || "";
      const snippet = userPrompt.trim().slice(0, 40);
      if (!currentK.includes(snippet)) {
        const timestamp = new Date().toLocaleDateString("pt-BR");
        const entry = `\n\n[INFORMAÇÕES & MÉTODO REGISTRADOS EM ${timestamp}]:\n${userPrompt.trim()}`;
        const updatedK = (currentK + entry).trim();
        saveClientKnowledge(updatedK);
        showToast("Novo conhecimento memorizado automaticamente! 🧠");
      }
    }
  };

  // Calculate total interaction count across all chats for active client
  const totalClientMessages = sessions.reduce((acc, s) => acc + (s.messages ? s.messages.length : 0), 0);

  // Cross-session long-term memory builder for active client
  const getClientCrossSessionMemory = (): string => {
    // 1. Permanent Knowledge Base (Stored permanently on client object / localStorage)
    let persistentKnowledge = "";
    try {
      persistentKnowledge = localStorage.getItem(`zion_client_knowledge_${activeClient.id}`) || "";
    } catch (e) {}

    const clientInfoExtra = activeClient.infoExtra || "";
    const clientBancoIA = activeClient.bancoDeDadosIA || "";
    const clientNotes = activeClient.notes || "";

    const combinedPermanent = Array.from(
      new Set(
        [persistentKnowledge, clientBancoIA, clientInfoExtra, clientNotes, knowledgeText]
          .map((t) => (t ? t.trim() : ""))
          .filter(Boolean)
      )
    ).join("\n\n");

    // 2. Chat session summaries
    const sessionSummaries = (sessions || [])
      .map((s) => {
        const msgs = s.messages || [];
        if (msgs.length === 0) return null;

        const userPrompts = msgs
          .filter((m) => m.sender === "user")
          .map((m) => m.text)
          .slice(-6)
          .join(" | ");

        const aiOutputs = msgs
          .filter((m) => m.sender === "ai")
          .map((m) => m.text.slice(0, 350))
          .slice(-3)
          .join(" | ");

        return `• Bate-papo: "${s.title}" (${s.messages.length} msgs)
  - Interações do usuário: ${userPrompts}
  - Principais roteiros/respostas geradas pelo Gemini: ${aiOutputs}`;
      })
      .filter(Boolean);

    let finalMemory = "";
    if (combinedPermanent) {
      finalMemory += `=== BASE DE CONHECIMENTO PERMANENTE DA EMPRESA/CLIENTE (${activeClient.name.toUpperCase()}) ===
[ATENÇÃO GEMINI: ESTAS INFORMAÇÕES SÃO A BASE DE CONHECIMENTO PERMANENTE E FIXA DA EMPRESA DO CLIENTE. ELAS NUNCA SÃO APAGADAS E DEVEM SER USADAS COMO VERDADE ABSOLUTA EM TODOS OS ROTEIROS (CARDÁPIO, UNIDADES, APRESENTADORAS, PRODUTOS, PREÇOS, REGRAS)]:

${combinedPermanent}\n\n`;
    }

    if (sessionSummaries.length > 0) {
      finalMemory += `=== HISTÓRICO RECENTE DAS CONVERSAS DA SESSÃO ===\n${sessionSummaries.join("\n\n---\n\n")}`;
    }

    return finalMemory;
  };

  // Re-sync sessions when activeClientId changes
  useEffect(() => {
    if (!availableClients.some((c) => c.id === activeClientId)) {
      const firstId = availableClients[0].id;
      setActiveClientId(firstId);
      localStorage.setItem("zion_active_roteiros_client_id", String(firstId));
    }
    const loaded = getClientSessions();
    setSessions(loaded);
    if (loaded.length > 0) {
      setActiveSessionId(loaded[0].id);
    }
  }, [activeClientId]);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: `sess-${activeClient.id}-${Date.now()}`,
    title: "Nova Conversa",
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  const chatHistory = activeSession.messages || [];

  // Save sessions to storage & state
  const saveSessions = (newSessions: ChatSession[], targetActiveId?: string) => {
    setSessions(newSessions);
    const currId = targetActiveId || activeSessionId;

    try {
      safeStorageSetItem(`zion_roteiros_sessions_${activeClient.id}`, JSON.stringify(newSessions));
      const activeS = newSessions.find((s) => s.id === currId) || newSessions[0];
      if (activeS) {
        safeStorageSetItem(`zion_roteiros_history_${activeClient.id}`, JSON.stringify(activeS.messages));
      }
    } catch (e) {}

    let updatedClients: Client[];
    if (clients.some((c) => c.id === activeClient.id)) {
      updatedClients = clients.map((c) =>
        c.id === activeClient.id ? { ...c, roteirosChat: newSessions as any } : c
      );
    } else {
      updatedClients = [{ ...activeClient, roteirosChat: newSessions as any }, ...clients];
    }

    setClients(updatedClients);

    try {
      safeStorageSetItem("zion_clients", JSON.stringify(updatedClients));
    } catch (e) {}

    if (saveToFirestoreDirectly) {
      saveToFirestoreDirectly({ clients: updatedClients });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isGenerating]);

  // Session Handlers
  const handleCreateNewSession = () => {
    const newSess: ChatSession = {
      id: `sess-${activeClient.id}-${Date.now()}`,
      title: "Nova conversa",
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    const updated = [newSess, ...sessions];
    setActiveSessionId(newSess.id);
    saveSessions(updated, newSess.id);
    showToast("Nova conversa criada!");
  };

  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sessions.length <= 1) {
      const reset = sessions.map((s) =>
        s.id === id
          ? { ...s, messages: [], title: "Nova conversa", updatedAt: new Date().toISOString() }
          : s
      );
      saveSessions(reset, id);
      showToast("Conversa limpada.");
      return;
    }

    const updated = sessions.filter((s) => s.id !== id);
    const nextActiveId = activeSessionId === id ? updated[0].id : activeSessionId;
    setActiveSessionId(nextActiveId);
    saveSessions(updated, nextActiveId);
    showToast("Conversa excluída.");
  };

  const handleStartRename = (session: ChatSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, title: editingTitle.trim(), updatedAt: new Date().toISOString() } : s
    );
    saveSessions(updated);
    setEditingSessionId(null);
    showToast("Conversa renomeada!");
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, pinned: !s.pinned } : s
    );
    saveSessions(updated);
    const target = updated.find((s) => s.id === id);
    showToast(target?.pinned ? "Conversa fixada no topo! 📌" : "Conversa desfixada.");
  };

  const handleSelectClient = (clientId: number) => {
    setActiveClientId(clientId);
    localStorage.setItem("zion_active_roteiros_client_id", String(clientId));
    setShowClientSelector(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImages((prev) => [
            ...prev,
            { url: event.target!.result as string, mimeType: file.type }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRefineFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRefineAttachedFiles((prev) => [
            ...prev,
            { url: event.target!.result as string, mimeType: file.type, name: file.name }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeRefineAttachment = (index: number) => {
    setRefineAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    showToast("Texto copiado!");
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleSaveToNotes = (text: string, msgId: string) => {
    try {
      const existing = localStorage.getItem("zion_saved_notes");
      const notesList = existing ? JSON.parse(existing) : (savedNotes || []);
      const newNote = {
        id: Date.now().toString(),
        clientName: activeClient.name,
        title: `Roteiro ${activeClient.name} - ${new Date().toLocaleDateString("pt-BR")}`,
        content: text,
        createdAt: new Date().toLocaleDateString("pt-BR")
      };
      const updatedNotes = [newNote, ...notesList];
      
      if (setSavedNotes) {
        setSavedNotes(updatedNotes);
      }
      localStorage.setItem("zion_saved_notes", JSON.stringify(updatedNotes));

      if (saveToFirestoreDirectly) {
        saveToFirestoreDirectly({ savedNotes: updatedNotes });
      }

      setSavedMsgId(msgId);
      showToast("Salvo em Notas & Supabase!");
      setTimeout(() => setSavedMsgId(null), 2500);
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar nota.");
    }
  };

  const handleDownloadTxt = (text: string) => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Roteiro_${activeClient.name.replace(/\s+/g, "_")}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Roteiro baixado em TXT!");
    } catch (e) {
      showToast("Erro ao baixar TXT.");
    }
  };

  const handleDownloadPdf = (
    text: string,
    target: "CLIENTE" | "EDITOR" = "CLIENTE",
    customFileName?: string
  ) => {
    try {
      showToast(target === "CLIENTE" ? "Gerando PDF para Cliente (Aprovação)..." : "Gerando PDF para Editor (Edição)...");
      exportSingleScriptPdf(text, activeClient.name, target, customFileName);
      showToast(target === "CLIENTE" ? "PDF Cliente baixado! 📱" : "PDF Editor baixado! 🎬");
    } catch (e) {
      console.error(e);
      showToast("Erro ao gerar PDF.");
    }
  };

  const handleDownloadBatchZip = async (text: string) => {
    try {
      showToast("Gerando lote de PDFs (.zip)...");
      await exportBatchScriptsZip(text, activeClient.name);
      showToast("Lote de PDFs baixado (.zip)! 📦");
    } catch (e) {
      console.error(e);
      showToast("Erro ao gerar ZIP.");
    }
  };

  const openEditPdfModal = (
    fullText: string,
    msgId?: string,
    initialScriptIndex?: number,
    initialTarget: "CLIENTE" | "EDITOR" = "CLIENTE"
  ) => {
    const extracted = extractScriptsFromText(fullText);
    let scriptItems: { index: number; topic: string; content: string }[] = [];

    if (extracted.length > 0) {
      scriptItems = extracted.map((item) => ({
        index: item.index,
        topic: item.topic,
        content: item.content
      }));
    } else {
      scriptItems = [{ index: 1, topic: "Roteiro 1", content: fullText }];
    }

    const targetIdx = initialScriptIndex !== undefined
      ? initialScriptIndex
      : scriptItems[0]?.index || 1;

    setEditingScriptModal({
      isOpen: true,
      msgId,
      target: initialTarget,
      activeScriptIndex: targetIdx,
      scripts: scriptItems,
      viewMode: "split"
    });
  };

  const handleSaveEditedScriptToMessage = () => {
    if (!editingScriptModal || !editingScriptModal.msgId) return;

    const { msgId, scripts } = editingScriptModal;

    setSessions((prevSessions) => {
      const nextSessions = prevSessions.map((s) => {
        if (s.id !== activeSession.id) return s;

        const updatedMessages = s.messages.map((m) => {
          if (m.id !== msgId) return m;

          const newFullText = scripts.length > 1
            ? scripts.map((item) => item.content).join("\n\n---\n\n")
            : scripts[0]?.content || m.text;

          return { ...m, text: newFullText };
        });

        return { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() };
      });

      try {
        safeStorageSetItem(`zion_roteiros_sessions_${activeClient.id}`, JSON.stringify(nextSessions));
      } catch (e) {}

      return nextSessions;
    });

    showToast("Alterações salvas na conversa! 💾");
  };

  const handleInPlaceRefineScript = async (
    msgId: string,
    scriptIndex: number,
    instructionPrompt: string
  ) => {
    const textToSend = instructionPrompt.trim();
    if (!textToSend) return;

    const targetMsg = chatHistory.find((m) => m.id === msgId);
    if (!targetMsg) return;

    const extracted = extractScriptsFromText(targetMsg.text);
    let scriptItems: { index: number; topic: string; content: string }[] = [];

    if (extracted.length > 0) {
      scriptItems = extracted.map((item) => ({
        index: item.index,
        topic: item.topic,
        content: item.content
      }));
    } else {
      scriptItems = [{ index: 1, topic: "Roteiro 1", content: targetMsg.text }];
    }

    const targetScript = scriptItems.find((s) => s.index === scriptIndex) || scriptItems[0];
    if (!targetScript) return;

    const filesToSend = refineAttachedFiles.map((f) => ({
      data: f.url.includes(",") ? f.url.split(",")[1] : f.url,
      mimeType: f.mimeType || "image/jpeg"
    }));

    const scriptKey = `${msgId}-${scriptIndex}`;
    setRefiningScriptKey(scriptKey);
    setActiveRefinePanel(null);
    setCustomRefinePrompt("");
    setRefineAttachedFiles([]); // Clear early or right after capturing to avoid state carryover
    showToast(`Aprimorando Roteiro ${scriptIndex} com IA no mesmo local... ✨`);

    try {
      const crossSessionMemory = getClientCrossSessionMemory();
      const clientContext = getClientScriptContext(activeClient, crossSessionMemory);

      const systemPrompt = `Você é um roteirista sênior de conteúdo para vídeos curtos (Reels/TikTok).
RECRIE TOTALMENTE DO ZERO (RECONSTRUA COMPLEMENTE) O ROTEIRO ESPECÍFICO ABAIXO com base nas novas solicitações/instruções do usuário${filesToSend.length > 0 ? " e nos arquivos/referências anexados" : ""}.
Mantenha a estrutura de alta conversão do roteiro (Visão Geral, Apresentador com falas naturais, B-roll, Tabela de Edição de Vídeo/Áudio, CTA e Especificações Técnicas).

SOLICITAÇÃO DE COMO RECRIAR O ROTEIRO DO ZERO:
"${textToSend}"

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o novo roteiro recriado em Markdown bem formatado.
2. Não inclua mensagens de conversa antes ou depois do roteiro.
3. Garanta português do Brasil correto, imperativos uniformes ("você") e linguagem fluida.
4. Respeite as informações do cliente:
${clientContext}

ROTEIRO ORIGINAL DE REFERÊNCIA (QUE DEVE SER DESCARTADO E SUBSTITUÍDO POR ESTE NOVO DO ZERO):
${targetScript.content}`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "gerador-roteiros",
          message: systemPrompt,
          attachedFiles: filesToSend,
          history: [],
          modelId: selectedModel
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Falha na comunicação com o servidor.");
      }

      const data = await res.json();
      const newScriptContent = data.response?.trim();

      if (!newScriptContent) {
        throw new Error("Resposta da IA vazia.");
      }

      // Replace ONLY this script's content in the extracted array
      const updatedScripts = scriptItems.map((item) =>
        item.index === scriptIndex ? { ...item, content: newScriptContent } : item
      );

      // Reassemble the full message markdown
      const newFullText = updatedScripts.length > 1
        ? updatedScripts.map((s) => s.content).join("\n\n---\n\n")
        : updatedScripts[0].content;

      // Update message in place in active session
      setSessions((prevSessions) => {
        const nextSessions = prevSessions.map((s) => {
          if (s.id !== activeSession.id) return s;

          const updatedMessages = s.messages.map((m) =>
            m.id === msgId ? { ...m, text: newFullText } : m
          );

          return { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() };
        });

        try {
          safeStorageSetItem(`zion_roteiros_sessions_${activeClient.id}`, JSON.stringify(nextSessions));
        } catch (e) {}

        return nextSessions;
      });

      showToast(`Roteiro ${scriptIndex} aprimorado no mesmo local! 🎯`);
    } catch (err: any) {
      console.error(err);
      showToast(`Erro ao refinar: ${err.message || "Tente novamente."}`);
    } finally {
      setRefiningScriptKey(null);
    }
  };

  const handleModalRefineScriptWithAI = async (instruction: string) => {
    if (!editingScriptModal || !instruction.trim()) return;

    const { activeScriptIndex, scripts, msgId } = editingScriptModal;
    const activeScript = scripts.find((s) => s.index === activeScriptIndex) || scripts[0];
    if (!activeScript) return;

    setIsModalRefining(true);
    showToast(`Refinando Roteiro ${activeScriptIndex} com IA...`);

    try {
      const crossSessionMemory = getClientCrossSessionMemory();
      const clientContext = getClientScriptContext(activeClient, crossSessionMemory);

      const systemPrompt = `Você é um roteirista sênior de conteúdo para vídeos curtos (Reels/TikTok).
RECRIE TOTALMENTE DO ZERO (RECONSTRUA COMPLEMENTE) O ROTEIRO ESPECÍFICO ABAIXO com base na solicitação do usuário.
Mantenha a estrutura de alta conversão do roteiro (Apresentador com falas naturais, B-roll, Tabela de Edição, CTA e Especificações Técnicas).

SOLICITAÇÃO DE COMO RECRIAR O ROTEIRO DO ZERO:
"${instruction.trim()}"

REGRAS:
1. Retorne APENAS o novo roteiro recriado em Markdown.
2. Não adicione saudações nem conversas preliminares.
3. Respeite as informações do cliente:
${clientContext}

ROTEIRO ORIGINAL DE REFERÊNCIA (QUE DEVE SER DESCARTADO E SUBSTITUÍDO POR ESTE NOVO DO ZERO):
${activeScript.content}`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "gerador-roteiros",
          message: systemPrompt,
          history: [],
          modelId: selectedModel
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Falha na comunicação com a IA.");
      }

      const data = await res.json();
      const newContent = data.response?.trim();

      if (newContent) {
        // Update modal state
        const updatedModalScripts = scripts.map((s) =>
          s.index === activeScriptIndex ? { ...s, content: newContent } : s
        );

        setEditingScriptModal((prev) =>
          prev ? { ...prev, scripts: updatedModalScripts } : null
        );

        // If message ID exists, also sync directly into active message session
        if (msgId) {
          const newFullText = updatedModalScripts.length > 1
            ? updatedModalScripts.map((s) => s.content).join("\n\n---\n\n")
            : updatedModalScripts[0].content;

          setSessions((prevSessions) => {
            const nextSessions = prevSessions.map((s) => {
              if (s.id !== activeSession.id) return s;

              const updatedMessages = s.messages.map((m) =>
                m.id === msgId ? { ...m, text: newFullText } : m
              );

              return { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() };
            });

            try {
              safeStorageSetItem(`zion_roteiros_sessions_${activeClient.id}`, JSON.stringify(nextSessions));
            } catch (e) {}

            return nextSessions;
          });
        }

        setModalRefineInput("");
        showToast("Roteiro refinado com IA e atualizado no local! ✨");
      }
    } catch (e: any) {
      console.error(e);
      showToast(`Erro ao refinar: ${e.message || "Tente novamente."}`);
    } finally {
      setIsModalRefining(false);
    }
  };

  const handleSaveUserPromptOnly = (msgId: string, newText: string) => {
    if (!newText.trim()) return;

    setSessions((prevSessions) => {
      const next = prevSessions.map((s) => {
        if (s.id !== activeSession.id) return s;
        const updatedMessages = s.messages.map((m) =>
          m.id === msgId ? { ...m, text: newText.trim() } : m
        );
        return { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() };
      });

      try {
        safeStorageSetItem(`zion_roteiros_sessions_${activeClient.id}`, JSON.stringify(next));
      } catch (e) {}

      return next;
    });

    setEditingUserMsgId(null);
    showToast("Prompt editado e salvo!");
  };

  const handleUpdateUserPromptAndRegenerate = async (msgId: string, newText: string) => {
    const textToSend = newText.trim();
    if (!textToSend) return;

    const msgIndex = chatHistory.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    autoAppendKnowledgeFromMessage(textToSend);

    const targetUserMsg = chatHistory[msgIndex];
    const updatedUserMsg: Message = {
      ...targetUserMsg,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const historyBefore = chatHistory.slice(0, msgIndex);
    const updatedMessages = [...historyBefore, updatedUserMsg];

    let currentSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? {
            ...s,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          }
        : s
    );

    saveSessions(currentSessions);
    setEditingUserMsgId(null);
    setIsGenerating(true);
    showToast("Atualizando e gerando novo roteiro...");

    try {
      const crossSessionMemory = getClientCrossSessionMemory();
      const clientContext = getClientScriptContext(activeClient, crossSessionMemory);

      const filesToSend = targetUserMsg.images
        ? targetUserMsg.images.map((img) => ({
            data: img.includes(",") ? img.split(",")[1] : img,
            mimeType: "image/jpeg"
          }))
        : [];

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "gerador-roteiros",
          message: textToSend + "\n\n" + clientContext,
          attachedFiles: filesToSend,
          history: historyBefore.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text,
            files: m.images
              ? m.images.map((img) => ({
                  data: img.includes(",") ? img.split(",")[1] : img,
                  mimeType: "image/jpeg"
                }))
              : []
          })),
          modelId: selectedModel
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Falha na comunicação com o servidor.");
      }

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.response || "Não foi possível gerar a resposta no momento.",
        timestamp: new Date().toISOString()
      };

      const finalSessions = currentSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...updatedMessages, aiMessage],
              updatedAt: new Date().toISOString()
            }
          : s
      );

      saveSessions(finalSessions);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ **Erro ao comunicar com o servidor:** ${error.message || "Tente novamente."}`,
        timestamp: new Date().toISOString()
      };

      const finalSessions = currentSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...updatedMessages, errorMessage],
              updatedAt: new Date().toISOString()
            }
          : s
      );

      saveSessions(finalSessions);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || inputText.trim();
    if (!textToSend && attachedImages.length === 0) return;

    // Auto-preserve any facts or menu items mentioned in user prompt
    autoAppendKnowledgeFromMessage(textToSend);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      images: attachedImages.map((img) => img.url),
      timestamp: new Date().toISOString()
    };

    let newTitle = activeSession.title;
    if ((newTitle === "Nova conversa" || newTitle === "Conversa Principal") && chatHistory.length === 0) {
      const snippet = textToSend.trim();
      newTitle = snippet.length > 28 ? snippet.slice(0, 28) + "..." : snippet;
    }

    const updatedMessages = [...chatHistory, userMessage];

    let currentSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? {
            ...s,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          }
        : s
    );

    saveSessions(currentSessions);
    setInputText("");
    setAttachedImages([]);
    setIsGenerating(true);

    try {
      const crossSessionMemory = getClientCrossSessionMemory();
      const clientContext = getClientScriptContext(activeClient, crossSessionMemory);

      const filesToSend = attachedImages.map((img) => ({
        data: img.url.includes(",") ? img.url.split(",")[1] : img.url,
        mimeType: img.mimeType || "image/jpeg"
      }));

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "gerador-roteiros",
          message: textToSend + "\n\n" + clientContext,
          attachedFiles: filesToSend,
          history: chatHistory.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text,
            files: m.images
              ? m.images.map((img) => ({
                  data: img.includes(",") ? img.split(",")[1] : img,
                  mimeType: "image/jpeg"
                }))
              : []
          })),
          modelId: selectedModel
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Falha na comunicação com o servidor.");
      }

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.response || "Não foi possível gerar a resposta no momento.",
        timestamp: new Date().toISOString()
      };

      const finalSessions = currentSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...updatedMessages, aiMessage],
              updatedAt: new Date().toISOString()
            }
          : s
      );

      saveSessions(finalSessions);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ **Erro ao comunicar com o servidor:** ${error.message || "Tente novamente."}`,
        timestamp: new Date().toISOString()
      };

      const finalSessions = currentSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...updatedMessages, errorMessage],
              updatedAt: new Date().toISOString()
            }
          : s
      );

      saveSessions(finalSessions);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered Sessions for Search
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const msgMatch = (s.messages || []).some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.pinned);

  const quickPrompts = [
    {
      title: "4 Roteiros em Lote",
      prompt: `Crie 4 roteiros completos para Reels/TikTok de alto engajamento para o cliente (${activeClient.name} - ${activeClient.niche || "Geral"}). Entregue todos organizados numerados de 1 a 4 com tabelas de gravação e cabeçalhos claros (ex: ### ROTEIRO 1, ### ROTEIRO 2) para eu poder baixar tudo em PDF/ZIP.`,
      icon: <Film size={15} className="text-[#c5a880]" />
    },
    {
      title: "Roteiro Reels Viral",
      prompt: `Crie 1 roteiro completo para Reels/TikTok de alto engajamento focado no nicho do cliente (${activeClient.niche || "Geral"}). Inclua Gancho de 3s, falas e instruções de edição em Tabela.`,
      icon: <Film size={15} className="text-[#c5a880]" />
    },
    {
      title: "Carrossel de 5 Lâminas",
      prompt: `Gere uma estrutura de Carrossel Educativo para Instagram em 5 lâminas. Para cada lâmina forneça a Headline, Texto Principal e Design sugerido.`,
      icon: <Layers size={15} className="text-[#c5a880]" />
    },
    {
      title: "5 Ideias de Conteúdo",
      prompt: `Analise o nicho do cliente (${activeClient.niche || "Geral"}) e forneça 5 ideias inéditas de posts/vídeos com alto potencial de engajamento para este mês.`,
      icon: <Lightbulb size={15} className="text-[#c5a880]" />
    }
  ];

  return (
    <div className="w-full h-full flex bg-[#0e0e10] text-zinc-100 rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-50 bg-[#c5a880] text-zinc-950 font-bold px-4 py-2 rounded-full shadow-2xl text-xs flex items-center gap-2 border border-amber-300"
          >
            <CheckCircle2 size={15} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* LEFT SIDEBAR (GEMINI STYLE) */}
      {/* ========================================== */}
      <div
        className={`${
          sidebarOpen ? "w-64 sm:w-72" : "w-0 sm:w-0"
        } transition-all duration-300 bg-[#131314] border-r border-zinc-800/60 flex flex-col shrink-0 overflow-hidden relative z-30`}
      >
        {/* Top Branding & Sparkle */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 flex items-center justify-center text-zinc-950 shadow-md">
              <Sparkles size={16} className="fill-zinc-950" />
            </div>
            <span className="font-bold text-sm tracking-wide text-zinc-100">
              Gemini <span className="text-[#c5a880] font-normal text-xs">Roteiros</span>
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
            title="Recolher menu"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Primary Action Button: Nova Conversa */}
        <div className="px-3 py-2 shrink-0">
          <button
            onClick={handleCreateNewSession}
            className="w-full bg-[#1e1f20] hover:bg-zinc-800/90 text-zinc-100 font-medium text-xs sm:text-sm py-2.5 px-4 rounded-full flex items-center gap-3 transition-all border border-zinc-700/40 shadow-sm active:scale-98"
          >
            <Plus size={18} className="text-[#c5a880]" />
            <span>Nova conversa</span>
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="px-3 py-1 space-y-0.5 shrink-0 text-xs">
          {/* Search trigger */}
          <button
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full transition-colors text-left font-medium ${
              isSearchActive
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Search size={16} />
            <span>Pesquisar conversas</span>
          </button>

          {/* Search Field expandable */}
          <AnimatePresence>
            {isSearchActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-1 pb-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite para buscar..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880]"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 text-zinc-500 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-3 py-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 cursor-pointer font-medium">
            <ImageIcon size={16} />
            <span>Imagens & Mídia</span>
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="border-t border-zinc-800/80" />
        </div>

        {/* Recentes List Section */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Recentes</span>
            <span className="text-[10px] text-zinc-500">{filteredSessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-zinc-500 text-center">
              Nenhuma conversa encontrada
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* Pinned Items */}
              {pinnedSessions.map((s) => {
                const isActive = s.id === activeSession.id;
                const isEditing = editingSessionId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (!isEditing) setActiveSessionId(s.id);
                    }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#282a2c] text-zinc-100 font-semibold"
                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(s.id);
                            if (e.key === "Escape") setEditingSessionId(null);
                          }}
                          autoFocus
                          className="w-full bg-zinc-900 border border-[#c5a880] rounded-md px-2 py-0.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(s.id)}
                          className="p-1 bg-[#c5a880] text-black rounded hover:bg-[#b09369]"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate pr-2 flex-1">{s.title}</span>
                        <div className="flex items-center gap-1">
                          <Pin size={12} className="text-[#c5a880] fill-[#c5a880] shrink-0" />
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={(e) => handleStartRename(s, e)}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Renomear"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              className="p-1 text-zinc-400 hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Unpinned Items */}
              {unpinnedSessions.map((s) => {
                const isActive = s.id === activeSession.id;
                const isEditing = editingSessionId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (!isEditing) setActiveSessionId(s.id);
                    }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#282a2c] text-zinc-100 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(s.id);
                            if (e.key === "Escape") setEditingSessionId(null);
                          }}
                          autoFocus
                          className="w-full bg-zinc-900 border border-[#c5a880] rounded-md px-2 py-0.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(s.id)}
                          className="p-1 bg-[#c5a880] text-black rounded hover:bg-[#b09369]"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate pr-2 flex-1">{s.title}</span>
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleTogglePin(s.id, e)}
                            className="p-1 text-zinc-400 hover:text-[#c5a880]"
                            title="Fixar no topo"
                          >
                            <Pin size={11} />
                          </button>
                          <button
                            onClick={(e) => handleStartRename(s, e)}
                            className="p-1 text-zinc-400 hover:text-white"
                            title="Renomear"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(s.id, e)}
                            className="p-1 text-zinc-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer User Profile & Client Selector */}
        <div className="p-3 border-t border-zinc-800/80 shrink-0 bg-[#131314]">
          <div className="relative">
            <button
              onClick={() => setShowClientSelector(!showClientSelector)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#c5a880] text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {activeClient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {activeClient.name}
                  </div>
                  <div className="text-[10px] text-[#c5a880] font-medium">
                    {activeClient.niche || "Cliente Ativo"}
                  </div>
                </div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 shrink-0" />
            </button>

            {/* Client Popup Menu */}
            <AnimatePresence>
              {showClientSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute bottom-full left-0 mb-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 max-h-56 overflow-y-auto space-y-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">
                      Alternar Cliente Ativo
                    </div>
                    {availableClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectClient(c.id)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-xs transition-colors text-left ${
                          activeClientId === c.id
                            ? "bg-[#c5a880]/20 text-[#c5a880] font-bold"
                            : "text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {activeClientId === c.id && <CheckCircle2 size={13} className="text-[#c5a880]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN CHAT AREA (GEMINI STYLE) */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full bg-[#0e0e10] overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="h-14 px-4 border-b border-zinc-800/40 flex items-center justify-between shrink-0 bg-[#0e0e10]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
                title="Abrir menu lateral"
              >
                <PanelLeft size={18} />
                <span className="text-xs font-semibold text-zinc-300 hidden sm:inline">Conversas</span>
              </button>
            )}

            {/* Interactive Client Selector Dropdown in Header */}
            <div className="relative">
              <button
                onClick={() => setShowHeaderClientSelector(!showHeaderClientSelector)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-zinc-800 text-[#c5a880] font-semibold text-xs border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                title="Clique para alternar o cliente ativo"
              >
                <User size={13} className="text-[#c5a880]" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeClient.name}</span>
                <ChevronDown size={13} className="text-zinc-400" />
              </button>

              <AnimatePresence>
                {showHeaderClientSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1.5">
                        Alternar Cliente Ativo
                      </div>
                      {availableClients.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            handleSelectClient(c.id);
                            setShowHeaderClientSelector(false);
                          }}
                          className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs transition-colors text-left ${
                            activeClientId === c.id
                              ? "bg-[#c5a880]/20 text-[#c5a880] font-bold"
                              : "text-zinc-300 hover:bg-zinc-900"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{c.name}</div>
                            <div className="text-[10px] text-zinc-400">{c.niche || "Cliente"}</div>
                          </div>
                          {activeClientId === c.id && <CheckCircle2 size={14} className="text-[#c5a880] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 text-xs font-medium truncate max-w-[120px] sm:max-w-xs hidden sm:inline">
              {activeSession.title}
            </span>
          </div>

          {/* Right Header Options */}
          <div className="flex items-center gap-2">
            {/* Model Selector Pill */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#1e1f20] hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 text-xs font-medium rounded-full px-3 py-1.5 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
              
            </select>

            {/* New Conversation Icon */}
            <button
              onClick={handleCreateNewSession}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full transition-colors"
              title="Nova conversa"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Chat Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl w-full mx-auto">
          {chatHistory.length === 0 ? (
            /* Gemini Empty State Greeting */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto py-12 space-y-6">
              <div className="space-y-3">
                {/* Cross-session Memory Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-[#c5a880] text-xs font-medium shadow-md">
                  <BookOpen size={14} />
                  <span>
                    Memória Viva Ativa: {sessions.length} conversa(s) e {totalClientMessages} msgs integradas para {activeClient.name}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-amber-100 to-[#c5a880]">
                  Qual é o roteiro de hoje, {activeClient.name.split(" ")[0]}?
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Mesmo em uma nova conversa, o Gemini lembra de todo o histórico, regras e preferências do cliente {activeClient.name}.
                </p>
              </div>

              {/* Quick Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-[#131314] hover:bg-[#1e1f20] border border-zinc-800/80 hover:border-zinc-700 transition-all text-left group shadow-lg"
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-zinc-200 group-hover:text-[#c5a880]">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message History */
            chatHistory.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.sender === "user" ? (
                  /* User Message Capsule (Gemini Style) */
                  <div className="flex justify-end group/usermsg">
                    <div className="bg-[#282a2c] text-zinc-100 rounded-[24px] px-5 py-3.5 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-sm font-normal relative">
                      {editingUserMsgId === msg.id ? (
                        /* Inline Prompt Edit Mode */
                        <div className="space-y-3 min-w-[280px] sm:min-w-[420px]">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <Edit3 size={13} className="text-[#c5a880]" />
                              <span>Editar Prompt</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              Altere o prompt e clique em Atualizar
                            </span>
                          </div>

                          <textarea
                            value={editingUserMsgText}
                            onChange={(e) => setEditingUserMsgText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleUpdateUserPromptAndRegenerate(msg.id, editingUserMsgText);
                              }
                            }}
                            className="w-full bg-zinc-950/90 border border-zinc-700 focus:border-[#c5a880] rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                            rows={3}
                            autoFocus
                          />

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingUserMsgId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              Cancelar
                            </button>

                            <button
                              onClick={() => handleSaveUserPromptOnly(msg.id, editingUserMsgText)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1"
                              title="Salvar alteração no texto do prompt"
                            >
                              <Check size={12} />
                              <span>Apenas Salvar</span>
                            </button>

                            <button
                              onClick={() => handleUpdateUserPromptAndRegenerate(msg.id, editingUserMsgText)}
                              disabled={isGenerating || !editingUserMsgText.trim()}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#c5a880] text-zinc-950 hover:bg-[#b09369] transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                              title="Atualizar o prompt e regerar o roteiro com o Gemini"
                            >
                              <RotateCcw size={13} />
                              <span>🔄 Atualizar Roteiro</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal View Mode */
                        <div className="space-y-2">
                          {/* Attached Images */}
                          {msg.images && msg.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {msg.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt="Anexo"
                                  className="w-24 h-24 object-cover rounded-xl border border-zinc-700"
                                />
                              ))}
                            </div>
                          )}

                          <div className="whitespace-pre-wrap">{msg.text}</div>

                          {/* Quick Edit & Update Action Buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-zinc-700/40 text-zinc-400">
                            <button
                              onClick={() => {
                                setEditingUserMsgId(msg.id);
                                setEditingUserMsgText(msg.text);
                              }}
                              className="px-2.5 py-1 rounded-lg hover:bg-zinc-700/70 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-semibold border border-zinc-700/50"
                              title="Editar este prompt enviado"
                            >
                              <Edit3 size={12} className="text-[#c5a880]" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => handleUpdateUserPromptAndRegenerate(msg.id, msg.text)}
                              disabled={isGenerating}
                              className="px-2.5 py-1 rounded-lg hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 text-[11px] font-bold border border-amber-500/30"
                              title="Atualizar / Regerar resposta para este prompt"
                            >
                              <RotateCcw size={12} className="text-[#c5a880]" />
                              <span>🔄 Atualizar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* AI Response Stream (Clean Flowing Text, Gemini Style) */
                  <div className="flex gap-3 items-start max-w-full">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 flex items-center justify-center text-zinc-950 shrink-0 mt-0.5 shadow-md">
                      <Sparkles size={14} className="fill-zinc-950" />
                    </div>

                    <div className="flex-1 space-y-3 overflow-hidden">
                      <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-3 prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-strong:text-[#c5a880] prose-strong:font-bold prose-ul:list-disc prose-ul:pl-4 prose-p:leading-relaxed prose-code:text-[#c5a880] prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="my-4 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/90 shadow-2xl">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[640px]" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-zinc-900 text-[#c5a880] uppercase tracking-wider font-bold border-b border-zinc-800 text-[11px]" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th className="px-4 py-3 font-bold border-r border-zinc-800/80 last:border-r-0 bg-zinc-900/90 text-[#c5a880]" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="px-4 py-3 border-t border-zinc-800/50 border-r border-zinc-800/30 last:border-r-0 align-top text-zinc-200 leading-relaxed" {...props} />
                            ),
                            tr: ({ node, ...props }) => (
                              <tr className="hover:bg-zinc-800/40 transition-colors even:bg-zinc-900/30 odd:bg-black/40" {...props} />
                            )
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>

                      {/* Extracted Scripts Cards & Downloads Bar */}
                      {(() => {
                        const extracted = extractScriptsFromText(msg.text);
                        const isMulti = extracted.length > 1;

                        return (
                          <div className="space-y-3 pt-2">
                            {/* If multiple scripts generated in this response, display individual download cards */}
                            {isMulti && (
                              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-amber-200/90 pb-2 border-b border-zinc-800/80">
                                  <span className="flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-[#c5a880]" />
                                    <span>{extracted.length} Roteiros Gerados nesta Resposta (Download Individual):</span>
                                  </span>
                                  <button
                                    onClick={() => handleDownloadBatchZip(msg.text)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-bold border border-emerald-500/40 w-fit"
                                    title="Baixar Todos os Roteiros em um único arquivo ZIP"
                                  >
                                    <Archive size={12} />
                                    <span>Baixar Todos em ZIP ({extracted.length})</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                  {extracted.map((scriptItem) => (
                                    <div
                                      key={scriptItem.index}
                                      className="bg-black/50 hover:bg-black/70 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3 flex flex-col gap-2.5 transition-all"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[#c5a880] text-[11px] font-bold border border-amber-500/30 shrink-0">
                                              Roteiro {scriptItem.index}
                                            </span>
                                            <span className="text-xs font-semibold text-zinc-100 truncate">
                                              {scriptItem.topic}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                          {/* Edit script before download */}
                                          <button
                                            onClick={() =>
                                              openEditPdfModal(msg.text, msg.id, scriptItem.index, "CLIENTE")
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 text-[11px] font-bold border border-zinc-700"
                                            title={`Editar Roteiro ${scriptItem.index} e ver prévia do PDF em tempo real`}
                                          >
                                            <Edit3 size={12} className="text-[#c5a880]" />
                                            <span>✏️ Editar / Prévia PDF</span>
                                          </button>

                                          {/* Download PDF Cliente for this single script */}
                                          <button
                                            onClick={() =>
                                              handleDownloadPdf(
                                                scriptItem.content,
                                                "CLIENTE",
                                                `Roteiro_${scriptItem.index}_[CLIENTE]_${activeClient.name.replace(/\s+/g, "_")}_${scriptItem.topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_")}.pdf`
                                              )
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-[#c5a880] transition-colors flex items-center gap-1.5 text-[11px] font-bold border border-amber-500/40"
                                            title={`Baixar PDF para Cliente do Roteiro ${scriptItem.index}`}
                                          >
                                            <FileText size={12} />
                                            <span>📱 PDF Cliente</span>
                                          </button>

                                          {/* Download PDF Editor for this single script */}
                                          <button
                                            onClick={() =>
                                              handleDownloadPdf(
                                                scriptItem.content,
                                                "EDITOR",
                                                `Roteiro_${scriptItem.index}_[EDITOR]_${activeClient.name.replace(/\s+/g, "_")}_${scriptItem.topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_")}.pdf`
                                              )
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition-colors flex items-center gap-1.5 text-[11px] font-bold border border-blue-500/40"
                                            title={`Baixar PDF para Editor do Roteiro ${scriptItem.index}`}
                                          >
                                            <FileText size={12} />
                                            <span>🎬 PDF Editor</span>
                                          </button>

                                          {/* In-place Refine Button for this specific script */}
                                          <button
                                            onClick={() => {
                                              if (
                                                activeRefinePanel?.msgId === msg.id &&
                                                activeRefinePanel?.scriptIndex === scriptItem.index
                                              ) {
                                                setActiveRefinePanel(null);
                                                setRefineAttachedFiles([]);
                                              } else {
                                                setActiveRefinePanel({
                                                  msgId: msg.id,
                                                  scriptIndex: scriptItem.index,
                                                  topic: scriptItem.topic
                                                });
                                                setCustomRefinePrompt("");
                                                setRefineAttachedFiles([]);
                                              }
                                            }}
                                            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 text-[11px] font-bold border ${
                                              activeRefinePanel?.msgId === msg.id &&
                                              activeRefinePanel?.scriptIndex === scriptItem.index
                                                ? "bg-[#c5a880] text-white border-[#c5a880] shadow-md"
                                                : "bg-[#c5a880]/15 hover:bg-[#c5a880]/25 text-[#c5a880] border-[#c5a880]/40"
                                            }`}
                                            title={`Melhorar o Roteiro ${scriptItem.index} no mesmo local sem criar nova resposta`}
                                          >
                                            <Sparkles size={12} />
                                            <span>✨ Melhore este</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* In-place Loading Spinner */}
                                      {refiningScriptKey === `${msg.id}-${scriptItem.index}` && (
                                        <div className="w-full p-3 bg-[#c5a880]/40 border border-[#c5a880]/40 rounded-xl flex items-center justify-center gap-2.5 text-[#c5a880] text-xs font-bold animate-pulse">
                                          <Loader2 size={16} className="animate-spin text-[#c5a880]" />
                                          <span>Aprimorando Roteiro {scriptItem.index} com IA no mesmo local...</span>
                                        </div>
                                      )}

                                      {/* In-place Refine Interactive Panel */}
                                      {activeRefinePanel?.msgId === msg.id && activeRefinePanel?.scriptIndex === scriptItem.index && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="w-full bg-zinc-950 border border-[#c5a880]/40 rounded-xl p-3 space-y-2.5 shadow-xl"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#c5a880]">
                                              <Sparkles size={13} className="text-[#c5a880]" />
                                              <span>Aprimorar Roteiro {scriptItem.index} ("{scriptItem.topic}") no local:</span>
                                            </div>
                                            <button
                                              onClick={() => setActiveRefinePanel(null)}
                                              className="p-1 text-zinc-400 hover:text-white rounded"
                                            >
                                              <X size={13} />
                                            </button>
                                          </div>

                                          {/* Quick Presets */}
                                          <div className="flex flex-wrap gap-1.5">
                                            {[
                                              "🎯 Gancho inicial mais forte e chamativo",
                                              "⏱️ Encurtar para 30s (Reels dinâmico)",
                                              "🎬 Enriquecer B-roll e Tabela do Editor",
                                              "📱 CTA mais direta para Bio / WhatsApp",
                                              "🌶️ Linguagem mais viva e engajante"
                                            ].map((preset, pIdx) => (
                                              <button
                                                key={pIdx}
                                                onClick={() => handleInPlaceRefineScript(msg.id, scriptItem.index, preset)}
                                                disabled={refiningScriptKey !== null}
                                                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-[#c5a880]/60 text-zinc-300 hover:text-[#c5a880] text-[11px] font-medium border border-zinc-800 hover:border-[#c5a880]/40 transition-all text-left"
                                              >
                                                {preset}
                                              </button>
                                            ))}
                                          </div>

                                          {/* Refine Attached Files Chips */}
                                          {refineAttachedFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                                              {refineAttachedFiles.map((f, idx) => (
                                                <div
                                                  key={idx}
                                                  className="relative flex items-center gap-1.5 pl-2 pr-6 py-1 rounded-lg bg-zinc-900 border border-[#c5a880]/40 text-[10px] text-zinc-300 max-w-[150px] truncate shrink-0"
                                                >
                                                  {f.mimeType?.startsWith("image/") ? (
                                                    <img src={f.url} className="w-4 h-4 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                                                  ) : (
                                                    <FileText size={10} className="text-[#c5a880] shrink-0" />
                                                  )}
                                                  <span className="truncate text-zinc-400">{f.name || "Arquivo"}</span>
                                                  <button
                                                    onClick={() => removeRefineAttachment(idx)}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                  >
                                                    <X size={10} />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Custom Prompt Input */}
                                          <div className="flex items-center gap-2 pt-1">
                                            {/* File upload button */}
                                            <label
                                              title="Anexar arquivo/imagem para esta melhoria"
                                              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-[#c5a880]/60 border border-zinc-800 hover:border-[#c5a880]/40 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors shrink-0"
                                            >
                                              <Paperclip size={14} />
                                              <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={handleRefineFileUpload}
                                              />
                                            </label>

                                            <input
                                              type="text"
                                              value={customRefinePrompt}
                                              onChange={(e) => setCustomRefinePrompt(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter" && (customRefinePrompt.trim() || refineAttachedFiles.length > 0)) {
                                                  handleInPlaceRefineScript(msg.id, scriptItem.index, customRefinePrompt || "Refinar com base nas referências anexas");
                                                }
                                              }}
                                              placeholder="Ou digite o que quer ajustar neste roteiro..."
                                              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#c5a880] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                                            />
                                            <button
                                              onClick={() => handleInPlaceRefineScript(msg.id, scriptItem.index, customRefinePrompt || "Refinar com base nas referências anexas")}
                                              disabled={(!customRefinePrompt.trim() && refineAttachedFiles.length === 0) || refiningScriptKey !== null}
                                              className="px-3 py-1.5 bg-[#c5a880] hover:bg-[#c5a880] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md"
                                            >
                                              <Sparkles size={12} />
                                              <span>Refinar</span>
                                            </button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Main Bar Actions (for single script responses or message-level operations) */}
                            <div className="flex flex-col gap-2 text-zinc-400 w-full">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => handleCopyText(msg.text, msg.id)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium border border-zinc-800"
                                  title="Copiar texto"
                                >
                                  {copiedMsgId === msg.id ? (
                                    <>
                                      <Check size={13} className="text-[#c5a880]" />
                                      <span className="text-[#c5a880]">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={13} />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>

                                {!isMulti && (
                                  <>
                                    {/* Edit script before download */}
                                    <button
                                      onClick={() => openEditPdfModal(msg.text, msg.id, 1, "CLIENTE")}
                                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 text-[11px] font-semibold border border-zinc-700"
                                      title="Editar o texto do roteiro manualmente com prévia do PDF em tempo real"
                                    >
                                      <Edit3 size={13} className="text-[#c5a880]" />
                                      <span>✏️ Editar / Prévia PDF</span>
                                    </button>

                                    {/* Download Single PDF Cliente */}
                                    <button
                                      onClick={() => handleDownloadPdf(msg.text, "CLIENTE")}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#c5a880] transition-colors flex items-center gap-1.5 text-[11px] font-semibold border border-amber-500/30"
                                      title="Baixar PDF Limpo para enviar ao Cliente (Aprovação sem informações técnicas)"
                                    >
                                      <FileText size={13} />
                                      <span>📱 PDF Cliente</span>
                                    </button>

                                    {/* Download Single PDF Editor */}
                                    <button
                                      onClick={() => handleDownloadPdf(msg.text, "EDITOR")}
                                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors flex items-center gap-1.5 text-[11px] font-semibold border border-blue-500/30"
                                      title="Baixar PDF Completo para o Editor (Tabela de edição, B-rolls e SFX)"
                                    >
                                      <FileText size={13} />
                                      <span>🎬 PDF Editor</span>
                                    </button>

                                    {/* In-place Refine button for single script */}
                                    <button
                                      onClick={() => {
                                        if (
                                          activeRefinePanel?.msgId === msg.id &&
                                          activeRefinePanel?.scriptIndex === 1
                                        ) {
                                          setActiveRefinePanel(null);
                                          setRefineAttachedFiles([]);
                                        } else {
                                          setActiveRefinePanel({
                                            msgId: msg.id,
                                            scriptIndex: 1,
                                            topic: "Roteiro"
                                          });
                                          setCustomRefinePrompt("");
                                          setRefineAttachedFiles([]);
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 text-[11px] font-bold border ${
                                        activeRefinePanel?.msgId === msg.id &&
                                        activeRefinePanel?.scriptIndex === 1
                                          ? "bg-[#c5a880] text-white border-[#c5a880] shadow-md"
                                          : "bg-[#c5a880]/15 hover:bg-[#c5a880]/25 text-[#c5a880] border-[#c5a880]/40"
                                      }`}
                                      title="Pedir ao Gemini para melhorar este roteiro no mesmo local"
                                    >
                                      <Sparkles size={13} />
                                      <span>✨ Melhore este Roteiro</span>
                                    </button>
                                  </>
                                )}

                                {/* Download TXT Button */}
                                <button
                                  onClick={() => handleDownloadTxt(msg.text)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium border border-zinc-800"
                                  title="Baixar Texto Simples (.txt)"
                                >
                                  <Download size={13} />
                                  <span>TXT</span>
                                </button>

                                <button
                                  onClick={() => handleSaveToNotes(msg.text, msg.id)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-medium border border-zinc-800"
                                  title="Salvar em Notas"
                                >
                                  <Save size={13} />
                                  <span>Salvar Nota</span>
                                </button>

                                <button
                                  onClick={() => sendMessage("Pode reformular ou dar mais opções para este roteiro?")}
                                  className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800 flex items-center justify-center"
                                  title="Recriar resposta"
                                >
                                  <RotateCcw size={13} />
                                </button>
                              </div>

                              {/* Single Script In-place Loading Spinner */}
                              {!isMulti && refiningScriptKey === `${msg.id}-1` && (
                                <div className="w-full p-3 bg-[#c5a880]/40 border border-[#c5a880]/40 rounded-xl flex items-center justify-center gap-2.5 text-[#c5a880] text-xs font-bold animate-pulse">
                                  <Loader2 size={16} className="animate-spin text-[#c5a880]" />
                                  <span>Aprimorando roteiro com IA no mesmo local...</span>
                                </div>
                              )}

                              {/* Single Script In-place Refine Interactive Panel */}
                              {!isMulti && activeRefinePanel?.msgId === msg.id && activeRefinePanel?.scriptIndex === 1 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="w-full bg-zinc-950 border border-[#c5a880]/40 rounded-xl p-3 space-y-2.5 shadow-xl"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#c5a880]">
                                      <Sparkles size={13} className="text-[#c5a880]" />
                                      <span>Aprimorar Roteiro no mesmo local:</span>
                                    </div>
                                    <button
                                      onClick={() => setActiveRefinePanel(null)}
                                      className="p-1 text-zinc-400 hover:text-white rounded"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>

                                  {/* Quick Presets */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {[
                                      "🎯 Gancho inicial mais forte e chamativo",
                                      "⏱️ Encurtar para 30s (Reels dinâmico)",
                                      "🎬 Enriquecer B-roll e Tabela do Editor",
                                      "📱 CTA mais direta para Bio / WhatsApp",
                                      "🌶️ Linguagem mais viva e engajante"
                                    ].map((preset, pIdx) => (
                                      <button
                                        key={pIdx}
                                        onClick={() => handleInPlaceRefineScript(msg.id, 1, preset)}
                                        disabled={refiningScriptKey !== null}
                                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-[#c5a880]/60 text-zinc-300 hover:text-[#c5a880] text-[11px] font-medium border border-zinc-800 hover:border-[#c5a880]/40 transition-all text-left"
                                      >
                                        {preset}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Refine Attached Files Chips */}
                                  {refineAttachedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                                      {refineAttachedFiles.map((f, idx) => (
                                        <div
                                          key={idx}
                                          className="relative flex items-center gap-1.5 pl-2 pr-6 py-1 rounded-lg bg-zinc-900 border border-[#c5a880]/40 text-[10px] text-zinc-300 max-w-[150px] truncate shrink-0"
                                        >
                                          {f.mimeType?.startsWith("image/") ? (
                                            <img src={f.url} className="w-4 h-4 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                                          ) : (
                                            <FileText size={10} className="text-[#c5a880] shrink-0" />
                                          )}
                                          <span className="truncate text-zinc-400">{f.name || "Arquivo"}</span>
                                          <button
                                            onClick={() => removeRefineAttachment(idx)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Custom Prompt Input */}
                                  <div className="flex items-center gap-2 pt-1">
                                    {/* File upload button */}
                                    <label
                                      title="Anexar arquivo/imagem para esta melhoria"
                                      className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-[#c5a880]/60 border border-zinc-800 hover:border-[#c5a880]/40 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors shrink-0"
                                    >
                                      <Paperclip size={14} />
                                      <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleRefineFileUpload}
                                      />
                                    </label>

                                    <input
                                      type="text"
                                      value={customRefinePrompt}
                                      onChange={(e) => setCustomRefinePrompt(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && (customRefinePrompt.trim() || refineAttachedFiles.length > 0)) {
                                          handleInPlaceRefineScript(msg.id, 1, customRefinePrompt || "Refinar com base nas referências anexas");
                                        }
                                      }}
                                      placeholder="Ou digite o que quer ajustar neste roteiro..."
                                      className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#c5a880] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleInPlaceRefineScript(msg.id, 1, customRefinePrompt || "Refinar com base nas referências anexas")}
                                      disabled={(!customRefinePrompt.trim() && refineAttachedFiles.length === 0) || refiningScriptKey !== null}
                                      className="px-3 py-1.5 bg-[#c5a880] hover:bg-[#c5a880] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md"
                                    >
                                      <Sparkles size={12} />
                                      <span>Refinar</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Generation Loader */}
          {isGenerating && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 flex items-center justify-center text-zinc-950 shrink-0">
                <Sparkles size={14} className="fill-zinc-950 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <Loader2 size={15} className="animate-spin text-[#c5a880]" />
                <span>Pensando e gerando roteiro...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================== */}
        {/* FLOATING BOTTOM INPUT BAR (GEMINI PILL STYLE) */}
        {/* ========================================== */}
        <div className="p-4 sm:p-6 shrink-0 bg-[#0e0e10]/90 backdrop-blur-lg">
          <div className="max-w-3xl w-full mx-auto">
            {/* Attached Images Chips */}
            {attachedImages.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {attachedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#c5a880] shrink-0 bg-black"
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-500"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Main Pill Input Box */}
            <div className="bg-[#1e1f20] hover:bg-[#282a2c] focus-within:bg-[#282a2c] border border-zinc-700/50 focus-within:border-zinc-500 rounded-[28px] p-2 sm:px-4 sm:py-2.5 flex items-center gap-2 shadow-2xl transition-all">
              {/* Attachment Button */}
              <label
                title="Anexar imagem"
                className="w-9 h-9 rounded-full hover:bg-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0"
              >
                <Plus size={20} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Text Input */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Peça ao Gemini um roteiro para ${activeClient.name}...`}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none max-h-32 py-1.5 leading-relaxed"
                rows={1}
              />

              {/* Right Controls inside Pill */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Voice Microphone Input */}
                <VoiceInputButton
                  onTranscript={(transcript) => {
                    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
                    showToast("Áudio gravado com sucesso!");
                  }}
                  className="w-9 h-9 rounded-full hover:bg-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-colors"
                />

                {/* Send Button */}
                <button
                  onClick={() => sendMessage()}
                  disabled={isGenerating || (!inputText.trim() && attachedImages.length === 0)}
                  className="w-9 h-9 rounded-full bg-[#c5a880] text-zinc-950 flex items-center justify-center disabled:opacity-30 hover:bg-[#b09369] transition-all shadow-md shrink-0"
                  title="Enviar mensagem"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </div>
            </div>

            {/* Gemini Disclaimer Subtext */}
            <div className="text-center text-[11px] text-zinc-500 mt-2">
              O Gemini Roteiros é uma IA e pode cometer erros. Verifique as informações importantes.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* BASE DE CONHECIMENTO & MEMÓRIA PERMANENTE MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {showKnowledgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181b] border border-zinc-700/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#c5a880]">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      Base de Conhecimento Permanente: <span className="text-[#c5a880]">{activeClient.name}</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Memória fixa do cliente (Cardápios, Preços, Unidades, Pessoas, Regras)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKnowledgeModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                <Sparkles size={16} className="text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <strong>Segurança de Memória Total:</strong> As informações salvas abaixo ficam gravadas de forma <strong>permanente</strong> na ficha do cliente. <strong>Mesmo que você exclua conversas e históricos de chat, essa memória NUNCA será apagada!</strong> O Gemini usará este conhecimento em todos os roteiros futuros.
                </div>
              </div>

              {/* Textarea */}
              <div className="flex-1 flex flex-col space-y-1.5 min-h-[220px]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Conteúdo da Memória (Cardápio, Filiais, Apresentadoras, Regras):
                  </label>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    {knowledgeText.length} caracteres
                  </span>
                </div>
                <textarea
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  placeholder={`Cole ou digite aqui todas as informações importantes do cliente ${activeClient.name}...\nExemplo:\n- Cardápio: Esfihas R$ 5,90, Cuscuz recheado R$ 14,90, Tapioca R$ 12,00\n- Unidades: Prefeitura, Banco do Brasil e Centro\n- Apresentadoras/Equipe: Pâmela e Letícia\n- Estilo: Tom jovem, dinâmico e direto ao ponto`}
                  className="w-full flex-1 bg-zinc-950 border border-zinc-700 focus:border-[#c5a880] rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-mono"
                  rows={10}
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente limpar toda a memória permanente deste cliente?")) {
                      saveClientKnowledge("");
                      showToast("Memória limpa.");
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Limpar Memória</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKnowledgeModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      saveClientKnowledge(knowledgeText);
                      setShowKnowledgeModal(false);
                    }}
                    className="px-5 py-2 text-xs font-bold bg-[#c5a880] text-zinc-950 hover:bg-[#b09369] rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>Salvar Memória Permanente</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Script Modal for Live PDF Export & Interactive Editing */}
      <AnimatePresence>
        {editingScriptModal && editingScriptModal.isOpen && (() => {
          const activeScript = editingScriptModal.scripts.find(
            (s) => s.index === editingScriptModal.activeScriptIndex
          ) || editingScriptModal.scripts[0] || { index: 1, topic: "Roteiro 1", content: "" };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex flex-col gap-3 px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-[#c5a880] border border-amber-500/20">
                        <Edit3 size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                          <span>Editar & Prévia do PDF</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-[#c5a880] font-bold border border-amber-500/30">
                            Cliente: {activeClient.name}
                          </span>
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Edite o roteiro e veja a prévia do documento PDF ser atualizada em tempo real.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Mode Toggle */}
                      <div className="hidden sm:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() =>
                            setEditingScriptModal((prev) =>
                              prev ? { ...prev, viewMode: "split" } : null
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            editingScriptModal.viewMode === "split"
                              ? "bg-zinc-800 text-amber-200 border border-zinc-700"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          📐 Dividido
                        </button>
                        <button
                          onClick={() =>
                            setEditingScriptModal((prev) =>
                              prev ? { ...prev, viewMode: "editor" } : null
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            editingScriptModal.viewMode === "editor"
                              ? "bg-zinc-800 text-amber-200 border border-zinc-700"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          ✏️ Editor
                        </button>
                        <button
                          onClick={() =>
                            setEditingScriptModal((prev) =>
                              prev ? { ...prev, viewMode: "preview" } : null
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            editingScriptModal.viewMode === "preview"
                              ? "bg-zinc-800 text-amber-200 border border-zinc-700"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          📄 Prévia PDF
                        </button>
                      </div>

                      <button
                        onClick={() => setEditingScriptModal(null)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Sub-Header Controls: Multi-Script Tabs & Target Switcher */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                    {/* Script Selector Tabs (e.g. Roteiro 1, Roteiro 2, Roteiro 3, Roteiro 4) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar max-w-full">
                      {editingScriptModal.scripts.map((sc) => (
                        <button
                          key={sc.index}
                          onClick={() =>
                            setEditingScriptModal((prev) =>
                              prev ? { ...prev, activeScriptIndex: sc.index } : null
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                            editingScriptModal.activeScriptIndex === sc.index
                              ? "bg-[#c5a880] text-zinc-950 border-[#c5a880] shadow-sm"
                              : "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          <span>Roteiro {sc.index}</span>
                          <span className="opacity-80 text-[10px] font-normal truncate max-w-[110px]">
                            {sc.topic}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Version Selector Toggle (📱 Cliente vs 🎬 Editor) */}
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() =>
                          setEditingScriptModal((prev) =>
                            prev ? { ...prev, target: "CLIENTE" } : null
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          editingScriptModal.target === "CLIENTE"
                            ? "bg-amber-500/20 text-[#c5a880] border border-amber-500/40"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span>📱 Versão CLIENTE</span>
                      </button>
                      <button
                        onClick={() =>
                          setEditingScriptModal((prev) =>
                            prev ? { ...prev, target: "EDITOR" } : null
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          editingScriptModal.target === "EDITOR"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span>🎬 Versão EDITOR</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Main Body (Interactive Split View or Full Screen) */}
                <div className="flex-1 overflow-hidden p-3 sm:p-4 flex flex-col md:flex-row gap-3 bg-zinc-950">
                  {/* Left Column: Text Area Editor */}
                  {(editingScriptModal.viewMode === "split" || editingScriptModal.viewMode === "editor") && (
                    <div
                      className={`flex flex-col space-y-2 overflow-hidden ${
                        editingScriptModal.viewMode === "split" ? "w-full md:w-1/2 h-full" : "w-full h-full"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold px-1 shrink-0">
                        <span>✏️ Conteúdo do Roteiro {activeScript.index} (Editável em Markdown):</span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {activeScript.content.length} caracteres
                        </span>
                      </div>

                      <textarea
                        value={activeScript.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingScriptModal((prev) => {
                            if (!prev) return null;
                            const updatedScripts = prev.scripts.map((s) =>
                              s.index === prev.activeScriptIndex ? { ...s, content: val } : s
                            );
                            return { ...prev, scripts: updatedScripts };
                          });
                        }}
                        placeholder="Edite o texto do roteiro aqui..."
                        className="w-full flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#c5a880] rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-mono selection:bg-amber-500/30 shadow-inner"
                      />
                    </div>
                  )}

                  {/* Right Column: Live PDF Document Preview */}
                  {(editingScriptModal.viewMode === "split" || editingScriptModal.viewMode === "preview") && (
                    <div
                      className={`flex flex-col space-y-2 overflow-hidden ${
                        editingScriptModal.viewMode === "split" ? "w-full md:w-1/2 h-full" : "w-full h-full"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold px-1 shrink-0">
                        <span className="flex items-center gap-1.5">
                          <span>
                            📄 Prévia do PDF (
                            {editingScriptModal.target === "CLIENTE"
                              ? "📱 Layout Cliente"
                              : "🎬 Layout Editor & Filmmaker"}
                            ):
                          </span>
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-mono">
                          • Atualização em Tempo Real
                        </span>
                      </div>

                      <div className="w-full flex-1 overflow-hidden relative flex flex-col">
                        <PdfSheetPreview
                          scriptText={activeScript.content}
                          clientName={activeClient.name}
                          target={editingScriptModal.target}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 border-t border-zinc-800 bg-zinc-900/90 gap-3 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingScriptModal.msgId && (
                      <button
                        onClick={handleSaveEditedScriptToMessage}
                        className="px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
                        title="Atualizar mensagem correspondente na tela de chat"
                      >
                        <Save size={14} />
                        <span>Salvar na Conversa</span>
                      </button>
                    )}

                    {editingScriptModal.scripts.length > 1 && (
                      <button
                        onClick={() => {
                          const combinedText = editingScriptModal.scripts.map((s) => s.content).join("\n\n---\n\n");
                          handleDownloadBatchZip(combinedText);
                        }}
                        className="px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl border border-emerald-500/40 transition-all flex items-center gap-1.5"
                        title="Baixar pacote ZIP com PDFs de todos os roteiros editados"
                      >
                        <Archive size={14} />
                        <span>Baixar Todos em ZIP ({editingScriptModal.scripts.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditingScriptModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      Fechar
                    </button>

                    {/* Download PDF Cliente */}
                    <button
                      onClick={() => {
                        exportSingleScriptPdf(
                          activeScript.content,
                          activeClient.name,
                          "CLIENTE",
                          `Roteiro_${activeScript.index}_[CLIENTE]_${activeClient.name.replace(/\s+/g, "_")}_${activeScript.topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_")}.pdf`
                        );
                      }}
                      className="px-4 py-2 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-[#c5a880] rounded-xl transition-all border border-amber-500/40 flex items-center gap-1.5 shadow-sm"
                      title="Baixar PDF Limpo para Aprovação do Cliente"
                    >
                      <FileText size={14} />
                      <span>📱 Baixar PDF Cliente</span>
                    </button>

                    {/* Download PDF Editor */}
                    <button
                      onClick={() => {
                        exportSingleScriptPdf(
                          activeScript.content,
                          activeClient.name,
                          "EDITOR",
                          `Roteiro_${activeScript.index}_[EDITOR]_${activeClient.name.replace(/\s+/g, "_")}_${activeScript.topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_")}.pdf`
                        );
                      }}
                      className="px-4 py-2 text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-all border border-blue-500/40 flex items-center gap-1.5 shadow-sm"
                      title="Baixar PDF Técnico Completo para o Editor"
                    >
                      <FileText size={14} />
                      <span>🎬 Baixar PDF Editor</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
