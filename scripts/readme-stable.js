'use strict';

const fs = require('fs');
const { readmeStable, README, README_GITHUB } = require('./lib/readme-stable.js');

fs.writeFileSync(README, readmeStable(fs.readFileSync(README_GITHUB, 'utf8')));
console.log(`✅ Wrote ${README}`);
