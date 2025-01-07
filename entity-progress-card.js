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
 * @version 1.0.13
 */

/** --------------------------------------------------------------------------
 * PARAMETERS
 */

const VERSION='1.0.13';
const CARD_TNAME='entity-progress-card';
const CARD_NAME="Entity progress card";
const CARD_DESCRIPTION="A cool custom card to show current entity status with a progress bar.";
const EDITOR_NAME='entity-progress-card-editor';

const LAYOUT_SIZE = {
    horizontal: { grid_rows: 1, grid_min_rows: 1, grid_columns: 2, grid_min_columns: 2 },
    vertical:   { grid_rows: 2, grid_min_rows: 2, grid_columns: 1, grid_min_columns: 1 }
};

const DEFAULT_COLOR='var(--state-icon-color)';

const CARD_INSTALLED_MESSAGE = `%c✨${CARD_TNAME.toUpperCase()} ${VERSION} IS INSTALLED.`;
const CARD_INSTALLED_MESSAGE_CSS = 'color:orange; background-color:black; font-weight: bold;'
const README_LINK = '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card';

const EDITOR_INPUT_FIELDS = [
    {   name: 'entity',
        label: { en: 'Entity', fr: 'Entité', es: 'Entidad', de: 'Entität', },
        type: 'entity',
        required: true,
        isThemeOverriding: false,
        description: {
            en: 'Select an entity from Home Assistant.',
            fr: 'Sélectionnez une entité de Home Assistant.',
            es: 'Seleccione una entidad de Home Assistant.',
            de: 'Wählen Sie eine Entität aus Home Assistant.',
        }},
    {   name: 'name',
        label: { en: 'Name', fr: 'Nom', es: 'Nombre', de: 'Name', },
        type: 'text',
        required: false,
        isThemeOverriding: false,
        description: {
            en: 'Enter a name for the entity.',
            fr: 'Saisissez un nom pour l\'entité.',
            es: 'Introduzca un nombre para la entidad.',
            de: 'Geben Sie einen Namen für die Entität ein.',
        }},
    {   name: 'layout',
        label: { en: 'Layout', fr: 'Disposition', es: 'Disposición', de: 'Layout', },
        type: 'layout',
        required: false,
        isThemeOverriding: false,
        description: {
            en: 'Select the layout.',
            fr: 'Sélectionnez la disposition.',
            es: 'Seleccione la disposición.',
            de: 'Wählen Sie das Layout.',
        }},
    {   name: 'theme',
        label: { en: 'Theme', fr: 'Thème', es: 'Tema', de: 'Thema', },
        type: 'theme',
        required: false,
        isThemeOverriding: false,
        description: {
            en: 'Select a theme to automatically define the colors and icon.',
            fr: 'Sélectionnez un thème pour définir automatiquement les couleurs et l\'icône.',
            es: 'Seleccione un tema para definir automáticamente los colores y el icono.',
            de: 'Wählen Sie ein Thema, um die Farben und das Symbol automatisch festzulegen.',
        }},
    {   name: 'icon',
        label: { en: 'Icon', fr: 'Icône', es: 'Icono', de: 'Symbol', },
        type: 'icon',
        required: false,
        isThemeOverriding: true,
        description: {
            en: 'Select an icon for the entity.',
            fr: 'Sélectionnez une icône pour l\'entité.',
            es: 'Seleccione un icono para la entidad.',
            de: 'Wählen Sie ein Symbol für die Entität.',
        }},
    {   name: 'color',
        label: { en: 'Primary color', fr: 'Couleur de l\'icône', es: 'Color del icono', de: 'Primärfarbe', },
        type: 'color',
        required: false,
        isThemeOverriding: true,
        description: {
            en: 'Select the primary color for the icon.',
            fr: 'Sélectionnez la couleur principale de l\'icône.',
            es: 'Seleccione el color principal del icono.',
            de: 'Wählen Sie die Primärfarbe für das Symbol.',
        }},
    {   name: 'bar_color',
        label: { en: 'Color for the bar', fr: 'Couleur de la barre', es: 'Color de la barra', de: 'Farbe für die Leiste', },
        type: 'color',
        required: false,
        isThemeOverriding: true,
        description: {
            en: 'Select the primary color for the bar.',
            fr: 'Sélectionnez la couleur principale de la barre.',
            es: 'Seleccione el color principal de la barra.',
            de: 'Wählen Sie die Primärfarbe für die Leiste.',
        }},
];

