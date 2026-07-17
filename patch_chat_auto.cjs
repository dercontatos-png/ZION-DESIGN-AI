const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /\[ATENÇÃO DIRETOR CRIATIVO \/ ASSISTENTE\]: O usuário quer que você automatize as configurações de design\. SEMPRE que você responder sugerindo um estilo, cores, ativando ou desativando opções \(ex: sujeito, logo, texto, etc\.\), você DEVE OBRIGATORIAMENTE gerar um bloco JSON no final da sua resposta contendo TODAS as configurações atualizadas\.[\s\S]*?Mapeie todas as intenções do usuário \(como "sem sujeito", "foco apenas no fundo", "mude a cor", etc\.\) para esse JSON!`/;

const newInstr = `[ATENÇÃO DIRETOR CRIATIVO / ASSISTENTE]: O usuário EXIGE automação total. Se ele enviar uma arte de referência, presuma que ele quer extrair TUDO dela (layout, cores, textos, sujeito), a menos que ele diga o contrário. 
VOCÊ DEVE tomar decisões e ativar/desativar booleanos conforme a necessidade para a arte funcionar.
- Ex: Se a arte não deve ter pessoas, mude "desativarSujeito": true e "noPeople": true.
- Ex: Se a arte precisa de logo, mude "useLogo": true.
- Ex: Se a arte precisa de textos, mude "enableTypography": true.
- Ex: Se o usuário passou cores, atualize o objeto "cores".

SEMPRE gere um bloco JSON no final da sua resposta contendo TODAS as configurações atualizadas que a interface precisa aplicar.

Exemplo de formato obrigatório no final da resposta:
\\\`\\\`\\\`json
{
  "desativarSujeito": true,
  "noPeople": true,
  "enableTypography": true,
  "useLogo": true,
  "useEnvRef": true,
  "estiloVisualCustom": "Estilo cyberpunk...",
  "cores": {
    "ambiente": "#000000",
    "recorte": "#FF0055",
    "complementar": "#00FFFF"
  }
}
\\\`\\\`\\\`
VOCÊ É O CÉREBRO DA INTERFACE. Mude os booleanos e valores no JSON para realizar a vontade do usuário de forma automática!\`;`;

code = code.replace(regex, newInstr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
