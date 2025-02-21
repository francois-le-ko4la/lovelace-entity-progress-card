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
 * @version 1.0.42
 *
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION = '1.0.42';
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
        unit: { default: '%', fahrenheit: '°F' },
        showMoreInfo: true,
        decimal: {
            percentage: 0,
            other: 2
        },
        entity: { state: { unavailable: 'unavailable', unknown: 'unknown', notFound: 'notFound' }, },
        shadowMode: 'open',
        debounce: 100,
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
                container: { element: 'div', class: 'progress-bar' },
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
        }

    },
    style: {
        element: 'style',
        color: { default: 'var(--state-icon-color)', disabled: 'var(--dark-grey-color)', unavailable: 'var(--state-unavailable-color)', notFound: 'var(--state-inactive-color)' },
        icon: {
            default: { icon: 'mdi:alert', },
            alert: { icon: 'mdi:alert-circle-outline', color: '#0080ff', attribute: 'icon' },
            notFound: { icon: 'mdi:help', },
            badge: {
                unavailable: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--orange-color)', attribute: 'icon' },
                notFound: { icon: 'mdi:exclamation-thick', color: 'white', backgroundColor: 'var(--red-color)', attribute: 'icon' },
            },
            byDeviceClass: {
                battery: "mdi:battery",
                carbon_dioxide: "mdi:molecule-co2",
                cold: "mdi:snowflake",
                connectivity: "mdi:wifi",
                current: "mdi:current-ac",
                door: "mdi:door-open",
                energy: "mdi:flash",
                gas: "mdi:fire",
                heat: "mdi:fire",
                humidity: "mdi:water-percent",
                illuminance: "mdi:brightness-5",
                light: "mdi:lightbulb",
                lock: "mdi:lock",
                moisture: "mdi:water",
                motion: "mdi:motion-sensor",
                occupancy: "mdi:account",
                opening: "mdi:window-open",
                plug: "mdi:power-plug",
                power: "mdi:flash",
                power_factor: "mdi:flash",
                pressure: "mdi:gauge",
                problem: "mdi:alert",
                safety: "mdi:shield-check",
                shutter: "mdi:window-shutter",
                smoke: "mdi:smoke-detector",
                sound: "mdi:volume-high",
                switch: "mdi:power-socket",
                temperature: "mdi:thermometer",
                timestamp: "mdi:calendar-clock",
                tv: "mdi:television",
                vibration: "mdi:vibrate",
                volatile_organic_compounds_parts: "mdi:molecule",
                voltage: "mdi:flash",
                window: "mdi:window-open"
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
            },
            show: 'show',
            hide: 'hide',
            clickable: 'clickable'
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
            other: ['value-changed', 'input'],
            closed: 'closed',
            click: 'click',
        },
        action: {
            tap: {
                no_action: 'no_action',
                navigate_to: 'navigate_to',
                more_info: 'show_more_info'
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
            icon: { type: 'icon', element: 'ha-icon-picker' },
            layout: { type: 'layout', element: 'ha-select' },
            bar_size: { type: 'bar_size', element: 'ha-select' },
            tap_action: { type: 'tap_action', element: 'ha-select' },
            theme: { type: 'theme', element: 'ha-select' },
            color: { type: 'color', element: 'ha-select' },
            number: { type: 'number', element: 'ha-textfield' },
            default: { type: 'text', element: 'ha-textfield' },
            listItem: { type: 'list item', element: 'mwc-list-item' },
            iconItem: { element: 'ha-icon', attribute: 'icon', class: 'editor-icon-list' },
            select: { element: 'ha-select' },
        },
        keyMappings: {
            attribute: 'attribute',
            navigateTo: 'navigate_to',
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
        link: { element: 'a', class: 'documentation-link' },
        outerDiv: { element: 'div', class: 'documentation-outer' },
        innerDiv: { element: 'div', class: 'documentation-inner' },
        questionMark: { element: 'div', class: 'documentation-icon' },
        attributes: {
            text: '?',
            linkTarget: '_blank',
            documentationUrl: 'https://github.com/francois-le-ko4la/lovelace-entity-progress-card/',
        },
    },
};

CARD.console = {
    message: `%c✨${CARD.meta.typeName.toUpperCase()} ${VERSION} IS INSTALLED.`,
    css: 'color:orange; background-color:black; font-weight: bold;',
    link: '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card'
};

