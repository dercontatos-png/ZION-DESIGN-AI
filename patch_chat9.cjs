const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(/const updates: any = \{\};/, 'updates = {};');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
