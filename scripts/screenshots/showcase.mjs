// Re-records the README showcase: the whole epb-showcase view, light and dark, as an APNG loop and a still PNG.
// HA_FILE=<ha.md> node showcase.mjs --out <dir> [--scale 2] [--seconds 6] [--opt 0]
// The washing machine card needs timer.epb_demo_timer running: started here, cancelled after.
// The maintenance countdown runs down day by day: reset to a full 35 days first.
// Each loop is kept raw and, unless --opt 0, also squeezed by apngopt (lossless) as <name>.opt.png.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CAPTURE = path.join(path.dirname(new URL(import.meta.url).pathname), 'capture.mjs');
const HA_FILE = process.env.HA_FILE;
if (!HA_FILE) {
  console.error('HA_FILE must point to a file with "url:" and "token:" lines');
  process.exit(2);
}
const VIEW = 'epb-showcase';
const TIMER = 'timer.epb_demo_timer';
const TIMER_DURATION = '01:00:00';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => (i % 2 ? pairs : [...pairs, [arg.replace(/^--/, ''), all[i + 1]]]), []));
if (!args.out) {
  console.error('usage: --out <dir> [--scale 2] [--seconds 6] [--opt 0]');
  process.exit(2);
}
const scale = args.scale || '2';
const seconds = args.seconds || '6';
const optimise = args.opt !== '0';
fs.mkdirSync(args.out, { recursive: true });

const ha = fs.readFileSync(HA_FILE, 'utf8');
const origin = new URL(ha.match(/^url:\s*(\S+)/m)[1]).origin;
const token = ha.match(/^token:\s*(\S+)/m)[1];
const timerService = (service, body) => fetch(`${origin}/api/services/timer/${service}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ entity_id: TIMER, ...body }),
}).then((r) => r.status);

const resetMaintenance = () => fetch(`${origin}/api/services/script/epb_demo_reset_maintenance`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: '{}',
}).then((r) => r.status);

const capture = (scheme, name, extra) => execFileSync('node', [CAPTURE, '--view', VIEW, '--whole', '1', '--out', args.out,
  '--scheme', scheme, '--scale', scale, '--name', name, ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

const size = (file) => `${Math.round(fs.statSync(file).size / 1024)} KB`;

console.log(`maintenance reset: ${await resetMaintenance()}`);
console.log(`timer.start: ${await timerService('start', { duration: TIMER_DURATION })}`);
try {
  for (const scheme of ['light', 'dark']) {
    const loop = capture(scheme, 'showcase-loop', ['--gif', seconds, '--format', 'apng']);
    console.log(`${loop} ${size(loop)}`);
    if (optimise) {
      const opt = loop.replace(/\.png$/, '.opt.png');
      // apngopt reads a long absolute path as '': relative names from the file's own directory.
      execFileSync('apngopt', ['-z2', path.basename(loop), path.basename(opt)], { cwd: path.dirname(loop), stdio: 'ignore' });
      console.log(`${opt} ${size(opt)}`);
    }
    const still = capture(scheme, 'showcase-still', []);
    console.log(`${still} ${size(still)}`);
  }
} finally {
  console.log(`timer.cancel: ${await timerService('cancel', {})}`);
}
console.log('done');