const THEME = {
    battery: {
        linear: true,
        style: [
            { icon: 'mdi:battery-alert', color: 'var(--state-sensor-battery-low-color)' },
            { icon: 'mdi:battery-alert', color: 'var(--state-sensor-battery-low-color)' },
            { icon: 'mdi:battery-20', color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:battery-30', color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:battery-40', color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:battery-50', color: 'var(--yellow-color)' },
            { icon: 'mdi:battery-60', color: 'var(--yellow-color)' },
            { icon: 'mdi:battery-70', color: 'var(--yellow-color)' },
            { icon: 'mdi:battery-80', color: 'var(--state-sensor-battery-high-color)' },
            { icon: 'mdi:battery-90', color: 'var(--state-sensor-battery-high-color)' },
            { icon: 'mdi:battery', color: 'var(--state-sensor-battery-high-color)' }
        ]
    },
    cpu: {
        linear: true,
        style: [
            { icon: 'mdi:cpu-64-bit', color: 'var(--state-sensor-battery-high-color)' },
            { icon: 'mdi:cpu-64-bit', color: 'var(--yellow-color)' },
            { icon: 'mdi:cpu-64-bit', color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:cpu-64-bit', color: 'var(--state-sensor-battery-low-color)' },
            { icon: 'mdi:cpu-64-bit', color: 'var(--state-sensor-battery-low-color)' },
        ]
    },
    memory: {
        linear: true,
        style: [
            { icon: 'mdi:memory', color: 'var(--state-sensor-battery-high-color)' },
            { icon: 'mdi:memory', color: 'var(--yellow-color)' },
            { icon: 'mdi:memory', color: 'var(--state-sensor-battery-medium-color)' },
            { icon: 'mdi:memory', color: 'var(--state-sensor-battery-low-color)' },
            { icon: 'mdi:memory', color: 'var(--state-sensor-battery-low-color)' },
        ]
    },
    light: {
        linear: true,
        style: [
            { icon: 'mdi:lightbulb-outline', color: '#4B4B4B' },
            { icon: 'mdi:lightbulb-outline', color: '#877F67' },
            { icon: 'mdi:lightbulb', color: '#C3B382' },
            { icon: 'mdi:lightbulb', color: '#FFE79E' },
            { icon: 'mdi:lightbulb', color: '#FFE79E' }
        ]
    },
    temperature: {
        linear: false,
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
            { min: 34, max: 100, icon: 'mdi:thermometer', color: 'var(--red-color)' }
        ],
    },
    humidity: {
        linear: false,
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
        sv: "entity: Parametern 'entity' är obligatorisk!"
    },
    entityNotFound: {
        en: "Entity not found",
        fr: "Entité introuvable",
        es: "Entidad no encontrada",
        it: "Entità non trovata",
        de: "Entität nicht gefunden",
        nl: "Entiteit niet gevonden",
        hr: "Entitet nije pronađen",
        pl: "Encji nie znaleziono",
        mk: "Ентитетот не е пронајден",
        pt: "Entidade não encontrada",
        da: "Enheden blev ikke fundet",
        nb: "Enheten ble ikke funnet",
        sv: "Enhet ej funnen"
    },
    entityUnknown: {
        en: "Unknown",
        fr: "Inconnu",
        es: "Desconocido",
        it: "Sconosciuto",
        de: "Unbekannt",
        nl: "Onbekend",
        hr: "Nepoznat",
        pl: "Nieznany",
        mk: "Непознат",
        pt: "Desconhecido",
        da: "Ukendt",
        nb: "Ukjent",
        sv: "Okänd"
    },
    entityUnavailable: {
        en: "Unavailable",
        fr: "Indisponible",
        es: "No disponible",
        it: "Non disponibile",
        de: "Nicht verfügbar",
        nl: "Niet beschikbaar",
        hr: "Nedostupno",
        pl: "Niedostępny",
        mk: "Недостапно",
        pt: "Indisponível",
        da: "Utilgængelig",
        nb: "Utilgjengelig",
        sv: "Otillgänglig"
    },
    attributeNotFound: {
        en: "attribute: Attribute not found in HA.",
        fr: "attribute: Attribut introuvable dans HA.",
        es: "attribute: Atributo no encontrado en HA.",
        it: "attribute: Attributo non trovato in HA.",
        de: "attribute: Attribut in HA nicht gefunden.",
        nl: "attribute: Attribuut niet gevonden in HA.",
        hr: "attribute: Atribut nije pronađen u HA.",
        pl: "attribute: Atrybut nie znaleziony w HA.",
        mk: "attribute: Атрибутот не е пронајден во HA.",
        pt: "attribute: Atributo não encontrado no HA.",
        da: "attribute: Attribut ikke fundet i HA.",
        nb: "attribute: Attributt ikke funnet i HA.",
        sv: "attribute: Attributet hittades inte i HA."
    },
    minValueError: {
        en: "min_value: Check your min_value.",
        fr: "min_value: Vérifiez votre min_value.",
        es: "min_value: Verifique su min_value.",
        it: "min_value: Controlla il tuo min_value.",
        de: "min_value: Überprüfen Sie Ihren min_value.",
        nl: "min_value: Controleer je min_value.",
        hr: "min_value: Provjerite svoj min_value.",
        pl: "min_value: Sprawdź swój min_value.",
        mk: "min_value: Проверете го вашиот min_value.",
        pt: "min_value: Verifique o seu min_value.",
        da: "min_value: Tjekk din min_value.",
        nb: "min_value: Sjekk din min_value.",
        sv: "min_value: Kontrollera ditt min_value."
    },
    maxValueError: {
        en: "max_value: Check your max_value.",
        fr: "max_value: Vérifiez votre max_value.",
        es: "max_value: Verifique su max_value.",
        it: "max_value: Controlla il tuo max_value.",
        de: "max_value: Überprüfen Sie Ihren max_value.",
        nl: "max_value: Controleer je max_value.",
        hr: "max_value: Provjerite svoj max_value.",
        pl: "max_value: Sprawdź swój max_value.",
        mk: "max_value: Проверете го вашиот max_value.",
        pt: "max_value: Verifique o seu max_value.",
        da: "max_value: Tjekk din max_value.",
        nb: "max_value: Sjekk din max_value.",
        sv: "max_value: Kontrollera ditt max_value."
    },
    decimalError: {
        en: "decimal: This value cannot be negative.",
        fr: "decimal: La valeur ne peut pas être négative.",
        es: "decimal: El valor no puede ser negativo.",
        it: "decimal: Questo valore non può essere negativo.",
        de: "decimal: Negative Werte sind nicht zulässig.",
        nl: "decimal: Deze waarde kan niet negatief zijn.",
        hr: "decimal: Ova vrijednost ne može biti negativna.",
        pl: "decimal: Ta wartość nie może być ujemna.",
        mk: "decimal: Ова вредност не може да биде негативна.",
        pt: "decimal: Este valor não pode ser negativo.",
        da: "decimal: Denne værdi kan ikke være negativ.",
        nb: "decimal: Denne verdien kan ikke være negativ.",
        sv: "decimal: Detta värde kan inte vara negativt."
    },
};

const EDITOR_INPUT_FIELDS = {
    entity: {
        name: 'entity',
        label: {
            en: "Entity",
            fr: "Entité",
            es: "Entidad",
            it: "Entità",
            de: "Entität",
            nl: "Entiteit",
            hr: "Entitet",
            pl: "Encja",
            mk: "Ентитет",
            pt: "Entidade",
            da: "Enhed",
            nb: "Enhet",
            sv: "Enhet"
        },
        type: CARD.editor.fields.entity.type,
        width: '92%',
        required: true,
        isInGroup: null,
        description: {
            en: "Select an entity from Home Assistant.",
            fr: "Sélectionnez une entité de Home Assistant.",
            es: "Seleccione una entidad de Home Assistant.",
            it: "Seleziona un'entità da Home Assistant.",
            de: "Wählen Sie eine Entität aus Home Assistant.",
            nl: "Selecteer een entiteit uit Home Assistant.",
            hr: "Odaberite entitet iz Home Assistanta.",
            pl: "Wybierz encję z Home Assistant.",
            mk: "Изберете ентитет од Home Assistant.",
            pt: "Selecione uma entidade do Home Assistant.",
            da: "Vælg en enhed fra Home Assistant.",
            nb: "Velg en enhet fra Home Assistant.",
            sv: "Välj en enhet från Home Assistant."
        }
    },
    attribute: {
        name: 'attribute',
        label: {
            en: "Attribute",
            fr: "Attribut",
            es: "Atributo",
            it: "Attributo",
            de: "Attribut",
            nl: "Attribuut",
            hr: "Atribut",
            pl: "Atrybut",
            mk: "Атрибут",
            pt: "Atributo",
            da: "Attribut",
            nb: "Attribut",
            sv: "Attribut"
        },
        type: CARD.editor.fields.attribute.type,
        width: '92%',
        required: false,
        isInGroup: CARD.editor.keyMappings.attribute,
        description: {
            en: "Select the attribute.",
            fr: "Sélectionnez l'attribut.",
            es: "Seleccione el atributo.",
            it: "Seleziona l'attributo.",
            de: "Wählen Sie das Attribut aus.",
            nl: "Selecteer het attribuut.",
            hr: "Odaberite atribut.",
            pl: "Wybierz atrybut.",
            mk: "Изберете го атрибутот.",
            pt: "Selecione o atributo.",
            da: "Vælg attributet.",
            nb: "Velg attributtet.",
            sv: "Välj attributet."
        }
    },
    name: {
        name: 'name',
        label: {
            en: "Name",
            fr: "Nom",
            es: "Nombre",
            it: "Nome",
            de: "Name",
            nl: "Naam",
            hr: "Ime",
            pl: "Nazwa",
            mk: "Име",
            pt: "Nome",
            da: "Navn",
            nb: "Navn",
            sv: "Namn"
        },
        type: CARD.editor.fields.default.type,
        width: '48%',
        required: false,
        isInGroup: null,
        description: {
            en: "Enter a name for the entity.",
            fr: "Saisissez un nom pour l'entité.",
            es: "Introduzca un nombre para la entidad.",
            it: "Inserisci un nome per l'entità.",
            de: "Geben Sie einen Namen für die Entität ein.",
            nl: "Voer een naam in voor de entiteit.",
            hr: "Unesite ime za entitet.",
            pl: "Wprowadź nazwę dla encji.",
            mk: "Внесете име за ентитетот.",
            pt: "Digite um nome para a entidade.",
            da: "Indtast et navn for enheden.",
            nb: "Skriv inn et navn for enheten.",
            sv: "Skriv ett namn för enheten."
        }
    },
    unit: {
        name: 'unit',
        label: {
            en: "Unit",
            fr: "Unité",
            es: "Unidad",
            it: "Unità",
            de: "Einheit",
            nl: "Eenheid",
            hr: "Jedinica",
            pl: "Jednostka",
            mk: "Јединство",
            pt: "Unidade",
            da: "Enhed",
            nb: "Enhet",
            sv: "Enhet"
        },
        type: CARD.editor.fields.default.type,
        width: '15%',
        required: false,
        isInGroup: null,
        description: {
            en: "m, kg...",
            fr: "m, kg...",
            es: "m, kg...",
            it: "m, kg...",
            de: "m, kg...",
            nl: "m, kg...",
            hr: "m, kg...",
            pl: "m, kg...",
            mk: "m, kg...",
            pt: "m, kg...",
            da: "m, kg...",
            nb: "m, kg...",
            sv: "m, kg...",
        }
    },
    decimal: {
        name: 'decimal',
        label: {
            en: "decimal",
            fr: "décimal",
            es: "decimal",
            it: "Decimale",
            de: "dezimal",
            nl: "decimaal",
            hr: "decimalni",
            pl: "dziesiętny",
            mk: "децемален",
            pt: "decimal",
            da: "decimal",
            nb: "desimal",
            sv: "decimal"
        },
        type: CARD.editor.fields.number.type,
        width: '25%',
        required: false,
        isInGroup: null,
        description: {
            en: "Precision.",
            fr: "Précision.",
            es: "Precisión.",
            it: "Precisione.",
            de: "Präzision.",
            nl: "Precisie.",
            hr: "Preciznost.",
            pl: "Precyzja.",
            mk: "Прецизност.",
            pt: "Precisão.",
            da: "Præcision.",
            nb: "Presisjon.",
            sv: "Precision."
        }
    },
    min_value: {
        name: 'min_value',
        label: {
            en: "Minimum value",
            fr: "Valeur minimum",
            es: "Valor mínimo",
            it: "Valore minimo",
            de: "Mindestwert",
            nl: "Minimale waarde",
            hr: "Minimalna vrijednost",
            pl: "Wartość minimalna",
            mk: "Минимална вредност",
            pt: "Valor mínimo",
            da: "Minimum værdi",
            nb: "Minimum verdi",
            sv: "Minsta värde"
        },
        type: CARD.editor.fields.number.type,
        width: '45%',
        required: false,
        isInGroup: null,
        description: {
            en: "Enter the minimum value.",
            fr: "Saisissez la valeur minimum.",
            es: "Introduzca el valor mínimo.",
            it: "Inserisci il valore minimo.",
            de: "Geben Sie den Mindestwert ein.",
            nl: "Voer de minimale waarde in.",
            hr: "Unesite minimalnu vrijednost.",
            pl: "Wprowadź wartość minimalną.",
            mk: "Внесете ја минималната вредност.",
            pt: "Digite o valor mínimo.",
            da: "Indtast minimumværdien.",
            nb: "Skriv inn minimumverdien.",
            sv: "Ange det minsta värdet."
        }
    },
    max_value: {
        name: 'max_value',
        label: {
            en: "Maximum value",
            fr: "Valeur maximum",
            es: "Valor máximo",
            it: "Valore massimo",
            de: "Höchstwert",
            nl: "Maximale waarde",
            hr: "Maksimalna vrijednost",
            pl: "Wartość maksymalna",
            mk: "Максимална вредност",
            pt: "Valor máximo",
            da: "Maksimal værdi",
            nb: "Maksimal verdi",
            sv: "Högsta värde"
        },
        type: CARD.editor.fields.default.type,
        width: '45%',
        required: false,
        isInGroup: null,
        description: {
            en: "Enter the maximum value.",
            fr: "Saisissez la valeur maximum.",
            es: "Introduzca el valor máximo.",
            it: "Inserisci il valore massimo.",
            de: "Geben Sie den Höchstwert ein.",
            nl: "Voer de maximale waarde in.",
            hr: "Unesite maksimalnu vrijednost.",
            pl: "Wprowadź wartość maksymalną.",
            mk: "Внесете ја максималната вредност.",
            pt: "Digite o valor máximo.",
            da: "Indtast maksimumværdien.",
            nb: "Skriv inn maksimumverdien.",
            sv: "Ange det högsta värdet."
        }
    },
    tap_action: {
        name: 'tap_action',
        label: {
            en: "Tap action",
            fr: "Action au tap",
            es: "Acción al tocar",
            it: "Azione al tocco",
            de: "Tippen Aktion",
            nl: "Tik actie",
            hr: "Akcija na dodir",
            pl: "Akcja dotknięcia",
            mk: "Акција на допир",
            pt: "Ação ao toque",
            da: "Tap handling",
            nb: "Trykk handling",
            sv: "Tryckåtgärd"
        },
        type: CARD.editor.fields.tap_action.type,
        width: '45%',
        required: false,
        isInGroup: null,
        description: {
            en: "Select the action.",
            fr: "Sélectionnez l'action.",
            es: "Seleccione la acción.",
            it: "Seleziona l'azione.",
            de: "Wählen Sie die Aktion.",
            nl: "Selecteer de actie.",
            hr: "Odaberite akciju.",
            pl: "Wybierz akcję.",
            mk: "Изберете ја акцијата.",
            pt: "Selecione a ação.",
            da: "Vælg handlingen.",
            nb: "Velg handlingen.",
            sv: "Välj åtgärden."
        }
    },
    navigate_to: {
        name: CARD.editor.keyMappings.navigateTo,
        label: {
            en: "Navigate to...",
            fr: "Naviguer vers...",
            es: "Navegar a...",
            it: "Naviga verso...",
            de: "Navigieren zu...",
            nl: "Navigeer naar...",
            hr: "Navigiraj na...",
            pl: "Nawiguj do...",
            mk: "Навигирај до...",
            pt: "Navegar para...",
            da: "Naviger til...",
            nb: "Naviger til...",
            sv: "Navigera till..."
        },
        type: CARD.editor.fields.default.type,
        width: '45%',
        required: false,
        isInGroup: CARD.editor.keyMappings.navigateTo,
        description: {
            en: "Enter the target (/lovelace/0).",
            fr: "Saisir la cible (/lovelace/0).",
            es: "Introduzca el objetivo (/lovelace/0).",
            it: "Inserisci il target (/lovelace/0).",
            de: "Geben Sie das Ziel (/lovelace/0) ein.",
            nl: "Voer de bestemming in (/lovelace/0).",
            hr: "Unesite odredište (/lovelace/0).",
            pl: "Wprowadź cel (/lovelace/0).",
            mk: "Внесете цел (/lovelace/0).",
            pt: "Digite o destino (/lovelace/0).",
            da: "Indtast målet (/lovelace/0).",
            nb: "Skriv inn målet (/lovelace/0).",
            sv: "Ange målet (/lovelace/0)."
        }
    },
    theme: {
        name: 'theme',
        label: {
            en: "Theme",
            fr: "Thème",
            es: "Tema",
            it: "Tema",
            de: "Thema",
            nl: "Thema",
            hr: "Tema",
            pl: "Motyw",
            mk: "Тема",
            pt: "Tema",
            da: "Tema",
            nb: "Tema",
            sv: "Tema"
        },
        type: CARD.editor.fields.theme.type,
        width: '92%',
        required: false,
        isInGroup: null,
        description: {
            en: "Select a theme to automatically define the colors and icon.",
            fr: "Sélectionnez un thème pour définir automatiquement les couleurs et l'icône.",
            es: "Seleccione un tema para definir automáticamente los colores y el icono.",
            it: "Seleziona un tema per definire automaticamente i colori e l'icona.",
            de: "Wählen Sie ein Thema, um die Farben und das Symbol automatisch festzulegen.",
            nl: "Selecteer een thema om automatisch de kleuren en het pictogram in te stellen.",
            hr: "Odaberite temu za automatsko definiranje boja i ikone.",
            pl: "Wybierz motyw, aby automatycznie zdefiniować kolory i ikonę.",
            mk: "Изберете тема за автоматско дефинирање на боите и иконата.",
            pt: "Selecione um tema para definir automaticamente as cores e o ícone.",
            da: "Vælg et tema for automatisk at definere farver og ikon.",
            nb: "Velg et tema for automatisk å definere farger og ikoner.",
            sv: "Välj ett tema för att automatiskt definiera färger och ikoner."
        }
    },
    bar_size: {
        name: 'bar_size',
        label: {
            en: "Size",
            fr: "Taille",
            es: "Tamaño",
            it: "Dimensione",
            de: "Größe",
            nl: "Grootte",
            hr: "Veličina",
            pl: "Rozmiar",
            mk: "Големина",
            pt: "Tamanho",
            da: "Størrelse",
            nb: "Størrelse",
            sv: "Storlek"
        },
        type: CARD.editor.fields.bar_size.type,
        width: '45%',
        required: false,
        isInGroup: null,
        description: {
            en: "Select the bar size",
            fr: "Sélectionnez la taille de la barre",
            es: "Seleccione el tamaño de la barra",
            it: "Seleziona la dimensione della barra",
            de: "Wählen Sie die Balkengröße",
            nl: "Selecteer de balkgrootte",
            hr: "Odaberite veličinu trake",
            pl: "Wybierz rozmiar paska",
            mk: "Изберете ја големината на лентата",
            pt: "Selecione o tamanho da barra",
            da: "Vælg barstørrelse",
            nb: "Velg størrelse på baren",
            sv: "Välj barstorlek"
        }
    },
    bar_color: {
        name: 'bar_color',
        label: {
            en: "Color for the bar",
            fr: "Couleur de la barre",
            es: "Color de la barra",
            it: "Colore per la barra",
            de: "Farbe für die Leiste",
            nl: "Kleur voor de balk",
            hr: "Boja za traku",
            pl: "Kolor paska",
            mk: "Боја за лентата",
            pt: "Cor para a barra",
            da: "Farve til baren",
            nb: "Farge for baren",
            sv: "Färg för baren"
        },
        type: CARD.editor.fields.color.type,
        width: '45%',
        required: false,
        isInGroup: CARD.editor.keyMappings.theme,
        description: {
            en: "Select the color for the bar.",
            fr: "Sélectionnez la couleur de la barre.",
            es: "Seleccione el color de la barra.",
            it: "Seleziona il colore per la barra.",
            de: "Wählen Sie die Farbe für die Leiste.",
            nl: "Selecteer de kleur voor de balk",
            hr: "Odaberite boju trake",
            pl: "Wybierz kolor paska",
            mk: "Изберете ја бојата за лентата",
            pt: "Selecione a cor para a barra",
            da: "Vælg farven til baren",
            nb: "Velg farge for baren",
            sv: "Välj färg för baren"
        }
    },
    icon: {
        name: 'icon',
        label: {
            en: "Icon",
            fr: "Icône",
            es: "Icono",
            it: "Icona",
            de: "Symbol",
            nl: "Pictogram",
            hr: "Ikona",
            pl: "Ikona",
            mk: "Икона",
            pt: "Ícone",
            da: "Ikon",
            nb: "Ikon",
            sv: "Ikon"
        },
        type: CARD.editor.fields.icon.type,
        width: '45%',
        required: false,
        isInGroup: CARD.editor.keyMappings.theme,
        description: {
            en: "Select an icon for the entity.",
            fr: "Sélectionnez une icône pour l'entité.",
            es: "Seleccione un icono para la entidad.",
            it: "Seleziona un'icona per l'entità.",
            de: "Wählen Sie ein Symbol für die Entität.",
            nl: "Selecteer een pictogram voor de entiteit",
            hr: "Odaberite ikonu za entitetu",
            pl: "Wybierz ikonę dla encji",
            mk: "Изберете икона за ентитетот",
            pt: "Selecione um ícone para a entidade",
            da: "Vælg et ikon for enheden",
            nb: "Velg et ikon for enheten",
            sv: "Välj ett ikon för enheten"
        }
    },
    color: {
        name: 'color',
        label: {
            en: "Primary color",
            fr: "Couleur de l'icône",
            es: "Color del icono",
            it: "Colore dell'icona",
            de: "Primärfarbe",
            nl: "Primaire kleur",
            hr: "Primarna boja",
            pl: "Kolor podstawowy",
            mk: "Примарна боја",
            pt: "Cor primária",
            da: "Primærfarve",
            nb: "Primærfarge",
            sv: "Primärfärg"
        },
        type: CARD.editor.fields.color.type,
        width: '45%',
        required: false,
        isInGroup: CARD.editor.keyMappings.theme,
        description: {
            en: "Select the primary color for the icon.",
            fr: "Sélectionnez la couleur de l'icône.",
            es: "Seleccione el color principal del icono.",
            it: "Seleziona il colore principale per l'icona.",
            de: "Wählen Sie die Primärfarbe für das Symbol.",
            nl: "Selecteer de primaire kleur voor het pictogram",
            hr: "Odaberite primarnu boju za ikonu",
            pl: "Wybierz główny kolor ikony",
            mk: "Изберете ја примарната боја за иконата",
            pt: "Selecione a cor primária para o ícone",
            da: "Vælg primærfarven for ikonet",
            nb: "Velg primærfargen for ikonet",
            sv: "Välj primärfärgen för ikonen"
        }
    },
    layout: {
        name: 'layout',
        label: {
            en: "Layout",
            fr: "Disposition",
            es: "Disposición",
            it: "Layout",
            de: "Layout",
            nl: "Indeling",
            hr: "Izgled",
            pl: "Układ",
            mk: "Распоред",
            pt: "Layout",
            da: "Layout",
            nb: "Layout",
            sv: "Layout"
        },
        type: CARD.editor.fields.layout.type,
        width: '45%',
        required: false,
        isInGroup: null,
        description: {
            en: "Select the layout.",
            fr: "Sélectionnez la disposition.",
            es: "Seleccione la disposición.",
            it: "Seleziona il layout.",
            de: "Wählen Sie das Layout.",
            nl: "Selecteer de indeling.",
            hr: "Odaberite izgled.",
            pl: "Wybierz układ.",
            mk: "Изберете го распоредот.",
            pt: "Selecione o layout.",
            da: "Vælg layoutet.",
            nb: "Velg oppsettet.",
            sv: "Välj layouten."
        }
    },
};

const FIELD_OPTIONS = {
    theme: [
        { value: "", label: { en: "", fr: "", es: "", it: "", de: "", nl: "", hr: "", pl: "", mk: "", pt: "", da: "", nb: "", sv: "" }, icon: "mdi:cancel" },
        { value: "battery", label: { en: "Battery", fr: "Batterie", es: "Batería", it: "Batteria", de: "Batterie", nl: "Batterij", hr: "Baterija", pl: "Bateria", mk: "Батерија", pt: "Bateria", da: "Batteri", nb: "Batteri", sv: "Batteri" }, icon: "mdi:battery" },
        { value: "cpu", label: { en: "CPU", fr: "CPU", es: "CPU", it: "CPU", de: "CPU", nl: "CPU", hr: "CPU", pl: "CPU", mk: "CPU", pt: "CPU", da: "CPU", nb: "CPU", sv: "CPU" }, icon: "mdi:cpu-64-bit" },
        { value: "humidity", label: { en: "Humidity", fr: "Humidité", es: "Humedad", it: "Umidità", de: "Feuchtigkeit", nl: "Vochtigheid", hr: "Vlažnost", pl: "Wilgotność", mk: "Влажност", pt: "Humidade", da: "Fugtighed", nb: "Fuktighet", sv: "Luftfuktighet" }, icon: "mdi:water-percent" },
        { value: "light", label: { en: "Light", fr: "Lumière", es: "Luz", it: "Luce", de: "Licht", nl: "Licht", hr: "Svjetlo", pl: "Światło", mk: "Светлина", pt: "Luz", da: "Lys", nb: "Lys", sv: "Ljus" }, icon: "mdi:lightbulb" },
        { value: "memory", label: { en: "RAM", fr: "RAM", es: "RAM", it: "RAM", de: "RAM", nl: "RAM", hr: "RAM", pl: "RAM", mk: "RAM", pt: "RAM", da: "RAM", nb: "RAM", sv: "RAM" }, icon: "mdi:memory" },
        { value: "pm25", label: { en: "PM2.5", fr: "PM2.5", es: "PM2.5", it: "PM2.5", de: "PM2.5", nl: "PM2.5", hr: "PM2.5", pl: "PM2.5", mk: "PM2.5", pt: "PM2.5", da: "PM2.5", nb: "PM2.5", sv: "PM2.5" }, icon: "mdi:air-filter" },
        { value: "temperature", label: { en: "Temperature", fr: "Température", es: "Temperatura", it: "Temperatura", de: "Temperatur", nl: "Temperatuur", hr: "Temperatura", pl: "Temperatura", mk: "Температура", pt: "Temperatura", da: "Temperatur", nb: "Temperatur", sv: "Temperatur" }, icon: "mdi:thermometer" },
        { value: "voc", label: { en: "VOC", fr: "VOC", es: "VOC", it: "VOC", de: "VOC", nl: "VOC", hr: "VOC", pl: "VOC", mk: "VOC", pt: "VOC", da: "VOC", nb: "VOC", sv: "VOC" }, icon: "mdi:air-filter" }
    ],
    color: [
        { value: 'var(--state-icon-color)', label: { en: "Default", fr: "Défaut", es: "Predeterminado", it: "Predefinito", de: "Standard", nl: "Standaard", hr: "Zadano", pl: "Domyślny", mk: "Стандарден", pt: "Padrão", da: "Standard", nb: "Standard", sv: "Standard" } },
        { value: 'var(--accent-color)', label: { en: "Accent", fr: "Accent", es: "Acento", it: "Accentuato", de: "Akzent", nl: "Accent", hr: "Akcenat", pl: "Akcent", mk: "Акцент", pt: "Acente", da: "Accent", nb: "Akent", sv: "Accent" } },
        { value: 'var(--info-color)', label: { en: "Info", fr: "Info", es: "Información", it: "Info", de: "Info", nl: "Info", hr: "Info", pl: "Info", mk: "Инфо", pt: "Info", da: "Info", nb: "Info", sv: "Info" } },
        { value: 'var(--success-color)', label: { en: "Success", fr: "Succès", es: "Éxito", it: "Successo", de: "Erfolg", nl: "Succes", hr: "Uspjeh", pl: "Sukces", mk: "Успех", pt: "Sucesso", da: "Succes", nb: "Suksess", sv: "Framgång" } },
        { value: 'var(--disabled-color)', label: { en: "Disable", fr: "Désactivé", es: "Deshabilitado", it: "Disabilitato", de: "Deaktiviert", nl: "Deactiveren", hr: "Onemogući", pl: "Wyłącz", mk: "Оневозможи", pt: "Desativar", da: "Deaktiver", nb: "Deaktiver", sv: "Inaktivera" } },
        { value: 'var(--red-color)', label: { en: "Red", fr: "Rouge", es: "Rojo", it: "Rosso", de: "Rot", nl: "Rood", hr: "Crvena", pl: "Czerwony", mk: "Црвена", pt: "Vermelho", da: "Rød", nb: "Rød", sv: "Röd" } },
        { value: 'var(--pink-color)', label: { en: "Pink", fr: "Rose", es: "Rosa", it: "Rosa", de: "Pink", nl: "Roze", hr: "Roza", pl: "Różowy", mk: "Розова", pt: "Rosa", da: "Pink", nb: "Rosa", sv: "Rosa" } },
        { value: 'var(--purple-color)', label: { en: "Purple", fr: "Violet", es: "Púrpura", it: "Viola", de: "Lila", nl: "Paars", hr: "Ljubičasta", pl: "Fioletowy", mk: "Пурпурна", pt: "Roxo", da: "Lilla", nb: "Lilla", sv: "Lila" } },
        { value: 'var(--deep-purple-color)', label: { en: "Deep purple", fr: "Violet foncé", es: "Púrpura profundo", it: "Viola scuro", de: "Dunkellila", nl: "Diep paars", hr: "Tamno ljubičasta", pl: "Ciemnofioletowy", mk: "Темно виолетова", pt: "Roxo escuro", da: "Mørk lilla", nb: "Mørk lilla", sv: "Djuplila" } },
        { value: 'var(--indigo-color)', label: { en: "Indigo", fr: "Indigo", es: "Índigo", it: "Indaco", de: "Indigo", nl: "Indigo", hr: "Indigo", pl: "Indygo", mk: "Индиго", pt: "Índigo", da: "Indigo", nb: "Indigo", sv: "Indigo" } },
        { value: 'var(--blue-color)', label: { en: "Blue", fr: "Bleu", es: "Azul", it: "Blu", de: "Blau", nl: "Blauw", hr: "Plava", pl: "Niebieski", mk: "Сина", pt: "Azul", da: "Blå", nb: "Blå", sv: "Blå" } },
        { value: 'var(--light-blue-color)', label: { en: "Light blue", fr: "Bleu clair", es: "Azul claro", it: "Blu chiaro", de: "Hellblau", nl: "Lichtblauw", hr: "Svijetloplava", pl: "Jasnoniebieski", mk: "Светло сина", pt: "Azul claro", da: "Lyseblå", nb: "Lyseblå", sv: "Ljusblå" } },
        { value: 'var(--cyan-color)', label: { en: "Cyan", fr: "Cyan", es: "Cian", it: "Ciano", de: "Cyan", nl: "Cyaan", hr: "Cijan", pl: "Cyjan", mk: "Цијан", pt: "Ciano", da: "Cyan", nb: "Cyan", sv: "Cyan" } },
        { value: 'var(--teal-color)', label: { en: "Teal", fr: "Bleu sarcelle", es: "Verde azulado", it: "Verde acqua", de: "Blaugrün", nl: "Blauwgroen", hr: "Tirkizna", pl: "Morski", mk: "Сината зелена", pt: "Verde-azulado", da: "Blågrøn", nb: "Blågrønn", sv: "Blågrön" } },
        { value: 'var(--green-color)', label: { en: 'Green', fr: 'Vert', es: 'Verde', it: 'Verde', de: 'Grün', nl: 'Groen', hr: 'Zelena', pl: 'Zielony', mk: 'Зелена', pt: 'Verde', da: 'Grøn', nb: 'Grønn', sv: 'Grön' } },
        { value: 'var(--light-green-color)', label: { en: 'Light green', fr: 'Vert clair', es: 'Verde claro', it: 'Verde chiaro', de: 'Hellgrün', nl: 'Lichtgroen', hr: 'Svijetlozelena', pl: 'Jasnozielony', mk: 'Светло зелена', pt: 'Verde claro', da: 'Lysegrøn', nb: 'Lysegrønn', sv: 'Ljusgrön' } },
        { value: 'var(--lime-color)', label: { en: 'Lime', fr: 'Citron vert', es: 'Lima', it: 'Lime', de: 'Limette', nl: 'Limoen', hr: 'Limeta', pl: 'Limonka', mk: 'Лајм', pt: 'Lima', da: 'Lime', nb: 'Lime', sv: 'Lime' } },
        { value: 'var(--yellow-color)', label: { en: 'Yellow', fr: 'Jaune', es: 'Amarillo', it: 'Giallo', de: 'Gelb', nl: 'Geel', hr: 'Žuta', pl: 'Żółty', mk: 'Жолта', pt: 'Amarelo', da: 'Gul', nb: 'Gul', sv: 'Gul' } },
        { value: 'var(--amber-color)', label: { en: 'Amber', fr: 'Ambre', es: 'Ámbar', it: 'Ambra', de: 'Bernstein', nl: 'Amber', hr: 'Jantar', pl: 'Bursztyn', mk: 'Килибар', pt: 'Âmbar', da: 'Ravgul', nb: 'Gult', sv: 'Bärnsten' } },
        { value: 'var(--orange-color)', label: { en: 'Orange', fr: 'Orange', es: 'Naranja', it: 'Arancione', de: 'Orange', nl: 'Oranje', hr: 'Narančasta', pl: 'Pomarańczowy', mk: 'Портокалова', pt: 'Laranja', da: 'Orange', nb: 'Oransje', sv: 'Orange' } },
        { value: 'var(--deep-orange-color)', label: { en: 'Deep orange', fr: 'Orange foncé', es: 'Naranja oscuro', it: 'Arancione scuro', de: 'Dunkelorange', nl: 'Dieporanje', hr: 'Tamnonarančasta', pl: 'Ciemnopomarańczowy', mk: 'Темно портокалова', pt: 'Laranja escuro', da: 'Mørk orange', nb: 'Mørk oransje', sv: 'Mörkorange' } },
        { value: 'var(--brown-color)', label: { en: 'Brown', fr: 'Marron', es: 'Marrón', it: 'Marrone', de: 'Braun', nl: 'Bruin', hr: 'Smeđa', pl: 'Brązowy', mk: 'Кафеава', pt: 'Marrom', da: 'Brun', nb: 'Brun', sv: 'Brun' } },
        { value: 'var(--light-grey-color)', label: { en: 'Light grey', fr: 'Gris clair', es: 'Gris claro', it: 'Grigio chiaro', de: 'Hellgrau', nl: 'Lichtgrijs', hr: 'Svijetlosiva', pl: 'Jasnoszary', mk: 'Светло сива', pt: 'Cinza claro', da: 'Lysegrå', nb: 'Lysegrå', sv: 'Ljusgrå' } },
        { value: 'var(--grey-color)', label: { en: 'Grey', fr: 'Gris', es: 'Gris', it: 'Grigio', de: 'Grau', nl: 'Grijs', hr: 'Siva', pl: 'Szary', mk: 'Сива', pt: 'Cinza', da: 'Grå', nb: 'Grå', sv: 'Grå' } },
        { value: 'var(--dark-grey-color)', label: { en: 'Dark grey', fr: 'Gris foncé', es: 'Gris oscuro', it: 'Grigio scuro', de: 'Dunkelgrau', nl: 'Donkergrijs', hr: 'Tamnosiva', pl: 'Ciemnoszary', mk: 'Темно сива', pt: 'Cinza escuro', da: 'Mørkegrå', nb: 'Mørkegrå', sv: 'Mörkgrå' } },
        { value: 'var(--blue-grey-color)', label: { en: 'Blue grey', fr: 'Gris bleuté', es: 'Gris azulado', it: 'Grigio bluastro', de: 'Blaugrau', nl: 'Blauwgrijs', hr: 'Plavosiva', pl: 'Niebieskoszary', mk: 'Сино сива', pt: 'Cinza azulado', da: 'Blågrå', nb: 'Blågrå', sv: 'Blågrå' } },
        { value: 'var(--black-color)', label: { en: 'Black', fr: 'Noir', es: 'Negro', it: 'Nero', de: 'Schwarz', nl: 'Zwart', hr: 'Crna', pl: 'Czarny', mk: 'Црна', pt: 'Preto', da: 'Sort', nb: 'Svart', sv: 'Svart' } },
        { value: 'var(--white-color)', label: { en: 'White', fr: 'Blanc', es: 'Blanco', it: 'Bianco', de: 'Weiß', nl: 'Wit', hr: 'Bijela', pl: 'Biały', mk: 'Бела', pt: 'Branco', da: 'Hvid', nb: 'Hvit', sv: 'Vit' } }

    ],
    bar_size: [
        { value: CARD.style.bar.sizeOptions.small.label, label: { en: "Small", fr: "Petite", es: "Pequeña", it: "Piccola", de: "Klein", nl: "Klein", hr: "Mali", pl: "Mały", mk: "Мало", pt: "Pequeno", da: "Lille", nb: "Liten", sv: "Liten" }, icon: CARD.style.bar.sizeOptions.small.mdi },
        { value: CARD.style.bar.sizeOptions.medium.label, label: { en: "Medium", fr: "Moyenne", es: "Media", it: "Media", de: "Mittel", nl: "Middel", hr: "Srednje", pl: "Średni", mk: "Средно", pt: "Médio", da: "Mellem", nb: "Middels", sv: "Medium" }, icon: CARD.style.bar.sizeOptions.medium.mdi },
        { value: CARD.style.bar.sizeOptions.large.label, label: { en: "Large", fr: "Grande", es: "Grande", it: "Grande", de: "Groß", nl: "Groot", hr: "Veliko", pl: "Duży", mk: "Големо", pt: "Grande", da: "Stor", nb: "Stor", sv: "Stor" }, icon: CARD.style.bar.sizeOptions.large.mdi },
    ],
    layout: [
        { value: CARD.layout.orientations.horizontal.label, label: { en: "Horizontal (default)", fr: "Horizontal (par défaut)", es: "Horizontal (predeterminado)", it: "Orizzontale (predefinito)", de: "Horizontal (Standard)", nl: "Horizontaal (standaard)", hr: "Horizontalno (zadano)", pl: "Poziomo (domyślnie)", mk: "Хоризонтално (стандардно)", pt: "Horizontal (padrão)", da: "Horisontal (standard)", nb: "Horisontal (standard)", sv: "Horisontell (standard)" }, icon: CARD.layout.orientations.horizontal.mdi },
        { value: CARD.layout.orientations.vertical.label, label: { en: "Vertical", fr: "Vertical", es: "Vertical", it: "Verticale", de: "Vertikal", nl: "Verticaal", hr: "Vertikalno", pl: "Pionowy", mk: "Вертикално", pt: "Vertical", da: "Vertikal", nb: "Vertikal", sv: "Vertikal" }, icon: CARD.layout.orientations.vertical.mdi },
    ],
    tap_action: [
        { value: CARD.interactions.action.tap.more_info, label: { en: "More info (default)", fr: "Plus d'infos (par défaut)", es: "Más información (predeterminado)", it: "Più informazioni (predefinito)", de: "Mehr Infos (Standard)", nl: "Meer info (standaard)", hr: "Više informacija (zadano)", pl: "Więcej informacji (domyślnie)", mk: "Повеќе информации (стандардно)", pt: "Mais informações (padrão)", da: "Mere info (standard)", nb: "Mer info (standard)", sv: "Mer info (standard)" } },
        { value: CARD.interactions.action.tap.navigate_to, label: { en: "Navigate to...", fr: "Naviguer vers...", es: "Navegar a...", it: "Naviga a...", de: "Zu navigieren...", nl: "Navigeer naar...", hr: "Navigiraj na...", pl: "Nawiguj do...", mk: "Навигирај до...", pt: "Navegar para...", da: "Naviger til...", nb: "Naviger til...", sv: "Navigera till..." } },
        { value: CARD.interactions.action.tap.no_action, label: { en: "No action", fr: "Aucune action", es: "Sin acción", it: "Nessuna azione", de: "Keine Aktion", nl: "Geen actie", hr: "Nema akcije", pl: "Brak akcji", mk: "Нема акција", pt: "Sem ação", da: "Ingen handling", nb: "Ingen handling", sv: "Ingen åtgärd" } }
    ]
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
                    <${CARD.htmlStructure.elements.progressBar.inner.element} class="${CARD.htmlStructure.elements.progressBar.inner.class}"></${CARD.htmlStructure.elements.progressBar.inner.element}>
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
        border-radius: 12px;
        margin: 0 auto;
        overflow: hidden;
    }

    .${CARD.style.dynamic.clickable} {
        cursor: pointer;
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

    /* Progress bar */
    .${CARD.htmlStructure.elements.progressBar.container.class} {
        flex-grow: 1;
        height: 8px;
        max-height: 16px;
        background-color: var(--divider-color);
        border-radius: ${CARD.style.bar.radius};
        overflow: hidden;
        position: relative;
    }

    .${CARD.style.bar.sizeOptions.small.label} ${CARD.htmlStructure.elements.progressBar.container.class} {
        height: 8px;
        max-height: 8px;
    }

    .${CARD.style.bar.sizeOptions.medium.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
        height: 12px;
        max-height: 12px;
   }

    .${CARD.style.bar.sizeOptions.large.label} .${CARD.htmlStructure.elements.progressBar.container.class} {
        height: 16px;
        max-height: 16px;
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
        border-radius: 12px;
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

    .${CARD.editor.fields.container.class} {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0 2%;
    }
    .${CARD.editor.fields.fieldContainer.class} {
        display: block;
        margin-bottom: 12px;
        height: 73px;
    }

    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.attribute} .${CARD.editor.keyMappings.attribute},
    .${CARD.style.dynamic.hide}-${CARD.editor.keyMappings.navigateTo} .${CARD.editor.keyMappings.navigateTo},
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

    .${CARD.documentation.outerDiv.class} {
        width: 50px;
        height: 50px;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
    }

    .${CARD.documentation.innerDiv.class} {
        width: 30px;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .${CARD.documentation.questionMark.class} {
        font-size: 20px;
        color: black;
        font-weight: bold;
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
     * @param {number} [minValue=CARD.config.value.min] - The minimum value. Defaults to CARD.config.value.min.
     * @param {number} [maxValue=CARD.config.value.max] - The maximum percentage value. Defaults to CARD.config.value.max.
     * @param {string} [unit=CARD.config.unit.default] - The unit of measurement. Defaults to CARD.config.unit.default.
     * @param {number} [decimal=CARD.config.decimal.percentage] - The number of decimal places to use. Defaults to CARD.config.decimal.percentage.
     */
    constructor(currentValue = 0, minValue = CARD.config.value.min, maxValue = CARD.config.value.max, unit = CARD.config.unit.default, decimal = CARD.config.decimal.percentage) {
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
     * @param {number} [newMin] - The new minimum value. If not provided, defaults to CARD.config.value.min.
     */
    set min(newMin) {
        if (!newMin) {
            newMin = CARD.config.value.min;
        }
        this._min.value = newMin;
    }
    /**
     * Sets the maximum percentage value.
     *
     * @param {number} [newMax] - The new maximum value. If not provided, defaults to CARD.config.value.max.
     */
    set max(newMax) {
        if (!newMax) {
            newMax = CARD.config.value.max;
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

    /**
     * Calculates the value to display based on the selected theme and unit system.
     *
     * @param {boolean} themeIsLinear - Indicates whether the theme uses a linear scale.
     * @returns {number} - The percentage value if the theme is linear or if the unit is the default,
     *                     otherwise returns the temperature value converted to Celsius if the unit is Fahrenheit.
     *
     * - If the unit is Fahrenheit, the temperature is converted to Celsius before returning.
     * - If the theme is linear or the unit is the default, the percentage value is returned.
     */
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
    constructor(theme = null, value = 0, isValid = false, isLinear = false, isCustomTheme = false) {
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
        // array with 1 element
        if (!Array.isArray(customTheme) || customTheme.length === 0) {
            return false;
        }

        // check all elements
        let isFirstItem = true;
        let lastMax = null;

        return customTheme.every(item => {
            if (item === null || typeof item !== 'object') {
                return false;
            }

            // check keys
            if (!CARD.theme.customTheme.expectedKeys.every(key => key in item)) {
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

    /**
     * Sets the custom theme.
     *
     * @param {obj} newTheme - Theme def.
     */
    set customTheme(newTheme) {
        this._isValid = false;
        this._isCustomTheme = true;
        this._isLinear = false;
        this._theme = CARD.theme.default;

        if (!this._checkCustomThemeStructure(newTheme)) {
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
        const thresholdSize = CARD.config.value.max / lastStep;
        const percentage = Math.max(0, Math.min(this._value, CARD.config.value.max));
        const themeData = this._currentStyle[Math.floor(percentage / thresholdSize)];
        this._icon = themeData.icon;
        this._color = themeData.color;
    }

    _setStyle() {
        let themeData = null;
        if (this._value >= this._currentStyle[this._currentStyle.length - 1].max) {
            themeData = this._currentStyle[this._currentStyle.length - 1];
        } else if (this._value < this._currentStyle[0].min) {
            themeData = this._currentStyle[0];
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
    constructor(callerName) {
        // console.log(`Caller : ${callerName}`);
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
        return this._hass.language;
    }
}

/**
 * Helper class for managing numeric values.
 * This class validates and stor a numeric value.
 *
 * @class ValueHelper
 */
class ValueHelper {
    constructor() {
        this._value = null;
        this._isValid = false;
    }

    set value(value) {
        this._value = Number.isFinite(value) ? value : null;
        this._isValid = Number.isFinite(value);
    }

    get value() {
        return this._value;
    }

    get isValid() {
        return this._isValid;
    }
}

/**
 * Helper class for managing entities.
 * This class validates and retrieves information from Home Assistant if it's an entity.
 *
 * @class EntityHelper
 */
class EntityHelper {
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
        this._hassProvider = new HassProvider(this.constructor.name);
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
         * @type {string}
         * @private
         */
        this._id = null;
        /**
         * @type {string}
         * @private
         */
        this._attribute = null;
        /**
         * @type {string}
         * @private
         */
        this._state = null;

        this._type = null;
        this._hassCache = null;
        this._lastHass = null;
    }

    set id(id) {
        this._id = id;
        this._isValid = false;
        this._value = 0;
        if (!(typeof this._id === 'string' && this._id)) {
            return;
        }
        this._validate();
        this._type = this._id.split('.')[0];
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
        this._isValid = false;
    }
    /**
     * Indicates Entity's state
     *
     * @returns {string} Current state.
     */
    get state() {
        return this._state;
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
    _validate() {
        if (!this._hassProvider.hass || !this._hassProvider.hass.states) {
            return;
        }
        if (!this._hassProvider.hass.states[this._id]) {
            this._state = CARD.config.entity.state.notFound;
            return;
        }
        this._isValid = true;
    }

    refresh() {
        this._state = null;
        this._isAvailable = false;

        this._validate();
        if (!this._isValid) {
            return;
        }

        const entityState = this.states;
        this._state = entityState.state;
        if (this._state === CARD.config.entity.state.unavailable || this._state === CARD.config.entity.state.unknown) {
            this._value = 0;
            return;
        }
        this._isAvailable = true;

        if (this.hasAttribute) {
            const attribute = this._attribute ?? ATTRIBUTE_MAPPING[this._type].attribute;
            if (attribute && entityState.attributes.hasOwnProperty(attribute)) {
                this._value = entityState.attributes[attribute] ?? 0;
                if (this._type === ATTRIBUTE_MAPPING.light.label && attribute === ATTRIBUTE_MAPPING.light.attribute) {
                    this._value = (100 * this._value) / 255;
                }
            } else { // attribute not supported
                this._value = 0;
                this._isValid = false;
                this._isAvailable = false;
            }
        } else {
            this._value = parseFloat(this._state) || 0;
        }
        return;
    }
    _getDeviceClass() {
        const entityState = this.states;

        if (!this._isValid) {
            return null;
        }

        if (entityState.attributes?.device_class) {
            return entityState.attributes.device_class;
        }

        if (this._type === 'light' && entityState.attributes?.brightness !== undefined) {
            return 'light';
        }

        return null;
    }
    /**
     * Returns the icon of the entity, if valid.
     */
    get icon() {
        const entityState = this.states;
        if (!entityState) {
            return null;
        }
        const icon = entityState.attributes?.icon;
        const deviceClass = this._getDeviceClass();
        const deviceClassIcon = deviceClass && CARD.style.icon.byDeviceClass.hasOwnProperty(deviceClass)
            ? CARD.style.icon.byDeviceClass[deviceClass]
            : null;
        return this._isValid ? (icon || deviceClassIcon) : null;
    }
    /**
     *
     */
    get hasAttribute() {
        return this._isValid ? !!ATTRIBUTE_MAPPING[this._type] : false;
    }
    get name() {
        return this._isValid ? this._hassProvider.hass.states[this._id]?.attributes?.friendly_name : null;
    }
    get states() {
        return this._isValid ? this._hassProvider.hass.states[this._id] : null;
    }
    get unit() {
        return this._isValid ? this._hassProvider.hass.states[this._id]?.attributes?.unit_of_measurement : null;
    }
    get precision() {
        return this._isValid ? this._hassProvider?.hass?.entities?.[this._id]?.display_precision ?? null : null;
    }
    get attributes() {

        return this._isValid ? this._hassProvider?.hass?.entities?.[this._id]?.display_precision ?? null : null;
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
        this._activeHelper = null; // Dynamically set to EntityHelper or ValueHelper
        this._isEntity = null;
    }

    _createValueHelper() {
        if (!this._activeHelper || !(this._activeHelper instanceof ValueHelper)) {
            this._activeHelper = new ValueHelper();
            this._isEntity = false;
        }
    }

    _createEntityHelper() {
        if (!this._activeHelper || !(this._activeHelper instanceof EntityHelper)) {
            this._activeHelper = new EntityHelper();
            this._isEntity = true;
        }
    }

    /**
     * Sets the value, which can be an entity ID or a direct value.
     * Dynamically delegates to the appropriate helper.
     * @param {string|number} input - The value or entity ID.
     */
    set value(input) {
        if (typeof input === 'string') {
            this._createEntityHelper();
            this._activeHelper.id = input;
        } else if (Number.isFinite(input)) {
            this._createValueHelper();
            this._activeHelper.value = input;
        } else {
            this._activeHelper = null;
        }
    }

    /******************************************************************************************
     * Proxy function
     */
    get isEntity() {
        return this._isEntity;
    }
    get value() {
        return this._activeHelper ? this._activeHelper.value : null;
    }
    set attribute(newAttribute) {
        if (this._isEntity) {
            this._activeHelper.attribute = newAttribute;
        }
    }
    get state() {
        return this._activeHelper && this._isEntity ? this._activeHelper.state : null;
    }
    get isValid() {
        return this._activeHelper ? this._activeHelper.isValid : false;
    }
    get isAvailable() {
        return this._activeHelper ? this._isEntity && this._activeHelper.isAvailable || this._activeHelper.isValid : false;
    }
    get precision() {
        return this._activeHelper && this._isEntity ? this._activeHelper.precision : null;
    }
    get name() {
        return this._activeHelper && this._isEntity ? this._activeHelper.name : null;
    }
    get icon() {
        return this._activeHelper && this._isEntity ? this._activeHelper.icon : null;
    }
    refresh() {
        if (this._activeHelper && this._isEntity) {
            this._activeHelper.refresh();
        }
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
        this._hassProvider = new HassProvider(this.constructor.name);
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
        if (!this._isChanged) {
            return;
        }
        this._isChanged = false;

        const entityState = this._hassProvider.hass.states[this._config.entity];

        this._isValid = false;
        if (!this._config.entity) {
            this._msg = MSG.entityError;
            return;
        } else if (this._config.attribute && !entityState.attributes.hasOwnProperty(this._config.attribute)) {
            this._msg = MSG.attributeNotFound;
            return;
        } else if (this._config.min_value && !Number.isFinite(this._config.min_value)) {
            this._msg = MSG.minValueError;
            return;
        } else if (!Number.isFinite(this.max_value)) {
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
        this._hassProvider = new HassProvider(this.constructor.name);
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
        this._isUnknown = false;
        this._isNotFound = false;
        this._isUnavailable = false;
    }

    /**
     * Returns whether the card configuration is valid.
     *
     * @returns {boolean} True if the configuration is valid, false otherwise.
     */
    get isValid() {
        return this._configHelper.isValid;
    }

    /**
     * Returns the validation error message, or null if the configuration is valid.
     *
     * @returns {string|null} The error message.
     */
    get msg() {
        return this._configHelper.msg[this.currentLanguage];
    }

    /**
     * Returns the card configuration.
     *
     * @returns {object} The card configuration.
     */
    get config() {
        return this._config;
    }

    /**
     * Sets the card configuration and updates related properties.
     *
     * @param {object} config - The new card configuration.
     */
    set config(config) {
        this._configHelper.config = config;
        this.layout = config.layout;
        this.bar_size = config.bar_size;
        this._percentHelper.unit = config.unit;
        this.show_more_info = typeof config.show_more_info === 'boolean' ? config.show_more_info : CARD.config.showMoreInfo;
        this.navigate_to = config.navigate_to !== undefined ? config.navigate_to : null;
        this._theme.theme = config.theme;
        if (Array.isArray(config.custom_theme)) {
            this._theme.customTheme = config.custom_theme;
        }
        this._currentValue.value = config.entity;
        this._currentValue.attribute = config.attribute || null;
        this._max_value.value = config.max_value || CARD.config.value.max;
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

        // this._max_value.value = this._configHelper.config.max_value || CARD.config.value.max;
        this._currentValue.refresh();
        this._max_value.refresh();
        this._configHelper.max_value = this._max_value.value;
        this._configHelper.decimal = this._configHelper.config.decimal ?? this._currentValue.precision;
        this._configHelper.checkConfig();

        if (!this._checkEntityState()) {
            return;
        }
        this.isAvailable = true;
        // update
        this._percentHelper.current = this._currentValue.value;
        this._percentHelper.decimal = this._configHelper.config.decimal ?? this._currentValue.precision;
        this._percentHelper.min = this._configHelper.config.min_value;
        this._percentHelper.max = this._max_value.value;
        this._percentHelper.refresh();
        this._theme.value = this._percentHelper.valueForThemes(this._theme.isLinear);
    }

    _checkEntityState() {
        this._isUnknown = (this._currentValue.state === CARD.config.entity.state.unknown || this._max_value.state === CARD.config.entity.state.unknown);
        this._isUnavailable = (this._currentValue.state === CARD.config.entity.state.unavailable || this._max_value.state === CARD.config.entity.state.unavailable);
        this._isNotFound = (this._currentValue.state === CARD.config.entity.state.notFound || this._max_value.state === CARD.config.entity.state.notFound);
        this.isAvailable = !(!this._currentValue.isAvailable || (!this._max_value.isAvailable && this._configHelper.config.max_value));

        return this.isAvailable;
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
        if (this._isNotFound) {
            return CARD.style.icon.notFound.icon;
        }
        if (this._theme.theme === CARD.theme.battery.label && this._currentValue.icon && this._currentValue.icon.includes(CARD.theme.battery.icon)) {
            return this._currentValue.icon;
        }
        return this._theme.icon || this._configHelper.config.icon || this._currentValue.icon || CARD.style.icon.default.icon;
    }

    /**
     * Returns the color to use based on the theme or configuration.
     *
     * @returns {string} The color.
     */
    get color() {
        if (this.isAvailable) {
            return this._theme.color || this._configHelper.config.color || CARD.style.color.default;
        }
        if (this._isUnknown) {
            return CARD.style.color.default;
        }
        if (this._isUnavailable) {
            return CARD.style.color.unavailable;
        }
        if (this._isNotFound) {
            return CARD.style.color.notFound;
        }
        return CARD.style.color.disabled;
    }

    /**
     * Returns the color to use for the progress bar.
     *
     * @returns {string} The bar color.
     */
    get bar_color() {
        if (this.isAvailable) {
            return this._theme.color || this._configHelper.config.bar_color || CARD.style.color.default;
        }
        if (this._isUnknown) {
            return CARD.style.color.default;
        }
        return CARD.style.color.disabled;
    }

    /**
     * Returns the percentage value.
     *
     * @returns {number} The percentage value.
     */
    get percent() {
        if (this.isAvailable) {
            return Math.min(CARD.config.value.max, Math.max(0, this._percentHelper.percent));
        }
        return CARD.config.value.min;
    }

    /**
     * Returns the description, which is the formatted percentage value or the unavailable message.
     *
     * @returns {string} The description.
     */
    get description() {
        if (this.isAvailable) {
            return this._percentHelper.label;
        }
        if (this._isUnknown) {
            return MSG.entityUnknown[this.currentLanguage];
        }
        if (this._isUnavailable) {
            return MSG.entityUnavailable[this.currentLanguage];
        }
        return MSG.entityNotFound[this.currentLanguage];
    }

    /**
     * Returns the name of the entity or the configured name.
     *
     * @returns {string} The name.
     */
    get name() {
        return this._configHelper.config.name || this._currentValue.name || this._configHelper.config.entity;
    }

    get isBadgeEnable() {
        if (!(this._isUnavailable || this._isNotFound)) {
            return false;
        }
        return true;
    }

    get badgeInfo() {
        if (this._isNotFound) {
            return CARD.style.icon.badge.notFound;
        }
        if (this._isUnavailable) {
            return CARD.style.icon.badge.unavailable;
        }
        return null;
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
        this.attachShadow({ mode: CARD.config.shadowMode });
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
        this.addEventListener(CARD.interactions.event.click, this._handleCardAction.bind(this));
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
        const card = document.createElement(CARD.htmlStructure.card.element);
        card.classList.add(CARD.meta.typeName);
        card.classList.toggle(CARD.style.dynamic.clickable, this._cardView.show_more_info || this._cardView.navigate_to);
        card.innerHTML = CARD_HTML;
        const style = document.createElement(CARD.style.element);
        style.textContent = CARD_CSS;

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(card);
        // store DOM ref to update
        this._elements = {
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

    _changeBarSize() {
        let size = null;

        switch (this._cardView.bar_size) {
            case CARD.style.bar.sizeOptions.small.label:
            case CARD.style.bar.sizeOptions.medium.label:
            case CARD.style.bar.sizeOptions.large.label:
                size = this._cardView.bar_size;
                break;
            default:
                size = CARD.style.bar.sizeOptions.small.label;
                break;
        }
        this._elements[CARD.htmlStructure.card.element].classList.toggle(size, true);
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
        this._updateElement(CARD.htmlStructure.card.element, (el) => {
            const isVertical = this._cardView.layout === CARD.layout.orientations.vertical.label;
            el.classList.toggle(CARD.layout.orientations.vertical.label, isVertical);
            el.classList.toggle(CARD.layout.orientations.horizontal.label, !isVertical);
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

    _updateCSS() {
        this._updateElement(CARD.htmlStructure.card.element, (el) => {
            el.style.setProperty(CARD.style.dynamic.progressBar.color.var, this._cardView.bar_color);
            el.style.setProperty(CARD.style.dynamic.progressBar.size.var, `${this._cardView.percent}%`);
            el.style.setProperty(CARD.style.dynamic.iconAndShape.color.var, this._cardView.color);
        });
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
        this._showBadge();
        this._updateCSS();

        this._updateElement(CARD.htmlStructure.elements.icon.class, (el) => {
            if (el.getAttribute(CARD.htmlStructure.elements.icon.class) !== this._cardView.icon) {
                el.setAttribute(CARD.htmlStructure.elements.icon.class, this._cardView.icon);
            }
        });

        this._updateElement(CARD.htmlStructure.elements.name.class, (el) => {
            if (el.textContent !== this._cardView.name) {
                el.textContent = this._cardView.name;
            }
        });

        this._updateElement(CARD.htmlStructure.elements.percentage.class, (el) => {
            if (el.textContent !== this._cardView.description) {
                el.textContent = this._cardView.description;
            }
        });
    }

    /**
     * Displays a badge
     */
    _showBadge() {
        const isBadgeEnable = this._cardView.isBadgeEnable;
        this._elements[CARD.htmlStructure.card.element].classList.toggle(`${CARD.style.dynamic.show}-${CARD.htmlStructure.elements.badge.container.class}`, isBadgeEnable);
        if (isBadgeEnable) {
            const badgeInfo = this._cardView.badgeInfo;
            if (!badgeInfo) {
                return;
            }
            this._updateElement(CARD.htmlStructure.elements.badge.icon.class, (el) => {
                if (el.getAttribute(badgeInfo.attribute) !== badgeInfo.icon) {
                    el.setAttribute(badgeInfo.attribute, badgeInfo.icon);
                }
            });
            this._updateElement(CARD.htmlStructure.card.element, (el) => {
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
    _showError(message) {
        this._elements[CARD.htmlStructure.card.element].classList.toggle(`${CARD.style.dynamic.show}-${CARD.htmlStructure.alert.container.element}`, true);
        this._updateElement(CARD.htmlStructure.alert.icon.class, (el) => {
            if (el.getAttribute(CARD.style.icon.alert.attribute) !== CARD.style.icon.alert.icon) {
                el.setAttribute(CARD.style.icon.alert.attribute, CARD.style.icon.alert.icon);
            }
        });
        this._updateElement(CARD.htmlStructure.alert.message.class, (el) => {
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
    _hideError() {
        this._elements[CARD.htmlStructure.card.element].classList.toggle(`${CARD.style.dynamic.show}-${CARD.htmlStructure.alert.container.element}`, false);
    }

    /**
     * Returns the number of grid rows for the card size based on the current layout.
     *
     * @returns {number} - The number of grid rows for the current card layout.
     */
    getCardSize() {
        if (this._cardView.layout === CARD.layout.orientations.vertical.label) {
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
        if (this._cardView.layout === CARD.layout.orientations.vertical.label) {
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
 *
 * This code ensures that the custom card is added to the list of registered custom cards,
 * which Home Assistant uses to dynamically render and manage custom cards in its user interface.
 * The check ensures that the `customCards` array is created if it does not exist, without overwriting
 * any existing custom cards that may already be registered.
 */
window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
    type: CARD.meta.typeName,
    name: CARD.meta.name,
    description: CARD.meta.description,
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
        this._debug = CARD.config.debug;
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
        while (this._pendingUpdatesLock) { }
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
        }, CARD.config.debounce);
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
        while (this._pendingUpdatesLock) { }
        this._pendingUpdatesLock = true;

        let hasChanges = false;

        for (const [key, value] of Object.entries(this._pendingUpdates)) {
            this._logDebug('ConfigManager/_applyPendingUpdates:', [key, value]);
            let curValue = value;
            if (typeof value === 'string' && value.trim() !== '' && (EDITOR_INPUT_FIELDS.hasOwnProperty(key) && EDITOR_INPUT_FIELDS[key].type === CARD.editor.fields.number.type || key === EDITOR_INPUT_FIELDS.max_value.name)) {
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
        this.attachShadow({ mode: CARD.config.shadowMode });
        this._container = null
        this.config = {};
        this._hassProvider = new HassProvider(this.constructor.name);
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

        this._currentLanguage = MSG.decimalError[hass.language] ? hass.language : CARD.config.language;
        if (!this._hassProvider.hass || this._hassProvider.hass.entities !== hass.entities) {
            this._hassProvider.hass = hass;
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
        //return this._hass;
        return this._hassProvider.hass;
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
        if (!this._hassProvider.hass) {
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
        this._container.classList.toggle(`${CARD.style.dynamic.hide}-${key}`, disable);
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
            } else if (key !== CARD.editor.keyMappings.tapAction) {
                this._elements[key].value = '';
            } else {
                this._elements[CARD.editor.keyMappings.tapAction].value = this._getTapActionValue();
            }
        });
        this._toggleFieldDisable(CARD.editor.keyMappings.navigateTo, (this._getTapActionValue() !== CARD.editor.keyMappings.navigateTo));
        if (!this.config.hasOwnProperty(CARD.editor.keyMappings.theme)) {
            this._toggleFieldDisable(CARD.editor.keyMappings.theme, false);
        } else {
            this._toggleFieldDisable(CARD.editor.keyMappings.theme, THEME.hasOwnProperty(this.config[CARD.editor.keyMappings.theme]));
        }
    }

    _updateUnitFromEntity(unitAvailable) {
        if (unitAvailable) {
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
        if (key === CARD.editor.keyMappings.theme) {
            this._toggleFieldDisable(CARD.editor.keyMappings.theme, value !== '');
        }
        if (key === EDITOR_INPUT_FIELDS.entity.type) {
            const curEntity = new EntityHelper();
            curEntity.id = value;
            const attributeAvailable = curEntity.hasAttribute;
            const unitAvailable = curEntity.unit;
            if (attributeAvailable) {
                this._refreshAttributeOption(curEntity.states)
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
     *                         Possible values: `CARD.interactions.action.tap.navigate_to`,
     *                         `CARD.interactions.action.tap.more_info`, `CARD.interactions.action.tap.no_action`.
     */
    _manageTapAction(value) {
        this.configManager._logDebug('_manageTapAction - Toggle value', value);
        switch (value) {
            case CARD.interactions.action.tap.navigate_to:
                this._updateConfigProperty(CARD.interactions.action.tap.more_info, '');
                // reenable with a value already set
                this._updateConfigProperty(
                    CARD.interactions.action.tap.navigate_to, this._elements[EDITOR_INPUT_FIELDS.navigate_to.name].value);
                break;
            case CARD.interactions.action.tap.more_info:
                this._updateConfigProperty(CARD.interactions.action.tap.navigate_to, '');
                this._updateConfigProperty(CARD.interactions.action.tap.more_info, true);
                break;
            case CARD.interactions.action.tap.no_action:
                this._updateConfigProperty(CARD.interactions.action.tap.navigate_to, '');
                this._updateConfigProperty(CARD.interactions.action.tap.more_info, false);
                break;
        }
        this._toggleFieldDisable(CARD.editor.keyMappings.navigateTo, (value !== CARD.editor.keyMappings.navigateTo));
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
            value = CARD.interactions.action.tap.navigate_to;
        } else if (this.config.show_more_info === true || this.config.show_more_info === undefined) {
            value = CARD.interactions.action.tap.more_info;
        } else if (this.config.show_more_info === false) {
            value = CARD.interactions.action.tap.no_action;
        }

        return value;
    }

    _getAttributeOption(curEntity = null) {
        const entity = curEntity ?? this._hassProvider.hass.states[this.config.entity] ?? null;
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
    _addChoices(select, type, curEntity = null) {
        select.innerHTML = '';
        const list = (type === CARD.editor.fields.attribute.type) ? this._getAttributeOption(curEntity) : FIELD_OPTIONS[type];
        this.configManager._logDebug('_addChoices - List ', list);
        if (!list) {
            return;
        }
        list.forEach(optionData => {
            const option = document.createElement(CARD.editor.fields.listItem.element);
            option.value = optionData.value;

            if (type === CARD.editor.fields.color.type) {
                option.innerHTML = `
                    <span style="display: inline-block; width: 16px; height: 16px; background-color: ${optionData.value}; border-radius: 50%; margin-right: 8px;"></span>
                    ${optionData.label[this._currentLanguage]}
                `;
            } else if (type === CARD.editor.fields.layout.type || type === CARD.editor.fields.theme.type || type === CARD.editor.fields.bar_size.type) {
                const haIcon = document.createElement(CARD.editor.fields.iconItem.element);
                haIcon.setAttribute(CARD.editor.fields.iconItem.attribute, optionData.icon);
                haIcon.classList.add(CARD.editor.fields.iconItem.class);
                option.appendChild(haIcon);
                option.append(optionData.label[this._currentLanguage]);
            } else if (type === CARD.editor.fields.tap_action.type) {
                option.innerHTML = `${optionData.label[this._currentLanguage]}`;
            } else if (type === CARD.editor.fields.attribute.type) {
                option.innerHTML = `${optionData.label}`;
            }

            select.appendChild(option);
        });
    }

    _refreshAttributeOption(curEntity) {
        if (!curEntity) {
            return;
        }
        const inputElement = this._elements[CARD.editor.keyMappings.attribute];
        // delete current options
        while (inputElement.firstChild) {
            inputElement.removeChild(inputElement.firstChild);
        }
        // add option
        this._addChoices(inputElement, CARD.editor.fields.attribute.type, curEntity);
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
        const isHASelect = CARD.editor.fields[type]?.element === CARD.editor.fields.select.element;
        const events = isHASelect ? CARD.interactions.event.HASelect : CARD.interactions.event.other;

        if (isHASelect) {
            this._elements[name].addEventListener(CARD.interactions.event.closed, (event) => {
                event.stopPropagation();
            });
        }

        const handleEvent = (event) => {
            this.configManager._logDebug('EntityProgressCardEditor/handleEvent - new value from GUI: ', event.target.value);
            if (this.rendered && this._checkConfigChangeFromGUI()) {
                const newValue = event.detail?.value || event.target.value;
                if (type === CARD.editor.fields.tap_action.type) {
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
            case CARD.editor.fields.entity.type:
                inputElement = document.createElement(CARD.editor.fields.entity.element);
                inputElement.hass = this.hass;
                this._toggleFieldDisable(CARD.editor.keyMappings.attribute, !(this.config.entity && ATTRIBUTE_MAPPING[this.config.entity.split('.')[0]]));
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
                inputElement = document.createElement(CARD.editor.fields[type].element);
                inputElement.popperOptions = '';
                this._addChoices(inputElement, type);
                if (type === CARD.editor.fields.tap_action.type) {
                    value = this._getTapActionValue();
                    this._toggleFieldDisable(CARD.editor.keyMappings.navigateTo, value !== CARD.editor.keyMappings.navigateTo);
                }
                if (type === CARD.editor.fields.theme.type) {
                    this._toggleFieldDisable(CARD.editor.keyMappings.theme, !!this.config.theme);
                }
                break;
            case CARD.editor.fields.number.type:
                inputElement = document.createElement(CARD.editor.fields.number.element);
                inputElement.type = CARD.editor.fields.number.type;
                break;
            default:
                inputElement = document.createElement(CARD.editor.fields.default.element);
                inputElement.type = CARD.editor.fields.default.type;
                break;
        }

        // store element and manage default display
        this._elements[name] = inputElement;
        inputElement.style.width = '100%';
        inputElement.required = required;
        inputElement.label = label;
        inputElement.value = value;
        this._addEventListener(name, type);

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

    _makeHelpIcon() {
        // Lien cliquable
        const link = document.createElement(CARD.documentation.link.element);
        link.href = CARD.documentation.attributes.documentationUrl;
        link.target = CARD.documentation.attributes.linkTarget;
        link.classList.add(CARD.documentation.link.class);

        const outerDiv = document.createElement(CARD.documentation.outerDiv.element);
        outerDiv.classList.add(CARD.documentation.outerDiv.class);

        const innerDiv = document.createElement(CARD.documentation.innerDiv.element);
        innerDiv.classList.add(CARD.documentation.innerDiv.class);

        const questionMark = document.createElement(CARD.documentation.questionMark.element);
        questionMark.textContent = CARD.documentation.attributes.text;
        questionMark.classList.add(CARD.documentation.questionMark.class);

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
        if (!window.customElements.get(CARD.editor.fields.entity.element)) {
            const ch = await window.loadCardHelpers();
            const c = await ch.createCardElement({ type: 'entities', entities: [] });
            await c.constructor.getConfigElement();
            const haEntityPicker = window.customElements.get(CARD.editor.fields.entity.element);
        }
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
        this._container = document.createElement(CARD.editor.fields.container.element);
        this._container.classList.add(CARD.editor.fields.container.class);

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
customElements.define(CARD.meta.editor, EntityProgressCardEditor);
