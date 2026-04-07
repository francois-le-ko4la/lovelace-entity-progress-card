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
 * @version 1.5.3-dev
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

// prettier-ignore-start
const VERSION = '1.5.3-dev';

const META = {
  documentation: 'https://github.com/francois-le-ko4la/lovelace-entity-progress-card/',
  cards: {
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
  }
};

const CARD_CONTEXT = {
  dev: true,
  // editor: true, interactionHandler: true
  debug: { card: true, editor: true, interactionHandler: true, ressourceManager: true, hass: false },
};

// from: https://github.com/home-assistant/frontend/blob/master/src/resources/theme/color/color.globals.ts
const HA_CONTEXT = {
  icons: {
    prefix: 'mdi:',
    help: 'mdi:help',
    helpCircle: 'mdi:help-circle',
    helpCircleOutline: 'mdi:help-circle-outline',
    chevronUpBox: 'mdi:chevron-up-box',
    chevronDownBox: 'mdi:chevron-down-box',
    equalBox: 'mdi:equal-box',
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
      'primary-text', 'secondary-text', 'text-primary', 'text-light-primary', 'disabled-text',
      // interface
      'dark-primary', 'darker-primary', 'light-primary', 'divider', 'outline', 'outline-hover',
      'shadow',    
      // material color
      'primary', 'accent', 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue',
      'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber',
      'orange', 'deep-orange', 'brown', 'light-grey', 'grey', 'dark-grey', 'blue-grey',
      'black', 'white',
      // HA
      'success', 'warning', 'error', 'info', 'disabled',
      // State
      'state-icon', 'state-active', 'state-inactive', 'state-unavailable',
      'state-alarm_control_panel-armed_away', 'state-alarm_control_panel-armed_custom_bypass',
      'state-alarm_control_panel-armed_home', 'state-alarm_control_panel-armed_night',
      'state-alarm_control_panel-armed_vacation', 'state-alarm_control_panel-arming',
      'state-alarm_control_panel-disarming', 'state-alarm_control_panel-pending',
      'state-alarm_control_panel-triggered', 'state-alert-off', 'state-alert-on',
      'state-binary_sensor-active', 'state-binary_sensor-battery-on',
      'state-binary_sensor-carbon_monoxide-on', 'state-binary_sensor-gas-on',
      'state-binary_sensor-heat-on', 'state-binary_sensor-lock-on', 'state-binary_sensor-moisture-on',
      'state-binary_sensor-problem-on', 'state-binary_sensor-safety-on', 'state-binary_sensor-smoke-on',
      'state-binary_sensor-sound-on', 'state-binary_sensor-tamper-on',
      'state-climate-auto', 'state-climate-cool', 'state-climate-dry', 'state-climate-fan_only',
      'state-climate-heat', 'state-climate-heat-cool', 'state-cover-active',
      'state-device_tracker-active', 'state-device_tracker-home', 'state-fan-active',
      'state-humidifier-on', 'state-lawn_mower-error', 'state-lawn_mower-mowing',
      'state-light-active', 'state-lock-jammed', 'state-lock-locked', 'state-lock-locking',
      'state-lock-unlocked', 'state-lock-unlocking', 'state-lock-open', 'state-lock-opening',
      'state-media_player-active', 'state-person-active', 'state-person-home', 'state-plant-active',
      'state-siren-active', 'state-sun-above_horizon', 'state-sun-below_horizon', 'state-switch-active',
      'state-update-active', 'state-vacuum-active', 'state-valve-active', 'state-sensor-battery-high',
      'state-sensor-battery-low', 'state-sensor-battery-medium', 'state-water_heater-eco',
      'state-water_heater-electric', 'state-water_heater-gas', 'state-water_heater-heat_pump',
      'state-water_heater-high_demand', 'state-water_heater-performance',
      'state-weather-clear_night', 'state-weather-cloudy', 'state-weather-exceptional', 'state-weather-fog',
      'state-weather-hail', 'state-weather-lightning_rainy', 'state-weather-lightning',
      'state-weather-partlycloudy', 'state-weather-pouring', 'state-weather-rainy',
      'state-weather-snowy_rainy', 'state-weather-snowy', 'state-weather-sunny',
      'state-weather-windy_variant', 'state-weather-windy'
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
    state: { unavailable: 'unavailable', unknown: 'unknown', notFound: 'notFound', idle: 'idle', active: 'active', paused: 'paused' },
    type: { timer: 'timer', light: 'light', cover: 'cover', fan: 'fan', climate: 'climate', counter: 'counter', number: 'number' },
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
  },
  styles: {
    rowSize: '--row-size',
  },
}

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
        name: 'Entity Progress Card',
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
    card: { element: 'ha-card' },
    sections: {
      container: { element: 'div', class: 'container' },
      ripple: { element: 'ha-ripple' },
      belowContainer: { element: 'div', class: 'below-container' },
      topContainer: { element: 'div', class: 'top-container' },
      bottomContainer: { element: 'div', class: 'bottom-container' },
      icon: { element: 'div', class: 'icon-section' },
      content: { element: 'div', class: 'content-section' },
    },
    elements: {
      icon: { element: 'div', class: 'icon' },
      shape: { element: 'shape', class: 'shape' },
      ellipsisWrapper: { element: 'div', class: 'ellipsis-wrapper' },
      nameContent: { element: 'div', class: 'name' },
      nameValue: { element: 'span', class: 'name-value' },
      nameMain: { element: 'span', class: 'name-main' },
      nameExtra: { element: 'span', class: 'name-extra' },
      trendIndicator: {
        container: { element: 'div', class: 'trend-indicator' },
        icon: { element: 'ha-icon', class: 'trend-icon' },
      },
      secondaryInfo: { element: 'div', class: 'secondary-info' },
      secondaryInfoWrapper: { element: 'div', class: 'secondary-info-wrapper' },
      secondaryInfoValue: { element: 'span', class: 'secondary-info-value' },
      secondaryInfoMain: { element: 'span', class: 'secondary-info-main' },
      secondaryInfoExtra: { element: 'span', class: 'secondary-info-extra' },
      progressBar: {
        container: { element: 'div', class: 'bar-container' },
        bar: { element: 'div', class: 'progress-bar' },
        inner: { element: 'div', class: 'inner' },
        zeroMark: { element: 'div', class: 'zero' },
        lowWatermark: { element: 'div', class: 'low' },
        highWatermark: { element: 'div', class: 'high' },
        watermark: { class: 'progress-bar-wm' },
      },
      badge: {
        container: { element: 'div', class: 'badge' },
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
        unavailable: { icon: HA_CONTEXT.icons.exclamationThick, color: 'white', backgroundColor: HA_CONTEXT.colors.orange, attribute: 'icon' },
        notFound: { icon: HA_CONTEXT.icons.exclamationThick, color: 'white', backgroundColor: HA_CONTEXT.colors.red, attribute: 'icon' },
        timer: {
          active: { icon: HA_CONTEXT.icons.play, color: 'white', backgroundColor: HA_CONTEXT.colors.success, attribute: 'icon' },
          paused: { icon: HA_CONTEXT.icons.pause, color: 'white', backgroundColor: HA_CONTEXT.colors.stateIcon, attribute: 'icon' },
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
        backgroundColor: { var: '--badge-bgcolor', default: 'white' },
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
        orientation: { rtl: 'rtl-orientation', ltr: 'ltr-orientation', up: 'up-orientation' },
        effect: {
          radius: { label: 'radius', class: 'progress-bar-effect-radius' },
          glass: { label: 'glass', class: 'progress-bar-effect-glass' },
          gradient: { label: 'gradient', class: 'progress-bar-effect-gradient' },
          gradientReverse: { label: 'gradient_reverse', class: 'progress-bar-effect-gradient-reverse' },
          shimmer: { label: 'shimmer', class: 'progress-bar-effect-shimmer' },
          shimmerReverse: { label: 'shimmer_reverse', class: 'progress-bar-effect-shimmer-reverse' },
        },
        centerZero: { class: 'center-zero' },
      },
      watermark: {
        low: { value: { var: '--low-watermark-value', default: 20 }, color: { var: '--low-watermark-color', default: 'red' } },
        high: { value: { var: '--high-watermark-value', default: 80 }, color: { var: '--high-watermark-color', default: 'red' } },
        lineSize: { var: '--watermark-line-size' },
        opacity: { var: '--watermark-opacity-value' },
      },
      secondaryInfoError: { class: 'secondary-info-error' },
      show: 'show',
      hide: 'hide',
      clickable: { card: 'clickable-card', icon: 'clickable-icon' },
      hiddenComponent: {
        icon: { label: 'icon', class: 'hide-icon' },
        shape: { label: 'shape', class: 'hide-shape' },
        name: { label: 'name', class: 'hide-name' },
        secondary_info: { label: 'secondary_info', class: 'hide-secondary-info' },
        value: { label: 'value' },
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
        minHeight: '56px',
      },
      vertical: {
        label: 'vertical',
        grid: { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 },
        mdi: HA_CONTEXT.icons.focusVertical,
        minHeight: '120px',
      },
    },
  },
  theme: {
    default: '**CUSTOM**',
    battery: { label: 'battery', icon: 'battery' },
    customTheme: {
      expectedKeys: ['min', 'max'],
      colorKeys: ['color', 'icon_color', 'bar_color'],
    },
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
    low_color: 'red',
    high: 80,
    high_color: 'red',
    opacity: 0.8,
    type: 'blended',
    line_size: '1px',
    disable_low: false,
    disable_high: false,
  },
};

