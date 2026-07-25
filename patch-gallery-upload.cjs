const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const target = `<div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Histórico Digital</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Minha Galeria</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Visualize, filtre e gerencie todas as criações premium salvas neste projeto.</p>
              </div>`;

const newCode = `<div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Histórico Digital</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Minha Galeria</h3>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              store.setGaleriaImages((prev: string[]) => {
                                const next = [reader.result as string, ...prev];
                                store.setActiveImageIndex(0);
                                return next;
                              });
                              showToast("Imagem adicionada à galeria", "success");
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c5a880] hover:bg-[#b39873] text-zinc-950 rounded text-[10px] font-black tracking-widest uppercase transition-colors pointer-events-none">
                      <Upload size={12} />
                      Fazer Upload
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider mt-1">Visualize, filtre e gerencie todas as criações premium salvas neste projeto.</p>
              </div>`;

code = code.replace(target, newCode);
fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log('Gallery upload button patched');
