const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function searchPin() {
  const query = "logo design";
  const url = `https://br.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(query)}&data={"options":{"q":"${query}","scope":"pins","rs":"typed"},"context":{}}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    }
  });
  const data = await res.json();
  console.log(data.resource_response.data.results.length);
}
searchPin();
