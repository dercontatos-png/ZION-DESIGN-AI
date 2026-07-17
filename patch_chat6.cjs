const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

// Move newLogos and logCount to the top
code = code.replace(/let filledItems: string\[\] = \[\];/, `let filledItems: string[] = [];
    let logCount = 0;
    let newLogos: string[] = [];
    let updates: any = {};`);

// Remove them from where they were
code = code.replace(/let logCount = 0;\n/, '');
code = code.replace(/let newLogos: string\[\] = \[\];\n/, '');
code = code.replace(/const updates: any = \{\};\n/, '');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
