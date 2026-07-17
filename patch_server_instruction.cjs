const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const anchor = `"mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo" }, 
  "descricoesEstilo": { "nome_do_arquivo.png": "Descrição O QUE COPIAR (Textura, luz, vibe, etc) dessa referência" },`;

const replacement = `"mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo", "layout.jpg": "design", "estilo.jpg": "style" }, // IMPORTANTE: Classifique como "subject", "logo", "scene", "design" (para OBRIGAR a copiar o layout 1:1) ou "style" (para usar só estética).
  "descricoesEstilo": { "estilo.jpg": "Descrição O QUE COPIAR (Textura, luz, vibe, etc) dessa referência (Obrigatório preencher se o arquivo for 'style')" },`;

code = code.replace(anchor, replacement);
fs.writeFileSync('server.ts', code);
console.log("Server instructions patched!");
