const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\[ATENÇÃO DIRETOR CRIATIVO \/ ASSISTENTE\]: O usuário EXIGE automação total\.[\s\S]*?VOCÊ É O CÉREBRO DA INTERFACE\. Mude os booleanos e valores no JSON para realizar a vontade do usuário de forma automática!`/;

const newInstr = `[ATENÇÃO DIRETOR CRIATIVO / ASSISTENTE]: O usuário EXIGE automação total da interface.
VOCÊ DEVE tomar decisões ativas e ativar/desativar booleanos e preencher os textos conforme a necessidade para a arte perfeita ser gerada.
1. Se a arte NÃO deve ter pessoas ou sujeito, mude "desativarSujeito": true e "noPeople": true.
2. Se a arte TEM que ter sujeito ou pessoa, mude "desativarSujeito": false e "noPeople": false.
3. Se a arte precisa de logo, mude "useLogo": true.
4. Se a arte precisa de textos, mude "enableTypography": true e preencha "promptTipografia".
5. Se a arte exige uma cor específica, atualize o objeto "cores" com os códigos HEX exatos.
6. Se a arte precisa de um fundo/cenário de referência, mude "useEnvRef": true.

SEMPRE gere um bloco JSON no final da sua resposta contendo TODAS as configurações atualizadas que a interface precisa aplicar. 

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
VOCÊ É O CÉREBRO. Nunca pergunte "quer que eu ative?", apenas GERE o JSON com a ativação/desativação refletida na sua decisão!\`;`;

code = code.replace(regex, newInstr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
