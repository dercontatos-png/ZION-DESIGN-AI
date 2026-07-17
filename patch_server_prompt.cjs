const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Ensure that ALL elements from the reference are copied unless explicitly negated
const regexSuffix = /=== ABSOLUTE CRITICAL CONSTRAINTS \(MANDATORY\) ===/g;
const replacementSuffix = `=== ABSOLUTE CRITICAL CONSTRAINTS (MANDATORY) ===
- TOTAL FIDELITY & ZERO OMISSIONS (CRITICAL): If a Design Layout Reference is provided, you MUST perfectly clone EVERYTHING from it (the layout, the spatial positioning of texts, the graphic elements, the background, the subject pose/lighting). You MUST put the texts EXACTLY in the same spatial locations as they are in the reference. DO NOT skip any text fields. Replicate the exact typography hierarchy.`;

code = code.replace(regexSuffix, replacementSuffix);
fs.writeFileSync('server.ts', code);
