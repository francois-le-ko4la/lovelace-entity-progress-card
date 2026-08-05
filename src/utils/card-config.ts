/*
 * CARD: the assembled card config tree - base config/defaults, the HTML
 * structure (element tags + class names), style tokens (colors, icons, dynamic
 * CSS-variable names), layout/grid options, network event ids, and the console
 * banner text. No logic, just data. Built from local consts and assembled last
 * (see CARD below) so TypeScript sees the final shape from the start.
 */

import { HA_CONTEXT } from './ha-context.js';
import { META, VERSION } from './meta.js';

// Split out of the final CARD object (below) purely so `configDefaults`
// can reference `layout`/`style`/`configBase` by local binding instead of
// `CARD.xxx` - CARD doesn't exist yet while its own literal is being built.
// Same end result once assembled, just checkable by a static type system
// (no post-construction mutation adding keys TS can't see coming).
const configBase = {
  language: 'en',
  value: { min: 0, max: 100 },
  unit: {
    default: '%',
    fahrenheit: '°F',
    timer: 'timer',
    flexTimer: 'flextimer',
    second: 's',
    disable: '',
    space: ' ', // HA dont use '\u202F'
    unitSpacing: { auto: 'auto', space: 'space', noSpace: 'no-space' },
  },
  showMoreInfo: true,
  reverse: false,
  decimal: { percentage: 0, timer: 0, counter: 0, duration: 0, other: 2 },
  msFactor: 1000,
  shadowMode: 'open',
  stub: {
    template: {
      icon: HA_CONTEXT.icons.washingMachine,
      name: META.types.card.name,
      secondary: 'Template',
      badge_icon: HA_CONTEXT.icons.update,
      badge_color: 'green',
      percent: '{{ 50 }}',
      force_circular_background: true,
    },
  },
  separator: ' · ',
  configError: 'Invalid config',
};

const htmlStructure = {
  card: {
    element: 'ha-card',
    extraAttr: {
      role: 'region',
      tabindex: '0',
      'aria-label': META.types.card.name,
    },
  },
  sections: {
    container: { element: 'div', class: 'container' },
    ripple: { element: 'ha-ripple' },
    belowContainer: { element: 'div', class: 'below-container' },
    topContainer: { element: 'div', class: 'top-container' },
    bottomContainer: { element: 'div', class: 'bottom-container' },
    backgroundContainer: { element: 'div', class: 'background-container' },
    icon: { element: 'div', class: 'icon-section', extraAttr: { 'aria-hidden': 'true' } },
    content: { element: 'div', class: 'content-section' },
    // bar_position: compact_below (#123) only - wraps name+secondary_info so
    // they can share one row, with the bar as a separate sibling row below
    // (see StructureElements.createContentBody).
    nameSecondaryRow: { element: 'div', class: 'name-secondary-row' },
  },
  elements: {
    icon: { element: 'div', class: 'icon' },
    shape: { element: 'shape', class: 'shape' },
    ellipsisWrapper: { element: 'div', class: 'ellipsis-wrapper' },
    nameContent: { element: 'div', class: 'name' },
    nameValue: { element: 'span', class: 'name-value' },
    nameMain: { element: 'span', class: 'name-main', id: 'entity-name' },
    nameExtra: { element: 'span', class: 'name-extra' },
    trendIndicator: {
      container: { element: 'div', class: 'trend-indicator' },
      icon: { element: 'ha-icon', class: 'trend-icon' },
    },
    secondaryInfo: { element: 'div', class: 'secondary-info' },
    secondaryInfoWrapper: { element: 'div', class: 'secondary-info-wrapper' },
    // div, not span: a span here is forced `display: inline` by the
    // `.ellipsis-wrapper span` rule below, and inline boxes are
    // baseline-aligned rather than top-aligned - in the 8px-tall multiline
    // lines that pushed the text down and truncated it against the line's own
    // overflow:hidden. A div lays out from the top like every other block.
    secondaryInfoValue: { element: 'div', class: 'secondary-info-value' },
    secondaryInfoMain: { element: 'span', class: 'secondary-info-main', id: 'entity-value' },
    // secondaryInfoExtra is "line 1": in single-line mode it's the only extra
    // span; in multiline mode it's always the first of the two stacked lines
    // (see StructureElements.secondaryInfoLine, which never gives line 1 a
    // main).
    secondaryInfoExtra: { element: 'span', class: 'secondary-info-extra-1' },
    secondaryInfoExtra2: { element: 'span', class: 'secondary-info-extra-2' },
    progressBar: {
      container: {
        element: 'div',
        class: 'bar-container',
        extraAttr: {
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': 0,
          'aria-labelledby': 'entity-name',
          'aria-describedby': 'entity-value',
        },
      },
      bar: { element: 'div', class: 'progress-bar', extraAttr: { 'aria-hidden': 'true' } },
      half: { element: 'div', class: 'bar-half', extraAttr: { 'aria-hidden': 'true' } },
      inner: { element: 'div', class: 'inner', extraAttr: { 'aria-hidden': 'true' } },
      segments: { element: 'div', class: 'bar-segments', extraAttr: { 'aria-hidden': 'true' } },
      zeroMark: { element: 'div', class: 'zero', extraAttr: { 'aria-hidden': 'true' } },
      lowWatermark: { element: 'div', class: 'low', extraAttr: { 'aria-hidden': 'true' } },
      highWatermark: { element: 'div', class: 'high', extraAttr: { 'aria-hidden': 'true' } },
      watermark: { class: 'progress-bar-wm' },
    },
    badge: {
      container: { element: 'div', class: 'badge', extraAttr: { 'aria-hidden': 'true' } },
      icon: { element: 'ha-icon', class: 'badge-icon' },
    },
  },
};

