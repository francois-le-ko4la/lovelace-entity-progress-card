'use strict';

// GitHub shows .github/README.md over the root one, so it is the `main` README,
// edited by hand. HACS and the docs site read the root README.md at a release
// tag: written from it when a stable release is prepared.

const README = 'README.md';
const README_GITHUB = '.github/README.md';
const SITE = 'https://francois-le-ko4la.github.io/lovelace-entity-progress-card/';
const NOTE = /<!-- doc-version -->\n[\s\S]*?<!-- \/doc-version -->\n/;
const STABLE_NOTE = `<!-- doc-version -->
These guides describe the latest stable release. Testing a release candidate,
or using an older release? Open the
[repository](https://github.com/francois-le-ko4la/lovelace-entity-progress-card)
on GitHub and pick its tag.
<!-- /doc-version -->
`;
const HEADER = '<!-- Generated from .github/README.md by `npm run docs:readme`: do not edit. -->\n';
const DOCS_PAGE = /\.\.\/docs\/([\w-]+)\.md/g;

function readmeStable(readme) {
  if (!NOTE.test(readme)) throw new Error(`${README_GITHUB}: no <!-- doc-version --> block`);
  return HEADER + readme.replace(NOTE, STABLE_NOTE).replace(DOCS_PAGE, `${SITE}$1/`);
}

module.exports = { readmeStable, README, README_GITHUB };
