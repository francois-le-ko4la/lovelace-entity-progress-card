/**
 * @fileoverview
 * 
 * This file defines a custom element `EntityProgressCard` for displaying 
 * progress or status information about an entity in Home Assistant. 
 * The card displays visual elements like icons, progress bars, and other dynamic content 
 * based on the state of the entity and user configurations.
 * 
 * The file includes the following:
 * - Class `EntityProgressCard`: Defines the behavior and structure of the card element.
 * - Class `EntityProgressCardEditor`: Defines the editor UI for configuring the card's properties.
 * - Methods for dynamically updating the card's elements based on entity state (e.g., battery level).
 * - Methods to support entity picker and configuration fields.
 * 
 * The primary functionality is centered around:
 * 1. Creating and rendering the custom card element with configurable properties.
 * 2. Handling dynamic updates to the card based on the state of the associated entity.
 * 3. Providing an editor interface for customizing the card's configuration in the Home Assistant UI.
 * 
 * Main Classes:
 * - `EntityProgressCard`: The main card element displaying entity status.
 * - `EntityProgressCardEditor`: The configuration editor for the `EntityProgressCard`.
 * 
 * Key Features:
 * - Dynamic content update (e.g., progress bar, icons) based on entity state.
 * - Support for theme and layout customization.
 * - Error handling for missing or invalid entities.
 * - Configuration options for various card elements, including entity picker, color settings, and layout options.
 * 
 * @version 1.0.24
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION='1.0.24';
const CARD = {
    typeName: 'entity-progress-card',
    name: 'Entity progress card',
    description: 'A cool custom card to show current entity status with a progress bar.',
    editor: 'entity-progress-card-editor',
    layout: {
        horizontal: {
            label: 'horizontal',
            value: { grid_rows: 1, grid_min_rows: 1, grid_columns: 2, grid_min_columns: 2 },
            mdi: "focus-field-horizontal"
        },
        vertical:{
            label: 'vertical',
            value: { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 },
            mdi: "focus-field-vertical"
        },
    },
    tap_action: {
        no_action: "no_action",
        navigate_to: "navigate_to",
        more_info:"show_more_info"
    },
    config: {
        language: "en",
        minValue: 0,
        maxPercent: 100,
        unit: '%',
        color: 'var(--state-icon-color)',
        showMoreInfo: true,
        decimal: {
            percentage: 0,
            other: 2
        }
    },
    debounce: 100,
    debug: false,
};

CARD.console = {
    message: `%c✨${CARD.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
    css: 'color:orange; background-color:black; font-weight: bold;',
    link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card'
};

// Constants for DOM element selectors
const SELECTORS = {
    container: 'container',
    left: 'left',
    right: 'right',
    icon: 'icon',
    shape: 'shape',
    name: 'name',
    percentage: 'percentage',
    secondaryInfo: 'secondary_info',
    progressBar: 'progress-bar',
    progressBarInner: 'progress-bar-inner',
    ha_shape: 'ha-shape',
    ha_icon: 'ha-icon',
    alert: 'ha-alert'
};

const CARD_HTML = `
    <!-- Main container -->
    <div class="${SELECTORS.container}">
        <!-- Section gauche avec l'icône -->
        <div class="${SELECTORS.left}">
            <${SELECTORS.ha_shape} class="${SELECTORS.shape}"></${SELECTORS.ha_shape}>
            <${SELECTORS.ha_icon} class="${SELECTORS.icon}"></${SELECTORS.ha_icon}>
        </div>

        <!-- Section droite avec le texte -->
        <div class="${SELECTORS.right}">
            <div class="${SELECTORS.name}"></div>
            <div class="${SELECTORS.secondaryInfo}">
                <div class="${SELECTORS.percentage}"></div>
                <div class="${SELECTORS.progressBar}">
                    <div class="${SELECTORS.progressBarInner}"></div>
                </div>         
            </div>   
        </div>
    </div>
    <!-- HA Alert -->
    <${SELECTORS.alert} type="error"></${SELECTORS.alert}>
`;

const CARD_CSS=`
    ha-card {
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start; /* Aligner tous les éléments à gauche */
        padding: 0;
        box-sizing: border-box;
        border-radius: 8px;
        margin: 0 auto;
    }

    /* main container */
    .${SELECTORS.container} {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 7px 10px;
        gap: 10px;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    /* .left: icon & shape */
    .${SELECTORS.left} {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
    }

    .${SELECTORS.shape} {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: var(--state-icon-color);
        opacity: 0.2;
    }

    .${SELECTORS.icon} {
        position: relative;
        z-index: 1;
        width: 24px;
        height: 24px;
    }

    /* .right: name & percentage */
    .${SELECTORS.right} {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
        overflow: hidden;
        width:100%;
    }

    .${SELECTORS.name} {
        font-size: 1em;
        font-weight: bold;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }

    .${SELECTORS.secondaryInfo} {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
    }

    .${SELECTORS.percentage} {
        font-size: 0.9em;
        color: var(--primary-text-color);
        min-width: 40px;
        text-align: left;
    }

    /* Progress bar */
    .${SELECTORS.progressBar} {
        flex-grow: 1;
        height: 8px;
        max-height: 8px;
        background-color: var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .${SELECTORS.progressBarInner} {
        height: 100%;
        width: 75%;
        background-color: var(--primary-color);
        transition: width 0.3s ease;
    }

    ${SELECTORS.alert} {
        display: none;
        position: absolute;
        top: -1px;
        left: -2px;
        width: 105%;
        height: 110%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: black;
        z-index: 10;
    }
    `;

const HTML = {
    block: {
        show: 'block',
        hide: 'none',
    },
    flex: {
        show: 'block',
        hide: 'none',
    },
};

const THEME = {
    battery: [
        { icon: 'mdi:battery-alert',     color: 'var(--red-color)'    },   // Pourcentage < 10
        { icon: 'mdi:battery-alert',     color: 'var(--red-color)'    },   // Pourcentage >= 10
        { icon: 'mdi:battery-20',        color: 'var(--orange-color)' },   // Pourcentage >= 20
        { icon: 'mdi:battery-30',        color: 'var(--orange-color)' },   // Pourcentage >= 30
        { icon: 'mdi:battery-40',        color: 'var(--orange-color)' },   // Pourcentage >= 40
        { icon: 'mdi:battery-50',        color: 'var(--yellow-color)' },   // Pourcentage >= 50
        { icon: 'mdi:battery-60',        color: 'var(--yellow-color)' },   // Pourcentage >= 60
        { icon: 'mdi:battery-70',        color: 'var(--yellow-color)' },   // Pourcentage >= 70
        { icon: 'mdi:battery-80',        color: 'var(--green-color)'  },   // Pourcentage >= 80
        { icon: 'mdi:battery-90',        color: 'var(--green-color)'  },   // Pourcentage >= 90
        { icon: 'mdi:battery',           color: 'var(--green-color)'  }    // Pourcentage >= 100
    ],
    light: [
        { icon: 'mdi:lightbulb-outline', color: '#4B4B4B'},   // Pourcentage < 25
        { icon: 'mdi:lightbulb-outline', color: '#877F67'},   // Pourcentage >= 25
        { icon: 'mdi:lightbulb',         color: '#C3B382'},   // Pourcentage >= 50
        { icon: 'mdi:lightbulb',         color: '#FFE79E'},   // Pourcentage >= 75
        { icon: 'mdi:lightbulb',         color: '#FFE79E'}    // Pourcentage >= 100
    ]
};

const MSG = {
    en: {
        entityError: "entity: The 'entity' parameter is required!",
        entityNotFound: "entity: Entity not found in Home Assistant.",
        entityUnavailable: "unavailable",
        minValueError: "min_value: Check your min_value.",
        maxValueError: "max_value: Check your max_value.",
        decimalError: "decimal: Decimal value cannot be negative."
    },
    fr: {
        entityError: "entity: Le paramètre 'entity' est requis !",
        entityNotFound: "entity: Entité introuvable dans Home Assistant.",
        entityUnavailable: "indisponible",
        minValueError: "min_value: Vérifiez votre min_value.",
        maxValueError: "max_value: Vérifiez votre max_value.",
        decimalError: "decimal: La valeur décimale ne peut pas être négative."
    },
    es: {
        entityError: "entity: ¡El parámetro 'entity' es obligatorio!",
        entityNotFound: "entity: Entidad no encontrada en Home Assistant.",
        entityUnavailable: "no disponible",
        minValueError: "max_value: Verifique su min_value.",
        maxValueError: "max_value: Verifique su max_value.",
        decimalError: "decimal: El valor decimal no puede ser negativo."
    },
    de: {
        entityError: "entity: Der Parameter 'entity' ist erforderlich!",
        entityNotFound: "entity: Entität in Home Assistant nicht gefunden.",
        entityUnavailable: "nicht verfügbar",
        minValueError: "max_value: Überprüfen Sie Ihren min_value.",
        maxValueError: "max_value: Überprüfen Sie Ihren max_value.",
        decimalError: "decimal: Der Dezimalwert darf nicht negativ sein."
    },
};


const THEME_KEY = "theme";
const NAVIGATETO_KEY = "navigate_to";
const TAP_ACTION_KEY = "tap_action";

const FIELD_TYPE = {
    entity: { type: 'entity', tag: 'ha-entity-picker'},
    icon: { type: 'icon', tag: 'ha-icon-picker'},
    layout: { type: 'layout', tag: 'ha-select'},
    tap_action: { type: 'tap_action', tag: 'ha-select'},
    theme: { type: 'theme', tag: 'ha-select'},
    color: { type: 'color', tag: 'ha-select'},
    number: { type: 'number', tag: 'ha-textfield'},
    default: { type: 'text', tag: 'ha-textfield'},
    listItem: { type: 'list item', tag: 'mwc-list-item'},
}

const EDITOR_INPUT_FIELDS = {
    entity: {       name: 'entity',
                    label: { en: 'Entity', fr: 'Entité', es: 'Entidad', de: 'Entität', },
                    type: FIELD_TYPE.entity.type,
                    width: '92%',
                    required: true,
                    isInGroup: null,
                    description: {
                        en: 'Select an entity from Home Assistant.',
                        fr: 'Sélectionnez une entité de Home Assistant.',
                        es: 'Seleccione una entidad de Home Assistant.',
                        de: 'Wählen Sie eine Entität aus Home Assistant.',
                    }},
    name: {         name: 'name',
                    label: { en: 'Name', fr: 'Nom', es: 'Nombre', de: 'Name', },
                    type: FIELD_TYPE.default.type,
                    width: '48%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter a name for the entity.',
                        fr: 'Saisissez un nom pour l\'entité.',
                        es: 'Introduzca un nombre para la entidad.',
                        de: 'Geben Sie einen Namen für die Entität ein.',
                    }},
    unit: {         name: 'unit',
                    label: { en: 'Unit', fr: 'Unité', es: 'Nombre', de: 'Name', },
                    type: FIELD_TYPE.default.type,
                    width: '15%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'm, kg...',
                        fr: 'm, kg...',
                        es: 'm, kg...',
                        de: 'm, kg...',
                    }},
    decimal: {      name: 'decimal',
                    label: { en: 'decimal', fr: 'decimal', es: 'decimal', de: 'decimal', },
                    type: FIELD_TYPE.number.type,
                    width: '25%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Precision.',
                        fr: 'Précision.',
                        es: 'Precisión.',
                        de: 'Präzision.',
                    }},
    min_value: {    name: 'min_value',
                    label: { en: 'Minimum value', fr: 'Valeur minimum', es: 'Nombre', de: 'Name', },
                    type: FIELD_TYPE.number.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter the minimum value.',
                        fr: 'Saisissez la valeur minimum.',
                        es: 'Introduzca el valor mínimo.',
                        de: 'Geben Sie den Mindestwert ein.',
                    }},
    max_value: {    name: 'max_value',
                    label: { en: 'Maximum value', fr: 'Valeur maximum', es: 'Nombre', de: 'Name', },
                    type: FIELD_TYPE.default.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter the maximum value.',
                        fr: 'Saisissez la valeur maximum.',
                        es: 'Introduzca el valor máximo.',
                        de: 'Geben Sie den Höchstwert ein.',
                    }},
    tap_action: {   name: 'tap_action',
                    label: { en: 'Tap action', fr: 'Action au tap', es: 'Acción al tocar', de: 'Tippen Aktion', },
                    type: FIELD_TYPE.tap_action.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select the action.',
                        fr: 'Sélectionnez l\'action.',
                        es: 'Seleccione la acción.',
                        de: 'Wählen Sie die Aktion.'
                    }},
    navigate_to: {  name: NAVIGATETO_KEY,
                    label: { en: 'Navigate to...', fr: 'Naviguer vers...', es: 'Navegar a...', de: 'Navigieren zu...',  },
                    type: FIELD_TYPE.default.type,
                    width: '45%',
                    required: false,
                    isInGroup: NAVIGATETO_KEY,
                    description: {
                        en: 'Select the target (/lovelace/0).',
                        fr: 'Saisir la cible (/lovelace/0).',
                        es: 'Seleccione el objetivo (/lovelace/0).',
                        de: 'Wählen Sie das Ziel (/lovelace/0).'
                    }},
    theme: {        name: 'theme',
                    label: { en: 'Theme', fr: 'Thème', es: 'Tema', de: 'Thema', },
                    type: FIELD_TYPE.theme.type,
                    width: '92%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select a theme to automatically define the colors and icon.',
                        fr: 'Sélectionnez un thème pour définir automatiquement les couleurs et l\'icône.',
                        es: 'Seleccione un tema para definir automáticamente los colores y el icono.',
                        de: 'Wählen Sie ein Thema, um die Farben und das Symbol automatisch festzulegen.',
                    }},
    layout: {       name: 'layout',
                    label: { en: 'Layout', fr: 'Disposition', es: 'Disposición', de: 'Layout', },
                    type: FIELD_TYPE.layout.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select the layout.',
                        fr: 'Sélectionnez la disposition.',
                        es: 'Seleccione la disposición.',
                        de: 'Wählen Sie das Layout.',
                    }},
    bar_color: {    name: 'bar_color',
                    label: { en: 'Color for the bar', fr: 'Couleur de la barre', es: 'Color de la barra', de: 'Farbe für die Leiste', },
                    type: FIELD_TYPE.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select the color for the bar.',
                        fr: 'Sélectionnez la couleur de la barre.',
                        es: 'Seleccione el color de la barra.',
                        de: 'Wählen Sie für die Leiste.',
                    }},
    icon: {         name: 'icon',
                    label: { en: 'Icon', fr: 'Icône', es: 'Icono', de: 'Symbol', },
                    type: FIELD_TYPE.icon.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select an icon for the entity.',
                        fr: 'Sélectionnez une icône pour l\'entité.',
                        es: 'Seleccione un icono para la entidad.',
                        de: 'Wählen Sie ein Symbol für die Entität.',
                    }},
    color: {        name: 'color',
                    label: { en: 'Primary color', fr: 'Couleur de l\'icône', es: 'Color del icono', de: 'Primärfarbe', },
                    type: FIELD_TYPE.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select the primary color for the icon.',
                        fr: 'Sélectionnez la couleur de l\'icône.',
                        es: 'Seleccione el color principal del icono.',
                        de: 'Wählen Sie die Primärfarbe für das Symbol.',
                    }},
};

const THEME_OPTION = [
    { name: '', value: '' },
    ...Object.keys(THEME).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: key
    }))
];

const COLOR_OPTION = [
    { name: 'Default', value: 'var(--state-icon-color)' },
    { name: 'Accent', value: 'var(--accent-color)' },
    { name: 'Info', value: 'var(--info-color)' },
    { name: 'Success', value: 'var(--success-color)' },
    { name: 'Disable', value: 'var(--disabled-color)' },
    { name: 'Red', value: 'var(--red-color)' },
    { name: 'Pink', value: 'var(--pink-color)' },
    { name: 'Purple', value: 'var(--purple-color)' },
    { name: 'Deep purple', value: 'var(--deep-purple-color)' },
    { name: 'Indigo', value: 'var(--indigo-color)' },
    { name: 'Blue', value: 'var(--blue-color)' },
    { name: 'Light blue', value: 'var(--light-blue-color)' },
    { name: 'Cyan', value: 'var(--cyan-color)' },
    { name: 'Teal', value: 'var(--teal-color)' },
    { name: 'Green', value: 'var(--green-color)' },
    { name: 'Light green', value: 'var(--light-green-color)' },
    { name: 'Lime', value: 'var(--lime-color)' },
    { name: 'Yellow', value: 'var(--yellow-color)' },
    { name: 'Amber', value: 'var(--amber-color)' },
    { name: 'Orange', value: 'var(--orange-color)' },
    { name: 'Deep orange', value: 'var(--deep-orange-color)' },
    { name: 'Brown', value: 'var(--brown-color)' },
    { name: 'Light grey', value: 'var(--light-grey-color)' },
    { name: 'Grey', value: 'var(--grey-color)' },
    { name: 'Dark grey', value: 'var(--dark-grey-color)' },
    { name: 'Blue grey', value: 'var(--blue-grey-color)' },
    { name: 'Black', value: 'var(--black-color)' },
    { name: 'White', value: 'var(--white-color)' }
];

const LAYOUT_OPTION = {
    en: [
        { value: CARD.layout.horizontal.label, name: 'Horizontal (default)' },
        { value: CARD.layout.vertical.label,   name: 'Vertical' }
    ],
    fr: [
        { value: CARD.layout.horizontal.label, name: 'Horizontal (par défaut)' },
        { value: CARD.layout.vertical.label,   name: 'Vertical' }
    ],
    es: [
        { value: CARD.layout.horizontal.label, name: 'Horizontal (predeterminado)' },
        { value: CARD.layout.vertical.label,   name: 'Vertical' }
    ],
    de: [
        { value: CARD.layout.horizontal.label, name: 'Horizontal (Standard)' },
        { value: CARD.layout.vertical.label,   name: 'Vertikal' }
    ]
};

const TAP_ACTION = {
    en: [
        { value: CARD.tap_action.more_info,   name: 'More info (default)' },
        { value: CARD.tap_action.navigate_to, name: 'Navigate to...' },
        { value: CARD.tap_action.no_action,   name: 'No action' },
    ],
    fr: [
        { value: CARD.tap_action.more_info,   name: 'Plus d\'infos (par défaut)' },
        { value: CARD.tap_action.navigate_to, name: 'Naviguer vers...' },
        { value: CARD.tap_action.no_action,   name: 'Aucune action' },
    ],
    es: [
        { value: CARD.tap_action.more_info,   name: 'Más información (predeterminado)' },
        { value: CARD.tap_action.navigate_to, name: 'Navegar a...' },
        { value: CARD.tap_action.no_action,   name: 'Sin acción' },
    ],
    de: [
        { value: CARD.tap_action.more_info,   name: 'Mehr Infos (Standard)' },
        { value: CARD.tap_action.navigate_to, name: 'Zu navigieren...' },
        { value: CARD.tap_action.no_action,   name: 'Keine Aktion' },
    ]
};

/** --------------------------------------------------------------------------
 * 
 * Represents a custom card element displaying the progress of an entity.
 * 
 * The `EntityProgressCard` class extends the base `HTMLElement` class and 
 * implements a custom web component that displays information about an entity's 
 * state, typically showing a progress bar or other dynamic elements. This card 
 * updates its visual state based on the entity's current value, and it is capable 
 * of handling different layouts and themes for better adaptability within the UI.
 * 
 * The component also provides error handling and can display an error message 
 * when the specified entity is not found or there is an issue with retrieving 
 * its state.
 * 
 * The card's layout and appearance can be customized based on configuration 
 * settings, such as the color scheme, icon, and the display format of the progress.
 * 
 * Example usage:
 * <entity-progress-card></entity-progress-card>
 */
class EntityProgressCard extends HTMLElement {
    /**
     * Constructor for the EntityProgressCard component.
     * 
     * - Initializes the Shadow DOM in 'open' mode for encapsulation.
     * - Logs a one-time installation message and README link in the console 
     *   when the component is first loaded (using `_moduleLoaded` to track state).
     * - Sets the default language.
     * - Initializes properties to manage the component's internal state:
     *   - `_elements`: An object to store references to DOM elements within the component.
     *   - `_isBuilt`: A flag to track whether the component has been built or not.
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        if (!EntityProgressCard._moduleLoaded) {
            console.groupCollapsed(
                CARD.console.message,
                CARD.console.css
            );
            console.log(CARD.console.link);
            console.groupEnd();
            EntityProgressCard._moduleLoaded = true;
        }
        this.config = {};
        this._currentLanguage = CARD.config.language;
        this._unit = null;
        this._min_value = null;
        this._max_value = null;
        this._decimal = null;
        this._show_more_info = null;
        this._navigate_to = null;
        this._elements = {};
        this._isBuilt = false;
        this.addEventListener('click', this._navigateToOrShowMoreInfo.bind(this));
    }

    /**
     * Trigger the "more info" dialog for a specific Home Assistant entity.
     *
     * This method dispatches a custom event (`hass-more-info`) that is handled by Home Assistant
     * to display the details of the entity specified in the card configuration (`this.config.entity`).
     *
     * Preconditions:
     * - `this._show_more_info` must be true.
     * - `this.config.entity` must be defined and contain a valid entity ID.
     */
    _navigateToOrShowMoreInfo() {
        if (this._navigate_to) {
            if (/^https?:\/\//.test(this._navigate_to)) {
                window.location.href = this._navigate_to;
            } else {
                window.history.pushState(null, '', this._navigate_to);
                this.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
        
                const anchor = this._navigate_to.split('#')[1];
                if (anchor) {
                    const element = document.querySelector(`#${anchor}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        } else if (this._show_more_info && this.config && this.config.entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
                bubbles: true,
                composed: true,
                detail: { entityId: this.config.entity },
            }));
        }
    }

    /**
     * Creates and returns a new configuration element for the component.
     * 
     * This static method is used to dynamically generate an instance of the 
     * editor element, identified by the constant `CARD.editor`. The returned 
     * element can be used for configuring the component's behavior or settings.
     * 
     * @returns {HTMLElement} A newly created configuration element.
     */
    static getConfigElement() {
        return document.createElement(CARD.editor);
    }

    /**
     * Updates the component's configuration and triggers static changes.
     * 
     * - **Initial Build:** If the card has not been built yet, it calls `_buildCard()` to construct it.
     * - **Layout Changes:** If the `layout` property has changed, it calls `_changeLayout()` 
     *   to update the card's layout.
     * 
     * **Note:** Dynamic Updates will be done in set hass function.
     * 
     * @param {Object} config - The new configuration object.
     */
    setConfig(config) {
        const layoutChanged    = this.config?.layout !== config.layout;
        this.config            = config;
        this._min_value        = this.config.min_value      || CARD.config.minValue;
        this._max_value        = this.config.max_value      || null;
        this._unit             = this.config.unit           || CARD.config.unit;
        this._show_more_info   = this.config.show_more_info ?? CARD.config.showMoreInfo;
        this._navigate_to      = this.config.navigate_to    || null;

        if (!this._isBuilt) {
            this._isBuilt = true;
            this._buildCard();
        }

        if (layoutChanged) {
            this._changeLayout();
        }

    }

    /**
     * Sets the Home Assistant (`hass`) instance and updates dynamic elements.
     * 
     * This setter is called whenever the Home Assistant instance (`hass`) is updated. 
     * It :
     * - stores the new `hass` instance in the `_hass` property
     * - Update the this._currentLanguage according to hass.config.language (HA Environment)
     * - triggers a refresh of the dynamic elements within the component by calling
     *   `_updateDynamicElements()`.
     * 
     * @param {Object} hass - The Home Assistant instance containing the current 
     *                        state and services.
     */
    set hass(hass) {
        this._hass             = hass;
        const entity           = this._hass?.entities[this.config.entity];
        const displayPrecision = entity ? entity.display_precision : undefined;
        this._decimal          = this.config.decimal ?? displayPrecision ?? (this._unit === CARD.config.unit ? CARD.config.decimal.percentage : CARD.config.decimal.other);
        this._currentLanguage  = MSG[hass.config.language] ? hass.config.language : CARD.config.language;

        this._updateDynamicElements();
    }

    /**
     * Builds and initializes the structure of the custom card component.
     * 
     * This method creates the visual and structural elements of the card and injects
     * them into the component's Shadow DOM. It performs the following steps:
     * 
     * 1. Creates a wrapper element (`<ha-card>`) with the appropriate class and inner HTML.
     * 2. Adds a `<style>` element containing the card's CSS styles.
     * 3. Injects both the wrapper and style into the Shadow DOM, clearing any existing content.
     * 4. Stores references to important DOM elements in the `_elements` object, allowing
     *    them to be easily updated dynamically during the card's lifecycle.
     * 
     * These DOM elements are identified using predefined selectors (`SELECTORS`) 
     * and include elements like the container, icon, progress bar, and alert.
     */
    _buildCard() {
        const wrapper = document.createElement('ha-card');
        wrapper.classList.add(CARD.typeName);
        wrapper.innerHTML = CARD_HTML;
        const style = document.createElement('style');
        style.textContent = CARD_CSS;

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
        // store DOM ref to update
        this._elements = {
            [SELECTORS.container]: this.shadowRoot.querySelector(`.${SELECTORS.container}`),
            [SELECTORS.right]: this.shadowRoot.querySelector(`.${SELECTORS.right}`),
            [SELECTORS.icon]: this.shadowRoot.querySelector(`.${SELECTORS.icon}`),
            [SELECTORS.shape]: this.shadowRoot.querySelector(`.${SELECTORS.shape}`),
            [SELECTORS.name]: this.shadowRoot.querySelector(`.${SELECTORS.name}`),
            [SELECTORS.percentage]: this.shadowRoot.querySelector(`.${SELECTORS.percentage}`),
            [SELECTORS.secondaryInfo]: this.shadowRoot.querySelector(`.${SELECTORS.secondaryInfo}`),
            [SELECTORS.progressBarInner]: this.shadowRoot.querySelector(`.${SELECTORS.progressBarInner}`),
            [SELECTORS.alert]: this.shadowRoot.querySelector(`${SELECTORS.alert}`),
            [SELECTORS.ha_icon]: this.shadowRoot.querySelector(`${SELECTORS.ha_icon}`),
        };
    }

    /**
     * Changes the layout of the card based on the current configuration.
     * 
     * This method adjusts the styling of various DOM elements based on the selected 
     * layout configuration. It uses predefined CSS styles to switch between two 
     * layout modes:
     * 
     * **Layout 1 (e.g., column layout):**
     * - `.container`'s `flex-direction` changes from `row` to `column`.
     * - `.name`'s `text-align` changes from `left` to `center`.
     * - `.right`'s `width` changes from `100%` to `90%` and `flex-grow` changes from `1` to `0`.
     * - `.secondary_info`'s `display` changes from `flex` to `block`.
     * - `.percentage`'s `text-align` changes from `left` to `center`.
     * 
     * **Layout 2 (e.g., row layout):**
     * - Reverts all the styles back to their original values, enabling a `row` layout.
     * 
     * The layout change is triggered based on the `this.config.layout` value, which 
     * determines the current layout mode.
     */
    _changeLayout() {
        if (this.config.layout === CARD.layout.vertical.label) {
            this._elements[SELECTORS.container].style.flexDirection = 'column';
            this._elements[SELECTORS.name].style.textAlign = 'center';
            this._elements[SELECTORS.right].style.width = '90%';
            this._elements[SELECTORS.right].style.flexGrow = '0';
            this._elements[SELECTORS.secondaryInfo].style.display = 'block';
            this._elements[SELECTORS.percentage].style.textAlign = 'center';
        } else {
            this._elements[SELECTORS.container].style.flexDirection = 'row';
            this._elements[SELECTORS.name].style.textAlign = 'left';
            this._elements[SELECTORS.right].style.width = '100%';
            this._elements[SELECTORS.right].style.flexGrow = '1';
            this._elements[SELECTORS.secondaryInfo].style.display = 'flex';
            this._elements[SELECTORS.percentage].style.textAlign = 'left';
        }
    }

    /**
     * Returns the icon and color corresponding to the given percentage and theme.
     * 
     * This function calculates the step in the theme's array that corresponds to the given percentage,
     * using intervals based on the number of elements in the theme's array. If the percentage is less than 0, 
     * it is adjusted to 0. If the percentage is greater than or equal to 100, the last step is returned.
     * 
     * @param {string} theme - The name of the theme to use (e.g., "battery").
     * @param {number} percentage - The percentage of progress to use in determining the icon and color.
     * @returns {Object} An object containing the icon and color corresponding to the calculated step.
     *                  Example: { icon: 'mdi:battery-50', color: 'var(--yellow-color)' }
     */
    _getIconColorForTheme(theme, percentage) {
        if (!THEME[theme]) {
            return { icon:null, color: null };
        }
        const lastStep = (THEME[theme].length - 1);
        const thresholdSize = (100 / lastStep);

        if (percentage < 0) percentage = 0;
        if (percentage >= CARD.config.maxPercent) return THEME[theme][lastStep]; // >=100%
    
        return THEME[theme][Math.floor(percentage / thresholdSize)];
    }

    /**
     * Updates the specified DOM element based on a provided callback function.
     * 
     * This method accepts a `key` (which corresponds to an element stored in 
     * the `_elements` object) and a `callback` function. The callback is executed 
     * on the specified element, and its current value (either `textContent` or 
     * `style.width`) is compared with the new value returned by the callback.
     * 
     * If the value has changed, the callback function is re-executed to update 
     * the element's content or style. This helps ensure that dynamic elements 
     * are updated only when necessary, preventing unnecessary DOM modifications.
     * 
     * @param {string} key - The key that identifies the element to be updated 
     *                       in the `_elements` object.
     * @param {function} callback - A function that is applied to the element. 
     *                              It should return the new value for the element.
     */
    _updateElement(key, callback) {
        const element = this._elements[key];
        if (element) {
            const currentValue = element.textContent || element.style.width;
            const newValue = callback(element);
            if (currentValue !== newValue) {
                callback(element);
            }
        }
    }

    /**
     * Validates the card configuration and returns the validation status and error messages.
     * 
     * Main Steps:
     * 1. **Entity Check**: Ensures `entity` is defined in the configuration and exists in Home Assistant.
     * 2. **Max Value Validation**: Confirms `max_value` is either:
     *    - A positive number.
     *    - A valid entity in Home Assistant.
     * 3. **Decimal Check**: Validates that the `decimal` value is not negative.
     * 
     * Returns:
     * - An object `{ valid, msg }`:
     *   - `valid`: Boolean indicating whether the configuration is valid.
     *   - `msg`: An error message string, or `null` if the configuration is valid.
     * 
     * Provides localized error messages for each type of configuration issue.
     * 
     * @returns {{ valid: boolean, msg: string|null }}
     */
    _checkConfig() {

        const entity = this._hass?.states[this.config.entity];

        if (!this.config.entity) {
            return { valid: false, msg: MSG[this._currentLanguage].entityError };
        } else if (!entity) {
            return { valid: false, msg: MSG[this._currentLanguage].entityNotFound };
        }  else if (this._min_value &&
            !(
                typeof this._min_value === "number" && !isNaN(this._min_value)
            )) {
            return { valid: false, msg: MSG[this._currentLanguage].minValueError };
        } else if (this._max_value &&
            !(
                (typeof this._max_value === "number" && !isNaN(this._max_value) && this._max_value > 0) ||
                (typeof this._max_value === "string" && this._hass?.states[this._max_value])
            )) {
            return { valid: false, msg: MSG[this._currentLanguage].maxValueError };
        } else if (this._decimal < 0) {
            return { valid: false, msg: MSG[this._currentLanguage].decimalError };
        }
        return { valid: true, msg: null };

    }

    /**
     * Parses and validates the `max_value` configuration to determine its value and validity.
     * 
     * Main Steps:
     * 1. **Numeric `max_value`**: If `max_value` is a positive number, it's valid.
     * 2. **Entity-Based `max_value`**: If `max_value` references a valid entity:
     *    - Checks if the entity state is valid (not "unavailable" or "unknown").
     *    - Parses and returns the entity state as a numeric value.
     * 3. **Fallback**: Returns invalid result if `max_value` is neither valid numeric nor a valid entity.
     * 
     * Returns:
     * - An object `{ value, valid }`:
     *   - `value`: The numeric `max_value` or 0 if invalid.
     *   - `valid`: Boolean indicating whether `max_value` is valid.
     * 
     * Handles unavailable or unknown entity states gracefully.
     * 
     * @returns {{ value: number, valid: boolean }}
     */
    _parseMaxValue() {

        if (typeof this._max_value === "number") { // maxValue is numeric > 0
            return { value: this._max_value, valid: true };
        } else if (typeof this._max_value === "string") { // maxValue is a known entity
            const entityState = this._hass.states[this._max_value].state;

            if (!entityState || entityState === "unavailable" || entityState === "unknown") {
                return { value: 0, valid: false };
            }
            return { value: parseFloat(entityState), valid: true };
        }

        return { value: 0, valid: false };
    }

    /**
     * Calculates the percentage and value based on the current entity state and max value configuration.
     *
     * This function retrieves the state of the configured entity and calculates its value and percentage 
     * based on the `max_value` configuration. If `max_value` is not defined or invalid, a fallback logic 
     * ensures a default percentage calculation.
     *
     * @returns {Object} An object containing:
     *  - `value` {number}: The numeric value of the entity's current state (parsed from the entity's state).
     *  - `percentage` {number}: The percentage of the entity's value relative to `max_value` or a default max percent.
     *  - `entityAvailable` {boolean}: A flag indicating whether the entity is available (`true`) or not (`false`).
     */
    _getPercent() {

        const entity = this._hass?.states[this.config.entity];
        let percentage = 0;
        let value = 0;
        let label = null;
        let entityAvailable = true;

        if (entity.state === "unavailable" || entity.state === "unknown"){
            entityAvailable=false;
        } else {
            value = parseFloat(entity.state);
            let maxValueResult = this._parseMaxValue();
            if (!this._max_value) {
                percentage = isNaN(value) ? 0 : Math.min(Math.max(value, 0), CARD.config.maxPercent);
            } else if (this.config.max_value && maxValueResult.valid) {
                percentage = isNaN(value) ? 0 : ((value - this._min_value) / (maxValueResult.value - this._min_value)) * CARD.config.maxPercent;
            } else {
                entityAvailable=false;
            }

            const formattedPercentage = Number.isFinite(percentage)
                ? percentage.toFixed(this._decimal)
                : 0;

            const formattedValue = Number.isFinite(value)
                ? value.toFixed(this._decimal)
                : 0;

            label = this._unit === CARD.config.unit
                ? `${formattedPercentage}${this._unit}` // if unit = %
                : `${formattedValue}${this._unit}`; // if unit <> %
        }
        return { value: value, percentage: percentage, label:label, entityAvailable: entityAvailable };
    }

    /**
     * Updates dynamic card elements based on the entity's state and configuration.
     * 
     * Main Steps:
     * 1. **Configuration Validation**: Validates entity setup via `_checkConfig()`. Shows/hides errors accordingly.
     * 2. **Percentage Calculation**: Uses `_getPercent()` to derive the percentage and determine entity availability.
     * 3. **Theme Handling**: Gets icon and color based on the theme using `_getIconColorForTheme()`.
     * 4. **Element Updates**: Dynamically updates:
     *    - Progress bar width and color.
     *    - Icon attributes and color.
     *    - Shape background color.
     *    - Display name (friendly name or fallback).
     *    - Percentage label (value or unavailable message).
     * 
     * Utilities Used:
     * - `_updateElement()`: Updates DOM elements only if values/styles change.
     * - `_getPercent()`: Calculates percentage from the entity state and max value.
     * - `_getIconColorForTheme()`: Determines icon and color based on theme/percentage.
     * 
     * Handles errors gracefully (e.g., invalid config, unavailable entity).
     * 
     * @returns {void}
     */
    _updateDynamicElements() {
        /**
         * Manage config error and get inputs
         */
        const entity = this._hass?.states[this.config.entity];
        const configState = this._checkConfig();

        if (!configState.valid) {
            this._showError(configState.msg);
            return;
        } else {
            this._hideError();
        }

        // Manage the percentage part
        const currentPercent = this._getPercent();
        // Manage theme
        let iconAndColorFromTheme = this._getIconColorForTheme(this.config.theme, currentPercent.percentage);

        /**
         * Update dyn element
         */
        this._updateElement(SELECTORS.progressBarInner, (el) => {
            el.style.width = `${currentPercent.percentage}%`;
            el.style.backgroundColor = iconAndColorFromTheme.color || this.config.bar_color || CARD.config.color;
        });

        this._updateElement(SELECTORS.icon, (el) => {
            el.setAttribute(SELECTORS.icon, iconAndColorFromTheme.icon || this.config.icon || entity.attributes.icon || 'mdi:alert');
            el.style.color = iconAndColorFromTheme.color|| this.config.color || CARD.config.color;
        });

        this._updateElement(SELECTORS.shape, (el) => {
            el.style.backgroundColor = iconAndColorFromTheme.color || this.config.color || CARD.config.color;
        });

        this._updateElement(SELECTORS.name, (el) => {
            el.textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
        });

        this._updateElement(SELECTORS.percentage, (el) => {
            if (currentPercent.entityAvailable) {
                el.textContent = currentPercent.label;
            } else {
                el.textContent = MSG[this._currentLanguage].entityUnavailable;
            }
        });
    }

    /**
     * Displays an error alert with the provided message.
     * 
     * This method shows an error alert on the card by updating the corresponding
     * DOM element (identified by `SELECTORS.alert`). The element is made visible 
     * by changing its `display` style, and the provided error message is set as 
     * the text content of the alert.
     * 
     * The error alert is typically used to notify users when an issue occurs, 
     * such as an entity not being found or any other problem that needs user 
     * attention.
     * 
     * @param {string} message - The error message to display in the alert.
     */
    _showError(message) {
        const alertElement = this._elements[SELECTORS.alert];
        if (alertElement) {
            alertElement.style.display = HTML.flex.show;
            alertElement.textContent = message;  // Set the error message in the alert
        }
    }

    /**
     * Hides the error alert by setting its display style to hide.
     * 
     * This method hides the error alert on the card by changing the `display` 
     * style of the corresponding DOM element (identified by `SELECTORS.alert`) 
     * to the value of `HTML.flex.hide`. This is typically used to remove the error 
     * message once the issue (such as the entity being found) has been resolved.
     * 
     * @returns {void}
     */
    _hideError() {
        const alertElement = this._elements[SELECTORS.alert];
        if (alertElement) {
            alertElement.style.display = HTML.flex.hide;
        }
    }

    /**
     * Returns the number of grid rows for the card size based on the current layout.
     * 
     * This method determines the size of the card (specifically the number of grid rows) 
     * depending on whether the layout configuration is vertical or horizontal. 
     * The layout configuration is checked against `CARD.layout.vertical.label`, and based
     * on this, it returns the appropriate number of rows for the card's grid.
     * 
     * @returns {number} - The number of grid rows for the current card layout.
     */
    getCardSize() {
        if (this.config.layout === CARD.layout.vertical.label) {
            return CARD.layout.vertical.value.grid_rows;
        }
        return CARD.layout.horizontal.value.grid_rows;
    }

    /**
     * Returns the layout options based on the current layout configuration.
     * 
     * This method returns an object containing layout options (e.g., grid rows, columns, etc.) 
     * depending on the layout configuration. If the layout is set to vertical, it returns 
     * the options for the vertical layout; if horizontal, it returns the options for the 
     * horizontal layout.
     * 
     * @returns {object} - The layout options for the current layout configuration.
     */
    getLayoutOptions() {
        if (this.config.layout === CARD.layout.vertical.label) {
            return CARD.layout.vertical.value;
        }
        return CARD.layout.horizontal.value;
    }
}

