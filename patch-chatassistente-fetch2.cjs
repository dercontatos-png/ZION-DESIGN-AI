const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  'customApiKey: localStorage.getItem("custom_gemini_api_key") || ""\n        })',
  'customApiKey: localStorage.getItem("custom_gemini_api_key") || "",\n          modelId: selectedModel\n        })'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched fetch 2.");
