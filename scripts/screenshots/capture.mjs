// Screenshots or records cards of a Home Assistant dashboard. Reads url/token from ha.md, never prints the token.
// node capture.mjs --view <path> (--match <text>... | --inject <json>) --out <dir> [options].
// PNG: --type --scheme --scale --wait --style --bg --nth --name. Injected card: --width --height --pad.
// Animation: --gif <seconds>|auto --fps 25, or --tick <s,s> for a countdown; --format apng for full alpha.
// --whole: the whole view (header, badges, sections) on a transparent page, PNG or animation.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';

const PW_DIR = process.env.PW_DIR || path.join(process.env.TMPDIR || '/tmp', 'epb-playwright');
const HA_FILE = process.env.HA_FILE;
if (!HA_FILE) {
  console.error('HA_FILE must point to a file with "url:" and "token:" lines');
  process.exit(2);
}

const args = process.argv.slice(2);
const opts = { match: [] };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  if (key === 'match') opts.match.push(args[i + 1]);
  else opts[key] = args[i + 1];
}
if (!opts.view || !opts.out || (opts.match.length === 0 && !opts.inject && !opts.jobs && !opts.whole)) {
  console.error('usage: --view <path> (--match <text>... | --inject <json> | --jobs <file> | --whole 1) --out <dir> [options]');
  process.exit(2);
}

