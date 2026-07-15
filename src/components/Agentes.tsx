import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Play } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";

export const Agentes: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Todas ferramentas");
  const { setChatActiveAssistantId, setChatDrawerOpen } = useProjectStore();

  const filters = ["Todas ferramentas", "Copy", "Layout", "Design"];

  const agents = [
    {
      id: "analise-estrategica",
      title: "Análise Estratégica",
      description: "Investigue seu lead a fundo, descubra dores reais e entre com vantagem estratégica.",
      category: "Copy",
       // Placeholder, we can use an image or an icon. I will use placeholder images or colored divs if not available.
    },
    {
      id: "icp",
      title: "ICP e Posicionamento",
      description: "Fortaleça seu posicionamento, transmita autoridade e atraia clientes prontos para comprar.",
      category: "Copy"
    },
    {
      id: "atendimento",
      title: "Atendimento e Negociação",
      description: "Feche mais projetos com conversas estratégicas que geram confiança e conduzem ao sim.",
      category: "Copy"
    },
    {
      id: "copy-builder-carrossel",
      title: "Copy Builder [Carrossel]",
      description: "Crie carrosséis N3 que prendem, aprofundam a consciência e transformam atenção em ação.",
      category: "Copy"
    },
    {
      id: "copy-builder-ads",
      title: "Copy Builder [Ads]",
      description: "Crie anúncios estáticos que param o scroll, ativam dor e puxam o clique.",
      category: "Copy"
    },
    {
      id: "webson-vendedor",
      title: "Webson Vendedor",
      description: "Envie sua mensagem ou histórico da conversa que eu vou te ajudar a fechar a venda.",
      category: "Copy"
    },
    {
      id: "estrutura-sites",
      title: "Estrutura Sites [IA]",
      description: "Esse agente entende o seu briefing e cria a estrutura do site como um mestre.",
      category: "Layout"
    },
    {
      id: "easy-copy",
      title: "Easy Copy",
      description: "Crie copys de alta conversão para sites/lps de qualquer nicho com alta qualidade.",
      category: "Copy"
    },
    {
      id: "diretor-criativo",
      title: "Diretor Cr[IA]tivo",
      description: "Saia da tela em branco com maestria e torne seu design ainda mais incrível.",
      category: "Design"
    },
    {
      id: "easy-image",
      title: "Easy Image",
      description: "Gere imagens e extraia prompts com uma maior nível de detalhes e assertividade.",
      category: "Design"
    },
    {
      id: "easy-coder",
      title: "Easy Coder",
      description: "Crie e faça alteração nos códigos dos seus projetos de maneira fácil e otimizada.",
      category: "Layout"
    },
    {
      id: "analisador-paginas",
      title: "Analisador de Páginas",
      description: "Receba opiniões profissionais de uma IA treinada pra extrair seu melhor.",
      category: "Layout"
    },
    {
      id: "deep-work",
      title: "Deep Work",
      description: "Playlist para você trabalhar para aumentar sua produtividade e criatividade.",
      category: "Layout"
    }
  ];

  const filteredAgents = activeFilter === "Todas ferramentas" 
    ? agents 
    : agents.filter(a => a.category === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-3 text-zinc-400 border-r border-white/10">
            <Filter size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">Filtro</span>
          </div>
          <div className="flex items-center gap-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="group flex flex-col items-center text-center cursor-pointer" onClick={() => {
            if (agent.id === "deep-work") {
              window.open("https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", "_blank");
            } else {
              setChatActiveAssistantId(agent.id);
              setChatDrawerOpen(true);
            }
          }}>
            <div className="w-24 h-24 mb-4 rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 shadow-xl relative transition-all group-hover:border-amber-500/30 group-hover:shadow-amber-500/10 group-hover:scale-105">
               {/* Just a stylized placeholder for images since we don't have the exact ones */}
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                 <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/5">
                    <span className="text-2xl font-black text-zinc-600 group-hover:text-amber-500/50 transition-colors">
                      {agent.title.charAt(0)}
                    </span>
                 </div>
               </div>
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mb-2 group-hover:text-amber-400 transition-colors leading-tight">{agent.title}</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{agent.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Agentes;
