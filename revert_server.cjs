const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacedInit = `      // Find best client for Lyria (requires API key, Vertex AI might not support it yet)
      const token = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!token || token.startsWith("{")) {
        return res.status(400).json({ error: "Lyria requires a Gemini API Key. Please set it in Settings." });
      }
      const currentAi = new (require('@google/genai').GoogleGenAI)({ apiKey: token });
`;

const originalInit = `      const currentAi = getAiClient(customApiKey);
      if (!currentAi) {
        return res.status(400).json({ error: "API Key não configurada." });
      }`;

code = code.replace(replacedInit, originalInit);
fs.writeFileSync('server.ts', code);
