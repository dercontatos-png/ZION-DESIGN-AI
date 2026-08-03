const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ vertexai: true, project: "gerador-de-imagens-ia-502303", location: 'us-central1' });
console.log("project:", ai.project);
console.log("location:", ai.location);
console.log("vertexai:", ai.vertexai);
