const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/\["gemini-1\.5-flash", "gemini-2\.0-flash", "gemini-1\.5-pro"\]/g, '["gemini-2.5-flash", "gemini-3.1-pro-preview", "gemini-3.6-flash"]');

// Also remove the "break" on 429 in the prompt expansion loop so it can fallback to the next model
code = code.replace(/if \\(expErr\\?\\.message\\?\\.includes\\("429"\\) \\|\\| expErr\\?\\.message\\?\\.includes\\("RESOURCE_EXHAUSTED"\\)\\) \{\\s*break;\\s*\\}/, '');

fs.writeFileSync('server.ts', code);
