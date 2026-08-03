const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/lastError = err;\n      }\n    }\n  }\n  throw lastError/g, `lastError = err;
        if (rawMsg.includes("403") || rawMsg.includes("401") || rawMsg.includes("Permission") || rawMsg.includes("Unauthorized")) {
          console.warn("[generateContent-fallback] Fast failing due to auth/permission error:", rawMsg);
          throw new Error("Erro de Permissão (403/401): Verifique se a sua Service Account tem a permissão 'Vertex AI User' e se a API Vertex AI está ativada no seu Google Cloud Project. Detalhes: " + rawMsg);
        }
      }
    }
  }
  throw lastError`);

fs.writeFileSync('server.ts', code);
