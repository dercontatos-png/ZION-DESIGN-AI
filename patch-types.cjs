const fs = require('fs');
let code = fs.readFileSync('src/types/designBuilder.ts', 'utf8');

code = code.replace(
  'somentePrompt?: boolean;',
  'somentePrompt?: boolean;\n  modelId?: string;'
);

fs.writeFileSync('src/types/designBuilder.ts', code);
console.log("Patched types.");
