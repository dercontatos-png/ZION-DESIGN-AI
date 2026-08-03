const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'placeholder="Ex: Mensalidade Dr. Silva"',
  'placeholder="Ex: Pagamento Dr. Silva"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App placeholder updated');
