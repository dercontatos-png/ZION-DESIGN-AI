import React, { useEffect, useRef, useState, useId } from "react";
import {
  Search,
  UserRound,
  Layers,
  Lightbulb,
  Wand2,
  Sparkles,
  Layout,
  Palette,
  Crop,
  Paintbrush,
  Gem,
  Star
} from "lucide-react";

// O caminho SVG vetorial exato da silhueta do Design Builder original
const DB_SILHOUETTE_PATH =
  "M200.689392,100.163193 C186.393738,90.536598 172.533218,80.167130 157.691238,71.473213 C139.521805,60.830181 120.181602,52.485760 98.665016,51.380798 C93.486916,51.114883 88.104118,51.722099 83.041458,52.899540 C67.307152,56.558910 61.800156,68.218597 64.637047,83.529518 C67.339241,98.113503 74.932236,110.373009 83.877892,121.876205 C95.223946,136.466095 107.721458,149.862335 122.653076,160.970322 C136.318680,171.136475 150.098206,171.224258 164.543060,163.150421 C177.635834,155.832306 187.931152,145.198257 198.459702,134.821243 C212.054367,121.422264 225.480835,107.843399 239.356277,94.740738 C258.545837,76.619942 277.981079,58.754894 297.517548,41.007584 C308.537476,30.996889 319.971497,21.442112 331.970764,12.439780 C331.017303,13.582582 330.132446,14.791737 329.100342,15.858436 C305.653107,40.091599 281.887177,64.027161 258.902740,88.691170 C251.419678,96.721077 245.508057,106.361923 239.722458,115.784645 C234.280960,124.646927 234.467834,134.235657 240.307983,143.034821 C248.475845,155.341141 257.335266,167.193039 265.367401,179.583832 C278.121307,199.258698 289.764099,219.567810 294.573303,242.891098 C295.660065,248.161484 295.951843,253.799393 295.442596,259.157196 C293.899231,275.394928 282.394897,282.915741 268.684296,285.093811 C248.566818,288.289703 230.162445,282.195709 212.466965,273.839905 C184.556808,260.660736 159.807373,242.610886 136.381363,222.671127 C135.923370,222.281265 135.204803,222.197556 134.607788,221.971024 C134.960052,221.529083 135.312317,221.087143 135.664597,220.645203 C137.155426,221.460175 138.748734,222.131607 140.121719,223.111679 C161.075378,238.068649 182.115601,252.865753 205.974319,263.042053 C217.786270,268.080109 229.665909,272.853149 242.601196,274.130676 C252.883957,275.146240 263.013794,274.884430 272.337708,269.639008 C280.524902,265.033081 283.454407,257.669495 282.679810,248.675461 C281.603638,236.179611 276.037354,225.247452 270.270325,214.431580 C260.494446,196.097351 248.200500,179.718781 231.729874,166.871155 C222.716263,159.840256 212.882538,154.313919 201.101974,152.950104 C190.357346,151.706223 180.957275,154.578461 173.096634,161.672577 C160.186447,173.323853 147.427399,185.157944 134.954041,197.274658 C110.909363,220.631882 87.123016,244.254868 63.201424,267.739014 C48.738747,281.937195 34.224483,296.082825 19.726736,310.245239 C19.150286,310.808350 18.505007,311.300964 17.007332,311.107880 C19.191765,308.512177 21.303877,305.851410 23.572412,303.331421 C37.825375,287.498505 52.069576,271.657379 66.404900,255.899185 C75.731895,245.646454 85.411446,235.706619 94.513443,225.260971 C97.948723,221.318588 100.569435,216.529480 102.919456,211.806885 C107.791107,202.016815 107.190514,191.894592 101.712852,182.768372 C92.508347,167.432968 82.197060,152.763962 72.914391,137.472809 C63.079117,121.271370 54.504124,104.391235 51.058342,85.478096 C48.284504,70.253151 51.327663,56.911827 65.230446,48.077888 C73.653107,42.726070 83.397057,41.835999 93.051643,42.286636 C121.078720,43.594826 145.095566,55.748432 167.449295,71.433540 C179.327194,79.768005 190.298737,89.394180 201.671844,98.985825 C201.339340,99.743973 201.014359,99.953583 200.689392,100.163193 z";

