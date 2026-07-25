const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  'if (logCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.logosList || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newLogos]));\n          store.setLogosList(uniqueList);\n          if (updates && updates.useLogo !== undefined) {\n            store.updateConfig({ useLogo: updates.useLogo });\n          } else {\n            store.updateConfig({ useLogo: true });\n          }\n          filledItems.push(`${logCount} Logo(s)`);\n        }',
  'if (logCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.logosList || []);\n          let uniqueList = Array.from(new Set([...currentList, ...newLogos]));\n          if (uniqueList.length > 1) uniqueList = [uniqueList[uniqueList.length - 1]]; // Keep only one logo\n          store.setLogosList(uniqueList);\n          if (updates && updates.useLogo !== undefined) {\n            store.updateConfig({ useLogo: updates.useLogo });\n          } else {\n            store.updateConfig({ useLogo: true });\n          }\n          filledItems.push(`${logCount} Logo(s)`);\n        } else if (isReplaceMode) {\n          store.setLogosList([]);\n        }'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched ChatAssistente logo 2.");
