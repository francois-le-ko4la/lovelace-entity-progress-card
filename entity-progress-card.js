/** --------------------------------------------------------------------------
 * CARD
 */

const VERSION='1.0.7';
const CARD_TNAME='entity-progress-card';
const CARD_NAME="Entity progress card";
const CARD_DESCRIPTION="A cool custom card to show current entity status with a progress bar.";
const EDITOR_NAME='entity-progress-card-editor';
const GRID_ROWS=1;
const GRID_COLUMNS=2;
const DEFAULT_COLOR='var(--state-icon-color)';

const CARD_INSTALLED_MESSAGE = `%c✨${CARD_TNAME.toUpperCase()} ${VERSION} IS INSTALLED.`;
const CARD_INSTALLED_MESSAGE_CSS = 'color:orange; background-color:black; font-weight: bold;'
const README_LINK = '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card';

const EDITOR_INPUT_FIELDS = [
    { name: 'entity', label: 'Entity', type: 'entity', required: true, isThemeOverriding: false, description: 'Enter an entity from Home Assistant.' },
    { name: 'name', label: 'Name', type: 'text', required: false, isThemeOverriding: false, description: 'Enter a name for the entity.' },
    { name: 'layout', label: 'Layout', type: 'layout', required: false, isThemeOverriding: false, description: 'Select the layout.' },
    { name: 'theme', label: 'Theme', type: 'theme', required: false, isThemeOverriding: false, description: 'Select a theme to automatically define the colors and icon.' },
    { name: 'icon', label: 'Icon', type: 'icon', required: false, isThemeOverriding: true, description: 'Choose an icon for the entity.' },
    { name: 'color', label: 'Color', type: 'color', required: false, isThemeOverriding: true, description: 'Choose the primary color for the icon.' },
    { name: 'bar_color', label: 'Bar Color', type: 'color', required: false, isThemeOverriding: true, description: 'Choose the primary color for the bar.' },
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
    { name: 'Battery', value: 'battery' }
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
        display: flex;
        position: absolute;
        margin: 0;
        padding: 0px;
        display: flex;
        top: -1px;
        left: -2px;
        width: 102%;
        height: 105%;
        z-index: 10;
        align-items: center;
        justify-content: center;
        background-color: black;
    }
    `;

const SHOW_DIV='block';
const HIDE_DIV='none';

const BATTERY_THEME_COLORS = [
    { color: 'var(--red-color)',    label: 'critical' },   // Pourcentage < 25
    { color: 'var(--orange-color)', label: 'low'      },   // Pourcentage >= 25
    { color: 'var(--yellow-color)', label: 'medium'   },   // Pourcentage >= 50
    { color: 'var(--green-color)',  label: 'high'     }    // Pourcentage >= 75
];

const BATTERY_THEME_ICON = 'mdi:battery';
const ENTITY_ERROR_MSG = "The 'entity' parameter is required!";
const ENTITY_NOTFOUND_MSG = "Entity not found in Home Assistant states.";
const THEME_KEY = "theme"


/** --------------------------------------------------------------------------
 * CARD
 */

class EntityProgressCard extends HTMLElement {
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
        // to store DOM ref.
        this._elements = {};
        this._isBuilt = false;
    }

    static getConfigElement() {
        return document.createElement(EDITOR_NAME);
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error(ENTITY_ERROR_MSG);
        }
    
        const entityChanged = this.config?.entity !== config.entity;
        const layoutChanged = this.config?.layout !== config.layout;
        this.config = config;

        if (!this._isBuilt) {
            this._buildCard();
            this._isBuilt = true;
        }

        if (layoutChanged) {
            this._changeLayout();
        }

        if (entityChanged) {
            this._updateDynamicElements();
        }
    }
    
    set hass(hass) {
        this._hass = hass;
        this._updateDynamicElements();
    }

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
            [SELECTORS.PROGRESS_BAR]: this.shadowRoot.querySelector(`.${SELECTORS.PROGRESS_BAR}`),
            [SELECTORS.ALERT]: this.shadowRoot.querySelector(`${SELECTORS.ALERT}`),
        };
    }

    _changeLayout() {
        /**
         *  .container
         *      flex-direction: row; -> column
         *  .name
         *      text-align: left; -> center
         *  .right
         *      width: 100% -> 80%;
         *      flex-grow: 1; -> 0
         */
        if (this.config.layout === LAYOUT[1].value) {
            this._elements[SELECTORS.CONTAINER].style.flexDirection = 'column';
            this._elements[SELECTORS.NAME].style.textAlign = 'center';
            this._elements[SELECTORS.RIGHT].style.width = '90%';
            this._elements[SELECTORS.RIGHT].style.flexGrow = '0';
        } else {
            this._elements[SELECTORS.CONTAINER].style.flexDirection = 'row';
            this._elements[SELECTORS.NAME].style.textAlign = 'left';
            this._elements[SELECTORS.RIGHT].style.width = '100%';
            this._elements[SELECTORS.RIGHT].style.flexGrow = '1';
        }
    }

    _getBatteryThemeIcon(percentage) {
        if (percentage === 100) return BATTERY_THEME_ICON; // 100%
    
        const step = 10;
        const level = Math.floor(percentage / step) * step;
        if (level > 0) {
            return `${BATTERY_THEME_ICON}-${level}`;
        }
    
        return `${BATTERY_THEME_ICON}-alert`; // 0%
    }
    
    _getBatteryThemeColor(percentage) {
        const numberOfThresholds = BATTERY_THEME_COLORS.length;
        const thresholdSize = 100 / numberOfThresholds;
    
        if (percentage === 100) {
            return BATTERY_THEME_COLORS[numberOfThresholds - 1].color;
        }
        return BATTERY_THEME_COLORS[Math.floor(percentage / thresholdSize)].color;
    }

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

    _updateDynamicElements() {
        // get entity state
        const entity = this._hass?.states[this.config.entity];

        if (!entity) {
            // show error message
            this._showError(ENTITY_NOTFOUND_MSG);
            return;
        }
        // Hide error message if entity is found
        this._hideError();

        const value = parseFloat(entity.state);
        const percentage = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);

        let iconTheme = null;
        let colorTheme = null;

        if (this.config.theme === THEMES[1].value) {
            iconTheme = this._getBatteryThemeIcon(percentage)
            colorTheme = this._getBatteryThemeColor(percentage)
        }

        // update dyn element
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
            el.textContent = `${percentage}%`;
        });     
    }
  
    // Show error alert
    _showError(message) {
        const alertElement = this._elements[SELECTORS.ALERT];
        if (alertElement) {
            alertElement.style.display = SHOW_DIV;
            alertElement.textContent = message;  // Set the error message in the alert
        }
    }

    // Hide the alert when the entity is found
    _hideError() {
        const alertElement = this._elements[SELECTORS.ALERT];
        if (alertElement) {
            alertElement.style.display = HIDE_DIV;
        }
    }

    getCardSize() {
        return GRID_ROWS; // card size
    }

    getLayoutOptions() {
        return {
          grid_rows: GRID_ROWS,
          grid_columns: GRID_COLUMNS,
        };
      }
}

EntityProgressCard.version = VERSION;
EntityProgressCard._moduleLoaded = false;
customElements.define(CARD_TNAME, EntityProgressCard);

/** --------------------------------------------------------------------------
 * Add this card to the list of custom cards for the card picker
 */

window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
    type: CARD_TNAME,
    name: CARD_NAME,
    description: CARD_DESCRIPTION,    
});

/** --------------------------------------------------------------------------
 * EDITOR
 */

class EntityProgressCardEditor extends HTMLElement {
    constructor() {
        super();
        this.config = {};
        this._hass = null;
        this._overridableElements = {};
        this.rendered = false;
    }

    set hass(value) {
        if (!value) {
            return;
        }
        if (!this._hass || this._hass.entities !== value.entities) {
            this._hass = value;
            if (this.rendered) {
                this.render();
            }
        }
    }

    get hass() {
        return this._hass;
    }

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

    _toggleFieldDisable(disable) {
        const fields = Object.keys(this._overridableElements);
        fields.forEach(fieldName => {
            this._overridableElements[fieldName].style.display = disable ? HIDE_DIV : SHOW_DIV;
        });
    }

    _reorderConfig(config) {
        const { grid_options, ...rest } = config;
        return grid_options ? { ...rest, grid_options } : { ...rest };
    }

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

    _addLayout(layoutSelect) {
        LAYOUT.forEach(cur_layout => {
            const option = document.createElement('mwc-list-item');
            option.value = cur_layout.value;
            option.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; background-color: ${cur_layout.value}; border-radius: 50%; margin-right: 8px;"></span>
                ${cur_layout.name}
            `;
            layoutSelect.appendChild(option);
        });
    }

    _addTheme(themeSelect) {
        THEMES.forEach(cur_theme => {
            const option = document.createElement('mwc-list-item');
            option.value = cur_theme.value;
            option.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; background-color: ${cur_theme.value}; border-radius: 50%; margin-right: 8px;"></span>
                ${cur_theme.name}
            `;
            themeSelect.appendChild(option);
        });
    }

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
                this._addLayout(inputElement);
                inputElement.addEventListener('closed', (event) => {
                    event.stopPropagation();
                });
                break;
            case 'theme':
                inputElement = document.createElement('ha-select');
                inputElement.popperOptions = ""
                this._addTheme(inputElement);
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

        inputElement.style.display = SHOW_DIV;
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
        fieldDescription.innerText = description;
        fieldDescription.style.fontSize = '12px';
        fieldDescription.style.color = '#888';

        fieldContainer.appendChild(inputElement);
        fieldContainer.appendChild(fieldDescription);

        return fieldContainer;
    }

    /**
     * loadEntityPicker
     * Author: Thomas Loven
     * Need this to load the HA elements we want to re-use
     * see: 
     *  - https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
     *  - https://gist.github.com/thomasloven/5f965bd26e5f69876890886c09dd9ba8
     * */

    async loadEntityPicker() {
        if (!window.customElements.get("ha-entity-picker")) {
            const ch = await window.loadCardHelpers();
            const c = await ch.createCardElement({ type: "entities", entities: [] });
            await c.constructor.getConfigElement();
            const haEntityPicker = window.customElements.get("ha-entity-picker");
        }
    }

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
            container.appendChild(this._createField(field));
        });

        fragment.appendChild(container);
        this.appendChild(fragment);
    }
}

customElements.define(EDITOR_NAME, EntityProgressCardEditor);
