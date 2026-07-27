const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/bg-zinc-950/g, 'bg-black');
  content = content.replace(/bg-zinc-900/g, 'bg-black');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
