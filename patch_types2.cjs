const fs = require('fs');
let code = fs.readFileSync('src/types/designBuilder.ts', 'utf-8');

code = code.replace(/export interface CoresConfig \{[\s\S]*?\}/, `export interface CoresConfig {
  ambiente: string;
  recorte: string;
  complementar: string;
  paleta?: string[];
}`);

fs.writeFileSync('src/types/designBuilder.ts', code);
