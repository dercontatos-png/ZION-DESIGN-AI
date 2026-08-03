import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Upscaler = require('upscaler/node');
const tf = require('@tensorflow/tfjs-node');

async function run() {
  const upscaler = new Upscaler();
  const tensor = tf.zeros([1, 1024, 1024, 3]); // 1K image
  console.log("Starting upscale 1K to 2K...");
  const start = Date.now();
  const out = await upscaler.upscale(tensor);
  console.log("Finished upscale in", Date.now() - start, "ms");
}
run().catch(console.error);
