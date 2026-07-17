const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  /if \(subCount > 0\) \{\s*const currentList = isReplaceMode \? \[\] : \(store\.sujeitosBase64List \|\| \[\]\);\s*store\.setSujeitoBase64List\(\[\.\.\.currentList, \.\.\.newSubjects\]\);\s*store\.updateConfig\(\{ noPeople: false, desativarSujeito: false \}\);\s*filledItems\.push\(\`\$\{subCount\} Sujeito\(s\)\`\);\s*\}/,
  `if (subCount > 0) {
          const currentList = isReplaceMode ? [] : (store.sujeitosBase64List || []);
          store.setSujeitoBase64List([...currentList, ...newSubjects]);
          if (parsedConfigJson && parsedConfigJson.desativarSujeito === true) {
             // respeitar a decisao da IA de desativar
          } else {
             store.updateConfig({ noPeople: false, desativarSujeito: false });
          }
          filledItems.push(\`\${subCount} Sujeito(s)\`);
        }`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Fuzzy match subject toggle patched!");
