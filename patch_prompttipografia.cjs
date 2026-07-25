const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /if \(updates\.promptTipografia\) \{\n\s*filledItems\.push\("Ref\. Texto\/Tipografia"\);\n\s*\}/;
const replacement = `if (configJson.promptTipografia) {
          updates.promptTipografia = configJson.promptTipografia;
          filledItems.push("Ref. Texto/Tipografia");
        } else if (updates.promptTipografia) {
          filledItems.push("Ref. Texto/Tipografia");
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
