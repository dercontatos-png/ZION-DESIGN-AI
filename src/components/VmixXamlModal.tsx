import React, { useState, useEffect } from 'react';
import { X, Tv, Scan, Download, Copy, Check, Sparkles, RefreshCw, Layers, Sliders, Play, Info, FileCode, Upload, Image as ImageIcon } from 'lucide-react';
import JSZip from "jszip";

interface VmixXamlModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageBase64: string | null;
  customApiKey?: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  selectedTemplateId?: string;
  camadasTexto?: any[];
  additionalPrompt?: string;
  promptCenario?: string;
}

export function autoDetectLayoutStyle(
  templateId?: string,
  camadasTexto?: any[],
  additionalPrompt?: string,
  promptCenario?: string
): "jornalismo" | "esportes" | "urgente" | "clean" {
  // 1. Detect by templateId first
  if (templateId) {
    if (templateId === "gc_tv_esportes") return "esportes";
    if (templateId === "gc_tv_urgente") return "urgente";
    if (templateId === "gc_tv_jornalismo") return "jornalismo";
    if (templateId === "gc_tv_podcast") return "clean";
  }

  // 2. Detect by text layers (camadasTexto)
  if (camadasTexto && camadasTexto.length > 0) {
    const textStr = camadasTexto.map(l => (l.conteudo || "") + " " + (l.funcao || "")).join(" ").toLowerCase();
    if (textStr.includes("placar") || textStr.includes("vs") || textStr.includes("versus") || textStr.includes("gol") || textStr.includes("rodada") || textStr.includes("gols") || textStr.includes("campeonato") || textStr.includes("esporte")) {
      return "esportes";
    }
    if (textStr.includes("urgente") || textStr.includes("plantão") || textStr.includes("plantao") || textStr.includes("alerta") || textStr.includes("breaking") || textStr.includes("news")) {
      return "urgente";
    }
    if (textStr.includes("podcast") || textStr.includes("clean") || textStr.includes("minimalista")) {
      return "clean";
    }
    if (textStr.includes("jornal") || textStr.includes("entrevista") || textStr.includes("repórter") || textStr.includes("reporter") || textStr.includes("ao vivo")) {
      return "jornalismo";
    }
  }

  // 3. Detect by prompt fields
  const promptStr = ((additionalPrompt || "") + " " + (promptCenario || "")).toLowerCase();
  if (promptStr.includes("sports") || promptStr.includes("scoreboard") || promptStr.includes("esporte") || promptStr.includes("placar") || promptStr.includes("football") || promptStr.includes("estádio") || promptStr.includes("match")) {
    return "esportes";
  }
  if (promptStr.includes("breaking news") || promptStr.includes("urgente") || promptStr.includes("plantão") || promptStr.includes("plantao") || promptStr.includes("alerta")) {
    return "urgente";
  }
  if (promptStr.includes("podcast") || promptStr.includes("talk show") || promptStr.includes("minimalist") || promptStr.includes("clean")) {
    return "clean";
  }
  if (promptStr.includes("jornalismo") || promptStr.includes("entrevista") || promptStr.includes("lower third") || promptStr.includes("news")) {
    return "jornalismo";
  }

  return "jornalismo"; // Default fallback
}

export interface GcScanData {
  gcTitle: string;
  gcSubtitle: string;
  gcBadge: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  layoutStyle: "jornalismo" | "esportes" | "urgente" | "clean";
  hasLogo: boolean;
  logoUrl: string;
  logoName?: string;
  homeLogoName?: string;
  awayLogoName?: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  clock: string;
  roundText: string;
  barHeight: number;
  barCornerRadius: number;
  barOpacity: number;
  summary: string;
  generatedXaml?: string;
}

export function updateXamlWithState(xamlString: string, data: GcScanData): string {
  if (!xamlString) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xamlString, "application/xml");
    
    // Check for parse error
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      return xamlString;
    }

    const findNodeByName = (name: string, tagNames?: string[]): Element | null => {
      if (!name) return null;
      const target = name.toLowerCase();
      const allEls = tagNames && tagNames.length > 0 
        ? tagNames.flatMap(t => Array.from(doc.getElementsByTagName(t)))
        : Array.from(doc.getElementsByTagName("*"));

      return allEls.find(node => {
        const xName = (node.getAttribute("x:Name") || node.getAttribute("Name") || "").toLowerCase();
        return xName === target;
      }) || allEls.find(node => {
        const xName = (node.getAttribute("x:Name") || node.getAttribute("Name") || "").toLowerCase();
        return xName.includes(target);
      }) || null;
    };

    const updateTextBlock = (name: string, newText: string) => {
      if (newText === undefined || newText === null) return;
      const el = findNodeByName(name, ["TextBlock", "textblock"]);
      if (el) {
        el.setAttribute("Text", newText);
      }
    };

    // Helper to find and update colors without destroying complex child brushes (e.g. LinearGradientBrush)
    const updateElementColors = () => {
      const findAndFill = (name: string, color: string) => {
        if (!color) return;
        const el = findNodeByName(name, ["Rectangle", "rectangle", "Border", "border", "Canvas", "canvas"]);

        if (el) {
          const hasChildFillOrBg = Array.from(el.children).some(c => {
            const tag = (c.localName || c.tagName || "").toLowerCase();
            return tag.endsWith("fill") || tag.endsWith("background");
          });

          if (!hasChildFillOrBg) {
            const tag = (el.localName || el.tagName || "").toLowerCase();
            if (tag === "border" || tag === "canvas") {
              el.setAttribute("Background", color);
            } else {
              el.setAttribute("Fill", color);
            }
          }
        }
      };

      findAndFill("MainBar", data.primaryColor);
      findAndFill("AccentBar", data.accentColor);
      findAndFill("BadgeBorder", data.badgeBgColor);
    };

    updateTextBlock("Title", data.gcTitle);
    updateTextBlock("Description", data.gcSubtitle);
    updateTextBlock("Badge", data.gcBadge);
    updateTextBlock("HomeTeam", data.homeTeam);
    updateTextBlock("AwayTeam", data.awayTeam);
    updateTextBlock("Score", data.score);
    updateTextBlock("Clock", data.clock);
    updateTextBlock("RodadaText", data.roundText);

    const getXamlSource = (url: string) => {
      if (!url || url.startsWith("data:")) return "logo.png";
      return url;
    };

    if (data.hasLogo && data.logoUrl) {
      if (data.layoutStyle === "esportes") {
        const homeName = data.homeLogoName || "HomeLogo";
        const awayName = data.awayLogoName || "AwayLogo";
        
        const images = Array.from(doc.getElementsByTagName("Image"));
        
        let homeImg = findNodeByName(homeName, ["Image", "image"]) || images[0];
        if (homeImg) {
          homeImg.setAttribute("x:Name", homeName);
          homeImg.setAttribute("Source", getXamlSource(data.logoUrl));
        }
        
        let awayImg = findNodeByName(awayName, ["Image", "image"]) || (images.length > 1 ? images[1] : null);
        if (awayImg) {
          awayImg.setAttribute("x:Name", awayName);
          awayImg.setAttribute("Source", getXamlSource(data.logoUrl));
        }
      } else {
        const logoName = data.logoName || "Logo";
        const images = Array.from(doc.getElementsByTagName("Image"));
        let mainImg = findNodeByName(logoName, ["Image", "image"]) || images[0];
        if (mainImg) {
          mainImg.setAttribute("x:Name", logoName);
          mainImg.setAttribute("Source", getXamlSource(data.logoUrl));
        } else {
          // If no Image element exists in the XAML, create and append one dynamically
          const canvases = Array.from(doc.getElementsByTagName("Canvas"));
          const rootCanvas = canvases.find(c => {
            const name = (c.getAttribute("x:Name") || c.getAttribute("Name") || "").toLowerCase();
            return name === "gcgroup" || name === "placargroup";
          }) || canvases[0];

          if (rootCanvas) {
            const newImg = doc.createElementNS("http://schemas.microsoft.com/winfx/2006/xaml/presentation", "Image");
            newImg.setAttribute("x:Name", logoName);
            newImg.setAttribute("Canvas.Left", "30");
            newImg.setAttribute("Canvas.Top", "25");
            newImg.setAttribute("Width", "120");
            newImg.setAttribute("Height", "120");
            newImg.setAttribute("Source", "logo.png");
            newImg.setAttribute("Stretch", "Uniform");
            rootCanvas.appendChild(newImg);
          }
        }
      }
    }

    updateElementColors();

    const serializer = new XMLSerializer();
    return sanitizeXaml(serializer.serializeToString(doc));
  } catch (err) {
    console.error("Error updating XAML with state:", err);
    return xamlString;
  }
}

