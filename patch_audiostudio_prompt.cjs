const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

const oldStr = `if (audioType === "Música" || audioType === "Vinheta / Jingle") {
        let genreStr = genre === "Customizado" ? customGenre : genre;
        if (genreStr) attrs.push(\`Genre/Style: \${genreStr}\`);
        
        if (vocalMode === "Com voz") {
          attrs.push(\`Vocals: \${vocalType} voice, \${vocalStyle} style, Language: \${language}\`);
          if (lyricsMode === "Tema da letra") attrs.push(\`Lyrics Theme: \${lyricsText}\`);
          else if (lyricsMode === "Inserir letra manual") attrs.push(\`Exact Lyrics: "\${lyricsText}"\`);
        } else {
          attrs.push("Vocals: Instrumental only, strictly no voice, no choir");
        }
        
        if (instruments.length > 0) attrs.push(\`Instrumentation: \${instruments.join(", ")}\`);
        if (energy !== "Média") attrs.push(\`Energy Level: \${energy}\`);
        if (mood !== "Nenhum") attrs.push(\`Mood/Emotion: \${mood}\`);
        
        let tempoStr = tempo === "Customizado" ? \`\${customBPM} BPM\` : tempo;
        if (tempoStr !== "Médio") attrs.push(\`Tempo: \${tempoStr}\`);
        
        if (structure) attrs.push(\`Song Structure: \${structure}\`);
        if (finalization !== "Padrão") attrs.push(\`Ending/Finalization: \${finalization}\`);
        if (loop) attrs.push("Format: Seamless loop");
      }`;

const newStr = `if (audioType !== "Efeito Sonoro (SFX)") {
        let genreStr = genre === "Customizado" ? customGenre : genre;
        if (genreStr) attrs.push(\`Genre/Style: \${genreStr}\`);
        
        if (audioType === "Música" || audioType === "Vinheta / Jingle") {
          if (vocalMode === "Com voz") {
            attrs.push(\`Vocals: \${vocalType} voice, \${vocalStyle} style, Language: \${language}\`);
            if (lyricsMode === "Tema da letra") attrs.push(\`Lyrics Theme: \${lyricsText}\`);
            else if (lyricsMode === "Inserir letra manual") attrs.push(\`Exact Lyrics: "\${lyricsText}"\`);
          } else {
            attrs.push("Vocals: Instrumental only, strictly no voice, no choir");
          }
        } else {
          attrs.push("Vocals: Instrumental only, strictly no voice, no choir");
        }
        
        if (instruments.length > 0) attrs.push(\`Instrumentation: \${instruments.join(", ")}\`);
        if (energy !== "Média") attrs.push(\`Energy Level: \${energy}\`);
        if (mood !== "Nenhum") attrs.push(\`Mood/Emotion: \${mood}\`);
        
        let tempoStr = tempo === "Customizado" ? \`\${customBPM} BPM\` : tempo;
        if (tempoStr !== "Médio") attrs.push(\`Tempo: \${tempoStr}\`);
        
        if (structure) attrs.push(\`Structure: \${structure}\`);
        if (finalization !== "Padrão") attrs.push(\`Ending/Finalization: \${finalization}\`);
        if (loop) attrs.push("Format: Seamless loop");
      }`;

if (code.includes('if (audioType === "Música" || audioType === "Vinheta / Jingle") {')) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('src/components/AudioStudio.tsx', code, 'utf-8');
    console.log("Patched prompt builder!");
} else {
    console.log("Could not find the target string");
}