CARD.console = {
  message: `%c✨${META.cards.card.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
  css: 'color:orange; background-color:black; font-weight: bold;',
  link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card',
};

const THEME = {
  optimal_when_low: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.success },
      { min: 20, max: 50, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 50, max: 80, icon: null, color: HA_CONTEXT.colors.accent },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.red },
    ],
  },
  optimal_when_high: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: HA_CONTEXT.colors.red },
      { min: 20, max: 50, icon: null, color: HA_CONTEXT.colors.accent },
      { min: 50, max: 80, icon: null, color: HA_CONTEXT.colors.yellow },
      { min: 80, max: 100, icon: null, color: HA_CONTEXT.colors.success },
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
      { min: 20, max: 25, icon: HA_CONTEXT.icons.thermometer, color: HA_CONTEXT.colors.success },
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
      { min: 23, max: 30, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.accent },
      { min: 30, max: 40, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.yellow },
      { min: 40, max: 50, icon: HA_CONTEXT.icons.waterPercent, color: HA_CONTEXT.colors.success },
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
      { min: 0, max: 300, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.success },
      { min: 300, max: 500, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 500, max: 3000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.accent },
      { min: 3000, max: 25000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.red },
      { min: 25000, max: 50000, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.deepPurple },
    ],
  },
  pm25: {
    linear: false,
    percent: false,
    style: [
      { min: 0, max: 12, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.success },
      { min: 12, max: 35, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.yellow },
      { min: 35, max: 55, icon: HA_CONTEXT.icons.airFilter, color: HA_CONTEXT.colors.accent },
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
        discontinuousRange: 'النطاق المحدد غير متصل.',
        entityNotFound: 'لم يتم العثور على الكيان في Home Assistant.',
        invalidActionObject: 'كائن الإجراء غير صالح أو غير منظم بشكل صحيح.',
        invalidCustomThemeArray: 'يجب أن يكون السمة المخصصة عبارة عن مصفوفة.',
        invalidCustomThemeEntry: 'إدخال أو أكثر في السمة المخصصة غير صالحة.',
        invalidDecimal: 'يجب أن تكون القيمة رقمًا عشريًا صحيحًا.',
        invalidEntityId: 'معرّف الكيان غير صالح أو به خلل.',
        invalidEnumValue: 'القيمة المُقدمة ليست من الخيارات المسموح بها.',
        invalidIconType: 'نوع الأيقونة المحدد غير صالح أو غير معروف.',
        invalidMaxValue: 'القيمة القصوى غير صالحة أو أعلى من الحد المسموح به.',
        invalidMinValue: 'القيمة الدنيا غير صالحة أو أقل من الحدود المسموح بها.',
        invalidStateContent: 'محتوى الحالة غير صالح أو معيب.',
        invalidStateContentEntry: 'إدخال أو أكثر في محتوى الحالة غير صالحة.',
        invalidTheme: 'السمة المحددة غير معروفة. سيتم استخدام السمة الافتراضية.',
        invalidTypeArray: 'كان من المتوقع قيمة من نوع مصفوفة.',
        invalidTypeBoolean: 'كان من المتوقع قيمة من نوع منطقي.',
        invalidTypeNumber: 'كان من المتوقع قيمة من نوع رقم.',
        invalidTypeObject: 'كان من المتوقع قيمة من نوع كائن.',
        invalidTypeString: 'كان من المتوقع قيمة من نوع سلسلة.',
        invalidUnionType: 'القيمة لا تطابق أي نوع مسموح.',
        minGreaterThanMax: 'لا يمكن أن تكون القيمة الدنيا أكبر من القيمة القصوى.',
        missingActionKey: 'مفتاح مطلوب مفقود في كائن الإجراء.',
        missingColorProperty: 'خاصية اللون المطلوبة مفقودة.',
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
        bar_effect: 'تأثير الشريط',
        bar_orientation: 'اتجاه الشريط',
        bar_position: 'موضع الشريط',
        bar_single_line: 'معلومات في سطر واحد (تراكب)',
        bar_size: 'حجم الشريط',
        center_zero: 'صفر في الوسط',
        color: 'اللون الأساسي',
        decimal: 'عشري',
        disable_unit: 'عرض الوحدة',
        double_tap_action: 'الإجراء عند النقر المزدوج',
        entity: 'الكيان',
        force_circular_background: 'فرض خلفية دائرية',
        hold_action: 'الإجراء عند الضغط المطول',
        icon: 'أيقونة',
        icon_double_tap_action: 'الإجراء عند النقر المزدوج على الأيقونة',
        icon_hold_action: 'الإجراء عند الضغط المطول على الأيقونة',
        icon_tap_action: 'الإجراء عند النقر على الأيقونة',
        layout: 'تخطيط البطاقة',
        max_value: 'القيمة القصوى',
        max_value_attribute: 'السمة (max_value)',
        max_value_entity: 'استخدام الكيان للقيمة القصوى',
        min_value: 'القيمة الدنيا',
        name: 'الاسم',
        percent: 'النسبة المئوية',
        secondary: 'معلومات ثانوية',
        tap_action: 'الإجراء عند النقر القصير',
        text_shadow: 'إضافة ظل للنص (overlay)',
        theme: 'السمة',
        toggle_icon: 'عرض الأيقونة',
        toggle_name: 'عرض الاسم',
        toggle_progress_bar: 'عرض شريط التقدم',
        toggle_secondary_info: 'عرض المعلومات الثانوية',
        toggle_value: 'عرض القيمة',
        unit: 'الوحدة',
        use_max_entity: 'استخدام الكيان للقيمة القصوى'
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
          overlay: 'الشريط فوق المحتوى (تراكب)'
        },
        layout: {
          horizontal: 'أفقي (افتراضي)',
          vertical: 'رأسي'
        }
      }
    }
  },
  bn: {
    card: {
      msg: {
        appliedDefaultValue: 'ডিফল্ট মান স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়েছে।',
        attributeNotFound: 'HA তে বৈশিষ্ট্য পাওয়া যায়নি।',
        discontinuousRange: 'নির্ধারিত পরিসর অবিচ্ছিন্ন নয়।',
        entityNotFound: 'HA তে সত্তা পাওয়া যায়নি।',
        invalidActionObject: 'অ্যাকশন অবজেক্ট অবৈধ বা ভুলভাবে গঠিত।',
        invalidCustomThemeArray: 'কাস্টম থিম একটি অ্যারে হতে হবে।',
        invalidCustomThemeEntry: 'কাস্টম থিমে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidDecimal: 'মানটি একটি বৈধ দশমিক সংখ্যা হতে হবে।',
        invalidEntityId: 'সত্তার আইডি অবৈধ বা ভুলভাবে গঠিত।',
        invalidEnumValue: 'প্রদত্ত মানটি অনুমোদিত বিকল্পগুলির মধ্যে একটি নয়।',
        invalidIconType: 'নির্দিষ্ট আইকন প্রকার অবৈধ বা অচেনা।',
        invalidMaxValue: 'সর্বোচ্চ মান অবৈধ বা অনুমোদিত সীমার উপরে।',
        invalidMinValue: 'ন্যূনতম মান অবৈধ বা অনুমোদিত সীমার নিচে।',
        invalidStateContent: 'অবস্থার বিষয়বস্তু অবৈধ বা ভুলভাবে গঠিত।',
        invalidStateContentEntry: 'অবস্থার বিষয়বস্তুতে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidTheme: 'নির্দিষ্ট থিম অজানা। ডিফল্ট থিম ব্যবহার করা হবে।',
        invalidTypeArray: 'অ্যারে ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeBoolean: 'বুলিয়ান ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeNumber: 'সংখ্যা ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeObject: 'অবজেক্ট ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeString: 'স্ট্রিং ধরনের একটি মান প্রত্যাশিত।',
        invalidUnionType: 'মানটি অনুমোদিত ধরনগুলির কোনোটির সাথে মেলে না।',
        minGreaterThanMax: 'ন্যূনতম মান সর্বোচ্চ মানের চেয়ে বড় হতে পারে না।',
        missingActionKey: 'অ্যাকশন অবজেক্টে একটি প্রয়োজনীয় কী অনুপস্থিত।',
        missingColorProperty: 'একটি প্রয়োজনীয় রঙের বৈশিষ্ট্য অনুপস্থিত।',
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
        bar_effect: 'বারের প্রভাব',
        bar_orientation: 'বারের অভিমুখ',
        bar_position: 'বারের অবস্থান',
        bar_single_line: 'এক লাইনে তথ্য (ওভারলে)',
        bar_size: 'বারের আকার',
        center_zero: 'মাঝে শূন্য',
        color: 'প্রাথমিক রঙ',
        decimal: 'দশমিক',
        disable_unit: 'একক দেখান',
        double_tap_action: 'ডাবল ট্যাপ আচরণ',
        entity: 'সত্তা',
        force_circular_background: 'বৃত্তাকার পটভূমি জোর করুন',
        hold_action: 'হোল্ড আচরণ',
        icon: 'আইকন',
        icon_double_tap_action: 'আইকন ডাবল ট্যাপ আচরণ',
        icon_hold_action: 'আইকন হোল্ড আচরণ',
        icon_tap_action: 'আইকন ট্যাপ আচরণ',
        layout: 'কার্ড লেআউট',
        max_value: 'সর্বোচ্চ মান',
        max_value_attribute: 'বৈশিষ্ট্য (max_value)',
        max_value_entity: 'সত্তার সর্বোচ্চ মান',
        min_value: 'ন্যূনতম মান',
        name: 'নাম',
        percent: 'শতাংশ',
        secondary: 'দ্বিতীয় তথ্য',
        tap_action: 'ট্যাপ আচরণ',
        text_shadow: 'টেক্সটে ছায়া যোগ করুন (overlay)',
        theme: 'থিম',
        toggle_icon: 'আইকন',
        toggle_name: 'নাম',
        toggle_progress_bar: 'বার',
        toggle_secondary_info: 'তথ্য',
        toggle_value: 'মান',
        unit: 'একক',
        use_max_entity: 'সর্বোচ্চ মানের জন্য সত্তা ব্যবহার করুন'
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
          overlay: 'বিষয়বস্তুর ওপর বার (ওভারলে)'
        },
        layout: {
          horizontal: 'অনুভূমিক (ডিফল্ট)',
          vertical: 'উল্লম্ব'
        }
      }
    }
  },
  ca: {
    card: {
      msg: {
        appliedDefaultValue: 'S\'ha aplicat automàticament un valor per defecte.',
        attributeNotFound: 'No s\'ha trobat l\'atribut a Home Assistant.',
        discontinuousRange: 'El rang definit és discontinu.',
        entityNotFound: 'No s\'ha trobat l\'entitat a Home Assistant.',
        invalidActionObject: 'L\'objecte d\'acció és invàlid o té una estructura incorrecta.',
        invalidCustomThemeArray: 'El tema personalitzat ha de ser un array.',
        invalidCustomThemeEntry: 'Una o més entrades del tema personalitzat són invàlides.',
        invalidDecimal: 'El valor ha de ser un decimal vàlid.',
        invalidEntityId: 'L\'ID de l\'entitat no és vàlid o té un format incorrecte.',
        invalidEnumValue: 'El valor proporcionat no és una opció vàlida.',
        invalidIconType: 'El tipus d\'icona especificat és invàlid o desconegut.',
        invalidMaxValue: 'El valor màxim és invàlid o supera el límit permès.',
        invalidMinValue: 'El valor mínim és invàlid o està per sota del límit permès.',
        invalidStateContent: 'El contingut de l\'estat és invàlid o té un format incorrecte.',
        invalidStateContentEntry: 'Una o més entrades del contingut de l\'estat són invàlides.',
        invalidTheme: 'El tema especificat és desconegut. S\'utilitzarà el tema per defecte.',
        invalidTypeArray: 'S\'esperava un valor de tipus array.',
        invalidTypeBoolean: 'S\'esperava un valor de tipus boolean.',
        invalidTypeNumber: 'S\'esperava un valor de tipus número.',
        invalidTypeObject: 'S\'esperava un valor de tipus objecte.',
        invalidTypeString: 'S\'esperava un valor de tipus cadena.',
        invalidUnionType: 'El valor no coincideix amb cap dels tipus permesos.',
        minGreaterThanMax: 'El valor mínim no pot ser més gran que el valor màxim.',
        missingActionKey: 'Falta una clau obligatòria a l\'objecte d\'acció.',
        missingColorProperty: 'Falta una propietat de color obligatòria.',
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
        bar_effect: 'Efecte de la barra',
        bar_orientation: 'Orientació de la barra',
        bar_position: 'Posició de la barra',
        bar_single_line: 'Informació en una sola línia (overlay)',
        bar_size: 'Mida de la barra',
        center_zero: 'Zero al centre',
        color: 'Color principal',
        decimal: 'Decimal',
        disable_unit: 'Mostra la unitat',
        double_tap_action: 'Acció al doble tocar',
        entity: 'Entitat',
        force_circular_background: 'Forçar fons circular',
        hold_action: 'Acció en mantenir premut',
        icon: 'Icona',
        icon_double_tap_action: 'Acció al doble tocar la icona',
        icon_hold_action: 'Acció en mantenir premuda la icona',
        icon_tap_action: 'Acció al tocar la icona',
        layout: 'Disposició de la targeta',
        max_value: 'Valor màxim',
        max_value_attribute: 'Atribut (valor màxim)',
        max_value_entity: 'Usar entitat com a valor màxim',
        min_value: 'Valor mínim',
        name: 'Nom',
        percent: 'Percentatge',
        secondary: 'Informació secundària',
        tap_action: 'Acció al tocar breument',
        text_shadow: 'Afegir ombra al text (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostra icona',
        toggle_name: 'Mostra nom',
        toggle_progress_bar: 'Mostra barra de progrés',
        toggle_secondary_info: 'Mostra informació secundària',
        toggle_value: 'Mostra valor',
        unit: 'Unitat',
        use_max_entity: 'Usar una entitat com a valor màxim'
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
          overlay: 'Barra superposada al contingut (overlay)'
        },
        layout: {
          horizontal: 'Horitzontal (predeterminada)',
          vertical: 'Vertical'
        }
      }
    }
  },
  cs: {
    card: {
      msg: {
        appliedDefaultValue: 'Výchozí hodnota byla automaticky aplikována.',
        attributeNotFound: 'Atribut nebyl nalezen v HA.',
        discontinuousRange: 'Definovaný rozsah je nespojitý.',
        entityNotFound: 'Entita nebyla nalezena v HA.',
        invalidActionObject: 'Objekt akce je neplatný nebo špatně strukturovaný.',
        invalidCustomThemeArray: 'Vlastní motiv musí být pole.',
        invalidCustomThemeEntry: 'Jedna nebo více položek ve vlastním motivu je neplatných.',
        invalidDecimal: 'Hodnota musí být platné desítkové číslo.',
        invalidEntityId: 'ID entity je neplatné nebo špatně formátované.',
        invalidEnumValue: 'Poskytnutá hodnota není jednou z povolených možností.',
        invalidIconType: 'Zadaný typ ikony je neplatný nebo nerozpoznaný.',
        invalidMaxValue: 'Maximální hodnota je neplatná nebo nad povolenými limity.',
        invalidMinValue: 'Minimální hodnota je neplatná nebo pod povolenými limity.',
        invalidStateContent: 'Obsah stavu je neplatný nebo špatně formátovaný.',
        invalidStateContentEntry: 'Jedna nebo více položek v obsahu stavu je neplatných.',
        invalidTheme: 'Zadaný motiv je neznámý. Bude použit výchozí motiv.',
        invalidTypeArray: 'Očekávána hodnota typu pole.',
        invalidTypeBoolean: 'Očekávána hodnota typu boolean.',
        invalidTypeNumber: 'Očekávána hodnota typu číslo.',
        invalidTypeObject: 'Očekávána hodnota typu objekt.',
        invalidTypeString: 'Očekávána hodnota typu řetězec.',
        invalidUnionType: 'Hodnota neodpovídá žádnému z povolených typů.',
        minGreaterThanMax: 'Minimální hodnota nemůže být větší než maximální hodnota.',
        missingActionKey: 'V objektu akce chybí požadovaný klíč.',
        missingColorProperty: 'Chybí povinná vlastnost barvy.',
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
        bar_effect: 'Efekt na liště',
        bar_orientation: 'Orientace lišty',
        bar_position: 'Umístění lišty',
        bar_single_line: 'Info v jednom řádku (overlay)',
        bar_size: 'Velikost lišty',
        center_zero: 'Nula uprostřed',
        color: 'Hlavní barva',
        decimal: 'desetinný',
        disable_unit: 'Zobrazit jednotku',
        double_tap_action: 'Chování při dvojitém klepnutí',
        entity: 'Entita',
        force_circular_background: 'Vynutit kruhové pozadí',
        hold_action: 'Chování při podržení',
        icon: 'Ikona',
        icon_double_tap_action: 'Chování při dvojitém klepnutí na ikonu',
        icon_hold_action: 'Chování při podržení ikony',
        icon_tap_action: 'Chování při klepnutí na ikonu',
        layout: 'Rozložení karty',
        max_value: 'Maximální hodnota',
        max_value_attribute: 'Atribut (max_value)',
        max_value_entity: 'Použít entitu pro maximální hodnotu',
        min_value: 'Minimální hodnota',
        name: 'Název',
        percent: 'Procento',
        secondary: 'Sekundární informace',
        tap_action: 'Chování při klepnutí',
        text_shadow: 'Přidat stín textu (overlay)',
        theme: 'Motiv',
        toggle_icon: 'Zobrazit ikonu',
        toggle_name: 'Zobrazit název',
        toggle_progress_bar: 'Zobrazit lištu postupu',
        toggle_secondary_info: 'Zobrazit sekundární informace',
        toggle_value: 'Zobrazit hodnotu',
        unit: 'Jednotka',
        use_max_entity: 'Použít entitu pro max hodnotu'
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
          overlay: 'Lišta přes obsah (overlay)'
        },
        layout: {
          horizontal: 'Horizontální (výchozí)',
          vertical: 'Vertikální'
        }
      }
    }
  },
  da: {
    card: {
      msg: {
        appliedDefaultValue: 'Standardværdi er blevet anvendt automatisk.',
        attributeNotFound: 'Egenskab blev ikke fundet i Home Assistant.',
        discontinuousRange: 'Det definerede interval er usammenhængende.',
        entityNotFound: 'Enheden blev ikke fundet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldigt eller forkert struktureret.',
        invalidCustomThemeArray: 'Det brugerdefinerede tema skal være en array.',
        invalidCustomThemeEntry: 'En eller flere indgange i det brugerdefinerede tema er ugyldige.',
        invalidDecimal: 'Værdien skal være et gyldigt decimaltal.',
        invalidEntityId: 'Enheds-ID er ugyldigt eller forkert formateret.',
        invalidEnumValue: 'Den angivne værdi er ikke en tilladt mulighed.',
        invalidIconType: 'Den angivne ikontype er ugyldig eller ukendt.',
        invalidMaxValue: 'Maksimumværdi er ugyldig eller overstiger den tilladte grænse.',
        invalidMinValue: 'Mindsteværdi er ugyldig eller under den tilladte grænse.',
        invalidStateContent: 'Tilstandsindholdet er ugyldigt eller fejlbehæftet.',
        invalidStateContentEntry: 'En eller flere poster i tilstandsindholdet er ugyldige.',
        invalidTheme: 'Det angivne tema er ukendt. Standardtema anvendes.',
        invalidTypeArray: 'Forventede en array-værdi.',
        invalidTypeBoolean: 'Forventede en boolesk værdi.',
        invalidTypeNumber: 'Forventede en numerisk værdi.',
        invalidTypeObject: 'Forventede en objektværdi.',
        invalidTypeString: 'Forventede en strengværdi.',
        invalidUnionType: 'Værdien matcher ingen af de tilladte typer.',
        minGreaterThanMax: 'Mindsteværdi kan ikke være større end maksimumværdi.',
        missingActionKey: 'En påkrævet nøgle mangler i handlingsobjektet.',
        missingColorProperty: 'En påkrævet farveegenskab mangler.',
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
        bar_effect: 'Effekt på bar',
        bar_orientation: 'Bar-retning',
        bar_position: 'Bar-placering',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        center_zero: 'Center nul',
        color: 'Primær farve',
        decimal: 'decimal',
        disable_unit: 'Vis enhed',
        double_tap_action: 'Handling ved dobbelt tryk',
        entity: 'Enhed',
        force_circular_background: 'Tving cirkulær baggrund',
        hold_action: 'Handling ved langt tryk',
        icon: 'Ikon',
        icon_double_tap_action: 'Handling ved dobbelt tryk på ikonet',
        icon_hold_action: 'Handling ved langt tryk på ikonet',
        icon_tap_action: 'Handling ved tryk på ikonet',
        layout: 'Kort layout',
        max_value: 'Maksimal værdi',
        max_value_attribute: 'Attribut (max_value)',
        max_value_entity: 'Brug enhed for max-værdi',
        min_value: 'Minimumsværdi',
        name: 'Navn',
        percent: 'Procent',
        secondary: 'Sekundær info',
        tap_action: 'Handling ved kort tryk',
        text_shadow: 'Tilføj tekstskygge (overlay)',
        theme: 'Tema',
        toggle_icon: 'Vis ikon',
        toggle_name: 'Vis navn',
        toggle_progress_bar: 'Vis fremdriftsbar',
        toggle_secondary_info: 'Vis sekundær info',
        toggle_value: 'Vis værdi',
        unit: 'Enhed',
        use_max_entity: 'Brug enhed for max-værdi'
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
          overlay: 'Bar over indhold (overlay)'
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal'
        }
      }
    }
  },
  de: {
    card: {
      msg: {
        appliedDefaultValue: 'Ein Standardwert wurde automatisch angewendet.',
        attributeNotFound: 'Attribut in Home Assistant nicht gefunden.',
        discontinuousRange: 'Der definierte Bereich ist nicht kontinuierlich.',
        entityNotFound: 'Entität in Home Assistant nicht gefunden.',
        invalidActionObject: 'Das Aktionsobjekt ist ungültig oder falsch strukturiert.',
        invalidCustomThemeArray: 'Das benutzerdefinierte Theme muss ein Array sein.',
        invalidCustomThemeEntry: 'Ein oder mehrere Einträge im benutzerdefinierten Theme sind ungültig.',
        invalidDecimal: 'Der Wert muss eine gültige Dezimalzahl sein.',
        invalidEntityId: 'Die Entity-ID ist ungültig oder fehlerhaft.',
        invalidEnumValue: 'Der angegebene Wert gehört nicht zu den erlaubten Optionen.',
        invalidIconType: 'Der angegebene Symboltyp ist ungültig oder nicht erkannt.',
        invalidMaxValue: 'Der Maximalwert ist ungültig oder überschreitet den erlaubten Bereich.',
        invalidMinValue: 'Der Minimalwert ist ungültig oder liegt unterhalb des erlaubten Bereichs.',
        invalidStateContent: 'Der Statusinhalt ist ungültig oder fehlerhaft.',
        invalidStateContentEntry: 'Ein oder mehrere Einträge im Statusinhalt sind ungültig.',
        invalidTheme: 'Das angegebene Theme ist unbekannt. Das Standard-Theme wird verwendet.',
        invalidTypeArray: 'Ein Wert vom Typ Array wurde erwartet.',
        invalidTypeBoolean: 'Ein Wert vom Typ Boolesch wurde erwartet.',
        invalidTypeNumber: 'Ein Wert vom Typ Zahl wurde erwartet.',
        invalidTypeObject: 'Ein Wert vom Typ Objekt wurde erwartet.',
        invalidTypeString: 'Ein Wert vom Typ Zeichenkette wurde erwartet.',
        invalidUnionType: 'Der Wert entspricht keinem der erlaubten Typen.',
        minGreaterThanMax: 'Der Minimalwert darf nicht größer als der Maximalwert sein.',
        missingActionKey: 'Ein erforderlicher Schlüssel fehlt im Aktionsobjekt.',
        missingColorProperty: 'Eine erforderliche Farbeigenschaft fehlt.',
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
        bar_color: 'Farbe der Leiste',
        bar_effect: 'Effekt auf die Leiste',
        bar_orientation: 'Ausrichtung der Leiste',
        bar_position: 'Position der Leiste',
        bar_single_line: 'Informationen in einer Zeile (Overlay)',
        bar_size: 'Größe der Bar',
        center_zero: 'Null in der Mitte',
        color: 'Primärfarbe',
        decimal: 'dezimal',
        disable_unit: 'Einheit anzeigen',
        double_tap_action: 'Aktion bei doppelt Tippen',
        entity: 'Entität',
        force_circular_background: 'Kreisförmigen Hintergrund erzwingen',
        hold_action: 'Aktion bei langem Tippen',
        icon: 'Symbol',
        icon_double_tap_action: 'Aktion bei doppelt Tippen auf das Symbol',
        icon_hold_action: 'Aktion bei langem Tippen auf das Symbol',
        icon_tap_action: 'Aktion beim Tippen auf das Symbol',
        layout: 'Kartenlayout',
        max_value: 'Höchstwert',
        max_value_attribute: 'Attribut (max_value)',
        max_value_entity: 'Entität für Maximalwert verwenden',
        min_value: 'Mindestwert',
        name: 'Name',
        percent: 'Prozent',
        secondary: 'Sekundäre Informationen',
        tap_action: 'Aktion bei kurzem Tippen',
        text_shadow: 'Textschatten hinzufügen (Overlay)',
        theme: 'Thema',
        toggle_icon: 'Icon anzeigen',
        toggle_name: 'Name anzeigen',
        toggle_progress_bar: 'Fortschrittsbalken anzeigen',
        toggle_secondary_info: 'Sekundärinformationen anzeigen',
        toggle_value: 'Wert anzeigen',
        unit: 'Einheit',
        use_max_entity: 'Entität für Maximalwert verwenden'
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
          overlay: 'Leiste über dem Inhalt (Overlay)'
        },
        layout: {
          horizontal: 'Horizontal (Standard)',
          vertical: 'Vertikal'
        }
      }
    }
  },
  el: {
    card: {
      msg: {
        appliedDefaultValue: 'Εφαρμόστηκε αυτόματα προεπιλεγμένη τιμή.',
        attributeNotFound: 'Το χαρακτηριστικό δεν βρέθηκε στο Home Assistant.',
        discontinuousRange: 'Το καθορισμένο εύρος δεν είναι συνεχές.',
        entityNotFound: 'Η οντότητα δεν βρέθηκε στο Home Assistant.',
        invalidActionObject: 'Το αντικείμενο ενέργειας δεν είναι έγκυρο ή είναι κακώς δομημένο.',
        invalidCustomThemeArray: 'Το προσαρμοσμένο θέμα πρέπει να είναι πίνακας.',
        invalidCustomThemeEntry: 'Μία ή περισσότερες καταχωρήσεις στο προσαρμοσμένο θέμα δεν είναι έγκυρες.',
        invalidDecimal: 'Η τιμή πρέπει να είναι έγκυρος δεκαδικός αριθμός.',
        invalidEntityId: 'Το αναγνωριστικό οντότητας δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidEnumValue: 'Η παρεχόμενη τιμή δεν είναι αποδεκτή επιλογή.',
        invalidIconType: 'Ο καθορισμένος τύπος εικονιδίου δεν είναι έγκυρος ή αναγνωρίσιμος.',
        invalidMaxValue: 'Η μέγιστη τιμή δεν είναι έγκυρη ή ξεπερνά τα όρια.',
        invalidMinValue: 'Η ελάχιστη τιμή δεν είναι έγκυρη ή είναι εκτός επιτρεπόμενων ορίων.',
        invalidStateContent: 'Το περιεχόμενο κατάστασης δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidStateContentEntry: 'Μία ή περισσότερες καταχωρήσεις στο περιεχόμενο κατάστασης είναι άκυρες.',
        invalidTheme: 'Το καθορισμένο θέμα είναι άγνωστο. Θα χρησιμοποιηθεί το προεπιλεγμένο θέμα.',
        invalidTypeArray: 'Αναμενόταν τιμή τύπου πίνακα.',
        invalidTypeBoolean: 'Αναμενόταν τιμή τύπου boolean.',
        invalidTypeNumber: 'Αναμενόταν τιμή τύπου αριθμού.',
        invalidTypeObject: 'Αναμενόταν τιμή τύπου αντικειμένου.',
        invalidTypeString: 'Αναμενόταν τιμή τύπου συμβολοσειράς.',
        invalidUnionType: 'Η τιμή δεν ταιριάζει σε κανέναν από τους επιτρεπόμενους τύπους.',
        minGreaterThanMax: 'Η ελάχιστη τιμή δεν μπορεί να είναι μεγαλύτερη από τη μέγιστη.',
        missingActionKey: 'Λείπει απαιτούμενο κλειδί στο αντικείμενο ενέργειας.',
        missingColorProperty: 'Λείπει απαιτούμενη ιδιότητα χρώματος.',
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
        bar_effect: 'Εφέ γραμμής',
        bar_orientation: 'Κατεύθυνση γραμμής',
        bar_position: 'Θέση γραμμής',
        bar_single_line: 'Πληροφορίες σε μία γραμμή (overlay)',
        bar_size: 'Μέγεθος γραμμής',
        center_zero: 'Μηδέν στο κέντρο',
        color: 'Κύριο χρώμα',
        decimal: 'δεκαδικά',
        disable_unit: 'Εμφάνιση μονάδας',
        double_tap_action: 'Ενέργεια κατά το διπλό πάτημα',
        entity: 'Οντότητα',
        force_circular_background: 'Εξαναγκασμός κυκλικού φόντου',
        hold_action: 'Ενέργεια κατά το παρατεταμένο πάτημα',
        icon: 'Εικονίδιο',
        icon_double_tap_action: 'Ενέργεια στο διπλό πάτημα του εικονιδίου',
        icon_hold_action: 'Ενέργεια στο παρατεταμένο πάτημα του εικονιδίου',
        icon_tap_action: 'Ενέργεια στο πάτημα του εικονιδίου',
        layout: 'Διάταξη κάρτας',
        max_value: 'Μέγιστη τιμή',
        max_value_attribute: 'Χαρακτηριστικό (max_value)',
        max_value_entity: 'Χρήση οντότητας ως μέγιστης τιμής',
        min_value: 'Ελάχιστη τιμή',
        name: 'Όνομα',
        percent: 'Ποσοστό',
        secondary: 'Πρόσθετες πληροφορίες',
        tap_action: 'Ενέργεια κατά το σύντομο πάτημα',
        text_shadow: 'Προσθήκη σκιάς στο κείμενο (overlay)',
        theme: 'Θέμα',
        toggle_icon: 'Εμφάνιση εικονιδίου',
        toggle_name: 'Εμφάνιση ονόματος',
        toggle_progress_bar: 'Εμφάνιση γραμμής προόδου',
        toggle_secondary_info: 'Εμφάνιση πρόσθετων πληροφοριών',
        toggle_value: 'Εμφάνιση τιμής',
        unit: 'Μονάδα',
        use_max_entity: 'Χρήση οντότητας ως μέγιστης τιμής'
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
          overlay: 'Γραμμή πάνω από περιεχόμενο (overlay)'
        },
        layout: {
          horizontal: 'Οριζόντια (προεπιλογή)',
          vertical: 'Κατακόρυφη'
        }
      }
    }
  },
  en: {
    card: {
      msg: {
        appliedDefaultValue: 'A default value has been applied automatically.',
        attributeNotFound: 'Attribute not found in HA.',
        discontinuousRange: 'The defined range is discontinuous.',
        entityNotFound: 'Entity not found in HA.',
        invalidActionObject: 'The action object is invalid or improperly structured.',
        invalidCustomThemeArray: 'The custom theme must be an array.',
        invalidCustomThemeEntry: 'One or more entries in the custom theme are invalid.',
        invalidDecimal: 'The value must be a valid decimal number.',
        invalidEntityId: 'The entity ID is invalid or malformed.',
        invalidEnumValue: 'The provided value is not one of the allowed options.',
        invalidIconType: 'The specified icon type is invalid or unrecognized.',
        invalidMaxValue: 'The maximum value is invalid or above allowed limits.',
        invalidMinValue: 'The minimum value is invalid or below allowed limits.',
        invalidStateContent: 'The state content is invalid or malformed.',
        invalidStateContentEntry: 'One or more entries in the state content are invalid.',
        invalidTheme: 'The specified theme is unknown. Default theme will be used.',
        invalidTypeArray: 'Expected a value of type array.',
        invalidTypeBoolean: 'Expected a value of type boolean.',
        invalidTypeNumber: 'Expected a value of type number.',
        invalidTypeObject: 'Expected a value of type object.',
        invalidTypeString: 'Expected a value of type string.',
        invalidUnionType: 'The value does not match any of the allowed types.',
        minGreaterThanMax: 'Minimum value cannot be greater than maximum value.',
        missingActionKey: 'A required key is missing in the action object.',
        missingColorProperty: 'A required color property is missing.',
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
        bar_color: 'Color for the bar',
        bar_effect: 'Bar effect',
        bar_orientation: 'Bar orientation',
        bar_position: 'Bar position',
        bar_single_line: 'Single line info (overlay)',
        bar_size: 'Bar size',
        center_zero: 'Zero at center',
        color: 'Primary color',
        decimal: 'decimal',
        disable_unit: 'Show unit',
        double_tap_action: 'Double tap behavior',
        entity: 'Entity',
        force_circular_background: 'Force icon circular background',
        hold_action: 'Hold behavior',
        icon: 'Icon',
        icon_double_tap_action: 'Icon double tap behavior',
        icon_hold_action: 'Icon hold behavior',
        icon_tap_action: 'Icon tap behavior',
        layout: 'Card layout',
        max_value: 'Maximum value',
        max_value_attribute: 'Attribute (max_value)',
        max_value_entity: 'Use entity as maximum value',
        min_value: 'Minimum value',
        name: 'Name',
        percent: 'Percentage',
        secondary: 'Secondary info',
        tap_action: 'Tap behavior',
        text_shadow: 'Add text shadow (overlay)',
        theme: 'Theme',
        toggle_icon: 'Show icon',
        toggle_name: 'Show name',
        toggle_progress_bar: 'Show progress bar',
        toggle_secondary_info: 'Show secondary info',
        toggle_value: 'Show value',
        unit: 'Unit',
        use_max_entity: 'Use entity for max value'
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
          overlay: 'Bar overlay on content'
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertical'
        }
      }
    }
  },
  'es-419': {
    card: {
      msg: {
        appliedDefaultValue: 'Se aplicó automáticamente el valor predeterminado.',
        attributeNotFound: 'No se encontró el atributo en Home Assistant.',
        discontinuousRange: 'El rango definido no es continuo.',
        entityNotFound: 'No se encontró la entidad en Home Assistant.',
        invalidActionObject: 'Objeto de acción inválido o mal estructurado.',
        invalidCustomThemeArray: 'El tema personalizado debe ser un arreglo.',
        invalidCustomThemeEntry: 'Uno o más elementos del tema personalizado son inválidos.',
        invalidDecimal: 'El valor debe ser un decimal válido.',
        invalidEntityId: 'ID de entidad inválido o mal formado.',
        invalidEnumValue: 'El valor proporcionado no está dentro de las opciones permitidas.',
        invalidIconType: 'El tipo de ícono especificado es inválido o desconocido.',
        invalidMaxValue: 'El valor máximo es inválido o excede el límite permitido.',
        invalidMinValue: 'El valor mínimo es inválido o está por debajo del límite permitido.',
        invalidStateContent: 'Contenido del estado inválido o mal formado.',
        invalidStateContentEntry: 'Uno o más elementos del contenido del estado son inválidos.',
        invalidTheme: 'El tema especificado es desconocido; se usará el tema predeterminado.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo numérico.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ningún tipo permitido.',
        minGreaterThanMax: 'El valor mínimo no puede ser mayor que el máximo.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingColorProperty: 'Falta una propiedad de color obligatoria.',
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
        bar_effect: 'Efecto de la barra de progreso',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en línea (superpuesta)',
        bar_size: 'Tamaño de la barra',
        center_zero: 'Cero centrado',
        color: 'Color principal',
        decimal: 'Decimal',
        disable_unit: 'Mostrar unidad',
        double_tap_action: 'Acción al doble toque',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hold_action: 'Acción al mantener presionado',
        icon: 'Ícono',
        icon_double_tap_action: 'Acción de doble toque en ícono',
        icon_hold_action: 'Acción al mantener presionado ícono',
        icon_tap_action: 'Acción al tocar ícono',
        layout: 'Diseño de tarjeta',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (valor máximo)',
        max_value_entity: 'Usar valor máximo de la entidad',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        secondary: 'Información secundaria',
        tap_action: 'Acción al tocar',
        text_shadow: 'Agregar sombra al texto (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostrar ícono',
        toggle_name: 'Mostrar nombre',
        toggle_progress_bar: 'Mostrar barra de progreso',
        toggle_secondary_info: 'Mostrar información secundaria',
        toggle_value: 'Mostrar valor',
        unit: 'Unidad',
        use_max_entity: 'Usar entidad como valor máximo'
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
          overlay: 'Superpuesta sobre el contenido'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        }
      }
    }
  },
  es: {
    card: {
      msg: {
        appliedDefaultValue: 'Se ha aplicado un valor predeterminado automáticamente.',
        attributeNotFound: 'Atributo no encontrado en Home Assistant.',
        discontinuousRange: 'El rango definido es discontinuo.',
        entityNotFound: 'Entidad no encontrada en Home Assistant.',
        invalidActionObject: 'El objeto de acción es inválido o está mal estructurado.',
        invalidCustomThemeArray: 'El tema personalizado debe ser un arreglo.',
        invalidCustomThemeEntry: 'Una o más entradas en el tema personalizado son inválidas.',
        invalidDecimal: 'El valor debe ser un número decimal válido.',
        invalidEntityId: 'El ID de la entidad no es válido o está mal formado.',
        invalidEnumValue: 'El valor proporcionado no es una opción válida.',
        invalidIconType: 'El tipo de icono especificado es inválido o no reconocido.',
        invalidMaxValue: 'El valor máximo es inválido o excede el límite permitido.',
        invalidMinValue: 'El valor mínimo es inválido o está por debajo del límite permitido.',
        invalidStateContent: 'El contenido del estado es inválido o está mal formado.',
        invalidStateContentEntry: 'Una o más entradas en el contenido del estado son inválidas.',
        invalidTheme: 'El tema especificado es desconocido. Se usará el tema por defecto.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo número.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ninguno de los tipos permitidos.',
        minGreaterThanMax: 'El valor mínimo no puede ser mayor que el valor máximo.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingColorProperty: 'Falta una propiedad de color obligatoria.',
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
        bar_color: 'Color principal',
        bar_effect: 'Efecto de la barra',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en una sola línea (overlay)',
        bar_size: 'Tamaño de la barra',
        center_zero: 'Cero en el centro',
        color: 'Color principal',
        decimal: 'decimal',
        disable_unit: 'Mostrar unidad',
        double_tap_action: 'Acción al pulsar dos veces',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hold_action: 'Acción al mantener pulsado',
        icon: 'Icono',
        icon_double_tap_action: 'Acción al pulsar dos veces el icono',
        icon_hold_action: 'Acción al mantener pulsado el icono',
        icon_tap_action: 'Acción al pulsar el icono',
        layout: 'Disposición de la tarjeta',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        max_value_entity: 'Usar entidad como valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        secondary: 'Información secundaria',
        tap_action: 'Acción al pulsar brevemente',
        text_shadow: 'Añadir sombra al texto (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostrar icono',
        toggle_name: 'Mostrar nombre',
        toggle_progress_bar: 'Mostrar barra de progreso',
        toggle_secondary_info: 'Mostrar información secundaria',
        toggle_value: 'Mostrar valor',
        unit: 'Unidad',
        use_max_entity: 'Usar una entidad para el valor máximo'
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
          overlay: 'Barra superpuesta al contenido (overlay)'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        }
      }
    }
  },
  et: {
    card: {
      msg: {
        appliedDefaultValue: 'Vaikimisi väärtus rakendati automaatselt.',
        attributeNotFound: 'Atribuut ei leitud Home Assistantis.',
        discontinuousRange: 'Määratud vahemik ei ole katkematu.',
        entityNotFound: 'Objekti ei leitud Home Assistantis.',
        invalidActionObject: 'Tegevuse objekt on vigane või valesti struktureeritud.',
        invalidCustomThemeArray: 'Kohandatud teema peab olema massiiv.',
        invalidCustomThemeEntry: 'Üks või mitu kohandatud teema kirjet on vigased.',
        invalidDecimal: 'Väärtus peab olema positiivne täisarv.',
        invalidEntityId: 'Objekti ID on vigane või valesti vormistatud.',
        invalidEnumValue: 'Antud väärtus ei kuulu lubatud valikute hulka.',
        invalidIconType: 'Määratud ikooni tüüp on vigane või tundmatu.',
        invalidMaxValue: 'Maksimaalne väärtus on vigane või ületab lubatud piiri.',
        invalidMinValue: 'Minimaalne väärtus on vigane või alla lubatud piiri.',
        invalidStateContent: 'Seisundi sisu on vigane või valesti vormistatud.',
        invalidStateContentEntry: 'Üks või mitu seisundi sisu kirjet on vigased.',
        invalidTheme: 'Määratud teema on tundmatu. Kasutatakse vaikimisi teemat.',
        invalidTypeArray: 'Oodati massiivi tüüpi väärtust.',
        invalidTypeBoolean: 'Oodati loogilist (boolean) tüüpi väärtust.',
        invalidTypeNumber: 'Oodati numbri tüüpi väärtust.',
        invalidTypeObject: 'Oodati objekti tüüpi väärtust.',
        invalidTypeString: 'Oodati stringi tüüpi väärtust.',
        invalidUnionType: 'Väärtus ei vasta ühelegi lubatud tüübile.',
        minGreaterThanMax: 'Minimaalne väärtus ei saa olla suurem kui maksimaalne.',
        missingActionKey: 'Tegevuse objektist puudub kohustuslik võti.',
        missingColorProperty: 'Puudub kohustuslik värvi atribuut.',
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
        bar_effect: 'Riba efekt',
        bar_orientation: 'Riba orientatsioon',
        bar_position: 'Riba positsioon',
        bar_single_line: 'Info ühel real (overlay)',
        bar_size: 'Riba suurus',
        center_zero: 'Null keskel',
        color: 'Ikooni värv',
        decimal: 'Kümnendkoht',
        disable_unit: 'Näita ühikut',
        double_tap_action: 'Topeltpuudutuse tegevus',
        entity: 'Objekt',
        force_circular_background: 'Sunnitud ümmargune taust',
        hold_action: 'Pikema vajutuse tegevus',
        icon: 'Ikoon',
        icon_double_tap_action: 'Ikooni topeltpuudutuse tegevus',
        icon_hold_action: 'Ikooni pika vajutuse tegevus',
        icon_tap_action: 'Ikooni puudutuse tegevus',
        layout: 'Kaardi paigutus',
        max_value: 'Maksimaalne väärtus',
        max_value_attribute: 'Atribuut (max_value)',
        max_value_entity: 'Maksimaalne väärtus',
        min_value: 'Minimaalne väärtus',
        name: 'Nimi',
        percent: 'Protsent',
        secondary: 'Täiendav info',
        tap_action: 'Puudutuse tegevus',
        text_shadow: 'Lisa teksti vari (overlay)',
        theme: 'Teema',
        toggle_icon: 'Näita ikooni',
        toggle_name: 'Näita nime',
        toggle_progress_bar: 'Näita edenemisriba',
        toggle_secondary_info: 'Näita täiendavat infot',
        toggle_value: 'Näita väärtust',
        unit: 'Ühik',
        use_max_entity: 'Kasuta objekti maksimaalse väärtuse jaoks'
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
          overlay: 'Riba sisu kohal (overlay)'
        },
        layout: {
          horizontal: 'Horisontaalne (vaikimisi)',
          vertical: 'Vertikaalne'
        }
      }
    }
  },
  fi: {
    card: {
      msg: {
        appliedDefaultValue: 'Oletusarvo on asetettu automaattisesti.',
        attributeNotFound: 'Attribuuttia ei löytynyt Home Assistantista.',
        discontinuousRange: 'Määritetty alue on katkonainen.',
        entityNotFound: 'Entiteettiä ei löytynyt Home Assistantista.',
        invalidActionObject: 'Toiminto-objekti on virheellinen tai huonosti rakennettu.',
        invalidCustomThemeArray: 'Mukautetun teeman on oltava taulukko.',
        invalidCustomThemeEntry: 'Yksi tai useampi mukautetun teeman merkintä on virheellinen.',
        invalidDecimal: 'Arvon on oltava kelvollinen desimaaliluku.',
        invalidEntityId: 'Entiteetin tunniste on virheellinen tai väärin muotoiltu.',
        invalidEnumValue: 'Annettu arvo ei ole sallituista vaihtoehdoista.',
        invalidIconType: 'Annettu kuvaketyyppi on virheellinen tai tuntematon.',
        invalidMaxValue: 'Enimmäisarvo on virheellinen tai liian suuri.',
        invalidMinValue: 'Vähimmäisarvo on virheellinen tai liian pieni.',
        invalidStateContent: 'Tilasisältö on virheellinen tai väärässä muodossa.',
        invalidStateContentEntry: 'Yksi tai useampi tilasisällön merkintä on virheellinen.',
        invalidTheme: 'Määritetty teema on tuntematon. Käytetään oletusteemaa.',
        invalidTypeArray: 'Odotettiin taulukkoarvoa.',
        invalidTypeBoolean: 'Odotettiin totuusarvoa (boolean).',
        invalidTypeNumber: 'Odotettiin numeerista arvoa.',
        invalidTypeObject: 'Odotettiin objektityyppistä arvoa.',
        invalidTypeString: 'Odotettiin merkkijonotyyppistä arvoa.',
        invalidUnionType: 'Arvo ei vastaa mitään sallituista tyypeistä.',
        minGreaterThanMax: 'Vähimmäisarvo ei voi olla suurempi kuin enimmäisarvo.',
        missingActionKey: 'Toiminto-objektista puuttuu vaadittu avain.',
        missingColorProperty: 'Pakollinen väriominaisuus puuttuu.',
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
        bar_effect: 'Palkin efekti',
        bar_orientation: 'Palkin suunta',
        bar_position: 'Palkin sijainti',
        bar_single_line: 'Tiedot yhdellä rivillä (overlay)',
        bar_size: 'Palkin koko',
        center_zero: 'Nolla keskellä',
        color: 'Pääväri',
        decimal: 'desimaali',
        disable_unit: 'Näytä yksikkö',
        double_tap_action: 'Toiminto kahdella napautuksella',
        entity: 'Entiteetti',
        force_circular_background: 'Pakota pyöreä tausta',
        hold_action: 'Toiminto pitkällä painalluksella',
        icon: 'Ikoni',
        icon_double_tap_action: 'Toiminto kahdella napautuksella kuvaketta',
        icon_hold_action: 'Toiminto pitkällä painalluksella kuvaketta',
        icon_tap_action: 'Toiminto kuvaketta napautettaessa',
        layout: 'Kortin asettelu',
        max_value: 'Maksimiarvo',
        max_value_attribute: 'Attribuutti (max_value)',
        max_value_entity: 'Käytä entiteettiä maksimiarvona',
        min_value: 'Minimiarvo',
        name: 'Nimi',
        percent: 'Prosentti',
        secondary: 'Lisätiedot',
        tap_action: 'Toiminto lyhyellä napautuksella',
        text_shadow: 'Lisää tekstivarjo (overlay)',
        theme: 'Teema',
        toggle_icon: 'Näytä ikoni',
        toggle_name: 'Näytä nimi',
        toggle_progress_bar: 'Näytä palkki',
        toggle_secondary_info: 'Näytä lisätiedot',
        toggle_value: 'Näytä arvo',
        unit: 'Yksikkö',
        use_max_entity: 'Käytä entiteettiä maksimiarvona'
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
          overlay: 'Palkki sisällön päällä (overlay)'
        },
        layout: {
          horizontal: 'Vaakasuora (oletus)',
          vertical: 'Pystysuora'
        }
      }
    }
  },
  fr: {
    card: {
      msg: {
        appliedDefaultValue: 'Une valeur par défaut a été appliquée automatiquement.',
        attributeNotFound: 'Attribut introuvable dans Home Assistant.',
        discontinuousRange: 'L’intervalle défini est discontinu.',
        entityNotFound: 'Entité introuvable dans Home Assistant.',
        invalidActionObject: 'L’objet action est invalide ou mal structuré.',
        invalidCustomThemeArray: 'Le thème personnalisé doit être un tableau.',
        invalidCustomThemeEntry: 'Une ou plusieurs entrées du thème personnalisé sont invalides.',
        invalidDecimal: 'La valeur doit être un nombre entier positif.',
        invalidEntityId: 'L’identifiant de l’entité est invalide ou mal formé.',
        invalidEnumValue: 'La valeur fournie ne fait pas partie des options autorisées.',
        invalidIconType: 'Le type d’icône spécifié est invalide ou non reconnu.',
        invalidMaxValue: 'La valeur maximale est invalide ou au-dessus des limites autorisées.',
        invalidMinValue: 'La valeur minimale est invalide ou en dessous des limites autorisées.',
        invalidStateContent: 'Le contenu d’état est invalide ou mal formé.',
        invalidStateContentEntry: 'Une ou plusieurs entrées du contenu d’état sont invalides.',
        invalidTheme: 'Le thème spécifié est inconnu. Le thème par défaut sera utilisé.',
        invalidTypeArray: 'Une valeur de type tableau était attendue.',
        invalidTypeBoolean: 'Une valeur de type booléen était attendue.',
        invalidTypeNumber: 'Une valeur de type nombre était attendue.',
        invalidTypeObject: 'Une valeur de type objet était attendue.',
        invalidTypeString: 'Une valeur de type chaîne de caractères était attendue.',
        invalidUnionType: 'La valeur ne correspond à aucun des types autorisés.',
        minGreaterThanMax: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
        missingActionKey: 'Une clé requise est manquante dans l’objet action.',
        missingColorProperty: 'Une propriété de couleur requise est manquante.',
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
        bar_effect: 'Effet sur la barre',
        bar_orientation: 'Orientation de la barre',
        bar_position: 'Position de la barre',
        bar_single_line: 'Infos sur une ligne (overlay)',
        bar_size: 'Taille de la barre',
        center_zero: 'Zéro au centre',
        color: 'Couleur de l\'icône',
        decimal: 'décimal',
        disable_unit: 'Afficher l\'unité',
        double_tap_action: 'Comportement lors d\'un double appui',
        entity: 'Entité',
        force_circular_background: 'Forcer le fond circulaire',
        hold_action: 'Comportement lors d\'un appui long',
        icon: 'Icône',
        icon_double_tap_action: 'Comportement lors d\'un double appui sur l\'icône',
        icon_hold_action: 'Comportement lors d\'un appui long sur l\'icône',
        icon_tap_action: 'Comportement lors de l\'appui sur l\'icône',
        layout: 'Disposition de la carte',
        max_value: 'Valeur maximum',
        max_value_attribute: 'Attribut (max_value)',
        max_value_entity: 'Valeur maximum',
        min_value: 'Valeur minimum',
        name: 'Nom',
        percent: 'Pourcentage',
        secondary: 'Information secondaire',
        tap_action: 'Comportement lors d\'un appui court',
        text_shadow: 'Ajouter une ombre au texte (overlay)',
        theme: 'Thème',
        toggle_icon: 'Afficher l\'icône',
        toggle_name: 'Afficher le nom',
        toggle_progress_bar: 'Afficher la barre de progression',
        toggle_secondary_info: 'Afficher les informations secondaires',
        toggle_value: 'Afficher la valeur',
        unit: 'Unité',
        use_max_entity: 'Utiliser une entité pour la valeur max'
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
          overlay: 'Barre superposée au contenu (overlay)'
        },
        layout: {
          horizontal: 'Horizontal (par défaut)',
          vertical: 'Vertical'
        }
      }
    }
  },
  hi: {
    card: {
      msg: {
        appliedDefaultValue: 'एक डिफ़ॉल्ट मान स्वचालित रूप से लागू किया गया है।',
        attributeNotFound: 'HA में एट्रिब्यूट नहीं मिला।',
        discontinuousRange: 'परिभाषित रेंज असतत है।',
        entityNotFound: 'HA में एंटिटी नहीं मिली।',
        invalidActionObject: 'एक्शन ऑब्जेक्ट अमान्य या गलत तरीके से संरचित है।',
        invalidCustomThemeArray: 'कस्टम थीम एक एरे होना चाहिए।',
        invalidCustomThemeEntry: 'कस्टम थीम में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidDecimal: 'मान एक वैध दशमलव संख्या होना चाहिए।',
        invalidEntityId: 'एंटिटी आईडी अमान्य या गलत तरीके से बनाई गई है।',
        invalidEnumValue: 'प्रदान किया गया मान अनुमतित विकल्पों में से एक नहीं है।',
        invalidIconType: 'निर्दिष्ट आइकन प्रकार अमान्य या अपरिचित है।',
        invalidMaxValue: 'अधिकतम मान अमान्य है या अनुमतित सीमा से ऊपर है।',
        invalidMinValue: 'न्यूनतम मान अमान्य है या अनुमतित सीमा से नीचे है।',
        invalidStateContent: 'स्थिति सामग्री अमान्य या गलत तरीके से बनाई गई है।',
        invalidStateContentEntry: 'स्थिति सामग्री में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidTheme: 'निर्दिष्ट थीम अज्ञात है। डिफ़ॉल्ट थीम का उपयोग किया जाएगा।',
        invalidTypeArray: 'एरे प्रकार का मान अपेक्षित है।',
        invalidTypeBoolean: 'बूलियन प्रकार का मान अपेक्षित है।',
        invalidTypeNumber: 'संख्या प्रकार का मान अपेक्षित है।',
        invalidTypeObject: 'ऑब्जेक्ट प्रकार का मान अपेक्षित है।',
        invalidTypeString: 'स्ट्रिंग प्रकार का मान अपेक्षित है।',
        invalidUnionType: 'मान अनुमतित प्रकारों में से किसी से मेल नहीं खाता।',
        minGreaterThanMax: 'न्यूनतम मान अधिकतम मान से अधिक नहीं हो सकता।',
        missingActionKey: 'एक्शन ऑब्जेक्ट में एक आवश्यक कुंजी गायब है।',
        missingColorProperty: 'एक आवश्यक रंग गुण गायब है।',
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
        bar_effect: 'बार पर प्रभाव',
        bar_orientation: 'बार की दिशा',
        bar_position: 'बार की स्थिति',
        bar_single_line: 'एक पंक्ति में जानकारी (ओवरले)',
        bar_size: 'बार का आकार',
        center_zero: 'शून्य केंद्र में',
        color: 'मुख्य रंग',
        decimal: 'दशमलव',
        disable_unit: 'इकाई दिखाएँ',
        double_tap_action: 'डबल टैप व्यवहार',
        entity: 'एंटिटी',
        force_circular_background: 'गोलाकार पृष्ठभूमि को बाध्य करें',
        hold_action: 'होल्ड व्यवहार',
        icon: 'आइकन',
        icon_double_tap_action: 'आइकन डबल टैप व्यवहार',
        icon_hold_action: 'आइकन होल्ड व्यवहार',
        icon_tap_action: 'आइकन टैप व्यवहार',
        layout: 'कार्ड लेआउट',
        max_value: 'अधिकतम मान',
        max_value_attribute: 'एट्रिब्यूट (max_value)',
        max_value_entity: 'एंटिटी का अधिकतम मान',
        min_value: 'न्यूनतम मान',
        name: 'नाम',
        percent: 'प्रतिशत',
        secondary: 'सहायक जानकारी',
        tap_action: 'टैप व्यवहार',
        text_shadow: 'टेक्स्ट में छाया जोड़ें (overlay)',
        theme: 'थीम',
        toggle_icon: 'आइकन दिखाएँ',
        toggle_name: 'नाम दिखाएँ',
        toggle_progress_bar: 'प्रगति बार दिखाएँ',
        toggle_secondary_info: 'सहायक जानकारी दिखाएँ',
        toggle_value: 'मान दिखाएँ',
        unit: 'इकाई',
        use_max_entity: 'अधिकतम मान के लिए एंटिटी उपयोग करें'
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
          top: 'ऊपर बार (ओवरले)'
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
        }
      }
    }
  },
  hr: {
    card: {
      msg: {
        appliedDefaultValue: 'Zadana vrijednost automatski je primijenjena.',
        attributeNotFound: 'Atribut nije pronađen u Home Assistantu.',
        discontinuousRange: 'Definirani raspon nije kontinuiran.',
        entityNotFound: 'Entitet nije pronađen u Home Assistantu.',
        invalidActionObject: 'Objekt radnje je nevažeći ili loše strukturiran.',
        invalidCustomThemeArray: 'Prilagođena tema mora biti polje.',
        invalidCustomThemeEntry: 'Jedan ili više unosa u temi su nevažeći.',
        invalidDecimal: 'Vrijednost mora biti valjani decimalni broj.',
        invalidEntityId: 'ID entiteta je nevažeći ili pogrešno formatiran.',
        invalidEnumValue: 'Navedena vrijednost nije među dopuštenim opcijama.',
        invalidIconType: 'Naveden tip ikone je nevažeći ili neprepoznatljiv.',
        invalidMaxValue: 'Maksimalna vrijednost je nevažeća ili previsoka.',
        invalidMinValue: 'Minimalna vrijednost je nevažeća ili preniska.',
        invalidStateContent: 'Sadržaj stanja je nevažeći ili pogrešno formatiran.',
        invalidStateContentEntry: 'Jedan ili više unosa stanja su nevažeći.',
        invalidTheme: 'Navedena tema je nepoznata. Koristi se zadana tema.',
        invalidTypeArray: 'Očekivana je vrijednost tipa polje.',
        invalidTypeBoolean: 'Očekivana je vrijednost tipa boolean.',
        invalidTypeNumber: 'Očekivana je vrijednost tipa broj.',
        invalidTypeObject: 'Očekivana je vrijednost tipa objekt.',
        invalidTypeString: 'Očekivana je vrijednost tipa string.',
        invalidUnionType: 'Vrijednost ne odgovara nijednom dopuštenom tipu.',
        minGreaterThanMax: 'Minimalna vrijednost ne može biti veća od maksimalne.',
        missingActionKey: 'Nedostaje obavezni ključ u objektu radnje.',
        missingColorProperty: 'Nedostaje obavezno svojstvo boje.',
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
        bar_effect: 'Efekt na traci',
        bar_orientation: 'Orijentacija trake',
        bar_position: 'Položaj trake',
        bar_single_line: 'Informacije u jednom retku (overlay)',
        bar_size: 'Veličina trake',
        center_zero: 'Nula u sredini',
        color: 'Primarna boja',
        decimal: 'decimalni',
        disable_unit: 'Prikaži jedinicu',
        double_tap_action: 'Radnja na dupli dodir',
        entity: 'Entitet',
        force_circular_background: 'Prisili kružnu pozadinu',
        hold_action: 'Radnja na dugi dodir',
        icon: 'Ikona',
        icon_double_tap_action: 'Radnja na dupli dodir ikone',
        icon_hold_action: 'Radnja na dugi dodir ikone',
        icon_tap_action: 'Radnja na dodir ikone',
        layout: 'Izgled kartice',
        max_value: 'Maksimalna vrijednost',
        max_value_attribute: 'Atribut (max_value)',
        max_value_entity: 'Maksimalna vrijednost entiteta',
        min_value: 'Minimalna vrijednost',
        name: 'Ime',
        percent: 'Postotak',
        secondary: 'Sekundarne informacije',
        tap_action: 'Radnja na kratki dodir',
        text_shadow: 'Dodaj sjenu tekstu (overlay)',
        theme: 'Tema',
        toggle_icon: 'Prikaži ikonu',
        toggle_name: 'Prikaži ime',
        toggle_progress_bar: 'Prikaži traku napretka',
        toggle_secondary_info: 'Prikaži sekundarne informacije',
        toggle_value: 'Prikaži vrijednost',
        unit: 'Jedinica',
        use_max_entity: 'Koristi entitet za maksimalnu vrijednost'
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
          top: 'Traka na vrhu (overlay)'
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
        }
      }
    }
  },
  hu: {
    card: {
      msg: {
        appliedDefaultValue: 'Alapértelmezett érték automatikusan alkalmazva.',
        attributeNotFound: 'Az attribútum nem található a Home Assistantban.',
        discontinuousRange: 'A megadott tartomány nem folytonos.',
        entityNotFound: 'Az entitás nem található a Home Assistantban.',
        invalidActionObject: 'Az action objektum érvénytelen vagy hibás felépítésű.',
        invalidCustomThemeArray: 'Az egyéni témának tömbnek kell lennie.',
        invalidCustomThemeEntry: 'Az egyéni téma egy vagy több bejegyzése érvénytelen.',
        invalidDecimal: 'Az értéknek pozitív egész számnak kell lennie.',
        invalidEntityId: 'Az entitás azonosító érvénytelen vagy hibás.',
        invalidEnumValue: 'A megadott érték nem része az engedélyezett opcióknak.',
        invalidIconType: 'A megadott ikon típus érvénytelen vagy nem ismert.',
        invalidMaxValue: 'A maximális érték érvénytelen vagy túl magas.',
        invalidMinValue: 'A minimális érték érvénytelen vagy túl alacsony.',
        invalidStateContent: 'Az állapot tartalma érvénytelen vagy hibás.',
        invalidStateContentEntry: 'Az állapot tartalmának egy vagy több eleme érvénytelen.',
        invalidTheme: 'Az adott téma ismeretlen. Az alapértelmezett téma lesz használva.',
        invalidTypeArray: 'Tömb típusú érték volt elvárva.',
        invalidTypeBoolean: 'Logikai (boolean) érték volt elvárva.',
        invalidTypeNumber: 'Szám típusú érték volt elvárva.',
        invalidTypeObject: 'Objektum típusú érték volt elvárva.',
        invalidTypeString: 'Szöveg típusú érték volt elvárva.',
        invalidUnionType: 'Az érték nem felel meg egyik engedélyezett típusnak sem.',
        minGreaterThanMax: 'A minimális érték nem lehet nagyobb a maximálisnál.',
        missingActionKey: 'Egy kötelező kulcs hiányzik az action objektumból.',
        missingColorProperty: 'Egy kötelező szín tulajdonság hiányzik.',
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
        bar_effect: 'Sáv effektus',
        bar_orientation: 'Sáv iránya',
        bar_position: 'Sáv pozíciója',
        bar_single_line: 'Egy soros információ (overlay)',
        bar_size: 'Sáv mérete',
        center_zero: 'Nulla középen',
        color: 'Ikon színe',
        decimal: 'Tizedes',
        disable_unit: 'Egység megjelenítése',
        double_tap_action: 'Kettős koppintás művelet',
        entity: 'Entitás',
        force_circular_background: 'Kör alakú háttér erőltetése',
        hold_action: 'Hosszan tartó nyomás művelet',
        icon: 'Ikon',
        icon_double_tap_action: 'Ikon dupla koppintás művelet',
        icon_hold_action: 'Ikon hosszan nyomás művelet',
        icon_tap_action: 'Ikon koppintás művelet',
        layout: 'Kártya elrendezése',
        max_value: 'Maximális érték',
        max_value_attribute: 'Attribútum (max_value)',
        max_value_entity: 'Maximális érték',
        min_value: 'Minimális érték',
        name: 'Név',
        percent: 'Százalék',
        secondary: 'Másodlagos információ',
        tap_action: 'Koppintás művelet',
        text_shadow: 'Szöveg árnyék hozzáadása (overlay)',
        theme: 'Téma',
        toggle_icon: 'Ikon megjelenítése',
        toggle_name: 'Név megjelenítése',
        toggle_progress_bar: 'Sáv megjelenítése',
        toggle_secondary_info: 'Másodlagos info megjelenítése',
        toggle_value: 'Érték megjelenítése',
        unit: 'Mértékegység',
        use_max_entity: 'Entitás használata max értékhez'
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
          overlay: 'Sáv a tartalmon (overlay)'
        },
        layout: {
          horizontal: 'Vízszintes (alapértelmezett)',
          vertical: 'Függőleges'
        }
      }
    }
  },
  id: {
    card: {
      msg: {
        appliedDefaultValue: 'Nilai default telah diterapkan secara otomatis.',
        attributeNotFound: 'Atribut tidak ditemukan di HA.',
        discontinuousRange: 'Range yang didefinisikan tidak kontinu.',
        entityNotFound: 'Entitas tidak ditemukan di HA.',
        invalidActionObject: 'Objek aksi tidak valid atau struktur salah.',
        invalidCustomThemeArray: 'Tema kustom harus berupa array.',
        invalidCustomThemeEntry: 'Satu atau lebih entri dalam tema kustom tidak valid.',
        invalidDecimal: 'Nilai harus berupa angka desimal yang valid.',
        invalidEntityId: 'ID entitas tidak valid atau salah format.',
        invalidEnumValue: 'Nilai yang diberikan bukan salah satu dari opsi yang diizinkan.',
        invalidIconType: 'Tipe ikon yang ditentukan tidak valid atau tidak dikenali.',
        invalidMaxValue: 'Nilai maksimum tidak valid atau di atas batas yang diizinkan.',
        invalidMinValue: 'Nilai minimum tidak valid atau di bawah batas yang diizinkan.',
        invalidStateContent: 'Konten state tidak valid atau salah format.',
        invalidStateContentEntry: 'Satu atau lebih entri dalam konten state tidak valid.',
        invalidTheme: 'Tema yang ditentukan tidak dikenal. Tema default akan digunakan.',
        invalidTypeArray: 'Mengharapkan nilai bertipe array.',
        invalidTypeBoolean: 'Mengharapkan nilai bertipe boolean.',
        invalidTypeNumber: 'Mengharapkan nilai bertipe angka.',
        invalidTypeObject: 'Mengharapkan nilai bertipe object.',
        invalidTypeString: 'Mengharapkan nilai bertipe string.',
        invalidUnionType: 'Nilai tidak cocok dengan tipe yang diizinkan.',
        minGreaterThanMax: 'Nilai minimum tidak boleh lebih besar dari nilai maksimum.',
        missingActionKey: 'Kunci yang diperlukan hilang dalam objek aksi.',
        missingColorProperty: 'Properti warna yang diperlukan hilang.',
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
        bar_effect: 'Efek pada bar',
        bar_orientation: 'Orientasi bar',
        bar_position: 'Posisi bar',
        bar_single_line: 'Info dalam satu baris (overlay)',
        bar_size: 'Ukuran bar',
        center_zero: 'Nol di tengah',
        color: 'Warna utama',
        decimal: 'desimal',
        disable_unit: 'Tampilkan unit',
        double_tap_action: 'Perilaku ketuk ganda',
        entity: 'Entitas',
        force_circular_background: 'Paksa latar belakang melingkar',
        hold_action: 'Perilaku tahan',
        icon: 'Ikon',
        icon_double_tap_action: 'Perilaku ketuk ganda ikon',
        icon_hold_action: 'Perilaku tahan ikon',
        icon_tap_action: 'Perilaku ketuk ikon',
        layout: 'Tata letak kartu',
        max_value: 'Nilai maksimum',
        max_value_attribute: 'Atribut (max_value)',
        max_value_entity: 'Nilai maksimum',
        min_value: 'Nilai minimum',
        name: 'Nama',
        percent: 'Persentase',
        secondary: 'Informasi sekunder',
        tap_action: 'Perilaku ketuk',
        text_shadow: 'Tambahkan bayangan teks (overlay)',
        theme: 'Tema',
        toggle_icon: 'Tampilkan ikon',
        toggle_name: 'Tampilkan nama',
        toggle_progress_bar: 'Tampilkan bar kemajuan',
        toggle_secondary_info: 'Tampilkan informasi sekunder',
        toggle_value: 'Tampilkan nilai',
        unit: 'Unit',
        use_max_entity: 'Gunakan entitas untuk nilai maksimum'
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
          top: 'Bar di atas (overlay)'
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
        }
      }
    }
  },
  it: {
    card: {
      msg: {
        appliedDefaultValue: 'È stato applicato automaticamente un valore predefinito.',
        attributeNotFound: 'Attributo non trovato in Home Assistant.',
        discontinuousRange: 'L\'intervallo definito è discontinuo.',
        entityNotFound: 'Entità non trovata in Home Assistant.',
        invalidActionObject: 'L\'oggetto azione non è valido o è strutturato in modo errato.',
        invalidCustomThemeArray: 'Il tema personalizzato deve essere un array.',
        invalidCustomThemeEntry: 'Una o più voci del tema personalizzato non sono valide.',
        invalidDecimal: 'Il valore deve essere un numero decimale valido.',
        invalidEntityId: 'L\'ID dell\'entità non è valido o è mal formattato.',
        invalidEnumValue: 'Il valore fornito non è tra quelli consentiti.',
        invalidIconType: 'Il tipo di icona specificato non è valido o non è riconosciuto.',
        invalidMaxValue: 'Il valore massimo non è valido o supera il limite consentito.',
        invalidMinValue: 'Il valore minimo non è valido o è al di sotto del limite consentito.',
        invalidStateContent: 'Il contenuto dello stato non è valido o è mal formattato.',
        invalidStateContentEntry: 'Una o più voci nel contenuto dello stato non sono valide.',
        invalidTheme: 'Il tema specificato è sconosciuto. Verrà utilizzato il tema predefinito.',
        invalidTypeArray: 'Atteso un valore di tipo array.',
        invalidTypeBoolean: 'Atteso un valore di tipo booleano.',
        invalidTypeNumber: 'Atteso un valore di tipo numero.',
        invalidTypeObject: 'Atteso un valore di tipo oggetto.',
        invalidTypeString: 'Atteso un valore di tipo stringa.',
        invalidUnionType: 'Il valore non corrisponde a nessuno dei tipi consentiti.',
        minGreaterThanMax: 'Il valore minimo non può essere superiore al valore massimo.',
        missingActionKey: 'Manca una chiave obbligatoria nell\'oggetto azione.',
        missingColorProperty: 'Manca una proprietà colore obbligatoria.',
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
        bar_color: 'Colore per la barra',
        bar_effect: 'Effetto sulla barra',
        bar_orientation: 'Orientamento della barra',
        bar_position: 'Posizione della barra',
        bar_single_line: 'Info su una riga (overlay)',
        bar_size: 'Dimensione della barra',
        center_zero: 'Zero al centro',
        color: 'Colore dell\'icona',
        decimal: 'Decimale',
        disable_unit: 'Mostra unità',
        double_tap_action: 'Azione al doppio tocco',
        entity: 'Entità',
        force_circular_background: 'Forza sfondo circolare',
        hold_action: 'Azione al tocco prolungato',
        icon: 'Icona',
        icon_double_tap_action: 'Azione al doppio tocco dell\'icona',
        icon_hold_action: 'Azione al tocco prolungato dell\'icona',
        icon_tap_action: 'Azione al tocco dell\'icona',
        layout: 'Layout della carta',
        max_value: 'Valore massimo',
        max_value_attribute: 'Attributo (max_value)',
        max_value_entity: 'Valore massimo',
        min_value: 'Valore minimo',
        name: 'Nome',
        percent: 'Percentuale',
        secondary: 'Informazione secondaria',
        tap_action: 'Azione al tocco breve',
        text_shadow: 'Aggiungi ombra al testo (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostra icona',
        toggle_name: 'Mostra nome',
        toggle_progress_bar: 'Mostra barra di avanzamento',
        toggle_secondary_info: 'Mostra informazioni secondarie',
        toggle_value: 'Mostra valore',
        unit: 'Unità',
        use_max_entity: 'Usa un\'entità per il valore massimo'
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
          top: 'Barra in alto (overlay)'
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
        }
      }
    }
  },
  ja: {
    card: {
      msg: {
        appliedDefaultValue: 'デフォルト値が自動的に適用されました。',
        attributeNotFound: 'Home Assistant に属性が見つかりません。',
        discontinuousRange: '定義された範囲が連続していません。',
        entityNotFound: 'Home Assistant にエンティティが見つかりません。',
        invalidActionObject: 'アクションオブジェクトが無効または構造が不正です。',
        invalidCustomThemeArray: 'カスタムテーマは配列である必要があります。',
        invalidCustomThemeEntry: 'カスタムテーマの1つ以上のエントリが無効です。',
        invalidDecimal: '値は有効な小数である必要があります。',
        invalidEntityId: 'エンティティ ID が無効か、形式が正しくありません。',
        invalidEnumValue: '指定された値は許可されたオプションのいずれでもありません。',
        invalidIconType: '指定されたアイコンタイプが無効または認識されません。',
        invalidMaxValue: '最大値が無効か、許容範囲を超えています。',
        invalidMinValue: '最小値が無効か、許容範囲を下回っています。',
        invalidStateContent: '状態の内容が無効または形式が不正です。',
        invalidStateContentEntry: '状態の内容の1つ以上のエントリが無効です。',
        invalidTheme: '指定されたテーマは不明です。デフォルトのテーマが使用されます。',
        invalidTypeArray: '配列型の値が必要です。',
        invalidTypeBoolean: 'ブール型の値が必要です。',
        invalidTypeNumber: '数値型の値が必要です。',
        invalidTypeObject: 'オブジェクト型の値が必要です。',
        invalidTypeString: '文字列型の値が必要です。',
        invalidUnionType: '値が許可された型のいずれにも一致しません。',
        minGreaterThanMax: '最小値は最大値より大きくできません。',
        missingActionKey: 'アクションオブジェクトに必要なキーが欠落しています。',
        missingColorProperty: '必要な色のプロパティが欠落しています。',
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
        bar_effect: 'バーのエフェクト',
        bar_orientation: 'バーの向き',
        bar_position: 'バーの位置',
        bar_single_line: '1行で情報を表示（オーバーレイ）',
        bar_size: 'バーサイズ',
        center_zero: 'ゼロを中央に',
        color: 'メインカラー',
        decimal: '小数点',
        disable_unit: '単位を表示',
        double_tap_action: 'ダブルタップしたときの動作',
        entity: 'エンティティ',
        force_circular_background: '円形の背景を強制する',
        hold_action: '長押ししたときの動作',
        icon: 'アイコン',
        icon_double_tap_action: 'アイコンをダブルタップしたときの動作',
        icon_hold_action: 'アイコンを長押ししたときの動作',
        icon_tap_action: 'アイコンをタップしたときの動作',
        layout: 'カードレイアウト',
        max_value: '最大値',
        max_value_attribute: '属性（最大値）',
        max_value_entity: '最大値',
        min_value: '最小値',
        name: '名前',
        percent: 'パーセント',
        secondary: '補足情報',
        tap_action: '短くタップしたときの動作',
        text_shadow: 'テキストに影を追加 (オーバーレイ)',
        theme: 'テーマ',
        toggle_icon: 'アイコンを表示',
        toggle_name: '名前を表示',
        toggle_progress_bar: 'プログレスバーを表示',
        toggle_secondary_info: '補足情報を表示',
        toggle_value: '値を表示',
        unit: '単位',
        use_max_entity: '最大値にエンティティを使用'
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
          top: '上部にバー（オーバーレイ）'
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
        }
      }
    }
  },
  ko: {
    card: {
      msg: {
        appliedDefaultValue: '기본값이 자동으로 적용되었습니다.',
        attributeNotFound: 'Home Assistant에서 속성을 찾을 수 없습니다.',
        discontinuousRange: '정의된 범위가 연속적이지 않습니다.',
        entityNotFound: 'Home Assistant에서 엔티티를 찾을 수 없습니다.',
        invalidActionObject: '액션 객체가 잘못되었거나 구조가 올바르지 않습니다.',
        invalidCustomThemeArray: '사용자 정의 테마는 배열이어야 합니다.',
        invalidCustomThemeEntry: '사용자 정의 테마에 하나 이상의 잘못된 항목이 있습니다.',
        invalidDecimal: '값은 유효한 소수여야 합니다.',
        invalidEntityId: '엔티티 ID가 잘못되었거나 형식이 잘못되었습니다.',
        invalidEnumValue: '제공된 값이 허용된 옵션 중 하나가 아닙니다.',
        invalidIconType: '지정된 아이콘 유형이 잘못되었거나 인식되지 않습니다.',
        invalidMaxValue: '최대값이 유효하지 않거나 허용된 범위를 초과합니다.',
        invalidMinValue: '최소값이 유효하지 않거나 허용된 범위보다 작습니다.',
        invalidStateContent: '상태 콘텐츠가 잘못되었거나 형식이 잘못되었습니다.',
        invalidStateContentEntry: '상태 콘텐츠에 하나 이상의 잘못된 항목이 있습니다.',
        invalidTheme: '지정된 테마를 알 수 없습니다. 기본 테마가 사용됩니다.',
        invalidTypeArray: '배열 유형의 값이 필요합니다.',
        invalidTypeBoolean: '불리언 유형의 값이 필요합니다.',
        invalidTypeNumber: '숫자 유형의 값이 필요합니다.',
        invalidTypeObject: '객체 유형의 값이 필요합니다.',
        invalidTypeString: '문자열 유형의 값이 필요합니다.',
        invalidUnionType: '값이 허용된 유형 중 어떤 것과도 일치하지 않습니다.',
        minGreaterThanMax: '최소값은 최대값보다 클 수 없습니다.',
        missingActionKey: '액션 객체에 필수 키가 없습니다.',
        missingColorProperty: '필수 색상 속성이 누락되었습니다.',
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
        bar_effect: '바 효과',
        bar_orientation: '바 방향',
        bar_position: '바 위치',
        bar_single_line: '한 줄로 정보 표시 (오버레이)',
        bar_size: '바 크기',
        center_zero: '중앙에 영점',
        color: '기본 색상',
        decimal: '소수점',
        disable_unit: '단위 표시',
        double_tap_action: '더블 탭 시 동작',
        entity: '엔티티',
        force_circular_background: '원형 배경 강제 적용',
        hold_action: '길게 누를 시 동작',
        icon: '아이콘',
        icon_double_tap_action: '아이콘 더블 탭 시 동작',
        icon_hold_action: '아이콘 길게 누를 시 동작',
        icon_tap_action: '아이콘 탭 시 동작',
        layout: '카드 레이아웃',
        max_value: '최대값',
        max_value_attribute: '속성 (최대값)',
        max_value_entity: '최대값',
        min_value: '최소값',
        name: '이름',
        percent: '퍼센트',
        secondary: '보조 정보',
        tap_action: '짧게 탭 시 동작',
        text_shadow: '텍스트 그림자 추가 (오버레이)',
        theme: '테마',
        toggle_icon: '아이콘 표시',
        toggle_name: '이름 표시',
        toggle_progress_bar: '진행 바 표시',
        toggle_secondary_info: '보조 정보 표시',
        toggle_value: '값 표시',
        unit: '단위',
        use_max_entity: '최대값에 엔티티 사용'
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
          top: '상단 바 (오버레이)'
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
        }
      }
    }
  },
  lt: {
    card: {
      msg: {
        appliedDefaultValue: 'Numatytoji reikšmė buvo automatiškai pritaikyta.',
        attributeNotFound: 'Atributas nerastas Home Assistant.',
        discontinuousRange: 'Nustatytas intervalas nėra tęstinis.',
        entityNotFound: 'Entity nerasta Home Assistant.',
        invalidActionObject: 'Veiksmo objektas negalioja arba neteisingai suformuotas.',
        invalidCustomThemeArray: 'Individuali tema turi būti masyvas.',
        invalidCustomThemeEntry: 'Viena ar daugiau individualios temos įrašų negalioja.',
        invalidDecimal: 'Reikšmė turi būti teigiamas sveikasis skaičius.',
        invalidEntityId: 'Entity ID negalioja arba neteisingas.',
        invalidEnumValue: 'Pateikta reikšmė nėra tarp leidžiamų parinkčių.',
        invalidIconType: 'Nurodytas piktogramos tipas negalioja arba nežinomas.',
        invalidMaxValue: 'Maksimali reikšmė negalioja arba viršija leistiną ribą.',
        invalidMinValue: 'Minimali reikšmė negalioja arba žemesnė už leistiną ribą.',
        invalidStateContent: 'Būsenos turinys negalioja arba neteisingai suformuotas.',
        invalidStateContentEntry: 'Viena ar daugiau būsenos turinio įrašų negalioja.',
        invalidTheme: 'Nurodyta tema nežinoma. Bus naudojama numatytoji tema.',
        invalidTypeArray: 'Tikėtasi masyvo tipo reikšmės.',
        invalidTypeBoolean: 'Tikėtasi loginės reikšmės (boolean).',
        invalidTypeNumber: 'Tikėtasi skaičiaus tipo reikšmės.',
        invalidTypeObject: 'Tikėtasi objekto tipo reikšmės.',
        invalidTypeString: 'Tikėtasi eilutės tipo reikšmės.',
        invalidUnionType: 'Reikšmė neatitinka nė vieno leidžiamo tipo.',
        minGreaterThanMax: 'Minimali reikšmė negali būti didesnė už maksimalų.',
        missingActionKey: 'Trūksta privalomo rakto veiksmo objekte.',
        missingColorProperty: 'Trūksta privalomos spalvos savybės.',
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
        bar_effect: 'Juostos efektas',
        bar_orientation: 'Juostos orientacija',
        bar_position: 'Juostos pozicija',
        bar_single_line: 'Informacija vienoje eilutėje (overlay)',
        bar_size: 'Juostos dydis',
        center_zero: 'Nulis centre',
        color: 'Ikonos spalva',
        decimal: 'Dešimtainė',
        disable_unit: 'Rodyti vienetą',
        double_tap_action: 'Dviejų bakstelėjimų veiksmas',
        entity: 'Entity',
        force_circular_background: 'Priversti apvalų foną',
        hold_action: 'Ilgo paspaudimo veiksmas',
        icon: 'Ikona',
        icon_double_tap_action: 'Ikonos dviejų bakstelėjimų veiksmas',
        icon_hold_action: 'Ikonos ilgo paspaudimo veiksmas',
        icon_tap_action: 'Ikonos bakstelėjimo veiksmas',
        layout: 'Kortelės išdėstymas',
        max_value: 'Maksimali reikšmė',
        max_value_attribute: 'Atributas (max_value)',
        max_value_entity: 'Maksimali reikšmė',
        min_value: 'Minimali reikšmė',
        name: 'Pavadinimas',
        percent: 'Procentai',
        secondary: 'Papildoma informacija',
        tap_action: 'Bakstelėjimo veiksmas',
        text_shadow: 'Pridėti teksto šešėlį (overlay)',
        theme: 'Tema',
        toggle_icon: 'Rodyti ikoną',
        toggle_name: 'Rodyti pavadinimą',
        toggle_progress_bar: 'Rodyti progreso juostą',
        toggle_secondary_info: 'Rodyti papildomą info',
        toggle_value: 'Rodyti reikšmę',
        unit: 'Vienetas',
        use_max_entity: 'Naudoti entity max reikšmei'
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
          overlay: 'Juosta ant turinio (overlay)'
        },
        layout: {
          horizontal: 'Horizontalus (numatyta)',
          vertical: 'Vertikalus'
        }
      }
    }
  },
  lv: {
    card: {
      msg: {
        appliedDefaultValue: 'Noklusējuma vērtība tika automātiski piemērota.',
        attributeNotFound: 'Atribūts nav atrasts Home Assistant.',
        discontinuousRange: 'Norādītais diapazons nav nepārtraukts.',
        entityNotFound: 'Vienība nav atrasta Home Assistant.',
        invalidActionObject: 'Darbības objekts nav derīgs vai ir nepareizi strukturēts.',
        invalidCustomThemeArray: 'Pielāgotajai tēmai jābūt masīvam.',
        invalidCustomThemeEntry: 'Viena vai vairākas pielāgotās tēmas ievades nav derīgas.',
        invalidDecimal: 'Vērtībai jābūt pozitīvam veselajam skaitlim.',
        invalidEntityId: 'Vienības ID nav derīgs vai ir nepareizs.',
        invalidEnumValue: 'Ievadītā vērtība nav atļauto opciju sarakstā.',
        invalidIconType: 'Norādītais ikonas tips nav derīgs vai nav zināms.',
        invalidMaxValue: 'Maksimālā vērtība nav derīga vai pārsniedz atļauto robežu.',
        invalidMinValue: 'Minimālā vērtība nav derīga vai zem atļautās robežas.',
        invalidStateContent: 'Stāvokļa saturs nav derīgs vai ir nepareizi strukturēts.',
        invalidStateContentEntry: 'Viena vai vairākas stāvokļa satura ievades nav derīgas.',
        invalidTheme: 'Norādītā tēma nav zināma. Tiks izmantota noklusējuma tēma.',
        invalidTypeArray: 'Tika gaidīta masīva tipa vērtība.',
        invalidTypeBoolean: 'Tika gaidīta loģiska (boolean) vērtība.',
        invalidTypeNumber: 'Tika gaidīta skaitļa tipa vērtība.',
        invalidTypeObject: 'Tika gaidīta objekta tipa vērtība.',
        invalidTypeString: 'Tika gaidīta virknes tipa vērtība.',
        invalidUnionType: 'Vērtība neatbilst nevienam atļautajam tipam.',
        minGreaterThanMax: 'Minimālā vērtība nevar būt lielāka par maksimālo.',
        missingActionKey: 'Trūkst obligātā atslēga darbības objektā.',
        missingColorProperty: 'Trūkst obligātā krāsas īpašība.',
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
        bar_effect: 'Joslas efekts',
        bar_orientation: 'Joslas orientācija',
        bar_position: 'Joslas pozīcija',
        bar_single_line: 'Informācija vienā rindā (overlay)',
        bar_size: 'Joslas izmērs',
        center_zero: 'Nulles centrā',
        color: 'Ikonas krāsa',
        decimal: 'Decimāldaļa',
        disable_unit: 'Rādīt vienību',
        double_tap_action: 'Divreiz pieskaroties',
        entity: 'Vienība',
        force_circular_background: 'Piespiest apļu fonu',
        hold_action: 'Ilgs pieskāriens',
        icon: 'Ikona',
        icon_double_tap_action: 'Ikonas dubults pieskāriens',
        icon_hold_action: 'Ikonas ilgs pieskāriens',
        icon_tap_action: 'Ikonas pieskāriens',
        layout: 'Kartes izkārtojums',
        max_value: 'Maksimālā vērtība',
        max_value_attribute: 'Atribūts (max_value)',
        max_value_entity: 'Maksimālā vērtība',
        min_value: 'Minimālā vērtība',
        name: 'Nosaukums',
        percent: 'Procenti',
        secondary: 'Papildu informācija',
        tap_action: 'Pieskāriens',
        text_shadow: 'Pievienot teksta ēnu (overlay)',
        theme: 'Tēma',
        toggle_icon: 'Rādīt ikonu',
        toggle_name: 'Rādīt nosaukumu',
        toggle_progress_bar: 'Rādīt progresa joslu',
        toggle_secondary_info: 'Rādīt papildu info',
        toggle_value: 'Rādīt vērtību',
        unit: 'Vienība',
        use_max_entity: 'Izmantot vienību max vērtībai'
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
          overlay: 'Josla virs satura (overlay)'
        },
        layout: {
          horizontal: 'Horizontāls (noklusēts)',
          vertical: 'Vertikāls'
        }
      }
    }
  },
  mk: {
    card: {
      msg: {
        appliedDefaultValue: 'Автоматски е применета стандардна вредност.',
        attributeNotFound: 'Атрибутот не е пронајден во Home Assistant.',
        discontinuousRange: 'Дефинираниот опсег е дисконинуиран.',
        entityNotFound: 'Ентитетот не е пронајден во Home Assistant.',
        invalidActionObject: 'Објектот за акција е невалиден или неправилно структуриран.',
        invalidCustomThemeArray: 'Прилагодената тема мора да биде низа.',
        invalidCustomThemeEntry: 'Еден или повеќе елементи во прилагодената тема се невалидни.',
        invalidDecimal: 'Вредноста мора да биде валиден децимален број.',
        invalidEntityId: 'ID-то на ентитетот е невалидно или лошо форматирано.',
        invalidEnumValue: 'Дадената вредност не е дозволена опција.',
        invalidIconType: 'Типот на икона е невалиден или непознат.',
        invalidMaxValue: 'Максималната вредност е невалидна или над дозволеното.',
        invalidMinValue: 'Минималната вредност е невалидна или под дозволеното.',
        invalidStateContent: 'Состојбата е невалидна или лошо форматирана.',
        invalidStateContentEntry: 'Еден или повеќе елементи во состојбата се невалидни.',
        invalidTheme: 'Темата е непозната. Ќе се користи стандардна тема.',
        invalidTypeArray: 'Се очекуваше вредност од тип низа.',
        invalidTypeBoolean: 'Се очекуваше вредност од тип boolean.',
        invalidTypeNumber: 'Се очекуваше вредност од тип број.',
        invalidTypeObject: 'Се очекуваше вредност од тип објект.',
        invalidTypeString: 'Се очекуваше вредност од тип string.',
        invalidUnionType: 'Вредноста не одговара на дозволените типови.',
        minGreaterThanMax: 'Минималната вредност не може да биде поголема од максималната.',
        missingActionKey: 'Недостасува потребен клуч во објектот за акција.',
        missingColorProperty: 'Недостасува потребна карактеристика за боја.',
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
        bar_effect: 'Ефект на лентата',
        bar_orientation: 'Ориентација на лентата',
        bar_position: 'Позиција на лентата',
        bar_single_line: 'Инфо во еден ред (overlay)',
        bar_size: 'Големина на лента',
        center_zero: 'Нула во центарот',
        color: 'Примарна боја',
        decimal: 'децемален',
        disable_unit: 'Прикажи единица',
        double_tap_action: 'Дејство при двоен допир',
        entity: 'Ентитет',
        force_circular_background: 'Принуди кружна позадина',
        hold_action: 'Дејство при долг допир',
        icon: 'Икона',
        icon_double_tap_action: 'Дејство при двоен допир на иконата',
        icon_hold_action: 'Дејство при долг допир на иконата',
        icon_tap_action: 'Дејство при допир на иконата',
        layout: 'Распоред на карта',
        max_value: 'Максимална вредност',
        max_value_attribute: 'Атрибут (max_value)',
        max_value_entity: 'Максимална вредност',
        min_value: 'Минимална вредност',
        name: 'Име',
        percent: 'Процент',
        secondary: 'Секундарни информации',
        tap_action: 'Дејство при краток допир',
        text_shadow: 'Додај сенка на текст (overlay)',
        theme: 'Тема',
        toggle_icon: 'Прикажи икона',
        toggle_name: 'Прикажи име',
        toggle_progress_bar: 'Прикажи лента на напредок',
        toggle_secondary_info: 'Прикажи секундарни информации',
        toggle_value: 'Прикажи вредност',
        unit: 'Јединство',
        use_max_entity: 'Користи ентитет за максимална вредност'
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
          top: 'Лента на врвот (overlay)'
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
        }
      }
    }
  },
  nb: {
    card: {
      msg: {
        appliedDefaultValue: 'En standardverdi har blitt brukt automatisk.',
        attributeNotFound: 'Attributtet ble ikke funnet i Home Assistant.',
        discontinuousRange: 'Det definerte området er ikke sammenhengende.',
        entityNotFound: 'Enheten ble ikke funnet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldig eller feil strukturert.',
        invalidCustomThemeArray: 'Tilpasset tema må være en array.',
        invalidCustomThemeEntry: 'Én eller flere oppføringer i temaet er ugyldige.',
        invalidDecimal: 'Verdien må være et gyldig desimaltall.',
        invalidEntityId: 'Enhets-ID er ugyldig eller feil formatert.',
        invalidEnumValue: 'Den oppgitte verdien er ikke en gyldig mulighet.',
        invalidIconType: 'Angitt ikon-type er ugyldig eller ukjent.',
        invalidMaxValue: 'Maksverdi er ugyldig eller for høy.',
        invalidMinValue: 'Minsteverdi er ugyldig eller for lav.',
        invalidStateContent: 'Tilstandsinnholdet er ugyldig eller feil formatert.',
        invalidStateContentEntry: 'En eller flere oppføringer i tilstandsinnholdet er ugyldige.',
        invalidTheme: 'Angitt tema er ukjent. Standardtema vil bli brukt.',
        invalidTypeArray: 'Forventet en verdi av typen array.',
        invalidTypeBoolean: 'Forventet en boolsk verdi.',
        invalidTypeNumber: 'Forventet en numerisk verdi.',
        invalidTypeObject: 'Forventet en verdi av typen objekt.',
        invalidTypeString: 'Forventet en verdi av typen string.',
        invalidUnionType: 'Verdien samsvarer ikke med noen av de tillatte typene.',
        minGreaterThanMax: 'Minsteverdi kan ikke være større enn maksverdi.',
        missingActionKey: 'En påkrevd nøkkel mangler i handlingsobjektet.',
        missingColorProperty: 'En nødvendig fargeegenskap mangler.',
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
        bar_effect: 'Effekt på baren',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Posisjon for baren',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        center_zero: 'Null i midten',
        color: 'Primærfarge',
        decimal: 'desimal',
        disable_unit: 'Vis enhet',
        double_tap_action: 'Handling ved dobbelt trykk',
        entity: 'Enhet',
        force_circular_background: 'Tving sirkulær bakgrunn',
        hold_action: 'Handling ved langt trykk',
        icon: 'Ikon',
        icon_double_tap_action: 'Handling ved dobbelt trykk på ikonet',
        icon_hold_action: 'Handling ved langt trykk på ikonet',
        icon_tap_action: 'Handling ved trykk på ikonet',
        layout: 'Kortlayout',
        max_value: 'Maksimal verdi',
        max_value_attribute: 'Attributt (max_value)',
        max_value_entity: 'Maksimal verdi',
        min_value: 'Minste verdi',
        name: 'Navn',
        percent: 'Prosent',
        secondary: 'Sekundær informasjon',
        tap_action: 'Handling ved kort trykk',
        text_shadow: 'Legg til tekstskygge (overlay)',
        theme: 'Tema',
        toggle_icon: 'Vis ikon',
        toggle_name: 'Vis navn',
        toggle_progress_bar: 'Vis fremdriftsbar',
        toggle_secondary_info: 'Vis sekundær informasjon',
        toggle_value: 'Vis verdi',
        unit: 'Enhet',
        use_max_entity: 'Bruk enhet for maksimalverdi'
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
          top: 'Bar øverst (overlay)'
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
        }
      }
    }
  },
  nl: {
    card: {
      msg: {
        appliedDefaultValue: 'Een standaardwaarde is automatisch toegepast.',
        attributeNotFound: 'Attribuut niet gevonden in Home Assistant.',
        discontinuousRange: 'Het opgegeven bereik is niet aaneengesloten.',
        entityNotFound: 'Entiteit niet gevonden in Home Assistant.',
        invalidActionObject: 'Het actieobject is ongeldig of onjuist gestructureerd.',
        invalidCustomThemeArray: 'Het aangepaste thema moet een array zijn.',
        invalidCustomThemeEntry: 'Een of meer invoeren in het aangepaste thema zijn ongeldig.',
        invalidDecimal: 'De waarde moet een geldig decimaal getal zijn.',
        invalidEntityId: 'De entity ID is ongeldig of foutief geformatteerd.',
        invalidEnumValue: 'De opgegeven waarde is geen geldige optie.',
        invalidIconType: 'Het opgegeven pictogramtype is ongeldig of niet herkend.',
        invalidMaxValue: 'De maximumwaarde is ongeldig of te hoog.',
        invalidMinValue: 'De minimumwaarde is ongeldig of te laag.',
        invalidStateContent: 'De statusinhoud is ongeldig of foutief.',
        invalidStateContentEntry: 'Een of meer onderdelen van de statusinhoud zijn ongeldig.',
        invalidTheme: 'Het opgegeven thema is onbekend. Het standaardthema wordt gebruikt.',
        invalidTypeArray: 'Verwachte waarde van het type array.',
        invalidTypeBoolean: 'Verwachte waarde van het type boolean.',
        invalidTypeNumber: 'Verwachte waarde van het type nummer.',
        invalidTypeObject: 'Verwachte waarde van het type object.',
        invalidTypeString: 'Verwachte waarde van het type string.',
        invalidUnionType: 'De waarde komt niet overeen met toegestane types.',
        minGreaterThanMax: 'Minimumwaarde kan niet groter zijn dan de maximumwaarde.',
        missingActionKey: 'Er ontbreekt een verplichte sleutel in het actieobject.',
        missingColorProperty: 'Een verplichte kleur-eigenschap ontbreekt.',
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
        bar_color: 'Kleur voor de balk',
        bar_effect: 'Effect op de balk',
        bar_orientation: 'Oriëntatie van de balk',
        bar_position: 'Positie van de balk',
        bar_single_line: 'Info op één regel (overlay)',
        bar_size: 'Balkgrootte',
        center_zero: 'Nul in het midden',
        color: 'Primaire kleur',
        decimal: 'decimaal',
        disable_unit: 'Eenheid weergeven',
        double_tap_action: 'Actie bij dubbel tikken',
        entity: 'Entiteit',
        force_circular_background: 'Geforceerde cirkelvormige achtergrond',
        hold_action: 'Actie bij lang ingedrukt houden',
        icon: 'Pictogram',
        icon_double_tap_action: 'Actie bij dubbel tikken op pictogram',
        icon_hold_action: 'Actie bij lang ingedrukt houden op pictogram',
        icon_tap_action: 'Actie bij tikken op pictogram',
        layout: 'Kaartindeling',
        max_value: 'Maximale waarde',
        max_value_attribute: 'Attribuut (max_value)',
        max_value_entity: 'Maximale waarde',
        min_value: 'Minimale waarde',
        name: 'Naam',
        percent: 'Percentage',
        secondary: 'Secundaire informatie',
        tap_action: 'Actie bij korte tik',
        text_shadow: 'Tekstschaduw toevoegen (overlay)',
        theme: 'Thema',
        toggle_icon: 'Pictogram weergeven',
        toggle_name: 'Naam weergeven',
        toggle_progress_bar: 'Voortgangsbalk weergeven',
        toggle_secondary_info: 'Secundaire informatie weergeven',
        toggle_value: 'Waarde weergeven',
        unit: 'Eenheid',
        use_max_entity: 'Entiteit gebruiken voor maximale waarde'
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
          top: 'Balk bovenaan (overlay)'
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
        }
      }
    }
  },
  pl: {
    card: {
      msg: {
        appliedDefaultValue: 'Zastosowano domyślną wartość automatycznie.',
        attributeNotFound: 'Nie znaleziono atrybutu w Home Assistant.',
        discontinuousRange: 'Zdefiniowany zakres jest nieciągły.',
        entityNotFound: 'Nie znaleziono encji w Home Assistant.',
        invalidActionObject: 'Obiekt akcji jest nieprawidłowy lub ma złą strukturę.',
        invalidCustomThemeArray: 'Własny motyw musi być tablicą.',
        invalidCustomThemeEntry: 'Jedna lub więcej pozycji motywu jest nieprawidłowa.',
        invalidDecimal: 'Wartość musi być poprawną liczbą dziesiętną.',
        invalidEntityId: 'ID encji jest nieprawidłowe lub ma zły format.',
        invalidEnumValue: 'Podana wartość nie jest jedną z dozwolonych opcji.',
        invalidIconType: 'Określony typ ikony jest nieprawidłowy lub nieznany.',
        invalidMaxValue: 'Maksymalna wartość jest nieprawidłowa lub zbyt wysoka.',
        invalidMinValue: 'Minimalna wartość jest nieprawidłowa lub zbyt niska.',
        invalidStateContent: 'Zawartość stanu jest nieprawidłowa lub uszkodzona.',
        invalidStateContentEntry: 'Jedna lub więcej pozycji zawartości stanu jest nieprawidłowa.',
        invalidTheme: 'Podany motyw jest nieznany. Zostanie użyty domyślny motyw.',
        invalidTypeArray: 'Oczekiwano wartości typu tablica.',
        invalidTypeBoolean: 'Oczekiwano wartości typu boolean.',
        invalidTypeNumber: 'Oczekiwano wartości typu liczba.',
        invalidTypeObject: 'Oczekiwano wartości typu obiekt.',
        invalidTypeString: 'Oczekiwano wartości typu string.',
        invalidUnionType: 'Wartość nie pasuje do żadnego z dozwolonych typów.',
        minGreaterThanMax: 'Wartość minimalna nie może być większa niż maksymalna.',
        missingActionKey: 'W obiekcie akcji brakuje wymaganej właściwości.',
        missingColorProperty: 'Brakuje wymaganej właściwości koloru.',
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
        bar_effect: 'Efekt na pasku',
        bar_orientation: 'Orientacja paska',
        bar_position: 'Pozycja paska',
        bar_single_line: 'Info w jednej linii (overlay)',
        bar_size: 'Rozmiar paska',
        center_zero: 'Zero na środku',
        color: 'Kolor podstawowy',
        decimal: 'dziesiętny',
        disable_unit: 'Pokaż jednostkę',
        double_tap_action: 'Akcja przy podwójnym naciśnięciu',
        entity: 'Encja',
        force_circular_background: 'Wymuś okrągłe tło',
        hold_action: 'Akcja przy długim naciśnięciu',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcja przy podwójnym naciśnięciu ikony',
        icon_hold_action: 'Akcja przy długim naciśnięciu ikony',
        icon_tap_action: 'Akcja przy naciśnięciu ikony',
        layout: 'Układ karty',
        max_value: 'Wartość maksymalna',
        max_value_attribute: 'Atrybut (max_value)',
        max_value_entity: 'Wartość maksymalna',
        min_value: 'Wartość minimalna',
        name: 'Nazwa',
        percent: 'Procent',
        secondary: 'Informacja dodatkowa',
        tap_action: 'Akcja przy krótkim naciśnięciu',
        text_shadow: 'Dodaj cień tekstu (overlay)',
        theme: 'Motyw',
        toggle_icon: 'Pokaż ikonę',
        toggle_name: 'Pokaż nazwę',
        toggle_progress_bar: 'Pokaż pasek postępu',
        toggle_secondary_info: 'Pokaż informację dodatkową',
        toggle_value: 'Pokaż wartość',
        unit: 'Jednostka',
        use_max_entity: 'Użyj encji dla wartości maksymalnej'
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
          top: 'Pasek na górze (overlay)'
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
        }
      }
    }
  },
  'pt-BR': {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        discontinuousRange: 'O intervalo definido é descontínuo.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidCustomThemeArray: 'O tema personalizado deve ser um array.',
        invalidCustomThemeEntry: 'Uma ou mais entradas do tema personalizado são inválidas.',
        invalidDecimal: 'O valor deve ser um número inteiro positivo.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formado.',
        invalidEnumValue: 'O valor fornecido não faz parte das opções permitidas.',
        invalidIconType: 'O tipo de ícone especificado é inválido ou desconhecido.',
        invalidMaxValue: 'O valor máximo é inválido ou excede os limites permitidos.',
        invalidMinValue: 'O valor mínimo é inválido ou abaixo dos limites permitidos.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. O tema padrão será usado.',
        invalidTypeArray: 'Um valor do tipo array era esperado.',
        invalidTypeBoolean: 'Um valor do tipo booleano era esperado.',
        invalidTypeNumber: 'Um valor do tipo número era esperado.',
        invalidTypeObject: 'Um valor do tipo objeto era esperado.',
        invalidTypeString: 'Um valor do tipo string era esperado.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        minGreaterThanMax: 'O valor mínimo não pode ser maior que o valor máximo.',
        missingActionKey: 'Uma chave obrigatória está ausente no objeto de ação.',
        missingColorProperty: 'Uma propriedade de cor obrigatória está ausente.',
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
        bar_effect: 'Efeito na barra',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Informações em uma linha (overlay)',
        bar_size: 'Tamanho da barra',
        center_zero: 'Zero no centro',
        color: 'Cor do ícone',
        decimal: 'Decimal',
        disable_unit: 'Mostrar unidade',
        double_tap_action: 'Ação ao tocar duas vezes',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hold_action: 'Ação ao manter pressionado',
        icon: 'Ícone',
        icon_double_tap_action: 'Ação ao tocar duas vezes no ícone',
        icon_hold_action: 'Ação ao manter pressionado o ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do cartão',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        max_value_entity: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Porcentagem',
        secondary: 'Informação secundária',
        tap_action: 'Ação ao tocar',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostrar ícone',
        toggle_name: 'Mostrar nome',
        toggle_progress_bar: 'Mostrar barra de progresso',
        toggle_secondary_info: 'Mostrar informações secundárias',
        toggle_value: 'Mostrar valor',
        unit: 'Unidade',
        use_max_entity: 'Usar entidade para valor máximo'
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
          overlay: 'Barra sobre o conteúdo (overlay)'
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical'
        }
      }
    }
  },
  pt: {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        discontinuousRange: 'O intervalo definido é descontínuo.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidCustomThemeArray: 'O tema personalizado deve ser um array.',
        invalidCustomThemeEntry: 'Uma ou mais entradas no tema personalizado são inválidas.',
        invalidDecimal: 'O valor deve ser um número decimal válido.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formatado.',
        invalidEnumValue: 'O valor fornecido não é uma opção válida.',
        invalidIconType: 'O tipo de ícone especificado é inválido ou desconhecido.',
        invalidMaxValue: 'O valor máximo é inválido ou acima do permitido.',
        invalidMinValue: 'O valor mínimo é inválido ou abaixo do permitido.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formatado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. Tema padrão será usado.',
        invalidTypeArray: 'Esperava-se um valor do tipo array.',
        invalidTypeBoolean: 'Esperava-se um valor do tipo booleano.',
        invalidTypeNumber: 'Esperava-se um valor do tipo número.',
        invalidTypeObject: 'Esperava-se um valor do tipo objeto.',
        invalidTypeString: 'Esperava-se um valor do tipo string.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        minGreaterThanMax: 'O valor mínimo não pode ser maior que o valor máximo.',
        missingActionKey: 'Uma chave obrigatória está faltando no objeto de ação.',
        missingColorProperty: 'Uma propriedade de cor obrigatória está faltando.',
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
        bar_color: 'Cor para a barra',
        bar_effect: 'Efeito na barra',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Info numa só linha (overlay)',
        bar_size: 'Tamanho da barra',
        center_zero: 'Zero ao centro',
        color: 'Cor primária',
        decimal: 'decimal',
        disable_unit: 'Mostrar unidade',
        double_tap_action: 'Ação ao toque duplo',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hold_action: 'Ação ao toque longo',
        icon: 'Ícone',
        icon_double_tap_action: 'Ação ao tocar duplamente no ícone',
        icon_hold_action: 'Ação ao manter o toque no ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do cartão',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        max_value_entity: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Percentagem',
        secondary: 'Informação secundária',
        tap_action: 'Ação ao toque curto',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme: 'Tema',
        toggle_icon: 'Mostrar ícone',
        toggle_name: 'Mostrar nome',
        toggle_progress_bar: 'Mostrar barra de progresso',
        toggle_secondary_info: 'Mostrar informação secundária',
        toggle_value: 'Mostrar valor',
        unit: 'Unidade',
        use_max_entity: 'Usar entidade para o valor máximo'
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
          top: 'Barra em cima (overlay)'
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
        }
      }
    }
  },
  ro: {
    card: {
      msg: {
        appliedDefaultValue: 'A fost aplicată automat o valoare implicită.',
        attributeNotFound: 'Atributul nu a fost găsit în Home Assistant.',
        discontinuousRange: 'Intervalul definit este discontinuu.',
        entityNotFound: 'Entitatea nu a fost găsită în Home Assistant.',
        invalidActionObject: 'Obiectul acțiune este invalid sau structurat incorect.',
        invalidCustomThemeArray: 'Tema personalizată trebuie să fie un array.',
        invalidCustomThemeEntry: 'Una sau mai multe intrări din temă sunt invalide.',
        invalidDecimal: 'Valoarea trebuie să fie un număr zecimal valid.',
        invalidEntityId: 'ID-ul entității este invalid sau formatat greșit.',
        invalidEnumValue: 'Valoarea furnizată nu este una dintre opțiunile permise.',
        invalidIconType: 'Tipul de pictogramă specificat este invalid sau necunoscut.',
        invalidMaxValue: 'Valoarea maximă este invalidă sau prea mare.',
        invalidMinValue: 'Valoarea minimă este invalidă sau prea mică.',
        invalidStateContent: 'Conținutul stării este invalid sau formatat greșit.',
        invalidStateContentEntry: 'Una sau mai multe intrări în conținutul stării sunt invalide.',
        invalidTheme: 'Tema specificată este necunoscută. Va fi utilizată tema implicită.',
        invalidTypeArray: 'Se aștepta o valoare de tip array.',
        invalidTypeBoolean: 'Se aștepta o valoare de tip boolean.',
        invalidTypeNumber: 'Se aștepta o valoare de tip număr.',
        invalidTypeObject: 'Se aștepta o valoare de tip obiect.',
        invalidTypeString: 'Se aștepta o valoare de tip șir.',
        invalidUnionType: 'Valoarea nu se potrivește niciunui tip permis.',
        minGreaterThanMax: 'Valoarea minimă nu poate fi mai mare decât valoarea maximă.',
        missingActionKey: 'Lipsește o cheie necesară în obiectul acțiune.',
        missingColorProperty: 'Lipsește o proprietate de culoare necesară.',
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
        bar_effect: 'Efect pe bară',
        bar_orientation: 'Orientarea barei',
        bar_position: 'Poziția barei',
        bar_single_line: 'Info pe un singur rând (overlay)',
        bar_size: 'Dimensiunea barei',
        center_zero: 'Zero la centru',
        color: 'Culoare principală',
        decimal: 'zecimal',
        disable_unit: 'Afișează unitatea',
        double_tap_action: 'Acțiune la apăsare dublă',
        entity: 'Entitate',
        force_circular_background: 'Forțează fundal circular',
        hold_action: 'Acțiune la apăsare lungă',
        icon: 'Pictogramă',
        icon_double_tap_action: 'Acțiune la apăsare dublă a pictogramei',
        icon_hold_action: 'Acțiune la apăsare lungă a pictogramei',
        icon_tap_action: 'Acțiune la apăsarea pictogramei',
        layout: 'Aspectul cardului',
        max_value: 'Valoare maximă',
        max_value_attribute: 'Atribut (max_value)',
        max_value_entity: 'Valoare maximă',
        min_value: 'Valoare minimă',
        name: 'Nume',
        percent: 'Procent',
        secondary: 'Informație secundară',
        tap_action: 'Acțiune la apăsare scurtă',
        text_shadow: 'Adaugă umbră textului (overlay)',
        theme: 'Temă',
        toggle_icon: 'Afișează pictograma',
        toggle_name: 'Afișează numele',
        toggle_progress_bar: 'Afișează bara de progres',
        toggle_secondary_info: 'Afișează informația secundară',
        toggle_value: 'Afișează valoarea',
        unit: 'Unitate',
        use_max_entity: 'Folosește entitate pentru valoarea maximă'
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
          top: 'Bară sus (overlay)'
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
        }
      }
    }
  },
  ru: {
    card: {
      msg: {
        appliedDefaultValue: 'Значение по умолчанию было применено автоматически.',
        attributeNotFound: 'Атрибут не найден в Home Assistant.',
        discontinuousRange: 'Определённый диапазон является прерывистым.',
        entityNotFound: 'Сущность не найдена в Home Assistant.',
        invalidActionObject: 'Объект действия недействителен или неправильно структурирован.',
        invalidCustomThemeArray: 'Пользовательская тема должна быть массивом.',
        invalidCustomThemeEntry: 'Одна или несколько записей в пользовательской теме недействительны.',
        invalidDecimal: 'Значение должно быть действительным десятичным числом.',
        invalidEntityId: 'Идентификатор сущности недействителен или неправильно сформирован.',
        invalidEnumValue: 'Предоставленное значение не является одним из разрешённых вариантов.',
        invalidIconType: 'Указанный тип иконки недействителен или не распознан.',
        invalidMaxValue: 'Максимальное значение недействительно или выше разрешённых пределов.',
        invalidMinValue: 'Минимальное значение недействительно или ниже разрешённых пределов.',
        invalidStateContent: 'Содержимое состояния недействительно или неправильно сформировано.',
        invalidStateContentEntry: 'Одна или несколько записей в содержимом состояния недействительны.',
        invalidTheme: 'Указанная тема неизвестна. Будет использована тема по умолчанию.',
        invalidTypeArray: 'Ожидается значение типа массив.',
        invalidTypeBoolean: 'Ожидается значение логического типа.',
        invalidTypeNumber: 'Ожидается значение числового типа.',
        invalidTypeObject: 'Ожидается значение типа объект.',
        invalidTypeString: 'Ожидается значение строкового типа.',
        invalidUnionType: 'Значение не соответствует ни одному из разрешённых типов.',
        minGreaterThanMax: 'Минимальное значение не может быть больше максимального значения.',
        missingActionKey: 'В объекте действия отсутствует обязательный ключ.',
        missingColorProperty: 'Отсутствует обязательное свойство цвета.',
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
        bar_effect: 'Эффект на полосе',
        bar_orientation: 'Ориентация полосы',
        bar_position: 'Положение полосы',
        bar_single_line: 'Информация в одну строку (overlay)',
        bar_size: 'Размер полосы',
        center_zero: 'Ноль по центру',
        color: 'Основной цвет',
        decimal: 'десятичные',
        disable_unit: 'Показать единицу измерения',
        double_tap_action: 'Поведение при двойном нажатии',
        entity: 'Сущность',
        force_circular_background: 'Принудительный круглый фон',
        hold_action: 'Поведение при длительном нажатии',
        icon: 'Иконка',
        icon_double_tap_action: 'Поведение при двойном нажатии на иконку',
        icon_hold_action: 'Поведение при длительном нажатии на иконку',
        icon_tap_action: 'Поведение при нажатии на иконку',
        layout: 'Макет карточки',
        max_value: 'Максимальное значение',
        max_value_attribute: 'Атрибут (max_value)',
        max_value_entity: 'Максимальное значение',
        min_value: 'Минимальное значение',
        name: 'Название',
        percent: 'Процент',
        secondary: 'Дополнительная информация',
        tap_action: 'Поведение при нажатии',
        text_shadow: 'Добавить тень к тексту (overlay)',
        theme: 'Тема',
        toggle_icon: 'Показать иконку',
        toggle_name: 'Показать название',
        toggle_progress_bar: 'Показать полосу прогресса',
        toggle_secondary_info: 'Показать дополнительную информацию',
        toggle_value: 'Показать значение',
        unit: 'Единица измерения',
        use_max_entity: 'Использовать сущность для максимального значения'
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
          top: 'Полоса вверху (overlay)'
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
        }
      }
    }
  },
  sk: {
    card: {
      msg: {
        appliedDefaultValue: 'Predvolená hodnota bola automaticky použitá.',
        attributeNotFound: 'Atribút sa nenašiel v Home Assistant.',
        discontinuousRange: 'Zadaný rozsah nie je spojitý.',
        entityNotFound: 'Entita sa nenašla v Home Assistant.',
        invalidActionObject: 'Objekt akcie je neplatný alebo nesprávne štruktúrovaný.',
        invalidCustomThemeArray: 'Vlastná téma musí byť pole.',
        invalidCustomThemeEntry: 'Jedna alebo viac položiek vlastnej témy je neplatných.',
        invalidDecimal: 'Hodnota musí byť kladné celé číslo.',
        invalidEntityId: 'ID entity je neplatné alebo nesprávne.',
        invalidEnumValue: 'Zadaná hodnota nie je súčasťou povolených možností.',
        invalidIconType: 'Zadaný typ ikony je neplatný alebo neznámy.',
        invalidMaxValue: 'Maximálna hodnota je neplatná alebo nad limitom.',
        invalidMinValue: 'Minimálna hodnota je neplatná alebo pod limitom.',
        invalidStateContent: 'Obsah stavu je neplatný alebo nesprávny.',
        invalidStateContentEntry: 'Jedna alebo viac položiek obsahu stavu je neplatných.',
        invalidTheme: 'Zadaná téma je neznáma. Použije sa predvolená téma.',
        invalidTypeArray: 'Očakávala sa hodnota typu pole.',
        invalidTypeBoolean: 'Očakávala sa hodnota typu boolean.',
        invalidTypeNumber: 'Očakávala sa hodnota typu číslo.',
        invalidTypeObject: 'Očakávala sa hodnota typu objekt.',
        invalidTypeString: 'Očakávala sa hodnota typu reťazec.',
        invalidUnionType: 'Hodnota nezodpovedá žiadnemu povolenému typu.',
        minGreaterThanMax: 'Minimálna hodnota nemôže byť väčšia ako maximálna.',
        missingActionKey: 'Chýba povinný kľúč v objekte akcie.',
        missingColorProperty: 'Chýba povinná vlastnosť farby.',
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
        bar_effect: 'Efekt lišty',
        bar_orientation: 'Orientácia lišty',
        bar_position: 'Pozícia lišty',
        bar_single_line: 'Informácie na jednej línii (overlay)',
        bar_size: 'Veľkosť lišty',
        center_zero: 'Nula v strede',
        color: 'Farba ikony',
        decimal: 'Desatinné',
        disable_unit: 'Zobraziť jednotku',
        double_tap_action: 'Akcia pri dvojitom ťuknutí',
        entity: 'Entita',
        force_circular_background: 'Vynútiť kruhové pozadie',
        hold_action: 'Akcia pri dlhom podržaní',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcia pri dvojitom ťuknutí ikony',
        icon_hold_action: 'Akcia pri dlhom podržaní ikony',
        icon_tap_action: 'Akcia pri ťuknutí ikony',
        layout: 'Rozloženie karty',
        max_value: 'Maximálna hodnota',
        max_value_attribute: 'Atribút (max_value)',
        max_value_entity: 'Maximálna hodnota',
        min_value: 'Minimálna hodnota',
        name: 'Názov',
        percent: 'Percento',
        secondary: 'Sekundárna informácia',
        tap_action: 'Akcia pri ťuknutí',
        text_shadow: 'Pridať tieň textu (overlay)',
        theme: 'Téma',
        toggle_icon: 'Zobraziť ikonu',
        toggle_name: 'Zobraziť názov',
        toggle_progress_bar: 'Zobraziť pruh postupu',
        toggle_secondary_info: 'Zobraziť sekundárne info',
        toggle_value: 'Zobraziť hodnotu',
        unit: 'Jednotka',
        use_max_entity: 'Použiť entitu pre max hodnotu'
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
          overlay: 'Pruh cez obsah (overlay)'
        },
        layout: {
          horizontal: 'Horizontálne (predvolené)',
          vertical: 'Vertikálne'
        }
      }
    }
  },
  sl: {
    card: {
      msg: {
        appliedDefaultValue: 'Privzeta vrednost je bila samodejno uporabljena.',
        attributeNotFound: 'Atribut ni bil najden v Home Assistant.',
        discontinuousRange: 'Določeno območje ni neprekinjeno.',
        entityNotFound: 'Entiteta ni bila najdena v Home Assistant.',
        invalidActionObject: 'Objekt akcije je neveljaven ali napačno strukturiran.',
        invalidCustomThemeArray: 'Prilagojena tema mora biti polje.',
        invalidCustomThemeEntry: 'Ena ali več vnosov prilagojene teme je neveljavnih.',
        invalidDecimal: 'Vrednost mora biti pozitivno celo število.',
        invalidEntityId: 'ID entitete je neveljaven ali napačen.',
        invalidEnumValue: 'Podana vrednost ni med dovoljenimi možnostmi.',
        invalidIconType: 'Podana vrsta ikone je neveljavna ali neznana.',
        invalidMaxValue: 'Največja vrednost je neveljavna ali presega omejitve.',
        invalidMinValue: 'Najmanjša vrednost je neveljavna ali pod dovoljenimi mejami.',
        invalidStateContent: 'Vsebina stanja je neveljavna ali napačno oblikovana.',
        invalidStateContentEntry: 'Eden ali več vnosov vsebine stanja je neveljavno.',
        invalidTheme: 'Določena tema je neznana. Uporabila se bo privzeta tema.',
        invalidTypeArray: 'Pričakovana je bila vrednost tipa polje.',
        invalidTypeBoolean: 'Pričakovana je bila vrednost tipa boolean.',
        invalidTypeNumber: 'Pričakovana je bila vrednost tipa število.',
        invalidTypeObject: 'Pričakovana je bila vrednost tipa objekt.',
        invalidTypeString: 'Pričakovana je bila vrednost tipa niz.',
        invalidUnionType: 'Vrednost ne ustreza nobeni dovoljeni vrsti.',
        minGreaterThanMax: 'Najmanjša vrednost ne sme biti večja od največje.',
        missingActionKey: 'Manjka obvezni ključ v objektu akcije.',
        missingColorProperty: 'Manjka obvezna lastnost barve.',
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
        bar_effect: 'Učinek vrstice',
        bar_orientation: 'Usmeritev vrstice',
        bar_position: 'Pozicija vrstice',
        bar_single_line: 'Informacije v eni vrstici (overlay)',
        bar_size: 'Velikost vrstice',
        center_zero: 'Ni ničle na sredini',
        color: 'Barva ikone',
        decimal: 'Decimalno',
        disable_unit: 'Prikaži enoto',
        double_tap_action: 'Akcija ob dvojni tap',
        entity: 'Entiteta',
        force_circular_background: 'Prisili krožno ozadje',
        hold_action: 'Akcija ob dolgem pritisku',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcija ob dvojni tap ikone',
        icon_hold_action: 'Akcija ob dolgem pritisku ikone',
        icon_tap_action: 'Akcija ob tap ikone',
        layout: 'Postavitev kartice',
        max_value: 'Največja vrednost',
        max_value_attribute: 'Atribut (max_value)',
        max_value_entity: 'Največja vrednost',
        min_value: 'Najmanjša vrednost',
        name: 'Ime',
        percent: 'Odstotek',
        secondary: 'Sekundarne informacije',
        tap_action: 'Akcija ob tap',
        text_shadow: 'Dodaj senco besedila (overlay)',
        theme: 'Tema',
        toggle_icon: 'Prikaži ikono',
        toggle_name: 'Prikaži ime',
        toggle_progress_bar: 'Prikaži vrstico napredka',
        toggle_secondary_info: 'Prikaži sekundarne informacije',
        toggle_value: 'Prikaži vrednost',
        unit: 'Enota',
        use_max_entity: 'Uporabi entiteto za max vrednost'
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
          overlay: 'Vrstica čez vsebino (overlay)'
        },
        layout: {
          horizontal: 'Horizontalno (privzeto)',
          vertical: 'Vertikalno'
        }
      }
    }
  },
  sv: {
    card: {
      msg: {
        appliedDefaultValue: 'Ett standardvärde har tillämpats automatiskt.',
        attributeNotFound: 'Attributet kunde inte hittas i Home Assistant.',
        discontinuousRange: 'Det angivna intervallet är inte sammanhängande.',
        entityNotFound: 'Enheten kunde inte hittas i Home Assistant.',
        invalidActionObject: 'Åtgärdsobjektet är ogiltigt eller felstrukturerat.',
        invalidCustomThemeArray: 'Det anpassade temat måste vara en array.',
        invalidCustomThemeEntry: 'En eller flera poster i det anpassade temat är ogiltiga.',
        invalidDecimal: 'Värdet måste vara ett giltigt decimaltal.',
        invalidEntityId: 'Enhets-ID är ogiltigt eller felaktigt formaterat.',
        invalidEnumValue: 'Det angivna värdet är inte ett giltigt alternativ.',
        invalidIconType: 'Den angivna ikontypen är ogiltig eller okänd.',
        invalidMaxValue: 'Maximivärdet är ogiltigt eller för högt.',
        invalidMinValue: 'Minimivärdet är ogiltigt eller för lågt.',
        invalidStateContent: 'Tillståndsinnehållet är ogiltigt eller felaktigt.',
        invalidStateContentEntry: 'En eller flera poster i tillståndsinnehållet är ogiltiga.',
        invalidTheme: 'Det angivna temat är okänt. Standardtema används.',
        invalidTypeArray: 'Förväntade ett värde av typen array.',
        invalidTypeBoolean: 'Förväntade ett värde av typen boolean.',
        invalidTypeNumber: 'Förväntade ett värde av typen nummer.',
        invalidTypeObject: 'Förväntade ett värde av typen objekt.',
        invalidTypeString: 'Förväntade ett värde av typen sträng.',
        invalidUnionType: 'Värdet matchar inte något av de tillåtna typerna.',
        minGreaterThanMax: 'Minimivärdet kan inte vara större än maximivärdet.',
        missingActionKey: 'En obligatorisk nyckel saknas i åtgärdsobjektet.',
        missingColorProperty: 'En obligatorisk färgegenskap saknas.',
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
        bar_effect: 'Effekt på baren',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Position för baren',
        bar_single_line: 'Info på en rad (overlay)',
        bar_size: 'Barstorlek',
        center_zero: 'Noll i mitten',
        color: 'Primärfärg',
        decimal: 'decimal',
        disable_unit: 'Visa enhet',
        double_tap_action: 'Åtgärd vid dubbeltryck',
        entity: 'Enhet',
        force_circular_background: 'Tvinga cirkulär bakgrund',
        hold_action: 'Åtgärd vid långt tryck',
        icon: 'Ikon',
        icon_double_tap_action: 'Åtgärd vid dubbeltryck på ikonen',
        icon_hold_action: 'Åtgärd vid långt tryck på ikonen',
        icon_tap_action: 'Åtgärd vid tryck på ikonen',
        layout: 'Kortlayout',
        max_value: 'Maximalt värde',
        max_value_attribute: 'Attribut (max_value)',
        max_value_entity: 'Maximalt värde',
        min_value: 'Minsta värde',
        name: 'Namn',
        percent: 'Procent',
        secondary: 'Sekundär information',
        tap_action: 'Åtgärd vid kort tryck',
        text_shadow: 'Lägg till textskugga (overlay)',
        theme: 'Tema',
        toggle_icon: 'Visa ikon',
        toggle_name: 'Visa namn',
        toggle_progress_bar: 'Visa förloppsfält',
        toggle_secondary_info: 'Visa sekundär information',
        toggle_value: 'Visa värde',
        unit: 'Enhet',
        use_max_entity: 'Använd enhet för maximalt värde'
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
          top: 'Bar längst upp (overlay)'
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
        }
      }
    }
  },
  template: {
    card: {
      msg: {
        appliedDefaultValue: '',
        attributeNotFound: '',
        discontinuousRange: '',
        entityNotFound: '',
        invalidActionObject: '',
        invalidCustomThemeArray: '',
        invalidCustomThemeEntry: '',
        invalidDecimal: '',
        invalidEntityId: '',
        invalidEnumValue: '',
        invalidIconType: '',
        invalidMaxValue: '',
        invalidMinValue: '',
        invalidStateContent: '',
        invalidStateContentEntry: '',
        invalidTheme: '',
        invalidTypeArray: '',
        invalidTypeBoolean: '',
        invalidTypeNumber: '',
        invalidTypeObject: '',
        invalidTypeString: '',
        invalidUnionType: '',
        minGreaterThanMax: '',
        missingActionKey: '',
        missingColorProperty: '',
        missingRequiredProperty: ''
      }
    },
    editor: {
      title: {
        content: '',
        interaction: '',
        theme: ''
      },
      field: {
        attribute: '',
        badge_color: '',
        badge_icon: '',
        bar_color: '',
        bar_effect: '',
        bar_orientation: '',
        bar_position: '',
        bar_single_line: '',
        bar_size: '',
        center_zero: '',
        color: '',
        decimal: '',
        disable_unit: '',
        double_tap_action: '',
        entity: '',
        force_circular_background: '',
        hold_action: '',
        icon: '',
        icon_double_tap_action: '',
        icon_hold_action: '',
        icon_tap_action: '',
        layout: '',
        max_value: '',
        max_value_attribute: '',
        max_value_entity: '',
        min_value: '',
        name: '',
        percent: '',
        secondary: '',
        tap_action: '',
        text_shadow: '',
        theme: '',
        toggle_icon: '',
        toggle_name: '',
        toggle_progress_bar: '',
        toggle_secondary_info: '',
        toggle_value: '',
        unit: '',
        use_max_entity: ''
      },
      option: {
        theme: {
          optimal_when_low: '',
          optimal_when_high: '',
          light: '',
          temperature: '',
          humidity: '',
          pm25: '',
          voc: ''
        },
        bar_size: {
          small: '',
          medium: '',
          large: '',
          xlarge: ''
        },
        bar_orientation: {
          ltr: '',
          rtl: '',
          up: ''
        },
        bar_position: {
          default: '',
          below: '',
          top: '',
          bottom: '',
          overlay: ''
        },
        layout: {
          horizontal: '',
          vertical: ''
        }
      }
    }
  },
  th: {
    card: {
      msg: {
        appliedDefaultValue: 'ค่าเริ่มต้นถูกนำไปใช้โดยอัตโนมัติ',
        attributeNotFound: 'ไม่พบแอตทริบิวต์ใน HA',
        discontinuousRange: 'ช่วงที่กำหนดไม่ต่อเนื่อง',
        entityNotFound: 'ไม่พบเอนทิตีใน HA',
        invalidActionObject: 'ออบเจ็กต์แอ็กชันไม่ถูกต้องหรือโครงสร้างผิด',
        invalidCustomThemeArray: 'ธีมกำหนดเองต้องเป็นอาร์เรย์',
        invalidCustomThemeEntry: 'หนึ่งหรือหลายรายการในธีมกำหนดเองไม่ถูกต้อง',
        invalidDecimal: 'ค่าต้องเป็นตัวเลขทศนิยมที่ถูกต้อง',
        invalidEntityId: 'ID เอนทิตีไม่ถูกต้องหรือรูปแบบผิด',
        invalidEnumValue: 'ค่าที่ให้มาไม่ใช่หนึ่งในตัวเลือกที่อนุญาต',
        invalidIconType: 'ประเภทไอคอนที่ระบุไม่ถูกต้องหรือไม่รู้จัก',
        invalidMaxValue: 'ค่าสูงสุดไม่ถูกต้องหรือสูงกว่าขีดจำกัดที่อนุญาต',
        invalidMinValue: 'ค่าต่ำสุดไม่ถูกต้องหรือต่ำกว่าขีดจำกัดที่อนุญาต',
        invalidStateContent: 'เนื้อหาสถานะไม่ถูกต้องหรือรูปแบบผิด',
        invalidStateContentEntry: 'หนึ่งหรือหลายรายการในเนื้อหาสถานะไม่ถูกต้อง',
        invalidTheme: 'ธีมที่ระบุไม่รู้จัก จะใช้ธีมเริ่มต้น',
        invalidTypeArray: 'คาดหวังค่าประเภทอาร์เรย์',
        invalidTypeBoolean: 'คาดหวังค่าประเภทบูลีน',
        invalidTypeNumber: 'คาดหวังค่าประเภทตัวเลข',
        invalidTypeObject: 'คาดหวังค่าประเภทออบเจ็กต์',
        invalidTypeString: 'คาดหวังค่าประเภทสตริง',
        invalidUnionType: 'ค่าไม่ตรงกับประเภทที่อนุญาตใด ๆ',
        minGreaterThanMax: 'ค่าต่ำสุดไม่สามารถมากกว่าค่าสูงสุด',
        missingActionKey: 'ขาดคีย์ที่จำเป็นในออบเจ็กต์แอ็กชัน',
        missingColorProperty: 'ขาดคุณสมบัติสีที่จำเป็น',
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
        bar_effect: 'เอฟเฟกต์บนแถบ',
        bar_orientation: 'การวางแนวแถบ',
        bar_position: 'ตำแหน่งแถบ',
        bar_single_line: 'ข้อมูลในบรรทัดเดียว (overlay)',
        bar_size: 'ขนาดแถบ',
        center_zero: 'ศูนย์ที่กึ่งกลาง',
        color: 'สีหลัก',
        decimal: 'ทศนิยม',
        disable_unit: 'แสดงหน่วย',
        double_tap_action: 'พฤติกรรมการแตะสองครั้ง',
        entity: 'เอนทิตี',
        force_circular_background: 'บังคับพื้นหลังวงกลม',
        hold_action: 'พฤติกรรมการกด',
        icon: 'ไอคอน',
        icon_double_tap_action: 'พฤติกรรมการแตะไอคอนสองครั้ง',
        icon_hold_action: 'พฤติกรรมการกดไอคอน',
        icon_tap_action: 'พฤติกรรมการแตะไอคอน',
        layout: 'เลย์เอาต์การ์ด',
        max_value: 'ค่าสูงสุด',
        max_value_attribute: 'แอตทริบิวต์ (max_value)',
        max_value_entity: 'ค่าสูงสุด',
        min_value: 'ค่าต่ำสุด',
        name: 'ชื่อ',
        percent: 'เปอร์เซ็นต์',
        secondary: 'ข้อมูลรอง',
        tap_action: 'พฤติกรรมการแตะ',
        text_shadow: 'เพิ่มเงาให้ข้อความ (overlay)',
        theme: 'ธีม',
        toggle_icon: 'แสดงไอคอน',
        toggle_name: 'แสดงชื่อ',
        toggle_progress_bar: 'แสดงแถบความคืบหน้า',
        toggle_secondary_info: 'แสดงข้อมูลรอง',
        toggle_value: 'แสดงค่า',
        unit: 'หน่วย',
        use_max_entity: 'ใช้เอนทิตีสำหรับค่าสูงสุด'
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
          top: 'แถบด้านบน (overlay)'
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
        }
      }
    }
  },
  tr: {
    card: {
      msg: {
        appliedDefaultValue: 'Varsayılan değer otomatik olarak uygulandı.',
        attributeNotFound: 'Öznitelik Home Assistant\'ta bulunamadı.',
        discontinuousRange: 'Tanımlanan aralık süreksizdir.',
        entityNotFound: 'Varlık Home Assistant\'ta bulunamadı.',
        invalidActionObject: 'Eylem nesnesi geçersiz veya hatalı yapılandırılmış.',
        invalidCustomThemeArray: 'Özel tema bir dizi olmalıdır.',
        invalidCustomThemeEntry: 'Özel temadaki bir veya daha fazla giriş geçersiz.',
        invalidDecimal: 'Değer geçerli bir ondalık sayı olmalıdır.',
        invalidEntityId: 'Varlık kimliği geçersiz veya hatalı biçimlendirilmiş.',
        invalidEnumValue: 'Sağlanan değer izin verilen seçeneklerden biri değil.',
        invalidIconType: 'Belirtilen simge türü geçersiz veya tanınmıyor.',
        invalidMaxValue: 'Maksimum değer geçersiz veya sınırların üzerinde.',
        invalidMinValue: 'Minimum değer geçersiz veya sınırların altında.',
        invalidStateContent: 'Durum içeriği geçersiz veya hatalı biçimlendirilmiş.',
        invalidStateContentEntry: 'Durum içeriğindeki bir veya daha fazla giriş geçersiz.',
        invalidTheme: 'Belirtilen tema bilinmiyor. Varsayılan tema kullanılacak.',
        invalidTypeArray: 'Dizi türünde bir değer bekleniyordu.',
        invalidTypeBoolean: 'Boolean türünde bir değer bekleniyordu.',
        invalidTypeNumber: 'Sayı türünde bir değer bekleniyordu.',
        invalidTypeObject: 'Nesne türünde bir değer bekleniyordu.',
        invalidTypeString: 'Dize (string) türünde bir değer bekleniyordu.',
        invalidUnionType: 'Değer izin verilen türlerden hiçbirine uymuyor.',
        minGreaterThanMax: 'Minimum değer maksimum değerden büyük olamaz.',
        missingActionKey: 'Eylem nesnesinde gerekli bir anahtar eksik.',
        missingColorProperty: 'Gerekli bir renk özelliği eksik.',
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
        bar_effect: 'Çubuk efekti',
        bar_orientation: 'Çubuk yönü',
        bar_position: 'Çubuk konumu',
        bar_single_line: 'Bilgiyi tek satırda göster (overlay)',
        bar_size: 'Çubuk boyutu',
        center_zero: 'Sıfırı ortala',
        color: 'Birincil renk',
        decimal: 'ondalık',
        disable_unit: 'Birimi göster',
        double_tap_action: 'Çift dokunma davranışı',
        entity: 'Varlık',
        force_circular_background: 'Dairesel arka planı zorla',
        hold_action: 'Uzun basma davranışı',
        icon: 'Simge',
        icon_double_tap_action: 'Simgeye çift dokunma davranışı',
        icon_hold_action: 'Simgeye uzun basma davranışı',
        icon_tap_action: 'Simgeye dokunma davranışı',
        layout: 'Kart düzeni',
        max_value: 'Maksimum değer',
        max_value_attribute: 'Öznitelik (max_value)',
        max_value_entity: 'Maksimum değer',
        min_value: 'Minimum değer',
        name: 'Ad',
        percent: 'Yüzde',
        secondary: 'İkincil bilgi',
        tap_action: 'Kısa dokunma davranışı',
        text_shadow: 'Metne gölge ekle (overlay)',
        theme: 'Tema',
        toggle_icon: 'Simgeyi göster',
        toggle_name: 'Adı göster',
        toggle_progress_bar: 'İlerleme çubuğunu göster',
        toggle_secondary_info: 'İkincil bilgiyi göster',
        toggle_value: 'Değeri göster',
        unit: 'Birim',
        use_max_entity: 'Maksimum değer için varlık kullan'
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
          top: 'Üstte çubuk (overlay)'
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
        }
      }
    }
  },
  uk: {
    card: {
      msg: {
        appliedDefaultValue: 'Значення за замовчуванням було застосовано автоматично.',
        attributeNotFound: 'Атрибут не знайдено в HA.',
        discontinuousRange: 'Визначений діапазон є розривним.',
        entityNotFound: 'Сутність не знайдена в HA.',
        invalidActionObject: 'Об\'єкт дії недійсний або неправильно структурований.',
        invalidCustomThemeArray: 'Користувацька тема повинна бути масивом.',
        invalidCustomThemeEntry: 'Один або кілька записів у користувацькій темі недійсні.',
        invalidDecimal: 'Значення повинно бути дійсним десятковим числом.',
        invalidEntityId: 'ID сутності недійсний або неправильно сформований.',
        invalidEnumValue: 'Надане значення не є одним з дозволених варіантів.',
        invalidIconType: 'Зазначений тип іконки недійсний або нерозпізнаний.',
        invalidMaxValue: 'Максимальне значення недійсне або вище дозволених меж.',
        invalidMinValue: 'Мінімальне значення недійсне або нижче дозволених меж.',
        invalidStateContent: 'Вміст стану недійсний або неправильно сформований.',
        invalidStateContentEntry: 'Один або кілька записів у вмісті стану недійсні.',
        invalidTheme: 'Зазначена тема невідома. Буде використана тема за замовчуванням.',
        invalidTypeArray: 'Очікується значення типу масив.',
        invalidTypeBoolean: 'Очікується значення типу булевий.',
        invalidTypeNumber: 'Очікується значення типу число.',
        invalidTypeObject: 'Очікується значення типу об\'єкт.',
        invalidTypeString: 'Очікується значення типу рядок.',
        invalidUnionType: 'Значення не відповідає жодному з дозволених типів.',
        minGreaterThanMax: 'Мінімальне значення не може бути більшим за максимальне.',
        missingActionKey: 'Відсутній обов\'язковий ключ в об\'єкті дії.',
        missingColorProperty: 'Відсутня обов\'язкова властивість кольору.',
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
        bar_effect: 'Ефект на панелі',
        bar_orientation: 'Орієнтація панелі',
        bar_position: 'Положення панелі',
        bar_single_line: 'Інформація в один рядок (overlay)',
        bar_size: 'Розмір панелі',
        center_zero: 'Нуль по центру',
        color: 'Основний колір',
        decimal: 'десятковий',
        disable_unit: 'Показати одиницю',
        double_tap_action: 'Поведінка при подвійному дотику',
        entity: 'Сутність',
        force_circular_background: 'Примусовий круглий фон',
        hold_action: 'Поведінка при утриманні',
        icon: 'Іконка',
        icon_double_tap_action: 'Поведінка подвійного дотику іконки',
        icon_hold_action: 'Поведінка утримання іконки',
        icon_tap_action: 'Поведінка дотику іконки',
        layout: 'Розташування картки',
        max_value: 'Максимальне значення',
        max_value_attribute: 'Атрибут (max_value)',
        max_value_entity: 'Максимальне значення',
        min_value: 'Мінімальне значення',
        name: 'Назва',
        percent: 'Відсоток',
        secondary: 'Додаткова інформація',
        tap_action: 'Поведінка при дотику',
        text_shadow: 'Додати тінь до тексту (overlay)',
        theme: 'Тема',
        toggle_icon: 'Показати іконку',
        toggle_name: 'Показати назву',
        toggle_progress_bar: 'Показати панель прогресу',
        toggle_secondary_info: 'Показати додаткову інформацію',
        toggle_value: 'Показати значення',
        unit: 'Одиниця',
        use_max_entity: 'Використовувати сутність для максимального значення'
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
          top: 'Панель зверху (overlay)'
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
        }
      }
    }
  },
  vi: {
    card: {
      msg: {
        appliedDefaultValue: 'Một giá trị mặc định đã được áp dụng tự động.',
        attributeNotFound: 'Không tìm thấy thuộc tính trong HA.',
        discontinuousRange: 'Phạm vi được xác định không liên tục.',
        entityNotFound: 'Không tìm thấy thực thể trong HA.',
        invalidActionObject: 'Đối tượng hành động không hợp lệ hoặc cấu trúc không đúng.',
        invalidCustomThemeArray: 'Chủ đề tùy chỉnh phải là một mảng.',
        invalidCustomThemeEntry: 'Một hoặc nhiều mục trong chủ đề tùy chỉnh không hợp lệ.',
        invalidDecimal: 'Giá trị phải là một số thập phân hợp lệ.',
        invalidEntityId: 'ID thực thể không hợp lệ hoặc không đúng định dạng.',
        invalidEnumValue: 'Giá trị được cung cấp không nằm trong các tùy chọn được phép.',
        invalidIconType: 'Loại biểu tượng được chỉ định không hợp lệ hoặc không được nhận dạng.',
        invalidMaxValue: 'Giá trị tối đa không hợp lệ hoặc vượt quá giới hạn cho phép.',
        invalidMinValue: 'Giá trị tối thiểu không hợp lệ hoặc dưới giới hạn cho phép.',
        invalidStateContent: 'Nội dung trạng thái không hợp lệ hoặc không đúng định dạng.',
        invalidStateContentEntry: 'Một hoặc nhiều mục trong nội dung trạng thái không hợp lệ.',
        invalidTheme: 'Chủ đề được chỉ định không xác định. Chủ đề mặc định sẽ được sử dụng.',
        invalidTypeArray: 'Mong đợi một giá trị kiểu mảng.',
        invalidTypeBoolean: 'Mong đợi một giá trị kiểu boolean.',
        invalidTypeNumber: 'Mong đợi một giá trị kiểu số.',
        invalidTypeObject: 'Mong đợi một giá trị kiểu đối tượng.',
        invalidTypeString: 'Mong đợi một giá trị kiểu chuỗi.',
        invalidUnionType: 'Giá trị không khớp với bất kỳ loại nào được phép.',
        minGreaterThanMax: 'Giá trị tối thiểu không thể lớn hơn giá trị tối đa.',
        missingActionKey: 'Một khóa bắt buộc bị thiếu trong đối tượng hành động.',
        missingColorProperty: 'Một thuộc tính màu bắt buộc bị thiếu.',
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
        bar_effect: 'Hiệu ứng thanh',
        bar_orientation: 'Hướng thanh',
        bar_position: 'Vị trí thanh',
        bar_single_line: 'Thông tin trên một dòng (overlay)',
        bar_size: 'Kích thước thanh',
        center_zero: 'Không ở giữa',
        color: 'Màu chính',
        decimal: 'thập phân',
        disable_unit: 'Hiển thị đơn vị',
        double_tap_action: 'Hành vi chạm đôi',
        entity: 'Thực thể',
        force_circular_background: 'Buộc nền hình tròn',
        hold_action: 'Hành vi giữ',
        icon: 'Biểu tượng',
        icon_double_tap_action: 'Hành vi chạm đôi biểu tượng',
        icon_hold_action: 'Hành vi giữ biểu tượng',
        icon_tap_action: 'Hành vi chạm biểu tượng',
        layout: 'Bố cục thẻ',
        max_value: 'Giá trị tối đa',
        max_value_attribute: 'Thuộc tính (max_value)',
        max_value_entity: 'Giá trị tối đa',
        min_value: 'Giá trị tối thiểu',
        name: 'Tên',
        percent: 'Phần trăm',
        secondary: 'Thông tin phụ',
        tap_action: 'Hành vi chạm',
        text_shadow: 'Thêm bóng cho văn bản (overlay)',
        theme: 'Chủ đề',
        toggle_icon: 'Hiển thị biểu tượng',
        toggle_name: 'Hiển thị tên',
        toggle_progress_bar: 'Hiển thị thanh tiến trình',
        toggle_secondary_info: 'Hiển thị thông tin phụ',
        toggle_value: 'Hiển thị giá trị',
        unit: 'Đơn vị',
        use_max_entity: 'Sử dụng thực thể cho giá trị tối đa'
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
          top: 'Thanh ở trên cùng (overlay)'
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
        }
      }
    }
  },
  'zh-Hans': {
    card: {
      msg: {
        appliedDefaultValue: '默认值已自动应用。',
        attributeNotFound: '在 Home Assistant 中未找到属性。',
        discontinuousRange: '定义的范围不连续。',
        entityNotFound: '在 Home Assistant 中未找到实体。',
        invalidActionObject: '操作对象无效或结构错误。',
        invalidCustomThemeArray: '自定义主题必须为数组。',
        invalidCustomThemeEntry: '自定义主题中的一项或多项无效。',
        invalidDecimal: '值必须为有效的小数。',
        invalidEntityId: '实体 ID 无效或格式错误。',
        invalidEnumValue: '提供的值不在允许选项内。',
        invalidIconType: '指定的图标类型无效或无法识别。',
        invalidMaxValue: '最大值无效或超出允许范围。',
        invalidMinValue: '最小值无效或低于允许范围。',
        invalidStateContent: '状态内容无效或格式错误。',
        invalidStateContentEntry: '状态内容中的一项或多项无效。',
        invalidTheme: '指定的主题未知，将使用默认主题。',
        invalidTypeArray: '应为数组类型的值。',
        invalidTypeBoolean: '应为布尔类型的值。',
        invalidTypeNumber: '应为数字类型的值。',
        invalidTypeObject: '应为对象类型的值。',
        invalidTypeString: '应为字符串类型的值。',
        invalidUnionType: '值不符合任何允许类型。',
        minGreaterThanMax: '最小值不能大于最大值。',
        missingActionKey: '操作对象缺少必需的键。',
        missingColorProperty: '缺少必需的颜色属性。',
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
        bar_effect: '进度条效果',
        bar_orientation: '进度条方向',
        bar_position: '进度条位置',
        bar_single_line: '单行信息（覆盖显示）',
        bar_size: '进度条大小',
        center_zero: '零点居中',
        color: '主色',
        decimal: '小数',
        disable_unit: '显示单位',
        double_tap_action: '双击动作',
        entity: '实体',
        force_circular_background: '强制圆形背景',
        hold_action: '长按动作',
        icon: '图标',
        icon_double_tap_action: '图标双击动作',
        icon_hold_action: '图标长按动作',
        icon_tap_action: '图标点击动作',
        layout: '卡片布局',
        max_value: '最大值',
        max_value_attribute: '属性（最大值）',
        max_value_entity: '使用实体的最大值',
        min_value: '最小值',
        name: '名称',
        percent: '百分比',
        secondary: '次要信息',
        tap_action: '点击动作',
        text_shadow: '添加文本阴影（overlay）',
        theme: '主题',
        toggle_icon: '显示图标',
        toggle_name: '显示名称',
        toggle_progress_bar: '显示进度条',
        toggle_secondary_info: '显示次要信息',
        toggle_value: '显示数值',
        unit: '单位',
        use_max_entity: '使用实体作为最大值'
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
          overlay: '覆盖内容的进度条'
        },
        layout: {
          horizontal: '水平（默认）',
          vertical: '垂直'
        }
      }
    }
  },
  'zh-Hant': {
    card: {
      msg: {
        appliedDefaultValue: '已自動套用預設值。',
        attributeNotFound: '在 Home Assistant 中找不到此屬性。',
        discontinuousRange: '定義的範圍不連續。',
        entityNotFound: '在 Home Assistant 中找不到此實體。',
        invalidActionObject: '動作物件無效或結構不正確。',
        invalidCustomThemeArray: '自訂主題必須是陣列。',
        invalidCustomThemeEntry: '一個或多個自訂主題項目無效。',
        invalidDecimal: '數值必須是正整數。',
        invalidEntityId: '實體 ID 無效或格式不正確。',
        invalidEnumValue: '提供的值不在允許的選項中。',
        invalidIconType: '指定的圖示類型無效或未知。',
        invalidMaxValue: '最大值無效或超出允許範圍。',
        invalidMinValue: '最小值無效或低於允許範圍。',
        invalidStateContent: '狀態內容無效或格式不正確。',
        invalidStateContentEntry: '一個或多個狀態內容項目無效。',
        invalidTheme: '指定的主題未知，將使用預設主題。',
        invalidTypeArray: '預期為陣列類型的值。',
        invalidTypeBoolean: '預期為布林值類型的值。',
        invalidTypeNumber: '預期為數字類型的值。',
        invalidTypeObject: '預期為物件類型的值。',
        invalidTypeString: '預期為字串類型的值。',
        invalidUnionType: '值不符合任何允許的類型。',
        minGreaterThanMax: '最小值不能大於最大值。',
        missingActionKey: '動作物件中缺少必要鍵。',
        missingColorProperty: '缺少必要的顏色屬性。',
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
        bar_effect: '進度條效果',
        bar_orientation: '進度條方向',
        bar_position: '進度條位置',
        bar_single_line: '單行資訊（疊加）',
        bar_size: '進度條大小',
        center_zero: '中心為零',
        color: '圖示顏色',
        decimal: '小數',
        disable_unit: '顯示單位',
        double_tap_action: '雙擊操作',
        entity: '實體',
        force_circular_background: '強制圓形背景',
        hold_action: '長按操作',
        icon: '圖示',
        icon_double_tap_action: '圖示雙擊操作',
        icon_hold_action: '圖示長按操作',
        icon_tap_action: '圖示點擊操作',
        layout: '卡片佈局',
        max_value: '最大值',
        max_value_attribute: '屬性（max_value）',
        max_value_entity: '最大值',
        min_value: '最小值',
        name: '名稱',
        percent: '百分比',
        secondary: '次要資訊',
        tap_action: '點擊操作',
        text_shadow: '文字陰影（疊加）',
        theme: '主題',
        toggle_icon: '顯示圖示',
        toggle_name: '顯示名稱',
        toggle_progress_bar: '顯示進度條',
        toggle_secondary_info: '顯示次要資訊',
        toggle_value: '顯示數值',
        unit: '單位',
        use_max_entity: '使用實體作為最大值'
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
          overlay: '疊加在內容上'
        },
        layout: {
          horizontal: '水平（預設）',
          vertical: '垂直'
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
  --spacing: 10px;
  --gap-entities: 16px;

  /* === SIZE VARIABLES === */
  --shape-default-size: 36px;
  --icon-default-size: 24px;
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
  --hover-opacity: 4%;
  --active-opacity: 15%;
  --icon-hover-opacity: 40%;
  --card-hover-mix: 96%;
  --card-active-mix: 85%;

  /* === TRANSITION VARIABLES === */
  --progress-transition: 0.3s ease;

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

/* =============================================================================
   BASE CARD
   ============================================================================= */

${CARD.htmlStructure.card.element} {
  --ha-ripple-color: var(--epb-icon-and-shape-color, var(--icon-and-shape-color, var(--state-icon-color)));
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
  --current-container-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.horizontal.minHeight});
  --current-container-overflow: visible;
  --current-container-gap: var(--spacing);
  --current-container-box-sizing: content-box;
  --current-container-flex-wrap: wrap;
}

.vertical {
  --current-container-flex-direction: column;
  --current-container-min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.vertical.minHeight});
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
  --current-container-min-height: var(--entities-card-min-height);
}

.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class} {
  --current-container-min-height: 0;
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
  --current-icon-size: var(--shape-default-size);

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
  --text-color: var(--epb-name-color, var(--primary-text-color));
  --text-font-size: var(--ha-font-size-s);
  --text-font-weight: var(--ha-font-weight-body);
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

.secondary-info-wrapper:has(.secondary-info-extra:empty):has(.secondary-info-main:empty) {
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

.multiline {
  display: inline-block;
  height: 16px;
  line-height: 0.95;
  font-size: 8px;
  margin: 0;
  padding: 0;
}

.info-multiline .secondary-info,
.info-multiline .secondary-info * {
  height: 18px;
  font-size: 9px;
}

.vertical.info-multiline :is(
  .secondary-info,
  .secondary-info .secondary-info-wrapper,
  .secondary-info .secondary-info-extra
) {
  height: unset !important;
}

.vertical.info-multiline .secondary-info .bar-container {
  height: 16px;
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

/* ==== INNER === */

/* --- Base ---*/

.${CARD.htmlStructure.elements.progressBar.inner.class} {
  --inner-radius: 0;
  --_r: var(--epb-progress-inner-radius, var(--inner-radius));
  
  position: absolute;
  inset: var(--inner-inset, 0 0 0 0);

  background: var(--inner-background);
  border-radius: var(--inner-border-radius);

  transform-origin: var(--inner-transform-origin, left);
  transform: scaleX(var(--scale-x,0)) scaleY(var(--scale-y,0));
  will-change: transform;
  backface-visibility: hidden;
  contain: layout paint;  
}

/* --- Animation ---*/
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --scale-x: 0;
  --scale-y: 1;
}
.horizontal-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --scale-x: var(--inner-size);
  transition: transform var(--progress-transition);
}
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --scale-x: 1;
  --scale-y: 0;
}
.vertical-bar.transition-ready .${CARD.htmlStructure.elements.progressBar.inner.class} {
  --scale-y: var(--inner-size);
  transition: transform var(--progress-transition);
}

/* --- STD Horizontal ---*/
.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: var(--_r);
}

/*  center zero - positiveInner */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-inset: 0 0 0 50%;
  --inner-border-radius: 0 var(--_r) var(--_r) 0;
}

/* center zero - negativeInner */
.center-zero.horizontal-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-inset: 0 50% 0 0;
  --inner-border-radius: var(--_r) 0 0 var(--_r);
  --inner-transform-origin: right; 
}

/* --- Vertical --- */
.vertical-bar .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-border-radius: var(--_r) var(--_r) 0 0;
  --inner-transform-origin: bottom;
}
.vertical-bar.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-inset: 0 0 50% 0;
  --inner-transform-origin: bottom;
}
.vertical-bar.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-inset: 50% 0 0 0;
  --inner-transform-origin: top;
  --inner-border-radius: 0 0 var(--_r) var(--_r);
}

/* --- inner size/background --- */
.${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-size: var(${CARD.style.dynamic.progressBar.value.var}, 0);
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})));
}
.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-size: calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1);
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect-neg, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})));
}

/* === ORIENTATION === */
.${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  transform: scaleX(-1);
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

/******************************************************************************************
 * 📦 Test utils
 ******************************************************************************************/

const is = {
  nullish: (val) => val == null, // null or undefined
  boolean: (val) => typeof val === 'boolean',
  string: (val) => typeof val === 'string',
  emptyString: (val) => typeof val === 'string' && val.trim() === '',
  nonEmptyString: (val) => typeof val === 'string' && val.trim() !== '',
  nullishOrEmptyString: (val) => val == null || (typeof val === 'string' && val.trim() === ''),
  numericString: (val) => typeof val === 'string' && val.trim() !== '' && !isNaN(parseFloat(val)),
  number: (val) => Number.isFinite(val),
  integer: (val) => typeof val === 'number' && Number.isInteger(val) && val >= 0,
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

/******************************************************************************************
 * 📦 Logging utils
 ******************************************************************************************/

/******************************************************************************************
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

      debug: (msg, data) => shouldLog(SEV.debug) && console.debug(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      info: (msg, data) => shouldLog(SEV.info) && console.info(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      warning: (msg, data) => shouldLog(SEV.warning) && console.warn(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      error: (msg, data) => shouldLog(SEV.error) && console.error(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),

      wrap: (fn, fnName) => {
        const isAsync = fn.constructor.name === 'AsyncFunction';

        const logStart = () => shouldLog(SEV.debug) && console.debug(`[${name}] 👉 ${fnName}`);
        const logSuccess = (start) => shouldLog(SEV.debug) && console.debug(`[${name}] ✅ ${fnName} (${(performance.now() - start).toFixed(2)}ms)`);
        const logError = (start, error) =>
          shouldLog(SEV.error) && console.error(`[${name}] ❌ ${fnName} failed (${(performance.now() - start).toFixed(2)}ms)`, error);

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

/******************************************************************************************
 * 📦 Components registration
 ******************************************************************************************/

/******************************************************************************************
 * 🛠️ RegistrationHelper
 * ========================================================================================
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
      if (editorClass && component.editor && !customElements.get(component.editor)) customElements.define(component.editor, editorClass);
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

/******************************************************************************************
 * 📦 CARD LIB
 ******************************************************************************************/

const CONTENT_SLOT = '{{content}}';

const Element = (obj, extraClass = '') => {
  const className = `${obj.class} ${extraClass}`.trim();
  return {
    tag: obj.element,
    class: className,
    html: (content = '', attrs = '') => `<${obj.element} class="${className}" ${attrs}>${content}</${obj.element}>`,
  };
};

const StructureElements = {
  ripple: () => '<ha-ripple></ha-ripple>',
  container: (options) => StructureElements.ripple() + Element(CARD.htmlStructure.sections.container, options.layout).html(CONTENT_SLOT),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html(CONTENT_SLOT),
  topContainer: () => Element(CARD.htmlStructure.sections.topContainer).html(CONTENT_SLOT),
  bottomContainer: () => Element(CARD.htmlStructure.sections.bottomContainer).html(CONTENT_SLOT),

  iconAndShape: () => Element(CARD.htmlStructure.elements.shape).html(StructureElements.ripple() + Element(CARD.htmlStructure.elements.icon).html()),
  badge: () => Element(CARD.htmlStructure.elements.badge.container).html(Element(CARD.htmlStructure.elements.badge.icon).html()),
  nameContent: (minimal = false) =>
    Element(CARD.htmlStructure.elements.nameContent).html(
      Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
        Element(CARD.htmlStructure.elements.nameValue).html(
          Element(CARD.htmlStructure.elements.nameMain).html() + (minimal ? '' : Element(CARD.htmlStructure.elements.nameExtra).html()),
        ),
      ),
    ),
  secondaryInfoWrapper: () =>
    Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
      Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
        Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
          Element(CARD.htmlStructure.elements.secondaryInfoExtra).html() + Element(CARD.htmlStructure.elements.secondaryInfoMain).html(),
        ),
      ),
    ),

  secondaryInfoWrapperMinimal: () =>
    Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
      Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
        Element(CARD.htmlStructure.elements.secondaryInfoValue).html(Element(CARD.htmlStructure.elements.secondaryInfoExtra).html()),
      ),
    ),

  progressBar: (options) => {
    const extraClass = options.barPosition === 'overlay' ? 'overlay' : '';
    const isCenterZero = options.barType === 'centerZero';

    const marks =
      Element(CARD.htmlStructure.elements.progressBar.lowWatermark, 'watermark mark').html() +
      Element(CARD.htmlStructure.elements.progressBar.highWatermark, 'watermark mark').html() +
      (isCenterZero ? Element(CARD.htmlStructure.elements.progressBar.zeroMark, 'mark').html() : '');

    const innerHtml = Element(CARD.htmlStructure.elements.progressBar.inner).html() + marks;

    return Element(CARD.htmlStructure.elements.progressBar.container, extraClass).html(
      Element(CARD.htmlStructure.elements.progressBar.bar, isCenterZero ? CARD.style.dynamic.progressBar.centerZero.class : 'default').html(innerHtml),
    );
  },

  createSecondaryInfo: (options, secondaryInfoWrapperFn) => {
    const { layout, barPosition } = options;
    const isTopOrBottom = ['top', 'bottom'].includes(barPosition);
    const isBelow = barPosition === 'below';
    const isOverlay = barPosition === 'overlay';
    const isVertical = layout === 'vertical';

    let content = secondaryInfoWrapperFn();

    if (!isTopOrBottom && !isBelow && !isOverlay && !isVertical) {
      content += StructureElements.progressBar(options);
    }

    return Element(CARD.htmlStructure.elements.secondaryInfo).html(content);
  },

  secondaryInfo: (options) => StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapper),

  secondaryInfoMinimal: (options) => StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapperMinimal),

  createContent: (options, rightContent) => {
    const isOverlay = options.barPosition === 'overlay';
    const isSingleLine = options.barSingleLine;
    const isVertical = options.layout === 'vertical';
    const isBelowTopOrBottom = ['below', 'top', 'bottom'].includes(options.barPosition);

    const extraClass = (isOverlay ? ' overlay' : '') + (isSingleLine ? ' single-line' : '');
    const before = isOverlay ? StructureElements.progressBar(options) : '';
    const after = !isOverlay && !isBelowTopOrBottom && isVertical ? StructureElements.progressBar(options) : '';
    const content = before + rightContent + after;

    return Element(CARD.htmlStructure.sections.content, extraClass).html(content);
  },

  contentFull: (options) => StructureElements.createContent(options, StructureElements.nameContent() + StructureElements.secondaryInfo(options)),
  contentMini: (options) =>
    StructureElements.createContent(options, StructureElements.nameContent(true) + StructureElements.secondaryInfoMinimal(options)),

  iconSection: () => Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape() + StructureElements.badge()),
  iconSectionWoBadge: () => Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape()),

  trendIndicator: (options) =>
    options.trendIndicator
      ? Element(CARD.htmlStructure.elements.trendIndicator.container).html(Element(CARD.htmlStructure.elements.trendIndicator.icon).html())
      : '',

  wrapWithBarPosition: (content, options) => {
    const { barPosition } = options;
    const bar = () => StructureElements.progressBar(options);

    const wrap = {
      top: () => ({ before: StructureElements.topContainer().replace(CONTENT_SLOT, bar()), after: '' }),
      bottom: () => ({ before: '', after: StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()) }),
      below: () => ({ before: '', after: StructureElements.belowContainer().replace(CONTENT_SLOT, bar()) }),
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
        StructureElements.trendIndicator(options) + StructureElements.iconSection() + StructureElements.contentFull(options),
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
        StructureElements.trendIndicator(options) + StructureElements.iconSection() + StructureElements.contentMini(options),
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
  _options = {};
  _cardType = 'card';

  get options() {
    return this._options;
  }
  set options(newOptions) {
    this._options = newOptions;
  }
  get innerHTML() {
    return StructureTemplates[this._cardType](this.options);
  }
}

class CardStructure extends ObjStructure {
  _cardType = 'card';
}

class BadgeStructure extends ObjStructure {
  _cardType = 'badge';
}

class TemplateStructure extends ObjStructure {
  _cardType = 'template';
}

class FeatureStructure extends ObjStructure {
  _cardType = 'feature';
}

/******************************************************************************************
 * 🛠️ NumberFormatter
 * ========================================================================================
 *
 * ✅ class for formatting value && unit.
 *
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate its
 * internal data.
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

  static formatValueAndUnit(value, decimal = 2, unit = '', locale = 'en-US', unitSpacing = CARD.config.unit.unitSpacing.auto) {
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
  static formatTiming(totalSeconds, decimal = 0, locale = 'en-US', flex = false, unitSpacing = CARD.config.unit.unitSpacing.auto) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = (totalSeconds % 60).toFixed(decimal);

    const pad = (value, length = 2) => String(value).padStart(length, '0');

    const [intPart, decimalPart] = seconds.split('.');
    seconds = decimalPart !== undefined ? `${pad(intPart)}.${decimalPart}` : pad(seconds);

    if (flex) {
      if (totalSeconds < 60) return NumberFormatter.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
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
        throw new Error('Unknown case');
    }
  }
  static convertDuration(duration) {
    const parts = duration.split(':').map(Number);
    const [hours, minutes, seconds] = parts;

    return (hours * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
  }
}

/******************************************************************************************
 * 🛠️ ValueHelper
 * ========================================================================================
 *
 * ✅ Helper class for managing numeric values.
 * This class validates and stor a numeric value.
 *
 * @class
 */

class ValueHelper {
  #value = null;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (ValueHelper.#validate(newValue)) this.#defaultValue = newValue;
  }

  // === PUBLIC GETTERS / SETTERS ===

  set value(newValue) {
    this.#isValid = ValueHelper.#validate(newValue); // Appel à la méthode statique
    this.#value = this.#isValid ? newValue : null;
  }
  get value() {
    return this.#isValid ? this.#value : this.#defaultValue;
  }
  get isValid() {
    return this.#isValid;
  }

  // === VALIDATION ===

  static #validate(value) {
    return Number.isFinite(value);
  }
}

/******************************************************************************************
 * 🛠️ DecimalHelper
 * ========================================================================================
 *
 * ✅ Represents a non-negative integer value that can be valid or invalid.
 *
 * @class
 */
class DecimalHelper {
  #value = CARD.config.decimal.percentage;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (DecimalHelper.#validate(newValue)) this.#defaultValue = newValue;
  }

  // === PUBLIC GETTERS / SETTERS ===

  set value(newValue) {
    this.#isValid = DecimalHelper.#validate(newValue);
    this.#value = this.#isValid ? newValue : null;
  }
  get value() {
    return this.#isValid ? this.#value : this.#defaultValue;
  }
  get isValid() {
    return this.#isValid;
  }

  // === VALIDATION ===

  static #validate(value) {
    return Number.isInteger(value) && value >= 0;
  }
}

/******************************************************************************************
 * 🛠️ UnitHelper
 * ========================================================================================
 *
 * ✅ Represents a unit of measurement, stored as a string.
 *
 * @class
 */
class UnitHelper {
  #value = CARD.config.unit.default;
  #isDisabled = false;

  // === PUBLIC GETTERS / SETTERS ===

  set value(newValue) {
    this.#value = newValue.trim() ?? CARD.config.unit.default;
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

  // === PUBLIC API METHODS ===

  toString() {
    return this.#isDisabled ? '' : this.#value;
  }
}

/******************************************************************************************
 * 🛠️ PercentHelper
 * ========================================================================================
 *
 * ✅ class for calculating and formatting percentages.
 *
 * @class
 */
class PercentHelper {
  #hassProvider = null;
  #min = new ValueHelper(CARD.config.value.min);
  #max = new ValueHelper(CARD.config.value.max);
  #current = new ValueHelper(0);
  #unit = new UnitHelper();
  #decimal = new DecimalHelper(CARD.config.decimal.percentage);
  #percent = 0;
  #isTimer = false;
  #isReversed = false;
  #isCenterZero = false;
  unitSpacing = CARD.config.unit.unitSpacing.auto;

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  // === PUBLIC GETTERS / SETTERS ===

  set isTimer(newValue) {
    this.#isTimer = is.boolean(newValue) ? newValue : false;
  }
  get isTimer() {
    return this.#isTimer;
  }
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
  get actual() {
    return this.#isReversed ? this.max - this.current : this.current;
  }
  get unit() {
    return this.#unit.value;
  }
  set unit(newValue) {
    this.#unit.value = newValue ?? '';
  }
  set hasDisabledUnit(newValue) {
    this.#unit.isDisabled = newValue;
  }
  get hasDisabledUnit() {
    return this.#unit.isDisabled;
  }
  set decimal(newValue) {
    this.#decimal.value = newValue;
  }
  get decimal() {
    return this.#decimal.value;
  }
  get isValid() {
    return this.range !== 0;
  }
  get range() {
    if (!this.isCenterZero) return this.max - this.min;
    return this.current >= 0 ? this.max : -this.min;
  }
  get correctedValue() {
    return this.isCenterZero ? this.current : this.actual - this.min;
  }
  get percent() {
    return this.isValid ? this.#percent : null;
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
    return this.unit === CARD.config.unit.default ? this.percent : this.actual;
  }
  set isCenterZero(newValue) {
    this.#isCenterZero = is.boolean(newValue) ? newValue : false;
  }
  get isCenterZero() {
    return this.#isCenterZero;
  }

  // === PUBLIC API METHODS ===

  valueForThemes(isCustomTheme, valueBasedOnPercentage) {
    /****************************************************************************************
     * Calculates the value to display based on the selected theme and unit system.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius before returning.
     * - If the theme is linear or the unit is the default, the percentage value is returned.
     */
    let value = this.actual;

    if (isCustomTheme) return value;
    if (this.unit === CARD.config.unit.fahrenheit) value = ((value - 32) * 5) / 9;

    return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(this.unit) ? this.percent : value;
  }
  refresh() {
    this.#percent = this.isValid ? Number(((this.correctedValue / this.range) * 100).toFixed(this.decimal)) : 0;
  }
  calcWatermark(value) {
    return [CARD.config.unit.default, CARD.config.unit.disable].includes(this.unit) ? value : ((value - this.min) / this.range) * 100;
  }
  toString() {
    if (!this.isValid) {
      return 'Div0';
    } else if (this.hasTimerOrFlexTimerUnit) {
      // timer with time format
      return NumberFormatter.formatTiming(this.actual, this.decimal, this.#hassProvider.numberFormat, this.hasFlexTimerUnit, this.unitSpacing);
    }
    return NumberFormatter.formatValueAndUnit(this.processedValue, this.decimal, this.unit, this.#hassProvider.numberFormat, this.unitSpacing);
  }
}

/******************************************************************************************
 * 🛠️ ThemeManager
 * ========================================================================================
 *
 * ✅ Manages the theme and its associated icon and color based on a percentage value.
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

  // === PUBLIC GETTERS / SETTERS ===

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
  set customTheme(newTheme) {
    if (!ThemeManager.#validateCustomTheme(newTheme)) {
      return;
    }
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme;
    this.#isValid = true;
    this.#isLinear = false;
    this.#isCustomTheme = true;
  }
  get customTheme() {
    return this.#currentStyle;
  }
  set interpolate(newInterpolate) {
    this.#interpolate = newInterpolate;
  }
  get interpolate() {
    return this.#interpolate;
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

  // === PRIVATE METHODS ===

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
    // eslint-disable-next-line no-useless-assignment
    let [themeData, nextThemeData, ratio] = [null, null, 0];

    if (this.#value >= this.#currentStyle[this.#currentStyle.length - 1].max) {
      themeData = this.#currentStyle[this.#currentStyle.length - 1];
    } else if (this.#value < this.#currentStyle[0].min) {
      themeData = this.#currentStyle[0];
    } else {
      const index = this.#currentStyle.findIndex((level) => this.#value >= level.min && this.#value < level.max);
      themeData = this.#currentStyle[index];
      nextThemeData = this.#currentStyle[index + 1] ?? null;
      ratio = (this.#value - themeData.min) / (themeData.max - themeData.min);
    }

    this.#applyColors(themeData, nextThemeData, ratio);
  }

  #applyColors(themeData, nextThemeData, ratio) {
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
  static #validateCustomTheme(customTheme) {
    if (!is.nonEmptyArray(customTheme)) return false;

    let isFirstItem = true;
    let lastMax = null;

    return customTheme.every((item) => {
      if (item === null || typeof item !== 'object') return false;
      if (!CARD.theme.customTheme.expectedKeys.every((key) => key in item)) return false;
      if (!CARD.theme.customTheme.colorKeys.some((key) => key in item)) return false;
      if (item.min >= item.max) return false;
      if (!isFirstItem && item.min !== lastMax) return false;

      isFirstItem = false;
      lastMax = item.max;

      return true;
    });
  }

  // === PUBLIC API METHODS ===

  static adaptColor(curColor) {
    return HA_CONTEXT.haColors.get(curColor) ?? curColor;
  }
}

/******************************************************************************************
 * 🛠️ HassProviderSingleton
 * ========================================================================================
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

  // === PUBLIC GETTERS / SETTERS ===

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

  // === PUBLIC API METHODS ===

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
    if (prop === 'last_changed' || prop === 'last_updated') return this.getRelativeTime(this.#resolveEntityProp(entityId, prop));

    const stateObj = this.getEntityStateObj(entityId);
    if (prop === 'state') return stateObj ? (this.#hass?.formatEntityState?.(stateObj) ?? '') : this.localize('card.msg.entityNotFound');

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
  static getEntityDomain(entityId) {
    return is.string(entityId) && entityId.includes('.') ? entityId.split('.')[0] : null;
  }
  isEntityAvailable(entityId) {
    const state = this.getEntityStateObj(entityId)?.state;
    return state !== 'unavailable' && state !== 'unknown';
  }
  getFormatedEntityAttributeName(entityId, attribute) {
    /* OLD ? */
    const stateObj = this.getEntityStateObj(entityId);
    return this.#hass?.formatEntityAttributeName?.(stateObj, attribute) ?? '';
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
  // === PUBLIC GETTERS / SETTERS ===

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

  // === PRIVATE METHODS ===

  _hasChanged(newHass) {
    if (this.#firstTime) {
      this.#firstTime = false;
      return true;
    }
    if (!is.nonEmptySet(this.#watchedEntities)) return true;

    for (const entityId of this.#watchedEntities) {
      const newState = newHass?.states?.[entityId];
      const oldState = this.#entityCache?.[entityId];

      if (!newState) return true;
      if (!oldState || JSON.stringify(newState) !== JSON.stringify(oldState)) {
        return true;
      }
    }

    return false;
  }

  _updateCache(hass) {
    this.#entityCache = {};
    for (const entityId of this.#watchedEntities) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
    }
  }

  // === PUBLIC API METHODS ===

  watchEntity(entityId) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }
}

/******************************************************************************************
 * 🛠️ EntityHelper
 * ========================================================================================
 *
 * ✅ Helper class for managing entities.
 * This class validates and retrieves information from Home Assistant if it's an entity.
 *
 * @class
 */
class EntityHelper {
  #hassProvider = null;
  #isValid = false;
  #value = {};
  #entityId = null;
  #attribute = null;
  #state = null;
  #domain = null;
  #entityType = null;
  stateContent = [];

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  set entityId(newValue) {
    this.#entityId = newValue;
    this.#entityType = null;
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

  static #handleRefreshType = new Map([
    ['timer', (self) => self._manageTimerEntity()],
    ['duration', (self) => self._manageDurationEntity()],
    ['counter', (self) => self._manageCounterAndNumberEntity('minimum', 'maximum')],
    ['number', (self) => self._manageCounterAndNumberEntity('min', 'max')],
    ['default', (self) => self._manageStdEntity()],
  ]);

  getEntityType() {
    this.#entityType ??= EntityHelper.#handleRefreshType.has(this.#domain)
      ? this.#domain
      : this.#hassProvider.getEntityProp(this.#entityId, 'device_class') === 'duration' && !this.#attribute
        ? 'duration'
        : 'default';

    return this.#entityType;
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);

    if (!this.#isValid) {
      this.#state = HA_CONTEXT.entity.state.notFound;
      return;
    }

    this.#isValid = this.#attribute
      ? this.#isValid && this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute) !== undefined
      : this.#isValid;

    this.#state = this.#hassProvider.getEntityProp(this.#entityId, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler = EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get('default');
    handler(this);
  }

  _manageStdEntity() {
    this.#attribute = this.#attribute || HA_CONTEXT.attributeMapping[this.#domain]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(attrValue);
      if (this.#domain === HA_CONTEXT.attributeMapping.light.label && this.#attribute === HA_CONTEXT.attributeMapping.light.attribute) {
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
        elapsed = CARD.config.value.min;
        duration = CARD.config.value.max;
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
        const remaining = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'remaining'));
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
        elapsed = duration - remaining;
        break;
      }
      default:
        throw new Error('Timer entity - Unknown case');
    }
    this.#value = { current: elapsed / CARD.config.msFactor, min: CARD.config.value.min, max: duration / CARD.config.msFactor, state: this.#state };
  }
  _manageCounterAndNumberEntity(min, max) {
    this.#value = {
      current: parseFloat(this.state),
      min: this.#hassProvider.getEntityAttribute(this.#entityId, min),
      max: this.#hassProvider.getEntityAttribute(this.#entityId, max),
    };
  }
  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    this.#value = unit === undefined ? 0 : NumberFormatter.durationToSeconds(value, unit);
    this.#isValid = unit !== undefined;
  }

  get attributes() {
    return this.#isValid && !this.isCounter && !this.isNumber && !this.isDuration && !this.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entityId)
      : {};
  }
  get hasAttribute() {
    return this.#isValid && Object.keys(this.attributes ?? {}).length > 0;
  }
  get defaultAttribute() {
    return HA_CONTEXT.attributeMapping[this.#domain]?.attribute ?? null;
  }
  get name() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'friendly_name');
  }
  get stateObj() {
    return this.#hassProvider.getEntityStateObj(this.#entityId);
  }
  get formatedEntityState() {
    return this.#hassProvider.getEntityProp(this.#entityId, 'state', true);
  }
  get unit() {
    if (!this.#isValid) return null;
    if (this.isTimer) return CARD.config.unit.flexTimer;
    if (this.isDuration) return CARD.config.unit.second;
    if (this.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
  }
  get precision() {
    return this.#isValid ? (this.#hassProvider.getEntityProp(this.#entityId, 'display_precision') ?? null) : null;
  }
  get isTimer() {
    return this.getEntityType() === 'timer';
  }
  get isDuration() {
    return this.getEntityType() === 'duration';
  }
  get isNumber() {
    return this.getEntityType() === 'number';
  }
  get isCounter() {
    return this.getEntityType() === 'counter';
  }
  get hasShapeByDefault() {
    return [HA_CONTEXT.entity.type.light, HA_CONTEXT.entity.type.fan].includes(this.#domain);
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

  get defaultColor() {
    const colorMap = {
      [HA_CONTEXT.entity.type.timer]: this.value?.state === HA_CONTEXT.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.cover]: this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.light]: this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.fan]: this.value > 0 ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.climate]: this.#getClimateColor(),
      [HA_CONTEXT.entity.class.battery]: this.#getBatteryColor(),
    };

    return colorMap[this.#domain] ?? colorMap[this.#hassProvider.getEntityProp(this.#entityId, 'device_class')] ?? null;
  }
  get stateContentToString() {
    const results = [];

    for (const attr of this.stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getEntityProp(this.#entityId, 'state', true));
          break;
        default:
          results.push(this.#hassProvider.getEntityProp(this.#entityId, attr, true));
          break;
      }
    }

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }
}

/******************************************************************************************
 * 🛠️ EntityCollectionHelper
 * ========================================================================================
 *
 * ✅ Helper class for managing entities collection.
 *
 * @class
 */

class EntityCollectionHelper {
  #entities = [];

  addEntity(entityId, attribute = null) {
    const helper = new EntityHelper();
    helper.entityId = entityId;
    if (attribute) helper.attribute = attribute;
    this.#entities.push(helper);
  }

  refreshAll() {
    this.#entities.forEach((helper) => helper.refresh());
  }

  getTotalValue() {
    return this.#entities
      .filter((helper) => helper.isValid && helper.isAvailable)
      .reduce((sum, helper) => {
        const value = helper.value;
        return sum + (is.number(value) ? value : (value?.current ?? 0));
      }, 0);
  }
  getAvailableEntities() {
    return this.#entities.filter((helper) => helper.isValid && helper.isAvailable);
  }

  getPercentages() {
    const total = this.getTotalValue();
    if (total === 0) return [];

    return this.getAvailableEntities().map((helper) => {
      const rawValue = helper.value;
      const value = is.number(rawValue) ? rawValue : (rawValue?.current ?? 0);
      const percent = (value / total) * 100;

      return {
        entityId: helper.entityId,
        value,
        percent,
      };
    });
  }

  getEntitiesColor(curColor) {
    const percentages = this.getPercentages();
    if (!percentages.length || !curColor) return null;

    const total = percentages.length;
    const gradientStops = [];
    let currentPosition = 0;

    for (let i = 0; i < total; i++) {
      const item = percentages[i];

      const whitePercent = Math.round((1 - i / (total - 1 || 1)) * 50); // de 50 → 0
      const basePercent = 100 - whitePercent;

      const color = `color-mix(in srgb, ${curColor} ${basePercent}%, black ${whitePercent}%)`;

      const start = currentPosition;
      const end = currentPosition + item.percent;

      gradientStops.push(`${color} ${start.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);

      currentPosition = end;
    }

    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  }

  getAvailableCount() {
    return this.getAvailableEntities().length;
  }

  get count() {
    return this.#entities.length;
  }

  get validEntities() {
    return this.#entities.filter((e) => e.isValid && e.isAvailable);
  }

  get all() {
    return this.#entities;
  }

  clear() {
    this.#entities = [];
  }
}