export function renderXamlElements(xamlString: string, defaultLogoUrl?: string): React.ReactNode {
  if (!xamlString) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xamlString, "application/xml");
    
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      console.warn("XAML XML Parse Error, using fallback layout rendering.");
      return null;
    }

    const rootElement = doc.documentElement;
    if (!rootElement) return null;

    const renderNode = (node: Element, index: number, isInsideStackPanel = false): React.ReactNode => {
      const tag = (node.localName || node.tagName || "").toLowerCase();
      const getAttr = (name: string) => {
        return node.getAttribute(name) || node.getAttribute(`Canvas.${name}`) || node.getAttribute(`x:${name}`) || "";
      };

      const left = parseFloat(getAttr("Left") || "0");
      const top = parseFloat(getAttr("Top") || "0");
      const width = getAttr("Width") ? parseFloat(getAttr("Width")) : undefined;
      const height = getAttr("Height") ? parseFloat(getAttr("Height")) : undefined;

      const vAlignAttr = getAttr("VerticalAlignment");
      const hAlignAttr = getAttr("HorizontalAlignment");
      const alignSelfMap: Record<string, string> = {
        Top: 'flex-start',
        Bottom: 'flex-end',
        Center: 'center',
        Stretch: 'stretch',
        Left: 'flex-start',
        Right: 'flex-end',
      };
      
      let alignSelf: string | undefined = undefined;
      if (isInsideStackPanel) {
        const parentOrientation = node.parentElement?.getAttribute("Orientation") || "Vertical";
        if (parentOrientation === "Horizontal") {
          if (vAlignAttr) alignSelf = alignSelfMap[vAlignAttr];
        } else {
          if (hAlignAttr) alignSelf = alignSelfMap[hAlignAttr];
        }
      }

      const baseStyle: React.CSSProperties = {
        position: isInsideStackPanel ? 'relative' : 'absolute',
        left: isInsideStackPanel ? undefined : `${left}px`,
        top: isInsideStackPanel ? undefined : `${top}px`,
        width: width !== undefined ? `${width}px` : 'auto',
        height: height !== undefined ? `${height}px` : 'auto',
        alignSelf,
      };

      const parseWpfColor = (color: string) => {
        if (!color) return "transparent";
        if (color.startsWith("#")) {
          const clean = color.replace("#", "");
          if (clean.length === 8) {
            const a = parseInt(clean.substring(0, 2), 16) / 255;
            const r = parseInt(clean.substring(2, 4), 16);
            const g = parseInt(clean.substring(4, 6), 16);
            const b = parseInt(clean.substring(6, 8), 16);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
          }
          if (clean.length === 6) {
            return `#${clean}`;
          }
        }
        return color;
      };

      const getBackground = (el: Element) => {
        const fillAttr = el.getAttribute("Fill") || el.getAttribute("Background");
        if (fillAttr) {
          return parseWpfColor(fillAttr);
        }
        
        const children = Array.from(el.children);
        const fillChild = children.find(c => {
          const name = (c.localName || c.tagName || "").toLowerCase();
          return name.endsWith(".fill") || name.endsWith(".background");
        });
        if (fillChild && fillChild.firstElementChild) {
          const brush = fillChild.firstElementChild;
          const brushName = (brush.localName || brush.tagName || "").toLowerCase();
          if (brushName === "solidcolorbrush") {
            return parseWpfColor(brush.getAttribute("Color") || "");
          }
          if (brushName === "lineargradientbrush") {
            const startPoint = brush.getAttribute("StartPoint") || "0,0";
            const endPoint = brush.getAttribute("EndPoint") || "1,0";
            let angle = "90deg";
            try {
              const startParts = startPoint.split(",");
              const endParts = endPoint.split(",");
              if (startParts.length === 2 && endParts.length === 2) {
                const startX = parseFloat(startParts[0]);
                const startY = parseFloat(startParts[1]);
                const endX = parseFloat(endParts[0]);
                const endY = parseFloat(endParts[1]);
                if (!isNaN(startX) && !isNaN(startY) && !isNaN(endX) && !isNaN(endY)) {
                  if (startX === endX && startY !== endY) {
                    angle = "180deg";
                  } else if (startY === endY && startX !== endX) {
                    angle = "90deg";
                  } else {
                    const dy = endY - startY;
                    const dx = endX - startX;
                    const rad = Math.atan2(dy, dx);
                    const deg = Math.round(rad * (180 / Math.PI));
                    angle = `${deg}deg`;
                  }
                }
              }
            } catch (err) {
              console.warn("Error parsing StartPoint/EndPoint for LinearGradientBrush:", err);
            }

            const stops = Array.from(brush.getElementsByTagName("GradientStop"));
            const cssStops = stops.map(stop => {
              const color = parseWpfColor(stop.getAttribute("Color") || "#ffffff");
              const offset = parseFloat(stop.getAttribute("Offset") || "0") * 100;
              return `${color} ${offset}%`;
            }).join(", ");
            return `linear-gradient(${angle}, ${cssStops})`;
          }
        }
        return "transparent";
      };

      const parsePadding = (val: string) => {
        if (!val) return "0px";
        const parts = val.split(",").map(p => p.trim());
        if (parts.length === 4) {
          return `${parts[1]}px ${parts[2]}px ${parts[3]}px ${parts[0]}px`;
        }
        if (parts.length === 2) {
          return `${parts[1]}px ${parts[0]}px`;
        }
        return `${val}px`;
      };

      const parseBorderThickness = (val: string) => {
        if (!val) return "0px";
        const parts = val.split(",").map(p => p.trim());
        if (parts.length === 4) {
          return `${parts[1]}px ${parts[2]}px ${parts[3]}px ${parts[0]}px`;
        }
        return `${val}px`;
      };

      const parseMargin = (val: string) => {
        if (!val) return undefined;
        const parts = val.split(",").map(p => p.trim());
        if (parts.length === 4) {
          return `${parts[1]}px ${parts[2]}px ${parts[3]}px ${parts[0]}px`;
        }
        return `${val}px`;
      };

      const getFontWeight = (val: string) => {
        if (!val) return "normal";
        const lower = val.toLowerCase();
        if (lower === "bold") return "bold";
        if (lower === "semibold" || lower === "demibold") return "600";
        if (lower === "medium") return "500";
        if (lower === "black" || lower === "heavy") return "900";
        if (lower === "light") return "300";
        if (lower === "extrabold" || lower === "ultra") return "800";
        return "normal";
      };

      const margin = parseMargin(getAttr("Margin"));

      if (tag === "canvas" || tag === "grid" || tag === "usercontrol") {
        const bg = getBackground(node);
        return (
          <div key={index} style={{ ...baseStyle, backgroundColor: bg, margin }}>
            {Array.from(node.children)
              .filter(child => !child.localName.includes("."))
              .map((child, idx) => renderNode(child, idx, false))}
          </div>
        );
      }

      if (tag === "stackpanel") {
        const bg = getBackground(node);
        const orientation = getAttr("Orientation") || "Vertical";
        return (
          <div 
            key={index} 
            style={{ 
              ...baseStyle, 
              backgroundColor: bg,
              display: 'flex',
              flexDirection: orientation === "Horizontal" ? 'row' : 'column',
              margin,
              padding: parsePadding(getAttr("Padding")),
              boxSizing: 'border-box'
            }}
          >
            {Array.from(node.children)
              .filter(child => !child.localName.includes("."))
              .map((child, idx) => renderNode(child, idx, true))}
          </div>
        );
      }

      if (tag === "rectangle") {
        const bg = getBackground(node);
        const rx = getAttr("RadiusX") ? parseFloat(getAttr("RadiusX")) : 0;
        const ry = getAttr("RadiusY") ? parseFloat(getAttr("RadiusY")) : 0;
        const stroke = getAttr("Stroke");
        const strokeThickness = getAttr("StrokeThickness");
        
        return (
          <div 
            key={index} 
            style={{ 
              ...baseStyle, 
              backgroundColor: bg,
              borderRadius: rx > 0 ? `${rx}px` : undefined,
              borderWidth: strokeThickness ? parseBorderThickness(strokeThickness) : undefined,
              borderColor: stroke ? parseWpfColor(stroke) : "transparent",
              borderStyle: stroke ? "solid" : undefined,
              margin,
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }} 
          />
        );
      }

      if (tag === "border") {
        const bg = getBackground(node);
        const cr = getAttr("CornerRadius") ? parseFloat(getAttr("CornerRadius")) : 0;
        const padding = parsePadding(getAttr("Padding"));
        const borderBrush = getAttr("BorderBrush");
        const borderThickness = getAttr("BorderThickness");
        
        return (
          <div 
            key={index} 
            style={{ 
              ...baseStyle, 
              backgroundColor: bg,
              borderRadius: cr > 0 ? `${cr}px` : undefined,
              borderWidth: borderThickness ? parseBorderThickness(borderThickness) : undefined,
              borderColor: borderBrush ? parseWpfColor(borderBrush) : "transparent",
              borderStyle: borderThickness ? "solid" : undefined,
              padding: padding,
              margin,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {Array.from(node.children)
              .filter(child => !child.localName.includes("."))
              .map((child, idx) => renderNode(child, idx, false))}
          </div>
        );
      }

      if (tag === "textblock") {
        const text = getAttr("Text") || node.textContent || "";
        const fg = parseWpfColor(getAttr("Foreground") || "#ffffff");
        const fontSize = getAttr("FontSize") ? parseFloat(getAttr("FontSize")) : 14;
        const fontWeight = getAttr("FontWeight") || "normal";
        const rawFontFamily = getAttr("FontFamily") || "sans-serif";
        const fontFamily = sanitizeFontFamily(rawFontFamily);
        const vAlign = getAttr("VerticalAlignment") || "Stretch";
        const hAlign = getAttr("TextAlignment") || "Left";

        const alignMap: Record<string, string> = {
          Center: 'center',
          Left: 'flex-start',
          Right: 'flex-end',
          Stretch: 'stretch'
        };

        const cssVAlign = alignMap[vAlign] || 'center';
        const cssHAlign = alignMap[hAlign] || 'flex-start';

        return (
          <div 
            key={index} 
            style={{ 
              ...baseStyle, 
              color: fg,
              fontSize: `${fontSize}px`,
              fontWeight: getFontWeight(fontWeight),
              fontFamily: `${fontFamily}, sans-serif`,
              display: 'flex',
              alignItems: cssVAlign,
              justifyContent: cssHAlign,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin
            }}
          >
            {text}
          </div>
        );
      }

      if (tag === "image") {
        let src = getAttr("Source");
        if ((!src || src === "logo.png" || src.startsWith("images/")) && defaultLogoUrl) {
          src = defaultLogoUrl;
        }
        
        return (
          <img 
            key={index} 
            src={src || defaultLogoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80"} 
            alt="GC Logo / Image" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80";
            }}
            style={{ 
              ...baseStyle, 
              objectFit: 'contain',
              margin
            }} 
          />
        );
      }

      return (
        <div key={index} style={baseStyle}>
          {Array.from(node.children)
            .filter(child => !child.localName.includes("."))
            .map((child, idx) => renderNode(child, idx, isInsideStackPanel))}
        </div>
      );
    };

    return Array.from(rootElement.children)
      .filter(child => !child.localName.includes("."))
      .map((child, idx) => renderNode(child, idx));

  } catch (err) {
    console.error("Error parsing XAML elements for live preview:", err);
    return null;
  }
}

