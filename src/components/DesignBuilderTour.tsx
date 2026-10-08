import React, { useState, useEffect, useRef, useCallback } from "react";

export interface TourStep {
  title: string;
  description: string;
  selector?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

interface DesignBuilderTourProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
  accentColor?: string;
}

const DEFAULT_STEPS: TourStep[] = [
  {
    title: "Bem-vindo ao Órion Pro",
    description: "Este guia mostra onde fica cada coisa. Use os botões para navegar.",
    placement: "center"
  },
  {
    title: "Visualizações",
    description: "Alterne entre o construtor, inspirações, comunidade e galeria para trabalhar e revisar suas gerações.",
    selector: '[data-tour="views"]',
    placement: "bottom"
  },
  {
    title: "Histórico",
    description: "Suas gerações recentes ficam aqui. Selecione uma para revisar ou continuar.",
    selector: '[data-tour="history"]',
    placement: "left"
  },
  {
    title: "Menu",
    description: "Use a barra lateral para acessar as áreas principais do aplicativo.",
    selector: '[data-tour="menu"]',
    placement: "right"
  },
  {
    title: "Reportar e feedback",
    description: "Use o alerta para reportar um problema ou enviar uma sugestão.",
    selector: '[data-tour="report"]',
    placement: "bottom"
  },
  {
    title: "Assistentes de IA",
    description: "Abra o chat para pedir ideias, extrair prompts e refinar seu trabalho.",
    selector: '[data-tour="assistant"]',
    placement: "left"
  },
  {
    title: "Configuração do formulário",
    description: "Preencha esta seção com os dados necessários para gerar sua imagem. As opções disponíveis dependem do agente.",
    selector: '[data-tour="form"]',
    placement: "right"
  },
  {
    title: "Galeria de estilos",
    description: "Escolha uma inspiração de estilo para orientar o visual da sua geração.",
    selector: '[data-tour="form-sec-marca_estilo"]',
    placement: "right"
  },
  {
    title: "Sujeito e produto",
    description: "Preencha com o personagem, produto ou elemento principal da sua cena.",
    selector: '[data-tour="form-sec-principal"]',
    placement: "right"
  },
  {
    title: "Cenário",
    description: "Descreva o ambiente, luz e atmosfera onde a cena acontece.",
    selector: '[data-tour="form-sec-cenario"]',
    placement: "right"
  },
  {
    title: "Ícones de ajuda",
    description: "Passe o mouse ou toque no ícone de informação ao lado de um campo para ver uma explicação.",
    selector: '[data-tour="help-icons"]',
    placement: "bottom"
  },
  {
    title: "Configurações",
    description: "Ajuste formato (1:1, 9:16, 16:9), resolução (1K, 2K, 4K) e opções avançadas.",
    selector: '[data-tour="form-sec-configuracoes"]',
    placement: "right"
  },
  {
    title: "Abas de trabalho",
    description: "Use abas para trabalhar em várias gerações sem perder formulários ou resultados.",
    selector: '[data-tour="tabs"]',
    placement: "bottom"
  },
  {
    title: "Depois de gerar",
    description: "Quando a imagem ficar pronta, use as ações disponíveis para revisar, reutilizar, publicar ou exportar o resultado.",
    selector: '[data-tour="stage-canvas"]',
    placement: "top"
  },
  {
    title: "Guia e demonstração",
    description: "Reabra este guia ou assista à demonstração quando quiser.",
    selector: '[data-tour="tour-btn"]',
    placement: "bottom"
  }
];

