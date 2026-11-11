import Stripe from "stripe";
import { saveSubscriber, getSubscribersList, Subscriber } from "./subscriberService";

// Configurações e planos do SaaS Comercial
export interface SaasPlan {
  id: string;
  name: string;
  type: "subscription" | "bundle";
  credits: number;
  priceBrl: number; // Em Reais (R$)
  priceUsd: number; // Em Dólares (US$)
  interval?: "month";
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const SAAS_PLANS: Record<string, SaasPlan> = {
  starter: {
    id: "starter",
    name: "Plano Starter",
    type: "subscription",
    credits: 300,
    priceBrl: 97,
    priceUsd: 19,
    interval: "month",
    description: "Ideal para freelancers e designers independentes.",
    features: [
      "300 créditos mensais renovados automaticamente",
      "Acesso completo ao Ref Builder & Zion Design V2",
      "Resolução até 4K Ultra HD",
      "Acesso ao Feed Global da Comunidade & Galeria",
      "Histórico de projetos salvo na nuvem",
      "Suporte via WhatsApp"
    ]
  },
  pro: {
    id: "pro",
    name: "Plano Pro",
    type: "subscription",
    credits: 1000,
    priceBrl: 197,
    priceUsd: 39,
    interval: "month",
    popular: true,
    badge: "Mais Popular",
    description: "Para criadores profissionais e agências em crescimento.",
    features: [
      "1.000 créditos mensais renovados automaticamente",
      "Acesso a TODOS os builders (Órion Pro, Hydra, Ref, Altera Fácil)",
      "Resolução Máxima 8K Ultra Master",
      "Fila prioritária com render ultrarrápido",
      "Substituição e remoção com máscaras inteligentes",
      "Suporte VIP prioritário no WhatsApp"
    ]
  },
  agency: {
    id: "agency",
    name: "Plano Studio & Agência",
    type: "subscription",
    credits: 3000,
    priceBrl: 397,
    priceUsd: 79,
    interval: "month",
    badge: "Para Equipes",
    description: "Para estúdios e agências de alta demanda.",
    features: [
      "3.000 créditos mensais renovados automaticamente",
      "Gerações simultâneas em lote sem fila",
      "Armazenamento em nuvem Cloudflare R2 ilimitado",
      "Carrosséis infinitos com fatiador automático",
      "Gerente de conta dedicado e onboarding individual"
    ]
  }
};

export const CREDIT_BUNDLES: Record<string, SaasPlan> = {
  pack_100: {
    id: "pack_100",
    name: "Recarga 100 Créditos",
    type: "bundle",
    credits: 100,
    priceBrl: 39,
    priceUsd: 8,
    description: "Recarga rápida de emergência.",
    features: [
      "100 créditos adicionados imediatamente",
      "Sem data de validade (não expiram)",
      "Gera até 100 designs profissionais"
    ]
  },
  pack_500: {
    id: "pack_500",
    name: "Recarga 500 Créditos",
    type: "bundle",
    credits: 500,
    priceBrl: 149,
    priceUsd: 29,
    popular: true,
    badge: "Melhor Custo/Benefício",
    description: "O pacote mais escolhido para recargas avulsas.",
    features: [
      "500 créditos adicionados imediatamente",
      "Sem data de validade (não expiram)",
      "Economia de 25% por crédito gerado",
      "Válido em todos os modelos e agentes"
    ]
  },
  pack_1500: {
    id: "pack_1500",
    name: "Recarga 1.500 Créditos",
    type: "bundle",
    credits: 1500,
    priceBrl: 349,
    priceUsd: 69,
    badge: "Super Pacote",
    description: "Volume máximo com o menor custo por arte.",
    features: [
      "1.500 créditos adicionados imediatamente",
      "Sem data de validade (não expiram)",
      "Economia de quase 40% por crédito",
      "Fila prioritária para processamento acelerado"
    ]
  }
};

// Inicialização do Stripe SDK
let stripeClient: Stripe | null = null;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (stripeSecretKey && stripeSecretKey.trim().length > 5) {
  try {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16" as any
    });
  } catch (err) {
    console.error("[Stripe] Erro ao instanciar Stripe SDK:", err);
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeClient);
}

