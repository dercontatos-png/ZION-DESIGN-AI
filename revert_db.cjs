const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// Undo the logosList thing in downloadImage config
code = code.replace(/useLogo: store\.useLogo,\n\s*logosList: store\.logosList,\n\s*logoBase64: store\.logoBase64,/, 'useLogo: store.useLogo,\n          logoBase64: store.logoBase64,');

// Revert the overlay image in the preview
const regexImg = /<img\n\s*src=\{activeImage\}\n\s*alt="Preview"\n\s*className="max-w-full max-h-\[70vh\] object-contain rounded-xl border border-white\/10 shadow-2xl select-none pointer-events-none"\n\s*\/>\n\s*\{store\.useLogo && store\.logosList && store\.logosList\.length > 0 && \(\n\s*<div className="absolute top-\[5%\] left-0 right-0 flex justify-center pointer-events-none select-none z-10">\n\s*<img src=\{store\.logosList\[0\]\} style=\{\{ maxHeight: '15%' \}\} className="object-contain opacity-95 drop-shadow-2xl" alt="Logo Overlay" \/>\n\s*<\/div>\n\s*\)\}/g;

const replacementImg = `<img
                      src={activeImage}
                      alt="Preview"
                      className="max-w-full max-h-[70vh] object-contain rounded-xl border border-white/10 shadow-2xl select-none pointer-events-none"
                    />`;
code = code.replace(regexImg, replacementImg);

// Revert text
const regexText = /A logo será sobreposta automaticamente na imagem final\. O gerador não tentará recriar ou alterar a logo, mantendo 100% da fidelidade original\./g;
const replacementText = "A IA irá extrair e incorporar a logo original enviada diretamente na arte final. A estrutura, fonte e formato serão preservados exatamente como na imagem fornecida (apenas a cor poderá ser adaptada pela IA para garantir contraste, como mudar para branco ou preto).";
code = code.replace(regexText, replacementText);

// Fix store.logoBase64 check in UI:
code = code.replace(/\{store\.logosList && store\.logosList\.length > 0 && \(/g, '{store.logoBase64 && (');

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
