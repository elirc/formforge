import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const assetsDirectory = path.resolve("apps/web/dist/assets");
const files = await readdir(assetsDirectory);
const sizes = await Promise.all(files.map(async (file) => ({ file, bytes: (await stat(path.join(assetsDirectory, file))).size })));
const javascriptBytes = sizes.filter(({ file }) => file.endsWith(".js")).reduce((sum, { bytes }) => sum + bytes, 0);
const cssBytes = sizes.filter(({ file }) => file.endsWith(".css")).reduce((sum, { bytes }) => sum + bytes, 0);
const limits = { javascript: 450 * 1024, css: 30 * 1024 };

console.log(`Bundle budget: JS ${(javascriptBytes / 1024).toFixed(1)} KiB / 450 KiB; CSS ${(cssBytes / 1024).toFixed(1)} KiB / 30 KiB.`);
if (javascriptBytes > limits.javascript || cssBytes > limits.css) {
  throw new Error("Production assets exceed the documented raw bundle budget.");
}
