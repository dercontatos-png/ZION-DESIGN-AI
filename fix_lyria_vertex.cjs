const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      let currentAi = getAiClient(customApiKey);
      
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
      }
      
      const targetModel = modelId === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

      const response = await currentAi.models.generateContent({
        model: targetModel,
        contents: prompt,
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics += part.text;
        }
      }`;

const newCode = `      let currentAi = getAiClient(customApiKey);
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
        const GoogleGenAI = require('@google/genai').GoogleGenAI;
        const vertexOptions = { ...currentAi._options, location: 'global' };
        // Delete apiKey if it's there to avoid mixing vertex and api key
        delete vertexOptions.apiKey;
        const lyriaAi = new GoogleGenAI(vertexOptions);
        
        const response = await lyriaAi.interactions.create({
          model: targetModel,
          input: [{ type: "text", text: prompt }]
        });
        
        // Extract from interactions response format
        const outputs = response.outputs || [];
        for (const out of outputs) {
          if (out.type === "audio" && out.data) {
            audioBase64 = out.data;
            mimeType = out.mime_type || "audio/mp3";
          }
          if (out.type === "text" && out.text) {
            // It could be lyrics or description, append both or just lyrics
            lyrics += out.text + "\\n\\n";
          }
        }
      } else {
        // AI Studio uses standard generateContent
        const response = await currentAi.models.generateContent({
          model: targetModel,
          contents: prompt,
        });
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics += part.text;
          }
        }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
