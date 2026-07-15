const fs = require('fs');
let code = fs.readFileSync('src/store/useClientStore.ts', 'utf-8');

code = code.replace(/cores: \{\s*ambiente: string;\s*recorte: string;\s*complementar: string;\s*\};/g, 'paletaCores: string[];');

fs.writeFileSync('src/store/useClientStore.ts', code);
