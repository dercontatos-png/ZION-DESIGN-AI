const fs = require('fs');
const html = fs.readFileSync('public/Home.html', 'utf8');

const navIdx = html.indexOf('pointer-events-none fixed inset-x-0 bottom-0 z-40');
console.log('Position of mobile nav in HTML:', navIdx, 'out of', html.length);
// Print 500 characters before navIdx
console.log('BEFORE:');
console.log(html.substring(navIdx - 400, navIdx));
