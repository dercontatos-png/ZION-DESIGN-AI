const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

async function run() {
  const res = await fetch(`https://br.pinterest.com/search/pins/?q=logo%20design`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
  });
  const html = await res.text();
  
  // Pinterest puts data in <script id="__PWS_DATA__">...
  // Or relay data?
  const regex = /"images":\{"orig":\{"url":"([^"]+)"/g;
  let match;
  const urls = [];
  while ((match = regex.exec(html)) !== null) {
      urls.push(match[1]);
  }
  console.log("Images via regex:", urls.length);
  console.log(urls.slice(0, 5));
}
run();
