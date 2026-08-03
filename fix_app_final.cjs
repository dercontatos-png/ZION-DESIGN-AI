const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Render AudioStudio
const oldRender = `          {activeTab === "photo-editor" && (
            <div className="h-full w-full bg-[#181818]">
              <PhotoEditor />
            </div>
          )}`;

const newRender = `          {activeTab === "photo-editor" && (
            <div className="h-full w-full bg-[#181818]">
              <PhotoEditor />
            </div>
          )}
          {activeTab === "audio" && (
            <div className="h-full w-full bg-[#111]">
              <AudioStudio />
            </div>
          )}`;

code = code.replace(oldRender, newRender);

// Remove duplicate sidebar items desktop
const doubleDesktop = `              <SidebarItem
                icon={<Music size={16} />}
                label="Áudio & Efeitos"
                active={activeTab === "audio"}
                onClick={() => setActiveTab("audio")}
              />
              <SidebarItem
                icon={<Music size={16} />}
                label="Áudio & Efeitos"
                active={activeTab === "audio"}
                onClick={() => setActiveTab("audio")}
              />`;
const singleDesktop = `              <SidebarItem
                icon={<Music size={16} />}
                label="Áudio & Efeitos"
                active={activeTab === "audio"}
                onClick={() => setActiveTab("audio")}
              />`;

code = code.replace(doubleDesktop, singleDesktop);

// Remove duplicate sidebar items mobile
const doubleMobile = `                  <SidebarItem
                    icon={<Music size={16} />}
                    label="Áudio & Efeitos"
                    active={activeTab === "audio"}
                    onClick={() => {
                      setActiveTab("audio");
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
const singleMobile = `                  <SidebarItem
                    icon={<Music size={16} />}
                    label="Áudio & Efeitos"
                    active={activeTab === "audio"}
                    onClick={() => {
                      setActiveTab("audio");
                      setIsMobileSidebarOpen(false);
                    }}
                  />`;

code = code.replace(doubleMobile, singleMobile);

fs.writeFileSync('src/App.tsx', code);