/******************************************************************************************
 * 🛠️ EntityOrValue
 * ========================================================================================
 *
 * ✅ Represents either an entity ID or a direct value.
 * This class validates the provided value and retrieves information from Home Assistant if it's an entity.
 *
 * @class
 */
class EntityOrValue {
  #activeHelper = null; // Dynamically set to EntityHelper or ValueHelper
  #helperType = { entity: 'entity', value: 'value' };
  #isEntity = null;

  // === PRIVATE METHODS (CREATION) ===

  #createHelper(helperType) {
    const HelperClass = helperType === this.#helperType.entity ? EntityHelper : ValueHelper;
    if (!(this.#activeHelper instanceof HelperClass)) {
      this.#activeHelper = new HelperClass();
      this.#isEntity = helperType === this.#helperType.entity;
    }
  }

  // === PUBLIC GETTERS / SETTERS ===

  set value(newValue) {
    if (is.string(newValue)) {
      this.#createHelper(this.#helperType.entity);
      this.#activeHelper.entityId = newValue;
    } else if (is.number(newValue)) {
      this.#createHelper(this.#helperType.value);
      this.#activeHelper.value = newValue;
    } else {
      this.#activeHelper = null;
    }
  }

  get value() {
    return this.#activeHelper ? this.#activeHelper.value : null;
  }
  get isEntity() {
    return this.#isEntity;
  }
  set attribute(newValue) {
    if (this.#activeHelper && this.#isEntity) this.#activeHelper.attribute = newValue;
  }
  get attribute() {
    return this.#isEntity ? this.#activeHelper.attribute : null;
  }
  get state() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.state : null;
  }
  get isValid() {
    return this.#activeHelper ? this.#activeHelper.isValid : false;
  }
  get isAvailable() {
    return this.#activeHelper ? (this.#isEntity && this.#activeHelper.isAvailable) || this.#activeHelper.isValid : false;
  }
  get precision() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.precision : null;
  }
  get name() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.name : null;
  }
  get formatedEntityState() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.formatedEntityState : null;
  }
  set stateContent(newValue) {
    if (this.#activeHelper && this.#isEntity) this.#activeHelper.stateContent = newValue;
  }
  get stateContent() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.stateContent : null;
  }
  get stateContentToString() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.stateContentToString : null;
  }
  get isTimer() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.isTimer : false;
  }
  get isDuration() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.isDuration : false;
  }
  get isCounter() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.isCounter : false;
  }
  get isNumber() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.isNumber : false;
  }
  get hasShapeByDefault() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.hasShapeByDefault : false;
  }
  get defaultColor() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.defaultColor : false;
  }
  get hasAttribute() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.hasAttribute : false;
  }
  get defaultAttribute() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.defaultAttribute : null;
  }
  get attributes() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.attributes : null;
  }
  get unit() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.unit : null;
  }
  get stateObj() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.stateObj : null;
  }

  // === PUBLIC API METHODS ===

  refresh() {
    if (this.#activeHelper && this.#isEntity) this.#activeHelper.refresh();
  }
}

