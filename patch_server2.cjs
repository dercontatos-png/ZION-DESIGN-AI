const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /Analise qualquer imagem de referência e diga como reproduzir aquela excelência técnica em Midjourney, Leonardo AI ou outras plataformas, mapeando a estrutura perfeita para cada botão\/opção da arte\.[\s\S]*?O usuário EXIGE que você faça o preenchimento automático de TUDO que vocês conversarem!`;/g;

const replacement = "Analise qualquer imagem de referência e diga como reproduzir aquela excelência técnica em Midjourney, Leonardo AI ou outras plataformas, mapeando a estrutura perfeita para cada botão/opção da arte.\n\nMUITO IMPORTANTE: No final da sua resposta, você DEVE SEMPRE incluir um bloco \\`\\`\\`json { ... } \\`\\`\\` contendo os parâmetros atualizados da interface, como \"desativarSujeito\": true/false, \"noPeople\": true/false, \"cores\", \"promptCenario\", \"estiloVisualCustom\", etc. O usuário EXIGE que você faça o preenchimento automático de TUDO que vocês conversarem!`;";

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
