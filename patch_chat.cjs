const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const oldSubj = `          store.setSujeitoBase64List(subjectListWithCard);
          store.updateConfig({ desativarSujeito: false });`;
const newSubj = `          store.setSujeitoBase64List(subjectListWithCard);
          if (updates && updates.desativarSujeito === true) {
            // Respect AI decision
          } else {
            store.updateConfig({ desativarSujeito: false });
          }`;

code = code.replace(oldSubj, newSubj);

const applyUpdates = `        if (Object.keys(updates).length > 0) {
          store.updateConfig(updates);
        }`;

// Let's check where store.updateConfig(updates) happens.
