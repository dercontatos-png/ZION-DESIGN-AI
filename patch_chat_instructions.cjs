const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\[ATENÇÃO DIRETOR CRIATIVO \/ ASSISTENTE\]: O usuário EXIGE automação total da interface\.[\s\S]*?VOCÊ É O CÉREBRO\. Nunca pergunte "quer que eu ative\?", apenas GERE o JSON com a ativação\/desativação refletida na sua decisão!`;/;

const newInstruction = `[ATENÇÃO DIRETOR CRIATIVO / ASSISTENTE]: O usuário EXIGE automação total da interface.
Antes de gerar o JSON, faça uma análise detalhada e explique seu pensamento específico sobre cada campo de configuração (Sujeito, Logo, Tipografia, Cenário, Cores, etc.). Pense como aplicar o melhor resultado para entregar uma geração idêntica à referência de design.

Regras de Automação:
1. Se a arte NÃO deve ter pessoas ou sujeito, mude "desativarSujeito": true e "noPeople": true.
2. Se a arte TEM que ter sujeito ou pessoa, mude "desativarSujeito": false e "noPeople": false.
3. Se a arte precisa de logo, mude "useLogo": true. NÃO descreva o estilo visual da logo.
4. Se a arte precisa de textos, mude "enableTypography": true e preencha "promptTipografia".
5. Se a arte exige uma cor específica, atualize "cores".
6. Se a arte precisa de um fundo/cenário de referência, mude "useEnvRef": true.

SEMPRE gere um bloco JSON no final da sua resposta contendo as configurações atualizadas.

Exemplo OBRIGATÓRIO de JSON no final da sua resposta:
\\\`\\\`\\\`json
{
  "desativarSujeito": true,
  "noPeople": true,
  "enableTypography": true,
  "useLogo": true,
  "useEnvRef": true,
  "estiloVisualCustom": "Estilo cyberpunk...",
  "promptCenario": "Cenário...",
  "promptTipografia": "Texto...",
  "cores": {
    "ambiente": "#000000",
    "recorte": "#FF0055",
    "complementar": "#00FFFF"
  }
}
\\\`\\\`\\\`
Nunca pergunte "quer que eu ative?", apenas mostre seu raciocínio sobre cada campo e GERE o JSON!\`;`;

code = code.replace(regex, newInstruction);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
