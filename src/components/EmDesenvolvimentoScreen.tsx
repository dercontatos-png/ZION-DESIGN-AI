import React from "react";
import NaoAssinanteScreen from "./NaoAssinanteScreen";

interface EmDesenvolvimentoScreenProps {
  currentUser: { email: string; role: "admin" | "client" } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onRecheck?: () => void;
  onOpenPlanModal?: () => void;
  subscriberInfo?: {
    reason?: string;
    credits?: number;
    plan?: string;
  };
}

export const EmDesenvolvimentoScreen: React.FC<EmDesenvolvimentoScreenProps> = (props) => {
  return <NaoAssinanteScreen {...props} />;
};

export default EmDesenvolvimentoScreen;
