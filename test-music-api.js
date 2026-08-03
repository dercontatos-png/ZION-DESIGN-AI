const axios = require('axios');
async function test() {
  try {
    const res = await axios.post("https://api.elevenlabs.io/v1/music", {
      model_id: "eleven_music_v1", // Using v1 to test
      prompt: "test",
      composition_plan: { foo: "bar" } // invalid property
    }, {
      headers: { "xi-api-key": "sk_87d4bf1f1295b9d0383faeb8a92cc041499dc84d5dfb0ca0" }
    });
  } catch (e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
