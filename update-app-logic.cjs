const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `      // Find paid receita in the current month/year for this client
      const hasPaidThisMonth = transactions.some((t) => {
        if (t.client !== client.name) return false;
        if (t.type !== "receita") return false;
        if (t.status !== "pago") return false;
        if (!t.date || typeof t.date !== "string") return false;
        const parts = t.date.split("-");
        if (parts.length < 3) return false;
        const tYear = Number(parts[0]);
        const tMonth = Number(parts[1]);
        return tYear === currentYear && tMonth === currentMonth;
      });

      let calculatedStatus: "Em dia" | "Atrasado" | "Pendente" = "Pendente";
      if (hasPaidThisMonth) {
        calculatedStatus = "Em dia";`;

const newLogic = `      // Find paid receita for this client
      let hasPaid = false;
      if (client.paymentType === "Projeto") {
        hasPaid = transactions.some((t) => {
          if (t.client !== client.name) return false;
          if (t.type !== "receita") return false;
          if (t.status !== "pago") return false;
          if (!t.date || typeof t.date !== "string") return false;
          // Se tiver data de inicio, o pagamento tem que ser no inicio ou depois
          if (client.startDate && t.date < client.startDate) return false;
          // Tambem podemos ver se tem data de vencimento
          if (client.dueDate && t.date < client.startDate) return false; // optional
          return true;
        });
      } else {
        hasPaid = transactions.some((t) => {
          if (t.client !== client.name) return false;
          if (t.type !== "receita") return false;
          if (t.status !== "pago") return false;
          if (!t.date || typeof t.date !== "string") return false;
          const parts = t.date.split("-");
          if (parts.length < 3) return false;
          const tYear = Number(parts[0]);
          const tMonth = Number(parts[1]);
          return tYear === currentYear && tMonth === currentMonth;
        });
      }

      let calculatedStatus: "Em dia" | "Atrasado" | "Pendente" = "Pendente";
      if (hasPaid) {
        calculatedStatus = "Em dia";`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code);
console.log('Logic updated');
