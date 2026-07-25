const fs = require('fs');
let code = fs.readFileSync('src/components/PinterestViewer.tsx', 'utf8');

code = code.replace(
  /const fetchBoards = async \(\) => \{/g,
  `const handleConnect = async () => {
    try {
      const res = await fetch("/api/pinterest/auth");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao obter URL de autenticação");

      const authWindow = window.open(data.url, 'pinterest_oauth', 'width=600,height=700');
      if (!authWindow) {
        setError("Por favor, permita popups neste site para conectar sua conta.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'PINTEREST_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem("pinterest_access_token", event.data.token);
        setToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchBoards = async () => {`
);

code = code.replace(
  /<a\s+href="\/api\/pinterest\/auth"\s+className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"\s*>\s*<LogIn className="w-4 h-4" \/>\s*Autorizar Pinterest\s*<\/a>/,
  `<button
          onClick={handleConnect}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Autorizar Pinterest
        </button>`
);

fs.writeFileSync('src/components/PinterestViewer.tsx', code);
console.log("PinterestViewer.tsx OAuth popup logic applied.");