/******************************************************************************************
 * 🛠️ Manage YAML options
 * ========================================================================================
 * structural validation ideas to manage inputs (1.5+).
 * deliberately verbose by design: no external dependencies, fully typed errors,
 * and scales cleanly across multiple card types.
 *
 * @inspired by superstruct (MIT License) - Copyright (c) @ianstormtaylor
 * @see https://github.com/ianstormtaylor/superstruct
 */

class ValidationError extends Error {
  constructor(path = [], errorCode = null, severity = SEV.error, fallback = null, partialConfig = null, allErrors = []) {
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
  invalidCustomThemeArray: { code: 'invalidCustomThemeArray', severity: SEV.error },
  invalidCustomThemeEntry: { code: 'invalidCustomThemeEntry', severity: SEV.error },
  invalidMinValue: { code: 'invalidMinValue', severity: SEV.error },
  invalidMaxValue: { code: 'invalidMaxValue', severity: SEV.error },
  invalidTheme: { code: 'invalidTheme', severity: SEV.info },
  minGreaterThanMax: { code: 'minGreaterThanMax', severity: SEV.error },
  discontinuousRange: { code: 'discontinuousRange', severity: SEV.error },
  missingColorProperty: { code: 'missingColorProperty', severity: SEV.error },
  invalidIconType: { code: 'invalidIconType', severity: SEV.error },
  invalidStateContent: { code: 'invalidStateContent', severity: SEV.error },
  invalidStateContentEntry: { code: 'invalidStateContentEntry', severity: SEV.error },
  appliedDefaultValue: { code: 'appliedDefaultValue', severity: SEV.info },
};

const validateType =
  (typeCheck, errorCode) =>
  (value, path = []) => {
    if (is.nullish(value)) throw new ValidationError(path, ERROR_CODES.missingRequiredProperty.code, ERROR_CODES.missingRequiredProperty.severity);
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
      if (!is.array(value)) throw new ValidationError(path, ERROR_CODES.invalidTypeArray.code, ERROR_CODES.invalidTypeArray.severity);

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
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
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
        throw new ValidationError(path, ERROR_CODES.missingRequiredProperty.code, ERROR_CODES.missingRequiredProperty.severity);
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
      if (!allowedValues.includes(value)) throw new ValidationError(path, ERROR_CODES.invalidTheme.code, ERROR_CODES.invalidTheme.severity);
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
    // eslint-disable-next-line no-unused-vars
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
        results
          .filter((r) => r.value !== SKIP_PROPERTY && r.value !== undefined)
          .map((r) => [r.key, r.value])
      );

