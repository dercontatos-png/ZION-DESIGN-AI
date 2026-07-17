#!/bin/bash
sed -i -E 's/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-4/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-8/g' src/App.tsx
sed -i -E 's/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-5/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-8/g' src/App.tsx
sed -i -E 's/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-6/bg-\[#0b0b0c\] border border-white\/5 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\] rounded-xl p-8/g' src/App.tsx
sed -i -E 's/bg-\[#0b0b0c\] border border-white\/5 rounded-xl p-4 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\]/bg-\[#0b0b0c\] border border-white\/5 rounded-xl p-8 shadow-\[0_4px_6px_-1px_rgba\(0,0,0,0\.3\)\]/g' src/App.tsx
