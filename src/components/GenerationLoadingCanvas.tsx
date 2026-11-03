import React, { useEffect, useState, useId } from "react";

// O caminho SVG vetorial exato da silhueta do Design Builder original
export const DB_SILHOUETTE_PATH =
  "M200.689392,100.163193 C186.393738,90.536598 172.533218,80.167130 157.691238,71.473213 C139.521805,60.830181 120.181602,52.485760 98.665016,51.380798 C93.486916,51.114883 88.104118,51.722099 83.041458,52.899540 C67.307152,56.558910 61.800156,68.218597 64.637047,83.529518 C67.339241,98.113503 74.932236,110.373009 83.877892,121.876205 C95.223946,136.466095 107.721458,149.862335 122.653076,160.970322 C136.318680,171.136475 150.098206,171.224258 164.543060,163.150421 C177.635834,155.832306 187.931152,145.198257 198.459702,134.821243 C212.054367,121.422264 225.480835,107.843399 239.356277,94.740738 C258.545837,76.619942 277.981079,58.754894 297.517548,41.007584 C308.537476,30.996889 319.971497,21.442112 331.970764,12.439780 C331.017303,13.582582 330.132446,14.791737 329.100342,15.858436 C305.653107,40.091599 281.887177,64.027161 258.902740,88.691170 C251.419678,96.721077 245.508057,106.361923 239.722458,115.784645 C234.280960,124.646927 234.467834,134.235657 240.307983,143.034821 C248.475845,155.341141 257.335266,167.193039 265.367401,179.583832 C278.121307,199.258698 289.764099,219.567810 294.573303,242.891098 C295.660065,248.161484 295.951843,253.799393 295.442596,259.157196 C293.899231,275.394928 282.394897,282.915741 268.684296,285.093811 C248.566818,288.289703 230.162445,282.195709 212.466965,273.839905 C184.556808,260.660736 159.807373,242.610886 136.381363,222.671127 C135.923370,222.281265 135.204803,222.197556 134.607788,221.971024 C134.960052,221.529083 135.312317,221.087143 135.664597,220.645203 C137.155426,221.460175 138.748734,222.131607 140.121719,223.111679 C161.075378,238.068649 182.115601,252.865753 205.974319,263.042053 C217.786270,268.080109 229.665909,272.853149 242.601196,274.130676 C252.883957,275.146240 263.013794,274.884430 272.337708,269.639008 C280.524902,265.033081 283.454407,257.669495 282.679810,248.675461 C281.603638,236.179611 276.037354,225.247452 270.270325,214.431580 C260.494446,196.097351 248.200500,179.718781 231.729874,166.871155 C222.716263,159.840256 212.882538,154.313919 201.101974,152.950104 C190.357346,151.706223 180.957275,154.578461 173.096634,161.672577 C160.186447,173.323853 147.427399,185.157944 134.954041,197.274658 C110.909363,220.631882 87.123016,244.254868 63.201424,267.739014 C48.738747,281.937195 34.224483,296.082825 19.726736,310.245239 C19.150286,310.808350 18.505007,311.300964 17.007332,311.107880 C19.191765,308.512177 21.303877,305.851410 23.572412,303.331421 C37.825375,287.498505 52.069576,271.657379 66.404900,255.899185 C75.731895,245.646454 85.411446,235.706619 94.513443,225.260971 C97.948723,221.318588 100.569435,216.529480 102.919456,211.806885 C107.791107,202.016815 107.190514,191.894592 101.712852,182.768372 C92.508347,167.432968 82.197060,152.763962 72.914391,137.472809 C63.079117,121.271370 54.504124,104.391235 51.058342,85.478096 C48.284504,70.253151 51.327663,56.911827 65.230446,48.077888 C73.653107,42.726070 83.397057,41.835999 93.051643,42.286636 C121.078720,43.594826 145.095566,55.748432 167.449295,71.433540 C179.327194,79.768005 190.298737,89.394180 201.671844,98.985825 C201.339340,99.743973 201.014359,99.953583 200.689392,100.163193 z";

/**
 * AnimatedLogo Oficial do Design Builder (0n49d5t_bv61z.js)
 * Silhueta vazada com respiro suave, preenchimento gradual de baixo para cima
 * e feixe de luz diagonal em 18 graus.
 */
