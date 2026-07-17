const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const startMarker = '{/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY (48%) */}';
const startIndex = code.indexOf(startMarker);

// We keep everything before startMarker.
const beforePart = code.substring(0, startIndex);

const newRightColumn = `
      {/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY (48%) */}
      <div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">
        <div className="border-b border-white/5 bg-[#0A0A0A] p-4 shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Instrução de ajuste localizado ou estilo..."
              value={refineQuery}
              onChange={(e) => setRefineQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRefine()}
              className="w-full bg-[#121215] border border-white/5 hover:border-zinc-700 text-xs rounded-lg px-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleRefine}
            className="px-6 py-2.5 bg-[#c99b3b] hover:bg-[#b5872c] text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Refinar
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
            <div className="flex-1 flex items-center justify-center relative p-8">
              {activeImage ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-xl border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
                    style={{
                      transform: \`scale(\${zoomPercent / 100}) translate(\${panOffset.x}px, \${panOffset.y}px)\`,
                      cursor: isPanning ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handlePanStart}
                    onMouseMove={handlePanMove}
                    onMouseUp={handlePanEnd}
                    onMouseLeave={handlePanEnd}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1C] border border-white/10 flex items-center justify-center text-zinc-655 mb-1.5">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-[10.5px] font-black text-zinc-550 uppercase tracking-widest">Aguardando Criação</p>
                  <p className="text-[9px] text-zinc-600 max-w-xs leading-relaxed mt-1">Monte os parâmetros no formulário central e inicie a geração da imagem.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="border border-white/5 bg-black/35 p-4 rounded-xl shrink-0 select-none">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c99b3b]">Galeria Masonry</span>
                  </div>
                  <MasonryGallery
                    exportFormat={exportFormat}
                    showToast={showToast}
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>

  {modalImageRefUrl && (
    <div
      onClick={() => setModalImageRefUrl(null)}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200 cursor-zoom-out"
    >
      <div className="relative max-w-4xl max-h-[90%] flex flex-col items-center justify-center">
        <img
          src={modalImageRefUrl}
          alt="Estilo Ref Zoom"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/5 shadow-2xl"
        />
        <button
          onClick={() => setModalImageRefUrl(null)}
          className="absolute top-4 right-4 p-2 bg-black/75 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )}

  <ChatAssistente
    customApiKey={customApiKey}
    showToast={showToast}
  />
</div>
  );
}
`;

const newCode = beforePart + newRightColumn;
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Done!");
