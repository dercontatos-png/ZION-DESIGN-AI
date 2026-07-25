const fs = require('fs');
let code = fs.readFileSync('src/components/ClientPortal.tsx', 'utf8');

code = code.replace(
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Mensalidade Atual:" : "Valor do Projeto:"}',
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Mensalidade Atual:" : currentClient.paymentType === "Projeto" ? "Valor do Projeto:" : "Valor por Entrega:"}'
);

code = code.replace(
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Histórico de Mensalidades" : "Histórico de Pagamentos"}',
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Histórico de Mensalidades" : "Histórico de Pagamentos"}'
);

code = code.replace(
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Vencimento" : "Previsão"}',
  '{(!currentClient.paymentType || currentClient.paymentType === "Mensal") ? "Vencimento" : currentClient.paymentType === "Projeto" ? "Previsão" : "Próxima Entrega"}'
);

fs.writeFileSync('src/components/ClientPortal.tsx', code);
console.log('Portal patched');
