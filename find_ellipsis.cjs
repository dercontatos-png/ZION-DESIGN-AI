const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ref_main.html'), 'utf8');

const regexes = [
  /lucide-ellipsis/gi,
  /lucide-more/gi,
  /circle cx="12" cy="12" r="1"/gi
];

regexes.forEach(re => {
  let match;
  while ((match = re.exec(html)) !== null) {
    const start = Math.max(0, match.index - 120);
    const end = Math.min(html.length, match.index + 200);
    console.log('--- MATCH ---');
    console.log(html.slice(start, end));
  }
});

