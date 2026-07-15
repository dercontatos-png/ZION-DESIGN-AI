const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /console\.warn\(\`\[api\/gerar\] Vertex AI failed, falling back to standard AI Studio API Key\.\.\.\`\);/g,
  'console.warn(`[api/gerar] Vertex AI failed, falling back to standard AI Studio API Key... Error was:`, initialErr);\n            console.error(initialErr);'
);

code = code.replace(
  /console\.warn\(\`\[api\/generate\] Vertex AI failed, trying AI Studio fallback\.\.\.\`\);/g,
  'console.warn(`[api/generate] Vertex AI failed, trying AI Studio fallback... Error was:`, initialErr);\n            console.error(initialErr);'
);

fs.writeFileSync('server.ts', code);
