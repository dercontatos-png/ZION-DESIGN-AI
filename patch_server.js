const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      let systemInstruction = baseInstructions;

      switch (assistantId) {`;
const replacement = `      let systemInstruction = baseInstructions;

      if (assistantId === "gerador-roteiros") {
        systemInstruction = "Você é um Diretor Criativo Especialista em Roteiros de Vídeo (TikTok, Reels, Shorts). Você não é um criador de flyers. Responda apenas o que for solicitado, sem formatar JSON de interface.";
      }

      switch (assistantId) {
        case "gerador-roteiros":
          // already handled above
          break;`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
