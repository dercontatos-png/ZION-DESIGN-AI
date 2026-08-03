const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'Receber Mensalidade\n                            </button>',
  '{(!c.paymentType || c.paymentType === "Mensal") ? "Receber Mensalidade" : "Receber Pagamento"}\n                            </button>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App receber updated');
