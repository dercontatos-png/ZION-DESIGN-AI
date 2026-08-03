const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://images.search.yahoo.com/search/images?p=logo+design", { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const html = await res.text();
  const urls = [...html.matchAll(/imgurl=([^&]+)/g)].map(m => decodeURIComponent(m[1]));
  console.log(urls.slice(0, 5));
}
test();
