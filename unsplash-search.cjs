const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function test() {
  const res = await fetch("https://unsplash.com/napi/search/photos?query=branding&per_page=10", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
