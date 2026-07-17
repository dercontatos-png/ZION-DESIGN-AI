const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /store\.updateConfig\(\{ useLogo: true \}\);/g;
const replacement = `if (updates && updates.useLogo === false) {
            // Respect AI decision
          } else {
            store.updateConfig({ useLogo: true });
          }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
