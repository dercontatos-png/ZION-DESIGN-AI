const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
const returnStart = code.indexOf('return (', code.length / 2);
const jsxStr = code.substring(returnStart);
const lines = jsxStr.split('\n');
console.log(lines.slice(65, 80).join('\n'));
