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

  // Sharp process:
  // 1. Resize using lanczos3 (high quality interpolation)
  // 2. mild median filter to remove color bugs / pixelation
  // 3. sharpen to bring back details (simulating RealESRGAN detail recovery)
  
  const processedBuffer = await sharp(buffer)
    .resize({ width: targetWidth, kernel: sharp.kernel.lanczos3 })
    .median(3) // removes pixel artifacts and color noise
    .sharpen({ sigma: 1.5, m1: 1.2, m2: 0.8, x1: 2.0, y2: 10.0, y3: 20.0 }) // strong unsharp mask for details
    .toBuffer();

  return `data:${mimeType};base64,${processedBuffer.toString("base64")}`;
}
