const fs = require('fs');

let content = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

// Colors replacement
content = content.replace(/bg-\[#111\]/g, 'bg-black');
content = content.replace(/bg-\[#161616\]/g, 'bg-[#09090b]');
content = content.replace(/bg-\[#181818\]/g, 'bg-black/50');
content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-[#09090b]');
content = content.replace(/bg-\[#222\]/g, 'bg-black');

content = content.replace(/border-gray-800/g, 'border-white/5');
content = content.replace(/border-gray-700/g, 'border-white/5');
content = content.replace(/border-gray-600/g, 'border-white/10');
content = content.replace(/border-gray-400/g, 'border-white/20');

content = content.replace(/text-gray-600/g, 'text-zinc-600');
content = content.replace(/text-gray-500/g, 'text-zinc-500');
content = content.replace(/text-gray-400/g, 'text-zinc-400');
content = content.replace(/text-gray-300/g, 'text-zinc-300');
content = content.replace(/text-gray-200/g, 'text-zinc-200');
content = content.replace(/text-white/g, 'text-zinc-50');

content = content.replace(/bg-purple-600 text-zinc-50/g, 'bg-[#c5a880] text-zinc-950 font-bold');
content = content.replace(/bg-purple-600/g, 'bg-[#c5a880] text-zinc-950 font-bold');
content = content.replace(/hover:bg-purple-500/g, 'hover:bg-[#c5a880]/80');
content = content.replace(/bg-purple-500\/20/g, 'bg-[#c5a880]/20');
content = content.replace(/hover:bg-purple-500\/30/g, 'hover:bg-[#c5a880]/30');
content = content.replace(/hover:bg-purple-500\/20/g, 'hover:bg-[#c5a880]/20');
content = content.replace(/border-purple-500\/50/g, 'border-[#c5a880]/50');
content = content.replace(/border-purple-500\/30/g, 'border-[#c5a880]/30');
content = content.replace(/border-purple-500\/20/g, 'border-[#c5a880]/20');
content = content.replace(/border-purple-500/g, 'border-[#c5a880]');
content = content.replace(/text-purple-400/g, 'text-[#c5a880]');
content = content.replace(/text-purple-300/g, 'text-[#c5a880]');

content = content.replace(/shadow-purple-500\/20/g, 'shadow-[#c5a880]/20');
content = content.replace(/shadow-purple-500\/30/g, 'shadow-[#c5a880]/30');
content = content.replace(/rgba\(168,85,247,0\.2\)/g, 'rgba(197,168,128,0.2)');

fs.writeFileSync('src/components/AudioStudio.tsx', content, 'utf-8');
console.log("Replaced colors.");
