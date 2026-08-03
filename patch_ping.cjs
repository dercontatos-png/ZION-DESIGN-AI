const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/app\.get\("\/api\/config\/active-key"/, `
  app.post("/api/ping", (req, res) => {
    res.json({ pong: true, body: req.body });
  });
  app.get("/api/config/active-key"`);

fs.writeFileSync('server.ts', code);