      if (errors.length > 0) {
        throw new ValidationError(path, 'watermarkValidation', SEV.warning, result, null, errors);
      }

      return result;
    },

  entityId: (value, path = []) => {
    if (is.nullish(value)) throw new ValidationError(path, ERROR_CODES.missingRequiredProperty.code, ERROR_CODES.missingRequiredProperty.severity);
    if (typeof value !== 'string') throw new ValidationError(path, ERROR_CODES.invalidTypeString.code, ERROR_CODES.invalidTypeString.severity);
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(value)) throw new ValidationError(path, ERROR_CODES.invalidEntityId.code, ERROR_CODES.invalidEntityId.severity);

    return value;
  },

  decimal: (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.integer(value)) throw new ValidationError(path, ERROR_CODES.invalidDecimal.code, ERROR_CODES.invalidDecimal.severity);

    return value;
  },

  tapAction: (value, path = []) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidActionObject.code, ERROR_CODES.invalidActionObject.severity);
    }
    if (!is.string(value.action)) {
      throw new ValidationError([...path, 'action'], ERROR_CODES.missingActionKey.code, ERROR_CODES.missingActionKey.severity);
    }

    return value;
  },

  tapActionWithDefault: (defaultVal) => types.fallbackTo(types.tapAction, defaultVal),

  customTheme: (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.array(value)) throw new ValidationError(path, ERROR_CODES.invalidCustomThemeArray.code, ERROR_CODES.invalidCustomThemeArray.severity);

    let previousMax = null;

    return value.map((item, index) => {
      const itemPath = [...path, index];
      if (!is.plainObject(item))
        throw new ValidationError(itemPath, ERROR_CODES.invalidCustomThemeEntry.code, ERROR_CODES.invalidCustomThemeEntry.severity);

      const { min, max, color, icon_color, bar_color, icon } = item;
      if (!is.number(min)) throw new ValidationError([...itemPath, 'min'], ERROR_CODES.invalidMinValue.code, ERROR_CODES.invalidMinValue.severity);
      if (!is.number(max)) throw new ValidationError([...itemPath, 'max'], ERROR_CODES.invalidMaxValue.code, ERROR_CODES.invalidMaxValue.severity);

      if (min >= max) throw new ValidationError(itemPath, ERROR_CODES.minGreaterThanMax.code, ERROR_CODES.minGreaterThanMax.severity);

      if (previousMax !== null && min !== previousMax) {
        throw new ValidationError([...itemPath, 'min'], ERROR_CODES.discontinuousRange.code, ERROR_CODES.discontinuousRange.severity);
      }

      const hasColor = is.string(color) || is.string(icon_color) || is.string(bar_color);

      if (!hasColor) {
        throw new ValidationError(itemPath, ERROR_CODES.missingColorProperty.code, ERROR_CODES.missingColorProperty.severity);
      }

      if (icon !== undefined && !is.string(icon)) {
        throw new ValidationError([...itemPath, 'icon'], ERROR_CODES.invalidIconType.code, ERROR_CODES.invalidIconType.severity);
      }

      previousMax = max;

      return {
        min,
        max,
        ...(color !== undefined && { color }),
        ...(icon_color !== undefined && { icon_color }),
        ...(bar_color !== undefined && { bar_color }),
        ...(icon !== undefined && { icon }),
      };
    });
  },

  stateContent: (value, path = []) => {
    if (is.nullishOrEmptyString(value)) return SKIP_PROPERTY;
    if (is.string(value)) return [value];

    if (is.array(value)) {
      const invalidIndex = value.findIndex((v) => typeof v !== 'string');
      if (invalidIndex !== -1) {
        throw new ValidationError([...path, invalidIndex], ERROR_CODES.invalidStateContentEntry.code, ERROR_CODES.invalidStateContentEntry.severity);
      }
      return value;
    }

    throw new ValidationError(path, ERROR_CODES.invalidStateContent.code, ERROR_CODES.invalidStateContent.severity);
  },
};

