const scraper = require('@myno_21/pinterest-scraper');
async function run() {
  const result = await scraper.search("logo design");
  console.log(result.slice(0, 5));
}
run();
