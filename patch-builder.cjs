const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// Add Pinterest tab to the header navigation
code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveMenuTab\("Ref Builder"\)\}([\s\S]*?)<\/button>/g,
  (match) => {
    return match + `
              <button
                onClick={() => setActiveMenuTab("Pinterest")}
                className={\`flex items-center gap-2 px-5 py-3 border-b-2 font-medium transition-colors \${
                  activeMenuTab === "Pinterest"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }\`}
              >
                <FolderOpen className="w-4 h-4" />
                Pinterest
              </button>`;
  }
);

// Add Pinterest content area
const pinterestContent = `
          {activeMenuTab === "Pinterest" && (
            <div className="flex-1 overflow-hidden p-4 md:p-8">
              <PinterestViewer />
            </div>
          )}
`;

code = code.replace(
  /\{activeMenuTab === "Ref Builder" && \([\s\S]*?\)\}/,
  (match) => {
    return match + pinterestContent;
  }
);

// Import PinterestViewer
if (!code.includes('import { PinterestViewer }')) {
  code = code.replace(
    /import \{ ExportModal \} from "\.\/ExportModal";/,
    `import { ExportModal } from "./ExportModal";\nimport { PinterestViewer } from "./PinterestViewer";`
  );
}

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("DesignBuilder.tsx patched with Pinterest tab.");
