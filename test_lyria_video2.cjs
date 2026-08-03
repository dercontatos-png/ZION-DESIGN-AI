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
    console.log("Testing with video part...");
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [
        { type: "text", text: "Create soundtrack for this video" },
        { type: "video", mime_type: "video/mp4", data: "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQ" }
      ]
    });
    console.log("Success video!");
  } catch (e) {
    console.error("Failed video:", e.message);
  }
}
test();
