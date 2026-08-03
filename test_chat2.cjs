const fetch = require('node-fetch');

const fakeSa = {
  type: "service_account",
  project_id: "test-project",
  private_key_id: "123",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDH+...\n-----END PRIVATE KEY-----\n",
  client_email: "test@test-project.iam.gserviceaccount.com",
  client_id: "123",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/test%40test-project.iam.gserviceaccount.com"
};

async function run() {
  console.log("Fetching...");
  const start = Date.now();
  const resp = await fetch("http://localhost:3000/api/chat-agentes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assistantId: "test",
      message: "Hello",
      history: [],
      modelId: "gemini-2.5-pro",
      customApiKey: JSON.stringify(fakeSa)
    })
  });
  const text = await resp.text();
  console.log("Time:", Date.now() - start, "ms");
  console.log("STATUS", resp.status);
  console.log("BODY", text);
}
run();
