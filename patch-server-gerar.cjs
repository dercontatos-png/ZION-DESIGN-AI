const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'imagemRefinamentoBase64 = ""\n      } = req.body;',
  'imagemRefinamentoBase64 = "",\n        modelId = "gemini-3-pro-image"\n      } = req.body;'
);

code = code.replace(
  'model: \'gemini-3-pro-image\'',
  'model: modelId'
);

// We should replace all occurrences in the /api/gerar route.
// Let's first check how many times gemini-3-pro-image is used.
fs.writeFileSync('server.ts', code);
console.log("Patched server /api/gerar.");
