const fs = require('fs');
fetch("https://br.pinterest.com/search/pins/?q=logo%20design")
  .then(res => res.text())
  .then(html => {
    const match = html.match(/<script id="__PWS_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if(match && match[1]) {
      const data = JSON.parse(match[1]);
      // Let's find pins
      const pins = [];
      const traverse = (obj) => {
        if (!obj) return;
        if (typeof obj === 'object') {
          if (obj.type === 'pin' && obj.images && obj.images.orig) {
            pins.push({
              id: obj.id,
              title: obj.title || obj.grid_title || "",
              description: obj.description,
              url: obj.images.orig.url
            });
          }
          for (let key in obj) traverse(obj[key]);
        }
      };
      traverse(data);
      console.log("Found pins: ", pins.length);
      console.log(pins.slice(0, 2));
    }
  });
