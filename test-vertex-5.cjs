const { GoogleAuth } = require('google-auth-library');
const creds = require("./chave-vertex.json");

async function test() {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  // Using imagen-3.0-generate-001 endpoint
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/gerador-de-imagens-ia-502303/locations/us-central1/publishers/google/models/imagegeneration@006:predict`;
  try {
    const res = await client.request({
      url,
      method: "POST",
      data: {
        instances: [
          {
            prompt: "A beautiful landscape"
          }
        ],
        parameters: {
          sampleCount: 1,
          outputOptions: {
            mimeType: "image/png"
          }
        }
      }
    });
    console.log("Image generation response keys:", Object.keys(res.data));
    if (res.data.predictions && res.data.predictions.length > 0) {
      console.log("Image generated successfully!");
    } else {
      console.log("No images returned.", res.data);
    }
  } catch (err) {
    console.log("Error:", err.response ? JSON.stringify(err.response.data) : err.message);
  }
}
test();
