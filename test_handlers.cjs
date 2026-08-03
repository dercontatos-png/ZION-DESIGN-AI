const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// I will remove the pan handlers from the img tag.
code = code.replace(/onMouseDown=\{handlePanStart\}/g, '');
code = code.replace(/onMouseMove=\{handlePanMove\}/g, '');
code = code.replace(/onMouseUp=\{handlePanEnd\}/g, '');
code = code.replace(/onMouseLeave=\{handlePanEnd\}/g, '');
code = code.replace(/cursor: isPanning \? 'grabbing' : 'grab'/g, "cursor: 'default'");

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
