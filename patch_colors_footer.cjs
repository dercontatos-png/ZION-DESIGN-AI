const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\{\/\* Footer Area \*\/\}\n\s*<div className="shrink-0 p-3\.5 border-t border-zinc-900 bg-black\/80 backdrop-blur-md space-y-2\.5">/;
const replacement = `\{/* Footer Area */\}
          <div className="shrink-0 p-3.5 border-t border-zinc-900 bg-black/80 backdrop-blur-md space-y-2.5">
            {activeClientId && clients.find(c => c.id === activeClientId)?.paletaCores && clients.find(c => c.id === activeClientId)!.paletaCores!.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider mr-1">Cores:</span>
                {clients.find(c => c.id === activeClientId)?.paletaCores?.map((cor, idx) => (
                   <div 
                      key={idx} 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-[#ad8330] hover:bg-[#ad8330]/10 transition-all group shrink-0"
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
