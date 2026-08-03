const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      if (isVertex) {
        // Vertex AI requires Interactions API and "global" location for Lyria 3
        const response = await currentAi.interactions.create({
          model: targetModel,
          input: [{ type: "text", text: prompt }]
        });
        
        // Extract from interactions response format
        const outputs = (response as any).outputs || [];
        for (const out of outputs) {
          if (out.type === "audio" && out.data) {
            audioBase64 = out.data;
            mimeType = out.mime_type || "audio/mp3";
          }
          if (out.type === "text" && out.text) {
            // It could be lyrics or description, append both or just lyrics
            lyrics += out.text + "\n\n";
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
          if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
            audioBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType;
          } else if (part.text) {
            lyrics += part.text;
          }
        }
      }`;

const newCode = `      // Both Vertex AI and Google AI Studio use the Interactions API for Lyria models
      const response = await currentAi.interactions.create({
        model: targetModel,
        input: [{ type: "text", text: prompt }]
      });
      
      // Extract from interactions response format
      const outputs = (response as any).outputs || [];
      for (const out of outputs) {
        if (out.type === "audio" && out.data) {
          audioBase64 = out.data;
          mimeType = out.mime_type || "audio/mp3";
        }
        if (out.type === "text" && out.text) {
          // It could be lyrics or description, append both or just lyrics
          lyrics += out.text + "\n\n";
        }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
