// Regenerate every Manifly brand asset from the source art that lives in
// the shared docs repo (`libraries/manifly-docs/manifly-icon/`).
//
//   npm run brand
//
// Outputs:
//   public/brand/manifly-mark.png        – square, transparent winged-banknote mark
//   public/brand/manifly-lockup.png      – vertical mark + wordmark + tagline
//   public/brand/manifly-wordmark-*.png  – horizontal lockups (color / mono / light)
//   public/icons/icon.svg                – PWA source (wraps the mark)
//   public/icons/icon-{192,512}.png      – regular PWA icons ("any")
//   public/icons/icon-maskable-{192,512}.png – Android adaptive icons
//   public/icons/apple-touch-icon.png    – iOS home-screen icon
//   app/favicon.ico                      – 16/32/48 browser-tab icon
//
// `sharp` is a devDependency so the pipeline stays self-contained.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.resolve(root, "..", "libraries", "manifly-docs", "manifly-icon");

const brandDir = path.join(root, "public", "brand");
const iconsDir = path.join(root, "public", "icons");

const NAVY = { r: 0x15, g: 0x15, b: 0x15, alpha: 1 }; // --brand-navy
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

function wrapSvg(base64) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title description">
  <title id="title">Manifly</title>
  <desc id="description">Manifly winged-banknote mark.</desc>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="512" height="512"/>
</svg>
`;
}

async function main() {
  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(iconsDir, { recursive: true });

  // 1. Core mark — trim the source, then re-pad to a square with a small
  //    inset so the artwork keeps breathing room at every render size.
  const trimmed = await sharp(path.join(src, "icon.png"))
    .trim({ threshold: 10 })
    .toBuffer();
  const markInner = await sharp(trimmed)
    .resize(452, 452, { fit: "contain", background: TRANSPARENT })
    .toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: markInner, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(brandDir, "manifly-mark.png"));
  const mark = await fs.readFile(path.join(brandDir, "manifly-mark.png"));
  console.log("wrote brand/manifly-mark.png");

  // 2. Full lockups — copied verbatim for marketing / email / general UI use.
  const lockups = [
    ["manifly.png", "manifly-lockup.png"],
    ["manifly-banner-colour.png", "manifly-wordmark-color.png"],
    ["manifly-banner-mono.png", "manifly-wordmark-mono.png"],
    ["manifly-banner-transparent.png", "manifly-wordmark-light.png"],
  ];
  for (const [from, to] of lockups) {
    await fs.copyFile(path.join(src, from), path.join(brandDir, to));
    console.log("wrote brand/" + to);
  }

  // 3. PWA SVG source.
  const svgPng = await sharp(mark).resize(512, 512).png().toBuffer();
  await fs.writeFile(
    path.join(iconsDir, "icon.svg"),
    wrapSvg(svgPng.toString("base64")),
    "utf8",
  );
  console.log("wrote icons/icon.svg");

  // 4. PWA raster icons. Maskable variants render the mark at 80% on a
  //    flooded navy background so it survives Android's adaptive-icon crop.
  const rasters = [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-maskable-192.png", size: 192, maskable: true },
    { name: "icon-maskable-512.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: true },
  ];
  for (const v of rasters) {
    const inner = v.maskable ? Math.round(v.size * 0.8) : v.size;
    const art = await sharp(mark)
      .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
      .toBuffer();
    await sharp({
      create: {
        width: v.size,
        height: v.size,
        channels: 4,
        background: v.maskable ? NAVY : TRANSPARENT,
      },
    })
      .composite([{ input: art, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(iconsDir, v.name));
    console.log(`wrote icons/${v.name} (${v.size}x${v.size})`);
  }

  // 5. favicon.ico — 16/32/48 PNG frames wrapped in an ICO container.
  //    Source is the white-tile app icon so it stays legible on light and
  //    dark browser chrome alike.
  const frames = [];
  for (const size of [16, 32, 48]) {
    frames.push({
      size,
      buf: await sharp(path.join(src, "icon-app-white.png"))
        .resize(size, size, { fit: "cover" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    });
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let dataOffset = 6 + dir.length;
  frames.forEach((f, i) => {
    const e = 16 * i;
    dir.writeUInt8(f.size, e + 0);
    dir.writeUInt8(f.size, e + 1);
    dir.writeUInt16LE(1, e + 4); // planes
    dir.writeUInt16LE(32, e + 6); // bpp
    dir.writeUInt32LE(f.buf.length, e + 8);
    dir.writeUInt32LE(dataOffset, e + 12);
    dataOffset += f.buf.length;
  });
  await fs.writeFile(
    path.join(root, "app", "favicon.ico"),
    Buffer.concat([header, dir, ...frames.map((f) => f.buf)]),
  );
  console.log("wrote app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
