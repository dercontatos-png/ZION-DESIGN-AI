const { GoogleAuth } = require('google-auth-library');
const creds = require("./chave-vertex.json");

async function test() {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/gerador-de-imagens-ia-502303/locations/us-central1/publishers/google/models`;
  try {
    const res = await client.request({ url });
    console.log("Models found:", res.data.models.map(m => m.name).slice(0, 10));
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
test();
