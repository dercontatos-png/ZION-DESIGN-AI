const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /config: {\n\s*responseMimeType: "application\/json"\n\s*}/g;
const replacement = `config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                systemInstruction: { type: "string" }
              },
              required: ["prompt", "systemInstruction"]
            }
          }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
