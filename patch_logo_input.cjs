const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const oldStr = `<div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest mb-2">Novo Cliente</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;
                    useClientStore.getState().addClient({
                      name: form.name.value,
                      niche: form.niche.value,
                      infoExtra: form.infoExtra.value,
                      bancoDeDadosIA: "",
                      cores: {
                        ambiente: form.corAmbiente.value,
                        recorte: form.corRecorte.value,
                        complementar: form.corComp.value
                      }
                    });
                    form.reset();
                  }} className="space-y-3">
                    <input name="name" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="niche" placeholder="Nicho" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="infoExtra" placeholder="Info Adicional (ex: Estilo favorito)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Ambiente</label>
                        <input name="corAmbiente" type="color" defaultValue="#000000" className="w-full h-6 rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Recorte</label>
                        <input name="corRecorte" type="color" defaultValue="#ff0000" className="w-full h-6 rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Complementar</label>
                        <input name="corComp" type="color" defaultValue="#ffffff" className="w-full h-6 rounded" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#ad8330]/20 text-[#ad8330] border border-[#ad8330]/40 p-2 text-xs font-bold uppercase rounded-lg hover:bg-[#ad8330]/30 transition-colors">Cadastrar Cliente</button>
                  </form>
                </div>`;

const newStr = `<div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest mb-2">Novo Cliente</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    
                    let logoBase64 = undefined;
                    const fileInput = form.logoFile;
                    if (fileInput.files && fileInput.files.length > 0) {
                       const file = fileInput.files[0];
                       logoBase64 = await new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => resolve(ev.target?.result);
                          reader.readAsDataURL(file);
                       });
                    }

                    useClientStore.getState().addClient({
                      name: form.name.value,
                      niche: form.niche.value,
                      infoExtra: form.infoExtra.value,
                      logoBase64: logoBase64,
                      bancoDeDadosIA: "",
                      cores: {
                        ambiente: form.corAmbiente.value,
                        recorte: form.corRecorte.value,
                        complementar: form.corComp.value
                      }
                    });
                    form.reset();
                  }} className="space-y-3">
                    <input name="name" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="niche" placeholder="Nicho" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="infoExtra" placeholder="Info Adicional (ex: Estilo favorito)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" />
                    
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase">Logo do Cliente (Opcional)</label>
                      <input name="logoFile" type="file" accept="image/*" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300" />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Ambiente</label>
                        <input name="corAmbiente" type="color" defaultValue="#000000" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Recorte</label>
                        <input name="corRecorte" type="color" defaultValue="#ff0000" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Complementar</label>
                        <input name="corComp" type="color" defaultValue="#ffffff" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#ad8330]/20 text-[#ad8330] border border-[#ad8330]/40 p-2 text-xs font-bold uppercase rounded-lg hover:bg-[#ad8330]/30 transition-colors">Cadastrar Cliente</button>
                  </form>
                </div>`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
