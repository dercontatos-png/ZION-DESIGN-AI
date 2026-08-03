const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">\n                          Mensalidade\n                        </th>',
  '<th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">\n                          Valor / Mensalidade\n                        </th>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App table col updated');
