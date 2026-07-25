const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Replace "Ref Builder" with "Pinterest"
code = code.replace(
  /\{ name: "Ref Builder", active: activeMenuTab === "Ref Builder" \},/g,
  '{ name: "Pinterest", active: activeMenuTab === "Pinterest" },'
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Sidebar patched to include Pinterest tab");
