// Re-records the static cookbook images (docs/images PNG), light and dark, from the demo dashboard's own cards.
// node cookbook-images.mjs --out <dir> [--only name,name] [--view epb-showcase]
// Each image's card(s) sit under its `📁 <name>.png` marker in docs/demo-dashboard-dev.yaml: one card is
// built as is, several are laid out as the Sections grid shows them. The view's badges are matched by hand.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const CAPTURE = path.join(path.dirname(new URL(import.meta.url).pathname), 'capture.mjs');
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => (i % 2 ? pairs : [...pairs, [arg.replace(/^--/, ''), all[i + 1]]]), []));
if (!args.out) {
  console.error('usage: --out <dir> [--only name,name] [--view epb-showcase]');
  process.exit(2);
}
const only = args.only ? args.only.split(',') : null;
const view = args.view || 'epb-showcase';
const BADGE_PAD = 6;
fs.mkdirSync(args.out, { recursive: true });

const yaml = createRequire(`${REPO}/`)('yaml');
const dashboard = yaml.parse(fs.readFileSync(`${REPO}/docs/demo-dashboard-dev.yaml`, 'utf8'));
const cookbookView = dashboard.views.find((v) => v.path === 'epb-cookbook-examples');

// Section cards under each `📁 name.png` marker, minus the heading and the markdown that holds it.
const sections = {};
const walk = (node) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.cards)) {
    const marker = node.cards.find((c) => c.type === 'markdown' && /📁 `[\w.-]+\.png`/.test(c.content ?? ''));
    if (marker) sections[marker.content.match(/📁 `([\w.-]+)\.png`/)[1]] = node.cards.filter((c) => !['heading', 'markdown'].includes(c.type));
  }
  Object.values(node).forEach(walk);
};
walk(cookbookView);

// The view's badges row, by what each image shows (not part of any section).
const BADGES = { 'disk-usage': 1, 'kitchen-fan': 2, 'demo-light': 3 };
// Per image, grid_options to force over the demo's own (name -> {columns, rows}); none needed so far.
const GRID_OVERRIDES = {};
const NOT_REBUILT = {};
// Images with no marker: the cards under a heading of another view, shown as the grid the dashboard lays out.
// `last` keeps only the section's last card (the image shows one card, not the section). `columns` wraps the cards in a grid card; without it they are laid out cell by cell, as a Sections grid does.
const themeSection = (name, heading, extra) => [`theme-${name}`, { view: 'epb-appearance', heading: `Same theme, different ${heading}`, ...extra }];
const FROM_HEADING = {
  'all-watermark': { view: 'epb-appearance', heading: 'All watermark types', columns: 2 },
  ...Object.fromEntries([
    themeSection('battery-adaptive', 'state (battery_adaptive)'),
    themeSection('critical-low', '% (critical_when_low)'),
    themeSection('optimal-low', '% (optimal_when_low)'),
    themeSection('critical-high', '% (critical_when_high)'),
    themeSection('optimal-high', '% (optimal_when_high)'),
    themeSection('critical-extreme', '% (critical_when_extreme)'),
    themeSection('critical-extreme-center', 'value (critical_when_extreme_center)', { last: true }),
    themeSection('light', '% (light)'),
    themeSection('temperature', '% (temperature)'),
    themeSection('humidity', '% (humidity)'),
    themeSection('voc', '% (voc)'),
    themeSection('pm', '% (pm25)'),
  ]),
};

const jobs = [];
const skipped = [];
for (const [name, cards] of Object.entries(sections)) {
  if (name in BADGES || cards.length === 0) continue;
  const overridden = GRID_OVERRIDES[name] ? cards.map((c) => ({ ...c, grid_options: { ...c.grid_options, ...GRID_OVERRIDES[name] } })) : cards;
  jobs.push({ name, config: overridden.length === 1 ? overridden[0] : overridden });
}
for (const [name, index] of Object.entries(BADGES)) {
  const badge = cookbookView.badges[index];
  jobs.push({ name, type: badge.type.replace('custom:', ''), pad: BADGE_PAD, config: badge });
}
for (const [name, { view: viewPath, heading, columns, last }] of Object.entries(FROM_HEADING)) {
  let cards;
  const find = (node) => {
    if (cards || !node || typeof node !== 'object') return;
    if (Array.isArray(node.cards) && node.cards.some((c) => c.type === 'heading' && c.heading === heading)) cards = node.cards.filter((c) => c.type !== 'heading');
    else Object.values(node).forEach(find);
  };
  find(dashboard.views.find((v) => v.path === viewPath));
  if (!cards) throw new Error(`no "${heading}" section in ${viewPath}`);
  if (last) cards = [cards.at(-1)];
  jobs.push({ name, config: columns ? { type: 'grid', columns, square: false, cards } : cards.length === 1 ? cards[0] : cards });
}
for (const [name, why] of Object.entries(NOT_REBUILT)) skipped.push(`${name}: ${why}`);

const selected = jobs.filter((j) => !only || only.includes(j.name));
const jobsFile = path.join(args.out, 'jobs.json');
fs.writeFileSync(jobsFile, JSON.stringify(selected));
for (const scheme of ['light', 'dark']) {
  console.log(execFileSync('node', [CAPTURE, '--view', view, '--out', args.out, '--scheme', scheme, '--scale', '3', '--jobs', jobsFile], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim());
}
if (skipped.length) console.log(`not rebuilt:\n  ${skipped.join('\n  ')}`);
console.log('done');
