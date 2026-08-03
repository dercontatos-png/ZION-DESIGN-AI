const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const GoogleGenAI = require('@google/genai').GoogleGenAI;
        const vertexOptions = { ...currentAi._options, location: 'global' };
        // Delete apiKey if it's there to avoid mixing vertex and api key
        delete vertexOptions.apiKey;
        const lyriaAi = new GoogleGenAI(vertexOptions);`;

const newCode = `      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const GoogleGenAI = require('@google/genai').GoogleGenAI;
        const vertexOptions = {
          vertexai: true,
          project: currentAi.project || process.env.GOOGLE_CLOUD_PROJECT || "gerador-de-imagens-ia-502303",
          location: 'global'
        };
        const lyriaAi = new GoogleGenAI(vertexOptions);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
