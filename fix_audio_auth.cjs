const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `        const vertexOptions = {
          vertexai: true,
          project: (currentAi as any).project || (currentAi as any)._options?.project || process.env.GOOGLE_CLOUD_PROJECT || "gerador-de-imagens-ia-502303",
          location: 'global'
        };`;

const newCode = `        const vertexOptions = {
          ...((currentAi as any)._options || {}),
          vertexai: true,
          project: (currentAi as any).project || (currentAi as any)._options?.project || process.env.GOOGLE_CLOUD_PROJECT || "gerador-de-imagens-ia-502303",
          location: 'global'
        };
        delete vertexOptions.apiKey;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
