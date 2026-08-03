const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

// add import
if (!code.includes('ChatAudioAssistente')) {
  code = code.replace(
    'import { getActiveApiKey } from "../utils/apiUtils";',
    'import { getActiveApiKey } from "../utils/apiUtils";\nimport { ChatAudioAssistente } from "./ChatAudioAssistente";\nimport { toast } from "sonner";'
  );
}

// create onApplyAudioConfig inside component
const onApply = `
  const onApplyAudioConfig = (config: any) => {
    if (config.prompt !== undefined) setPrompt(config.prompt);
    if (config.model !== undefined) setModel(config.model);
    if (config.audioType !== undefined) setAudioType(config.audioType);
    if (config.duration !== undefined) setDuration(config.duration);
    if (config.vocalMode !== undefined) setVocalMode(config.vocalMode);
    if (config.vocalType !== undefined) setVocalType(config.vocalType);
    if (config.vocalStyle !== undefined) setVocalStyle(config.vocalStyle);
    if (config.language !== undefined) setLanguage(config.language);
    if (config.lyricsMode !== undefined) setLyricsMode(config.lyricsMode);
    if (config.lyricsText !== undefined) setLyricsText(config.lyricsText);
    if (config.genre !== undefined) setGenre(config.genre);
    if (config.customGenre !== undefined) setCustomGenre(config.customGenre);
    if (config.energy !== undefined) setEnergy(config.energy);
    if (config.mood !== undefined) setMood(config.mood);
    if (config.tempo !== undefined) setTempo(config.tempo);
    if (config.customBPM !== undefined) setCustomBPM(config.customBPM);
    if (config.structure !== undefined) setStructure(config.structure);
    if (config.sfxIntent !== undefined) setSfxIntent(config.sfxIntent);
    if (config.sfxEnv !== undefined) setSfxEnv(config.sfxEnv);
    if (config.sfxMix !== undefined) setSfxMix(config.sfxMix);
    if (config.sfxLayers !== undefined) setSfxLayers(config.sfxLayers);
    if (config.finalization !== undefined) setFinalization(config.finalization);
    if (config.loop !== undefined) setLoop(config.loop);
    if (config.blockMusicality !== undefined) setBlockMusicality(config.blockMusicality);
    if (config.quality !== undefined) setQuality(config.quality);
    if (config.negativePrompt !== undefined) setNegativePrompt(config.negativePrompt);
  };
`;

if (!code.includes('const onApplyAudioConfig')) {
  code = code.replace(
    '  const handleGenerate = async () => {',
    onApply + '\n  const handleGenerate = async () => {'
  );
}

// insert component in return
const componentCall = `
      <ChatAudioAssistente 
        customApiKey={getActiveApiKey()} 
        showToast={(msg, type) => type === "error" ? toast.error(msg) : toast.success(msg)} 
        currentConfig={{ prompt, model, audioType, duration, vocalMode, vocalType, vocalStyle, language, lyricsMode, lyricsText, genre, customGenre, energy, mood, tempo, customBPM, structure, sfxIntent, sfxEnv, sfxMix, sfxLayers, finalization, loop, blockMusicality, quality, negativePrompt }}
        onApplyConfig={onApplyAudioConfig}
      />
    </div>
  );
`;

const matchStr = '    </div>\n  );\n};';
if (code.includes(matchStr)) {
  code = code.replace(
    matchStr,
    componentCall + '\n};'
  );
} else {
    // try a different match
    code = code.replace(
        / {4}<\/div>\n  \);\n};\s*$/,
        componentCall + '\n};'
    );
}

fs.writeFileSync('src/components/AudioStudio.tsx', code, 'utf-8');
console.log("Embedded ChatAudioAssistente!");
