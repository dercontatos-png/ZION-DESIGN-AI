const fs = require('fs');
for (const file of ['src/components/CopilotoAgencia.tsx', 'src/components/ChatAssistente.tsx', 'src/components/GeradorRoteiros.tsx']) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/let errJson = \{\};/g, 'let errJson: any = {};');
  fs.writeFileSync(file, code);
}
