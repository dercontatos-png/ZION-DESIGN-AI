const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

code = code.replace(/const data = await resp\.json\(\);/g, `
          let data;
          try {
            data = await resp.json();
          } catch(e) {
            throw new Error(resp.status === 504 ? "Timeout na Vercel (Limite de 10-60s atingido)" : "O servidor retornou um erro fatal (HTTP " + resp.status + "). Verifique os logs da Vercel.");
          }`);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
