const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const regex = /applyModelMessageToEditor\(idx, msg\.content\)/g;
code = code.replace(regex, 'applyModelMessageToEditor(index, msg.content)');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
