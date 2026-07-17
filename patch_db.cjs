const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(/useLogo: store\.useLogo,\n\s*logoBase64: store\.logoBase64,/, 'useLogo: store.useLogo,\n          logosList: store.logosList,\n          logoBase64: store.logoBase64,');

// Also update the UI to show the logo in preview!
const regexImg = /<img\n\s*src=\{activeImage\}\n\s*alt="Preview"\n\s*className="max-w-full max-h-\[70vh\] object-contain rounded-xl border border-white\/10 shadow-2xl select-none pointer-events-none"\n\s*\/>/g;

const replacementImg = `<img
                      src={activeImage}
                      alt="Preview"
                      className="max-w-full max-h-[70vh] object-contain rounded-xl border border-white/10 shadow-2xl select-none pointer-events-none"
                    />
                    {store.useLogo && store.logosList && store.logosList.length > 0 && (
                      <div className="absolute top-[5%] left-0 right-0 flex justify-center pointer-events-none select-none z-10">
                         <img src={store.logosList[0]} style={{ maxHeight: '15%' }} className="object-contain opacity-95 drop-shadow-2xl" alt="Logo Overlay" />
                      </div>
                    )}`;
code = code.replace(regexImg, replacementImg);

// Fix the UI text about the AI doing it:
const regexText = /A IA irá extrair e incorporar a logo original enviada diretamente na arte final\. A estrutura, fonte e formato serão preservados exatamente como na imagem fornecida \(apenas a cor poderá ser adaptada pela IA para garantir contraste, como mudar para branco ou preto\)\./g;
const replacementText = "A logo será sobreposta automaticamente na imagem final. O gerador não tentará recriar ou alterar a logo, mantendo 100% da fidelidade original.";
code = code.replace(regexText, replacementText);

// Fix store.logoBase64 check in UI:
code = code.replace(/\{store\.logoBase64 && \(/g, '{store.logosList && store.logosList.length > 0 && (');

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
