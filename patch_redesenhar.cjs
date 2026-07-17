const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(
  "A IA utilizará a imagem enviada para redesenhar/estampar a logo diretamente na imagem em alta definição. O tamanho e posicionamento são guiados pela inteligência criativa.",
  "A IA irá extrair e incorporar a logo original enviada diretamente na arte final. A estrutura, fonte e formato serão preservados exatamente como na imagem fornecida (apenas a cor poderá ser adaptada pela IA para garantir contraste, como mudar para branco ou preto)."
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
