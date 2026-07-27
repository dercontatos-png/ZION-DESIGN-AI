import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Loader2,
  Send,
  User,
  ChevronDown,
  CheckCircle2,
  Bot,
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
  RefreshCw
} from "lucide-react";
import { Client } from "../types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  images?: string[];
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
  // Ensure we always have at least one fallback client if list is empty
  const availableClients =
    clients.length > 0
      ? clients
      : [
          {
            id: 999,
            name: "Equipe Zion / Geral",
            niche: "Marketing & Agência",
            status: "Ativo" as const,
            contact: "Geral",
            planValue: 0,
            dueDate: "01",
            paymentStatus: "Em dia" as const,
            roteirosChat: []
          }
        ];

  // Active client ID with persistence
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
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-pro-preview");
  const [attachedImages, setAttachedImages] = useState<{ url: string; mimeType: string }[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active client reference
  const activeClient =
    availableClients.find((c) => c.id === activeClientId) || availableClients[0];

  // Ensure activeClientId matches availableClients
  useEffect(() => {
    if (!availableClients.some((c) => c.id === activeClientId)) {
      const firstId = availableClients[0].id;
      setActiveClientId(firstId);
      localStorage.setItem("zion_active_roteiros_client_id", String(firstId));
    }
  }, [availableClients, activeClientId]);

  // Retrieve chat history with triple fallback (client object + localStorage client history + backup_all)
  const getChatHistory = (): Message[] => {
    if (activeClient && Array.isArray(activeClient.roteirosChat) && activeClient.roteirosChat.length > 0) {
      return activeClient.roteirosChat;
    }
    // Check client-specific backup in localStorage
    try {
      const backup = localStorage.getItem(`zion_roteiros_history_${activeClient.id}`);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Check backup_all map in localStorage
    try {
      const backupAllStr = localStorage.getItem("zion_roteiros_backup_all");
      if (backupAllStr) {
        const backupAll = JSON.parse(backupAllStr);
        if (backupAll && backupAll[activeClient.id] && Array.isArray(backupAll[activeClient.id])) {
          return backupAll[activeClient.id];
        }
      }
    } catch (e) {}
    return [];
  };

  const chatHistory = getChatHistory();

  // Save chat history to parent state, local storage backups, and cloud database
  const updateChatHistory = (newHistory: Message[]) => {
    // 1. Store in client-specific history backup immediately
    try {
      localStorage.setItem(`zion_roteiros_history_${activeClient.id}`, JSON.stringify(newHistory));

      const backupAllStr = localStorage.getItem("zion_roteiros_backup_all");
      const backupAll = backupAllStr ? JSON.parse(backupAllStr) : {};
      backupAll[activeClient.id] = newHistory;
      localStorage.setItem("zion_roteiros_backup_all", JSON.stringify(backupAll));
    } catch (e) {}

    // 2. Update global clients array
    const updatedClients = availableClients.map((c) =>
      c.id === activeClient.id ? { ...c, roteirosChat: newHistory } : c
    );

    setClients(updatedClients);

    // 3. Persist global clients to localStorage
    try {
      localStorage.setItem("zion_clients", JSON.stringify(updatedClients));
    } catch (e) {}

    // 4. Directly save to Supabase/Firestore if helper provided
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

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    showToast("Roteiro copiado para a área de transferência!");
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
      showToast("Salvo na aba 'Notas & Docs' e no Supabase!");
      setTimeout(() => setSavedMsgId(null), 2500);
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar nota.");
    }
  };

  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || inputText.trim();
    if (!textToSend && attachedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      images: attachedImages.map((img) => img.url),
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMessage];
    updateChatHistory(newHistory);
    setInputText("");
    const currentAttachments = [...attachedImages];
    setAttachedImages([]);
    setIsGenerating(true);

    try {
      const clientContext = `
[CONTEXTO DO CLIENTE]
Nome: ${activeClient.name}
Nicho: ${activeClient.niche || "Não informado"}
Informações Adicionais: ${activeClient.infoExtra || "Nenhuma"}
Paleta de Cores: ${(activeClient.paletaCores || []).join(", ") || "Não informada"}

[SISTEMA DE MEMÓRIA & REGRAS DE REDAÇÃO DE ROTEIROS]
1. Você é o Especialista em Roteiros e Estratégia de Conteúdo de Vídeo.
2. NUNCA CRIE CONTEÚDO REPETIDO. Analise o histórico do chat.
3. Formate roteiros com estrutura ultra legível em Markdown:
   - 🎯 **NOME / TÍTULO DO ROTEIRO**
   - ⚡ **GANCHO INICIAL (0-3 segundos)** (focado em retenção)
   - 🎬 **DESENVOLVIMENTO DE CENA A CENA** (Falas + Instruções Visuais para edição)
   - 🚀 **CHAMADA PARA AÇÃO (CTA)**
4. Mantenha tom moderno, dinâmico e persuasivo.
`;

      const filesToSend = currentAttachments.map((img) => ({
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
        text: data.response || "Não foi possível gerar o roteiro neste momento.",
        timestamp: new Date().toISOString()
      };

      updateChatHistory([...newHistory, aiMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ **Erro no Gerador:** ${error.message || "Tente novamente."}`,
        timestamp: new Date().toISOString()
      };
      updateChatHistory([...newHistory, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearHistory = () => {
    if (
      confirm(
        `Tem certeza que deseja apagar o histórico de roteiros e memória do cliente "${activeClient.name}"?`
      )
    ) {
      updateChatHistory([]);
      try {
        localStorage.removeItem(`zion_roteiros_history_${activeClient.id}`);
      } catch (e) {}
      showToast("Memória do cliente zerada com sucesso.");
    }
  };

  const quickPrompts = [
    {
      title: "Roteiro Reels Viral",
      prompt: `Crie 1 roteiro completo para Reels/TikTok de alto engajamento focado no nicho do cliente (${activeClient.niche}). Inclua Gancho de 3s, falas e instruções de edição.`,
      icon: <Film size={14} className="text-[#c5a880]" />
    },
    {
      title: "Carrossel de 5 Lâminas",
      prompt: `Gere uma estrutura de Carrossel Educativo para Instagram em 5 lâminas. Para cada lâmina forneça a Headline, Texto Principal e Design sugerido.`,
      icon: <Layers size={14} className="text-[#c5a880]" />
    },
    {
      title: "5 Ideias de Conteúdo",
      prompt: `Analise o nicho do cliente (${activeClient.niche}) e forneça 5 ideias inéditas de posts/vídeos com alto potencial de engajamento para este mês.`,
      icon: <Lightbulb size={14} className="text-[#c5a880]" />
    },
    {
      title: "Script Direct / WhatsApp",
      prompt: `Crie um script de conversa para WhatsApp/Direct para converter leads interessados em clientes pagantes do produto do cliente.`,
      icon: <MessageSquare size={14} className="text-[#c5a880]" />
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-black text-white rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#c5a880] text-zinc-950 font-bold px-4 py-2 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-amber-300"
          >
            <CheckCircle2 size={16} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shadow-inner">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-wide">
              Gerador de Roteiros & Conteúdo
            </h2>
            <p className="text-xs text-zinc-400">
              Chat com memória dedicada para <span className="text-[#c5a880] font-semibold">{activeClient.name}</span>
            </p>
          </div>
        </div>

        {/* Controls: Model & Client Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Model Select */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-black border border-zinc-800 hover:border-[#c5a880]/50 text-zinc-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="gemini-3-pro-preview">Gemini 3 Pro (Roteiros Ricos)</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash (Ultra Rápido)</option>
          </select>

          {/* Client Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowClientSelector(!showClientSelector)}
              className="flex items-center gap-2 bg-black border border-zinc-800 hover:border-[#c5a880]/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            >
              <User size={14} className="text-[#c5a880]" />
              <span className="truncate max-w-[130px]">{activeClient.name}</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>

            <AnimatePresence>
              {showClientSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 max-h-64 overflow-y-auto flex flex-col gap-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">
                      Selecione o Cliente
                    </div>
                    {availableClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectClient(c.id)}
                        className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors text-left text-xs font-medium ${
                          activeClientId === c.id
                            ? "bg-[#c5a880]/20 text-[#c5a880] font-bold border border-[#c5a880]/30"
                            : "text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        {activeClientId === c.id && <CheckCircle2 size={14} className="text-[#c5a880]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear Chat Button */}
          {chatHistory.length > 0 && (
            <button
              onClick={clearHistory}
              title="Apagar histórico deste cliente"
              className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-red-500/20 hover:border-red-500/40 text-zinc-400 hover:text-red-400 rounded-xl transition-all"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Display Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-black text-zinc-200">
        {chatHistory.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-[70%] text-center max-w-2xl mx-auto py-8">
            <div className="w-16 h-16 bg-[#c5a880]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#c5a880]/30 text-[#c5a880] shadow-lg">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Assistente de Roteiros para <span className="text-[#c5a880]">{activeClient.name}</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
              O chat mantém o histórico deste cliente salvo no seu navegador. Escolha uma sugestão rápida ou envie seu briefing personalizado para começar.
            </p>

            {/* Quick Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.prompt)}
                  className="bg-zinc-950 border border-zinc-800 hover:border-[#c5a880]/50 hover:bg-zinc-900/80 p-4 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-white group-hover:text-[#c5a880]">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
                  msg.sender === "user"
                    ? "bg-[#c5a880] text-zinc-950"
                    : "bg-zinc-900 text-[#c5a880] border border-zinc-800"
                }`}
              >
                {msg.sender === "user" ? <User size={16} /> : <Bot size={18} />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`flex flex-col gap-2 max-w-[92%] sm:max-w-[85%] ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Attached Images */}
                {msg.images && msg.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {msg.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-28 h-28 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"
                      >
                        <img
                          src={img}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Body */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-zinc-900 border border-[#c5a880]/30 text-white font-medium shadow-md"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-200 shadow-xl w-full"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-3 prose-headings:text-white prose-headings:font-bold prose-strong:text-[#c5a880] prose-ul:list-disc prose-ul:pl-4 prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}

                  {/* AI Response Action Toolbar */}
                  {msg.sender === "ai" && (
                    <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check size={13} className="text-[#c5a880]" />
                            <span className="text-[#c5a880] font-semibold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copiar Roteiro</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveToNotes(msg.text, msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                      >
                        {savedMsgId === msg.id ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Salvo em Notas!</span>
                          </>
                        ) : (
                          <>
                            <Save size={13} />
                            <span>Salvar em Notas</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-[#c5a880] border border-zinc-800 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs text-zinc-400">
              <Loader2 size={16} className="animate-spin text-[#c5a880]" />
              <span>Gerando roteiro exclusivo e inédito...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Area */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-3 sm:p-4 shrink-0">
        {/* Attached Files Preview */}
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {attachedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#c5a880]/50 shrink-0 bg-black"
              >
                <img src={img.url} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 sm:gap-3">
          {/* File Upload Button */}
          <label
            title="Anexar imagem ou referência"
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-black border border-zinc-800 hover:border-[#c5a880]/50 text-zinc-400 hover:text-[#c5a880] cursor-pointer transition-colors shrink-0 mb-0.5"
          >
            <Paperclip size={20} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Digite seu briefing, peça um roteiro ou ideia para ${activeClient.name}...`}
              className="w-full bg-black border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880]/60 transition-colors resize-y min-h-[96px] sm:min-h-[120px] max-h-56 leading-relaxed"
              rows={3}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isGenerating || (!inputText.trim() && attachedImages.length === 0)}
              className="absolute right-2.5 bottom-3.5 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#c5a880] text-zinc-950 rounded-lg disabled:opacity-40 transition-all hover:bg-[#b09369] shadow-md"
            >
              <Send size={15} className="ml-0.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 px-1">
          <span>Memória automática mantida no navegador por cliente</span>
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
        </div>
      </div>
    </div>
  );
}
