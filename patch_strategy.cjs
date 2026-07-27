const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  \`    const strategies = modelId ? [{ name: modelId, type: "generateContent" }, ...baseStrategies.filter(s => s.name !== modelId)] : baseStrategies;\`,
  \`    const strategies = modelId ? [{ name: modelId, type: modelId.startsWith("imagen") ? "generateImages" : "generateContent" }, ...baseStrategies.filter(s => s.name !== modelId)] : baseStrategies;\`
);

fs.writeFileSync('server.ts', code);
