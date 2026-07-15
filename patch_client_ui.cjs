const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const oldStr = `              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={clearChat}
                  className="p-2 text-zinc-500 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Limpar conversa"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}`;

const newStr = `              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#ad8330]/30"
                  title="Gerenciar Clientes"
                >
                  {activeClientId ? clients.find(c => c.id === activeClientId)?.name : "Clientes"}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-zinc-500 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Limpar conversa"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
