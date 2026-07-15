const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const clientModalStr = `
          {/* Client Modal */}
          {isClientModalOpen && (
            <div className="absolute inset-0 z-50 bg-[#09090b]/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl relative mb-4">
                <button
                  onClick={() => setIsClientModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Banco de Clientes</h3>
                
                <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4">
                  {clients.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Nenhum cliente cadastrado.</p>
                  ) : (
                    clients.map(c => (
                      <div key={c.id} className={\`p-3 rounded-xl border \${activeClientId === c.id ? 'border-[#ad8330] bg-[#ad8330]/5' : 'border-zinc-800 bg-zinc-900/50'} flex justify-between items-start\`}>
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveClient(activeClientId === c.id ? null : c.id)}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{c.name}</span>
                            {activeClientId === c.id && <span className="text-[8px] bg-[#ad8330]/20 text-[#ad8330] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#ad8330]/30">Ativo</span>}
                          </div>
                          <p className="text-[10px] text-zinc-400">Nicho: {c.niche}</p>
                          <div className="flex gap-2 mt-2">
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.ambiente}} title="Ambiente" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.recorte}} title="Recorte" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.complementar}} title="Complementar" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-2">
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
                </div>
              </div>
            </div>
          )}
`;

const oldStr = `
          {/* Client Modal */}
          {isClientModalOpen && (
            <div className="absolute inset-0 z-50 bg-[#09090b]/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl relative">
                <button
                  onClick={() => setIsClientModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Banco de Clientes</h3>
                
                <div className="space-y-4">
                  {clients.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Nenhum cliente cadastrado.</p>
                  ) : (
                    clients.map(c => (
                      <div key={c.id} className={\`p-3 rounded-xl border \${activeClientId === c.id ? 'border-[#ad8330] bg-[#ad8330]/5' : 'border-zinc-800 bg-zinc-900/50'} flex justify-between items-start\`}>
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveClient(activeClientId === c.id ? null : c.id)}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{c.name}</span>
                            {activeClientId === c.id && <span className="text-[8px] bg-[#ad8330]/20 text-[#ad8330] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#ad8330]/30">Ativo</span>}
                          </div>
                          <p className="text-[10px] text-zinc-400">Nicho: {c.niche}</p>
                          <div className="flex gap-2 mt-2">
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.ambiente}} title="Ambiente" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.recorte}} title="Recorte" />
                             <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c.cores.complementar}} title="Complementar" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
`;

code = code.split(oldStr).join(clientModalStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
