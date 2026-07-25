import { fixSolidBackground } from './server.ts';
import fs from "fs";
async function run() {
  const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  try {
    const res = await fixSolidBackground(base64, "#ffffff");
    console.log("Result length:", res.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
