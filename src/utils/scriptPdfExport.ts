import jsPDF from "jspdf";
import JSZip from "jszip";

/**
 * Remove JSON code blocks and raw JSON structures from script text
 */
export function stripJsonBlocks(text: string): string {
  if (!text) return "";
  // Remove markdown json codeblocks ```json ... ``` or ``` ... ```
  let cleaned = text.replace(/```(?:json)?[\s\S]*?```/gi, "");

  // Remove raw JSON objects if present
  cleaned = cleaned.replace(/\{\s*"cores"[\s\S]*\}\s*$/gi, "");
  cleaned = cleaned.replace(/\{\s*"[a-zA-Z0-9_]+"[\s\S]*\}\s*$/gi, "");

  return cleaned.trim();
}

/**
 * Remove conversational intro text (e.g. "Com certeza! Preparei 4 roteiros...")
 * when script headers or content blocks are detected.
 */
export function cleanConversationalIntro(text: string): string {
  if (!text) return "";
  let cleaned = text.trim();

  // Find where actual script structure starts
  const firstSectionRegex = /(?:^|\n)(?=\d+\.\s*ROTEIRO|###?\s*ROTEIRO|###?\s*SCRIPT|ROTEIRO\s*\d+|SCRIPT\s*\d+|📱|🎬|🎯|⚙️|🪝|==================================================)/i;
  const match = cleaned.match(firstSectionRegex);
  if (match && match.index !== undefined && match.index > 0) {
    const introText = cleaned.slice(0, match.index);
    // If intro text is under 1500 chars, strip it out
    if (introText.length < 1500) {
      cleaned = cleaned.slice(match.index).trim();
    }
  }

  // Strip line-by-line chatter at start if present
  const lines = cleaned.split("\n");
  while (lines.length > 0) {
    const l = lines[0].trim();
    if (
      /^(com certeza|olá|aqui estão|conforme solicitado|preparei|dividi exatamente|vamos lá|ótima ideia|aqui está|aqui vai)/i.test(l) ||
      /^divid\w+\s+como/i.test(l)
    ) {
      lines.shift();
    } else {
      break;
    }
  }

  return lines.join("\n").trim();
}

/**
 * Check if a line represents visual/B-roll/technical direction that should be excluded from the client script
 */
function isVisualDirectionLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Strip leading bullet markers (*, -, •) and markdown bold/italic
  const unbulleted = trimmed.replace(/^[-*•]\s*/, "").trim();
  const cleanedLabel = unbulleted
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/^\*|\*$/g, "")
    .trim();

  // Pattern for Visual / B-Roll / Scene / Camera / Action / Angle labels
  const visualPattern = /^(?:VISUAL(?:\s*[&/e]\s*B-ROLL)?|B-ROLL|CENA(?:\s*\d+)?|CENAS|AÇÃO(?:\s*DO\s*APRESENTADOR)?|AÇÃO|DIREÇÃO(?:\s*VISUAL)?|ENQUADRAMENTO|CÂMERA|ÂNGULO|CORTE(?:\s*\d+)?|TRANSIÇÃO|TAKE|TAKES|IMAGEM|IMAGENS|MOSTRA|MOSTRANDO|APARECE|CENÁRIO|GRAVAÇÃO)\b/i;

  if (visualPattern.test(cleanedLabel) || visualPattern.test(unbulleted)) {
    // Check if it also explicitly has FALA / ÁUDIO / VOZ / NARRAÇÃO
    const hasSpeechKeyword = /\b(?:FALA|VOZ|ÁUDIO|NARRAÇÃO|APRESENTADOR|APRESENTADORA)\b/i.test(cleanedLabel);
    if (!hasSpeechKeyword) return true;
  }

  // Check bracketed or parenthesized visual directions
  if (/^\[\s*(?:VISUAL|B-ROLL|CENA|AÇÃO|CÂMERA|DIREÇÃO|ENQUADRAMENTO|IMAGEM)[^\]]*\]$/i.test(trimmed)) return true;
  if (/^\(\s*(?:VISUAL|B-ROLL|CENA|AÇÃO|CÂMERA|DIREÇÃO|ENQUADRAMENTO|IMAGEM)[^\)]*\)$/i.test(trimmed)) return true;

  // Detect visual action lines that don't have speech markers or quotes
  // E.g., "- Pâmela aparece sorrindo...", "- Takes rápidos...", "- Mostra a caixa do Combo..."
  const hasSpeechPrefix = /^(?:FALA(?:\s*[&/e]\s*ÁUDIO)?|ÁUDIO|VOZ|NARRAÇÃO|TEXTO|TEXTO\s*NA\s*TELA)\b/i.test(cleanedLabel);
  const isHeader = /^(?:#+\s*|GATILHO|INÍCIO|DESENVOLVIMENTO|MEIO|FINAL|CTA|TEMA|CLIENTE|DATA|ROTEIRO|VERSÃO|\d+\.)/i.test(cleanedLabel);

  if (!hasSpeechPrefix && !isHeader) {
    const visualActionRegex = /^(?:[A-ZÀ-Ú][a-zà-ú]+\s+)?(?:aparece|mostra|segura|sorri|entra|corta|muda|sai|grava|fecha|abre|exibe|coloca|puxa|pega)\b/i;
    const visualNounRegex = /^(?:takes?|cortes?|câmera|imagens?|vídeos?|planos?|zooms?|foco|cenário|bastidores|detalhe|b-roll|inserção)\b/i;

    if (visualActionRegex.test(unbulleted) || visualNounRegex.test(unbulleted)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract Client Section from a message text (Clean content containing ONLY the presenter's speech lines & topic headers)
 */
export function extractClientSection(text: string): string {
  let cleaned = stripJsonBlocks(text);
  cleaned = cleanConversationalIntro(cleaned);

  const clientMarkerRegex = /(?:1\.\s*ROTEIRO\s*PARA\s*O\s*CLIENTE|ROTEIRO\s*PARA\s*O\s*CLIENTE|VERSÃO\s*CLIENTE|ROTEIRO\s*DE\s*VÍDEO)/i;
  const editorMarkerRegex = /(?:2\.\s*ROTEIRO\s*COMPLETO\s*PARA\s*O\s*EDITOR|ROTEIRO\s*PARA\s*O\s*EDITOR|VERSÃO\s*EDITOR|TABELA\s*DE\s*EDIÇÃO|⚙️\s*CONFIGURAÇÕES)/i;

  const clientMatch = cleaned.match(clientMarkerRegex);
  const editorMatch = cleaned.match(editorMarkerRegex);

  if (clientMatch && clientMatch.index !== undefined) {
    let clientPart = cleaned.slice(clientMatch.index);
    if (editorMatch && editorMatch.index !== undefined && editorMatch.index > clientMatch.index) {
      clientPart = cleaned.slice(clientMatch.index, editorMatch.index);
    }
    cleaned = clientPart.trim();
  }

  const lines = cleaned.split("\n");
  const filtered: string[] = [];
  let inTable = false;
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    // Extract speech column from markdown table if present
    const parsed = parseMarkdownTable(tableBuffer);
    tableBuffer = [];
    if (parsed) {
      const headers = parsed.headers;
      let speechColIndex = headers.findIndex((h) =>
        /FALA|ÁUDIO|VOZ|NARRAÇÃO|APRESENTADOR|TEXTO/i.test(h)
      );
      if (speechColIndex === -1 && headers.length >= 2) {
        speechColIndex = headers.length > 2 ? 2 : 1;
      }

      parsed.rows.forEach((row) => {
        if (row[speechColIndex]) {
          const speech = row[speechColIndex].replace(/^["'«]/, "").replace(/["'»]$/, "").trim();
          if (speech && speech !== "-") {
            filtered.push(`- **Fala:** "${speech}"`);
          }
        }
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable();
    }

    // Filter out unwanted redundant headers & settings
    if (/CONFIGURAÇÕES\s*RÁPIDAS/i.test(trimmed)) continue;
    if (/DICAS\s*RÁPIDAS\s*DE\s*EDIÇÃO/i.test(trimmed)) continue;
    if (/^(?:#+\s*)?(?:\d+\.|\b)?\s*ROTEIRO\s*(?:PARA\s*O\s*)?CLIENTE/i.test(trimmed)) continue;
    if (/^(?:#+\s*)?VERSÃO\s*CLIENTE/i.test(trimmed)) continue;
    if (/^\(APROVAÇÃO/i.test(trimmed)) continue;
    if (/Versão limpa, focada EXCLUSIVAMENTE/i.test(trimmed)) continue;

    // Filter out Visual, B-Roll, Scene, Action, Camera directions
    if (isVisualDirectionLine(trimmed)) continue;

    // Strip inline bracketed visual notes like [Visual: ...] from speech lines
    const cleanedLine = trimmed
      .replace(/\[\s*(?:VISUAL|B-ROLL|CENA|AÇÃO|CÂMERA|DIREÇÃO|ENQUADRAMENTO)[^\]]*\]/gi, "")
      .replace(/\(\s*(?:VISUAL|B-ROLL|CENA|AÇÃO|CÂMERA|DIREÇÃO|ENQUADRAMENTO)[^\)]*\)/gi, "")
      .trim();

    if (cleanedLine || trimmed === "") {
      filtered.push(cleanedLine);
    }
  }

  if (inTable) {
    flushTable();
  }

  return filtered.join("\n").trim();
}

/**
 * Extract Editor Section from a message text (Full technical breakdown)
 */
export function extractEditorSection(text: string): string {
  let cleaned = stripJsonBlocks(text);
  cleaned = cleanConversationalIntro(cleaned);

  const editorMarkerRegex = /(?:2\.\s*ROTEIRO\s*COMPLETO\s*PARA\s*O\s*EDITOR|ROTEIRO\s*PARA\s*O\s*EDITOR|VERSÃO\s*EDITOR|⚙️\s*CONFIGURAÇÕES)/i;
  const editorMatch = cleaned.match(editorMarkerRegex);

  if (editorMatch && editorMatch.index !== undefined) {
    cleaned = cleaned.slice(editorMatch.index).trim();
  }

  // Filter out redundant heading lines
  const lines = cleaned.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (/^(?:#+\s*)?(?:\d+\.|\b)?\s*ROTEIRO\s*(?:COMPLETO\s*)?PARA\s*O\s*EDITOR/i.test(trimmed)) return false;
    if (/^(?:#+\s*)?VERSÃO\s*EDITOR/i.test(trimmed)) return false;
    return true;
  });

  return filtered.join("\n").trim();
}

/**
 * Clean markdown symbols, emojis, and unwanted garbled characters for plain text rendering in jsPDF
 */
function cleanTextForPdf(text: string): string {
  if (!text) return "";
  let result = text
    .replace(/\(?Versão limpa, focada EXCLUSIVAMENTE[^)]*instruções técnicas\)?/gi, "")
    .replace(/\(APROVAÇÃO\s*RUÍDO\s*ZERO\)/gi, "")
    .replace(/APROVAÇÃO\s*RUÍDO\s*ZERO/gi, "")
    .replace(/RUÍDO\s*ZERO/gi, "")
    .replace(/\(APROVAÇÃO\)/gi, "")
    .replace(/APROVAÇÃO/gi, "")
    .replace(/ROTEIRO\s*PARA\s*O\s*CLIENTE/gi, "")
    .replace(/ROTEIRO\s*PARA\s*CLIENTE/gi, "")
    .replace(/VERSÃO\s*CLIENTE/gi, "")
    .replace(/ROTEIRO\s*PARA\s*O\s*EDITOR/gi, "")
    .replace(/VERSÃO\s*EDITOR/gi, "")
    .replace(/ZION\s*AI\s*STUDIO/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/^={3,}/g, "")
    .replace(/🎯/g, "")
    .replace(/⚡/g, "")
    .replace(/💡/g, "")
    .replace(/📸/g, "")
    .replace(/🎥/g, "")
    .replace(/🛵/g, "")
    .replace(/🍕/g, "")
    .replace(/🔥/g, "")
    .replace(/📍/g, "")
    .replace(/✨/g, "")
    .replace(/👋/g, "")
    .replace(/🚀/g, "")
    .replace(/📌/g, "")
    .replace(/🍿/g, "")
    .replace(/🎬/g, "")
    .replace(/📱/g, "")
    .replace(/⚙️/g, "")
    .replace(/🪝/g, "")
    .replace(/📊/g, "")
    .replace(/[\u{1F000}-\u{1F9FF}]/gu, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{E000}-\u{F8FF}]/gu, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
    .replace(/Ø[^\s]*\s*/g, "")
    .replace(/[^\x00-\x7F\u00C0-\u00FF\n]/g, "")
    .replace(/[ \t]+/g, " ");

  return result.trim();
}

/**
 * Extract Video Topic/Title from the script text
 */
export function extractVideoTopic(rawScriptText: string): string {
  if (!rawScriptText) return "Conteúdo de Vídeo";
  const lines = rawScriptText.split("\n");

  for (const line of lines) {
    let cleanLine = line.trim();

    // Remove common list/bullet prefix symbols, e.g., "- ", "* ", "+ ", "1. ", "1) "
    cleanLine = cleanLine.replace(/^[-*+]\s+/, "");
    cleanLine = cleanLine.replace(/^\d+[\s.)-]+\s*/, "");

    // Strip markdown formatting symbols like bold/italic ** or __ or * or _ from the line
    cleanLine = cleanLine.replace(/\*\*/g, "").replace(/__/g, "").replace(/\*/g, "").replace(/_/g, "").trim();

    // Check for "TEMA:", "TÍTULO:", "ROTEIRO 1:", "SCRIPT 2 -", etc.
    const match = cleanLine.match(/^(?:###?\s*)?(?:TEMA(?:\s+DO\s+VÍDEO|\s+DO\s+ROTEIRO)?|TÍTULO(?:\s+DO\s+VÍDEO|\s+DO\s+ROTEIRO|\s+PRINCIPAL)?|ASSUNTO|ROTEIRO(?:\s*\d+)?|SCRIPT(?:\s*\d+)?|NOME\s*DO\s*VÍDEO|HEADLINE|HOOK|PROPOSTA)\s*[-:]\s*(.+)/i);
    if (match && match[1]) {
      const topic = cleanTextForPdf(match[1])
        .replace(/^(PARA O CLIENTE|PARA O EDITOR|VERSÃO|APROVAÇÃO|01|02|03|04|05)/i, "")
        .replace(/^ROTEIRO\s*\d+\s*[-:]?\s*/i, "")
        .trim();
      if (topic.length > 2 && !/PARA O CLIENTE|PARA O EDITOR/i.test(topic)) {
        return topic;
      }
    }
  }

  for (const line of lines) {
    let cleanLine = line.trim();

    // Strip formatting
    cleanLine = cleanLine.replace(/\*\*/g, "").replace(/__/g, "").replace(/\*/g, "").replace(/_/g, "").trim();

    if (cleanLine.startsWith("#") || /^(?:ROTEIRO|SCRIPT)\s*\d+/i.test(cleanLine)) {
      const cleanH = cleanTextForPdf(cleanLine.replace(/^#+\s*/, "")).trim();
      if (cleanH.length > 3 && !/ROTEIRO PARA O CLIENTE|ROTEIRO PARA O EDITOR|VERSÃO/i.test(cleanH)) {
        // Also remove something like "ROTEIRO 1: " from the start of the title
        const cleanTopic = cleanH.replace(/^(?:ROTEIRO|SCRIPT)\s*\d+\s*[-:]?\s*/i, "").trim();
        if (cleanTopic.length > 2 && !/ROTEIRO\s*\d+/i.test(cleanTopic)) {
          return cleanTopic;
        }
        if (cleanH.length > 2 && !/ROTEIRO\s*\d+/i.test(cleanH)) {
          return cleanH;
        }
      }
    }
  }

  return "Conteúdo de Vídeo";
}

/**
 * Parse a markdown table string into headers and rows
 */
function parseMarkdownTable(tableLines: string[]): { headers: string[]; rows: string[][] } | null {
  const filtered = tableLines.map((l) => l.trim()).filter((l) => l.startsWith("|"));
  if (filtered.length < 2) return null;

  const extractRow = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cleanTextForPdf(cell));

  const headers = extractRow(filtered[0]);
  
  // Filter out alignment separator line (e.g. |---|---|)
  const dataLines = filtered.slice(1).filter((l) => {
    const raw = l.replace(/[\s|:-]/g, "");
    return raw.length > 0;
  });

  const rows = dataLines.map((l) => extractRow(l));

  if (headers.length === 0 || rows.length === 0) return null;

  return { headers, rows };
}

/**
 * Generate a PDF document for a script
 */
export function generateScriptPdf(
  rawScriptText: string,
  clientName: string,
  pdfTarget: "CLIENTE" | "EDITOR" = "CLIENTE"
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let cursorY = margin;

  const videoTopic = extractVideoTopic(rawScriptText);
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  // Colors
  const darkBg = [20, 20, 24];
  const goldAccent = [197, 168, 128];
  const textColor = [235, 235, 240];
  const subtextColor = [160, 160, 170];

  // Draw Header Banner
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Gold Top Accent Stripe
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  // Header Title & Target Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  
  const headerMain = pdfTarget === "CLIENTE" ? "ROTEIRO DE VÍDEO" : "GUIA TÉCNICO DE GRAVAÇÃO E EDIÇÃO";
  doc.text(headerMain, margin, 11);

  // Status Badge on top right
  if (pdfTarget === "EDITOR") {
    const badgeText = "PRODUÇÃO";
    const badgeW = doc.getTextWidth(badgeText) + 6;
    const badgeH = 5.5;
    const badgeX = pageWidth - margin - badgeW;
    const badgeY = 7;
    
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, badgeX + 3, badgeY + 3.8);
  }

  // Subheader / Client & Topic
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`CLIENTE: ${clientName.toUpperCase()}`, margin, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 200, 210);
  const isGenericTopic = !videoTopic || videoTopic.toLowerCase() === "conteúdo de vídeo" || videoTopic.trim() === "";
  if (!isGenericTopic) {
    const topicLabel = `TEMA: ${videoTopic.toUpperCase()}`;
    const truncatedTopic = topicLabel.length > 68 ? topicLabel.slice(0, 68) + "..." : topicLabel;
    doc.text(truncatedTopic, margin, 22.5);
  }

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
  doc.text(`DATA: ${dateStr}`, pageWidth - margin, 17, { align: "right" });

  // Divider under header
  doc.setDrawColor(60, 60, 70);
  doc.setLineWidth(0.3);
  doc.line(margin, 26, pageWidth - margin, 26);

  cursorY = 35;

  // Process text based on target (Client vs Editor)
  let processedText = pdfTarget === "CLIENTE" ? extractClientSection(rawScriptText) : extractEditorSection(rawScriptText);

  const rawLines = processedText.split("\n");
  
  // Extract Ficha Técnica metadata from rawLines
  const metadata: { key: string; value: string }[] = [];
  const contentLines: string[] = [];
  
  for (const line of rawLines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(Plataforma|Duração|Tempo|Objetivo|Público-Alvo|Público|Estilo|Gancho|Hook|Chamada\s+para\s+ação|CTA|Tema|Título)\s*[-:]\s*(.+)/i);
    if (match && match[1] && match[2]) {
      metadata.push({
        key: match[1].trim(),
        value: match[2].trim()
      });
    } else {
      contentLines.push(line);
    }
  }

  let inTable = false;
  let tableBuffer: string[] = [];

  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin - 12) {
      doc.addPage();
      cursorY = margin + 4;
      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.rect(0, 0, pageWidth, 1.5, "F");
    }
  };

  // Render "Ficha Técnica" Card if any metadata is detected
  if (metadata.length > 0) {
    checkPageBreak(12 + Math.ceil(metadata.length / 2) * 8);
    
    const cardX = margin;
    const cardY = cursorY;
    const cardW = contentWidth;
    const rowHeight = 7.5;
    const cardH = 8 + Math.ceil(metadata.length / 2) * rowHeight + 3;
    
    // Luxurious light off-white cream background with subtle warm gold border
    doc.setFillColor(252, 251, 248);
    doc.setDrawColor(220, 210, 195);
    doc.setLineWidth(0.25);
    doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, "FD");
    
    // Card Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(140, 110, 70); // Warm brown/gold
    doc.text("FICHA TÉCNICA DO ROTEIRO", cardX + 4.5, cardY + 5.5);
    
    doc.setDrawColor(235, 228, 218);
    doc.line(cardX + 4.5, cardY + 7.5, cardX + cardW - 4.5, cardY + 7.5);
    
    // Render keys in two columns
    doc.setFontSize(8);
    let itemIdx = 0;
    metadata.forEach((m) => {
      const col = itemIdx % 2;
      const row = Math.floor(itemIdx / 2);
      const xOffset = col === 0 ? 5 : cardW / 2 + 2;
      const yOffset = cardY + 12.2 + row * rowHeight;
      
      // Key label in bold warm grey
      doc.setFont("helvetica", "bold");
      doc.setTextColor(85, 80, 75);
      const keyLabel = `${m.key.toUpperCase()}: `;
      doc.text(keyLabel, cardX + xOffset, yOffset);
      
      // Value text in neutral dark grey
      const keyWidth = doc.getTextWidth(keyLabel);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 55);
      
      const maxValW = (cardW / 2) - xOffset - 4;
      const truncatedVal = doc.splitTextToSize(m.value, maxValW);
      doc.text(truncatedVal[0] || "", cardX + xOffset + keyWidth, yOffset);
      
      itemIdx++;
    });
    
    cursorY += cardH + 6;
  }

  const renderTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const parsed = parseMarkdownTable(tableBuffer);
    tableBuffer = [];
    if (!parsed) return;

    checkPageBreak(25);

    // Table Column Widths totaling 182mm
    const colWidths = [28, 52, 52, 50];
    const headers = ["Cena / Tempo", "Visual & B-Roll", "Fala & Áudio", "Texto / SFX"];

    // Render Table Headers
    checkPageBreak(8);
    doc.setFillColor(32, 28, 42); // violet-charcoal
    doc.rect(margin, cursorY, contentWidth, 7.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(245, 245, 250);

    let curX = margin;
    headers.forEach((h, i) => {
      doc.text(h, curX + 2.5, cursorY + 4.8);
      curX += colWidths[i];
    });
    cursorY += 7.5;

    // Render Table Rows
    parsed.rows.forEach((row, rowIndex) => {
      const cellLines = row.map((cellText, i) => {
        const w = colWidths[i] - 4;
        const textToUse = cellText || "-";
        const splitByNewlines = textToUse.split("\n");
        const lines: string[] = [];
        doc.setFont("helvetica", i === 0 ? "bold" : "normal");
        doc.setFontSize(7.5);
        splitByNewlines.forEach((sub) => {
          const wrapped = doc.splitTextToSize(sub, w);
          lines.push(...wrapped);
        });
        return lines;
      });

      const maxLines = Math.max(...cellLines.map((l) => l.length), 1);
      const rowHeight = Math.max(maxLines * 4.2 + 5, 10);

      checkPageBreak(rowHeight);

      // Alternating row background
      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 252, 254);
      } else {
        doc.setFillColor(245, 245, 248);
      }
      doc.rect(margin, cursorY, contentWidth, rowHeight, "F");

      doc.setDrawColor(220, 220, 225);
      doc.setLineWidth(0.15);
      doc.rect(margin, cursorY, contentWidth, rowHeight, "S");

      let vX = margin;
      colWidths.forEach((w) => {
        vX += w;
        if (vX < margin + contentWidth - 0.5) {
          doc.line(vX, cursorY, vX, cursorY + rowHeight);
        }
      });

      let cellX = margin;
      cellLines.forEach((lines, colIdx) => {
        doc.setFont("helvetica", colIdx === 0 ? "bold" : "normal");
        doc.setFontSize(7.5);
        
        if (colIdx === 0) {
          doc.setTextColor(30, 30, 35);
        } else if (colIdx === 2) {
          doc.setTextColor(150, 60, 15); // Speech highlights
        } else {
          doc.setTextColor(50, 50, 55);
        }

        const textBlockHeight = lines.length * 3.8;
        const startY = cursorY + (rowHeight - textBlockHeight) / 2 + 2.5;

        lines.forEach((lineText: string, lineIdx: number) => {
          doc.text(lineText, cellX + 2.5, startY + lineIdx * 3.8);
        });

        cellX += colWidths[colIdx];
      });

      cursorY += rowHeight;
    });

    cursorY += 5;
  };

  for (let idx = 0; idx < contentLines.length; idx++) {
    const line = contentLines[idx];
    const trimmed = line.trim();

    // Check if table line
    if (trimmed.startsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      inTable = false;
      renderTableBuffer();
    }

    if (!trimmed) {
      cursorY += 2;
      continue;
    }

    // Skip standalone horizontal dividers like === or ---
    if (/^[=-]{3,}$/.test(trimmed) || trimmed === "***") {
      cursorY += 2;
      continue;
    }

    // Section Titles and major semantic sections (e.g., INÍCIO, MEIO, FIM, TÍTULO DO VÍDEO)
    const cleanLineForHeader = cleanTextForPdf(trimmed).trim();
    const isSectionHeader = /^(?:INÍCIO|MEIO|FIM|INTRODUÇÃO|DESENVOLVIMENTO|CONCLUSÃO|GANCHO|HOOK|CTA|CHAMADA\s+PARA\s+AÇÃO|TÍTULO\s+DO\s+VÍDEO)/i.test(cleanLineForHeader);

    if (trimmed.startsWith("#") || /^ROTEIRO\s*\d+/i.test(trimmed) || /ROTEIRO\s*PARA\s*O/i.test(trimmed) || isSectionHeader) {
      checkPageBreak(16);
      const cleanHeader = cleanTextForPdf(trimmed.replace(/^#+\s*/, "")).replace(/[:\-]+$/, "").trim();
      if (!cleanHeader) continue;

      // Draw a beautiful background band across the page
      const stripH = 7.5;
      doc.setFillColor(248, 244, 238); // Premium warm-cream
      doc.roundedRect(margin, cursorY, contentWidth, stripH, 1.5, 1.5, "F");

      // Draw the gold vertical left accent
      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.rect(margin, cursorY, 2.8, stripH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(55, 48, 38); // Elegant warm bronze-charcoal
      doc.text(cleanHeader.toUpperCase(), margin + 5, cursorY + 5.2);

      cursorY += stripH + 5;
      continue;
    }

    // List/Bullet points
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ");
    if (isBullet) {
      const bulletText = trimmed.replace(/^[-•*]\s*/, "");
      checkPageBreak(8);
      
      // Draw standard gold bullet point
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("•", margin + 2.5, cursorY + 4);
      
      const cleanBulletText = cleanTextForPdf(bulletText);
      const colonInBullet = cleanBulletText.indexOf(":");
      
      if (colonInBullet > 0) {
        const bulletLabel = cleanBulletText.substring(0, colonInBullet + 1).trim();
        const bulletValue = cleanBulletText.substring(colonInBullet + 1).trim();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        
        const isSpeech = /^(FALA|ÁUDIO|VOZ|NARRAÇÃO)/i.test(bulletLabel);
        const isVisual = /^(VISUAL|B-ROLL|CENA|CORTE|AÇÃO)/i.test(bulletLabel);
        if (isSpeech) {
          doc.setTextColor(180, 80, 20); // Warm amber for spoken dialogue
        } else if (isVisual) {
          doc.setTextColor(20, 100, 180); // Classic blue for visual notes
        } else {
          doc.setTextColor(35, 35, 40); // Dark neutral for other tags
        }
        
        const labelWidth = doc.getTextWidth(bulletLabel + " ") + 1.5;
        doc.text(bulletLabel, margin + 6, cursorY + 4);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 55, 60);
        
        const valueWidth = contentWidth - 6 - labelWidth;
        const wrappedValue = doc.splitTextToSize(bulletValue, valueWidth);
        
        wrappedValue.forEach((wl: string, lineIdx: number) => {
          checkPageBreak(4.5);
          const xPos = lineIdx === 0 ? (margin + 6 + labelWidth) : (margin + 6);
          const yPos = cursorY + 4 + lineIdx * 4.2;
          doc.text(wl, xPos, yPos);
        });
        
        cursorY += 4 + wrappedValue.length * 4.2 + 0.8;
      } else {
        // Standard bullet text with no colon
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 55, 60);
        
        const wrapped = doc.splitTextToSize(cleanBulletText, contentWidth - 6);
        wrapped.forEach((wl: string, lineIdx: number) => {
          checkPageBreak(4.5);
          doc.text(wl, margin + 6, cursorY + 4 + lineIdx * 4.2);
        });
        cursorY += 4 + wrapped.length * 4.2 + 0.8;
      }
      continue;
    }

    // Key-Value splitting (e.g. "Fala:", "Cena:", "Dica:")
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx > 0 && !trimmed.startsWith("|") && !trimmed.startsWith("#")) {
      const label = trimmed.substring(0, colonIdx + 1).trim();
      const value = trimmed.substring(colonIdx + 1).trim();
      
      const cleanLabel = cleanTextForPdf(label);
      const cleanValue = cleanTextForPdf(value);
      
      if (cleanValue.length > 0) {
        checkPageBreak(8);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        
        const isSpeech = /^(FALA|ÁUDIO|VOZ|NARRAÇÃO)/i.test(cleanLabel);
        const isVisual = /^(VISUAL|B-ROLL|CENA|CORTE|AÇÃO)/i.test(cleanLabel);
        if (isSpeech) {
          doc.setTextColor(180, 80, 20); // Warm amber
        } else if (isVisual) {
          doc.setTextColor(20, 100, 180); // Blue accent
        } else {
          doc.setTextColor(35, 35, 40); // Dark neutral
        }
        
        const labelWidth = doc.getTextWidth(cleanLabel + " ") + 1.5;
        doc.text(cleanLabel, margin, cursorY + 4);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 55, 60);
        
        const valueWidth = contentWidth - labelWidth;
        const wrappedValue = doc.splitTextToSize(cleanValue, valueWidth);
        
        wrappedValue.forEach((wl: string, lineIdx: number) => {
          checkPageBreak(4.5);
          const xPos = lineIdx === 0 ? (margin + labelWidth) : margin;
          const yPos = cursorY + 4 + lineIdx * 4.2;
          doc.text(wl, xPos, yPos);
        });
        
        cursorY += 4 + wrappedValue.length * 4.2 + 0.8;
        continue;
      } else {
        // Label on its own line
        checkPageBreak(6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(35, 35, 40);
        doc.text(cleanLabel, margin, cursorY + 4);
        cursorY += 5;
        continue;
      }
    }

    // Standard text line
    checkPageBreak(6);
    const plainText = cleanTextForPdf(trimmed);
    if (!plainText) continue;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 48);

    const wrappedLines = doc.splitTextToSize(plainText, contentWidth);
    wrappedLines.forEach((wl: string) => {
      checkPageBreak(4.5);
      doc.text(wl, margin, cursorY + 3.5);
      cursorY += 4.2;
    });
  }

  // Flush remaining table
  if (inTable) {
    renderTableBuffer();
  }

  // Page Numbers Footer (Clean & Professional without Zion / Ruído Zero)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 140);

    const footerText = pdfTarget === "CLIENTE"
      ? `ROTEIRO DE VÍDEO • CLIENTE: ${clientName.toUpperCase()}`
      : `GUIA TÉCNICO DE GRAVAÇÃO E EDIÇÃO • CLIENTE: ${clientName.toUpperCase()}`;

    doc.text(footerText, margin, pageHeight - 7);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  return doc;
}

export interface ExtractedScriptItem {
  index: number;
  title: string;
  topic: string;
  content: string;
}

/**
 * Split text containing multiple scripts into individual script blocks
 */
export function extractScriptsFromText(fullText: string): ExtractedScriptItem[] {
  let cleaned = stripJsonBlocks(fullText);
  cleaned = cleanConversationalIntro(cleaned);

  if (!cleaned) return [];

  // Match script block headers e.g. "### ROTEIRO 1", "### 📱 ROTEIRO 2", "ROTEIRO 03:", etc.
  const scriptHeaderRegex = /(?:^|\n)(?=###?\s*(?:📱|🎬)?\s*(?:ROTEIRO|SCRIPT)\s*\d+|(?:\d+\.|\b)\s*ROTEIRO\s*\d+[\s:-])/gi;
  let parts = cleaned.split(scriptHeaderRegex).map((p) => p.trim()).filter(Boolean);

  // Filter out conversational intros if any leaked through
  const scriptParts = parts.filter((p) => {
    return (
      /(?:ROTEIRO|SCRIPT)\s*\d+/i.test(p) ||
      /ROTEIRO\s*PARA\s*O\s*CLIENTE/i.test(p) ||
      /FALA\s*&?\s*ÁUDIO/i.test(p) ||
      /VISUAL\s*&?\s*B-ROLL/i.test(p) ||
      /ROTEIRO\s*COMPLETO\s*PARA\s*O\s*EDITOR/i.test(p)
    );
  });

  const finalParts = scriptParts.length > 0 ? scriptParts : [cleaned];

  return finalParts.map((part, index) => {
    const lines = part.split("\n");
    const firstLine = lines[0] || "";

    // Try to parse explicit script number e.g. "ROTEIRO 2" or "ROTEIRO 03"
    const numMatch = part.match(/(?:ROTEIRO|SCRIPT)\s*(\d+)/i);
    const scriptIndex = numMatch ? parseInt(numMatch[1], 10) : index + 1;

    // Extract topic
    let topic = extractVideoTopic(part);
    if (!topic || topic === "Conteúdo de Vídeo") {
      const matchHeader = firstLine.match(/(?:ROTEIRO|SCRIPT)\s*\d+[\s:-]*(.+)/i);
      if (matchHeader && matchHeader[1]) {
        topic = cleanTextForPdf(matchHeader[1]);
      } else {
        topic = `Roteiro ${scriptIndex}`;
      }
    }

    const title = `Roteiro_${String(scriptIndex).padStart(2, "0")}`;

    return {
      index: scriptIndex,
      title,
      topic,
      content: part
    };
  });
}

/**
 * Export a single script message to PDF download (Target: CLIENTE or EDITOR)
 */
export function exportSingleScriptPdf(
  scriptText: string,
  clientName: string,
  target: "CLIENTE" | "EDITOR" = "CLIENTE",
  customFileName?: string
) {
  const doc = generateScriptPdf(scriptText, clientName, target);
  const tag = target === "CLIENTE" ? "Cliente" : "Editor";
  
  let name = customFileName;
  if (!name) {
    const topic = extractVideoTopic(scriptText);
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_");
    name = `Roteiro_[${tag}]_${clientName.replace(/\s+/g, "_")}_${sanitizedTopic}.pdf`;
  }
  doc.save(name);
}

/**
 * Generate a Data URL string for live iframe preview of the PDF
 */
export function getScriptPdfDataUrl(
  rawScriptText: string,
  clientName: string,
  target: "CLIENTE" | "EDITOR" = "CLIENTE"
): string {
  try {
    const doc = generateScriptPdf(rawScriptText, clientName, target);
    return doc.output("datauristring");
  } catch (e) {
    console.error("Error generating PDF Data URL:", e);
    return "";
  }
}

/**
 * Export multiple scripts in a ZIP containing separate PDF files for Cliente and Editor
 */
export async function exportBatchScriptsZip(fullText: string, clientName: string): Promise<void> {
  const scripts = extractScriptsFromText(fullText);
  const zip = new JSZip();

  scripts.forEach((script, idx) => {
    const numStr = String(idx + 1).padStart(2, "0");
    const sanitizedTopic = script.topic.replace(/[^a-zA-Z0-9À-ÿ]+/g, "_");

    // 1. PDF Cliente
    const docCliente = generateScriptPdf(script.content, clientName, "CLIENTE");
    const blobCliente = docCliente.output("blob");
    zip.file(`[CLIENTE]_Roteiro_${numStr}_${sanitizedTopic}.pdf`, blobCliente);

    // 2. PDF Editor
    const docEditor = generateScriptPdf(script.content, clientName, "EDITOR");
    const blobEditor = docEditor.output("blob");
    zip.file(`[EDITOR]_Roteiro_${numStr}_${sanitizedTopic}.pdf`, blobEditor);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Pacote_Roteiros_[Cliente_e_Editor]_${clientName.replace(/\s+/g, "_")}_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

