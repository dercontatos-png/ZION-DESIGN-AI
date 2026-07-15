const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

code = code.replace(/name: form\.name\.value,/g, 'name: (form.elements.namedItem("name") as HTMLInputElement).value,');
code = code.replace(/niche: form\.niche\.value,/g, 'niche: (form.elements.namedItem("niche") as HTMLInputElement).value,');
code = code.replace(/infoExtra: form\.infoExtra\.value,/g, 'infoExtra: (form.elements.namedItem("infoExtra") as HTMLTextAreaElement).value,');

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
