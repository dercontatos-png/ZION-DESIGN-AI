import React, { useState, useEffect } from "react";
import { MessageCircle, QrCode, Wifi, WifiOff, RefreshCw, Send, Sparkles, Image, Film, CheckCircle2, Mic, AlertCircle, X, ShieldCheck } from "lucide-react";

interface WhatsAppStatus {
  status: "disconnected" | "connecting" | "qr" | "connected";
  qrCode: string;
  phoneNumber: string;
  userInfo: string;
  error?: string;
}

interface WhatsAppAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const WhatsAppAssistantModal: React.FC<WhatsAppAssistantModalProps> = ({
  isOpen,
  onClose,
  userId = "admin_user"
}) => {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: "disconnected",
    qrCode: "",
    phoneNumber: "",
    userInfo: ""
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"connect" | "simulator">("connect");
  
  // Simulator state
  const [simText, setSimText] = useState<string>("");
  const [simType, setSimType] = useState<"text" | "audio" | "design" | "script">("design");
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simMessages, setSimMessages] = useState<Array<{ sender: "user" | "bot"; text: string; image?: string; type?: string; time: string }>>([
    {
      sender: "bot",
      text: "Olá! Sou seu Diretor Criativo e Assistente Zion no WhatsApp. Pode me enviar áudios, textos ou imagens que cuido de tudo!",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/whatsapp/status?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn("[WhatsAppModal] Error checking status:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, [isOpen, userId]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      await fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      await fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSend = async (overrideText?: string, overrideType?: "text" | "audio" | "design" | "script") => {
    const textToSend = overrideText || simText;
    const typeToSend = overrideType || simType;
    if (!textToSend.trim()) return;

    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      type: typeToSend,
      time: timeNow
    };

    setSimMessages(prev => [...prev, userMsg]);
    setSimText("");
    setSimLoading(true);

    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text: textToSend,
          isAudio: typeToSend === "audio",
          isDesign: typeToSend === "design",
          isScript: typeToSend === "script"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimMessages(prev => [
          ...prev,
          {
            sender: "bot" as const,
            text: data.replyText || "Comando processado com sucesso!",
            image: data.generatedImageUrl,
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err: any) {
      setSimMessages(prev => [
        ...prev,
        {
          sender: "bot" as const,
          text: "Erro ao simular resposta do assistente: " + err.message,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0e0e13] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#14141c] to-[#0c0c10]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">WhatsApp AI Assistant</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  24/7 Cloud Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400">Controle seu estúdio, gere artes e roteiros por texto e áudio de voz no WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#121218] px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("connect")}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "connect"
                ? "text-violet-400 border-violet-500"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            <QrCode size={14} />
            <span>Conectar WhatsApp</span>
            {status.status === "connected" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "simulator"
                ? "text-violet-400 border-violet-500"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            <Sparkles size={14} />
            <span>Simulador ao Vivo</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "connect" ? (
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    status.status === "connected" ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" :
                    status.status === "qr" ? "bg-amber-400 animate-pulse" :
                    status.status === "connecting" ? "bg-blue-400 animate-pulse" : "bg-zinc-500"
                  }`} />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      {status.status === "connected" ? "WhatsApp Conectado" :
                       status.status === "qr" ? "Aguardando Leitura do QR Code" :
                       status.status === "connecting" ? "Inicializando Conexão..." : "WhatsApp Desconectado"}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {status.status === "connected"
                        ? `Número: +${status.phoneNumber || "Ativo"}`
                        : "Escaneie o QR Code abaixo com seu WhatsApp para ativar"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status.status === "connected" ? (
                    <button
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <WifiOff size={13} />
                      <span>Desconectar</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                      <span>{status.status === "qr" ? "Atualizar QR" : "Conectar"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Container */}
              {status.status === "qr" && status.qrCode ? (
                <div className="flex flex-col items-center justify-center p-6 bg-[#121218] border border-white/10 rounded-2xl space-y-4 text-center">
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <img src={status.qrCode} alt="WhatsApp QR Code" className="w-56 h-56 object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Abra o WhatsApp no seu celular</p>
                    <p className="text-[11px] text-zinc-400">Vá em Configurações &gt; Aparelhos Conectados &gt; Conectar Aparelho</p>
                  </div>
                </div>
              ) : status.status === "connected" ? (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Assistente 100% Online e Pronto!</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                      Envie qualquer mensagem de texto ou áudio de voz no WhatsApp para o seu próprio número ou grupo para gerar artes e roteiros automaticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-[#121218] border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center">
                    <QrCode size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Pronto para Conectar</h4>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Clique no botão "Conectar" acima para gerar o QR Code de autenticação gratuita.
                    </p>
                  </div>
                </div>
              )}

              {/* Highlights Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-[#14141c] border border-white/5 rounded-xl space-y-1">
                  <div className="text-amber-400 flex items-center gap-1.5 text-xs font-bold">
                    <Sparkles size={14} />
                    <span>Criação de Artes</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Envie um pedido e receba a arte em alta resolução direto na conversa.</p>
                </div>

                <div className="p-3.5 bg-[#14141c] border border-white/5 rounded-xl space-y-1">
                  <div className="text-pink-400 flex items-center gap-1.5 text-xs font-bold">
                    <Mic size={14} />
                    <span>Áudios de Voz</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Fale naturalmente pelo gravador do WhatsApp e o Gemini transcreve e executa.</p>
                </div>

                <div className="p-3.5 bg-[#14141c] border border-white/5 rounded-xl space-y-1">
                  <div className="text-emerald-400 flex items-center gap-1.5 text-xs font-bold">
                    <ShieldCheck size={14} />
                    <span>Deploy 24h Grátis</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Funciona na nuvem sem precisar deixar o computador ligado.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Prompt Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Testes Rápidos de Simulação:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSimulateSend("Crie um flyer moderno de hamburgueria artesanal com o título Festival do Burger", "design")}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Image size={12} className="text-amber-400" />
                    <span>🍔 Flyer Hamburgueria</span>
                  </button>
                  <button
                    onClick={() => handleSimulateSend("Gere um flyer de pizzaria com a headline Quinta do Dobro", "audio")}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Mic size={12} className="text-pink-400" />
                    <span>🎤 Áudio: Pizza em Dobro</span>
                  </button>
                  <button
                    onClick={() => handleSimulateSend("Escreva um roteiro de Reels magnético sobre como atrair clientes para estúdio de design", "script")}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Film size={12} className="text-blue-400" />
                    <span>🎬 Roteiro de Vídeo</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-4 h-72 overflow-y-auto space-y-3 font-sans">
                {simMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                        m.sender === "user"
                          ? "bg-emerald-600/30 border border-emerald-500/40 text-emerald-100 rounded-br-none"
                          : "bg-[#181822] border border-white/10 text-zinc-200 rounded-bl-none shadow-md"
                      }`}
                    >
                      {m.type === "audio" && (
                        <div className="flex items-center gap-1.5 text-pink-400 font-bold text-[10px] uppercase">
                          <Mic size={12} />
                          <span>Áudio de Voz Transcrito</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      
                      {m.image && (
                        <div className="pt-2">
                          <img
                            src={m.image}
                            alt="Arte gerada"
                            className="rounded-xl border border-white/10 max-h-48 w-full object-cover shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
                {simLoading && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs p-2">
                    <RefreshCw size={13} className="animate-spin text-violet-400" />
                    <span>Diretor Criativo processando comando e sintetizando imagem...</span>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite uma instrução ou peça uma arte..."
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSimulateSend()}
                  className="flex-1 bg-[#14141c] border border-white/10 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSimulateSend()}
                  disabled={simLoading || !simText.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#a855f7] to-[#6d28d9] hover:from-[#d4bc97] hover:to-[#a855f7] disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Send size={13} />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
