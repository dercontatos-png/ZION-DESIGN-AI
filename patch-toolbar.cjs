const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const buttonsPattern = `{/* Download overlay controls */}
              {activeImage && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 px-4 pointer-events-none">
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-full pointer-events-auto bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">`;

const buttonsReplacement = `{/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;

const targetReplacement = `              {/* Action Toolbar - moved from overlay */}
              {activeImage && (
                <div className="flex-none bg-[#09090b] border-t border-white/5 p-3 flex flex-wrap items-center justify-center gap-2 z-20 shrink-0">
                  {isGcTv && (
                    <button
                      onClick={() => setShowVmixXamlModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-500 to-sky-600 border border-sky-400/40 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-sky-400 hover:to-sky-500 active:scale-95 transition-all shadow-xl cursor-pointer"
                    >
                      <Tv size={13} className="stroke-[2.5px]" />
                      <span>vMix XAML</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center justify-center w-8 h-8 bg-[#1A1A1C] border border-white/10 text-white rounded-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-xl cursor-pointer"
                    title="Tela Cheia"
                  >
                    <Maximize size={12} className="text-white stroke-[2.5px]" />
                  </button>
                  <button
                    onClick={handleDownloadActiveImage}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-200 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <Download size={12} className="text-black stroke-[2.5px]" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowMaskPainter(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400/40 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all shadow-xl cursor-pointer shadow-emerald-950/40"
                    title="Pintar uma área da imagem e pedir a IA para remover, alterar ou adicionar algo"
                  >
                    <PenTool size={12} className="stroke-[2.5px]" />
                    <span>Pintar & Editar</span>
                  </button>
                  <button
                    onClick={handleApplyRefinements}
                    disabled={isRefining}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/40 text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <Sparkles size={12} className={\`text-black stroke-[2.5px] \${isRefining ? 'animate-spin' : ''}\`} />
                    <span>{isRefining ? "Corrigindo..." : "Melhorar (16MB)"}</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!activeImage) return;
                      showToast("Removendo fundo, aguarde...", "success");
                      try {
                        const response = await fetch("/api/remove-bg", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ imageBase64: activeImage })
                        });
                        if (!response.ok) {
                          const errData = await response.json();
                          throw new Error(errData.error || "Erro ao remover fundo.");
                        }
                        const data = await response.json();
                        if (data.image) {
                          store.setGaleriaImages((prev: string[]) => {
                            const next = [...prev, data.image];
                            store.setActiveImageIndex(next.length - 1);
                            return next;
                          });
                          showToast("Fundo removido com sucesso!", "success");
                        }
                      } catch (e: any) {
                        showToast("Erro ao remover fundo: " + e.message, "error");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <Scissors size={12} className="stroke-[3px]" />
                    <span>Sem Fundo</span>
                  </button>
                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;

const startIdx = code.indexOf(buttonsPattern);
const endIdx = code.indexOf('{/* PROGRESS OVERLAY AND STATE FEEDBACK */}', startIdx);
if (startIdx > -1 && endIdx > -1) {
    code = code.substring(0, startIdx) + targetReplacement + code.substring(endIdx + '{/* PROGRESS OVERLAY AND STATE FEEDBACK */}'.length);
    fs.writeFileSync('src/components/DesignBuilder.tsx', code);
    console.log("Toolbar patched successfully!");
} else {
    console.log("Failed to find toolbar pattern");
}
