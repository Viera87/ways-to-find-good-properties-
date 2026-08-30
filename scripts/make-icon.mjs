import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const header = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([header, data])));
  return Buffer.concat([len, header, data, crc]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const dest = y * (width * 4 + 1);
    raw[dest] = 0;
    rgba.copy(raw, dest + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paint(size) {
  const px = Buffer.alloc(size * size * 4);
  const ink = [11, 15, 20, 255];
  const panel = [22, 29, 39, 255];
  const gold = [212, 177, 90, 255];
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = c[0];
    px[i + 1] = c[1];
    px[i + 2] = c[2];
    px[i + 3] = c[3];
  };
  const fillRect = (x0, y0, x1, y1, c) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) set(x, y, c);
  };
  const rounded = (x0, y0, x1, y1, r, c) => {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const cx = x < x0 + r ? x0 + r : x >= x1 - r ? x1 - 1 - r : x;
        const cy = y < y0 + r ? y0 + r : y >= y1 - r ? y1 - 1 - r : y;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) set(x, y, c);
      }
    }
  };

  fillRect(0, 0, size, size, ink);
  const pad = Math.round(size * 0.08);
  const inner = Math.round(size * 0.12);
  const r = Math.round(size * 0.14);
  rounded(pad, pad, size - pad, size - pad, r, gold);
  rounded(inner, inner, size - inner, size - inner, Math.round(size * 0.1), panel);

  // Geometric C
  const cx = size * 0.5;
  const cy = size * 0.5;
  const outer = size * 0.28;
  const innerR = size * 0.16;
  const gap = 0.42;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);
      if (d <= outer && d >= innerR && Math.abs(ang) > gap) set(x, y, gold);
    }
  }
  return px;
}

function write(rel, size) {
  const dest = join(root, rel);
  mkdirSync(dirname(dest), { recursive: true });
  createWriteStream(dest).end(png(size, size, paint(size)));
}

write("build/icon.png", 512);
write("build/icons/512x512.png", 512);
write("build/icons/256x256.png", 256);
write("build/icons/128x128.png", 128);
write("build/icons/64x64.png", 64);
write("build/icons/32x32.png", 32);
write("public/icon-512.png", 512);
console.log("wrote CERTUS icons");
