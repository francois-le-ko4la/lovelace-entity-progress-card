/**
 * @fileoverview
 *
 * This file defines a custom element `EntityProgressCard` for displaying
 * progress or status information about an entity in Home Assistant.
 * The card displays visual elements like icons, progress bars, and other dynamic content
 * based on the state of the entity and user configurations.
 *
 * Key Features:
 * - Dynamic content update (e.g., progress bar, icons) based on entity state.
 * - Support for theme and layout customization.
 * - Error handling for missing or invalid entities.
 * - Configuration options for various card elements.
 *
 * More informations here: https://github.com/francois-le-ko4la/lovelace-entity-progress-card/
 *
 * @author ko4la
 * @version 1.5.0-RC1
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION = '1.5.0-RC1';
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
    },
    badge: {
      typeName: 'entity-progress-badge',
      editor: 'entity-progress-badge-editor',
    },
    badgeTemplate: {
      typeName: 'entity-progress-badge-template',
      name: 'Entity Progress Badge (Template)',
      description: 'A cool custom card to show current entity status with a progress bar.',
    },
  },
  config: {
    dev: true,
    debug: { card: false, editor: false, interactionHandler: false, ressourceManager: false, hass: false },
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
      belowContainer: { element: 'div', class: 'below-container' },
      left: { element: 'div', class: 'left' },
      right: { element: 'div', class: 'right' },
    },
    elements: {
      icon: { element: 'div', class: 'icon' },
      shape: { element: 'shape', class: 'shape' },
      nameGroup: { element: 'div', class: 'name-group' },
      nameCombined: { element: 'span', class: 'name-combined' },
      name: { element: 'span', class: 'name' },
      nameCustomInfo: { element: 'span', class: 'name-custom-info' },
      secondaryInfo: { element: 'div', class: 'secondary-info' },
      detailGroup: { element: 'div', class: 'secondary-info-detail-group' },
      detailCombined: { element: 'span', class: 'secondary-info-detail-combined' },
      stateAndProgressInfo: { element: 'span', class: 'state-and-progress-info' },
      customInfo: { element: 'span', class: 'secondary-info-custom-info' },
      progressBar: {
        container: { element: 'div', class: 'progress-bar-container' },
        bar: { element: 'div', class: 'progress-bar' },
        inner: { element: 'div', class: 'progress-bar-inner' },
        positiveInner: { element: 'div', class: 'progress-bar-positive-inner' },
        negativeInner: { element: 'div', class: 'progress-bar-negative-inner' },
        zeroMark: { element: 'div', class: 'progress-bar-low-zero' },
        lowWatermark: { element: 'div', class: 'progress-bar-low-wm' },
        highWatermark: { element: 'div', class: 'progress-bar-high-wm' },
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
        minWidth: { var: '--epb-card-min-width' },
        height: { var: '--epb-card-height' },
      },
      badge: {
        color: { var: '--epb-badge-color', default: 'var(--orange-color)' },
        backgroundColor: { var: '--epb-badge-bgcolor', default: 'white' },
      },
      iconAndShape: {
        color: { var: '--epb-icon-and-shape-color', default: 'var(--state-icon-color)' },
        icon: { size: { var: '--epb-icon-size' } },
        shape: { size: { var: '--epb-shape-size' } },
      },
      progressBar: {
        color: { var: '--epb-progress-bar-color', default: 'var(--state-icon-color)' },
        size: { var: '--epb-progress-bar-size', default: '0%' },
        pSize: { var: '--epb-progress-bar-psize', default: '0%' },
        nSize: { var: '--epb-progress-bar-nsize', default: '0%' },
        background: { var: '--epb-progress-bar-background-color' },
        orientation: { rtl: 'rtl-orientation', ltr: 'ltr-orientation' },
        effect: {
          radius: { label: 'radius', class: 'progress-bar-effect-radius' },
          glass: { label: 'glass', class: 'progress-bar-effect-glass' },
          gradient: { label: 'gradient', class: 'progress-bar-effect-gradient' },
          shimmer: { label: 'shimmer', class: 'progress-bar-effect-shimmer' },
        },
      },
      watermark: {
        low: { value: { var: '--epb-low-watermark-value', default: 20 }, color: { var: '--epb-low-watermark-color', default: 'red' } },
        high: { value: { var: '--epb-high-watermark-value', default: 80 }, color: { var: '--epb-high-watermark-color', default: 'red' } },
        lineSize: { var: '--epb-watermark-line-size' },
        opacity: { var: '--epb-watermark-opacity-value' },
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
      attribute: { type: 'attribute', element: 'ha-select' },
      max_value_attribute: { type: 'max_value_attribute', element: 'ha-select' },
      icon: { type: 'icon', element: 'ha-form' },
      layout: { type: 'layout', element: 'ha-select' },
      bar_size: { type: 'bar_size', element: 'ha-select' },
      tap_action: { type: 'tap_action', element: 'ha-form' },
      double_tap_action: { type: 'double_tap_action', element: 'ha-form' },
      hold_action: { type: 'hold_action', element: 'ha-form' },
      icon_tap_action: { type: 'icon_tap_action', element: 'ha-form' },
      icon_double_tap_action: { type: 'icon_double_tap_action', element: 'ha-form' },
      icon_hold_action: { type: 'icon_hold_action', element: 'ha-form' },
      theme: { type: 'theme', element: 'ha-select' },
      color: { type: 'color', element: 'ha-form' },
      number: { type: 'number', element: 'ha-textfield' },
      default: { type: 'text', element: 'ha-textfield' },
      listItem: { type: 'list item', element: 'mwc-list-item' },
      iconItem: { element: 'ha-icon', attribute: 'icon', class: 'editor-icon-list' },
      select: { element: 'ha-select' },
      toggle: { type: 'toggle', element: 'ha-switch', class: 'editor-toggle' },
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
      { min: -30, max: -15, icon: 'mdi:thermometer', color: 'var(--dark-blue-color)' },
      { min: -15, max: -2, icon: 'mdi:thermometer', color: 'var(--blue-color)' },
      { min: -2, max: 2, icon: 'mdi:thermometer', color: 'var(--light-blue-color)' },
      { min: 2, max: 8, icon: 'mdi:thermometer', color: 'var(--cyan-color)' },
      { min: 8, max: 16, icon: 'mdi:thermometer', color: 'var(--teal-color)' },
      { min: 16, max: 18, icon: 'mdi:thermometer', color: 'var(--green-teal-color)' },
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
  debug: 'debug'
};

const LANGUAGES = {
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
          '': '',
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
        type: CARD.editor.fields.number.type,
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
        width: '100%',
        isInGroup: null,
      },
      toggleName: {
        name: 'toggle_name',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        isInGroup: null,
      },
      toggleValue: {
        name: 'toggle_value',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        isInGroup: null,
      },
      toggleUnit: {
        name: 'toggle_unit',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        isInGroup: null,
      },
      toggleSecondaryInfo: {
        name: 'toggle_secondary_info',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        isInGroup: null,
      },
      toggleBar: {
        name: 'toggle_progress_bar',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        isInGroup: null,
      },
      toggleCircular: {
        name: 'toggle_force_circular_background',
        type: CARD.editor.fields.toggle.type,
        width: '100%',
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

const FIELD_OPTIONS = {
  theme: [
    {
      value: '',
      icon: 'mdi:cancel',
    },
    {
      value: 'optimal_when_low',
      icon: 'mdi:arrow-collapse-down',
    },
    {
      value: 'optimal_when_high',
      icon: 'mdi:arrow-collapse-up',
    },
    {
      value: 'light',
      icon: 'mdi:lightbulb',
    },
    {
      value: 'temperature',
      icon: 'mdi:thermometer',
    },
    {
      value: 'humidity',
      icon: 'mdi:water-percent',
    },
    {
      value: 'pm25',
      icon: 'mdi:air-filter',
    },
    {
      value: 'voc',
      icon: 'mdi:air-filter',
    },
  ],
  bar_size: [
    {
      value: CARD.style.bar.sizeOptions.small.label,
      icon: CARD.style.bar.sizeOptions.small.mdi,
    },
    {
      value: CARD.style.bar.sizeOptions.medium.label,
      icon: CARD.style.bar.sizeOptions.medium.mdi,
    },
    {
      value: CARD.style.bar.sizeOptions.large.label,
      icon: CARD.style.bar.sizeOptions.large.mdi,
    },
    {
      value: CARD.style.bar.sizeOptions.xlarge.label,
      icon: CARD.style.bar.sizeOptions.xlarge.mdi,
    },
  ],
  layout: [
    {
      value: CARD.layout.orientations.horizontal.label,
      icon: CARD.layout.orientations.horizontal.mdi,
    },
    {
      value: CARD.layout.orientations.vertical.label,
      icon: CARD.layout.orientations.vertical.mdi,
    },
  ],
};

const ATTRIBUTE_MAPPING = {
  cover: { label: 'cover', attribute: 'current_position' },
  light: { label: 'light', attribute: 'brightness' },
  fan: { label: 'fan', attribute: 'percentage' },
};

const CARD_CSS = `
:host {
  /* === SPACING VARIABLES === */
  --epb-gap-default: 10px;
  --epb-gap-entities: 16px;
  --epb-padding-default: 10px;
  
  /* === SIZE VARIABLES === */
  --epb-shape-default-size: 36px;
  --epb-icon-default-size: 24px;
  --epb-entities-shape-size: 40px;
  --epb-badge-size: 16px;
  --epb-badge-icon-size: 12px;
  --epb-badge-offset: -3px;
  --epb-progress-size-s: 8px;
  --epb-progress-size-m: 12px;
  --epb-progress-size-l: 16px;
  --epb-progress-size-xl: 42px;
  
  /* === HEIGHT VARIABLES === */
  --epb-name-height: 20px;
  --epb-detail-height: 16px;
  --epb-entities-height: 22.4px;
  --epb-entities-card-min-height: 44.8px;
  --epb-vertical-name-large-height: 18px;
  --epb-progress-container-height: 16px;
  
  /* === COLOR OPACITY VARIABLES === */
  --epb-shape-opacity: 20%;
  --epb-hover-opacity: 4%;
  --epb-active-opacity: 15%;
  --epb-icon-hover-opacity: 40%;
  --epb-card-hover-mix: 96%;
  --epb-card-active-mix: 85%;
  
  /* === TRANSITION VARIABLES === */
  --epb-progress-transition-width: 0.3s ease;
  --epb-click-transition-background: 0.5s ease;
  
  /* === TYPOGRAPHY VARIABLES === */
  --epb-letter-spacing-name: 0.1px;
  --epb-letter-spacing-detail: 0.4px;
  
  /* === LAYOUT VARIABLES === */
  --epb-detail-max-width: 60%;
  --epb-detail-min-width: 45px;
  --epb-vertical-gap: 1px;

}

 /* === BASE CARD STYLES === */
${CARD.htmlStructure.card.element} {
  height: var(${CARD.style.dynamic.card.height.var}, 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--epb-padding-default);
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  font-family: var(--ha-font-family-body);
  -moz-osx-font-smoothing: var(--ha-font-smoothing);
  -webkit-font-smoothing: antialiased;
  min-width: var(${CARD.style.dynamic.card.minWidth.var}, 100%);
}

/* type-picture-elements integration */

.type-picture-elements {
  min-width: var(${CARD.style.dynamic.card.minWidth.var}, 200px);
}

/* === FRAMELESS & ENTITIES STYLES === */
.type-entities,
.type-custom-vertical-stack-in-card,
.${CARD.style.dynamic.frameless.class} {
  background: transparent;
  border: none !important;
  box-shadow: none !important;
}

.type-entities {
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  transition: none !important;
}

/* === MAIN CONTAINER === */
.${CARD.htmlStructure.sections.container.class} {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--epb-gap-default);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.below-container {
  flex-basis: 100%;
  width: 100%;
  display: flex;
  overflow: hidden;
  height: var(--epb-progress-size-xl);
}

.horizontal.xlarge .right  {
  width: calc(100% - 56px);
}
.xlarge .progress-bar-container {
  height: var(--epb-progress-size-xl);
}

.horizontal.xlarge .container {
  flex-wrap: wrap;
  overflow: unset;
  row-gap: 7px;
}

.type-entities .${CARD.htmlStructure.sections.container.class} {
  gap: var(--epb-gap-entities);
  min-height: var(--epb-entities-card-min-height) !important;
}

/* === LAYOUT ORIENTATIONS === */
.${CARD.htmlStructure.sections.container.class} {
  height: var(${CARD.style.dynamic.card.height.var}, unset);
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.container.class} {
  min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.vertical.minHeight});
  flex-direction: column;
}

.${CARD.layout.orientations.horizontal.label} .${CARD.htmlStructure.sections.container.class} {
  min-height: var(${CARD.style.dynamic.card.height.var}, ${CARD.layout.orientations.horizontal.minHeight});
  flex-direction: row;
}

/* === LEFT SECTION (ICON & SHAPE) === */
.${CARD.htmlStructure.sections.left.class} {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--epb-shape-size, var(--epb-shape-default-size));
  height: var(--epb-shape-size, var(--epb-shape-default-size));
  flex-shrink: 0;
}

.type-entities .${CARD.htmlStructure.sections.left.class} {
  width: var(--epb-shape-size, var(--epb-entities-shape-size)) !important;
  height: var(--epb-shape-size, var(--epb-entities-shape-size)) !important;
}

/* === SHAPE & ICON === */
.${CARD.htmlStructure.elements.shape.class} {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--epb-shape-size, var(--epb-shape-default-size));
  height: var(--epb-shape-size, var(--epb-shape-default-size));
  border-radius: 50%;
  background-color: color-mix(in srgb, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) var(--epb-shape-opacity), transparent);
}

.${CARD.htmlStructure.elements.icon.class} {
  width: var(--epb-icon-size, var(--epb-icon-default-size));
  height: var(--epb-icon-size, var(--epb-icon-default-size));
  color: var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default});
}

.custom-icon-img {
  width: var(--epb-icon-size, var(--epb-icon-default-size));
  height: var(--epb-icon-size, var(--epb-icon-default-size));
  border-radius: 50%;
  object-fit: cover;
}  

/* === RIGHT SECTION (TEXT CONTENT) === */
.${CARD.htmlStructure.sections.right.class} {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  width: 100%;
}

/* === TEXT ELEMENTS === */

