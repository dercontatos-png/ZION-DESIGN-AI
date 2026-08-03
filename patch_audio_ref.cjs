const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const audioRefRegex = /\} else if \(file\.mimetype\.startsWith\("audio\/"\)\) \{[\s\S]*?inputElements\.push\(\{ type: "audio", mime_type: file\.mimetype, data: file\.buffer\.toString\("base64"\) \}\);\n\s*\}/;

if (content.match(audioRefRegex)) {
  const replacement = `} else if (file.mimetype.startsWith("audio/")) {
           try {
             const standardAi = getAiClient(customApiKey);
             if (standardAi) {
               const audioRes = await standardAi.models.generateContent({
                 model: "gemini-3.6-flash",
                 contents: [{
                   role: "user",
                   parts: [
                     { text: "Analise este áudio. Descreva detalhadamente o ritmo, a instrumentação, o estilo e as emoções transmitidas para servir de referência para gerar uma nova música." },
                     { inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") } }
                   ]
                 }]
               });
               finalPrompt = \`Referência de Áudio Analisada: \${audioRes.text()}\\n\\nPedido do usuário: \${finalPrompt}\`;
             }
           } catch (e: any) {
             console.error("Audio analysis error:", e);
             finalPrompt = \`O usuário enviou um áudio, mas não pôde ser analisado (\${e.message}). Tente gerar o áudio baseado apenas neste texto: \${finalPrompt}\`;
           }
        }`;
  content = content.replace(audioRefRegex, replacement);
  fs.writeFileSync('server.ts', content);
  console.log("Patched server audio reference!");
} else {
  console.log("Could not find audio ref regex in server.ts");
}
