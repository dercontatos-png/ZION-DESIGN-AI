const { GoogleGenAI, Modality } = require("@google/genai");
const creds = require("./chave-vertex.json");

async function test() {
  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "gerador-de-imagens-ia-502303",
      location: "global",
      googleAuthOptions: { credentials: creds }
    });
    console.log("Generating with stream gemini-3-pro-image (global) TEXT+IMAGE...");
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-image',
      contents: 'Generate an image of the Eiffel tower with fireworks in the background.',
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    
    for await (const chunk of response) {
      if (chunk.text) console.log("Text chunk");
      if (chunk.data) console.log("Data chunk");
    }
    console.log("Done stream!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
