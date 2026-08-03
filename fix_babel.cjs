const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// The block ends at:
const pEnd = code.indexOf('          )}', code.indexOf('{isFullPromptExpanded && ('));
const pEndFull = pEnd + '          )}'.length;

const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');

const beforePart = code.substring(0, pEndFull);
const afterPart = code.substring(em);

// How many open divs in beforePart? (from return)
const startReturn = beforePart.indexOf('return (');
const jsxChunk = beforePart.substring(startReturn);

let depth = 0;
for (let i = 0; i < jsxChunk.length; i++) {
   if (jsxChunk.startsWith('<div', i)) depth++;
   if (jsxChunk.startsWith('</div', i)) depth--;
}
console.log("Unclosed divs before Modal (expected to be > 0):", depth);

// But wait, the Modal itself needs to be INSIDE the root div.
// So we should NOT close the root div before the Modal!
// The root div is 1 level.
// After the Modals, there is the closing of the root div.
// Let's check how many divs are closed AFTER the Modals!
let depthAfter = 0;
for (let i = 0; i < afterPart.length; i++) {
   if (afterPart.startsWith('<div', i)) depthAfter++;
   if (afterPart.startsWith('</div', i)) depthAfter--;
}
console.log("Net depth change after Modal (expected to be < 0):", depthAfter);

// To balance the tree, we need:
// depth + depthAfter + injectedCloses = 0
// injectedCloses = -(depth + depthAfter)
const injectedClosesCount = -(depth + depthAfter);
console.log("Need to inject", injectedClosesCount, "closing divs.");

let injectedCloses = '\n';
for (let i=0; i < injectedClosesCount; i++) {
    injectedCloses += '</div>\n';
}

const newCode = beforePart + injectedCloses + afterPart;
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Done!");