/** --------------------------------------------------------------------------
 * Define static properties and register the custom element for the card.
 * 
 * These lines of code define static properties and register the custom element 
 * for `EntityProgressCard`, making it available for use within the DOM. The class 
 * is associated with a custom tag name and is given versioning information to track 
 * changes.
 * 
 * @static
 */
EntityProgressCard.version = VERSION;
EntityProgressCard._moduleLoaded = false;
customElements.define(CARD.typeName, EntityProgressCard);

/** --------------------------------------------------------------------------
 * Registers the custom card in the global `customCards` array for use in Home Assistant.
 * 
 * This code ensures that the custom card is added to the list of registered custom cards, 
 * which Home Assistant uses to dynamically render and manage custom cards in its user interface. 
 * The check ensures that the `customCards` array is created if it does not exist, without overwriting 
 * any existing custom cards that may already be registered.
 */
window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
    type: CARD.typeName,
    name: CARD.name,
    description: CARD.description,    
});


/** --------------------------------------------------------------------------
 * ConfigManager
 * 
 * A class for dynamically managing and manipulating a configuration object. 
 * This class provides methods for updating configuration properties, 
 * applying deferred updates (debouncing), and notifying changes via a callback.
 * 
 * Key Features:
 * - Load and merge an initial configuration.
 * - Update specific properties with type handling and removal of invalid values.
 * - Debouncing updates to optimize performance.
 * - Automatic change notifications via a callback.
 * - Debugging mode for tracking actions performed by the class.
 * 
 * @class ConfigManager
 * 
 * @param {Object} initialConfig - The initial configuration object, consisting of key/value pairs.
 * @param {Boolean} debug - Enables or disables debugging mode to log class actions (default value via `CARD.debug`).
 */ 
