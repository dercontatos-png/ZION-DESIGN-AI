import sharp from "sharp";

export async function applyUpscaleAndRefinement(base64Image: string, targetSize: string): Promise<string> {
  // targetSize: "1K", "2K", "4K"
  const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return base64Image;

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) return base64Image;

  let targetWidth = metadata.width;
  let shouldUpscale = false;

  if (targetSize === "2K") {
    targetWidth = Math.max(metadata.width, 2048);
    if (metadata.width < 2000) shouldUpscale = true;
  } else if (targetSize === "4K") {
    targetWidth = Math.max(metadata.width, 3840);
    if (metadata.width < 3800) shouldUpscale = true;
  }

  if (!shouldUpscale) {
    // Return original image untouched
    return base64Image;
  }

  // Sharp process: high quality Lanczos3 resize with clean, non-destructive sharpening
  const processedBuffer = await sharp(buffer)
    .resize({ width: targetWidth, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8 }) // clean, subtle sharpening preserving text and edges
    .toBuffer();

  return `data:${mimeType};base64,${processedBuffer.toString("base64")}`;
}
