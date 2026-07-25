const fs = require('fs');
let code = fs.readFileSync('src/components/CompareSlider.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/CompareSlider.tsx', code);
console.log("Fixed backslashes");
