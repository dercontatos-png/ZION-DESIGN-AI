const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const anchor = `REGRAS CRÍTICAS DE SAÍDA (AUTO-FILL):
Sempre que você gerar uma sugestão de configuração, copys, prompt ou extração de estilo, você DEVE incluir OBRIGATORIAMENTE no final da sua resposta um bloco de código JSON para preenchimento automático.`;

const replaceWith = `AUTONOMIA TOTAL E INTELIGÊNCIA DE DESIGN (AUTO-FILL):
Você tem AUTONOMIA ABSOLUTA para tomar decisões de design. Se o usuário enviar uma ou mais fotos de pessoas, ATIVE o sujeito (desativarSujeito=false), identifique o gênero (gender="Masculino"/"Feminino") e descreva a pose (poseDescription). Se enviar uma foto que parece um logo, ATIVE o logo (useLogo=true) e faça o mapeamento. Se não houver pessoa, ative "noPeople=true" e "desativarSujeito=true".
Você DEVE habilitar, desabilitar e configurar TODOS OS EFEITOS (degradeLeitura, enableTypography, coresAutomaticas, blur, floatingElementsMode) de acordo com o que você achar melhor para gerar a arte MAIS ABSURDA E PROFISSIONAL possível. Tenha pensamento próprio, confie no seu instinto de Diretor de Arte. 
Na referência de estilo, extraia exatamente o que o usuário quer copiar (iluminação, texturas, vibe) em "descricoesEstilo".

REGRAS CRÍTICAS DE SAÍDA (AUTO-FILL):
Sempre que você gerar uma sugestão de configuração, copys, prompt ou extração de estilo, você DEVE incluir OBRIGATORIAMENTE no final da sua resposta um bloco de código JSON para preenchimento automático.`;

code = code.replace(anchor, replaceWith);
fs.writeFileSync('server.ts', code);
console.log("Server autonomy patched!");
