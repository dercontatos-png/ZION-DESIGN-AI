const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/targetModel = "imagen-3\.0-generate-002"/g, 'targetModel = "imagen-3.0-generate-001"');

fs.writeFileSync('server.ts', code);
