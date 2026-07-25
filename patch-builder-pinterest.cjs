const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// Replace Top Tab for Referências to Pinterest
code = code.replace(
  /setActiveMenuTab\("Referências"\)/g,
  'setActiveMenuTab("Pinterest")'
);

code = code.replace(
  /activeMenuTab === "Referências"/g,
  'activeMenuTab === "Pinterest"'
);

code = code.replace(
  />\s*Referências\s*<\/button>/g,
  '> Pinterest </button>'
);

// Replace the content
code = code.replace(
  /<ReferencesViewer \/>/g,
  '<PinterestViewer />'
);

// Replace import
code = code.replace(
  /import \{ ReferencesViewer \} from "\.\/ReferencesViewer";/,
  'import { PinterestViewer } from "./PinterestViewer";'
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Patched DesignBuilder to use PinterestViewer");
