const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

code = code.replace(/let jsonStyleDescMap: Record<string, string> = \{\};/, 
  'let jsonStyleDescMap: Record<string, string> = {};\n    let parsedConfigJson: any = null;'
);

code = code.replace(/const configJson = JSON\.parse\(jsonMatch\[1\]\);/,
  'const configJson = JSON.parse(jsonMatch[1]);\n        parsedConfigJson = configJson;'
);

code = code.replace(/if \(configJson\.aprendizado_cliente && activeClientId\) \{/g,
  'if (parsedConfigJson && parsedConfigJson.aprendizado_cliente && activeClientId) {'
);

code = code.replace(/appendAiLearnings\(activeClientId, configJson\.aprendizado_cliente\);/g,
  'appendAiLearnings(activeClientId, parsedConfigJson.aprendizado_cliente);'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
