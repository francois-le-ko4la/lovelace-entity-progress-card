class EntityProgressCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        if (!EntityProgressCard._moduleLoaded) {
            console.groupCollapsed(
                `%c✨ ENTITY-PROGRESS-CARD ${EntityProgressCard.version} IS INSTALLED.`,
                'color:orange; background-color:black; font-weight: bold;'
            );
            console.log(
                '      For more details, check the README: https://github.com/francois-le-ko4la/lovelace-entity-progress-card'
            );
            console.groupEnd();
            EntityProgressCard._moduleLoaded = true;
        }
        // to store DOM ref.
        this._elements = {};
        this._isBuilt = false;
    }

    static getConfigElement() {
        return document.createElement('entity-progress-card-editor');
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("The 'entity' parameter is required!");
        }
    
        const entityChanged = this.config?.entity !== config.entity;
        this.config = config;
    
        // Ne reconstruire la carte que si elle n'est pas encore construite
        if (!this._isBuilt) {
            this._buildCard();
            this._isBuilt = true; // Marquer comme construite
        }
    
        // Si l'entité ou la config a changé, mettre à jour les éléments
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
        wrapper.classList.add('custom-progress-card');
        wrapper.innerHTML = `
        <!-- Main container -->
        <div class="container">
            <!-- Section gauche avec l'icône -->
            <div class="left">
                <div class="shape"></div>
                <ha-icon class="icon"></ha-icon>
            </div>

            <!-- Section droite avec le texte -->
            <div class="right">
                <div class="name"></div>
                <div class="secondary_info">
                    <div class="percentage"></div>
                    <div class="progress-bar">
                        <div class="progress-bar-inner"></div>
                    </div>         
                </div>   
            </div>
        </div>
        <!-- HA Alert -->
        <ha-alert style="display:none;" type="error"></ha-alert>
        `;

        const style = document.createElement('style');
        style.textContent = `
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

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
        // store DOM ref to update
        this._elements = {
            icon: this.shadowRoot.querySelector('.icon'),
            shape: this.shadowRoot.querySelector('.shape'),
            name: this.shadowRoot.querySelector('.name'),
            percentage: this.shadowRoot.querySelector('.percentage'),
            progressBar: this.shadowRoot.querySelector('.progress-bar-inner'),
            alert: this.shadowRoot.querySelector('ha-alert'), // New reference to the ha-alert
        };
    }

    _getBatteryThemeIcon(percentage) {
        if (percentage === 100) return 'mdi:battery'; // Cas spécial pour 100%
    
        const step = 10;
        const baseIcon = 'mdi:battery';
    
        const level = Math.floor(percentage / step) * step;
    
        if (level > 0) {
            return `${baseIcon}-${level}`;
        }
    
        return `${baseIcon}-alert`; // 0%
    }
    
    _getBatteryThemeColor(percentage) {
        if (percentage >= 75) return 'var(--green-color)';
        if (percentage >= 50) return 'var(--yellow-color)';
        if (percentage >= 25) return 'var(--orange-color)';
        return 'var(--red-color)';
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
            this._showError("Entity not found in Home Assistant states.");
            return;
        }
        // Hide error message if entity is found
        this._hideError();

        const value = parseFloat(entity.state);
        const percentage = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);

        let iconTheme = null;
        let colorTheme = null;

        if (this.config.theme === "battery") {
            iconTheme = this._getBatteryThemeIcon(percentage)
            colorTheme = this._getBatteryThemeColor(percentage)
        }

        // update dyn element
        this._updateElement('progressBar', (el) => {
            el.style.width = `${percentage}%`;
            el.style.backgroundColor = colorTheme || this.config['bar_color'] || 'var(--state-icon-color)';
        });

        this._updateElement('icon', (el) => {
            el.setAttribute('icon', iconTheme || this.config.icon || entity.attributes.icon || 'mdi:alert');
            el.style.color = colorTheme|| this.config.color || 'var(--state-icon-color)';
        });

        this._updateElement('shape', (el) => {
            el.style.backgroundColor = colorTheme || this.config.color || 'var(--state-icon-color)';
        });

        this._updateElement('name', (el) => {
            el.textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
        });

        this._updateElement('percentage', (el) => {
            el.textContent = `${percentage}%`;
        });
    }
    
    // Show error alert
    _showError(message) {
        const alertElement = this._elements.alert;
        if (alertElement) {
            alertElement.style.display = 'block';
            alertElement.textContent = message;  // Set the error message in the alert
        }
    }

    // Hide the alert when the entity is found
    _hideError() {
        const alertElement = this._elements.alert;
        if (alertElement) {
            alertElement.style.display = 'none';
        }
    }

    getCardSize() {
        return 1; // card size
    }
}

EntityProgressCard.version = '1.0.5';
EntityProgressCard._moduleLoaded = false;
customElements.define('entity-progress-card', EntityProgressCard);

//
// Add this card to the list of custom cards for the card picker
//

window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
  type: "entity-progress-card",
  name: "Entity progress card",
  description: "A cool custom card to show current entity status with a progress bar.",
});

//
// Editor
//

class EntityProgressCardEditor extends HTMLElement {
    constructor() {
        super();
        this.config = {};
        this._hass = null;
        this.rendered = false;
    }

    set hass(value) {
        if (!value) {
            console.warn('Skipping render until hass is defined');
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
            console.warn('Skipping render until hass is defined');
            return;
        }
        this.config = config;
        if (!this.rendered) {
            this.rendered = true;
            this.render();
        }
    }

    reorderConfig(config) {
        const { grid_options, ...rest } = config;
        return grid_options ? { ...rest, grid_options } : { ...rest };
    }

    updateConfigProperty(key, value) {
        this.config[key] = value;
        this.config = this.reorderConfig(this.config);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
    }

    addColor(colorSelect) {
        const colors = [
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

        const noColorOption = document.createElement('mwc-list-item');
        noColorOption.value = '';
        noColorOption.innerHTML = `
            <span style="display: inline-block; width: 16px; height: 16px; background-color: transparent; border-radius: 50%; margin-right: 8px;"></span>
        `;
        colorSelect.appendChild(noColorOption);

        colors.forEach(color => {
            const option = document.createElement('mwc-list-item');
            option.value = color.value;
            option.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; background-color: ${color.value}; border-radius: 50%; margin-right: 8px;"></span>
                ${color.name}
            `;
            
            colorSelect.appendChild(option);
        });
    }

    createField({ name, label, type, required = false, description }) {
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
            case 'color':
                inputElement = document.createElement('ha-select');
                inputElement.popperOptions = ""
                this.addColor(inputElement);
                inputElement.addEventListener('closed', (event) => {
                    event.stopPropagation();
                });
                break;
            default:
                inputElement = document.createElement('ha-textfield');
                inputElement.type = 'text';
        }

        inputElement.style.display = 'block';
        inputElement.required = required;
        inputElement.label = label;
        inputElement.value = value;

        inputElement.addEventListener(
            type === 'color' ? 'selected' : (type === 'entity' || type === 'icon' ? 'value-changed' : 'input'),
            (event) => {
                const newValue = event.detail?.value || event.target.value;
                this.updateConfigProperty(name, newValue);
            }
        );

        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '12px';

        const fieldDescription = document.createElement('span');
        fieldDescription.innerText = description;
        fieldDescription.style.fontSize = '12px';
        fieldDescription.style.color = '#888';

        fieldContainer.appendChild(inputElement);
        fieldContainer.appendChild(fieldDescription);

        return fieldContainer;
    }

    render() {
        this.innerHTML = ''; // Reset inner HTML
        const fragment = document.createDocumentFragment();

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.flexWrap = 'wrap';        // Allows wrapping
        container.style.overflow = 'auto';
        container.style.maxHeight = '100vh';     // Limit height to the viewport

        const fields = [
            { name: 'entity', label: 'Entity', type: 'text', required: true, description: 'Enter an entity from Home Assistant.' },
            { name: 'name', label: 'Name', type: 'text', required: false, description: 'Enter a name for the entity.' },
            { name: 'icon', label: 'Icon', type: 'icon', required: false, description: 'Choose an icon for the entity.' },
            { name: 'color', label: 'Color', type: 'color', required: false, description: 'Choose the primary color for the icon.' },
            { name: 'bar_color', label: 'Bar Color', type: 'color', required: false, description: 'Choose the primary color for the bar.' },
        ];

        fields.forEach((field) => {
            container.appendChild(this.createField(field));
        });


        fragment.appendChild(container);
        this.appendChild(fragment);
    }
}

customElements.define('entity-progress-card-editor', EntityProgressCardEditor);
