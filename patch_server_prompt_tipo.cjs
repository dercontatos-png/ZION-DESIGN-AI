const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /"promptTipografia": "descrição curta do que extrair da tipografia\/texto do card de referência \(ex: Copy the bold modern headlines and centered CTA button\)",/;
const replacement = `"promptTipografia": "INSTRUÇÕES CRÍTICAS DE POSICIONAMENTO ESPACIAL (em inglês): Descreva o local EXATO onde cada texto e a logo devem ficar na arte final (ex: 'The logo MUST be positioned at the top center. The main headline MUST be centered in the middle. The Instagram handle MUST be at the very bottom right.'). Seja preciso nas direções para evitar alucinações espaciais.",`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
