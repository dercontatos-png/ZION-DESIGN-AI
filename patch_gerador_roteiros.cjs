const fs = require('fs');
let code = fs.readFileSync('src/components/GeradorRoteiros.tsx', 'utf8');

const target1 = `  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);`;
const replacement1 = `  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-pro-preview");`;
code = code.replace(target1, replacement1);

const target2 = `          // customApiKey removido para forçar o uso do Vertex no servidor
          modelId: "gemini-3.6-flash"`;
const replacement2 = `          // customApiKey removido para forçar o uso do Vertex no servidor
          modelId: selectedModel`;
code = code.replace(target2, replacement2);

const target3 = `        {/* Client Selector */}
        <div className="relative">`;
const replacement3 = `        <div className="flex items-center gap-3">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-zinc-900 border border-white/10 hover:border-[#c5a880]/50 text-zinc-300 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
          </select>

        {/* Client Selector */}
        <div className="relative">`;
code = code.replace(target3, replacement3);

const target4 = `          </AnimatePresence>
        </div>
      </div>`;
const replacement4 = `          </AnimatePresence>
        </div>
        </div>
      </div>`;
code = code.replace(target4, replacement4);

fs.writeFileSync('src/components/GeradorRoteiros.tsx', code);
