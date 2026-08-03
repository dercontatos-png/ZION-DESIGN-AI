const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldRegex = /app\.post\("\/api\/generate-audio", async \(req, res\) => \{\s*try \{\s*const \{ prompt, modelId, customApiKey \} = req\.body;\s*if \(\!prompt[\s\S]*?let currentAi = getAiClient\(customApiKey, "global"\);[\s\S]*?if \(\!currentAi\) \{[\s\S]*?\}\s*const isVertex =[\s\S]*?let mimeType = "audio\/wav";\s*\/\/ Both Vertex AI and Google AI Studio use the Interactions API for Lyria models\s*const response = await currentAi\.interactions\.create\(\{\s*model: targetModel,\s*input: \[\{ type: "text", text: prompt \}\]\s*\}\);/m;

const newCode = `app.post("/api/generate-audio", upload.single("file") as any, async (req, res) => {
    try {
      const { prompt, modelId, customApiKey } = req.body;
      let finalPrompt = prompt || "";
      if (!finalPrompt.trim() && !req.file) {
        return res.status(400).json({ error: "Prompt ou arquivo é obrigatório." });
      }
      
      let currentAi = getAiClient(customApiKey, "global");
      if (!currentAi) {
        return res.status(400).json({ error: "API Key não configurada." });
      }
      
      const isVertex = currentAi && (currentAi as any).debugInfo?.isUsingVertex;
      const targetModel = modelId === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";
      
      const inputElements: any[] = [];
      
      if (req.file) {
        const file = req.file;
        if (file.mimetype.startsWith("video/")) {
           try {
             const standardAi = getAiClient(customApiKey);
             if (standardAi) {
               const videoRes = await standardAi.models.generateContent({
                 model: "gemini-2.5-flash",
                 contents: [{
                   role: "user",
                   parts: [
                     { text: "Analise este vídeo. Descreva detalhadamente o clima, o ritmo, as emoções e sugira uma direção musical e instrumentos ideais para uma trilha sonora que acompanhe este vídeo." },
                     { inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") } }
                   ]
                 }]
               });
               finalPrompt = \`Análise do vídeo fornecido: \${videoRes.text()}\\n\\nPedido do usuário: \${finalPrompt}\`;
             }
           } catch (e: any) {
             console.error("Video analysis error:", e);
             finalPrompt = \`O usuário enviou um vídeo, mas não pôde ser analisado (\${e.message}). Tente gerar o áudio baseado apenas neste texto: \${finalPrompt}\`;
           }
        } else if (file.mimetype.startsWith("audio/")) {
           // For audio, we can try to pass it directly to Lyria if supported, or just use Flash to describe it
           // Let's pass it directly to Lyria as an audio part
           inputElements.push({ type: "audio", mime_type: file.mimetype, data: file.buffer.toString("base64") });
        } else if (file.mimetype.startsWith("image/")) {
           inputElements.push({ type: "image", mime_type: file.mimetype, data: file.buffer.toString("base64") });
        }
      }
      
      if (finalPrompt.trim()) {
        inputElements.push({ type: "text", text: finalPrompt });
      }

      // Both Vertex AI and Google AI Studio use the Interactions API for Lyria models
      const response = await currentAi.interactions.create({
        model: targetModel,
        input: inputElements
      });`;

const match = code.match(oldRegex);
if (match) {
  code = code.replace(match[0], newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Regex not found in server.ts!");
}
