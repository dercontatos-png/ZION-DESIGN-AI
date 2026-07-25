const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGenerateImage.ts', 'utf8');

code = code.replace(
  'somentePrompt: store.somentePrompt,',
  'somentePrompt: store.somentePrompt,\n      modelId: store.modelId,'
);

fs.writeFileSync('src/hooks/useGenerateImage.ts', code);
console.log("Patched hook.");
