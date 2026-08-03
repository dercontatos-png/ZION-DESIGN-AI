const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const GoogleGenAI = require('@google/genai').GoogleGenAI;
        const vertexOptions = {`;

const newCode = `      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const vertexOptions = {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
