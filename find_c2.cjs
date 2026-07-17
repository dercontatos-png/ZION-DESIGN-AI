const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
let found = false;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.match(/Â[°ªº¢£]/)) {
    console.log("Found Â in: " + file);
    found = true;
  }
}

if (!found) {
  console.log("No Â found.");
}
