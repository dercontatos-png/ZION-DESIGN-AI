const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/\s*Extract from interactions response format[\s\S]*?res\.json\(\{ audioBase64, lyrics, mimeType \}\);/;

const newCode = `// Extract from interactions response format
      if ((response as any).output_audio && (response as any).output_audio.data) {
        audioBase64 = (response as any).output_audio.data;
        mimeType = (response as any).output_audio.mime_type || "audio/mp3";
      }
      if ((response as any).output_text) {
        lyrics = (response as any).output_text;
      }
      
      res.json({ audioBase64, lyrics, mimeType });`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully!");
} else {
  console.log("Could not find regex!");
}
