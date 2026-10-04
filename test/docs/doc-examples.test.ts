/*
 * The YAML in the docs is what users copy. The demo dashboards are already
 * confronted with the schema (demo-dashboard.test.ts); these were not, and a
 * documented option the card then drops - or a theme that does not exist -
 * reads as a feature that silently does nothing.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load as loadYaml } from 'js-yaml';
import { collectCards, droppedOptions, type Card } from './card-configs.js';

const FILES = ['docs/configuration.md', 'docs/cookbook.md', 'README.md'];

// A fenced ```yaml block, with the line it starts on.
const yamlBlocks = (file: string): { line: number; text: string }[] => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const blocks: { line: number; text: string }[] = [];
  let start = -1;
  lines.forEach((line, index) => {
    if (start < 0 && /^\s*```yaml\s*$/.test(line)) start = index;
    else if (start >= 0 && /^\s*```\s*$/.test(line)) {
      blocks.push({ line: start + 1, text: lines.slice(start + 1, index).join('\n') });
      start = -1;
    }
  });
  return blocks;
};

// The docs elide the rest of a config with a line of its own - `...` or
// `····` - which YAML can't read (`...` even ends the document).
const ELISION = /^\s*(\.\.\.|····|…)\s*$/;
const withoutElisions = (text: string) =>
  text
    .split('\n')
    .filter((line) => !ELISION.test(line))
    .join('\n');

const unreadable: string[] = [];
const cards: Card[] = FILES.flatMap((file) =>
  yamlBlocks(file).flatMap(({ line, text }) => {
    if (!text.includes('custom:entity-progress')) return [];
    try {
      return collectCards(loadYaml(withoutElisions(text)), `${file}:${line}`);
    } catch (error) {
      unreadable.push(`${file}:${line} → ${(error as Error).message.split('\n')[0]}`);
      return [];
    }
  }),
);

describe('the YAML in the docs is configs the card actually accepts', () => {
  test('the docs hold cards to check', () => {
    assert.ok(cards.length > 100, `only ${cards.length} cards collected - the blocks are not being found`);
  });

  test('every example of ours is valid YAML', () => {
    assert.deepEqual(unreadable, [], `\n${unreadable.join('\n')}\n`);
  });

  test('no example declares an option the schema then drops', () => {
    const lost = droppedOptions(cards);
    assert.deepEqual(lost, [], `\n${lost.join('\n')}\n`);
  });
});
