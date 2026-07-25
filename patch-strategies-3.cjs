const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const strategies = [\n      { name: "gemini-2.5-flash-image", type: "generateContent" },\n      { name: "gemini-3.1-flash-image", type: "generateContent" }\n    ];',
  'const strategies = [\n      { name: "gemini-3-pro-image", type: "generateContent" },\n      { name: "gemini-2.5-flash-image", type: "generateContent" },\n      { name: "gemini-3.1-flash-image", type: "generateContent" }\n    ];'
);

code = code.replace(
  'const modelsToTry = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];',
  'const modelsToTry = ["gemini-3-pro-image", "gemini-2.5-flash-image", "gemini-3.1-flash-image"];'
);

code = code.replace(
  '["gemini-2.5-flash-image", "gemini-3.1-flash-image"],',
  '["gemini-3-pro-image", "gemini-2.5-flash-image", "gemini-3.1-flash-image"],'
);

// We need to ensure responseModalities: ["TEXT", "IMAGE"]
code = code.replace(
  'responseModalities: ["IMAGE"]',
  'responseModalities: ["TEXT", "IMAGE"]'
);
code = code.replace(
  'responseModalities: ["IMAGE"]',
  'responseModalities: ["TEXT", "IMAGE"]'
);

fs.writeFileSync('server.ts', code);
console.log("Strategies patched again.");