class ConfigManager {
    /**
     * Constructor for ConfigManager
     * 
     * Initializes a new instance of the `ConfigManager` class with the provided configuration and sets up 
     * internal state variables. The constructor ensures that the configuration is properly stored and that
     * other mechanisms, such as change notifications and debouncing, are ready for use.
     * 
     * @param {Object} [initialConfig={}] - The initial configuration object used to set default key/value pairs.
     * 
     * Instance Variables:
     * - `_config` (Object): Stores the current configuration, initialized with the provided `initialConfig`.
     * - `_onConfigChange` (Function|null): Holds the callback function for notifying configuration changes.
     * - `_debounceTimeout` (number|null): Tracks the timeout for debouncing property updates.
     * - `_pendingUpdates` (Object): Temporarily stores updates for deferred application (debouncing).
     * - `_lastUpdateFromProperty` (Boolean): Tracks whether the last configuration change came from a property update 
     *   to prevent redundant updates.
     * - `_debug` (Boolean): Indicates whether debugging mode is active, enabling detailed logs. 
     *   The value is sourced from `CARD.debug`.
     */
    constructor(initialConfig = {}) {
        this._config = { ...initialConfig }; // Configuration actuelle
        this._onConfigChange = null; // Callback pour notifier les changements
        this._debounceTimeout = null; // Timeout pour le debouncing
        this._pendingUpdates = {}; // Stockage temporaire des changements
        this._lastUpdateFromProperty = false;
        this._debug = CARD.debug;
    }

