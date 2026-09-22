import makeWASocket, { useMultiFileAuthState, DisconnectReason, downloadContentFromMessage, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys";
import { supabase } from "./supabase";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import os from "os";
import pino from "pino";
import { Express } from "express";

// In-memory status store for each user session
interface WhatsAppSession {
  sock: any;
  status: "disconnected" | "connecting" | "qr" | "connected";
  qrCode: string; // Base64 Data URL
  phoneNumber: string;
  userInfo: string;
  error?: string;
}

const activeSessions = new Map<string, WhatsAppSession>();

// Track message IDs sent by our bot to prevent infinite self-chat response loops
const sentMessageIds = new Set<string>();

// Ensure sessions directory exists safely (using /tmp on serverless environments if needed)
let sessionsDir = path.join(process.cwd(), "whatsapp-sessions");
try {
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
} catch (e) {
  sessionsDir = path.join(os.tmpdir(), "whatsapp-sessions");
  try {
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
  } catch (_) {}
}

// Persistent Synced Workspace Data Manager (Multi-tenant isolated per userId with seamless fallback)
export function getSyncedWorkspaceData(userId: string = "admin_user") {
  const cleanId = (userId || "admin_user").replace(/[^a-zA-Z0-9_-]/g, "_");
  const userFilePath = path.join(sessionsDir, `synced_workspace_data_${cleanId}.json`);
  const legacyFilePath = path.join(sessionsDir, "synced_workspace_data.json");
  const adminFilePath = path.join(sessionsDir, "synced_workspace_data_admin_user.json");
  try {
    if (fs.existsSync(userFilePath)) {
      return JSON.parse(fs.readFileSync(userFilePath, "utf8"));
    } else if (fs.existsSync(adminFilePath)) {
      return JSON.parse(fs.readFileSync(adminFilePath, "utf8"));
    } else if (fs.existsSync(legacyFilePath)) {
      return JSON.parse(fs.readFileSync(legacyFilePath, "utf8"));
    }
  } catch (e) {}
  return { tasks: [], transactions: [], clients: [], calendarEvents: [], savedNotes: [], whatsappLogs: [] };
}

export function saveSyncedWorkspaceData(data: any, userId: string = "admin_user") {
  const cleanId = (userId || "admin_user").replace(/[^a-zA-Z0-9_-]/g, "_");
  const userFilePath = path.join(sessionsDir, `synced_workspace_data_${cleanId}.json`);
  const legacyFilePath = path.join(sessionsDir, "synced_workspace_data.json");
  const adminFilePath = path.join(sessionsDir, "synced_workspace_data_admin_user.json");
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), "utf8");
    fs.writeFileSync(legacyFilePath, JSON.stringify(data, null, 2), "utf8");
    fs.writeFileSync(adminFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error(`Error writing synced workspace data for ${userId}:`, e);
  }
}

// Robust message content extraction helper
function extractMessageDetails(message: any): { 
  text: string; 
  hasAudio: boolean; 
  hasImage: boolean; 
  hasDocument: boolean; 
  mediaMessage: any; 
  mediaType: "audio" | "image" | "document" | null; 
} {
  if (!message) {
    return { text: "", hasAudio: false, hasImage: false, hasDocument: false, mediaMessage: null, mediaType: null };
  }

  // Unwrap potential wrappers (disappearing/view-once messages)
  if (message.ephemeralMessage) {
    return extractMessageDetails(message.ephemeralMessage.message);
  }
  if (message.viewOnceMessage) {
    return extractMessageDetails(message.viewOnceMessage.message);
  }
  if (message.viewOnceMessageV2) {
    return extractMessageDetails(message.viewOnceMessageV2.message);
  }
  if (message.documentWithCaptionMessage) {
    return extractMessageDetails(message.documentWithCaptionMessage.message);
  }

  const text = message.conversation || 
               message.extendedTextMessage?.text || 
               message.imageMessage?.caption || 
               message.videoMessage?.caption || 
               message.documentMessage?.caption || 
               "";

  const hasAudio = !!message.audioMessage;
  const hasImage = !!message.imageMessage;
  const hasDocument = !!message.documentMessage;

  let mediaMessage = null;
  let mediaType: "audio" | "image" | "document" | null = null;
  
  if (hasAudio) {
    mediaMessage = message.audioMessage;
    mediaType = "audio";
  } else if (hasImage) {
    mediaMessage = message.imageMessage;
    mediaType = "image";
  } else if (hasDocument) {
    mediaMessage = message.documentMessage;
    mediaType = "document";
  }

  return { text, hasAudio, hasImage, hasDocument, mediaMessage, mediaType };
}

