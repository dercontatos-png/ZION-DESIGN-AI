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
  Settings,
  Mic,
  FileText,
  Send,
  Zap,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Terminal
} from "lucide-react";

interface WhatsAppTabProps {
  userId: string;
  userData: any;
  myProfile?: any;
  setMyProfile?: (profile: any) => void;
}

export default function WhatsAppTab({ userId, userData, myProfile, setMyProfile }: WhatsAppTabProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "qr" | "connected">("disconnected");
  const [qrCode, setQrCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [userInfo, setUserInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // WhatsApp Security Settings state
  const wsSettings = myProfile?.whatsappSettings || {};
  const [isRestricted, setIsRestricted] = useState<boolean>(wsSettings.respondOnlyToOwner === true);
  const [ownerNumber, setOwnerNumber] = useState<string>(wsSettings.ownerNumber || "");
  const [authorizedNumbers, setAuthorizedNumbers] = useState<string>(wsSettings.authorizedNumbers || "");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state if myProfile updates
  useEffect(() => {
    if (myProfile?.whatsappSettings) {
      setIsRestricted(myProfile.whatsappSettings.respondOnlyToOwner === true);
      setOwnerNumber(myProfile.whatsappSettings.ownerNumber || "");
      setAuthorizedNumbers(myProfile.whatsappSettings.authorizedNumbers || "");
    }
  }, [myProfile]);

  const handleSaveSettings = () => {
    if (!setMyProfile) return;
    const updatedProfile = {
      ...myProfile,
      whatsappSettings: {
        respondOnlyToOwner: isRestricted,
        ownerNumber,
        authorizedNumbers
      }
    };
    setMyProfile(updatedProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Simulator State
  const [simText, setSimText] = useState<string>("");
  const [simType, setSimType] = useState<"text" | "audio" | "receipt">("text");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<string>("");
  const [simCommand, setSimCommand] = useState<string>("");

  // Poll status from backend
  const checkStatus = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/whatsapp/status?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setQrCode(data.qrCode);
        setPhoneNumber(data.phoneNumber);
        setUserInfo(data.userInfo);
        if (data.error) setError(data.error);
      }
    } catch (err) {
      console.error("Error checking WhatsApp status:", err);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleConnect = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setStatus("connecting");
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
    if (!userId) return;
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
      }
    } catch (err) {
      setError("Erro ao desconectar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !simText.trim()) return;

    setIsSimulating(true);
    setSimResponse("");
    setSimCommand("");

    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text: simText,
          isAudio: simType === "audio",
          isReceipt: simType === "receipt"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimResponse(data.replyText);
        setSimCommand(data.command);
        setSimText("");
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

  // Safe fetch of logs from userData
  const logs = userData?.whatsappLogs || [];

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-zinc-900 border border-emerald-500/10 rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
              <Sparkles size={12} /> NOVO RECURSO
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Automação WhatsApp <span className="text-emerald-400">Smart Agent</span>
            </h1>
            <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
              Conecte seu WhatsApp pessoal ou profissional para ter um assistente inteligente rodando 24 horas. Crie tarefas, lance despesas, cadastre clientes e consulte sua agenda diretamente por texto ou áudio.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/60 p-4 rounded-2xl border border-white/5 backdrop-blur-sm self-start md:self-auto">
            <div className={`p-3 rounded-xl ${status === "connected" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              {status === "connected" ? <CheckCircle size={24} /> : <MessageSquare size={24} />}
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Status da Conexão</p>
              <p className="text-sm font-semibold text-white">
                {status === "connected" ? "Conectado e Ativo" : "Aguardando Conexão"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Connection Setup Container (Left) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode size={20} className="text-emerald-400" /> Dispositivo Virtual
              </h2>
              {status !== "disconnected" && (
                <button
                  onClick={checkStatus}
                  className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition"
                  title="Atualizar"
                >
                  <RefreshCw size={14} className="animate-spin" />
                </button>
              )}
            </div>

            <div className="flex flex-col items-center justify-center min-h-[300px] border border-white/5 bg-zinc-950/40 rounded-2xl p-6">
              {status === "disconnected" && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
                    <MessageSquare size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white">Nenhum WhatsApp Conectado</p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      Inicie o trabalhador de conexão para gerar o seu QR Code individual de sincronização.
                    </p>
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold text-sm shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    Gerar Novo QR Code
                  </button>
                </div>
              )}

              {status === "connecting" && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                    <RefreshCw size={32} className="animate-spin duration-1000" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white">Iniciando Servidor...</p>
                    <p className="text-xs text-zinc-400">
                      Isto pode levar de 5 a 10 segundos. O QR Code será exibido assim que estiver pronto.
                    </p>
                  </div>
                </div>
              )}

              {status === "qr" && qrCode && (
                <div className="text-center space-y-6">
                  <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/40 inline-block border border-white/10">
                    <img src={qrCode} alt="WhatsApp Connection QR Code" className="w-56 h-56" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center justify-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      QR Code Pronto!
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Abra o WhatsApp no seu celular, vá em <span className="text-white font-semibold">Aparelhos Conectados</span> e escaneie a imagem acima.
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-red-400 hover:text-red-300 font-medium underline"
                  >
                    Cancelar Conexão
                  </button>
                </div>
              )}

              {status === "connected" && (
                <div className="text-center space-y-6 py-6 w-full">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/5">
                    <CheckCircle size={44} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-white">Dispositivo Conectado!</p>
                    <div className="inline-flex flex-col gap-1.5 bg-zinc-950 p-4 rounded-xl border border-white/5 w-full text-left">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone size={14} className="text-emerald-400" />
                        <span className="font-mono text-white">+{phoneNumber || "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <User size={14} className="text-emerald-400" />
                        <span>Nome: <span className="text-white font-semibold">{userInfo || "Conta Sincronizada"}</span></span>
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
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* WhatsApp Privacy & Access Control Settings */}
          {setMyProfile && (
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Settings size={16} className="text-emerald-400 animate-spin-slow" /> Controle de Acesso
              </h3>
              
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Restringir a Números Autorizados</p>
                    <p className="text-[10px] text-zinc-500 max-w-[200px]">
                      Responder apenas a mensagens do seu número ou dos administradores cadastrados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRestricted(!isRestricted)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isRestricted ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                        isRestricted ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {isRestricted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 pt-2 border-t border-white/5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Seu Número de WhatsApp (Proprietário)
                      </label>
                      <input
                        type="text"
                        value={ownerNumber}
                        onChange={(e) => setOwnerNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Ex: 5511999999999"
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                      <p className="text-[9px] text-zinc-500">
                        Insira com DDI (Ex: 55 para o Brasil) + DDD + Número. Não use espaços, traços ou parênteses.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Outros Administradores Autorizados
                      </label>
                      <input
                        type="text"
                        value={authorizedNumbers}
                        onChange={(e) => setAuthorizedNumbers(e.target.value)}
                        placeholder="Ex: 5511888888888, 5511777777777"
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                      <p className="text-[9px] text-zinc-500">
                        Insira os números separados por vírgula.
                      </p>
                    </div>
                  </motion.div>
                )}

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle size={14} className={saveSuccess ? "text-emerald-400 animate-bounce" : "text-zinc-400"} />
                  {saveSuccess ? "Configurações Salvas!" : "Salvar Configurações"}
                </button>
              </div>
            </div>
          )}

          {/* Quick Guide */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={16} className="text-amber-400" /> Como Utilizar o Bot
            </h3>
            <ul className="space-y-3.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Envie mensagens de texto ou áudio diretamente para <span className="text-white font-semibold">o seu próprio número</span> (um chat consigo mesmo) ou para a conta conectada.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Diga coisas como: <span className="text-emerald-400 font-medium">"Criar tarefa de revisar o design amanhã"</span> ou envie áudios explicando despesas <span className="text-emerald-400 font-medium">"Paguei 45 reais de gasolina hoje de tarde"</span>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>O agente processa com Gemini AI, atualiza a plataforma em tempo real e responde no WhatsApp confirmando!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Chat Logs and Interactive Simulator (Right) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Interactive Tester & Simulator */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal size={20} className="text-amber-400" /> Simulador de Interação (Testador)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                SEM NECESSIDADE DE CELULAR
              </span>
            </div>
            
            <p className="text-xs text-zinc-400">
              Teste o entendimento do agente do WhatsApp agora mesmo! Simule comandos de voz, textos ou fotos de comprovantes sem precisar escanear o QR Code.
            </p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSimType("text")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "text"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <MessageSquare size={14} /> Mensagem de Texto
                </button>
                <button
                  type="button"
                  onClick={() => setSimType("audio")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "audio"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Mic size={14} /> Mensagem de Áudio (Voz)
                </button>
                <button
                  type="button"
                  onClick={() => setSimType("receipt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    simType === "receipt"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <FileText size={14} /> Comprovante de Pagamento
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder={
                    simType === "text"
                      ? "Ex: Criar tarefa de ligar para o cliente Maria na segunda-feira..."
                      : simType === "audio"
                      ? "Fale o texto simulado do áudio: Ex: 'Gravar despesa de R$ 50 de combustível'..."
                      : "Fale os dados do comprovante: Ex: 'Comprovante Pix R$ 120 para hospedagem do site'..."
                  }
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                  disabled={isSimulating}
                />
                <button
                  type="submit"
                  disabled={isSimulating || !simText.trim()}
                  className="absolute right-2 top-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black transition-all cursor-pointer"
                >
                  {isSimulating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>

            {/* Simulation Response Display */}
            <AnimatePresence>
              {simResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-zinc-950 border border-white/5 p-4 rounded-2xl space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Resposta do Bot</span>
                    {simCommand && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Database size={10} /> Comando: {simCommand}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 italic">
                    "{simResponse}"
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    💡 Os dados já foram injetados no seu painel em tempo real e estão sincronizados com a nuvem!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Webhook Processed Messages Logs */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-emerald-400" /> Registro de Atividades Recentes
            </h2>
            <p className="text-xs text-zinc-400">
              Mensagens de áudio, comprovantes e textos que foram interpretados pela inteligência artificial.
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                  <p className="text-sm text-zinc-500">Nenhum comando processado recentemente.</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Conecte seu WhatsApp ou utilize o Simulador para testar.</p>
                </div>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4 space-y-3 relative hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-900 text-zinc-400 border border-white/5">
                          Remetente: {log.sender === "simulador_teste" ? "Simulador" : `+${log.sender}`}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {log.command}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Incoming Message */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Mensagem Recebida</span>
                        <div className="bg-zinc-900/40 p-2.5 rounded-xl text-xs text-zinc-300 border border-white/5">
                          {log.message}
                        </div>
                      </div>

                      {/* Bot Response */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Ação & Resposta do Bot</span>
                        <div className="bg-emerald-500/[0.03] p-2.5 rounded-xl text-xs text-emerald-300/90 border border-emerald-500/10">
                          {log.reply}
                        </div>
                      </div>
                    </div>
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
