const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const target = `<p className="text-[9.5px] text-zinc-600 max-w-xs leading-relaxed mt-1">Monte os parâmetros no formulário central e inicie a geração da imagem.</p>
                </div>`;

const newCode = `<p className="text-[9.5px] text-zinc-600 max-w-xs leading-relaxed mt-1 mb-4">Monte os parâmetros no formulário central e inicie a geração da imagem.</p>
                  
                  <div className="relative inline-flex">
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
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#c5a880] hover:bg-[#b39873] text-zinc-950 rounded-lg text-xs font-black tracking-widest uppercase transition-colors pointer-events-none shadow-md">
                      <Upload size={14} />
                      Enviar Arquivo Existente
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 max-w-xs leading-relaxed mt-2 text-center uppercase tracking-wider">
                    Envie sua imagem para usar as funções de melhorar e cravar 16MB ou remover fundo.
                  </p>
                </div>`;

code = code.replace(target, newCode);
fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log('Empty state upload patched');
