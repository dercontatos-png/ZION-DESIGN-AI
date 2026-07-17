const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const pEnd = code.indexOf('          )}', code.indexOf('{isFullPromptExpanded && ('));
const pEndFull = pEnd + '          )}'.length;

const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
const beforePart = code.substring(0, pEndFull);
const afterPart = code.substring(em);

const startReturn = beforePart.indexOf('return (');
const jsxChunk = beforePart.substring(startReturn);

let depth = 0;
for (let i = 0; i < jsxChunk.length; i++) {
   if (jsxChunk.startsWith('<div', i)) depth++;
   if (jsxChunk.startsWith('</div', i)) depth--;
}

let depthAfter = 0;
for (let i = 0; i < afterPart.length; i++) {
   if (afterPart.startsWith('<div', i)) depthAfter++;
   if (afterPart.startsWith('</div', i)) depthAfter--;
}

const injectedClosesCount = depth + depthAfter;
console.log("Need to inject", injectedClosesCount, "closing divs before Modal.");

let injectedCloses = '\n';
for (let i=0; i < injectedClosesCount; i++) {
    injectedCloses += '</div>\n';
}

const newCode = beforePart + injectedCloses + afterPart;
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Done!");
