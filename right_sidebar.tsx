        {/* Right Side: Options & Gallery */}
        {activeImage && (
          <div className="w-full md:w-[280px] xl:w-[320px] bg-[#0A0A0A] border-t md:border-t-0 border-l-0 md:border-l border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar relative z-20">
            {/* Action Buttons */}
            <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ações Rápidas</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadActiveImage}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-all shadow-xl cursor-pointer"
                >
                  <Download size={14} className="stroke-[2.5px]" />
                  <span>Download Imagem</span>
                </button>
                
                <button
                  onClick={handleApplyRefinements}
                  disabled={isRefining}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/40 text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-xl cursor-pointer"
                >
                  <Sparkles size={14} className={`stroke-[2.5px] ${isRefining ? 'animate-spin' : ''}`} />
                  <span>{isRefining ? "Corrigindo..." : "Melhorar (16MB)"}</span>
                </button>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setShowMaskPainter(true)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-zinc-900 border border-white/10 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <PenTool size={12} />
                    <span>Pintar</span>
                  </button>
                  
                  <button
                    onClick={async () => {
                      showToast("Removendo fundo...", "success");
                      try {
                        const response = await fetch("/api/remove-bg", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ imageBase64: activeImage })
                        });
                        if (!response.ok) throw new Error("Erro");
                        const data = await response.json();
                        if (data.image) {
                          store.setGaleriaImages((prev: string[]) => {
                            const next = [...prev, data.image];
                            store.setActiveImageIndex(next.length - 1);
                            return next;
                          });
                          showToast("Fundo removido!", "success");
                        }
                      } catch (e: any) {
                        showToast("Erro ao remover fundo", "error");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-zinc-900 border border-white/10 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <Scissors size={12} />
                    <span>Fundo</span>
                  </button>
                </div>
                
                {isGcTv && (
                  <button
                    onClick={() => setShowVmixXamlModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-1 bg-gradient-to-r from-sky-500 to-sky-600 border border-sky-400/40 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-sky-400 hover:to-sky-500 transition-all cursor-pointer"
                  >
                    <Tv size={14} className="stroke-[2.5px]" />
                    <span>Exportar vMix XAML</span>
                  </button>
                )}
                
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-950 border border-white/10 text-zinc-300 text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <Maximize size={12} />
                  <span>Tela Cheia</span>
                </button>
              </div>
            </div>

            {/* Export Settings */}
            <div className="p-4 border-b border-white/5 space-y-4 shrink-0">
              <div>
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Formato de Arquivo</h3>
                <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                  {["AVIF", "PNG", "JPEG", "WEBP"].map((fmt) => {
                    const isSelected = exportFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => {
                          setExportFormat(fmt as any);
                          store.updateConfig({ formatoExportacao: fmt as any });
                        }}
                        className={`py-1.5 rounded text-[9.5px] font-black transition-all cursor-pointer ${
                          isSelected ? "bg-[#c5a880] text-black shadow-md" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Exportar para Redes</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { handleDownloadActiveImage(); showToast("Baixado formato WhatsApp", "success"); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-900/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2"><Download size={14} /> WhatsApp</div>
                    <span className="text-[8.5px] bg-emerald-500/20 px-1.5 py-0.5 rounded">16MB</span>
                  </button>
                  <button
                    onClick={() => { handleDownloadActiveImage(); showToast("Baixado formato Instagram", "success"); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-pink-950/30 border border-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-pink-900/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2"><Download size={14} /> Instagram</div>
                    <span className="text-[8.5px] bg-pink-500/20 px-1.5 py-0.5 rounded">8MB</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Masonry Gallery */}
            <div className="flex-1 p-4 min-h-[200px] flex flex-col shrink-0">
              <MasonryGallery
                exportFormat={exportFormat}
                showToast={showToast}
              />
            </div>
          </div>
        )}
