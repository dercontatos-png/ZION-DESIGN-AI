const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// 1. Fix Image Preview layout
const imageContainerPattern = `              ) : activeImage ? (
                <div 
                  className="relative group w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden p-2 sm:p-4"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden"
                    style={{
                      transform: \`scale(\${zoomPercent / 100}) translate(\${panOffset.x}px, \${panOffset.y}px)\`,
                      transformOrigin: "center center",
                      transition: "transform 0.05s ease-out",
                      backgroundColor: store.corDominante && store.corDominante !== "transparent" ? store.corDominante : undefined,
                    }}
                  >
                    <img
                      src={activeImage}
                      alt="Preview"
                      className="w-full h-full object-contain shadow-2xl pointer-events-none rounded-lg"
                    />
                  </div>
                </div>`;

const imageContainerReplacement = `              ) : activeImage ? (
                <div 
                  className="relative group w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-4"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                >
                  <div
                    className="relative max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden"
                    style={{
                      transform: \`scale(\${zoomPercent / 100}) translate(\${panOffset.x}px, \${panOffset.y}px)\`,
                      transformOrigin: "center center",
                      transition: "transform 0.05s ease-out",
                      backgroundColor: store.corDominante && store.corDominante !== "transparent" ? store.corDominante : undefined,
                    }}
                  >
                    <img
                      src={activeImage}
                      alt="Preview"
                      className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl pointer-events-none rounded-lg"
                    />
                  </div>
                </div>`;

if (code.includes(imageContainerPattern)) {
    code = code.replace(imageContainerPattern, imageContainerReplacement);
    console.log("Image layout fixed");
} else {
    console.log("Image container pattern not found!");
}

// 2. Fix Toolbar layout
const toolbarPattern = `              {/* Action Toolbar - moved from overlay */}
              {activeImage && (
                <div className="flex-none bg-[#09090b] border-t border-white/5 p-3 z-20 shrink-0 w-full overflow-x-auto custom-scrollbar">
                  <div className="flex items-center justify-center gap-2 min-w-max mx-auto px-2 pb-1">`;

const toolbarReplacement = `              {/* Action Toolbar - moved from overlay */}
              {activeImage && (
                <div className="flex-none bg-[#09090b] border-t border-white/5 p-3 z-20 shrink-0 w-full flex flex-wrap items-center justify-center gap-2">`;

if (code.includes(toolbarPattern)) {
    code = code.replace(toolbarPattern, toolbarReplacement);
    
    const endToolbarPattern = `                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={12} />
                  </button>
                  </div>
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;
              
    const endToolbarReplacement = `                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;
              
    if (code.includes(endToolbarPattern)) {
        code = code.replace(endToolbarPattern, endToolbarReplacement);
        console.log("Toolbar fixed");
    } else {
        console.log("Toolbar end pattern not found");
    }
} else {
    console.log("Toolbar pattern not found");
}

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
