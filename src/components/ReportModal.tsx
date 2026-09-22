import React, { useState, useEffect } from "react";
import { X, ChevronDown, ImagePlus } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, showToast }) => {
  const [tipo, setTipo] = useState<"Bug" | "Sugestão" | "Outro">("Bug");
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [printFile, setPrintFile] = useState<File | null>(null);
  const [printPreview, setPrintPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Suporte a colar print com Ctrl+V
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          setPrintFile(file);
          const url = URL.createObjectURL(file);
          setPrintPreview(url);
          if (showToast) showToast("Print colado da área de transferência!", "info");
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, showToast]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrintFile(file);
      setPrintPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) {
      if (showToast) showToast("Por favor, preencha o título e a descrição.", "warning");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (showToast) showToast("Report enviado com sucesso! Agradecemos o feedback.", "success");
      setTitulo("");
      setDescricao("");
      setPrintFile(null);
      setPrintPreview(null);
      onClose();
    }, 600);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Radix Dialog 1:1 Oficial */}
      <div
        role="dialog"
        id="radix-_r_36_"
        data-state="open"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        tabIndex={-1}
        aria-describedby="radix-_r_38_"
        aria-labelledby="radix-_r_37_"
        style={{ pointerEvents: "auto" }}
      >
        <p id="radix-_r_38_" className="sr-only">
          Envie um report, bug ou sugestão. Você pode anexar um print e, se aplicável, a imagem gerada associada.
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="radix-_r_37_" className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-alert h-5 w-5 text-red-500"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Reportar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tipo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo</label>
            <p className="mb-2 text-xs leading-relaxed text-zinc-500">Selecione o tipo</p>
            <div className="relative">
              <button
                type="button"
                role="combobox"
                aria-controls="report-type-listbox"
                aria-haspopup="listbox"
                aria-expanded={isTipoOpen}
                onClick={() => setIsTipoOpen(!isTipoOpen)}
                className="flex w-full items-center justify-between rounded-lg border bg-zinc-800 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 border-white/10 hover:bg-zinc-700 cursor-pointer"
              >
                <span className="truncate text-sm font-semibold text-zinc-100">{tipo}</span>
                <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/15">
                  <ChevronDown
                    className={`h-4 w-4 text-violet-400 transition-transform ${
                      isTipoOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {isTipoOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-800 p-1.5 shadow-2xl shadow-black/80">
                  {(["Bug", "Sugestão", "Outro"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTipo(t);
                        setIsTipoOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                        tipo === t ? "text-white bg-white/5 font-semibold" : "text-zinc-400"
                      }`}
                    >
                      <span>{t}</span>
                      {tipo === t && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-snug text-zinc-500">
              {tipo === "Bug" && "Algo da ferramenta não funcionou — erro, travamento, botão sem resposta ou página quebrada."}
              {tipo === "Sugestão" && "Tem alguma ideia para melhorar ou adicionar novas funcionalidades na ferramenta?"}
              {tipo === "Outro" && "Dúvidas gerais, feedbacks ou outros assuntos."}
            </p>
          </div>

          {/* Título * */}
          <div className="mb-4">
            <label htmlFor="report-title" className="block text-sm font-medium text-zinc-400 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs leading-relaxed text-zinc-500">
              Seja breve e direto — resuma o assunto em poucas palavras.
            </p>
            <input
              id="report-title"
              placeholder="Resumo curto do problema"
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors border-white/10 focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50"
              required
            />
          </div>

          {/* Descrição * */}
          <div className="mb-4">
            <label htmlFor="report-message" className="block text-sm font-medium text-zinc-400 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs leading-relaxed text-zinc-500">
              Quanto mais detalhes, mais rápido a gente resolve — conte o que aconteceu, o que você esperava e, se puder, anexe um print.
            </p>
            <textarea
              id="report-message"
              placeholder="Descreva o problema, bug ou sugestão..."
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-lg border bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none transition-colors border-white/10 focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50"
              required
            />
          </div>

          {/* Print * */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Print <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs leading-relaxed text-zinc-500">
              Capture a tela mostrando o problema — o erro na tela, a mensagem que apareceu ou o resultado inesperado.
            </p>

            {printPreview ? (
              <div className="relative rounded-lg border border-white/15 bg-zinc-800/80 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={printPreview}
                    alt="Print selecionado"
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div className="text-xs">
                    <p className="text-zinc-200 font-medium truncate max-w-[280px]">
                      {printFile?.name || "print.png"}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {printFile ? (printFile.size / 1024).toFixed(1) : "0"} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrintFile(null);
                    setPrintPreview(null);
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-center text-xs transition-colors border-white/15 bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                Clique, arraste ou cole (Ctrl+V) · PNG, JPG ou WebP · máx 5 MB
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  type="file"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 cursor-pointer"
            >
              {isSubmitting ? "Enviando..." : "Enviar report"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ReportModal;