.${CARD.htmlStructure.elements.nameGroup.class},
.${CARD.htmlStructure.elements.detailGroup.class} {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.${CARD.htmlStructure.elements.nameGroup.class} {
  width: 100%;
  height: var(--epb-name-height);
  justify-content: flex-start;
}

.${CARD.htmlStructure.elements.detailGroup.class} {
  height: var(--epb-detail-height);
  line-height: var(--epb-detail-height);
  min-width: var(--epb-detail-min-width);
  max-width: var(--epb-detail-max-width);
  justify-content: flex-start;
}

/* === UNIFIED ELLIPSIS === */
.${CARD.htmlStructure.elements.nameCombined.class},
.${CARD.htmlStructure.elements.detailCombined.class} {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.${CARD.htmlStructure.elements.nameCombined.class} {
  color: var(--primary-text-color);
  font-size: var(--ha-font-size-m);
  font-weight: var(--ha-font-weight-medium);
  height: var(--epb-name-height);
  line-height: var(--epb-name-height);
  letter-spacing: var(--epb-letter-spacing-name);
}

.${CARD.htmlStructure.elements.detailCombined.class} {
  color: var(--primary-text-color);
  font-size: var(--ha-font-size-s);
  font-weight: var(--ha-font-weight-body);
  height: var(--epb-detail-height);
  line-height: var(--epb-detail-height);
  vertical-align: middle;
  letter-spacing: var(--epb-letter-spacing-detail);
}

/* === ENTITIES TYPE SPECIFIC === */
.type-entities  :is(
  .${CARD.htmlStructure.elements.nameGroup.class},
  .${CARD.htmlStructure.elements.nameGroup.class} > span,
  .${CARD.htmlStructure.elements.detailGroup.class},
  .${CARD.htmlStructure.elements.detailGroup.class} > span
) {
  height: var(--epb-entities-height) !important;
}

.type-entities :is(
  .${CARD.htmlStructure.elements.nameCombined.class},
  .${CARD.htmlStructure.elements.detailCombined.class}
) {
  font-weight: var(--ha-font-weight-normal) !important;
  line-height: var(--ha-line-height-normal) !important;
}

.type-entities .${CARD.htmlStructure.elements.detailCombined.class} {
  color: var(--secondary-text-color) !important;
  font-size: var(--ha-font-size-m) !important;
}

/* === SECONDARY INFO === */
.${CARD.htmlStructure.elements.secondaryInfo.class} {
  display: flex;
  flex-direction: var(--epb-secondary-info-row-reverse, row);
  align-items: center;
  gap: var(--epb-gap-default);
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.secondaryInfo.class} {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  gap: unset;
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.right.class} {
  gap: var(--epb-vertical-gap);
}

.multiline {
  display: inline-block;
  height: 16px;
  line-height: 0.95;
  font-size: 8px;
  margin: 0;
  padding: 0;
}

.secondary-info:has(.multiline),
.secondary-info:has(.multiline) * {
  height: 18px;
  font-size: 9px;
}

.vertical :is(
  .secondary-info:has(.multiline),
  .secondary-info:has(.multiline) .secondary-info-detail-group,
  .secondary-info:has(.multiline) .secondary-info-custom-info
) {
  height: unset !important;
}

.vertical .secondary-info:has(.multiline) .progress-bar-container {
  height: 16px;
}

/* === PROGRESS BAR === */
.${CARD.htmlStructure.elements.progressBar.container.class} {
  flex-grow: 1;
  height: var(--epb-progress-container-height);
  display: flex;
  justify-content: center;
  align-items: center;
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
  justify-content: center;
  align-items: center;
}

.${CARD.htmlStructure.elements.progressBar.bar.class} {
  width: 100%;
  background-color: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
  overflow: hidden;
  position: relative;
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class}  {
  flex-grow: 0;
}

/* Progress bar size variants */

.${CARD.style.bar.sizeOptions.small.label} {
  --epb-progress-size: var(--epb-progress-size-s);
}

.${CARD.style.bar.sizeOptions.medium.label} {
  --epb-progress-size: var(--epb-progress-size-m);
}

.${CARD.style.bar.sizeOptions.large.label} {
  --epb-progress-size: var(--epb-progress-size-l);
}

.${CARD.style.bar.sizeOptions.xlarge.label} {
  --epb-progress-size: var(--epb-progress-size-xl);
}

.${CARD.htmlStructure.elements.progressBar.inner.class},
.${CARD.htmlStructure.elements.progressBar.positiveInner.class},
.${CARD.htmlStructure.elements.progressBar.negativeInner.class},
.${CARD.htmlStructure.elements.progressBar.bar.class} {
  height: var(--epb-progress-size);
  max-height: var(--epb-progress-size);
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
  height: var(--epb-progress-size); /* 8px */
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.container.class} {
  padding-top: var(--epb-progress-size); /* center the content */
}

.${CARD.layout.orientations.vertical.label}.${CARD.style.bar.sizeOptions.xlarge.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
  margin-top: 23px;
}

.${CARD.layout.orientations.vertical.label}.${CARD.style.bar.sizeOptions.xlarge.label} .${CARD.htmlStructure.sections.container.class} {
  padding-top: unset;
  justify-content: center;
  align-items: center;  
}

.${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  transform: scaleX(-1);
}

.${CARD.htmlStructure.elements.progressBar.inner.class},
.${CARD.htmlStructure.elements.progressBar.positiveInner.class},
.${CARD.htmlStructure.elements.progressBar.negativeInner.class} {
  background: var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default});
  transition: width var(--epb-progress-transition-width);
  will-change: width;
}

.${CARD.htmlStructure.elements.progressBar.inner.class} {
  width: var(${CARD.style.dynamic.progressBar.size.var}, ${CARD.style.dynamic.progressBar.size.default});
}

.${CARD.htmlStructure.elements.progressBar.negativeInner.class} {
  position: absolute;
  right: 50%;
  width: var(${CARD.style.dynamic.progressBar.nSize.var}, ${CARD.style.dynamic.progressBar.pSize.default});
  transform-origin: left;
}

.${CARD.htmlStructure.elements.progressBar.positiveInner.class} {
  position: absolute;
  left: 50%;
  width: var(${CARD.style.dynamic.progressBar.pSize.var}, ${CARD.style.dynamic.progressBar.nSize.default});
  transform-origin: right;
}

.${CARD.htmlStructure.elements.progressBar.bar.class},
.${CARD.style.dynamic.progressBar.effect.radius.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  border-radius: calc(var(--epb-progress-size) / 2);
}

.${CARD.style.dynamic.progressBar.effect.glass.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
}

.${CARD.style.dynamic.progressBar.effect.gradient.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, white 40%, var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})),
    var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default})
  );
} 

.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class} {
  overflow: hidden;
  position: relative;
}

.${CARD.style.dynamic.progressBar.effect.shimmer.class} .${CARD.htmlStructure.elements.progressBar.inner.class}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* === WATERMARKS === */

:is(
  .${CARD.htmlStructure.elements.progressBar.zeroMark.class},
  .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
  .${CARD.htmlStructure.elements.progressBar.highWatermark.class}
) {
  position: absolute;
  height: var(--epb-progress-size);
  max-height: var(--epb-progress-size);
  top: 0;
  opacity: var(--epb-watermark-opacity-value, 0.8);
}

.${CARD.htmlStructure.elements.progressBar.zeroMark.class} {
  display: flex;
  width: 1px;
  background-color: white;
  left: 50%;
}

:is(
  .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
  .${CARD.htmlStructure.elements.progressBar.highWatermark.class}
) {
  display: none;
  max-width: 100%;
  box-sizing: border-box;
  clip-path: inset(0);
}

.${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  background-color: var(--epb-low-watermark-color, var(--red-color));
}

.${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  background-color: var(--epb-high-watermark-color, var(--red-color));
}

/* Watermark area styles */
.${CARD.style.dynamic.show}-lwm-area-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: 0;
  width: var(--epb-low-watermark-value, 20%);
}

.${CARD.style.dynamic.show}-hwm-area-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: 0;
  width: calc(100% - var(--epb-high-watermark-value, 80%));
}

/* Watermark blended styles */

.${CARD.style.dynamic.show}-lwm-blended-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: 0;
  width: var(--epb-low-watermark-value, 20%);
  mix-blend-mode: hard-light;
}

.${CARD.style.dynamic.show}-hwm-blended-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: 0;
  width: calc(100% - var(--epb-high-watermark-value, 80%));
  mix-blend-mode: hard-light;
}

/* Watermark striped styles */
.${CARD.style.dynamic.show}-lwm-striped-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: 0;
  width: var(--epb-low-watermark-value, 20%);
  background: repeating-linear-gradient( -45deg, var(--epb-low-watermark-color, var(--red-color)) 0px, var(--epb-low-watermark-color, var(--red-color)) 3px, transparent 3px, transparent 6px );
}

.${CARD.style.dynamic.show}-hwm-striped-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: 0;
  width: calc(100% - var(--epb-high-watermark-value, 80%));
  background: repeating-linear-gradient( -45deg, var(--epb-high-watermark-color, var(--red-color)) 0px, var(--epb-high-watermark-color, var(--red-color)) 3px, transparent 3px, transparent 6px );
}

/* Watermark line styles */
.${CARD.style.dynamic.show}-hwm-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: calc(100% - var(--epb-high-watermark-value, 80%) + var(--epb-watermark-line-size, 1px) / 2);
  width: var(--epb-watermark-line-size, 1px);
  height: 100%; /* Gardons 100% pour la ligne complète */
  background-color: var(--epb-high-watermark-color, var(--red-color));
  top: 0;       /* Retour au top: 0 pour ligne complète */
  transform: none; /* Pas de transform pour ligne complète */
  border: none;
  position: absolute; /* Force le positionnement */
}

.${CARD.style.dynamic.show}-lwm-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: calc(var(--epb-low-watermark-value, 20%) - var(--epb-watermark-line-size, 1px) / 2);
  width: var(--epb-watermark-line-size, 1px);
  height: 100%;
  background-color: var(--epb-low-watermark-color, var(--red-color));
  top: 0;
  transform: none;
  border: none;
  position: absolute;
}

/* Watermark round style */
.${CARD.style.dynamic.show}-hwm-round-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: calc(100% - var(--epb-high-watermark-value, 80%) + var(--epb-watermark-circle-size, 5px) / 2);
  width: var(--epb-watermark-circle-size, 5px);
  height: var(--epb-watermark-circle-size, 5px);
  background-color: var(--epb-high-watermark-color, var(--red-color));
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  border: none;
}

.${CARD.style.dynamic.show}-lwm-round-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: calc(var(--epb-low-watermark-value, 20%) - var(--epb-watermark-circle-size, 5px) / 2);
  width: var(--epb-watermark-circle-size, 5px);
  height: var(--epb-watermark-circle-size, 5px);
  background-color: var(--epb-low-watermark-color, var(--red-color));
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  border: none;
}

/* Watermark triangle styles */
.${CARD.style.dynamic.show}-hwm-triangle-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
  right: calc(100% - var(--epb-high-watermark-value, 80%) + var(--epb-watermark-triangle-size, 8px) / 2);
  width: 0;
  height: 0;
  background-color: transparent;
  border-left: calc(var(--epb-watermark-triangle-size, 8px) / 2) solid transparent;
  border-right: calc(var(--epb-watermark-triangle-size, 8px) / 2) solid transparent;
  border-top: var(--epb-watermark-triangle-size, 8px) solid var(--epb-high-watermark-color, var(--red-color));
  top: 0;
}

.${CARD.style.dynamic.show}-lwm-triangle-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  left: calc(var(--epb-low-watermark-value, 20%) - var(--epb-watermark-triangle-size, 8px) / 2);
  width: 0;
  height: 0;
  background-color: transparent;
  border-left: calc(var(--epb-watermark-triangle-size, 8px) / 2) solid transparent;
  border-right: calc(var(--epb-watermark-triangle-size, 8px) / 2) solid transparent;
  border-top: var(--epb-watermark-triangle-size, 8px) solid var(--epb-low-watermark-color, var(--red-color));
  top: 0;
}

/* === VERTICAL LAYOUT ADJUSTMENTS === */
.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.right.class} {
  flex-grow: 0;
}

.${CARD.layout.orientations.vertical.label} :is(
  .${CARD.htmlStructure.elements.nameGroup.class},
  .${CARD.htmlStructure.elements.detailGroup.class}
) {
  flex-grow: 0;
  width: 100%;
  max-width: none;
  text-align: center;
  align-items: center;
  justify-content: center;
  min-width: 0;
  box-sizing: border-box;
}

.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
  max-width: 100%;
  overflow: hidden;
}
  
.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.nameGroup.class} {
  height: var(--epb-vertical-name-large-height);
}

:is(.${CARD.layout.orientations.horizontal.label}, .${CARD.layout.orientations.vertical.label}) 
  :is(.${CARD.htmlStructure.elements.nameGroup.class} > span, .${CARD.htmlStructure.elements.detailGroup.class} > span) {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.${CARD.layout.orientations.vertical.label} :is(
  .${CARD.htmlStructure.elements.nameCombined.class},
  .${CARD.htmlStructure.elements.detailCombined.class}
) {
  text-align: center;
  width: 100%;
  display: block; /* Simplifie le layout vertical */
}

/* === BADGE === */
.${CARD.htmlStructure.elements.badge.container.class} {
  position: absolute;
  z-index: 2;
  top: var(--epb-badge-offset);
  right: var(--epb-badge-offset);
  inset-inline-end: var(--epb-badge-offset);
  inset-inline-start: initial;
  width: var(--epb-badge-size);
  height: var(--epb-badge-size);
  border-radius: 50%;
  background-color: var(${CARD.style.dynamic.badge.backgroundColor.var}, ${CARD.style.dynamic.badge.backgroundColor.default});
  display: none;
  align-items: center;
  justify-content: center;
}

.${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.icon.class} {
  width: var(--epb-badge-icon-size);
  height: var(--epb-badge-icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${CARD.style.dynamic.badge.color.var}, ${CARD.style.dynamic.badge.color.default});
}

/* === MARGINLESS === */

.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class},
.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class},
.${CARD.layout.orientations.horizontal.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.container.class} {
  min-height: unset;
  padding-top: unset;
}

.${CARD.layout.orientations.vertical.label}.${CARD.style.dynamic.marginless.class} .${CARD.htmlStructure.sections.left.class} {
  margin-top: unset;
}

/* === VISIBILITY CONTROLS === */
.${CARD.style.dynamic.hiddenComponent.icon.class} :is(.${CARD.htmlStructure.sections.left.class}, .${CARD.htmlStructure.elements.shape.class}),
.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.elements.nameGroup.class},
.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.elements.detailGroup.class},
.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class} {
  display: none;
}

/* Shape transparency when hidden */
.${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class} {
  background-color: transparent;
}

/* Show elements when needed */
.${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.container.class},
[class*="${CARD.style.dynamic.show}-hwm-"] .${CARD.htmlStructure.elements.progressBar.highWatermark.class},
[class*="${CARD.style.dynamic.show}-lwm-"] .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
  display: flex;
}

/* === INTERACTIVE STATES === */
.${CARD.style.dynamic.clickable.card}:hover,
.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover {
  cursor: pointer;
  background-color: color-mix(in srgb, var(--card-background-color) var(--epb-card-hover-mix), var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) var(--epb-hover-opacity));
}

.${CARD.style.dynamic.clickable.card}:active {
  background-color: color-mix(in srgb, var(--card-background-color) var(--epb-card-active-mix), var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) var(--epb-active-opacity));
  transition: background-color var(--epb-click-transition-background);
}

.${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover .${CARD.htmlStructure.elements.shape.class} {
  background-color: color-mix(in srgb, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) var(--epb-icon-hover-opacity), transparent);
}
`;

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
 .${CARD.editor.fields.iconItem.class},
 .${CARD.editor.fields.accordion.icon.class} {
   margin-right: 8px;
   color: var(--secondary-text-color);
 }
 
 .${CARD.editor.fields.iconItem.class} {
   width: var(--icon-size);
   height: var(--icon-size);
 }
 
 /* Documentation */
 .${CARD.documentation.link.class} {
   position: absolute;
   top: 0;
   right: 0;
   z-index: 600;
   text-decoration: none;
   display: flex;
 }
 
 .${CARD.documentation.shape.class} {
   width: var(--button-size);
   height: var(--button-size);
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 50%;
   cursor: pointer;
   transition: background-color var(--transition-duration) ease;
 }
 
 .${CARD.documentation.shape.class}:hover {
   background-color: color-mix(in srgb, var(--card-background-color) 90%, var(--secondary-text-color) 10%);
 }
 
 .${CARD.documentation.questionMark.class} {
   color: var(--primary-text-color);
 }
 
 /* Accordéon */
 .${CARD.editor.fields.accordion.item.class} {
   display: block;
   width: 100%;
   border: 1px solid color-mix(in srgb, var(--card-background-color) 80%, var(--secondary-text-color) 20%);
   border-radius: var(--border-radius);
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
 }
 
 .${CARD.editor.fields.accordion.title.class}:focus {
   background-color: var(--secondary-background-color);
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
 
 /* Sélecteur ha-select */
 ha-select {
   --mdc-menu-max-height: 250px;
 }
 
 /* Classes show/hide optimisées */
 .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.attribute} .${CARD.editor.keyMappings.attribute},
 .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.max_value_attribute} .${CARD.editor.keyMappings.max_value_attribute},
 .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.theme} .${CARD.editor.keyMappings.theme} {
   display: none;
 }
 
 /* Toggle corrigé */
 .${CARD.editor.fields.toggle.class} {
   display: flex;
   align-items: center; /* Correction du typo */
   gap: 8px;
 }
 `;

