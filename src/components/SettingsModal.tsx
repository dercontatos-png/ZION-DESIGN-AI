import React, { useState } from 'react';
import { X, Key, Check } from 'lucide-react';
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
  googleToken, clients, transactions, tasks, calendarEvents,
  setClients, setTransactions, setTasks, setCalendarEvents 
}) => {
  const [apiKey, setApiKey] = useState(myProfile?.geminiApiKey || localStorage.getItem('custom_gemini_api_key') || '');
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Configurações</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* API Key Section */}
        <div className="mb-6 p-4 bg-zinc-950 rounded-2xl border border-white/5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Key size={14} className="text-amber-500" /> Chave de API Google Gemini
          </label>
          <div className="flex gap-2">
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave API (AIzaSy...)"
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
            <button 
              onClick={handleSaveKey}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                saved ? 'bg-emerald-500 text-zinc-950' : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
              }`}
            >
              {saved ? <Check size={14} /> : 'Confirmar'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 leading-normal">
            A chave inserida será salva de forma segura no seu navegador (localStorage) e utilizada para todas as gerações e assistentes do site.
          </p>
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
        <button onClick={onClose} className="mt-6 w-full py-2 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 transition-colors">Fechar</button>
      </div>
    </div>
  );
};

export default SettingsModal;
