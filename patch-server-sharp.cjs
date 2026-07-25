const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'finalImageBase64 = await applyUpscaleAndRefinement(finalImageBase64, sizeSelected, {\n          corDominante: corDominante || backgroundSettings?.colors?.[0],\n          paletteColors: backgroundSettings?.colors || []\n        });',
  '// NOT applying upscale/sharp anymore to ensure exact original API output is displayed in UI\n        // finalImageBase64 = await applyUpscaleAndRefinement(finalImageBase64, sizeSelected, {...});'
);

fs.writeFileSync('server.ts', code);
console.log("Patched sharp out of /api/gerar");
