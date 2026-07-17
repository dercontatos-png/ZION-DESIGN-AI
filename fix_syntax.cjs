const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// I'll extract everything up to `endMarker`, then append the closing divs.
const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
const beforeEm = code.substring(0, em);

// Let's count open divs in `beforeEm`
const startReturn = code.indexOf('return (');
const jsxChunk = beforeEm.substring(startReturn);

let depth = 0;
for (let i = 0; i < jsxChunk.length; i++) {
   if (jsxChunk.startsWith('<div', i)) depth++;
   if (jsxChunk.startsWith('</div', i)) depth--;
}
console.log("Unclosed divs before Modal:", depth);

// I'll just write a script that auto-closes all open divs!
