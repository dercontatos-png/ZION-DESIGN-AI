const fs = require('fs');
let code = fs.readFileSync('src/components/GeradorRoteiros.tsx', 'utf8');

const target = `    try {
      const apiKey = getActiveApiKey();
      
      const clientContext = \\\`
[CONTEXTO DO CLIENTE]`;

const replacement = `    try {
      const clientContext = \\\`
[CONTEXTO DO CLIENTE]`;

code = code.replace(target, replacement);

const target2 = `          customApiKey: apiKey,
          modelId: "gemini-3.6-flash"`;
const replacement2 = `          customApiKey: localStorage.getItem("custom_gemini_api_key") || "",
          modelId: "gemini-3.6-flash"`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/components/GeradorRoteiros.tsx', code);
