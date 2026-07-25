import makeWASocket, { useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } from "@whiskeysockets/baileys";
import { supabase } from "./supabase.js";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import pino from "pino";
import { Express } from "express";

// In-memory status store for each user
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

// Ensure sessions directory exists
const sessionsDir = path.join(process.cwd(), "whatsapp-sessions");
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
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
  return process.env.GEMINI_API_KEY || process.env.API_KEY || "";
}

// Process WhatsApp message with Gemini AI
async function processWhatsAppMessageWithAI(
  userId: string,
  messageContent: { text?: string; audio?: Buffer; image?: Buffer; document?: Buffer; mimeType?: string },
  currentData: any,
  userApiKey?: string
) {
  const apiKey = getEffectiveApiKey(currentData, userApiKey);
  if (!apiKey) {
    throw new Error("API Key do Gemini não configurada.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const currentDate = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const currentISODate = new Date().toISOString().split("T")[0];

  const existingClients = (currentData.clients || []).map((c: any) => c.name);

  const parts: any[] = [];

  if (messageContent.audio) {
    parts.push({
      inlineData: {
        data: messageContent.audio.toString("base64"),
        mimeType: messageContent.mimeType || "audio/ogg"
      }
    });
  } else if (messageContent.image) {
    parts.push({
      inlineData: {
        data: messageContent.image.toString("base64"),
        mimeType: messageContent.mimeType || "image/jpeg"
      }
    });
  } else if (messageContent.document) {
    parts.push({
      inlineData: {
        data: messageContent.document.toString("base64"),
        mimeType: messageContent.mimeType || "application/pdf"
      }
    });
  }

  const promptText = `Você é o Smart Agent, um Assistente de IA conversacional completo, inteligente, extremamente carismático e especialista em gerenciamento de negócios para a plataforma Zion Workspace.
Sua missão é ajudar o usuário no que ele precisar: você pode tanto realizar ações estruturadas no sistema de gerenciamento quanto bater papo, responder dúvidas gerais de qualquer assunto (ex: receitas, programas, dicas de produtividade, curiosidades), contar piadas, criar e-mails, ou simplesmente responder saudações como "Oi", "Tudo bem?", "Bom dia"!

Você deve analisar a mensagem recebida em português (que pode ser texto puro, um áudio que transcrevemos ou um documento/imagem como comprovante de pagamento) e classificar o comando correspondente.

Você deve responder APENAS com um objeto JSON válido, contendo os seguintes campos:
{
  "command": "ADD_TASK" | "COMPLETE_TASK" | "ADD_TRANSACTION" | "ADD_CLIENT" | "QUERY" | "UNKNOWN",
  "taskData": {
    "title": "Título curto da tarefa em português",
    "description": "Descrição detalhada extraída da mensagem",
    "client": "Nome do cliente associado (se houver, tente mapear para um dos clientes existentes: ${JSON.stringify(existingClients)})",
    "dueDate": "YYYY-MM-DD" (se uma data ou prazo for mencionado, calcule com base no contexto abaixo, caso contrário null),
    "hasDeadline": boolean
  },
  "transactionData": {
    "description": "Descrição da transação financeira",
    "type": "receita" | "despesa",
    "amount": número (valor monetário extraído, ex: 150.50),
    "category": "Categoria financeira apropriada (ex: Alimentação, Combustível, Softwares, Marketing, Recebimento, Outros)",
    "status": "pago" | "pendente" (pago se já concluído/recebido, pendente se for uma conta a pagar/receber)
  },
  "clientData": {
    "name": "Nome do novo cliente",
    "niche": "Nicho de atuação do cliente (ex: Saúde, Educação, Advocacia, etc.)",
    "contact": "Contato do cliente se mencionado",
    "planValue": número (valor do plano mensal se mencionado)
  },
  "queryTarget": "tasks" | "transactions" | "clients" | "all" | null,
  "replyText": "Sua resposta carismática, extremamente simpática, prestativa e direta em português. Se for apenas um cumprimento ('oi', 'olá', 'tudo bem'), uma piada, um bate-papo, ou ajuda geral sem comando, responda com muito carisma e naturalidade. Se for uma ação ou comando, confirme claramente o que foi feito."
}

Contexto de Datas:
- Hoje é: ${currentDate}
- Data de hoje em formato ISO: ${currentISODate}
- Calcule as datas relativas com precisão (ex: "amanhã", "segunda que vem", "até o fim do mês").

Dados Atuais do Usuário (se ele perguntar ou quiser saber o status atual):
- Clientes cadastrados: ${JSON.stringify(existingClients)}
- Tarefas pendentes: ${JSON.stringify((currentData.tasks || []).filter((t: any) => t.status !== "done").map((t: any) => ({ title: t.title, dueDate: t.dueDate, client: t.client })))}
- Últimas transações: ${JSON.stringify((currentData.transactions || []).slice(-5).map((t: any) => ({ desc: t.description, type: t.type, amount: t.amount, status: t.status })))}

Instruções Especiais:
1. Se a mensagem for um simples cumprimento (como 'oi', 'olá', 'tudo bem'), dúvidas de bate-papo, piadas ou tarefas criativas (ex: 'me ajude a bolar uma ideia'), defina "command": "UNKNOWN" e dê uma resposta incrivelmente simpática, gentil e acolhedora em "replyText".
2. Se o usuário quiser saber seu progresso, tarefas ou clientes, defina "command": "QUERY" e responda com carinho usando os dados fornecidos acima.
3. Se o usuário enviar um comprovante (imagem ou PDF), analise-o com cuidado, extraia as informações e responda com "command": "ADD_TRANSACTION", definindo o "status" como "pago".

Escreva a resposta final estritamente no formato JSON, sem marcações markdown como \`\`\`json ou explicações externas.`;

  parts.push({ text: promptText });
  if (messageContent.text) {
    parts.push({ text: `Mensagem do Usuário:\n"${messageContent.text}"` });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
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

  return JSON.parse(jsonStr);
}

// Initialize WhatsApp connection for a specific user
export async function connectWhatsApp(userId: string) {
  if (!userId) return;

  // If already connected, do nothing
  const existing = activeSessions.get(userId);
  if (existing && (existing.status === "connected" || existing.status === "connecting")) {
    return;
  }

  console.log(`Starting WhatsApp session for user ${userId}...`);

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

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: ["Windows", "Chrome", "110.0.0.0"],
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
          const qrDataUrl = await QRCode.toDataURL(qr);
          sessionObj.status = "qr";
          sessionObj.qrCode = qrDataUrl;
          console.log(`QR Code generated for WhatsApp user: ${userId}`);
        } catch (err) {
          console.error("Error generating QR code:", err);
        }
      }

      if (connection === "open") {
        sessionObj.status = "connected";
        sessionObj.qrCode = "";
        sessionObj.phoneNumber = sock.user?.id ? sock.user.id.split(":")[0] : "";
        sessionObj.userInfo = sock.user?.name || "WhatsApp User";
        console.log(`WhatsApp connected successfully for user ${userId}: ${sessionObj.phoneNumber}`);
      }

      if (connection === "close") {
        const error = (lastDisconnect?.error as any);
        const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log(`WhatsApp connection closed for user ${userId}. Reconnecting: ${shouldReconnect}`);
        
        // Remove from activeSessions so that a reconnect attempt is not blocked by the early-return check
        activeSessions.delete(userId);

        if (shouldReconnect) {
          setTimeout(() => connectWhatsApp(userId), 5000);
        } else {
          sessionObj.status = "disconnected";
          sessionObj.qrCode = "";
          sessionObj.phoneNumber = "";
          sessionObj.userInfo = "";
          // Delete session folder
          try {
            fs.rmSync(userSessionPath, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    });

    // Message receiver event
    sock.ev.on("messages.upsert", async (m) => {
      if (m.type !== "notify") return;
      
      for (const msg of m.messages) {
        if (!msg.message) continue;

        const msgId = msg.key.id || "";
        if (msgId && sentMessageIds.has(msgId)) {
          console.log(`[WhatsApp Message Skipped] Message is our own reply bot ID: ${msgId}. Skipping to prevent loop.`);
          continue;
        }

        const senderJid = msg.key.remoteJid || "";
        
        // Strictly only process direct private messages ending with @s.whatsapp.net
        if (!senderJid.endsWith("@s.whatsapp.net")) {
          continue;
        }

        // Use our robust helper to extract pure phone digits
        const botNumber = cleanNumber(sock.user?.id || state.creds.me?.id || "");
        const senderNumber = cleanNumber(senderJid);
        
        const isSelfChat = senderNumber !== "" && botNumber !== "" && senderNumber === botNumber;
        const isFromMe = !!msg.key.fromMe;

        console.log(`[WhatsApp Message Event] RemoteJID: ${senderJid}, botNumber: ${botNumber}, senderNumber: ${senderNumber}, isSelfChat: ${isSelfChat}, isFromMe: ${isFromMe}`);

        // If it's a message sent by the bot to someone else (not a self-chat), we skip it
        if (isFromMe && !isSelfChat) {
          console.log(`[WhatsApp Message Skipped] Message is sent from bot to another user. Skipping.`);
          continue;
        }

        console.log(`[WhatsApp Message Processing] Proceeding with message from ${senderNumber}. ID: ${msgId}`);

        // Use our robust helper to extract all wrapped & unwrapped details
        const { text, hasAudio, hasImage, hasDocument, mediaMessage, mediaType } = extractMessageDetails(msg.message);

        if (!text && !hasAudio && !hasImage && !hasDocument) continue;

        // Fetch User Data from Supabase to apply changes
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
          console.error("Error reading Supabase user doc:", err);
          continue;
        }

        // Restrict to Owner / Authorized Numbers if configured
        const profile = currentData.myProfile || {};
        const wsSettings = profile.whatsappSettings || {};
        const respondOnlyToOwner = wsSettings.respondOnlyToOwner === true;
        
        if (respondOnlyToOwner) {
          const ownerNumClean = cleanNumber(wsSettings.ownerNumber || "");
          const authNumsList = (wsSettings.authorizedNumbers || "")
            .split(",")
            .map((num: string) => cleanNumber(num))
            .filter((num: string) => num !== "");

          const isOwnerSender = senderNumber !== "" && ownerNumClean !== "" && senderNumber === ownerNumClean;
          const isAuthSender = authNumsList.includes(senderNumber);

          if (!isSelfChat && !isOwnerSender && !isAuthSender) {
            console.log(`[WhatsApp Access Control] Ignored message from unauthorized number: ${senderNumber}. Only allowed: SelfChat, Owner (${ownerNumClean || "none"}), Authorized (${authNumsList.join(", ") || "none"})`);
            continue;
          }
        }

        // Gather message payload
        const messagePayload: { text?: string; audio?: Buffer; image?: Buffer; document?: Buffer; mimeType?: string } = {};
        if (text) messagePayload.text = text;

        try {
          if (hasAudio && mediaMessage) {
            console.log("Downloading audio message...");
            const audioBuffer = await downloadMedia(mediaMessage, "audio");
            if (audioBuffer) {
              messagePayload.audio = audioBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "audio/ogg";
            }
          } else if (hasImage && mediaMessage) {
            console.log("Downloading image message...");
            const imageBuffer = await downloadMedia(mediaMessage, "image");
            if (imageBuffer) {
              messagePayload.image = imageBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "image/jpeg";
            }
          } else if (hasDocument && mediaMessage) {
            console.log("Downloading document message...");
            const docBuffer = await downloadMedia(mediaMessage, "document");
            if (docBuffer) {
              messagePayload.document = docBuffer;
              messagePayload.mimeType = mediaMessage.mimetype || "application/pdf";
            }
          }

          // Process with Gemini
          console.log("Processing message with Gemini AI...");
          const userApiKey = currentData.myProfile?.geminiApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
          
          const aiResult = await processWhatsAppMessageWithAI(userId, messagePayload, currentData, userApiKey);
          console.log("Gemini parsed result:", aiResult);

          let updated = false;

          if (aiResult.command === "ADD_TASK") {
            const newTask = {
              id: Date.now(),
              title: aiResult.taskData.title,
              description: aiResult.taskData.description || "",
              status: "todo",
              client: aiResult.taskData.client || "",
              hasDeadline: !!aiResult.taskData.hasDeadline,
              dueDate: aiResult.taskData.dueDate || ""
            };
            currentData.tasks = currentData.tasks || [];
            currentData.tasks.push(newTask);
            updated = true;
          } else if (aiResult.command === "COMPLETE_TASK") {
            const titleToMatch = aiResult.taskData?.title?.toLowerCase();
            currentData.tasks = currentData.tasks || [];
            const taskToComplete = currentData.tasks.find((t: any) => 
              t.status !== "done" && 
              (t.title.toLowerCase().includes(titleToMatch) || titleToMatch?.includes(t.title.toLowerCase()))
            );
            if (taskToComplete) {
              taskToComplete.status = "done";
              updated = true;
            }
          } else if (aiResult.command === "ADD_TRANSACTION") {
            const newTransaction = {
              id: Date.now(),
              description: aiResult.transactionData.description,
              type: aiResult.transactionData.type || "despesa",
              amount: Number(aiResult.transactionData.amount) || 0,
              date: new Date().toISOString().split("T")[0],
              category: aiResult.transactionData.category || "Outros",
              status: aiResult.transactionData.status || "pago"
            };
            currentData.transactions = currentData.transactions || [];
            currentData.transactions.push(newTransaction);
            updated = true;
          } else if (aiResult.command === "ADD_CLIENT") {
            const newClient = {
              id: Date.now(),
              name: aiResult.clientData.name,
              niche: aiResult.clientData.niche || "Outros",
              status: "Ativo",
              contact: aiResult.clientData.contact || "",
              planValue: Number(aiResult.clientData.planValue) || 0,
              dueDate: new Date().toISOString().split("T")[0],
              paymentStatus: "Pendente"
            };
            currentData.clients = currentData.clients || [];
            currentData.clients.push(newClient);
            updated = true;
          }

          // Add message exchange to logs
          currentData.whatsappLogs = currentData.whatsappLogs || [];
          currentData.whatsappLogs.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            sender: senderNumber,
            message: text || (hasAudio ? "🎤 Áudio" : hasImage ? "📸 Imagem" : "📎 Documento"),
            reply: aiResult.replyText,
            command: aiResult.command
          });
          if (currentData.whatsappLogs.length > 50) {
            currentData.whatsappLogs = currentData.whatsappLogs.slice(0, 50);
          }

          // ALWAYS save logs and notifications to Firestore so that user can see updates in real-time!
          currentData.updatedAt = new Date().toISOString();
          
          currentData.notifications = currentData.notifications || [];
          currentData.notifications.unshift({
            id: Date.now(),
            message: `🤖 WhatsApp: ${aiResult.replyText}`,
            date: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            read: false,
            type: updated ? "success" : "info"
          });

          // Write back to Supabase
          await supabase.from('users').upsert({ id: userId, updated_at: new Date().toISOString(), data: currentData });
          console.log("Supabase successfully updated with WhatsApp action & chat log!");

          // Reply on WhatsApp and register message ID to prevent self-looping
          const sentMsg = await sock.sendMessage(senderJid, { text: aiResult.replyText });
          if (sentMsg?.key?.id) {
            sentMessageIds.add(sentMsg.key.id);
            if (sentMessageIds.size > 2000) {
              const oldestId = sentMessageIds.values().next().value;
              if (oldestId) sentMessageIds.delete(oldestId);
            }
          }

        } catch (aiErr: any) {
          console.error("Error processing AI WhatsApp workflow:", aiErr);
          const errorMsg = `⚠️ Desculpe, ocorreu um erro ao processar sua solicitação com inteligência artificial: ${aiErr.message || aiErr}`;
          try {
            const sentErrorMsg = await sock.sendMessage(senderJid, { text: errorMsg });
            if (sentErrorMsg?.key?.id) {
              sentMessageIds.add(sentErrorMsg.key.id);
            }
          } catch (sendErr) {
            console.error("Failed to send error notification on WhatsApp:", sendErr);
          }
        }
      }
    });

  } catch (err) {
    console.error(`Error initializing WhatsApp for user ${userId}:`, err);
    activeSessions.delete(userId);
  }
}

