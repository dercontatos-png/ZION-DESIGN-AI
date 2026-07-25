const fs = require('fs');
let code = fs.readFileSync('src/utils/buildMasterPrompt.ts', 'utf8');

const regex = /promptParts\.push\("Ensure perfect typographic hierarchy, kerning, and contrast\. Text should look like it was designed by a human art director in Photoshop, integrating with the lighting and shadows\. Social media handles starting with '@' must remain strictly in lowercase\."\);/;
const replacement = `promptParts.push("Ensure perfect typographic hierarchy, kerning, and contrast. Text should look like it was designed by a human art director in Photoshop, integrating with the lighting and shadows. Social media handles starting with '@' must remain strictly in lowercase.");
      if (config.promptTipografia && config.promptTipografia.trim() !== "") {
        promptParts.push(\`CRITICAL TYPOGRAPHY POSITIONING INSTRUCTIONS: \${config.promptTipografia.trim()}\`);
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/buildMasterPrompt.ts', code);
