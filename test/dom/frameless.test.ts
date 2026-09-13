/*
 * frameless (and the embedded contexts sharing its rule) has one job: leave
 * nothing of the card's own chrome behind, so a Multi row reads as a row and
 * not as a card inside a card. It does that by neutralising every custom
 * property ha-card paints with - and ha-card gained one, --ha-card-backdrop-
 * filter, which a glass theme sets globally: a transparent background does
 * not stop a filter, so nested rows kept frosting what they sat on.
 *
 * Asserted off the stylesheet rather than the DOM: these are inherited custom
 * properties whose effect lives inside ha-card's own shadow root, which
 * happy-dom does not resolve.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import { CARD_CSS } from '../../src/utils/styles.js';
import '../../src/index.js';

// Every property ha-card's own :host block paints with, and what it must be
// given for the card to disappear (home-assistant/frontend, ha-card.ts).
const NEUTRALISED = {
  '--ha-card-background': 'transparent',
  '--ha-card-border-width': '0',
  '--ha-card-box-shadow': 'none',
  '--ha-card-backdrop-filter': 'none',
};

const framelessRule = () => {
  const start = CARD_CSS.indexOf('.frameless {');
  assert.notEqual(start, -1, 'the frameless rule is gone');
  return CARD_CSS.slice(start, CARD_CSS.indexOf('}', start));
};

describe('frameless - nothing of the card is left behind', () => {
  for (const [property, value] of Object.entries(NEUTRALISED)) {
    test(`${property} is neutralised`, () => {
      assert.match(framelessRule(), new RegExp(`${property}:\\s*${value}\\s*;`));
    });
  }
});

test('a decoration no variable can reach is dropped too', () => {
  // A glass theme paints ha-card::before, out of reach of every --ha-card-*
  // above; our sheet is adopted, so it cascades after card_mod's own <style>.
  assert.match(CARD_CSS, /\.frameless::before[^{]*\{\s*content:\s*none;/);
});

describe('a Multi row is frameless, whichever aggregator builds it', () => {
  for (const tag of ['entity-progress-multi-card', 'entity-progress-multi-feature']) {
    test(`${tag} hands every row frameless and marginless`, async () => {
      const el = document.createElement(tag) as HTMLElement & {
        setConfig?: (c: unknown) => void;
        hass?: unknown;
      };
      el.setConfig?.({ type: `custom:${tag}`, entities: [TEST_ENTITY, TEST_ENTITY] });
      document.body.appendChild(el);
      el.hass = makeHass();
      await flushFrames();
      await flushFrames();
      const rows = (el.shadowRoot as ShadowRoot).querySelectorAll('entity-progress-card');
      assert.equal(rows.length, 2, 'both rows should have been built');
      for (const row of rows) {
        const classes = row.shadowRoot?.querySelector('ha-card')?.getAttribute('class') ?? '';
        assert.match(classes, /\bframeless\b/, 'a row must not draw its own card');
        assert.match(classes, /\bmarginless\b/);
      }
    });
  }
});
