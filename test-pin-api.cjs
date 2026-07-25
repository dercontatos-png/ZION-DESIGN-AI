const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const query = "logo design";
  const url = `https://br.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(query)}&data={"options":{"isPrefetch":false,"query":"${encodeURIComponent(query)}","scope":"pins","no_fetch_context_on_resource":false},"context":{}}`;
  
  const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
  });
  console.log(res.status);
  const data = await res.json();
  const pins = data.resource_response.data.results;
  console.log("Found pins:", pins.length);
  if (pins.length > 0) {
      console.log(pins[0].images?.orig?.url);
  }
}
run();
