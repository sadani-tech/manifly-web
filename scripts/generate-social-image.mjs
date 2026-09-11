import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markPath = path.join(root, "public", "brand", "manifly-mark.png");
const outputPath = path.join(root, "app", "opengraph-image.png");

const artwork = await sharp(markPath)
  .resize(330, 330, { fit: "contain" })
  .png()
  .toBuffer();

const copy = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <style>
      .brand { font: 700 92px Arial, sans-serif; fill: #f6f6f0; }
      .tagline { font: 500 38px Arial, sans-serif; fill: #c9f45a; }
      .description { font: 400 25px Arial, sans-serif; fill: #d7d7cf; }
    </style>
    <text x="505" y="245" class="brand">Manifly</text>
    <text x="505" y="310" class="tagline">Biar uang nggak asal terbang.</text>
    <text x="505" y="375" class="description">Lihat ke mana uangmu pergi.</text>
  </svg>
`);

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: "#151515",
  },
})
  .composite([
    {
      input: Buffer.from(
        '<svg width="420" height="420"><rect width="420" height="420" rx="84" fill="#ffffff"/></svg>',
      ),
      left: 55,
      top: 105,
    },
    { input: artwork, left: 100, top: 150 },
    { input: copy, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log("wrote app/opengraph-image.png (1200x630)");
