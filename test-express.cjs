const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    });
    console.log("Generating with gemini-3-pro-image (express mode)...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image',
      contents: 'Generate an image of a fast red sports car.',
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    console.log("Success with express mode!");
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
