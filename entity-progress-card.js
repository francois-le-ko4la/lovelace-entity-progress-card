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
 * @version 1.2.0
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION = '1.2.0';
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
    unit: { default: '%', fahrenheit: '°F', timer: 'timer', flexTimer: 'flextimer', disable: '' },
    showMoreInfo: true,
    reverse: false,
    decimal: { percentage: 0, timer: 0, other: 2 },
    entity: {
      state: { unavailable: 'unavailable', unknown: 'unknown', notFound: 'notFound', idle: 'idle', active: 'active', paused: 'paused' },
      type: { timer: 'timer', light: 'light', cover: 'cover', fan: 'fan', climate: 'climate', counter: 'counter' },
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
    debug: false,
  },
  htmlStructure: {
    card: { element: 'ha-card' },
    sections: {
      container: { element: 'div', class: 'container' },
      left: { element: 'div', class: 'left' },
      right: { element: 'div', class: 'right' },
    },
    elements: {
      icon: { element: 'ha-icon', class: 'icon' },
      shape: { element: 'ha-shape', class: 'shape' },
      name: { element: 'div', class: 'name' },
      percentage: { element: 'div', class: 'percentage' },
      secondaryInfo: { element: 'div', class: 'secondary-info' },
      progressBar: {
        container: { element: 'div', class: 'progress-bar-container' },
        bar: { element: 'div', class: 'progress-bar' },
        inner: { element: 'div', class: 'progress-bar-inner' },
      },
      badge: {
        container: { element: 'div', class: 'badge' },
        icon: { element: 'ha-icon', class: 'badge-icon' },
      },
    },
    alert: {
      container: { element: 'progress-alert' },
      icon: { element: 'ha-icon', class: 'progress-alert-icon' },
      message: { element: 'div', class: 'progress-alert-message' },
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
        unavailable: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--orange-color)', attribute: 'icon' },
        notFound: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--red-color)', attribute: 'icon' },
        timer: {
          active: { icon: 'mdi:play', color: 'white', backgroundColor: 'var(--success-color)', attribute: 'icon' },
          paused: { icon: 'mdi:pause', color: 'white', backgroundColor: 'var(--state-icon-color)', attribute: 'icon' },
        },
      },
      byDeviceDomain: {
        binary_sensor: 'mdi:circle-outline',
        climate: 'mdi:thermostat',
        counter: 'mdi:counter',
        cover: 'mdi:garage',
        fan: 'mdi:fan',
        input_boolean: 'mdi:toggle-switch',
        input_number: 'mdi:numeric',
        input_select: 'mdi:form-dropdown',
        media_player: 'mdi:speaker',
        light: 'mdi:lightbulb',
        lock: 'mdi:lock',
        person: 'mdi:account',
        sensor: 'mdi:eye',
        scene: 'mdi:palette',
        switch: 'mdi:toggle-switch',
        timer: 'mdi:timer-outline',
        weather: 'mdi:weather-cloudy',
        sun: 'mdi:white-balance-sunny',
      },
      byDeviceClass: {
        battery: 'mdi:battery',
        carbon_dioxide: 'mdi:molecule-co2',
        cold: 'mdi:snowflake',
        connectivity: 'mdi:wifi',
        current: 'mdi:current-ac',
        door: 'mdi:door-open',
        duration: 'mdi:timer-outline',
        energy: 'mdi:flash',
        gas: 'mdi:fire',
        heat: 'mdi:fire',
        humidity: 'mdi:water-percent',
        illuminance: 'mdi:brightness-5',
        lock: 'mdi:lock',
        moisture: 'mdi:water',
        motion: 'mdi:motion-sensor',
        occupancy: 'mdi:account',
        opening: 'mdi:window-open',
        plug: 'mdi:power-plug',
        pm25: 'mdi:molecule',
        power: 'mdi:flash',
        power_factor: 'mdi:flash',
        pressure: 'mdi:gauge',
        problem: 'mdi:alert',
        safety: 'mdi:shield-check',
        shutter: 'mdi:window-shutter',
        smoke: 'mdi:smoke-detector',
        sound: 'mdi:volume-high',
        switch: 'mdi:power-socket',
        temperature: 'mdi:thermometer',
        timestamp: 'mdi:calendar-clock',
        tv: 'mdi:television',
        vibration: 'mdi:vibrate',
        volatile_organic_compounds_parts: 'mdi:molecule',
        voltage: 'mdi:flash',
        window: 'mdi:window-open',
      },
      suffix: { open: '-open' },
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
        orientation: { rtl: 'rtl_orientation' },
      },
      secondaryInfoError: { class: 'secondary-info-error' },
      show: 'show',
      hide: 'hide',
      clickable: 'clickable',
      hiddenComponent: {
        icon: { label: 'icon', class: 'hide_icon' },
        shape: { label: 'shape', class: 'hide_shape' },
        name: { label: 'name', class: 'hide_name' },
        secondary_info: { label: 'secondary_info', class: 'hide_secondary_info' },
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
    event: { HASelect: ['selected'], other: ['value-changed', 'input'], closed: 'closed', click: 'click', configChanged: 'config-changed' },
    tap_action: {
      default: 'default',
      navigate: {
        action: 'navigate',
        navigation_path: '',
      },
      moreInfo: {
        action: 'more-info',
      },
      url: {
        action: 'url',
        url_path: '',
      },
      none: {
        action: 'none',
      },
    },
  },
  editor: {
    fields: {
      container: { element: 'div', class: 'editor' },
      fieldContainer: { element: 'div', class: 'editor-field-container' },
      fieldDescription: { element: 'span', class: 'editor-field-description' },
      entity: { type: 'entity', element: 'ha-entity-picker' },
      attribute: { type: 'attribute', element: 'ha-select' },
      max_value_attribute: { type: 'max_value_attribute', element: 'ha-select' },
      icon: { type: 'icon', element: 'ha-icon-picker' },
      layout: { type: 'layout', element: 'ha-select' },
      bar_size: { type: 'bar_size', element: 'ha-select' },
      tap_action: { type: 'tap_action', element: 'ha-select' },
      navigation_picker: { type: 'navigation_picker', element: 'ha-select' },
      theme: { type: 'theme', element: 'ha-select' },
      color: { type: 'color', element: 'ha-select' },
      number: { type: 'number', element: 'ha-textfield' },
      default: { type: 'text', element: 'ha-textfield' },
      listItem: { type: 'list item', element: 'mwc-list-item' },
      iconItem: { element: 'ha-icon', attribute: 'icon', class: 'editor-icon-list' },
      select: { element: 'ha-select' },
      toggle: { type: 'toggle', element: 'ha-switch' },
      colorDot: { element: 'span', class: 'select-color-item' },
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
      navigateTo: 'navigate_to', // keep it
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

CARD.console = {
  message: `%c✨${CARD.meta.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
  css: 'color:orange; background-color:black; font-weight: bold;',
  link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card',
};

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

const MSG = {
  entityError: {
    en: "entity: The 'entity' parameter is required!",
    fr: "entity: Le paramètre 'entity' est requis !",
    es: "entity: ¡El parámetro 'entity' es obligatorio!",
    it: "entity: Il parametro 'entity' è obbligatorio!",
    de: "entity: Der Parameter 'entity' ist erforderlich!",
    nl: "entity: De parameter 'entity' is verplicht!",
    hr: "entity: Parametar 'entity' je obavezan!",
    pl: "entity: Parametr 'entity' jest wymagany!",
    mk: "entity: Параметарот 'entity' е задолжителен!",
    pt: "entity: O parâmetro 'entity' é obrigatório!",
    da: "entity: Parameteren 'entity' er påkrævet!",
    nb: "entity: Parameteret 'entity' er påkrevd!",
    sv: "entity: Parametern 'entity' är obligatorisk!",
  },
  entityNotFound: {
    en: 'Entity not found',
    fr: 'Entité introuvable',
    es: 'Entidad no encontrada',
    it: 'Entità non trovata',
    de: 'Entität nicht gefunden',
    nl: 'Entiteit niet gevonden',
    hr: 'Entitet nije pronađen',
    pl: 'Encji nie znaleziono',
    mk: 'Ентитетот не е пронајден',
    pt: 'Entidade não encontrada',
    da: 'Enheden blev ikke fundet',
    nb: 'Enheten ble ikke funnet',
    sv: 'Enhet ej funnen',
  },
  entityUnknown: {
    en: 'Unknown',
    fr: 'Inconnu',
    es: 'Desconocido',
    it: 'Sconosciuto',
    de: 'Unbekannt',
    nl: 'Onbekend',
    hr: 'Nepoznat',
    pl: 'Nieznany',
    mk: 'Непознат',
    pt: 'Desconhecido',
    da: 'Ukendt',
    nb: 'Ukjent',
    sv: 'Okänd',
  },
  entityUnavailable: {
    en: 'Unavailable',
    fr: 'Indisponible',
    es: 'No disponible',
    it: 'Non disponibile',
    de: 'Nicht verfügbar',
    nl: 'Niet beschikbaar',
    hr: 'Nedostupno',
    pl: 'Niedostępny',
    mk: 'Недостапно',
    pt: 'Indisponível',
    da: 'Utilgængelig',
    nb: 'Utilgjengelig',
    sv: 'Otillgänglig',
  },
  attributeNotFound: {
    en: 'attribute: Attribute not found in HA.',
    fr: 'attribute: Attribut introuvable dans HA.',
    es: 'attribute: Atributo no encontrado en HA.',
    it: 'attribute: Attributo non trovato in HA.',
    de: 'attribute: Attribut in HA nicht gefunden.',
    nl: 'attribute: Attribuut niet gevonden in HA.',
    hr: 'attribute: Atribut nije pronađen u HA.',
    pl: 'attribute: Atrybut nie znaleziony w HA.',
    mk: 'attribute: Атрибутот не е пронајден во HA.',
    pt: 'attribute: Atributo não encontrado no HA.',
    da: 'attribute: Attribut ikke fundet i HA.',
    nb: 'attribute: Attributt ikke funnet i HA.',
    sv: 'attribute: Attributet hittades inte i HA.',
  },
  minValueError: {
    en: 'min_value: Check your min_value.',
    fr: 'min_value: Vérifiez votre min_value.',
    es: 'min_value: Verifique su min_value.',
    it: 'min_value: Controlla il tuo min_value.',
    de: 'min_value: Überprüfen Sie Ihren min_value.',
    nl: 'min_value: Controleer je min_value.',
    hr: 'min_value: Provjerite svoj min_value.',
    pl: 'min_value: Sprawdź swój min_value.',
    mk: 'min_value: Проверете го вашиот min_value.',
    pt: 'min_value: Verifique o seu min_value.',
    da: 'min_value: Tjekk din min_value.',
    nb: 'min_value: Sjekk din min_value.',
    sv: 'min_value: Kontrollera ditt min_value.',
  },
  maxValueError: {
    en: 'max_value: Check your max_value.',
    fr: 'max_value: Vérifiez votre max_value.',
    es: 'max_value: Verifique su max_value.',
    it: 'max_value: Controlla il tuo max_value.',
    de: 'max_value: Überprüfen Sie Ihren max_value.',
    nl: 'max_value: Controleer je max_value.',
    hr: 'max_value: Provjerite svoj max_value.',
    pl: 'max_value: Sprawdź swój max_value.',
    mk: 'max_value: Проверете го вашиот max_value.',
    pt: 'max_value: Verifique o seu max_value.',
    da: 'max_value: Tjekk din max_value.',
    nb: 'max_value: Sjekk din max_value.',
    sv: 'max_value: Kontrollera ditt max_value.',
  },
  decimalError: {
    en: 'decimal: This value cannot be negative.',
    fr: 'decimal: La valeur ne peut pas être négative.',
    es: 'decimal: El valor no puede ser negativo.',
    it: 'decimal: Questo valore non può essere negativo.',
    de: 'decimal: Negative Werte sind nicht zulässig.',
    nl: 'decimal: Deze waarde kan niet negatief zijn.',
    hr: 'decimal: Ova vrijednost ne može biti negativna.',
    pl: 'decimal: Ta wartość nie może być ujemna.',
    mk: 'decimal: Ова вредност не може да биде негативна.',
    pt: 'decimal: Este valor não pode ser negativo.',
    da: 'decimal: Denne værdi kan ikke være negativ.',
    nb: 'decimal: Denne verdien kan ikke være negativ.',
    sv: 'decimal: Detta värde kan inte vara negativt.',
  },
};

const EDITOR_INPUT_FIELDS = {
  basicConfiguration: {
    entity: {
      name: 'entity',
      label: {
        en: 'Entity',
        fr: 'Entité',
        es: 'Entidad',
        it: 'Entità',
        de: 'Entität',
        nl: 'Entiteit',
        hr: 'Entitet',
        pl: 'Encja',
        mk: 'Ентитет',
        pt: 'Entidade',
        da: 'Enhed',
        nb: 'Enhet',
        sv: 'Enhet',
      },
      type: CARD.editor.fields.entity.type,
      width: '100%',
      required: true,
      isInGroup: null,
      description: {
        en: 'Select an entity from Home Assistant.',
        fr: 'Sélectionnez une entité de Home Assistant.',
        es: 'Seleccione una entidad de Home Assistant.',
        it: "Seleziona un'entità da Home Assistant.",
        de: 'Wählen Sie eine Entität aus Home Assistant.',
        nl: 'Selecteer een entiteit uit Home Assistant.',
        hr: 'Odaberite entitet iz Home Assistanta.',
        pl: 'Wybierz encję z Home Assistant.',
        mk: 'Изберете ентитет од Home Assistant.',
        pt: 'Selecione uma entidade do Home Assistant.',
        da: 'Vælg en enhed fra Home Assistant.',
        nb: 'Velg en enhet fra Home Assistant.',
        sv: 'Välj en enhet från Home Assistant.',
      },
    },
    attribute: {
      name: 'attribute',
      label: {
        en: 'Attribute',
        fr: 'Attribut',
        es: 'Atributo',
        it: 'Attributo',
        de: 'Attribut',
        nl: 'Attribuut',
        hr: 'Atribut',
        pl: 'Atrybut',
        mk: 'Атрибут',
        pt: 'Atributo',
        da: 'Attribut',
        nb: 'Attribut',
        sv: 'Attribut',
      },
      type: CARD.editor.fields.attribute.type,
      width: '100%',
      required: false,
      isInGroup: CARD.editor.keyMappings.attribute,
      description: {
        en: 'Select the attribute.',
        fr: "Sélectionnez l'attribut.",
        es: 'Seleccione el atributo.',
        it: "Seleziona l'attributo.",
        de: 'Wählen Sie das Attribut aus.',
        nl: 'Selecteer het attribuut.',
        hr: 'Odaberite atribut.',
        pl: 'Wybierz atrybut.',
        mk: 'Изберете го атрибутот.',
        pt: 'Selecione o atributo.',
        da: 'Vælg attributet.',
        nb: 'Velg attributtet.',
        sv: 'Välj attributet.',
      },
    },
  },

  content: {
    title: {
      label: {
        en: 'Content',
        fr: 'Contenu',
        es: 'Contenido',
        it: 'Contenuto',
        de: 'Inhalt',
        nl: 'Inhoud',
        hr: 'Sadržaj',
        pl: 'Zawartość',
        mk: 'Cодржина',
        pt: 'Conteúdo',
        da: 'Indhold',
        nb: 'Innhold',
        sv: 'Innehåll',
      },
      icon: 'mdi:text-short',
    },
    field: {
      name: {
        name: 'name',
        label: {
          en: 'Name',
          fr: 'Nom',
          es: 'Nombre',
          it: 'Nome',
          de: 'Name',
          nl: 'Naam',
          hr: 'Ime',
          pl: 'Nazwa',
          mk: 'Име',
          pt: 'Nome',
          da: 'Navn',
          nb: 'Navn',
          sv: 'Namn',
        },
        type: CARD.editor.fields.default.type,
        width: '100%',
        required: false,
        isInGroup: null,
        description: {
          en: 'Enter a name for the entity.',
          fr: "Saisissez un nom pour l'entité.",
          es: 'Introduzca un nombre para la entidad.',
          it: "Inserisci un nome per l'entità.",
          de: 'Geben Sie einen Namen für die Entität ein.',
          nl: 'Voer een naam in voor de entiteit.',
          hr: 'Unesite ime za entitet.',
          pl: 'Wprowadź nazwę dla encji.',
          mk: 'Внесете име за ентитетот.',
          pt: 'Digite um nome para a entidade.',
          da: 'Indtast et navn for enheden.',
          nb: 'Skriv inn et navn for enheten.',
          sv: 'Skriv ett namn för enheten.',
        },
      },
      unit: {
        name: 'unit',
        label: {
          en: 'Unit',
          fr: 'Unité',
          es: 'Unidad',
          it: 'Unità',
          de: 'Einheit',
          nl: 'Eenheid',
          hr: 'Jedinica',
          pl: 'Jednostka',
          mk: 'Јединство',
          pt: 'Unidade',
          da: 'Enhed',
          nb: 'Enhet',
          sv: 'Enhet',
        },
        type: CARD.editor.fields.default.type,
        width: 'calc((100% - 20px) * 0.2)',
        required: false,
        isInGroup: null,
        description: {
          en: 'm, kg...',
          fr: 'm, kg...',
          es: 'm, kg...',
          it: 'm, kg...',
          de: 'm, kg...',
          nl: 'm, kg...',
          hr: 'm, kg...',
          pl: 'm, kg...',
          mk: 'm, kg...',
          pt: 'm, kg...',
          da: 'm, kg...',
          nb: 'm, kg...',
          sv: 'm, kg...',
        },
      },

      decimal: {
        name: 'decimal',
        label: {
          en: 'decimal',
          fr: 'décimal',
          es: 'decimal',
          it: 'Decimale',
          de: 'dezimal',
          nl: 'decimaal',
          hr: 'decimalni',
          pl: 'dziesiętny',
          mk: 'децемален',
          pt: 'decimal',
          da: 'decimal',
          nb: 'desimal',
          sv: 'decimal',
        },
        type: CARD.editor.fields.number.type,
        width: 'calc((100% - 20px) * 0.2)',
        required: false,
        isInGroup: null,
        description: {
          en: 'Precision.',
          fr: 'Précision.',
          es: 'Precisión.',
          it: 'Precisione.',
          de: 'Präzision.',
          nl: 'Precisie.',
          hr: 'Preciznost.',
          pl: 'Precyzja.',
          mk: 'Прецизност.',
          pt: 'Precisão.',
          da: 'Præcision.',
          nb: 'Presisjon.',
          sv: 'Precision.',
        },
      },
      min_value: {
        name: 'min_value',
        label: {
          en: 'Minimum value',
          fr: 'Valeur minimum',
          es: 'Valor mínimo',
          it: 'Valore minimo',
          de: 'Mindestwert',
          nl: 'Minimale waarde',
          hr: 'Minimalna vrijednost',
          pl: 'Wartość minimalna',
          mk: 'Минимална вредност',
          pt: 'Valor mínimo',
          da: 'Minimum værdi',
          nb: 'Minimum verdi',
          sv: 'Minsta värde',
        },
        type: CARD.editor.fields.number.type,
        width: 'calc((100% - 20px) * 0.6)',
        required: false,
        isInGroup: null,
        description: {
          en: 'Enter the minimum value.',
          fr: 'Saisissez la valeur minimum.',
          es: 'Introduzca el valor mínimo.',
          it: 'Inserisci il valore minimo.',
          de: 'Geben Sie den Mindestwert ein.',
          nl: 'Voer de minimale waarde in.',
          hr: 'Unesite minimalnu vrijednost.',
          pl: 'Wprowadź wartość minimalną.',
          mk: 'Внесете ја минималната вредност.',
          pt: 'Digite o valor mínimo.',
          da: 'Indtast minimumværdien.',
          nb: 'Skriv inn minimumverdien.',
          sv: 'Ange det minsta värdet.',
        },
      },
      max_value: {
        name: 'max_value',
        label: {
          en: 'Maximum value',
          fr: 'Valeur maximum',
          es: 'Valor máximo',
          it: 'Valore massimo',
          de: 'Höchstwert',
          nl: 'Maximale waarde',
          hr: 'Maksimalna vrijednost',
          pl: 'Wartość maksymalna',
          mk: 'Максимална вредност',
          pt: 'Valor máximo',
          da: 'Maksimal værdi',
          nb: 'Maksimal verdi',
          sv: 'Högsta värde',
        },
        type: CARD.editor.fields.default.type,
        width: '100%',
        required: false,
        isInGroup: null,
        description: {
          en: 'Enter the maximum value.',
          fr: 'Saisissez la valeur maximum.',
          es: 'Introduzca el valor máximo.',
          it: 'Inserisci il valore massimo.',
          de: 'Geben Sie den Höchstwert ein.',
          nl: 'Voer de maximale waarde in.',
          hr: 'Unesite maksimalnu vrijednost.',
          pl: 'Wprowadź wartość maksymalną.',
          mk: 'Внесете ја максималната вредност.',
          pt: 'Digite o valor máximo.',
          da: 'Indtast maksimumværdien.',
          nb: 'Skriv inn maksimumverdien.',
          sv: 'Ange det högsta värdet.',
        },
      },
      max_value_attribute: {
        name: 'max_value_attribute',
        label: {
          en: 'Attribute (max_value)',
          fr: 'Attribut (max_value)',
          es: 'Atributo (max_value)',
          it: 'Attributo (max_value)',
          de: 'Attribut (max_value)',
          nl: 'Attribuut (max_value)',
          hr: 'Atribut (max_value)',
          pl: 'Atrybut (max_value)',
          mk: 'Атрибут (max_value)',
          pt: 'Atributo (max_value)',
          da: 'Attribut (max_value)',
          nb: 'Attribut (max_value)',
          sv: 'Attribut (max_value)',
        },
        type: CARD.editor.fields.max_value_attribute.type,
        width: '100%',
        required: false,
        isInGroup: CARD.editor.keyMappings.max_value_attribute,
        description: {
          en: 'Select the attribute (max_value).',
          fr: "Sélectionnez l'attribut (max_value).",
          es: 'Seleccione el atributo (max_value).',
          it: "Seleziona l'attributo (max_value).",
          de: 'Wählen Sie das Attribut aus (max_value).',
          nl: 'Selecteer het attribuut (max_value).',
          hr: 'Odaberite atribut (max_value).',
          pl: 'Wybierz atrybut (max_value).',
          mk: 'Изберете го атрибутот (max_value).',
          pt: 'Selecione o atributo (max_value).',
          da: 'Vælg attributet (max_value).',
          nb: 'Velg attributtet (max_value).',
          sv: 'Välj attributet (max_value).',
        },
      },
    },
  },
  interaction: {
    title: {
      label: {
        en: 'Interactions',
        fr: 'Interactions',
        es: 'Interacciones',
        it: 'Interazioni',
        de: 'Interaktionen',
        nl: 'Interactie',
        hr: 'Interakcije',
        pl: 'Interakcje',
        mk: 'Интеракции',
        pt: 'Interações',
        da: 'Interaktioner',
        nb: 'Interaksjoner',
        sv: 'Interaktioner',
      },
      icon: 'mdi:gesture-tap-hold',
    },
    field: {
      tap_action: {
        name: 'tap_action',
        label: {
          en: 'Tap action',
          fr: 'Action au tap',
          es: 'Acción al tocar',
          it: 'Azione al tocco',
          de: 'Tippen Aktion',
          nl: 'Tik actie',
          hr: 'Akcija na dodir',
          pl: 'Akcja dotknięcia',
          mk: 'Акција на допир',
          pt: 'Ação ao toque',
          da: 'Tap handling',
          nb: 'Trykk handling',
          sv: 'Tryckåtgärd',
        },
        type: CARD.editor.fields.tap_action.type,
        width: '100%',
        required: false,
        isInGroup: null,
        description: {
          en: 'Select the action.',
          fr: "Sélectionnez l'action.",
          es: 'Seleccione la acción.',
          it: "Seleziona l'azione.",
          de: 'Wählen Sie die Aktion.',
          nl: 'Selecteer de actie.',
          hr: 'Odaberite akciju.',
          pl: 'Wybierz akcję.',
          mk: 'Изберете ја акцијата.',
          pt: 'Selecione a ação.',
          da: 'Vælg handlingen.',
          nb: 'Velg handlingen.',
          sv: 'Välj åtgärden.',
        },
      },
      navigation_path: {
        name: CARD.editor.keyMappings.navigation_path,
        label: {
          en: 'Navigation Path',
          fr: 'Chemin De Navigation',
          es: 'Ruta De Navegación',
          it: 'Percorso Di Navigazione',
          de: 'Navigationspfad',
          nl: 'Navigatiepad',
          hr: 'Navigacijska Staza',
          pl: 'Ścieżka Nawigacji',
          mk: 'Навигациска Патека',
          pt: 'Caminho De Navegação',
          da: 'Navigationssti',
          nb: 'Navigasjonssti',
          sv: 'Navigeringssökväg',
        },
        type: CARD.editor.fields.navigation_picker.type,
        width: '100%',
        required: false,
        isInGroup: CARD.editor.keyMappings.navigation_path,
        description: {
          en: 'Select Navigation Path',
          fr: 'Sélectionner le chemin de navigation',
          es: 'Seleccionar la ruta de navegación',
          it: 'Selezionare il percorso di navigazione',
          de: 'Navigationspfad auswählen',
          nl: 'Navigatiepad selecteren',
          hr: 'Odaberite navigacijsku stazu',
          pl: 'Wybierz ścieżkę nawigacji',
          mk: 'Изберете навигациска патека',
          pt: 'Selecionar o caminho de navegação',
          da: 'Vælg navigationssti',
          nb: 'Velg navigasjonssti',
          sv: 'Välj navigeringssökväg',
        },
      },
      url_path: {
        name: CARD.editor.keyMappings.url_path,
        label: {
          en: 'URL',
          fr: 'URL',
          es: 'URL',
          it: 'URL',
          de: 'URL',
          nl: 'URL',
          hr: 'URL',
          pl: 'URL',
          mk: 'URL',
          pt: 'URL',
          da: 'URL',
          nb: 'URL',
          sv: 'URL',
        },
        type: CARD.editor.fields.default.type,
        width: '100%',
        required: false,
        isInGroup: CARD.editor.keyMappings.url_path,
        description: {
          en: 'Enter the target (https://example.com/).',
          fr: 'Saisir la cible (https://example.com/).',
          es: 'Introduzca el objetivo (https://example.com/).',
          it: 'Inserisci il target (https://example.com/).',
          de: 'Geben Sie das Ziel (https://example.com/) ein.',
          nl: 'Voer de bestemming in (https://example.com/).',
          hr: 'Unesite odredište (https://example.com/).',
          pl: 'Wprowadź cel (https://example.com/).',
          mk: 'Внесете цел (https://example.com/).',
          pt: 'Digite o destino (https://example.com/).',
          da: 'Indtast målet (https://example.com/).',
          nb: 'Skriv inn målet (https://example.com/).',
          sv: 'Ange målet (https://example.com/).',
        },
      },
    },
  },
  theme: {
    title: {
      label: {
        en: 'Look & Feel',
        fr: 'Aspect visuel et convivialité',
        es: 'Apariencia y funcionamiento',
        it: 'Aspetto e funzionalità',
        de: 'Aussehen und Bedienung',
        nl: 'Uiterlijk en gebruiksgemak',
        hr: 'Izgled i funkcionalnost',
        pl: 'Wygląd i funkcjonalność',
        mk: 'Изглед и функционалност',
        pt: 'Aparência e usabilidade',
        da: 'Udseende og funktionalitet',
        nb: 'Utseende og funksjonalitet',
        sv: 'Utseende och funktion',
      },
      icon: 'mdi:list-box',
    },
    field: {
      toggleIcon: {
        name: 'toggle_icon',
        label: {
          en: 'Icon',
          fr: 'Icône',
          es: 'Icono',
          it: 'Icona',
          de: 'Icon',
          nl: 'Icoon',
          hr: 'Ikona',
          pl: 'Ikona',
          mk: 'Икона',
          pt: 'Ícone',
          da: 'Ikon',
          nb: 'Ikon',
          sv: 'Ikon',
        },
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        required: false,
        isInGroup: null,
      },
      toggleName: {
        name: 'toggle_name',
        label: {
          en: 'Name',
          fr: 'Nom',
          es: 'Nombre',
          it: 'Nome',
          de: 'Name',
          nl: 'Naam',
          hr: 'Ime',
          pl: 'Nazwa',
          mk: 'Име',
          pt: 'Nome',
          da: 'Navn',
          nb: 'Navn',
          sv: 'Namn',
        },
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        required: false,
        isInGroup: null,
      },
      toggleUnit: {
        name: 'toggle_unit',
        label: {
          en: 'Unit',
          fr: 'Unité',
          es: 'Unidad',
          it: 'Unità',
          de: 'Einheit',
          nl: 'Eenheid',
          hr: 'Jedinica',
          pl: 'Jednostka',
          mk: 'Единица',
          pt: 'Unidade',
          da: 'Enhed',
          nb: 'Enhet',
          sv: 'Enhet',
        },
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        required: false,
        isInGroup: null,
      },
      toggleSecondaryInfo: {
        name: 'toggle_secondary_info',
        label: {
          en: 'Info',
          fr: 'Info',
          es: 'Info',
          it: 'Info',
          de: 'Info',
          nl: 'Info',
          hr: 'Info',
          pl: 'Info',
          mk: 'Инфо',
          pt: 'Info',
          da: 'Info',
          nb: 'Info',
          sv: 'Info',
        },
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        required: false,
        isInGroup: null,
      },
      toggleBar: {
        name: 'toggle_progress_bar',
        label: {
          en: 'Bar',
          fr: 'Barre',
          es: 'Barra',
          it: 'Barra',
          de: 'Balken',
          nl: 'Balk',
          hr: 'Traka',
          pl: 'Pasek',
          mk: 'Лента',
          pt: 'Barra',
          da: 'Linje',
          nb: 'Linje',
          sv: 'Fält',
        },
        type: CARD.editor.fields.toggle.type,
        width: '100%',
        required: false,
        isInGroup: null,
      },
      theme: {
        name: 'theme',
        label: {
          en: 'Theme',
          fr: 'Thème',
          es: 'Tema',
          it: 'Tema',
          de: 'Thema',
          nl: 'Thema',
          hr: 'Tema',
          pl: 'Motyw',
          mk: 'Тема',
          pt: 'Tema',
          da: 'Tema',
          nb: 'Tema',
          sv: 'Tema',
        },
        type: CARD.editor.fields.theme.type,
        width: '100%',
        required: false,
        isInGroup: null,
        description: {
          en: 'Select a theme to automatically define the colors and icon.',
          fr: "Sélectionnez un thème pour définir automatiquement les couleurs et l'icône.",
          es: 'Seleccione un tema para definir automáticamente los colores y el icono.',
          it: "Seleziona un tema per definire automaticamente i colori e l'icona.",
          de: 'Wählen Sie ein Thema, um die Farben und das Symbol automatisch festzulegen.',
          nl: 'Selecteer een thema om automatisch de kleuren en het pictogram in te stellen.',
          hr: 'Odaberite temu za automatsko definiranje boja i ikone.',
          pl: 'Wybierz motyw, aby automatycznie zdefiniować kolory i ikonę.',
          mk: 'Изберете тема за автоматско дефинирање на боите и иконата.',
          pt: 'Selecione um tema para definir automaticamente as cores e o ícone.',
          da: 'Vælg et tema for automatisk at definere farver og ikon.',
          nb: 'Velg et tema for automatisk å definere farger og ikoner.',
          sv: 'Välj ett tema för att automatiskt definiera färger och ikoner.',
        },
      },
      bar_size: {
        name: 'bar_size',
        label: {
          en: 'Size',
          fr: 'Taille',
          es: 'Tamaño',
          it: 'Dimensione',
          de: 'Größe',
          nl: 'Grootte',
          hr: 'Veličina',
          pl: 'Rozmiar',
          mk: 'Големина',
          pt: 'Tamanho',
          da: 'Størrelse',
          nb: 'Størrelse',
          sv: 'Storlek',
        },
        type: CARD.editor.fields.bar_size.type,
        width: 'calc((100% - 10px) * 0.5)',
        required: false,
        isInGroup: null,
        description: {
          en: 'Select the bar size',
          fr: 'Sélectionnez la taille de la barre',
          es: 'Seleccione el tamaño de la barra',
          it: 'Seleziona la dimensione della barra',
          de: 'Wählen Sie die Balkengröße',
          nl: 'Selecteer de balkgrootte',
          hr: 'Odaberite veličinu trake',
          pl: 'Wybierz rozmiar paska',
          mk: 'Изберете ја големината на лентата',
          pt: 'Selecione o tamanho da barra',
          da: 'Vælg barstørrelse',
          nb: 'Velg størrelse på baren',
          sv: 'Välj barstorlek',
        },
      },
      bar_color: {
        name: 'bar_color',
        label: {
          en: 'Color for the bar',
          fr: 'Couleur de la barre',
          es: 'Color de la barra',
          it: 'Colore per la barra',
          de: 'Farbe für die Leiste',
          nl: 'Kleur voor de balk',
          hr: 'Boja za traku',
          pl: 'Kolor paska',
          mk: 'Боја за лентата',
          pt: 'Cor para a barra',
          da: 'Farve til baren',
          nb: 'Farge for baren',
          sv: 'Färg för baren',
        },
        type: CARD.editor.fields.color.type,
        width: 'calc((100% - 10px) * 0.5)',
        required: false,
        isInGroup: CARD.editor.keyMappings.theme,
        description: {
          en: 'Select the color for the bar.',
          fr: 'Sélectionnez la couleur de la barre.',
          es: 'Seleccione el color de la barra.',
          it: 'Seleziona il colore per la barra.',
          de: 'Wählen Sie die Farbe für die Leiste.',
          nl: 'Selecteer de kleur voor de balk',
          hr: 'Odaberite boju trake',
          pl: 'Wybierz kolor paska',
          mk: 'Изберете ја бојата за лентата',
          pt: 'Selecione a cor para a barra',
          da: 'Vælg farven til baren',
          nb: 'Velg farge for baren',
          sv: 'Välj färg för baren',
        },
      },
      icon: {
        name: 'icon',
        label: {
          en: 'Icon',
          fr: 'Icône',
          es: 'Icono',
          it: 'Icona',
          de: 'Symbol',
          nl: 'Pictogram',
          hr: 'Ikona',
          pl: 'Ikona',
          mk: 'Икона',
          pt: 'Ícone',
          da: 'Ikon',
          nb: 'Ikon',
          sv: 'Ikon',
        },
        type: CARD.editor.fields.icon.type,
        width: 'calc((100% - 10px) * 0.5)',
        required: false,
        isInGroup: null, //CARD.editor.keyMappings.theme
        description: {
          en: 'Select an icon for the entity.',
          fr: "Sélectionnez une icône pour l'entité.",
          es: 'Seleccione un icono para la entidad.',
          it: "Seleziona un'icona per l'entità.",
          de: 'Wählen Sie ein Symbol für die Entität.',
          nl: 'Selecteer een pictogram voor de entiteit',
          hr: 'Odaberite ikonu za entitetu',
          pl: 'Wybierz ikonę dla encji',
          mk: 'Изберете икона за ентитетот',
          pt: 'Selecione um ícone para a entidade',
          da: 'Vælg et ikon for enheden',
          nb: 'Velg et ikon for enheten',
          sv: 'Välj ett ikon för enheten',
        },
      },
      color: {
        name: 'color',
        label: {
          en: 'Primary color',
          fr: "Couleur de l'icône",
          es: 'Color del icono',
          it: "Colore dell'icona",
          de: 'Primärfarbe',
          nl: 'Primaire kleur',
          hr: 'Primarna boja',
          pl: 'Kolor podstawowy',
          mk: 'Примарна боја',
          pt: 'Cor primária',
          da: 'Primærfarve',
          nb: 'Primærfarge',
          sv: 'Primärfärg',
        },
        type: CARD.editor.fields.color.type,
        width: 'calc((100% - 10px) * 0.5)',
        required: false,
        isInGroup: CARD.editor.keyMappings.theme,
        description: {
          en: 'Select the primary color for the icon.',
          fr: "Sélectionnez la couleur de l'icône.",
          es: 'Seleccione el color principal del icono.',
          it: "Seleziona il colore principale per l'icona.",
          de: 'Wählen Sie die Primärfarbe für das Symbol.',
          nl: 'Selecteer de primaire kleur voor het pictogram',
          hr: 'Odaberite primarnu boju za ikonu',
          pl: 'Wybierz główny kolor ikony',
          mk: 'Изберете ја примарната боја за иконата',
          pt: 'Selecione a cor primária para o ícone',
          da: 'Vælg primærfarven for ikonet',
          nb: 'Velg primærfargen for ikonet',
          sv: 'Välj primärfärgen för ikonen',
        },
      },
      layout: {
        name: 'layout',
        label: {
          en: 'Layout',
          fr: 'Disposition',
          es: 'Disposición',
          it: 'Layout',
          de: 'Layout',
          nl: 'Indeling',
          hr: 'Izgled',
          pl: 'Układ',
          mk: 'Распоред',
          pt: 'Layout',
          da: 'Layout',
          nb: 'Layout',
          sv: 'Layout',
        },
        type: CARD.editor.fields.layout.type,
        width: '100%',
        required: false,
        isInGroup: null,
        description: {
          en: 'Select the layout.',
          fr: 'Sélectionnez la disposition.',
          es: 'Seleccione la disposición.',
          it: 'Seleziona il layout.',
          de: 'Wählen Sie das Layout.',
          nl: 'Selecteer de indeling.',
          hr: 'Odaberite izgled.',
          pl: 'Wybierz układ.',
          mk: 'Изберете го распоредот.',
          pt: 'Selecione o layout.',
          da: 'Vælg layoutet.',
          nb: 'Velg oppsettet.',
          sv: 'Välj layouten.',
        },
      },
    },
  },
};

const FIELD_OPTIONS = {
  theme: [
    {
      value: '',
      label: { en: '', fr: '', es: '', it: '', de: '', nl: '', hr: '', pl: '', mk: '', pt: '', da: '', nb: '', sv: '' },
      icon: 'mdi:cancel',
    },
    {
      value: 'optimal_when_low',
      label: {
        en: 'Optimal when Low (CPU, RAM,...)',
        fr: "Optimal quand c'est bas (CPU, RAM,...)",
        es: 'Óptimo cuando es bajo (CPU, RAM,...)',
        it: 'Ottimale quando è basso (CPU, RAM,...)',
        de: 'Optimal bei niedrig (CPU, RAM,...)',
        nl: 'Optimaal wanneer laag (CPU, RAM,...)',
        hr: 'Optimalno kada je nisko (CPU, RAM,...)',
        pl: 'Optymalny, gdy niskie (CPU, RAM,...)',
        mk: 'Оптимално кога е ниско(CPU, RAM,...)',
        pt: 'Ótimo quando é baixo (CPU, RAM,...)',
        da: 'Optimal når lavt (CPU, RAM,...)',
        nb: 'Optimal når lavt (CPU, RAM,...)',
        sv: 'Optimal när det är lågt (CPU, RAM,...)',
      },
      icon: 'mdi:arrow-collapse-down',
    },
    {
      value: 'optimal_when_high',
      label: {
        en: 'Optimal when High (Battery...)',
        fr: "Optimal quand c'est élevé (Batterie...)",
        es: 'Óptimo cuando es alto (Batería...)',
        it: 'Ottimale quando è alto (Batteria...)',
        de: 'Optimal bei hoch (Batterie...)',
        nl: 'Optimaal wanneer hoog (Batterij...)',
        hr: 'Optimalno kada je visoko (Baterija...)',
        pl: 'Optymalny, gdy wysokie (Bateria...)',
        mk: 'Оптимално кога е високо (Батерија...)',
        pt: 'Ótimo quando é alto (Bateria...)',
        da: 'Optimal når højt (Batteri...)',
        nb: 'Optimal når høyt (Batteri...)',
        sv: 'Optimal när det är högt (Batteri...)',
      },
      icon: 'mdi:arrow-collapse-up',
    },
    {
      value: 'light',
      label: {
        en: 'Light',
        fr: 'Lumière',
        es: 'Luz',
        it: 'Luce',
        de: 'Licht',
        nl: 'Licht',
        hr: 'Svjetlo',
        pl: 'Światło',
        mk: 'Светлина',
        pt: 'Luz',
        da: 'Lys',
        nb: 'Lys',
        sv: 'Ljus',
      },
      icon: 'mdi:lightbulb',
    },
    {
      value: 'temperature',
      label: {
        en: 'Temperature',
        fr: 'Température',
        es: 'Temperatura',
        it: 'Temperatura',
        de: 'Temperatur',
        nl: 'Temperatuur',
        hr: 'Temperatura',
        pl: 'Temperatura',
        mk: 'Температура',
        pt: 'Temperatura',
        da: 'Temperatur',
        nb: 'Temperatur',
        sv: 'Temperatur',
      },
      icon: 'mdi:thermometer',
    },
    {
      value: 'humidity',
      label: {
        en: 'Humidity',
        fr: 'Humidité',
        es: 'Humedad',
        it: 'Umidità',
        de: 'Feuchtigkeit',
        nl: 'Vochtigheid',
        hr: 'Vlažnost',
        pl: 'Wilgotność',
        mk: 'Влажност',
        pt: 'Humidade',
        da: 'Fugtighed',
        nb: 'Fuktighet',
        sv: 'Luftfuktighet',
      },
      icon: 'mdi:water-percent',
    },
    {
      value: 'pm25',
      label: {
        en: 'PM2.5',
        fr: 'PM2.5',
        es: 'PM2.5',
        it: 'PM2.5',
        de: 'PM2.5',
        nl: 'PM2.5',
        hr: 'PM2.5',
        pl: 'PM2.5',
        mk: 'PM2.5',
        pt: 'PM2.5',
        da: 'PM2.5',
        nb: 'PM2.5',
        sv: 'PM2.5',
      },
      icon: 'mdi:air-filter',
    },
    {
      value: 'voc',
      label: {
        en: 'VOC',
        fr: 'VOC',
        es: 'VOC',
        it: 'VOC',
        de: 'VOC',
        nl: 'VOC',
        hr: 'VOC',
        pl: 'VOC',
        mk: 'VOC',
        pt: 'VOC',
        da: 'VOC',
        nb: 'VOC',
        sv: 'VOC',
      },
      icon: 'mdi:air-filter',
    },
  ],
  color: [
    {
      value: '',
      label: {
        en: '',
        fr: '',
        es: '',
        it: '',
        de: '',
        nl: '',
        hr: '',
        pl: '',
        mk: '',
        pt: '',
        da: '',
        nb: '',
        sv: '',
      },
    },
    {
      value: 'var(--state-icon-color)',
      label: {
        en: 'Default',
        fr: 'Défaut',
        es: 'Predeterminado',
        it: 'Predefinito',
        de: 'Standard',
        nl: 'Standaard',
        hr: 'Zadano',
        pl: 'Domyślny',
        mk: 'Стандарден',
        pt: 'Padrão',
        da: 'Standard',
        nb: 'Standard',
        sv: 'Standard',
      },
    },
    {
      value: 'var(--accent-color)',
      label: {
        en: 'Accent',
        fr: 'Accent',
        es: 'Acento',
        it: 'Accentuato',
        de: 'Akzent',
        nl: 'Accent',
        hr: 'Akcenat',
        pl: 'Akcent',
        mk: 'Акцент',
        pt: 'Acente',
        da: 'Accent',
        nb: 'Akent',
        sv: 'Accent',
      },
    },
    {
      value: 'var(--info-color)',
      label: {
        en: 'Info',
        fr: 'Info',
        es: 'Información',
        it: 'Info',
        de: 'Info',
        nl: 'Info',
        hr: 'Info',
        pl: 'Info',
        mk: 'Инфо',
        pt: 'Info',
        da: 'Info',
        nb: 'Info',
        sv: 'Info',
      },
    },
    {
      value: 'var(--success-color)',
      label: {
        en: 'Success',
        fr: 'Succès',
        es: 'Éxito',
        it: 'Successo',
        de: 'Erfolg',
        nl: 'Succes',
        hr: 'Uspjeh',
        pl: 'Sukces',
        mk: 'Успех',
        pt: 'Sucesso',
        da: 'Succes',
        nb: 'Suksess',
        sv: 'Framgång',
      },
    },
    {
      value: 'var(--disabled-color)',
      label: {
        en: 'Disable',
        fr: 'Désactivé',
        es: 'Deshabilitado',
        it: 'Disabilitato',
        de: 'Deaktiviert',
        nl: 'Deactiveren',
        hr: 'Onemogući',
        pl: 'Wyłącz',
        mk: 'Оневозможи',
        pt: 'Desativar',
        da: 'Deaktiver',
        nb: 'Deaktiver',
        sv: 'Inaktivera',
      },
    },
    {
      value: 'var(--red-color)',
      label: {
        en: 'Red',
        fr: 'Rouge',
        es: 'Rojo',
        it: 'Rosso',
        de: 'Rot',
        nl: 'Rood',
        hr: 'Crvena',
        pl: 'Czerwony',
        mk: 'Црвена',
        pt: 'Vermelho',
        da: 'Rød',
        nb: 'Rød',
        sv: 'Röd',
      },
    },
    {
      value: 'var(--pink-color)',
      label: {
        en: 'Pink',
        fr: 'Rose',
        es: 'Rosa',
        it: 'Rosa',
        de: 'Pink',
        nl: 'Roze',
        hr: 'Roza',
        pl: 'Różowy',
        mk: 'Розова',
        pt: 'Rosa',
        da: 'Pink',
        nb: 'Rosa',
        sv: 'Rosa',
      },
    },
    {
      value: 'var(--purple-color)',
      label: {
        en: 'Purple',
        fr: 'Violet',
        es: 'Púrpura',
        it: 'Viola',
        de: 'Lila',
        nl: 'Paars',
        hr: 'Ljubičasta',
        pl: 'Fioletowy',
        mk: 'Пурпурна',
        pt: 'Roxo',
        da: 'Lilla',
        nb: 'Lilla',
        sv: 'Lila',
      },
    },
    {
      value: 'var(--deep-purple-color)',
      label: {
        en: 'Deep purple',
        fr: 'Violet foncé',
        es: 'Púrpura profundo',
        it: 'Viola scuro',
        de: 'Dunkellila',
        nl: 'Diep paars',
        hr: 'Tamno ljubičasta',
        pl: 'Ciemnofioletowy',
        mk: 'Темно виолетова',
        pt: 'Roxo escuro',
        da: 'Mørk lilla',
        nb: 'Mørk lilla',
        sv: 'Djuplila',
      },
    },
    {
      value: 'var(--indigo-color)',
      label: {
        en: 'Indigo',
        fr: 'Indigo',
        es: 'Índigo',
        it: 'Indaco',
        de: 'Indigo',
        nl: 'Indigo',
        hr: 'Indigo',
        pl: 'Indygo',
        mk: 'Индиго',
        pt: 'Índigo',
        da: 'Indigo',
        nb: 'Indigo',
        sv: 'Indigo',
      },
    },
    {
      value: 'var(--blue-color)',
      label: {
        en: 'Blue',
        fr: 'Bleu',
        es: 'Azul',
        it: 'Blu',
        de: 'Blau',
        nl: 'Blauw',
        hr: 'Plava',
        pl: 'Niebieski',
        mk: 'Сина',
        pt: 'Azul',
        da: 'Blå',
        nb: 'Blå',
        sv: 'Blå',
      },
    },
    {
      value: 'var(--light-blue-color)',
      label: {
        en: 'Light blue',
        fr: 'Bleu clair',
        es: 'Azul claro',
        it: 'Blu chiaro',
        de: 'Hellblau',
        nl: 'Lichtblauw',
        hr: 'Svijetloplava',
        pl: 'Jasnoniebieski',
        mk: 'Светло сина',
        pt: 'Azul claro',
        da: 'Lyseblå',
        nb: 'Lyseblå',
        sv: 'Ljusblå',
      },
    },
    {
      value: 'var(--cyan-color)',
      label: {
        en: 'Cyan',
        fr: 'Cyan',
        es: 'Cian',
        it: 'Ciano',
        de: 'Cyan',
        nl: 'Cyaan',
        hr: 'Cijan',
        pl: 'Cyjan',
        mk: 'Цијан',
        pt: 'Ciano',
        da: 'Cyan',
        nb: 'Cyan',
        sv: 'Cyan',
      },
    },
    {
      value: 'var(--teal-color)',
      label: {
        en: 'Teal',
        fr: 'Bleu sarcelle',
        es: 'Verde azulado',
        it: 'Verde acqua',
        de: 'Blaugrün',
        nl: 'Blauwgroen',
        hr: 'Tirkizna',
        pl: 'Morski',
        mk: 'Сината зелена',
        pt: 'Verde-azulado',
        da: 'Blågrøn',
        nb: 'Blågrønn',
        sv: 'Blågrön',
      },
    },
    {
      value: 'var(--green-color)',
      label: {
        en: 'Green',
        fr: 'Vert',
        es: 'Verde',
        it: 'Verde',
        de: 'Grün',
        nl: 'Groen',
        hr: 'Zelena',
        pl: 'Zielony',
        mk: 'Зелена',
        pt: 'Verde',
        da: 'Grøn',
        nb: 'Grønn',
        sv: 'Grön',
      },
    },
    {
      value: 'var(--light-green-color)',
      label: {
        en: 'Light green',
        fr: 'Vert clair',
        es: 'Verde claro',
        it: 'Verde chiaro',
        de: 'Hellgrün',
        nl: 'Lichtgroen',
        hr: 'Svijetlozelena',
        pl: 'Jasnozielony',
        mk: 'Светло зелена',
        pt: 'Verde claro',
        da: 'Lysegrøn',
        nb: 'Lysegrønn',
        sv: 'Ljusgrön',
      },
    },
    {
      value: 'var(--lime-color)',
      label: {
        en: 'Lime',
        fr: 'Citron vert',
        es: 'Lima',
        it: 'Lime',
        de: 'Limette',
        nl: 'Limoen',
        hr: 'Limeta',
        pl: 'Limonka',
        mk: 'Лајм',
        pt: 'Lima',
        da: 'Lime',
        nb: 'Lime',
        sv: 'Lime',
      },
    },
    {
      value: 'var(--yellow-color)',
      label: {
        en: 'Yellow',
        fr: 'Jaune',
        es: 'Amarillo',
        it: 'Giallo',
        de: 'Gelb',
        nl: 'Geel',
        hr: 'Žuta',
        pl: 'Żółty',
        mk: 'Жолта',
        pt: 'Amarelo',
        da: 'Gul',
        nb: 'Gul',
        sv: 'Gul',
      },
    },
    {
      value: 'var(--amber-color)',
      label: {
        en: 'Amber',
        fr: 'Ambre',
        es: 'Ámbar',
        it: 'Ambra',
        de: 'Bernstein',
        nl: 'Amber',
        hr: 'Jantar',
        pl: 'Bursztyn',
        mk: 'Килибар',
        pt: 'Âmbar',
        da: 'Ravgul',
        nb: 'Gult',
        sv: 'Bärnsten',
      },
    },
    {
      value: 'var(--orange-color)',
      label: {
        en: 'Orange',
        fr: 'Orange',
        es: 'Naranja',
        it: 'Arancione',
        de: 'Orange',
        nl: 'Oranje',
        hr: 'Narančasta',
        pl: 'Pomarańczowy',
        mk: 'Портокалова',
        pt: 'Laranja',
        da: 'Orange',
        nb: 'Oransje',
        sv: 'Orange',
      },
    },
    {
      value: 'var(--deep-orange-color)',
      label: {
        en: 'Deep orange',
        fr: 'Orange foncé',
        es: 'Naranja oscuro',
        it: 'Arancione scuro',
        de: 'Dunkelorange',
        nl: 'Dieporanje',
        hr: 'Tamnonarančasta',
        pl: 'Ciemnopomarańczowy',
        mk: 'Темно портокалова',
        pt: 'Laranja escuro',
        da: 'Mørk orange',
        nb: 'Mørk oransje',
        sv: 'Mörkorange',
      },
    },
    {
      value: 'var(--brown-color)',
      label: {
        en: 'Brown',
        fr: 'Marron',
        es: 'Marrón',
        it: 'Marrone',
        de: 'Braun',
        nl: 'Bruin',
        hr: 'Smeđa',
        pl: 'Brązowy',
        mk: 'Кафеава',
        pt: 'Marrom',
        da: 'Brun',
        nb: 'Brun',
        sv: 'Brun',
      },
    },
    {
      value: 'var(--light-grey-color)',
      label: {
        en: 'Light grey',
        fr: 'Gris clair',
        es: 'Gris claro',
        it: 'Grigio chiaro',
        de: 'Hellgrau',
        nl: 'Lichtgrijs',
        hr: 'Svijetlosiva',
        pl: 'Jasnoszary',
        mk: 'Светло сива',
        pt: 'Cinza claro',
        da: 'Lysegrå',
        nb: 'Lysegrå',
        sv: 'Ljusgrå',
      },
    },
    {
      value: 'var(--grey-color)',
      label: {
        en: 'Grey',
        fr: 'Gris',
        es: 'Gris',
        it: 'Grigio',
        de: 'Grau',
        nl: 'Grijs',
        hr: 'Siva',
        pl: 'Szary',
        mk: 'Сива',
        pt: 'Cinza',
        da: 'Grå',
        nb: 'Grå',
        sv: 'Grå',
      },
    },
    {
      value: 'var(--dark-grey-color)',
      label: {
        en: 'Dark grey',
        fr: 'Gris foncé',
        es: 'Gris oscuro',
        it: 'Grigio scuro',
        de: 'Dunkelgrau',
        nl: 'Donkergrijs',
        hr: 'Tamnosiva',
        pl: 'Ciemnoszary',
        mk: 'Темно сива',
        pt: 'Cinza escuro',
        da: 'Mørkegrå',
        nb: 'Mørkegrå',
        sv: 'Mörkgrå',
      },
    },
    {
      value: 'var(--blue-grey-color)',
      label: {
        en: 'Blue grey',
        fr: 'Gris bleuté',
        es: 'Gris azulado',
        it: 'Grigio bluastro',
        de: 'Blaugrau',
        nl: 'Blauwgrijs',
        hr: 'Plavosiva',
        pl: 'Niebieskoszary',
        mk: 'Сино сива',
        pt: 'Cinza azulado',
        da: 'Blågrå',
        nb: 'Blågrå',
        sv: 'Blågrå',
      },
    },
    {
      value: 'var(--black-color)',
      label: {
        en: 'Black',
        fr: 'Noir',
        es: 'Negro',
        it: 'Nero',
        de: 'Schwarz',
        nl: 'Zwart',
        hr: 'Crna',
        pl: 'Czarny',
        mk: 'Црна',
        pt: 'Preto',
        da: 'Sort',
        nb: 'Svart',
        sv: 'Svart',
      },
    },
    {
      value: 'var(--white-color)',
      label: {
        en: 'White',
        fr: 'Blanc',
        es: 'Blanco',
        it: 'Bianco',
        de: 'Weiß',
        nl: 'Wit',
        hr: 'Bijela',
        pl: 'Biały',
        mk: 'Бела',
        pt: 'Branco',
        da: 'Hvid',
        nb: 'Hvit',
        sv: 'Vit',
      },
    },
  ],
  bar_size: [
    {
      value: CARD.style.bar.sizeOptions.small.label,
      label: {
        en: 'Small',
        fr: 'Petite',
        es: 'Pequeña',
        it: 'Piccola',
        de: 'Klein',
        nl: 'Klein',
        hr: 'Mali',
        pl: 'Mały',
        mk: 'Мало',
        pt: 'Pequeno',
        da: 'Lille',
        nb: 'Liten',
        sv: 'Liten',
      },
      icon: CARD.style.bar.sizeOptions.small.mdi,
    },
    {
      value: CARD.style.bar.sizeOptions.medium.label,
      label: {
        en: 'Medium',
        fr: 'Moyenne',
        es: 'Media',
        it: 'Media',
        de: 'Mittel',
        nl: 'Middel',
        hr: 'Srednje',
        pl: 'Średni',
        mk: 'Средно',
        pt: 'Médio',
        da: 'Mellem',
        nb: 'Middels',
        sv: 'Medium',
      },
      icon: CARD.style.bar.sizeOptions.medium.mdi,
    },
    {
      value: CARD.style.bar.sizeOptions.large.label,
      label: {
        en: 'Large',
        fr: 'Grande',
        es: 'Grande',
        it: 'Grande',
        de: 'Groß',
        nl: 'Groot',
        hr: 'Veliko',
        pl: 'Duży',
        mk: 'Големо',
        pt: 'Grande',
        da: 'Stor',
        nb: 'Stor',
        sv: 'Stor',
      },
      icon: CARD.style.bar.sizeOptions.large.mdi,
    },
  ],
  layout: [
    {
      value: CARD.layout.orientations.horizontal.label,
      label: {
        en: 'Horizontal (default)',
        fr: 'Horizontal (par défaut)',
        es: 'Horizontal (predeterminado)',
        it: 'Orizzontale (predefinito)',
        de: 'Horizontal (Standard)',
        nl: 'Horizontaal (standaard)',
        hr: 'Horizontalno (zadano)',
        pl: 'Poziomo (domyślnie)',
        mk: 'Хоризонтално (стандардно)',
        pt: 'Horizontal (padrão)',
        da: 'Horisontal (standard)',
        nb: 'Horisontal (standard)',
        sv: 'Horisontell (standard)',
      },
      icon: CARD.layout.orientations.horizontal.mdi,
    },
    {
      value: CARD.layout.orientations.vertical.label,
      label: {
        en: 'Vertical',
        fr: 'Vertical',
        es: 'Vertical',
        it: 'Verticale',
        de: 'Vertikal',
        nl: 'Verticaal',
        hr: 'Vertikalno',
        pl: 'Pionowy',
        mk: 'Вертикално',
        pt: 'Vertical',
        da: 'Vertikal',
        nb: 'Vertikal',
        sv: 'Vertikal',
      },
      icon: CARD.layout.orientations.vertical.mdi,
    },
  ],
  tap_action: [
    {
      value: CARD.interactions.tap_action.default,
      label: {
        en: 'Default',
        fr: 'Par défaut',
        es: 'Predeterminado',
        it: 'Predefinito',
        de: 'Standard',
        nl: 'Standaard',
        hr: 'Zadano',
        pl: 'Domyślnie',
        mk: 'стандардно',
        pt: 'Padrão',
        da: 'Standard',
        nb: 'Standard',
        sv: 'Standard',
      },
    },
    {
      value: CARD.interactions.tap_action.moreInfo.action,
      label: {
        en: 'More info',
        fr: "Plus d'infos",
        es: 'Más información',
        it: 'Più informazioni',
        de: 'Mehr Infos',
        nl: 'Meer info',
        hr: 'Više informacija',
        pl: 'Więcej informacji',
        mk: 'Повеќе информации',
        pt: 'Mais informações',
        da: 'Mere info',
        nb: 'Mer info',
        sv: 'Mer info',
      },
    },
    {
      value: CARD.interactions.tap_action.navigate.action,
      label: {
        en: 'Navigate to...',
        fr: 'Naviguer vers...',
        es: 'Navegar a...',
        it: 'Naviga a...',
        de: 'Zu navigieren...',
        nl: 'Navigeer naar...',
        hr: 'Navigiraj na...',
        pl: 'Nawiguj do...',
        mk: 'Навигирај до...',
        pt: 'Navegar para...',
        da: 'Naviger til...',
        nb: 'Naviger til...',
        sv: 'Navigera till...',
      },
    },
    {
      value: CARD.interactions.tap_action.url.action,
      label: {
        en: 'URL',
        fr: 'URL',
        es: 'URL',
        it: 'URL',
        de: 'URL',
        nl: 'URL',
        hr: 'URL',
        pl: 'URL',
        mk: 'URL',
        pt: 'URL',
        da: 'URL',
        nb: 'URL',
        sv: 'URL',
      },
    },
    {
      value: CARD.interactions.tap_action.none.action,
      label: {
        en: 'No action',
        fr: 'Aucune action',
        es: 'Sin acción',
        it: 'Nessuna azione',
        de: 'Keine Aktion',
        nl: 'Geen actie',
        hr: 'Nema akcije',
        pl: 'Brak akcji',
        mk: 'Нема акција',
        pt: 'Sem ação',
        da: 'Ingen handling',
        nb: 'Ingen handling',
        sv: 'Ingen åtgärd',
      },
    },
  ],
};

const ATTRIBUTE_MAPPING = {
  cover: { label: 'cover', attribute: 'current_position' },
  light: { label: 'light', attribute: 'brightness' },
  fan: { label: 'fan', attribute: 'percentage' },
  climate: { label: 'climate', attribute: null },
  humidifier: { label: 'humidifier', attribute: null },
  media_player: { label: 'media_player', attribute: null },
  vacuum: { label: 'vacuum', attribute: null },
  device_tracker: { label: 'device_tracker', attribute: null },
  weather: { label: 'weather', attribute: null },
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
            <${CARD.htmlStructure.elements.name.element} class="${CARD.htmlStructure.elements.name.class}"></${CARD.htmlStructure.elements.name.element}>
            <${CARD.htmlStructure.elements.secondaryInfo.element} class="${CARD.htmlStructure.elements.secondaryInfo.class}">
                <${CARD.htmlStructure.elements.percentage.element} class="${CARD.htmlStructure.elements.percentage.class}"></${CARD.htmlStructure.elements.percentage.element}>
                <${CARD.htmlStructure.elements.progressBar.container.element} class="${CARD.htmlStructure.elements.progressBar.container.class}">
                    <${CARD.htmlStructure.elements.progressBar.bar.element} class="${CARD.htmlStructure.elements.progressBar.bar.class}">
                        <${CARD.htmlStructure.elements.progressBar.inner.element} class="${CARD.htmlStructure.elements.progressBar.inner.class}"></${CARD.htmlStructure.elements.progressBar.inner.element}>
                    </${CARD.htmlStructure.elements.progressBar.bar.element}>
                </${CARD.htmlStructure.elements.progressBar.container.element}>
            </${CARD.htmlStructure.elements.secondaryInfo.element}>
        </${CARD.htmlStructure.sections.right.element}>
    </${CARD.htmlStructure.sections.container.element}>
    <!-- HA Alert -->
    <${CARD.htmlStructure.alert.container.element}>
        <${CARD.htmlStructure.alert.icon.element} class="${CARD.htmlStructure.alert.icon.class}"></${CARD.htmlStructure.alert.icon.element}>
        <${CARD.htmlStructure.alert.message.element} class="${CARD.htmlStructure.alert.message.class}"></${CARD.htmlStructure.alert.message.element}>
    </${CARD.htmlStructure.alert.container.element}>
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
    }

    .${CARD.style.dynamic.clickable} {
        cursor: pointer;
    }

    .${CARD.style.dynamic.clickable}:hover {
        background-color: color-mix(in srgb, var(--card-background-color) 96%, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) 4%);
    }

    .${CARD.style.dynamic.clickable}:active {
        background-color: color-mix(in srgb, var(--card-background-color) 85%, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}) 15%);
        transition: background-color 0.5s ease;
    }

    /* main container */
    .${CARD.htmlStructure.sections.container.class},
    ${CARD.htmlStructure.alert.container.element} {
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

    .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.container.class}, .${CARD.layout.orientations.vertical.label} ${CARD.htmlStructure.alert.container.element} {
        min-height: ${CARD.layout.orientations.vertical.minHeight};
        flex-direction: column;
    }
    .${CARD.layout.orientations.horizontal.label} .${CARD.htmlStructure.sections.container.class}, .${CARD.layout.orientations.horizontal.label} ${CARD.htmlStructure.alert.container.element} {
        min-height: ${CARD.layout.orientations.horizontal.minHeight};
        flex-direction: row;
    }

    /* .left: icon & shape */
    .${CARD.htmlStructure.sections.left.class}, .${CARD.htmlStructure.alert.icon.class} {
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
        opacity: 0.2;
    }

    .${CARD.htmlStructure.elements.icon.class} {
        position: relative;
        z-index: 1;
        width: 24px;
        height: 24px;
        color: var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default});
    }

    /* .right: name & percentage */
    .${CARD.htmlStructure.sections.right.class},
    .${CARD.htmlStructure.alert.message.class} {
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

    .${CARD.htmlStructure.elements.name.class} {
        width: 100%;
        min-width: 0;
        height: 20px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        letter-spacing: 0.1px;
        text-align: left;

        color: var(--primary-text-color);
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

    .${CARD.htmlStructure.elements.percentage.class} {
        display: flex;
        align-items: center;
        height: 16px;
        min-width: 45px;
        text-align: left;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        letter-spacing: 0.4px;
        color: var(--primary-text-color);
    }

    .${CARD.style.dynamic.secondaryInfoError.class} .${CARD.htmlStructure.elements.percentage.class} {
        display: inline-block; /* Change de flex à inline-block */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
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
        background-color: var(--divider-color);
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

    .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.name.class} {
        text-align: center;
    }

    .${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.name.class} {
        height: 18px;
    }

    .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.percentage.class} {
        align-items: center;
        justify-content: center;
    }

    .${CARD.style.bar.sizeOptions.small.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.percentage.class} {
        margin-bottom: 1px;
    }

    .${CARD.style.bar.sizeOptions.medium.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.percentage.class} {
        height: 15px;
        font-size: 0.8em;
    }

    .${CARD.style.bar.sizeOptions.large.label} .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.percentage.class} {
        height: 13px;
        font-size: 0.8em;
    }

    ${CARD.htmlStructure.alert.container.element} {
        display: none;
        position: absolute;
        z-index: 3;
        background-color: color-mix(in srgb, var(--card-background-color) 80%, var(--state-icon-color) 20%);
        border-radius: var(ha-card-border-radius);
        margin: 0;
    }

    .${CARD.style.dynamic.show}-${CARD.htmlStructure.alert.container.element} ${CARD.htmlStructure.alert.container.element}{
        display: flex;
    }

    .${CARD.htmlStructure.alert.icon.class} {
        color: ${CARD.style.icon.alert.color};
        margin-left: 10px;
    }

    .${CARD.htmlStructure.alert.message.class} {
        margin-right: 8px;
        letter-spacing: 0.1px;
    }

    .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.alert.icon.class} {
      margin-top: 10px;
      margin-left: 0px;
      width: auto;
      height: auto;
    }
    .${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.alert.message.class} {
      margin: 0px;
      padding: 0px 10px;
      width: auto;
      height: auto;
      display: flex;
      justify-content: flex-start;
    }

    .${CARD.editor.fields.container.class} {
        display: flex;
        flex-direction: column;
        gap: 25px;
        padding-bottom: 150px;
    }
    .${CARD.editor.fields.fieldContainer.class} {
        display: block;
        height: 73px;
    }

    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.attribute} .${CARD.editor.keyMappings.attribute},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.max_value_attribute} .${CARD.editor.keyMappings.max_value_attribute},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.navigateTo} .${CARD.editor.keyMappings.navigateTo},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.url_path} .${CARD.editor.keyMappings.url_path},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.navigation_path} .${CARD.editor.keyMappings.navigation_path},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.theme} .${CARD.editor.keyMappings.theme} {
        display: none;
    }

    .${CARD.editor.fields.fieldDescription.class} {
        width: 90%;
        font-size: 12px;
        color: var(--secondary-text-color);
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

    .${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.container.class} {
        display: flex;
    }

    .${CARD.htmlStructure.elements.badge.container.class} .${CARD.htmlStructure.elements.badge.icon.class} {
        height: 12px;
        width: 12px;
        display: flex; /* h/w ratio */
        align-items: center;
        justify-content: center;
        color: var(${CARD.style.dynamic.badge.color.var}, ${CARD.style.dynamic.badge.color.default});
    }

    .${CARD.style.dynamic.hiddenComponent.icon.class} .${CARD.htmlStructure.sections.left.class},
    .${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.elements.name.class},
    .${CARD.style.dynamic.hiddenComponent.shape.class} .${CARD.htmlStructure.elements.shape.class},
    .${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.elements.percentage.class} {
        display: none;
    }

    .${CARD.style.dynamic.hiddenComponent.icon.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.sections.left.class},
    .${CARD.style.dynamic.hiddenComponent.name.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.name.class},
    .${CARD.style.dynamic.hiddenComponent.shape.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.shape.class},
    .${CARD.style.dynamic.hiddenComponent.progress_bar.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.progressBar.bar.class},
    .${CARD.style.dynamic.hiddenComponent.secondary_info.class}.${CARD.layout.orientations.vertical.label} .${CARD.htmlStructure.elements.percentage.class} {
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
        flex-direction: row; /* Pour espacer les éléments verticalement */
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 10px;
        padding: 0px 18px;
        background-color: transparent;
        max-height: 0;
        transition:
            max-height 0.2s cubic-bezier(0.33, 0, 0.2, 1),
            padding 0.4s cubic-bezier(0.33, 0, 0.2, 1);
        overflow: hidden;
    }

    .accordion.expanded .${CARD.editor.fields.accordion.content.class} {
        max-height: 1000px;
        overflow: visible;
        padding-top: 30px;
        padding-bottom: 30px;
    }
    .${CARD.editor.fields.accordion.content.class} > * {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .${CARD.editor.fields.accordion.content.class} > * {
        opacity: 1;
    }
    .${CARD.editor.fields.colorDot.class} {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-right: 8px;
    }
    ha-select {
      --mdc-menu-max-height: 250px; /* Définit la hauteur maximale */
    }
`;

/******************************************************************************************
 *  Debug
 */
function debugLog(message, variable) {
  if (CARD.config.debug) {
    if (variable !== undefined) {
      console.debug(message, variable);
    } else {
      console.debug(message);
    }
  }
}

/**
 * Helper class for managing numeric values.
 * This class validates and stor a numeric value.
 *
 * @class ValueHelper
 */
class ValueHelper {
  #_value = null;
  #_isValid = false;

  constructor(initialValue = null) {
    if (initialValue !== null) {
      this.value = initialValue;
    }
  }

  /******************************************************************************************
   * Getter/Setter
   */
  set value(newValue) {
    this.#_isValid = this.#validate(newValue);
    this.#_value = this.#_isValid ? newValue : null;
  }

  get value() {
    return this.#_value;
  }

  get isValid() {
    return this.#_isValid;
  }

  /******************************************************************************************
   * Validates if a value is a valid float.
   */
  #validate(value) {
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

  /******************************************************************************************
   * Getter/Setter
   */
  set value(newValue) {
    this.#isValid = this.#validate(newValue);
    this.#value = this.#isValid ? newValue : null;
  }

  get value() {
    return this.#value;
  }

  get isValid() {
    return this.#isValid;
  }

  /******************************************************************************************
   * Validates if a value is a valid non-negative integer.
   *
   * @param {number} value - The value to validate.
   * @returns {boolean} True if the value is a valid non-negative integer, false otherwise.
   */
  #validate(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0 && Number.isInteger(value);
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

  /******************************************************************************************
   * Getter/Setter
   */
  set value(newValue) {
    this.#value = newValue ?? CARD.config.unit.default;
  }
  get value() {
    return this.#isDisabled ? '' : this.#value;
  }
  set isDisabled(disabled) {
    this.#isDisabled = disabled === true;
  }
  get isDisabled() {
    return this.#isDisabled;
  }
  get isTimerUnit() {
    return this.#value.trim().toLowerCase() === CARD.config.unit.timer;
  }
  get isFlexTimerUnit() {
    return this.#value.trim().toLowerCase() === CARD.config.unit.flexTimer;
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
  #decimal = new DecimalHelper();
  #percent = 0;
  #isTimer = false;
  #isReversed = false;

  constructor() {
    this.#hassProvider = new HassProvider(this.constructor.name);
  }

  /******************************************************************************************
   * Getter/Setter
   */
  set isTimer(isTimer) {
    this.#isTimer = typeof isTimer === 'boolean' ? isTimer : false;
  }

  set isReversed(isReversed) {
    this.#isReversed = typeof isReversed === 'boolean' ? isReversed : CARD.config.reverse;
  }

  set min(newMin) {
    this.#min.value = Number.isFinite(newMin) ? newMin : CARD.config.value.min;
  }

  set max(newMax) {
    this.#max.value = Number.isFinite(newMax) ? newMax : CARD.config.value.min;
  }

  set current(newCurrent) {
    this.#current.value = newCurrent;
  }

  get actual() {
    return this.#isReversed ? this.#max.value - this.#current.value : this.#current.value;
  }

  get unit() {
    return this.#unit.value;
  }

  set unit(newUnit) {
    this.#unit.value = newUnit;
  }

  set hasDisabledUnit(disabled) {
    this.#unit.isDisabled = disabled;
  }

  set decimal(newDecimal) {
    this.#decimal.value = Number.isFinite(newDecimal) ? newDecimal : CARD.config.decimal.percentage;
  }

  get isValid() {
    return this.#max.value === this.#min.value || !this.#min.isValid || !this.#max.isValid || !this.#current.isValid || !this.#decimal.isValid
      ? false
      : true;
  }

  get range() {
    return this.#max.value - this.#min.value;
  }

  get correctedValue() {
    return this.actual - this.#min.value;
  }

  get percent() {
    if (!this.isValid) {
      return null;
    }
    return this.#percent;
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
    let value = this.actual;

    if (this.#isTimer) {
      value = this.actual / 1000;
    } else if (this.#unit.value === CARD.config.unit.default) {
      value = this.percent;
    }

    return value;
  }

  /******************************************************************************************
   * Calculates the value to display based on the selected theme and unit system.
   *
   * @param {boolean} themeIsLinear - Indicates whether the theme uses a linear scale.
   * @returns {number} - The percentage value if the theme is linear or if the unit is the default,
   *                     otherwise returns the temperature value converted to Celsius if the unit is Fahrenheit.
   *
   * - If the unit is Fahrenheit, the temperature is converted to Celsius before returning.
   * - If the theme is linear or the unit is the default, the percentage value is returned.
   */
  valueForThemes(valueBasedOnPercentage) {
    let value = this.actual;
    if (this.#unit.value === CARD.config.unit.fahrenheit) {
      value = ((value - 32) * 5) / 9;
    }
    return valueBasedOnPercentage || [CARD.config.unit.default, CARD.config.unit.disable].includes(this.#unit.value) ? this.#percent : value;
  }

  /**
   * Calculates and updates the percentage value based on the current, minimum, and maximum values.
   */
  refresh() {
    this.#percent = this.isValid ? +((this.correctedValue / this.range) * 100).toFixed(this.#decimal.value) : 0;
  }
  _getTiming() {
    const seconds = this.actual / 1000;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let s = (seconds % 60).toFixed(this.#decimal.value);

    // Fonction utilitaire pour padStart
    const pad = (value, length = 2) => String(value).padStart(length, '0');

    // Si des décimales existent
    if (s.includes('.')) {
      const [intPart, decimalPart] = s.split('.');
      s = `${pad(intPart)}.${decimalPart}`;
    } else {
      s = pad(s); // Assure que les secondes sont toujours en 2 chiffres
    }

    if (this.hasFlexTimerUnit) {
      if (seconds < 60) {
        return `${parseFloat(s)}s`;
      } else if (seconds < 3600) {
        return `${pad(m)}:${s}`;
      }
    }

    // Formatage final avec heure, minute et seconde
    return [pad(h), pad(m), s].join(':');
  }
  toString() {
    if (!this.isValid) {
      return 'Div0';
    } else if (this.hasTimerOrFlexTimerUnit) {
      // timer with time format
      return this._getTiming();
    }

    let formattedValue;
    const numberFormat = this.#hassProvider.numberFormat;
    if (numberFormat) {
      formattedValue = new Intl.NumberFormat(numberFormat, {
        style: 'decimal',
        minimumFractionDigits: this.#decimal.value,
        maximumFractionDigits: this.#decimal.value,
      }).format(this.processedValue);
    } else {
      formattedValue = `${this.processedValue}`;
    }

    return this.#unit.value ? `${formattedValue}${this.#unit.value}` : formattedValue;
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
    if (newTheme === 'battery') {
      newTheme = 'optimal_when_high';
    }
    if (newTheme === 'memory' || newTheme === 'cpu') {
      newTheme = 'optimal_when_low';
    }
    if (!newTheme || !Object.hasOwn(THEME, newTheme)) {
      this.#icon = null;
      this.#color = null;
      this.#theme = null;
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
    if (!this.#validateCustomTheme(newTheme)) {
      return;
    }
    this.#theme = CARD.theme.default;
    this.#currentStyle = newTheme;
    this.#isValid = true;
    this.#isLinear = false;
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
    if (!this.#isValid) {
      return;
    }
    if (this.isLinear) {
      this.#setLinearStyle();
    } else {
      this.#setStyle();
    }
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

  #validateCustomTheme(customTheme) {
    // array with 1 element
    if (!Array.isArray(customTheme) || customTheme.length === 0) {
      return false;
    }

    // check all elements
    let isFirstItem = true;
    let lastMax = null;

    return customTheme.every((item) => {
      if (item === null || typeof item !== 'object') {
        return false;
      }

      // check keys
      if (!CARD.theme.customTheme.expectedKeys.every((key) => key in item)) {
        return false;
      }

      // min < max
      if (item.min >= item.max) {
        return false;
      }

      // check continuity
      if (!isFirstItem && item.min !== lastMax) {
        return false;
      }

      isFirstItem = false;
      lastMax = item.max;

      return true;
    });
  }
}

/**
 * Provides access to the Home Assistant object.
 * This class implements a singleton pattern to ensure only one instance exists.
 *
 * @class HassProvider
 */
class HassProvider {
  static #instance = null;
  #hass = null;
  #isValid = false;

  constructor(callerName) {
    debugLog(`👉 HassProvider(${callerName})`);
    if (HassProvider.#instance) {
      return HassProvider.#instance;
    }
    HassProvider.#instance = this;
  }

  set hass(hass) {
    if (!hass) {
      return;
    }
    this.#hass = hass;
    this.#isValid = true;
  }
  get isValid() {
    return this.#isValid;
  }
  get hass() {
    return this.#hass;
  }
  get systemLanguage() {
    return this.#isValid && MSG.decimalError[this.#hass.config.language] ? this.#hass.config.language : CARD.config.language;
  }
  get language() {
    return this.#isValid && MSG.decimalError[this.#hass.language] ? this.#hass.language : CARD.config.language;
  }
  get numberFormat() {
    if (!this.#isValid || !this.#hass?.locale?.number_format) {
      return CARD.config.languageMap[CARD.config.language]; // if unavailable return default
    }
    if (this.#hass?.locale?.number_format === 'none') {
      return null;
    }
    const formatMap = {
      decimal_comma: 'de-DE', // 1.234,56 (Allemagne, France, etc.)
      comma_decimal: 'en-US', // 1,234.56 (USA, UK, etc.)
      space_comma: 'fr-FR', // 1 234,56 (France, Norvège, etc.)
      language: CARD.config.languageMap[this.#hass.language]
        ? CARD.config.languageMap[this.#hass.language]
        : CARD.config.languageMap[CARD.config.language],
      system: Intl.NumberFormat().resolvedOptions().locale,
    };

    return formatMap[this.#hass.locale.number_format] || CARD.config.languageMap[CARD.config.language];
  }
  get hasNewShapeStrategy() {
    if (!this.#hass || !this.#hass.config || !this.#hass.config.version) return false;
    const [year, month] = this.#hass.config.version.split('.').map(Number);
    return year > 2025 || (year === 2025 && month >= 3);
  }
  getLovelaceViews() {
    debugLog('🔄 Récupération des vues Lovelace...');
    
    return this.#hass.callWS({ type: 'lovelace/config' })
      .then(response => {
        debugLog('✅ Réponse reçue :', response);

        const views = response.views.map((view, index) => {
          const title = view.title || view.path || index;
          const value = '/lovelace/' + (view.path || index);
          const label = `${title} (${value})`;
          const icon = view.icon || 'mdi:page-layout-header';

          return { label: label, value: value, icon: icon };
        });

        debugLog('📌 Vues formatées :', views);
        return views;
      })
      .catch(error => {
        console.error('❌ Erreur lors de la récupération des vues :', error);
        return [];
      });
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
  #isAvailable = false;
  #id = null;
  #attribute = null;
  #state = null;
  #domain = null;

  constructor() {
    this.#hassProvider = new HassProvider(this.constructor.name);
  }

  set id(id) {
    this.#id = id;
    this.#isValid = false;
    this.#value = 0;
    if (!(typeof this.#id === 'string' && this.#id)) {
      return;
    }
    this.#validate();
    this.#domain = this.#id.split('.')[0];
  }
  get value() {
    if (this.#isValid) {
      return this.#value;
    } else {
      return null;
    }
  }
  set attribute(newAttribute) {
    this.#attribute = newAttribute;
    this.#isValid = false;
  }
  get state() {
    return this.#state;
  }
  get isValid() {
    return this.#isValid;
  }
  get isAvailable() {
    return this.#isAvailable;
  }
  #validate() {
    if (!this.#hassProvider.hass || !this.#hassProvider.hass.states) {
      return;
    }
    if (!this.#hassProvider.hass.states[this.#id]) {
      this.#state = CARD.config.entity.state.notFound;
      return;
    }
    this.#isValid = true;
  }
  refresh() {
    this.#state = null;
    this.#isAvailable = false;

    this.#validate();
    if (!this.#isValid) {
      return;
    }

    const entityState = this.states;
    this.#state = entityState.state;
    if (this.#state === CARD.config.entity.state.unavailable || this.#state === CARD.config.entity.state.unknown) {
      this.#value = 0;
      return;
    }
    this.#isAvailable = true;

    // timer
    if (this.#domain !== CARD.config.entity.type.timer) {
      this.#manageStdEntity();
    } else {
      this.#manageTimerEntity();
    }
    return;
  }
  #manageStdEntity() {
    if (this.hasAttribute) {
      const attribute = this.#attribute ?? ATTRIBUTE_MAPPING[this.#domain].attribute;
      if (attribute && Object.hasOwn(this.states.attributes, attribute)) {
        this.#value = this.states.attributes[attribute] ?? 0;
        if (this.#domain === ATTRIBUTE_MAPPING.light.label && attribute === ATTRIBUTE_MAPPING.light.attribute) {
          this.#value = (100 * this.#value) / 255;
        }
      } else {
        // attribute not supported
        this.#value = 0;
        this.#isValid = false;
        this.#isAvailable = false;
      }
    } else {
      this.#value = parseFloat(this.#state) || 0;
    }
  }
  #parseDuration(duration) {
    const parts = duration.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;

    return (hours * 3600 + minutes * 60 + seconds) * CARD.config.msFactor;
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
        const finished_at = new Date(this.states.attributes.finishes_at).getTime();
        duration = this.#parseDuration(this.states.attributes.duration);
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case CARD.config.entity.state.paused: {
        const remaining = this.#parseDuration(this.states.attributes.remaining);
        duration = this.#parseDuration(this.states.attributes.duration);
        elapsed = duration - remaining;
        break;
      }
    }
    this.#value = { elapsed: elapsed, duration: duration, state: this.#state };
  }
  #getDeviceClass() {
    const entityState = this.states;

    if (entityState.attributes?.device_class) {
      return entityState.attributes.device_class;
    }
    return null;
  }
  #getIconByDeviceClass() {
    const deviceClass = this.#getDeviceClass();
    const suffix = deviceClass === CARD.config.entity.class.shutter && this.states.attributes.current_position > 0 ? CARD.style.icon.suffix.open : '';
    return deviceClass && Object.hasOwn(CARD.style.icon.byDeviceClass, deviceClass) ? `${CARD.style.icon.byDeviceClass[deviceClass]}${suffix}` : null;
  }
  #getIconByDomain() {
    return this.#domain && Object.hasOwn(CARD.style.icon.byDeviceDomain, this.#domain) ? CARD.style.icon.byDeviceDomain[this.#domain] : null;
  }

  /**
   * Returns the icon of the entity, if valid.
   */
  get icon() {
    return this.#isValid && this.states ? this.states.attributes?.icon || this.#getIconByDeviceClass() || this.#getIconByDomain() : null;
  }
  /******************************************************************************************
   *
   */
  get hasAttribute() {
    return this.#isValid ? !!ATTRIBUTE_MAPPING[this.#domain] : false;
  }
  get defaultAttribute() {
    return this.#isValid && this.hasAttribute ? ATTRIBUTE_MAPPING[this.#domain].attribute : null;
  }
  get name() {
    return this.#isValid ? this.#hassProvider.hass.states[this.#id]?.attributes?.friendly_name : null;
  }
  get states() {
    return this.#isValid ? this.#hassProvider.hass.states[this.#id] : null;
  }
  get unit() {
    return this.#isValid ? this.#hassProvider.hass.states[this.#id]?.attributes?.unit_of_measurement : null;
  }
  get precision() {
    return this.#isValid ? this.#hassProvider?.hass?.entities?.[this.#id]?.display_precision ?? null : null;
  }
  get attributes() {
    return this.#isValid ? this.#hassProvider.hass.states[this.#id]?.attributes ?? null : null;
  }
  get isTimer() {
    return this.#domain === CARD.config.entity.type.timer;
  }
  get hasShapeByDefault() {
    return this.#domain === CARD.config.entity.type.light || this.#domain === CARD.config.entity.type.fan;
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
    if (!this.#value || this.#value <= 30) {
      return CARD.style.color.battery.low;
    }
    if (this.#value <= 70) {
      return CARD.style.color.battery.medium;
    }
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

    return typeColorMap[this.#domain] ?? typeColorMap[this.#getDeviceClass()] ?? null;
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
  #isEntity = null;

  #createValueHelper() {
    if (!this.#activeHelper || !(this.#activeHelper instanceof ValueHelper)) {
      this.#activeHelper = new ValueHelper();
      this.#isEntity = false;
    }
  }
  #createEntityHelper() {
    if (!this.#activeHelper || !(this.#activeHelper instanceof EntityHelper)) {
      this.#activeHelper = new EntityHelper();
      this.#isEntity = true;
    }
  }

  /******************************************************************************************
   * Sets the value, which can be an entity ID or a direct value.
   * Dynamically delegates to the appropriate helper.
   * @param {string|number} input - The value or entity ID.
   */
  set value(input) {
    if (typeof input === 'string') {
      this.#createEntityHelper();
      this.#activeHelper.id = input;
    } else if (Number.isFinite(input)) {
      this.#createValueHelper();
      this.#activeHelper.value = input;
    } else {
      this.#activeHelper = null;
    }
  }

  /******************************************************************************************
   * Proxy function
   */
  get isEntity() {
    return this.#isEntity;
  }
  get value() {
    return this.#activeHelper ? this.#activeHelper.value : null;
  }
  set attribute(newAttribute) {
    if (this.#isEntity) {
      this.#activeHelper.attribute = newAttribute;
    }
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
  get icon() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.icon : null;
  }
  get isTimer() {
    return this.#activeHelper && this.#isEntity ? this.#activeHelper.isTimer : false;
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
  refresh() {
    if (this.#activeHelper && this.#isEntity) {
      this.#activeHelper.refresh();
    }
  }
}

/**
 * Helper class for managing and validating card configuration.
 *
 * @class ConfigHelper
 */
class ConfigHelper {
  #config = {};
  #bar = { size: null, color: null, orientation: null, changed: null };
  #isValid = false;
  #msg = null;
  #isChanged = false;
  #hassProvider = null;

  constructor() {
    this.#hassProvider = new HassProvider(this.constructor.name);
  }

  /******************************************************************************************
   * Getter/Setter
   */
  get config() {
    return this.#config;
  }

  set config(config) {
    this.#isChanged = true;
    this.#config = config;
    this.#bar.size =
      this.#config.bar_size && Object.hasOwn(CARD.style.bar.sizeOptions, this.#config.bar_size)
        ? this.#config.bar_size
        : CARD.style.bar.sizeOptions.small.label;
    this.#bar.color = this.#config.bar_color;
    this.#bar.orientation = Object.hasOwn(CARD.style.dynamic.progressBar.orientation, this.#config.bar_orientation)
      ? CARD.style.dynamic.progressBar.orientation[this.#config.bar_orientation]
      : null;
    this.#bar.changed =
      typeof this.#config.bar_orientation === 'string' &&
      Object.keys(CARD.style.dynamic.progressBar.orientation).includes(this.#config.bar_orientation);
  }

  get decimal() {
    if (this.#config.decimal === undefined) {
      if (this.unit === CARD.config.unit.default) {
        return CARD.config.decimal.percentage;
      } else {
        return CARD.config.decimal.other;
      }
    }
    if (Number.isInteger(this.#config.decimal) && this.#config.decimal >= 0) {
      return this.#config.decimal;
    }
    return null;
  }

  get isValid() {
    return this.#isValid;
  }

  get msg() {
    return this.#msg;
  }

  get color() {
    return this.#config.color;
  }
  get layout() {
    return Object.hasOwn(CARD.layout.orientations, this.#config.layout)
      ? CARD.layout.orientations[this.#config.layout].label
      : CARD.layout.orientations.horizontal.label;
  }
  get bar() {
    return this.#bar;
  }
  get icon() {
    return this.#config.icon;
  }
  get entity() {
    return this.#config.entity;
  }
  get name() {
    return this.#config.name;
  }
  get min_value() {
    return this.#config.min_value ? this.#config.min_value : CARD.config.value.min;
  }
  get max_value() {
    if (!this.#config.max_value) {
      return CARD.config.value.max;
    }
    if (Number.isFinite(this.#config.max_value)) {
      return this.#config.max_value;
    }
    if (typeof this.#config.max_value === 'string') {
      const state = this.#hassProvider.hass.states[this.#config.max_value]?.state;
      const parsedState = parseFloat(state);

      if (!isNaN(parsedState)) {
        return parsedState;
      }
    }
    return null;
  }
  get unit() {
    return this.#config.unit ? this.#config.unit : CARD.config.unit.default;
  }
  get hasDisabledUnit() {
    return this.#config.disable_unit;
  }
  get urlPath() {
    return this.cardTapAction === CARD.interactions.tap_action.url.action && this.#config.tap_action.url_path !== undefined
      ? this.#config.tap_action.url_path
      : null;
  }
  get navigationPath() {
    return this.cardTapAction === CARD.interactions.tap_action.navigate.action && this.#config.tap_action.navigation_path !== undefined
      ? this.#config.tap_action.navigation_path
      : null;
  }
  get navigate_to() {
    return this.urlPath || this.navigationPath;
  }
  get cardTapAction() {
    const result = (this.#config.tap_action?.action ?? null) === null ? CARD.interactions.tap_action.default : this.#config.tap_action?.action;
    return result;
  }
  get theme() {
    return this.#config.theme;
  }
  get custom_theme() {
    return this.#config.custom_theme;
  }
  get reverse() {
    return this.#config.reverse;
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
    const entityState = this.#hassProvider.hass.states[this.#config.entity];
    const maxValueState =
      typeof this.#config.max_value === 'string' && this.#config.max_value.trim() ? this.#hassProvider.hass.states[this.#config.max_value] : null;
    const validationRules = [
      {
        valid: !!this.#config.entity,
        msg: MSG.entityError,
      },
      {
        valid: !this.#config.attribute || (entityState && Object.hasOwn(entityState.attributes, this.#config.attribute)),
        msg: MSG.attributeNotFound,
      },
      {
        valid: Number.isFinite(this.min_value),
        msg: MSG.minValueError,
      },
      {
        valid:
          Number.isFinite(this.max_value) ||
          (maxValueState && (this.#config.max_value_attribute ? Object.hasOwn(maxValueState.attributes, this.#config.max_value_attribute) : true)),
        msg: MSG.maxValueError,
      },
      {
        valid: Number.isFinite(this.decimal),
        msg: MSG.decimalError,
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
  #hassProvider = null;
  #configHelper = new ConfigHelper();
  #percentHelper = new PercentHelper();
  #theme = new ThemeManager();
  #currentValue = new EntityOrValue();
  #max_value = new EntityOrValue();
  #currentLanguage = CARD.config.language;
  #isReversed = false;

  constructor() {
    this.#hassProvider = new HassProvider(this.constructor.name);
  }

  /******************************************************************************************
   * Getter/Setter
   */
  get hasValidatedConfig() {
    return this.#configHelper.isValid;
  }

  get msg() {
    return this.#configHelper.msg[this.currentLanguage];
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

  set currentLanguage(newLanguage) {
    if (Object.keys(MSG.entityError).includes(newLanguage)) {
      this.#currentLanguage = newLanguage;
    }
  }

  get currentLanguage() {
    return this.#currentLanguage;
  }

  get entity() {
    return this.#configHelper.entity;
  }

  get icon() {
    if (this.isNotFound) {
      return CARD.style.icon.notFound.icon;
    }
    if (this.#theme.theme === CARD.theme.battery.label && this.#currentValue.icon && this.#currentValue.icon.includes(CARD.theme.battery.icon)) {
      return this.#currentValue.icon;
    }
    return this.#theme.icon || this.#configHelper.icon || this.#currentValue.icon || CARD.style.icon.default.icon;
  }

  get color() {
    if (this.isUnavailable) {
      return CARD.style.color.unavailable;
    }
    if (this.isNotFound) {
      return CARD.style.color.notFound;
    }
    return this.#theme.color || this.#configHelper.color || this.#currentValue.defaultColor || CARD.style.color.default;
  }

  get bar_color() {
    if (this.isAvailable) {
      return this.#theme.color || this.#configHelper.bar.color || this.#currentValue.defaultColor || CARD.style.color.default;
    }
    if (this.isUnknown) {
      return CARD.style.color.default;
    }
    return CARD.style.color.disabled;
  }

  get percent() {
    if (this.isAvailable) {
      return Math.min(CARD.config.value.max, Math.max(0, this.#percentHelper.percent));
    }
    return CARD.config.value.min;
  }

  get description() {
    if (this.isNotFound) {
      return MSG.entityNotFound[this.currentLanguage];
    }
    if (this.isUnknown) {
      return MSG.entityUnknown[this.currentLanguage];
    }
    if (this.isUnavailable) {
      return MSG.entityUnavailable[this.currentLanguage];
    }
    return this.#percentHelper.toString();
  }

  get name() {
    return this.#configHelper.name || this.#currentValue.name || this.#configHelper.entity;
  }

  get hasStandardEntityError() {
    if (this.isUnavailable || this.isNotFound || this.isUnknown) {
      return true;
    }
    return false;
  }

  get isBadgeEnable() {
    if (
      !(
        this.isUnavailable ||
        this.isNotFound ||
        (this.#currentValue.isTimer &&
          (this.#currentValue.value.state === CARD.config.entity.state.paused || this.#currentValue.value.state === CARD.config.entity.state.active))
      )
    ) {
      return false;
    }
    return true;
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
    return this.#configHelper.layout;
  }
  get isActiveTimer() {
    return this.#currentValue.isTimer && this.#currentValue.state === CARD.config.entity.state.active;
  }
  get refreshSpeed() {
    const rawSpeed = this.#currentValue.value.duration / CARD.config.refresh.ratio;
    const clampedSpeed = Math.min(CARD.config.refresh.max, Math.max(CARD.config.refresh.min, rawSpeed));
    const roundedSpeed = Math.max(100, Math.round(clampedSpeed / 100) * 100);
    debugLog(roundedSpeed);

    return roundedSpeed;
  }
  get show_more_info() {
    return [
      CARD.interactions.tap_action.default,
      CARD.interactions.tap_action.moreInfo.action,
    ].includes(this.#configHelper.cardTapAction);
  }
  get navigate_to() {
    return this.#configHelper.navigate_to;
  }
  get bar() {
    return this.#configHelper.bar;
  }
  get isClickable() {
    return this.#configHelper.cardTapAction !== CARD.interactions.tap_action.none.action;
  }
  get hasVisibleShape() {
    return this.#hassProvider.hasNewShapeStrategy
      ? this.#currentValue.hasShapeByDefault ||
          [
            CARD.interactions.tap_action.navigate.action,
            CARD.interactions.tap_action.url.action,
            CARD.interactions.tap_action.moreInfo.action,
          ].includes(this.#configHelper.cardTapAction)
      : true;
  }
  get hasHiddenIcon() {
    return this.#isComponentConfiguredAsHidden(CARD.style.dynamic.hiddenComponent.icon.label);
  }
  get hasHiddenName() {
    return this.#isComponentConfiguredAsHidden(CARD.style.dynamic.hiddenComponent.name.label);
  }
  get hasHiddenSecondaryInfo() {
    return this.#isComponentConfiguredAsHidden(CARD.style.dynamic.hiddenComponent.secondary_info.label);
  }
  get hasHiddenProgressBar() {
    return this.#isComponentConfiguredAsHidden(CARD.style.dynamic.hiddenComponent.progress_bar.label);
  }

  /******************************************************************************************
   * Sets the card configuration and updates related properties.
   *
   * @param {object} config - The new card configuration.
   */
  set config(config) {
    this.#configHelper.config = config;
    this.#percentHelper.unit = this.#configHelper.unit;
    this.#percentHelper.hasDisabledUnit = this.#configHelper.hasDisabledUnit;
    this.#theme.theme = this.#configHelper.theme;
    this.#theme.customTheme = this.#configHelper.custom_theme;
    this.#currentValue.value = this.#configHelper.entity;
    this.#percentHelper.isTimer = this.#currentValue.isTimer;
    if (this.#currentValue.isTimer) {
      this.#isReversed = this.#configHelper.reverse;
      this.#max_value.value = CARD.config.value.max;
    } else {
      this.#currentValue.attribute = config.attribute || null;
      this.#max_value.value = config.max_value ?? CARD.config.value.max;
      this.#max_value.attribute = config.max_value_attribute || null;
    }
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

    if (!this.isAvailable) {
      return;
    }

    // update
    this.#percentHelper.decimal = this.#getCurrentDecimal();

    if (this.#currentValue.isTimer) {
      this.#percentHelper.isReversed =
        typeof this.#isReversed === 'boolean' && this.#isReversed && this.#currentValue.value.state !== CARD.config.entity.state.idle;
      this.#percentHelper.current = this.#currentValue.value.elapsed;
      this.#percentHelper.min = CARD.config.value.min;
      this.#percentHelper.max = this.#currentValue.value.duration;
    } else {
      this.#percentHelper.current = this.#currentValue.value;
      this.#percentHelper.min = this.#configHelper.min_value;
      this.#percentHelper.max = this.#max_value.value;
    }
    this.#percentHelper.refresh();
    this.#theme.value = this.#percentHelper.valueForThemes(this.#theme.isBasedOnPercentage);
  }

  #isComponentConfiguredAsHidden(component) {
    return Array.isArray(this.#configHelper.config?.hide) && this.#configHelper.config.hide.includes(component);
  }

  #getCurrentDecimal() {
    if (this.#configHelper.config.decimal !== undefined) return this.#configHelper.config.decimal;
    if (this.#currentValue.precision) return this.#currentValue.precision;
    if (this.#currentValue.isTimer) return CARD.config.decimal.timer;
    if (this.#configHelper.unit === CARD.config.unit.default) return CARD.config.decimal.percentage;

    return CARD.config.decimal.other;
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
  #cardView = new CardView();
  #elements = {};
  #errorVisible = false;
  #lastHass = null;
  #autoRefreshInterval = null;

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });

    if (!EntityProgressCard._moduleLoaded) {
      console.groupCollapsed(CARD.console.message, CARD.console.css);
      console.log(CARD.console.link);
      console.groupEnd();
      EntityProgressCard._moduleLoaded = true;
    }

    this.addEventListener(CARD.interactions.event.click, this.#handleCardAction.bind(this));
  }

  #handleCardAction() {
    if (this.#cardView.navigate_to) {
      this.#navigateTo();
    } else if (this.#cardView.show_more_info) {
      this.#showMoreInfo();
    }
  }

  #navigateTo() {
    if (/^https?:\/\//.test(this.#cardView.navigate_to)) {
      window.location.href = this.#cardView.navigate_to;
      return;
    }

    window.history.pushState(null, '', this.#cardView.navigate_to);
    this.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));

    const anchor = this.#cardView.navigate_to.split('#')[1];
    if (anchor) {
      const element = document.querySelector(`#${anchor}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  #showMoreInfo() {
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: this.#cardView.entity },
      })
    );
  }

  /**
   * Creates and returns a new configuration element for the component.
   *
   * @returns {HTMLElement} A newly created configuration element.
   */
  static getConfigElement() {
    return document.createElement(CARD.meta.editor);
  }

  /**
   * Updates the component's configuration and triggers static changes.
   *
   * **Note:** Dynamic Updates will be done in set hass function.
   *
   * @param {Object} config - The new configuration object.
   */
  setConfig(config) {
    this.#cardView.config = config;
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
    this.#lastHass = hass;

    // Si ce n'est pas un timer actif, on fait un rafraîchissement immédiat
    if (!this.#cardView.isActiveTimer) {
      this.refresh(hass);
      this.#stopAutoRefresh();
      return;
    }
    if (!this.#autoRefreshInterval) {
      this.refresh(hass);
      this.#startAutoRefresh();
    }
  }

  refresh(hass) {
    this.#cardView.refresh(hass);
    this.#updateDynamicElements();
  }

  #startAutoRefresh() {
    this.#autoRefreshInterval = setInterval(() => {
      this.refresh(this.#lastHass);
      debugLog('👉 EntityProgressCard.#startAutoRefresh()');
      if (!this.#cardView.isActiveTimer) {
        this.#stopAutoRefresh();
        return;
      }
    }, this.#cardView.refreshSpeed);
  }

  #stopAutoRefresh() {
    if (this.#autoRefreshInterval) {
      clearInterval(this.#autoRefreshInterval);
      this.#autoRefreshInterval = null;
    }
  }

  /**
   * Builds and initializes the structure of the custom card component.
   *
   * This method creates the visual and structural elements of the card and injects
   * them into the component's Shadow DOM.
   */
  #buildCard() {
    const card = document.createElement(CARD.htmlStructure.card.element);
    card.classList.add(CARD.meta.typeName);
    card.classList.toggle(CARD.style.dynamic.clickable, this.#cardView.isClickable);
    card.classList.toggle(this.#cardView.bar.orientation, this.#cardView.bar.changed);
    card.classList.add(this.#cardView.layout);
    card.classList.add(this.#cardView.bar.size);
    card.classList.toggle(CARD.style.dynamic.secondaryInfoError.class, this.#cardView.hasStandardEntityError);
    card.classList.toggle(CARD.style.dynamic.hiddenComponent.icon.class, this.#cardView.hasHiddenIcon);
    card.classList.toggle(CARD.style.dynamic.hiddenComponent.name.class, this.#cardView.hasHiddenName);
    card.classList.toggle(CARD.style.dynamic.hiddenComponent.secondary_info.class, this.#cardView.hasHiddenSecondaryInfo);
    card.classList.toggle(CARD.style.dynamic.hiddenComponent.progress_bar.class, this.#cardView.hasHiddenProgressBar);

    card.innerHTML = CARD_HTML;
    const style = document.createElement(CARD.style.element);
    style.textContent = CARD_CSS;

    // Inject in the DOM
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(card);
    // store DOM ref to update
    this.#elements = {
      [CARD.htmlStructure.card.element]: card,
      [CARD.htmlStructure.elements.icon.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.elements.icon.class}`),
      [CARD.htmlStructure.elements.badge.icon.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.elements.badge.icon.class}`),
      [CARD.htmlStructure.elements.name.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.elements.name.class}`),
      [CARD.htmlStructure.elements.percentage.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.elements.percentage.class}`),
      [CARD.htmlStructure.alert.container.element]: this.shadowRoot.querySelector(`${CARD.htmlStructure.alert.container.element}`),
      [CARD.htmlStructure.alert.icon.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.alert.icon.class}`),
      [CARD.htmlStructure.alert.message.class]: this.shadowRoot.querySelector(`.${CARD.htmlStructure.alert.message.class}`),
    };
  }

  /**
   * Updates the specified DOM element based on a provided callback function.
   *
   * This method accepts a `key` (which corresponds to an element stored in
   * the `_elements` object) and a `callback` function. The callback is executed
   * on the specified element, and its current value (either `textContent` or
   * `style.width`) is compared with the new value returned by the callback.
   *
   * @param {string} key - The key that identifies the element to be updated
   *                       in the `_elements` object.
   * @param {function} callback - A function that is applied to the element.
   *                              It should return the new value for the element.
   */
  #updateElement(key, updateCallback) {
    const element = this.#elements[key];
    if (element) {
      updateCallback(element);
    }
  }

  #manageErrorMessage() {
    if (!this.#cardView.hasValidatedConfig) {
      this.#showError(this.#cardView.msg);
      this.#errorVisible = true;
      return;
    } else if (this.#errorVisible) {
      this.#hideError();
      this.#errorVisible = false;
    }
  }

  #updateCSS() {
    this.#updateElement(CARD.htmlStructure.card.element, (el) => {
      el.style.setProperty(CARD.style.dynamic.progressBar.color.var, this.#cardView.bar_color);
      el.style.setProperty(CARD.style.dynamic.progressBar.size.var, `${this.#cardView.percent}%`);
      el.style.setProperty(CARD.style.dynamic.iconAndShape.color.var, this.#cardView.color);
    });
  }

  /**
   * Updates dynamic card elements based on the entity's state and configuration.
   *
   * Handles errors gracefully (e.g., invalid config, unavailable entity).
   *
   * @returns {void}
   */
  #updateDynamicElements() {
    this.#manageErrorMessage();
    this.#showBadge();
    this.#manageShape();
    this.#updateCSS();

    this.#updateElement(CARD.htmlStructure.elements.icon.class, (el) => {
      if (el.getAttribute(CARD.htmlStructure.elements.icon.class) !== this.#cardView.icon) {
        el.setAttribute(CARD.htmlStructure.elements.icon.class, this.#cardView.icon);
      }
    });

    this.#updateElement(CARD.htmlStructure.elements.name.class, (el) => {
      if (el.textContent !== this.#cardView.name) {
        el.textContent = this.#cardView.name;
      }
    });

    this.#updateElement(CARD.htmlStructure.elements.percentage.class, (el) => {
      if (el.textContent !== this.#cardView.description) {
        el.textContent = this.#cardView.description;
      }
    });
  }

  #manageShape() {
    this.#elements[CARD.htmlStructure.card.element].classList.toggle(CARD.style.dynamic.hiddenComponent.shape.class, !this.#cardView.hasVisibleShape);
  }

  /**
   * Displays a badge
   */
  #showBadge() {
    const isBadgeEnable = this.#cardView.isBadgeEnable;
    this.#elements[CARD.htmlStructure.card.element].classList.toggle(
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`,
      isBadgeEnable
    );
    if (isBadgeEnable) {
      const badgeInfo = this.#cardView.badgeInfo;
      if (!badgeInfo) {
        return;
      }
      this.#updateElement(CARD.htmlStructure.elements.badge.icon.class, (el) => {
        if (el.getAttribute(badgeInfo.attribute) !== badgeInfo.icon) {
          el.setAttribute(badgeInfo.attribute, badgeInfo.icon);
        }
      });
      this.#updateElement(CARD.htmlStructure.card.element, (el) => {
        el.style.setProperty(CARD.style.dynamic.badge.backgroundColor.var, badgeInfo.backgroundColor);
        el.style.setProperty(CARD.style.dynamic.badge.color.var, badgeInfo.color);
      });
    }
  }

  /**
   * Displays an error alert with the provided message.
   *
   * @param {string} message - The error message to display in the alert.
   */
  #showError(message) {
    this.#elements[CARD.htmlStructure.card.element].classList.toggle(
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.alert.container.element}`,
      true
    );
    this.#updateElement(CARD.htmlStructure.alert.icon.class, (el) => {
      if (el.getAttribute(CARD.style.icon.alert.attribute) !== CARD.style.icon.alert.icon) {
        el.setAttribute(CARD.style.icon.alert.attribute, CARD.style.icon.alert.icon);
      }
    });
    this.#updateElement(CARD.htmlStructure.alert.message.class, (el) => {
      if (el.textContent !== message) {
        el.textContent = message;
      }
    });
  }

  /**
   * Hides the error alert by setting its display style to hide.
   *
   * @returns {void}
   */
  #hideError() {
    this.#elements[CARD.htmlStructure.card.element].classList.toggle(
      `${CARD.style.dynamic.show}-${CARD.htmlStructure.alert.container.element}`,
      false
    );
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
  description: CARD.meta.description,
});

/** --------------------------------------------------------------------------
 * Custom editor component for configuring the `EntityProgressCard`.
 */
class EntityProgressCardEditor extends HTMLElement {
  #hassProvider = null;
  #container = null;
  #config = {};
  #previous = { entity: null, max_value: null };
  #isRendered = false;
  #elements = {};
  #accordionContent = [];
  #currentLanguage = CARD.config.language;

  constructor() {
    super();
    this.attachShadow({ mode: CARD.config.shadowMode });
    this.#hassProvider = new HassProvider(this.constructor.name);
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

  setConfig(config) {
    debugLog('👉 editor.setConfig()');
    debugLog('  📎 ', config);
    this.#config = config;
    if (!this.#hassProvider.isValid) {
      return;
    }
    if (!this.#isRendered) {
      this.loadEntityPicker();
      this.render();
      this.#addEventListener();
      this.#isRendered = true;
    }
    this.#updateFields();
  }

  #updateFields() {
    debugLog('👉 editor.#updateFields()');
    const keys = Object.keys(this.#elements);
    keys.forEach((key) => {
      if (
        ![
          CARD.editor.keyMappings.tapAction,
          CARD.editor.keyMappings.attribute,
          CARD.editor.keyMappings.max_value_attribute,
          CARD.editor.keyMappings.url_path,
          CARD.editor.keyMappings.navigation_path,
        ].includes(key) &&
        Object.hasOwn(this.#config, key) &&
        this.#elements[key].value !== this.#config[key]
      ) {
        this.#elements[key].value = this.#config[key];
        debugLog('✅ updateFields - update de la clef: ', key);
      }
    });

    // TapAction childElementCount
    const curTapAction = this.#getTapActionValue();
    if (this.#elements[CARD.editor.keyMappings.tapAction].value !== curTapAction) {
      this.#elements[CARD.editor.keyMappings.tapAction].value = curTapAction;
      debugLog('✅ updateFields - update tap_action');
    }
    if (
      curTapAction === CARD.interactions.tap_action.url.action &&
      this.#config.tap_action.url_path !== undefined &&
      this.#elements['url_path'].value !== this.#config.tap_action.url_path
    ) {
      this.#elements['url_path'].value = this.#config.tap_action.url_path;
      debugLog('✅ updateFields - update url_path');
    }
    if (
      this.#elements['navigation_path'].childElementCount > 0 &&
      curTapAction === CARD.interactions.tap_action.navigate.action &&
      this.#config.tap_action.navigation_path !== undefined &&
      this.#elements['navigation_path'].value !== this.#config.tap_action.navigation_path
    ) {
      this.#elements['navigation_path'].value = this.#config.tap_action.navigation_path;
      debugLog('✅ updateFields - update navigation_path');
    }
    this.#toggleFieldDisable(CARD.editor.keyMappings.url_path, curTapAction !== CARD.interactions.tap_action.url.action);
    this.#toggleFieldDisable(CARD.editor.keyMappings.navigation_path, curTapAction !== CARD.interactions.tap_action.navigate.action);

    // Theme
    this.#toggleFieldDisable(CARD.editor.keyMappings.theme, !!this.#config.theme);

    // Entity & max_value
    const curEntity = new EntityOrValue();
    curEntity.value = this.#config.entity; // 1st Entity management
    if (this.#previous.entity !== this.#config.entity && curEntity.hasAttribute) {
      this.#previous.entity = this.#config.entity;
      this.#updateChoices(this.#elements[CARD.editor.keyMappings.attribute], CARD.editor.fields.attribute.type, Object.keys(curEntity.attributes));
    }
    if (
      this.#config.attribute &&
      curEntity.hasAttribute &&
      Object.hasOwn(curEntity.attributes, this.#config.attribute) &&
      this.#elements[CARD.editor.keyMappings.attribute].value !== this.#config.attribute
    ) {
      this.#elements[CARD.editor.keyMappings.attribute].value = this.#config.attribute;
    }
    if (
      this.#config.attribute === undefined &&
      curEntity.hasAttribute &&
      this.#elements[CARD.editor.keyMappings.attribute].value !== curEntity.defaultAttribute
    ) {
      const newConfig = Object.assign({}, this.#config);
      newConfig[CARD.editor.keyMappings.attribute] = curEntity.defaultAttribute;
      this.#sendNewConfig(newConfig);
    }
    this.#toggleFieldDisable(EDITOR_INPUT_FIELDS.basicConfiguration.attribute.isInGroup, !curEntity.hasAttribute);

    curEntity.value = this.#config.max_value; // max value
    if (this.#previous.max_value !== this.#config.max_value && curEntity.hasAttribute) {
      this.#previous.max_value = this.#config.max_value;
      this.#updateChoices(
        this.#elements[CARD.editor.keyMappings.max_value_attribute],
        CARD.editor.fields.max_value_attribute.type,
        Object.keys(curEntity.attributes)
      );
    }
    if (
      this.#config.max_value_attribute &&
      curEntity.hasAttribute &&
      Object.hasOwn(curEntity.attributes, this.#config.max_value_attribute) &&
      this.#elements[CARD.editor.keyMappings.max_value_attribute].value !== this.#config.max_value_attribute
    ) {
      this.#elements[CARD.editor.keyMappings.max_value_attribute].value = this.#config.max_value_attribute;
    }
    if (
      this.#config.max_value_attribute === undefined &&
      curEntity.hasAttribute &&
      this.#elements[CARD.editor.keyMappings.max_value_attribute].value !== curEntity.defaultAttribute
    ) {
      const newConfig = Object.assign({}, this.#config);
      newConfig[CARD.editor.keyMappings.max_value_attribute] = curEntity.defaultAttribute;
      this.#sendNewConfig(newConfig);
    }
    this.#toggleFieldDisable(EDITOR_INPUT_FIELDS.content.field.max_value_attribute.isInGroup, !curEntity.hasAttribute);

    const keysArray = ['icon', 'name', 'secondary_info', 'progress_bar'];
    keysArray.forEach((currentKey) => {
      if (this.#config.hide && this.#config.hide.includes(currentKey)) {
        this.#elements['toggle_' + currentKey].checked = false;
      } else {
        this.#elements['toggle_' + currentKey].checked = true;
      }
    });

    if (this.#config.disable_unit !== undefined && this.#config.disable_unit === true) {
      this.#elements.toggle_unit.checked = false;
    } else {
      this.#elements.toggle_unit.checked = true;
    }
  }

  #onChanged(event) {
    debugLog('👉 editor.#onChanged()');
    debugLog('  📎 event: ', event);
    debugLog('  📎 event.target.id: ', event.target.id);
    this.#sendMessageForUpdate(event);
  }

  #addEventListener() {
    debugLog('👉 editor.#addEventListener');
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
  }

  #addEventListenerFor(name, type) {
    debugLog(`👉 Editor.#addEventListenerFor(${name}, ${type})`);
    const isHASelect = CARD.editor.fields[type]?.element === CARD.editor.fields.select.element;
    const events = isHASelect ? CARD.interactions.event.HASelect : CARD.interactions.event.other;

    if (isHASelect) {
      this.#elements[name].addEventListener(CARD.interactions.event.closed, (event) => {
        event.stopPropagation();
      });
    }
    events.forEach((eventType) => {
      this.#elements[name].addEventListener(eventType, this.#onChanged.bind(this));
    });
  }

  #sendMessageForUpdate(changedEvent) {
    debugLog('👉 editor.#sendMessageForUpdate()');
    debugLog('  📎 ', changedEvent);
    debugLog(`      ${changedEvent.target.id} -> ${changedEvent.target.value}`);
    const newConfig = Object.assign({}, this.#config);

    switch (changedEvent.target.id) {
      case EDITOR_INPUT_FIELDS.basicConfiguration.entity.name:
      case EDITOR_INPUT_FIELDS.basicConfiguration.attribute.name:
      case EDITOR_INPUT_FIELDS.content.field.max_value_attribute.name:
      case EDITOR_INPUT_FIELDS.content.field.name.name:
      case EDITOR_INPUT_FIELDS.content.field.unit.name:
      case EDITOR_INPUT_FIELDS.theme.field.bar_color.name:
      case EDITOR_INPUT_FIELDS.theme.field.bar_size.name:
      case EDITOR_INPUT_FIELDS.theme.field.color.name:
      case EDITOR_INPUT_FIELDS.theme.field.icon.name:
      case EDITOR_INPUT_FIELDS.theme.field.layout.name:
      case EDITOR_INPUT_FIELDS.theme.field.theme.name:
        if (changedEvent.target.value === undefined || changedEvent.target.value === null || changedEvent.target.value.trim() === '') {
          delete newConfig[changedEvent.target.id];
        } else {
          newConfig[changedEvent.target.id] = changedEvent.target.value;
        }
        break;
      case EDITOR_INPUT_FIELDS.content.field.decimal.name:
      case EDITOR_INPUT_FIELDS.content.field.min_value.name: {
        const curValue = parseFloat(changedEvent.target.value);
        if (isNaN(curValue)) {
          delete newConfig[changedEvent.target.id];
        } else {
          newConfig[changedEvent.target.id] = curValue;
        }
        break;
      }
      case EDITOR_INPUT_FIELDS.content.field.max_value.name:
        if (!isNaN(changedEvent.target.value) && changedEvent.target.value.trim() !== '') {
          newConfig[changedEvent.target.id] = parseFloat(changedEvent.target.value);
        } else if (changedEvent.target.value.trim() !== '') {
          newConfig[changedEvent.target.id] = changedEvent.target.value;
        } else {
          delete newConfig[changedEvent.target.id];
        }
        break;
      case EDITOR_INPUT_FIELDS.interaction.field.tap_action.name:
        switch (changedEvent.target.value) {
          case CARD.interactions.tap_action.default:
            delete newConfig.tap_action;
            break;
          case CARD.interactions.tap_action.moreInfo.action:
            newConfig.tap_action = CARD.interactions.tap_action.moreInfo;
            break;
          case CARD.interactions.tap_action.navigate.action:
            newConfig.tap_action = CARD.interactions.tap_action.navigate;
            break;
          case CARD.interactions.tap_action.url.action:
            newConfig.tap_action = CARD.interactions.tap_action.url;
            break;
          case CARD.interactions.tap_action.none.action:
            newConfig.tap_action = CARD.interactions.tap_action.none;
            break;
        }
        break;
      case EDITOR_INPUT_FIELDS.interaction.field.navigation_path.name:
      case EDITOR_INPUT_FIELDS.interaction.field.url_path.name:
        newConfig.tap_action[changedEvent.target.id] = changedEvent.target.value;
        break;
      case EDITOR_INPUT_FIELDS.theme.field.toggleBar.name:
      case EDITOR_INPUT_FIELDS.theme.field.toggleIcon.name:
      case EDITOR_INPUT_FIELDS.theme.field.toggleName.name:
      case EDITOR_INPUT_FIELDS.theme.field.toggleSecondaryInfo.name: {
        const newState = !changedEvent.srcElement.checked;
        const key = changedEvent.target.id.replace('toggle_', '');
        debugLog('  📌 ', newState);
        if (changedEvent.srcElement.checked) {
          if (!Object.hasOwn(newConfig, 'hide')) {
            newConfig.hide = [];
          }
          if (!newConfig.hide.includes(key)) {
            newConfig.hide.push(key);
          }
        } else if (Object.hasOwn(newConfig, 'hide')) {
          const index = newConfig.hide.indexOf(key);
          if (index !== -1) {
            newConfig.hide.splice(index, 1);
          }
          if (newConfig.hide.length === 0) {
            delete newConfig.hide;
          }
        }
        break;
      }
      case EDITOR_INPUT_FIELDS.theme.field.toggleUnit.name:
        if (changedEvent.srcElement.checked) {
          if (newConfig.disable_unit === undefined || newConfig.disable_unit !== true) {
            newConfig.disable_unit = true;
          }
        } else if (newConfig.disable_unit !== undefined) {
          delete newConfig.disable_unit;
        }
        break;
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
        delete newConfig[curAttribute];
      }
      if (changedEvent.target.id === EDITOR_INPUT_FIELDS.basicConfiguration.entity.name && curEntity.unit && newConfig.unit === undefined) {
        newConfig.unit = curEntity.unit;
      }
    }

    this.#sendNewConfig(newConfig);
  }

  #sendNewConfig(newConfig) {
    if (newConfig.grid_options) {
      const { grid_options, ...rest } = newConfig;
      newConfig = { ...rest, grid_options };
    }
    debugLog('  📎 newConfig: ', newConfig);
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
   * Determines the tap action value based on the current configuration (this.#config).
   */
  #getTapActionValue() {
    const result = (this.#config.tap_action?.action ?? null) === null 
      ? CARD.interactions.tap_action.default 
      : this.#config.tap_action?.action;
    return result;
  }

  /**
   * Update a list of choices to a given `<select>` element based on the specified list type.
   *
   * This method populates the `<select>` element with options according to the provided `type`. The `type`
   * determines the kind of list (e.g., colors, layout, theme, tap actions) and how the options will be displayed.
   *
   * @param {HTMLElement} select - The `<select>` element to which the choices will be added.
   * @param {string} type - The type of list to populate ('layout', 'color', 'theme', or 'tap_action').
   */
  #updateChoices(select, type, choices = null) {
    debugLog('👉 editor.#updateChoices');
    debugLog(`  📎 select: ${select}`);
    debugLog(`  📎 type: ${type}`);
    debugLog(`  📎 choices: ${choices}`);
    select.innerHTML = '';
    
    const list = [CARD.editor.fields.navigation_picker.type, CARD.editor.fields.attribute.type, CARD.editor.fields.max_value_attribute.type].includes(
      type
    )
      ? choices
      : FIELD_OPTIONS[type];
    if (!list) {
      return;
    }
    debugLog('  📌 list: ', list);

    list.forEach((optionData) => {
      if (type === CARD.editor.fields.tap_action.type) {
        debugLog(optionData);
      }
      const option = document.createElement(CARD.editor.fields.listItem.element);
      const value = optionData.value !== undefined ? optionData.value : optionData;
      option.setAttribute('value', String(value));


      switch (type) {
        case CARD.editor.fields.color.type: {
          const container = document.createElement('div');
          Object.assign(container.style, {
            display: 'flex',
            alignItems: 'center',
          });
          const colorDot = document.createElement(CARD.editor.fields.colorDot.element);
          colorDot.classList.add(CARD.editor.fields.colorDot.class);
          colorDot.style.backgroundColor = optionData.value;
          const label = document.createElement(CARD.editor.fields.text.element);
          label.textContent = optionData.label[this.#currentLanguage];
          container.appendChild(colorDot);
          container.appendChild(label);
          option.innerHTML = '';
          option.appendChild(container);
          break;
        }
        case CARD.editor.fields.layout.type:
        case CARD.editor.fields.theme.type:
        case CARD.editor.fields.bar_size.type:
        case CARD.editor.fields.navigation_picker.type: {
          const label = type !== CARD.editor.fields.navigation_picker.type ? optionData.label[this.#currentLanguage] : optionData.label;
          const haIcon = document.createElement(CARD.editor.fields.iconItem.element);
          haIcon.setAttribute(CARD.editor.fields.iconItem.attribute, optionData.icon);
          haIcon.classList.add(CARD.editor.fields.iconItem.class);
          option.appendChild(haIcon);
          option.append(label);
          break;
        }
        case CARD.editor.fields.tap_action.type:
          option.innerHTML = `${optionData.label[this.#currentLanguage]}`;
          break;
        case CARD.editor.fields.attribute.type:
        case CARD.editor.fields.max_value_attribute.type:
          option.innerHTML = `${optionData}`;
          break;
      }
      select.appendChild(option);
    });

  }

  /**
   * Creates a form field based on the provided configuration and appends it to a container.
   */
  #createField({ name, label, type, required, isInGroup, description, width }) {
    let inputElement;
    const value = this.#config[name] ?? '';

    switch (type) {
      case CARD.editor.fields.entity.type:
        inputElement = document.createElement(CARD.editor.fields.entity.element);
        inputElement.hass = this.#hassProvider.hass;
        break;
      case CARD.editor.fields.icon.type:
        inputElement = document.createElement(CARD.editor.fields.icon.element);
        break;
      case CARD.editor.fields.layout.type:
      case CARD.editor.fields.bar_size.type:
      case CARD.editor.fields.theme.type:
      case CARD.editor.fields.color.type:
      case CARD.editor.fields.tap_action.type:
      case CARD.editor.fields.attribute.type:
      case CARD.editor.fields.max_value_attribute.type:
        inputElement = document.createElement(CARD.editor.fields[type].element);
        inputElement.popperOptions = '';
        this.#updateChoices(inputElement, type);
        break;
      case CARD.editor.fields.navigation_picker.type:
        inputElement = document.createElement(CARD.editor.fields.navigation_picker.element);
        inputElement.popperOptions = '';

        this.#hassProvider
          .getLovelaceViews()
          .then((views) => {
            debugLog('✅ Lovelace Views: ', views); // ✅ Affiche les vues une fois récupérées
            this.#updateChoices(inputElement, CARD.editor.fields.navigation_picker.type, views);
            if (this.#config.tap_action !== undefined && this.#config.tap_action.navigation_path !== undefined) {
              inputElement.value = this.#config.tap_action.navigation_path;
              debugLog('✅ Update navigate selection'); // ✅ Affiche les vues une fois récupérées
            }
          })
          .catch((error) => {
            debugLog('❌ Error:', error);
          });
        break;
      case CARD.editor.fields.number.type:
        inputElement = document.createElement(CARD.editor.fields.number.element);
        inputElement.type = CARD.editor.fields.number.type;
        break;
      case CARD.editor.fields.toggle.type: {
        inputElement = document.createElement(CARD.editor.fields.container.element);
        inputElement.style.display = 'flex';
        inputElement.style.alignItems = 'center';
        inputElement.style.gap = '8px';

        const toggleLabel = document.createElement(CARD.editor.fields.text.element);
        toggleLabel.textContent = label;

        const toggle = document.createElement(CARD.editor.fields.toggle.element);
        toggle.setAttribute('checked', true);
        toggle.id = name;

        inputElement.appendChild(toggleLabel);
        inputElement.appendChild(toggle);

        this.#elements[name] = toggle;
        return inputElement; //break;
      }
      default:
        inputElement = document.createElement(CARD.editor.fields.default.element);
        inputElement.type = CARD.editor.fields.default.type;
        break;
    }

    this.#elements[name] = inputElement;
    inputElement.style.width = '100%';
    inputElement.required = required;
    inputElement.label = label;
    inputElement.value = value;
    inputElement.id = name;

    const fieldContainer = document.createElement(CARD.editor.fields.fieldContainer.element);
    if (isInGroup) {
      fieldContainer.classList.add(isInGroup);
    }
    fieldContainer.classList.add(CARD.editor.fields.fieldContainer.class);
    fieldContainer.style.width = width;

    const fieldDescription = document.createElement(CARD.editor.fields.fieldDescription.element);
    fieldDescription.classList.add(CARD.editor.fields.fieldDescription.class);
    fieldDescription.innerText = description;

    fieldContainer.appendChild(inputElement);
    fieldContainer.appendChild(fieldDescription);

    return fieldContainer;
  }

  #makeHelpIcon() {
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
    const accordionContent = this.#accordionContent[index];
    accordionContent.classList.toggle('expanded');
  }

  /**
   * Author: Thomas Loven
   * see:
   *  - https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
   *  - https://gist.github.com/thomasloven/5f965bd26e5f69876890886c09dd9ba8
   *
   * Dynamically loads the `ha-entity-picker` component if it is not already defined.
   *
   * This function checks if the `ha-entity-picker` custom element is already registered
   * in the browser. If it is not registered, it dynamically loads it by using
   * Home Assistant's `loadCardHelpers` utility. Once loaded, it creates a temporary
   * `entities` card element to ensure that the `ha-entity-picker` element is properly
   * defined and ready for use. Afterward, it retrieves the configuration element
   * for the picker by calling `getConfigElement()`.
   *
   * This is typically done when the editor is being initialized and the entity picker
   * is required but hasn't been loaded yet.
   *
   * @returns {Promise<void>} A promise that resolves when the `ha-entity-picker`
   *         component is successfully loaded and available.
   */
  async loadEntityPicker() {
    if (!window.customElements.get(CARD.editor.fields.entity.element)) {
      const ch = await window.loadCardHelpers();
      const c = await ch.createCardElement({ type: 'entities', entities: [] });
      await c.constructor.getConfigElement();
      // eslint-disable-next-line no-unused-vars
      const haEntityPicker = window.customElements.get(CARD.editor.fields.entity.element);
    }
  }

  #renderFields(parent, inputFields) {
    Object.values(inputFields).forEach((field) => {
      debugLog('#renderFields - field: ', field);
      parent.appendChild(
        this.#createField({
          name: field.name,
          label: field.label[this.#currentLanguage],
          type: field.type,
          required: field.required,
          isInGroup: field.isInGroup,
          description: field.description !== undefined ? field.description[this.#currentLanguage] : null,
          width: field.width,
        })
      );
    });
  }

  #renderAccordion(parent, inputFields) {
    const accordionItem = document.createElement(CARD.editor.fields.accordion.item.element);
    accordionItem.classList.add(CARD.editor.fields.accordion.item.class);
    const index = this.#accordionContent.push(accordionItem) - 1;

    const accordionTitle = document.createElement(CARD.editor.fields.accordion.title.element);
    accordionTitle.classList.add(CARD.editor.fields.accordion.title.class);
    const icon = document.createElement(CARD.editor.fields.accordion.icon.element);
    icon.setAttribute('icon', inputFields.title.icon);
    icon.classList.add(CARD.editor.fields.accordion.icon.class);
    accordionTitle.appendChild(icon);

    const title = document.createTextNode(inputFields.title.label[this.#currentLanguage]);
    accordionTitle.appendChild(title);

    const accordionArrow = document.createElement(CARD.editor.fields.accordion.arrow.element);
    accordionArrow.classList.add(CARD.editor.fields.accordion.arrow.class);
    accordionArrow.setAttribute('icon', CARD.editor.fields.accordion.arrow.icon);
    accordionTitle.appendChild(accordionArrow);

    accordionTitle.addEventListener(CARD.interactions.event.click, () => {
      this.toggleAccordion(index);
    });
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
    this.#renderAccordion(this.#container, EDITOR_INPUT_FIELDS.content);
    this.#renderAccordion(this.#container, EDITOR_INPUT_FIELDS.interaction);
    this.#renderAccordion(this.#container, EDITOR_INPUT_FIELDS.theme);

    this.#container.appendChild(this.#makeHelpIcon());
    fragment.appendChild(this.#container);
    this.shadowRoot.appendChild(fragment);
  }
}

/** --------------------------------------------------------------------------
 * Registers the custom element for the EntityProgressCardEditor editor.
 */
customElements.define(CARD.meta.editor, EntityProgressCardEditor);
