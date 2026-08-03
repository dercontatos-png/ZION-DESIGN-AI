const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
let found = false;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.match(/Ã[£ª§µ­©³º¢´€ \x81\x89\x8D\x93\x9A\x87\x83\x8A\x82\x94\x95šŒ›–äüö]/)) {
    console.log("Double encoding found in: " + file);
    found = true;
  }
}

if (!found) {
  console.log("No double encoding found.");
}
