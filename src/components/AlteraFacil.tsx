import React, { useState, useRef } from "react";
import {
  Upload,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Copy,
  RotateCcw,
  Wand2,
  X,
  Plus,
  Image as ImageIcon,
  FileText,
  Check
} from "lucide-react";

interface AlteraFacilProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const POSES_MASCULINAS = [
  { id: 1, title: "Reclinado com punho no queixo", img: "/vitrine/orion/orion-1.avif" },
  { id: 2, title: "Inclinado, mãos entrelaçadas", img: "/vitrine/orion/orion-2.avif" },
  { id: 3, title: "Ajustando o punho", img: "/vitrine/orion/orion-3.avif" },
  { id: 4, title: "Braços cruzados postura firme", img: "/vitrine/orion/orion-4.avif" },
];

const EXPRESSOES = [
  { id: 1, title: "Manter original", isOriginal: true },
  { id: 2, title: "Feliz", isOriginal: false },
  { id: 3, title: "Sério / Confiante", isOriginal: false },
  { id: 4, title: "Alívio", isOriginal: false },
];

const ENQUADRAMENTOS = [
  { id: 1, title: "Manter original", isOriginal: true },
  { id: 2, title: "Close-up (Rosto)", isOriginal: false },
  { id: 3, title: "Plano Médio (Busto)", isOriginal: false },
  { id: 4, title: "Plano Americano", isOriginal: false },
];

const FOCOS = [
  { id: 1, title: "Manter original", isOriginal: true },
  { id: 2, title: "Ultra foco", isOriginal: false },
  { id: 3, title: "Tudo nítido", isOriginal: false },
  { id: 4, title: "Desfoque suave de estúdio", isOriginal: false },
];

