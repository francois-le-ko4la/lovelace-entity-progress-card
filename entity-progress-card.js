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
 *
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
  dev: false,
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

/* eslint-disable sonarjs/no-duplicate-string */
const TRANSLATIONS = {
  ar: {
    card: {
      msg: {
        appliedDefaultValue: 'تم تطبيق قيمة افتراضية تلقائيًا.',
        attributeNotFound: 'لم يتم العثور على الخاصية في Home Assistant.',
        entityNotFound: 'لم يتم العثور على الكيان في Home Assistant.',
        invalidActionObject: 'كائن الإجراء غير صالح أو غير منظم بشكل صحيح.',
        invalidDecimal: 'يجب أن تكون القيمة رقمًا عشريًا صحيحًا.',
        invalidEntityId: 'معرّف الكيان غير صالح أو به خلل.',
        invalidEnumValue: 'القيمة المُقدمة ليست من الخيارات المسموح بها.',
        invalidStateContent: 'محتوى الحالة غير صالح أو معيب.',
        invalidStateContentEntry: 'إدخال أو أكثر في محتوى الحالة غير صالحة.',
        invalidTheme: 'السمة المحددة غير معروفة. سيتم استخدام السمة الافتراضية.',
        invalidTypeArray: 'كان من المتوقع قيمة من نوع مصفوفة.',
        invalidTypeBoolean: 'كان من المتوقع قيمة من نوع منطقي.',
        invalidTypeNumber: 'كان من المتوقع قيمة من نوع رقم.',
        invalidTypeObject: 'كان من المتوقع قيمة من نوع كائن.',
        invalidTypeString: 'كان من المتوقع قيمة من نوع سلسلة.',
        invalidUnionType: 'القيمة لا تطابق أي نوع مسموح.',
        missingActionKey: 'مفتاح مطلوب مفقود في كائن الإجراء.',
        missingRequiredProperty: 'خاصية مطلوبة مفقودة.'
      }
    },
    editor: {
      title: {
        content: 'المحتوى',
        interaction: 'التفاعلات',
        theme: 'المظهر'
      },
      field: {
        attribute: 'السمة',
        badge_color: 'لون الشارة',
        badge_icon: 'أيقونة الشارة',
        bar_color: 'لون الشريط',
        bar_effect_jinja: 'تأثير الشريط (وضع Jinja)',
        bar_orientation: 'اتجاه الشريط',
        bar_position: 'موضع الشريط',
        bar_single_line: 'معلومات في سطر واحد (تراكب)',
        bar_size: 'حجم الشريط',
        bar_segments: 'Bar segments',
        bar_color_mode: 'وضع اللون',
        bar_scale: 'Bar scale',
        center_zero: 'صفر في الوسط',
        center_zero_value: 'قيمة المركز',
        center_zero_growth_percent: 'نسبة النمو',
        color: 'اللون الأساسي',
        decimal: 'عشري',
        double_tap_action: 'الإجراء عند النقر المزدوج',
        entity: 'الكيان',
        force_circular_background: 'فرض خلفية دائرية',
        hide_jinja: 'إخفاء (وضع Jinja)',
        hold_action: 'الإجراء عند الضغط المطول',
        icon: 'أيقونة',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'الإجراء عند النقر المزدوج على الأيقونة',
        icon_hold_action: 'الإجراء عند الضغط المطول على الأيقونة',
        icon_tap_action: 'الإجراء عند النقر على الأيقونة',
        layout: 'تخطيط المحتوى',
        max_value: 'القيمة القصوى',
        min_value: 'القيمة الدنيا',
        name: 'الاسم',
        percent: 'النسبة المئوية',
        reverse_secondary_info_row: 'تبديل الشريط والنص',
        secondary: 'معلومات ثانوية',
        state_content: 'محتوى الحالة',
        show_all_actions: 'إظهار جميع الإجراءات',
        tap_action: 'الإجراء عند النقر القصير',
        text_shadow: 'إضافة ظل للنص (overlay)',
        theme_mode: 'Theme mode',
        theme: 'السمة',
        custom_theme: 'Custom theme zones',
        unit: 'الوحدة',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'معلومات إضافية (ثانوية)',
        multiline: 'Multiline',
        interpolate: 'تدرج الألوان',
        name_info: 'معلومات إضافية (الاسم)',
        reverse: 'عكس المؤقت',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'كيانات إضافية',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'مثالي عند الانخفاض (CPU، RAM...)',
          optimal_when_high: 'مثالي عند الارتفاع (البطارية...)',
          light: 'الضوء',
          temperature: 'درجة الحرارة',
          humidity: 'الرطوبة',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'صغيرة',
          medium: 'متوسطة',
          large: 'كبيرة',
          xlarge: 'كبيرة جدًا'
        },
        bar_orientation: {
          ltr: 'من اليسار إلى اليمين',
          rtl: 'من اليمين إلى اليسار',
          up: 'اتجاه لأعلى (تراكب)'
        },
        bar_position: {
          default: 'افتراضي',
          below: 'الشريط تحت المحتوى',
          top: 'الشريط أعلى المحتوى (تراكب)',
          bottom: 'الشريط أسفل المحتوى (تراكب)',
          overlay: 'الشريط فوق المحتوى (تراكب)',
          background: 'خلفية البطاقة'
        },
        layout: {
          horizontal: 'أفقي (افتراضي)',
          vertical: 'رأسي'
        },
        bar_color_mode: {
          auto: 'تلقائي',
          segment: 'مقطعي',
          rainbow: 'قوس قزح'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'حواف دائرية',
          glass: 'زجاج',
          gradient: 'تدرج',
          gradient_reverse: 'تدرج معكوس',
          shimmer: 'لمعان',
          shimmer_reverse: 'لمعان معكوس'
        },
        hide: {
          icon: 'أيقونة',
          name: 'الاسم',
          value: 'القيمة',
          unit: 'الوحدة',
          secondary_info: 'المعلومات',
          progress_bar: 'الشريط'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  bn: {
    card: {
      msg: {
        appliedDefaultValue: 'ডিফল্ট মান স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়েছে।',
        attributeNotFound: 'HA তে বৈশিষ্ট্য পাওয়া যায়নি।',
        entityNotFound: 'HA তে সত্তা পাওয়া যায়নি।',
        invalidActionObject: 'অ্যাকশন অবজেক্ট অবৈধ বা ভুলভাবে গঠিত।',
        invalidDecimal: 'মানটি একটি বৈধ দশমিক সংখ্যা হতে হবে।',
        invalidEntityId: 'সত্তার আইডি অবৈধ বা ভুলভাবে গঠিত।',
        invalidEnumValue: 'প্রদত্ত মানটি অনুমোদিত বিকল্পগুলির মধ্যে একটি নয়।',
        invalidStateContent: 'অবস্থার বিষয়বস্তু অবৈধ বা ভুলভাবে গঠিত।',
        invalidStateContentEntry: 'অবস্থার বিষয়বস্তুতে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidTheme: 'নির্দিষ্ট থিম অজানা। ডিফল্ট থিম ব্যবহার করা হবে।',
        invalidTypeArray: 'অ্যারে ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeBoolean: 'বুলিয়ান ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeNumber: 'সংখ্যা ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeObject: 'অবজেক্ট ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeString: 'স্ট্রিং ধরনের একটি মান প্রত্যাশিত।',
        invalidUnionType: 'মানটি অনুমোদিত ধরনগুলির কোনোটির সাথে মেলে না।',
        missingActionKey: 'অ্যাকশন অবজেক্টে একটি প্রয়োজনীয় কী অনুপস্থিত।',
        missingRequiredProperty: 'প্রয়োজনীয় বৈশিষ্ট্য অনুপস্থিত।'
      }
    },
    editor: {
      title: {
        content: 'বিষয়বস্তু',
        interaction: 'মিথস্ক্রিয়া',
        theme: 'চেহারা এবং অনুভূতি'
      },
      field: {
        attribute: 'বৈশিষ্ট্য',
        badge_color: 'ব্যাজের রঙ',
        badge_icon: 'ব্যাজ আইকন',
        bar_color: 'বারের রঙ',
        bar_effect_jinja: 'বারের প্রভাব (Jinja মোড)',
        bar_orientation: 'বারের অভিমুখ',
        bar_position: 'বারের অবস্থান',
        bar_single_line: 'এক লাইনে তথ্য (ওভারলে)',
        bar_size: 'বারের আকার',
        bar_segments: 'Bar segments',
        bar_color_mode: 'রঙের মোড',
        bar_scale: 'Bar scale',
        center_zero: 'মাঝে শূন্য',
        center_zero_value: 'কেন্দ্রীয় মান',
        center_zero_growth_percent: 'প্রবৃদ্ধির শতাংশ',
        color: 'প্রাথমিক রঙ',
        decimal: 'দশমিক',
        double_tap_action: 'ডাবল ট্যাপ আচরণ',
        entity: 'সত্তা',
        force_circular_background: 'বৃত্তাকার পটভূমি জোর করুন',
        hide_jinja: 'লুকান (Jinja মোড)',
        hold_action: 'হোল্ড আচরণ',
        icon: 'আইকন',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'আইকন ডাবল ট্যাপ আচরণ',
        icon_hold_action: 'আইকন হোল্ড আচরণ',
        icon_tap_action: 'আইকন ট্যাপ আচরণ',
        layout: 'বিষয়বস্তুর বিন্যাস',
        max_value: 'সর্বোচ্চ মান',
        min_value: 'ন্যূনতম মান',
        name: 'নাম',
        percent: 'শতাংশ',
        reverse_secondary_info_row: 'বার এবং টেক্সট অদলবদল করুন',
        secondary: 'দ্বিতীয় তথ্য',
        state_content: 'স্টেটের বিষয়বস্তু',
        show_all_actions: 'সব অ্যাকশন দেখান',
        tap_action: 'ট্যাপ আচরণ',
        text_shadow: 'টেক্সটে ছায়া যোগ করুন (overlay)',
        theme_mode: 'Theme mode',
        theme: 'থিম',
        custom_theme: 'Custom theme zones',
        unit: 'একক',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'কাস্টম সেকেন্ডারি তথ্য',
        multiline: 'Multiline',
        interpolate: 'রঙ ইন্টারপোলেশন',
        name_info: 'কাস্টম নাম তথ্য',
        reverse: 'টাইমার উল্টানো',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'অতিরিক্ত সত্তা',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'কম হলে সর্বোত্তম (CPU, RAM,...)',
          optimal_when_high: 'বেশি হলে সর্বোত্তম (ব্যাটারি...)',
          light: 'আলো',
          temperature: 'তাপমাত্রা',
          humidity: 'আর্দ্রতা',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'ছোট',
          medium: 'মাঝারি',
          large: 'বড়',
          xlarge: 'অতিরিক্ত বড়'
        },
        bar_orientation: {
          ltr: 'বাম থেকে ডানে',
          rtl: 'ডান থেকে বামে',
          up: 'উপরের দিকে (ওভারলে)'
        },
        bar_position: {
          default: 'ডিফল্ট',
          below: 'বিষয়বস্তুর নিচে বার',
          top: 'উপরের দিকে বার (ওভারলে)',
          bottom: 'নিচের দিকে বার (ওভারলে)',
          overlay: 'বিষয়বস্তুর ওপর বার (ওভারলে)',
          background: 'কার্ড পটভূমি'
        },
        layout: {
          horizontal: 'অনুভূমিক (ডিফল্ট)',
          vertical: 'উল্লম্ব'
        },
        bar_color_mode: {
          auto: 'স্বয়ংক্রিয়',
          segment: 'বিভাগ',
          rainbow: 'রেইনবো'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'বৃত্তাকার কোণ',
          glass: 'কাচ',
          gradient: 'গ্রেডিয়েন্ট',
          gradient_reverse: 'উল্টো গ্রেডিয়েন্ট',
          shimmer: 'শিমার',
          shimmer_reverse: 'উল্টো শিমার'
        },
        hide: {
          icon: 'আইকন',
          name: 'নাম',
          value: 'মান',
          unit: 'একক',
          secondary_info: 'তথ্য',
          progress_bar: 'বার'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ca: {
    card: {
      msg: {
        appliedDefaultValue: 'S\'ha aplicat automàticament un valor per defecte.',
        attributeNotFound: 'No s\'ha trobat l\'atribut a Home Assistant.',
        entityNotFound: 'No s\'ha trobat l\'entitat a Home Assistant.',
        invalidActionObject: 'L\'objecte d\'acció és invàlid o té una estructura incorrecta.',
        invalidDecimal: 'El valor ha de ser un decimal vàlid.',
        invalidEntityId: 'L\'ID de l\'entitat no és vàlid o té un format incorrecte.',
        invalidEnumValue: 'El valor proporcionat no és una opció vàlida.',
        invalidStateContent: 'El contingut de l\'estat és invàlid o té un format incorrecte.',
        invalidStateContentEntry: 'Una o més entrades del contingut de l\'estat són invàlides.',
        invalidTheme: 'El tema especificat és desconegut. S\'utilitzarà el tema per defecte.',
        invalidTypeArray: 'S\'esperava un valor de tipus array.',
        invalidTypeBoolean: 'S\'esperava un valor de tipus boolean.',
        invalidTypeNumber: 'S\'esperava un valor de tipus número.',
        invalidTypeObject: 'S\'esperava un valor de tipus objecte.',
        invalidTypeString: 'S\'esperava un valor de tipus cadena.',
        invalidUnionType: 'El valor no coincideix amb cap dels tipus permesos.',
        missingActionKey: 'Falta una clau obligatòria a l\'objecte d\'acció.',
        missingRequiredProperty: 'Falta una propietat obligatòria.'
      }
    },
    editor: {
      title: {
        content: 'Contingut',
        interaction: 'Interacció',
        theme: 'Aparença i tema'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Color de la insígnia',
        badge_icon: 'Icona de la insígnia',
        bar_color: 'Color principal',
        bar_effect_jinja: 'Efecte de la barra (mode Jinja)',
        bar_orientation: 'Orientació de la barra',
        bar_position: 'Posició de la barra',
        bar_single_line: 'Informació en una sola línia (overlay)',
        bar_size: 'Mida de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mode de color',
        bar_scale: 'Bar scale',
        center_zero: 'Zero al centre',
        center_zero_value: 'Valor de centratge',
        center_zero_growth_percent: 'Percentatge de creixement',
        color: 'Color principal',
        decimal: 'Decimal',
        double_tap_action: 'Acció al doble tocar',
        entity: 'Entitat',
        force_circular_background: 'Forçar fons circular',
        hide_jinja: 'Amaga (mode Jinja)',
        hold_action: 'Acció en mantenir premut',
        icon: 'Icona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acció al doble tocar la icona',
        icon_hold_action: 'Acció en mantenir premuda la icona',
        icon_tap_action: 'Acció al tocar la icona',
        layout: 'Disposició del contingut',
        max_value: 'Valor màxim',
        min_value: 'Valor mínim',
        name: 'Nom',
        percent: 'Percentatge',
        reverse_secondary_info_row: 'Intercanvia barra i text',
        secondary: 'Informació secundària',
        state_content: 'Contingut de l\'estat',
        show_all_actions: 'Mostra totes les accions',
        tap_action: 'Acció al tocar breument',
        text_shadow: 'Afegir ombra al text (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unitat',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informació addicional (secundària)',
        multiline: 'Multiline',
        interpolate: 'Interpolar colors',
        name_info: 'Informació addicional (nom)',
        reverse: 'Temporitzador invers',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entitats addicionals',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Òptim quan és baix (CPU, RAM…)',
          optimal_when_high: 'Òptim quan és alt (Bateria…)',
          light: 'Llum',
          temperature: 'Temperatura',
          humidity: 'Humitat',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Petita',
          medium: 'Mitjana',
          large: 'Gran',
          xlarge: 'Extra gran'
        },
        bar_orientation: {
          ltr: 'D\'esquerra a dreta',
          rtl: 'De dreta a esquerra',
          up: 'Cap amunt (overlay)'
        },
        bar_position: {
          default: 'Predeterminada',
          below: 'Barra sota el contingut',
          top: 'Barra a sobre (superposada)',
          bottom: 'Barra a sota (superposada)',
          overlay: 'Barra superposada al contingut (overlay)',
          background: 'Fons de la targeta'
        },
        layout: {
          horizontal: 'Horitzontal (predeterminada)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Automàtic',
          segment: 'Segments',
          rainbow: 'Arc de Sant Martí'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Cantonades arrodonides',
          glass: 'Vidre',
          gradient: 'Degradat',
          gradient_reverse: 'Degradat invers',
          shimmer: 'Resplendor',
          shimmer_reverse: 'Resplendor invers'
        },
        hide: {
          icon: 'Icona',
          name: 'Nom',
          value: 'Valor',
          unit: 'Unitat',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  cs: {
    card: {
      msg: {
        appliedDefaultValue: 'Výchozí hodnota byla automaticky aplikována.',
        attributeNotFound: 'Atribut nebyl nalezen v HA.',
        entityNotFound: 'Entita nebyla nalezena v HA.',
        invalidActionObject: 'Objekt akce je neplatný nebo špatně strukturovaný.',
        invalidDecimal: 'Hodnota musí být platné desítkové číslo.',
        invalidEntityId: 'ID entity je neplatné nebo špatně formátované.',
        invalidEnumValue: 'Poskytnutá hodnota není jednou z povolených možností.',
        invalidStateContent: 'Obsah stavu je neplatný nebo špatně formátovaný.',
        invalidStateContentEntry: 'Jedna nebo více položek v obsahu stavu je neplatných.',
        invalidTheme: 'Zadaný motiv je neznámý. Bude použit výchozí motiv.',
        invalidTypeArray: 'Očekávána hodnota typu pole.',
        invalidTypeBoolean: 'Očekávána hodnota typu boolean.',
        invalidTypeNumber: 'Očekávána hodnota typu číslo.',
        invalidTypeObject: 'Očekávána hodnota typu objekt.',
        invalidTypeString: 'Očekávána hodnota typu řetězec.',
        invalidUnionType: 'Hodnota neodpovídá žádnému z povolených typů.',
        missingActionKey: 'V objektu akce chybí požadovaný klíč.',
        missingRequiredProperty: 'Chybí povinná vlastnost.'
      }
    },
    editor: {
      title: {
        content: 'Obsah',
        interaction: 'Interakce',
        theme: 'Vzhled a pocit'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Barva odznaku',
        badge_icon: 'Ikona odznaku',
        bar_color: 'Barva lišty',
        bar_effect_jinja: 'Efekt na liště (režim Jinja)',
        bar_orientation: 'Orientace lišty',
        bar_position: 'Umístění lišty',
        bar_single_line: 'Info v jednom řádku (overlay)',
        bar_size: 'Velikost lišty',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Barevný režim',
        bar_scale: 'Bar scale',
        center_zero: 'Nula uprostřed',
        center_zero_value: 'Hodnota středu',
        center_zero_growth_percent: 'Procento růstu',
        color: 'Hlavní barva',
        decimal: 'desetinný',
        double_tap_action: 'Chování při dvojitém klepnutí',
        entity: 'Entita',
        force_circular_background: 'Vynutit kruhové pozadí',
        hide_jinja: 'Skrýt (režim Jinja)',
        hold_action: 'Chování při podržení',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Chování při dvojitém klepnutí na ikonu',
        icon_hold_action: 'Chování při podržení ikony',
        icon_tap_action: 'Chování při klepnutí na ikonu',
        layout: 'Rozložení obsahu',
        max_value: 'Maximální hodnota',
        min_value: 'Minimální hodnota',
        name: 'Název',
        percent: 'Procento',
        reverse_secondary_info_row: 'Zaměnit lištu a text',
        secondary: 'Sekundární informace',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobrazit všechny akce',
        tap_action: 'Chování při klepnutí',
        text_shadow: 'Přidat stín textu (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Motiv',
        custom_theme: 'Custom theme zones',
        unit: 'Jednotka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Vlastní sekundární info',
        multiline: 'Multiline',
        interpolate: 'Interpolace barev',
        name_info: 'Vlastní info názvu',
        reverse: 'Obrátit časovač',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Další entity',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimální při nízkých hodnotách (CPU, RAM...)',
          optimal_when_high: 'Optimální při vysokých hodnotách (Baterie...)',
          light: 'Světlo',
          temperature: 'Teplota',
          humidity: 'Vlhkost',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Malá',
          medium: 'Střední',
          large: 'Velká',
          xlarge: 'Extra velká'
        },
        bar_orientation: {
          ltr: 'Zleva doprava',
          rtl: 'Zprava doleva',
          up: 'Nahoru (overlay)'
        },
        bar_position: {
          default: 'Výchozí',
          below: 'Lišta pod obsahem',
          top: 'Lišta nahoře (overlay)',
          bottom: 'Lišta dole (overlay)',
          overlay: 'Lišta přes obsah (overlay)',
          background: 'Pozadí karty'
        },
        layout: {
          horizontal: 'Horizontální (výchozí)',
          vertical: 'Vertikální'
        },
        bar_color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Duha'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zakulacené rohy',
          glass: 'Sklo',
          gradient: 'Přechod',
          gradient_reverse: 'Přechod obráceně',
          shimmer: 'Třpyt',
          shimmer_reverse: 'Třpyt obráceně'
        },
        hide: {
          icon: 'Ikona',
          name: 'Název',
          value: 'Hodnota',
          unit: 'Jednotka',
          secondary_info: 'Info',
          progress_bar: 'Lišta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  da: {
    card: {
      msg: {
        appliedDefaultValue: 'Standardværdi er blevet anvendt automatisk.',
        attributeNotFound: 'Egenskab blev ikke fundet i Home Assistant.',
        entityNotFound: 'Enheden blev ikke fundet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldigt eller forkert struktureret.',
        invalidDecimal: 'Værdien skal være et gyldigt decimaltal.',
        invalidEntityId: 'Enheds-ID er ugyldigt eller forkert formateret.',
        invalidEnumValue: 'Den angivne værdi er ikke en tilladt mulighed.',
        invalidStateContent: 'Tilstandsindholdet er ugyldigt eller fejlbehæftet.',
        invalidStateContentEntry: 'En eller flere poster i tilstandsindholdet er ugyldige.',
        invalidTheme: 'Det angivne tema er ukendt. Standardtema anvendes.',
        invalidTypeArray: 'Forventede en array-værdi.',
        invalidTypeBoolean: 'Forventede en boolesk værdi.',
        invalidTypeNumber: 'Forventede en numerisk værdi.',
        invalidTypeObject: 'Forventede en objektværdi.',
        invalidTypeString: 'Forventede en strengværdi.',
        invalidUnionType: 'Værdien matcher ingen af de tilladte typer.',
        missingActionKey: 'En påkrævet nøgle mangler i handlingsobjektet.',
        missingRequiredProperty: 'En påkrævet egenskab mangler.'
      }
    },
    editor: {
      title: {
        content: 'Indhold',
        interaction: 'Interaktioner',
        theme: 'Udseende og funktionalitet'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Badge-farve',
        badge_icon: 'Badge-ikon',
        bar_color: 'Farve til bar',
        bar_effect_jinja: 'Effekt på bar (Jinja-tilstand)',
        bar_orientation: 'Bar-retning',
        bar_position: 'Bar-placering',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Farvetilstand',
        bar_scale: 'Bar scale',
        center_zero: 'Center nul',
        center_zero_value: 'Centerværdi',
        center_zero_growth_percent: 'Vækstprocent',
        color: 'Primær farve',
        decimal: 'decimal',
        double_tap_action: 'Handling ved dobbelt tryk',
        entity: 'Enhed',
        force_circular_background: 'Tving cirkulær baggrund',
        hide_jinja: 'Skjul (Jinja-tilstand)',
        hold_action: 'Handling ved langt tryk',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Handling ved dobbelt tryk på ikonet',
        icon_hold_action: 'Handling ved langt tryk på ikonet',
        icon_tap_action: 'Handling ved tryk på ikonet',
        layout: 'Indholdslayout',
        max_value: 'Maksimal værdi',
        min_value: 'Minimumsværdi',
        name: 'Navn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Skift bjælke og tekst',
        secondary: 'Sekundær info',
        state_content: 'Indhold af tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort tryk',
        text_shadow: 'Tilføj tekstskygge (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhed',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Tilpasset sekundær info',
        multiline: 'Multiline',
        interpolate: 'Interpoler farver',
        name_info: 'Tilpasset navneinfo',
        reverse: 'Omvendt timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ekstra entiteter',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          optimal_when_high: 'Optimal når højt (Batteri...)',
          light: 'Lys',
          temperature: 'Temperatur',
          humidity: 'Fugtighed',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Lille',
          medium: 'Medium',
          large: 'Stor',
          xlarge: 'Ekstra stor'
        },
        bar_orientation: {
          ltr: 'Venstre til højre',
          rtl: 'Højre til venstre',
          up: 'Opad (overlay)'
        },
        bar_position: {
          default: 'Standard',
          below: 'Bar under indhold',
          top: 'Bar øverst (overlay)',
          bottom: 'Bar nederst (overlay)',
          overlay: 'Bar over indhold (overlay)',
          background: 'Kortbaggrund'
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Afrundede hjørner',
          glass: 'Glas',
          gradient: 'Gradient',
          gradient_reverse: 'Omvendt gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvendt glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Navn',
          value: 'Værdi',
          unit: 'Enhed',
          secondary_info: 'Info',
          progress_bar: 'Bjælke'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  de: {
    card: {
      msg: {
        appliedDefaultValue: 'Ein Standardwert wurde automatisch angewendet.',
        attributeNotFound: 'Attribut in Home Assistant nicht gefunden.',
        entityNotFound: 'Entität in Home Assistant nicht gefunden.',
        invalidActionObject: 'Das Aktionsobjekt ist ungültig oder falsch strukturiert.',
        invalidDecimal: 'Der Wert muss eine gültige Dezimalzahl sein.',
        invalidEntityId: 'Die Entity-ID ist ungültig oder fehlerhaft.',
        invalidEnumValue: 'Der angegebene Wert gehört nicht zu den erlaubten Optionen.',
        invalidStateContent: 'Der Statusinhalt ist ungültig oder fehlerhaft.',
        invalidStateContentEntry: 'Ein oder mehrere Einträge im Statusinhalt sind ungültig.',
        invalidTheme: 'Das angegebene Theme ist unbekannt. Das Standard-Theme wird verwendet.',
        invalidTypeArray: 'Ein Wert vom Typ Array wurde erwartet.',
        invalidTypeBoolean: 'Ein Wert vom Typ Boolesch wurde erwartet.',
        invalidTypeNumber: 'Ein Wert vom Typ Zahl wurde erwartet.',
        invalidTypeObject: 'Ein Wert vom Typ Objekt wurde erwartet.',
        invalidTypeString: 'Ein Wert vom Typ Zeichenkette wurde erwartet.',
        invalidUnionType: 'Der Wert entspricht keinem der erlaubten Typen.',
        missingActionKey: 'Ein erforderlicher Schlüssel fehlt im Aktionsobjekt.',
        missingRequiredProperty: 'Eine erforderliche Eigenschaft fehlt.'
      }
    },
    editor: {
      title: {
        content: 'Inhalt',
        interaction: 'Interaktionen',
        theme: 'Aussehen und Bedienung'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Farbe des Badges',
        badge_icon: 'Symbol des Badges',
        bar_color: 'Balkenfarbe',
        bar_effect_jinja: 'Effekt auf die Leiste (Jinja-Modus)',
        bar_orientation: 'Ausrichtung der Leiste',
        bar_position: 'Position der Leiste',
        bar_single_line: 'Informationen in einer Zeile (Overlay)',
        bar_size: 'Größe der Bar',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Balkenfarbmodus',
        bar_scale: 'Balkenskala',
        center_zero: 'Null in der Mitte',
        center_zero_value: 'Zentrumswert',
        center_zero_growth_percent: 'Wachstumsprozentsatz',
        color: 'Symbolfarbe',
        decimal: 'dezimal',
        double_tap_action: 'Aktion bei doppelt Tippen',
        entity: 'Entität',
        force_circular_background: 'Kreisförmigen Hintergrund erzwingen',
        hide_jinja: 'Ausblenden (Jinja-Modus)',
        hold_action: 'Aktion bei langem Tippen',
        icon: 'Symbol',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Aktion bei doppelt Tippen auf das Symbol',
        icon_hold_action: 'Aktion bei langem Tippen auf das Symbol',
        icon_tap_action: 'Aktion beim Tippen auf das Symbol',
        layout: 'Inhaltslayout',
        max_value: 'Höchstwert',
        min_value: 'Mindestwert',
        name: 'Name',
        percent: 'Prozent',
        reverse_secondary_info_row: 'Barra und Text tauschen',
        secondary: 'Sekundäre Informationen',
        state_content: 'Statusinhalt',
        show_all_actions: 'Alle Aktionen anzeigen',
        tap_action: 'Aktion bei kurzem Tippen',
        text_shadow: 'Textschatten hinzufügen (Overlay)',
        theme_mode: 'Theme mode',
        theme: 'Thema',
        custom_theme: 'Benutzerdefinierte Themenzonen',
        unit: 'Einheit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Zusatzinfo (sekundär)',
        multiline: 'Mehrzeilig',
        interpolate: 'Farben interpolieren',
        name_info: 'Zusatzinfo (Name)',
        reverse: 'Timer umkehren',
        bar_stack_mode: 'Stapelmodus',
        bar_stack: 'Weitere Entitäten',
        migrate_config: 'Konfiguration migrieren'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal bei niedrig (CPU, RAM,...)',
          optimal_when_high: 'Optimal bei hoch (Batterie...)',
          light: 'Licht',
          temperature: 'Temperatur',
          humidity: 'Feuchtigkeit',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Klein',
          medium: 'Mittel',
          large: 'Groß',
          xlarge: 'Extra groß'
        },
        bar_orientation: {
          ltr: 'Von links nach rechts',
          rtl: 'Von rechts nach links',
          up: 'Nach oben (Overlay)'
        },
        bar_position: {
          default: 'Standard',
          below: 'Leiste unter dem Inhalt',
          top: 'Leiste oben (Overlay)',
          bottom: 'Leiste unten (Overlay)',
          overlay: 'Leiste über dem Inhalt (Overlay)',
          background: 'Kartenhintergrund'
        },
        layout: {
          horizontal: 'Horizontal (Standard)',
          vertical: 'Vertikal'
        },
        bar_color_mode: {
          auto: 'Automatisch',
          segment: 'Segmente',
          rainbow: 'Regenbogen'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmisch'
        },
        bar_effect: {
          radius: 'Abgerundete Ecken',
          glass: 'Glas',
          gradient: 'Verlauf',
          gradient_reverse: 'Verlauf umgekehrt',
          shimmer: 'Schimmer',
          shimmer_reverse: 'Schimmer umgekehrt'
        },
        hide: {
          icon: 'Symbol',
          name: 'Name',
          value: 'Wert',
          unit: 'Einheit',
          secondary_info: 'Info',
          progress_bar: 'Balken'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Unterer Wert',
          high: 'Oberer Wert',
          type: 'Typ',
          opacity: 'Deckkraft',
          low_color: 'Untere Farbe',
          high_color: 'Obere Farbe',
          low_as: 'Einheit (unterer Wert)',
          high_as: 'Einheit (oberer Wert)',
          line_size: 'Linienstärke',
          disable_low: 'Unteren Wert deaktivieren',
          disable_high: 'Oberen Wert deaktivieren',
          low_attribute: 'Attribut',
          high_attribute: 'Attribut'
        },
        icon_animation: {
          none: 'Keine',
          spin: 'Drehen',
          pulse: 'Pulsieren',
          bounce: 'Hüpfen',
          shake: 'Wackeln',
          ping: 'Ping',
          reveal: 'Einblenden',
          washing_machine: 'Waschmaschine',
          battery_charging: 'Akku lädt'
        },
        alert_when: {
          above: 'Alarm über',
          below: 'Alarm unter',
          color: 'Alarmfarbe',
          highlight: 'Hervorhebung',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Rahmen',
          background: 'Hintergrund'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        max_value_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        watermark_low_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        watermark_high_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        theme_mode: {
          preset: 'Voreinstellung',
          custom: 'Benutzerdefiniert'
        },
        min_value: {
          attribute: 'Attribut'
        },
        max_value: {
          attribute: 'Attribut'
        },
        bar_stack_mode: {
          stacked: 'Gestapelt',
          proportional: 'Proportional',
          net: 'Netto'
        }
      }
    }
  },
  el: {
    card: {
      msg: {
        appliedDefaultValue: 'Εφαρμόστηκε αυτόματα προεπιλεγμένη τιμή.',
        attributeNotFound: 'Το χαρακτηριστικό δεν βρέθηκε στο Home Assistant.',
        entityNotFound: 'Η οντότητα δεν βρέθηκε στο Home Assistant.',
        invalidActionObject: 'Το αντικείμενο ενέργειας δεν είναι έγκυρο ή είναι κακώς δομημένο.',
        invalidDecimal: 'Η τιμή πρέπει να είναι έγκυρος δεκαδικός αριθμός.',
        invalidEntityId: 'Το αναγνωριστικό οντότητας δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidEnumValue: 'Η παρεχόμενη τιμή δεν είναι αποδεκτή επιλογή.',
        invalidStateContent: 'Το περιεχόμενο κατάστασης δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidStateContentEntry: 'Μία ή περισσότερες καταχωρήσεις στο περιεχόμενο κατάστασης είναι άκυρες.',
        invalidTheme: 'Το καθορισμένο θέμα είναι άγνωστο. Θα χρησιμοποιηθεί το προεπιλεγμένο θέμα.',
        invalidTypeArray: 'Αναμενόταν τιμή τύπου πίνακα.',
        invalidTypeBoolean: 'Αναμενόταν τιμή τύπου boolean.',
        invalidTypeNumber: 'Αναμενόταν τιμή τύπου αριθμού.',
        invalidTypeObject: 'Αναμενόταν τιμή τύπου αντικειμένου.',
        invalidTypeString: 'Αναμενόταν τιμή τύπου συμβολοσειράς.',
        invalidUnionType: 'Η τιμή δεν ταιριάζει σε κανέναν από τους επιτρεπόμενους τύπους.',
        missingActionKey: 'Λείπει απαιτούμενο κλειδί στο αντικείμενο ενέργειας.',
        missingRequiredProperty: 'Λείπει μια απαιτούμενη ιδιότητα.'
      }
    },
    editor: {
      title: {
        content: 'Περιεχόμενο',
        interaction: 'Αλληλεπιδράσεις',
        theme: 'Εμφάνιση'
      },
      field: {
        attribute: 'Χαρακτηριστικό',
        badge_color: 'Χρώμα εμβλήματος',
        badge_icon: 'Εικονίδιο εμβλήματος',
        bar_color: 'Χρώμα γραμμής',
        bar_effect_jinja: 'Εφέ γραμμής (λειτουργία Jinja)',
        bar_orientation: 'Κατεύθυνση γραμμής',
        bar_position: 'Θέση γραμμής',
        bar_single_line: 'Πληροφορίες σε μία γραμμή (overlay)',
        bar_size: 'Μέγεθος γραμμής',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Λειτουργία χρώματος',
        bar_scale: 'Bar scale',
        center_zero: 'Μηδέν στο κέντρο',
        center_zero_value: 'Τιμή κέντρου',
        center_zero_growth_percent: 'Ποσοστό μεταβολής',
        color: 'Κύριο χρώμα',
        decimal: 'δεκαδικά',
        double_tap_action: 'Ενέργεια κατά το διπλό πάτημα',
        entity: 'Οντότητα',
        force_circular_background: 'Εξαναγκασμός κυκλικού φόντου',
        hide_jinja: 'Απόκρυψη (λειτουργία Jinja)',
        hold_action: 'Ενέργεια κατά το παρατεταμένο πάτημα',
        icon: 'Εικονίδιο',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ενέργεια στο διπλό πάτημα του εικονιδίου',
        icon_hold_action: 'Ενέργεια στο παρατεταμένο πάτημα του εικονιδίου',
        icon_tap_action: 'Ενέργεια στο πάτημα του εικονιδίου',
        layout: 'Διάταξη περιεχομένου',
        max_value: 'Μέγιστη τιμή',
        min_value: 'Ελάχιστη τιμή',
        name: 'Όνομα',
        percent: 'Ποσοστό',
        reverse_secondary_info_row: 'Εναλλαγή γραμμής και κειμένου',
        secondary: 'Πρόσθετες πληροφορίες',
        state_content: 'Περιεχόμενο κατάστασης',
        show_all_actions: 'Εμφάνιση όλων των ενεργειών',
        tap_action: 'Ενέργεια κατά το σύντομο πάτημα',
        text_shadow: 'Προσθήκη σκιάς στο κείμενο (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Θέμα',
        custom_theme: 'Custom theme zones',
        unit: 'Μονάδα',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Προσαρμοσμένη δευτερεύουσα πληροφορία',
        multiline: 'Multiline',
        interpolate: 'Παρεμβολή χρωμάτων',
        name_info: 'Προσαρμοσμένη πληροφορία ονόματος',
        reverse: 'Αντίστροφο χρονόμετρο',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Πρόσθετες οντότητες',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Βέλτιστο όταν είναι χαμηλό (CPU, RAM...)',
          optimal_when_high: 'Βέλτιστο όταν είναι υψηλό (Μπαταρία...)',
          light: 'Φωτεινότητα',
          temperature: 'Θερμοκρασία',
          humidity: 'Υγρασία',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Μικρή',
          medium: 'Μεσαία',
          large: 'Μεγάλη',
          xlarge: 'Πολύ μεγάλη'
        },
        bar_orientation: {
          ltr: 'Από αριστερά προς δεξιά',
          rtl: 'Από δεξιά προς αριστερά',
          up: 'Προς τα πάνω (overlay)'
        },
        bar_position: {
          default: 'Προεπιλογή',
          below: 'Γραμμή κάτω από το περιεχόμενο',
          top: 'Γραμμή πάνω (επικάλυψη)',
          bottom: 'Γραμμή κάτω (επικάλυψη)',
          overlay: 'Γραμμή πάνω από περιεχόμενο (overlay)',
          background: 'Φόντο κάρτας'
        },
        layout: {
          horizontal: 'Οριζόντια (προεπιλογή)',
          vertical: 'Κατακόρυφη'
        },
        bar_color_mode: {
          auto: 'Αυτόματο',
          segment: 'Τμήματα',
          rainbow: 'Ουράνιο τόξο'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Στρογγυλεμένες γωνίες',
          glass: 'Γυαλί',
          gradient: 'Ντεγκραντέ',
          gradient_reverse: 'Ντεγκραντέ αντίστροφο',
          shimmer: 'Αχτινοβολία',
          shimmer_reverse: 'Αχτινοβολία αντίστροφη'
        },
        hide: {
          icon: 'Εικονίδιο',
          name: 'Όνομα',
          value: 'Τιμή',
          unit: 'Μονάδα',
          secondary_info: 'Πληροφορίες',
          progress_bar: 'Μπάρα'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  en: {
    card: {
      msg: {
        appliedDefaultValue: 'A default value has been applied automatically.',
        attributeNotFound: 'Attribute not found in HA.',
        entityNotFound: 'Entity not found in HA.',
        invalidActionObject: 'The action object is invalid or improperly structured.',
        invalidDecimal: 'The value must be a valid decimal number.',
        invalidEntityId: 'The entity ID is invalid or malformed.',
        invalidEnumValue: 'The provided value is not one of the allowed options.',
        invalidStateContent: 'The state content is invalid or malformed.',
        invalidStateContentEntry: 'One or more entries in the state content are invalid.',
        invalidTheme: 'The specified theme is unknown. Default theme will be used.',
        invalidTypeArray: 'Expected a value of type array.',
        invalidTypeBoolean: 'Expected a value of type boolean.',
        invalidTypeNumber: 'Expected a value of type number.',
        invalidTypeObject: 'Expected a value of type object.',
        invalidTypeString: 'Expected a value of type string.',
        invalidUnionType: 'The value does not match any of the allowed types.',
        missingActionKey: 'A required key is missing in the action object.',
        missingRequiredProperty: 'Required property is missing.'
      }
    },
    editor: {
      title: {
        content: 'Content',
        interaction: 'Interactions',
        theme: 'Look & Feel'
      },
      field: {
        attribute: 'Attribute',
        badge_color: 'Badge color',
        badge_icon: 'Badge icon',
        bar_color: 'Bar color',
        bar_effect_jinja: 'Bar effect (Jinja mode)',
        bar_orientation: 'Bar orientation',
        bar_position: 'Bar position',
        bar_single_line: 'Single line info (overlay)',
        bar_size: 'Bar size',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Bar color mode',
        bar_scale: 'Bar scale',
        center_zero: 'Zero at center',
        center_zero_value: 'Center value',
        center_zero_growth_percent: 'Growth percentage',
        color: 'Icon color',
        decimal: 'decimal',
        double_tap_action: 'Double tap behavior',
        entity: 'Entity',
        force_circular_background: 'Force icon circular background',
        hide_jinja: 'Hide (Jinja mode)',
        hold_action: 'Hold behavior',
        icon: 'Icon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Icon double tap behavior',
        icon_hold_action: 'Icon hold behavior',
        icon_tap_action: 'Icon tap behavior',
        layout: 'Content layout',
        max_value: 'Maximum value',
        min_value: 'Minimum value',
        name: 'Name',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Swap bar and text',
        secondary: 'Secondary info',
        state_content: 'State content',
        show_all_actions: 'Show all interactions',
        tap_action: 'Tap behavior',
        text_shadow: 'Add text shadow (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Theme',
        custom_theme: 'Custom theme zones',
        unit: 'Unit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Custom secondary info',
        multiline: 'Multiline',
        interpolate: 'Interpolate colors',
        name_info: 'Custom name info',
        reverse: 'Reverse timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Additional entities',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal when Low (CPU, RAM,...)',
          optimal_when_high: 'Optimal when High (Battery...)',
          light: 'Light',
          temperature: 'Temperature',
          humidity: 'Humidity',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          xlarge: 'Extra Large'
        },
        bar_orientation: {
          ltr: 'Left to Right',
          rtl: 'Right to Left',
          up: 'Up (overlay)'
        },
        bar_position: {
          default: 'Default',
          below: 'Bar below content',
          top: 'Bar on top (overlay)',
          bottom: 'Bar on bottom (overlay)',
          overlay: 'Bar overlay on content',
          background: 'Full card background'
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Rainbow'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Rounded corners',
          glass: 'Glass',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient reverse',
          shimmer: 'Shimmer',
          shimmer_reverse: 'Shimmer reverse'
        },
        hide: {
          icon: 'Icon',
          name: 'Name',
          value: 'Value',
          unit: 'Unit',
          secondary_info: 'Secondary info',
          progress_bar: 'Bar'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Proportional',
          net: 'Net'
        }
      }
    }
  },
  'es-419': {
    card: {
      msg: {
        appliedDefaultValue: 'Se aplicó automáticamente el valor predeterminado.',
        attributeNotFound: 'No se encontró el atributo en Home Assistant.',
        entityNotFound: 'No se encontró la entidad en Home Assistant.',
        invalidActionObject: 'Objeto de acción inválido o mal estructurado.',
        invalidDecimal: 'El valor debe ser un decimal válido.',
        invalidEntityId: 'ID de entidad inválido o mal formado.',
        invalidEnumValue: 'El valor proporcionado no está dentro de las opciones permitidas.',
        invalidStateContent: 'Contenido del estado inválido o mal formado.',
        invalidStateContentEntry: 'Uno o más elementos del contenido del estado son inválidos.',
        invalidTheme: 'El tema especificado es desconocido; se usará el tema predeterminado.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo numérico.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ningún tipo permitido.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingRequiredProperty: 'Falta una propiedad obligatoria.'
      }
    },
    editor: {
      title: {
        content: 'Contenido',
        interaction: 'Interacción',
        theme: 'Apariencia y tema'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Color del distintivo',
        badge_icon: 'Ícono del distintivo',
        bar_color: 'Color de la barra de progreso',
        bar_effect_jinja: 'Efecto de la barra de progreso (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en línea (superpuesta)',
        bar_size: 'Tamaño de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de color',
        bar_scale: 'Bar scale',
        center_zero: 'Cero centrado',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color principal',
        decimal: 'Decimal',
        double_tap_action: 'Acción al doble toque',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener presionado',
        icon: 'Ícono',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acción de doble toque en ícono',
        icon_hold_action: 'Acción al mantener presionado ícono',
        icon_tap_action: 'Acción al tocar ícono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al tocar',
        text_shadow: 'Agregar sombra al texto (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unidad',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundaria personalizada',
        multiline: 'Multiline',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entidades adicionales',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Óptimo cuando es bajo (CPU, RAM…)',
          optimal_when_high: 'Óptimo cuando es alto (batería…)',
          light: 'Brillo',
          temperature: 'Temperatura',
          humidity: 'Humedad',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequeña',
          medium: 'Mediana',
          large: 'Grande',
          xlarge: 'Extra grande'
        },
        bar_orientation: {
          ltr: 'De izquierda a derecha',
          rtl: 'De derecha a izquierda',
          up: 'Hacia arriba (superpuesta)'
        },
        bar_position: {
          default: 'Predeterminado',
          below: 'Barra debajo del contenido',
          top: 'Barra arriba (superpuesta)',
          bottom: 'Barra abajo (superpuesta)',
          overlay: 'Superpuesta sobre el contenido',
          background: 'Fondo de la tarjeta'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Esquinas redondeadas',
          glass: 'Vidrio',
          gradient: 'Degradado',
          gradient_reverse: 'Degradado inverso',
          shimmer: 'Destello',
          shimmer_reverse: 'Destello inverso'
        },
        hide: {
          icon: 'Icono',
          name: 'Nombre',
          value: 'Valor',
          unit: 'Unidad',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  es: {
    card: {
      msg: {
        appliedDefaultValue: 'Se ha aplicado un valor predeterminado automáticamente.',
        attributeNotFound: 'Atributo no encontrado en Home Assistant.',
        entityNotFound: 'Entidad no encontrada en Home Assistant.',
        invalidActionObject: 'El objeto de acción es inválido o está mal estructurado.',
        invalidDecimal: 'El valor debe ser un número decimal válido.',
        invalidEntityId: 'El ID de la entidad no es válido o está mal formado.',
        invalidEnumValue: 'El valor proporcionado no es una opción válida.',
        invalidStateContent: 'El contenido del estado es inválido o está mal formado.',
        invalidStateContentEntry: 'Una o más entradas en el contenido del estado son inválidas.',
        invalidTheme: 'El tema especificado es desconocido. Se usará el tema por defecto.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo número.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ninguno de los tipos permitidos.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingRequiredProperty: 'Falta una propiedad obligatoria.'
      }
    },
    editor: {
      title: {
        content: 'Contenido',
        interaction: 'Interacciones',
        theme: 'Apariencia y funcionamiento'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Color del badge',
        badge_icon: 'Icono del badge',
        bar_color: 'Color de la barra',
        bar_effect_jinja: 'Efecto de la barra (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en una sola línea (overlay)',
        bar_size: 'Tamaño de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de color de la barra',
        bar_scale: 'Escala de la barra',
        center_zero: 'Cero en el centro',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color del icono',
        decimal: 'decimal',
        double_tap_action: 'Acción al pulsar dos veces',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener pulsado',
        icon: 'Icono',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acción al pulsar dos veces el icono',
        icon_hold_action: 'Acción al mantener pulsado el icono',
        icon_tap_action: 'Acción al pulsar el icono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al pulsar brevemente',
        text_shadow: 'Añadir sombra al texto (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zonas de tema personalizado',
        unit: 'Unidad',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundaria personalizada',
        multiline: 'Multilínea',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Modo de apilado',
        bar_stack: 'Entidades adicionales',
        migrate_config: 'Migrar configuración'
      },
      option: {
        theme: {
          optimal_when_low: 'Óptimo cuando es bajo (CPU, RAM,...)',
          optimal_when_high: 'Óptimo cuando es alto (Batería...)',
          light: 'Luz',
          temperature: 'Temperatura',
          humidity: 'Humedad',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequeña',
          medium: 'Mediana',
          large: 'Grande',
          xlarge: 'Extra grande'
        },
        bar_orientation: {
          ltr: 'De izquierda a derecha',
          rtl: 'De derecha a izquierda',
          up: 'Hacia arriba (overlay)'
        },
        bar_position: {
          default: 'Predeterminado',
          below: 'Barra debajo del contenido',
          top: 'Barra arriba (superpuesta)',
          bottom: 'Barra abajo (superpuesta)',
          overlay: 'Barra superpuesta al contenido (overlay)',
          background: 'Fondo de la tarjeta'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
        },
        bar_scale: {
          linear: 'Lineal',
          log: 'Logarítmica'
        },
        bar_effect: {
          radius: 'Esquinas redondeadas',
          glass: 'Vidrio',
          gradient: 'Degradado',
          gradient_reverse: 'Degradado inverso',
          shimmer: 'Destello',
          shimmer_reverse: 'Destello inverso'
        },
        hide: {
          icon: 'Icono',
          name: 'Nombre',
          value: 'Valor',
          unit: 'Unidad',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Umbral bajo',
          high: 'Umbral alto',
          type: 'Tipo',
          opacity: 'Opacidad',
          low_color: 'Color del umbral bajo',
          high_color: 'Color del umbral alto',
          low_as: 'Unidad (umbral bajo)',
          high_as: 'Unidad (umbral alto)',
          line_size: 'Grosor de línea',
          disable_low: 'Desactivar umbral bajo',
          disable_high: 'Desactivar umbral alto',
          low_attribute: 'Atributo',
          high_attribute: 'Atributo'
        },
        icon_animation: {
          none: 'Ninguna',
          spin: 'Girar',
          pulse: 'Pulso',
          bounce: 'Rebote',
          shake: 'Vibración',
          ping: 'Ping',
          reveal: 'Revelar',
          washing_machine: 'Lavadora',
          battery_charging: 'Batería cargando'
        },
        alert_when: {
          above: 'Alerta por encima de',
          below: 'Alerta por debajo de',
          color: 'Color de alerta',
          highlight: 'Resaltado',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Borde',
          background: 'Fondo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        max_value_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        watermark_low_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        watermark_high_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        theme_mode: {
          preset: 'Preestablecido',
          custom: 'Personalizado'
        },
        min_value: {
          attribute: 'Atributo'
        },
        max_value: {
          attribute: 'Atributo'
        },
        bar_stack_mode: {
          stacked: 'Apilado',
          proportional: 'Proporcional',
          net: 'Neto'
        }
      }
    }
  },
  et: {
    card: {
      msg: {
        appliedDefaultValue: 'Vaikimisi väärtus rakendati automaatselt.',
        attributeNotFound: 'Atribuut ei leitud Home Assistantis.',
        entityNotFound: 'Objekti ei leitud Home Assistantis.',
        invalidActionObject: 'Tegevuse objekt on vigane või valesti struktureeritud.',
        invalidDecimal: 'Väärtus peab olema positiivne täisarv.',
        invalidEntityId: 'Objekti ID on vigane või valesti vormistatud.',
        invalidEnumValue: 'Antud väärtus ei kuulu lubatud valikute hulka.',
        invalidStateContent: 'Seisundi sisu on vigane või valesti vormistatud.',
        invalidStateContentEntry: 'Üks või mitu seisundi sisu kirjet on vigased.',
        invalidTheme: 'Määratud teema on tundmatu. Kasutatakse vaikimisi teemat.',
        invalidTypeArray: 'Oodati massiivi tüüpi väärtust.',
        invalidTypeBoolean: 'Oodati loogilist (boolean) tüüpi väärtust.',
        invalidTypeNumber: 'Oodati numbri tüüpi väärtust.',
        invalidTypeObject: 'Oodati objekti tüüpi väärtust.',
        invalidTypeString: 'Oodati stringi tüüpi väärtust.',
        invalidUnionType: 'Väärtus ei vasta ühelegi lubatud tüübile.',
        missingActionKey: 'Tegevuse objektist puudub kohustuslik võti.',
        missingRequiredProperty: 'Puudub kohustuslik atribuut.'
      }
    },
    editor: {
      title: {
        content: 'Sisu',
        interaction: 'Interaktsioonid',
        theme: 'Välimus ja kasutatavus'
      },
      field: {
        attribute: 'Atribuut',
        badge_color: 'Märgi värv',
        badge_icon: 'Märgi ikoon',
        bar_color: 'Riba värv',
        bar_effect_jinja: 'Riba efekt (Jinja režiim)',
        bar_orientation: 'Riba orientatsioon',
        bar_position: 'Riba positsioon',
        bar_single_line: 'Info ühel real (overlay)',
        bar_size: 'Riba suurus',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Värvirežiim',
        bar_scale: 'Bar scale',
        center_zero: 'Null keskel',
        center_zero_value: 'Keskväärtus',
        center_zero_growth_percent: 'Kasvuprotsent',
        color: 'Ikooni värv',
        decimal: 'Kümnendkoht',
        double_tap_action: 'Topeltpuudutuse tegevus',
        entity: 'Objekt',
        force_circular_background: 'Sunnitud ümmargune taust',
        hide_jinja: 'Peida (Jinja režiim)',
        hold_action: 'Pikema vajutuse tegevus',
        icon: 'Ikoon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikooni topeltpuudutuse tegevus',
        icon_hold_action: 'Ikooni pika vajutuse tegevus',
        icon_tap_action: 'Ikooni puudutuse tegevus',
        layout: 'Sisu paigutus',
        max_value: 'Maksimaalne väärtus',
        min_value: 'Minimaalne väärtus',
        name: 'Nimi',
        percent: 'Protsent',
        reverse_secondary_info_row: 'Vaheta riba ja tekst',
        secondary: 'Täiendav info',
        state_content: 'Oleku sisu',
        show_all_actions: 'Kuva kõik toimingud',
        tap_action: 'Puudutuse tegevus',
        text_shadow: 'Lisa teksti vari (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Teema',
        custom_theme: 'Custom theme zones',
        unit: 'Ühik',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Kohandatud sekundaarne teave',
        multiline: 'Multiline',
        interpolate: 'Värvide interpoleerimine',
        name_info: 'Kohandatud nime teave',
        reverse: 'Pööratud taimer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Täiendavad üksused',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaalne madalatel väärtustel (CPU, RAM...)',
          optimal_when_high: 'Optimaalne kõrgetel väärtustel (Aku...)',
          light: 'Hele',
          temperature: 'Temperatuur',
          humidity: 'Niiskus',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Väike',
          medium: 'Keskmine',
          large: 'Suur',
          xlarge: 'Väga suur'
        },
        bar_orientation: {
          ltr: 'Vasakult paremale',
          rtl: 'Paremalt vasakule',
          up: 'Üles (overlay)'
        },
        bar_position: {
          default: 'Vaikimisi',
          below: 'Riba sisu all',
          top: 'Riba üleval (overlay)',
          bottom: 'Riba all (overlay)',
          overlay: 'Riba sisu kohal (overlay)',
          background: 'Kaardi taust'
        },
        layout: {
          horizontal: 'Horisontaalne (vaikimisi)',
          vertical: 'Vertikaalne'
        },
        bar_color_mode: {
          auto: 'Automaatne',
          segment: 'Segmendid',
          rainbow: 'Vikerkaar'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Ümarad nurgad',
          glass: 'Klaas',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient pööratud',
          shimmer: 'Sära',
          shimmer_reverse: 'Sära pööratud'
        },
        hide: {
          icon: 'Ikoon',
          name: 'Nimi',
          value: 'Väärtus',
          unit: 'Ühik',
          secondary_info: 'Info',
          progress_bar: 'Riba'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  fi: {
    card: {
      msg: {
        appliedDefaultValue: 'Oletusarvo on asetettu automaattisesti.',
        attributeNotFound: 'Attribuuttia ei löytynyt Home Assistantista.',
        entityNotFound: 'Entiteettiä ei löytynyt Home Assistantista.',
        invalidActionObject: 'Toiminto-objekti on virheellinen tai huonosti rakennettu.',
        invalidDecimal: 'Arvon on oltava kelvollinen desimaaliluku.',
        invalidEntityId: 'Entiteetin tunniste on virheellinen tai väärin muotoiltu.',
        invalidEnumValue: 'Annettu arvo ei ole sallituista vaihtoehdoista.',
        invalidStateContent: 'Tilasisältö on virheellinen tai väärässä muodossa.',
        invalidStateContentEntry: 'Yksi tai useampi tilasisällön merkintä on virheellinen.',
        invalidTheme: 'Määritetty teema on tuntematon. Käytetään oletusteemaa.',
        invalidTypeArray: 'Odotettiin taulukkoarvoa.',
        invalidTypeBoolean: 'Odotettiin totuusarvoa (boolean).',
        invalidTypeNumber: 'Odotettiin numeerista arvoa.',
        invalidTypeObject: 'Odotettiin objektityyppistä arvoa.',
        invalidTypeString: 'Odotettiin merkkijonotyyppistä arvoa.',
        invalidUnionType: 'Arvo ei vastaa mitään sallituista tyypeistä.',
        missingActionKey: 'Toiminto-objektista puuttuu vaadittu avain.',
        missingRequiredProperty: 'Pakollinen ominaisuus puuttuu.'
      }
    },
    editor: {
      title: {
        content: 'Sisältö',
        interaction: 'Vuorovaikutukset',
        theme: 'Ulkoasu'
      },
      field: {
        attribute: 'Attribuutti',
        badge_color: 'Badge-väri',
        badge_icon: 'Badge-ikoni',
        bar_color: 'Pääväri',
        bar_effect_jinja: 'Palkin efekti (Jinja-tila)',
        bar_orientation: 'Palkin suunta',
        bar_position: 'Palkin sijainti',
        bar_single_line: 'Tiedot yhdellä rivillä (overlay)',
        bar_size: 'Palkin koko',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Väritila',
        bar_scale: 'Bar scale',
        center_zero: 'Nolla keskellä',
        center_zero_value: 'Keskiarvo',
        center_zero_growth_percent: 'Kasvuprosentti',
        color: 'Pääväri',
        decimal: 'desimaali',
        double_tap_action: 'Toiminto kahdella napautuksella',
        entity: 'Entiteetti',
        force_circular_background: 'Pakota pyöreä tausta',
        hide_jinja: 'Piilota (Jinja-tila)',
        hold_action: 'Toiminto pitkällä painalluksella',
        icon: 'Ikoni',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Toiminto kahdella napautuksella kuvaketta',
        icon_hold_action: 'Toiminto pitkällä painalluksella kuvaketta',
        icon_tap_action: 'Toiminto kuvaketta napautettaessa',
        layout: 'Sisällön asettelu',
        max_value: 'Maksimiarvo',
        min_value: 'Minimiarvo',
        name: 'Nimi',
        percent: 'Prosentti',
        reverse_secondary_info_row: 'Vaihda palkki ja teksti',
        secondary: 'Lisätiedot',
        state_content: 'Tilan sisältö',
        show_all_actions: 'Näytä kaikki toiminnot',
        tap_action: 'Toiminto lyhyellä napautuksella',
        text_shadow: 'Lisää tekstivarjo (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Teema',
        custom_theme: 'Custom theme zones',
        unit: 'Yksikkö',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Mukautettu toissijainen tieto',
        multiline: 'Multiline',
        interpolate: 'Interpoloi värit',
        name_info: 'Mukautettu nimitieto',
        reverse: 'Käänteinen ajastin',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Lisäentiteetit',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaalinen alhaisena (CPU, RAM...)',
          optimal_when_high: 'Optimaalinen korkeana (Akku...)',
          light: 'Valoisuus',
          temperature: 'Lämpötila',
          humidity: 'Kosteus',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pieni',
          medium: 'Keski',
          large: 'Suuri',
          xlarge: 'Erittäin suuri'
        },
        bar_orientation: {
          ltr: 'Vasemmalta oikealle',
          rtl: 'Oikealta vasemmalle',
          up: 'Ylös (overlay)'
        },
        bar_position: {
          default: 'Oletus',
          below: 'Palkki sisällön alla',
          top: 'Palkki ylhäällä (päällekkäin)',
          bottom: 'Palkki alhaalla (päällekkäin)',
          overlay: 'Palkki sisällön päällä (overlay)',
          background: 'Kortin tausta'
        },
        layout: {
          horizontal: 'Vaakasuora (oletus)',
          vertical: 'Pystysuora'
        },
        bar_color_mode: {
          auto: 'Automaattinen',
          segment: 'Segmentit',
          rainbow: 'Sateenkaari'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Pyöristetyt kulmat',
          glass: 'Lasi',
          gradient: 'Liukuväri',
          gradient_reverse: 'Liukuväri käänteinen',
          shimmer: 'Hohto',
          shimmer_reverse: 'Hohto käänteinen'
        },
        hide: {
          icon: 'Kuvake',
          name: 'Nimi',
          value: 'Arvo',
          unit: 'Yksikkö',
          secondary_info: 'Tiedot',
          progress_bar: 'Palkki'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  fr: {
    card: {
      msg: {
        appliedDefaultValue: 'Une valeur par défaut a été appliquée automatiquement.',
        attributeNotFound: 'Attribut introuvable dans Home Assistant.',
        entityNotFound: 'Entité introuvable dans Home Assistant.',
        invalidActionObject: 'L’objet action est invalide ou mal structuré.',
        invalidDecimal: 'La valeur doit être un nombre entier positif.',
        invalidEntityId: 'L’identifiant de l’entité est invalide ou mal formé.',
        invalidEnumValue: 'La valeur fournie ne fait pas partie des options autorisées.',
        invalidStateContent: 'Le contenu d’état est invalide ou mal formé.',
        invalidStateContentEntry: 'Une ou plusieurs entrées du contenu d’état sont invalides.',
        invalidTheme: 'Le thème spécifié est inconnu. Le thème par défaut sera utilisé.',
        invalidTypeArray: 'Une valeur de type tableau était attendue.',
        invalidTypeBoolean: 'Une valeur de type booléen était attendue.',
        invalidTypeNumber: 'Une valeur de type nombre était attendue.',
        invalidTypeObject: 'Une valeur de type objet était attendue.',
        invalidTypeString: 'Une valeur de type chaîne de caractères était attendue.',
        invalidUnionType: 'La valeur ne correspond à aucun des types autorisés.',
        missingActionKey: 'Une clé requise est manquante dans l’objet action.',
        missingRequiredProperty: 'Une propriété requise est manquante.'
      }
    },
    editor: {
      title: {
        content: 'Contenu',
        interaction: 'Interactions',
        theme: 'Aspect visuel et convivialité'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Couleur du badge',
        badge_icon: 'Icône du badge',
        bar_color: 'Couleur de la barre',
        bar_effect_jinja: 'Effet sur la barre (mode Jinja)',
        bar_orientation: 'Orientation de la barre',
        bar_position: 'Position de la barre',
        bar_single_line: 'Infos sur une ligne (overlay)',
        bar_size: 'Taille de la barre',
        bar_segments: 'Segments de barre',
        bar_color_mode: 'Mode de couleur de la barre',
        bar_scale: 'Échelle de la barre',
        center_zero: 'Zéro au centre',
        center_zero_value: 'Valeur de centrage',
        center_zero_growth_percent: 'Pourcentage de croissance',
        color: 'Couleur de l\'icône',
        decimal: 'décimal',
        double_tap_action: 'Comportement lors d\'un double appui',
        entity: 'Entité',
        force_circular_background: 'Forcer le fond circulaire',
        hide_jinja: 'Masquer (mode Jinja)',
        hold_action: 'Comportement lors d\'un appui long',
        icon: 'Icône',
        icon_animation: 'Animation de l\'icône',
        icon_double_tap_action: 'Comportement lors d\'un double appui sur l\'icône',
        icon_hold_action: 'Comportement lors d\'un appui long sur l\'icône',
        icon_tap_action: 'Comportement lors de l\'appui sur l\'icône',
        layout: 'Disposition du contenu',
        max_value: 'Valeur maximum',
        min_value: 'Valeur minimum',
        name: 'Nom',
        percent: 'Pourcentage',
        reverse_secondary_info_row: 'Intervertir barre et texte',
        secondary: 'Information secondaire',
        state_content: 'Contenu de l’état',
        show_all_actions: 'Afficher toutes les interactions',
        tap_action: 'Comportement lors d\'un appui court',
        text_shadow: 'Ajouter une ombre au texte (overlay)',
        theme_mode: 'Mode de thème',
        theme: 'Thème',
        custom_theme: 'Zones de thème personnalisé',
        unit: 'Unité',
        min_value_mode: 'Source de la valeur min',
        max_value_mode: 'Source de la valeur max',
        watermark_low_mode: 'Source du seuil bas',
        watermark_high_mode: 'Source du seuil haut',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alerte',
        custom_info: 'Info secondaire personnalisée',
        multiline: 'Multiligne',
        interpolate: 'Interpoler les couleurs',
        name_info: 'Info nom personnalisée',
        reverse: 'Inverser le minuteur',
        bar_stack_mode: 'Mode d\'empilement',
        bar_stack: 'Entités supplémentaires',
        migrate_config: 'Migrer la config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal quand c\'est bas (CPU, RAM,...)',
          optimal_when_high: 'Optimal quand c\'est élevé (Batterie...)',
          light: 'Lumière',
          temperature: 'Température',
          humidity: 'Humidité',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Petite',
          medium: 'Moyenne',
          large: 'Grande',
          xlarge: 'Très grande'
        },
        bar_orientation: {
          ltr: 'Gauche à droite',
          rtl: 'Droite à gauche',
          up: 'Vers le haut (overlay)'
        },
        bar_position: {
          default: 'Défaut',
          below: 'Barre en dessous du contenu',
          top: 'Barre en haut (superposée)',
          bottom: 'Barre en bas (superposée)',
          overlay: 'Barre superposée au contenu (overlay)',
          background: 'Arrière-plan de la carte'
        },
        layout: {
          horizontal: 'Horizontal (par défaut)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenté',
          rainbow: 'Arc-en-ciel'
        },
        bar_scale: {
          linear: 'Linéaire',
          log: 'Logarithmique'
        },
        bar_effect: {
          radius: 'Coins arrondis',
          glass: 'Verre',
          gradient: 'Dégradé',
          gradient_reverse: 'Dégradé inversé',
          shimmer: 'Reflet',
          shimmer_reverse: 'Reflet inversé'
        },
        hide: {
          icon: 'Icône',
          name: 'Nom',
          value: 'Valeur',
          unit: 'Unité',
          secondary_info: 'Info',
          progress_bar: 'Barre'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Seuil bas',
          high: 'Seuil haut',
          type: 'Type',
          opacity: 'Opacité',
          low_color: 'Couleur du seuil bas',
          high_color: 'Couleur du seuil haut',
          low_as: 'Unité (seuil bas)',
          high_as: 'Unité (seuil haut)',
          line_size: 'Épaisseur de ligne',
          disable_low: 'Désactiver le seuil bas',
          disable_high: 'Désactiver le seuil haut',
          low_attribute: 'Attribut',
          high_attribute: 'Attribut'
        },
        icon_animation: {
          none: 'Aucune',
          spin: 'Rotation',
          pulse: 'Pulsation',
          bounce: 'Rebond',
          shake: 'Secousse',
          ping: 'Ping',
          reveal: 'Apparition',
          washing_machine: 'Machine à laver',
          battery_charging: 'Batterie en charge'
        },
        alert_when: {
          above: 'Alerte au-dessus de',
          below: 'Alerte en dessous de',
          color: 'Couleur d\'alerte',
          highlight: 'Mise en évidence',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Bordure',
          background: 'Fond'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        max_value_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        watermark_low_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        watermark_high_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        theme_mode: {
          preset: 'Prédéfini',
          custom: 'Personnalisé'
        },
        min_value: {
          attribute: 'Attribut'
        },
        max_value: {
          attribute: 'Attribut'
        },
        bar_stack_mode: {
          stacked: 'Empilé',
          proportional: 'Proportionnel',
          net: 'Net'
        }
      }
    }
  },
  hi: {
    card: {
      msg: {
        appliedDefaultValue: 'एक डिफ़ॉल्ट मान स्वचालित रूप से लागू किया गया है।',
        attributeNotFound: 'HA में एट्रिब्यूट नहीं मिला।',
        entityNotFound: 'HA में एंटिटी नहीं मिली।',
        invalidActionObject: 'एक्शन ऑब्जेक्ट अमान्य या गलत तरीके से संरचित है।',
        invalidDecimal: 'मान एक वैध दशमलव संख्या होना चाहिए।',
        invalidEntityId: 'एंटिटी आईडी अमान्य या गलत तरीके से बनाई गई है।',
        invalidEnumValue: 'प्रदान किया गया मान अनुमतित विकल्पों में से एक नहीं है।',
        invalidStateContent: 'स्थिति सामग्री अमान्य या गलत तरीके से बनाई गई है।',
        invalidStateContentEntry: 'स्थिति सामग्री में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidTheme: 'निर्दिष्ट थीम अज्ञात है। डिफ़ॉल्ट थीम का उपयोग किया जाएगा।',
        invalidTypeArray: 'एरे प्रकार का मान अपेक्षित है।',
        invalidTypeBoolean: 'बूलियन प्रकार का मान अपेक्षित है।',
        invalidTypeNumber: 'संख्या प्रकार का मान अपेक्षित है।',
        invalidTypeObject: 'ऑब्जेक्ट प्रकार का मान अपेक्षित है।',
        invalidTypeString: 'स्ट्रिंग प्रकार का मान अपेक्षित है।',
        invalidUnionType: 'मान अनुमतित प्रकारों में से किसी से मेल नहीं खाता।',
        missingActionKey: 'एक्शन ऑब्जेक्ट में एक आवश्यक कुंजी गायब है।',
        missingRequiredProperty: 'आवश्यक गुण गायब है।'
      }
    },
    editor: {
      title: {
        content: 'सामग्री',
        interaction: 'बातचीत',
        theme: 'रूप और अनुभव'
      },
      field: {
        attribute: 'एट्रिब्यूट',
        badge_color: 'बैज का रंग',
        badge_icon: 'बैज का आइकन',
        bar_color: 'मुख्य रंग',
        bar_effect_jinja: 'बार पर प्रभाव (Jinja मोड)',
        bar_orientation: 'बार की दिशा',
        bar_position: 'बार की स्थिति',
        bar_single_line: 'एक पंक्ति में जानकारी (ओवरले)',
        bar_size: 'बार का आकार',
        bar_segments: 'Bar segments',
        bar_color_mode: 'रंग मोड',
        bar_scale: 'Bar scale',
        center_zero: 'शून्य केंद्र में',
        center_zero_value: 'केंद्र मान',
        center_zero_growth_percent: 'वृद्धि प्रतिशत',
        color: 'मुख्य रंग',
        decimal: 'दशमलव',
        double_tap_action: 'डबल टैप व्यवहार',
        entity: 'एंटिटी',
        force_circular_background: 'गोलाकार पृष्ठभूमि को बाध्य करें',
        hide_jinja: 'छिपाएँ (Jinja मोड)',
        hold_action: 'होल्ड व्यवहार',
        icon: 'आइकन',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'आइकन डबल टैप व्यवहार',
        icon_hold_action: 'आइकन होल्ड व्यवहार',
        icon_tap_action: 'आइकन टैप व्यवहार',
        layout: 'सामग्री लेआउट',
        max_value: 'अधिकतम मान',
        min_value: 'न्यूनतम मान',
        name: 'नाम',
        percent: 'प्रतिशत',
        reverse_secondary_info_row: 'बार और टेक्स्ट बदलें',
        secondary: 'सहायक जानकारी',
        state_content: 'स्थिति की सामग्री',
        show_all_actions: 'सभी क्रियाएँ दिखाएँ',
        tap_action: 'टैप व्यवहार',
        text_shadow: 'टेक्स्ट में छाया जोड़ें (overlay)',
        theme_mode: 'Theme mode',
        theme: 'थीम',
        custom_theme: 'Custom theme zones',
        unit: 'इकाई',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'कस्टम द्वितीयक जानकारी',
        multiline: 'Multiline',
        interpolate: 'रंग इंटरपोलेशन',
        name_info: 'कस्टम नाम जानकारी',
        reverse: 'टाइमर उलटें',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'अतिरिक्त एंटिटी',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'बाएं से दाएं',
          rtl: 'दाएं से बाएं',
          up: 'ऊपर की ओर (ओवरले)'
        },
        bar_position: {
          below: 'सामग्री के नीचे बार',
          bottom: 'नीचे बार (ओवरले)',
          default: 'डिफ़ॉल्ट',
          overlay: 'सामग्री पर ओवरले बार',
          top: 'ऊपर बार (ओवरले)',
          background: 'कार्ड पृष्ठभूमि'
        },
        bar_size: {
          large: 'बड़ी',
          medium: 'मध्यम',
          small: 'छोटी',
          xlarge: 'अतिरिक्त बड़ी'
        },
        layout: {
          horizontal: 'क्षैतिज (डिफ़ॉल्ट)',
          vertical: 'लंबवत'
        },
        theme: {
          humidity: 'आर्द्रता',
          light: 'प्रकाश',
          optimal_when_high: 'उच्च होने पर इष्टतम (बैटरी...)',
          optimal_when_low: 'कम होने पर इष्टतम (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'तापमान',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'स्वचालित',
          segment: 'खंड',
          rainbow: 'इंद्रधनुष'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'गोल कोने',
          glass: 'कांच',
          gradient: 'ग्रेडिएंट',
          gradient_reverse: 'उल्टा ग्रेडिएंट',
          shimmer: 'चमक',
          shimmer_reverse: 'उल्टी चमक'
        },
        hide: {
          icon: 'आइकन',
          name: 'नाम',
          value: 'मूल्य',
          unit: 'इकाई',
          secondary_info: 'जानकारी',
          progress_bar: 'बार'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  hr: {
    card: {
      msg: {
        appliedDefaultValue: 'Zadana vrijednost automatski je primijenjena.',
        attributeNotFound: 'Atribut nije pronađen u Home Assistantu.',
        entityNotFound: 'Entitet nije pronađen u Home Assistantu.',
        invalidActionObject: 'Objekt radnje je nevažeći ili loše strukturiran.',
        invalidDecimal: 'Vrijednost mora biti valjani decimalni broj.',
        invalidEntityId: 'ID entiteta je nevažeći ili pogrešno formatiran.',
        invalidEnumValue: 'Navedena vrijednost nije među dopuštenim opcijama.',
        invalidStateContent: 'Sadržaj stanja je nevažeći ili pogrešno formatiran.',
        invalidStateContentEntry: 'Jedan ili više unosa stanja su nevažeći.',
        invalidTheme: 'Navedena tema je nepoznata. Koristi se zadana tema.',
        invalidTypeArray: 'Očekivana je vrijednost tipa polje.',
        invalidTypeBoolean: 'Očekivana je vrijednost tipa boolean.',
        invalidTypeNumber: 'Očekivana je vrijednost tipa broj.',
        invalidTypeObject: 'Očekivana je vrijednost tipa objekt.',
        invalidTypeString: 'Očekivana je vrijednost tipa string.',
        invalidUnionType: 'Vrijednost ne odgovara nijednom dopuštenom tipu.',
        missingActionKey: 'Nedostaje obavezni ključ u objektu radnje.',
        missingRequiredProperty: 'Nedostaje obavezno svojstvo.'
      }
    },
    editor: {
      title: {
        content: 'Sadržaj',
        interaction: 'Interakcije',
        theme: 'Izgled i funkcionalnost'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Boja oznake',
        badge_icon: 'Ikona oznake',
        bar_color: 'Boja za traku',
        bar_effect_jinja: 'Efekt na traci (Jinja način)',
        bar_orientation: 'Orijentacija trake',
        bar_position: 'Položaj trake',
        bar_single_line: 'Informacije u jednom retku (overlay)',
        bar_size: 'Veličina trake',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Način boje',
        bar_scale: 'Bar scale',
        center_zero: 'Nula u sredini',
        center_zero_value: 'Vrijednost sredine',
        center_zero_growth_percent: 'Postotak rasta',
        color: 'Primarna boja',
        decimal: 'decimalni',
        double_tap_action: 'Radnja na dupli dodir',
        entity: 'Entitet',
        force_circular_background: 'Prisili kružnu pozadinu',
        hide_jinja: 'Sakrij (Jinja način)',
        hold_action: 'Radnja na dugi dodir',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Radnja na dupli dodir ikone',
        icon_hold_action: 'Radnja na dugi dodir ikone',
        icon_tap_action: 'Radnja na dodir ikone',
        layout: 'Raspored sadržaja',
        max_value: 'Maksimalna vrijednost',
        min_value: 'Minimalna vrijednost',
        name: 'Ime',
        percent: 'Postotak',
        reverse_secondary_info_row: 'Zamijeni traku i tekst',
        secondary: 'Sekundarne informacije',
        state_content: 'Sadržaj stanja',
        show_all_actions: 'Prikaži sve radnje',
        tap_action: 'Radnja na kratki dodir',
        text_shadow: 'Dodaj sjenu tekstu (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Jedinica',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Prilagođena sekundarna informacija',
        multiline: 'Multiline',
        interpolate: 'Interpolacija boja',
        name_info: 'Prilagođena informacija naziva',
        reverse: 'Obrnuti tajmer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatni entiteti',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Lijevo na desno',
          rtl: 'Desno na lijevo',
          up: 'Prema gore (overlay)'
        },
        bar_position: {
          below: 'Traka ispod sadržaja',
          bottom: 'Traka na dnu (overlay)',
          default: 'Zadano',
          overlay: 'Traka preklopljena na sadržaj (overlay)',
          top: 'Traka na vrhu (overlay)',
          background: 'Pozadina kartice'
        },
        bar_size: {
          large: 'Velika',
          medium: 'Srednja',
          small: 'Mala',
          xlarge: 'Vrlo velika'
        },
        layout: {
          horizontal: 'Horizontalno (zadano)',
          vertical: 'Vertikalno'
        },
        theme: {
          humidity: 'Vlažnost',
          light: 'Svjetlo',
          optimal_when_high: 'Optimalno kada je visoko (Baterija...)',
          optimal_when_low: 'Optimalno kada je nisko (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatski',
          segment: 'Segmenti',
          rainbow: 'Duga'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaobljeni uglovi',
          glass: 'Staklo',
          gradient: 'Prijelaz',
          gradient_reverse: 'Obrnuti prijelaz',
          shimmer: 'Sjaj',
          shimmer_reverse: 'Obrnuti sjaj'
        },
        hide: {
          icon: 'Ikona',
          name: 'Ime',
          value: 'Vrijednost',
          unit: 'Jedinica',
          secondary_info: 'Info',
          progress_bar: 'Traka'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  hu: {
    card: {
      msg: {
        appliedDefaultValue: 'Alapértelmezett érték automatikusan alkalmazva.',
        attributeNotFound: 'Az attribútum nem található a Home Assistantban.',
        entityNotFound: 'Az entitás nem található a Home Assistantban.',
        invalidActionObject: 'Az action objektum érvénytelen vagy hibás felépítésű.',
        invalidDecimal: 'Az értéknek pozitív egész számnak kell lennie.',
        invalidEntityId: 'Az entitás azonosító érvénytelen vagy hibás.',
        invalidEnumValue: 'A megadott érték nem része az engedélyezett opcióknak.',
        invalidStateContent: 'Az állapot tartalma érvénytelen vagy hibás.',
        invalidStateContentEntry: 'Az állapot tartalmának egy vagy több eleme érvénytelen.',
        invalidTheme: 'Az adott téma ismeretlen. Az alapértelmezett téma lesz használva.',
        invalidTypeArray: 'Tömb típusú érték volt elvárva.',
        invalidTypeBoolean: 'Logikai (boolean) érték volt elvárva.',
        invalidTypeNumber: 'Szám típusú érték volt elvárva.',
        invalidTypeObject: 'Objektum típusú érték volt elvárva.',
        invalidTypeString: 'Szöveg típusú érték volt elvárva.',
        invalidUnionType: 'Az érték nem felel meg egyik engedélyezett típusnak sem.',
        missingActionKey: 'Egy kötelező kulcs hiányzik az action objektumból.',
        missingRequiredProperty: 'Egy kötelező tulajdonság hiányzik.'
      }
    },
    editor: {
      title: {
        content: 'Tartalom',
        interaction: 'Interakciók',
        theme: 'Megjelenés és használhatóság'
      },
      field: {
        attribute: 'Attribútum',
        badge_color: 'Jelvény színe',
        badge_icon: 'Jelvény ikon',
        bar_color: 'Sáv színe',
        bar_effect_jinja: 'Sáv effektus (Jinja mód)',
        bar_orientation: 'Sáv iránya',
        bar_position: 'Sáv pozíciója',
        bar_single_line: 'Egy soros információ (overlay)',
        bar_size: 'Sáv mérete',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Szín mód',
        bar_scale: 'Bar scale',
        center_zero: 'Nulla középen',
        center_zero_value: 'Középérték',
        center_zero_growth_percent: 'Növekedési százalék',
        color: 'Ikon színe',
        decimal: 'Tizedes',
        double_tap_action: 'Kettős koppintás művelet',
        entity: 'Entitás',
        force_circular_background: 'Kör alakú háttér erőltetése',
        hide_jinja: 'Elrejtés (Jinja mód)',
        hold_action: 'Hosszan tartó nyomás művelet',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikon dupla koppintás művelet',
        icon_hold_action: 'Ikon hosszan nyomás művelet',
        icon_tap_action: 'Ikon koppintás művelet',
        layout: 'Tartalom elrendezése',
        max_value: 'Maximális érték',
        min_value: 'Minimális érték',
        name: 'Név',
        percent: 'Százalék',
        reverse_secondary_info_row: 'Cserélje fel a sávot és a szöveget',
        secondary: 'Másodlagos információ',
        state_content: 'Állapot tartalma',
        show_all_actions: 'Az összes művelet megjelenítése',
        tap_action: 'Koppintás művelet',
        text_shadow: 'Szöveg árnyék hozzáadása (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Téma',
        custom_theme: 'Custom theme zones',
        unit: 'Mértékegység',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Egyéni másodlagos info',
        multiline: 'Multiline',
        interpolate: 'Színinterpoláció',
        name_info: 'Egyéni névinfo',
        reverse: 'Fordított időzítő',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'További entitások',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimális alacsony értéknél (CPU, RAM...)',
          optimal_when_high: 'Optimális magas értéknél (Akkumulátor...)',
          light: 'Világos',
          temperature: 'Hőmérséklet',
          humidity: 'Páratartalom',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Kicsi',
          medium: 'Közepes',
          large: 'Nagy',
          xlarge: 'Nagyon nagy'
        },
        bar_orientation: {
          ltr: 'Balról jobbra',
          rtl: 'Jobbról balra',
          up: 'Felfelé (overlay)'
        },
        bar_position: {
          default: 'Alapértelmezett',
          below: 'Sáv a tartalom alatt',
          top: 'Sáv fent (overlay)',
          bottom: 'Sáv lent (overlay)',
          overlay: 'Sáv a tartalmon (overlay)',
          background: 'Kártya háttér'
        },
        layout: {
          horizontal: 'Vízszintes (alapértelmezett)',
          vertical: 'Függőleges'
        },
        bar_color_mode: {
          auto: 'Automatikus',
          segment: 'Szegmens',
          rainbow: 'Szivárvány'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Lekerekített sarkok',
          glass: 'Üveg',
          gradient: 'Átmenet',
          gradient_reverse: 'Fordított átmenet',
          shimmer: 'Csillogás',
          shimmer_reverse: 'Fordított csillogás'
        },
        hide: {
          icon: 'Ikon',
          name: 'Név',
          value: 'Érték',
          unit: 'Egység',
          secondary_info: 'Info',
          progress_bar: 'Sáv'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  id: {
    card: {
      msg: {
        appliedDefaultValue: 'Nilai default telah diterapkan secara otomatis.',
        attributeNotFound: 'Atribut tidak ditemukan di HA.',
        entityNotFound: 'Entitas tidak ditemukan di HA.',
        invalidActionObject: 'Objek aksi tidak valid atau struktur salah.',
        invalidDecimal: 'Nilai harus berupa angka desimal yang valid.',
        invalidEntityId: 'ID entitas tidak valid atau salah format.',
        invalidEnumValue: 'Nilai yang diberikan bukan salah satu dari opsi yang diizinkan.',
        invalidStateContent: 'Konten state tidak valid atau salah format.',
        invalidStateContentEntry: 'Satu atau lebih entri dalam konten state tidak valid.',
        invalidTheme: 'Tema yang ditentukan tidak dikenal. Tema default akan digunakan.',
        invalidTypeArray: 'Mengharapkan nilai bertipe array.',
        invalidTypeBoolean: 'Mengharapkan nilai bertipe boolean.',
        invalidTypeNumber: 'Mengharapkan nilai bertipe angka.',
        invalidTypeObject: 'Mengharapkan nilai bertipe object.',
        invalidTypeString: 'Mengharapkan nilai bertipe string.',
        invalidUnionType: 'Nilai tidak cocok dengan tipe yang diizinkan.',
        missingActionKey: 'Kunci yang diperlukan hilang dalam objek aksi.',
        missingRequiredProperty: 'Properti yang diperlukan hilang.'
      }
    },
    editor: {
      title: {
        content: 'Konten',
        interaction: 'Interaksi',
        theme: 'Tampilan & Nuansa'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Warna lencana',
        badge_icon: 'Ikon lencana',
        bar_color: 'Warna bar',
        bar_effect_jinja: 'Efek pada bar (mode Jinja)',
        bar_orientation: 'Orientasi bar',
        bar_position: 'Posisi bar',
        bar_single_line: 'Info dalam satu baris (overlay)',
        bar_size: 'Ukuran bar',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mode warna',
        bar_scale: 'Bar scale',
        center_zero: 'Nol di tengah',
        center_zero_value: 'Nilai tengah',
        center_zero_growth_percent: 'Persentase pertumbuhan',
        color: 'Warna utama',
        decimal: 'desimal',
        double_tap_action: 'Perilaku ketuk ganda',
        entity: 'Entitas',
        force_circular_background: 'Paksa latar belakang melingkar',
        hide_jinja: 'Sembunyikan (mode Jinja)',
        hold_action: 'Perilaku tahan',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Perilaku ketuk ganda ikon',
        icon_hold_action: 'Perilaku tahan ikon',
        icon_tap_action: 'Perilaku ketuk ikon',
        layout: 'Tata letak konten',
        max_value: 'Nilai maksimum',
        min_value: 'Nilai minimum',
        name: 'Nama',
        percent: 'Persentase',
        reverse_secondary_info_row: 'Tukar bilah dan teks',
        secondary: 'Informasi sekunder',
        state_content: 'Konten status',
        show_all_actions: 'Tampilkan semua tindakan',
        tap_action: 'Perilaku ketuk',
        text_shadow: 'Tambahkan bayangan teks (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info sekunder kustom',
        multiline: 'Multiline',
        interpolate: 'Interpolasi warna',
        name_info: 'Info nama kustom',
        reverse: 'Timer terbalik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entitas tambahan',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Kiri ke kanan',
          rtl: 'Kanan ke kiri',
          up: 'Ke atas (overlay)'
        },
        bar_position: {
          below: 'Bar di bawah konten',
          bottom: 'Bar di bawah (overlay)',
          default: 'Default',
          overlay: 'Bar ditumpangkan pada konten (overlay)',
          top: 'Bar di atas (overlay)',
          background: 'Latar belakang kartu'
        },
        bar_size: {
          large: 'Besar',
          medium: 'Sedang',
          small: 'Kecil',
          xlarge: 'Sangat besar'
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Kelembaban',
          light: 'Cahaya',
          optimal_when_high: 'Optimal saat Tinggi (Baterai...)',
          optimal_when_low: 'Optimal saat Rendah (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Suhu',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Otomatis',
          segment: 'Segmen',
          rainbow: 'Pelangi'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Sudut membulat',
          glass: 'Kaca',
          gradient: 'Gradien',
          gradient_reverse: 'Gradien terbalik',
          shimmer: 'Kilau',
          shimmer_reverse: 'Kilau terbalik'
        },
        hide: {
          icon: 'Ikon',
          name: 'Nama',
          value: 'Nilai',
          unit: 'Unit',
          secondary_info: 'Info',
          progress_bar: 'Bilah'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  it: {
    card: {
      msg: {
        appliedDefaultValue: 'È stato applicato automaticamente un valore predefinito.',
        attributeNotFound: 'Attributo non trovato in Home Assistant.',
        entityNotFound: 'Entità non trovata in Home Assistant.',
        invalidActionObject: 'L\'oggetto azione non è valido o è strutturato in modo errato.',
        invalidDecimal: 'Il valore deve essere un numero decimale valido.',
        invalidEntityId: 'L\'ID dell\'entità non è valido o è mal formattato.',
        invalidEnumValue: 'Il valore fornito non è tra quelli consentiti.',
        invalidStateContent: 'Il contenuto dello stato non è valido o è mal formattato.',
        invalidStateContentEntry: 'Una o più voci nel contenuto dello stato non sono valide.',
        invalidTheme: 'Il tema specificato è sconosciuto. Verrà utilizzato il tema predefinito.',
        invalidTypeArray: 'Atteso un valore di tipo array.',
        invalidTypeBoolean: 'Atteso un valore di tipo booleano.',
        invalidTypeNumber: 'Atteso un valore di tipo numero.',
        invalidTypeObject: 'Atteso un valore di tipo oggetto.',
        invalidTypeString: 'Atteso un valore di tipo stringa.',
        invalidUnionType: 'Il valore non corrisponde a nessuno dei tipi consentiti.',
        missingActionKey: 'Manca una chiave obbligatoria nell\'oggetto azione.',
        missingRequiredProperty: 'Proprietà obbligatoria mancante.'
      }
    },
    editor: {
      title: {
        content: 'Contenuto',
        interaction: 'Interazioni',
        theme: 'Aspetto e funzionalità'
      },
      field: {
        attribute: 'Attributo',
        badge_color: 'Colore del badge',
        badge_icon: 'Icona del badge',
        bar_color: 'Colore della barra',
        bar_effect_jinja: 'Effetto sulla barra (modalità Jinja)',
        bar_orientation: 'Orientamento della barra',
        bar_position: 'Posizione della barra',
        bar_single_line: 'Info su una riga (overlay)',
        bar_size: 'Dimensione della barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modalità colore barra',
        bar_scale: 'Scala della barra',
        center_zero: 'Zero al centro',
        center_zero_value: 'Valore centrale',
        center_zero_growth_percent: 'Percentuale di crescita',
        color: 'Colore dell\'icona',
        decimal: 'Decimale',
        double_tap_action: 'Azione al doppio tocco',
        entity: 'Entità',
        force_circular_background: 'Forza sfondo circolare',
        hide_jinja: 'Nascondi (modalità Jinja)',
        hold_action: 'Azione al tocco prolungato',
        icon: 'Icona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Azione al doppio tocco dell\'icona',
        icon_hold_action: 'Azione al tocco prolungato dell\'icona',
        icon_tap_action: 'Azione al tocco dell\'icona',
        layout: 'Layout del contenuto',
        max_value: 'Valore massimo',
        min_value: 'Valore minimo',
        name: 'Nome',
        percent: 'Percentuale',
        reverse_secondary_info_row: 'Scambia barra e testo',
        secondary: 'Informazione secondaria',
        state_content: 'Contenuto dello stato',
        show_all_actions: 'Mostra tutte le azioni',
        tap_action: 'Azione al tocco breve',
        text_shadow: 'Aggiungi ombra al testo (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zone tema personalizzato',
        unit: 'Unità',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secondaria personalizzata',
        multiline: 'Multilinea',
        interpolate: 'Interpolazione colori',
        name_info: 'Info nome personalizzata',
        reverse: 'Timer inverso',
        bar_stack_mode: 'Modalità di impilamento',
        bar_stack: 'Entità aggiuntive',
        migrate_config: 'Migra configurazione'
      },
      option: {
        bar_orientation: {
          ltr: 'Da sinistra a destra',
          rtl: 'Da destra a sinistra',
          up: 'Verso l\'alto (overlay)'
        },
        bar_position: {
          below: 'Barra sotto il contenuto',
          bottom: 'Barra in basso (overlay)',
          default: 'Predefinito',
          overlay: 'Barra sovrapposta al contenuto (overlay)',
          top: 'Barra in alto (overlay)',
          background: 'Sfondo della scheda'
        },
        bar_size: {
          large: 'Grande',
          medium: 'Media',
          small: 'Piccola',
          xlarge: 'Extra grande'
        },
        layout: {
          horizontal: 'Orizzontale (predefinito)',
          vertical: 'Verticale'
        },
        theme: {
          humidity: 'Umidità',
          light: 'Luce',
          optimal_when_high: 'Ottimale quando è alto (Batteria...)',
          optimal_when_low: 'Ottimale quando è basso (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatico',
          segment: 'Segmenti',
          rainbow: 'Arcobaleno'
        },
        bar_scale: {
          linear: 'Lineare',
          log: 'Logaritmica'
        },
        bar_effect: {
          radius: 'Angoli arrotondati',
          glass: 'Vetro',
          gradient: 'Sfumatura',
          gradient_reverse: 'Sfumatura inversa',
          shimmer: 'Riflesso',
          shimmer_reverse: 'Riflesso inverso'
        },
        hide: {
          icon: 'Icona',
          name: 'Nome',
          value: 'Valore',
          unit: 'Unità',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Soglia bassa',
          high: 'Soglia alta',
          type: 'Tipo',
          opacity: 'Opacità',
          low_color: 'Colore soglia bassa',
          high_color: 'Colore soglia alta',
          low_as: 'Unità (soglia bassa)',
          high_as: 'Unità (soglia alta)',
          line_size: 'Spessore linea',
          disable_low: 'Disattiva soglia bassa',
          disable_high: 'Disattiva soglia alta',
          low_attribute: 'Attributo',
          high_attribute: 'Attributo'
        },
        icon_animation: {
          none: 'Nessuna',
          spin: 'Rotazione',
          pulse: 'Pulsazione',
          bounce: 'Rimbalzo',
          shake: 'Vibrazione',
          ping: 'Ping',
          reveal: 'Comparsa',
          washing_machine: 'Lavatrice',
          battery_charging: 'Batteria in carica'
        },
        alert_when: {
          above: 'Allerta sopra',
          below: 'Allerta sotto',
          color: 'Colore allerta',
          highlight: 'Evidenziazione',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Bordo',
          background: 'Sfondo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        max_value_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        watermark_low_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        watermark_high_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        theme_mode: {
          preset: 'Predefinito',
          custom: 'Personalizzato'
        },
        min_value: {
          attribute: 'Attributo'
        },
        max_value: {
          attribute: 'Attributo'
        },
        bar_stack_mode: {
          stacked: 'Impilato',
          proportional: 'Proporzionale',
          net: 'Netto'
        }
      }
    }
  },
  ja: {
    card: {
      msg: {
        appliedDefaultValue: 'デフォルト値が自動的に適用されました。',
        attributeNotFound: 'Home Assistant に属性が見つかりません。',
        entityNotFound: 'Home Assistant にエンティティが見つかりません。',
        invalidActionObject: 'アクションオブジェクトが無効または構造が不正です。',
        invalidDecimal: '値は有効な小数である必要があります。',
        invalidEntityId: 'エンティティ ID が無効か、形式が正しくありません。',
        invalidEnumValue: '指定された値は許可されたオプションのいずれでもありません。',
        invalidStateContent: '状態の内容が無効または形式が不正です。',
        invalidStateContentEntry: '状態の内容の1つ以上のエントリが無効です。',
        invalidTheme: '指定されたテーマは不明です。デフォルトのテーマが使用されます。',
        invalidTypeArray: '配列型の値が必要です。',
        invalidTypeBoolean: 'ブール型の値が必要です。',
        invalidTypeNumber: '数値型の値が必要です。',
        invalidTypeObject: 'オブジェクト型の値が必要です。',
        invalidTypeString: '文字列型の値が必要です。',
        invalidUnionType: '値が許可された型のいずれにも一致しません。',
        missingActionKey: 'アクションオブジェクトに必要なキーが欠落しています。',
        missingRequiredProperty: '必要なプロパティが欠落しています。'
      }
    },
    editor: {
      title: {
        content: 'コンテンツ',
        interaction: 'インタラクション',
        theme: '外観'
      },
      field: {
        attribute: '属性',
        badge_color: 'バッジの色',
        badge_icon: 'バッジのアイコン',
        bar_color: 'バーの色',
        bar_effect_jinja: 'バーのエフェクト (Jinjaモード)',
        bar_orientation: 'バーの向き',
        bar_position: 'バーの位置',
        bar_single_line: '1行で情報を表示（オーバーレイ）',
        bar_size: 'バーサイズ',
        bar_segments: 'Bar segments',
        bar_color_mode: 'カラーモード',
        bar_scale: 'Bar scale',
        center_zero: 'ゼロを中央に',
        center_zero_value: '中心値',
        center_zero_growth_percent: '成長率',
        color: 'メインカラー',
        decimal: '小数点',
        double_tap_action: 'ダブルタップしたときの動作',
        entity: 'エンティティ',
        force_circular_background: '円形の背景を強制する',
        hide_jinja: '非表示 (Jinjaモード)',
        hold_action: '長押ししたときの動作',
        icon: 'アイコン',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'アイコンをダブルタップしたときの動作',
        icon_hold_action: 'アイコンを長押ししたときの動作',
        icon_tap_action: 'アイコンをタップしたときの動作',
        layout: 'コンテンツのレイアウト',
        max_value: '最大値',
        min_value: '最小値',
        name: '名前',
        percent: 'パーセント',
        reverse_secondary_info_row: 'バーとテキストを入れ替える',
        secondary: '補足情報',
        state_content: '状態の内容',
        show_all_actions: 'すべての操作を表示',
        tap_action: '短くタップしたときの動作',
        text_shadow: 'テキストに影を追加 (オーバーレイ)',
        theme_mode: 'Theme mode',
        theme: 'テーマ',
        custom_theme: 'Custom theme zones',
        unit: '単位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'カスタム補助情報',
        multiline: 'Multiline',
        interpolate: '色の補間',
        name_info: 'カスタム名前情報',
        reverse: 'タイマーを逆にする',
        bar_stack_mode: 'Stack mode',
        bar_stack: '追加エンティティ',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: '左から右',
          rtl: '右から左',
          up: '上方向（オーバーレイ）'
        },
        bar_position: {
          below: 'コンテンツの下にバー',
          bottom: '下部にバー（オーバーレイ）',
          default: 'デフォルト',
          overlay: 'コンテンツに重ねてバー（オーバーレイ）',
          top: '上部にバー（オーバーレイ）',
          background: 'カードの背景'
        },
        bar_size: {
          large: '大',
          medium: '中',
          small: '小',
          xlarge: '特大'
        },
        layout: {
          horizontal: '水平（デフォルト）',
          vertical: '垂直'
        },
        theme: {
          humidity: '湿度',
          light: '明るさ',
          optimal_when_high: '高い時が最適（バッテリーなど）',
          optimal_when_low: '低い時が最適（CPU、RAMなど）',
          pm25: 'PM2.5',
          temperature: '温度',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: '自動',
          segment: 'セグメント',
          rainbow: 'レインボー'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '角丸',
          glass: 'ガラス',
          gradient: 'グラデーション',
          gradient_reverse: '逆グラデーション',
          shimmer: 'シマー',
          shimmer_reverse: '逆シマー'
        },
        hide: {
          icon: 'アイコン',
          name: '名前',
          value: '値',
          unit: '単位',
          secondary_info: '補足情報',
          progress_bar: 'バー'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ko: {
    card: {
      msg: {
        appliedDefaultValue: '기본값이 자동으로 적용되었습니다.',
        attributeNotFound: 'Home Assistant에서 속성을 찾을 수 없습니다.',
        entityNotFound: 'Home Assistant에서 엔티티를 찾을 수 없습니다.',
        invalidActionObject: '액션 객체가 잘못되었거나 구조가 올바르지 않습니다.',
        invalidDecimal: '값은 유효한 소수여야 합니다.',
        invalidEntityId: '엔티티 ID가 잘못되었거나 형식이 잘못되었습니다.',
        invalidEnumValue: '제공된 값이 허용된 옵션 중 하나가 아닙니다.',
        invalidStateContent: '상태 콘텐츠가 잘못되었거나 형식이 잘못되었습니다.',
        invalidStateContentEntry: '상태 콘텐츠에 하나 이상의 잘못된 항목이 있습니다.',
        invalidTheme: '지정된 테마를 알 수 없습니다. 기본 테마가 사용됩니다.',
        invalidTypeArray: '배열 유형의 값이 필요합니다.',
        invalidTypeBoolean: '불리언 유형의 값이 필요합니다.',
        invalidTypeNumber: '숫자 유형의 값이 필요합니다.',
        invalidTypeObject: '객체 유형의 값이 필요합니다.',
        invalidTypeString: '문자열 유형의 값이 필요합니다.',
        invalidUnionType: '값이 허용된 유형 중 어떤 것과도 일치하지 않습니다.',
        missingActionKey: '액션 객체에 필수 키가 없습니다.',
        missingRequiredProperty: '필수 속성이 누락되었습니다.'
      }
    },
    editor: {
      title: {
        content: '콘텐츠',
        interaction: '상호작용',
        theme: '테마 및 스타일'
      },
      field: {
        attribute: '속성',
        badge_color: '배지 색상',
        badge_icon: '배지 아이콘',
        bar_color: '바 색상',
        bar_effect_jinja: '바 효과 (Jinja 모드)',
        bar_orientation: '바 방향',
        bar_position: '바 위치',
        bar_single_line: '한 줄로 정보 표시 (오버레이)',
        bar_size: '바 크기',
        bar_segments: 'Bar segments',
        bar_color_mode: '색상 모드',
        bar_scale: 'Bar scale',
        center_zero: '중앙에 영점',
        center_zero_value: '중앙값',
        center_zero_growth_percent: '성장률',
        color: '기본 색상',
        decimal: '소수점',
        double_tap_action: '더블 탭 시 동작',
        entity: '엔티티',
        force_circular_background: '원형 배경 강제 적용',
        hide_jinja: '숨기기 (Jinja 모드)',
        hold_action: '길게 누를 시 동작',
        icon: '아이콘',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '아이콘 더블 탭 시 동작',
        icon_hold_action: '아이콘 길게 누를 시 동작',
        icon_tap_action: '아이콘 탭 시 동작',
        layout: '콘텐츠 레이아웃',
        max_value: '최대값',
        min_value: '최소값',
        name: '이름',
        percent: '퍼센트',
        reverse_secondary_info_row: '막대와 텍스트 교체',
        secondary: '보조 정보',
        state_content: '상태 콘텐츠',
        show_all_actions: '모든 액션 표시',
        tap_action: '짧게 탭 시 동작',
        text_shadow: '텍스트 그림자 추가 (오버레이)',
        theme_mode: 'Theme mode',
        theme: '테마',
        custom_theme: 'Custom theme zones',
        unit: '단위',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '사용자 정의 보조 정보',
        multiline: 'Multiline',
        interpolate: '색상 보간',
        name_info: '사용자 정의 이름 정보',
        reverse: '타이머 역방향',
        bar_stack_mode: 'Stack mode',
        bar_stack: '추가 엔티티',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: '왼쪽에서 오른쪽',
          rtl: '오른쪽에서 왼쪽',
          up: '위쪽 방향 (오버레이)'
        },
        bar_position: {
          below: '콘텐츠 아래 바',
          bottom: '하단 바 (오버레이)',
          default: '기본',
          overlay: '콘텐츠 위에 바 (오버레이)',
          top: '상단 바 (오버레이)',
          background: '카드 배경'
        },
        bar_size: {
          large: '큰',
          medium: '중간',
          small: '작은',
          xlarge: '매우 큰'
        },
        layout: {
          horizontal: '수평 (기본)',
          vertical: '수직'
        },
        theme: {
          humidity: '습도',
          light: '조도',
          optimal_when_high: '높을 때 최적 (배터리 등)',
          optimal_when_low: '낮을 때 최적 (CPU, RAM 등)',
          pm25: 'PM2.5',
          temperature: '온도',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: '자동',
          segment: '세그먼트',
          rainbow: '무지개'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '둥근 모서리',
          glass: '유리',
          gradient: '그라디언트',
          gradient_reverse: '역 그라디언트',
          shimmer: '시머',
          shimmer_reverse: '역 시머'
        },
        hide: {
          icon: '아이콘',
          name: '이름',
          value: '값',
          unit: '단위',
          secondary_info: '부가 정보',
          progress_bar: '바'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  lt: {
    card: {
      msg: {
        appliedDefaultValue: 'Numatytoji reikšmė buvo automatiškai pritaikyta.',
        attributeNotFound: 'Atributas nerastas Home Assistant.',
        entityNotFound: 'Entity nerasta Home Assistant.',
        invalidActionObject: 'Veiksmo objektas negalioja arba neteisingai suformuotas.',
        invalidDecimal: 'Reikšmė turi būti teigiamas sveikasis skaičius.',
        invalidEntityId: 'Entity ID negalioja arba neteisingas.',
        invalidEnumValue: 'Pateikta reikšmė nėra tarp leidžiamų parinkčių.',
        invalidStateContent: 'Būsenos turinys negalioja arba neteisingai suformuotas.',
        invalidStateContentEntry: 'Viena ar daugiau būsenos turinio įrašų negalioja.',
        invalidTheme: 'Nurodyta tema nežinoma. Bus naudojama numatytoji tema.',
        invalidTypeArray: 'Tikėtasi masyvo tipo reikšmės.',
        invalidTypeBoolean: 'Tikėtasi loginės reikšmės (boolean).',
        invalidTypeNumber: 'Tikėtasi skaičiaus tipo reikšmės.',
        invalidTypeObject: 'Tikėtasi objekto tipo reikšmės.',
        invalidTypeString: 'Tikėtasi eilutės tipo reikšmės.',
        invalidUnionType: 'Reikšmė neatitinka nė vieno leidžiamo tipo.',
        missingActionKey: 'Trūksta privalomo rakto veiksmo objekte.',
        missingRequiredProperty: 'Trūksta privalomos savybės.'
      }
    },
    editor: {
      title: {
        content: 'Turinys',
        interaction: 'Sąveikos',
        theme: 'Išvaizda ir naudojamumas'
      },
      field: {
        attribute: 'Atributas',
        badge_color: 'Ženklelio spalva',
        badge_icon: 'Ženklelio ikona',
        bar_color: 'Juostos spalva',
        bar_effect_jinja: 'Juostos efektas (Jinja režimas)',
        bar_orientation: 'Juostos orientacija',
        bar_position: 'Juostos pozicija',
        bar_single_line: 'Informacija vienoje eilutėje (overlay)',
        bar_size: 'Juostos dydis',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Spalvos režimas',
        bar_scale: 'Bar scale',
        center_zero: 'Nulis centre',
        center_zero_value: 'Centro reikšmė',
        center_zero_growth_percent: 'Augimo procentas',
        color: 'Ikonos spalva',
        decimal: 'Dešimtainė',
        double_tap_action: 'Dviejų bakstelėjimų veiksmas',
        entity: 'Entity',
        force_circular_background: 'Priversti apvalų foną',
        hide_jinja: 'Slėpti (Jinja režimas)',
        hold_action: 'Ilgo paspaudimo veiksmas',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikonos dviejų bakstelėjimų veiksmas',
        icon_hold_action: 'Ikonos ilgo paspaudimo veiksmas',
        icon_tap_action: 'Ikonos bakstelėjimo veiksmas',
        layout: 'Turinio išdėstymas',
        max_value: 'Maksimali reikšmė',
        min_value: 'Minimali reikšmė',
        name: 'Pavadinimas',
        percent: 'Procentai',
        reverse_secondary_info_row: 'Sukeisti juostą ir tekstą',
        secondary: 'Papildoma informacija',
        state_content: 'Būsenos turinys',
        show_all_actions: 'Rodyti visus veiksmus',
        tap_action: 'Bakstelėjimo veiksmas',
        text_shadow: 'Pridėti teksto šešėlį (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Vienetas',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Pasirinktinė papildoma informacija',
        multiline: 'Multiline',
        interpolate: 'Spalvų interpoliavimas',
        name_info: 'Pasirinktinė pavadinimo informacija',
        reverse: 'Atvirkštinis laikmatis',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Papildomos esybės',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimalu esant žemoms reikšmėms (CPU, RAM...)',
          optimal_when_high: 'Optimalu esant aukštoms reikšmėms (Baterija...)',
          light: 'Šviesi',
          temperature: 'Temperatūra',
          humidity: 'Drėgmė',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Maža',
          medium: 'Vidutinė',
          large: 'Didelė',
          xlarge: 'Labai didelė'
        },
        bar_orientation: {
          ltr: 'Iš kairės į dešinę',
          rtl: 'Iš dešinės į kairę',
          up: 'Į viršų (overlay)'
        },
        bar_position: {
          default: 'Numatyta',
          below: 'Juosta po turiniu',
          top: 'Juosta viršuje (overlay)',
          bottom: 'Juosta apačioje (overlay)',
          overlay: 'Juosta ant turinio (overlay)',
          background: 'Kortelės fonas'
        },
        layout: {
          horizontal: 'Horizontalus (numatyta)',
          vertical: 'Vertikalus'
        },
        bar_color_mode: {
          auto: 'Automatinis',
          segment: 'Segmentai',
          rainbow: 'Vaivorykštė'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Suapvalinti kampai',
          glass: 'Stiklas',
          gradient: 'Gradientas',
          gradient_reverse: 'Apverstas gradientas',
          shimmer: 'Blizgesys',
          shimmer_reverse: 'Apverstas blizgesys'
        },
        hide: {
          icon: 'Piktograma',
          name: 'Pavadinimas',
          value: 'Reikšmė',
          unit: 'Vienetas',
          secondary_info: 'Info',
          progress_bar: 'Juosta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  lv: {
    card: {
      msg: {
        appliedDefaultValue: 'Noklusējuma vērtība tika automātiski piemērota.',
        attributeNotFound: 'Atribūts nav atrasts Home Assistant.',
        entityNotFound: 'Vienība nav atrasta Home Assistant.',
        invalidActionObject: 'Darbības objekts nav derīgs vai ir nepareizi strukturēts.',
        invalidDecimal: 'Vērtībai jābūt pozitīvam veselajam skaitlim.',
        invalidEntityId: 'Vienības ID nav derīgs vai ir nepareizs.',
        invalidEnumValue: 'Ievadītā vērtība nav atļauto opciju sarakstā.',
        invalidStateContent: 'Stāvokļa saturs nav derīgs vai ir nepareizi strukturēts.',
        invalidStateContentEntry: 'Viena vai vairākas stāvokļa satura ievades nav derīgas.',
        invalidTheme: 'Norādītā tēma nav zināma. Tiks izmantota noklusējuma tēma.',
        invalidTypeArray: 'Tika gaidīta masīva tipa vērtība.',
        invalidTypeBoolean: 'Tika gaidīta loģiska (boolean) vērtība.',
        invalidTypeNumber: 'Tika gaidīta skaitļa tipa vērtība.',
        invalidTypeObject: 'Tika gaidīta objekta tipa vērtība.',
        invalidTypeString: 'Tika gaidīta virknes tipa vērtība.',
        invalidUnionType: 'Vērtība neatbilst nevienam atļautajam tipam.',
        missingActionKey: 'Trūkst obligātā atslēga darbības objektā.',
        missingRequiredProperty: 'Trūkst obligātā īpašība.'
      }
    },
    editor: {
      title: {
        content: 'Saturs',
        interaction: 'Saskarsme',
        theme: 'Izskats un lietojamība'
      },
      field: {
        attribute: 'Atribūts',
        badge_color: 'Žetona krāsa',
        badge_icon: 'Žetona ikona',
        bar_color: 'Joslas krāsa',
        bar_effect_jinja: 'Joslas efekts (Jinja režīms)',
        bar_orientation: 'Joslas orientācija',
        bar_position: 'Joslas pozīcija',
        bar_single_line: 'Informācija vienā rindā (overlay)',
        bar_size: 'Joslas izmērs',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Krāsas režīms',
        bar_scale: 'Bar scale',
        center_zero: 'Nulles centrā',
        center_zero_value: 'Centra vērtība',
        center_zero_growth_percent: 'Pieauguma procents',
        color: 'Ikonas krāsa',
        decimal: 'Decimāldaļa',
        double_tap_action: 'Divreiz pieskaroties',
        entity: 'Vienība',
        force_circular_background: 'Piespiest apļu fonu',
        hide_jinja: 'Slēpt (Jinja režīms)',
        hold_action: 'Ilgs pieskāriens',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikonas dubults pieskāriens',
        icon_hold_action: 'Ikonas ilgs pieskāriens',
        icon_tap_action: 'Ikonas pieskāriens',
        layout: 'Satura izkārtojums',
        max_value: 'Maksimālā vērtība',
        min_value: 'Minimālā vērtība',
        name: 'Nosaukums',
        percent: 'Procenti',
        reverse_secondary_info_row: 'Mainīt joslu un tekstu',
        secondary: 'Papildu informācija',
        state_content: 'Stāvokļa saturs',
        show_all_actions: 'Rādīt visas darbības',
        tap_action: 'Pieskāriens',
        text_shadow: 'Pievienot teksta ēnu (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tēma',
        custom_theme: 'Custom theme zones',
        unit: 'Vienība',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Pielāgota sekundārā informācija',
        multiline: 'Multiline',
        interpolate: 'Krāsu interpolācija',
        name_info: 'Pielāgota nosaukuma informācija',
        reverse: 'Apgriezts taimeris',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Papildu entītijas',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimāli pie zemām vērtībām (CPU, RAM...)',
          optimal_when_high: 'Optimāli pie augstām vērtībām (Akumulators...)',
          light: 'Gaiša',
          temperature: 'Temperatūra',
          humidity: 'Mitrums',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Mazs',
          medium: 'Vidējs',
          large: 'Liels',
          xlarge: 'Ļoti liels'
        },
        bar_orientation: {
          ltr: 'No kreisās uz labo',
          rtl: 'No labās uz kreiso',
          up: 'Uz augšu (overlay)'
        },
        bar_position: {
          default: 'Noklusētais',
          below: 'Josla zem satura',
          top: 'Josla augšā (overlay)',
          bottom: 'Josla apakšā (overlay)',
          overlay: 'Josla virs satura (overlay)',
          background: 'Kartes fons'
        },
        layout: {
          horizontal: 'Horizontāls (noklusēts)',
          vertical: 'Vertikāls'
        },
        bar_color_mode: {
          auto: 'Automātisks',
          segment: 'Segmenti',
          rainbow: 'Varavīksne'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Noapaļoti stūri',
          glass: 'Stikls',
          gradient: 'Gradients',
          gradient_reverse: 'Apgriezts gradients',
          shimmer: 'Mirdzums',
          shimmer_reverse: 'Apgriezts mirdzums'
        },
        hide: {
          icon: 'Ikona',
          name: 'Nosaukums',
          value: 'Vērtība',
          unit: 'Vienība',
          secondary_info: 'Info',
          progress_bar: 'Josla'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  mk: {
    card: {
      msg: {
        appliedDefaultValue: 'Автоматски е применета стандардна вредност.',
        attributeNotFound: 'Атрибутот не е пронајден во Home Assistant.',
        entityNotFound: 'Ентитетот не е пронајден во Home Assistant.',
        invalidActionObject: 'Објектот за акција е невалиден или неправилно структуриран.',
        invalidDecimal: 'Вредноста мора да биде валиден децимален број.',
        invalidEntityId: 'ID-то на ентитетот е невалидно или лошо форматирано.',
        invalidEnumValue: 'Дадената вредност не е дозволена опција.',
        invalidStateContent: 'Состојбата е невалидна или лошо форматирана.',
        invalidStateContentEntry: 'Еден или повеќе елементи во состојбата се невалидни.',
        invalidTheme: 'Темата е непозната. Ќе се користи стандардна тема.',
        invalidTypeArray: 'Се очекуваше вредност од тип низа.',
        invalidTypeBoolean: 'Се очекуваше вредност од тип boolean.',
        invalidTypeNumber: 'Се очекуваше вредност од тип број.',
        invalidTypeObject: 'Се очекуваше вредност од тип објект.',
        invalidTypeString: 'Се очекуваше вредност од тип string.',
        invalidUnionType: 'Вредноста не одговара на дозволените типови.',
        missingActionKey: 'Недостасува потребен клуч во објектот за акција.',
        missingRequiredProperty: 'Недостасува потребно својство.'
      }
    },
    editor: {
      title: {
        content: 'Содржина',
        interaction: 'Интеракции',
        theme: 'Изглед и функционалност'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Боја на значка',
        badge_icon: 'Икона на значка',
        bar_color: 'Боја за лентата',
        bar_effect_jinja: 'Ефект на лентата (Jinja режим)',
        bar_orientation: 'Ориентација на лентата',
        bar_position: 'Позиција на лентата',
        bar_single_line: 'Инфо во еден ред (overlay)',
        bar_size: 'Големина на лента',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим на боја',
        bar_scale: 'Bar scale',
        center_zero: 'Нула во центарот',
        center_zero_value: 'Централна вредност',
        center_zero_growth_percent: 'Процент на растеж',
        color: 'Примарна боја',
        decimal: 'децемален',
        double_tap_action: 'Дејство при двоен допир',
        entity: 'Ентитет',
        force_circular_background: 'Принуди кружна позадина',
        hide_jinja: 'Сокриј (Jinja режим)',
        hold_action: 'Дејство при долг допир',
        icon: 'Икона',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Дејство при двоен допир на иконата',
        icon_hold_action: 'Дејство при долг допир на иконата',
        icon_tap_action: 'Дејство при допир на иконата',
        layout: 'Распоред на содржината',
        max_value: 'Максимална вредност',
        min_value: 'Минимална вредност',
        name: 'Име',
        percent: 'Процент',
        reverse_secondary_info_row: 'Сменете ги лентата и текстот',
        secondary: 'Секундарни информации',
        state_content: 'Содржина на состојба',
        show_all_actions: 'Прикажи ги сите дејства',
        tap_action: 'Дејство при краток допир',
        text_shadow: 'Додај сенка на текст (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Јединство',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Прилагодена секундарна информација',
        multiline: 'Multiline',
        interpolate: 'Интерполација на бои',
        name_info: 'Прилагодена информација за имиња',
        reverse: 'Обратен тајмер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Дополнителни ентитети',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Лево кон десно',
          rtl: 'Десно кон лево',
          up: 'Нагоре (overlay)'
        },
        bar_position: {
          below: 'Лента под содржината',
          bottom: 'Лента на дното (overlay)',
          default: 'Стандардно',
          overlay: 'Лента преку содржината (overlay)',
          top: 'Лента на врвот (overlay)',
          background: 'Позадина на картичката'
        },
        bar_size: {
          large: 'Голема',
          medium: 'Средна',
          small: 'Мала',
          xlarge: 'Многу голема'
        },
        layout: {
          horizontal: 'Хоризонтално (стандардно)',
          vertical: 'Вертикално'
        },
        theme: {
          humidity: 'Влажност',
          light: 'Светлина',
          optimal_when_high: 'Оптимално кога е високо (Батерија...)',
          optimal_when_low: 'Оптимално кога е ниско(CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Автоматски',
          segment: 'Сегменти',
          rainbow: 'Виножито'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Заоблени агли',
          glass: 'Стакло',
          gradient: 'Градиент',
          gradient_reverse: 'Обратен градиент',
          shimmer: 'Сјај',
          shimmer_reverse: 'Обратен сјај'
        },
        hide: {
          icon: 'Икона',
          name: 'Име',
          value: 'Вредност',
          unit: 'Единица',
          secondary_info: 'Инфо',
          progress_bar: 'Лента'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  nb: {
    card: {
      msg: {
        appliedDefaultValue: 'En standardverdi har blitt brukt automatisk.',
        attributeNotFound: 'Attributtet ble ikke funnet i Home Assistant.',
        entityNotFound: 'Enheten ble ikke funnet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldig eller feil strukturert.',
        invalidDecimal: 'Verdien må være et gyldig desimaltall.',
        invalidEntityId: 'Enhets-ID er ugyldig eller feil formatert.',
        invalidEnumValue: 'Den oppgitte verdien er ikke en gyldig mulighet.',
        invalidStateContent: 'Tilstandsinnholdet er ugyldig eller feil formatert.',
        invalidStateContentEntry: 'En eller flere oppføringer i tilstandsinnholdet er ugyldige.',
        invalidTheme: 'Angitt tema er ukjent. Standardtema vil bli brukt.',
        invalidTypeArray: 'Forventet en verdi av typen array.',
        invalidTypeBoolean: 'Forventet en boolsk verdi.',
        invalidTypeNumber: 'Forventet en numerisk verdi.',
        invalidTypeObject: 'Forventet en verdi av typen objekt.',
        invalidTypeString: 'Forventet en verdi av typen string.',
        invalidUnionType: 'Verdien samsvarer ikke med noen av de tillatte typene.',
        missingActionKey: 'En påkrevd nøkkel mangler i handlingsobjektet.',
        missingRequiredProperty: 'En påkrevd egenskap mangler.'
      }
    },
    editor: {
      title: {
        content: 'Innhold',
        interaction: 'Interaksjoner',
        theme: 'Utseende og funksjonalitet'
      },
      field: {
        attribute: 'Attributt',
        badge_color: 'Farge på merke',
        badge_icon: 'Ikon for merke',
        bar_color: 'Farge for baren',
        bar_effect_jinja: 'Effekt på baren (Jinja-modus)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Posisjon for baren',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Fargemodus',
        bar_scale: 'Bar scale',
        center_zero: 'Null i midten',
        center_zero_value: 'Senterverdi',
        center_zero_growth_percent: 'Vekstprosent',
        color: 'Primærfarge',
        decimal: 'desimal',
        double_tap_action: 'Handling ved dobbelt trykk',
        entity: 'Enhet',
        force_circular_background: 'Tving sirkulær bakgrunn',
        hide_jinja: 'Skjul (Jinja-modus)',
        hold_action: 'Handling ved langt trykk',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Handling ved dobbelt trykk på ikonet',
        icon_hold_action: 'Handling ved langt trykk på ikonet',
        icon_tap_action: 'Handling ved trykk på ikonet',
        layout: 'Innholdslayout',
        max_value: 'Maksimal verdi',
        min_value: 'Minste verdi',
        name: 'Navn',
        percent: 'Prosent',
        reverse_secondary_info_row: 'Bytt linje og tekst',
        secondary: 'Sekundær informasjon',
        state_content: 'Innhold i tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort trykk',
        text_shadow: 'Legg til tekstskygge (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhet',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Egendefinert sekundær info',
        multiline: 'Multiline',
        interpolate: 'Interpoler farger',
        name_info: 'Egendefinert navneinfo',
        reverse: 'Omvendt tidtaker',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ekstra enheter',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Venstre til høyre',
          rtl: 'Høyre til venstre',
          up: 'Oppover (overlay)'
        },
        bar_position: {
          below: 'Bar under innholdet',
          bottom: 'Bar nederst (overlay)',
          default: 'Standard',
          overlay: 'Bar lagt over innholdet (overlay)',
          top: 'Bar øverst (overlay)',
          background: 'Kortbakgrunn'
        },
        bar_size: {
          large: 'Stor',
          medium: 'Medium',
          small: 'Liten',
          xlarge: 'Ekstra stor'
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Fuktighet',
          light: 'Lys',
          optimal_when_high: 'Optimal når høyt (Batteri...)',
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Avrundede hjørner',
          glass: 'Glass',
          gradient: 'Gradient',
          gradient_reverse: 'Omvendt gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvendt glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Navn',
          value: 'Verdi',
          unit: 'Enhet',
          secondary_info: 'Info',
          progress_bar: 'Stolpe'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  nl: {
    card: {
      msg: {
        appliedDefaultValue: 'Een standaardwaarde is automatisch toegepast.',
        attributeNotFound: 'Attribuut niet gevonden in Home Assistant.',
        entityNotFound: 'Entiteit niet gevonden in Home Assistant.',
        invalidActionObject: 'Het actieobject is ongeldig of onjuist gestructureerd.',
        invalidDecimal: 'De waarde moet een geldig decimaal getal zijn.',
        invalidEntityId: 'De entity ID is ongeldig of foutief geformatteerd.',
        invalidEnumValue: 'De opgegeven waarde is geen geldige optie.',
        invalidStateContent: 'De statusinhoud is ongeldig of foutief.',
        invalidStateContentEntry: 'Een of meer onderdelen van de statusinhoud zijn ongeldig.',
        invalidTheme: 'Het opgegeven thema is onbekend. Het standaardthema wordt gebruikt.',
        invalidTypeArray: 'Verwachte waarde van het type array.',
        invalidTypeBoolean: 'Verwachte waarde van het type boolean.',
        invalidTypeNumber: 'Verwachte waarde van het type nummer.',
        invalidTypeObject: 'Verwachte waarde van het type object.',
        invalidTypeString: 'Verwachte waarde van het type string.',
        invalidUnionType: 'De waarde komt niet overeen met toegestane types.',
        missingActionKey: 'Er ontbreekt een verplichte sleutel in het actieobject.',
        missingRequiredProperty: 'Vereiste eigenschap ontbreekt.'
      }
    },
    editor: {
      title: {
        content: 'Inhoud',
        interaction: 'Interactie',
        theme: 'Uiterlijk en gebruiksgemak'
      },
      field: {
        attribute: 'Attribuut',
        badge_color: 'Kleur van badge',
        badge_icon: 'Pictogram van badge',
        bar_color: 'Kleur van de balk',
        bar_effect_jinja: 'Effect op de balk (Jinja-modus)',
        bar_orientation: 'Oriëntatie van de balk',
        bar_position: 'Positie van de balk',
        bar_single_line: 'Info op één regel (overlay)',
        bar_size: 'Balkgrootte',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Balkkleurmodus',
        bar_scale: 'Balkschaal',
        center_zero: 'Nul in het midden',
        center_zero_value: 'Centrumwaarde',
        center_zero_growth_percent: 'Groeipercentage',
        color: 'Kleur van het pictogram',
        decimal: 'decimaal',
        double_tap_action: 'Actie bij dubbel tikken',
        entity: 'Entiteit',
        force_circular_background: 'Geforceerde cirkelvormige achtergrond',
        hide_jinja: 'Verbergen (Jinja-modus)',
        hold_action: 'Actie bij lang ingedrukt houden',
        icon: 'Pictogram',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Actie bij dubbel tikken op pictogram',
        icon_hold_action: 'Actie bij lang ingedrukt houden op pictogram',
        icon_tap_action: 'Actie bij tikken op pictogram',
        layout: 'Inhoudsindeling',
        max_value: 'Maximale waarde',
        min_value: 'Minimale waarde',
        name: 'Naam',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Balk en tekst omwisselen',
        secondary: 'Secundaire informatie',
        state_content: 'Inhoud van de status',
        show_all_actions: 'Toon alle acties',
        tap_action: 'Actie bij korte tik',
        text_shadow: 'Tekstschaduw toevoegen (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Thema',
        custom_theme: 'Aangepaste themazones',
        unit: 'Eenheid',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Aangepaste secundaire info',
        multiline: 'Meerdere regels',
        interpolate: 'Kleuren interpoleren',
        name_info: 'Aangepaste naaminfo',
        reverse: 'Timer omdraaien',
        bar_stack_mode: 'Stapelmodus',
        bar_stack: 'Extra entiteiten',
        migrate_config: 'Configuratie migreren'
      },
      option: {
        bar_orientation: {
          ltr: 'Links naar rechts',
          rtl: 'Rechts naar links',
          up: 'Omhoog (overlay)'
        },
        bar_position: {
          below: 'Balk onder de inhoud',
          bottom: 'Balk onderaan (overlay)',
          default: 'Standaard',
          overlay: 'Balk over de inhoud (overlay)',
          top: 'Balk bovenaan (overlay)',
          background: 'Kaartachtergrond'
        },
        bar_size: {
          large: 'Groot',
          medium: 'Middel',
          small: 'Klein',
          xlarge: 'Extra groot'
        },
        layout: {
          horizontal: 'Horizontaal (standaard)',
          vertical: 'Verticaal'
        },
        theme: {
          humidity: 'Vochtigheid',
          light: 'Licht',
          optimal_when_high: 'Optimaal wanneer hoog (Batterij...)',
          optimal_when_low: 'Optimaal wanneer laag (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatuur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatisch',
          segment: 'Segmenten',
          rainbow: 'Regenboog'
        },
        bar_scale: {
          linear: 'Lineair',
          log: 'Logaritmisch'
        },
        bar_effect: {
          radius: 'Afgeronde hoeken',
          glass: 'Glas',
          gradient: 'Verloop',
          gradient_reverse: 'Omgekeerd verloop',
          shimmer: 'Glinstering',
          shimmer_reverse: 'Omgekeerde glinstering'
        },
        hide: {
          icon: 'Pictogram',
          name: 'Naam',
          value: 'Waarde',
          unit: 'Eenheid',
          secondary_info: 'Info',
          progress_bar: 'Balk'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Lage waarde',
          high: 'Hoge waarde',
          type: 'Type',
          opacity: 'Dekking',
          low_color: 'Lage kleur',
          high_color: 'Hoge kleur',
          low_as: 'Eenheid (lage waarde)',
          high_as: 'Eenheid (hoge waarde)',
          line_size: 'Lijndikte',
          disable_low: 'Lage waarde uitschakelen',
          disable_high: 'Hoge waarde uitschakelen',
          low_attribute: 'Attribuut',
          high_attribute: 'Attribuut'
        },
        icon_animation: {
          none: 'Geen',
          spin: 'Draaien',
          pulse: 'Pulseren',
          bounce: 'Stuiteren',
          shake: 'Trillen',
          ping: 'Ping',
          reveal: 'Onthullen',
          washing_machine: 'Wasmachine',
          battery_charging: 'Batterij wordt opgeladen'
        },
        alert_when: {
          above: 'Alarm boven',
          below: 'Alarm onder',
          color: 'Alarmkleur',
          highlight: 'Markering',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Rand',
          background: 'Achtergrond'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        max_value_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        watermark_low_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        watermark_high_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        theme_mode: {
          preset: 'Voorinstelling',
          custom: 'Aangepast'
        },
        min_value: {
          attribute: 'Attribuut'
        },
        max_value: {
          attribute: 'Attribuut'
        },
        bar_stack_mode: {
          stacked: 'Gestapeld',
          proportional: 'Proportioneel',
          net: 'Netto'
        }
      }
    }
  },
  pl: {
    card: {
      msg: {
        appliedDefaultValue: 'Zastosowano domyślną wartość automatycznie.',
        attributeNotFound: 'Nie znaleziono atrybutu w Home Assistant.',
        entityNotFound: 'Nie znaleziono encji w Home Assistant.',
        invalidActionObject: 'Obiekt akcji jest nieprawidłowy lub ma złą strukturę.',
        invalidDecimal: 'Wartość musi być poprawną liczbą dziesiętną.',
        invalidEntityId: 'ID encji jest nieprawidłowe lub ma zły format.',
        invalidEnumValue: 'Podana wartość nie jest jedną z dozwolonych opcji.',
        invalidStateContent: 'Zawartość stanu jest nieprawidłowa lub uszkodzona.',
        invalidStateContentEntry: 'Jedna lub więcej pozycji zawartości stanu jest nieprawidłowa.',
        invalidTheme: 'Podany motyw jest nieznany. Zostanie użyty domyślny motyw.',
        invalidTypeArray: 'Oczekiwano wartości typu tablica.',
        invalidTypeBoolean: 'Oczekiwano wartości typu boolean.',
        invalidTypeNumber: 'Oczekiwano wartości typu liczba.',
        invalidTypeObject: 'Oczekiwano wartości typu obiekt.',
        invalidTypeString: 'Oczekiwano wartości typu string.',
        invalidUnionType: 'Wartość nie pasuje do żadnego z dozwolonych typów.',
        missingActionKey: 'W obiekcie akcji brakuje wymaganej właściwości.',
        missingRequiredProperty: 'Brakuje wymaganej właściwości.'
      }
    },
    editor: {
      title: {
        content: 'Zawartość',
        interaction: 'Interakcje',
        theme: 'Wygląd i funkcjonalność'
      },
      field: {
        attribute: 'Atrybut',
        badge_color: 'Kolor odznaki',
        badge_icon: 'Ikona odznaki',
        bar_color: 'Kolor paska',
        bar_effect_jinja: 'Efekt na pasku (tryb Jinja)',
        bar_orientation: 'Orientacja paska',
        bar_position: 'Pozycja paska',
        bar_single_line: 'Info w jednej linii (overlay)',
        bar_size: 'Rozmiar paska',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Tryb koloru',
        bar_scale: 'Bar scale',
        center_zero: 'Zero na środku',
        center_zero_value: 'Wartość środkowa',
        center_zero_growth_percent: 'Procent wzrostu',
        color: 'Kolor podstawowy',
        decimal: 'dziesiętny',
        double_tap_action: 'Akcja przy podwójnym naciśnięciu',
        entity: 'Encja',
        force_circular_background: 'Wymuś okrągłe tło',
        hide_jinja: 'Ukryj (tryb Jinja)',
        hold_action: 'Akcja przy długim naciśnięciu',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcja przy podwójnym naciśnięciu ikony',
        icon_hold_action: 'Akcja przy długim naciśnięciu ikony',
        icon_tap_action: 'Akcja przy naciśnięciu ikony',
        layout: 'Układ treści',
        max_value: 'Wartość maksymalna',
        min_value: 'Wartość minimalna',
        name: 'Nazwa',
        percent: 'Procent',
        reverse_secondary_info_row: 'Zamień pasek i tekst',
        secondary: 'Informacja dodatkowa',
        state_content: 'Zawartość stanu',
        show_all_actions: 'Pokaż wszystkie akcje',
        tap_action: 'Akcja przy krótkim naciśnięciu',
        text_shadow: 'Dodaj cień tekstu (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Motyw',
        custom_theme: 'Custom theme zones',
        unit: 'Jednostka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Niestandardowa info pomocnicza',
        multiline: 'Multiline',
        interpolate: 'Interpolacja kolorów',
        name_info: 'Niestandardowa info nazwy',
        reverse: 'Odwróć licznik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatkowe encje',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Od lewej do prawej',
          rtl: 'Od prawej do lewej',
          up: 'W górę (overlay)'
        },
        bar_position: {
          below: 'Pasek pod zawartością',
          bottom: 'Pasek na dole (overlay)',
          default: 'Domyślnie',
          overlay: 'Pasek nałożony na zawartość (overlay)',
          top: 'Pasek na górze (overlay)',
          background: 'Tło karty'
        },
        bar_size: {
          large: 'Duża',
          medium: 'Średnia',
          small: 'Mała',
          xlarge: 'Bardzo duża'
        },
        layout: {
          horizontal: 'Poziomo (domyślnie)',
          vertical: 'Pionowy'
        },
        theme: {
          humidity: 'Wilgotność',
          light: 'Światło',
          optimal_when_high: 'Optymalny, gdy wysokie (Bateria...)',
          optimal_when_low: 'Optymalny, gdy niskie (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatycznie',
          segment: 'Segmenty',
          rainbow: 'Tęcza'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaokrąglone rogi',
          glass: 'Szkło',
          gradient: 'Gradient',
          gradient_reverse: 'Odwrócony gradient',
          shimmer: 'Połysk',
          shimmer_reverse: 'Odwrócony połysk'
        },
        hide: {
          icon: 'Ikona',
          name: 'Nazwa',
          value: 'Wartość',
          unit: 'Jednostka',
          secondary_info: 'Info',
          progress_bar: 'Pasek'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'pt-BR': {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidDecimal: 'O valor deve ser um número inteiro positivo.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formado.',
        invalidEnumValue: 'O valor fornecido não faz parte das opções permitidas.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. O tema padrão será usado.',
        invalidTypeArray: 'Um valor do tipo array era esperado.',
        invalidTypeBoolean: 'Um valor do tipo booleano era esperado.',
        invalidTypeNumber: 'Um valor do tipo número era esperado.',
        invalidTypeObject: 'Um valor do tipo objeto era esperado.',
        invalidTypeString: 'Um valor do tipo string era esperado.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        missingActionKey: 'Uma chave obrigatória está ausente no objeto de ação.',
        missingRequiredProperty: 'Uma propriedade obrigatória está ausente.'
      }
    },
    editor: {
      title: {
        content: 'Conteúdo',
        interaction: 'Interações',
        theme: 'Aparência e usabilidade'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Cor do badge',
        badge_icon: 'Ícone do badge',
        bar_color: 'Cor da barra',
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Informações em uma linha (overlay)',
        bar_size: 'Tamanho da barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de cor',
        bar_scale: 'Bar scale',
        center_zero: 'Zero ao centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentual de crescimento',
        color: 'Cor do ícone',
        decimal: 'Decimal',
        double_tap_action: 'Ação ao tocar duas vezes',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao manter pressionado',
        icon: 'Ícone',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ação ao tocar duas vezes no ícone',
        icon_hold_action: 'Ação ao manter pressionado o ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Porcentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao tocar',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unidade',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informação secundária personalizada',
        multiline: 'Multiline',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entidades adicionais',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Ideal quando baixo (CPU, RAM...)',
          optimal_when_high: 'Ideal quando alto (Bateria...)',
          light: 'Claro',
          temperature: 'Temperatura',
          humidity: 'Umidade',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequena',
          medium: 'Média',
          large: 'Grande',
          xlarge: 'Muito grande'
        },
        bar_orientation: {
          ltr: 'Esquerda para direita',
          rtl: 'Direita para esquerda',
          up: 'Para cima (overlay)'
        },
        bar_position: {
          default: 'Padrão',
          below: 'Barra abaixo do conteúdo',
          top: 'Barra acima (overlay)',
          bottom: 'Barra abaixo (overlay)',
          overlay: 'Barra sobre o conteúdo (overlay)',
          background: 'Fundo do cartão'
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Cantos arredondados',
          glass: 'Vidro',
          gradient: 'Gradiente',
          gradient_reverse: 'Gradiente inverso',
          shimmer: 'Brilho',
          shimmer_reverse: 'Brilho inverso'
        },
        hide: {
          icon: 'Ícone',
          name: 'Nome',
          value: 'Valor',
          unit: 'Unidade',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  pt: {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidDecimal: 'O valor deve ser um número decimal válido.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formatado.',
        invalidEnumValue: 'O valor fornecido não é uma opção válida.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formatado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. Tema padrão será usado.',
        invalidTypeArray: 'Esperava-se um valor do tipo array.',
        invalidTypeBoolean: 'Esperava-se um valor do tipo booleano.',
        invalidTypeNumber: 'Esperava-se um valor do tipo número.',
        invalidTypeObject: 'Esperava-se um valor do tipo objeto.',
        invalidTypeString: 'Esperava-se um valor do tipo string.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        missingActionKey: 'Uma chave obrigatória está faltando no objeto de ação.',
        missingRequiredProperty: 'Propriedade obrigatória ausente.'
      }
    },
    editor: {
      title: {
        content: 'Conteúdo',
        interaction: 'Interações',
        theme: 'Aparência e usabilidade'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Cor do crachá',
        badge_icon: 'Ícone do crachá',
        bar_color: 'Cor da barra',
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Info numa só linha (overlay)',
        bar_size: 'Tamanho da barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de cor da barra',
        bar_scale: 'Escala da barra',
        center_zero: 'Zero no centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentagem de crescimento',
        color: 'Cor do ícone',
        decimal: 'decimal',
        double_tap_action: 'Ação ao toque duplo',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao toque longo',
        icon: 'Ícone',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ação ao tocar duplamente no ícone',
        icon_hold_action: 'Ação ao manter o toque no ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Percentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao toque curto',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zonas de tema personalizado',
        unit: 'Unidade',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informação secundária personalizada',
        multiline: 'Multilinha',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Modo de empilhamento',
        bar_stack: 'Entidades adicionais',
        migrate_config: 'Migrar configuração'
      },
      option: {
        bar_orientation: {
          ltr: 'Da esquerda para a direita',
          rtl: 'Da direita para a esquerda',
          up: 'Para cima (overlay)'
        },
        bar_position: {
          below: 'Barra abaixo do conteúdo',
          bottom: 'Barra em baixo (overlay)',
          default: 'Padrão',
          overlay: 'Barra sobreposta ao conteúdo (overlay)',
          top: 'Barra em cima (overlay)',
          background: 'Fundo do cartão'
        },
        bar_size: {
          large: 'Grande',
          medium: 'Média',
          small: 'Pequena',
          xlarge: 'Extra grande'
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical'
        },
        theme: {
          humidity: 'Humidade',
          light: 'Luz',
          optimal_when_high: 'Ótimo quando é alto (Bateria...)',
          optimal_when_low: 'Ótimo quando é baixo (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarítmica'
        },
        bar_effect: {
          radius: 'Cantos arredondados',
          glass: 'Vidro',
          gradient: 'Gradiente',
          gradient_reverse: 'Gradiente inverso',
          shimmer: 'Brilho',
          shimmer_reverse: 'Brilho inverso'
        },
        hide: {
          icon: 'Ícone',
          name: 'Nome',
          value: 'Valor',
          unit: 'Unidade',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Limite baixo',
          high: 'Limite alto',
          type: 'Tipo',
          opacity: 'Opacidade',
          low_color: 'Cor do limite baixo',
          high_color: 'Cor do limite alto',
          low_as: 'Unidade (limite baixo)',
          high_as: 'Unidade (limite alto)',
          line_size: 'Espessura da linha',
          disable_low: 'Desativar limite baixo',
          disable_high: 'Desativar limite alto',
          low_attribute: 'Atributo',
          high_attribute: 'Atributo'
        },
        icon_animation: {
          none: 'Nenhuma',
          spin: 'Girar',
          pulse: 'Pulsar',
          bounce: 'Saltar',
          shake: 'Vibração',
          ping: 'Ping',
          reveal: 'Revelar',
          washing_machine: 'Máquina de lavar',
          battery_charging: 'Bateria a carregar'
        },
        alert_when: {
          above: 'Alerta acima de',
          below: 'Alerta abaixo de',
          color: 'Cor do alerta',
          highlight: 'Destaque',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Borda',
          background: 'Fundo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        max_value_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        watermark_low_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        watermark_high_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        theme_mode: {
          preset: 'Predefinido',
          custom: 'Personalizado'
        },
        min_value: {
          attribute: 'Atributo'
        },
        max_value: {
          attribute: 'Atributo'
        },
        bar_stack_mode: {
          stacked: 'Empilhado',
          proportional: 'Proporcional',
          net: 'Líquido'
        }
      }
    }
  },
  ro: {
    card: {
      msg: {
        appliedDefaultValue: 'A fost aplicată automat o valoare implicită.',
        attributeNotFound: 'Atributul nu a fost găsit în Home Assistant.',
        entityNotFound: 'Entitatea nu a fost găsită în Home Assistant.',
        invalidActionObject: 'Obiectul acțiune este invalid sau structurat incorect.',
        invalidDecimal: 'Valoarea trebuie să fie un număr zecimal valid.',
        invalidEntityId: 'ID-ul entității este invalid sau formatat greșit.',
        invalidEnumValue: 'Valoarea furnizată nu este una dintre opțiunile permise.',
        invalidStateContent: 'Conținutul stării este invalid sau formatat greșit.',
        invalidStateContentEntry: 'Una sau mai multe intrări în conținutul stării sunt invalide.',
        invalidTheme: 'Tema specificată este necunoscută. Va fi utilizată tema implicită.',
        invalidTypeArray: 'Se aștepta o valoare de tip array.',
        invalidTypeBoolean: 'Se aștepta o valoare de tip boolean.',
        invalidTypeNumber: 'Se aștepta o valoare de tip număr.',
        invalidTypeObject: 'Se aștepta o valoare de tip obiect.',
        invalidTypeString: 'Se aștepta o valoare de tip șir.',
        invalidUnionType: 'Valoarea nu se potrivește niciunui tip permis.',
        missingActionKey: 'Lipsește o cheie necesară în obiectul acțiune.',
        missingRequiredProperty: 'Lipsește o proprietate necesară.'
      }
    },
    editor: {
      title: {
        content: 'Conținut',
        interaction: 'Interacțiuni',
        theme: 'Aspect & Stil'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Culoare insignă',
        badge_icon: 'Pictogramă insignă',
        bar_color: 'Culoare bară',
        bar_effect_jinja: 'Efect pe bară (mod Jinja)',
        bar_orientation: 'Orientarea barei',
        bar_position: 'Poziția barei',
        bar_single_line: 'Info pe un singur rând (overlay)',
        bar_size: 'Dimensiunea barei',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mod culoare',
        bar_scale: 'Bar scale',
        center_zero: 'Zero la centru',
        center_zero_value: 'Valoare centrală',
        center_zero_growth_percent: 'Procent de creștere',
        color: 'Culoare principală',
        decimal: 'zecimal',
        double_tap_action: 'Acțiune la apăsare dublă',
        entity: 'Entitate',
        force_circular_background: 'Forțează fundal circular',
        hide_jinja: 'Ascunde (mod Jinja)',
        hold_action: 'Acțiune la apăsare lungă',
        icon: 'Pictogramă',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acțiune la apăsare dublă a pictogramei',
        icon_hold_action: 'Acțiune la apăsare lungă a pictogramei',
        icon_tap_action: 'Acțiune la apăsarea pictogramei',
        layout: 'Aspect conținut',
        max_value: 'Valoare maximă',
        min_value: 'Valoare minimă',
        name: 'Nume',
        percent: 'Procent',
        reverse_secondary_info_row: 'Schimbați bara și textul',
        secondary: 'Informație secundară',
        state_content: 'Conținutul stării',
        show_all_actions: 'Afișează toate acțiunile',
        tap_action: 'Acțiune la apăsare scurtă',
        text_shadow: 'Adaugă umbră textului (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Temă',
        custom_theme: 'Custom theme zones',
        unit: 'Unitate',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundară personalizată',
        multiline: 'Multiline',
        interpolate: 'Interpolare culori',
        name_info: 'Info nume personalizată',
        reverse: 'Cronometru inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entități suplimentare',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'De la stânga la dreapta',
          rtl: 'De la dreapta la stânga',
          up: 'În sus (overlay)'
        },
        bar_position: {
          below: 'Bară sub conținut',
          bottom: 'Bară jos (overlay)',
          default: 'Implicit',
          overlay: 'Bară suprapusă peste conținut (overlay)',
          top: 'Bară sus (overlay)',
          background: 'Fundal card'
        },
        bar_size: {
          large: 'Mare',
          medium: 'Medie',
          small: 'Mică',
          xlarge: 'Foarte mare'
        },
        layout: {
          horizontal: 'Orizontal (implicit)',
          vertical: 'Vertical'
        },
        theme: {
          humidity: 'Umiditate',
          light: 'Luminozitate',
          optimal_when_high: 'Optim când este ridicat (Baterie...)',
          optimal_when_low: 'Optim când este scăzut (CPU, RAM...)',
          pm25: 'PM2.5',
          temperature: 'Temperatură',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automat',
          segment: 'Segmente',
          rainbow: 'Curcubeu'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Colțuri rotunjite',
          glass: 'Sticlă',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient inversat',
          shimmer: 'Luciu',
          shimmer_reverse: 'Luciu inversat'
        },
        hide: {
          icon: 'Pictogramă',
          name: 'Nume',
          value: 'Valoare',
          unit: 'Unitate',
          secondary_info: 'Info',
          progress_bar: 'Bară'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ru: {
    card: {
      msg: {
        appliedDefaultValue: 'Значение по умолчанию было применено автоматически.',
        attributeNotFound: 'Атрибут не найден в Home Assistant.',
        entityNotFound: 'Сущность не найдена в Home Assistant.',
        invalidActionObject: 'Объект действия недействителен или неправильно структурирован.',
        invalidDecimal: 'Значение должно быть действительным десятичным числом.',
        invalidEntityId: 'Идентификатор сущности недействителен или неправильно сформирован.',
        invalidEnumValue: 'Предоставленное значение не является одним из разрешённых вариантов.',
        invalidStateContent: 'Содержимое состояния недействительно или неправильно сформировано.',
        invalidStateContentEntry: 'Одна или несколько записей в содержимом состояния недействительны.',
        invalidTheme: 'Указанная тема неизвестна. Будет использована тема по умолчанию.',
        invalidTypeArray: 'Ожидается значение типа массив.',
        invalidTypeBoolean: 'Ожидается значение логического типа.',
        invalidTypeNumber: 'Ожидается значение числового типа.',
        invalidTypeObject: 'Ожидается значение типа объект.',
        invalidTypeString: 'Ожидается значение строкового типа.',
        invalidUnionType: 'Значение не соответствует ни одному из разрешённых типов.',
        missingActionKey: 'В объекте действия отсутствует обязательный ключ.',
        missingRequiredProperty: 'Отсутствует обязательное свойство.'
      }
    },
    editor: {
      title: {
        content: 'Содержимое',
        interaction: 'Взаимодействия',
        theme: 'Внешний вид'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Цвет значка',
        badge_icon: 'Иконка значка',
        bar_color: 'Цвет полосы',
        bar_effect_jinja: 'Эффект на полосе (режим Jinja)',
        bar_orientation: 'Ориентация полосы',
        bar_position: 'Положение полосы',
        bar_single_line: 'Информация в одну строку (overlay)',
        bar_size: 'Размер полосы',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим цвета',
        bar_scale: 'Bar scale',
        center_zero: 'Ноль по центру',
        center_zero_value: 'Центральное значение',
        center_zero_growth_percent: 'Процент роста',
        color: 'Основной цвет',
        decimal: 'десятичные',
        double_tap_action: 'Поведение при двойном нажатии',
        entity: 'Сущность',
        force_circular_background: 'Принудительный круглый фон',
        hide_jinja: 'Скрыть (режим Jinja)',
        hold_action: 'Поведение при длительном нажатии',
        icon: 'Иконка',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Поведение при двойном нажатии на иконку',
        icon_hold_action: 'Поведение при длительном нажатии на иконку',
        icon_tap_action: 'Поведение при нажатии на иконку',
        layout: 'Расположение содержимого',
        max_value: 'Максимальное значение',
        min_value: 'Минимальное значение',
        name: 'Название',
        percent: 'Процент',
        reverse_secondary_info_row: 'Поменять местами панель и текст',
        secondary: 'Дополнительная информация',
        state_content: 'Содержимое состояния',
        show_all_actions: 'Показать все действия',
        tap_action: 'Поведение при нажатии',
        text_shadow: 'Добавить тень к тексту (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Единица измерения',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Дополнительная информация',
        multiline: 'Multiline',
        interpolate: 'Интерполяция цветов',
        name_info: 'Доп. информация (имя)',
        reverse: 'Обратный таймер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Дополнительные объекты',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Слева направо',
          rtl: 'Справа налево',
          up: 'Вверх (overlay)'
        },
        bar_position: {
          below: 'Полоса под содержимым',
          bottom: 'Полоса внизу (overlay)',
          default: 'По умолчанию',
          overlay: 'Полоса поверх содержимого (overlay)',
          top: 'Полоса вверху (overlay)',
          background: 'Фон карточки'
        },
        bar_size: {
          large: 'Большая',
          medium: 'Средняя',
          small: 'Маленькая',
          xlarge: 'Очень большая'
        },
        layout: {
          horizontal: 'Горизонтальный (по умолчанию)',
          vertical: 'Вертикальный'
        },
        theme: {
          humidity: 'Влажность',
          light: 'Освещение',
          optimal_when_high: 'Оптимально при высоких значениях (Батарея...)',
          optimal_when_low: 'Оптимально при низких значениях (ЦП, ОЗУ,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'ЛОС'
        },
        bar_color_mode: {
          auto: 'Авто',
          segment: 'Сегменты',
          rainbow: 'Радуга'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Скруглённые углы',
          glass: 'Стекло',
          gradient: 'Градиент',
          gradient_reverse: 'Обратный градиент',
          shimmer: 'Мерцание',
          shimmer_reverse: 'Обратное мерцание'
        },
        hide: {
          icon: 'Иконка',
          name: 'Имя',
          value: 'Значение',
          unit: 'Единица',
          secondary_info: 'Инфо',
          progress_bar: 'Полоса'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sk: {
    card: {
      msg: {
        appliedDefaultValue: 'Predvolená hodnota bola automaticky použitá.',
        attributeNotFound: 'Atribút sa nenašiel v Home Assistant.',
        entityNotFound: 'Entita sa nenašla v Home Assistant.',
        invalidActionObject: 'Objekt akcie je neplatný alebo nesprávne štruktúrovaný.',
        invalidDecimal: 'Hodnota musí byť kladné celé číslo.',
        invalidEntityId: 'ID entity je neplatné alebo nesprávne.',
        invalidEnumValue: 'Zadaná hodnota nie je súčasťou povolených možností.',
        invalidStateContent: 'Obsah stavu je neplatný alebo nesprávny.',
        invalidStateContentEntry: 'Jedna alebo viac položiek obsahu stavu je neplatných.',
        invalidTheme: 'Zadaná téma je neznáma. Použije sa predvolená téma.',
        invalidTypeArray: 'Očakávala sa hodnota typu pole.',
        invalidTypeBoolean: 'Očakávala sa hodnota typu boolean.',
        invalidTypeNumber: 'Očakávala sa hodnota typu číslo.',
        invalidTypeObject: 'Očakávala sa hodnota typu objekt.',
        invalidTypeString: 'Očakávala sa hodnota typu reťazec.',
        invalidUnionType: 'Hodnota nezodpovedá žiadnemu povolenému typu.',
        missingActionKey: 'Chýba povinný kľúč v objekte akcie.',
        missingRequiredProperty: 'Chýba povinná vlastnosť.'
      }
    },
    editor: {
      title: {
        content: 'Obsah',
        interaction: 'Interakcie',
        theme: 'Vzhľad a použiteľnosť'
      },
      field: {
        attribute: 'Atribút',
        badge_color: 'Farba odznaku',
        badge_icon: 'Ikona odznaku',
        bar_color: 'Farba lišty',
        bar_effect_jinja: 'Efekt lišty (režim Jinja)',
        bar_orientation: 'Orientácia lišty',
        bar_position: 'Pozícia lišty',
        bar_single_line: 'Informácie na jednej línii (overlay)',
        bar_size: 'Veľkosť lišty',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Farebný režim',
        bar_scale: 'Bar scale',
        center_zero: 'Nula v strede',
        center_zero_value: 'Hodnota stredu',
        center_zero_growth_percent: 'Percento rastu',
        color: 'Farba ikony',
        decimal: 'Desatinné',
        double_tap_action: 'Akcia pri dvojitom ťuknutí',
        entity: 'Entita',
        force_circular_background: 'Vynútiť kruhové pozadie',
        hide_jinja: 'Skryť (režim Jinja)',
        hold_action: 'Akcia pri dlhom podržaní',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcia pri dvojitom ťuknutí ikony',
        icon_hold_action: 'Akcia pri dlhom podržaní ikony',
        icon_tap_action: 'Akcia pri ťuknutí ikony',
        layout: 'Rozloženie obsahu',
        max_value: 'Maximálna hodnota',
        min_value: 'Minimálna hodnota',
        name: 'Názov',
        percent: 'Percento',
        reverse_secondary_info_row: 'Vymeňte lištu a text',
        secondary: 'Sekundárna informácia',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobraziť všetky akcie',
        tap_action: 'Akcia pri ťuknutí',
        text_shadow: 'Pridať tieň textu (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Téma',
        custom_theme: 'Custom theme zones',
        unit: 'Jednotka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Vlastné sekundárne info',
        multiline: 'Multiline',
        interpolate: 'Interpolácia farieb',
        name_info: 'Vlastné info názvu',
        reverse: 'Obrátený časovač',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ďalšie entity',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimálne pri nízkej hodnote (CPU, RAM...)',
          optimal_when_high: 'Optimálne pri vysokej hodnote (Batéria...)',
          light: 'Svetlá',
          temperature: 'Teplota',
          humidity: 'Vlhkosť',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Malá',
          medium: 'Stredná',
          large: 'Veľká',
          xlarge: 'Veľmi veľká'
        },
        bar_orientation: {
          ltr: 'Zľava doprava',
          rtl: 'Sprava doľava',
          up: 'Nahor (overlay)'
        },
        bar_position: {
          default: 'Predvolené',
          below: 'Pruh pod obsahom',
          top: 'Pruh hore (overlay)',
          bottom: 'Pruh dole (overlay)',
          overlay: 'Pruh cez obsah (overlay)',
          background: 'Pozadie karty'
        },
        layout: {
          horizontal: 'Horizontálne (predvolené)',
          vertical: 'Vertikálne'
        },
        bar_color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Dúha'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaoblené rohy',
          glass: 'Sklo',
          gradient: 'Prechod',
          gradient_reverse: 'Prechod obrátenou',
          shimmer: 'Trblietanie',
          shimmer_reverse: 'Trblietanie obrátenou'
        },
        hide: {
          icon: 'Ikona',
          name: 'Názov',
          value: 'Hodnota',
          unit: 'Jednotka',
          secondary_info: 'Info',
          progress_bar: 'Lišta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sl: {
    card: {
      msg: {
        appliedDefaultValue: 'Privzeta vrednost je bila samodejno uporabljena.',
        attributeNotFound: 'Atribut ni bil najden v Home Assistant.',
        entityNotFound: 'Entiteta ni bila najdena v Home Assistant.',
        invalidActionObject: 'Objekt akcije je neveljaven ali napačno strukturiran.',
        invalidDecimal: 'Vrednost mora biti pozitivno celo število.',
        invalidEntityId: 'ID entitete je neveljaven ali napačen.',
        invalidEnumValue: 'Podana vrednost ni med dovoljenimi možnostmi.',
        invalidStateContent: 'Vsebina stanja je neveljavna ali napačno oblikovana.',
        invalidStateContentEntry: 'Eden ali več vnosov vsebine stanja je neveljavno.',
        invalidTheme: 'Določena tema je neznana. Uporabila se bo privzeta tema.',
        invalidTypeArray: 'Pričakovana je bila vrednost tipa polje.',
        invalidTypeBoolean: 'Pričakovana je bila vrednost tipa boolean.',
        invalidTypeNumber: 'Pričakovana je bila vrednost tipa število.',
        invalidTypeObject: 'Pričakovana je bila vrednost tipa objekt.',
        invalidTypeString: 'Pričakovana je bila vrednost tipa niz.',
        invalidUnionType: 'Vrednost ne ustreza nobeni dovoljeni vrsti.',
        missingActionKey: 'Manjka obvezni ključ v objektu akcije.',
        missingRequiredProperty: 'Manjka obvezna lastnost.'
      }
    },
    editor: {
      title: {
        content: 'Vsebina',
        interaction: 'Interakcije',
        theme: 'Videz in uporabnost'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Barva značke',
        badge_icon: 'Ikona značke',
        bar_color: 'Barva vrstice',
        bar_effect_jinja: 'Učinek vrstice (način Jinja)',
        bar_orientation: 'Usmeritev vrstice',
        bar_position: 'Pozicija vrstice',
        bar_single_line: 'Informacije v eni vrstici (overlay)',
        bar_size: 'Velikost vrstice',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Barvni način',
        bar_scale: 'Bar scale',
        center_zero: 'Ni ničle na sredini',
        center_zero_value: 'Srednja vrednost',
        center_zero_growth_percent: 'Odstotek rasti',
        color: 'Barva ikone',
        decimal: 'Decimalno',
        double_tap_action: 'Akcija ob dvojni tap',
        entity: 'Entiteta',
        force_circular_background: 'Prisili krožno ozadje',
        hide_jinja: 'Skrij (način Jinja)',
        hold_action: 'Akcija ob dolgem pritisku',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcija ob dvojni tap ikone',
        icon_hold_action: 'Akcija ob dolgem pritisku ikone',
        icon_tap_action: 'Akcija ob tap ikone',
        layout: 'Postavitev vsebine',
        max_value: 'Največja vrednost',
        min_value: 'Najmanjša vrednost',
        name: 'Ime',
        percent: 'Odstotek',
        reverse_secondary_info_row: 'Zamenjaj vrstico in besedilo',
        secondary: 'Sekundarne informacije',
        state_content: 'Vsebina stanja',
        show_all_actions: 'Prikaži vsa dejanja',
        tap_action: 'Akcija ob tap',
        text_shadow: 'Dodaj senco besedila (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enota',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Prilagojena sekundarna informacija',
        multiline: 'Multiline',
        interpolate: 'Interpolacija barv',
        name_info: 'Prilagojena informacija o imenu',
        reverse: 'Obrnjen časovnik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatni entiteti',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimalno pri nizkih vrednostih (CPU, RAM...)',
          optimal_when_high: 'Optimalno pri visokih vrednostih (Baterija...)',
          light: 'Svetla',
          temperature: 'Temperatura',
          humidity: 'Vlažnost',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Majhna',
          medium: 'Srednja',
          large: 'Velika',
          xlarge: 'Zelo velika'
        },
        bar_orientation: {
          ltr: 'Levo proti desni',
          rtl: 'Desno proti levi',
          up: 'Navzgor (overlay)'
        },
        bar_position: {
          default: 'Privzeto',
          below: 'Vrstica pod vsebino',
          top: 'Vrstica zgoraj (overlay)',
          bottom: 'Vrstica spodaj (overlay)',
          overlay: 'Vrstica čez vsebino (overlay)',
          background: 'Ozadje kartice'
        },
        layout: {
          horizontal: 'Horizontalno (privzeto)',
          vertical: 'Vertikalno'
        },
        bar_color_mode: {
          auto: 'Samodejno',
          segment: 'Segmenti',
          rainbow: 'Mavrica'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaobljeni robovi',
          glass: 'Steklo',
          gradient: 'Prehod',
          gradient_reverse: 'Obrnjen prehod',
          shimmer: 'Blesk',
          shimmer_reverse: 'Obrnjen blesk'
        },
        hide: {
          icon: 'Ikona',
          name: 'Ime',
          value: 'Vrednost',
          unit: 'Enota',
          secondary_info: 'Info',
          progress_bar: 'Vrstica'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sv: {
    card: {
      msg: {
        appliedDefaultValue: 'Ett standardvärde har tillämpats automatiskt.',
        attributeNotFound: 'Attributet kunde inte hittas i Home Assistant.',
        entityNotFound: 'Enheten kunde inte hittas i Home Assistant.',
        invalidActionObject: 'Åtgärdsobjektet är ogiltigt eller felstrukturerat.',
        invalidDecimal: 'Värdet måste vara ett giltigt decimaltal.',
        invalidEntityId: 'Enhets-ID är ogiltigt eller felaktigt formaterat.',
        invalidEnumValue: 'Det angivna värdet är inte ett giltigt alternativ.',
        invalidStateContent: 'Tillståndsinnehållet är ogiltigt eller felaktigt.',
        invalidStateContentEntry: 'En eller flera poster i tillståndsinnehållet är ogiltiga.',
        invalidTheme: 'Det angivna temat är okänt. Standardtema används.',
        invalidTypeArray: 'Förväntade ett värde av typen array.',
        invalidTypeBoolean: 'Förväntade ett värde av typen boolean.',
        invalidTypeNumber: 'Förväntade ett värde av typen nummer.',
        invalidTypeObject: 'Förväntade ett värde av typen objekt.',
        invalidTypeString: 'Förväntade ett värde av typen sträng.',
        invalidUnionType: 'Värdet matchar inte något av de tillåtna typerna.',
        missingActionKey: 'En obligatorisk nyckel saknas i åtgärdsobjektet.',
        missingRequiredProperty: 'En obligatorisk egenskap saknas.'
      }
    },
    editor: {
      title: {
        content: 'Innehåll',
        interaction: 'Interaktioner',
        theme: 'Utseende och funktionalitet'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Färg på bricka',
        badge_icon: 'Ikon för bricka',
        bar_color: 'Färg för baren',
        bar_effect_jinja: 'Effekt på baren (Jinja-läge)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Position för baren',
        bar_single_line: 'Info på en rad (overlay)',
        bar_size: 'Barstorlek',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Färgläge',
        bar_scale: 'Bar scale',
        center_zero: 'Noll i mitten',
        center_zero_value: 'Centervärde',
        center_zero_growth_percent: 'Tillväxtprocent',
        color: 'Primärfärg',
        decimal: 'decimal',
        double_tap_action: 'Åtgärd vid dubbeltryck',
        entity: 'Enhet',
        force_circular_background: 'Tvinga cirkulär bakgrund',
        hide_jinja: 'Dölj (Jinja-läge)',
        hold_action: 'Åtgärd vid långt tryck',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Åtgärd vid dubbeltryck på ikonen',
        icon_hold_action: 'Åtgärd vid långt tryck på ikonen',
        icon_tap_action: 'Åtgärd vid tryck på ikonen',
        layout: 'Innehållslayout',
        max_value: 'Maximalt värde',
        min_value: 'Minsta värde',
        name: 'Namn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Byt ut stapel och text',
        secondary: 'Sekundär information',
        state_content: 'Statusinnehåll',
        show_all_actions: 'Visa alla åtgärder',
        tap_action: 'Åtgärd vid kort tryck',
        text_shadow: 'Lägg till textskugga (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhet',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Anpassad sekundär info',
        multiline: 'Multiline',
        interpolate: 'Interpolera färger',
        name_info: 'Anpassad namninfo',
        reverse: 'Omvänd timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ytterligare entiteter',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Vänster till höger',
          rtl: 'Höger till vänster',
          up: 'Uppåt (overlay)'
        },
        bar_position: {
          below: 'Bar under innehållet',
          bottom: 'Bar längst ned (overlay)',
          default: 'Standard',
          overlay: 'Bar överlagrad på innehållet (overlay)',
          top: 'Bar längst upp (overlay)',
          background: 'Kortbakgrund'
        },
        bar_size: {
          large: 'Stor',
          medium: 'Medium',
          small: 'Liten',
          xlarge: 'Extra stor'
        },
        layout: {
          horizontal: 'Horisontell (standard)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Luftfuktighet',
          light: 'Ljus',
          optimal_when_high: 'Optimal när det är högt (Batteri...)',
          optimal_when_low: 'Optimal när det är lågt (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Regnbåge'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Rundade hörn',
          glass: 'Glas',
          gradient: 'Gradient',
          gradient_reverse: 'Omvänd gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvänd glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Namn',
          value: 'Värde',
          unit: 'Enhet',
          secondary_info: 'Info',
          progress_bar: 'Stapel'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  th: {
    card: {
      msg: {
        appliedDefaultValue: 'ค่าเริ่มต้นถูกนำไปใช้โดยอัตโนมัติ',
        attributeNotFound: 'ไม่พบแอตทริบิวต์ใน HA',
        entityNotFound: 'ไม่พบเอนทิตีใน HA',
        invalidActionObject: 'ออบเจ็กต์แอ็กชันไม่ถูกต้องหรือโครงสร้างผิด',
        invalidDecimal: 'ค่าต้องเป็นตัวเลขทศนิยมที่ถูกต้อง',
        invalidEntityId: 'ID เอนทิตีไม่ถูกต้องหรือรูปแบบผิด',
        invalidEnumValue: 'ค่าที่ให้มาไม่ใช่หนึ่งในตัวเลือกที่อนุญาต',
        invalidStateContent: 'เนื้อหาสถานะไม่ถูกต้องหรือรูปแบบผิด',
        invalidStateContentEntry: 'หนึ่งหรือหลายรายการในเนื้อหาสถานะไม่ถูกต้อง',
        invalidTheme: 'ธีมที่ระบุไม่รู้จัก จะใช้ธีมเริ่มต้น',
        invalidTypeArray: 'คาดหวังค่าประเภทอาร์เรย์',
        invalidTypeBoolean: 'คาดหวังค่าประเภทบูลีน',
        invalidTypeNumber: 'คาดหวังค่าประเภทตัวเลข',
        invalidTypeObject: 'คาดหวังค่าประเภทออบเจ็กต์',
        invalidTypeString: 'คาดหวังค่าประเภทสตริง',
        invalidUnionType: 'ค่าไม่ตรงกับประเภทที่อนุญาตใด ๆ',
        missingActionKey: 'ขาดคีย์ที่จำเป็นในออบเจ็กต์แอ็กชัน',
        missingRequiredProperty: 'ขาดคุณสมบัติที่จำเป็น'
      }
    },
    editor: {
      title: {
        content: 'เนื้อหา',
        interaction: 'การโต้ตอบ',
        theme: 'รูปลักษณ์และความรู้สึก'
      },
      field: {
        attribute: 'แอตทริบิวต์',
        badge_color: 'สีของป้าย',
        badge_icon: 'ไอคอนของป้าย',
        bar_color: 'สีแถบ',
        bar_effect_jinja: 'เอฟเฟกต์บนแถบ (โหมด Jinja)',
        bar_orientation: 'การวางแนวแถบ',
        bar_position: 'ตำแหน่งแถบ',
        bar_single_line: 'ข้อมูลในบรรทัดเดียว (overlay)',
        bar_size: 'ขนาดแถบ',
        bar_segments: 'Bar segments',
        bar_color_mode: 'โหมดสี',
        bar_scale: 'Bar scale',
        center_zero: 'Sıfırı ortala',
        center_zero_value: 'ค่ากึ่งกลาง',
        center_zero_growth_percent: 'เปอร์เซ็นต์การเติบโต',
        color: 'สีหลัก',
        decimal: 'ทศนิยม',
        double_tap_action: 'พฤติกรรมการแตะสองครั้ง',
        entity: 'เอนทิตี',
        force_circular_background: 'บังคับพื้นหลังวงกลม',
        hide_jinja: 'ซ่อน (โหมด Jinja)',
        hold_action: 'พฤติกรรมการกด',
        icon: 'ไอคอน',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'พฤติกรรมการแตะไอคอนสองครั้ง',
        icon_hold_action: 'พฤติกรรมการกดไอคอน',
        icon_tap_action: 'พฤติกรรมการแตะไอคอน',
        layout: 'รูปแบบเนื้อหา',
        max_value: 'ค่าสูงสุด',
        min_value: 'ค่าต่ำสุด',
        name: 'ชื่อ',
        percent: 'เปอร์เซ็นต์',
        reverse_secondary_info_row: 'แถบและข้อความสลับกัน',
        secondary: 'ข้อมูลรอง',
        state_content: 'เนื้อหาของสถานะ',
        show_all_actions: 'แสดงการโต้ตอบทั้งหมด',
        tap_action: 'พฤติกรรมการแตะ',
        text_shadow: 'เพิ่มเงาให้ข้อความ (overlay)',
        theme_mode: 'Theme mode',
        theme: 'ธีม',
        custom_theme: 'Custom theme zones',
        unit: 'หน่วย',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'ข้อมูลรองที่กำหนดเอง',
        multiline: 'Multiline',
        interpolate: 'การสอดแทรกสี',
        name_info: 'ข้อมูลชื่อที่กำหนดเอง',
        reverse: 'กลับเวลานับถอยหลัง',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'เอนทิตีเพิ่มเติม',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'ซ้ายไปขวา',
          rtl: 'ขวาไปซ้าย',
          up: 'ขึ้นบน (overlay)'
        },
        bar_position: {
          below: 'แถบใต้เนื้อหา',
          bottom: 'แถบด้านล่าง (overlay)',
          default: 'ค่าเริ่มต้น',
          overlay: 'แถบซ้อนทับเนื้อหา (overlay)',
          top: 'แถบด้านบน (overlay)',
          background: 'พื้นหลังการ์ด'
        },
        bar_size: {
          large: 'ใหญ่',
          medium: 'กลาง',
          small: 'เล็ก',
          xlarge: 'ใหญ่พิเศษ'
        },
        layout: {
          horizontal: 'แนวนอน (เริ่มต้น)',
          vertical: 'แนวตั้ง'
        },
        theme: {
          humidity: 'ความชื้น',
          light: 'แสง',
          optimal_when_high: 'เหมาะสมเมื่อสูง (แบตเตอรี่...)',
          optimal_when_low: 'เหมาะสมเมื่อต่ำ (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'อุณหภูมิ',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'อัตโนมัติ',
          segment: 'ส่วน',
          rainbow: 'สีรุ้ง'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'มุมโค้งมน',
          glass: 'กระจก',
          gradient: 'ไล่สี',
          gradient_reverse: 'ไล่สีย้อน',
          shimmer: 'แวววาว',
          shimmer_reverse: 'แวววาวย้อน'
        },
        hide: {
          icon: 'ไอคอน',
          name: 'ชื่อ',
          value: 'ค่า',
          unit: 'หน่วย',
          secondary_info: 'ข้อมูล',
          progress_bar: 'แถบ'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  tr: {
    card: {
      msg: {
        appliedDefaultValue: 'Varsayılan değer otomatik olarak uygulandı.',
        attributeNotFound: 'Öznitelik Home Assistant\'ta bulunamadı.',
        entityNotFound: 'Varlık Home Assistant\'ta bulunamadı.',
        invalidActionObject: 'Eylem nesnesi geçersiz veya hatalı yapılandırılmış.',
        invalidDecimal: 'Değer geçerli bir ondalık sayı olmalıdır.',
        invalidEntityId: 'Varlık kimliği geçersiz veya hatalı biçimlendirilmiş.',
        invalidEnumValue: 'Sağlanan değer izin verilen seçeneklerden biri değil.',
        invalidStateContent: 'Durum içeriği geçersiz veya hatalı biçimlendirilmiş.',
        invalidStateContentEntry: 'Durum içeriğindeki bir veya daha fazla giriş geçersiz.',
        invalidTheme: 'Belirtilen tema bilinmiyor. Varsayılan tema kullanılacak.',
        invalidTypeArray: 'Dizi türünde bir değer bekleniyordu.',
        invalidTypeBoolean: 'Boolean türünde bir değer bekleniyordu.',
        invalidTypeNumber: 'Sayı türünde bir değer bekleniyordu.',
        invalidTypeObject: 'Nesne türünde bir değer bekleniyordu.',
        invalidTypeString: 'Dize (string) türünde bir değer bekleniyordu.',
        invalidUnionType: 'Değer izin verilen türlerden hiçbirine uymuyor.',
        missingActionKey: 'Eylem nesnesinde gerekli bir anahtar eksik.',
        missingRequiredProperty: 'Gerekli bir özellik eksik.'
      }
    },
    editor: {
      title: {
        content: 'İçerik',
        interaction: 'Etkileşimler',
        theme: 'Görünüm'
      },
      field: {
        attribute: 'Öznitelik',
        badge_color: 'Rozet rengi',
        badge_icon: 'Rozet simgesi',
        bar_color: 'Çubuk rengi',
        bar_effect_jinja: 'Çubuk efekti (Jinja modu)',
        bar_orientation: 'Çubuk yönü',
        bar_position: 'Çubuk konumu',
        bar_single_line: 'Bilgiyi tek satırda göster (overlay)',
        bar_size: 'Çubuk boyutu',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Renk modu',
        bar_scale: 'Bar scale',
        center_zero: 'Нуль по центру',
        center_zero_value: 'Merkez değeri',
        center_zero_growth_percent: 'Büyüme yüzdesi',
        color: 'Birincil renk',
        decimal: 'ondalık',
        double_tap_action: 'Çift dokunma davranışı',
        entity: 'Varlık',
        force_circular_background: 'Dairesel arka planı zorla',
        hide_jinja: 'Gizle (Jinja modu)',
        hold_action: 'Uzun basma davranışı',
        icon: 'Simge',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Simgeye çift dokunma davranışı',
        icon_hold_action: 'Simgeye uzun basma davranışı',
        icon_tap_action: 'Simgeye dokunma davranışı',
        layout: 'İçerik düzeni',
        max_value: 'Maksimum değer',
        min_value: 'Minimum değer',
        name: 'Ad',
        percent: 'Yüzde',
        reverse_secondary_info_row: 'Çubuğu ve metni değiştir',
        secondary: 'İkincil bilgi',
        state_content: 'Durum içeriği',
        show_all_actions: 'Tüm eylemleri göster',
        tap_action: 'Kısa dokunma davranışı',
        text_shadow: 'Metne gölge ekle (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Birim',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Özel ikincil bilgi',
        multiline: 'Multiline',
        interpolate: 'Renk interpolasyonu',
        name_info: 'Özel ad bilgisi',
        reverse: 'Zamanlayıcıyı tersine çevir',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ek varlıklar',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Soldan sağa',
          rtl: 'Sağdan sola',
          up: 'Yukarı (overlay)'
        },
        bar_position: {
          below: 'İçeriğin altında çubuk',
          bottom: 'Altta çubuk (overlay)',
          default: 'Varsayılan',
          overlay: 'İçeriğin üzerine bindirme (overlay)',
          top: 'Üstte çubuk (overlay)',
          background: 'Kart arka planı'
        },
        bar_size: {
          large: 'Büyük',
          medium: 'Orta',
          small: 'Küçük',
          xlarge: 'Çok büyük'
        },
        layout: {
          horizontal: 'Yatay (varsayılan)',
          vertical: 'Dikey'
        },
        theme: {
          humidity: 'Nem',
          light: 'Işık',
          optimal_when_high: 'Yüksekken en iyi (Pil...)',
          optimal_when_low: 'Düşükken en iyi (CPU, RAM...)',
          pm25: 'PM2.5',
          temperature: 'Sıcaklık',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Otomatik',
          segment: 'Bölümler',
          rainbow: 'Gökkuşağı'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Yuvarlatılmış köşeler',
          glass: 'Cam',
          gradient: 'Gradyan',
          gradient_reverse: 'Ters gradyan',
          shimmer: 'Parıltı',
          shimmer_reverse: 'Ters parıltı'
        },
        hide: {
          icon: 'Simge',
          name: 'Ad',
          value: 'Değer',
          unit: 'Birim',
          secondary_info: 'Bilgi',
          progress_bar: 'Çubuk'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  uk: {
    card: {
      msg: {
        appliedDefaultValue: 'Значення за замовчуванням було застосовано автоматично.',
        attributeNotFound: 'Атрибут не знайдено в HA.',
        entityNotFound: 'Сутність не знайдена в HA.',
        invalidActionObject: 'Об\'єкт дії недійсний або неправильно структурований.',
        invalidDecimal: 'Значення повинно бути дійсним десятковим числом.',
        invalidEntityId: 'ID сутності недійсний або неправильно сформований.',
        invalidEnumValue: 'Надане значення не є одним з дозволених варіантів.',
        invalidStateContent: 'Вміст стану недійсний або неправильно сформований.',
        invalidStateContentEntry: 'Один або кілька записів у вмісті стану недійсні.',
        invalidTheme: 'Зазначена тема невідома. Буде використана тема за замовчуванням.',
        invalidTypeArray: 'Очікується значення типу масив.',
        invalidTypeBoolean: 'Очікується значення типу булевий.',
        invalidTypeNumber: 'Очікується значення типу число.',
        invalidTypeObject: 'Очікується значення типу об\'єкт.',
        invalidTypeString: 'Очікується значення типу рядок.',
        invalidUnionType: 'Значення не відповідає жодному з дозволених типів.',
        missingActionKey: 'Відсутній обов\'язковий ключ в об\'єкті дії.',
        missingRequiredProperty: 'Відсутня обов\'язкова властивість.'
      }
    },
    editor: {
      title: {
        content: 'Вміст',
        interaction: 'Взаємодії',
        theme: 'Вигляд та відчуття'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Колір значка',
        badge_icon: 'Іконка значка',
        bar_color: 'Колір панелі',
        bar_effect_jinja: 'Ефект на панелі (режим Jinja)',
        bar_orientation: 'Орієнтація панелі',
        bar_position: 'Положення панелі',
        bar_single_line: 'Інформація в один рядок (overlay)',
        bar_size: 'Розмір панелі',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим кольору',
        bar_scale: 'Bar scale',
        center_zero: 'Không ở giữa',
        center_zero_value: 'Центральне значення',
        center_zero_growth_percent: 'Відсоток зростання',
        color: 'Основний колір',
        decimal: 'десятковий',
        double_tap_action: 'Поведінка при подвійному дотику',
        entity: 'Сутність',
        force_circular_background: 'Примусовий круглий фон',
        hide_jinja: 'Приховати (режим Jinja)',
        hold_action: 'Поведінка при утриманні',
        icon: 'Іконка',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Поведінка подвійного дотику іконки',
        icon_hold_action: 'Поведінка утримання іконки',
        icon_tap_action: 'Поведінка дотику іконки',
        layout: 'Розташування вмісту',
        max_value: 'Максимальне значення',
        min_value: 'Мінімальне значення',
        name: 'Назва',
        percent: 'Відсоток',
        reverse_secondary_info_row: 'Поміняти місцями панель і текст',
        secondary: 'Додаткова інформація',
        state_content: 'Вміст стану',
        show_all_actions: 'Показати всі дії',
        tap_action: 'Поведінка при дотику',
        text_shadow: 'Додати тінь до тексту (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Одиниця',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Додаткова вторинна інформація',
        multiline: 'Multiline',
        interpolate: 'Інтерполяція кольорів',
        name_info: 'Додаткова інформація (назва)',
        reverse: 'Зворотній таймер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Додаткові об\'єкти',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Зліва направо',
          rtl: 'Справа наліво',
          up: 'Вгору (overlay)'
        },
        bar_position: {
          below: 'Панель під вмістом',
          bottom: 'Панель знизу (overlay)',
          default: 'За замовчуванням',
          overlay: 'Панель поверх вмісту (overlay)',
          top: 'Панель зверху (overlay)',
          background: 'Фон картки'
        },
        bar_size: {
          large: 'Велика',
          medium: 'Середня',
          small: 'Мала',
          xlarge: 'Дуже велика'
        },
        layout: {
          horizontal: 'Горизонтальний (за замовчуванням)',
          vertical: 'Вертикальний'
        },
        theme: {
          humidity: 'Вологість',
          light: 'Світло',
          optimal_when_high: 'Оптимально при високих значеннях (Батарея...)',
          optimal_when_low: 'Оптимально при низьких значеннях (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Авто',
          segment: 'Сегменти',
          rainbow: 'Веселка'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Заокруглені кути',
          glass: 'Скло',
          gradient: 'Градієнт',
          gradient_reverse: 'Зворотній градієнт',
          shimmer: 'Мерехтіння',
          shimmer_reverse: 'Зворотнє мерехтіння'
        },
        hide: {
          icon: 'Іконка',
          name: 'Ім\'я',
          value: 'Значення',
          unit: 'Одиниця',
          secondary_info: 'Інфо',
          progress_bar: 'Смуга'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  vi: {
    card: {
      msg: {
        appliedDefaultValue: 'Một giá trị mặc định đã được áp dụng tự động.',
        attributeNotFound: 'Không tìm thấy thuộc tính trong HA.',
        entityNotFound: 'Không tìm thấy thực thể trong HA.',
        invalidActionObject: 'Đối tượng hành động không hợp lệ hoặc cấu trúc không đúng.',
        invalidDecimal: 'Giá trị phải là một số thập phân hợp lệ.',
        invalidEntityId: 'ID thực thể không hợp lệ hoặc không đúng định dạng.',
        invalidEnumValue: 'Giá trị được cung cấp không nằm trong các tùy chọn được phép.',
        invalidStateContent: 'Nội dung trạng thái không hợp lệ hoặc không đúng định dạng.',
        invalidStateContentEntry: 'Một hoặc nhiều mục trong nội dung trạng thái không hợp lệ.',
        invalidTheme: 'Chủ đề được chỉ định không xác định. Chủ đề mặc định sẽ được sử dụng.',
        invalidTypeArray: 'Mong đợi một giá trị kiểu mảng.',
        invalidTypeBoolean: 'Mong đợi một giá trị kiểu boolean.',
        invalidTypeNumber: 'Mong đợi một giá trị kiểu số.',
        invalidTypeObject: 'Mong đợi một giá trị kiểu đối tượng.',
        invalidTypeString: 'Mong đợi một giá trị kiểu chuỗi.',
        invalidUnionType: 'Giá trị không khớp với bất kỳ loại nào được phép.',
        missingActionKey: 'Một khóa bắt buộc bị thiếu trong đối tượng hành động.',
        missingRequiredProperty: 'Thuộc tính bắt buộc bị thiếu.'
      }
    },
    editor: {
      title: {
        content: 'Nội dung',
        interaction: 'Tương tác',
        theme: 'Giao diện & Trải nghiệm'
      },
      field: {
        attribute: 'Thuộc tính',
        badge_color: 'Màu huy hiệu',
        badge_icon: 'Biểu tượng huy hiệu',
        bar_color: 'Màu thanh',
        bar_effect_jinja: 'Hiệu ứng thanh (chế độ Jinja)',
        bar_orientation: 'Hướng thanh',
        bar_position: 'Vị trí thanh',
        bar_single_line: 'Thông tin trên một dòng (overlay)',
        bar_size: 'Kích thước thanh',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Chế độ màu',
        bar_scale: 'Bar scale',
        center_zero: '零点居中',
        center_zero_value: 'Giá trị tâm',
        center_zero_growth_percent: 'Tỷ lệ tăng trưởng',
        color: 'Màu chính',
        decimal: 'thập phân',
        double_tap_action: 'Hành vi chạm đôi',
        entity: 'Thực thể',
        force_circular_background: 'Buộc nền hình tròn',
        hide_jinja: 'Ẩn (chế độ Jinja)',
        hold_action: 'Hành vi giữ',
        icon: 'Biểu tượng',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Hành vi chạm đôi biểu tượng',
        icon_hold_action: 'Hành vi giữ biểu tượng',
        icon_tap_action: 'Hành vi chạm biểu tượng',
        layout: 'Bố cục nội dung',
        max_value: 'Giá trị tối đa',
        min_value: 'Giá trị tối thiểu',
        name: 'Tên',
        percent: 'Phần trăm',
        reverse_secondary_info_row: 'Hoán đổi thanh và văn bản',
        secondary: 'Thông tin phụ',
        state_content: 'Nội dung trạng thái',
        show_all_actions: 'Hiển thị tất cả hành động',
        tap_action: 'Hành vi chạm',
        text_shadow: 'Thêm bóng cho văn bản (overlay)',
        theme_mode: 'Theme mode',
        theme: 'Chủ đề',
        custom_theme: 'Custom theme zones',
        unit: 'Đơn vị',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Thông tin phụ tùy chỉnh',
        multiline: 'Multiline',
        interpolate: 'Nội suy màu sắc',
        name_info: 'Thông tin tên tùy chỉnh',
        reverse: 'Đảo ngược bộ đếm thời gian',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Thực thể bổ sung',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Trái sang phải',
          rtl: 'Phải sang trái',
          up: 'Hướng lên (overlay)'
        },
        bar_position: {
          below: 'Thanh bên dưới nội dung',
          bottom: 'Thanh ở dưới cùng (overlay)',
          default: 'Mặc định',
          overlay: 'Thanh phủ lên nội dung (overlay)',
          top: 'Thanh ở trên cùng (overlay)',
          background: 'Nền thẻ'
        },
        bar_size: {
          large: 'Lớn',
          medium: 'Trung bình',
          small: 'Nhỏ',
          xlarge: 'Rất lớn'
        },
        layout: {
          horizontal: 'Ngang (mặc định)',
          vertical: 'Dọc'
        },
        theme: {
          humidity: 'Độ ẩm',
          light: 'Ánh sáng',
          optimal_when_high: 'Tối ưu khi cao (Pin...)',
          optimal_when_low: 'Tối ưu khi thấp (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Nhiệt độ',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Tự động',
          segment: 'Phân đoạn',
          rainbow: 'Cầu vồng'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Góc bo tròn',
          glass: 'Kính',
          gradient: 'Dốc màu',
          gradient_reverse: 'Dốc màu ngược',
          shimmer: 'Lấp lánh',
          shimmer_reverse: 'Lấp lánh ngược'
        },
        hide: {
          icon: 'Biểu tượng',
          name: 'Tên',
          value: 'Giá trị',
          unit: 'Đơn vị',
          secondary_info: 'Thông tin',
          progress_bar: 'Thanh'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'zh-Hans': {
    card: {
      msg: {
        appliedDefaultValue: '默认值已自动应用。',
        attributeNotFound: '在 Home Assistant 中未找到属性。',
        entityNotFound: '在 Home Assistant 中未找到实体。',
        invalidActionObject: '操作对象无效或结构错误。',
        invalidDecimal: '值必须为有效的小数。',
        invalidEntityId: '实体 ID 无效或格式错误。',
        invalidEnumValue: '提供的值不在允许选项内。',
        invalidStateContent: '状态内容无效或格式错误。',
        invalidStateContentEntry: '状态内容中的一项或多项无效。',
        invalidTheme: '指定的主题未知，将使用默认主题。',
        invalidTypeArray: '应为数组类型的值。',
        invalidTypeBoolean: '应为布尔类型的值。',
        invalidTypeNumber: '应为数字类型的值。',
        invalidTypeObject: '应为对象类型的值。',
        invalidTypeString: '应为字符串类型的值。',
        invalidUnionType: '值不符合任何允许类型。',
        missingActionKey: '操作对象缺少必需的键。',
        missingRequiredProperty: '缺少必需的属性。'
      }
    },
    editor: {
      title: {
        content: '内容',
        interaction: '交互',
        theme: '外观与体验'
      },
      field: {
        attribute: '属性',
        badge_color: '徽章颜色',
        badge_icon: '徽章图标',
        bar_color: '进度条颜色',
        bar_effect_jinja: '进度条效果 (Jinja 模式)',
        bar_orientation: '进度条方向',
        bar_position: '进度条位置',
        bar_single_line: '单行信息（覆盖显示）',
        bar_size: '进度条大小',
        bar_segments: 'Bar segments',
        bar_color_mode: '颜色模式',
        bar_scale: 'Bar scale',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增长百分比',
        color: '主色',
        decimal: '小数',
        double_tap_action: '双击动作',
        entity: '实体',
        force_circular_background: '强制圆形背景',
        hide_jinja: '隐藏 (Jinja 模式)',
        hold_action: '长按动作',
        icon: '图标',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '图标双击动作',
        icon_hold_action: '图标长按动作',
        icon_tap_action: '图标点击动作',
        layout: '内容布局',
        max_value: '最大值',
        min_value: '最小值',
        name: '名称',
        percent: '百分比',
        reverse_secondary_info_row: '交换进度条和文本',
        secondary: '次要信息',
        state_content: '状态内容',
        show_all_actions: '显示所有交互',
        tap_action: '点击动作',
        text_shadow: '添加文本阴影（overlay）',
        theme_mode: 'Theme mode',
        theme: '主题',
        custom_theme: 'Custom theme zones',
        unit: '单位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '自定义次要信息',
        multiline: 'Multiline',
        interpolate: '颜色插值',
        name_info: '自定义名称信息',
        reverse: '反转计时器',
        bar_stack_mode: 'Stack mode',
        bar_stack: '附加实体',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: '值低时最佳（CPU、内存等）',
          optimal_when_high: '值高时最佳（电池等）',
          light: '亮度',
          temperature: '温度',
          humidity: '湿度',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '超大'
        },
        bar_orientation: {
          ltr: '从左到右',
          rtl: '从右到左',
          up: '向上（覆盖显示）'
        },
        bar_position: {
          default: '默认',
          below: '内容下方的进度条',
          top: '顶部进度条（覆盖显示）',
          bottom: '底部进度条（覆盖显示）',
          overlay: '覆盖内容的进度条',
          background: '卡片背景'
        },
        layout: {
          horizontal: '水平（默认）',
          vertical: '垂直'
        },
        bar_color_mode: {
          auto: '自动',
          segment: '分段',
          rainbow: '彩虹'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '圆角',
          glass: '玻璃',
          gradient: '渐变',
          gradient_reverse: '反向渐变',
          shimmer: '微光',
          shimmer_reverse: '反向微光'
        },
        hide: {
          icon: '图标',
          name: '名称',
          value: '数值',
          unit: '单位',
          secondary_info: '补充信息',
          progress_bar: '进度条'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'zh-Hant': {
    card: {
      msg: {
        appliedDefaultValue: '已自動套用預設值。',
        attributeNotFound: '在 Home Assistant 中找不到此屬性。',
        entityNotFound: '在 Home Assistant 中找不到此實體。',
        invalidActionObject: '動作物件無效或結構不正確。',
        invalidDecimal: '數值必須是正整數。',
        invalidEntityId: '實體 ID 無效或格式不正確。',
        invalidEnumValue: '提供的值不在允許的選項中。',
        invalidStateContent: '狀態內容無效或格式不正確。',
        invalidStateContentEntry: '一個或多個狀態內容項目無效。',
        invalidTheme: '指定的主題未知，將使用預設主題。',
        invalidTypeArray: '預期為陣列類型的值。',
        invalidTypeBoolean: '預期為布林值類型的值。',
        invalidTypeNumber: '預期為數字類型的值。',
        invalidTypeObject: '預期為物件類型的值。',
        invalidTypeString: '預期為字串類型的值。',
        invalidUnionType: '值不符合任何允許的類型。',
        missingActionKey: '動作物件中缺少必要鍵。',
        missingRequiredProperty: '缺少必要屬性。'
      }
    },
    editor: {
      title: {
        content: '內容',
        interaction: '互動',
        theme: '外觀與主題'
      },
      field: {
        attribute: '屬性',
        badge_color: '徽章顏色',
        badge_icon: '徽章圖示',
        bar_color: '進度條顏色',
        bar_effect_jinja: '進度條效果 (Jinja 模式)',
        bar_orientation: '進度條方向',
        bar_position: '進度條位置',
        bar_single_line: '單行資訊（疊加）',
        bar_size: '進度條大小',
        bar_segments: 'Bar segments',
        bar_color_mode: '顏色模式',
        bar_scale: 'Bar scale',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增長百分比',
        color: '圖示顏色',
        decimal: '小數',
        double_tap_action: '雙擊操作',
        entity: '實體',
        force_circular_background: '強制圓形背景',
        hide_jinja: '隱藏 (Jinja 模式)',
        hold_action: '長按操作',
        icon: '圖示',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '圖示雙擊操作',
        icon_hold_action: '圖示長按操作',
        icon_tap_action: '圖示點擊操作',
        layout: '內容佈局',
        max_value: '最大值',
        min_value: '最小值',
        name: '名稱',
        percent: '百分比',
        reverse_secondary_info_row: '交換進度條和文字',
        secondary: '次要資訊',
        state_content: '狀態內容',
        show_all_actions: '顯示所有互動',
        tap_action: '點擊操作',
        text_shadow: '文字陰影（疊加）',
        theme_mode: 'Theme mode',
        theme: '主題',
        custom_theme: 'Custom theme zones',
        unit: '單位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '自訂次要資訊',
        multiline: 'Multiline',
        interpolate: '顏色插值',
        name_info: '自訂名稱資訊',
        reverse: '反轉計時器',
        bar_stack_mode: 'Stack mode',
        bar_stack: '附加實體',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: '數值低時最佳（CPU, RAM…）',
          optimal_when_high: '數值高時最佳（電池…）',
          light: '明亮',
          temperature: '溫度',
          humidity: '濕度',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '特大'
        },
        bar_orientation: {
          ltr: '由左到右',
          rtl: '由右到左',
          up: '向上（疊加）'
        },
        bar_position: {
          default: '預設',
          below: '內容下方',
          top: '上方（疊加）',
          bottom: '下方（疊加）',
          overlay: '疊加在內容上',
          background: '卡片背景'
        },
        layout: {
          horizontal: '水平（預設）',
          vertical: '垂直'
        },
        bar_color_mode: {
          auto: '自動',
          segment: '分段',
          rainbow: '彩虹'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '圓角',
          glass: '玻璃',
          gradient: '漸層',
          gradient_reverse: '反向漸層',
          shimmer: '微光',
          shimmer_reverse: '反向微光'
        },
        hide: {
          icon: '圖示',
          name: '名稱',
          value: '數值',
          unit: '單位',
          secondary_info: '補充資訊',
          progress_bar: '進度條'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  }
};
/* eslint-enable sonarjs/no-duplicate-string */

const CARD_CSS = `
/* =============================================================================
   PARAMS
   ============================================================================= */

:host {
  /* === SPACING VARIABLES === */
  --spacing: var(--epb-spacing, 10px);
  --gap-entities: 16px;

  /* === SIZE VARIABLES === */
  --shape-default-size: var(--epb-shape-size, 36px);
  --icon-default-size: var(--epb-icon-size, 24px);
  --entities-shape-size: 40px;
  --badge-size: 16px;
  --badge-icon-size: 12px;
  --badge-offset: -3px;
  --progress-size-xs: 6px;
  --progress-size-s: 8px;
  --progress-size-m: 12px;
  --progress-size-l: 16px;
  --progress-size-xl: 42px;
  --progress-size-overlay: 36px;

  /* === HEIGHT VARIABLES === */
  --name-height: 20px;
  --detail-height: 16px;
  --entities-height: 22.4px;
  --entities-card-min-height: 44.8px;
  --vertical-name-large-height: 18px;
  --progress-container-height: 16px;

  /* === COLOR OPACITY VARIABLES === */
  --shape-opacity: 20%;

  /* === TRANSITION VARIABLES === */
  --progress-transition: var(--epb-progress-transition, 0.5s cubic-bezier(0.4, 0, 0.2, 1));

  /* === TYPOGRAPHY VARIABLES === */
  --name-letter-spacing: 0.1px;
  --detail-letter-spacing: 0.4px;

  /* === LAYOUT VARIABLES === */
  --vertical-gap: 1px;

  /* === HA RIPPLE === */
  --ha-ripple-hover-opacity: 0.04;
  --ha-ripple-pressed-opacity: 0.12;

  /* === BORDER RADIUS === */
  --ha-standard-border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
}

.${CARD.style.bar.sizeOptions.small.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-s));
}

.${CARD.style.bar.sizeOptions.medium.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-m));
}

.${CARD.style.bar.sizeOptions.large.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-l));
}

.${CARD.style.bar.sizeOptions.xlarge.label} {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xl));
  --progress-container-height: var(--progress-size-xl);
}

ha-card.overlay {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-overlay));
  --progress-container-height: var(--epb-progress-bar-size, var(--progress-size-overlay));
}

.bottom-container, .top-container {
  --progress-size: var(--epb-progress-bar-size, var(--progress-size-xs));
  --progress-container-height: var(--progress-size-xs);
}

/* A Feature's row height must not shrink to the bar's own thickness
   (bar_size only sets --progress-size above) - HA reserves a fixed row
   regardless, and .progress-container already centers the bar inside it
   (align-items/justify-content: center). --feature-height is HA's own
   variable for a card-feature row (see hui-card-features.ts); reading it
   live keeps us in sync with HA/theme overrides instead of a static copy.
   Placed after the bar_size/xlarge rules above so it always wins for the
   'default' bar_position. .top-container/.bottom-container ('top'/'bottom'
   bar_position - the only other values the Feature schema allows) are
   separate child elements that re-declare --progress-container-height
   themselves, so this doesn't reach them - #fixCardStyles already handles
   sizing for those overlay-style positions. */
.entity-progress-feature {
  --progress-container-height: var(--feature-height, 42px);
}

/* =============================================================================
   BASE CARD
   ============================================================================= */

${CARD.htmlStructure.card.element} {
  --ha-ripple-color: var(--epb-icon-and-shape-color, var(--icon-and-shape-color, var(--state-icon-color)));
  /* Re-declared here (not only :host) so card_mod overrides set on ha-card are seen:
     var() substitution happens on the declaring element, and ha-card is where users
     apply per-card styles. The :host declarations keep theme-level overrides working. */
  --spacing: var(--epb-spacing, 10px);
  --shape-default-size: var(--epb-shape-size, 36px);
  --icon-default-size: var(--epb-icon-size, 24px);
  --progress-transition: var(--epb-progress-transition, 0.5s cubic-bezier(0.4, 0, 0.2, 1));
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, 100%);
  --current-card-min-height: 0;
  --current-card-height: var(${CARD.style.dynamic.card.height.var}, 100%);
  --current-card-padding: 0 var(--spacing);
  --current-card-margin: 0 auto;
  --current-card-border-radius: var(--ha-standard-border-radius);

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* permet top/bottom */
  margin: var(--current-card-margin);
  padding: var(--current-card-padding);
  min-width: var(--epb-card-width, var(--current-card-min-width));
  width: var(--epb-card-width, auto);
  min-height: var(--current-card-min-height);
  height: var(--epb-card-height, var(--current-card-height));
  border-radius: var(--epb-card-border-radius, var(--current-card-border-radius));
  border-width: var(--epb-card-border-width, var(--ha-card-border-width, 1px));
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  border-style: var(--epb-card-border-style, solid);
  overflow: hidden;
  font-family: var(--epb-card-font-family, var(--ha-font-family-body));
  -moz-osx-font-smoothing: var(--ha-font-smoothing);
  -webkit-font-smoothing: antialiased;
  transition-property: background-color, box-shadow, border-color;
}

.horizontal {
  --current-card-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.horizontal.minHeight});
  --current-card-padding: 0 var(--spacing);
}

.vertical {
  --current-card-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.vertical.minHeight});
  --current-card-padding: var(--spacing);
}

.marginless {
  --current-card-min-height: unset;
  --current-card-padding: 0;
  --current-card-margin: 0;
}

/* === BADGE === */
.progress-badge {
  --current-card-height: var(--ha-badge-size, 36px);
  --current-card-min-height: var(--ha-badge-size, 36px);
  --current-card-min-width: var(--card-min-width, var(--ha-badge-size, 130px));
  --current-card-border-radius: var(--ha-badge-border-radius,calc(var(--ha-badge-size,36px)/ 2));
}

/* === TYPE: PICTURE-ELEMENTS === */
.type-picture-elements {
  --current-card-min-width: var(${CARD.style.dynamic.card.minWidth.var}, 200px);
}

/* === FRAMELESS & ENTITIES STYLES === */
.type-entities,
.type-custom-vertical-stack-in-card,
.${CARD.style.dynamic.frameless.class} {
  --ha-card-background: transparent;
  --ha-card-border-width: 0;
  --ha-card-box-shadow: none;
}

.type-entities {
  --current-card-padding: 0;
  --current-card-margin: 0;
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-card-height: var(--entities-card-min-height); /* 44.8 px*/
  --current-card-min-height: var(--entities-card-min-height);
  
  transition: none !important;
}

/* =============================================================================
   MAIN CONTAINER
   ============================================================================= */

.${CARD.htmlStructure.sections.container.class} {
  display: flex;
  flex-direction: var(--current-container-flex-direction, row);
  align-items: center;
  justify-content: center;
  gap: var(--current-container-gap, var(--spacing));
  width: 100%;
  height: 100%;
  overflow: var(--current-container-overflow, visible);
  padding-top: var(--current-container-padding-top, 0);
  box-sizing: var(--current-container-box-sizing, content-box);
  flex-wrap: var(--current-container-flex-wrap, nowrap);
}

.horizontal {
  --current-container-flex-direction: row;
  --current-container-padding-top: 0;
  --current-container-overflow: visible;
  --current-container-gap: var(--spacing);
  --current-container-box-sizing: content-box;
  --current-container-flex-wrap: wrap;
}

.vertical {
  --current-container-flex-direction: column;
  --current-container-overflow: hidden;
  --current-container-gap: var(--spacing);
  --current-container-box-sizing: border-box;
  --current-container-flex-wrap: nowrap;
}

.vertical.default {
  --current-container-padding-top: var(--progress-size);
}

.${CARD.htmlStructure.sections.container.class}.vertical.up-orientation.overlay {
  --current-container-gap: 9.5px;
}

.type-entities .${CARD.htmlStructure.sections.container.class} {
  --current-container-gap: var(--gap-entities);
}

.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class} {
  --current-container-padding-top: 0;
}

/* =============================================================================
   TOP, BELOW & BOTTOM
   ============================================================================= */

ha-card:is(.bottom, .top, .below) {
  --group-max-width: 100%;
  --group-width: 100%;
}

ha-card.below {
  --current-card-padding: var(--spacing);
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--spacing);
}

ha-card.below > .container {
  flex: 1 1 auto;
  min-height: 0;
}

ha-card.vertical.xlarge.below .container {
  --current-container-padding-top: 0;
}

ha-card.below .${CARD.htmlStructure.elements.progressBar.container.class} {
  --current-progress-container-height: var(--progress-size);
}

ha-card.vertical.xlarge.below .${CARD.htmlStructure.elements.progressBar.container.class} {
  margin: 0;
}

.below-container {
  width: 100%;
  display: flex;
  overflow: hidden;
  height: var(--progress-size);
  flex-shrink: 0;
}

.horizontal.xlarge .container {
  align-content: center;
}

.bottom-container, .top-container {
  position: absolute;
  width: 100%;
  left: 0;
}

.top-container {
  top: 0;
}

.bottom-container {
  bottom: 0;
}

.bottom-container .bar-container,
.top-container .bar-container {
  height: var(--progress-size);
}

ha-card.background {
  --progress-size: 100%;
  --progress-container-height: 100%;
}

.background-container {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
}

.background .${CARD.htmlStructure.sections.container.class} {
  position: relative;
  z-index: 1;
}

:is(.background-container)
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: 0;
  --inner-radius: 0;
}


/* =============================================================================
   TREND
   ============================================================================= */

.trend-indicator,
.trend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-size);
  height: var(--badge-size);
}

.trend-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
}

.trend-icon {
  color: var(--state-icon-color);
}

/* =============================================================================
   ICON SECTION (ICON, SHAPE, BADGE)
   ============================================================================= */

.${CARD.htmlStructure.sections.icon.class} {
  --current-shape-size: var(--shape-default-size);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--current-shape-size);
  height: var(--current-shape-size);
  flex-shrink: 0;
}

.type-entities .${CARD.htmlStructure.sections.icon.class} {
  --current-shape-size: var(--entities-shape-size);
}

.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.icon.class} {
  margin-top: unset !important;
}

/* === SHAPE & ICON === */
.${CARD.htmlStructure.elements.shape.class} {
  --current-shape-background-color: color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) var(--shape-opacity), transparent);
  --ha-ripple-hover-opacity: 0.15;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--current-shape-size);
  height: var(--current-shape-size);
  border-radius: 50%;
  background-color: var(--current-shape-background-color);
}

.type-entities .${CARD.htmlStructure.elements.shape.class} {
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
  --current-shape-background-color: transparent;
}

.${CARD.htmlStructure.elements.icon.class},
.custom-icon-img {
  --current-icon-size: var(--icon-default-size);

  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--current-icon-size);
  height: var(--current-icon-size);
}

.progress-badge .${CARD.htmlStructure.sections.icon.class},
.progress-badge .${CARD.htmlStructure.elements.icon.class},
.progress-badge .${CARD.htmlStructure.elements.shape.class},
.progress-badge .custom-icon-img {
  --current-icon-size: 18px;
  --current-shape-size: 18px;
}

.progress-badge .icon ha-state-icon {
  --current-icon-size: 18px;
  --mdc-icon-size: var(--current-icon-size);
  --ha-icon-display: flex;
  height: var(--current-icon-size);
  width: var(--current-icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
}


.${CARD.htmlStructure.elements.icon.class} {
  color: var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));
}

.custom-icon-img {
  border-radius: 50%;
  object-fit: cover;
}

/* =============================================================================
   CONTENT SECTION (TEXT CONTENT)
   ============================================================================= */

.${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height));

  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: var(--current-content-flex-grow);
  flex-shrink: 1;
  width: var(--current-content-width);
  height: var(--current-content-height);
  gap: var(--current-content-gap, 0);
  min-width: 0;
  overflow: hidden;
  position: relative; /* overlay */
}

ha-card.horizontal .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: calc(100% - 56px);
  --current-content-flex-grow: 1;
  --current-content-gap: 0;
}

ha-card.vertical .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
  --current-content-flex-grow: 0;
  --current-content-gap: var(--vertical-gap);
}

ha-card.vertical.default .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height) + var(--progress-size));
}

ha-card.type-entities .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.progress-badge .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: var(--progress-size);
}

.vertical.up-orientation.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-flex-grow: 1;
  --current-content-width: var(--epb-progress-bar-size, 50%);
  --current-content-height: 100%;
}

/* === TEXT ELEMENTS === */

.${CARD.htmlStructure.elements.nameContent.class},
.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  /* flex layout, dimensions, overflow, alignement*/
  display: flex;
  z-index: 1;
  align-items: var(--group-align-items, center);
  justify-content: var(--group-justify-content, flex-start);
  flex-grow: var(--group-flex-grow, initial);
  width: var(--group-width, auto);
  min-width: var(--group-min-width, 0);
  max-width: var(--group-max-width, none);
  height: var(--group-height);
  line-height: var(--group-height); /*fix size*/
  overflow: var(--group-overflow, hidden);
  text-align: var(--group-text-align, left);
  box-sizing: var(--group-box-sizing, content-box);
  margin-left: var(--group-margin-left);
}

.${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--name-height);
}

.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-height: var(--detail-height);
  --group-min-width: 45px;
  --group-max-width: 60%;
}

.progress-badge .${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--ha-font-size-xs);
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
  --group-max-width: unset;
}

ha-card:is(.vertical, .xlarge, .bottom, .top) .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: 100%;
  --group-max-width: 100%;
}

.row-reverse .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
}

.${CARD.layout.orientations.vertical.label} {
  --group-justify-content: center;
  --group-width: 100%;
  --group-max-width: 100%;
  --group-flex-grow: 0;
  --group-text-align: center;
  --group-box-sizing: border-box;
}

.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} {
  --name-height: var(--vertical-name-large-height);
}

.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 7px;
}
.vertical.up-orientation.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 0;
}

.ellipsis-wrapper {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  line-height: 100%;
  width: 100%;
}

.ellipsis-wrapper span {
  display: inline;
}

.${CARD.htmlStructure.elements.nameValue.class},
.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  color: var(--text-color);
  font-size: var(--text-font-size);
  font-weight: var(--text-font-weight);
  height: var(--text-height);
  line-height: var(--text-line-height);
  letter-spacing: var(--text-letter-spacing);
  margin-right: var(--text-margin-right);
  text-shadow: var(--text-shadow);
}

.${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--primary-text-color));
  --text-font-size: var(--epb-name-font-size, var(--ha-font-size-m));
  --text-font-weight: var(--epb-name-font-weight, var(--ha-font-weight-medium));
  --text-height: var(--name-height);
  --text-line-height: var(--name-height);
  --text-letter-spacing: var(--epb-name-letter-spacing, var(--name-letter-spacing));
  --text-margin-right: 0;
}

.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  /* Now a div (see CARD.htmlStructure.elements.secondaryInfoValue): it's the direct
     block-level parent of the extra/main spans, so it - not just the outer
     .ellipsis-wrapper - needs its own single-line ellipsis truncation. */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  --text-color: var(--epb-detail-color, var(--primary-text-color));
  --text-font-size: var(--epb-detail-font-size, var(--ha-font-size-s));
  --text-font-weight: var(--epb-detail-font-weight, var(--ha-font-weight-body));
  --text-height: var(--detail-height);
  --text-line-height: var(--detail-height);
  --text-letter-spacing: var(--epb-detail-letter-spacing, var(--detail-letter-spacing));
  --text-margin-right: 0;
}

.progress-badge .${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--secondary-text-color));
  --text-font-size: var(--ha-font-size-xs);
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: 10px;
  --text-line-height: 10px;
  --text-margin-right: 5px;
  --text-letter-spacing: var(--name-letter-spacing);
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--primary-text-color);
  --text-font-size: var(--ha-badge-font-size, var(--ha-font-size-s));
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: var(--text-font-size);
  --text-line-height: var(--ha-line-height-condensed);
  --text-letter-spacing: var(--name-letter-spacing);
}

.type-entities :is(.${CARD.htmlStructure.elements.nameValue.class}, 
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-height: var(--entities-height);
  --text-font-weight: var(--ha-font-weight-normal);
  --text-line-height: var(--ha-line-height-normal);
}

.type-entities .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--secondary-text-color);
  --text-font-size: var(--ha-font-size-m);
}

.overlay.text-shadow :is(.${CARD.htmlStructure.elements.nameValue.class}, 
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-shadow: 1px 1px 2px var(--card-background-color);
}

/* === SECONDARY INFO === */
.${CARD.htmlStructure.elements.secondaryInfo.class} {
  display: flex;
  flex-direction: var(--current-secondary-info-flex-direction);
  align-items: var(--current-secondary-info-align-items);
  gap: var(--current-secondary-info-gap, var(--spacing));
  width: var(--current-secondary-info-width, auto);
  min-width: var(--current-secondary-info-min-width, auto);
  justify-content: space-between;
}

.secondary-info-wrapper:has(.secondary-info-extra-1:empty):has(.secondary-info-main:empty) {
  display: none;
}

.${CARD.layout.orientations.horizontal.label} {
  --current-secondary-info-flex-direction: var(--secondary-info-row-reverse, row);
  --current-secondary-info-align-items: stretch;
  --current-secondary-info-gap: var(--spacing);
  --current-secondary-info-width: auto;
  --current-secondary-info-min-width: auto;
}

.${CARD.layout.orientations.vertical.label} {
  --current-secondary-info-flex-direction: column;
  --current-secondary-info-align-items: center;
  --current-secondary-info-gap: unset;
  --current-secondary-info-width: 100%;
  --current-secondary-info-min-width: 0;
}

.progress-badge {
  --current-secondary-info-gap: 5px;
}

/* === MULTILINE SECONDARY INFO ===
   Two independent single-line boxes stacked in the wrapper (see
   StructureElements.secondaryInfoLine) instead of one box trying to hold two
   roles at once - each line keeps its own ellipsis truncation via the shared
   .ellipsis-wrapper rules, and neither touches the progress bar's own sizing.
   10px/line (20px total). Rather than growing the card by those extra 4px,
   --name-height gives up the same 4px it doesn't need (name stays single-line,
   never short on room) to --detail-height, so .content-section's own height
   formula (name + detail) is untouched - the card's total height doesn't
   change at all. */
ha-card.info-multiline {
  --name-height: 16px;
  --detail-height: 20px;
}

.info-multiline .secondary-info-wrapper {
  flex-direction: column;
  /* --group-justify-content/--group-align-items, not the properties directly: this is
     the same --group-* indirection .secondary-info-wrapper's own base rule already reads
     (see "flex layout, dimensions, overflow, alignement" above) - overriding the variable
     keeps this a one-line diff against that rule instead of a second, competing source of
     truth for the same properties. */
  --group-justify-content: center;
  --group-align-items: stretch;
  gap: 0;
  /* Without this, mobile/Chromium font-boosting (text autosizing) bumps a small
     declared size up to whatever it judges "readable" for the container width -
     seen in the wild inflating 8px to ~10.5px, which no longer fits the budget. */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.info-multiline .secondary-info-wrapper > .ellipsis-wrapper {
  height: 10px;
  line-height: 0.95;
  margin: 0;
  padding: 0;
}

.info-multiline .secondary-info-wrapper .secondary-info-value {
  --text-height: 10px;
  --text-line-height: 0.95;
  --text-font-size: 10px;
}

.info-multiline .secondary-info-wrapper:has(.secondary-info-extra-1:empty):has(.secondary-info-extra-2:empty):not(:has(.secondary-info-main:not(:empty))) {
  display: none;
}

.info-multiline .secondary-info .bar-container {
  /* .secondary-info stretches its children by default (see --current-secondary-info-align-items
     above) so the bar would otherwise be pulled to the 2-line wrapper's height. */
  align-self: center;
}

/* =============================================================================
   PROGRESS BAR
   ============================================================================= */

/* ==== CONTAINER === */

.${CARD.htmlStructure.elements.progressBar.container.class} {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  height: var(--type-entities-combined-line-height, var(--current-progress-container-height));
}

.overlay .${CARD.htmlStructure.elements.progressBar.container.class} {
  position: absolute;
  width: 100%;
  height: 100%;
}

.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.small.label} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
  max-width: var(--progress-bar-max-width, unset);
}

.horizontal {
  --current-progress-container-height: var(--progress-container-height);
}
.vertical {
  --current-progress-container-height: var(--progress-size);
}

.vertical.xlarge .bar-container {
  margin-top: 23px;
}

/* ==== BAR === */
.${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-radius: var(--ha-standard-border-radius);

  position: relative;
  height: var(--bar-height, var(--progress-size, 100%));
  max-height: var(--bar-max-height, var(--progress-size, 100%));
  width: 100%;
  flex-grow: var(--bar-flex-grow);
  overflow: hidden;
  background-color: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
  border-radius: var(--epb-progress-bar-radius, var(--bar-radius));
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-flex-grow: 0;
}

.overlay .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  --bar-height: 100%;
  --bar-max-height: 100%;
}

/* ==== HALF ZONES (center-zero clipping containers) === */
.${CARD.htmlStructure.elements.progressBar.half.class} {
  position: absolute;
  overflow: hidden;
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class} {
  top: 0;
  bottom: 0;
  width: 50%;
}
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone { left: 0; }
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone { right: 0; }

.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class} {
  left: 0;
  right: 0;
  height: 50%;
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.positive-zone { top: 0; }
.vertical-bar .${CARD.htmlStructure.elements.progressBar.half.class}.negative-zone { bottom: 0; }

/* ==== INNER === */

/* --- Base ---*/
.${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-radius: 0; /* radius value */
  --_r: var(--epb-progress-inner-radius, var(--inner-radius)); /* user choice Vs system value */
  --inner-border-radius: var(--_r); /* schema */

  position: absolute;
  inset: 0;

  background: var(--inner-background);
  border-radius: var(--inner-border-radius);

  transform: var(--inner-transform, translateX(-100%));
  will-change: transform;
  backface-visibility: hidden;
  contain: layout paint;
}

/* --- Animation ---*/
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateX(-100%);
}
.horizontal-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateX(calc((var(--inner-size, 0) - 1) * 100%));
  transition: transform var(--progress-transition);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateY(100%);
}
.vertical-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * 100%));
  transition: transform var(--progress-transition);
}

/*  center zero - positiveInner (right half, grows from center to the right) */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: 0 var(--_r) var(--_r) 0;
}

/* center zero - negativeInner (left half, grows from center to the left) */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateX(100%); /* même direction de masquage qu'à value=0 une fois "ready" */
  --inner-border-radius: var(--_r) 0 0 var(--_r);
}
.center-zero.horizontal-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateX(calc((1 - var(--inner-size, 0)) * 100%));
}

/* --- Vertical --- */
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: var(--_r) var(--_r) 0 0;
}
.vertical-bar.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(-100%); /* même direction de masquage qu'à value=0 une fois "ready" */
  --inner-border-radius: 0 0 var(--_r) var(--_r);
}
.vertical-bar.center-zero.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-transform: translateY(calc((1 - var(--inner-size, 0)) * -100%));
}

/**
 * --- inner size/background (auto-clamped per zone: irrelevant zone resolves to
 * 0) ---
 */
.${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizePos.var}, max(var(${CARD.style.dynamic.progressBar.value.var}, 0), 0));
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect, var(${CARD.style.dynamic.progressBar.stackGradientPos.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}
.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-size: var(${CARD.style.dynamic.progressBar.stackSizeNeg.var}, max(calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1), 0));
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect-neg, var(${CARD.style.dynamic.progressBar.stackGradientNeg.var}, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}))));
}

/* === ORIENTATION === */
.${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  transform: scaleX(-1);
}

/* === SEGMENTED BAR (bar_segments: N) ===
   Discrete blocks (battery cells / signal bars) via a mask on the whole bar:
   both the track and the fill are chopped, so the cells read as real cells.
   The mask uses the element itself as reference (no fixed pixel width needed);
   gap is fixed at 2px inside each 100%/N cell.
   border-radius is forced to 0: the container also clips via border-radius
   (overflow: hidden), and that curve was cutting into the first/last mask
   stripe near the rounded corner — a cell there looked truncated compared to
   the others. Flush ends read like real battery/signal-bar hardware anyway. */
.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  border-radius: 0;
  -webkit-mask-image: repeating-linear-gradient(
    to right,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
  mask-image: repeating-linear-gradient(
    to right,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
}

.vertical-bar.bar-segmented .${CARD.htmlStructure.elements.progressBar.bar.class} {
  -webkit-mask-image: repeating-linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
  mask-image: repeating-linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10) - 2px),
    transparent calc(100% / var(--bar-segments, 10))
  );
}

/**
 * === ICON ANIMATION (icon_animation:
 * spin|pulse|bounce|shake|ping|reveal|washing_machine|battery_charging;
 * battery_charging triggers on a charging attribute, the rest on active
 * state) ===
 */
@keyframes epb-icon-spin {
  to { transform: rotate(360deg); }
}

@keyframes epb-icon-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}

@keyframes epb-icon-bounce {
  0% { transform: scale3d(1, 1, 1); }
  7% { transform: scale3d(1.25, 0.75, 1); }
  10% { transform: scale3d(0.75, 1.25, 1); }
  12% { transform: scale3d(1.15, 0.85, 1); }
  16% { transform: scale3d(0.95, 1.05, 1); }
  19% { transform: scale3d(1.05, 0.95, 1); }
  25% { transform: scale3d(1, 1, 1); }
}

@keyframes epb-icon-shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(0.4px, -0.4px) rotate(-4deg); }
  40% { transform: translate(-0.4px, 0.4px) rotate(4deg); }
  60% { transform: translate(0.4px, 0.4px) rotate(-4deg); }
  80% { transform: translate(-0.4px, -0.4px) rotate(4deg); }
}

/**
 * ring bursts from the shape's own border, using the same icon/shape color as
 * everywhere else
 */
@keyframes epb-icon-ping {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

@keyframes epb-icon-reveal {
  0% { clip-path: circle(0% at 50% 85%); }
  20% { clip-path: circle(30% at 50% 85%); }
  40% { clip-path: circle(55% at 50% 85%); }
  60% { clip-path: circle(80% at 50% 85%); }
}

/* porthole wipe, mid-cycle only - the implicit 0%/100% (no clip-path, icon
   fully visible) is the resting frame; paired with epb-icon-shake (already
   defined above) on .icon-anim-washing-machine for the drum-spin look */
@keyframes epb-icon-drum {
  50% {
    clip-path: polygon(0 0, 0 100%, 35% 100%, 34% 68%, 60% 41%, 71% 56%, 65% 74%, 47% 79%, 32% 69%, 35% 100%, 100% 100%, 100% 0);
  }
}

/* battery-bolt fill wipe: a clip-path window sliding down the icon, repeating
   - the 80%-100% hold is the pause between charge sweeps
   - the bolt's x-edges are CSS vars (--epb-charge-x1/x2, default 34%/67%) so
     .icon-anim-battery-charging-shifted can compensate for icon variants
     (battery-charging-*, battery-bluetooth-*) whose glyph isn't centered the
     same way the plain battery outline is - see ViewCore.isBatteryIconShifted */
@keyframes epb-icon-charge {
  0%, 80% { clip-path: inset(0 0 0 0); }
  10% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 89%, var(--epb-charge-x1, 34%) 89%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  20% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 79%, var(--epb-charge-x1, 34%) 79%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  30% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 69%, var(--epb-charge-x1, 34%) 69%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  40% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 59%, var(--epb-charge-x1, 34%) 59%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  50% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 49%, var(--epb-charge-x1, 34%) 49%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  60% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 39%, var(--epb-charge-x1, 34%) 39%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  70% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x2, 67%) 29%,
      var(--epb-charge-x2, 67%) 29%, var(--epb-charge-x1, 34%) 29%, var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
}

.icon-anim-spin .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-spin 2s linear infinite;
}

.icon-anim-pulse .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-pulse 1.6s ease-in-out infinite;
}

.icon-anim-bounce .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-bounce 3s ease infinite;
  transform-origin: 50% 90%;
}

.icon-anim-shake .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 800ms ease-in-out infinite;
  transform-origin: 50% 110%;
}

.icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
  animation: epb-icon-ping 2s infinite;
}

.icon-anim-washing-machine .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 400ms ease-in-out infinite, epb-icon-drum 2s ease infinite;
  transform-origin: 50% 110%;
}

.icon-anim-reveal .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-reveal 2s steps(1) infinite;
}

.icon-anim-battery-charging .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-charge 3s linear infinite;
}

/* Placeholder offset for battery-charging/battery-bluetooth icon variants -
   needs live tuning against the actual glyph, see ViewCore.isBatteryIconShifted */
.icon-anim-battery-charging-shifted .${CARD.htmlStructure.elements.icon.class} {
  --epb-charge-x1: 17%;
  --epb-charge-x2: 50%;
}

/* === ALERT (alert_when: {above/below, color, highlight, animation}) ===
   highlight: border (default) colors the border; background tints the card
   background instead and leaves the border neutral.
   animation: static (no motion) / blink (pulse) / ping (border ring burst,
   border target only - see ViewCore.alertAnimation for the background
   fallback). Omitting it keeps the pre-1.6 defaults: blink for border,
   static for background.
   The global prefers-reduced-motion block (animation-iteration-count: 1)
   stops blink/ping after a single, near-instant pass; the border/background
   base color from .alert-active(.alert-background) remains, so the alert
   stays visible without the motion. */
@keyframes epb-alert-border {
  0%, 100% { border-color: var(--alert-color-final); }
  50% { border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0))); }
}

@keyframes epb-alert-background {
  0%, 100% { background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color))); }
  50% { background-color: var(--ha-card-background, var(--card-background-color)); }
}

/* ring bursts from the card's own border, reusing the epb-icon-ping technique */
@keyframes epb-alert-ping {
  60% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
  100% { box-shadow: 0 0 5px 15px transparent; }
}

.alert-active {
  --alert-color-final: var(--alert-color, var(--error-color, #db4437));
  border-color: var(--alert-color-final);
}

.alert-active.alert-anim-blink {
  animation: epb-alert-border 1.2s ease-in-out infinite;
}

.alert-active.alert-anim-ping {
  animation: epb-alert-ping 1.5s ease-out infinite;
}

.alert-active.alert-background {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color)));
}

.alert-active.alert-background.alert-anim-blink {
  animation: epb-alert-background 1.2s ease-in-out infinite;
}

/* === RADIUS EFFECT === */
/* positiveInner / negativeInner */
.entity-progress-feature
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: var(--feature-border-radius);
  --inner-radius: var(--feature-border-radius);
}

/* positiveInner / negativeInner */
:is(.top-container, .bottom-container)
  :is(.${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --bar-radius: 0;
  --inner-radius: 0;
}

/* positiveInner / negativeInner */
.${CARD.style.dynamic.progressBar.effect.radius.class}
  :is(.${CARD.htmlStructure.elements.progressBar.inner.class}) {
  --inner-radius: var(--ha-standard-border-radius);
}

/* === VARIANTS === */
/* ----- glass ----- */
.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(270deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.glass.class} {
  --progress-effect: linear-gradient(0deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  --progress-effect-neg: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

/* ----- gradient / gradient-reverse ----- */
.${CARD.style.dynamic.progressBar.effect.gradient.class},
.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: linear-gradient(
    90deg,
    color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
    var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
  );
  --progress-effect-gradient-rev: linear-gradient(
    270deg,
    color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
    var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
  );
}

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradient.class},
.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect-gradient: linear-gradient(
    0deg,
    color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
    var(--progress-bar-color, var(--state-icon-color))
  );
  --progress-effect-gradient-rev: linear-gradient(
    180deg,
    color-mix(in srgb, white 40%, var(--progress-bar-color, var(--state-icon-color))),
    var(--progress-bar-color, var(--state-icon-color))
  );
}

.${CARD.style.dynamic.progressBar.effect.gradient.class} {
  --progress-effect: var(--progress-effect-gradient);
  --progress-effect-neg: var(--progress-effect-gradient-rev);
}

.${CARD.style.dynamic.progressBar.effect.gradientReverse.class} {
  --progress-effect: var(--progress-effect-gradient-rev);
  --progress-effect-neg: var(--progress-effect-gradient);
}

/* ----- gradient/glass: ::before compositor-only scale (no background-size repaint) -----
   .inner translates (GPU). ::before carries the gradient and scales via transform-origin,
   also GPU. Both share the same --progress-transition so they stay in perfect sync.
   .inner background is cleared to solid so the gradient doesn't double-render.          */

/* --- .inner background under the ::before layer ---
   gradient/gradient-reverse: opaque gradient on ::before → solid color underneath (no seams).
   glass: the effect IS a translucent white gradient over the track → .inner must stay
   transparent, otherwise the solid color underneath washes the effect out entirely. */
.horizontal-bar:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.vertical-bar:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
}

.horizontal-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative,
.vertical-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
}

.horizontal-bar.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.vertical-bar.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.horizontal-bar.center-zero.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative,
.vertical-bar.center-zero.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-background: transparent;
}

/* --- Horizontal positive: gradient on ::before, scaleX from right --- */
.horizontal-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect));
  transform-origin: right center;
  transform: scaleX(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Horizontal center-zero negative: gradient on ::before, scaleX from left
 * ---
 */
.horizontal-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: left center;
  transform: scaleX(var(--inner-size, 0));
  will-change: transform;
}

/* --- Vertical positive: gradient on ::before, scaleY from top --- */
.vertical-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect));
  transform-origin: center top;
  transform: scaleY(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Vertical center-zero negative: gradient on ::before, scaleY from bottom
 * ---
 */
.vertical-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--epb-progress-bar-color, var(--progress-effect-neg));
  transform-origin: center bottom;
  transform: scaleY(var(--inner-size, 0));
  will-change: transform;
}

/**
 * --- Transition: sync ::before scale with .inner translate (transition-ready
 * only) ---
 */
.horizontal-bar.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.horizontal-bar.center-zero.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  transition: transform var(--progress-transition);
}

.vertical-bar.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive::before,
.vertical-bar.center-zero.transition-ready:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative::before {
  transition: transform var(--progress-transition);
}

/* ----- shimmer / shimmer-reverse ----- */
.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class},
.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  overflow: hidden;
  position: absolute;
}

.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class}::after,
.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} .${CARD.htmlStructure.elements.progressBar.inner.class}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(var(--shimmer-direction, 90deg), transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: var(--shimmer-animation) 2s infinite;
  will-change: transform;
}

/* horizontales */
.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-ltr;
}

.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 90deg;
  --shimmer-animation: shimmer-rtl;
}

/* verticales */
.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.shimmer.class} {
  --shimmer-direction: 0deg;
  --shimmer-animation: shimmer-btt;
}

.vertical.up-orientation.${CARD.style.dynamic.progressBar.effect.shimmerReverse.class} {
  --shimmer-direction: 0deg;
  --shimmer-animation: shimmer-ttb;
}

@keyframes shimmer-ltr {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shimmer-rtl {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes shimmer-btt {
  0% { transform: translateY(100%); }
  100% { transform: translateY(-100%); }
}

@keyframes shimmer-ttb {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =============================================================================
   WATERMARKS
   ============================================================================= */

/* low, high, center */
.mark {
  display: var(--mark-display, none);
  position: absolute;
  box-sizing: border-box;
  opacity: var(--epb-watermark-opacity, var(--watermark-opacity-value, 0.8));

  top: var(--mark-top, 0); /* Horizontal */
  bottom: var(--mark-bottom, auto);
  left: var(--mark-left, auto);
  right: var(--mark-right, auto);
  width: var(--mark-width, 100%);
  height: var(--mark-height, 100%);

  background: var(--mark-background);
}

.vertical.up-orientation.overlay .mark {
  --mark-top: auto;
  --mark-bottom: 0;
  --mark-left: 0;
  --mark-width: 100%;
}

/* --- ZERO MARK -- */
.${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  --mark-display: flex;
  --mark-width: var(--epb-zero-mark-width, 1px);
  --mark-left: 50%;
  --mark-background: var(--epb-zero-mark-color, white);
}

.vertical.up-orientation.overlay .${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  --mark-height: var(--epb-zero-mark-width, 1px);
  --mark-top: 50%;
}

/* --- Base watermark styles ---*/
.watermark {
  --wm-line-size: var(--epb-watermark-line-size, var(--watermark-line-size, 1px));
  --wm-circle-size: var(--watermark-circle-size, 5px);
  --wm-tri-size: var(--watermark-triangle-size, 8px);
  --wm-half-line: calc(var(--wm-line-size) /2);
  --wm-half-circle: calc(var(--wm-circle-size) / 2);
  --wm-half-tri: calc(var(--wm-tri-size) / 2);
}
.${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --wm-value: var(--low-watermark-value, 20%);
  --wm-color: var(--epb-low-watermark-color, var(--low-watermark-color, var(--red-color)));
}
.${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-value: var(--high-watermark-value, 80%);
  --wm-color: var(--epb-high-watermark-color, var(--high-watermark-color, var(--red-color)));
}
:is(.lwm-area, .lwm-blended, .lwm-line, .lwm-round) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
:is(.hwm-area, .hwm-blended, .hwm-line, .hwm-round) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-background: var(--wm-color);
}

/* ---------- show ---------- */
.show-lwm .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.show-hwm .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-display: flex;
}

/* ---------- Area, Blended, Striped positioning ---------- */
:is(.lwm-area, .lwm-blended, .lwm-striped) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-left: 0;
  --mark-width: var(--wm-value);
}
:is(.hwm-area, .hwm-blended, .hwm-striped) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-right: 0;
  --mark-width: calc(100% - var(--wm-value));
}

.vertical.up-orientation.overlay:is(.lwm-area, .lwm-blended, .lwm-striped) .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-height: var(--wm-value);
}
.vertical.up-orientation.overlay:is(.hwm-area, .hwm-blended, .hwm-striped) .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-bottom: var(--wm-value);
  --mark-height: calc(100% - var(--wm-value));
}

/* ---------- Blended ---------- */
.lwm-blended .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-blended .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  mix-blend-mode: hard-light;
}

/* ---------- Striped ---------- */
.lwm-striped .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-striped .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-background: repeating-linear-gradient(-45deg,
    var(--wm-color) 0,
    var(--wm-color) 3px,
    transparent 3px, transparent 6px);
}

/* ---------- Line ---------- */
.lwm-line .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-line .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --wm-position: calc(var(--wm-value) - var(--wm-half-line));
  --mark-width: var(--wm-line-size);
  --mark-left: var(--wm-position);
  border: none;
  transform: none;
}
.vertical.up-orientation.overlay.lwm-line .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-line .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-height: var(--wm-line-size);
  --mark-bottom: var(--wm-position);
}

/* ---------- Round ---------- */
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-top: 50%;
  --mark-width: var(--wm-circle-size);
  --mark-height: var(--wm-circle-size);
  transform: translateY(-50%);
  border-radius: 50%;
  border: none;
}
.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-circle));
}
.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-circle));
}
.vertical.up-orientation.overlay.lwm-round .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-round .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: 50%;
  --mark-right: auto;
  --mark-top: auto;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-circle));
  --mark-width: var(--wm-circle-size);
  transform: translateX(-50%);
}

/* ---------- Triangle ---------- */
.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: calc(var(--wm-value) - var(--wm-half-tri));
  --mark-width: 0;
  --mark-height: 0;
  --mark-background: transparent;
  border-top: var(--wm-tri-size) solid var(--wm-color);
  border-left: var(--wm-half-tri) solid transparent;
  border-right: var(--wm-half-tri) solid transparent;
}
.vertical.up-orientation.overlay.lwm-triangle .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
.vertical.up-orientation.overlay.hwm-triangle .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  --mark-left: 0;
  --mark-bottom: calc(var(--wm-value) - var(--wm-half-tri));
  border-right: none;
  border-top: var(--wm-half-tri) solid transparent;
  border-left: var(--wm-tri-size) solid var(--wm-color);
  border-bottom: var(--wm-half-tri) solid transparent;
}

/* =============================================================================
   BADGE
   ============================================================================= */

.${CARD.htmlStructure.elements.badge.container.class} {
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 2;
  top: var(--badge-offset);
  right: var(--badge-offset);
  inset-inline-end: var(--badge-offset);
  inset-inline-start: initial;
  width: var(--badge-size);
  height: var(--badge-size);
  border-radius: 50%;
  background-color: var(${CARD.style.dynamic.badge.backgroundColor.var}, ${CARD.style.dynamic.badge.backgroundColor.default});
}

.${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.icon.class} {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-icon-size);
  height: var(--badge-icon-size);
  color: var(${CARD.style.dynamic.badge.color.var}, ${CARD.style.dynamic.badge.color.default});
}

/* =============================================================================
   VISIBILITY CONTROLS
   ============================================================================= */

.${CARD.style.dynamic.hiddenComponent.icon.class} :is(.${CARD.htmlStructure.sections.icon.class}, .${CARD.htmlStructure.elements.shape.class}),
.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.elements.nameContent.class},
.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.elements.secondaryInfoWrapper.class},
.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class},
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class} ha-ripple {
  display: none;
}

/* Shape transparency when hidden */
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class} {
  background-color: transparent;
}

/* Show elements when needed */
.${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.container.class} {
  display: flex;
}

/* =============================================================================
   INTERACTIVE STATES
   ============================================================================= */
.${CARD.style.dynamic.clickable.card}:hover,
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.icon.class}:hover {
  cursor: pointer;
}

/* Suppress card-level ripple when card has no action */
${CARD.htmlStructure.card.element}:not(.${CARD.style.dynamic.clickable.card}) {
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
}

/* Suppress shape/icon ripple when icon has no action */
${CARD.htmlStructure.card.element}:not(.${CARD.style.dynamic.clickable.icon}) .${CARD.htmlStructure.elements.shape.class} {
  --ha-ripple-hover-opacity: 0;
  --ha-ripple-pressed-opacity: 0;
}

/* =============================================================================
   single line
   ============================================================================= */
.overlay.single-line {
  --group-max-width: 100%;
  --group-width: 100%;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
}

.overlay.single-line .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-max-width: none;
  margin-right: 7px;
}

/* =============================================================================
   TRANSFORMATION VERTICALE - ORIENTATION DU BAS VERS LE HAUT
   ============================================================================= */

.vertical.up-orientation .container {
  height: 100%;
}

/* === prefers-reduced-motion === */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
`;

/******************************************************************************
 * 📦 Test utils
 ******************************************************************************/

const is = {
  nullish: (val) => val == null, // null or undefined
  boolean: (val) => typeof val === 'boolean',
  string: (val) => typeof val === 'string',
  emptyString: (val) => typeof val === 'string' && val.trim() === '',
  nonEmptyString: (val) => typeof val === 'string' && val.trim() !== '',
  nullishOrEmptyString: (val) => val == null || (typeof val === 'string' && val.trim() === ''),
  // lax: '42 W' → true (leading number is extracted by callers)
  numericString: (val) => typeof val === 'string' && val.trim() !== '' && !isNaN(parseFloat(val)),
  // CF5 - issue (minor) resolved - the lax variant accepts '42abc'; the strict
  // one rejects any string that is not entirely a finite number ('42abc',
  // 'Infinity', …)
  strictNumericString: (val) => typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val)),
  number: (val) => Number.isFinite(val),
  // CF5 - issue (minor) resolved - renamed from is.integer: the name hid the
  // val >= 0 constraint and invited misuse for signed integers
  unsignedInteger: (val) => typeof val === 'number' && Number.isInteger(val) && val >= 0,
  func: (val) => typeof val === 'function',
  object: (val) => typeof val === 'object',
  plainObject: (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
  array: (val) => Array.isArray(val),
  nonEmptyArray: (val) => Array.isArray(val) && val.length > 0,
  nonEmptySet: (val) => val instanceof Set && val.size > 0,
  jinja: (val) => {
    if (typeof val !== 'string') return false;
    const jinjaPattern = /({{.*?}}|{#.*?#}|{%.+?%})/s;
    return jinjaPattern.test(val);
  },
};

const has = {
  own: (obj, key) => Object.hasOwn(obj, key),
  method: (obj, key) => typeof obj?.[key] === 'function',
  validKey: (obj, key) => typeof key === 'string' && key !== '' && has.own(obj, key),
};

/******************************************************************************
 * 📦 Logging utils
 ******************************************************************************/

/******************************************************************************
 * 🛠️ Logger
 */

const Logger = {
  create(name, level = SEV.debug) {
    const levels = { error: 0, warning: 1, info: 2, debug: 3 };
    const currentLevel = levels[level] || 3;

    const shouldLog = (logLevel) => levels[logLevel] <= currentLevel;

    const loggerInstance = {
      name,
      level,

      debug: (msg, data) =>
        shouldLog(SEV.debug) && console.debug(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      info: (msg, data) =>
        shouldLog(SEV.info) && console.info(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      warning: (msg, data) =>
        shouldLog(SEV.warning) && console.warn(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      error: (msg, data) =>
        shouldLog(SEV.error) && console.error(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),

      wrap: (fn, fnName) => {
        const isAsync = fn.constructor.name === 'AsyncFunction';

        const logStart = () => shouldLog(SEV.debug) && console.debug(`[${name}] 👉 ${fnName}`);
        const logSuccess = (start) =>
          shouldLog(SEV.debug) && console.debug(`[${name}] ✅ ${fnName} (${(performance.now() - start).toFixed(2)}ms)`);
        const logError = (start, error) =>
          shouldLog(SEV.error) &&
          console.error(`[${name}] ❌ ${fnName} failed (${(performance.now() - start).toFixed(2)}ms)`, error);

        if (isAsync) {
          return async (...args) => {
            logStart();
            const start = performance.now();
            try {
              const result = await fn(...args);
              logSuccess(start);
              return result;
            } catch (error) {
              logError(start, error);
              throw error;
            }
          };
        } else {
          return (...args) => {
            logStart();
            const start = performance.now();
            try {
              const result = fn(...args);
              logSuccess(start);
              return result;
            } catch (error) {
              logError(start, error);
              throw error;
            }
          };
        }
      },

      wrapAll: (ctx, methodNames) => {
        methodNames.forEach((method) => {
          if (has.method(ctx, method)) {
            ctx[method] = loggerInstance.wrap(ctx[method].bind(ctx), method);
          }
        });
      },

      state: (label, hass, config) => {
        if (!shouldLog(SEV.debug)) return;
        console.debug(`[${name}] 📊 ${label}`, {
          hasHass: Boolean(hass),
          hasConfig: Boolean(config),
          entities: config?.entities?.length || 0,
          connected: document.body.contains ? 'unknown' : 'checking',
        });
      },
    };

    return loggerInstance;
  },
};

function initLogger(ctx, debugFlag, methodNames = []) {
  const className = ctx.constructor.name;
  const logger = Logger.create(className, debugFlag ? SEV.debug : SEV.info);

  if (debugFlag) {
    logger.wrapAll(ctx, methodNames);
    logger.debug(`${className} initialized`);
  }

  return logger;
}

/******************************************************************************
 * 📦 Components registration
 ******************************************************************************/

/******************************************************************************
 * 🛠️ RegistrationHelper
 * ============================================================================
 *
 * ✅ Helper to register component.
 *
 * @class
 */
class RegistrationHelper {
  static _devMode = CARD_CONTEXT.dev;
  static #targetKey = {
    customCards: 'customCards',
    customBadges: 'customBadges',
    customCardFeatures: 'customCardFeatures',
  };

  static #resolveComponent(component) {
    if (!RegistrationHelper._devMode) return component;
    return {
      ...component,
      typeName: `${component.typeName}-dev`,
      name: `${component.name} (dev)`,
      editor: component.editor ? `${component.editor}-dev` : undefined,
    };
  }
  static #resolveEntry(component, targetKey) {
    return targetKey === RegistrationHelper.#targetKey.customCardFeatures
      ? { type: component.typeName, name: component.name, supported: () => true }
      : {
          type: component.typeName,
          name: component.name,
          preview: true,
          description: component.description,
          documentationURL: META.documentation,
          version: VERSION,
        };
  }
  static #registerComponent(component, targetKey, elementClass, editorClass) {
    try {
      // On tente l'enregistrement technique
      if (!customElements.get(component.typeName)) customElements.define(component.typeName, elementClass);
      if (editorClass && component.editor && !customElements.get(component.editor))
        customElements.define(component.editor, editorClass);
    } catch (error) {
      // Si ça échoue (déjà défini), on log mais on ne bloque pas la suite
      console.warn(`[Entity Progress Card] Registration alert: ${error.message}`);
    }

    // Le reste du code est protégé
    const registerUI = () => {
      try {
        window[targetKey] = window[targetKey] || [];
        if (window[targetKey].some((item) => item.type === component.typeName)) return;
        window[targetKey].push(RegistrationHelper.#resolveEntry(component, targetKey));
      } catch (uiError) {
        console.error('[Entity Progress Card] UI Registration failed', uiError);
      }
    };

    setTimeout(registerUI, 1000);
  }

  static registerCard(card, elementClass, editorClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(card),
      RegistrationHelper.#targetKey.customCards,
      elementClass,
      editorClass,
    );
  }

  static registerBadge(badge, elementClass, editorClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(badge),
      RegistrationHelper.#targetKey.customBadges,
      elementClass,
      editorClass,
    );
  }

  static registerCardFeature(cardFeature, elementClass) {
    RegistrationHelper.#registerComponent(
      RegistrationHelper.#resolveComponent(cardFeature),
      RegistrationHelper.#targetKey.customCardFeatures,
      elementClass,
    );
  }
}

/******************************************************************************
 * 📦 CARD LIB
 ******************************************************************************/

const CONTENT_SLOT = '{{content}}';

const VALUE_CHANGED_EVENT = 'value-changed';
const HA_SELECTOR_TAG = 'ha-selector';
const HA_SVG_ICON_TAG = 'ha-svg-icon';
const HA_ACTION_HANDLER_TAG = 'action-handler';
const EDITOR_FIELD_NS = 'editor.field';
const MIN_VALUE_ENTITY_PATH = 'min_value.entity';
const MAX_VALUE_ENTITY_PATH = 'max_value.entity';

const Element = (obj, extraClass = '') => {
  const className = `${obj.class} ${extraClass}`.trim();
  const renderAttrs = (attrsObj = {}) =>
    Object.entries(attrsObj)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

  return {
    tag: obj.element,
    class: className,
    html: (content = '', attrs = {}) => {
      const allAttrs = { ...(obj.id ? { id: obj.id } : {}), ...(obj.extraAttr || {}), ...attrs };
      return `<${obj.element} class="${className}" ${renderAttrs(allAttrs)}>${content}</${obj.element}>`;
    },
  };
};

const StructureElements = {
  ripple: () => '<ha-ripple></ha-ripple>',
  container: (options) =>
    StructureElements.ripple() + Element(CARD.htmlStructure.sections.container, options.layout).html(CONTENT_SLOT),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html(CONTENT_SLOT),
  topContainer: () => Element(CARD.htmlStructure.sections.topContainer).html(CONTENT_SLOT),
  backgroundContainer: () => Element(CARD.htmlStructure.sections.backgroundContainer).html(CONTENT_SLOT),
  bottomContainer: () => Element(CARD.htmlStructure.sections.bottomContainer).html(CONTENT_SLOT),

  iconAndShape: () =>
    Element(CARD.htmlStructure.elements.shape).html(
      StructureElements.ripple() + Element(CARD.htmlStructure.elements.icon).html(),
    ),
  badge: () =>
    Element(CARD.htmlStructure.elements.badge.container).html(Element(CARD.htmlStructure.elements.badge.icon).html()),
  nameContent: (minimal = false) =>
    Element(CARD.htmlStructure.elements.nameContent).html(
      Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
        Element(CARD.htmlStructure.elements.nameValue).html(
          Element(CARD.htmlStructure.elements.nameMain).html() +
            (minimal ? '' : Element(CARD.htmlStructure.elements.nameExtra).html()),
        ),
      ),
    ),
  // One line of a multiline secondary-info block: line 1 is always extra-only
  // (never a main, whatever the caller passes); line 2 adds the main span only
  // when this card type actually has one (card/badge: yes, template: no slot at
  // all - see StructureElements.secondaryInfoWrapperMinimal).
  secondaryInfoLine: (index, hasMain) => {
    const extraEl =
      index === 1 ? CARD.htmlStructure.elements.secondaryInfoExtra : CARD.htmlStructure.elements.secondaryInfoExtra2;
    const showMain = index === 2 && hasMain;
    return Element(CARD.htmlStructure.elements.ellipsisWrapper, `secondary-info-line-${index}`).html(
      Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
        Element(extraEl).html() + (showMain ? Element(CARD.htmlStructure.elements.secondaryInfoMain).html() : ''),
      ),
    );
  },

  secondaryInfoWrapperMultiline: (hasMain) =>
    Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
      StructureElements.secondaryInfoLine(1, hasMain) + StructureElements.secondaryInfoLine(2, hasMain),
    ),

  secondaryInfoWrapper: (options = {}) =>
    options.multiline
      ? StructureElements.secondaryInfoWrapperMultiline(true)
      : Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
          Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
            Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
              Element(CARD.htmlStructure.elements.secondaryInfoExtra).html() +
                Element(CARD.htmlStructure.elements.secondaryInfoMain).html(),
            ),
          ),
        ),

  secondaryInfoWrapperMinimal: (options = {}) =>
    options.multiline
      ? StructureElements.secondaryInfoWrapperMultiline(false)
      : Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
          Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
            Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
              Element(CARD.htmlStructure.elements.secondaryInfoExtra).html(),
            ),
          ),
        ),

  progressBar: (options) => {
    const extraClass = options.barPosition === 'overlay' ? 'overlay' : '';
    const isCenterZero = options.barType === 'centerZero';
    const marks =
      Element(CARD.htmlStructure.elements.progressBar.lowWatermark, 'watermark mark').html() +
      Element(CARD.htmlStructure.elements.progressBar.highWatermark, 'watermark mark').html() +
      (isCenterZero ? Element(CARD.htmlStructure.elements.progressBar.zeroMark, 'mark').html() : '');

    const innerHtml = isCenterZero
      ? Element(CARD.htmlStructure.elements.progressBar.half, 'negative-zone').html(
          Element(CARD.htmlStructure.elements.progressBar.inner, 'negative').html(),
        ) +
        Element(CARD.htmlStructure.elements.progressBar.half, 'positive-zone').html(
          Element(CARD.htmlStructure.elements.progressBar.inner, 'positive').html(),
        ) +
        marks
      : Element(CARD.htmlStructure.elements.progressBar.inner, 'positive').html() + marks;

    return Element(CARD.htmlStructure.elements.progressBar.container, extraClass).html(
      Element(
        CARD.htmlStructure.elements.progressBar.bar,
        isCenterZero ? CARD.style.dynamic.progressBar.centerZero.class : 'default',
      ).html(innerHtml),
      isCenterZero ? { 'aria-valuemin': '-100' } : {},
    );
  },

  createSecondaryInfo: (options, secondaryInfoWrapperFn) => {
    const { layout, barPosition } = options;
    const excludedPositions = ['top', 'bottom', 'below', 'overlay', 'background'];
    const excludedLayouts = ['vertical'];

    let content = secondaryInfoWrapperFn(options);

    if (!excludedPositions.includes(barPosition) && !excludedLayouts.includes(layout)) {
      content += StructureElements.progressBar(options);
    }

    return Element(CARD.htmlStructure.elements.secondaryInfo).html(content);
  },

  secondaryInfo: (options) => StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapper),

  secondaryInfoMinimal: (options) =>
    StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapperMinimal),

  createContent: (options, rightContent) => {
    const isOverlay = options.barPosition === 'overlay';
    const isSingleLine = options.barSingleLine;
    const isVertical = options.layout === 'vertical';
    const isBelowTopOrBottom = ['below', 'top', 'bottom', 'background'].includes(options.barPosition);

    const extraClass = (isOverlay ? ' overlay' : '') + (isSingleLine ? ' single-line' : '');
    const before = isOverlay ? StructureElements.progressBar(options) : '';
    const after = !isOverlay && !isBelowTopOrBottom && isVertical ? StructureElements.progressBar(options) : '';
    const content = before + rightContent + after;

    return Element(CARD.htmlStructure.sections.content, extraClass).html(content);
  },

  contentFull: (options) =>
    StructureElements.createContent(
      options,
      StructureElements.nameContent() + StructureElements.secondaryInfo(options),
    ),
  contentMini: (options) =>
    StructureElements.createContent(
      options,
      StructureElements.nameContent(true) + StructureElements.secondaryInfoMinimal(options),
    ),

  iconSection: () =>
    Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape() + StructureElements.badge()),
  iconSectionWoBadge: () => Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape()),

  trendIndicator: (options) =>
    options.trendIndicator
      ? Element(CARD.htmlStructure.elements.trendIndicator.container).html(
          Element(CARD.htmlStructure.elements.trendIndicator.icon).html(),
        )
      : '',

  wrapWithBarPosition: (content, options) => {
    const { barPosition } = options;
    const bar = () => StructureElements.progressBar(options);

    const wrap = {
      top: () => ({ before: StructureElements.topContainer().replace(CONTENT_SLOT, bar()), after: '' }),
      bottom: () => ({ before: '', after: StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()) }),
      below: () => ({ before: '', after: StructureElements.belowContainer().replace(CONTENT_SLOT, bar()) }),
      background: () => ({ before: '', after: StructureElements.backgroundContainer().replace(CONTENT_SLOT, bar()) }),
    };

    const { before = '', after = '' } = wrap[barPosition]?.() ?? {};

    return before + content + after;
  },
};

const StructureTemplates = {
  card: (options = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.iconSection() +
          StructureElements.contentFull(options),
      ),
      options,
    );
  },

  badge: (options = {}) => {
    return StructureElements.container(options).replace(
      CONTENT_SLOT,
      StructureElements.iconSectionWoBadge() + StructureElements.contentFull(options),
    );
  },

  template: (options = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.iconSection() +
          StructureElements.contentMini(options),
      ),
      options,
    );
  },
  feature: (options = {}) => {
    const { barPosition } = options;
    const bar = () => StructureElements.progressBar(options);

    const containers = {
      top: () => StructureElements.topContainer().replace(CONTENT_SLOT, bar()),
      bottom: () => StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()),
    };

    return containers[barPosition]?.() ?? bar();
  },
};

class ObjStructure {
  // CF5 - issue (perf) resolved - card.innerHTML re-parsed the full HTML string
  // on every render (each card creation, each editor keystroke). The structure
  // is now built once per unique option set into a <template> and cloned
  // (~5-10x faster than parsing). The DOM depends on the config's structure
  // options (barType, barPosition, layout, ...), so the cache is keyed on the
  // exact options object: any setConfig producing different structure options
  // gets its own template, identical configs share one.
  #templates = new Map();

  constructor(cardType) {
    this._cardType = cardType;
  }

  render(options = {}) {
    return StructureTemplates[this._cardType](options);
  }

  clone(options = {}) {
    // Options are small flat objects of primitives built in a fixed key order
    // by each class's _structureOptions getter -> JSON is a stable cache key.
    // The option space is bounded (a handful of enums/booleans), so is the
    // cache.
    const key = JSON.stringify(options);
    let tpl = this.#templates.get(key);
    if (!tpl) {
      tpl = document.createElement('template');
      tpl.innerHTML = this.render(options);
      this.#templates.set(key, tpl);
    }
    return tpl.content.cloneNode(true);
  }
}

/******************************************************************************
 * 🛠️ NumberFormatter
 * ============================================================================
 *
 * ✅ class for formatting value && unit.
 *
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate
 * its internal data.
 *
 * @class
 */
class NumberFormatter {
  static unitsNoSpace = {
    'fr-FR': new Set(['j', 'd', 'h', 'min', 'ms', 'μs', '°']),
    'de-DE': new Set(['d', 'h', 'min', 'ms', 'μs', '°']),
    'en-US': new Set(['d', 'h', 'min', 'ms', 'μs', '°', '%']),
  };

  static getSpaceCharacter(locale, unit) {
    const set = NumberFormatter.unitsNoSpace[locale] || NumberFormatter.unitsNoSpace['en-US'];
    return set.has(unit.toLowerCase()) ? '' : CARD.config.unit.space;
  }

  static formatValueAndUnit(
    value,
    decimal = 2,
    unit = '',
    locale = 'en-US',
    unitSpacing = CARD.config.unit.unitSpacing.auto,
  ) {
    if (is.nullish(value)) return '';

    const formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
      useGrouping: locale !== 'en',
    }).format(value);

    if (!unit) return formattedValue;

    const spaceMap = {
      space: CARD.config.unit.space,
      'no-space': '',
      auto: () => NumberFormatter.getSpaceCharacter(locale, unit),
    };
    const space = has.method(spaceMap, unitSpacing) ? spaceMap[unitSpacing]() : spaceMap[unitSpacing];

    return `${formattedValue}${space}${unit}`;
  }
  static formatTiming(
    totalSeconds,
    decimal = 0,
    locale = 'en-US',
    flex = false,
    unitSpacing = CARD.config.unit.unitSpacing.auto,
  ) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = (totalSeconds % 60).toFixed(decimal);

    const pad = (value, length = 2) => String(value).padStart(length, '0');

    const [intPart, decimalPart] = seconds.split('.');
    seconds = decimalPart !== undefined ? `${pad(intPart)}.${decimalPart}` : pad(seconds);

    if (flex) {
      if (totalSeconds < 60)
        return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
      if (totalSeconds < 3600) return `${pad(minutes)}:${seconds}`;
    }

    return [pad(hours), pad(minutes), seconds].join(':');
  }
  static durationToSeconds(value, unit) {
    switch (unit) {
      case 'd': // Jour
        return value * 86400; // 1 jour = 86400 secondes
      case 'h': // Heure
        return value * 3600; // 1 heure = 3600 secondes
      case 'min': // Minute
        return value * 60; // 1 minute = 60 secondes
      case 's': // Seconde
        return value; // 1 seconde = 1 seconde
      case 'ms': // Milliseconde
        return value * 0.001; // 1 milliseconde = 0.001 seconde
      case 'μs': // Microseconde
        return value * 0.000001; // 1 microseconde = 0.000001 seconde
      default:
        // CF5 - issue (critical) resolved - unknown/missing unit threw and
        // crashed the card; return null so the caller can flag the entity as
        // invalid
        return null;
    }
  }
  static convertDuration(duration) {
    // CF5 - issue (critical) resolved - timer attributes (duration/remaining)
    // can be missing during HA startup; null.split() crashed the card
    if (!is.string(duration)) return 0;
    // CF5 - issue (minor) resolved - Python timedelta strings for timers over
    // 24h are "N day(s), H:MM:SS": the day prefix made every part NaN. Days are
    // now parsed, and any malformed remainder returns 0 instead of propagating
    // NaN.
    const dayMatch = duration.match(/^(\d+) days?, (.*)$/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
    const parts = (dayMatch ? dayMatch[2] : duration).split(':').map(Number);
    if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return 0;
    const [hours, minutes, seconds] = parts;

    return ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
  }
}

/******************************************************************************
 * 🛠️ ValueHelper
 * ============================================================================
 *
 * ✅ Helper class for managing numeric values.
 * This class validates and stores a numeric value.
 *
 * @class
 */

class TypedValueHelper {
  #value = null;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (this._validate(newValue)) this.#defaultValue = newValue;
  }

  set value(newValue) {
    this.#isValid = this._validate(newValue);
    this.#value = this.#isValid ? newValue : null;
  }
  get value() {
    return this.#isValid ? this.#value : this.#defaultValue;
  }
  get isValid() {
    return this.#isValid;
  }

  _validate(_value) {
    return false;
  }
}

class ValueHelper extends TypedValueHelper {
  _validate(v) {
    return is.number(v);
  }
}

/******************************************************************************
 * 🛠️ DecimalHelper
 * ============================================================================
 *
 * ✅ Represents a non-negative integer value that can be valid or invalid.
 *
 * @class
 */
class DecimalHelper extends TypedValueHelper {
  _validate(v) {
    return Number.isInteger(v) && v >= 0;
  }
}

/******************************************************************************
 * 🛠️ UnitHelper
 * ============================================================================
 *
 * ✅ Represents a unit of measurement, stored as a string.
 *
 * @class
 */
class UnitHelper {
  #value = CARD.config.unit.default;
  #isDisabled = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue) {
    // CF5 - issue (critical) resolved - some integrations expose a non-string
    // unit_of_measurement; .trim() crashed and the ?? fallback was dead code
    this.#value = is.nullish(newValue) ? CARD.config.unit.default : String(newValue).trim();
  }
  get value() {
    return this.#isDisabled ? '' : this.#value;
  }
  set isDisabled(newValue) {
    this.#isDisabled = is.boolean(newValue) ? newValue : false;
  }
  get isDisabled() {
    return this.#isDisabled;
  }
  get isTimerUnit() {
    return this.#value.toLowerCase() === CARD.config.unit.timer;
  }
  get isFlexTimerUnit() {
    return this.#value.toLowerCase() === CARD.config.unit.flexTimer;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  toString() {
    return this.#isDisabled ? '' : this.#value;
  }
}

/******************************************************************************
 * 🛠️ PercentHelper
 * ============================================================================
 *
 * ✅ class for calculating and formatting percentages.
 *
 * @class
 */
class ProgressCalc {
  #min = new ValueHelper(CARD.config.value.min);
  #max = new ValueHelper(CARD.config.value.max);
  #current = new ValueHelper(0);
  #decimal = new DecimalHelper(CARD.config.decimal.percentage);
  #percent = 0;
  #isReversed = false;
  #isCenterZero = false;
  #zeroValue = 0;
  #growthPercent = false;
  #scale = 'linear';

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isReversed(newValue) {
    this.#isReversed = is.boolean(newValue) ? newValue : CARD.config.reverse;
  }
  get isReversed() {
    return this.#isReversed;
  }

  set min(newValue) {
    this.#min.value = newValue;
  }
  get min() {
    return this.#min.value;
  }

  set max(newValue) {
    this.#max.value = newValue;
  }
  get max() {
    return this.#max.value;
  }

  set current(newCurrent) {
    this.#current.value = newCurrent;
  }
  get current() {
    return this.#current.value;
  }

  set decimal(newValue) {
    this.#decimal.value = newValue;
  }
  get decimal() {
    return this.#decimal.value;
  }

  set isCenterZero(newValue) {
    this.#isCenterZero = is.boolean(newValue) ? newValue : false;
  }
  get isCenterZero() {
    return this.#isCenterZero;
  }

  set zeroValue(newValue) {
    this.#zeroValue = is.number(newValue) ? newValue : 0;
  }
  get zeroValue() {
    return this.#zeroValue;
  }

  set growthPercent(newValue) {
    this.#growthPercent = is.boolean(newValue) ? newValue : false;
  }
  get growthPercent() {
    return this.#growthPercent;
  }

  set scale(newValue) {
    this.#scale = newValue === 'log' ? 'log' : 'linear';
  }
  get scale() {
    return this.#scale;
  }

  // log scale requires a well-formed positive range (log(0) or log(negative) is
  // undefined) — center_zero's own zeroValue/min/max split has no meaningful
  // log equivalent either, so both silently fall back to plain linear math in
  // #percentForValue rather than producing NaN.
  get isLogScale() {
    return this.#scale === 'log' && !this.isCenterZero && this.min > 0 && this.max > this.min;
  }

  get actual() {
    return this.#isReversed ? this.max - this.current : this.current;
  }
  get isValid() {
    return this.range !== 0;
  }
  get range() {
    if (!this.isCenterZero) return this.max - this.min;
    return this.current >= this.#zeroValue ? this.max - this.#zeroValue : this.#zeroValue - this.min;
  }
  get correctedValue() {
    return this.isCenterZero ? this.current - this.#zeroValue : this.actual - this.min;
  }
  get percent() {
    return this.isValid ? this.#percent : null;
  }

  /**
   * Pourcentage de croissance/décroissance par rapport à la valeur de centrage
   * (`zeroValue`), indépendant du ratio de remplissage de la barre (`percent`).
   * N'a de sens que si `isCenterZero` et `growthPercent` sont actifs, et que
   * `zeroValue` n'est pas 0 (sinon le ratio est mathématiquement indéfini — on
   * retombe alors sur `percent`).
   */
  get growthPercentValue() {
    if (!this.isValid) return null;
    if (this.#zeroValue === 0) return this.percent;
    return Number((((this.current - this.#zeroValue) / this.#zeroValue) * 100).toFixed(this.decimal));
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    const currentValue = this.isCenterZero ? this.current : this.actual;
    this.#percent = this.isValid ? Number(this.#percentForValue(currentValue).toFixed(this.decimal)) : 0;
  }

  calcWatermark(value) {
    const numericValue = is.number(value) ? value : (value?.current ?? 0);
    const percent = this.#percentForValue(numericValue);
    return this.isCenterZero ? 50 + percent / 2 : percent;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #percentForValue(value) {
    if (this.isCenterZero) {
      const corrected = value - this.#zeroValue;
      const halfRange = corrected >= 0 ? this.max - this.#zeroValue : this.#zeroValue - this.min;
      return halfRange === 0 ? 0 : (corrected / halfRange) * 100;
    }
    if (this.isLogScale) {
      // Clamp below-range values to min before taking the log: value <= 0 would
      // otherwise produce NaN/-Infinity instead of the same "0%, let CSS clamp
      // it" behavior linear gets for a below-range value.
      const clamped = Math.max(value, this.min);
      return ((Math.log(clamped) - Math.log(this.min)) / (Math.log(this.max) - Math.log(this.min))) * 100;
    }
    const fullRange = this.max - this.min;
    return fullRange === 0 ? 0 : ((value - this.min) / fullRange) * 100;
  }
}

/******************************************************************************
 * 🛠️ PercentHelper
 * ============================================================================
 *
 * ✅ class for calculating and formatting percentages.
 *
 * @class
 */
class PercentHelper extends ProgressCalc {
  #hassProvider = null;
  #unit = new UnitHelper();
  #isTimer = false;
  #unitSpacing = CARD.config.unit.unitSpacing.auto;

  constructor() {
    super();
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isTimer(newValue) {
    this.#isTimer = is.boolean(newValue) ? newValue : false;
  }
  get isTimer() {
    return this.#isTimer;
  }

  get unit() {
    return this.#unit.value;
  }
  set unit(newValue) {
    this.#unit.value = newValue ?? '';
  }

  get hasTimerUnit() {
    return this.#isTimer && this.#unit.isTimerUnit;
  }
  get hasFlexTimerUnit() {
    return this.#isTimer && this.#unit.isFlexTimerUnit;
  }
  get hasTimerOrFlexTimerUnit() {
    return this.hasTimerUnit || this.hasFlexTimerUnit;
  }

  get processedValue() {
    if (this.unit !== CARD.config.unit.default) return this.actual;
    return this.isCenterZero && this.growthPercent ? this.growthPercentValue : this.percent;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ unitSpacing, hasDisabledUnit, isCenterZero, zeroValue, growthPercent, scale }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
    this.scale = scale;
  }

  valueForThemes(isCustomTheme, valueBasedOnPercentage) {
    /*
     * Calculates the value to display based on the selected theme and unit
     * system.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius
     * before returning. - If the theme is linear or the unit is the default,
     * the percentage value is returned.
     */
    let value = this.actual;
    if (isCustomTheme) return value;
    if (this.unit === CARD.config.unit.fahrenheit) value = ((value - 32) * 5) / 9;
    return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(this.unit)
      ? this.percent
      : value;
  }

  toString() {
    if (!this.isValid) return 'Div0';
    if (this.hasTimerOrFlexTimerUnit)
      return NumberFormatter.formatTiming(
        this.actual,
        this.decimal,
        this.#hassProvider.numberFormat,
        this.hasFlexTimerUnit,
        this.#unitSpacing,
      );
    return NumberFormatter.formatValueAndUnit(
      this.processedValue,
      this.decimal,
      this.unit,
      this.#hassProvider.numberFormat,
      this.#unitSpacing,
    );
  }
}

/******************************************************************************
 * 🛠️ ThemeManager
 * ============================================================================
 *
 * ✅ Manages the theme and its associated icon and color based on a percentage
 * value.
 *
 * @class
 */
class ThemeManager {
  #theme = null;
  #icon = null;
  #iconColor = null;
  #barColor = null;
  #value = 0;
  #isValid = false;
  #isLinear = false;
  #isBasedOnPercentage = false;
  #isCustomTheme = false;
  #currentStyle = null;
  #interpolate = false;

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set theme(newTheme) {
    if (is.nullish(newTheme) || !has.validKey(THEME, newTheme)) {
      this.#reset();
      return;
    }
    this.#isValid = true;
    this.#theme = newTheme;
    this.#currentStyle = THEME[newTheme].style;
    this.#isLinear = THEME[newTheme].linear;
    this.#isBasedOnPercentage = THEME[newTheme].percent;
  }
  get theme() {
    return this.#theme;
  }
  // Only a presence/shape check: per-zone validity (numeric min < max, sorted)
  // is already guaranteed by the schema's customTheme validator, the sole path
  // a config reaches here through — see BaseConfigHelper.set config.
  set customTheme(newTheme) {
    if (!is.nonEmptyArray(newTheme)) return;
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme;
    this.#isValid = true;
    this.#isLinear = false;
    this.#isCustomTheme = true;
  }
  get customTheme() {
    return this.#currentStyle;
  }
  get isLinear() {
    return this.#isLinear;
  }
  get isBasedOnPercentage() {
    return this.#isBasedOnPercentage;
  }
  get isCustomTheme() {
    return this.#isCustomTheme;
  }
  get isValid() {
    return this.#isValid;
  }
  set value(newValue) {
    this.#value = newValue;
    this.#refresh();
  }
  get value() {
    return this.#value;
  }
  get icon() {
    return this.#icon;
  }
  get iconColor() {
    return this.#iconColor;
  }
  get barColor() {
    return this.#barColor;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ theme, customTheme, interpolate }) {
    this.theme = theme;
    this.customTheme = customTheme;
    this.#interpolate = interpolate;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #reset() {
    [
      this.#icon,
      this.#barColor,
      this.#iconColor,
      this.#theme,
      this.#currentStyle,
      this.#value,
      this.#isValid,
      this.#isLinear,
      this.#isBasedOnPercentage,
      this.#isCustomTheme,
      this.#interpolate,
    ] = [null, null, null, null, null, 0, false, false, false, false, false];
  }
  #refresh() {
    if (!this.#isValid) return;
    const applyStyle = this.isLinear ? this.#setLinearStyle : this.#setStyle;
    applyStyle.call(this);
  }

  #setLinearStyle() {
    const lastStep = this.#currentStyle.length - 1;
    const thresholdSize = CARD.config.value.max / lastStep;
    const percentage = Math.max(0, Math.min(this.#value, CARD.config.value.max));
    const index = Math.min(Math.floor(percentage / thresholdSize), lastStep);
    const ratio = (percentage - index * thresholdSize) / thresholdSize;
    this.#applyColors(this.#currentStyle[index], this.#currentStyle[index + 1] ?? null, ratio);
  }

  #setStyle() {
    let [themeData, nextThemeData, ratio] = [null, null, 0];

    if (this.#value >= this.#currentStyle[this.#currentStyle.length - 1].max) {
      themeData = this.#currentStyle[this.#currentStyle.length - 1];
    } else if (this.#value < this.#currentStyle[0].min) {
      themeData = this.#currentStyle[0];
    } else {
      // custom_theme zones no longer have to tile perfectly (gaps are
      // tolerated), so a value can land in a gap between two of them —
      // themeData then stays null and #applyColors disengages the theme for
      // this render, deferring to whatever color source is next in priority
      // (see CardView.iconColor/barColor).
      const index = this.#currentStyle.findIndex((level) => this.#value >= level.min && this.#value < level.max);
      if (index !== -1) {
        themeData = this.#currentStyle[index];
        nextThemeData = this.#currentStyle[index + 1] ?? null;
        ratio = (this.#value - themeData.min) / (themeData.max - themeData.min);
      }
    }

    this.#applyColors(themeData, nextThemeData, ratio);
  }

  #applyColors(themeData, nextThemeData, ratio) {
    if (!themeData) {
      this.#icon = null;
      this.#iconColor = null;
      this.#barColor = null;
      return;
    }
    this.#icon = themeData.icon || null;

    if (this.#interpolate && nextThemeData) {
      const color = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.icon_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.icon_color || nextThemeData.color || null),
        ratio,
      );
      const barColor = ThemeManager.#interpolateColor(
        ThemeManager.adaptColor(themeData.bar_color || themeData.color || null),
        ThemeManager.adaptColor(nextThemeData.bar_color || nextThemeData.color || null),
        ratio,
      );
      this.#iconColor = color;
      this.#barColor = barColor;
    } else {
      this.#iconColor = ThemeManager.adaptColor(themeData.icon_color || themeData.color || null);
      this.#barColor = ThemeManager.adaptColor(themeData.bar_color || themeData.color || null);
    }
  }
  static #interpolateColor(from, to, ratio) {
    if (!from || !to) return null;
    const pct = Math.round(ratio * 100);
    return `color-mix(in srgb, ${to} ${pct}%, ${from})`; // from/to déjà adaptés
  }
  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  static adaptColor(curColor) {
    return HA_CONTEXT.haColors.get(curColor) ?? curColor;
  }

  buildGradient(fillPercent, mode, defaultColor = null) {
    if (!this.#isValid || !this.#currentStyle || mode === 'auto') return null;
    if (!(fillPercent > 0)) return null;

    // For linear themes, derive min/max boundaries by splitting 0–100% equally.
    const style = this.#isLinear
      ? this.#currentStyle.map((level, i, arr) => ({
          ...level,
          min: (i / arr.length) * 100,
          max: ((i + 1) / arr.length) * 100,
        }))
      : this.#currentStyle;

    const visible = style.filter((level) => level.min < fillPercent);
    if (visible.length === 0) return null;

    // Inner element uses translateX((value-1)*100%), shifted left by
    // (100-fillPercent)%. A zone boundary at container position B → element
    // position B + offset.
    const offset = 100 - fillPercent;
    const toElemPos = (b) => `${(b + offset).toFixed(2)}%`;
    // color is optional per zone now (see types.customTheme) — a color-less
    // zone falls back the same way iconColor/barColor already do: the entity's
    // own negotiated color (e.g. a cover is pink open / grey closed, see
    // EntityHelper.defaultColor), then the card's generic default, rather than
    // a flat neutral for every domain.
    const col = (level) =>
      ThemeManager.adaptColor(level.bar_color || level.color) || defaultColor || CARD.style.color.default;

    if (mode === 'segment') {
      const stops = visible.flatMap((level, i) => {
        const start = i === 0 ? '0%' : toElemPos(level.min);
        const end = level.max >= fillPercent ? '100%' : toElemPos(level.max);
        return [`${col(level)} ${start}`, `${col(level)} ${end}`];
      });
      return `linear-gradient(to right, ${stops.join(', ')})`;
    }

    if (mode === 'rainbow') {
      const first = col(visible[0]);
      const stops = [`${first} 0%`];
      if (offset > 0) stops.push(`${first} ${offset.toFixed(2)}%`);
      visible.forEach((level, i) => {
        if (i > 0) stops.push(`${col(level)} ${toElemPos(level.min)}`);
      });
      stops.push(`${col(visible[visible.length - 1])} 100%`);
      return `linear-gradient(to right, ${stops.join(', ')})`;
    }

    return null;
  }
}

/******************************************************************************
 * 🛠️ HassProviderSingleton
 * ============================================================================
 *
 * ✅ Provides access to the Home Assistant object.
 * This class implements a singleton pattern to ensure only one instance exists.
 *
 * @class
 */
class HassProviderSingleton {
  static #instance = null;
  static #allowInit = false;
  static #entityMap = {
    device_class: { source: 'attribute' },
    friendly_name: { source: 'attribute' },
    icon: { source: 'attribute' },
    unit_of_measurement: { source: 'attribute' },
    finishes_at: { source: 'attribute' },
    duration: { source: 'attribute' },
    remaining: { source: 'attribute' },
    entity_picture: { source: 'attribute' },
    state: { source: 'state' },
    last_changed: { source: 'state' },
    last_updated: { source: 'state' },
    display_precision: { source: 'entity' },
  };
  #debug = CARD_CONTEXT.debug.hass;
  #log = null;
  #hass = null;
  #isValid = false;
  #translations = {};
  #rtf = null;
  #rtfLanguage = null;

  constructor() {
    if (!HassProviderSingleton.#allowInit) {
      throw new Error('Use HassProviderSingleton.getInstance() instead of new.');
    }
    this.#log = Logger.create('HassProviderSingleton', this.#debug ? SEV.debug : SEV.info);
    HassProviderSingleton.#allowInit = false;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hass(hass) {
    if (!hass) return;
    const firstHass = this.#hass === null;
    const previousLanguage = this.language;
    this.#hass = hass;
    const currentLanguage = this.language;
    if (firstHass || previousLanguage !== currentLanguage) this.#loadTranslations(currentLanguage);
    this.#isValid = true;
    this.#log.debug('HASS updated!');
  }
  get hass() {
    return this.#hass;
  }
  get isValid() {
    return this.#isValid;
  }
  get language() {
    return this.#hass?.language in TRANSLATIONS ? this.#hass.language : CARD.config.language;
  }
  getMessage(code) {
    return this.localize('card.msg')[code] || `Unknown message code: ${code}`;
  }
  get numberFormat() {
    const localeFromLang = (lang) => {
      try {
        return new Intl.NumberFormat(lang).resolvedOptions().locale;
      } catch {
        return 'en-US';
      }
    };
    const userDef = this.#hass?.locale?.number_format;
    const numberFormatMap = {
      ...HA_CONTEXT.numberFormat,
      language: localeFromLang(this.language),
      system: Intl.NumberFormat().resolvedOptions().locale,
      none: 'en',
    };
    return numberFormatMap[userDef] || localeFromLang(this.language);
  }
  get version() {
    return this.#hass?.config?.version ?? null;
  }
  get hasNewShapeStrategy() {
    const [year, month] = (this.version ?? '0.0').split('.').map(Number);
    return year > 2025 || (year === 2025 && month >= 3);
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  localize(key) {
    const result = key.split('.').reduce((obj, k) => obj?.[k], this.#translations);
    return result ?? key;
  }

  static getInstance() {
    if (!HassProviderSingleton.#instance) {
      HassProviderSingleton.#allowInit = true;
      HassProviderSingleton.#instance = new HassProviderSingleton();
    }
    return HassProviderSingleton.#instance;
  }

  getEntityProp(entityId, prop, format = false) {
    return format ? this.#formatEntityProp(entityId, prop) : this.#resolveEntityProp(entityId, prop);
  }
  #resolveEntityProp(entityId, prop) {
    const mapping = HassProviderSingleton.#entityMap[prop];
    if (!mapping) return null;

    const resolvers = {
      attribute: () => this.getEntityAttribute(entityId, prop),
      state: () => this.getEntityStateObj(entityId)?.[prop] ?? null,
      entity: () => this.#hass?.entities?.[entityId]?.[prop] ?? null,
    };

    return resolvers[mapping.source]?.() ?? null;
  }
  #formatEntityProp(entityId, prop) {
    if (prop === 'last_changed' || prop === 'last_updated')
      return this.getRelativeTime(this.#resolveEntityProp(entityId, prop));

    const stateObj = this.getEntityStateObj(entityId);
    if (prop === 'state')
      return stateObj ? (this.#hass?.formatEntityState?.(stateObj) ?? '') : this.localize('card.msg.entityNotFound');

    return this.#hass?.formatEntityAttributeValue?.(stateObj, prop) ?? '';
  }
  hasEntity(entityId) {
    return entityId in (this.#hass?.states || {});
  }
  getEntityStateObj(entityId) {
    return this.#hass?.states?.[entityId] ?? null;
  }
  #getAttributes(entityId) {
    return this.getEntityStateObj(entityId)?.attributes ?? {};
  }
  getEntityAttribute(entityId, attribute) {
    if (!attribute) return null;
    const attributes = this.#getAttributes(entityId);
    return attribute in attributes ? attributes[attribute] : null;
  }
  getEntityName(entityId) {
    // CF5 - issue (critical) resolved - entities without unique_id are absent
    // from hass.entities; missing optional chaining crashed name tokens (type:
    // entity)
    return this.#hass?.entities?.[entityId]?.name ?? null;
  }
  getEntityDevice(entityId) {
    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return null;
    return this.#hass?.devices?.[deviceId]?.name ?? null;
  }
  // Used by ViewCore.isBatteryCharging/isWashingMachineActive to look at
  // other entities on the same device as the card's own `entity`, each then
  // filtering by state, not by entity_id: an id-based guess (e.g. requiring
  // "charg" in the name) misses integrations that don't name their status
  // entity after what it reports - Home Assistant's own Companion App calls
  // its charging-status sensor battery_state, not anything containing
  // "charg".
  getSameDeviceEntities(entityId) {
    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return [];
    return Object.keys(this.#hass?.entities ?? {}).filter(
      (id) => id !== entityId && this.#hass.entities[id].device_id === deviceId,
    );
  }
  getEntityArea(entityId) {
    const entityAreaId = this.#hass?.entities?.[entityId]?.area_id;
    if (entityAreaId) return this.#hass?.areas?.[entityAreaId]?.name ?? null;

    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return null;
    const deviceAreaId = this.#hass?.devices?.[deviceId]?.area_id;
    return this.#hass?.areas?.[deviceAreaId]?.name ?? null;
  }
  getEntityFloor(entityId) {
    const areaId =
      this.#hass?.entities?.[entityId]?.area_id ??
      this.#hass?.devices?.[this.#hass?.entities?.[entityId]?.device_id]?.area_id;
    if (!areaId) return null;
    const floorId = this.#hass?.areas?.[areaId]?.floor_id;
    return this.#hass?.floors?.[floorId]?.name ?? null;
  }
  static getEntityDomain(entityId) {
    return is.string(entityId) && entityId.includes('.') ? entityId.split('.')[0] : null;
  }
  isEntityAvailable(entityId) {
    const state = this.getEntityStateObj(entityId)?.state;
    return state !== 'unavailable' && state !== 'unknown';
  }
  getRelativeTime(curTime) {
    if (!curTime) return '';

    const startTime = new Date(curTime).getTime();
    const now = Date.now();
    const diffInSeconds = Math.floor((startTime - now) / 1000);

    const units = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
      if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
        const value = Math.round(diffInSeconds / seconds);
        const rtf = this.#getRelativeTimeFormat();
        return rtf.format(value, unit);
      }
    }
    return null;
  }
  getNumericAttributes(entityId) {
    return Object.fromEntries(
      Object.entries(this.#getAttributes(entityId))
        .filter(([, val]) => is.number(val) || is.numericString(val))
        .map(([key, val]) => [key, is.number(val) ? val : parseFloat(val)]),
    );
  }
  #loadTranslations(lang) {
    const curLanguage = has.own(TRANSLATIONS, lang) ? lang : CARD.config.language;
    this.#translations = TRANSLATIONS[curLanguage];
  }
  #getRelativeTimeFormat() {
    if (!this.#rtf || this.#rtfLanguage !== this.language) {
      this.#rtfLanguage = this.language;
      this.#rtf = new Intl.RelativeTimeFormat(this.language, { numeric: 'auto' });
    }
    return this.#rtf;
  }
}

class ChangeTracker {
  #debug = CARD_CONTEXT.debug.hass;
  #log = null;
  #firstTime = true;
  #watchedEntities = new Set();
  #entityCache = {};
  #updated = false;
  #hassState = { isUpdated: false };

  constructor() {
    this.#log = Logger.create('ChangeTracker', this.#debug ? SEV.debug : SEV.info);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hassState(hass) {
    this.#updated = false;
    if (!hass) return;

    if (this._hasChanged(hass)) {
      this._updateCache(hass);
      this.#updated = true;
      this.#log.debug('HASS need update...!');
    }
    this.#hassState = { isUpdated: this.#updated };
  }

  get hassState() {
    return this.#hassState;
  }

  get isUpdated() {
    return this.#updated;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasChanged(newHass) {
    if (this.#firstTime) {
      this.#firstTime = false;
      return true;
    }
    // CF5 - issue (perf) resolved - previously returned true, running the full
    // refresh pipeline on every hass update of the whole install for cards with
    // no watched entity (Jinja-only template cards). Their content arrives
    // exclusively via push template subscriptions; nothing in the pipeline
    // reads hass directly. If a future render path does, revisit this.
    if (!is.nonEmptySet(this.#watchedEntities)) return false;

    for (const entityId of this.#watchedEntities) {
      const newState = newHass?.states?.[entityId];

      if (!newState) return true;
      // CF5 - issue (perf) resolved - HA state objects are immutable (the
      // frontend swaps in a new object on every change), so a reference check
      // replaces the two full JSON.stringify serializations previously run per
      // entity on every hass update
      if (newState !== this.#entityCache?.[entityId]) return true;
    }

    return false;
  }

  _updateCache(hass) {
    this.#entityCache = {};
    for (const entityId of this.#watchedEntities) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
    }
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  watchEntity(entityId) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }

  resetWatchedEntities() {
    this.#watchedEntities.clear();
  }
}

/******************************************************************************
 * 🛠️ EntityHelper
 * ============================================================================
 *
 * ✅ Helper class for managing entities. This class validates and retrieves
 * information from Home Assistant if it's an entity.
 *
 * @class
 */
class EntityHelper {
  #hassProvider = null;
  #isValid = false;
  #value = {};
  #entityId = null;
  #attribute = null;
  #color = null;
  #subtract = false;
  #isMain = false;
  #state = null;
  #domain = null;
  #entityType = null;
  #entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: false };
  #stateContent = [];
  #nameTokens = null;
  static #handleRefreshType = new Map([
    [HA_CONTEXT.entity.type.timer, (self) => self._manageTimerEntity()],
    [HA_CONTEXT.entity.type.duration, (self) => self._manageDurationEntity()],
    [HA_CONTEXT.entity.type.counter, (self) => self._manageCounterAndNumberEntity('minimum', 'maximum')],
    [HA_CONTEXT.entity.type.number, (self) => self._manageCounterAndNumberEntity('min', 'max')],
    [HA_CONTEXT.entity.type.default, (self) => self._manageStdEntity()],
  ]);

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set entityId(newValue) {
    this.#entityId = newValue;
    this.#nameTokens = null;
    this.#entityType = null;
    this.#entityTypeFlags.isSynced = false;
    this.#value = 0;
    this.#domain = HassProviderSingleton.getEntityDomain(newValue);
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);
  }

  get entityId() {
    return this.#entityId;
  }
  set attribute(newValue) {
    this.#attribute = newValue;
  }
  get attribute() {
    return this.#attribute;
  }
  set color(newValue) {
    this.#color = newValue ?? null;
  }
  get color() {
    return this.#color;
  }
  set subtract(newValue) {
    this.#subtract = Boolean(newValue);
  }
  get subtract() {
    return this.#subtract;
  }
  set isMain(newValue) {
    this.#isMain = Boolean(newValue);
  }
  get isMain() {
    return this.#isMain;
  }
  set nameTokens(tok) {
    this.#nameTokens = is.nonEmptyArray(tok) ? tok : null;
  }
  get nameTokens() {
    return this.#nameTokens;
  }
  set stateContent(val) {
    this.#stateContent = val;
  }
  get stateContent() {
    return this.#stateContent;
  }
  get value() {
    return this.#isValid ? this.#value : 0;
  }
  get state() {
    return this.#state;
  }
  get isValid() {
    return this.#isValid;
  }
  get isAvailable() {
    return this.#hassProvider.isEntityAvailable(this.#entityId);
  }
  get attributes() {
    return this.#isValid &&
      !this.entityType.isCounter &&
      !this.entityType.isNumber &&
      !this.entityType.isDuration &&
      !this.entityType.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entityId)
      : {};
  }
  get hasAttribute() {
    return this.#isValid && Object.keys(this.attributes).length > 0;
  }
  get defaultAttribute() {
    return HA_CONTEXT.attributeMapping[this.#domain]?.attribute ?? null;
  }
  get name() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'friendly_name');
  }
  _nameResolver() {
    const resolvers = {
      text: (item) => item.text,
      entity: () => this.#hassProvider.getEntityName(this.entityId),
      device: () => this.#hassProvider.getEntityDevice(this.entityId),
      area: () => this.#hassProvider.getEntityArea(this.entityId),
      floor: () => this.#hassProvider.getEntityFloor(this.entityId),
    };

    return this.#nameTokens
      .map((item) => {
        const resolver = resolvers[item.type];
        if (!resolver) return null;
        try {
          return resolver(item);
        } catch {
          return null;
        }
      })
      .filter((v) => is.nonEmptyString(v))
      .join(' ');
  }
  get nameComposition() {
    return this.#nameTokens ? this._nameResolver() : this.name;
  }
  get stateObj() {
    return this.#hassProvider.getEntityStateObj(this.#entityId);
  }
  get formatedEntityState() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'state', true);
  }
  get unit() {
    if (!this.#isValid) return null;
    if (this.entityType.isTimer) return CARD.config.unit.flexTimer;
    if (this.entityType.isDuration) return CARD.config.unit.second;
    if (this.entityType.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
  }
  get precision() {
    return this.#isValid ? (this.#hassProvider.getEntityProp(this.#entityId, 'display_precision') ?? null) : null;
  }
  get entityType() {
    if (!this.#entityTypeFlags.isSynced) {
      const type = this.getEntityType();
      const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
      this.#entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: true };
      this.#entityTypeFlags[key] = true;
    }
    return this.#entityTypeFlags;
  }
  get hasShapeByDefault() {
    return [HA_CONTEXT.entity.type.light, HA_CONTEXT.entity.type.fan].includes(this.#domain);
  }
  get defaultColor() {
    const colorMap = {
      [HA_CONTEXT.entity.type.timer]:
        this.value?.state === HA_CONTEXT.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.cover]: this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.light]: this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      // state, not value: a fan on a dynamic preset (e.g. "auto") is genuinely
      // on but its percentage attribute can legitimately read 0 - the fan
      // decides its own speed rather than reporting a fixed one.
      [HA_CONTEXT.entity.type.fan]:
        this.state === HA_CONTEXT.entity.state.on ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.climate]: this.#getClimateColor(),
      [HA_CONTEXT.entity.class.battery]: this.#getBatteryColor(),
    };

    return colorMap[this.#domain] ?? colorMap[this.#hassProvider.getEntityProp(this.#entityId, 'device_class')] ?? null;
  }
  get stateContentToString() {
    const results = [];

    for (const attr of this.#stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getEntityProp(this.#entityId, 'state', true));
          break;
        case 'device_name':
          results.push(this.#hassProvider.getEntityDevice(this.entityId));
          break;
        case 'area_name':
          results.push(this.#hassProvider.getEntityArea(this.#entityId));
          break;
        default:
          results.push(this.#hassProvider.getEntityProp(this.#entityId, attr, true));
          break;
      }
    }

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getEntityType() {
    this.#entityType ??= EntityHelper.#handleRefreshType.has(this.#domain)
      ? this.#domain
      : this.#hassProvider.getEntityProp(this.#entityId, 'device_class') === HA_CONTEXT.entity.type.duration &&
          !this.#attribute
        ? HA_CONTEXT.entity.type.duration
        : HA_CONTEXT.entity.type.default;

    return this.#entityType;
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);

    if (!this.#isValid) {
      this.#state = HA_CONTEXT.entity.state.notFound;
      return;
    }

    if (this.#attribute)
      // CF5 - issue (major) resolved - getEntityAttribute returns null (never
      // undefined) when missing, so this check always passed and invalid
      // attributes produced NaN downstream
      this.#isValid = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute) !== null;

    this.#state = this.#hassProvider.getEntityProp(this.#entityId, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler =
      EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get(HA_CONTEXT.entity.type.default);
    handler(this);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _manageStdEntity() {
    this.#attribute = this.#attribute || HA_CONTEXT.attributeMapping[this.#domain]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(attrValue);
      if (
        this.#domain === HA_CONTEXT.attributeMapping.light.label &&
        this.#attribute === HA_CONTEXT.attributeMapping.light.attribute
      ) {
        this.#value = (100 * this.#value) / 255;
      }
    } else {
      // Si l'attribut n'est pas trouvé, définir un comportement
      this.#value = 0;
      this.#isValid = false;
    }
  }
  _manageTimerEntity() {
    // eslint-disable-next-line no-useless-assignment
    let [duration, elapsed] = [null, null];
    switch (this.#state) {
      case HA_CONTEXT.entity.state.idle: {
        // elapsed/duration aren't real millisecond durations here (no timer
        // is running) - just the generic [0, 100] placeholder range.
        // Pre-multiplied so the shared `/ CARD.config.msFactor` below cancels
        // out to that same [0, 100] range instead of collapsing it to
        // [0, 0.1], which sent anything reading this.#value (e.g. a
        // watermark's high/low position) wildly out of bounds.
        elapsed = CARD.config.value.min * CARD.config.msFactor;
        duration = CARD.config.value.max * CARD.config.msFactor;
        break;
      }
      case HA_CONTEXT.entity.state.active: {
        const finished_at = new Date(this.#hassProvider.getEntityProp(this.#entityId, 'finishes_at')).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case HA_CONTEXT.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(
          this.#hassProvider.getEntityProp(this.#entityId, 'remaining'),
        );
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
        elapsed = duration - remaining;
        break;
      }
      default:
        throw new Error('Timer entity - Unknown case');
    }
    this.#value = {
      current: elapsed / CARD.config.msFactor,
      min: CARD.config.value.min,
      max: duration / CARD.config.msFactor,
      state: this.#state,
    };
  }
  _manageCounterAndNumberEntity(min, max) {
    this.#value = {
      current: parseFloat(this.#state),
      min: this.#hassProvider.getEntityAttribute(this.#entityId, min),
      max: this.#hassProvider.getEntityAttribute(this.#entityId, max),
    };
  }
  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never
    // undefined), so the guard never matched and a missing unit crashed in
    // durationToSeconds
    const seconds = is.nullish(unit) ? null : NumberFormatter.durationToSeconds(value, unit);
    this.#value = seconds ?? 0;
    this.#isValid = seconds !== null;
  }

  #getClimateColor() {
    const climateColorMap = {
      heat_cool: CARD.style.color.active,
      dry: CARD.style.color.climate.dry,
      cool: CARD.style.color.climate.cool,
      heat: CARD.style.color.climate.heat,
      fan_only: CARD.style.color.climate.fanOnly,
    };
    return climateColorMap[this.#state] || CARD.style.color.inactive;
  }

  #getBatteryColor() {
    if (!this.#value || this.#value <= 30) return CARD.style.color.battery.low;
    if (this.#value <= 70) return CARD.style.color.battery.medium;
    return CARD.style.color.battery.high;
  }
}

/******************************************************************************
 * 🛠️ EntityCollectionHelper
 * ============================================================================
 *
 * ✅ Helper class for managing entities collection.
 *
 * @class
 */

class EntityCollectionHelper {
  #entities = [];
  #mode = 'stacked';

  static #numericValue(helper) {
    const value = helper.value;
    return is.number(value) ? value : (value?.current ?? 0);
  }

  // Width/share math always wants a magnitude - a negative raw value must never
  // turn into a negative width (nonsensical for a gradient stop or an arm
  // size).
  static #magnitude(helper) {
    return Math.abs(EntityCollectionHelper.#numericValue(helper));
  }

  // An entity counts as a negative contributor if explicitly marked `subtract`,
  // or if its own raw value is already negative (e.g. a grid-power sensor
  // signed by convention - see the `net` mode note in configuration.md).
  // Checking both - rather than just blindly negating when `subtract` is set -
  // means `subtract: true` on an already-negative value can't double-negate it
  // back to positive.
  static #isNegative(helper) {
    return helper.subtract || EntityCollectionHelper.#numericValue(helper) < 0;
  }

  static #magnitudeSum(entities) {
    return entities.reduce((sum, helper) => sum + EntityCollectionHelper.#magnitude(helper), 0);
  }

  static #splitByNegative(entities) {
    return {
      positive: entities.filter((helper) => !EntityCollectionHelper.#isNegative(helper)),
      negative: entities.filter((helper) => EntityCollectionHelper.#isNegative(helper)),
    };
  }

  set mode(newMode) {
    this.#mode = ['proportional', 'net'].includes(newMode) ? newMode : 'stacked';
  }
  get mode() {
    return this.#mode;
  }

  addEntity(entityId, attribute = null, color = null, subtract = false, isMain = false) {
    const helper = new EntityHelper();
    helper.entityId = entityId;
    if (attribute) helper.attribute = attribute;
    if (color) helper.color = color;
    helper.subtract = subtract;
    helper.isMain = isMain;
    this.#entities.push(helper);
  }

  refreshAll() {
    this.#entities.forEach((helper) => helper.refresh());
  }

  // Plain magnitude sum, mode-agnostic - the fill amount for
  // 'stacked'/'proportional' (both centered and not) and the non-centered
  // text/value. See getNetValue() for the sign-aware total ('net' mode, and
  // 'stacked'/'proportional' + center_zero's label).
  getTotalValue() {
    return EntityCollectionHelper.#magnitudeSum(this.getAvailableEntities());
  }
  getAvailableEntities() {
    return this.#entities.filter((helper) => helper.isValid && helper.isAvailable);
  }

  // Algebraic total (positive arm's magnitude sum minus negative arm's): 'net'
  // mode's own total, and also what 'stacked'/'proportional' should show as
  // their text/value once center_zero splits them into two arms - a single flat
  // "88%" reading makes no sense once the bar itself is showing two
  // independent, possibly-opposing lengths (see ViewBase).
  getNetValue() {
    const { positive, negative } = EntityCollectionHelper.#splitByNegative(this.getAvailableEntities());
    return EntityCollectionHelper.#magnitudeSum(positive) - EntityCollectionHelper.#magnitudeSum(negative);
  }

  // Auto-shaded fallback (darkest -> pure base color, by position among
  // entities lacking an explicit color) for an entity with no color override -
  // the only differentiation available before bar_stack.entities[].color
  // existed. The main entity is never part of this: it always keeps its own
  // negotiated curColor, unshaded, regardless of its position in the collection
  // (index 0 in 'stacked', last in 'proportional' - shading by raw position
  // used to darken whichever one landed first).
  static #entityColor(helper, index, total, curColor) {
    if (helper.isMain) return curColor;
    if (helper.color) return ThemeManager.adaptColor(helper.color) ?? curColor;
    const whitePercent = Math.round((1 - index / (total - 1 || 1)) * 50); // de 50 → 0
    return `color-mix(in srgb, ${curColor} ${100 - whitePercent}%, black ${whitePercent}%)`;
  }

  getEntitiesColor(curColor, progressRatio = 1, range = 0) {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;
    return this.#mode === 'stacked'
      ? EntityCollectionHelper.#stackedGradient(available, curColor, progressRatio, range)
      : EntityCollectionHelper.#proportionalGradient(available, curColor, progressRatio);
  }

  // 'stacked'/'proportional' + center_zero only ('net' has its own
  // single-segment path, see ViewBase.barColor): entities split into two
  // independent arms (see #splitByNegative), each laid out with the exact same
  // per-mode algorithm as the non-centered case (on magnitudes, see
  // #magnitude), just scoped to its own half-range (max-zeroValue /
  // zeroValue-min).
  getDivergingGradients(curColor, { min, max, zeroValue }) {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;

    const build =
      this.#mode === 'stacked' ? EntityCollectionHelper.#stackedGradient : EntityCollectionHelper.#proportionalGradient;
    const arm = (entities, range) => {
      if (!entities.length || range <= 0) return { gradient: null, size: 0 };
      const size = Math.min(1, Math.max(0, EntityCollectionHelper.#magnitudeSum(entities) / range));
      return { gradient: build(entities, curColor, size, range), size };
    };

    const { positive, negative } = EntityCollectionHelper.#splitByNegative(available);
    const pos = arm(positive, max - zeroValue);
    const neg = arm(negative, zeroValue - min);
    return { posGradient: pos.gradient, negGradient: neg.gradient, posSize: pos.size, negSize: neg.size };
  }

  // 'proportional' mode (legacy `additions` behavior, a.k.a. "100% stacked"):
  // each entity's share is renormalized against the combined total, so the
  // visible fill is always divided between entities regardless of how that
  // total compares to min_value/max_value.
  static #proportionalGradient(available, curColor, progressRatio) {
    const total = EntityCollectionHelper.#magnitudeSum(available);
    if (total === 0) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops = [];
    // With translateX-based fill, the inner element is 100% wide but only the
    // rightmost progressRatio% is visible. Segment stops must be offset so that
    // they land inside the visible portion instead of starting from position 0.
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    available.forEach((helper) => {
      const share = (EntityCollectionHelper.#magnitude(helper) / total) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = currentPosition + share * progressRatio;

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    });

    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  }

  // 'stacked' mode: each entity occupies its own literal width on the card's
  // min_value/ max_value scale (not renormalized against the others) - entities
  // placed in list order, starting right after the previous one. Leftover space
  // past the last entity stays empty (no gap-filling color), and entities are
  // clipped/skipped once the cumulative width reaches 100% instead of shrinking
  // everyone to fit.
  static #stackedGradient(available, curColor, progressRatio, range) {
    if (!range) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops = [];
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    for (let i = 0; i < available.length && currentPosition < 100; i++) {
      const helper = available[i];
      const width = (EntityCollectionHelper.#magnitude(helper) / range) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = Math.min(100, currentPosition + width);

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    }

    return gradientStops.length ? `linear-gradient(to right, ${gradientStops.join(', ')})` : null;
  }

  get count() {
    return this.#entities.length;
  }

  clear() {
    this.#entities = [];
  }
}

/******************************************************************************
 * 🛠️ EntityOrValue
 * ============================================================================
 *
 * ✅ Represents either an entity ID or a direct value. This class validates the
 * provided value and retrieves information from Home Assistant if it's an
 * entity.
 *
 * @class
 */
class EntityOrValue {
  #activeHelper = null;
  #isEntity = false;

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #entity() {
    return this.#isEntity ? this.#activeHelper : null;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue) {
    if (is.string(newValue)) {
      if (!(this.#activeHelper instanceof EntityHelper)) {
        this.#activeHelper = new EntityHelper();
        this.#isEntity = true;
      }
      this.#activeHelper.entityId = newValue;
    } else if (is.number(newValue)) {
      if (!(this.#activeHelper instanceof ValueHelper)) {
        this.#activeHelper = new ValueHelper();
        this.#isEntity = false;
      }
      this.#activeHelper.value = newValue;
    } else {
      this.#activeHelper = null;
      this.#isEntity = false;
    }
  }

  get value() {
    return this.#activeHelper?.value ?? null;
  }
  get isEntity() {
    return this.#isEntity;
  }
  get isValid() {
    return this.#activeHelper?.isValid ?? false;
  }
  get isAvailable() {
    if (!this.#activeHelper) return false;
    return this.#isEntity ? this.#activeHelper.isAvailable || this.#activeHelper.isValid : this.#activeHelper.isValid;
  }

  get state() {
    return this.#entity()?.state ?? null;
  }
  get precision() {
    return this.#entity()?.precision ?? null;
  }
  get name() {
    return this.#entity()?.name ?? null;
  }
  get nameComposition() {
    return this.#entity()?.nameComposition ?? null;
  }
  get formatedEntityState() {
    return this.#entity()?.formatedEntityState ?? null;
  }
  get stateContent() {
    return this.#entity()?.stateContent ?? null;
  }
  set stateContent(newValue) {
    const entity = this.#entity();
    if (entity) entity.stateContent = newValue;
  }
  get stateContentToString() {
    return this.#entity()?.stateContentToString ?? null;
  }
  get entityType() {
    return (
      this.#entity()?.entityType ?? {
        isTimer: false,
        isDuration: false,
        isNumber: false,
        isCounter: false,
        isSynced: false,
      }
    );
  }
  get hasShapeByDefault() {
    return this.#entity()?.hasShapeByDefault ?? false;
  }
  get defaultColor() {
    return this.#entity()?.defaultColor ?? false;
  }
  get hasAttribute() {
    return this.#entity()?.hasAttribute ?? false;
  }
  get defaultAttribute() {
    return this.#entity()?.defaultAttribute ?? null;
  }
  get attributes() {
    return this.#entity()?.attributes ?? null;
  }
  get unit() {
    return this.#entity()?.unit ?? null;
  }
  get stateObj() {
    return this.#entity()?.stateObj ?? null;
  }
  get nameTokens() {
    return this.#entity()?.nameTokens ?? null;
  }
  set nameTokens(tok) {
    const entity = this.#entity();
    if (entity) entity.nameTokens = tok;
  }
  get attribute() {
    return this.#entity()?.attribute ?? null;
  }
  set attribute(newValue) {
    const entity = this.#entity();
    if (entity) entity.attribute = newValue;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this.#entity()?.refresh();
  }
}

/******************************************************************************
 * 🛠️ Manage YAML options
 * ============================================================================
 * structural validation ideas to manage inputs (1.5+).
 * deliberately verbose by design: no external dependencies, fully typed errors,
 * and scales cleanly across multiple card types.
 *
 * @inspired by superstruct (MIT License) - Copyright (c) @ianstormtaylor
 * @see https://github.com/ianstormtaylor/superstruct
 */

class ValidationError extends Error {
  constructor(
    path = [],
    errorCode = null,
    severity = SEV.error,
    fallback = null,
    partialConfig = null,
    allErrors = [],
  ) {
    super();
    this.name = 'ValidationError';
    this.path = path;
    this.errorCode = errorCode;
    this.severity = severity;
    this.partialConfig = partialConfig;
    this.errors = allErrors;
    this.fallback = fallback;
  }
}

const SKIP_PROPERTY = Symbol('SKIP_PROPERTY');

const ERROR_CODES = {
  missingRequiredProperty: { code: 'missingRequiredProperty', severity: SEV.error },
  invalidTypeString: { code: 'invalidTypeString', severity: SEV.error },
  invalidTypeNumber: { code: 'invalidTypeNumber', severity: SEV.error },
  invalidTypeBoolean: { code: 'invalidTypeBoolean', severity: SEV.error },
  invalidTypeArray: { code: 'invalidTypeArray', severity: SEV.error },
  invalidTypeObject: { code: 'invalidTypeObject', severity: SEV.error },
  invalidEnumValue: { code: 'invalidEnumValue', severity: SEV.error },
  invalidUnionType: { code: 'invalidUnionType', severity: SEV.error },
  invalidEntityId: { code: 'invalidEntityId', severity: SEV.error },
  invalidDecimal: { code: 'invalidDecimal', severity: SEV.error },
  invalidActionObject: { code: 'invalidActionObject', severity: SEV.error },
  missingActionKey: { code: 'missingActionKey', severity: SEV.error },
  invalidTheme: { code: 'invalidTheme', severity: SEV.info },
  invalidStateContent: { code: 'invalidStateContent', severity: SEV.error },
  invalidStateContentEntry: { code: 'invalidStateContentEntry', severity: SEV.error },
  appliedDefaultValue: { code: 'appliedDefaultValue', severity: SEV.info },
};

const validateType =
  (typeCheck, errorCode) =>
  (value, path = []) => {
    if (is.nullish(value))
      throw new ValidationError(
        path,
        ERROR_CODES.missingRequiredProperty.code,
        ERROR_CODES.missingRequiredProperty.severity,
      );
    if (!typeCheck(value)) throw new ValidationError(path, errorCode.code, errorCode.severity);
    return value;
  };

const types = {
  string: validateType(is.string, ERROR_CODES.invalidTypeString),
  number: validateType(is.number, ERROR_CODES.invalidTypeNumber),
  boolean: validateType(is.boolean, ERROR_CODES.invalidTypeBoolean),

  array:
    (itemValidator) =>
    (value, path = []) => {
      if (!is.array(value))
        throw new ValidationError(path, ERROR_CODES.invalidTypeArray.code, ERROR_CODES.invalidTypeArray.severity);

      const validItems = [];
      value.forEach((item, index) => {
        const validatedItem = itemValidator(item, [...path, index]);
        if (validatedItem !== SKIP_PROPERTY) {
          validItems.push(validatedItem);
        }
      });
      return validItems;
    },

  object: (schema) => {
    const validator = (value, path = []) => {
      if (!is.plainObject(value)) {
        throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
      }

      const result = {};
      const errors = [];

      for (const [key, fieldValidator] of Object.entries(schema)) {
        try {
          const validatedValue = fieldValidator(value[key], [...path, key]);
          if (validatedValue !== SKIP_PROPERTY) {
            result[key] = validatedValue;
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            if (error.fallback !== null) {
              result[key] = error.fallback;
            }
            errors.push(error);
          } else {
            throw error;
          }
        }
      }

      if (errors.length > 0) {
        throw new ValidationError(errors[0].path, errors[0].errorCode, errors[0].severity, null, result, errors);
      }

      return result;
    };

    validator._schema = schema;
    return validator;
  },

  optional:
    (validator) =>
    (value, path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY;
      try {
        return validator(value, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Si c'est optional, on change la sévérité en INFO
          error.severity = SEV.info;
        }
        throw error;
      }
    },

  fallbackTo:
    (validator, defaultVal) =>
    (value, path = []) => {
      if (value === undefined) return defaultVal;
      try {
        return validator(value, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          if (is.nullish(value)) {
            error.severity = SEV.info;
            error.errorCode = ERROR_CODES.appliedDefaultValue.code;
          } else {
            error.severity = SEV.warning;
          }
          error.fallback = defaultVal;
        }
        throw error;
      }
    },

  optionalString: () => types.optional(types.string),
  optionalNumber: () => types.optional(types.number),
  optionalBoolean: () => types.optional(types.boolean),

  optionalWithDefault: (baseValidator, defaultVal) => types.fallbackTo(types.optional(baseValidator), defaultVal),
  optionalStringWithDefault: (defaultVal) => types.optionalWithDefault(types.string, defaultVal),
  optionalNumberWithDefault: (defaultVal) => types.optionalWithDefault(types.number, defaultVal),
  optionalBooleanWithDefault: (defaultVal) => types.optionalWithDefault(types.boolean, defaultVal),

  enums:
    (allowedValues) =>
    (value, path = []) => {
      if (is.nullish(value)) {
        throw new ValidationError(
          path,
          ERROR_CODES.missingRequiredProperty.code,
          ERROR_CODES.missingRequiredProperty.severity,
        );
      }
      if (!allowedValues.includes(value)) {
        throw new ValidationError(path, ERROR_CODES.invalidEnumValue.code, ERROR_CODES.invalidEnumValue.severity);
      }
      return value;
    },

  enumsWithDefault: (allowedValues, defaultVal) => types.fallbackTo(types.enums(allowedValues), defaultVal),

  theme:
    (allowedValues) =>
    (value, path = []) => {
      if (is.nullish(value) || is.emptyString(value)) return SKIP_PROPERTY;
      const themeMap = {
        battery: 'optimal_when_high',
        memory: 'optimal_when_low',
        cpu: 'optimal_when_low',
      };
      value = themeMap[value] || value;
      if (!allowedValues.includes(value))
        throw new ValidationError(path, ERROR_CODES.invalidTheme.code, ERROR_CODES.invalidTheme.severity);
      return value;
    },

  union:
    (...validators) =>
    (value, path = []) => {
      const errors = [];

      for (const validator of validators) {
        try {
          return validator(value, path);
        } catch (error) {
          errors.push(error.message || error.errorCode);
        }
      }

      throw new ValidationError(path, ERROR_CODES.invalidUnionType.code, ERROR_CODES.invalidUnionType.severity);
    },

  arrayWithValidatedElem:
    (allowedValues) =>
    (value, _path = []) => {
      if (is.nullish(value)) return SKIP_PROPERTY;

      const valueArray = is.array(value) ? value : [value];
      const validItems = valueArray.filter((item) => allowedValues.includes(item));

      if (validItems.length === 0) return SKIP_PROPERTY;

      return validItems;
    },

  jinjaOrArrayWithValidatedElem:
    (allowedValues) =>
    (value, path = []) => {
      if (is.jinja(value)) return value;
      return types.arrayWithValidatedElem(allowedValues)(value, path);
    },

  watermarkObject:
    (schema) =>
    (value, path = []) => {
      if (is.nullish(value) || !is.plainObject(value)) return SKIP_PROPERTY;

      const validateEntry = (key, validator) => {
        try {
          return { key, value: validator(value[key], [...path, key]), error: null };
        } catch (error) {
          if (!(error instanceof ValidationError)) throw error;
          return { key, value: error.fallback ?? undefined, error };
        }
      };

      const results = Object.entries(schema).map(([key, validator]) => validateEntry(key, validator));
      const errors = results.filter((r) => r.error).map((r) => r.error);
      const result = Object.fromEntries(
        results.filter((r) => r.value !== SKIP_PROPERTY && r.value !== undefined).map((r) => [r.key, r.value]),
      );

      if (errors.length > 0) {
        throw new ValidationError(path, 'watermarkValidation', SEV.warning, result, null, errors);
      }

      return result;
    },

  entityId: (value, path = []) => {
    if (is.nullish(value))
      throw new ValidationError(
        path,
        ERROR_CODES.missingRequiredProperty.code,
        ERROR_CODES.missingRequiredProperty.severity,
      );
    if (!is.string(value))
      throw new ValidationError(path, ERROR_CODES.invalidTypeString.code, ERROR_CODES.invalidTypeString.severity);
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(value))
      throw new ValidationError(path, ERROR_CODES.invalidEntityId.code, ERROR_CODES.invalidEntityId.severity);

    return value;
  },

  decimal: (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.unsignedInteger(value))
      throw new ValidationError(path, ERROR_CODES.invalidDecimal.code, ERROR_CODES.invalidDecimal.severity);

    return value;
  },

  tapAction: (value, path = []) => {
    if (!is.plainObject(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidActionObject.code, ERROR_CODES.invalidActionObject.severity);
    }
    if (!is.string(value.action)) {
      throw new ValidationError(
        [...path, 'action'],
        ERROR_CODES.missingActionKey.code,
        ERROR_CODES.missingActionKey.severity,
      );
    }

    return value;
  },

  tapActionWithDefault: (defaultVal) => types.fallbackTo(types.tapAction, defaultVal),

  // CF5 - issue (major) resolved - this used to throw (discarding the WHOLE
  // array via types.fallbackTo(..., SKIP_PROPERTY)) the instant any single zone
  // was momentarily incomplete or two zones didn't tile perfectly — harmless
  // for a YAML power user writing the whole list at once, but a hard "theme
  // disappears" break for the visual editor's row-by-row workflow (add a zone,
  // then fill in min, then max, then a color). Each zone is now kept
  // independently as long as it has a numeric min < max; missing colors/icon or
  // gaps between zones are tolerated (the card just won't recolor a range
  // nothing covers), and zones are sorted by min so edit order never matters —
  // mirrors barStackEntity's own per-item SKIP_PROPERTY leniency instead of an
  // all-or-nothing gate.
  customTheme: (value, _path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.array(value)) return SKIP_PROPERTY;

    const validItems = value
      .filter((item) => is.plainObject(item) && is.number(item.min) && is.number(item.max) && item.min < item.max)
      .map(({ min, max, color, icon_color, bar_color, icon }) => ({
        min,
        max,
        ...(is.string(color) && { color }),
        ...(is.string(icon_color) && { icon_color }),
        ...(is.string(bar_color) && { bar_color }),
        ...(is.string(icon) && { icon }),
      }))
      .sort((a, b) => a.min - b.min);

    return validItems.length ? validItems : SKIP_PROPERTY;
  },

  stateContent: (value, path = []) => {
    if (is.nullishOrEmptyString(value)) return SKIP_PROPERTY;
    if (is.string(value)) return [value];

    if (is.array(value)) {
      const invalidIndex = value.findIndex((v) => !is.string(v));
      if (invalidIndex !== -1) {
        throw new ValidationError(
          [...path, invalidIndex],
          ERROR_CODES.invalidStateContentEntry.code,
          ERROR_CODES.invalidStateContentEntry.severity,
        );
      }
      return value;
    }

    throw new ValidationError(path, ERROR_CODES.invalidStateContent.code, ERROR_CODES.invalidStateContent.severity);
  },
};

function struct(validator, { allowBelowBarPosition = true } = {}) {
  const preProcess = (data) => {
    const result = { ...data };

    if (!data.type.includes('template')) {
      if (is.nonEmptyString(result.name)) {
        result.name = [{ type: 'text', text: result.name }];
      } else if (is.plainObject(result.name)) {
        result.name = [result.name];
      }
    }

    if (is.nullish(result.icon_tap_action) && is.string(result.entity)) {
      const domain = HassProviderSingleton.getEntityDomain(result.entity);
      const shouldPatch = HA_CONTEXT.actions.toggleDomain.includes(domain);
      if (shouldPatch) result.icon_tap_action = HA_CONTEXT.actions.toggle;
    }

    if (['top', 'bottom', 'overlay', 'background'].includes(result.bar_position)) delete result.bar_size; // avoid conflict

    return result;
  };
  const postProcess = (data) => {
    const result = { ...data };

    if (!result.layout) result.layout = CARD.layout.orientations.horizontal.label;

    // 'below' isn't a legal bar_position for every schema (the Feature one
    // restricts it to ['default', 'top', 'bottom']) - this rewrite would
    // otherwise inject a value never validated as legal there.
    if (
      allowBelowBarPosition &&
      result.bar_size === CARD.style.bar.sizeOptions.xlarge.label &&
      result.bar_position === 'default'
    )
      result.bar_position = 'below';

    if (result.bar_position !== 'overlay' && result.bar_single_line) result.bar_single_line = false;

    return result;
  };
  return {
    validate: (data) => {
      try {
        const preProcessed = preProcess(data);
        return { isValid: true, config: postProcess(validator(preProcessed)), error: null, path: null };
      } catch (error) {
        return { isValid: false, config: null, error: error.message, path: error.path };
      }
    },

    parse: (data) => {
      try {
        const preProcessed = preProcess(data);
        const result = postProcess(validator(preProcessed));
        return {
          isValid: true,
          config: result,
          path: null,
          errorCode: null,
          severity: null,
          errors: [],
        };
      } catch (error) {
        // extract error wo duplicates
        const extractAllErrors = (errRoot) => {
          const allErrors = [];
          const seen = new Set();

          const addError = (err) => {
            const key = `${JSON.stringify(err.path)}-${err.errorCode}`;
            if (!seen.has(key)) {
              seen.add(key);
              allErrors.push({
                path: err.path,
                errorCode: err.errorCode,
                severity: err.severity,
              });
            }
          };

          if (is.nonEmptyArray(errRoot.errors)) {
            errRoot.errors.forEach((subError) => {
              if (subError instanceof ValidationError) {
                extractAllErrors(subError).forEach(addError);
              } else if (subError.errorCode) {
                addError(subError);
              }
            });
          } else if (errRoot.errorCode) {
            addError(errRoot);
          }

          return allErrors;
        };

        const allErrors = extractAllErrors(error);
        const mainError = allErrors.find((e) => e.severity === 'error') || allErrors[0] || null;

        const partialConfig = error.partialResult ?? error.partialConfig ?? null;
        const postProcessedPartialConfig = partialConfig !== null ? postProcess(partialConfig) : null;

        return {
          isValid: !mainError || mainError.severity !== 'error',
          config: postProcessedPartialConfig,
          path: mainError?.path ?? null,
          errorCode: mainError?.errorCode ?? null,
          severity: mainError?.severity ?? null,
          errors: allErrors,
        };
      }
    },

    extend: (additionalFields) => {
      if (!validator._schema) {
        throw new Error('Can only extend object schemas created with types.object');
      }

      const newSchema = {
        ...validator._schema,
        ...additionalFields,
      };

      return struct(types.object(newSchema));
    },

    delete: (fieldsToDelete) => {
      if (!validator._schema) {
        throw new Error('Can only delete from object schemas created with types.object');
      }

      const fieldsArray = is.array(fieldsToDelete) ? fieldsToDelete : [fieldsToDelete];
      const newSchema = { ...validator._schema };
      fieldsArray.forEach((field) => {
        delete newSchema[field];
      });

      return struct(types.object(newSchema));
    },

    fields: () => {
      if (!validator._schema) {
        throw new Error('Can only get fields from object schemas created with types.object');
      }
      return Object.keys(validator._schema);
    },
  };
}

types.discriminatedUnion =
  (key, mapping) =>
  (value, path = []) => {
    if (!is.plainObject(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
    }

    const discriminator = value[key];

    if (!is.string(discriminator)) {
      throw new ValidationError(
        [...path, key],
        ERROR_CODES.invalidTypeString.code,
        ERROR_CODES.invalidTypeString.severity,
      );
    }

    const validator = mapping[discriminator];

    if (!validator) {
      throw new ValidationError(
        [...path, key],
        ERROR_CODES.invalidEnumValue.code,
        ERROR_CODES.invalidEnumValue.severity,
      );
    }

    return validator(value, path);
  };

const nameItem = types.discriminatedUnion('type', {
  text: types.object({
    type: types.enums(['text']),
    text: types.string,
  }),

  entity: types.object({
    type: types.enums(['entity']),
  }),

  device: types.object({
    type: types.enums(['device']),
  }),

  area: types.object({
    type: types.enums(['area']),
  }),

  floor: types.object({
    type: types.enums(['floor']),
  }),
});

types.name = types.array(nameItem);

const barStackEntity = types.fallbackTo(
  types.object({
    entity: types.entityId,
    attribute: types.optional(types.string),
    color: types.optionalString(),
    // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
    // center_zero: placed on the negative arm instead of the positive one.
    // No-op otherwise.
    subtract: types.optionalBooleanWithDefault(false),
  }),
  SKIP_PROPERTY,
);

const watermarkSchema = {
  // number (fixed) | string (entity id) | { jinja } - mirrors
  // min_value/max_value's explicit jinja shape rather than sniffing a bare
  // string (an entity id and a Jinja template are both strings; disambiguating
  // them at runtime is exactly what min_value/max_value moved away from).
  low: types.fallbackTo(
    types.union(types.number, types.string, types.object({ jinja: types.string })),
    CARD.config.defaults.watermark.low,
  ),
  low_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.low_as),
  low_attribute: types.optionalString(),
  low_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.low_color),
  high: types.fallbackTo(
    types.union(types.number, types.string, types.object({ jinja: types.string })),
    CARD.config.defaults.watermark.high,
  ),
  high_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.high_as),
  high_attribute: types.optionalString(),
  high_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.high_color),
  opacity: types.optionalNumberWithDefault(CARD.config.defaults.watermark.opacity),
  type: types.enumsWithDefault(
    ['blended', 'area', 'striped', 'triangle', 'round', 'line'],
    CARD.config.defaults.watermark.type,
  ),
  line_size: types.optionalStringWithDefault(CARD.config.defaults.watermark.line_size),
  disable_low: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_low),
  disable_high: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_high),
};

class YamlSchemaFactory {
  static get feature() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string): min_value: 10 | {value: 10} |
        // {entity, attribute} | {jinja}.
        min_value: types.optional(
          types.union(
            types.number,
            types.object({ value: types.number }),
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
        ),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(
          types.union(
            types.number,
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
          100,
        ),

        // ─── Appearance ─────────────────────────────────────────────────────
        bar_color: types.optionalString(),
        // Unlike Card/Badge/Template, a Feature's row height is fixed
        // (--feature-height, see the .entity-progress-feature CSS rule) and
        // doesn't scale with bar_size - so 'small' (8px) looks lost inside a
        // 42px row. 'xlarge' matches --feature-height by construction.
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'xlarge',
        ), //[('small', 'medium', 'large', 'xlarge')]
        // 'up' is excluded here (Card/Template only): every CSS rule for
        // up-orientation is scoped .vertical.up-orientation, and a Feature
        // never gets the .vertical class (no 'layout' option in this
        // schema) - it would validate but have zero visual effect.
        bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressCalc.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(['linear', 'log'], 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'top', 'bottom'], 'default'),
        bar_segments: types.optionalNumber(),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),

        // ─── Theme & Watermark ──────────────────────────────────────────────
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // ─── Bar Stack ──────────────────────────────────────────────────────
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(['stacked', 'proportional', 'net'], 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),
      }),
      { allowBelowBarPosition: false },
    );
  }
  static get card() {
    return struct(
      types.object({
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        name: types.optional(types.name),
        decimal: types.decimal,
        unit: types.optionalString(),
        disable_unit: types.optionalBooleanWithDefault(false),
        unit_spacing: types.enumsWithDefault(Object.values(CARD.config.unit.unitSpacing), 'auto'), //['auto', 'space', 'no-space']
        // Explicit shape instead of type-sniffing a scalar (number vs entity-id
        // string vs jinja-looking string): min_value: 10 | {value: 10} |
        // {entity, attribute} | {jinja}.
        min_value: types.optional(
          types.union(
            types.number,
            types.object({ value: types.number }),
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
        ),
        // Explicit shape, mirrors min_value: max_value: 10 | {entity,
        // attribute} | {jinja}. The legacy bare entity-id string is rewritten
        // into the map form by _customizeConfig before this schema ever sees it
        // (single call site, see BaseConfigHelper.set config), so no string
        // form is needed here.
        max_value: types.fallbackTo(
          types.union(
            types.number,
            types.object({ entity: types.entityId, attribute: types.optionalString() }),
            types.object({ jinja: types.string }),
          ),
          100,
        ),

        // ─── Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        // Only engages outside center_zero with a well-formed positive range
        // (min > 0, max > min) — ProgressCalc.isLogScale falls back to linear
        // otherwise, so an invalid combination degrades quietly instead of
        // producing NaN.
        bar_scale: types.enumsWithDefault(['linear', 'log'], 'linear'),
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        icon_animation: types.enumsWithDefault(
          ['none', 'spin', 'pulse', 'bounce', 'shake', 'ping', 'reveal', 'washing_machine', 'battery_charging'],
          'none',
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        // ─── Visibility & Content ===
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar']),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        // Badge/badgeTemplate opt out (see their own .delete(['multiline'])):
        // the row is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // ─── Badges ===
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // ─── Theme & Watermark === theme: types.theme(['optimal_when_low',
        // 'optimal_when_high', 'light', 'temperature', 'humidity', 'pm25',
        // 'voc']),
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),
        alert_when: types.optional(
          types.object({
            above: types.optionalNumber(),
            below: types.optionalNumber(),
            color: types.optionalString(),
            highlight: types.enumsWithDefault(['border', 'background'], 'border'),
            // Left genuinely optional (no forced default): the effective
            // default depends on `highlight` (border -> blink, background ->
            // static, both unchanged from pre-1.6 behavior) and is resolved
            // in CSS/ViewCore, not here - see .alert-active in the stylesheet.
            animation: types.optional(types.enums(['static', 'blink', 'ping'])),
          }),
        ),

        // ─── Bar Stack ===
        bar_stack: types.optional(
          types.object({
            mode: types.enumsWithDefault(['stacked', 'proportional', 'net'], 'stacked'),
            entities: types.optional(types.array(barStackEntity)),
          }),
        ),

        // ─── Actions ===
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  }

  static get badge() {
    return YamlSchemaFactory.card.delete([
      'bar_position',
      'badge_icon',
      'badge_color',
      'force_circular_background',
      'layout',
      'height',
      'icon_tap_action',
      'icon_hold_action',
      'icon_double_tap_action',
      'multiline',
      'icon_animation',
      // Requires the 'horizontal' layout class (see the CSS rule on
      // .progress-container), which badges never get since they have no
      // 'layout' key (deleted above) - keeping it would accept a config that
      // silently has no visual effect.
      'bar_max_width',
      // Both only ever apply via the .overlay class (see .overlay.single-line
      // and .overlay.text-shadow), which requires bar_position: 'overlay' -
      // deleted above, so badges never get it either. Same dead-option
      // reasoning as bar_max_width.
      'bar_single_line',
      'text_shadow',
      // Not CSS-dead like the two above - a design choice: a trend arrow
      // icon doesn't read well at badge scale (--ha-badge-size, ~36px).
      'trend_indicator',
    ]).extend({
      // 'up' needs .vertical.overlay (see bar_orientation's CSS) - a badge
      // has neither `layout` nor `bar_position` (both deleted above), so it
      // would validate but have zero visual effect, same reasoning as
      // YamlSchemaFactory.feature.
      bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
      // 'xlarge' unconditionally sets --progress-container-height to 42px
      // (see the .xlarge CSS rule) - a badge's total height is capped at
      // --ha-badge-size (36px default), so xlarge would demand a taller
      // progress-container than the badge itself, overflowing it.
      bar_size: types.enumsWithDefault(['small', 'medium', 'large'], 'small'),
    });
  }

  static get template() {
    return struct(
      types.object({
        // ─── Entity & Data ===
        entity: types.optional(types.entityId),
        name: types.optionalString(),
        secondary: types.optionalString(),
        // badgeTemplate opts out (see its own .delete(['multiline'])): the row
        // is too small for a second line there.
        multiline: types.optionalBooleanWithDefault(false),
        percent: types.optionalString(),

        // ─── Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        // [('radius', 'glass', 'gradient', 'shimmer')]
        bar_effect: types.jinjaOrArrayWithValidatedElem(
          Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label),
        ),
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
        bar_segments: types.optionalNumber(),
        icon_animation: types.enumsWithDefault(
          ['none', 'spin', 'pulse', 'bounce', 'shake', 'ping', 'reveal', 'washing_machine', 'battery_charging'],
          'none',
        ),
        layout: types.enumsWithDefault(
          Object.values(CARD.layout.orientations).map((e) => e.label),
          'horizontal',
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalWithDefault(
          types.union(
            types.boolean,
            types.object({
              value: types.optionalNumberWithDefault(0),
              growth_percent: types.optionalBooleanWithDefault(false),
            }),
          ),
          false,
        ),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // ─── Actions ===
        tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.moreInfo),
        hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_hold_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
        icon_double_tap_action: types.tapActionWithDefault(HA_CONTEXT.actions.none),
      }),
    );
  }

  static get badgeTemplate() {
    return YamlSchemaFactory.template.delete([
      'bar_position',
      'badge_icon',
      'badge_color',
      'force_circular_background',
      'layout',
      'height',
      'icon_tap_action',
      'icon_hold_action',
      'icon_double_tap_action',
      'multiline',
      'icon_animation',
      // Same reason as YamlSchemaFactory.badge: no 'layout' key means no
      // 'horizontal' class, so the CSS rule never engages.
      'bar_max_width',
      // Same reason as YamlSchemaFactory.badge: both only apply via the
      // .overlay class, which requires bar_position: 'overlay' - deleted
      // above.
      'bar_single_line',
      'text_shadow',
      // Same design choice as YamlSchemaFactory.badge: too small a scale for
      // a trend arrow icon to read well.
      'trend_indicator',
    ]).extend({
      // Same reason as YamlSchemaFactory.badge: 'up' needs .vertical.overlay,
      // neither of which a badge template ever gets.
      bar_orientation: types.enumsWithDefault(['ltr', 'rtl'], 'ltr'),
      // Same reason as YamlSchemaFactory.badge: 'xlarge' would demand a
      // 42px-tall progress-container inside a badge capped at
      // --ha-badge-size (36px), overflowing it.
      bar_size: types.enumsWithDefault(['small', 'medium', 'large'], 'small'),
    });
  }
}

/******************************************************************************
 * 🛠️ BaseConfigHelper
 * ============================================================================
 *
 * ✅ base class for managing and validating all card configuration.
 *
 * @class
 */

class BaseConfigHelper {
  #hassProvider = HassProviderSingleton.getInstance();
  #HAError = null;
  #lastMsgConsole = null;
  #log = null;
  #actions = {
    card: { tap: null, doubleTap: null, hold: null },
    icon: { tap: null, doubleTap: null, hold: null },
  };
  #actionsReady = false;
  _isDefined = false;
  _configParsed = {};
  _configResolved = {}; // valeurs dérivées de la config, calculées une seule fois par set config()
  _yamlSchema = null;

  constructor() {
    this.#log = initLogger(this, false);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get config() {
    return this._configResolved;
  }

  set config(config) {
    this.#actionsReady = false;
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    this._configParsed = this._yamlSchema.parse(this.constructor._customizeConfig(config));
    this._configResolved = BaseConfigHelper.#resolveConfig(this._configParsed?.config);

    this.#lastMsgConsole = null;
  }

  // Calcule une seule fois, à partir de la config validée, la config brute +
  // les valeurs dérivées consommées ailleurs (évite de recalculer à chaque
  // accès).
  static #resolveConfig(config) {
    return {
      ...config,
      centerZero: BaseConfigHelper.#resolveCenterZero(config?.center_zero),
    };
  }

  /**
   * Normalise `center_zero` (boolean | { value: number }) en une forme
   * exploitable. - false / undefined -> désactivé, zéro = 0 - true -> activé,
   * zéro = 0 - { value: 230 } -> activé, zéro = 230
   */
  static #resolveCenterZero(centerZero) {
    if (!centerZero) return { enabled: false, zeroValue: 0, growthPercent: false };
    if (centerZero === true) return { enabled: true, zeroValue: 0, growthPercent: false };
    return {
      enabled: true,
      zeroValue: is.number(centerZero.value) ? centerZero.value : 0,
      growthPercent: Boolean(centerZero.growth_percent),
    };
  }

  static _customizeConfig(config) {
    return config;
  }

  // No-op here: Template/BadgeTemplate cards' schema never had
  // max_value/disable_unit/additions to begin with. Matches _customizeConfig's
  // own polymorphic no-op above, so the editor's "Migrate config" button can
  // call this generically regardless of which config helper is active.
  static _migrateLegacyOptions(config) {
    return config;
  }

  static #logDeprecatedOption(config) {
    if (config.navigate_to !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - navigate_to option is deprecated and has been removed.`,
      );
    if (config.show_more_info !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - show_more_info option is deprecated and has been removed.`,
      );
    if (['battery', 'cpu', 'memory'].includes(config.theme))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - theme: ${
          config.theme
        } is deprecated and will be removed in a future release. Please migrate to the recommended alternative...`,
      );
    // max_value used to be number|entity-id-string, disambiguated by sniffing
    // the value's shape at runtime (the same pattern that caused min_value's
    // freeze bug). The entity form is now an explicit map; the bare string form
    // is auto-migrated for this session (see CardConfigHelper._customizeConfig)
    // but should be updated in the YAML.
    if (is.nonEmptyString(config.max_value))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - max_value: <entity id> is deprecated and will be removed in a future release. ` +
          'Please migrate to max_value: { entity: <entity id>, attribute: <optional> }. Your configuration was automatically migrated for this session.',
      );
    if (config.disable_unit !== undefined)
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - disable_unit is deprecated and will be removed in a future release. ` +
          "Please migrate to hide: ['unit', ...]. Your configuration was automatically migrated for this session.",
      );
    // additions used to be a bare array of {entity, attribute}; it is now the
    // entities list of bar_stack, alongside a mode ('stacked' by default,
    // 'proportional' preserves the legacy renormalized-total behavior exactly -
    // see CardConfigHelper._customizeConfig.
    if (is.array(config.additions))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - additions is deprecated and will be removed in a future release. ` +
          "Please migrate to bar_stack: { mode: 'proportional', entities: [...] }. Your configuration was automatically migrated for this session.",
      );
  }

  get isValid() {
    return this._isDefined ? this._configParsed.isValid && this.#HAError === null : false;
  }

  get _errorMessage() {
    const errorSrc = this.#HAError ? this.#HAError : this._configParsed;
    return {
      content: `${errorSrc.path}: ${this.#hassProvider.getMessage(errorSrc.errorCode)}`,
      sev: errorSrc.severity,
    };
  }
  get msg() {
    return this._isDefined && (this._configParsed.errorCode || this.#HAError) ? this._errorMessage : null;
  }

  get action() {
    if (!this.#actionsReady) {
      this.#actions = {
        card: {
          tap: this.#getAction('tap_action'),
          doubleTap: this.#getAction('double_tap_action'),
          hold: this.#getAction('hold_action'),
        },
        icon: {
          tap: this.#getAction('icon_tap_action'),
          doubleTap: this.#getAction('icon_double_tap_action'),
          hold: this.#getAction('icon_hold_action'),
        },
      };
      this.#actionsReady = true;
    }
    return this.#actions;
  }
  #getAction(action) {
    return this.isValid ? this.config?.[action]?.action : null;
  }

  checkConfig() {
    this._showConfigErrorConsole(); // structure, type...
    this._checkHAEnvironment(); // ha env: entity, attribute ...
  }

  _showConfigErrorConsole() {
    if (is.nonEmptyArray(this._configParsed.errors)) {
      const curError = this._configParsed.errors[0];
      const msgConsole = `${curError.path.join('.')} : ${this._hassProvider.getMessage(curError.errorCode)}`;
      if (this.#lastMsgConsole !== msgConsole) {
        this.#lastMsgConsole = msgConsole;
        this.#log[curError.severity]?.(msgConsole);
        this.#log[curError.severity]?.('config: ', this.config);
      }
    }
  }

  _checkHAEnvironment() {
    const ENTITY_NOT_FOUND = 'entityNotFound';
    const ATTRIBUTE_NOT_FOUND = 'attributeNotFound';
    const resolve = (key) => (is.nonEmptyString(key) ? this._hassProvider.getEntityStateObj(key) : null);

    const entityState = resolve(this.config.entity);
    const maxValueEntity = is.plainObject(this.config.max_value) ? this.config.max_value.entity : null;
    const maxValueAttr = is.plainObject(this.config.max_value) ? this.config.max_value.attribute : null;
    const maxValueState = resolve(maxValueEntity);
    const minValueEntity = is.plainObject(this.config.min_value) ? this.config.min_value.entity : null;
    const minValueAttr = is.plainObject(this.config.min_value) ? this.config.min_value.attribute : null;
    const minValueState = resolve(minValueEntity);
    const lowWMState = resolve(this.config?.watermark?.low);
    const highWMState = resolve(this.config?.watermark?.high);

    const checks = [
      {
        condition:
          is.string(this.config.attribute) && entityState && !has.own(entityState.attributes, this.config.attribute),
        path: 'attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(maxValueEntity) && !maxValueState,
        path: MAX_VALUE_ENTITY_PATH,
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(maxValueAttr) && maxValueState && !has.own(maxValueState.attributes, maxValueAttr),
        path: 'max_value.attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(minValueEntity) && !minValueState,
        path: MIN_VALUE_ENTITY_PATH,
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(minValueAttr) && minValueState && !has.own(minValueState.attributes, minValueAttr),
        path: 'min_value.attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(this.config.watermark?.low) && !lowWMState,
        path: 'watermark.low',
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.low_attribute) &&
          lowWMState &&
          !has.own(lowWMState.attributes, this.config.watermark.low_attribute),
        path: 'watermark.low_attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
      {
        condition: is.nonEmptyString(this.config.watermark?.high) && !highWMState,
        path: 'watermark.high',
        errorCode: ENTITY_NOT_FOUND,
      },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.high_attribute) &&
          highWMState &&
          !has.own(highWMState.attributes, this.config.watermark.high_attribute),
        path: 'watermark.high_attribute',
        errorCode: ATTRIBUTE_NOT_FOUND,
      },
    ];

    const failed = checks.find((c) => c.condition);
    this.#HAError = failed ? { path: failed.path, errorCode: failed.errorCode, severity: SEV.error } : null;
  }

  get _hassProvider() {
    return this.#hassProvider;
  }
}

class CardConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.card;

  // center_zero with no explicit min_value would otherwise default to 0
  // (CARD.config.value.min), making the negative half meaningless (zeroValue -
  // min = 0, nothing to render on that side). Default it to the symmetric
  // negative of max_value instead - but only when max_value is a plain number
  // (or absent, i.e. the 100 default); an entity/jinja-based max can't be
  // mirrored at this config-negotiation stage. An explicit min_value (even 0)
  // is always left untouched.
  static _applyCenterZeroMinDefault(config, normalized) {
    if (!config?.center_zero || !is.nullish(config?.min_value)) return normalized;
    const maxForSymmetry = is.number(normalized?.max_value) ? normalized.max_value : CARD.config.value.max;
    return { ...normalized, min_value: -maxForSymmetry };
  }

  // Legacy-syntax rewriting only — never touches unrelated defaults
  // (center_zero's min_value fill-in, device_class attribute defaults live in
  // _customizeConfig instead). Extracted so the editor's "Migrate config"
  // button can reuse exactly this transformation (via the config helper,
  // polymorphically) without also re-applying those unrelated defaults. CF5 -
  // issue (major) resolved - max_value used to be number|entity-id-string with
  // the mode sniffed at runtime (is.number/is.string), the exact pattern that
  // caused min_value's freeze bug. Bare-entity-string configs (pre-1.6) are
  // migrated here into the explicit { entity, attribute } map before
  // validation, so every downstream consumer only ever sees a number or that
  // map — no sniffing left anywhere. The deprecation warning for the bare form
  // is logged separately, see BaseConfigHelper.#logDeprecatedOption.
  static _migrateLegacyOptions(config) {
    let normalized = config;
    if (is.nonEmptyString(config?.max_value)) {
      normalized = {
        ...config,
        max_value: { entity: config.max_value, attribute: config.max_value_attribute },
        max_value_attribute: undefined,
      };
    }
    // disable_unit used to be a dedicated boolean; 'unit' is now just another
    // hide target, consistent with icon/name/value/progress_bar. Skip the fold
    // when hide is a Jinja template (a string): merging into user-authored
    // template logic isn't possible, so disable_unit is left untouched and the
    // runtime keeps honoring it as a fallback (see ViewBase's
    // #percentHelper.configure call, hasDisabledUnit).
    if (config?.disable_unit === true && !is.jinja(config?.hide)) {
      const currentHide = is.array(config.hide) ? config.hide : [];
      normalized = {
        ...normalized,
        hide: currentHide.includes('unit') ? currentHide : [...currentHide, 'unit'],
        disable_unit: undefined,
      };
    }
    // additions (bare array) -> bar_stack.entities, under the 'proportional'
    // mode so the renormalized-total rendering behaves exactly as before (see
    // #logDeprecatedOption).
    if (is.array(config?.additions)) {
      normalized = {
        ...normalized,
        bar_stack: { mode: 'proportional', entities: config.additions },
        additions: undefined,
      };
    }
    return normalized;
  }

  static _customizeConfig(config) {
    let normalized = CardConfigHelper._migrateLegacyOptions(config);
    normalized = CardConfigHelper._applyCenterZeroMinDefault(config, normalized);
    return {
      ...normalized,
      ...(is.nonEmptyString(normalized?.entity) && is.nullish(normalized?.attribute)
        ? {
            attribute:
              HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(normalized?.entity)]?.attribute,
          }
        : {}),
      ...(is.nonEmptyString(normalized?.max_value?.entity) && is.nullish(normalized?.max_value?.attribute)
        ? {
            max_value: {
              ...normalized.max_value,
              attribute:
                HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(normalized.max_value.entity)]
                  ?.attribute,
            },
          }
        : {}),
    };
  }

  get stateContent() {
    return this.config?.state_content ?? [];
  }
}

class BadgeConfigHelper extends CardConfigHelper {
  _yamlSchema = YamlSchemaFactory.badge;
}

class FeatureConfigHelper extends CardConfigHelper {
  _yamlSchema = YamlSchemaFactory.feature;
}

class TemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.template;
}

class BadgeTemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = YamlSchemaFactory.badgeTemplate;
}

/******************************************************************************
 * 🛠️ ViewCore
 * ============================================================================
 *
 * ✅ A view class for rendering minimal cards in a user interface. This class
 * manages configuration, entity states, user interactions, and visual
 * appearance of cards including layouts, orientations, watermarks, and
 * interactive elements.
 *
 * ViewCore ├── ViewBase │ ├── CardView │ ├── BadgeView │ └── FeatureView ├──
 * CardTemplateView └── BadgeTemplateView
 *
 * @class
 * @description Handles the display and behavior of minimal cards with support
 *              for Home Assistant entities, user actions, and visual
 *              customization (watermarks, shapes, orientations, clickable
 *              elements).
 *
 * @example
 * const cardView = new ViewCore();
 * cardView.config = {
 *   entity: 'sensor.temperature',
 *   layout: 'vertical',
 *   bar_orientation: 'rtl',
 *   force_circular_background: true,
 *   watermark: { low: 10, high: 30, type: 'gradient' }
 * };
 *
 * // Check if components are hidden
 * if (!cardView.hasComponentHiddenFlag('icon')) {
 *   // Render icon
 * }
 *
 * // Access computed properties
 * const hasShape = cardView.hasVisibleShape;
 * const isClickable = cardView.hasClickableCard;
 */
class ViewCore {
  _hassProvider = HassProviderSingleton.getInstance();
  _lastPercent = null;
  _configHelper = new BaseConfigHelper(); // Base config
  _currentValue = new EntityOrValue();
  _lowValue = new EntityOrValue();
  _highValue = new EntityOrValue();

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set config(config) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;
    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      stateContent: this._configHelper.stateContent,
    });
    Object.assign(this._lowValue, {
      value: this._configHelper.config?.watermark?.low,
      attribute: this._configHelper.config?.watermark?.low_attribute,
    });
    Object.assign(this._highValue, {
      value: this._configHelper.config?.watermark?.high,
      attribute: this._configHelper.config?.watermark?.high_attribute,
    });
  }

  get config() {
    return this._configHelper?.config;
  }
  refresh(hass) {
    this._hassProvider.hass = hass;
    this._currentValue.refresh();
    this._lowValue.refresh();
    this._highValue.refresh();
  }
  get entity() {
    return this.config?.entity;
  }
  get cardSize() {
    return this.config
      ? (CARD.layout.orientations[this.config.layout]?.grid?.grid_rows ?? 1)
      : CARD.layout.orientations.horizontal.grid.grid_rows;
  }
  get cardLayoutOptions() {
    if (!this.config) return CARD.layout.orientations.horizontal.grid;
    const layout = structuredClone(CARD.layout.orientations[this.config.layout]);
    layout.grid.grid_min_rows = this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label)
      ? 1
      : layout.grid.grid_min_rows +
        (this.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label ||
        (this.config.layout === 'horizontal' && this.config.bar_position === 'below') ||
        (this.config.layout === 'vertical' &&
          ['default', 'below'].includes(this.config.bar_position) &&
          this.config.bar_size !== 'small')
          ? 1
          : 0);
    return layout.grid;
  }
  _getEntityColor() {
    if (this._currentValue.state === HA_CONTEXT.entity.state.unavailable) return CARD.style.color.unavailable;
    if (this._currentValue.state === HA_CONTEXT.entity.state.notFound) return CARD.style.color.notFound;
    return ThemeManager.adaptColor(this._currentValue.defaultColor || CARD.style.color.default);
  }

  get barColor() {
    return this.entity && !this._configHelper.config.bar_color ? this._getEntityColor() : null;
  }
  get iconColor() {
    return this.entity && !this._configHelper.config.color ? this._getEntityColor() : null;
  }
  get hasClickableIcon() {
    return ViewCore.#hasAction([
      this._configHelper.action.icon.tap,
      this._configHelper.action.icon.hold,
      this._configHelper.action.icon.doubleTap,
    ]);
  }
  get hasClickableCard() {
    return ViewCore.#hasAction([
      this._configHelper.action.card.tap,
      this._configHelper.action.card.hold,
      this._configHelper.action.card.doubleTap,
    ]);
  }
  get hasReversedSecondaryInfoRow() {
    return (
      this.config.layout === 'horizontal' &&
      this.config.bar_position === 'default' &&
      this.config.reverse_secondary_info_row
    ); // ─── true
  }
  get hasVisibleShape() {
    // this.config.force_circular_background === true
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape;
  }
  get _hasDefaultShape() {
    return this._currentValue.hasShapeByDefault && ViewCore.#hasAction([this._configHelper.action.icon.tap]);
  }
  get _hasInteractiveShape() {
    return this._configHelper.action.icon.tap !== HA_CONTEXT.actions.none.action;
  }
  get hasWatermark() {
    return this.config.watermark !== undefined;
  }
  get barEffectsEnabled() {
    return this.config.bar_effect !== undefined;
  }
  get watermark() {
    const { watermark } = this.config;
    return watermark
      ? {
          ...watermark,
          low: this._lowValue.value,
          low_color: ThemeManager.adaptColor(watermark.low_color),
          high: this._highValue.value,
          high_color: ThemeManager.adaptColor(watermark.high_color),
        }
      : null;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getTrend(currentPercent) {
    const result =
      this._lastPercent === null
        ? 'flat'
        : this._lastPercent < currentPercent
          ? 'up'
          : this._lastPercent > currentPercent
            ? 'down'
            : 'flat';
    this._lastPercent = currentPercent;

    return result;
  }

  // icon_animation only makes sense for domains with a real on/active vs
  // off/idle semantics (fan spinning, media playing…). A plain measurement
  // (sensor, battery %, input_number…) has no such state — without this gate a
  // battery sensor spun forever, since its numeric state never matched the
  // resting-state exclusion list below.
  static #ANIMATABLE_DOMAINS = new Set([
    'fan',
    'light',
    'switch',
    'climate',
    'humidifier',
    'vacuum',
    'media_player',
    'water_heater',
    'siren',
    'alarm_control_panel',
    'automation',
    'script',
    'input_boolean',
    'remote',
    'lock',
    'cover',
    'valve',
    'binary_sensor',
    'timer',
  ]);

  get isEntityActive() {
    if (!this._currentValue.isAvailable) return false;
    if (!ViewCore.#ANIMATABLE_DOMAINS.has(HassProviderSingleton.getEntityDomain(this.entity))) return false;
    const state = String(this._currentValue.state ?? '').toLowerCase();
    return !['off', 'idle', 'standby', 'paused', 'closed', 'locked', 'docked', 'disarmed', 'none', ''].includes(state);
  }

  // No standard domain/state pair means "charging" the way isEntityActive's
  // resting-state list means "off" - it's usually an attribute on the entity
  // itself, and its name isn't standardized across integrations. Checked in
  // likelihood order; first one present wins. Covers both a boolean flag
  // (true) and a string status enum (e.g. battery_state: 'charging').
  static #CHARGING_ATTRIBUTES = ['battery_charging', 'charging', 'is_charging'];

  // Exact enum values, not a substring match: Renault's own charge_state
  // sensor has both 'charge_in_progress' AND 'charge_ended' /
  // 'waiting_for_a_planned_charge', which all contain "charge" - a loose
  // match would treat "finished" and "not yet started" as charging too. Same
  // trap with MG SAIC's "Charging Status" sensor (bmsChrgSts): "charging
  // (ac)"/"charging (dc)"/"super offboard charging" are actively charging,
  // but "charging finished"/"charging stopped"/"fault charging"/"scheduled
  // charging" all also contain "charging" while meaning the opposite.
  static #CHARGING_STATES = new Set([
    'charging',
    'charge_in_progress',
    'v2g_charging_normal',
    'charging (ac)',
    'charging (dc)',
    'super offboard charging',
  ]);

  // EV integrations tend to report charging as the entity's own state rather
  // than an attribute, in one of two shapes: a text status sensor (Tesla
  // Fleet's sensor.<car>_charging_state, state === 'charging') or, more
  // canonically, a binary_sensor with device_class: battery_charging (BYD's
  // hass-byd-vehicle "is_charging"), where 'on' means charging - never
  // 'charging' itself, since binary_sensor is always on/off. The device_class
  // check keeps a bare 'on' from matching any unrelated on/off entity a user
  // might point icon_animation at.
  static #entityReportsCharging(hassProvider, entityId) {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    if (ViewCore.#CHARGING_STATES.has(state)) return true;
    if (state === 'on' && hassProvider.getEntityProp(entityId, 'device_class') === 'battery_charging') return true;
    return ViewCore.#CHARGING_ATTRIBUTES.some((attr) => {
      const value = hassProvider.getEntityAttribute(entityId, attr);
      return value === true || String(value).toLowerCase() === 'charging';
    });
  }

  // Trust the card's own `entity` first - it's what the user actually
  // configured, and a same-device sibling should never shadow a signal
  // already present on it. Falls back to scanning every same-device entity
  // (not just ones whose id contains "charg") for integrations that split
  // the percentage and the charging status across two entities: Home
  // Assistant's own Companion App is the case that forced this - its
  // charging-status entity is named battery_state, no "charg" substring
  // anywhere, which an entity_id-based guess (like washing_machine's brands)
  // would never find, even though its state is plain 'charging'.
  get isBatteryCharging() {
    const hassProvider = HassProviderSingleton.getInstance();
    if (ViewCore.#entityReportsCharging(hassProvider, this.entity)) return true;
    return hassProvider
      .getSameDeviceEntities(this.entity)
      .some((id) => ViewCore.#entityReportsCharging(hassProvider, id));
  }

  // epb-icon-charge's clip-path is calibrated to the plain "mdi:battery"
  // outline. MDI's charging/bluetooth battery variants (battery-charging-60,
  // battery-bluetooth...) draw a bolt or bluetooth glyph that shifts the
  // outline within the icon's viewBox, so the fill wipe no longer lines up on
  // those - the CSS applies a compensating offset via this flag instead of
  // changing which icon is shown.
  get isBatteryIconShifted() {
    const icon = this._configHelper.config.icon || this._hassProvider.getEntityProp(this.entity, 'icon');
    return is.nonEmptyString(icon) && /charging|bluetooth/i.test(icon);
  }

  // Home Connect's sensor.<appliance>_operation_state uses 'run', Miele's
  // sensor.<appliance>_status uses 'in_use' - both plain `sensor` entities,
  // which isEntityActive's domain gate deliberately excludes (see
  // #ANIMATABLE_DOMAINS). Checked in addition to, not instead of,
  // isEntityActive, so a binary_sensor/switch-based washing setup (e.g. a
  // smart-plug power monitor) keeps working exactly as before.
  static #WASHING_ACTIVE_STATES = new Set(['run', 'in_use']);

  static #sensorReportsWashing(hassProvider, entityId) {
    if (!hassProvider.isEntityAvailable(entityId)) return false;
    if (HassProviderSingleton.getEntityDomain(entityId) !== 'sensor') return false;
    const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
    return ViewCore.#WASHING_ACTIVE_STATES.has(state);
  }

  // Same split as isBatteryCharging: the card's `entity` is usually the
  // progress value (Home Connect's program_progress %, Miele's
  // elapsed_time), not the status sensor that actually carries 'run'/
  // 'in_use' (operation_state/status) - a different entity on the same
  // device. Unlike charging, there's no shared entity_id keyword across
  // brands to filter on (operation_state/status/machine_state don't share a
  // substring), so the fallback checks every same-device sensor's state
  // instead of its name.
  get isWashingMachineActive() {
    if (this.isEntityActive) return true;
    const hassProvider = HassProviderSingleton.getInstance();
    if (ViewCore.#sensorReportsWashing(hassProvider, this.entity)) return true;
    return hassProvider
      .getSameDeviceEntities(this.entity)
      .some((id) => ViewCore.#sensorReportsWashing(hassProvider, id));
  }

  /**
   * alert_when thresholds are expressed in the entity's native unit (like
   * watermark.low/high).
   */
  get isAlertActive() {
    const alert = this.config?.alert_when;
    if (!alert || !this._currentValue.isAvailable) return false;
    const raw = this._currentValue.value;
    const value = is.number(raw) ? raw : raw?.current;
    if (!is.number(value)) return false;
    return (is.number(alert.above) && value > alert.above) || (is.number(alert.below) && value < alert.below);
  }

  /**
   * Resolves the effective alert animation: an explicit `animation` wins;
   * otherwise falls back to the pre-1.6 default for the current `highlight`
   * (border -> blink, background -> static), so omitting it keeps old configs
   * looking exactly as before. `ping` is a border-only ring burst - paired
   * with `highlight: background` it has no matching CSS rule, so it degrades
   * to that target's own default instead of silently doing nothing.
   */
  get alertAnimation() {
    const alert = this.config?.alert_when;
    if (!alert) return null;
    const isBackground = alert.highlight === 'background';
    if (alert.animation === 'ping' && isBackground) return 'static';
    return alert.animation ?? (isBackground ? 'static' : 'blink');
  }

  hasComponentHiddenFlag(component) {
    return this._hasInConfigArray('hide', component);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasInConfigArray(key, value) {
    return is.array(this.config?.[key]) && this.config[key].includes(value);
  }

  static #hasAction(actions) {
    return actions.some((action) => action !== HA_CONTEXT.actions.none.action);
  }
}
/******************************************************************************
 * 🛠️ ViewBase
 * ============================================================================
 *
 * ✅ A comprehensive base card view that extends ViewCore to manage all
 * information required for creating cards and badges. This class handles entity
 * states, theme management, percentage calculations, timers, and provides a
 * complete API for card rendering.
 *
 *       ViewCore
 *       │
 *       ├── ViewBase
 *       │   ├── CardView                  (CardConfigHelper)
 *       │   ├── BadgeView                 (BadgeConfigHelper)
 *       │   └── FeatureView               (FeatureConfigHelper)
 *       │
 *       └── (direct)
 *           ├── CardTemplateView          (TemplateConfigHelper)
 *           └── BadgeTemplateView         (BadgeTemplateConfigHelper)
 *
 * @class
 * @extends ViewCore
 * @description Manages the complete lifecycle of card display including:
 *              - Entity state management and validation
 *              - Theme and color management
 *              - Percentage and progress calculations
 *              - Timer and counter handling
 *              - Badge and watermark rendering
 *              - Multi-language support
 *              - Error state handling (unavailable, not found, unknown)
 *
 * @example
 * const cardView = new ViewBase();
 * cardView.config = {
 *   entity: 'sensor.cpu_percent',
 *   name: 'CPU Usage',
 *   max_value: 100,
 *   unit: '%',
 *   color: '#ff6b6b',
 *   watermark: { low: 30, high: 80, type: 'gradient' }
 * };
 *
 * // Refresh with Home Assistant data
 * cardView.refresh(hass);
 *
 * // Access computed properties
 * const isReady = cardView.isAvailable;
 * const progress = cardView.percent;
 * const displayText = cardView.secondaryInfoMain;
 * const cardColor = cardView.iconColor;
 *
 * // Handle error states
 * if (cardView.hasStandardEntityError) {
 *   console.log('Entity has errors:', cardView.msg);
 * }
 *
 * // Timer-specific usage
 * if (cardView.isActiveTimer) {
 *   const speed = cardView.refreshSpeed;
 *   // Update UI at calculated refresh rate
 * }
 */
class ViewBase extends ViewCore {
  #percentHelper = new PercentHelper();
  #theme = new ThemeManager();
  #maxValue = new EntityOrValue();
  #minValue = new EntityOrValue();
  // min_value/max_value resolved from a Jinja subscription (standard cards);
  // null = no override
  #jinjaMinValue = null;
  #jinjaMaxValue = null;
  // watermark.low/.high resolved from a Jinja subscription; null = no override
  #jinjaWatermarkLow = null;
  #jinjaWatermarkHigh = null;
  #entityCollection = new EntityCollectionHelper();

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get hasValidatedConfig() {
    return this._configHelper.isValid;
  }
  get msg() {
    return this._configHelper.msg;
  }
  set config(config) {
    if (!config) {
      throw new Error(CARD.config.configError);
    }

    this._configHelper.config = config;

    const centerZero = this._configHelper.config.centerZero;

    // CF5 - issue (major) resolved - the collection was never cleared: every
    // setConfig (each editor keystroke) re-added all entities, inflating
    // getTotalValue() with duplicates
    this.#entityCollection.clear();
    if (is.nonEmptyArray(this._configHelper.config.bar_stack?.entities)) {
      const { mode, entities } = this._configHelper.config.bar_stack;
      this.#entityCollection.mode = mode;
      const addMain = () =>
        this.#entityCollection.addEntity(
          this._configHelper.config.entity,
          this._configHelper.config.attribute,
          null,
          false,
          true,
        );
      const addOne = ({ entity, attribute, color, subtract }) =>
        this.#entityCollection.addEntity(entity, attribute, color, subtract);
      // One consistent order for both modes: main entity first, then entities[]
      // in list order. Exception: without center_zero, `subtract` is otherwise
      // a silent no-op (there's no negative arm to place it in - see docs) -
      // move subtract-marked entities before the main entity instead, as a
      // visual tell that something atypical is configured here. Based on the
      // static `subtract` flag only: an entity's live value isn't known yet at
      // this point (only once refresh(hass) runs), so a
      // naturally-negative-but-unmarked entity can't be detected here and keeps
      // its normal after-main position.
      if (!centerZero.enabled) {
        entities.filter((e) => e.subtract).forEach(addOne);
        addMain();
        entities.filter((e) => !e.subtract).forEach(addOne);
      } else {
        addMain();
        entities.forEach(addOne);
      }
    }

    this.#percentHelper.configure({
      unitSpacing: this._configHelper.config.unit_spacing,
      // disable_unit is deprecated (folded into hide: ['unit', ...] by
      // _customizeConfig) but left untouched, and thus still checked here, when
      // hide is a Jinja template.
      hasDisabledUnit:
        this._configHelper.config.disable_unit ||
        this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.unit.label),
      isCenterZero: centerZero.enabled,
      zeroValue: centerZero.zeroValue,
      growthPercent: centerZero.growthPercent,
      scale: this._configHelper.config.bar_scale,
    });

    this.#theme.configure({
      theme: this._configHelper.config.theme,
      customTheme: this._configHelper.config.custom_theme,
      interpolate: this._configHelper.config.interpolate,
    });

    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      nameTokens: this._configHelper.config.name,
      stateContent: this._configHelper.stateContent,
    });

    if (this._currentValue.entityType.isTimer) {
      this.#maxValue.value = CARD.config.value.max;
    } else {
      this._currentValue.attribute = this._configHelper.config.attribute;
      // max_value/min_value: number (legacy) | {value} | {entity, attribute} |
      // {jinja}. Jinja mode is fed by the template subscription
      // (#jinjaMaxValue/#jinjaMinValue), not by EntityOrValue — see
      // #resolveMaxValue/#resolveMinValue for the per-shape resolution, kept
      // out of this method to avoid nesting their ternaries in here.
      Object.assign(this.#maxValue, ViewBase.#resolveMaxValue(this._configHelper.config.max_value));
      this.#jinjaMaxValue = null;
      Object.assign(this.#minValue, ViewBase.#resolveMinValue(this._configHelper.config.min_value));
      this.#jinjaMinValue = null;
    }
    // Watermark low/high are wired for timers too (unlike attribute/min/max
    // above, which a timer overrides): the schema defaults watermark: {} to
    // low: 20 / high: 80, so leaving these helpers unset on a timer made
    // isAvailable() permanently false — a timer card with any watermark
    // configured froze instead of rendering.
    Object.assign(this._lowValue, {
      value: ViewBase.#resolveWatermarkValue(this._configHelper.config?.watermark?.low),
      attribute: this._configHelper.config?.watermark?.low_attribute,
    });
    this.#jinjaWatermarkLow = null;
    Object.assign(this._highValue, {
      value: ViewBase.#resolveWatermarkValue(this._configHelper.config?.watermark?.high),
      attribute: this._configHelper.config?.watermark?.high_attribute,
    });
    this.#jinjaWatermarkHigh = null;
  }
  get config() {
    return this._configHelper.config;
  }
  static #resolveMaxValue(maxCfg) {
    const isMaxObj = is.plainObject(maxCfg);
    return {
      value: isMaxObj
        ? maxCfg.jinja
          ? null
          : (maxCfg.entity ?? CARD.config.value.max)
        : (maxCfg ?? CARD.config.value.max),
      attribute: isMaxObj ? maxCfg.attribute : undefined,
    };
  }
  static #resolveMinValue(minCfg) {
    const isMinObj = is.plainObject(minCfg);
    return {
      value: isMinObj ? (minCfg.jinja ? null : (minCfg.entity ?? minCfg.value ?? null)) : minCfg,
      attribute: isMinObj ? minCfg.attribute : undefined,
    };
  }
  // watermark.low/.high: number (fixed) | string (entity id) | {jinja}. A
  // {jinja} object is fed by the template subscription
  // (#jinjaWatermarkLow/#jinjaWatermarkHigh), not by EntityOrValue, so it
  // resolves to null here — mirrors #resolveMaxValue/#resolveMinValue's own
  // jinja split.
  static #resolveWatermarkValue(sideCfg) {
    return is.plainObject(sideCfg) ? null : sideCfg;
  }
  #hasState(state) {
    const toEVal = this.hasWatermark
      ? [this._currentValue, this.#maxValue, this._lowValue, this._highValue]
      : [this._currentValue, this.#maxValue];
    return toEVal.some((v) => v.state === state);
  }
  get isUnknown() {
    return this.#hasState(HA_CONTEXT.entity.state.unknown);
  }
  get isUnavailable() {
    return this.#hasState(HA_CONTEXT.entity.state.unavailable);
  }
  get isNotFound() {
    return this.#hasState(HA_CONTEXT.entity.state.notFound);
  }
  get isAvailable() {
    // note: this used to test `this._configHelper.maxValue`, a getter that
    // never existed (always undefined), silently disabling the max-entity
    // availability check.
    const minIsEntity = is.nonEmptyString(this._configHelper.config?.min_value?.entity);
    return !(
      !this._currentValue.isAvailable ||
      (!this.#maxValue.isAvailable && is.nonEmptyString(this._configHelper.config?.max_value?.entity)) ||
      (!this.#minValue.isAvailable && minIsEntity) ||
      (!this._lowValue.isAvailable && this._configHelper.config?.watermark?.low) ||
      (!this._highValue.isAvailable && this._configHelper.config?.watermark?.high)
    );
  }
  get hasStandardEntityError() {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }

  // ─── Getters for card ─────────────────────────────────────────────────────

  get icon() {
    const notFound = this.isNotFound ? CARD.style.icon.notFound.icon : null;
    return notFound || this.#theme.icon || this._configHelper.config.icon;
  }
  get iconColor() {
    if (this.isUnavailable) return CARD.style.color.unavailable;
    if (this.isNotFound) return CARD.style.color.notFound;
    return (
      ThemeManager.adaptColor(this.#theme.iconColor || this._configHelper.config.color) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }
  #curBarColor() {
    return (
      ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default
    );
  }
  get barColor() {
    if (!this.isAvailable) return this.isUnknown ? CARD.style.color.default : CARD.style.color.disabled;
    const curColor = this.#curBarColor();
    // 'net' is always a single flat segment. The center_zero +
    // stacked/proportional case is handled separately by divergingBarStack (its
    // own CSS variables, two independent arms) - this path only owns the
    // non-centered multi-segment gradient and the plain fallback.
    return this.hasEntityCollection && this.#entityCollection.mode !== 'net' && !this.#percentHelper.isCenterZero
      ? this.#entityCollection.getEntitiesColor(
          curColor,
          this.percent / 100,
          this.#percentHelper.max - this.#percentHelper.min,
        )
      : curColor;
  }
  // 'stacked'/'proportional' + center_zero: two independent per-arm gradients
  // (see EntityCollectionHelper.getDivergingGradients). null when not
  // applicable, so callers can tell whether to apply or clear the dedicated CSS
  // variables.
  get divergingBarStack() {
    if (!this.isAvailable || !this.#percentHelper.isCenterZero) return null;
    if (!this.hasEntityCollection || this.#entityCollection.mode === 'net') return null;
    return this.#entityCollection.getDivergingGradients(this.#curBarColor(), {
      min: this.#percentHelper.min,
      max: this.#percentHelper.max,
      zeroValue: this.#percentHelper.zeroValue,
    });
  }
  get colorGradient() {
    if (!this.isAvailable || this.#percentHelper.isCenterZero) return null;
    return this.#theme.buildGradient(
      this.#percentHelper.percent,
      this._configHelper.config.bar_color_mode,
      this._currentValue.defaultColor,
    );
  }
  get percent() {
    if (!this.isAvailable) return 0;
    return this.#percentHelper.isCenterZero
      ? Math.max(-100, Math.min(100, this.#percentHelper.percent))
      : Math.max(0, Math.min(100, this.#percentHelper.percent));
  }

  getTrend() {
    return super.getTrend(this.#percentHelper.percent);
  }

  get secondaryInfoMain() {
    if (
      this.hasStandardEntityError ||
      (this._currentValue.entityType.isTimer && this._currentValue.value.state === HA_CONTEXT.entity.state.idle)
    )
      return this._currentValue.formatedEntityState;

    const additionalInfo = this._currentValue.stateContentToString;
    if (this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this._currentValue.entityType.isDuration && !this._configHelper.config.unit
        ? this._currentValue.formatedEntityState
        : this.#percentHelper.toString();

    return additionalInfo === '' ? valueInfo : [additionalInfo, valueInfo].join(CARD.config.separator);
  }
  get name() {
    return is.nonEmptyArray(this._configHelper.config.name)
      ? this._currentValue.nameComposition
      : this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
  }
  get badgeInfo() {
    if (this.isNotFound) return CARD.style.icon.badge.notFound;
    if (this.isUnavailable) return CARD.style.icon.badge.unavailable;

    if (this._currentValue.entityType.isTimer) {
      const { state } = this._currentValue.value;
      const { paused, active } = HA_CONTEXT.entity.state;
      if (state === paused) return CARD.style.icon.badge.timer.paused;
      if (state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }
  get isActiveTimer() {
    return this._currentValue.entityType.isTimer && this._currentValue.state === HA_CONTEXT.entity.state.active;
  }
  get refreshSpeed() {
    const rawSpeed = this._currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    return Math.max(100, Math.round(clampedSpeed / 100) * 100);
  }
  get hasVisibleShape() {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }
  get timerIsReversed() {
    return (
      this._configHelper.config.reverse !== false && this._currentValue.value.state !== HA_CONTEXT.entity.state.idle
    );
  }
  get hasWatermark() {
    return this._configHelper.config.watermark !== undefined;
  }
  get watermark() {
    const { watermark } = this.config;
    if (!watermark) return null;
    // A timer's own `max` isn't a stable scale the way a sensor's min/max is
    // - it's the running instance's actual duration (idle uses a [0, 100]
    // placeholder, see ViewCore#manageTimerEntity), so a raw watermark value
    // means a different position every run. 'auto' resolves to 'percent'
    // behavior for timers instead, so the configured value stays a stable
    // percentage regardless of how long any given run happens to be.
    const isTimer = this._currentValue.entityType.isTimer;
    const toPos = (v, mode) =>
      mode === 'percent' || isTimer ? (is.number(v) ? v : (v?.current ?? 0)) : this.#percentHelper.calcWatermark(v);
    return {
      ...watermark,
      low: toPos(this.#jinjaWatermarkLow ?? this._lowValue.value, watermark.low_as),
      low_color: ThemeManager.adaptColor(watermark.low_color),
      high: toPos(this.#jinjaWatermarkHigh ?? this._highValue.value, watermark.high_as),
      high_color: ThemeManager.adaptColor(watermark.high_color),
    };
  }
  get hasEntityCollection() {
    return this.#entityCollection.count >= 2;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    this.#maxValue.refresh();
    this.#minValue.refresh();
    this._configHelper.checkConfig();
    this.#entityCollection.refreshAll();

    if (!this.isAvailable) return;

    this.#updatePercentHelper();
    this.#theme.value = this.#percentHelper.valueForThemes(this.#theme.isCustomTheme, this.#theme.isBasedOnPercentage);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #updatePercentHelper() {
    // update
    this.#percentHelper.isTimer = this._currentValue.entityType.isTimer || this._currentValue.entityType.isDuration;
    const currentUnit = this.#getCurrentUnit();
    this.#percentHelper.unit = currentUnit;
    this.#percentHelper.decimal = this.#getCurrentDecimal(currentUnit);

    if (this._currentValue.entityType.isTimer) {
      this.#setTimerValues();
    } else if (this._currentValue.entityType.isCounter || this._currentValue.entityType.isNumber) {
      this.#setCounterValues();
    } else {
      this.#setStdValues();
    }
    this.#percentHelper.refresh();
  }
  #setTimerValues() {
    Object.assign(this.#percentHelper, {
      isReversed: this.timerIsReversed,
      current: this._currentValue.value.current,
      min: this._currentValue.value.min,
      max: this._currentValue.value.max,
    });
  }

  #setCounterValues() {
    Object.assign(this.#percentHelper, {
      current: this._currentValue.value.current,
      min: this._currentValue.value.min,
      max: this.#maxValue.isEntity
        ? (this.#maxValue.value?.current ?? this.#maxValue.value)
        : this._currentValue.value.max,
    });
  }

  #setStdValues() {
    // 'net' mode always wants the algebraic total. 'stacked'/'proportional'
    // switch to it too once center_zero splits them into two arms - a single
    // flat percentage doesn't mean anything once the bar itself shows two
    // independent, possibly-opposing lengths (see
    // EntityCollectionHelper.getNetValue). Without center_zero, both modes keep
    // the plain magnitude sum, matching what the bar itself visually adds up
    // to.
    const useNetValue =
      this.hasEntityCollection && (this.#entityCollection.mode === 'net' || this.#percentHelper.isCenterZero);
    const currentValue = this.hasEntityCollection
      ? useNetValue
        ? this.#entityCollection.getNetValue()
        : this.#entityCollection.getTotalValue()
      : this._currentValue.value;
    Object.assign(this.#percentHelper, {
      current: currentValue,
      min: this.#jinjaMinValue ?? this.#minValue.value?.current ?? this.#minValue.value,
      max: this.#jinjaMaxValue ?? this.#maxValue.value?.current ?? this.#maxValue.value,
    });
  }

  get jinjaMinValue() {
    return this.#jinjaMinValue;
  }
  set jinjaMinValue(value) {
    this.#jinjaMinValue = is.number(value) ? value : null;
  }
  get jinjaMaxValue() {
    return this.#jinjaMaxValue;
  }
  set jinjaMaxValue(value) {
    this.#jinjaMaxValue = is.number(value) ? value : null;
  }
  get jinjaWatermarkLow() {
    return this.#jinjaWatermarkLow;
  }
  set jinjaWatermarkLow(value) {
    this.#jinjaWatermarkLow = is.number(value) ? value : null;
  }
  get jinjaWatermarkHigh() {
    return this.#jinjaWatermarkHigh;
  }
  set jinjaWatermarkHigh(value) {
    this.#jinjaWatermarkHigh = is.number(value) ? value : null;
  }

  #getCurrentUnit() {
    if (this._configHelper.config.unit) return this._configHelper.config.unit;
    if (this.#maxValue.isEntity) return CARD.config.unit.default;

    const unit = this._currentValue.unit;
    return unit === null ? CARD.config.unit.default : unit;
  }
  #getCurrentDecimal(currentUnit) {
    if (is.unsignedInteger(this._configHelper.config.decimal)) return this._configHelper.config.decimal;
    if (this._currentValue.precision) return this._currentValue.precision;
    if (this._currentValue.entityType.isTimer) return CARD.config.decimal.timer;
    if (this._currentValue.entityType.isCounter) return CARD.config.decimal.counter;
    if (this._currentValue.entityType.isDuration) return CARD.config.decimal.duration;
    if (['j', 'd', 'h', 'min', 's', 'ms', 'μs'].includes(this._currentValue.unit)) return CARD.config.decimal.duration;

    if (this._configHelper.config.unit)
      return this._configHelper.config.unit === CARD.config.unit.default
        ? CARD.config.decimal.percentage
        : CARD.config.decimal.other;

    return currentUnit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
  }
}
/******************************************************************************
 * 🛠️ CardView
 * ============================================================================
 *
 * A specialized card view implementation that extends ViewBase specifically for
 * rendering full card components. This class provides the complete card
 * functionality with proper configuration management through CardConfigHelper.
 *
 * @class CardView
 * @extends ViewBase
 * @description A concrete implementation of ViewBase designed for full card
 * rendering. This class uses CardConfigHelper to handle
 * card-specific configuration validation, processing, and
 * management. It inherits all entity management, theme handling,
 * and state processing capabilities from ViewBase while providing
 * card-specific configuration logic.
 *
 * @see ViewBase For inherited functionality
 * @see CardConfigHelper For configuration management details
 */
class CardView extends ViewBase {
  _configHelper = new CardConfigHelper();
}

class BadgeView extends ViewBase {
  _configHelper = new BadgeConfigHelper();
}

class FeatureView extends ViewBase {
  _configHelper = new FeatureConfigHelper();
}

class CardTemplateView extends ViewCore {
  _configHelper = new TemplateConfigHelper();
  icon = null;
}

class BadgeTemplateView extends ViewCore {
  _configHelper = new BadgeTemplateConfigHelper();
  icon = null;
}

/******************************************************************************
 * 🛠️ ResourceManager
 * ============================================================================
 *
 * ✅ Manage ressources: interval, timeout, listener, subscription.
 *
 * @class
 */
class ResourceManager {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log = null;
  #resources = new Map();
  #throttles = new Map();

  constructor() {
    this.#log = initLogger(this, this.#debug, ['add', 'remove', 'cleanup']);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  get list() {
    return [...this.#resources.keys()];
  }

  get count() {
    return this.#resources.size;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  add(cleanupFn, id) {
    if (!is.func(cleanupFn)) {
      throw new Error('Resource must be a function');
    }
    const finalId = id || this.#generateUniqueId();
    if (this.#resources.has(finalId)) {
      this.remove(finalId);
      this.#log.debug(`Remove: ${finalId}`);
    }
    this.#resources.set(finalId, cleanupFn);
    this.#log.debug(`Set: ${finalId}`);

    return finalId;
  }

  setInterval(handler, timeout, id) {
    this.#log.debug('Starting interval with id:', id);
    const timerId = setInterval(handler, timeout);
    this.#log.debug('Timer started with timerId:', timerId);

    this.add(() => {
      this.#log.debug('Stopping interval with id:', id);
      clearInterval(timerId);
    }, id);

    return id;
  }

  has(id) {
    return this.#resources.has(id); // Vérifie si un ID existe dans la Map
  }

  setTimeout(handler, timeout, id) {
    this.#log.debug('Starting timeout with id:', id);
    const timerId = setTimeout(handler, timeout);
    this.#log.debug('Timeout started with timerId:', timerId);
    return this.add(() => clearTimeout(timerId), id);
  }

  addEventListener(target, event, handler, options, id) {
    target.addEventListener(event, handler, options);
    return this.add(() => target.removeEventListener(event, handler, options), id);
  }

  addSubscription(unsubscribeFn, id) {
    return this.add(() => {
      unsubscribeFn();
    }, id);
  }

  throttle(fn, delay, id) {
    if (!this.#throttles.has(id)) {
      this.#throttles.set(id, { lastCall: 0 });
      this.add(() => this.resetThrottle(id), id);
    }

    const context = this.#throttles.get(id);
    const now = Date.now();

    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      fn();
      this.#log.debug('Throttle function - ', id);
    }
  }

  throttleDebounce(fn, delay, id) {
    const now = Date.now();
    const keys = {
      throttle: `${id}-throttle`,
      debounce: `${id}-debounce`,
    };

    // Throttle — exec if time is over
    if (!this.#throttles.has(keys.throttle)) {
      this.#throttles.set(keys.throttle, { lastCall: 0 });
      this.add(() => this.resetThrottle(keys.throttle), keys.throttle);
    }

    const context = this.#throttles.get(keys.throttle);

    // CF5 - issue (medium) resolved - the trailing timer was scheduled
    // unconditionally, so a single isolated call always ran fn() twice (leading
    // + trailing). The trailing run now only catches calls rejected by the
    // throttle, and a leading run cancels any pending trailing.
    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      if (this.#resources.has(keys.debounce)) this.remove(keys.debounce);
      fn();
      this.#log.debug('ThrottleDebounce immediate - ', id);
      return;
    }

    // Debounce — catch up throttled calls after delay
    if (this.#resources.has(keys.debounce)) {
      this.remove(keys.debounce);
    }
    this.setTimeout(
      () => {
        context.lastCall = Date.now();
        fn();
        this.#log.debug('ThrottleDebounce trailing - ', id);
      },
      delay,
      keys.debounce,
    );
  }

  resetThrottle(id) {
    this.#throttles.delete(id);
  }

  remove(id) {
    const cleanupFn = this.#resources.get(id);
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while removing '${id}'`, e);
      }
      this.#resources.delete(id);
      this.#log.debug(`Removed: ${id}`);
    }
  }

  cleanup() {
    for (const [id, cleanupFn] of this.#resources) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while clearing '${id}'`, e);
      }
      this.#log.debug(`Cleared: ${id}`);
    }
    this.#resources.clear();
    this.#throttles.clear();
    this.#log.debug('All resources cleared.');
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #generateUniqueId() {
    // eslint-disable-next-line no-useless-assignment
    let id = null;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.#resources.has(id));
    return id;
  }
}

/******************************************************************************
 * 🛠️ DOMHelper
 * ============================================================================
 *
 * ✅ Manages DOM elements, RAF queue, and applied values cache.
 *
 * // Init
 * this._dom = new DOMHelper();
 * this._dom.register("card",  this.shadowRoot.querySelector(".card"));
 * this._dom.register("title", this.shadowRoot.querySelector(".title"));
 *
 * // Mises à jour — dédupliquées + batchées automatiquement
 * this._dom.setStyle("card",  "--color-bg", "#fff");
 * this._dom.setText ("title", "Température");
 * this._dom.setHTML  ("card",  "<span>...</span>");
 *
 * // Destroy
 * this._dom.destroy();
 *
 * @class
 */
class DOMHelper {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log = null;

  constructor() {
    this.#log = initLogger(this, this.#debug, ['register', 'unregister', 'destroy']);
    this._domElements = new Map(); // key → HTMLElement
    this._appliedValues = new Map(); // "key:prop" → last applied value
    this._pendingUpdates = new Map(); // "key:prop" → pending update function
    this._rafScheduled = false;
  }

  // ─── Element registration ─────────────────────────────────────────────────

  /**
   * Registers a DOM element under a given key.
   */
  register(key, element) {
    this.#log.debug('DOMHelper.register(key, element):', { key, element });
    this._domElements.set(key, element);
  }

  /**
   * Returns the DOM element associated with the given key.
   */
  get(key) {
    return this._domElements.get(key);
  }

  /**
   * Unregisters a DOM element and clears its associated cache entries.
   */
  unregister(key) {
    this._domElements.delete(key);
    for (const cacheKey of this._appliedValues.keys()) {
      if (cacheKey.startsWith(`${key}:`)) {
        this._appliedValues.delete(cacheKey);
      }
    }
  }

  // ─── RAF queue ────────────────────────────────────────────────────────────

  /**
   * Enqueues a DOM update identified by a unique key + prop combination. If the
   * same key:prop is enqueued multiple times, only the latest function runs.
   * Schedules a single RAF flush if not already pending.
   */
  enqueue(key, prop, updateFn) {
    this._pendingUpdates.set(`${key}:${prop}`, updateFn);

    if (!this._rafScheduled) {
      this._rafScheduled = true;
      requestAnimationFrame(() => this._flush());
    }
  }

  /**
   * Flushes all pending updates in a single RAF callback.
   */
  _flush() {
    const updates = this._pendingUpdates;
    this._pendingUpdates = new Map();
    this._rafScheduled = false;

    updates.forEach((fn) => fn());
  }

  // ─── DOM helpers with cache ───────────────────────────────────────────────

  /**
   * Sets a CSS custom property on the element registered under the given key.
   * Skipped if the value matches the cache — no DOM read required.
   */
  setStyle(key, prop, value) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:style:${prop}`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `style:${prop}`, () => {
      el.style.setProperty(prop, value);
      this._appliedValues.set(cacheKey, value);
    });
  }

  /**
   * Removes a previously-set CSS custom property. setStyle() never unsets a
   * value on its own (it only skips nullish writes), so a property that was
   * conditionally set on an earlier render (e.g. the bar_stack diverging-arm
   * gradient) needs this to go away once the condition no longer applies -
   * otherwise it stays stuck from a stale render.
   */
  removeStyle(key, prop) {
    const cacheKey = `${key}:style:${prop}`;
    if (!this._appliedValues.has(cacheKey)) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `style:${prop}`, () => {
      el.style.removeProperty(prop);
      this._appliedValues.delete(cacheKey);
    });
  }

  /**
   * Sets a CSS custom property synchronously — no RAF, no cache check, no
   * queue. Use when immediate DOM update is required.
   */
  setStyleNow(key, prop, value) {
    if (is.nullish(value)) return;

    const el = this._domElements.get(key);
    if (!el) return;

    el.style.setProperty(prop, value);
    this._appliedValues.set(`${key}:style:${prop}`, value); // ← met à jour le cache après
  }

  /**
   * Sets the text content of the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setText(key, value) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:text`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'text', () => {
      el.textContent = value;
      this._appliedValues.set(cacheKey, value);
    });
  }

  // CF5 - issue (security) resolved - Jinja results are injected via innerHTML
  // and may interpolate attacker-influenceable strings (media titles, network
  // device names…); allowlist sanitization keeps the HTML formatting feature
  // while neutralizing script execution No BR here on purpose: name/name_info
  // have no multiline option at all (see
  // StructureElements.secondaryInfoWrapperMinimal) and must never wrap, while
  // custom_info/secondary's own <br> is already consumed by
  // HABase#_splitAtFirstBreak before it ever reaches this sanitizer - a literal
  // <br> surviving to this point would only ever be an unhandled edge case, not
  // a feature to preserve.
  static #SAFE_HTML_TAGS = new Set(['B', 'I', 'U', 'SPAN', 'DIV']);
  static #SAFE_STYLE_PROPS = new Set(['color', 'background-color']);
  static #DROP_CONTENT_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT']);

  static sanitizeHTML(value) {
    const html = String(value);
    if (!html.includes('<')) return html; // fast path: no markup, nothing to sanitize
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    DOMHelper.#sanitizeNode(body);
    return body.innerHTML;
  }

  static #sanitizeNode(node) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE || DOMHelper.#DROP_CONTENT_TAGS.has(child.tagName)) {
        child.remove(); // comments, script/style & co: dropped entirely, content included
        continue;
      }
      if (!DOMHelper.#SAFE_HTML_TAGS.has(child.tagName)) {
        DOMHelper.#sanitizeNode(child);
        child.replaceWith(...child.childNodes); // unknown tag: unwrap, keep sanitized children
        continue;
      }
      DOMHelper.#scrubAttributes(child);
      DOMHelper.#sanitizeNode(child);
    }
  }

  static #scrubAttributes(el) {
    for (const attr of [...el.attributes]) {
      if (attr.name === 'class') continue; // kept for user Jinja markup relying on class-based styling (e.g. card_mod); classes cannot execute code
      if (attr.name !== 'style') {
        el.removeAttribute(attr.name); // on* handlers, href, src…
        continue;
      }
      const kept = [...el.style]
        .filter((prop) => DOMHelper.#SAFE_STYLE_PROPS.has(prop))
        .map((prop) => `${prop}: ${el.style.getPropertyValue(prop)}`)
        .join('; ');
      if (kept) el.setAttribute('style', kept);
      else el.removeAttribute('style');
    }
  }

  /**
   * Sets the inner HTML of the element registered under the given key.
   * Content is sanitized (tag/attribute allowlist) before injection.
   * Skipped if the value matches the cache.
   */
  setHTML(key, value) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:html`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'html', () => {
      el.innerHTML = DOMHelper.sanitizeHTML(value);
      this._appliedValues.set(cacheKey, value);
    });
  }

  /**
   * Toggles a CSS class on the element registered under the given key.
   * Skipped if the state matches the cache.
   */
  toggleClass(key, className, force) {
    if (!className) return;
    const cacheKey = `${key}:class:${className}`;
    if (this._appliedValues.get(cacheKey) === force) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `class:${className}`, () => {
      el.classList.toggle(className, force);
      this._appliedValues.set(cacheKey, force);
    });
  }

  /**
   * Adds one or more CSS classes to the element registered under the given key.
   * Batched via the RAF queue.
   */
  addClass(key, ...classes) {
    const el = this._domElements.get(key);
    if (!el) return;

    const filtered = classes.filter(Boolean);
    if (!filtered.length) return;

    this.enqueue(key, `addClass:${filtered.join(',')}`, () => {
      el.classList.add(...filtered);
    });
  }

  /**
   * Sets an attribute on the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setAttribute(key, attr, value) {
    if (is.nullish(value)) return;
    const cacheKey = `${key}:attr:${attr}`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, `attr:${attr}`, () => {
      el.setAttribute(attr, value);
      this._appliedValues.set(cacheKey, value);
    });
  }
  // ─── Walkthrough ──────────────────────────────────────────────────────────

  static walkUpThroughShadow(node, selector) {
    if (!node) return null;
    if (node instanceof ShadowRoot) return DOMHelper.walkUpThroughShadow(node.host, selector);
    if (node instanceof HTMLElement && node.matches(selector)) return node;
    return DOMHelper.walkUpThroughShadow(node.parentNode, selector);
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  /**
   * Clears all internal state: elements, cache, and pending updates.
   * Should be called when the component is destroyed.
   */
  destroy() {
    this._domElements.clear();
    this._appliedValues.clear();
    this._pendingUpdates.clear();
    this._rafScheduled = false;
  }
}

/******************************************************************************
 * 🛠️ ActionHelper — Utility Class
 * ============================================================================
 *
 * ✅ Centralized handler for `xyz_action` logic.
 * Deprecated for HA 2026.3+
 *
 * 📌 Purpose: - Encapsulates and manages the execution, validation, and
 * dispatch of `xyz_action`. - Promotes reusable, maintainable logic for
 * action-related features.
 */

class ActionHelper {
  #target = null;
  #config = null;
  #fromIcon = false;
  #initialized = false;
  #disableIconTap = false;
  #iconClickSources = new Set(['shape', HA_SVG_ICON_TAG, 'img']);

  constructor(target) {
    this.#target = target;
  }

  // CF5 - issue (major) resolved - the HA frontend creates <action-handler>
  // lazily; querySelector could return null and crash if this card loads before
  // any native card
  static #getActionHandler() {
    let handler = document.body.querySelector(HA_ACTION_HANDLER_TAG);
    if (!handler) {
      handler = document.createElement(HA_ACTION_HANDLER_TAG);
      document.body.appendChild(handler);
    }
    return handler;
  }

  init(config, disableIconTap) {
    // Config and options are refreshed on every call (each connectedCallback);
    // listeners are attached once — see below.
    this.#config = config;
    this.#disableIconTap = disableIconTap;

    if (!this.#target) return;

    // CF5 - issue (major) resolved - init() runs on every connectedCallback
    // (view navigation, edit mode); listeners accumulated and a single tap
    // dispatched N hass-action events. init is now idempotent.
    if (this.#initialized) return;
    this.#initialized = true;

    ActionHelper.#getActionHandler().bind(this.#target, {
      hasHold: true,
      hasDoubleClick: true,
    });

    this.#target.addEventListener(
      'pointerdown',
      (ev) => {
        const localName = ev.composedPath()[0].localName;
        this.#fromIcon = !this.#disableIconTap && this.#iconClickSources.has(localName);
      },
      { passive: true },
    );

    this.#target.addEventListener('action', (ev) => {
      this.#handleAction(ev, this.#fromIcon);
    });
  }

  #handleAction(ev, fromIcon) {
    const action = ev.detail.action;
    const iconActionKey = `icon_${action}_action`;

    const actionConfig =
      fromIcon && this.#config[iconActionKey]?.action !== 'none'
        ? this.#config[iconActionKey]
        : this.#config[`${action}_action`];

    if (!actionConfig) return;

    this.#target.dispatchEvent(
      new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config: {
            entity: this.#config.entity,
            tap_action: actionConfig,
          },
          action: 'tap',
        },
      }),
    );
  }
}

/******************************************************************************
 * 🛠️ HACore
 * ============================================================================
 *
 * Base class for Home Assistant custom elements (cards, badges, features).
 *
 * HTMLElement
 * └── HACore
 *     ├── HABase
 *     │   ├── EntityProgressCardBase
 *     │   │   ├── EntityProgressCard
 *     │   │   └── EntityProgressBadge
 *     │   └── EntityProgressTemplateBase
 *     │       ├── EntityProgressTemplateCard
 *     │       └── EntityProgressTemplateBadge
 *     └── EntityProgressFeatures
 *
 * Provides: - Shadow DOM initialization and lifecycle management
 * (connectedCallback, disconnectedCallback) - Configuration handling via
 * setConfig() - Hass state tracking and change detection - DOM rendering
 * pipeline: render() → _createCardElements() → _buildStyle() - Batched DOM
 * updates via DOMHelper (RAF queue + value cache) - Jinja2 template
 * subscriptions via WebSocket - Resource lifecycle management (listeners,
 * subscriptions, intervals)
 *
 * Subclasses MUST implement:
 * - _handleHassUpdate()     → react to hass state changes
 * - _updateCSS()            → apply dynamic CSS custom properties
 * - _getJinjaHandlers()     → handle Jinja2 template results
 *
 * Subclasses MAY override: - _structureOptions (getter) → structure options
 * passed to ObjStructure.clone() (barType, barPosition…) - _buildStyle() → CSS
 * class application pipeline (watermark, bar effect, base classes) -
 * _updateDynamicElements() → DOM update orchestration (CSS, Jinja processing)
 *
 * @abstract
 * @extends HTMLElement
 */

/**
 * Shared constructed stylesheets (Constructable Stylesheets API).
 *
 * CF5 - issue (perf) resolved - each card instance used to create its own
 * <style> element holding the full ~47 KB CARD_CSS: N cards on a dashboard
 * meant N parses and N CSSOM copies, re-done on every editor keystroke
 * (setConfig → reset → render). A constructed CSSStyleSheet is parsed once
 * per unique CSS text and shared BY REFERENCE by every shadowRoot that
 * adopts it.
 *
 * Intent & constraints:
 * - Progressive enhancement ONLY. The README promises Firefox 94+ and
 *   Safari 15.4+, but `new CSSStyleSheet()` + `replaceSync` need
 *   Firefox 101 / Safari 16.4. Older engines (e.g. wall-mounted iPads
 *   stuck on iPadOS 15) must keep working: getSharedStyleSheet() returns
 *   null there and the caller falls back to the legacy per-instance
 *   <style> element — the exact pre-existing behavior, no better no worse.
 * - The cache is keyed by CSS text (not by class) so a future subclass
 *   overriding _cardStyle transparently gets its own shared sheet.
 * - adoptedStyleSheets survive `shadowRoot.innerHTML = ''` (reset()):
 *   adopting is done once per shadowRoot and needs no re-application on
 *   re-render.
 */
const CONSTRUCTED_SHEETS = new Map();
const getSharedStyleSheet = (cssText) => {
  if (CONSTRUCTED_SHEETS.has(cssText)) return CONSTRUCTED_SHEETS.get(cssText);
  let sheet = null;
  try {
    const constructed = new CSSStyleSheet();
    constructed.replaceSync(cssText);
    sheet = constructed;
  } catch {
    // Firefox < 101, Safari < 16.4 (not constructible) → keep null, legacy
    // <style> fallback
  }
  CONSTRUCTED_SHEETS.set(cssText, sheet);
  return sheet;
};

class HACore extends HTMLElement {
  static version = VERSION;
  static _baseClass = META.types.feature.typeName;
  static _cardStructure = new ObjStructure('feature');
  static _cardStyle = CARD_CSS;
  static _cardElement = CARD.htmlStructure.card.element;
  _debug = CARD_CONTEXT.debug.card;
  _log = null;
  _resourceManager = null;
  _cardView = new FeatureView();
  _dom = new DOMHelper();
  _hassProvider = HassProviderSingleton.getInstance();
  _changeTracker = new ChangeTracker();
  #isRendered = false;
  // CF5 - issue (perf) resolved - render_template subscriptions are push-based;
  // tracking the signature (template + entity variable) of each live/in-flight
  // subscription lets us skip the systematic unsubscribe/resubscribe cycle on
  // every refresh
  #templateSignatures = new Map();

  // ─── LIFECYCLE METHODS ===
  static get _loggedMethods() {
    return [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'refresh',
      'reset',
      'render',
      '_storeDOM',
      '_handleWatermarkClasses',
      '_handleBarEffect',
      '_updateDynamicElements',
      '_renderJinja',
      '_refreshBarEffect',
      '_createCardElements',
      '_buildStyle',
      '_processJinjaFields',
      '_subscribeToTemplate',
      '_watchWebSocket',
      '_unwatchWebSocket',
      '_validateProcessJinjaFields',
      '_startAutoRefresh',
      '_stopAutoRefresh',
      // abstract
      '_handleHassUpdate',
      '_updateCSS',
      '_getJinjaHandlers',
    ];
  }

  constructor() {
    super();
    this._log = initLogger(this, this._debug, this.constructor._loggedMethods);
    this.attachShadow({ mode: CARD.config.shadowMode });
  }

  static getConfigElement() {
    const metaType = Object.values(META.types).find((t) => t.typeName === this._baseClass);
    return metaType?.editor ? document.createElement(devName(metaType.editor)) : null;
  }

  connectedCallback() {
    this._ensureResourceManager();
    this.render();
    this._updateDynamicElements();
    if (this.hass) {
      this._handleHassUpdate();
      this._watchWebSocket();
    }
  }

  disconnectedCallback() {
    this._resourceManager?.cleanup();
    this._resourceManager = null;
    this.#templateSignatures.clear(); // subscriptions died with cleanup() — allow resubscription on reconnect
  }

  _ensureResourceManager() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  /**
   * Updates the component's configuration and triggers static changes.
   */
  setConfig(config) {
    this._log.debug('📎 HACore.setConfig()', config);

    if (!config) throw new Error('setConfig: invalid config');
    if (this.isRendered) this.reset(); // Card/Badge editor

    this._cardView.config = { ...config };
    this._registerWatchedEntities(config);
    this.render(); // re-build the card

    if (this.hass) this._handleHassUpdate(); // Card/Badge editor
  }

  _registerWatchedEntities(config) {
    // CF5 - issue (minor) resolved - the watched set was only ever appended to:
    // entities removed from the config (editor changes) stayed watched and kept
    // triggering refreshes until reload. Rebuilt from scratch on every
    // setConfig.
    this._changeTracker.resetWatchedEntities();
    if (is.string(config.entity)) this._changeTracker.watchEntity(config.entity);
    if (is.nonEmptyString(config.max_value?.entity)) this._changeTracker.watchEntity(config.max_value.entity);
    if (is.nonEmptyString(config.min_value?.entity)) this._changeTracker.watchEntity(config.min_value.entity);
    if (is.string(config?.watermark?.low)) this._changeTracker.watchEntity(config.watermark.low);
    if (is.string(config?.watermark?.high)) this._changeTracker.watchEntity(config.watermark.high);
    // CF5 - issue (major) resolved - additions entities were not watched: when
    // one of them changed state (main entity unchanged), the ChangeTracker
    // reported no change and the displayed total stayed stale
    if (is.array(config.bar_stack?.entities)) {
      for (const item of config.bar_stack.entities) {
        if (is.plainObject(item) && is.string(item.entity)) this._changeTracker.watchEntity(item.entity);
      }
    }
  }

  /**
   * Sets the Home Assistant (`hass`) instance and updates dynamic elements.
   *
   * @param {Object} hass - The Home Assistant instance containing the current
   *                        state and services.
   */
  set hass(hass) {
    this._log.debug('👉 HACore.set hass()');
    if (!hass) return;

    const isFirstHass = !this.hass;
    this._changeTracker.hassState = hass;
    if (isFirstHass || this._changeTracker.hassState.isUpdated) {
      this._hassProvider.hass = hass;
      this._handleHassUpdate();
    }
    this._ensureResourceManager();
    if (!this._wsInitialized) this._watchWebSocket();
  }

  get hass() {
    return this._hassProvider.hass;
  }

  _handleHassUpdate() {
    throw new Error(`${this.constructor.name} must implement _handleHassUpdate()`);
  }

  refresh() {
    this._cardView.refresh(this.hass);
    this._updateDynamicElements();
  }

  // ─── AUTO-REFRESH MANAGEMENT ──────────────────────────────────────────────
  // Shared by every subclass (cards, badges, features): a running timer
  // entity doesn't push a new hass state every second, so this simulates the
  // tick locally. Lives here (not HABase) so EntityProgressFeatures - which
  // extends HACore directly, not HABase - gets it too.

  _startAutoRefresh() {
    if (!this._resourceManager) return;
    this._resourceManager.setInterval(
      () => {
        this.refresh(this.hass);
        if (!this._cardView.isActiveTimer) {
          this._stopAutoRefresh();
        }
      },
      this._cardView.refreshSpeed,
      'autoRefresh',
    );
  }

  _stopAutoRefresh() {
    if (this._resourceManager) this._resourceManager.remove('autoRefresh');
  }

  get isRendered() {
    return this.#isRendered;
  }

  reset() {
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'transition-ready', false); // retire AVANT purge
    this.#isRendered = false;
    this._dom.destroy();
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = ''; // purge le contenu shadow DOM
    }
  }

  get cardStyle() {
    return this.constructor._cardStyle;
  }

  get baseClass() {
    return this.constructor._baseClass;
  }

  get cardElement() {
    return this.constructor._cardElement;
  }

  // ─── CARD BUILDING ────────────────────────────────────────────────────────

  /**
   * Builds and initializes the structure of the custom card component.
   *
   * This method creates the visual and structural elements of the card and
   * injects them into the component's Shadow DOM.
   */
  render() {
    if (this.isRendered) return;
    this.#isRendered = true;
    const element = this._createCardElements();
    // element.style is null when the shared constructed sheet is adopted
    this.shadowRoot.replaceChildren(...(element.style ? [element.style, element.card] : [element.card]));
    this._storeDOM();
    requestAnimationFrame(() => {
      this._dom.addClass(CARD.htmlStructure.card.element, 'transition-ready');
    });
  }

  get _structureOptions() {
    return {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default', // ─── true
      barPosition: this._cardView.config.bar_position,
    };
  }

  _createCardElements() {
    // Preferred path: adopt the shared constructed sheet (parsed once for all
    // instances). Fallback path (older Firefox/Safari, see
    // getSharedStyleSheet): a per-instance <style> element, as before.
    let style = null;
    const sharedSheet = getSharedStyleSheet(this.cardStyle);
    if (sharedSheet) {
      if (!this.shadowRoot.adoptedStyleSheets.includes(sharedSheet)) {
        this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, sharedSheet];
      }
    } else {
      style = document.createElement(CARD.style.element);
      style.textContent = this.cardStyle;
    }

    const card = document.createElement(this.cardElement);
    this._dom.destroy();
    this._dom.register(CARD.htmlStructure.card.element, card);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.value.var, 0);
    if (this._cardView.hasClickableCard || this._cardView.hasClickableIcon) {
      Object.entries(CARD.htmlStructure.card.extraAttr).forEach(([key, value]) => {
        this._dom.setAttribute(CARD.htmlStructure.card.element, key, value);
      });
    }
    this._buildStyle();
    // Cloned from the per-options <template> cache; _structureOptions is read
    // fresh here so a setConfig that changes the structure picks the right
    // template.
    card.replaceChildren(this.constructor._cardStructure.clone(this._structureOptions));

    return { style, card };
  }

  // CF5 - issue (medium) resolved - _storeDOM registered every element under
  // its first CSS class: silent collisions were possible and the map carried
  // dead weight. Only the elements actually driven through the DOMHelper are
  // registered now.
  static get _domKeys() {
    return [
      CARD.htmlStructure.elements.progressBar.container.class,
      CARD.htmlStructure.elements.icon.class,
      CARD.htmlStructure.elements.badge.icon.class,
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.htmlStructure.elements.nameMain.class,
      CARD.htmlStructure.elements.nameExtra.class,
      CARD.htmlStructure.elements.secondaryInfoMain.class,
      CARD.htmlStructure.elements.secondaryInfoExtra.class,
      CARD.htmlStructure.elements.secondaryInfoExtra2.class,
    ];
  }

  _storeDOM() {
    for (const key of this.constructor._domKeys) {
      const el = this.shadowRoot.querySelector(`.${CSS.escape(key)}`);
      if (el) this._dom.register(key, el);
    }
  }

  _buildStyle() {
    this._addBaseClasses();
    this._handleWatermarkClasses();
    this._handleBarEffect();
    this._handleBarSegments();
  }

  _handleBarSegments() {
    const count = this._cardView.config.bar_segments;
    const active = is.number(count) && count >= 2;
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'bar-segmented', active);
    if (active) this._dom.setStyle(CARD.htmlStructure.card.element, '--bar-segments', Math.round(count));
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this._cardView.config.layout,
      this._cardView.config.bar_size,
      this._cardView.config.bar_orientation
        ? CARD.style.dynamic.progressBar.orientation[this._cardView.config.bar_orientation]
        : null,
      this._cardView.config.center_zero ? CARD.style.dynamic.progressBar.centerZero.class : null,
      (this._cardView.config.layout === 'vertical' &&
        this._cardView.config.bar_orientation === 'up' &&
        this._cardView.config.bar_position === 'overlay') ||
        (this._cardView.config.bar_orientation === 'up' && this._cardView.config.bar_position === 'background')
        ? 'vertical-bar'
        : 'horizontal-bar',
    );
  }

  _handleWatermarkClasses() {
    if (!this._cardView.hasWatermark) return;

    const type = ['area', 'blended', 'striped', 'line', 'triangle', 'round'].includes(this._cardView.watermark.type)
      ? `${this._cardView.watermark.type}`
      : 'blended';
    const showClass = CARD.style.dynamic.show;

    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-hwm`, !this._cardView.watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `hwm-${type}`, !this._cardView.watermark.disable_high);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `${showClass}-lwm`, !this._cardView.watermark.disable_low);
    this._dom.toggleClass(CARD.htmlStructure.card.element, `lwm-${type}`, !this._cardView.watermark.disable_low);
  }

  // The visual editor (EntityProgressEffectChips) can only guard interactive
  // selection - a Jinja template or a hand-written YAML list bypasses it
  // entirely. Both glass/gradient(_reverse) and shimmer/shimmer_reverse write
  // the same CSS custom property (see --progress-effect(-neg) in the
  // stylesheet), so requesting an incompatible pair doesn't error, it just
  // silently drops one effect depending on stylesheet order. This mirrors
  // that same-source-of-truth exclusion here, first-requested-wins (the
  // order the template/list actually wrote them in, not a fixed priority).
  static #resolveEffectConflicts(labels) {
    const incompatible = CARD.style.dynamic.progressBar.effectIncompatibilities;
    const kept = [];
    for (const label of labels) {
      if (kept.some((keptLabel) => incompatible[keptLabel]?.includes(label))) continue;
      kept.push(label);
    }
    return kept;
  }

  _handleBarEffect(jinjaEffect = null) {
    this._log.debug('📎 HACore _handleBarEffect(jinjaEffect)', jinjaEffect);

    if (!this._cardView.barEffectsEnabled) return;
    const isJinja = is.jinja(this._cardView.config.bar_effect);
    if (isJinja && !jinjaEffect) return;

    const requested = isJinja
      ? jinjaEffect
      : is.array(this._cardView.config.bar_effect)
        ? this._cardView.config.bar_effect
        : [];
    const resolved = HACore.#resolveEffectConflicts(requested);

    const effects = Object.values(CARD.style.dynamic.progressBar.effect);
    effects.forEach((effect) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, effect.class, resolved.includes(effect.label));
    });
  }

  // ─── DYNAMIC ELEMENTS UPDATE ──────────────────────────────────────────────

  _updateDynamicElements() {
    this._updateCSS();
    this._processJinjaFields();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  _applyProgressCSS(progressValue, { barColor = null, iconColor = null, gradient = null, diverging = null } = {}) {
    const cardKey = CARD.htmlStructure.card.element;

    const fillColor = gradient ?? barColor;
    if (fillColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, fillColor);
    if (iconColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, iconColor);

    this._applyDivergingBarStackCSS(cardKey, diverging);

    if (progressValue !== null) {
      this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
      this._dom.setAttribute(
        CARD.htmlStructure.elements.progressBar.container.class,
        'aria-valuenow',
        Math.round(progressValue * 100),
      );
    }
  }

  // bar_stack 'stacked'/'proportional' + center_zero: two independent per-arm
  // gradients/sizes (see ViewBase.divergingBarStack). Explicitly removed (not
  // left stale) when not applicable - setStyle() never unsets a value on its
  // own once written.
  _applyDivergingBarStackCSS(cardKey, diverging) {
    const pb = CARD.style.dynamic.progressBar;
    if (!diverging) {
      this._dom.removeStyle(cardKey, pb.stackGradientPos.var);
      this._dom.removeStyle(cardKey, pb.stackGradientNeg.var);
      this._dom.removeStyle(cardKey, pb.stackSizePos.var);
      this._dom.removeStyle(cardKey, pb.stackSizeNeg.var);
      return;
    }
    if (diverging.posGradient) this._dom.setStyle(cardKey, pb.stackGradientPos.var, diverging.posGradient);
    else this._dom.removeStyle(cardKey, pb.stackGradientPos.var);
    if (diverging.negGradient) this._dom.setStyle(cardKey, pb.stackGradientNeg.var, diverging.negGradient);
    else this._dom.removeStyle(cardKey, pb.stackGradientNeg.var);
    this._dom.setStyle(cardKey, pb.stackSizePos.var, diverging.posSize);
    this._dom.setStyle(cardKey, pb.stackSizeNeg.var, diverging.negSize);
  }

  _applyWatermarkCSS(watermark) {
    if (!watermark) return;
    const cardKey = CARD.htmlStructure.card.element;
    HACore._getWatermarkProperties(watermark).forEach(([variable, value]) => {
      if (!is.nullish(value)) this._dom.setStyle(cardKey, variable, value);
    });
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  static _getWatermarkProperties(watermark) {
    return [
      [CARD.style.dynamic.watermark.high.value.var, `${watermark.high}%`],
      [CARD.style.dynamic.watermark.high.color.var, watermark.high_color],
      [CARD.style.dynamic.watermark.low.value.var, `${watermark.low}%`],
      [CARD.style.dynamic.watermark.low.color.var, watermark.low_color],
      [CARD.style.dynamic.watermark.opacity.var, watermark.opacity],
      [CARD.style.dynamic.watermark.lineSize.var, watermark.line_size],
    ];
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  get validJinjaFields() {
    // Most Jinja-capable options are flat string config values, but some
    // (min_value, watermark.low/.high) use an explicit { jinja: "..." } map
    // form instead of sniffing a bare string — extract accordingly. Dot-path
    // keys (watermark.low) walk one level of nesting; existing flat keys
    // (min_value) are unaffected since a 1-element path resolves identically.
    const rawValueFor = (key) => {
      const raw = key.includes('.')
        ? key.split('.').reduce((obj, k) => obj?.[k], this._cardView.config)
        : this._cardView.config[key];
      return is.plainObject(raw) ? (raw.jinja ?? '') : raw || '';
    };
    const handlers = this._getJinjaHandlers();
    const result = Object.fromEntries(
      Object.keys(handlers)
        .map((key) => [key, rawValueFor(key)])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    this._log.debug('validJinjaFields: ', { handler: handlers, config: this._cardView.config, result });
    return result;
  }

  _getJinjaHandlers(content) {
    throw new Error(`${this.constructor.name} must implement _getJinjaHandlers(${content})`);
  }

  _renderJinja(key, content) {
    this._log.debug('📎 HACore._renderJinja():', { key, content });

    const renderHandlers = this._getJinjaHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      // CF5 - issue (critical) resolved - an exception inside a render handler
      // propagated into the WebSocket message callback; log it instead of
      // crashing the card
      try {
        handler();
      } catch (error) {
        this._log.error(`Jinja - render failed for ${key}:`, error);
      }
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  _refreshBarEffect(content) {
    this._log.debug('📎 HACore._refreshBarEffect():', { content });
    // CF5 - issue (critical) resolved - render_template returns native types: a
    // template yielding a list (e.g. {{ ['glass'] }}) crashed on .split()
    const jinjaEffect = (is.array(content) ? content : String(content ?? '').split(',')).map((s) => String(s).trim());
    this._handleBarEffect(jinjaEffect);
  }

  // ─── TEMPLATE PROCESSING ──────────────────────────────────────────────────

  get _wsInitialized() {
    return this._resourceManager?.has(CARD.network.disconnected) && this._resourceManager?.has(CARD.network.ready);
  }

  _unwatchWebSocket() {
    if (!this._resourceManager) return;
    this._resourceManager.remove(CARD.network.disconnected);
    this._resourceManager.remove(CARD.network.ready);
  }

  _watchWebSocket() {
    if (!this._resourceManager) return; // ISSUE 87
    this._unwatchWebSocket();
    this._resourceManager.addEventListener(
      this.hass.connection,
      'disconnected',
      () => {
        this._log.debug('🔌 WebSocket disconnected');
        const templates = this.validJinjaFields;
        for (const key of Object.keys(templates)) {
          this._resourceManager.remove(`template-${key}`);
        }
        this.#templateSignatures.clear(); // connection lost — all subscriptions are dead server-side
      },
      { passive: true },
      CARD.network.disconnected,
    );

    this._resourceManager.addEventListener(
      this.hass.connection,
      'ready',
      () => {
        this._log.debug('🔁 WebSocket ready — reprocessing templates');
        this._ensureResourceManager();
        this._processJinjaFields();
      },
      { passive: true },
      CARD.network.ready,
    );
  }

  _validateProcessJinjaFields() {
    return Boolean(this._resourceManager) && !(this._cardView.config?.entity && this._cardView.hasStandardEntityError);
  }

  _processJinjaFields() {
    if (!this._validateProcessJinjaFields()) {
      this._log.debug('❌ Jinja processing skipped - validation failed');
      return;
    }

    this._log.debug('✅ Processing Jinja fields');

    this._resourceManager?.throttleDebounce(
      () => {
        const templates = this.validJinjaFields;
        this.#cleanupOrphanTemplates(templates);
        for (const [key, template] of Object.entries(templates)) {
          if (is.nonEmptyString(template)) this._subscribeToTemplate(key, template);
        }
      },
      300,
      'jinjaProcess',
    );
  }

  // CF5 - issue (perf) resolved - a Jinja field removed from the config left
  // its subscription alive (pushing results into a DOM that no longer expects
  // them) until disconnect; drop subscriptions whose key is no longer
  // configured
  #cleanupOrphanTemplates(templates) {
    for (const subscriptionKey of [...this.#templateSignatures.keys()]) {
      const key = subscriptionKey.slice('template-'.length);
      if (!is.nonEmptyString(templates[key])) {
        this._resourceManager?.remove(subscriptionKey);
        this.#templateSignatures.delete(subscriptionKey);
      }
    }
  }

  _getTemplateContext() {
    const entity = this._cardView?.config?.entity;
    return entity ? { entity } : {};
  }

  async _subscribeToTemplate(key, template) {
    this._log.debug('📎 HACore._subscribeToTemplate:', { key, template });
    const subscriptionKey = `template-${key}`;

    if (!this.hass?.connection?.connected) {
      this._log.debug(`[Template ${key}] WebSocket not connected, skipping subscription.`);
      return;
    }
    this._log.debug('network ok...');

    // Add null check right before using _resourceManager
    if (!this._resourceManager) {
      this._log.debug(`[Template ${key}] ResourceManager is null, skipping subscription.`);
      return;
    }

    // CF5 - issue (perf) resolved - subscriptions are push-based: skip when an
    // identical one is live or in-flight. Reserving the signature before the
    // await also fixes a race where two overlapping calls created a duplicate
    // (orphan) subscription.
    const signature = `${template}\u0000${this._getTemplateContext().entity ?? ''}`;
    if (this.#templateSignatures.get(subscriptionKey) === signature) {
      this._log.debug(`[Template ${key}] Identical subscription live or in-flight, skipping.`);
      return;
    }
    this.#templateSignatures.set(subscriptionKey, signature);

    try {
      this._log.debug('key:', key);
      this._log.debug('template:', template);

      const unsub = await this.hass.connection.subscribeMessage((msg) => this._renderJinja(key, msg.result), {
        type: 'render_template',
        template, //template: template,
        variables: this._getTemplateContext(),
      });

      // Check again after the async operation
      if (this.#templateSignatures.get(subscriptionKey) !== signature) {
        // A newer subscription attempt superseded this one while we awaited.
        unsub();
        return;
      }
      if (!this._resourceManager) {
        this._log.debug(`[Template ${key}] ResourceManager became null during subscription, cleaning up.`);
        unsub(); // Clean up the subscription
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else if (!this.isConnected) {
        // DOM conn X
        unsub(); // Clean up the subscription
        this.#templateSignatures.delete(subscriptionKey);
        return;
      } else {
        this._resourceManager.remove(subscriptionKey);
        this._resourceManager.addSubscription(unsub, subscriptionKey);
      }
    } catch (error) {
      // Allow a retry on the next processing cycle.
      if (this.#templateSignatures.get(subscriptionKey) === signature) this.#templateSignatures.delete(subscriptionKey);
      this._log.error(`Failed to subscribe to template ${key}:`, error);
    }
  }
}

/******************************************************************************
 * 🛠️ HABase
 * ============================================================================
 *
 * Extends HACore with entity rendering: icon, badge, shape, trend, hidden
 * components, standard fields, and Jinja badge handlers.
 *
 * Subclasses MUST implement: - _updateCSS() → apply dynamic CSS (percent,
 * colors, watermark)
 *
 * Subclasses MAY override: - _buildStyle() → CSS class pipeline (calls super
 * then adds entity-specific classes) - _updateDynamicElements() → DOM update
 * orchestration (icon, badge, shape, trend, CSS, Jinja) - _getStandardFields()
 * → static — returns [{className, value}] for text fields to render -
 * _hiddenComponents → static — extend the array to add card-type-specific hide
 * targets
 *
 * @abstract
 * @extends HACore
 */

class HABase extends HACore {
  static _baseClass = META.types.card.typeName;
  static _cardStructure = new ObjStructure('card');
  static _hasDisabledIconTap = false;
  static _hasDisabledBadge = false;
  static _hiddenComponents = [
    CARD.style.dynamic.hiddenComponent.icon,
    CARD.style.dynamic.hiddenComponent.name,
    CARD.style.dynamic.hiddenComponent.secondary_info,
    CARD.style.dynamic.hiddenComponent.progress_bar,
  ];
  _trendIcons = {
    up: HA_CONTEXT.icons.chevronUpBox,
    down: HA_CONTEXT.icons.chevronDownBox,
    flat: HA_CONTEXT.icons.equalBox,
    error: HA_CONTEXT.icons.progressQuestion,
  };
  _icon = null;
  _cardView = new CardView();
  _actionHelper = null;
  #jinjaStateBadge = { icon: false, color: false };
  #lastMessage = null;

  // ─── LIFECYCLE METHODS ===

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_showIcon',
      '_handleImgIcon',
      '_handleStateIcon',
      '_createStateObjIcon',
      '_cleanupImgIcon',
      '_showBadge',
      '_enableBadge',
      '_setBadgeIconColor',
      '_setBadgeIcon',
      '_setBadgeColor',
      '_manageShape',
      '_updateTrend',
      '_addBaseClasses',
      '_addBaseParameter',
      '_applyConditionalClasses',
      '_handleHiddenComponents',
      '_manageErrorMessage',
      '_renderMessage',
      '_renderBadgeIcon',
      '_renderBadgeColor',
      '_processStandardFields',
    ];
  }

  constructor() {
    super();
    this._actionHelper = new ActionHelper(this);
  }

  connectedCallback() {
    super.connectedCallback(); // render, _updateDynamicElements, watchWebSocket
    this._actionHelper.init(this._cardView.config, this.hasDisabledIconTap);
  }

  // disconnectedCallback() {}

  getCardSize() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  // Kept for HA < 2024.11 (hui-card.ts falls back to this, migrated through
  // migrateLayoutToGridOptions, when getGridOptions isn't implemented -
  // mirrors how lovelace-mushroom's MushroomBaseCard keeps both).
  getLayoutOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
  }

  // Current HA API (2024.11+): same numbers as getLayoutOptions, expressed on
  // the 12-column grid instead of the older 4-column one - see
  // CARD.layout.gridColumnMultiplier.
  getGridOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const { grid_rows, grid_min_rows, grid_columns, grid_min_columns } = this._cardView.cardLayoutOptions;
    const multiplier = CARD.layout.gridColumnMultiplier;
    const gridOptions = {
      rows: grid_rows,
      min_rows: grid_min_rows,
      columns: grid_columns * multiplier,
      min_columns: grid_min_columns * multiplier,
    };
    this._log.debug('getGridOptions: ', gridOptions);
    return gridOptions;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this._cardView.refresh(this.hass);
    if (this._manageErrorMessage()) return;
    this._updateDynamicElements();
  }

  reset() {
    super.reset(); // #isRendered, _dom.destroy(), shadowRoot.innerHTML
    this._icon = null;
  }

  get hasDisabledIconTap() {
    // check it soon
    return this.constructor._hasDisabledIconTap;
  }

  // ─── ERROR MESSAGE MANAGEMENT ─────────────────────────────────────────────

  _manageErrorMessage() {
    if (
      this._cardView.msg &&
      (is.nullish(this._cardView.entity) || (this._cardView.isAvailable && !this._cardView.hasValidatedConfig))
    ) {
      this._renderMessage(this._cardView.msg);
      return true;
    }
    this.#lastMessage = null;
    return false;
  }

  /**
   * Displays an error alert with the provided message.
   *   'info', 'warning', 'error'
   */
  _renderMessage(msg) {
    if (msg === this.#lastMessage) return;
    this.#lastMessage = msg;

    // ha-alert exists ?
    let alert = this.shadowRoot.querySelector('ha-alert');

    if (!alert) {
      alert = document.createElement('ha-alert');
      this.shadowRoot.replaceChildren(alert);
    }

    // update the message
    alert.setAttribute('alert-type', msg.sev); // IMPORTANT: attribut
    alert.textContent = msg.content;
  }

  // ─── CARD BUILDING ===

  get _structureOptions() {
    return {
      ...super._structureOptions,
      layout: this._cardView.config.layout,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: this._cardView.config.trend_indicator,
      multiline: Boolean(this._cardView.config.multiline),
    };
  }

  _buildStyle() {
    super._buildStyle(); // _handleWatermarkClasses, _handleBarEffect
    this._addBaseClasses();
    this._addBaseParameter();
    this._applyConditionalClasses();
    this._handleHiddenComponents();
  }

  _addBaseClasses() {
    super._addBaseClasses();
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass.includes('badge') ? 'progress-badge' : null,
      this._cardView.config.bar_position,
      this._cardView.hasReversedSecondaryInfoRow ? 'row-reverse' : null,
      this._cardView.config.text_shadow ? 'text-shadow' : null,
    );
  }

  _addBaseParameter() {
    const cardKey = CARD.htmlStructure.card.element;
    const config = this._cardView.config;

    [
      [this._cardView.hasReversedSecondaryInfoRow, '--secondary-info-row-reverse', 'row-reverse'],
      [config.min_width, CARD.style.dynamic.card.minWidth.var, config.min_width],
      [config.height, CARD.style.dynamic.card.height.var, config.height],
      [config.bar_max_width, CARD.style.dynamic.progressBar.maxWidth.var, config.bar_max_width],
      [config.alert_when?.color, '--alert-color', ThemeManager.adaptColor(config.alert_when?.color)],
    ].forEach(([condition, prop, value]) => {
      if (condition) this._dom.setStyle(cardKey, prop, value);
    });
  }

  get conditionalStyle() {
    return new Map([
      [CARD.style.dynamic.clickable.card, this._cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this._cardView.hasClickableIcon],
      [CARD.style.dynamic.frameless.class, this._cardView.config.frameless],
      [CARD.style.dynamic.marginless.class, this._cardView.config.marginless],
      // One card-level flag every ancestor that needs to relax its single-line
      // assumptions (.content's height, .secondary-info's bar stretch, …) reads
      // via a plain descendant selector (.info-multiline .content {...}) — not
      // a :has() re-derived at each level, which is what made every earlier
      // attempt only fix one ancestor at a time.
      ['info-multiline', Boolean(this._cardView.config.multiline)],
      ['icon-anim-spin', this._cardView.config.icon_animation === 'spin' && this._cardView.isEntityActive],
      ['icon-anim-pulse', this._cardView.config.icon_animation === 'pulse' && this._cardView.isEntityActive],
      ['icon-anim-bounce', this._cardView.config.icon_animation === 'bounce' && this._cardView.isEntityActive],
      ['icon-anim-shake', this._cardView.config.icon_animation === 'shake' && this._cardView.isEntityActive],
      ['icon-anim-ping', this._cardView.config.icon_animation === 'ping' && this._cardView.isEntityActive],
      ['icon-anim-reveal', this._cardView.config.icon_animation === 'reveal' && this._cardView.isEntityActive],
      [
        // Not isEntityActive alone: appliance integrations (Home Connect,
        // Miele) report the running program as a plain `sensor`, which
        // isEntityActive's domain gate excludes on purpose - see
        // ViewCore.isWashingMachineActive.
        'icon-anim-washing-machine',
        this._cardView.config.icon_animation === 'washing_machine' && this._cardView.isWashingMachineActive,
      ],
      [
        // Not isEntityActive: charging isn't a domain/state pair, it's an
        // attribute (see ViewCore.isBatteryCharging) — its own trigger.
        'icon-anim-battery-charging',
        this._cardView.config.icon_animation === 'battery_charging' && this._cardView.isBatteryCharging,
      ],
      [
        // See ViewCore.isBatteryIconShifted: compensates the fill wipe for
        // charging/bluetooth battery icon variants, without changing the icon.
        'icon-anim-battery-charging-shifted',
        this._cardView.config.icon_animation === 'battery_charging' &&
          this._cardView.isBatteryCharging &&
          this._cardView.isBatteryIconShifted,
      ],
      ['alert-active', this._cardView.isAlertActive],
      [
        'alert-background',
        this._cardView.isAlertActive && this._cardView.config.alert_when?.highlight === 'background',
      ],
      ['alert-anim-blink', this._cardView.isAlertActive && this._cardView.alertAnimation === 'blink'],
      ['alert-anim-ping', this._cardView.isAlertActive && this._cardView.alertAnimation === 'ping'],
    ]);
  }

  _applyConditionalClasses() {
    this.conditionalStyle.forEach((condition, className) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, className, condition);
    });
  }

  _handleHiddenComponents(jinjaContent = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    // CF5 - issue (critical) resolved - a hide Jinja template yielding a native
    // list crashed on .split(); normalize list and string results alike
    const items = is.nullish(jinjaContent)
      ? null
      : (is.array(jinjaContent) ? jinjaContent : String(jinjaContent).split(','))
          .map((s) => String(s).trim())
          .filter(Boolean);

    this.constructor._hiddenComponents.forEach((component) => {
      this._dom.toggleClass(
        CARD.htmlStructure.card.element,
        component.class,
        items ? items.includes(component.label) : this._cardView.hasComponentHiddenFlag(component.label),
      );
    });
  }

  // ─── DYNAMIC ELEMENTS UPDATE ──────────────────────────────────────────────

  _updateDynamicElements() {
    this._showIcon();
    this._showBadge();
    this._manageShape();
    this._updateTrend();
    this._updateCSS();
    // Re-applied on every refresh (not only at render): some conditions are
    // state-driven (icon_animation active state, entity error), and toggleClass
    // is value-cached so unchanged classes cost nothing.
    this._applyConditionalClasses();
    this._processJinjaFields();
    this._processStandardFields();
  }

  // ─── Update Trend ===
  _updateTrend() {
    if (!this._cardView.config.trend_indicator) return;

    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      this._trendIcons[this._cardView.getTrend()],
    );
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _createImgIcon(altText, className = 'custom-icon-img') {
    this._log.debug('📎 HABase._createImgIcon():', { altText, className });

    const img = document.createElement('img');
    img.className = className;
    img.decoding = 'async';
    img.alt = altText;
    return img;
  }

  _handleImgIcon(stateObj, srcPicture) {
    this._log.debug('📎 HABase._handleImgIcon():', { stateObj, srcPicture });

    const pictureAlt = stateObj?.attributes?.friendly_name || 'Entity picture';
    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) return;

    if (this._icon?.tagName !== 'IMG') {
      this._icon?.remove();
      this._icon = this._createImgIcon(pictureAlt);
      iconContainer.replaceChildren(this._icon);
      this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.icon.size.var, '36px');
    }

    this._icon.src = srcPicture;
    this._icon.alt = pictureAlt;
  }

  _createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture) {
    this._log.debug('📎 HABase._createStateObjIcon():', { stateObj, curIcon, hasIconOverride, hasPicture });

    if (!stateObj) {
      return this.isConnected
        ? {
            entity_id: 'sensor.dummy',
            state: 'unknown',
            attributes: {
              icon: curIcon || HA_CONTEXT.helpCircleOutline,
              friendly_name: 'Unknown Entity',
            },
          }
        : null;
    }

    if (!hasIconOverride && !hasPicture) {
      return stateObj;
    }
    if (hasIconOverride) {
      return {
        entity_id: 'sensor.for_picture',
        state: 'on',
        attributes: {
          icon: curIcon,
        },
      };
    }

    const attributes = { ...stateObj.attributes };
    if (hasPicture && !hasIconOverride) {
      delete attributes.entity_picture;
    }

    return {
      ...stateObj,
      attributes,
    };
  }

  _cleanupImgIcon() {
    if (this._icon?.tagName === 'IMG') {
      this._icon.remove();
      this._icon = null;
    }
  }

  _handleStateIcon(iconContainer, stateObjIcon) {
    this._log.debug('📎 HABase._handleStateIcon():', { iconContainer, stateObjIcon });

    this._cleanupImgIcon();

    if (!this._icon) {
      this._icon = document.createElement('ha-state-icon');
      iconContainer.replaceChildren(this._icon);
    }

    this._icon.hass = this.hass;
    this._icon.stateObj = stateObjIcon;
  }

  _showIcon() {
    if (!this._cardView) return;

    const { entity: entityId, icon: curIcon } = this._cardView;
    const stateObj = this._hassProvider.getEntityStateObj(entityId);
    const hasIconOverride = is.nonEmptyString(curIcon);
    const srcPicture = this._hassProvider.getEntityProp(entityId, 'entity_picture');
    const hasPicture = is.nonEmptyString(srcPicture);

    const iconContainer = this._dom.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) {
      this._log.error('Icon container not found for _showIcon.');
      return;
    }

    if (hasPicture && !hasIconOverride) {
      this._handleImgIcon(stateObj, srcPicture);
      return;
    }

    const stateObjIcon = this._createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture);
    if (stateObjIcon) this._handleStateIcon(iconContainer, stateObjIcon);
  }

  // ─── SHAPE MANAGEMENT ─────────────────────────────────────────────────────

  _manageShape() {
    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this._cardView.hasVisibleShape || this.hasDisabledIconTap,
    );
  }

  // ─── BADGE MANAGEMENT ─────────────────────────────────────────────────────

  /**
   * Displays a badge (default info)
   */
  _showBadge() {
    if (this.constructor._hasDisabledBadge) return;
    const badgeInfo = this._cardView.badgeInfo;
    const isBadgeEnable = badgeInfo || this._cardView.config.badge_icon || this._cardView.config.badge_color;

    this._enableBadge(isBadgeEnable);
    if (badgeInfo) this._setBadgeIconColor(badgeInfo.icon, badgeInfo.color, badgeInfo.backgroundColor);
  }

  _enableBadge(isBadgeEnable) {
    this._log.debug('📎 HABase._enableBadge():', { isBadgeEnable });

    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      isBadgeEnable,
    );
  }

  _setBadgeIconColor(icon, color, backgroundColor) {
    this._log.debug('📎 HABase._setBadgeIconColor():', { icon, color, backgroundColor });

    this._setBadgeIcon(icon);
    this._setBadgeColor(color, backgroundColor);
  }

  _setBadgeIcon(icon) {
    this._dom.setAttribute(CARD.htmlStructure.elements.badge.icon.class, CARD.style.icon.badge.default.attribute, icon);
  }

  _setBadgeColor(color, backgroundColor) {
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.badge.color.var, color);
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _getJinjaBadgeState() {
    const hasIcon = this.#jinjaStateBadge.icon;
    const hasColor = this.#jinjaStateBadge.color;

    if (hasIcon && hasColor) return 'both';
    if (hasIcon) return 'icon';
    if (hasColor) return 'color';
    return 'off';
  }
  _updateBadgeVisibility() {
    const state = this._getJinjaBadgeState();
    const shouldShow = state !== 'off';
    this._enableBadge(shouldShow);
  }

  _renderBadgeIcon(content) {
    this._log.debug('📎 HABase._renderBadgeIcon():', { content });
    this.#jinjaStateBadge.icon = is.nonEmptyString(content) && content.includes(HA_CONTEXT.icons.prefix);

    if (!is.nullish(this._cardView.badgeInfo)) return; // alert -> cancel custom badge
    if (this.#jinjaStateBadge.icon) {
      this._setBadgeIcon(content);
    }
    this._updateBadgeVisibility();
  }
  _renderBadgeColor(content) {
    this._log.debug('📎 HABase._renderBadgeColor():', { content });
    this.#jinjaStateBadge.color = is.nonEmptyString(content);

    if (!is.nullish(this._cardView.badgeInfo)) return; // alert -> cancel custom badge

    if (this.#jinjaStateBadge.color) {
      const backgroundColor = ThemeManager.adaptColor(content);
      const color = 'var(--white-color)';
      this._setBadgeColor(color, backgroundColor);
    }
    this._updateBadgeVisibility();
  }

  // ─── STD FIELDS PROCESSING ────────────────────────────────────────────────
  static _getStandardFields(/*cardView*/) {
    return [];
  }

  _processStandardFields() {
    this.constructor._getStandardFields(this._cardView).forEach(({ className, value }) => {
      this._dom.setText(className, value);
    });
  }

  // ─── JINJA TEMPLATE RENDERING ─────────────────────────────────────────────

  _baseJinjaHandlers(content) {
    return {
      bar_effect: () => this._refreshBarEffect(content),
      hide: () => this._handleHiddenComponents(content),
    };
  }

  static #BREAK_RE = /<br\s*\/?>/gi;

  // Splits Jinja-sourced HTML at the first <br> — shared by _renderCustomInfo
  // (card/badge) and _renderSecondary (template/badgeTemplate), the only two
  // callers. When `multiline` is off, any <br> is stripped instead of honored:
  // [content, null]. When on, only the first <br> is kept; anything from a 2nd
  // <br> onward is discarded. A tag straddling the break (e.g.
  // <span style="color:red">A<br>B</span>) is re-wrapped on both halves via
  // #domSplitOnce's ancestor cloning, instead of a naive string split that
  // would leave one half with an unclosed/orphaned tag.
  _splitAtFirstBreak(content) {
    const html = String(content);
    if (!this._cardView.config.multiline) return [html.replace(HABase.#BREAK_RE, ''), null];

    const [before, afterRaw] = HABase.#domSplitOnce(html);
    if (afterRaw === null) return [before, null];
    const [after] = HABase.#domSplitOnce(afterRaw); // drop anything from a 2nd <br> onward
    return [before, after];
  }

  // Single split at the first <br> element node, tree-aware: everything before
  // it goes to `before`, everything after to `after`, each re-wrapped in a
  // shallow clone of every ancestor it passed through so nested tags keep their
  // attributes on both halves. Returns [html, null] when there is no <br> at
  // all.
  static #domSplitOnce(html) {
    // Own non-global literal on purpose: #BREAK_RE carries the /g flag for the
    // .replace() call above, and .test() on a /g regex mutates lastIndex, which
    // would corrupt the *next* call's match position (this runs twice per
    // multiline render, back to back, for the 2nd-<br> check).
    if (!/<br\s*\/?>/i.test(html)) return [html, null];

    const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
    let found = false;
    const split = (node) => {
      const before = node.cloneNode(false);
      const after = node.cloneNode(false);
      for (const child of Array.from(node.childNodes)) {
        if (found) {
          after.appendChild(child.cloneNode(true));
        } else if (child.nodeName === 'BR') {
          found = true;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const [childBefore, childAfter] = split(child);
          before.appendChild(childBefore);
          if (found) after.appendChild(childAfter);
        } else {
          before.appendChild(child.cloneNode(true));
        }
      }
      return [before, after];
    };

    const [before, after] = split(root);
    return [before.innerHTML, after.innerHTML];
  }

  // ─── getStubConfig -> select entity ───────────────────────────────────────
  static getStubEntity(hass) {
    return (
      Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) ||
      'sensor.temperature'
    );
  }
}

/******************************************************************************
 * 🛠️ EntityProgressCardBase
 * ============================================================================
 *
 * ✅ Represents the base class for all standard cards:
 *  - EntityProgressCardBase / "entity-progress-card"
 *  - EntityProgressBadge / "entity-progress-badge"
 *
 *
 * @class
 * @extends HABase
 */

class EntityProgressCardBase extends HABase {
  static _hiddenComponents = [...super._hiddenComponents, CARD.style.dynamic.hiddenComponent.value];

  static getStubConfig(hass) {
    return { type: `custom:${devName(this._baseClass)}`, entity: HABase.getStubEntity(hass) };
  }

  static get _loggedMethods() {
    return [...super._loggedMethods, '_getStandardFields', '_renderCustomInfo', '_renderNameInfo'];
  }
  _handleHassUpdate() {
    this.refresh();

    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
      // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before
      // _ensureResourceManager: with an active timer entity and hass assigned
      // before connectedCallback (standard Lovelace order), _resourceManager
      // was still null and .has() crashed
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // ─── CSS - CUSTOMIZATION ──────────────────────────────────────────────────
  get conditionalStyle() {
    return new Map([
      ...super.conditionalStyle,
      [CARD.style.dynamic.secondaryInfoError.class, this._cardView.hasStandardEntityError],
    ]);
  }

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
      gradient: bar.colorGradient,
      diverging: bar.divergingBarStack,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── STD FIELDS PROCESSING - CUSTOMIZATION ────────────────────────────────
  static _getStandardFields(cardView) {
    return [
      {
        className: CARD.htmlStructure.elements.nameMain.class,
        value: cardView.name,
      },
      {
        className: CARD.htmlStructure.elements.secondaryInfoMain.class,
        value: cardView.secondaryInfoMain,
      },
    ];
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────
  // The four numeric Jinja options share one mechanism (_renderJinjaNumber);
  // each entry below only states its two specifics: which config path must
  // still be in { jinja } mode, and which view property receives the resolved
  // number.
  _getJinjaHandlers(content) {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
      min_value: () => this._renderJinjaNumber(content, (c) => c.min_value?.jinja, 'jinjaMinValue'),
      max_value: () => this._renderJinjaNumber(content, (c) => c.max_value?.jinja, 'jinjaMaxValue'),
      'watermark.low': () => this._renderJinjaNumber(content, (c) => c.watermark?.low?.jinja, 'jinjaWatermarkLow'),
      'watermark.high': () => this._renderJinjaNumber(content, (c) => c.watermark?.high?.jinja, 'jinjaWatermarkHigh'),
    };
  }

  _renderJinjaNumber(content, getJinja, viewProp) {
    // Defensive: only apply while the option is still in { jinja: "..." } mode
    // — guards against a push arriving right as the user switches the mode
    // chips away from Jinja.
    if (!is.nonEmptyString(getJinja(this._cardView.config))) return;
    const value = is.number(content) ? content : is.strictNumericString(content) ? Number(content) : null;
    if (value === this._cardView[viewProp]) return; // unchanged — skip the recompute below
    this._cardView[viewProp] = value;
    // Lightweight, like _managePercent on template cards: recompute + repaint
    // the bar only. A full this.refresh() re-ran icon/badge/shape/trend AND
    // _processJinjaFields() (which re-scans every Jinja field on the card) on
    // every single push — while typing the template in the editor, each
    // keystroke produces a push, so the full pipeline ran on every keystroke
    // and made the editor feel like it had frozen.
    this._cardView.refresh(this.hass);
    this._updateCSS();
  }
  _renderCustomInfo(content) {
    // Line 1 never carries a main (see StructureElements.secondaryInfoLine), so
    // it only gets the &nbsp; spacer in single-line mode, where it precedes the
    // main span on the same line. Line 2 always carries main here (card/badge
    // has that slot) — see _renderSecondary for the template equivalent, which
    // has no main slot at all.
    const multiline = Boolean(this._cardView.config.multiline);
    const [line1, line2] = this._splitAtFirstBreak(content);
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, multiline ? line1 : `${line1}&nbsp;`);
    if (multiline) this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra2.class, `${line2 ?? ''}&nbsp;`);
  }

  _renderNameInfo(content) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameExtra.class, `&nbsp;${content}`);
  }
}

/******************************************************************************
 * 📦 EntityProgressCard
 * ============================================================================
 *
 * ✅ HA CARD "entity-progress-card"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressCard extends EntityProgressCardBase {
  _cardView = new CardView();
  static _baseClass = META.types.card.typeName;

  // ─── STATIC METHODS ===

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions', 'getGridOptions'];
  }
}

/******************************************************************************
 * 📦 EntityProgressBadge
 * ============================================================================
 *
 * ✅ HA CARD "entity-progress-badge"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressBadge extends EntityProgressCardBase {
  _cardView = new BadgeView();
  static _baseClass = META.types.badge.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new ObjStructure('badge');

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION === Derived from the Card map
  // (minus the badge-only handlers) instead of hand-mirroring it: an earlier
  // hand-maintained copy silently missed min_value for months (CF5, medium), so
  // any handler added on the base class is now picked up here automatically by
  // construction.
  _getJinjaHandlers(content) {
    const handlers = super._getJinjaHandlers(content);
    delete handlers.badge_icon;
    delete handlers.badge_color;
    return handlers;
  }
}

/******************************************************************************
 * 📦 EntityProgressFeatures
 * ============================================================================
 *
 * ✅ HA CARD "entity-progress-feature"
 *
 * @class
 * @extends HACore
 */

class EntityProgressFeatures extends HACore {
  static _baseClass = META.types.feature.typeName;
  static _cardElement = 'div';

  // ─── STATIC ===

  static getStubConfig() {
    return { type: `custom:${devName(META.types.feature.typeName)}` };
  }

  /**
   * Fixes the parent card layout when the feature is used as an overlay.
   *
   * By default, HA increases the card's --row-size by 1 for each feature added,
   * which would make the card taller. This method counteracts that behavior by
   * piercing through multiple Shadow DOM boundaries to directly manipulate the
   * parent card's layout properties.
   *
   * The following adjustments are made: - `.container` and `hui-card-features`
   * are set to `position: static` so the feature can be positioned absolutely
   * relative to `ha-card` - `ha-card` gets `overflow: hidden` to clip the
   * feature to the card's border radius - `--row-size` is decremented by 1 to
   * cancel the extra row reserved by HA
   *
   * A MutationObserver watches for HA re-applying `--row-size`: HA's own
   * `hui-grid-section` recomputes and re-applies it (via a reactive style
   * binding) on every relevant re-render of the tile card, not just once -
   * for instance when a sibling feature's own space requirement legitimately
   * changes (e.g. a native feature's control appearing/disappearing based on
   * entity state, the same way lovelace-mushroom's own getGridOptions()
   * varies with `active`). `--row-size` therefore isn't a constant to offset
   * once and freeze - `targetRowSize` is recomputed from HA's current
   * natural value every time the observer fires. The observer is disconnected
   * for the duration of our own write (and reconnected right after) so it
   * only ever reacts to HA's mutations, never an echo of our own - comparing
   * against a remembered "last value we applied" instead would misfire the
   * moment HA's new natural size happens to numerically match a past one
   * (e.g. growing then shrinking back by exactly 1 row).
   *
   * CF5 - issue (major) resolved - the offset used to be computed once, from
   * the first-seen --row-size, and reapplied forever after regardless of
   * what HA did later. That silently clamped any later legitimate growth in
   * HA's natural row-size back down to the stale first value, which could
   * starve a sibling feature (like a native fan-speed control) of the row
   * space it had actually grown into - reported as that feature disappearing
   * after navigating away and back.
   *
   * Executed once per connection: the observer is tracked by the
   * ResourceManager (disconnected on cleanup) and its presence serves as the
   * re-entry guard.
   *
   * @inspired by hass-progress-bar-feature (MIT License) — Copyright (c) ytilis
   * @see https://github.com/ytilis/hass-progress-bar-feature
   */
  #fixCardStyles() {
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position)) return;
    // CF5 - issue (medium) resolved - the MutationObserver was never
    // disconnected: it kept observing the external card container after the
    // feature left the DOM (leak + callbacks on a dead element). It is now
    // tracked by the ResourceManager, and its presence replaces the #firstHack
    // guard so a reconnection re-installs it.
    if (!this._resourceManager || this._resourceManager.has('featureRowFix')) return;
    const cardContainer = DOMHelper.walkUpThroughShadow(this, '.card');
    if (!cardContainer) return;

    this._dom.register('ext:card', DOMHelper.walkUpThroughShadow(this, 'ha-card'));
    this._dom.register('ext:container', DOMHelper.walkUpThroughShadow(this, '.container'));
    this._dom.register('ext:features', DOMHelper.walkUpThroughShadow(this, 'hui-card-features'));
    this._dom.register('ext:card-container', cardContainer);

    const observerOptions = { attributes: true, attributeFilter: ['style'] };
    let observer = null;
    const fix = () => {
      const rowSize = parseInt(getComputedStyle(cardContainer)?.getPropertyValue(HA_CONTEXT.styles.rowSize));
      if (!rowSize) return;
      const targetRowSize = rowSize - 1;
      // Disconnect first: these 4 writes must not be recorded as mutations
      // to react to, or the next observer callback would treat our own
      // corrected value as a new "natural" one and decrement it again.
      observer?.disconnect();
      this._dom.setStyleNow('ext:card', 'overflow', 'hidden');
      this._dom.setStyleNow('ext:container', 'position', 'static');
      this._dom.setStyleNow('ext:features', 'position', 'static');
      this._dom.setStyleNow('ext:card-container', HA_CONTEXT.styles.rowSize, targetRowSize);
      observer?.observe(cardContainer, observerOptions);
    };

    fix();
    observer = new MutationObserver(fix);
    observer.observe(cardContainer, observerOptions);
    this._resourceManager.add(() => observer.disconnect(), 'featureRowFix');
  }

  // ─── HANDLE UPDATE ────────────────────────────────────────────────────────

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();

    // A running timer entity doesn't push a new hass state every second - see
    // HACore._startAutoRefresh, which simulates the tick locally. Mirrors
    // EntityProgressCardBase._handleHassUpdate.
    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      gradient: bar.colorGradient,
      diverging: bar.divergingBarStack,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content) {
    return {
      bar_effect: () => this._refreshBarEffect(content), // base
    };
  }
}

/******************************************************************************
 * 🛠️ EntityProgressTemplateBase
 * ============================================================================
 *
 * HABase subclass for Jinja-driven template cards. Unlike standard cards, all
 * display fields (name, secondary, icon, percent, badge, bar_effect) are
 * controlled via Jinja template subscriptions rather than entity state.
 *
 * Subclasses MAY override: - _cardStructure → static ObjStructure instance
 * (e.g. 'badge' for template badges) - _cardView → view instance (e.g.
 * BadgeTemplateView for template badges)
 *
 * @abstract
 * @extends HABase
 */
class EntityProgressTemplateBase extends HABase {
  static _cardStructure = new ObjStructure('template');
  _cardView = new CardTemplateView();

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_updateWatermark',
      '_showIcon',
      '_renderName',
      '_renderSecondary',
      '_managePercent',
      '_updateTrend',
      '_renderPercentCSS',
      '_validateProcessJinjaFields',
    ];
  }

  connectedCallback() {
    super.connectedCallback(); // render, _updateDynamicElements, hass, watchWebSocket
    this._updateWatermark();
  }

  _handleHassUpdate() {
    this.refresh(); // refresh() → _cardView.refresh() → _showIcon() → _updateCSS()
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${devName(META.types.template.typeName)}`,
      entity: HABase.getStubEntity(hass),
      ...CARD.config.stub.template,
    };
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    this._applyProgressCSS(null, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
    });
    this._applyWatermarkCSS(bar.hasWatermark ? bar.watermark : null);
  }

  // ─── WATERMARK MANAGEMENT ─────────────────────────────────────────────────

  _updateWatermark() {
    if (!this._cardView.hasWatermark) return;
    this._cardView.refresh();
    this._applyWatermarkCSS(this._cardView.watermark);
  }

  // ─── ICON MANAGEMENT ──────────────────────────────────────────────────────

  _showIcon(iconFromJinja = null) {
    const jinjaIconNotReady = this._cardView.config.icon !== undefined && iconFromJinja === null;
    if (jinjaIconNotReady) return;
    this._cardView.icon = iconFromJinja;
    super._showIcon();
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content) {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      name: () => this._renderName(content),
      secondary: () => this._renderSecondary(content),
      icon: () => this._showIcon(content),
      percent: () => this._managePercent(content),
      color: () =>
        this._dom.setStyle(
          CARD.htmlStructure.card.element,
          CARD.style.dynamic.iconAndShape.color.var,
          ThemeManager.adaptColor(content),
        ),
      bar_color: () =>
        this._dom.setStyle(
          CARD.htmlStructure.card.element,
          CARD.style.dynamic.progressBar.color.var,
          ThemeManager.adaptColor(content),
        ),
    };
  }

  _renderName(content) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameMain.class, `${content}`.trim());
  }

  _renderSecondary(content) {
    // Template has no secondary-info-main slot at all (see
    // StructureElements.secondaryInfoWrapperMinimal), so neither line ever
    // needs the &nbsp; spacer that card/badge's _renderCustomInfo adds before
    // main. `info-multiline` itself is applied via conditionalStyle
    // (config-driven), not here.
    const multiline = Boolean(this._cardView.config.multiline);
    const [line1, line2] = this._splitAtFirstBreak(content);
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, line1.trim());
    if (multiline) this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra2.class, (line2 ?? '').trim());
  }

  _managePercent(percent) {
    // CF5 - issue (minor) resolved - a percent template returning a numeric
    // string was compared lexicographically in getTrend ('9' < '45' is false →
    // wrong trend); non-numeric results now show an explicit error icon instead
    // of corrupting the trend and the bar CSS
    const value = is.number(percent) ? percent : is.strictNumericString(percent) ? Number(percent) : null;
    if (value === null) {
      this._updateTrend(NaN); // renders the error icon, keeps _lastPercent untouched
      return;
    }
    this._updateTrend(value); // unclamped: trend detection wants the true delta, same as ViewBase.getTrend

    // CF5 - issue (major) resolved - a Jinja `percent` isn't bounded the way
    // ProgressCalc's own min/max division is (see ViewCore.get percent(),
    // which clamps for exactly this reason). The CSS fill is
    // translateX-based (GPU, not width-based), so it doesn't self-clamp
    // above 100%/below -100% - it overshoots past the container edge and
    // the bar renders with an empty gap on one side instead of full.
    const isCenterZero = Boolean(this._cardView.config.center_zero);
    const clamped = isCenterZero ? Math.max(-100, Math.min(100, value)) : Math.max(0, Math.min(100, value));
    this._renderPercentCSS(clamped);
  }

  // Called without param from HABase._updateDynamicElements (pre-Jinja),
  // and with percent from _managePercent when the Jinja template resolves.
  _updateTrend(percent) {
    if (!this._cardView.config.trend_indicator) return;
    // CF5 - issue (major) resolved - the paramless call from
    // _updateDynamicElements ran getTrend(undefined), which clobbered
    // _lastPercent on every refresh: the trend indicator stayed 'flat' whenever
    // a hass update interleaved two Jinja percent pushes. Only Jinja pushes may
    // update the trend.
    if (percent === undefined) return;
    // NaN = invalid template result: show the error icon without touching
    // _lastPercent
    const icon = Number.isNaN(percent) ? this._trendIcons.error : this._trendIcons[this._cardView.getTrend(percent)];
    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      icon,
    );
  }

  _renderPercentCSS(percent) {
    this._applyProgressCSS(percent / 100);
  }

  // ─── TEMPLATE PROCESSING ===

  _validateProcessJinjaFields() {
    return Boolean(this.hass) && Boolean(this._resourceManager);
  }
}

/******************************************************************************
 * 📦 EntityProgressTemplateCard
 * ============================================================================
 *
 * ✅ HA CARD "entity-progress-card-template"
 *
 * @class
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateCard extends EntityProgressTemplateBase {
  static _baseClass = META.types.template.typeName;

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions', 'getGridOptions'];
  }
}

/******************************************************************************
 * 📦 EntityProgressTemplateBadge
 * ============================================================================
 *
 * ✅ HA CARD "entity-progress-badge-template"
 *
 * @class
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateBadge extends EntityProgressTemplateBase {
  static _baseClass = META.types.badgeTemplate.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new ObjStructure('badge');
  _cardView = new BadgeTemplateView();

  setConfig(config) {
    super.setConfig(config);
    // Defer refresh by one tick so HA finishes its own DOM update cycle before
    // we read state. CF5 - issue (minor) resolved - the raw setTimeout was
    // untracked and could fire after disconnect; routed through ResourceManager
    // so cleanup() cancels it (the shared id also dedupes rapid setConfig
    // calls)
    if (this.hass) this._resourceManager?.setTimeout(() => this.refresh(), 0, 'deferredRefresh');
  }

  static getStubConfig(hass) {
    return { type: `custom:${devName(META.types.badgeTemplate.typeName)}`, entity: HABase.getStubEntity(hass) };
  }
}

/******************************************************************************
 * 📦 CARD/BADGE EDITOR
 ******************************************************************************/

const availableSpace = (gap = 16, factor = 0.5) => `calc((100% - ${gap}px) * ${factor})`;

/******************************************************************************
 * 🛠️ EditorDOMHelper
 * ============================================================================
 *
 * @class
 * @extends DOMHelper
 */

class EditorDOMHelper extends DOMHelper {
  // ─── Field registration ───────────────────────────────────────────────────

  /**
   * Registers a field element and its definition.
   * Wraps DOMHelper.register() — the def is stored on the element directly
   * so it travels with it without needing a separate Map.
   *
   * @param {string}      name — field id
   * @param {HTMLElement} el   — ha-selector or ha-form element
   * @param {object}      def  — field definition from _fields
   */
  registerField(name, el, def) {
    el._fieldDef = def;
    this.register(name, el);
  }

  // ─── Hass propagation ─────────────────────────────────────────────────────

  /**
   * Propagates hass to all registered field elements.
   * Batched in a single RAF call.
   *
   * @param {object} hass
   */
  updateHass(hass) {
    this.enqueue('__hass__', 'hass', () => {
      for (const el of this._domElements.values()) {
        if (el.hass !== hass) el.hass = hass;
      }
    });
  }

  // ─── Field value ──────────────────────────────────────────────────────────

  /**
   * Updates the value of a ha-selector field.
   * Skipped if value hasn't changed.
   *
   * @param {string} name
   * @param {*}      newVal
   */
  updateValue(name, newVal) {
    this.enqueue(name, 'value', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      if (el.value !== newVal) el.value = newVal;
    });
  }

  // ─── Visibility ───────────────────────────────────────────────────────────

  /**
   * Shows or hides a field.
   * Batched via RAF.
   *
   * @param {string}  name
   * @param {boolean} visible
   */
  updateVisibility(name, visible) {
    const cacheKey = `${name}:display`;
    if (this._appliedValues.get(cacheKey) === visible) return;

    this.enqueue(name, 'display', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.style.display = visible ? '' : 'none';
      this._appliedValues.set(cacheKey, visible);
    });
  }

  // ─── Action selector default ──────────────────────────────────────────────

  /**
   * Updates the ui-action selector with the effective default_action so that
   * the native ha-selector renders "Default (action-name)" inside the box.
   * Mirrors the validation preprocess logic for icon_tap_action (toggleDomain).
   *
   * @param {string} name
   * @param {object} def    — field definition
   * @param {object} config — raw config (this.#config)
   */
  _updateActionSelector(name, def, config) {
    const key = def.target ?? def.name;
    let defaultAction = CARD.config.defaults[key]?.action ?? 'none';
    if (key === 'icon_tap_action' && config.entity) {
      const domain = HassProviderSingleton.getEntityDomain(config.entity);
      if (HA_CONTEXT.actions.toggleDomain.includes(domain)) defaultAction = 'toggle';
    }
    this.updateSelector(name, { 'ui-action': { default_action: defaultAction } });
  }

  // ─── Dynamic selector ─────────────────────────────────────────────────────

  /**
   * Updates the selector of a ha-selector field. Used for fields whose options
   * depend on another field (e.g. attribute → entity).
   *
   * @param {string} name
   * @param {object} selector
   */
  updateSelector(name, selector) {
    // Was reassigned unconditionally on every #updateFields() pass (i.e. every
    // editor keystroke, for every field with selectorOf — not just the one
    // being edited), forcing the child ha-selector's attribute picker to fully
    // re-render each time regardless of whether the referenced entity actually
    // changed. Value-cached like the other setters.
    const cacheKey = `${name}:selector`;
    const serialized = JSON.stringify(selector);
    if (this._appliedValues.get(cacheKey) === serialized) return;

    this.enqueue(name, 'selector', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.selector = selector;
      this._appliedValues.set(cacheKey, serialized);
    });
  }

  // ─── Bulk update ──────────────────────────────────────────────────────────

  /**
   * Iterates all registered fields and applies value, visibility,
   * and dynamic selector updates based on the current config.
   *
   * @param {object}   config       — current card config
   * @param {function} resolveValue — (def, config) => raw value
   */
  _applyContext(name, contextDef, config) {
    // Same class of bug as updateSelector: reassigned a brand-new object on
    // every #updateFields() pass (i.e. on every keystroke anywhere in the form,
    // not just in this field), forcing the child selector (e.g. state_content's
    // entity/attribute picker) to fully re-render every time regardless of
    // whether anything changed.
    const cacheKey = `${name}:context`;
    const resolved = Object.fromEntries(
      Object.entries(contextDef).map(([key, configKey]) => [key, config[configKey] ?? '']),
    );
    const serialized = JSON.stringify(resolved);
    if (this._appliedValues.get(cacheKey) === serialized) return;

    this.enqueue(name, 'context', () => {
      const target = this._domElements.get(name);
      if (!target) return;
      target.context = resolved;
      this._appliedValues.set(cacheKey, serialized);
    });
  }

  updateAll(config, resolveValue, negotiated = null) {
    for (const [name, el] of this._domElements) {
      const def = el._fieldDef;
      if (def) this._updateField(name, def, config, resolveValue, negotiated);
    }
  }

  _updateField(name, def, config, resolveValue, negotiated = null) {
    // Visibility
    if (def.showIf) {
      this.updateVisibility(name, def.showIf(config, negotiated));
    }

    // Dynamic selector
    if (def.selectorOf) {
      const resolved = def.selectorOf.includes('.')
        ? def.selectorOf.split('.').reduce((obj, k) => obj?.[k], config)
        : config[def.selectorOf];
      // The source key can hold a non-string shape (watermark.low: { jinja }) —
      // the native attribute selector expects an entity-id string, so anything
      // else degrades to ''.
      this.updateSelector(name, { attribute: { entity_id: is.string(resolved) ? resolved : '' } });
    }

    // Context
    if (def.context) {
      this._applyContext(name, def.context, config);
    }

    // Champs virtuels — pas de valeur dans le config, géré par showIf
    // uniquement
    if (def.virtual) {
      this._updateVirtualValue(name, def, config);
      return;
    }

    // Value
    const raw = resolveValue(def, config);
    const val = def.invert ? !raw : raw;
    this.updateValue(name, val);

    // Allow elements with updateConfig (e.g. chips fields) to receive full
    // config
    const el = this._domElements.get(name);
    if (el && is.func(el.updateConfig)) el.updateConfig(config);

    // Inject effective default_action so ha-selector renders "Default
    // (action-name)"
    if (def.type === 'action') this._updateActionSelector(name, def, config);
  }

  _updateVirtualValue(name, def, config) {
    if (!def.resolveVirtual) return;
    this.updateValue(name, def.resolveVirtual(config));
  }
}

const CHIPS_HOST_STYLE =
  ':host { display: block; width: 100%; }' +
  ' .lbl { display: block; font-size: 1rem; font-weight: 400; line-height: 1.5;' +
  ' color: var(--primary-text-color); padding-bottom: 4px; }' +
  ' .chip-set { display: flex; flex-wrap: wrap; gap: 8px; }' +
  ' .chip { display: inline-flex; align-items: center; height: 32px; padding: 0 16px; box-sizing: border-box;' +
  ' border: 1px solid var(--divider-color, #e0e0e0); border-radius: 8px; background: transparent;' +
  ' color: var(--primary-text-color); font-family: inherit; font-size: 14px; line-height: 1; cursor: pointer;' +
  ' transition: background-color 0.15s, border-color 0.15s; }' +
  ' .chip:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }' +
  ' .chip.selected { background: var(--primary-color); border-color: var(--primary-color);' +
  ' color: var(--text-primary-color, #fff); }';

class ChipsBase extends HTMLElement {
  // CF5 - issue (major) resolved - setLabels() is called by the editor before
  // the element is connected, when the chips Map is still empty; labels are now
  // stored and applied at build time
  _labels = null;
  #labelText = '';
  #labelEl = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot.querySelector('.chip-set')) this._buildDOM();
    this._render();
  }

  get label() {
    return this.#labelText;
  }
  set label(val) {
    this.#labelText = val ?? '';
    if (this.#labelEl) this.#labelEl.textContent = this.#labelText;
  }

  _chipLabel(value) {
    return this._labels?.[value] ?? value;
  }

  _createChip(value, onToggle) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = this._chipLabel(value);
    chip.addEventListener('click', (clickEvent) => {
      clickEvent.stopPropagation();
      onToggle(value);
    });
    return chip;
  }

  _buildChipSet(values, onToggle, chipsMap) {
    const style = document.createElement('style');
    style.textContent = CHIPS_HOST_STYLE;
    const frag = [style];
    if (this.#labelText) {
      this.#labelEl = document.createElement('div');
      this.#labelEl.className = 'lbl';
      this.#labelEl.textContent = this.#labelText;
      frag.push(this.#labelEl);
    }
    const chipSet = document.createElement('div');
    chipSet.className = 'chip-set';
    for (const value of values) {
      const chip = this._createChip(value, onToggle);
      chipSet.appendChild(chip);
      chipsMap.set(value, chip);
    }
    frag.push(chipSet);
    this.shadowRoot.append(...frag);
  }
}

class EntityProgressEffectChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-effect-chips';
  static #EFFECTS = [
    { value: 'radius' },
    { value: 'glass', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'gradient_reverse', showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode) },
    { value: 'shimmer' },
    { value: 'shimmer_reverse' },
  ];

  // Shared with the runtime guard in HACore._handleBarEffect - see
  // CARD.style.dynamic.progressBar.effectIncompatibilities.
  static get #INCOMPATIBLE() {
    return CARD.style.dynamic.progressBar.effectIncompatibilities;
  }

  #selected = [];
  #config = {};
  #chips = new Map();

  _buildDOM() {
    this._buildChipSet(
      EntityProgressEffectChips.#EFFECTS.map((effect) => effect.value),
      (value) => this.#toggle(value),
      this.#chips,
    );
  }

  #toggle(value) {
    const isSelected = this.#selected.includes(value);
    const blocked = isSelected ? [] : (EntityProgressEffectChips.#INCOMPATIBLE[value] ?? []);
    const updated = isSelected
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected.filter((v) => !blocked.includes(v)), value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value() {
    return this.#selected;
  }
  set value(val) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  updateConfig(config) {
    this.#config = config ?? {};
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [value, chip] of this.#chips) chip.textContent = this._chipLabel(value);
  }

  _render() {
    if (!this.#chips.size) return;
    for (const effect of EntityProgressEffectChips.#EFFECTS) {
      const chip = this.#chips.get(effect.value);
      if (!chip) continue;
      const visible = !effect.showIf || effect.showIf(this.#config);
      const blocked = (EntityProgressEffectChips.#INCOMPATIBLE[effect.value] ?? []).some((v) =>
        this.#selected.includes(v),
      );
      chip.style.display = visible && !blocked ? '' : 'none';
      chip.classList.toggle('selected', this.#selected.includes(effect.value));
    }
  }
}

if (!customElements.get(EntityProgressEffectChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressEffectChips.ELEMENT_NAME, EntityProgressEffectChips);
}

class EntityProgressHideChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-hide-chips';
  static #ITEMS = ['icon', 'name', 'value', 'unit', 'secondary_info', 'progress_bar'];

  #selected = [];
  #chips = new Map();

  _buildDOM() {
    this._buildChipSet(EntityProgressHideChips.#ITEMS, (value) => this.#toggle(value), this.#chips);
  }

  #toggle(value) {
    const updated = this.#selected.includes(value)
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected, value];
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }),
    );
  }

  get value() {
    return this.#selected;
  }
  set value(val) {
    this.#selected = is.array(val) ? val : [];
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [item, chip] of this.#chips) chip.textContent = this._chipLabel(item);
  }

  _render() {
    for (const [item, chip] of this.#chips) chip.classList.toggle('selected', this.#selected.includes(item));
  }
}

if (!customElements.get(EntityProgressHideChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressHideChips.ELEMENT_NAME, EntityProgressHideChips);
}

// Single-select variant: exactly one mode is always active (no
// deselect-to-empty), unlike EffectChips/HideChips which toggle membership in
// an array. Concrete subclasses only need to declare `static MODES`;
// `this.constructor.MODES` resolves polymorphically.
class SingleSelectChipsBase extends ChipsBase {
  #selected = null;
  #chips = new Map();

  _buildDOM() {
    this.#selected ??= this.constructor.MODES[0];
    this._buildChipSet(this.constructor.MODES, (value) => this.#select(value), this.#chips);
  }

  #select(value) {
    if (value === this.#selected) return;
    this.#selected = value;
    this._render();
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value }, bubbles: true, composed: true }));
  }

  get value() {
    return this.#selected ?? this.constructor.MODES[0];
  }
  set value(val) {
    this.#selected = this.constructor.MODES.includes(val) ? val : this.constructor.MODES[0];
    this._render();
  }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [item, chip] of this.#chips) chip.textContent = this._chipLabel(item);
  }

  _render() {
    for (const [item, chip] of this.#chips) chip.classList.toggle('selected', item === this.#selected);
  }
}

// One element for every "value source" selector (min_value, max_value,
// watermark.low, watermark.high): the modes are identical, and everything
// field-specific (id, label, localized option labels,
// resolveVirtual/onVirtualChange) is per-instance, set by #buildModeChipsField
// from the field definition — the class itself carries nothing to specialize. A
// field whose modes ever diverge stops being a "value source" and gets its own
// class, like theme_mode/bar_stack_mode below.
class EntityProgressValueSourceModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-value-source-mode-chips';
  static MODES = ['standard', 'entity', 'jinja'];
}
if (!customElements.get(EntityProgressValueSourceModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressValueSourceModeChips.ELEMENT_NAME, EntityProgressValueSourceModeChips);
}

class EntityProgressThemeModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-theme-mode-chips';
  static MODES = ['preset', 'custom'];
}
if (!customElements.get(EntityProgressThemeModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressThemeModeChips.ELEMENT_NAME, EntityProgressThemeModeChips);
}

class EntityProgressBarStackModeChips extends SingleSelectChipsBase {
  static ELEMENT_NAME = 'entity-progress-bar-stack-mode-chips';
  static MODES = ['stacked', 'proportional', 'net'];
}
if (!customElements.get(EntityProgressBarStackModeChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressBarStackModeChips.ELEMENT_NAME, EntityProgressBarStackModeChips);
}

/******************************************************************************
 * 📝 ListEditorBase
 * ============================================================================
 * Shared base for custom elements that edit an array of row-objects: a label, a
 * list container, connectedCallback's build-once-then-render lifecycle, the
 * value setter, and delete-by-index all follow the exact same shape regardless
 * of what a row actually contains. Concrete subclasses implement _buildDOM()/
 * _render()/_dispatch() — the same template-method pattern ChipsBase already
 * uses for the chip family (_buildDOM overridden per concrete chip type).
 *
 * @class
 * @extends HTMLElement
 */
class ListEditorBase extends HTMLElement {
  _labelText = '';
  _value = [];
  _list = null;
  _labelEl = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this._list) this._buildDOM();
    this._render();
  }

  get label() {
    return this._labelText;
  }
  set label(val) {
    this._labelText = val ?? '';
    if (this._labelEl) this._labelEl.textContent = this._labelText;
  }

  get value() {
    return this._value;
  }
  set value(val) {
    this._value = is.array(val) ? val.filter(is.plainObject) : [];
    if (this._list) this._render();
  }

  _deleteRow(index) {
    this._value = this._value.filter((_, i) => i !== index);
    this._render();
    this._dispatch();
  }

  _updateItem(index, patch) {
    this._value = this._value.map((item, i) => (i === index ? { ...item, ...patch } : item));
    this._render();
    this._dispatch();
  }
}

class EntityProgressBarStackEditor extends ListEditorBase {
  static ELEMENT_NAME = 'entity-progress-bar-stack-editor';

  #hass = null;
  #addBtn = null;

  get hass() {
    return this.#hass;
  }
  set hass(hass) {
    this.#hass = hass;
    for (const el of this.shadowRoot?.querySelectorAll(HA_SELECTOR_TAG) ?? []) el.hass = hass;
  }

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; }
      .lbl {
        display: block;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: var(--primary-text-color);
        padding-bottom: 4px;
      }
      .row-card {
        display: flex;
        flex-direction: column;
        gap: 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
      }
      .row-header { display: flex; align-items: center; justify-content: space-between; }
      .row-title { font-size: 0.9rem; color: var(--secondary-text-color); }
      .del-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--secondary-text-color);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        box-sizing: border-box;
      }
      .del-btn:hover { color: var(--primary-color); }
      .del-btn ha-svg-icon { width: 16px; height: 16px; }
      .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }
    `;
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'lbl';
    this._labelEl.textContent = this._labelText;
    this._list = document.createElement('div');
    this.#addBtn = document.createElement('ha-button');
    const addIcon = document.createElement(HA_SVG_ICON_TAG);
    addIcon.setAttribute('slot', 'icon');
    addIcon.path = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
    this.#addBtn.appendChild(addIcon);
    this.#addBtn.append('Add entity');
    this.#addBtn.addEventListener('click', () => {
      this._value = [...this._value, {}];
      this._render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this.#addBtn);
    this.shadowRoot.append(style, this._labelEl, this._list, addRow);
  }

  _dispatch() {
    const clean = this._value.filter((item) => item.entity);
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #entityField(item, index) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { entity: {} };
    el.value = item.entity ?? '';
    el.required = false;
    el.style.width = '100%';
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { entity: e.detail.value || undefined, attribute: undefined });
    });
    return el;
  }

  #attributeField(item, index) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { attribute: { entity_id: item.entity ?? '' } };
    el.value = item.attribute ?? '';
    el.required = false;
    el.style.width = '100%';
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { attribute: e.detail.value || undefined });
    });
    return el;
  }

  #colorField(item, index) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { 'ui-color': {} };
    el.label = 'Color';
    el.style.width = '100%';
    el.value = item.color ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { color: e.detail.value || undefined });
    });
    return el;
  }

  // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
  // center_zero: placed on the negative arm instead of the positive one. No
  // effect otherwise (harmless no-op) - kept simple rather than conditionally
  // hiding this per-row based on sibling fields (mode, center_zero) the row
  // editor doesn't otherwise need to know about.
  #subtractField(item, index) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { boolean: {} };
    el.label = 'Subtract / negative side';
    el.style.width = '100%';
    el.value = item.subtract ?? false;
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { subtract: e.detail.value || undefined });
    });
    return el;
  }

  _render() {
    this._list.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.title = 'Delete';
      const delIcon = document.createElement(HA_SVG_ICON_TAG);
      delIcon.path =
        'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';
      delBtn.appendChild(delIcon);
      delBtn.addEventListener('click', () => this._deleteRow(i));

      const title = document.createElement('span');
      title.className = 'row-title';
      title.textContent = `#${i + 1}`;

      const header = document.createElement('div');
      header.className = 'row-header';
      header.append(title, delBtn);

      const card = document.createElement('div');
      card.className = 'row-card';
      card.append(header, this.#entityField(item, i));
      if (item.entity) card.append(this.#attributeField(item, i));
      card.append(this.#colorField(item, i), this.#subtractField(item, i));

      this._list.appendChild(card);
    }
  }
}

if (!customElements.get(EntityProgressBarStackEditor.ELEMENT_NAME)) {
  customElements.define(EntityProgressBarStackEditor.ELEMENT_NAME, EntityProgressBarStackEditor);
}

/******************************************************************************
 * 🎨 EntityProgressCustomThemeEditor
 * ============================================================================
 * Custom element that renders an editable list of custom_theme zones, each a
 * contiguous { min, max, color?, icon_color?, bar_color?, icon? } range.
 * Mirrors EntityProgressBarStackEditor's row-list pattern (label, list, add
 * button, value-changed with the filtered array), with a richer per-row form.
 *
 * @class
 * @extends HTMLElement
 */

class EntityProgressCustomThemeEditor extends ListEditorBase {
  static ELEMENT_NAME = 'entity-progress-custom-theme-editor';

  #hass = null;
  #addBtn = null;
  #addLabel = 'Add zone';

  setAddLabel(val) {
    this.#addLabel = val ?? this.#addLabel;
    if (this.#addBtn) this.#addBtn.lastChild.textContent = this.#addLabel;
  }

  get hass() {
    return this.#hass;
  }
  set hass(hass) {
    this.#hass = hass;
    for (const el of this.shadowRoot?.querySelectorAll(HA_SELECTOR_TAG) ?? []) el.hass = hass;
  }

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; }
      .lbl {
        display: block;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: var(--primary-text-color);
        padding-bottom: 4px;
      }
      .zone {
        display: flex;
        flex-direction: column;
        gap: 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
      }
      .zone-header { display: flex; align-items: center; justify-content: space-between; }
      .zone-title { font-size: 0.9rem; color: var(--secondary-text-color); }
      .numbers-row { display: flex; gap: 16px; }
      .numbers-row > * { width: calc((100% - 16px) * 0.5); }
      .del-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--secondary-text-color);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        box-sizing: border-box;
      }
      .del-btn:hover { color: var(--primary-color); }
      .del-btn ha-svg-icon { width: 16px; height: 16px; }
      .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }
    `;
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'lbl';
    this._labelEl.textContent = this._labelText;
    this._list = document.createElement('div');
    this.#addBtn = document.createElement('ha-button');
    const addIcon = document.createElement(HA_SVG_ICON_TAG);
    addIcon.setAttribute('slot', 'icon');
    addIcon.path = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
    this.#addBtn.appendChild(addIcon);
    this.#addBtn.append(this.#addLabel);
    this.#addBtn.addEventListener('click', () => {
      this._value = [...this._value, {}];
      this._render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this.#addBtn);
    this.shadowRoot.append(style, this._labelEl, this._list, addRow);
  }

  _dispatch() {
    const isEmpty = (item) =>
      !is.number(item.min) && !is.number(item.max) && !item.color && !item.icon_color && !item.bar_color && !item.icon;
    const clean = this._value.filter((item) => !isEmpty(item));
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGED_EVENT, {
        detail: { value: clean.length ? clean : undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #numberField(item, index, key) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { number: {} };
    el.label = key === 'min' ? 'Min' : 'Max';
    el.value = is.number(item[key]) ? item[key] : undefined;
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { [key]: is.number(e.detail.value) ? e.detail.value : undefined });
    });
    return el;
  }

  #colorField(item, index, key, label) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { 'ui-color': {} };
    el.label = label;
    el.style.width = '100%';
    el.value = item[key] ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { [key]: e.detail.value || undefined });
    });
    return el;
  }

  #iconField(item, index) {
    const el = document.createElement(HA_SELECTOR_TAG);
    el.hass = this.#hass;
    el.selector = { icon: { icon_set: ['mdi'] } };
    el.label = 'Icon';
    el.style.width = '100%';
    el.value = item.icon ?? '';
    el.addEventListener(VALUE_CHANGED_EVENT, (e) => {
      e.stopPropagation();
      this._updateItem(index, { icon: e.detail.value || undefined });
    });
    return el;
  }

  _render() {
    this._list.innerHTML = '';
    for (let i = 0; i < this._value.length; i++) {
      const item = this._value[i];

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.title = 'Delete';
      const delIcon = document.createElement(HA_SVG_ICON_TAG);
      delIcon.path =
        'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';
      delBtn.appendChild(delIcon);
      delBtn.addEventListener('click', () => this._deleteRow(i));

      const header = document.createElement('div');
      header.className = 'zone-header';
      const title = document.createElement('span');
      title.className = 'zone-title';
      title.textContent = `Zone ${i + 1}`;
      header.append(title, delBtn);

      const numbers = document.createElement('div');
      numbers.className = 'numbers-row';
      numbers.append(this.#numberField(item, i, 'min'), this.#numberField(item, i, 'max'));

      const zone = document.createElement('div');
      zone.className = 'zone';
      zone.append(
        header,
        numbers,
        this.#iconField(item, i),
        this.#colorField(item, i, 'color', 'Icon & bar color'),
        this.#colorField(item, i, 'icon_color', 'Icon color'),
        this.#colorField(item, i, 'bar_color', 'Bar color'),
      );
      this._list.appendChild(zone);
    }
  }
}

if (!customElements.get(EntityProgressCustomThemeEditor.ELEMENT_NAME)) {
  customElements.define(EntityProgressCustomThemeEditor.ELEMENT_NAME, EntityProgressCustomThemeEditor);
}

/******************************************************************************
 * 🛠️ EditorBase
 * ============================================================================
 *
 * @class
 * @extends HTMLElement
 */

class EditorBase extends HTMLElement {
  static _fields = {
    /* --- customize it
    general: {
      flat: true,
      fields: {
        entity: { name: 'entity', type: 'entity' },
      },
    },
    content: {
      title: 'editor.title.content',
      icon: 'mdi:text-short',
      fields: {
        name: { name: 'name', type: 'template' },
        secondary: { name: 'secondary', type: 'template' },
        percent: { name: 'percent', type: 'template' },
      },
    }, */
  };

  // ─── private state ────────────────────────────────────────────────────────

  #config = {};
  #hassProvider = null;
  #dom = null;
  #boundOnChanged = null;
  #pendingSentConfig = null;
  #sendConfigScheduled = false;
  _configHelper = new BaseConfigHelper();

  get #localizedOptions() {
    // CF5 - issue (minor) resolved - localize() returns the key string before
    // translations load; select builders then crashed on
    // Object.entries(undefined). Fall back to the default language.
    const options = this.#hassProvider.localize('editor.option');
    return is.plainObject(options) ? options : TRANSLATIONS[CARD.config.language].editor.option;
  }

  // ─── LIFECYCLE ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#hassProvider = HassProviderSingleton.getInstance();
    this.#dom = new EditorDOMHelper();
  }

  connectedCallback() {
    this.#boundOnChanged = this.#onChanged.bind(this);
    this.#render();
    this.shadowRoot.addEventListener(VALUE_CHANGED_EVENT, this.#boundOnChanged);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener(VALUE_CHANGED_EVENT, this.#boundOnChanged);
    this.#boundOnChanged = null;
    // this.#dom.destroy();
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  set hass(hass) {
    if (!hass) return;
    this.#hassProvider.hass = hass;
    this.#dom.updateHass(hass);
  }
  get hass() {
    return this.#hassProvider.hass;
  }

  setConfig(config) {
    if (!config) throw new Error(CARD.config.configError);
    // _-prefixed keys are ephemeral UI state (e.g. _show_all_actions): stripped
    // from config-changed before dispatch so HA never saves them, but preserved
    // here across setConfig calls so the editor state survives HA's
    // config-changed → setConfig roundtrip.
    const uiState = Object.fromEntries(Object.entries(this.#config ?? {}).filter(([k]) => k.startsWith('_')));
    this._configHelper.config = config;
    this.#config = { ...config, ...uiState };
    this.#updateFields();
  }

  // ─── RENDER (once) ────────────────────────────────────────────────────────

  #render() {
    if (this.shadowRoot.querySelector('.editor')) return;

    const style = document.createElement('style');
    style.textContent = `
      .editor { display: flex; flex-direction: column; gap: 16px; }
      .panel-body { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; align-content: flex-start; padding: 8px 0; }
      .panel-body ha-selector.field-toggle { margin-block: -18px; }
      .migrate-header { display: flex; justify-content: flex-end; }
    `;

    const container = document.createElement('div');
    container.className = 'editor';

    container.appendChild(this.#buildMigrateHeader());

    for (const [section, def] of Object.entries(this.constructor._fields)) {
      container.appendChild(this.#buildExpansionPanel(section, def));
    }

    this.shadowRoot.append(style, container);
  }

  // Deprecated options this card can rewrite in one click, top-right of the
  // editor — see docs/troubleshooting.md#deprecated-options for the user-facing
  // explanation. Aliases mirror types.theme's own internal remap exactly (kept
  // in sync manually: both are small, frozen/historical lists that are very
  // unlikely to grow further).
  static #THEME_ALIASES = { battery: 'optimal_when_high', memory: 'optimal_when_low', cpu: 'optimal_when_low' };

  static #hasDeprecatedOptions(config) {
    return Boolean(
      is.nonEmptyString(config?.max_value) ||
      config?.disable_unit !== undefined ||
      is.array(config?.additions) ||
      config?.navigate_to !== undefined ||
      config?.show_more_info !== undefined ||
      EditorBase.#THEME_ALIASES[config?.theme],
    );
  }

  // Rewrites deprecated syntax to its modern equivalent only — never the
  // unrelated defaults _customizeConfig also applies (center_zero's min_value
  // fill-in, device_class attribute defaults), so the button only ever changes
  // what it documents. `navigate_to`/`show_more_info` are deleted rather than
  // converted to tap_action: both have been fully inert since v1.2.0, so
  // reconstructing one from a value that hasn't run in years would be a guess,
  // not a migration — and could clobber a tap_action the user configured since.
  // max_value/disable_unit/additions are delegated to the active config
  // helper's own _migrateLegacyOptions, so Template editors (whose schema never
  // had those options) safely no-op there instead of needing a special case.
  static #migrateDeprecatedConfig(config, configHelper) {
    let migrated = configHelper.constructor._migrateLegacyOptions(config);
    const themeAlias = EditorBase.#THEME_ALIASES[migrated.theme];
    if (themeAlias) migrated = { ...migrated, theme: themeAlias };
    if (migrated.navigate_to !== undefined) migrated = { ...migrated, navigate_to: undefined };
    if (migrated.show_more_info !== undefined) migrated = { ...migrated, show_more_info: undefined };
    return migrated;
  }

  #buildMigrateHeader() {
    const wrapper = document.createElement('div');
    wrapper.className = 'migrate-header';

    const button = document.createElement('ha-button');
    const fieldName = '_migrate_config';
    button.id = fieldName;
    button.append(this.#hassProvider.localize(EDITOR_FIELD_NS)?.migrate_config ?? 'Migrate config');
    button.addEventListener('click', () => {
      button.dispatchEvent(
        new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: true }, bubbles: true, composed: true }),
      );
    });

    const field = {
      name: fieldName,
      virtual: true,
      showIf: (config) => EditorBase.#hasDeprecatedOptions(config),
      onVirtualChange: (_value, config) => EditorBase.#migrateDeprecatedConfig(config, this._configHelper),
    };
    this.#dom.registerField(fieldName, button, field);

    wrapper.appendChild(button);
    return wrapper;
  }

  #buildExpansionPanel(section, def) {
    if (def.flat) {
      const frag = document.createDocumentFragment();
      for (const field of Object.values(def.fields)) {
        frag.appendChild(this.#buildField(field));
      }
      return frag;
    }

    const panel = document.createElement('ha-expansion-panel');
    panel.header = this.#hassProvider.localize(def.title);
    panel.outlined = true;

    if (def.icon) {
      const icon = document.createElement('ha-icon');
      icon.setAttribute('icon', def.icon);
      icon.slot = 'leading-icon';
      panel.appendChild(icon);
    }

    const body = document.createElement('div');
    body.className = 'panel-body';

    for (const field of Object.values(def.fields)) {
      body.appendChild(this.#buildField(field));
    }

    panel.appendChild(body);

    return panel;
  }

  #getSelectorForType(type) {
    const buildSelect = (opts) => ({
      select: { options: Object.entries(opts).map(([value, label]) => ({ value, label })), mode: 'dropdown' },
    });

    const buildBoxSelect = (opts, imageFn = null) => ({
      // see
      // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
      select: {
        mode: 'box',
        options: Object.entries(opts).map(([value, label]) => ({
          value,
          label,
          ...(imageFn ? { image: imageFn(value) } : {}),
        })),
      },
    });
    const options = this.#localizedOptions;
    const tileImage = (value) => ({
      // see
      // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
      src: `/static/images/form/tile_content_layout_${value}.svg`,
      src_dark: `/static/images/form/tile_content_layout_${value}_dark.svg`,
      flip_rtl: true,
    });

    const selectors = {
      text: () => ({ text: { mode: 'box' } }),
      entity: () => ({ entity: {} }),
      entity_name: () => ({ entity_name: {} }),
      state_content: () => ({ ui_state_content: { allow_context: true } }),
      attribute: () => ({ attribute: { entity_id: this.#config.entity ?? '' } }),
      maxValueAttribute: () => ({ attribute: { entity_id: this.#config.max_value?.entity ?? '' } }),
      minValueAttribute: () => ({ attribute: { entity_id: this.#config.min_value?.entity ?? '' } }),
      number: () => ({ number: {} }),
      decimal: () => ({ number: { min: 0, max: 10, mode: 'box' } }),
      opacity: () => ({ number: { min: 0, max: 1, step: 0.05, mode: 'box' } }),
      slider: () => ({ number: { min: 0, max: 300, step: 1, mode: 'slider', unit_of_measurement: 'px' } }),
      template: () => ({ template: {} }),
      toggle: () => ({ boolean: {} }),
      action: () => ({ 'ui-action': {} }),
      icon: () => ({ icon: { icon_set: ['mdi'] } }),
      color: () => ({ 'ui-color': {} }),
      default: () => ({ text: { mode: 'box' } }),
      bar_size: () => buildSelect(options.bar_size),
      // Badge/BadgeTemplate schemas reject 'xlarge' (see
      // YamlSchemaFactory.badge) - reuses the same translated labels.
      bar_size_no_xlarge: () =>
        buildSelect({ small: options.bar_size.small, medium: options.bar_size.medium, large: options.bar_size.large }),
      bar_orientation: () => buildSelect(options.bar_orientation),
      // Badge/BadgeTemplate schemas reject 'up' (see YamlSchemaFactory.badge)
      // - reuses the same translated ltr/rtl labels, just without the option
      // that would silently fall back to 'ltr' on save.
      bar_orientation_no_up: () =>
        buildSelect({ ltr: options.bar_orientation.ltr, rtl: options.bar_orientation.rtl }),
      bar_position: () => buildSelect(options.bar_position),
      bar_color_mode: () => buildSelect(options.bar_color_mode),
      bar_scale: () => buildSelect(options.bar_scale),
      icon_animation: () => buildSelect(options.icon_animation),
      alert_highlight: () => buildSelect(options.alert_highlight),
      alert_animation: () => buildSelect(options.alert_animation),
      theme: () => buildSelect(options.theme),
      layout: () => buildBoxSelect(options.layout, tileImage),
      unit_spacing: () => buildSelect(options.unit_spacing),
      watermark_type: () => buildSelect(options.watermark_type),
      watermark_as: () => buildSelect(options.watermark_as),
      watermarkLowAttribute: () => ({ attribute: { entity_id: this.#config?.watermark?.low ?? '' } }),
      watermarkHighAttribute: () => ({ attribute: { entity_id: this.#config?.watermark?.high ?? '' } }),
    };

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  #resolveFieldMeta(field) {
    const isNested = field.name.includes('.');
    const [, childKey] = isNested ? field.name.split('.') : [null, null];
    const raw = EditorBase.#resolveValue(field, this._configHelper.config);
    const isInverted = field.invert ?? false;

    return {
      label: field.noLabel
        ? ''
        : (() => {
            const explicit = isNested
              ? this.#localizedOptions?.[field.name.split('.')[0]]?.[childKey]
              : this.#hassProvider.localize(EDITOR_FIELD_NS)[field.name];
            if (explicit !== undefined) return explicit;
            // Guard rail: keep the "<Noun> color" pattern already established
            // by badge_color/bar_color/color/alert_when.color for any future
            // "..._color" field that ships without its own translation yet,
            // instead of silently falling back to the raw key name.
            const colorMatch = !isNested && field.name.match(/^(.+)_color$/);
            if (colorMatch) {
              const noun = colorMatch[1].replace(/_/g, ' ');
              return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} color`;
            }
            return undefined;
          })(),
      value: isInverted ? !raw : raw,
      isInverted,
    };
  }

  #buildChipsField(field, tagName, optionKey) {
    const el = document.createElement(tagName);
    el.id = field.name;
    el.style.width = '100%';
    el.setLabels(this.#localizedOptions?.[optionKey]);
    el.value = is.array(this.#config?.[field.target ?? field.name]) ? this.#config[field.target ?? field.name] : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  #buildModeChipsField(field, tagName) {
    const el = document.createElement(tagName);
    el.id = field.name;
    el.style.width = '100%';
    el.label = this.#hassProvider.localize(EDITOR_FIELD_NS)?.[field.name] ?? field.name;
    el.setLabels(this.#localizedOptions?.[field.name]);
    // Mirrors the generic ha-selector path (#resolveFieldMeta), not
    // #buildChipsField: this is a single virtual string value (resolveVirtual),
    // not an array read from config[target].
    el.value = this.#resolveFieldMeta(field).value;
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // Shared by every ListEditorBase-backed field. labelKey is passed separately
  // from field.name because a dot-path field ('bar_stack.entities') labels
  // itself under its parent's translation key ('bar_stack'); rows is the config
  // array the editor round-trips.
  #buildListEditorField(field, tagName, labelKey, rows) {
    const el = document.createElement(tagName);
    el.id = field.name;
    el.style.width = '100%';
    el.label = this.#hassProvider.localize(EDITOR_FIELD_NS)?.[labelKey] ?? labelKey;
    el.hass = this.hass;
    el.value = is.array(rows) ? rows : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  // Dispatch table (mirrors #getSelectorForType's own pattern) instead of a
  // chain of sequential ifs, which had grown one field type at a time into a
  // cognitive-complexity warning — a lookup miss just falls through to the
  // generic ha-selector path below.
  #buildSpecialField(field) {
    const builders = {
      effect_chips: () => this.#buildChipsField(field, EntityProgressEffectChips.ELEMENT_NAME, 'bar_effect'),
      hide_chips: () => this.#buildChipsField(field, EntityProgressHideChips.ELEMENT_NAME, 'hide'),
      min_value_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      max_value_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      watermark_low_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      watermark_high_mode: () => this.#buildModeChipsField(field, EntityProgressValueSourceModeChips.ELEMENT_NAME),
      theme_mode: () => this.#buildModeChipsField(field, EntityProgressThemeModeChips.ELEMENT_NAME),
      bar_stack_mode: () => this.#buildModeChipsField(field, EntityProgressBarStackModeChips.ELEMENT_NAME),
      bar_stack_editor: () =>
        this.#buildListEditorField(
          field,
          EntityProgressBarStackEditor.ELEMENT_NAME,
          'bar_stack',
          this.#config?.bar_stack?.entities,
        ),
      custom_theme_editor: () =>
        this.#buildListEditorField(
          field,
          EntityProgressCustomThemeEditor.ELEMENT_NAME,
          field.name,
          this.#config?.[field.name],
        ),
    };
    return builders[field.type]?.();
  }

  #buildField(field) {
    const special = this.#buildSpecialField(field);
    if (special) return special;

    const el = document.createElement(HA_SELECTOR_TAG);

    el.id = field.name;
    el.hass = this.hass;
    el.required = field.required ?? false;
    el.style.width = field.width ?? '100%';
    el.isArray = field.array ?? false;
    el.selector = this.#getSelectorForType(field.type);

    if (field.isInGroup) el.classList.add(field.isInGroup);
    if (field.type === 'toggle') el.classList.add('field-toggle');

    const { label, value, isInverted } = this.#resolveFieldMeta(field);
    el.label = label;
    el.value = value;
    el.isInverted = isInverted;

    if (field.context) {
      el.context = Object.fromEntries(Object.entries(field.context).map(([k, v]) => [k, this.#config[v] ?? '']));
    }

    this.#dom.registerField(field.name, el, field);

    return el;
  }

  static #fallback(def, config, empty) {
    if (def.default === undefined) return empty;
    return typeof def.default === 'function' ? def.default(config) : def.default;
  }

  static #resolveValue(def, rawConfig, negotiated = null) {
    const empty = ['toggle', 'number', 'decimal'].includes(def.type) ? undefined : '';
    if (!rawConfig) return empty;

    // Virtual fields derive their value from raw config (explicit user state).
    if (def.virtual && def.resolveVirtual) return def.resolveVirtual(rawConfig);

    // template/action always use raw config — see #updateFields comment.
    const config = negotiated && !['template', 'action'].includes(def.type) ? negotiated : rawConfig;

    const isNested = def.name.includes('.');
    const [parentKey, childKey] = isNested ? def.name.split('.') : [def.name, null];
    const key = def.target ?? def.name;
    const fallback = EditorBase.#fallback(def, config, empty);

    // Array membership is always checked on raw config (explicit user
    // selections).
    if (isNested && def.array) return rawConfig[parentKey]?.includes(childKey) ?? false;
    if (isNested) {
      const val = config[parentKey]?.[childKey];
      return val !== undefined ? val : fallback;
    }
    const val = config[key];
    return val !== undefined ? val : fallback;
  }

  // ─── UPDATE (every setConfig) ─────────────────────────────────────────────

  // CF5 - issue (major) resolved - setConfig() is called on every keystroke of
  // the raw YAML editor too (HA keeps the visual editor instance mounted, just
  // hidden, while "Edit in YAML" is active) — this used to run the full
  // #applyUpdateFields() pass (iterate every registered field: showIf,
  // selectorOf, context, value) synchronously on every single character typed,
  // with no throttling, unlike #sendConfig which only covers the outgoing
  // direction. rAF-coalescing here mirrors that fix for the incoming direction:
  // whatever #config/_configHelper.config hold when the frame finally runs is
  // always the latest, since those are still assigned synchronously in
  // setConfig() — only the expensive DOM pass is deferred and collapsed to at
  // most once per frame.
  #updateFieldsScheduled = false;

  #updateFields() {
    if (this.#updateFieldsScheduled) return;
    this.#updateFieldsScheduled = true;
    requestAnimationFrame(() => {
      this.#updateFieldsScheduled = false;
      this.#applyUpdateFields();
    });
  }

  #applyUpdateFields() {
    // template/action fields read from raw config to avoid Jinja flicker during
    // typing: the validated config would fall back to default (e.g. []) the
    // moment the expression is temporarily malformed, causing the UI to flash
    // between chip and Jinja mode. All other fields (select, toggle, number…)
    // read from the negotiated config so that entity defaults (e.g. a light's
    // default %) are reflected immediately.
    const negotiated = this._configHelper.config;
    this.#dom.updateAll(this.#config, (def, raw) => EditorBase.#resolveValue(def, raw, negotiated), negotiated);
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  #handleVirtualField(def, value) {
    if (!def.onVirtualChange) return;
    const newConfig = def.onVirtualChange(value, { ...this.#config });
    if (newConfig) {
      this.#config = newConfig;
      // Update fields ourselves (next frame): HA may skip calling setConfig
      // back if the stripped config is unchanged (e.g. toggling
      // _show_all_actions produces the same visible config as before), so we
      // can't rely on that round trip alone.
      this.#updateFields();
      this.#sendConfig(newConfig);
    }
  }

  #handleNestedArrayField(parentKey, childKey, value) {
    const current = [...(this.#config[parentKey] ?? [])];
    const updated = value ? [...current, childKey] : current.filter((v) => v !== childKey);
    // Mirrors #handleVirtualField: keep #config in sync locally instead of
    // waiting for HA's setConfig round trip, which #sendConfig now defers by up
    // to one frame — without this, two different fields edited within that same
    // frame would each compute their newConfig off a stale base and could
    // clobber each other's change on send.
    this.#config = { ...this.#config, [parentKey]: updated };
    this.#sendConfig(this.#config);
  }

  #handleNestedField(parentKey, childKey, value) {
    this.#config = {
      ...this.#config,
      [parentKey]: { ...this.#config[parentKey], [childKey]: value },
    };
    this.#sendConfig(this.#config);
  }

  #handleStdField(def, key, value) {
    const targetKey = def?.target ?? key;
    if (!value && def?.onClear) {
      this.#config = def.onClear({ ...this.#config });
      this.#sendConfig(this.#config);
      return;
    }
    const newConfig = { ...this.#config, [targetKey]: value };
    this.#config = def?.onChange ? def.onChange(value, newConfig, this.#config) : newConfig;
    this.#sendConfig(this.#config);
  }

  #onChanged(e) {
    const key = e.target.id;
    if (!key || !e.detail || !('value' in e.detail)) return;

    const def = this.#dom.get(key)?._fieldDef;
    let value = e.detail.value;

    if (def?.virtual) {
      this.#handleVirtualField(def, value);
      return;
    }

    const isInverted = e.target?.isInverted ?? false;
    const isArray = e.target.isArray ?? false;
    const isNested = key.includes('.');
    const [parentKey, childKey] = isNested ? key.split('.') : [];

    if (isInverted) value = !value;

    if (isNested && isArray) this.#handleNestedArrayField(parentKey, childKey, value);
    else if (isNested) this.#handleNestedField(parentKey, childKey, value);
    else this.#handleStdField(def, key, value);
  }

  // CF5 - issue (major) resolved - a single #sendConfig() round trip is
  // expensive: dispatching config-changed makes HA call setConfig back on this
  // editor (full schema re-validation + #updateFields over every registered
  // field) AND re-render the separate preview card. A number field's native
  // spinner arrows fire a native 'input' event on every repeat while held
  // (browser auto-repeat, ~20-30/s) — each one used to trigger that full round
  // trip synchronously, and once the round-trip cost caught up with the repeat
  // rate the event queue backlogged faster than it could drain, which is what
  // Chrome's "Page Unresponsive" warning reports. rAF-coalescing collapses any
  // burst arriving within/faster than a frame into a single dispatch of the
  // latest config — each individual input event now only does O(1) work (store
  // + maybe schedule), so the browser can no longer fall behind regardless of
  // how fast native events fire. The 1-frame delay (~16ms) is not perceptible.
  #sendConfig(config) {
    // Strip _-prefixed UI state keys — they are editor-only and must never
    // reach the saved YAML.
    this.#pendingSentConfig = Object.fromEntries(Object.entries(config).filter(([k]) => !k.startsWith('_')));
    if (this.#sendConfigScheduled) return;
    this.#sendConfigScheduled = true;

    requestAnimationFrame(() => {
      this.#sendConfigScheduled = false;
      const clean = this.#pendingSentConfig;
      this.#pendingSentConfig = null;
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: clean },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

/******************************************************************************
 * 🛠️ EditorFieldsType/EditorFactory
 * ============================================================================
 */

const field =
  (type) =>
  (name, o = {}) => ({ name, type, ...o });

const EditorFieldsType = {
  entity: field('entity'),
  entityName: field('entity_name'),
  stateContent: field('state_content'),
  text: field('text'),
  number: field('number'),
  slider: field('slider'),
  decimal: field('decimal'),
  toggle: field('toggle'),
  tpl: field('template'),
  action: field('action'),
  select: (name, o = {}) => ({ name, type: name, ...o }),
  templateOrType: (name, template, type, o = {}) => field(template ? 'template' : type)(name, o),
};

const wmSide = (side, defaultVal) => {
  const disableKey = `disable_${side}`;
  const attrType = `watermark${side.charAt(0).toUpperCase() + side.slice(1)}Attribute`;
  const modeType = `watermark_${side}_mode`;
  const wm = (extra) => (c) => Boolean(c.watermark) && extra(c);
  const on = (c) => !c.watermark?.[disableKey];
  const ent = (c) => is.string(c.watermark?.[side]);
  const tpl = (c) => is.nonEmptyString(c.watermark?.[side]?.jinja);
  return {
    [`watermark.${disableKey}`]: EditorFieldsType.toggle(`watermark.${disableKey}`, {
      showIf: (c) => Boolean(c.watermark),
    }),
    // A 2-state toggle can't represent 3 mutually exclusive modes
    // (standard/entity/Jinja) — mirrors min_value_mode/max_value_mode exactly,
    // replacing the previous entity-only toggle.
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      showIf: wm(on),
      resolveVirtual: (c) => (tpl(c) ? 'jinja' : ent(c) ? 'entity' : 'standard'),
      onVirtualChange: (mode, config) => {
        const attrKey = `${side}_attribute`;
        if (mode === 'entity') {
          return {
            ...config,
            watermark: {
              ...config.watermark,
              [side]: is.string(config.watermark?.[side]) ? config.watermark[side] : '',
            },
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            watermark: {
              ...config.watermark,
              [side]: is.nonEmptyString(config.watermark?.[side]?.jinja) ? config.watermark[side] : { jinja: '{{ }}' },
              [attrKey]: undefined,
            },
          };
        }
        return { ...config, watermark: { ...config.watermark, [side]: defaultVal, [attrKey]: undefined } };
      },
    },
    [`watermark.${side}`]: EditorFieldsType.number(`watermark.${side}`, {
      showIf: wm((c) => on(c) && !ent(c) && !tpl(c)),
    }),
    [`watermark.${side}_entity`]: EditorFieldsType.entity(`watermark.${side}_entity`, {
      virtual: true,
      noLabel: true,
      showIf: wm((c) => on(c) && ent(c)),
      resolveVirtual: (c) => (is.string(c.watermark?.[side]) ? c.watermark[side] : ''),
      onVirtualChange: (value, config) => ({
        ...config,
        watermark: {
          ...config.watermark,
          [side]: value || defaultVal,
          ...(!value ? { [`${side}_attribute`]: undefined } : {}),
        },
      }),
    }),
    [`watermark.${side}_attribute`]: EditorFieldsType.select(`watermark.${side}_attribute`, {
      type: attrType,
      selectorOf: `watermark.${side}`,
      showIf: wm((c) => on(c) && ent(c) && c.watermark[side] !== ''),
    }),
    // Virtual (not a plain dot-path field): the template string lives 2 levels
    // deep (watermark.<side>.jinja), one level past what the generic
    // nested-field machinery (#resolveValue/#handleNestedField) resolves — this
    // reads/writes that path directly.
    [`watermark_${side}_jinja`]: EditorFieldsType.tpl(`watermark_${side}_jinja`, {
      noLabel: true,
      virtual: true,
      showIf: wm((c) => on(c) && tpl(c)),
      resolveVirtual: (c) => c.watermark?.[side]?.jinja ?? '',
      onVirtualChange: (value, config) => ({
        ...config,
        watermark: { ...config.watermark, [side]: { jinja: value } },
      }),
    }),
    [`watermark.${side}_as`]: EditorFieldsType.select(`watermark.${side}_as`, {
      type: 'watermark_as',
      showIf: wm(on),
      width: availableSpace(),
    }),
    [`watermark.${side}_color`]: EditorFieldsType.templateOrType(`watermark.${side}_color`, false, 'color', {
      showIf: wm(on),
      width: availableSpace(),
    }),
  };
};

const EditorFactory = {
  general: (template) => ({
    flat: true,
    fields: {
      entity: EditorFieldsType.entity('entity', { required: !template }),
      ...(!template && {
        attribute: EditorFieldsType.select('attribute', {
          type: 'attribute',
          selectorOf: 'entity',
          showIf: (c) => Boolean(c.entity),
        }),
        bar_stack_mode: {
          name: 'bar_stack_mode',
          type: 'bar_stack_mode',
          virtual: true,
          showIf: (c) => is.nonEmptyArray(c.bar_stack?.entities),
          resolveVirtual: (c) => c.bar_stack?.mode ?? 'stacked',
          onVirtualChange: (mode, config) => ({ ...config, bar_stack: { ...config.bar_stack, mode } }),
        },
        // CF5 - issue (major) resolved - a flat 'bar_stack' field name meant
        // the generic round-trip resolver (#resolveValue, run on every
        // setConfig - not just this field's own onChange) read config.bar_stack
        // as a whole (the {mode, entities} object, not the array the row
        // editor's `value` setter expects) and reset it to [] on every single
        // re-render, making any just-added row vanish from the editor
        // immediately. The dot-path name routes through the existing generic
        // nested-field read/write (#resolveValue / #handleNestedField) instead,
        // exactly like watermark.low or min_value.attribute - entities are read
        // from and written to bar_stack.entities directly, and bar_stack.mode
        // is left untouched by construction (no custom onChange/onClear needed
        // to preserve it).
        'bar_stack.entities': {
          name: 'bar_stack.entities',
          type: 'bar_stack_editor',
        },
      }),
    },
  }),

  content: (template, badge) => ({
    title: 'editor.title.content',
    icon: HA_CONTEXT.icons.textShort,
    fields: {
      ...(template
        ? {
            name: EditorFieldsType.tpl('name'),
          }
        : {
            name: EditorFieldsType.entityName('name', { context: { entity: 'entity' } }),
            name_info: EditorFieldsType.tpl('name_info'),
          }),
      ...(template
        ? {
            secondary: EditorFieldsType.tpl('secondary'),
            // Badge/badgeTemplate opt out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there.
            ...(!badge ? { multiline: EditorFieldsType.toggle('multiline') } : {}),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            unit: EditorFieldsType.text('unit', { width: availableSpace(32, 1 / 3) }),
            // disable_unit is deprecated (see
            // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
            // another hide target, folded into hide by _customizeConfig. The
            // disable_unit check here only matters for a legacy raw config on
            // first load, before that fold has round-tripped through the
            // editor's own config-changed.
            unit_spacing: EditorFieldsType.select('unit_spacing', {
              type: 'unit_spacing',
              width: availableSpace(32, 1 / 3),
              showIf: (c) => !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit'))),
            }),
            decimal: EditorFieldsType.decimal('decimal', { width: availableSpace(32, 1 / 3) }),
            // A 2-state toggle can't represent 3 mutually exclusive modes
            // (standard/entity/ Jinja) — a single-select chip group replaces
            // the previous pair of toggles, which could both show at once and
            // left the mode ambiguous. min_value's config shape is also
            // explicit rather than sniffed: a bare number is the fixed value
            // (legacy, unchanged), and { entity, attribute } / { jinja }
            // replace what used to be a single overloaded string disambiguated
            // at runtime by an is.jinja() regex test. This removes that
            // sniffing entirely and reuses the codebase's existing nested
            // dotted-field machinery (like watermark.*).
            min_value_mode: {
              name: 'min_value_mode',
              type: 'min_value_mode',
              virtual: true,
              resolveVirtual: (c) =>
                is.nonEmptyString(c.min_value?.jinja) ? 'jinja' : is.plainObject(c.min_value) ? 'entity' : 'standard',
              onVirtualChange: (mode, config) => {
                if (mode === 'entity') {
                  return {
                    ...config,
                    min_value: is.nonEmptyString(config.min_value?.entity) ? config.min_value : { entity: '' },
                  };
                }
                if (mode === 'jinja') {
                  return {
                    ...config,
                    min_value: is.nonEmptyString(config.min_value?.jinja) ? config.min_value : { jinja: '{{ }}' },
                  };
                }
                return { ...config, min_value: undefined };
              },
            },
            min_value: EditorFieldsType.number('min_value', {
              default: (c) => (c.center_zero ? -100 : 0),
              showIf: (c) => !is.plainObject(c.min_value),
            }),
            [MIN_VALUE_ENTITY_PATH]: EditorFieldsType.entity(MIN_VALUE_ENTITY_PATH, {
              noLabel: true,
              showIf: (c) => is.plainObject(c.min_value) && !is.nonEmptyString(c.min_value.jinja),
            }),
            'min_value.attribute': EditorFieldsType.select('min_value.attribute', {
              type: 'minValueAttribute',
              selectorOf: MIN_VALUE_ENTITY_PATH,
              showIf: (c) => is.plainObject(c.min_value) && is.nonEmptyString(c.min_value.entity),
            }),
            'min_value.jinja': EditorFieldsType.tpl('min_value.jinja', {
              noLabel: true,
              showIf: (c) => is.nonEmptyString(c.min_value?.jinja),
            }),
            // Explicit map shape (mirrors min_value): max_value: 10 | { entity,
            // attribute } | { jinja }. Reuses the codebase's nested
            // dotted-field machinery instead of a target-based flat field, so
            // sibling keys (attribute) merge naturally on write.
            max_value_mode: {
              name: 'max_value_mode',
              type: 'max_value_mode',
              virtual: true,
              resolveVirtual: (c) =>
                is.nonEmptyString(c.max_value?.jinja) ? 'jinja' : is.plainObject(c.max_value) ? 'entity' : 'standard',
              onVirtualChange: (mode, config) => {
                if (mode === 'entity') {
                  return {
                    ...config,
                    max_value: is.nonEmptyString(config.max_value?.entity) ? config.max_value : { entity: '' },
                  };
                }
                if (mode === 'jinja') {
                  return {
                    ...config,
                    max_value: is.nonEmptyString(config.max_value?.jinja) ? config.max_value : { jinja: '{{ }}' },
                  };
                }
                return { ...config, max_value: undefined };
              },
            },
            max_value: EditorFieldsType.number('max_value', { showIf: (c) => !is.plainObject(c.max_value) }),
            [MAX_VALUE_ENTITY_PATH]: EditorFieldsType.entity(MAX_VALUE_ENTITY_PATH, {
              noLabel: true,
              showIf: (c) => is.plainObject(c.max_value) && !is.nonEmptyString(c.max_value.jinja),
            }),
            'max_value.attribute': EditorFieldsType.select('max_value.attribute', {
              type: 'maxValueAttribute',
              selectorOf: MAX_VALUE_ENTITY_PATH,
              showIf: (c) => is.plainObject(c.max_value) && is.nonEmptyString(c.max_value.entity),
            }),
            'max_value.jinja': EditorFieldsType.tpl('max_value.jinja', {
              noLabel: true,
              showIf: (c) => is.nonEmptyString(c.max_value?.jinja),
            }),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info'),
            // Badge opts out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there.
            ...(!badge ? { multiline: EditorFieldsType.toggle('multiline') } : {}),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c) => Boolean(c.entity) && HassProviderSingleton.getEntityDomain(c.entity) === 'timer',
            }),
          }),
    },
  }),

  // A theme is either a preset (dropdown, existing behavior) or a custom set of
  // color zones — ThemeManager.configure() always lets a valid custom_theme win
  // over theme when both happen to be set, so the editor makes that an explicit
  // either/or via mode chips rather than letting the two silently race. Pulled
  // out of theme() itself so that factory's own cognitive complexity doesn't
  // grow with this trio's own ternaries. CF5 - issue (major) resolved -
  // switching modes used to hard-clear the field being left behind (theme when
  // entering custom, custom_theme when leaving it), destroying a
  // carefully-built zone list the moment someone peeked at a preset and came
  // back. The inactive side is now parked in a `_`-prefixed draft
  // (session-only, stripped before dispatch by #sendConfig, same mechanism as
  // _show_all_actions) and restored when its mode is selected again.
  themeModeFields: (template) =>
    template
      ? {}
      : {
          theme_mode: {
            name: 'theme_mode',
            type: 'theme_mode',
            virtual: true,
            // is.array (not is.nonEmptyArray): a freshly-entered custom mode
            // starts as an empty [] before the user adds a first zone, and must
            // still read as 'custom'.
            resolveVirtual: (c) => (is.array(c.custom_theme) ? 'custom' : 'preset'),
            onVirtualChange: (mode, config) => {
              const wantsCustom = mode === 'custom';
              return {
                ...config,
                theme: wantsCustom ? undefined : (config._theme_draft ?? config.theme),
                _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
                custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
                _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
              };
            },
          },
          theme: EditorFieldsType.select('theme', { showIf: (c) => !is.array(c.custom_theme) }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c) => is.array(c.custom_theme),
            onClear: (config) => {
              const rest = { ...config };
              delete rest.custom_theme;
              return rest;
            },
          },
        },

  // Badge/BadgeTemplate schemas reject some enum members that only make
  // sense with a `layout`/`bar_position` a badge doesn't have (see
  // YamlSchemaFactory.badge) - swaps in the matching restricted select type
  // instead of a range check inline in theme() below.
  badgeRestrictedType: (badge, restrictedType) => (badge ? { type: restrictedType } : {}),

  // Per-variant width overrides (Card/Badge/Template/BadgeTemplate) below
  // read oddly as inline ternaries repeated per field - one named condition
  // per field instead.
  widthUnless: (condition) => (condition ? {} : { width: availableSpace() }),

  theme: (template, badge) => ({
    title: 'editor.title.theme',
    icon: HA_CONTEXT.icons.listBox,
    fields: {
      ...EditorFactory.themeModeFields(template),
      ...(template
        ? {}
        : {
            bar_color_mode: EditorFieldsType.select('bar_color_mode', {
              showIf: (c) => (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) && !c.center_zero,
              // Selecting a non-auto color mode is incompatible with
              // interpolate: clear it.
              onChange: (value, config) => (value && value !== 'auto' ? { ...config, interpolate: undefined } : config),
            }),
            interpolate: EditorFieldsType.toggle('interpolate', {
              showIf: (c) =>
                (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) &&
                (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
            }),
          }),
      icon: EditorFieldsType.templateOrType('icon', template, 'icon', template ? {} : { width: availableSpace() }),
      color: EditorFieldsType.templateOrType('color', template, 'color', {
        showIf: (c) => is.nullish(c.theme) && !is.array(c.custom_theme),
        ...(template ? {} : { width: availableSpace() }),
      }),
      ...(badge
        ? {}
        : {
            icon_animation: EditorFieldsType.select('icon_animation'),
            force_circular_background: EditorFieldsType.toggle('force_circular_background'),
            bar_position: EditorFieldsType.select('bar_position', { width: availableSpace() }),
          }),
      // Not gated on `badge` - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list), unlike its former neighbors
      // above.
      bar_size: EditorFieldsType.select('bar_size', {
        ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
        // Full-width for Badge Template only.
        ...EditorFactory.widthUnless(badge && template),
      }),
      bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
        showIf: (c) => is.nullish(c.theme) && !is.array(c.custom_theme),
        ...(template ? {} : { width: availableSpace() }),
      }),
      ...(badge
        ? {}
        : {
            // Both require bar_position: 'overlay' (deleted from the badge
            // schema, see YamlSchemaFactory.badge), so they're badge-only,
            // unlike bar_segments right below.
            bar_single_line: EditorFieldsType.toggle('bar_single_line', {
              showIf: (c) => c.bar_position === 'overlay',
            }),
            text_shadow: EditorFieldsType.toggle('text_shadow', { showIf: (c) => c.bar_position === 'overlay' }),
          }),
      // Not gated on `badge` - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list), unlike its former neighbors
      // above.
      bar_segments: EditorFieldsType.number('bar_segments', { width: availableSpace() }),
      // Not in YamlSchemaFactory.template: percent comes straight from Jinja
      // there, so the log/linear min-max mapping this drives has nothing to
      // act on - showing it would silently do nothing on save (same trap as
      // #111's min_value/max_value on a template card).
      ...(!template
        ? {
            bar_scale: EditorFieldsType.select('bar_scale', {
              width: availableSpace(),
              showIf: (c) => !c.center_zero,
            }),
          }
        : {}),
      bar_orientation: EditorFieldsType.select('bar_orientation', {
        ...EditorFactory.badgeRestrictedType(badge, 'bar_orientation_no_up'),
        // Half-width everywhere except plain Badge (full-width there).
        ...EditorFactory.widthUnless(badge && !template),
      }),
      // bar_max_width only affects .horizontal.small/.medium/.large (see the
      // CSS rule on .progress-container) - gating on 'horizontal' (not
      // 'vertical') keeps the toggle from offering a control with no visible
      // effect. Badge/badgeTemplate opt out entirely (see their own
      // .delete(['bar_max_width'])): without a 'layout' key they never get
      // the 'horizontal' class, so the option would be inert there.
      ...(!badge
        ? {
            bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
              virtual: true,
              showIf: (c) => (c.layout ?? 'horizontal') === 'horizontal',
              resolveVirtual: (c) => Boolean(c.bar_max_width),
              onVirtualChange: (value, config) => ({
                ...config,
                bar_max_width: value ? '300px' : undefined,
              }),
            }),
            bar_max_width: EditorFieldsType.slider('bar_max_width', {
              virtual: true,
              showIf: (c) => (c.layout ?? 'horizontal') === 'horizontal' && Boolean(c.bar_max_width),
              resolveVirtual: (c) => parseInt(c.bar_max_width) || 0,
              onVirtualChange: (value, config) => ({
                ...config,
                bar_max_width: value ? `${value}px` : undefined,
              }),
            }),
          }
        : {}),
      reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', {
        showIf: (c) => (!c.bar_position || c.bar_position === 'default') && c.layout === 'horizontal',
      }),
      center_zero: EditorFieldsType.toggle('center_zero', {
        virtual: true,
        showIf: (c) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode),
        resolveVirtual: (c) => Boolean(c.center_zero),
        onVirtualChange: (value, config) => ({
          ...config,
          center_zero: value ? (is.plainObject(config.center_zero) ? config.center_zero : true) : false,
        }),
      }),
      center_zero_value: EditorFieldsType.number('center_zero_value', {
        target: 'center_zero',
        showIf: (c) => Boolean(c.center_zero) && (c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode)),
        virtual: true,
        resolveVirtual: (c) => (is.plainObject(c.center_zero) ? (c.center_zero.value ?? 0) : 0),
        onVirtualChange: (value, config) => {
          const growthPercent = is.plainObject(config.center_zero) ? Boolean(config.center_zero.growth_percent) : false;
          return {
            ...config,
            center_zero: value || growthPercent ? { value: Number(value) || 0, growth_percent: growthPercent } : true,
          };
        },
      }),
      center_zero_growth_percent: EditorFieldsType.toggle('center_zero_growth_percent', {
        target: 'center_zero',
        showIf: (c) => Boolean(c.center_zero) && (c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode)),
        virtual: true,
        resolveVirtual: (c) => (is.plainObject(c.center_zero) ? Boolean(c.center_zero.growth_percent) : false),
        onVirtualChange: (value, config) => {
          const currentValue = is.plainObject(config.center_zero) ? (config.center_zero.value ?? 0) : 0;
          return {
            ...config,
            center_zero: currentValue || value ? { value: currentValue, growth_percent: value } : true,
          };
        },
      }),
      bar_effect_jinja: EditorFieldsType.toggle('bar_effect_jinja', {
        virtual: true,
        resolveVirtual: (c) => is.nonEmptyString(c.bar_effect),
        onVirtualChange: (value, config) => ({
          ...config,
          bar_effect: value ? '{{ }}' : [],
        }),
      }),
      bar_effect_chips: EditorFieldsType.select('bar_effect_chips', {
        type: 'effect_chips',
        target: 'bar_effect',
        showIf: (c) => !is.nonEmptyString(c.bar_effect),
      }),
      bar_effect: EditorFieldsType.tpl('bar_effect', { noLabel: true, showIf: (c) => is.nonEmptyString(c.bar_effect) }),
      // ── Watermark ────────────────────────────────────────────────────────
      // Not gated on `template` - watermarkSchema is the exact same shape for
      // Card and Template (see YamlSchemaFactory.card/.template), and wmSide's
      // toggle/entity/jinja machinery only ever reads config.watermark.*, so
      // nothing here is Card-specific.
      ...(() => {
        const wm = (extra) => (c) => Boolean(c.watermark) && (extra ? extra(c) : true);
        return {
          watermark_toggle: EditorFieldsType.toggle('watermark_toggle', {
            virtual: true,
            resolveVirtual: (c) => Boolean(c.watermark),
            onVirtualChange: (value, config) => ({
              ...config,
              watermark: value ? {} : undefined,
            }),
          }),
          'watermark.type': EditorFieldsType.select('watermark.type', {
            type: 'watermark_type',
            showIf: wm(),
            width: availableSpace(),
          }),
          'watermark.opacity': EditorFieldsType.decimal('watermark.opacity', {
            type: 'opacity',
            showIf: wm(),
            width: availableSpace(),
          }),
          // ── Groupes LOW / HIGH (générés par wmSide) ────────────────────
          ...wmSide('low', 20),
          ...wmSide('high', 80),
          'watermark.line_size': EditorFieldsType.text('watermark.line_size', {
            showIf: wm((c) => c.watermark?.type === 'line'),
          }),
        };
      })(),
      // ── Badge fields ─────────────────────────────────────────────────────
      ...(badge
        ? {}
        : {
            badge_icon: EditorFieldsType.tpl('badge_icon'),
            badge_color: EditorFieldsType.tpl('badge_color'),
          }),
      // ── Hide ─────────────────────────────────────────────────────────────
      hide_jinja: EditorFieldsType.toggle('hide_jinja', {
        virtual: true,
        resolveVirtual: (c) => is.nonEmptyString(c.hide),
        onVirtualChange: (value, config) => ({
          ...config,
          hide: value ? '{{ }}' : [],
        }),
      }),
      hide_chips: EditorFieldsType.select('hide_chips', {
        type: 'hide_chips',
        target: 'hide',
        showIf: (c) => !is.nonEmptyString(c.hide),
      }),
      hide: EditorFieldsType.tpl('hide', { noLabel: true, showIf: (c) => is.nonEmptyString(c.hide) }),
      // ── Alert (alert_when) — not in the template schema ─────────────────
      ...(!template
        ? {
            alert_toggle: EditorFieldsType.toggle('alert_toggle', {
              virtual: true,
              resolveVirtual: (c) => Boolean(c.alert_when),
              onVirtualChange: (value, config) => ({
                ...config,
                alert_when: value ? {} : undefined,
              }),
            }),
            'alert_when.above': EditorFieldsType.number('alert_when.above', {
              showIf: (c) => Boolean(c.alert_when),
              width: availableSpace(),
            }),
            'alert_when.below': EditorFieldsType.number('alert_when.below', {
              showIf: (c) => Boolean(c.alert_when),
              width: availableSpace(),
            }),
            'alert_when.color': EditorFieldsType.select('alert_when.color', {
              type: 'color',
              showIf: (c) => Boolean(c.alert_when),
            }),
            'alert_when.highlight': EditorFieldsType.select('alert_when.highlight', {
              type: 'alert_highlight',
              showIf: (c) => Boolean(c.alert_when),
              width: availableSpace(),
            }),
            // Leaving 'ping' selectable even with highlight: background is
            // intentional - ViewCore.alertAnimation degrades that combination
            // to 'static' rather than doing nothing, same as other
            // invalid-combination fallbacks in this codebase (e.g. bar_scale
            // log outside a valid range).
            'alert_when.animation': EditorFieldsType.select('alert_when.animation', {
              type: 'alert_animation',
              showIf: (c) => Boolean(c.alert_when),
              width: availableSpace(),
            }),
          }
        : {}),
      // ── Card-only layout options ──────────────────────────────────────────
      // frameless/marginless: still valid for badges in the schema (raw YAML
      // still works) and documented as such - just not worth a control in the
      // badge editor, a deliberate choice, not a dead-CSS case. `height` is
      // genuinely deleted from the badge schema (see YamlSchemaFactory.badge).
      ...(!badge
        ? {
            frameless: EditorFieldsType.toggle('frameless', { width: availableSpace() }),
            marginless: EditorFieldsType.toggle('marginless', { width: availableSpace() }),
            height: EditorFieldsType.text('height', { width: availableSpace() }),
          }
        : {}),
      // Not gated on `badge` - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list), unlike its former neighbors
      // above.
      min_width: EditorFieldsType.text('min_width', EditorFactory.widthUnless(badge)),
      // ── Layout (always last) ──────────────────────────────────────────────
      ...(badge
        ? {}
        : {
            layout: EditorFieldsType.select('layout'),
          }),
    },
  }),

  interactions: (badge) => {
    // isActive: show a field only if its negotiated action differs from the
    // 'none' default. orAll: also show when the "show all" toggle
    // (_show_all_actions) is on. _show_all_actions is ephemeral UI state:
    // stored in raw config with _ prefix, stripped before config-changed
    // dispatch, never saved to YAML. tap_action and icon_tap_action are always
    // visible (no showIf): - tap_action default is 'more-info' — always
    // relevant. - icon_tap_action default depends on the entity domain: 'none'
    // for most entities, 'toggle' for lights, switches, etc. (patched at
    // validation time via toggleDomain). Always showing it lets the hint reveal
    // the effective default.
    const isActive = (key) => (_, n) => n?.[key]?.action !== 'none';
    const orAll = (pred) => (c, n) => Boolean(c._show_all_actions) || pred(c, n);
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        show_all_actions: {
          name: 'show_all_actions',
          type: 'toggle',
          virtual: true,
          resolveVirtual: (c) => Boolean(c._show_all_actions),
          onVirtualChange: (value, config) => ({ ...config, _show_all_actions: value }),
        },
        tap_action: EditorFieldsType.action('tap_action'),
        hold_action: EditorFieldsType.action('hold_action', { showIf: orAll(isActive('hold_action')) }),
        double_tap_action: EditorFieldsType.action('double_tap_action', {
          showIf: orAll(isActive('double_tap_action')),
        }),
        ...(!badge
          ? {
              icon_tap_action: EditorFieldsType.action('icon_tap_action'),
              icon_hold_action: EditorFieldsType.action('icon_hold_action', {
                showIf: orAll(isActive('icon_hold_action')),
              }),
              icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
                showIf: orAll(isActive('icon_double_tap_action')),
              }),
            }
          : {}),
      },
    };
  },

  build: (template, badge) => ({
    general: EditorFactory.general(template),
    content: EditorFactory.content(template, badge),
    theme: EditorFactory.theme(template, badge),
    interactions: EditorFactory.interactions(badge),
  }),
};

/******************************************************************************
 * 🛠️ EntityProgressCardEditor
 * ============================================================================
 */
class EntityProgressCardEditor extends EditorBase {
  _configHelper = new CardConfigHelper();
  static _fields = EditorFactory.build(false, false);
}

/******************************************************************************
 * 🛠️ EntityProgressBadgeEditor
 * ============================================================================
 */
class EntityProgressBadgeEditor extends EditorBase {
  _configHelper = new BadgeConfigHelper();
  static _fields = EditorFactory.build(false, true);
}

/******************************************************************************
 * 🛠️ EntityProgressTemplateEditor
 * ============================================================================
 */

class EntityProgressTemplateEditor extends EditorBase {
  _configHelper = new TemplateConfigHelper();
  static _fields = EditorFactory.build(true, false);
}

/******************************************************************************
 * 🛠️ EntityProgressBadgeTemplateEditor
 * ============================================================================
 */

class EntityProgressBadgeTemplateEditor extends EditorBase {
  _configHelper = new BadgeTemplateConfigHelper();
  static _fields = EditorFactory.build(true, true);
}

/******************************************************************************
 * 🔧 Register components
 */

RegistrationHelper.registerCard(META.types.card, EntityProgressCard, EntityProgressCardEditor);
RegistrationHelper.registerBadge(META.types.badge, EntityProgressBadge, EntityProgressBadgeEditor);
RegistrationHelper.registerCard(META.types.template, EntityProgressTemplateCard, EntityProgressTemplateEditor);
RegistrationHelper.registerBadge(
  META.types.badgeTemplate,
  EntityProgressTemplateBadge,
  EntityProgressBadgeTemplateEditor,
);
RegistrationHelper.registerCardFeature(META.types.feature, EntityProgressFeatures);

/******************************************************************************
 * 🔧 Diagnostic helper — `window.EPB_DIAG.dump()` in the browser console
 * prints an anonymized environment report to paste into bug reports.
 */

if (!window.EPB_DIAG) {
  window.EPB_DIAG = Object.freeze({
    version: VERSION,
    dump() {
      const hass = HassProviderSingleton.getInstance().hass;
      // Multiple registrations of the same EPB type = duplicate resource (HACS
      // + manual), the classic root cause of "impossible" bugs. Surface it
      // front and center.
      // Badges/badgeTemplate register under window.customBadges and the tile
      // feature under window.customCardFeatures (see RegistrationHelper) -
      // window.customCards alone only ever surfaces card/template.
      const allRegistered = [
        ...(window.customCards ?? []),
        ...(window.customBadges ?? []),
        ...(window.customCardFeatures ?? []),
      ];
      const epbEntries = allRegistered.filter((card) => card.type?.startsWith('entity-progress'));
      const duplicates = epbEntries.length !== new Set(epbEntries.map((card) => card.type)).size;
      const report = [
        '=== Entity Progress Card — diagnostic ===',
        `card version   : ${VERSION}${CARD_CONTEXT.dev ? ' (dev mode)' : ''}`,
        `HA core        : ${hass?.config?.version ?? 'unknown (no hass yet)'}`,
        `language       : ${hass?.locale?.language ?? navigator.language}`,
        `browser        : ${navigator.userAgent}`,
        `dark mode      : ${window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? 'n/a'}`,
        `reduced motion : ${window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? 'n/a'}`,
        `EPB registered : ${epbEntries.map((card) => `${card.type}@${card.version ?? '?'}`).join(', ') || 'none'}`,
        `duplicate load : ${duplicates ? '⚠️ YES — remove one of the two resources!' : 'no'}`,
        `HA elements    : ha-card=${Boolean(customElements.get('ha-card'))} ha-selector=${Boolean(customElements.get(HA_SELECTOR_TAG))} action-handler=${Boolean(customElements.get(HA_ACTION_HANDLER_TAG))}`,
        `constructed CSS: ${CONSTRUCTED_SHEETS.size > 0 && [...CONSTRUCTED_SHEETS.values()].some(Boolean) ? 'shared (modern)' : 'per-card fallback'}`,
        '=========================================',
      ].join('\n');
      console.info(report);
      return report;
    },
  });
}

/******************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
console.log(CARD.console.link);
console.groupEnd();
