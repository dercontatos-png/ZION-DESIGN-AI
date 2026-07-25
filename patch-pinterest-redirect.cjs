const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const redirectUri = process\.env\.PINTEREST_REDIRECT_URI \|\| "http:\/\/localhost:3000\/api\/pinterest\/callback";/g,
  'const redirectUri = process.env.PINTEREST_REDIRECT_URI || `https://${req.get("host")}/api/pinterest/callback`;'
);

fs.writeFileSync('server.ts', code);
console.log("Pinterest redirect URI dynamic host patched.");
