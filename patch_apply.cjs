const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const oldStr = `        if (styCount > 0) {
          filledItems.push(\`\${styCount} Estilo(s)\`);`;

const newStr = `        if (logCount === 0 && activeClientId) {
          const client = clients.find(c => c.id === activeClientId);
          if (client && client.logoBase64) {
             const currentList = isReplaceMode ? [] : (store.logosList || []);
             store.setLogosList([...currentList, client.logoBase64]);
             store.updateConfig({ useLogo: true });
             filledItems.push("Logo do Cliente");
          }
        }

        if (configJson.aprendizado_cliente && activeClientId) {
           appendAiLearnings(activeClientId, configJson.aprendizado_cliente);
        }

        if (styCount > 0) {
          filledItems.push(\`\${styCount} Estilo(s)\`);`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
