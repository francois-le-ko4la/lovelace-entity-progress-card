'use strict';

// Release-only preflight: the three things a push cannot check, because no tag
// exists yet. Runs before the full gate in release.yaml - no point spending
// nine minutes validating code the tag doesn't even agree with.
//
// A tag that disagrees with VERSION is silent and survives the release: the
// card would announce the wrong version in its console banner, in META's
// documentation URL and in EPB_DIAG.dump() - the very report used to diagnose
// what users send back.
const fs = require('fs');
const { execFileSync } = require('child_process');

const META = 'src/utils/meta.ts';
const CHANGELOG = 'CHANGELOG.md';

// GITHUB_REF_NAME is the tag on a release event; the argument is for local runs.
const tag = process.argv[2] || process.env.GITHUB_REF_NAME;
if (!tag) {
  throw new Error('❌ No tag given: pass one as an argument, or set GITHUB_REF_NAME.');
}

const meta = fs.readFileSync(META, 'utf8');
const versionMatch = meta.match(/const VERSION = '([^']+)';/);
if (!versionMatch) {
  throw new Error(`❌ VERSION not found in ${META}.`);
}
const version = versionMatch[1];

if (tag !== version) {
  throw new Error(`❌ Tag ${tag} does not match VERSION ${version} in ${META}.`);
}

// An RC documents itself under "What's new (x.y.z-rcN)", a stable under "x.y.z".
const heading = version.includes('-rc') ? `## What's new (${version})` : `## ${version}`;
if (!fs.readFileSync(CHANGELOG, 'utf8').includes(heading)) {
  throw new Error(`❌ ${CHANGELOG} has no "${heading}" section.`);
}

// A tag on a stray commit would otherwise publish whatever it points at.
// Needs the full history: release.yaml checks out with fetch-depth: 0, without
// which origin/main simply isn't there and every tag would look unreachable.
const resolves = (ref) => {
  try {
    execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

for (const ref of [tag, 'origin/main']) {
  if (!resolves(ref)) {
    throw new Error(`❌ ${ref} does not resolve here - is the checkout shallow? (needs fetch-depth: 0)`);
  }
}

try {
  execFileSync('git', ['merge-base', '--is-ancestor', tag, 'origin/main'], { stdio: 'pipe' });
} catch {
  throw new Error(`❌ Tag ${tag} is not reachable from origin/main.`);
}

console.log(`✅ Tag ${tag} matches VERSION, has a ${CHANGELOG} section, and sits on main.`);