const COLORS = [
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

const THEMES = [
    { name: '', value: '' },
    { name: 'Battery', value: 'battery' },
    { name: 'Light', value: 'light' }
];

const LAYOUT = [
    { name: 'Horizontal (default)', value: 'horizontal' },
    { name: 'Vertical', value: 'vertical' }
];

// Constants for DOM element selectors
const SELECTORS = {
    CONTAINER: 'container',
    RIGHT: 'right',
    ICON: 'icon',
    SHAPE: 'shape',
    NAME: 'name',
    PERCENTAGE: 'percentage',
    SECONDARY_INFO: 'secondary_info',
    PROGRESS_BAR: 'progress-bar-inner',
    ALERT: 'ha-alert'
};

const CARD_HTML = `
    <!-- Main container -->
    <div class="${SELECTORS.CONTAINER}">
        <!-- Section gauche avec l'icône -->
        <div class="left">
            <div class="${SELECTORS.SHAPE}"></div>
            <ha-icon class="${SELECTORS.ICON}"></ha-icon>
        </div>

        <!-- Section droite avec le texte -->
        <div class="${SELECTORS.RIGHT}">
            <div class="${SELECTORS.NAME}"></div>
            <div class="secondary_info">
                <div class="${SELECTORS.PERCENTAGE}"></div>
                <div class="progress-bar">
                    <div class="${SELECTORS.PROGRESS_BAR}"></div>
                </div>         
            </div>   
        </div>
    </div>
    <!-- HA Alert -->
    <ha-alert style="display:none;" type="error"></ha-alert>
`;

const CARD_CSS=`
    ha-card {
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start; /* Aligner tous les éléments à gauche */
        padding: 0;
        box-sizing: border-box;
        border-radius: 8px;
        max-width: 600px;
        margin: 0 auto;
    }

    /* main container */
    .container {
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
    .left {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
    }

    .shape {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: var(--state-icon-color);
        opacity: 0.2;
    }

    .icon {
        position: relative;
        z-index: 1;
        width: 24px;
        height: 24px;
    }

    /* .right: name & percentage */
    .right {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
        overflow: hidden;
        width:100%;
    }

    .name {
        font-size: 1em;
        font-weight: bold;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }

    .secondary_info {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
    }

    .percentage {
        font-size: 0.9em;
        color: var(--primary-text-color);
        min-width: 40px;
        text-align: left;
    }

    /* Progress bar */
    .progress-bar {
        flex-grow: 1;
        height: 8px;
        max-height: 8px;
        background-color: var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .progress-bar-inner {
        height: 100%;
        width: 75%;
        background-color: var(--primary-color);
        transition: width 0.3s ease;
    }

    ha-alert {
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

const SHOW_DIV='block';
const SHOW_DIVF='flex';
const HIDE_DIV='none';

const BATTERY_THEME_COLORS = [
    { color: 'var(--red-color)',    label: 'critical' },   // Pourcentage < 25
    { color: 'var(--orange-color)', label: 'low'      },   // Pourcentage >= 25
    { color: 'var(--yellow-color)', label: 'medium'   },   // Pourcentage >= 50
    { color: 'var(--green-color)',  label: 'high'     }    // Pourcentage >= 75
];

const BATTERY_THEME_ICON = 'mdi:battery';

const LIGHT_THEME_COLORS = [
    { color: '#4B4B4B', label: 'dim'        },   // Pourcentage < 25
    { color: '#877F67', label: 'dim-brigh'  },   // Pourcentage >= 25
    { color: '#C3B382', label: 'bright-dim' },   // Pourcentage >= 50
    { color: '#FFE79E', label: 'bright'     }    // Pourcentage >= 75
]
const LIGHT_THEME_ICON = 'mdi:lightbulb';
const LIGHT_THEME_ICON_DIM = 'mdi:lightbulb-outline';

const THEME_KEY = "theme"

const MSG = {
    en: {
        ENTITY_ERROR: "The 'entity' parameter is required!",
        ENTITY_NOTFOUND: "Entity not found in Home Assistant.",
    },
    fr: {
        ENTITY_ERROR: "Le paramètre 'entity' est requis !",
        ENTITY_NOTFOUND: "Entité introuvable dans Home Assistant.",
    },
    es: {
        ENTITY_ERROR: "¡El parámetro 'entity' es obligatorio!",
        ENTITY_NOTFOUND: "Entidad no encontrada en Home Assistant.",
    },
    de: {
        ENTITY_ERROR: "Der Parameter 'entity' ist erforderlich!",
        ENTITY_NOTFOUND: "Entität in Home Assistant nicht gefunden.",
    },
};

const DEF_LANG = "en";

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
                CARD_INSTALLED_MESSAGE,
                CARD_INSTALLED_MESSAGE_CSS
            );
            console.log(README_LINK);
            console.groupEnd();
            EntityProgressCard._moduleLoaded = true;
        }
        this._currentLanguage = DEF_LANG;
        this._max_value = null; // 100%
        this._unit = "%";
        // to store DOM ref.
        this._elements = {};
        this._isBuilt = false;
    }

    /**
     * Creates and returns a new configuration element for the component.
     * 
     * This static method is used to dynamically generate an instance of the 
     * editor element, identified by the constant `EDITOR_NAME`. The returned 
     * element can be used for configuring the component's behavior or settings.
     * 
     * @returns {HTMLElement} A newly created configuration element.
     */
    static getConfigElement() {
        return document.createElement(EDITOR_NAME);
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
        const layoutChanged = this.config?.layout !== config.layout;
        this.config = config;
        this._max_value = this.config.max_value;
        if (this.config.unit) {
            this._unit = this.config.unit;
        }

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
        this._hass = hass;
        this._currentLanguage = MSG[hass.config.language] ? hass.config.language : DEF_LANG;
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
        wrapper.classList.add(CARD_TNAME);
        wrapper.innerHTML = CARD_HTML;
        const style = document.createElement('style');
        style.textContent = CARD_CSS;

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
        // store DOM ref to update
        this._elements = {
            [SELECTORS.CONTAINER]: this.shadowRoot.querySelector(`.${SELECTORS.CONTAINER}`),
            [SELECTORS.RIGHT]: this.shadowRoot.querySelector(`.${SELECTORS.RIGHT}`),
            [SELECTORS.ICON]: this.shadowRoot.querySelector(`.${SELECTORS.ICON}`),
            [SELECTORS.SHAPE]: this.shadowRoot.querySelector(`.${SELECTORS.SHAPE}`),
            [SELECTORS.NAME]: this.shadowRoot.querySelector(`.${SELECTORS.NAME}`),
            [SELECTORS.PERCENTAGE]: this.shadowRoot.querySelector(`.${SELECTORS.PERCENTAGE}`),
            [SELECTORS.SECONDARY_INFO]: this.shadowRoot.querySelector(`.${SELECTORS.SECONDARY_INFO}`),
            [SELECTORS.PROGRESS_BAR]: this.shadowRoot.querySelector(`.${SELECTORS.PROGRESS_BAR}`),
            [SELECTORS.ALERT]: this.shadowRoot.querySelector(`${SELECTORS.ALERT}`),
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
        if (this.config.layout === LAYOUT[1].value) {
            this._elements[SELECTORS.CONTAINER].style.flexDirection = 'column';
            this._elements[SELECTORS.NAME].style.textAlign = 'center';
            this._elements[SELECTORS.RIGHT].style.width = '90%';
            this._elements[SELECTORS.RIGHT].style.flexGrow = '0';
            this._elements[SELECTORS.SECONDARY_INFO].style.display = 'block';
            this._elements[SELECTORS.PERCENTAGE].style.textAlign = 'center';
        } else {
            this._elements[SELECTORS.CONTAINER].style.flexDirection = 'row';
            this._elements[SELECTORS.NAME].style.textAlign = 'left';
            this._elements[SELECTORS.RIGHT].style.width = '100%';
            this._elements[SELECTORS.RIGHT].style.flexGrow = '1';
            this._elements[SELECTORS.SECONDARY_INFO].style.display = 'flex';
            this._elements[SELECTORS.PERCENTAGE].style.textAlign = 'left';
        }
    }

    /**
     * Returns the appropriate battery theme icon based on the battery percentage.
     * 
     * This method calculates the battery level in steps of 10% and returns the
     * corresponding icon. If the battery is fully charged (100%), it returns the
     * default `BATTERY_THEME_ICON`. For other percentages, it returns the icon 
     * corresponding to the closest 10% step (e.g., 90%, 80%, etc.). If the battery 
     * level is 0%, it returns an "alert" icon.
     * 
     * The returned icon is in the format of `BATTERY_THEME_ICON-[level]`, where 
     * `[level]` is one of the predefined steps (e.g., `BATTERY_THEME_ICON-90`).
     * 
     * @param {number} percentage - The current battery percentage (from 0 to 100).
     * @returns {string} The corresponding battery theme icon.
     */
    _getBatteryThemeIcon(percentage) {
        if (percentage === 100) return BATTERY_THEME_ICON; // 100%
    
        const step = 10;
        const level = Math.floor(percentage / step) * step;
        if (level > 0) {
            return `${BATTERY_THEME_ICON}-${level}`;
        }
    
        return `${BATTERY_THEME_ICON}-alert`; // 0%
    }

    /**
     * Returns the appropriate light theme icon based on the light brightness.
     * 
     * more than or equal tp 50% light is "bright" less than is off.
     * 
     * @param {number} percentage - The current light brightness (from 0 to 100).
     * @returns {string} The corresponding light theme icon.
     */
    _getLightThemeIcon(percentage) {
        if (percentage >= 50) return LIGHT_THEME_ICON; // Light Bright
        return `${LIGHT_THEME_ICON_DIM}`; // Light Dim
    }

    /**
     * Returns the appropriate battery theme color based on the battery percentage.
     * 
     * This method calculates the battery color by determining which threshold 
     * the current percentage falls into. The thresholds are defined in the 
     * `BATTERY_THEME_COLORS` array, where each entry corresponds to a specific 
     * battery level range and its associated color.
     * 
     * If the battery is fully charged (100%), it returns the color of the last 
     * threshold in the array. For other percentages, it determines the closest 
     * threshold based on the battery percentage and returns the corresponding color.
     * 
     * The thresholds are evenly distributed, so each color represents a range 
     * of battery levels (e.g., 0-10%, 10-20%, etc.).
     * 
     * @param {number} percentage - The current battery percentage (from 0 to 100).
     * @returns {string} The corresponding color for the battery theme.
     */
    _getBatteryThemeColor(percentage) {
        const numberOfThresholds = BATTERY_THEME_COLORS.length;
        const thresholdSize = 100 / numberOfThresholds;
    
        if (percentage === 100) {
            return BATTERY_THEME_COLORS[numberOfThresholds - 1].color;
        }
        return BATTERY_THEME_COLORS[Math.floor(percentage / thresholdSize)].color;
    }

    /**
     * Returns the appropriate light theme color based on the light brightness.
     * 
     * This method calculates the light color by determining which threshold 
     * the current percentage falls into. The thresholds are defined in the 
     * `LIGHT_THEME_COLORS` array, where each entry corresponds to a specific 
     * brightness level range and its associated color.
     * 
     * If the light is bright (100%), it returns the color of the last 
     * threshold in the array. For other percentages, it determines the closest 
     * threshold based on the brightness level and returns the corresponding color.
     * 
     * @param {number} percentage - The current battery percentage (from 0 to 100).
     * @returns {string} The corresponding color for the battery theme.
     */
    _getLightThemeColor(percentage) {
        const numberOfThresholds = LIGHT_THEME_COLORS.length;
        const thresholdSize = 100 / numberOfThresholds;
    
        if (percentage === 100) {
            return LIGHT_THEME_COLORS[numberOfThresholds - 1].color;
        }
        return LIGHT_THEME_COLORS[Math.floor(percentage / thresholdSize)].color;
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
     * Parse max_value and return a numeric value and its validity.
     * @param {string|number} maxValue - The max_value to parse (could be a number or an entity ID).
     * @returns {{value: number, valid: boolean}} - Parsed value and its validity.
     */
    _parseMaxValue(maxValue) {
        if (typeof maxValue === "number") {
            // maxValue is numeric
            if (!isNaN(maxValue) && maxValue > 0) {
                return { value: maxValue, valid: true };
            }
            return { value: 0, valid: false };
        }

        if (typeof maxValue === "string" && this._hass && this._hass.states[maxValue]) {
            // maxValue is an entity
            const entityState = this._hass.states[maxValue].state;
            const parsedValue = parseFloat(entityState);

            if (!isNaN(parsedValue) && parsedValue > 0) {
                return { value: parsedValue, valid: true };
            }
            return { value: 0, valid: false };
        }

        // maxValue is not supported
        return { value: 0, valid: false };
    }

    /**
     * Updates the dynamic elements of the card based on the state of a specified entity.
     * 
     * This method fetches the state of the entity defined in the configuration and
     * updates various dynamic elements of the card (e.g., progress bar, icon, shape, 
     * name, and percentage) accordingly.
     * 
     * - If the entity state cannot be found, an error message is displayed.
     * - If the entity state is valid, the error message is hidden and the elements are updated.
     * - The percentage value from the entity state is clamped between 0 and 100.
     * - If a specific theme is selected, the battery icon and color are updated based on the percentage.
     * 
     * The elements are updated using the `_updateElement` method, which ensures the DOM
     * is only updated when the values change.
     * 
     * @returns {void}
     */
    _updateDynamicElements() {
        /**
         * Manage here config error
         */

        if (!this.config.entity) {
            // show error message
            this._showError(MSG[this._currentLanguage].ENTITY_ERROR);
            return;
        }

        // get entity state
        const entity = this._hass?.states[this.config.entity];

        if (!entity) {
            // show error message
            this._showError(MSG[this._currentLanguage].ENTITY_NOTFOUND);
            return;
        }
        // Hide error message if entity is found
        this._hideError();

        /**
         * Manage the percentage part
         */
        const value = parseFloat(entity.state);
        const maxValueResult = this._parseMaxValue(this._max_value)
        let percentage = 0;
        if (!maxValueResult.valid) {
            percentage = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
        } else {
            percentage = isNaN(value) ? 0 : (value / maxValueResult.value) * 100;
        }

        /**
         * Manage theme
         */
        let iconTheme = null;
        let colorTheme = null;

        if (this.config.theme === THEMES[1].value) {
            iconTheme = this._getBatteryThemeIcon(percentage)
            colorTheme = this._getBatteryThemeColor(percentage)
        } else if (this.config.theme === THEMES[2].value) {
            iconTheme = this._getLightThemeIcon(percentage)
            colorTheme = this._getLightThemeColor(percentage)
        }

        /**
         * Update dyn element
         */
        this._updateElement(SELECTORS.PROGRESS_BAR, (el) => {
            el.style.width = `${percentage}%`;
            el.style.backgroundColor = colorTheme || this.config.bar_color || DEFAULT_COLOR;
        });

        this._updateElement(SELECTORS.ICON, (el) => {
            el.setAttribute(SELECTORS.ICON, iconTheme || this.config.icon || entity.attributes.icon || 'mdi:alert');
            el.style.color = colorTheme|| this.config.color || DEFAULT_COLOR;
        });

        this._updateElement(SELECTORS.SHAPE, (el) => {
            el.style.backgroundColor = colorTheme || this.config.color || DEFAULT_COLOR;
        });

        this._updateElement(SELECTORS.NAME, (el) => {
            el.textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
        });

        this._updateElement(SELECTORS.PERCENTAGE, (el) => {
            const formattedPercentage = Number.isInteger(percentage)
                ? percentage
                : percentage.toFixed(2); // Limit the number of digit (@Hypfer suggestion)
            el.textContent = `${formattedPercentage}${this._unit}`;
        });
    }
  
    /**
     * Displays an error alert with the provided message.
     * 
     * This method shows an error alert on the card by updating the corresponding
     * DOM element (identified by `SELECTORS.ALERT`). The element is made visible 
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
        const alertElement = this._elements[SELECTORS.ALERT];
        if (alertElement) {
            alertElement.style.display = SHOW_DIVF;
            alertElement.textContent = message;  // Set the error message in the alert
        }
    }

    /**
     * Hides the error alert by setting its display style to hide.
     * 
     * This method hides the error alert on the card by changing the `display` 
     * style of the corresponding DOM element (identified by `SELECTORS.ALERT`) 
     * to the value of `HIDE_DIV`. This is typically used to remove the error 
     * message once the issue (such as the entity being found) has been resolved.
     * 
     * @returns {void}
     */
    _hideError() {
        const alertElement = this._elements[SELECTORS.ALERT];
        if (alertElement) {
            alertElement.style.display = HIDE_DIV;
        }
    }

    /**
     * Returns the number of grid rows for the card size based on the current layout.
     * 
     * This method determines the size of the card (specifically the number of grid rows) 
     * depending on whether the layout configuration is vertical or horizontal. 
     * The layout configuration is checked against `LAYOUT[1].value`, and based on this, 
     * it returns the appropriate number of rows for the card's grid.
     * 
     * @returns {number} - The number of grid rows for the current card layout.
     */
    getCardSize() {
        if (this.config.layout === LAYOUT[1].value) {
            return LAYOUT_SIZE.vertical.grid_rows;
        }
        return LAYOUT_SIZE.horizontal.grid_rows;
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
        if (this.config.layout === LAYOUT[1].value) {
            return LAYOUT_SIZE.vertical;
        }
        return LAYOUT_SIZE.horizontal;
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
customElements.define(CARD_TNAME, EntityProgressCard);

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
    type: CARD_TNAME,
    name: CARD_NAME,
    description: CARD_DESCRIPTION,    
});

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
     * Initializes an instance of the `EntityProgressCardEditor` component.
     * 
     * The constructor initializes the editor component by setting up initial values for key properties. 
     * These properties will be used throughout the lifecycle of the editor to store the configuration, 
     * manage the Home Assistant instance, track overridable elements, and handle rendering.
     * 
     * - `this.config`: This object holds the configuration for the card, such as layout, entity, theme, etc. 
     *   It starts as an empty object and will be populated as the user interacts with the editor.
     * 
     * - `this._hass`: This property will store the Home Assistant instance, which provides access to 
     *   entity states and other data relevant to the card. Initially set to `null`.
     * 
     * - `this._overridableElements`: This object will hold references to elements that can be overridden 
     *   in the card configuration. It is initialized as an empty object.
     * 
     * - `this.rendered`: A flag to track whether the editor has been rendered. Initially set to `false`.
     * 
     * - `this._currentLanguage`: Stores the current default language.
     */
    constructor() {
        super();
        this.config = {};
        this._hass = null;
        this._overridableElements = {};
        this.rendered = false;
        this._currentLanguage = DEF_LANG;
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
        this._currentLanguage = MSG[hass.config.language] ? hass.config.language : DEF_LANG;
        if (!this._hass || this._hass.entities !== hass.entities) {
            this._hass = hass;
            if (this.rendered) {
                this.render();
            }
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
        this.config = config;
        this.loadEntityPicker();
        if (!this.rendered) {
            this.rendered = true;
            this.render();
        }
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
    _toggleFieldDisable(disable) {
        const fields = Object.keys(this._overridableElements);
        fields.forEach(fieldName => {
            this._overridableElements[fieldName].style.display = disable ? HIDE_DIV : SHOW_DIV;
        });
    }

    /**
     * Reorders the configuration object by extracting `grid_options` and placing it at the end.
     * 
     * This method processes the provided configuration object, extracts the `grid_options` property 
     * (if present), and then returns a new object with `grid_options` placed at the end. All other 
     * properties of the configuration are kept intact and remain in their original order. 
     * 
     * If the `grid_options` property is not present, the method simply returns the configuration object 
     * without any changes.
     * 
     * - If `grid_options` exists, the method places it at the end of the returned object.
     * - If `grid_options` does not exist, the method returns the object without modification.
     * 
     * This method helps to ensure that `grid_options` is handled consistently when used elsewhere, 
     * possibly for further processing or rendering.
     * 
     * @param {object} config - The configuration object to be reordered.
     * @returns {object} The reordered configuration object with `grid_options` at the end.
     */
    _reorderConfig(config) {
        const { grid_options, ...rest } = config;
        return grid_options ? { ...rest, grid_options } : { ...rest };
    }

    /**
     * Updates a specific property in the configuration object, and handles additional logic 
     * related to `theme` and field visibility.
     * 
     * This method updates the configuration object based on the provided `key` and `value`. It checks
     * if the `value` is an empty string, and if so, it removes the property from the configuration. If 
     * the `value` is not an empty string, it updates the property with the new `value`.
     * 
     * If the updated property is related to the theme (identified by `THEME_KEY`), it triggers an 
     * additional action to toggle the visibility of certain fields based on the presence of the theme 
     * property in the configuration.
     * 
     * After the update, the method ensures the configuration is reordered with the `grid_options` at 
     * the end by calling `_reorderConfig`. Finally, it dispatches a custom event (`'config-changed'`) 
     * to notify other components about the configuration change.
     * 
     * - If the `value` is an empty string, the corresponding property is deleted from the configuration.
     * - If the `key` corresponds to the theme, it toggles the visibility of fields related to the theme.
     * - The configuration is reordered after every update to ensure `grid_options` is placed at the end.
     * 
     * @param {string} key - The key of the configuration property to update.
     * @param {string} value - The new value to assign to the configuration property.
     */
    _updateConfigProperty(key, value) {
        if (value === '') {
            if (key in this.config) {
                delete this.config[key];
            }
        } else {
            this.config[key] = value;
        }
        if (key === THEME_KEY) {
            const disableFields = THEME_KEY in this.config;
            this._toggleFieldDisable(disableFields);
        }
        this.config = this._reorderConfig(this.config);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
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
            const option = document.createElement('mwc-list-item');
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
     * `COLORS` array. Each color option is displayed with a circular colored icon (styled using 
     * the `value` of the color) and its respective `name`. 
     * 
     * For each color in the `COLORS` array, a new `<mwc-list-item>` is created with the color 
     * as the background of a circular `span` and the color name displayed beside it.
     * 
     * @param {HTMLElement} colorSelect - The `<select>` element to which the color options will be added.
     */
    _addColor(colorSelect) {
        const noColorOption = document.createElement('mwc-list-item');
        noColorOption.value = '';
        noColorOption.innerHTML = `
            <span style="display: inline-block; width: 16px; height: 16px; background-color: transparent; border-radius: 50%; margin-right: 8px;"></span>
        `;
        colorSelect.appendChild(noColorOption);

        COLORS.forEach(color => {
            const option = document.createElement('mwc-list-item');
            option.value = color.value;
            option.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; background-color: ${color.value}; border-radius: 50%; margin-right: 8px;"></span>
                ${color.name}
            `;
            
            colorSelect.appendChild(option);
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
     * @param {Object} config - The configuration object for the field.
     * @param {string} config.name - The name of the field (used to store the field's value in `this.config`).
     * @param {string} config.label - The label for the field, displayed next to the input element.
     * @param {string} config.type - The type of field to create ('entity', 'icon', 'layout', 'theme', 'color', or 'text').
     * @param {boolean} [config.required=false] - A flag indicating whether the field is required.
     * @param {boolean} [config.isThemeOverriding=false] - A flag indicating if the field should be theme-overridable.
     * @param {string} config.description - The description of the field, typically displayed below the input.
     * 
     * @returns {HTMLElement} The container element (`<div>`) containing the input field and its description.
     */
    _createField({ name, label, type, required = false, isThemeOverriding, description }) {
        let inputElement;
        const value = this.config[name] || '';

        switch (type) {
            case 'entity':
                inputElement = document.createElement('ha-entity-picker');
                inputElement.hass = this.hass;
                break;
            case 'icon':
                inputElement = document.createElement('ha-icon-picker');
                break;
            case 'layout':
                inputElement = document.createElement('ha-select');
                inputElement.popperOptions = ""
                this._addChoice(inputElement, LAYOUT);
                inputElement.addEventListener('closed', (event) => {
                    event.stopPropagation();
                });
                break;
            case 'theme':
                inputElement = document.createElement('ha-select');
                inputElement.popperOptions = ""
                this._addChoice(inputElement, THEMES);
                inputElement.addEventListener('closed', (event) => {
                    event.stopPropagation();
                });
                break;
            case 'color':
                inputElement = document.createElement('ha-select');
                inputElement.popperOptions = ""
                this._addColor(inputElement);
                inputElement.addEventListener('closed', (event) => {
                    event.stopPropagation();
                });
                break;
            default:
                inputElement = document.createElement('ha-textfield');
                inputElement.type = 'text';
        }

        if (isThemeOverriding) {
            this._overridableElements[name]=inputElement;
        }

        inputElement.style.display = SHOW_DIVF;
        inputElement.required = required;
        inputElement.label = label;
        inputElement.value = value;

        inputElement.addEventListener(
            (type === 'color' || type === 'theme' || type === 'layout') ? 'selected' : (type === 'entity' || type === 'icon' ? 'value-changed' : 'input'),
            (event) => {
                const newValue = event.detail?.value || event.target.value;
                this._updateConfigProperty(name, newValue);
             }
        );

        const fieldContainer = document.createElement('div');
        if (isThemeOverriding) {
            this._overridableElements[`${name}_description`] = fieldContainer;
        }
        fieldContainer.style.marginBottom = '12px';
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
        if (!window.customElements.get("ha-entity-picker")) {
            const ch = await window.loadCardHelpers();
            const c = await ch.createCardElement({ type: "entities", entities: [] });
            await c.constructor.getConfigElement();
            const haEntityPicker = window.customElements.get("ha-entity-picker");
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
        container.style.flexDirection = 'column';
        container.style.flexWrap = 'wrap';        // Allows wrapping
        container.style.overflow = 'auto';
        container.style.overflowX = 'hidden';
        container.style.maxHeight = '100vh';     // Limit height to the viewport

        EDITOR_INPUT_FIELDS.forEach((field) => {
            container.appendChild(this._createField({
                name:field.name,
                label:field.label[this._currentLanguage],
                type:field.type,
                required:field.required,
                isThemeOverriding: field.isThemeOverriding,
                description: field.description[this._currentLanguage] }));
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
customElements.define(EDITOR_NAME, EntityProgressCardEditor);
