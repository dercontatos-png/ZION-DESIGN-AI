const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGenerateImage.ts', 'utf8');

const regex = /dimensao: store\.dimensao,\n\s*somentePrompt: store\.somentePrompt/;
const replacement = `dimensao: store.dimensao,
      somentePrompt: store.somentePrompt,
      coresAutomaticas: store.coresAutomaticas`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/hooks/useGenerateImage.ts', code);
