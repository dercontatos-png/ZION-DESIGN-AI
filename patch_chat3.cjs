const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /store\.setSujeitoBase64List\(subjectListWithCard\);\s*store\.updateConfig\(\{ desativarSujeito: false \}\);/g;

const replacement = `store.setSujeitoBase64List(subjectListWithCard);
          if (updates && updates.desativarSujeito === true) {
            // Respect AI decision
          } else {
            store.updateConfig({ desativarSujeito: false });
          }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
