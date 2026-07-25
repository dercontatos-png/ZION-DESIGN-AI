const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /store\.createProject\(\);\n\s*clearChat\(\);\n\s*setActiveClient\(null\);/;
const replacement = `store.createProject();
                    setChats({});
                    setAttachedFiles([]);
                    setActiveClient(null);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
