const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `const getAiClient = (customApiKey?: string) => {
  const clients = getCandidateClients(customApiKey);
  const primary = clients[0]?.instance;
  if (primary) {
    (primary as any).debugInfo = {
      resolvedTokenSource: clients[0].name,
      isUsingVertex: true
    };
    return primary;
  }
  return new GoogleGenAI({ vertexai: true, project: "gerador-de-imagens-ia-502303", location: "us-central1" });
};`;

const newCode = `const getAiClient = (customApiKey?: string) => {
  const clients = getCandidateClients(customApiKey);
  const primary = clients[0]?.instance;
  if (primary) {
    const isVertex = clients[0].name.includes("Service Account") || !!(primary as any)._options?.vertexai || !!(primary as any).vertexai;
    (primary as any).debugInfo = {
      resolvedTokenSource: clients[0].name,
      isUsingVertex: isVertex
    };
    return primary;
  }
  const defaultClient = new GoogleGenAI({ vertexai: true, project: "gerador-de-imagens-ia-502303", location: "us-central1" });
  (defaultClient as any).debugInfo = { resolvedTokenSource: "Default", isUsingVertex: true };
  return defaultClient;
};`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
