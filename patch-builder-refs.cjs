const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// Replace Pinterest tab with Referências
code = code.replace(
  /setActiveMenuTab\("Pinterest"\)/g,
  'setActiveMenuTab("Referências")'
);

code = code.replace(
  /activeMenuTab === "Pinterest"/g,
  'activeMenuTab === "Referências"'
);

code = code.replace(
  />\s*Pinterest\s*<\/button>/g,
  '> Referências </button>'
);

// Replace component
code = code.replace(
  /<PinterestViewer \/>/g,
  '<ReferencesViewer />'
);

// Replace import
code = code.replace(
  /import \{ PinterestViewer \} from "\.\/PinterestViewer";/,
  'import { ReferencesViewer } from "./ReferencesViewer";'
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Patched DesignBuilder to use ReferencesViewer");