    /**
     * Getter for the current configuration.
     * 
     * Provides access to the current configuration as a new object, ensuring that external mutations do not 
     * directly affect the internal state. This approach ensures encapsulation and protects the integrity 
     * of the configuration.
     * 
     * @returns {Object} - A copy of the current configuration object.
     */
    get config() {
        return { ...this._config }; // Retourne une copie pour éviter les mutations externes
    }

    /**
     * Logs debug messages to the console if debugging is enabled.
     * 
     * This method checks the `_debug` flag to determine whether debug logging is enabled. 
     * If enabled, it logs the provided message and optional data to the console using 
     * `console.debug`. This is a utility method for easier debugging of the class behavior.
     * 
     * @param {string} message - The message to be logged.
     * @param {any} [data=null] - Optional additional data to log with the message. Can be of any type.
     */
    _logDebug(message, data = null) {
        if (this._debug) {
            if (data) {
                console.debug(message, data);
            } else {
                console.debug(message);
            }
        }
    }

    /**
     * Updates the configuration of the ConfigManager instance.
     * 
     * This method sets a new configuration by merging it with the existing configuration. 
     * If the last update was triggered by the `updateProperty` method, the update is skipped 
     * to prevent redundant changes. Debug messages are logged if debugging is enabled.
     * 
     * - If `_lastUpdateFromProperty` is `true`, the method resets the flag and returns without 
     *   making any changes.
     * - Otherwise, the provided `newConfig` object is merged with the current `_config`, 
     *   ensuring that new or updated properties are applied while retaining existing ones.
     * - Logs debug information to indicate whether the configuration was updated or skipped.
     * 
     * @param {Object} newConfig - The new configuration object to be merged with the current configuration.
     */
    setConfig(newConfig) {
        if (this._lastUpdateFromProperty) {
            this._logDebug('ConfigManager/setConfig: already ok...');
            this._lastUpdateFromProperty = false;
            return;
        }
        this._logDebug('ConfigManager/setConfig: updateall!');
        const mergedConfig = { ...this._config, ...newConfig }; // Fusionner les nouvelles valeurs
        this._config = mergedConfig;
    }

