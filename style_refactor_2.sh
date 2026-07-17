#!/bin/bash
sed -i -E 's/rounded-2xl/rounded-xl/g' src/components/ClientPortal.tsx
sed -i -E 's/rounded-3xl/rounded-xl/g' src/components/ClientPortal.tsx
sed -i -E 's/rounded-2xl/rounded-xl/g' src/App.tsx
sed -i -E 's/rounded-3xl/rounded-xl/g' src/App.tsx

sed -i -E 's/p-4 /p-8 /g' src/App.tsx src/components/ClientPortal.tsx
sed -i -E 's/p-5 /p-8 /g' src/App.tsx src/components/ClientPortal.tsx
sed -i -E 's/p-6 /p-8 /g' src/App.tsx src/components/ClientPortal.tsx
