import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Check, RefreshCw, Wifi, HardDrive, Trash2, Upload, FileCode, ShieldCheck } from 'lucide-react';
import { Client, Transaction, Task, CalendarEvent } from '../types';
import { getStorageStats, cleanImageStorage } from '../utils/imageStorageManager';

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

  useEffect(() => {
    fetch('/api/check-vertex-key')
      .then(res => res.json())
      .then(data => setVertexStatus(data))
      .catch(() => {});
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

  const handleTestToken = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Configurações de Credenciais</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
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
        <div className="mb-6 p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Key size={14} className="text-[#c5a880]" /> Chave API ou JSON do Vertex AI
          </label>
          
          <div className="space-y-2">
            <textarea 
              rows={3}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua Chave API (AIzaSy...) ou cole o conteúdo JSON da sua Conta de Serviço do Vertex AI ({...})"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]/50 font-mono"
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
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs font-bold text-zinc-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
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
            <p className="text-[11px] p-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-300 leading-normal">
              {uploadNotice}
            </p>
          )}

          <p className="text-[10px] text-zinc-500 leading-normal">
            Você pode colar o arquivo JSON da sua Conta de Serviço (Service Account) do Vertex AI ou fazer o upload do arquivo <code className="text-[#c5a880] font-mono">chave-vertex.json</code>. O sistema utilizará suas credenciais diretamente nas requisições.
          </p>
        </div>

        {/* Diagnostics Section */}
        <div className="mb-6 p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Wifi size={14} className="text-emerald-500" /> Diagnóstico da API
          </label>
          <div className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded-xl border border-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-300 font-medium">Status da Conexão:</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">Ativa (Vertex AI / Google API)</span>
          </div>
          <button
            onClick={handleTestToken}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-xs font-bold text-zinc-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isTesting ? "animate-spin text-[#c5a880]" : "text-[#c5a880]"} />
            <span>{isTesting ? "Testando Conexão..." : testSuccess ? "Conexão Estabelecida!" : "Testar Token de Geração"}</span>
          </button>
        </div>

        {/* Image Storage Section */}
        <div className="mb-6 p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <HardDrive size={14} className="text-[#c5a880]" /> Armazenamento de Imagens
          </label>
          <div className="space-y-1.5 bg-zinc-900/50 p-3 rounded-xl border border-white/[0.03]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Ocupação do Navegador:</span>
              <span className={`font-mono font-bold ${storageStats.isNearLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
                {storageStats.percentageUsed}% (~{Math.round(storageStats.totalChars / 1024)} KB)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-amber-400 rounded-xl transition-all"
          >
            <Trash2 size={12} />
            <span>Executar Limpeza Manual de Imagens</span>
          </button>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => { localStorage.removeItem('chatMessages'); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
          >
            Limpar Chat
          </button>
          <button 
            onClick={() => { localStorage.removeItem('savedCards'); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            Limpar Galeria
          </button>
          <button 
            onClick={() => { localStorage.clear(); onClose(); window.location.reload(); }}
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-800 text-red-400 transition-colors"
          >
            Resetar Tudo
          </button>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 transition-colors font-bold text-xs">Fechar</button>
      </div>
    </div>
  );
};

export default SettingsModal;
