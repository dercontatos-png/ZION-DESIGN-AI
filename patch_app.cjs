const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('import Agentes from "./components/Agentes";')) {
  code = code.replace(
    'import DesignBuilder from "./components/DesignBuilder";',
    'import DesignBuilder from "./components/DesignBuilder";\nimport Agentes from "./components/Agentes";'
  );
}

if (!code.includes('<SidebarItemMini icon={<Layers size={20} />} active={activeTab === "agents"} onClick={() => setActiveTab("agents")} tooltip="Agentes" />')) {
  code = code.replace(
    '<SidebarItemMini icon={<Sparkles size={20} />} active={activeTab === "ai-tools"} onClick={() => { setActiveTab("ai-tools"); setActiveAiTab("image"); }} tooltip="Criar" />',
    '<SidebarItemMini icon={<Layers size={20} />} active={activeTab === "agents"} onClick={() => setActiveTab("agents")} tooltip="Agentes" />\n            <SidebarItemMini icon={<Sparkles size={20} />} active={activeTab === "ai-tools"} onClick={() => { setActiveTab("ai-tools"); setActiveAiTab("image"); }} tooltip="Criar" />'
  );
}

if (!code.includes('active={activeTab === "agents"}')) {
  // Mobile sidebar 
  code = code.replace(
    '<SidebarItem icon={<Sparkles size={20} />} label="Criar" active={activeTab === "ai-tools"} onClick={() => { setActiveTab("ai-tools"); setActiveAiTab("image"); setIsMobileMenuOpen(false); }} />',
    '<SidebarItem icon={<Layers size={20} />} label="Agentes" active={activeTab === "agents"} onClick={() => { setActiveTab("agents"); setIsMobileMenuOpen(false); }} />\n                <SidebarItem icon={<Sparkles size={20} />} label="Criar" active={activeTab === "ai-tools"} onClick={() => { setActiveTab("ai-tools"); setActiveAiTab("image"); setIsMobileMenuOpen(false); }} />'
  );
}

if (!code.includes('activeTab === "agents" && (')) {
  code = code.replace(
    '{activeTab === "ai-tools" && (',
    '{activeTab === "agents" && (\n            <Agentes />\n          )}\n\n          {activeTab === "ai-tools" && ('
  );
}

fs.writeFileSync('src/App.tsx', code);
