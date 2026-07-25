const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /5\. Se a arte exige uma cor específica, atualize "cores"\./;
const replacement = `5. Se a arte exige uma cor específica, atualize "cores" e defina "coresAutomaticas": false. Se a arte NÃO exige uma cor específica (ex: deve copiar as cores da referência), você DEVE definir "coresAutomaticas": true e omitir o objeto "cores".`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
