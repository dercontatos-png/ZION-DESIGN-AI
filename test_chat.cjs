const fetch = require('node-fetch');

async function run() {
  const resp = await fetch("http://localhost:3000/api/chat-agentes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assistantId: "test",
      message: "Hello",
      history: [],
      modelId: "gemini-2.5-pro",
      customApiKey: "{\"type\":\"service_account\",\"project_id\":\"test-project\"}"
    })
  });
  const text = await resp.text();
  console.log("STATUS", resp.status);
  console.log("BODY", text);
}
run();
