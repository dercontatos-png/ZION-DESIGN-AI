/**
 * Utility functions for canonical image identification and deduplication across
 * all builders (Hydra, DesignBuilder, RefBuilder, OrionPro, Enhance, Galeria).
 */

export function extractCanonicalImageId(urlOrFilename: string): string {
  if (!urlOrFilename || typeof urlOrFilename !== "string") return "";

  // 1. Try matching unique job / generation ID timestamp patterns:
  // e.g. "1790881305995_kauxm1o" or "1790881305995"
  const match = urlOrFilename.match(/(\d{13}(?:_[a-z0-9]+)?)/i);
  if (match) return match[1];

  // 2. Try matching UUID patterns
  const uuidMatch = urlOrFilename.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (uuidMatch) return uuidMatch[1];

  // 3. Fallback: normalize filename (strip directory, query params, 'img_' prefix and image extensions)
  const base = urlOrFilename.split("?")[0].split("/").pop() || urlOrFilename;
  const clean = base
    .replace(/^img_/i, "")
    .replace(/\.(png|jpe?g|webp|avif|gif|svg)$/i, "")
    .trim()
    .toLowerCase();

  return clean || urlOrFilename;
}

export function isSameImage(urlA: string, urlB: string): boolean {
  if (!urlA || !urlB) return false;
  if (urlA === urlB) return true;
  const idA = extractCanonicalImageId(urlA);
  const idB = extractCanonicalImageId(urlB);
  if (idA && idB && idA === idB) return true;
  return false;
}

export function deduplicateImageUrls(urls: string[]): string[] {
  if (!Array.isArray(urls)) return [];
  const seenCanonical = new Set<string>();
  const result: string[] = [];

  for (const u of urls) {
    if (!u || typeof u !== "string") continue;
    const cid = extractCanonicalImageId(u);
    if (!seenCanonical.has(cid)) {
      seenCanonical.add(cid);
      result.push(u);
    }
  }

  return result;
}

/**
 * Extracts a reliable epoch millisecond timestamp from an item, object, URL or filename.
 * Guarantees strict chronological sorting (newest first).
 */
export function extractImageTimestamp(item: any): number {
  if (!item) return 0;
  if (typeof item === "number" && item > 0) return item;
  if (typeof item === "string") {
    if (item.startsWith("data:") || item.startsWith("blob:")) return 0;
    const match = item.match(/(?:img_)?(\d{12,14})/);
    if (match && match[1]) {
      const v = parseInt(match[1], 10);
      if (v > 1672531199000 && v < 1900000000000) return v;
    }
    return 0;
  }
  if (typeof item.timestamp === "number" && item.timestamp > 0) return item.timestamp;
  if (typeof item.mtimeMs === "number" && item.mtimeMs > 0) return item.mtimeMs;

  const dateStr = item.created_at || item.createdAt || (typeof item.timestamp === "string" ? item.timestamp : null);
  if (dateStr && typeof dateStr === "string") {
    if (!dateStr.startsWith("2026-03-20")) {
      const parsed = new Date(dateStr).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  const idStr = String(item.id || item.filename || "");
  const idMatch = idStr.match(/(?:img_)?(\d{12,14})/);
  if (idMatch && idMatch[1]) {
    const val = parseInt(idMatch[1], 10);
    if (val > 1672531199000 && val < 1900000000000) return val;
  }

  const urlStr = String(item.result_url || item.thumbnail_url || item.url || "");
  if (urlStr && !urlStr.startsWith("data:") && !urlStr.startsWith("blob:")) {
    const urlMatch = urlStr.match(/(?:img_)?(\d{12,14})/);
    if (urlMatch && urlMatch[1]) {
      const val = parseInt(urlMatch[1], 10);
      if (val > 1672531199000 && val < 1900000000000) return val;
    }
  }

  return 0;
}

/**
 * Sorts any list of gallery items or URLs strictly in chronological order (newest first by default).
 */
export function sortImagesChronological<T>(items: T[], newestFirst = true): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const ta = extractImageTimestamp(a);
    const tb = extractImageTimestamp(b);
    if (tb !== ta) {
      return newestFirst ? tb - ta : ta - tb;
    }
    const idA = typeof a === "string" ? a : (a as any)?.id || "";
    const idB = typeof b === "string" ? b : (b as any)?.id || "";
    return idA.localeCompare(idB);
  });
}
