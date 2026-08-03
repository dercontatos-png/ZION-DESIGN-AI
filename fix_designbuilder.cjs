const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const startMarker = '{/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY (48%) */}';
const endMarker = '{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.log("Markers not found");
    process.exit(1);
}

// We need to keep the original viewport, gallery, instruction, prompt, and refinement logic.
// We will parse them from right-column.tsx which has the ORIGINAL structure.
const originalRight = fs.readFileSync('right-column.tsx', 'utf-8');

// Inside right-column.tsx:
// 1. Viewport canvas (starts at "          {/* Barra superior de controle do Zoom */}" and ends at "        {/* Instrução do Sistema (Colapsável) */}")
const canvasStart = originalRight.indexOf('{/* Barra superior de controle do Zoom */}');
const instructionStart = originalRight.indexOf('{/* Instrução do Sistema (Colapsável) */}');
const canvasCode = originalRight.substring(canvasStart, instructionStart);

// 2. Instructions & Prompt (starts at "        {/* Instrução do Sistema (Colapsável) */}" and ends at "        {/* Galeria Masonry inferior - Memoized */}")
const galleryStart = originalRight.indexOf('{/* Galeria Masonry inferior - Memoized */}');
const extrasCode = originalRight.substring(instructionStart, galleryStart);

// 3. Masonry (starts at "        {/* Galeria Masonry inferior - Memoized */}" and ends at "        {/* AJUSTE LOCALIZADO / REFINAMENTO BAR (ESTILO EXCLUSIVO SCREENSHOT) */}")
const refinementStart = originalRight.indexOf('{/* AJUSTE LOCALIZADO / REFINAMENTO BAR (ESTILO EXCLUSIVO SCREENSHOT) */}');
const masonryCode = originalRight.substring(galleryStart, refinementStart);

// 4. Refinement Bar (from refinementStart to the closing tags)
// Let's just recreate the Refinement bar to be clean.
const refinementCode = `
        {/* AJUSTE LOCALIZADO / REFINAMENTO BAR (ESTILO EXCLUSIVO SCREENSHOT) */}
        <div className="border-t border-white/5 bg-[#0A0A0A] p-4 shrink-0 flex items-center gap-3">
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
`;

// Now let's build the new right column block
const newRightColumn = `
      ${startMarker}
      <div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
          {/* Main Workspace Canvas / Viewport */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
            ${canvasCode}
            ${refinementCode}
          </div>
          
          {/* Right Sidebar for Masonry Gallery and Info */}
          <div className="w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col">
                ${masonryCode}
                ${extrasCode}
             </div>
          </div>
        </div>
      </div>
      `;

// Find the precise endIndex. Before endMarker, we have multiple closing divs.
// Wait, the original code had:
//       </div>
//     </div>
//   </div>
// </div>
// {/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}
// So if we replace from startIndex to endIndex - (number of closing divs), we should be safe.
// Actually, it's easier to just find the exact string to replace.

// I'll just replace everything from `startIndex` to `endIndex` and then add the necessary closing divs for the main layout.
// The main layout tree is:
// <div className="flex h-screen ..."> (Main Wrapper)
//   <div className="flex-1 flex flex-col ..."> (Right area of sidebar, now Main Content)
//      <div className="flex-1 flex flex-col lg:flex-row ..."> (Two columns wrapper)
//        <Left Column>
//        <Right Column>
//      </div>
//   </div>
// </div>
// Then Modals (9., 10., etc.)

// Let's count how many unclosed divs are before `endMarker`.
// The start of our block `startIndex` is inside `<div className="flex-1 flex flex-col lg:flex-row ...">`
// Our block replaces `<Right Column>` and should just be 1 sibling.
// The left column is closed before `startIndex`.
// So after our block, we need to close:
// 1. The Two columns wrapper
// 2. The Main Content wrapper
// 3. The Main Wrapper
// Total 3 closing divs.

const finalClosingDivs = `
          </div>
        </div>
      </div>
      `;

const newCode = code.substring(0, startIndex) + newRightColumn + finalClosingDivs + code.substring(endIndex);
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Success!");

