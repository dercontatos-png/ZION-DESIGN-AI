process.env.VERCEL = "1";
const http = require('http');
async function run() {
  const api = require('./api/index.ts').default;
  const server = http.createServer(async (req, res) => {
    try {
      await api(req, res);
    } catch (e) {
      console.error("Top level exception", e);
      res.statusCode = 500;
      res.end("Internal error");
    }
  });
  server.listen(4002, () => console.log('Listening 4002'));
}
run();
