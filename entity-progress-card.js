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

const VERSION = '1.5.3-dev';
const CARD = {
  meta: {
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
    },
    feature: {
      typeName: 'entity-progress-feature',
      name: 'Entity Progress Feature',
      description: 'A cool custom feature in tile to show current entity status with a progress bar.',
    },
  },
  config: {
    dev: true,
    debug: { card: true, editor: true, interactionHandler: true, ressourceManager: true, hass: false },
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
    entity: {
      state: { unavailable: 'unavailable', unknown: 'unknown', notFound: 'notFound', idle: 'idle', active: 'active', paused: 'paused' },
      type: { timer: 'timer', light: 'light', cover: 'cover', fan: 'fan', climate: 'climate', counter: 'counter', number: 'number' },
      class: { shutter: 'shutter', battery: 'battery' },
    },
    msFactor: 1000,
    shadowMode: 'open',
    refresh: { ratio: 500, min: 250, max: 1000 },
    stub: {
      template: {
        icon: 'mdi:washing-machine',
        name: 'Entity Progress Card',
        secondary: 'Template',
        badge_icon: 'mdi:update',
        badge_color: 'green',
        percent: '{{ 50 }}',
        force_circular_background: true,
      },
    },
    languageMap: {
      af: 'af-ZA',
      ar: 'ar',
      bg: 'bg-BG',
      bn: 'bn',
      ca: 'ca-ES',
      cs: 'cs-CZ',
      da: 'da-DK',
      de: 'de-DE',
      'de-CH': 'de-CH',
      el: 'el-GR',
      en: 'en-US',
      es: 'es-ES',
      et: 'et-EE',
      eu: 'eu-ES',
      fa: 'fa-IR',
      fi: 'fi-FI',
      fr: 'fr-FR',
      gl: 'gl-ES',
      gu: 'gu-IN',
      he: 'he-IL',
      hi: 'hi-IN',
      hr: 'hr-HR',
      hu: 'hu-HU',
      id: 'id-ID',
      is: 'is-IS',
      it: 'it-IT',
      ja: 'ja-JP',
      ka: 'ka-GE',
      kn: 'kn-IN',
      ko: 'ko-KR',
      kw: 'kw-GB',
      lb: 'lb-LU',
      lt: 'lt-LT',
      lv: 'lv-LV',
      ml: 'ml-IN',
      mn: 'mn-MN',
      mr: 'mr-IN',
      ms: 'ms-MY',
      nb: 'nb-NO',
      ne: 'ne-NP',
      nl: 'nl-NL',
      pl: 'pl-PL',
      pt: 'pt-PT',
      'pt-br': 'pt-BR',
      ro: 'ro-RO',
      ru: 'ru-RU',
      sk: 'sk-SK',
      sl: 'sl-SI',
      sr: 'sr-RS',
      'sr-Latn': 'sr-Latn-RS',
      sv: 'sv-SE',
      sw: 'sw-KE',
      te: 'te-IN',
      th: 'th-TH',
      tr: 'tr-TR',
      uk: 'uk-UA',
      ur: 'ur-PK',
      vi: 'vi-VN',
      'zh-cn': 'zh-CN',
      'zh-hk': 'zh-HK',
      'zh-tw': 'zh-TW',
      'zh-Hant': 'zh-TW',
    },
    separator: ' · ',
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
      default: 'var(--state-icon-color)',
      disabled: 'var(--dark-grey-color)',
      unavailable: 'var(--state-unavailable-color)',
      notFound: 'var(--state-inactive-color)',
      active: 'var(--state-active-color)',
      coverActive: 'var(--state-cover-active-color)',
      lightActive: '#FF890E',
      fanActive: 'var(--state-fan-active-color)',
      battery: {
        low: 'var(--state-sensor-battery-low-color)',
        medium: 'var(--state-sensor-battery-medium-color)',
        high: 'var(--state-sensor-battery-high-color)',
      },
      climate: {
        dry: 'var(--state-climate-dry-color)',
        cool: 'var(--state-climate-cool-color)',
        heat: 'var(--state-climate-heat-color)',
        fanOnly: 'var(--state-climate-fan_only-color)',
      },
      inactive: 'var(--state-inactive-color)',
    },
    icon: {
      default: { icon: 'mdi:alert' },
      alert: { icon: 'mdi:alert-circle-outline', color: '#0080ff', attribute: 'icon' },
      notFound: { icon: 'mdi:help' },
      badge: {
        default: { attribute: 'icon' },
        unavailable: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--orange-color)', attribute: 'icon' },
        notFound: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--red-color)', attribute: 'icon' },
        timer: {
          active: { icon: 'mdi:play', color: 'white', backgroundColor: 'var(--success-color)', attribute: 'icon' },
          paused: { icon: 'mdi:pause', color: 'white', backgroundColor: 'var(--state-icon-color)', attribute: 'icon' },
        },
      },
    },
    bar: {
      sizeOptions: {
        small: { label: 'small', mdi: 'mdi:size-s' },
        medium: { label: 'medium', mdi: 'mdi:size-m' },
        large: { label: 'large', mdi: 'mdi:size-l' },
        xlarge: { label: 'xlarge', mdi: 'mdi:size-xl' },
      },
    },
    dynamic: {
      card: {
        minWidth: { var: '--card-min-width' },
        height: { var: '--card-height' },
      },
      badge: {
        color: { var: '--badge-color', default: 'var(--orange-color)' },
        backgroundColor: { var: '--badge-bgcolor', default: 'white' },
      },
      iconAndShape: {
        color: { var: '--icon-and-shape-color', default: 'var(--state-icon-color)' },
        icon: { size: { var: '--icon-size' } },
        shape: { size: { var: '--shape-size' } },
      },
      haRipple: {
        color: { var: '--ha-ripple-color' },
      },
      progressBar: {
        color: { var: '--progress-bar-color', default: 'var(--state-icon-color)' },
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
        mdi: 'mdi:focus-field-horizontal',
        minHeight: '56px',
      },
      vertical: {
        label: 'vertical',
        grid: { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 },
        mdi: 'mdi:focus-field-vertical',
        minHeight: '120px',
      },
    },
  },
  interactions: {
    event: {
      HASelect: ['selected'],
      toggle: ['change'],
      other: ['value-changed', 'input'],
      closed: 'closed',
      click: 'click',
      configChanged: 'config-changed',
      originalTarget: { icon: ['ha-shape', 'ha-svg-icon'] },
      from: { icon: 'icon', card: 'card' },
      tap: {
        tapAction: 'tap',
        holdAction: 'hold',
        doubleTapAction: 'double_tap',
        iconTapAction: 'icon_tap',
        iconHoldAction: 'icon_hold',
        iconDoubleTapAction: 'icon_double_tap',
      },
    },
    action: {
      default: 'default',
      navigate: { action: 'navigate' },
      moreInfo: { action: 'more-info' },
      url: { action: 'url' },
      assist: { action: 'assist' },
      toggle: { action: 'toggle' },
      performAction: { action: 'perform-action' },
      none: { action: 'none' },
    },
  },
  editor: {
    fields: {
      container: { element: 'div', class: 'editor' },
      entity: { type: 'entity', element: 'ha-form' },
      attribute: { type: 'attribute', element: 'ha-selector' }, // 2026.2 : ha-select -> ha-selector
      max_value_attribute: { type: 'max_value_attribute', element: 'ha-selector' }, // 2026.2 : ha-select -> ha-selector
      icon: { type: 'icon', element: 'ha-form' },
      layout: { type: 'layout', element: 'ha-selector' }, // 2026.2 : ha-select -> ha-selector
      bar_size: { type: 'bar_size', element: 'ha-selector' }, // 2026.2 : ha-select -> ha-selector
      tap_action: { type: 'tap_action', element: 'ha-form' },
      double_tap_action: { type: 'double_tap_action', element: 'ha-form' },
      hold_action: { type: 'hold_action', element: 'ha-form' },
      icon_tap_action: { type: 'icon_tap_action', element: 'ha-form' },
      icon_double_tap_action: { type: 'icon_double_tap_action', element: 'ha-form' },
      icon_hold_action: { type: 'icon_hold_action', element: 'ha-form' },
      theme: { type: 'theme', element: 'ha-selector' }, // 2026.2 : ha-select -> ha-selector
      color: { type: 'color', element: 'ha-form' },
      number: { type: 'number', element: 'ha-selector' }, // 2026.2 : ha-textfield -> ha-selector
      decimal: { type: 'decimal', element: 'ha-selector' },
      default: { type: 'text', element: 'ha-selector' }, // 2026.2 : ha-textfield -> ha-selector
      toggle: { type: 'toggle', element: 'ha-selector', class: 'editor-toggle' }, // 2026.2 : ha-switch -> ha-selector
      text: { element: 'span' },
      accordion: {
        item: { element: 'div', class: 'accordion' },
        icon: { element: 'ha-icon', class: 'accordion-icon' },
        title: { element: 'button', class: 'accordion-title' },
        arrow: { element: 'ha-icon', class: 'accordion-arrow', icon: 'mdi:chevron-down' },
        content: { element: 'div', class: 'accordion-content' },
      },
    },
    keyMappings: {
      attribute: 'attribute',
      max_value_attribute: 'max_value_attribute',
      url_path: 'url_path',
      navigation_path: 'navigation_path',
      theme: 'theme',
      tapAction: 'tap_action',
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
  documentation: {
    link: {
      element: 'a',
      class: 'documentation-link',
      linkTarget: '_blank',
      documentationUrl: 'https://github.com/francois-le-ko4la/lovelace-entity-progress-card/',
    },
    shape: { element: 'div', class: 'documentation-link-shape' },
    questionMark: {
      element: 'ha-icon',
      class: 'documentation-icon',
      icon: 'mdi:help-circle',
      style: { width: '24px', class: '24px' },
    },
  },
};

CARD.config.defaults = {
  tap_action: { action: 'more-info' },
  hold_action: { action: 'none' },
  double_tap_action: { action: 'none' },
  icon_tap_action: { action: 'none' },
  icon_hold_action: { action: 'none' },
  icon_double_tap_action: { action: 'none' },
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
  message: `%c✨${CARD.meta.card.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
  css: 'color:orange; background-color:black; font-weight: bold;',
  link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card',
};

const DEF_COLORS = new Set([
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
  'disabled',
]);

const THEME = {
  optimal_when_low: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: 'var(--success-color)' },
      { min: 20, max: 50, icon: null, color: 'var(--yellow-color)' },
      { min: 50, max: 80, icon: null, color: 'var(--accent-color)' },
      { min: 80, max: 100, icon: null, color: 'var(--red-color)' },
    ],
  },
  optimal_when_high: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 20, icon: null, color: 'var(--red-color)' },
      { min: 20, max: 50, icon: null, color: 'var(--accent-color)' },
      { min: 50, max: 80, icon: null, color: 'var(--yellow-color)' },
      { min: 80, max: 100, icon: null, color: 'var(--success-color)' },
    ],
  },
  light: {
    linear: true,
    percent: true,
    style: [
      { icon: 'mdi:lightbulb-outline', color: '#4B4B4B' },
      { icon: 'mdi:lightbulb-outline', color: '#877F67' },
      { icon: 'mdi:lightbulb', color: '#C3B382' },
      { icon: 'mdi:lightbulb', color: '#FFE79E' },
      { icon: 'mdi:lightbulb', color: '#FFE79E' },
    ],
  },
  temperature: {
    linear: false,
    percent: false,
    style: [
      { min: -50, max: -30, icon: 'mdi:thermometer', color: 'var(--deep-purple-color)' },
      { min: -30, max: -15, icon: 'mdi:thermometer', color: 'var(--indigo-color)' },
      { min: -15, max: -2, icon: 'mdi:thermometer', color: 'var(--blue-color)' },
      { min: -2, max: 2, icon: 'mdi:thermometer', color: 'var(--light-blue-color)' },
      { min: 2, max: 8, icon: 'mdi:thermometer', color: 'var(--cyan-color)' },
      { min: 8, max: 16, icon: 'mdi:thermometer', color: 'var(--teal-color)' },
      { min: 16, max: 18, icon: 'mdi:thermometer', color: 'var(--green-color)' },
      { min: 18, max: 20, icon: 'mdi:thermometer', color: 'var(--light-green-color)' },
      { min: 20, max: 25, icon: 'mdi:thermometer', color: 'var(--success-color)' },
      { min: 25, max: 27, icon: 'mdi:thermometer', color: 'var(--yellow-color)' },
      { min: 27, max: 29, icon: 'mdi:thermometer', color: 'var(--amber-color)' },
      { min: 29, max: 34, icon: 'mdi:thermometer', color: 'var(--deep-orange-color)' },
      { min: 34, max: 100, icon: 'mdi:thermometer', color: 'var(--red-color)' },
    ],
  },
  humidity: {
    linear: false,
    percent: true,
    style: [
      { min: 0, max: 23, icon: 'mdi:water-percent', color: 'var(--red-color)' },
      { min: 23, max: 30, icon: 'mdi:water-percent', color: 'var(--accent-color)' },
      { min: 30, max: 40, icon: 'mdi:water-percent', color: 'var(--yellow-color)' },
      { min: 40, max: 50, icon: 'mdi:water-percent', color: 'var(--success-color)' },
      { min: 50, max: 60, icon: 'mdi:water-percent', color: 'var(--teal-color)' },
      { min: 60, max: 65, icon: 'mdi:water-percent', color: 'var(--light-blue-color)' },
      { min: 65, max: 80, icon: 'mdi:water-percent', color: 'var(--indigo-color)' },
      { min: 80, max: 100, icon: 'mdi:water-percent', color: 'var(--deep-purple-color)' },
    ],
  },
  voc: {
    linear: false,
    percent: false,
    style: [
      { min: 0, max: 300, icon: 'mdi:air-filter', color: 'var(--success-color)' },
      { min: 300, max: 500, icon: 'mdi:air-filter', color: 'var(--yellow-color)' },
      { min: 500, max: 3000, icon: 'mdi:air-filter', color: 'var(--accent-color)' },
      { min: 3000, max: 25000, icon: 'mdi:air-filter', color: 'var(--red-color)' },
      { min: 25000, max: 50000, icon: 'mdi:air-filter', color: 'var(--deep-purple-color)' },
    ],
  },
  pm25: {
    linear: false,
    percent: false,
    style: [
      { min: 0, max: 12, icon: 'mdi:air-filter', color: 'var(--success-color)' },
      { min: 12, max: 35, icon: 'mdi:air-filter', color: 'var(--yellow-color)' },
      { min: 35, max: 55, icon: 'mdi:air-filter', color: 'var(--accent-color)' },
      { min: 55, max: 150, icon: 'mdi:air-filter', color: 'var(--red-color)' },
      { min: 150, max: 200, icon: 'mdi:air-filter', color: 'var(--deep-purple-color)' },
    ],
  },
};

const SEV = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
};

const LANGUAGES = {
  ar: {
    card: {
      msg: {
        entityNotFound: 'لم يتم العثور على الكيان في Home Assistant.',
        attributeNotFound: 'لم يتم العثور على الخاصية في Home Assistant.',
        missingRequiredProperty: 'خاصية مطلوبة مفقودة.',
        invalidTypeString: 'كان من المتوقع قيمة من نوع سلسلة.',
        invalidTypeNumber: 'كان من المتوقع قيمة من نوع رقم.',
        invalidTypeBoolean: 'كان من المتوقع قيمة من نوع منطقي.',
        invalidTypeArray: 'كان من المتوقع قيمة من نوع مصفوفة.',
        invalidTypeObject: 'كان من المتوقع قيمة من نوع كائن.',
        invalidEnumValue: 'القيمة المُقدمة ليست من الخيارات المسموح بها.',
        invalidUnionType: 'القيمة لا تطابق أي نوع مسموح.',
        invalidEntityId: 'معرّف الكيان غير صالح أو به خلل.',
        invalidDecimal: 'يجب أن تكون القيمة رقمًا عشريًا صحيحًا.',
        invalidActionObject: 'كائن الإجراء غير صالح أو غير منظم بشكل صحيح.',
        missingActionKey: 'مفتاح مطلوب مفقود في كائن الإجراء.',
        invalidCustomThemeArray: 'يجب أن يكون السمة المخصصة عبارة عن مصفوفة.',
        invalidCustomThemeEntry: 'إدخال أو أكثر في السمة المخصصة غير صالحة.',
        invalidMinValue: 'القيمة الدنيا غير صالحة أو أقل من الحدود المسموح بها.',
        invalidMaxValue: 'القيمة القصوى غير صالحة أو أعلى من الحد المسموح به.',
        minGreaterThanMax: 'لا يمكن أن تكون القيمة الدنيا أكبر من القيمة القصوى.',
        discontinuousRange: 'النطاق المحدد غير متصل.',
        missingColorProperty: 'خاصية اللون المطلوبة مفقودة.',
        invalidIconType: 'نوع الأيقونة المحدد غير صالح أو غير معروف.',
        invalidStateContent: 'محتوى الحالة غير صالح أو معيب.',
        invalidStateContentEntry: 'إدخال أو أكثر في محتوى الحالة غير صالحة.',
        invalidTheme: 'السمة المحددة غير معروفة. سيتم استخدام السمة الافتراضية.',
        appliedDefaultValue: 'تم تطبيق قيمة افتراضية تلقائيًا.',
      },
    },
    editor: {
      title: {
        content: 'المحتوى',
        interaction: 'التفاعلات',
        theme: 'المظهر',
      },
      field: {
        entity: 'الكيان',
        attribute: 'السمة',
        name: 'الاسم',
        unit: 'الوحدة',
        decimal: 'عشري',
        min_value: 'القيمة الدنيا',
        max_value: 'القيمة القصوى',
        max_value_attribute: 'السمة (max_value)',
        tap_action: 'الإجراء عند النقر القصير',
        double_tap_action: 'الإجراء عند النقر المزدوج',
        hold_action: 'الإجراء عند الضغط المطول',
        icon_tap_action: 'الإجراء عند النقر على الأيقونة',
        icon_double_tap_action: 'الإجراء عند النقر المزدوج على الأيقونة',
        icon_hold_action: 'الإجراء عند الضغط المطول على الأيقونة',
        toggle_icon: 'أيقونة',
        toggle_name: 'الاسم',
        toggle_value: 'قيمة',
        toggle_unit: 'الوحدة',
        toggle_secondary_info: 'معلومات',
        toggle_progress_bar: 'شريط',
        toggle_force_circular_background: 'فرض خلفية دائرية',
        theme: 'السمة',
        bar_size: 'حجم الشريط',
        bar_color: 'لون الشريط',
        icon: 'أيقونة',
        color: 'اللون الأساسي',
        layout: 'تخطيط البطاقة',
      },
      option: {
        theme: {
          optimal_when_low: 'مثالي عند الانخفاض (CPU، RAM...)',
          optimal_when_high: 'مثالي عند الارتفاع (البطارية...)',
          light: 'الضوء',
          temperature: 'درجة الحرارة',
          humidity: 'الرطوبة',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'صغيرة',
          medium: 'متوسطة',
          large: 'كبيرة',
          xlarge: 'كبيرة جداً',
        },
        layout: {
          horizontal: 'أفقي (افتراضي)',
          vertical: 'رأسي',
        },
      },
    },
  },
  bn: {
    card: {
      msg: {
        entityNotFound: 'HA তে সত্তা পাওয়া যায়নি।',
        attributeNotFound: 'HA তে বৈশিষ্ট্য পাওয়া যায়নি।',
        missingRequiredProperty: 'প্রয়োজনীয় বৈশিষ্ট্য অনুপস্থিত।',
        invalidTypeString: 'স্ট্রিং ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeNumber: 'সংখ্যা ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeBoolean: 'বুলিয়ান ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeArray: 'অ্যারে ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeObject: 'অবজেক্ট ধরনের একটি মান প্রত্যাশিত।',
        invalidEnumValue: 'প্রদত্ত মানটি অনুমোদিত বিকল্পগুলির মধ্যে একটি নয়।',
        invalidUnionType: 'মানটি অনুমোদিত ধরনগুলির কোনোটির সাথে মেলে না।',
        invalidEntityId: 'সত্তার আইডি অবৈধ বা ভুলভাবে গঠিত।',
        invalidDecimal: 'মানটি একটি বৈধ দশমিক সংখ্যা হতে হবে।',
        invalidActionObject: 'অ্যাকশন অবজেক্ট অবৈধ বা ভুলভাবে গঠিত।',
        missingActionKey: 'অ্যাকশন অবজেক্টে একটি প্রয়োজনীয় কী অনুপস্থিত।',
        invalidCustomThemeArray: 'কাস্টম থিম একটি অ্যারে হতে হবে।',
        invalidCustomThemeEntry: 'কাস্টম থিমে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidMinValue: 'ন্যূনতম মান অবৈধ বা অনুমোদিত সীমার নিচে।',
        invalidMaxValue: 'সর্বোচ্চ মান অবৈধ বা অনুমোদিত সীমার উপরে।',
        minGreaterThanMax: 'ন্যূনতম মান সর্বোচ্চ মানের চেয়ে বড় হতে পারে না।',
        discontinuousRange: 'নির্ধারিত পরিসর অবিচ্ছিন্ন নয়।',
        missingColorProperty: 'একটি প্রয়োজনীয় রঙের বৈশিষ্ট্য অনুপস্থিত।',
        invalidIconType: 'নির্দিষ্ট আইকন প্রকার অবৈধ বা অচেনা।',
        invalidStateContent: 'অবস্থার বিষয়বস্তু অবৈধ বা ভুলভাবে গঠিত।',
        invalidStateContentEntry: 'অবস্থার বিষয়বস্তুতে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidTheme: 'নির্দিষ্ট থিম অজানা। ডিফল্ট থিম ব্যবহার করা হবে।',
        appliedDefaultValue: 'একটি ডিফল্ট মান স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়েছে।',
      },
    },
    editor: {
      title: {
        content: 'বিষয়বস্তু',
        interaction: 'মিথস্ক্রিয়া',
        theme: 'চেহারা এবং অনুভূতি',
      },
      field: {
        entity: 'সত্তা',
        attribute: 'বৈশিষ্ট্য',
        name: 'নাম',
        unit: 'একক',
        decimal: 'দশমিক',
        min_value: 'ন্যূনতম মান',
        max_value: 'সর্বোচ্চ মান',
        max_value_attribute: 'বৈশিষ্ট্য (max_value)',
        tap_action: 'ট্যাপ আচরণ',
        double_tap_action: 'ডাবল ট্যাপ আচরণ',
        hold_action: 'হোল্ড আচরণ',
        icon_tap_action: 'আইকন ট্যাপ আচরণ',
        icon_double_tap_action: 'আইকন ডাবল ট্যাপ আচরণ',
        icon_hold_action: 'আইকন হোল্ড আচরণ',
        toggle_icon: 'আইকন',
        toggle_name: 'নাম',
        toggle_value: 'মান',
        toggle_unit: 'একক',
        toggle_secondary_info: 'তথ্য',
        toggle_progress_bar: 'বার',
        toggle_force_circular_background: 'বৃত্তাকার পটভূমি জোর করুন',
        theme: 'থিম',
        bar_size: 'বারের আকার',
        bar_color: 'বারের রঙ',
        icon: 'আইকন',
        color: 'প্রাথমিক রঙ',
        layout: 'কার্ড লেআউট',
      },
      option: {
        theme: {
          optimal_when_low: 'কম হলে সর্বোত্তম (CPU, RAM,...)',
          optimal_when_high: 'বেশি হলে সর্বোত্তম (ব্যাটারি...)',
          light: 'আলো',
          temperature: 'তাপমাত্রা',
          humidity: 'আর্দ্রতা',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'ছোট',
          medium: 'মাঝারি',
          large: 'বড়',
          xlarge: 'অতিরিক্ত বড়',
        },
        layout: {
          horizontal: 'অনুভূমিক (ডিফল্ট)',
          vertical: 'উল্লম্ব',
        },
      },
    },
  },
  cs: {
    card: {
      msg: {
        entityNotFound: 'Entita nebyla nalezena v HA.',
        attributeNotFound: 'Atribut nebyl nalezen v HA.',
        missingRequiredProperty: 'Chybí povinná vlastnost.',
        invalidTypeString: 'Očekávána hodnota typu řetězec.',
        invalidTypeNumber: 'Očekávána hodnota typu číslo.',
        invalidTypeBoolean: 'Očekávána hodnota typu boolean.',
        invalidTypeArray: 'Očekávána hodnota typu pole.',
        invalidTypeObject: 'Očekávána hodnota typu objekt.',
        invalidEnumValue: 'Poskytnutá hodnota není jednou z povolených možností.',
        invalidUnionType: 'Hodnota neodpovídá žádnému z povolených typů.',
        invalidEntityId: 'ID entity je neplatné nebo špatně formátované.',
        invalidDecimal: 'Hodnota musí být platné desítkové číslo.',
        invalidActionObject: 'Objekt akce je neplatný nebo špatně strukturovaný.',
        missingActionKey: 'V objektu akce chybí požadovaný klíč.',
        invalidCustomThemeArray: 'Vlastní motiv musí být pole.',
        invalidCustomThemeEntry: 'Jedna nebo více položek ve vlastním motivu je neplatných.',
        invalidMinValue: 'Minimální hodnota je neplatná nebo pod povolenými limity.',
        invalidMaxValue: 'Maximální hodnota je neplatná nebo nad povolenými limity.',
        minGreaterThanMax: 'Minimální hodnota nemůže být větší než maximální hodnota.',
        discontinuousRange: 'Definovaný rozsah je nespojitý.',
        missingColorProperty: 'Chybí povinná vlastnost barvy.',
        invalidIconType: 'Zadaný typ ikony je neplatný nebo nerozpoznaný.',
        invalidStateContent: 'Obsah stavu je neplatný nebo špatně formátovaný.',
        invalidStateContentEntry: 'Jedna nebo více položek v obsahu stavu je neplatných.',
        invalidTheme: 'Zadaný motiv je neznámý. Bude použit výchozí motiv.',
        appliedDefaultValue: 'Výchozí hodnota byla automaticky aplikována.',
      },
    },
    editor: {
      title: {
        content: 'Obsah',
        interaction: 'Interakce',
        theme: 'Vzhled a pocit',
      },
      field: {
        entity: 'Entita',
        attribute: 'Atribut',
        name: 'Název',
        unit: 'Jednotka',
        decimal: 'desetinný',
        min_value: 'Minimální hodnota',
        max_value: 'Maximální hodnota',
        max_value_attribute: 'Atribut (max_value)',
        tap_action: 'Chování při klepnutí',
        double_tap_action: 'Chování při dvojitém klepnutí',
        hold_action: 'Chování při podržení',
        icon_tap_action: 'Chování při klepnutí na ikonu',
        icon_double_tap_action: 'Chování při dvojitém klepnutí na ikonu',
        icon_hold_action: 'Chování při podržení ikony',
        toggle_icon: 'Ikona',
        toggle_name: 'Název',
        toggle_value: 'Hodnota',
        toggle_unit: 'Jednotka',
        toggle_secondary_info: 'Informace',
        toggle_progress_bar: 'Lišta',
        toggle_force_circular_background: 'Vynutit kruhové pozadí',
        theme: 'Motiv',
        bar_size: 'Velikost lišty',
        bar_color: 'Barva lišty',
        icon: 'Ikona',
        color: 'Hlavní barva',
        layout: 'Rozložení karty',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimální při nízkých hodnotách (CPU, RAM,...)',
          optimal_when_high: 'Optimální při vysokých hodnotách (Baterie...)',
          light: 'Světlo',
          temperature: 'Teplota',
          humidity: 'Vlhkost',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Malá',
          medium: 'Střední',
          large: 'Velká',
          xlarge: 'Extra velká',
        },
        layout: {
          horizontal: 'Horizontální (výchozí)',
          vertical: 'Vertikální',
        },
      },
    },
  },
  da: {
    card: {
      msg: {
        entityNotFound: 'Enheden blev ikke fundet i Home Assistant.',
        attributeNotFound: 'Egenskab blev ikke fundet i Home Assistant.',
        missingRequiredProperty: 'En påkrævet egenskab mangler.',
        invalidTypeString: 'Forventede en strengværdi.',
        invalidTypeNumber: 'Forventede en numerisk værdi.',
        invalidTypeBoolean: 'Forventede en boolesk værdi.',
        invalidTypeArray: 'Forventede en array-værdi.',
        invalidTypeObject: 'Forventede en objektværdi.',
        invalidEnumValue: 'Den angivne værdi er ikke en tilladt mulighed.',
        invalidUnionType: 'Værdien matcher ingen af de tilladte typer.',
        invalidEntityId: 'Enheds-ID er ugyldigt eller forkert formateret.',
        invalidDecimal: 'Værdien skal være et gyldigt decimaltal.',
        invalidActionObject: 'Handlingsobjektet er ugyldigt eller forkert struktureret.',
        missingActionKey: 'En påkrævet nøgle mangler i handlingsobjektet.',
        invalidCustomThemeArray: 'Det brugerdefinerede tema skal være en array.',
        invalidCustomThemeEntry: 'En eller flere indgange i det brugerdefinerede tema er ugyldige.',
        invalidMinValue: 'Mindsteværdi er ugyldig eller under den tilladte grænse.',
        invalidMaxValue: 'Maksimumværdi er ugyldig eller overstiger den tilladte grænse.',
        minGreaterThanMax: 'Mindsteværdi kan ikke være større end maksimumværdi.',
        discontinuousRange: 'Det definerede interval er usammenhængende.',
        missingColorProperty: 'En påkrævet farveegenskab mangler.',
        invalidIconType: 'Den angivne ikontype er ugyldig eller ukendt.',
        invalidStateContent: 'Tilstandsindholdet er ugyldigt eller fejlbehæftet.',
        invalidStateContentEntry: 'En eller flere poster i tilstandsindholdet er ugyldige.',
        invalidTheme: 'Det angivne tema er ukendt. Standardtema anvendes.',
        appliedDefaultValue: 'Standardværdi er blevet anvendt automatisk.',
      },
    },
    editor: {
      title: {
        content: 'Indhold',
        interaction: 'Interaktioner',
        theme: 'Udseende og funktionalitet',
      },
      field: {
        entity: 'Enhed',
        attribute: 'Attribut',
        name: 'Navn',
        unit: 'Enhed',
        decimal: 'decimal',
        min_value: 'Minimumsværdi',
        max_value: 'Maksimal værdi',
        max_value_attribute: 'Attribut (max_value)',
        tap_action: 'Handling ved kort tryk',
        double_tap_action: 'Handling ved dobbelt tryk',
        hold_action: 'Handling ved langt tryk',
        icon_tap_action: 'Handling ved tryk på ikonet',
        icon_double_tap_action: 'Handling ved dobbelt tryk på ikonet',
        icon_hold_action: 'Handling ved langt tryk på ikonet',
        toggle_icon: 'Ikon',
        toggle_name: 'Navn',
        toggle_value: 'Værdi',
        toggle_unit: 'Enhed',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bar',
        toggle_force_circular_background: 'Tving cirkulær baggrund',
        theme: 'Tema',
        bar_size: 'Bar størrelse',
        bar_color: 'Farve til bar',
        icon: 'Ikon',
        color: 'Primær farve',
        layout: 'Kort layout',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          optimal_when_high: 'Optimal når højt (Batteri...)',
          light: 'Lys',
          temperature: 'Temperatur',
          humidity: 'Fugtighed',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Lille',
          medium: 'Medium',
          large: 'Stor',
          xlarge: 'Ekstra stor',
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal',
        },
      },
    },
  },
  de: {
    card: {
      msg: {
        entityNotFound: 'Entität in Home Assistant nicht gefunden.',
        attributeNotFound: 'Attribut in Home Assistant nicht gefunden.',
        missingRequiredProperty: 'Eine erforderliche Eigenschaft fehlt.',
        invalidTypeString: 'Ein Wert vom Typ Zeichenkette wurde erwartet.',
        invalidTypeNumber: 'Ein Wert vom Typ Zahl wurde erwartet.',
        invalidTypeBoolean: 'Ein Wert vom Typ Boolesch wurde erwartet.',
        invalidTypeArray: 'Ein Wert vom Typ Array wurde erwartet.',
        invalidTypeObject: 'Ein Wert vom Typ Objekt wurde erwartet.',
        invalidEnumValue: 'Der angegebene Wert gehört nicht zu den erlaubten Optionen.',
        invalidUnionType: 'Der Wert entspricht keinem der erlaubten Typen.',
        invalidEntityId: 'Die Entity-ID ist ungültig oder fehlerhaft.',
        invalidDecimal: 'Der Wert muss eine gültige Dezimalzahl sein.',
        invalidActionObject: 'Das Aktionsobjekt ist ungültig oder falsch strukturiert.',
        missingActionKey: 'Ein erforderlicher Schlüssel fehlt im Aktionsobjekt.',
        invalidCustomThemeArray: 'Das benutzerdefinierte Theme muss ein Array sein.',
        invalidCustomThemeEntry: 'Eine oder mehrere Einträge im benutzerdefinierten Theme sind ungültig.',
        invalidMinValue: 'Der Minimalwert ist ungültig oder liegt unterhalb des erlaubten Bereichs.',
        invalidMaxValue: 'Der Maximalwert ist ungültig oder überschreitet den erlaubten Bereich.',
        minGreaterThanMax: 'Der Minimalwert darf nicht größer als der Maximalwert sein.',
        discontinuousRange: 'Der definierte Bereich ist nicht kontinuierlich.',
        missingColorProperty: 'Eine erforderliche Farbeigenschaft fehlt.',
        invalidIconType: 'Der angegebene Symboltyp ist ungültig oder nicht erkannt.',
        invalidStateContent: 'Der Statusinhalt ist ungültig oder fehlerhaft.',
        invalidStateContentEntry: 'Ein oder mehrere Einträge im Statusinhalt sind ungültig.',
        invalidTheme: 'Das angegebene Theme ist unbekannt. Das Standard-Theme wird verwendet.',
        appliedDefaultValue: 'Ein Standardwert wurde automatisch angewendet.',
      },
    },
    editor: {
      title: {
        content: 'Inhalt',
        interaction: 'Interaktionen',
        theme: 'Aussehen und Bedienung',
      },
      field: {
        entity: 'Entität',
        attribute: 'Attribut',
        name: 'Name',
        unit: 'Einheit',
        decimal: 'dezimal',
        min_value: 'Mindestwert',
        max_value: 'Höchstwert',
        max_value_attribute: 'Attribut (max_value)',
        tap_action: 'Aktion bei kurzem Tippen',
        double_tap_action: 'Aktion bei doppelt Tippen',
        hold_action: 'Aktion bei langem Tippen',
        icon_tap_action: 'Aktion beim Tippen auf das Symbol',
        icon_double_tap_action: 'Aktion bei doppelt Tippen auf das Symbol',
        icon_hold_action: 'Aktion bei langem Tippen auf das Symbol',
        toggle_icon: 'Icon',
        toggle_name: 'Name',
        toggle_value: 'Wert',
        toggle_unit: 'Einheit',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Balken',
        toggle_force_circular_background: 'Kreisförmigen Hintergrund erzwingen',
        theme: 'Thema',
        bar_size: 'Größe der Bar',
        bar_color: 'Farbe für die Leiste',
        icon: 'Symbol',
        color: 'Primärfarbe',
        layout: 'Kartenlayout',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal bei niedrig (CPU, RAM,...)',
          optimal_when_high: 'Optimal bei hoch (Batterie...)',
          light: 'Licht',
          temperature: 'Temperatur',
          humidity: 'Feuchtigkeit',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Klein',
          medium: 'Mittel',
          large: 'Groß',
          xlarge: 'Extra groß',
        },
        layout: {
          horizontal: 'Horizontal (Standard)',
          vertical: 'Vertikal',
        },
      },
    },
  },
  el: {
    card: {
      msg: {
        entityNotFound: 'Η οντότητα δεν βρέθηκε στο Home Assistant.',
        attributeNotFound: 'Το χαρακτηριστικό δεν βρέθηκε στο Home Assistant.',
        missingRequiredProperty: 'Λείπει μια απαιτούμενη ιδιότητα.',
        invalidTypeString: 'Αναμενόταν τιμή τύπου συμβολοσειράς.',
        invalidTypeNumber: 'Αναμενόταν τιμή τύπου αριθμού.',
        invalidTypeBoolean: 'Αναμενόταν τιμή τύπου boolean.',
        invalidTypeArray: 'Αναμενόταν τιμή τύπου πίνακα.',
        invalidTypeObject: 'Αναμενόταν τιμή τύπου αντικειμένου.',
        invalidEnumValue: 'Η παρεχόμενη τιμή δεν είναι αποδεκτή επιλογή.',
        invalidUnionType: 'Η τιμή δεν ταιριάζει σε κανέναν από τους επιτρεπόμενους τύπους.',
        invalidEntityId: 'Το αναγνωριστικό οντότητας δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidDecimal: 'Η τιμή πρέπει να είναι έγκυρος δεκαδικός αριθμός.',
        invalidActionObject: 'Το αντικείμενο ενέργειας δεν είναι έγκυρο ή είναι κακώς δομημένο.',
        missingActionKey: 'Λείπει απαιτούμενο κλειδί στο αντικείμενο ενέργειας.',
        invalidCustomThemeArray: 'Το προσαρμοσμένο θέμα πρέπει να είναι πίνακας.',
        invalidCustomThemeEntry: 'Μία ή περισσότερες καταχωρήσεις στο προσαρμοσμένο θέμα δεν είναι έγκυρες.',
        invalidMinValue: 'Η ελάχιστη τιμή δεν είναι έγκυρη ή είναι εκτός επιτρεπόμενων ορίων.',
        invalidMaxValue: 'Η μέγιστη τιμή δεν είναι έγκυρη ή ξεπερνά τα όρια.',
        minGreaterThanMax: 'Η ελάχιστη τιμή δεν μπορεί να είναι μεγαλύτερη από τη μέγιστη.',
        discontinuousRange: 'Το καθορισμένο εύρος δεν είναι συνεχές.',
        missingColorProperty: 'Λείπει απαιτούμενη ιδιότητα χρώματος.',
        invalidIconType: 'Ο καθορισμένος τύπος εικονιδίου δεν είναι έγκυρος ή αναγνωρίσιμος.',
        invalidStateContent: 'Το περιεχόμενο κατάστασης δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidStateContentEntry: 'Μία ή περισσότερες καταχωρήσεις στο περιεχόμενο κατάστασης είναι άκυρες.',
        invalidTheme: 'Το καθορισμένο θέμα είναι άγνωστο. Θα χρησιμοποιηθεί το προεπιλεγμένο θέμα.',
        appliedDefaultValue: 'Εφαρμόστηκε αυτόματα προεπιλεγμένη τιμή.',
      },
    },
    editor: {
      title: {
        content: 'Περιεχόμενο',
        interaction: 'Αλληλεπιδράσεις',
        theme: 'Εμφάνιση',
      },
      field: {
        entity: 'Οντότητα',
        attribute: 'Χαρακτηριστικό',
        name: 'Όνομα',
        unit: 'Μονάδα',
        decimal: 'δεκαδικά',
        min_value: 'Ελάχιστη τιμή',
        max_value: 'Μέγιστη τιμή',
        max_value_attribute: 'Χαρακτηριστικό (max_value)',
        tap_action: 'Ενέργεια κατά το σύντομο πάτημα',
        double_tap_action: 'Ενέργεια κατά το διπλό πάτημα',
        hold_action: 'Ενέργεια κατά το παρατεταμένο πάτημα',
        icon_tap_action: 'Ενέργεια στο πάτημα του εικονιδίου',
        icon_double_tap_action: 'Ενέργεια στο διπλό πάτημα του εικονιδίου',
        icon_hold_action: 'Ενέργεια στο παρατεταμένο πάτημα του εικονιδίου',
        toggle_icon: 'Εικονίδιο',
        toggle_name: 'Όνομα',
        toggle_value: 'Τιμή',
        toggle_unit: 'Μονάδα',
        toggle_secondary_info: 'Πληροφορίες',
        toggle_progress_bar: 'Γραμμή',
        toggle_force_circular_background: 'Εξαναγκασμός κυκλικού φόντου',
        theme: 'Θέμα',
        bar_size: 'Μέγεθος γραμμής',
        bar_color: 'Χρώμα γραμμής',
        icon: 'Εικονίδιο',
        color: 'Κύριο χρώμα',
        layout: 'Διάταξη κάρτας',
      },
      option: {
        theme: {
          optimal_when_low: 'Βέλτιστο όταν είναι χαμηλό (CPU, RAM...)',
          optimal_when_high: 'Βέλτιστο όταν είναι υψηλό (Μπαταρία...)',
          light: 'Φωτεινότητα',
          temperature: 'Θερμοκρασία',
          humidity: 'Υγρασία',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Μικρή',
          medium: 'Μεσαία',
          large: 'Μεγάλη',
          xlarge: 'Πολύ μεγάλη',
        },
        layout: {
          horizontal: 'Οριζόντια (προεπιλογή)',
          vertical: 'Κατακόρυφη',
        },
      },
    },
  },
  en: {
    card: {
      msg: {
        entityNotFound: 'Entity not found in HA.',
        attributeNotFound: 'Attribute not found in HA.',
        missingRequiredProperty: 'Required property is missing.',
        invalidTypeString: 'Expected a value of type string.',
        invalidTypeNumber: 'Expected a value of type number.',
        invalidTypeBoolean: 'Expected a value of type boolean.',
        invalidTypeArray: 'Expected a value of type array.',
        invalidTypeObject: 'Expected a value of type object.',
        invalidEnumValue: 'The provided value is not one of the allowed options.',
        invalidUnionType: 'The value does not match any of the allowed types.',
        invalidEntityId: 'The entity ID is invalid or malformed.',
        invalidDecimal: 'The value must be a valid decimal number.',
        invalidActionObject: 'The action object is invalid or improperly structured.',
        missingActionKey: 'A required key is missing in the action object.',
        invalidCustomThemeArray: 'The custom theme must be an array.',
        invalidCustomThemeEntry: 'One or more entries in the custom theme are invalid.',
        invalidMinValue: 'The minimum value is invalid or below allowed limits.',
        invalidMaxValue: 'The maximum value is invalid or above allowed limits.',
        minGreaterThanMax: 'Minimum value cannot be greater than maximum value.',
        discontinuousRange: 'The defined range is discontinuous.',
        missingColorProperty: 'A required color property is missing.',
        invalidIconType: 'The specified icon type is invalid or unrecognized.',
        invalidStateContent: 'The state content is invalid or malformed.',
        invalidStateContentEntry: 'One or more entries in the state content are invalid.',
        invalidTheme: 'The specified theme is unknown. Default theme will be used.',
        appliedDefaultValue: 'A default value has been applied automatically.',
      },
    },
    editor: {
      title: {
        content: 'Content',
        interaction: 'Interactions',
        theme: 'Look & Feel',
      },
      field: {
        entity: 'Entity',
        attribute: 'Attribute',
        name: 'Name',
        unit: 'Unit',
        decimal: 'decimal',
        min_value: 'Minimum value',
        max_value: 'Maximum value',
        max_value_attribute: 'Attribute (max_value)',
        tap_action: 'Tap behavior',
        double_tap_action: 'Double tap behavior',
        hold_action: 'Hold behavior',
        icon_tap_action: 'Icon tap behavior',
        icon_double_tap_action: 'Icon double tap behavior',
        icon_hold_action: 'Icon hold behavior',
        toggle_icon: 'Icon',
        toggle_name: 'Name',
        toggle_value: 'Value',
        toggle_unit: 'Unit',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bar',
        toggle_force_circular_background: 'Force circular background',
        theme: 'Theme',
        bar_size: 'Bar size',
        bar_color: 'Color for the bar',
        icon: 'Icon',
        color: 'Primary color',
        layout: 'Card layout',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal when Low (CPU, RAM,...)',
          optimal_when_high: 'Optimal when High (Battery...)',
          light: 'Light',
          temperature: 'Temperature',
          humidity: 'Humidity',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          xlarge: 'Extra Large',
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertical',
        },
      },
    },
  },
  es: {
    card: {
      msg: {
        entityNotFound: 'Entidad no encontrada en Home Assistant.',
        attributeNotFound: 'Atributo no encontrado en Home Assistant.',
        missingRequiredProperty: 'Falta una propiedad obligatoria.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidTypeNumber: 'Se esperaba un valor de tipo número.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidEnumValue: 'El valor proporcionado no es una opción válida.',
        invalidUnionType: 'El valor no coincide con ninguno de los tipos permitidos.',
        invalidEntityId: 'El ID de la entidad no es válido o está mal formado.',
        invalidDecimal: 'El valor debe ser un número decimal válido.',
        invalidActionObject: 'El objeto de acción es inválido o está mal estructurado.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        invalidCustomThemeArray: 'El tema personalizado debe ser un arreglo.',
        invalidCustomThemeEntry: 'Una o más entradas en el tema personalizado son inválidas.',
        invalidMinValue: 'El valor mínimo es inválido o está por debajo del límite permitido.',
        invalidMaxValue: 'El valor máximo es inválido o excede el límite permitido.',
        minGreaterThanMax: 'El valor mínimo no puede ser mayor que el valor máximo.',
        discontinuousRange: 'El rango definido es discontinuo.',
        missingColorProperty: 'Falta una propiedad de color obligatoria.',
        invalidIconType: 'El tipo de icono especificado es inválido o no reconocido.',
        invalidStateContent: 'El contenido del estado es inválido o está mal formado.',
        invalidStateContentEntry: 'Una o más entradas en el contenido del estado son inválidas.',
        invalidTheme: 'El tema especificado es desconocido. Se usará el tema por defecto.',
        appliedDefaultValue: 'Se ha aplicado un valor predeterminado automáticamente.',
      },
    },
    editor: {
      title: {
        content: 'Contenido',
        interaction: 'Interacciones',
        theme: 'Apariencia y funcionamiento',
      },
      field: {
        entity: 'Entidad',
        attribute: 'Atributo',
        name: 'Nombre',
        unit: 'Unidad',
        decimal: 'decimal',
        min_value: 'Valor mínimo',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        tap_action: 'Acción al pulsar brevemente',
        double_tap_action: 'Acción al pulsar dos veces',
        hold_action: 'Acción al mantener pulsado',
        icon_tap_action: 'Acción al pulsar el icono',
        icon_double_tap_action: 'Acción al pulsar dos veces el icono',
        icon_hold_action: 'Acción al mantener pulsado el icono',
        toggle_icon: 'Icono',
        toggle_name: 'Nombre',
        toggle_value: 'Valor',
        toggle_unit: 'Unidad',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Barra',
        toggle_force_circular_background: 'Forzar fondo circular',
        theme: 'Tema',
        bar_size: 'Tamaño de la barra',
        bar_color: 'Color de la barra',
        icon: 'Icono',
        color: 'Color del icono',
        layout: 'Disposición de la tarjeta',
      },
      option: {
        theme: {
          optimal_when_low: 'Óptimo cuando es bajo (CPU, RAM,...)',
          optimal_when_high: 'Óptimo cuando es alto (Batería...)',
          light: 'Luz',
          temperature: 'Temperatura',
          humidity: 'Humedad',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Pequeña',
          medium: 'Mediana',
          large: 'Grande',
          xlarge: 'Extra grande',
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical',
        },
      },
    },
  },
  fi: {
    card: {
      msg: {
        entityNotFound: 'Entiteettiä ei löytynyt Home Assistantista.',
        attributeNotFound: 'Attribuuttia ei löytynyt Home Assistantista.',
        missingRequiredProperty: 'Pakollinen ominaisuus puuttuu.',
        invalidTypeString: 'Odotettiin merkkijonotyyppistä arvoa.',
        invalidTypeNumber: 'Odotettiin numeerista arvoa.',
        invalidTypeBoolean: 'Odotettiin totuusarvoa (boolean).',
        invalidTypeArray: 'Odotettiin taulukkoarvoa.',
        invalidTypeObject: 'Odotettiin objektityyppistä arvoa.',
        invalidEnumValue: 'Annettu arvo ei ole sallituista vaihtoehdoista.',
        invalidUnionType: 'Arvo ei vastaa mitään sallituista tyypeistä.',
        invalidEntityId: 'Entiteetin tunniste on virheellinen tai väärin muotoiltu.',
        invalidDecimal: 'Arvon on oltava kelvollinen desimaaliluku.',
        invalidActionObject: 'Toiminto-objekti on virheellinen tai huonosti rakennettu.',
        missingActionKey: 'Toiminto-objektista puuttuu vaadittu avain.',
        invalidCustomThemeArray: 'Mukautetun teeman on oltava taulukko.',
        invalidCustomThemeEntry: 'Yksi tai useampi mukautetun teeman merkintä on virheellinen.',
        invalidMinValue: 'Vähimmäisarvo on virheellinen tai liian pieni.',
        invalidMaxValue: 'Enimmäisarvo on virheellinen tai liian suuri.',
        minGreaterThanMax: 'Vähimmäisarvo ei voi olla suurempi kuin enimmäisarvo.',
        discontinuousRange: 'Määritetty alue on katkonainen.',
        missingColorProperty: 'Pakollinen väriominaisuus puuttuu.',
        invalidIconType: 'Annettu kuvaketyyppi on virheellinen tai tuntematon.',
        invalidStateContent: 'Tilasisältö on virheellinen tai väärässä muodossa.',
        invalidStateContentEntry: 'Yksi tai useampi tilasisällön merkintä on virheellinen.',
        invalidTheme: 'Määritetty teema on tuntematon. Käytetään oletusteemaa.',
        appliedDefaultValue: 'Oletusarvo on asetettu automaattisesti.',
      },
    },
    editor: {
      title: {
        content: 'Sisältö',
        interaction: 'Vuorovaikutukset',
        theme: 'Ulkoasu',
      },
      field: {
        entity: 'Entiteetti',
        attribute: 'Attribuutti',
        name: 'Nimi',
        unit: 'Yksikkö',
        decimal: 'desimaali',
        min_value: 'Minimiarvo',
        max_value: 'Maksimiarvo',
        max_value_attribute: 'Attribuutti (max_value)',
        tap_action: 'Toiminto lyhyellä napautuksella',
        double_tap_action: 'Toiminto kahdella napautuksella',
        hold_action: 'Toiminto pitkällä painalluksella',
        icon_tap_action: 'Toiminto kuvaketta napautettaessa',
        icon_double_tap_action: 'Toiminto kahdella napautuksella kuvaketta',
        icon_hold_action: 'Toiminto pitkällä painalluksella kuvaketta',
        toggle_icon: 'Ikoni',
        toggle_name: 'Nimi',
        toggle_value: 'Arvo',
        toggle_unit: 'Yksikkö',
        toggle_secondary_info: 'Tiedot',
        toggle_progress_bar: 'Palkki',
        toggle_force_circular_background: 'Pakota pyöreä tausta',
        theme: 'Teema',
        bar_size: 'Palkin koko',
        bar_color: 'Palkin väri',
        icon: 'Ikoni',
        color: 'Pääväri',
        layout: 'Kortin asettelu',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaalinen alhaisena (CPU, RAM...)',
          optimal_when_high: 'Optimaalinen korkeana (Akku...)',
          light: 'Valoisuus',
          temperature: 'Lämpötila',
          humidity: 'Kosteus',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Pieni',
          medium: 'Keski',
          large: 'Suuri',
          xlarge: 'Erittäin suuri',
        },
        layout: {
          horizontal: 'Vaakasuora (oletus)',
          vertical: 'Pystysuora',
        },
      },
    },
  },
  fr: {
    card: {
      msg: {
        entityNotFound: 'Entité introuvable dans Home Assistant.',
        attributeNotFound: 'Attribut introuvable dans Home Assistant.',
        missingRequiredProperty: 'Une propriété requise est manquante.',
        invalidTypeString: 'Une valeur de type chaîne de caractères était attendue.',
        invalidTypeNumber: 'Une valeur de type nombre était attendue.',
        invalidTypeBoolean: 'Une valeur de type booléen était attendue.',
        invalidTypeArray: 'Une valeur de type tableau était attendue.',
        invalidTypeObject: 'Une valeur de type objet était attendue.',
        invalidEnumValue: 'La valeur fournie ne fait pas partie des options autorisées.',
        invalidUnionType: 'La valeur ne correspond à aucun des types autorisés.',
        invalidEntityId: 'L’identifiant de l’entité est invalide ou mal formé.',
        invalidDecimal: 'La valeur doit être un nombre entier positif.',
        invalidActionObject: 'L’objet action est invalide ou mal structuré.',
        missingActionKey: 'Une clé requise est manquante dans l’objet action.',
        invalidCustomThemeArray: 'Le thème personnalisé doit être un tableau.',
        invalidCustomThemeEntry: 'Une ou plusieurs entrées du thème personnalisé sont invalides.',
        invalidMinValue: 'La valeur minimale est invalide ou en dessous des limites autorisées.',
        invalidMaxValue: 'La valeur maximale est invalide ou au-dessus des limites autorisées.',
        minGreaterThanMax: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
        discontinuousRange: 'L’intervalle défini est discontinu.',
        missingColorProperty: 'Une propriété de couleur requise est manquante.',
        invalidIconType: 'Le type d’icône spécifié est invalide ou non reconnu.',
        invalidStateContent: 'Le contenu d’état est invalide ou mal formé.',
        invalidStateContentEntry: 'Une ou plusieurs entrées du contenu d’état sont invalides.',
        invalidTheme: 'Le thème spécifié est inconnu. Le thème par défaut sera utilisé.',
        appliedDefaultValue: 'Une valeur par défaut a été appliquée automatiquement.',
      },
    },
    editor: {
      title: {
        content: 'Contenu',
        interaction: 'Interactions',
        theme: 'Aspect visuel et convivialité',
      },
      field: {
        entity: 'Entité',
        attribute: 'Attribut',
        name: 'Nom',
        unit: 'Unité',
        decimal: 'décimal',
        min_value: 'Valeur minimum',
        max_value: 'Valeur maximum',
        max_value_attribute: 'Attribut (max_value)',
        tap_action: "Comportement lors d'un appui court",
        double_tap_action: "Comportement lors d'un double appui",
        hold_action: "Comportement lors d'un appui long",
        icon_tap_action: "Comportement lors de l'appui sur l'icône",
        icon_double_tap_action: "Comportement lors d'un double appui sur l'icône",
        icon_hold_action: "Comportement lors d'un appui long sur l'icône",
        toggle_icon: 'Icône',
        toggle_name: 'Nom',
        toggle_value: 'Valeur',
        toggle_unit: 'Unité',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Barre',
        toggle_force_circular_background: 'Forcer le fond circulaire',
        theme: 'Thème',
        bar_size: 'Taille de la barre',
        bar_color: 'Couleur de la barre',
        icon: 'Icône',
        color: "Couleur de l'icône",
        layout: 'Disposition de la carte',
      },
      option: {
        theme: {
          optimal_when_low: "Optimal quand c'est bas (CPU, RAM,...)",
          optimal_when_high: "Optimal quand c'est élevé (Batterie...)",
          light: 'Lumière',
          temperature: 'Température',
          humidity: 'Humidité',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Petite',
          medium: 'Moyenne',
          large: 'Grande',
          xlarge: 'Très grande',
        },
        layout: {
          horizontal: 'Horizontal (par défaut)',
          vertical: 'Vertical',
        },
      },
    },
  },
  hi: {
    card: {
      msg: {
        entityNotFound: 'HA में एंटिटी नहीं मिली।',
        attributeNotFound: 'HA में एट्रिब्यूट नहीं मिला।',
        missingRequiredProperty: 'आवश्यक गुण गायब है।',
        invalidTypeString: 'स्ट्रिंग प्रकार का मान अपेक्षित है।',
        invalidTypeNumber: 'संख्या प्रकार का मान अपेक्षित है।',
        invalidTypeBoolean: 'बूलियन प्रकार का मान अपेक्षित है।',
        invalidTypeArray: 'एरे प्रकार का मान अपेक्षित है।',
        invalidTypeObject: 'ऑब्जेक्ट प्रकार का मान अपेक्षित है।',
        invalidEnumValue: 'प्रदान किया गया मान अनुमतित विकल्पों में से एक नहीं है।',
        invalidUnionType: 'मान अनुमतित प्रकारों में से किसी से मेल नहीं खाता।',
        invalidEntityId: 'एंटिटी आईडी अमान्य या गलत तरीके से बनाई गई है।',
        invalidDecimal: 'मान एक वैध दशमलव संख्या होना चाहिए।',
        invalidActionObject: 'एक्शन ऑब्जेक्ट अमान्य या गलत तरीके से संरचित है।',
        missingActionKey: 'एक्शन ऑब्जेक्ट में एक आवश्यक कुंजी गायब है।',
        invalidCustomThemeArray: 'कस्टम थीम एक एरे होना चाहिए।',
        invalidCustomThemeEntry: 'कस्टम थीम में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidMinValue: 'न्यूनतम मान अमान्य है या अनुमतित सीमा से नीचे है।',
        invalidMaxValue: 'अधिकतम मान अमान्य है या अनुमतित सीमा से ऊपर है।',
        minGreaterThanMax: 'न्यूनतम मान अधिकतम मान से अधिक नहीं हो सकता।',
        discontinuousRange: 'परिभाषित रेंज असतत है।',
        missingColorProperty: 'एक आवश्यक रंग गुण गायब है।',
        invalidIconType: 'निर्दिष्ट आइकन प्रकार अमान्य या अपरिचित है।',
        invalidStateContent: 'स्थिति सामग्री अमान्य या गलत तरीके से बनाई गई है।',
        invalidStateContentEntry: 'स्थिति सामग्री में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidTheme: 'निर्दिष्ट थीम अज्ञात है। डिफ़ॉल्ट थीम का उपयोग किया जाएगा।',
        appliedDefaultValue: 'एक डिफ़ॉल्ट मान स्वचालित रूप से लागू किया गया है।',
      },
    },
    editor: {
      title: {
        content: 'सामग्री',
        interaction: 'बातचीत',
        theme: 'रूप और अनुभव',
      },
      field: {
        entity: 'एंटिटी',
        attribute: 'एट्रिब्यूट',
        name: 'नाम',
        unit: 'इकाई',
        decimal: 'दशमलव',
        min_value: 'न्यूनतम मान',
        max_value: 'अधिकतम मान',
        max_value_attribute: 'एट्रिब्यूट (max_value)',
        tap_action: 'टैप व्यवहार',
        double_tap_action: 'डबल टैप व्यवहार',
        hold_action: 'होल्ड व्यवहार',
        icon_tap_action: 'आइकन टैप व्यवहार',
        icon_double_tap_action: 'आइकन डबल टैप व्यवहार',
        icon_hold_action: 'आइकन होल्ड व्यवहार',
        toggle_icon: 'आइकन',
        toggle_name: 'नाम',
        toggle_value: 'मान',
        toggle_unit: 'इकाई',
        toggle_secondary_info: 'जानकारी',
        toggle_progress_bar: 'बार',
        toggle_force_circular_background: 'गोलाकार पृष्ठभूमि को बाध्य करें',
        theme: 'थीम',
        bar_size: 'बार का आकार',
        bar_color: 'बार का रंग',
        icon: 'आइकन',
        color: 'मुख्य रंग',
        layout: 'कार्ड लेआउट',
      },
      option: {
        theme: {
          optimal_when_low: 'कम होने पर इष्टतम (CPU, RAM,...)',
          optimal_when_high: 'उच्च होने पर इष्टतम (बैटरी...)',
          light: 'प्रकाश',
          temperature: 'तापमान',
          humidity: 'आर्द्रता',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'छोटी',
          medium: 'मध्यम',
          large: 'बड़ी',
          xlarge: 'अतिरिक्त बड़ी',
        },
        layout: {
          horizontal: 'क्षैतिज (डिफ़ॉल्ट)',
          vertical: 'लंबवत',
        },
      },
    },
  },
  hr: {
    card: {
      msg: {
        entityNotFound: 'Entitet nije pronađen u Home Assistantu.',
        attributeNotFound: 'Atribut nije pronađen u Home Assistantu.',
        missingRequiredProperty: 'Nedostaje obavezno svojstvo.',
        invalidTypeString: 'Očekivana je vrijednost tipa string.',
        invalidTypeNumber: 'Očekivana je vrijednost tipa broj.',
        invalidTypeBoolean: 'Očekivana je vrijednost tipa boolean.',
        invalidTypeArray: 'Očekivana je vrijednost tipa polje.',
        invalidTypeObject: 'Očekivana je vrijednost tipa objekt.',
        invalidEnumValue: 'Navedena vrijednost nije među dopuštenim opcijama.',
        invalidUnionType: 'Vrijednost ne odgovara nijednom dopuštenom tipu.',
        invalidEntityId: 'ID entiteta je nevažeći ili pogrešno formatiran.',
        invalidDecimal: 'Vrijednost mora biti valjani decimalni broj.',
        invalidActionObject: 'Objekt radnje je nevažeći ili loše strukturiran.',
        missingActionKey: 'Nedostaje obavezni ključ u objektu radnje.',
        invalidCustomThemeArray: 'Prilagođena tema mora biti polje.',
        invalidCustomThemeEntry: 'Jedan ili više unosa u temi su nevažeći.',
        invalidMinValue: 'Minimalna vrijednost je nevažeća ili preniska.',
        invalidMaxValue: 'Maksimalna vrijednost je nevažeća ili previsoka.',
        minGreaterThanMax: 'Minimalna vrijednost ne može biti veća od maksimalne.',
        discontinuousRange: 'Definirani raspon nije kontinuiran.',
        missingColorProperty: 'Nedostaje obavezno svojstvo boje.',
        invalidIconType: 'Naveden tip ikone je nevažeći ili neprepoznatljiv.',
        invalidStateContent: 'Sadržaj stanja je nevažeći ili pogrešno formatiran.',
        invalidStateContentEntry: 'Jedan ili više unosa stanja su nevažeći.',
        invalidTheme: 'Navedena tema je nepoznata. Koristi se zadana tema.',
        appliedDefaultValue: 'Zadana vrijednost automatski je primijenjena.',
      },
    },
    editor: {
      title: {
        content: 'Sadržaj',
        interaction: 'Interakcije',
        theme: 'Izgled i funkcionalnost',
      },
      field: {
        entity: 'Entitet',
        attribute: 'Atribut',
        name: 'Ime',
        unit: 'Jedinica',
        decimal: 'decimalni',
        min_value: 'Minimalna vrijednost',
        max_value: 'Maksimalna vrijednost',
        max_value_attribute: 'Atribut (max_value)',
        tap_action: 'Radnja na kratki dodir',
        double_tap_action: 'Radnja na dupli dodir',
        hold_action: 'Radnja na dugi dodir',
        icon_tap_action: 'Radnja na dodir ikone',
        icon_double_tap_action: 'Radnja na dupli dodir ikone',
        icon_hold_action: 'Radnja na dugi dodir ikone',
        toggle_icon: 'Ikona',
        toggle_name: 'Ime',
        toggle_value: 'Vrijednost',
        toggle_unit: 'Jedinica',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Traka',
        toggle_force_circular_background: 'Prisili kružnu pozadinu',
        theme: 'Tema',
        bar_size: 'Veličina trake',
        bar_color: 'Boja za traku',
        icon: 'Ikona',
        color: 'Primarna boja',
        layout: 'Izgled kartice',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimalno kada je nisko (CPU, RAM,...)',
          optimal_when_high: 'Optimalno kada je visoko (Baterija...)',
          light: 'Svjetlo',
          temperature: 'Temperatura',
          humidity: 'Vlažnost',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Mala',
          medium: 'Srednja',
          large: 'Velika',
          xlarge: 'Vrlo velika',
        },
        layout: {
          horizontal: 'Horizontalno (zadano)',
          vertical: 'Vertikalno',
        },
      },
    },
  },
  id: {
    card: {
      msg: {
        entityNotFound: 'Entitas tidak ditemukan di HA.',
        attributeNotFound: 'Atribut tidak ditemukan di HA.',
        missingRequiredProperty: 'Properti yang diperlukan hilang.',
        invalidTypeString: 'Mengharapkan nilai bertipe string.',
        invalidTypeNumber: 'Mengharapkan nilai bertipe angka.',
        invalidTypeBoolean: 'Mengharapkan nilai bertipe boolean.',
        invalidTypeArray: 'Mengharapkan nilai bertipe array.',
        invalidTypeObject: 'Mengharapkan nilai bertipe object.',
        invalidEnumValue: 'Nilai yang diberikan bukan salah satu dari opsi yang diizinkan.',
        invalidUnionType: 'Nilai tidak cocok dengan tipe yang diizinkan.',
        invalidEntityId: 'ID entitas tidak valid atau salah format.',
        invalidDecimal: 'Nilai harus berupa angka desimal yang valid.',
        invalidActionObject: 'Objek aksi tidak valid atau struktur salah.',
        missingActionKey: 'Kunci yang diperlukan hilang dalam objek aksi.',
        invalidCustomThemeArray: 'Tema kustom harus berupa array.',
        invalidCustomThemeEntry: 'Satu atau lebih entri dalam tema kustom tidak valid.',
        invalidMinValue: 'Nilai minimum tidak valid atau di bawah batas yang diizinkan.',
        invalidMaxValue: 'Nilai maksimum tidak valid atau di atas batas yang diizinkan.',
        minGreaterThanMax: 'Nilai minimum tidak boleh lebih besar dari nilai maksimum.',
        discontinuousRange: 'Range yang didefinisikan tidak kontinu.',
        missingColorProperty: 'Properti warna yang diperlukan hilang.',
        invalidIconType: 'Tipe ikon yang ditentukan tidak valid atau tidak dikenali.',
        invalidStateContent: 'Konten state tidak valid atau salah format.',
        invalidStateContentEntry: 'Satu atau lebih entri dalam konten state tidak valid.',
        invalidTheme: 'Tema yang ditentukan tidak dikenal. Tema default akan digunakan.',
        appliedDefaultValue: 'Nilai default telah diterapkan secara otomatis.',
      },
    },
    editor: {
      title: {
        content: 'Konten',
        interaction: 'Interaksi',
        theme: 'Tampilan & Nuansa',
      },
      field: {
        entity: 'Entitas',
        attribute: 'Atribut',
        name: 'Nama',
        unit: 'Unit',
        decimal: 'desimal',
        min_value: 'Nilai minimum',
        max_value: 'Nilai maksimum',
        max_value_attribute: 'Atribut (max_value)',
        tap_action: 'Perilaku ketuk',
        double_tap_action: 'Perilaku ketuk ganda',
        hold_action: 'Perilaku tahan',
        icon_tap_action: 'Perilaku ketuk ikon',
        icon_double_tap_action: 'Perilaku ketuk ganda ikon',
        icon_hold_action: 'Perilaku tahan ikon',
        toggle_icon: 'Ikon',
        toggle_name: 'Nama',
        toggle_value: 'Nilai',
        toggle_unit: 'Unit',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bar',
        toggle_force_circular_background: 'Paksa latar belakang melingkar',
        theme: 'Tema',
        bar_size: 'Ukuran bar',
        bar_color: 'Warna bar',
        icon: 'Ikon',
        color: 'Warna utama',
        layout: 'Tata letak kartu',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal saat Rendah (CPU, RAM,...)',
          optimal_when_high: 'Optimal saat Tinggi (Baterai...)',
          light: 'Cahaya',
          temperature: 'Suhu',
          humidity: 'Kelembaban',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Kecil',
          medium: 'Sedang',
          large: 'Besar',
          xlarge: 'Sangat besar',
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertikal',
        },
      },
    },
  },
  it: {
    card: {
      msg: {
        entityNotFound: 'Entità non trovata in Home Assistant.',
        attributeNotFound: 'Attributo non trovato in Home Assistant.',
        missingRequiredProperty: 'Proprietà obbligatoria mancante.',
        invalidTypeString: 'Atteso un valore di tipo stringa.',
        invalidTypeNumber: 'Atteso un valore di tipo numero.',
        invalidTypeBoolean: 'Atteso un valore di tipo booleano.',
        invalidTypeArray: 'Atteso un valore di tipo array.',
        invalidTypeObject: 'Atteso un valore di tipo oggetto.',
        invalidEnumValue: 'Il valore fornito non è tra quelli consentiti.',
        invalidUnionType: 'Il valore non corrisponde a nessuno dei tipi consentiti.',
        invalidEntityId: "L'ID dell'entità non è valido o è mal formattato.",
        invalidDecimal: 'Il valore deve essere un numero decimale valido.',
        invalidActionObject: "L'oggetto azione non è valido o è strutturato in modo errato.",
        missingActionKey: "Manca una chiave obbligatoria nell'oggetto azione.",
        invalidCustomThemeArray: 'Il tema personalizzato deve essere un array.',
        invalidCustomThemeEntry: 'Una o più voci del tema personalizzato non sono valide.',
        invalidMinValue: 'Il valore minimo non è valido o è al di sotto del limite consentito.',
        invalidMaxValue: 'Il valore massimo non è valido o supera il limite consentito.',
        minGreaterThanMax: 'Il valore minimo non può essere superiore al valore massimo.',
        discontinuousRange: "L'intervallo definito è discontinuo.",
        missingColorProperty: 'Manca una proprietà colore obbligatoria.',
        invalidIconType: 'Il tipo di icona specificato non è valido o non è riconosciuto.',
        invalidStateContent: 'Il contenuto dello stato non è valido o è mal formattato.',
        invalidStateContentEntry: 'Una o più voci nel contenuto dello stato non sono valide.',
        invalidTheme: 'Il tema specificato è sconosciuto. Verrà utilizzato il tema predefinito.',
        appliedDefaultValue: 'È stato applicato automaticamente un valore predefinito.',
      },
    },
    editor: {
      title: {
        content: 'Contenuto',
        interaction: 'Interazioni',
        theme: 'Aspetto e funzionalità',
      },
      field: {
        entity: 'Entità',
        attribute: 'Attributo',
        name: 'Nome',
        unit: 'Unità',
        decimal: 'Decimale',
        min_value: 'Valore minimo',
        max_value: 'Valore massimo',
        max_value_attribute: 'Attributo (max_value)',
        tap_action: 'Azione al tocco breve',
        double_tap_action: 'Azione al doppio tocco',
        hold_action: 'Azione al tocco prolungato',
        icon_tap_action: "Azione al tocco dell'icona",
        icon_double_tap_action: "Azione al doppio tocco dell'icona",
        icon_hold_action: "Azione al tocco prolungato dell'icona",
        toggle_icon: 'Icona',
        toggle_name: 'Nome',
        toggle_value: 'Valore',
        toggle_unit: 'Unità',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Barra',
        toggle_force_circular_background: 'Forza sfondo circolare',
        theme: 'Tema',
        bar_size: 'Dimensione della barra',
        bar_color: 'Colore per la barra',
        icon: 'Icona',
        color: "Colore dell'icona",
        layout: 'Layout della carta',
      },
      option: {
        theme: {
          optimal_when_low: 'Ottimale quando è basso (CPU, RAM,...)',
          optimal_when_high: 'Ottimale quando è alto (Batteria...)',
          light: 'Luce',
          temperature: 'Temperatura',
          humidity: 'Umidità',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Piccola',
          medium: 'Media',
          large: 'Grande',
          xlarge: 'Extra grande',
        },
        layout: {
          horizontal: 'Orizzontale (predefinito)',
          vertical: 'Verticale',
        },
      },
    },
  },
  ja: {
    card: {
      msg: {
        entityNotFound: 'Home Assistant にエンティティが見つかりません。',
        attributeNotFound: 'Home Assistant に属性が見つかりません。',
        missingRequiredProperty: '必要なプロパティが欠落しています。',
        invalidTypeString: '文字列型の値が必要です。',
        invalidTypeNumber: '数値型の値が必要です。',
        invalidTypeBoolean: 'ブール型の値が必要です。',
        invalidTypeArray: '配列型の値が必要です。',
        invalidTypeObject: 'オブジェクト型の値が必要です。',
        invalidEnumValue: '指定された値は許可されたオプションのいずれでもありません。',
        invalidUnionType: '値が許可された型のいずれにも一致しません。',
        invalidEntityId: 'エンティティ ID が無効か、形式が正しくありません。',
        invalidDecimal: '値は有効な小数である必要があります。',
        invalidActionObject: 'アクションオブジェクトが無効または構造が不正です。',
        missingActionKey: 'アクションオブジェクトに必要なキーが欠落しています。',
        invalidCustomThemeArray: 'カスタムテーマは配列である必要があります。',
        invalidCustomThemeEntry: 'カスタムテーマの1つ以上のエントリが無効です。',
        invalidMinValue: '最小値が無効か、許容範囲を下回っています。',
        invalidMaxValue: '最大値が無効か、許容範囲を超えています。',
        minGreaterThanMax: '最小値は最大値より大きくできません。',
        discontinuousRange: '定義された範囲が連続していません。',
        missingColorProperty: '必要な色のプロパティが欠落しています。',
        invalidIconType: '指定されたアイコンタイプが無効または認識されません。',
        invalidStateContent: '状態の内容が無効または形式が不正です。',
        invalidStateContentEntry: '状態の内容の1つ以上のエントリが無効です。',
        invalidTheme: '指定されたテーマは不明です。デフォルトのテーマが使用されます。',
        appliedDefaultValue: 'デフォルト値が自動的に適用されました。',
      },
    },
    editor: {
      title: {
        content: 'コンテンツ',
        interaction: 'インタラクション',
        theme: '外観',
      },
      field: {
        entity: 'エンティティ',
        attribute: '属性',
        name: '名前',
        unit: '単位',
        decimal: '小数点',
        min_value: '最小値',
        max_value: '最大値',
        max_value_attribute: '属性（最大値）',
        tap_action: '短くタップしたときの動作',
        double_tap_action: 'ダブルタップしたときの動作',
        hold_action: '長押ししたときの動作',
        icon_tap_action: 'アイコンをタップしたときの動作',
        icon_double_tap_action: 'アイコンをダブルタップしたときの動作',
        icon_hold_action: 'アイコンを長押ししたときの動作',
        toggle_icon: 'アイコン',
        toggle_name: '名前',
        toggle_value: '値',
        toggle_unit: '単位',
        toggle_secondary_info: '情報',
        toggle_progress_bar: 'バー',
        toggle_force_circular_background: '円形の背景を強制する',
        theme: 'テーマ',
        bar_size: 'バーサイズ',
        bar_color: 'バーの色',
        icon: 'アイコン',
        color: 'メインカラー',
        layout: 'カードレイアウト',
      },
      option: {
        theme: {
          optimal_when_low: '低い時が最適（CPU、RAMなど）',
          optimal_when_high: '高い時が最適（バッテリーなど）',
          light: '明るさ',
          temperature: '温度',
          humidity: '湿度',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '特大',
        },
        layout: {
          horizontal: '水平（デフォルト）',
          vertical: '垂直',
        },
      },
    },
  },
  ko: {
    card: {
      msg: {
        entityNotFound: 'Home Assistant에서 엔티티를 찾을 수 없습니다.',
        attributeNotFound: 'Home Assistant에서 속성을 찾을 수 없습니다.',
        missingRequiredProperty: '필수 속성이 누락되었습니다.',
        invalidTypeString: '문자열 유형의 값이 필요합니다.',
        invalidTypeNumber: '숫자 유형의 값이 필요합니다.',
        invalidTypeBoolean: '불리언 유형의 값이 필요합니다.',
        invalidTypeArray: '배열 유형의 값이 필요합니다.',
        invalidTypeObject: '객체 유형의 값이 필요합니다.',
        invalidEnumValue: '제공된 값이 허용된 옵션 중 하나가 아닙니다.',
        invalidUnionType: '값이 허용된 유형 중 어떤 것과도 일치하지 않습니다.',
        invalidEntityId: '엔티티 ID가 잘못되었거나 형식이 잘못되었습니다.',
        invalidDecimal: '값은 유효한 소수여야 합니다.',
        invalidActionObject: '액션 객체가 잘못되었거나 구조가 올바르지 않습니다.',
        missingActionKey: '액션 객체에 필수 키가 없습니다.',
        invalidCustomThemeArray: '사용자 정의 테마는 배열이어야 합니다.',
        invalidCustomThemeEntry: '사용자 정의 테마에 하나 이상의 잘못된 항목이 있습니다.',
        invalidMinValue: '최소값이 유효하지 않거나 허용된 범위보다 작습니다.',
        invalidMaxValue: '최대값이 유효하지 않거나 허용된 범위를 초과합니다.',
        minGreaterThanMax: '최소값은 최대값보다 클 수 없습니다.',
        discontinuousRange: '정의된 범위가 연속적이지 않습니다.',
        missingColorProperty: '필수 색상 속성이 누락되었습니다.',
        invalidIconType: '지정된 아이콘 유형이 잘못되었거나 인식되지 않습니다.',
        invalidStateContent: '상태 콘텐츠가 잘못되었거나 형식이 잘못되었습니다.',
        invalidStateContentEntry: '상태 콘텐츠에 하나 이상의 잘못된 항목이 있습니다.',
        invalidTheme: '지정된 테마를 알 수 없습니다. 기본 테마가 사용됩니다.',
        appliedDefaultValue: '기본값이 자동으로 적용되었습니다.',
      },
    },
    editor: {
      title: {
        content: '콘텐츠',
        interaction: '상호작용',
        theme: '테마 및 스타일',
      },
      field: {
        entity: '엔티티',
        attribute: '속성',
        name: '이름',
        unit: '단위',
        decimal: '소수점',
        min_value: '최소값',
        max_value: '최대값',
        max_value_attribute: '속성 (최대값)',
        tap_action: '짧게 탭 시 동작',
        double_tap_action: '더블 탭 시 동작',
        hold_action: '길게 누를 시 동작',
        icon_tap_action: '아이콘 탭 시 동작',
        icon_double_tap_action: '아이콘 더블 탭 시 동작',
        icon_hold_action: '아이콘 길게 누를 시 동작',
        toggle_icon: '아이콘',
        toggle_name: '이름',
        toggle_value: '값',
        toggle_unit: '단위',
        toggle_secondary_info: '정보',
        toggle_progress_bar: '진행 바',
        toggle_force_circular_background: '원형 배경 강제 적용',
        theme: '테마',
        bar_size: '바 크기',
        bar_color: '바 색상',
        icon: '아이콘',
        color: '기본 색상',
        layout: '카드 레이아웃',
      },
      option: {
        theme: {
          optimal_when_low: '낮을 때 최적 (CPU, RAM 등)',
          optimal_when_high: '높을 때 최적 (배터리 등)',
          light: '조도',
          temperature: '온도',
          humidity: '습도',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: '작은',
          medium: '중간',
          large: '큰',
          xlarge: '매우 큰',
        },
        layout: {
          horizontal: '수평 (기본)',
          vertical: '수직',
        },
      },
    },
  },
  mk: {
    card: {
      msg: {
        entityNotFound: 'Ентитетот не е пронајден во Home Assistant.',
        attributeNotFound: 'Атрибутот не е пронајден во Home Assistant.',
        missingRequiredProperty: 'Недостасува потребно својство.',
        invalidTypeString: 'Се очекуваше вредност од тип string.',
        invalidTypeNumber: 'Се очекуваше вредност од тип број.',
        invalidTypeBoolean: 'Се очекуваше вредност од тип boolean.',
        invalidTypeArray: 'Се очекуваше вредност од тип низа.',
        invalidTypeObject: 'Се очекуваше вредност од тип објект.',
        invalidEnumValue: 'Дадената вредност не е дозволена опција.',
        invalidUnionType: 'Вредноста не одговара на дозволените типови.',
        invalidEntityId: 'ID-то на ентитетот е невалидно или лошо форматирано.',
        invalidDecimal: 'Вредноста мора да биде валиден децимален број.',
        invalidActionObject: 'Објектот за акција е невалиден или неправилно структуриран.',
        missingActionKey: 'Недостасува потребен клуч во објектот за акција.',
        invalidCustomThemeArray: 'Прилагодената тема мора да биде низа.',
        invalidCustomThemeEntry: 'Еден или повеќе елементи во прилагодената тема се невалидни.',
        invalidMinValue: 'Минималната вредност е невалидна или под дозволеното.',
        invalidMaxValue: 'Максималната вредност е невалидна или над дозволеното.',
        minGreaterThanMax: 'Минималната вредност не може да биде поголема од максималната.',
        discontinuousRange: 'Дефинираниот опсег е дисконинуиран.',
        missingColorProperty: 'Недостасува потребна карактеристика за боја.',
        invalidIconType: 'Типот на икона е невалиден или непознат.',
        invalidStateContent: 'Состојбата е невалидна или лошо форматирана.',
        invalidStateContentEntry: 'Еден или повеќе елементи во состојбата се невалидни.',
        invalidTheme: 'Темата е непозната. Ќе се користи стандардна тема.',
        appliedDefaultValue: 'Автоматски е применета стандардна вредност.',
      },
    },
    editor: {
      title: {
        content: 'Содржина',
        interaction: 'Интеракции',
        theme: 'Изглед и функционалност',
      },
      field: {
        entity: 'Ентитет',
        attribute: 'Атрибут',
        name: 'Име',
        unit: 'Јединство',
        decimal: 'децемален',
        min_value: 'Минимална вредност',
        max_value: 'Максимална вредност',
        max_value_attribute: 'Атрибут (max_value)',
        tap_action: 'Дејство при краток допир',
        double_tap_action: 'Дејство при двоен допир',
        hold_action: 'Дејство при долг допир',
        icon_tap_action: 'Дејство при допир на иконата',
        icon_double_tap_action: 'Дејство при двоен допир на иконата',
        icon_hold_action: 'Дејство при долг допир на иконата',
        toggle_icon: 'Икона',
        toggle_name: 'Име',
        toggle_value: 'Вредност',
        toggle_unit: 'Јединство',
        toggle_secondary_info: 'Инфо',
        toggle_progress_bar: 'Лента',
        toggle_force_circular_background: 'Принуди кружна позадина',
        theme: 'Тема',
        bar_size: 'Големина на лента',
        bar_color: 'Боја за лентата',
        icon: 'Икона',
        color: 'Примарна боја',
        layout: 'Распоред на карта',
      },
      option: {
        theme: {
          optimal_when_low: 'Оптимално кога е ниско(CPU, RAM,...)',
          optimal_when_high: 'Оптимално кога е високо (Батерија...)',
          light: 'Светлина',
          temperature: 'Температура',
          humidity: 'Влажност',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Мала',
          medium: 'Средна',
          large: 'Голема',
          xlarge: 'Многу голема',
        },
        layout: {
          horizontal: 'Хоризонтално (стандардно)',
          vertical: 'Вертикално',
        },
      },
    },
  },
  nb: {
    card: {
      msg: {
        entityNotFound: 'Enheten ble ikke funnet i Home Assistant.',
        attributeNotFound: 'Attributtet ble ikke funnet i Home Assistant.',
        missingRequiredProperty: 'En påkrevd egenskap mangler.',
        invalidTypeString: 'Forventet en verdi av typen string.',
        invalidTypeNumber: 'Forventet en numerisk verdi.',
        invalidTypeBoolean: 'Forventet en boolsk verdi.',
        invalidTypeArray: 'Forventet en verdi av typen array.',
        invalidTypeObject: 'Forventet en verdi av typen objekt.',
        invalidEnumValue: 'Den oppgitte verdien er ikke en gyldig mulighet.',
        invalidUnionType: 'Verdien samsvarer ikke med noen av de tillatte typene.',
        invalidEntityId: 'Enhets-ID er ugyldig eller feil formatert.',
        invalidDecimal: 'Verdien må være et gyldig desimaltall.',
        invalidActionObject: 'Handlingsobjektet er ugyldig eller feil strukturert.',
        missingActionKey: 'En påkrevd nøkkel mangler i handlingsobjektet.',
        invalidCustomThemeArray: 'Tilpasset tema må være en array.',
        invalidCustomThemeEntry: 'Én eller flere oppføringer i temaet er ugyldige.',
        invalidMinValue: 'Minsteverdi er ugyldig eller for lav.',
        invalidMaxValue: 'Maksverdi er ugyldig eller for høy.',
        minGreaterThanMax: 'Minsteverdi kan ikke være større enn maksverdi.',
        discontinuousRange: 'Det definerte området er ikke sammenhengende.',
        missingColorProperty: 'En nødvendig fargeegenskap mangler.',
        invalidIconType: 'Angitt ikon-type er ugyldig eller ukjent.',
        invalidStateContent: 'Tilstandsinnholdet er ugyldig eller feil formatert.',
        invalidStateContentEntry: 'En eller flere oppføringer i tilstandsinnholdet er ugyldige.',
        invalidTheme: 'Angitt tema er ukjent. Standardtema vil bli brukt.',
        appliedDefaultValue: 'En standardverdi har blitt brukt automatisk.',
      },
    },
    editor: {
      title: {
        content: 'Innhold',
        interaction: 'Interaksjoner',
        theme: 'Utseende og funksjonalitet',
      },
      field: {
        entity: 'Enhet',
        attribute: 'Attributt',
        name: 'Navn',
        unit: 'Enhet',
        decimal: 'desimal',
        min_value: 'Minste verdi',
        max_value: 'Maksimal verdi',
        max_value_attribute: 'Attributt (max_value)',
        tap_action: 'Handling ved kort trykk',
        double_tap_action: 'Handling ved dobbelt trykk',
        hold_action: 'Handling ved langt trykk',
        icon_tap_action: 'Handling ved trykk på ikonet',
        icon_double_tap_action: 'Handling ved dobbelt trykk på ikonet',
        icon_hold_action: 'Handling ved langt trykk på ikonet',
        toggle_icon: 'Ikon',
        toggle_name: 'Navn',
        toggle_value: 'Verdi',
        toggle_unit: 'Enhet',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bar',
        toggle_force_circular_background: 'Tving sirkulær bakgrunn',
        theme: 'Tema',
        bar_size: 'Bar størrelse',
        bar_color: 'Farge for baren',
        icon: 'Ikon',
        color: 'Primærfarge',
        layout: 'Kortlayout',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          optimal_when_high: 'Optimal når høyt (Batteri...)',
          light: 'Lys',
          temperature: 'Temperatur',
          humidity: 'Fuktighet',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Liten',
          medium: 'Medium',
          large: 'Stor',
          xlarge: 'Ekstra stor',
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal',
        },
      },
    },
  },
  nl: {
    card: {
      msg: {
        entityNotFound: 'Entiteit niet gevonden in Home Assistant.',
        attributeNotFound: 'Attribuut niet gevonden in Home Assistant.',
        missingRequiredProperty: 'Vereiste eigenschap ontbreekt.',
        invalidTypeString: 'Verwachte waarde van het type string.',
        invalidTypeNumber: 'Verwachte waarde van het type nummer.',
        invalidTypeBoolean: 'Verwachte waarde van het type boolean.',
        invalidTypeArray: 'Verwachte waarde van het type array.',
        invalidTypeObject: 'Verwachte waarde van het type object.',
        invalidEnumValue: 'De opgegeven waarde is geen geldige optie.',
        invalidUnionType: 'De waarde komt niet overeen met toegestane types.',
        invalidEntityId: 'De entity ID is ongeldig of foutief geformatteerd.',
        invalidDecimal: 'De waarde moet een geldig decimaal getal zijn.',
        invalidActionObject: 'Het actieobject is ongeldig of onjuist gestructureerd.',
        missingActionKey: 'Er ontbreekt een verplichte sleutel in het actieobject.',
        invalidCustomThemeArray: 'Het aangepaste thema moet een array zijn.',
        invalidCustomThemeEntry: 'Een of meer invoeren in het aangepaste thema zijn ongeldig.',
        invalidMinValue: 'De minimumwaarde is ongeldig of te laag.',
        invalidMaxValue: 'De maximumwaarde is ongeldig of te hoog.',
        minGreaterThanMax: 'Minimumwaarde kan niet groter zijn dan de maximumwaarde.',
        discontinuousRange: 'Het opgegeven bereik is niet aaneengesloten.',
        missingColorProperty: 'Een verplichte kleur-eigenschap ontbreekt.',
        invalidIconType: 'Het opgegeven pictogramtype is ongeldig of niet herkend.',
        invalidStateContent: 'De statusinhoud is ongeldig of foutief.',
        invalidStateContentEntry: 'Een of meer onderdelen van de statusinhoud zijn ongeldig.',
        invalidTheme: 'Het opgegeven thema is onbekend. Het standaardthema wordt gebruikt.',
        appliedDefaultValue: 'Een standaardwaarde is automatisch toegepast.',
      },
    },
    editor: {
      title: {
        content: 'Inhoud',
        interaction: 'Interactie',
        theme: 'Uiterlijk en gebruiksgemak',
      },
      field: {
        entity: 'Entiteit',
        attribute: 'Attribuut',
        name: 'Naam',
        unit: 'Eenheid',
        decimal: 'decimaal',
        min_value: 'Minimale waarde',
        max_value: 'Maximale waarde',
        max_value_attribute: 'Attribuut (max_value)',
        tap_action: 'Actie bij korte tik',
        double_tap_action: 'Actie bij dubbel tikken',
        hold_action: 'Actie bij lang ingedrukt houden',
        icon_tap_action: 'Actie bij tikken op pictogram',
        icon_double_tap_action: 'Actie bij dubbel tikken op pictogram',
        icon_hold_action: 'Actie bij lang ingedrukt houden op pictogram',
        toggle_icon: 'Icoon',
        toggle_name: 'Naam',
        toggle_value: 'Waarde',
        toggle_unit: 'Eenheid',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Balk',
        toggle_force_circular_background: 'Geforceerde cirkelvormige achtergrond',
        theme: 'Thema',
        bar_size: 'Balkgrootte',
        bar_color: 'Kleur voor de balk',
        icon: 'Pictogram',
        color: 'Primaire kleur',
        layout: 'Kaartindeling',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaal wanneer laag (CPU, RAM,...)',
          optimal_when_high: 'Optimaal wanneer hoog (Batterij...)',
          light: 'Licht',
          temperature: 'Temperatuur',
          humidity: 'Vochtigheid',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Klein',
          medium: 'Middel',
          large: 'Groot',
          xlarge: 'Extra groot',
        },
        layout: {
          horizontal: 'Horizontaal (standaard)',
          vertical: 'Verticaal',
        },
      },
    },
  },
  pl: {
    card: {
      msg: {
        entityNotFound: 'Nie znaleziono encji w Home Assistant.',
        attributeNotFound: 'Nie znaleziono atrybutu w Home Assistant.',
        missingRequiredProperty: 'Brakuje wymaganej właściwości.',
        invalidTypeString: 'Oczekiwano wartości typu string.',
        invalidTypeNumber: 'Oczekiwano wartości typu liczba.',
        invalidTypeBoolean: 'Oczekiwano wartości typu boolean.',
        invalidTypeArray: 'Oczekiwano wartości typu tablica.',
        invalidTypeObject: 'Oczekiwano wartości typu obiekt.',
        invalidEnumValue: 'Podana wartość nie jest jedną z dozwolonych opcji.',
        invalidUnionType: 'Wartość nie pasuje do żadnego z dozwolonych typów.',
        invalidEntityId: 'ID encji jest nieprawidłowe lub ma zły format.',
        invalidDecimal: 'Wartość musi być poprawną liczbą dziesiętną.',
        invalidActionObject: 'Obiekt akcji jest nieprawidłowy lub ma złą strukturę.',
        missingActionKey: 'W obiekcie akcji brakuje wymaganej właściwości.',
        invalidCustomThemeArray: 'Własny motyw musi być tablicą.',
        invalidCustomThemeEntry: 'Jedna lub więcej pozycji motywu jest nieprawidłowa.',
        invalidMinValue: 'Minimalna wartość jest nieprawidłowa lub zbyt niska.',
        invalidMaxValue: 'Maksymalna wartość jest nieprawidłowa lub zbyt wysoka.',
        minGreaterThanMax: 'Wartość minimalna nie może być większa niż maksymalna.',
        discontinuousRange: 'Zdefiniowany zakres jest nieciągły.',
        missingColorProperty: 'Brakuje wymaganej właściwości koloru.',
        invalidIconType: 'Określony typ ikony jest nieprawidłowy lub nieznany.',
        invalidStateContent: 'Zawartość stanu jest nieprawidłowa lub uszkodzona.',
        invalidStateContentEntry: 'Jedna lub więcej pozycji zawartości stanu jest nieprawidłowa.',
        invalidTheme: 'Podany motyw jest nieznany. Zostanie użyty domyślny motyw.',
        appliedDefaultValue: 'Zastosowano domyślną wartość automatycznie.',
      },
    },
    editor: {
      title: {
        content: 'Zawartość',
        interaction: 'Interakcje',
        theme: 'Wygląd i funkcjonalność',
      },
      field: {
        entity: 'Encja',
        attribute: 'Atrybut',
        name: 'Nazwa',
        unit: 'Jednostka',
        decimal: 'dziesiętny',
        min_value: 'Wartość minimalna',
        max_value: 'Wartość maksymalna',
        max_value_attribute: 'Atrybut (max_value)',
        tap_action: 'Akcja przy krótkim naciśnięciu',
        double_tap_action: 'Akcja przy podwójnym naciśnięciu',
        hold_action: 'Akcja przy długim naciśnięciu',
        icon_tap_action: 'Akcja przy naciśnięciu ikony',
        icon_double_tap_action: 'Akcja przy podwójnym naciśnięciu ikony',
        icon_hold_action: 'Akcja przy długim naciśnięciu ikony',
        toggle_icon: 'Ikona',
        toggle_name: 'Nazwa',
        toggle_value: 'Wartość',
        toggle_unit: 'Jednostka',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Pasek',
        toggle_force_circular_background: 'Wymuś okrągłe tło',
        theme: 'Motyw',
        bar_size: 'Rozmiar paska',
        bar_color: 'Kolor paska',
        icon: 'Ikona',
        color: 'Kolor podstawowy',
        layout: 'Układ karty',
      },
      option: {
        theme: {
          optimal_when_low: 'Optymalny, gdy niskie (CPU, RAM,...)',
          optimal_when_high: 'Optymalny, gdy wysokie (Bateria...)',
          light: 'Światło',
          temperature: 'Temperatura',
          humidity: 'Wilgotność',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Mała',
          medium: 'Średnia',
          large: 'Duża',
          xlarge: 'Bardzo duża',
        },
        layout: {
          horizontal: 'Poziomo (domyślnie)',
          vertical: 'Pionowy',
        },
      },
    },
  },
  pt: {
    card: {
      msg: {
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        missingRequiredProperty: 'Propriedade obrigatória ausente.',
        invalidTypeString: 'Esperava-se um valor do tipo string.',
        invalidTypeNumber: 'Esperava-se um valor do tipo número.',
        invalidTypeBoolean: 'Esperava-se um valor do tipo booleano.',
        invalidTypeArray: 'Esperava-se um valor do tipo array.',
        invalidTypeObject: 'Esperava-se um valor do tipo objeto.',
        invalidEnumValue: 'O valor fornecido não é uma opção válida.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formatado.',
        invalidDecimal: 'O valor deve ser um número decimal válido.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        missingActionKey: 'Uma chave obrigatória está faltando no objeto de ação.',
        invalidCustomThemeArray: 'O tema personalizado deve ser um array.',
        invalidCustomThemeEntry: 'Uma ou mais entradas no tema personalizado são inválidas.',
        invalidMinValue: 'O valor mínimo é inválido ou abaixo do permitido.',
        invalidMaxValue: 'O valor máximo é inválido ou acima do permitido.',
        minGreaterThanMax: 'O valor mínimo não pode ser maior que o valor máximo.',
        discontinuousRange: 'O intervalo definido é descontínuo.',
        missingColorProperty: 'Uma propriedade de cor obrigatória está faltando.',
        invalidIconType: 'O tipo de ícone especificado é inválido ou desconhecido.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formatado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. Tema padrão será usado.',
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
      },
    },
    editor: {
      title: {
        content: 'Conteúdo',
        interaction: 'Interações',
        theme: 'Aparência e usabilidade',
      },
      field: {
        entity: 'Entidade',
        attribute: 'Atributo',
        name: 'Nome',
        unit: 'Unidade',
        decimal: 'decimal',
        min_value: 'Valor mínimo',
        max_value: 'Valor máximo',
        max_value_attribute: 'Atributo (max_value)',
        tap_action: 'Ação ao toque curto',
        double_tap_action: 'Ação ao toque duplo',
        hold_action: 'Ação ao toque longo',
        icon_tap_action: 'Ação ao tocar no ícone',
        icon_double_tap_action: 'Ação ao tocar duplamente no ícone',
        icon_hold_action: 'Ação ao manter o toque no ícone',
        toggle_icon: 'Ícone',
        toggle_name: 'Nome',
        toggle_value: 'Valor',
        toggle_unit: 'Unidade',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Barra',
        toggle_force_circular_background: 'Forçar fundo circular',
        theme: 'Tema',
        bar_size: 'Tamanho da barra',
        bar_color: 'Cor para a barra',
        icon: 'Ícone',
        color: 'Cor primária',
        layout: 'Layout do cartão',
      },
      option: {
        theme: {
          optimal_when_low: 'Ótimo quando é baixo (CPU, RAM,...)',
          optimal_when_high: 'Ótimo quando é alto (Bateria...)',
          light: 'Luz',
          temperature: 'Temperatura',
          humidity: 'Humidade',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Pequena',
          medium: 'Média',
          large: 'Grande',
          xlarge: 'Extra grande',
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical',
        },
      },
    },
  },
  ro: {
    card: {
      msg: {
        entityNotFound: 'Entitatea nu a fost găsită în Home Assistant.',
        attributeNotFound: 'Atributul nu a fost găsit în Home Assistant.',
        missingRequiredProperty: 'Lipsește o proprietate necesară.',
        invalidTypeString: 'Se aștepta o valoare de tip șir.',
        invalidTypeNumber: 'Se aștepta o valoare de tip număr.',
        invalidTypeBoolean: 'Se aștepta o valoare de tip boolean.',
        invalidTypeArray: 'Se aștepta o valoare de tip array.',
        invalidTypeObject: 'Se aștepta o valoare de tip obiect.',
        invalidEnumValue: 'Valoarea furnizată nu este una dintre opțiunile permise.',
        invalidUnionType: 'Valoarea nu se potrivește niciunui tip permis.',
        invalidEntityId: 'ID-ul entității este invalid sau formatat greșit.',
        invalidDecimal: 'Valoarea trebuie să fie un număr zecimal valid.',
        invalidActionObject: 'Obiectul acțiune este invalid sau structurat incorect.',
        missingActionKey: 'Lipsește o cheie necesară în obiectul acțiune.',
        invalidCustomThemeArray: 'Tema personalizată trebuie să fie un array.',
        invalidCustomThemeEntry: 'Una sau mai multe intrări din temă sunt invalide.',
        invalidMinValue: 'Valoarea minimă este invalidă sau prea mică.',
        invalidMaxValue: 'Valoarea maximă este invalidă sau prea mare.',
        minGreaterThanMax: 'Valoarea minimă nu poate fi mai mare decât valoarea maximă.',
        discontinuousRange: 'Intervalul definit este discontinuu.',
        missingColorProperty: 'Lipsește o proprietate de culoare necesară.',
        invalidIconType: 'Tipul de pictogramă specificat este invalid sau necunoscut.',
        invalidStateContent: 'Conținutul stării este invalid sau formatat greșit.',
        invalidStateContentEntry: 'Una sau mai multe intrări în conținutul stării sunt invalide.',
        invalidTheme: 'Tema specificată este necunoscută. Va fi utilizată tema implicită.',
        appliedDefaultValue: 'A fost aplicată automat o valoare implicită.',
      },
    },
    editor: {
      title: {
        content: 'Conținut',
        interaction: 'Interacțiuni',
        theme: 'Aspect & Stil',
      },
      field: {
        entity: 'Entitate',
        attribute: 'Atribut',
        name: 'Nume',
        unit: 'Unitate',
        decimal: 'zecimal',
        min_value: 'Valoare minimă',
        max_value: 'Valoare maximă',
        max_value_attribute: 'Atribut (max_value)',
        tap_action: 'Acțiune la apăsare scurtă',
        double_tap_action: 'Acțiune la apăsare dublă',
        hold_action: 'Acțiune la apăsare lungă',
        icon_tap_action: 'Acțiune la apăsarea pictogramei',
        icon_double_tap_action: 'Acțiune la apăsare dublă a pictogramei',
        icon_hold_action: 'Acțiune la apăsare lungă a pictogramei',
        toggle_icon: 'Pictogramă',
        toggle_name: 'Nume',
        toggle_value: 'Valoare',
        toggle_unit: 'Unitate',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bară',
        toggle_force_circular_background: 'Forțează fundal circular',
        theme: 'Temă',
        bar_size: 'Dimensiunea barei',
        bar_color: 'Culoare bară',
        icon: 'Pictogramă',
        color: 'Culoare principală',
        layout: 'Aspectul cardului',
      },
      option: {
        theme: {
          optimal_when_low: 'Optim când este scăzut (CPU, RAM...)',
          optimal_when_high: 'Optim când este ridicat (Baterie...)',
          light: 'Luminozitate',
          temperature: 'Temperatură',
          humidity: 'Umiditate',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Mică',
          medium: 'Medie',
          large: 'Mare',
          xlarge: 'Foarte mare',
        },
        layout: {
          horizontal: 'Orizontal (implicit)',
          vertical: 'Vertical',
        },
      },
    },
  },
  ru: {
    card: {
      msg: {
        entityNotFound: 'Сущность не найдена в Home Assistant.',
        attributeNotFound: 'Атрибут не найден в Home Assistant.',
        missingRequiredProperty: 'Отсутствует обязательное свойство.',
        invalidTypeString: 'Ожидается значение строкового типа.',
        invalidTypeNumber: 'Ожидается значение числового типа.',
        invalidTypeBoolean: 'Ожидается значение логического типа.',
        invalidTypeArray: 'Ожидается значение типа массив.',
        invalidTypeObject: 'Ожидается значение типа объект.',
        invalidEnumValue: 'Предоставленное значение не является одним из разрешённых вариантов.',
        invalidUnionType: 'Значение не соответствует ни одному из разрешённых типов.',
        invalidEntityId: 'Идентификатор сущности недействителен или неправильно сформирован.',
        invalidDecimal: 'Значение должно быть действительным десятичным числом.',
        invalidActionObject: 'Объект действия недействителен или неправильно структурирован.',
        missingActionKey: 'В объекте действия отсутствует обязательный ключ.',
        invalidCustomThemeArray: 'Пользовательская тема должна быть массивом.',
        invalidCustomThemeEntry: 'Одна или несколько записей в пользовательской теме недействительны.',
        invalidMinValue: 'Минимальное значение недействительно или ниже разрешённых пределов.',
        invalidMaxValue: 'Максимальное значение недействительно или выше разрешённых пределов.',
        minGreaterThanMax: 'Минимальное значение не может быть больше максимального значения.',
        discontinuousRange: 'Определённый диапазон является прерывистым.',
        missingColorProperty: 'Отсутствует обязательное свойство цвета.',
        invalidIconType: 'Указанный тип иконки недействителен или не распознан.',
        invalidStateContent: 'Содержимое состояния недействительно или неправильно сформировано.',
        invalidStateContentEntry: 'Одна или несколько записей в содержимом состояния недействительны.',
        invalidTheme: 'Указанная тема неизвестна. Будет использована тема по умолчанию.',
        appliedDefaultValue: 'Значение по умолчанию было применено автоматически.',
      },
    },
    editor: {
      title: {
        content: 'Содержимое',
        interaction: 'Взаимодействия',
        theme: 'Внешний вид',
      },
      field: {
        entity: 'Сущность',
        attribute: 'Атрибут',
        name: 'Название',
        unit: 'Единица измерения',
        decimal: 'десятичные',
        min_value: 'Минимальное значение',
        max_value: 'Максимальное значение',
        max_value_attribute: 'Атрибут (max_value)',
        tap_action: 'Поведение при нажатии',
        double_tap_action: 'Поведение при двойном нажатии',
        hold_action: 'Поведение при длительном нажатии',
        icon_tap_action: 'Поведение при нажатии на иконку',
        icon_double_tap_action: 'Поведение при двойном нажатии на иконку',
        icon_hold_action: 'Поведение при длительном нажатии на иконку',
        toggle_icon: 'Иконка',
        toggle_name: 'Название',
        toggle_value: 'Значение',
        toggle_unit: 'Единица измерения',
        toggle_secondary_info: 'Информация',
        toggle_progress_bar: 'Полоса прогресса',
        toggle_force_circular_background: 'Принудительный круглый фон',
        theme: 'Тема',
        bar_size: 'Размер полосы',
        bar_color: 'Цвет полосы',
        icon: 'Иконка',
        color: 'Основной цвет',
        layout: 'Макет карточки',
      },
      option: {
        theme: {
          optimal_when_low: 'Оптимально при низких значениях (ЦП, ОЗУ,...)',
          optimal_when_high: 'Оптимально при высоких значениях (Батарея...)',
          light: 'Освещение',
          temperature: 'Температура',
          humidity: 'Влажность',
          pm25: 'PM2.5',
          voc: 'ЛОС',
        },
        bar_size: {
          small: 'Маленькая',
          medium: 'Средняя',
          large: 'Большая',
          xlarge: 'Очень большая',
        },
        layout: {
          horizontal: 'Горизонтальный (по умолчанию)',
          vertical: 'Вертикальный',
        },
      },
    },
  },
  sv: {
    card: {
      msg: {
        entityNotFound: 'Enheten kunde inte hittas i Home Assistant.',
        attributeNotFound: 'Attributet kunde inte hittas i Home Assistant.',
        missingRequiredProperty: 'En obligatorisk egenskap saknas.',
        invalidTypeString: 'Förväntade ett värde av typen sträng.',
        invalidTypeNumber: 'Förväntade ett värde av typen nummer.',
        invalidTypeBoolean: 'Förväntade ett värde av typen boolean.',
        invalidTypeArray: 'Förväntade ett värde av typen array.',
        invalidTypeObject: 'Förväntade ett värde av typen objekt.',
        invalidEnumValue: 'Det angivna värdet är inte ett giltigt alternativ.',
        invalidUnionType: 'Värdet matchar inte något av de tillåtna typerna.',
        invalidEntityId: 'Enhets-ID är ogiltigt eller felaktigt formaterat.',
        invalidDecimal: 'Värdet måste vara ett giltigt decimaltal.',
        invalidActionObject: 'Åtgärdsobjektet är ogiltigt eller felstrukturerat.',
        missingActionKey: 'En obligatorisk nyckel saknas i åtgärdsobjektet.',
        invalidCustomThemeArray: 'Det anpassade temat måste vara en array.',
        invalidCustomThemeEntry: 'En eller flera poster i det anpassade temat är ogiltiga.',
        invalidMinValue: 'Minimivärdet är ogiltigt eller för lågt.',
        invalidMaxValue: 'Maximivärdet är ogiltigt eller för högt.',
        minGreaterThanMax: 'Minimivärdet kan inte vara större än maximivärdet.',
        discontinuousRange: 'Det angivna intervallet är inte sammanhängande.',
        missingColorProperty: 'En obligatorisk färgegenskap saknas.',
        invalidIconType: 'Den angivna ikontypen är ogiltig eller okänd.',
        invalidStateContent: 'Tillståndsinnehållet är ogiltigt eller felaktigt.',
        invalidStateContentEntry: 'En eller flera poster i tillståndsinnehållet är ogiltiga.',
        invalidTheme: 'Det angivna temat är okänt. Standardtema används.',
        appliedDefaultValue: 'Ett standardvärde har tillämpats automatiskt.',
      },
    },
    editor: {
      title: {
        content: 'Innehåll',
        interaction: 'Interaktioner',
        theme: 'Utseende och funktionalitet',
      },
      field: {
        entity: 'Enhet',
        attribute: 'Attribut',
        name: 'Namn',
        unit: 'Enhet',
        decimal: 'decimal',
        min_value: 'Minsta värde',
        max_value: 'Maximalt värde',
        max_value_attribute: 'Attribut (max_value)',
        tap_action: 'Åtgärd vid kort tryck',
        double_tap_action: 'Åtgärd vid dubbeltryck',
        hold_action: 'Åtgärd vid långt tryck',
        icon_tap_action: 'Åtgärd vid tryck på ikonen',
        icon_double_tap_action: 'Åtgärd vid dubbeltryck på ikonen',
        icon_hold_action: 'Åtgärd vid långt tryck på ikonen',
        toggle_icon: 'Ikon',
        toggle_name: 'Namn',
        toggle_value: 'Värde',
        toggle_unit: 'Enhet',
        toggle_secondary_info: 'Info',
        toggle_progress_bar: 'Bar',
        toggle_force_circular_background: 'Tvinga cirkulär bakgrund',
        theme: 'Tema',
        bar_size: 'Barstorlek',
        bar_color: 'Färg för baren',
        icon: 'Ikon',
        color: 'Primärfärg',
        layout: 'Kortlayout',
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal när det är lågt (CPU, RAM,...)',
          optimal_when_high: 'Optimal när det är högt (Batteri...)',
          light: 'Ljus',
          temperature: 'Temperatur',
          humidity: 'Luftfuktighet',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Liten',
          medium: 'Medium',
          large: 'Stor',
          xlarge: 'Extra stor',
        },
        layout: {
          horizontal: 'Horisontell (standard)',
          vertical: 'Vertikal',
        },
      },
    },
  },
  template: {
    card: {
      msg: {
        entityNotFound: '',
        attributeNotFound: '',
        missingRequiredProperty: '',
        invalidTypeString: '',
        invalidTypeNumber: '',
        invalidTypeBoolean: '',
        invalidTypeArray: '',
        invalidTypeObject: '',
        invalidEnumValue: '',
        invalidUnionType: '',
        invalidEntityId: '',
        invalidDecimal: '',
        invalidActionObject: '',
        missingActionKey: '',
        invalidCustomThemeArray: '',
        invalidCustomThemeEntry: '',
        invalidMinValue: '',
        invalidMaxValue: '',
        minGreaterThanMax: '',
        discontinuousRange: '',
        missingColorProperty: '',
        invalidIconType: '',
        invalidStateContent: '',
        invalidStateContentEntry: '',
        invalidTheme: '',
        appliedDefaultValue: '',
      },
    },
    editor: {
      title: {
        content: '',
        interaction: '',
        theme: '',
      },
      field: {
        entity: '',
        attribute: '',
        name: '',
        unit: '',
        decimal: '',
        min_value: '',
        max_value: '',
        max_value_attribute: '',
        tap_action: '',
        double_tap_action: '',
        hold_action: '',
        icon_tap_action: '',
        icon_double_tap_action: '',
        icon_hold_action: '',
        toggle_icon: '',
        toggle_name: '',
        toggle_value: '',
        toggle_unit: '',
        toggle_secondary_info: '',
        toggle_progress_bar: '',
        toggle_force_circular_background: '',
        theme: '',
        bar_size: '',
        bar_color: '',
        icon: '',
        color: '',
        layout: '',
      },
      option: {
        theme: {
          optimal_when_low: '',
          optimal_when_high: '',
          light: '',
          temperature: '',
          humidity: '',
          pm25: '',
          voc: '',
        },
        bar_size: {
          small: '',
          medium: '',
          large: '',
          xlarge: '',
        },
        layout: {
          horizontal: '',
          vertical: '',
        },
      },
    },
  },
  th: {
    card: {
      msg: {
        entityNotFound: 'ไม่พบเอนทิตีใน HA',
        attributeNotFound: 'ไม่พบแอตทริบิวต์ใน HA',
        missingRequiredProperty: 'ขาดคุณสมบัติที่จำเป็น',
        invalidTypeString: 'คาดหวังค่าประเภทสตริง',
        invalidTypeNumber: 'คาดหวังค่าประเภทตัวเลข',
        invalidTypeBoolean: 'คาดหวังค่าประเภทบูลีน',
        invalidTypeArray: 'คาดหวังค่าประเภทอาร์เรย์',
        invalidTypeObject: 'คาดหวังค่าประเภทออบเจ็กต์',
        invalidEnumValue: 'ค่าที่ให้มาไม่ใช่หนึ่งในตัวเลือกที่อนุญาต',
        invalidUnionType: 'ค่าไม่ตรงกับประเภทที่อนุญาตใด ๆ',
        invalidEntityId: 'ID เอนทิตีไม่ถูกต้องหรือรูปแบบผิด',
        invalidDecimal: 'ค่าต้องเป็นตัวเลขทศนิยมที่ถูกต้อง',
        invalidActionObject: 'ออบเจ็กต์แอ็กชันไม่ถูกต้องหรือโครงสร้างผิด',
        missingActionKey: 'ขาดคีย์ที่จำเป็นในออบเจ็กต์แอ็กชัน',
        invalidCustomThemeArray: 'ธีมกำหนดเองต้องเป็นอาร์เรย์',
        invalidCustomThemeEntry: 'หนึ่งหรือหลายรายการในธีมกำหนดเองไม่ถูกต้อง',
        invalidMinValue: 'ค่าต่ำสุดไม่ถูกต้องหรือต่ำกว่าขีดจำกัดที่อนุญาต',
        invalidMaxValue: 'ค่าสูงสุดไม่ถูกต้องหรือสูงกว่าขีดจำกัดที่อนุญาต',
        minGreaterThanMax: 'ค่าต่ำสุดไม่สามารถมากกว่าค่าสูงสุด',
        discontinuousRange: 'ช่วงที่กำหนดไม่ต่อเนื่อง',
        missingColorProperty: 'ขาดคุณสมบัติสีที่จำเป็น',
        invalidIconType: 'ประเภทไอคอนที่ระบุไม่ถูกต้องหรือไม่รู้จัก',
        invalidStateContent: 'เนื้อหาสถานะไม่ถูกต้องหรือรูปแบบผิด',
        invalidStateContentEntry: 'หนึ่งหรือหลายรายการในเนื้อหาสถานะไม่ถูกต้อง',
        invalidTheme: 'ธีมที่ระบุไม่รู้จัก จะใช้ธีมเริ่มต้น',
        appliedDefaultValue: 'ค่าเริ่มต้นถูกนำไปใช้โดยอัตโนมัติ',
      },
    },
    editor: {
      title: {
        content: 'เนื้อหา',
        interaction: 'การโต้ตอบ',
        theme: 'รูปลักษณ์และความรู้สึก',
      },
      field: {
        entity: 'เอนทิตี',
        attribute: 'แอตทริบิวต์',
        name: 'ชื่อ',
        unit: 'หน่วย',
        decimal: 'ทศนิยม',
        min_value: 'ค่าต่ำสุด',
        max_value: 'ค่าสูงสุด',
        max_value_attribute: 'แอตทริบิวต์ (max_value)',
        tap_action: 'พฤติกรรมการแตะ',
        double_tap_action: 'พฤติกรรมการแตะสองครั้ง',
        hold_action: 'พฤติกรรมการกด',
        icon_tap_action: 'พฤติกรรมการแตะไอคอน',
        icon_double_tap_action: 'พฤติกรรมการแตะไอคอนสองครั้ง',
        icon_hold_action: 'พฤติกรรมการกดไอคอน',
        toggle_icon: 'ไอคอน',
        toggle_name: 'ชื่อ',
        toggle_value: 'ค่า',
        toggle_unit: 'หน่วย',
        toggle_secondary_info: 'ข้อมูล',
        toggle_progress_bar: 'แถบ',
        toggle_force_circular_background: 'บังคับพื้นหลังวงกลม',
        theme: 'ธีม',
        bar_size: 'ขนาดแถบ',
        bar_color: 'สีแถบ',
        icon: 'ไอคอน',
        color: 'สีหลัก',
        layout: 'เลย์เอาต์การ์ด',
      },
      option: {
        theme: {
          optimal_when_low: 'เหมาะสมเมื่อต่ำ (CPU, RAM,...)',
          optimal_when_high: 'เหมาะสมเมื่อสูง (แบตเตอรี่...)',
          light: 'แสง',
          temperature: 'อุณหภูมิ',
          humidity: 'ความชื้น',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'เล็ก',
          medium: 'กลาง',
          large: 'ใหญ่',
          xlarge: 'ใหญ่พิเศษ',
        },
        layout: {
          horizontal: 'แนวนอน (เริ่มต้น)',
          vertical: 'แนวตั้ง',
        },
      },
    },
  },
  tr: {
    card: {
      msg: {
        entityNotFound: "Varlık Home Assistant'ta bulunamadı.",
        attributeNotFound: "Öznitelik Home Assistant'ta bulunamadı.",
        missingRequiredProperty: 'Gerekli bir özellik eksik.',
        invalidTypeString: 'Dize (string) türünde bir değer bekleniyordu.',
        invalidTypeNumber: 'Sayı türünde bir değer bekleniyordu.',
        invalidTypeBoolean: 'Boolean türünde bir değer bekleniyordu.',
        invalidTypeArray: 'Dizi türünde bir değer bekleniyordu.',
        invalidTypeObject: 'Nesne türünde bir değer bekleniyordu.',
        invalidEnumValue: 'Sağlanan değer izin verilen seçeneklerden biri değil.',
        invalidUnionType: 'Değer izin verilen türlerden hiçbirine uymuyor.',
        invalidEntityId: 'Varlık kimliği geçersiz veya hatalı biçimlendirilmiş.',
        invalidDecimal: 'Değer geçerli bir ondalık sayı olmalıdır.',
        invalidActionObject: 'Eylem nesnesi geçersiz veya hatalı yapılandırılmış.',
        missingActionKey: 'Eylem nesnesinde gerekli bir anahtar eksik.',
        invalidCustomThemeArray: 'Özel tema bir dizi olmalıdır.',
        invalidCustomThemeEntry: 'Özel temadaki bir veya daha fazla giriş geçersiz.',
        invalidMinValue: 'Minimum değer geçersiz veya sınırların altında.',
        invalidMaxValue: 'Maksimum değer geçersiz veya sınırların üzerinde.',
        minGreaterThanMax: 'Minimum değer maksimum değerden büyük olamaz.',
        discontinuousRange: 'Tanımlanan aralık süreksizdir.',
        missingColorProperty: 'Gerekli bir renk özelliği eksik.',
        invalidIconType: 'Belirtilen simge türü geçersiz veya tanınmıyor.',
        invalidStateContent: 'Durum içeriği geçersiz veya hatalı biçimlendirilmiş.',
        invalidStateContentEntry: 'Durum içeriğindeki bir veya daha fazla giriş geçersiz.',
        invalidTheme: 'Belirtilen tema bilinmiyor. Varsayılan tema kullanılacak.',
        appliedDefaultValue: 'Varsayılan değer otomatik olarak uygulandı.',
      },
    },
    editor: {
      title: {
        content: 'İçerik',
        interaction: 'Etkileşimler',
        theme: 'Görünüm',
      },
      field: {
        entity: 'Varlık',
        attribute: 'Öznitelik',
        name: 'Ad',
        unit: 'Birim',
        decimal: 'ondalık',
        min_value: 'Minimum değer',
        max_value: 'Maksimum değer',
        max_value_attribute: 'Öznitelik (max_value)',
        tap_action: 'Kısa dokunma davranışı',
        double_tap_action: 'Çift dokunma davranışı',
        hold_action: 'Uzun basma davranışı',
        icon_tap_action: 'Simgeye dokunma davranışı',
        icon_double_tap_action: 'Simgeye çift dokunma davranışı',
        icon_hold_action: 'Simgeye uzun basma davranışı',
        toggle_icon: 'Simge',
        toggle_name: 'Ad',
        toggle_value: 'Değer',
        toggle_unit: 'Birim',
        toggle_secondary_info: 'Bilgi',
        toggle_progress_bar: 'Çubuk',
        toggle_force_circular_background: 'Dairesel arka planı zorla',
        theme: 'Tema',
        bar_size: 'Çubuk boyutu',
        bar_color: 'Çubuk rengi',
        icon: 'Simge',
        color: 'Birincil renk',
        layout: 'Kart düzeni',
      },
      option: {
        theme: {
          optimal_when_low: 'Düşükken en iyi (CPU, RAM...)',
          optimal_when_high: 'Yüksekken en iyi (Pil...)',
          light: 'Işık',
          temperature: 'Sıcaklık',
          humidity: 'Nem',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Küçük',
          medium: 'Orta',
          large: 'Büyük',
          xlarge: 'Çok büyük',
        },
        layout: {
          horizontal: 'Yatay (varsayılan)',
          vertical: 'Dikey',
        },
      },
    },
  },
  uk: {
    card: {
      msg: {
        entityNotFound: 'Сутність не знайдена в HA.',
        attributeNotFound: 'Атрибут не знайдено в HA.',
        missingRequiredProperty: "Відсутня обов'язкова властивість.",
        invalidTypeString: 'Очікується значення типу рядок.',
        invalidTypeNumber: 'Очікується значення типу число.',
        invalidTypeBoolean: 'Очікується значення типу булевий.',
        invalidTypeArray: 'Очікується значення típу масив.',
        invalidTypeObject: "Очікується значення типу об'єкт.",
        invalidEnumValue: 'Надане значення не є одним з дозволених варіантів.',
        invalidUnionType: 'Значення не відповідає жодному з дозволених типів.',
        invalidEntityId: 'ID сутності недійсний або неправильно сформований.',
        invalidDecimal: 'Значення повинно бути дійсним десятковим числом.',
        invalidActionObject: "Об'єкт дії недійсний або неправильно структурований.",
        missingActionKey: "Відсутній обов'язковий ключ в об'єкті дії.",
        invalidCustomThemeArray: 'Користувацька тема повинна бути масивом.',
        invalidCustomThemeEntry: 'Один або кілька записів у користувацькій темі недійсні.',
        invalidMinValue: 'Мінімальне значення недійсне або нижче дозволених меж.',
        invalidMaxValue: 'Максимальне значення недійсне або вище дозволених меж.',
        minGreaterThanMax: 'Мінімальне значення не може бути більшим за максимальне.',
        discontinuousRange: 'Визначений діапазон є розривним.',
        missingColorProperty: "Відсутня обов'язкова властивість кольору.",
        invalidIconType: 'Зазначений тип іконки недійсний або нерозпізнаний.',
        invalidStateContent: 'Вміст стану недійсний або неправильно сформований.',
        invalidStateContentEntry: 'Один або кілька записів у вмісті стану недійсні.',
        invalidTheme: 'Зазначена тема невідома. Буде використана тема за замовчуванням.',
        appliedDefaultValue: 'Значення за замовчуванням було застосовано автоматично.',
      },
    },
    editor: {
      title: {
        content: 'Вміст',
        interaction: 'Взаємодії',
        theme: 'Вигляд та відчуття',
      },
      field: {
        entity: 'Сутність',
        attribute: 'Атрибут',
        name: 'Назва',
        unit: 'Одиниця',
        decimal: 'десятковий',
        min_value: 'Мінімальне значення',
        max_value: 'Максимальне значення',
        max_value_attribute: 'Атрибут (max_value)',
        tap_action: 'Поведінка при дотику',
        double_tap_action: 'Поведінка при подвійному дотику',
        hold_action: 'Поведінка при утриманні',
        icon_tap_action: 'Поведінка дотику іконки',
        icon_double_tap_action: 'Поведінка подвійного дотику іконки',
        icon_hold_action: 'Поведінка утримання іконки',
        toggle_icon: 'Іконка',
        toggle_name: 'Назва',
        toggle_value: 'Значення',
        toggle_unit: 'Одиниця',
        toggle_secondary_info: 'Інформація',
        toggle_progress_bar: 'Панель',
        toggle_force_circular_background: 'Примусовий круглий фон',
        theme: 'Тема',
        bar_size: 'Розмір панелі',
        bar_color: 'Колір панелі',
        icon: 'Іконка',
        color: 'Основний колір',
        layout: 'Розташування картки',
      },
      option: {
        theme: {
          optimal_when_low: 'Оптимально при низьких значеннях (CPU, RAM,...)',
          optimal_when_high: 'Оптимально при високих значеннях (Батарея...)',
          light: 'Світло',
          temperature: 'Температура',
          humidity: 'Вологість',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Мала',
          medium: 'Середня',
          large: 'Велика',
          xlarge: 'Дуже велика',
        },
        layout: {
          horizontal: 'Горизонтальний (за замовчуванням)',
          vertical: 'Вертикальний',
        },
      },
    },
  },
  vi: {
    card: {
      msg: {
        entityNotFound: 'Không tìm thấy thực thể trong HA.',
        attributeNotFound: 'Không tìm thấy thuộc tính trong HA.',
        missingRequiredProperty: 'Thuộc tính bắt buộc bị thiếu.',
        invalidTypeString: 'Mong đợi một giá trị kiểu chuỗi.',
        invalidTypeNumber: 'Mong đợi một giá trị kiểu số.',
        invalidTypeBoolean: 'Mong đợi một giá trị kiểu boolean.',
        invalidTypeArray: 'Mong đợi một giá trị kiểu mảng.',
        invalidTypeObject: 'Mong đợi một giá trị kiểu đối tượng.',
        invalidEnumValue: 'Giá trị được cung cấp không nằm trong các tùy chọn được phép.',
        invalidUnionType: 'Giá trị không khớp với bất kỳ loại nào được phép.',
        invalidEntityId: 'ID thực thể không hợp lệ hoặc không đúng định dạng.',
        invalidDecimal: 'Giá trị phải là một số thập phân hợp lệ.',
        invalidActionObject: 'Đối tượng hành động không hợp lệ hoặc cấu trúc không đúng.',
        missingActionKey: 'Một khóa bắt buộc bị thiếu trong đối tượng hành động.',
        invalidCustomThemeArray: 'Chủ đề tùy chỉnh phải là một mảng.',
        invalidCustomThemeEntry: 'Một hoặc nhiều mục trong chủ đề tùy chỉnh không hợp lệ.',
        invalidMinValue: 'Giá trị tối thiểu không hợp lệ hoặc dưới giới hạn cho phép.',
        invalidMaxValue: 'Giá trị tối đa không hợp lệ hoặc trên giới hạn cho phép.',
        minGreaterThanMax: 'Giá trị tối thiểu không thể lớn hơn giá trị tối đa.',
        discontinuousRange: 'Phạm vi được xác định không liên tục.',
        missingColorProperty: 'Một thuộc tính màu bắt buộc bị thiếu.',
        invalidIconType: 'Loại biểu tượng được chỉ định không hợp lệ hoặc không được nhận dạng.',
        invalidStateContent: 'Nội dung trạng thái không hợp lệ hoặc không đúng định dạng.',
        invalidStateContentEntry: 'Một hoặc nhiều mục trong nội dung trạng thái không hợp lệ.',
        invalidTheme: 'Chủ đề được chỉ định không xác định. Chủ đề mặc định sẽ được sử dụng.',
        appliedDefaultValue: 'Một giá trị mặc định đã được áp dụng tự động.',
      },
    },
    editor: {
      title: {
        content: 'Nội dung',
        interaction: 'Tương tác',
        theme: 'Giao diện & Trải nghiệm',
      },
      field: {
        entity: 'Thực thể',
        attribute: 'Thuộc tính',
        name: 'Tên',
        unit: 'Đơn vị',
        decimal: 'thập phân',
        min_value: 'Giá trị tối thiểu',
        max_value: 'Giá trị tối đa',
        max_value_attribute: 'Thuộc tính (max_value)',
        tap_action: 'Hành vi chạm',
        double_tap_action: 'Hành vi chạm đôi',
        hold_action: 'Hành vi giữ',
        icon_tap_action: 'Hành vi chạm biểu tượng',
        icon_double_tap_action: 'Hành vi chạm đôi biểu tượng',
        icon_hold_action: 'Hành vi giữ biểu tượng',
        toggle_icon: 'Biểu tượng',
        toggle_name: 'Tên',
        toggle_value: 'Giá trị',
        toggle_unit: 'Đơn vị',
        toggle_secondary_info: 'Thông tin',
        toggle_progress_bar: 'Thanh tiến trình',
        toggle_force_circular_background: 'Buộc nền hình tròn',
        theme: 'Chủ đề',
        bar_size: 'Kích thước thanh',
        bar_color: 'Màu thanh',
        icon: 'Biểu tượng',
        color: 'Màu chính',
        layout: 'Bố cục thẻ',
      },
      option: {
        theme: {
          optimal_when_low: 'Tối ưu khi thấp (CPU, RAM,...)',
          optimal_when_high: 'Tối ưu khi cao (Pin...)',
          light: 'Ánh sáng',
          temperature: 'Nhiệt độ',
          humidity: 'Độ ẩm',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: 'Nhỏ',
          medium: 'Trung bình',
          large: 'Lớn',
          xlarge: 'Rất lớn',
        },
        layout: {
          horizontal: 'Ngang (mặc định)',
          vertical: 'Dọc',
        },
      },
    },
  },
  zh: {
    card: {
      msg: {
        entityNotFound: '在 Home Assistant 中找不到实体。',
        attributeNotFound: '在 Home Assistant 中找不到属性。',
        missingRequiredProperty: '缺少必需的属性。',
        invalidTypeString: '应为字符串类型的值。',
        invalidTypeNumber: '应为数字类型的值。',
        invalidTypeBoolean: '应为布尔类型的值。',
        invalidTypeArray: '应为数组类型的值。',
        invalidTypeObject: '应为对象类型的值。',
        invalidEnumValue: '提供的值不是允许的选项之一。',
        invalidUnionType: '该值不符合任何允许的类型。',
        invalidEntityId: '实体 ID 无效或格式错误。',
        invalidDecimal: '该值必须是有效的小数。',
        invalidActionObject: '操作对象无效或结构不正确。',
        missingActionKey: '操作对象中缺少必需的键。',
        invalidCustomThemeArray: '自定义主题必须是数组。',
        invalidCustomThemeEntry: '自定义主题中有一个或多个无效条目。',
        invalidMinValue: '最小值无效或低于允许的限制。',
        invalidMaxValue: '最大值无效或超过允许的限制。',
        minGreaterThanMax: '最小值不能大于最大值。',
        discontinuousRange: '定义的范围不连续。',
        missingColorProperty: '缺少必需的颜色属性。',
        invalidIconType: '指定的图标类型无效或无法识别。',
        invalidStateContent: '状态内容无效或格式错误。',
        invalidStateContentEntry: '状态内容中有一个或多个无效条目。',
        invalidTheme: '指定的主题未知，将使用默认主题。',
        appliedDefaultValue: '已自动应用默认值。',
      },
    },
    editor: {
      title: {
        content: '内容',
        interaction: '交互',
        theme: '外观',
      },
      field: {
        entity: '实体',
        attribute: '属性',
        name: '名称',
        unit: '单位',
        decimal: '小数',
        min_value: '最小值',
        max_value: '最大值',
        max_value_attribute: '属性（最大值）',
        tap_action: '短按时的操作',
        double_tap_action: '双击时的操作',
        hold_action: '长按时的操作',
        icon_tap_action: '点击图标时的操作',
        icon_double_tap_action: '双击图标时的操作',
        icon_hold_action: '长按图标时的操作',
        toggle_icon: '图标',
        toggle_name: '名称',
        toggle_value: '数值',
        toggle_unit: '单位',
        toggle_secondary_info: '信息',
        toggle_progress_bar: '进度条',
        toggle_force_circular_background: '强制圆形背景',
        theme: '主题',
        bar_size: '条形大小',
        bar_color: '条形颜色',
        icon: '图标',
        color: '主色',
        layout: '卡片布局',
      },
      option: {
        theme: {
          optimal_when_low: '低值最佳（CPU、内存等）',
          optimal_when_high: '高值最佳（电池等）',
          light: '亮度',
          temperature: '温度',
          humidity: '湿度',
          pm25: 'PM2.5',
          voc: 'VOC',
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '超大',
        },
        layout: {
          horizontal: '水平（默认）',
          vertical: '垂直',
        },
      },
    },
  },
};

const EDITOR_INPUT_FIELDS = {
  basicConfiguration: {
    entity: {
      name: 'entity',
      type: CARD.editor.fields.entity.type,
      width: '100%',
      isInGroup: null,
      schema: [{ name: 'entity', required: true, selector: { entity: {} } }],
    },
    attribute: {
      name: 'attribute',
      type: CARD.editor.fields.attribute.type,
      width: '100%',
      isInGroup: CARD.editor.keyMappings.attribute,
    },
  },
  content: {
    title: {
      name: 'content',
      icon: 'mdi:text-short',
    },
    field: {
      name: {
        name: 'name',
        type: CARD.editor.fields.default.type,
        width: '100%',
        isInGroup: null,
      },
      unit: {
        name: 'unit',
        type: CARD.editor.fields.default.type,
        width: 'calc((100% - 20px) * 0.2)',
        isInGroup: null,
      },
      decimal: {
        name: 'decimal',
        type: CARD.editor.fields.decimal.type,
        width: 'calc((100% - 20px) * 0.2)',
        isInGroup: null,
      },
      min_value: {
        name: 'min_value',
        type: CARD.editor.fields.number.type,
        width: 'calc((100% - 20px) * 0.6)',
        isInGroup: null,
      },
      max_value: {
        name: 'max_value',
        type: CARD.editor.fields.default.type,
        width: '100%',
        isInGroup: null,
      },
      max_value_attribute: {
        name: 'max_value_attribute',
        type: CARD.editor.fields.max_value_attribute.type,
        width: '100%',
        isInGroup: CARD.editor.keyMappings.max_value_attribute,
      },
    },
  },
  interaction: {
    title: {
      name: 'interaction',
      icon: 'mdi:gesture-tap-hold',
    },
    field: {
      tap_action: {
        name: 'tap_action',
        type: CARD.editor.fields.tap_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'tap_action', selector: { 'ui-action': {} } }],
      },
      hold_action: {
        name: 'hold_action',
        type: CARD.editor.fields.tap_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'hold_action', selector: { 'ui-action': {} } }],
      },
      double_tap_action: {
        name: 'double_tap_action',
        type: CARD.editor.fields.double_tap_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'double_tap_action', selector: { 'ui-action': {} } }],
      },
      icon_tap_action: {
        name: 'icon_tap_action',
        type: CARD.editor.fields.icon_tap_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'icon_tap_action', selector: { 'ui-action': {} } }],
      },
      icon_hold_action: {
        name: 'icon_hold_action',
        type: CARD.editor.fields.icon_hold_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'icon_hold_action', selector: { 'ui-action': {} } }],
      },
      icon_double_tap_action: {
        name: 'icon_double_tap_action',
        type: CARD.editor.fields.icon_double_tap_action.type,
        isInGroup: null,
        width: '100%',
        schema: [{ name: 'icon_double_tap_action', selector: { 'ui-action': {} } }],
      },
    },
  },
  theme: {
    title: {
      name: 'theme',
      icon: 'mdi:list-box',
    },
    field: {
      toggleIcon: {
        name: 'toggle_icon',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleName: {
        name: 'toggle_name',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleValue: {
        name: 'toggle_value',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleUnit: {
        name: 'toggle_unit',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleSecondaryInfo: {
        name: 'toggle_secondary_info',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleBar: {
        name: 'toggle_progress_bar',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      toggleCircular: {
        name: 'toggle_force_circular_background',
        type: CARD.editor.fields.toggle.type,
        isInGroup: null,
      },
      theme: {
        name: 'theme',
        type: CARD.editor.fields.theme.type,
        width: '100%',
        isInGroup: null,
      },
      bar_size: {
        name: 'bar_size',
        type: CARD.editor.fields.bar_size.type,
        width: 'calc((100% - 10px) * 0.5)',
        isInGroup: null,
      },
      bar_color: {
        name: 'bar_color',
        type: CARD.editor.fields.color.type,
        width: 'calc((100% - 10px) * 0.5)',
        isInGroup: CARD.editor.keyMappings.theme,
        schema: [{ name: 'bar_color', selector: { 'ui-color': {} } }],
      },
      icon: {
        name: 'icon',
        type: CARD.editor.fields.icon.type,
        width: 'calc((100% - 10px) * 0.5)',
        isInGroup: null,
        schema: [{ name: 'icon', selector: { icon: { icon_set: ['mdi'] } } }],
      },
      color: {
        name: 'color',
        type: CARD.editor.fields.color.type,
        width: 'calc((100% - 10px) * 0.5)',
        isInGroup: CARD.editor.keyMappings.theme,
        schema: [{ name: 'color', selector: { 'ui-color': {} } }],
      },
      layout: {
        name: 'layout',
        type: CARD.editor.fields.layout.type,
        width: '100%',
        isInGroup: null,
      },
    },
  },
};

const ATTRIBUTE_MAPPING = {
  cover: { label: 'cover', attribute: 'current_position' },
  light: { label: 'light', attribute: 'brightness' },
  fan: { label: 'fan', attribute: 'percentage' },
};

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

/* ======= END CSS */

const CARD_EDITOR_CSS = `
:host {
  --accordion-padding: 18px;
  --accordion-gap: 10px;
  --border-radius: 6px;
  --transition-duration: 0.2s;
  --transition-easing: cubic-bezier(0.33, 0, 0.2, 1);
  --icon-size: 20px;
  --button-size: 48px;
  --small-icon-size: 24px;
}

/* Container principal */
.${CARD.editor.fields.container.class} {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-bottom: 70px;
}

/* Icônes communes */
.${CARD.editor.fields.accordion.icon.class} {
  margin-right: 8px;
  color: var(--secondary-text-color);
}

/* Accordéon */
.${CARD.editor.fields.accordion.item.class} {
  display: block;
  width: 100%;
  box-shadow: none;
  border-width: 1px;
  border-style: solid;
  border-color: var(--outline-color);
  border-radius: var(--ha-border-radius-md);
  overflow: visible;
}

.${CARD.editor.fields.accordion.title.class} {
  display: flex;
  align-items: center;
  gap: var(--accordion-gap);
  position: relative;
  background-color: transparent;
  color: var(--primary-text-color);
  cursor: pointer;
  padding: var(--accordion-padding);
  width: 100%;
  height: var(--button-size);
  border: none;
  text-align: left;
  font-size: 15px;
  transition: background-color 0.4s ease;
  border-radius: var(--ha-border-radius-md);
}

.${CARD.editor.fields.accordion.title.class}:focus {
  background-color: var(--input-fill-color);
}

.accordion.expanded .${CARD.editor.fields.accordion.title.class}:focus {
  border-radius: var(--ha-border-radius-md) var(--ha-border-radius-md) 0 0;
}

.${CARD.editor.fields.accordion.arrow.class} {
  display: inline-block;
  width: var(--small-icon-size);
  height: var(--small-icon-size);
  margin-left: auto;
  color: var(--primary-text-color);
  transition: transform var(--transition-duration) ease-out;
}

.accordion.expanded .${CARD.editor.fields.accordion.arrow.class} {
  transform: rotate(180deg);
}

.${CARD.editor.fields.accordion.content.class} {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  column-gap: var(--accordion-gap);
  row-gap: 20px;
  padding: 0 var(--accordion-padding);
  background-color: transparent;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-height var(--transition-duration) var(--transition-easing),
    padding var(--transition-duration) var(--transition-easing),
    opacity var(--transition-duration) ease;
}

.accordion.expanded .${CARD.editor.fields.accordion.content.class} {
  /* max-height: défini par script JS */
  padding-top: 30px;
  padding-bottom: 30px;
  opacity: 1;
  overflow: visible;
}

/* Animation des éléments enfants de l'accordéon */
.${CARD.editor.fields.accordion.content.class} > * {
  opacity: 0;
  transition: opacity var(--transition-duration) ease 0.15s;
}

.accordion.expanded .${CARD.editor.fields.accordion.content.class} > * {
  opacity: 1;
}

.accordion.collapsing .${CARD.editor.fields.accordion.content.class} > * {
  opacity: 0 !important;
  transition: opacity 0.1s ease; /* Transition rapide pendant le repli */
}

/* Classes show/hide optimisées */
.${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.attribute} .${CARD.editor.keyMappings.attribute},
.${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.max_value_attribute} .${CARD.editor.keyMappings.max_value_attribute},
.${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.theme} .${CARD.editor.keyMappings.theme} {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .${CARD.editor.fields.accordion.title.class},
  .${CARD.editor.fields.accordion.arrow.class},
  .${CARD.editor.fields.accordion.content.class},
  .${CARD.documentation.shape.class} {
    transition: none !important;
  }

  .${CARD.editor.fields.accordion.content.class} > * {
    opacity: 1 !important;
    transition: none !important;
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
  static _devMode = CARD.config.dev;
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
          documentationURL: CARD.documentation.link.documentationUrl,
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
  container: (options) => StructureElements.ripple() + Element(CARD.htmlStructure.sections.container, options.layout).html('{{content}}'),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html('{{content}}'),
  topContainer: () => Element(CARD.htmlStructure.sections.topContainer).html('{{content}}'),
  bottomContainer: () => Element(CARD.htmlStructure.sections.bottomContainer).html('{{content}}'),

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

    return Element(
      CARD.htmlStructure.elements.progressBar.container,
      extraClass
    ).html(
      Element(
        CARD.htmlStructure.elements.progressBar.bar,
        isCenterZero ? 'center-zero' : 'default'
      ).html(innerHtml)
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
      top: () => ({ before: StructureElements.topContainer().replace('{{content}}', bar()), after: '' }),
      bottom: () => ({ before: '', after: StructureElements.bottomContainer().replace('{{content}}', bar()) }),
      below: () => ({ before: '', after: StructureElements.belowContainer().replace('{{content}}', bar()) }),
    };

    const { before = '', after = '' } = wrap[barPosition]?.() ?? {};

    return before + content + after;
  },
};

const StructureTemplates = {
  card: (options = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        '{{content}}',
        StructureElements.trendIndicator(options) + StructureElements.iconSection() + StructureElements.contentFull(options),
      ),
      options,
    );
  },

  badge: (options = {}) => {
    return StructureElements.container(options).replace(
      '{{content}}',
      StructureElements.iconSectionWoBadge() + StructureElements.contentFull(options),
    );
  },

  template: (options = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        '{{content}}',
        StructureElements.trendIndicator(options) + StructureElements.iconSection() + StructureElements.contentMini(options),
      ),
      options,
    );
  },
  feature: (options = {}) => {
    const { barPosition } = options;
    const bar = () => StructureElements.progressBar(options);

    const containers = {
      top: () => StructureElements.topContainer().replace('{{content}}', bar()),
      bottom: () => StructureElements.bottomContainer().replace('{{content}}', bar()),
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
    if (!curColor) return null;
    return DEF_COLORS.has(curColor) ? `var(--${curColor}-color)` : curColor;
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
  #debug = CARD.config.debug.hass;
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
    return this.#hass?.language in LANGUAGES ? this.#hass.language : CARD.config.language;
  }
  getMessage(code) {
    return this.localize('card.msg')[code] || `Unknown message code: ${code}`;
  }
  get numberFormat() {
    const format = this.#hass?.locale?.number_format;
    if (!format) return CARD.config.languageMap[CARD.config.language];

    const formatMap = {
      decimal_comma: 'de-DE', // 1.234,56 (Allemagne, France, etc.)
      comma_decimal: 'en-US', // 1,234.56 (USA, UK, etc.)
      space_comma: 'fr-FR', // 1 234,56 (France, Norvège, etc.)
      language: CARD.config.languageMap[this.language],
      system: Intl.NumberFormat().resolvedOptions().locale,
      none: 'en',
    };

    return formatMap[format] || CARD.config.languageMap[CARD.config.language];
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
  }
  getNumericAttributes(entityId) {
    return Object.fromEntries(
      Object.entries(this.#getAttributes(entityId))
        .filter(([, val]) => is.number(val) || is.numericString(val))
        .map(([key, val]) => [key, is.number(val) ? val : parseFloat(val)]),
    );
  }
  #loadTranslations(lang) {
    const curLanguage = lang in CARD.config.languageMap ? lang : CARD.config.language;
    this.#translations = LANGUAGES[curLanguage];
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
  #debug = CARD.config.debug.hass;
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
  stateContent = [];

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  set entityId(newValue) {
    this.#entityId = newValue;
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
    if (EntityHelper.#handleRefreshType.has(this.#domain)) return this.#domain;
    if (this.#hassProvider.getEntityProp(this.#entityId, 'device_class') === 'duration' && !this.#attribute) return 'duration';

    return 'default';
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId);

    if (!this.#isValid) {
      this.#state = CARD.config.entity.state.notFound;
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
    this.#attribute = this.#attribute || ATTRIBUTE_MAPPING[this.#domain]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(attrValue);
      if (this.#domain === ATTRIBUTE_MAPPING.light.label && this.#attribute === ATTRIBUTE_MAPPING.light.attribute) {
        this.#value = (100 * this.#value) / 255;
      }
    } else {
      // Si l'attribut n'est pas trouvé, définir un comportement
      this.#value = 0;
      this.#isValid = false;
    }
  }
  _manageTimerEntity() {
    let duration = null;
    let elapsed = null;
    switch (this.#state) {
      case CARD.config.entity.state.idle: {
        elapsed = CARD.config.value.min;
        duration = CARD.config.value.max;
        break;
      }
      case CARD.config.entity.state.active: {
        const finished_at = new Date(this.#hassProvider.getEntityProp(this.#entityId, 'finishes_at')).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entityId, 'duration'));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case CARD.config.entity.state.paused: {
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
    return ATTRIBUTE_MAPPING[this.#domain]?.attribute ?? null;
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
    return [CARD.config.entity.type.light, CARD.config.entity.type.fan].includes(this.#domain);
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
      [CARD.config.entity.type.timer]: this.value?.state === CARD.config.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [CARD.config.entity.type.cover]: this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [CARD.config.entity.type.light]: this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      [CARD.config.entity.type.fan]: this.value > 0 ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [CARD.config.entity.type.climate]: this.#getClimateColor(),
      [CARD.config.entity.class.battery]: this.#getBatteryColor(),
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
  constructor(path = [], errorCode, severity = SEV.error, fallback = null, partialConfig = null, allErrors = []) {
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

      const result = {};
      const errors = [];

      for (const [key, validator] of Object.entries(schema)) {
        try {
          const validatedValue = validator(value[key], [...path, key]);
          if (validatedValue !== SKIP_PROPERTY) {
            result[key] = validatedValue;
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            // ✅ Appliquer fallback s'il existe
            if (error.fallback !== null && error.fallback !== undefined) {
              result[key] = error.fallback;
            }
            errors.push(error);
          } else {
            throw error;
          }
        }
      }

      // ✅ Si il y a des erreurs, lever une erreur avec le résultat complet comme fallback
      if (errors.length > 0) {
        throw new ValidationError(
          path, // chemin vers watermark
          'watermarkValidation', // code d'erreur
          SEV.warning, // sévérité
          result, // ✅ failback
          null, // pas de partialConfig ici
          errors, // toutes les erreurs individuelles
        );
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
      if (shouldPatch) result.icon_tap_action = { action: 'toggle' };
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
  const structInstance = {
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

  return structInstance;
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
        tap_action: types.tapActionWithDefault({ action: 'more-info' }),
        hold_action: types.tapActionWithDefault({ action: 'none' }),
        double_tap_action: types.tapActionWithDefault({ action: 'none' }),
        icon_tap_action: types.tapActionWithDefault({ action: 'none' }),
        icon_hold_action: types.tapActionWithDefault({ action: 'none' }),
        icon_double_tap_action: types.tapActionWithDefault({ action: 'none' }),
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
        tap_action: types.tapActionWithDefault({ action: 'more-info' }),
        hold_action: types.tapActionWithDefault({ action: 'none' }),
        double_tap_action: types.tapActionWithDefault({ action: 'none' }),
        icon_tap_action: types.tapActionWithDefault({ action: 'none' }),
        icon_hold_action: types.tapActionWithDefault({ action: 'none' }),
        icon_double_tap_action: types.tapActionWithDefault({ action: 'none' }),
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
    this._configParsed = this._yamlSchema.parse(config);

    this.#lastMsgConsole = null;
  }

  static #logDeprecatedOption(config) {
    if (config.navigate_to !== undefined)
      console.warn(`${CARD.meta.card.typeName.toUpperCase()} - navigate_to option is deprecated and has been removed.`);
    if (config.show_more_info !== undefined)
      console.warn(`${CARD.meta.card.typeName.toUpperCase()} - show_more_info option is deprecated and has been removed.`);
    if (['battery', 'cpu', 'memory'].includes(config.theme))
      console.warn(
        `${CARD.meta.card.typeName.toUpperCase()} - theme: ${
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

  // === PUBLIC API METHODS ===
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
      throw new Error('Invalid config');
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
    if (this._currentValue.state === CARD.config.entity.state.unavailable) return CARD.style.color.unavailable;
    if (this._currentValue.state === CARD.config.entity.state.notFound) return CARD.style.color.notFound;
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
    return this._hasAnyAction([this._configHelper.action.icon.tap, this._configHelper.action.icon.hold, this._configHelper.action.icon.doubleTap]);
  }
  get hasClickableCard() {
    return this._hasAnyAction([this._configHelper.action.card.tap, this._configHelper.action.card.hold, this._configHelper.action.card.doubleTap]);
  }
  get hasReversedSecondaryInfoRow() {
    return this.config.reverse_secondary_info_row; // === true
  }
  get hasVisibleShape() {
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape; // this.config.force_circular_background === true
  }

  get _hasDefaultShape() {
    return this._currentValue.hasShapeByDefault && this._hasAction(this._configHelper.action.icon.tap);
  }

  get _hasInteractiveShape() {
    return [
      CARD.interactions.action.navigate.action,
      CARD.interactions.action.url.action,
      CARD.interactions.action.moreInfo.action,
      CARD.interactions.action.assist.action,
      CARD.interactions.action.toggle.action,
      CARD.interactions.action.performAction.action,
    ].includes(this._configHelper.action.icon.tap);
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

  // skipcq: JS-0105
  _hasAction(action) {
    return action !== CARD.interactions.action.none.action;
  }

  _hasAnyAction(actions) {
    return actions.some((action) => this._hasAction(action));
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
      throw new Error('Invalid config');
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
    return this.#hasState(CARD.config.entity.state.unknown);
  }
  get isUnavailable() {
    return this.#hasState(CARD.config.entity.state.unavailable);
  }
  get isNotFound() {
    return this.#hasState(CARD.config.entity.state.notFound);
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
    if (this.hasStandardEntityError || (this._currentValue.isTimer && this._currentValue.value.state === CARD.config.entity.state.idle))
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
      const { paused, active } = CARD.config.entity.state;
      if (state === paused) return CARD.style.icon.badge.timer.paused;
      if (state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }
  get isActiveTimer() {
    return this._currentValue.isTimer && this._currentValue.state === CARD.config.entity.state.active;
  }
  get refreshSpeed() {
    const rawSpeed = this._currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    const roundedSpeed = Math.max(100, Math.round(clampedSpeed / 100) * 100);

    return roundedSpeed;
  }
  get show_more_info() {
    return [CARD.interactions.action.default, CARD.interactions.action.moreInfo.action].includes(this._configHelper.action.card.tap);
  }
  get hasVisibleShape() {
    return this._hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }
  get timerIsReversed() {
    return this._configHelper.config.reverse !== false && this._currentValue.value.state !== CARD.config.entity.state.idle;
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
  #debug = CARD.config.debug.ressourceManager;
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
  #debug = CARD.config.debug.ressourceManager;
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
 * - _jinjaFields.        → declare Jinja2 template
 * - validJinjaFields     → current valid jinja available / config
 * - _getJinjaHandlers() → handle Jinja2 template results
 *
 * @abstract
 * @extends HTMLElement
 */
class HACore extends HTMLElement {
  static version = VERSION;
  static _baseClass = CARD.meta.feature.typeName;
  static _cardStructure = new FeatureStructure();
  static _cardStyle = CARD_CSS;
  static _cardElement = CARD.htmlStructure.card.element;
  _debug = CARD.config.debug.card;
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
    console.log('innerHTML: ', this.innerHTML);

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
      this._cardView.config.center_zero ? 'center-zero' : null,
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
    return this._resourceManager?.has('ws-disconnected') && this._resourceManager?.has('ws-ready');
  }

  _unwatchWebSocket() {
    if (!this._resourceManager) return;
    this._resourceManager.remove('ws-disconnected');
    this._resourceManager.remove('ws-ready');
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
      'ws-disconnected',
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
      'ws-ready',
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
      async () => {
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
  static _baseClass = CARD.meta.card.typeName;
  static _cardStructure = new CardStructure();
  static _cardStyle = CARD_CSS;
  static _hasDisabledIconTap = false;
  static _hasDisabledBadge = false;
  _trendIcons = {
    up: 'mdi:chevron-up-box',
    down: 'mdi:chevron-down-box',
    flat: 'mdi:equal-box',
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
      this._cardView.config.center_zero ? 'center-zero' : null,
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

  get _hiddenComponents() {
    //
    // customize it
    //
    return [
      CARD.style.dynamic.hiddenComponent.icon,
      CARD.style.dynamic.hiddenComponent.name,
      CARD.style.dynamic.hiddenComponent.secondary_info,
      CARD.style.dynamic.hiddenComponent.progress_bar,
    ];
  }

  _handleHiddenComponents(jinjaContent = null) {
    if (jinjaContent === null && is.jinja(this._cardView.config.hide)) return;

    const items =
      jinjaContent
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? null;

    this._hiddenComponents.forEach((component) => {
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
              icon: curIcon || 'mdi:help-circle-outline',
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
    // + static _jinjaFields

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
    const isMdiIcon = content.includes('mdi:');

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
  _getStandardFields() { // deepsource: ignore=JS-0105
    return [];
  }

  _processStandardFields() {
    this._getStandardFields().forEach(({ className, value }) => {
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
    if(isCenterZero) {
      this._dom.toggleClass('inner', 'negative', isCenterZero && progressValue < 0);
      this._dom.toggleClass('inner', 'positive', isCenterZero && progressValue >= 0);
    }
    else {
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
  _getStandardFields() {
    return [
      {
        className: CARD.htmlStructure.elements.nameMain.class,
        value: this._cardView.name,
      },
      {
        className: CARD.htmlStructure.elements.secondaryInfoMain.class,
        value: this._cardView.secondaryInfoMain,
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
  static _baseClass = CARD.meta.card.typeName;

  // === STATIC METHODS ===

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
  }

  static getConfigElement() {
    return document.createElement(CARD.config.dev ? `${CARD.meta.card.editor}-dev` : CARD.meta.card.editor);
  }

  static getStubEntity(hass) {
    return Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) || 'sensor.temperature';
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.card.typeName}${CARD.config.dev ? '-dev' : ''}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }

  // === LAYOUT ===

  getCardSize() {
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  getLayoutOptions() {
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
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
  static _baseClass = CARD.meta.badge.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = CARD_CSS;

  static getConfigElement() {
    return document.createElement(CARD.config.dev ? `${CARD.meta.badge.editor}-dev` : CARD.meta.badge.editor);
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.badge.typeName}${CARD.config.dev ? '-dev' : ''}`,
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
  static _baseClass = CARD.meta.feature.typeName;
  static _cardElement = 'div';
  #firstHack = true;

  // === STATIC ===

  static getStubConfig() {
    return {
      type: `custom:${CARD.meta.feature.typeName}${CARD.config.dev ? '-dev' : ''}`,
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
    const targetRowSize = parseInt(getComputedStyle(cardContainer)?.getPropertyValue('--row-size')) - 1;

    let fixing = false;
    const fix = () => {
      if (fixing) return;
      const rowSize = getComputedStyle(cardContainer)?.getPropertyValue('--row-size');
      if (rowSize && parseInt(rowSize) > targetRowSize) {
        fixing = true;
        this._dom.setStyleNow('ext:card', 'overflow', 'hidden');
        this._dom.setStyleNow('ext:container', 'position', 'static');
        this._dom.setStyleNow('ext:features', 'position', 'static');
        this._dom.setStyleNow('ext:card-container', '--row-size', targetRowSize);
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
      type: `custom:${CARD.meta.template.typeName}`,
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
  static _baseClass = CARD.meta.template.typeName;
  _cardView = new CardTemplateView();

  static get _loggedMethods() {
    return [...super._loggedMethods, 'getCardSize', 'getLayoutOptions'];
  }

  static getConfigElement() {
    return document.createElement(`${CARD.meta.template.editor}${CARD.config.dev ? '-dev' : ''}`);
  }

  // === LAYOUT ===

  getCardSize() {
    const cardSize = this._cardView.cardSize;
    this._log.debug('getCardSize: ', cardSize);
    return cardSize;
  }

  getLayoutOptions() {
    const cardLayoutOptions = this._cardView.cardLayoutOptions;
    this._log.debug('getLayoutOptions: ', cardLayoutOptions);
    return cardLayoutOptions;
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
  static _baseClass = CARD.meta.badgeTemplate.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = CARD_CSS;
  _cardView = new BadgeTemplateView();

  setConfig(config) {
    super.setConfig(config);
    if (this.hass) setTimeout(() => this.refresh(), 0);
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.badgeTemplate.typeName}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}

/******************************************************************************************
 * 📦 CARD/BADGE EDITOR
 ******************************************************************************************/

/******************************************************************************************
 * 🛠️ ConfigUpdateEventHandler: Configuration Update Manager
 * ========================================================================================
 *
 * ✅ Handles dynamic updates to the configuration object of a custom card via UI events.
 *
 * 📌 Purpose:
 *   - Listens to input field changes from the editor UI.
 *   - Dispatches the appropriate update logic based on field type.
 *   - Ensures proper formatting, cleanup, and validation of config values.
 *
 * 🧠 Features:
 *   - Centralized mapping between input field IDs and handler functions.
 *   - Safely mutates or deletes config keys based on user input.
 *   - Supports multiple types of updates:
 *     - Text & basic fields
 *     - Numeric fields
 *     - Entity/value selectors
 *     - Toggle states
 *     - Complex interaction objects
 *
 * @class
 */
class ConfigUpdateEventHandler {
  #debug = CARD.config.debug.editor;
  #log = null;

  constructor(newConfig) {
    this.#log = initLogger(this, this.#debug, [
      'updateField',
      'updateNumericField',
      'updateMaxValueField',
      'updateInteractionField',
      'updateEntityOrValueField',
      'updateToggleField',
      'updateCircularField',
      'updateUnitField',
    ]);

    this.config = structuredClone(newConfig);

    // Lier les méthodes au contexte 'this' pour éviter les erreurs de binding
    this.updateFunctions = new Map([
      [EDITOR_INPUT_FIELDS.basicConfiguration.attribute.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.content.field.max_value_attribute.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.content.field.name.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.content.field.unit.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.bar_size.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.layout.name, this.updateField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.theme.name, this.updateField.bind(this)],

      [EDITOR_INPUT_FIELDS.content.field.decimal.name, this.updateNumericField.bind(this)],
      [EDITOR_INPUT_FIELDS.content.field.min_value.name, this.updateNumericField.bind(this)],

      [EDITOR_INPUT_FIELDS.content.field.max_value.name, this.updateMaxValueField.bind(this)],

      [EDITOR_INPUT_FIELDS.interaction.field.icon_tap_action.name, this.updateInteractionField.bind(this)],
      [EDITOR_INPUT_FIELDS.interaction.field.icon_double_tap_action.name, this.updateInteractionField.bind(this)],
      [EDITOR_INPUT_FIELDS.interaction.field.icon_hold_action.name, this.updateInteractionField.bind(this)],
      [EDITOR_INPUT_FIELDS.interaction.field.tap_action.name, this.updateInteractionField.bind(this)],
      [EDITOR_INPUT_FIELDS.interaction.field.double_tap_action.name, this.updateInteractionField.bind(this)],
      [EDITOR_INPUT_FIELDS.interaction.field.hold_action.name, this.updateInteractionField.bind(this)],

      [EDITOR_INPUT_FIELDS.basicConfiguration.entity.name, this.updateEntityOrValueField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.icon.name, this.updateEntityOrValueField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.bar_color.name, this.updateEntityOrValueField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.color.name, this.updateEntityOrValueField.bind(this)],

      [EDITOR_INPUT_FIELDS.theme.field.toggleBar.name, this.updateToggleField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.toggleIcon.name, this.updateToggleField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.toggleName.name, this.updateToggleField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.toggleValue.name, this.updateToggleField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.toggleSecondaryInfo.name, this.updateToggleField.bind(this)],

      [EDITOR_INPUT_FIELDS.theme.field.toggleCircular.name, this.updateCircularField.bind(this)],
      [EDITOR_INPUT_FIELDS.theme.field.toggleUnit.name, this.updateUnitField.bind(this)],
    ]);

    this.#log.debug('Loaded');
  }

  // === PUBLIC API METHODS ===

  updateConfig(changedEvent) {
    this.#log.debug('  📎 ', changedEvent);

    const targetId = changedEvent.target.id;

    if (this.updateFunctions.has(targetId)) {
      const updateFunction = this.updateFunctions.get(targetId);
      updateFunction.call(this, targetId, changedEvent);
    } else {
      throw new Error('Unknown case in message update');
    }
    if (
      changedEvent.target.id === EDITOR_INPUT_FIELDS.basicConfiguration.entity.name ||
      changedEvent.target.id === EDITOR_INPUT_FIELDS.content.field.max_value.name
    ) {
      const curAttribute =
        changedEvent.target.id === EDITOR_INPUT_FIELDS.basicConfiguration.entity.name
          ? EDITOR_INPUT_FIELDS.basicConfiguration.attribute.name
          : EDITOR_INPUT_FIELDS.content.field.max_value_attribute.name;
      const curEntity = new EntityOrValue();
      curEntity.value = changedEvent.target.value;
      if (!curEntity.hasAttribute) {
        delete this.config[curAttribute];
      }
      if (changedEvent.target.id === EDITOR_INPUT_FIELDS.basicConfiguration.entity.name && curEntity.unit && this.config.unit === null) {
        this.config.unit = curEntity.unit;
      }
    }

    return this.config;
  }

  updateField(targetId, changedEvent) {
    // FIX 2026.2: ha-selector -> detail.value,
    const newValue = changedEvent.detail?.value;

    if (is.nullishOrEmptyString(newValue)) {
      delete this.config[targetId];
    } else {
      this.config[targetId] = newValue;
    }
  }

  updateNumericField(targetId, changedEvent) {
    // FIX 2026.2: ha-selector -> detail.value,
    const newValue = changedEvent.detail?.value;

    if (isNaN(newValue)) {
      delete this.config[targetId];
    } else {
      this.config[targetId] = newValue;
    }
  }

  updateMaxValueField(targetId, changedEvent) {
    // FIX 2026.2: ha-selector -> detail.value,
    const newValue = changedEvent.detail?.value;

    if (is.numericString(newValue)) {
      this.config[targetId] = parseFloat(newValue);
    } else if (is.nonEmptyString(newValue)) {
      this.config[targetId] = newValue;
    } else {
      delete this.config[targetId];
    }
  }

  updateInteractionField(targetId, changedEvent) {
    this.config[targetId] = changedEvent.detail.value[targetId];
  }

  updateEntityOrValueField(targetId, changedEvent) {
    if (changedEvent?.detail?.value && is.nonEmptyString(changedEvent.detail.value[targetId])) {
      this.config[targetId] = changedEvent.detail.value[targetId];
    } else {
      delete this.config[targetId];
    }
  }

  updateToggleField(targetId, changedEvent) {
    if (is.jinja(this.config.hide)) return;
    const key = targetId.replace('toggle_', '');
    const newConfig = structuredClone(this.config);

    this.#log.debug(' 📌 *** CONFIG before ***:', JSON.stringify(this.config, null, 2));
    this.#log.debug(' 📌 *** NEWCONFIG before ***:', JSON.stringify(newConfig, null, 2));
    newConfig.hide = is.nonEmptyArray(newConfig.hide) ? [...newConfig.hide] : [];

    this.#log.debug(' 📌 *** NEWCONFIG (Hide Management) ***:', JSON.stringify(newConfig, null, 2));

    const isChecked = changedEvent.detail?.value ?? false;
    this.#log.debug(' 📌 *** key ***:', key);
    this.#log.debug(' 📌 *** is checked ***:', isChecked);

    if (isChecked) {
      newConfig.hide = newConfig.hide.filter((item) => item !== key);
    } else {
      if (!newConfig.hide.includes(key)) {
        newConfig.hide.push(key);
      }
    }

    if (newConfig.hide.length === 0) {
      delete newConfig.hide;
    }

    this.config = newConfig;
    this.#log.debug(' 📌 *** CONFIG after ***:', JSON.stringify(this.config, null, 2));
    this.#log.debug(' 📌 *** NEWCONFIG after ***:', JSON.stringify(newConfig, null, 2));
  }

  updateCircularField(targetId, changedEvent) {
    const isChecked = changedEvent.detail?.value ?? false;

    if (isChecked) {
      this.config.force_circular_background = true;
    } else {
      delete this.config.force_circular_background;
    }
  }

  updateUnitField(targetId, changedEvent) {
    const isChecked = changedEvent.detail?.value ?? false;

    if (!isChecked) {
      this.config.disable_unit = true;
    } else {
      delete this.config.disable_unit;
    }
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressCardEditor
 * ========================================================================================
 * ✅ Custom Editor for configuring the `EntityProgressCard`.
 *
 * 📌 Purpose:
 *
 * This class defines a custom web component responsible for rendering
 * a user interface in the Home Assistant Lovelace GUI editor. It allows
 * users to interactively configure the card's settings and manage
 * internal state and synchronization with Home Assistant entities.
 *
 * @inspired by Home Assistant component structure
 * @see https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts
 *
 * 🧠 Responsibilities:
 * - Dynamically build form elements based on a predefined schema.
 * - Sync form inputs with the YAML configuration.
 * - Listen to and handle UI changes and emit valid config objects.
 * - Manage DOM and event listener lifecycle.
 *
 * Core Concepts:
 * - Shadow DOM is used for encapsulation.
 * - Internal state is managed with private class fields (#).
 * - Entity attributes are automatically extracted to populate select fields.
 * - Supports both YAML and GUI editing modes.
 *
 * @class
 * @extends HTMLElement
 */
class EntityProgressCardEditor extends HTMLElement {
  static #debug = CARD.config.debug.editor;
  static _editorStyle = CARD_EDITOR_CSS;
  static _editorFields = EDITOR_INPUT_FIELDS;
  #log = null;
  #hassProvider = null;
  #resourceManager = null;
  #container = null;
  #config = {};
  #previous = { entity: null, max_value: null };
  #isRendered = false;
  #isYAML = false;
  #domElements = new Map();
  #accordionList = [];
  #accordionTitleList = [];
  #isListenersAttached = false;

  // === LIFECYCLE METHODS ===

  constructor() {
    super();
    this.#log = initLogger(this, EntityProgressCardEditor.#debug, [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'render',
      'toggleAccordion',
    ]);
    this.attachShadow({ mode: CARD.config.shadowMode });
    this.#hassProvider = HassProviderSingleton.getInstance();
    this.#log.debug('Loaded');
  }

  connectedCallback() {
    if (!this.#resourceManager) this.#resourceManager = new ResourceManager();
    if (this.#isRendered && !this.#isListenersAttached && this.#isYAML) {
      this.#addEventListener();
      this.#isListenersAttached = true;
      this.#isYAML = false;
    }
  }

  disconnectedCallback() {
    this.#resourceManager?.cleanup();
    this.#resourceManager = null;
    this.#isListenersAttached = false;
    this.#isYAML = true;
  }

  // === PUBLIC API METHODS ===

  set hass(hass) {
    if (!hass) return;

    if (!this.#hassProvider.hass || this.#hassProvider.hass.entities !== hass.entities) {
      this.#hassProvider.hass = hass;
    }
  }

  get hass() {
    return this.#hassProvider.hass;
  }

  setConfig(config) {
    this.#log.debug('  📎 config: ', config);
    if (!config) throw new Error('setConfig: invalid config');
    this.#config = { ...config };
    if (!this.#hassProvider.isValid) return;

    if (!this.#isRendered) {
      this.#domElements = new Map();
      this.#accordionList = [];
      this.#accordionTitleList = [];
      this.render();
      this.#isRendered = true;
      this.#isListenersAttached = false;
    }

    this.#log.debug('  📎 container GUI: ', this.#container);
    this.#log.debug('  📎 connected ?: ', this.isConnected);

    if (!this.isConnected) this.#isYAML = true; // YAML editor
    if (!this.#isListenersAttached && this.isConnected) {
      // GUI editor
      this.#addEventListener();
      this.#isListenersAttached = true;
    }
    this.#updateFields();
  }

  get editorStyle() {
    return this.constructor._editorStyle;
  }

  get editorFields() {
    return this.constructor._editorFields;
  }

  // === EDITOR BUILDING ===

  /**
   * Renders the editor interface for configuring the card's settings.
   *
   * @returns {void}
   */
  render() {
    const style = document.createElement(CARD.style.element);
    style.textContent = this.editorStyle;
    const fragment = document.createDocumentFragment();
    fragment.appendChild(style);
    this.#container = document.createElement(CARD.editor.fields.container.element);
    this.#container.classList.add(CARD.editor.fields.container.class);

    this.#renderFields(this.#container, this.editorFields.basicConfiguration);
    for (const section of Object.keys(this.editorFields)) {
      if (section === 'basicConfiguration') continue;
      this.#renderAccordion(this.#container, this.editorFields[section]);
    }

    fragment.appendChild(this.#container);
    this.shadowRoot.appendChild(fragment);
  }

  #renderAccordion(parent, inputFields) {
    const accordionItem = document.createElement(CARD.editor.fields.accordion.item.element);
    accordionItem.classList.add(CARD.editor.fields.accordion.item.class);
    this.#accordionList.push(accordionItem);

    const accordionTitle = document.createElement(CARD.editor.fields.accordion.title.element);
    this.#accordionTitleList.push(accordionTitle);
    accordionTitle.classList.add(CARD.editor.fields.accordion.title.class);
    const icon = document.createElement(CARD.editor.fields.accordion.icon.element);
    icon.setAttribute('icon', inputFields.title.icon);
    icon.classList.add(CARD.editor.fields.accordion.icon.class);
    accordionTitle.appendChild(icon);

    const title = document.createTextNode(this.#hassProvider.localize('editor.title')[inputFields.title.name]);
    accordionTitle.appendChild(title);

    const accordionArrow = document.createElement(CARD.editor.fields.accordion.arrow.element);
    accordionArrow.classList.add(CARD.editor.fields.accordion.arrow.class);
    accordionArrow.setAttribute('icon', CARD.editor.fields.accordion.arrow.icon);
    accordionTitle.appendChild(accordionArrow);
    accordionItem.appendChild(accordionTitle);

    const accordionContent = document.createElement(CARD.editor.fields.accordion.content.element);
    accordionContent.classList.add(CARD.editor.fields.accordion.content.class);

    this.#renderFields(accordionContent, inputFields.field);

    accordionItem.appendChild(accordionContent);
    parent.appendChild(accordionItem);
  }

  #renderFields(parent, inputFields) {
    Object.values(inputFields).forEach((field) => {
      this.#log.debug('#renderFields - field: ', field);
      parent.appendChild(
        this.#createField({
          name: field.name,
          label: this.#hassProvider.localize('editor.field')[field.name],
          type: field.type,
          isInGroup: field.isInGroup,
          width: field.width,
          schema: field.schema !== undefined ? field.schema : null,
        }),
      );
    });
  }

  #getSelectorForType(type) {
    const buildSelect = (opts) => ({
      select: { options: Object.entries(opts).map(([value, label]) => ({ value, label })), mode: 'dropdown' },
    });

    const options = this.#hassProvider.localize('editor.option');
    const selectors = {
      [CARD.editor.fields.default.type]: () => ({ text: { mode: 'box' } }),
      [CARD.editor.fields.number.type]: () => ({ number: {} }),
      [CARD.editor.fields.toggle.type]: () => ({ boolean: {} }),
      [CARD.editor.fields.decimal.type]: () => ({ number: { min: 0, max: 10, mode: 'box' } }),
      [CARD.editor.fields.attribute.type]: () => ({ attribute: { entity_id: this.#config.entity ?? '' } }),
      [CARD.editor.fields.max_value_attribute.type]: () => ({ attribute: { entity_id: this.#config.max_value ?? '' } }),
      [CARD.editor.fields.layout.type]: () => buildSelect(options.layout),
      [CARD.editor.fields.theme.type]: () => buildSelect(options.theme),
      [CARD.editor.fields.bar_size.type]: () => buildSelect(options.bar_size),
    };

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  #createField({ name, label, type, required, isInGroup, width, schema = null }) {
    this.#log.debug('#createField()');

    const isSelector = schema === null;
    const inputElement = document.createElement(isSelector ? 'ha-selector' : CARD.editor.fields.tap_action.element);

    if (width !== undefined) inputElement.style.width = width;
    if (isInGroup) inputElement.classList.add(isInGroup);

    Object.assign(inputElement, {
      id: name,
      hass: this.#hassProvider.hass,
      ...(isSelector
        ? {
            label, //label: label,
            value: this.#config[name] ?? '',
            selector: this.#getSelectorForType(type),
            required, //required: required,
          }
        : {
            schema, //schema: schema,
            computeLabel: () => label,
            data: {},
          }),
    });

    this.#domElements.set(name, inputElement);
    return inputElement;
  }

  // === EDITOR EVENT ===

  #addEventListener() {
    for (const [name, element] of this.#domElements) {
      if (element.localName === 'ha-selector' || element.localName === 'ha-form') {
        this.#resourceManager.addEventListener(element, 'value-changed', this.#onChanged.bind(this), { passive: true }, `value-changed-${name}`);
      }
    }

    this.#accordionTitleList.forEach((title, index) => {
      this.#resourceManager.addEventListener(
        title,
        CARD.interactions.event.click,
        () => {
          this.toggleAccordion(index);
        },
        { passive: true },
        `accordionTitle-${index}`,
      );
    });
  }
  #onChanged(changedEvent) {
    this.#log.debug('#onChanged()');
    this.#log.debug('  📎 ', changedEvent);

    const configUpdateEventHandler = new ConfigUpdateEventHandler(Object.assign({}, this.#config));
    const newConfig = configUpdateEventHandler.updateConfig(changedEvent);

    this.#sendNewConfig(newConfig);
  }

  #sendNewConfig(newConfig) {
    this.#log.debug('#sendNewConfig()');
    let finalConfig = newConfig;
    if (newConfig.grid_options) {
      const { grid_options, ...rest } = newConfig;
      finalConfig = { ...rest, grid_options };
    }

    this.#log.debug('📎 Config: ', finalConfig);

    const messageEvent = new CustomEvent(CARD.interactions.event.configChanged, {
      detail: { config: finalConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }

  // === EDITOR REFRESH ===

  #updateFields() {
    this.#log.debug('#updateFields()');

    const excludeKeys = new Set([CARD.editor.keyMappings.attribute, CARD.editor.keyMappings.max_value_attribute]);
    const updates = [];

    for (const [key, element] of this.#domElements) {
      if (excludeKeys.has(key) || key.startsWith('toggle_')) continue;

      if (element.localName === 'ha-selector') {
        const update = this.#prepareStandardFieldUpdate(key, element);
        if (update) updates.push(update);
      } else if (element.localName === 'ha-form') {
        const update = this.#prepareHAFormUpdate(element, key, this.#config[key]);
        if (update) updates.push(update);
      }
    }

    // Apply all updates in batch
    updates.forEach((update) => update());

    // Handle special fields
    this.#updateSpecialFields();
  }

  #prepareStandardFieldUpdate(key, element) {
    const newValue = has.own(this.#config, key) ? this.#config[key] : '';
    const currentValue = element.value;
    const shouldUpdate = is.string(currentValue) ? currentValue !== String(newValue) : currentValue !== newValue;

    if (shouldUpdate) {
      this.#log.debug('🆕 updateFields - update: ', [key, newValue]);
      return () => {
        element.value = newValue;
      };
    }
    return null;
  }

  #prepareHAFormUpdate(form, key, newValue) {
    const currentData = form.data;
    const needsUpdate =
      currentData === undefined ||
      (newValue !== undefined && currentData[key] !== newValue) ||
      (newValue === undefined && currentData[key] !== undefined);

    if (needsUpdate) {
      this.#log.debug('🆕 updateFields - update: ', [key, newValue]);
      return () => {
        form.data = {
          ...currentData,
          [key]: newValue,
        };
      };
    }
    return null;
  }

  #updateSpecialFields() {
    // Theme toggle
    this.#toggleFieldDisable(CARD.editor.keyMappings.theme, this.#config.theme !== undefined);

    // Attribute updates
    const entityHasAttribute = this.#updateAttributeFromEntity('entity', 'attribute');
    this.#toggleFieldDisable(this.editorFields.basicConfiguration.attribute.isInGroup, !entityHasAttribute);

    const maxValueHasAttribute = this.#updateAttributeFromEntity('max_value', 'max_value_attribute');
    this.#toggleFieldDisable(this.editorFields.content.field.max_value_attribute.isInGroup, !maxValueHasAttribute);

    // Toggle fields
    this.#updateToggleFields();
  }

  #toggleFieldDisable(key, disable) {
    this.#container.classList.toggle(`${CARD.style.dynamic.hide}-${key}`, disable);
  }

  /**
   * Updates the list of available attributes for a given entity in the corresponding selector.
   * When the entity changes, updates the options and selects a default attribute if necessary.
   *
   * @param {string} entity - The key name of the entity in the config (e.g., 'entity' or 'max_value').
   * @param {string} attribute - The key name of the attribute to update.
   * @returns {boolean} - Returns true if the entity has attributes.
   */
  #updateAttributeFromEntity(entity, attribute) {
    this.#log.debug('#updateAttributeFromEntity()');

    const curEntity = new EntityOrValue();
    curEntity.value = this.#config[entity];

    const targetElement = this.#domElements.get(attribute);
    if (!targetElement) return curEntity.hasAttribute;

    // Mettre à jour entity_id si l'entité a changé
    if (this.#previous[entity] !== this.#config[entity]) {
      this.#previous[entity] = this.#config[entity];
      targetElement.selector = { attribute: { entity_id: this.#config[entity] ?? '' } };
    }
    // Sync la valeur courante
    const defaultValue = this.#config[attribute] ?? curEntity.defaultAttribute ?? '';
    targetElement.value = defaultValue;

    return curEntity.hasAttribute;
  }

  #updateToggleFields() {
    const hide = this.#config.hide || [];
    const isJinjaHide = is.jinja(this.#config.hide);

    const toggleMappings = {
      toggle_force_circular_background: { value: this.#config.force_circular_background ?? false },
      toggle_unit: { value: !this.#config.disable_unit },
      toggle_icon: { value: !hide.includes('icon'), disabled: isJinjaHide },
      toggle_name: { value: !hide.includes('name'), disabled: isJinjaHide },
      toggle_value: { value: !hide.includes('value'), disabled: isJinjaHide },
      toggle_secondary_info: { value: !hide.includes('secondary_info'), disabled: isJinjaHide },
      toggle_progress_bar: { value: !hide.includes('progress_bar'), disabled: isJinjaHide },
    };

    const toggleUpdates = [];
    for (const [toggleKey, { value, disabled = false }] of Object.entries(toggleMappings)) {
      const toggle = this.#domElements.get(toggleKey);
      if (!toggle) continue;
      if (toggle.value !== value) toggleUpdates.push(() => (toggle.value = value));
      if (toggle.disabled !== disabled) toggleUpdates.push(() => (toggle.disabled = disabled));
    }

    toggleUpdates.forEach((update) => update());
  }
  // === ACCORDION ANIMATION ===

  toggleAccordion(index) {
    const accordion = this.#accordionList[index];
    const panel = accordion.querySelector('.accordion-content');
    if (!panel) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isExpanding = !accordion.classList.contains('expanded');

    // --- reduce mode
    if (prefersReducedMotion) {
      if (isExpanding) {
        accordion.classList.add('expanded');
        Object.assign(panel.style, {
          display: 'flex',
          maxHeight: 'none',
          paddingTop: '30px',
          paddingBottom: '30px',
          opacity: '1',
        });
      } else {
        accordion.classList.remove('expanded');
        Object.assign(panel.style, {
          display: '',
          maxHeight: '',
          paddingTop: '',
          paddingBottom: '',
          opacity: '',
        });
      }
      return; // stop
    }

    // Clean up existing animation
    this.#resourceManager.remove(`accordionTransition-${index}`);

    if (isExpanding) {
      this.#expandAccordion(accordion, panel, index);
    } else {
      this.#collapseAccordion(accordion, panel, index);
    }
  }

  #expandAccordion(accordion, panel, index) {
    // Set initial state
    Object.assign(panel.style, {
      display: 'flex',
      maxHeight: '0',
      paddingTop: '0',
      paddingBottom: '0',
      opacity: '0',
    });

    // Force reflow
    const _ = panel.offsetHeight; // eslint-disable-line no-unused-vars

    accordion.classList.add('expanded');

    // Animate to final state
    requestAnimationFrame(() => {
      Object.assign(panel.style, {
        maxHeight: `${panel.scrollHeight}px`,
        paddingTop: '30px',
        paddingBottom: '30px',
        opacity: '1',
      });
    });

    this.#addAccordionTransitionListener(panel, index, () => {
      panel.style.maxHeight = 'none';
    });
  }

  #collapseAccordion(accordion, panel, index) {
    accordion.classList.add('collapsing');

    // Set current height
    panel.style.maxHeight = `${panel.scrollHeight}px`;
    const _ = panel.offsetHeight; // eslint-disable-line no-unused-vars

    requestAnimationFrame(() => {
      Object.assign(panel.style, {
        maxHeight: '0',
        paddingTop: '0',
        paddingBottom: '0',
        opacity: '0',
      });
    });

    this.#addAccordionTransitionListener(panel, index, () => {
      accordion.classList.remove('expanded', 'collapsing');

      // Reset styles
      Object.assign(panel.style, {
        display: '',
        maxHeight: '',
        paddingTop: '',
        paddingBottom: '',
        opacity: '',
      });
    });
  }

  #addAccordionTransitionListener(panel, index, callback) {
    this.#resourceManager.addEventListener(
      panel,
      'transitionend',
      (e) => {
        if (e.target !== panel) return;
        callback();
        this.#resourceManager.remove(`accordionTransition-${index}`);
      },
      { passive: true },
      `accordionTransition-${index}`,
    );
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressBadgeEditor
 * ========================================================================================
 * ✅ Manage the badge editor.
 *
 * This class extends `EntityProgressCardEditor` and provides a specialized version of the editor
 * for a progress badge (circular badge), with a reduced set of configurable fields.
 *
 * It is used in card editor interfaces, where the user can configure the display and behavior
 * options of a badge that represents the state of an entity.
 *
 * @class
 * @extends EntityProgressCardEditor
 */
class EntityProgressBadgeEditor extends EntityProgressCardEditor {
  static _editorStyle = `
   ${CARD_EDITOR_CSS}

   .hide {
     display: none;
   }`;
  static _editorFields = (() => {
    const baseFields = structuredClone(EntityProgressCardEditor._editorFields);
    const hide = 'hide';
    const fieldsToHide = ['icon_tap_action', 'icon_hold_action', 'icon_double_tap_action', 'toggleCircular', 'bar_size', 'layout'];

    fieldsToHide.forEach((curField) => {
      if (baseFields.interaction?.field?.[curField]) {
        baseFields.interaction.field[curField].isInGroup = hide;
      }
      if (baseFields.theme?.field?.[curField]) {
        baseFields.theme.field[curField].isInGroup = hide;
      }
    });

    return baseFields;
  })();
}

const TEMPLATE_EDITOR_FIELDS = {
  // === Entity & Data ===
  entity: { name: 'entity', type: 'entity' },
  name: { name: 'name', type: 'template' },
  secondary: { name: 'secondary', type: 'template' },
  percent: { name: 'percent', type: 'template' },

  // === Appearance ===
  icon: { name: 'icon', type: 'template' },
  color: { name: 'color', type: 'template' },
  bar_color: { name: 'bar_color', type: 'template' },
  bar_size: { name: 'bar_size', type: 'bar_size' },
  bar_orientation: { name: 'bar_orientation', type: 'bar_orientation' },
  bar_effect: { name: 'bar_effect', type: 'template' },
  bar_position: { name: 'bar_position', type: 'bar_position' },
  bar_single_line: { name: 'bar_single_line', type: 'toggle' },
  bar_max_width: { name: 'bar_max_width', type: 'default' },
  layout: { name: 'layout', type: 'layout' },
  min_width: { name: 'min_width', type: 'default' },
  height: { name: 'height', type: 'default' },
  frameless: { name: 'frameless', type: 'toggle' },
  marginless: { name: 'marginless', type: 'toggle' },
  reverse_secondary_info_row: { name: 'reverse_secondary_info_row', type: 'toggle' },
  force_circular_background: { name: 'force_circular_background', type: 'toggle' },
  center_zero: { name: 'center_zero', type: 'toggle' },
  trend_indicator: { name: 'trend_indicator', type: 'toggle' },
  text_shadow: { name: 'text_shadow', type: 'toggle' },
  hide: { name: 'hide', type: 'template' },

  // === Badge ===
  badge_icon: { name: 'badge_icon', type: 'template' },
  badge_color: { name: 'badge_color', type: 'template' },
};

class EntityProgressTemplateEditor extends HTMLElement {
  static _editorStyle = CARD_EDITOR_CSS;
  static _editorFields = TEMPLATE_EDITOR_FIELDS;

  #hassProvider = null;
  #resourceManager = null;
  #config = {};
  #domElements = new Map();
  #isRendered = false;
  #isYAML = false;
  #isListenersAttached = false;

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  connectedCallback() {
    if (!this.#resourceManager) this.#resourceManager = new ResourceManager();
    if (this.#isRendered && !this.#isListenersAttached && this.#isYAML) {
      this.#addEventListener();
      this.#isListenersAttached = true;
      this.#isYAML = false;
    }
  }

  disconnectedCallback() {
    this.#resourceManager?.cleanup();
    this.#resourceManager = null;
    this.#isListenersAttached = false;
    this.#isYAML = true;
  }

  set hass(hass) {
    if (!hass) return;
    if (!this.#hassProvider.hass || this.#hassProvider.hass.entities !== hass.entities) {
      this.#hassProvider.hass = hass;
    }
  }

  get hass() {
    return this.#hassProvider.hass;
  }

  setConfig(config) {
    if (!config) throw new Error('setConfig: invalid config');
    this.#config = { ...config };
    if (!this.#hassProvider.isValid) return;

    if (!this.#isRendered) {
      this.#domElements = new Map();
      this.render();
      this.#isRendered = true;
      this.#isListenersAttached = false;
    }

    if (!this.isConnected) this.#isYAML = true;
    if (!this.#isListenersAttached && this.isConnected) {
      this.#addEventListener();
      this.#isListenersAttached = true;
    }
    this.#updateFields();
  }

  render() {
    const style = document.createElement(CARD.style.element);
    style.textContent = this.constructor._editorStyle;

    const container = document.createElement('div');
    container.classList.add('editor-container');

    Object.values(this.constructor._editorFields).forEach((field) => {
      container.appendChild(this.#createField(field));
    });

    const fragment = document.createDocumentFragment();
    fragment.appendChild(style);
    fragment.appendChild(container);
    this.shadowRoot.appendChild(fragment);
  }

  #getSelectorForType(type) {
    const selectors = {
      entity: () => ({ entity: {} }),
      template: () => ({ template: {} }),
      toggle: () => ({ boolean: {} }),
      default: () => ({ text: { mode: 'box' } }),
      bar_size: () => ({ select: { options: Object.values(CARD.style.bar.sizeOptions).map((e) => ({ value: e.label, label: e.label })) } }),
      bar_orientation: () => ({ select: { options: Object.keys(CARD.style.dynamic.progressBar.orientation).map((v) => ({ value: v, label: v })) } }),
      bar_position: () => ({ select: { options: ['default', 'below', 'top', 'bottom', 'overlay'].map((v) => ({ value: v, label: v })) } }),
      layout: () => ({ select: { options: Object.values(CARD.layout.orientations).map((e) => ({ value: e.label, label: e.label })) } }),
    };

    return (selectors[type] ?? (() => ({ text: {} })))();
  }

  #createField(field) {
    const isAction = field.schema !== undefined;
    const el = document.createElement(isAction ? 'ha-form' : 'ha-selector');

    Object.assign(el, {
      id: field.name,
      hass: this.#hassProvider.hass,
      ...(isAction
        ? { schema: field.schema, computeLabel: () => this.#hassProvider.localize('editor.field')[field.name], data: {} }
        : {
            label: this.#hassProvider.localize('editor.field')[field.name],
            value: this.#config[field.name] ?? '',
            selector: this.#getSelectorForType(field.type, field.name),
          }),
    });

    this.#domElements.set(field.name, el);
    return el;
  }

  #addEventListener() {
    for (const [name, element] of this.#domElements) {
      this.#resourceManager.addEventListener(element, 'value-changed', this.#onChanged.bind(this), { passive: true }, `value-changed-${name}`);
    }
  }

  #onChanged(event) {
    const { value } = event.detail;
    const key = event.target.id;

    this.#sendNewConfig({ ...this.#config, [key]: value });
  }

  #sendNewConfig(newConfig) {
    this.dispatchEvent(
      new CustomEvent(CARD.interactions.event.configChanged, {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #updateFields() {
    for (const [key, element] of this.#domElements) {
      if (element.localName === 'ha-selector') {
        const newValue = key in this.#config ? this.#config[key] : '';
        if (element.value !== newValue) element.value = newValue;
      } else if (element.localName === 'ha-form') {
        const newValue = this.#config[key];
        if (element.data?.[key] !== newValue) {
          element.data = { ...element.data, [key]: newValue };
        }
      }
    }
  }
}

/******************************************************************************************
 * 🔧 Register components
 */

RegistrationHelper.registerCard(CARD.meta.card, EntityProgressCard, EntityProgressCardEditor);
RegistrationHelper.registerBadge(CARD.meta.badge, EntityProgressBadge, EntityProgressBadgeEditor);
RegistrationHelper.registerCard(CARD.meta.template, EntityProgressTemplateCard, EntityProgressTemplateEditor);
RegistrationHelper.registerBadge(CARD.meta.badgeTemplate, EntityProgressTemplateBadge);
RegistrationHelper.registerCardFeature(CARD.meta.feature, EntityProgressFeatures);

/******************************************************************************************
 * 🔧 Show module info
 */

console.groupCollapsed(CARD.console.message, CARD.console.css);
console.log(CARD.console.link);
console.groupEnd();
