const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import
code = code.replace(
  'import PhotoEditor from "./components/PhotoEditor";',
  'import PhotoEditor from "./components/PhotoEditor";\nimport AudioStudio from "./components/AudioStudio";'
);

// Sidebar icon
const sidebarAudio = `              <SidebarItem
                icon={<Tv size={18} />}
                label="GC TV / Tarjas"
                active={activeTab === "gc-tv"}
                onClick={() => {
                  setActiveTab("gc-tv");
                  setIsMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Music size={18} />}
                label="Áudio & Efeitos"
                active={activeTab === "audio"}
                onClick={() => {
                  setActiveTab("audio");
                  setIsMobileSidebarOpen(false);
                }}
              />`;

code = code.replace(
  `              <SidebarItem
                icon={<Tv size={18} />}
                label="GC TV / Tarjas"
                active={activeTab === "gc-tv"}
                onClick={() => {
                  setActiveTab("gc-tv");
                  setIsMobileSidebarOpen(false);
                }}
              />`,
  sidebarAudio
);

const miniSidebarAudio = `                  <SidebarItemMini
                    icon={<Tv size={20} />}
                    active={activeTab === "gc-tv"}
                    onClick={() => setActiveTab("gc-tv")}
                    tooltip="GC TV / Tarjas"
                  />
                  <SidebarItemMini
                    icon={<Music size={20} />}
                    active={activeTab === "audio"}
                    onClick={() => setActiveTab("audio")}
                    tooltip="Áudio & Efeitos"
                  />`;

code = code.replace(
  `                  <SidebarItemMini
                    icon={<Tv size={20} />}
                    active={activeTab === "gc-tv"}
                    onClick={() => setActiveTab("gc-tv")}
                    tooltip="GC TV / Tarjas"
                  />`,
  miniSidebarAudio
);

// Add missing icon import
code = code.replace(
  'Tv,',
  'Tv, Music,'
);

// Route render
const tabRender = `          {activeTab === "photo-editor" && (
            <PhotoEditor />
          )}
          {activeTab === "audio" && (
            <AudioStudio />
          )}`;

code = code.replace(
  `          {activeTab === "photo-editor" && (
            <PhotoEditor />
          )}`,
  tabRender
);

// Fix flex container classes
code = code.replace(
  'activeTab === "ai-tools" || activeTab === "roteiros" || activeTab === "photo-editor" ?',
  'activeTab === "ai-tools" || activeTab === "roteiros" || activeTab === "photo-editor" || activeTab === "audio" ?'
);

fs.writeFileSync('src/App.tsx', code);
