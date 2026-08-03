const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
const rcStart = code.indexOf('<div className="w-full lg:flex-1 bg-[#000000] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">');
const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
const chunk = code.substring(rcStart, em);

const lines = chunk.split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
    const l = lines[i];
    const opens = (l.match(/<div/g) || []).length;
    const closes = (l.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    console.log(`Line ${i}: depth=${depth}, opens=${opens}, closes=${closes} -> ${l.trim()}`);
}
