const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /let targetType = activeAssistant\.id === "diretor-criativo" \? "design" : "style";\s*let styleDescription = "Referência de estilo gerada pelo assistente\.";\s*let matchedKey = null;\s*if \(activeAssistant\.id !== "diretor-criativo"\) \{([\s\S]*?)\}\s*if \(targetType === "style"\) \{/g;

const replacement = `let targetType = activeAssistant.id === "diretor-criativo" ? "design" : "style";
          let styleDescription = "Referência de estilo gerada pelo assistente.";
          
          let matchedKey = null;
          $1
          
          if (targetType === "style") {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
