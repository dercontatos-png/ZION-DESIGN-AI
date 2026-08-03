import sharp from "sharp";
async function run() {
  try {
    const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    const pipeline = sharp(buffer)
      .median(5)
      .sharpen({ sigma: 2.0, m1: 1.5, m2: 0.8, x1: 2.0, y2: 10.0, y3: 20.0 });
    const out = await pipeline.toBuffer();
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
