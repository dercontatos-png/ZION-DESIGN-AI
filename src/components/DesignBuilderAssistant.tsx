import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircleMore,
  Bot,
  ChevronDown,
  RotateCcw,
  Paperclip,
  Maximize2,
  Minimize2,
  ArrowUp,
  Loader2,
  X,
  Copy,
  Check,
  Sparkles,
  Wand2,
  BookOpenCheck,
  Images,
  FileText,
  Search,
  Instagram,
  Film
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface AssistantOption {
  id: string;
  name: string;
  desc: string;
  greeting: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export const ASSISTANT_OPTIONS: AssistantOption[] = [
  {
    id: "prompt-extractor",
    name: "Prompt Extractor",
    desc: "Decodifique a estrutura e os parâmetros técnicos de referências visuais.",
    greeting: "Olá! Eu sou o Prompt Extractor. Envie uma imagem ou flyer para eu decodificar e extrair o prompt mestre.",
    icon: Bot,
  },
  {
    id: "copy-legendas-instagram",
    name: "Criador de Legendas [Instagram]",
    desc: "Envie flyer, vídeo ou imagens e gere legendas magnéticas com 5 hashtags prontas para copiar.",
    greeting: "Olá! Sou o Criador de Legendas para Instagram. Envie seu flyer, vídeo ou imagem (ou descreva a ideia do post) e eu gero a legenda completa, organizada e curta, com gancho, corpo, chamada para ação e exatamente 5 hashtags. Se quiser mudar algo depois, é só me falar aqui no chat que eu ajusto na hora!",
    icon: Instagram,
  },
  {
    id: "diretor-criativo",
    name: "Diretor Criativo",
    desc: "Mentor visual que guia você na criação de peças impactantes com direções criativas estratégicas.",
    greeting: "Olá! Sou seu Diretor Criativo. Qual direção artística ou conceito visual deseja estruturar para o seu projeto hoje?",
    icon: BookOpenCheck,
  },
  {
    id: "creative-assistant",
    name: "Creative Assistant",
    desc: "Ajuda a ter ideias para cenários e composições.",
    greeting: "Olá! Eu sou o Creative Assistant. Me conte sobre seu projeto ou conceito para explorarmos ideias de cenários, iluminação e composições marcantes.",
    icon: Wand2,
  },
  {
    id: "copy-builder-carrosseis",
    name: "Copy Builder [Carrosséis]",
    desc: "Especialista em copywriting para carroséis para o instagram",
    greeting: "Olá! Sou o Copy Builder especialista em carrosséis para Instagram. Qual tema ou nicho vamos transformar em slides de alto engajamento?",
    icon: Images,
  },
  {
    id: "copy-builder-sites",
    name: "Copy Builder [Sites e LPs]",
    desc: "Especialista em copywriting para Sites e LPs",
    greeting: "Olá! Sou o Copy Builder focado em Sites e Landing Pages. Descreva seu produto, serviço ou público-alvo para criarmos copys persuasivas.",
    icon: FileText,
  },
  {
    id: "analisador-critico",
    name: "Analisador Crítico de Design",
    desc: "Analista crítico que avalia layouts com olhar profissional, identificando o que funciona e o que sabota a peça.",
    greeting: "Olá! Sou o Analisador Crítico de Design. Anexe sua imagem ou envie os detalhes do layout para uma análise detalhada de hierarquia, cores e legibilidade.",
    icon: Search,
  },
];

export interface AttachedMedia {
  id: string;
  name: string;
  data: string;
  type: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  media?: AttachedMedia[];
  image?: string;
  images?: string[];
}

interface DesignBuilderAssistantProps {
  onSelectAgent?: (slug: string) => void;
  onApplyPrompt?: (prompt: string) => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const STORAGE_KEY_PREFIX = "zion_builder_assistant_chat_";
const ACTIVE_ASSISTANT_KEY = "zion_builder_assistant_active_id";

const getSavedAssistant = (): AssistantOption => {
  try {
    const savedId = localStorage.getItem(ACTIVE_ASSISTANT_KEY);
    if (savedId) {
      const found = ASSISTANT_OPTIONS.find((a) => a.id === savedId);
      if (found) return found;
    }
  } catch (e) {
    console.warn("Erro ao ler assistente salvo:", e);
  }
  return ASSISTANT_OPTIONS[0];
};

const getSavedMessages = (assistantId: string, defaultGreeting: string): ChatMsg[] => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${assistantId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erro ao ler mensagens salvas:", e);
  }
  return [{ role: "assistant", content: defaultGreeting }];
};

export const DesignBuilderAssistant: React.FC<DesignBuilderAssistantProps> = ({
  onApplyPrompt,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantOption>(() => getSavedAssistant());
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    const active = getSavedAssistant();
    return getSavedMessages(active.id, active.greeting);
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Persistir mensagens do assistente ativo no localStorage com proteção de cota
  useEffect(() => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${selectedAssistant.id}`;
      if (messages.length > 1 || (messages.length === 1 && messages[0].content !== selectedAssistant.greeting)) {
        const safeMessages = messages.map((m) => ({
          role: m.role,
          content: m.content,
          media: m.media?.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            data: item.data && item.data.length < 60000 ? item.data : "",
          })),
          image: m.image && m.image.length < 60000 ? m.image : undefined,
          images: m.images?.filter((img) => img.length < 60000),
        }));
        localStorage.setItem(key, JSON.stringify(safeMessages));
      }
    } catch (err) {
      console.warn("Erro ao salvar mensagens no localStorage:", err);
    }
  }, [messages, selectedAssistant.id]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSelectAssistant = (opt: AssistantOption) => {
    setSelectedAssistant(opt);
    setIsMenuOpen(false);
    try {
      localStorage.setItem(ACTIVE_ASSISTANT_KEY, opt.id);
      const saved = getSavedMessages(opt.id, opt.greeting);
      setMessages(saved);
    } catch (e) {
      setMessages([{ role: "assistant", content: opt.greeting }]);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${selectedAssistant.id}`);
    } catch (e) {}
    setMessages([{ role: "assistant", content: selectedAssistant.greeting }]);
    setAttachedMedia([]);
    setInputValue("");
    showToast?.(
      selectedAssistant.id === "copy-legendas-instagram"
        ? "Chat limpo. Pronto para uma nova legenda!"
        : "Conversa reiniciada",
      "info"
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    Promise.all(
      files.map((file) => {
        return new Promise<AttachedMedia>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            let mime = file.type;
            if (!mime) {
              if (file.name.match(/\.(mp4|mov|webm|avi|mkv)$/i)) mime = "video/mp4";
              else if (file.name.match(/\.(png)$/i)) mime = "image/png";
              else if (file.name.match(/\.(webp)$/i)) mime = "image/webp";
              else mime = "image/jpeg";
            }
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              data: result,
              type: mime,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((newItems) => {
      setAttachedMedia((prev) => [...prev, ...newItems].slice(0, 10));
    });
    e.target.value = "";
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt !== undefined ? overridePrompt : inputValue;
    if ((!textToSend.trim() && attachedMedia.length === 0) || isLoading) return;

    const currentText = textToSend.trim();
    const currentMedia = [...attachedMedia];
    const isInstagramCaption = selectedAssistant.id === "copy-legendas-instagram";
    const hasVideo = currentMedia.some((m) => m.type.startsWith("video/") || m.name.match(/\.(mp4|mov|webm|avi|mkv)$/i));

    let defaultPrompt = "";
    if (isInstagramCaption) {
      if (currentMedia.length > 0) {
        defaultPrompt = hasVideo
          ? "Analise este vídeo anexado e gere uma legenda de alta conversão completa para o Instagram (Reels/Feed) com gancho de abertura (hook), corpo envolvente e curto, chamada para ação (CTA) e exatamente 5 hashtags (#)."
          : "Analise este flyer/imagem anexado e gere uma legenda de alta conversão completa para o Instagram com gancho de abertura (hook), corpo envolvente e curto, chamada para ação (CTA) e exatamente 5 hashtags (#).";
      } else {
        defaultPrompt = "Crie uma legenda magnética, organizada e curta para o Instagram com gancho com emoji, corpo persuasivo, CTA e exatamente 5 hashtags (#).";
      }
    } else {
      defaultPrompt = currentMedia.length > 1
        ? `Analise detalhadamente estas ${currentMedia.length} imagens de referência anexadas e gere um prompt mestre cinematográfico completo unificando e reproduzindo os melhores elementos visuais no padrão profissional do Design Builder.`
        : "Analise detalhadamente esta imagem de referência e gere o prompt mestre cinematográfico completo no padrão profissional do Design Builder.";
    }

    const finalPromptText = currentText || defaultPrompt;

    const userMsg: ChatMsg = {
      role: "user",
      content: finalPromptText,
      media: currentMedia.length > 0 ? currentMedia : undefined,
      image: currentMedia.length > 0 && currentMedia[0].type.startsWith("image/") ? currentMedia[0].data : undefined,
      images: currentMedia.filter((m) => m.type.startsWith("image/")).map((m) => m.data),
    };

    // Prepara histórico conversacional para permitir refinamento e memória de chat
    const historyPayload = messages
      .filter((m, idx) => !(idx === 0 && m.role === "assistant" && m.content === selectedAssistant.greeting))
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
        files: m.media?.map((med, idx) => ({
          name: med.name || `arquivo_${idx + 1}`,
          data: med.data,
          type: med.type,
        })) || (m.image ? [{ name: "imagem.jpg", data: m.image, type: "image/jpeg" }] : undefined),
      }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setAttachedMedia([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: selectedAssistant.id === "prompt-extractor" ? "prompt-extrator" : selectedAssistant.id,
          message: finalPromptText,
          history: historyPayload,
          imageBase64: currentMedia.length > 0 && currentMedia[0].type.startsWith("image/") ? currentMedia[0].data : undefined,
          attachedFiles: currentMedia.map((m, idx) => ({
            name: m.name || `arquivo_${idx + 1}`,
            data: m.data,
            type: m.type,
          })),
          modelId: (hasVideo || isInstagramCaption) ? "gemini-2.5-flash" : "deepseek-v4-flash",
        }),
      });

      if (!res.ok) {
        throw new Error("Falha na resposta do assistente");
      }

      const data = await res.json();
      const reply = data.response || data.text || data.prompt || "Não foi possível processar a resposta.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      console.error("Erro no chat do assistente:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, tive um problema de conexão com o servidor. Por favor, tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast?.("Legenda copiada para a área de transferência!", "success");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <>
      {/* ── Botão Flutuante Oficial (data-tour="ai-assistant") ── */}
      {!isOpen ? (
        <button
          data-tour="ai-assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-transform z-[9999] bg-brand-gradient text-white hover:scale-110 animate-pulse-slow"
          title="Assistente IA (segure para mover)"
          style={{ touchAction: "none" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle-more w-6 h-6"
            aria-hidden="true"
          >
            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
        </button>
      ) : (
        <button
          data-tour="ai-assistant"
          onClick={() => setIsOpen(false)}
          className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-transform z-[9999] bg-brand-violet text-white scale-95 cursor-pointer"
          title="Assistente IA (segure para mover)"
          style={{ touchAction: "none", backgroundColor: "rgb(124, 58, 237)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x w-6 h-6"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}

      {/* ── Drawer Flutuante Oficial do Assistente ── */}
      <div
        className={`fixed z-[9998] shadow-2xl transition-all duration-300 ${
          isMaximized
            ? "inset-4 md:inset-8"
            : "bottom-[5.5rem] right-0 left-0 h-[calc(100dvh-7rem)] md:bottom-24 md:right-6 md:left-auto md:w-[460px] md:h-[calc(100dvh-8rem)] md:max-h-[720px]"
        } ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="h-full overflow-hidden shadow-2xl border border-white/10 bg-black/95 backdrop-blur-xl rounded-t-2xl md:rounded-xl flex flex-col">
          <div className="flex flex-col h-full w-full relative">
            
            {/* Header com Seletor de Agentes (Match 1:1 com app.designbuilder.co) */}
            <div className="p-5 border-b border-brand-accent/10 bg-brand-deep/95 backdrop-blur-3xl flex items-center justify-between relative z-50">
              <div className="flex items-center gap-4 flex-1 min-w-0" ref={menuRef}>
                <div
                  className="w-10 h-10 rounded-sm bg-brand-gradient flex items-center justify-center text-white shadow-brand-purple/20 shrink-0"
                  style={{ background: "linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(168, 85, 247) 50%, rgb(217, 70, 239) 100%)" }}
                >
                  <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                </div>

                <div className="flex-1 relative z-50 min-w-0">
                  <button
                    type="button"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="listbox"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 group hover:bg-white/5 px-3 py-2 rounded-lg transition-all cursor-pointer max-w-full"
                  >
                    <div>
                      <div className="text-sm font-bold text-white text-left truncate">
                        {selectedAssistant.name}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-600 group-hover:text-brand-accent transition-all shrink-0 text-zinc-400" aria-hidden="true" />
                  </button>

                  {/* Dropdown de Agentes (role="listbox") */}
                  {isMenuOpen && (
                    <div
                      role="listbox"
                      aria-label="Selecionar agente"
                      className="absolute top-full left-0 mt-2 w-72 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-[9999] animate-fadeIn max-h-[500px] overflow-y-auto"
                    >
                      {ASSISTANT_OPTIONS.map((opt) => {
                        const isSel = selectedAssistant.id === opt.id;
                        const OptIcon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            role="option"
                            aria-selected={isSel}
                            onClick={() => handleSelectAssistant(opt)}
                            className={`w-full flex items-start gap-3 p-4 transition-all border-l-2 cursor-pointer ${
                              isSel
                                ? "bg-brand-violet/10 border-brand-accent bg-violet-600/15 border-violet-500"
                                : "hover:bg-white/5 border-transparent"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-sm bg-brand-gradient flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                              style={{ background: "linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(168, 85, 247) 50%, rgb(217, 70, 239) 100%)" }}
                            >
                              <OptIcon className="w-4 h-4 text-white" aria-hidden="true" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-semibold text-white mb-0.5">
                                {opt.name}
                              </div>
                              {opt.desc && (
                                <div className="text-xs text-zinc-400 leading-relaxed">
                                  {opt.desc}
                                </div>
                              )}
                            </div>
                            {isSel && (
                              <Check className="lucide lucide-check w-4 h-4 text-brand-accent mt-1 shrink-0 text-violet-400" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões do Header */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Resetar conversa"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Minimizar"
                  aria-label="Minimizar chat"
                >
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Corpo de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-sm p-5 text-sm leading-relaxed shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-br-none"
                        : "bg-black/40 border border-brand-accent/10 rounded-sm shadow-lg shadow-brand-purple/5 backdrop-blur-xl text-zinc-300"
                    }`}
                  >
                    {msg.media && msg.media.length > 0 ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.media.map((item, i) =>
                          item.type.startsWith("video/") ? (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900/90 border border-violet-500/30 max-w-[240px]"
                            >
                              <div className="w-8 h-8 rounded bg-violet-600/30 flex items-center justify-center text-violet-400 shrink-0">
                                <Film className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-white truncate font-medium">{item.name}</p>
                                <span className="text-[10px] text-violet-300 uppercase tracking-wider font-semibold">
                                  Vídeo
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="overflow-hidden rounded-lg border border-white/10 max-h-48 max-w-[200px]"
                            >
                              <img
                                src={item.data}
                                alt={item.name || `Anexo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      ((msg.images && msg.images.length > 0) || msg.image) && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {(msg.images && msg.images.length > 0 ? msg.images : [msg.image!]).map((img, i) => (
                            <div key={i} className="overflow-hidden rounded-lg border border-white/10 max-h-48 max-w-[200px]">
                              <img
                                src={img}
                                alt={`Anexo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    <div className="markdown-body whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Sugestões rápidas para o Criador de Legendas no início */}
                    {selectedAssistant.id === "copy-legendas-instagram" && messages.length === 1 && idx === 0 && (
                      <div className="mt-3.5 pt-3 border-t border-white/10">
                        <p className="text-[11px] text-zinc-400 font-medium mb-2">Sugestões rápidas (ou anexe seu flyer/vídeo):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Criar legenda magnética para flyer",
                            "Legenda dinâmica para Vídeo/Reels",
                            "Legenda de alta conversão com CTA",
                            "Legenda promocional com 5 hashtags",
                          ].map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSend(sug)}
                              className="text-xs bg-white/5 hover:bg-violet-600/25 hover:border-violet-500/40 border border-white/10 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full transition-all text-left cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Atalhos rápidos de refinamento da legenda gerada */}
                    {selectedAssistant.id === "copy-legendas-instagram" && msg.role === "assistant" && idx === messages.length - 1 && messages.length > 1 && (
                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        <p className="text-[11px] text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>Quer ajustar algo? Clique abaixo ou digite seu pedido:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Mudar CTA para Link na Bio",
                            "Deixar ainda mais curto",
                            "Tom mais bem-humorado",
                            "Adicionar chamada para direct",
                          ].map((refine, rIdx) => (
                            <button
                              key={rIdx}
                              type="button"
                              onClick={() => handleSend(refine)}
                              className="text-[11px] bg-white/5 hover:bg-violet-600/25 hover:border-violet-500/40 border border-white/10 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full transition-all text-left cursor-pointer"
                            >
                              {refine}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.role === "assistant" && (idx > 0 || msg.content !== selectedAssistant.greeting) && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.content, idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                            copiedIndex === idx
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : selectedAssistant.id === "copy-legendas-instagram"
                              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md shadow-violet-900/30"
                              : "hover:text-violet-300 text-zinc-400 hover:bg-white/5"
                          }`}
                          title="Copiar texto / legenda"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span className="font-semibold text-emerald-300">Copiado com Sucesso!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span className="font-semibold">
                                {selectedAssistant.id === "copy-legendas-instagram" ? "Copiar Legenda" : "Copiar"}
                              </span>
                            </>
                          )}
                        </button>

                        {selectedAssistant.id !== "copy-legendas-instagram" && onApplyPrompt && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyPrompt(msg.content);
                              showToast?.("Prompt aplicado com sucesso!", "success");
                            }}
                            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer"
                          >
                            <Sparkles size={13} />
                            <span>Usar no Studio</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-sm p-5 text-sm bg-black/40 border border-violet-500/15 text-zinc-300 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    <span>Processando resposta com IA...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box com Anexo de Flyer, Imagem ou Vídeo */}
            <div className="relative p-6 bg-zinc-950/50 border-t border-zinc-900">
              {attachedMedia.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                  {attachedMedia.map((item, idx) => (
                    <div key={item.id} className="relative inline-block">
                      {item.type.startsWith("video/") ? (
                        <div className="h-14 px-3 rounded-lg bg-zinc-900 border border-violet-500/40 flex items-center gap-2 shadow-lg max-w-[200px]">
                          <Film className="w-5 h-5 text-violet-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-white truncate font-medium">{item.name}</p>
                            <span className="text-[9px] text-violet-300 uppercase font-semibold">Vídeo</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.data}
                          alt={item.name || `Preview ${idx + 1}`}
                          className="h-14 w-14 object-cover rounded-lg border border-violet-500/40 shadow-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachedMedia((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow cursor-pointer hover:bg-red-600 z-10"
                        title="Remover anexo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 bg-zinc-900 rounded-[2rem] p-2 border border-white/5 focus-within:border-brand-accent/30 transition-all items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 hover:text-violet-400"
                  title="Anexar flyer, imagem ou vídeo"
                >
                  <Paperclip className="w-5 h-5" aria-hidden="true" />
                </button>

                <textarea
                  maxLength={10000}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    selectedAssistant.id === "copy-legendas-instagram"
                      ? "Envie flyer/vídeo ou descreva a ideia..."
                      : "Fale com o Agente..."
                  }
                  className="flex-1 bg-transparent border-none px-2 py-3 text-sm text-white outline-none resize-none h-12 scrollbar-hide placeholder:text-zinc-700 disabled:opacity-50"
                  rows={1}
                />

                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-brand-accent transition-colors cursor-pointer shrink-0 hover:text-violet-400"
                  title={isMaximized ? "Reduzir campo de texto" : "Expandir campo de texto"}
                >
                  {isMaximized ? (
                    <Minimize2 className="lucide lucide-minimize-2 w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Maximize2 className="lucide lucide-maximize-2 w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isLoading || (!inputValue.trim() && attachedMedia.length === 0)}
                  className="bg-brand-accent text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-brand-accent/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl cursor-pointer shrink-0 bg-violet-600 hover:bg-violet-500"
                  title="Enviar mensagem"
                >
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
