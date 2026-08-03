const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
const lines = code.substring(0, code.indexOf('{/* 9. MODAL GRANDE')).split('\n');

let depth = 0;
for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    const opens = (l.match(/\{/g) || []).length;
    const closes = (l.match(/\}/g) || []).length;
    depth += opens - closes;
    console.log(`Line ${i}: depth=${depth} -> ${l.trim()}`);
}
