const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  /if \(configJson\.corDominante\) \{\s*updates\.corDominante = configJson\.corDominante;\s*updates\.useCorDominante = true;\s*filledItems\.push\("Cor Dominante"\);\s*\}/,
  `if (configJson.corDominante) {
          updates.corDominante = configJson.corDominante;
          if (typeof configJson.useCorDominante !== "boolean") {
            updates.useCorDominante = true;
          }
          filledItems.push("Cor Dominante");
        }`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("corDominante logic patched!");