export const AnimatedLogo: React.FC<{
  color?: string;
  cycleSeconds?: number;
  size?: number;
  className?: string;
}> = ({
  color = "#ffffff",
  cycleSeconds = 3.2,
  size = 120,
  className = ""
}) => {
  const uniqueId = useId().replace(/:/g, "");
  const clipId = `dbSilhueta-${uniqueId}`;

  return (
    <div
      style={{
        width: size,
        height: size / (339 / 326),
        position: "relative",
        // @ts-ignore
        "--db-cycle": `${cycleSeconds}s`,
        "--db-fg": color
      }}
      className={`relative select-none ${className}`}
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
          {/* Silhueta apagada (opacidade 16%) */}
          <path d={DB_SILHOUETTE_PATH} className="db-apagada" />
          {/* Silhueta acesa preenchendo verticalmente */}
          <path d={DB_SILHOUETTE_PATH} className="db-acesa" />
          {/* Feixe de luz em varredura diagonal a 18 graus */}
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
  );
};

// Etapas Oficiais do Design Builder original (2ckkh977b2xi_.js / 0jne17lrb1-9y.js)
const OFFICIAL_STEPS = [
  "Aplicando estilo visual...",
  "Construindo composição...",
  "Capturando a cena...",
  "Renderizando produto...",
  "Finalizando imagem..."
];

interface GenerationLoadingCanvasProps {
  className?: string;
  agentColor?: string;
  elapsedSeconds?: number;
  message?: string;
  subMessage?: string;
}

/**
 * Tela Oficial de Carregamento de Geração do Design Builder.
 * Replicada 100% idêntica ao app.designbuilder.co:
 * 1. Fundo radial suave com animação "breathe" (4s ease-in-out)
 * 2. Bloom central violeta suave pulsante (blur-3xl animate-pulse)
 * 3. AnimatedLogo (tamanho 120px) com o SVG e shaders oficiais
 * 4. Textos oficiais de transição vertical suave (fade in/out com rotação a cada 3.2s)
 * 5. Gatilho automático para "Quase lá, finalizando..." após 45s
 */
export const GenerationLoadingCanvas: React.FC<GenerationLoadingCanvasProps> = ({
  className = "",
  agentColor = "#a78bfa",
  elapsedSeconds: externalElapsed,
  message,
  subMessage
}) => {
  // Cronômetro interno caso não venha externo
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

  // Rotação exata das etapas oficiais com duração de 3.2s e fade suave de 500ms
  const [stepIndex, setStepIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % OFFICIAL_STEPS.length);
        setIsFading(false);
      }, 500);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const currentStepText = message || (isAlmostDone ? "Quase lá, finalizando..." : OFFICIAL_STEPS[stepIndex]);

  return (
    <div
      className={`relative inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl select-none border border-white/[0.06] shadow-2xl shadow-black/50 ${className}`}
      style={{
        backgroundColor: "#0c0a15"
      }}
    >
      {/* 1. Fundo Radial Gradiente com Respiração Oficial (breathe 4s) */}
      <div
        className="pointer-events-none absolute inset-0 db-breathe-bg"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(91,33,182,0.3) 0%, rgba(15,10,30,0.95) 70%)"
        }}
      />

      {/* 2. Conteúdo Central Oficial do Design Builder */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6">
        {/* Glow Central + Logo Animado */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
          <AnimatedLogo color="#ffffff" size={120} />
        </div>

        {/* Texto da Etapa Atual com Animação Oficial */}
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <p
            className={`text-sm font-semibold tracking-wide text-white/80 transition-all duration-500 ${
              isFading ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {currentStepText}
          </p>

          {/* Submensagem sutil caso o usuário tenha um status específico */}
          {subMessage && (
            <span className="text-[11px] font-medium tracking-wide text-white/40">
              {subMessage}
            </span>
          )}
        </div>
      </div>

      {/* Estilos CSS Oficiais do Design Builder (0n49d5t_bv61z.js / 0jne17lrb1-9y.js) */}
      <style>{`
        .db-logo-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .db-logo-svg .db-apagada {
          fill: var(--db-fg, #ffffff);
          opacity: 0.16;
        }
        .db-logo-svg .db-acesa {
          fill: var(--db-fg, #ffffff);
          clip-path: inset(100% 0 0);
          animation: db-enche var(--db-cycle, 3.2s) cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        .db-logo-svg .db-luz {
          opacity: 0;
          animation: db-luz var(--db-cycle, 3.2s) cubic-bezier(0.5, 0, 0.4, 1) infinite;
        }
        .db-logo-svg .db-respiro {
          transform-box: fill-box;
          transform-origin: 50%;
          animation: db-respiro var(--db-cycle, 3.2s) ease-in-out infinite;
        }
        .db-breathe-bg {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes db-enche {
          0%, 5% {
            clip-path: inset(100% 0 0);
          }
          45%, 88% {
            clip-path: inset(0);
          }
          to {
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
          to {
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
          to {
            transform: scale(0.97);
          }
        }
      `}</style>
    </div>
  );
};

export default GenerationLoadingCanvas;

