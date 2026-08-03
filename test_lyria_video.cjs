const { GoogleGenAI } = require('@google/genai');
const sa = require('./chave-vertex.json');

async function test() {
  const ai = new GoogleGenAI({ 
    vertexai: true, 
    project: sa.project_id, 
    location: "global", 
    googleAuthOptions: { credentials: sa } 
  });
  
  try {
    console.log("Testing with audio part...");
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [
        { type: "text", text: "Continue this music" },
        { type: "audio", mime_type: "audio/mp3", data: "SUQzAwAAAAAvL0dFT0IAABelAAAAYXBwbGljYXRpb24vYzJwYQBjMnBhAGMycGEgbW" }
      ]
    });
    console.log("Success audio!");
  } catch (e) {
    console.error("Failed audio:", e.message);
  }
}
test();
