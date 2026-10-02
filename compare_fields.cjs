const fs = require('fs');

const files = [
  { name: 'Hydra', file: 'C:/Users/TVChapada/Pictures/Hydra Builder.html' },
  { name: 'Enhance', file: 'C:/Users/TVChapada/Pictures/Enhance Builder.html' },
  { name: 'Ref', file: 'C:/Users/TVChapada/Pictures/Ref.html' },
  { name: 'AlteraFacil', file: 'C:/Users/TVChapada/Pictures/Altera Fácil.html' },
  { name: 'OrionPro', file: 'C:/Users/TVChapada/Pictures/Órion Pro.html' },
  { name: 'DesignBuilder12', file: 'C:/Users/TVChapada/Pictures/Design Builder1 2.html' },
];

files.forEach(({ name, file }) => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');

  console.log(`\n============================= ${name} =============================`);
  
  // Aside width and style
  const asideMatch = content.match(/<aside[^>]*class=\"([^\"]*)\"[^>]*style=\"([^\"]*)\"[^>]*>/i) || content.match(/<aside[^>]*>/i);
  console.log('ASIDE TAG:', asideMatch ? asideMatch[0] : 'None');

  // Main tag
  const mainMatch = content.match(/<main[^>]*>/i);
  console.log('MAIN TAG:', mainMatch ? mainMatch[0] : 'None');

  // Palco central tag
  const palcoMatch = content.match(/<section[^>]*class=\"([^\"]*palco[^\"]*)\"[^>]*>/i);
  console.log('PALCO TAG:', palcoMatch ? palcoMatch[0] : 'None');

  // Find all form fields / labels / sections inside aside
  const asideContent = (content.match(/<aside[\s\S]*?<\/aside>/i) || [''])[0];
  const labels = [...asideContent.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  console.log('LABELS IN ASIDE:', labels);

  // Find all button texts inside aside
  const asideButtons = [...asideContent.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  console.log('BUTTONS IN ASIDE:', asideButtons.slice(0, 15));

  // Find submit / generate button
  const submitBtn = asideButtons.filter(b => b.includes('Construir') || b.includes('Gerar') || b.includes('Melhorar') || b.includes('crédito'));
  console.log('ACTION BUTTONS:', submitBtn);
});
