const axios = require('axios');
async function test() {
  try {
    const res = await axios.post("https://api.elevenlabs.io/v1/music", {
      composition_plan: {
        positive_global_styles: ["epic background music", "strictly instrumental"],
        negative_global_styles: ["vocals"],
        sections: [
          { 
            section_name: "Intro",
            duration_ms: 15000, 
            positive_local_styles: ["epic"],
            negative_local_styles: ["vocals"],
            lines: []
          }
        ]
      }
    }, {
      headers: { "xi-api-key": "sk_87d4bf1f1295b9d0383faeb8a92cc041499dc84d5dfb0ca0" }
    });
  } catch (e) {
    console.log(e.response ? JSON.stringify(e.response.data) : e.message);
  }
}
test();
