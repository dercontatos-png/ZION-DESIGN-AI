const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\{\/\* Input Area \*\/\}\n\s*<div className="p-4 bg-zinc-950\/80 border-t border-zinc-900\/50 backdrop-blur-xl shrink-0">/;
const replacement = `\{/* Input Area */\}
          <div className="p-4 bg-zinc-950/80 border-t border-zinc-900/50 backdrop-blur-xl shrink-0">
            {activeClientId && clients.find(c => c.id === activeClientId)?.paletaCores && clients.find(c => c.id === activeClientId)!.paletaCores!.length > 0 && (
              <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider mr-1">Cores do Cliente:</span>
                {clients.find(c => c.id === activeClientId)?.paletaCores?.map((cor, idx) => (
                   <div 
                      key={idx} 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-[#ad8330] hover:bg-[#ad8330]/10 transition-all group"
                      onClick={() => setInputText(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + cor + " ")}
                      title={\`Adicionar \${cor} ao prompt\`}
                   >
                     <div className="w-3 h-3 rounded-full border border-zinc-700 group-hover:border-[#ad8330]" style={{ backgroundColor: cor }} />
                     <span className="text-[10px] text-zinc-400 group-hover:text-[#ad8330] font-mono">{cor}</span>
                   </div>
                ))}
              </div>
            )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
