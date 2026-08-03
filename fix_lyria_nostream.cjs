const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCall = `      const response = await currentAi.models.generateContentStream({
        model: targetModel,
        contents: prompt,
        config: {
          responseModalities: ["AUDIO"]
        }
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

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

const newCall = `      const response = await currentAi.models.generateContent({
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

code = code.replace(oldCall, newCall);
fs.writeFileSync('server.ts', code);
