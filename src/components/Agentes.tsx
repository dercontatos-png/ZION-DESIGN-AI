import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Play, Zap, FileText, Layout, PenTool, Image as ImageIcon, Code, MessageSquare, BrainCircuit, BarChart3 } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";

const getIcon = (id: string, category: string) => {
  switch (category) {
    case "Copy": return <PenTool size={24} />;
    case "Design": return <ImageIcon size={24} />;
    case "Layout": return <Layout size={24} />;
    default: return <Zap size={24} />;
  }
};

export const Agentes: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Todas ferramentas");
  const { setChatActiveAssistantId, setChatDrawerOpen } = useProjectStore();

  const filters = ["Todas ferramentas", "Copy", "Layout", "Design"];

  const agents = [
    { id: "analise-estrategica", title: "Análise Estratégica", description: "Investigue seu lead a fundo, descubra dores reais e entre com vantagem estratégica.", category: "Copy" },
    { id: "icp", title: "ICP e Posicionamento", description: "Fortaleça seu posicionamento, transmita autoridade e atraia clientes prontos para comprar.", category: "Copy" },
    { id: "atendimento", title: "Atendimento e Negociação", description: "Feche mais projetos com conversas estratégicas que geram confiança e conduzem ao sim.", category: "Copy" },
    { id: "copy-builder-carrossel", title: "Copy Builder [Carrossel]", description: "Crie carrosséis N3 que prendem, aprofundam a consciência e transformam atenção em ação.", category: "Copy" },
    { id: "copy-builder-ads", title: "Copy Builder [Ads]", description: "Crie anúncios estáticos que param o scroll, ativam dor e puxam o clique.", category: "Copy" },
    { id: "webson-vendedor", title: "Webson Vendedor", description: "Envie sua mensagem ou histórico da conversa que eu vou te ajudar a fechar a venda.", category: "Copy" },
    { id: "estrutura-sites", title: "Estrutura Sites [IA]", description: "Esse agente entende o seu briefing e cria a estrutura do site como um mestre.", category: "Layout" },
    { id: "easy-copy", title: "Easy Copy", description: "Crie copys de alta conversão para sites/lps de qualquer nicho com alta qualidade.", category: "Copy" },
    { id: "diretor-criativo", title: "Diretor Cr[IA]tivo", description: "Saia da tela em branco com maestria e torne seu design ainda mais incrível.", category: "Design" },
    { id: "easy-image", title: "Easy Image", description: "Gere imagens e extraia prompts com uma maior nível de detalhes e assertividade.", category: "Design" },
    { id: "easy-coder", title: "Easy Coder", description: "Crie e faça alteração nos códigos dos seus projetos de maneira fácil e otimizada.", category: "Layout" },
    { id: "analisador-paginas", title: "Analisador de Páginas", description: "Receba opiniões profissionais de uma IA treinada pra extrair seu melhor.", category: "Layout" },
    { id: "deep-work", title: "Deep Work", description: "Playlist para você trabalhar para aumentar sua produtividade e criatividade.", category: "Layout" }
  ];

  const filteredAgents = activeFilter === "Todas ferramentas" 
    ? agents 
    : agents.filter(a => a.category === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col p-8 overflow-y-auto bg-black"
    >
      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-2xl font-bold text-zinc-100">Ferramentas e Agentes</h2>
        <p className="text-zinc-500">Selecione uma ferramenta para começar a otimizar seu processo.</p>
      </div>

      <div className="flex items-center gap-2 mb-8 mt-4 bg-black p-2 rounded-2xl border border-white/5 w-fit max-w-full overflow-x-auto py-3 px-2.5 my-2 scrollbar-none">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap my-0.5 ${
              activeFilter === filter
                ? "bg-[#c5a880] text-zinc-950 font-bold shadow-sm shadow-amber-500/10"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredAgents.map(agent => (
          <motion.div 
            key={agent.id} 
            whileHover={{ y: -4 }}
            className="group flex flex-col p-6 rounded-2xl bg-black border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/5" 
            onClick={() => {
              if (agent.id === "deep-work") {
                window.open("https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", "_blank");
              } else {
                setChatActiveAssistantId(agent.id);
                setChatDrawerOpen(true);
              }
            }}
          >
            <div className="w-12 h-12 mb-6 rounded-xl bg-[#111]/50 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
               {getIcon(agent.id, agent.category)}
            </div>
            <h3 className="text-base font-bold text-zinc-100 mb-2 group-hover:text-amber-400 transition-colors">{agent.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{agent.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Agentes;
