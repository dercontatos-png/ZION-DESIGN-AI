const { GoogleGenAI } = require('@google/genai');
const parsed = {
  "type": "service_account",
  "project_id": "gerador-de-imagens-ia-502303",
  "private_key_id": "fake",
  "private_key": "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----\n",
  "client_email": "fake@gerador-de-imagens-ia-502303.iam.gserviceaccount.com",
  "client_id": "111",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/fake",
  "universe_domain": "googleapis.com"
};
const ai = new GoogleGenAI({
  vertexai: true,
  project: "gerador-de-imagens-ia-502303",
  location: "us-central1",
  googleAuthOptions: { credentials: parsed }
});
console.log(ai);