function struct(validator) {
  const preProcess = (data) => {
    const result = { ...data };

    if (is.nullish(result.icon_tap_action) && is.string(result.entity)) {
      const domain = HassProviderSingleton.getEntityDomain(result.entity);
      const shouldPatch = ['light', 'switch', 'fan', 'input_boolean', 'media_player'].includes(domain);
      if (shouldPatch) result.icon_tap_action = HA_CONTEXT.actions.toggle;
    }

    if (['top', 'bottom', 'overlay'].includes(result.bar_position)) delete result.bar_size; // avoid conflict

    return result;
  };
  const postProcess = (data) => {
    const result = { ...data };

    if (!result.layout) result.layout = CARD.layout.orientations.horizontal.label;

    if (result.bar_size === CARD.style.bar.sizeOptions.xlarge.label) result.bar_position = 'below';

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

          if (errRoot.errors && Array.isArray(errRoot.errors) && errRoot.errors.length > 0) {
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

      const fieldsArray = Array.isArray(fieldsToDelete) ? fieldsToDelete : [fieldsToDelete];
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

const additionItem = types.fallbackTo(
  types.object({
    entity: types.entityId,
    attribute: types.optional(types.string),
  }),
  SKIP_PROPERTY,
);

const watermarkSchema = {
  low: types.fallbackTo(types.union(types.number, types.string), CARD.config.defaults.watermark.low),
  low_attribute: types.optionalString(),
  low_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.low_color),
  high: types.fallbackTo(types.union(types.number, types.string), CARD.config.defaults.watermark.high),
  high_attribute: types.optionalString(),
  high_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.high_color),
  opacity: types.optionalNumberWithDefault(CARD.config.defaults.watermark.opacity),
  type: types.enumsWithDefault(['blended', 'area', 'striped', 'triangle', 'round', 'line'], CARD.config.defaults.watermark.type),
  line_size: types.optionalStringWithDefault(CARD.config.defaults.watermark.line_size),
  disable_low: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_low),
  disable_high: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_high),
};

