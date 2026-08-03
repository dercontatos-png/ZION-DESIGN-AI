const { GoogleGenAI } = require('@google/genai');
async function test() {
  const sa = require('./chave-vertex.json');
  // Need to use global for Lyria interactions
  const ai = new GoogleGenAI({ vertexai: true, project: sa.project_id, location: 'global', googleAuthOptions: { credentials: sa } });
  try {
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("Success", res);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
