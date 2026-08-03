const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
let beforeEm = code.substring(0, em);
const afterEm = code.substring(em);

// Remove all trailing </div> from beforeEm
while (beforeEm.trim().endsWith('</div>')) {
    const lastDiv = beforeEm.lastIndexOf('</div>');
    beforeEm = beforeEm.substring(0, lastDiv).trim();
}

// Recalculate depth
const startReturn = beforeEm.indexOf('return (');
const jsxChunk = beforeEm.substring(startReturn);

let depth = 0;
for (let i = 0; i < jsxChunk.length; i++) {
   if (jsxChunk.startsWith('<div', i)) depth++;
   if (jsxChunk.startsWith('</div', i)) depth--;
}
console.log("True unclosed divs:", depth);

// Append the exact number of closing divs
let closes = '';
for (let i = 0; i < depth; i++) {
    closes += '</div>\n';
}

const newCode = beforeEm + '\n' + closes + afterEm;
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Fixed divs!");

