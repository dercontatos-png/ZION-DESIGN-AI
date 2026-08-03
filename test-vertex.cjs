const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const creds = require("./chave-vertex.json");
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "gerador-de-imagens-ia-502303",
      location: "us-central1", // Or global? The server uses global
      googleAuthOptions: { credentials: creds }
    });
    console.log("Generating image with Vertex AI...");
    const res = await ai.models.generateImages({
      model: "imagen-3.0-generate-002", // Imagen 3 model name in Vertex
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
