const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const oldText = `- Explicitly instruct the AI generator NEVER to add text, letters, logos, watermarks, or typography inside the graphic. The base image must be perfectly clean and ready to receive typography overlays in post-production.\`;`;

const newText = `- Explicitly instruct the AI generator to EXACTLY replicate and embed any text, titles, words, numbers, and the provided logo directly into the image canvas. The generator MUST perfectly bake the text and logo into the graphic, rendering it in a beautiful, modern, high-contrast style that perfectly matches the reference layout. Color adaptation of the logo for better contrast is highly encouraged (e.g. converting a dark logo to white for a dark flyer), but shapes and fonts must not be altered.\`;`;

code = code.replace(oldText, newText);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
