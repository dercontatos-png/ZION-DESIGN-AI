import sharp from "sharp";
async function run() {
  try {
    const pipeline = sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .median(5)
      .sharpen({ sigma: 2.0, m1: 1.5, m2: 0.8, x1: 2.0, y2: 10.0, y3: 20.0 });
    const out = await pipeline.toBuffer();
    console.log("Success with 1024x1024");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
