const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /store\.createProject\(\);\n\s*setActiveClient\(null\);\n\s*showToast\("Nova conversa iniciada\. Configurações zeradas\.", "success"\);/g;

const replacement = `store.createProject();
                    clearChat();
                    setActiveClient(null);
                    showToast("Nova conversa iniciada. Configurações zeradas.", "success");`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
