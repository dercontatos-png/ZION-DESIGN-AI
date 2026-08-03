const fs = require('fs');

const originalRight = fs.readFileSync('right-column.tsx', 'utf-8');

let parenOrig = 0;
let braceOrig = 0;
for(let i=0; i<originalRight.length; i++) {
   if (originalRight[i] === '(') parenOrig++;
   if (originalRight[i] === ')') parenOrig--;
   if (originalRight[i] === '{') braceOrig++;
   if (originalRight[i] === '}') braceOrig--;
}

// How did I generate the new chunk?
// From fix_designbuilder.cjs, I extracted substrings and recombined them.
const canvasStart = originalRight.indexOf('{/* Barra superior de controle do Zoom */}');
const instructionStart = originalRight.indexOf('{/* Instrução do Sistema (Colapsável) */}');
const canvasCode = originalRight.substring(canvasStart, instructionStart);

const galleryStart = originalRight.indexOf('{/* Galeria Masonry inferior - Memoized */}');
const extrasCode = originalRight.substring(instructionStart, galleryStart);

const refinementStart = originalRight.indexOf('{/* AJUSTE LOCALIZADO / REFINAMENTO BAR (ESTILO EXCLUSIVO SCREENSHOT) */}');
const masonryCode = originalRight.substring(galleryStart, refinementStart);

const newRightColumn = `
      <div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
            ${canvasCode}
          </div>
          
          <div className="w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col">
                ${masonryCode}
                ${extrasCode}
             </div>
          </div>
        </div>
      </div>
      `;

let parenNew = 0;
let braceNew = 0;
for(let i=0; i<newRightColumn.length; i++) {
   if (newRightColumn[i] === '(') parenNew++;
   if (newRightColumn[i] === ')') parenNew--;
   if (newRightColumn[i] === '{') braceNew++;
   if (newRightColumn[i] === '}') braceNew--;
}

console.log(`Original Right Column paren=${parenOrig}, brace=${braceOrig}`);
console.log(`New Right Column paren=${parenNew}, brace=${braceNew}`);

