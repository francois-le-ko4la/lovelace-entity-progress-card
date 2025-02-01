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
 * @version 1.0.30
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION='1.0.30';
const CARD = {
    typeName: 'entity-progress-card',
    name: 'Entity progress card',
    description: 'A cool custom card to show current entity status with a progress bar.',
    editor: 'entity-progress-card-editor',
    layout: {
        horizontal: {
            label: 'horizontal',
            value: { grid_rows: 1, grid_min_rows: 1, grid_columns: 2, grid_min_columns: 2 },
            mdi: "mdi:focus-field-horizontal"
        },
        vertical:{
            label: 'vertical',
            value: { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 },
            mdi: "mdi:focus-field-vertical"
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
        unit: {default: '%', fahrenheit: '°F' },
        color: 'var(--state-icon-color)',
        icon: 'mdi:alert',
        alert_icon: 'mdi:alert-circle-outline',
        alert_icon_color: "#0080ff",
        showMoreInfo: true,
        decimal: {
            percentage: 0,
            other: 2
        },
    documentation: "https://github.com/francois-le-ko4la/lovelace-entity-progress-card/",
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
    alert: 'progress-alert',
    alert_icon: 'progress-alert-icon',
    alert_message: 'progress-alert-message'
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
    <${SELECTORS.alert}>
        <${SELECTORS.ha_icon} class="${SELECTORS.alert_icon}"></${SELECTORS.ha_icon}>
        <div class="${SELECTORS.alert_message}"></div>
    </${SELECTORS.alert}>
`;

const CARD_CSS=`
    ha-card {
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        padding: 0;
        box-sizing: border-box;
        border-radius: 12px;
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
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
    }

    .${SELECTORS.shape} {
        display: block;
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
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0px;
        gap: 10px;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 10;
        background-color: #202833;
        border-radius: 12px;
    }
    .${SELECTORS.alert_icon} {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        margin-left: 8px;
    }
    .${SELECTORS.alert_message} {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
        overflow: hidden;
        width:100%;
        margin-right: 8px;
    }
    `;

const HTML = {
    block: {
        show: 'block',
        hide: 'none',
    },
    flex: {
        show: 'flex',
        hide: 'none',
    },
};

const THEME = {
    battery: {
        linear: true,
        style: [
            { icon: 'mdi:battery-alert',     color: 'var(--state-sensor-battery-low-color)'    },   // Pourcentage < 10
            { icon: 'mdi:battery-alert',     color: 'var(--state-sensor-battery-low-color)'    },   // Pourcentage >= 10
            { icon: 'mdi:battery-20',        color: 'var(--state-sensor-battery-medium-color)' },   // Pourcentage >= 20
            { icon: 'mdi:battery-30',        color: 'var(--state-sensor-battery-medium-color)' },   // Pourcentage >= 30
            { icon: 'mdi:battery-40',        color: 'var(--state-sensor-battery-medium-color)' },   // Pourcentage >= 40
            { icon: 'mdi:battery-50',        color: 'var(--yellow-color)' },                        // Pourcentage >= 50
            { icon: 'mdi:battery-60',        color: 'var(--yellow-color)' },                        // Pourcentage >= 60
            { icon: 'mdi:battery-70',        color: 'var(--yellow-color)' },                        // Pourcentage >= 70
            { icon: 'mdi:battery-80',        color: 'var(--state-sensor-battery-high-color)'  },    // Pourcentage >= 80
            { icon: 'mdi:battery-90',        color: 'var(--state-sensor-battery-high-color)'  },    // Pourcentage >= 90
            { icon: 'mdi:battery',           color: 'var(--state-sensor-battery-high-color)'  }     // Pourcentage >= 100
        ]
    },
    light:  {
        linear: true,
        style: [
            { icon: 'mdi:lightbulb-outline', color: '#4B4B4B'},   // Pourcentage < 25
            { icon: 'mdi:lightbulb-outline', color: '#877F67'},   // Pourcentage >= 25
            { icon: 'mdi:lightbulb',         color: '#C3B382'},   // Pourcentage >= 50
            { icon: 'mdi:lightbulb',         color: '#FFE79E'},   // Pourcentage >= 75
            { icon: 'mdi:lightbulb',         color: '#FFE79E'}    // Pourcentage >= 100
        ]
    },
    temperature:  {
        linear: false,
        style: [
            { min: -50, max:8,   icon: 'mdi:thermometer', color: 'var(--deep-purple-color)' },
            { min: 8,   max:16,  icon: 'mdi:thermometer', color: 'var(--indigo-color)'      },
            { min: 16,  max:18,  icon: 'mdi:thermometer', color: 'var(--light-blue-color)'  },
            { min: 18,  max:20,  icon: 'mdi:thermometer', color: 'var(--teal-color)'        },
            { min: 20,  max:25,  icon: 'mdi:thermometer', color: 'var(--success-color)'     },
            { min: 25,  max:27,  icon: 'mdi:thermometer', color: 'var(--yellow-color)'      },
            { min: 27,  max:29,  icon: 'mdi:thermometer', color: 'var(--accent-color)'      },
            { min: 29,  max:34,  icon: 'mdi:thermometer', color: 'var(--deep-orange-color)' },
            { min: 34,  max:100, icon: 'mdi:thermometer', color: 'var(--red-color)'         },
        ],
    },
    humidity: {
        linear: false,
        style: [
            { min: 0,  max:23,  icon: 'mdi:water-percent', color: 'var(--red-color)'         },
            { min: 23, max:30,  icon: 'mdi:water-percent', color: 'var(--accent-color)'      },
            { min: 30, max:40,  icon: 'mdi:water-percent', color: 'var(--yellow-color)'      },
            { min: 40, max:50,  icon: 'mdi:water-percent', color: 'var(--success-color)'     },
            { min: 50, max:60,  icon: 'mdi:water-percent', color: 'var(--teal-color)'        },
            { min: 60, max:65,  icon: 'mdi:water-percent', color: 'var(--light-blue-color)'  },
            { min: 65, max:80,  icon: 'mdi:water-percent', color: 'var(--indigo-color)'      },
            { min: 80, max:100, icon: 'mdi:water-percent', color: 'var(--deep-purple-color)' },
        ],
    },
    voc: {
        linear: false,
        style: [
            { min: 0,     max:300,   icon: 'mdi:air-filter', color: 'var(--success-color)'     },
            { min: 300,   max:500,   icon: 'mdi:air-filter', color: 'var(--yellow-color)'      },
            { min: 500,   max:3000,  icon: 'mdi:air-filter', color: 'var(--accent-color)'      },
            { min: 3000,  max:25000, icon: 'mdi:air-filter', color: 'var(--red-color)'         },
            { min: 25000, max:50000, icon: 'mdi:air-filter', color: 'var(--deep-purple-color)' },
        ],
    },
    pm25: {
        linear: false,
        style: [
            { min: 0,   max:12,  icon: 'mdi:air-filter', color: 'var(--success-color)'     },
            { min: 12,  max:35,  icon: 'mdi:air-filter', color: 'var(--yellow-color)'      },
            { min: 35,  max:55,  icon: 'mdi:air-filter', color: 'var(--accent-color)'      },
            { min: 55,  max:150, icon: 'mdi:air-filter', color: 'var(--red-color)'         },
            { min: 150, max:200, icon: 'mdi:air-filter', color: 'var(--deep-purple-color)' },
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
    },
    entityNotFound: {
        en: "entity: Entity not found in HA.",
        fr: "entity: Entité introuvable dans HA.",
        es: "entity: Entidad no encontrada en HA.",
        it: "entity: Entità non trovata in HA.",
        de: "entity: Entität in HA nicht gefunden.",
    },
    entityUnavailable: {
        en: "unavailable",
        fr: "indisponible",
        es: "no disponible",
        it: "non disponibile",
        de: "nicht verfügbar",
    },
    minValueError: {
        en: "min_value: Check your min_value.",
        fr: "min_value: Vérifiez votre min_value.",
        es: "min_value: Verifique su min_value.",
        it: "min_value: Controlla il tuo min_value.",
        de: "min_value: Überprüfen Sie Ihren min_value.",
    },
    maxValueError: {
        en: "max_value: Check your max_value.",
        fr: "max_value: Vérifiez votre max_value.",
        es: "max_value: Verifique su max_value.",
        it: "max_value: Controlla il tuo max_value.",
        de: "max_value: Überprüfen Sie Ihren max_value.",
    },
    decimalError: {
        en: "decimal: This value cannot be negative.",
        fr: "decimal: La valeur ne peut pas être négative.",
        es: "decimal: El valor no puede ser negativo.",
        it: "decimal: Questo valore non può essere negativo.",
        de: "decimal: Negative Werte sind nicht zulässig.",
    },
};


const THEME_KEY = "theme";
const NAVIGATETO_KEY = "navigate_to";
const TAP_ACTION_KEY = "tap_action";
const ENTITY_ATTRIBUTE = "attribute";
const TAG_HASELECT = 'ha-select';

const FIELD_TYPE = {
    entity: { type: 'entity', tag: 'ha-entity-picker'},
    attribute: { type: 'attribute', tag: 'ha-select'},
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
                    label: { en: 'Entity', fr: 'Entité', es: 'Entidad', it: 'Entità', de: 'Entität', },
                    type: FIELD_TYPE.entity.type,
                    width: '92%',
                    required: true,
                    isInGroup: null,
                    description: {
                        en: 'Select an entity from Home Assistant.',
                        fr: 'Sélectionnez une entité de Home Assistant.',
                        es: 'Seleccione una entidad de Home Assistant.',
                        it: 'Seleziona un\'entità da Home Assistant.',
                        de: 'Wählen Sie eine Entität aus Home Assistant.',
                    }},
    attribute: {    name: 'attribute',
                    label: { en: 'Attribute', fr: 'Attribut', es: 'Atributo', it: 'Attributo', de: 'Attribut', },
                    type: FIELD_TYPE.attribute.type,
                    width: '92%',
                    required: false,
                    isInGroup: ENTITY_ATTRIBUTE,
                    description: {
                        en: 'Select the attribute.',
                        fr: 'Sélectionnez l\'attribut.',
                        es: 'Seleccione el atributo.',
                        it: 'Seleziona l\'attributo.',
                        de: 'Wählen Sie das Attribut aus.',
                    }},
    name: {         name: 'name',
                    label: { en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome', de: 'Name', },
                    type: FIELD_TYPE.default.type,
                    width: '48%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter a name for the entity.',
                        fr: 'Saisissez un nom pour l\'entité.',
                        es: 'Introduzca un nombre para la entidad.',
                        it: 'Inserisci un nome per l\'entità.',
                        de: 'Geben Sie einen Namen für die Entität ein.',
                    }},
    unit: {         name: 'unit',
                    label: { en: 'Unit', fr: 'Unité', es: 'Nombre', it: 'Unità', de: 'Name', },
                    type: FIELD_TYPE.default.type,
                    width: '15%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'm, kg...',
                        fr: 'm, kg...',
                        es: 'm, kg...',
                        it: 'm, kg...',
                        de: 'm, kg...',
                    }},
    decimal: {      name: 'decimal',
                    label: { en: 'decimal', fr: 'decimal', es: 'decimal', it: 'Decimale', de: 'decimal', },
                    type: FIELD_TYPE.number.type,
                    width: '25%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Precision.',
                        fr: 'Précision.',
                        es: 'Precisión.',
                        it: 'Precisione.',
                        de: 'Präzision.',
                    }},
    min_value: {    name: 'min_value',
                    label: { en: 'Minimum value', fr: 'Valeur minimum', es: 'Valor mínimo', it: 'Valore minimo', de: 'Mindestwert',},
                    type: FIELD_TYPE.number.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter the minimum value.',
                        fr: 'Saisissez la valeur minimum.',
                        es: 'Introduzca el valor mínimo.',
                        it: 'Inserisci il valore minimo.',
                        de: 'Geben Sie den Mindestwert ein.',
                    }},
    max_value: {    name: 'max_value',
                    label: { en: 'Maximum value', fr: 'Valeur maximum', es: 'Valor máximo', it: 'Valore massimo', de: 'Höchstwert', },
                    type: FIELD_TYPE.default.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Enter the maximum value.',
                        fr: 'Saisissez la valeur maximum.',
                        es: 'Introduzca el valor máximo.',
                        it: 'Inserisci il valore massimo.',
                        de: 'Geben Sie den Höchstwert ein.',
                    }},
    tap_action: {   name: 'tap_action',
                    label: { en: 'Tap action', fr: 'Action au tap', es: 'Acción al tocar', it: 'Azione al tocco', de: 'Tippen Aktion', },
                    type: FIELD_TYPE.tap_action.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select the action.',
                        fr: 'Sélectionnez l\'action.',
                        es: 'Seleccione la acción.',
                        it: 'Seleziona l\'azione.',
                        de: 'Wählen Sie die Aktion.',
                    }},
    navigate_to: {  name: NAVIGATETO_KEY,
                    label: { en: 'Navigate to...', fr: 'Naviguer vers...', es: 'Navegar a...', it: 'Naviga verso...', de: 'Navigieren zu...',  },
                    type: FIELD_TYPE.default.type,
                    width: '45%',
                    required: false,
                    isInGroup: NAVIGATETO_KEY,
                    description: {
                        en: 'Enter the target (/lovelace/0).',
                        fr: 'Saisir la cible (/lovelace/0).',
                        es: 'Introduzca el objetivo (/lovelace/0).',
                        it: 'Inserisci il target (/lovelace/0).',
                        de: 'Geben Sie das Ziel (/lovelace/0) ein.',
                    }},
    theme: {        name: 'theme',
                    label: { en: 'Theme', fr: 'Thème', es: 'Tema', it: 'Tema', de: 'Thema', },
                    type: FIELD_TYPE.theme.type,
                    width: '92%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select a theme to automatically define the colors and icon.',
                        fr: 'Sélectionnez un thème pour définir automatiquement les couleurs et l\'icône.',
                        es: 'Seleccione un tema para definir automáticamente los colores y el icono.',
                        it: 'Seleziona un tema per definire automaticamente i colori e l\'icona.',
                        de: 'Wählen Sie ein Thema, um die Farben und das Symbol automatisch festzulegen.',
                    }},
    layout: {       name: 'layout',
                    label: { en: 'Layout', fr: 'Disposition', es: 'Disposición', it: 'Layout', de: 'Layout', },
                    type: FIELD_TYPE.layout.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: {
                        en: 'Select the layout.',
                        fr: 'Sélectionnez la disposition.',
                        es: 'Seleccione la disposición.',
                        it: 'Seleziona il layout.',
                        de: 'Wählen Sie das Layout.',
                    }},
    bar_color: {    name: 'bar_color',
                    label: { en: 'Color for the bar', fr: 'Couleur de la barre', es: 'Color de la barra', it: 'Colore per la barra', de: 'Farbe für die Leiste', },
                    type: FIELD_TYPE.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select the color for the bar.',
                        fr: 'Sélectionnez la couleur de la barre.',
                        es: 'Seleccione el color de la barra.',
                        it: 'Seleziona il colore per la barra.',
                        de: 'Wählen Sie für die Leiste.',
                    }},
    icon: {         name: 'icon',
                    label: { en: 'Icon', fr: 'Icône', es: 'Icono', it: 'Icona', de: 'Symbol', },
                    type: FIELD_TYPE.icon.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select an icon for the entity.',
                        fr: 'Sélectionnez une icône pour l\'entité.',
                        es: 'Seleccione un icono para la entidad.',
                        it: 'Seleziona un\'icona per l\'entità.',
                        de: 'Wählen Sie ein Symbol für die Entität.',
                    }},
    color: {        name: 'color',
                    label: { en: 'Primary color', fr: 'Couleur de l\'icône', es: 'Color del icono', it: 'Colore dell\'icona', de: 'Primärfarbe', },
                    type: FIELD_TYPE.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: THEME_KEY,
                    description: {
                        en: 'Select the primary color for the icon.',
                        fr: 'Sélectionnez la couleur de l\'icône.',
                        es: 'Seleccione el color principal del icono.',
                        it: 'Seleziona un\'icona per l\'entità.',
                        de: 'Wählen Sie die Primärfarbe für das Symbol.',
                    }},
};

const FIELD_OPTIONS = {
    theme: [
        { value: '',            label: { en: 'Disabled (default)', fr: 'Désactivé (défaut)', es: 'Desactivado (defecto)', it: 'Disabilitato (predefinito)', de: 'Deaktiviert (Standard)' }, icon: "mdi:palette-outline" },
        { value: 'battery',     label: { en: 'Battery', fr: 'Batterie', es: 'Batería', it: 'Batteria', de: 'Batterie'},                                                                     icon: "mdi:battery" },
        { value: 'light',       label: { en: 'Light', fr: 'Lumière', es: 'Luz', it: 'Luce', de: 'Licht' },                                                                                  icon: "mdi:lightbulb" },
        { value: 'temperature', label: { en: 'Temperature', fr: 'Température', es: 'Temperatura', it: 'Temperatura', de: 'Temperatur'  },                                                   icon: "mdi:thermometer" },
        { value: 'humidity',    label: { en: 'Humidity', fr: 'Humidité', es: 'Humedad', it: 'Umidità', de: 'Feuchtigkeit'  },                                                               icon: "mdi:water-percent" },
        { value: 'voc',         label: { en: 'VOC', fr: 'VOC', es: 'VOC', it: 'VOC', de: 'VOC'  },                                                                                          icon: "mdi:air-filter" },
        { value: 'pm25',        label: { en: 'PM2.5', fr: 'PM2.5', es: 'PM2.5', it: 'PM2.5', de: 'PM2.5' },                                                                                 icon: "mdi:air-filter" },
    ],
    color: [
        { value: 'var(--state-icon-color)', label: { en: 'Default', fr: 'Défaut', es: 'Predeterminado', it: 'Predefinito', de: 'Standard' } },
        { value: 'var(--accent-color)', label: { en: 'Accent', fr: 'Accent', es: 'Acento', it: 'Accentuato', de: 'Akzent' } },
        { value: 'var(--info-color)', label: { en: 'Info', fr: 'Info', es: 'Información', it: 'Info', de: 'Info' } },
        { value: 'var(--success-color)', label: { en: 'Success', fr: 'Succès', es: 'Éxito', it: 'Successo', de: 'Erfolg' } },
        { value: 'var(--disabled-color)', label: { en: 'Disable', fr: 'Désactivé', es: 'Deshabilitado', it: 'Disabilitato', de: 'Deaktiviert' } },
        { value: 'var(--red-color)', label: { en: 'Red', fr: 'Rouge', es: 'Rojo', it: 'Rosso', de: 'Rot' } },
        { value: 'var(--pink-color)', label: { en: 'Pink', fr: 'Rose', es: 'Rosa', it: 'Rosa', de: 'Pink' } },
        { value: 'var(--purple-color)', label: { en: 'Purple', fr: 'Violet', es: 'Púrpura', it: 'Viola', de: 'Lila' } },
        { value: 'var(--deep-purple-color)', label: { en: 'Deep purple', fr: 'Violet foncé', es: 'Púrpura profundo', it: 'Viola scuro', de: 'Dunkellila' } },
        { value: 'var(--indigo-color)', label: { en: 'Indigo', fr: 'Indigo', es: 'Índigo', it: 'Indaco', de: 'Indigo' } },
        { value: 'var(--blue-color)', label: { en: 'Blue', fr: 'Bleu', es: 'Azul', it: 'Blu', de: 'Blau' } },
        { value: 'var(--light-blue-color)', label: { en: 'Light blue', fr: 'Bleu clair', es: 'Azul claro', it: 'Blu chiaro', de: 'Hellblau' } },
        { value: 'var(--cyan-color)', label: { en: 'Cyan', fr: 'Cyan', es: 'Cian', it: 'Ciano', de: 'Cyan' } },
        { value: 'var(--teal-color)', label: { en: 'Teal', fr: 'Bleu sarcelle', es: 'Verde azulado', it: 'Verde acqua', de: 'Blaugrün' } },
        { value: 'var(--green-color)', label: { en: 'Green', fr: 'Vert', es: 'Verde', it: 'Verde', de: 'Grün' } },
        { value: 'var(--light-green-color)', label: { en: 'Light green', fr: 'Vert clair', es: 'Verde claro', it: 'Verde chiaro', de: 'Hellgrün' } },
        { value: 'var(--lime-color)', label: { en: 'Lime', fr: 'Citron vert', es: 'Lima', it: 'Lime', de: 'Limette' } },
        { value: 'var(--yellow-color)', label: { en: 'Yellow', fr: 'Jaune', es: 'Amarillo', it: 'Giallo', de: 'Gelb' } },
        { value: 'var(--amber-color)', label: { en: 'Amber', fr: 'Ambre', es: 'Ámbar', it: 'Ambra', de: 'Bernstein' } },
        { value: 'var(--orange-color)', label: { en: 'Orange', fr: 'Orange', es: 'Naranja', it: 'Arancione', de: 'Orange' } },
        { value: 'var(--deep-orange-color)', label: { en: 'Deep orange', fr: 'Orange foncé', es: 'Naranja oscuro', it: 'Arancione scuro', de: 'Dunkelorange' } },
        { value: 'var(--brown-color)', label: { en: 'Brown', fr: 'Marron', es: 'Marrón', it: 'Marrone', de: 'Braun' } },
        { value: 'var(--light-grey-color)', label: { en: 'Light grey', fr: 'Gris clair', es: 'Gris claro', it: 'Grigio chiaro', de: 'Hellgrau' } },
        { value: 'var(--grey-color)', label: { en: 'Grey', fr: 'Gris', es: 'Gris', it: 'Grigio', de: 'Grau' } },
        { value: 'var(--dark-grey-color)', label: { en: 'Dark grey', fr: 'Gris foncé', es: 'Gris oscuro', it: 'Grigio scuro', de: 'Dunkelgrau' } },
        { value: 'var(--blue-grey-color)', label: { en: 'Blue grey', fr: 'Gris bleuté', es: 'Gris azulado', it: 'Grigio bluastro', de: 'Blaugrau' } },
        { value: 'var(--black-color)', label: { en: 'Black', fr: 'Noir', es: 'Negro', it: 'Nero', de: 'Schwarz' } },
        { value: 'var(--white-color)', label: { en: 'White', fr: 'Blanc', es: 'Blanco', it: 'Bianco', de: 'Weiß' } }
    ],
    layout: [
        { value: 'horizontal', label: { en: 'Horizontal (default)', fr: 'Horizontal (par défaut)', es: 'Horizontal (predeterminado)', it: 'Orizzontale (predefinito)', de: 'Horizontal (Standard)',}, icon: CARD.layout.horizontal.mdi, },
        { value: 'vertical', label: { en: 'Vertical', fr: 'Vertical', es: 'Vertical', it: 'Verticale', de: 'Vertikal',}, icon: CARD.layout.vertical.mdi, },
    ],
    tap_action: [
        { value: CARD.tap_action.more_info, label: { en: 'More info (default)', fr: 'Plus d\'infos (par défaut)', es: 'Más información (predeterminado)', it: 'Più informazioni (predefinito)', de: 'Mehr Infos (Standard)', }},
        { value: CARD.tap_action.navigate_to, label: { en: 'Navigate to...', fr: 'Naviguer vers...', es: 'Navegar a...', it: 'Naviga a...', de: 'Zu navigieren...', }},
        { value: CARD.tap_action.no_action, label: { en: 'No action', fr: 'Aucune action', es: 'Sin acción', it: 'Nessuna azione', de: 'Keine Aktion', }}
    ]
};

const ATTRIBUTE_MAPPING = {
    cover: {label: "cover", attribute: "current_position"},
    light: {label: "light" , attribute: "brightness"},
    fan: {label: "fan", attribute: "percentage"},
    climate: {label: "climate", attribute: null},
    humidifier: {label: "humidifier", attribute: null},
    media_player: {label: "media_player", attribute: null},
    vacuum: {label: "vacuum", attribute: null},
    device_tracker: {label: "device_tracker", attribute: null},
    weather: {label: "weather", attribute: null},
};

/**
 * Represents a numeric value that can be valid or invalid.
 *
 * @class Value
 */
class Value {
    /**
     * Creates a new instance of Value.
     *
     * @param {number} [value=null] - The numeric value. Defaults to null.
     * @param {boolean} [isValid=false] - Indicates whether the value is valid. Defaults to false.
     */
    constructor(value = null, isValid = false) {
        this._value = value;
        this._isValid = isValid;
    }

    /**
     * Sets the numeric value.
     * If the new value is not a number or is NaN, the value is considered invalid.
     *
     * @param {number} newValue - The new numeric value.
     */
    set value(newValue) {
        if (typeof newValue !== 'number' || isNaN(newValue)) {
            this._isValid = false;
            return;
        }
        this._value = newValue;
        this._isValid = true;
    }
    /**
     * Returns the numeric value.
     *
     * @returns {number} The numeric value.
     */
    get value() {
        return this._value;
    }
    /**
     * Indicates whether the value is valid.
     *
     * @returns {boolean} True if the value is valid, false otherwise.
     */
    get isValid() {
        return this._isValid;
    }
}

/**
 * Represents a non-negative integer value that can be valid or invalid.
 *
 * @class Decimal
 */
class Decimal {
    /**
     * Creates a new instance of Decimal.
     *
     * @param {number} [value=null] - The non-negative integer value. Defaults to null.
     * @param {boolean} [isValid=false] - Indicates whether the value is valid. Defaults to false.
     */
    constructor(value = null, isValid = false) {
        this._value = value;
        this._isValid = isValid;
    }

    /**
     * Sets the non-negative integer value.
     * If the new value is not a number, is NaN, is negative, or is not an integer, the value is considered invalid.
     *
     * @param {number} newValue - The new non-negative integer value.
     */
    set value(newValue) {
        if (typeof newValue !== 'number' || isNaN(newValue) || !(newValue >= 0) || !Number.isInteger(newValue)) {
            this._isValid = false;
            return;
        }
        this._value = newValue;
        this._isValid = true;
    }

    /**
     * Returns the non-negative integer value.
     *
     * @returns {number} The non-negative integer value.
     */
    get value() {
        return this._value;
    }

    /**
     * Indicates whether the value is valid.
     *
     * @returns {boolean} True if the value is valid, false otherwise.
     */
    get isValid() {
        return this._isValid;
    }
}

/**
 * Represents a unit of measurement, stored as a string.
 *
 * @class Unit
 */
class Unit {
    /**
     * Creates a new instance of Unit.
     *
     * @param {string} [value=''] - The unit of measurement. Defaults to an empty string.
     */
    constructor(value = '') {
        this._value = value;
    }

    /**
     * Sets the unit of measurement.
     * If the new value is not a string, it will be converted to one.
     *
     * @param {string|*} newValue - The new unit of measurement.
     */
    set value(newValue) {
        if (typeof newValue === 'string') {
            this._value = newValue;
        } else {
            this._value = String(newValue);
        }
    }

    /**
     * Returns the unit of measurement.
     *
     * @returns {string} The unit of measurement.
     */
    get value() {
        return this._value;
    }
}

/**
 * Helper class for calculating and formatting percentages.
 * This class uses `Value`, `Unit`, and `Decimal` objects to manage and validate its internal data.
 *
 * @class PercentHelper
 */
class PercentHelper {
    /**
     * Creates a new instance of PercentHelper.
     *
     * @param {number} [currentValue=0] - The current value. Defaults to 0.
     * @param {number} [minValue=CARD.config.minValue] - The minimum value. Defaults to CARD.config.minValue.
     * @param {number} [maxValue=CARD.config.maxPercent] - The maximum percentage value. Defaults to CARD.config.maxPercent.
     * @param {string} [unit=CARD.config.unit.default] - The unit of measurement. Defaults to CARD.config.unit.default.
     * @param {number} [decimal=CARD.config.decimal.percentage] - The number of decimal places to use. Defaults to CARD.config.decimal.percentage.
     */
    constructor(currentValue = 0, minValue = CARD.config.minValue, maxValue = CARD.config.maxPercent, unit = CARD.config.unit.default, decimal = CARD.config.decimal.percentage) {
        /**
         * @type {Value}
         * @private
         */
        this._min = new Value(minValue);
        /**
         * @type {Value}
         * @private
         */
        this._max = new Value(maxValue);
        /**
         * @type {Value}
         * @private
         */
        this._current = new Value(currentValue);
        /**
         * @type {Unit}
         * @private
         */
        this._unit = new Unit(unit);
        /**
         * @type {Decimal}
         * @private
         */
        this._decimal = new Decimal(decimal);
        /**
         * @type {number}
         * @private
         */
        this._percent = 0;
        /**
         * @type {string}
         * @private
         */
        this._label = null;
    }
    /**
     * Sets the minimum value.
     *
     * @param {number} [newMin] - The new minimum value. If not provided, defaults to CARD.config.minValue.
     */
    set min(newMin) {
        if (!newMin) {
            newMin = CARD.config.minValue;
        }
        this._min.value = newMin;
    }
    /**
     * Sets the maximum percentage value.
     *
     * @param {number} [newMax] - The new maximum value. If not provided, defaults to CARD.config.maxPercent.
     */
    set max(newMax) {
        if (!newMax) {
            newMax = CARD.config.maxPercent;
        }
        this._max.value = newMax;
    }

    /**
     * Sets the current value.
     *
     * @param {number} newCurrent - The new current value.
     */
    set current(newCurrent) {
        this._current.value = newCurrent;
    }

    /**
     * Returns the unit of measurement.
     *
     * @returns {string} The unit of measurement.
     */
    get unit() {
        return this._unit.value;
    }

    /**
     * Sets the unit of measurement.
     *
     * @param {string} [newUnit] - The new unit of measurement. If not provided, defaults to CARD.config.unit.default.
     */
    set unit(newUnit) {
        if (!newUnit) {
            newUnit = CARD.config.unit.default;
        }
        this._unit.value = newUnit;
    }

    /**
     * Sets the number of decimal places to use.
     * If no value is provided, it defaults to CARD.config.decimal.percentage if the unit is CARD.config.unit.default,
     * otherwise it defaults to CARD.config.decimal.other.
     *
     * @param {number} [newDecimal] - The new number of decimal places.
     */
    set decimal(newDecimal) {
        if (newDecimal === undefined || newDecimal === null) {
            if (this._unit.value === CARD.config.unit.default) {
                newDecimal = CARD.config.decimal.percentage;
            } else {
                newDecimal = CARD.config.decimal.other;
            }
        }
        this._decimal.value = newDecimal;
    }

    valueForThemes(themeIsLinear) {
        let value = this._current.value;
        if (this._unit.value === CARD.config.unit.fahrenheit) {
            value = (value - 32) * 5 / 9;
        }
        return themeIsLinear || this._unit.value === CARD.config.unit.default ? this._percent : value;
    }

    /**
     * Checks if all internal values are valid.
     *
     * @returns {boolean} True if all values are valid, false otherwise.
     */
    get isValid() {
        if (!this._min.isValid || !this._max.isValid || !this._current.isValid || !this._decimal.isValid) {
            return false;
        }
        return true;
    }

    /**
     * Calculates and updates the percentage value based on the current, minimum, and maximum values.
     */
    refresh() {
        if (!this.isValid) {
            return;
        }
        const range = this._max.value - this._min.value;
        const correctedValue = this._current.value - this._min.value;
        const percent = (correctedValue / range) * 100;
        this._percent = parseFloat(percent.toFixed(this._decimal.value));
    }

    /**
     * Returns the calculated percentage value.
     *
     * @returns {number|null} The percentage value, or null if the internal values are invalid.
     */
    get percent() {
        if (!this.isValid) {
            return null;
        }
        return this._percent;
    }

    /**
     * Returns a formatted label with the value and unit.
     *
     * @returns {string} The formatted label.
     */
    get label() {
        let value = this._percent;
        if (this._unit.value !== CARD.config.unit.default) {
            value = this._current.value;
        }
        return `${value.toFixed(this._decimal.value)}${this._unit.value}`;
    }
}

/**
 * Manages the theme and its associated icon and color based on a percentage value.
 *
 * @class ThemeManager
 */
class ThemeManager {
    /**
     * Creates a new instance of ThemeManager.
     *
     * @param {string} [theme=null] - The name of the theme. Defaults to null.
     * @param {number} [percent=0] - The percentage value used to determine the theme's icon and color. Defaults to 0.
     */
    constructor(theme = null, value = 0, isValid=false) {
        /**
         * @type {string}
         * @private
         */
        this._theme = theme;
        /**
         * @type {string}
         * @private
         */
        this._icon = null;
        /**
         * @type {string}
         * @private
         */
        this._color = null;
        /**
         * @type {number}
         * @private
         */
        this._value = value;
        /**
         * @type {boolean}
         * @private
         */
        this._isValid = isValid;
    }

    /**
     * Returns the name of the current theme.
     *
     * @returns {string} The name of the theme.
     */
    get theme() {
        return this._theme;
    }

    /**
     * Sets the theme.
     * If the theme name is invalid (not found in `THEME`), the icon, color, and theme are reset to null.
     *
     * @param {string} newTheme - The name of the new theme.
     */
    set theme(newTheme) {
        if (!THEME[newTheme]) {
            this._icon = null;
            this._color = null;
            this._theme = null;
            return;
        }
        this._theme = newTheme;
        this._isValid = true;
    }

    get isLinear() {
        if (this._isValid) {
            return THEME[this._theme].linear;
        }
        return false;
    }

    get isValid() {
        return this._isValid;
    }

    /**
     * Sets the percentage value and refreshes the icon and color.
     *
     * @param {number} newPercent - The new percentage value.
     */
    set value(newValue) {
        this._value = newValue;
        this._refresh();
    }

    /**
     * Returns the icon associated with the current theme and percentage.
     *
     * @returns {string} The icon.
     */
    get icon() {
        return this._icon;
    }

    /**
     * Returns the color associated with the current theme and percentage.
     *
     * @returns {string} The color.
     */
    get color() {
        return this._color;
    }

    /**
     * Updates the icon and color based on the current theme and percentage.
     * This method calculates the appropriate icon and color from the `THEME` object based on the percentage value.
     *
     * @private
     */
    _refresh() {
        if (!this._isValid) {
            return;
        }
        if (this.isLinear) {
            this._setLinearStyle();
        } else {
            this._setStyle();
        }
    }

    _setLinearStyle() {
        const currentStyle = THEME[this._theme].style;
        const lastStep = currentStyle.length - 1;
        const thresholdSize = 100 / lastStep;
        const percentage = Math.max(0, Math.min(this._value, CARD.config.maxPercent));
        const themeData = currentStyle[Math.floor(percentage / thresholdSize)];
        this._icon = themeData.icon;
        this._color = themeData.color;
    }

    _setStyle() {
        const currentStyle = THEME[this._theme].style;
        let themeData = null;
        if (this._value === CARD.config.maxPercent) {
            themeData = currentStyle[currentStyle.length - 1];
        } else {
            themeData = currentStyle.find(level => this._value >= level.min && this._value < level.max);
        }
        if (themeData) {
            this._icon = themeData.icon;
            this._color = themeData.color;
        }
    }
}

/**
 * Provides access to the Home Assistant object.
 * This class implements a singleton pattern to ensure only one instance exists.
 *
 * @class HassProvider
 */
class HassProvider {
    /**
     * @type {HassProvider}
     * @private
     * @static
     */
    static _instance = null;

    /**
     * Creates a new instance of HassProvider.
     * If an instance already exists, it returns the existing instance.
     */
    constructor() {
        if (HassProvider._instance) {
            return HassProvider._instance;
        }
        /**
         * @type {object}
         * @private
         */
        this._hass = null;
        HassProvider._instance = this;
    }

    /**
     * Sets the Home Assistant object.
     *
     * @param {object} hass - The Home Assistant object.
     */
    set hass(hass) {
        this._hass = hass;
    }

    /**
     * Returns the Home Assistant object.
     *
     * @returns {object} The Home Assistant object.
     */
    get hass() {
        return this._hass;
    }

    /**
     * Returns the language configured in Home Assistant.
     *
     * @returns {string} The language code.
     */
    get language() {
        return this._hass.config.language;
    }
}

/**
 * Represents either an entity ID or a direct value.
 * This class validates the provided value and retrieves information from Home Assistant if it's an entity.
 *
 * @class EntityOrValue
 */
class EntityOrValue {
    /**
     * Creates a new instance of EntityOrValue.
     */
    constructor() {
        /**
         * @type {object|string}
         * @private
         */
        this._value = {};
        /**
         * @type {HassProvider}
         * @private
         */
        this._hassProvider = new HassProvider();
        /**
         * @type {boolean}
         * @private
         */
        this._isValid = false;
        /**
         * @type {boolean}
         * @private
         */
        this._isAvailable = false;
        /**
         * @type {boolean}
         * @private
         */
        this._isFound = false;
        /**
         * @type {string}
         * @private
         */
        this._entity = null;
        /**
         * @type {string}
         * @private
         */
        this._attribute = null;
    }
    /**
     * Sets the value, which can be an entity ID or a direct value.
     * Triggers validation and updates internal state.
     *
     * @param {object|string} newValue - The new value to set.
     */
    set value(newValue) {
        this._value = newValue;
        this._checkValue();
    }
    /**
     * Returns the validated value.
     * Returns null if the value is invalid.
     *
     * @returns {object|string|null} The validated value.
     */
    get value() {
        if (this._isValid) {
            return this._value;
        } else {
            return null;
        }
    }
    /**
     * Sets the attribute.
     *
     * @param {object|string} newAttribute - The new value to set.
     */
    set attribute(newAttribute) {
        this._attribute = newAttribute;
    }
    /**
     * Indicates whether the value is valid.
     *
     * @returns {boolean} True if the value is valid, false otherwise.
     */
    get isValid() {
        return this._isValid;
    }
    /**
     * Indicates whether the entity (if applicable) is available.
     *
     * @returns {boolean} True if the entity is available, false otherwise.
     */
    get isAvailable() {
        return this._isAvailable;
    }
    /**
     * Indicates whether the entity (if applicable) was found in Home Assistant.
     *
     * @returns {boolean} True if the entity is found, false otherwise.
     */
    get isFound() {
        return this._isFound;
    }
    /**
     * Returns the display precision of the entity (if applicable).
     * Returns null if the value is not a valid entity.
     *
     * @returns {number|null} The display precision of the entity.
     */
    get precision() {
        if (this._isValid) {
            return this._hassProvider.hass.entities[this._entity].display_precision;
        } else {
            return null;
        }
    }
    /**
     * Returns the friendly name of the entity (if applicable).
     * Returns null if the value is not a valid entity.
     *
     * @returns {string|null} The friendly name of the entity.
     */
    get name(){
        if (this._isValid) {
            return this._hassProvider.hass.states[this._entity].attributes.friendly_name;
        } else {
            return null;
        }
    }
    /**
     * Returns the icon of the entity (if applicable).
     * Returns null if the value is not a valid entity.
     *
     * @returns {string|null} The icon of the entity.
     */
    get icon(){
        if (this._isValid) {
            return this._hassProvider.hass.states[this._entity].attributes.icon;
        } else {
            return null;
        }
    }
    /**
     * Validates the value and updates internal state.
     * Checks if the value is a valid entity ID or a direct value.
     *
     * @private
     */
    _checkValue() {
        this._isFound = false;
        this._isValid = false;
        this._isAvailable = false;

        if (Number.isFinite(this._value)) {
            this._isFound = true;
            this._isValid = true;
            this._isAvailable = true;
            return;
        } else if (typeof this._value === "string") {
            if (!this._hassProvider.hass.states[this._value]) {
                return;
            }
            this._entity = this._value;
            this._isFound = true;
            const entityState = this._hassProvider.hass.states[this._entity].state;
            if (!entityState) {
                this._isValid = true;
                this._value = 0;
                return;
            } else if (entityState === "unavailable" || entityState === "unknown") {
                this._value = 0;
                return;
            }
            this._isValid = true;
            this._isAvailable = true;
            const entityType = this._entity.split(".")[0]; // "cover", "light", "fan", etc.
            if (ATTRIBUTE_MAPPING[entityType]) {
                const attribute = this._attribute ?? ATTRIBUTE_MAPPING[entityType].attribute;
                if (attribute && this._hassProvider.hass.states[this._entity].attributes.hasOwnProperty(attribute)) {
                    this._value = this._hassProvider.hass.states[this._entity].attributes[attribute] ?? 0;
                    if (entityType === ATTRIBUTE_MAPPING.light.label && attribute === ATTRIBUTE_MAPPING.light.attribute) {
                        this._value = (100 * this._value) / 255;
                    }
                } else { // attribute not supported
                    this._value = 0;
                }
            } else {
                this._value = parseFloat(entityState) || 0;
            }
            return;
        }
        this._value = 0;
        return;
    }
}

/**
 * Helper class for managing and validating card configuration.
 *
 * @class ConfigHelper
 */
class ConfigHelper {
    /**
     * Creates a new instance of ConfigHelper.
     */
    constructor() {
        /**
         * @type {object}
         * @private
         */
        this._config = {};
        /**
         * @type {HassProvider}
         * @private
         */
        this._hassProvider = new HassProvider();
        /**
         * @type {boolean}
         * @private
         */
        this._isValid = false;
        /**
         * @type {string|null}
         * @private
         */
        this._msg = null;
        /**
         * @type {boolean}
         * @private
         */
        this._isChanged = false;
        /**
         * @type {number|null}
         * @private
         */
        this._decimal = null;
        /**
         * @type {number|null}
         */
        this.max_value = null;
    }

    /**
     * Returns the card configuration object.
     *
     * @returns {object} The card configuration.
     */
    get config() {
        return this._config;
    }

    /**
     * Sets the card configuration and marks it as changed.
     *
     * @param {object} config - The new card configuration.
     */
    set config(config) {
        this._config = config;
        this._isChanged = true;
    }

    /**
     * Returns the number of decimal places to use.
     *
     * @returns {number|null} The number of decimal places.
     */
    get decimal() {
        return this._decimal;
    }

    /**
     * Sets the number of decimal places.
     * Defaults to `CARD.config.decimal.percentage` if the unit is `CARD.config.unit.default`,
     * otherwise defaults to `CARD.config.decimal.other`.
     *
     * @param {number} [newDecimal] - The new number of decimal places.
     */
    set decimal(newDecimal) {
        if (newDecimal === undefined || newDecimal === null) {
            if (this._config.unit === CARD.config.unit.default) {
                newDecimal = CARD.config.decimal.percentage;
            } else {
                newDecimal = CARD.config.decimal.other;
            }
        }
        this._decimal = newDecimal;
    }

    /**
     * Indicates whether the current configuration is valid.
     *
     * @returns {boolean} True if the configuration is valid, false otherwise.
     */
    get isValid() {
        return this._isValid;
    }

    /**
     * Returns the validation error message, or null if the configuration is valid.
     *
     * @returns {string|null} The error message.
     */
    get msg() {
        return this._msg;
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
    checkConfig() {

        if (!this._isChanged){
            return;
        }
        this._isChanged = false;

        const entityState = this._hassProvider.hass.states[this._config.entity];

        this._isValid = false;
        if (!this._config.entity) {
            this._msg = MSG.entityError;
            return;
        } else if (!entityState) {
            this._msg = MSG.entityNotFound;
            return;
        }  else if (this._config.min_value && !Number.isFinite(this._config.min_value)) {
            this._msg = MSG.minValueError;
            return;
        } else if (!Number.isFinite(this.max_value)){
            this._msg = MSG.maxValueError;
            return;
        } else if (this._decimal < 0) {
            this._msg = MSG.decimalError;
            return;
        }

        this._isValid = true;
        this._msg = null;

        return;
    }
}

/**
 * A card view that manage all informations to create the card.
 *
 * @class CardView
 */
class CardView {
    constructor() {
        this._hassProvider = new HassProvider();
        this._configHelper = new ConfigHelper();
        this._percentHelper = new PercentHelper();
        this._theme = new ThemeManager();
        this.currentLanguage = CARD.config.language;
        this.show_more_info = null;
        this.navigate_to = null;
        this.layout = null;
        /** */
        this._currentValue = new EntityOrValue();
        this._max_value = new EntityOrValue();
        this.isAvailable = false;
    }

    /**
     * Returns whether the card configuration is valid.
     *
     * @returns {boolean} True if the configuration is valid, false otherwise.
     */
    get isValid(){
        return this._configHelper.isValid;
    }

    /**
     * Returns the validation error message, or null if the configuration is valid.
     *
     * @returns {string|null} The error message.
     */
    get msg(){
        return this._configHelper.msg[this.currentLanguage];
    }

    /**
     * Returns the card configuration.
     *
     * @returns {object} The card configuration.
     */
    get config(){
        return this._config;
    }

    /**
     * Sets the card configuration and updates related properties.
     *
     * @param {object} config - The new card configuration.
     */
    set config(config) {
        this._configHelper.config       = config;
        this.layout                     = config.layout;
        this._percentHelper.unit        = config.unit;
        this.show_more_info             = typeof config.show_more_info === 'boolean' ? config.show_more_info : CARD.config.showMoreInfo;
        this.navigate_to                = config.navigate_to !== undefined ? config.navigate_to : null;
        this._theme.theme               = config.theme;
        this._currentValue.attribute    = config.attribute || null;
    }

    /**
     * Refreshes the card by updating the current value and checking for availability.
     *
     * @param {object} hass - The Home Assistant object.
     */
    refresh(hass) {
        this._hassProvider.hass = hass;
        this.currentLanguage = Object.keys(MSG.entityError).includes(this._hassProvider.language)
            ? this._hassProvider.language
            : CARD.config.language;
        this._currentValue.value = this._configHelper.config.entity;
        this._max_value.value = this._configHelper.config.max_value || CARD.config.maxPercent;
        this._configHelper.max_value = this._max_value.value;
        this._configHelper.decimal = this._configHelper.config.decimal ?? this._currentValue.precision;
        this._configHelper.checkConfig();

        // availability check
        if (!this._currentValue.isAvailable || (!this._max_value.isAvailable && this._configHelper.config.max_value)){
            this.isAvailable=false;
            return;
        }
        this.isAvailable=true;
        // update
        this._percentHelper.current = this._currentValue.value;
        this._percentHelper.decimal = this._configHelper.config.decimal ?? this._currentValue.precision;
        this._percentHelper.min = this._configHelper.config.min_value;
        this._percentHelper.max = this._max_value.value;
        this._percentHelper.refresh();
        this._theme.value = this._percentHelper.valueForThemes(this._theme.isLinear);
    }

    /**
     * Returns the entity used in the card.
     *
     * @returns {string} The entity.
     */
    get entity() {
        return this._configHelper.config.entity;
    }

    /**
     * Returns the icon to use based on the theme, configuration, and entity.
     *
     * @returns {string} The icon.
     */
    get icon() {
        if (this._theme.theme === "battery" && this._currentValue.icon && this._currentValue.icon.includes("battery")) {
            return this._currentValue.icon;
        }
        return this._theme.icon || this._configHelper.config.icon || this._currentValue.icon || CARD.config.icon;
    }

    /**
     * Returns the color to use based on the theme or configuration.
     *
     * @returns {string} The color.
     */
    get color() {
        return this._theme.color || this._configHelper.config.color || CARD.config.color;
    }

    /**
     * Returns the color to use for the progress bar.
     *
     * @returns {string} The bar color.
     */
    get bar_color() {
        return this._theme.color || this._configHelper.config.bar_color || CARD.config.color;
    }

    /**
     * Returns the percentage value.
     *
     * @returns {number} The percentage value.
     */
    get percent() {
        if(this.isAvailable) {
            return this._percentHelper.percent;
        }
        return CARD.config.minValue;
    }

    /**
     * Returns the description, which is the formatted percentage value or the unavailable message.
     *
     * @returns {string} The description.
     */
    get description() {
        if(this.isAvailable) {
            return this._percentHelper.label;
        }
        return MSG.entityUnavailable[this.currentLanguage];
    }

    /**
     * Returns the name of the entity or the configured name.
     *
     * @returns {string} The name.
     */
    get name() {
        return this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
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
    /**
     * Constructor for the EntityProgressCard component.
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._cardView = new CardView();

        if (!EntityProgressCard._moduleLoaded) {
            console.groupCollapsed(
                CARD.console.message,
                CARD.console.css
            );
            console.log(CARD.console.link);
            console.groupEnd();
            EntityProgressCard._moduleLoaded = true;
        }

        this._elements = {};
        this._isBuilt = false;
        this.addEventListener('click', this._handleCardAction.bind(this));
    }

    _handleCardAction() {
        if (this._cardView.navigate_to) {
            this._navigateTo();
        } else if (this._cardView.show_more_info) {
            this._showMoreInfo();
        }
    }

    _navigateTo() {
        if (/^https?:\/\//.test(this._cardView.navigate_to)) {
            window.location.href = this._cardView.navigate_to;
            return;
        }

        window.history.pushState(null, '', this._cardView.navigate_to);
        this.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));

        const anchor = this._cardView.navigate_to.split('#')[1];
        if (anchor) {
            const element = document.querySelector(`#${anchor}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn(`Ancre non trouvée: ${anchor}`);
            }
        }
    }

    _showMoreInfo() {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: this._cardView.entity },
        }));
      }

    /**
     * Creates and returns a new configuration element for the component.
     *
     * @returns {HTMLElement} A newly created configuration element.
     */
    static getConfigElement() {
        return document.createElement(CARD.editor);
    }

    /**
     * Updates the component's configuration and triggers static changes.
     *
     * **Note:** Dynamic Updates will be done in set hass function.
     *
     * @param {Object} config - The new configuration object.
     */
    setConfig(config) {
        const layoutChanged = this._cardView.layout !== config.layout;
        this._cardView.config = config;

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
     * @param {Object} hass - The Home Assistant instance containing the current
     *                        state and services.
     */
    set hass(hass) {
        this._cardView.refresh(hass);
        this._updateDynamicElements();
    }

    /**
     * Builds and initializes the structure of the custom card component.
     *
     * This method creates the visual and structural elements of the card and injects
     * them into the component's Shadow DOM.
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
            [SELECTORS.alert_icon]: this.shadowRoot.querySelector(`.${SELECTORS.alert_icon}`),
            [SELECTORS.alert_message]: this.shadowRoot.querySelector(`.${SELECTORS.alert_message}`),
            [SELECTORS.ha_icon]: this.shadowRoot.querySelector(`${SELECTORS.ha_icon}`),
        };
    }

    /**
     * Changes the layout of the card based on the current configuration.
     *
     * This method adjusts the styling of various DOM elements based on the selected
     * layout configuration. It uses predefined CSS styles to switch between two
     * layout modes.
     *
     */
    _changeLayout() {
        if (this._cardView.layout === CARD.layout.vertical.label) {
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
     * Updates dynamic card elements based on the entity's state and configuration.
     *
     * Handles errors gracefully (e.g., invalid config, unavailable entity).
     *
     * @returns {void}
     */
    _updateDynamicElements() {
        if (!this._cardView.isValid) {
            this._showError(this._cardView.msg);
            return;
        } else {
            this._hideError();
        }

        this._updateElement(SELECTORS.progressBarInner, (el) => {
            el.style.width = `${this._cardView.percent}%`;
            el.style.backgroundColor = this._cardView.bar_color;
        });

        this._updateElement(SELECTORS.icon, (el) => {
            el.setAttribute(SELECTORS.icon, this._cardView.icon);
            el.style.color = this._cardView.color;
        });

        this._updateElement(SELECTORS.shape, (el) => {
            el.style.backgroundColor = this._cardView.color;
        });

        this._updateElement(SELECTORS.name, (el) => {
            el.textContent = this._cardView.name;
        });

        this._updateElement(SELECTORS.percentage, (el) => {
                el.textContent = this._cardView.description;
        });
    }

    /**
     * Displays an error alert with the provided message.
     *
     * This method shows an error alert on the card by updating the corresponding
     * DOM element (identified by `SELECTORS.alert`).
     *
     * @param {string} message - The error message to display in the alert.
     */
    _showError(message) {
        this._updateElement(SELECTORS.alert, (el) => {
            el.style.display = HTML.flex.show;
        });
        this._updateElement(SELECTORS.alert_icon, (el) => {
            el.setAttribute("icon", CARD.config.alert_icon);
            el.style.color = CARD.config.alert_icon_color;
        });
        this._updateElement(SELECTORS.alert_message, (el) => {
            el.textContent = message;
        });
    }

    /**
     * Hides the error alert by setting its display style to hide.
     *
     * This method hides the error alert on the card by changing the `display`
     * style of the corresponding DOM element (identified by `SELECTORS.alert`).
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
     * @returns {number} - The number of grid rows for the current card layout.
     */
    getCardSize() {
        if (this._cardView.layout === CARD.layout.vertical.label) {
            return CARD.layout.vertical.value.grid_rows;
        }
        return CARD.layout.horizontal.value.grid_rows;
    }

    /**
     * Returns the layout options based on the current layout configuration.
     *
     * @returns {object} - The layout options for the current layout configuration.
     */
    getLayoutOptions() {
        if (this._cardView.layout === CARD.layout.vertical.label) {
            return CARD.layout.vertical.value;
        }
        return CARD.layout.horizontal.value;
    }
}

/** --------------------------------------------------------------------------
 * Define static properties and register the custom element for the card.
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
        this._onChangeValidated = null;
        this._onConfigChange = null; // Callback pour notifier les changements
        this._debounceTimeout = null; // Timeout pour le debouncing
        this._pendingUpdates = {}; // Stockage temporaire des changements
        this._lastUpdateFromProperty = false;
        this._debug = CARD.debug;
        this._pendingUpdatesLock = false;
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
        while (this._pendingUpdatesLock) {}
        this._pendingUpdatesLock = true;
        const hasPendingUpdate = key in this._pendingUpdates;
        if (
            (hasPendingUpdate && this._pendingUpdates[key] === value) ||
            (!hasPendingUpdate && this._config[key] === value)
        ) {
            this._logDebug(`ConfigManager/updateProperty: no change for ${key}`);
            this._pendingUpdatesLock = false;
            return;
        }
        this._pendingUpdates[key] = value;
        this._logDebug('ConfigManager/updateProperty - pendingUpdates: ', this._pendingUpdates);

        if (this._debounceTimeout) {
            clearTimeout(this._debounceTimeout);
        }

        this._debounceTimeout = setTimeout(() => {
            this._applyPendingUpdates();
        }, CARD.debounce); // Temps configurable (200ms ici)
        this._pendingUpdatesLock = false;
    }

    /**
     * Applies all pending configuration updates after the debounce period.
     *
     * This method processes and commits any changes stored in `_pendingUpdates` to the
     * actual configuration (`_config`). It handles type conversion, such as converting
     * numeric strings to numbers, and removes properties with empty or invalid values.
     *
     * @private
     */
    _applyPendingUpdates() {
        while (this._pendingUpdatesLock) {}
        this._pendingUpdatesLock = true;

        let hasChanges = false;

        for (const [key, value] of Object.entries(this._pendingUpdates)) {
            this._logDebug('ConfigManager/_applyPendingUpdates:', [key, value]);
            let curValue = value;
            if (typeof value === 'string' && value.trim() !== '' && (key in EDITOR_INPUT_FIELDS && EDITOR_INPUT_FIELDS[key].type === FIELD_TYPE.number.type || key === EDITOR_INPUT_FIELDS.max_value.name)) {
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
            this._notifyChangeValidated();
        }
        this._pendingUpdatesLock = false;
    }

    /**
     * Reorders the configuration properties, ensuring `grid_options` appears last.
     */
    _reorderConfig() {
        if (this._config.grid_options) {
            const { grid_options, ...rest } = this._config;
            this._config = { ...rest, grid_options };
        }
    }

    /**
     * Notifies listeners (editor) of a configuration change.
     *
     * This method invokes the registered callback function, passing a copy of the current
     * configuration as an argument. It ensures that any external subscribers (e.g., the editor
     * or other components) are informed whenever the configuration is updated.
     */
    _notifyChangeValidated() {
        if (this._onChangeValidated) {
            this._onChangeValidated({ ...this._config });
        }
    }

    /**
     * Registers a callback (editor) to handle configuration changes.
     *
     * This method allows external components or systems to subscribe to updates
     * of the configuration managed by this class. When a configuration change
     * occurs, the provided callback will be invoked with a cloned version of
     * the updated configuration.
     */
    onChangeValidated(callback) {
        this._onChangeValidated = callback;
    }

    /** ---- */
    _notifyConfigChange() {
        if (this._onConfigChange) {
            this._onConfigChange({ ...this._config });
        }
    }

    onConfigChange(callback) {
        this._onConfigChange = callback;
    }

}

/** --------------------------------------------------------------------------
 * Custom editor component for configuring the `EntityProgressCard`.
 *
 * The `EntityProgressCardEditor` class extends `HTMLElement` and represents the editor interface
 * for configuring the settings of the `EntityProgressCard`.
 */
class EntityProgressCardEditor extends HTMLElement {
    /**
     * Initializes an instance of the `EntityProgressCardEditor` class.
     *
     * @constructor
     */
    constructor() {
        super();
        this.config = {};
        this._hass = null;
        this._elements = {};
        this._overridableElements = {};
        this.rendered = false;
        this._currentLanguage = CARD.config.language;
        this._isGuiEditor = false;
        this.configManager = new ConfigManager();

        this.configManager.onChangeValidated((newConfig) => {
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
        this._currentLanguage = MSG.decimalError[hass.config.language] ? hass.config.language : CARD.config.language;
        if (!this._hass || this._hass.entities !== hass.entities) {
            this._hass = hass;
        }
    }

    /**
     * Gets the current Home Assistant instance stored in the editor component.
     *
     * This getter method provides access to the internal `_hass` property.
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
        this.config = config;
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
     * Note: This ensures that the graphical editor reflects the latest YAML-based changes.
     */
    _refreshConfigFromYAML() {
        const keys = Object.keys(this._elements);
        keys.forEach(key => {
            if (this.config[key]) {
                if (this._elements[key].value !== this.config[key]) {
                    this._elements[key].value = this.config[key];
                }
            } else if (key !== TAP_ACTION_KEY) {
                this._elements[key].value = '';
            } else {
                this._elements[TAP_ACTION_KEY].value = this._getTapActionValue();
            }
        });
        this._toggleFieldDisable(NAVIGATETO_KEY, (this._getTapActionValue() !== NAVIGATETO_KEY));
        if (typeof this.config[THEME_KEY] === 'undefined') {
            this._toggleFieldDisable(THEME_KEY, false);
        } else {
            this._toggleFieldDisable(THEME_KEY, this.config[THEME_KEY] in THEME);
        }
    }

    /**
     * Toggles the visibility of fields based on the `disable` flag.
     *
     * This method is used to control the visibility of specific fields in the editor.
     * It updates the `style.display` property of each field element stored in the `_overridableElements`
     * object, hiding or showing the fields based on the `disable` parameter.
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


    _updateUnitFromEntity(unitAvailable) {
        if(unitAvailable) {
            this.configManager.updateProperty(EDITOR_INPUT_FIELDS.unit.name, unitAvailable);
            this._elements[EDITOR_INPUT_FIELDS.unit.name].value = unitAvailable;
        } else {
            this.configManager.updateProperty(EDITOR_INPUT_FIELDS.unit.name, '');
            this._elements[EDITOR_INPUT_FIELDS.unit.name].value = '';
        }
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
        if (key === EDITOR_INPUT_FIELDS.entity.type) {
            const attributeAvailable = this._isEntityWithAttribute(value);
            const unitAvailable = this._getUnitFromEntity(value);
            if(attributeAvailable) {
                this._refreshAttributeOption(this._hass.states[value] ?? null)
            }
            this._updateUnitFromEntity(unitAvailable);

            this._toggleFieldDisable(EDITOR_INPUT_FIELDS.attribute.isInGroup, !attributeAvailable);
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

    _isEntityWithAttribute(entity) {
        return !!ATTRIBUTE_MAPPING[entity?.split(".")[0]];
    }

    _getUnitFromEntity(curEntity = null) {
        const entity = curEntity || this._hass.states[this.config.entity];
        return this._hass.states[entity]?.attributes?.unit_of_measurement ?? null;
    }

    _getAttributeOption(curEntity=null) {
        const entity = curEntity ?? this._hass.states[this.config.entity] ?? null;
        if (!entity) {
            return null;
        }
        const availableAttributes = Object.keys(entity.attributes || {}).map(attr => ({
            value: attr,
            label: attr
        }));

        return availableAttributes;
    }


    /**
     * Adds a list of choices to a given `<select>` element based on the specified list type.
     *
     * This method populates the `<select>` element with options according to the provided `type`. The `type`
     * determines the kind of list (e.g., colors, layout, theme, tap actions) and how the options will be displayed.
     *
     * @param {HTMLElement} select - The `<select>` element to which the choices will be added.
     * @param {string} type - The type of list to populate ('layout', 'color', 'theme', or 'tap_action').
     */
    _addChoices(select, type, curEntity=null) {
        select.innerHTML = '';
        const list = (type === FIELD_TYPE.attribute.type) ? this._getAttributeOption(curEntity) : FIELD_OPTIONS[type];
        this.configManager._logDebug('_addChoices - List ', list);
        if(!list) {
            return;
        }
        list.forEach(optionData => {
            const option = document.createElement(FIELD_TYPE.listItem.tag);
            option.value = optionData.value;

            if (type === FIELD_TYPE.color.type) {
                option.innerHTML = `
                    <span style="display: inline-block; width: 16px; height: 16px; background-color: ${optionData.value}; border-radius: 50%; margin-right: 8px;"></span>
                    ${optionData.label[this._currentLanguage]}
                `;
            } else if (type === FIELD_TYPE.layout.type || type === FIELD_TYPE.theme.type ) {
                const haIcon = document.createElement('ha-icon');
                haIcon.setAttribute('icon', optionData.icon || 'mdi:alert'); // Définit l'icône par défaut ou celle dans FIELD_OPTIONS
                haIcon.style.marginRight = '8px'; // Ajuste l'espace entre l'icône et le texte
                haIcon.style.width = '20px'; // Assurez-vous que la largeur est visible
                haIcon.style.height = '20px';
                option.appendChild(haIcon); // Ajouter l'icône à l'option
                option.append(optionData.label[this._currentLanguage]);
            } else if (type === FIELD_TYPE.tap_action.type) {
                option.innerHTML = `${optionData.label[this._currentLanguage]}`;
            } else if (type === FIELD_TYPE.attribute.type) {
                option.innerHTML = `${optionData.label}`;
            }

            select.appendChild(option);
        });
    }

    _refreshAttributeOption(curEntity) {
        if (!curEntity) {
            return;
        }
        const inputElement = this._elements["attribute"];
        // delete current options
        while (inputElement.firstChild) {
            inputElement.removeChild(inputElement.firstChild);
        }
        // add option
        this._addChoices(inputElement, FIELD_TYPE.attribute.type, curEntity);
    }

    /**
     * Adds an event listener to a specified element and handles events based on the provided type.
     *
     * @param {string} name - The name of the element to attach the event listener to.
     * @param {string} type - The type of the event listener. Supported types include 'color', 'theme', 'tap_action', 'layout',
     *                        or other types triggering 'value-changed' and 'input' events.
     *
     * When an event occurs, the function checks if the component has been rendered and if there are configuration changes
     * initiated from the GUI. It then updates the configuration property or manages the tap action, depending on the event type.
     */

    _addEventListener(name, type) {
        const isHASelect = FIELD_TYPE[type]?.tag === TAG_HASELECT;
        const events = isHASelect ? ['selected'] : ['value-changed', 'input'];

        if (isHASelect) {
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
        let defaultDisplay = HTML.block.show;

        switch (type) {
            case FIELD_TYPE.entity.type:
                inputElement = document.createElement(FIELD_TYPE.entity.tag);
                inputElement.hass = this.hass;
                break;
            case FIELD_TYPE.icon.type:
                inputElement = document.createElement(FIELD_TYPE.icon.tag);
                break;
            case FIELD_TYPE.layout.type:
            case FIELD_TYPE.theme.type:
            case FIELD_TYPE.color.type:
            case FIELD_TYPE.tap_action.type:
            case FIELD_TYPE.attribute.type:
                inputElement = document.createElement(FIELD_TYPE[type].tag);
                inputElement.popperOptions = "";
                this._addChoices(inputElement, type);
                if (type === FIELD_TYPE.tap_action.type) {
                    value = this._getTapActionValue();
                }
                break;
            case FIELD_TYPE.number.type:
                inputElement = document.createElement(FIELD_TYPE.number.tag);
                inputElement.type = FIELD_TYPE.number.type;
                break;
            default:
                inputElement = document.createElement(FIELD_TYPE.default.tag);
                inputElement.type = FIELD_TYPE.default.type;
                break;
        }

        // store element and manage default display
        this._elements[name]=inputElement;
        if (isInGroup) {
            if (!this._overridableElements[isInGroup]) {
                this._overridableElements[isInGroup] = {};
            }
            this._overridableElements[isInGroup][name]=inputElement;
            if ((isInGroup === NAVIGATETO_KEY && this._getTapActionValue() !== NAVIGATETO_KEY) || (isInGroup === THEME_KEY && this.config.theme) || (isInGroup === ENTITY_ATTRIBUTE && !(this.config.entity && ATTRIBUTE_MAPPING[this.config.entity.split(".")[0]]))) {
                defaultDisplay = HTML.block.hide;
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

    _makeHelpIcon() {
        // Lien cliquable
        const link = document.createElement('a');
        link.href = CARD.config.documentation;
        link.target = '_blank';
        link.style.textDecoration = 'none';
        link.style.display = 'flex';
        link.style.position='absolute';
        link.style.top='0px';
        link.style.right='0px';
        link.style.zIndex ='600';

        const outerDiv = document.createElement('div');
        outerDiv.style.width = '50px';
        outerDiv.style.height = '50px';
        outerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        outerDiv.style.display = 'flex';
        outerDiv.style.alignItems = 'center';
        outerDiv.style.justifyContent = 'center';
        outerDiv.style.borderRadius = '50%';
        outerDiv.style.cursor = 'pointer';

        const innerDiv = document.createElement('div');
        innerDiv.style.width = '30px';
        innerDiv.style.height = '30px';
        innerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        innerDiv.style.display = 'flex';
        innerDiv.style.alignItems = 'center';
        innerDiv.style.justifyContent = 'center';
        innerDiv.style.borderRadius = '50%';

        const questionMark = document.createElement('div');
        questionMark.textContent = '?';
        questionMark.style.fontSize = '20px';
        questionMark.style.color = 'black';
        questionMark.style.fontWeight = 'bold';

        innerDiv.appendChild(questionMark);
        outerDiv.appendChild(innerDiv);
        link.appendChild(outerDiv);

        return link;
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

        container.appendChild(this._makeHelpIcon());

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
