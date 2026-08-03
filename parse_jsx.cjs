const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// The chunk we injected is broken. Let's find out where it broke.
// We injected newRightColumn, which had canvasCode, masonryCode, extrasCode.
// Let's check paren/brace matching in canvasCode!
