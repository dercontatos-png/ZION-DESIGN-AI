const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const desktopSidebarOriginal = `              <SidebarItem
                icon={<Tv size={16} />}
                label="Gerador de GCs"
                active={activeTab === "gc-tv"}
                onClick={() => setActiveTab("gc-tv")}
              />`;

const desktopSidebarReplacement = `              <SidebarItem
                icon={<Tv size={16} />}
                label="Gerador de GCs"
                active={activeTab === "gc-tv"}
                onClick={() => setActiveTab("gc-tv")}
              />
              <SidebarItem
                icon={<Music size={16} />}
                label="Áudio & Efeitos"
                active={activeTab === "audio"}
                onClick={() => setActiveTab("audio")}
              />`;

code = code.replace(desktopSidebarOriginal, desktopSidebarReplacement);

const mobileSidebarOriginal = `                  <SidebarItem
                    icon={<Tv size={16} />}
                    label="Gerador de GCs"
                    active={activeTab === "gc-tv"}
                    onClick={() => {
                      setActiveTab("gc-tv");
                      setIsMobileSidebarOpen(false);
                    }}
                  />`;

const mobileSidebarReplacement = `                  <SidebarItem
                    icon={<Tv size={16} />}
                    label="Gerador de GCs"
                    active={activeTab === "gc-tv"}
                    onClick={() => {
                      setActiveTab("gc-tv");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<Music size={16} />}
                    label="Áudio & Efeitos"
                    active={activeTab === "audio"}
                    onClick={() => {
                      setActiveTab("audio");
                      setIsMobileSidebarOpen(false);
                    }}
                  />`;

code = code.replace(mobileSidebarOriginal, mobileSidebarReplacement);

fs.writeFileSync('src/App.tsx', code);
