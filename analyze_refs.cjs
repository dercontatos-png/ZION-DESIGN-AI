const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/TVChapada/Pictures';

const targets = [
  'Design Builder.html',
  'Design Builder1 2.html',
  'Hydra Builder.html',
  'Enhance Builder.html',
  'Ref.html',
  'Órion Pro.html',
  'Altera Fácil.html'
];

targets.forEach(t => {
  const p = path.join(dir, t);
  if (!fs.existsSync(p)) {
    console.log(t, 'does not exist');
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  const title = (content.match(/<title>([^<]*)<\/title>/i) || [])[1] || 'no title';
  const mainMatch = content.match(/<main[^>]*>/i);
  const asideMatch = content.match(/<aside[^>]*>/i);
  const navMatch = content.match(/<nav[^>]*>/i);
  const bodyTag = (content.match(/<body[^>]*>/i) || [])[0];
  
  // Extract all section headers or h1, h2, h3, buttons with text
  const buttons = [...content.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const headings = [...content.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);

  console.log('==================================================');
  console.log('FILE:', t);
  console.log('TITLE:', title);
  console.log('BODY:', bodyTag);
  console.log('MAIN:', mainMatch ? mainMatch[0] : 'None');
  console.log('ASIDE:', asideMatch ? asideMatch[0] : 'None');
  console.log('HEADINGS (first 10):', headings.slice(0, 10));
  console.log('BUTTONS (first 15):', buttons.slice(0, 15));
  console.log('TOTAL LENGTH:', content.length);
});
