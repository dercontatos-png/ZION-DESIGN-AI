const gis = require('g-i-s');
gis('brand manual design', logResults);
function logResults(error, results) {
  if (error) { console.log(error); }
  else { console.log(results.slice(0,5).map(r => r.url)); }
}
