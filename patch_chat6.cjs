const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const startTag = `// 1. Cenário`;
const endTag = `// 6. Logotipo`;
// We want to remove from // 1. Cenário up to the end of // 6. Logotipo block

const regex = /\/\/ 1\. Cenário[\s\S]*?\/\/ 6\. Logotipo[\s\S]*?filledItems\.push\("Logo \(do Card\)"\);\n\s*\}/;

const replacement = `// A referência de design agora atua APENAS como design/layout. Não duplicamos a imagem para logo, sujeito, etc.
          const defaultDesignPrompt = parsedConfigJson?.promptDesign || updates.promptDesign || "Copiar a proporção dos espaços vazios, o grid estrutural, e o posicionamento de composição de elementos deste card de referência.";
          store.updateConfig({ promptDesign: defaultDesignPrompt });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
