const { GoogleGenAI } = require('@google/genai');
const sa = require(require('os').tmpdir() + '/chave-vertex.json');

async function test() {
  const ai = new GoogleGenAI({ 
    vertexai: true, 
    project: sa.project_id, 
    location: "global", 
    googleAuthOptions: { credentials: sa } 
  });
  
  try {
    console.log("Calling interactions...");
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("Success interactions! Outputs:", (res.outputs || []).length);
  } catch (e) {
    console.error("Failed interactions:", e.message, "\nError:", e);
  }
}
test();
