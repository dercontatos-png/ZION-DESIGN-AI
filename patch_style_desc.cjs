const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldStr = `"mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo" }, // IMPORTANTE: O nome do arquivo DEVE ser EXATAMENTE igual ao que o usuário enviou (veja na tag [Imagem Anexada: NOME]). Classifique como "subject", "logo", "scene" ou "style".`;

const newStr = `"mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo" }, // IMPORTANTE: O nome do arquivo DEVE ser EXATAMENTE igual ao que o usuário enviou (veja na tag [Imagem Anexada: NOME]). Classifique como "subject", "logo", "scene" ou "style".
  "descricoesEstilo": { "nome_do_arquivo.png": "Descrição detalhada do estilo e paleta de cores dessa referência" }, // Se uma imagem for classificada como "style", forneça a descrição dela aqui.`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('server.ts', code);
