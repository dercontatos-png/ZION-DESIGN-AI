const express = require('express');
const app = express();
app.get('/test', (req, res) => {
  res.json({
    host: req.get('host'),
    xForwardedHost: req.headers['x-forwarded-host'],
    origin: req.headers.origin,
    referer: req.headers.referer
  });
});
const server = app.listen(3001, () => {
  console.log('Listening on 3001');
  setTimeout(() => server.close(), 1000);
});
