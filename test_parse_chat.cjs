const ts = require('typescript');
const fs = require('fs');
const code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');
const sourceFile = ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true);
console.log("Parse succeeded");
