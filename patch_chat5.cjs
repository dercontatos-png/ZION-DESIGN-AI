const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

// fix useEnvRef
code = code.replace(/store\.updateConfig\(\{ useEnvRef: true \}\);/g, `if (updates && updates.useEnvRef === false) {} else { store.updateConfig({ useEnvRef: true }); }`);

// fix enableEstiloVisual
code = code.replace(/store\.updateConfig\(\{ enableEstiloVisual: true, estiloVisualCustom: cardStyleDesc \}\);/g, `if (updates && updates.enableEstiloVisual === false) { store.updateConfig({ estiloVisualCustom: cardStyleDesc }); } else { store.updateConfig({ enableEstiloVisual: true, estiloVisualCustom: cardStyleDesc }); }`);

// fix enableTypography
code = code.replace(/store\.updateConfig\(\{ enableTypography: true \}\);/g, `if (updates && updates.enableTypography === false) {} else { store.updateConfig({ enableTypography: true }); }`);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
