const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/bg-\[#070708\]/g, 'bg-black');
    content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-black');
    content = content.replace(/bg-\[#0f0f11\]/g, 'bg-black');
    content = content.replace(/bg-\[#000000\]/g, 'bg-black');
    
    // Also remove the explicit hex strings for black if they exist
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});