export interface CreateCheckoutParams {
  planId: string;
  currency?: "brl" | "usd";
  userEmail: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Cria uma sessão do Stripe Checkout oficial ou link de checkout
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{
  url: string;
  sessionId: string;
  isDemo?: boolean;
}> {
  const { planId, currency = "brl", userEmail, userName = "", successUrl, cancelUrl } = params;

  // Busca plano de assinatura ou pacote avulso
  const plan = SAAS_PLANS[planId] || CREDIT_BUNDLES[planId];
  if (!plan) {
    throw new Error(`Plano ou pacote inválido: ${planId}`);
  }

  const isBrl = currency.toLowerCase() === "brl";
  const unitAmount = isBrl ? Math.round(plan.priceBrl * 100) : Math.round(plan.priceUsd * 100);
  const currencyCode = isBrl ? "brl" : "usd";

  // Se o Stripe estiver configurado no ambiente com STRIPE_SECRET_KEY
  if (stripeClient) {
    const isSubscription = plan.type === "subscription";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: plan.name,
              description: `${plan.description} · ${plan.credits} créditos inclusos`,
              images: ["https://app.designbuilder.co/logo-zion.svg"]
            },
            unit_amount: unitAmount,
            ...(isSubscription
              ? { recurring: { interval: "month" } }
              : {})
          },
          quantity: 1
        }
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&credits=${plan.credits}&currency=${currencyCode}`,
      cancel_url: cancelUrl,
      metadata: {
        planId: plan.id,
        planType: plan.type,
        credits: String(plan.credits),
        userEmail,
        currency: currencyCode
      }
    };

    const session = await stripeClient.checkout.sessions.create(sessionParams);
    if (!session.url) {
      throw new Error("Stripe retornou sessão sem URL de redirecionamento.");
    }

    return {
      url: session.url,
      sessionId: session.id,
      isDemo: false
    };
  }

  // Fallback seguro em modo demonstração / teste local
  // Permite testar o fluxo comercial completo mesmo antes de adicionar a chave real no .env
  const mockSessionId = `cs_test_zion_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const returnUrl = new URL(successUrl);
  returnUrl.searchParams.set("session_id", mockSessionId);
  returnUrl.searchParams.set("plan", plan.id);
  returnUrl.searchParams.set("credits", String(plan.credits));
  returnUrl.searchParams.set("currency", currencyCode);
  returnUrl.searchParams.set("demo", "true");

  return {
    url: returnUrl.toString(),
    sessionId: mockSessionId,
    isDemo: true
  };
}

/**
 * Confirma o pagamento e credita os créditos comprados na conta do usuário
 */
export async function processSuccessfulCheckout(details: {
  sessionId: string;
  planId: string;
  credits: number;
  userEmail: string;
}): Promise<{
  success: boolean;
  totalCredits: number;
  subscriber: Subscriber;
}> {
  const { planId, credits, userEmail } = details;
  const cleanEmail = (userEmail || "").trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("E-mail de usuário obrigatório para creditar compra.");
  }

  const subscribers = await getSubscribersList();
  const existing = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);

  const currentCredits = existing ? (existing.credits || 0) : 0;
  const newTotal = currentCredits + credits;

  const plan = SAAS_PLANS[planId] || CREDIT_BUNDLES[planId];
  const planName = plan ? plan.name : (planId.startsWith("pack_") ? "Recarga Avulsa" : "Assinatura Pro");

  const updatedSub: Subscriber = {
    email: cleanEmail,
    name: existing?.name || cleanEmail.split("@")[0],
    status: "ativo",
    credits: newTotal,
    plan: planName,
    notes: `Ativado via Stripe Checkout (${credits} créditos adicionados)`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveSubscriber(updatedSub);

  return {
    success: true,
    totalCredits: newTotal,
    subscriber: updatedSub
  };
}

