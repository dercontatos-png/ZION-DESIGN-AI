const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/} catch \(err: any\) {\s*console\.error\("Route \/api\/generate Error:", err\);\s*res\.status\(500\)\.json\({\s*error: `Erro catastrófico na rota generate: \${err\.message}`,\s*rawError: { message: err\.message, stack: err\.stack }\s*}\);/,
`} catch (err: any) {
      console.error("Route /api/generate Error:", err);
      let statusCode = 500;
      let displayError = \`Erro catastrófico na rota generate: \${err.message}\`;
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
         statusCode = 429;
         displayError = "Limite de cota excedido (429).";
      }
      res.status(statusCode).json({ 
         error: displayError,
         rawError: { message: err.message, stack: err.stack }
      });`);
fs.writeFileSync('server.ts', code);
