const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// 1. Fix image preview
const previewPattern = `<div
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
                  </div>`;
const previewReplacement = `<div
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
                  </div>`;
if (code.includes(previewPattern)) {
    code = code.replace(previewPattern, previewReplacement);
} else {
    console.log("Preview pattern not found");
}

// 2. Organize buttons
const buttonsPattern = `{/* Download overlay controls */}
              {activeImage && (
                <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 z-20">`;
const buttonsReplacement = `{/* Download overlay controls */}
              {activeImage && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 px-4 pointer-events-none">
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-full pointer-events-auto bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">`;
if (code.includes(buttonsPattern)) {
    code = code.replace(buttonsPattern, buttonsReplacement);
} else {
    console.log("Buttons pattern not found");
}

const buttonsEndPattern = `                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2.5 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;
const buttonsEndReplacement = `                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2.5 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={14} />
                  </button>
                  </div>
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;
if (code.includes(buttonsEndPattern)) {
    code = code.replace(buttonsEndPattern, buttonsEndReplacement);
} else {
    console.log("Buttons end pattern not found");
}

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Preview patched");