    /**
     * Updates a specific property in the configuration with a debounce mechanism.
     * 
     * This method allows updating an individual property of the configuration.
     * Updates are temporarily stored in `_pendingUpdates` and only applied
     * after the specified debounce time (`CARD.debounce`) has elapsed. This prevents
     * multiple rapid updates from being processed immediately.
     *
     * @param {string} key - The name of the property to update.
     * @param {*} value - The new value for the property. Can be any type.
     *
     * Behavior:
     * - If the method is called multiple times within the debounce period, 
     *   previous timeouts are cleared, and only the latest update is applied.
     * - After the debounce timeout, `_applyPendingUpdates()` is called to process 
     *   and commit the changes to the configuration.
     */
    updateProperty(key, value) {
        this._pendingUpdates[key] = value;
        this._logDebug('ConfigManager/updateProperty - pendingUpdates: ', this._pendingUpdates);


        if (this._debounceTimeout) {
            clearTimeout(this._debounceTimeout);
        }

        this._debounceTimeout = setTimeout(() => {
            this._applyPendingUpdates();
        }, CARD.debounce); // Temps configurable (200ms ici)
    }

    /**
     * Applies all pending configuration updates after the debounce period.
     * 
     * This method processes and commits any changes stored in `_pendingUpdates` to the
     * actual configuration (`_config`). It handles type conversion, such as converting
     * numeric strings to numbers, and removes properties with empty or invalid values.
     *
     * Behavior:
     * - Iterates over all pending updates stored in `_pendingUpdates`.
     * - Converts numeric fields to numbers when applicable.
     * - Removes properties with empty string values (`''`) or `null`.
     * - Updates the `_config` object only if the value has changed.
     * - If any changes are applied, `_reorderConfig()` is called to reorganize the
     *   configuration, and `_notifyChange()` is triggered to notify listeners.
     * - Clears `_pendingUpdates` after processing.
     * 
     * @private
     */
    _applyPendingUpdates() {
        let hasChanges = false;

        for (const [key, value] of Object.entries(this._pendingUpdates)) {
            this._logDebug('ConfigManager/_applyPendingUpdates:', [key, value]);
            let curValue = value;
            if (key in EDITOR_INPUT_FIELDS && EDITOR_INPUT_FIELDS[key].type === FIELD_TYPE.number.type || key === EDITOR_INPUT_FIELDS.max_value.name && value.trim() !== '') {
                const numericValue = Number(value);
                if (!isNaN(numericValue)) {
                    curValue = numericValue;
                }
            }

            if ((typeof curValue === 'string' && curValue.trim() === '') || curValue == null) {
                if (key in this._config) {
                    delete this._config[key];
                    hasChanges = true;
                }
            } else if (this._config[key] !== curValue) {
                this._config[key] = curValue;
                hasChanges = true;
            }
        }

        this._pendingUpdates = {};

        if (hasChanges) {
            this._reorderConfig();
            this._lastUpdateFromProperty = true;
            this._notifyChange();
        }
    }

