const http = require('http');
const fetch = require('node-fetch');

async function run() {
  const resp = await fetch("http://localhost:3000/api/upload-vertex-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonContent: "{\"type\":\"service_account\",\"project_id\":\"test-project\"}" })
  });
  const text = await resp.text();
  console.log("STATUS", resp.status);
  console.log("BODY", text);
}
run();
