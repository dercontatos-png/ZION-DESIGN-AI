const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

async function searchPinterest(query) {
  try {
    const res = await fetch(`https://br.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let dataScript = $('#__PWS_DATA__').html();
    const fs = require('fs');
    if (dataScript) {
      fs.writeFileSync('pws_data.json', dataScript);
      console.log("Wrote pws_data.json");
    } else {
        console.log("No data script");
    }
  } catch(e) {
    console.error(e);
  }
}
searchPinterest("logo design");
