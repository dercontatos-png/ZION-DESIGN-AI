const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('  Trash2,\n  Upload,', '  Trash2,\n  Edit2,\n  Upload,');
fs.writeFileSync('src/App.tsx', code);
console.log('Edit2 imported');
