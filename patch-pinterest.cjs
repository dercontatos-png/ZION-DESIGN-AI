const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const pinterestRoutes = `
  // Pinterest OAuth Integration
  app.get("/api/pinterest/auth", (req, res) => {
    const clientId = process.env.PINTEREST_CLIENT_ID;
    const redirectUri = process.env.PINTEREST_REDIRECT_URI || "http://localhost:3000/api/pinterest/callback";
    
    if (!clientId) {
      return res.status(500).send("PINTEREST_CLIENT_ID not configured in .env");
    }

    const state = Math.random().toString(36).substring(7);
    const scope = "boards:read,pins:read";
    
    const pinterestAuthUrl = \`https://www.pinterest.com/oauth/?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code&scope=\${scope}&state=\${state}\`;
    
    res.redirect(pinterestAuthUrl);
  });

  app.get("/api/pinterest/callback", async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).send(\`Error from Pinterest: \${error}\`);
    }

    if (!code) {
      return res.status(400).send("No code provided by Pinterest");
    }

    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
    const redirectUri = process.env.PINTEREST_REDIRECT_URI || "http://localhost:3000/api/pinterest/callback";

    try {
      const credentials = Buffer.from(\`\${clientId}:\${clientSecret}\`).toString("base64");
      
      const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Authorization": \`Basic \${credentials}\`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri
        }).toString()
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Pinterest Token Error:", tokenData);
        return res.status(tokenResponse.status).send(\`Error fetching token: \${JSON.stringify(tokenData)}\`);
      }

      // In a real app, you'd store this in a session or database.
      // Here we will redirect to the frontend with the token in a cookie or URL fragment.
      // Since it's a dev tool, we'll set it as a cookie for the client to read, or pass it via a script.
      
      res.send(\`
        <html>
          <body>
            <script>
              localStorage.setItem("pinterest_access_token", "\${tokenData.access_token}");
              window.location.href = "/";
            </script>
          </body>
        </html>
      \`);
    } catch (err: any) {
      console.error("Pinterest OAuth Error:", err);
      res.status(500).send(\`Internal Server Error: \${err.message}\`);
    }
  });

  app.get("/api/pinterest/boards", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const response = await fetch("https://api.pinterest.com/v5/boards", {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pinterest/boards/:boardId/pins", async (req, res) => {
    const token = req.headers.authorization;
    const boardId = req.params.boardId;
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const response = await fetch(\`https://api.pinterest.com/v5/boards/\${boardId}/pins\`, {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
`;

if (!code.includes('/api/pinterest/auth')) {
  code = code.replace(/app\.post\("\/api\/parse-task"/, pinterestRoutes + '\n  app.post("/api/parse-task"');
  fs.writeFileSync('server.ts', code);
  console.log("Pinterest routes injected.");
} else {
  console.log("Pinterest routes already exist.");
}
