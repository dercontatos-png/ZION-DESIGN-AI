/**
 * Utility to extract dominant background colors and shade variations from an image in the browser
 */
export async function sampleImageBackgroundColors(imageSrc: string): Promise<{
  detectedColor: string;
  palette: string[];
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ detectedColor: "#192541", palette: ["#192541", "#0c1c33", "#15213e", "#0f172a", "#000000", "#ffffff"] });
        }
        canvas.width = Math.min(img.naturalWidth || img.width, 400);
        canvas.height = Math.min(img.naturalHeight || img.height, 400);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const samples: [number, number, number][] = [];

        // Sample upper background zone (avoiding text & subjects in the center)
        for (let y = 10; y < Math.min(55, canvas.height); y += 3) {
          for (let x = 10; x < Math.min(120, canvas.width); x += 3) {
            const idx = (y * canvas.width + x) * 4;
            samples.push([imgData[idx], imgData[idx + 1], imgData[idx + 2]]);
          }
        }

        const toHex = (r: number, g: number, b: number) =>
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

        if (samples.length === 0) {
          return resolve({ detectedColor: "#192541", palette: ["#192541", "#0c1c33", "#15213e", "#000000", "#ffffff"] });
        }

        const avgR = Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length);
        const avgG = Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length);
        const avgB = Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length);

        const detected = toHex(avgR, avgG, avgB);

        // Also sample top center and top right
        const topMidIdx = (15 * canvas.width + Math.floor(canvas.width / 2)) * 4;
        const topMidHex = toHex(imgData[topMidIdx], imgData[topMidIdx + 1], imgData[topMidIdx + 2]);

        const paletteSet = new Set<string>();
        paletteSet.add(detected);
        if (topMidHex && topMidHex !== detected) paletteSet.add(topMidHex);
        
        // Add common harmonious variations
        paletteSet.add("#0c1c33"); // Azul Marinho Profundo
        paletteSet.add("#15213e"); // Azul Noturno
        paletteSet.add("#192541"); // Azul Marinho EstÃƒÂºdio
        paletteSet.add("#0f172a"); // Slate 900
        paletteSet.add("#000000"); // Preto Puro
        paletteSet.add("#ffffff"); // Branco Puro

        resolve({
          detectedColor: detected,
          palette: Array.from(paletteSet).slice(0, 6)
        });
      } catch (err) {
        resolve({ detectedColor: "#192541", palette: ["#192541", "#0c1c33", "#15213e", "#000000", "#ffffff"] });
      }
    };
    img.onerror = () => {
      resolve({ detectedColor: "#192541", palette: ["#192541", "#0c1c33", "#15213e", "#000000", "#ffffff"] });
    };
    img.src = imageSrc;
  });
}
