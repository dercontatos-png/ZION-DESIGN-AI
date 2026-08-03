const { GoogleGenAI, Modality } = require("@google/genai");
const creds = require("./chave-vertex.json");

async function test() {
  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "gerador-de-imagens-ia-502303",
      location: "us-central1",
      googleAuthOptions: { credentials: creds }
    });
    console.log("Generating with gemini-2.5-flash-image...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Generate an image of the Eiffel tower with fireworks in the background.',
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    
    console.log("Got response!");
    console.log("Text:", response.text);
    console.log("Keys in response:", Object.keys(response));
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log("Got image:", part.inlineData.mimeType);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
