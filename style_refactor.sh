#!/bin/bash

# Update backgrounds
sed -i -E 's/bg-\[#0A0A0B\]/bg-\[#0b0b0c\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx

# Update shadows
sed -i -E 's/shadow-xl shadow-black\/40/shadow-\[0_4px_6px_-1px_rgba(0,0,0,0.3)\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx

# Update golden accents
sed -i -E 's/text-amber-500/text-\[#c5a880\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
sed -i -E 's/bg-amber-500/bg-\[#c5a880\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
sed -i -E 's/border-amber-500/border-\[#c5a880\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
sed -i -E 's/text-amber-400/text-\[#c5a880\]/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
sed -i -E 's/bg-amber-400/bg-\[#c5a880\]\/80/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx

# Update specific hex golden accents if any
sed -i -E 's/#c99b3b/#c5a880/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
sed -i -E 's/#b5872c/#b39873/g' src/App.tsx src/components/ClientPortal.tsx src/components/DesignBuilder.tsx
