const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /"promptTipografia": "Texto\.\.\.",/;
const replacement = `"promptTipografia": "Instruções espaciais (top center, bottom right, etc)...",`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
