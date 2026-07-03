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
  }
};

const CARD_CONTEXT = {
  dev: true,
  // editor: true, interactionHandler: true
  debug: { card: false, editor: false, interactionHandler: false, ressourceManager: false, hass: false },
};

const devName = (name) => `${name}${CARD_CONTEXT.dev ? '-dev' : ''}`;

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
    type: { timer: 'timer', light: 'light', cover: 'cover', fan: 'fan', climate: 'climate', counter: 'counter', number: 'number', duration: 'duration', default: 'default'},
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
      icon: { element: 'div', class: 'icon-section', extraAttr: {'aria-hidden': 'true'} },
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
      secondaryInfoValue: { element: 'span', class: 'secondary-info-value' },
      secondaryInfoMain: { element: 'span', class: 'secondary-info-main', id: 'entity-value' },
      secondaryInfoExtra: { element: 'span', class: 'secondary-info-extra' },
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
        bar: { element: 'div', class: 'progress-bar', extraAttr: {'aria-hidden': 'true'} },
        half: { element: 'div', class: 'bar-half', extraAttr: {'aria-hidden': 'true'} },
        inner: { element: 'div', class: 'inner', extraAttr: {'aria-hidden': 'true'}  },
        zeroMark: { element: 'div', class: 'zero', extraAttr: {'aria-hidden': 'true'} },
        lowWatermark: { element: 'div', class: 'low', extraAttr: {'aria-hidden': 'true'} },
        highWatermark: { element: 'div', class: 'high', extraAttr: {'aria-hidden': 'true'} },
        watermark: { class: 'progress-bar-wm' },
      },
      badge: {
        container: { element: 'div', class: 'badge', extraAttr: {'aria-hidden': 'true'} },
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
  color_mode: 'auto',
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
        bar_effect_jinja: 'تأثير الشريط (وضع Jinja)',
        bar_orientation: 'اتجاه الشريط',
        bar_position: 'موضع الشريط',
        bar_single_line: 'معلومات في سطر واحد (تراكب)',
        bar_size: 'حجم الشريط',
        color_mode: 'وضع اللون',
        center_zero: 'صفر في الوسط',
        center_zero_value: 'قيمة المركز',
        center_zero_growth_percent: 'نسبة النمو',
        color: 'اللون الأساسي',
        decimal: 'عشري',
        disable_unit: 'عرض الوحدة',
        double_tap_action: 'الإجراء عند النقر المزدوج',
        entity: 'الكيان',
        force_circular_background: 'فرض خلفية دائرية',
        hide_jinja: 'إخفاء (وضع Jinja)',
        hold_action: 'الإجراء عند الضغط المطول',
        icon: 'أيقونة',
        icon_double_tap_action: 'الإجراء عند النقر المزدوج على الأيقونة',
        icon_hold_action: 'الإجراء عند الضغط المطول على الأيقونة',
        icon_tap_action: 'الإجراء عند النقر على الأيقونة',
        layout: 'تخطيط المحتوى',
        max_value: 'القيمة القصوى',
        max_value_attribute: 'السمة (max_value)',
        min_value: 'القيمة الدنيا',
        name: 'الاسم',
        percent: 'النسبة المئوية',
        reverse_secondary_info_row: 'تبديل الشريط والنص',
        secondary: 'معلومات ثانوية',
        state_content: 'محتوى الحالة',
        show_all_actions: 'إظهار جميع الإجراءات',
        tap_action: 'الإجراء عند النقر القصير',
        text_shadow: 'إضافة ظل للنص (overlay)',
        theme: 'السمة',
        unit: 'الوحدة',
        use_max_entity: 'استخدام الكيان للقيمة القصوى',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'معلومات إضافية (ثانوية)',
        interpolate: 'تدرج الألوان',
        name_info: 'معلومات إضافية (الاسم)',
        reverse: 'عكس المؤقت',
        additions: 'كيانات إضافية'
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
        color_mode: {
          auto: 'تلقائي',
          segment: 'مقطعي',
          rainbow: 'قوس قزح'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'বারের প্রভাব (Jinja মোড)',
        bar_orientation: 'বারের অভিমুখ',
        bar_position: 'বারের অবস্থান',
        bar_single_line: 'এক লাইনে তথ্য (ওভারলে)',
        bar_size: 'বারের আকার',
        color_mode: 'রঙের মোড',
        center_zero: 'মাঝে শূন্য',
        center_zero_value: 'কেন্দ্রীয় মান',
        center_zero_growth_percent: 'প্রবৃদ্ধির শতাংশ',
        color: 'প্রাথমিক রঙ',
        decimal: 'দশমিক',
        disable_unit: 'একক দেখান',
        double_tap_action: 'ডাবল ট্যাপ আচরণ',
        entity: 'সত্তা',
        force_circular_background: 'বৃত্তাকার পটভূমি জোর করুন',
        hide_jinja: 'লুকান (Jinja মোড)',
        hold_action: 'হোল্ড আচরণ',
        icon: 'আইকন',
        icon_double_tap_action: 'আইকন ডাবল ট্যাপ আচরণ',
        icon_hold_action: 'আইকন হোল্ড আচরণ',
        icon_tap_action: 'আইকন ট্যাপ আচরণ',
        layout: 'বিষয়বস্তুর বিন্যাস',
        max_value: 'সর্বোচ্চ মান',
        max_value_attribute: 'বৈশিষ্ট্য (max_value)',
        min_value: 'ন্যূনতম মান',
        name: 'নাম',
        percent: 'শতাংশ',
        reverse_secondary_info_row: 'বার এবং টেক্সট অদলবদল করুন',
        secondary: 'দ্বিতীয় তথ্য',
        state_content: 'স্টেটের বিষয়বস্তু',
        show_all_actions: 'সব অ্যাকশন দেখান',
        tap_action: 'ট্যাপ আচরণ',
        text_shadow: 'টেক্সটে ছায়া যোগ করুন (overlay)',
        theme: 'থিম',
        unit: 'একক',
        use_max_entity: 'সর্বোচ্চ মানের জন্য সত্তা ব্যবহার করুন',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'কাস্টম সেকেন্ডারি তথ্য',
        interpolate: 'রঙ ইন্টারপোলেশন',
        name_info: 'কাস্টম নাম তথ্য',
        reverse: 'টাইমার উল্টানো',
        additions: 'অতিরিক্ত সত্তা'
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
        color_mode: {
          auto: 'স্বয়ংক্রিয়',
          segment: 'বিভাগ',
          rainbow: 'রেইনবো'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efecte de la barra (mode Jinja)',
        bar_orientation: 'Orientació de la barra',
        bar_position: 'Posició de la barra',
        bar_single_line: 'Informació en una sola línia (overlay)',
        bar_size: 'Mida de la barra',
        color_mode: 'Mode de color',
        center_zero: 'Zero al centre',
        center_zero_value: 'Valor de centratge',
        center_zero_growth_percent: 'Percentatge de creixement',
        color: 'Color principal',
        decimal: 'Decimal',
        disable_unit: 'Mostra la unitat',
        double_tap_action: 'Acció al doble tocar',
        entity: 'Entitat',
        force_circular_background: 'Forçar fons circular',
        hide_jinja: 'Amaga (mode Jinja)',
        hold_action: 'Acció en mantenir premut',
        icon: 'Icona',
        icon_double_tap_action: 'Acció al doble tocar la icona',
        icon_hold_action: 'Acció en mantenir premuda la icona',
        icon_tap_action: 'Acció al tocar la icona',
        layout: 'Disposició del contingut',
        max_value: 'Valor màxim',
        max_value_attribute: 'Atribut (valor màxim)',
        min_value: 'Valor mínim',
        name: 'Nom',
        percent: 'Percentatge',
        reverse_secondary_info_row: 'Intercanvia barra i text',
        secondary: 'Informació secundària',
        state_content: 'Contingut de l\'estat',
        show_all_actions: 'Mostra totes les accions',
        tap_action: 'Acció al tocar breument',
        text_shadow: 'Afegir ombra al text (overlay)',
        theme: 'Tema',
        unit: 'Unitat',
        use_max_entity: 'Usar una entitat com a valor màxim',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Informació addicional (secundària)',
        interpolate: 'Interpolar colors',
        name_info: 'Informació addicional (nom)',
        reverse: 'Temporitzador invers',
        additions: 'Entitats addicionals'
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
        color_mode: {
          auto: 'Automàtic',
          segment: 'Segments',
          rainbow: 'Arc de Sant Martí'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efekt na liště (režim Jinja)',
        bar_orientation: 'Orientace lišty',
        bar_position: 'Umístění lišty',
        bar_single_line: 'Info v jednom řádku (overlay)',
        bar_size: 'Velikost lišty',
        color_mode: 'Barevný režim',
        center_zero: 'Nula uprostřed',
        center_zero_value: 'Hodnota středu',
        center_zero_growth_percent: 'Procento růstu',
        color: 'Hlavní barva',
        decimal: 'desetinný',
        disable_unit: 'Zobrazit jednotku',
        double_tap_action: 'Chování při dvojitém klepnutí',
        entity: 'Entita',
        force_circular_background: 'Vynutit kruhové pozadí',
        hide_jinja: 'Skrýt (režim Jinja)',
        hold_action: 'Chování při podržení',
        icon: 'Ikona',
        icon_double_tap_action: 'Chování při dvojitém klepnutí na ikonu',
        icon_hold_action: 'Chování při podržení ikony',
        icon_tap_action: 'Chování při klepnutí na ikonu',
        layout: 'Rozložení obsahu',
        max_value: 'Maximální hodnota',
        max_value_attribute: 'Atribut (max_value)',
        min_value: 'Minimální hodnota',
        name: 'Název',
        percent: 'Procento',
        reverse_secondary_info_row: 'Zaměnit lištu a text',
        secondary: 'Sekundární informace',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobrazit všechny akce',
        tap_action: 'Chování při klepnutí',
        text_shadow: 'Přidat stín textu (overlay)',
        theme: 'Motiv',
        unit: 'Jednotka',
        use_max_entity: 'Použít entitu pro max hodnotu',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Vlastní sekundární info',
        interpolate: 'Interpolace barev',
        name_info: 'Vlastní info názvu',
        reverse: 'Obrátit časovač',
        additions: 'Další entity'
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
        color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Duha'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effekt på bar (Jinja-tilstand)',
        bar_orientation: 'Bar-retning',
        bar_position: 'Bar-placering',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        color_mode: 'Farvetilstand',
        center_zero: 'Center nul',
        center_zero_value: 'Centerværdi',
        center_zero_growth_percent: 'Vækstprocent',
        color: 'Primær farve',
        decimal: 'decimal',
        disable_unit: 'Vis enhed',
        double_tap_action: 'Handling ved dobbelt tryk',
        entity: 'Enhed',
        force_circular_background: 'Tving cirkulær baggrund',
        hide_jinja: 'Skjul (Jinja-tilstand)',
        hold_action: 'Handling ved langt tryk',
        icon: 'Ikon',
        icon_double_tap_action: 'Handling ved dobbelt tryk på ikonet',
        icon_hold_action: 'Handling ved langt tryk på ikonet',
        icon_tap_action: 'Handling ved tryk på ikonet',
        layout: 'Indholdslayout',
        max_value: 'Maksimal værdi',
        max_value_attribute: 'Attribut (max_value)',
        min_value: 'Minimumsværdi',
        name: 'Navn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Skift bjælke og tekst',
        secondary: 'Sekundær info',
        state_content: 'Indhold af tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort tryk',
        text_shadow: 'Tilføj tekstskygge (overlay)',
        theme: 'Tema',
        unit: 'Enhed',
        use_max_entity: 'Brug enhed for max-værdi',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Tilpasset sekundær info',
        interpolate: 'Interpoler farver',
        name_info: 'Tilpasset navneinfo',
        reverse: 'Omvendt timer',
        additions: 'Ekstra entiteter'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effekt auf die Leiste (Jinja-Modus)',
        bar_orientation: 'Ausrichtung der Leiste',
        bar_position: 'Position der Leiste',
        bar_single_line: 'Informationen in einer Zeile (Overlay)',
        bar_size: 'Größe der Bar',
        color_mode: 'Farbmodus',
        center_zero: 'Null in der Mitte',
        center_zero_value: 'Zentrumswert',
        center_zero_growth_percent: 'Wachstumsprozentsatz',
        color: 'Primärfarbe',
        decimal: 'dezimal',
        disable_unit: 'Einheit anzeigen',
        double_tap_action: 'Aktion bei doppelt Tippen',
        entity: 'Entität',
        force_circular_background: 'Kreisförmigen Hintergrund erzwingen',
        hide_jinja: 'Ausblenden (Jinja-Modus)',
        hold_action: 'Aktion bei langem Tippen',
        icon: 'Symbol',
        icon_double_tap_action: 'Aktion bei doppelt Tippen auf das Symbol',
        icon_hold_action: 'Aktion bei langem Tippen auf das Symbol',
        icon_tap_action: 'Aktion beim Tippen auf das Symbol',
        layout: 'Inhaltslayout',
        max_value: 'Höchstwert',
        max_value_attribute: 'Attribut (max_value)',
        min_value: 'Mindestwert',
        name: 'Name',
        percent: 'Prozent',
        reverse_secondary_info_row: 'Barra und Text tauschen',
        secondary: 'Sekundäre Informationen',
        state_content: 'Statusinhalt',
        show_all_actions: 'Alle Aktionen anzeigen',
        tap_action: 'Aktion bei kurzem Tippen',
        text_shadow: 'Textschatten hinzufügen (Overlay)',
        theme: 'Thema',
        unit: 'Einheit',
        use_max_entity: 'Entität für Maximalwert verwenden',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Zusatzinfo (sekundär)',
        interpolate: 'Farben interpolieren',
        name_info: 'Zusatzinfo (Name)',
        reverse: 'Timer umkehren',
        additions: 'Weitere Entitäten'
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
        color_mode: {
          auto: 'Automatisch',
          segment: 'Segmente',
          rainbow: 'Regenbogen'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Εφέ γραμμής (λειτουργία Jinja)',
        bar_orientation: 'Κατεύθυνση γραμμής',
        bar_position: 'Θέση γραμμής',
        bar_single_line: 'Πληροφορίες σε μία γραμμή (overlay)',
        bar_size: 'Μέγεθος γραμμής',
        color_mode: 'Λειτουργία χρώματος',
        center_zero: 'Μηδέν στο κέντρο',
        center_zero_value: 'Τιμή κέντρου',
        center_zero_growth_percent: 'Ποσοστό μεταβολής',
        color: 'Κύριο χρώμα',
        decimal: 'δεκαδικά',
        disable_unit: 'Εμφάνιση μονάδας',
        double_tap_action: 'Ενέργεια κατά το διπλό πάτημα',
        entity: 'Οντότητα',
        force_circular_background: 'Εξαναγκασμός κυκλικού φόντου',
        hide_jinja: 'Απόκρυψη (λειτουργία Jinja)',
        hold_action: 'Ενέργεια κατά το παρατεταμένο πάτημα',
        icon: 'Εικονίδιο',
        icon_double_tap_action: 'Ενέργεια στο διπλό πάτημα του εικονιδίου',
        icon_hold_action: 'Ενέργεια στο παρατεταμένο πάτημα του εικονιδίου',
        icon_tap_action: 'Ενέργεια στο πάτημα του εικονιδίου',
        layout: 'Διάταξη περιεχομένου',
        max_value: 'Μέγιστη τιμή',
        max_value_attribute: 'Χαρακτηριστικό (max_value)',
        min_value: 'Ελάχιστη τιμή',
        name: 'Όνομα',
        percent: 'Ποσοστό',
        reverse_secondary_info_row: 'Εναλλαγή γραμμής και κειμένου',
        secondary: 'Πρόσθετες πληροφορίες',
        state_content: 'Περιεχόμενο κατάστασης',
        show_all_actions: 'Εμφάνιση όλων των ενεργειών',
        tap_action: 'Ενέργεια κατά το σύντομο πάτημα',
        text_shadow: 'Προσθήκη σκιάς στο κείμενο (overlay)',
        theme: 'Θέμα',
        unit: 'Μονάδα',
        use_max_entity: 'Χρήση οντότητας ως μέγιστης τιμής',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Προσαρμοσμένη δευτερεύουσα πληροφορία',
        interpolate: 'Παρεμβολή χρωμάτων',
        name_info: 'Προσαρμοσμένη πληροφορία ονόματος',
        reverse: 'Αντίστροφο χρονόμετρο',
        additions: 'Πρόσθετες οντότητες'
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
        color_mode: {
          auto: 'Αυτόματο',
          segment: 'Τμήματα',
          rainbow: 'Ουράνιο τόξο'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Bar effect (Jinja mode)',
        bar_orientation: 'Bar orientation',
        bar_position: 'Bar position',
        bar_single_line: 'Single line info (overlay)',
        bar_size: 'Bar size',
        color_mode: 'Color mode',
        center_zero: 'Zero at center',
        center_zero_value: 'Center value',
        center_zero_growth_percent: 'Growth percentage',
        color: 'Primary color',
        decimal: 'decimal',
        disable_unit: 'Show unit',
        double_tap_action: 'Double tap behavior',
        entity: 'Entity',
        force_circular_background: 'Force icon circular background',
        hide_jinja: 'Hide (Jinja mode)',
        hold_action: 'Hold behavior',
        icon: 'Icon',
        icon_double_tap_action: 'Icon double tap behavior',
        icon_hold_action: 'Icon hold behavior',
        icon_tap_action: 'Icon tap behavior',
        layout: 'Content layout',
        max_value: 'Maximum value',
        max_value_attribute: 'Attribute (max_value)',
        min_value: 'Minimum value',
        name: 'Name',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Swap bar and text',
        secondary: 'Secondary info',
        state_content: 'State content',
        show_all_actions: 'Show all interactions',
        tap_action: 'Tap behavior',
        text_shadow: 'Add text shadow (overlay)',
        theme: 'Theme',
        unit: 'Unit',
        use_max_entity: 'Use entity as max value',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Custom secondary info',
        interpolate: 'Interpolate colors',
        name_info: 'Custom name info',
        reverse: 'Reverse timer',
        additions: 'Additional entities'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Rainbow'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efecto de la barra de progreso (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en línea (superpuesta)',
        bar_size: 'Tamaño de la barra',
        color_mode: 'Modo de color',
        center_zero: 'Cero centrado',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color principal',
        decimal: 'Decimal',
        disable_unit: 'Mostrar unidad',
        double_tap_action: 'Acción al doble toque',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener presionado',
        icon: 'Ícono',
        icon_double_tap_action: 'Acción de doble toque en ícono',
        icon_hold_action: 'Acción al mantener presionado ícono',
        icon_tap_action: 'Acción al tocar ícono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (valor máximo)',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al tocar',
        text_shadow: 'Agregar sombra al texto (overlay)',
        theme: 'Tema',
        unit: 'Unidad',
        use_max_entity: 'Usar entidad como valor máximo',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info secundaria personalizada',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        additions: 'Entidades adicionales'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efecto de la barra (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en una sola línea (overlay)',
        bar_size: 'Tamaño de la barra',
        color_mode: 'Modo de color',
        center_zero: 'Cero en el centro',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color principal',
        decimal: 'decimal',
        disable_unit: 'Mostrar unidad',
        double_tap_action: 'Acción al pulsar dos veces',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener pulsado',
        icon: 'Icono',
        icon_double_tap_action: 'Acción al pulsar dos veces el icono',
        icon_hold_action: 'Acción al mantener pulsado el icono',
        icon_tap_action: 'Acción al pulsar el icono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al pulsar brevemente',
        text_shadow: 'Añadir sombra al texto (overlay)',
        theme: 'Tema',
        unit: 'Unidad',
        use_max_entity: 'Usar una entidad para el valor máximo',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info secundaria personalizada',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        additions: 'Entidades adicionales'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Riba efekt (Jinja režiim)',
        bar_orientation: 'Riba orientatsioon',
        bar_position: 'Riba positsioon',
        bar_single_line: 'Info ühel real (overlay)',
        bar_size: 'Riba suurus',
        color_mode: 'Värvirežiim',
        center_zero: 'Null keskel',
        center_zero_value: 'Keskväärtus',
        center_zero_growth_percent: 'Kasvuprotsent',
        color: 'Ikooni värv',
        decimal: 'Kümnendkoht',
        disable_unit: 'Näita ühikut',
        double_tap_action: 'Topeltpuudutuse tegevus',
        entity: 'Objekt',
        force_circular_background: 'Sunnitud ümmargune taust',
        hide_jinja: 'Peida (Jinja režiim)',
        hold_action: 'Pikema vajutuse tegevus',
        icon: 'Ikoon',
        icon_double_tap_action: 'Ikooni topeltpuudutuse tegevus',
        icon_hold_action: 'Ikooni pika vajutuse tegevus',
        icon_tap_action: 'Ikooni puudutuse tegevus',
        layout: 'Sisu paigutus',
        max_value: 'Maksimaalne väärtus',
        max_value_attribute: 'Atribuut (max_value)',
        min_value: 'Minimaalne väärtus',
        name: 'Nimi',
        percent: 'Protsent',
        reverse_secondary_info_row: 'Vaheta riba ja tekst',
        secondary: 'Täiendav info',
        state_content: 'Oleku sisu',
        show_all_actions: 'Kuva kõik toimingud',
        tap_action: 'Puudutuse tegevus',
        text_shadow: 'Lisa teksti vari (overlay)',
        theme: 'Teema',
        unit: 'Ühik',
        use_max_entity: 'Kasuta objekti maksimaalse väärtuse jaoks',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Kohandatud sekundaarne teave',
        interpolate: 'Värvide interpoleerimine',
        name_info: 'Kohandatud nime teave',
        reverse: 'Pööratud taimer',
        additions: 'Täiendavad üksused'
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
        color_mode: {
          auto: 'Automaatne',
          segment: 'Segmendid',
          rainbow: 'Vikerkaar'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Palkin efekti (Jinja-tila)',
        bar_orientation: 'Palkin suunta',
        bar_position: 'Palkin sijainti',
        bar_single_line: 'Tiedot yhdellä rivillä (overlay)',
        bar_size: 'Palkin koko',
        color_mode: 'Väritila',
        center_zero: 'Nolla keskellä',
        center_zero_value: 'Keskiarvo',
        center_zero_growth_percent: 'Kasvuprosentti',
        color: 'Pääväri',
        decimal: 'desimaali',
        disable_unit: 'Näytä yksikkö',
        double_tap_action: 'Toiminto kahdella napautuksella',
        entity: 'Entiteetti',
        force_circular_background: 'Pakota pyöreä tausta',
        hide_jinja: 'Piilota (Jinja-tila)',
        hold_action: 'Toiminto pitkällä painalluksella',
        icon: 'Ikoni',
        icon_double_tap_action: 'Toiminto kahdella napautuksella kuvaketta',
        icon_hold_action: 'Toiminto pitkällä painalluksella kuvaketta',
        icon_tap_action: 'Toiminto kuvaketta napautettaessa',
        layout: 'Sisällön asettelu',
        max_value: 'Maksimiarvo',
        max_value_attribute: 'Attribuutti (max_value)',
        min_value: 'Minimiarvo',
        name: 'Nimi',
        percent: 'Prosentti',
        reverse_secondary_info_row: 'Vaihda palkki ja teksti',
        secondary: 'Lisätiedot',
        state_content: 'Tilan sisältö',
        show_all_actions: 'Näytä kaikki toiminnot',
        tap_action: 'Toiminto lyhyellä napautuksella',
        text_shadow: 'Lisää tekstivarjo (overlay)',
        theme: 'Teema',
        unit: 'Yksikkö',
        use_max_entity: 'Käytä entiteettiä maksimiarvona',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Mukautettu toissijainen tieto',
        interpolate: 'Interpoloi värit',
        name_info: 'Mukautettu nimitieto',
        reverse: 'Käänteinen ajastin',
        additions: 'Lisäentiteetit'
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
        color_mode: {
          auto: 'Automaattinen',
          segment: 'Segmentit',
          rainbow: 'Sateenkaari'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effet sur la barre (mode Jinja)',
        bar_orientation: 'Orientation de la barre',
        bar_position: 'Position de la barre',
        bar_single_line: 'Infos sur une ligne (overlay)',
        bar_size: 'Taille de la barre',
        color_mode: 'Mode de couleur',
        center_zero: 'Zéro au centre',
        center_zero_value: 'Valeur de centrage',
        center_zero_growth_percent: 'Pourcentage de croissance',
        color: 'Couleur de l\'icône',
        decimal: 'décimal',
        disable_unit: 'Afficher l\'unité',
        double_tap_action: 'Comportement lors d\'un double appui',
        entity: 'Entité',
        force_circular_background: 'Forcer le fond circulaire',
        hide_jinja: 'Masquer (mode Jinja)',
        hold_action: 'Comportement lors d\'un appui long',
        icon: 'Icône',
        icon_double_tap_action: 'Comportement lors d\'un double appui sur l\'icône',
        icon_hold_action: 'Comportement lors d\'un appui long sur l\'icône',
        icon_tap_action: 'Comportement lors de l\'appui sur l\'icône',
        layout: 'Disposition du contenu',
        max_value: 'Valeur maximum',
        max_value_attribute: 'Attribut (max_value)',
        min_value: 'Valeur minimum',
        name: 'Nom',
        percent: 'Pourcentage',
        reverse_secondary_info_row: 'Intervertir barre et texte',
        secondary: 'Information secondaire',
        state_content: 'Contenu de l’état',
        show_all_actions: 'Afficher toutes les interactions',
        tap_action: 'Comportement lors d\'un appui court',
        text_shadow: 'Ajouter une ombre au texte (overlay)',
        theme: 'Thème',
        unit: 'Unité',
        use_max_entity: 'Utiliser une entité pour la valeur max',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info secondaire personnalisée',
        interpolate: 'Interpoler les couleurs',
        name_info: 'Info nom personnalisée',
        reverse: 'Inverser le minuteur',
        additions: 'Entités supplémentaires'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmenté',
          rainbow: 'Arc-en-ciel'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'बार पर प्रभाव (Jinja मोड)',
        bar_orientation: 'बार की दिशा',
        bar_position: 'बार की स्थिति',
        bar_single_line: 'एक पंक्ति में जानकारी (ओवरले)',
        bar_size: 'बार का आकार',
        color_mode: 'रंग मोड',
        center_zero: 'शून्य केंद्र में',
        center_zero_value: 'केंद्र मान',
        center_zero_growth_percent: 'वृद्धि प्रतिशत',
        color: 'मुख्य रंग',
        decimal: 'दशमलव',
        disable_unit: 'इकाई दिखाएँ',
        double_tap_action: 'डबल टैप व्यवहार',
        entity: 'एंटिटी',
        force_circular_background: 'गोलाकार पृष्ठभूमि को बाध्य करें',
        hide_jinja: 'छिपाएँ (Jinja मोड)',
        hold_action: 'होल्ड व्यवहार',
        icon: 'आइकन',
        icon_double_tap_action: 'आइकन डबल टैप व्यवहार',
        icon_hold_action: 'आइकन होल्ड व्यवहार',
        icon_tap_action: 'आइकन टैप व्यवहार',
        layout: 'सामग्री लेआउट',
        max_value: 'अधिकतम मान',
        max_value_attribute: 'एट्रिब्यूट (max_value)',
        min_value: 'न्यूनतम मान',
        name: 'नाम',
        percent: 'प्रतिशत',
        reverse_secondary_info_row: 'बार और टेक्स्ट बदलें',
        secondary: 'सहायक जानकारी',
        state_content: 'स्थिति की सामग्री',
        show_all_actions: 'सभी क्रियाएँ दिखाएँ',
        tap_action: 'टैप व्यवहार',
        text_shadow: 'टेक्स्ट में छाया जोड़ें (overlay)',
        theme: 'थीम',
        unit: 'इकाई',
        use_max_entity: 'अधिकतम मान के लिए एंटिटी उपयोग करें',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'कस्टम द्वितीयक जानकारी',
        interpolate: 'रंग इंटरपोलेशन',
        name_info: 'कस्टम नाम जानकारी',
        reverse: 'टाइमर उलटें',
        additions: 'अतिरिक्त एंटिटी'
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
        color_mode: {
          auto: 'स्वचालित',
          segment: 'खंड',
          rainbow: 'इंद्रधनुष'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efekt na traci (Jinja način)',
        bar_orientation: 'Orijentacija trake',
        bar_position: 'Položaj trake',
        bar_single_line: 'Informacije u jednom retku (overlay)',
        bar_size: 'Veličina trake',
        color_mode: 'Način boje',
        center_zero: 'Nula u sredini',
        center_zero_value: 'Vrijednost sredine',
        center_zero_growth_percent: 'Postotak rasta',
        color: 'Primarna boja',
        decimal: 'decimalni',
        disable_unit: 'Prikaži jedinicu',
        double_tap_action: 'Radnja na dupli dodir',
        entity: 'Entitet',
        force_circular_background: 'Prisili kružnu pozadinu',
        hide_jinja: 'Sakrij (Jinja način)',
        hold_action: 'Radnja na dugi dodir',
        icon: 'Ikona',
        icon_double_tap_action: 'Radnja na dupli dodir ikone',
        icon_hold_action: 'Radnja na dugi dodir ikone',
        icon_tap_action: 'Radnja na dodir ikone',
        layout: 'Raspored sadržaja',
        max_value: 'Maksimalna vrijednost',
        max_value_attribute: 'Atribut (max_value)',
        min_value: 'Minimalna vrijednost',
        name: 'Ime',
        percent: 'Postotak',
        reverse_secondary_info_row: 'Zamijeni traku i tekst',
        secondary: 'Sekundarne informacije',
        state_content: 'Sadržaj stanja',
        show_all_actions: 'Prikaži sve radnje',
        tap_action: 'Radnja na kratki dodir',
        text_shadow: 'Dodaj sjenu tekstu (overlay)',
        theme: 'Tema',
        unit: 'Jedinica',
        use_max_entity: 'Koristi entitet za maksimalnu vrijednost',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Prilagođena sekundarna informacija',
        interpolate: 'Interpolacija boja',
        name_info: 'Prilagođena informacija naziva',
        reverse: 'Obrnuti tajmer',
        additions: 'Dodatni entiteti'
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
        color_mode: {
          auto: 'Automatski',
          segment: 'Segmenti',
          rainbow: 'Duga'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Sáv effektus (Jinja mód)',
        bar_orientation: 'Sáv iránya',
        bar_position: 'Sáv pozíciója',
        bar_single_line: 'Egy soros információ (overlay)',
        bar_size: 'Sáv mérete',
        color_mode: 'Szín mód',
        center_zero: 'Nulla középen',
        center_zero_value: 'Középérték',
        center_zero_growth_percent: 'Növekedési százalék',
        color: 'Ikon színe',
        decimal: 'Tizedes',
        disable_unit: 'Egység megjelenítése',
        double_tap_action: 'Kettős koppintás művelet',
        entity: 'Entitás',
        force_circular_background: 'Kör alakú háttér erőltetése',
        hide_jinja: 'Elrejtés (Jinja mód)',
        hold_action: 'Hosszan tartó nyomás művelet',
        icon: 'Ikon',
        icon_double_tap_action: 'Ikon dupla koppintás művelet',
        icon_hold_action: 'Ikon hosszan nyomás művelet',
        icon_tap_action: 'Ikon koppintás művelet',
        layout: 'Tartalom elrendezése',
        max_value: 'Maximális érték',
        max_value_attribute: 'Attribútum (max_value)',
        min_value: 'Minimális érték',
        name: 'Név',
        percent: 'Százalék',
        reverse_secondary_info_row: 'Cserélje fel a sávot és a szöveget',
        secondary: 'Másodlagos információ',
        state_content: 'Állapot tartalma',
        show_all_actions: 'Az összes művelet megjelenítése',
        tap_action: 'Koppintás művelet',
        text_shadow: 'Szöveg árnyék hozzáadása (overlay)',
        theme: 'Téma',
        unit: 'Mértékegység',
        use_max_entity: 'Entitás használata max értékhez',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Egyéni másodlagos info',
        interpolate: 'Színinterpoláció',
        name_info: 'Egyéni névinfo',
        reverse: 'Fordított időzítő',
        additions: 'További entitások'
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
        color_mode: {
          auto: 'Automatikus',
          segment: 'Szegmens',
          rainbow: 'Szivárvány'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efek pada bar (mode Jinja)',
        bar_orientation: 'Orientasi bar',
        bar_position: 'Posisi bar',
        bar_single_line: 'Info dalam satu baris (overlay)',
        bar_size: 'Ukuran bar',
        color_mode: 'Mode warna',
        center_zero: 'Nol di tengah',
        center_zero_value: 'Nilai tengah',
        center_zero_growth_percent: 'Persentase pertumbuhan',
        color: 'Warna utama',
        decimal: 'desimal',
        disable_unit: 'Tampilkan unit',
        double_tap_action: 'Perilaku ketuk ganda',
        entity: 'Entitas',
        force_circular_background: 'Paksa latar belakang melingkar',
        hide_jinja: 'Sembunyikan (mode Jinja)',
        hold_action: 'Perilaku tahan',
        icon: 'Ikon',
        icon_double_tap_action: 'Perilaku ketuk ganda ikon',
        icon_hold_action: 'Perilaku tahan ikon',
        icon_tap_action: 'Perilaku ketuk ikon',
        layout: 'Tata letak konten',
        max_value: 'Nilai maksimum',
        max_value_attribute: 'Atribut (max_value)',
        min_value: 'Nilai minimum',
        name: 'Nama',
        percent: 'Persentase',
        reverse_secondary_info_row: 'Tukar bilah dan teks',
        secondary: 'Informasi sekunder',
        state_content: 'Konten status',
        show_all_actions: 'Tampilkan semua tindakan',
        tap_action: 'Perilaku ketuk',
        text_shadow: 'Tambahkan bayangan teks (overlay)',
        theme: 'Tema',
        unit: 'Unit',
        use_max_entity: 'Gunakan entitas untuk nilai maksimum',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info sekunder kustom',
        interpolate: 'Interpolasi warna',
        name_info: 'Info nama kustom',
        reverse: 'Timer terbalik',
        additions: 'Entitas tambahan'
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
        color_mode: {
          auto: 'Otomatis',
          segment: 'Segmen',
          rainbow: 'Pelangi'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effetto sulla barra (modalità Jinja)',
        bar_orientation: 'Orientamento della barra',
        bar_position: 'Posizione della barra',
        bar_single_line: 'Info su una riga (overlay)',
        bar_size: 'Dimensione della barra',
        color_mode: 'Modalità colore',
        center_zero: 'Zero al centro',
        center_zero_value: 'Valore centrale',
        center_zero_growth_percent: 'Percentuale di crescita',
        color: 'Colore dell\'icona',
        decimal: 'Decimale',
        disable_unit: 'Mostra unità',
        double_tap_action: 'Azione al doppio tocco',
        entity: 'Entità',
        force_circular_background: 'Forza sfondo circolare',
        hide_jinja: 'Nascondi (modalità Jinja)',
        hold_action: 'Azione al tocco prolungato',
        icon: 'Icona',
        icon_double_tap_action: 'Azione al doppio tocco dell\'icona',
        icon_hold_action: 'Azione al tocco prolungato dell\'icona',
        icon_tap_action: 'Azione al tocco dell\'icona',
        layout: 'Layout del contenuto',
        max_value: 'Valore massimo',
        max_value_attribute: 'Attributo (max_value)',
        min_value: 'Valore minimo',
        name: 'Nome',
        percent: 'Percentuale',
        reverse_secondary_info_row: 'Scambia barra e testo',
        secondary: 'Informazione secondaria',
        state_content: 'Contenuto dello stato',
        show_all_actions: 'Mostra tutte le azioni',
        tap_action: 'Azione al tocco breve',
        text_shadow: 'Aggiungi ombra al testo (overlay)',
        theme: 'Tema',
        unit: 'Unità',
        use_max_entity: 'Usa un\'entità per il valore massimo',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info secondaria personalizzata',
        interpolate: 'Interpolazione colori',
        name_info: 'Info nome personalizzata',
        reverse: 'Timer inverso',
        additions: 'Entità aggiuntive'
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
        color_mode: {
          auto: 'Automatico',
          segment: 'Segmenti',
          rainbow: 'Arcobaleno'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'バーのエフェクト (Jinjaモード)',
        bar_orientation: 'バーの向き',
        bar_position: 'バーの位置',
        bar_single_line: '1行で情報を表示（オーバーレイ）',
        bar_size: 'バーサイズ',
        color_mode: 'カラーモード',
        center_zero: 'ゼロを中央に',
        center_zero_value: '中心値',
        center_zero_growth_percent: '成長率',
        color: 'メインカラー',
        decimal: '小数点',
        disable_unit: '単位を表示',
        double_tap_action: 'ダブルタップしたときの動作',
        entity: 'エンティティ',
        force_circular_background: '円形の背景を強制する',
        hide_jinja: '非表示 (Jinjaモード)',
        hold_action: '長押ししたときの動作',
        icon: 'アイコン',
        icon_double_tap_action: 'アイコンをダブルタップしたときの動作',
        icon_hold_action: 'アイコンを長押ししたときの動作',
        icon_tap_action: 'アイコンをタップしたときの動作',
        layout: 'コンテンツのレイアウト',
        max_value: '最大値',
        max_value_attribute: '属性（最大値）',
        min_value: '最小値',
        name: '名前',
        percent: 'パーセント',
        reverse_secondary_info_row: 'バーとテキストを入れ替える',
        secondary: '補足情報',
        state_content: '状態の内容',
        show_all_actions: 'すべての操作を表示',
        tap_action: '短くタップしたときの動作',
        text_shadow: 'テキストに影を追加 (オーバーレイ)',
        theme: 'テーマ',
        unit: '単位',
        use_max_entity: '最大値にエンティティを使用',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'カスタム補助情報',
        interpolate: '色の補間',
        name_info: 'カスタム名前情報',
        reverse: 'タイマーを逆にする',
        additions: '追加エンティティ'
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
        color_mode: {
          auto: '自動',
          segment: 'セグメント',
          rainbow: 'レインボー'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: '바 효과 (Jinja 모드)',
        bar_orientation: '바 방향',
        bar_position: '바 위치',
        bar_single_line: '한 줄로 정보 표시 (오버레이)',
        bar_size: '바 크기',
        color_mode: '색상 모드',
        center_zero: '중앙에 영점',
        center_zero_value: '중앙값',
        center_zero_growth_percent: '성장률',
        color: '기본 색상',
        decimal: '소수점',
        disable_unit: '단위 표시',
        double_tap_action: '더블 탭 시 동작',
        entity: '엔티티',
        force_circular_background: '원형 배경 강제 적용',
        hide_jinja: '숨기기 (Jinja 모드)',
        hold_action: '길게 누를 시 동작',
        icon: '아이콘',
        icon_double_tap_action: '아이콘 더블 탭 시 동작',
        icon_hold_action: '아이콘 길게 누를 시 동작',
        icon_tap_action: '아이콘 탭 시 동작',
        layout: '콘텐츠 레이아웃',
        max_value: '최대값',
        max_value_attribute: '속성 (최대값)',
        min_value: '최소값',
        name: '이름',
        percent: '퍼센트',
        reverse_secondary_info_row: '막대와 텍스트 교체',
        secondary: '보조 정보',
        state_content: '상태 콘텐츠',
        show_all_actions: '모든 액션 표시',
        tap_action: '짧게 탭 시 동작',
        text_shadow: '텍스트 그림자 추가 (오버레이)',
        theme: '테마',
        unit: '단위',
        use_max_entity: '최대값에 엔티티 사용',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: '사용자 정의 보조 정보',
        interpolate: '색상 보간',
        name_info: '사용자 정의 이름 정보',
        reverse: '타이머 역방향',
        additions: '추가 엔티티'
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
        color_mode: {
          auto: '자동',
          segment: '세그먼트',
          rainbow: '무지개'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Juostos efektas (Jinja režimas)',
        bar_orientation: 'Juostos orientacija',
        bar_position: 'Juostos pozicija',
        bar_single_line: 'Informacija vienoje eilutėje (overlay)',
        bar_size: 'Juostos dydis',
        color_mode: 'Spalvos režimas',
        center_zero: 'Nulis centre',
        center_zero_value: 'Centro reikšmė',
        center_zero_growth_percent: 'Augimo procentas',
        color: 'Ikonos spalva',
        decimal: 'Dešimtainė',
        disable_unit: 'Rodyti vienetą',
        double_tap_action: 'Dviejų bakstelėjimų veiksmas',
        entity: 'Entity',
        force_circular_background: 'Priversti apvalų foną',
        hide_jinja: 'Slėpti (Jinja režimas)',
        hold_action: 'Ilgo paspaudimo veiksmas',
        icon: 'Ikona',
        icon_double_tap_action: 'Ikonos dviejų bakstelėjimų veiksmas',
        icon_hold_action: 'Ikonos ilgo paspaudimo veiksmas',
        icon_tap_action: 'Ikonos bakstelėjimo veiksmas',
        layout: 'Turinio išdėstymas',
        max_value: 'Maksimali reikšmė',
        max_value_attribute: 'Atributas (max_value)',
        min_value: 'Minimali reikšmė',
        name: 'Pavadinimas',
        percent: 'Procentai',
        reverse_secondary_info_row: 'Sukeisti juostą ir tekstą',
        secondary: 'Papildoma informacija',
        state_content: 'Būsenos turinys',
        show_all_actions: 'Rodyti visus veiksmus',
        tap_action: 'Bakstelėjimo veiksmas',
        text_shadow: 'Pridėti teksto šešėlį (overlay)',
        theme: 'Tema',
        unit: 'Vienetas',
        use_max_entity: 'Naudoti entity max reikšmei',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Pasirinktinė papildoma informacija',
        interpolate: 'Spalvų interpoliavimas',
        name_info: 'Pasirinktinė pavadinimo informacija',
        reverse: 'Atvirkštinis laikmatis',
        additions: 'Papildomos esybės'
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
        color_mode: {
          auto: 'Automatinis',
          segment: 'Segmentai',
          rainbow: 'Vaivorykštė'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Joslas efekts (Jinja režīms)',
        bar_orientation: 'Joslas orientācija',
        bar_position: 'Joslas pozīcija',
        bar_single_line: 'Informācija vienā rindā (overlay)',
        bar_size: 'Joslas izmērs',
        color_mode: 'Krāsas režīms',
        center_zero: 'Nulles centrā',
        center_zero_value: 'Centra vērtība',
        center_zero_growth_percent: 'Pieauguma procents',
        color: 'Ikonas krāsa',
        decimal: 'Decimāldaļa',
        disable_unit: 'Rādīt vienību',
        double_tap_action: 'Divreiz pieskaroties',
        entity: 'Vienība',
        force_circular_background: 'Piespiest apļu fonu',
        hide_jinja: 'Slēpt (Jinja režīms)',
        hold_action: 'Ilgs pieskāriens',
        icon: 'Ikona',
        icon_double_tap_action: 'Ikonas dubults pieskāriens',
        icon_hold_action: 'Ikonas ilgs pieskāriens',
        icon_tap_action: 'Ikonas pieskāriens',
        layout: 'Satura izkārtojums',
        max_value: 'Maksimālā vērtība',
        max_value_attribute: 'Atribūts (max_value)',
        min_value: 'Minimālā vērtība',
        name: 'Nosaukums',
        percent: 'Procenti',
        reverse_secondary_info_row: 'Mainīt joslu un tekstu',
        secondary: 'Papildu informācija',
        state_content: 'Stāvokļa saturs',
        show_all_actions: 'Rādīt visas darbības',
        tap_action: 'Pieskāriens',
        text_shadow: 'Pievienot teksta ēnu (overlay)',
        theme: 'Tēma',
        unit: 'Vienība',
        use_max_entity: 'Izmantot vienību max vērtībai',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Pielāgota sekundārā informācija',
        interpolate: 'Krāsu interpolācija',
        name_info: 'Pielāgota nosaukuma informācija',
        reverse: 'Apgriezts taimeris',
        additions: 'Papildu entītijas'
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
        color_mode: {
          auto: 'Automātisks',
          segment: 'Segmenti',
          rainbow: 'Varavīksne'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Ефект на лентата (Jinja режим)',
        bar_orientation: 'Ориентација на лентата',
        bar_position: 'Позиција на лентата',
        bar_single_line: 'Инфо во еден ред (overlay)',
        bar_size: 'Големина на лента',
        color_mode: 'Режим на боја',
        center_zero: 'Нула во центарот',
        center_zero_value: 'Централна вредност',
        center_zero_growth_percent: 'Процент на растеж',
        color: 'Примарна боја',
        decimal: 'децемален',
        disable_unit: 'Прикажи единица',
        double_tap_action: 'Дејство при двоен допир',
        entity: 'Ентитет',
        force_circular_background: 'Принуди кружна позадина',
        hide_jinja: 'Сокриј (Jinja режим)',
        hold_action: 'Дејство при долг допир',
        icon: 'Икона',
        icon_double_tap_action: 'Дејство при двоен допир на иконата',
        icon_hold_action: 'Дејство при долг допир на иконата',
        icon_tap_action: 'Дејство при допир на иконата',
        layout: 'Распоред на содржината',
        max_value: 'Максимална вредност',
        max_value_attribute: 'Атрибут (max_value)',
        min_value: 'Минимална вредност',
        name: 'Име',
        percent: 'Процент',
        reverse_secondary_info_row: 'Сменете ги лентата и текстот',
        secondary: 'Секундарни информации',
        state_content: 'Содржина на состојба',
        show_all_actions: 'Прикажи ги сите дејства',
        tap_action: 'Дејство при краток допир',
        text_shadow: 'Додај сенка на текст (overlay)',
        theme: 'Тема',
        unit: 'Јединство',
        use_max_entity: 'Користи ентитет за максимална вредност',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Прилагодена секундарна информација',
        interpolate: 'Интерполација на бои',
        name_info: 'Прилагодена информација за имиња',
        reverse: 'Обратен тајмер',
        additions: 'Дополнителни ентитети'
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
        color_mode: {
          auto: 'Автоматски',
          segment: 'Сегменти',
          rainbow: 'Виножито'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effekt på baren (Jinja-modus)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Posisjon for baren',
        bar_single_line: 'Info på én linje (overlay)',
        bar_size: 'Bar størrelse',
        color_mode: 'Fargemodus',
        center_zero: 'Null i midten',
        center_zero_value: 'Senterverdi',
        center_zero_growth_percent: 'Vekstprosent',
        color: 'Primærfarge',
        decimal: 'desimal',
        disable_unit: 'Vis enhet',
        double_tap_action: 'Handling ved dobbelt trykk',
        entity: 'Enhet',
        force_circular_background: 'Tving sirkulær bakgrunn',
        hide_jinja: 'Skjul (Jinja-modus)',
        hold_action: 'Handling ved langt trykk',
        icon: 'Ikon',
        icon_double_tap_action: 'Handling ved dobbelt trykk på ikonet',
        icon_hold_action: 'Handling ved langt trykk på ikonet',
        icon_tap_action: 'Handling ved trykk på ikonet',
        layout: 'Innholdslayout',
        max_value: 'Maksimal verdi',
        max_value_attribute: 'Attributt (max_value)',
        min_value: 'Minste verdi',
        name: 'Navn',
        percent: 'Prosent',
        reverse_secondary_info_row: 'Bytt linje og tekst',
        secondary: 'Sekundær informasjon',
        state_content: 'Innhold i tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort trykk',
        text_shadow: 'Legg til tekstskygge (overlay)',
        theme: 'Tema',
        unit: 'Enhet',
        use_max_entity: 'Bruk enhet for maksimalverdi',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Egendefinert sekundær info',
        interpolate: 'Interpoler farger',
        name_info: 'Egendefinert navneinfo',
        reverse: 'Omvendt tidtaker',
        additions: 'Ekstra enheter'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effect op de balk (Jinja-modus)',
        bar_orientation: 'Oriëntatie van de balk',
        bar_position: 'Positie van de balk',
        bar_single_line: 'Info op één regel (overlay)',
        bar_size: 'Balkgrootte',
        color_mode: 'Kleurmodus',
        center_zero: 'Nul in het midden',
        center_zero_value: 'Centrumwaarde',
        center_zero_growth_percent: 'Groeipercentage',
        color: 'Primaire kleur',
        decimal: 'decimaal',
        disable_unit: 'Eenheid weergeven',
        double_tap_action: 'Actie bij dubbel tikken',
        entity: 'Entiteit',
        force_circular_background: 'Geforceerde cirkelvormige achtergrond',
        hide_jinja: 'Verbergen (Jinja-modus)',
        hold_action: 'Actie bij lang ingedrukt houden',
        icon: 'Pictogram',
        icon_double_tap_action: 'Actie bij dubbel tikken op pictogram',
        icon_hold_action: 'Actie bij lang ingedrukt houden op pictogram',
        icon_tap_action: 'Actie bij tikken op pictogram',
        layout: 'Inhoudsindeling',
        max_value: 'Maximale waarde',
        max_value_attribute: 'Attribuut (max_value)',
        min_value: 'Minimale waarde',
        name: 'Naam',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Balk en tekst omwisselen',
        secondary: 'Secundaire informatie',
        state_content: 'Inhoud van de status',
        show_all_actions: 'Toon alle acties',
        tap_action: 'Actie bij korte tik',
        text_shadow: 'Tekstschaduw toevoegen (overlay)',
        theme: 'Thema',
        unit: 'Eenheid',
        use_max_entity: 'Entiteit gebruiken voor maximale waarde',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Aangepaste secundaire info',
        interpolate: 'Kleuren interpoleren',
        name_info: 'Aangepaste naaminfo',
        reverse: 'Timer omdraaien',
        additions: 'Extra entiteiten'
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
        color_mode: {
          auto: 'Automatisch',
          segment: 'Segmenten',
          rainbow: 'Regenboog'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efekt na pasku (tryb Jinja)',
        bar_orientation: 'Orientacja paska',
        bar_position: 'Pozycja paska',
        bar_single_line: 'Info w jednej linii (overlay)',
        bar_size: 'Rozmiar paska',
        color_mode: 'Tryb koloru',
        center_zero: 'Zero na środku',
        center_zero_value: 'Wartość środkowa',
        center_zero_growth_percent: 'Procent wzrostu',
        color: 'Kolor podstawowy',
        decimal: 'dziesiętny',
        disable_unit: 'Pokaż jednostkę',
        double_tap_action: 'Akcja przy podwójnym naciśnięciu',
        entity: 'Encja',
        force_circular_background: 'Wymuś okrągłe tło',
        hide_jinja: 'Ukryj (tryb Jinja)',
        hold_action: 'Akcja przy długim naciśnięciu',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcja przy podwójnym naciśnięciu ikony',
        icon_hold_action: 'Akcja przy długim naciśnięciu ikony',
        icon_tap_action: 'Akcja przy naciśnięciu ikony',
        layout: 'Układ treści',
        max_value: 'Wartość maksymalna',
        max_value_attribute: 'Atrybut (max_value)',
        min_value: 'Wartość minimalna',
        name: 'Nazwa',
        percent: 'Procent',
        reverse_secondary_info_row: 'Zamień pasek i tekst',
        secondary: 'Informacja dodatkowa',
        state_content: 'Zawartość stanu',
        show_all_actions: 'Pokaż wszystkie akcje',
        tap_action: 'Akcja przy krótkim naciśnięciu',
        text_shadow: 'Dodaj cień tekstu (overlay)',
        theme: 'Motyw',
        unit: 'Jednostka',
        use_max_entity: 'Użyj encji dla wartości maksymalnej',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Niestandardowa info pomocnicza',
        interpolate: 'Interpolacja kolorów',
        name_info: 'Niestandardowa info nazwy',
        reverse: 'Odwróć licznik',
        additions: 'Dodatkowe encje'
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
        color_mode: {
          auto: 'Automatycznie',
          segment: 'Segmenty',
          rainbow: 'Tęcza'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Informações em uma linha (overlay)',
        bar_size: 'Tamanho da barra',
        color_mode: 'Modo de cor',
        center_zero: 'Zero ao centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentual de crescimento',
        color: 'Cor do ícone',
        decimal: 'Decimal',
        disable_unit: 'Mostrar unidade',
        double_tap_action: 'Ação ao tocar duas vezes',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao manter pressionado',
        icon: 'Ícone',
        icon_double_tap_action: 'Ação ao tocar duas vezes no ícone',
        icon_hold_action: 'Ação ao manter pressionado o ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Porcentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao tocar',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme: 'Tema',
        unit: 'Unidade',
        use_max_entity: 'Usar entidade para valor máximo',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Informação secundária personalizada',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        additions: 'Entidades adicionais'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Info numa só linha (overlay)',
        bar_size: 'Tamanho da barra',
        color_mode: 'Modo de cor',
        center_zero: 'Zero no centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentagem de crescimento',
        color: 'Cor primária',
        decimal: 'decimal',
        disable_unit: 'Mostrar unidade',
        double_tap_action: 'Ação ao toque duplo',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao toque longo',
        icon: 'Ícone',
        icon_double_tap_action: 'Ação ao tocar duplamente no ícone',
        icon_hold_action: 'Ação ao manter o toque no ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Percentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao toque curto',
        text_shadow: 'Adicionar sombra ao texto (overlay)',
        theme: 'Tema',
        unit: 'Unidade',
        use_max_entity: 'Usar entidade para o valor máximo',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Informação secundária personalizada',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        additions: 'Entidades adicionais'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efect pe bară (mod Jinja)',
        bar_orientation: 'Orientarea barei',
        bar_position: 'Poziția barei',
        bar_single_line: 'Info pe un singur rând (overlay)',
        bar_size: 'Dimensiunea barei',
        color_mode: 'Mod culoare',
        center_zero: 'Zero la centru',
        center_zero_value: 'Valoare centrală',
        center_zero_growth_percent: 'Procent de creștere',
        color: 'Culoare principală',
        decimal: 'zecimal',
        disable_unit: 'Afișează unitatea',
        double_tap_action: 'Acțiune la apăsare dublă',
        entity: 'Entitate',
        force_circular_background: 'Forțează fundal circular',
        hide_jinja: 'Ascunde (mod Jinja)',
        hold_action: 'Acțiune la apăsare lungă',
        icon: 'Pictogramă',
        icon_double_tap_action: 'Acțiune la apăsare dublă a pictogramei',
        icon_hold_action: 'Acțiune la apăsare lungă a pictogramei',
        icon_tap_action: 'Acțiune la apăsarea pictogramei',
        layout: 'Aspect conținut',
        max_value: 'Valoare maximă',
        max_value_attribute: 'Atribut (max_value)',
        min_value: 'Valoare minimă',
        name: 'Nume',
        percent: 'Procent',
        reverse_secondary_info_row: 'Schimbați bara și textul',
        secondary: 'Informație secundară',
        state_content: 'Conținutul stării',
        show_all_actions: 'Afișează toate acțiunile',
        tap_action: 'Acțiune la apăsare scurtă',
        text_shadow: 'Adaugă umbră textului (overlay)',
        theme: 'Temă',
        unit: 'Unitate',
        use_max_entity: 'Folosește entitate pentru valoarea maximă',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Info secundară personalizată',
        interpolate: 'Interpolare culori',
        name_info: 'Info nume personalizată',
        reverse: 'Cronometru inverso',
        additions: 'Entități suplimentare'
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
        color_mode: {
          auto: 'Automat',
          segment: 'Segmente',
          rainbow: 'Curcubeu'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Эффект на полосе (режим Jinja)',
        bar_orientation: 'Ориентация полосы',
        bar_position: 'Положение полосы',
        bar_single_line: 'Информация в одну строку (overlay)',
        bar_size: 'Размер полосы',
        color_mode: 'Режим цвета',
        center_zero: 'Ноль по центру',
        center_zero_value: 'Центральное значение',
        center_zero_growth_percent: 'Процент роста',
        color: 'Основной цвет',
        decimal: 'десятичные',
        disable_unit: 'Показать единицу измерения',
        double_tap_action: 'Поведение при двойном нажатии',
        entity: 'Сущность',
        force_circular_background: 'Принудительный круглый фон',
        hide_jinja: 'Скрыть (режим Jinja)',
        hold_action: 'Поведение при длительном нажатии',
        icon: 'Иконка',
        icon_double_tap_action: 'Поведение при двойном нажатии на иконку',
        icon_hold_action: 'Поведение при длительном нажатии на иконку',
        icon_tap_action: 'Поведение при нажатии на иконку',
        layout: 'Расположение содержимого',
        max_value: 'Максимальное значение',
        max_value_attribute: 'Атрибут (max_value)',
        min_value: 'Минимальное значение',
        name: 'Название',
        percent: 'Процент',
        reverse_secondary_info_row: 'Поменять местами панель и текст',
        secondary: 'Дополнительная информация',
        state_content: 'Содержимое состояния',
        show_all_actions: 'Показать все действия',
        tap_action: 'Поведение при нажатии',
        text_shadow: 'Добавить тень к тексту (overlay)',
        theme: 'Тема',
        unit: 'Единица измерения',
        use_max_entity: 'Использовать сущность для максимального значения',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Дополнительная информация',
        interpolate: 'Интерполяция цветов',
        name_info: 'Доп. информация (имя)',
        reverse: 'Обратный таймер',
        additions: 'Дополнительные объекты'
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
        color_mode: {
          auto: 'Авто',
          segment: 'Сегменты',
          rainbow: 'Радуга'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Efekt lišty (režim Jinja)',
        bar_orientation: 'Orientácia lišty',
        bar_position: 'Pozícia lišty',
        bar_single_line: 'Informácie na jednej línii (overlay)',
        bar_size: 'Veľkosť lišty',
        color_mode: 'Farebný režim',
        center_zero: 'Nula v strede',
        center_zero_value: 'Hodnota stredu',
        center_zero_growth_percent: 'Percento rastu',
        color: 'Farba ikony',
        decimal: 'Desatinné',
        disable_unit: 'Zobraziť jednotku',
        double_tap_action: 'Akcia pri dvojitom ťuknutí',
        entity: 'Entita',
        force_circular_background: 'Vynútiť kruhové pozadie',
        hide_jinja: 'Skryť (režim Jinja)',
        hold_action: 'Akcia pri dlhom podržaní',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcia pri dvojitom ťuknutí ikony',
        icon_hold_action: 'Akcia pri dlhom podržaní ikony',
        icon_tap_action: 'Akcia pri ťuknutí ikony',
        layout: 'Rozloženie obsahu',
        max_value: 'Maximálna hodnota',
        max_value_attribute: 'Atribút (max_value)',
        min_value: 'Minimálna hodnota',
        name: 'Názov',
        percent: 'Percento',
        reverse_secondary_info_row: 'Vymeňte lištu a text',
        secondary: 'Sekundárna informácia',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobraziť všetky akcie',
        tap_action: 'Akcia pri ťuknutí',
        text_shadow: 'Pridať tieň textu (overlay)',
        theme: 'Téma',
        unit: 'Jednotka',
        use_max_entity: 'Použiť entitu pre max hodnotu',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Vlastné sekundárne info',
        interpolate: 'Interpolácia farieb',
        name_info: 'Vlastné info názvu',
        reverse: 'Obrátený časovač',
        additions: 'Ďalšie entity'
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
        color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Dúha'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Učinek vrstice (način Jinja)',
        bar_orientation: 'Usmeritev vrstice',
        bar_position: 'Pozicija vrstice',
        bar_single_line: 'Informacije v eni vrstici (overlay)',
        bar_size: 'Velikost vrstice',
        color_mode: 'Barvni način',
        center_zero: 'Ni ničle na sredini',
        center_zero_value: 'Srednja vrednost',
        center_zero_growth_percent: 'Odstotek rasti',
        color: 'Barva ikone',
        decimal: 'Decimalno',
        disable_unit: 'Prikaži enoto',
        double_tap_action: 'Akcija ob dvojni tap',
        entity: 'Entiteta',
        force_circular_background: 'Prisili krožno ozadje',
        hide_jinja: 'Skrij (način Jinja)',
        hold_action: 'Akcija ob dolgem pritisku',
        icon: 'Ikona',
        icon_double_tap_action: 'Akcija ob dvojni tap ikone',
        icon_hold_action: 'Akcija ob dolgem pritisku ikone',
        icon_tap_action: 'Akcija ob tap ikone',
        layout: 'Postavitev vsebine',
        max_value: 'Največja vrednost',
        max_value_attribute: 'Atribut (max_value)',
        min_value: 'Najmanjša vrednost',
        name: 'Ime',
        percent: 'Odstotek',
        reverse_secondary_info_row: 'Zamenjaj vrstico in besedilo',
        secondary: 'Sekundarne informacije',
        state_content: 'Vsebina stanja',
        show_all_actions: 'Prikaži vsa dejanja',
        tap_action: 'Akcija ob tap',
        text_shadow: 'Dodaj senco besedila (overlay)',
        theme: 'Tema',
        unit: 'Enota',
        use_max_entity: 'Uporabi entiteto za max vrednost',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Prilagojena sekundarna informacija',
        interpolate: 'Interpolacija barv',
        name_info: 'Prilagojena informacija o imenu',
        reverse: 'Obrnjen časovnik',
        additions: 'Dodatni entiteti'
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
        color_mode: {
          auto: 'Samodejno',
          segment: 'Segmenti',
          rainbow: 'Mavrica'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Effekt på baren (Jinja-läge)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Position för baren',
        bar_single_line: 'Info på en rad (overlay)',
        bar_size: 'Barstorlek',
        color_mode: 'Färgläge',
        center_zero: 'Noll i mitten',
        center_zero_value: 'Centervärde',
        center_zero_growth_percent: 'Tillväxtprocent',
        color: 'Primärfärg',
        decimal: 'decimal',
        disable_unit: 'Visa enhet',
        double_tap_action: 'Åtgärd vid dubbeltryck',
        entity: 'Enhet',
        force_circular_background: 'Tvinga cirkulär bakgrund',
        hide_jinja: 'Dölj (Jinja-läge)',
        hold_action: 'Åtgärd vid långt tryck',
        icon: 'Ikon',
        icon_double_tap_action: 'Åtgärd vid dubbeltryck på ikonen',
        icon_hold_action: 'Åtgärd vid långt tryck på ikonen',
        icon_tap_action: 'Åtgärd vid tryck på ikonen',
        layout: 'Innehållslayout',
        max_value: 'Maximalt värde',
        max_value_attribute: 'Attribut (max_value)',
        min_value: 'Minsta värde',
        name: 'Namn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Byt ut stapel och text',
        secondary: 'Sekundär information',
        state_content: 'Statusinnehåll',
        show_all_actions: 'Visa alla åtgärder',
        tap_action: 'Åtgärd vid kort tryck',
        text_shadow: 'Lägg till textskugga (overlay)',
        theme: 'Tema',
        unit: 'Enhet',
        use_max_entity: 'Använd enhet för maximalt värde',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Anpassad sekundär info',
        interpolate: 'Interpolera färger',
        name_info: 'Anpassad namninfo',
        reverse: 'Omvänd timer',
        additions: 'Ytterligare entiteter'
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
        color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Regnbåge'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'เอฟเฟกต์บนแถบ (โหมด Jinja)',
        bar_orientation: 'การวางแนวแถบ',
        bar_position: 'ตำแหน่งแถบ',
        bar_single_line: 'ข้อมูลในบรรทัดเดียว (overlay)',
        bar_size: 'ขนาดแถบ',
        color_mode: 'โหมดสี',
        center_zero: 'Sıfırı ortala',
        center_zero_value: 'ค่ากึ่งกลาง',
        center_zero_growth_percent: 'เปอร์เซ็นต์การเติบโต',
        color: 'สีหลัก',
        decimal: 'ทศนิยม',
        disable_unit: 'แสดงหน่วย',
        double_tap_action: 'พฤติกรรมการแตะสองครั้ง',
        entity: 'เอนทิตี',
        force_circular_background: 'บังคับพื้นหลังวงกลม',
        hide_jinja: 'ซ่อน (โหมด Jinja)',
        hold_action: 'พฤติกรรมการกด',
        icon: 'ไอคอน',
        icon_double_tap_action: 'พฤติกรรมการแตะไอคอนสองครั้ง',
        icon_hold_action: 'พฤติกรรมการกดไอคอน',
        icon_tap_action: 'พฤติกรรมการแตะไอคอน',
        layout: 'รูปแบบเนื้อหา',
        max_value: 'ค่าสูงสุด',
        max_value_attribute: 'แอตทริบิวต์ (max_value)',
        min_value: 'ค่าต่ำสุด',
        name: 'ชื่อ',
        percent: 'เปอร์เซ็นต์',
        reverse_secondary_info_row: 'แถบและข้อความสลับกัน',
        secondary: 'ข้อมูลรอง',
        state_content: 'เนื้อหาของสถานะ',
        show_all_actions: 'แสดงการโต้ตอบทั้งหมด',
        tap_action: 'พฤติกรรมการแตะ',
        text_shadow: 'เพิ่มเงาให้ข้อความ (overlay)',
        theme: 'ธีม',
        unit: 'หน่วย',
        use_max_entity: 'ใช้เอนทิตีสำหรับค่าสูงสุด',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'ข้อมูลรองที่กำหนดเอง',
        interpolate: 'การสอดแทรกสี',
        name_info: 'ข้อมูลชื่อที่กำหนดเอง',
        reverse: 'กลับเวลานับถอยหลัง',
        additions: 'เอนทิตีเพิ่มเติม'
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
        color_mode: {
          auto: 'อัตโนมัติ',
          segment: 'ส่วน',
          rainbow: 'สีรุ้ง'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Çubuk efekti (Jinja modu)',
        bar_orientation: 'Çubuk yönü',
        bar_position: 'Çubuk konumu',
        bar_single_line: 'Bilgiyi tek satırda göster (overlay)',
        bar_size: 'Çubuk boyutu',
        color_mode: 'Renk modu',
        center_zero: 'Нуль по центру',
        center_zero_value: 'Merkez değeri',
        center_zero_growth_percent: 'Büyüme yüzdesi',
        color: 'Birincil renk',
        decimal: 'ondalık',
        disable_unit: 'Birimi göster',
        double_tap_action: 'Çift dokunma davranışı',
        entity: 'Varlık',
        force_circular_background: 'Dairesel arka planı zorla',
        hide_jinja: 'Gizle (Jinja modu)',
        hold_action: 'Uzun basma davranışı',
        icon: 'Simge',
        icon_double_tap_action: 'Simgeye çift dokunma davranışı',
        icon_hold_action: 'Simgeye uzun basma davranışı',
        icon_tap_action: 'Simgeye dokunma davranışı',
        layout: 'İçerik düzeni',
        max_value: 'Maksimum değer',
        max_value_attribute: 'Öznitelik (max_value)',
        min_value: 'Minimum değer',
        name: 'Ad',
        percent: 'Yüzde',
        reverse_secondary_info_row: 'Çubuğu ve metni değiştir',
        secondary: 'İkincil bilgi',
        state_content: 'Durum içeriği',
        show_all_actions: 'Tüm eylemleri göster',
        tap_action: 'Kısa dokunma davranışı',
        text_shadow: 'Metne gölge ekle (overlay)',
        theme: 'Tema',
        unit: 'Birim',
        use_max_entity: 'Maksimum değer için varlık kullan',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Özel ikincil bilgi',
        interpolate: 'Renk interpolasyonu',
        name_info: 'Özel ad bilgisi',
        reverse: 'Zamanlayıcıyı tersine çevir',
        additions: 'Ek varlıklar'
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
        color_mode: {
          auto: 'Otomatik',
          segment: 'Bölümler',
          rainbow: 'Gökkuşağı'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Ефект на панелі (режим Jinja)',
        bar_orientation: 'Орієнтація панелі',
        bar_position: 'Положення панелі',
        bar_single_line: 'Інформація в один рядок (overlay)',
        bar_size: 'Розмір панелі',
        color_mode: 'Режим кольору',
        center_zero: 'Không ở giữa',
        center_zero_value: 'Центральне значення',
        center_zero_growth_percent: 'Відсоток зростання',
        color: 'Основний колір',
        decimal: 'десятковий',
        disable_unit: 'Показати одиницю',
        double_tap_action: 'Поведінка при подвійному дотику',
        entity: 'Сутність',
        force_circular_background: 'Примусовий круглий фон',
        hide_jinja: 'Приховати (режим Jinja)',
        hold_action: 'Поведінка при утриманні',
        icon: 'Іконка',
        icon_double_tap_action: 'Поведінка подвійного дотику іконки',
        icon_hold_action: 'Поведінка утримання іконки',
        icon_tap_action: 'Поведінка дотику іконки',
        layout: 'Розташування вмісту',
        max_value: 'Максимальне значення',
        max_value_attribute: 'Атрибут (max_value)',
        min_value: 'Мінімальне значення',
        name: 'Назва',
        percent: 'Відсоток',
        reverse_secondary_info_row: 'Поміняти місцями панель і текст',
        secondary: 'Додаткова інформація',
        state_content: 'Вміст стану',
        show_all_actions: 'Показати всі дії',
        tap_action: 'Поведінка при дотику',
        text_shadow: 'Додати тінь до тексту (overlay)',
        theme: 'Тема',
        unit: 'Одиниця',
        use_max_entity: 'Використовувати сутність для максимального значення',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Додаткова вторинна інформація',
        interpolate: 'Інтерполяція кольорів',
        name_info: 'Додаткова інформація (назва)',
        reverse: 'Зворотній таймер',
        additions: 'Додаткові об\'єкти'
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
        color_mode: {
          auto: 'Авто',
          segment: 'Сегменти',
          rainbow: 'Веселка'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: 'Hiệu ứng thanh (chế độ Jinja)',
        bar_orientation: 'Hướng thanh',
        bar_position: 'Vị trí thanh',
        bar_single_line: 'Thông tin trên một dòng (overlay)',
        bar_size: 'Kích thước thanh',
        color_mode: 'Chế độ màu',
        center_zero: '零点居中',
        center_zero_value: 'Giá trị tâm',
        center_zero_growth_percent: 'Tỷ lệ tăng trưởng',
        color: 'Màu chính',
        decimal: 'thập phân',
        disable_unit: 'Hiển thị đơn vị',
        double_tap_action: 'Hành vi chạm đôi',
        entity: 'Thực thể',
        force_circular_background: 'Buộc nền hình tròn',
        hide_jinja: 'Ẩn (chế độ Jinja)',
        hold_action: 'Hành vi giữ',
        icon: 'Biểu tượng',
        icon_double_tap_action: 'Hành vi chạm đôi biểu tượng',
        icon_hold_action: 'Hành vi giữ biểu tượng',
        icon_tap_action: 'Hành vi chạm biểu tượng',
        layout: 'Bố cục nội dung',
        max_value: 'Giá trị tối đa',
        max_value_attribute: 'Thuộc tính (max_value)',
        min_value: 'Giá trị tối thiểu',
        name: 'Tên',
        percent: 'Phần trăm',
        reverse_secondary_info_row: 'Hoán đổi thanh và văn bản',
        secondary: 'Thông tin phụ',
        state_content: 'Nội dung trạng thái',
        show_all_actions: 'Hiển thị tất cả hành động',
        tap_action: 'Hành vi chạm',
        text_shadow: 'Thêm bóng cho văn bản (overlay)',
        theme: 'Chủ đề',
        unit: 'Đơn vị',
        use_max_entity: 'Sử dụng thực thể cho giá trị tối đa',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: 'Thông tin phụ tùy chỉnh',
        interpolate: 'Nội suy màu sắc',
        name_info: 'Thông tin tên tùy chỉnh',
        reverse: 'Đảo ngược bộ đếm thời gian',
        additions: 'Thực thể bổ sung'
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
        color_mode: {
          auto: 'Tự động',
          segment: 'Phân đoạn',
          rainbow: 'Cầu vồng'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: '进度条效果 (Jinja 模式)',
        bar_orientation: '进度条方向',
        bar_position: '进度条位置',
        bar_single_line: '单行信息（覆盖显示）',
        bar_size: '进度条大小',
        color_mode: '颜色模式',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增长百分比',
        color: '主色',
        decimal: '小数',
        disable_unit: '显示单位',
        double_tap_action: '双击动作',
        entity: '实体',
        force_circular_background: '强制圆形背景',
        hide_jinja: '隐藏 (Jinja 模式)',
        hold_action: '长按动作',
        icon: '图标',
        icon_double_tap_action: '图标双击动作',
        icon_hold_action: '图标长按动作',
        icon_tap_action: '图标点击动作',
        layout: '内容布局',
        max_value: '最大值',
        max_value_attribute: '属性（最大值）',
        min_value: '最小值',
        name: '名称',
        percent: '百分比',
        reverse_secondary_info_row: '交换进度条和文本',
        secondary: '次要信息',
        state_content: '状态内容',
        show_all_actions: '显示所有交互',
        tap_action: '点击动作',
        text_shadow: '添加文本阴影（overlay）',
        theme: '主题',
        unit: '单位',
        use_max_entity: '使用实体作为最大值',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: '自定义次要信息',
        interpolate: '颜色插值',
        name_info: '自定义名称信息',
        reverse: '反转计时器',
        additions: '附加实体'
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
        color_mode: {
          auto: '自动',
          segment: '分段',
          rainbow: '彩虹'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
        bar_effect_jinja: '進度條效果 (Jinja 模式)',
        bar_orientation: '進度條方向',
        bar_position: '進度條位置',
        bar_single_line: '單行資訊（疊加）',
        bar_size: '進度條大小',
        color_mode: '顏色模式',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增長百分比',
        color: '圖示顏色',
        decimal: '小數',
        disable_unit: '顯示單位',
        double_tap_action: '雙擊操作',
        entity: '實體',
        force_circular_background: '強制圓形背景',
        hide_jinja: '隱藏 (Jinja 模式)',
        hold_action: '長按操作',
        icon: '圖示',
        icon_double_tap_action: '圖示雙擊操作',
        icon_hold_action: '圖示長按操作',
        icon_tap_action: '圖示點擊操作',
        layout: '內容佈局',
        max_value: '最大值',
        max_value_attribute: '屬性（max_value）',
        min_value: '最小值',
        name: '名稱',
        percent: '百分比',
        reverse_secondary_info_row: '交換進度條和文字',
        secondary: '次要資訊',
        state_content: '狀態內容',
        show_all_actions: '顯示所有互動',
        tap_action: '點擊操作',
        text_shadow: '文字陰影（疊加）',
        theme: '主題',
        unit: '單位',
        use_max_entity: '使用實體作為最大值',
        bar_max_width: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        custom_info: '自訂次要資訊',
        interpolate: '顏色插值',
        name_info: '自訂名稱資訊',
        reverse: '反轉計時器',
        additions: '附加實體'
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
        color_mode: {
          auto: '自動',
          segment: '分段',
          rainbow: '彩虹'
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
          low_entity_toggle: 'Use entity as low watermark value',
          low_attribute: 'Attribute',
          high_entity_toggle: 'Use entity as high watermark value',
          high_attribute: 'Attribute'
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
  --progress-transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);

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

/* --- inner size/background (auto-clamped per zone: irrelevant zone resolves to 0) --- */
.${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-size: max(var(${CARD.style.dynamic.progressBar.value.var}, 0), 0);
  --inner-background: var(--epb-progress-bar-color, var(--progress-effect, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})));
}
.center-zero .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-size: max(calc(var(${CARD.style.dynamic.progressBar.value.var}, 0) * -1), 0);
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

/* ----- gradient/glass: ::before compositor-only scale (no background-size repaint) -----
   .inner translates (GPU). ::before carries the gradient and scales via transform-origin,
   also GPU. Both share the same --progress-transition so they stay in perfect sync.
   .inner background is cleared to solid so the gradient doesn't double-render.          */

/* --- Solid fallback in .inner: remove gradient from background chain --- */
.horizontal-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive,
.vertical-bar:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.positive {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
}

.horizontal-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative,
.vertical-bar.center-zero:is(
  .${CARD.style.dynamic.progressBar.effect.glass.class},
  .${CARD.style.dynamic.progressBar.effect.gradient.class},
  .${CARD.style.dynamic.progressBar.effect.gradientReverse.class}
) .${CARD.htmlStructure.elements.progressBar.inner.class}.negative {
  --inner-background: var(--epb-progress-bar-color, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default}));
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

/* --- Horizontal center-zero negative: gradient on ::before, scaleX from left --- */
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

/* --- Vertical center-zero negative: gradient on ::before, scaleY from bottom --- */
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

/* --- Transition: sync ::before scale with .inner translate (transition-ready only) --- */
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
  numericString: (val) => typeof val === 'string' && val.trim() !== '' && !isNaN(parseFloat(val)), // lax: '42 W' → true (leading number is extracted by callers)
  // CF5 - issue (minor) resolved - the lax variant accepts '42abc'; the strict one rejects any string that is not entirely a finite number ('42abc', 'Infinity', …)
  strictNumericString: (val) => typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val)),
  number: (val) => Number.isFinite(val),
  // CF5 - issue (minor) resolved - renamed from is.integer: the name hid the val >= 0 constraint and invited misuse for signed integers
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
  container: (options) => StructureElements.ripple() + Element(CARD.htmlStructure.sections.container, options.layout).html(CONTENT_SLOT),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html(CONTENT_SLOT),
  topContainer: () => Element(CARD.htmlStructure.sections.topContainer).html(CONTENT_SLOT),
  backgroundContainer: () => Element(CARD.htmlStructure.sections.backgroundContainer).html(CONTENT_SLOT),
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
      Element(CARD.htmlStructure.elements.progressBar.bar, isCenterZero ? CARD.style.dynamic.progressBar.centerZero.class : 'default').html(innerHtml),
      isCenterZero ? { 'aria-valuemin': '-100' } : {}
    );
  },

  createSecondaryInfo: (options, secondaryInfoWrapperFn) => {
    const { layout, barPosition } = options;
    const excludedPositions = ['top', 'bottom', 'below', 'overlay', 'background'];
    const excludedLayouts = ['vertical'];

    let content = secondaryInfoWrapperFn();

    if (!excludedPositions.includes(barPosition) && !excludedLayouts.includes(layout)) {
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
    const isBelowTopOrBottom = ['below', 'top', 'bottom', 'background'].includes(options.barPosition);

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
  // CF5 - issue (perf) resolved - card.innerHTML re-parsed the full HTML string on every render (each card creation, each editor keystroke). The structure is now built once per unique option set into a <template> and cloned (~5-10x faster than parsing). The DOM depends on the config's structure options (barType, barPosition, layout, ...), so the cache is keyed on the exact options object: any setConfig producing different structure options gets its own template, identical configs share one.
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
    // The option space is bounded (a handful of enums/booleans), so is the cache.
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
        // CF5 - issue (critical) resolved - unknown/missing unit threw and crashed the card; return null so the caller can flag the entity as invalid
        return null;
    }
  }
  static convertDuration(duration) {
    // CF5 - issue (critical) resolved - timer attributes (duration/remaining) can be missing during HA startup; null.split() crashed the card
    if (!is.string(duration)) return 0;
    // CF5 - issue (minor) resolved - Python timedelta strings for timers over 24h are "N day(s), H:MM:SS": the day prefix made every part NaN. Days are now parsed, and any malformed remainder returns 0 instead of propagating NaN.
    const dayMatch = duration.match(/^(\d+) days?, (.*)$/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
    const parts = (dayMatch ? dayMatch[2] : duration).split(':').map(Number);
    if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return 0;
    const [hours, minutes, seconds] = parts;

    return ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
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

  _validate(_value) { return false; }
}

class ValueHelper extends TypedValueHelper {
  _validate(v) { return is.number(v); }
}

/******************************************************************************************
 * 🛠️ DecimalHelper
 * ========================================================================================
 *
 * ✅ Represents a non-negative integer value that can be valid or invalid.
 *
 * @class
 */
class DecimalHelper extends TypedValueHelper {
  _validate(v) { return Number.isInteger(v) && v >= 0; }
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

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue) {
    // CF5 - issue (critical) resolved - some integrations expose a non-string unit_of_measurement; .trim() crashed and the ?? fallback was dead code
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

/******************************************************************************************
 * 🛠️ PercentHelper
 * ========================================================================================
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

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set isReversed(newValue) { this.#isReversed = is.boolean(newValue) ? newValue : CARD.config.reverse; }
  get isReversed() { return this.#isReversed; }

  set min(newValue) { this.#min.value = newValue; }
  get min() { return this.#min.value; }

  set max(newValue) { this.#max.value = newValue; }
  get max() { return this.#max.value; }

  set current(newCurrent) { this.#current.value = newCurrent; }
  get current() { return this.#current.value; }

  set decimal(newValue) { this.#decimal.value = newValue; }
  get decimal() { return this.#decimal.value; }

  set isCenterZero(newValue) { this.#isCenterZero = is.boolean(newValue) ? newValue : false; }
  get isCenterZero() { return this.#isCenterZero; }

  set zeroValue(newValue) { this.#zeroValue = is.number(newValue) ? newValue : 0; }
  get zeroValue() { return this.#zeroValue; }

  set growthPercent(newValue) { this.#growthPercent = is.boolean(newValue) ? newValue : false; }
  get growthPercent() { return this.#growthPercent; }

  get actual() { return this.#isReversed ? this.max - this.current : this.current; }
  get isValid() { return this.range !== 0; }
  get range() {
    if (!this.isCenterZero) return this.max - this.min;
    return this.current >= this.#zeroValue ? this.max - this.#zeroValue : this.#zeroValue - this.min;
  }
  get correctedValue() {
    return this.isCenterZero ? this.current - this.#zeroValue : this.actual - this.min;
  }
  get percent() { return this.isValid ? this.#percent : null; }

  /**
   * Pourcentage de croissance/décroissance par rapport à la valeur de centrage (`zeroValue`),
   * indépendant du ratio de remplissage de la barre (`percent`). N'a de sens que si
   * `isCenterZero` et `growthPercent` sont actifs, et que `zeroValue` n'est pas 0
   * (sinon le ratio est mathématiquement indéfini — on retombe alors sur `percent`).
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
    const fullRange = this.max - this.min;
    return fullRange === 0 ? 0 : ((value - this.min) / fullRange) * 100;
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

  set isTimer(newValue) { this.#isTimer = is.boolean(newValue) ? newValue : false; }
  get isTimer() { return this.#isTimer; }

  get unit() { return this.#unit.value; }
  set unit(newValue) { this.#unit.value = newValue ?? ''; }

  get hasTimerUnit() { return this.#isTimer && this.#unit.isTimerUnit; }
  get hasFlexTimerUnit() { return this.#isTimer && this.#unit.isFlexTimerUnit; }
  get hasTimerOrFlexTimerUnit() { return this.hasTimerUnit || this.hasFlexTimerUnit; }

  get processedValue() {
    if (this.unit !== CARD.config.unit.default) return this.actual;
    return this.isCenterZero && this.growthPercent ? this.growthPercentValue : this.percent;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  configure({ unitSpacing, hasDisabledUnit, isCenterZero, zeroValue, growthPercent }) {
    this.#unitSpacing = unitSpacing;
    this.#unit.isDisabled = hasDisabledUnit;
    this.isCenterZero = isCenterZero;
    this.zeroValue = zeroValue;
    this.growthPercent = growthPercent;
  }

  valueForThemes(isCustomTheme, valueBasedOnPercentage) {
    /*
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

  toString() {
    if (!this.isValid) return 'Div0';
    if (this.hasTimerOrFlexTimerUnit)
      return NumberFormatter.formatTiming(this.actual, this.decimal, this.#hassProvider.numberFormat, this.hasFlexTimerUnit, this.#unitSpacing);
    return NumberFormatter.formatValueAndUnit(this.processedValue, this.decimal, this.unit, this.#hassProvider.numberFormat, this.#unitSpacing);
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
      if (!is.plainObject(item)) return false;
      if (!CARD.theme.customTheme.expectedKeys.every((key) => key in item)) return false;
      if (!CARD.theme.customTheme.colorKeys.some((key) => key in item)) return false;
      if (item.min >= item.max) return false;
      if (!isFirstItem && item.min !== lastMax) return false;

      isFirstItem = false;
      lastMax = item.max;

      return true;
    });
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  static adaptColor(curColor) {
    return HA_CONTEXT.haColors.get(curColor) ?? curColor;
  }

  buildGradient(fillPercent, mode) {
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

    // Inner element uses translateX((value-1)*100%), shifted left by (100-fillPercent)%.
    // A zone boundary at container position B → element position B + offset.
    const offset = 100 - fillPercent;
    const toElemPos = (b) => `${(b + offset).toFixed(2)}%`;
    const col = (level) => ThemeManager.adaptColor(level.bar_color || level.color);

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
  getEntityName(entityId) {
    // CF5 - issue (critical) resolved - entities without unique_id are absent from hass.entities; missing optional chaining crashed name tokens (type: entity)
    return this.#hass?.entities?.[entityId]?.name ?? null;
  }
  getEntityDevice(entityId) {
    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return null;
    return this.#hass?.devices?.[deviceId]?.name ?? null;
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
    const areaId = this.#hass?.entities?.[entityId]?.area_id
      ?? this.#hass?.devices?.[this.#hass?.entities?.[entityId]?.device_id]?.area_id;
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
    // CF5 - issue (perf) resolved - previously returned true, running the full refresh pipeline on every hass update of the whole install for cards with no watched entity (Jinja-only template cards). Their content arrives exclusively via push template subscriptions; nothing in the pipeline reads hass directly. If a future render path does, revisit this.
    if (!is.nonEmptySet(this.#watchedEntities)) return false;

    for (const entityId of this.#watchedEntities) {
      const newState = newHass?.states?.[entityId];

      if (!newState) return true;
      // CF5 - issue (perf) resolved - HA state objects are immutable (the frontend swaps in a new object on every change), so a reference check replaces the two full JSON.stringify serializations previously run per entity on every hass update
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
    return this.#isValid && !this.entityType.isCounter && !this.entityType.isNumber && !this.entityType.isDuration && !this.entityType.isTimer
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
    return this.#nameTokens
      ? this._nameResolver()
      : this.name;
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
      : this.#hassProvider.getEntityProp(this.#entityId, 'device_class') === HA_CONTEXT.entity.type.duration && !this.#attribute
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
      // CF5 - issue (major) resolved - getEntityAttribute returns null (never undefined) when missing, so this check always passed and invalid attributes produced NaN downstream
      this.#isValid = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute) !== null;

    this.#state = this.#hassProvider.getEntityProp(this.#entityId, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler = EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get(HA_CONTEXT.entity.type.default);
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
      current: parseFloat(this.#state),
      min: this.#hassProvider.getEntityAttribute(this.#entityId, min),
      max: this.#hassProvider.getEntityAttribute(this.#entityId, max),
    };
  }
  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never undefined), so the guard never matched and a missing unit crashed in durationToSeconds
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

  getEntitiesColor(curColor, progressRatio = 1) {
    const percentages = this.getPercentages();
    if (!percentages.length || !curColor) return null;

    const total = percentages.length;
    const gradientStops = [];
    // With translateX-based fill, the inner element is 100% wide but only the
    // rightmost progressRatio% is visible. Segment stops must be offset so that
    // they land inside the visible portion instead of starting from position 0.
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    for (let i = 0; i < total; i++) {
      const item = percentages[i];

      const whitePercent = Math.round((1 - i / (total - 1 || 1)) * 50); // de 50 → 0
      const basePercent = 100 - whitePercent;

      const color = `color-mix(in srgb, ${curColor} ${basePercent}%, black ${whitePercent}%)`;

      const start = currentPosition;
      const end = currentPosition + item.percent * progressRatio;

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

  get value()               { return this.#activeHelper?.value ?? null; }
  get isEntity()            { return this.#isEntity; }
  get isValid()             { return this.#activeHelper?.isValid ?? false; }
  get isAvailable() {
    if (!this.#activeHelper) return false;
    return this.#isEntity ? this.#activeHelper.isAvailable || this.#activeHelper.isValid : this.#activeHelper.isValid;
  }

  get state()               { return this.#entity()?.state ?? null; }
  get precision()           { return this.#entity()?.precision ?? null; }
  get name()                { return this.#entity()?.name ?? null; }
  get nameComposition()     { return this.#entity()?.nameComposition ?? null; }
  get formatedEntityState() { return this.#entity()?.formatedEntityState ?? null; }
  get stateContent()        { return this.#entity()?.stateContent ?? null; }
  get stateContentToString(){ return this.#entity()?.stateContentToString ?? null; }
  get entityType()          { return this.#entity()?.entityType ?? { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: false }; }
  get hasShapeByDefault()   { return this.#entity()?.hasShapeByDefault ?? false; }
  get defaultColor()        { return this.#entity()?.defaultColor ?? false; }
  get hasAttribute()        { return this.#entity()?.hasAttribute ?? false; }
  get defaultAttribute()    { return this.#entity()?.defaultAttribute ?? null; }
  get attributes()          { return this.#entity()?.attributes ?? null; }
  get unit()                { return this.#entity()?.unit ?? null; }
  get stateObj()            { return this.#entity()?.stateObj ?? null; }
  get nameTokens()          { return this.#entity()?.nameTokens ?? null; }
  get attribute()           { return this.#entity()?.attribute ?? null; }

  set attribute(newValue)   { const entity = this.#entity(); if (entity) entity.attribute = newValue; }
  set nameTokens(tok)       { const entity = this.#entity(); if (entity) entity.nameTokens = tok; }
  set stateContent(newValue){ const entity = this.#entity(); if (entity) entity.stateContent = newValue; }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() { this.#entity()?.refresh(); }
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
    if (!is.string(value)) throw new ValidationError(path, ERROR_CODES.invalidTypeString.code, ERROR_CODES.invalidTypeString.severity);
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(value)) throw new ValidationError(path, ERROR_CODES.invalidEntityId.code, ERROR_CODES.invalidEntityId.severity);

    return value;
  },

  decimal: (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (!is.unsignedInteger(value)) throw new ValidationError(path, ERROR_CODES.invalidDecimal.code, ERROR_CODES.invalidDecimal.severity);

    return value;
  },

  tapAction: (value, path = []) => {
    if (!is.plainObject(value)) {
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
      const invalidIndex = value.findIndex((v) => !is.string(v));
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

    if (result.bar_size === CARD.style.bar.sizeOptions.xlarge.label && result.bar_position === 'default') result.bar_position = 'below';

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

types.discriminatedUnion = (key, mapping) => (value, path = []) => {
  if (!is.plainObject(value)) {
    throw new ValidationError(path, ERROR_CODES.invalidTypeObject.code, ERROR_CODES.invalidTypeObject.severity);
  }

  const discriminator = value[key];

  if (!is.string(discriminator)) {
    throw new ValidationError(
      [...path, key],
      ERROR_CODES.invalidTypeString.code,
      ERROR_CODES.invalidTypeString.severity
    );
  }

  const validator = mapping[discriminator];

  if (!validator) {
    throw new ValidationError(
      [...path, key],
      ERROR_CODES.invalidEnumValue.code,
      ERROR_CODES.invalidEnumValue.severity
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

const additionItem = types.fallbackTo(
  types.object({
    entity: types.entityId,
    attribute: types.optional(types.string),
  }),
  SKIP_PROPERTY,
);

const watermarkSchema = {
  low: types.fallbackTo(types.union(types.number, types.string), CARD.config.defaults.watermark.low),
  low_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.low_as),
  low_attribute: types.optionalString(),
  low_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.low_color),
  high: types.fallbackTo(types.union(types.number, types.string), CARD.config.defaults.watermark.high),
  high_as: types.enumsWithDefault(['auto', 'percent'], CARD.config.defaults.watermark.high_as),
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
        // ─── Entity & Data ──────────────────────────────────────────────────
        entity: types.entityId,
        attribute: types.optionalString(),
        min_value: types.optionalNumber(),
        max_value: types.fallbackTo(types.union(types.number, types.string), 100),
        max_value_attribute: types.optionalString(),

        // ─── Appearance ─────────────────────────────────────────────────────
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'top', 'bottom'], 'default'),
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

        // ─── Additions ──────────────────────────────────────────────────────
        additions: types.optional(types.array(additionItem)),
      }),
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
        min_value: types.optionalNumber(),
        max_value: types.fallbackTo(types.union(types.number, types.string), 100),
        max_value_attribute: types.optionalString(),

        // ─── Appearance ===
        icon: types.optionalString(),
        color: types.optionalString(),
        bar_color: types.optionalString(),
        bar_size: types.enumsWithDefault(
          Object.values(CARD.style.bar.sizeOptions).map((e) => e.label),
          'small',
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        color_mode: types.enumsWithDefault(['auto', 'segment', 'rainbow'], 'auto'),
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
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
        hide: types.jinjaOrArrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
        name_info: types.optionalString(),
        custom_info: types.optionalString(),
        state_content: types.optional(types.fallbackTo(types.stateContent, SKIP_PROPERTY)),

        // ─── Badges ===
        badge_icon: types.optionalString(),
        badge_color: types.optionalString(),

        // ─── Theme & Watermark ===
        // theme: types.theme(['optimal_when_low', 'optimal_when_high', 'light', 'temperature', 'humidity', 'pm25', 'voc']),
        theme: types.theme(Object.keys(THEME)),
        custom_theme: types.fallbackTo(types.customTheme, SKIP_PROPERTY),
        interpolate: types.optionalBooleanWithDefault(false),
        watermark: types.watermarkObject(watermarkSchema, CARD.config.defaults.watermark),

        // ─── Additions ===
        additions: types.optional(types.array(additionItem)),

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
    ]);
  }

  static get template() {
    return struct(
      types.object({
        // ─── Entity & Data ===
        entity: types.optional(types.entityId),
        name: types.optionalString(),
        secondary: types.optionalString(),
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
        bar_effect: types.jinjaOrArrayWithValidatedElem(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        bar_position: types.enumsWithDefault(['default', 'below', 'top', 'bottom', 'overlay', 'background'], 'default'),
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

  // Calcule une seule fois, à partir de la config validée, la config brute + les valeurs
  // dérivées consommées ailleurs (évite de recalculer à chaque accès).
  static #resolveConfig(config) {
    return {
      ...config,
      centerZero: BaseConfigHelper.#resolveCenterZero(config?.center_zero),
    };
  }

  /**
   * Normalise `center_zero` (boolean | { value: number }) en une forme exploitable.
   * - false / undefined -> désactivé, zéro = 0
   * - true               -> activé, zéro = 0
   * - { value: 230 }     -> activé, zéro = 230
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

  static #logDeprecatedOption(config) {
    if (config.navigate_to !== undefined)
      console.warn(`${META.types.card.typeName.toUpperCase()} - navigate_to option is deprecated and has been removed.`);
    if (config.show_more_info !== undefined)
      console.warn(`${META.types.card.typeName.toUpperCase()} - show_more_info option is deprecated and has been removed.`);
    if (['battery', 'cpu', 'memory'].includes(config.theme))
      console.warn(
        `${META.types.card.typeName.toUpperCase()} - theme: ${
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
    if (is.number(this.config.max_value)) return this.config.max_value;
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
    return this.config ? (CARD.layout.orientations[this.config.layout]?.grid?.grid_rows ?? 1) : CARD.layout.orientations.horizontal.grid.grid_rows;
  }
  get cardLayoutOptions() {
    if (!this.config) return CARD.layout.orientations.horizontal.grid;
    const layout = structuredClone(CARD.layout.orientations[this.config.layout]);
    layout.grid.grid_min_rows = this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label)
      ? 1
      : layout.grid.grid_min_rows +
        (this.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label ||
        this.config.layout === 'horizontal' && this.config.bar_position === 'below' ||
        (this.config.layout === 'vertical' && ['default', 'below'].includes(this.config.bar_position) && this.config.bar_size !== 'small')
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
    return ViewCore.#hasAction([this._configHelper.action.icon.tap, this._configHelper.action.icon.hold, this._configHelper.action.icon.doubleTap]);
  }
  get hasClickableCard() {
    return ViewCore.#hasAction([this._configHelper.action.card.tap, this._configHelper.action.card.hold, this._configHelper.action.card.doubleTap]);
  }
  get hasReversedSecondaryInfoRow() {
    return this.config.layout === 'horizontal' && this.config.bar_position === 'default' && this.config.reverse_secondary_info_row; // ─── true
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

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

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

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

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

    // CF5 - issue (major) resolved - the collection was never cleared: every setConfig (each editor keystroke) re-added all entities, inflating getTotalValue() with duplicates
    this.#entityCollection.clear();
    if (this._configHelper.config.additions) {
      this._configHelper.config.additions.forEach(({ entity, attribute }) => {
        this.#entityCollection.addEntity(entity, attribute);
      });
      this.#entityCollection.addEntity(this._configHelper.config.entity, this._configHelper.config.attribute);
    }

    const centerZero = this._configHelper.config.centerZero;
    this.#percentHelper.configure({
      unitSpacing: this._configHelper.config.unit_spacing,
      hasDisabledUnit: this._configHelper.config.disable_unit,
      isCenterZero: centerZero.enabled,
      zeroValue: centerZero.zeroValue,
      growthPercent: centerZero.growthPercent,
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

  // ─── Getters for card ─────────────────────────────────────────────────────
  
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
    return this.hasEntityCollection ? this.#entityCollection.getEntitiesColor(curColor, this.percent / 100) : curColor;
  }
  get colorGradient() {
    if (!this.isAvailable || this.#percentHelper.isCenterZero) return null;
    return this.#theme.buildGradient(this.#percentHelper.percent, this._configHelper.config.color_mode);
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
    if (this.hasStandardEntityError || (this._currentValue.entityType.isTimer && this._currentValue.value.state === HA_CONTEXT.entity.state.idle))
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
    return this._configHelper.config.reverse !== false && this._currentValue.value.state !== HA_CONTEXT.entity.state.idle;
  }
  get hasWatermark() {
    return this._configHelper.config.watermark !== undefined;
  }
  get watermark() {
    const { watermark } = this.config;
    if (!watermark) return null;
    const toPos = (v, mode) =>
      mode === 'percent' ? (is.number(v) ? v : (v?.current ?? 0)) : this.#percentHelper.calcWatermark(v);
    return {
      ...watermark,
      low: toPos(this._lowValue.value, watermark.low_as),
      low_color: ThemeManager.adaptColor(watermark.low_color),
      high: toPos(this._highValue.value, watermark.high_as),
      high_color: ThemeManager.adaptColor(watermark.high_color),
    };
  }
  get hasEntityCollection() {
    return this.#entityCollection.count >= 2;
  }

  get entityCollectionPercentage() {
    return this.#entityCollection.getPercentages();
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh(hass) {
    super.refresh(hass); // _hassProvider, _currentValue, _lowValue, _highValue
    this.#maxValue.refresh();
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
    if (is.unsignedInteger(this._configHelper.config.decimal)) return this._configHelper.config.decimal;
    if (this._currentValue.precision) return this._currentValue.precision;
    if (this._currentValue.entityType.isTimer) return CARD.config.decimal.timer;
    if (this._currentValue.entityType.isCounter) return CARD.config.decimal.counter;
    if (this._currentValue.entityType.isDuration) return CARD.config.decimal.duration;
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

    // CF5 - issue (medium) resolved - the trailing timer was scheduled unconditionally, so a single isolated call always ran fn() twice (leading + trailing). The trailing run now only catches calls rejected by the throttle, and a leading run cancels any pending trailing.
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
   * Sets a CSS custom property synchronously — no RAF, no cache check, no queue.
   * Use when immediate DOM update is required.
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

  // CF5 - issue (security) resolved - Jinja results are injected via innerHTML and may interpolate attacker-influenceable strings (media titles, network device names…); allowlist sanitization keeps the HTML formatting feature while neutralizing script execution
  static #SAFE_HTML_TAGS = new Set(['B', 'I', 'U', 'SPAN', 'DIV', 'BR']);
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
      if (attr.name === 'class') continue; // needed by the card's own markup (span.multiline); classes cannot execute code
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
  #initialized = false;
  #disableIconTap = false;
  #iconClickSources = new Set(['shape', HA_SVG_ICON_TAG, 'img']);

  constructor(target) {
    this.#target = target;
  }

  // CF5 - issue (major) resolved - the HA frontend creates <action-handler> lazily; querySelector could return null and crash if this card loads before any native card
  static #getActionHandler() {
    let handler = document.body.querySelector('action-handler');
    if (!handler) {
      handler = document.createElement('action-handler');
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

    // CF5 - issue (major) resolved - init() runs on every connectedCallback (view navigation, edit mode); listeners accumulated and a single tap dispatched N hass-action events. init is now idempotent.
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
 * - _handleHassUpdate()     → react to hass state changes
 * - _updateCSS()            → apply dynamic CSS custom properties
 * - _getJinjaHandlers()     → handle Jinja2 template results
 *
 * Subclasses MAY override:
 * - _structureOptions (getter) → structure options passed to ObjStructure.clone() (barType, barPosition…)
 * - _buildStyle()             → CSS class application pipeline (watermark, bar effect, base classes)
 * - _updateDynamicElements()  → DOM update orchestration (CSS, Jinja processing)
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
    sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
  } catch {
    sheet = null; // Firefox < 101, Safari < 16.4 → legacy <style> fallback
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
  // CF5 - issue (perf) resolved - render_template subscriptions are push-based; tracking the signature (template + entity variable) of each live/in-flight subscription lets us skip the systematic unsubscribe/resubscribe cycle on every refresh
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
    // CF5 - issue (minor) resolved - the watched set was only ever appended to: entities removed from the config (editor changes) stayed watched and kept triggering refreshes until reload. Rebuilt from scratch on every setConfig.
    this._changeTracker.resetWatchedEntities();
    if (is.string(config.entity)) this._changeTracker.watchEntity(config.entity);
    if (is.string(config.max_value)) this._changeTracker.watchEntity(config.max_value);
    if (is.string(config?.watermark?.low)) this._changeTracker.watchEntity(config.watermark.low);
    if (is.string(config?.watermark?.high)) this._changeTracker.watchEntity(config.watermark.high);
    // CF5 - issue (major) resolved - additions entities were not watched: when one of them changed state (main entity unchanged), the ChangeTracker reported no change and the displayed total stayed stale
    if (is.array(config.additions)) {
      for (const item of config.additions) {
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
   * This method creates the visual and structural elements of the card and injects
   * them into the component's Shadow DOM.
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
    // instances). Fallback path (older Firefox/Safari, see getSharedStyleSheet):
    // a per-instance <style> element, as before.
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
    // fresh here so a setConfig that changes the structure picks the right template.
    card.replaceChildren(this.constructor._cardStructure.clone(this._structureOptions));

    return { style, card };
  }

  // CF5 - issue (medium) resolved - _storeDOM registered every element under its first CSS class: silent collisions were possible and the map carried dead weight. Only the elements actually driven through the DOMHelper are registered now.
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
  }

  _addBaseClasses() {
    this._dom.addClass(
      CARD.htmlStructure.card.element,
      this.baseClass,
      this._cardView.config.layout,
      this._cardView.config.bar_size,
      this._cardView.config.bar_orientation ? CARD.style.dynamic.progressBar.orientation[this._cardView.config.bar_orientation] : null,
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

  // ─── DYNAMIC ELEMENTS UPDATE ──────────────────────────────────────────────

  _updateDynamicElements() {
    this._updateCSS();
    this._processJinjaFields();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    throw new Error(`${this.constructor.name} must implement _updateCSS()`);
  }

  _applyProgressCSS(progressValue, { barColor = null, iconColor = null, gradient = null } = {}) {
    const cardKey = CARD.htmlStructure.card.element;

    const fillColor = gradient ?? barColor;
    if (fillColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, fillColor);
    if (iconColor !== null) this._dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, iconColor);

    if (progressValue !== null) {
      this._dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
      this._dom.setAttribute(CARD.htmlStructure.elements.progressBar.container.class, 'aria-valuenow', Math.round(progressValue * 100));
    }
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
    const result = Object.fromEntries(
      Object.keys(this._getJinjaHandlers())
        .map((key) => [key, this._cardView.config[key] || ''])
        .filter(([, value]) => is.nonEmptyString(value)),
    );
    this._log.debug('validJinjaFields: ', { handler: this._getJinjaHandlers(), config:this._cardView.config, result });
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
      // CF5 - issue (critical) resolved - an exception inside a render handler propagated into the WebSocket message callback; log it instead of crashing the card
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
    // CF5 - issue (critical) resolved - render_template returns native types: a template yielding a list (e.g. {{ ['glass'] }}) crashed on .split()
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
    return !!this._resourceManager && !(this._cardView.config?.entity && this._cardView.hasStandardEntityError);
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

  // CF5 - issue (perf) resolved - a Jinja field removed from the config left its subscription alive (pushing results into a DOM that no longer expects them) until disconnect; drop subscriptions whose key is no longer configured
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

    // CF5 - issue (perf) resolved - subscriptions are push-based: skip when an identical one is live or in-flight. Reserving the signature before the await also fixes a race where two overlapping calls created a duplicate (orphan) subscription.
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

/******************************************************************************************
 * 🛠️ HABase
 * ========================================================================================
 *
 * Extends HACore with entity rendering: icon, badge, shape, trend, hidden components,
 * standard fields, and Jinja badge handlers.
 *
 * Subclasses MUST implement:
 * - _updateCSS()            → apply dynamic CSS (percent, colors, watermark)
 *
 * Subclasses MAY override:
 * - _buildStyle()           → CSS class pipeline (calls super then adds entity-specific classes)
 * - _updateDynamicElements() → DOM update orchestration (icon, badge, shape, trend, CSS, Jinja)
 * - _getStandardFields()    → static — returns [{className, value}] for text fields to render
 * - _hiddenComponents       → static — extend the array to add card-type-specific hide targets
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
    // CF5 - issue (minor) resolved - HA_CONTEXT.equalBox (missing .icons) was undefined: the flat trend rendered an empty icon
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
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  getLayoutOptions() {
    if (![META.types.card.typeName, META.types.template.typeName].includes(this.baseClass)) return undefined;
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
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

  // ─── AUTO-REFRESH MANAGEMENT ──────────────────────────────────────────────

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

  // ─── ERROR MESSAGE MANAGEMENT ─────────────────────────────────────────────

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

  // ─── CARD BUILDING ===

  get _structureOptions() {
    return {
      ...super._structureOptions,
      layout: this._cardView.config.layout,
      barSingleLine: this._cardView.config.bar_single_line,
      trendIndicator: this._cardView.config.trend_indicator,
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

    // CF5 - issue (critical) resolved - a hide Jinja template yielding a native list crashed on .split(); normalize list and string results alike
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

    if (!is.nullish(this._cardView.badgeInfo)) return false; // alert -> cancel custom badge
    if (this.#jinjaStateBadge.icon) {
      this._setBadgeIcon(content);
    }
    this._updateBadgeVisibility();
  }
  _renderBadgeColor(content) {
    this._log.debug('📎 HABase._renderBadgeColor():', { content });
    this.#jinjaStateBadge.color = is.nonEmptyString(content);

    if (!is.nullish(this._cardView.badgeInfo)) return false; // alert -> cancel custom badge

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

  // ─── getStubConfig -> select entity ───────────────────────────────────────
  static getStubEntity(hass) {
    return Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) || 'sensor.temperature';
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
      // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before _ensureResourceManager: with an active timer entity and hass assigned before connectedCallback (standard Lovelace order), _resourceManager was still null and .has() crashed
    } else if (!this._resourceManager?.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  // ─── CSS - CUSTOMIZATION ──────────────────────────────────────────────────
  get conditionalStyle() {
    return new Map([...super.conditionalStyle, [CARD.style.dynamic.secondaryInfoError.class, this._cardView.hasStandardEntityError]]);
  }

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      iconColor: bar.iconColor,
      gradient: bar.colorGradient,
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
  _getJinjaHandlers(content) {
    return {
      ...this._baseJinjaHandlers(content),
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
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
  static _baseClass = META.types.card.typeName;

  // ─── STATIC METHODS ===

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
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
  static _baseClass = META.types.badge.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new ObjStructure('badge');

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ===
  _getJinjaHandlers(content) {
    return {
      ...this._baseJinjaHandlers(content),
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
   * Executed once per connection: the observer is tracked by the ResourceManager
   * (disconnected on cleanup) and its presence serves as the re-entry guard.
   *
   * @inspired by hass-progress-bar-feature (MIT License) — Copyright (c) ytilis
   * @see https://github.com/ytilis/hass-progress-bar-feature
   */
  #fixCardStyles() {
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position)) return;
    // CF5 - issue (medium) resolved - the MutationObserver was never disconnected: it kept observing the external card container after the feature left the DOM (leak + callbacks on a dead element). It is now tracked by the ResourceManager, and its presence replaces the #firstHack guard so a reconnection re-installs it.
    if (!this._resourceManager || this._resourceManager.has('featureRowFix')) return;
    const cardContainer = DOMHelper.walkUpThroughShadow(this, '.card');
    if (!cardContainer) return;

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
    const observer = new MutationObserver(fix);
    observer.observe(cardContainer, {
      attributes: true,
      attributeFilter: ['style'],
    });
    this._resourceManager.add(() => observer.disconnect(), 'featureRowFix');
  }

  // ─── HANDLE UPDATE ────────────────────────────────────────────────────────

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();
  }

  // ─── CSS MANAGEMENT ───────────────────────────────────────────────────────

  _updateCSS() {
    const bar = this._cardView;
    const progressValue = bar.percent / 100;
    this._applyProgressCSS(progressValue, {
      barColor: bar.barColor,
      gradient: bar.colorGradient,
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

/******************************************************************************************
 * 🛠️ EntityProgressTemplateBase
 * ========================================================================================
 *
 * HABase subclass for Jinja-driven template cards. Unlike standard cards, all display
 * fields (name, secondary, icon, percent, badge, bar_effect) are controlled via Jinja
 * template subscriptions rather than entity state.
 *
 * Subclasses MAY override:
 * - _cardStructure  → static ObjStructure instance (e.g. 'badge' for template badges)
 * - _cardView       → view instance (e.g. BadgeTemplateView for template badges)
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
      color: () => this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.color.var, ThemeManager.adaptColor(content)),
      bar_color: () =>
        this._dom.setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.progressBar.color.var, ThemeManager.adaptColor(content)),
    };
  }

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
    // CF5 - issue (minor) resolved - a percent template returning a numeric string was compared lexicographically in getTrend ('9' < '45' is false → wrong trend); non-numeric results now show an explicit error icon instead of corrupting the trend and the bar CSS
    const value = is.number(percent) ? percent : is.strictNumericString(percent) ? Number(percent) : null;
    if (value === null) {
      this._updateTrend(NaN); // renders the error icon, keeps _lastPercent untouched
      return;
    }
    this._updateTrend(value);
    this._renderPercentCSS(value);
  }

  // Called without param from HABase._updateDynamicElements (pre-Jinja),
  // and with percent from _managePercent when the Jinja template resolves.
  _updateTrend(percent) {
    if (!this._cardView.config.trend_indicator) return;
    // CF5 - issue (major) resolved - the paramless call from _updateDynamicElements ran getTrend(undefined), which clobbered _lastPercent on every refresh: the trend indicator stayed 'flat' whenever a hass update interleaved two Jinja percent pushes. Only Jinja pushes may update the trend.
    if (percent === undefined) return;
    // NaN = invalid template result: show the error icon without touching _lastPercent
    const icon = Number.isNaN(percent) ? this._trendIcons.error : this._trendIcons[this._cardView.getTrend(percent)];
    this._dom.setAttribute(CARD.htmlStructure.elements.trendIndicator.icon.class, CARD.style.icon.badge.default.attribute, icon);
  }

  _renderPercentCSS(percent) {
    this._applyProgressCSS(percent / 100);
  }

  // ─── TEMPLATE PROCESSING ===

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
  static _baseClass = META.types.template.typeName;

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
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
  static _baseClass = META.types.badgeTemplate.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new ObjStructure('badge');
  _cardView = new BadgeTemplateView();

  setConfig(config) {
    super.setConfig(config);
    // Defer refresh by one tick so HA finishes its own DOM update cycle before we read state.
    // CF5 - issue (minor) resolved - the raw setTimeout was untracked and could fire after disconnect; routed through ResourceManager so cleanup() cancels it (the shared id also dedupes rapid setConfig calls)
    if (this.hass) this._resourceManager?.setTimeout(() => this.refresh(), 0, 'deferredRefresh');
  }

  static getStubConfig(hass) {
    return { type: `custom:${devName(META.types.badgeTemplate.typeName)}`, entity: HABase.getStubEntity(hass) };
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
  _applyContext(name, contextDef, config) {
    this.enqueue(name, 'context', () => {
      const target = this._domElements.get(name);
      if (!target) return;
      target.context = Object.fromEntries(
        Object.entries(contextDef).map(([key, configKey]) => [key, config[configKey] ?? ''])
      );
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
      const entityId = def.selectorOf.includes('.')
        ? def.selectorOf.split('.').reduce((obj, k) => obj?.[k], config) ?? ''
        : config[def.selectorOf] ?? '';
      this.updateSelector(name, { attribute: { entity_id: entityId } });
    }

    // Context
    if (def.context) {
      this._applyContext(name, def.context, config);
    }

    // Champs virtuels — pas de valeur dans le config, géré par showIf uniquement
    if (def.virtual) {
      this._updateVirtualValue(name, def, config);
      return;
    }

    // Value
    const raw = resolveValue(def, config);
    const val = def.invert ? !raw : raw;
    this.updateValue(name, val);

    // Allow elements with updateConfig (e.g. chips fields) to receive full config
    const el = this._domElements.get(name);
    if (el && is.func(el.updateConfig)) el.updateConfig(config);

    // Inject effective default_action so ha-selector renders "Default (action-name)"
    if (def.type === 'action') this._updateActionSelector(name, def, config);
  }


  _updateVirtualValue(name, def, config) {
    if (!def.resolveVirtual) return;
    this.updateValue(name, def.resolveVirtual(config));
  }
}

const VALUE_CHANGED_EVENT = 'value-changed';
const HA_SELECTOR_TAG = 'ha-selector';
const HA_CHIP_SET_TAG = 'ha-chip-set';
const HA_SVG_ICON_TAG = 'ha-svg-icon';

const CHIPS_HOST_STYLE = `:host { display: block; width: 100%; } ha-filter-chip[selected] { --md-filter-chip-selected-container-color: var(--primary-color); --md-filter-chip-selected-label-text-color: var(--text-primary-color, #fff); --md-filter-chip-selected-leading-icon-color: var(--text-primary-color, #fff); }`;

class ChipsBase extends HTMLElement {
  // CF5 - issue (major) resolved - setLabels() is called by the editor before the element is connected, when the chips Map is still empty; labels are now stored and applied at build time
  _labels = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot.querySelector(HA_CHIP_SET_TAG)) this._buildDOM();
    this._render();
  }

  _chipLabel(value) {
    return this._labels?.[value] ?? value;
  }

  // Swallow the generic label assignment done by the editor on every field element.
  // eslint-disable-next-line class-methods-use-this
  set label(_) {}
}

class EntityProgressEffectChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-effect-chips';
  static #EFFECTS = [
    { value: 'radius' },
    { value: 'glass',            showIf: (c) => c.color_mode === 'auto' || is.nullish(c.color_mode) },
    { value: 'gradient',         showIf: (c) => c.color_mode === 'auto' || is.nullish(c.color_mode) },
    { value: 'gradient_reverse', showIf: (c) => c.color_mode === 'auto' || is.nullish(c.color_mode) },
    { value: 'shimmer' },
    { value: 'shimmer_reverse' },
  ];

  static #INCOMPATIBLE = {
    gradient:         ['gradient_reverse', 'glass'],
    gradient_reverse: ['gradient', 'glass'],
    glass:            ['gradient', 'gradient_reverse'],
    shimmer:          ['shimmer_reverse'],
    shimmer_reverse:  ['shimmer'],
  };

  #selected = [];
  #config = {};
  #chips = new Map();

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = CHIPS_HOST_STYLE;
    const chipSet = document.createElement(HA_CHIP_SET_TAG);
    for (const effect of EntityProgressEffectChips.#EFFECTS) {
      const chip = document.createElement('ha-filter-chip');
      chip.label = this._chipLabel(effect.value);
      chip.addEventListener('click', (e) => { e.stopPropagation(); this.#toggle(effect.value); });
      chipSet.appendChild(chip);
      this.#chips.set(effect.value, chip);
    }
    this.shadowRoot.append(style, chipSet);
  }

  #toggle(value) {
    const isSelected = this.#selected.includes(value);
    const blocked = isSelected ? [] : (EntityProgressEffectChips.#INCOMPATIBLE[value] ?? []);
    const updated = isSelected
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected.filter((v) => !blocked.includes(v)), value];
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }));
  }

  set value(val) { this.#selected = is.array(val) ? val : []; this._render(); }

  updateConfig(config) { this.#config = config ?? {}; this._render(); }

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [value, chip] of this.#chips) chip.label = this._chipLabel(value);
  }

  _render() {
    if (!this.#chips.size) return;
    for (const effect of EntityProgressEffectChips.#EFFECTS) {
      const chip = this.#chips.get(effect.value);
      if (!chip) continue;
      const visible = !effect.showIf || effect.showIf(this.#config);
      const blocked = (EntityProgressEffectChips.#INCOMPATIBLE[effect.value] ?? []).some((v) => this.#selected.includes(v));
      chip.style.display = visible && !blocked ? '' : 'none';
      chip.selected = this.#selected.includes(effect.value);
    }
  }
}

if (!customElements.get(EntityProgressEffectChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressEffectChips.ELEMENT_NAME, EntityProgressEffectChips);
}

class EntityProgressHideChips extends ChipsBase {
  static ELEMENT_NAME = 'entity-progress-hide-chips';
  static #ITEMS = ['icon', 'name', 'value', 'secondary_info', 'progress_bar'];

  #selected = [];
  #chips = new Map();

  _buildDOM() {
    const style = document.createElement('style');
    style.textContent = CHIPS_HOST_STYLE;
    const chipSet = document.createElement(HA_CHIP_SET_TAG);
    for (const item of EntityProgressHideChips.#ITEMS) {
      const chip = document.createElement('ha-filter-chip');
      chip.label = this._chipLabel(item);
      chip.addEventListener('click', (e) => { e.stopPropagation(); this.#toggle(item); });
      chipSet.appendChild(chip);
      this.#chips.set(item, chip);
    }
    this.shadowRoot.append(style, chipSet);
  }

  #toggle(value) {
    const updated = this.#selected.includes(value)
      ? this.#selected.filter((v) => v !== value)
      : [...this.#selected, value];
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, { detail: { value: updated }, bubbles: true, composed: true }));
  }

  set value(val) { this.#selected = is.array(val) ? val : []; this._render(); }

  // eslint-disable-next-line class-methods-use-this
  updateConfig(_config) {}

  setLabels(labels) {
    this._labels = labels ?? null;
    for (const [item, chip] of this.#chips) chip.label = this._chipLabel(item);
  }

  _render() {
    for (const [item, chip] of this.#chips) chip.selected = this.#selected.includes(item);
  }
}

if (!customElements.get(EntityProgressHideChips.ELEMENT_NAME)) {
  customElements.define(EntityProgressHideChips.ELEMENT_NAME, EntityProgressHideChips);
}

/******************************************************************************************
 * ➕ EntityProgressAdditionsEditor
 * ========================================================================================
 * Custom element that renders an editable list of entity/attribute pairs (additions).
 * Each row shows an entity picker and an optional attribute picker.
 * Dispatches value-changed with the filtered array of { entity, attribute? } objects.
 *
 * @class
 * @extends HTMLElement
 */

class EntityProgressAdditionsEditor extends HTMLElement {
  static ELEMENT_NAME = 'entity-progress-additions-editor';

  #hass = null;
  #labelText = '';
  #value = [];
  #rows = []; // { entitySel, attrSel } per rendered row
  #list = null;
  #labelEl = null;
  #addBtn = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this.#list) this.#buildDOM();
    this.#render();
  }

  set label(val) {
    this.#labelText = val ?? '';
    if (this.#labelEl) this.#labelEl.textContent = this.#labelText;
  }

  set hass(hass) {
    this.#hass = hass;
    for (const { entitySel, attrSel } of this.#rows) {
      entitySel.hass = hass;
      attrSel.hass = hass;
    }
  }

  set value(val) {
    this.#value = is.array(val) ? val.filter(is.plainObject) : [];
    if (this.#list) this.#render();
  }

  #buildDOM() {
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
      .row { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
      .sels { display: flex; flex: 1; gap: 8px; min-width: 0; }
      .sel { flex: 1; min-width: 0; }
      .del-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
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
    this.#labelEl = document.createElement('div');
    this.#labelEl.className = 'lbl';
    this.#labelEl.textContent = this.#labelText;
    this.#list = document.createElement('div');
    this.#addBtn = document.createElement('ha-button');
    const addIcon = document.createElement(HA_SVG_ICON_TAG);
    addIcon.setAttribute('slot', 'icon');
    addIcon.path = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
    this.#addBtn.appendChild(addIcon);
    this.#addBtn.append('Add entity');
    this.#addBtn.addEventListener('click', () => {
      this.#value = [...this.#value, {}];
      this.#render();
    });
    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    addRow.appendChild(this.#addBtn);
    this.shadowRoot.append(style, this.#labelEl, this.#list, addRow);
  }

  #updateItem(index, patch) {
    this.#value = this.#value.map((item, i) => i === index ? { ...item, ...patch } : item);
    this.#render();
    this.#dispatch();
  }

  #deleteRow(index) {
    this.#value = this.#value.filter((_, i) => i !== index);
    this.#render();
    this.#dispatch();
  }

  #dispatch() {
    const clean = this.#value.filter((i) => i.entity);
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, {
      detail: { value: clean.length ? clean : undefined },
      bubbles: true,
      composed: true,
    }));
  }

  #render() {
    this.#list.innerHTML = '';
    this.#rows = [];
    for (let i = 0; i < this.#value.length; i++) {
      const item = this.#value[i];

      const entitySel = document.createElement(HA_SELECTOR_TAG);
      entitySel.hass = this.#hass;
      entitySel.selector = { entity: {} };
      entitySel.value = item.entity ?? '';
      entitySel.required = false;
      entitySel.className = 'sel';
      entitySel.addEventListener(VALUE_CHANGED_EVENT, (e) => {
        e.stopPropagation();
        this.#updateItem(i, { entity: e.detail.value || undefined, attribute: undefined });
      });

      const attrSel = document.createElement(HA_SELECTOR_TAG);
      attrSel.hass = this.#hass;
      attrSel.selector = { attribute: { entity_id: item.entity ?? '' } };
      attrSel.value = item.attribute ?? '';
      attrSel.required = false;
      attrSel.className = 'sel';
      attrSel.style.display = item.entity ? '' : 'none';
      attrSel.addEventListener(VALUE_CHANGED_EVENT, (e) => {
        e.stopPropagation();
        this.#updateItem(i, { attribute: e.detail.value || undefined });
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.title = 'Delete';
      const delIcon = document.createElement(HA_SVG_ICON_TAG);
      delIcon.path = 'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';
      delBtn.appendChild(delIcon);
      delBtn.addEventListener('click', () => this.#deleteRow(i));

      const sels = document.createElement('div');
      sels.className = 'sels';
      sels.append(entitySel, attrSel);

      const row = document.createElement('div');
      row.className = 'row';
      row.append(sels, delBtn);
      this.#list.appendChild(row);
      this.#rows.push({ entitySel, attrSel });
    }
  }
}

if (!customElements.get(EntityProgressAdditionsEditor.ELEMENT_NAME)) {
  customElements.define(EntityProgressAdditionsEditor.ELEMENT_NAME, EntityProgressAdditionsEditor);
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

  // ─── private state ────────────────────────────────────────────────────────

  #config = {};
  #hassProvider = null;
  #dom = null;
  #boundOnChanged = null;
  _configHelper = new BaseConfigHelper();

  get #localizedOptions() {
    // CF5 - issue (minor) resolved - localize() returns the key string before translations load; select builders then crashed on Object.entries(undefined). Fall back to the default language.
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
    // _-prefixed keys are ephemeral UI state (e.g. _show_all_actions): stripped from
    // config-changed before dispatch so HA never saves them, but preserved here across
    // setConfig calls so the editor state survives HA's config-changed → setConfig roundtrip.
    const uiState = Object.fromEntries(
      Object.entries(this.#config ?? {}).filter(([k]) => k.startsWith('_'))
    );
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

    const buildBoxSelect = (opts, imageFn = null) => ({
      // see https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
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
      // see https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
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
      maxValueAttribute: () => ({ attribute: { entity_id: this.#config.max_value ?? '' } }),
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
      bar_orientation: () => buildSelect(options.bar_orientation),
      bar_position: () => buildSelect(options.bar_position),
      color_mode: () => buildSelect(options.color_mode),
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
      label: field.noLabel ? '' : (() => {
        const fields = this.#hassProvider.localize('editor.field');
        const fieldKey = isNested ? `toggle_${childKey}` : field.name;
        return fields[fieldKey] ?? (isNested ? this.#localizedOptions?.[field.name.split('.')[0]]?.[childKey] : undefined);
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
    el.value = is.array(this.#config?.[field.target ?? field.name])
      ? this.#config[field.target ?? field.name]
      : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  #buildAdditionsField(field) {
    const el = document.createElement(EntityProgressAdditionsEditor.ELEMENT_NAME);
    el.id = field.name;
    el.style.width = '100%';
    el.label = this.#hassProvider.localize('editor.field')?.[field.name] ?? field.name;
    el.hass = this.hass;
    el.value = is.array(this.#config?.[field.name]) ? this.#config[field.name] : [];
    this.#dom.registerField(field.name, el, field);
    return el;
  }

  #buildField(field) {
    if (field.type === 'effect_chips') return this.#buildChipsField(field, EntityProgressEffectChips.ELEMENT_NAME, 'bar_effect');
    if (field.type === 'hide_chips') return this.#buildChipsField(field, EntityProgressHideChips.ELEMENT_NAME, 'hide');
    if (field.type === 'additions_editor') return this.#buildAdditionsField(field);

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
      el.context = Object.fromEntries(
        Object.entries(field.context).map(([k, v]) => [k, this.#config[v] ?? ''])
      );
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
    const config = (negotiated && !['template', 'action'].includes(def.type)) ? negotiated : rawConfig;

    const isNested = def.name.includes('.');
    const [parentKey, childKey] = isNested ? def.name.split('.') : [def.name, null];
    const key = def.target ?? def.name;
    const fallback = EditorBase.#fallback(def, config, empty);

    // Array membership is always checked on raw config (explicit user selections).
    if (isNested && def.array) return rawConfig[parentKey]?.includes(childKey) ?? false;
    if (isNested) {
      const val = config[parentKey]?.[childKey];
      return val !== undefined ? val : fallback;
    }
    const val = config[key];
    return val !== undefined ? val : fallback;
  }

  // ─── UPDATE (every setConfig) ─────────────────────────────────────────────

  #updateFields() {
    // template/action fields read from raw config to avoid Jinja flicker during typing:
    // the validated config would fall back to default (e.g. []) the moment the expression
    // is temporarily malformed, causing the UI to flash between chip and Jinja mode.
    // All other fields (select, toggle, number…) read from the negotiated config so that
    // entity defaults (e.g. a light's default %) are reflected immediately.
    const negotiated = this._configHelper.config;
    this.#dom.updateAll(this.#config, (def, raw) => EditorBase.#resolveValue(def, raw, negotiated), negotiated);
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  #handleVirtualField(def, value) {
    if (!def.onVirtualChange) return;
    const newConfig = def.onVirtualChange(value, { ...this.#config });
    if (newConfig) {
      this.#config = newConfig;
      // Update fields immediately: HA may skip setConfig if the stripped config is unchanged
      // (e.g. toggling _show_all_actions produces the same visible config as before).
      this.#updateFields();
      this.#sendConfig(newConfig);
    }
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
    const newConfig = { ...this.#config, [targetKey]: value };
    this.#sendConfig(def?.onChange ? def.onChange(value, newConfig, this.#config) : newConfig);
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
    // Strip _-prefixed UI state keys — they are editor-only and must never reach the saved YAML.
    const clean = Object.fromEntries(Object.entries(config).filter(([k]) => !k.startsWith('_')));
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: clean },
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
  const wm  = (extra) => (c) => Boolean(c.watermark) && extra(c);
  const on  = (c) => !c.watermark?.[disableKey];
  const ent = (c) => is.string(c.watermark?.[side]);
  return {
    [`watermark.${disableKey}`]: EditorFieldsType.toggle(`watermark.${disableKey}`, {
      showIf: (c) => Boolean(c.watermark),
    }),
    [`watermark.${side}_entity_toggle`]: EditorFieldsType.toggle(`watermark.${side}_entity_toggle`, {
      virtual: true,
      showIf: wm(on),
      resolveVirtual: (c) => is.string(c.watermark?.[side]),
      onVirtualChange: (value, config) => ({
        ...config,
        watermark: { ...config.watermark, [side]: value ? '' : defaultVal, ...(!value ? { [`${side}_attribute`]: undefined } : {}) },
      }),
    }),
    [`watermark.${side}`]: EditorFieldsType.number(`watermark.${side}`, {
      showIf: wm((c) => on(c) && !ent(c)),
    }),
    [`watermark.${side}_entity`]: EditorFieldsType.entity(`watermark.${side}_entity`, {
      virtual: true,
      noLabel: true,
      showIf: wm((c) => on(c) && ent(c)),
      resolveVirtual: (c) => (is.string(c.watermark?.[side]) ? c.watermark[side] : ''),
      onVirtualChange: (value, config) => ({
        ...config,
        watermark: { ...config.watermark, [side]: value || defaultVal, ...(!value ? { [`${side}_attribute`]: undefined } : {}) },
      }),
    }),
    [`watermark.${side}_attribute`]: EditorFieldsType.select(`watermark.${side}_attribute`, {
      type: attrType,
      selectorOf: `watermark.${side}`,
      showIf: wm((c) => on(c) && ent(c) && c.watermark[side] !== ''),
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
        // CF5 - issue (minor) resolved - clearing the last addition row dispatched value: undefined, leaving an undefined key in the config; onClear now removes the key cleanly
        additions: {
          name: 'additions',
          type: 'additions_editor',
          onClear: (config) => {
            const rest = { ...config };
            delete rest.additions;
            return rest;
          },
        },
      }),
    },
  }),

  content: (template) => ({
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
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            /* next release
            bar_max_width: EditorFieldsType.slider('bar_max_width', {
              target: 'bar_max_width',
              resolveVirtual: (c) => parseInt(c.bar_max_width) || 0,
              virtual: true,
              onVirtualChange: (value, config) => ({
                ...config,
                bar_max_width: value ? `${value}px` : undefined,
              }),
            }),
            */
            unit: EditorFieldsType.text('unit', { width: availableSpace(32, 0.2) }),
            decimal: EditorFieldsType.decimal('decimal', { width: availableSpace(32, 0.2) }),
            min_value: EditorFieldsType.number('min_value', {
              width: availableSpace(32, 0.6),
              default: (c) => (c.center_zero ? -100 : 0),
            }),
            toggleUnit: EditorFieldsType.toggle('disable_unit', {
              invert: true,
              virtual: true,
              resolveVirtual: (c) => !c.disable_unit,
              onVirtualChange: (showUnit, config) => ({
                ...config,
                disable_unit: !showUnit,
                ...(!showUnit ? { unit_spacing: undefined } : {}),
              }),
            }),
            unit_spacing: EditorFieldsType.select('unit_spacing', {
              type: 'unit_spacing',
              showIf: (c) => !c.disable_unit,
            }),
            use_max_entity: EditorFieldsType.toggle('use_max_entity', {
              virtual: true,
              resolveVirtual: (c) => is.string(c.max_value),
              onVirtualChange: (value, config) => ({
                ...config,
                max_value: value ? '' : 100,
                max_value_attribute: value ? config.max_value_attribute : undefined,
              }),
            }),
            max_value: EditorFieldsType.number('max_value', { showIf: (c) => !is.string(c.max_value) }),
            max_value_entity: EditorFieldsType.entity('max_value_entity', {
              target: 'max_value',
              noLabel: true,
              showIf: (c) => is.string(c.max_value),
              onClear: (config) => ({ ...config, max_value: 100, max_value_attribute: undefined }),
            }),
            max_value_attribute: EditorFieldsType.select('max_value_attribute', {
              type: 'maxValueAttribute',
              selectorOf: 'max_value',
              showIf: (c) => is.string(c.max_value) && c.max_value !== '',
            }),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' }, }),
            custom_info: EditorFieldsType.tpl('custom_info'),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c) => Boolean(c.entity) && HassProviderSingleton.getEntityDomain(c.entity) === 'timer',
            }),
          }),
    },
  }),

  theme: (template, badge) => ({
    title: 'editor.title.theme',
    icon: HA_CONTEXT.icons.listBox,
    fields: {
      ...(template ? {} : { theme: EditorFieldsType.select('theme') }),
      ...(template ? {} : {
        color_mode: EditorFieldsType.select('color_mode', {
          showIf: (c) => (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) && !c.center_zero,
          // Selecting a non-auto color mode is incompatible with interpolate: clear it.
          onChange: (value, config) => (value && value !== 'auto') ? { ...config, interpolate: undefined } : config,
        }),
        interpolate: EditorFieldsType.toggle('interpolate', {
          showIf: (c) => (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme))
            && (is.nullish(c.color_mode) || c.color_mode === 'auto'),
        }),
      }),
      icon: EditorFieldsType.templateOrType('icon', template, 'icon', template ? {} : { width: availableSpace() }),
      color: EditorFieldsType.templateOrType('color', template, 'color', {
        showIf: (c) => is.nullish(c.theme),
        ...(template ? {} : { width: availableSpace() }),
      }),
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
      reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', { showIf: (c) => (!c.bar_position || c.bar_position === 'default') && c.layout === 'horizontal' }),
      center_zero: EditorFieldsType.toggle('center_zero', {
        virtual: true,
        showIf: (c) => c.color_mode === 'auto' || is.nullish(c.color_mode),
        resolveVirtual: (c) => Boolean(c.center_zero),
        onVirtualChange: (value, config) => ({
          ...config,
          center_zero: value ? (is.plainObject(config.center_zero) ? config.center_zero : true) : false,
        }),
      }),
      center_zero_value: EditorFieldsType.number('center_zero_value', {
        target: 'center_zero',
        showIf: (c) => Boolean(c.center_zero) && (c.color_mode === 'auto' || is.nullish(c.color_mode)),
        virtual: true,
        resolveVirtual: (c) => (is.plainObject(c.center_zero) ? c.center_zero.value ?? 0 : 0),
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
        showIf: (c) => Boolean(c.center_zero) && (c.color_mode === 'auto' || is.nullish(c.color_mode)),
        virtual: true,
        resolveVirtual: (c) => (is.plainObject(c.center_zero) ? Boolean(c.center_zero.growth_percent) : false),
        onVirtualChange: (value, config) => {
          const currentValue = is.plainObject(config.center_zero) ? config.center_zero.value ?? 0 : 0;
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
      ...(!template ? (() => {
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
        // ── Groupes LOW / HIGH (générés par wmSide) ────────────────────────
        ...wmSide('low', 20),
        ...wmSide('high', 80),
        'watermark.line_size': EditorFieldsType.text('watermark.line_size', {
          showIf: wm((c) => c.watermark?.type === 'line'),
        }),
        }; })() : {}),
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
      // ── Card-only layout options ──────────────────────────────────────────
      ...(!badge ? {
        frameless: EditorFieldsType.toggle('frameless', { width: availableSpace() }),
        marginless: EditorFieldsType.toggle('marginless', { width: availableSpace() }),
        height: EditorFieldsType.text('height', { width: availableSpace() }),
        min_width: EditorFieldsType.text('min_width', { width: availableSpace() }),
      } : {}),
      ...(!template && !badge ? {
        bar_max_width: EditorFieldsType.slider('bar_max_width', {
          virtual: true,
          showIf: (c) => (c.layout ?? 'horizontal') === 'vertical',
          resolveVirtual: (c) => parseInt(c.bar_max_width) || 0,
          onVirtualChange: (value, config) => ({
            ...config,
            bar_max_width: value ? `${value}px` : undefined,
          }),
        }),
      } : {}),
      // ── Layout (always last) ──────────────────────────────────────────────
      ...(badge
        ? {}
        : {
            layout: EditorFieldsType.select('layout'),
          }),
    },
  }),

  interactions: (badge) => {
    // isActive: show a field only if its negotiated action differs from the 'none' default.
    // orAll: also show when the "show all" toggle (_show_all_actions) is on.
    // _show_all_actions is ephemeral UI state: stored in raw config with _ prefix,
    // stripped before config-changed dispatch, never saved to YAML.
    //
    // tap_action and icon_tap_action are always visible (no showIf):
    //   - tap_action default is 'more-info' — always relevant.
    //   - icon_tap_action default depends on the entity domain: 'none' for most entities,
    //     'toggle' for lights, switches, etc. (patched at validation time via toggleDomain).
    //     Always showing it lets the hint reveal the effective default.
    const isActive = (key) => (_, n) => n?.[key]?.action !== 'none';
    const orAll   = (pred) => (c, n) => Boolean(c._show_all_actions) || pred(c, n);
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        show_all_actions: {
          name: 'show_all_actions', type: 'toggle', virtual: true,
          resolveVirtual: (c) => Boolean(c._show_all_actions),
          onVirtualChange: (value, config) => ({ ...config, _show_all_actions: value }),
        },
        tap_action:        EditorFieldsType.action('tap_action'),
        hold_action:       EditorFieldsType.action('hold_action',       { showIf: orAll(isActive('hold_action')) }),
        double_tap_action: EditorFieldsType.action('double_tap_action', { showIf: orAll(isActive('double_tap_action')) }),
        ...(!badge ? {
          icon_tap_action:        EditorFieldsType.action('icon_tap_action'),
          icon_hold_action:       EditorFieldsType.action('icon_hold_action',       { showIf: orAll(isActive('icon_hold_action')) }),
          icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', { showIf: orAll(isActive('icon_double_tap_action')) }),
        } : {}),
      },
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

RegistrationHelper.registerCard(META.types.card, EntityProgressCard, EntityProgressCardEditor);
RegistrationHelper.registerBadge(META.types.badge, EntityProgressBadge, EntityProgressBadgeEditor);
RegistrationHelper.registerCard(META.types.template, EntityProgressTemplateCard, EntityProgressTemplateEditor);
RegistrationHelper.registerBadge(META.types.badgeTemplate, EntityProgressTemplateBadge, EntityProgressBadgeTemplateEditor);
RegistrationHelper.registerCardFeature(META.types.feature, EntityProgressFeatures);

/******************************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
console.log(CARD.console.link);
console.groupEnd();
