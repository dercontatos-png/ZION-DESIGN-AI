const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const textModels = ["gemini-3.6-flash", "gemini-3-pro-preview"];',
  'const textModels = modelId ? [modelId, "gemini-3.6-flash", "gemini-3-pro-preview"] : ["gemini-3.6-flash", "gemini-3-pro-preview"];'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with modelId");