export const AlteraFacil: React.FC<AlteraFacilProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport,
  showToast,
}) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [genderGroup, setGenderGroup] = useState<"masculino" | "feminino">("masculino");
  const [poseIndex, setPoseIndex] = useState<number>(1);
  const [expressionIndex, setExpressionIndex] = useState<number>(0);
  const [framingIndex, setFramingIndex] = useState<number>(0);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [selectedDimension, setSelectedDimension] = useState<"9:16" | "4:5" | "1:1" | "16:9">("4:5");
  const [selectedQuality, setSelectedQuality] = useState<"1K" | "2K" | "4K">("2K");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [generatePromptOnly, setGeneratePromptOnly] = useState<boolean>(false);
  const [masterPromptResult, setMasterPromptResult] = useState<string>("");
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"builder" | "galeria">("builder");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
        showToast?.("Foto carregada com sucesso!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = handleUpload;

  const handleExecute = async () => {
    if (generatePromptOnly) {
      setIsProcessing(true);
      showToast?.("Sintetizando Prompt Mestre com Trava Facial...", "info");
      try {
        const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
        const res = await fetch("/api/build-master-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "altera-facil",
            categoria: "Pessoa",
            dimensao: selectedDimension,
            additionalPrompt: "Preservação estrita de traços biométricos e identidade",
            alteraData: {
              pose: POSES_MASCULINAS[poseIndex]?.title || "Pose de impacto",
              outfit: "Figurino editorial de alta alfaiataria",
              environment: "Iluminação de estúdio profissional com desfoque de fundo"
            },
            customApiKey: apiKey
          })
        });
        const data = await res.json();
        if (data.prompt) {
          setMasterPromptResult(data.prompt);
          setIsPromptModalOpen(true);
          showToast?.("Prompt Mestre gerado com sucesso! (0 créditos)", "success");
        } else {
          showToast?.(data.error || "Erro ao sintetizar prompt.", "error");
        }
      } catch (err: any) {
        showToast?.("Erro ao conectar com o serviço de prompt.", "error");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (!photo) {
      showToast?.("Adicione uma foto para alterar", "warning");
      return;
    }
    setIsProcessing(true);
    showToast?.("Alterando pose, luz e enquadramento sem perder identidade...", "info");
    setTimeout(() => {
      setIsProcessing(false);
      showToast?.("Foto alterada com sucesso!", "success");
    }, 2500);
  };

  const handleCopyPrompt = async () => {
    if (!masterPromptResult) return;
    try {
      await navigator.clipboard.writeText(masterPromptResult);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = masterPromptResult;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    }
  };

  const currentPose = POSES_MASCULINAS[poseIndex] || POSES_MASCULINAS[0];
  const prevPose = POSES_MASCULINAS[(poseIndex - 1 + POSES_MASCULINAS.length) % POSES_MASCULINAS.length];
  const nextPose = POSES_MASCULINAS[(poseIndex + 1) % POSES_MASCULINAS.length];

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-black text-white relative">
      {/* ── COLUNA ESQUERDA: FORMULÁRIO DO ALTERA FÁCIL (420px) ── */}
      <aside
        data-aside-form-col=""
        data-tour="form"
        className="agent-form-col relative z-10 flex shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] gap-5 lg:gap-6 lg:sticky lg:top-0 lg:h-full max-lg:order-2 max-lg:w-full max-lg:min-h-0"
        style={{ width: "420px", minWidth: "280px", maxWidth: "700px" }}
      >
        {/* 1. Foto para alterar */}
        <div data-tour="form-sec-ef-foto" className="campo-com-info">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#9d94bb] mb-2">
            <span>Foto para alterar</span>
            <span className="relative inline-flex items-center">
              <button
                type="button"
                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
                style={{ color: "rgb(167, 139, 250)" }}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </span>
          </label>
          <div className="flex flex-col gap-2" data-image-field-id="foto_original">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)] relative overflow-hidden"
            >
              {photo ? (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <img src={photo} alt="Foto original" className="max-h-full max-w-full object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoto(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-zinc-300 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                  <span className="font-light text-[#5c5278] text-4xl">+</span>
                  <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* 2. Grupo de templates & Carrosséis */}
        <div data-tour="form-sec-af-alteracao" className="campo-com-info flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Grupo de templates</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGenderGroup("masculino")}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize cursor-pointer ${
                  genderGroup === "masculino"
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                masculino
              </button>
              <button
                type="button"
                onClick={() => setGenderGroup("feminino")}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize cursor-pointer ${
                  genderGroup === "feminino"
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                feminino
              </button>
            </div>
          </div>

          {/* Carrossel de Poses 3D (Idêntico a 7.html) */}
          <section className="py-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-sm">Pose</span>
              <span className="text-[10px] tabular-nums text-white/60">
                {poseIndex + 1}/{POSES_MASCULINAS.length}
              </span>
            </div>

            <div className="relative mx-auto h-[300px] w-full max-w-[330px]">
              {/* Card Anterior (Escalado e com blur) */}
              <button
                type="button"
                onClick={() => setPoseIndex((prev) => (prev - 1 + POSES_MASCULINAS.length) % POSES_MASCULINAS.length)}
                className="absolute -left-[10%] top-1/2 z-0 block aspect-[4/5] w-[72%] -translate-y-1/2 rotate-[-4deg] scale-[0.84] overflow-hidden rounded-[20px] border border-white/[0.08] bg-black opacity-60 hover:opacity-85 transition-all cursor-pointer"
              >
                <img
                  alt=""
                  src={prevPose.img}
                  className="object-cover scale-[1.03] blur-[2.5px] h-full w-full"
                />
              </button>

              {/* Card Próximo */}
              <button
                type="button"
                onClick={() => setPoseIndex((prev) => (prev + 1) % POSES_MASCULINAS.length)}
                className="absolute -right-[10%] top-1/2 z-0 block aspect-[4/5] w-[72%] -translate-y-1/2 rotate-[4deg] scale-[0.84] overflow-hidden rounded-[20px] border border-white/[0.08] bg-black opacity-60 hover:opacity-85 transition-all cursor-pointer"
              >
                <img
                  alt=""
                  src={nextPose.img}
                  className="object-cover scale-[1.03] blur-[2.5px] h-full w-full"
                />
              </button>

              {/* Card Ativo Central */}
              <div className="absolute left-1/2 top-1/2 z-10 block aspect-[4/5] w-[76%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border bg-zinc-950 text-left transition-all border-violet-400/60 shadow-[4px_4px_18px_-6px_rgba(139,92,246,0.30)]">
                <img alt="" src={currentPose.img} className="object-cover h-full w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-4 pb-4 pt-16">
                  <p className="text-sm font-semibold text-white">{currentPose.title}</p>
                </div>
              </div>

              {/* Botões Chevron */}
              <button
                type="button"
                onClick={() => setPoseIndex((prev) => (prev - 1 + POSES_MASCULINAS.length) % POSES_MASCULINAS.length)}
                className="absolute left-[12%] top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white shadow-xl transition hover:border-violet-400/50 hover:bg-violet-500/15 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPoseIndex((prev) => (prev + 1) % POSES_MASCULINAS.length)}
                className="absolute right-[12%] top-1/2 z-20 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white shadow-xl transition hover:border-violet-400/50 hover:bg-violet-500/15 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Expressão / Enquadramento / Foco (Selectors) */}
          <div className="flex flex-col gap-3">
            {/* Expressão */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xs font-semibold text-zinc-300">Expressão</span>
              <button
                type="button"
                onClick={() => setExpressionIndex((prev) => (prev + 1) % EXPRESSOES.length)}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                {EXPRESSOES[expressionIndex].title} ({expressionIndex + 1}/{EXPRESSOES.length})
              </button>
            </div>

            {/* Enquadramento */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xs font-semibold text-zinc-300">Enquadramento</span>
              <button
                type="button"
                onClick={() => setFramingIndex((prev) => (prev + 1) % ENQUADRAMENTOS.length)}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                {ENQUADRAMENTOS[framingIndex].title} ({framingIndex + 1}/{ENQUADRAMENTOS.length})
              </button>
            </div>

            {/* Foco */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-xs font-semibold text-zinc-300">Foco</span>
              <button
                type="button"
                onClick={() => setFocusIndex((prev) => (prev + 1) % FOCOS.length)}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                {FOCOS[focusIndex].title} ({focusIndex + 1}/{FOCOS.length})
              </button>
            </div>
          </div>
        </div>

        {/* 3. Modo Avançado */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <button
            type="button"
            role="switch"
            aria-checked={advancedMode}
            onClick={() => setAdvancedMode(!advancedMode)}
            className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-white">Modo avançado</span>
              <span className="mt-1 text-[9px] leading-relaxed text-white/55">
                Prompt negativo e acabamento.
              </span>
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                advancedMode ? "bg-violet-600" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  advancedMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>

        {/* 4. Dimensões & Qualidade */}
        <div data-tour="form-sec-ef-config" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white text-sm">Dimensões</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { key: "9:16", label: "9:16" },
                { key: "4:5", label: "4:5" },
                { key: "1:1", label: "1:1" },
                { key: "16:9", label: "16:9" },
              ].map((dim) => (
                <button
                  key={dim.key}
                  type="button"
                  onClick={() => setSelectedDimension(dim.key as any)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedDimension === dim.key
                      ? "bg-violet-600/30 border border-violet-500/50 text-white"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {dim.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">Qualidade</span>
              <span className="text-[10px] text-zinc-500">ALTA 1856×2304</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["1K", "2K", "4K"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQuality(q)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedQuality === q
                      ? "bg-violet-600/30 border border-violet-500/50 text-white"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botão de Envio: Alterar imagem ou Gerar Prompt */}
        <div className="pt-2 flex flex-col gap-3">
          {/* ── SELETOR DE MODO: ALTERAR IMAGEM vs GERAR SÓ O PROMPT ── */}
          <div className="flex flex-col gap-2 rounded-2xl bg-zinc-950/80 border border-violet-500/20 p-1.5 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setGeneratePromptOnly(false)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  !generatePromptOnly
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Alterar Imagem</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${!generatePromptOnly ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"}`}>1 cr</span>
              </button>
              <button
                type="button"
                onClick={() => setGeneratePromptOnly(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  generatePromptOnly
                    ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-600/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Gerar só o Prompt</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${generatePromptOnly ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"}`}>0 cr</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:opacity-50 cursor-pointer"
            style={{
              background: generatePromptOnly
                ? "linear-gradient(to right, rgb(192, 38, 211), rgb(124, 58, 237))"
                : "linear-gradient(to right, rgb(168, 85, 247), rgba(168, 85, 247, 0.8))"
            }}
          >
            {generatePromptOnly ? (
              <>
                <FileText className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                <span>{isProcessing ? "Sintetizando Prompt..." : "Gerar Prompt Mestre"}</span>
                <span className="ml-1.5 rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium">0 créditos</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>{isProcessing ? "Alterando imagem..." : "Alterar imagem"}</span>
                <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#9d94bb]">
            <button
              type="button"
              onClick={() => showToast?.("Aba duplicada", "info")}
              className="inline-flex items-center gap-1 transition-colors hover:text-white cursor-pointer"
            >
              <Copy className="h-3 w-3" />
              <span>Duplicar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                showToast?.("Formulário resetado", "info");
              }}
              className="inline-flex items-center gap-1 transition-colors hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Resetar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── PALCO CENTRAL: ABAS & CANVAS (Idêntico a 7.html) ── */}
      <main className="relative flex-1 flex flex-col overflow-hidden max-lg:order-1 max-lg:min-h-0 bg-black">
        {/* Abas Superiores */}
        <div className="absolute left-4 top-4 z-30 hidden lg:flex">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors outline-none text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10"
            >
              <span>Aba 1</span>
            </button>
            <button
              type="button"
              onClick={() => showToast?.("Nova aba adicionada", "info")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Seletor Central (Builder | Galeria) */}
        <div className="max-lg:hidden flex items-center justify-center gap-3 pt-4 pb-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/10 rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "builder" ? "bg-fuchsia-600 text-white shadow-lg" : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("galeria")}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "galeria" ? "bg-fuchsia-600 text-white shadow-lg" : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              Galeria
            </button>
          </div>
        </div>

        {/* Empty State Oficial */}
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center justify-center gap-4 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
              <ImageIcon className="h-7 w-7 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Envie uma foto para ver a prévia aqui</p>
              <p className="text-xs text-zinc-600 mt-1">Suas próximas gerações aparecerão aqui.</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL: PROMPT MESTRE GERADO (0 CRÉDITOS) ── */}
      {isPromptModalOpen && masterPromptResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-2xl w-full flex flex-col rounded-3xl overflow-hidden bg-[#0c0817] border border-fuchsia-500/30 shadow-2xl shadow-fuchsia-950/50 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-violet-600/30 border border-fuchsia-500/40 text-fuchsia-300">
                  <FileText className="h-6 w-6 text-fuchsia-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Prompt Mestre de Trava Facial</h3>
                    <span className="rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
                      0 Créditos
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Preservação biométrica facial estrita com nova pose e figurino editorial.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Prompt Box */}
            <div className="relative mb-5 rounded-2xl bg-black/70 border border-violet-500/20 p-4 max-h-[360px] overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed select-text">
                {masterPromptResult}
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-400">
                Cole no <strong>Midjourney, Flux, Fooocus, ComfyUI</strong> ou gerador de sua preferência.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer"
                >
                  {isPromptCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span className="text-emerald-300">Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Prompt Mestre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlteraFacil;
