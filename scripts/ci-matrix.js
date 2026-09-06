'use strict';

// Derives the CI job matrix from `check:github` itself, so the workflow can
// never list fewer checks than the gate does. Adding one to the npm script is
// enough - the matrix follows on the next run.
//
// Everything up to `build:prod` is independent and runs in parallel; from
// there on it's a chain (the bundle test needs the bundle), kept as one
// sequential job in the workflow.
const { scripts } = require('../package.json');

const GATE = 'check:github';
const CHAIN_STARTS_AT = 'npm run build:prod';

const parts = (name) => scripts[name].split('&&').map((s) => s.trim());

// One level of expansion: `check:code` is itself a chain, and leaving it whole
// would put seven checks - including the slowest, lint - behind a single job.
const expand = (step) => {
  const match = step.match(/^npm run ([\w:-]+)$/);
  const body = match && scripts[match[1]];
  return body && body.includes('&&') ? parts(match[1]) : [step];
};

const all = parts(GATE);
const cut = all.indexOf(CHAIN_STARTS_AT);
if (cut === -1) {
  throw new Error(`❌ "${CHAIN_STARTS_AT}" not found in ${GATE} - the parallel/sequential split moved.`);
}

const parallel = all.slice(0, cut).flatMap(expand);
const chain = all.slice(cut);

if (process.argv[2] === '--chain') {
  console.log(chain.join(' && '));
} else {
  // `name` is what GitHub prints next to the job; `run` is the command.
  console.log(JSON.stringify(parallel.map((run) => ({ name: run.replace(/^npm run /, ''), run }))));
}
