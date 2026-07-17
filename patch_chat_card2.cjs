const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(/if \(updates && updates\.useEnvRef === false\) \{\} else \{ store\.updateConfig\(\{ useEnvRef: true \}\); \}/g, 
  "if (updates && updates.useEnvRef !== undefined) { store.updateConfig({ useEnvRef: updates.useEnvRef }); } else { store.updateConfig({ useEnvRef: true }); }");

code = code.replace(/if \(updates && updates\.enableTypography === false\) \{\} else \{ store\.updateConfig\(\{ enableTypography: true \}\); \}/g,
  "if (updates && updates.enableTypography !== undefined) { store.updateConfig({ enableTypography: updates.enableTypography }); } else { store.updateConfig({ enableTypography: true }); }");

code = code.replace(/if \(updates && updates\.enableEstiloVisual === false\) \{ store\.updateConfig\(\{ estiloVisualCustom: cardStyleDesc \}\); \} else \{ store\.updateConfig\(\{ enableEstiloVisual: true, estiloVisualCustom: cardStyleDesc \}\); \}/g,
  "if (updates && updates.enableEstiloVisual !== undefined) { store.updateConfig({ enableEstiloVisual: updates.enableEstiloVisual, estiloVisualCustom: cardStyleDesc }); } else { store.updateConfig({ enableEstiloVisual: true, estiloVisualCustom: cardStyleDesc }); }");

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
