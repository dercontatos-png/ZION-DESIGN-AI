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
