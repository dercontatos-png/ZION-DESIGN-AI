const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-audio',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    if (res.statusCode !== 200) {
      console.log("Data:", data);
    } else {
      const parsed = JSON.parse(data);
      console.log("Success! Audio length:", parsed.audioBase64?.length);
    }
  });
});

req.write(JSON.stringify({
  prompt: "Uma musica rapida e animada",
  modelId: "lyria-3-clip-preview"
}));
req.end();
