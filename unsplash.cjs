const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://unsplash.com/napi/search/photos?query=logo%20design&per_page=20", { headers: { 'User-Agent': 'Mozilla/5.0' }});
  console.log(res.status);
  const data = await res.json();
  console.log(data.results[0].urls.regular);
}
test();