const style = {
  element: 'style',

  color: {
    default: HA_CONTEXT.colors.stateIcon,
    disabled: HA_CONTEXT.colors.darkGrey,
    unavailable: HA_CONTEXT.colors.unavailable,
    notFound: HA_CONTEXT.colors.inactive,
    active: HA_CONTEXT.colors.active,
    coverActive: HA_CONTEXT.colors.coverActive,
    lightActive: '#FF890E',
    fanActive: HA_CONTEXT.colors.fanActive,
    battery: {
      low: HA_CONTEXT.colors.batteryLow,
      medium: HA_CONTEXT.colors.batteryMedium,
      high: HA_CONTEXT.colors.batteryHigh,
    },
    climate: {
      dry: HA_CONTEXT.colors.climateDry,
      cool: HA_CONTEXT.colors.climateCool,
      heat: HA_CONTEXT.colors.climateHeat,
      fanOnly: HA_CONTEXT.colors.climateFanOnly,
    },
    inactive: HA_CONTEXT.colors.inactive,
  },
  icon: {
    default: { icon: HA_CONTEXT.icons.alert },
    alert: { icon: HA_CONTEXT.icons.alertCircleOutline, color: '#0080ff', attribute: 'icon' },
    notFound: { icon: HA_CONTEXT.icons.help },
    badge: {
      default: { attribute: 'icon' },
      unavailable: {
        icon: HA_CONTEXT.icons.exclamationThick,
        color: 'white',
        backgroundColor: HA_CONTEXT.colors.orange,
        attribute: 'icon',
      },
      notFound: {
        icon: HA_CONTEXT.icons.exclamationThick,
        color: 'white',
        backgroundColor: HA_CONTEXT.colors.red,
        attribute: 'icon',
      },
      timer: {
        active: {
          icon: HA_CONTEXT.icons.play,
          color: 'white',
          backgroundColor: HA_CONTEXT.colors.success,
          attribute: 'icon',
        },
        paused: {
          icon: HA_CONTEXT.icons.pause,
          color: 'white',
          backgroundColor: HA_CONTEXT.colors.stateIcon,
          attribute: 'icon',
        },
      },
    },
  },
  bar: {
    sizeOptions: {
      xsmall: { label: 'xsmall', mdi: HA_CONTEXT.icons.sizeExtraSmall },
      small: { label: 'small', mdi: HA_CONTEXT.icons.sizeSmall },
      medium: { label: 'medium', mdi: HA_CONTEXT.icons.sizeMedium },
      large: { label: 'large', mdi: HA_CONTEXT.icons.sizeLarge },
      xlarge: { label: 'xlarge', mdi: HA_CONTEXT.icons.sizeXLarge },
    },
  },
  dynamic: {
    card: {
      minWidth: { var: '--card-min-width' },
      height: { var: '--card-height' },
    },
    badge: {
      color: { var: '--badge-color', default: HA_CONTEXT.colors.orange },
      backgroundColor: { var: '--badge-bgcolor', default: 'transparent' },
    },
    iconAndShape: {
      color: { var: '--icon-and-shape-color', default: HA_CONTEXT.colors.stateIcon },
      icon: { size: { var: '--icon-size' } },
      shape: { size: { var: '--shape-size' } },
    },
    haRipple: {
      color: { var: '--ha-ripple-color' },
    },
    progressBar: {
      color: { var: '--progress-bar-color', default: HA_CONTEXT.colors.stateIcon },
      value: { var: '--progress-bar-value', default: '0' },
      maxWidth: { var: '--progress-bar-max-width', default: null },
      background: { var: '--epb-progress-bar-background-color' },
      // bar_stack 'stacked'/'proportional' + center_zero only: independent
      // per-arm fill size/gradient, layered above the normal single-value
      // derivation (see #9999-10006-ish CSS) but below
      // --epb-progress-bar-color and bar_effect's --progress-effect(-neg).
      stackGradientPos: { var: '--epb-stack-gradient-pos' },
      stackGradientNeg: { var: '--epb-stack-gradient-neg' },
      stackSizePos: { var: '--epb-stack-size-pos' },
      stackSizeNeg: { var: '--epb-stack-size-neg' },
      orientation: { rtl: 'rtl-orientation', ltr: 'ltr-orientation', up: 'up-orientation' },
      effect: {
        radius: { label: 'radius', class: 'progress-bar-effect-radius' },
        glass: { label: 'glass', class: 'progress-bar-effect-glass' },
        gradient: { label: 'gradient', class: 'progress-bar-effect-gradient' },
        gradientReverse: { label: 'gradient_reverse', class: 'progress-bar-effect-gradient-reverse' },
        shimmer: { label: 'shimmer', class: 'progress-bar-effect-shimmer' },
        shimmerReverse: { label: 'shimmer_reverse', class: 'progress-bar-effect-shimmer-reverse' },
      },
      // Single source of truth for mutually-exclusive effects (both
      // EntityProgressEffectChips - the visual editor - and
      // HACore._handleBarEffect - the runtime guard for Jinja/raw-array
      // configs the editor can't filter - read this same map, so the two
      // never drift apart.
      effectIncompatibilities: {
        glass: ['gradient', 'gradient_reverse'],
        gradient: ['gradient_reverse', 'glass'],
        gradient_reverse: ['gradient', 'glass'],
        shimmer: ['shimmer_reverse'],
        shimmer_reverse: ['shimmer'],
      },
      centerZero: { class: 'center-zero' },
    },
    watermark: {
      low: {
        value: { var: '--low-watermark-value', default: 20 },
        color: { var: '--low-watermark-color', default: 'red' },
      },
      high: {
        value: { var: '--high-watermark-value', default: 80 },
        color: { var: '--high-watermark-color', default: 'red' },
      },
      lineSize: { var: '--watermark-line-size' },
      opacity: { var: '--watermark-opacity-value' },
    },
    secondaryInfoError: { class: 'secondary-info-error' },
    show: 'show',
    clickable: { card: 'clickable-card', icon: 'clickable-icon' },
    hiddenComponent: {
      icon: { label: 'icon', class: 'hide-icon' },
      shape: { label: 'shape', class: 'hide-shape' },
      name: { label: 'name', class: 'hide-name' },
      secondary_info: { label: 'secondary_info', class: 'hide-secondary-info' },
      value: { label: 'value' },
      unit: { label: 'unit' },
      progress_bar: { label: 'progress_bar', class: 'hide-progress-bar' },
    },
    frameless: { class: 'frameless' },
    marginless: { class: 'marginless' },
  },
};

