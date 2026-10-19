import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp, 
  UserRound, 
  Box, 
  Sparkles, 
  Sliders, 
  Copy, 
  RotateCcw, 
  Plus, 
  Palette, 
  Mountain, 
  Type, 
  Settings, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Camera, 
  Layers, 
  Flame, 
  Crown, 
  Zap, 
  Clock, 
  Shield, 
  Cpu, 
  GlassWater, 
  Layout, 
  Feather, 
  Smile, 
  Tv, 
  Gamepad2, 
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';

export default function OrionSidebar({ onConstruir, isGenerating = false }) {
  // Estado dos Accordions: Principal aberto por padrão; os outros 5 fechados
  const [openAccordions, setOpenAccordions] = useState({
    principal: true,
    marcaEstilo: false,
    cenario: false,
    textoImagem: false,
    ajustes: false,
    configuracoes: false
  });

  // 1. PRINCIPAL (Exatamente os 6 campos do original)
  const [categoria, setCategoria] = useState('Pessoa'); // 'Pessoa' | 'Produto' | 'Livre'
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [quantidade, setQuantidade] = useState('1');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectPosition, setSubjectPosition] = useState('center');
  const [plano, setPlano] = useState('medium'); // 'close-up' | 'medium' | 'american' | 'full_body'

  // 2. MARCA E ESTILO
  const [ambientColor, setAmbientColor] = useState('#1a1a2e');
  const [complementaryLight, setComplementaryLight] = useState('#e2e2e2');
  const [complementaryColor, setComplementaryColor] = useState('#7C3AED');
  const [estiloVisual, setEstiloVisual] = useState('ultra_realistic');
  const [styleRefDescription, setStyleRefDescription] = useState('');
  const [sobriedadeCriatividade, setSobriedadeCriatividade] = useState(50);

  // 3. CENÁRIO
  const [nichoProjeto, setNichoProjeto] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [sceneRefDescription, setSceneRefDescription] = useState('');

  // 4. TEXTO NA IMAGEM [EXPERIMENTAL]
  const [textBlocks, setTextBlocks] = useState([
    { id: 1, type: 'h1', content: '', weight: 5 }
  ]);
  const [degradeTexto, setDegradeTexto] = useState(false);
  const [posicaoTexto, setPosicaoTexto] = useState('align-center');

  // 5. AJUSTES
  const [elementosFlutuantes, setElementosFlutuantes] = useState('');
  const [usarBlur, setUsarBlur] = useState(false);
  const [promptAdicional, setPromptAdicional] = useState('');

  // 6. CONFIGURAÇÕES
  const [dimensions, setDimensions] = useState('16:9');
  const [quality, setQuality] = useState('2K');

  const ESTILOS_VISUAIS = [
    { value: "ultra_realistic", label: "Ultra Realista", Icon: Camera },
    { value: "glow", label: "Glow Radiante", Icon: Sparkles },
    { value: "pro_portrait", label: "Retrato Profissional", Icon: Layers },
    { value: "classic", label: "Clássico", Icon: Clock },
    { value: "formal", label: "Formal Corporativo", Icon: Briefcase },
    { value: "elegant", label: "Elegante & Luxo", Icon: Crown },
    { value: "sexy", label: "Editorial Dramático", Icon: Flame },
    { value: "institutional", label: "Institucional", Icon: Shield },
    { value: "tech", label: "Tecnológico / Cyber", Icon: Cpu },
    { value: "glassmorphism", label: "Glassmorphism", Icon: GlassWater },
    { value: "ui_interface", label: "Interface UI", Icon: Layout },
    { value: "minimalist", label: "Minimalista", Icon: Feather },
    { value: "playful", label: "Lúdico / Divertido", Icon: Smile },
    { value: "cartoon", label: "Cartoon / Ilustrado", Icon: Tv },
    { value: "infoproduct", label: "Infoproduto", Icon: Zap },
    { value: "jovial", label: "Jovial Lifestyle", Icon: Sparkles },
    { value: "gamer", label: "Gamer Esports", Icon: Gamepad2 }
  ];

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAll = () => {
    const allOpen = Object.values(openAccordions).every(Boolean);
    setOpenAccordions({
      principal: !allOpen,
      marcaEstilo: !allOpen,
      cenario: !allOpen,
      textoImagem: !allOpen,
      ajustes: !allOpen,
      configuracoes: !allOpen
    });
  };

  const handleAddTextBlock = () => {
    setTextBlocks(prev => [...prev, { id: Date.now(), type: 'h2', content: '', weight: 3 }]);
  };

  const handleRemoveTextBlock = (id) => {
    setTextBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleConstruirClick = () => {
    if (onConstruir) {
      onConstruir({
        categoria,
        uploadedPhotos,
        quantidade,
        subjectDescription,
        subjectPosition,
        plano,
        ambientColor,
        complementaryLight,
        complementaryColor,
        estiloVisual,
        styleRefDescription,
        sobriedadeCriatividade,
        nichoProjeto,
        sceneDescription,
        sceneRefDescription,
        textBlocks,
        degradeTexto,
        posicaoTexto,
        elementosFlutuantes,
        usarBlur,
        promptAdicional,
        dimensions,
        quality
      });
    }
  };

  return (
    <aside 
      style={{
        width: '410px',
        minWidth: '360px',
        height: '100vh',
        backgroundColor: '#0C0D11',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        color: '#E4E4E7',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 1. TOPO FIXO: EXPANDIR / RECOLHER TUDO */}
      <div 
        style={{
          padding: '14px 18px 10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#71717A', textTransform: 'uppercase' }}>
          Direção Criativa do Órion Pro
        </span>
        <button
          type="button"
          onClick={handleToggleAll}
          style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          {Object.values(openAccordions).every(Boolean) ? 'Recolher Tudo' : 'Expandir Tudo'}
        </button>
      </div>

      {/* 2. ÁREA ROLÁVEL COM OS CAMPOS (APENAS ESTA PARTE ROLA COM O MOUSE) */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* ============================================================== */}
        {/* 1. PRINCIPAL                                                  */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('principal')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.principal ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <ImageIcon size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Principal</span>
            </div>
            {openAccordions.principal ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.principal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Categoria */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Categoria <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'Pessoa', Icon: UserRound },
                    { id: 'Produto', Icon: Box },
                    { id: 'Livre', Icon: Sparkles }
                  ].map((cat) => {
                    const active = categoria === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoria(cat.id)}
                        style={{
                          height: '76px',
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: active ? '#261742' : '#12141A',
                          border: active ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: active ? '0 0 18px rgba(168, 85, 247, 0.3)' : 'none',
                          color: active ? '#FFFFFF' : '#A1A1AA'
                        }}
                      >
                        <cat.Icon size={20} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{cat.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fotos do Sujeito / Produto */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Fotos do Sujeito / Produto
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label 
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#A1A1AA'
                    }}
                  >
                    <input type="file" accept="image/*" style={{ display: 'none' }} />
                    <Plus size={22} />
                  </label>
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: '12px',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#1A152B',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#E9D5FF',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Sliders size={14} />
                  <span>Ajustar fotos e cena</span>
                </button>
                <p style={{ fontSize: '11px', color: '#EAB308', marginTop: '8px', fontWeight: 500 }}>
                  Para máxima fidelidade, use uma única foto
                </p>
              </div>

              {/* Quantidade */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Quantidade
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {['1', '2', '3', '4', '5'].map((num) => {
                    const active = quantidade === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantidade(num)}
                        style={{
                          height: '42px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: active ? '#261742' : '#12141A',
                          border: active ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: active ? '0 0 14px rgba(168, 85, 247, 0.25)' : 'none',
                          color: active ? '#FFFFFF' : '#A1A1AA'
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Como o sujeito deve aparecer? */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Como o sujeito deve aparecer?
                </label>
                <div style={{ backgroundColor: '#10121A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '10px' }}>
                  <textarea
                    rows={3}
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="Descreva roupas, pose, acessorios, acao..."
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#E4E4E7',
                      resize: 'none',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
              </div>

              {/* Posição do Sujeito */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Posição do Sujeito
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'left', label: 'Esquerda', Icon: AlignLeft },
                    { id: 'center', label: 'Centro', Icon: AlignCenter },
                    { id: 'right', label: 'Direita', Icon: AlignRight }
                  ].map((pos) => {
                    const active = subjectPosition === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setSubjectPosition(pos.id)}
                        style={{
                          height: '62px',
                          borderRadius: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          backgroundColor: active ? '#261742' : '#12141A',
                          border: active ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: active ? '0 0 14px rgba(168, 85, 247, 0.25)' : 'none',
                          color: active ? '#FFFFFF' : '#A1A1AA'
                        }}
                      >
                        <pos.Icon size={18} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plano (Grade 2x2 com 4 Opções) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>
                  Plano
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'close-up', label: 'Close-up (Rosto)', Icon: UserRound },
                    { id: 'medium', label: 'Plano Médio (Busto)', Icon: UserRound },
                    { id: 'american', label: 'Plano Americano', Icon: ImageIcon },
                    { id: 'full_body', label: 'Corpo Inteiro', Icon: UserRound }
                  ].map((p) => {
                    const active = plano === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlano(p.id)}
                        style={{
                          height: '62px',
                          borderRadius: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          backgroundColor: active ? '#261742' : '#12141A',
                          border: active ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: active ? '0 0 14px rgba(168, 85, 247, 0.25)' : 'none',
                          color: active ? '#FFFFFF' : '#A1A1AA'
                        }}
                      >
                        <p.Icon size={18} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. ACCORDION: MARCA E ESTILO                                   */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('marcaEstilo')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.marcaEstilo ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <Palette size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Marca e estilo</span>
            </div>
            {openAccordions.marcaEstilo ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.marcaEstilo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>Paleta de Cores</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ backgroundColor: '#12141A', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <input type="color" value={ambientColor} onChange={(e) => setAmbientColor(e.target.value)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} />
                    <span style={{ fontSize: '10px', color: '#A1A1AA', textAlign: 'center' }}>Cor Ambiente</span>
                  </div>
                  <div style={{ backgroundColor: '#12141A', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <input type="color" value={complementaryLight} onChange={(e) => setComplementaryLight(e.target.value)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} />
                    <span style={{ fontSize: '10px', color: '#A1A1AA', textAlign: 'center' }}>Luz Complem.</span>
                  </div>
                  <div style={{ backgroundColor: '#12141A', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <input type="color" value={complementaryColor} onChange={(e) => setComplementaryColor(e.target.value)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} />
                    <span style={{ fontSize: '10px', color: '#A1A1AA', textAlign: 'center' }}>Cor Destaque</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>Estilo Visual</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {ESTILOS_VISUAIS.map((est) => (
                    <button
                      key={est.value}
                      type="button"
                      onClick={() => setEstiloVisual(est.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        backgroundColor: estiloVisual === est.value ? '#261742' : '#12141A',
                        border: estiloVisual === est.value ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: estiloVisual === est.value ? '#FFFFFF' : '#A1A1AA'
                      }}
                    >
                      <est.Icon size={16} color="#C084FC" />
                      <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{est.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#D4D4D8' }}>Estilo da Imagem</label>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#C084FC' }}>{sobriedadeCriatividade}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sobriedadeCriatividade}
                  onChange={(e) => setSobriedadeCriatividade(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71717A', marginTop: '4px' }}>
                  <span>Criativo</span>
                  <span>Sóbrio</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. ACCORDION: CENÁRIO                                         */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('cenario')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.cenario ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <Mountain size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Cenário</span>
            </div>
            {openAccordions.cenario ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.cenario && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '6px' }}>Nicho/Projeto</label>
                <input
                  type="text"
                  value={nichoProjeto}
                  onChange={(e) => setNichoProjeto(e.target.value)}
                  placeholder="ex: Campanha Verão 2026"
                  style={{ width: '100%', backgroundColor: '#10121A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#FFFFFF', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '6px' }}>Cenário / Contexto</label>
                <textarea
                  rows={3}
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  placeholder="Descreva o ambiente, cenário..."
                  style={{ width: '100%', backgroundColor: '#10121A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px', fontSize: '12px', color: '#E4E4E7', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. ACCORDION: TEXTO NA IMAGEM [EXPERIMENTAL]                  */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('textoImagem')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.textoImagem ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <Type size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Texto na imagem</span>
                <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#D8B4FE', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  EXPERIMENTAL
                </span>
              </div>
            </div>
            {openAccordions.textoImagem ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.textoImagem && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {textBlocks.map((block, idx) => (
                <div key={block.id} style={{ backgroundColor: '#12141A', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <select
                      value={block.type}
                      onChange={(e) => {
                        const updated = [...textBlocks];
                        updated[idx].type = e.target.value;
                        setTextBlocks(updated);
                      }}
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#D8B4FE', fontSize: '11px', padding: '4px 8px' }}
                    >
                      <option value="h1">Título (H1)</option>
                      <option value="h2">Subtítulo (H2)</option>
                      <option value="text">Texto</option>
                      <option value="bullets">Lista (Bullets)</option>
                      <option value="cta">Botão (CTA)</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveTextBlock(block.id)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => {
                      const updated = [...textBlocks];
                      updated[idx].content = e.target.value;
                      setTextBlocks(updated);
                    }}
                    placeholder="Digite o texto..."
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '12px', outline: 'none', paddingBottom: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#A1A1AA' }}>
                    <span>Peso Visual: {block.weight === 1 ? 'Sutil' : block.weight === 5 ? 'Dominante' : 'Normal'}</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={block.weight}
                      onChange={(e) => {
                        const updated = [...textBlocks];
                        updated[idx].weight = Number(e.target.value);
                        setTextBlocks(updated);
                      }}
                      style={{ width: '90px', accentColor: '#A855F7' }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTextBlock}
                style={{ width: '100%', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#D8B4FE', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} />
                <span>+ Adicionar texto</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 5. ACCORDION: AJUSTES                                         */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('ajustes')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.ajustes ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <Settings size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Ajustes</span>
            </div>
            {openAccordions.ajustes ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.ajustes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '6px' }}>Elementos Flutuantes</label>
                <input
                  type="text"
                  value={elementosFlutuantes}
                  onChange={(e) => setElementosFlutuantes(e.target.value)}
                  placeholder="Ex: Notas de dólar, moedas... (vazio = IA decide)"
                  style={{ width: '100%', backgroundColor: '#10121A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#FFFFFF', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '6px' }}>Prompt Adicional</label>
                <textarea
                  rows={3}
                  value={promptAdicional}
                  onChange={(e) => setPromptAdicional(e.target.value)}
                  placeholder="Adicione detalhes extras ao prompt..."
                  style={{ width: '100%', backgroundColor: '#10121A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px', fontSize: '12px', color: '#E4E4E7', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 6. ACCORDION: CONFIGURAÇÕES (DIMENSÕES E QUALIDADE)            */}
        {/* ============================================================== */}
        <div style={{ backgroundColor: '#0F1017', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '16px' }}>
          <div
            onClick={() => toggleAccordion('configuracoes')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: openAccordions.configuracoes ? '16px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4E4E7' }}>
                <SlidersHorizontal size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2D9FF' }}>Configurações</span>
            </div>
            {openAccordions.configuracoes ? <ChevronUp size={18} color="#A1A1AA" /> : <ChevronDown size={18} color="#A1A1AA" />}
          </div>

          {openAccordions.configuracoes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>Dimensões</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: '16:9', label: '16:9', sub: 'Banner' },
                    { id: '4:5', label: '4:5', sub: 'Feed' },
                    { id: '1:1', label: '1:1', sub: 'Square' },
                    { id: '9:16', label: '9:16', sub: 'Story' }
                  ].map((dim) => (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => setDimensions(dim.id)}
                      style={{
                        height: '46px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: dimensions === dim.id ? '#261742' : '#12141A',
                        border: dimensions === dim.id ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: dimensions === dim.id ? '#FFFFFF' : '#A1A1AA'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{dim.label}</span>
                      <span style={{ fontSize: '9px', color: '#71717A' }}>{dim.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4D4D8', marginBottom: '8px' }}>Qualidade</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { id: '1K', label: '1K', sub: 'Rápido' },
                    { id: '2K', label: '2K', sub: 'Equilibrado' },
                    { id: '4K', label: '4K', sub: 'Ultra' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      style={{
                        height: '46px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: quality === q.id ? '#261742' : '#12141A',
                        border: quality === q.id ? '2px solid rgba(168, 85, 247, 0.85)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: quality === q.id ? '#FFFFFF' : '#A1A1AA'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{q.label}</span>
                      <span style={{ fontSize: '9px', color: '#71717A' }}>{q.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. RODAPÉ FIXO: BOTÃO CONSTRUIR (1 CRÉDITO) + DUPLICAR/RESETAR */}
      {/* ============================================================== */}
      <div 
        style={{
          flexShrink: 0,
          padding: '16px 18px',
          backgroundColor: '#0C0D11',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.7)',
          zIndex: 30
        }}
      >
        <button
          type="button"
          onClick={handleConstruirClick}
          disabled={isGenerating}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: '#EAB308', // Cor exata amarela ouro do original
            border: 'none',
            color: '#000000',           // Texto preto puro em negrito
            fontSize: '15px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1,
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.25)',
            transition: 'transform 0.1s, background-color 0.2s'
          }}
        >
          <div style={{ width: '20px' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGenerating ? 'Construindo...' : 'Construir'}
          </span>
          <span 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#000000',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            1 crédito
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '12px', fontSize: '12px', color: '#A1A1AA' }}>
          <button type="button" style={{ background: 'none', border: 'none', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Copy size={14} />
            <span>Duplicar</span>
          </button>
          <span>·</span>
          <button type="button" style={{ background: 'none', border: 'none', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <RotateCcw size={14} />
            <span>Resetar</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
