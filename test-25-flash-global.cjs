const { GoogleGenAI } = require("@google/genai");
const creds = require("./chave-vertex.json");

async function test() {
  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "gerador-de-imagens-ia-502303",
      location: "global",
      googleAuthOptions: { credentials: creds }
    });
    console.log("Generating with gemini-2.5-flash-image (global)...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Generate an image of the Eiffel tower with fireworks in the background.',
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    console.log("Success with global!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
