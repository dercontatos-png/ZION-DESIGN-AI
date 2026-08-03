const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

// I will insert them right after const [zoomPercent, setZoomPercent] = useState<number>(100);
const hookPoint = 'const [zoomPercent, setZoomPercent] = useState<number>(100);';

const handlers = `
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handlePanStart = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };
  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };
  const handlePanEnd = () => setIsPanning(false);
`;

code = code.replace(hookPoint, hookPoint + '\n' + handlers);
fs.writeFileSync('src/components/DesignBuilder.tsx', code);
