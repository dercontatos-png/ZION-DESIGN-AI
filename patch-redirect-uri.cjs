const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace /api/pinterest/auth redirect logic
code = code.replace(
  /const redirectUri = process\.env\.PINTEREST_REDIRECT_URI \|\| `https:\/\/\$\{req\.get\("host"\)\}\/api\/pinterest\/callback`;/g,
  `let redirectUri = process.env.PINTEREST_REDIRECT_URI;
    const currentHost = req.headers['x-forwarded-host'] || req.get("host");
    if (!redirectUri || (redirectUri.includes("localhost") && !currentHost.includes("localhost"))) {
      redirectUri = \`https://\${currentHost}/api/pinterest/callback\`;
    }`
);

fs.writeFileSync('server.ts', code);
console.log("Patched redirectUri logic");
