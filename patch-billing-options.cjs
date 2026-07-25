const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetButtons = `<button
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, paymentType: "Projeto" })}
                        className={\`flex-1 text-xs py-1.5 rounded-lg transition-colors \${clientForm.paymentType === "Projeto" ? "bg-[#c5a880]/20 text-[#c5a880] font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                      >
                        Avulso (Projeto/Freelance)
                      </button>`;

const newButtons = `<button
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, paymentType: "Projeto" })}
                        className={\`flex-1 text-xs py-1.5 rounded-lg transition-colors \${clientForm.paymentType === "Projeto" ? "bg-[#c5a880]/20 text-[#c5a880] font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                      >
                        Projeto Avulso
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, paymentType: "Sob Demanda" })}
                        className={\`flex-1 text-xs py-1.5 rounded-lg transition-colors \${clientForm.paymentType === "Sob Demanda" ? "bg-[#c5a880]/20 text-[#c5a880] font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                      >
                        Por Entrega
                      </button>`;

code = code.replace(targetButtons, newButtons);

const targetLabel1 = `                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Mensalidade (R$)" : "Valor do Projeto (R$)"}
                      </label>`;

const newLabel1 = `                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Mensalidade (R$)" : clientForm.paymentType === "Projeto" ? "Valor do Projeto (R$)" : "Valor por Entrega (R$)"}
                      </label>`;

code = code.replace(targetLabel1, newLabel1);

const targetLabel2 = `                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Próximo Vencimento" : "Previsão / Vencimento"}
                      </label>`;

const newLabel2 = `                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        {(!clientForm.paymentType || clientForm.paymentType === "Mensal") ? "Próximo Vencimento" : clientForm.paymentType === "Projeto" ? "Previsão / Vencimento" : "Próxima Entrega"}
                      </label>`;

code = code.replace(targetLabel2, newLabel2);

const targetDesc = `description: \`\${(!c.paymentType || c.paymentType === "Mensal") ? "Mensalidade" : "Pagamento"} recebido: \${c.name}\`,`;

const newDesc = `description: \`\${(!c.paymentType || c.paymentType === "Mensal") ? "Mensalidade" : c.paymentType === "Projeto" ? "Pagamento de projeto" : "Pagamento por entrega"} recebido: \${c.name}\`,`;

code = code.replace(targetDesc, newDesc);

const targetReceive = `{(!c.paymentType || c.paymentType === "Mensal") ? "Receber Mensalidade" : "Receber Pagamento"}`;

const newReceive = `{(!c.paymentType || c.paymentType === "Mensal") ? "Receber Mensalidade" : c.paymentType === "Projeto" ? "Receber Pagamento" : "Receber Pagamento (Entrega)"}`;

code = code.replace(targetReceive, newReceive);

const targetLogic = `      if (client.paymentType === "Projeto") {`;

const newLogic = `      if (client.paymentType === "Projeto" || client.paymentType === "Sob Demanda") {`;

code = code.replace(targetLogic, newLogic);

fs.writeFileSync('src/App.tsx', code);
console.log('Done!');