/******************************************************************************************
 * 🛠️ Dev mode
 */

if (CARD.config.dev) {
  CARD.meta.card.typeName = `${CARD.meta.card.typeName}-dev`;
  CARD.meta.card.name = `${CARD.meta.card.typeName} (dev)`;
  CARD.meta.card.editor = `${CARD.meta.card.editor}-dev`;
  CARD.meta.template.typeName = `${CARD.meta.template.typeName}-dev`;
  CARD.meta.template.name = `${CARD.meta.template.typeName} (dev)`;
  CARD.meta.badge.typeName = `${CARD.meta.badge.typeName}-dev`;
  CARD.meta.badge.editor = `${CARD.meta.badge.editor}-dev`;
  CARD.meta.badgeTemplate.typeName = `${CARD.meta.badgeTemplate.typeName}-dev`;
}

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
        return async (...args) => {
          shouldLog(SEV.debug) && console.debug(`[${name}] 👉 ${fnName}`);
          const start = performance.now();

          try {
            const result = await fn(...args);
            const duration = (performance.now() - start).toFixed(2);
            shouldLog(SEV.debug) && console.debug(`[${name}] ✅ ${fnName} (${duration}ms)`);
            return result;
          } catch (error) {
            const duration = (performance.now() - start).toFixed(2);
            shouldLog(SEV.error) && console.error(`[${name}] ❌ ${fnName} failed (${duration}ms)`, error);
            throw error;
          }
        };
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
  static #targetKey = {
    customCards: 'customCards',
    customBadges: 'customBadges',
  };

  static #registerComponent(component, targetKey) {
    window[targetKey] = window[targetKey] || [];
    window[targetKey].push({
      type: component.typeName,
      name: component.name,
      preview: true,
      description: component.description,
    });
  }

  static registerCard(card) {
    RegistrationHelper.#registerComponent(card, RegistrationHelper.#targetKey.customCards);
  }

  static registerBadge(badge) {
    RegistrationHelper.#registerComponent(badge, RegistrationHelper.#targetKey.customBadges);
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
  container: () => Element(CARD.htmlStructure.sections.container).html('{{content}}'),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html('{{content}}'),
  left: () => Element(CARD.htmlStructure.sections.left).html('{{content}}'),

  iconAndShape: () => Element(CARD.htmlStructure.elements.shape).html(Element(CARD.htmlStructure.elements.icon).html()),
  badge: () => Element(CARD.htmlStructure.elements.badge.container).html(Element(CARD.htmlStructure.elements.badge.icon).html()),

  right: () => Element(CARD.htmlStructure.sections.right).html('{{content}}'),

  nameGroup: () =>
    Element(CARD.htmlStructure.elements.nameGroup).html(
      Element(CARD.htmlStructure.elements.nameCombined).html(
        Element(CARD.htmlStructure.elements.name).html() + Element(CARD.htmlStructure.elements.nameCustomInfo).html()
      )
    ),
  nameGroupMinimal: () =>
    Element(CARD.htmlStructure.elements.nameGroup).html(
      Element(CARD.htmlStructure.elements.nameCombined).html(Element(CARD.htmlStructure.elements.name).html())
    ),

  detailGroup: () =>
    Element(CARD.htmlStructure.elements.detailGroup).html(
      Element(CARD.htmlStructure.elements.detailCombined).html(
        Element(CARD.htmlStructure.elements.customInfo).html() + Element(CARD.htmlStructure.elements.stateAndProgressInfo).html()
      )
    ),

  detailGroupMinimal: () =>
    Element(CARD.htmlStructure.elements.detailGroup).html(
      Element(CARD.htmlStructure.elements.detailCombined).html(Element(CARD.htmlStructure.elements.customInfo).html())
    ),

  standardProgressBar: () =>
    Element(CARD.htmlStructure.elements.progressBar.container).html(
      Element(CARD.htmlStructure.elements.progressBar.bar, 'default').html(
        Element(CARD.htmlStructure.elements.progressBar.inner).html() +
          Element(CARD.htmlStructure.elements.progressBar.lowWatermark).html() +
          Element(CARD.htmlStructure.elements.progressBar.highWatermark).html()
      )
    ),

  centerZeroProgressBar: () =>
    Element(CARD.htmlStructure.elements.progressBar.container).html(
      Element(CARD.htmlStructure.elements.progressBar.bar, 'center-zero').html(
        Element(CARD.htmlStructure.elements.progressBar.negativeInner).html() +
          Element(CARD.htmlStructure.elements.progressBar.positiveInner).html() +
          Element(CARD.htmlStructure.elements.progressBar.lowWatermark).html() +
          Element(CARD.htmlStructure.elements.progressBar.highWatermark).html() +
          Element(CARD.htmlStructure.elements.progressBar.zeroMark).html()
      )
    ),

  progressBar: (options) => {
    switch (options.barType) {
      case 'centerZero':
        return StructureElements.centerZeroProgressBar();
      case 'default':
      default:
        return StructureElements.standardProgressBar();
    }
  },

  secondaryInfo: (options) => {
    const isVertical = options.layout === 'vertical';

    if (isVertical) {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroup()) + StructureElements.progressBar(options);
    } else if (options.barPosition === 'below') {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroup());
    } else {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroup() + StructureElements.progressBar(options));
    }
  },

  secondaryInfoMinimal: (options) => {
    const isVertical = options.layout === 'vertical';

    if (isVertical) {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroupMinimal()) + StructureElements.progressBar(options);
    } else if (options.barPosition === 'below') {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroupMinimal());
    } else {
      return Element(CARD.htmlStructure.elements.secondaryInfo).html(StructureElements.detailGroupMinimal() + StructureElements.progressBar(options));
    }
  },

  rightFull: (options) => Element(CARD.htmlStructure.sections.right).html(StructureElements.nameGroup() + StructureElements.secondaryInfo(options)),

  rightMinimal: (options) =>
    Element(CARD.htmlStructure.sections.right).html(StructureElements.nameGroupMinimal() + StructureElements.secondaryInfoMinimal(options)),

  leftFull: () => Element(CARD.htmlStructure.sections.left).html(StructureElements.iconAndShape() + StructureElements.badge()),
  leftNoBadge: () => Element(CARD.htmlStructure.sections.left).html(StructureElements.iconAndShape()),
};

