const fs = require('fs');
let content = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

content = content.replace(/hover:bg-\[#c5a880\]\/80\/20/g, 'hover:bg-[#c5a880]/20');
content = content.replace(/hover:bg-\[#c5a880\]\/80\/30/g, 'hover:bg-[#c5a880]/30');
content = content.replace(/text-zinc-950 font-bold border-\[#c5a880\] text-zinc-50/g, 'text-zinc-950 font-bold border-[#c5a880]');
content = content.replace(/bg-\[#c5a880\] text-zinc-950 font-bold text-zinc-50/g, 'bg-[#c5a880] text-zinc-950 font-bold');

fs.writeFileSync('src/components/AudioStudio.tsx', content, 'utf-8');
