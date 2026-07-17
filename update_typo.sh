#!/bin/bash

# In App.tsx

# CRM Cards
sed -i -E 's/text-\[10px\] uppercase font-bold text-zinc-500 block break-words leading-tight/text-sm font-bold text-white block break-words leading-tight/g' src/App.tsx
sed -i -E 's/text-\[10px\] uppercase font-bold text-emerald-500 block break-words leading-tight/text-sm font-bold text-white block break-words leading-tight/g' src/App.tsx
sed -i -E 's/text-\[10px\] uppercase font-bold text-blue-400 block break-words leading-tight/text-sm font-bold text-white block break-words leading-tight/g' src/App.tsx
sed -i -E 's/text-\[10px\] uppercase font-bold text-\[#c5a880\] block break-words leading-tight/text-sm font-bold text-white block break-words leading-tight/g' src/App.tsx

# Finanças Cards
sed -i -E 's/text-\[10px\] sm:text-xs font-bold uppercase tracking-wider break-words leading-tight pr-2/text-sm font-bold text-white block break-words leading-tight mb-1 pr-2/g' src/App.tsx

# Values in cards -> secondary text
sed -i -E 's/text-xl sm:text-2xl font-black text-white/text-xl sm:text-2xl font-medium text-zinc-400/g' src/App.tsx
sed -i -E 's/text-xl sm:text-2xl font-black text-\[#c5a880\]/text-xl sm:text-2xl font-medium text-zinc-400/g' src/App.tsx

# In ClientPortal.tsx

# Titles
sed -i -E 's/text-\[10px\] uppercase font-bold text-zinc-500 block tracking-wider/text-sm font-bold text-white block tracking-wider mb-1/g' src/components/ClientPortal.tsx

# Values
sed -i -E 's/text-lg font-black text-white mt-1.5/text-lg font-medium text-zinc-400 mt-1.5/g' src/components/ClientPortal.tsx
sed -i -E 's/text-2xl font-black text-white mt-1.5/text-2xl font-medium text-zinc-400 mt-1.5/g' src/components/ClientPortal.tsx
sed -i -E 's/text-xs text-\[#c5a880\] mt-1 block font-semibold/text-xs text-zinc-500 mt-1 block font-medium/g' src/components/ClientPortal.tsx

