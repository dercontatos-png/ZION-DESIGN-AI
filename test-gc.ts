import fetch from "node-fetch";
async function run() {
  const payload = {
    promptTraduzido: "Professional Television Broadcast Graphic (GC / Lower Third / Character Generator) overlay for TV shows, news, sports, and podcasts. Ultra-high resolution 8K, crisp broadcast typography, modern lower-third graphic bar, high-contrast TV studio production value, flawless colors, no pixelation.",
    resolutionInput: "1K",
    formato: "PNG",
    somentePrompt: false,
    dimensao: "16:9"
  };
  try {
    console.log("Sending request to /api/gerar");
    const res = await fetch("http://localhost:3000/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}
run();