export const DesignBuilderTour: React.FC<DesignBuilderTourProps> = ({
  isOpen,
  onClose,
  agentName = "Órion Pro",
  accentColor = "#7c3aed"
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    display: "block",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const steps = React.useMemo(() => {
    return DEFAULT_STEPS.map((s, idx) => {
      if (idx === 0) {
        return { ...s, title: `Bem-vindo ao ${agentName}` };
      }
      return s;
    });
  }, [agentName]);

  const updatePosition = useCallback(() => {
    if (!isOpen) return;
    const step = steps[currentStepIndex];
    if (!step) return;

    if (!step.selector || step.placement === "center") {
      setHighlightRect(null);
      setPopoverStyle({
        display: "block",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000000002
      });
      return;
    }

    const el = document.querySelector(step.selector);
    if (!el) {
      setHighlightRect(null);
      setPopoverStyle({
        display: "block",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000000002
      });
      return;
    }

    // Scroll into view if needed
    try {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    } catch (_) {}

    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);

    const popoverWidth = 330;
    const popoverHeight = 175;
    const gap = 14;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case "right":
        top = Math.max(20, Math.min(window.innerHeight - popoverHeight - 20, rect.top + rect.height / 2 - popoverHeight / 2));
        left = rect.right + gap;
        if (left + popoverWidth > window.innerWidth - 20) {
          left = Math.max(20, rect.left - popoverWidth - gap);
        }
        break;
      case "left":
        top = Math.max(20, Math.min(window.innerHeight - popoverHeight - 20, rect.top + rect.height / 2 - popoverHeight / 2));
        left = rect.left - popoverWidth - gap;
        if (left < 20) {
          left = Math.min(window.innerWidth - popoverWidth - 20, rect.right + gap);
        }
        break;
      case "top":
        top = rect.top - popoverHeight - gap;
        left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, rect.left + rect.width / 2 - popoverWidth / 2));
        if (top < 20) {
          top = rect.bottom + gap;
        }
        break;
      case "bottom":
      default:
        top = rect.bottom + gap;
        left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, rect.left + rect.width / 2 - popoverWidth / 2));
        if (top + popoverHeight > window.innerHeight - 20) {
          top = Math.max(20, rect.top - popoverHeight - gap);
        }
        break;
    }

    setPopoverStyle({
      display: "block",
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      zIndex: 1000000002
    });
  }, [currentStepIndex, isOpen, steps]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }
  }, [isOpen, currentStepIndex, updatePosition]);

  // Reset to step 0 on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose]);

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* ── Driver Overlay Backdrop & Element Cutout ── */}
      <div
        className="driver-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 1000000000,
          pointerEvents: "auto",
          transition: "opacity 0.2s"
        }}
      />

      {/* Target Element Highlight Spotlight */}
      {highlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: `${highlightRect.top - 4}px`,
            left: `${highlightRect.left - 4}px`,
            width: `${highlightRect.width + 8}px`,
            height: `${highlightRect.height + 8}px`,
            borderRadius: "12px",
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 0 4px rgba(124, 58, 237, 0.25), 0 0 25px ${accentColor}55`,
            pointerEvents: "none",
            zIndex: 1000000001,
            transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
          }}
        />
      )}

      {/* ── Driver Popover (1:1 com o snippet do usuário) ── */}
      <div
        className="driver-popover db-tour"
        style={{
          ...popoverStyle,
          "--db-tour-accent": accentColor
        } as any}
        id="driver-popover-content"
        role="dialog"
        aria-labelledby="driver-popover-title"
        aria-describedby="driver-popover-description"
      >
        <button
          type="button"
          onClick={onClose}
          className="driver-popover-close-btn"
          aria-label="Close"
          style={{ display: "block" }}
        >
          ×
        </button>

        <div className="driver-popover-arrow driver-popover-arrow-side-over driver-popover-arrow-align-center" />

        <header id="driver-popover-title" className="driver-popover-title" style={{ display: "block" }}>
          {currentStep.title}
        </header>

        <div id="driver-popover-description" className="driver-popover-description" style={{ display: "block" }}>
          {currentStep.description}
        </div>

        <footer className="driver-popover-footer" style={{ display: "flex" }}>
          <span className="driver-popover-progress-text" style={{ display: "block" }}>
            {currentStepIndex + 1} de {steps.length}
          </span>

          <span className="driver-popover-navigation-btns">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              className={`driver-popover-prev-btn ${isFirst ? "driver-popover-btn-disabled" : ""}`}
              style={{ display: "block" }}
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="driver-popover-next-btn"
              style={{ display: "block" }}
            >
              {isLast ? "Concluir" : "Próximo"}
            </button>
          </span>
        </footer>
      </div>
    </>
  );
};
