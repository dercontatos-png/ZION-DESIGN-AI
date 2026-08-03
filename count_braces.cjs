const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
const chunk = code.substring(0, em);

let depth = 0;
for (let i = 0; i < chunk.length; i++) {
   if (chunk[i] === '{') depth++;
   if (chunk[i] === '}') depth--;
}
console.log("Net brace depth:", depth);
