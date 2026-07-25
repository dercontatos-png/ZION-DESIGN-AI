const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /Regras de Automação:\n1\. Se a arte/g;

const replacement = `Regras de Automação:
- Se uma das imagens for CLARAMENTE um Logotipo de uma marca (fundo transparente, símbolo, escrita): ative "useLogo": true. NÃO descreva estilo visual para a logo, NÃO adicione como referência de cenário ou estilo. O gerador irá estampar a logo como ela é.
1. Se a arte`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
