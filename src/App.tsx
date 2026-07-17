/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { handleFirestoreError, OperationType } from "./lib/firebase-utils";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Users,
  User,
  Settings,
  Search,
  Bell,
  Plus,
  Loader2,
  Copy,
  Check,
  Image as ImageIcon,
  Share2,
  Download,
  Briefcase,
  X,
  Trash2,
  Upload,
  SlidersHorizontal,
  Wand2,
  MessageSquare,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  CalendarDays,
  Info,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileText,
  Save,
  LogOut,
  Cloud,
  Database,
  WifiOff,
  Filter,
  Layers,
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import SettingsModal from "./components/SettingsModal";
import { ClientPortal } from "./components/ClientPortal";
import { VoiceInputButton } from "./components/VoiceInputButton";
import WhatsAppTab from "./components/WhatsAppTab";
import { useImageStore } from "./store/useImageStore";
import { InpaintCanvas } from "./components/InpaintCanvas";
import DesignBuilder from "./components/DesignBuilder";
import Agentes from "./components/Agentes";



declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { Task, Client, Transaction, CalendarEvent, NotificationItem, SavedNote } from "./types";

const getActiveApiKey = () => {
  try {
    const localKey = typeof window !== "undefined" && localStorage.getItem("custom_gemini_api_key");
    if (localKey && localKey.trim()) return localKey.trim();
  } catch (e) {}

  try {
    const profileData = localStorage.getItem("zion_my_profile");
    if (profileData) {
      const profile = JSON.parse(profileData);
      if (profile?.geminiApiKey && profile.geminiApiKey.trim()) return profile.geminiApiKey.trim();
    }
  } catch (e) {}

  let envKey = "";
  try {
    if (typeof process !== "undefined" && process.env) {
      envKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    }
  } catch (e) {}

  return envKey || "";
};