const StructureTemplates = {
  card: (options = {}) => {
    if (options.barPosition === 'below')
      return (
        StructureElements.container().replace('{{content}}', StructureElements.leftFull() + StructureElements.rightFull(options) + StructureElements.belowContainer().replace('{{content}}', StructureElements.progressBar(options)))
      );

    return StructureElements.container().replace('{{content}}', StructureElements.leftFull() + StructureElements.rightFull(options));
  },

  badge: (options = {}) => {
    return StructureElements.container().replace('{{content}}', StructureElements.leftNoBadge() + StructureElements.rightFull(options));
  },

  template: (options = {}) => {
    if (options.barPosition === 'below')
      return StructureElements.container().replace(
        '{{content}}',
        StructureElements.leftFull() +
          StructureElements.rightMinimal(options) +
          StructureElements.belowContainer().replace('{{content}}', StructureElements.progressBar(options))
      );

    return StructureElements.container().replace('{{content}}', StructureElements.leftFull() + StructureElements.rightMinimal(options));
  },
  feature: (options = {}) => {
    StructureElements.progressBar(options);
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
    ] = [null, null, null, null, null, 0, false, false, false, false];
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
    const themeData = this.#currentStyle[Math.floor(percentage / thresholdSize)];
    this.#icon = themeData.icon;
    this.#iconColor = themeData.color;
    this.#barColor = themeData.color;
  }

  #setStyle() {
    let themeData = null;
    if (this.#value >= this.#currentStyle[this.#currentStyle.length - 1].max) {
      themeData = this.#currentStyle[this.#currentStyle.length - 1];
    } else if (this.#value < this.#currentStyle[0].min) {
      themeData = this.#currentStyle[0];
    } else {
      themeData = this.#currentStyle.find((level) => this.#value >= level.min && this.#value < level.max);
    }
    if (themeData) {
      this.#icon = themeData.icon || null;
      this.#iconColor = themeData.icon_color || themeData.color || null;
      this.#barColor = themeData.bar_color || themeData.color || null;
    }
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
  #debug = CARD.config.debug.hass;
  #log = null;
  #hass = null;
  #isValid = false;

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
    this.#hass = hass;
    this.#isValid = true;
    this.#log.debug('HASS updated!');
  }
  get hass() {
    return this.#hass;
  }
  get isValid() {
    return this.#isValid;
  }
  get systemLanguage() {
    return this.#hass?.config?.language in LANGUAGES ? this.#hass.config.language : CARD.config.language;
  }
  get language() {
    return this.#hass?.language in LANGUAGES ? this.#hass.language : CARD.config.language;
  }
  getMessage(code) {
    const fallback = LANGUAGES.en.card.msg[code];
    const localized = LANGUAGES[this.language]?.card?.msg?.[code];
    return localized || fallback || `Unknown message code: ${code}`;
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

  static getInstance() {
    if (!HassProviderSingleton.#instance) {
      HassProviderSingleton.#allowInit = true;
      HassProviderSingleton.#instance = new HassProviderSingleton();
    }
    return HassProviderSingleton.#instance;
  }

  getEntityStateObj(entityId) {
    return this.#hass?.states?.[entityId] ?? null;
  }
  getEntityStateValue(entityId) {
    return this.getEntityStateObj(entityId)?.state ?? null;
  }
  getEntityAttribute(entityId, attribute) {
    if (!attribute) return undefined;
    const attributes = this.getEntityStateObj(entityId)?.attributes;
    return attributes && attribute in attributes ? attributes[attribute] : undefined;
  }
  hasEntity(entityId) {
    return entityId in (this.#hass?.states || {});
  }
  isEntityAvailable(entityId) {
    const state = this.getEntityStateObj(entityId)?.state;
    return state !== 'unavailable' && state !== 'unknown';
  }
  static getEntityDomain(entityId) {
    return is.string(entityId) && entityId.includes('.') ? entityId.split('.')[0] : null;
  }
  getDeviceClass(entityId) {
    return this.getEntityAttribute(entityId, 'device_class') ?? null;
  }
  getEntityName(entityId) {
    return this.getEntityAttribute(entityId, 'friendly_name') ?? null;
  }
  getEntityIcon(entityId) {
    return this.getEntityAttribute(entityId, 'icon') ?? null;
  }
  getFormatedEntityState(entityId) {
    const stateObj = this.getEntityStateObj(entityId);
    return stateObj ? this.#hass?.formatEntityState?.(stateObj) : LANGUAGES[this.language].card.msg.entityNotFound;
  }
  getFormatedEntityAttributeName(entityId, attribute) {
    const stateObj = this.getEntityStateObj(entityId);
    return this.#hass?.formatEntityAttributeName?.(stateObj, attribute) ?? '';
  }
  getFormatedAttributeValue(entityId, attribute) {
    const stateObj = this.getEntityStateObj(entityId);
    return this.#hass?.formatEntityAttributeValue?.(stateObj, attribute) ?? '';
  }
  getTimerFinishAt(entityId) {
    return this.getEntityAttribute(entityId, 'finishes_at') ?? null;
  }
  getTimerDuration(entityId) {
    return this.getEntityAttribute(entityId, 'duration') ?? null;
  }
  getTimerRemaining(entityId) {
    return this.getEntityAttribute(entityId, 'remaining') ?? null;
  }
  getUnit(entityId) {
    return this.getEntityAttribute(entityId, 'unit_of_measurement') ?? null;
  }
  getPrecision(entityId) {
    return this.#hass?.entities?.[entityId]?.display_precision ?? null;
  }
  getNumericAttributes(entityId) {
    const attributes = this.getEntityStateObj(entityId)?.attributes ?? {};

    return Object.fromEntries(
      Object.entries(attributes)
        .filter(([, val]) => {
          return is.number(val) || is.numericString(val);
        })
        .map(([key, val]) => {
          const num = is.number(val) ? val : parseFloat(val);
          return [key, num];
        })
    );
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
    if (this.#hassProvider.getDeviceClass(this.#entityId) === 'duration' && !this.#attribute) return 'duration';

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

    this.#state = this.#hassProvider.getEntityStateValue(this.#entityId);
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
        const finished_at = new Date(this.#hassProvider.getTimerFinishAt(this.#entityId)).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getTimerDuration(this.#entityId));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case CARD.config.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(this.#hassProvider.getTimerRemaining(this.#entityId));
        duration = NumberFormatter.convertDuration(this.#hassProvider.getTimerDuration(this.#entityId));
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
    const unit = this.#hassProvider.getEntityAttribute(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    this.#value = unit === undefined ? 0 : NumberFormatter.durationToSeconds(value, unit);
    this.#isValid = unit !== undefined;
  }

  get attributes() {
    return this.#isValid && !this.isCounter && !this.isNumber && !this.isDuration && !this.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entityId)
      : {};
  }
  get attributesListForEditor() {
    const attributes = this.attributes;

    return [
      { value: '', label: '' },
      ...Object.keys(attributes).map((attr) => ({
        value: attr,
        label: this.#hassProvider.getFormatedEntityAttributeName(this.#entityId, attr),
      })),
    ];
  }
  get hasAttribute() {
    return this.#isValid && Object.keys(this.attributes ?? {}).length > 0;
  }
  get defaultAttribute() {
    return ATTRIBUTE_MAPPING[this.#domain]?.attribute ?? null;
  }
  get name() {
    return this.#hassProvider.getEntityName(this.#entityId);
  }
  get stateObj() {
    return this.#hassProvider.getEntityStateObj(this.#entityId);
  }
  get formatedEntityState() {
    return this.#hassProvider.getFormatedEntityState(this.#entityId);
  }
  get unit() {
    if (!this.#isValid) return null;
    if (this.isTimer) return CARD.config.unit.flexTimer;
    if (this.isDuration) return CARD.config.unit.second;
    if (this.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getUnit(this.#entityId);
  }
  get precision() {
    return this.#isValid ? this.#hassProvider.getPrecision(this.#entityId) ?? null : null;
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

    return colorMap[this.#domain] ?? colorMap[this.#hassProvider.getDeviceClass(this.#entityId)] ?? null;
  }
  get stateContentToString() {
    const results = [];

    for (const attr of this.stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getFormatedEntityState(this.#entityId));
          break;
        default:
          results.push(this.#hassProvider.getFormatedAttributeValue(this.#entityId, attr));
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
        return sum + (is.number(value) ? value : value?.current ?? 0);
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
      const value = is.number(rawValue) ? rawValue : rawValue?.current ?? 0;
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
  get attributesListForEditor() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.attributesListForEditor : null;
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
 * Inspired by superstruct (https://github.com/ianstormtaylor/superstruct) by @ianstormtaylor
 * structural validation ideas to manage inputs (1.5+)
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


const validateType = (typeCheck, errorCode) => (value, path = []) => {
  if (is.nullish(value)) throw new ValidationError(path, ERROR_CODES.missingRequiredProperty.code, ERROR_CODES.missingRequiredProperty.severity);
  if (!typeCheck(value)) throw new ValidationError(path, errorCode.code, errorCode.severity);
  return value;
};

const types = {
  string: validateType(is.string, ERROR_CODES.invalidTypeString),
  number: validateType(is.number, ERROR_CODES.invalidTypeNumber),
  boolean: validateType(is.boolean, ERROR_CODES.invalidTypeBoolean),

  array: (itemValidator) => (value, path = []) => {
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

  optional: (validator) => (value, path = []) => {
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

  fallbackTo:  (validator, defaultVal) => (value, path = []) => {
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

  enums: (allowedValues) => (value, path = []) => {
    if (is.nullish(value)) {
      throw new ValidationError(path, ERROR_CODES.missingRequiredProperty.code, ERROR_CODES.missingRequiredProperty.severity);
    }
    if (!allowedValues.includes(value)) {
      throw new ValidationError(path, ERROR_CODES.invalidEnumValue.code, ERROR_CODES.invalidEnumValue.severity);
    }
    return value;
  },

  enumsWithDefault: (allowedValues, defaultVal) => types.fallbackTo(types.enums(allowedValues), defaultVal),

  theme: (allowedValues) => (value, path = []) => {
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

  union: (...validators) => (value, path = []) => {
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

  // eslint-disable-next-line no-unused-vars
  arrayWithValidatedElem: (allowedValues) => (value, _path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;

    const valueArray = is.array(value) ? value : [value];
    const validItems = valueArray.filter((item) => allowedValues.includes(item));

    if (validItems.length === 0) return SKIP_PROPERTY;

    return validItems;
  },

  // eslint-disable-next-line no-unused-vars
  effectArray: (allowedValues) => (value, path = []) => {
    if (is.nullish(value)) return SKIP_PROPERTY;
    if (is.jinja(value)) return value;

    const valueArray = is.array(value) ? value : [value];
    const validItems = valueArray.filter((item) => allowedValues.includes(item));

    if (validItems.length === 0) return SKIP_PROPERTY;

    return validItems;
  },

  watermarkObject: (schema) => (value, path = []) => {
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
        errors // toutes les erreurs individuelles
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
  const preprocess = (data) => {
    const result = { ...data };

    if (is.nullish(result.icon_tap_action) && is.string(result.entity)) {
      const domain = HassProviderSingleton.getEntityDomain(result.entity);
      const shouldPatch = ['light', 'switch', 'fan', 'input_boolean', 'media_player'].includes(domain);
      if (shouldPatch) result.icon_tap_action = { action: 'toggle' };
    }

    return result;
  };
  const structInstance = {
    validate: (data) => {
      try {
        const preprocessed = preprocess(data);
        return { isValid: true, config: validator(preprocessed), error: null, path: null };
      } catch (error) {
        return { isValid: false, config: null, error: error.message, path: error.path };
      }
    },

    parse: (data) => {
      try {
        const preprocessed = preprocess(data);
        const result = validator(preprocessed);
        return {
          isValid: true,
          config: result,
          path: null,
          errorCode: null,
          severity: null,
          errors: [],
        };
      } catch (error) {
        // ✅ Fonction pour extraire les erreurs en évitant les doublons
        const extractAllErrors = (error) => {
          const allErrors = [];
          const seen = new Set(); // Pour éviter les doublons

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

          // ✅ Si l'erreur a des sous-erreurs (errors), prendre seulement celles-ci
          if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            error.errors.forEach((subError) => {
              if (subError instanceof ValidationError) {
                // Récursion pour les erreurs complexes
                extractAllErrors(subError).forEach(addError);
              } else if (subError.errorCode) {
                // Erreur simple
                addError(subError);
              }
            });
          } else if (error.errorCode) {
            // ✅ Sinon, prendre l'erreur principale
            addError(error);
          }

          return allErrors;
        };

        const allErrors = extractAllErrors(error);
        const mainError =
          allErrors.find((e) => e.severity === 'error') || allErrors[0] || null;

        return {
          isValid: !mainError || mainError.severity !== 'error',
          config: error.partialResult ?? error.partialConfig ?? null,
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

const additionItem = types.fallbackTo(types.object({
  entity: types.entityId,
  attribute: types.optional(types.string)
}), SKIP_PROPERTY);

const watermarkSchema = {
  low: types.optionalNumberWithDefault(CARD.config.defaults.watermark.low),
  low_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.low_color),
  high: types.optionalNumberWithDefault(CARD.config.defaults.watermark.high),
  high_color: types.optionalStringWithDefault(CARD.config.defaults.watermark.high_color),
  opacity: types.optionalNumberWithDefault(CARD.config.defaults.watermark.opacity),
  type: types.enumsWithDefault(['blended', 'area', 'striped', 'triangle', 'round', 'line'], CARD.config.defaults.watermark.type),
  line_size: types.optionalStringWithDefault(CARD.config.defaults.watermark.line_size),
  disable_low: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_low),
  disable_high: types.optionalBooleanWithDefault(CARD.config.defaults.watermark.disable_high),
};


class yamlSchemaFactory {
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
          'small'
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_effect: types.effectArray(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        layout: types.enumsWithDefault(
          Object.values(CARD.layout).map((e) => e.label),
          'horizontal'
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalBooleanWithDefault(false),

        // === Visibility & Content ===
        hide: types.arrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
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
      })
    );
  }

  static get badge() {
    return yamlSchemaFactory.card.delete(['badge_icon', 'badge_color', 'force_circular_background', 'layout', 'height', 'icon_tap_action', 'icon_hold_action', 'icon_double_tap_action']);
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
          'small'
        ), //[('small', 'medium', 'large', 'xlarge')]
        bar_orientation: types.enumsWithDefault(Object.keys(CARD.style.dynamic.progressBar.orientation), 'ltr'), // ['ltr', 'rtl']
        bar_effect: types.effectArray(Object.values(CARD.style.dynamic.progressBar.effect).map((e) => e.label)), //[('radius', 'glass', 'gradient', 'shimmer')]
        layout: types.enumsWithDefault(
          Object.values(CARD.layout).map((e) => e.label),
          'horizontal'
        ), // [('horizontal', 'vertical')]
        min_width: types.optionalString(),
        height: types.optionalString(),
        frameless: types.optionalBooleanWithDefault(false),
        marginless: types.optionalBooleanWithDefault(false),
        reverse_secondary_info_row: types.optionalBooleanWithDefault(false),
        force_circular_background: types.optionalBooleanWithDefault(false),
        center_zero: types.optionalBooleanWithDefault(false),
        hide: types.arrayWithValidatedElem(['icon', 'name', 'value', 'secondary_info', 'progress_bar']),
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
      })
    );
  }

  // new !
  static get badgeTemplate() {
    return yamlSchemaFactory.template.delete(['badge_icon', 'badge_color', 'force_circular_background', 'layout', 'height', 'icon_tap_action', 'icon_hold_action', 'icon_double_tap_action']);
  }
}


/**
 * @typedef {Object} EntityProxy
 * @property {*} state
 * @property {string} name
 * @property {string} unit
 * @property {string} icon
 * @property {*} [key]
 */

/**
 * @param {Object} hassProvider
 * @param {string} entityId
 * @returns {EntityProxy}
 */
const createEntityProxy = (hassProvider, entityId) => new Proxy({}, {
  get(target, prop) {
    switch (prop) {
      case 'state': return hassProvider.getEntityState(entityId);
      case 'name': return hassProvider.getEntityAttribute(entityId, 'friendly_name');
      case 'unit': return hassProvider.getEntityAttribute(entityId, 'unit_of_measurement');
      case 'icon': return hassProvider.getEntityAttribute(entityId, 'icon');
      default: return hassProvider.getEntityAttribute(entityId, prop);
    }
  }
});

// const entity = createEntityProxy(hassProvider, 'sensor.temperature');


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
    this._isDefined = true;
    BaseConfigHelper.#logDeprecatedOption(config);
    this._configParsed = this._yamlSchema.parse(config);

    // console.log(this.config);
    console.log(this._configParsed);
    // console.log(this._hassProvider.language);
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
        } is deprecated and will be removed in a future release. Please migrate to the recommended alternative...`
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
  get cardTapAction() {
    return this.#getAction('tap_action');
  }
  get cardDoubleTapAction() {
    return this.#getAction('double_tap_action');
  }
  get cardHoldAction() {
    return this.#getAction('hold_action');
  }
  get iconTapAction() {
    return this.#getAction('icon_tap_action');
  }
  get iconDoubleTapAction() {
    return this.#getAction('icon_double_tap_action');
  }
  get iconHoldAction() {
    return this.#getAction('icon_hold_action');
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
      }
    }
  }

  _checkHAEnvironment() {
    const entityState = this._hassProvider.getEntityStateObj(this.config.entity);
    const maxValueState = is.nonEmptyString(this.config.max_value) ? this._hassProvider.getEntityStateObj(this.config.max_value) : null;

    if (is.string(this.config.attribute) && entityState && !has.own(entityState.attributes, this.config.attribute))
      this.#HAError = { path: 'attribute', errorCode: 'attributeNotFound', severity: SEV.error };
    else if (is.string(this.config.max_value) && !maxValueState)
      this.#HAError = { path: 'max_value', errorCode: 'entityNotFound', severity: SEV.error };
    else if (is.string(this.config.max_value_attribute) && maxValueState && !has.own(maxValueState.attributes, this.config.max_value_attribute))
      this.#HAError = { path: 'max_value_attribute', errorCode: 'attributeNotFound', severity: SEV.error };
    else this.#HAError = null;
  }

  get _hassProvider() {
    return this.#hassProvider;
  }
}


/******************************************************************************************
 * 🛠️ CardConfigHelper
 * ========================================================================================
 *
 * ✅ class for managing and validating card configuration.
 *
 * @class
 */

class CardConfigHelper extends BaseConfigHelper {
  _yamlSchema = yamlSchemaFactory.card;

  get max_value() {
    if (!this.config.max_value) return CARD.config.value.max;
    if (Number.isFinite(this.config.max_value)) return this.config.max_value;
    if (is.string(this.config.max_value)) {
      const state = this._hassProvider.getEntityStateValue(this.config.max_value);
      const parsedState = parseFloat(state);
      if (!isNaN(parsedState)) return parsedState;
    }
    return null;
  }
  get stateContent() {
    return this.config?.state_content ?? [];
  }
}

/******************************************************************************************
 * 🛠️ BadgeConfigHelper
 * ========================================================================================
 *
 * ✅ class for managing and validating badge configuration.
 *
 * @class
 */

class BadgeConfigHelper extends CardConfigHelper {
  _yamlSchema = yamlSchemaFactory.badge;
}


/******************************************************************************************
 * 🛠️ MinimalCardView
 * ========================================================================================
 *
 * ✅ A view class for rendering minimal cards in a user interface.
 * This class manages configuration, entity states, user interactions, and visual
 * appearance of cards including layouts, orientations, watermarks, and interactive elements.
 *
 * @class MinimalCardView
 * @description Handles the display and behavior of minimal cards with support for
 *              Home Assistant entities, user actions, and visual customization
 *              (watermarks, shapes, orientations, clickable elements).
 *
 * @example
 * const cardView = new MinimalCardView();
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
class MinimalCardView {
  _configHelper = null;
  _currentValue = new EntityOrValue();

  // === GETTERS / SETTERS ===

  set config(config) {
    this._configHelper.config = config;
  }

  get config() {
    return this._configHelper.config;
  }

  get layout() {
    return this.config.layout;
  }
  get barOrientation() {
    return this._currentValue.isTimer && this.config.bar_orientation === null ? 'rtl' : this.config.bar_orientation === 'rtl' ? 'rtl' : null;
  }
  get barSize() {
    return this.config.bar_size;
  }
  get entityStateObj() {
    this._currentValue.value = this.config.entity;
    return this._currentValue.stateObj;
  }
  get hasClickableIcon() {
    return this._hasAnyAction([this._configHelper.iconTapAction, this._configHelper.iconHoldAction, this._configHelper.iconDoubleTapAction]);
  }
  get hasClickableCard() {
    return this._hasAnyAction([this._configHelper.cardTapAction, this._configHelper.cardHoldAction, this._configHelper.cardDoubleTapAction]);
  }
  get hasReversedSecondaryInfoRow() {
    return this.config.reverse_secondary_info_row; // === true
  }
  get hasVisibleShape() {
    return this.config.force_circular_background || this._hasDefaultShape || this._hasInteractiveShape; // this.config.force_circular_background === true
  }

  get _hasDefaultShape() {
    return this._currentValue.hasShapeByDefault && this._hasAction(this._configHelper.iconTapAction);
  }

  get _hasInteractiveShape() {
    return [
      CARD.interactions.action.navigate.action,
      CARD.interactions.action.url.action,
      CARD.interactions.action.moreInfo.action,
      CARD.interactions.action.assist.action,
      CARD.interactions.action.toggle.action,
      CARD.interactions.action.performAction.action,
    ].includes(this._configHelper.iconTapAction);
  }
  get hasWatermark() {
    return this.config.watermark !== undefined;
  }
  get barEffectsEnabled() {
    return this.config.bar_effect !== undefined;
  }
  get watermark() {
    if (!this.config.watermark) return null;

    const { watermark } = this.config;
    return {
      low: this.config.center_zero ? 50 + watermark.low / 2 : watermark.low, // === true
      low_color: ThemeManager.adaptColor(watermark.low_color),
      high: this.config.center_zero ? 50 + watermark.high / 2 : watermark.high, // === true
      high_color: ThemeManager.adaptColor(watermark.high_color),
      opacity: watermark.opacity,
      type: watermark.type,
      line_size: watermark.line_size,
      disable_low: watermark.disable_low,
      disable_high: watermark.disable_high,
    };
  }

  // === PUBLIC API METHODS ===

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
 * 🛠️ BaseCardView
 * ========================================================================================
 *
 * ✅ A comprehensive base card view that extends MinimalCardView to manage all information
 * required for creating cards and badges. This class handles entity states, theme management,
 * percentage calculations, timers, and provides a complete API for card rendering.
 *
 * @class BaseCardView
 * @extends MinimalCardView
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
 * const cardView = new BaseCardView();
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
 * const displayText = cardView.stateAndProgressInfo;
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
class BaseCardView extends MinimalCardView {
  #hassProvider = HassProviderSingleton.getInstance();
  #percentHelper = new PercentHelper();
  #theme = new ThemeManager();
  #maxValue = new EntityOrValue();
  #entityCollection = new EntityCollectionHelper();
  #currentLanguage = CARD.config.language;

  // === PUBLIC GETTERS / SETTERS ===

  get hasValidatedConfig() {
    return this._configHelper.isValid;
  }
  get msg() {
    return this._configHelper.msg;
  }
  set config(config) {
    this._configHelper.config = config;

    if (this._configHelper.config.additions) {
      //console.log(this._configHelper.config.additions);
      this._configHelper.config.additions.forEach(({ entity, attribute }) => {
        this.#entityCollection.addEntity(entity, attribute);
      });
      this.#entityCollection.addEntity(config.entity, config.attribute);
    }
    
    Object.assign(this.#percentHelper, {
      unitSpacing: this._configHelper.config.unit_spacing,
      hasDisabledUnit: this._configHelper.hasDisabledUnit,
      isCenterZero: this._configHelper.config.center_zero, //  === true
    });

    Object.assign(this.#theme, {
      theme: config.theme,
      customTheme: config.custom_theme,
    });

    Object.assign(this._currentValue, {
      value: config.entity,
      stateContent: this._configHelper.stateContent,
    });

    if (this._currentValue.isTimer) {
      this.#maxValue.value = CARD.config.value.max;
    } else {
      this._currentValue.attribute = config.attribute;
      Object.assign(this.#maxValue, {
        value: config.max_value ?? CARD.config.value.max,
        attribute: config.max_value_attribute,
      });
    }
  }
  get config() {
    return this._configHelper.config;
  }
  get isUnknown() {
    return this._currentValue.state === CARD.config.entity.state.unknown || this.#maxValue.state === CARD.config.entity.state.unknown;
  }
  get isUnavailable() {
    return this._currentValue.state === CARD.config.entity.state.unavailable || this.#maxValue.state === CARD.config.entity.state.unavailable;
  }
  get isNotFound() {
    return this._currentValue.state === CARD.config.entity.state.notFound || this.#maxValue.state === CARD.config.entity.state.notFound;
  }
  get isAvailable() {
    return !(!this._currentValue.isAvailable || (!this.#maxValue.isAvailable && this._configHelper.maxValue));
  }
  get hasStandardEntityError() {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }
  set currentLanguage(newValue) {
    if (Object.keys(LANGUAGES).includes(newValue)) {
      this.#currentLanguage = newValue;
    }
  }
  get currentLanguage() {
    return this.#currentLanguage;
  }
  get entity() {
    return this._configHelper.config.entity;
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
    const curColor = ThemeManager.adaptColor(this.#theme.barColor || this._configHelper.config.bar_color) ||
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
  get stateAndProgressInfo() {
    if (this.hasStandardEntityError || (this._currentValue.isTimer && this._currentValue.value.state === CARD.config.entity.state.idle))
      return this._currentValue.formatedEntityState;

    const additionalInfo = this._currentValue.stateContentToString;
    if (this.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this._currentValue.isDuration && !this._configHelper.config.unit ? this._currentValue.formatedEntityState : this.#percentHelper.toString();

    return additionalInfo === '' ? valueInfo : [additionalInfo, valueInfo].join(CARD.config.separator);
  }
  get entityStateObj() {
    return this._currentValue.stateObj;
  }
  get name() {
    return this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
  }
  get isBadgeEnable() {
    return (
      this.isUnavailable ||
      this.isNotFound ||
      this._configHelper.config.badge_icon !== null ||
      (this._currentValue.isTimer && [CARD.config.entity.state.paused, CARD.config.entity.state.active].includes(this._currentValue.value.state))
    );
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
    return [CARD.interactions.action.default, CARD.interactions.action.moreInfo.action].includes(this._configHelper.cardTapAction);
  }
  get hasVisibleShape() {
    return this.#hassProvider.hasNewShapeStrategy ? super.hasVisibleShape : true;
  }
  get timerIsReversed() {
    return this._configHelper.config.reverse !== false && this._currentValue.value.state !== CARD.config.entity.state.idle;
  }
  get hasWatermark() {
    return this._configHelper.config.watermark !== undefined;
  }
  get watermark() {
    if (!this._configHelper.config.watermark) return null;

    const { watermark } = this._configHelper.config;
    return {
      low: this.#percentHelper.calcWatermark(watermark.low),
      low_color: ThemeManager.adaptColor(watermark.low_color),
      high: this.#percentHelper.calcWatermark(watermark.high),
      high_color: ThemeManager.adaptColor(watermark.high_color),
      opacity: watermark.opacity,
      type: watermark.type,
      line_size: watermark.line_size,
      disable_low: watermark.disable_low, // === true,
      disable_high: watermark.disable_high, // === true,
    };
  }
  get hasEntityCollection() {
    return this.#entityCollection.count >= 2;
  }

  get entityCollectionPercentage() {
    return this.#entityCollection.getPercentages();
  }

  // === PUBLIC API METHODS ===

  refresh(hass) {
    this.#hassProvider.hass = hass;
    this.currentLanguage = this.#hassProvider.language;
    this._currentValue.refresh();
    this.#maxValue.refresh();
    this._configHelper.checkConfig();
    // console.log(this.#entityCollection.count);
    this.#entityCollection.refreshAll();
    //console.log(this.#entityCollection.getTotalValue());
    //console.log(this.#entityCollection.getPercentages());    

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
      max: this.#maxValue.isEntity ? this.#maxValue.value?.current ?? this.#maxValue.value : this._currentValue.value.max,
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
    if (this._configHelper.config.decimal) return this._configHelper.config.decimal; // !== null
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
 * A specialized card view implementation that extends BaseCardView specifically for
 * rendering full card components. This class provides the complete card functionality
 * with proper configuration management through CardConfigHelper.
 *
 * @class CardView
 * @extends BaseCardView
 * @description A concrete implementation of BaseCardView designed for full card rendering.
 *              This class uses CardConfigHelper to handle card-specific configuration
 *              validation, processing, and management. It inherits all entity management,
 *              theme handling, and state processing capabilities from BaseCardView while
 *              providing card-specific configuration logic.
 *
 * @see BaseCardView For inherited functionality
 * @see CardConfigHelper For configuration management details
 */
class CardView extends BaseCardView {
  _configHelper = new CardConfigHelper();
}

/******************************************************************************************
 * 🛠️ BadgeView
 * ========================================================================================
 *
 * A specialized badge view implementation that extends BaseCardView specifically for
 * rendering compact badge components. This class provides complete badge functionality
 * with proper configuration management through BadgeConfigHelper.
 *
 * @class BadgeView
 * @extends BaseCardView
 * @description A concrete implementation of BaseCardView designed for compact badge rendering.
 *              Badges are smaller, more focused UI elements that display key information
 *              in a condensed format. This class uses BadgeConfigHelper to handle badge-specific
 *              configuration validation and processing while inheriting all entity management,
 *              theme handling, and state processing capabilities from BaseCardView.
 *
 * @see BaseCardView For inherited functionality
 * @see BadgeConfigHelper For badge configuration management details
 */
class BadgeView extends BaseCardView {
  _configHelper = new BadgeConfigHelper();
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
      this.remove(finalId); // <-- on supprime proprement l'ancien !
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
 * 🛠️ ActionHelper — Utility Class
 * ========================================================================================
 *
 * ✅ Centralized handler for `xyz_action` logic.
 *
 * 📌 Purpose:
 *   - Encapsulates and manages the execution, validation, and dispatch of `xyz_action`.
 *   - Promotes reusable, maintainable logic for action-related features.
 */
class ActionHelper {
  #debug = CARD.config.debug.interactionHandler;
  #log = null;
  #resourceManager = null;
  #config = null;
  #element = null;
  #clickCount = 0;
  #downTime = null;
  #isHolding = null;
  #clickSource = null;
  #startX = 0;
  #startY = 0;
  #iconClickSources = new Set(['shape', 'ha-svg-icon', 'img']);
  #disableIconTap = false;

  #boundHandlers = {
    mousedown: (e) => this.#handleMouseDown(e),
    mouseup: (e) => this.#handleMouseUp(e),
    mousemove: (e) => this.#handleMouseMove(e),
    touchstart: (e) => this.#handleMouseDown(e),
    touchend: (e) => this.#handleMouseUp(e),
    touchmove: (e) => this.#handleMouseMove(e),
  };

  constructor(element) {
    this.#element = element;
    this.#log = initLogger(this, this.#debug, ['init', 'cleanup']);
  }

  // === PUBLIC API METHODS ===

  init(resourceManager, config, clickableTarget, disableIconTap) {
    this.#resourceManager = resourceManager;
    this.#config = config;
    this.#disableIconTap = disableIconTap;
    this.#attachToTargets(clickableTarget);
  }

  cleanup() {
    this.#resourceManager?.cleanup();
  }

  // === PRIVATE METHODS ===

  #attachToTargets(clickableTarget) {
    if (!clickableTarget) return;

    if (is.array(clickableTarget)) {
      for (const target of clickableTarget) {
        if (target) this.#attachListener(target);
      }
    } else {
      this.#attachListener(clickableTarget);
    }
  }

  #attachListener(elem) {
    this.#resourceManager.addEventListener(elem, 'mousedown', this.#boundHandlers.mousedown, { passive: true });
    this.#resourceManager.addEventListener(elem, 'mouseup', this.#boundHandlers.mouseup, { passive: true });
    this.#resourceManager.addEventListener(elem, 'mousemove', this.#boundHandlers.mousemove, { passive: true });
    this.#resourceManager.addEventListener(elem, 'touchstart', this.#boundHandlers.touchstart, { passive: true });
    this.#resourceManager.addEventListener(elem, 'touchend', this.#boundHandlers.touchend, { passive: true });
    this.#resourceManager.addEventListener(elem, 'touchmove', this.#boundHandlers.touchmove, { passive: true });
  }

  #handleMouseDown(ev) {
    const localName = ev.composedPath()[0].localName;
    this.#log.debug('localName', localName);
    this.#clickSource = !this.#disableIconTap
      ? this.#iconClickSources.has(localName)
        ? CARD.interactions.event.from.icon
        : CARD.interactions.event.from.card
      : CARD.interactions.event.from.card;
    this.#log.debug('clickSource: ', this.#clickSource);

    this.#downTime = Date.now();
    this.#startX = ev.clientX;
    this.#startY = ev.clientY;
    this.#isHolding = false;

    this.#resourceManager.setTimeout(
      () => {
        this.#isHolding = true;
      },
      500,
      'holdTimeout'
    );
  }

  #resetClickState() {
    this.#downTime = null;
    this.#isHolding = false;
  }

  #handleMouseUp(ev) {
    this.#resourceManager.remove('holdTimeout');

    const upTime = Date.now();
    const deltaTime = upTime - this.#downTime;
    const moveThreshold = 5;

    const isClick = deltaTime < 500 && Math.abs(ev.clientX - this.#startX) < moveThreshold && Math.abs(ev.clientY - this.#startY) < moveThreshold;

    if (this.#isHolding) {
      this.#fireAction(ev, CARD.interactions.event.tap.holdAction);
      this.#resetClickState();
      this.#clickCount = 0;
      return;
    }

    if (!isClick) {
      this.#resetClickState();
      return;
    }

    this.#clickCount++;

    if (this.#clickCount === 1) {
      this.#resourceManager.setTimeout(
        () => {
          this.#fireAction(ev, CARD.interactions.event.tap.tapAction);
          this.#clickCount = 0;
        },
        300,
        'tapTimeout'
      );
    } else if (this.#clickCount === 2) {
      this.#resourceManager.remove('tapTimeout');
      this.#fireAction(ev, CARD.interactions.event.tap.doubleTapAction);
      this.#clickCount = 0;
    }

    this.#resetClickState();
  }

  #handleMouseMove(ev) {
    if (this.#downTime && (Math.abs(ev.clientX - this.#startX) > 5 || Math.abs(ev.clientY - this.#startY) > 5)) {
      this.#resourceManager.remove('holdTimeout');
      this.#isHolding = false;
      this.#downTime = null;
    }
  }

  #fireAction(originalEvent, currentAction) {
    const eventFromIcon = this.#clickSource === CARD.interactions.event.from.icon;
    const fullAction = eventFromIcon ? `${this.#clickSource}_${currentAction}` : currentAction;

    const actionConfig =
      eventFromIcon && (!this.#config?.[`${fullAction}_action`] || this.#config[`${fullAction}_action`].action === 'none')
        ? this.#config?.[`${currentAction}_action`]
        : this.#config?.[`${fullAction}_action`];

    if (!actionConfig) return;
    const config = { entity: this.#config.entity, tap_action: actionConfig };

    this.#element.dispatchEvent(
      new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config,
          action: 'tap',
          originalEvent,
        },
      })
    );
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressCardBase
 * ========================================================================================
 *
 * ✅ Represents the base class for all custom "entity-progress" cards.
 *
 * 📌 Purpose:
 *   - Provides shared structure, lifecycle hooks, and utility logic for custom Lovelace cards.
 *   - Serves as the foundation for building consistent and reusable UI components.
 *
 * 🛠️ Example:
 *   class MyCustomCard extends EntityProgressCardBase { ... }
 *
 * 📚 Context:
 *   - Designed for use in Home Assistant dashboards.
 *   - Enables unified behavior across multiple card implementations.
 *
 * @class
 * @extends HTMLElement
 */
class EntityProgressCardBase extends HTMLElement {
  static _cardStructure = new CardStructure();
  static _cardStyle = CARD_CSS;
  static _hasDisabledIconTap = false;
  static _hasDisabledBadge = false;
  static _baseClass = CARD.meta.card.typeName;
  static _cardLayout = CARD.layout.orientations;
  _debug = CARD.config.debug.card;
  _log = null;
  _resourceManager = null;
  _icon = null;
  _cardView = new CardView();
  _domElements = new Map();
  _hass = null;
  _clickableTarget = null;
  _actionHelper = null;
  _changeTracker = new ChangeTracker();
  #lastMessage = null;
  #isRendered = false;

  // === LIFECYCLE METHODS ===

  constructor() {
    super();

    this._log = initLogger(this, this._debug, [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'refresh',
      'getCardSize',
      'render',
      '_assignHass',
      '_handleHassUpdate',
      '_storeDOM',
      '_renderJinja',
    ]);

    this.attachShadow({ mode: CARD.config.shadowMode });
    this._actionHelper = new ActionHelper(this);
    EntityProgressCardBase._initializeModule();
  }

  connectedCallback() {
    // console.log('Connected - Parent chain:', this._getParentChain());
    // setTimeout(() => this._debugCardModIntegration(), 500);
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    this.render();
    this._updateDynamicElementsSync();
    this._setupClickableTarget();
    this._actionHelper.init(this._resourceManager, this._cardView.config, this._clickableTarget, this.hasDisabledIconTap);
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
    if (!config) {
      throw new Error('setConfig: invalid config');
    }

    if (this.isRendered) this.reset();

    this._cardView.config = { ...config };
    if (is.string(config.entity)) this._changeTracker.watchEntity(config.entity);
    if (is.string(config.max_value)) this._changeTracker.watchEntity(config.max_value);
    this.render();
  }

  /**
   * Sets the Home Assistant (`hass`) instance and updates dynamic elements.
   *
   * @param {Object} hass - The Home Assistant instance containing the current
   *                        state and services.
   */
  set hass(hass) {
    this._log.debug('👉 set hass()');
    const isFirstHass = !this.hass;
    this._changeTracker.hassState = hass;
    if (isFirstHass || this._changeTracker.hassState.isUpdated) {
      this._assignHass(hass);
      this._handleHassUpdate();
    }
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    if (!this._wsInitialized) this._watchWebSocket();
  }

  get hass() {
    return this._hass;
  }

  _assignHass(hass) {
    this._hass = hass; // assignation standard dans la classe mère
  }

  _handleHassUpdate() {
    const timeoutId = 'hass-update-throttle';
    if (!this._resourceManager) this._resourceManager = new ResourceManager();

    this._resourceManager.throttle(
      () => {
        this._doHandleHassUpdate();
      },
      100,
      timeoutId
    );
  }

  _doHandleHassUpdate() {
    this.refresh();

    if (!this._cardView.isActiveTimer) {
      this._stopAutoRefresh();
    } else if (!this._resourceManager.has('autoRefresh')) {
      this._startAutoRefresh();
    }
  }

  refresh() {
    this._cardView.refresh(this.hass);
    if (this._manageErrorMessage()) return;
    this._updateDynamicElements();
  }

  /**
   * Returns the number of grid rows for the card size based on the current layout.
   *
   * @returns {number} - The number of grid rows for the current card layout.
   */
  getCardSize() {
    const layout = this.constructor._cardLayout[this._cardView.layout];
    this._log.debug('getCardSize -> ', layout.grid.grid_rows);

    return layout.grid.grid_rows;
  }

  /**
   * Returns the layout options based on the current layout configuration.
   *
   * @returns {object} - The layout options for the current layout configuration.
   */
  getLayoutOptions() {
    const layout = structuredClone(this.constructor._cardLayout[this._cardView.layout]);
    if (this._cardView.hasComponentHiddenFlag(CARD.style.dynamic.hiddenComponent.icon.label)) layout.grid.grid_min_rows = 1;
    if (this._cardView.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label) layout.grid.grid_min_rows = layout.grid.grid_min_rows + 1;
    this._log.debug('getLayoutOptions -> ', layout.grid);

    return layout.grid;
  }

  get isRendered() {
    return this.#isRendered;
  }

  reset() {
    this.#isRendered = false;
    this._domElements.clear();
    this._icon = null;
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

  get hasDisabledIconTap() {
    return this.constructor._hasDisabledIconTap;
  }

  get baseClass() {
    return this.constructor._baseClass;
  }

  // === INITIALIZATION ===

  static _initializeModule() {
    if (!EntityProgressCardBase._moduleLoaded) {
      console.groupCollapsed(CARD.console.message, CARD.console.css);
      console.log(CARD.console.link);
      console.groupEnd();
      EntityProgressCardBase._moduleLoaded = true;
    }
  }
  _setupClickableTarget() {
    this._clickableTarget = this;
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
      'autoRefresh'
    );
  }

  _stopAutoRefresh() {
    if (this._resourceManager) this._resourceManager.remove('autoRefresh');
  }

  // === ERROR MESSAGE MANAGEMENT ===

  _manageErrorMessage() {
    if (is.nullish(this._cardView.entity) || (this._cardView.isAvailable && !this._cardView.hasValidatedConfig)) {
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

    // Vérifier si on a déjà un ha-alert
    let alert = this.shadowRoot.querySelector('ha-alert');

    if (!alert) {
      alert = document.createElement('ha-alert');
      this.shadowRoot.replaceChildren(alert);
    }

    // Ensuite on met à jour le message et la sévérité
    alert.setAttribute('alert-type', msg.sev); // IMPORTANT: attribut
    alert.textContent = msg.content;
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
    const { style, card } = this._createCardElements();
    this.shadowRoot.replaceChildren(style, card);
    this._storeDOM(card);
  }

  _manageStructureOptions() {
    this.constructor._cardStructure.options = {
      barType: this._cardView.config.center_zero ? 'centerZero' : 'default', // === true
      layout: this._cardView.config.layout,
      barPosition:
        this._cardView.config.layout === CARD.layout.orientations.horizontal.label &&
        this._cardView.config.bar_size === CARD.style.bar.sizeOptions.xlarge.label
          ? 'below'
          : 'default',
    };
  }

  _createCardElements() {
    const style = document.createElement(CARD.style.element);
    style.textContent = this.cardStyle;

    const card = document.createElement(CARD.htmlStructure.card.element);
    this._buildStyle(card);
    card.innerHTML = this.innerHTML;

    return { style, card };
  }

  _buildStyle(card) {
    this._addBaseClasses(card);
    this._addBaseParameter(card);
    this._applyConditionalClasses(card);
    this._handleHiddenComponents(card);
    this._handleWatermarkClasses(card);
    this._handleBarEffect(card);
  }

  _addBaseClasses(card) {
    const classesToAdd = [this.baseClass];

    if (this._cardView.barOrientation) {
      classesToAdd.push(CARD.style.dynamic.progressBar.orientation[this._cardView.barOrientation]);
    }

    classesToAdd.push(this._cardView.layout, this._cardView.barSize);
    card.classList.add(...classesToAdd);
  }

  _addBaseParameter(card) {
    if (this._cardView.hasReversedSecondaryInfoRow) EntityProgressCardBase._setStylePropertyIfChanged(card.style, '--epb-secondary-info-row-reverse', 'row-reverse');
    if (this._cardView.config.min_width)
      EntityProgressCardBase._setStylePropertyIfChanged(card.style, CARD.style.dynamic.card.minWidth.var, this._cardView.config.min_width);
    if (this._cardView.config.height)
      EntityProgressCardBase._setStylePropertyIfChanged(card.style, CARD.style.dynamic.card.height.var, this._cardView.config.height);
  }

  get conditionalStyle() {
    return new Map([
      [CARD.style.dynamic.clickable.card, this._cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this._cardView.hasClickableIcon],
      [CARD.style.dynamic.secondaryInfoError.class, this._cardView.hasStandardEntityError],
      [CARD.style.dynamic.frameless.class, this._cardView.config.frameless], // === true,
      [CARD.style.dynamic.marginless.class, this._cardView.config.marginless], // === true,
    ]);
  }
  _applyConditionalClasses(card) {
    this.conditionalStyle.forEach((condition, className) => {
      card.classList.toggle(className, condition);
    });
  }

  _handleHiddenComponents(card) {
    const components = [
      CARD.style.dynamic.hiddenComponent.icon,
      CARD.style.dynamic.hiddenComponent.name,
      CARD.style.dynamic.hiddenComponent.secondary_info,
      CARD.style.dynamic.hiddenComponent.progress_bar,
    ];

    components.forEach((component) => {
      this._toggleHiddenComponent(card, component);
    });
  }

  _handleWatermarkClasses(card) {
    if (!this._cardView.hasWatermark) return;

    const type = ['area', 'blended', 'striped', 'line', 'triangle', 'round'].includes(this._cardView.watermark.type)
      ? `${this._cardView.watermark.type}`
      : 'blended';
    const baseWMClass = CARD.htmlStructure.elements.progressBar.watermark.class;
    const showClass = CARD.style.dynamic.show;

    card.classList.toggle(`${showClass}-hwm-${type}-${baseWMClass}`, !this._cardView.watermark.disable_high);
    card.classList.toggle(`${showClass}-lwm-${type}-${baseWMClass}`, !this._cardView.watermark.disable_low);
  }

  _handleBarEffect(card, jinjaEffect = null) {
    if (!this._cardView.barEffectsEnabled) return;
    const isJinja = is.jinja(this._cardView.config.bar_effect);
    if (isJinja && !jinjaEffect) return;

    const effects = Object.values(CARD.style.dynamic.progressBar.effect);
    effects.forEach((effect) => {
      if (isJinja) {
        card.classList.toggle(effect.class, jinjaEffect.includes(effect.label));
      } else {
        card.classList.toggle(effect.class, this._cardView.hasBarEffect(effect.label));
      }
    });
  }

  _toggleHiddenComponent(card, component) {
    card.classList.toggle(component.class, this._cardView.hasComponentHiddenFlag(component.label));
  }

  // === DOM MANAGEMENT ===

  static _setStylePropertyIfChanged(style, variable, value) {
    if (style.getPropertyValue(variable) !== value) {
      style.setProperty(variable, value);
    }
  }
  static _setTextContentIfChanged(el, content) {
    if (el.textContent !== content) {
      el.textContent = content;
    }
  }
  static _setInnerHTMLIfChanged(el, innerHTML) {
    if (el.innerHTML !== innerHTML) {
      el.innerHTML = innerHTML;
    }
  }

  static _batchDOMUpdates(updates) {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  }

  _storeDOM(card) {
    const elements = CARD.htmlStructure.elements;

    this._domElements.clear();
    this._domElements.set(CARD.htmlStructure.card.element, card);

    const selectors = [
      elements.icon,
      elements.shape,
      elements.badge.icon,
      elements.name,
      elements.nameCustomInfo,
      elements.customInfo,
      elements.stateAndProgressInfo,
    ];

    const shadowRoot = this.shadowRoot;

    // Single-pass DOM querying
    const lookup = Array.from(shadowRoot.querySelectorAll('*'));

    for (const { class: className } of selectors) {
      const element = lookup.find((el) => el.classList.contains(className));
      if (element) {
        this._domElements.set(className, element);
      }
    }
  }
  /**
   * Updates the specified DOM element based on a provided callback function.
   */
  _updateElement(key, updateCallback) {
    const element = this._domElements.get(key);
    if (element) {
      updateCallback(element);
    }
  }

  // === DYNAMIC ELEMENTS UPDATE ===

  /**
   * Updates dynamic card elements based on the entity's state and configuration.
   */
  _updateDynamicElementsSync() {
    this._showIcon();
    this._showBadge();
    this._manageShape();
    this._updateCSS();
    this._processJinjaFields();
    this._processStandardFields();
  }

  _updateDynamicElements() {
    this._log.debug('👉 EntityProgressCard._updateDynamicElements()');
    EntityProgressCardBase._batchDOMUpdates([() => this._showIcon(), () => this._showBadge(), () => this._manageShape(), () => this._updateCSS()]);
    this._processJinjaFields();
    this._processStandardFields();
  }

  // === CSS MANAGEMENT ===

  _updateCSSValue(key, value) {
    this._updateElement(CARD.htmlStructure.card.element, (el) => {
      EntityProgressCardBase._setStylePropertyIfChanged(el.style, key, value);
    });
  }

  _updateCSS() {
    this._updateElement(CARD.htmlStructure.card.element, (el) => {
      const style = el.style;
      const bar = this._cardView;
      const isCenterZero = bar.config.center_zero; // === true,
      const isNegative = bar.percent < 0;

      const properties = [
        [CARD.style.dynamic.progressBar.color.var, bar.barColor],
        [CARD.style.dynamic.iconAndShape.color.var, bar.iconColor],
      ];

      if (isCenterZero) {
        properties.push(
          [isNegative ? CARD.style.dynamic.progressBar.nSize.var : CARD.style.dynamic.progressBar.pSize.var, `${Math.abs(bar.percent / 2)}%`],
          [isNegative ? CARD.style.dynamic.progressBar.pSize.var : CARD.style.dynamic.progressBar.nSize.var, '0%']
        );
      } else {
        properties.push([CARD.style.dynamic.progressBar.size.var, `${bar.percent}%`]);
      }

      if (bar.hasWatermark) {
        const wm = bar.watermark;
        const wmProperties = EntityProgressCardBase._getWatermarkProperties(wm, isCenterZero);
        properties.push(...wmProperties);
      }
      properties.forEach(([variable, value]) => {
        EntityProgressCardBase._setStylePropertyIfChanged(style, variable, value);
      });
    });
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

  // === ICON MANAGEMENT ===

  _createImgIcon(altText, className = 'custom-icon-img') {
    this._log.debug('_createImgIcon');
    const img = document.createElement('img');
    img.className = className;
    // img.loading = 'lazy'; - avoid issue
    img.decoding = 'async';
    img.alt = altText;
    return img;
  }

  _handleImgIcon(stateObj, iconContainer, srcPicture) {
    const pictureAlt = stateObj?.attributes?.friendly_name || 'Entity picture';

    if (this._icon?.tagName !== 'IMG') {
      this._icon?.remove();
      this._icon = this._createImgIcon(pictureAlt);
      iconContainer.replaceChildren(this._icon);
      this._updateCSSValue(CARD.style.dynamic.iconAndShape.icon.size.var, '36px');
    }
    this._icon.src = srcPicture;
    this._icon.alt = pictureAlt;
  }

  _createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture) {
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
    this._cleanupImgIcon();

    if (!this._icon) {
      this._icon = document.createElement('ha-state-icon');
      iconContainer.replaceChildren(this._icon);
    }

    this._icon.hass = this._hass;
    this._icon.stateObj = stateObjIcon;
  }

  _showIcon() {
    if (!this._cardView || !this._domElements) return;

    const { entityStateObj: stateObj, icon: curIcon } = this._cardView;
    const hasIconOverride = is.nonEmptyString(curIcon);
    const srcPicture = stateObj?.attributes?.entity_picture;
    const hasPicture = is.nonEmptyString(srcPicture);

    const iconContainer = this._domElements.get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) {
      console.error('Icon container not found for _showIcon.');
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
      this._handleImgIcon(stateObj, iconContainer, srcPicture);
      return;
    }

    const stateObjIcon = this._createStateObjIcon(stateObj, curIcon, hasIconOverride, hasPicture);
    if (!stateObjIcon) return;
    this._handleStateIcon(iconContainer, stateObjIcon);
  }

  // === SHAPE MANAGEMENT ===

  _manageShape() {
    this._domElements
      .get(CARD.htmlStructure.card.element)
      ?.classList.toggle(CARD.style.dynamic.hiddenComponent.shape.class, !this._cardView.hasVisibleShape || this.hasDisabledIconTap);
  }

  // === BADGE MANAGEMENT ===

  /**
   * Displays a badge
   */
  _showBadge() {
    if (this.constructor._hasDisabledBadge) return;
    const { badgeInfo, isBadgeEnable } = this._cardView;

    if (isBadgeEnable && badgeInfo === null) return; // custom

    this._domElements
      .get(CARD.htmlStructure.card.element)
      ?.classList.toggle(`${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`, isBadgeEnable);
    if (isBadgeEnable) {
      if (!badgeInfo) {
        return;
      }
      this._setBadge(badgeInfo.icon, badgeInfo.color, badgeInfo.backgroundColor);
    }
  }

  _setBadge(icon, color, backgroundColor) {
    this._setBadgeIcon(icon);
    this._setBadgeColor(color, backgroundColor);
  }

  _setBadgeIcon(icon) {
    // Make sure the icon has really changed
    this._updateElement(CARD.htmlStructure.elements.badge.icon.class, (el) => {
      const currentIcon = el.getAttribute(CARD.style.icon.badge.default.attribute);
      if (currentIcon !== icon) {
        el.setAttribute(CARD.style.icon.badge.default.attribute, icon);
      }
    });
  }

  _setBadgeColor(color, backgroundColor) {
    this._updateElement(CARD.htmlStructure.card.element, (el) => {
      const style = el.style;
      EntityProgressCardBase._setStylePropertyIfChanged(style, CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
      EntityProgressCardBase._setStylePropertyIfChanged(style, CARD.style.dynamic.badge.color.var, color);
    });
  }

  // === JINJA TEMPLATE RENDERING ===

  _renderJinja(key, content) {
    this._log.debug('_renderJinja():', { key, content });

    const renderHandlers = this._getRenderHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      handler();
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  _getRenderHandlers(content) {
    return {
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
      bar_effect: () => this._refreshBarEffect(content),
    };
  }

  _renderCustomInfo(content) {
    const formattedContent = `${content}&nbsp;`;
    this._updateElement(CARD.htmlStructure.elements.customInfo.class, (el) => {
      EntityProgressCardBase._setInnerHTMLIfChanged(el, formattedContent);
    });
  }

  _renderNameInfo(content) {
    const formattedContent = `&nbsp;${content}`;
    this._updateElement(CARD.htmlStructure.elements.nameCustomInfo.class, (el) => {
      EntityProgressCardBase._setInnerHTMLIfChanged(el, formattedContent);
    });
  }

  _renderBadgeIcon(content) {
    const badgeInfo = this._cardView.badgeInfo;
    const isBadgeEnable = this._cardView.isBadgeEnable;
    const isMdiIcon = content.includes('mdi:');

    if (badgeInfo !== null) return; // alert -> cancel custom badge

    if (isMdiIcon) {
      this._domElements
        .get(CARD.htmlStructure.card.element)
        ?.classList.toggle(`${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`, isBadgeEnable);
      this._setBadgeIcon(content);
    }
  }

  _renderBadgeColor(content) {
    const backgroundColor = ThemeManager.adaptColor(content);
    const color = 'var(--white-color)';
    this._setBadgeColor(color, backgroundColor);
  }

  _refreshBarEffect(content) {
    const card = this._domElements.get(CARD.htmlStructure.card.element);
    const jinjaEffect = content.split(',').map(s => s.trim());
    this._handleBarEffect(card, jinjaEffect);
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
        const templates = this._getTemplateFields();
        for (const key of Object.keys(templates)) {
          this._resourceManager.remove(`template-${key}`);
        }
      },
      { passive: true },
      'ws-disconnected'
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
      'ws-ready'
    );
  }

  _validateProcessJinjaFields() {
    return this._cardView.hasStandardEntityError || !this._resourceManager ? false : true;
  }

  async _processJinjaFields() {
    if (!this._validateProcessJinjaFields()) {
      this._log.debug('❌ Jinja processing skipped - validation failed');
      return;
    }

    this._log.debug('✅ Processing Jinja fields');

    const templates = this._getTemplateFields();

    for (const [key, template] of Object.entries(templates)) {
      if (is.nonEmptyString(template)) await this._subscribeToTemplate(key, template);
    }
  }

  _getTemplateContext() {
    const entity = this._cardView?.config?.entity;
    return entity ? { entity } : {};
  }

  _getTemplateFields() {
    const config = this._cardView.config;

    return {
      name_info: config.name_info || '',
      custom_info: config.custom_info || '',
      badge_icon: config.badge_icon || '',
      badge_color: config.badge_color || '',
      bar_effect: config.bar_effect || '',
    };
  }

  async _subscribeToTemplate(key, template) {
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
        template: template,
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

  // === STD FIELDS PROCESSING ===

  _processStandardFields() {
    const fields = [
      {
        className: CARD.htmlStructure.elements.name.class,
        value: this._cardView.name,
      },
      {
        className: CARD.htmlStructure.elements.stateAndProgressInfo.class,
        value: this._cardView.stateAndProgressInfo,
      },
    ];

    fields.forEach(({ className, value }) => {
      this._updateElement(className, (el) => {
        EntityProgressCardBase._setTextContentIfChanged(el, value);
      });
    });
  }
}

/******************************************************************************************
 * 📦 CARDS
 ******************************************************************************************/

/******************************************************************************************
 * 🛠️ EntityProgressCard
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

  static getConfigElement() {
    return document.createElement(CARD.meta.card.editor);
  }

  static getStubEntity(hass) {
    return Object.keys(hass.states).find((id) => /^(sensor\..*battery|fan\.|cover\.|light\.)/i.test(id)) || 'sensor.temperature';
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.card.typeName}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}

/******************************************************************************************
 * 🛠️ EntityProgressBadge
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
  static _cardLayout = CARD.layout.orientations.horizontal.grid;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = `
    :host {
      --epb-icon-size: 18px;
      --epb-shape-size: 18px;
    }

    ${CARD_CSS}

    ${CARD.htmlStructure.card.element},
    .${CARD.htmlStructure.sections.container.class} {
      min-height: 36px !important;
      max-height: 36px !important;
      height: var(--ha-badge-size, 36px);
      min-width: var(--epb-card-min-width, var(--ha-badge-size, 110px));
      width: 100%;
      border-radius: var(--ha-badge-border-radius,calc(var(--ha-badge-size,36px)/ 2));
    }

    .icon ha-state-icon {
      --mdc-icon-size: var(--epb-icon-size);
      --ha-icon-display: flex;
      height: var(--epb-icon-size);
      width: var(--epb-icon-size);
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .${CARD.htmlStructure.elements.nameGroup.class},
    .${CARD.htmlStructure.elements.nameGroup.class} > span {
      height: 10px !important;
      font-size: 10px !important;
      font-style: normal !important;
      font-weight: 500 !important;
      line-height: 10px !important;
      color: var(--secondary-text-color) !important;
      margin-right: 5px !important;
    }

    .${CARD.htmlStructure.elements.detailGroup.class},
    .${CARD.htmlStructure.elements.detailGroup.class} > span {
      font-size: var(--ha-badge-font-size, var(--ha-font-size-s)) !important;
      font-style: normal !important;
      font-weight: 500 !important;
      letter-spacing: 0.1px !important;
      color: var(--primary-text-color)
    }
    .${CARD.htmlStructure.elements.secondaryInfo.class} {
    gap: 5px !important;
    }
    .${CARD.htmlStructure.elements.detailGroup.class} {
      min-width: unset !important;
      max-width: unset !important;
    }
    .${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover .${CARD.htmlStructure.elements.shape.class} {
      background-color: unset !important;
    }
    `;

  setConfig(config) {
    super.setConfig(config);
    
    // Force un refresh pour les badges dans l'éditeur
    if (this._hass) {
      setTimeout(() => this.refresh(), 0);
    }
  }

  _rebuildStyle() {
    const card = this._domElements.get(CARD.htmlStructure.card.element);
    if (card) {
      this._buildStyle(card);
    }
  }

  static getConfigElement() {
    return document.createElement(CARD.meta.badge.editor);
  }

  getCardSize() {
    return this._cardLayout.grid_rows;
  }

  getLayoutOptions() {
    return this._cardLayout;
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.badge.typeName}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}

/******************************************************************************************
 * 🔧 Register card & badge
 */

EntityProgressCardBase.version = VERSION;
EntityProgressCardBase._moduleLoaded = false;
customElements.define(CARD.meta.card.typeName, EntityProgressCard);
customElements.define(CARD.meta.badge.typeName, EntityProgressBadge);
RegistrationHelper.registerCard(CARD.meta.card);
RegistrationHelper.registerBadge(CARD.meta.badge);

/******************************************************************************************
 * 📦 Template Card
 ******************************************************************************************/

/******************************************************************************************
 * 🛠️ TemplateConfigHelper
 * ========================================================================================
 *
 * ✅ Config Helper
 *
 * 📌 Purpose:
 *   - Manage card configuration.
 *
 * @class
 * @extends BaseConfigHelper
 */

class TemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = yamlSchemaFactory.template;
}

/******************************************************************************************
 * 🛠️ TemplateCardView
 * ========================================================================================
 *
 * ✅ A view that manage all informations to create the card.
 *
 * @class
 */
class TemplateCardView extends MinimalCardView {
  _configHelper = new TemplateConfigHelper();
  icon = null;
}

/******************************************************************************************
 * 🛠️ EntityProgressTemplate
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-card-template"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressTemplate extends EntityProgressCardBase {
  static _cardStructure = new TemplateStructure();
  _firstIconRefresh = true;
  _debug = CARD.config.debug.card;
  _cardView = new TemplateCardView();
  _hassProvider = HassProviderSingleton.getInstance();

  connectedCallback() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    this.render();
    this._showIcon();
    this._updateWatermark();
    this._manageShape();
    this._setupClickableTarget();
    this._actionHelper.init(this._resourceManager, this._cardView.config, this._clickableTarget);

    // AJOUT : Forcer le traitement Jinja après l'initialisation complète
    if (this.hass) {
      // Utiliser un micro-task pour s'assurer que tout est initialisé
      Promise.resolve().then(() => {
        this._processJinjaFields();
      });
    }

    if (this.hass && !this._wsInitialized) this._watchWebSocket();
  }

  //setConfig(config) {
  //
  //  super.setConfig(config);
  //  new this._cardView.config = config;
  //}

  set hass(hass) {
    const isFirstHass = !this.hass;
    this._hassProvider.hass = hass;
    this._handleHassUpdate();
    if (isFirstHass && !this._wsInitialized) this._watchWebSocket();
  }

  get hass() {
    return this._hassProvider.hass;
  }

  _handleHassUpdate() {
    if (!this._resourceManager) this._resourceManager = new ResourceManager();
    const throttleId = 'hass-update-throttle';

    this._resourceManager.throttle(
      () => {
        this._processJinjaFields();
      },
      50,
      throttleId
    );
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
  get conditionalStyle() {
    return new Map([
      [CARD.style.dynamic.clickable.card, this._cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this._cardView.hasClickableIcon],
      [CARD.style.dynamic.frameless.class, this._cardView.config.frameless], // === true,
      [CARD.style.dynamic.marginless.class, this._cardView.config.marginless], // === true,
    ]);
  }

  // === WATERMARK MANAGEMENT ===

  _updateWatermark() {
    if (!this._cardView.hasWatermark) return;

    const wm = this._cardView.watermark;
    const properties = EntityProgressCardBase._getWatermarkProperties(wm);

    properties.forEach(([key, value]) => {
      this._updateCSSValue(key, value);
    });
  }

  // === BADGE MANAGEMENT ===

  _renderBadgeIcon(content) {
    const isMdiIcon = content.includes('mdi:');
    const containerClass = `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`;

    this._domElements.get(CARD.htmlStructure.card.element)?.classList.toggle(containerClass, isMdiIcon);

    if (isMdiIcon) {
      this._setBadgeIcon(content);
    }
  }

  // === ICON MANAGEMENT ===

  _showIcon(iconFromJinja = null) {
    const hasBadIcon = this._cardView.config.icon !== undefined && iconFromJinja === null;

    if (this._firstIconRefresh && hasBadIcon) {
      this._firstIconRefresh = false;
      return;
    }
    this._cardView.icon = hasBadIcon ? 'mdi:alert-circle-outline' : iconFromJinja;
    super._showIcon();
  }

  // === JINJA TEMPLATE RENDERING ===
  _forceJinjaProcessing() {
    if (!this._resourceManager) {
      this._resourceManager = new ResourceManager();
    }
    this._processJinjaFields();
  }

  _getRenderHandlers(content) {
    return {
      badge_icon: () => this._renderBadgeIcon(content),
      badge_color: () => this._renderBadgeColor(content),
      secondary: () => this._renderSecondary(content),
      name: () => this._renderName(content),
      icon: () => this._showIcon(content),
      percent: () => this._renderPercentCSS(content),
      color: () => this._updateCSSValue(CARD.style.dynamic.iconAndShape.color.var, ThemeManager.adaptColor(content)),
      bar_color: () => this._updateCSSValue(CARD.style.dynamic.progressBar.color.var, ThemeManager.adaptColor(content)),
      bar_effect: () => this._refreshBarEffect(content),
    };
  }

  _renderPercentCSS(percent) {
    const isCenterZero = this._cardView.config.center_zero; // === true,
    const absPercent = Math.abs(percent);
    const half = `${absPercent / 2}%`;

    if (isCenterZero) {
      this._updateCSSValue(percent >= 0 ? CARD.style.dynamic.progressBar.pSize.var : CARD.style.dynamic.progressBar.nSize.var, half);
      this._updateCSSValue(percent >= 0 ? CARD.style.dynamic.progressBar.nSize.var : CARD.style.dynamic.progressBar.pSize.var, '0%');
    } else {
      this._updateCSSValue(CARD.style.dynamic.progressBar.size.var, `${absPercent}%`);
    }
  }
  _renderSecondary(content) {
    // multiline
    const hasLineBreak = /<br\s*\/?>/i.test(content);
    const wrappedContent = hasLineBreak ? `<span class="multiline">${content}</span>` : `${content}`;

    this._renderTextContent(CARD.htmlStructure.elements.customInfo.class, wrappedContent);
  }

  _renderName(content) {
    this._renderTextContent(CARD.htmlStructure.elements.name.class, `${content}`);
  }

  _renderTextContent(className, formattedContent) {
    this._updateElement(className, (el) => {
      const safeContent = is.string(formattedContent) ? formattedContent.trim() : '';
      EntityProgressCardBase._setInnerHTMLIfChanged(el, safeContent);
    });
  }

  // === TEMPLATE PROCESSING ===

  _validateProcessJinjaFields() {
    return Boolean(this.hass);
  }

  _getTemplateFields() {
    const config = this._cardView.config;

    return {
      name: config.name || '',
      secondary: config.secondary || '',
      badge_icon: config.badge_icon || '',
      badge_color: config.badge_color || '',
      icon: config.icon || '',
      percent: config.percent || '',
      color: config.color || '',
      bar_color: config.bar_color || '',
      bar_effect: config.bar_effect || '',
    };
  }
}

/* NEW */
/******************************************************************************************
 * 📦 Badge Template card
 ******************************************************************************************/

/******************************************************************************************
 * 🛠️ BadgeTemplateConfigHelper
 * ========================================================================================
 *
 * ✅ Config Helper
 *
 * 📌 Purpose:
 *   - Manage card configuration.
 *
 * @class
 * @extends BaseConfigHelper
 */

class BadgeTemplateConfigHelper extends BaseConfigHelper {
  _yamlSchema = yamlSchemaFactory.badgeTemplate;
}
  
/******************************************************************************************
 * 🛠️ BadgeTemplateCardView
 * ========================================================================================
 *
 * ✅ A view that manage all informations to create the card.
 *
 * @class
 */
class BadgeTemplateCardView extends MinimalCardView {
  _configHelper = new BadgeTemplateConfigHelper();
  icon = null;
}

/******************************************************************************************
 * 🛠️ EntityProgressBadge
 * ========================================================================================
 *
 * ✅ HA CARD "entity-progress-badge"
 *
 * @class
 * @extends EntityProgressCardBase
 */
class EntityProgressBadgeTemplate extends EntityProgressTemplate {
  _cardView = new BadgeTemplateCardView();
  static _baseClass = CARD.meta.badgeTemplate.typeName;
  static _hasDisabledIconTap = true;
  static _hasDisabledBadge = true;
  static _cardLayout = CARD.layout.orientations.horizontal.grid;
  static _cardStructure = new BadgeStructure();
  static _cardStyle = `
    :host {
      --epb-icon-size: 18px;
      --epb-shape-size: 18px;
    }

    ${CARD_CSS}

    ${CARD.htmlStructure.card.element},
    .${CARD.htmlStructure.sections.container.class} {
      min-height: 36px !important;
      max-height: 36px !important;
      height: var(--ha-badge-size, 36px);
      min-width: var(--epb-card-min-width, var(--ha-badge-size, 110px));
      width: 100%;
      border-radius: var(--ha-badge-border-radius,calc(var(--ha-badge-size,36px)/ 2));
    }

    .icon ha-state-icon {
      --mdc-icon-size: var(--epb-icon-size);
      --ha-icon-display: flex;
      height: var(--epb-icon-size);
      width: var(--epb-icon-size);
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .${CARD.htmlStructure.elements.nameGroup.class},
    .${CARD.htmlStructure.elements.nameGroup.class} > span {
      height: 10px !important;
      font-size: 10px !important;
      font-style: normal !important;
      font-weight: 500 !important;
      line-height: 10px !important;
      color: var(--secondary-text-color) !important;
      margin-right: 5px !important;
    }

    .${CARD.htmlStructure.elements.detailGroup.class},
    .${CARD.htmlStructure.elements.detailGroup.class} > span {
      font-size: var(--ha-badge-font-size, var(--ha-font-size-s)) !important;
      font-style: normal !important;
      font-weight: 500 !important;
      letter-spacing: 0.1px !important;
      color: var(--primary-text-color)
    }
    .${CARD.htmlStructure.elements.secondaryInfo.class} {
    gap: 5px !important;
    }
    .${CARD.htmlStructure.elements.detailGroup.class} {
      min-width: unset !important;
      max-width: unset !important;
    }
    .${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover .${CARD.htmlStructure.elements.shape.class} {
      background-color: unset !important;
    }
    `;

  setConfig(config) {
    super.setConfig(config);
    
    // Force un refresh pour les badges dans l'éditeur
    if (this._hass) {
      setTimeout(() => this.refresh(), 0);
    }
  }

  _rebuildStyle() {
    const card = this._domElements.get(CARD.htmlStructure.card.element);
    if (card) {
      this._buildStyle(card);
    }
  }

  static getConfigElement() {
    return null; //document.createElement(CARD.meta.badge.editor);
  }

  getCardSize() {
    return this._cardLayout.grid_rows;
  }

  getLayoutOptions() {
    return this._cardLayout;
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.badgeTemplate.typeName}`,
      entity: EntityProgressCard.getStubEntity(hass),
    };
  }
}



/******************************************************************************************
 * 🔧 Register card & badge
 */
EntityProgressTemplate.version = VERSION;
EntityProgressTemplate._moduleLoaded = false;
customElements.define(CARD.meta.template.typeName, EntityProgressTemplate);
RegistrationHelper.registerCard(CARD.meta.template);

/* NEW */
customElements.define(CARD.meta.badgeTemplate.typeName, EntityProgressBadgeTemplate);
RegistrationHelper.registerBadge(CARD.meta.badgeTemplate);


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
    if (is.nullishOrEmptyString(changedEvent.target.value)) {
      delete this.config[targetId];
    } else {
      this.config[targetId] = changedEvent.target.value;
    }
  }

  updateNumericField(targetId, changedEvent) {
    const curValue = parseFloat(changedEvent.target.value);
    if (isNaN(curValue)) {
      delete this.config[targetId];
    } else {
      this.config[targetId] = curValue;
    }
  }

  updateMaxValueField(targetId, changedEvent) {
    if (is.numericString(changedEvent.target.value)) {
      this.config[targetId] = parseFloat(changedEvent.target.value);
    } else if (is.nonEmptyString(changedEvent.target.value)) {
      this.config[targetId] = changedEvent.target.value;
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
    const key = targetId.replace('toggle_', '');
    const newConfig = structuredClone(this.config);

    this.#log.debug(' 📌 *** CONFIG before ***:', JSON.stringify(this.config, null, 2));
    this.#log.debug(' 📌 *** NEWCONFIG before ***:', JSON.stringify(newConfig, null, 2));
    newConfig.hide = is.nonEmptyArray(newConfig.hide) ? [...newConfig.hide] : [];

    this.#log.debug(' 📌 *** NEWCONFIG (Hide Management) ***:', JSON.stringify(newConfig, null, 2));

    const isChecked = changedEvent.target.checked;
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
    if (changedEvent.target.checked) {
      this.config.force_circular_background = true;
    } else {
      delete this.config.force_circular_background;
    }
  }

  updateUnitField(targetId, changedEvent) {
    if (!changedEvent.srcElement.checked) {
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
 * Inspired by Home Assistant component structure:
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
  #currentLanguage = CARD.config.language;
  #isListenersAttached = false;

  // === LIFECYCLE METHODS ===

  constructor() {
    super();
    this.#log = initLogger(this, EntityProgressCardEditor.#debug, [
      'connectedCallback',
      'disconnectedCallback',
      'setConfig',
      'toggleAccordion',
      'render',
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
    if (!hass) {
      return;
    }
    if (!this.#hassProvider.hass || this.#hassProvider.hass.entities !== hass.entities) {
      this.#hassProvider.hass = hass;
    }
    this.#currentLanguage = this.#hassProvider.language;
  }

  get hass() {
    return this.#hassProvider.hass;
  }

  setConfig(config) {
    this.#log.debug('  📎 config: ', config);
    this.#config = { ...config };
    if (!this.#hassProvider.isValid) {
      return;
    }
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

    this.#container.appendChild(EntityProgressCardEditor.#makeHelpIcon());
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

    const title = document.createTextNode(LANGUAGES[this.#currentLanguage].editor.title[inputFields.title.name]);
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
          label: LANGUAGES[this.#currentLanguage].editor.field[field.name],
          type: field.type,
          isInGroup: field.isInGroup,
          width: field.width,
          schema: field.schema !== undefined ? field.schema : null,
        })
      );
    });
  }

  #createField({ name, label, type, required, isInGroup, width, schema = null }) {
    this.#log.debug('#createField()');
    let inputElement = null;
    const value = this.#config[name] ?? '';

    switch (type) {
      case CARD.editor.fields.entity.type:
      case CARD.editor.fields.color.type:
      case CARD.editor.fields.icon.type:
      case CARD.editor.fields.tap_action.type:
      case CARD.editor.fields.double_tap_action.type:
      case CARD.editor.fields.hold_action.type:
      case CARD.editor.fields.icon_tap_action.type:
      case CARD.editor.fields.icon_double_tap_action.type:
      case CARD.editor.fields.icon_hold_action.type: {
        inputElement = document.createElement(CARD.editor.fields.tap_action.element);
        if (isInGroup) {
          inputElement.classList.add(isInGroup);
        }
        inputElement.style.width = width;
        Object.assign(inputElement, {
          id: name,
          hass: this.#hassProvider.hass,
          schema,
          computeLabel: (s) => EntityProgressCardEditor.#computeCustomLabel(s, label),
          data: {},
        });
        this.#domElements.set(name, inputElement);
        return inputElement; //break;
      }
      case CARD.editor.fields.layout.type:
      case CARD.editor.fields.bar_size.type:
      case CARD.editor.fields.theme.type:
      case CARD.editor.fields.attribute.type:
      case CARD.editor.fields.max_value_attribute.type:
        inputElement = document.createElement(CARD.editor.fields[type].element);
        inputElement.popperOptions = '';
        this.#updateChoices(inputElement, type);
        break;
      case CARD.editor.fields.number.type:
        inputElement = document.createElement(CARD.editor.fields.number.element);
        inputElement.type = CARD.editor.fields.number.type;
        break;
      case CARD.editor.fields.toggle.type: {
        inputElement = document.createElement(CARD.editor.fields.container.element);
        inputElement.classList.add(CARD.editor.fields.toggle.class);

        if (isInGroup) {
          inputElement.classList.add(isInGroup);
        } else {
          Object.assign(inputElement.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          });
        }

        const toggleLabel = document.createElement(CARD.editor.fields.text.element);
        toggleLabel.textContent = label;

        const toggle = document.createElement(CARD.editor.fields.toggle.element);

        toggle.setAttribute('checked', true);
        toggle.id = name;

        inputElement.appendChild(toggleLabel);
        inputElement.appendChild(toggle);

        this.#domElements.set(name, toggle);
        return inputElement; //break;
      }
      default:
        inputElement = document.createElement(CARD.editor.fields.default.element);
        inputElement.type = CARD.editor.fields.default.type;
        break;
    }

    this.#domElements.set(name, inputElement);
    inputElement.style.width = width;
    Object.assign(inputElement, {
      required,
      label,
      value,
      id: name,
    });

    if (isInGroup) {
      inputElement.classList.add(isInGroup);
    }

    return inputElement;
  }

  static #computeCustomLabel(s, label) {
    return label;
  }

  #updateChoices(select, type, choices = null) {
    this.#log.debug('#updateChoices() ', { select, type, choices });
    const fragment = document.createDocumentFragment();

    const list = [CARD.editor.fields.attribute.type, CARD.editor.fields.max_value_attribute.type].includes(type) ? choices : FIELD_OPTIONS[type];
    if (!list) {
      return;
    }
    this.#log.debug('  📌 list: ', list);

    list.forEach((optionData) => {
      const option = document.createElement(CARD.editor.fields.listItem.element);
      const value = optionData.value !== undefined ? optionData.value : optionData;
      option.setAttribute('value', String(value));

      switch (type) {
        case CARD.editor.fields.layout.type:
        case CARD.editor.fields.theme.type:
        case CARD.editor.fields.bar_size.type: {
          const label = LANGUAGES[this.#currentLanguage].editor.option[type][optionData.value];
          const haIcon = document.createElement(CARD.editor.fields.iconItem.element);
          haIcon.setAttribute(CARD.editor.fields.iconItem.attribute, optionData.icon);
          haIcon.classList.add(CARD.editor.fields.iconItem.class);
          option.appendChild(haIcon);
          option.append(label);
          break;
        }
        case CARD.editor.fields.attribute.type:
        case CARD.editor.fields.max_value_attribute.type:
          option.innerHTML = `${optionData.label}`;
          break;
        default:
          throw new Error('Choices: Unknown case');
      }
      // select.appendChild(option);
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
  }

  static #makeHelpIcon() {
    const link = document.createElement(CARD.documentation.link.element);
    link.href = CARD.documentation.link.documentationUrl;
    link.target = CARD.documentation.link.linkTarget;
    link.classList.add(CARD.documentation.link.class);
    const shape = document.createElement(CARD.documentation.shape.element);
    shape.classList.add(CARD.documentation.shape.class);

    const questionMark = document.createElement(CARD.documentation.questionMark.element);
    questionMark.classList.add(CARD.documentation.questionMark.class);
    questionMark.setAttribute('icon', CARD.documentation.questionMark.icon);
    Object.assign(questionMark.style, CARD.documentation.questionMark.style);

    shape.appendChild(questionMark);
    link.appendChild(shape);
    return link;
  }

  // === EDITOR EVENT ===

  #addEventListener() {
    this.#log.debug('#addEventListener');
    const allFields = [
      ...Object.values(this.editorFields.basicConfiguration),
      ...Object.values(this.editorFields.content.field),
      ...Object.values(this.editorFields.interaction.field),
      ...Object.values(this.editorFields.theme.field),
    ];

    allFields.forEach((field) => {
      this.#addEventListenerFor(field.name, field.type);
    });

    this.#accordionTitleList.forEach((title, index) => {
      this.#resourceManager.addEventListener(
        title,
        CARD.interactions.event.click,
        () => {
          this.toggleAccordion(index);
        },
        { passive: true }, // options
        `accordionTitle-${index}`
      );
    });
  }

  #addEventListenerFor(name, type) {
    this.#log.debug(`#addEventListenerFor(${name}, ${type})`);
    if (!this.#domElements.get(name)) {
      console.error(`Element ${name} not found!`);
      return;
    }
    const isHASelect = CARD.editor.fields[type]?.element === CARD.editor.fields.select.element;
    const isToggle = CARD.editor.fields[type]?.element === CARD.editor.fields.toggle.element;
    const events = isHASelect ? CARD.interactions.event.HASelect : isToggle ? CARD.interactions.event.toggle : CARD.interactions.event.other;

    this.#log.debug('Event:', events);

    if (isHASelect) {
      this.#resourceManager.addEventListener(
        this.#domElements.get(name),
        CARD.interactions.event.closed,
        (event) => {
          event.stopPropagation();
        },
        { passive: true }, // options
        `close-StopPropa-${name}`
      );
    }
    events.forEach((eventType) => {
      this.#resourceManager.addEventListener(
        this.#domElements.get(name),
        eventType,
        this.#onChanged.bind(this),
        { passive: true },
        `${eventType}-${name}`
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

    const standardFieldType = new Set(['ha-select', 'ha-textfield']);
    const excludeStandardType = new Set([CARD.editor.keyMappings.attribute, CARD.editor.keyMappings.max_value_attribute]);

    const updates = [];

    for (const [key, element] of this.#domElements) {
      if (standardFieldType.has(element.localName) && !excludeStandardType.has(key)) {
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
    this.#log.debug(`  📎 entity: ${entity}`);
    this.#log.debug(`  📎 attribute: ${attribute}`);

    // Create an EntityOrValue instance for the current entity
    const curEntity = new EntityOrValue();
    curEntity.value = this.#config[entity];
    const attributeList = curEntity.attributesListForEditor;
    this.#log.debug('  📎 attribute liste:', attributeList);

    // If the entity has changed and the current entity has attributes, regenerate the list.
    if (this.#previous[entity] !== this.#config[entity] && curEntity.hasAttribute) {
      this.#previous[entity] = this.#config[entity];
      const targetElement = this.#domElements.get(attribute);
      if (targetElement) {
        this.#updateChoices(targetElement, attribute, attributeList);
      }
      this.#log.debug(`  ✅ updateFields - ${entity} attributes list: `, attributeList);
    }
    // If the attribute is not defined in the config AND
    // the entity has attributes AND
    // the selected value does not yet match the defaultAttribute:
    if (this.#config[attribute] === undefined && curEntity.hasAttribute) {
      this.#log.debug(`  ✅ updateFields - Attribute ${attribute} (default): in progress...`);
      this.#applySelectValueOnUpdate(this.#domElements.get(attribute), curEntity.defaultAttribute);
    }

    if (
      curEntity.hasAttribute &&
      has.validKey(curEntity.attributes, this.#config[attribute]) &&
      this.#domElements.get(attribute).value !== this.#config[attribute]
    ) {
      this.#domElements.get(attribute).value = this.#config[attribute];
      this.#log.debug(`  ✅ updateFields - Attribute ${attribute}: `, curEntity.attributes);
    }

    return curEntity.hasAttribute;
  }

  /**
   * Applies a default value to a select element once it has finished updating.
   * Checks if the value exists among the options before setting it.
   *
   * @param {HTMLElement} select - The select element to update.
   * @param {string} value - The value to apply.
   */
  async #applySelectValueOnUpdate(select, value) {
    await select.updateComplete;

    const values = Array.from(select.children).map((el) => el.getAttribute('value'));
    if (values.includes(value)) {
      select.value = value;
      this.#log.debug('  ✅ applySelectValueOnUpdate - Entity attribute (default): ', value);
    } else {
      this.#log.debug('  ❌ applySelectValueOnUpdate - Default attribute not found in select options', values);
    }
  }

  #updateToggleFields() {
    const hide = this.#config.hide || [];
    const toggleMappings = {
      toggle_force_circular_background: this.#config.force_circular_background, // === true,
      toggle_unit: !this.#config.disable_unit, // !== true
      toggle_icon: !hide.includes('icon'),
      toggle_name: !hide.includes('name'),
      toggle_value: !hide.includes('value'),
      toggle_secondary_info: !hide.includes('secondary_info'),
      toggle_progress_bar: !hide.includes('progress_bar'),
    };

    const toggleUpdates = [];
    for (const [toggleKey, shouldBeChecked] of Object.entries(toggleMappings)) {
      const toggle = this.#domElements.get(toggleKey);
      if (toggle && toggle.checked !== shouldBeChecked) {
        toggleUpdates.push(() => (toggle.checked = shouldBeChecked));
      }
    }

    toggleUpdates.forEach((update) => update());
  }
  // === ACCORDION ANIMATION ===

  toggleAccordion(index) {
    const accordion = this.#accordionList[index];
    const panel = accordion.querySelector('.accordion-content');
    if (!panel) return;

    const isExpanding = !accordion.classList.contains('expanded');

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
      `accordionTransition-${index}`
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

/******************************************************************************************
 * 🔧 Register card & badge editors
 */
customElements.define(CARD.meta.card.editor, EntityProgressCardEditor);
customElements.define(CARD.meta.badge.editor, EntityProgressBadgeEditor);
