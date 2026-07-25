async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "A red sports car",
        aspectRatio: "1:1",
        size: "1K"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response keys:", Object.keys(data));
    if (data.modelUsed) console.log("Model used:", data.modelUsed);
    if (data.error) console.log("Error:", data.error);
  } catch (err) {
    console.error(err);
  }
}
test();
