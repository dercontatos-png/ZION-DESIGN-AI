const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /6\. Posicionamento de Logos: Identifique o melhor lugar para colocar logos sem fugir da diagramação e organização da arte\. Mantenha os espaçamentos corretos nas laterais\./;
const replacement = `6. POSICIONAMENTO ESPACIAL (CRÍTICO): Se houver uma imagem de referência, você DEVE extrair as coordenadas lógicas de cada elemento (ex: Instagram no canto inferior direito, Título principal centralizado no topo). No "promptTipografia", VOCÊ DEVE INSTRUIR A IA sobre ONDE COLOCAR CADA TEXTO e LOGO, caso contrário ela irá espalhar as informações e alucinar.`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
