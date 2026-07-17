const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /MUITO IMPORTANTE: No final da sua resposta, você DEVE SEMPRE incluir um bloco \\\`\\\`\\\`json \{ \.\.\. \} \\\`\\\`\\\` contendo os parâmetros atualizados da interface[\s\S]*?O usuário EXIGE que você faça o preenchimento automático de TUDO que vocês conversarem!`/;

const newInstr = `MUITO IMPORTANTE: O usuário EXIGE que você automatize a interface. No final da sua resposta, você DEVE SEMPRE incluir um bloco \\\`\\\`\\\`json { ... } \\\`\\\`\\\` contendo TODOS os parâmetros. 
Se a arte não tiver pessoas, retorne "desativarSujeito": true e "noPeople": true. Se tiver, retorne "desativarSujeito": false. 
Você deve usar a inteligência para preencher "cores", "promptCenario", "estiloVisualCustom", "useLogo", "enableTypography", etc. GERE O JSON PARA APLICAR AS ALTERAÇÕES NA INTERFACE!\`;`;

code = code.replace(regex, newInstr);
fs.writeFileSync('server.ts', code);
