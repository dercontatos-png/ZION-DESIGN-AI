const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// There's a stray block of code at the end that shouldn't be there
// Let's just find the first `if (!process.env.VERCEL) { const server = app.listen`
const splitStr = `  if (!process.env.VERCEL) {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });`;

if (code.includes(splitStr)) {
  const parts = code.split(splitStr);
  
  // The first part is everything up to Vite setup and distPath.
  // We want to keep that, and append the actual end
  code = parts[0] + splitStr + `
    server.timeout = 600000;
    server.headersTimeout = 600000;
    server.requestTimeout = 600000;
  }
  return app;
}

let appPromise: Promise<any> | null = null;
export async function getApp() {
  if (!appPromise) {
    appPromise = startServer();
  }
  return appPromise;
}

if (!process.env.VERCEL) {
  startServer();
}
`;
  fs.writeFileSync('server.ts', code);
  console.log("Fixed duplicates");
}