// Download media helper
const downloadMedia = async (mediaMessage: any, type: "audio" | "image" | "document") => {
  if (!mediaMessage) return null;
  try {
    const stream = await downloadContentFromMessage(mediaMessage, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (err) {
    console.error(`Error downloading media of type ${type}:`, err);
    return null;
  }
};

// Robust JID/Number cleaning helper
function cleanNumber(jid: string): string {
  if (!jid) return "";
  const parts = jid.split("@")[0].split(":");
  return parts[0].replace(/\D/g, "");
}

// Extends API Key logic to discard mock keys and prioritize active server keys
function getEffectiveApiKey(currentData: any, userApiKey?: string): string {
  const customApiKey = userApiKey || currentData?.myProfile?.geminiApiKey;
  const isMockKey =
    !customApiKey ||
    customApiKey.trim() === "" ||
    customApiKey === "AQ.Ab8RN6IS0MlE5LF__fAK8Lwm5c54K0gy3os089SUAvkRQ9vfBQ";

  if (!isMockKey && customApiKey) {
    return customApiKey;
  }
  return process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || "";
}



// Generate image helper for WhatsApp
async function generateDesignForWhatsApp(prompt: string, userApiKey?: string): Promise<Buffer | null> {
  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", high quality commercial advertisement, 8k, modern graphics")}?width=1024&height=1024&nologo=true`;

    const polRes = await fetch(pollinationsUrl);
    if (polRes.ok) {
      const arrBuf = await polRes.arrayBuffer();
      return Buffer.from(arrBuf);
    }
  } catch (err) {
    console.error("[WhatsApp AI Image Gen] Error generating image for WhatsApp:", err);
  }
  return null;
}

const promptText = `Você é o Diretor Criativo e Smart Agent Oficial da Zion AI Studio no WhatsApp.
Você é extremamente inteligente, carismático, prestativo e tem CONTROLE TOTAL sobre todo o ecossistema e funcionalidades do site Zion:
1. 🎨 DESIGN GRÁFICO, FLYERS, BANNERS E POSTS
2. 🎬 ROTEIROS DE VÍDEO VIRAL (Reels, TikTok, YouTube Shorts)
3. ✍️ COPYWRITING, LEGENDAS DE INSTAGRAM E TEXTOS DE ANÚNCIOS
4. 📋 GESTÃO DE TAREFAS (Criar, Concluir, Deletar, Limpar todas)
5. 🤝 CLIENTES & CRM (Cadastrar cliente, nicho, valor de contrato/plano, contatos)
6. 💰 GESTÃO FINANCEIRA (Adicionar despesas, receitas, ler comprovantes de Pix/TED/PDF, apagar lançamentos)
7. 📅 CALENDÁRIO & REUNIÕES (Agendar reunião, entrega de projeto, ensaio de fotos, prazos)
8. 📝 ANOTAÇÕES & BRIEFINGS (Salvar notas rápidas de ideias ou reuniões para clientes)
9. 📊 RESUMO EXECUTIVO / DASHBOARD (Consultar saldo, tarefas pendentes, clientes ativos e agenda)

Classifique o comando correspondente e retorne APENAS um objeto JSON válido:
{
  "command": "GENERATE_DESIGN" | "GENERATE_SCRIPT" | "GENERATE_COPY" | "ADD_TASK" | "UPDATE_TASK" | "COMPLETE_TASK" | "DELETE_TASK" | "CLEAR_ALL_TASKS" | "ADD_TRANSACTION" | "DELETE_TRANSACTION" | "CLEAR_ALL_TRANSACTIONS" | "ADD_CLIENT" | "UPDATE_CLIENT" | "DELETE_CLIENT" | "ADD_EVENT" | "DELETE_EVENT" | "ADD_NOTE" | "QUERY" | "UNKNOWN",
  
  "designData": {
    "theme": "Tema ou nicho do design (ex: Pizzaria, Advocacia, Odontologia, Moda, Academia, Hamburgueria)",
    "title": "Headline ou título principal da arte",
    "subtitle": "Subtítulo ou chamada de apoio",
    "client": "Nome do cliente se mencionado",
    "prompt": "Prompt visual ultra detalhado em inglês para o gerador de imagem descrevendo a composição, iluminação cinematográfica, estilo e elementos gráficos",
    "dimension": "1:1" | "9:16" | "16:9"
  },

  "scriptData": {
    "topic": "Tema do roteiro de vídeo",
    "hook": "Gancho magnético para os primeiros 3 segundos do vídeo",
    "scriptText": "Desenvolvimento completo do vídeo com indicações de cena e falas",
    "cta": "Chamada para ação final (CTA)"
  },

  "copyData": {
    "headline": "Título chamativo",
    "body": "Texto completo da legenda ou anúncio com emojis",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "cta": "Chamada para ação"
  },

  "taskData": {
    "targetTitle": "Nome ou palavra-chave da tarefa a alterar, mover, corrigir, apagar ou concluir",
    "title": "Título da tarefa (apenas se for renomear, senão mantenha o original)",
    "status": "todo" | "doing" | "done",
    "description": "Descrição detalhada",
    "client": "Cliente associado",
    "dueDate": "YYYY-MM-DD" (ou data calculada),
    "time": "HH:MM",
    "hasDeadline": boolean
  },

  "transactionData": {
    "description": "Descrição da transação financeira",
    "type": "receita" | "despesa",
    "amount": número,
    "category": "Categoria (Marketing, Software, Alimentação, Recebimento, Contrato, etc.)",
    "status": "pago" | "pendente",
    "targetDescription": "Descrição, valor, nome do cliente ou palavra-chave da transação a apagar (ex: 'Barbearia VIP', '2500', 'valor')"
  },

  "clientData": {
    "oldName": "Nome anterior/errado do cliente se for UPDATE_CLIENT (para substituir)",
    "name": "Nome novo ou correto da empresa / cliente",
    "niche": "Nicho / Área de atuação (ex: Gastronomia, Estética, Odontologia, Advocacia, Marketing)",
    "contact": "Telefone, WhatsApp ou email de contato (ex: '(11) 99999-9999')",
    "avatarUrl": "URL ou indicação de foto de perfil",
    "paymentType": "Mensal" | "Projeto" | "Sob Demanda",
    "plan": "Nome do plano ou contrato (ex: 'Plano Black', 'Social Media VIP')",
    "planDetails": "Detalhes das entregas do plano",
    "planValue": número do valor mensal / contrato em R$ (ex: 829, 1500),
    "dueDate": "YYYY-MM-DD" ou dia do vencimento (ex: '2026-01-10' ou '10'),
    "startDate": "YYYY-MM-DD" (data de início / contrato, ex: '2026-01-01'),
    "paymentStatus": "Em dia" | "Pendente" | "Atrasado",
    "status": "Ativo" | "Inativo" | "Prospecção",
    "notes": "Observações internas, senhas, orientações ou contatos de emergência",
    "paletaCores": ["#hex1", "#hex2"],
    "bancoDeDadosIA": "Instruções específicas para geração de criativos da marca"
  },

  "eventData": {
    "title": "Título do evento ou reunião",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "client": "Cliente associado",
    "description": "Detalhes do evento",
    "targetTitle": "Título do evento a apagar"
  },

  "noteData": {
    "title": "Título da anotação",
    "content": "Conteúdo da anotação ou briefing",
    "client": "Cliente associado",
    "targetTitle": "Título da nota a apagar"
  },

  "queryTarget": "tasks" | "transactions" | "clients" | "calendar" | "all" | null,

  "replyText": "Sua resposta carismática e profissional em português para enviar no WhatsApp com formatação elegante (negritos e emojis)!"
}

Regras:
1. Se o usuário pedir para criar, gerar arte, flyer, banner, post: "command": "GENERATE_DESIGN".
2. Se o usuário pedir para criar roteiro de vídeo, ideias de Reels/TikTok: "command": "GENERATE_SCRIPT".
3. Se o usuário pedir para criar copy, legenda de Instagram, texto para post/anúncio: "command": "GENERATE_COPY".
4. Se o usuário pedir para adicionar ou agendar tarefa: "command": "ADD_TASK".
5. Se o usuário pedir para MOVER, ALTERAR STATUS, COLOCAR EM PRODUÇÃO ou MUDAR O ANDAMENTO de uma tarefa (ex: "muda para em produção", "coloca em execução", "muda de concluído para em produção", "marca como a fazer", "volta para a fila", "conclui a tarefa"):
   - OBRIGATORIAMENTE defina "command": "UPDATE_TASK".
   - No campo "taskData.status":
     * Se for "em produção", "em execução", "em andamento", "fazendo", "produzindo": defina "status": "doing"
     * Se for "concluído", "finalizado", "feito", "aprovado": defina "status": "done"
     * Se for "a fazer", "na fila", "pendente", "todo", "backlog": defina "status": "todo"
   - No campo "taskData.targetTitle", coloque o nome da tarefa a ser alterada. NÃO mude o título da tarefa para o texto 'em produção'!;
6. Se o usuário pedir para CORRIGIR ou RENOMEAR o título de uma tarefa: "command": "UPDATE_TASK" (informando targetTitle e o novo title).
7. Se o usuário pedir para APAGAR TODAS as tarefas, limpar tarefas: "command": "CLEAR_ALL_TASKS".
8. Se o usuário pedir para APAGAR ou REMOVER uma tarefa específica: "command": "DELETE_TASK", informando targetTitle.
9. Se o usuário pedir para CONCLUIR ou FINALIZAR uma tarefa: "command": "COMPLETE_TASK", informando targetTitle.
10. Se o usuário enviar comprovante Pix/PDF ou registrar receita/despesa: "command": "ADD_TRANSACTION".
11. Se o usuário pedir para apagar uma transação: "command": "DELETE_TRANSACTION".
12. Se o usuário pedir para cadastrar um novo cliente: "command": "ADD_CLIENT".
13. Se o usuário pedir para CORRIGIR, RENOMEAR, EDITAR ou ALTERAR o nome de um cliente, OU enviar apenas a correção de texto/caixa alta/maiúsculas (ex: "Assim, SISPUMUMC", "Deixa em maiúsculas", "O nome é X", "Em caixa alta", "Escreve Y", "corrige o cliente"):
    - OBRIGATORIAMENTE defina "command": "UPDATE_CLIENT".
    - Em "clientData.name", coloque o nome EXATAMENTE como o usuário digitou (respeitando maiúsculas/minúsculas e acentos).
    - NUNCA classifique como UNKNOWN quando o usuário estiver especificando como escrever o nome!
14. Se o usuário pedir para apagar um cliente: "command": "DELETE_CLIENT".
14. Se o usuário pedir para agendar reunião, compromisso, ensaio ou evento no calendário: "command": "ADD_EVENT".
15. Se o usuário pedir para desmarcar ou apagar um evento do calendário: "command": "DELETE_EVENT".
16. Se o usuário pedir para salvar uma anotação, ideia ou briefing: "command": "ADD_NOTE".
17. Se o usuário pedir resumo, consultar saldo, tarefas, clientes ou agenda: "command": "QUERY".
18. Se for cumprimento ou conversa informal: "command": "UNKNOWN".`;

// DeepSeek V4 Fast Inference Helper with Full Conversational Memory & Multimodal Support
async function callDeepSeekV4ForWhatsApp(
  systemPrompt: string, 
  userMessage: any, 
  history: { role: string; content: any }[] = [], 
  customApiKey?: string
): Promise<any | null> {
  const apiKey = customApiKey && customApiKey.startsWith('sk-') 
    ? customApiKey 
    : (process.env.BAI_API_KEY || process.env.DEEPSEEK_API_KEY || "sk-1xk8jkfyehzbjzi784mvuc8icvyl5hne");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage }
    ];

    const res = await fetch("https://api.b.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages,
        temperature: 0.35,
        response_format: { type: "json_object" }
      })
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || "";
      let clean = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed && (parsed.command || parsed.replyText)) {
        console.log("[WhatsApp AI] ⚡ Processed successfully using DeepSeek V4 with Memory!");
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn("[WhatsApp AI] DeepSeek V4 request failed, falling back to Gemini:", err?.message || err);
  }
  return null;
}

// Multimodal AI Decision Engine for WhatsApp with Conversational Memory
export async function processWhatsAppMessageWithAI(
  userId: string,
  messageContent: { text?: string; audio?: Buffer; image?: Buffer; document?: Buffer; mimeType?: string },
  currentData: any,
  userApiKey?: string
): Promise<any> {
  const apiKey = getEffectiveApiKey(currentData, userApiKey);
  const ai = new GoogleGenAI({ apiKey });

  const syncData = getSyncedWorkspaceData();
  const logs = (syncData.whatsappLogs || currentData.whatsappLogs || []);
  const conversationHistory: { role: string; content: string }[] = [];
  
  // Extract up to 8 past conversation turns for rich memory
  for (const log of logs.slice(0, 8).reverse()) {
    if (log.message && typeof log.message === "string") {
      conversationHistory.push({ role: "user", content: log.message });
    }
    if (log.reply && typeof log.reply === "string") {
      conversationHistory.push({ role: "assistant", content: log.reply });
    }
  }

  const now = new Date();
  const formattedCurrentDate = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  const formattedCurrentTime = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  const todayISODate = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const temporalContext = `\n\n[DATA E HORÁRIO ATUAL DO SISTEMA]:
- Data de Hoje: ${formattedCurrentDate} (${todayISODate})
- Horário Atual: ${formattedCurrentTime}
- Amanhã é: ${tomorrow}
- REGRAS MANDATÓRIAS PARA AGENDAMENTOS E LEMBRETES:
  * Sempre que o usuário pedir para marcar gravação, reunião, call, compromisso ou lembrete (ex: "marcar uma gravação daqui a 1 minuto", "marcar reunião amanhã 15h", "me lembre em 10 minutos"), retorne SEMPRE command: "ADD_EVENT" ou "ADD_TASK"!
  * Se o usuário disser "daqui a 1 minuto", "daqui a X minutos" ou "daqui a 1 hora", CALCULE o horário exato somando os minutos ao Horário Atual (${formattedCurrentTime}) e use date "${todayISODate}"!
  * Se o usuário disser "amanhã", preencha date ou dueDate com "${tomorrow}".
  * Se o usuário disser um horário (ex: "15h", "15:00", "às 10 da manhã"), preencha o campo "time" com o formato "HH:MM" (ex: "15:00").
  * Se o usuário citar o nome de um cliente no áudio ou texto, preencha o campo "client" com o nome do cliente!
  * REGRA DE MENSALIDADES E FATURAS EM ATRASO:
    - Se o usuário falar sobre faturas ou meses atrasados separados (ex: "foi uma do mês 10/08 e outra do mês 10/07/2026", "2 meses atrasados"), NUNCA junte tudo em uma única transação de valor somado!
    - Retorne command: "ADD_TRANSACTION" com o array "items" contendo CADA MÊS COMO UM ITEM INDIVIDUAL (ex: R$ 829 no vencimento 2026-07-10 e R$ 829 no vencimento 2026-08-10 com status 'pendente' e client 'SISPUMUMC').
  * NUNCA retorne command: "UNKNOWN" quando o usuário pedir para marcar, agendar, lançar ou lembrar de algo!`;

  const workspaceContext = `\n\n[CONTEXTO ATUAL DO STUDIO ZION]:
- Clientes Atuais: ${JSON.stringify((syncData.clients || currentData.clients || []).map((c: any) => ({ name: c.name, niche: c.niche, plan: c.planValue })))}
- Tarefas Atuais: ${JSON.stringify((syncData.tasks || currentData.tasks || []).map((t: any) => ({ title: t.title, status: t.status, due: t.dueDate })))}
- Eventos no Calendário: ${JSON.stringify((syncData.calendarEvents || currentData.calendarEvents || []).map((e: any) => ({ title: e.title, date: e.date, time: e.time })))}
- Anotações Recentes: ${JSON.stringify((syncData.savedNotes || currentData.savedNotes || []).map((n: any) => ({ title: n.title, content: n.content })))}`;

  const completeSystemPrompt = promptText + temporalContext + workspaceContext;

  // 1. Text-Only Requests: Fast DeepSeek V4 with Full History & Context
  if (!messageContent.audio && !messageContent.image && !messageContent.document && messageContent.text) {
    const deepSeekResult = await callDeepSeekV4ForWhatsApp(
      completeSystemPrompt,
      messageContent.text,
      conversationHistory,
      userApiKey
    );
    if (deepSeekResult) {
      return deepSeekResult;
    }
  }

  // 2. Image Requests: Try Multimodal Vision first
  if (messageContent.image) {
    try {
      const base64Img = messageContent.image.toString("base64");
      const mime = messageContent.mimeType || "image/jpeg";
      const multimodalUserContent = [
        { type: "text", text: messageContent.text || "Analise esta imagem em detalhes e execute a solicitação (criar legenda, copy, post ou ler comprovante)." },
        { type: "image_url", image_url: { url: `data:${mime};base64,${base64Img}` } }
      ];
      
      const deepSeekVisionResult = await callDeepSeekV4ForWhatsApp(
        completeSystemPrompt,
        multimodalUserContent,
        conversationHistory,
        userApiKey
      );
      if (deepSeekVisionResult) {
        return deepSeekVisionResult;
      }
    } catch (visErr) {
      console.warn("[WhatsApp AI] Multimodal vision fallback to Gemini:", visErr);
    }
  }

  const parts: any[] = [];

  if (messageContent.audio) {
    parts.push({
      inlineData: {
        data: messageContent.audio.toString("base64"),
        mimeType: messageContent.mimeType || "audio/ogg"
      }
    });
    parts.push({ text: "Transcreva e analise este áudio de voz em português do Brasil com atenção aos nomes de clientes, tarefas, datas e horários mencionados." });
  }

  if (messageContent.image) {
    parts.push({
      inlineData: {
        data: messageContent.image.toString("base64"),
        mimeType: messageContent.mimeType || "image/jpeg"
      }
    });
    parts.push({ text: "Analise esta imagem/comprovante e extraia todos os dados (valores, tema visual, informações financeiras)." });
  }

  if (messageContent.document) {
    parts.push({
      inlineData: {
        data: messageContent.document.toString("base64"),
        mimeType: messageContent.mimeType || "application/pdf"
      }
    });
    parts.push({ text: "Analise este documento e extraia todas as informações financeiras e dados relevantes." });
  }

  parts.push({ text: completeSystemPrompt });
  if (messageContent.text) {
    parts.push({ text: `Mensagem do Usuário:\n"${messageContent.text}"` });
  }

  const modelsToTry = [
    "gemini-3.5-flash-lite", 
    "gemini-3.5-flash", 
    "gemini-3.1-pro-preview", 
    "gemini-3.6-flash"
  ];
  let responseText = "";
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
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

      if (response?.text) {
        responseText = response.text;
        break;
      }
    } catch (err: any) {
      console.warn(`[WhatsApp AI] Model ${modelName} failed, attempting next model:`, err?.message || err);
      lastError = err;
    }
  }

  if (!responseText && lastError) {
    throw lastError;
  }

  let jsonStr = responseText || "{}";
  jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(jsonStr);
}

// Initialize WhatsApp connection for a specific user
export async function connectWhatsApp(userId: string) {
  if (!userId) return;

  const existing = activeSessions.get(userId);
  if (existing && (existing.status === "connected" || existing.status === "connecting")) {
    return;
  }

  console.log(`[WhatsApp] Starting WhatsApp session for user ${userId}...`);

  const userSessionPath = path.join(sessionsDir, userId);
  
  activeSessions.set(userId, {
    sock: null,
    status: "connecting",
    qrCode: "",
    phoneNumber: "",
    userInfo: ""
  });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1043857760] }));

    const sock = makeWASocket({
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: Browsers.ubuntu("Chrome"),
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    const sessionObj = activeSessions.get(userId)!;
    sessionObj.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
          sessionObj.status = "qr";
          sessionObj.qrCode = qrDataUrl;
          console.log(`[WhatsApp] 🎉 QR Code generated successfully for user: ${userId}`);
        } catch (err) {
          console.error("[WhatsApp] Error generating QR code data URL:", err);
        }
      }

      if (connection === "open") {
        sessionObj.status = "connected";
        sessionObj.qrCode = "";
        sessionObj.phoneNumber = sock.user?.id ? sock.user.id.split(":")[0] : "";
        sessionObj.userInfo = sock.user?.name || "WhatsApp User";
        console.log(`[WhatsApp] 🟢 Connected successfully for user ${userId}: ${sessionObj.phoneNumber}`);
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const wasConnected = sessionObj.status === "connected";
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        
        console.log(`[WhatsApp] Connection closed for user ${userId}. StatusCode: ${statusCode}, wasConnected: ${wasConnected}, isLoggedOut: ${isLoggedOut}`);

        if (wasConnected && !isLoggedOut) {
          sessionObj.status = "connecting";
          setTimeout(() => connectWhatsApp(userId), 5000);
        } else {
          sessionObj.status = "disconnected";
          sessionObj.qrCode = "";
          sessionObj.phoneNumber = "";
          sessionObj.userInfo = "";
          activeSessions.delete(userId);
          if (isLoggedOut) {
            try {
              fs.rmSync(userSessionPath, { recursive: true, force: true });
            } catch (e) {}
          }
        }
      }
    });

    // Message receiver event
    sock.ev.on("messages.upsert", async (m) => {
      if (m.type !== "notify") return;
      
      for (const msg of m.messages) {
        if (!msg.message) continue;

        const msgId = msg.key.id || "";
        const senderJid = msg.key.remoteJid || "";
        const fromMe = !!msg.key.fromMe;
        const botId = sock.user?.id || state.creds.me?.id || "";
        const botLid = (sock.user as any)?.lid || (state.creds.me as any)?.lid || "";
        const botNumber = cleanNumber(botId);
        const botLidNumber = cleanNumber(botLid);
        const senderNumber = cleanNumber(senderJid);

        console.log(`[WhatsApp] 📩 Message received: fromMe=${fromMe}, senderJid=${senderJid}, botNumber=${botNumber}, botLid=${botLidNumber}, senderNumber=${senderNumber}, msgId=${msgId}`);

        if (msgId && sentMessageIds.has(msgId)) {
          console.log(`[WhatsApp] Skipping message ${msgId} (sent by bot response)`);
          continue;
        }

        if (senderJid.includes("@broadcast") || senderJid.includes("@newsletter")) {
          continue;
        }

        // Detect if this is self-chat (user messaging own account via Phone number or LID)
        const isSelfChat = 
          senderJid.endsWith("@lid") ||
          (senderNumber !== "" && botNumber !== "" && (senderNumber === botNumber || senderJid.includes(botNumber))) ||
          (botLidNumber !== "" && (senderNumber === botLidNumber || senderJid.includes(botLidNumber)));

        // If sent by me to someone else's individual number, do not intercept
        if (fromMe && !isSelfChat && !senderJid.endsWith("@lid")) {
          console.log(`[WhatsApp] Ignoring outgoing chat with external contact: ${senderJid}`);
          continue;
        }

        console.log(`[WhatsApp] 🚀 Processing incoming message from ${senderNumber || senderJid}`);

        const { text, hasAudio, hasImage, hasDocument, mediaMessage, mediaType } = extractMessageDetails(msg.message);
        if (!text && !hasAudio && !hasImage && !hasDocument) continue;

        let currentData: any = {};
        try {
          const { data, error } = await supabase.from('users').select('data').eq('id', userId).maybeSingle();
          if (error) throw error;
          if (data && data.data) {
            currentData = data.data;
          } else {
            currentData = { userId, clients: [], tasks: [], transactions: [], calendarEvents: [], notifications: [] };
          }
        } catch (err) {
          console.error("[WhatsApp] Error reading user doc from Supabase:", err);
          currentData = { userId, clients: [], tasks: [], transactions: [], calendarEvents: [], notifications: [] };
        }

        const messagePayload: { text?: string; audio?: Buffer; image?: Buffer; document?: Buffer; mimeType?: string } = {};
        if (text) messagePayload.text = text;

        try {
          if (hasAudio && mediaMessage) {
            console.log("[WhatsApp] 🎙️ Downloading voice audio note...");
            const audioBuffer = await downloadMedia(mediaMessage, "audio");
            if (audioBuffer) {
              messagePayload.audio = audioBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "audio/ogg";
            }
          } else if (hasImage && mediaMessage) {
            console.log("[WhatsApp] 📸 Downloading attached image reference...");
            const imageBuffer = await downloadMedia(mediaMessage, "image");
            if (imageBuffer) {
              messagePayload.image = imageBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "image/jpeg";
            }
          } else if (hasDocument && mediaMessage) {
            console.log("[WhatsApp] 📄 Downloading document attachment...");
            const docBuffer = await downloadMedia(mediaMessage, "document");
            if (docBuffer) {
              messagePayload.document = docBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "application/pdf";
            }
          }

          console.log("[WhatsApp] 🧠 Analyzing intent with Gemini AI...");
          const userApiKey = currentData.myProfile?.geminiApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
          const aiResult = await processWhatsAppMessageWithAI(userId, messagePayload, currentData, userApiKey);

          let updated = false;

          // 1. GENERATE DESIGN
          if (aiResult.command === "GENERATE_DESIGN") {
            const initialReply = await sock.sendMessage(senderJid, { 
              text: `🎨 *Diretor Criativo Zion*: Recebi sua solicitação de arte!\n📌 *Tema:* ${aiResult.designData?.theme || "Design"}\n⏳ _Sintetizando imagem em ultra-definição agora..._` 
            });
            if (initialReply?.key?.id) sentMessageIds.add(initialReply.key.id);

            const promptToGen = aiResult.designData?.prompt || `${aiResult.designData?.theme || ""} ${aiResult.designData?.title || ""}`;
            const generatedBuffer = await generateDesignForWhatsApp(promptToGen, userApiKey);

            if (generatedBuffer) {
              const fileName = `wa_${Date.now()}.png`;
              const filePath = path.join(process.cwd(), "public", "generated-images", fileName);
              fs.writeFileSync(filePath, generatedBuffer);

              const artReply = await sock.sendMessage(senderJid, {
                image: generatedBuffer,
                caption: `✨ *Arte Finalizada com Sucesso!*\n\n📌 *Tema:* ${aiResult.designData?.theme || "Design"}\n🎯 *Headline:* ${aiResult.designData?.title || ""}\n\n_Visualização disponível também no seu painel web._`
              });
              if (artReply?.key?.id) sentMessageIds.add(artReply.key.id);
            } else {
              const failReply = await sock.sendMessage(senderJid, {
                text: `⚠️ *Diretor Criativo*: Não foi possível renderizar a imagem no momento. ${aiResult.replyText}`
              });
              if (failReply?.key?.id) sentMessageIds.add(failReply.key.id);
            }
            updated = true;
          } 
          // 2. GENERATE VIDEO SCRIPT
          else if (aiResult.command === "GENERATE_SCRIPT") {
            const scriptMsg = `🎬 *Roteiro de Vídeo Gerado - Zion AI*\n\n📌 *Tema:* ${aiResult.scriptData?.topic || "Vídeo"}\n\n🎣 *Gancho (Hook - Primeiros 3s):*\n${aiResult.scriptData?.hook || ""}\n\n📝 *Desenvolvimento & Cenas:*\n${aiResult.scriptData?.scriptText || ""}\n\n🚀 *Chamada para Ação (CTA):*\n${aiResult.scriptData?.cta || ""}`;
            const scriptReply = await sock.sendMessage(senderJid, { text: scriptMsg });
            if (scriptReply?.key?.id) sentMessageIds.add(scriptReply.key.id);
            updated = true;
          }
          // 3. GENERATE COPY / INSTAGRAM CAPTION
          else if (aiResult.command === "GENERATE_COPY") {
            const copyMsg = `✍️ *Copy & Legenda de Alta Conversão - Zion AI*\n\n📌 *Headline:* ${aiResult.copyData?.headline || "Destaque"}\n\n📝 *Texto do Post / Anúncio:*\n${aiResult.copyData?.body || ""}\n\n🏷️ *Hashtags:* ${(aiResult.copyData?.hashtags || []).join(" ")}\n\n🚀 *CTA:* ${aiResult.copyData?.cta || ""}`;
            const copyReply = await sock.sendMessage(senderJid, { text: copyMsg });
            if (copyReply?.key?.id) sentMessageIds.add(copyReply.key.id);
            updated = true;
          }
          // 4. TASK, FINANCE, CLIENT, CALENDAR, NOTES, DASHBOARD
          else {
            if (aiResult.command === "ADD_TASK") {
              const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
              const timeStr = aiResult.taskData?.time || "";
              let titleStr = aiResult.taskData?.title || "Nova Tarefa";
              if (timeStr && !titleStr.includes(timeStr)) {
                titleStr = `${titleStr} (${timeStr})`;
              }

              const newTask = {
                id: Date.now(),
                title: titleStr,
                description: aiResult.taskData?.description || "",
                status: "todo",
                client: aiResult.taskData?.client || "Geral",
                hasDeadline: true,
                dueDate: aiResult.taskData?.dueDate || tomorrow
              };
              const syncData = getSyncedWorkspaceData();
              syncData.tasks = syncData.tasks || [];
              syncData.tasks.unshift(newTask);
              syncData.lastAction = { type: "ADD_TASK", task: newTask, timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData);
              console.log(`[WhatsApp AI] 📋 Task added:`, newTask.title, "| Client:", newTask.client, "| Due:", newTask.dueDate);
              updated = true;
            } else if (aiResult.command === "UPDATE_TASK") {
              const syncData = getSyncedWorkspaceData();
              const oldTarget = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
              const newTitle = aiResult.taskData?.title;
              const newStatus = aiResult.taskData?.status;
              let targetTask: any = null;
              if (syncData.tasks && syncData.tasks.length > 0) {
                syncData.tasks = syncData.tasks.map((t: any, index: number) => {
                  const matchesOld = oldTarget && ((t.title || "").toLowerCase().includes(oldTarget) || (t.description || "").toLowerCase().includes(oldTarget));
                  const isLatest = (!oldTarget || oldTarget === (t.title || "").toLowerCase().trim()) || index === 0;
                  if (matchesOld || isLatest) {
                    targetTask = {
                      ...t,
                      title: (newTitle && !newTitle.toLowerCase().includes("produção") && !newTitle.toLowerCase().includes("concluído") && !newTitle.toLowerCase().includes("a fazer") && newTitle !== oldTarget) ? newTitle : t.title,
                      status: newStatus || t.status || "todo",
                      client: aiResult.taskData?.client || t.client,
                      dueDate: aiResult.taskData?.dueDate || t.dueDate,
                      description: aiResult.taskData?.description || t.description
                    };
                    return targetTask;
                  }
                  return t;
                });
                syncData.lastAction = { 
                  type: "UPDATE_TASK", 
                  target: oldTarget, 
                  title: targetTask?.title, 
                  status: targetTask?.status,
                  task: targetTask || syncData.tasks[0],
                  timestamp: Date.now() 
                };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] ✏️ Task updated: '${targetTask?.title}' -> status: ${targetTask?.status}`);
              }
              updated = true;
            } else if (aiResult.command === "CLEAR_ALL_TASKS") {
              const syncData = getSyncedWorkspaceData(userId);
              syncData.tasks = [];
              syncData.lastAction = { type: "CLEAR_ALL_TASKS", timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData, userId);
              console.log(`[WhatsApp AI] 🗑️ All tasks cleared permanently!`);
              updated = true;
            } else if (aiResult.command === "DELETE_TASK") {
              const syncData = getSyncedWorkspaceData(userId);
              const target = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
              if (target && syncData.tasks) {
                const initialCount = syncData.tasks.length;
                syncData.tasks = syncData.tasks.filter((t: any) => 
                  !((t.title || "").toLowerCase().includes(target) || (t.description || "").toLowerCase().includes(target))
                );
                syncData.lastAction = { type: "DELETE_TASK", target, timestamp: Date.now() };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] 🗑️ Task '${target}' deleted (${initialCount} -> ${syncData.tasks.length})`);
              }
              updated = true;
            } else if (aiResult.command === "COMPLETE_TASK") {
              const syncData = getSyncedWorkspaceData(userId);
              const target = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
              if (target && syncData.tasks) {
                syncData.tasks = syncData.tasks.map((t: any) => {
                  if ((t.title || "").toLowerCase().includes(target)) {
                    return { ...t, status: "done" };
                  }
                  return t;
                });
                syncData.lastAction = { type: "COMPLETE_TASK", target, timestamp: Date.now() };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] ✅ Task '${target}' marked done!`);
              }
              updated = true;
            } else if (aiResult.command === "ADD_TRANSACTION") {
              const syncData = getSyncedWorkspaceData(userId);
              syncData.transactions = syncData.transactions || [];

              // If multiple individual items were provided
              if (Array.isArray(aiResult.transactionData?.items) && aiResult.transactionData.items.length > 0) {
                // Remove old lumped transaction for this client if any
                const clientName = aiResult.transactionData.items[0]?.client || aiResult.transactionData.client || "";
                if (clientName) {
                  syncData.transactions = syncData.transactions.filter((t: any) => 
                    !((t.client || "").toLowerCase().includes(clientName.toLowerCase()) && (t.description || "").includes("1658"))
                  );
                }

                for (let i = 0; i < aiResult.transactionData.items.length; i++) {
                  const item = aiResult.transactionData.items[i];
                  const newTx = {
                    id: Date.now() + i,
                    description: item.description || "Mensalidade em Atraso",
                    type: item.type || "receita",
                    amount: Number(item.amount) || 829,
                    date: item.date || new Date().toISOString().split("T")[0],
                    category: item.category || "Contratos",
                    status: item.status || "pendente",
                    client: item.client || clientName || "SISPUMUMC"
                  };
                  syncData.transactions.unshift(newTx);
                  console.log(`[WhatsApp AI] 💰 Multi-item Transaction added:`, newTx.description, "| Amount: R$", newTx.amount);
                }
                syncData.lastAction = { type: "ADD_TRANSACTION", timestamp: Date.now() };
              } else {
                const targetClient = aiResult.transactionData?.client || aiResult.clientData?.name || "Geral";
                const newTransaction = {
                  id: Date.now(),
                  description: aiResult.transactionData?.description || "Lançamento via WhatsApp",
                  type: aiResult.transactionData?.type || "receita",
                  amount: Number(aiResult.transactionData?.amount) || 0,
                  date: aiResult.transactionData?.date || new Date().toISOString().split("T")[0],
                  category: aiResult.transactionData?.category || "Contratos",
                  status: aiResult.transactionData?.status || "pendente",
                  client: targetClient
                };
                syncData.transactions.unshift(newTransaction);
                syncData.lastAction = { type: "ADD_TRANSACTION", transaction: newTransaction, timestamp: Date.now() };
                console.log(`[WhatsApp AI] 💰 Transaction added:`, newTransaction.description, "| Amount: R$", newTransaction.amount);
              }
              saveSyncedWorkspaceData(syncData, userId);
              updated = true;
            } else if (aiResult.command === "CLEAR_ALL_TRANSACTIONS") {
              const syncData = getSyncedWorkspaceData(userId);
              syncData.transactions = [];
              syncData.lastAction = { type: "CLEAR_ALL_TRANSACTIONS", timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData, userId);
              console.log(`[WhatsApp AI] 🗑️ All transactions cleared!`);
              updated = true;
            } else if (aiResult.command === "DELETE_TRANSACTION") {
              const syncData = getSyncedWorkspaceData(userId);
              const target = (aiResult.transactionData?.targetDescription || aiResult.transactionData?.description || "").toLowerCase().trim();
              if (syncData.transactions && syncData.transactions.length > 0) {
                if (!target || target === "todas" || target === "tudo" || target === "valor" || target === "transação" || target === "financeiro") {
                  syncData.transactions = [];
                  syncData.lastAction = { type: "CLEAR_ALL_TRANSACTIONS", timestamp: Date.now() };
                } else {
                  syncData.transactions = syncData.transactions.filter((t: any) => 
                    !(t.description || "").toLowerCase().includes(target) &&
                    !String(t.amount || "").includes(target)
                  );
                  syncData.lastAction = { type: "DELETE_TRANSACTION", target, timestamp: Date.now() };
                }
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] 🗑️ Transaction deleted! Target: '${target}'`);
              }
              updated = true;
            } else if (aiResult.command === "ADD_CLIENT") {
              const newClient = {
                id: Date.now(),
                name: aiResult.clientData?.name || "Novo Cliente",
                niche: aiResult.clientData?.niche || "Outros",
                status: aiResult.clientData?.status || "Ativo",
                contact: aiResult.clientData?.contact || "",
                avatarUrl: aiResult.clientData?.avatarUrl || "",
                paymentType: aiResult.clientData?.paymentType || "Mensal",
                plan: aiResult.clientData?.plan || "",
                planDetails: aiResult.clientData?.planDetails || "",
                planValue: aiResult.clientData?.planValue !== undefined && aiResult.clientData?.planValue !== null && aiResult.clientData?.planValue !== "" ? Number(aiResult.clientData.planValue) : 0,
                dueDate: aiResult.clientData?.dueDate || new Date().toISOString().split("T")[0],
                startDate: aiResult.clientData?.startDate || new Date().toISOString().split("T")[0],
                paymentStatus: aiResult.clientData?.paymentStatus || "Pendente",
                notes: aiResult.clientData?.notes || "",
                paletaCores: aiResult.clientData?.paletaCores || [],
                bancoDeDadosIA: aiResult.clientData?.bancoDeDadosIA || ""
              };
              const syncData = getSyncedWorkspaceData(userId);
              syncData.clients = syncData.clients || [];
              syncData.clients.unshift(newClient);

              // If client is created with a debt or pending transaction
              let extractedDebt = (aiResult.transactionData?.amount && Number(aiResult.transactionData.amount) > 0)
                ? Number(aiResult.transactionData.amount)
                : 0;

              if (!extractedDebt && newClient.notes) {
                const match = newClient.notes.match(/R\$\s*([\d,.]+)|débito de\s*([\d,.]+)|devendo\s*([\d,.]+)/i);
                if (match) {
                  const num = parseFloat((match[1] || match[2] || match[3] || "").replace(",", "."));
                  if (!isNaN(num) && num > 0) extractedDebt = num;
                }
              }

              if (extractedDebt > 0 || (aiResult.transactionData?.amount && Number(aiResult.transactionData.amount) > 0)) {
                const finalAmount = extractedDebt || Number(aiResult.transactionData?.amount);
                syncData.transactions = syncData.transactions || [];
                const desc = aiResult.transactionData?.description || 
                  (newClient.paymentType === "Projeto Avulso" || newClient.paymentType === "Projeto" 
                    ? `Serviço Avulso Pendente - ${newClient.name}`
                    : `Mensalidade Pendente - ${newClient.name}`);
                    
                syncData.transactions.unshift({
                  id: Date.now() + 1,
                  description: desc,
                  type: "receita",
                  amount: finalAmount,
                  date: newClient.dueDate || new Date().toISOString().split("T")[0],
                  category: newClient.paymentType === "Projeto Avulso" ? "Serviços Avulsos" : "Contratos",
                  status: "pendente",
                  client: newClient.name
                });
                console.log(`[WhatsApp AI] 💰 Created pending transaction for client ${newClient.name}: R$ ${finalAmount}`);
              }

              syncData.lastAction = { type: "ADD_CLIENT", client: newClient, timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData, userId);
              console.log(`[WhatsApp AI] 🤝 Client added:`, newClient.name, "| Plan: R$", newClient.planValue);
              updated = true;
            } else if (aiResult.command === "UPDATE_CLIENT") {
              const syncData = getSyncedWorkspaceData(userId);
              const oldTarget = (aiResult.clientData?.oldName || aiResult.clientData?.name || "").toLowerCase().trim();
              const newName = aiResult.clientData?.name;
              let targetClient: any = null;
              if (syncData.clients && syncData.clients.length > 0) {
                syncData.clients = syncData.clients.map((c: any, index: number) => {
                  const matchesOld = oldTarget && (c.name || "").toLowerCase().includes(oldTarget);
                  const isLatest = (!oldTarget || oldTarget === (c.name || "").toLowerCase().trim()) || index === 0;
                  if (matchesOld || isLatest) {
                    targetClient = {
                      ...c,
                      name: newName || c.name,
                      niche: aiResult.clientData?.niche || c.niche,
                      status: aiResult.clientData?.status || c.status,
                      contact: aiResult.clientData?.contact || c.contact,
                      avatarUrl: aiResult.clientData?.avatarUrl || c.avatarUrl,
                      paymentType: aiResult.clientData?.paymentType || c.paymentType,
                      plan: aiResult.clientData?.plan || c.plan,
                      planDetails: aiResult.clientData?.planDetails || c.planDetails,
                      planValue: aiResult.clientData?.planValue !== undefined && aiResult.clientData?.planValue !== null && aiResult.clientData?.planValue !== "" ? Number(aiResult.clientData.planValue) : c.planValue,
                      dueDate: aiResult.clientData?.dueDate || c.dueDate,
                      startDate: aiResult.clientData?.startDate || c.startDate,
                      paymentStatus: aiResult.clientData?.paymentStatus || c.paymentStatus,
                      notes: aiResult.clientData?.notes ? (c.notes ? `${c.notes}\n${aiResult.clientData.notes}` : aiResult.clientData.notes) : c.notes,
                      paletaCores: aiResult.clientData?.paletaCores || c.paletaCores,
                      bancoDeDadosIA: aiResult.clientData?.bancoDeDadosIA || c.bancoDeDadosIA
                    };
                    return targetClient;
                  }
                  return c;
                });
                // If the update marked client as Atrasado or mentions overdue months, generate the pending invoices in Financeiro!
                if (
                  (targetClient?.paymentStatus === "Atrasado" || (aiResult.clientData?.notes && /atraso|atrasad/i.test(aiResult.clientData.notes))) &&
                  targetClient?.planValue > 0
                ) {
                  syncData.transactions = syncData.transactions || [];
                  const clientName = targetClient.name;
                  const numMonths = (aiResult.clientData?.notes && /dois|2/i.test(aiResult.clientData.notes)) ? 2 : 1;
                  
                  for (let m = 1; m <= numMonths; m++) {
                    const desc = numMonths > 1 
                      ? `Mensalidade em Atraso (Mês ${m}/${numMonths}) - ${clientName}`
                      : `Mensalidade em Atraso - ${clientName}`;
                      
                    const exists = syncData.transactions.some((tx: any) => 
                      (tx.description || "").toLowerCase() === desc.toLowerCase()
                    );
                    
                    if (!exists) {
                      syncData.transactions.unshift({
                        id: Date.now() + m,
                        description: desc,
                        type: "receita",
                        amount: targetClient.planValue,
                        date: new Date().toISOString().split("T")[0],
                        category: "Contratos",
                        status: "pendente",
                        client: clientName
                      });
                    }
                  }
                }

                syncData.lastAction = { 
                  type: "UPDATE_CLIENT", 
                  oldName: oldTarget, 
                  name: newName, 
                  client: targetClient || syncData.clients[0], 
                  planValue: targetClient?.planValue,
                  dueDate: targetClient?.dueDate,
                  startDate: targetClient?.startDate,
                  timestamp: Date.now() 
                };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] ✏️ Client updated: '${targetClient?.name}' | Plan: R$ ${targetClient?.planValue} | Due: ${targetClient?.dueDate} | Start: ${targetClient?.startDate}`);
              }
              updated = true;
            } else if (aiResult.command === "DELETE_CLIENT") {
              const syncData = getSyncedWorkspaceData(userId);
              const target = (aiResult.clientData?.name || "").toLowerCase().trim();
              if (target && syncData.clients) {
                syncData.clients = syncData.clients.filter((c: any) => 
                  !(c.name || "").toLowerCase().includes(target)
                );
                syncData.lastAction = { type: "DELETE_CLIENT", target, timestamp: Date.now() };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] 🗑️ Client '${target}' deleted!`);
              }
              updated = true;
            } else if (aiResult.command === "ADD_EVENT") {
              const newEvent = {
                id: Date.now(),
                title: aiResult.eventData?.title || "Reunião / Evento",
                date: aiResult.eventData?.date || new Date().toISOString().split("T")[0],
                time: aiResult.eventData?.time || "10:00",
                client: aiResult.eventData?.client || "Geral",
                description: aiResult.eventData?.description || ""
              };
              const syncData = getSyncedWorkspaceData(userId);
              syncData.calendarEvents = syncData.calendarEvents || [];
              syncData.calendarEvents.unshift(newEvent);
              syncData.lastAction = { type: "ADD_EVENT", event: newEvent, timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData, userId);
              console.log(`[WhatsApp AI] 📅 Calendar Event added:`, newEvent.title, "| Date:", newEvent.date, "| Time:", newEvent.time);
              updated = true;
            } else if (aiResult.command === "DELETE_EVENT") {
              const syncData = getSyncedWorkspaceData(userId);
              const target = (aiResult.eventData?.targetTitle || aiResult.eventData?.title || "").toLowerCase().trim();
              if (target && syncData.calendarEvents) {
                syncData.calendarEvents = syncData.calendarEvents.filter((e: any) => 
                  !(e.title || "").toLowerCase().includes(target)
                );
                syncData.lastAction = { type: "DELETE_EVENT", target, timestamp: Date.now() };
                saveSyncedWorkspaceData(syncData, userId);
                console.log(`[WhatsApp AI] 🗑️ Calendar Event '${target}' deleted!`);
              }
              updated = true;
            } else if (aiResult.command === "ADD_NOTE") {
              const newNote = {
                id: Date.now(),
                title: aiResult.noteData?.title || "Nota Rápida",
                content: aiResult.noteData?.content || "",
                client: aiResult.noteData?.client || "Geral",
                createdAt: new Date().toISOString()
              };
              const syncData = getSyncedWorkspaceData(userId);
              syncData.savedNotes = syncData.savedNotes || [];
              syncData.savedNotes.unshift(newNote);
              syncData.lastAction = { type: "ADD_NOTE", note: newNote, timestamp: Date.now() };
              saveSyncedWorkspaceData(syncData, userId);
              console.log(`[WhatsApp AI] 📝 Note saved:`, newNote.title);
              updated = true;
            }

            const replyMsg = await sock.sendMessage(senderJid, { text: aiResult.replyText });
            if (replyMsg?.key?.id) sentMessageIds.add(replyMsg.key.id);
          }

          // Save history
          const syncData = getSyncedWorkspaceData(userId);
          syncData.whatsappLogs = syncData.whatsappLogs || [];
          syncData.whatsappLogs.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            sender: senderNumber,
            message: text || (hasAudio ? "🎤 Áudio de Voz" : hasImage ? "📸 Imagem Anexada" : "📄 Documento"),
            reply: aiResult.replyText,
            command: aiResult.command
          });
          if (syncData.whatsappLogs.length > 50) syncData.whatsappLogs = syncData.whatsappLogs.slice(0, 50);
          saveSyncedWorkspaceData(syncData, userId);

        } catch (procErr) {
          console.error("[WhatsApp] Error processing message payload:", procErr);
          const errReply = await sock.sendMessage(senderJid, { 
            text: "Desculpe, tive uma oscilação temporária ao processar sua mensagem. Por favor, tente novamente em instantes!" 
          });
          if (errReply?.key?.id) sentMessageIds.add(errReply.key.id);
        }
      }
    });

  } catch (err: any) {
    console.error(`[WhatsApp] Failed to initialize socket for user ${userId}:`, err);
    activeSessions.set(userId, {
      sock: null,
      status: "disconnected",
      qrCode: "",
      phoneNumber: "",
      userInfo: "",
      error: err.message
    });
  }
}

// Disconnect WhatsApp session cleanly
export async function disconnectWhatsApp(userId: string) {
  const session = activeSessions.get(userId);
  if (session && session.sock) {
    try {
      await session.sock.logout();
    } catch (e) {}
    try {
      session.sock.end();
    } catch (e) {}
  }
  activeSessions.delete(userId);

  const userSessionPath = path.join(sessionsDir, userId);
  if (fs.existsSync(userSessionPath)) {
    try {
      fs.rmSync(userSessionPath, { recursive: true, force: true });
      console.log(`[WhatsApp] Session files cleared for ${userId}`);
    } catch (e) {}
  }
}

// REST Endpoints for Express
export function initWhatsAppEndpoints(app: Express) {
  // Get WhatsApp status and QR Code
  app.get("/api/whatsapp/status", async (req, res) => {
    const userId = (req.query.userId as string) || "admin_user";

    // 1. Check direct session for this userId
    let session = activeSessions.get(userId);
    
    // 2. If not found or disconnected, check admin_user or any active connected session
    if (!session || session.status === "disconnected") {
      const adminSession = activeSessions.get("admin_user");
      if (adminSession && (adminSession.status === "connected" || adminSession.status === "connecting" || adminSession.status === "qr")) {
        session = adminSession;
      } else {
        // Find any active session
        for (const [_, sObj] of activeSessions.entries()) {
          if (sObj.status === "connected" || sObj.status === "connecting" || sObj.status === "qr") {
            session = sObj;
            break;
          }
        }
      }
    }

    const userSessionPath = path.join(sessionsDir, userId);
    const adminSessionPath = path.join(sessionsDir, "admin_user");
    
    // Auto-connect on status check if credentials exist
    if (!session || session.status === "disconnected") {
      const pathToTry = (fs.existsSync(userSessionPath) && fs.readdirSync(userSessionPath).length > 0)
        ? userSessionPath
        : (fs.existsSync(adminSessionPath) && fs.readdirSync(adminSessionPath).length > 0)
        ? adminSessionPath
        : null;

      if (pathToTry) {
        const idToConnect = pathToTry === userSessionPath ? userId : "admin_user";
        console.log(`[WhatsApp] Auto-reconnecting session for ${idToConnect}`);
        connectWhatsApp(idToConnect);
        await new Promise(r => setTimeout(r, 1200));
        session = activeSessions.get(idToConnect);
      }
    }

    if (!session) {
      return res.json({ status: "disconnected", qrCode: "", phoneNumber: "", userInfo: "" });
    }

    res.json({
      status: session.status,
      qrCode: session.qrCode,
      phoneNumber: session.phoneNumber,
      userInfo: session.userInfo,
      error: session.error
    });
  });

  // Connect WhatsApp session manually
  app.post("/api/whatsapp/connect", async (req, res) => {
    const userId = req.body.userId || "admin_user";
    try {
      await connectWhatsApp(userId);
      res.json({ success: true, message: "WhatsApp connection worker started." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Disconnect WhatsApp session manually
  app.post("/api/whatsapp/disconnect", async (req, res) => {
    const userId = req.body.userId || "admin_user";
    try {
      await disconnectWhatsApp(userId);
      if (userId !== "admin_user") {
        await disconnectWhatsApp("admin_user").catch(() => {});
      }
      res.json({ success: true, message: "WhatsApp disconnected and session removed." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulator route - tests voice/text/design directly from frontend without second phone
  app.post("/api/whatsapp/simulate", async (req, res) => {
    const { userId = "admin_user", text, isAudio, isDesign, isScript } = req.body;
    try {
      let userData: any = {};
      try {
        const { data } = await supabase.from('users').select('data').eq('id', userId).maybeSingle();
        if (data?.data) userData = data.data;
      } catch (_) {}

      const messagePayload: { text?: string; audio?: Buffer; image?: Buffer; mimeType?: string } = {};

      if (isAudio) {
        messagePayload.text = text || "Crie um flyer de promoção de pizza para o cliente Bella Itália";
      } else if (isDesign) {
        messagePayload.text = text || "Gere um flyer moderno de hamburgueria artesanal com o título Festival do Burger";
      } else if (isScript) {
        messagePayload.text = text || "Crie um roteiro de Reels magnético sobre como atrair clientes para estúdio de design";
      } else {
        messagePayload.text = text;
      }

      const userApiKey = userData.myProfile?.geminiApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
      const aiResult = await processWhatsAppMessageWithAI(userId, messagePayload, userData, userApiKey);

      let generatedImageUrl = "";
      if (aiResult.command === "GENERATE_DESIGN") {
        const promptToGen = aiResult.designData?.prompt || `${aiResult.designData?.theme || ""} ${aiResult.designData?.title || ""}`;
        const buf = await generateDesignForWhatsApp(promptToGen, userApiKey);
        if (buf) {
          const fileName = `wa_sim_${Date.now()}.png`;
          const filePath = path.join(process.cwd(), "public", "generated-images", fileName);
          fs.writeFileSync(filePath, buf);
          generatedImageUrl = `/generated-images/${fileName}`;
        }
      }

      if (aiResult.command === "ADD_TASK" && aiResult.taskData) {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const timeStr = aiResult.taskData.time || "";
        let titleStr = aiResult.taskData.title || "Nova Tarefa";
        if (timeStr && !titleStr.includes(timeStr)) {
          titleStr = `${titleStr} (${timeStr})`;
        }

        const newTask = {
          id: Date.now(),
          title: titleStr,
          description: aiResult.taskData.description || "",
          status: "todo",
          client: aiResult.taskData.client || "Geral",
          hasDeadline: true,
          dueDate: aiResult.taskData.dueDate || tomorrow
        };
        const syncData = getSyncedWorkspaceData(userId);
        syncData.tasks = syncData.tasks || [];
        syncData.tasks.unshift(newTask);
        syncData.lastAction = { type: "ADD_TASK", task: newTask, timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "UPDATE_TASK") {
        const syncData = getSyncedWorkspaceData(userId);
        const oldTarget = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
        const newTitle = aiResult.taskData?.title;
        const newStatus = aiResult.taskData?.status;
        let targetTask: any = null;
        if (syncData.tasks && syncData.tasks.length > 0) {
          syncData.tasks = syncData.tasks.map((t: any, index: number) => {
            const matchesOld = oldTarget && ((t.title || "").toLowerCase().includes(oldTarget) || (t.description || "").toLowerCase().includes(oldTarget));
            const isLatest = (!oldTarget || oldTarget === (t.title || "").toLowerCase().trim()) || index === 0;
            if (matchesOld || isLatest) {
              targetTask = {
                ...t,
                title: (newTitle && !newTitle.toLowerCase().includes("produção") && !newTitle.toLowerCase().includes("concluído") && !newTitle.toLowerCase().includes("a fazer") && newTitle !== oldTarget) ? newTitle : t.title,
                status: newStatus || t.status || "todo",
                client: aiResult.taskData?.client || t.client,
                dueDate: aiResult.taskData?.dueDate || t.dueDate,
                description: aiResult.taskData?.description || t.description
              };
              return targetTask;
            }
            return t;
          });
          syncData.lastAction = { 
            type: "UPDATE_TASK", 
            target: oldTarget, 
            title: targetTask?.title, 
            status: targetTask?.status,
            task: targetTask || syncData.tasks[0],
            timestamp: Date.now() 
          };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "CLEAR_ALL_TASKS") {
        const syncData = getSyncedWorkspaceData(userId);
        syncData.tasks = [];
        syncData.lastAction = { type: "CLEAR_ALL_TASKS", timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "DELETE_TASK") {
        const syncData = getSyncedWorkspaceData(userId);
        const target = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
        if (target && syncData.tasks) {
          syncData.tasks = syncData.tasks.filter((t: any) => 
            !((t.title || "").toLowerCase().includes(target) || (t.description || "").toLowerCase().includes(target))
          );
          syncData.lastAction = { type: "DELETE_TASK", target, timestamp: Date.now() };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "COMPLETE_TASK") {
        const syncData = getSyncedWorkspaceData(userId);
        const target = (aiResult.taskData?.targetTitle || aiResult.taskData?.title || "").toLowerCase().trim();
        if (target && syncData.tasks) {
          syncData.tasks = syncData.tasks.map((t: any) => {
            if ((t.title || "").toLowerCase().includes(target)) {
              return { ...t, status: "done" };
            }
            return t;
          });
          syncData.lastAction = { type: "COMPLETE_TASK", target, timestamp: Date.now() };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "ADD_TRANSACTION" && aiResult.transactionData) {
        const syncData = getSyncedWorkspaceData(userId);
        syncData.transactions = syncData.transactions || [];

        // If multiple individual items were provided
        if (Array.isArray(aiResult.transactionData?.items) && aiResult.transactionData.items.length > 0) {
          const clientName = aiResult.transactionData.items[0]?.client || aiResult.transactionData.client || "";
          if (clientName) {
            syncData.transactions = syncData.transactions.filter((t: any) => 
              !((t.client || "").toLowerCase().includes(clientName.toLowerCase()) && (t.description || "").includes("1658"))
            );
          }

          for (let i = 0; i < aiResult.transactionData.items.length; i++) {
            const item = aiResult.transactionData.items[i];
            const newTx = {
              id: Date.now() + i,
              description: item.description || "Mensalidade em Atraso",
              type: item.type || "receita",
              amount: Number(item.amount) || 829,
              date: item.date || new Date().toISOString().split("T")[0],
              category: item.category || "Contratos",
              status: item.status || "pendente",
              client: item.client || clientName || "SISPUMUMC"
            };
            syncData.transactions.unshift(newTx);
          }
          syncData.lastAction = { type: "ADD_TRANSACTION", timestamp: Date.now() };
        } else {
          const targetClient = aiResult.transactionData.client || aiResult.clientData?.name || "Geral";
          const newTransaction = {
            id: Date.now(),
            description: aiResult.transactionData.description || "Lançamento via WhatsApp",
            type: aiResult.transactionData.type || "receita",
            amount: Number(aiResult.transactionData.amount) || 0,
            date: aiResult.transactionData.date || new Date().toISOString().split("T")[0],
            category: aiResult.transactionData.category || "Contratos",
            status: aiResult.transactionData.status || "pendente",
            client: targetClient
          };
          syncData.transactions.unshift(newTransaction);
          syncData.lastAction = { type: "ADD_TRANSACTION", transaction: newTransaction, timestamp: Date.now() };
        }
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "CLEAR_ALL_TRANSACTIONS") {
        const syncData = getSyncedWorkspaceData(userId);
        syncData.transactions = [];
        syncData.lastAction = { type: "CLEAR_ALL_TRANSACTIONS", timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "DELETE_TRANSACTION") {
        const syncData = getSyncedWorkspaceData(userId);
        const target = (aiResult.transactionData?.targetDescription || aiResult.transactionData?.description || "").toLowerCase().trim();
        if (syncData.transactions && syncData.transactions.length > 0) {
          if (!target || target === "todas" || target === "tudo" || target === "valor" || target === "transação" || target === "financeiro") {
            syncData.transactions = [];
            syncData.lastAction = { type: "CLEAR_ALL_TRANSACTIONS", timestamp: Date.now() };
          } else {
            syncData.transactions = syncData.transactions.filter((t: any) => 
              !(t.description || "").toLowerCase().includes(target) &&
              !String(t.amount || "").includes(target)
            );
            syncData.lastAction = { type: "DELETE_TRANSACTION", target, timestamp: Date.now() };
          }
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "ADD_CLIENT" && aiResult.clientData) {
        const newClient = {
          id: Date.now(),
          name: aiResult.clientData.name || "Novo Cliente",
          niche: aiResult.clientData.niche || "Outros",
          status: aiResult.clientData.status || "Ativo",
          contact: aiResult.clientData.contact || "",
          avatarUrl: aiResult.clientData.avatarUrl || "",
          paymentType: aiResult.clientData.paymentType || "Mensal",
          plan: aiResult.clientData.plan || "",
          planDetails: aiResult.clientData.planDetails || "",
          planValue: aiResult.clientData.planValue !== undefined && aiResult.clientData.planValue !== null && aiResult.clientData.planValue !== "" ? Number(aiResult.clientData.planValue) : 0,
          dueDate: aiResult.clientData.dueDate || new Date().toISOString().split("T")[0],
          startDate: aiResult.clientData.startDate || new Date().toISOString().split("T")[0],
          paymentStatus: aiResult.clientData.paymentStatus || "Pendente",
          notes: aiResult.clientData.notes || "",
          paletaCores: aiResult.clientData.paletaCores || [],
          bancoDeDadosIA: aiResult.clientData.bancoDeDadosIA || ""
        };
        const syncData = getSyncedWorkspaceData(userId);
        syncData.clients = syncData.clients || [];
        syncData.clients.unshift(newClient);

        // If client is created with a debt or pending transaction
        let extractedDebt = (aiResult.transactionData?.amount && Number(aiResult.transactionData.amount) > 0)
          ? Number(aiResult.transactionData.amount)
          : 0;

        if (!extractedDebt && newClient.notes) {
          const match = newClient.notes.match(/R\$\s*([\d,.]+)|débito de\s*([\d,.]+)|devendo\s*([\d,.]+)/i);
          if (match) {
            const num = parseFloat((match[1] || match[2] || match[3] || "").replace(",", "."));
            if (!isNaN(num) && num > 0) extractedDebt = num;
          }
        }

        if (extractedDebt > 0 || (aiResult.transactionData?.amount && Number(aiResult.transactionData.amount) > 0)) {
          const finalAmount = extractedDebt || Number(aiResult.transactionData?.amount);
          syncData.transactions = syncData.transactions || [];
          const desc = aiResult.transactionData?.description || 
            (newClient.paymentType === "Projeto Avulso" || newClient.paymentType === "Projeto" 
              ? `Serviço Avulso Pendente - ${newClient.name}`
              : `Mensalidade Pendente - ${newClient.name}`);
              
          syncData.transactions.unshift({
            id: Date.now() + 1,
            description: desc,
            type: "receita",
            amount: finalAmount,
            date: newClient.dueDate || new Date().toISOString().split("T")[0],
            category: newClient.paymentType === "Projeto Avulso" ? "Serviços Avulsos" : "Contratos",
            status: "pendente",
            client: newClient.name
          });
        }

        syncData.lastAction = { type: "ADD_CLIENT", client: newClient, timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "UPDATE_CLIENT") {
        const syncData = getSyncedWorkspaceData(userId);
        const oldTarget = (aiResult.clientData?.oldName || aiResult.clientData?.name || "").toLowerCase().trim();
        const newName = aiResult.clientData?.name;
        let targetClient: any = null;
        if (syncData.clients && syncData.clients.length > 0) {
          syncData.clients = syncData.clients.map((c: any, index: number) => {
            const matchesOld = oldTarget && (c.name || "").toLowerCase().includes(oldTarget);
            const isLatest = (!oldTarget || oldTarget === (c.name || "").toLowerCase().trim()) || index === 0;
            if (matchesOld || isLatest) {
              targetClient = {
                ...c,
                name: newName || c.name,
                niche: aiResult.clientData?.niche || c.niche,
                status: aiResult.clientData?.status || c.status,
                contact: aiResult.clientData?.contact || c.contact,
                avatarUrl: aiResult.clientData?.avatarUrl || c.avatarUrl,
                paymentType: aiResult.clientData?.paymentType || c.paymentType,
                plan: aiResult.clientData?.plan || c.plan,
                planDetails: aiResult.clientData?.planDetails || c.planDetails,
                planValue: aiResult.clientData?.planValue !== undefined && aiResult.clientData?.planValue !== null && aiResult.clientData?.planValue !== "" ? Number(aiResult.clientData.planValue) : c.planValue,
                dueDate: aiResult.clientData?.dueDate || c.dueDate,
                startDate: aiResult.clientData?.startDate || c.startDate,
                paymentStatus: aiResult.clientData?.paymentStatus || c.paymentStatus,
                notes: aiResult.clientData?.notes ? (c.notes ? `${c.notes}\n${aiResult.clientData.notes}` : aiResult.clientData.notes) : c.notes,
                paletaCores: aiResult.clientData?.paletaCores || c.paletaCores,
                bancoDeDadosIA: aiResult.clientData?.bancoDeDadosIA || c.bancoDeDadosIA
              };
              return targetClient;
            }
            return c;
          });
          // If the update marked client as Atrasado or mentions overdue months, generate the pending invoices in Financeiro!
          if (
            (targetClient?.paymentStatus === "Atrasado" || (aiResult.clientData?.notes && /atraso|atrasad/i.test(aiResult.clientData.notes))) &&
            targetClient?.planValue > 0
          ) {
            syncData.transactions = syncData.transactions || [];
            const clientName = targetClient.name;
            const numMonths = (aiResult.clientData?.notes && /dois|2/i.test(aiResult.clientData.notes)) ? 2 : 1;
            
            for (let m = 1; m <= numMonths; m++) {
              const desc = numMonths > 1 
                ? `Mensalidade em Atraso (Mês ${m}/${numMonths}) - ${clientName}`
                : `Mensalidade em Atraso - ${clientName}`;
                
              const exists = syncData.transactions.some((tx: any) => 
                (tx.description || "").toLowerCase() === desc.toLowerCase()
              );
              
              if (!exists) {
                syncData.transactions.unshift({
                  id: Date.now() + m,
                  description: desc,
                  type: "receita",
                  amount: targetClient.planValue,
                  date: new Date().toISOString().split("T")[0],
                  category: "Contratos",
                  status: "pendente",
                  client: clientName
                });
              }
            }
          }

          syncData.lastAction = { 
            type: "UPDATE_CLIENT", 
            oldName: oldTarget, 
            name: newName, 
            client: targetClient || syncData.clients[0], 
            planValue: targetClient?.planValue,
            dueDate: targetClient?.dueDate,
            startDate: targetClient?.startDate,
            timestamp: Date.now() 
          };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "DELETE_CLIENT") {
        const syncData = getSyncedWorkspaceData(userId);
        const target = (aiResult.clientData?.name || "").toLowerCase().trim();
        if (target && syncData.clients) {
          syncData.clients = syncData.clients.filter((c: any) => 
            !(c.name || "").toLowerCase().includes(target)
          );
          syncData.lastAction = { type: "DELETE_CLIENT", target, timestamp: Date.now() };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "ADD_EVENT" && aiResult.eventData) {
        const newEvent = {
          id: Date.now(),
          title: aiResult.eventData.title || "Reunião / Evento",
          date: aiResult.eventData.date || new Date().toISOString().split("T")[0],
          time: aiResult.eventData.time || "10:00",
          client: aiResult.eventData.client || "Geral",
          description: aiResult.eventData.description || ""
        };
        const syncData = getSyncedWorkspaceData(userId);
        syncData.calendarEvents = syncData.calendarEvents || [];
        syncData.calendarEvents.unshift(newEvent);
        syncData.lastAction = { type: "ADD_EVENT", event: newEvent, timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      } else if (aiResult.command === "DELETE_EVENT") {
        const syncData = getSyncedWorkspaceData(userId);
        const target = (aiResult.eventData?.targetTitle || aiResult.eventData?.title || "").toLowerCase().trim();
        if (target && syncData.calendarEvents) {
          syncData.calendarEvents = syncData.calendarEvents.filter((e: any) => 
            !(e.title || "").toLowerCase().includes(target)
          );
          syncData.lastAction = { type: "DELETE_EVENT", target, timestamp: Date.now() };
          saveSyncedWorkspaceData(syncData, userId);
        }
      } else if (aiResult.command === "ADD_NOTE" && aiResult.noteData) {
        const newNote = {
          id: Date.now(),
          title: aiResult.noteData.title || "Nota Rápida",
          content: aiResult.noteData.content || "",
          client: aiResult.noteData.client || "Geral",
          createdAt: new Date().toISOString()
        };
        const syncData = getSyncedWorkspaceData(userId);
        syncData.savedNotes = syncData.savedNotes || [];
        syncData.savedNotes.unshift(newNote);
        syncData.lastAction = { type: "ADD_NOTE", note: newNote, timestamp: Date.now() };
        saveSyncedWorkspaceData(syncData, userId);
      }

      res.json({
        success: true,
        replyText: aiResult.replyText,
        command: aiResult.command,
        aiResult,
        generatedImageUrl
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get live synced workspace items (tasks, transactions, clients) added via WhatsApp
  app.get("/api/whatsapp/sync-data", (req, res) => {
    const userId = (req.query.userId as string) || "admin_user";
    res.json(getSyncedWorkspaceData(userId));
  });

  // Explicit delete item endpoint from frontend UI to prevent resurrected items
  app.post("/api/whatsapp/delete-item", (req, res) => {
    try {
      const { userId = "admin_user", type, id, description, name, title } = req.body;
      const syncData = getSyncedWorkspaceData(userId);
      if (type === "transaction") {
        syncData.transactions = (syncData.transactions || []).filter((t: any) => 
          String(t.id) !== String(id) && (!description || (t.description || "").toLowerCase() !== description.toLowerCase())
        );
        syncData.lastAction = { type: "DELETE_TRANSACTION", id, target: description, timestamp: Date.now() };
      } else if (type === "task") {
        syncData.tasks = (syncData.tasks || []).filter((t: any) => 
          String(t.id) !== String(id) && (!title || (t.title || "").toLowerCase() !== title.toLowerCase())
        );
        syncData.lastAction = { type: "DELETE_TASK", id, target: title, timestamp: Date.now() };
      } else if (type === "client") {
        syncData.clients = (syncData.clients || []).filter((c: any) => 
          String(c.id) !== String(id) && (!name || (c.name || "").toLowerCase() !== name.toLowerCase())
        );
        syncData.lastAction = { type: "DELETE_CLIENT", id, target: name, timestamp: Date.now() };
      } else if (type === "event") {
        syncData.calendarEvents = (syncData.calendarEvents || []).filter((e: any) => 
          String(e.id) !== String(id) && (!title || !(e.title || "").toLowerCase().includes(title.toLowerCase()))
        );
        syncData.lastAction = { type: "DELETE_EVENT", id, target: title, timestamp: Date.now() };
      } else if (type === "note") {
        syncData.savedNotes = (syncData.savedNotes || []).filter((n: any) => 
          String(n.id) !== String(id) && (!title || !(n.title || "").toLowerCase().includes(title.toLowerCase()))
        );
        syncData.lastAction = { type: "DELETE_NOTE", id, target: title, timestamp: Date.now() };
      }
      saveSyncedWorkspaceData(syncData, userId);
      res.json({ success: true, syncData });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Start the 24/7 proactive reminder and notification scheduler
  startProactiveReminderScheduler();
}

// --- PROACTIVE WHATSAPP REMINDER & NOTIFICATION ENGINE ---
const sentRemindersSet = new Set<string>();
let schedulerStarted = false;

export function startProactiveReminderScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  console.log("[WhatsApp Scheduler] ⏰ Proactive reminder & notification engine initialized!");

  setInterval(async () => {
    try {
      const now = new Date();
      // Format current Brazilian local date and time (YYYY-MM-DD and HH:MM)
      const dateStr = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
      const [currH, currM] = timeStr.split(":").map(Number);
      const currentTotalMins = currH * 60 + currM;

      for (const [userId, session] of activeSessions.entries()) {
        if (session.status !== "connected" || !session.sock || !session.phoneNumber) continue;

        const targetJid = `${session.phoneNumber}@s.whatsapp.net`;
        const syncData = getSyncedWorkspaceData(userId);

        // 1. Check Calendar Events (Reuniões, Gravações, Entregas)
        if (Array.isArray(syncData.calendarEvents)) {
          for (const ev of syncData.calendarEvents) {
            if (!ev.date || ev.date !== dateStr) continue;
            if (!ev.time) continue;

            const [evH, evM] = ev.time.split(":").map(Number);
            if (isNaN(evH) || isNaN(evM)) continue;
            const evTotalMins = evH * 60 + evM;
            const diffMins = evTotalMins - currentTotalMins;

            // Trigger A: 30 minutes before (between 20 and 35 mins before)
            const key30m = `event_${ev.id || ev.title}_30m_${dateStr}`;
            if (diffMins >= 20 && diffMins <= 35 && !sentRemindersSet.has(key30m)) {
              sentRemindersSet.add(key30m);
              const msg = `🔔 *Lembrete Zion - Em 30 minutos!*\n\n📅 *Compromisso*: ${ev.title}\n⏰ *Horário*: às ${ev.time}\n👤 *Cliente*: ${ev.client || "Geral"}\n${ev.description ? `📝 *Detalhes*: ${ev.description}\n` : ""}\nPrepare-se! 🚀`;
              await session.sock.sendMessage(targetJid, { text: msg }).catch(() => {});
              console.log(`[WhatsApp Proactive] 🔔 Sent 30m reminder to ${session.phoneNumber} for event: ${ev.title}`);
            }

            // Trigger B: At exact time (between -2 and 3 mins)
            const keyNow = `event_${ev.id || ev.title}_now_${dateStr}`;
            if (diffMins >= -2 && diffMins <= 3 && !sentRemindersSet.has(keyNow)) {
              sentRemindersSet.add(keyNow);
              const msg = `⏰ *Hora Marcada Zion!*\n\n🚨 *Seu compromisso está começando agora*: *${ev.title}* às ${ev.time}!\n👤 *Cliente*: ${ev.client || "Geral"}\n\nBom trabalho! 💪✨`;
              await session.sock.sendMessage(targetJid, { text: msg }).catch(() => {});
              console.log(`[WhatsApp Proactive] ⏰ Sent exact time reminder to ${session.phoneNumber} for event: ${ev.title}`);
            }
          }
        }

        // 2. Check Tasks with Deadlines and Scheduled Times
        if (Array.isArray(syncData.tasks)) {
          for (const task of syncData.tasks) {
            if (task.status === "done") continue;
            if (!task.dueDate || task.dueDate !== dateStr) continue;
            
            if (task.time) {
              const [tH, tM] = task.time.split(":").map(Number);
              if (!isNaN(tH) && !isNaN(tM)) {
                const tTotalMins = tH * 60 + tM;
                const diffMins = tTotalMins - currentTotalMins;

                // 30 min reminder
                const keyTask30 = `task_${task.id || task.title}_30m_${dateStr}`;
                if (diffMins >= 20 && diffMins <= 35 && !sentRemindersSet.has(keyTask30)) {
                  sentRemindersSet.add(keyTask30);
                  const msg = `📌 *Lembrete de Tarefa Zion (em 30 min)*\n\n🎯 *Tarefa*: ${task.title}\n⏰ *Horário*: ${task.time}\n👤 *Cliente*: ${task.client || "Geral"}\n\nFalta pouco para o prazo! ⏱️`;
                  await session.sock.sendMessage(targetJid, { text: msg }).catch(() => {});
                  console.log(`[WhatsApp Proactive] 📌 Sent task reminder to ${session.phoneNumber} for: ${task.title}`);
                }
              }
            }
          }
        }

        // 3. Morning Daily Digest (Sent once per day around 08:00 - 08:30 AM)
        const keyMorning = `morning_digest_${dateStr}_${userId}`;
        if (currH === 8 && currM >= 0 && currM <= 15 && !sentRemindersSet.has(keyMorning)) {
          sentRemindersSet.add(keyMorning);
          const todaysEvents = (syncData.calendarEvents || []).filter((e: any) => e.date === dateStr);
          const todaysTasks = (syncData.tasks || []).filter((t: any) => t.dueDate === dateStr && t.status !== "done");
          
          if (todaysEvents.length > 0 || todaysTasks.length > 0) {
            let digest = `☀️ *Bom dia, Diretor(a)!* Aqui está o seu resumo de hoje (${new Date().toLocaleDateString("pt-BR")}):\n\n`;
            if (todaysEvents.length > 0) {
              digest += `📅 *Compromissos de Hoje*:\n`;
              todaysEvents.forEach((e: any) => {
                digest += `  • ${e.time || "Horário a definir"} - *${e.title}* (${e.client || "Geral"})\n`;
              });
              digest += `\n`;
            }
            if (todaysTasks.length > 0) {
              digest += `📋 *Tarefas para Entregar Hoje*:\n`;
              todaysTasks.forEach((t: any) => {
                digest += `  • *${t.title}* (${t.client || "Geral"})\n`;
              });
              digest += `\n`;
            }
            digest += `Conte comigo para criar artes, roteiros e gerenciar tudo! Tenha um excelente dia de produção! 🚀✨`;
            await session.sock.sendMessage(targetJid, { text: digest }).catch(() => {});
            console.log(`[WhatsApp Proactive] ☀️ Sent morning daily digest to ${session.phoneNumber}`);
          }
        }
      }
    } catch (err) {
      console.error("[WhatsApp Proactive] Error in scheduler loop:", err);
    }
  }, 20000); // Check every 20 seconds
}
