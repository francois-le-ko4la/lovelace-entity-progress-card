// Re-records the animated GIFs of docs/cookbook.md, light and dark, from the demo dashboard's own cards.
// node cookbook-gifs.mjs --out <dir> [--only name,name] [--view epb-showcase] [--format apng]
// --format apng: each loop is then squeezed by apngopt.
// Each job reads its card(s) from docs/demo-dashboard-dev.yaml (the section under a heading) so the
// GIF follows the YAML; capture.mjs does the rendering. Files come out as <name>-<scheme>-<sha256:6>.gif.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const CAPTURE = path.join(path.dirname(new URL(import.meta.url).pathname), 'capture.mjs');
const HA_FILE = process.env.HA_FILE;
if (!HA_FILE) {
  console.error('HA_FILE must point to a file with "url:" and "token:" lines');
  process.exit(2);
}
const TIMER = 'timer.epb_demo_timer';
const TIMER_DURATION = '00:30:00';
const ATTEMPTS = 2;

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => (i % 2 ? pairs : [...pairs, [arg.replace(/^--/, ''), all[i + 1]]]), []));
if (!args.out) {
  console.error('usage: --out <dir> [--only name,name] [--view epb-showcase] [--format apng]');
  process.exit(2);
}
const only = args.only ? args.only.split(',') : null;
const view = args.view || 'epb-showcase';
fs.mkdirSync(args.out, { recursive: true });

const yaml = createRequire(`${REPO}/`)('yaml');
const dashboard = yaml.parse(fs.readFileSync(`${REPO}/docs/demo-dashboard-dev.yaml`, 'utf8'));
const sectionByHeading = (text) => {
  let found;
  const walk = (node) => {
    if (found || !node || typeof node !== 'object') return;
    if (Array.isArray(node.cards) && node.cards.some((c) => c.type === 'heading' && String(c.heading).includes(text))) {
      found = node.cards;
      return;
    }
    Object.values(node).forEach(walk);
  };
  walk(dashboard);
  if (!found) throw new Error(`no demo section with heading "${text}"`);
  return found;
};

const dashboardView = (path) => dashboard.views.find((v) => v.path === path);
const OWN = 'custom:entity-progress-card-dev';
const ownCards = (cards) => cards.filter((c) => c.type === OWN);
// The card's size in the Sections grid comes from --inject, not from the demo's grid_options.
const withoutGrid = ({ grid_options, ...rest }) => rest;
// The detached page never loads the fan domain's icon translation: pin what the dashboard resolves.
const pinFanIcon = (c) => (c.entity.startsWith('fan.') && !c.icon ? { ...c, icon: 'mdi:fan' } : c);
const gridOf = (cards) => ({ type: 'grid', columns: 2, square: false, cards: ownCards(cards).map(withoutGrid).map(pinFanIcon) });

// name = file stem in docs/images; timer = needs timer.epb_demo_timer running (started, then cancelled);
// element/pad = capture.mjs --type/--pad for a badge (the view's badges row, built on its own).
const JOBS = [
  { name: 'battery-charging', card: () => ({ entity: 'sensor.epb_demo_battery_95', theme: 'battery_adaptive', bar_color_mode: 'rainbow_full', icon_animation: 'battery_charging' }) },
  { name: 'rgb-loop', card: () => withoutGrid(sectionByHeading('card_mod / animation').find((c) => c.card_mod)) },
  { name: 'effect-shimmer', card: () => withoutGrid(sectionByHeading('bar_effect: shimmer').find((c) => c.bar_effect)) },
  // Keeps its grid_options: the water needs the 2-row height to read as a fill.
  { name: 'effect-wave', card: () => sectionByHeading('bar_effect: wave').find((c) => c.bar_effect) },
  { name: 'stack', card: () => ({ ...sectionByHeading('vertical-stack-in-card').find((c) => c.type === 'custom:vertical-stack-in-card'), grid_options: undefined }) },
  { name: 'effect-alert-label', card: () => gridOf(sectionByHeading('alert_when: label + entity-driven')) },
  { name: 'showcase-garage', card: () => ownCards(sectionByHeading('Recreate the Showcase: Garage'))[0] },
  { name: 'alert-pulsing', card: () => ownCards(sectionByHeading('Pulsing alert on threshold'))[0] },
  { name: 'badge-shimmer', element: 'entity-progress-badge-dev', pad: 6, card: () => ({ ...dashboardView('epb-cookbook-examples').badges.find((b) => b.bar_effect === 'shimmer') }) },
  { name: 'effect-icon-animation', timer: true, card: () => gridOf(sectionByHeading('icon_animation: washing_machine')) },
];

const ha = fs.readFileSync(HA_FILE, 'utf8');
const origin = new URL(ha.match(/^url:\s*(\S+)/m)[1]).origin;
const token = ha.match(/^token:\s*(\S+)/m)[1];
const timerService = (service, body) => fetch(`${origin}/api/services/timer/${service}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ entity_id: TIMER, ...body }),
}).then((r) => r.status);

const record = (job, config, scheme) => {
  const { name } = job;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      return execFileSync('node', [CAPTURE, '--view', view, '--out', args.out, '--scheme', scheme, '--scale', '3',
        '--gif', 'auto', '--name', name, ...(args.format ? ['--format', args.format] : []), ...(job.element ? ['--type', job.element] : []), ...(job.pad ? ['--pad', String(job.pad)] : []),
        '--inject', JSON.stringify(config)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (error) {
      console.error(`${name} ${scheme}, attempt ${attempt}: ${String(error.stderr).split('\n').find((l) => l.trim()) ?? error.message}`);
    }
  }
  return `FAILED ${name} ${scheme}`;
};

// APNG: squeezed by apngopt (lossless, zopfli), renamed after its new content (<name>-<scheme>-<sha256:6>.png).
// A failure keeps the raw file: apngopt runs out of memory on a large view on a small host.
const optimise = (file) => {
  if (args.format !== 'apng' || file.startsWith('FAILED')) return file;
  const tmp = `${file}.opt`;
  try {
    // apngopt reads a long absolute path as '': relative names from the file's own directory.
    execFileSync('apngopt', ['-z2', path.basename(file), path.basename(tmp)], { cwd: path.dirname(file), stdio: 'ignore' });
  } catch {
    fs.rmSync(tmp, { force: true });
    return `${file} (apngopt failed, raw)`;
  }
  const hash = createHash('sha256').update(fs.readFileSync(tmp)).digest('hex').slice(0, 6);
  const target = file.replace(/-[0-9a-f]{6}\.png$/, `-${hash}.png`);
  fs.renameSync(tmp, target);
  if (target !== file) fs.rmSync(file);
  return target;
};

for (const job of JOBS.filter((j) => !only || only.includes(j.name))) {
  const config = job.card();
  // The demo timer idles by default; a running one is what the animation and the badge need.
  if (job.timer) console.log(`timer start ${await timerService('start', { duration: TIMER_DURATION })}`);
  try {
    for (const scheme of ['light', 'dark']) console.log(optimise(record(job, config, scheme)));
  } finally {
    if (job.timer) console.log(`timer cancel ${await timerService('cancel', {})}`);
  }
}
console.log('done');
