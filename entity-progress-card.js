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
 * @version 1.4.1
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION = '1.4.1';
const CARD = {
  meta: {
    typeName: 'entity-progress-card',
    name: 'Entity Progress Card',
    description: 'A cool custom card to show current entity status with a progress bar.',
    editor: 'entity-progress-card-editor',
  },
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
    entity: {
      state: { unavailable: 'unavailable', unknown: 'unknown', notFound: 'notFound', idle: 'idle', active: 'active', paused: 'paused' },
      type: { timer: 'timer', light: 'light', cover: 'cover', fan: 'fan', climate: 'climate', counter: 'counter', number: 'number' },
      class: { shutter: 'shutter', battery: 'battery' },
    },
    msFactor: 1000,
    shadowMode: 'open',
    refresh: { ratio: 500, min: 250, max: 1000 },
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
    debug: { card: false, editor: false, interactionHandler: false, ressourceManager: false },
    dev: false,
  },
  htmlStructure: {
    card: { element: 'ha-card' },
    sections: {
      container: { element: 'div', class: 'container' },
      left: { element: 'div', class: 'left' },
      right: { element: 'div', class: 'right' },
    },
    elements: {
      icon: { element: 'div', class: 'icon' },
      shape: { element: 'div', class: 'shape' },
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
      radius: '4px',
      sizeOptions: {
        small: { label: 'small', mdi: 'mdi:size-s', size: '8px' },
        medium: { label: 'medium', mdi: 'mdi:size-m', size: '12px' },
        large: { label: 'large', mdi: 'mdi:size-l', size: '16px' },
      },
    },
    dynamic: {
      badge: {
        color: { var: '--epb-badge-color', default: 'var(--orange-color)' },
        backgroundColor: { var: '--epb-badge-bgcolor', default: 'white' },
      },
      iconAndShape: {
        color: { var: '--epb-icon-and-shape-color', default: 'var(--state-icon-color)' },
      },
      progressBar: {
        color: { var: '--epb-progress-bar-color', default: 'var(--state-icon-color)' },
        size: { var: '--epb-progress-bar-size', default: '0%' },
        background: { var: '--epb-progress-bar-background-color' },
        orientation: { rtl: 'rtl_orientation', ltr: 'ltr_orientation' },
      },
      watermark: {
        low: { value: { var: '--epb-low-watermark-value', default: 20 }, color: { var: '--epb-low-watermark-color', default: 'red' } },
        high: { value: { var: '--epb-high-watermark-value', default: 80 }, color: { var: '--epb-high-watermark-color', default: 'red' } },
        opacity: { var: '--epb-watermark-opacity-value', default: 0.8 },
      },
      secondaryInfoError: { class: 'secondary-info-error' },
      show: 'show',
      hide: 'hide',
      clickable: { card: 'clickableCard', icon: 'clickableIcon' },
      hiddenComponent: {
        icon: { label: 'icon', class: 'hide_icon' },
        shape: { label: 'shape', class: 'hide_shape' },
        name: { label: 'name', class: 'hide_name' },
        secondary_info: { label: 'secondary_info', class: 'hide_secondary_info' },
        value: { label: 'value' },
        progress_bar: { label: 'progress_bar', class: 'hide_progress_bar' },
      },
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
    customTheme: { expectedKeys: ['min', 'max', 'color'] },
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
  watermark: {
    low: 20,
    low_color: 'red',
    high: 80,
    high_color: 'red',
    opacity: 0.8,
    type: 'block',
    disable_low: false,
    disable_high: false,
  },
};

CARD.console = {
  message: `%c✨${CARD.meta.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
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

const LANGUAGES = {
  en: {
    card: {
      msg: {
        entityError: "entity: The 'entity' parameter is required!",
        entityNotFound: 'Entity not found',
        attributeNotFound: 'attribute: Attribute not found in HA.',
        minValueError: 'min_value: Check your min_value.',
        maxValueError: 'max_value: Check your max_value.',
        decimalError: 'decimal: This value cannot be negative.',
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
        entityError: "entity: Le paramètre 'entity' est requis !",
        entityNotFound: 'Entité introuvable',
        attributeNotFound: 'attribute: Attribut introuvable dans HA.',
        minValueError: 'min_value: Vérifiez votre min_value.',
        maxValueError: 'max_value: Vérifiez votre max_value.',
        decimalError: 'decimal: La valeur ne peut pas être négative.',
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
        entityError: "entity: ¡El parámetro 'entity' es obligatorio!",
        entityNotFound: 'Entidad no encontrada',
        attributeNotFound: 'attribute: Atributo no encontrado en HA.',
        minValueError: 'min_value: Verifique su min_value.',
        maxValueError: 'max_value: Verifique su max_value.',
        decimalError: 'decimal: El valor no puede ser negativo.',
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
          medium: 'Media',
          large: 'Grande',
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
        entityError: "entity: Il parametro 'entity' è obbligatorio!",
        entityNotFound: 'Entità non trovata',
        attributeNotFound: 'attribute: Attributo non trovato in HA.',
        minValueError: 'min_value: Controlla il tuo min_value.',
        maxValueError: 'max_value: Controlla il tuo max_value.',
        decimalError: 'decimal: Questo valore non può essere negativo.',
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
        entityError: "entity: Der Parameter 'entity' ist erforderlich!",
        entityNotFound: 'Entität nicht gefunden',
        attributeNotFound: 'attribute: Attribut in HA nicht gefunden.',
        minValueError: 'min_value: Überprüfen Sie Ihren min_value.',
        maxValueError: 'max_value: Überprüfen Sie Ihren max_value.',
        decimalError: 'decimal: Negative Werte sind nicht zulässig.',
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
        entityError: "entity: De parameter 'entity' is verplicht!",
        entityNotFound: 'Entiteit niet gevonden',
        attributeNotFound: 'attribute: Attribuut niet gevonden in HA.',
        minValueError: 'min_value: Controleer je min_value.',
        maxValueError: 'max_value: Controleer je max_value.',
        decimalError: 'decimal: Deze waarde kan niet negatief zijn.',
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
        entityError: "entity: Parametar 'entity' je obavezan!",
        entityNotFound: 'Entitet nije pronađen',
        attributeNotFound: 'attribute: Atribut nije pronađen u HA.',
        minValueError: 'min_value: Provjerite svoj min_value.',
        maxValueError: 'max_value: Provjerite svoj max_value.',
        decimalError: 'decimal: Ova vrijednost ne može biti negativna.',
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
          small: 'Mali',
          medium: 'Srednje',
          large: 'Veliko',
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
        entityError: "entity: Parametr 'entity' jest wymagany!",
        entityNotFound: 'Encji nie znaleziono',
        attributeNotFound: 'attribute: Atrybut nie znaleziony w HA.',
        minValueError: 'min_value: Sprawdź swój min_value.',
        maxValueError: 'max_value: Sprawdź swój max_value.',
        decimalError: 'decimal: Ta wartość nie może być ujemna.',
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
          small: 'Mały',
          medium: 'Średni',
          large: 'Duży',
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
        entityError: "entity: Параметарот 'entity' е задолжителен!",
        entityNotFound: 'Ентитетот не е пронајден',
        attributeNotFound: 'attribute: Атрибутот не е пронајден во HA.',
        minValueError: 'min_value: Проверете го вашиот min_value.',
        maxValueError: 'max_value: Проверете го вашиот max_value.',
        decimalError: 'decimal: Ова вредност не може да биде негативна.',
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
          small: 'Мало',
          medium: 'Средно',
          large: 'Големо',
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
        entityError: "entity: O parâmetro 'entity' é obrigatório!",
        entityNotFound: 'Entidade não encontrada',
        attributeNotFound: 'attribute: Atributo não encontrado no HA.',
        minValueError: 'min_value: Verifique o seu min_value.',
        maxValueError: 'max_value: Verifique o seu max_value.',
        decimalError: 'decimal: Este valor não pode ser negativo.',
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
          small: 'Pequeno',
          medium: 'Médio',
          large: 'Grande',
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
        entityError: "entity: Parameteren 'entity' er påkrævet!",
        entityNotFound: 'Enheden blev ikke fundet',
        attributeNotFound: 'attribute: Attribut ikke fundet i HA.',
        minValueError: 'min_value: Tjekk din min_value.',
        maxValueError: 'max_value: Tjekk din max_value.',
        decimalError: 'decimal: Denne værdi kan ikke være negativ.',
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
          medium: 'Mellem',
          large: 'Stor',
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
        entityError: "entity: Parameteret 'entity' er påkrevd!",
        entityNotFound: 'Enheten ble ikke funnet',
        attributeNotFound: 'attribute: Attributt ikke funnet i HA.',
        minValueError: 'min_value: Sjekk din min_value.',
        maxValueError: 'max_value: Sjekk din max_value.',
        decimalError: 'decimal: Denne verdien kan ikke være negativ.',
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
          medium: 'Middels',
          large: 'Stor',
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
        entityError: "entity: Parametern 'entity' är obligatorisk!",
        entityNotFound: 'Enhet ej funnen',
        attributeNotFound: 'attribute: Attributet hittades inte i HA.',
        minValueError: 'min_value: Kontrollera ditt min_value.',
        maxValueError: 'max_value: Kontrollera ditt max_value.',
        decimalError: 'decimal: Detta värde kan inte vara negativt.',
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
        entityError: "οντότητα: Η παράμετρος 'entity' είναι υποχρεωτική!",
        entityNotFound: 'Η οντότητα δεν βρέθηκε',
        attributeNotFound: 'χαρακτηριστικό: Το χαρακτηριστικό δεν βρέθηκε στο HA.',
        minValueError: 'min_value: Ελέγξτε την ελάχιστη τιμή.',
        maxValueError: 'max_value: Ελέγξτε τη μέγιστη τιμή.',
        decimalError: 'decimal: Αυτή η τιμή δεν μπορεί να είναι αρνητική.',
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
          small: 'Μικρό',
          medium: 'Μεσαίο',
          large: 'Μεγάλο',
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
        entityError: "entiteetti: 'entity'-parametri on pakollinen!",
        entityNotFound: 'Entiteettiä ei löydy',
        attributeNotFound: 'attribuutti: Attribuuttia ei löydy HA:sta.',
        minValueError: 'min_value: Tarkista minimiarvo.',
        maxValueError: 'max_value: Tarkista maksimiarvo.',
        decimalError: 'decimal: Arvo ei voi olla negatiivinen.',
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
          medium: 'Keskikokoinen',
          large: 'Suuri',
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
        entityError: "entitate: Parametrul 'entity' este obligatoriu!",
        entityNotFound: 'Entitatea nu a fost găsită',
        attributeNotFound: 'atribut: Atributul nu a fost găsit în HA.',
        minValueError: 'min_value: Verifică valoarea minimă.',
        maxValueError: 'max_value: Verifică valoarea maximă.',
        decimalError: 'decimal: Această valoare nu poate fi negativă.',
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
          small: 'Mic',
          medium: 'Mediu',
          large: 'Mare',
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
        entityError: "entity：必须提供 'entity' 参数！",
        entityNotFound: '未找到实体',
        attributeNotFound: 'attribute：HA 中未找到该属性。',
        minValueError: 'min_value：请检查最小值。',
        maxValueError: 'max_value：请检查最大值。',
        decimalError: 'decimal：该值不能为负数。',
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
        entityError: 'entity：「entity」パラメータは必須です！',
        entityNotFound: 'エンティティが見つかりません',
        attributeNotFound: 'attribute：HA に属性が見つかりませんでした。',
        minValueError: 'min_value：最小値を確認してください。',
        maxValueError: 'max_value：最大値を確認してください。',
        decimalError: 'decimal：負の値は使用できません。',
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
        entityError: "entity: 'entity' 매개변수는 필수입니다!",
        entityNotFound: '엔티티를 찾을 수 없습니다',
        attributeNotFound: 'attribute: HA에서 속성을 찾을 수 없습니다.',
        minValueError: 'min_value: 최소값을 확인하세요.',
        maxValueError: 'max_value: 최대값을 확인하세요.',
        decimalError: 'decimal: 음수는 허용되지 않습니다.',
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
          small: '작음',
          medium: '보통',
          large: '큼',
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
        entityError: "entity: 'entity' parametresi gereklidir!",
        entityNotFound: 'Varlık bulunamadı',
        attributeNotFound: 'attribute: HA içinde öznitelik bulunamadı.',
        minValueError: 'min_value: Minimum değeri kontrol edin.',
        maxValueError: 'max_value: Maksimum değeri kontrol edin.',
        decimalError: 'decimal: Bu değer negatif olamaz.',
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
        entityError: "الكيان: المعامل 'entity' مطلوب!",
        entityNotFound: 'لم يتم العثور على الكيان',
        attributeNotFound: 'السمة: السمة غير موجودة في HA.',
        minValueError: 'min_value: تحقق من القيمة الدنيا.',
        maxValueError: 'max_value: تحقق من القيمة القصوى.',
        decimalError: 'decimal: لا يمكن أن تكون هذه القيمة سالبة.',
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
          small: 'صغير',
          medium: 'متوسط',
          large: 'كبير',
        },
        layout: {
          horizontal: 'أفقي (افتراضي)',
          vertical: 'رأسي',
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

const CARD_HTML = `
    <!-- Main container -->
    <${CARD.htmlStructure.sections.container.element} class="${CARD.htmlStructure.sections.container.class}">
        <!-- icon/shape -->
        <${CARD.htmlStructure.sections.left.element} class="${CARD.htmlStructure.sections.left.class}">
            <${CARD.htmlStructure.elements.shape.element} class="${CARD.htmlStructure.elements.shape.class}"></${CARD.htmlStructure.elements.shape.element}>
            <${CARD.htmlStructure.elements.icon.element} class="${CARD.htmlStructure.elements.icon.class}"></${CARD.htmlStructure.elements.icon.element}>
            <${CARD.htmlStructure.elements.badge.container.element} class="${CARD.htmlStructure.elements.badge.container.class}">
                <${CARD.htmlStructure.elements.badge.icon.element} class="${CARD.htmlStructure.elements.badge.icon.class}"></${CARD.htmlStructure.elements.badge.icon.element}>
            </${CARD.htmlStructure.elements.badge.container.element}>
        </${CARD.htmlStructure.sections.left.element}>

        <!-- infos/progress bar -->
        <${CARD.htmlStructure.sections.right.element} class="${CARD.htmlStructure.sections.right.class}">
            <${CARD.htmlStructure.elements.nameGroup.element} class="${CARD.htmlStructure.elements.nameGroup.class}">
              <${CARD.htmlStructure.elements.nameCombined.element} class="${CARD.htmlStructure.elements.nameCombined.class}">
                <${CARD.htmlStructure.elements.name.element} class="${CARD.htmlStructure.elements.name.class}"></${CARD.htmlStructure.elements.name.element}>
                <${CARD.htmlStructure.elements.nameCustomInfo.element} class="${CARD.htmlStructure.elements.nameCustomInfo.class}"></${CARD.htmlStructure.elements.nameCustomInfo.element}>
              </${CARD.htmlStructure.elements.nameCombined.element}>
            </${CARD.htmlStructure.elements.nameGroup.element}>
            <${CARD.htmlStructure.elements.secondaryInfo.element} class="${CARD.htmlStructure.elements.secondaryInfo.class}">
                <${CARD.htmlStructure.elements.detailGroup.element} class="${CARD.htmlStructure.elements.detailGroup.class}">
                  <${CARD.htmlStructure.elements.detailCombined.element} class="${CARD.htmlStructure.elements.detailCombined.class}">
                    <${CARD.htmlStructure.elements.customInfo.element} class="${CARD.htmlStructure.elements.customInfo.class}"></${CARD.htmlStructure.elements.customInfo.element}>
                    <${CARD.htmlStructure.elements.stateAndProgressInfo.element} class="${CARD.htmlStructure.elements.stateAndProgressInfo.class}"></${CARD.htmlStructure.elements.stateAndProgressInfo.element}>
                  </${CARD.htmlStructure.elements.detailCombined.element}>
                </${CARD.htmlStructure.elements.detailGroup.element}>
                <${CARD.htmlStructure.elements.progressBar.container.element} class="${CARD.htmlStructure.elements.progressBar.container.class}">
                    <${CARD.htmlStructure.elements.progressBar.bar.element} class="${CARD.htmlStructure.elements.progressBar.bar.class}">
                        <${CARD.htmlStructure.elements.progressBar.inner.element} class="${CARD.htmlStructure.elements.progressBar.inner.class}"></${CARD.htmlStructure.elements.progressBar.inner.element}>
                        <${CARD.htmlStructure.elements.progressBar.lowWatermark.element} class="${CARD.htmlStructure.elements.progressBar.lowWatermark.class}"></${CARD.htmlStructure.elements.progressBar.lowWatermark.element}>
                        <${CARD.htmlStructure.elements.progressBar.highWatermark.element} class="${CARD.htmlStructure.elements.progressBar.highWatermark.class}"></${CARD.htmlStructure.elements.progressBar.highWatermark.element}>
                    </${CARD.htmlStructure.elements.progressBar.bar.element}>
                </${CARD.htmlStructure.elements.progressBar.container.element}>
            </${CARD.htmlStructure.elements.secondaryInfo.element}>
        </${CARD.htmlStructure.sections.right.element}>
    </${CARD.htmlStructure.sections.container.element}>
`;

const CARD_CSS = `
  ${CARD.htmlStructure.card.element} {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    box-sizing: border-box;
    margin: 0 auto;
    overflow: hidden;
    font-family: var(--ha-font-family-body);
  }

  .${CARD.style.dynamic.clickable.card} {
    cursor: pointer;
  }

  .${CARD.style.dynamic.clickable.card}:hover {
    background-color: color-mix(in srgb, var(--card-background-color) 96%, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) 4%);
  }

  .${CARD.style.dynamic.clickable.card}:active {
    background-color: color-mix(in srgb, var(--card-background-color) 85%, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) 15%);
    transition: background-color 0.5s ease;
  }

  /* main container */
  .${CARD.htmlStructure.sections.container.class} {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0px 10px;
    gap: 10px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.container.class} {
    min-height: ${CARD.layout.orientations.vertical.minHeight};
    flex-direction: column;
  }
  .${CARD.layout.orientations.horizontal.label} .${CARD.htmlStructure.sections.container.class} {
    min-height: ${CARD.layout.orientations.horizontal.minHeight};
    flex-direction: row;
  }

  /* .left: icon & shape */
  .${CARD.htmlStructure.sections.left.class} {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .${CARD.layout.orientations.vertical.label}.${CARD.style.bar.sizeOptions.small.label} .${CARD.htmlStructure.sections.left.class} {
    margin-top: 10px;
  }

  .${CARD.layout.orientations.vertical.label}.${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.sections.left.class} {
    margin-top: 12px;
  }

  .${CARD.layout.orientations.vertical.label}.${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.sections.left.class} {
    margin-top: 14px;
  }

  .${CARD.htmlStructure.elements.shape.class} {
    display: block;
    position: absolute;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default});
    isolation: isolate;
    opacity: 0.2;
  }

  .${CARD.htmlStructure.elements.icon.class} {
    position: relative;
    z-index: 1;
    width: 24px;
    height: 24px;
    color: var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default});
  }
  .${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover {
    cursor: pointer;
  }   
      
  .${CARD.style.dynamic.clickable.icon} .${CARD.htmlStructure.sections.left.class}:hover .${CARD.htmlStructure.elements.shape.class} {
    opacity: 0.4;
  }

  /* .right: name & secondary info */
  .${CARD.htmlStructure.sections.right.class} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    overflow: hidden;
    width:100%;
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.right.class} {
    flex-grow: 0;
  }

  .${CARD.htmlStructure.elements.nameGroup.class} {
    display: flex;
    flex-direction: row;

    width: 100%;
    min-width: 0;
    height: 20px;
  }

  .${CARD.htmlStructure.elements.nameCombined.class} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
    line-height: 20px;
    letter-spacing: 0.1px;
    text-align: left;
  }

  .${CARD.htmlStructure.elements.detailGroup.class} {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 16px;
    min-width: 45px;
    max-width: 60%;
    text-align: left;
    line-height: 16px;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .${CARD.htmlStructure.elements.detailCombined.class} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: var(--primary-text-color);
    font-size: var(--ha-font-size-s);
    font-weight: var(--ha-font-weight-body);
    line-height: 16px;
    letter-spacing: 0.4px;
    text-align: left;
  }


  .${CARD.htmlStructure.elements.secondaryInfo.class} {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.secondaryInfo.class} {
    display: block;
  }
    
  /* Progress bar */
  .${CARD.htmlStructure.elements.progressBar.container.class} {
    flex-grow: 1;
    height: 16px; /* Même hauteur que le pourcentage */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .${CARD.htmlStructure.elements.progressBar.bar.class} {
    width: 100%;
    height: ${CARD.style.bar.sizeOptions.small.size};
    max-height: ${CARD.style.bar.sizeOptions.large.size};
    background-color: var(${CARD.style.dynamic.progressBar.background.var}, var(--divider-color));
    border-radius: ${CARD.style.bar.radius};
    overflow: hidden;
    position: relative;
  }

  .${CARD.style.dynamic.progressBar.orientation.rtl} .${CARD.htmlStructure.elements.progressBar.bar.class} {
    transform: scaleX(-1);
  }

  .${CARD.style.bar.sizeOptions.small.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
    height: ${CARD.style.bar.sizeOptions.small.size};
    max-height: ${CARD.style.bar.sizeOptions.small.size};
  }

  .${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
    height: ${CARD.style.bar.sizeOptions.medium.size};
    max-height: ${CARD.style.bar.sizeOptions.medium.size};
  }

  .${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.bar.class} {
    height: ${CARD.style.bar.sizeOptions.large.size};
    max-height: ${CARD.style.bar.sizeOptions.large.size};
  }

  .${CARD.htmlStructure.elements.progressBar.inner.class} {
    height: 100%;
    width: var(${CARD.style.dynamic.progressBar.size.var}, ${CARD.style.dynamic.progressBar.size.default});
    background-color: var(${CARD.style.dynamic.progressBar.color.var}, ${CARD.style.dynamic.progressBar.color.default});
    transition: width 0.3s ease;
    will-change: width;
  }

  .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
    display: none;
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    width: var(--epb-low-watermark-value, 20%);
    background-color: var(--epb-low-watermark-color, var(--red-color));
    mix-blend-mode: hard-light;
    opacity: var(--epb-watermark-opacity-value, 0.8);  
  }
  .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
    display: none;
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    width: calc(100% - var(--epb-high-watermark-value, 80%));
    background-color: var(--epb-high-watermark-color, var(--red-color));
    mix-blend-mode: hard-light;
    opacity: var(--epb-watermark-opacity-value, 0.8);  
  }

  .${CARD.style.dynamic.show}-HWM-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class} {
    right: calc(100% - var(--epb-high-watermark-value, 80%));
    width: 1px;
  }
  .${CARD.style.dynamic.show}-LWM-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class}  {
    left: var(--epb-low-watermark-value, 20%);
    width: 1px;
  }


  .${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.nameGroup.class} {
    height: 18px;
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.nameGroup.class} {
    align-items: center;
    justify-content: center;
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
    align-items: center;
    justify-content: center;
    width: 100%; /* ou 100% de son parent */
    max-width: none; /* si tu veux supprimer la limite */
  }

  .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} > span {
    display: inline-block;
    flex-shrink: 0;
  }

  .${CARD.style.bar.sizeOptions.small.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
    margin-bottom: 1px;
  }

  .${CARD.style.bar.sizeOptions.medium.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
    height: 15px;
    font-size: 0.8em;
  }

  .${CARD.style.bar.sizeOptions.large.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
    height: 13px;
    font-size: 0.8em;
  }

  .${CARD.editor.fields.container.class} {
    display: flex;
    flex-direction: column;
    gap: 25px;
    padding-bottom: 70px;
  }

  .${CARD.editor.fields.iconItem.class} {
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }

  .${CARD.documentation.link.class} {
    text-decoration: none;
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 600;
  }

  .${CARD.documentation.shape.class} {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
  }
  .${CARD.documentation.shape.class}:hover {
    background-color: color-mix(in srgb, var(--card-background-color) 90%, var(--secondary-text-color) 10%);
  }

  .${CARD.documentation.questionMark.class} {
    color: var(--primary-text-color);
  }

  .${CARD.htmlStructure.elements.badge.container.class} {
    position: absolute;
    z-index: 2;
    top: -3px;
    right: -3px;
    inset-inline-end: -3px;
    inset-inline-start: initial;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background-color: var(${CARD.style.dynamic.badge.backgroundColor.var}, ${CARD.style.dynamic.badge.backgroundColor.default});
    display: none;
    align-items: center;
    justify-content: center;
  }

  .${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.icon.class} {
    height: 12px;
    width: 12px;
    display: flex; /* h/w ratio */
    align-items: center;
    justify-content: center;
    color: var(${CARD.style.dynamic.badge.color.var}, ${CARD.style.dynamic.badge.color.default});
  }

  .${CARD.style.dynamic.hiddenComponent.icon.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.left.class},
  .${CARD.style.dynamic.hiddenComponent.name.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.nameGroup.class},
  .${CARD.style.dynamic.hiddenComponent.shape.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.shape.class},
  .${CARD.style.dynamic.hiddenComponent.progress_bar.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class},
  .${CARD.style.dynamic.hiddenComponent.secondary_info.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.detailGroup.class} {
    display: flex;
    visibility: hidden;
  }

  .${CARD.editor.fields.accordion.item.class} {
    display: block;
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--card-background-color) 80%, var(--secondary-text-color) 20%);
    border-radius: 6px;
    overflow: visible;
  }
  .${CARD.editor.fields.accordion.icon.class} {
    color: var(--secondary-text-color);
    margin-right: 8px;
  }
  .${CARD.editor.fields.accordion.title.class} {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    position: relative;
    background-color: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    padding: 18px;
    width: 100%;
    height: 48px;
    border: none;
    text-align: left;
    font-size: 15px;
    transition: 0.4s;
  }

  .${CARD.editor.fields.accordion.title.class}:focus {
    background-color: var(--secondary-background-color);
  }

  .${CARD.editor.fields.accordion.arrow.class} {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-left: auto;
    color: var(--primary-text-color);
    transition: transform 0.2s ease-out;
  }
  .accordion.expanded .${CARD.editor.fields.accordion.arrow.class} {
    transform: rotate(180deg);
  }
  .${CARD.editor.fields.accordion.content.class} {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    column-gap: 10px;
    row-gap: 20px;
    padding: 0px 18px;
    background-color: transparent;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition:
      max-height 0.2s cubic-bezier(0.33, 0, 0.2, 1),
      padding 0.2s cubic-bezier(0.33, 0, 0.2, 1),
      opacity 0.2s ease;
  }

  .accordion.expanded .${CARD.editor.fields.accordion.content.class} {
    /* max-height: défini par script JS */
    padding-top: 30px;
    padding-bottom: 30px;
    opacity: 1;
    overflow: visible;
  }

  .${CARD.editor.fields.accordion.content.class} > * {
    opacity: 0;
    transition: opacity 0.2s ease 0.15s;
  }
  .accordion.expanded .${CARD.editor.fields.accordion.content.class} > * {
    opacity: 1;
  }
  .accordion.collapsing .${CARD.editor.fields.accordion.content.class} > * {
    opacity: 0 !important;
    transition: opacity 0.1s; /* désactive transition pendant repli */
  }

  ha-select {
    --mdc-menu-max-height: 250px; /* Définit la hauteur maximale */
  }

  /* show/hide */
  .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.attribute} .${CARD.editor.keyMappings.attribute},
  .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.max_value_attribute} .${CARD.editor.keyMappings.max_value_attribute},
  .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.theme} .${CARD.editor.keyMappings.theme},
  .${CARD.style.dynamic.hiddenComponent.icon.class} .${CARD.htmlStructure.sections.left.class},
  .${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.elements.nameGroup.class},
  .${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class},
  .${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class},
  .${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.elements.detailGroup.class} {
    display: none;
  }

  .${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.container.class},
  .${CARD.style.dynamic.show}-HWM-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class},
  .${CARD.style.dynamic.show}-LWM-line-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class},
  .${CARD.style.dynamic.show}-HWM-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.highWatermark.class},
  .${CARD.style.dynamic.show}-LWM-${CARD.htmlStructure.elements.progressBar.watermark.class} .${CARD.htmlStructure.elements.progressBar.lowWatermark.class} {
    display: flex;
  }

  .${CARD.editor.fields.toggle.class} {
    display: flex;
    align-item: center;
    gap: 8px;
  }`;

/******************************************************************************************
 * Dev mode
 */

if (CARD.config.dev) {
  CARD.meta.typeName = `${CARD.meta.typeName}-dev`;
  CARD.meta.name = `${CARD.meta.typeName} (dev)`;
  CARD.meta.editor = `${CARD.meta.editor}-dev`;
}
/******************************************************************************************
 * Debug
 *
 * @param {string} msg
 * @param {any} val
 */
const debugLog = (msg, val) => {
  if (val !== undefined && val !== null) {
    console.debug(msg, val);
  } else {
    console.debug(msg);
  }
};

/******************************************************************************************
 * Helper class for formatting value && unit.
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate its internal data.
 *
 * @class NumberFormatter
 */

class NumberFormatter {
  static unitsNoSpace = {
    'fr-FR': new Set(['j', 'd', 'h', 'min', 'ms', 'μs', '°']),
    'de-DE': new Set(['d', 'h', 'min', 'ms', 'μs', '°']),
    'en-US': new Set(['d', 'h', 'min', 'ms', 'μs', '°', '%']),
  };

  static getSpaceCharacter(locale, unit) {
    const set = this.unitsNoSpace[locale] || this.unitsNoSpace['en-US'];
    return set.has(unit.toLowerCase()) ? '' : CARD.config.unit.space;
  }

  static formatValueAndUnit(value, decimal = 2, unit = '', locale = 'en-US', unitSpacing = CARD.config.unit.unitSpacing.auto) {
    if (value === undefined || value === null) return '';

    const formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    }).format(value);

    if (!unit) return formattedValue;

    const spaceMap = {
      space: CARD.config.unit.space,
      'no-space': '',
      auto: () => this.getSpaceCharacter(locale, unit),
    };
    const space = typeof spaceMap[unitSpacing] === 'function' ? spaceMap[unitSpacing]() : spaceMap[unitSpacing];

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
      if (totalSeconds < 60) return this.formatValueAndUnit(parseFloat(seconds), decimal, 's', locale, unitSpacing);
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

/**
 * Helper class for managing numeric values.
 * This class validates and stor a numeric value.
 *
 * @class ValueHelper
 */
class ValueHelper {
  #value = null;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (ValueHelper.#validate(newValue)) this.#defaultValue = newValue;
  }

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

  /******************************************************************************************
   * Validates if a value is a valid float.
   */
  static #validate(value) {
    return Number.isFinite(value);
  }
}

/**
 * Represents a non-negative integer value that can be valid or invalid.
 *
 * @class Decimal
 */
class DecimalHelper {
  #value = CARD.config.decimal.percentage;
  #isValid = false;
  #defaultValue = null;

  constructor(newValue = null) {
    if (DecimalHelper.#validate(newValue)) this.#defaultValue = newValue;
  }
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

  /******************************************************************************************
   * Validates if a value is a valid non-negative integer.
   */
  static #validate(value) {
    return Number.isInteger(value) && value >= 0;
  }
}

/**
 * Represents a unit of measurement, stored as a string.
 *
 * @class Unit
 */
class UnitHelper {
  #value = CARD.config.unit.default;
  #isDisabled = false;

  set value(newValue) {
    this.#value = newValue.trim() ?? CARD.config.unit.default;
  }
  get value() {
    return this.#isDisabled ? '' : this.#value;
  }
  set isDisabled(newValue) {
    this.#isDisabled = typeof newValue === 'boolean' ? newValue : false;
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
  toString() {
    return this.#isDisabled ? '' : this.#value;
  }
}

/**
 * Helper class for calculating and formatting percentages.
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate its internal data.
 *
 * @class PercentHelper
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
  unitSpacing = CARD.config.unit.unitSpacing.auto;

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  /******************************************************************************************
   * Getter/Setter
   */
  set isTimer(newValue) {
    this.#isTimer = typeof newValue === 'boolean' ? newValue : false;
  }
  get isTimer() {
    return this.#isTimer;
  }
  set isReversed(newValue) {
    this.#isReversed = typeof newValue === 'boolean' ? newValue : CARD.config.reverse;
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
    return this.max - this.min;
  }
  get correctedValue() {
    return this.actual - this.min;
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
  valueForThemes(valueBasedOnPercentage) {
    /****************************************************************************************
     * Calculates the value to display based on the selected theme and unit system.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius before returning.
     * - If the theme is linear or the unit is the default, the percentage value is returned.
     */
    let value = this.actual;
    if (this.unit === CARD.config.unit.fahrenheit) {
      value = ((value - 32) * 5) / 9;
    }
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

/**
 * Manages the theme and its associated icon and color based on a percentage value.
 *
 * @class ThemeManager
 */
class ThemeManager {
  #theme = null;
  #icon = null;
  #color = null;
  #value = 0;
  #isValid = false;
  #isLinear = false;
  #isBasedOnPercentage = false;
  #currentStyle = null;

  /******************************************************************************************
   * Getter/Setter
   */
  set theme(newTheme) {
    const themeMap = {
      battery: 'optimal_when_high',
      memory: 'optimal_when_low',
      cpu: 'optimal_when_low',
    };
    newTheme = themeMap[newTheme] || newTheme;
    if (!newTheme || !Object.hasOwn(THEME, newTheme)) {
      [this.#icon, this.#color, this.#theme] = [null, null, null];
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
  get color() {
    return this.#color;
  }

  /******************************************************************************************
   * Updates the icon and color based on the current theme and percentage.
   * This method calculates the appropriate icon and color from the `THEME` object based on the percentage value.
   *
   * @private
   */
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
    this.#color = themeData.color;
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
      this.#icon = themeData.icon;
      this.#color = themeData.color;
    }
  }
  static #validateCustomTheme(customTheme) {
    if (!Array.isArray(customTheme) || customTheme.length === 0) return false;

    let isFirstItem = true;
    let lastMax = null;

    return customTheme.every((item) => {
      if (item === null || typeof item !== 'object') return false;
      if (!CARD.theme.customTheme.expectedKeys.every((key) => key in item)) return false;
      if (item.min >= item.max) return false;
      if (!isFirstItem && item.min !== lastMax) return false;

      isFirstItem = false;
      lastMax = item.max;

      return true;
    });
  }
  static adaptColor(curColor) {
    return curColor == null ? null : DEF_COLORS.has(curColor) ? `var(--${curColor}-color)` : curColor;
  }
}

/**
 * Provides access to the Home Assistant object.
 * This class implements a singleton pattern to ensure only one instance exists.
 *
 * @class HassProvider
 */
class HassProviderSingleton {
  static #instance = null;
  static #allowInit = false;

  #hass = null;
  #isValid = false;

  constructor() {
    if (!HassProviderSingleton.#allowInit) {
      throw new Error('Use HassProviderSingleton.getInstance() instead of new.');
    }
    HassProviderSingleton.#allowInit = false;
  }

  static getInstance() {
    if (!HassProviderSingleton.#instance) {
      HassProviderSingleton.#allowInit = true;
      HassProviderSingleton.#instance = new HassProviderSingleton();
    }
    return HassProviderSingleton.#instance;
  }

  set hass(hass) {
    if (!hass) return;
    this.#hass = hass;
    this.#isValid = true;
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
  get numberFormat() {
    const format = this.#hass?.locale?.number_format;
    if (!format) return CARD.config.languageMap[CARD.config.language];
    if (format === 'none') return null;

    const formatMap = {
      decimal_comma: 'de-DE', // 1.234,56 (Allemagne, France, etc.)
      comma_decimal: 'en-US', // 1,234.56 (USA, UK, etc.)
      space_comma: 'fr-FR', // 1 234,56 (France, Norvège, etc.)
      language: CARD.config.languageMap[this.language],
      system: Intl.NumberFormat().resolvedOptions().locale,
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
    return typeof entityId === 'string' && entityId.includes('.') ? entityId.split('.')[0] : null;
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
      Object.entries(attributes).filter(([_, val]) => { // eslint-disable-line no-unused-vars
        return typeof val === 'number' || (typeof val === 'string' && !isNaN(val) && val.trim() !== '');
      }).map(([key, val]) => {
        const num = typeof val === 'number' ? val : parseFloat(val);
        return [key, num];
      })
    );
  }
}

/**
 * Helper class for managing entities.
 * This class validates and retrieves information from Home Assistant if it's an entity.
 *
 * @class EntityHelper
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

  /**
   * @param {String} entityId
   */
  set entityId(newValue) {
    this.#entityId = newValue;
    this.#value = 0;
    this.#domain = HassProviderSingleton.getEntityDomain(newValue);
    this.#isValid = this.#hassProvider.hasEntity(this.#entityId); // for editor
  }
  get entityId() {
    return this.#entityId;
  }
  /**
   * @param {String} newAttribute
   */
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
    if (this.isTimer) {
      this.#manageTimerEntity();
    } else if (this.isDuration) {
      this.#manageDurationEntity();
    } else if (this.isCounter) {
      this.#manageCounterAndNumberEntity('minimum', 'maximum');
    } else if (this.isNumber) {
      this.#manageCounterAndNumberEntity('min', 'max');
    } else {
      this.#manageStdEntity();
    }
  }
  #manageStdEntity() {
    this.#attribute = this.#attribute || ATTRIBUTE_MAPPING[this.#domain]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entityId, this.#attribute);

    if (attrValue !== undefined && !isNaN(parseFloat(attrValue))) {
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
  #manageTimerEntity() {
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
  #manageCounterAndNumberEntity(min, max) {
    this.#value = {
      current: parseFloat(this.state),
      min: this.#hassProvider.getEntityAttribute(this.#entityId, min),
      max: this.#hassProvider.getEntityAttribute(this.#entityId, max),
    };
  }
  #manageDurationEntity() {
    const unit = this.#hassProvider.getEntityAttribute(this.#entityId, 'unit_of_measurement');
    const value = parseFloat(this.#state);
    this.#value = unit === undefined ? 0 : NumberFormatter.durationToSeconds(value, unit);
    this.#isValid = unit !== undefined;
  }

  /******************************************************************************************
   *
   */
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
      }))
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
    return this.#domain === CARD.config.entity.type.timer;
  }
  get isDuration() {
    return !this.isTimer && this.#hassProvider.getDeviceClass(this.#entityId) === 'duration' && this.#attribute == null;
  }
  get isNumber() {
    return this.#domain === CARD.config.entity.type.number;
  }
  get isCounter() {
    return this.#domain === CARD.config.entity.type.counter;
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
    const typeColorMap = {
      [CARD.config.entity.type.timer]:
        this.value && this.value.state === CARD.config.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [CARD.config.entity.type.cover]: this.value && this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [CARD.config.entity.type.light]: this.value && this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      [CARD.config.entity.type.fan]: this.value && this.value > 0 ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [CARD.config.entity.type.climate]: this.#getClimateColor(),
      [CARD.config.entity.class.battery]: this.#getBatteryColor(),
    };

    return typeColorMap[this.#domain] ?? typeColorMap[this.#hassProvider.getDeviceClass(this.#entityId)] ?? null;
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

/**
 * Represents either an entity ID or a direct value.
 * This class validates the provided value and retrieves information from Home Assistant if it's an entity.
 *
 * @class EntityOrValue
 */
class EntityOrValue {
  #activeHelper = null; // Dynamically set to EntityHelper or ValueHelper
  #helperType = { entity: 'entity', value: 'value' };
  #isEntity = null;

  #createHelper(helperType) {
    const HelperClass = helperType === this.#helperType.entity ? EntityHelper : ValueHelper;
    if (!(this.#activeHelper instanceof HelperClass)) {
      this.#activeHelper = new HelperClass();
      this.#isEntity = helperType === this.#helperType.entity;
    }
  }

  /******************************************************************************************
   * Sets the value, which can be an entity ID or a direct value.
   * Dynamically delegates to the appropriate helper.
   * @param {string|number} input - The value or entity ID.
   */
  set value(newValue) {
    if (typeof newValue === 'string') {
      this.#createHelper(this.#helperType.entity);
      this.#activeHelper.entityId = newValue;
    } else if (Number.isFinite(newValue)) {
      this.#createHelper(this.#helperType.value);
      this.#activeHelper.value = newValue;
    } else {
      this.#activeHelper = null;
    }
  }

  /******************************************************************************************
   * Proxy function
   */
  get value() {
    return this.#activeHelper ? this.#activeHelper.value : null;
  }
  get isEntity() {
    return this.#isEntity;
  }
  set attribute(newValue) {
    if (this.#isEntity) this.#activeHelper.attribute = newValue;
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
  refresh() {
    if (this.#activeHelper && this.#isEntity) this.#activeHelper.refresh();
  }
}

/**
 * Helper class for managing and validating card configuration.
 *
 * @class ConfigHelper
 */
class ConfigHelper {
  #config = {};
  #isValid = false;
  #msg = null;
  #isChanged = false;
  #hassProvider = null;

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  /******************************************************************************************
   * Getter/Setter
   */
  get config() {
    return this.#config;
  }

  set config(config) {
    this.#isChanged = true;
    this.#config = ConfigHelper.#applyDefaults(config);
  }

  static #applyDefaults(config) {
    const domain = HassProviderSingleton.getEntityDomain(config.entity);
    const toggleableDomains = ['light', 'switch', 'fan', 'input_boolean', 'media_player'];
    const isToggleable = toggleableDomains.includes(domain);
    const { watermark, ...baseDefaults } = CARD.config.defaults;

    const merged = {
      ...baseDefaults,
      ...(isToggleable && { icon_tap_action: { action: 'toggle' } }),
      ...config,
    };

    // -- VALIDATION ENUMS --

    // bar orientation
    if (config.bar_orientation && !Object.hasOwn(CARD.style.dynamic.progressBar.orientation, config.bar_orientation))
      merged.bar_orientation = null;

    // bar size
    if (config.bar_size && !Object.hasOwn(CARD.style.bar.sizeOptions, config.bar_size))
      merged.bar_size = CARD.style.bar.sizeOptions.small.label;

    // unit spacing
    const validUnitSpacing = Object.values(CARD.config.unit.unitSpacing);
    if (config.unit_spacing && !validUnitSpacing.includes(config.unit_spacing))
      merged.unit_spacing = CARD.config.unit.unitSpacing.auto;

    // Layout
    if (config.layout && !Object.hasOwn(CARD.layout.orientations, config.layout))
      merged.layout = CARD.layout.orientations.horizontal.label;

    // Watermark uniquement si défini
    if (config.watermark !== undefined) {
      merged.watermark = {
        ...watermark,
        ...config.watermark,
      };
    }

    return merged;
  }

  get isValid() {
    return this.#isValid;
  }
  get msg() {
    return this.#msg;
  }
  get max_value() {
    if (!this.#config.max_value) return CARD.config.value.max;
    if (Number.isFinite(this.#config.max_value)) return this.#config.max_value;
    if (typeof this.#config.max_value === 'string') {
      const state = this.#hassProvider.getEntityStateValue(this.#config.max_value);
      const parsedState = parseFloat(state);
      if (!isNaN(parsedState)) return parsedState;
    }
    return null;
  }
  get hasDisabledUnit() {
    return this.#config.disable_unit;
  }
  get cardTapAction() {
    return this.#getCardAction('tap_action');
  }
  get cardDoubleTapAction() {
    return this.#getCardAction('double_tap_action');
  }
  get cardHoldAction() {
    return this.#getCardAction('hold_action');
  }
  get iconTapAction() {
    return this.#getCardAction('icon_tap_action');
  }
  get iconDoubleTapAction() {
    return this.#getCardAction('icon_double_tap_action');
  }
  get iconHoldAction() {
    return this.#getCardAction('icon_hold_action');
  }
  get stateContent() {
    const content = typeof this.#config?.state_content === 'string' ? [this.#config?.state_content] : this.#config?.state_content ?? [];
    return content.filter((item) => typeof item === 'string' && item !== null && item !== undefined);
  }

  /******************************************************************************************
   * optimization
   */
  #getCardAction(action) {
    return (this.#config[action]?.action ?? null) === null ? CARD.interactions.action.default : this.#config[action]?.action;
  }

  /******************************************************************************************
   * Validates the card configuration and returns the validation status and error messages.
   */
  checkConfig() {
    if (!this.#isChanged) {
      return;
    }
    this.#isChanged = false;
    this.#isValid = false;
    const entityState = this.#hassProvider.getEntityStateObj(this.#config.entity);
    const maxValueState =
      typeof this.#config.max_value === 'string' && this.#config.max_value.trim()
        ? this.#hassProvider.getEntityStateObj(this.#config.max_value)
        : null;
    const validationRules = [
      {
        valid: this.#config.entity !== null,
        msg: {
          content: LANGUAGES[this.#hassProvider.language].card.msg.entityError,
          sev: 'info',
        },
      },
      {
        valid: !this.#config.attribute || (entityState && Object.hasOwn(entityState.attributes, this.#config.attribute)),
        msg: {
          content: LANGUAGES[this.#hassProvider.language].card.msg.attributeNotFound,
          sev: 'error',
        },
      },
      {
        valid: Number.isFinite(this.#config.min_value),
        msg: {
          content: LANGUAGES[this.#hassProvider.language].card.msg.minValueError,
          sev: 'error',
        },
      },
      {
        valid:
          Number.isFinite(this.max_value) ||
          (maxValueState && (this.#config.max_value_attribute ? Object.hasOwn(maxValueState.attributes, this.#config.max_value_attribute) : true)),
        msg: {
          content: LANGUAGES[this.#hassProvider.language].card.msg.maxValueError,
          sev: 'warning',
        },
      },
      {
        valid: !this.#config.decimal || (Number.isFinite(this.#config.decimal) && this.#config.decimal > 0),
        msg: {
          content: LANGUAGES[this.#hassProvider.language].card.msg.decimalError,
          sev: 'error',
        },
      },
    ];

    for (const rule of validationRules) {
      if (!rule.valid) {
        this.#msg = rule.msg;
        return;
      }
    }
    this.#isValid = true;
    this.#msg = null;

    return;
  }
}

/**
 * A card view that manage all informations to create the card.
 *
 * @class CardView
 */
class CardView {
  #debug = CARD.config.debug.card;
  #hassProvider = null;
  #configHelper = new ConfigHelper();
  #percentHelper = new PercentHelper();
  #theme = new ThemeManager();
  #currentValue = new EntityOrValue();
  #max_value = new EntityOrValue();
  #currentLanguage = CARD.config.language;

  constructor() {
    this.#hassProvider = HassProviderSingleton.getInstance();
  }

  /******************************************************************************************
   * Getter/Setter
   */
  get hasValidatedConfig() {
    return this.#configHelper.isValid;
  }
  get msg() {
    return this.#configHelper.msg;
  }
  set config(config) {
    this.#configHelper.config = config;

    Object.assign(this.#percentHelper, {
      unitSpacing: config.unitSpacing,
      hasDisabledUnit: this.#configHelper.hasDisabledUnit,
    });

    Object.assign(this.#theme, {
      theme: config.theme,
      customTheme: config.custom_theme,
    });

    Object.assign(this.#currentValue, {
      value: config.entity,
      stateContent: this.#configHelper.stateContent,
    });

    if (this.#currentValue.isTimer) {
      this.#max_value.value = CARD.config.value.max;
    } else {
      this.#currentValue.attribute = config.attribute;
      Object.assign(this.#max_value, {
        value: config.max_value ?? CARD.config.value.max,
        attribute: config.max_value_attribute,
      });
    }
  }
  get config() {
    return this.#configHelper.config;
  }
  get isUnknown() {
    return this.#currentValue.state === CARD.config.entity.state.unknown || this.#max_value.state === CARD.config.entity.state.unknown;
  }
  get isUnavailable() {
    return this.#currentValue.state === CARD.config.entity.state.unavailable || this.#max_value.state === CARD.config.entity.state.unavailable;
  }
  get isNotFound() {
    return this.#currentValue.state === CARD.config.entity.state.notFound || this.#max_value.state === CARD.config.entity.state.notFound;
  }
  get isAvailable() {
    return !(!this.#currentValue.isAvailable || (!this.#max_value.isAvailable && this.#configHelper.max_value));
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
    return this.#configHelper.config.entity;
  }
  get icon() {
    const notFound = this.isNotFound ? CARD.style.icon.notFound.icon : null;
    return notFound || this.#theme.icon || this.#configHelper.config.icon;
  }
  get color() {
    if (this.isUnavailable) return CARD.style.color.unavailable;
    if (this.isNotFound) return CARD.style.color.notFound;
    return (
      ThemeManager.adaptColor(this.#theme.color || this.#configHelper.config.color) || this.#currentValue.defaultColor || CARD.style.color.default
    );
  }
  get bar_color() {
    if (this.isAvailable) {
      return (
        ThemeManager.adaptColor(this.#theme.color || this.#configHelper.config.bar_color) ||
        this.#currentValue.defaultColor ||
        CARD.style.color.default
      );
    }
    if (this.isUnknown) {
      return CARD.style.color.default;
    }
    return CARD.style.color.disabled;
  }
  get bar_orientation() {
    if (this.#currentValue.isTimer && this.#configHelper.config.bar_orientation === null) return 'rtl';

    return this.#configHelper.config.bar_orientation === 'rtl' ? this.#configHelper.config.bar_orientation : null;
  }
  get bar_size() {
    return this.#configHelper.config.bar_size;
  }
  get percent() {
    if (this.isAvailable) {
      return Math.min(CARD.config.value.max, Math.max(0, this.#percentHelper.percent));
    }
    return CARD.config.value.min;
  }
  get stateAndProgressInfo() {
    if (
      this.isNotFound ||
      this.isUnavailable ||
      this.isUnknown ||
      (this.#currentValue.isTimer && this.#currentValue.value.state === CARD.config.entity.state.idle)
    )
      return this.#currentValue.formatedEntityState;

    const additionalInfo = this.#currentValue.stateContentToString;
    if (this.componentIsHidden(CARD.style.dynamic.hiddenComponent.value.label)) return additionalInfo;
    const valueInfo =
      this.#currentValue.isDuration && !this.#configHelper.config.unit ? this.#currentValue.formatedEntityState : this.#percentHelper.toString();

    return additionalInfo === '' ? valueInfo : [additionalInfo, valueInfo].join(CARD.config.separator);
  }
  get EntityStateObj() {
    return this.#currentValue.stateObj;
  }
  get name() {
    return this.#configHelper.config.name || this.#currentValue.name || this.#configHelper.config.entity;
  }
  get hasStandardEntityError() {
    return this.isUnavailable || this.isNotFound || this.isUnknown;
  }
  get isBadgeEnable() {
    return (
      this.isUnavailable ||
      this.isNotFound ||
      this.#configHelper.config.badge_icon !== null ||
      (this.#currentValue.isTimer && [CARD.config.entity.state.paused, CARD.config.entity.state.active].includes(this.#currentValue.value.state))
    );
  }
  get badgeInfo() {
    if (this.isNotFound) {
      return CARD.style.icon.badge.notFound;
    }
    if (this.isUnavailable) {
      return CARD.style.icon.badge.unavailable;
    }
    if (this.#currentValue.isTimer) {
      const { state } = this.#currentValue.value;
      const { paused, active } = CARD.config.entity.state;
      if (state === paused) return CARD.style.icon.badge.timer.paused;
      if (state === active) return CARD.style.icon.badge.timer.active;
    }
    return null;
  }
  get layout() {
    return this.#configHelper.config.layout;
  }
  get isActiveTimer() {
    return this.#currentValue.isTimer && this.#currentValue.state === CARD.config.entity.state.active;
  }
  get refreshSpeed() {
    const rawSpeed = this.#currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    const roundedSpeed = Math.max(100, Math.round(clampedSpeed / 100) * 100);
    if (this.#debug) debugLog(roundedSpeed);

    return roundedSpeed;
  }
  get show_more_info() {
    return [CARD.interactions.action.default, CARD.interactions.action.moreInfo.action].includes(this.#configHelper.cardTapAction);
  }
  get bar() {
    const result = this.#configHelper.bar;
    if (this.#currentValue.isTimer && result.orientation === null) {
      result.orientation = CARD.style.dynamic.progressBar.orientation.rtl;
      result.changed = true;
    }
    return result;
  }
  get hasClickableIcon() {
    return (
      this.#configHelper.iconTapAction !== CARD.interactions.action.none.action ||
      this.#configHelper.iconHoldAction !== CARD.interactions.action.none.action ||
      this.#configHelper.iconDoubleTapAction !== CARD.interactions.action.none.action
    );
  }
  get hasClickableCard() {
    return (
      this.#configHelper.cardTapAction !== CARD.interactions.action.none.action ||
      this.#configHelper.cardHoldAction !== CARD.interactions.action.none.action ||
      this.#configHelper.cardDoubleTapAction !== CARD.interactions.action.none.action
    );
  }
  get hasVisibleShape() {
    return this.#hassProvider.hasNewShapeStrategy
      ? this.#configHelper.config.force_circular_background ||
          (this.#currentValue.hasShapeByDefault && this.#configHelper.iconTapAction !== CARD.interactions.action.none.action) ||
          [
            CARD.interactions.action.navigate.action,
            CARD.interactions.action.url.action,
            CARD.interactions.action.moreInfo.action,
            CARD.interactions.action.assist.action,
            CARD.interactions.action.toggle.action,
            CARD.interactions.action.performAction.action,
          ].includes(this.#configHelper.iconTapAction)
      : true;
  }
  get timerIsReversed() {
    return this.#configHelper.config.reverse !== false && this.#currentValue.value.state !== CARD.config.entity.state.idle;
  }
  get hasWatermark() {
    return this.#configHelper.config.watermark !== undefined;
  }
  get watermark() {
    if (!this.#configHelper.config.watermark) return null;

    const result = this.#configHelper.config.watermark;
    return {
      low: this.#percentHelper.calcWatermark(result.low),
      low_color: ThemeManager.adaptColor(result.low_color),
      high: this.#percentHelper.calcWatermark(result.high),
      high_color: ThemeManager.adaptColor(result.high_color),
      opacity: result.opacity,
      type: result.type,
      disable_low: result.disable_low,
      disable_high: result.disable_high,
    };
  }
  componentIsHidden(component) {
    return Array.isArray(this.#configHelper.config?.hide) && this.#configHelper.config.hide.includes(component);
  }

  /**
   * Refreshes the card by updating the current value and checking for availability.
   *
   * @param {object} hass - The Home Assistant object.
   */
  refresh(hass) {
    this.#hassProvider.hass = hass;
    this.currentLanguage = this.#hassProvider.language;
    this.#currentValue.refresh();
    this.#max_value.refresh();
    this.#configHelper.checkConfig();

    if (!this.isAvailable) return;

    // update
    this.#percentHelper.isTimer = this.#currentValue.isTimer || this.#currentValue.isDuration;
    const currentUnit = this.#getCurrentUnit();
    this.#percentHelper.unit = currentUnit;
    this.#percentHelper.decimal = this.#getCurrentDecimal(currentUnit);

    if (this.#currentValue.isTimer) {
      Object.assign(this.#percentHelper, {
        isReversed: this.timerIsReversed,
        current: this.#currentValue.value.current,
        min: this.#currentValue.value.min,
        max: this.#currentValue.value.max,
      });
    } else if (this.#currentValue.isCounter || this.#currentValue.isNumber) {
      Object.assign(this.#percentHelper, {
        current: this.#currentValue.value.current,
        min: this.#currentValue.value.min,
        max: this.#max_value.isEntity ? this.#max_value.value?.current ?? this.#max_value.value : this.#currentValue.value.max,
      });
    } else {
      Object.assign(this.#percentHelper, {
        current: this.#currentValue.value,
        min: this.#configHelper.config.min_value,
        max: this.#max_value.value?.current ?? this.#max_value.value,
      });
    }
    this.#percentHelper.refresh();
    this.#theme.value = this.#percentHelper.valueForThemes(this.#theme.isBasedOnPercentage);
  }
  #getCurrentUnit() {
    if (this.#configHelper.config.unit) return this.#configHelper.config.unit;
    if (this.#max_value.isEntity) return CARD.config.unit.default;

    const unit = this.#currentValue.unit;
    return unit === null ? CARD.config.unit.default : unit;
  }
  #getCurrentDecimal(currentUnit) {
    if (this.#configHelper.config.decimal !== null) return this.#configHelper.config.decimal;
    if (this.#currentValue.precision) return this.#currentValue.precision;
    if (this.#currentValue.isTimer) return CARD.config.decimal.timer;
    if (this.#currentValue.isCounter) return CARD.config.decimal.counter;
    if (this.#currentValue.isDuration) return CARD.config.decimal.duration;
    if (['j', 'd', 'h', 'min', 's', 'ms', 'μs'].includes(this.#currentValue.unit)) return CARD.config.decimal.duration;

    if (this.#configHelper.config.unit)
      return this.#configHelper.config.unit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;

    if (currentUnit === CARD.config.unit.default) return CARD.config.decimal.percentage;

    return CARD.config.decimal.other;
  }
}

class ResourceManager {
  #debug = CARD.config.debug.ressourceManager;
  #resources = new Map();

  #generateUniqueId() {
    let id = null;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.#resources.has(id));
    return id;
  }

  add(cleanupFn, id) {
    if (typeof cleanupFn !== 'function') {
      throw new Error('Resource must be a function');
    }
    const finalId = id || this.#generateUniqueId();
    if (this.#resources.has(finalId)) {
      this.remove(finalId); // <-- on supprime proprement l'ancien !
    }
    this.#resources.set(finalId, cleanupFn);
    if (this.#debug) debugLog(`[ResourceManager] Added: ${finalId}`);

    return finalId;
  }

  setInterval(handler, timeout, id) {
    if (this.#debug) debugLog('Starting interval with id:', id);
    const timerId = setInterval(handler, timeout);
    if (this.#debug) debugLog('Timer started with timerId:', timerId);

    this.add(() => {
      if (this.#debug) debugLog('Stopping interval with id:', id);
      clearInterval(timerId);
    }, id);

    return id;
  }

  hasInterval(id) {
    return this.#resources.has(id); // Vérifie si un ID existe dans la Map
  }

  setTimeout(handler, timeout, id) {
    if (this.#debug) debugLog('Starting timeout with id:', id);
    const timerId = setTimeout(handler, timeout);
    if (this.#debug) debugLog('Timeout started with timerId:', timerId);
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

  remove(id) {
    const cleanupFn = this.#resources.get(id);
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while removing '${id}'`, e);
      }
      this.#resources.delete(id);
      if (this.#debug) debugLog(`[ResourceManager] Removed: ${id}`);
    }
  }

  cleanup() {
    for (const [id, cleanupFn] of this.#resources) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while clearing '${id}'`, e);
      }
      if (this.#debug) debugLog(`[ResourceManager] Cleared: ${id}`);
    }
    this.#resources.clear();
    if (this.#debug) debugLog('[ResourceManager] All resources cleared.');
  }

  get list() {
    return [...this.#resources.keys()];
  }

  get count() {
    return this.#resources.size;
  }
}

class ActionHelper {
  #debug = CARD.config.debug.interactionHandler;
  #resourceManager = null;
  #config = null;
  #element = null;
  #clickCount = 0;
  #downTime = null;
  #isHolding = null;
  #clickSource = null;
  #startX = 0;
  #startY = 0;
  
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
  }

  init(resourceManager, config, clickableTarget) {
    this.#resourceManager = resourceManager;
    this.#config = config;
    this.#attachToTargets(clickableTarget);
  }

  #attachToTargets(clickableTarget) {
    if (!clickableTarget) return;

    if (Array.isArray(clickableTarget)) {
      for (const target of clickableTarget) {
        if (target) this.#attachListener(target);
      }
    } else {
      this.#attachListener(clickableTarget);
    }
  }

  #attachListener(elem) {
    if (this.#debug) console.log('👉 ActionHelper.#attachListener()');
    this.#resourceManager.addEventListener(elem, 'mousedown', this.#boundHandlers.mousedown);
    this.#resourceManager.addEventListener(elem, 'mouseup', this.#boundHandlers.mouseup);
    this.#resourceManager.addEventListener(elem, 'mousemove', this.#boundHandlers.mousemove);
    this.#resourceManager.addEventListener(elem, 'touchstart', this.#boundHandlers.touchstart, { passive: true });
    this.#resourceManager.addEventListener(elem, 'touchend', this.#boundHandlers.touchend);
    this.#resourceManager.addEventListener(elem, 'touchmove', this.#boundHandlers.touchmove, { passive: true });
  }

  #handleMouseDown(ev) {
    if (this.#debug) console.log('👉 ActionHelper.handleMouseDown()');
    if (this.#debug) console.log('    ', ev.composedPath());

    const orginalTarget = ev.composedPath()[0].localName;

    this.#clickSource = CARD.interactions.event.originalTarget.icon.includes(orginalTarget)
      ? CARD.interactions.event.from.icon
      : CARD.interactions.event.from.card;
    if (this.#debug) console.log('    clickSource: ', this.#clickSource);

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
    if (this.#debug) console.log('👉 ActionHelper.#fireAction()');
    if (this.#debug) console.log('  📎 originalEvent: ', originalEvent);
    if (this.#debug) console.log('  📎 original action: ', currentAction);
    if (this.#debug) console.log('    clickSource: ', this.#clickSource);

    const prefixAction = this.#clickSource === CARD.interactions.event.from.icon ? `${CARD.interactions.event.from.icon}_` : '';
    let fullAction = `${prefixAction}${currentAction}`;
    if (this.#debug) console.log('  📎 fullAction: ', fullAction);

    let currentConfig = null;

    if (
      [
        CARD.interactions.event.tap.iconTapAction,
        CARD.interactions.event.tap.iconHoldAction,
        CARD.interactions.event.tap.iconDoubleTapAction,
        CARD.interactions.event.tap.doubleTapAction,
      ].includes(fullAction)
    ) {
      if (fullAction !== CARD.interactions.event.tap.doubleTapAction && this.#config[`${fullAction}_action`].action === 'none')
        fullAction = currentAction; // if icon and 'none' -> failback to card action

      currentConfig = {
        entity: this.#config.entity,
        tap_action: this.#config[`${fullAction}_action`],
      };
      currentAction = 'tap';
    } else {
      currentConfig = this.#config;
    }

    this.#element.dispatchEvent(
      new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config: currentConfig,
          action: currentAction,
          originalEvent,
        },
      })
    );
  }

  cleanup() {
    this.#resourceManager?.cleanup();
  }
}

/** --------------------------------------------------------------------------
 *
 * Represents a custom card element displaying the progress of an entity.
 *
 * The `EntityProgressCard` class extends the base `HTMLElement` class and
 * implements a custom web component that displays information about an entity's
 * state.
 */
class EntityProgressCard extends HTMLElement {
  #debug = CARD.config.debug.card;
  #resourceManager = null;
  #icon = null;
  #cardView = new CardView();
  #domElements = {};
  #lastMessage = null;
  #hass = null;
  #clickableTarget = null;
  #actionHelper = null;

  // === LIFECYCLE METHODS ===

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });

    this.#actionHelper = new ActionHelper(this);

    if (!EntityProgressCard._moduleLoaded) {
      console.groupCollapsed(CARD.console.message, CARD.console.css);
      console.log(CARD.console.link);
      console.groupEnd();
      if (this.#debug) debugLog(Object.keys(LANGUAGES));
      EntityProgressCard._moduleLoaded = true;
    }
  }

  connectedCallback() {
    if (this.#debug) debugLog('👉 connectedCallback()');
    const selector = CARD.htmlStructure.elements;
    this.#resourceManager = new ResourceManager();

    this.#clickableTarget = this.#cardView.hasClickableCard
      ? this
      : this.#cardView.hasClickableIcon
        ? [this.#domElements[selector.shape.class], this.#domElements[selector.icon.class]]
        : null;

    this.#actionHelper.init(this.#resourceManager, this.#cardView.config, this.#clickableTarget);
  }

  disconnectedCallback() {
    if (this.#debug) debugLog('👉 disconnectedCallback()');
    this.#resourceManager?.cleanup();
  }

  // === STATIC METHODS ===

  /**
   * Creates and returns a new configuration element for the component.
   *
   * @returns {HTMLElement} A newly created configuration element.
   */
  static getConfigElement() {
    return document.createElement(CARD.meta.editor);
  }

  static getStubConfig(hass) {
    const wantedDomains = ['fan', 'cover', 'light', 'sensor'];
    const batteryRegex = /battery/i;

    const entity = Object.keys(hass.states).find((eid) => {
      const domain = HassProviderSingleton.getEntityDomain(eid);
      if (wantedDomains.includes(domain)) {
        if (domain === 'sensor') {
          return batteryRegex.test(eid);
        }
        return true;
      }
      return false;
    });
    return {
      type: `custom:${CARD.meta.typeName}`,
      entity: entity || 'sensor.temperature',
    };
  }

  // === PUBLIC API METHODS ===

  /**
   * Updates the component's configuration and triggers static changes.
   */
  setConfig(config) {
    this.#cardView.config = { ...config };
    this.#buildCard();
  }

  /**
   * Sets the Home Assistant (`hass`) instance and updates dynamic elements.
   *
   * @param {Object} hass - The Home Assistant instance containing the current
   *                        state and services.
   */
  set hass(hass) {
    // On garde toujours la dernière valeur de hass
    this.#hass = hass;

    // Si ce n'est pas un timer actif, on fait un rafraîchissement immédiat
    if (!this.#cardView.isActiveTimer) {
      this.refresh();
      this.#stopAutoRefresh();
      return;
    }
    if (!this.#resourceManager.hasInterval('autoRefresh')) {
      this.refresh();
      this.#startAutoRefresh();
    }
  }

  get hass() {
    return this.#hass;
  }

  refresh() {
    if (this.#debug) debugLog('👉 EntityProgressCard.refresh()');

    this.#cardView.refresh(this.hass);
    if (this.#manageErrorMessage()) return;
    this.#updateDynamicElements();
  }

  /**
   * Returns the number of grid rows for the card size based on the current layout.
   *
   * @returns {number} - The number of grid rows for the current card layout.
   */
  getCardSize() {
    if (this.#cardView.layout === CARD.layout.orientations.vertical.label) {
      return CARD.layout.orientations.vertical.grid.grid_rows;
    }
    return CARD.layout.orientations.horizontal.grid.grid_rows;
  }

  /**
   * Returns the layout options based on the current layout configuration.
   *
   * @returns {object} - The layout options for the current layout configuration.
   */
  getLayoutOptions() {
    if (this.#cardView.layout === CARD.layout.orientations.vertical.label) {
      return CARD.layout.orientations.vertical.grid;
    }
    return CARD.layout.orientations.horizontal.grid;
  }

  /** --------------------------------------------------------------------------
   * Private methods organized by functionality
   */

  // === AUTO-REFRESH MANAGEMENT ===

  #startAutoRefresh() {
    if (!this.#resourceManager) return;
    this.#resourceManager.setInterval(
      () => {
        this.refresh(this.hass);
        if (this.#debug) debugLog('👉 EntityProgressCard.#startAutoRefresh()');
        if (!this.#cardView.isActiveTimer) {
          this.#stopAutoRefresh();
        }
      },
      this.#cardView.refreshSpeed,
      'autoRefresh'
    );
  }

  #stopAutoRefresh() {
    if (this.#resourceManager) this.#resourceManager.remove('autoRefresh');
  }

  // === ERROR MESSAGE MANAGEMENT ===

  #manageErrorMessage() {
    if (this.#cardView.entity === null || (this.#cardView.isAvailable && !this.#cardView.hasValidatedConfig)) {
      this.#renderMessage(this.#cardView.msg);
      return true;
    }
    this.#lastMessage = null;
    return false;
  }

  /**
   * Displays an error alert with the provided message.
   *   'info', 'warning', 'error'
   */
  #renderMessage(msg) {
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
  #buildCard() {
    if (this.#debug) debugLog('👉 EntityProgressCard.#buildCard()');

    const style = document.createElement(CARD.style.element);
    style.textContent = CARD_CSS;

    const card = document.createElement(CARD.htmlStructure.card.element);
    this.#buildStyle(card);
    card.innerHTML = CARD_HTML;

    // replaceChildren remplace tout le contenu en une seule opération
    this.shadowRoot.replaceChildren(style, card);
    this.#storeDOM(card);
  }

  #buildStyle(card) {
    this.#addBaseClasses(card);
    this.#applyConditionalClasses(card);
    this.#handleHiddenComponents(card);
    this.#handleWatermarkClasses(card);
  }

  #addBaseClasses(card) {
    const classesToAdd = [CARD.meta.typeName];

    if (this.#cardView.bar_orientation) {
      classesToAdd.push(CARD.style.dynamic.progressBar.orientation[this.#cardView.bar_orientation]);
    }

    classesToAdd.push(this.#cardView.layout, this.#cardView.bar_size);
    card.classList.add(...classesToAdd);
  }

  #applyConditionalClasses(card) {
    const conditionalClasses = new Map([
      [CARD.style.dynamic.clickable.card, this.#cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this.#cardView.hasClickableIcon],
      [CARD.style.dynamic.secondaryInfoError.class, this.#cardView.hasStandardEntityError],
    ]);

    conditionalClasses.forEach((condition, className) => {
      card.classList.toggle(className, condition);
    });
  }

  #handleHiddenComponents(card) {
    const components = [
      CARD.style.dynamic.hiddenComponent.icon,
      CARD.style.dynamic.hiddenComponent.name,
      CARD.style.dynamic.hiddenComponent.secondary_info,
      CARD.style.dynamic.hiddenComponent.progress_bar,
    ];

    components.forEach((component) => {
      this.#toggleHiddenComponent(card, component);
    });
  }

  #handleWatermarkClasses(card) {
    if (!this.#cardView.hasWatermark) return;

    const type = this.#cardView.watermark.type === 'line' ? 'line-' : '';
    const baseClass = CARD.htmlStructure.elements.progressBar.watermark.class;
    const showClass = CARD.style.dynamic.show;

    card.classList.toggle(`${showClass}-HWM-${type}${baseClass}`, !this.#cardView.watermark.disable_high);
    card.classList.toggle(`${showClass}-LWM-${type}${baseClass}`, !this.#cardView.watermark.disable_low);
  }

  #toggleHiddenComponent(card, component) {
    card.classList.toggle(component.class, this.#cardView.componentIsHidden(component.label));
  }

  // === DOM MANAGEMENT ===

  #storeDOM(card) {
    const selectors = CARD.htmlStructure.elements;

    this.#domElements = {
      [CARD.htmlStructure.card.element]: card,
    };

    const keys = [
      selectors.icon,
      selectors.shape,
      selectors.badge.icon,
      selectors.name,
      selectors.nameCustomInfo,
      selectors.customInfo,
      selectors.stateAndProgressInfo,
    ];

    for (const { class: className } of keys) {
      this.#domElements[className] = this.shadowRoot.querySelector(`.${className}`);
    }
  }

  /**
   * Updates the specified DOM element based on a provided callback function.
   */
  #updateElement(key, updateCallback) {
    const element = this.#domElements[key];
    if (element) {
      updateCallback(element);
    }
  }

  // === DYNAMIC ELEMENTS UPDATE ===

  /**
   * Updates dynamic card elements based on the entity's state and configuration.
   */
  #updateDynamicElements() {
    if (this.#debug) debugLog('👉 EntityProgressCard.#updateDynamicElements()');
    this.#showIcon();
    this.#showBadge();
    this.#manageShape();
    this.#updateCSS();
    this.#processJinjaFields();
    this.#processStandardFields();
  }

  // === CSS MANAGEMENT ===

  #updateCSS() {
    this.#updateElement(CARD.htmlStructure.card.element, (el) => {
      const style = el.style;
      const bar = this.#cardView;

      const properties = [
        [CARD.style.dynamic.progressBar.color.var, bar.bar_color],
        [CARD.style.dynamic.progressBar.size.var, `${bar.percent}%`],
        [CARD.style.dynamic.iconAndShape.color.var, bar.color],
      ];

      if (bar.hasWatermark) {
        const wm = bar.watermark;
        properties.push(
          [CARD.style.dynamic.watermark.high.value.var, `${wm.high}%`],
          [CARD.style.dynamic.watermark.high.color.var, wm.high_color],
          [CARD.style.dynamic.watermark.low.value.var, `${wm.low}%`],
          [CARD.style.dynamic.watermark.low.color.var, wm.low_color],
          [CARD.style.dynamic.watermark.opacity.var, wm.opacity]
        );
      }
      properties.forEach(([variable, value]) => {
        if (style.getPropertyValue(variable) !== value) {
          style.setProperty(variable, value);
        }
      });
    });
  }

  // === ICON MANAGEMENT ===

  #showIcon() {
    const { EntityStateObj: stateObj, icon: curIcon } = this.#cardView;
    const hasIconOverride = curIcon !== null;
    const hasPicture = stateObj?.attributes?.entity_picture;

    let stateObjIcon = null;

    if (stateObj) {
      const clonedAttributes = { ...stateObj.attributes };

      if (hasPicture) {
        delete clonedAttributes.icon; // Supprimer l'icône
      } else if (hasIconOverride) {
        clonedAttributes.icon = curIcon;
      }

      stateObjIcon = {
        ...stateObj,
        attributes: clonedAttributes,
      };
    } else {
      stateObjIcon = {
        entity_id: 'notfound.entity',
        state: 'notfound',
        attributes: {
          icon: curIcon,
        },
      };
    }

    const firstTime = this.#icon === null;
    if (firstTime) {
      this.#icon = document.createElement('ha-state-icon');
    }

    this.#icon.hass = this.#hass;
    this.#icon.stateObj = stateObjIcon;

    if (firstTime) {
      this.#domElements[CARD.htmlStructure.elements.icon.class].replaceChildren(this.#icon);
    }
  }

  // === SHAPE MANAGEMENT ===

  #manageShape() {
    this.#domElements[CARD.htmlStructure.card.element].classList.toggle(
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this.#cardView.hasVisibleShape
    );
  }

  // === BADGE MANAGEMENT ===

  /**
   * Displays a badge
   */
  #showBadge() {
    const { badgeInfo, isBadgeEnable } = this.#cardView;

    if (isBadgeEnable && badgeInfo === null) return; // custom

    this.#domElements[CARD.htmlStructure.card.element].classList.toggle(
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      isBadgeEnable
    );
    if (isBadgeEnable) {
      if (!badgeInfo) {
        return;
      }
      this.#setBadge(badgeInfo.icon, badgeInfo.color, badgeInfo.backgroundColor);
    }
  }

  #setBadge(icon, color, backgroundColor) {
    this.#setBadgeIcon(icon);
    this.#setBadgeColor(color, backgroundColor);
  }

  #setBadgeIcon(icon) {
    // Vérifie si l'icône a réellement changé
    this.#updateElement(CARD.htmlStructure.elements.badge.icon.class, (el) => {
      const currentIcon = el.getAttribute(CARD.style.icon.badge.default.attribute);
      if (currentIcon !== icon) {
        el.setAttribute(CARD.style.icon.badge.default.attribute, icon);
      }
    });
  }

  #setBadgeColor(color, backgroundColor) {
    // Vérifie si la couleur ou l'arrière-plan a changé avant d'appliquer la mise à jour
    this.#updateElement(CARD.htmlStructure.card.element, (el) => {
      const currentBackgroundColor = el.style.getPropertyValue(CARD.style.dynamic.badge.backgroundColor.var);
      const currentColor = el.style.getPropertyValue(CARD.style.dynamic.badge.color.var);

      if (currentBackgroundColor !== backgroundColor || currentColor !== color) {
        el.style.setProperty(CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
        el.style.setProperty(CARD.style.dynamic.badge.color.var, color);
      }
    });
  }

  // === JINJA TEMPLATE RENDERING ===

  #renderJinja(key, content) {
    if (this.#debug) debugLog('👉 EntityProgressCard.#renderJinja()', key);

    const renderHandlers = this.#getRenderHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      handler();
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  #getRenderHandlers(content) {
    return {
      custom_info: () => this.#renderCustomInfo(content),
      name_info: () => this.#renderNameInfo(content),
      badge_icon: () => this.#renderBadgeIcon(content),
      badge_color: () => this.#renderBadgeColor(content),
    };
  }

  #renderCustomInfo(content) {
    const formattedContent = `${content}&nbsp;`;
    this.#updateElement(CARD.htmlStructure.elements.customInfo.class, (el) => {
      if (el.innerHTML !== formattedContent) {
        el.innerHTML = formattedContent;
      }
    });
  }

  #renderNameInfo(content) {
    const formattedContent = `&nbsp;${content}`;
    this.#updateElement(CARD.htmlStructure.elements.nameCustomInfo.class, (el) => {
      if (el.innerHTML !== formattedContent) {
        el.innerHTML = formattedContent;
      }
    });
  }

  #renderBadgeIcon(content) {
    const badgeInfo = this.#cardView.badgeInfo;
    const isBadgeEnable = this.#cardView.isBadgeEnable;
    const isMdiIcon = content.includes('mdi:');

    if (badgeInfo !== null) return; // alert -> cancel custom badge

    if (isMdiIcon) {
      this.#domElements[CARD.htmlStructure.card.element].classList.toggle(
        `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
        isBadgeEnable
      );
      this.#setBadgeIcon(content);
    }
  }

  #renderBadgeColor(content) {
    const backgroundColor = ThemeManager.adaptColor(content);
    const color = 'var(--white-color)';
    this.#setBadgeColor(color, backgroundColor);
  }

  // === TEMPLATE PROCESSING ===

  async #processJinjaFields() {
    if (this.#cardView.hasStandardEntityError || !this.#resourceManager) {
      return;
    }

    const templates = this.#getTemplateFields();

    for (const [key, template] of Object.entries(templates)) {
      if (!template.trim()) continue;

      await this.#subscribeToTemplate(key, template);
    }
  }

  #getTemplateFields() {
    const config = this.#cardView.config;

    return {
      name_info: config.name_info || '',
      custom_info: config.custom_info || '',
      badge_icon: config.badge_icon || '',
      badge_color: config.badge_color || '',
    };
  }

  async #subscribeToTemplate(key, template) {
    try {
      const unsub = await this.hass.connection.subscribeMessage((msg) => this.#renderJinja(key, msg.result), {
        type: 'render_template',
        template: template,
      });

      this.#resourceManager.addSubscription(unsub, `template-${key}`);
    } catch (error) {
      console.error(`Failed to subscribe to template ${key}:`, error);
    }
  }

  #processStandardFields() {
    this.#updateElement(CARD.htmlStructure.elements.name.class, (el) => {
      const newContent = this.#cardView.name;
      if (el.textContent !== newContent) {
        el.textContent = newContent;
      }
    });

    this.#updateElement(CARD.htmlStructure.elements.stateAndProgressInfo.class, (el) => {
      const newContent = this.#cardView.stateAndProgressInfo;
      if (el.textContent !== newContent) {
        el.textContent = newContent;
      }
    });
  }
}

/** --------------------------------------------------------------------------
 * Define static properties and register the custom element for the card.
 *
 * @static
 */
EntityProgressCard.version = VERSION;
EntityProgressCard._moduleLoaded = false;
customElements.define(CARD.meta.typeName, EntityProgressCard);

/** --------------------------------------------------------------------------
 * Registers the custom card in the global `customCards` array for use in Home Assistant.
 */
window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
  type: CARD.meta.typeName,
  name: CARD.meta.name,
  preview: true,
  description: CARD.meta.description,
});


/** --------------------------------------------------------------------------
 * Entity Progress Card Template 
 */

class TemplateCardView {
  #config = {};
  #currentValue = new EntityOrValue();

  /******************************************************************************************
   * Getter/Setter
   */
  get config() {
    return this.#config;
  }

  set config(config) {
    this.#config = TemplateCardView.#applyDefaults(config);
  }

  static #applyDefaults(config) {
    const domain = HassProviderSingleton.getEntityDomain(config.entity);
    const toggleableDomains = ['light', 'switch', 'fan', 'input_boolean', 'media_player'];
    const isToggleable = toggleableDomains.includes(domain);
    const { watermark, ...baseDefaults } = CARD.config.defaults;
    const defaultConfig = {
      name: 'Secondary Card',
      secondary: '',
      icon_color: '#03A9F4',
      badge_icon: '',
      badge_color: '#4CAF50',
      percentage: '0',
    };

    const merged = {
      ...baseDefaults,
      ...defaultConfig,
      ...(isToggleable && { icon_tap_action: { action: 'toggle' } }),
      ...config,
    };

    // -- VALIDATION ENUMS --

    // bar orientation
    if (config.bar_orientation && !Object.hasOwn(CARD.style.dynamic.progressBar.orientation, config.bar_orientation)) merged.bar_orientation = null;

    // bar size
    if (config.bar_size && !Object.hasOwn(CARD.style.bar.sizeOptions, config.bar_size)) merged.bar_size = CARD.style.bar.sizeOptions.small.label;

    // Layout
    if (config.layout && !Object.hasOwn(CARD.layout.orientations, config.layout)) merged.layout = CARD.layout.orientations.horizontal.label;

    // Watermark uniquement si défini
    if (config.watermark !== undefined) {
      merged.watermark = {
        ...watermark,
        ...config.watermark,
      };
    }

    return merged;
  }

  get cardTapAction() {
    return this.#getCardAction('tap_action');
  }
  get cardDoubleTapAction() {
    return this.#getCardAction('double_tap_action');
  }
  get cardHoldAction() {
    return this.#getCardAction('hold_action');
  }
  get iconTapAction() {
    return this.#getCardAction('icon_tap_action');
  }
  get iconDoubleTapAction() {
    return this.#getCardAction('icon_double_tap_action');
  }
  get iconHoldAction() {
    return this.#getCardAction('icon_hold_action');
  }
  get stateContent() {
    const content = typeof this.#config?.state_content === 'string' ? [this.#config?.state_content] : this.#config?.state_content ?? [];
    return content.filter((item) => typeof item === 'string' && item !== null && item !== undefined);
  }

  /******************************************************************************************
   * optimization
   */
  #getCardAction(action) {
    return (this.#config[action]?.action ?? null) === null ? CARD.interactions.action.default : this.#config[action]?.action;
  }
  componentIsHidden(component) {
    return Array.isArray(this.config?.hide) && this.config.hide.includes(component);
  }
  get EntityStateObj() {
    this.#currentValue.value = this.config.entity;
    return this.#currentValue.stateObj;
  }
  get hasClickableIcon() {
    return (
      this.iconTapAction !== CARD.interactions.action.none.action ||
      this.iconHoldAction !== CARD.interactions.action.none.action ||
      this.iconDoubleTapAction !== CARD.interactions.action.none.action
    );
  }
  get hasClickableCard() {
    return (
      this.cardTapAction !== CARD.interactions.action.none.action ||
      this.cardHoldAction !== CARD.interactions.action.none.action ||
      this.cardDoubleTapAction !== CARD.interactions.action.none.action
    );
  }

  get hasVisibleShape() {
    return (
      this.config.force_circular_background ||
      [
        CARD.interactions.action.navigate.action,
        CARD.interactions.action.url.action,
        CARD.interactions.action.moreInfo.action,
        CARD.interactions.action.assist.action,
        CARD.interactions.action.toggle.action,
        CARD.interactions.action.performAction.action,
      ].includes(this.iconTapAction)
    );
  }
  get hasWatermark() {
    return this.config.watermark !== undefined;
  }
  get watermark() {
    if (!this.config.watermark) return null;

    const result = this.config.watermark;
    return {
      low: result.low,
      low_color: ThemeManager.adaptColor(result.low_color),
      high: result.high,
      high_color: ThemeManager.adaptColor(result.high_color),
      opacity: result.opacity,
      type: result.type,
      disable_low: result.disable_low,
      disable_high: result.disable_high,
    };
  }
}

class EntityProgressTemplate extends HTMLElement {
  #debug = CARD.config.debug.card;
  #resourceManager = null;
  #icon = null;
  #cardView = new TemplateCardView();
  #domElements = {};
  #hassProvider = HassProviderSingleton.getInstance();
  #clickableTarget = null;
  #actionHelper = null;

  // === LIFECYCLE METHODS ===

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });
    this.#actionHelper = new ActionHelper(this);
    this.#initializeModule();
  }

  connectedCallback() {
    if (this.#debug) debugLog('👉 connectedCallback()');

    this.#resourceManager = new ResourceManager();
    this.#buildCard();
    this.#showIcon();
    this.#updateWatermark();
    this.#manageShape();
    this.#setupClickableTarget();
    this.#actionHelper.init(this.#resourceManager, this.#cardView.config, this.#clickableTarget);
  }

  disconnectedCallback() {
    if (this.#debug) debugLog('👉 disconnectedCallback()');
    this.#resourceManager?.cleanup();
  }

  // === PUBLIC API METHODS ===

  setConfig(config) {
    this.#cardView.config = { ...config };
  }

  set hass(hass) {
    this.#hassProvider.hass = hass;
    this.#processJinjaFields();
  }

  get hass() {
    return this.#hassProvider.hass;
  }

  static getStubConfig(hass) {
    return {
      type: `custom:${CARD.meta.typeName}-template`,
      icon: 'mdi:washing-machine',
      name: 'Entity Progress Card',
      secondary: 'Template',
      badge_icon: 'mdi:update',
      badge_color: 'green',
      percent: '50',
      force_circular_background: true,
      _gallery_mode: true,
    };
  }
  /**
   * Returns the number of grid rows for the card size based on the current layout.
   *
   * @returns {number} - The number of grid rows for the current card layout.
   */
  getCardSize() {
    if (this.#cardView.config.layout === CARD.layout.orientations.vertical.label) {
      return CARD.layout.orientations.vertical.grid.grid_rows;
    }
    return CARD.layout.orientations.horizontal.grid.grid_rows;
  }

  /**
   * Returns the layout options based on the current layout configuration.
   *
   * @returns {object} - The layout options for the current layout configuration.
   */
  getLayoutOptions() {
    if (this.#cardView.config.layout === CARD.layout.orientations.vertical.label) {
      return CARD.layout.orientations.vertical.grid;
    }
    return CARD.layout.orientations.horizontal.grid;
  }

  /** --------------------------------------------------------------------------
   * Private methods organized by functionality
   */

  // === INITIALIZATION ===

  #initializeModule() {
    if (!EntityProgressCard._moduleLoaded) {
      console.groupCollapsed(CARD.console.message, CARD.console.css);
      console.log(CARD.console.link);
      console.groupEnd();
      if (this.#debug) debugLog(Object.keys(LANGUAGES));
      EntityProgressCard._moduleLoaded = true;
    }
  }

  #setupClickableTarget() {
    const selector = CARD.htmlStructure.elements;

    if (this.#cardView.hasClickableCard) {
      this.#clickableTarget = this;
    } else if (this.#cardView.hasClickableIcon) {
      this.#clickableTarget = [this.#domElements[selector.shape.class], this.#domElements[selector.icon.class]];
    } else {
      this.#clickableTarget = null;
    }
  }

  // === CARD BUILDING ===

  /**
   * Builds and initializes the structure of the custom card component.
   *
   * This method creates the visual and structural elements of the card and injects
   * them into the component's Shadow DOM.
   */
  #buildCard() {
    if (this.#debug) debugLog('👉 EntityProgressCard.#buildCard()');

    const { style, card } = this.#createCardElements();
    this.shadowRoot.replaceChildren(style, card);
    this.#storeDOM(card);
  }

  #createCardElements() {
    const style = document.createElement(CARD.style.element);
    style.textContent = CARD_CSS;

    const card = document.createElement(CARD.htmlStructure.card.element);
    this.#buildStyle(card);
    card.innerHTML = CARD_HTML;

    return { style, card };
  }

  #buildStyle(card) {
    this.#addBaseClasses(card);
    this.#applyConditionalClasses(card);
    this.#handleHiddenComponents(card);
    this.#handleWatermarkClasses(card);
  }

  #addBaseClasses(card) {
    const classesToAdd = [CARD.meta.typeName];

    if (this.#cardView.config.bar_orientation) {
      classesToAdd.push(CARD.style.dynamic.progressBar.orientation[this.#cardView.config.bar_orientation]);
    }

    classesToAdd.push(this.#cardView.config.layout, this.#cardView.config.bar_size);
    card.classList.add(...classesToAdd);
  }

  #applyConditionalClasses(card) {
    const conditionalClasses = new Map([
      [CARD.style.dynamic.clickable.card, this.#cardView.hasClickableCard],
      [CARD.style.dynamic.clickable.icon, this.#cardView.hasClickableIcon],
    ]);

    conditionalClasses.forEach((condition, className) => {
      card.classList.toggle(className, condition);
    });
  }

  #handleHiddenComponents(card) {
    const components = [
      CARD.style.dynamic.hiddenComponent.icon,
      CARD.style.dynamic.hiddenComponent.name,
      CARD.style.dynamic.hiddenComponent.secondary_info,
      CARD.style.dynamic.hiddenComponent.progress_bar,
    ];

    components.forEach((component) => {
      this.#toggleHiddenComponent(card, component);
    });
  }

  #toggleHiddenComponent(card, component) {
    card.classList.toggle(component.class, this.#cardView.componentIsHidden(component.label));
  }

  #handleWatermarkClasses(card) {
    if (!this.#cardView.hasWatermark) return;

    const type = this.#cardView.watermark.type === 'line' ? 'line-' : '';
    const baseClass = CARD.htmlStructure.elements.progressBar.watermark.class;
    const showClass = CARD.style.dynamic.show;

    card.classList.toggle(`${showClass}-HWM-${type}${baseClass}`, !this.#cardView.watermark.disable_high);
    card.classList.toggle(`${showClass}-LWM-${type}${baseClass}`, !this.#cardView.watermark.disable_low);
  }

  // === DOM MANAGEMENT ===

  #storeDOM(card) {
    const selectors = CARD.htmlStructure.elements;

    this.#domElements = {
      [CARD.htmlStructure.card.element]: card,
    };

    const elementsToFind = [
      selectors.icon,
      selectors.shape,
      selectors.badge.icon,
      selectors.name,
      selectors.nameCustomInfo,
      selectors.customInfo,
      selectors.stateAndProgressInfo,
    ];

    elementsToFind.forEach(({ class: className }) => {
      const element = this.shadowRoot.querySelector(`.${className}`);

      if (element) {
        this.#domElements[className] = element;
      } else {
        console.warn(`Element with class '${className}' not found in shadow DOM.`);
      }
    });
  }

  #updateElement(key, updateCallback) {
    const element = this.#domElements[key];
    if (element) {
      updateCallback(element);
    }
  }

  #updateCSSValue(key, value) {
    this.#updateElement(CARD.htmlStructure.card.element, (el) => {
      el.style.setProperty(key, value);
    });
  }

  // === WATERMARK MANAGEMENT ===

  #updateWatermark() {
    if (!this.#cardView.hasWatermark) return;

    const wm = this.#cardView.watermark;
    const properties = EntityProgressTemplate.#getWatermarkProperties(wm);

    properties.forEach(([key, value]) => {
      this.#updateCSSValue(key, value);
    });
  }

  static #getWatermarkProperties(watermark) {
    return [
      [CARD.style.dynamic.watermark.high.value.var, `${watermark.high}%`],
      [CARD.style.dynamic.watermark.high.color.var, watermark.high_color],
      [CARD.style.dynamic.watermark.low.value.var, `${watermark.low}%`],
      [CARD.style.dynamic.watermark.low.color.var, watermark.low_color],
      [CARD.style.dynamic.watermark.opacity.var, watermark.opacity],
    ];
  }

  // === BADGE MANAGEMENT ===

  #renderBadgeIcon(content) {
    const isMdiIcon = content.includes('mdi:');
    const containerClass = `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`;

    this.#domElements[CARD.htmlStructure.card.element].classList.toggle(containerClass, isMdiIcon);

    if (isMdiIcon) {
      this.#setBadgeIcon(content);
    }
  }

  #renderBadgeColor(content) {
    const backgroundColor = ThemeManager.adaptColor(content);
    const color = 'var(--white-color)';
    this.#setBadgeColor(color, backgroundColor);
  }

  #setBadgeIcon(icon) {
    this.#updateElement(CARD.htmlStructure.elements.badge.icon.class, (el) => {
      const currentIcon = el.getAttribute(CARD.style.icon.badge.default.attribute);
      if (currentIcon !== icon) {
        el.setAttribute(CARD.style.icon.badge.default.attribute, icon);
      }
    });
  }

  #setBadgeColor(color, backgroundColor) {
    this.#updateElement(CARD.htmlStructure.card.element, (el) => {
      const style = el.style;
      const currentBgColor = style.getPropertyValue(CARD.style.dynamic.badge.backgroundColor.var);
      const currentColor = style.getPropertyValue(CARD.style.dynamic.badge.color.var);

      if (currentBgColor !== backgroundColor || currentColor !== color) {
        style.setProperty(CARD.style.dynamic.badge.backgroundColor.var, backgroundColor);
        style.setProperty(CARD.style.dynamic.badge.color.var, color);
      }
    });
  }

  // === ICON MANAGEMENT ===

  #showIcon(iconFromJinja = null) {
    const stateObj = this.#cardView.EntityStateObj;
    const curIcon = iconFromJinja || this.#cardView.config.icon;
    const stateObjIcon = EntityProgressTemplate.#createStateObjForIcon(stateObj, curIcon);

    this.#createAndSetIcon(stateObjIcon);
  }

  static #createStateObjForIcon(stateObj, curIcon) {
    if (stateObj) {
      return EntityProgressTemplate.#createStateObjFromExisting(stateObj, curIcon);
    } else {
      return EntityProgressTemplate.#createFallbackStateObj(curIcon);
    }
  }

  static #createStateObjFromExisting(stateObj, curIcon) {
    const hasIconOverride = curIcon !== null;
    const hasPicture = stateObj?.attributes?.entity_picture;

    const clonedAttributes = { ...stateObj.attributes };

    if (hasPicture) {
      delete clonedAttributes.icon;
    } else if (hasIconOverride) {
      clonedAttributes.icon = curIcon;
    }

    return {
      ...stateObj,
      attributes: clonedAttributes,
    };
  }

  static #createFallbackStateObj(curIcon) {
    return {
      entity_id: 'notfound.entity',
      state: 'notfound',
      attributes: {
        icon: curIcon,
      },
    };
  }

  #createAndSetIcon(stateObjIcon) {
    this.#icon = document.createElement('ha-state-icon');
    this.#icon.hass = this.hass;
    this.#icon.stateObj = stateObjIcon;

    this.#domElements[CARD.htmlStructure.elements.icon.class].replaceChildren(this.#icon);
  }

  // === SHAPE MANAGEMENT ===

  #manageShape() {
    this.#domElements[CARD.htmlStructure.card.element].classList.toggle(
      CARD.style.dynamic.hiddenComponent.shape.class,
      !this.#cardView.hasVisibleShape
    );
  }

  // === JINJA TEMPLATE RENDERING ===

  #renderJinja(key, content) {
    if (this.#debug) debugLog('👉 EntityProgressTemplate.#renderJinja()', key);

    const renderHandlers = this.#getRenderHandlers(content);
    const handler = renderHandlers[key];

    if (handler) {
      handler();
    } else {
      console.error(`Jinja - Unknown case: ${key}`);
    }
  }

  #getRenderHandlers(content) {
    return {
      secondary: () => this.#renderSecondary(content),
      name: () => this.#renderName(content),
      badge_icon: () => this.#renderBadgeIcon(content),
      badge_color: () => this.#renderBadgeColor(content),
      icon: () => this.#showIcon(content),
      percent: () => this.#updateCSSValue(CARD.style.dynamic.progressBar.size.var, `${content}%`),
      color: () => this.#updateCSSValue(CARD.style.dynamic.iconAndShape.color.var, ThemeManager.adaptColor(content)),
      bar_color: () => this.#updateCSSValue(CARD.style.dynamic.progressBar.color.var, ThemeManager.adaptColor(content)),
    };
  }

  #renderSecondary(content) {
    this.#renderTextContent(CARD.htmlStructure.elements.customInfo.class, `${content}`);
  }

  #renderName(content) {
    this.#renderTextContent(CARD.htmlStructure.elements.name.class, `${content}`);
  }

  #renderTextContent(className, formattedContent) {
    this.#updateElement(className, (el) => {
      if (el.innerHTML !== formattedContent) {
        el.innerHTML = formattedContent.trim();
      }
    });
  }

  // === TEMPLATE PROCESSING ===

  async #processJinjaFields() {
    if (!this.#resourceManager || this.#isGalleryMode()) {
      return;
    }

    const templates = this.#getTemplateFields();

    for (const [key, template] of Object.entries(templates)) {
      if (!template.trim()) continue;
      
      await this.#subscribeToTemplate(key, template);
    }
  }

  #getTemplateFields() {
    const config = this.#cardView.config;

    return {
      name: config.name || '',
      secondary: config.secondary || '',
      badge_icon: config.badge_icon || '',
      badge_color: config.badge_color || '',
      icon: config.icon || '',
      percent: config.percent || '',
      color: config.color || '',
      bar_color: config.bar_color || '',
    };
  }

  async #subscribeToTemplate(key, template) {
    try {
      const unsub = await this.hass.connection.subscribeMessage((msg) => this.#renderJinja(key, msg.result), {
        type: 'render_template',
        template: template,
      });

      this.#resourceManager.addSubscription(unsub, `template-${key}`);
    } catch (error) {
      console.error(`Failed to subscribe to template ${key}:`, error);
    }
  }
  #isGalleryMode() {
    return this.#cardView?.config?._gallery_mode === true;
  }
}

/** --------------------------------------------------------------------------
 * Define static properties and register the custom element for the card.
 *
 * @static
 */
EntityProgressTemplate.version = VERSION;
EntityProgressTemplate._moduleLoaded = false;
customElements.define(`${CARD.meta.typeName}-template`, EntityProgressTemplate);

/** --------------------------------------------------------------------------
 * Registers the custom card in the global `customCards` array for use in Home Assistant.
 */
window.customCards.push({
  type: `${CARD.meta.typeName}-template`,
  name: `${CARD.meta.name} Template`,
  preview: true,
  description: CARD.meta.description,
});

/** --------------------------------------------------------------------------
 * EDITOR PART
 */

class ConfigUpdateEventHandler {
  #debug = CARD.config.debug.editor;

  constructor(newConfig) {
    this.config = structuredClone(newConfig);

    this.updateFunctions = new Map([
      [EDITOR_INPUT_FIELDS.basicConfiguration.attribute.name, this.updateField],
      [EDITOR_INPUT_FIELDS.content.field.max_value_attribute.name, this.updateField],
      [EDITOR_INPUT_FIELDS.content.field.name.name, this.updateField],
      [EDITOR_INPUT_FIELDS.content.field.unit.name, this.updateField],
      [EDITOR_INPUT_FIELDS.theme.field.bar_size.name, this.updateField],
      [EDITOR_INPUT_FIELDS.theme.field.layout.name, this.updateField],
      [EDITOR_INPUT_FIELDS.theme.field.theme.name, this.updateField],

      [EDITOR_INPUT_FIELDS.content.field.decimal.name, this.updateNumericField],
      [EDITOR_INPUT_FIELDS.content.field.min_value.name, this.updateNumericField],

      [EDITOR_INPUT_FIELDS.content.field.max_value.name, this.updateMaxValueField],

      [EDITOR_INPUT_FIELDS.interaction.field.icon_tap_action.name, this.updateInteractionField],
      [EDITOR_INPUT_FIELDS.interaction.field.icon_double_tap_action.name, this.updateInteractionField],
      [EDITOR_INPUT_FIELDS.interaction.field.icon_hold_action.name, this.updateInteractionField],
      [EDITOR_INPUT_FIELDS.interaction.field.tap_action.name, this.updateInteractionField],
      [EDITOR_INPUT_FIELDS.interaction.field.double_tap_action.name, this.updateInteractionField],
      [EDITOR_INPUT_FIELDS.interaction.field.hold_action.name, this.updateInteractionField],

      [EDITOR_INPUT_FIELDS.basicConfiguration.entity.name, this.updateEntityOrValueField],
      [EDITOR_INPUT_FIELDS.theme.field.icon.name, this.updateEntityOrValueField],
      [EDITOR_INPUT_FIELDS.theme.field.bar_color.name, this.updateEntityOrValueField],
      [EDITOR_INPUT_FIELDS.theme.field.color.name, this.updateEntityOrValueField],

      [EDITOR_INPUT_FIELDS.theme.field.toggleBar.name, this.updateToggleField],
      [EDITOR_INPUT_FIELDS.theme.field.toggleIcon.name, this.updateToggleField],
      [EDITOR_INPUT_FIELDS.theme.field.toggleName.name, this.updateToggleField],
      [EDITOR_INPUT_FIELDS.theme.field.toggleValue.name, this.updateToggleField],
      [EDITOR_INPUT_FIELDS.theme.field.toggleSecondaryInfo.name, this.updateToggleField],

      [EDITOR_INPUT_FIELDS.theme.field.toggleCircular.name, this.updateCircularField],
      [EDITOR_INPUT_FIELDS.theme.field.toggleUnit.name, this.updateUnitField],
    ]);
  }

  updateConfig(changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateConfig()');
    if (this.#debug) debugLog('  📎 ', changedEvent);

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
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateField()');

    if (changedEvent.target.value == null || changedEvent.target.value.trim() === '') {
      delete this.config[targetId];
    } else {
      this.config[targetId] = changedEvent.target.value;
    }
  }

  updateNumericField(targetId, changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateNumericField()');

    const curValue = parseFloat(changedEvent.target.value);
    if (isNaN(curValue)) {
      delete this.config[targetId];
    } else {
      this.config[targetId] = curValue;
    }
  }

  updateMaxValueField(targetId, changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateMaxValueField()');

    if (!isNaN(changedEvent.target.value) && changedEvent.target.value.trim() !== '') {
      this.config[targetId] = parseFloat(changedEvent.target.value);
    } else if (changedEvent.target.value.trim() !== '') {
      this.config[targetId] = changedEvent.target.value;
    } else {
      delete this.config[targetId];
    }
  }

  updateInteractionField(targetId, changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateInteractionField()');

    this.config[targetId] = changedEvent.detail.value[targetId];
  }

  updateEntityOrValueField(targetId, changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateEntityOrValueField()');
    if (changedEvent?.detail?.value && typeof changedEvent.detail.value[targetId] === 'string' && changedEvent.detail.value[targetId].trim() !== '') {
      this.config[targetId] = changedEvent.detail.value[targetId];
    } else {
      delete this.config[targetId];
    }
  }

  updateToggleField(targetId, changedEvent) {
    if (this.#debug) debugLog('👉 ConfigUpdateEventHandler.updateToggleField()');
    const key = targetId.replace('toggle_', '');
    const newConfig = structuredClone(this.config);

    if (this.#debug) debugLog('    📌 *** CONFIG before ***:', JSON.stringify(this.config, null, 2));
    if (this.#debug) debugLog('    📌 *** NEWCONFIG before ***:', JSON.stringify(newConfig, null, 2));

    if (!Array.isArray(newConfig.hide)) {
      newConfig.hide = [];
    } else {
      newConfig.hide = [...newConfig.hide];
    }
    if (this.#debug) debugLog('    📌 *** NEWCONFIG (Hide Management) ***:', JSON.stringify(newConfig, null, 2));

    const isChecked = changedEvent.target.checked;
    if (this.#debug) debugLog('    📌 *** key ***:', key);
    if (this.#debug) debugLog('    📌 *** is checked ***:', isChecked);
    
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
    if (this.#debug) debugLog('    📌 *** CONFIG after ***:', JSON.stringify(this.config, null, 2));
    if (this.#debug) debugLog('    📌 *** NEWCONFIG after ***:', JSON.stringify(newConfig, null, 2));
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

/*
 * Custom editor component for configuring the `EntityProgressCard`.
 * HA Components:
 *  - https://github.com/home-assistant/frontend/blob/28304bb1dcebfddf3ab991e2f9e38f44427fe0f8/src/data/selector.ts
 */
class EntityProgressCardEditor extends HTMLElement {
  static #debug = CARD.config.debug.editor;
  #hassProvider = null;
  #resourceManager = null;
  #container = null;
  #config = {};
  #previous = { entity: null, max_value: null };
  #isRendered = false;
  #isYAML = false;
  #domElements = {};
  #accordionList = [];
  #accordionTitleList = [];
  #currentLanguage = CARD.config.language;
  #isListenersAttached = false;

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });
    this.#hassProvider = HassProviderSingleton.getInstance();
    if (EntityProgressCardEditor.#debug) debugLog('📌 Navigator: ', navigator.userAgent);
  }

  connectedCallback() {
    if (EntityProgressCardEditor.#debug) debugLog('👉 Editor.connectedCallback()');
    if (!this.#resourceManager) this.#resourceManager = new ResourceManager();
    if (this.#isRendered && !this.#isListenersAttached && this.#isYAML) {
      this.#addEventListener();
      this.#isListenersAttached = true;
      this.#isYAML = false;
    }
  }

  disconnectedCallback() {
    if (EntityProgressCardEditor.#debug) debugLog('👉 Editor.disconnectedCallback()');
    this.#resourceManager?.cleanup();
    this.#isListenersAttached = false;
    this.#isYAML = true;
  }

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
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.setConfig()');
    if (EntityProgressCardEditor.#debug) debugLog('  📎 config: ', config);
    this.#config = { ...config };
    if (!this.#hassProvider.isValid) {
      return;
    }
    if (!this.#isRendered) {
      this.#domElements = {};
      this.#accordionList = [];
      this.#accordionTitleList = [];
      this.render();
      this.#isRendered = true;
      this.#isListenersAttached = false;
    }

    if (EntityProgressCardEditor.#debug) debugLog('  📎 container GUI: ', this.#container);
    if (EntityProgressCardEditor.#debug) debugLog('  📎 connected ?: ', this.isConnected);

    if (!this.isConnected) this.#isYAML = true; // YAML editor
    if (!this.#isListenersAttached && this.isConnected) {
      // GUI editor
      this.#addEventListener();
      this.#isListenersAttached = true;
    }
    this.#updateFields();
  }

  #updateFields() {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#updateFields()');

    const standardFieldType = new Set(['ha-select', 'ha-textfield']);
    const excludeStandardType = new Set([CARD.editor.keyMappings.attribute, CARD.editor.keyMappings.max_value_attribute]);

    for (const [key, element] of Object.entries(this.#domElements)) {
      if (standardFieldType.has(element.localName) && !excludeStandardType.has(key)) {
        this.#updateStandardField(key, element);
      } else if (element.localName === 'ha-form') {
        EntityProgressCardEditor.#updateHAForm(element, key, this.#config[key]);
      }
    }

    // Theme
    this.#toggleFieldDisable(CARD.editor.keyMappings.theme, this.#config.theme !== undefined);

    const entityHasAttribute = this.#updateAttributFromEntity('entity', 'attribute');
    this.#toggleFieldDisable(EDITOR_INPUT_FIELDS.basicConfiguration.attribute.isInGroup, !entityHasAttribute);

    const maxVlueHasAttribute = this.#updateAttributFromEntity('max_value', 'max_value_attribute');
    this.#toggleFieldDisable(EDITOR_INPUT_FIELDS.content.field.max_value_attribute.isInGroup, !maxVlueHasAttribute);

    // hide
    this.#updateToggleFields();
  }

  #updateStandardField(key, element) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#updateStandardField()');
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ key ', key);
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ element: ', element);
    const newValue = Object.hasOwn(this.#config, key) ? this.#config[key] : '';
    const currentValue = element.value;
    const shouldUpdate = typeof currentValue === 'string' ? currentValue !== String(newValue) : currentValue !== newValue;

    if (shouldUpdate) {
      element.value = newValue;
      if (EntityProgressCardEditor.#debug) debugLog('        🆕 updateFields - update: ', [key, newValue]);
    }
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ done');
  }

  static #updateHAForm(form, key, newValue) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#updateHAForm()');
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ Update HA Form (Before) ------> ', form.data);
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ NewValue: ', newValue);

    if (form.data === undefined || (newValue !== undefined && form.data[key] !== newValue)) {
      if (EntityProgressCardEditor.#debug) debugLog('        🆕 NewValue: update.');
      form.data = {
        ...form.data,
        [key]: newValue,
      };
      if (EntityProgressCardEditor.#debug) debugLog(form.data);
    } else if (newValue === undefined && form.data[key] !== undefined) {
      if (EntityProgressCardEditor.#debug) debugLog('        🆕 key: set undef...');
      form.data = {
        ...form.data,
        [key]: undefined,
      };
    }
    if (EntityProgressCardEditor.#debug) debugLog('        ✅ Update HA Form (after) ------> ', form.data);
  }

  #updateAttributFromEntity(entity, attribute) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#updateAttributFromEntity()');
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 entity: ${entity}`);
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 attribute: ${attribute}`);

    // Création d'une instance EntityOrValue pour l'entité courante
    const curEntity = new EntityOrValue();
    curEntity.value = this.#config[entity];
    const attributeList = curEntity.attributesListForEditor;
    if (EntityProgressCardEditor.#debug) debugLog('  📎 attribute liste:', attributeList);

    // Si l'entité a changé et que l'entité courante a des attributs, on régénère la liste.
    if (this.#previous[entity] !== this.#config[entity] && curEntity.hasAttribute) {
      this.#previous[entity] = this.#config[entity];
      const targetElement = this.#domElements[attribute];
      if (targetElement) {
        this.#updateChoices(targetElement, attribute, attributeList);
      }
      if (EntityProgressCardEditor.#debug) debugLog(`        ✅ updateFields - ${entity} attributes list: `, attributeList);
    }

    // Si l'attribut n'est pas défini dans la config ET
    // que l'entité possède des attributs ET
    // que la valeur du select ne correspond pas encore au defaultAttribute :
    if (this.#config[attribute] === undefined && curEntity.hasAttribute) {
      if (EntityProgressCardEditor.#debug) debugLog(`        ✅ updateFields - Attribute ${attribute} (default): in progress...`);
      EntityProgressCardEditor.#applySelectValueOnUpdate(this.#domElements[attribute], curEntity.defaultAttribute);
    }

    if (
      this.#config[attribute] &&
      curEntity.hasAttribute &&
      Object.hasOwn(curEntity.attributes, this.#config[attribute]) &&
      this.#domElements[attribute].value !== this.#config[attribute]
    ) {
      this.#domElements[attribute].value = this.#config[attribute];
      if (EntityProgressCardEditor.#debug) debugLog(`        ✅ updateFields - Attribute ${attribute}: `, curEntity.attributes);
    }

    return curEntity.hasAttribute;
  }
  static async #applySelectValueOnUpdate(select, value) {
    await select.updateComplete;

    const values = Array.from(select.children).map((el) => el.getAttribute('value'));
    if (values.includes(value)) {
      select.value = value;
      if (this.#debug) debugLog('        ✅ applySelectValueOnUpdate - Entity attribute (default): ', value);
    } else {
      if (this.#debug) debugLog('        ❌ applySelectValueOnUpdate - Default attribute not found in select options', values);
    }
  }
  #updateToggleFields() {
    const hide = this.#config.hide || [];
    const toggleMappings = {
      toggle_force_circular_background: this.#config.force_circular_background === true,
      toggle_unit: this.#config.disable_unit !== true,
      toggle_icon: !hide.includes('icon'),
      toggle_name: !hide.includes('name'),
      toggle_value: !hide.includes('value'),
      toggle_secondary_info: !hide.includes('secondary_info'),
      toggle_progress_bar: !hide.includes('progress_bar'),
    };

    for (const [toggleKey, shouldBeChecked] of Object.entries(toggleMappings)) {
      const toggle = this.#domElements[toggleKey];
      if (toggle && toggle.checked !== shouldBeChecked) {
        toggle.checked = shouldBeChecked;
      }
    }
  }

  #addEventListener() {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#addEventListener');
    const fieldsToProcess = [
      EDITOR_INPUT_FIELDS.basicConfiguration,
      EDITOR_INPUT_FIELDS.content.field,
      EDITOR_INPUT_FIELDS.interaction.field,
      EDITOR_INPUT_FIELDS.theme.field,
    ];
    fieldsToProcess.forEach((fieldObject) => {
      Object.keys(fieldObject).forEach((field) => {
        const value = fieldObject[field]; // Use the correct fieldObject
        this.#addEventListenerFor(value.name, value.type);
      });
    });
    this.#accordionTitleList.forEach((title, index) => {
      this.#resourceManager.addEventListener(
        title,
        CARD.interactions.event.click,
        () => {
          this.toggleAccordion(index);
        },
        undefined, // options
        `accordionTitle-${index}`
      );
    });
  }

  #addEventListenerFor(name, type) {
    if (EntityProgressCardEditor.#debug) debugLog(`👉 Editor.#addEventListenerFor(${name}, ${type})`);
    if (!this.#domElements[name]) {
      console.error(`Element ${name} not found!`);
      return;
    }
    const isHASelect = CARD.editor.fields[type]?.element === CARD.editor.fields.select.element;
    const isToggle = CARD.editor.fields[type]?.element === CARD.editor.fields.toggle.element;
    const events = isHASelect ? CARD.interactions.event.HASelect : isToggle ? CARD.interactions.event.toggle : CARD.interactions.event.other;

    if (EntityProgressCardEditor.#debug) debugLog(`Event: ${events}`);

    if (isHASelect) {
      this.#resourceManager.addEventListener(
        this.#domElements[name],
        CARD.interactions.event.closed,
        (event) => {
          event.stopPropagation();
        },
        undefined, // options
        `close-StopPropa-${name}`
      );
    }
    events.forEach((eventType) => {
      this.#resourceManager.addEventListener(this.#domElements[name], eventType, this.#onChanged.bind(this), undefined, `${eventType}-${name}`);
    });
  }

  #onChanged(changedEvent) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#onChanged()');
    if (EntityProgressCardEditor.#debug) debugLog('  📎 ', changedEvent);
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 ${changedEvent.target.id} -> ${changedEvent.target.value !== undefined ? changedEvent.target.value : changedEvent.detail}`);

    const configUpdateEventHandler = new ConfigUpdateEventHandler(Object.assign({}, this.#config));
    const newConfig = configUpdateEventHandler.updateConfig(changedEvent);

    this.#sendNewConfig(newConfig);
  }

  #sendNewConfig(newConfig) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#sendNewConfig()');
    if (newConfig.grid_options) {
      const { grid_options, ...rest } = newConfig;
      newConfig = { ...rest, grid_options };
    }
    if (EntityProgressCardEditor.#debug) debugLog('  📎 newConfig: ', newConfig);
    const messageEvent = new CustomEvent(CARD.interactions.event.configChanged, {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }

  #toggleFieldDisable(key, disable) {
    this.#container.classList.toggle(`${CARD.style.dynamic.hide}-${key}`, disable);
  }

  /**
   * Update a list of choices to a given `<select>` element based on the specified list type.
   */
  #updateChoices(select, type, choices = null) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#updateChoices()');
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 select: ${select}`);
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 type: ${type}`);
    if (EntityProgressCardEditor.#debug) debugLog(`  📎 choices: ${choices}`);

    const fragment = document.createDocumentFragment();

    const list = [CARD.editor.fields.attribute.type, CARD.editor.fields.max_value_attribute.type].includes(type) ? choices : FIELD_OPTIONS[type];
    if (!list) {
      return;
    }
    if (EntityProgressCardEditor.#debug) debugLog('  📌 list: ', list);

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

  static #computeCustomLabel(s, label) {
    if (this.#debug) debugLog('👉 computeCustomLabel()');
    if (this.#debug) debugLog('  📎 name: ', s.name);
    if (this.#debug) debugLog('  📎 label: ', label);
    return label;
  }

  /**
   * Creates a form field based on the provided configuration and appends it to a container.
   */
  #createField({ name, label, type, required, isInGroup, width, schema = null }) {
    if (EntityProgressCardEditor.#debug) debugLog('👉 editor.#createField()');
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
        this.#domElements[name] = inputElement;
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
        Object.assign(inputElement.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        });

        const toggleLabel = document.createElement(CARD.editor.fields.text.element);
        toggleLabel.textContent = label;

        const toggle = document.createElement(CARD.editor.fields.toggle.element);

        toggle.setAttribute('checked', true);
        toggle.id = name;

        inputElement.appendChild(toggleLabel);
        inputElement.appendChild(toggle);

        this.#domElements[name] = toggle;
        return inputElement; //break;
      }
      default:
        inputElement = document.createElement(CARD.editor.fields.default.element);
        inputElement.type = CARD.editor.fields.default.type;
        break;
    }

    this.#domElements[name] = inputElement;
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

  toggleAccordion(index) {
    const accordion = this.#accordionList[index];
    const panel = accordion.querySelector('.accordion-content');
    if (!panel) return;

    const isExpanding = !accordion.classList.contains('expanded');

    if (isExpanding) {
      // Préparation à l'expansion
      panel.style.display = 'flex'; // pour éviter une disparition instantanée
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.style.paddingTop = '30px';
      panel.style.paddingBottom = '30px';
      panel.style.opacity = '1';

      const _ = panel.offsetHeight; // eslint-disable-line no-unused-vars

      accordion.classList.add('expanded');

      // Supprime max-height après la transition
      const onTransitionEnd = () => {
        panel.removeEventListener('transitionend', onTransitionEnd);
        panel.style.maxHeight = 'none';
      };
      panel.addEventListener('transitionend', onTransitionEnd);
    } else {
      // Ajoute une classe temporaire pour désactiver l'opacité des enfants
      accordion.classList.add('collapsing');

      // Commence par réinitialiser le max-height pour animer proprement
      panel.style.maxHeight = `${panel.scrollHeight}px`;

      // Reflow forcé avant de mettre max-height à 0
      const _ = panel.offsetHeight; // eslint-disable-line no-unused-vars

      panel.style.maxHeight = '0';
      panel.style.paddingTop = '0';
      panel.style.paddingBottom = '0';
      panel.style.opacity = '0';

      const onTransitionEnd = () => {
        panel.removeEventListener('transitionend', onTransitionEnd);
        accordion.classList.remove('expanded');
        accordion.classList.remove('collapsing');
        panel.style.display = '';
      };
      panel.addEventListener('transitionend', onTransitionEnd);
    }
  }

  #renderFields(parent, inputFields) {
    Object.values(inputFields).forEach((field) => {
      if (EntityProgressCardEditor.#debug) debugLog('#renderFields - field: ', field);
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

  /**
   * Renders the editor interface for configuring the card's settings.
   *
   * @returns {void}
   */
  render() {
    const style = document.createElement(CARD.style.element);
    style.textContent = CARD_CSS;
    const fragment = document.createDocumentFragment();
    fragment.appendChild(style);
    this.#container = document.createElement(CARD.editor.fields.container.element);
    this.#container.classList.add(CARD.editor.fields.container.class);

    this.#renderFields(this.#container, EDITOR_INPUT_FIELDS.basicConfiguration);
    for (const section of Object.keys(EDITOR_INPUT_FIELDS)) {
      if (section === 'basicConfiguration') continue;
      this.#renderAccordion(this.#container, EDITOR_INPUT_FIELDS[section]);
    }

    this.#container.appendChild(EntityProgressCardEditor.#makeHelpIcon());
    fragment.appendChild(this.#container);
    this.shadowRoot.appendChild(fragment);
  }
}

/** --------------------------------------------------------------------------
 * Registers the custom element for the EntityProgressCardEditor editor.
 */
customElements.define(CARD.meta.editor, EntityProgressCardEditor);
