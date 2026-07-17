const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace("let filledItems: string[] = [];", "let filledItems: string[] = [];\n    let logCount = 0;\n    let newLogos: string[] = [];\n    let updates: any = {};");

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
