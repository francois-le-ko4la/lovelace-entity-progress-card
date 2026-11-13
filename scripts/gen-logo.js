'use strict';

// Generates every version of the logo into docs/images/epc-logo/, named
// <name>-<sha256:6>.<ext> like the rest of docs/images: a changed setting
// writes new files and never overwrites one a published release points at.
// PNGs need Playwright from $PW_DIR (see the screenshot-ha skill); without it
// only the SVGs are written.
//
//   node scripts/gen-logo.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'images', 'epc-logo');

const COLOR = { blue: '#1976d2', white: '#ffffff', black: '#111111' };
const RING = { radius: 44, width: 9, fill: 0.72 };
const BARS = { x: 40, length: 48, width: 7, rows: [48, 64, 80], fills: [0.9, 0.65, 0.9] };
const TILE = { inset: 8, radius: 26 };
const MARK_SCALE = 1.27; // the mark alone, grown to fill the box the tile left
const DISCORD_SCALE = 1.12; // Discord crops to a circle: full bleed, room left for the ring
const PNG_SIZES = { 'epc-icon': [512, 256, 128, 64, 32], 'epc-discord': [1024] };

const num = (value) => String(Number(value.toFixed(2)));

function pointAt(degrees) {
  const angle = (degrees * Math.PI) / 180;
  return `${(64 + RING.radius * Math.cos(angle)).toFixed(2)} ${(64 + RING.radius * Math.sin(angle)).toFixed(2)}`;
}

function mark(color, trackOpacity = 0.3) {
  const stroke = `stroke="${color}" stroke-linecap="round" fill="none"`;
  const top = pointAt(-90);
  const end = pointAt(-90 + 360 * RING.fill);
  const radius = `${RING.radius} ${RING.radius}`;
  const ring =
    `<path d="M${top}A${radius} 0 1 1 ${pointAt(90)}A${radius} 0 1 1 ${top}" ${stroke} ` +
    `stroke-width="${RING.width}" stroke-opacity="${trackOpacity}"/>` +
    `<path d="M${top}A${radius} 0 ${RING.fill > 0.5 ? 1 : 0} 1 ${end}" ${stroke} stroke-width="${RING.width}"/>`;
  const bars = BARS.rows
    .map((row, index) => {
      const start = `M${BARS.x} ${row}H`;
      return (
        `<path d="${start}${BARS.x + BARS.length}" ${stroke} stroke-width="${BARS.width}" ` +
        `stroke-opacity="${trackOpacity}"/>` +
        `<path d="${start}${num(BARS.x + BARS.length * BARS.fills[index])}" ${stroke} stroke-width="${BARS.width}"/>`
      );
    })
    .join('');
  return ring + bars;
}

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img"><title>Entity Progress Card</title>${body}</svg>\n`;
const tile = (color) =>
  `<rect x="${TILE.inset}" y="${TILE.inset}" width="${128 - 2 * TILE.inset}" height="${128 - 2 * TILE.inset}" ` +
  `rx="${TILE.radius}" fill="${color}"/>`;
const grown = (scale, body) => `<g transform="translate(64 64) scale(${scale}) translate(-64 -64)">${body}</g>`;

const VERSIONS = {
  'epc-icon': svg(tile(COLOR.blue) + mark(COLOR.white)),
  'epc-mark-white': svg(grown(MARK_SCALE, mark(COLOR.white))),
  'epc-mark-blue': svg(grown(MARK_SCALE, mark(COLOR.blue, 0.25))),
  'epc-icon-black': svg(tile(COLOR.black) + mark(COLOR.white)),
  'epc-icon-black-blue': svg(tile(COLOR.black) + mark(COLOR.blue, 0.35)),
  'epc-mark-black': svg(grown(MARK_SCALE, mark(COLOR.black, 0.25))),
  'epc-discord': svg(`<rect width="128" height="128" fill="${COLOR.blue}"/>` + grown(DISCORD_SCALE, mark(COLOR.white))),
};

function write(name, ext, content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 6);
  const file = path.join(OUT_DIR, `${name}-${hash}.${ext}`);
  const isNew = !fs.existsSync(file);
  if (isNew) fs.writeFileSync(file, content);
  console.info(`${isNew ? 'written ' : 'unchanged'} ${path.relative(process.cwd(), file)}`);
}

function loadPlaywright() {
  const dir = process.env.PW_DIR || path.join(process.env.TMPDIR || '/tmp', 'epb-playwright');
  try {
    return require(path.join(dir, 'node_modules', 'playwright'));
  } catch {
    console.warn(`PNGs skipped: no Playwright in ${dir} (set PW_DIR).`);
    return null;
  }
}

async function writePngs(playwright) {
  const browser = await playwright.chromium.launch();
  try {
    for (const [name, sizes] of Object.entries(PNG_SIZES)) {
      const source = `data:image/svg+xml;base64,${Buffer.from(VERSIONS[name]).toString('base64')}`;
      for (const size of sizes) {
        const page = await browser.newPage({ viewport: { width: size, height: size } });
        await page.setContent(
          `<body style="margin:0"><img src="${source}" width="${size}" height="${size}" style="display:block"></body>`,
        );
        await page.waitForFunction(() => document.images[0].complete);
        write(`${name}-${size}`, 'png', await page.screenshot({ omitBackground: true }));
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, content] of Object.entries(VERSIONS)) write(name, 'svg', content);
  const playwright = loadPlaywright();
  if (playwright) await writePngs(playwright);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