const ChatAssistant: React.FC<{
  onClose: () => void;
  clients: Client[];
  messages: { role: "user" | "assistant"; content: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: "user" | "assistant"; content: string }[]>>;
}> = ({ onClose, clients, messages, setMessages }) => {
  React.useEffect(() => {
    if (messages.length === 0) {
      if (clients.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: `Olá! Sou o **Zion AI Assistant**, o assistente inteligente de sua agência digital. 

Como você ainda não possui clientes cadastrados na área de trabalho, que tal começar cadastrando o seu primeiro cliente ou clicando em **Carregar Dados Demonstrativos** nas configurações para ver os painéis integrados em ação?

Se preferir, posso te dar algumas ideias de conteúdo, scripts ou ajudar na captação agora mesmo!`,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content: `Olá! Sou o **Zion AI Assistant**, seu co-piloto estratégico na agência. 

Consigo analisar a saúde financeira dos seus **${clients.length} clientes**, sugerir novas pautas de postagens com base nos nichos deles ou criar copies de alta conversão. Como posso te ajudar hoje?`,
          },
        ]);
      }
    }
  }, [clients.length, messages.length, setMessages]);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "extract">("chat");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPrompt, setExtractedPrompt] = useState("");
  const [extractedTypography, setExtractedTypography] = useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mode]);

  const quickPrompts = [
    {
      label: "ðŸ’¡ Ideias de Post",
      text: "Me dê 5 ideias criativas e persuasivas de posts para o Instagram focados em atração orgânica.",
    },
    {
      label: "ðŸŽ¬ Roteiro de Reels",
      text: "Crie um roteiro de Reels dinâmico de 30 segundos, incluindo gancho, conteúdo e chamada para ação (CTA).",
    },
    {
      label: "ðŸ“ˆ Estratégia de Ads",
      text: "Qual estrutura de campanha você recomenda para impulsionar um negócio local com orçamento baixo?",
    },
    {
      label: "âœï¸ Copy de Vendas",
      text: "Escreva uma legenda de Instagram com copy persuasiva e hashtags para venda de serviços digitais.",
    },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsExtracting(true);
    setExtractedPrompt("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      try {
        const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                {
                  text: "Analise esta imagem e extraia um prompt detalhado que descreva a composição, estilo, iluminação e elementos presentes, para que eu possa gerar uma imagem similar.",
                },
              ],
            },
          });
        } catch (e) {
          console.warn(
            "gemini-3.1-pro-preview falhou, tentando gemini-3.5-flash",
            e,
          );
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                {
                  text: "Analise esta imagem e extraia um prompt detalhado que descreva a composição, estilo, iluminação e elementos presentes, para que eu possa gerar uma imagem similar.",
                },
              ],
            },
          });
        }
        setExtractedPrompt(
          response.text || "Não foi possível extrair o prompt.",
        );
      } catch (error) {
        setExtractedPrompt("Erro ao extrair prompt.");
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTypographyExtraction = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsExtracting(true);
    setExtractedTypography("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      try {
        const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                {
                  text: "Analise esta imagem e extraia o estilo tipográfico, incluindo efeitos, texturas, 3D, fontes sugeridas e quaisquer outros detalhes visuais da tipografia.",
                },
              ],
            },
          });
        } catch (e) {
          console.warn(
            "gemini-3.1-pro-preview falhou, tentando gemini-3.5-flash",
            e,
          );
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                {
                  text: "Analise esta imagem e extraia o estilo tipográfico, incluindo efeitos, texturas, 3D, fontes sugeridas e quaisquer outros detalhes visuais da tipografia.",
                },
              ],
            },
          });
        }
        setExtractedTypography(
          response.text || "Não foi possível extrair o estilo tipográfico.",
        );
      } catch (error) {
        setExtractedTypography("Erro ao extrair estilo tipográfico.");
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    if (!customText) setInput("");

    try {
      const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
      const clientsContext =
        clients.length > 0
          ? clients
              .map(
                (c) =>
                  `- **${c.name}**: nicho de ${c.niche}, plano de R$ ${c.planValue || 0}/mês com vencimento todo dia ${c.dueDate || 10}. Notes: ${c.notes || "Sem notas"}`,
              )
              .join("\n")
          : "Nenhum cliente cadastrado no momento.";

      let response;
      const promptContext = `Você é o assistente inteligente pessoal da agência digital "Zion Company", focado no sucesso de mídias sociais, tráfego pago e branding.
      Sua personalidade é extremamente profissional, criativa, amigável e focada em resultados práticos.
      
      Aqui estão os clientes cadastrados atualmente na agência para você ter o contexto operacional:
      ${clientsContext}
      
      Por favor, forneça respostas de altíssima qualidade técnica para a agência. Use formatação markdown elegante para tópicos e destaques importantes.
      
      Pergunta ou comando do usuário:
      "${textToSend}"`;

      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: promptContext,
        });
      } catch (e) {
        console.warn(
          "gemini-3.1-pro-preview falhou, tentando gemini-3.5-flash",
          e,
        );
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptContext,
        });
      }
      if (response.text) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.text! },
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua solicitação no momento. Verifique sua conexão ou se a chave de API é válida.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[680px] bg-[#0b0b0c] border border-white/10 sm:rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c5a880] flex items-center justify-center text-zinc-950 font-black text-sm">
            Z
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Assistente Zion AI</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
              Ativo & Integrado
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1.5 hover:bg-white/5 rounded-xl transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Modes */}
      <div className="p-2 border-b border-white/5 flex gap-1 bg-zinc-950/20">
        <button
          onClick={() => setMode("chat")}
          className={`flex-1 text-xs py-2 rounded-xl transition-all font-semibold ${mode === "chat" ? "bg-[#c5a880] text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Chat Integrado
        </button>
        <button
          onClick={() => setMode("extract")}
          className={`flex-1 text-xs py-2 rounded-xl transition-all font-semibold ${mode === "extract" ? "bg-[#c5a880] text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Extrair de Referências
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/40">
        {mode === "extract" ? (
          <div className="text-sm text-zinc-300 space-y-6 p-1">
            <div className="bg-[#0b0b0c] p-4 border border-white/5 rounded-xl">
              <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                ðŸ“¸ Extrair Prompt de Imagem
              </p>
              <p className="text-[11px] text-zinc-500 mb-3">
                Envie uma imagem de referência de social media e o assistente
                irá gerar o prompt exato para replicar o estilo.
              </p>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs text-zinc-400 bg-[#050505] p-2.5 rounded-xl border border-white/10 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-white"
                onChange={handleImageUpload}
              />
              {isExtracting && (
                <p className="mt-2 text-[#c5a880] animate-pulse text-xs">
                  Analisando imagem e extraindo prompt...
                </p>
              )}
              {extractedPrompt && (
                <div className="mt-3 p-3 bg-[#050505] rounded-xl border border-white/5 text-zinc-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#c5a880]">
                      Prompt Extraído:
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(extractedPrompt)
                      }
                      className="text-[10px] text-zinc-500 hover:text-white underline"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="font-mono leading-relaxed select-all text-zinc-300 bg-[#0b0b0c] p-2 rounded-lg">
                    {extractedPrompt}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#0b0b0c] p-4 border border-white/5 rounded-xl">
              <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                ðŸŽ¨ Extrair Estilo Tipográfico
              </p>
              <p className="text-[11px] text-zinc-500 mb-3">
                Gostou das letras de um post? Envie a imagem e descubra fontes,
                efeitos e estilo visual.
              </p>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs text-zinc-400 bg-[#050505] p-2.5 rounded-xl border border-white/10 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-white"
                onChange={handleTypographyExtraction}
              />
              {isExtracting && (
                <p className="mt-2 text-[#c5a880] animate-pulse text-xs">
                  Analisando fontes e layout...
                </p>
              )}
              {extractedTypography && (
                <div className="mt-3 p-3 bg-[#050505] rounded-xl border border-white/5 text-zinc-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#c5a880]">
                      Estilo Tipográfico:
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(extractedTypography)
                      }
                      className="text-[10px] text-zinc-500 hover:text-white underline"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="font-mono leading-relaxed select-all text-zinc-300 bg-[#0b0b0c] p-2 rounded-lg">
                    {extractedTypography}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Author Badge */}
                <span className="text-[10px] text-zinc-500 mb-1 px-1 font-mono">
                  {m.role === "user" ? "Você" : "Zion AI"}
                </span>
                <div
                  className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#c5a880] text-zinc-950 rounded-tr-none font-medium"
                      : "bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] text-zinc-200 rounded-tl-none"
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips (only in Chat mode) */}
      {mode === "chat" && (
        <div className="px-4 py-2 border-t border-white/5 bg-[#050505] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="inline-block text-[10px] font-bold text-zinc-400 bg-[#0b0b0c] hover:bg-zinc-800 border border-white/5 rounded-full px-3 py-1.5 transition-all hover:text-[#c5a880]"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="p-3 border-t border-white/5 bg-[#0b0b0c] flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            mode === "chat"
              ? "Pergunte algo ao assistente..."
              : "Selecione um recurso acima..."
          }
          disabled={mode === "extract"}
          className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c5a880]/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => handleSend()}
          disabled={mode === "extract" || !input.trim()}
          className="bg-[#c5a880] text-zinc-950 p-2.5 rounded-xl hover:bg-[#c5a880]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={16} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value or default to today
  const parsedDate = value ? new Date(value + "T12:00:00") : new Date();
  const [pickerYear, setPickerYear] = useState(parsedDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(parsedDate.getMonth()); // 0-indexed

  // Months array
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Years array (2025 to 2030)
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  // Days in month
  const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  // First day of month (0 = Sun, 1 = Mon, etc.)
  const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(pickerMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    onChange(`${pickerYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? (() => {
        try {
          const [y, m, d] = value.split("-");
          return `${d}/${m}/${y}`;
        } catch (e) {
          return value;
        }
      })()
    : "Selecione uma data";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white text-left focus:outline-none focus:border-[#c5a880]/50 flex items-center justify-between font-mono hover:bg-[#0b0b0c] transition-colors"
      >
        <span>{formattedDisplay}</span>
        <Calendar size={16} className="text-zinc-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 bg-[#0b0b0c] border border-white/10 rounded-xl p-8 shadow-2xl z-50 w-72 text-left">
            {/* Header: Month and Year Selector */}
            <div className="flex gap-2 mb-3">
              <select
                value={pickerMonth}
                onChange={(e) => setPickerMonth(Number(e.target.value))}
                className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={pickerYear}
                onChange={(e) => setPickerYear(Number(e.target.value))}
                className="bg-[#050505] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-zinc-500 mb-1.5 uppercase">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty spaces before first day */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedM = String(pickerMonth + 1).padStart(2, "0");
                const formattedD = String(day).padStart(2, "0");
                const currentDayStr = `${pickerYear}-${formattedM}-${formattedD}`;
                const isSelected = value === currentDayStr;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-[#c5a880] text-zinc-950 scale-105"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", // Executive Woman
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", // Executive Man
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", // Professional Woman
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", // Business Owner
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // Creative Lead
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", // Tech Entrepreneur
];

export default function App() {
  const [activeTab, setActiveTab] = useState("ai-tools");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  );
  const [activeAiTab, setActiveAiTab] = useState("image");
  const [viewMode, setViewMode] = useState<"admin" | "client">("admin");
  const [selectedPortalClientId, setSelectedPortalClientId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("zion_selected_portal_client_id");
      return saved ? Number(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeClientTab, setActiveClientTab] = useState("overview");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Migrate localstorage: clean up any old API keys stored as workspace keys
    try {
      const wsKey = localStorage.getItem("zion_workspace_key");
      // If workspace key looks like an API key (starts with AQ.), reset it to ZION-MASTER
      if (wsKey && wsKey.startsWith("AQ.")) {
        localStorage.setItem("zion_workspace_key", "ZION-MASTER");
      }
      
      const customKey = localStorage.getItem("custom_gemini_api_key");
      const keyCleared = localStorage.getItem("custom_key_cleared_for_vertex_v2");
      if (customKey && !keyCleared) {
        console.log("Limpando chave de API customizada antiga para usar o Vertex AI oficial do servidor...");
        localStorage.removeItem("custom_gemini_api_key");
        localStorage.setItem("custom_key_cleared_for_vertex_v2", "true");
        // Forçar reload rápido para aplicar a limpeza
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        localStorage.setItem("custom_key_cleared_for_vertex_v2", "true");
      }
    } catch (e) {
      console.error("Migration error:", e);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  React.useEffect(() => {
    if (selectedPortalClientId !== null) {
      localStorage.setItem("zion_selected_portal_client_id", String(selectedPortalClientId));
    } else {
      localStorage.removeItem("zion_selected_portal_client_id");
    }
  }, [selectedPortalClientId]);

  // Ref to track if initial load from Firestore has completed to prevent wiping out data
  const isInitialLoadCompletedRef = React.useRef(false);

  // Workspace Key and Cloud Sync states
  const [workspaceKey, setWorkspaceKey] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const wsParam = params.get("ws") || params.get("workspace");
    if (wsParam && wsParam.trim().length >= 4) {
      const cleanKey = wsParam.trim().toUpperCase();
      localStorage.setItem("zion_workspace_key", cleanKey);
      return cleanKey;
    }
    const saved = localStorage.getItem("zion_workspace_key");
    if (saved && saved.trim().length >= 4) {
      const upperSaved = saved.trim().toUpperCase();
      // If it's a legacy auto-generated key, migrate it to the shared ZION-MASTER key
      if (
        upperSaved.startsWith("ZION-") &&
        upperSaved !== "ZION-MASTER" &&
        !wsParam
      ) {
        localStorage.setItem("zion_workspace_key", "ZION-MASTER");
        return "ZION-MASTER";
      }
      return upperSaved;
    }
    localStorage.setItem("zion_workspace_key", "ZION-MASTER");
    return "ZION-MASTER";
  });

  const [isChangingWorkspace, setIsChangingWorkspace] = useState(false);
  const [tempWorkspaceKey, setTempWorkspaceKey] = useState("");
  const [workspaceCopied, setWorkspaceCopied] = useState(false);

  // Synchronize workspace key with the URL so it's easily shareable/copyable
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("ws") !== workspaceKey) {
      params.set("ws", workspaceKey);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
  }, [workspaceKey]);

  // Google Calendar integration states
  const [gcalToken, setGcalToken] = useState<string | null>(null);
  const [gcalUser, setGcalUser] = useState<any | null>(null);
  const [isGcalSyncing, setIsGcalSyncing] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const activeSyncKey = workspaceKey;

  // AI Assistant State (Text)
  // TODO: Refactor UI to use TabbedContent component
  const [copyType, setCopyType] = useState("Legenda para Instagram");
  const [copyTopic, setCopyTopic] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Card Generator Zustand Integration
  const {
    imgConfig, updateImgConfig,
    personRefs, setPersonRefs, addPersonRef, removePersonRef,
    envRefs, setEnvRefs, addEnvRef, removeEnvRef,
    styleRefs, setStyleRefs, addStyleRef, removeStyleRef, updateStyleRefDescription,
    logoRefs, setLogoRefs, addLogoRef, removeLogoRef, updateLogoRef,
    generatedImages, setGeneratedImages,
    aiThought, setAiThought,
    savedCards, setSavedCards,
    isGeneratingImage, setIsGeneratingImage,
    generationProgress, setGenerationProgress,
    activeSubTab, setActiveSubTab,
    canvasImage, setCanvasImage,
    maskImage, setCanvasImage: setMaskImage, // map canvas helper to update mask locally
    brushSize, setBrushSize,
    brushMode, setBrushMode,
    inpaintPrompt, setInpaintPrompt,
    isInpainting,
    generateImage,
    applyInpainting
  } = useImageStore();

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "person" | "env" | "style" | "logo",
  ) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result;
          if (typeof result !== "string") return;
          const base64String = result.split(",")[1];
          if (!base64String) return;
          const newRef = {
            url: URL.createObjectURL(file),
            data: base64String,
            mimeType: file.type,
          };
          if (type === "person") addPersonRef(newRef);
          else if (type === "env") addEnvRef(newRef);
          else if (type === "logo")
            addLogoRef({ ...newRef, position: "Top Left", size: 100 });
          else
            addStyleRef({ ...newRef, description: "" });
        } catch (error) {
          console.error("Error processing file:", error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeRef = (index: number, type: "person" | "env" | "style" | "logo") => {
    if (type === "person") removePersonRef(index);
    else if (type === "env") removeEnvRef(index);
    else if (type === "logo") removeLogoRef(index);
    else removeStyleRef(index);
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteClient, setNoteClient] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  // Visual Builder Local UI States
  const [visualProjects, setVisualProjects] = useState([
    { id: "alpha", name: "Projeto Alpha" },
    { id: "medium", name: "Medium shot of..." },
    { id: "web", name: "Web Builder" },
    { id: "new", name: "Novo Projeto" },
    { id: "dentist", name: "Dentista espec..." }
  ]);
  const [activeProjectId, setActiveProjectId] = useState("new");
  const [visualOrTextTab, setVisualOrTextTab] = useState<"visual" | "texto">("visual");
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("left");
  const [textStyle, setTextStyle] = useState("MODERN");
  const [activePosition, setActivePosition] = useState<"ESQUERDA" | "CENTRO" | "DIREITA">("CENTRO");
  const [activeComposition, setActiveComposition] = useState("Plano Médio (Busto)");
  const [activeDimension, setActiveDimension] = useState("1:1");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeExportFormat, setActiveExportFormat] = useState<"AVIF" | "PNG" | "JPEG" | "WebP">("AVIF");
  const [zoomLevel, setZoomLevel] = useState(70);
  const [maskVisible, setMaskVisible] = useState(true);
  const [showPromptAdicional, setShowPromptAdicional] = useState(false);
  const [visualStyleActive, setVisualStyleActive] = useState(true);
  const [useSceneRefs, setUseSceneRefs] = useState(false);

  const [clientPalette, setClientPalette] = useState<string[]>([
    "#000000",
    "#ffffff",
  ]);
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: "color" as "color" | "image",
    colors: ["#000000", "#ffffff"],
    images: [] as string[],
  });

  // Load logo settings from localStorage
  React.useEffect(() => {
    try {
      const savedLogos = localStorage.getItem("logoRefs");
      if (savedLogos) {
        setLogoRefs(JSON.parse(savedLogos));
      }
    } catch (error) {
      console.error("Error loading logos from localStorage:", error);
    }
  }, []);

  // Google Sheets Data Integration (Legacy) removed as requested. We are using strictly Firebase.

  // Save logo settings to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("logoRefs", JSON.stringify(logoRefs));
    } catch (error) {
      console.error("Error saving logos to localStorage:", error);
    }
  }, [logoRefs]);



  // --- STATE WITH DURABLE OFFLINE PERSISTENCE & PROFESSIONAL MOCK DATA ---

  // Clients State
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem("zion_clients");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("zion_tasks");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Finances (Transactions) State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("zion_transactions");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Calendar Events State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem("zion_calendar_events");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("zion_notifications");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // WhatsApp Logs State
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("zion_whatsapp_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Saved Notes State
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const saved = localStorage.getItem("zion_saved_notes");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Task Organization & Filtering States
  const [taskSearch, setTaskSearch] = useState("");
  const [taskClientFilter, setTaskClientFilter] = useState("all");
  const [taskViewMode, setTaskViewMode] = useState<"kanban" | "client">("kanban");

  const handleLoadDemoData = () => {
    const demoClients: Client[] = [
      {
        id: 1,
        name: "Dr. Silva (Odonto)",
        niche: "Odontologia",
        status: "Ativo",
        contact: "(11) 99999-9999",
        plan: "Premium (R$ 1.500/mês)",
        planValue: 1500,
        dueDate: "2026-06-10",
        paymentStatus: "Em dia",
        startDate: "2026-01-10",
        notes:
          "Contato prioritário por WhatsApp. Foco em campanhas de implante.",
      },
      {
        id: 2,
        name: "Estética Beauty",
        niche: "Beleza & Estética",
        status: "Ativo",
        contact: "(11) 88888-8888",
        plan: "Basic (R$ 1.200/mês)",
        planValue: 1200,
        dueDate: "2026-06-15",
        paymentStatus: "Em dia",
        startDate: "2026-02-15",
        notes:
          "Gosta de conteúdos dinâmicos e fotos de antes/depois da clínica.",
      },
      {
        id: 3,
        name: "Tech Solutions",
        niche: "Tecnologia B2B",
        status: "Prospecção",
        contact: "contato@tech.com",
        plan: "Custom (R$ 3.000/mês)",
        planValue: 3000,
        dueDate: "2026-06-05",
        paymentStatus: "Pendente",
        startDate: "2026-06-01",
        notes: "Aguardando aprovação formal do contrato de tráfego de leads.",
      },
      {
        id: 4,
        name: "Sispumumc",
        niche: "Sindicato dos Servidores Públicos",
        status: "Ativo",
        contact: "(74) 9.9807-3287",
        plan: "Presença Local (R$ 829/mês)",
        planDetails:
          "2 Posts Estratégicos por semana (8/mês)\n1 Vídeo Reels Dinâmico por semana (4/mês)\nGestão de Legendas e Agendamento\nTráfego Local Incluso (R$ 150 de verba)\nRelatório Mensal de Alcance",
        planValue: 829,
        dueDate: "2026-06-20",
        paymentStatus: "Em dia",
        startDate: "2026-03-20",
        notes: "Publicar sempre em tom institucional e informativo.",
      },
    ];
    const demoTasks: Task[] = [
      {
        id: 1,
        title: "Criar roteiro de Reels",
        status: "todo",
        client: "Dr. Silva (Odonto)",
        hasDeadline: true,
        dueDate: "2026-06-24",
      },
      {
        id: 2,
        title: "Configurar campanha Meta Ads",
        status: "doing",
        client: "Estética Beauty",
        hasDeadline: true,
        dueDate: "2026-06-30",
      },
      {
        id: 3,
        title: "Aprovar identidade visual",
        status: "done",
        client: "Tech Solutions",
        hasDeadline: false,
      },
    ];
    const demoTransactions: Transaction[] = [
      // Janeiro
      {
        id: 1,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-01-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 2,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-01-01",
        category: "Ferramentas",
        status: "pago",
      },

      // Fevereiro
      {
        id: 3,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-02-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 4,
        description: "Mensalidade Estética Beauty",
        type: "receita",
        amount: 1200,
        date: "2026-02-15",
        category: "Contratos",
        status: "pago",
        client: "Estética Beauty",
      },
      {
        id: 5,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-02-01",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 6,
        description: "Freelancer Copywriting",
        type: "despesa",
        amount: 250,
        date: "2026-02-18",
        category: "Freelancers",
        status: "pago",
      },

      // Março
      {
        id: 7,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-03-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 8,
        description: "Mensalidade Estética Beauty",
        type: "receita",
        amount: 1200,
        date: "2026-03-15",
        category: "Contratos",
        status: "pago",
        client: "Estética Beauty",
      },
      {
        id: 9,
        description: "Mensalidade Sispumumc",
        type: "receita",
        amount: 829,
        date: "2026-03-20",
        category: "Contratos",
        status: "pago",
        client: "Sispumumc",
      },
      {
        id: 10,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-03-01",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 11,
        description: "Campanha Tráfego Local",
        type: "despesa",
        amount: 150,
        date: "2026-03-10",
        category: "Tráfego Ads",
        status: "pago",
      },

      // Abril
      {
        id: 12,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-04-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 13,
        description: "Mensalidade Estética Beauty",
        type: "receita",
        amount: 1200,
        date: "2026-04-15",
        category: "Contratos",
        status: "pago",
        client: "Estética Beauty",
      },
      {
        id: 14,
        description: "Mensalidade Sispumumc",
        type: "receita",
        amount: 829,
        date: "2026-04-20",
        category: "Contratos",
        status: "pago",
        client: "Sispumumc",
      },
      {
        id: 15,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-04-01",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 16,
        description: "Assinatura Midjourney Studio",
        type: "despesa",
        amount: 150,
        date: "2026-04-05",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 17,
        description: "Anúncios Google Ads",
        type: "despesa",
        amount: 300,
        date: "2026-04-12",
        category: "Tráfego Ads",
        status: "pago",
      },

      // Maio
      {
        id: 18,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-05-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 19,
        description: "Mensalidade Estética Beauty",
        type: "receita",
        amount: 1200,
        date: "2026-05-15",
        category: "Contratos",
        status: "pago",
        client: "Estética Beauty",
      },
      {
        id: 20,
        description: "Mensalidade Sispumumc",
        type: "receita",
        amount: 829,
        date: "2026-05-20",
        category: "Contratos",
        status: "pago",
        client: "Sispumumc",
      },
      {
        id: 21,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-05-01",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 22,
        description: "Assinatura Midjourney Studio",
        type: "despesa",
        amount: 150,
        date: "2026-05-05",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 23,
        description: "Campanha de Tráfego - Sispumumc",
        type: "despesa",
        amount: 150,
        date: "2026-05-10",
        category: "Tráfego Ads",
        status: "pago",
        client: "Sispumumc",
      },
      {
        id: 24,
        description: "Freelancer Designer Motion",
        type: "despesa",
        amount: 500,
        date: "2026-05-18",
        category: "Freelancers",
        status: "pago",
      },

      // Junho
      {
        id: 25,
        description: "Mensalidade Dr. Silva (Odonto)",
        type: "receita",
        amount: 1500,
        date: "2026-06-10",
        category: "Contratos",
        status: "pago",
        client: "Dr. Silva (Odonto)",
      },
      {
        id: 26,
        description: "Mensalidade Estética Beauty",
        type: "receita",
        amount: 1200,
        date: "2026-06-15",
        category: "Contratos",
        status: "pago",
        client: "Estética Beauty",
      },
      {
        id: 27,
        description: "Assinatura Canva Pro",
        type: "despesa",
        amount: 35,
        date: "2026-06-01",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 28,
        description: "Assinatura Midjourney Studio",
        type: "despesa",
        amount: 150,
        date: "2026-06-05",
        category: "Ferramentas",
        status: "pago",
      },
      {
        id: 29,
        description: "Campanha de Tráfego - Sispumumc",
        type: "despesa",
        amount: 150,
        date: "2026-06-10",
        category: "Tráfego Ads",
        status: "pago",
        client: "Sispumumc",
      },
      {
        id: 30,
        description: "Freelancer Design Gráfico",
        type: "despesa",
        amount: 450,
        date: "2026-06-18",
        category: "Freelancers",
        status: "pago",
      },
      {
        id: 31,
        description: "Mensalidade Sispumumc",
        type: "receita",
        amount: 829,
        date: "2026-06-20",
        category: "Contratos",
        status: "pago",
        client: "Sispumumc",
      },
    ];
    const demoEvents: CalendarEvent[] = [
      {
        id: 1,
        title: "Gravação de Reels",
        date: "2026-06-26",
        time: "14:00",
        clientName: "Estética Beauty",
        description:
          "Gravar 4 vídeos de dicas de skin care com a especialista.",
        type: "entrega",
      },
      {
        id: 2,
        title: "Post: Informativo de Saúde Bucal",
        date: "2026-06-27",
        time: "10:00",
        clientName: "Dr. Silva (Odonto)",
        description: "Post em carrossel sobre prevenção de tártaro.",
        type: "post",
      },
      {
        id: 3,
        title: "Reunião Mensal de Resultados",
        date: "2026-06-29",
        time: "16:00",
        clientName: "Sispumumc",
        description: "Apresentar relatório de tráfego pago e alcance orgânico.",
        type: "reuniao",
      },
      {
        id: 4,
        title: "Reunião de Alinhamento B2B",
        date: "2026-06-30",
        time: "11:00",
        clientName: "Tech Solutions",
        description: "Reunião de fechamento com os diretores comerciais.",
        type: "reuniao",
      },
    ];
    const demoNotifications: NotificationItem[] = [
      {
        id: 1,
        message: "Fatura de Sispumumc (R$ 829) vence em 5 dias.",
        date: "2026-06-25",
        read: false,
        type: "warning",
      },
      {
        id: 2,
        message: "Gravação de Reels com Estética Beauty amanhã às 14:00.",
        date: "2026-06-25",
        read: false,
        type: "info",
      },
      {
        id: 3,
        message: "Meta Ads de Estética Beauty otimizado com sucesso.",
        date: "2026-06-24",
        read: true,
        type: "success",
      },
    ];

    setClients(demoClients);
    setTasks(demoTasks);
    setTransactions(demoTransactions);
    setCalendarEvents(demoEvents);
    setNotifications(demoNotifications);

    localStorage.setItem("zion_clients", JSON.stringify(demoClients));
    localStorage.setItem("zion_tasks", JSON.stringify(demoTasks));
    localStorage.setItem("zion_transactions", JSON.stringify(demoTransactions));
    localStorage.setItem("zion_calendar_events", JSON.stringify(demoEvents));
    localStorage.setItem(
      "zion_notifications",
      JSON.stringify(demoNotifications),
    );

    // notify
    const notif: NotificationItem = {
      id: Date.now(),
      message:
        "Dados de demonstração carregados com sucesso! Explore os painéis, finanças e calendário.",
      date: new Date().toISOString().split("T")[0],
      read: false,
      type: "success",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // --- SAVE STATES TO LOCAL STORAGE ---
  React.useEffect(() => {
    localStorage.setItem("zion_clients", JSON.stringify(clients));
  }, [clients]);

  // Automatically calculate client payment statuses based on transactions and dueDates
  React.useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let changed = false;
    const updatedClients = clients.map((client) => {
      if (client.status !== "Ativo") return client;

      // Find paid receita in the current month/year for this client
      const hasPaidThisMonth = transactions.some((t) => {
        if (t.client !== client.name) return false;
        if (t.type !== "receita") return false;
        if (t.status !== "pago") return false;
        if (!t.date || typeof t.date !== "string") return false;
        const parts = t.date.split("-");
        if (parts.length < 3) return false;
        const tYear = Number(parts[0]);
        const tMonth = Number(parts[1]);
        return tYear === currentYear && tMonth === currentMonth;
      });

      let calculatedStatus: "Em dia" | "Atrasado" | "Pendente" = "Pendente";
      if (hasPaidThisMonth) {
        calculatedStatus = "Em dia";
      } else if (
        (typeof client.dueDate === "string" &&
          client.dueDate.includes("-") &&
          new Date().toISOString().split("T")[0] > client.dueDate) ||
        ((typeof client.dueDate === "number" ||
          (typeof client.dueDate === "string" &&
            !client.dueDate.includes("-"))) &&
          currentDay > Number(client.dueDate))
      ) {
        calculatedStatus = "Atrasado";
      } else {
        calculatedStatus = "Pendente";
      }

      if (client.paymentStatus !== calculatedStatus) {
        changed = true;
        return { ...client, paymentStatus: calculatedStatus };
      }
      return client;
    });

    if (changed) {
      setClients(updatedClients);
    }
  }, [transactions, clients]);

  React.useEffect(() => {
    localStorage.setItem("zion_tasks", JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem("zion_transactions", JSON.stringify(transactions));
  }, [transactions]);

  React.useEffect(() => {
    localStorage.setItem(
      "zion_calendar_events",
      JSON.stringify(calendarEvents),
    );
  }, [calendarEvents]);

  React.useEffect(() => {
    localStorage.setItem("zion_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Calendar view state
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)

  // Custom user profile and transaction categories
  const [myProfile, setMyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("zion_my_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "Equipe Zion",
      role: "Agência Digital",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    };
  });

  const [transactionCategories, setTransactionCategories] = useState<string[]>(
    () => {
      try {
        const saved = localStorage.getItem("zion_transaction_categories");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        "Contratos",
        "Serviços Avulsos",
        "Ferramentas",
        "Tráfego Ads",
        "Freelancers",
        "Infraestrutura",
        "Outros",
      ];
    },
  );

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(() => {
    try {
      const saved = localStorage.getItem("chatMessages");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  React.useEffect(() => {
    localStorage.setItem("zion_my_profile", JSON.stringify(myProfile));
  }, [myProfile]);

  React.useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  React.useEffect(() => {
    localStorage.setItem(
      "zion_transaction_categories",
      JSON.stringify(transactionCategories),
    );
  }, [transactionCategories]);

  // Modal and custom Form States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilterStatus, setClientFilterStatus] = useState("todos");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskMode, setTaskMode] = useState<'manual' | 'ai'>('manual');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactionForm, setTransactionForm] = useState<Partial<Transaction>>(
    {},
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({});

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Form States
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [parseInputText, setParseInputText] = useState("");
  const [parseInputFile, setParseInputFile] = useState<File | null>(null);
  const [isParsingTask, setIsParsingTask] = useState(false);

  // Force a synchronized local backup to localStorage when ending/refreshing the session
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("zion_clients", JSON.stringify(clients));
      localStorage.setItem("zion_tasks", JSON.stringify(tasks));
      localStorage.setItem("zion_transactions", JSON.stringify(transactions));
      localStorage.setItem("zion_calendar_events", JSON.stringify(calendarEvents));
      localStorage.setItem("zion_notifications", JSON.stringify(notifications));
      localStorage.setItem("zion_my_profile", JSON.stringify(myProfile));
      localStorage.setItem("logoRefs", JSON.stringify(logoRefs));
      localStorage.setItem("savedCards", JSON.stringify(savedCards));
      localStorage.setItem("zion_saved_notes", JSON.stringify(savedNotes));
      localStorage.setItem("chatMessages", JSON.stringify(messages));
      if (workspaceKey) {
        localStorage.setItem("zion_workspace_key_backup", workspaceKey);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBeforeUnload();
        if (activeSyncKey) {
          try {
            const sanitizedData = JSON.parse(JSON.stringify({
              userId: activeSyncKey,
              updatedAt: new Date().toISOString(),
              clients,
              tasks,
              transactions,
              calendarEvents,
              notifications,
              myProfile,
              transactionCategories,
              logoRefs,
              savedCards,
              savedNotes,
              messages,
            }));
            supabase.from('users').upsert(sanitizedData).then(({ error }) => {
              if (error) console.error("Error on visibilitychange Supabase sync:", error);
            });
          } catch(e) {}
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    clients,
    tasks,
    transactions,
    calendarEvents,
    notifications,
    myProfile,
    logoRefs,
    savedCards,
    savedNotes,
    messages,
    activeSyncKey,
  ]);

  // Real-time cloud synchronization states and refs
  const isSyncingFromServerRef = React.useRef(false);
  const lastSyncFromServerTimeRef = React.useRef(0);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // 1. Fetch & Sync from Supabase on Workspace Key load
  React.useEffect(() => {
    if (!activeSyncKey) {
      setIsAuthLoading(false);
      return;
    }

    isInitialLoadCompletedRef.current = false;

    let subscription: { unsubscribe: () => void } | null = null;

    const setupSync = async () => {
      setIsCloudSyncing(true);
      console.log("DEBUG: Syncing with Supabase table users for activeSyncKey:", activeSyncKey);

      try {
        const { data: dbData, error: getError } = await supabase
          .from('users')
          .select('data')
          .eq('id', activeSyncKey)
          .maybeSingle();

        if (getError) throw getError;

        let data = dbData?.data;

        if (!data) {
          console.log("Iniciando backup local para o workspace na nuvem...");
          const sanitizedData = JSON.parse(JSON.stringify({
            userId: activeSyncKey,
            updatedAt: new Date().toISOString(),
            clients,
            tasks,
            transactions,
            calendarEvents,
            notifications,
            myProfile,
            transactionCategories,
            logoRefs,
            savedCards,
            savedNotes,
            messages,
          }));
          await supabase.from('users').upsert({
            id: activeSyncKey,
            updated_at: new Date().toISOString(),
            data: sanitizedData
          });
          data = sanitizedData;
        }

        // Apply loaded data to state
        isSyncingFromServerRef.current = true;
        lastSyncFromServerTimeRef.current = Date.now();

        setClients(data.clients || []);
        setTasks(data.tasks || []);
        setTransactions(data.transactions || []);
        setCalendarEvents(data.calendarEvents || []);
        setNotifications(data.notifications || []);
        setWhatsappLogs(data.whatsappLogs || []);
        setMyProfile(data.myProfile || {
          name: "Equipe Zion",
          role: "Agência Digital",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        });
        setTransactionCategories(data.transactionCategories || []);
        setLogoRefs(data.logoRefs || []);
        setSavedCards(data.savedCards || []);
        setSavedNotes(data.savedNotes || []);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }

        setTimeout(() => {
          isSyncingFromServerRef.current = false;
        }, 500);

        setIsCloudSyncing(false);
        setIsAuthLoading(false);
        isInitialLoadCompletedRef.current = true;

        // Real-time synchronization
        const channel = supabase
          .channel(`users-sync-${activeSyncKey}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${activeSyncKey}`
            },
            (payload) => {
              if (payload.new && (payload.new as any).data) {
                const newData = (payload.new as any).data;
                isSyncingFromServerRef.current = true;
                lastSyncFromServerTimeRef.current = Date.now();

                setClients(newData.clients || []);
                setTasks(newData.tasks || []);
                setTransactions(newData.transactions || []);
                setCalendarEvents(newData.calendarEvents || []);
                setNotifications(newData.notifications || []);
                setWhatsappLogs(newData.whatsappLogs || []);
                setMyProfile(newData.myProfile || {
                  name: "Equipe Zion",
                  role: "Agência Digital",
                  avatarUrl:
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                });
                setTransactionCategories(newData.transactionCategories || []);
                setLogoRefs(newData.logoRefs || []);
                setSavedCards(newData.savedCards || []);
                setSavedNotes(newData.savedNotes || []);
                if (newData.messages && newData.messages.length > 0) {
                  setMessages(newData.messages);
                }

                setTimeout(() => {
                  isSyncingFromServerRef.current = false;
                }, 500);
              }
            }
          )
          .subscribe();

        subscription = {
          unsubscribe: () => {
            supabase.removeChannel(channel);
          }
        };

      } catch (err) {
        console.error("Erro na sincronização inicial do Supabase:", err);
        setIsCloudSyncing(false);
        setIsAuthLoading(false);
        isInitialLoadCompletedRef.current = true;
      }
    };

    setupSync(); setTimeout(() => { setIsAuthLoading(false); }, 3000);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [activeSyncKey]);

  // 2. Auto-save to Firestore on State Changes with 2-second debounce
  React.useEffect(() => {
    if (!activeSyncKey) return;
    if (!isInitialLoadCompletedRef.current) return;
    if (isSyncingFromServerRef.current) return;

    console.log("DEBUG: Auto-save useEffect triggered. Syncing state...");
    const timeoutId = setTimeout(async () => {
      if (isSyncingFromServerRef.current) {
        console.log("DEBUG: Skipping sync due to isSyncingFromServerRef");
        return;
      }
      
      console.log("DEBUG: Auto-save timeout reached. Syncing to Supabase...");
      try {
        const sanitizedData = JSON.parse(JSON.stringify({
          userId: activeSyncKey,
          updatedAt: new Date().toISOString(),
          clients,
          tasks,
          transactions,
          calendarEvents,
          notifications,
          myProfile,
          transactionCategories,
          logoRefs,
          savedCards,
          savedNotes,
          messages,
          whatsappLogs,
        }));
        await supabase.from('users').upsert({
          id: activeSyncKey,
          updated_at: new Date().toISOString(),
          data: sanitizedData
        });
        localStorage.setItem("zion_last_local_update", new Date().toISOString());
        console.log(
          "Sincronizado com o Supabase com sucesso para o workspace:",
          activeSyncKey,
        );
      } catch (err) {
        console.error("Erro na sincronização de nuvem:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    clients,
    tasks,
    transactions,
    calendarEvents,
    notifications,
    myProfile,
    transactionCategories,
    logoRefs,
    savedCards,
    savedNotes,
    messages,
    whatsappLogs,
    activeSyncKey,
  ]);

  const saveToFirestoreDirectly = async (updatedFields: {
    tasks?: Task[];
    clients?: Client[];
    transactions?: Transaction[];
    calendarEvents?: CalendarEvent[];
    notifications?: NotificationItem[];
    myProfile?: any;
    savedNotes?: any[];
    messages?: any[];
  }) => {
    if (!activeSyncKey) return;

    // Optimistically update localStorage
    if (updatedFields.tasks) localStorage.setItem("zion_tasks", JSON.stringify(updatedFields.tasks));
    if (updatedFields.clients) localStorage.setItem("zion_clients", JSON.stringify(updatedFields.clients));
    if (updatedFields.transactions) localStorage.setItem("zion_transactions", JSON.stringify(updatedFields.transactions));
    if (updatedFields.calendarEvents) localStorage.setItem("zion_calendar_events", JSON.stringify(updatedFields.calendarEvents));
    if (updatedFields.notifications) localStorage.setItem("zion_notifications", JSON.stringify(updatedFields.notifications));
    if (updatedFields.myProfile) localStorage.setItem("zion_my_profile", JSON.stringify(updatedFields.myProfile));
    if (updatedFields.savedNotes) localStorage.setItem("zion_saved_notes", JSON.stringify(updatedFields.savedNotes));

    try {
      // Temporarily ignore snapshot updates while we are writing to prevent race conditions
      isSyncingFromServerRef.current = true;

      const sanitizedData = JSON.parse(JSON.stringify({
        userId: activeSyncKey,
        updatedAt: new Date().toISOString(),
        clients: updatedFields.clients !== undefined ? updatedFields.clients : clients,
        tasks: updatedFields.tasks !== undefined ? updatedFields.tasks : tasks,
        transactions: updatedFields.transactions !== undefined ? updatedFields.transactions : transactions,
        calendarEvents: updatedFields.calendarEvents !== undefined ? updatedFields.calendarEvents : calendarEvents,
        notifications: updatedFields.notifications !== undefined ? updatedFields.notifications : notifications,
        myProfile: updatedFields.myProfile !== undefined ? updatedFields.myProfile : myProfile,
        transactionCategories,
        logoRefs,
        savedCards,
        savedNotes: updatedFields.savedNotes !== undefined ? updatedFields.savedNotes : savedNotes,
        messages: updatedFields.messages !== undefined ? updatedFields.messages : messages,
        whatsappLogs,
      }));

      await supabase.from('users').upsert({
        id: activeSyncKey,
        updated_at: new Date().toISOString(),
        data: sanitizedData
      });
      localStorage.setItem("zion_last_local_update", new Date().toISOString());
      console.log("Direct save to Supabase completed successfully!");
    } catch (err) {
      console.error("Error in direct save to Supabase:", err);
    } finally {
      // Re-enable snapshot syncing after a brief delay
      setTimeout(() => {
        isSyncingFromServerRef.current = false;
      }, 1000);
    }
  };

  // Financial Calculators
  const mrr = clients
    .filter((c) => c.status === "Ativo")
    .reduce((sum, c) => sum + (c.planValue || 0), 0);

  const totalReceitas = transactions
    .filter((t) => t.type === "receita" && t.status === "pago")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactionsAmount = transactions
    .filter((t) => t.type === "receita" && t.status === "pendente")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingMonthlyAmount = clients
    .filter((c) => c.status === "Ativo" && c.paymentStatus !== "Em dia")
    .reduce((sum, c) => sum + (c.planValue || 0), 0);

  const pendingInvoicesExpiringSoon = clients.filter((client) => {
    if (client.status !== "Ativo" || client.paymentStatus !== "Pendente") return false;
    const now = new Date();
    let dueDateObj: Date;
    if (typeof client.dueDate === "string" && client.dueDate.includes("-")) {
      const [y, m, d] = client.dueDate.split("-").map(Number);
      dueDateObj = new Date(y, m - 1, d);
    } else {
      dueDateObj = new Date(now.getFullYear(), now.getMonth(), Number(client.dueDate));
    }
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysDiff = Math.round((dueDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 3;
  });

  const totalAReceber = pendingTransactionsAmount + pendingMonthlyAmount;

  const totalDespesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + t.amount, 0);

  const liquidIncome = totalReceitas - totalDespesas;

  // Filter clients dynamically based on search and selected status
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes((clientSearch || "").toLowerCase()) ||
      (c.niche || "").toLowerCase().includes((clientSearch || "").toLowerCase()) ||
      (c.contact || "").toLowerCase().includes((clientSearch || "").toLowerCase());
    const matchesStatus =
      clientFilterStatus === "todos" || c.status === clientFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter and group tasks dynamically based on search, client, and view mode
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || "").toLowerCase().includes((taskSearch || "").toLowerCase()) ||
      (task.description || "").toLowerCase().includes((taskSearch || "").toLowerCase());
    
    const matchesClient =
      taskClientFilter === "all" ||
      (taskClientFilter === "none" && (!task.client || task.client.trim() === "")) ||
      task.client === taskClientFilter;
      
    return matchesSearch && matchesClient;
  });

  // Get list of unique client names from both registered clients and active tasks
  const availableClientsForTasks = Array.from(
    new Set([
      ...clients.map((c) => c.name),
      ...tasks.map((t) => t.client).filter((c): c is string => typeof c === "string" && c.trim() !== ""),
    ])
  );

  // Group filtered tasks by client
  const tasksByClient: { [key: string]: Task[] } = {};
  filteredTasks.forEach((task) => {
    const clientName = task.client && task.client.trim() !== "" ? task.client : "Sem Cliente";
    if (!tasksByClient[clientName]) {
      tasksByClient[clientName] = [];
    }
    tasksByClient[clientName].push(task);
  });

  // Dynamic 6-month historical calculations for the Cash Flow chart
  const getMonthlyData = () => {
    const monthlyList = [
      { name: "JAN", month: 0, revenue: 0, expense: 0 },
      { name: "FEV", month: 1, revenue: 0, expense: 0 },
      { name: "MAR", month: 2, revenue: 0, expense: 0 },
      { name: "ABR", month: 3, revenue: 0, expense: 0 },
      { name: "MAI", month: 4, revenue: 0, expense: 0 },
      { name: "JUN", month: 5, revenue: 0, expense: 0 },
    ];

    transactions.forEach((t) => {
      try {
        const d = new Date(t.date);
        if (d.getFullYear() === 2026) {
          const m = d.getMonth();
          if (m >= 0 && m <= 5) {
            if (t.type === "receita") {
              monthlyList[m].revenue += t.amount;
            } else {
              monthlyList[m].expense += t.amount;
            }
          }
        }
      } catch (e) {
        console.error("Erro ao processar transação para gráfico:", e);
      }
    });
    return monthlyList;
  };

  const monthlyData = getMonthlyData();
  const maxChartVal =
    Math.max(...monthlyData.map((m) => Math.max(m.revenue, m.expense, 1000))) *
    1.15;

  // Calculate SVG Points for the Cash Flow graph
  const chartPoints = monthlyData.map((d, i) => {
    // Offset X to make room for Y Axis labels
    const x = 70 + i * 80;
    // Y maps from 200 (value=0) to 30 (value=maxChartVal)
    const yRev = 200 - (d.revenue / maxChartVal) * 170;
    const yExp = 200 - (d.expense / maxChartVal) * 170;
    return {
      x,
      yRev,
      yExp,
      revenue: d.revenue,
      expense: d.expense,
      name: d.name,
    };
  });

  // Construct SVG path strings safely
  const revLinePath = chartPoints.map((p) => `${p.x},${p.yRev}`).join(" L ");
  const expLinePath = chartPoints.map((p) => `${p.x},${p.yExp}`).join(" L ");

  const revAreaPath = `M ${chartPoints[0].x},200 L ${revLinePath} L ${chartPoints[chartPoints.length - 1].x},200 Z`;
  const expAreaPath = `M ${chartPoints[0].x},200 L ${expLinePath} L ${chartPoints[chartPoints.length - 1].x},200 Z`;

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleSaveClient = () => {
    if (
      !clientForm.name ||
      !clientForm.niche ||
      !clientForm.status ||
      !clientForm.contact
    )
      return;

    if (editingClient) {
      const updatedClients = clients.map((c) =>
        c.id === editingClient.id
          ? ({
              ...c,
              ...clientForm,
              planValue: Number(clientForm.planValue || 0),
              dueDate:
                clientForm.dueDate || new Date().toISOString().split("T")[0],
            } as Client)
          : c,
      );
      setClients(updatedClients);
      // Notify
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Cliente '${clientForm.name}' atualizado com sucesso.`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToFirestoreDirectly({ clients: updatedClients, notifications: updatedNotifs });
    } else {
      const newClient: Client = {
        id: Math.max(0, ...clients.map((c) => c.id)) + 1,
        name: clientForm.name,
        niche: clientForm.niche,
        status: clientForm.status as Client["status"],
        contact: clientForm.contact,
        plan: clientForm.plan || "Premium",
        planDetails: clientForm.planDetails || "",
        planValue: Number(clientForm.planValue || 0),
        dueDate: clientForm.dueDate || new Date().toISOString().split("T")[0],
        paymentStatus: (clientForm.paymentStatus ||
          "Em dia") as Client["paymentStatus"],
        startDate:
          clientForm.startDate || new Date().toISOString().split("T")[0],
        notes: clientForm.notes || "",
      };
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      // Notify
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Novo cliente '${clientForm.name}' registrado.`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToFirestoreDirectly({ clients: updatedClients, notifications: updatedNotifs });
    }
    closeClientModal();
  };

  const handleDeleteClient = (id: number) => {
    const target = clients.find((c) => c.id === id);
    const updatedClients = clients.filter((c) => c.id !== id);
    setClients(updatedClients);
    if (target) {
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Cliente '${target.name}' removido da carteira.`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "warning",
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToFirestoreDirectly({ clients: updatedClients, notifications: updatedNotifs });
    } else {
      saveToFirestoreDirectly({ clients: updatedClients });
    }
    closeClientModal();
  };

   const openClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientForm(client);
    } else {
      setEditingClient(null);
      setClientForm({
        status: "Ativo",
        plan: "Premium (R$ 1.500/mês)",
        planValue: 1500,
        dueDate: new Date().toISOString().split("T")[0],
        paymentStatus: "Em dia",
        startDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsClientModalOpen(true);
  };

  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
    setClientForm({});
  };

  const handleParseTask = async () => {
    if (!parseInputText && !parseInputFile) return;
    setIsParsingTask(true);
    let success = false;
    let extractedData: any = null;

    const localDate = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const localISODate = new Date().toISOString().split("T")[0];
    const clientNames = clients.map((c) => c.name);

    // 1. Try server-side first
    try {
      const formData = new FormData();
      if (parseInputText) formData.append("prompt", parseInputText);
      if (parseInputFile) formData.append("file", parseInputFile);
      formData.append("currentDate", localDate);
      formData.append("currentISODate", localISODate);
      formData.append("existingClients", JSON.stringify(clientNames));
      const activeKey = getActiveApiKey();
      if (activeKey) formData.append("apiKey", activeKey);
      
      const res = await fetch("/api/parse-task", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.tasks) {
          extractedData = data;
          success = true;
        }
      }
    } catch (e) {
      console.warn("Server-side parse failed, falling back to client-side parsing...", e);
    }

    // 2. Fallback to client-side if server failed or is not available
    if (!success) {
      try {
        const activeKey = getActiveApiKey();
        if (!activeKey) {
          throw new Error("Chave de API do Gemini não encontrada. Configure sua chave nas configurações do perfil para usar a IA.");
        }
        const aiClient = new GoogleGenAI({ apiKey: activeKey });
        
        let textContent = parseInputText || "";
        const parts: any[] = [];
        
        if (parseInputFile) {
          const fileData = await new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Erro ao ler o arquivo selecionado."));
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              resolve({ data: base64, mimeType: parseInputFile.type });
            };
            reader.readAsDataURL(parseInputFile);
          });
          
          if (parseInputFile.type.startsWith("image/") || parseInputFile.type === "application/pdf" || parseInputFile.type.startsWith("audio/")) {
            parts.push({
              inlineData: {
                data: fileData.data,
                mimeType: fileData.mimeType
              }
            });
          } else {
            const text = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error("Erro ao ler o arquivo como texto."));
              reader.onload = () => resolve(reader.result as string);
              reader.readAsText(parseInputFile);
            });
            textContent += "\n\nConteúdo do Arquivo:\n" + text;
          }
        }
        
        parts.push({
          text: `You are an AI assistant that extracts task information from unstructured text, chats, notes, or files in Portuguese.
Extract multiple task details and return ONLY a JSON object with this exact structure:
{
  "tasks": [
    {
      "title": "Short title of the task in Portuguese (max 50 chars)",
      "description": "Detailed, rich description, steps, or notes in Portuguese explaining what needs to be done. Try to capture as much detail as possible from the input.",
      "client": "Name of the client. Match and resolve against the existing clients list below if there is a similar, misspelled, or matching name. If no client is mentioned, use empty string (\"\").",
      "hasDeadline": boolean (true if a specific date, relative day, or timeline is mentioned),
      "dueDate": "YYYY-MM-DD" (calculate correctly using the current date reference below, otherwise null),
      "amount": number (extracted monetary amount if mentioned, otherwise null),
      "isPaid": boolean (true if mentioned as already paid/received, false otherwise)
    }
  ]
}

Context for Relative Dates:
- Today is: ${localDate}
- Today's date in YYYY-MM-DD format: ${localISODate}
- IMPORTANT: When the text says "hoje" (today), "amanhã" (tomorrow), "segunda" (monday), "fim de semana" (weekend), "quarta-feira", etc., calculate the exact calendar date (YYYY-MM-DD) based on the current date reference above.

Context for Clients:
- Existing Clients list: ${JSON.stringify(clientNames)}
- IMPORTANT: If a client is mentioned in the text (even if misspelled, partially written, lowercase, or a nickname), find the best match from the list of existing clients and return the EXACT name from the list. If it does not match any existing client, use the name mentioned in the text (properly formatted). If no client is mentioned, return empty string ("").

Input Text:
${textContent}`
        });

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            responseMimeType: "application/json",
          },
          contents: [
            {
              role: "user",
              parts: parts
            }
          ]
        });

        let jsonStr = response.text || "{}";
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);
        if (data && data.tasks) {
          extractedData = data;
          success = true;
        } else {
          throw new Error("Formato de resposta da IA inválido.");
        }
      } catch (err: any) {
        console.error("Client-side parse also failed:", err);
        alert(err.message || "Erro ao conectar com a IA");
        setIsParsingTask(false);
        return;
      }
    }

    // 3. Process extracted data successfully
    if (success && extractedData && extractedData.tasks) {
      try {
        const newTasks: Task[] = [];
        const newTransactions: Transaction[] = [];
        
        let lastTaskId = Math.max(0, ...tasks.map((t) => t.id));
        let lastTxId = Math.max(0, ...transactions.map((t) => t.id));

        extractedData.tasks.forEach((task: any) => {
          lastTaskId++;
          const newTask: Task = {
            id: lastTaskId,
            title: task.title || "Sem título",
            description: task.description || "",
            status: "todo",
            client: task.client || "",
            hasDeadline: task.hasDeadline || false,
            dueDate: task.dueDate || "",
          };
          newTasks.push(newTask);

          if (task.amount) {
            lastTxId++;
            const newTx: Transaction = {
              id: lastTxId,
              description: task.title,
              type: "receita",
              amount: task.amount,
              date: task.dueDate || new Date().toISOString().split("T")[0],
              category: "Serviços",
              status: task.isPaid ? "pago" : "pendente",
              client: task.client || "",
            };
            newTransactions.push(newTx);
          }
          
          if (gcalToken) {
            insertGoogleTask(newTask, gcalToken);
          }
        });
        
        const updatedTasks = [...tasks, ...newTasks];
        const updatedTransactions = [...transactions, ...newTransactions];
        setTasks(updatedTasks);
        setTransactions(updatedTransactions);
        saveToFirestoreDirectly({ tasks: updatedTasks, transactions: updatedTransactions });
        
        setParseInputText("");
        setParseInputFile(null);
        closeTaskModal();
      } catch (e) {
        console.error(e);
        alert("Erro ao processar as tarefas geradas pela IA.");
      }
    } else {
      alert("Não foi possível processar a tarefa com a IA.");
    }
    setIsParsingTask(false);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.status) return;

    let finalTaskId = 0;

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id ? ({ ...t, ...taskForm } as Task) : t,
      );
      setTasks(updated);
      saveToFirestoreDirectly({ tasks: updated });
    } else {
      const newTask: Task = {
        id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
        title: taskForm.title,
        description: taskForm.description,
        client: taskForm.client || "",
        status: taskForm.status as Task["status"],
        hasDeadline: taskForm.hasDeadline || false,
        dueDate: taskForm.dueDate || "",
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      saveToFirestoreDirectly({ tasks: updated });

      if (gcalToken) {
        insertGoogleTask(newTask, gcalToken);
      }
    }
    closeTaskModal();
  };

  const handleDeleteTask = (id: number) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveToFirestoreDirectly({ tasks: updated });
    closeTaskModal();
  };

  const openTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setTaskForm(task || {
      status: "todo",
      hasDeadline: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
    setTaskMode('manual');
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskForm({});
  };

  // --- TRANSACTIONS CRUD HANDLERS ---
  const handleSaveTransaction = () => {
    if (
      !transactionForm.description ||
      !transactionForm.amount ||
      !transactionForm.type ||
      !transactionForm.category ||
      !transactionForm.date
    )
      return;

    const formattedAmount = Number(transactionForm.amount);
    if (editingTransaction) {
      const updatedTx = transactions.map((t) =>
        t.id === editingTransaction.id
          ? ({
              ...t,
              ...transactionForm,
              amount: formattedAmount,
            } as Transaction)
          : t,
      );
      setTransactions(updatedTx);
      saveToFirestoreDirectly({ transactions: updatedTx });
    } else {
      const newTx: Transaction = {
        id: Math.max(0, ...transactions.map((t) => t.id)) + 1,
        description: transactionForm.description,
        type: transactionForm.type as "receita" | "despesa",
        amount: formattedAmount,
        date: transactionForm.date,
        category: transactionForm.category,
        status: (transactionForm.status as "pago" | "pendente") || "pago",
        client: transactionForm.client,
      };
      const updatedTx = [...transactions, newTx];
      setTransactions(updatedTx);

      // Create a success notification
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Nova transação registrada: ${transactionForm.description} (R$ ${formattedAmount})`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: transactionForm.type === "receita" ? "success" : "info",
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToFirestoreDirectly({ transactions: updatedTx, notifications: updatedNotifs });
    }
    closeTransactionModal();
  };

  const handleDeleteTransaction = (id: number) => {
    const updatedTx = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTx);
    saveToFirestoreDirectly({ transactions: updatedTx });
    closeTransactionModal();
  };

  const handleToggleTransactionStatus = (id: number) => {
    const updatedTx = transactions.map((t) =>
      t.id === id
        ? { ...t, status: (t.status === "pago" ? "pendente" : "pago") as "pago" | "pendente" }
        : t
    );
    setTransactions(updatedTx);
    saveToFirestoreDirectly({ transactions: updatedTx });
  };

  const openTransactionModal = (tx?: Transaction) => {
    if (tx) {
      setEditingTransaction(tx);
      setTransactionForm(tx);
    } else {
      setEditingTransaction(null);
      setTransactionForm({
        type: "receita",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "Contratos",
        status: "pago",
      });
    }
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    setTransactionForm({});
  };

  const handleGoogleSignOut = async () => {
    try {
      // 1. Force a complete cloud backup to Supabase before signing out if connected
      if (activeSyncKey && !isOffline) {
        try {
          const sanitizedData = JSON.parse(JSON.stringify({
            userId: activeSyncKey,
            updatedAt: new Date().toISOString(),
            clients,
            tasks,
            transactions,
            calendarEvents,
            notifications,
            myProfile,
            transactionCategories,
            logoRefs,
            savedCards,
            savedNotes,
            messages,
          }));
          await supabase.from('users').upsert({
            id: activeSyncKey,
            updated_at: new Date().toISOString(),
            data: sanitizedData
          });
          console.log("Forced cloud backup completed successfully before sign out.");
        } catch (err) {
          console.error("Error in forced backup:", err);
        }
      }

      // 2. Force a local backup to localStorage as a safety measure
      localStorage.setItem("zion_clients", JSON.stringify(clients));
      localStorage.setItem("zion_tasks", JSON.stringify(tasks));
      localStorage.setItem("zion_transactions", JSON.stringify(transactions));
      localStorage.setItem("zion_calendar_events", JSON.stringify(calendarEvents));
      localStorage.setItem("zion_notifications", JSON.stringify(notifications));
      localStorage.setItem("zion_my_profile", JSON.stringify(myProfile));
      localStorage.setItem("logoRefs", JSON.stringify(logoRefs));
      localStorage.setItem("savedCards", JSON.stringify(savedCards));
      localStorage.setItem("zion_saved_notes", JSON.stringify(savedNotes));
      localStorage.setItem("zion_workspace_key_backup", workspaceKey || "ZION-MASTER");

      // Reset workspace to ZION-MASTER as a form of log out
      setWorkspaceKey("ZION-MASTER");
      localStorage.setItem("zion_workspace_key", "ZION-MASTER");
      setGcalToken(null);
      setGcalUser(null);
      localStorage.removeItem("gcal_access_token");
      
      // Clean google events (ids >= 10000)
      setCalendarEvents((prev) => prev.filter((e) => e.id < 10000));

      const notif: NotificationItem = {
        id: Date.now(),
        message: "Sessão encerrada.",
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      setNotifications((prev) => [notif, ...prev]);
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback signout if save fails
      try {
        setGcalToken(null);
        setGcalUser(null);
      } catch (e) {
        console.error("Fallback signout failed:", e);
      }
    }
  };

  const syncEventsFromGoogle = async (token: string) => {
    setIsGcalSyncing(true);
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=25&timeMin=" +
          new Date().toISOString(),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          const gEvents: CalendarEvent[] = data.items.map(
            (item: any, idx: number) => {
              const dateStr =
                item.start?.dateTime?.split("T")[0] || item.start?.date || "";
              const timeStr = item.start?.dateTime
                ? item.start.dateTime.split("T")[1]?.substring(0, 5)
                : "09:00";
              let type: "post" | "reuniao" | "entrega" = "reuniao";
              const sumLower = (item.summary || "").toLowerCase();
              if (
                sumLower.includes("post") ||
                sumLower.includes("feed") ||
                sumLower.includes("story")
              )
                type = "post";
              else if (
                sumLower.includes("entrega") ||
                sumLower.includes("deadline") ||
                sumLower.includes("prazo")
              )
                type = "entrega";

              return {
                id: 10000 + idx,
                title: item.summary || "Compromisso Google",
                date: dateStr,
                time: timeStr,
                clientName: item.description?.includes("Zion Client:")
                  ? item.description
                      .split("Zion Client:")[1]
                      .trim()
                      .split("\n")[0]
                  : "Google Calendar",
                description: item.description || "",
                type: type,
              };
            },
          );

          setCalendarEvents((prev) => {
            const localOnly = prev.filter((e) => e.id < 10000);
            return [...localOnly, ...gEvents];
          });
        }
      } else {
        console.error("Calendar API Error:", await response.text());
      }
    } catch (error) {
      console.error("Failed to sync events from Google Calendar:", error);
    } finally {
      setIsGcalSyncing(false);
    }
  };

  const syncTasksFromGoogle = async (token: string) => {
    try {
      const listsRes = await fetch(
        "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!listsRes.ok) {
         console.error("Tasks API Error (lists):", await listsRes.text());
         return;
      }
      const listsData = await listsRes.json();
      if (!listsData.items || listsData.items.length === 0) return;

      const defaultListId = listsData.items[0].id;

      const tasksRes = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!tasksRes.ok) {
         console.error("Tasks API Error (tasks):", await tasksRes.text());
         return;
      }
      const tasksData = await tasksRes.json();

      if (tasksData.items) {
        const gTasks: Task[] = tasksData.items.map(
          (item: any, idx: number) => ({
            id: 20000 + idx,
            title: item.title || "Google Task",
            status: item.status === "completed" ? "done" : "todo",
            client: "Geral (Sem cliente)",
            hasDeadline: !!item.due,
            dueDate: item.due ? item.due.split("T")[0] : undefined,
          }),
        );

        setTasks((prev) => {
          const localOnly = prev.filter((t) => t.id < 20000);
          return [...localOnly, ...gTasks];
        });
      }
    } catch (error) {
      console.error("Failed to sync Google Tasks:", error);
    }
  };

  const insertGoogleTask = async (task: Task, token: string) => {
    try {
      const listsRes = await fetch(
        "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!listsRes.ok) return;
      const listsData = await listsRes.json();
      if (!listsData.items || listsData.items.length === 0) return;

      const defaultListId = listsData.items[0].id;

      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `${task.title} [Zion]`,
            notes: `Client: ${task.client}`,
            due:
              task.hasDeadline && task.dueDate
                ? `${task.dueDate}T00:00:00.000Z`
                : undefined,
          }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to insert Google Task:", errorData);
        throw new Error(`Google Tasks API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to insert Google Task:", error);
    }
  };

  const insertGoogleCalendarEvent = async (
    ev: CalendarEvent,
    token: string,
  ) => {
    try {
      const startD = new Date(`${ev.date}T${ev.time}:00-03:00`);
      const endD = new Date(startD.getTime() + 60 * 60 * 1000); // add 1 hour

      const startDateTime = startD.toISOString().replace('.000Z', '-03:00'); // roughly matching timezone
      // Actually Google API accepts proper ISO strings without timezone if timeZone is specified in the object,
      // But it's better to format as YYYY-MM-DDTHH:mm:ss for the timeZone we provide.
      
      const formatLocal = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
      };
      
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: `${ev.title} [Zion]`,
            description: `Zion Client: ${ev.clientName}\n\n${ev.description || ""}`,
            start: {
              dateTime: formatLocal(startD),
              timeZone: "America/Sao_Paulo",
            },
            end: {
              dateTime: formatLocal(endD),
              timeZone: "America/Sao_Paulo",
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to insert Google Calendar event:", errorData);
        throw new Error(`Google Calendar API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to sync event to Google Calendar:", error);
    }
  };

  // --- CALENDAR EVENTS CRUD HANDLERS ---
  const handleSaveEvent = () => {
    if (
      !eventForm.title ||
      !eventForm.date ||
      !eventForm.time ||
      !eventForm.clientName ||
      !eventForm.type
    )
      return;

    if (editingEvent) {
      setCalendarEvents(
        calendarEvents.map((e) =>
          e.id === editingEvent.id
            ? ({ ...e, ...eventForm } as CalendarEvent)
            : e,
        ),
      );
    } else {
      const newEv: CalendarEvent = {
        id: Math.max(0, ...calendarEvents.map((e) => e.id)) + 1,
        title: eventForm.title,
        date: eventForm.date,
        time: eventForm.time,
        clientName: eventForm.clientName,
        description: eventForm.description || "",
        type: eventForm.type as "post" | "reuniao" | "entrega",
      };
      setCalendarEvents([...calendarEvents, newEv]);

      // Auto sync to Google Calendar if connected
      if (gcalToken) {
        insertGoogleCalendarEvent(newEv, gcalToken);
      }

      // Create a success notification
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Evento agendado: '${eventForm.title}' para ${eventForm.date} às ${eventForm.time}`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "info",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    closeEventModal();
  };

  const handleDeleteEvent = (id: number) => {
    setCalendarEvents(calendarEvents.filter((e) => e.id !== id));
    closeEventModal();
  };

  const openEventModal = (ev?: CalendarEvent, defaultDate?: string) => {
    if (ev) {
      setEditingEvent(ev);
      setEventForm(ev);
    } else {
      setEditingEvent(null);
      setEventForm({
        date: defaultDate || new Date().toISOString().split("T")[0],
        time: "14:00",
        type: "post",
        clientName: clients[0]?.name || "",
      });
    }
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setEventForm({});
  };

  // Quick Move Task Status helper
  const handleQuickMoveTask = (id: number, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(updatedTasks);
    
    const target = tasks.find((t) => t.id === id);
    if (target) {
      const statusLabels = {
        todo: "A Fazer",
        doing: "Em Produção",
        done: "Concluído",
      };
      const newNotif: NotificationItem = {
        id: Date.now(),
        message: `Tarefa '${target.title}' movida para ${statusLabels[newStatus]}.`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      const updatedNotifications = [newNotif, ...notifications];
      setNotifications(updatedNotifications);
      saveToFirestoreDirectly({ tasks: updatedTasks, notifications: updatedNotifications });
    } else {
      saveToFirestoreDirectly({ tasks: updatedTasks });
    }
  };

  const handleGenerateCopy = async () => {
    if (!copyTopic.trim()) return;

    setIsGenerating(true);
    setGeneratedCopy("");

    try {
      const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
      const prompt = `Você é um copywriter sênior e estrategista de conteúdo da agência de marketing "Zion Company".
      Sua tarefa é criar um(a) "${copyType}" de alta conversão e engajamento.
      
      Assunto/Briefing: ${copyTopic}
      
      Diretrizes:
      - Use gatilhos mentais adequados.
      - Formatação limpa (use emojis com moderação, separe em parágrafos curtos).
      - Inclua uma Call to Action (CTA) forte no final.
      - Mantenha um tom de voz profissional, persuasivo e moderno.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
        });
      } catch (e) {
        console.warn(
          "gemini-3.1-pro-preview falhou, tentando gemini-3.5-flash",
          e,
        );
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });
      }

      if (response.text) {
        setGeneratedCopy(response.text);
      }
    } catch (error) {
      console.error("Erro ao gerar texto:", error);
      setGeneratedCopy(
        "Ocorreu um erro ao gerar o texto. Verifique se a chave da API está configurada corretamente.",
      );
    } finally {
      setIsGenerating(false);
    }
  };



  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const forceDownloadFromCloud = async () => {
    if (!activeSyncKey) return;
    try {
      setIsCloudSyncing(true);
      const { data: dbData, error: getError } = await supabase
        .from('users')
        .select('data')
        .eq('id', activeSyncKey)
        .maybeSingle();

      if (getError) throw getError;
      
      if (dbData && dbData.data) {
        const data = dbData.data;
        isSyncingFromServerRef.current = true;

        if (data.clients) setClients(data.clients);
        if (data.tasks) setTasks(data.tasks);
        if (data.transactions) setTransactions(data.transactions);
        if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
        if (data.notifications) setNotifications(data.notifications);
        if (data.myProfile) setMyProfile(data.myProfile);
        if (data.transactionCategories)
          setTransactionCategories(data.transactionCategories);
        if (data.logoRefs) setLogoRefs(data.logoRefs);
        if (data.savedCards) setSavedCards(data.savedCards);
        if (data.savedNotes) setSavedNotes(data.savedNotes);
        if (data.messages && data.messages.length > 0) setMessages(data.messages);

        const notif: NotificationItem = {
          id: Date.now(),
          message: "Dados sincronizados com sucesso a partir da nuvem!",
          date: new Date().toISOString().split("T")[0],
          read: false,
          type: "success",
        };
        setNotifications((prev) => [notif, ...prev]);

        setTimeout(() => {
          isSyncingFromServerRef.current = false;
        }, 500);
      } else {
        const notif: NotificationItem = {
          id: Date.now(),
          message: "Nenhum dado encontrado na nuvem para este Workspace.",
          date: new Date().toISOString().split("T")[0],
          read: false,
          type: "warning",
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    } catch (err) {
      console.error("Erro no download manual da nuvem:", err);
      const notif: NotificationItem = {
        id: Date.now(),
        message: "Erro ao baixar dados da nuvem. Verifique as permissões.",
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "warning",
      };
      setNotifications((prev) => [notif, ...prev]);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const forceUploadToCloud = async () => {
    if (!activeSyncKey) return;
    try {
      setIsCloudSyncing(true);
      try {
        const sanitizedData = JSON.parse(JSON.stringify({
          userId: activeSyncKey,
          updatedAt: new Date().toISOString(),
          clients,
          tasks,
          transactions,
          calendarEvents,
          notifications,
          myProfile,
          transactionCategories,
          logoRefs,
          savedCards,
          savedNotes,
          messages,
        }));
        await supabase.from('users').upsert({
          id: activeSyncKey,
          updated_at: new Date().toISOString(),
          data: sanitizedData
        });
      } catch (e) {
        console.error("Error manual upload to Supabase:", e);
        return;
      }

      const notif: NotificationItem = {
        id: Date.now(),
        message: "Seus dados locais foram salvos com sucesso na nuvem!",
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      setNotifications((prev) => [notif, ...prev]);
    } catch (err) {
      console.error("Erro no upload manual para nuvem:", err);
      const notif: NotificationItem = {
        id: Date.now(),
        message: "Erro ao enviar dados para a nuvem. Verifique a conexão.",
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "warning",
      };
      setNotifications((prev) => [notif, ...prev]);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const exportBackupJSON = () => {
    try {
      const backupData = {
        workspaceKey: activeSyncKey,
        backupTime: new Date().toISOString(),
        clients,
        tasks,
        transactions,
        calendarEvents,
        notifications,
        myProfile,
        transactionCategories,
        logoRefs,
        savedCards,
        savedNotes,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute(
        "download",
        `Zion_Backup_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      const notif: NotificationItem = {
        id: Date.now(),
        message: "Backup local JSON exportado com sucesso!",
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      };
      setNotifications((prev) => [notif, ...prev]);
    } catch (err) {
      console.error("Erro ao exportar backup local:", err);
      alert("Erro ao exportar backup local.");
    }
  };

  const importBackupJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (
          !data.clients &&
          !data.tasks &&
          !data.transactions &&
          !data.calendarEvents
        ) {
          alert("Arquivo JSON inválido. Verifique o formato do backup.");
          return;
        }

        if (confirm("Deseja importar este backup? Isso substituirá seus dados atuais na tela.")) {
          isSyncingFromServerRef.current = true;

          if (data.clients) setClients(data.clients);
          if (data.tasks) setTasks(data.tasks);
          if (data.transactions) setTransactions(data.transactions);
          if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
          if (data.notifications) setNotifications(data.notifications);
          if (data.myProfile) setMyProfile(data.myProfile);
          if (data.transactionCategories)
            setTransactionCategories(data.transactionCategories);
          if (data.logoRefs) setLogoRefs(data.logoRefs);
          if (data.savedCards) setSavedCards(data.savedCards);
          if (data.savedNotes) setSavedNotes(data.savedNotes);

          const notif: NotificationItem = {
            id: Date.now(),
            message: "Backup local JSON importado e aplicado com sucesso!",
            date: new Date().toISOString().split("T")[0],
            read: false,
            type: "success",
          };
          setNotifications((prev) => [notif, ...prev]);

          setTimeout(() => {
            isSyncingFromServerRef.current = false;
          }, 500);
        }
      } catch (err) {
        console.error("Erro ao ler arquivo de backup:", err);
        alert("Erro ao ler o arquivo JSON. Certifique-se de que é um backup válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Cloud Sync Status sub-rendering helper
  const renderCloudSyncStatus = () => {
    if (!gcalUser) return null;
    return (
      <div className="mt-3 p-3 bg-[#050505] border border-white/5 rounded-xl space-y-2 group">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-500 font-bold flex items-center gap-1">
            <Cloud size={10} className="text-zinc-400" />
            NUVEM CONECTADA
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isCloudSyncing ? "bg-[#c5a880] animate-ping" : "bg-emerald-500"}`} />

          </div>
        </div>

        <div className="flex items-center justify-between gap-1">


        </div>
      </div>
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-zinc-50 font-sans relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#c5a880]/10 rounded-full blur-[120px]" />
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#c5a880] rounded-xl flex items-center justify-center text-zinc-950 text-3xl font-black shadow-lg shadow-amber-500/20 animate-bounce">
            Z
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Carregando Workspace
              <span className="text-[#c5a880] animate-pulse">.</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Iniciando conexão segura...
            </p>
          </div>
          <div className="w-48 h-1.5 bg-[#0b0b0c] rounded-full overflow-hidden relative border border-white/5">
            <div className="h-full bg-[#c5a880] rounded-full animate-slide w-1/3 absolute left-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b0b0c] text-zinc-100 overflow-hidden relative select-none" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-full shadow-lg shadow-red-500/20">
          <WifiOff size={16} />
          Você está offline. Alterações no banco de dados não serão sincronizadas até que a conexão retorne.
        </div>
      )}
      
      {/* Premium Ambient Light Orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ad8330]/5 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      {/* Header Fixo no Topo */}
      <header className="h-16 w-full bg-[#121214] border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-45 shrink-0">
        {/* Esquerda: Logo Zion Design */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all mr-1 flex items-center justify-center border border-transparent hover:border-white/5"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a880] to-[#ad8330] flex items-center justify-center text-zinc-950 shadow-md">
            <Layers size={18} />
          </div>
          <span className="font-montserrat font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white via-zinc-200 to-[#c5a880] bg-clip-text text-transparent">
            Zion Design
          </span>
        </div>

        {/* Centro: Barra de Busca */}
        <div className="hidden sm:flex items-center gap-2 w-72 sm:w-96 min-w-0">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            <input
              type="text"
              placeholder="Buscar no workspace..."
              className="w-full bg-[#0b0b0c] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#ad8330]/50 transition-colors text-white placeholder:text-zinc-650"
            />
          </div>
        </div>

        {/* Direita: Perfil & Notificações */}
        <div className="flex items-center gap-4">
          
          {/* Status da Chave API no Header */}
          {typeof window !== "undefined" &&
          localStorage.getItem("custom_gemini_api_key") ? (
            <div className="p-1 bg-[#c5a880]/10 border border-[#c5a880]/20 rounded-lg hidden md:flex items-center gap-1.5 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
              <span className="text-[10px] text-[#c5a880] font-black uppercase tracking-wider">API Ativa</span>
            </div>
          ) : (
            <div 
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1 bg-[#0b0b0c] border border-emerald-500/10 rounded-lg hidden md:flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:border-emerald-500/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500/90 font-bold uppercase tracking-wider">API Servidor</span>
            </div>
          )}

          {/* Botão de Perfil */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-white/5 rounded-xl transition-all border border-white/5 bg-[#0b0b0c]/40 group"
          >
            {myProfile?.avatarUrl ? (
              <img
                src={myProfile.avatarUrl}
                alt={myProfile?.name || "Zion"}
                className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-[#ad8330] transition-colors"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c5a880] to-[#ad8330] text-zinc-950 flex items-center justify-center text-[10px] font-bold uppercase">
                {(myProfile?.name || "Zion").substring(0, 2)}
              </div>
            )}
            <span className="text-xs font-bold text-white group-hover:text-[#ad8330] transition-colors hidden sm:inline">
              {myProfile?.name || "Equipe Zion"}
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal + Barra Lateral */}
      <div className="flex h-[calc(100vh-64px)] mt-16 overflow-hidden relative w-full">
        
        {/* Menu Lateral Estreito Vertical (Desktop) */}
        <aside className="hidden lg:flex w-20 bg-[#121214] border-r border-white/5 flex-col items-center py-4 flex-shrink-0 select-none overflow-y-auto scrollbar-none h-full">
          <nav className="w-full px-2 space-y-3">
            <SidebarItemMini icon={<LayoutDashboard size={20} />} active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} tooltip="Explorar" />
            <SidebarItemMini icon={<Layers size={20} />} active={activeTab === "agents"} onClick={() => setActiveTab("agents")} tooltip="Agentes" />
            <SidebarItemMini icon={<Wand2 size={20} />} active={activeTab === "copiloto"} onClick={() => setActiveTab("copiloto")} tooltip="Copiloto IA" />
            <SidebarItemMini icon={<Sparkles size={20} />} active={activeTab === "ai-tools"} onClick={() => setActiveTab("ai-tools")} tooltip="Criar" />
            <SidebarItemMini icon={<ImageIcon size={20} />} active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} tooltip="Galeria" />
            <SidebarItemMini icon={<Users size={20} />} active={activeTab === "clients"} onClick={() => setActiveTab("clients")} tooltip="Clientes" />
            <SidebarItemMini icon={<CheckSquare size={20} />} active={activeTab === "tasks"} onClick={() => setActiveTab("tasks")} tooltip="Tarefas" />
            <SidebarItemMini icon={<Calendar size={20} />} active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} tooltip="Agenda" />
            <SidebarItemMini icon={<MessageSquare size={20} />} active={activeTab === "whatsapp"} onClick={() => setActiveTab("whatsapp")} tooltip="WhatsApp" />
            <SidebarItemMini icon={<FileText size={20} />} active={activeTab === "notes"} onClick={() => setActiveTab("notes")} tooltip="Notas" />
          </nav>
          
          <div className="w-full px-2 mt-auto pt-4 flex-shrink-0">
            <SidebarItemMini icon={<Settings size={20} />} active={false} onClick={() => setIsSettingsModalOpen(true)} tooltip="Configurações" />
          </div>
        </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
            />
            {/* Sidebar Sheet */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#050505] border-r border-white/10 z-50 flex flex-col p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a880] to-[#ad8330] flex items-center justify-center text-zinc-950">
                    <Layers size={18} />
                  </div>
                  <span className="font-montserrat font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white to-[#c5a880] bg-clip-text text-transparent">
                    DESIGNBUILDER
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
                {/* Section: Principal */}
                <div className="space-y-1.5">
                  <p className="px-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Estúdio Criativo</p>
                  <SidebarItem
                    icon={<LayoutDashboard size={16} />}
                    label="Explorar"
                    active={activeTab === "dashboard"}
                    onClick={() => {
                      setActiveTab("dashboard");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<Wand2 size={16} />}
                    label="Copiloto IA"
                    active={activeTab === "copiloto"}
                    onClick={() => {
                      setActiveTab("copiloto");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<Sparkles size={16} />}
                    label="Criar com IA"
                    active={activeTab === "ai-tools"}
                    onClick={() => {
                      setActiveTab("ai-tools");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<ImageIcon size={16} />}
                    label="Minha Galeria"
                    active={activeTab === "gallery"}
                    onClick={() => {
                      setActiveTab("gallery");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                </div>

                {/* Section: Workspace */}
                <div className="space-y-1.5">
                  <p className="px-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Gerenciamento</p>
                  <SidebarItem
                    icon={<Users size={16} />}
                    label="Clientes"
                    active={activeTab === "clients"}
                    onClick={() => {
                      setActiveTab("clients");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<CheckSquare size={16} />}
                    label="Tarefas (Kanban)"
                    active={activeTab === "tasks"}
                    onClick={() => {
                      setActiveTab("tasks");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<Calendar size={16} />}
                    label="Agenda & Pautas"
                    active={activeTab === "calendar"}
                    onClick={() => {
                      setActiveTab("calendar");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<MessageSquare size={16} />}
                    label="WhatsApp"
                    active={activeTab === "whatsapp"}
                    onClick={() => {
                      setActiveTab("whatsapp");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                  <SidebarItem
                    icon={<FileText size={16} />}
                    label="Bloco de Notas"
                    active={activeTab === "notes"}
                    onClick={() => {
                      setActiveTab("notes");
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                {typeof window !== "undefined" &&
                localStorage.getItem("custom_gemini_api_key") ? (
                  <div className="p-2 bg-[#c5a880]/10 border border-[#c5a880]/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-pulse" />
                      <span className="text-xs text-[#c5a880] font-medium">
                        Sua API Ativa
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("custom_gemini_api_key");
                        window.location.reload();
                      }}
                      className="text-[10px] text-zinc-500 hover:text-red-400 font-bold"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div
                    className="p-2 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setIsSettingsModalOpen(true);
                      setIsMobileSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-zinc-400 font-medium">
                        Usando API Padrão
                      </span>
                    </div>
                  </div>
                )}
                <SidebarItem
                  icon={<Settings size={20} />}
                  label="Configurações"
                  active={false}
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsMobileSidebarOpen(false);
                  }}
                />
                <SidebarItem
                  icon={<LogOut size={20} />}
                  label="Sair da Conta"
                  active={false}
                  onClick={() => {
                    handleGoogleSignOut();
                    setIsMobileSidebarOpen(false);
                  }}
                />

                {renderCloudSyncStatus()}

                <div
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-2.5 cursor-pointer hover:bg-white/5 rounded-xl transition-all border border-white/5 bg-zinc-950/40"
                >
                  {myProfile?.avatarUrl ? (
                    <img
                      src={myProfile.avatarUrl}
                      alt={myProfile?.name || "Zion"}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#c5a880] text-zinc-950 flex items-center justify-center text-xs font-bold uppercase">
                      {(myProfile?.name || "Zion").substring(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate text-white">
                      {myProfile?.name || "Equipe Zion"}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {myProfile?.role || "Agência Digital"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0b0c]">
        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto flex flex-col ${activeTab === "ai-tools" ? "p-0" : "p-4 sm:p-8"}`}>
              {/* View: Notes & Docs */}
          {activeTab === "notes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-8">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                  <FileText className="text-[#c5a880]" size={28} /> Notas & Docs
                </h1>
                <p className="text-zinc-400">
                  Armazene e consulte rapidamente briefings, ideias de cópias e
                  anotações dos seus clientes.
                </p>
              </div>

              {savedNotes.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl flex flex-col items-center justify-center">
                  <FileText className="text-zinc-700 mb-4" size={48} />
                  <p className="text-zinc-400 text-lg font-medium">
                    Nenhuma nota salva ainda.
                  </p>
                  <p className="text-zinc-500 text-sm mt-2">
                    Vá até o Copiloto Zion e salve os textos gerados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 flex flex-col hover:border-[#c5a880]/20 transition-all shadow-lg hover:shadow-amber-500/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-[#c5a880] bg-[#c5a880]/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          <User size={12} />
                          {note.clientName}
                        </div>
                        <button
                          onClick={() =>
                            setSavedNotes((prev) =>
                              prev.filter((n) => n.id !== note.id),
                            )
                          }
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1 bg-white/5 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {note.title}
                      </h3>
                      <div className="text-xs text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
                        <Calendar size={12} /> {note.date}
                      </div>
                      <div className="text-zinc-400 text-sm whitespace-pre-wrap overflow-hidden relative flex-1">
                        <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {note.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* View: Gallery */}
          {activeTab === "gallery" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-8">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                  <ImageIcon className="text-[#c5a880]" size={28} /> Galeria de
                  Cards
                </h1>
                <p className="text-zinc-400">Gerencie seus cards gerados.</p>
              </div>

              {savedCards.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl">
                  <p className="text-zinc-500">Nenhum card salvo na galeria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {savedCards.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`Card ${idx}`}
                        className="w-full h-auto"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            const newCards = savedCards.filter((_, i) => i !== idx);
                            setSavedCards(newCards);
                          }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* View: Clients CRM */}
          {activeTab === "clients" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                    <Users className="text-[#c5a880] animate-pulse" size={28} />{" "}
                    Gestão de Clientes
                  </h1>
                  <p className="text-zinc-400">
                    Organize sua carteira de clientes, leads e contratos de
                    forma centralizada.
                  </p>
                </div>
                <button
                  onClick={() => openClientModal()}
                  className="bg-[#c5a880] text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c5a880]/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
                >
                  <Plus size={16} /> Cadastrar Novo Cliente
                </button>
              </div>

              {/* Client Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full place-content-center">
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 min-w-0">
                  <span className="text-sm font-bold text-white block break-words leading-tight">
                    Total Carteira
                  </span>
                  <p className="text-xl sm:text-2xl font-medium text-zinc-400 mt-1 truncate">
                    {clients.length}
                  </p>
                </div>
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 min-w-0">
                  <span className="text-sm font-bold text-white block break-words leading-tight">
                    Clientes Ativos
                  </span>
                  <p className="text-xl sm:text-2xl font-medium text-zinc-400 mt-1 truncate">
                    {clients.filter((c) => c.status === "Ativo").length}
                  </p>
                </div>
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 min-w-0">
                  <span className="text-sm font-bold text-white block break-words leading-tight">
                    Em Prospecção
                  </span>
                  <p className="text-xl sm:text-2xl font-medium text-zinc-400 mt-1 truncate">
                    {clients.filter((c) => c.status === "Prospecção").length}
                  </p>
                </div>
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 min-w-0">
                  <span className="text-sm font-bold text-white block break-words leading-tight">
                    Faturamento Previsto (MRR)
                  </span>
                  <p className="text-xl sm:text-2xl font-medium text-zinc-400 mt-1 truncate">
                    R$ {mrr.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* CRM Filters Bar */}
              <div className="bg-[#0b0b0c] border border-white/5 p-4 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative w-full max-w-md">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                      size={15}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nome, nicho ou contato..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#c5a880]/50 text-white placeholder:text-zinc-600 transition-all"
                    />
                  </div>
                  {clientSearch && (
                    <button
                      onClick={() => setClientSearch("")}
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { label: "Todos", value: "todos" },
                    { label: "Ativos", value: "Ativo" },
                    { label: "Prospecção", value: "Prospecção" },
                    { label: "Pausados", value: "Pausado" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setClientFilterStatus(btn.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        clientFilterStatus === btn.value
                          ? "bg-[#c5a880] text-zinc-950 shadow-md shadow-amber-500/10"
                          : "bg-[#050505] text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table wrapper */}
              <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl overflow-x-auto shadow-xl">
                {filteredClients.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 mx-auto mb-4">
                      <Users size={24} />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">
                      Nenhum cliente encontrado
                    </h3>
                    <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
                      Experimente alterar a busca ou filtro ou clique em
                      "Cadastrar Novo Cliente" para começar do zero.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#050505] border-b border-white/5">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Cliente
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Nicho / Área
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Contato
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Mensalidade
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Vencimento
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Cobrança
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Status Geral
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-right">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="border-b border-white/5 hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {client.avatarUrl ? (
                                <img
                                  src={client.avatarUrl}
                                  alt={client.name}
                                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-[#c5a880] font-bold text-sm">
                                  {client.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-zinc-200 block text-xs sm:text-sm">
                                  {client.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 block font-medium">
                                  {client.plan || "Plano Personalizado"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs sm:text-sm">
                            {client.niche}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs sm:text-sm font-mono">
                            {client.contact}
                          </td>
                          <td className="px-6 py-4 text-zinc-100 font-bold font-mono text-xs sm:text-sm">
                            R$ {(client.planValue || 0).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs sm:text-sm font-mono">
                            {client.dueDate
                              ? typeof client.dueDate === "string" &&
                                client.dueDate.includes("-")
                                ? client.dueDate.split("-").reverse().join("/")
                                : client.dueDate
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                client.paymentStatus === "Em dia"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"
                                  : client.paymentStatus === "Pendente"
                                    ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/10"
                                    : "bg-red-500/15 text-red-400 border border-red-500/10"
                              }`}
                            >
                              {client.paymentStatus || "Em dia"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                client.status === "Ativo"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                  : client.status === "Prospecção"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                                    : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20"
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openClientModal(client)}
                              className="bg-zinc-800 text-zinc-300 hover:bg-[#c5a880] hover:text-zinc-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {/* View: WhatsApp Integration */}
          {activeTab === "whatsapp" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto h-full flex flex-col"
            >
              <WhatsAppTab 
                userId={activeSyncKey || "zion-master"} 
                userData={{ clients, tasks, transactions, calendarEvents, whatsappLogs }} 
                myProfile={myProfile} 
                setMyProfile={setMyProfile} 
              />
            </motion.div>
          )}

          {/* View: AI Tools */}
          {activeTab === "agents" && (
            <Agentes />
          )}

          {activeTab === "copiloto" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto w-full pb-8"
            >
              <div className="mb-8">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                  <Sparkles className="text-[#c5a880]" size={28} />{" "}
                  Copiloto Zion (Texto)
                </h1>
                <p className="text-zinc-400">
                  Seu assistente de inteligência artificial (Gemini Pro)
                  para acelerar a produção de conteúdo e copy.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      O que vamos criar hoje?
                    </label>
                    <select
                      value={copyType}
                      onChange={(e) => setCopyType(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c5a880]/50 transition-colors appearance-none"
                    >
                      <option>Legenda para Instagram</option>
                      <option>Copy para Facebook/Instagram Ads</option>
                      <option>Roteiro para Reels/TikTok</option>
                      <option>
                        Ideias de Conteúdo (Linha Editorial)
                      </option>
                      <option>E-mail Marketing</option>
                      <option>Copy para Landing Page</option>
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-zinc-400">
                        Briefing / Assunto
                      </label>
                      <VoiceInputButton
                        onTranscript={(val) =>
                          setCopyTopic(
                            (prev) =>
                              (prev || "") + (prev ? " " : "") + val,
                          )
                        }
                      />
                    </div>
                    <textarea
                      value={copyTopic}
                      onChange={(e) => setCopyTopic(e.target.value)}
                      placeholder="Ex: Lançamento de uma nova clínica de estética em São Paulo focada em harmonização facial. O diferencial é o atendimento premium e tecnologia indolor..."
                      className="w-full flex-1 min-h-[200px] bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c5a880]/50 transition-colors resize-none placeholder:text-zinc-700"
                    />
                  </div>

                  <button
                    onClick={handleGenerateCopy}
                    disabled={isGenerating || !copyTopic.trim()}
                    className="w-full bg-[#c5a880] text-zinc-950 py-3.5 rounded-xl font-bold text-base hover:bg-[#b0936b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />{" "}
                        Gerando Mágica...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} /> Gerar Conteúdo
                      </>
                    )}
                  </button>
                </div>

                {/* Output Section */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-zinc-400">
                      Resultado
                    </label>
                    {generatedCopy && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsSavingNote(true)}
                          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm bg-zinc-800 px-3 py-1.5 rounded-lg"
                        >
                          <Save size={14} />
                          Salvar Nota
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm bg-zinc-800 px-3 py-1.5 rounded-lg"
                        >
                          {copied ? (
                            <Check size={14} className="text-[#c5a880]" />
                          ) : (
                            <Copy size={14} />
                          )}
                          {copied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-[#050505] border border-white/10 rounded-xl p-5 overflow-auto">
                    {generatedCopy ? (
                      <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed">
                        {generatedCopy}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm text-center px-8">
                        <Sparkles size={32} className="mb-3 opacity-20" />
                        <p>
                          Preencha o briefing ao lado e clique em gerar
                          para ver a inteligência artificial da Zion em
                          ação.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ai-tools" && (
            <DesignBuilder
              customApiKey={getActiveApiKey()}
              myProfile={myProfile}
            />
          )}

          {/* View: Tasks */}
          {activeTab === "tasks" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-4 lg:space-y-5 flex-1 flex flex-col h-full overflow-hidden w-full"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                    <CheckSquare
                      className="text-[#c5a880] animate-pulse"
                      size={28}
                    />{" "}
                    Painel de Produção
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Gerencie entregas, posts, campanhas e criativos da agência em tempo real.
                  </p>
                </div>
                <button
                  onClick={() => openTaskModal()}
                  className="bg-[#c5a880] text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c5a880]/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 active:scale-95 self-start md:self-auto"
                >
                  <Plus size={16} /> Criar Nova Tarefa
                </button>
              </div>

              {/* Filtering Controls Card */}
              <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-4 sm:p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Search bar */}
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar por título ou descrição..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl pl-9 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880]/50 transition-colors"
                    />
                    {taskSearch && (
                      <button
                        onClick={() => setTaskSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* View Switcher Controls */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium whitespace-nowrap">
                      <Layers size={12} className="text-[#c5a880]" /> Ver por:
                    </span>
                    <div className="bg-[#050505] p-0.5 rounded-lg border border-white/5 flex shrink-0">
                      <button
                        onClick={() => setTaskViewMode("kanban")}
                        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                          taskViewMode === "kanban"
                            ? "bg-[#c5a880] text-zinc-950 shadow-md shadow-amber-500/10"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        Kanban (Status)
                      </button>
                      <button
                        onClick={() => setTaskViewMode("client")}
                        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                          taskViewMode === "client"
                            ? "bg-[#c5a880] text-zinc-950 shadow-md shadow-amber-500/10"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        Por Cliente
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Client Filter Chips */}
                <div className="space-y-1.5 pt-1.5 border-t border-white/[0.03]">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500 font-bold px-0.5">
                    <Filter size={10} className="text-[#c5a880]" />
                    Filtrar por Cliente:
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none max-w-full">
                    <button
                      onClick={() => setTaskClientFilter("all")}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border ${
                        taskClientFilter === "all"
                          ? "bg-[#c5a880]/10 border-[#c5a880] text-[#c5a880] shadow-sm shadow-amber-500/5"
                          : "bg-[#050505] border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      Todos ({tasks.length})
                    </button>
                    
                    <button
                      onClick={() => setTaskClientFilter("none")}
                      className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border ${
                        taskClientFilter === "none"
                          ? "bg-[#c5a880]/10 border-[#c5a880] text-[#c5a880] shadow-sm shadow-amber-500/5"
                          : "bg-[#050505] border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      Sem Cliente ({tasks.filter(t => !t.client || t.client.trim() === "").length})
                    </button>

                    {availableClientsForTasks.map((clientName) => {
                      const totalForThisClient = tasks.filter((t) => t.client === clientName).length;
                      return (
                        <button
                          key={clientName}
                          onClick={() => setTaskClientFilter(clientName)}
                          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border ${
                            taskClientFilter === clientName
                              ? "bg-[#c5a880]/10 border-[#c5a880] text-[#c5a880] shadow-sm shadow-amber-500/5"
                              : "bg-[#050505] border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                          }`}
                        >
                          {clientName} ({totalForThisClient})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* View 1: Kanban (Grouped by Status) */}
              {taskViewMode === "kanban" && (
                <div className="grid md:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0 pb-2">
                  {/* To Do Column */}
                  <div className="bg-[#0b0b0c] rounded-xl p-4 lg:p-5 border border-white/5 shadow-xl flex flex-col min-h-0 h-[450px] md:h-auto md:max-h-[calc(100vh-270px)]">
                    <div className="flex items-center justify-between px-1 pb-3 shrink-0">
                      <h3 className="font-semibold text-zinc-300 flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span>{" "}
                        A Fazer
                      </h3>
                      <span className="text-xs bg-[#050505] text-zinc-400 px-2.5 py-0.5 rounded-full font-bold">
                        {filteredTasks.filter((t) => t.status === "todo").length}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none pr-0.5">
                      {filteredTasks.filter((t) => t.status === "todo").length === 0 ? (
                        <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-zinc-600 text-xs">
                          Nenhuma tarefa pendente
                        </div>
                      ) : (
                        filteredTasks
                          .filter((t) => t.status === "todo")
                          .map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={() => openTaskModal(task)}
                              onMoveStatus={handleQuickMoveTask}
                            />
                          ))
                      )}
                    </div>
                  </div>

                  {/* Doing Column */}
                  <div className="bg-[#0b0b0c] rounded-xl p-4 lg:p-5 border border-white/5 shadow-xl flex flex-col min-h-0 h-[450px] md:h-auto md:max-h-[calc(100vh-270px)]">
                    <div className="flex items-center justify-between px-1 pb-3 shrink-0">
                      <h3 className="font-semibold text-zinc-300 flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>{" "}
                        Em Produção
                      </h3>
                      <span className="text-xs bg-[#050505] text-zinc-400 px-2.5 py-0.5 rounded-full font-bold">
                        {filteredTasks.filter((t) => t.status === "doing").length}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none pr-0.5">
                      {filteredTasks.filter((t) => t.status === "doing").length === 0 ? (
                        <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-zinc-600 text-xs">
                          Nenhuma tarefa em produção
                        </div>
                      ) : (
                        filteredTasks
                          .filter((t) => t.status === "doing")
                          .map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={() => openTaskModal(task)}
                              onMoveStatus={handleQuickMoveTask}
                            />
                          ))
                      )}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-[#0b0b0c] rounded-xl p-4 lg:p-5 border border-white/5 shadow-xl flex flex-col min-h-0 h-[450px] md:h-auto md:max-h-[calc(100vh-270px)]">
                    <div className="flex items-center justify-between px-1 pb-3 shrink-0">
                      <h3 className="font-semibold text-zinc-300 flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                        Concluído
                      </h3>
                      <span className="text-xs bg-[#050505] text-zinc-400 px-2.5 py-0.5 rounded-full font-bold">
                        {filteredTasks.filter((t) => t.status === "done").length}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none pr-0.5">
                      {filteredTasks.filter((t) => t.status === "done").length === 0 ? (
                        <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-zinc-600 text-xs">
                          Nenhuma tarefa concluída
                        </div>
                      ) : (
                        filteredTasks
                          .filter((t) => t.status === "done")
                          .map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={() => openTaskModal(task)}
                              onMoveStatus={handleQuickMoveTask}
                            />
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Grouped by Client */}
              {taskViewMode === "client" && (
                <div className="space-y-6 flex-1 overflow-y-auto scrollbar-none pb-2 pr-0.5">
                  {Object.keys(tasksByClient).length === 0 ? (
                    <div className="bg-[#0b0b0c] border border-dashed border-white/5 rounded-xl p-16 text-center text-zinc-500">
                      Nenhuma tarefa encontrada para os filtros selecionados.
                    </div>
                  ) : (
                    Object.entries(tasksByClient).map(([clientName, clientTasks]) => {
                      const clientObj = clients.find((c) => c.name === clientName);
                      const niche = clientObj?.niche;
                      const totalClientTasks = clientTasks.length;
                      const doneClientTasks = clientTasks.filter((t) => t.status === "done").length;
                      const pct = totalClientTasks > 0 ? Math.round((doneClientTasks / totalClientTasks) * 100) : 0;

                      return (
                        <div
                          key={clientName}
                          className="bg-[#0b0b0c] border border-white/5 rounded-xl p-5 shadow-xl hover:border-white/10 transition-colors"
                        >
                          {/* Client Header Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] font-bold shrink-0">
                                {clientName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                                  {clientName}
                                  {clientName === "Sem Cliente" && (
                                    <span className="text-[10px] bg-[#050505] text-zinc-500 border border-white/5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      Geral
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-zinc-400">
                                  {niche || "Demanda Interna / Geral"} â€¢ {totalClientTasks} {totalClientTasks === 1 ? "tarefa" : "tarefas"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              {/* Progress bar */}
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[10px] text-zinc-400 font-bold">{pct}% Concluído</span>
                                <div className="w-32 h-1.5 bg-[#050505] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>

                              {/* Breakdown */}
                              <div className="flex items-center gap-1 text-[9px] font-black tracking-wider uppercase shrink-0">
                                <span className="bg-[#050505] text-zinc-500 px-2 py-1 rounded-full border border-white/5">
                                  {clientTasks.filter((t) => t.status === "todo").length} TD
                                </span>
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/10">
                                  {clientTasks.filter((t) => t.status === "doing").length} DO
                                </span>
                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/10">
                                  {clientTasks.filter((t) => t.status === "done").length} DN
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-grid of columns */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Todo Sub-column */}
                            <div className="space-y-2.5">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> A Fazer ({clientTasks.filter((t) => t.status === "todo").length})
                              </h4>
                              {clientTasks.filter((t) => t.status === "todo").length === 0 ? (
                                <div className="py-4 border border-dashed border-white/5 rounded-xl text-center text-zinc-700 text-[10px]">
                                  Nenhuma tarefa
                                </div>
                              ) : (
                                clientTasks
                                  .filter((t) => t.status === "todo")
                                  .map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onClick={() => openTaskModal(task)}
                                      onMoveStatus={handleQuickMoveTask}
                                    />
                                  ))
                              )}
                            </div>

                            {/* Doing Sub-column */}
                            <div className="space-y-2.5">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Em Produção ({clientTasks.filter((t) => t.status === "doing").length})
                              </h4>
                              {clientTasks.filter((t) => t.status === "doing").length === 0 ? (
                                <div className="py-4 border border-dashed border-white/5 rounded-xl text-center text-zinc-700 text-[10px]">
                                  Nenhuma tarefa
                                </div>
                              ) : (
                                clientTasks
                                  .filter((t) => t.status === "doing")
                                  .map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onClick={() => openTaskModal(task)}
                                      onMoveStatus={handleQuickMoveTask}
                                    />
                                  ))
                              )}
                            </div>

                            {/* Done Sub-column */}
                            <div className="space-y-2.5">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Concluído ({clientTasks.filter((t) => t.status === "done").length})
                              </h4>
                              {clientTasks.filter((t) => t.status === "done").length === 0 ? (
                                <div className="py-4 border border-dashed border-white/5 rounded-xl text-center text-zinc-700 text-[10px]">
                                  Nenhuma tarefa
                                </div>
                              ) : (
                                clientTasks
                                  .filter((t) => t.status === "done")
                                  .map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onClick={() => openTaskModal(task)}
                                      onMoveStatus={handleQuickMoveTask}
                                    />
                                  ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* View: Dashboard & Finanças */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <LayoutDashboard className="text-[#c5a880]" size={28} />{" "}
                    Dashboard & Finanças
                  </h1>
                  <p className="text-zinc-400 text-sm mt-1">
                    Visão holística da receita recorrente, fluxo de caixa e
                    faturamento da agência.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openTransactionModal()}
                    className="bg-[#c5a880] text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#c5a880]/80 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Nova Transação
                  </button>
                </div>
              </div>

              {/* Welcome state when empty */}
              {clients.length === 0 && transactions.length === 0 && (
                <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-[#c5a880]/10 rounded-xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a880]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="max-w-2xl relative z-10">
                    <span className="bg-[#c5a880]/20 text-[#c5a880] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-4">
                      Boas-vindas ao Zion!
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      Sua agência está limpa e pronta para decolar
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      Você está iniciando com um sistema 100% limpo e zerado.
                      Crie seu primeiro cliente manualmente para começar a
                      gerenciar sua agência.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab("clients")}
                        className="bg-[#c5a880] hover:bg-[#c5a880]/80 text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                      >
                        <Users size={16} /> Cadastrar Novo Cliente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pendingInvoicesExpiringSoon.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#c5a880]/10 border border-[#c5a880]/30 rounded-xl p-8 flex items-start gap-4 shadow-lg shadow-amber-500/5"
                >
                  <div className="bg-[#c5a880]/20 p-2 rounded-lg text-[#c5a880] shrink-0 mt-0.5">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      Faturas próximas do vencimento
                      <span className="bg-[#c5a880] text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {pendingInvoicesExpiringSoon.length} Cliente(s)
                      </span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Você possui faturas pendentes que vencerão nos próximos 3 dias:{" "}
                      <span className="text-zinc-300 font-medium">
                        {pendingInvoicesExpiringSoon.map(c => c.name).join(", ")}.
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 w-full place-content-center">
                {/* Card 1: MRR */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 sm:p-5 hover:border-white/10 transition-colors relative overflow-hidden group min-w-0">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c5a880]" />
                  <div className="flex justify-between items-start text-zinc-400 mb-2 sm:mb-3">
                    <span className="text-sm font-bold text-white block break-words leading-tight mb-1 pr-2">
                      Recorrência (MRR)
                    </span>
                    <Wallet size={18} className="text-[#c5a880] shrink-0" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-zinc-400 truncate">
                    R$ {mrr.toLocaleString("pt-BR")}
                  </h3>
                  <div className="flex items-start sm:items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} className="shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words leading-tight">
                      Calculado de{" "}
                      {clients.filter((c) => c.status === "Ativo").length}{" "}
                      clientes ativos
                    </span>
                  </div>
                </div>

                {/* Card 2: Recebimentos */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 sm:p-5 hover:border-white/10 transition-colors relative overflow-hidden min-w-0">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <div className="flex justify-between items-start text-zinc-400 mb-2 sm:mb-3">
                    <span className="text-sm font-bold text-white block break-words leading-tight mb-1 pr-2">
                      Receitas do Mês
                    </span>
                    <TrendingUp
                      size={18}
                      className="text-emerald-500 shrink-0"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-zinc-400 truncate">
                    R$ {totalReceitas.toLocaleString("pt-BR")}
                  </h3>
                  <div className="flex items-start sm:items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400 mt-2">
                    <ArrowUpRight
                      size={12}
                      className="shrink-0 mt-0.5 sm:mt-0"
                    />
                    <span className="break-words leading-tight">
                      Em dia / Quitadas
                    </span>
                  </div>
                </div>

                {/* Card 3: A Receber */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 sm:p-5 hover:border-white/10 transition-colors relative overflow-hidden min-w-0">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                  <div className="flex justify-between items-start text-zinc-400 mb-2 sm:mb-3">
                    <span className="text-sm font-bold text-white block break-words leading-tight mb-1 pr-2">
                      A Receber
                    </span>
                    <Clock
                      size={18}
                      className="text-violet-500 shrink-0"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-zinc-400 truncate">
                    R$ {totalAReceber.toLocaleString("pt-BR")}
                  </h3>
                  <div className="flex items-start sm:items-center gap-1.5 text-[10px] sm:text-xs text-violet-400 mt-2">
                    <Clock
                      size={12}
                      className="shrink-0 mt-0.5 sm:mt-0"
                    />
                    <span className="break-words leading-tight">
                      Faturas e serviços pendentes
                    </span>
                  </div>
                </div>

                {/* Card 3: Despesas */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 sm:p-5 hover:border-white/10 transition-colors relative overflow-hidden min-w-0">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                  <div className="flex justify-between items-start text-zinc-400 mb-2 sm:mb-3">
                    <span className="text-sm font-bold text-white block break-words leading-tight mb-1 pr-2">
                      Despesas / Custos
                    </span>
                    <TrendingDown size={18} className="text-red-500 shrink-0" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-zinc-400 truncate">
                    R$ {totalDespesas.toLocaleString("pt-BR")}
                  </h3>
                  <div className="flex items-start sm:items-center gap-1.5 text-[10px] sm:text-xs text-red-400 mt-2">
                    <ArrowDownRight
                      size={12}
                      className="shrink-0 mt-0.5 sm:mt-0"
                    />
                    <span className="break-words leading-tight">
                      Ferramentas, ads e freelancers
                    </span>
                  </div>
                </div>

                {/* Card 4: Saldo */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 sm:p-5 hover:border-white/10 transition-colors relative overflow-hidden min-w-0">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                  <div className="flex justify-between items-start text-zinc-400 mb-2 sm:mb-3">
                    <span className="text-sm font-bold text-white block break-words leading-tight mb-1 pr-2">
                      Lucro Líquido
                    </span>
                    <Clock size={18} className="text-blue-400 shrink-0" />
                  </div>
                  <h3
                    className={`text-xl sm:text-2xl font-medium truncate ${liquidIncome >= 0 ? "text-zinc-400" : "text-red-400"}`}
                  >
                    R$ {liquidIncome.toLocaleString("pt-BR")}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs mt-2 text-zinc-500">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${liquidIncome >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {liquidIncome >= 0 ? "Rentável" : "Déficit"}
                    </span>
                    <span className="break-words leading-tight">
                      Margem líquida saudável
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Line Chart */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Fluxo de Caixa (Últimos 6 Meses)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Comparativo histórico de faturamento bruto vs custos
                        operacionais.
                      </p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#c5a880] rounded-full inline-block" />
                        <span className="text-zinc-400">Receitas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-red-500 rounded-full inline-block" />
                        <span className="text-zinc-400">Despesas</span>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Vector Chart */}
                  <div className="w-full h-64 sm:h-80 bg-[#050505] rounded-xl border border-white/5 p-4 relative flex items-center justify-center">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 500 240"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="receitaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#f59e0b"
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            stopColor="#f59e0b"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="despesaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity="0.1"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line
                        x1="50"
                        y1="30"
                        x2="490"
                        y2="30"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="72"
                        x2="490"
                        y2="72"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="115"
                        x2="490"
                        y2="115"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="157"
                        x2="490"
                        y2="157"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="200"
                        x2="490"
                        y2="200"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1.5"
                      />

                      {/* Y Axis Labels */}
                      <text
                        x="45"
                        y="34"
                        fill="#52525b"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        R$ {Math.round(maxChartVal).toLocaleString("pt-BR")}
                      </text>
                      <text
                        x="45"
                        y="76"
                        fill="#52525b"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        R${" "}
                        {Math.round(maxChartVal * 0.75).toLocaleString("pt-BR")}
                      </text>
                      <text
                        x="45"
                        y="119"
                        fill="#52525b"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        R${" "}
                        {Math.round(maxChartVal * 0.5).toLocaleString("pt-BR")}
                      </text>
                      <text
                        x="45"
                        y="161"
                        fill="#52525b"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        R${" "}
                        {Math.round(maxChartVal * 0.25).toLocaleString("pt-BR")}
                      </text>
                      <text
                        x="45"
                        y="204"
                        fill="#52525b"
                        fontSize="8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        R$ 0
                      </text>

                      {/* Dynamic X Axis Labels */}
                      {chartPoints.map((p, idx) => (
                        <text
                          key={`lbl-${idx}`}
                          x={p.x}
                          y="222"
                          fill={
                            hoveredPointIndex === idx ? "#f59e0b" : "#71717a"
                          }
                          fontSize="10"
                          fontWeight={
                            hoveredPointIndex === idx ? "bold" : "normal"
                          }
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {p.name}
                        </text>
                      ))}

                      {/* Area Fill Gradients */}
                      <path d={revAreaPath} fill="url(#receitaGrad)" />
                      <path d={expAreaPath} fill="url(#despesaGrad)" />

                      {/* Trend Lines */}
                      <path
                        d={`M ${revLinePath}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${expLinePath}`}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />

                      {/* Hover column highlight line */}
                      {hoveredPointIndex !== null && (
                        <line
                          x1={chartPoints[hoveredPointIndex].x}
                          y1={30}
                          x2={chartPoints[hoveredPointIndex].x}
                          y2={200}
                          stroke="rgba(245, 158, 11, 0.25)"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                        />
                      )}

                      {/* Data Dots for Receitas */}
                      {chartPoints.map((p, idx) => (
                        <circle
                          key={`dot-rev-${idx}`}
                          cx={p.x}
                          cy={p.yRev}
                          r={hoveredPointIndex === idx ? 6 : 4}
                          fill="#18181b"
                          stroke="#f59e0b"
                          strokeWidth={hoveredPointIndex === idx ? 3.5 : 2}
                          className="transition-all duration-150"
                        />
                      ))}

                      {/* Data Dots for Despesas */}
                      {chartPoints.map((p, idx) => (
                        <circle
                          key={`dot-exp-${idx}`}
                          cx={p.x}
                          cy={p.yExp}
                          r={hoveredPointIndex === idx ? 5 : 3}
                          fill="#18181b"
                          stroke="#ef4444"
                          strokeWidth={hoveredPointIndex === idx ? 2.5 : 1.5}
                          className="transition-all duration-150"
                        />
                      ))}

                      {/* Invisible Hover column rect triggers */}
                      {chartPoints.map((p, idx) => (
                        <rect
                          key={`trigger-${idx}`}
                          x={p.x - 40}
                          y={30}
                          width={80}
                          height={170}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                      ))}
                    </svg>

                    {/* Tooltip dynamic overlay */}
                    <div className="absolute top-2 right-2 bg-[#0b0b0c] border border-white/10 rounded-xl p-3 text-xs text-zinc-300 backdrop-blur-md shadow-xl transition-all w-52">
                      {hoveredPointIndex !== null ? (
                        <div>
                          <p className="font-bold text-white text-xs tracking-wider uppercase">
                            Mês: {chartPoints[hoveredPointIndex].name} 2026
                          </p>
                          <div className="mt-1.5 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                                Receitas
                              </span>
                              <span className="font-bold font-mono text-white">
                                R${" "}
                                {chartPoints[
                                  hoveredPointIndex
                                ].revenue.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Despesas
                              </span>
                              <span className="font-bold font-mono text-zinc-300">
                                R${" "}
                                {chartPoints[
                                  hoveredPointIndex
                                ].expense.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/5 pt-1 mt-1 font-semibold text-white">
                              <span>Saldo</span>
                              <span
                                className={`font-mono ${chartPoints[hoveredPointIndex].revenue - chartPoints[hoveredPointIndex].expense >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                R${" "}
                                {(
                                  chartPoints[hoveredPointIndex].revenue -
                                  chartPoints[hoveredPointIndex].expense
                                ).toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <Sparkles
                              size={12}
                              className="text-[#c5a880] animate-pulse"
                            />
                            Relatório Dinâmico
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                            Passe o mouse no gráfico para ver detalhes mensais
                          </p>
                          <div className="mt-2 space-y-1 text-[11px] border-t border-white/5 pt-1.5">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Fat. Total:</span>
                              <span className="font-bold text-emerald-400 font-mono">
                                R$ {totalReceitas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">
                                Custos Totais:
                              </span>
                              <span className="font-bold text-red-400 font-mono">
                                R$ {totalDespesas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Distribution of Despesas */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                    Divisão de Custos
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Ferramentas de IA & SaaS",
                        key: "Ferramentas",
                        color: "bg-[#c5a880]",
                      },
                      {
                        name: "Freelancers & Produção",
                        key: "Freelancers",
                        color: "bg-purple-500",
                      },
                      {
                        name: "Tráfego Pago (Meta/Google)",
                        key: "Tráfego Ads",
                        color: "bg-emerald-500",
                      },
                      {
                        name: "Outros operacionais",
                        key: "Outros",
                        color: "bg-zinc-500",
                      },
                    ].map((cat) => {
                      const value = transactions
                        .filter(
                          (t) => t.type === "despesa" && t.category === cat.key,
                        )
                        .reduce((sum, t) => sum + t.amount, 0);
                      const pct =
                        totalDespesas > 0
                          ? Math.round((value / totalDespesas) * 100)
                          : 0;
                      return (
                        <div key={cat.key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-400">{cat.name}</span>
                            <span className="text-white font-bold font-mono">
                              R$ {value} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#050505] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${cat.color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <span className="text-xs text-zinc-500">
                      Média de custos operacionais está em 22.4% do faturamento.
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions & Billing lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ledger / Transactions List */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Transações Recentes
                    </h3>
                    <button
                      onClick={() => openTransactionModal()}
                      className="text-[#c5a880] hover:text-[#c5a880] text-xs font-bold"
                    >
                      + Lançar manual
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {transactions.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-[#050505] border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${t.type === "receita" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                          >
                            {t.type === "receita" ? "+" : "-"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-100 truncate">
                              {t.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 font-medium flex-wrap">
                              <span>{t.category}</span>
                              <span>â€¢</span>
                              <span className="font-mono">{t.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span
                            className={`text-sm font-bold font-mono ${t.type === "receita" ? "text-emerald-400" : "text-zinc-200"}`}
                          >
                            R$ {t.amount}
                          </span>
                          <button
                            onClick={() => handleToggleTransactionStatus(t.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${t.status === "pago" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-zinc-950"}`}
                            title={t.status === "pago" ? "Marcar como pendente" : "Marcar como pago"}
                          >
                            {t.status === "pago" ? (
                              <>
                                <CheckCircle2 size={14} /> Pago
                              </>
                            ) : (
                              <>
                                <Circle size={14} /> Pagar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Billing Health Board */}
                <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                    Vencimentos e Cobrança de Clientes
                  </h3>

                  <div className="space-y-3">
                    {clients
                      .filter((c) => c.status === "Ativo")
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-[#050505] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-zinc-100 truncate">
                                {c.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  c.paymentStatus === "Em dia"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : c.paymentStatus === "Pendente"
                                      ? "bg-[#c5a880]/10 text-[#c5a880]"
                                      : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {c.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                              Fatura de{" "}
                              <span className="text-zinc-300 font-semibold">
                                R$ {c.planValue || 0}
                              </span>{" "}
                              vence dia{" "}
                              {c.dueDate
                                ? typeof c.dueDate === "string" &&
                                  c.dueDate.includes("-")
                                  ? c.dueDate.split("-").reverse().join("/")
                                  : c.dueDate
                                : "N/A"}
                            </p>
                          </div>

                          {c.paymentStatus !== "Em dia" ? (
                            <button
                              onClick={() => {
                                // Fast link: record transaction from client
                                const newTx: Transaction = {
                                  id: Date.now(),
                                  description: `Mensalidade recebida: ${c.name}`,
                                  type: "receita",
                                  amount: c.planValue || 0,
                                  date: new Date().toISOString().split("T")[0],
                                  category: "Contratos",
                                  status: "pago",
                                  client: c.name,
                                };
                                setTransactions([newTx, ...transactions]);
                                setClients(
                                  clients.map((item) =>
                                    item.id === c.id
                                      ? { ...item, paymentStatus: "Em dia" }
                                      : item,
                                  ),
                                );
                                // notify
                                const newNotif: NotificationItem = {
                                  id: Date.now(),
                                  message: `Pagamento recebido de '${c.name}' no valor de R$ ${c.planValue} registrado com sucesso.`,
                                  date: new Date().toISOString().split("T")[0],
                                  read: false,
                                  type: "success",
                                };
                                setNotifications((prev) => [newNotif, ...prev]);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Receber Mensalidade
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-500/70 flex items-center gap-1 font-semibold">
                              <Check size={14} /> Recebido
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* View: Calendário & Agenda */}
          {activeTab === "calendar" &&
            (() => {
              const daysInMonth = getDaysInMonth(currentYear, currentMonth);
              const firstDayIndex = getFirstDayOfMonth(
                currentYear,
                currentMonth,
              );
              const monthNames = [
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro",
              ];

              const grid = [];
              for (let i = 0; i < firstDayIndex; i++) {
                grid.push(null);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                grid.push(d);
              }

              // Standardize current date tracker
              const todayDay = 25;
              const isCurrentMonthYear =
                currentYear === 2026 && currentMonth === 5;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-6xl mx-auto space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <Calendar className="text-[#c5a880]" size={28} />{" "}
                        Calendário & Agenda
                      </h1>
                      <p className="text-zinc-400 text-sm mt-1">
                        Planeje postagens de clientes, reuniões corporativas e
                        entregas operacionais.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">

                      {gcalUser ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              syncEventsFromGoogle(gcalToken || "");
                              syncTasksFromGoogle(gcalToken || "");
                            }}
                            disabled={isGcalSyncing}
                            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 px-3 py-2 rounded-lg font-semibold text-xs border border-white/5 transition-colors flex items-center gap-1.5"
                            title="Sincronizar com Google Agenda e Tarefas"
                          >
                            {isGcalSyncing ? (
                              <Loader2
                                size={14}
                                className="animate-spin text-[#c5a880]"
                              />
                            ) : (
                              <RefreshCw size={14} className="text-[#c5a880]" />
                            )}
                            Sincronizar
                          </button>
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Agenda: {gcalUser.email?.split("@")[0]}
                            <button
                              onClick={handleGoogleSignOut}
                              className="ml-2 text-zinc-500 hover:text-red-400 font-bold hover:underline"
                              title="Desconectar Google Agenda"
                            >
                              Sair
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <button
                        onClick={() =>
                          openEventModal(
                            undefined,
                            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-25`,
                          )
                        }
                        className="bg-[#c5a880] text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#c5a880]/80 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} /> Agendar Compromisso
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Matrix layout */}
                    <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 lg:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                          {monthNames[currentMonth]} {currentYear}
                        </h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (currentMonth === 0) {
                                setCurrentMonth(11);
                                setCurrentYear(currentYear - 1);
                              } else {
                                setCurrentMonth(currentMonth - 1);
                              }
                            }}
                            className="p-1.5 bg-[#050505] border border-white/5 text-zinc-400 hover:text-white rounded-lg hover:border-white/10"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Quick toggle back to today / active June 2026
                              setCurrentMonth(5);
                              setCurrentYear(2026);
                            }}
                            className="px-2 py-1 text-xs bg-[#050505] border border-white/5 text-zinc-400 hover:text-white rounded-lg"
                          >
                            Hoje
                          </button>
                          <button
                            onClick={() => {
                              if (currentMonth === 11) {
                                setCurrentMonth(0);
                                setCurrentYear(currentYear + 1);
                              } else {
                                setCurrentMonth(currentMonth + 1);
                              }
                            }}
                            className="p-1.5 bg-[#050505] border border-white/5 text-zinc-400 hover:text-white rounded-lg hover:border-white/10"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Day-of-week header labels */}
                      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                          (day) => (
                            <span
                              key={day}
                              className="text-xs font-bold text-zinc-500 uppercase py-1"
                            >
                              {day}
                            </span>
                          ),
                        )}
                      </div>

                      {/* Day Cells grid */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {grid.map((day, idx) => {
                          if (day === null) {
                            return (
                              <div
                                key={`empty-${idx}`}
                                className="aspect-square bg-[#050505] rounded-xl"
                              />
                            );
                          }

                          const dayString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const dayEvents = calendarEvents.filter(
                            (e) => e.date === dayString,
                          );
                          const isToday =
                            isCurrentMonthYear && day === todayDay;

                          return (
                            <div
                              key={`day-${day}`}
                              onClick={() =>
                                openEventModal(undefined, dayString)
                              }
                              className={`aspect-square p-2 bg-[#050505] border rounded-xl flex flex-col justify-between hover:bg-zinc-800/40 cursor-pointer transition-colors relative group ${
                                isToday
                                  ? "border-[#c5a880] bg-[#c5a880]/5"
                                  : "border-white/5"
                              }`}
                            >
                              <span
                                className={`text-xs font-bold font-mono ${isToday ? "text-[#c5a880]" : "text-zinc-400"}`}
                              >
                                {day}
                              </span>

                              <div className="space-y-1 mt-1">
                                {dayEvents.map((e) => (
                                  <div
                                    key={e.id}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openEventModal(e);
                                    }}
                                    className={`px-1 py-0.5 rounded text-[8px] font-bold truncate ${
                                      e.type === "post"
                                        ? "bg-[#c5a880]/15 text-[#c5a880]"
                                        : e.type === "reuniao"
                                          ? "bg-blue-500/15 text-blue-400"
                                          : "bg-purple-500/15 text-purple-400"
                                    }`}
                                    title={`${e.title} (${e.clientName})`}
                                  >
                                    {e.title}
                                  </div>
                                ))}
                              </div>

                              {/* Quick add Indicator show on hover */}
                              <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 text-[9px] text-[#c5a880] font-bold transition-opacity">
                                +
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sidebar events logger */}
                    <div className="bg-[#0b0b0c] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-8 flex flex-col justify-between h-full min-h-[400px]">
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                            Próximos Eventos
                          </h3>
                          <span className="text-xs text-zinc-500 font-mono font-bold">
                            Zion Core
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {calendarEvents.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 text-xs">
                              Nenhum compromisso agendado para este mês.
                            </div>
                          ) : (
                            calendarEvents.map((e) => (
                              <div
                                key={e.id}
                                onClick={() => openEventModal(e)}
                                className="p-3 bg-[#050505] border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-pointer group"
                              >
                                <div className="flex justify-between items-start">
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      e.type === "post"
                                        ? "bg-[#c5a880]/10 text-[#c5a880]"
                                        : e.type === "reuniao"
                                          ? "bg-blue-500/10 text-blue-400"
                                          : "bg-purple-500/10 text-purple-400"
                                    }`}
                                  >
                                    {e.type === "post"
                                      ? "Postagem ðŸ“"
                                      : e.type === "reuniao"
                                        ? "Reunião ðŸ¤"
                                        : "Entrega ðŸ“¦"}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono font-medium">
                                    {e.date} às {e.time}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-zinc-100 mt-2 group-hover:text-[#c5a880] transition-colors">
                                  {e.title}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1 font-semibold">
                                  {e.clientName}
                                </p>
                                {e.description && (
                                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed bg-[#050505] p-1.5 rounded">
                                    {e.description}
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex gap-2 text-[10px] text-zinc-400 justify-center">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-[#c5a880]" />{" "}
                            Postagem
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-blue-500" />{" "}
                            Reunião
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-purple-500" />{" "}
                            Entrega
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
        </div>
      </main>
    </div>

      {/* Modals */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users size={22} className="text-[#c5a880]" />
                    {editingClient
                      ? "Editar Cadastro do Cliente"
                      : "Cadastrar Novo Cliente"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Preencha as informações essenciais para faturamento e
                    gestão.
                  </p>
                </div>
                <button
                  onClick={closeClientModal}
                  className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Coluna 1: Informações Cadastrais */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a880] font-mono">
                    1. Dados do Cliente
                  </h3>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase">
                        Nome da Empresa / Cliente
                      </label>
                      <VoiceInputButton
                        onTranscript={(val) =>
                          setClientForm((prev) => ({
                            ...prev,
                            name:
                              (prev.name || "") + (prev.name ? " " : "") + val,
                          }))
                        }
                      />
                    </div>
                    <input
                      type="text"
                      value={clientForm.name || ""}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, name: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20"
                      placeholder="Ex: Dr. Silva (Odonto)"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase">
                        Nicho / Área de Atuação
                      </label>
                      <VoiceInputButton
                        onTranscript={(val) =>
                          setClientForm((prev) => ({
                            ...prev,
                            niche:
                              (prev.niche || "") +
                              (prev.niche ? " " : "") +
                              val,
                          }))
                        }
                      />
                    </div>
                    <input
                      type="text"
                      value={clientForm.niche || ""}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, niche: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20"
                      placeholder="Ex: Odontologia"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                      Contato de Suporte / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={clientForm.contact || ""}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          contact: e.target.value,
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>

                  {/* Foto de Perfil */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                      Foto de Perfil do Cliente
                    </label>
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-3 space-y-3">
                      <div className="flex items-center gap-3">
                        {clientForm.avatarUrl ? (
                          <img
                            src={clientForm.avatarUrl}
                            alt="Visualização"
                            className="w-12 h-12 rounded-full object-cover border border-[#c5a880]/50"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-500 text-sm font-bold uppercase">
                            Sem Foto
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="client-avatar-upload"
                            className="text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-center"
                          >
                            + Enviar Foto Personalizada
                          </label>
                          <input
                            type="file"
                            id="client-avatar-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setClientForm({
                                    ...clientForm,
                                    avatarUrl: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {clientForm.avatarUrl && (
                            <button
                              onClick={() =>
                                setClientForm({
                                  ...clientForm,
                                  avatarUrl: undefined,
                                })
                              }
                              className="text-[10px] text-red-400 hover:text-red-300 font-bold text-left"
                            >
                              Remover Foto
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 block">
                          Ou selecione uma foto corporativa pronta:
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                          {PRESET_AVATARS.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                setClientForm({ ...clientForm, avatarUrl: url })
                              }
                              className={`w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 transition-all ${
                                clientForm.avatarUrl === url
                                  ? "border-[#c5a880] scale-110 ring-2 ring-amber-500/20"
                                  : "border-white/10 hover:border-white/30"
                              }`}
                            >
                              <img
                                src={url}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                alt=""
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Dados Financeiros e Contrato */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a880] font-mono">
                    2. Valores & Faturamento
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        Mensalidade (R$)
                      </label>
                      <input
                        type="number"
                        value={clientForm.planValue || ""}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            planValue: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
                        placeholder="Ex: 1500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        Próximo Vencimento
                      </label>
                      <input
                        type="date"
                        value={clientForm.dueDate || ""}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            dueDate: e.target.value,
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        Status Cobrança
                      </label>
                      <select
                        value={clientForm.paymentStatus || "Em dia"}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            paymentStatus: e.target
                              .value as Client["paymentStatus"],
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20"
                      >
                        <option value="Em dia">ðŸŸ¢ Em dia</option>
                        <option value="Pendente">ðŸŸ¡ Pendente</option>
                        <option value="Atrasado">ðŸ”´ Atrasado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        value={clientForm.startDate || ""}
                        onChange={(e) =>
                          setClientForm({
                            ...clientForm,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                      Status Geral
                    </label>
                    <select
                      value={clientForm.status || "Prospecção"}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          status: e.target.value as Client["status"],
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Prospecção">Prospecção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase font-mono">
                      Observações Internas (Opcional)
                    </label>
                    <textarea
                      value={clientForm.notes || ""}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, notes: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 focus:ring-1 focus:ring-amber-500/20 min-h-[70px]"
                      placeholder="Notas adicionais, contatos de emergência, senhas compartilhadas..."
                    />
                  </div>

                  {/* Collapsible advanced plan details */}
                  <div className="border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setClientForm((prev) => ({
                          ...prev,
                          plan: prev.plan === undefined ? "" : undefined,
                        }))
                      }
                      className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {clientForm.plan !== undefined
                        ? "[-] Remover Detalhes do Plano"
                        : "[+] Adicionar Nome do Plano/Contrato"}
                    </button>

                    {clientForm.plan !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 mt-3"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                            Nome do Plano / Pacote
                          </label>
                          <input
                            type="text"
                            value={clientForm.plan || ""}
                            onChange={(e) =>
                              setClientForm({
                                ...clientForm,
                                plan: e.target.value,
                              })
                            }
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                            placeholder="Ex: Plano Intermediário"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase font-mono">
                            Escopo / Detalhes de Entregáveis
                          </label>
                          <textarea
                            value={clientForm.planDetails || ""}
                            onChange={(e) =>
                              setClientForm({
                                ...clientForm,
                                planDetails: e.target.value,
                              })
                            }
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 min-h-[60px]"
                            placeholder="Ex: 2 Posts/semana, 1 Reels/semana, R$ 200 tráfego embutido..."
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {editingClient &&
                savedNotes.filter((n) => n.clientName === editingClient.name)
                  .length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a880] font-mono flex items-center gap-2 mb-4">
                      <FileText size={14} /> Notas & Documentos do Cliente
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedNotes
                        .filter((n) => n.clientName === editingClient.name)
                        .map((note) => (
                          <div
                            key={note.id}
                            className="bg-[#050505] border border-white/5 rounded-xl p-8"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-white">
                                {note.title}
                              </h4>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {note.date}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-3 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                {editingClient ? (
                  <button
                    onClick={() => handleDeleteClient(editingClient.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={15} /> Excluir Cliente
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeClientModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveClient}
                    className="bg-[#c5a880] hover:bg-[#c5a880]/80 text-zinc-950 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-amber-500/15"
                  >
                    Gravar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isSavingNote && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-md shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Save size={20} className="text-[#c5a880]" />
                    Salvar Nota / Copy
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Vincule o texto gerado a um cliente.
                  </p>
                </div>
                <button
                  onClick={() => setIsSavingNote(false)}
                  className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Cliente
                  </label>
                  <select
                    value={noteClient}
                    onChange={(e) => setNoteClient(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                  >
                    <option value="">Selecione o Cliente</option>
                    <option value="Geral (Sem cliente)">
                      Geral (Sem cliente)
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Título da Nota
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                    placeholder="Ex: Copy para Campanha de Black Friday"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setIsSavingNote(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!noteClient || !noteTitle) {
                        alert("Por favor, preencha o cliente e o título.");
                        return;
                      }
                      const newNote: SavedNote = {
                        id: Date.now(),
                        clientName: noteClient,
                        title: noteTitle,
                        content: generatedCopy,
                        date: new Date().toISOString().split("T")[0],
                        type: "Copywriting",
                      };
                      setSavedNotes((prev) => [newNote, ...prev]);
                      setIsSavingNote(false);
                      setNoteClient("");
                      setNoteTitle("");
                      alert("Nota salva com sucesso!");
                    }}
                    className="bg-[#c5a880] text-zinc-950 px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#c5a880]/80 transition-colors shadow-lg shadow-amber-500/10 active:scale-95"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User size={20} className="text-[#c5a880]" />
                    Configurações da Minha Conta
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Gerencie o nome e avatar exibidos no painel Zion.
                  </p>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 text-left">
                {/* Avatar Display & Input */}
                <div className="flex flex-col items-center gap-4 bg-[#050505] border border-white/5 rounded-xl p-8">
                  {myProfile.avatarUrl ? (
                    <img
                      src={myProfile.avatarUrl}
                      alt={myProfile.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#c5a880]/50 shadow-lg shadow-amber-500/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#c5a880] text-zinc-950 flex items-center justify-center text-2xl font-black uppercase">
                      {myProfile.name.substring(0, 2)}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <label
                      htmlFor="user-avatar-upload"
                      className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg cursor-pointer transition-colors text-center w-full sm:w-auto"
                    >
                      + Enviar Foto do Computador
                    </label>
                    <input
                      type="file"
                      id="user-avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMyProfile({
                              ...myProfile,
                              avatarUrl: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {myProfile.avatarUrl && (
                      <button
                        onClick={() =>
                          setMyProfile({ ...myProfile, avatarUrl: "" })
                        }
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>

                  {/* Preset photo options for user/agency */}
                  <div className="w-full space-y-1">
                    <span className="text-[10px] text-zinc-500 block text-center">
                      Ou escolha um avatar pronto de agência:
                    </span>
                    <div className="flex gap-2 justify-center py-1 overflow-x-auto scrollbar-none">
                      {[
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // Default
                        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", // Executive Man
                        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", // Woman
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", // Man
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", // Woman 2
                      ].map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setMyProfile({ ...myProfile, avatarUrl: url })
                          }
                          className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
                            myProfile.avatarUrl === url
                              ? "border-[#c5a880] scale-110"
                              : "border-white/10"
                          }`}
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            alt=""
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Role Form fields */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Nome do Usuário / Agência
                  </label>
                  <input
                    type="text"
                    value={myProfile.name}
                    onChange={(e) =>
                      setMyProfile({ ...myProfile, name: e.target.value })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                    placeholder="Ex: Equipe Zion"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Função / Cargo
                  </label>
                  <input
                    type="text"
                    value={myProfile.role}
                    onChange={(e) =>
                      setMyProfile({ ...myProfile, role: e.target.value })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                    placeholder="Ex: Agência Digital"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c5a880] mb-1.5 uppercase flex items-center gap-1.5">
                    <Wand2 size={12} /> Chave API Gemini (Opcional)
                  </label>
                  <input
                    type="password"
                    value={myProfile.geminiApiKey || ""}
                    onChange={(e) =>
                      setMyProfile({
                        ...myProfile,
                        geminiApiKey: e.target.value,
                      })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50"
                    placeholder="Cole sua API Key do Google AI Studio aqui"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1.5">
                    Ao definir a chave aqui, a IA utilizará sua cota para gerar
                    textos e ler imagens. Esta chave é salva diretamente no
                    Firebase e fica disponível em todos os seus dispositivos.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="bg-[#c5a880] hover:bg-[#c5a880]/80 text-zinc-950 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-amber-500/15"
                >
                  Confirmar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}



        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                </h2>
                <button
                  onClick={closeTaskModal}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex bg-[#050505] p-1 rounded-xl mb-6">
                <button
                  onClick={() => setTaskMode('manual')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                    taskMode === 'manual'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setTaskMode('ai')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                    taskMode === 'ai'
                      ? 'bg-[#c5a880] text-zinc-950'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  IA
                </button>
              </div>

              <div className="space-y-4">
                {taskMode === 'ai' && !editingTask && (
                  <div className="bg-[#c5a880]/10 border border-[#c5a880]/20 rounded-xl p-8 mb-4">
                    <h3 className="text-[#c5a880] text-sm font-bold flex items-center gap-1.5 mb-2">
                      <Sparkles size={14} /> Criação Inteligente com IA
                    </h3>
                    <p className="text-xs text-zinc-400 mb-3">
                      Envie um áudio, texto ou arquivo. A IA entenderá os detalhes e organizará a tarefa, prazo e cliente para você (integrado ao Google Workspace).
                    </p>
                    <textarea
                      value={parseInputText}
                      onChange={(e) => setParseInputText(e.target.value)}
                      placeholder="Descreva a tarefa ou cole anotações..."
                      className="w-full bg-[#050505] border border-[#c5a880]/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]/50 text-sm min-h-[60px] resize-none mb-2"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
                      <div className="flex flex-1 items-center gap-2 w-full">
                        <VoiceInputButton
                          onTranscript={(val) => setParseInputText((prev) => prev + (prev ? " " : "") + val)}
                        />
                        <input
                          type="file"
                          onChange={(e) => setParseInputFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-zinc-400 w-full"
                        />
                      </div>
                      <button
                        onClick={handleParseTask}
                        disabled={isParsingTask}
                        className="bg-[#c5a880] text-zinc-950 px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#c5a880]/80 whitespace-nowrap disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isParsingTask ? "Analisando..." : "Organizar"}
                      </button>
                    </div>
                  </div>
                )}
                {taskMode === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-zinc-400">
                          Título da Tarefa
                        </label>
                        <VoiceInputButton
                          onTranscript={(val) =>
                            setTaskForm((prev) => ({
                              ...prev,
                              title:
                                (prev.title || "") + (prev.title ? " " : "") + val,
                            }))
                          }
                        />
                      </div>
                      <input
                        type="text"
                        value={taskForm.title || ""}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, title: e.target.value })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Ex: Criar roteiro de Reels"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        Cliente
                      </label>
                      <select
                        value={taskForm.client || ""}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, client: e.target.value })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                      >
                        <option value="">
                          Nenhum / Sem Cliente
                        </option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        Status
                      </label>
                  <select
                    value={taskForm.status || "todo"}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as Task["status"],
                      })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="doing">Em Produção</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!taskForm.hasDeadline}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          hasDeadline: e.target.checked,
                        })
                      }
                      className="rounded border-zinc-700 bg-[#050505] text-[#c5a880] focus:ring-amber-500/50 focus:ring-offset-0 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      Possui prazo de entrega?
                    </span>
                  </label>

                  {taskForm.hasDeadline && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Data de Entrega
                      </label>
                      <CustomDatePicker
                        value={
                          taskForm.dueDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(val) =>
                          setTaskForm({ ...taskForm, dueDate: val })
                        }
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
                {editingTask ? (
                  <button
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeTaskModal}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  {taskMode === 'manual' && (
                    <button
                      onClick={handleSaveTask}
                      className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors"
                    >
                      Salvar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isTransactionModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="text-[#c5a880]" size={20} />
                  {editingTransaction ? "Editar Transação" : "Nova Transação"}
                </h2>
                <button
                  onClick={closeTransactionModal}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-zinc-400">
                      Descrição
                    </label>
                    <VoiceInputButton
                      onTranscript={(val) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          description:
                            (prev.description || "") +
                            (prev.description ? " " : "") +
                            val,
                        }))
                      }
                    />
                  </div>
                  <input
                    type="text"
                    value={transactionForm.description || ""}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    placeholder="Ex: Mensalidade Dr. Silva"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Tipo
                    </label>
                    <select
                      value={transactionForm.type || "receita"}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          type: e.target.value as "receita" | "despesa",
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      <option value="receita">Receita (+)</option>
                      <option value="despesa">Despesa (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      value={transactionForm.amount || 0}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          amount: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Data
                    </label>
                    <CustomDatePicker
                      value={transactionForm.date || ""}
                      onChange={(val) =>
                        setTransactionForm({ ...transactionForm, date: val })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Status
                    </label>
                    <select
                      value={transactionForm.status || "pago"}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          status: e.target.value as "pago" | "pendente",
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Categoria
                    </label>
                    {isAddingNewCategory ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Nova Categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#c5a880]/50"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = newCategoryName.trim();
                              if (
                                trimmed &&
                                !transactionCategories.includes(trimmed)
                              ) {
                                const updated = [
                                  ...transactionCategories,
                                  trimmed,
                                ];
                                setTransactionCategories(updated);
                                setTransactionForm({
                                  ...transactionForm,
                                  category: trimmed,
                                });
                              }
                              setNewCategoryName("");
                              setIsAddingNewCategory(false);
                            }}
                            className="bg-[#c5a880] hover:bg-[#c5a880]/80 text-zinc-950 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewCategoryName("");
                            setIsAddingNewCategory(false);
                            setTransactionForm({
                              ...transactionForm,
                              category: "Contratos",
                            });
                          }}
                          className="text-[10px] text-zinc-500 hover:text-zinc-400 block font-bold text-left"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <select
                        value={transactionForm.category || "Contratos"}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsAddingNewCategory(true);
                          } else {
                            setTransactionForm({
                              ...transactionForm,
                              category: e.target.value,
                            });
                          }
                        }}
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]/50 text-sm"
                      >
                        {transactionCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__NEW__">+ Nova Categoria...</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Cliente Vinculado
                    </label>
                    <select
                      value={transactionForm.client || ""}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          client: e.target.value,
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      <option value="">Nenhum</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                {editingTransaction ? (
                  <button
                    onClick={() =>
                      handleDeleteTransaction(editingTransaction.id)
                    }
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeTransactionModal}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTransaction}
                    className="bg-[#c5a880] text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#c5a880]/80 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isEventModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0c] border border-white/10 rounded-xl p-8 sm:p-6 w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-[#c5a880]" size={20} />
                  {editingEvent ? "Editar Evento" : "Novo Compromisso"}
                </h2>
                <button
                  onClick={closeEventModal}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-zinc-400">
                      Título do Evento
                    </label>
                    <VoiceInputButton
                      onTranscript={(val) =>
                        setEventForm((prev) => ({
                          ...prev,
                          title:
                            (prev.title || "") + (prev.title ? " " : "") + val,
                        }))
                      }
                    />
                  </div>
                  <input
                    type="text"
                    value={eventForm.title || ""}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    placeholder="Ex: Reunião Mensal Sispumumc"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Data
                    </label>
                    <CustomDatePicker
                      value={eventForm.date || ""}
                      onChange={(val) =>
                        setEventForm({ ...eventForm, date: val })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={eventForm.time || "14:00"}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, time: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={eventForm.type || "post"}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          type: e.target.value as
                            | "post"
                            | "reuniao"
                            | "entrega",
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      <option value="post">Post ðŸ“</option>
                      <option value="reuniao">Reunião ðŸ¤</option>
                      <option value="entrega">Entrega/Gravação ðŸ“¦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Cliente Vinculado
                    </label>
                    <select
                      value={eventForm.clientName || ""}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          clientName: e.target.value,
                        })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      <option value="" disabled>
                        Selecione um cliente
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Descrição / Briefing
                  </label>
                  <textarea
                    value={eventForm.description || ""}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 min-h-[80px] text-sm"
                    placeholder="Ex: Pauta da reunião ou detalhes do post..."
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                {editingEvent ? (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeEventModal}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="bg-[#c5a880] text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#c5a880]/80 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          myProfile={myProfile}
          setMyProfile={setMyProfile}
          googleToken={googleToken}
          clients={clients}
          transactions={transactions}
          tasks={tasks}
          calendarEvents={calendarEvents}
          setClients={setClients}
          setTransactions={setTransactions}
          setTasks={setTasks}
          setCalendarEvents={setCalendarEvents}
        />
      )}
    </div>
  );
}

// Subcomponents

function FormGroup({
  label,
  children,
  onVoiceTranscript,
}: {
  label: string;
  children: React.ReactNode;
  onVoiceTranscript?: (text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
        {onVoiceTranscript && (
          <VoiceInputButton onTranscript={onVoiceTranscript} />
        )}
      </div>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-[#c5a880]" : "bg-zinc-800"}`}
      >
        <div
          className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
      <span className="text-sm text-zinc-300">{label}</span>
    </label>
  );
}

function SidebarItemMini({
  icon,
  active,
  onClick,
  tooltip,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <div className="relative group flex justify-center w-full">
      <button
        onClick={onClick}
        className={`p-3 rounded-xl transition-all ${
          active
            ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/20 font-bold"
            : "text-zinc-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
        }`}
      >
        {icon}
      </button>
      {/* Tooltip on Hover */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#121214] border border-white/10 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
        {tooltip}
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold uppercase tracking-wider ${
        active
          ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/20 font-bold scale-[1.01] shadow-lg shadow-[#c5a880]/[0.02]"
          : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200 border border-transparent"
      }`}
    >
      <span className={active ? "text-[#c5a880]" : "text-zinc-500 group-hover:text-zinc-350"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const TaskCard: React.FC<{
  task: Task;
  onClick: () => void;
  onMoveStatus?: (id: number, newStatus: Task["status"]) => void;
}> = ({ task, onClick, onMoveStatus }) => {
  const isOverdue =
    task.status !== "done" &&
    task.hasDeadline &&
    task.dueDate &&
    typeof task.dueDate === "string" &&
    new Date().toISOString().split("T")[0] > task.dueDate;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0b0b0c] border p-4 rounded-xl transition-all cursor-pointer group hover:bg-zinc-800/50 relative overflow-hidden ${
        isOverdue
          ? "border-red-500/30 hover:border-red-500/50 shadow-md shadow-red-500/5"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a880] bg-[#c5a880]/10 px-2 py-0.5 rounded">
          {task.client}
        </span>
        <span className="text-[9px] text-zinc-500 font-mono font-medium">
          #{task.id}
        </span>
      </div>
      <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors leading-snug mb-2">
        {task.title}
      </h4>

      {task.hasDeadline && task.dueDate && (
        <div className="flex items-center gap-1.5 mb-3">
          {isOverdue ? (
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />{" "}
              Atrasada (
              {typeof task.dueDate === "string" && task.dueDate.includes("-")
                ? task.dueDate.split("-").reverse().slice(0, 2).join("/")
                : task.dueDate}
              )
            </span>
          ) : (
            <span className="text-[10px] bg-[#050505] text-zinc-400 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
              <Clock size={10} className="text-[#c5a880]/70" /> Prazo:{" "}
              {typeof task.dueDate === "string" && task.dueDate.includes("-")
                ? task.dueDate.split("-").reverse().slice(0, 2).join("/")
                : task.dueDate}
            </span>
          )}
        </div>
      )}

      {/* Quick Move Action buttons */}
      {onMoveStatus && (
        <div className="flex items-center justify-end gap-1.5 border-t border-white/5 pt-2.5 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
          {task.status === "todo" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus(task.id, "doing");
              }}
              className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500 hover:text-zinc-950 text-blue-400 font-bold text-[10px] px-2 py-1 rounded transition-all"
              title="Iniciar Produção"
            >
              Iniciar <ChevronRight size={12} />
            </button>
          )}

          {task.status === "doing" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(task.id, "todo");
                }}
                className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-[10px] px-1.5 py-1 rounded transition-all"
                title="Mover para A Fazer"
              >
                <ChevronLeft size={12} /> Voltar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(task.id, "done");
                }}
                className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 font-bold text-[10px] px-2 py-1 rounded transition-all"
                title="Concluir Tarefa"
              >
                Concluir <Check size={12} />
              </button>
            </>
          )}

          {task.status === "done" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus(task.id, "doing");
              }}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-[10px] px-2 py-1 rounded transition-all"
              title="Reabrir Tarefa"
            >
              <ChevronLeft size={12} /> Reabrir
            </button>
          )}
        </div>
      )}
    </div>
  );
};

