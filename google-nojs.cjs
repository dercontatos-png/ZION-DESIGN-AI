const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://www.google.com/search?tbm=isch&q=logo%20design&safe=active", { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }});
  const html = await res.text();
  console.log(html.substring(0, 500));
}
test();
