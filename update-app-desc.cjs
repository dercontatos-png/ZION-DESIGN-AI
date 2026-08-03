const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'description: \`Mensalidade recebida: ${c.name}\`,',
  'description: \`${(!c.paymentType || c.paymentType === "Mensal") ? "Mensalidade" : "Pagamento"} recebido: ${c.name}\`,'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App desc updated');
