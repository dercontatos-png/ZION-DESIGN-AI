const { GoogleAuth } = require('google-auth-library');
const creds = require("./chave-vertex.json");

async function test() {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  // Using text model
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/gerador-de-imagens-ia-502303/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`;
  try {
    const res = await client.request({
      url,
      method: "POST",
      data: {
        contents: [
          {
            role: "user",
            parts: [{ text: "Hello" }]
          }
        ]
      }
    });
    console.log("Text generation response keys:", Object.keys(res.data));
    console.log(res.data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.log("Error:", err.response ? JSON.stringify(err.response.data) : err.message);
  }
}
test();
