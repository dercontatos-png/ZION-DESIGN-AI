/**
 * Utility to downscale and compress base64 image strings client-side.
 * Prevents HTTP 413 (Payload Too Large) when uploading high-resolution reference photos.
 */
export async function optimizeBase64Image(
  base64Str: string,
  maxDimension: number = 1024,
  quality: number = 0.8,
  keepAlpha: boolean = false
): Promise<string> {
  if (!base64Str || typeof base64Str !== "string") return "";

  const isUrl = base64Str.startsWith("http://") || base64Str.startsWith("https://") || base64Str.startsWith("/") || base64Str.startsWith("./");
  const src = base64Str.startsWith("data:")
    ? base64Str
    : (isUrl ? base64Str : `data:image/jpeg;base64,${base64Str}`);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const exportPng = keepAlpha && src.startsWith("data:image/png");
      const compressedDataUrl = exportPng
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(base64Str);
    };

    img.src = src;
  });
}

export async function optimizeBase64List(
  list: string[] = [],
  maxDimension: number = 1024,
  quality: number = 0.8,
  keepAlpha: boolean = false
): Promise<string[]> {
  if (!Array.isArray(list) || list.length === 0) return [];
  return Promise.all(
    list.map((item) => optimizeBase64Image(item, maxDimension, quality, keepAlpha))
  );
}
