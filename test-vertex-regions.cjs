const { GoogleAuth } = require('google-auth-library');
const creds = require("./chave-vertex.json");

async function testRegion(region) {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const url = `https://${region}-aiplatform.googleapis.com/v1/projects/gerador-de-imagens-ia-502303/locations/${region}/publishers/google/models/imagen-3.0-generate-001:predict`;
  try {
    const res = await client.request({
      url,
      method: "POST",
      data: {
        instances: [{ prompt: "A beautiful landscape" }],
        parameters: { sampleCount: 1, outputOptions: { mimeType: "image/png" } }
      }
    });
    console.log(`Success in ${region}!`);
  } catch (err) {
    console.log(`Error in ${region}:`, err.response ? JSON.stringify(err.response.data) : err.message);
  }
}

async function run() {
  await testRegion("us-central1");
  await testRegion("us-east4");
  await testRegion("us-west1");
  await testRegion("europe-west1");
}
run();
