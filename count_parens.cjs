const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const returnStart = code.indexOf('return (', code.length / 2);
const jsxStr = code.substring(returnStart);

let paren = 0;
let brace = 0;
for(let i=0; i<jsxStr.length; i++) {
   if (jsxStr[i] === '(') paren++;
   if (jsxStr[i] === ')') paren--;
   if (jsxStr[i] === '{') brace++;
   if (jsxStr[i] === '}') brace--;
}
console.log(`Final paren: ${paren}, Final brace: ${brace}`);