const DEFAULT_TYPE = 'entity-progress-card-dev';
let type = opts.type || DEFAULT_TYPE;
const scheme = opts.scheme || 'light';
const scale = Number(opts.scale || 3);
const maxWait = Number(opts.wait || 45000);
const style = opts.style || 'plain';
// APNG keeps full alpha (soft corners, no page colour); GIF has one transparent index at most.
const apng = opts.format === 'apng';
const animExt = apng ? 'png' : 'gif';
let gifAuto = opts.gif === 'auto';
let gifSeconds = gifAuto ? 1 : Number(opts.gif || 0);
const AUTO_LOOP_CAP_MS = 12000;
// Sections grid on a 1400 px viewport: 12 columns of 34.33 px, 8 px gaps, 56 px rows.
const SECTION_GRID = { column: 34.33, gap: 8, row: 56 };
let extraPad = Number(opts.pad || 0);
// --jobs runs several injected cards on one page load: each job overrides these per-card options.
const baseType = opts.type;
const applyJob = (job) => {
  Object.assign(opts, { inject: JSON.stringify(job.config), name: job.name, pad: job.pad ?? 0, tick: job.tick, gif: job.gif, type: job.type ?? baseType });
  type = opts.type || DEFAULT_TYPE;
  gifAuto = opts.gif === 'auto';
  gifSeconds = gifAuto ? 1 : Number(opts.gif || 0);
  extraPad = Number(opts.pad || 0);
};
const gifFps = Number(opts.fps || 25);
const SHADOW_PAD = 44;
const NO_PAD = 0;
// spotlight: a baked backdrop per theme, so the shadow reads on any page.
const SPOTLIGHT_BG = { light: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', dark: 'linear-gradient(135deg,#334155,#0f172a)' };
const backdrop = opts.bg || (style === 'spotlight' ? SPOTLIGHT_BG[scheme] : null);
const LIGHT_SHADOW = '0 2px 4px rgba(0,0,0,.10),0 12px 28px rgba(0,0,0,.22)';
// Black is invisible on a dark page: a hairline ring and a faint glow carry the lift instead.
const DARK_SHADOW = '0 0 0 1px rgba(255,255,255,.10),0 0 32px rgba(255,255,255,.07),0 14px 36px rgba(0,0,0,.55)';
const SPOTLIGHT_SHADOW = '0 2px 4px rgba(0,0,0,.15),0 16px 40px rgba(0,0,0,.40)';

const ha = fs.readFileSync(HA_FILE, 'utf8');
const base = ha.match(/^url:\s*(\S+)/m)?.[1];
const token = ha.match(/^token:\s*(\S+)/m)?.[1];
if (!base || !token) throw new Error(`${HA_FILE}: needs "url:" and "token:" lines`);
const origin = new URL(base).origin;

const { chromium } = createRequire(`${PW_DIR}/`)('playwright');
fs.mkdirSync(opts.out, { recursive: true });

const browser = await chromium.launch();
const viewport = { width: 1400, height: 1000 };
const page = await browser.newPage({ colorScheme: scheme, deviceScaleFactor: scale, viewport });
await page.addInitScript(([o, t]) => {
  localStorage.setItem('hassTokens', JSON.stringify({
    access_token: t, token_type: 'Bearer', expires_in: 1800000000, hassUrl: o,
    clientId: `${o}/`, expires: Date.now() + 1800000000 * 1000, refresh_token: 'x',
  }));
}, [origin, token]);
// A whole view is framed without the sidebar, as a reader's dashboard would be shown.
if (opts.whole) await page.addInitScript(() => localStorage.setItem('dockedSidebar', '"always_hidden"'));

// Icons arrive as lazy /static/mdi chunks: settle once none has landed for 4 s.
let lastIcon = Date.now();
page.on('response', (res) => /\/static\/mdi\//.test(res.url()) && (lastIcon = Date.now()));

await page.goto(new URL(opts.view, base.endsWith('/') ? base : `${base}/`).href, { waitUntil: 'networkidle', timeout: 60000 });
const started = Date.now();
const allFound = async () => {
  for (const text of opts.match) if ((await page.locator(type, { hasText: text }).count()) === 0) return false;
  return true;
};
while (Date.now() - started < maxWait && (Date.now() - lastIcon < 4000 || !(await allFound()))) {
  await page.waitForTimeout(500);
}

// The card alone, clipped to its own radius; plain adds nothing around it, the other styles a shadow.
const composeCard = async (png, box, radius, file) => {
  const pad = style === 'plain' ? NO_PAD : SHADOW_PAD;
  const boxShadow = { plain: 'none', spotlight: SPOTLIGHT_SHADOW }[style] ?? (scheme === 'dark' ? DARK_SHADOW : LIGHT_SHADOW);
  const sheet = await browser.newPage({
    deviceScaleFactor: scale,
    viewport: { width: Math.ceil(box.width) + 2 * pad, height: Math.ceil(box.height) + 2 * pad },
  });
  await sheet.setContent(`<body style="margin:0;background:${backdrop || 'transparent'}"><img src="data:image/png;base64,${png.toString('base64')}"
    style="display:block;margin:${pad}px;width:${box.width}px;height:${box.height}px;border-radius:${radius};
    box-shadow:${boxShadow}"></body>`);
  await sheet.screenshot({ path: file, omitBackground: !backdrop });
  await sheet.close();
};

// Whole pixels, rounded outwards: a fractional clip trims the card's right and bottom border.
const snap = (b) => {
  const [x, y] = [Math.floor(b.x), Math.floor(b.y)];
  return { x, y, width: Math.ceil(b.x + b.width) - x, height: Math.ceil(b.y + b.height) - y };
};

// Frames to an animation: APNG as is, GIF through a per-file palette.
const encode = (input, file) => {
  const output = apng
    ? ['-f', 'apng', '-plays', '0']
    : ['-vf', 'split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=sierra2_4a', '-loop', '0'];
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...input, ...output, file]);
};

// Every ancestor of el, across shadow roots, painted transparent: the page shows nothing behind the view.
const clearBackdrop = (el) => {
  // A slotted node is painted inside its slot's shadow tree (the drawer's content pane): walk that path.
  for (let node = el; node; node = node.assignedSlot ?? node.parentNode ?? node.host) {
    if (!node.style) continue;
    node.style.setProperty('background', 'transparent', 'important');
    // A pseudo-element can paint the page too (partial-panel-resolver::before): cleared from the node's own tree.
    const root = node.getRootNode();
    const css = `${node.localName}::before, ${node.localName}::after { background: transparent !important; }`;
    (root.head ?? root).append(Object.assign(document.createElement('style'), { textContent: css }));
  }
};

// Animated GIF: the card's CSS animations are paused and stepped one frame at a time, so a slow
// screenshot never distorts the timing; --gif is the loop length.
const recordGif = async (card, haCard, file) => {
  // Alone on an empty page the card paints in a fraction of the time a whole dashboard takes.
  if (!opts.inject && !opts.whole) {
    await card.evaluate((el) => {
      document.body.replaceChildren(el);
      document.body.style.cssText = 'margin:0;padding:24px;background:var(--primary-background-color)';
    });
  }
  await page.waitForTimeout(1500);
  const dir = fs.mkdtempSync(path.join(opts.out, 'frames-'));
  const periods = await card.evaluate((el) => {
    const found = [];
    const walk = (root) => {
      found.push(...root.getAnimations({ subtree: true }));
      if (root.shadowRoot) walk(root.shadowRoot);
      root.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot));
    };
    walk(el);
    window.__epbAnimations = found;
    found.forEach((a) => a.pause());
    return found.map((a) => a.effect.getComputedTiming()).filter((t) => t.iterations === Infinity).map((t) => Math.round(t.duration));
  });
  if (periods.length === 0) console.error('no running animation on this card');
  // The loop is the least common multiple of the infinite animations' periods (washing_machine: 400 ms + 2 s).
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const loopMs = Math.min(AUTO_LOOP_CAP_MS, periods.reduce((acc, p) => (acc * p) / gcd(acc, p), 1));
  const total = Math.round(((gifAuto ? loopMs : gifSeconds * 1000) / 1000) * gifFps);
  if (gifAuto) console.error(`loop ${loopMs} ms, ${total} frames`);
  // A box-shadow (alert ping) reaches past the card: sample the animation, frame the widest extent.
  const reach = await page.evaluate((loop) => {
    const px = (shadow) => shadow.replace(/rgba?\([^)]*\)/g, '').split(',').map((part) => {
      const [x = 0, y = 0, blur = 0, spread = 0] = (part.match(/-?[\d.]+px/g) ?? []).map(parseFloat);
      return Math.max(Math.abs(x), Math.abs(y)) + blur + Math.max(spread, 0);
    });
    let widest = 0;
    for (let step = 0; step < 24; step += 1) {
      window.__epbAnimations.forEach((a) => {
        a.currentTime = (step * loop) / 24;
        const target = a.effect?.target;
        if (target) widest = Math.max(widest, ...px(getComputedStyle(target).boxShadow));
      });
    }
    return widest;
  }, loopMs);
  // A whole view keeps its own layout and margins.
  const pad = opts.whole ? 0 : Math.ceil(reach) + extraPad;
  if (pad > 0) console.error(`frame padded by ${pad}px (animation reach ${reach}px)`);
  if (!opts.whole) await page.evaluate((margin) => { document.body.style.padding = `${Math.max(24, margin + 4)}px`; }, pad);
  if (apng) await card.evaluate(clearBackdrop);
  await page.waitForTimeout(500);
  const inner = await haCard.boundingBox();
  const box = snap({ x: inner.x - pad, y: inner.y - pad, width: inner.width + 2 * pad, height: inner.height + 2 * pad });
  // Frozen clock: a countdown (timer) must read the same in every frame.
  await page.evaluate(() => {
    const RealDate = (window.__epbRealDate ??= Date);
    const frozen = RealDate.now();
    window.Date = class extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [frozen]));
      }

      static now() {
        return frozen;
      }
    };
  });
  for (let i = 0; i < total; i += 1) {
    await page.evaluate((t) => window.__epbAnimations.forEach((a) => { a.currentTime = t; }), (i * 1000) / gifFps);
    await page.screenshot({ clip: box, omitBackground: apng, path: path.join(dir, `${String(i).padStart(4, '0')}.png`) });
  }
  await page.evaluate(() => {
    window.__epbAnimations.forEach((a) => a.play());
    window.Date = window.__epbRealDate;
  });
  encode(['-framerate', String(gifFps), '-i', path.join(dir, '%04d.png')], file);
  fs.rmSync(dir, { recursive: true });
};

