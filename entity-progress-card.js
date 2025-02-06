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
 * @version 1.0.36
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION='1.0.36';
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
    bar_size: {
        small: {
            label: 'small',
            mdi: "mdi:size-s",
            size: '8px'
        },
        medium: {
            label: 'medium',
            mdi: "mdi:size-m",
            size: '12px'
        },
        large: {
            label: 'large',
            mdi: "mdi:size-l",
            size: '16px'
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
        editor: {
            field: {
                container: {element: 'div', class:'editor'},
                fieldContainer: {element: 'div', class:'editor-field-container'},
                fieldDescription: {element: 'span', class:'editor-field-description'},
                entity: { type: 'entity', element: 'ha-entity-picker'},
                attribute: { type: 'attribute', element: 'ha-select'},
                icon: { type: 'icon', element: 'ha-icon-picker'},
                layout: { type: 'layout', element: 'ha-select'},
                bar_size: { type: 'bar_size', element: 'ha-select'},
                tap_action: { type: 'tap_action', element: 'ha-select'},
                theme: { type: 'theme', element: 'ha-select'},
                color: { type: 'color', element: 'ha-select'},
                number: { type: 'number', element: 'ha-textfield'},
                default: { type: 'text', element: 'ha-textfield'},
                listItem: { type: 'list item', element: 'mwc-list-item'},
                iconItem: { element: 'ha-icon'},
                select: { element: 'ha-select'},

            },
            key: {
                attribute: "attribute",
                navigate_to: "navigate_to",
                theme: "theme",
                tap_action: "tap_action"
            },

        },
        documentation: {
            link: { element: 'a', class: 'documentation-link'},
            outerDiv: { element: 'div', class: 'documentation-outer'},
            innerDiv: { element: 'div', class: 'documentation-inner'},
            questionMark: { element: 'div', class: 'documentation-icon'},
            attributes: {
                text: '?',
                linkTarget: '_blank',
                documentationUrl: 'https://github.com/francois-le-ko4la/lovelace-entity-progress-card/',
            },
        },

    },
    debounce: 100,
    debug: true,
};

