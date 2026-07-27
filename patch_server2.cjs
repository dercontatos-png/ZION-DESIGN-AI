const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  // 2. If customApiKey was supplied as a standard string API key (e.g. AIza... or AQ...)
  if (customApiKey?.trim() && !customApiKey.trim().startsWith('{')) {`;
const replacement = `  // 2. Se houver Vertex configurado, usar ele primeiro (a pedido do usuário)
  if (hasChaveVertex) {
    try {
      const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const projectId = parsed.project_id || "gerador-de-imagens-ia-502303";
      const clientInstance = new GoogleGenAI({
        vertexai: true,
        project: projectId,
        location: "global",
        googleAuthOptions: { credentials: parsed }
      });
      (clientInstance as any).debugInfo = {
        resolvedTokenSource: "Vertex AI (chave-vertex.json)",
        isUsingVertex: true,
        projectIdUsed: projectId
      };
      return clientInstance;
    } catch (e) {
      console.warn("Erro ao instanciar Vertex client pelo arquivo:", e);
    }
  }

  // 3. If customApiKey was supplied as a standard string API key (e.g. AIza... or AQ...)
  if (customApiKey?.trim() && !customApiKey.trim().startsWith('{')) {`;

code = code.replace(target, replacement);

const target2 = `  // 3. If chave-vertex.json exists on disk
  if (hasChaveVertex) {
    try {
      const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const projectId = parsed.project_id || "gerador-de-imagens-ia-502303";
      
      const clientInstance = new GoogleGenAI({
        vertexai: true,
        project: projectId,
        location: "global",
        googleAuthOptions: { credentials: parsed }
      });
      return clientInstance;
    } catch (e) {
      console.warn("Erro ao instanciar Vertex client pelo arquivo:", e);
    }
  }`;
const replacement2 = `  // Vertex logic moved above`;

code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
