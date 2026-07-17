const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\[ATENÇÃO DIRETOR CRIATIVO \/ ASSISTENTE\]: O usuário quer que você automatize as configurações de design\.[\s\S]*?Mapeie todas as intenções do usuário \(como "sem sujeito", "foco apenas no fundo", "mude a cor", etc\.\) para esse JSON!`/;

// Because it's within a template literal, we must escape the backticks or just use \`\`\`
const replacement = `[ATENÇÃO DIRETOR CRIATIVO / ASSISTENTE]: O usuário quer que você automatize as configurações de design. SEMPRE que você responder sugerindo um estilo, cores, ativando ou desativando opções (ex: sujeito, logo, texto, etc.), você DEVE OBRIGATORIAMENTE gerar um bloco JSON no final da sua resposta contendo TODAS as configurações atualizadas. 

Exemplo de formato obrigatório no final da resposta:
\\\`\\\`\\\`json
{
  "desativarSujeito": true,
  "noPeople": true,
  "enableTypography": false,
  "estiloVisualCustom": "Estilo cyberpunk agressivo com neon",
  "cores": {
    "ambiente": "#000000",
    "recorte": "#FF0055",
    "complementar": "#00FFFF"
  },
  "promptCenario": "Fundo noturno escuro com luzes de neon",
  "promptTipografia": "Fonte sem serifa pesada em branco",
  "promptDesign": "Alinhamento lateral esquerdo, grandes margens"
}
\\\`\\\`\\\`
Mapeie todas as intenções do usuário (como "sem sujeito", "foco apenas no fundo", "mude a cor", etc.) para esse JSON!\`;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
