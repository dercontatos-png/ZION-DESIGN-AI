const fs = require('fs');
let code = fs.readFileSync('src/types/designBuilder.ts', 'utf-8');

const oldStr = `export interface CoresConfig {
  ambiente: string;
  recorte: string;
  complementar: string;
}`;

const newStr = `export interface CoresConfig {
  paleta: string[];
}`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/types/designBuilder.ts', code);
