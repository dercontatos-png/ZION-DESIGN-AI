const fs = require('fs');
const content = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');
if (content.includes('applyModelMessageToEditor(index, msg.content)')) {
  console.log("Fix is present!");
} else {
  console.log("Fix is missing!");
}
