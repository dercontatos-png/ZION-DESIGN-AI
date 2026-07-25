const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const creds = require("./chave-vertex.json");
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "gerador-de-imagens-ia-502303",
      location: "us-central1",
      googleAuthOptions: { credentials: creds }
    });
    console.log("Generating image with Vertex AI (gemini-3-pro-image) in us-central1...");
    const res = await ai.models.generateImages({
      model: "gemini-3-pro-image",
      prompt: "A beautiful landscape",
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png"
      }
    });
    if (res?.generatedImages?.[0]?.image?.imageBytes) {
      console.log("Image generated successfully!");
    } else {
      console.log("No image returned.");
    }
  } catch (err) {
    console.error("Error generating image:", err.message);
  }
}
test();
