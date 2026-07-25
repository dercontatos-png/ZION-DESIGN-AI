const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/Filter,\n\s*Layers,/, "Filter,\n  Layers,\n  Globe,");
fs.writeFileSync('src/App.tsx', code);
