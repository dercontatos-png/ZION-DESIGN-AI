const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

if (!server.includes('/api/config/active-key')) {
  server = server.replace(
    'app.get("/api/check-vertex-key",',
    `app.get("/api/config/active-key", (req, res) => {\n    res.json({ key: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" });\n  });\n\n  app.get("/api/check-vertex-key",`
  );
  fs.writeFileSync('server.ts', server);
  console.log("Patched server.ts");
}
