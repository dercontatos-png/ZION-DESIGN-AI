const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'selectedRatio: string,\n  sizeSelected: string,\n  customApiKey?: string\n): Promise<{ imageBase64Url: string; rawData: string; rawMime: string; modelUsed: string }> {',
  'selectedRatio: string,\n  sizeSelected: string,\n  customApiKey?: string,\n  modelId?: string\n): Promise<{ imageBase64Url: string; rawData: string; rawMime: string; modelUsed: string }> {'
);

code = code.replace(
  'const genResult = await executeImageGenerationWithFallbacks(\n          client,\n          parts,\n          fullPrompt,\n          targetAspectRatio,\n          sizeSelected,\n          customApiKey\n        );',
  'const genResult = await executeImageGenerationWithFallbacks(\n          client,\n          parts,\n          fullPrompt,\n          targetAspectRatio,\n          sizeSelected,\n          customApiKey,\n          modelId\n        );'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server fallback function signature.");