class YamlSchemaFactory {
  static get feature() {
    return struct(
      types.object({
        // === Entity & Data ===
        entity: types.entityId,
        attribute: types.optionalString(),
        min_value: types.optionalNumber(0),
        max_value: types.fallbackTo(types.union(types.number, types.string), 100),
        max_value_attribute: types.optionalString(),

        // === Appearance ===
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'top', 'bottom'], 'default'),
        center_zero: types.optionalBooleanWithDefault(false),

        // === Theme & Watermark ===
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // === Additions ===
        additions: types.optional(types.array(additionItem)),
      }),
    );
  }
  static get card() {
    return struct(
      types.object({
        // === Entity & Data ===
        entity: types.entityId,
        attribute: types.optionalString(),
        name: types.optionalString(),
        decimal: types.decimal,
        unit: types.optionalString(),
        disable_unit: types.optionalBooleanWithDefault(false),
        unit_spacing: types.enumsWithDefault(Object.values(CARD.config.unit.unitSpacing), 'auto'), //['auto', 'space', 'no-space']
        min_value: types.optionalNumber(0),
        max_value: types.fallbackTo(types.union(types.number, types.string), 100),
        max_value_attribute: types.optionalString(),

        // === Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
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
        center_zero: types.optionalBooleanWithDefault(false),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        // === Visibility & Content ===
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // === Badges ===
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // === Theme & Watermark ===
        // theme: types.theme(['optimal_when_low', 'optimal_when_high', 'light', 'temperature', 'humidity', 'pm25', 'voc']),
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // === Additions ===
        additions: types.optional(types.array(additionItem)),

        // === Actions ===
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
    ]);
  }

  static get template() {
    return struct(
      types.object({
        // === Entity & Data ===
        entity: types.optional(types.entityId),
        name: types.optionalString(),
        secondary: types.optionalString(),
        percent: types.optionalString(),

        // === Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay'], 'default'),
        bar_single_line: types.optionalBooleanWithDefault(false),
        bar_max_width: types.optionalString(),
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
        center_zero: types.optionalBooleanWithDefault(false),
        trend_indicator: types.optionalBooleanWithDefault(false),
        text_shadow: types.optionalBooleanWithDefault(false),

        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // === Actions ===
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
    ]);
  }
}

/******************************************************************************************
 * 🛠️ BaseConfigHelper
 * ========================================================================================
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
  _yamlSchema = null;

  constructor() {
    this.#log = initLogger(this, false);
  }

  // === GETTERS/SETTERS ===
  get config() {
    return this._configParsed?.config;
  }

  set config(config) {
    this.#actionsReady = false;
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    this._configParsed = this._yamlSchema.parse(this.constructor._customizeConfig(config));

    this.#lastMsgConsole = null;
  }

  static _customizeConfig(config) {
    return config;
  }

  static #logDeprecatedOption(config) {
    if (config.navigate_to !== undefined)
      console.warn(`${META.cards.card.typeName.toUpperCase()} - navigate_to option is deprecated and has been removed.`);
    if (config.show_more_info !== undefined)
      console.warn(`${META.cards.card.typeName.toUpperCase()} - show_more_info option is deprecated and has been removed.`);
    if (['battery', 'cpu', 'memory'].includes(config.theme))
      console.warn(
        `${META.cards.card.typeName.toUpperCase()} - theme: ${
          config.theme
        } is deprecated and will be removed in a future release. Please migrate to the recommended alternative...`,
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
  get hasDisabledUnit() {
    return this.config?.disable_unit;
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
    const resolve = (key) => (is.nonEmptyString(key) ? this._hassProvider.getEntityStateObj(key) : null);

    const entityState = resolve(this.config.entity);
    const maxValueState = resolve(this.config.max_value);
    const lowWMState = resolve(this.config?.watermark?.low);
    const highWMState = resolve(this.config?.watermark?.high);

    const checks = [
      {
        condition: is.string(this.config.attribute) && entityState && !has.own(entityState.attributes, this.config.attribute),
        path: 'attribute',
        errorCode: 'attributeNotFound',
      },
      { condition: is.nonEmptyString(this.config.max_value) && !maxValueState, path: 'max_value', errorCode: 'entityNotFound' },
      {
        condition:
          is.nonEmptyString(this.config.max_value_attribute) && maxValueState && !has.own(maxValueState.attributes, this.config.max_value_attribute),
        path: 'max_value_attribute',
        errorCode: 'attributeNotFound',
      },
      { condition: is.nonEmptyString(this.config.watermark?.low) && !lowWMState, path: 'watermark.low', errorCode: 'entityNotFound' },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.low_attribute) &&
          lowWMState &&
          !has.own(lowWMState.attributes, this.config.watermark.low_attribute),
        path: 'watermark.low_attribute',
        errorCode: 'attributeNotFound',
      },
      { condition: is.nonEmptyString(this.config.watermark?.high) && !highWMState, path: 'watermark.high', errorCode: 'entityNotFound' },
      {
        condition:
          is.nonEmptyString(this.config.watermark?.high_attribute) &&
          highWMState &&
          !has.own(highWMState.attributes, this.config.watermark.high_attribute),
        path: 'watermark.high_attribute',
        errorCode: 'attributeNotFound',
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

  static _customizeConfig(config) {
    return {
      ...config,
      ...(is.nonEmptyString(config?.entity) && is.nullish(config?.attribute)
        ? { attribute: HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(config?.entity)]?.attribute }
        : {}),
      ...(is.nonEmptyString(config?.max_value) && is.nullish(config?.max_value_attribute)
        ? { max_value_attribute: HA_CONTEXT.attributeMapping[HassProviderSingleton.getEntityDomain(config?.max_value)]?.attribute }
        : {}),
    };
  }

  get max_value() {
    if (!this.config.max_value) return CARD.config.value.max;
    if (Number.isFinite(this.config.max_value)) return this.config.max_value;
    if (is.string(this.config.max_value)) {
      const state = this._hassProvider.getEntityProp(this.config.max_value, 'state');
      const parsedState = parseFloat(state);
      if (!isNaN(parsedState)) return parsedState;
    }
    return null;
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

/******************************************************************************************
 * 🛠️ ViewCore
 * ========================================================================================
 *
 * ✅ A view class for rendering minimal cards in a user interface.
 * This class manages configuration, entity states, user interactions, and visual
 * appearance of cards including layouts, orientations, watermarks, and interactive elements.
 *
 * ViewCore
 * ├── ViewBase
 * │   ├── CardView
 * │   ├── BadgeView
 * │   └── FeatureView
 * ├── CardTemplateView
 * └── BadgeTemplateView
 *
 * @class
 * @description Handles the display and behavior of minimal cards with support for
 *              Home Assistant entities, user actions, and visual customization
 *              (watermarks, shapes, orientations, clickable elements).
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

  // === GETTERS / SETTERS ===

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
    return this.config ? this.config.entity : undefined;
  }
  get layout() {
    return this.config ? this.config.layout : undefined;
  }
  get cardSize() {
    return this.config ? (CARD.layout.orientations[this.layout]?.grid?.grid_rows ?? 1) : CARD.layout.orientations.horizontal.grid.grid_rows;
  }
  get cardLayoutOptions() {
    if (!this.config) return CARD.layout.orientations.horizontal.grid;
    const layout = structuredClone(CARD.layout.orientations[this.layout]);
    layout.grid.grid_min_rows = this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label)
      ? 1
      : layout.grid.grid_min_rows +
        (this.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label ||
        (this.layout === 'vertical' && ['default', 'below'].includes(this.config.bar_position) && this.config.bar_size !== 'small')
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
  get barOrientation() {
    return this._currentValue.isTimer && this.config.bar_orientation === null ? 'rtl' : this.config.bar_orientation;
  }
  get barSize() {
    return this.config.bar_size;
  }
  get hasClickableIcon() {
    return ViewCore.#hasAction([this._configHelper.action.icon.tap, this._configHelper.action.icon.hold, this._configHelper.action.icon.doubleTap]);
  }
  get hasClickableCard() {
    return ViewCore.#hasAction([this._configHelper.action.card.tap, this._configHelper.action.card.hold, this._configHelper.action.card.doubleTap]);
  }
  get hasReversedSecondaryInfoRow() {
    return this.config.reverse_secondary_info_row; // === true
  }
  get hasVisibleShape() {
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape; // this.config.force_circular_background === true
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

  // === PUBLIC API METHODS ===

  getTrend(currentPercent) {
    const result =
      this._lastPercent === null ? 'flat' : this._lastPercent < currentPercent ? 'up' : this._lastPercent > currentPercent ? 'down' : 'flat';
    this._lastPercent = currentPercent;

    return result;
  }

  hasComponentHiddenFlag(component) {
    return this._hasInConfigArray('hide', component);
  }

  hasBarEffect(component) {
    return this._hasInConfigArray('bar_effect', component);
  }

  // === PRIVATE METHODS ===

  _hasInConfigArray(key, value) {
    return is.array(this.config?.[key]) && this.config[key].includes(value);
  }

  static #hasAction(actions) {
    return actions.some((action) => action !== HA_CONTEXT.actions.none.action);
  }
}
/******************************************************************************************
 * 🛠️ ViewBase
 * ========================================================================================
 *
 * ✅ A comprehensive base card view that extends ViewCore to manage all information
 * required for creating cards and badges. This class handles entity states, theme management,
 * percentage calculations, timers, and provides a complete API for card rendering.
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
  #entityCollection = new EntityCollectionHelper();

  // === PUBLIC GETTERS / SETTERS ===

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

    if (this._configHelper.config.additions) {
      this._configHelper.config.additions.forEach(({ entity, attribute }) => {
        this.#entityCollection.addEntity(entity, attribute);
      });
      this.#entityCollection.addEntity(this._configHelper.config.entity, this._configHelper.config.attribute);
    }

    Object.assign(this.#percentHelper, {
      unitSpacing: this._configHelper.config.unit_spacing,
      hasDisabledUnit: this._configHelper.hasDisabledUnit,
      isCenterZero: this._configHelper.config.center_zero,
    });

    Object.assign(this.#theme, {
      theme: this._configHelper.config.theme,
      customTheme: this._configHelper.config.custom_theme,
      interpolate: this._configHelper.config.interpolate,
    });

    Object.assign(this._currentValue, {
      value: this._configHelper.config.entity,
      stateContent: this._configHelper.stateContent,
    });

    if (this._currentValue.isTimer) {
      this.#maxValue.value = CARD.config.value.max;
    } else {
      this._currentValue.attribute = this._configHelper.config.attribute;
      Object.assign(this.#maxValue, {
        value: this._configHelper.config.max_value ?? CARD.config.value.max,
        attribute: this._configHelper.config.max_value_attribute,
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
  }
  get config() {
    return this._configHelper.config;
  }
  #hasState(state) {
    const toEVal = this.hasWatermark ? [this._currentValue, this.#maxValue, this._lowValue, this._highValue] : [this._currentValue, this.#maxValue];
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
    return !(
      !this._currentValue.isAvailable ||
      (!this.#maxValue.isAvailable && this._configHelper.maxValue) ||
      (!this._lowValue.isAvailable && this._configHelper.config?.watermark?.low) ||
      (!this._highValue.isAvailable && this._configHelper.config?.watermark?.high)
    );
  }
  get hasStandardEntityError() {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }

  /* === Getters for card === */

  get icon() {
    const notFound = this.isNotFound ? CARD.style.icon.notFound.icon : null;
    return notFound || this.#theme.icon || this._configHelper.config.icon;
  }
  get iconColor() {
    if (this.isUnavailable) return CARD.style.color.unavailable;
    if (this.isNotFound) return CARD.style.color.notFound;
    return (
      ThemeManager.adaptColor(this.#theme.iconColor || this._configHelper.config.color) || this._currentValue.defaultColor || CARD.style.color.default
    );
  }
  get barColor() {
    if (!this.isAvailable) return this.isUnknown ? CARD.style.color.default : CARD.style.color.disabled;
    const curColor =
      ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color) ||
      this._currentValue.defaultColor ||
      CARD.style.color.default;
    return this.hasEntityCollection ? this.#entityCollection.getEntitiesColor(curColor) : curColor;
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
    if (this.hasStandardEntityError || (this._currentValue.isTimer && this._currentValue.value.state === HA_CONTEXT.entity.state.idle))
      return this._currentValue.formatedEntityState;

    const additionalInfo = this._currentValue.stateContentToString;
    if (this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this._currentValue.isDuration && !this._configHelper.config.unit ? this._currentValue.formatedEntityState : this.#percentHelper.toString();

    return additionalInfo === '' ? valueInfo : [additionalInfo, valueInfo].join(CARD.config.separator);
  }
  get name() {
    return this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
  }
  get badgeInfo() {
    if (this.isNotFound) return CARD.style.icon.badge.notFound;
    if (this.isUnavailable) return CARD.style.icon.badge.unavailable;

    if (this._currentValue.isTimer) {
      const { state } = this._currentValue.value;
      const { paused, active } = HA_CONTEXT.entity.state;
      if (state === paused) return CARD.style.icon.badge.timer.paused;
      if (state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }
  get isActiveTimer() {
    return this._currentValue.isTimer && this._currentValue.state === HA_CONTEXT.entity.state.active;
  }
  get refreshSpeed() {
    const rawSpeed = this._currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    return Math.max(100, Math.round(clampedSpeed / 100) * 100);
  }
  get show_more_info() {
    return [HA_CONTEXT.actions.default, HA_CONTEXT.actions.moreInfo.action].includes(this._configHelper.action.card.tap);
  }
  get hasVisibleShape() {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }
  get timerIsReversed() {
    return this._configHelper.config.reverse !== false && this._currentValue.value.state !== HA_CONTEXT.entity.state.idle;
  }
  get hasWatermark() {
    return this._configHelper.config.watermark !== undefined;
  }
  get watermark() {
    const { watermark } = this.config;
    return watermark
      ? {
          ...watermark,
          low: this.#percentHelper.calcWatermark(this._lowValue.value),
          low_color: ThemeManager.adaptColor(watermark.low_color),
          high: this.#percentHelper.calcWatermark(this._highValue.value),
          high_color: ThemeManager.adaptColor(watermark.high_color),
        }
      : null;
  }
  get hasEntityCollection() {
    return this.#entityCollection.count >= 2;
  }

  get entityCollectionPercentage() {
    return this.#entityCollection.getPercentages();
  }

  // === PUBLIC API METHODS ===

  refresh(hass) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    this.#maxValue.refresh();
    this._configHelper.checkConfig();
    this.#entityCollection.refreshAll();

    if (!this.isAvailable) return;

    this.#updatePercentHelper();
    this.#theme.value = this.#percentHelper.valueForThemes(this.#theme.isCustomTheme, this.#theme.isBasedOnPercentage);
  }

  // === PRIVATE METHODS ===

  #updatePercentHelper() {
    // update
    this.#percentHelper.isTimer = this._currentValue.isTimer || this._currentValue.isDuration;
    const currentUnit = this.#getCurrentUnit();
    this.#percentHelper.unit = currentUnit;
    this.#percentHelper.decimal = this.#getCurrentDecimal(currentUnit);

    if (this._currentValue.isTimer) {
      this.#setTimerValues();
    } else if (this._currentValue.isCounter || this._currentValue.isNumber) {
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
      max: this.#maxValue.isEntity ? (this.#maxValue.value?.current ?? this.#maxValue.value) : this._currentValue.value.max,
    });
  }

  #setStdValues() {
    const currentValue = this.hasEntityCollection ? this.#entityCollection.getTotalValue() : this._currentValue.value;
    Object.assign(this.#percentHelper, {
      current: currentValue,
      min: this._configHelper.config.min_value,
      max: this.#maxValue.value?.current ?? this.#maxValue.value,
    });
  }

  #getCurrentUnit() {
    if (this._configHelper.config.unit) return this._configHelper.config.unit;
    if (this.#maxValue.isEntity) return CARD.config.unit.default;

    const unit = this._currentValue.unit;
    return unit === null ? CARD.config.unit.default : unit;
  }
  #getCurrentDecimal(currentUnit) {
    if (is.integer(this._configHelper.config.decimal)) return this._configHelper.config.decimal;
    if (this._currentValue.precision) return this._currentValue.precision;
    if (this._currentValue.isTimer) return CARD.config.decimal.timer;
    if (this._currentValue.isCounter) return CARD.config.decimal.counter;
    if (this._currentValue.isDuration) return CARD.config.decimal.duration;
    if (['j', 'd', 'h', 'min', 's', 'ms', 'μs'].includes(this._currentValue.unit)) return CARD.config.decimal.duration;

    if (this._configHelper.config.unit)
      return this._configHelper.config.unit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;

    return currentUnit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
  }
}
/******************************************************************************************
 * 🛠️ CardView
 * ========================================================================================
 *
 * A specialized card view implementation that extends ViewBase specifically for
 * rendering full card components. This class provides the complete card functionality
 * with proper configuration management through CardConfigHelper.
 *
 * @class CardView
 * @extends ViewBase
 * @description A concrete implementation of ViewBase designed for full card rendering.
 *              This class uses CardConfigHelper to handle card-specific configuration
 *              validation, processing, and management. It inherits all entity management,
 *              theme handling, and state processing capabilities from ViewBase while
 *              providing card-specific configuration logic.
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

/******************************************************************************************
 * 🛠️ ResourceManager
 * ========================================================================================
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

  // === PUBLIC GETTERS / SETTERS ===

  get list() {
    return [...this.#resources.keys()];
  }

  get count() {
    return this.#resources.size;
  }

  // === PUBLIC API METHODS ===

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
    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      fn();
      this.#log.debug('ThrottleDebounce immediate - ', id);
    }

    // Debounce — exec after delay
    if (this.#resources.has(keys.debounce)) {
      this.remove(keys.debounce);
    }
    this.setTimeout(
      () => {
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

  // === PRIVATE METHODS ===

  #generateUniqueId() {
    // eslint-disable-next-line no-useless-assignment
    let id = null;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.#resources.has(id));
    return id;
  }
}

/******************************************************************************************
 * 🛠️ DOMHelper
 * ========================================================================================
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
   * Enqueues a DOM update identified by a unique key + prop combination.
   * If the same key:prop is enqueued multiple times, only the latest function runs.
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
    if (value == null) return;
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
   * Sets a CSS custom property synchronously — no RAF, no cache check, no queue.
   * Use when immediate DOM update is required.
   */
  setStyleNow(key, prop, value) {
    if (value == null) return;

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
    if (value == null) return;
    const cacheKey = `${key}:text`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'text', () => {
      el.textContent = value;
      this._appliedValues.set(cacheKey, value);
    });
  }

  /**
   * Sets the inner HTML of the element registered under the given key.
   * Skipped if the value matches the cache.
   */
  setHTML(key, value) {
    if (value == null) return;
    const cacheKey = `${key}:html`;
    if (this._appliedValues.get(cacheKey) === value) return;

    const el = this._domElements.get(key);
    if (!el) return;

    this.enqueue(key, 'html', () => {
      el.innerHTML = value;
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
    if (value == null) return;
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

/******************************************************************************************
 * 🛠️ ActionHelper — Utility Class
 * ========================================================================================
 *
 * ✅ Centralized handler for `xyz_action` logic.
 * Deprecated for HA 2026.3+
 *
 * 📌 Purpose:
 *   - Encapsulates and manages the execution, validation, and dispatch of `xyz_action`.
 *   - Promotes reusable, maintainable logic for action-related features.
 */

class ActionHelper {
  #target = null;
  #config = null;
  #fromIcon = false;
  #iconClickSources = new Set(['shape', 'ha-svg-icon', 'img']);

  constructor(target) {
    this.#target = target;
  }

  init(config, disableIconTap) {
    this.#config = config;

    if (!this.#target) return;

    document.querySelector('action-handler').bind(this.#target, {
      hasHold: true,
      hasDoubleClick: true,
    });

    this.#target.addEventListener(
      'pointerdown',
      (ev) => {
        const localName = ev.composedPath()[0].localName;
        this.#fromIcon = !disableIconTap && this.#iconClickSources.has(localName);
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

    const actionConfig = fromIcon && this.#config[iconActionKey]?.action !== 'none' ? this.#config[iconActionKey] : this.#config[`${action}_action`];

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

/******************************************************************************************
 * 🛠️ HACore
 * ========================================================================================
 *
 * Base class for Home Assistant custom elements (cards, badges, features).
 *
 *       HTMLElement
 *       │
 *       ├── HACore
 *       │   ├── HABase
 *       │   │   ├── EntityProgressCardBase
 *       │   │   │   ├── EntityProgressCard
 *       │   │   │   └── EntityProgressBadge
 *       │   │   └── EntityProgressTemplateBase
 *       │   │       ├── EntityProgressTemplateCard
 *       │   │       └── EntityProgressTemplateBadge
 *       │   │
 *       │   └── EntityProgressFeatures
 *
 * Provides:
 * - Shadow DOM initialization and lifecycle management (connectedCallback, disconnectedCallback)
 * - Configuration handling via setConfig()
 * - Hass state tracking and change detection
 * - DOM rendering pipeline: render() → _createCardElements() → _buildStyle()
 * - Batched DOM updates via DOMHelper (RAF queue + value cache)
 * - Jinja2 template subscriptions via WebSocket
 * - Resource lifecycle management (listeners, subscriptions, intervals)
 *
 * Subclasses MUST implement:
 * - _handleHassUpdate()  → react to hass state changes
 * - _updateCSS()         → apply dynamic CSS custom properties
 * - validJinjaFields     → current valid jinja available / config
 * - _getJinjaHandlers() → handle Jinja2 template results
 *
 * @abstract
 * @extends HTMLElement
 */
class HACore extends HTMLElement {
  static version = VERSION;
  static _baseClass = META.cards.feature.typeName;
  static _cardStructure = new FeatureStructure();
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

  // === LIFECYCLE METHODS ===
  static get _loggedMethods() {
    return [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'refresh',
      'reset',
      'render',
      '_storeDOM',
      '_manageStructureOptions',
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
    //
    // customize it
    //
    return null;
  }

  connectedCallback() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
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
  }

  // === PUBLIC API METHODS ===

  /**
   * Updates the component's configuration and triggers static changes.
   */
  setConfig(config) {
    this._log.debug('📎 HACore.setConfig()', config);

    if (!config) throw new Error('setConfig: invalid config');
    if (this.isRendered) this.reset(); // Card/Badge editor

    this._cardView.config = { ...config };
    if (is.string(config.entity)) this._changeTracker.watchEntity(config.entity);
    if (is.string(config.max_value)) this._changeTracker.watchEntity(config.max_value);
    if (is.string(config?.watermark?.low)) this._changeTracker.watchEntity(config.watermark.low);
    if (is.string(config?.watermark?.high)) this._changeTracker.watchEntity(config.watermark.high);
    this.render(); // re-build the card

    if (this.hass) this._handleHassUpdate(); // Card/Badge editor
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
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    if (!this._wsInitialized) this._watchWebSocket();
  }

  get hass() {
    return this._hassProvider.hass;
  }

  _handleHassUpdate() {
    throw new Error(`${this.constructor.name} must implement _handleHassUpdate()`);
    // must be overrided.
    // this.refresh();
    // customization
    // ...
  }

  refresh() {
    this._cardView.refresh(this.hass);
    this._updateDynamicElements();
  }

  get isRendered() {
    return this.#isRendered;
  }

  reset() {
    this.#isRendered = false;
    this._dom.destroy();
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = ''; // purge le contenu shadow DOM
    }
  }

  get innerHTML() {
    return this.constructor._cardStructure.innerHTML;
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

  // === CARD BUILDING ===

  /**
   * Builds and initializes the structure of the custom card component.
   *
   * This method creates the visual and structural elements of the card and injects
   * them into the component's Shadow DOM.
   */
  render() {
    if (this.isRendered) return;
    this.#isRendered = true;
    this._manageStructureOptions();
    const element = this._createCardElements();
    this.shadowRoot.replaceChildren(element.style, element.card);
    this._storeDOM();
    requestAnimationFrame(() => {
      this._dom.addClass(CARD.htmlStructure.card.element, 'transition-ready');
    });
  }

  _manageStructureOptions() {
    //
    // customize it
    //
    this.constructor._cardStructure.options = {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default', // === true
      barPosition: this._cardView.config.bar_position,
    };
  }

  _createCardElements() {
    const style = document.createElement(CARD.style.element);
    style.textContent = this.cardStyle;

    const card = document.createElement(this.cardElement);
    this._dom.destroy();
    this._dom.register(CARD.htmlStructure.card.element, card);
    this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.value.var, 0);
    this._buildStyle();
    card.innerHTML = this.innerHTML;

    return { style, card };
  }

  _storeDOM() {
    const allElements = this.shadowRoot.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el.classList.length > 0) {
        const key = el.classList[0]; // première classe uniquement
        this._dom.register(key, el);
      }
    });
  }

  _buildStyle() {
    //
    // customize it
    //
    this._addBaseClasses();
    this._handleWatermarkClasses();
    this._handleBarEffect();
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this._cardView.layout,
      this._cardView.barSize,
      this._cardView.barOrientation ? CARD.style.dynamic.progressBar.orientation[this._cardView.barOrientation] : null,
      this._cardView.config.center_zero ? CARD.style.dynamic.progressBar.centerZero.class : null,
      this._cardView.layout === 'vertical' && this._cardView.barOrientation === 'up' && this._cardView.config.bar_position === 'overlay'
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

  _handleBarEffect(jinjaEffect = null) {
    this._log.debug('📎 HACore _handleBarEffect(jinjaEffect)', jinjaEffect);

    if (!this._cardView.barEffectsEnabled) return;
    const isJinja = is.jinja(this._cardView.config.bar_effect);
    if (isJinja && !jinjaEffect) return;

    const effects = Object.values(CARD.style.dynamic.progressBar.effect);
    effects.forEach((effect) => {
      const active = isJinja ? jinjaEffect.includes(effect.label) : this._cardView.hasBarEffect(effect.label);

      this._dom.toggleClass(CARD.htmlStructure.card.element, effect.class, active);
    });
  }

  // === DYNAMIC ELEMENTS UPDATE ===

  _updateDynamicElements() {
    //
    // cutomize it
    //
    this._updateCSS();
    this._processJinjaFields();
  }

  // --- CSS MANAGEMENT ---

  _updateCSS() {
    //
    // cutomize it - Dynamique CSS values
    //
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  // === WATERMARK MANAGEMENT ===

  static _getWatermarkProperties(watermark, isCenterZero = false) {
    const highWatermark = isCenterZero ? 50 + watermark.high / 2 : watermark.high;
    const lowWatermark = isCenterZero ? 50 + watermark.low / 2 : watermark.low;

    return [
      [CARD.style.dynamic.watermark.high.value.var, `${highWatermark}%`],
      [CARD.style.dynamic.watermark.high.color.var, watermark.high_color],
      [CARD.style.dynamic.watermark.low.value.var, `${lowWatermark}%`],
      [CARD.style.dynamic.watermark.low.color.var, watermark.low_color],
      [CARD.style.dynamic.watermark.opacity.var, watermark.opacity],
      [CARD.style.dynamic.watermark.lineSize.var, watermark.line_size],
    ];
  }

  // === JINJA TEMPLATE RENDERING ===

  get validJinjaFields() {
    const result = Object.fromEntries(
      Object.keys(this._getJinjaHandlers())
        .map((key) => [key, this._cardView.config[key] || ''])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    this._log.debug('validJinjaFields: ', { result });
    return result;
  }

  _getJinjaHandlers(content) {
    //
    // cutomize it - list the fields/render func
    //
    throw new Error(`${this.constructor.name} must implement _getJinjaHandlers(${content})`);
    /*
    return {
      badge_icon: () => this._renderBadgeIcon(content), // HABase
      badge_color: () => this._renderBadgeColor(content), // HABase
      bar_effect: () => this._refreshBarEffect(content), // HACore
    // ...
    };
    */
  }

  _renderJinja(key, content) {
    this._log.debug('📎 HACore._renderJinja():', { key, content });

    const renderHandlers = this._getJinjaHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      handler();
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  _refreshBarEffect(content) {
    this._log.debug('📎 HACore._refreshBarEffect():', { content });
    const jinjaEffect = content.split(',').map((s) => s.trim());
    this._handleBarEffect(jinjaEffect);
  }

  // === TEMPLATE PROCESSING ===

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
      },
      { passive: true },
      CARD.network.disconnected,
    );

    this._resourceManager.addEventListener(
      this.hass.connection,
      'ready',
      () => {
        this._log.debug('🔁 WebSocket ready — reprocessing templates');
        if (!this._resourceManager) this._resourceManager = new ResourceManager(); // net reconnect
        this._processJinjaFields();
      },
      { passive: true },
      CARD.network.ready,
    );
  }

  _validateProcessJinjaFields() {
    return (this._cardView.config?.entity && this._cardView.hasStandardEntityError) || !this._resourceManager ? false : true;
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
        for (const [key, template] of Object.entries(templates)) {
          if (is.nonEmptyString(template)) this._subscribeToTemplate(key, template);
        }
      },
      300,
      'jinjaProcess',
    );
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

    try {
      this._log.debug('key:', key);
      this._log.debug('template:', template);

      const unsub = await this.hass.connection.subscribeMessage((msg) => this._renderJinja(key, msg.result), {
        type: 'render_template',
        template, //template: template,
        variables: this._getTemplateContext(),
      });

      // Check again after the async operation
      if (!this._resourceManager) {
        this._log.debug(`[Template ${key}] ResourceManager became null during subscription, cleaning up.`);
        unsub(); // Clean up the subscription
        return;
      } else if (!this.isConnected) {
        // DOM conn X
        unsub(); // Clean up the subscription
        return;
      } else {
        this._resourceManager.remove(subscriptionKey);
        this._resourceManager.addSubscription(unsub, subscriptionKey);
      }
    } catch (error) {
      this._log.error(`Failed to subscribe to template ${key}:`, error);
    }
  }
}

/******************************************************************************************
 * 🛠️ HABase
 * ========================================================================================
 *
 * ✅ Represents the base class for all custom "entity-progress" cards:
 *
 * 📌 Purpose:
 *   - Provides shared structure, lifecycle hooks, and utility logic for custom Lovelace cards.
 *   - Serves as the foundation for building consistent and reusable UI components.
 *
 * 🛠️ Example:
 *   class MyCustomCard extends HABase { ... }
 *
 * 📚 Context:
 *   - Designed for use in Home Assistant dashboards.
 *   - Enables unified behavior across multiple card implementations.
 *
 * @class
 * @extends HACore
 */

class HABase extends HACore {
  static _baseClass = META.cards.card.typeName;
  static _cardStructure = new CardStructure();
  static _cardStyle = CARD_CSS;
  static _hasDisabledIconTap = false;
  static _hasDisabledBadge = false;
  static _hiddenComponents = [
    // customize it
    CARD.style.dynamic.hiddenComponent.icon,
    CARD.style.dynamic.hiddenComponent.name,
    CARD.style.dynamic.hiddenComponent.secondary_info,
    CARD.style.dynamic.hiddenComponent.progress_bar,
  ];  
  _trendIcons = {
    up: HA_CONTEXT.icons.chevronUpBox,
    down: HA_CONTEXT.icons.chevronDownBox,
    flat: HA_CONTEXT.equalBox,
  };
  _icon = null;
  _cardView = new CardView();
  _actionHelper = null;
  #lastMessage = null;

  // === LIFECYCLE METHODS ===

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
      '_startAutoRefresh',
      '_stopAutoRefresh',
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
    if (![META.cards.card.typeName, META.cards.template.typeName].includes(this.baseClass)) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  getLayoutOptions() {
    if (![META.cards.card.typeName, META.cards.template.typeName].includes(this.baseClass)) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
  }

  // === PUBLIC API METHODS ===

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

  // === AUTO-REFRESH MANAGEMENT ===

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

  // === ERROR MESSAGE MANAGEMENT ===

  _manageErrorMessage() {
    if (this._cardView.msg && (is.nullish(this._cardView.entity) || (this._cardView.isAvailable && !this._cardView.hasValidatedConfig))) {
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

  // === CARD BUILDING ===

  _manageStructureOptions() {
    //
    // customize it
    //
    this.constructor._cardStructure.options = {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default', // === true
      layout: this._cardView.config.layout,
      barPosition: this._cardView.config.bar_position,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: this._cardView.config.trend_indicator,
    };
  }

  _buildStyle() {
    //
    // customize it
    //
    super._buildStyle(); // _handleWatermarkClasses, _handleBarEffect
    this._addBaseClasses();
    this._addBaseParameter();
    this._applyConditionalClasses();
    this._handleHiddenComponents();
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this.baseClass.includes('badge') ? 'progress-badge' : null,
      this._cardView.layout,
      this._cardView.barSize,
      this._cardView.config.bar_position,
      this._cardView.barOrientation ? CARD.style.dynamic.progressBar.orientation[this._cardView.barOrientation] : null,
      this._cardView.config.center_zero ? CARD.style.dynamic.progressBar.centerZero.class : null,
      this._cardView.layout === 'vertical' && this._cardView.barOrientation === 'up' && this._cardView.config.bar_position === 'overlay'
        ? 'vertical-bar'
        : 'horizontal-bar',
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
    ]);
  }

  _applyConditionalClasses() {
    this.conditionalStyle.forEach((condition, className) => {
      this._dom.toggleClass(CARD.htmlStructure.card.element, className, condition);
    });
  }

  _handleHiddenComponents(jinjaContent = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    const items =
      jinjaContent
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? null;

    this.constructor._hiddenComponents.forEach((component) => {
      this._dom.toggleClass(
        CARD.htmlStructure.card.element,
        component.class,
        items ? items.includes(component.label) : this._cardView.hasComponentHiddenFlag(component.label),
      );
    });
  }

  // === DYNAMIC ELEMENTS UPDATE ===

  _updateDynamicElements() {
    //
    // cutomize it
    //
    this._showIcon();
    this._showBadge();
    this._manageShape();
    this._updateTrend();
    this._updateCSS();
    this._processJinjaFields();
    this._processStandardFields();
  }

  // === Update Trend ===
  _updateTrend() {
    if (!this._cardView.config.trend_indicator) return;

    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      this._trendIcons[this._cardView.getTrend()],
    );
  }

  // === CSS MANAGEMENT ===

  _updateCSS() {
    //
    // cutomize it - Dynamique CSS values
    //
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  // === ICON MANAGEMENT ===

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

    if (hasIconOverride) {
      const stateObjIcon = this._createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture);
      if (stateObjIcon) {
        this._handleStateIcon(iconContainer, stateObjIcon);
      }
      return;
    }

    if (hasPicture) {
      this._handleImgIcon(stateObj, srcPicture);
      return;
    }

    const stateObjIcon = this._createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture);
    if (!stateObjIcon) return;
    this._handleStateIcon(iconContainer, stateObjIcon);
  }

  // === SHAPE MANAGEMENT ===

  _manageShape() {
    this._dom.toggleClass(
      CARD.htmlStructure.card.element,
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this._cardView.hasVisibleShape || this.hasDisabledIconTap,
    );
  }

  // === BADGE MANAGEMENT ===

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

  // === JINJA TEMPLATE RENDERING ===
  /* _getJinjaHandlers(content) {
    //
    // cutomize it - list the fields/render func
    //

    return {
      badge_icon: () => this._renderBadgeIcon(content), // base
      badge_color: () => this._renderBadgeColor(content), // base
      bar_effect: () => this._refreshBarEffect(content), // base
    // ...
    };
  }*/

  _renderBadgeIcon(content) {
    this._log.debug('📎 HABase._renderBadgeIcon():', { content });
    const badgeInfo = this._cardView.badgeInfo;
    const isBadgeEnable = is.nonEmptyString(content);
    const isMdiIcon = content.includes(HA_CONTEXT.icons.prefix);

    if (!is.nullish(badgeInfo)) return; // alert -> cancel custom badge
    this._enableBadge(isBadgeEnable);
    if (isMdiIcon) {
      this._setBadgeIcon(content);
    }
  }
  _renderBadgeColor(content) {
    this._log.debug('📎 HABase._renderBadgeColor():', { content });

    const backgroundColor = ThemeManager.adaptColor(content);
    const color = 'var(--white-color)';
    this._setBadgeColor(color, backgroundColor);
  }

  // === STD FIELDS PROCESSING ===
  static _getStandardFields(/*cardView*/) {
    //
    // customize it !!!
    //
    return [];
  }

  _processStandardFields() {
    this.constructor._getStandardFields(this._cardView).forEach(({ className, value }) => {
      this._dom.setText(className, value);
    });
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressCardBase
 * ========================================================================================
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
  static _hiddenComponents = [
    ...super._hiddenComponents,
    CARD.style.dynamic.hiddenComponent.value,
  ]; 
  static get _loggedMethods() {
    return [...super._loggedMethods, '_getStandardFields', '_renderCustomInfo', '_renderNameInfo'];
  }
  _handleHassUpdate() {
    this.refresh();

    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
    } else if (!this._resourceManager.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // === CSS - CUSTOMIZATION ===
  get conditionalStyle() {
    return new Map([...super.conditionalStyle, [CARD.style.dynamic.secondaryInfoError.class, this._cardView.hasStandardEntityError]]);
  }

  _updateCSS() {
    const bar = this._cardView;
    const isCenterZero = bar.config.center_zero;
    const cardKey = CARD.htmlStructure.card.element;
    const progressValue = `${bar.percent / 100}`;

    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, bar.barColor);
    this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, bar.iconColor);
    if (isCenterZero) {
      this._dom.toggleClass('inner', 'negative', isCenterZero && progressValue < 0);
      this._dom.toggleClass('inner', 'positive', isCenterZero && progressValue >= 0);
    } else {
      this._dom.addClass('inner', 'positive');
    }
    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);

    if (bar.hasWatermark) {
      HACore._getWatermarkProperties(bar.watermark, isCenterZero).forEach(([variable, value]) => {
        if (value != null) this._dom.setStyle(cardKey, variable, value);
      });
    }
  }

  // === STD FIELDS PROCESSING - CUSTOMIZATION ===
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

  // === JINJA TEMPLATE RENDERING - CUSTOMIZATION ===
  _getJinjaHandlers(content) {
    return {
      badge_icon: () => this._renderBadgeIcon(content), // base
      badge_color: () => this._renderBadgeColor(content), // base
      bar_effect: () => this._refreshBarEffect(content), // base
      hide: () => this._handleHiddenComponents(content), // base
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
    };
  }
  _renderCustomInfo(content) {
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, `${content}&nbsp;`);
  }

  _renderNameInfo(content) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameExtra.class, `&nbsp;${content}`);
  }
}

