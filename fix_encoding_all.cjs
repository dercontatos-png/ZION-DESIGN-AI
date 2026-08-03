const fs = require('fs');
const glob = require('glob');

const replacements = {
  "Ã£": "ã",
  "Ãª": "ê",
  "Ã¡": "á",
  "Ã§": "ç",
  "Ãµ": "õ",
  "Ã­": "í",
  "Ã©": "é",
  "Ã³": "ó",
  "Ãº": "ú",
  "Ã¢": "â",
  "Ã´": "ô",
  "Ã€": "À",
  "Ã ": "à",
  "Ã\u00A0": "à",
  "Ã\u0081": "Á",
  "Ã\u0089": "É",
  "Ã\u008D": "Í",
  "Ã\u0093": "Ó",
  "Ã\u009A": "Ú",
  "Ã\u0087": "Ç",
  "Ã\u0083": "Ã",
  "Ã\u008A": "Ê",
  "Ã\u0082": "Â",
  "Ã\u0094": "Ô",
  "Ã\u0095": "Õ",
  "Ãš": "Ú",
  "ÃŒ": "Ì",
  "Ãš": "Ú",
  "Ã›": "Û",
  "Ãš": "Ú",
  "Ã–": "Ö",
  "Ã¤": "ä",
  "Ã¼": "ü",
  "Ã¶": "ö",
};

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

for (const [bad, good] of Object.entries(replacements)) {
  content = content.replaceAll(bad, good);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed encoding in " + file);
