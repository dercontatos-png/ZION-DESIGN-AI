const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const returnStart = code.indexOf('return (', code.length / 2);
const jsxStr = code.substring(returnStart);

const lines = jsxStr.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
   const line = lines[i];
   const opens = (line.match(/<div/g) || []).length;
   const closes = (line.match(/<\/div>/g) || []).length;
   depth += opens - closes;
   if (depth < 0) {
       console.log(`Negative depth at relative line ${i}: ${line}`);
       break;
   }
}
console.log("Final depth:", depth);

