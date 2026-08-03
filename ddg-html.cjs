const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

async function search(query) {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:pinterest.com')}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const images = [];
  $('.result__snippet').each((i, el) => {
      // The snippet might contain the description, but let's see if we can get the image
  });
  const links = $('.result__url').map((i, el) => $(el).text().trim()).get();
  console.log(links.slice(0, 5));
}
search("logo design");
