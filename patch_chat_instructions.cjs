const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /"additionalPrompt": "prompt geral principal em inglês\. OBRIGATÓRIO: Crie um MEGA PROMPT estilo Midjourney v6\./g,
  '"additionalPrompt": "prompt geral principal em inglês. SEMPRE reescreva/inclua este campo atualizado se o usuário pedir qualquer alteração visual. OBRIGATÓRIO: Crie um MEGA PROMPT estilo Midjourney v6.'
);

fs.writeFileSync('server.ts', code);
