const fs = require('fs');

const content = fs.readFileSync('C:/Users/TVChapada/Pictures/Design Builder.html', 'utf8');

// Find all cards, links, images, text in Design Builder.html
console.log('=== Design Builder.html ===');
console.log('Total characters:', content.length);

// Extract the main div structure inside body
const bodyContent = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyContent) {
  // Let's strip SVG paths to see clean HTML
  const cleaned = bodyContent[1]
    .replace(/<svg[\s\S]*?<\/svg>/gi, '<svg>[icon]</svg>')
    .replace(/<path[\s\S]*?\/>/gi, '');
  
  // write to a file in project so we can inspect it easily
  fs.writeFileSync('inspect_home.html', cleaned);
  console.log('Wrote inspect_home.html successfully');
}
