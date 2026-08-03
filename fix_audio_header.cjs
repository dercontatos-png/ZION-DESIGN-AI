const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

const oldHeader = `      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#09090b]">`;
const newHeader = `      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09090b]">`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/components/AudioStudio.tsx', code, 'utf-8');
console.log("Fixed Audio Header!");
