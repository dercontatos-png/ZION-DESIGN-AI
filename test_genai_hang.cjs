const { GoogleGenAI } = require('@google/genai');
const fakeSa = {
  type: "service_account",
  project_id: "test-project",
  // valid looking dummy RSA key
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3cW8uFm5+2c9t\nnQy7u+sJ3t0H/41Q/6s7u9R2O5tL4/sO2xQ/wJ8aP8mQ7y9H3v4+rF9E/tU6k5e3\nP1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w\n/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y\n7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6\nk5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ\n5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3\nP1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w/7U6k5e3P1Y7/hQ5+w\n-----END PRIVATE KEY-----\n",
  client_email: "test@test-project.iam.gserviceaccount.com"
};

async function run() {
  const client = new GoogleGenAI({
    vertexai: true,
    project: "test-project",
    location: "us-central1",
    googleAuthOptions: { credentials: fakeSa }
  });
  console.log("Client created. Generating...");
  try {
    // Generate a valid RSA key so it doesn't fail on DECODER routines
    const crypto = require('crypto');
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    fakeSa.private_key = privateKey;
    
    const client2 = new GoogleGenAI({
      vertexai: true,
      project: "test-project",
      location: "us-central1",
      googleAuthOptions: { credentials: fakeSa }
    });
    
    await client2.models.generateContent({
      model: "gemini-2.5-pro",
      contents: "Hello"
    });
    console.log("Done");
  } catch(e) {
    console.error("Caught error:", e.message);
  }
}
run();
