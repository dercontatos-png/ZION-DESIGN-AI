const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const toolbarPattern = `<div className="flex-none bg-[#09090b] border-t border-white/5 p-3 flex flex-wrap items-center justify-center gap-2 z-20 shrink-0">`;
const toolbarReplacement = `<div className="flex-none bg-[#09090b] border-t border-white/5 p-3 z-20 shrink-0 w-full overflow-x-auto custom-scrollbar">
                  <div className="flex items-center justify-center gap-2 min-w-max mx-auto px-2 pb-1">`;

if (code.includes(toolbarPattern)) {
    code = code.replace(toolbarPattern, toolbarReplacement);
    
    // We also need to add a closing div for the inner container
    const endToolbarPattern = `                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2 bg-[#070708]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={12} />
                  </button>
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
                </div>
              )}

              {/* PROGRESS OVERLAY AND STATE FEEDBACK */}`;
              
    code = code.replace(endToolbarPattern, endToolbarReplacement);
    fs.writeFileSync('src/components/DesignBuilder.tsx', code);
    console.log("Toolbar made scrollable");
} else {
    console.log("Toolbar pattern not found");
}