export function sanitizeFontFamily(family: string): string {
  if (!family) return "Arial";
  
  // Strip quotes
  let clean = family.replace(/["']/g, "").trim();

  // Strip weight/style words that shouldn't be inside FontFamily attribute in WPF/vMix/GT
  clean = clean.replace(/\b(?:SemiBold|Bold|ExtraBold|UltraBold|Medium|Light|Thin|Black|Heavy|Regular|Italic|Condensed|Oblique|Semi|Extra|Ultra)\b/gi, "").trim();
  
  // Clean whitespace/punctuation
  clean = clean.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
  
  // Map of safe, standard broadcast fonts present on virtually all Windows/vMix machines
  const safeFontsMap: Record<string, string> = {
    "arial": "Arial",
    "montserrat": "Montserrat",
    "segoe ui": "Segoe UI",
    "segoe": "Segoe UI",
    "trebuchet ms": "Trebuchet MS",
    "trebuchet": "Trebuchet MS",
    "verdana": "Verdana",
    "tahoma": "Tahoma",
    "consolas": "Consolas",
    "impact": "Impact",
    "calibri": "Calibri",
    "courier new": "Courier New",
    "times new roman": "Times New Roman",
    "helvetica": "Arial",
    "sans-serif": "Arial"
  };

  const lower = clean.toLowerCase();
  if (safeFontsMap[lower]) {
    return safeFontsMap[lower];
  }
  
  // If font is non-standard or missing (e.g., Vaalo, Geist, Inter, etc.), fallback to safe standard broadcast font
  return "Arial";
}

export function sanitizeXaml(xaml: string): string {
  if (!xaml) return "";
  let clean = xaml.trim();

  // Strip markdown block markers if Gemini returned them inside the string
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }

  // Strip XML declaration headers if present so vMix XAML reader starts directly with <Canvas
  clean = clean.replace(/^<\?xml[^>]*\?>\s*/i, "");

  // 1. Remove HitTestVisible and IsHitTestVisible (with optional namespace/prefixes like Border.HitTestVisible, x:HitTestVisible, etc.)
  clean = clean.replace(/\s*(?:[a-zA-Z0-9_:]+\.)?(?:Is)?HitTestVisible\s*=\s*"[^"]*"/gi, "");

  // 2. Remove Focusable
  clean = clean.replace(/\s*(?:[a-zA-Z0-9_:]+\.)?Focusable\s*=\s*"[^"]*"/gi, "");

  // 3. Remove .Effect blocks (e.g., <Rectangle.Effect> ... </Rectangle.Effect> or <Border.Effect> ... </Border.Effect>)
  clean = clean.replace(/<[a-zA-Z0-9_:]+\.Effect>[\s\S]*?<\/[a-zA-Z0-9_:]+\.Effect>/gi, "");

  // 4. Remove standalone or paired DropShadowEffect or BlurEffect elements
  clean = clean.replace(/<(?:DropShadowEffect|BlurEffect)[^>]*\/>/gi, "");
  clean = clean.replace(/<(?:DropShadowEffect|BlurEffect)[\s\S]*?<\/(?:DropShadowEffect|BlurEffect)>/gi, "");

  // 5. Remove DoubleAnimation EasingFunctions (CubicEase, PowerEase, etc.) as they are not supported in basic vMix WPF parser and crash/fail
  clean = clean.replace(/<DoubleAnimation\.EasingFunction>[\s\S]*?<\/DoubleAnimation\.EasingFunction>/gi, "");

  // 6. Ensure the root <Canvas> tag has Background="Transparent" for proper transparency over live video in vMix!
  if (/<Canvas\s+[^>]*?Background\s*=\s*"/i.test(clean)) {
    clean = clean.replace(/(<Canvas\s+[^>]*?)Background\s*=\s*"[^"]*"/i, '$1Background="Transparent"');
  } else {
    clean = clean.replace(/(<Canvas\s+)/i, '$1Background="Transparent" ');
  }

  // 7. Remove CharacterSpacing attribute (not supported in WPF TextBlock, causes errors/crashes in vMix)
  clean = clean.replace(/\s*(?:[a-zA-Z0-9_:]+\.)?CharacterSpacing\s*=\s*"[^"]*"/gi, "");

  // 8. Sanitize FontFamily attribute to ensure standard Windows/vMix font family (stripping Vaalo, SemiBold, etc.)
  clean = clean.replace(/\s*(?:[a-zA-Z0-9_:]+\.)?FontFamily\s*=\s*"([^"]*)"/gi, (_, fontVal) => {
    const safeFont = sanitizeFontFamily(fontVal);
    return ` FontFamily="${safeFont}"`;
  });

  return clean;
}

