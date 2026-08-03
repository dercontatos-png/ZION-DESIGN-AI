const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/lastError = rawMsg;\n        if \(rawMsg\.includes\("429"\)/g, `lastError = rawMsg;
        if (rawMsg.includes("403") || rawMsg.includes("401") || rawMsg.includes("Permission") || rawMsg.includes("Unauthorized")) {
          throw new Error("Erro de Permissão (403/401): Verifique se a sua Service Account tem a permissão 'Vertex AI User' e se a API Vertex AI está ativada. Detalhes: " + rawMsg);
        }
        if (rawMsg.includes("429")`);

fs.writeFileSync('server.ts', code);
