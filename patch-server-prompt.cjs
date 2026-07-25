const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'A IA deve obedecer estritamente ao usuário e garantir uma transição limpa, sem misturar dados do pedido antigo com o novo!',
  'A IA deve obedecer estritamente ao usuário e garantir uma transição limpa, sem misturar dados do pedido antigo com o novo!\n\nAJUSTES ESPECÍFICOS (OBEDIÊNCIA ESTRITA):\nSe o usuário pedir para alterar, remover ou corrigir apenas UM detalhe ou algo específico (ex: "remova a logo", "mude a cor para vermelho", "apague os textos", "tira o desfoque"), você DEVE enviar o JSON contendo APENAS a chave correspondente alterada e JAMAIS enviar "substituirConfig": true. Você deve ser estritamente obediente: se o usuário mandar remover algo, DESATIVE a chave correspondente no JSON imediatamente (ex: "useLogo": false, "enableTypography": false, "camadasTexto": [], "enableBlur": false, "desativarSujeito": true) para que o painel seja atualizado cirurgicamente apenas no que foi pedido.'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server AI prompt.");
