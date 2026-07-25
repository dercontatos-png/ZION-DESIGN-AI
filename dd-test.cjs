const scraper = require('duck-duck-scrape');
async function run() {
  const res = await scraper.searchImages("logo design inspiration", { safeSearch: scraper.SafeSearchType.MODERATE });
  console.log(res.results.slice(0, 5).map(r => r.image));
}
run();
