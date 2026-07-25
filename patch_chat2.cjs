const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /6\. Se a arte precisa de um fundo\/cenário de referência, mude "useEnvRef": true\./;
const replacement = `6. Se a arte precisa de um fundo/cenário de referência, mude "useEnvRef": true.
7. ATENÇÃO (EDições PARCIAIS): Se o usuário estiver fazendo APENAS um AJUSTE em algo que já gerou (ex: "mude a cor para azul" ou "mude o título para Festa"), você DEVE retornar no JSON APENAS as chaves que ele pediu para alterar. NÃO inclua as outras chaves para não sobrescrever a configuração existente. (Ex: não reenvie "camadasTexto" se ele pediu apenas para mudar a cor; apenas retorne a chave de cor).`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
