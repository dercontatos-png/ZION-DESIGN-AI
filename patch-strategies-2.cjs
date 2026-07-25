const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const strategies = [\n      { name: "gemini-3-pro-image", type: "generateContent" },\n      { name: "imagen-3.0-generate-002", type: "generateImages" },\n      { name: "imagen-3.0-generate-001", type: "generateImages" }\n    ];',
  'const strategies = [\n      { name: "gemini-2.5-flash-image", type: "generateContent" },\n      { name: "gemini-3.1-flash-image", type: "generateContent" }\n    ];'
);

code = code.replace(
  'const modelsToTry = ["gemini-3-pro-image", "imagen-3.0-generate-002", "imagen-3.0-generate-001"];',
  'const modelsToTry = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];'
);

code = code.replace(
  '["gemini-3-pro-image", "imagen-3.0-generate-002", "imagen-3.0-generate-001"],',
  '["gemini-2.5-flash-image", "gemini-3.1-flash-image"],'
);

fs.writeFileSync('server.ts', code);
console.log("Strategies patched.");