export function toGtCompatible(xaml: string): string {
  let clean = sanitizeXaml(xaml);
  // Remove all EventTriggers, Storyboards, DoubleAnimations, Canvas.Triggers to ensure 100% compatibility with GT Title Designer
  clean = clean.replace(/<Canvas\.Triggers>[\s\S]*?<\/Canvas\.Triggers>/gi, "");
  clean = clean.replace(/<Storyboard>[\s\S]*?<\/Storyboard>/gi, "");
  clean = clean.replace(/<DoubleAnimation[^>]*\/>/gi, "");
  return clean;
}

function formatGtColor(colorStr: string): string {
  if (!colorStr) return "#FFFFFFFF";
  let c = colorStr.trim();
  if (c.toLowerCase() === "white") return "#FFFFFFFF";
  if (c.toLowerCase() === "black") return "#FF000000";
  if (c.toLowerCase() === "transparent") return "#00FFFFFF";
  if (c.startsWith("#")) {
    const clean = c.replace("#", "");
    if (clean.length === 6) {
      return `#FF${clean.toUpperCase()}`;
    }
    if (clean.length === 8) {
      return `#${clean.toUpperCase()}`;
    }
  }
  return "#FFFFFFFF";
}

export function wpfToGtXml(wpfXaml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(wpfXaml, "text/xml");
    
    let gtXml = `<?xml version="1.0" encoding="utf-8"?>\n<Composition Width="1920" Height="1080">\n`;
    gtXml += `  <Layer Name="Zion_GT_Layer" Dimensions="1920,1080,0" Location="0,0,0" Locked="False">\n`;
    gtXml += `    <Layer.Composition>\n`;
    gtXml += `      <Composition Width="1920" Height="1080">\n`;
    
    const findElements = (parent: Element, defaultLeft = 0, defaultTop = 0): string => {
      let elementsStr = "";
      
      Array.from(parent.childNodes).forEach((node) => {
        if (node.nodeType !== 1) return;
        const el = node as Element;
        const tagName = (el.localName || el.tagName || "").toLowerCase();
        
        let left = parseFloat(el.getAttribute("Canvas.Left") || el.getAttribute("left") || "0") + defaultLeft;
        let top = parseFloat(el.getAttribute("Canvas.Top") || el.getAttribute("top") || "0") + defaultTop;
        
        const name = el.getAttribute("x:Name") || el.getAttribute("Name") || (tagName + "_" + Math.floor(Math.random() * 10000));
        
        if (tagName === "canvas") {
          elementsStr += findElements(el, left, top);
        } else if (tagName === "rectangle") {
          const width = el.getAttribute("Width") || "100";
          const height = el.getAttribute("Height") || "100";
          
          let fill = el.getAttribute("Fill") || "";
          let stroke = el.getAttribute("Stroke") || "";
          
          const fillNode = Array.from(el.children).find(c => (c.localName || c.tagName || "").toLowerCase().endsWith("fill"));
          if (fillNode) {
            const solidBrush = Array.from(fillNode.children).find(c => (c.localName || c.tagName || "").toLowerCase() === "solidcolorbrush");
            const gradBrush = Array.from(fillNode.children).find(c => (c.localName || c.tagName || "").toLowerCase() === "lineargradientbrush");
            if (solidBrush && solidBrush.getAttribute("Color")) {
              fill = solidBrush.getAttribute("Color") || "";
            } else if (gradBrush) {
              const firstStop = Array.from(gradBrush.children).find(c => (c.localName || c.tagName || "").toLowerCase() === "gradientstop");
              if (firstStop) {
                fill = firstStop.getAttribute("Color") || "";
              }
            }
          }
          
          const gtFill = formatGtColor(fill || "#FF0284C7");
          const gtStroke = formatGtColor(stroke || "transparent");
          
          elementsStr += `        <Rectangle Name="${name}" Dimensions="${width},${height},0" Location="${left},${top},0">\n`;
          elementsStr += `          <Rectangle.Fill>\n            <Brush Color="${gtFill}" />\n          </Rectangle.Fill>\n`;
          elementsStr += `          <Rectangle.Stroke>\n            <Brush Color="${gtStroke}" />\n          </Rectangle.Stroke>\n`;
          elementsStr += `        </Rectangle>\n`;
        } else if (tagName === "border") {
          const width = el.getAttribute("Width") || "150";
          const height = el.getAttribute("Height") || "45";
          let background = el.getAttribute("Background") || "";
          
          const bgNode = Array.from(el.children).find(c => (c.localName || c.tagName || "").toLowerCase().endsWith("background"));
          if (bgNode) {
            const solidBrush = Array.from(bgNode.children).find(c => (c.localName || c.tagName || "").toLowerCase() === "solidcolorbrush");
            if (solidBrush && solidBrush.getAttribute("Color")) {
              background = solidBrush.getAttribute("Color") || "";
            }
          }
          
          const gtBg = formatGtColor(background || "#FFEF4444");
          
          elementsStr += `        <Rectangle Name="${name}_Bg" Dimensions="${width},${height},0" Location="${left},${top},0">\n`;
          elementsStr += `          <Rectangle.Fill>\n            <Brush Color="${gtBg}" />\n          </Rectangle.Fill>\n`;
          elementsStr += `          <Rectangle.Stroke>\n            <Brush Color="#00FFFFFF" />\n          </Rectangle.Stroke>\n`;
          elementsStr += `        </Rectangle>\n`;
          
          elementsStr += findElements(el, left, top);
        } else if (tagName === "textblock") {
          const width = el.getAttribute("Width") || "600";
          const height = el.getAttribute("Height") || "60";
          const text = el.getAttribute("Text") || el.textContent || "";
          const fontSize = el.getAttribute("FontSize") || "24";
          const fontWeight = el.getAttribute("FontWeight") || "Bold";
          const rawFontFamily = el.getAttribute("FontFamily") || "Arial";
          const fontFamily = sanitizeFontFamily(rawFontFamily);
          let foreground = el.getAttribute("Foreground") || "";
          
          const fgNode = Array.from(el.children).find(c => (c.localName || c.tagName || "").toLowerCase().endsWith("foreground"));
          if (fgNode) {
            const solidBrush = Array.from(fgNode.children).find(c => (c.localName || c.tagName || "").toLowerCase() === "solidcolorbrush");
            if (solidBrush && solidBrush.getAttribute("Color")) {
              foreground = solidBrush.getAttribute("Color") || "";
            }
          }
          
          const gtFg = formatGtColor(foreground || "#FFFFFFFF");
          
          elementsStr += `        <TextBlock Name="${name}" Dimensions="${width},${height},0" Location="${left},${top},0" Text="${text.replace(/"/g, "&quot;")}" FontSize="${fontSize}" FontWeight="${fontWeight}" FontFamily="${fontFamily}" TextAlign="Left" VerticalAlign="Center">\n`;
          elementsStr += `          <TextBlock.Fill>\n            <Brush Color="${gtFg}" />\n          </TextBlock.Fill>\n`;
          elementsStr += `          <TextBlock.Stroke>\n            <Brush Color="#00FFFFFF" />\n          </TextBlock.Stroke>\n`;
          elementsStr += `        </TextBlock>\n`;
        } else if (tagName === "image") {
          const width = el.getAttribute("Width") || "100";
          const height = el.getAttribute("Height") || "100";
          const source = el.getAttribute("Source") || "";
          
          elementsStr += `        <Image Name="${name}" Dimensions="${width},${height},0" Location="${left},${top},0" Source="${source.replace(/"/g, "&quot;")}" />\n`;
        }
      });
      
      return elementsStr;
    };
    
    const mainCanvas = doc.querySelector("Canvas, canvas");
    if (mainCanvas) {
      gtXml += findElements(mainCanvas);
    }
    
    gtXml += `      </Composition>\n`;
    gtXml += `    </Layer.Composition>\n`;
    gtXml += `  </Layer>\n`;
    
    gtXml += `  <Storyboard>\n    <Storyboard.Animations>\n      <Reveal Object="Zion_GT_Layer" Interpolation="CubicEasingInOut" />\n    </Storyboard.Animations>\n  </Storyboard>\n`;
    gtXml += `  <Storyboard Type="TransitionOut">\n    <Storyboard.Animations>\n      <Reveal Object="Zion_GT_Layer" Interpolation="CubicEasingInOut" />\n    </Storyboard.Animations>\n  </Storyboard>\n`;
    gtXml += `</Composition>`;
    
    return gtXml;
  } catch (err) {
    console.error("Erro ao converter para GT XML:", err);
    return `<?xml version="1.0" encoding="utf-8"?>\n<Composition Width="1920" Height="1080" />`;
  }
}

