/**
 * Helper utility to compress uploaded image files or base64 strings
 * to WebP/JPEG format with max dimension 1600px and 0.82 quality.
 * Prevents localStorage/IndexedDB quota overflow and speeds up network requests.
 */

export async function compressImageForStorage(
  fileOrBase64: File | string,
  maxDimension = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    let src = "";
    if (typeof fileOrBase64 === "string") {
      src = fileOrBase64;
      if (!src) return resolve("");
      if (src.startsWith("data:") && src.length < 200000) {
        return resolve(src);
      }
    } else if (fileOrBase64 instanceof File) {
      if (fileOrBase64.size < 150000) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
        return;
      }
      try {
        src = URL.createObjectURL(fileOrBase64);
      } catch (_) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
        return;
      }
    } else {
      return resolve("");
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let width = img.width || 800;
        let height = img.height || 600;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (src.startsWith("blob:")) URL.revokeObjectURL(src);
          return resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
        }

        ctx.drawImage(img, 0, 0, width, height);

        let compressedDataUrl = "";
        try {
          compressedDataUrl = canvas.toDataURL("image/webp", quality);
        } catch (_) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        resolve(compressedDataUrl || (typeof fileOrBase64 === "string" ? fileOrBase64 : ""));
      } catch (err) {
        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      }
    };

    img.onerror = () => {
      if (src.startsWith("blob:")) URL.revokeObjectURL(src);
      // Fallback to FileReader if blob URL fails on certain mobile webviews
      if (typeof fileOrBase64 !== "string" && fileOrBase64 instanceof File) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
      } else {
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      }
    };

    img.src = src;
  });
}
