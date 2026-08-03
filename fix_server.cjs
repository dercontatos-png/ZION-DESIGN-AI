const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const originalStreamCall = `      const response = await currentAi.models.generateContentStream({
        model: targetModel,
        contents: prompt,
      });`;

const replacedStreamCall = `      const response = await currentAi.models.generateContentStream({
        model: targetModel,
        contents: prompt,
        config: {
          responseModalities: ["AUDIO"]
        }
      });`;

code = code.replace(originalStreamCall, replacedStreamCall);
fs.writeFileSync('server.ts', code);
