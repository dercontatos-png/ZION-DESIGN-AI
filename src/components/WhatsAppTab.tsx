import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  QrCode,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  User,
  Mic,
  FileText,
  Send,
  Zap,
  HelpCircle,
  Layers,
  Sparkles,
  Database,
  Radio,
  Clock,
  ShieldCheck,
  Bot
} from "lucide-react";

interface WhatsAppTabProps {
  userId?: string;
  userData?: any;
  myProfile?: any;
  setMyProfile?: (profile: any) => void;
}

export default function WhatsAppTab({ userId = "admin_user", userData }: WhatsAppTabProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "qr" | "connected">("disconnected");
  const [qrCode, setQrCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [userInfo, setUserInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  // Simulator State
  const [simText, setSimText] = useState<string>("Crie um flyer moderno de hamburgueria artesanal com o título Festival do Burger");
  const [simType, setSimType] = useState<"design" | "script" | "audio" | "text" | "receipt">("design");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<string>("");
  const [simCommand, setSimCommand] = useState<string>("");
  const [simImage, setSimImage] = useState<string>("");

  // Poll status & real-time logs from backend
  const checkStatus = async () => {
    try {
      const [resStatus, resSync] = await Promise.all([
        fetch(`/api/whatsapp/status?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/whatsapp/sync-data?userId=${encodeURIComponent(userId)}`)
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatus(data.status);
        setQrCode(data.qrCode);
        setPhoneNumber(data.phoneNumber);
        setUserInfo(data.userInfo);
        if (data.error) setError(data.error);
        else setError("");
      }

      if (resSync.ok) {
        const syncData = await resSync.json();
        if (Array.isArray(syncData.whatsappLogs) && syncData.whatsappLogs.length > 0) {
          setLiveLogs(syncData.whatsappLogs);
        }
      }
    } catch (err) {
      console.error("Error checking WhatsApp status:", err);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [userId]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError("");
    setStatus("connecting");
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await checkStatus();
      } else {
        const errData = await res.json();
        setError(errData.error || "Falha ao iniciar conexão.");
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setStatus("disconnected");
        setQrCode("");
        setPhoneNumber("");
        setUserInfo("");
        setError("");
      }
    } catch (err) {
      setError("Erro ao desconectar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simText.trim()) return;

    setIsSimulating(true);
    setSimResponse("");
    setSimCommand("");
    setSimImage("");

    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text: simText,
          isAudio: simType === "audio",
          isDesign: simType === "design",
          isScript: simType === "script",
          isReceipt: simType === "receipt"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimResponse(data.replyText || "Comando processado com sucesso!");
        setSimCommand(data.command || "PROCESSED");
        if (data.generatedImageUrl) {
          setSimImage(data.generatedImageUrl);
        }
        checkStatus();
      } else {
        const errData = await res.json();
        setError(errData.error || "Falha na simulação.");
      }
    } catch (err) {
      setError("Erro de rede ao simular mensagem.");
    } finally {
      setIsSimulating(false);
    }
  };

  const displayLogs = liveLogs.length > 0 ? liveLogs : (userData?.whatsappLogs || []);

  return (
    <div className="space-y-6 p-1 sm:p-2">
      {/* Header Banner - Zion Obsidian & Gold Palette */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#18181b] via-[#0e0e11] to-black border border-violet-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30 inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(188, 132, 35,0.1)]">
                <Sparkles size={11} className="text-violet-400" /> 24/7 Cloud Ready
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10">
                100% Gratuito
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                <ShieldCheck size={11} /> Multi-Tenant Seguro
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Assistente de IA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5cfb3] via-[#a855f7] to-[#9a7d56]">WhatsApp Zion</span>
            </h1>
            
            <p className="text-zinc-400 max-w-xl text-xs sm:text-sm leading-relaxed">
              Gere artes em alta definição, crie roteiros de vídeo, agende tarefas e controle o CRM da sua agência direto pelo WhatsApp por <strong className="text-zinc-200">mensagens de texto e áudios de voz</strong>.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-4 bg-black/90 p-4 sm:p-5 rounded-2xl border border-violet-500/20 backdrop-blur-xl shadow-xl shrink-0">
            <div className={`p-3.5 rounded-xl transition-all ${
              status === "connected" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]" :
              status === "qr" ? "bg-violet-500/20 text-violet-400 border border-violet-500/40 animate-pulse" :
              status === "connecting" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse" :
              "bg-zinc-900 border border-white/5 text-zinc-400"
            }`}>
              {status === "connected" ? <CheckCircle size={24} /> : <Bot size={24} />}
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status do Assistente</p>
              <p className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  status === "connected" ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" :
                  status === "qr" ? "bg-[#a855f7] animate-ping" :
                  status === "connecting" ? "bg-blue-400 animate-pulse" :
                  "bg-zinc-600"
                }`} />
                {status === "connected" ? <span className="text-emerald-400 font-bold">Conectado e Ativo</span> :
                 status === "qr" ? <span className="text-violet-400 font-bold">Aguardando QR Code</span> :
                 status === "connecting" ? <span className="text-blue-400 font-bold">Iniciando Servidor...</span> : 
                 <span className="text-zinc-400">Desconectado</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code & Connection Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-[#121216] to-[#0a0a0d] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode size={18} className="text-violet-400" /> Conexão do Dispositivo
              </h2>
              {status !== "disconnected" && (
                <button
                  onClick={checkStatus}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-violet-400 border border-white/5 transition cursor-pointer"
                  title="Atualizar Status"
                >
                  <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                </button>
              )}
            </div>

            <div className="flex flex-col items-center justify-center min-h-[330px] border border-white/5 bg-black/70 rounded-2xl p-6 relative">
              {status === "disconnected" && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto text-violet-400 shadow-[0_0_20px_rgba(188, 132, 35,0.1)]">
                    <MessageSquare size={30} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-base">Pronto para Conectar</p>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Clique no botão abaixo para gerar o QR Code e parear seu WhatsApp em poucos segundos.
                    </p>
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#b3936a] hover:from-[#d4b992] hover:to-[#a855f7] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                    <span>Gerar Novo QR Code</span>
                  </button>
                </div>
              )}

              {status === "connecting" && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto text-violet-400 animate-pulse">
                    <RefreshCw size={28} className="animate-spin duration-1000" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">Conectando aos Servidores...</p>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Gerando canal seguro de autenticação com o WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {status === "qr" && qrCode && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-3 rounded-2xl shadow-2xl inline-block border-2 border-violet-500">
                    <img src={qrCode} alt="WhatsApp Connection QR Code" className="w-52 h-52 object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xs flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Aponte a Câmera do WhatsApp
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-xs">
                      No WhatsApp: <strong>Configurações &gt; Aparelhos Conectados &gt; Conectar Aparelho</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                  >
                    Cancelar Conexão
                  </button>
                </div>
              )}

              {status === "connected" && (
                <div className="text-center space-y-5 py-4 w-full">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                    <CheckCircle size={36} />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-base font-black text-white">Dispositivo 100% Conectado!</p>
                    <div className="inline-flex flex-col gap-2 bg-[#0d0d10] p-4 rounded-xl border border-white/5 w-full text-left">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone size={13} className="text-violet-400" />
                        <span className="font-mono text-white font-semibold">+{phoneNumber || "Ativo"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <User size={13} className="text-violet-400" />
                        <span>Nome: <span className="text-white font-semibold">{userInfo || "Conta Sincronizada"}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-400/90 pt-1 border-t border-white/5">
                        <Radio size={12} className="animate-pulse" />
                        <span className="text-[11px]">Sincronização em tempo real ativa</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-xs transition cursor-pointer"
                  >
                    Desconectar WhatsApp
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Quick How to Use Card */}
          <div className="bg-gradient-to-b from-[#121216] to-[#0a0a0d] border border-white/10 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={15} className="text-violet-400" /> Como Usar o Assistente
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Envie mensagens de texto ou áudio para <strong>o seu próprio número</strong> no WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Peça: <span className="text-violet-400">"Gere uma arte de pizzaria para quinta"</span> ou <span className="text-zinc-200">"Escreva um roteiro de Reels sobre finanças"</span>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>O Diretor Criativo responde na hora com o texto e o arquivo da arte gerada em alta resolução!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Tester & Activity Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Tester */}
          <div className="bg-gradient-to-b from-[#121216] to-[#0a0a0d] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-violet-400" /> Testador Interativo ao Vivo
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30">
                SIMULADOR WEB
              </span>
            </div>
            
            <p className="text-xs text-zinc-400">
              Simule pedidos de arte, roteiros, áudios de voz e tarefas sem precisar do celular em mãos:
            </p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setSimType("design"); setSimText("Crie um flyer moderno de hamburgueria artesanal com o título Festival do Burger"); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "design"
                      ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(188, 132, 35,0.15)]"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Sparkles size={13} className="text-violet-400" /> Criar Arte (Flyer)
                </button>

                <button
                  type="button"
                  onClick={() => { setSimType("script"); setSimText("Escreva um roteiro de Reels sobre como atrair clientes para estúdio de design"); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "script"
                      ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(188, 132, 35,0.15)]"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <FileText size={13} className="text-violet-400" /> Roteiro de Vídeo
                </button>

                <button
                  type="button"
                  onClick={() => { setSimType("audio"); setSimText("Gere um flyer de pizzaria com a headline Quinta do Dobro"); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "audio"
                      ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(188, 132, 35,0.15)]"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Mic size={13} className="text-violet-400" /> Áudio de Voz
                </button>

                <button
                  type="button"
                  onClick={() => { setSimType("text"); setSimText("Adicionar tarefa de enviar contrato para o cliente na segunda"); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "text"
                      ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(188, 132, 35,0.15)]"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <MessageSquare size={13} className="text-violet-400" /> Tarefa / Mensagem
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Digite sua instrução para o Diretor Criativo..."
                  className="w-full bg-black/80 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
                  disabled={isSimulating}
                />
                <button
                  type="submit"
                  disabled={isSimulating || !simText.trim()}
                  className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#b3936a] hover:from-[#d4b992] hover:to-[#a855f7] disabled:opacity-40 text-black transition-all cursor-pointer font-bold shadow-md shadow-violet-600/20"
                >
                  {isSimulating ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </form>

            {/* Simulation Response Display */}
            <AnimatePresence>
              {(simResponse || simImage) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-black/90 border border-violet-500/30 p-4 rounded-2xl space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot size={13} /> Resposta do Diretor Criativo
                    </span>
                    {simCommand && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                        <Database size={10} /> Comando: {simCommand}
                      </span>
                    )}
                  </div>
                  {simResponse && (
                    <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {simResponse}
                    </p>
                  )}
                  {simImage && (
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={11} /> Arte Gerada em Alta Definição:
                      </p>
                      <img
                        src={simImage}
                        alt="Arte gerada pelo WhatsApp"
                        className="rounded-xl border border-white/10 max-h-72 w-full object-cover shadow-2xl"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity Logs */}
          <div className="bg-gradient-to-b from-[#121216] to-[#0a0a0d] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-violet-400" /> Registro de Atividades Recentes
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono">
                {displayLogs.length} {displayLogs.length === 1 ? "evento" : "eventos"}
              </span>
            </div>
            
            <p className="text-xs text-zinc-400">
              Histórico de mensagens de voz, textos e designs processados:
            </p>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {displayLogs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/30">
                  <Clock size={24} className="mx-auto text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-400 font-semibold">Nenhum comando processado recentemente.</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Conecte o seu WhatsApp ou utilize o Testador acima para testar.</p>
                </div>
              ) : (
                displayLogs.map((log: any) => (
                  <div key={log.id} className="bg-black/80 border border-white/5 hover:border-violet-500/20 transition-all rounded-2xl p-4 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        {log.command || "PROCESSED"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <strong className="text-zinc-400">Pedido:</strong> {log.message}
                    </p>
                    <p className="text-xs text-[#e5cfb3] leading-relaxed bg-violet-500/5 p-2.5 rounded-xl border border-violet-500/10">
                      <strong className="text-violet-400">Resposta:</strong> {log.reply}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
