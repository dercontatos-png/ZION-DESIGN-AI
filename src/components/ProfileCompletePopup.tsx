import React, { useState, useEffect } from "react";
import { X, User, Phone, ChevronDown, CheckCircle2 } from "lucide-react";

interface ProfileCompletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; occupation: string }) => void;
  onOpenProfile: () => void;
}

const OCCUPATION_OPTIONS = [
  "Designer Gráfico",
  "Fotógrafo",
  "Social Media",
  "Agência",
  "Empresário",
  "Arquiteto",
  "Autônomo",
  "Outro",
];

export const ProfileCompletePopup: React.FC<ProfileCompletePopupProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenProfile,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setOccupation("");
      setErrorMsg("");
      setSavedMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Preencha seu nome para salvar.");
      return;
    }
    onSave({ name: name.trim(), phone: phone.trim(), occupation: occupation.trim() });
    setSavedMsg("Cadastro salvo com sucesso!");
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[100000] w-screen h-screen bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#181329] via-[#131022] to-[#0b0c15] border border-white/10 rounded-2xl shadow-2xl relative p-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Complete seu cadastro
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Falta pouco pra deixar seu perfil completo. Leva menos de um minuto.
          </p>
        </div>

        {/* Error & Success Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}
        {savedMsg && (
          <div className="mt-4 p-3 bg-[#c5a880]/15 border border-[#c5a880]/40 rounded-xl text-[#c5a880] text-xs text-center font-medium animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-medium text-zinc-200 mb-1.5">
              Nome
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-200 mb-1.5">
              Telefone <span className="text-zinc-500">(com DDD)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(88) 99999-9999"
                className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-200 mb-1.5">
              Ocupação
            </label>
            <div className="relative">
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={`w-full bg-black border border-white/10 rounded-lg py-3 pl-4 pr-10 text-sm appearance-none focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all cursor-pointer ${
                  occupation ? "text-white" : "text-zinc-600"
                }`}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {OCCUPATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="text-white bg-black">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Actions Row: Skip Link + Salvar Button */}
        <div className="flex items-center justify-between gap-4 mt-7">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Deixar pra depois
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-[#c5a880] via-[#d2b68c] to-[#b08e58] hover:from-[#d2b68c] hover:to-[#be9b62] text-white font-extrabold text-sm rounded-full shadow-lg shadow-[#c5a880]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Salvar
          </button>
        </div>

        {/* Profile Link */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full mt-5 text-center text-xs text-zinc-300 hover:text-[#c5a880] transition-colors cursor-pointer font-medium"
        >
          Prefiro preencher no Perfil completo
        </button>

      </div>
    </div>
  );
};
