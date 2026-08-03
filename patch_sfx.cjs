const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

const regex = /let finalPrompt = prompt;[\s\S]*?const formData = new FormData\(\);/;

const newCode = `let finalPrompt = prompt;
      
      let contextPrefix = "";
      if (audioType === "Efeito Sonoro (SFX)") {
        contextPrefix = "PURE SOUND EFFECT ONLY. ABSOLUTELY NO MUSIC, NO INSTRUMENTS, NO MELODY, NO BEAT. Generate a realistic sound effect of: ";
      } else if (audioType === "Vinheta / Jingle") {
        contextPrefix = "Short jingle/intro/outro. ";
      } else if (audioType === "Som Ambiente") {
        contextPrefix = "AMBIENT SOUND ONLY. NO MUSIC, NO MELODY. Pure environmental ambient sound of: ";
      }
      
      if (contextPrefix) {
        finalPrompt = contextPrefix + prompt;
      }
      
      let instructions = [];
      if (duration !== "Padrão") instructions.push(\`Duração: \${duration}\`);
      if (mood !== "Nenhum") instructions.push(\`Clima/Emoção: \${mood}\`);
      
      if (instructions.length > 0) {
        finalPrompt += \`. (Instruções adicionais: \${instructions.join(", ")})\`;
      }

      const formData = new FormData();`;

if (code.match(regex)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/components/AudioStudio.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Regex not found.");
}
