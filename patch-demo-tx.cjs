const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{
        id: 2,
        description: "Assinatura Canva Pro",`;

const newCode = `{
        id: 9999,
        description: "Edição de Vídeo (Felipe Maker)",
        type: "despesa",
        amount: 250,
        date: "2026-07-25",
        category: "Freelancers",
        status: "pendente",
        client: "Tech Solutions",
      },
      {
        id: 2,
        description: "Assinatura Canva Pro",`;

code = code.replace(target, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Demo transaction patched');
