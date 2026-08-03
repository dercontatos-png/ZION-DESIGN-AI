const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function searchDDG(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
    const html = await res.text();
    const vqdMatch = html.match(/vqd=([^&'"]+)/);
    if (!vqdMatch) return console.log("No vqd");
    
    const vqd = vqdMatch[1];
    const imgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&p=1&s=0&u=bing&f=,,,,,&l=us-en`, {
      headers: {
        'Accept': 'application/json',
        'x-vqd-4': vqd
      }
    });
    
    const data = await imgRes.json();
    console.log(data.results.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}
searchDDG("logo design");
