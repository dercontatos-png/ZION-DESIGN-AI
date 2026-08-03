const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
let parsed;
try {
  parsed = JSON.parse(fs.readFileSync('chave-vertex.json', 'utf8'));
} catch (e) {
  console.log("No key");
  process.exit(0);
}
const ai = new GoogleGenAI({
  vertexai: true,
  project: parsed.project_id,
  location: "us-central1",
  googleAuthOptions: { credentials: parsed }
});
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Hello"
    });
    console.log(res.text);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
