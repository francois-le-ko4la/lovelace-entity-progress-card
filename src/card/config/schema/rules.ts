import { CARD, TEXT_HIDE_GROUP } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import {
  BAR_AROUND_ICON,
  ORIENTATION_STRAIGHT,
  ORIENTATION_AROUND_ICON,
  HORIZONTAL,
  DENSITY_COMPACT_BAR_POSITIONS,
  RING_ORIENTATIONS,
  CONTENT_ORDER_TOKENS,
} from './enums.js';
import { statusLabelObj } from './marks.js';

const hasStraightBar = (c: ConfigLike) => c.bar_position !== BAR_AROUND_ICON;

// The orientation a config's bar_position speaks: a value of the other family
// is translated, anything else (up, down, unset) is left alone.
const translateOrientation = (c: ConfigLike): unknown => {
  const orientation = c.bar_orientation as string | undefined;
  const table = hasStraightBar(c) ? ORIENTATION_STRAIGHT : ORIENTATION_AROUND_ICON;
  return (orientation && table[orientation]) || orientation;
};

type ConfigLike = Record<string, unknown>;

const hasTheme = (c: ConfigLike) => !is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme);

const hasStack = (c: ConfigLike) => is.nonEmptyArray((c.bar_stack as { entities?: unknown } | undefined)?.entities);

// rainbow_full's pill needs a 16px bar row, vertical's only from large up:
// styles.ts grows it (.rainbow-full-raised), minGridRows reserves the row.
const raisesRainbowFullRow = (c: ConfigLike) =>
  c.layout === CARD.layout.orientations.vertical.label &&
  c.bar_color_mode === 'rainbow_full' &&
  ['xsmall', 'small', 'medium'].includes(c.bar_size as string);

// Badge and Multi rows carry no layout/bar_position key at all, and render as
// exactly this row.
const isDefaultRow = (c: ConfigLike) =>
  (c.layout ?? HORIZONTAL) === HORIZONTAL && (c.bar_position ?? 'default') === 'default';

// single_column is the default stack with its shape settled (densityOverrides).
const STACK_DENSITIES = ['default', 'single_column'];
const isStackDensity = (c: ConfigLike) => STACK_DENSITIES.includes((c.density as string | undefined) ?? 'default');

// xlarge would send the bar below the text (applyBelowBarPositionRule): a
// density that settles the shape keeps it at large instead.
const SIZES = CARD.style.bar.sizeOptions;
const noXlarge = (c: ConfigLike): ConfigLike => (c.bar_size === SIZES.xlarge ? { bar_size: SIZES.large } : {});

// What a density forces: single_line a horizontal row holding the bar,
// single_column a vertical stack, bar upright; compact keeps it off the text.
const densityOverrides = (c: ConfigLike): ConfigLike => {
  if (c.density === 'single_line')
    return { layout: HORIZONTAL, bar_position: 'default', multiline: false, ...noXlarge(c) };
  if (c.density === 'single_column')
    return {
      layout: CARD.layout.orientations.vertical.label,
      bar_position: c.bar_position === 'overlay' ? 'overlay' : 'default',
      bar_orientation: c.bar_orientation === 'down' ? 'down' : 'up',
      multiline: false,
      ...noXlarge(c),
    };
  if (c.density !== 'compact') return {};
  return {
    ...(DENSITY_COMPACT_BAR_POSITIONS.includes(c.bar_position as string) ? {} : { bar_position: 'top' }),
    multiline: false,
  };
};

// A raw config read as its density shapes it: single_column says vertical
// without a layout key.
const settled = (c: ConfigLike): ConfigLike => ({ ...c, ...densityOverrides(c) });

// name, secondary_info and the bar stacked in one column.
const isVerticalStack = (raw: ConfigLike) => {
  const config = settled(raw);
  return (
    config.layout === CARD.layout.orientations.vertical.label &&
    (config.bar_position ?? 'default') === 'default' &&
    isStackDensity(config)
  );
};

const isUpright = (c: ConfigLike) => ['up', 'down'].includes(c.bar_orientation as string);

// How content_order lays its lines out: stacked rows (vertical), two lines
// (horizontal), compact_below's single line over the bar, or single_line's row
// with the bar in it. null: no say.
type ContentShape = 'stack' | 'lines' | 'line' | 'row';
// Positions drawing the bar outside the text: only the texts are ordered there.
const BAR_OUTSIDE_TEXT = ['below', 'top', 'bottom', 'overlay', 'background'];
const contentShape = (raw: ConfigLike): ContentShape | null => {
  const config = settled(raw);
  if (config.density === 'single_line') return 'row';
  if (!isStackDensity(config)) return null;
  const position = (config.bar_position as string | undefined) ?? 'default';
  const horizontal = (config.layout ?? HORIZONTAL) === HORIZONTAL;
  if (position === 'compact_below') return horizontal ? 'line' : null;
  if (position !== 'default' && !BAR_OUTSIDE_TEXT.includes(position)) return null;
  if (horizontal) return 'lines';
  return config.layout === CARD.layout.orientations.vertical.label ? 'stack' : null;
};
// Only bar_position: default puts the bar among the texts.
const contentHoldsBar = (c: ConfigLike) => (c.bar_position ?? 'default') === 'default';