CARD.console = {
    message: `%c✨${CARD.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
    css: 'color:orange; background-color:black; font-weight: bold;',
    link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card'
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
    cpu: {
        linear: true,
        style: [
            { icon: 'mdi:cpu-64-bit',        color: 'var(--state-sensor-battery-high-color)'  },
            { icon: 'mdi:cpu-64-bit',        color: 'var(--yellow-color)' },
            { icon: 'mdi:cpu-64-bit',        color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:cpu-64-bit',        color: 'var(--state-sensor-battery-low-color)'    },
            { icon: 'mdi:cpu-64-bit',        color: 'var(--state-sensor-battery-low-color)'    },
        ]
    },
    memory: {
        linear: true,
        style: [
            { icon: 'mdi:memory',        color: 'var(--state-sensor-battery-high-color)'  },
            { icon: 'mdi:memory',        color: 'var(--yellow-color)' },
            { icon: 'mdi:memory',        color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:memory',        color: 'var(--state-sensor-battery-low-color)'    },
            { icon: 'mdi:memory',        color: 'var(--state-sensor-battery-low-color)'    },
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
            { min: -50, max: -30, icon: 'mdi:thermometer', color: 'var(--deep-purple-color)'    },
            { min: -30, max: -15, icon: 'mdi:thermometer', color: 'var(--dark-blue-color)'      },
            { min: -15, max: -2,  icon: 'mdi:thermometer', color: 'var(--blue-color)'           },
            { min: -2,  max: 2,   icon: 'mdi:thermometer', color: 'var(--light-blue-color)'     },
            { min: 2,   max: 8,   icon: 'mdi:thermometer', color: 'var(--cyan-color)'           },
            { min: 8,   max: 16,  icon: 'mdi:thermometer', color: 'var(--teal-color)'           },
            { min: 16,  max: 18,  icon: 'mdi:thermometer', color: 'var(--green-teal-color)'     },
            { min: 18,  max: 20,  icon: 'mdi:thermometer', color: 'var(--light-green-color)'    },
            { min: 20,  max: 25,  icon: 'mdi:thermometer', color: 'var(--success-color)'        },
            { min: 25,  max: 27,  icon: 'mdi:thermometer', color: 'var(--yellow-color)'         },
            { min: 27,  max: 29,  icon: 'mdi:thermometer', color: 'var(--amber-color)'          },
            { min: 29,  max: 34,  icon: 'mdi:thermometer', color: 'var(--deep-orange-color)'    },
            { min: 34,  max: 100, icon: 'mdi:thermometer', color: 'var(--red-color)'            }
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
    attributeNotFound: {
        en: "attribute: Attribute not found in HA.",
        fr: "attribute: Attribut introuvable dans HA.",
        es: "attribute: Atributo no encontrado en HA.",
        it: "attribute: Attributo non trovato in HA.",
        de: "attribute: Attribut in HA nicht gefunden.",
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

const EDITOR_INPUT_FIELDS = {
    entity: {       name: 'entity',
                    label: { en: 'Entity', fr: 'Entité', es: 'Entidad', it: 'Entità', de: 'Entität', },
                    type: CARD.config.editor.field.entity.type,
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
                    type: CARD.config.editor.field.attribute.type,
                    width: '92%',
                    required: false,
                    isInGroup: CARD.config.editor.key.attribute,
                    description: {
                        en: 'Select the attribute.',
                        fr: 'Sélectionnez l\'attribut.',
                        es: 'Seleccione el atributo.',
                        it: 'Seleziona l\'attributo.',
                        de: 'Wählen Sie das Attribut aus.',
                    }},
    name: {         name: 'name',
                    label: { en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome', de: 'Name', },
                    type: CARD.config.editor.field.default.type,
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
                    type: CARD.config.editor.field.default.type,
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
                    type: CARD.config.editor.field.number.type,
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
                    type: CARD.config.editor.field.number.type,
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
                    type: CARD.config.editor.field.default.type,
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
                    type: CARD.config.editor.field.tap_action.type,
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
    navigate_to: {  name: CARD.config.editor.key.navigate_to,
                    label: { en: 'Navigate to...', fr: 'Naviguer vers...', es: 'Navegar a...', it: 'Naviga verso...', de: 'Navigieren zu...',  },
                    type: CARD.config.editor.field.default.type,
                    width: '45%',
                    required: false,
                    isInGroup: CARD.config.editor.key.navigate_to,
                    description: {
                        en: 'Enter the target (/lovelace/0).',
                        fr: 'Saisir la cible (/lovelace/0).',
                        es: 'Introduzca el objetivo (/lovelace/0).',
                        it: 'Inserisci il target (/lovelace/0).',
                        de: 'Geben Sie das Ziel (/lovelace/0) ein.',
                    }},
    theme: {        name: 'theme',
                    label: { en: 'Theme', fr: 'Thème', es: 'Tema', it: 'Tema', de: 'Thema', },
                    type: CARD.config.editor.field.theme.type,
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
    bar_size: {     name: 'bar_size',
                    label: { en: 'Size', fr: 'Taille', es: 'Tamaño', it: 'Dimensione', de: 'Größe' },
                    type: CARD.config.editor.field.bar_size.type,
                    width: '45%',
                    required: false,
                    isInGroup: null,
                    description: { 
                        en: 'Select the bar size', 
                        fr: 'Sélectionnez la taille de la barre', 
                        es: 'Seleccione el tamaño de la barra', 
                        it: 'Seleziona la dimensione della barra', 
                        de: 'Wählen Sie die Balkengröße' 
                    }},
    bar_color: {    name: 'bar_color',
                    label: { en: 'Color for the bar', fr: 'Couleur de la barre', es: 'Color de la barra', it: 'Colore per la barra', de: 'Farbe für die Leiste', },
                    type: CARD.config.editor.field.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: CARD.config.editor.key.theme,
                    description: {
                        en: 'Select the color for the bar.',
                        fr: 'Sélectionnez la couleur de la barre.',
                        es: 'Seleccione el color de la barra.',
                        it: 'Seleziona il colore per la barra.',
                        de: 'Wählen Sie für die Leiste.',
                    }},
    icon: {         name: 'icon',
                    label: { en: 'Icon', fr: 'Icône', es: 'Icono', it: 'Icona', de: 'Symbol', },
                    type: CARD.config.editor.field.icon.type,
                    width: '45%',
                    required: false,
                    isInGroup: CARD.config.editor.key.theme,
                    description: {
                        en: 'Select an icon for the entity.',
                        fr: 'Sélectionnez une icône pour l\'entité.',
                        es: 'Seleccione un icono para la entidad.',
                        it: 'Seleziona un\'icona per l\'entità.',
                        de: 'Wählen Sie ein Symbol für die Entität.',
                    }},
    color: {        name: 'color',
                    label: { en: 'Primary color', fr: 'Couleur de l\'icône', es: 'Color del icono', it: 'Colore dell\'icona', de: 'Primärfarbe', },
                    type: CARD.config.editor.field.color.type,
                    width: '45%',
                    required: false,
                    isInGroup: CARD.config.editor.key.theme,
                    description: {
                        en: 'Select the primary color for the icon.',
                        fr: 'Sélectionnez la couleur de l\'icône.',
                        es: 'Seleccione el color principal del icono.',
                        it: 'Seleziona un\'icona per l\'entità.',
                        de: 'Wählen Sie die Primärfarbe für das Symbol.',
                    }},
    layout: {       name: 'layout',
                    label: { en: 'Layout', fr: 'Disposition', es: 'Disposición', it: 'Layout', de: 'Layout', },
                    type: CARD.config.editor.field.layout.type,
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
};

const FIELD_OPTIONS = {
    theme: [
        { value: '',            label: { en: 'Disabled (default)', fr: 'Désactivé (défaut)', es: 'Desactivado (defecto)', it: 'Disabilitato (predefinito)', de: 'Deaktiviert (Standard)' }, icon: "mdi:palette-outline" },
        { value: 'battery',     label: { en: 'Battery', fr: 'Batterie', es: 'Batería', it: 'Batteria', de: 'Batterie'},                                                                     icon: "mdi:battery" },
        { value: 'cpu',         label: { en: 'CPU', fr: 'CPU', es: 'CPU', it: 'CPU', de: 'CPU'},                                                                                            icon: "mdi:cpu-64-bit" },
        { value: 'humidity',    label: { en: 'Humidity', fr: 'Humidité', es: 'Humedad', it: 'Umidità', de: 'Feuchtigkeit'  },                                                               icon: "mdi:water-percent" },
        { value: 'light',       label: { en: 'Light', fr: 'Lumière', es: 'Luz', it: 'Luce', de: 'Licht' },                                                                                  icon: "mdi:lightbulb" },
        { value: 'memory',      label: { en: 'RAM', fr: 'RAM', es: 'RAM', it: 'RAM', de: 'RAM' },                                                                                           icon: "mdi:memory" },
        { value: 'pm25',        label: { en: 'PM2.5', fr: 'PM2.5', es: 'PM2.5', it: 'PM2.5', de: 'PM2.5' },                                                                                 icon: "mdi:air-filter" },
        { value: 'temperature', label: { en: 'Temperature', fr: 'Température', es: 'Temperatura', it: 'Temperatura', de: 'Temperatur'  },                                                   icon: "mdi:thermometer" },
        { value: 'voc',         label: { en: 'VOC', fr: 'VOC', es: 'VOC', it: 'VOC', de: 'VOC'  },                                                                                          icon: "mdi:air-filter" },
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
    bar_size: [
        { value: CARD.bar_size.small.label,  label: { en: 'Small', fr: 'Petite', es: 'Pequeña', it: 'Piccola', de: 'Klein',}, icon: CARD.bar_size.small.mdi, },
        { value: CARD.bar_size.medium.label, label: { en: 'Medium', fr: 'Moyenne', es: 'Media', it: 'Media', de: 'Mittel',}, icon: CARD.bar_size.medium.mdi, },
        { value: CARD.bar_size.large.label,  label: { en: 'Large', fr: 'Grande', es: 'Grande', it: 'Grande', de: 'Groß',}, icon: CARD.bar_size.large.mdi, },
    ],
    layout: [
        { value: CARD.layout.horizontal.label, label: { en: 'Horizontal (default)', fr: 'Horizontal (par défaut)', es: 'Horizontal (predeterminado)', it: 'Orizzontale (predefinito)', de: 'Horizontal (Standard)',}, icon: CARD.layout.horizontal.mdi, },
        { value: CARD.layout.vertical.label,   label: { en: 'Vertical', fr: 'Vertical', es: 'Vertical', it: 'Verticale', de: 'Vertikal',}, icon: CARD.layout.vertical.mdi, },
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

// Constants for DOM element selectors
const SELECTORS = {
    card: 'ha-card',
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

    .clickable {
        cursor: pointer;
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
    .${SELECTORS.container}.${CARD.layout.vertical.label} {
        flex-direction: column;
    }
    .${SELECTORS.container}.${CARD.layout.horizontal.label} {
        flex-direction: row;
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
    .small .${CARD.layout.vertical.label} .${SELECTORS.left} {
        margin-top: 6px;
    }

    .medium .${CARD.layout.vertical.label} .${SELECTORS.left} {
        margin-top: 10px;
    }

    .large .${CARD.layout.vertical.label} .${SELECTORS.left} {
        margin-top: 14px;
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

    .${CARD.layout.vertical.label} .${SELECTORS.right} {
        width: 90%;
        flex-grow: 0;
    }


    .${SELECTORS.name} {
        text-align: left;
        font-size: 1em;
        font-weight: bold;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        width: 100%;
    }

    .${SELECTORS.secondaryInfo} {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
    }

    .${CARD.layout.vertical.label} .${SELECTORS.secondaryInfo} {
        display: block;
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
        max-height: 16px;
        background-color: var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .small .${SELECTORS.progressBar} {
        height: 8px;
        max-height: 8px;
   }

    .medium .${SELECTORS.progressBar} {
        height: 12px;
        max-height: 12px;
   }

    .large .${SELECTORS.progressBar} {
        height: 16px;
        max-height: 16px;
   }

    .${SELECTORS.progressBarInner} {
        height: 100%;
        width: 75%;
        background-color: var(--primary-color);
        transition: width 0.3s ease;
    }


    .${CARD.layout.vertical.label} .${SELECTORS.name} {
        text-align: center;
    }

    .${CARD.layout.vertical.label} .large .${SELECTORS.name} {
        height: 18px;
    }
    .${CARD.layout.vertical.label} .${SELECTORS.percentage} {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 13px;
        font-size: 0.8em;
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
        z-index: 2;
        background-color: #202833;
        border-radius: 12px;
    }
    
    .show-${SELECTORS.alert} ${SELECTORS.alert}{
        display: flex;
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

    .${CARD.config.editor.field.container.class} {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap; /* Permet le retour à la ligne */
        gap: 0 2%;
    }
    .${CARD.config.editor.field.fieldContainer.class} {
        display: block;
        margin-bottom: 12px;
        height: 73px;
    }

    .hide-${CARD.config.editor.key.attribute} .${CARD.config.editor.key.attribute},
    .hide-${CARD.config.editor.key.navigate_to} .${CARD.config.editor.key.navigate_to},
    .hide-${CARD.config.editor.key.theme} .${CARD.config.editor.key.theme} {
        display: none;
    }

    .${CARD.config.editor.field.fieldDescription.class} {
        width: 90%;
        font-size: 12px;
        color: #888;
    }

    .${CARD.config.documentation.link.class} {
        text-decoration: none;
        display: flex;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 600;
    }

    .${CARD.config.documentation.outerDiv.class} {
        width: 50px;
        height: 50px;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
    }

    .${CARD.config.documentation.innerDiv.class} {
        width: 30px;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .${CARD.config.documentation.questionMark.class} {
        font-size: 20px;
        color: black;
        font-weight: bold;
    }
    
`;

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
    constructor(theme = null, value = 0, isValid=false, isLinear=false, isCustomTheme=false) {
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
        /**
         * @type {boolean}
         * @private
         */
        this._isLinear = isLinear;
        /**
         * @type {boolean}
         * @private
         */
        this._isCustomTheme = isCustomTheme;
        /**
         * @type {array}
         * @private
         */
        this._currentStyle = null;

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
        if (!newTheme || !THEME.hasOwnProperty(newTheme)) {
            this._icon = null;
            this._color = null;
            this._theme = null;
            return;
        }
        this._isValid = true;
        this._isCustomTheme = false;
        this._theme = newTheme;
        this._currentStyle = THEME[newTheme].style;
        this._isLinear = THEME[newTheme].linear;
    }

    _checkCustomThemeStructure(customTheme) {
        const expectedKeys = ["min", "max", "icon", "color"];

        if (!(Array.isArray(customTheme) && customTheme.length > 0 && customTheme.some(item => item !== null))) {
            return false;
        }
        return customTheme.every(item => 
            typeof item === "object" &&
            expectedKeys.every(key => key in item)
        );
    }

    /**
     * Sets the custom theme.
     *
     * @param {obj} newTheme - Theme def.
     */
    set customTheme(newTheme) {
        this._isValid = false;
        this._isCustomTheme = true;
        this._isLinear = false;
        this._theme = "**CUSTOM**";

        if (!this._checkCustomThemeStructure(newTheme)){
            return;
        }
        this._currentStyle = newTheme;
        this._isValid = true;
    }

    get isLinear() {
        return this._isLinear;
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
        const lastStep = this._currentStyle.length - 1;
        const thresholdSize = 100 / lastStep;
        const percentage = Math.max(0, Math.min(this._value, CARD.config.maxPercent));
        const themeData = this._currentStyle[Math.floor(percentage / thresholdSize)];
        this._icon = themeData.icon;
        this._color = themeData.color;
    }

    _setStyle() {
        let themeData = null;
        if (this._value === CARD.config.maxPercent) {
            themeData = this._currentStyle[this._currentStyle.length - 1];
        } else {
            themeData = this._currentStyle.find(level => this._value >= level.min && this._value < level.max);
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
     * Returns the display precision of the entity, if valid.
     */
    get precision() {
        return this._isValid ? this._hassProvider.hass.entities[this._entity].display_precision : null;
    }

    /**
     * Returns the friendly name of the entity, if valid.
     */
    get name() {
        return this._isValid ? this._hassProvider.hass.states[this._entity]?.attributes?.friendly_name : null;
    }

    /**
     * Returns the icon of the entity, if valid.
     */
    get icon() {
        return this._isValid ? this._hassProvider.hass.states[this._entity]?.attributes?.icon : null;
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
        } else if (typeof this._value === "string" && this._hassProvider.hass.states[this._value]) {
            this._entity = this._value;
            this._isFound = true;
            const entityState = this._hassProvider.hass.states[this._entity];
            const state = entityState.state;
            if (state === "unavailable" || state === "unknown") {
                this._value = 0;
                return;
            }
            this._isValid = true;
            this._isAvailable = true;
            const entityType = this._entity.split(".")[0]; // "cover", "light", "fan", etc.
            if (ATTRIBUTE_MAPPING[entityType]) {
                const attribute = this._attribute ?? ATTRIBUTE_MAPPING[entityType].attribute;
                if (attribute && entityState.attributes.hasOwnProperty(attribute)) {
                    this._value = entityState.attributes[attribute] ?? 0;
                    if (entityType === ATTRIBUTE_MAPPING.light.label && attribute === ATTRIBUTE_MAPPING.light.attribute) {
                        this._value = (100 * this._value) / 255;
                    }
                } else { // attribute not supported
                    this._value = 0;
                    this._isFound = false;
                    this._isValid = false;
                    this._isAvailable = false;
                }
            } else {
                this._value = parseFloat(state) || 0;
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
        } else if (this._config.attribute && !entityState.attributes.hasOwnProperty(this._config.attribute)) {
            this._msg = MSG.attributeNotFound;
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
        this.bar_size = null;
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
        this.bar_size                   = config.bar_size;
        this._percentHelper.unit        = config.unit;
        this.show_more_info             = typeof config.show_more_info === 'boolean' ? config.show_more_info : CARD.config.showMoreInfo;
        this.navigate_to                = config.navigate_to !== undefined ? config.navigate_to : null;
        this._theme.theme               = config.theme;
        if (Array.isArray(config.custom_theme)) {
            this._theme.customTheme     = config.custom_theme;
        }
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
        this._errorVisible = false;
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
        const barSizeChanged = this._cardView.bar_size !== config.bar_size;
        this._cardView.config = config;

        if (!this._isBuilt) {
            this._isBuilt = true;
            this._buildCard();
        }

        if (layoutChanged) {
            this._changeLayout();
        }
        if (barSizeChanged) {
            this._changeBarSize();
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
        const card = document.createElement(SELECTORS.card);
        card.classList.add(CARD.typeName);
        card.classList.toggle('clickable', this._cardView.show_more_info || this._cardView.navigate_to);
        card.innerHTML = CARD_HTML;
        const style = document.createElement('style');
        style.textContent = CARD_CSS;

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(card);
        // store DOM ref to update
        this._elements = {
            [SELECTORS.card]: card,
            [SELECTORS.container]: this.shadowRoot.querySelector(`.${SELECTORS.container}`),
            [SELECTORS.right]: this.shadowRoot.querySelector(`.${SELECTORS.right}`),
            [SELECTORS.icon]: this.shadowRoot.querySelector(`.${SELECTORS.icon}`),
            [SELECTORS.shape]: this.shadowRoot.querySelector(`.${SELECTORS.shape}`),
            [SELECTORS.name]: this.shadowRoot.querySelector(`.${SELECTORS.name}`),
            [SELECTORS.percentage]: this.shadowRoot.querySelector(`.${SELECTORS.percentage}`),
            [SELECTORS.secondaryInfo]: this.shadowRoot.querySelector(`.${SELECTORS.secondaryInfo}`),
            [SELECTORS.progressBar]: this.shadowRoot.querySelector(`.${SELECTORS.progressBar}`),
            [SELECTORS.progressBarInner]: this.shadowRoot.querySelector(`.${SELECTORS.progressBarInner}`),
            [SELECTORS.alert]: this.shadowRoot.querySelector(`${SELECTORS.alert}`),
            [SELECTORS.alert_icon]: this.shadowRoot.querySelector(`.${SELECTORS.alert_icon}`),
            [SELECTORS.alert_message]: this.shadowRoot.querySelector(`.${SELECTORS.alert_message}`),
            [SELECTORS.ha_icon]: this.shadowRoot.querySelector(`${SELECTORS.ha_icon}`),
        };
    }

    _changeBarSize(){
        let size = null;

        switch (this._cardView.bar_size) {
            case CARD.bar_size.small.label:
            case CARD.bar_size.medium.label:
            case CARD.bar_size.large.label:
                size = this._cardView.bar_size;
                break;
            default:
                size = CARD.bar_size.small.label;
                break;
        }
        //this._elements[SELECTORS.progressBar].style.height = size;
        this._elements[SELECTORS.card].classList.toggle(size, true);
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
    _updateElement(key, updateCallback) {
        const element = this._elements[key];
        if (element) {
            updateCallback(element);
        }
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
        this._updateElement(SELECTORS.container, (el) => {
            const isVertical = this._cardView.layout === CARD.layout.vertical.label;
            el.classList.toggle(CARD.layout.vertical.label, isVertical);
            el.classList.toggle(CARD.layout.horizontal.label, !isVertical);
        });
    }

    _manageErrorMessage() {
        if (!this._cardView.isValid) {
            this._showError(this._cardView.msg);
            this._errorVisible = true;
            return;
        } else if (this._errorVisible) {
            this._hideError();
            this._errorVisible = false;
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
        this._manageErrorMessage();

        this._updateElement(SELECTORS.progressBarInner, (el) => {
            const newWidth = `${this._cardView.percent}%`;
            if (el.style.width !== newWidth) {
                el.style.width = newWidth;
            }
    
            if (el.style.backgroundColor !== this._cardView.bar_color) {
                el.style.backgroundColor = this._cardView.bar_color;
            }
        });

        this._updateElement(SELECTORS.icon, (el) => {
            if (el.getAttribute(SELECTORS.icon) !== this._cardView.icon) {
                el.setAttribute(SELECTORS.icon, this._cardView.icon);
            }
            if (el.style.color !== this._cardView.color) {
                el.style.color = this._cardView.color;
            }
        });

        this._updateElement(SELECTORS.shape, (el) => {
            if (el.style.backgroundColor !== this._cardView.color) {
                el.style.backgroundColor = this._cardView.color;
            }
        });

        this._updateElement(SELECTORS.name, (el) => {
            if (el.textContent !== this._cardView.name) {
                el.textContent = this._cardView.name;
            }
        });

        this._updateElement(SELECTORS.percentage, (el) => {
            if (el.textContent !== this._cardView.description) {
                el.textContent = this._cardView.description;
            }
        });
    }

    /**
     * Displays an error alert with the provided message.
     *
     * @param {string} message - The error message to display in the alert.
     */
    _showError(message) {
        this._elements[SELECTORS.card].classList.toggle(`show-${SELECTORS.alert}`, true);
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
     * @returns {void}
     */
    _hideError() {
        this._elements[SELECTORS.card].classList.toggle(`show-${SELECTORS.alert}`, false);
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
 *
 * @class ConfigManager
 *
 * @param {Object} initialConfig - The initial configuration object, consisting of key/value pairs.
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
     * @returns {Object} - A copy of the current configuration object.
     */
    get config() {
        return { ...this._config }; // Retourne une copie pour éviter les mutations externes
    }

    /**
     * Logs debug messages to the console if debugging is enabled.
     *
     * This method checks the `_debug` flag to determine whether debug logging is enabled.
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
        }, CARD.debounce);
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
            if (typeof value === 'string' && value.trim() !== '' && (EDITOR_INPUT_FIELDS.hasOwnProperty(key) && EDITOR_INPUT_FIELDS[key].type === CARD.config.editor.field.number.type || key === EDITOR_INPUT_FIELDS.max_value.name)) {
                const numericValue = Number(value);
                if (!isNaN(numericValue)) {
                    curValue = numericValue;
                }
            }

            if ((typeof curValue === 'string' && curValue.trim() === '') || curValue == null) {
                if (this._config.hasOwnProperty(key)) {
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
        this.attachShadow({ mode: 'open' });
        this._container = null
        this.config = {};
        this._hass = null;
        this._elements = {};
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
        const rect = this._elements[EDITOR_INPUT_FIELDS.entity.name].getBoundingClientRect();
        this._isGuiEditor = (
            rect.width > 0 &&
            rect.height > 0
        );
        return this._isGuiEditor;
    }

    /**
     * Toggles the visibility of fields based on the `disable` flag.
     *
     * This method is used to control the visibility of specific fields in the editor.
     *
     * @param {boolean} disable - A boolean flag to control the visibility of the fields.
     *                            If `true`, fields are hidden. If `false`, fields are shown.
     */
    _toggleFieldDisable(key, disable) {
        this.configManager._logDebug('_toggleFieldDisable - Toggle: ', [key, disable]);
        this._container.classList.toggle(`hide-${key}`, disable);
    }

    /**
     * Synchronizes the configuration from the YAML editor with the GUI editor.
     *
     * Note: This ensures that the graphical editor reflects the latest YAML-based changes.
     */
    _refreshConfigFromYAML() {
        const keys = Object.keys(this._elements);
        keys.forEach(key => {
            if (this.config.hasOwnProperty(key) && this._elements[key].value !== this.config[key]) {
                this._elements[key].value = this.config[key];
            } else if (key !== CARD.config.editor.key.tap_action) {
                this._elements[key].value = '';
            } else {
                this._elements[CARD.config.editor.key.tap_action].value = this._getTapActionValue();
            }
        });
        this._toggleFieldDisable(CARD.config.editor.key.navigate_to, (this._getTapActionValue() !== CARD.config.editor.key.navigate_to));
        if (!this.config.hasOwnProperty(CARD.config.editor.key.theme)) {
            this._toggleFieldDisable(CARD.config.editor.key.theme, false);
        } else {
            this._toggleFieldDisable(CARD.config.editor.key.theme, THEME.hasOwnProperty(this.config[CARD.config.editor.key.theme]));
        }
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
        if (key === CARD.config.editor.key.theme) {
            this._toggleFieldDisable(CARD.config.editor.key.theme, value !== '');
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
                    CARD.tap_action.navigate_to, this._elements[EDITOR_INPUT_FIELDS.navigate_to.name].value);
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
        this._toggleFieldDisable(CARD.config.editor.key.navigate_to, (value !== CARD.config.editor.key.navigate_to));
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
        const list = (type === CARD.config.editor.field.attribute.type) ? this._getAttributeOption(curEntity) : FIELD_OPTIONS[type];
        this.configManager._logDebug('_addChoices - List ', list);
        if(!list) {
            return;
        }
        list.forEach(optionData => {
            const option = document.createElement(CARD.config.editor.field.listItem.element);
            option.value = optionData.value;

            if (type === CARD.config.editor.field.color.type) {
                option.innerHTML = `
                    <span style="display: inline-block; width: 16px; height: 16px; background-color: ${optionData.value}; border-radius: 50%; margin-right: 8px;"></span>
                    ${optionData.label[this._currentLanguage]}
                `;
            } else if (type === CARD.config.editor.field.layout.type || type === CARD.config.editor.field.theme.type || type === CARD.config.editor.field.bar_size.type) {
                const haIcon = document.createElement(CARD.config.editor.field.iconItem.element);
                haIcon.setAttribute('icon', optionData.icon || CARD.config.icon);
                haIcon.style.marginRight = '8px';
                haIcon.style.width = '20px';
                haIcon.style.height = '20px';
                option.appendChild(haIcon);
                option.append(optionData.label[this._currentLanguage]);
            } else if (type === CARD.config.editor.field.tap_action.type) {
                option.innerHTML = `${optionData.label[this._currentLanguage]}`;
            } else if (type === CARD.config.editor.field.attribute.type) {
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
        this._addChoices(inputElement, CARD.config.editor.field.attribute.type, curEntity);
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
        const isHASelect = CARD.config.editor.field[type]?.element === CARD.config.editor.field.select.element;
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
                if (type === CARD.config.editor.field.tap_action.type) {
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
     * @param {string} config.width - The width of the field.
     *
     * @returns {HTMLElement} The container element (`<div>`) containing the input field and its description.
     */
    _createField({ name, label, type, required, isInGroup, description, width }) {
        let inputElement;
        let value = this.config[name] || '';

        switch (type) {
            case CARD.config.editor.field.entity.type:
                inputElement = document.createElement(CARD.config.editor.field.entity.element);
                inputElement.hass = this.hass;
                this._toggleFieldDisable(CARD.config.editor.key.attribute, !(this.config.entity && ATTRIBUTE_MAPPING[this.config.entity.split(".")[0]]));
                break;
            case CARD.config.editor.field.icon.type:
                inputElement = document.createElement(CARD.config.editor.field.icon.element);
                break;
            case CARD.config.editor.field.layout.type:
            case CARD.config.editor.field.bar_size.type:
            case CARD.config.editor.field.theme.type:
            case CARD.config.editor.field.color.type:
            case CARD.config.editor.field.tap_action.type:
            case CARD.config.editor.field.attribute.type:
                inputElement = document.createElement(CARD.config.editor.field[type].element);
                inputElement.popperOptions = "";
                this._addChoices(inputElement, type);
                if (type === CARD.config.editor.field.tap_action.type) {
                    value = this._getTapActionValue();
                    this._toggleFieldDisable(CARD.config.editor.key.navigate_to, value !== CARD.config.editor.key.navigate_to);
                }
                if (type === CARD.config.editor.field.theme.type) {
                    this._toggleFieldDisable(CARD.config.editor.key.theme, !!this.config.theme);
                }
                break;
            case CARD.config.editor.field.number.type:
                inputElement = document.createElement(CARD.config.editor.field.number.element);
                inputElement.type = CARD.config.editor.field.number.type;
                break;
            default:
                inputElement = document.createElement(CARD.config.editor.field.default.element);
                inputElement.type = CARD.config.editor.field.default.type;
                break;
        }

        // store element and manage default display
        this._elements[name]=inputElement;
        inputElement.style.width = '100%';
        inputElement.required = required;
        inputElement.label = label;
        inputElement.value = value;
        this._addEventListener(name, type);

        const fieldContainer = document.createElement(CARD.config.editor.field.fieldContainer.element);
        if (isInGroup) {
            fieldContainer.classList.add(isInGroup);
        }
        fieldContainer.classList.add(CARD.config.editor.field.fieldContainer.class);
        fieldContainer.style.width = width;

        const fieldDescription = document.createElement(CARD.config.editor.field.fieldDescription.element);
        fieldDescription.classList.add(CARD.config.editor.field.fieldDescription.class);
        fieldDescription.innerText = description;

        fieldContainer.appendChild(inputElement);
        fieldContainer.appendChild(fieldDescription);

        return fieldContainer;
    }

    _makeHelpIcon() {
        // Lien cliquable
        const link = document.createElement(CARD.config.documentation.link.element);
        link.href = CARD.config.documentation.attributes.documentationUrl;
        link.target = CARD.config.documentation.attributes.linkTarget;
        link.classList.add(CARD.config.documentation.link.class);
        
        const outerDiv = document.createElement(CARD.config.documentation.outerDiv.element);
        outerDiv.classList.add(CARD.config.documentation.outerDiv.class);
        
        const innerDiv = document.createElement(CARD.config.documentation.innerDiv.element);
        innerDiv.classList.add(CARD.config.documentation.innerDiv.class);
        
        const questionMark = document.createElement(CARD.config.documentation.questionMark.element);
        questionMark.textContent = CARD.config.documentation.attributes.text;
        questionMark.classList.add(CARD.config.documentation.questionMark.class);
        
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
        if (!window.customElements.get(CARD.config.editor.field.entity.element)) {
            const ch = await window.loadCardHelpers();
            const c = await ch.createCardElement({ type: "entities", entities: [] });
            await c.constructor.getConfigElement();
            const haEntityPicker = window.customElements.get(CARD.config.editor.field.entity.element);
        }
    }

    /**
     * Renders the editor interface for configuring the card's settings.
     *
     * @returns {void}
     */
    render() {
        const style = document.createElement('style');
        style.textContent = CARD_CSS;
        const fragment = document.createDocumentFragment();
        fragment.appendChild(style);
        this._container = document.createElement(CARD.config.editor.field.container.element);
        this._container.classList.add(CARD.config.editor.field.container.class);

        Object.entries(EDITOR_INPUT_FIELDS).forEach(([key, field]) => {
            this._container.appendChild(this._createField({
                name: field.name,
                label: field.label[this._currentLanguage],
                type: field.type,
                required: field.required,
                isInGroup: field.isInGroup,
                description: field.description[this._currentLanguage],
                width: field.width
            }));
        });

        this._container.appendChild(this._makeHelpIcon());
        fragment.appendChild(this._container);
        this.shadowRoot.appendChild(fragment);
    }
}

/** --------------------------------------------------------------------------
 * Registers the custom element for the EntityProgressCardEditor editor.
 */
customElements.define(CARD.editor, EntityProgressCardEditor);
