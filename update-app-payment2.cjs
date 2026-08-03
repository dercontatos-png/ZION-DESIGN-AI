const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a880] font-mono">
                    2. Valores & Faturamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        Mensalidade (R$)
                      </label>`;
                      
const replacement = `                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a880] font-mono">
                    2. Valores & Faturamento
                  </h3>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Tipo de Faturamento</label>
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, paymentType: "Mensal" })}
                        className={\`flex-1 text-xs py-1.5 rounded-lg transition-colors \${(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "bg-[#c5a880]/20 text-[#c5a880] font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                      >
                        Recorrente (Mensal)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, paymentType: "Projeto" })}
                        className={\`flex-1 text-xs py-1.5 rounded-lg transition-colors \${clientForm.paymentType === "Projeto" ? "bg-[#c5a880]/20 text-[#c5a880] font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                      >
                        Avulso (Projeto/Freelance)
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Mensalidade (R$)" : "Valor do Projeto (R$)"}
                      </label>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App updated via literal match');
} else {
  // Let's use regex
  const regex = /<h3[^>]*>\s*2\. Valores & Faturamento\s*<\/h3>\s*<div[^>]*>\s*<div[^>]*>\s*<label[^>]*>\s*Mensalidade \(R\$\)\s*<\/label>/;
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log('App updated via regex');
  } else {
    console.log('Not found');
  }
}
