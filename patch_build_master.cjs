const fs = require('fs');
let code = fs.readFileSync('src/utils/buildMasterPrompt.ts', 'utf8');

const regex = /if \(config\.coresAutomaticas\) \{\n\s*promptParts\.push\("Lighting & Colors: Harmonious automatic studio lighting, flawless skin\/material reflections, cohesive color grading\."\);\n\s*\} else \{/;
const replacement = `if (config.coresAutomaticas) {
    if (config.designRefBase64 || (config.designRefsList && config.designRefsList.length > 0)) {
      promptParts.push("Lighting & Colors: STRICTLY copy the original color palette, lighting colors, gradient tones, and ambient hues of the provided Design Layout Reference.");
    } else {
      promptParts.push("Lighting & Colors: Harmonious automatic studio lighting, flawless skin/material reflections, cohesive color grading.");
    }
  } else {`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/buildMasterPrompt.ts', code);
