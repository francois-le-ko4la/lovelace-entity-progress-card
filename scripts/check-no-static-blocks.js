'use strict';

// es-check can't tell class static blocks apart from the rest of es2022: both
// pass or fail together. Static blocks are the one es2022 feature Chrome 92
// lacks (#128), so the built bundle gets this check on top of `es-check es2022`.
//
//   node scripts/check-no-static-blocks.js dist/entity-progress-card.js [...]
const fs = require('fs');
const acorn = require('acorn');

const isNode = (value) => value !== null && typeof value === 'object' && typeof value.type === 'string';

// Iterative, not recursive: a minified bundle nests deep enough to matter.
function findStaticBlock(ast) {
  const stack = [ast];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.type === 'StaticBlock') return node;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) stack.push(item);
      } else if (isNode(value)) {
        stack.push(value);
      }
    }
  }
  return null;
}

let failed = false;
for (const file of process.argv.slice(2)) {
  const ast = acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 2022, sourceType: 'script', locations: true });
  const block = findStaticBlock(ast);
  if (block) {
    console.error(`✗ ${file}:${block.loc.start.line}:${block.loc.start.column} - class static block (breaks Chrome 92, #128)`);
    failed = true;
  } else {
    console.log(`✓ ${file}: no class static block`);
  }
}
process.exitCode = failed ? 1 : 0;