    /**
     * Reorders the configuration properties, ensuring `grid_options` appears last.
     * 
     * This method restructures the internal configuration object to move the `grid_options` 
     * property (if it exists) to the end of the object. This is useful for ensuring that 
     * `grid_options` is always serialized or displayed after other properties, maintaining a 
     * consistent order in the configuration.
     * 
     * - The method destructures `_config` into `grid_options` and the remaining properties (`rest`).
     * - If `grid_options` exists, it is appended to the end of the configuration object.
     * - If `grid_options` does not exist, the configuration remains unchanged.
     */
    _reorderConfig() {
        const { grid_options, ...rest } = this._config;
        this._config = grid_options ? { ...rest, grid_options } : { ...rest };
    }

    /**
     * Notifies listeners of a configuration change.
     * 
     * This method invokes the registered callback function, passing a copy of the current 
     * configuration as an argument. It ensures that any external subscribers (e.g., the editor 
     * or other components) are informed whenever the configuration is updated.
     * 
     * - If no callback (`_onConfigChange`) is registered, the method does nothing.
     * - A copy of the current configuration is sent to prevent direct mutations.
     */
    _notifyChange() {
        if (this._onConfigChange) {
            this._onConfigChange({ ...this._config });
        }
    }

    /**
     * Registers a callback to handle configuration changes.
     * 
     * This method allows external components or systems to subscribe to updates
     * of the configuration managed by this class. When a configuration change
     * occurs, the provided callback will be invoked with a cloned version of
     * the updated configuration.
     */
    onConfigChange(callback) {
        this._onConfigChange = callback;
    }
}

/** --------------------------------------------------------------------------
 * Custom editor component for configuring the `EntityProgressCard`.
 * 
 * The `EntityProgressCardEditor` class extends `HTMLElement` and represents the editor interface 
 * for configuring the settings of the `EntityProgressCard`. This class provides a UI for users 
 * to modify the card's configuration, such as entity selection, layout, and theme options. 
 * It is typically used in Home Assistant's configuration interface to allow users to customize 
 * their cards through a graphical interface.
 * 
 * This editor component interacts with the settings of the `EntityProgressCard`, providing 
 * an interface to change key attributes of the card like layout, color, entity type, and others.
 * 
 * Example usage:
 * <entity-progress-card-editor></entity-progress-card-editor>
 */
class EntityProgressCardEditor extends HTMLElement {
    /**
     * Initializes an instance of the `EntityProgressCardEditor` class.
     * 
     * This constructor sets up the configuration manager, initial values, and event listeners:
     * - Creates an instance of `ConfigManager` to manage the configuration state.
     * - Initializes properties for the editor, including `config`, `_hass`, `_elements`, 
     *   `_overridableElements`, and the editor's language settings.
     * - Sets up a callback with the `ConfigManager` to listen for configuration changes and
     *   dispatch a `config-changed` event whenever updates are applied.
     * 
     * Behavior:
     * - Listens for changes in the configuration (`onConfigChange`) and updates the local
     *   `config` property accordingly.
     * - Dispatches a `CustomEvent` (`config-changed`) to notify external listeners of the
     *   updated configuration.
     * 
     * @constructor
     */
    constructor() {
        super();
        this.configManager = new ConfigManager();
        this.config = {};
        this._hass = null;
        this._elements = {};
        this._overridableElements = {};
        this.rendered = false;
        this._currentLanguage = CARD.config.language;
        this._isGuiEditor = false;

        this.configManager.onConfigChange((newConfig) => {
            this.config = newConfig;
            this.configManager._logDebug('EntityProgressCardEditor OnConfigChange - new value registered: ', { detail: { config: this.config } });
            this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
        });
    }

    /**
     * Sets the `hass` (Home Assistant) instance for the editor component.
     * 
     * This setter method is used to assign a new Home Assistant instance to the editor component.
     * It ensures that the editor is only updated when the `hass` instance changes, preventing
     * unnecessary re-renders. If the new instance is different from the previous one or if it is the
     * first time the `hass` value is being set, the component updates its internal reference and,
     * if it has already been rendered, triggers a re-render.
     * 
     * - If the provided `value` is falsy (null or undefined), the method simply returns without doing anything.
     * - Update the this._currentLanguage according to hass.config.language (HA Environment)
     * - If the current `hass` instance is different from the new one (checked by comparing `entities`),
     *   the method updates the internal `_hass` reference and triggers a re-render if the editor is already rendered.
     * 
     * This ensures that changes in the Home Assistant instance are properly reflected in the component
     * without unnecessary updates or re-renders.
     * 
     * @param {object} hass - The new Home Assistant instance to set.
     */
    set hass(hass) {
        if (!hass) {
            return;
        }
        this._currentLanguage = MSG[hass.config.language] ? hass.config.language : CARD.config.language;
        if (!this._hass || this._hass.entities !== hass.entities) {
            this._hass = hass;
        }
    }

    /**
     * Gets the current Home Assistant instance stored in the editor component.
     * 
     * This getter method provides access to the internal `_hass` property, which holds the
     * current Home Assistant instance. The value of `_hass` is used throughout the component
     * to access entity states and interact with Home Assistant data. This method simply
     * returns the stored instance when called.
     * 
     * @returns {object|null} The current Home Assistant instance, or `null` if not set.
     */    
    get hass() {
        return this._hass;
    }

