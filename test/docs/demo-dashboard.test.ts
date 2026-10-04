/*
 * The two demo dashboards are this project's closest thing to an end-to-end
 * suite - but nothing ever confronted what they write with what the card
 * actually reads. A key the schema doesn't know is dropped in silence, and a
 * demo that renders nothing looks like a demo that renders a default: the
 * peak_marker CSS-hook cards spent releases showing no mark at all because
 * their block was missing its required `window`.
 *
 * So: every card in both files goes through the very pipeline the card runs
 * (_customizeConfig, then the schema's parse), and must come out still
 * carrying every option it declared.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load as loadYaml } from 'js-yaml';
import { auditDashboard } from '../../src/card/card-audit.js';
import { collectCards, droppedOptions } from './card-configs.js';

const FILES = ['docs/demo-dashboard.yaml', 'docs/demo-dashboard-dev.yaml'];
const DASHBOARDS = new Map(FILES.map((file) => [file, loadYaml(fs.readFileSync(file, 'utf8'))]));

// Built to hold what a user shouldn't write: past issues' shapes, and the
// deprecated ones Migrate config rewrites.
const AUDIT_EXEMPT_VIEWS = new Set(['EP Demo - Regression tests (past issues)', 'EP Demo - Deprecated options']);

const cards = FILES.flatMap((file) => collectCards(DASHBOARDS.get(file), file));

describe('the demo dashboards are configs the card actually accepts', () => {
  test('both files hold cards to check', () => {
    assert.ok(cards.length > 500, `only ${cards.length} cards collected - the walk is not finding them`);
  });

  test('no card declares an option the schema then drops', () => {
    const lost = droppedOptions(cards);
    assert.deepEqual(lost, [], `\n${lost.join('\n')}\n`);
  });
});

describe('the demo dashboards show nothing a user would have to clean up', () => {
  for (const file of FILES) {
    test(file, () => {
      const { views } = DASHBOARDS.get(file) as { views: { title?: string }[] };
      const shown = views.filter((view) => !AUDIT_EXEMPT_VIEWS.has(view.title ?? ''));
      const findings = auditDashboard({ views: shown }, file).map(
        ({ where, notes }) => `${where}: ${notes.join('; ')}`,
      );
      assert.deepEqual(findings, [], `\n${findings.join('\n')}\n`);
    });
  }
});
