const fs = require('fs');
let code = fs.readFileSync('src/components/GeradorRoteiros.tsx', 'utf8');

// Replace import
code = code.replace(
  'import { useClientStore } from "../store/useClientStore";',
  'import { Client } from "../types";'
);

// Replace component signature and state
code = code.replace(
  'export function GeradorRoteiros() {',
  \`export function GeradorRoteiros({ clients, setClients }: { clients: Client[], setClients: (clients: Client[]) => void }) {\`
);

code = code.replace(
  '  const { clients, activeClientId, setActiveClient, appendAiLearnings } = useClientStore();',
  \`  const [activeClientId, setActiveClient] = useState<number | null>(null);

  const appendAiLearnings = (id: number, text: string) => {
    setClients(clients.map(c => 
      c.id === id 
        ? { ...c, bancoDeDadosIA: c.bancoDeDadosIA ? \`\${c.bancoDeDadosIA}\\n\\n[Nova Interação]: \${text}\` : \`[Nova Interação]: \${text}\` }
        : c
    ));
  };\`
);

fs.writeFileSync('src/components/GeradorRoteiros.tsx', code);
