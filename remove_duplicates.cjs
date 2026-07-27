const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    const baseStrategies = [
      { name: "imagen-3.0-generate-002", type: "generateImages" },
      { name: "imagen-3.0-generate-001", type: "generateImages" },
      { name: "gemini-3-pro-image", type: "generateContent" },
      { name: "gemini-3-pro-image", type: "generateContent" },
      { name: "gemini-3-pro-image", type: "generateContent" }
    ];`,
  `    const baseStrategies = [
      { name: "imagen-3.0-generate-002", type: "generateImages" },
      { name: "imagen-3.0-generate-001", type: "generateImages" },
      { name: "gemini-3-pro-image", type: "generateContent" }
    ];`
);

fs.writeFileSync('server.ts', code);
