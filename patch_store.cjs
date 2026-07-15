const fs = require('fs');
let code = fs.readFileSync('src/store/useProjectStore.ts', 'utf-8');

if (!code.includes('chatDrawerOpen')) {
  code = code.replace(
    'setLastGeneratedPrompt: (p: string) => void;',
    'setLastGeneratedPrompt: (p: string) => void;\n  chatDrawerOpen: boolean;\n  chatActiveAssistantId: string | null;\n  setChatDrawerOpen: (isOpen: boolean) => void;\n  setChatActiveAssistantId: (id: string | null) => void;'
  );

  code = code.replace(
    'setLastSystemInstruction: (s) => set({ lastSystemInstruction: s }),',
    'setLastSystemInstruction: (s) => set({ lastSystemInstruction: s }),\n  chatDrawerOpen: false,\n  chatActiveAssistantId: null,\n  setChatDrawerOpen: (isOpen) => set({ chatDrawerOpen: isOpen }),\n  setChatActiveAssistantId: (id) => set({ chatActiveAssistantId: id }),'
  );
}

fs.writeFileSync('src/store/useProjectStore.ts', code);