    /**
     * Sets the configuration for the editor component and triggers the necessary updates.
     * 
     * This method accepts a configuration object and updates the component's internal `config` property.
     * If the Home Assistant instance (`hass`) is available, the method performs the following actions:
     * 
     * - **Sets the configuration**: It stores the provided `config` in the component's internal `config` property.
     * - **Loads the entity picker**: The `loadEntityPicker()` method is called to initialize or update the entity picker,
     *   allowing the user to select entities for the card.
     * - **Renders the component**: If the editor hasn't been rendered yet (`rendered` is `false`), the component is
     *   marked as rendered, and the `render()` method is called to render the editor's UI.
     * 
     * This method ensures that the editor's configuration is applied correctly and that any necessary UI updates
     * are triggered, including rendering the editor if it's not already displayed.
     * 
     * @param {object} config - The configuration object containing settings for the editor.
     */   
    setConfig(config) {
        if (!this.hass) {
            return;
        }

        this.configManager._logDebug('EntityProgressCardEditor/setConfig - value before change: ', { detail: { config: this.config } });
        this.configManager._logDebug('EntityProgressCardEditor/setConfig - update: ', { detail: { config } });
        this.configManager.setConfig(config);
        this.config = this.configManager.config;
        this.configManager._logDebug('EntityProgressCardEditor/setConfig - check value updated: ', { detail: { config: this.config } });

        if (!this.rendered) {
            this.loadEntityPicker();
            this.render();
            this.rendered = true;
            return;
        }
        if (!this._checkConfigChangeFromGUI()) {
            this._refreshConfigFromYAML();
        }

    }

    /**
     * Checks if a configuration change originates from the graphical editor (GUI).
     * 
     * This function uses the dimensions of the `entity` field element to determine 
     * if the graphical editor is currently visible and interactive. The GUI editor 
     * is considered active if its dimensions (width and height) are greater than zero.
     * 
     * @returns {boolean} - Returns `true` if the GUI editor is visible, otherwise `false`.
     */
    _checkConfigChangeFromGUI() {
        const rect = this._elements['entity'].getBoundingClientRect();
        this._isGuiEditor = (
            rect.width > 0 &&
            rect.height > 0
        );
        return this._isGuiEditor;
    }

    /**
     * Synchronizes the configuration from the YAML editor with the GUI editor.
     * 
     * This function iterates over the keys of the `_elements` object and updates 
     * the values of the corresponding input fields in the graphical editor based 
     * on the current configuration (`this.config`). If a configuration key exists, 
     * its value is assigned to the corresponding element. Additionally, the 
     * `tap_action` field is explicitly updated using the `_getTapActionValue()` method.
     * 
     * Note: This ensures that the graphical editor reflects the latest YAML-based changes.
     */
    _refreshConfigFromYAML() {
        const keys = Object.keys(this._elements);
        keys.forEach(key => {
            if (this.config[key]) {
                this._elements[key].value = this.config[key];
            } else if (key !== TAP_ACTION_KEY) {
                this._elements[key].value = '';
            }
            this._elements[TAP_ACTION_KEY].value = this._getTapActionValue();
        });
    }

    /**
     * Toggles the visibility of fields based on the `disable` flag.
     * 
     * This method is used to control the visibility of specific fields in the editor. 
     * It updates the `style.display` property of each field element stored in the `_overridableElements` 
     * object, hiding or showing the fields based on the `disable` parameter.
     * 
     * - If `disable` is `true`, the method hides the fields by setting `style.display` to `HIDE_DIV`.
     * - If `disable` is `false`, the method shows the fields by setting `style.display` to `SHOW_DIV`.
     * 
     * The fields that are affected by this method are those stored in the `_overridableElements` object, 
     * which holds references to DOM elements that can be dynamically shown or hidden. The fields are identified 
     * by the keys of the `_overridableElements` object.
     * 
     * @param {boolean} disable - A boolean flag to control the visibility of the fields.
     *                            If `true`, fields are hidden. If `false`, fields are shown.
     */
    _toggleFieldDisable(key, disable) {
        this.configManager._logDebug('_toggleFieldDisable - Toggle: ', [key, disable]);
        const fields = Object.keys(this._overridableElements[key]);
        fields.forEach(fieldName => {
            let display = disable ? HTML.block.hide : HTML.block.show;
            this._overridableElements[key][fieldName].style.display = display;
            this.configManager._logDebug('_toggleFieldDisable - Toggle: ', [fieldName, this._overridableElements[key], display])
        });
    }

    /**
     * Updates a specific property in the configuration object, and handles additional logic 
     * related to `theme` and field visibility.
     * 
     * 
     * @param {string} key - The key of the configuration property to update.
     * @param {string} value - The new value to assign to the configuration property.
     */
    _updateConfigProperty(key, value) {
        this.configManager.updateProperty(key, value);
        if (key === THEME_KEY) {
            this._toggleFieldDisable(THEME_KEY, value !== '');
        }
    }

    /**
     * Manages the tap action behavior based on the provided value.
     *
     * This function updates the configuration and toggles fields related to the 
     * tap action (e.g., `navigate_to` and `show_more_info`) depending on the 
     * selected action. It ensures that mutually exclusive properties are handled 
     * properly.
     *
     * Logic:
     * - Disables or enables the `NAVIGATETO_KEY` field depending on whether the 
     *   provided `value` matches `NAVIGATETO_KEY`.
     * - For `CARD.tap_action.navigate_to`, resets the `more_info` property.
     * - For `CARD.tap_action.more_info`, clears `navigate_to` and sets `more_info` to `true`.
     * - For `CARD.tap_action.no_action`, clears `navigate_to` and sets `more_info` to `false`.
     *
     * @param {string} value - The selected tap action value to manage.
     *                         Possible values: `CARD.tap_action.navigate_to`, 
     *                         `CARD.tap_action.more_info`, `CARD.tap_action.no_action`.
     */
    _manageTapAction(value) {
        this.configManager._logDebug('_manageTapAction - Toggle value', value);
        switch (value) {
            case CARD.tap_action.navigate_to:
                this._updateConfigProperty(CARD.tap_action.more_info, '');
                // reenable with a value already set
                this._updateConfigProperty(
                    CARD.tap_action.navigate_to, this._overridableElements[EDITOR_INPUT_FIELDS.navigate_to.isInGroup][EDITOR_INPUT_FIELDS.navigate_to.name].value);
                break;
            case CARD.tap_action.more_info:
                this._updateConfigProperty(CARD.tap_action.navigate_to, '');
                this._updateConfigProperty(CARD.tap_action.more_info, true);
                break;
            case CARD.tap_action.no_action:
                this._updateConfigProperty(CARD.tap_action.navigate_to, '');
                this._updateConfigProperty(CARD.tap_action.more_info, false);
                break;
        }
        this._toggleFieldDisable(NAVIGATETO_KEY, (value !== NAVIGATETO_KEY));
    }

    /**
     * Determines the tap action value based on the current configuration.
     *
     * This function evaluates the `config` object to determine the appropriate 
     * tap action to return. It considers the `navigate_to` and `show_more_info` 
     * properties in the configuration to decide the value.
     *
     * Logic:
     * - If `navigate_to` is defined, it returns `CARD.tap_action.navigate_to`.
     * - If `show_more_info` is `true` or undefined, it returns `CARD.tap_action.more_info`.
     * - If `show_more_info` is explicitly `false`, it returns `CARD.tap_action.no_action`.
     *
     * @returns {string|null} The determined tap action value, or `null` if no valid action is found.
     */

    _getTapActionValue() {
        let value = null;

        if (this.config.navigate_to) {
            value = CARD.tap_action.navigate_to;
        } else if (this.config.show_more_info === true || this.config.show_more_info === undefined) {
            value = CARD.tap_action.more_info;
        } else if (this.config.show_more_info === false) {
            value = CARD.tap_action.no_action;
        }

        return value;
    }

    /**
     * Adds a list of choices to a given `<select>` element as `<mwc-list-item>` options.
     * 
     * This method takes a list of choice objects and appends them as options to the provided 
     * `<select>` element. Each choice is represented by a circular colored icon (using 
     * the `value` property as the background color) followed by the choice's `name`.
     * 
     * For each item in the `list`, a new `<mwc-list-item>` is created, where the `value` attribute 
     * of the option is set to the `value` of the choice.
     * - The `value` of the choice.
     * - The name of the choice.
     * 
     * The new `<mwc-list-item>` is then appended to the provided `select` element, allowing 
     * the user to choose from the list in a graphical form.
     * 
     * @param {HTMLElement} select - The `<select>` element to which the choices will be added.
     * @param {Array} list - An array of choice objects, where each object contains a `value` (color) and `name` (label) property.
     */
    _addChoice(select, list) {
        list.forEach(cur_choice => {
            const option = document.createElement(FIELD_TYPE.listItem.tag);
            option.value = cur_choice.value;
            option.innerHTML = `${cur_choice.name}`;
            select.appendChild(option);
        });
    }

