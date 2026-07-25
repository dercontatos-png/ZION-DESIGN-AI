const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(
  /"dimensao": "1:1", \/\/ OBRIGATÓRIO: Se for LOGO, use SEMPRE "1:1"\. Outros formatos: "9:16", "16:9", "4:5"/g,
  '"dimensao": "1:1", // ou "9:16", "16:9", "4:5"'
);
fs.writeFileSync('server.ts', content);
