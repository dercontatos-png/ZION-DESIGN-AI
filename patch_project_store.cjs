const fs = require('fs');
let code = fs.readFileSync('src/store/useProjectStore.ts', 'utf-8');

const targetStr = `  cores: {
    ambiente: "#000000",
    recorte: "#bbfb33",
    complementar: "#827df6"
  },`;

const newStr = `  cores: {
    paleta: ["#000000", "#bbfb33", "#827df6"]
  },`;

if (code.includes(targetStr)) {
  code = code.split(targetStr).join(newStr);
  fs.writeFileSync('src/store/useProjectStore.ts', code);
  console.log("Success");
} else {
  console.log("Not found");
}
