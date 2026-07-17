const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  /if \(sceCount > 0\) \{\s*const currentList = isReplaceMode \? \[\] : \(store\.cenariosBase64List \|\| \[\]\);\s*store\.setCenarioBase64List\(\[\.\.\.currentList, \.\.\.newScenes\]\);\s*store\.updateConfig\(\{ useEnvRef: true \}\);\s*filledItems\.push\(\`\$\{sceCount\} Cenário\(s\)\`\);\s*\}/,
  `if (sceCount > 0) {
          const currentList = isReplaceMode ? [] : (store.cenariosBase64List || []);
          store.setCenarioBase64List([...currentList, ...newScenes]);
          if (parsedConfigJson && parsedConfigJson.useEnvRef === false) {
             // respect AI
          } else {
             store.updateConfig({ useEnvRef: true });
          }
          filledItems.push(\`\${sceCount} Cenário(s)\`);
        }`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Fuzzy match scene toggle patched!");
