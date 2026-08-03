const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if\s*\(isVertex\)\s*\{\s*\/\/\s*Vertex AI requires Interactions API[\s\S]*?else\s*\{\s*\/\/\s*AI Studio uses standard generateContent[\s\S]*?\}\s*\}/;

const newCode = `// Both Vertex AI and Google AI Studio use the Interactions API for Lyria models
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
          lyrics += out.text + "\\n\\n";
        }
      }`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully!");
} else {
  console.log("Could not find regex!");
}
