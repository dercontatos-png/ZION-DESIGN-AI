import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Check, RefreshCw, Wifi, HardDrive, Trash2, Upload, FileCode, ShieldCheck, Clock, Info } from 'lucide-react';
import { Client, Transaction, Task, CalendarEvent } from '../types';
import { getStorageStats, cleanImageStorage } from '../utils/imageStorageManager';
import { getUsageStats, checkLiveApiQuota, getCooldownRemainingSeconds, getQuotaGuideInfo } from '../utils/apiUsageManager';

const SettingsModal: React.FC<{ 
  onClose: () => void; 
  myProfile: any;
  setMyProfile: (profile: any) => void;
  googleToken: string | null;
  clients: Client[];
  transactions: Transaction[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  setClients: (clients: Client[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setTasks: (tasks: Task[]) => void;
  setCalendarEvents: (calendarEvents: CalendarEvent[]) => void;
}> = ({ 
  onClose, myProfile, setMyProfile, 
  googleToken, clients, transactions, tasks, calendarEvents,
  setClients, setTransactions, setTasks, setCalendarEvents 
}) => {
  const [apiKey, setApiKey] = useState(myProfile?.geminiApiKey || localStorage.getItem('custom_gemini_api_key') || '');
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [storageStats, setStorageStats] = useState(() => getStorageStats());
  const [cleanNotice, setCleanNotice] = useState('');
  const [vertexStatus, setVertexStatus] = useState<{ hasKey: boolean; projectId?: string; clientEmail?: string }>({ hasKey: false });
  const [uploadNotice, setUploadNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usageStats, setUsageStats] = useState(() => getUsageStats());
  const [cooldownSec, setCooldownSec] = useState(() => getCooldownRemainingSeconds());
  const [liveQuotaInfo, setLiveQuotaInfo] = useState<any>(null);
  const quotaGuide = getQuotaGuideInfo();

  useEffect(() => {
    fetch('/api/check-vertex-key')
      .then(res => res.json())
      .then(data => setVertexStatus(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldownSec(getCooldownRemainingSeconds());
      setUsageStats(getUsageStats());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCleanImageStorageNow = () => {
    const res = cleanImageStorage(true);
    setStorageStats(getStorageStats());
    setCleanNotice(res.logMessage);
    setTimeout(() => setCleanNotice(''), 4000);
  };

  const handleSaveKey = async () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('custom_gemini_api_key', trimmedKey);
      setMyProfile({ ...myProfile, geminiApiKey: trimmedKey });

      // If key is JSON content, upload to server
      if (trimmedKey.startsWith('{') && trimmedKey.includes('private_key')) {
        try {
          const resp = await fetch('/api/upload-vertex-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonContent: trimmedKey })
          });
          const data = await resp.json();
          if (data.success) {
            setUploadNotice(`✅ ${data.message}`);
            setVertexStatus({ hasKey: true, projectId: data.projectId, clientEmail: data.clientEmail });
          } else {
            setUploadNotice(`⚠️ ${data.error}`);
          }
        } catch (err: any) {
          setUploadNotice(`⚠️ Erro ao salvar no servidor: ${err.message}`);
        }
      }
    } else {
      localStorage.removeItem('custom_gemini_api_key');
      setMyProfile({ ...myProfile, geminiApiKey: '' });
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const handleJsonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setApiKey(text);

      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch('/api/upload-vertex-key', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();

      if (data.success) {
        localStorage.setItem('custom_gemini_api_key', text);
        setMyProfile({ ...myProfile, geminiApiKey: text });
        setUploadNotice(`✅ ${data.message}`);
        setVertexStatus({ hasKey: true, projectId: data.projectId, clientEmail: data.clientEmail });
      } else {
        setUploadNotice(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setUploadNotice(`❌ Erro na leitura do arquivo: ${err.message}`);
    }
  };

  const handleTestToken = async () => {
    setIsTesting(true);
    try {
      const res = await checkLiveApiQuota(apiKey);
      setLiveQuotaInfo(res);
      setTestSuccess(res.status === "active");
      setUsageStats(getUsageStats());
    } catch (e) {
      console.error("Test token error:", e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-[#c5a880]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar my-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Configurações de Credenciais</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        {/* Vertex AI JSON Key Info Status */}
        {vertexStatus.hasKey && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">Chave Vertex AI (JSON) Ativa</span>
              <span className="text-emerald-400/80 font-mono text-[11px]">Projeto: {vertexStatus.projectId || 'Ativo'}</span>
            </div>
          </div>
        )}

        {/* API Key / JSON Credentials Section */}
        <div className="mb-6 p-4 bg-black rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Key size={14} className="text-[#c5a880]" /> Chave API ou JSON do Vertex AI
          </label>
          
          <div className="space-y-2">
            <textarea 
              rows={3}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua Chave API (AIzaSy...) ou cole o conteúdo JSON da sua Conta de Serviço do Vertex AI ({...})"
              className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]/50 font-mono"
            />

            <div className="flex gap-2">
              <button 
                onClick={handleSaveKey}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  saved ? 'bg-emerald-500 text-zinc-950' : 'bg-[#c5a880] text-zinc-950 hover:bg-[#b59b75]'
                }`}
              >
                {saved ? <Check size={14} /> : 'Salvar Credenciais'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-[#111] hover:bg-zinc-700 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Carregar arquivo chave-vertex.json do seu computador"
              >
                <Upload size={14} className="text-[#c5a880]" />
                <span>Carregar .JSON</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleJsonFileUpload} 
              />
            </div>
          </div>

          {uploadNotice && (
            <p className="text-[11px] p-2 bg-black border border-white/5 rounded-xl text-zinc-300 leading-normal">
              {uploadNotice}
            </p>
          )}

          <p className="text-[10px] text-zinc-500 leading-normal">
            Você pode colar o arquivo JSON da sua Conta de Serviço (Service Account) do Vertex AI ou fazer o upload do arquivo <code className="text-[#c5a880] font-mono">chave-vertex.json</code>. O sistema utilizará suas credenciais diretamente nas requisições.
          </p>
        </div>

        {/* Diagnostics & API Quota Section */}
        <div className="mb-6 p-4 bg-black rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wifi size={14} className="text-emerald-500" /> Diagnóstico e Cota da API
            </span>
            <span className="text-[10px] text-[#c5a880] font-mono font-bold">{usageStats.generatedToday} artes hoje</span>
          </label>
          <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${liveQuotaInfo?.status === 'quota_exceeded' ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-xs text-zinc-300 font-medium">Status da Conexão:</span>
            </div>
            <span className={`text-xs font-bold ${liveQuotaInfo?.status === 'quota_exceeded' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {liveQuotaInfo?.status === 'quota_exceeded' ? 'Cota Atingida (429)' : 'Ativa (Vertex AI / Google API)'}
            </span>
          </div>

          {/* Cooldown Status Badge */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${cooldownSec > 0 ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'}`}>
            <div className="flex items-center gap-2">
              <Clock size={16} className={cooldownSec > 0 ? "animate-pulse text-amber-400 shrink-0" : "text-emerald-400 shrink-0"} />
              <div className="text-xs">
                <span className="font-bold block">
                  {cooldownSec > 0 ? `Aguarde ${cooldownSec}s para próximo disparo seguro` : 'Pronto para gerar nova arte!'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {cooldownSec > 0 ? 'Intervalo recomendado de 30s para evitar Erro 429 da API' : 'Sem risco de bloqueio por frequência neste momento'}
                </span>
              </div>
            </div>
          </div>

          {/* Frequência Recomendada & Limites Box */}
          <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-xs space-y-2">
            <h4 className="text-[#c5a880] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info size={13} /> Guia Prático de Frequência & Cotas
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-black/60 p-2 rounded-lg border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Frequência Segura:</span>
                <strong className="text-emerald-400">1 arte a cada 30s</strong>
              </div>
              <div className="bg-black/60 p-2 rounded-lg border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Máximo por Minuto:</span>
                <strong className="text-zinc-200">{quotaGuide.maxRpm}</strong>
              </div>
            </div>
            <ul className="text-[10px] text-zinc-400 space-y-1.5 pl-1 pt-1 leading-relaxed">
              {quotaGuide.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {liveQuotaInfo && (
            <div className="p-2.5 bg-black/60 border border-white/5 rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#c5a880]">{liveQuotaInfo.keyType}</p>
              <p className="text-[11px] text-zinc-300">{liveQuotaInfo.message}</p>
              <p className="text-[10px] text-zinc-500">Estimativa: {liveQuotaInfo.dailyEstimate}</p>
            </div>
          )}

          <button
            onClick={handleTestToken}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black hover:bg-[#111] border border-white/5 hover:border-white/5 text-xs font-bold text-zinc-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isTesting ? "animate-spin text-[#c5a880]" : "text-[#c5a880]"} />
            <span>{isTesting ? "Verificando Cota e Conexão..." : testSuccess ? "Conexão OK!" : "Testar Token & Cota da API"}</span>
          </button>
        </div>

        {/* Image Storage Section */}
        <div className="mb-6 p-4 bg-black rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <HardDrive size={14} className="text-[#c5a880]" /> Armazenamento de Imagens
          </label>
          <div className="space-y-1.5 bg-black/50 p-3 rounded-xl border border-white/[0.03]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Ocupação do Navegador:</span>
              <span className={`font-mono font-bold ${storageStats.isNearLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
                {storageStats.percentageUsed}% (~{Math.round(storageStats.totalChars / 1024)} KB)
              </span>
            </div>
            <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${storageStats.isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, storageStats.percentageUsed)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              ⚡ <strong className="text-zinc-400">Limpeza Automática Ativa:</strong> Quando o armazenamento de imagens ultrapassar 75% ou atingir o limite, imagens e galerias antigas são limpas automaticamente. Seus dados de clientes e tarefas permanecem intactos.
            </p>
          </div>

          {cleanNotice && (
            <p className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-xl">
              {cleanNotice}
            </p>
          )}

          <button
            onClick={handleCleanImageStorageNow}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black hover:bg-[#111] border border-white/5 text-xs font-bold text-amber-400 rounded-xl transition-all"
          >
            <Trash2 size={12} />
            <span>Executar Limpeza Manual de Imagens</span>
          </button>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => { localStorage.removeItem('chatMessages'); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-[#111] text-zinc-300 text-xs transition-colors"
          >
            Limpar Chat
          </button>
          <button 
            onClick={() => { localStorage.removeItem('savedCards'); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-[#111] text-zinc-300 transition-colors"
          >
            Limpar Galeria
          </button>
          <button 
            onClick={() => { localStorage.clear(); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-[#111] text-red-400 transition-colors"
          >
            Resetar Tudo
          </button>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-[#111] rounded-xl text-white hover:bg-zinc-700 transition-colors font-bold text-xs">Fechar</button>
      </div>
    </div>
  );
};

export default SettingsModal;
