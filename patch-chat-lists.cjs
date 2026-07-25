const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  'if (subCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.sujeitosBase64List || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newSubjects]));\n          store.setSujeitoBase64List(uniqueList);\n          if (updates && updates.desativarSujeito !== undefined) {\n             store.updateConfig({ desativarSujeito: updates.desativarSujeito, noPeople: updates.noPeople !== undefined ? updates.noPeople : updates.desativarSujeito });\n          } else {\n             store.updateConfig({ noPeople: false, desativarSujeito: false });\n          }\n          filledItems.push(`${subCount} Sujeito(s)`);\n        } else {\n          if (updates && updates.desativarSujeito !== undefined) {',
  'if (subCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.sujeitosBase64List || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newSubjects]));\n          store.setSujeitoBase64List(uniqueList);\n          if (updates && updates.desativarSujeito !== undefined) {\n             store.updateConfig({ desativarSujeito: updates.desativarSujeito, noPeople: updates.noPeople !== undefined ? updates.noPeople : updates.desativarSujeito });\n          } else {\n             store.updateConfig({ noPeople: false, desativarSujeito: false });\n          }\n          filledItems.push(`${subCount} Sujeito(s)`);\n        } else {\n          if (isReplaceMode) store.setSujeitoBase64List([]);\n          if (updates && updates.desativarSujeito !== undefined) {'
);

code = code.replace(
  'if (sceCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.cenariosBase64List || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newScenes]));\n          store.setCenarioBase64List(uniqueList);\n          if (updates && updates.useEnvRef === false) {\n             // respect AI\n          } else {\n             if (updates && updates.useEnvRef !== undefined) { store.updateConfig({ useEnvRef: updates.useEnvRef }); } else { store.updateConfig({ useEnvRef: true }); }\n          }\n          filledItems.push(`${sceCount} Cenário(s)`);\n        } else {\n          if (updates && updates.useEnvRef !== undefined) {',
  'if (sceCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.cenariosBase64List || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newScenes]));\n          store.setCenarioBase64List(uniqueList);\n          if (updates && updates.useEnvRef === false) {\n             // respect AI\n          } else {\n             if (updates && updates.useEnvRef !== undefined) { store.updateConfig({ useEnvRef: updates.useEnvRef }); } else { store.updateConfig({ useEnvRef: true }); }\n          }\n          filledItems.push(`${sceCount} Cenário(s)`);\n        } else {\n          if (isReplaceMode) store.setCenarioBase64List([]);\n          if (updates && updates.useEnvRef !== undefined) {'
);

code = code.replace(
  'if (typoCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.tipografiaRefsList || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newTypographies]));\n          store.setTipografiaRefsList(uniqueList);\n          filledItems.push(`${typoCount} Ref. Texto`);\n        }',
  'if (typoCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.tipografiaRefsList || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newTypographies]));\n          store.setTipografiaRefsList(uniqueList);\n          filledItems.push(`${typoCount} Ref. Texto`);\n        } else if (isReplaceMode) {\n          store.setTipografiaRefsList([]);\n        }'
);

code = code.replace(
  'if (desCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.designRefsList || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newDesigns]));\n          store.setDesignRefsList(uniqueList);\n          filledItems.push(`${desCount} Design(s)`);',
  'if (desCount > 0) {\n          const currentList = isReplaceMode ? [] : (store.designRefsList || []);\n          const uniqueList = Array.from(new Set([...currentList, ...newDesigns]));\n          store.setDesignRefsList(uniqueList);\n          filledItems.push(`${desCount} Design(s)`);\n        } else if (isReplaceMode) {\n          store.setDesignRefsList([]);\n        }\n\n        if (desCount > 0) {'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched ChatAssistente lists.");
