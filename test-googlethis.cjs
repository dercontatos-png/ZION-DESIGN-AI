const google = require('googlethis');
async function run() {
  const options = {
    page: 0, 
    safe: false, // Safe Search
    additional_params: { 
      // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
      hl: 'pt-BR' 
    }
  }
  const response = await google.image('site:pinterest.com logo design', options);
  console.log(response.length);
  if (response.length > 0) {
      console.log(response.slice(0, 5).map(r => r.url));
  }
}
run();
