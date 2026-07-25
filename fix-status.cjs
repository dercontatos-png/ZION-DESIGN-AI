const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/if \(errorMsg\.includes\("429"\) \|\| errorMsg\.includes\("RESOURCE_EXHAUSTED"\)\) \{[\s\S]*?return res\.status\(500\)\.json\(\{/, 
`let statusCode = 500;
        if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("429 Too Many Requests")) {
          displayError = "Limite de cota da API do Google atingido. Muitas imagens foram geradas recentemente. Por favor, aguarde alguns minutos e tente gerar novamente.";
          statusCode = 429;
        } else if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
          displayError = "Erro de permissão da API. Verifique sua chave de API ou permissões do Google Cloud.";
          statusCode = 403;
        }

        return res.status(statusCode).json({`);
fs.writeFileSync('server.ts', code);
