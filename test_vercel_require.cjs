process.env.VERCEL = "1";
try {
  require('./dist/server.cjs');
  console.log("Success");
} catch(e) {
  console.error("FAIL", e);
}
