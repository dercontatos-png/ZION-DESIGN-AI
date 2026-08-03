const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      const currentAi = getAiClient(customApiKey);
      if (!currentAi) {
        return res.status(400).json({ error: "API Key não configurada." });
      }`;

const newCode = `      let currentAi = getAiClient(customApiKey);
      
      // Lyria is AI Studio only. If the client is Vertex, we must fall back to a standard API key if available.
      const isVertex = currentAi && (currentAi as any).debugInfo?.isUsingVertex;
      if (isVertex || !currentAi) {
         // Try to find a standard AI Studio key
         const rawKey = customApiKey?.trim() || "";
         let standardKey = "";
         if (rawKey.startsWith("AIza")) {
           standardKey = rawKey;
         } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIza")) {
           standardKey = process.env.GEMINI_API_KEY;
         } else if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith("AIza")) {
           standardKey = process.env.GOOGLE_API_KEY;
         }
         
         if (standardKey) {
           currentAi = new (require('@google/genai').GoogleGenAI)({ apiKey: standardKey });
         } else {
           return res.status(400).json({ error: "O modelo Lyria é exclusivo da Gemini API. Sua chave atual é do Vertex AI (GCP). Por favor, insira uma API Key padrão (começando com AIza) do Google AI Studio para usar a geração de áudio." });
         }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
