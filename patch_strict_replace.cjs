const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /- TEXT COMPLETENESS & PLACEMENT \(CRITICAL\): You MUST print ALL provided text fields, titles, and words exactly as requested\. DO NOT SKIP ANY TEXT\. You MUST place the text EXACTLY in the same spatial positions as the original text blocks found in the Design Layout Reference\. DO NOT put text in random places\. Replicate the original typographical hierarchy and alignment perfectly, but using the new text\./;
const replacement = `- STRICT REPLACEMENT & NO LEFTOVER INFO (CRITICAL): You MUST completely ERASE any existing logos, Instagram profiles (@handles), social media icons, or contact information that were originally in the Design Layout Reference. ONLY use the exact text, handles, and logos explicitly provided by the client in this prompt. Do not leave traces or hallucinate any of the original reference's handles or logos!
- TEXT COMPLETENESS & PLACEMENT (CRITICAL): You MUST print ALL provided text fields, titles, and words exactly as requested. DO NOT SKIP ANY TEXT. You MUST place the text EXACTLY in the same spatial positions as the original text blocks found in the Design Layout Reference. DO NOT put text in random places. Replicate the original typographical hierarchy and alignment perfectly, but using the new text.`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
