const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add PinterestViewer import
if (!code.includes('import { PinterestViewer }')) {
  code = code.replace(
    /import DesignBuilder from "\.\/components\/DesignBuilder";/,
    `import DesignBuilder from "./components/DesignBuilder";\nimport { PinterestViewer } from "./components/PinterestViewer";`
  );
}

// Add the SidebarItemMini for PinterestViewer
code = code.replace(
  /<SidebarItemMini icon=\{<Sparkles size=\{20\} \/>\} active=\{activeTab === "ai-tools"\} onClick=\{[^]+?\} tooltip="Criar" \/>/,
  `$&
            <SidebarItemMini icon={<Globe size={20} />} active={activeTab === "referencias"} onClick={() => setActiveTab("referencias")} tooltip="Referências" />`
);

// Add the SidebarItem for Mobile
code = code.replace(
  /<SidebarItem\s+icon=\{<Sparkles size=\{16\} \/>\}\s+label="Criar com IA"[\s\S]+?\} \/>/,
  `$&
                  <SidebarItem
                    icon={<Globe size={16} />}
                    label="Referências"
                    active={activeTab === "referencias"}
                    onClick={() => {
                      setActiveTab("referencias");
                      setIsMobileSidebarOpen(false);
                    }}
                  />`
);

// Add the main content view
code = code.replace(
  /\{activeTab === "ai-tools" && \([\s\S]+?\}\)/,
  `$&

          {/* View: Referências */}
          {activeTab === "referencias" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto h-full flex flex-col w-full pb-8"
            >
              <PinterestViewer />
            </motion.div>
          )}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
