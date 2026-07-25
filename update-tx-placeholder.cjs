const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    placeholder="Ex: Pagamento Dr. Silva"`;

const newCode = `className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    placeholder={transactionForm.type === "despesa" ? (transactionForm.category === "Freelancers" ? "Ex: Cachê Fotógrafo João - Vídeo 01" : "Ex: Tráfego Google Ads") : "Ex: Pagamento Dr. Silva"}`;

code = code.replace(target, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Placeholder updated');
