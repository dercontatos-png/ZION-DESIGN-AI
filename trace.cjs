const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// Find start of right column
const rcStart = code.indexOf('<div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">');

// Find end marker
const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');

const chunk = code.substring(rcStart, em);
console.log("Chunk length:", chunk.length);

let depth = 0;
for (let i = 0; i < chunk.length; i++) {
   if (chunk.startsWith('<div', i)) depth++;
   if (chunk.startsWith('</div', i)) depth--;
}
console.log("Net div depth inside chunk:", depth);

// We want depth to be 0 at the end of the chunk because it represents one sibling element (Right Column) which is fully closed.
// BUT wait, does the original right column close its own wrapper? Yes, it did.