// Countdown card (fast_refresh): one frame per displayed second, kept once the seconds read --tick in
// order (e.g. 04,03); each frame lasts one second, so the GIF loops 04 -> 03 -> 04.
const TICK_TIMEOUT_MS = 90000;
const recordTicks = async (card, haCard, file) => {
  const wanted = opts.tick.split(',').map((sec) => new RegExp(`:${sec}(?![\\d:])`));
  const textOf = () => card.evaluate((el) => el.shadowRoot.querySelector('ha-card').innerText.replace(/\s+/g, ' '));
  const box = snap(await haCard.boundingBox());
  const cdp = await page.context().newCDPSession(page);
  // APNG: the page shows through the card's corners; CDP grabs ignore Playwright's omitBackground.
  if (apng) {
    await card.evaluate(clearBackdrop);
    await page.evaluate(() => { document.body.style.background = 'transparent'; });
    await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  }
  const clip = { x: box.x, y: box.y, width: box.width, height: box.height, scale };
  const seen = [];
  let last = await textOf();
  for (const stop = Date.now() + TICK_TIMEOUT_MS; Date.now() < stop;) {
    const text = await textOf();
    if (text === last) {
      await page.waitForTimeout(25);
      continue;
    }
    last = text;
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip });
    if ((await textOf()) !== text) continue; // the second moved during the grab
    seen.push({ text, data });
    const tail = seen.slice(-wanted.length);
    if (tail.length === wanted.length && tail.every((f, i) => wanted[i].test(f.text))) {
      const dir = fs.mkdtempSync(path.join(opts.out, 'frames-'));
      tail.forEach((f, i) => fs.writeFileSync(path.join(dir, `${i}.png`), Buffer.from(f.data, 'base64')));
      const list = tail.map((f, i) => `file '${i}.png'\nduration 1`).join('\n');
      fs.writeFileSync(path.join(dir, 'list.txt'), `${list}\nfile '${tail.length - 1}.png'\n`);
      encode(['-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt')], file);
      console.error(`frames: ${tail.map((f) => f.text).join(' | ')}`);
      fs.rmSync(dir, { recursive: true });
      return;
    }
  }
  throw new Error(`no frame sequence ${opts.tick} within ${TICK_TIMEOUT_MS / 1000}s`);
};

