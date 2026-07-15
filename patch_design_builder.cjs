const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const targetStr = `            {!store.coresAutomaticas && (
              <div className="grid grid-cols-3 gap-3.5 pt-1 animate-in fade-in duration-300">
                <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Ambiente</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={store.cores.ambiente}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, ambiente: e.target.value }
                      })}
                      className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={store.cores.ambiente}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, ambiente: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                    />
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Recorte</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={store.cores.recorte}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, recorte: e.target.value }
                      })}
                      className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={store.cores.recorte}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, recorte: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                    />
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Complementar</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={store.cores.complementar}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, complementar: e.target.value }
                      })}
                      className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={store.cores.complementar}
                      onChange={(e) => store.updateConfig({
                        cores: { ...store.cores, complementar: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            )}`;

const newStr = `            {!store.coresAutomaticas && (
              <div className="pt-1 animate-in fade-in duration-300">
                <div className="flex flex-col gap-3 p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Paleta de Cores ({store.cores?.paleta?.length || 0})</span>
                    <button
                      onClick={() => store.updateConfig({
                        cores: { paleta: [...(store.cores?.paleta || []), "#ffffff"] }
                      })}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {store.cores?.paleta?.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 relative group">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newPaleta = [...(store.cores?.paleta || [])];
                            newPaleta[idx] = e.target.value;
                            store.updateConfig({ cores: { paleta: newPaleta } });
                          }}
                          className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newPaleta = [...(store.cores?.paleta || [])];
                            newPaleta[idx] = e.target.value;
                            store.updateConfig({ cores: { paleta: newPaleta } });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                        />
                        <button
                          onClick={() => {
                            const newPaleta = store.cores.paleta.filter((_, i) => i !== idx);
                            store.updateConfig({ cores: { paleta: newPaleta } });
                          }}
                          className="absolute -right-2 -top-2 w-4 h-4 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}`;

if (code.includes(targetStr)) {
  code = code.split(targetStr).join(newStr);
  fs.writeFileSync('src/components/DesignBuilder.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
