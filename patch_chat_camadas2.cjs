const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const regex = /const newLayers = configJson\.camadasTexto\.map\(\(item: any, idx: number\) => \(\{[\s\S]*?\}\)\);/;

// We already patched this, but in case there is a similar block for fallback.
