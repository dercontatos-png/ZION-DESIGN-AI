const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Generating image with injected API key...");
    const res = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: "A beautiful landscape",
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png"
      }
    });
    if (res?.generatedImages?.[0]?.image?.imageBytes) {
      console.log("Image generated successfully with Env API key (imagen-3.0-generate-002)!");
    } else {
      console.log("No image returned.");
    }
  } catch (err) {
    console.error("Error generating image:", err.message);
  }
}
test();
