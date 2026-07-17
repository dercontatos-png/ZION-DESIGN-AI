const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// The sidebar starts here:
const sidebarStart = code.indexOf('{/* COLUNA 1: SIDEBAR ESQUERDA');
// The right content (which includes the topbar) starts here:
const contentStart = code.indexOf('{/* CONTEÚDO DA DIREITA (HEADER + ESPAÇO CORE WORKSPACE) */}');

// Let's replace everything from sidebarStart to contentStart + div + topbar + </div>
// Wait, it's easier to just do it via exact string replacement.
