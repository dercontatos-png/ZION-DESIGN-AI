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
  Search
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
    desc: "",
    greeting: "Olá! Eu sou Prompt Extractor.",
    icon: Bot,
  },
  {
    id: "creative-assistant",
    name: "Creative Assistant",
    desc: "Ajuda a ter ideias para cenários e composições.",
    greeting: "Olá! Eu sou o Creative Assistant. Me conte sobre seu projeto ou conceito para explorarmos ideias de cenários, iluminação e composições marcantes.",
    icon: Wand2,
  },
  {
    id: "diretor-criativo",
    name: "Diretor Criativo",
    desc: "Mentor visual que guia você na criação de peças impactantes com direções criativas estratégicas.",
    greeting: "Olá! Sou seu Diretor Criativo. Qual direção artística ou conceito visual deseja estruturar para o seu projeto hoje?",
    icon: BookOpenCheck,
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

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface DesignBuilderAssistantProps {
  onApplyPrompt?: (prompt: string) => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const DesignBuilderAssistant: React.FC<DesignBuilderAssistantProps> = ({
  onApplyPrompt,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantOption>(ASSISTANT_OPTIONS[0]);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: ASSISTANT_OPTIONS[0].greeting },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
    setMessages([{ role: "assistant", content: opt.greeting }]);
  };

  const handleReset = () => {
    setMessages([{ role: "assistant", content: selectedAssistant.greeting }]);
    setAttachedImage(null);
    setInputValue("");
    showToast?.("Conversa reiniciada", "info");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading) return;

    const currentText = inputValue.trim();
    const currentImg = attachedImage;

    const userMsg: ChatMsg = {
      role: "user",
      content: currentText || (currentImg ? "Analise esta imagem de referência e extraia o prompt mestre completo." : ""),
      image: currentImg || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setAttachedImage(null);
    setIsLoading(true);

    try {
      let promptText = currentText;
      if (!promptText && currentImg) {
        promptText = "Analise detalhadamente esta imagem de referência e gere o prompt mestre cinematográfico completo no padrão profissional do Design Builder.";
      }

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: selectedAssistant.id === "prompt-extractor" ? "prompt-extrator" : selectedAssistant.id,
          message: promptText,
          imageBase64: currentImg || undefined,
          modelId: "deepseek-v4-flash",
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
    showToast?.("Texto copiado para a área de transferência!", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
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
                    {msg.image && (
                      <div className="mb-3 overflow-hidden rounded-lg border border-white/10 max-h-48">
                        <img
                          src={msg.image}
                          alt="Anexo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {msg.role === "assistant" && (
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.content, idx)}
                          className="flex items-center gap-1 hover:text-violet-300 transition-colors cursor-pointer"
                          title="Copiar texto"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={13} className="text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        {onApplyPrompt && (
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

            {/* Input Box com Anexo de Imagem (Match 1:1 com app.designbuilder.co) */}
            <div className="relative p-6 bg-zinc-950/50 border-t border-zinc-900">
              {attachedImage && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg border border-violet-500/40 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow cursor-pointer hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex gap-3 bg-zinc-900 rounded-[2rem] p-2 border border-white/5 focus-within:border-brand-accent/30 transition-all items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 hover:text-violet-400"
                  title="Anexar imagem"
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
                  placeholder="Fale com o Agente..."
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
                  onClick={handleSend}
                  disabled={isLoading || (!inputValue.trim() && !attachedImage)}
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
