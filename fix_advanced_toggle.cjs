const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');

code = code.replace(
  /<button \n              onClick=\{() => setShowAdvanced(!showAdvanced)\}/g,
  '<button \n              type="button"\n              onClick={() => setShowAdvanced(!showAdvanced)}'
);

code = code.replace(
  /onClick=\{() => setShowAdvanced\(!showAdvanced\)\}/g,
  'type="button" onClick={() => setShowAdvanced(!showAdvanced)}'
);

code = code.replace(
  /<div className="bg-\[#09090b\] rounded-2xl border border-white\/5 shadow-xl overflow-hidden">/g,
  '<div className="bg-[#09090b] rounded-2xl border border-white/5 shadow-xl overflow-hidden flex-shrink-0">'
);

fs.writeFileSync('src/components/AudioStudio.tsx', code, 'utf-8');
console.log("Fixed Advanced toggle!");
