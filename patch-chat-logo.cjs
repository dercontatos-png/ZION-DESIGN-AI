const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  '// Aplica a Logo do cliente se existir\n        if (client.logoBase64 && client.logoBase64.length > 50 && client.logoBase64 !== "undefined") {\n          // Precisamos pegar a lista atual do store OU os newLogos que acabaram de ser processados\n          let currentList = isReplaceMode ? [] : (store.logosList || []);\n          if (logCount > 0) {\n             currentList = [...currentList, ...newLogos];\n          }\n          if (!currentList.includes(client.logoBase64)) {\n             store.setLogosList([...currentList, client.logoBase64]);\n             if (updates && updates.useLogo !== undefined) {\n            store.updateConfig({ useLogo: updates.useLogo });\n          } else {\n            store.updateConfig({ useLogo: true });\n          }\n             if (!filledItems.includes("Logo do Cliente")) filledItems.push("Logo do Cliente");\n          }\n        }',
  '// Aplica a Logo do cliente se existir\n        if (client.logoBase64 && client.logoBase64.length > 50 && client.logoBase64 !== "undefined") {\n          if (logCount === 0 && (!store.logosList || store.logosList.length === 0 || isReplaceMode)) {\n             store.setLogosList([client.logoBase64]);\n             if (updates && updates.useLogo !== undefined) {\n               store.updateConfig({ useLogo: updates.useLogo });\n             } else {\n               store.updateConfig({ useLogo: true });\n             }\n             if (!filledItems.includes("Logo do Cliente")) filledItems.push("Logo do Cliente");\n          }\n        }'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched ChatAssistente logo handling.");
