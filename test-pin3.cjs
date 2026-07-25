const fs = require('fs');
fetch("https://br.pinterest.com/search/pins/?q=logo%20design")
  .then(res => res.text())
  .then(html => {
    const match = html.match(/<script id="__PWS_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if(match && match[1]) {
      const data = JSON.parse(match[1]);
      fs.writeFileSync('pws.json', JSON.stringify(data, null, 2));
      console.log("Written pws.json");
    }
  });
