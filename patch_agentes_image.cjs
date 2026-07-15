const fs = require('fs');
let code = fs.readFileSync('src/components/Agentes.tsx', 'utf-8');
code = code.replace(/image: "https:\/\/files.oaiusercontent.com[^"]+"/g, '');
code = code.replace(/category: "Copy",\s*}/g, 'category: "Copy"\n    }');
fs.writeFileSync('src/components/Agentes.tsx', code);