export function generateVmixXamlCode(data: GcScanData): string {
  if (data.generatedXaml) {
    return sanitizeXaml(updateXamlWithState(data.generatedXaml, data));
  }

  // Convert hex color to WPF ARGB format (e.g. #0284c7 -> #FF0284C7)
  const toWpfColor = (hex: string, alphaHex = "FF") => {
    if (!hex) return "#FFFFFFFF";
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map(c => c + c).join("");
    }
    if (clean.length === 6) {
      return `#${alphaHex}${clean.toUpperCase()}`;
    }
    if (clean.length === 8) {
      return `#${clean.toUpperCase()}`;
    }
    return "#FFFFFFFF";
  };

  const primaryWpf = toWpfColor(data.primaryColor || "#0284c7");
  const secondaryWpf = toWpfColor(data.secondaryColor || "#0f172a");
  const accentWpf = toWpfColor(data.accentColor || "#38bdf8");
  const textWpf = toWpfColor(data.textColor || "#ffffff");
  const subtextWpf = toWpfColor(data.subtextColor || "#e0f2fe");
  const badgeBgWpf = toWpfColor(data.badgeBgColor || "#ef4444");
  const badgeTextWpf = toWpfColor(data.badgeTextColor || "#ffffff");

  // If Sports Placar Layout
  if (data.layoutStyle === "esportes") {
    return sanitizeXaml(`<Canvas xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Width="1920" Height="1080">
    <Canvas.Triggers>
        <EventTrigger RoutedEvent="Canvas.Loaded">
            <BeginStoryboard>
                <Storyboard>
                    <DoubleAnimation Storyboard.TargetName="PlacarGroup" Storyboard.TargetProperty="(Canvas.Top)" From="-300" To="100" Duration="0:0:0.6" />
                    <DoubleAnimation Storyboard.TargetName="PlacarGroup" Storyboard.TargetProperty="Opacity" From="0" To="1" Duration="0:0:0.4"/>
                </Storyboard>
            </BeginStoryboard>
        </EventTrigger>
    </Canvas.Triggers>

    <!-- vMix Broadcast Scoreboard Overlay (Generated by Zion AI Studio) -->
    <Canvas x:Name="PlacarGroup" Canvas.Left="100" Canvas.Top="100">
        <!-- Header / Tournament Bar -->
        <Rectangle Width="550" Height="40" Fill="${primaryWpf}" RadiusX="4" RadiusY="4"/>
        <TextBlock x:Name="RodadaText" Text="${data.roundText || "03ª RODADA | CAMPEONATO BRASILEIRO"}" FontSize="20" Foreground="${textWpf}" FontWeight="Bold" Canvas.Left="20" Canvas.Top="8" FontFamily="Montserrat"/>

        <!-- Clock Box -->
        <Rectangle Fill="${secondaryWpf}" Width="180" Height="80" Canvas.Top="40"/>
        <TextBlock x:Name="Clock" Text="${data.clock || "1T | 45:00"}" FontSize="30" Foreground="${accentWpf}" FontWeight="Bold" Canvas.Left="20" Canvas.Top="62" FontFamily="Consolas"/>

        <!-- Scoreboard Main White Box -->
        <Rectangle Fill="#FFFFFFFF" Width="370" Height="80" Canvas.Left="180" Canvas.Top="40"/>
        <Rectangle Fill="${badgeBgWpf}" Width="6" Height="80" Canvas.Left="180" Canvas.Top="40"/>
        
        ${data.hasLogo && data.logoUrl ? `<Image x:Name="${data.homeLogoName || "HomeLogo"}" Canvas.Left="192" Canvas.Top="50" Width="45" Height="60" Source="${data.logoUrl}" Stretch="Uniform"/>` : ""}
        <TextBlock x:Name="HomeTeam" Text="${data.homeTeam || "INT"}" FontSize="35" Foreground="${secondaryWpf}" FontWeight="Bold" Canvas.Left="${data.hasLogo && data.logoUrl ? 245 : 210}" Canvas.Top="60" FontFamily="Montserrat"/>

        <!-- Score Box -->
        <Rectangle Fill="${secondaryWpf}" Width="90" Height="60" Canvas.Left="320" Canvas.Top="50" RadiusX="4" RadiusY="4"/>
        <TextBlock x:Name="Score" Text="${data.score || "0 | 1"}" FontSize="32" Foreground="${accentWpf}" FontWeight="Bold" Canvas.Left="332" Canvas.Top="60" FontFamily="Montserrat"/>

        <TextBlock x:Name="AwayTeam" Text="${data.awayTeam || "COR"}" FontSize="35" Foreground="${secondaryWpf}" FontWeight="Bold" Canvas.Left="430" Canvas.Top="60" FontFamily="Montserrat"/>
        ${data.hasLogo && data.logoUrl ? `<Image x:Name="${data.awayLogoName || "AwayLogo"}" Canvas.Left="500" Canvas.Top="50" Width="45" Height="60" Source="${data.logoUrl}" Stretch="Uniform"/>` : ""}
    </Canvas>
</Canvas>`);
  }

  // Lower Third / Jornalismo / Urgente / Clean
  const leftPos = data.hasLogo && data.logoUrl ? 170 : 120;
  const titleWidth = data.hasLogo && data.logoUrl ? 1530 : 1580;

  return sanitizeXaml(`<Canvas xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Width="1920" Height="1080">
    <Canvas.Triggers>
        <EventTrigger RoutedEvent="Canvas.Loaded">
            <BeginStoryboard>
                <Storyboard>
                    <DoubleAnimation Storyboard.TargetName="GcGroup" Storyboard.TargetProperty="(Canvas.Left)" From="-1200" To="80" Duration="0:0:0.6" />
                    <DoubleAnimation Storyboard.TargetName="GcGroup" Storyboard.TargetProperty="Opacity" From="0" To="1" Duration="0:0:0.4"/>
                </Storyboard>
            </BeginStoryboard>
        </EventTrigger>
    </Canvas.Triggers>

    <!-- vMix Broadcast Lower Third Overlay (Generated by Zion AI Studio) -->
    <Canvas x:Name="GcGroup" Canvas.Left="80" Canvas.Top="840">
        <!-- Main GC Graphic Container Bar -->
        <Rectangle x:Name="MainBar" Width="1760" Height="${data.barHeight || 170}" RadiusX="${data.barCornerRadius || 12}" RadiusY="${data.barCornerRadius || 12}">
            <Rectangle.Fill>
                <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                    <GradientStop Color="${primaryWpf}" Offset="0.0"/>
                    <GradientStop Color="${secondaryWpf}" Offset="1.0"/>
                </LinearGradientBrush>
            </Rectangle.Fill>
        </Rectangle>

        <!-- Accent Side Bar / Glowing Strip -->
        <Rectangle x:Name="AccentBar" Width="14" Height="${data.barHeight || 170}" RadiusX="6" RadiusY="6" Fill="${accentWpf}"/>
        ${data.hasLogo && data.logoUrl ? `\n        <!-- Logo Image (Editable in vMix Title Editor) -->\n        <Image x:Name="${data.logoName || "Logo"}" Canvas.Left="30" Canvas.Top="25" Width="120" Height="120" Source="${data.logoUrl}" Stretch="Uniform"/>` : ""}

        <!-- Top Badge / Live Tag Pill -->
        <Border x:Name="BadgeBorder" Canvas.Left="${leftPos}" Canvas.Top="-40" Background="${badgeBgWpf}" CornerRadius="6" Padding="16,6,16,6">
            <TextBlock x:Name="Badge" Text="${data.gcBadge || "AO VIVO"}" FontFamily="Montserrat" FontWeight="Bold" FontSize="20" Foreground="${badgeTextWpf}"/>
        </Border>

        <!-- Headline Principal -->
        <TextBlock x:Name="Title" Canvas.Left="${leftPos}" Canvas.Top="25" Width="${titleWidth}" Height="65" Text="${data.gcTitle || "CARLOS SILVA"}" FontFamily="Montserrat" FontWeight="Bold" FontSize="44" Foreground="${textWpf}" VerticalAlignment="Center" TextTrimming="CharacterEllipsis"/>

        <!-- Subheadline Secundário -->
        <TextBlock x:Name="Description" Canvas.Left="${leftPos}" Canvas.Top="95" Width="${titleWidth}" Height="50" Text="${data.gcSubtitle || "Entrevista Exclusiva"}" FontFamily="Arial" FontSize="26" Foreground="${subtextWpf}" VerticalAlignment="Center" TextTrimming="CharacterEllipsis"/>
    </Canvas>
</Canvas>`);
}

