const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      let currentAi = getAiClient(customApiKey);
      if (!currentAi) {
        return res.status(400).json({ error: "API Key não configurada." });
      }
      
      const isVertex = currentAi && (currentAi as any).debugInfo?.isUsingVertex;
      const targetModel = modelId === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const vertexOptions = {
          ...((currentAi as any)._options || {}),
          vertexai: true,
          project: (currentAi as any).project || (currentAi as any)._options?.project || process.env.GOOGLE_CLOUD_PROJECT || "gerador-de-imagens-ia-502303",
          location: 'global'
        };
        delete vertexOptions.apiKey;
        const lyriaAi = new GoogleGenAI(vertexOptions);
        
        const response = await lyriaAi.interactions.create({
          model: targetModel,
          input: [{ type: "text", text: prompt }]
        });`;

const newCode = `      let currentAi = getAiClient(customApiKey, "global");
      if (!currentAi) {
        return res.status(400).json({ error: "API Key não configurada." });
      }
      
      const isVertex = currentAi && (currentAi as any).debugInfo?.isUsingVertex;
      const targetModel = modelId === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const response = await currentAi.interactions.create({
          model: targetModel,
          input: [{ type: "text", text: prompt }]
        });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
