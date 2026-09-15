/*
 * The Multi's shared level is not a place to configure - it is where agreement
 * between rows ends up (see editors.ts's cascade). Everything here is a shape
 * that was, or could be, wrong in a way nothing else catches: the YAML looks
 * plausible either way.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { cascade } from '../../src/editor/multi-cascade.js';

type Cfg = Record<string, unknown>;
const run = (config: Cfg): Cfg => cascade(config as never) as unknown as Cfg;

const BLACK = 'input_number.ink_black';
const BLACK_NAME = 'Black';
const SHARED_NAME = 'Ink';
const SHARED_ICON = 'mdi:printer';
const CYAN = 'input_number.ink_cyan';

describe('the Multi row cascade', () => {
  test('a lone row sets the card - one copy is a rule when it is the only one', () => {
    const out = run({
      entities: [{ entity: BLACK, name: BLACK_NAME, bar_color: 'black', decimal: 0 }],
    });
    // Whoever configures the first row is describing the stack: the rows added
    // next inherit it instead of being configured all over again.
    assert.equal(out.bar_color, 'black');
    assert.equal(out.decimal, 0);
    // Except what tells one row from another - that stays where it belongs.
    assert.equal('name' in out, false, 'a name can never be a shared default');
    assert.deepEqual(out.entities, [{ entity: BLACK, name: BLACK_NAME }]);
  });

  test('a second row inherits what the first one settled, and adds nothing', () => {
    const settled = run({ entities: [{ entity: BLACK, bar_color: 'black' }] });
    const out = run({ ...settled, entities: [...(settled.entities as unknown[]), { entity: CYAN }] });
    assert.equal(out.bar_color, 'black');
    assert.deepEqual(out.entities, [{ entity: BLACK }, { entity: CYAN }]);
  });

  test('a lone row that contradicts the shared level wins it over', () => {
    const out = run({ bar_color: 'black', entities: [{ entity: BLACK, bar_color: 'cyan' }] });
    assert.equal(out.bar_color, 'cyan');
    assert.deepEqual(out.entities, [{ entity: BLACK }]);
  });

  test('two rows that agree hand the value up, and stop repeating it', () => {
    const out = run({
      entities: [
        { entity: BLACK, bar_size: 'xsmall' },
        { entity: CYAN, bar_size: 'xsmall' },
      ],
    });
    assert.equal(out.bar_size, 'xsmall');
    assert.deepEqual(out.entities, [{ entity: BLACK }, { entity: CYAN }]);
  });

  test('a name never rises, however many rows agree on it', () => {
    const out = run({
      entities: [
        { entity: BLACK, name: SHARED_NAME, icon: SHARED_ICON },
        { entity: CYAN, name: SHARED_NAME, icon: SHARED_ICON },
      ],
    });
    assert.equal(out.name, undefined, 'name identifies a row, it is never a default');
    assert.equal(out.icon, undefined, 'same for the icon');
    assert.deepEqual(out.entities, [
      { entity: BLACK, name: SHARED_NAME, icon: SHARED_ICON },
      { entity: CYAN, name: SHARED_NAME, icon: SHARED_ICON },
    ]);
  });

  test('a name already sitting at the shared level is given back to the rows', () => {
    const out = run({
      name: BLACK_NAME,
      bar_color: 'black',
      entities: [{ entity: BLACK }, { entity: CYAN, name: 'Cyan', bar_color: 'cyan' }],
    });
    assert.equal('name' in out, false, 'the stale shared name must go');
    // One black against one cyan elects nothing, so the colour follows the
    // name down rather than staying as a default nobody voted for.
    assert.equal('bar_color' in out, false);
    assert.deepEqual(out.entities, [
      { entity: BLACK, name: BLACK_NAME, bar_color: 'black' },
      { entity: CYAN, name: 'Cyan', bar_color: 'cyan' },
    ]);
  });
});

describe('the Multi row cascade - the election', () => {
  test('a shared value every row contradicts is dead weight', () => {
    const out = run({
      bar_color: 'black',
      entities: [
        { entity: BLACK, bar_color: 'grey' },
        { entity: CYAN, bar_color: 'cyan' },
      ],
    });
    assert.equal('bar_color' in out, false);
  });

  test('a row is left alone when it says what the shared level already says', () => {
    const out = run({
      bar_size: 'xsmall',
      entities: [{ entity: BLACK, bar_size: 'xsmall' }, { entity: CYAN }],
    });
    assert.equal(out.bar_size, 'xsmall');
    assert.deepEqual(out.entities, [{ entity: BLACK }, { entity: CYAN }], 'the redundant copy goes');
  });

  // The election, and the only rule that decides it: a value carried once
  // describes one entity, a value carried twice describes the stack.
  test('the majority value rises, the minority keep their own', () => {
    const out = run({
      entities: [
        { entity: BLACK, bar_color: 'black' },
        { entity: 'sensor.b', bar_color: 'black' },
        { entity: CYAN, bar_color: 'cyan' },
        { entity: 'sensor.d', bar_color: 'magenta' },
      ],
    });
    assert.equal(out.bar_color, 'black', 'two rows out of four is enough to make it the default');
    assert.deepEqual(out.entities, [
      { entity: BLACK },
      { entity: 'sensor.b' },
      { entity: CYAN, bar_color: 'cyan' },
      { entity: 'sensor.d', bar_color: 'magenta' },
    ]);
  });

  test('all-different values stay on their own rows', () => {
    const out = run({
      entities: [
        { entity: BLACK, bar_color: 'black' },
        { entity: CYAN, bar_color: 'cyan' },
      ],
    });
    assert.equal(out.bar_color, undefined, 'a single copy of each is nobody agreeing');
    assert.deepEqual(out.entities, [
      { entity: BLACK, bar_color: 'black' },
      { entity: CYAN, bar_color: 'cyan' },
    ]);
  });
});

describe('the Multi row cascade - what a row is left holding', () => {
  // The trap the election opens: a row reading the old shared value must not
  // silently change colour because the vote moved.
  test('a row losing its shared value writes down what it was rendering', () => {
    const out = run({
      bar_color: 'black',
      entities: [{ entity: BLACK }, { entity: CYAN, bar_color: 'cyan' }, { entity: 'sensor.d', bar_color: 'cyan' }],
    });
    assert.equal(out.bar_color, 'cyan', 'two cyan rows outvote the shared black');
    assert.deepEqual(out.entities, [{ entity: BLACK, bar_color: 'black' }, { entity: CYAN }, { entity: 'sensor.d' }]);
  });

  test('a tie keeps whatever is already shared, so the winner cannot flip', () => {
    const out = run({
      bar_color: 'cyan',
      entities: [
        { entity: BLACK, bar_color: 'black' },
        { entity: 'sensor.b', bar_color: 'black' },
        { entity: CYAN },
        { entity: 'sensor.d' },
      ],
    });
    assert.equal(out.bar_color, 'cyan');
  });

  test('the bare entity-id shorthand survives the round trip', () => {
    const out = run({ entities: [BLACK, CYAN] });
    assert.deepEqual(out.entities, [{ entity: BLACK }, { entity: CYAN }]);
  });
});
