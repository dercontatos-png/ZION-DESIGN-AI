const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexInclusion = /const logoInclusionRule = logoBase64 \? /g;
const replacementInclusion = `const hasLogo = !!logoBase64 || (logosList && logosList.length > 0);\n        const logoInclusionRule = hasLogo ? `;
code = code.replace(regexInclusion, replacementInclusion);

const regexComposition = /const logoCompositionRule = logoBase64 \? /g;
const replacementComposition = `const logoCompositionRule = hasLogo ? `;
code = code.replace(regexComposition, replacementComposition);

code = code.replace(/const logoPromptRule = logosList && logosList\.length > 0 \?/g, `const logoPromptRule = hasLogo ?`);
code = code.replace(/const logoPrintRule = logosList && logosList\.length > 0 \?/g, `const logoPrintRule = hasLogo ?`);
code = code.replace(/const logoSysInstructionRule = logosList && logosList\.length > 0 \?/g, `const logoSysInstructionRule = hasLogo ?`);
code = code.replace(/const logoEmbeddedRule = logosList && logosList\.length > 0 \?/g, `const logoEmbeddedRule = hasLogo ?`);

code = code.replace(/const logoMandatoryRule = logosList && logosList\.length > 0/g, `const logoMandatoryRule = logoBase64 || (logosList && logosList.length > 0)`);

fs.writeFileSync('server.ts', code);
