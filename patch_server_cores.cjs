const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetStr = `  "cores": { "ambiente": "#hex", "recorte": "#hex", "complementar": "#hex" },`;
const newStr = `  "cores": { "paleta": ["#hex1", "#hex2", "#hex3"] }, // Pode ter quantas cores quiser na paleta`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('server.ts', code);
  console.log("Success");
} else {
  console.log("Not found");
}
