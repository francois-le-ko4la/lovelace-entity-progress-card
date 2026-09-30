/*
 * What the editors show and write, not only that they build: the value a
 * config puts in a field, and the config a field sends back. The -100 a Multi
 * row editor showed for center_zero's min_value, while its card drew from -30,
 * is the kind of drift only this layer sees.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { flushFrames } from '../dom-setup.js';
import { makeHass, TEST_ENTITY } from '../ha-stubs.js';
import { assertUndefined, visibleFields, type FieldTree } from '../helpers.js';

import { EditorFactory } from '../../src/editor/factory.js';
import '../../src/index.js';
import '../../src/editor/entry.js';

type EditorEl = HTMLElement & { setConfig?: (c: unknown) => void; hass?: unknown };
type FieldEl = HTMLElement & { value?: unknown };
type SentConfig = Record<string, unknown>;

const CARD_EDITOR = 'entity-progress-card-editor';
const CARD_TYPE = 'custom:entity-progress-card';
const MULTI_EDITOR = 'entity-progress-multi-card-editor';
const MULTI_ROW_EDITOR = 'entity-progress-multi-card-row-editor';
const MULTI_TYPE = 'custom:entity-progress-multi-card';
const PRESET = 'optimal_when_low';
const SEGMENT = 'segment';
const BAR_COLOR_MODE = 'bar_color_mode';
const INTERPOLATE = 'interpolate';
const BACKGROUND = 'background';

const mountEditor = async (tag: string, config: Record<string, unknown>) => {
  const el = document.createElement(tag) as EditorEl;
  el.hass = makeHass();
  el.setConfig?.({ entity: TEST_ENTITY, ...config });
  document.body.appendChild(el);
  await flushFrames();

  const sent: SentConfig[] = [];
  el.addEventListener('config-changed', (e) => sent.push((e as CustomEvent).detail.config));
  const field = (name: string): FieldEl => {
    const found = (el.shadowRoot as ShadowRoot).querySelector(`[id="${name}"]`) as FieldEl | null;
    assert.ok(found, `no field named ${name}`);
    return found;
  };
  // A user edit: the field's own value-changed, then the frame the editor
  // batches its config-changed into.
  const write = async (name: string, value: unknown): Promise<SentConfig> => {
    const detail = { value };
    field(name).dispatchEvent(new CustomEvent('value-changed', { detail, bubbles: true, composed: true }));
    await flushFrames();
    const last = sent.at(-1);
    assert.ok(last, `writing ${name} sent no config`);
    return last;
  };
  return { field, write };
};

describe('min_value under center_zero shows what the card will draw from', () => {
  const cases: { label: string; config: Record<string, unknown>; min: number }[] = [
    { label: 'mirrors a numeric max_value', config: { center_zero: true, max_value: 30 }, min: -30 },
    {
      label: "starts at a raw-value theme's bottom",
      config: { center_zero: true, max_value: 30, theme: 'temperature' },
      min: -50,
    },
    { label: 'stays at 0 without center_zero', config: { max_value: 30 }, min: 0 },
  ];
  const editors = [CARD_EDITOR, MULTI_ROW_EDITOR, 'entity-progress-multi-feature-row-editor'];

  for (const tag of editors) {
    for (const { label, config, min } of cases) {
      test(`${tag}: ${label}`, async () => {
        const { field } = await mountEditor(tag, config);
        assert.equal(field('min_value').value, min);
      });
    }
  }
});

describe('center_zero round-trips through its two sub-fields', () => {
  test('value and growth_percent write the object, and fold back to true', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, center_zero: true });
    const value = 'center_zero_value';
    const growth = 'center_zero_growth_percent';
    assert.deepEqual((await write(value, 10)).center_zero, { value: 10, growth_percent: false });
    assert.deepEqual((await write(growth, true)).center_zero, { value: 10, growth_percent: true });
    assert.deepEqual((await write(value, 0)).center_zero, { value: 0, growth_percent: true });
    assert.equal((await write(growth, false)).center_zero, true);
  });
});

describe('a theme takes what it drives with it', () => {
  test('clearing the preset drops bar_color_mode and interpolate', async () => {
    const { write } = await mountEditor(CARD_EDITOR, {
      type: CARD_TYPE,
      theme: PRESET,
      bar_color_mode: SEGMENT,
      interpolate: true,
    });
    const sent = await write('theme', '');
    for (const key of ['theme', BAR_COLOR_MODE, INTERPOLATE]) {
      assert.equal(key in sent, false, `${key} should leave with the theme`);
    }
  });

  test('a trip to custom and back restores the preset and its color mode', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, theme: PRESET, bar_color_mode: SEGMENT });
    const custom = await write('theme_mode', 'custom');
    assert.deepEqual(custom.custom_theme, []);
    assert.equal(BAR_COLOR_MODE in custom, false, 'a custom theme with no zone yet colors nothing');
    const preset = await write('theme_mode', 'preset');
    assert.equal(preset.theme, PRESET);
    assertUndefined(preset.custom_theme);
    assert.equal(preset.bar_color_mode, SEGMENT, 'the parked color mode came back with the preset');
  });
});

// A '' saved as is stays in the YAML, where the schema warns about a value
// nobody typed.
describe('an emptied field unsets its option', () => {
  test('a select leaves the config', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, bar_position: 'top' });
    assert.equal('bar_position' in (await write('bar_position', '')), false);
  });

  test('a nested field leaves its parent, which stays to keep the section on', async () => {
    const { write } = await mountEditor(CARD_EDITOR, {
      type: CARD_TYPE,
      alert_when: { highlight: 'label', label: 'Hot' },
    });
    assert.deepEqual((await write('alert_when.label', '')).alert_when, { highlight: 'label' });
    assert.deepEqual((await write('alert_when.highlight', '')).alert_when, {});
  });

  test('0 and false are values, not empty', async () => {
    const { write } = await mountEditor(CARD_EDITOR, {
      type: CARD_TYPE,
      theme: PRESET,
      interpolate: true,
      trend_indicator: { threshold: 2 },
    });
    assert.equal((await write(INTERPOLATE, false)).interpolate, false);
    const trend = (await write('trend_indicator.threshold', 0)).trend_indicator as SentConfig;
    assert.equal(trend.threshold, 0);
  });
});

// An option that loses its effect leaves the YAML but not the session: parked,
// and back as soon as it has an effect again (schema.ts's INERT_OPTIONS).
describe('an option with no effect is parked, not lost', () => {
  const TEXT_SHADOW = 'text_shadow';
  const POSITION = 'bar_position';

  test('a theme taken away and put back brings its colour mode back', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, theme: PRESET, bar_color_mode: SEGMENT });
    const cleared = await write('theme', '');
    assert.equal(BAR_COLOR_MODE in cleared, false);
    assert.equal(
      Object.keys(cleared).some((key) => key.startsWith('_')),
      false,
      'a parked value leaked into the YAML',
    );
    assert.equal((await write('theme', PRESET)).bar_color_mode, SEGMENT);
  });

  test('overlay → default → overlay keeps text_shadow', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, [POSITION]: 'overlay', [TEXT_SHADOW]: true });
    assert.equal(TEXT_SHADOW in (await write(POSITION, 'default')), false);
    assert.equal((await write(POSITION, 'overlay')).text_shadow, true);
  });

  test('compact_below holds on a card that never wrote its layout', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE });
    assert.equal((await write(POSITION, 'compact_below')).bar_position, 'compact_below');
  });

  test('a value set anew in between wins over the parked one', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, [POSITION]: 'compact_below' });
    assert.equal(POSITION in (await write('layout', 'vertical')), false);
    await write(POSITION, 'top');
    assert.equal((await write('layout', 'horizontal')).bar_position, 'top');
  });
});

// The editor writes what schema.ts's densityOverrides forces - minus the
// defaults, which leave no key behind.
describe('a density takes over what shares its row', () => {
  const MULTILINE = 'multiline';

  test('compact moves the bar off the text row and drops a multiline it ignores', async () => {
    const { write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, bar_position: 'below', [MULTILINE]: true });
    const sent = await write('density', 'compact');
    assert.equal(sent.bar_position, 'top');
    assert.equal(MULTILINE in sent, false);
  });

  test('single_line forces only defaults, so it writes none of them', async () => {
    const { write } = await mountEditor(CARD_EDITOR, {
      type: CARD_TYPE,
      layout: 'vertical',
      bar_position: 'top',
      [MULTILINE]: true,
    });
    const sent = await write('density', 'single_line');
    for (const key of ['layout', 'bar_position', MULTILINE]) assert.equal(key in sent, false, key);
  });
});

// The same rules schema.ts's postProcess resets by (HAS_EFFECT): an option the
// card would throw away is not offered in the first place.
describe('an option the card would reset is not offered', () => {
  const tree = EditorFactory.build({ template: false, badge: false }) as unknown as FieldTree;
  const shows = (config: Record<string, unknown>, field: string) => visibleFields(tree, config).has(field);
  const TEXT_SHADOW = 'text_shadow';
  const MAX_WIDTH = 'bar_max_width_toggle';

  test('overlay and background decide bar_single_line and text_shadow', () => {
    assert.equal(shows({ bar_position: 'overlay' }, 'bar_single_line'), true);
    assert.equal(shows({ bar_position: 'overlay' }, TEXT_SHADOW), true);
    assert.equal(shows({ bar_position: BACKGROUND }, 'bar_single_line'), false);
    assert.equal(shows({ bar_position: BACKGROUND }, TEXT_SHADOW), true);
    assert.equal(shows({ bar_position: 'default' }, TEXT_SHADOW), false);
  });

  test('bar_size is gone where the position sets the thickness', () => {
    for (const position of ['top', 'bottom', 'overlay', BACKGROUND]) {
      assert.equal(shows({ bar_position: position }, 'bar_size'), false, position);
    }
    assert.equal(shows({}, 'bar_size'), true);
  });

  test('bar_max_width and reverse_secondary_info_row need the default horizontal row', () => {
    assert.equal(shows({}, MAX_WIDTH), true);
    assert.equal(shows({ bar_size: 'xlarge' }, MAX_WIDTH), false);
    assert.equal(shows({ bar_position: 'top' }, MAX_WIDTH), false);
    assert.equal(shows({}, 'reverse_secondary_info_row'), true);
    assert.equal(shows({ layout: 'vertical' }, 'reverse_secondary_info_row'), false);
  });

  test('trend_indicator gives way to a status_label template', () => {
    const toggle = 'trend_indicator.toggle';
    assert.equal(shows({}, toggle), true);
    assert.equal(shows({ status_label: { jinja: '{{ 1 }}' } }, toggle), false);
  });

  test('bar_color_mode needs a theme, interpolate an auto color mode too', () => {
    assert.equal(shows({}, BAR_COLOR_MODE), false);
    assert.equal(shows({ theme: PRESET }, BAR_COLOR_MODE), true);
    assert.equal(shows({ theme: PRESET }, INTERPOLATE), true);
    assert.equal(shows({ theme: PRESET, bar_color_mode: SEGMENT }, INTERPOLATE), false);
  });
});

// "Migrate config" shows whenever hasDeprecatedOptions flags the config, so it
// has to migrate every one of those - on a Multi and on one of its rows too,
// or it stays on screen doing nothing.
describe('Migrate config clears what made it appear', () => {
  const MIGRATE = '_migrate_config';

  test('an option without effect shows the button, and the click clears it', async () => {
    const { field, write } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, text_shadow: true });
    assert.notEqual(field(MIGRATE).style.display, 'none', 'text_shadow off overlay should offer a clean-up');
    assert.equal('text_shadow' in (await write(MIGRATE, true)), false);
    assert.equal(field(MIGRATE).style.display, 'none');
  });

  test('a clean card offers nothing to migrate', async () => {
    const { field } = await mountEditor(CARD_EDITOR, { type: CARD_TYPE, bar_position: 'overlay', text_shadow: true });
    assert.equal(field(MIGRATE).style.display, 'none');
  });

  test('a Multi row: disable_unit folds into hide', async () => {
    const { write } = await mountEditor(MULTI_ROW_EDITOR, { disable_unit: true });
    const sent = await write(MIGRATE, true);
    assert.deepEqual(sent.hide, ['unit']);
    assertUndefined(sent.disable_unit);
  });

  test('a Multi Card: value_position becomes reverse_secondary_info_row', async () => {
    const { write } = await mountEditor(MULTI_EDITOR, {
      type: MULTI_TYPE,
      entities: [TEST_ENTITY, TEST_ENTITY],
      value_position: 'right',
    });
    const sent = await write(MIGRATE, true);
    assert.equal(sent.reverse_secondary_info_row, true);
    assertUndefined(sent.value_position);
  });

  test("a Multi Card: a card option's old form at the shared level migrates too", async () => {
    const { write } = await mountEditor(MULTI_EDITOR, {
      type: MULTI_TYPE,
      entities: [TEST_ENTITY, TEST_ENTITY],
      disable_unit: true,
    });
    const sent = await write(MIGRATE, true);
    assert.deepEqual(sent.hide, ['unit']);
    assertUndefined(sent.disable_unit);
  });
});

// The row editor opens behind the list's pencil and writes back through its
// host, which settles the shared level: agreement moves up, rows drop it.
describe('a Multi row edit settles through its host', () => {
  test('a value every row now agrees on moves up to the shared level', async () => {
    const host = document.createElement(MULTI_EDITOR) as EditorEl;
    host.hass = makeHass();
    host.setConfig?.({
      type: MULTI_TYPE,
      entities: [{ entity: TEST_ENTITY, bar_color: 'red' }, { entity: 'sensor.other' }],
    });
    document.body.appendChild(host);
    await flushFrames();
    const sent: SentConfig[] = [];
    host.addEventListener('config-changed', (e) => sent.push((e as CustomEvent).detail.config));

    host.dispatchEvent(new CustomEvent('epb-edit-row', { detail: { index: 1 } }));
    const row = host.shadowRoot?.querySelector(MULTI_ROW_EDITOR);
    assert.ok(row, 'the pencil opened no row editor');
    const field = row.shadowRoot?.querySelector('[id="bar_color"]');
    assert.ok(field, 'the row editor has no bar_color field');
    field.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'red' }, bubbles: true, composed: true }));
    await flushFrames();
    await flushFrames();

    const last = sent.at(-1);
    assert.ok(last, 'the host sent no config');
    assert.equal(last.bar_color, 'red', 'the value both rows share belongs to the shared level');
    for (const entry of last.entities as Record<string, unknown>[]) assertUndefined(entry.bar_color);
  });
});