// --name: docs/images convention, <name>-<scheme>-<first 6 of the sha256>.<ext>.
const named = (file) => {
  if (!opts.name) return file;
  const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 6);
  const target = path.join(path.dirname(file), `${opts.name}-${scheme}-${hash}${path.extname(file)}`);
  fs.renameSync(file, target);
  return target;
};

// First ha-card inside an element, shadow roots included: the radius a stack or tile is clipped to.
const innerCardRadius = (el) => {
  const find = (root) => root.querySelector('ha-card') ?? [...root.querySelectorAll('*')].map((e) => e.shadowRoot && find(e.shadowRoot)).find(Boolean);
  const found = el.matches('ha-card') ? el : find(el.shadowRoot ?? el) ?? find(el);
  return found ? getComputedStyle(found).borderTopLeftRadius : '0px';
};

// A heavy dashboard view can crash a small host: --inject builds the card from its config on a light view.
// A JSON array is a group laid out cell by cell like a Sections grid (each card's own grid_options).
const injectCard = async () => {
  const input = JSON.parse(opts.inject);
  const group = Array.isArray(input);
  const configs = (group ? input : [input]).map((c) => ({ type: `custom:${type}`, ...c }));
  await page.evaluate((cardType) => Promise.all([customElements.whenDefined(cardType), customElements.whenDefined('hui-card')]), type);
  const handle = await page.evaluateHandle(async ([cardType, cardConfigs, asGroup, forcedWidth, forcedHeight, sectionGrid, keepFeeding]) => {
    const { column, gap, row } = sectionGrid;
    window.__epbHA ??= document.querySelector('home-assistant');
    const ha = window.__epbHA;
    const make = (config) => {
      const isOwn = config.type === `custom:${cardType}`;
      // Any other card (stack, grid, tile...) goes through hui-card, as the dashboard builds it.
      const el = document.createElement(isOwn ? cardType : 'hui-card');
      if (isOwn) el.setConfig(config);
      else el.config = config;
      return { el, config };
    };
    // Cell the card gets in the Sections grid: grid_options, else the card's own default ('full' = 12).
    // hui-card forwards to the card it built, which exists a moment after the config is set.
    const cellOf = ({ el, config }) => {
      const own = el.getGridOptions?.() ?? el._element?.getGridOptions?.() ?? el.firstElementChild?.getGridOptions?.();
      const span = (v) => (v === 'full' ? 12 : typeof v === 'number' ? v : undefined);
      return { columns: span(config.grid_options?.columns) ?? span(own?.columns) ?? 12, rows: span(config.grid_options?.rows) ?? span(own?.rows) };
    };
    const cells = cardConfigs.map(make);
    // A badge is as wide as its content, not as a grid cell.
    const isBadge = cardType.includes('badge');
    const wrap = document.createElement('div');
    const gridCells = [];
    if (asGroup) {
      wrap.style.cssText = `display:grid;width:max-content;grid-template-columns:repeat(12,${column}px);grid-auto-rows:minmax(${row}px,auto);gap:${gap}px`;
      cells.forEach((item) => {
        const cell = document.createElement('div');
        item.el.style.height = '100%';
        cell.append(item.el);
        wrap.append(cell);
        gridCells.push([item, cell]);
      });
    } else {
      if (!isBadge) cells[0].el.style.height = '100%';
      wrap.append(cells[0].el);
    }
    const layout = () => {
      if (asGroup) {
        gridCells.forEach(([item, cell]) => {
          const { columns, rows } = cellOf(item);
          cell.style.gridColumn = `span ${columns}`;
          if (rows !== undefined) cell.style.gridRow = `span ${rows}`;
        });
        return;
      }
      const { columns, rows } = cellOf(cells[0]);
      wrap.style.width = isBadge ? 'max-content' : `${forcedWidth || Math.round(columns * (column + gap) - gap)}px`;
      // The Sections grid wraps each card in a .card carrying --row-size; a tile feature in overlay mode reads and
      // lowers it to keep the tile on its own row, so the wrapper's height follows the variable.
      wrap.classList.add('card');
      if (forcedHeight) wrap.style.height = `${forcedHeight}px`;
      else if (rows !== undefined) {
        wrap.style.setProperty('--row-size', String(rows));
        wrap.style.height = `calc(var(--row-size) * ${row + gap}px - ${gap}px)`;
      }
    };
    layout();
    document.body.replaceChildren(wrap);
    document.body.style.cssText = 'margin:0;padding:24px;background:var(--primary-background-color)';
    // Connected first, as the dashboard does: a card fed hass before that skips its Jinja subscriptions.
    const feed = () => cells.forEach(({ el }) => { el.hass = { ...ha.hass }; });
    cells.forEach(({ el }) => { el.hass = ha.hass; });
    // The dashboard feeds each card its hass on every state change; detached, the card must be fed by hand.
    // Stopped after 10 s unless a countdown needs it: a stack rebuilds its cards on every hass, which would
    // swap the animated elements under the frames.
    let feeds = 0;
    const timer = setInterval(() => {
      feed();
      feeds += 1;
      if (feeds >= 10 && !keepFeeding) clearInterval(timer);
    }, 1000);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    layout();
    return asGroup ? wrap : cells[0].el;
  }, [type, configs, group, Number(opts.width || 0), Number(opts.height || 0), SECTION_GRID, Boolean(opts.tick)]);
  lastIcon = Date.now();
  await page.waitForTimeout(3000);
  // Icons are lazy chunks: until they land the card shows a placeholder glyph.
  for (const stop = Date.now() + maxWait; Date.now() - lastIcon < 4000 && Date.now() < stop;) await page.waitForTimeout(500);
  const card = handle.asElement();
  // A stack (auto-entities) builds its cards after a few seconds: nothing to frame before it has a body.
  await page.waitForFunction((el) => el.getBoundingClientRect().height > 30, card, { timeout: maxWait });
  await page.waitForTimeout(1500);
  // A tile feature shrinks the tile back to its own row once HA has written its row size: frame after the height holds.
  for (let last = -1, held = 0, stop = Date.now() + 20000; held < 6 && Date.now() < stop; await page.waitForTimeout(500)) {
    const h = await card.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    held = h === last ? held + 1 : 0;
    last = h;
  }
  // card_mod is applied by the dashboard around the card, not by the card: its style goes in by hand.
  const modStyle = group ? undefined : input.card_mod?.style;
  if (modStyle) await card.evaluate((el, css) => el.shadowRoot.append(Object.assign(document.createElement('style'), { textContent: css })), modStyle);
  // A stack or grid is framed whole: its first inner ha-card would be only one of its cards.
  const wholeCard = group || (input.type !== undefined && input.type !== `custom:${type}`);
  // A group is framed on its cards, not on the 12 columns it could fill.
  const groupBox = () => card.evaluate((wrap) => {
    const rects = [...wrap.children].map((cell) => cell.getBoundingClientRect());
    const [left, top] = [Math.min(...rects.map((r) => r.left)), Math.min(...rects.map((r) => r.top))];
    return { x: left, y: top, width: Math.max(...rects.map((r) => r.right)) - left, height: Math.max(...rects.map((r) => r.bottom)) - top };
  });
  const haCard = group ? { boundingBox: groupBox } : wholeCard ? card : ((await card.$('ha-card')) ?? card);
  const name = `inject-${scheme}`;
  const ext = gifSeconds || opts.tick ? animExt : 'png';
  const file = path.join(opts.out, `${name}.${ext}`);
  if (opts.tick) {
    await recordTicks(card, haCard, file);
  } else if (gifSeconds) {
    await recordGif(card, haCard, file);
  } else {
    const box = snap(await haCard.boundingBox());
    // A group has gaps between its cards: no outer radius. A single card, stack or tile clips to its own.
    // auto-entities wraps its grid one level down: the gaps between its cards are page too.
    const gridOfCards = group || input.type === 'grid' || input.card?.type === 'grid';
    const radius = gridOfCards ? '0px' : await haCard.evaluate(innerCardRadius);
    // Between the cards of a group the page shows through: transparent, so the image sits on any background.
    if (gridOfCards) await page.evaluate(() => { document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; });
    await composeCard(await page.screenshot({ clip: box, omitBackground: gridOfCards }), box, radius, file);
  }
  return named(file);
};