// Each shape's lines as the card always drew them.
const NAME_GROUP = ['name', 'name_info'];
const INFO_GROUP = ['info', 'state_content', 'value'];
const defaultLines = (tokens: readonly string[], shape: ContentShape): string[][] => {
  const of = (group: readonly string[]) => tokens.filter((token) => group.includes(token));
  if (shape === 'stack') return [of(NAME_GROUP), of(INFO_GROUP), of(['bar'])].filter((line) => line.length > 0);
  if (shape === 'lines') return [of(NAME_GROUP), [...of(INFO_GROUP), ...of(['bar'])]];
  return [[...of(NAME_GROUP), ...of(INFO_GROUP), ...(shape === 'row' ? of(['bar']) : [])]];
};

// content_order as written, read in a shape: a flat list is one line, or one
// row per token in the stack; horizontal folds a third line into the second.
const readLines = (order: readonly unknown[], shape: ContentShape, withBar = true): string[][] => {
  const nested = order.some(is.array);
  const written = nested ? (order.filter(is.array) as string[][]) : [order as string[]];
  // Without the bar, a line that held only it goes too.
  const lines = withBar
    ? written
    : written.filter((line) => line.length === 0 || line.some((token) => token !== 'bar'));
  const read = (line: string[]) => (withBar ? line : line.filter((token) => token !== 'bar'));
  if (shape === 'stack') return nested ? lines.map(read) : read(lines[0] ?? []).map((token) => [token]);
  if (shape === 'lines') return (lines.length > 2 ? [lines[0], lines.slice(1).flat()] : lines).map(read);
  return [lines.flat().filter((token) => shape === 'row' || token !== 'bar')];
};

const joinLines = (lines: readonly (readonly string[])[]) => lines.map((line) => line.join()).join('|');
const contentKeyLines = (key?: string): string[][] =>
  key === undefined ? [] : key.split('|').map((line) => (line ? line.split(',') : []));

// The hide target a token's ✕ writes; Template's info is its secondary_info.
const hideTargetOf = (token: string, template = false) => {
  if (token === 'bar') return 'progress_bar';
  return template && token === 'info' ? 'secondary_info' : token;
};
// A token a list hide removes, by its own target or its group's.
const isHiddenToken = (c: ConfigLike, token: string, template = false) =>
  is.array(c.hide) &&
  [hideTargetOf(token, template), TEXT_HIDE_GROUP[token]].some((target) => (c.hide as unknown[]).includes(target));

// A text with no field behind it: an empty leaf, so none.
const isUnsetToken = (c: ConfigLike, token: string) => {
  if (token === 'name_info') return !c.name_info;
  if (token === 'info') return !c.custom_info && !c.secondary;
  if (token === 'state_content') return !is.nonEmptyString(c.state_content) && !is.nonEmptyArray(c.state_content);
  return false;
};

// content_order read in its shape, minus the texts a list hide removes or no
// field fills; undefined in the shape's default, so the markup and key stay.
const contentOrderKey = (c: ConfigLike): string | undefined => {
  const shape = contentShape(c);
  const order = c.content_order;
  if (!shape || !is.array(order)) return undefined;
  const lines = readLines(order, shape, contentHoldsBar(c))
    .map((line) => line.filter((token) => token === 'bar' || !(isHiddenToken(c, token) || isUnsetToken(c, token))))
    .filter((line) => shape !== 'stack' || line.length > 0);
  const present = lines.flat();
  const tokens = CONTENT_ORDER_TOKENS.filter((token) => present.includes(token));
  const key = joinLines(lines);
  return key === joinLines(defaultLines(tokens, shape)) ? undefined : key;
};

