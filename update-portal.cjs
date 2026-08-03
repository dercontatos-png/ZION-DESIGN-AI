const fs = require('fs');
let code = fs.readFileSync('src/components/ClientPortal.tsx', 'utf8');

code = code.replace(
  '<p className="text-xs text-zinc-400 mt-1">Veja seu histórico de mensalidades, contratos e faturas pendentes da agência.</p>',
  '<p className="text-xs text-zinc-400 mt-1">Veja seu histórico de pagamentos, contratos e faturas pendentes da agência.</p>'
);

code = code.replace(
  '<span className="text-xs text-zinc-500 font-semibold">Mensalidade Atual:</span>',
  '<span className="text-xs text-zinc-500 font-semibold">{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Mensalidade Atual:" : "Valor do Projeto:"}</span>'
);

code = code.replace(
  '<span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Histórico de Mensalidades</span>',
  '<span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Histórico de Mensalidades" : "Histórico de Pagamentos"}</span>'
);

code = code.replace(
  '<span className="text-[10px] text-zinc-500 font-semibold uppercase">Vencimento: {currentClient.dueDate ? `Dia ${formatClientDueDate(currentClient.dueDate)}` : "-"}</span>',
  '<span className="text-[10px] text-zinc-500 font-semibold uppercase">{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Vencimento" : "Previsão"}: {currentClient.dueDate ? `Dia ${formatClientDueDate(currentClient.dueDate)}` : "-"}</span>'
);

fs.writeFileSync('src/components/ClientPortal.tsx', code);
console.log('ClientPortal updated');
