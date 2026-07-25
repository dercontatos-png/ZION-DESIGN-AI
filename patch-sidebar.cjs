const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
const statePattern = 'const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);';
const stateReplacement = 'const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);\n  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);';
if (code.includes(statePattern)) {
    code = code.replace(statePattern, stateReplacement);
} else {
    console.log("State pattern not found!");
}

// 2. Change hamburger menu button
const hamburgerPattern = `<button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-white/5"
            aria-label="Abrir menu"
          >`;
const hamburgerReplacement = `<button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setIsDesktopSidebarOpen(true);
              } else {
                setIsMobileSidebarOpen(true);
              }
            }}
            className={\`\${isDesktopSidebarOpen ? 'lg:hidden' : ''} text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-white/5\`}
            aria-label="Abrir menu"
          >`;
if (code.includes(hamburgerPattern)) {
    code = code.replace(hamburgerPattern, hamburgerReplacement);
} else {
    console.log("Hamburger pattern not found!");
}

// 3. Change desktop sidebar aside className
const asidePattern = '<aside className="hidden lg:flex w-64 bg-[#09090b] border-r border-white/5 flex-col py-5 px-3.5 flex-shrink-0 overflow-y-auto custom-scrollbar h-full justify-between">';
const asideReplacement = '<aside className={`hidden ${isDesktopSidebarOpen ? \'lg:flex\' : \'lg:hidden\'} w-64 bg-[#09090b] border-r border-white/5 flex-col py-5 px-3.5 flex-shrink-0 overflow-y-auto custom-scrollbar h-full justify-between`}>';
if (code.includes(asidePattern)) {
    code = code.replace(asidePattern, asideReplacement);
} else {
    console.log("Aside pattern not found!");
}

// 4. Add close button in sidebar footer
const footerPattern = `<SidebarItem
              icon={<Settings size={16} />}
              label="Configurações"
              active={false}
              onClick={() => setIsSettingsModalOpen(true)}
            />
          </div>`;
const footerReplacement = `<SidebarItem
              icon={<Settings size={16} />}
              label="Configurações"
              active={false}
              onClick={() => setIsSettingsModalOpen(true)}
            />
            <button
              onClick={() => setIsDesktopSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all w-full mt-2 cursor-pointer"
            >
              <div className="w-5 flex justify-center"><ChevronLeft size={16} /></div>
              <span className="text-xs font-bold tracking-wide">Recolher Menu</span>
            </button>
          </div>`;
if (code.includes(footerPattern)) {
    code = code.replace(footerPattern, footerReplacement);
} else {
    console.log("Footer pattern not found!");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Sidebar patched successfully!");
