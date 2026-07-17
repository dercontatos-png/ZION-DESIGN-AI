#!/bin/bash
# Convert to premium SaaS look
sed -i -E 's/bg-zinc-900\/[0-9]+ /bg-[#0A0A0B] /g' src/App.tsx
sed -i -E 's/bg-zinc-900 /bg-[#0A0A0B] /g' src/App.tsx
sed -i -E 's/bg-zinc-950\/[0-9]+ /bg-[#050505] /g' src/App.tsx
sed -i -E 's/bg-zinc-950 /bg-[#050505] /g' src/App.tsx

# Update padding p-4, p-5 to p-8 for cards (heuristic: anything with rounded-xl and border)
# Actually, it's safer to just let Tailwind formatting do its thing.