const layout = {
  orientations: {
    horizontal: {
      label: 'horizontal',
      grid: { grid_rows: 1, grid_min_rows: 1, grid_columns: 2, grid_min_columns: 2 },
      mdi: HA_CONTEXT.icons.focusHorizontal,
      // 1 Sections grid row. Reads HA's own row-height var (custom
      // properties cross shadow boundaries) instead of a static copy, so a
      // theme override of --ha-section-grid-row-height is followed instead
      // of silently drifting. 56px is HA's own default, kept as the
      // fallback for masonry/other views where the var isn't set.
      minHeight: 'var(--ha-section-grid-row-height, 56px)',
    },
    vertical: {
      label: 'vertical',
      grid: { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 },
      mdi: HA_CONTEXT.icons.focusVertical,
      // 2 Sections grid rows: HA's own formula is
      // (row_size * (row_height + row_gap)) - row_gap - see
      // hui-grid-section.ts's `.card.fit-rows` rule. 120px (HA's defaults:
      // 56px row height + 8px row gap) is the fallback for masonry/other
      // views.
      minHeight:
        'calc((2 * (var(--ha-section-grid-row-height, 56px) + var(--ha-section-grid-row-gap, 8px))) - var(--ha-section-grid-row-gap, 8px))',
    },
  },
  // HA's own getGridOptions() uses a 12-column grid; getLayoutOptions()
  // (grid_columns above) uses the older 4-column one. HA's own migration
  // helper (migrateLayoutToGridOptions, compute-card-grid-size.ts)
  // multiplies by this same factor - kept here so our own getGridOptions()
  // mirrors it instead of guessing.
  gridColumnMultiplier: 3,
};

