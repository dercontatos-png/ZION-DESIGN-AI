const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DATA_DIR = 'C:\\Users\\TVChapada\\Downloads\\ZION-DESIGN-AI-main\\Instagram_files';

async function main() {
  console.log('--- Analisando dataset Instagram_files ---');
  const files = fs.readdirSync(DATA_DIR);
  console.log(`Total de arquivos: ${files.length}`);

  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const csvFiles = files.filter(f => f.endsWith('.csv'));
  const jpgFiles = files.filter(f => f.endsWith('.jpg'));
  const webpFiles = files.filter(f => f.endsWith('.webp'));
  const mp4Files = files.filter(f => f.endsWith('.mp4'));

  console.log(`JSONs: ${jsonFiles.length}, CSVs: ${csvFiles.length}, JPGs: ${jpgFiles.length}, WEBPs: ${webpFiles.length}, MP4s: ${mp4Files.length}`);

  // Analisar posts em todos os JSONs
  const postsMap = new Map();
  const captions = [];
  const hashtagsCount = {};

  for (const jf of jsonFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, jf), 'utf-8'));
      if (content.data && content.data.posts) {
        for (const post of content.data.posts) {
          if (!postsMap.has(post.id)) {
            postsMap.set(post.id, post);
            if (post.caption) {
              captions.push(post.caption);
              const tags = post.caption.match(/#[a-zA-Z0-9_\u00C0-\u017F]+/g) || [];
              tags.forEach(t => {
                const lower = t.toLowerCase();
                hashtagsCount[lower] = (hashtagsCount[lower] || 0) + 1;
              });
            }
          }
        }
      }
    } catch (e) {
      // ignore parse error
    }
  }

  console.log(`Total de posts únicos encontrados nos JSONs: ${postsMap.size}`);
  
  // Top hashtags
  const sortedTags = Object.entries(hashtagsCount).sort((a, b) => b[1] - a[1]).slice(0, 30);
  console.log('\n--- TOP 30 HASHTAGS / NICHOS ---');
  sortedTags.forEach(([tag, count]) => console.log(`${tag}: ${count}`));

  // Analisar amostra das imagens JPG
  console.log('\n--- Analisando dimensões e proporções de uma amostra de 200 imagens ---');
  const sampleImages = jpgFiles.slice(0, 200);
  const dimensionsCount = {};
  const aspectRatios = { '1:1': 0, '4:5': 0, '9:16': 0, '16:9': 0, 'other': 0 };

  for (const imgName of sampleImages) {
    try {
      const imgPath = path.join(DATA_DIR, imgName);
      const meta = await sharp(imgPath).metadata();
      const key = `${meta.width}x${meta.height}`;
      dimensionsCount[key] = (dimensionsCount[key] || 0) + 1;

      const ratio = meta.width / meta.height;
      if (Math.abs(ratio - 1.0) < 0.05) aspectRatios['1:1']++;
      else if (Math.abs(ratio - 0.8) < 0.05) aspectRatios['4:5']++;
      else if (Math.abs(ratio - 0.5625) < 0.05) aspectRatios['9:16']++;
      else if (Math.abs(ratio - 1.777) < 0.05) aspectRatios['16:9']++;
      else aspectRatios['other']++;
    } catch (err) {
      // ignore
    }
  }

  console.log('Aspect Ratios:', aspectRatios);
  console.log('Top Dimensões:', Object.entries(dimensionsCount).sort((a,b) => b[1] - a[1]).slice(0, 10));

  // Procurar posts que mencionam "prompt", "ia", "midjourney"
  console.log('\n--- Posts com menções a IA / Prompts ---');
  let aiPostsCount = 0;
  for (const [id, post] of postsMap.entries()) {
    if (post.caption && (post.caption.toLowerCase().includes('prompt') || post.caption.toLowerCase().includes('ia') || post.caption.toLowerCase().includes('midjourney'))) {
      aiPostsCount++;
      if (aiPostsCount <= 5) {
        console.log(`\nPost ID ${id} (${post.code || ''}):`);
        console.log(post.caption.substring(0, 300) + '...');
      }
    }
  }
  console.log(`Total de posts mencionando IA/Prompts: ${aiPostsCount}`);
}

main().catch(console.error);
