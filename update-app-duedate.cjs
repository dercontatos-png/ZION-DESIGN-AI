const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">\n                        Próximo Vencimento\n                      </label>',
  '                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">\n                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Próximo Vencimento" : "Previsão / Vencimento"}\n                      </label>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App dueDate updated');
