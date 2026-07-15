const fs = require('fs');
let code = fs.readFileSync('src/store/useProjectStore.ts', 'utf-8');

code = code.replace(
  /return \{ \.\.\.updates, projectsList: updatedProjects \};/,
  'return { ...updates, projectsList: updatedProjects, lastGeneratedPrompt: "" };'
);

fs.writeFileSync('src/store/useProjectStore.ts', code);
