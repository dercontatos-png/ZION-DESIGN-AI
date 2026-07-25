const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://www.google.com/search?tbm=isch&q=logo%20design%20reference", { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
  const html = await res.text();
  const urls = html.match(/https?:\/\/[^"'\s]+\.jpg/g) || [];
  console.log(urls.slice(0, 5));
}
test();
