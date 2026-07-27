const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The messed up part looks like this:
/*
              <SidebarItem
                icon={<Wand2 size={16} />}
                label="Chat com IA"
              <SidebarItem
                icon={<FileText size={16} />}
                label="Gerador Roteiros"
                active={activeTab === "roteiros"}
                onClick={() => setActiveTab("roteiros")}
              />
                active={activeTab === "copiloto"}
                onClick={() => setActiveTab("copiloto")}
              />
*/

// Let's do a replace
code = code.replace(
\`              <SidebarItem
                icon={<Wand2 size={16} />}
                label="Chat com IA"
              <SidebarItem
                icon={<FileText size={16} />}
                label="Gerador Roteiros"
                active={activeTab === "roteiros"}
                onClick={() => setActiveTab("roteiros")}
              />
                active={activeTab === "copiloto"}
                onClick={() => setActiveTab("copiloto")}
              />\`, 
\`              <SidebarItem
                icon={<Wand2 size={16} />}
                label="Chat com IA"
                active={activeTab === "copiloto"}
                onClick={() => setActiveTab("copiloto")}
              />
              <SidebarItem
                icon={<FileText size={16} />}
                label="Gerador Roteiros"
                active={activeTab === "roteiros"}
                onClick={() => setActiveTab("roteiros")}
              />\`);

code = code.replace(
\`                  <SidebarItem
                    icon={<Wand2 size={16} />}
                    label="Chat com IA"
              <SidebarItem
                icon={<FileText size={16} />}
                label="Gerador Roteiros"
                active={activeTab === "roteiros"}
                onClick={() => setActiveTab("roteiros")}
              />
                    active={activeTab === "copiloto"}
                    onClick={() => {
                      setActiveTab("copiloto");
                      setIsMobileSidebarOpen(false);
                    }}
                  />\`, 
\`                  <SidebarItem
                    icon={<Wand2 size={16} />}
                    label="Chat com IA"
                    active={activeTab === "copiloto"}
                    onClick={() => {
                      setActiveTab("copiloto");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<FileText size={16} />}
                    label="Gerador Roteiros"
                    active={activeTab === "roteiros"}
                    onClick={() => {
                      setActiveTab("roteiros");
                      setIsMobileSidebarOpen(false);
                    }}
                  />\`);

fs.writeFileSync('src/App.tsx', code);
