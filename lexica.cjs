const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://lexica.art/api/v1/search?q=logo", { headers: { 'User-Agent': 'Mozilla/5.0' }});
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
