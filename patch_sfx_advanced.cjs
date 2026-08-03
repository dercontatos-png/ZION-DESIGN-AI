const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

// Add blockMusicality state
const loopStateRegex = /const \[loop, setLoop\] = useState\(false\);/;
if (code.match(loopStateRegex)) {
  code = code.replace(loopStateRegex, `const [loop, setLoop] = useState(false);
  const [blockMusicality, setBlockMusicality] = useState(false);`);
}

// Update preset function to handle blockMusicality
const applyPresetRegex = /const applyPreset = \(preset: string\) => \{[\s\S]*?if \(preset === "Vinheta TV"\) \{/;
if (code.match(applyPresetRegex)) {
  code = code.replace(applyPresetRegex, `const applyPreset = (preset: string) => {
    setShowAdvanced(true);
    setAudioType("Música");
    setBlockMusicality(false);
    if (preset === "Vinheta TV") {`);
}

const sfxPresetRegex = /\} else if \(preset === "Efeito Sonoro \(SFX\)"\) \{[\s\S]*?\}\s*\}\;/;
if (code.match(sfxPresetRegex)) {
  code = code.replace(sfxPresetRegex, `} else if (preset === "Efeito Sonoro (SFX)") {
      setAudioType("Efeito Sonoro (SFX)");
      setDuration("Muito Curto (5-10s)");
      setMood("Nenhum");
      setGenre("Customizado");
      setCustomGenre("Cinematic Foley / Realistic");
      setInstruments([]);
      setVocalMode("Sem voz (Instrumental)");
      setStructure("Single impact/event, short decay");
      setFinalization("Corte seco");
      setBlockMusicality(true);
    }
  };`);
}

// Update finalPrompt builder
const finalPromptBuilderRegex = /if \(audioType === "Efeito Sonoro \(SFX\)"\) \{[\s\S]*?finalPrompt = contextPrefix \+ \(prompt \? prompt \+ "\. " : ""\);/m;
if (code.match(finalPromptBuilderRegex)) {
  const newBuilder = `if (audioType === "Efeito Sonoro (SFX)") {
        contextPrefix = "isolated realistic sound effect, single shot, no music, no background ambience, dry studio recording, sharp transient, short decay, high dynamic impact. Generate a realistic sound effect of: ";
      } else if (audioType === "Vinheta / Jingle") {
        contextPrefix = "Short jingle/intro/outro. ";
      } else if (audioType === "Som Ambiente") {
        contextPrefix = "AMBIENT SOUND ONLY. NO MUSIC, NO MELODY. Pure environmental ambient sound of: ";
      } else {
        contextPrefix = "A structured musical track. ";
      }
      
      finalPrompt = contextPrefix + (prompt ? prompt + ". " : "");
      
      if (blockMusicality || audioType === "Efeito Sonoro (SFX)" || audioType === "Som Ambiente") {
         finalPrompt += " (CRITICAL: ABSOLUTELY NO MUSIC, NO MELODY, NO HARMONY, NO SOUNDTRACK, NO RHYTHM) ";
      }`;
  code = code.replace(finalPromptBuilderRegex, newBuilder);
}

// UI changes: Add the blockMusicality toggle to the quality section
const qualityRowRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-800">/;
if (code.match(qualityRowRegex)) {
  const newRow = `<div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
                    <div>
                      <span className="text-xs font-bold text-red-400 block">Bloquear Musicalidade (Foley/SFX Mode)</span>
                      <span className="text-[10px] text-gray-400">Força a Lyria a não gerar música (adiciona negative prompts severos).</span>
                    </div>
                    <button
                      onClick={() => setBlockMusicality(!blockMusicality)}
                      className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${blockMusicality ? "bg-red-500" : "bg-gray-600"}\`}
                    >
                      <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${blockMusicality ? "translate-x-5" : "translate-x-1"}\`} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;
  code = code.replace(qualityRowRegex, newRow);
}

fs.writeFileSync('src/components/AudioStudio.tsx', code);
console.log("Patched successfully!");
