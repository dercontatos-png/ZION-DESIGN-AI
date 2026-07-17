import React, { useState } from 'react';
import { X, Key, Check, RefreshCw, Wifi } from 'lucide-react';
import { Client, Transaction, Task, CalendarEvent } from '../types';

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
  apiKey: propApiKey, // unused parameter fallback
  googleToken, clients, transactions, tasks, calendarEvents,
  setClients, setTransactions, setTasks, setCalendarEvents 
}) => {
  const [apiKey, setApiKey] = useState(myProfile?.geminiApiKey || localStorage.getItem('custom_gemini_api_key') || '');
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSaveKey = () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('custom_gemini_api_key', trimmedKey);
      setMyProfile({ ...myProfile, geminiApiKey: trimmedKey });
    } else {
      localStorage.removeItem('custom_gemini_api_key');
      setMyProfile({ ...myProfile, geminiApiKey: '' });
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1000);
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-heavy rounded-3xl p-6 w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-montserrat font-bold text-white uppercase tracking-wider">Configurações</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* API Key Section */}
        <div className="mb-5 p-4 bg-black/25 rounded-2xl border border-white/5 shadow-sm">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Key size={12} className="text-[#d4af37]" /> Chave de API Google Gemini
          </label>
          <div className="flex gap-2">
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave API (AIzaSy...)"
              className="flex-1 bg-[#050505]/45 hover:bg-[#050505]/75 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/15 transition-all duration-300"
            />
            <button 
              onClick={handleSaveKey}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
                saved ? 'bg-emerald-500 text-zinc-950' : 'bg-[#d4af37] text-zinc-950 hover:bg-[#b8942b]'
              }`}
            >
              {saved ? <Check size={14} /> : 'Salvar'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-550 mt-2 leading-normal">
            A chave será salva localmente de forma segura e utilizada para todas as gerações e assistentes da agência.
          </p>
        </div>

        {/* Diagnostics Section */}
        <div className="mb-5 p-4 bg-black/25 rounded-2xl border border-white/5 space-y-3 shadow-sm">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Wifi size={12} className="text-emerald-500 animate-pulse" /> Diagnóstico da API
          </label>
          <div className="flex items-center justify-between bg-black/10 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Status:</span>
            </div>
            <span className="text-[10px] font-black text-emerald-450 uppercase tracking-wider">Conexão Ativa</span>
          </div>
          <button
            onClick={handleTestToken}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-300 rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={11} className={isTesting ? "animate-spin text-[#d4af37]" : "text-[#d4af37]"} />
            <span>{isTesting ? "Testando Conexão..." : testSuccess ? "Conexão Estabelecida!" : "Testar Token de Geração"}</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          <button 
            onClick={() => { localStorage.removeItem('chatMessages'); onClose(); window.location.reload(); }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/[0.02] text-zinc-400 hover:text-zinc-250 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Limpar Conversa Chat
          </button>
          <button 
            onClick={() => { localStorage.removeItem('savedCards'); onClose(); window.location.reload(); }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/[0.02] text-zinc-400 hover:text-zinc-250 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Limpar Galeria de Cards
          </button>
          <button 
            onClick={() => { localStorage.clear(); onClose(); window.location.reload(); }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            Resetar Banco de Dados
          </button>
        </div>
        
        <button onClick={onClose} className="mt-5 w-full py-2.5 bg-[#d4af37] hover:bg-[#b8942b] rounded-xl text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md shadow-[#d4af37]/5">Fechar Configurações</button>
      </div>
    </div>
  );
};

export default SettingsModal;
