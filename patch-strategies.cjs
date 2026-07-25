const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const strategies = [\n      { name: "gemini-3-pro-image", type: "generateContent" },\n      { name: "gemini-2.5-flash-image", type: "generateContent" },\n      { name: "gemini-3.1-flash-image", type: "generateContent" }\n    ];',
  'const baseStrategies = [\n      { name: "gemini-3-pro-image", type: "generateContent" },\n      { name: "gemini-2.5-flash-image", type: "generateContent" },\n      { name: "gemini-3.1-flash-image", type: "generateContent" }\n    ];\n    const strategies = modelId ? [{ name: modelId, type: "generateContent" }, ...baseStrategies.filter(s => s.name !== modelId)] : baseStrategies;'
);

fs.writeFileSync('server.ts', code);
console.log("Patched strategies.");