// Lista oficial de etapas de progresso do Design Builder
const GENERATION_STEPS = [
  { label: "Analisando referências e iluminação...", icon: Search },
  { label: "Identificando sujeito e composição...", icon: UserRound },
  { label: "Construindo ambiente e profundidade 3D...", icon: Layers },
  { label: "Calculando volumetria e luzes...", icon: Lightbulb },
  { label: "Aprimorando elementos da cena...", icon: Wand2 },
  { label: "Sintetizando contexto visual...", icon: Layout },
  { label: "Aplicando estilo e paleta de cores...", icon: Palette },
  { label: "Refinando composição fotográfica...", icon: Crop },
  { label: "Equalizando contraste e matizes...", icon: Paintbrush },
  { label: "Renderizando detalhes em alta definição...", icon: Gem },
  { label: "Finalizando arte...", icon: Star }
];

interface GenerationLoadingCanvasProps {
  className?: string;
  agentColor?: string;
  elapsedSeconds?: number;
  message?: string;
  subMessage?: string;
}

/**
 * Componente oficial de tela de carregamento de geração do Design Builder.
 * Inclui:
 * 1. SpaceWarp Backdrop (campo de estrelas em velocidade de dobra espacial)
 * 2. Radial Gradient breathing background
 * 3. AnimatedLogo (silhueta icônica preenchendo verticalmente com feixe de luz)
 * 4. Carrossel suave de etapas técnicas de síntese com ícones correspondentes
 * 5. Cronômetro dinâmico em tempo real
 */
