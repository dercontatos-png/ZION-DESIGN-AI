const fs = require('fs');
const html = fs.readFileSync('public/Home.html', 'utf8');

const regex = /<[^>]+class="[^"]*lg:hidden[^"]*"[^>]*>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('MATCH:', match[0]);
}