const defaultScanData: GcScanData = {
  gcTitle: "CARLOS SILVA",
  gcSubtitle: "Ministro da Economia • Entrevista Exclusiva",
  gcBadge: "AO VIVO",
  primaryColor: "#0284c7",
  secondaryColor: "#0f172a",
  accentColor: "#38bdf8",
  textColor: "#ffffff",
  subtextColor: "#e0f2fe",
  badgeBgColor: "#ef4444",
  badgeTextColor: "#ffffff",
  layoutStyle: "jornalismo",
  hasLogo: true,
  logoUrl: "https://api.iconify.design/lucide:tv.svg?color=%23ffffff",
  logoName: "Logo",
  homeLogoName: "HomeLogo",
  awayLogoName: "AwayLogo",
  homeTeam: "INT",
  awayTeam: "COR",
  score: "0 | 1",
  clock: "1T | 45:00",
  roundText: "03ª RODADA | CAMPEONATO BRASILEIRO",
  barHeight: 170,
  barCornerRadius: 12,
  barOpacity: 0.95,
  summary: "GC no estilo Jornalismo TV HD com tarja azul e badge vermelho 'AO VIVO'."
};

export const VmixXamlModal: React.FC<VmixXamlModalProps> = ({
  isOpen,
  onClose,
  imageBase64,
  customApiKey,
  showToast,
  selectedTemplateId,
  camadasTexto,
  additionalPrompt,
  promptCenario
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<GcScanData>(defaultScanData);
  const [activeTab, setActiveTab] = useState<"preview" | "xaml_code">("preview");
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

  const [containerWidth, setContainerWidth] = useState(1920);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [scanData.generatedXaml, isOpen, activeTab]);

  const scale = containerWidth / 1920;

  // Pre-fill parameters and trigger auto-scanning when modal is opened with a reference image
  useEffect(() => {
    if (isOpen) {
      const detectedStyle = autoDetectLayoutStyle(selectedTemplateId, camadasTexto, additionalPrompt, promptCenario);
      
      // Pull initial text from camadasTexto
      let title = "";
      let subtitle = "";
      let badge = "";
      
      if (camadasTexto && camadasTexto.length > 0) {
        const sorted = [...camadasTexto].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        // Find badge-like text
        const badgeItem = sorted.find(l => {
          const f = (l.funcao || "").toLowerCase();
          const c = (l.conteudo || "").toLowerCase();
          return f.includes("badge") || f.includes("tag") || c === "ao vivo" || c === "urgente";
        });
        if (badgeItem) badge = badgeItem.conteudo || "";
        
        const nonBadge = sorted.filter(l => l !== badgeItem);
        if (nonBadge.length > 0) title = nonBadge[0].conteudo || "";
        if (nonBadge.length > 1) subtitle = nonBadge[1].conteudo || "";
      }

      const initialLogo = imageBase64 || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop";

      setScanData({
        gcTitle: title || "Carlos Silva",
        gcSubtitle: subtitle || "Apresentador",
        gcBadge: badge || "AO VIVO",
        primaryColor: "#0284c7",
        secondaryColor: "#0f172a",
        accentColor: "#38bdf8",
        textColor: "#ffffff",
        subtextColor: "#e0f2fe",
        badgeBgColor: "#ef4444",
        badgeTextColor: "#ffffff",
        layoutStyle: detectedStyle,
        hasLogo: true,
        logoUrl: initialLogo,
        logoName: "Logo",
        homeLogoName: "HomeLogo",
        awayLogoName: "AwayLogo",
        homeTeam: "INT",
        awayTeam: "COR",
        score: "0 | 0",
        clock: "1T | 00:00",
        roundText: "RODADA | CAMPEONATO",
        barHeight: 170,
        barCornerRadius: 12,
        barOpacity: 0.95,
        summary: "Clique no botão 'Gerar GC via IA' para analisar a imagem e gerar o código.",
        generatedXaml: undefined
      });

      if (imageBase64) {
        handleScanImage(detectedStyle);
      }
    }
  }, [isOpen, selectedTemplateId, imageBase64]);

  const handleScanImage = async (styleHint?: any) => {
    if (!imageBase64) return;
    setIsScanning(true);
    showToast("Escanear referência com Visão Computacional Gemini...", "info");

    try {
      const hintStr = typeof styleHint === "string" ? styleHint : undefined;
      const hint = hintStr || autoDetectLayoutStyle(selectedTemplateId, camadasTexto, additionalPrompt, promptCenario);
      const res = await fetch("/api/scan-gc-to-xaml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64, 
          customApiKey,
          layoutStyleHint: hint
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao escanear GC.");
      }

      const data: GcScanData = await res.json();
      
      if (data.generatedXaml) {
        let cleanXaml = data.generatedXaml.trim();
        if (cleanXaml.startsWith("```")) {
          cleanXaml = cleanXaml.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
        }
        data.generatedXaml = cleanXaml;
      }

      setScanData(prev => ({
        ...prev,
        ...data,
        layoutStyle: (data.layoutStyle || hint || prev.layoutStyle) as "jornalismo" | "esportes" | "urgente" | "clean",
        hasLogo: data.hasLogo ?? prev.hasLogo ?? true,
        logoUrl: data.logoUrl || imageBase64 || prev.logoUrl
      }));
      showToast("Estrutura do GC escaneada e XAML gerado!", "success");
      handlePlayPreviewAnimation();
    } catch (e: any) {
      console.warn("Scan failed, using extracted defaults:", e.message);
      showToast(`Serviço temporário: ${e.message || "limite de cota"}. Geramos o GC localmente com as cores e textos corretos!`, "warning");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePlayPreviewAnimation = () => {
    setIsPlayingAnimation(true);
    setTimeout(() => {
      setIsPlayingAnimation(false);
    }, 1800);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setScanData(prev => ({
            ...prev,
            hasLogo: true,
            logoUrl: reader.result as string
          }));
          showToast("Logotipo aplicado no GC!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const xamlCode = generateVmixXamlCode(scanData);

  const handleDownloadWpfXaml = () => {
    let pureXaml = sanitizeXaml(xamlCode);
    if (pureXaml.startsWith("<?xml")) {
      pureXaml = pureXaml.replace(/^<\?xml[^>]*\?>\s*/i, "");
    }
    const blob = new Blob([pureXaml], { type: "application/xaml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const isSports = scanData.layoutStyle === "esportes";
    const filenamePrefix = isSports ? "PLACAR_vMix_Animado" : "GC_vMix_Animado";
    const cleanTitle = (scanData.gcTitle || scanData.homeTeam || "TV").replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `${filenamePrefix}_${cleanTitle}.xaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Arquivo XAML '${filenamePrefix}_${cleanTitle}.xaml' (com animação) baixado! Adicione no vMix.`, "success");
  };

  const handleDownloadGtZip = async () => {
    try {
      const gtXmlCode = wpfToGtXml(xamlCode);
      const zip = new JSZip();
      
      // GT Title Designer expects these files exactly at the root of the ZIP
      zip.file("document.xml", gtXmlCode);
      zip.file("resources.xml", `<resources />`);
      zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="text/xml" /><Default Extension="png" ContentType="image/png" /></Types>`);
      zip.file("thumbnail.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", { base64: true });
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      const isSports = scanData.layoutStyle === "esportes";
      const filenamePrefix = isSports ? "PLACAR_GT" : "GC_GT";
      const cleanTitle = (scanData.gcTitle || scanData.homeTeam || "TV").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${filenamePrefix}_${cleanTitle}.gtzip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Pacote nativo '${filenamePrefix}_${cleanTitle}.gtzip' criado com sucesso! Dê duplo-clique para abrir diretamente no GT Titulos ou vMix.`, "success");
    } catch (err: any) {
      console.error("Erro ao gerar GTZIP:", err);
      showToast(`Falha ao empacotar GTZIP: ${err.message}`, "error");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(xamlCode);
    setIsCopied(true);
    showToast("Código XAML copiado para a área de transferência!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#0a0a0c] border border-[#c5a880]/30 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-zinc-950 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center text-black font-extrabold">
              <Tv size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a880] bg-[#c5a880]/10 px-2 py-0.5 rounded border border-[#c5a880]/20">
                  GC APROVADO & MOTOR vMIX
                </span>
                {isScanning && (
                  <span className="text-[9px] font-bold text-sky-400 flex items-center gap-1 animate-pulse">
                    <Scan size={12} /> Escaneando Visão IA...
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
                Gerador de Arquivo .XAML para vMix (Canvas)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 gap-6">
          
          {/* Left Column: Image Reference & Scan Form */}
          <div className="md:col-span-5 space-y-5 flex flex-col">
            
            {/* Reference Image Box with Scan Effect */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-[#c5a880]" /> Imagem Gerada (Referência GC)
                </span>
                <button
                  onClick={handleScanImage}
                  disabled={isScanning}
                  className="text-[10px] text-[#c5a880] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isScanning ? "animate-spin" : ""} />
                  Re-escanear
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg group">
                {imageBase64 ? (
                  <img src={imageBase64} alt="GC Referência" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-xs">
                    Sem imagem de referência
                  </div>
                )}

                {/* Radar Scanning animation overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute top-0 animate-bounce shadow-[0_0_15px_#38bdf8]" />
                    <Scan size={32} className="text-sky-400 animate-spin" />
                    <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest bg-black/80 px-3 py-1 rounded-full border border-sky-400/30">
                      Analisando cores e fontes...
                    </span>
                  </div>
                )}
              </div>

              {/* HIGH-VISIBILITY MANUAL GENERATE BUTTON */}
              <button
                onClick={() => handleScanImage(scanData.layoutStyle)}
                disabled={isScanning}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-[#c5a880] hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl active:scale-98 disabled:opacity-50 border border-amber-400/20"
              >
                <Scan size={15} className={isScanning ? "animate-spin" : "animate-pulse"} />
                <span>{isScanning ? "IA Analisando & Gerando..." : "Gerar com Inteligência Artificial"}</span>
              </button>
            </div>

            {/* Extracted Parameters Editor */}
            <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl space-y-3.5 flex-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#c5a880]" /> Parâmetros do XAML
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase">Ajustável</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Layout Type (Defined Automatically) */}
                <div>
                  <label className="block text-[10px] font-black text-[#c5a880] uppercase mb-1 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#c5a880] animate-pulse" />
                    Modelo / Formato (Definido Automático)
                  </label>
                  <div className="w-full bg-[#18181b]/80 border border-[#c5a880]/30 rounded-lg px-3 py-2.5 text-white font-bold flex items-center justify-between">
                    <span className="capitalize">
                      {scanData.layoutStyle === "esportes" ? "Placar de Esportes / Placar" : 
                       scanData.layoutStyle === "urgente" ? "Alerta Urgente / Plantão" : 
                       scanData.layoutStyle === "clean" ? "Clean Minimalista" : "Jornalismo / Tarja Dupla"}
                    </span>
                    <span className="text-[9px] font-black bg-[#c5a880]/20 text-[#c5a880] px-2 py-0.5 rounded uppercase tracking-wider">IA DETECTOU</span>
                  </div>
                  <p className="text-[9.5px] text-zinc-500 mt-1">
                    ✓ Identificado e formatado automaticamente pela IA a partir do design da imagem.
                  </p>
                </div>

                {/* Conditional Inputs for Sports Placar */}
                {scanData.layoutStyle === "esportes" ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Texto da Rodada / Torneio (x:Name="RodadaText")</label>
                      <input
                        type="text"
                        value={scanData.roundText}
                        onChange={(e) => setScanData({ ...scanData, roundText: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Time Mandante (HomeTeam)</label>
                        <input
                          type="text"
                          value={scanData.homeTeam}
                          onChange={(e) => setScanData({ ...scanData, homeTeam: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Time Visitante (AwayTeam)</label>
                        <input
                          type="text"
                          value={scanData.awayTeam}
                          onChange={(e) => setScanData({ ...scanData, awayTeam: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Placar (x:Name="Score")</label>
                        <input
                          type="text"
                          value={scanData.score}
                          onChange={(e) => setScanData({ ...scanData, score: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Relógio / Tempo (x:Name="Clock")</label>
                        <input
                          type="text"
                          value={scanData.clock}
                          onChange={(e) => setScanData({ ...scanData, clock: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Standard Lower Third Inputs */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Título / Nome (x:Name="Title")</label>
                      <input
                        type="text"
                        value={scanData.gcTitle}
                        onChange={(e) => setScanData({ ...scanData, gcTitle: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subtítulo / Cargo (x:Name="Description")</label>
                      <input
                        type="text"
                        value={scanData.gcSubtitle}
                        onChange={(e) => setScanData({ ...scanData, gcSubtitle: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Badge / Tag (x:Name="Badge")</label>
                      <input
                        type="text"
                        value={scanData.gcBadge}
                        onChange={(e) => setScanData({ ...scanData, gcBadge: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </>
                )}

                {/* Logo Section */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-[#c5a880]" /> Exibir Logotipo no GC
                    </label>
                    <input
                      type="checkbox"
                      checked={scanData.hasLogo}
                      onChange={(e) => setScanData({ ...scanData, hasLogo: e.target.checked })}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-[#c5a880] focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {scanData.hasLogo && (
                    <>
                      <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-white/10">
                        {scanData.logoUrl ? (
                          <img src={scanData.logoUrl} alt="Logo GC" className="w-8 h-8 object-contain rounded bg-black/40 p-1 border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <ImageIcon size={14} />
                          </div>
                        )}
                        <label className="flex-1 py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded cursor-pointer transition-all flex items-center justify-center gap-1 border border-white/10">
                          <Upload size={11} />
                          <span>{scanData.logoUrl ? "Alterar Logo..." : "Carregar Logo..."}</span>
                          <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                        </label>
                      </div>

                      {/* Configuração do Nome do Campo para vMix */}
                      <div className="space-y-2 bg-zinc-950 p-2.5 rounded-lg border border-white/5 mt-2 animate-in slide-in-from-top-1 duration-200 text-xs">
                        {scanData.layoutStyle === "esportes" ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">ID da Imagem Mandante (vMix x:Name)</label>
                              <input
                                type="text"
                                value={scanData.homeLogoName || "HomeLogo"}
                                onChange={(e) => setScanData({ ...scanData, homeLogoName: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#c5a880]"
                                placeholder="HomeLogo"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">ID da Imagem Visitante (vMix x:Name)</label>
                              <input
                                type="text"
                                value={scanData.awayLogoName || "AwayLogo"}
                                onChange={(e) => setScanData({ ...scanData, awayLogoName: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#c5a880]"
                                placeholder="AwayLogo"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">ID da Imagem/Logo no vMix (x:Name)</label>
                            <input
                              type="text"
                              value={scanData.logoName || "Logo"}
                              onChange={(e) => setScanData({ ...scanData, logoName: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white font-medium focus:outline-none focus:border-[#c5a880]"
                              placeholder="Logo"
                            />
                          </div>
                        )}
                        <span className="block text-[8.5px] text-zinc-500 leading-tight">
                          *Este identificador cria a propriedade editável no Title Editor do vMix, permitindo trocar o logo em tempo real.
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Colors Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/5">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Cor Principal (Barra)</label>
                    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={scanData.primaryColor}
                        onChange={(e) => setScanData({ ...scanData, primaryColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-zinc-300">{scanData.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Cor Secundária (Fundo)</label>
                    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={scanData.secondaryColor}
                        onChange={(e) => setScanData({ ...scanData, secondaryColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-zinc-300">{scanData.secondaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Cor do Fundo do Badge</label>
                    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={scanData.badgeBgColor}
                        onChange={(e) => setScanData({ ...scanData, badgeBgColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-zinc-300">{scanData.badgeBgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Detalhe / Faixa Glow</label>
                    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={scanData.accentColor}
                        onChange={(e) => setScanData({ ...scanData, accentColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-zinc-300">{scanData.accentColor}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Preview & XAML Code */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            
            {/* Tab selector */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-[#c5a880] text-black shadow-md"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Play size={13} /> Prévia Interativa vMix
                </button>
                <button
                  onClick={() => setActiveTab("xaml_code")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "xaml_code"
                      ? "bg-[#c5a880] text-black shadow-md"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <FileCode size={13} /> Código .XAML WPF (Canvas)
                </button>
              </div>

              <button
                onClick={handlePlayPreviewAnimation}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
              >
                <Play size={12} className="fill-black" />
                <span>Animar Entrada</span>
              </button>
            </div>

            {/* TAB 1: PREVIEW */}
            {activeTab === "preview" && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="relative aspect-video w-full rounded-2xl border border-white/10 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 shadow-2xl flex flex-col justify-end p-4 sm:p-6">
                  
                  {/* Broadcast Screen Background Overlay simulation */}
                  <div className="absolute top-3 left-3 bg-black/70 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 z-10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    vMix Output Preview [1080p Canvas]
                  </div>

                  {/* Play preview watermark trigger button inside canvas */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={handlePlayPreviewAnimation}
                      className="px-2.5 py-1 bg-black/80 hover:bg-black border border-white/20 text-emerald-400 text-[10px] font-extrabold rounded-md flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Play size={11} className="fill-emerald-400" />
                      <span>{isPlayingAnimation ? "Executando..." : "Testar Animação"}</span>
                    </button>
                  </div>

                  {/* DYNAMIC OR SIMULATED GC OVERLAY */}
                  {(() => {
                    const elements = renderXamlElements(xamlCode, scanData.logoUrl);
                    if (elements) {
                      return (
                        <div className={`w-full h-full relative transition-all duration-700 ${isPlayingAnimation ? "animate-in zoom-in-95 duration-700" : ""}`}>
                          <div 
                            ref={containerRef} 
                            className="w-full h-full relative overflow-hidden"
                            style={{ minHeight: "200px" }}
                          >
                            <div 
                              style={{ 
                                width: 1920, 
                                height: 1080, 
                                transform: `scale(${scale})`, 
                                transformOrigin: 'top left', 
                                position: 'absolute', 
                                top: 0, 
                                left: 0,
                                pointerEvents: 'none'
                              }}
                            >
                              {elements}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Fallback to standard template if AI generation contains syntax/XML errors
                    const fallbackCode = generateVmixXamlCode({ ...scanData, generatedXaml: undefined });
                    const fallbackElements = renderXamlElements(fallbackCode, scanData.logoUrl);
                    return (
                      <div className={`w-full h-full relative transition-all duration-700 ${isPlayingAnimation ? "animate-in zoom-in-95 duration-700" : ""}`}>
                        <div 
                          ref={containerRef} 
                          className="w-full h-full relative overflow-hidden"
                          style={{ minHeight: "200px" }}
                        >
                          <div 
                            style={{ 
                              width: 1920, 
                              height: 1080, 
                              transform: `scale(${scale})`, 
                              transformOrigin: 'top left', 
                              position: 'absolute', 
                              top: 0, 
                              left: 0,
                              pointerEvents: 'none'
                            }}
                          >
                            {fallbackElements}
                          </div>
                        </div>
                        {scanData.generatedXaml && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider z-20 shadow-xl flex items-center gap-1">
                            <Info size={11} className="shrink-0" />
                            <span>Sintaxe Otimizada no Preview</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>

                <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Info size={12} className="text-[#c5a880]" /> Resumo Técnico do GC:
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {scanData.summary || "Gerador de Caracteres escaneado com sucesso. O arquivo XAML gerado usa o elemento raiz <Canvas> compatível com o vMix e inclui animação nativa WPF."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: XAML CODE */}
            {activeTab === "xaml_code" && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-zinc-400">
                  <span>Estrutura WPF XAML Root Canvas (vMix Title)</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] cursor-pointer transition-all"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isCopied ? "Copiado!" : "Copiar Código"}</span>
                  </button>
                </div>

                <pre className="p-4 bg-zinc-950 border border-white/10 rounded-xl text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-[280px] custom-scrollbar select-text">
                  {xamlCode}
                </pre>
              </div>
            )}

            {/* vMix How-To Instructions Box */}
            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Tv size={13} /> GUIA DE IMPORTAÇÃO vMIX E GT TITULOS:
              </span>
              <div className="space-y-2.5 text-[11px] leading-relaxed text-zinc-300">
                <div>
                  <p className="font-extrabold text-amber-300 uppercase text-[9.5px] tracking-wider mb-0.5">Opção A: No GT Title Designer / GT Titulos (Recomendado para Edição Visual)</p>
                  <p className="text-zinc-400">
                    Baixe o pacote pelo botão <strong className="text-white">"Baixar para GT Titulos (.gtzip)"</strong>. No GT Title Designer, vá em <strong className="text-amber-400">File &gt; Open</strong> e selecione o arquivo baixado. Ele abrirá instantaneamente sem erros de renderização ou tela preta!
                  </p>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <p className="font-extrabold text-amber-300 uppercase text-[9.5px] tracking-wider mb-0.5">Opção B: Entrada Direta de XAML no vMix (Com Animações de Entrada)</p>
                  <p className="text-zinc-400">
                    Baixe pelo botão <strong className="text-white">"Baixar vMix Animado"</strong>. No vMix, clique em <strong className="text-amber-400">Adicionar Entrada (Add Input) &gt; Título/XAML &gt; Procurar (Browse)</strong> e selecione-o. O vMix aplicará a animação WPF e o fundo transparente automaticamente!
                  </p>
                </div>
              </div>
            </div>

            {/* Download Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadGtZip}
                  className="py-3.5 px-4 bg-gradient-to-r from-[#c5a880] to-[#e6cfb3] text-black font-black text-[11px] uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  <span>Baixar para GT Titulos (.gtzip)</span>
                </button>

                <button
                  onClick={handleDownloadWpfXaml}
                  className="py-3.5 px-4 bg-zinc-900 border border-amber-400/30 text-amber-400 font-black text-[11px] uppercase tracking-wider rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={14} className="animate-pulse" />
                  <span>Baixar vMix Animado</span>
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full py-2.5 bg-zinc-950 border border-white/5 text-zinc-400 font-bold text-[10.5px] uppercase tracking-wider rounded-lg hover:text-white hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={13} />
                <span>Copiar Código XAML Completo</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

