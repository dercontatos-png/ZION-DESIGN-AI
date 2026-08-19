const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

const helperCode = `function verifyGenerationAccess(req: express.Request, res: express.Response): boolean {
  const customApiKey = req.body?.customApiKey || req.headers["x-custom-api-key"] || req.query?.customApiKey;
  if (typeof customApiKey === "string" && customApiKey.trim().length > 5) {
    return true;
  }
  const userRole = (req.headers["x-user-role"] as string) || req.body?.userRole;
  const userEmail = (req.headers["x-user-email"] as string) || req.body?.userEmail;
  const isAdmin = userRole === "admin" || userEmail === "der.contatos@gmail.com";
  if (!isAdmin) {
    res.status(403).json({
      error: "Acesso negado: Apenas o administrador tem permissão para utilizar os recursos de geração da plataforma. Por favor, assine um plano para continuar.",
      requiresPlan: true
    });
    return false;
  }
  return true;
}

  app.get("/api/config/active-key", (req, res) => {
    res.json({ hasKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) });
  });`;

if (content.includes('app.get("/api/config/active-key"')) {
  content = content.replace(
    /app\.get\("\/api\/config\/active-key",\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/,
    helperCode
  );
} else {
  console.log("active-key route not found directly");
}

const routesToProtect = [
  'app.post("/api/parse-task", upload.single("file") as any, async (req, res) => {',
  'app.post("/api/inpaint-image", async (req, res) => {',
  'app.post("/api/remove-bg", async (req, res) => {',
  'app.post("/api/apply-refinements", async (req, res) => {',
  'app.post("/api/analyze-image-tech", async (req, res) => {',
  'app.post("/api/enhancer-supir-magnific", async (req, res) => {',
  'app.post(["/api/generate-image", "/api/generate-design", "/api/zion-ai-generate"], async (req, res) => {',
  'app.post("/api/generate", async (req, res) => {',
  'app.post("/api/gerar", async (req, res) => {',
  'app.post("/api/extract-prompt", async (req, res) => {',
  'app.post("/api/scan-gc-to-xaml", async (req, res) => {',
  'app.post(["/api/chat-assistente", "/api/chat-agentes"], async (req, res) => {',
  'app.post("/api/generate-audio", upload.single("file") as any, async (req, res) => {',
  'app.post("/api/melhorar-prompt", async (req, res) => {',
  'app.post("/api/omni-flash-enhance", async (req, res) => {',
  'app.post("/api/omni-flash-prompt", async (req, res) => {',
  'app.post("/api/omni-flash-generate", async (req, res) => {'
];

let count = 0;
for (const route of routesToProtect) {
  if (content.includes(route)) {
    if (!content.includes(route + '\n    if (!verifyGenerationAccess(req, res)) return;')) {
      content = content.replace(route, route + '\n    if (!verifyGenerationAccess(req, res)) return;');
      count++;
    }
  } else {
    console.warn('NOT FOUND ROUTE:', route);
  }
}

console.log('Successfully protected routes:', count);
fs.writeFileSync(serverPath, content, 'utf8');
