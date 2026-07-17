const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex1 = /if \(updates && updates\.desativarSujeito === true\) \{\s*\/\/ Respect AI decision\s*\} else \{\s*store\.updateConfig\(\{ desativarSujeito: false \}\);\s*\}/g;

const replacement1 = `if (updates && updates.desativarSujeito !== undefined) {
            store.updateConfig({ desativarSujeito: updates.desativarSujeito });
          } else {
            store.updateConfig({ desativarSujeito: false });
          }`;

code = code.replace(regex1, replacement1);

const regex2 = /if \(updates && updates\.useLogo === false\) \{\s*\/\/ Respect AI decision\s*\} else \{\s*store\.updateConfig\(\{ useLogo: true \}\);\s*\}/g;

const replacement2 = `if (updates && updates.useLogo !== undefined) {
            store.updateConfig({ useLogo: updates.useLogo });
          } else {
            store.updateConfig({ useLogo: true });
          }`;

code = code.replace(regex2, replacement2);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
