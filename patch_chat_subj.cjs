const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /if \(updates && updates\.desativarSujeito === true\) \{\s*\/\/ respeitar a decisao da IA de desativar\s*\} else \{\s*store\.updateConfig\(\{ noPeople: false, desativarSujeito: false \}\);\s*\}/g;

const replacement = `if (updates && updates.desativarSujeito !== undefined) {
             store.updateConfig({ desativarSujeito: updates.desativarSujeito, noPeople: updates.noPeople !== undefined ? updates.noPeople : updates.desativarSujeito });
          } else {
             store.updateConfig({ noPeople: false, desativarSujeito: false });
          }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
