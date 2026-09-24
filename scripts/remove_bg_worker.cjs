const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!inputFile || !outputFile) {
    console.error('Usage: node remove_bg_worker.cjs <inputPath> <outputPath>');
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(inputFile);
    // Resize down to 1024 to avoid ONNX/GLib crashes
    const resizedBuffer = await sharp(buffer)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();

    const { removeBackground } = await import('@imgly/background-removal-node');
    const blob = new Blob([resizedBuffer], { type: 'image/png' });
    const resultBlob = await removeBackground(blob);
    const arrayBuffer = await resultBlob.arrayBuffer();
    fs.writeFileSync(outputFile, Buffer.from(arrayBuffer));
    process.exit(0);
  } catch (err) {
    console.error('Worker error:', err.message || err);
    process.exit(1);
  }
}

main();