export const GenerationLoadingCanvas: React.FC<GenerationLoadingCanvasProps> = ({
  className = "",
  agentColor = "#a78bfa",
  elapsedSeconds: externalElapsed,
  message,
  subMessage
}) => {
  const uniqueId = useId().replace(/:/g, "");
  const clipId = `dbSilhueta-${uniqueId}`;

  // Controle de tempo decorrido local caso não venha de fora
  const [internalElapsed, setInternalElapsed] = useState(0);
  useEffect(() => {
    if (externalElapsed !== undefined) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setInternalElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [externalElapsed]);

  const elapsed = externalElapsed !== undefined ? externalElapsed : internalElapsed;
  const isAlmostDone = elapsed >= 45;

  // Rotação suave das etapas a cada 3.2s com fade out/in
  const [stepIndex, setStepIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % GENERATION_STEPS.length);
        setIsFading(false);
      }, 350);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const currentStep = GENERATION_STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  // Space Warp canvas animation
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 400);
    let height = (canvas.height = canvas.offsetHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 400;
      height = canvas.height = canvas.offsetHeight || 400;
    };

    window.addEventListener("resize", handleResize);

    // Inicializa 280 estrelas
    const STAR_COUNT = 280;
    const stars: Array<{ x: number; y: number; z: number; oZ: number }> = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1600,
        z: Math.random() * 1000 + 1,
        oZ: 0
      });
    }

    const render = () => {
      ctx.fillStyle = "rgba(10, 7, 21, 0.28)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];
        star.oZ = star.z;
        star.z -= 4.2; // velocidade de aproximação

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 1600;
          star.y = (Math.random() - 0.5) * 1600;
          star.z = 1000;
          star.oZ = 1000;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const ok = 250 / star.oZ;
        const ox = star.x * ok + cx;
        const oy = star.y * ok + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1000 - star.z) / 450);
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha * 0.45})`;
          ctx.lineWidth = Math.max(0.6, (1 - star.z / 1000) * 1.8);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.7, (1 - star.z / 1000) * 1.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}m ` : ""}${s}s`;
  };

  return (
    <div
      className={`relative inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl select-none ${className}`}
      style={{
        backgroundColor: "#0c0a15",
        minHeight: "320px"
      }}
    >
      {/* 1. SpaceWarp Backdrop Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-75 transition-opacity duration-1000"
      />

      {/* 2. Radial Gradient Breathing Glow */}
      <div
        className="pointer-events-none absolute inset-0 db-breathe-glow"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(91,33,182,0.35) 0%, rgba(15,10,30,0.85) 68%, rgba(12,10,21,0.98) 100%)"
        }}
      />

      {/* 3. Bloom Central Iluminado */}
      <div
        className="pointer-events-none absolute h-40 w-40 rounded-full blur-3xl db-breathe-glow"
        style={{
          backgroundColor: `${agentColor}33`
        }}
      />

      {/* 4. Conteúdo Centralizado */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 px-6 text-center">
        {/* Animated Silhouette Logo */}
        <div className="relative flex items-center justify-center">
          <div
            style={{
              width: 104,
              height: 104 / (339 / 326),
              position: "relative",
              // @ts-ignore
              "--db-cycle": "3.2s",
              "--db-fg": "#ffffff"
            }}
            className="db-logo-wrapper"
          >
            <svg
              viewBox="0 0 339 326"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="db-logo-svg"
            >
              <defs>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  <path d={DB_SILHOUETTE_PATH} />
                </clipPath>
              </defs>
              <g className="db-respiro">
                {/* Silhueta apagada de fundo */}
                <path d={DB_SILHOUETTE_PATH} className="db-apagada" />
                {/* Silhueta acesa preenchendo de baixo para cima */}
                <path d={DB_SILHOUETTE_PATH} className="db-acesa" />
                {/* Feixe de luz em varredura diagonal */}
                <g clipPath={`url(#${clipId})`}>
                  <g transform="rotate(18 170 163)">
                    <rect
                      x="-70"
                      y="-120"
                      width="70"
                      height="560"
                      fill="#ffffff"
                      opacity="0.85"
                      className="db-luz"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Mensagem e Etapa Atual Rotativa */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex items-center gap-2 transition-all duration-350 ${
              isFading ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <StepIcon className="h-4 w-4 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
            <p
              className="text-center text-[13.5px] font-medium tracking-wide text-white/95"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.7)" }}
            >
              {message || (isAlmostDone ? "Quase pronto..." : currentStep.label)}
            </p>
          </div>

          {/* Subtítulo ou Cronômetro */}
          <div className="flex items-center gap-2 text-xs text-[#a78bfa]/80">
            <span className="font-mono text-[11.5px] tracking-wider">{formatSeconds(elapsed)}</span>
            <span className="text-white/20">•</span>
            <span>{subMessage || "IA sintetizando arte em alta fidelidade"}</span>
          </div>

          {/* Três pontos pulsantes de atividade */}
          <div className="flex items-center gap-1.5 pt-1">
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: agentColor }}
            />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ animationDelay: "0.2s", backgroundColor: agentColor }}
            />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ animationDelay: "0.4s", backgroundColor: agentColor }}
            />
          </div>
        </div>
      </div>

      {/* Estilos CSS Inline Oficiais para as Animações de Respiração e Preenchimento */}
      <style>{`
        .db-logo-svg {
          width: 100%;
          height: 100%;
          display: block;
          filter: drop-shadow(0 0 16px rgba(167, 139, 250, 0.45));
        }
        .db-logo-svg .db-apagada {
          fill: var(--db-fg);
          opacity: 0.16;
        }
        .db-logo-svg .db-acesa {
          fill: var(--db-fg);
          clip-path: inset(100% 0 0);
          animation: db-enche var(--db-cycle) cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        .db-logo-svg .db-luz {
          opacity: 0;
          animation: db-luz var(--db-cycle) cubic-bezier(0.5, 0, 0.4, 1) infinite;
        }
        .db-logo-svg .db-respiro {
          transform-box: fill-box;
          transform-origin: 50%;
          animation: db-respiro var(--db-cycle) ease-in-out infinite;
        }
        @keyframes db-enche {
          0%, 5% {
            clip-path: inset(100% 0 0);
          }
          45%, 88% {
            clip-path: inset(0);
          }
          100% {
            clip-path: inset(100% 0 0);
          }
        }
        @keyframes db-luz {
          0%, 48% {
            opacity: 0;
            transform: translate(-120px);
          }
          52% {
            opacity: 1;
          }
          76% {
            opacity: 1;
            transform: translate(430px);
          }
          80% {
            opacity: 0;
            transform: translate(450px);
          }
          100% {
            opacity: 0;
            transform: translate(-120px);
          }
        }
        @keyframes db-respiro {
          0%, 42% {
            transform: scale(0.97);
          }
          56%, 88% {
            transform: scale(1);
          }
          100% {
            transform: scale(0.97);
          }
        }
        .db-breathe-glow {
          animation: db-breathe-anim 4s ease-in-out infinite;
        }
        @keyframes db-breathe-anim {
          0%, 100% {
            opacity: 0.75;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default GenerationLoadingCanvas;
