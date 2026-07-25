const request = require('request');
const cheerio = require('cheerio');

const url = 'https://images.google.com/search?tbm=isch&q=' + encodeURIComponent('logo design pinterest');
const options = {
  url,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
};
request(options, (err, res, body) => {
    // console.log(body.substring(0, 500));
    const urls = [];
    // Google images JSON data is often in AF_initDataCallback
    const matches = body.match(/AF_initDataCallback\(\{key: 'ds:1', isError:  false , hash: '2', data:(.*?)\}\);/s);
    if (matches && matches[1]) {
        console.log("Found data block!");
        // We can regex find urls inside the data block
        const imgRegex = /\["(http[^"]+)",\d+,\d+\]/g;
        let match;
        while ((match = imgRegex.exec(matches[1])) !== null) {
            if(!match[1].includes('gstatic')) {
                urls.push(match[1]);
            }
        }
        console.log("Found", urls.length, "images");
        console.log(urls.slice(0, 5));
    } else {
        console.log("No AF_initDataCallback found");
    }
});
