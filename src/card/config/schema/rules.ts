import { CARD } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import {
  BAR_AROUND_ICON,
  ORIENTATION_STRAIGHT,
  ORIENTATION_AROUND_ICON,
  HORIZONTAL,
  DENSITY_COMPACT_BAR_POSITIONS,
  RING_ORIENTATIONS,
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

// Where each option has any effect: postProcess resets it everywhere else, the
// editor hides its field there. Reads a raw config as well as a negotiated one.
const HAS_EFFECT = {
  // Only these two lay the bar out vertically (HACore#_addBaseClasses).
  barOrientationUp: (c: ConfigLike) =>
    (c.layout === CARD.layout.orientations.vertical.label && c.bar_position === 'overlay') ||
    c.bar_position === 'background',
  // These positions set the bar's thickness in CSS, whatever bar_size says.
  barSize: (c: ConfigLike) => !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position as string),
  // Only .horizontal.small/.medium/.large honour it.
  barMaxWidth: (c: ConfigLike) => isDefaultRow(c) && c.bar_size !== CARD.style.bar.sizeOptions.xlarge,
  // layout: vertical forces the secondary-info row into a column.
  reverseSecondaryInfoRow: isDefaultRow,
  barSingleLine: (c: ConfigLike) => c.bar_position === 'overlay',
  textShadow: (c: ConfigLike) => c.bar_position === 'overlay' || c.bar_position === 'background',
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

// What a density forces, whatever the options say: single_line has one shape,
// a horizontal row holding the bar; compact keeps the bar off the text row.
const densityOverrides = (c: ConfigLike): ConfigLike => {
  if (c.density === 'single_line') return { layout: HORIZONTAL, bar_position: 'default', multiline: false };
  if (c.density !== 'compact') return {};
  return {
    ...(DENSITY_COMPACT_BAR_POSITIONS.includes(c.bar_position as string) ? {} : { bar_position: 'top' }),
    multiline: false,
  };
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
  { key: 'text_shadow', hasEffect: HAS_EFFECT.textShadow, fallback: false },
  // Before interpolate, which reads the colour mode it settles.
  { key: 'bar_color_mode', hasEffect: HAS_EFFECT.barColorMode, fallback: 'auto' },
  { key: 'bar_segments', hasEffect: HAS_EFFECT.barSegments, fallback: undefined },
  { key: 'bar_ring', hasEffect: (c) => !hasStraightBar(c), fallback: undefined },
  { key: 'interpolate', hasEffect: HAS_EFFECT.interpolate, fallback: false },
  { key: 'reverse_secondary_info_row', hasEffect: HAS_EFFECT.reverseSecondaryInfoRow, fallback: false },
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
  hasStack,
  raisesRainbowFullRow,
  HAS_EFFECT,
  densityOverrides,
  densityForcedHide,
  INERT_OPTIONS,
  OPTIONS_WITHOUT_EFFECT,
};
