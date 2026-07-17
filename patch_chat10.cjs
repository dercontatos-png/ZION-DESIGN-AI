const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(/let updates: any = \{\};\s*let updates: any = \{\};/, 'let updates: any = {};');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
