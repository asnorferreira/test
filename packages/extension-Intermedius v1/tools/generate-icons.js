const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUTPUT_DIR = path.join(__dirname, "..", "icons");
const SIZES = [16, 32, 48, 128];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function createIcon(size) {
  const width = size;
  const height = size;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type none
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      const t = y / (height - 1 || 1);
      const start = { r: 49, g: 46, b: 129 };
      const end = { r: 109, g: 40, b: 217 };

      let r = Math.round(start.r + (end.r - start.r) * t);
      let g = Math.round(start.g + (end.g - start.g) * t);
      let b = Math.round(start.b + (end.b - start.b) * t);

      const center = width / 2;
      const barWidth = Math.max(2, Math.round(width * 0.18));
      const capHeight = Math.max(2, Math.round(height * 0.12));

      if (
        (y < capHeight && x > center - barWidth && x < center + barWidth) ||
        (y > height - capHeight && x > center - barWidth && x < center + barWidth) ||
        (x > center - barWidth / 2 &&
          x < center + barWidth / 2 &&
          y >= capHeight &&
          y <= height - capHeight)
      ) {
        r = g = b = 245;
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return ~crc >>> 0;
}

const CRC_TABLE = (() => {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

for (const size of SIZES) {
  const buffer = createIcon(size);
  const outPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${outPath}`);
}

