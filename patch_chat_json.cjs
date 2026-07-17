const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /const jsonMatch = content\.match\(\/```json\\s\*\(\{\[\\s\\S\]\*\?\}\)\\s\*```\/\) \|\| content\.match\(\/\(\{\[\\s\\S\]\*\?"cores"\[\\s\\S\]\*\?\}\)\/\);/g;
const replacement = `const jsonMatch = content.match(/\`\`\`json\\s*(\\{[\\s\\S]*?\\})\\s*\`\`\`/) || content.match(/(\\{[\\s\\S]*?\\})/);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
