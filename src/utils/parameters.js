/*
 * Static configuration: version/build metadata, the CARD_CONTEXT dev/debug
 * flags, HA_CONTEXT (Home Assistant integration constants), the CARD config
 * tree (structure class names, style tokens, defaults), and the THEME presets.
 * No logic, just data.
 */

/**
 * @fileoverview
 *
 * This file defines a custom element `EntityProgressCard` for displaying
 * progress or status information about an entity in Home Assistant.
 * The card displays visual elements like icons, progress bars, and other
 * dynamic content based on the state of the entity and user configurations.
 *
 * Key Features:
 * - Dynamic content update (e.g., progress bar, icons) based on entity state.
 * - Support for theme and layout customization.
 * - Error handling for missing or invalid entities.
 * - Configuration options for various card elements.
 *
 * More informations here:
 *   https://github.com/francois-le-ko4la/lovelace-entity-progress-card/
 *
 * @author ko4la
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

// prettier-ignore-start
const VERSION = '1.6.0-rc2';

const META = {
  documentation: 'https://github.com/francois-le-ko4la/lovelace-entity-progress-card/',
  types: {
    card: {
      typeName: 'entity-progress-card',
      name: 'Entity Progress Card',
      description: 'A cool custom card to show current entity status with a progress bar.',
      editor: 'entity-progress-card-editor',
    },
    template: {
      typeName: 'entity-progress-card-template',
      name: 'Entity Progress Card (Template)',
      description: 'A cool custom card to show current entity status with a progress bar.',
      editor: 'entity-progress-card-template-editor',
    },
    badge: {
      typeName: 'entity-progress-badge',
      name: 'Entity Progress Badge',
      description: 'A cool custom badge to show current entity status with a progress bar.',
      editor: 'entity-progress-badge-editor',
    },
    badgeTemplate: {
      typeName: 'entity-progress-badge-template',
      name: 'Entity Progress Badge (Template)',
      description: 'A cool custom badge to show current entity status with a progress bar.',
      editor: 'entity-progress-badge-template-editor',
    },
    feature: {
      typeName: 'entity-progress-feature',
      name: 'Entity Progress Feature',
      description: 'A cool custom feature in tile to show current entity status with a progress bar.',
    },
  },
};

const CARD_CONTEXT = {
  dev: true,
  debug: { card: false, editor: false, interactionHandler: false, ressourceManager: false, hass: false },
};

const devName = (name) => `${name}${CARD_CONTEXT.dev ? '-dev' : ''}`;

// from:
// https://github.com/home-assistant/frontend/blob/master/src/resources/theme/color/color.globals.ts
const HA_CONTEXT = {
  icons: {
    prefix: 'mdi:',
    help: 'mdi:help',
    helpCircle: 'mdi:help-circle',
    helpCircleOutline: 'mdi:help-circle-outline',
    chevronUpBox: 'mdi:chevron-up-box',
    chevronDownBox: 'mdi:chevron-down-box',
    equalBox: 'mdi:equal-box',
    progressQuestion: 'mdi:progress-question',
    focusHorizontal: 'mdi:focus-field-horizontal',
    focusVertical: 'mdi:focus-field-vertical',
    alert: 'mdi:alert',
    alertCircleOutline: 'mdi:alert-circle-outline',
    exclamationThick: 'mdi:exclamation-thick',
    play: 'mdi:play',
    pause: 'mdi:pause',
    gestureTapHold: 'mdi:gesture-tap-hold',
    washingMachine: 'mdi:washing-machine',
    update: 'mdi:update',
    lightbulb: 'mdi:lightbulb',
    lightbulbOutline: 'mdi:lightbulb-outline',
    thermometer: 'mdi:thermometer',
    waterPercent: 'mdi:water-percent',
    airFilter: 'mdi:air-filter',
    listBox: 'mdi:list-box',
    textShort: 'mdi:text-short',
    sizeSmall: 'mdi:size-s',
    sizeMedium: 'mdi:size-m',
    sizeLarge: 'mdi:size-l',
    sizeXLarge: 'mdi:size-xl',
  },
  colors: {
    success: 'var(--success-color)',
    stateIcon: 'var(--state-icon-color)',
    red: 'var(--red-color)',
    orange: 'var(--orange-color)',
    deepOrange: 'var(--deep-orange-color)',
    yellow: 'var(--yellow-color)',
    amber: 'var(--amber-color)',
    accent: 'var(--accent-color)',
    deepPurple: 'var(--deep-purple-color)',
    indigo: 'var(--indigo-color)',
    blue: 'var(--blue-color)',
    lightBlue: 'var(--light-blue-color)',
    cyan: 'var(--cyan-color)',
    teal: 'var(--teal-color)',
    green: 'var(--green-color)',
    lightGreen: 'var(--light-green-color)',
    lime: 'var(--lime-color)',
    darkGrey: 'var(--dark-grey-color)',
    unavailable: 'var(--state-unavailable-color)',
    inactive: 'var(--state-inactive-color)',
    active: 'var(--state-active-color)',
    coverActive: 'var(--state-cover-active-color)',
    fanActive: 'var(--state-fan-active-color)',
    batteryLow: 'var(--state-sensor-battery-low-color)',
    batteryMedium: 'var(--state-sensor-battery-medium-color)',
    batteryHigh: 'var(--state-sensor-battery-high-color)',
    climateDry: 'var(--state-climate-dry-color)',
    climateCool: 'var(--state-climate-cool-color)',
    climateHeat: 'var(--state-climate-heat-color)',
    climateFanOnly: 'var(--state-climate-fan_only-color)',
  },
  haColors: new Map(
    [
      // texte
      'primary-text',
      'secondary-text',
      'text-primary',
      'text-light-primary',
      'disabled-text',
      // interface
      'dark-primary',
      'darker-primary',
      'light-primary',
      'divider',
      'outline',
      'outline-hover',
      'shadow',
      // material color
      'primary',
      'accent',
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green',
      'light-green',
      'lime',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
      'brown',
      'light-grey',
      'grey',
      'dark-grey',
      'blue-grey',
      'black',
      'white',
      // HA
      'success',
      'warning',
      'error',
      'info',
      'disabled',
      // State
      'state-icon',
      'state-active',
      'state-inactive',
      'state-unavailable',
      'state-alarm_control_panel-armed_away',
      'state-alarm_control_panel-armed_custom_bypass',
      'state-alarm_control_panel-armed_home',
      'state-alarm_control_panel-armed_night',
      'state-alarm_control_panel-armed_vacation',
      'state-alarm_control_panel-arming',
      'state-alarm_control_panel-disarming',
      'state-alarm_control_panel-pending',
      'state-alarm_control_panel-triggered',
      'state-alert-off',
      'state-alert-on',
      'state-binary_sensor-active',
      'state-binary_sensor-battery-on',
      'state-binary_sensor-carbon_monoxide-on',
      'state-binary_sensor-gas-on',
      'state-binary_sensor-heat-on',
      'state-binary_sensor-lock-on',
      'state-binary_sensor-moisture-on',
      'state-binary_sensor-problem-on',
      'state-binary_sensor-safety-on',
      'state-binary_sensor-smoke-on',
      'state-binary_sensor-sound-on',
      'state-binary_sensor-tamper-on',
      'state-climate-auto',
      'state-climate-cool',
      'state-climate-dry',
      'state-climate-fan_only',
      'state-climate-heat',
      'state-climate-heat-cool',
      'state-cover-active',
      'state-device_tracker-active',
      'state-device_tracker-home',
      'state-fan-active',
      'state-humidifier-on',
      'state-lawn_mower-error',
      'state-lawn_mower-mowing',
      'state-light-active',
      'state-lock-jammed',
      'state-lock-locked',
      'state-lock-locking',
      'state-lock-unlocked',
      'state-lock-unlocking',
      'state-lock-open',
      'state-lock-opening',
      'state-media_player-active',
      'state-person-active',
      'state-person-home',
      'state-plant-active',
      'state-siren-active',
      'state-sun-above_horizon',
      'state-sun-below_horizon',
      'state-switch-active',
      'state-update-active',
      'state-vacuum-active',
      'state-valve-active',
      'state-sensor-battery-high',
      'state-sensor-battery-low',
      'state-sensor-battery-medium',
      'state-water_heater-eco',
      'state-water_heater-electric',
      'state-water_heater-gas',
      'state-water_heater-heat_pump',
      'state-water_heater-high_demand',
      'state-water_heater-performance',
      'state-weather-clear_night',
      'state-weather-cloudy',
      'state-weather-exceptional',
      'state-weather-fog',
      'state-weather-hail',
      'state-weather-lightning_rainy',
      'state-weather-lightning',
      'state-weather-partlycloudy',
      'state-weather-pouring',
      'state-weather-rainy',
      'state-weather-snowy_rainy',
      'state-weather-snowy',
      'state-weather-sunny',
      'state-weather-windy_variant',
      'state-weather-windy',
    ].map((c) => [c, `var(--${c}-color)`]),
  ),
  attributeMapping: {
    cover: { label: 'cover', attribute: 'current_position' },
    light: { label: 'light', attribute: 'brightness' },
    fan: { label: 'fan', attribute: 'percentage' },
  },
  numberFormat: {
    decimal_comma: 'de-DE', // 1.234,56 (Allemagne, France, etc.)
    comma_decimal: 'en-US', // 1,234.56 (USA, UK, etc.)
    space_comma: 'fr-FR', // 1 234,56 (France, Norvège, etc.)
    quote_decimal: 'de-CH', // 12'345.60 (Switzerland)
  },
  entity: {
    state: {
      unavailable: 'unavailable',
      unknown: 'unknown',
      notFound: 'notFound',
      idle: 'idle',
      active: 'active',
      paused: 'paused',
      on: 'on',
    },
    type: {
      timer: 'timer',
      light: 'light',
      cover: 'cover',
      fan: 'fan',
      climate: 'climate',
      counter: 'counter',
      number: 'number',
      duration: 'duration',
      default: 'default',
    },
    class: { shutter: 'shutter', battery: 'battery' },
  },
  actions: {
    default: 'default',
    navigate: { action: 'navigate' },
    moreInfo: { action: 'more-info' },
    url: { action: 'url' },
    assist: { action: 'assist' },
    toggle: { action: 'toggle' },
    performAction: { action: 'perform-action' },
    none: { action: 'none' },
    toggleDomain: [
      'light',
      'switch',
      'fan',
      'input_boolean',
      'media_player',
      'automation',
      'humidifier',
      'remote',
      'siren',
      'water_heater',
      'vacuum',
      'group',
    ],
  },
  styles: {
    rowSize: '--row-size',
  },
};

const CARD = {
  config: {
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
    refresh: { ratio: 500, min: 250, max: 1000 },
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
  },
  htmlStructure: {
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
  },
  style: {
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
  },
  layout: {
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
  },
  theme: {
    default: '**CUSTOM**',
    battery: { label: 'battery', icon: 'battery' },
  },
  network: {
    ready: 'ws-ready',
    disconnected: 'ws-disconnected',
  },
};

CARD.config.defaults = {
  tap_action: HA_CONTEXT.actions.moreInfo,
  hold_action: HA_CONTEXT.actions.none,
  double_tap_action: HA_CONTEXT.actions.none,
  icon_tap_action: HA_CONTEXT.actions.none,
  icon_hold_action: HA_CONTEXT.actions.none,
  icon_double_tap_action: HA_CONTEXT.actions.none,
  unit: null,
  layout: CARD.layout.orientations.horizontal.label,
  decimal: null,
  force_circular_background: false,
  disable_unit: false,
  unit_spacing: CARD.config.unit.unitSpacing.auto,
  entity: null,
  attribute: null,
  icon: null,
  name: null,
  max_value_attribute: null,
  color: null,
  theme: null,
  custom_theme: null,
  interpolate: false,
  bar_size: CARD.style.bar.sizeOptions.small.label,
  bar_color: null,
  bar_effect: [],
  bar_orientation: null,
  reverse: null,
  min_value: CARD.config.value.min,
  max_value: CARD.config.value.max,
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

CARD.console = {
  message: `%c✨${META.types.card.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
  css: 'color:orange; background-color:black; font-weight: bold;',
  link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card',
};

const THEME = {
  optimal_when_low: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.green },
      { min: 20, max: 40, icon: null, color: HA_CONTEXT.colors.lightGreen },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 60, max: 80, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  optimal_when_high: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.red },
      { min: 20, max: 40, icon: null, color: HA_CONTEXT.colors.orange },
      { min: 40, max: 60, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 60, max: 80, icon: null, color: HA_CONTEXT.colors.lightGreen },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.green },
    ],
  },
  light: {
    linear: true,
    percent: true,
    style: [
      { icon: HA_CONTEXT.icons.lightbulbOutline, color: '#4B4B4B' },
      { icon: HA_CONTEXT.icons.lightbulbOutline, color: '#877F67' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#C3B382' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#FFE79E' },
      { icon: HA_CONTEXT.icons.lightbulb, color: '#FFE79E' },
    ],
  },
  temperature: {
    linear: false,
    percent: false,
    style: [
      { min: -50, max: -30, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.deepPurple },
      { min: -30, max: -15, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.indigo },
      { min: -15, max: -2, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.blue },
      { min: -2, max: 2, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.lightBlue },
      { min: 2, max: 8, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.cyan },
      { min: 8, max: 16, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.teal },
      { min: 16, max: 18, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.green },
      { min: 18, max: 20, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.lightGreen },
      { min: 20, max: 25, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.green },
      { min: 25, max: 27, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.yellow },
      { min: 27, max: 29, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.amber },
      { min: 29, max: 34, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.deepOrange },
      { min: 34, max: 100, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.red },
    ],
  },
  humidity: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 23, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.red },
      { min: 23, max: 30, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.orange },
      { min: 30, max: 40, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.yellow },
      { min: 40, max: 50, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.green },
      { min: 50, max: 60, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.teal },
      { min: 60, max: 65, icon: HA_CONTEXT.icons.waterPercent, color: 'var(--light-blue-color)' },
      { min: 65, max: 80, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.indigo },
      { min: 80, max: 100, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
  voc: {
    linear: false,
    percent: false,
    style: [
      { min: 0, max: 300, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.green },
      { min: 300, max: 500, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 500, max: 3000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.orange },
      { min: 3000, max: 25000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.red },
      { min: 25000, max: 50000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
  pm25: {
    linear: false,
    percent: false,
    style: [
      { min: 0, max: 12, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.green },
      { min: 12, max: 35, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 35, max: 55, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.orange },
      { min: 55, max: 150, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.red },
      { min: 150, max: 200, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
};

const SEV = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
};

// prettier-ignore-end

const CONTENT_SLOT = '{{content}}';

const VALUE_CHANGED_EVENT = 'value-changed';
const HA_SELECTOR_TAG = 'ha-selector';
const HA_SVG_ICON_TAG = 'ha-svg-icon';
const HA_ACTION_HANDLER_TAG = 'action-handler';
const EDITOR_FIELD_NS = 'editor.field';
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';

export { VERSION };
export { META };
export { CARD_CONTEXT };
export { devName };
export { HA_CONTEXT };
export { CARD };
export { THEME };
export { SEV };
export { CONTENT_SLOT };
export { VALUE_CHANGED_EVENT };
export { HA_SELECTOR_TAG };
export { HA_SVG_ICON_TAG };
export { HA_ACTION_HANDLER_TAG };
export { EDITOR_FIELD_NS };
export { MIN_VALUE_ENTITY_PATH };
export { MAX_VALUE_ENTITY_PATH };