// Disconnect WhatsApp session
export async function disconnectWhatsApp(userId: string) {
  const session = activeSessions.get(userId);
  if (session) {
    try {
      if (session.sock) {
        console.log(`Logging out WhatsApp session for ${userId}...`);
        try {
          await session.sock.logout();
          console.log(`Logout completed for ${userId}.`);
        } catch (logoutErr) {
          console.error("Error during sock.logout(), attempting forced end:", logoutErr);
          try {
            session.sock.end();
          } catch (endErr) {
            console.error("Error ending socket:", endErr);
          }
        }
      }
    } catch (e) {
      console.error("Error during disconnect flow:", e);
    }
    activeSessions.delete(userId);
  }

  // Wait a moment to allow the WebSocket to send logout payloads and close cleanly
  await new Promise(r => setTimeout(r, 2000));

  // Delete credentials
  const userSessionPath = path.join(sessionsDir, userId);
  if (fs.existsSync(userSessionPath)) {
    try {
      fs.rmSync(userSessionPath, { recursive: true, force: true });
      console.log(`Credentials directory deleted for ${userId}`);
    } catch (e) {
      console.error("Error deleting session directory:", e);
    }
  }
}

// REST endpoints for React Frontend
export function initWhatsAppEndpoints(app: Express) {
  // Get WhatsApp status and QR Code
  app.get("/api/whatsapp/status", async (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    let session = activeSessions.get(userId);
    
    // Auto-connect on status check if credentials exist and no active session exists
    const userSessionPath = path.join(sessionsDir, userId);
    if (!session && fs.existsSync(userSessionPath) && fs.readdirSync(userSessionPath).length > 0) {
      console.log(`Auto-reconnecting saved WhatsApp session for ${userId}`);
      connectWhatsApp(userId);
      // Wait a moment for initialization
      await new Promise(r => setTimeout(r, 1000));
      session = activeSessions.get(userId);
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
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      await connectWhatsApp(userId);
      res.json({ success: true, message: "WhatsApp connection worker started." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Disconnect WhatsApp session manually
  app.post("/api/whatsapp/disconnect", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      await disconnectWhatsApp(userId);
      res.json({ success: true, message: "WhatsApp disconnected and credentials deleted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulator route - tests voice/text/receipt directly from browser
  app.post("/api/whatsapp/simulate", async (req, res) => {
    const { userId, text, isAudio, isReceipt } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      let userData: any = {};
      const { data, error } = await supabase.from('users').select('data').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data && data.data) {
        userData = data.data;
      } else {
        userData = {
          userId,
          clients: [],
          tasks: [],
          transactions: [],
          calendarEvents: [],
          notifications: [],
          whatsappLogs: []
        };
      }

      console.log(`Simulating message for user ${userId}: text="${text}" isAudio=${isAudio} isReceipt=${isReceipt}`);

      const messagePayload: { text?: string; audio?: Buffer; image?: Buffer; mimeType?: string } = {};

      if (isAudio) {
        // Simple synthetic audio simulation
        messagePayload.text = text || "Adicionar tarefa de ligar para o fornecedor amanhã";
        // We simulate a transcript by setting it to text directly but setting the source type
      } else if (isReceipt) {
        // Simple mock receipt image simulation
        const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // 1x1 black pixel PNG
        messagePayload.image = Buffer.from(sampleBase64, "base64");
        messagePayload.mimeType = "image/png";
        messagePayload.text = text || "Comprovante de pagamento de R$ 350,00 da hospedagem anual.";
      } else {
        messagePayload.text = text;
      }

      const userApiKey = userData.myProfile?.geminiApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
      const aiResult = await processWhatsAppMessageWithAI(userId, messagePayload, userData, userApiKey);

      let updated = false;

      if (aiResult.command === "ADD_TASK") {
        const newTask = {
          id: Date.now(),
          title: aiResult.taskData.title,
          description: aiResult.taskData.description || "",
          status: "todo",
          client: aiResult.taskData.client || "",
          hasDeadline: !!aiResult.taskData.hasDeadline,
          dueDate: aiResult.taskData.dueDate || ""
        };
        userData.tasks = userData.tasks || [];
        userData.tasks.push(newTask);
        updated = true;
      } else if (aiResult.command === "COMPLETE_TASK") {
        const titleToMatch = aiResult.taskData?.title?.toLowerCase();
        userData.tasks = userData.tasks || [];
        const taskToComplete = userData.tasks.find((t: any) => 
          t.status !== "done" && 
          (t.title.toLowerCase().includes(titleToMatch) || titleToMatch?.includes(t.title.toLowerCase()))
        );
        if (taskToComplete) {
          taskToComplete.status = "done";
          updated = true;
        }
      } else if (aiResult.command === "ADD_TRANSACTION") {
        const newTransaction = {
          id: Date.now(),
          description: aiResult.transactionData.description,
          type: aiResult.transactionData.type || "despesa",
          amount: Number(aiResult.transactionData.amount) || 0,
          date: new Date().toISOString().split("T")[0],
          category: aiResult.transactionData.category || "Outros",
          status: aiResult.transactionData.status || "pago"
        };
        userData.transactions = userData.transactions || [];
        userData.transactions.push(newTransaction);
        updated = true;
      } else if (aiResult.command === "ADD_CLIENT") {
        const newClient = {
          id: Date.now(),
          name: aiResult.clientData.name,
          niche: aiResult.clientData.niche || "Outros",
          status: "Ativo",
          contact: aiResult.clientData.contact || "",
          planValue: Number(aiResult.clientData.planValue) || 0,
          dueDate: new Date().toISOString().split("T")[0],
          paymentStatus: "Pendente"
        };
        userData.clients = userData.clients || [];
        userData.clients.push(newClient);
        updated = true;
      }

      // Add message exchange to logs
      userData.whatsappLogs = userData.whatsappLogs || [];
      userData.whatsappLogs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sender: "simulador_teste",
        message: text || (isAudio ? "🎤 Áudio Simulado" : "📸 Comprovante Simulado"),
        reply: aiResult.replyText,
        command: aiResult.command
      });
      if (userData.whatsappLogs.length > 50) {
        userData.whatsappLogs = userData.whatsappLogs.slice(0, 50);
      }

      // ALWAYS write to Supabase to save logs, notifications, and updates in real-time
      userData.updatedAt = new Date().toISOString();
      
      // Add system notification
      userData.notifications = userData.notifications || [];
      userData.notifications.unshift({
        id: Date.now(),
        message: `🤖 Simulador WhatsApp: ${aiResult.replyText}`,
        date: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
        type: updated ? "success" : "info"
      });

      await supabase.from('users').upsert({ id: userId, updated_at: new Date().toISOString(), data: userData });

      res.json({
        success: true,
        replyText: aiResult.replyText,
        command: aiResult.command,
        aiResult
      });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
