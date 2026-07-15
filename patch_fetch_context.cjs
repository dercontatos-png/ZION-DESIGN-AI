const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const targetStr = `    setIsTyping(true);
    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: userMsg.content || "Analise os arquivos enviados.",
          attachedFiles: userMsg.files,`;

const newStr = `    setIsTyping(true);

    const activeClient = clients.find(c => c.id === activeClientId);
    const clientContext = activeClient ? \`\\n\\n[CONTEXTO DO CLIENTE ATUAL]:\\nCliente: \${activeClient.name}\\nNicho: \${activeClient.niche}\\nPaleta de Cores: \${activeClient.paletaCores?.join(', ') || 'Nenhuma'}\\nInfo Adicional: \${activeClient.infoExtra}\\nHistórico IA: \${activeClient.bancoDeDadosIA}\\n[IMPORTANTE]: Use essa paleta de cores e informações para guiar o design. Se aprender algo novo sobre o cliente, retorne no JSON no campo "aprendizado_cliente".\` : "";

    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: (userMsg.content || "Analise os arquivos enviados.") + clientContext,
          attachedFiles: userMsg.files,`;

if (code.includes(targetStr)) {
  code = code.split(targetStr).join(newStr);
  fs.writeFileSync('src/components/ChatAssistente.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Target string not found, let's use regex.");
  code = code.replace(
    /setIsTyping\(true\);\s*try \{\s*const res = await fetch\("\/api\/chat-agentes", \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},\s*body: JSON\.stringify\(\{\s*assistantId: activeAssistant\.id,\s*message: userMsg\.content \|\| "Analise os arquivos enviados\.",\s*attachedFiles: userMsg\.files,/m,
    newStr
  );
  fs.writeFileSync('src/components/ChatAssistente.tsx', code);
  console.log("Patched via regex!");
}
