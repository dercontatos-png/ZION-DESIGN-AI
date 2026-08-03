const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/const credentialsPath = /g, 'let credentialsPath = ');
fs.writeFileSync('server.ts', code);
