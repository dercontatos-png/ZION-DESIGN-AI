const fs = require('fs');
let code = fs.readFileSync('src/components/Agentes.tsx', 'utf-8');

if (!code.includes('useProjectStore')) {
  code = code.replace(
    'import { Search, Filter, Play } from "lucide-react";',
    'import { Search, Filter, Play } from "lucide-react";\nimport { useProjectStore } from "../store/useProjectStore";'
  );

  code = code.replace(
    'const [activeFilter, setActiveFilter] = useState("Todas ferramentas");',
    'const [activeFilter, setActiveFilter] = useState("Todas ferramentas");\n  const { setChatActiveAssistantId, setChatDrawerOpen } = useProjectStore();'
  );

  code = code.replace(
    '<div key={agent.id} className="group flex flex-col items-center text-center cursor-pointer">',
    '<div key={agent.id} className="group flex flex-col items-center text-center cursor-pointer" onClick={() => {\n            if (agent.id === "deep-work") {\n              window.open("https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", "_blank");\n            } else {\n              setChatActiveAssistantId(agent.id);\n              setChatDrawerOpen(true);\n            }\n          }}>'
  );
}

fs.writeFileSync('src/components/Agentes.tsx', code);
