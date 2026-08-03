const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

// 1. set showAdvanced to true by default
code = code.replace(/const \[showAdvanced, setShowAdvanced\] = useState\(false\);/, 'const [showAdvanced, setShowAdvanced] = useState(true);');

// 2. Remove the {audioType !== "Efeito Sonoro (SFX)" && (<> 
code = code.replace(/\{audioType !== "Efeito Sonoro \(SFX\)" && \(\<\>/, '');

// 3. Remove the corresponding </>)} before Fileira 6
code = code.replace(/\<\/\>\)\}\s*\{\/\* SFX Block \*\/\}/, '{/* SFX Block */}');

// 4. Fix the button text color issue
code = code.replace(/bg-\[#c5a880\] text-zinc-950 font-bold hover:bg-\[#c5a880\]\/80 text-zinc-50 font-bold/, 'bg-[#c5a880] text-zinc-950 font-bold hover:bg-[#c5a880]/80');

fs.writeFileSync('src/components/AudioStudio.tsx', code, 'utf-8');
console.log("Fixed Audio Options!");
