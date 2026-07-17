const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const startMarker = '{/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY (48%) */}';
const endMarker = '{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.lastIndexOf('</div>', code.indexOf(endMarker));

if (startIndex === -1 || endIndex === -1) {
    console.log("Markers not found");
    process.exit(1);
}

// We will extract the zoom bar and canvas from the original string so we don't lose the logic.
// We'll just wrap it in our new layout.

// The viewport area logic starts around line 2375 (Workspace Canvas) and ends at line 2662.
const viewportStartMarker = '{/* Workspace Canvas / Viewport com Zoom e Pan */}';
const viewportEndMarker = '{/* Instrução do Sistema (Colapsável) */}';
const vpStart = code.indexOf(viewportStartMarker);
const vpEnd = code.indexOf(viewportEndMarker);

const viewportContent = code.substring(vpStart, vpEnd).trim();
// Wait, the viewportContent currently contains the wrapping div `<div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">`
// and its closing `</div>`. We want to keep it.

const instructionStart = code.indexOf(viewportEndMarker);
const promptEnd = code.indexOf('{/* Galeria Masonry inferior - Memoized */}');
const instructionContent = code.substring(instructionStart, promptEnd).trim();

const masonryStart = promptEnd;
const refinementStart = code.indexOf('{/* AJUSTE LOCALIZADO / REFINAMENTO BAR (ESTILO EXCLUSIVO SCREENSHOT) */}');
const masonryContent = code.substring(masonryStart, refinementStart).trim();

const refinementEnd = code.indexOf('</div>', refinementStart + 50) + 6; 
// Let's just find the closing div of the refinement bar manually.
// Actually, I can just build the new structure and inject the original logic chunks.

let newLayout = `
      ${startMarker}
      <div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">
        
        {/* Top: AJUSTE LOCALIZADO / REFINAMENTO BAR */}
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
          {/* Main Workspace Canvas / Viewport */}
          ${viewportContent}
          
          {/* Right Sidebar for Masonry Gallery and Info */}
          <div className="w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col">
                ${masonryContent}
                ${instructionContent}
             </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
`;

// Replace the original layout
const newCode = code.substring(0, startIndex) + newLayout + '\n      ' + code.substring(endIndex);
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Success!");

