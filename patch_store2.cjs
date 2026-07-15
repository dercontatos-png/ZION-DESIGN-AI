const fs = require('fs');
let code = fs.readFileSync('src/store/useProjectStore.ts', 'utf-8');

code = code.replace(/cores: \{\s*paleta: \["#000000", "#bbfb33", "#827df6"\]\s*\},/, `cores: {
    ambiente: "#000000",
    recorte: "#bbfb33",
    complementar: "#827df6",
    paleta: ["#000000", "#bbfb33", "#827df6"]
  },`);

fs.writeFileSync('src/store/useProjectStore.ts', code);