// Where each option has any effect: postProcess resets it everywhere else, the
// editor hides its field there. Reads a raw config as well as a negotiated one.
const HAS_EFFECT = {
  // Only these three lay the bar out vertically (HACore#_addBaseClasses).
  barOrientationUp: (raw: ConfigLike) => {
    const config = settled(raw);
    return (
      (config.layout === CARD.layout.orientations.vertical.label && config.bar_position === 'overlay') ||
      config.bar_position === 'background' ||
      isVerticalStack(config)
    );
  },
  // These positions set the bar's thickness in CSS, whatever bar_size says; an
  // upright bar in the stack takes the column's height instead.
  barSize: (c: ConfigLike) =>
    !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position as string) &&
    !(isVerticalStack(c) && isUpright(c)),
  contentOrder: (c: ConfigLike) => contentShape(c) !== null,
  // Only .horizontal.small/.medium/.large honour it.
  barMaxWidth: (c: ConfigLike) => isDefaultRow(c) && c.bar_size !== CARD.style.bar.sizeOptions.xlarge,
  // layout: vertical forces the secondary-info row into a column.
  // An ordered row says where its bar goes.
  reverseSecondaryInfoRow: (c: ConfigLike) => isDefaultRow(c) && contentOrderKey(c) === undefined,
  barSingleLine: (c: ConfigLike) => c.bar_position === 'overlay',
  textEffect: (c: ConfigLike) => c.bar_position === 'overlay' || c.bar_position === 'background',
  // Vertical already stacks name/secondary_info narrowly.
  compactBelow: (c: ConfigLike) => (c.layout ?? HORIZONTAL) === HORIZONTAL,
  // center_zero included: themeDivergingGradient reprojects the zones per arm.
  barColorMode: hasTheme,
  interpolate: (c: ConfigLike) => hasTheme(c) && (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
  // Neither has a single fill fraction for cells to cut into.
  barSegments: (c: ConfigLike) => c.bar_color_mode !== 'rainbow_full' && !hasStack(c),
  // A text column beside the bar: a single_line row's, or the value next to a
  // default-row bar. bar_max_width pins the bar instead.
  barAligned: (c: ConfigLike) => !c.bar_max_width && (c.density === 'single_line' || HAS_EFFECT.barMaxWidth(c)),
  // Both take the top-right corner: a whole Jinja template outranks a toggle.
  trendIndicator: (c: ConfigLike) => !is.nonEmptyString(statusLabelObj(c.status_label).jinja),
};

// The hide targets compact + vertical takes off whatever hide says: the card
// toggles their class from it, the hide chips lock the same ones.
const densityForcedHide = (c: ConfigLike): string[] =>
  c.density === 'compact' && c.layout === CARD.layout.orientations.vertical.label
    ? [CARD.style.dynamic.hiddenComponent.name.label, CARD.style.dynamic.hiddenComponent.secondary_info.label]
    : [];

// An option set where it has no effect: postProcess puts its fallback, the
// schema's default, back; the editor parks the value until it has one again.
type InertOption = { key: string; hasEffect: (c: ConfigLike) => boolean; fallback: unknown };

const INERT_OPTIONS: InertOption[] = [
  // 'default', not 'below': the two only look the same in horizontal.
  {
    key: 'bar_position',
    hasEffect: (c) =>
      (c.bar_position !== 'compact_below' || HAS_EFFECT.compactBelow(c)) &&
      (c.bar_position !== BAR_AROUND_ICON || !(is.array(c.hide) && c.hide.includes('progress_bar'))),
    fallback: 'default',
  },
  { key: 'trend_indicator', hasEffect: HAS_EFFECT.trendIndicator, fallback: false },
  { key: 'bar_single_line', hasEffect: HAS_EFFECT.barSingleLine, fallback: false },
  { key: 'bar_max_width', hasEffect: HAS_EFFECT.barMaxWidth, fallback: undefined },
  {
    key: 'bar_orientation',
    hasEffect: (c) => {
      if (['up', 'down'].includes(c.bar_orientation as string)) return HAS_EFFECT.barOrientationUp(c);
      return !RING_ORIENTATIONS.includes(c.bar_orientation as string) || !hasStraightBar(c);
    },
    fallback: 'ltr',
  },
  { key: 'text_effect', hasEffect: HAS_EFFECT.textEffect, fallback: 'none' },
  // Before interpolate, which reads the colour mode it settles.
  { key: 'bar_color_mode', hasEffect: HAS_EFFECT.barColorMode, fallback: 'auto' },
  { key: 'bar_segments', hasEffect: HAS_EFFECT.barSegments, fallback: undefined },
  { key: 'bar_ring', hasEffect: (c) => !hasStraightBar(c), fallback: undefined },
  { key: 'interpolate', hasEffect: HAS_EFFECT.interpolate, fallback: false },
  { key: 'reverse_secondary_info_row', hasEffect: HAS_EFFECT.reverseSecondaryInfoRow, fallback: false },
  { key: 'content_order', hasEffect: HAS_EFFECT.contentOrder, fallback: undefined },
  // A ring has no stack of its own (yet).
  { key: 'bar_stack', hasEffect: hasStraightBar, fallback: undefined },
];

// What the editor parks and the audit reports: bar_size too, which the schema
// forces to the thickness top/bottom draw at rather than resetting it.
const OPTIONS_WITHOUT_EFFECT: InertOption[] = [
  ...INERT_OPTIONS,
  { key: 'bar_size', hasEffect: HAS_EFFECT.barSize, fallback: undefined },
];

export {
  translateOrientation,
  isUpright,
  contentShape,
  contentHoldsBar,
  contentOrderKey,
  hideTargetOf,
  isHiddenToken,
  contentKeyLines,
  defaultLines,
  readLines,
  hasStack,
  raisesRainbowFullRow,
  HAS_EFFECT,
  densityOverrides,
  densityForcedHide,
  INERT_OPTIONS,
  OPTIONS_WITHOUT_EFFECT,
};
export type { ContentShape };
