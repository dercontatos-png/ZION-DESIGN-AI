const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-image",
      contents: [{ role: "user", parts: [{ text: "A beautiful landscape" }] }],
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });
    console.log("Response keys:", Object.keys(res));
    if (res.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
       console.log("Got inline data:", res.candidates[0].content.parts[0].inlineData.mimeType);
       console.log("Success with gemini-3-pro-image!");
    } else {
       console.log("No inline data.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
