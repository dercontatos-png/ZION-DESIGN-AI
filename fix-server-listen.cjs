const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace everything after `if (!process.env.VERCEL) {` inside startServer with the correct `app.listen`
code = code.replace(/if \(!process\.env\.VERCEL\) \{\s*const server = app\.listen\(PORT[^]+?\}\s*\);/g, `if (!process.env.VERCEL) {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });`);

fs.writeFileSync('server.ts', code);
console.log("Fixed listen");
