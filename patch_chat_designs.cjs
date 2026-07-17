const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  /let logCount = 0;\s*let newLogos: string\[\] = \[\];/,
  `let logCount = 0;
    let newLogos: string[] = [];
    let desCount = 0;
    let newDesigns: string[] = [];`
);

code = code.replace(
  /\} else if \(textLower\.includes\("cenário"\) \|\| textLower\.includes\("background"\) \|\| textLower\.includes\("cenario"\) \|\| textLower\.includes\("ambiente"\) \|\| textLower\.includes\("scene"\) \|\| textLower\.includes\("fundo"\)\) \{\s*targetType = "scene";\s*\}/,
  `} else if (textLower.includes("cenário") || textLower.includes("background") || textLower.includes("cenario") || textLower.includes("ambiente") || textLower.includes("scene") || textLower.includes("fundo")) {
            targetType = "scene";
          } else if (textLower.includes("layout") || textLower.includes("design") || textLower.includes("referência principal")) {
            targetType = "design";
          }`
);

code = code.replace(
  /\} else if \(targetType === "logo"\) \{\s*newLogos\.push\(rawBase64\);\s*logCount\+\+;\s*\} else \{/,
  `} else if (targetType === "logo") {
            newLogos.push(rawBase64);
            logCount++;
          } else if (targetType === "design") {
            newDesigns.push(rawBase64);
            desCount++;
          } else {`
);

code = code.replace(
  /if \(logCount > 0\) \{\s*const currentList = isReplaceMode \? \[\] : \(store\.logosList \|\| \[\]\);\s*store\.setLogosList\(\[\.\.\.currentList, \.\.\.newLogos\]\);\s*store\.updateConfig\(\{ useLogo: true \}\);\s*filledItems\.push\(\`\$\{logCount\} Logo\(s\)\`\);\s*\}/,
  `if (logCount > 0) {
          const currentList = isReplaceMode ? [] : (store.logosList || []);
          store.setLogosList([...currentList, ...newLogos]);
          store.updateConfig({ useLogo: true });
          filledItems.push(\`\${logCount} Logo(s)\`);
        }
        
        if (desCount > 0) {
          const currentList = isReplaceMode ? [] : (store.designRefsList || []);
          store.setDesignRefsList([...currentList, ...newDesigns]);
          filledItems.push(\`\${desCount} Design(s)\`);
        }`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Designs patched in ChatAssistente!");