    /**
     * Adds a list of color options to a given `<select>` element, including a "no color" option.
     * 
     * This method populates a `<select>` element with color choices. It first adds a special 
     * option to represent the "no color" choice, followed by the color options defined in the 
     * `COLOR_OPTION` array. Each color option is displayed with a circular colored icon (styled using 
     * the `value` of the color) and its respective `name`. 
     * 
     * For each color in the `COLOR_OPTION` array, a new `<mwc-list-item>` is created with the color 
     * as the background of a circular `span` and the color name displayed beside it.
     * 
     * @param {HTMLElement} colorSelect - The `<select>` element to which the color options will be added.
     */
    _addColor(colorSelect) {
        const noColorOption = document.createElement(FIELD_TYPE.listItem.tag);
        noColorOption.value = '';
        noColorOption.innerHTML = `
            <span style="display: inline-block; width: 16px; height: 16px; background-color: transparent; border-radius: 50%; margin-right: 8px;"></span>
        `;
        colorSelect.appendChild(noColorOption);

        COLOR_OPTION.forEach(color => {
            const option = document.createElement(FIELD_TYPE.listItem.tag);
            option.value = color.value;
            option.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; background-color: ${color.value}; border-radius: 50%; margin-right: 8px;"></span>
                ${color.name}
            `;
            
            colorSelect.appendChild(option);
        });
    }

    /**
     * Adds an event listener to a specified element and handles events based on the provided type.
     * 
     * @param {string} name - The name of the element to attach the event listener to.
     * @param {string} type - The type of the event listener. Supported types include 'color', 'theme', 'tap_action', 'layout', 
     *                        or other types triggering 'value-changed' and 'input' events.
     * 
     * - For 'color', 'theme', 'tap_action', and 'layout', the function listens for the 'selected' event and attaches an 
     *   additional 'closed' event listener to stop event propagation.
     * - For other types, the function listens for 'value-changed' and 'input' events.
     * 
     * When an event occurs, the function checks if the component has been rendered and if there are configuration changes 
     * initiated from the GUI. It then updates the configuration property or manages the tap action, depending on the event type.
     */
    _addEventListener(name, type) {
        const events = (type === FIELD_TYPE.color.type || type === FIELD_TYPE.theme.type || type === FIELD_TYPE.tap_action.type || type === FIELD_TYPE.layout.type)
            ? ['selected']
            : ['value-changed', 'input'];

        if (type === FIELD_TYPE.color.type || type === FIELD_TYPE.theme.type || type === FIELD_TYPE.tap_action.type || type === FIELD_TYPE.layout.type) {
            this._elements[name].addEventListener('closed', (event) => {
                event.stopPropagation();
            });
        }

        const handleEvent = (event) => {
            this.configManager._logDebug('EntityProgressCardEditor/handleEvent - new value from GUI: ', event.target.value);
            if (this.rendered && this._checkConfigChangeFromGUI()) {
                const newValue = event.detail?.value || event.target.value;
                if (type === FIELD_TYPE.tap_action.type) {
                    this._manageTapAction(newValue);
                } else {
                    this._updateConfigProperty(name, newValue);
                }
            }
        };

        events.forEach(eventType => {
            this._elements[name].addEventListener(eventType, handleEvent);
        });
    }

    /**
     * Creates a form field based on the provided configuration and appends it to a container.
     * 
     * This method generates a form field element dynamically based on the provided field type.
     * It handles different types of form controls such as:
     * - Entity picker (`ha-entity-picker`)
     * - Icon picker (`ha-icon-picker`)
     * - Layout selector (`ha-select`)
     * - Theme selector (`ha-select`)
     * - Color selector (`ha-select`)
     * - Text input (`ha-textfield`)
     *
     * For the `layout`, `theme`, and `color` field types, additional choices are populated 
     * via helper methods `_addChoice` and `_addColor`. Each field is configured with a label, 
     * value, and an optional description. If the field is marked as a theme-overridable element, 
     * it is stored in the `_overridableElements` object for potential dynamic modification.
     * 
     * @param {string} config.name - The name of the field (used to store the field's value in `this.config`).
     * @param {string} config.label - The label for the field, displayed next to the input element.
     * @param {string} config.type - The type of field to create ('entity', 'icon', 'layout', 'theme', 'color', or 'text').
     * @param {boolean} config.required - A flag indicating whether the field is required.
     * @param {boolean} config.isInGroup - A flag indicating if the field should be group-overridable.
     * @param {string} config.description - The description of the field, typically displayed below the input.
     * 
     * @returns {HTMLElement} The container element (`<div>`) containing the input field and its description.
     */
    _createField({ name, label, type, required, isInGroup, description, width }) {
        let inputElement;
        let value = this.config[name] || '';
        let defaultDisplay = HTML.flex.show;

        switch (type) {
            case FIELD_TYPE.entity.type:
                inputElement = document.createElement(FIELD_TYPE.entity.tag);
                inputElement.hass = this.hass;
                break;
            case FIELD_TYPE.icon.type:
                inputElement = document.createElement(FIELD_TYPE.icon.tag);
                break;
            case FIELD_TYPE.layout.type:
                inputElement = document.createElement(FIELD_TYPE.layout.tag);
                inputElement.popperOptions = "";
                this._addChoice(inputElement, LAYOUT_OPTION[this._currentLanguage]);
                break;
            case FIELD_TYPE.tap_action.type:
                inputElement = document.createElement(FIELD_TYPE.tap_action.tag);
                inputElement.popperOptions = ""
                this._addChoice(inputElement, TAP_ACTION[this._currentLanguage]);
                value = this._getTapActionValue();
                break;
            case FIELD_TYPE.theme.type:
                inputElement = document.createElement(FIELD_TYPE.theme.tag);
                inputElement.popperOptions = ""
                this._addChoice(inputElement, THEME_OPTION);
                break;
            case FIELD_TYPE.color.type:
                inputElement = document.createElement(FIELD_TYPE.color.tag);
                inputElement.popperOptions = ""
                this._addColor(inputElement);
                break;
            case FIELD_TYPE.number.type:
                inputElement = document.createElement(FIELD_TYPE.number.tag);
                inputElement.type = FIELD_TYPE.number.type;
                break;
            default:
                inputElement = document.createElement(FIELD_TYPE.default.tag);
                inputElement.type = FIELD_TYPE.default.type;
                }

        // store element and manage default display
        this._elements[name]=inputElement;
        if (isInGroup) {
            if (!this._overridableElements[isInGroup]) {
                this._overridableElements[isInGroup] = {};
            }
            this._overridableElements[isInGroup][name]=inputElement;
            if ((isInGroup === NAVIGATETO_KEY && this._getTapActionValue() !== NAVIGATETO_KEY) || (isInGroup === THEME_KEY && this.config.theme)) {
                defaultDisplay = HTML.flex.hide;
            }
        }
        inputElement.style.display = defaultDisplay;
        inputElement.style.width = '100%';
        inputElement.required = required;
        inputElement.label = label;
        inputElement.value = value;
        this._addEventListener(name, type);

        const fieldContainer = document.createElement('div');
        if (isInGroup) {
            this._overridableElements[isInGroup][`${name}_description`] = fieldContainer;
        }
        fieldContainer.style.display = defaultDisplay;
        fieldContainer.style.marginBottom = '12px';
        fieldContainer.style.width = width;
        fieldContainer.style.height = '73px';
        const fieldDescription = document.createElement('span');
        fieldDescription.style.width = '90%';
        fieldDescription.innerText = description;
        fieldDescription.style.fontSize = '12px';
        fieldDescription.style.color = '#888';

        fieldContainer.appendChild(inputElement);
        fieldContainer.appendChild(fieldDescription);

        return fieldContainer;
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
        if (!window.customElements.get(FIELD_TYPE.entity.tag)) {
            const ch = await window.loadCardHelpers();
            const c = await ch.createCardElement({ type: "entities", entities: [] });
            await c.constructor.getConfigElement();
            const haEntityPicker = window.customElements.get(FIELD_TYPE.entity.tag);
        }
    }

    /**
     * Renders the editor interface for configuring the card's settings.
     * 
     * This method creates and displays the editor UI for the custom card. It dynamically generates
     * a set of form fields based on the **`EDITOR_INPUT_FIELDS`** array. Each field is rendered
     * according to its configuration, including the field name, label, type, required status, 
     * and description. The fields are appended to a container, which is styled and added to the card.
     * The layout of the fields is controlled using flexbox for proper alignment and wrapping.
     * 
     * @returns {void}
     */    
    render() {
        this.innerHTML = ''; // Reset inner HTML
        const fragment = document.createDocumentFragment();

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.flexWrap = 'wrap';        // Allows wrapping
        container.style.gap = '0 2%';

        Object.entries(EDITOR_INPUT_FIELDS).forEach(([key, field]) => {
            container.appendChild(this._createField({
                name:field.name,
                label:field.label[this._currentLanguage],
                type:field.type,
                required:field.required,
                isInGroup: field.isInGroup,
                description: field.description[this._currentLanguage],
                width: field.width }));
        });

        fragment.appendChild(container);
        this.appendChild(fragment);
    }
}

/** --------------------------------------------------------------------------
 * Registers the custom element for the EntityProgressCardEditor editor.
 * This registration step enables the creation and use of the custom card editor 
 * in the Home Assistant's UI.
 * 
 * @returns {void}
 */
customElements.define(CARD.editor, EntityProgressCardEditor);
