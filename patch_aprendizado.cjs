const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldStr = `  "camadasTexto": [
    { "funcao": "Headline Principal", "conteudo": "SEU TITULO", "fonte": "Outfit", "cor": "#ffffff" },
    { "funcao": "Subheadline Secundário", "conteudo": "SEU SUBTITULO", "fonte": "Outfit", "cor": "#ffffff" }
  ]
}\`\`\``;

const newStr = `  "aprendizado_cliente": "Informação útil que aprendi sobre este cliente nesta conversa e que deve ser lembrada nas próximas. Deixe vazio se não houver nada de novo.",
  "camadasTexto": [
    { "funcao": "Headline Principal", "conteudo": "SEU TITULO", "fonte": "Outfit", "cor": "#ffffff" },
    { "funcao": "Subheadline Secundário", "conteudo": "SEU SUBTITULO", "fonte": "Outfit", "cor": "#ffffff" }
  ]
}\`\`\``;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('server.ts', code);