if (opts.jobs) {
  for (const job of JSON.parse(fs.readFileSync(opts.jobs, 'utf8'))) {
    applyJob(job);
    try {
      console.log(await injectCard());
    } catch (error) {
      console.log(`FAILED ${job.name} ${scheme}: ${String(error.message).split('\n')[0]}`);
    }
  }
  await browser.close();
  process.exit(0);
}
if (opts.inject) {
  console.log(await injectCard());
  await browser.close();
  process.exit(0);
}

// The whole view, as HA lays it out: header, badges and sections, on a transparent page.
if (opts.whole) {
  // The view is built after the page settles: wait for it, shadow roots included.
  const view = (await page.waitForFunction(() => {
    const find = (root) => root.querySelector('hui-sections-view, hui-masonry-view, hui-panel-view')
      ?? [...root.querySelectorAll('*')].map((e) => e.shadowRoot && find(e.shadowRoot)).find(Boolean);
    return find(document);
  }, null, { timeout: maxWait, polling: 500 })).asElement();
  // Every visible ha-icon of the view drawn (the header's icon lands after the cards' ones).
  await page.waitForFunction((el) => {
    const all = (root) => [...root.querySelectorAll('*')].flatMap((e) => [e, ...(e.shadowRoot ? all(e.shadowRoot) : [])]);
    const shown = (e) => e.localName === 'ha-icon' && e.getBoundingClientRect().width > 0;
    return all(el.shadowRoot ?? el).filter(shown).every((e) => e.shadowRoot?.querySelector('ha-svg-icon')?.path);
  }, view, { timeout: maxWait, polling: 500 }).catch(() => console.error('some ha-icon never drew'));
  await view.evaluate(clearBackdrop);
  // The dashboard background is a sibling layer of the view (hui-view-background), not an ancestor.
  await page.evaluate(() => {
    const all = (root) => [...root.querySelectorAll('*')].flatMap((e) => [e, ...(e.shadowRoot ? all(e.shadowRoot) : [])]);
    all(document).filter((e) => e.localName === 'hui-view-background').forEach((e) => { e.style.display = 'none'; });
  });
  await page.waitForTimeout(1500);
  // The view stretches to the window: frame its header and sections, not the empty rest; 12 px for the cards' shadows.
  const VIEW_MARGIN = 12;
  const content = { boundingBox: () => view.evaluate((el, margin) => {
    const root = el.shadowRoot ?? el;
    const parts = [...root.querySelectorAll('hui-view-header, .container *')];
    const rects = parts.map((c) => c.getBoundingClientRect()).filter((r) => r.width && r.height);
    const [left, top] = [Math.min(...rects.map((r) => r.left)) - margin, Math.min(...rects.map((r) => r.top))];
    const [right, bottom] = [Math.max(...rects.map((r) => r.right)) + margin, Math.max(...rects.map((r) => r.bottom)) + margin];
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, VIEW_MARGIN) };
  const file = path.join(opts.out, `view-${scheme}.${gifSeconds ? animExt : 'png'}`);
  if (gifSeconds) await recordGif(view, content, file);
  else await page.screenshot({ clip: snap(await content.boundingBox()), omitBackground: true, path: file });
  console.log(named(file));
  await browser.close();
  process.exit(0);
}

let shot = 0;
for (const text of opts.match) {
  const cards = await page.locator(type, { hasText: text }).elementHandles();
  const count = cards.length;
  console.error(`${count} card(s) match "${text}"`);
  for (const card of opts.nth === undefined ? cards : [cards[Number(opts.nth)]]) {
    await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1500);
    const haCard = await card.$('ha-card');
    const box = await haCard?.boundingBox();
    if (!haCard || !box) continue;
    const name = `${String(shot).padStart(2, '0')}-${text.replace(/\W+/g, '_')}-${scheme}`;
    const file = path.join(opts.out, `${name}.png`);
    if (gifSeconds) {
      const gif = file.replace(/\.png$/, `.${animExt}`);
      await recordGif(card, haCard, gif);
      console.log(named(gif));
      break;
    }
    const radius = await haCard.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    await composeCard(await page.screenshot({ clip: box }), box, radius, file);
    console.log(named(file));
    shot += 1;
  }
  if (count === 0) console.log(`no card matches "${text}"`);
}
await browser.close();
