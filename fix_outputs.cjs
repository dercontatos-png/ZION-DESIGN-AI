const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const outputs = response.outputs || [];',
  'const outputs = (response as any).outputs || [];'
);

fs.writeFileSync('server.ts', code);
