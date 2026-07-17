const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const em = code.indexOf('{/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}');
const beforeEm = code.substring(0, em);
const afterEm = code.substring(em);

// Just inject two </div> before the Modal
const newCode = beforeEm + '\n      </div>\n      </div>\n' + afterEm;
fs.writeFileSync('src/components/DesignBuilder.tsx', newCode);
console.log("Fixed depth!");
