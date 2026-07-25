const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
  const res = await fetch("https://duckduckgo.com/");
  console.log(res.status);
}
run();
