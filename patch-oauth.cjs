const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Update /api/pinterest/auth to return JSON instead of redirecting
code = code.replace(
  /app\.get\("\/api\/pinterest\/auth", \(req, res\) => \{[\s\S]*?res\.redirect\(pinterestAuthUrl\);\s*\}\);/,
  `app.get("/api/pinterest/auth", (req, res) => {
    const clientId = process.env.PINTEREST_CLIENT_ID;
    const redirectUri = process.env.PINTEREST_REDIRECT_URI || \`https://\${req.get("host")}/api/pinterest/callback\`;
    
    if (!clientId) {
      return res.status(500).json({ error: "PINTEREST_CLIENT_ID not configured in .env" });
    }

    const state = Math.random().toString(36).substring(7);
    const scope = "boards:read,pins:read";
    
    const pinterestAuthUrl = \`https://www.pinterest.com/oauth/?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${scope}&state=\${state}\`;
    
    res.json({ url: pinterestAuthUrl });
  });`
);

// 2. Update /api/pinterest/callback to use window.opener.postMessage
code = code.replace(
  /res\.send\(\`\s*<html>\s*<body>\s*<script>\s*localStorage\.setItem\("pinterest_access_token", "\$\{tokenData\.access_token\}"\);\s*window\.location\.href = "\/";\s*<\/script>\s*<\/body>\s*<\/html>\s*\`\);/,
  `res.send(\`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'PINTEREST_AUTH_SUCCESS', token: "\${tokenData.access_token}" }, '*');
                window.close();
              } else {
                localStorage.setItem("pinterest_access_token", "\${tokenData.access_token}");
                window.location.href = "/";
              }
            </script>
            <p>Autenticação bem-sucedida. Esta janela deve fechar automaticamente.</p>
          </body>
        </html>
      \`);`
);

fs.writeFileSync('server.ts', code);
console.log("server.ts OAuth popup logic applied.");
