const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace bg-purple-x 
    content = content.replace(/bg-purple-\d+\/(\d+)/g, 'bg-[#c5a880]/$1');
    content = content.replace(/bg-purple-\d+/g, 'bg-[#c5a880]');
    
    // Replace text-purple-x
    content = content.replace(/text-purple-\d+\/(\d+)/g, 'text-[#c5a880]/$1');
    content = content.replace(/text-purple-\d+/g, 'text-[#c5a880]');

    // Replace border-purple-x
    content = content.replace(/border-purple-\d+\/(\d+)/g, 'border-[#c5a880]/$1');
    content = content.replace(/border-purple-\d+/g, 'border-[#c5a880]');
    
    // Gradient replace
    content = content.replace(/from-purple-\d+/g, 'from-[#c5a880]');
    content = content.replace(/via-purple-\d+/g, 'via-[#c5a880]');
    content = content.replace(/to-purple-\d+/g, 'to-[#c5a880]');
    
    content = content.replace(/from-indigo-500 via-\[#c5a880\] to-pink-500/g, 'from-[#c5a880] via-[#d5b890] to-[#e5c8a0]');
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

const dir = 'src/components';
const files = fs.readdirSync(dir);
files.forEach(file => {
    if (file.endsWith('.tsx')) {
        replaceInFile(path.join(dir, file));
    }
});
replaceInFile('src/App.tsx');

console.log("Replaced all purple classes with #c5a880!");
