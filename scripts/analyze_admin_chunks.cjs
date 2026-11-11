const fs = require('fs');
const path = require('path');
const chunksDir = 'C:/Users/TVChapada/Downloads/ZION-DESIGN-AI-main/ZION-DESIGN-AI-main/dist/_next/static/chunks';

const targetChunks = [
  '0q4y5mkf2t8dd.js',
  '0vme4z0smwsqh.js',
  '1j-be5-aerlqj.js',
  '04p2xg9p96c30.js',
  '1bw1wdln_kukr.js'
];

targetChunks.forEach(file => {
  const filePath = path.join(chunksDir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('\n=== FILE: ' + file + ' (size: ' + content.length + ' bytes) ===');
  
  // Extract all className occurrences
  const regex = /className:"([^"]+)"/g;
  let match;
  const classes = [];
  while ((match = regex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  console.log('Total className declarations:', classes.length);

  // Filter significant layout classes
  const significant = classes.filter(c => 
    c.includes('bg-') || c.includes('rounded-') || c.includes('grid') || c.includes('border') || c.includes('text-')
  );

  console.log('Sample prominent classes (up to 12):');
  significant.slice(0, 12).forEach(c => console.log('  * ' + c));
});

