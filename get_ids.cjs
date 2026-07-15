const fs = require('fs');
const content = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');
const matches = content.match(/id:\s*"([^"]+)"/g);
console.log(matches.map(m => m.split('"')[1]).join(', '));
