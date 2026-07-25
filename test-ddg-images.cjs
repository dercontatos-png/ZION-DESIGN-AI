const { image_search } = require('duckduckgo-images-api');
async function run() {
  const results = await image_search({ query: "logo design site:pinterest.com", moderate: true });
  console.log(results.slice(0, 5).map(r => r.image));
}
run();
