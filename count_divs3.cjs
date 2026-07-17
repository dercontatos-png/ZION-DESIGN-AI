const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
const lines = code.split('\n');

let depth = 0;
for (let i = 780; i < lines.length; i++) {
   const line = lines[i];
   // To be accurate, we need to count self-closing divs? Divs are usually not self-closing.
   const opens = (line.match(/<div/g) || []).length;
   const closes = (line.match(/<\/div>/g) || []).length;
   depth += opens - closes;
   if (depth < 0) {
       console.log(`Negative depth at absolute line ${i + 1}: ${line}`);
       console.log(`Context: \n${lines.slice(i-5, i+5).join('\n')}`);
       break;
   }
}
console.log("Final depth:", depth);

