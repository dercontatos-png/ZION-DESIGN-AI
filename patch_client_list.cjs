const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const oldStr = `                          <div className="flex gap-2 mt-2">
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.ambiente}} title="Ambiente" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.recorte}} title="Recorte" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.complementar}} title="Complementar" />
                          </div>`;

const newStr = `                          <div className="flex flex-wrap gap-1 mt-2">
                             {c.paletaCores?.map((color, idx) => (
                               <div key={idx} className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: color}} title={color} />
                             ))}
                          </div>`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
