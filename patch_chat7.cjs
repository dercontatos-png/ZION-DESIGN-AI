const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(/\s*let logCount = 0;\n/, '\n');
code = code.replace(/\s*let newLogos: string\[\] = \[\];\n/, '\n');
code = code.replace(/\s*const updates: any = \{\};\n/, '\n');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
