const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
    const query = "logo design pinterest";
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
    console.log("Headers:", res.headers.raw());
}
run();
