const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const oldStr = `  const [isDropdownOpen, setIsDropdownOpen] = useState(false);`;
const newStr = `  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);`;

code = code.split(oldStr).join(newStr);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
