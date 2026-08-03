const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyC3seHAMIgwPRxb-Ts1Q3Xds2PAL4mR89Q" });
    console.log("Generating image...");
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
