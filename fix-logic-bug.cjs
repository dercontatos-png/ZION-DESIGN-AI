const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '// Tambem podemos ver se tem data de vencimento\n          if (client.dueDate && t.date < client.startDate) return false; // optional',
  ''
);

fs.writeFileSync('src/App.tsx', code);