const theme = {
  default: '**CUSTOM**',
  battery: { label: 'battery', icon: 'battery' },
};

const network = {
  ready: 'ws-ready',
  disconnected: 'ws-disconnected',
};

const configDefaults = {
  tap_action: HA_CONTEXT.actions.moreInfo,
  hold_action: HA_CONTEXT.actions.none,
  double_tap_action: HA_CONTEXT.actions.none,
  icon_tap_action: HA_CONTEXT.actions.none,
  icon_hold_action: HA_CONTEXT.actions.none,
  icon_double_tap_action: HA_CONTEXT.actions.none,
  unit: null,
  layout: layout.orientations.horizontal.label,
  decimal: null,
  force_circular_background: false,
  disable_unit: false,
  unit_spacing: configBase.unit.unitSpacing.auto,
  entity: null,
  attribute: null,
  icon: null,
  name: null,
  max_value_attribute: null,
  color: null,
  theme: null,
  custom_theme: null,
  interpolate: false,
  bar_size: style.bar.sizeOptions.small.label,
  bar_color: null,
  bar_effect: [],
  bar_orientation: null,
  reverse: null,
  min_value: configBase.value.min,
  max_value: configBase.value.max,
  hide: [],
  badge_icon: null,
  badge_color: null,
  name_info: null,
  custom_info: null,
  state_content: [],
  frameless: false,
  marginless: false,
  center_zero: false,
  watermark: {
    low: 20,
    low_as: 'auto',
    low_color: 'red',
    high: 80,
    high_as: 'auto',
    high_color: 'red',
    opacity: 0.8,
    type: 'blended',
    line_size: '1px',
    disable_low: false,
    disable_high: false,
  },
};

const consoleInfo = {
  message: `%c✨${META.types.card.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
  css: 'color:orange; background-color:black; font-weight: bold;',
  link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card',
  // Emitted after the banner (see index.ts) only when the URL-derived dev/
  // debug modes are active, so a non-shipped configuration is never silent.
  warnCss: 'color:black; background-color:orange; font-weight:bold;',
  devWarning: `%c⚠️ ${META.types.card.typeName.toUpperCase()} ${VERSION} — DEV MODE: elements registered under "…-dev" type names. Not for production dashboards. (this is the _dev.js build, or ?dev=true is set)`,
  debugWarning: `%c⚠️ ${META.types.card.typeName.toUpperCase()} ${VERSION} — DEBUG logging ON for: `,
  debugWarningHint: ' — drop the ?debug query param to silence it.',
  noRegistrationWarning: `%c⚠️ ${META.types.card.typeName.toUpperCase()} ${VERSION} — NO-REGISTRATION MODE: no custom element defined, cards of this type will NOT render. Diagnostic only (issue #108). Drop the ?noRegistration query param to restore.`,
  classicResourceWarning: `%c⚠️ ${META.types.card.typeName.toUpperCase()} ${VERSION} — this resource is registered as a classic "JavaScript" type, deprecated by Home Assistant. Switch it to "JavaScript Module" (Settings → Dashboards → Resources): the classic type can freeze pop-ups such as browser_mod and is being phased out. See the troubleshooting guide.`,
};

// Assembled last so every sub-object above (already fully resolved local
// consts, including configDefaults which needed layout/style/configBase to
// exist first) is simply referenced here - no post-construction mutation,
// so the shape TypeScript sees matches the real one from the start.
const CARD = {
  config: { ...configBase, defaults: configDefaults },
  htmlStructure,
  style,
  layout,
  theme,
  network,
  console: consoleInfo,
};

export { CARD };
