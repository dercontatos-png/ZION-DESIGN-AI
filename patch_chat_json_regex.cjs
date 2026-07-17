const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  /const jsonMatch = content\.match\(\/```json\\s\*\(\{\[\\s\\S\]\*\?\}\)\\s\*```\/\);/,
  `const jsonMatch = content.match(/\\\`\\\`\\\`(?:json)?\\s*(\\{[\\s\\S]*?\\})\\s*\\\`\\\`\\\`/) || content.match(/(\\{[\\s\\S]*\\})/);`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("JSON regex patched!");
