const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'finalImageBase64 = await applyUpscaleAndRefinement(finalImageBase64, sizeSelected, {\n            corDominante: imgConfig?.corDominante || imgConfig?.backgroundSettings?.colors?.[0],\n            paletteColors: imgConfig?.backgroundSettings?.colors || []\n          });',
  '// finalImageBase64 = await applyUpscaleAndRefinement(finalImageBase64, sizeSelected, {...});'
);

fs.writeFileSync('server.ts', code);
console.log("Patched sharp out of /api/generate");
