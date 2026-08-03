const fs = require('fs');
for (const file of ['src/components/CopilotoAgencia.tsx', 'src/components/ChatAssistente.tsx', 'src/components/GeradorRoteiros.tsx']) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const errJson = await res\.json\(\)\.catch\(\(\) => \({}\)\);\s*throw new Error\(errJson\.error \|\| "Erro ao se comunicar com o servidor\. Status: " \+ res\.status \+ " Text: " \+ await res\.text\(\)\.catch\(\(\)=>""\)\);/g, `
        const errText = await res.text().catch(() => "");
        let errJson = {};
        try { errJson = JSON.parse(errText); } catch(e) {}
        throw new Error(errJson.error || "Erro ao se comunicar com o servidor. Status: " + res.status + " Text: " + errText);
  `);
  code = code.replace(/const d = await res\.json\(\)\.catch\(\(\) => \({}\)\);\s*throw new Error\(d\.error \|\| "Erro no servidor\."\);/g, `
        const errText = await res.text().catch(() => "");
        let errJson = {};
        try { errJson = JSON.parse(errText); } catch(e) {}
        throw new Error(errJson.error || "Erro no servidor. Status: " + res.status + " Text: " + errText);
  `);
  fs.writeFileSync(file, code);
}
