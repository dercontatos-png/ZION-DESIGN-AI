const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');
code = code.replace(
  'import {',
  'import {\n  ImageIcon,'
);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
