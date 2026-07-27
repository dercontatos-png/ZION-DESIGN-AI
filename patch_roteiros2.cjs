const fs = require('fs');
let code = fs.readFileSync('src/components/GeradorRoteiros.tsx', 'utf8');

const target = `          customApiKey: localStorage.getItem("custom_gemini_api_key") || "",`;
const replacement = `          // customApiKey removido para forçar o uso do Vertex no servidor`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/GeradorRoteiros.tsx', code);