/******************************************************************************************
 * 📦 EntityProgressCard
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-card"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressCard extends EntityProgressCardBase {
  _cardView = new CardView();
  static _baseClass = META.cards.card.typeName;

  // === STATIC METHODS ===

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
  }

  static getConfigElement() {
    return document.createElement(CARD_CONTEXT.dev ? `${META.cards.card.editor}-dev` : META.cards.card.editor);
  }

  static getStubEntity(hass) {
    return Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) || 'sensor.temperature';
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${META.cards.card.typeName}${CARD_CONTEXT.dev ? '-dev' : ''}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}

/******************************************************************************************
 * 📦 EntityProgressBadge
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-badge"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressBadge extends EntityProgressCardBase {
  _cardView = new BadgeView();
  static _baseClass = META.cards.badge.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = CARD_CSS;

  static getConfigElement() {
    return document.createElement(CARD_CONTEXT.dev ? `${META.cards.badge.editor}-dev` : META.cards.badge.editor);
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${META.cards.badge.typeName}${CARD_CONTEXT.dev ? '-dev' : ''}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }

  // === JINJA TEMPLATE RENDERING - CUSTOMIZATION ===
  _getJinjaHandlers(content) {
    return {
      bar_effect: () => this._refreshBarEffect(content), // base
      hide: () => this._handleHiddenComponents(content), // base
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
    };
  }
}

/******************************************************************************************
 * 📦 EntityProgressFeatures
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-feature"
 *
 * @class
 * @extends HACore
 */

class EntityProgressFeatures extends HACore {
  static _baseClass = META.cards.feature.typeName;
  static _cardElement = 'div';
  #firstHack = true;

  // === STATIC ===

  static getStubConfig() {
    return {
      type: `custom:${META.cards.feature.typeName}${CARD_CONTEXT.dev ? '-dev' : ''}`,
    };
  }

  /**
   * Fixes the parent card layout when the feature is used as an overlay.
   *
   * By default, HA increases the card's --row-size by 1 for each feature added,
   * which would make the card taller. This method counteracts that behavior by
   * piercing through multiple Shadow DOM boundaries to directly manipulate the
   * parent card's layout properties.
   *
   * The following adjustments are made:
   * - `.container` and `hui-card-features` are set to `position: static` so the
   *   feature can be positioned absolutely relative to `ha-card`
   * - `ha-card` gets `overflow: hidden` to clip the feature to the card's border radius
   * - `--row-size` is decremented by 1 to cancel the extra row reserved by HA
   *
   * A MutationObserver watches for HA re-applying `--row-size` and immediately
   * corrects it. A `fixing` flag prevents infinite loops between our correction
   * and the observer callback.
   *
   * Only executed once per instance via the `#firstHack` guard.
   *
   * @inspired by hass-progress-bar-feature (MIT License) — Copyright (c) ytilis
   * @see https://github.com/ytilis/hass-progress-bar-feature
   */
  #fixCardStyles() {
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position) || !this.#firstHack) return;
    const cardContainer = DOMHelper.walkUpThroughShadow(this, '.card');
    if (!cardContainer) return;
    this.#firstHack = false;

    this._dom.register('ext:card', DOMHelper.walkUpThroughShadow(this, 'ha-card'));
    this._dom.register('ext:container', DOMHelper.walkUpThroughShadow(this, '.container'));
    this._dom.register('ext:features', DOMHelper.walkUpThroughShadow(this, 'hui-card-features'));
    this._dom.register('ext:card-container', cardContainer);
    const targetRowSize = parseInt(getComputedStyle(cardContainer)?.getPropertyValue(HA_CONTEXT.styles.rowSize)) - 1;

    let fixing = false;
    const fix = () => {
      if (fixing) return;
      const rowSize = getComputedStyle(cardContainer)?.getPropertyValue(HA_CONTEXT.styles.rowSize);
      if (rowSize && parseInt(rowSize) > targetRowSize) {
        fixing = true;
        this._dom.setStyleNow('ext:card', 'overflow', 'hidden');
        this._dom.setStyleNow('ext:container', 'position', 'static');
        this._dom.setStyleNow('ext:features', 'position', 'static');
        this._dom.setStyleNow('ext:card-container', HA_CONTEXT.styles.rowSize, targetRowSize);
        fixing = false;
      }
    };

    fix();
    new MutationObserver(fix).observe(cardContainer, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  // === HANDLE UPDATE ===

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();
  }

  _updateCSS() {
    const bar = this._cardView;
    const isCenterZero = bar.config.center_zero;
    const cardKey = CARD.htmlStructure.card.element;
    const progressValue = `${bar.percent / 100}`;

    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, bar.barColor);
    if (isCenterZero) {
      this._dom.toggleClass('inner', 'negative', isCenterZero && progressValue < 0);
      this._dom.toggleClass('inner', 'positive', isCenterZero && progressValue >= 0);
    } else {
      this._dom.addClass('inner', 'positive');
    }
    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);

    if (bar.hasWatermark) {
      HACore._getWatermarkProperties(bar.watermark, isCenterZero).forEach(([variable, value]) => {
        if (value != null) this._dom.setStyle(cardKey, variable, value);
      });
    }
  }

  // === JINJA TEMPLATE RENDERING - CUSTOMIZATION ===

  _getJinjaHandlers(content) {
    return {
      bar_effect: () => this._refreshBarEffect(content), // base
    };
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressTemplateBase
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-card-template"
 *
 * @class
 * @extends HABase
 */
class EntityProgressTemplateBase extends HABase {
  static _cardStructure = new TemplateStructure(); // customize it
  _cardView = new CardTemplateView(); // customize it

  static get _loggedMethods() {
    return [
      ...super._loggedMethods,
      '_updateWatermark',
      '_showIcon',
      '_forceJinjaProcessing',
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
    // this._processJinjaFields(); // + Jinja
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${META.cards.template.typeName}`,
      entity: EntityProgressCard.getStubEntity(hass),
      ...CARD.config.stub.template,
    };
  }

  /** --------------------------------------------------------------------------
   * Private methods organized by functionality
   */

  // === INITIALIZATION ===

  // === CARD BUILDING ===

  // === CSS CUSTOMIZATION ===
  _updateCSS() {
    const bar = this._cardView;
    const isCenterZero = bar.config.center_zero;
    const cardKey = CARD.htmlStructure.card.element;

    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, bar.barColor);
    this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, bar.iconColor);

    if (bar.hasWatermark) {
      HACore._getWatermarkProperties(bar.watermark, isCenterZero).forEach(([variable, value]) => {
        if (value != null) this._dom.setStyle(cardKey, variable, value);
      });
    }
  }
  // === WATERMARK MANAGEMENT ===

  _updateWatermark() {
    if (!this._cardView.hasWatermark) return;
    this._cardView.refresh();

    HACore._getWatermarkProperties(this._cardView.watermark, this._cardView.config.center_zero).forEach(([variable, value]) => {
      if (value != null) this._dom.setStyle(CARD.htmlStructure.card.element, variable, value);
    });
  }

  // === ICON MANAGEMENT ===

  _showIcon(iconFromJinja = null) {
    const jinjaIconNotReady = this._cardView.config.icon !== undefined && iconFromJinja === null;
    if (jinjaIconNotReady) return;
    this._cardView.icon = iconFromJinja;
    super._showIcon();
  }

  // === JINJA TEMPLATE RENDERING - CUSTOMIZATION ===
  _forceJinjaProcessing() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    this._processJinjaFields();
  }

  _getJinjaHandlers(content) {
    return {
      badge_icon: () => this._renderBadgeIcon(content), // base
      badge_color: () => this._renderBadgeColor(content), // base
      bar_effect: () => this._refreshBarEffect(content), // base
      hide: () => this._handleHiddenComponents(content), // base
      name: () => this._renderName(content),
      secondary: () => this._renderSecondary(content),
      icon: () => this._showIcon(content),
      percent: () => this._managePercent(content),
      color: () => this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.color.var, ThemeManager.adaptColor(content)),
      bar_color: () =>
        this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.color.var, ThemeManager.adaptColor(content)),
    };
  }
  // === BADGE MANAGEMENT ===

  _renderName(content) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameMain.class, `${content}`.trim());
  }

  _renderSecondary(content) {
    const hasLineBreak = /<br\s*\/?>/i.test(content);
    const wrappedContent = hasLineBreak ? `<span class="multiline">${content}</span>` : `${content}`;
    this._dom.toggleClass(CARD.htmlStructure.card.element, 'info-multiline', hasLineBreak);
    this._dom.setHTML(CARD.htmlStructure.elements.secondaryInfoExtra.class, wrappedContent.trim());
  }

  _managePercent(percent) {
    this._updateTrend(percent);
    this._renderPercentCSS(percent);
  }

  _updateTrend(percent) {
    if (!this._cardView.config.trend_indicator) return;
    this._dom.setAttribute(
      CARD.htmlStructure.elements.trendIndicator.icon.class,
      CARD.style.icon.badge.default.attribute,
      this._trendIcons[this._cardView.getTrend(percent)],
    );
  }

  _renderPercentCSS(percent) {
    const cardKey = CARD.htmlStructure.card.element;
    const isCenterZero = this._cardView.config.center_zero;
    const progressValue = `${percent / 100}`;

    if (isCenterZero) {
      this._dom.toggleClass('inner', 'negative', isCenterZero && progressValue < 0);
      this._dom.toggleClass('inner', 'positive', isCenterZero && progressValue >= 0);
    } else {
      this._dom.addClass('inner', 'positive');
    }
    this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
  }

  // === TEMPLATE PROCESSING ===

  _validateProcessJinjaFields() {
    return Boolean(this.hass) && Boolean(this._resourceManager);
  }
}

/******************************************************************************************
 * 📦 EntityProgressTemplateCard
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-card-template"
 *
 * @class
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateCard extends EntityProgressTemplateBase {
  static _cardStructure = new TemplateStructure();
  static _baseClass = META.cards.template.typeName;
  _cardView = new CardTemplateView();

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
  }

  static getConfigElement() {
    return document.createElement(`${META.cards.template.editor}${CARD_CONTEXT.dev ? '-dev' : ''}`);
  }
}

/******************************************************************************************
 * 📦 EntityProgressTemplateBadge
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-badge-template"
 *
 * @class
 * @extends EntityProgressTemplateBase
 */
class EntityProgressTemplateBadge extends EntityProgressTemplateBase {
  static _baseClass = META.cards.badgeTemplate.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = CARD_CSS;
  _cardView = new BadgeTemplateView();

  static getConfigElement() {
    return document.createElement(`${META.cards.badgeTemplate.editor}${CARD_CONTEXT.dev ? '-dev' : ''}`);
  }

  setConfig(config) {
    super.setConfig(config);
    if (this.hass) setTimeout(() => this.refresh(), 0);
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${META.cards.badgeTemplate.typeName}${CARD_CONTEXT.dev ? '-dev' : ''}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}

/******************************************************************************************
 * 📦 CARD/BADGE EDITOR
 ******************************************************************************************/

const availableSpace = (gap = 16, factor = 0.5) => `calc((100% - ${gap}px) * ${factor})`;

/******************************************************************************************
 * 🛠️ EditorDOMHelper
 * ========================================================================================
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
    this.enqueue(name, 'display', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.style.display = visible ? '' : 'none';
    });
  }

  // ─── Dynamic selector ─────────────────────────────────────────────────────

  /**
   * Updates the selector of a ha-selector field.
   * Used for fields whose options depend on another field (e.g. attribute → entity).
   *
   * @param {string} name
   * @param {object} selector
   */
  updateSelector(name, selector) {
    this.enqueue(name, 'selector', () => {
      const el = this._domElements.get(name);
      if (!el) return;
      el.selector = selector;
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
  updateAll(config, resolveValue) {
    for (const [name, el] of this._domElements) {
      const def = el._fieldDef;
      if (!def) continue;

      // Visibility
      if (def.showIf) {
        this.updateVisibility(name, def.showIf(config));
      }

      // Dynamic selector
      if (def.selectorOf) {
        this.updateSelector(name, { attribute: { entity_id: config[def.selectorOf] ?? '' } });
      }

      // Champs virtuels — pas de valeur dans le config, géré par showIf uniquement
      if (def.virtual) {
        if (def.resolveVirtual) {
          const val = def.resolveVirtual(config);
          this.updateValue(name, val);
        }
        continue;
      }

      // Value
      const raw = resolveValue(def, config);
      const val = def.invert ? !raw : raw;
      this.updateValue(name, val);
    }
  }
}

/******************************************************************************************
 * 🛠️ EditorBase
 * ========================================================================================
 *
 * @class
 * @extends HTMLElement
 */

class EditorBase extends HTMLElement {
  static _fields = {
    /* --- cutomizee it
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

  // --- private state ---
  #config = {};
  #hassProvider = null;
  #dom = null;
  #boundOnChanged = null;
  _configHelper = new BaseConfigHelper();

  // === LIFECYCLE ===

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#hassProvider = HassProviderSingleton.getInstance();
    this.#dom = new EditorDOMHelper();
  }

  connectedCallback() {
    this.#boundOnChanged = this.#onChanged.bind(this);
    this.#render();
    this.shadowRoot.addEventListener('value-changed', this.#boundOnChanged);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('value-changed', this.#boundOnChanged);
    this.#boundOnChanged = null;
    // this.#dom.destroy();
  }

  // === PUBLIC API ===

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
    // config with default value
    this._configHelper.config = config;
    // current config
    this.#config = config;
    this.#updateFields();
  }

  // === RENDER (once) ===

  #render() {
    if (this.shadowRoot.querySelector('.editor')) return;

    const style = document.createElement('style');
    style.textContent = `
      .editor { display: flex; flex-direction: column; gap: 16px; }
      .panel-body { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; align-content: flex-start; padding: 8px 0; }
    `;

    const container = document.createElement('div');
    container.className = 'editor';

    for (const [section, def] of Object.entries(this.constructor._fields)) {
      container.appendChild(this.#buildExpansionPanel(section, def));
    }

    this.shadowRoot.append(style, container);
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

    const options = this.#hassProvider.localize('editor.option');
    const selectors = {
      text: () => ({ text: { mode: 'box' } }),
      entity: () => ({ entity: {} }),
      attribute: () => ({ attribute: { entity_id: this.#config.entity ?? '' } }),
      maxValueAttribute: () => ({ attribute: { entity_id: this.#config.max_value ?? '' } }),
      number: () => ({ number: {} }),
      decimal: () => ({ number: { min: 0, max: 10, mode: 'box' } }),
      template: () => ({ template: {} }),
      toggle: () => ({ boolean: {} }),
      action: () => ({ 'ui-action': {} }),
      icon: () => ({ icon: { icon_set: ['mdi'] } }),
      color: () => ({ 'ui-color': {} }),
      default: () => ({ text: { mode: 'box' } }),
      bar_size: () => buildSelect(options.bar_size),
      bar_orientation: () => buildSelect(options.bar_orientation),
      bar_position: () => buildSelect(options.bar_position),
      layout: () => buildSelect(options.layout),
      theme: () => buildSelect(options.theme),
    };

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  #resolveFieldMeta(field) {
    const isNested = field.name.includes('.');
    const [, childKey] = isNested ? field.name.split('.') : [null, null];
    const raw = EditorBase.#resolveValue(field, this._configHelper.config);
    const isInverted = field.invert ?? false;

    return {
      label: this.#hassProvider.localize('editor.field')[isNested ? `toggle_${childKey}` : field.name],
      value: isInverted ? !raw : raw,
      isInverted,
    };
  }

  #buildField(field) {
    const el = document.createElement('ha-selector');

    el.id = field.name;
    el.hass = this.hass;
    el.required = field.required ?? false;
    el.style.width = field.width ?? '100%';
    el.isArray = field.array ?? false;
    el.selector = this.#getSelectorForType(field.type);

    if (field.isInGroup) el.classList.add(field.isInGroup);

    const { label, value, isInverted } = this.#resolveFieldMeta(field);
    el.label = label;
    el.value = value;
    el.isInverted = isInverted;

    this.#dom.registerField(field.name, el, field);

    return el;
  }

  static #resolveValue(def, config) {
    const empty = ['toggle', 'number', 'decimal'].includes(def.type) ? undefined : '';
    if (!config) return empty;

    if (def.virtual && def.resolveVirtual) return def.resolveVirtual(config);

    const isNested = def.name.includes('.');
    const [parentKey, childKey] = isNested ? def.name.split('.') : [def.name, null];
    const key = def.target ?? def.name;

    if (isNested && def.array) return config[parentKey]?.includes(childKey) ?? false;
    if (isNested) return config[parentKey]?.[childKey] ?? empty;
    return config[key] ?? empty;
  }

  // === UPDATE (every setConfig) ===

  #updateFields() {
    this.#dom.updateAll(this._configHelper.config, EditorBase.#resolveValue);
  }

  // === EVENTS ===

  #handleVirtualField(def, value) {
    if (!def.onVirtualChange) return;
    const newConfig = def.onVirtualChange(value, { ...this.#config });
    if (newConfig) this.#sendConfig(newConfig);
  }

  #handleNestedArrayField(parentKey, childKey, value) {
    const current = [...(this.#config[parentKey] ?? [])];
    const updated = value ? [...current, childKey] : current.filter((v) => v !== childKey);
    this.#sendConfig({ ...this.#config, [parentKey]: updated });
  }

  #handleNestedField(parentKey, childKey, value) {
    this.#sendConfig({
      ...this.#config,
      [parentKey]: { ...this.#config[parentKey], [childKey]: value },
    });
  }

  #handleStdField(def, key, value) {
    const targetKey = def?.target ?? key;
    if (!value && def?.onClear) {
      this.#sendConfig(def.onClear({ ...this.#config }));
      return;
    }
    this.#sendConfig({ ...this.#config, [targetKey]: value });
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

  #sendConfig(config) {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

/******************************************************************************************
 * 🛠️ EditorFieldsType/EditorFactory
 * ========================================================================================
 */

const field = (type) => (name, o = {}) => ({ name, type, ...o });

const EditorFieldsType = {
  entity:  field('entity'),
  text:    field('text'),
  number:  field('number'),
  decimal: field('decimal'),
  toggle:  field('toggle'),
  tpl:     field('template'),
  action:  field('action'),
  select:  (name, o = {}) => ({ name, type: name, ...o }),
  templateOrType: (name, template, type, o = {}) => field(template ? 'template' : type)(name, o),
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
      }),
    },
  }),

  content: (template) => ({
    title: 'editor.title.content',
    icon: HA_CONTEXT.icons.textShort,
    fields: {
      name: EditorFieldsType.templateOrType('name', template, 'text'),
      toggleName: EditorFieldsType.toggle('hide.name', { invert: true, array: true }),
      ...(template
        ? {
            secondary: EditorFieldsType.tpl('secondary'),
            toggleSecondaryInfo: EditorFieldsType.toggle('hide.secondary_info', { invert: true, array: true }),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            unit: EditorFieldsType.text('unit', { width: availableSpace(32, 0.2) }),
            decimal: EditorFieldsType.decimal('decimal', { width: availableSpace(32, 0.2) }),
            min_value: EditorFieldsType.number('min_value', { width: availableSpace(32, 0.6) }),
            toggleUnit: EditorFieldsType.toggle('disable_unit', { invert: true }),
            max_value: EditorFieldsType.number('max_value', { showIf: (c) => typeof c.max_value !== 'string' }),
            use_max_entity: EditorFieldsType.toggle('use_max_entity', {
              virtual: true,
              resolveVirtual: (c) => typeof c.max_value === 'string',
              onVirtualChange: (value, config) => ({
                ...config,
                max_value: value ? '' : 100,
                max_value_attribute: value ? config.max_value_attribute : undefined,
              }),
            }),
            max_value_entity: EditorFieldsType.entity('max_value_entity', {
              target: 'max_value',
              showIf: (c) => typeof c.max_value === 'string',
              onClear: (config) => ({ ...config, max_value: 100, max_value_attribute: undefined }),
            }),
            max_value_attribute: EditorFieldsType.select('max_value_attribute', {
              type: 'maxValueAttribute',
              selectorOf: 'max_value',
              showIf: (c) => typeof c.max_value === 'string' && c.max_value !== '',
            }),
            toggleValue: EditorFieldsType.toggle('hide.value', { invert: true, array: true }),
            toggleSecondaryInfo: EditorFieldsType.toggle('hide.secondary_info', { invert: true, array: true }),
          }),
    },
  }),

  theme: (template, badge) => ({
    title: 'editor.title.theme',
    icon: HA_CONTEXT.icons.listBox,
    fields: {
      ...(template ? {} : { theme: EditorFieldsType.select('theme') }),
      icon: EditorFieldsType.templateOrType('icon', template, 'icon', template ? {} : { width: availableSpace() }),
      color: EditorFieldsType.templateOrType('color', template, 'color', {
        showIf: (c) => is.nullish(c.theme),
        ...(template ? {} : { width: availableSpace() }),
      }),
      toggleIcon: EditorFieldsType.toggle('hide.icon', { invert: true, array: true }),
      ...(badge
        ? {}
        : {
            force_circular_background: EditorFieldsType.toggle('force_circular_background'),
            bar_size: EditorFieldsType.select('bar_size', { width: availableSpace() }),
            bar_position: EditorFieldsType.select('bar_position', { width: availableSpace() }),
            bar_single_line: EditorFieldsType.toggle('bar_single_line', { showIf: (c) => c.bar_position === 'overlay' }),
            text_shadow: EditorFieldsType.toggle('text_shadow', { showIf: (c) => c.bar_position === 'overlay' }),
          }),
      bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
        showIf: (c) => is.nullish(c.theme),
        ...(template ? {} : { width: availableSpace() }),
      }),
      bar_orientation: EditorFieldsType.select('bar_orientation', template ? {} : { width: availableSpace() }),
      center_zero: EditorFieldsType.toggle('center_zero'),
      bar_effect: EditorFieldsType.tpl('bar_effect'),
      toggleBar: EditorFieldsType.toggle('hide.progress_bar', { invert: true, array: true }),
      ...(badge
        ? {}
        : {
            badge_icon: EditorFieldsType.tpl('badge_icon'),
            badge_color: EditorFieldsType.tpl('badge_color'),
            layout: EditorFieldsType.select('layout'),
          }),
    },
  }),

  interactions: (badge) => {
    const fields = [
      'tap_action',
      'hold_action',
      'double_tap_action',
      ...(badge ? [] : ['icon_tap_action', 'icon_hold_action', 'icon_double_tap_action']),
    ];
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: Object.fromEntries(fields.map((n) => [n, EditorFieldsType.action(n)])),
    };
  },

  build: (template, badge) => ({
    general: EditorFactory.general(template),
    content: EditorFactory.content(template),
    theme: EditorFactory.theme(template, badge),
    interactions: EditorFactory.interactions(badge),
  }),
};

/******************************************************************************************
 * 🛠️ EntityProgressCardEditor
 * ========================================================================================
 */
class EntityProgressCardEditor extends EditorBase {
  _configHelper = new CardConfigHelper();
  static _fields = EditorFactory.build(false, false);
}

/******************************************************************************************
 * 🛠️ EntityProgressBadgeEditor
 * ========================================================================================
 */
class EntityProgressBadgeEditor extends EditorBase {
  _configHelper = new BadgeConfigHelper();
  static _fields = EditorFactory.build(false, true);
}

/******************************************************************************************
 * 🛠️ EntityProgressTemplateEditor
 * ========================================================================================
 */

class EntityProgressTemplateEditor extends EditorBase {
  _configHelper = new TemplateConfigHelper();
  static _fields = EditorFactory.build(true, false);
}

/******************************************************************************************
 * 🛠️ EntityProgressBadgeTemplateEditor
 * ========================================================================================
 */

class EntityProgressBadgeTemplateEditor extends EditorBase {
  _configHelper = new BadgeTemplateConfigHelper();
  static _fields = EditorFactory.build(true, true);
}

/******************************************************************************************
 * 🔧 Register components
 */

RegistrationHelper.registerCard(META.cards.card, EntityProgressCard, EntityProgressCardEditor);
RegistrationHelper.registerBadge(META.cards.badge, EntityProgressBadge, EntityProgressBadgeEditor);
RegistrationHelper.registerCard(META.cards.template, EntityProgressTemplateCard, EntityProgressTemplateEditor);
RegistrationHelper.registerBadge(META.cards.badgeTemplate, EntityProgressTemplateBadge, EntityProgressBadgeTemplateEditor);
RegistrationHelper.registerCardFeature(META.cards.feature, EntityProgressFeatures);

/******************************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
console.log(CARD.console.link);
console.groupEnd();
