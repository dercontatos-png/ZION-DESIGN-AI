const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const publicGenDir = path\.join\(process\.cwd\(\), "public", "generated-images"\);\s+if \(!fs\.existsSync\(publicGenDir\)\) \{\s+fs\.mkdirSync\(publicGenDir, \{ recursive: true \}\);\s+\}/g, `const publicGenDir = path.join(process.cwd(), "public", "generated-images");
  if (!process.env.VERCEL) {
    try {
      if (!fs.existsSync(publicGenDir)) {
        fs.mkdirSync(publicGenDir, { recursive: true });
      }
    } catch (e) {
      console.warn("Could not create public directory:", e.message);
    }
  }`);

fs.writeFileSync('server.ts', code);
