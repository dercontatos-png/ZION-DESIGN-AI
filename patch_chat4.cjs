const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /9\. DADOS DA REFERÊNCIA: Se na imagem de referência houver logos de outras marcas, textos antigos, ou perfis de instagram, NÃO inclua isso na geração! Remova essas informações e use APENAS as informações enviadas pelo cliente\./;
const replacement = `9. DADOS DA REFERÊNCIA: Se na imagem de referência houver logos de outras marcas, textos antigos, ou perfis de instagram, NÃO inclua isso na geração! Remova essas informações e use APENAS as informações enviadas pelo cliente.
10. POSICIONAMENTO EXATO: Instrua claramente na descrição o lugar EXATO onde deve ficar a logo, ícones, textos e efeitos (ex: "logo posicionada no topo ao centro", "texto centralizado na parte inferior"). Isso ajuda a IA a não espalhar as coisas aleatoriamente.`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
