const { GoogleAuth } = require('google-auth-library');
const creds = require("./chave-vertex.json");

async function test() {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  // Using list models endpoint
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/gerador-de-imagens-ia-502303/locations/us-central1/publishers/google/models`;
  try {
    const res = await client.request({
      url,
      method: "GET"
    });
    console.log("Models:", res.data.models.map(m => m.name.split("/").pop()).filter(n => n.includes("image") || n.includes("generate")));
  } catch (err) {
    console.log("Error:", err.response ? JSON.stringify(err.response.data) : err.message);
  }
}
test();
