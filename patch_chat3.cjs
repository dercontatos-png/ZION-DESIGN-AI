const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /7\. ATENÇÃO \(EDições PARCIAIS\): Se o usuário estiver fazendo APENAS um AJUSTE em algo que já gerou \(ex: "mude a cor para azul" ou "mude o título para Festa"\), você DEVE retornar no JSON APENAS as chaves que ele pediu para alterar\. NÃO inclua as outras chaves para não sobrescrever a configuração existente\. \(Ex: não reenvie "camadasTexto" se ele pediu apenas para mudar a cor; apenas retorne a chave de cor\)\./;
const replacement = `7. ATENÇÃO (EDIÇÕES PARCIAIS): Se o usuário estiver fazendo APENAS um AJUSTE em algo que já gerou (ex: "mude a cor para azul" ou "mude o título para Festa"), você DEVE retornar no JSON APENAS as chaves que ele pediu para alterar. NÃO inclua as outras chaves para não sobrescrever a configuração existente. (Ex: não reenvie "camadasTexto" se ele pediu apenas para mudar a cor; apenas retorne a chave de cor).
8. MANTENHA SIMPLES: Não gere descrições gigantes em "promptCenario", "estiloVisualCustom", "additionalPrompt" ou outros campos de texto. Seja extremamente DIRETO e CONCISO. Textos muito longos confundem o gerador de imagens e geram alucinações. Foque no que importa.
9. DADOS DA REFERÊNCIA: Se na imagem de referência houver logos de outras marcas, textos antigos, ou perfis de instagram, NÃO inclua isso na geração! Remova essas informações e use APENAS as informações enviadas pelo cliente.`;
code = code.replace(regex, replacement);

const regex2 = /"promptCenario": "Cenário\.\.\.",\n\s*"promptTipografia": "Texto\.\.\.",/;
const replacement2 = `"promptCenario": "Cenário (opcional e muito curto)",`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
