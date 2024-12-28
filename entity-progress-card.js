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
    }

    static getConfigElement() {
        return document.createElement('entity-progress-card-editor');
    }

    static getStubConfig() {
        return {
            entity: 'sensor.example',
        };
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("The 'entity' parameter is required!");
        }

        this.config = config;

        // build the card content
        this._buildCard();
    }

    set hass(hass) {
        this._hass = hass;

        // current entity state
        const entity = hass.states[this.config.entity];
        if (!entity) {
            return;
        }

        const value = parseFloat(entity.state); // admit it's a float...
        const percentage = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100); // Clamping

        // update the progress bar
        const progressBar = this.shadowRoot.querySelector('.progress-bar-inner');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = this.config['bar_color'] || 'var(--state-icon-color)';
        }

        // update icon
        const icon = this.shadowRoot.querySelector('.icon');
        if (icon) {
            icon.setAttribute('icon', this.config.icon || entity.attributes.icon || 'mdi:alert');
            icon.style.color = this.config.color || 'var(--state-icon-color)';
        }

        // update shape
        const shape = this.shadowRoot.querySelector('.shape');
        if (shape) {
            shape.style.backgroundColor = this.config.color || 'var(--state-icon-color)';
        }

        // update name
        const nameElement = this.shadowRoot.querySelector('.name');
        if (nameElement) {
            nameElement.textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
        }

        // update percentage
        const percentageElement = this.shadowRoot.querySelector('.percentage');
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }
    }

    _buildCard() {
        const wrapper = document.createElement('ha-card');
        wrapper.classList.add('custom-progress-card');
        wrapper.innerHTML = `
        <!-- Conteneur principal -->
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
        `;

        const style = document.createElement('style');
        style.textContent = `
            ha-card {
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start; /* Aligner tous les éléments à gauche */
                padding: 7px 10px;
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
                padding: 0; /* Supprime les marges internes (erreur "0 px" corrigée) */
                margin: 0; /* Supprime les marges externes */
                gap: 10px; /* Ajout de marge de 10px entre le left et le right */
                width: 100%; /* Prendre 100% de la largeur de la carte */
                height: 100%; /* Prendre 100% de la hauteur de la carte */
                overflow: hidden; /* Empêche le contenu de dépasser */
            }

            /* .left: icon & shape */
            .left {
                display: flex;
                align-items: center; /* Centre verticalement */
                justify-content: center; /* Centre horizontalement */
                position: relative;
                width: 36px; /* Taille fixe pour le conteneur */
                height: 36px; /* Taille fixe pour le conteneur */
                flex-shrink: 0; /* Empêche le rétrécissement */
            }

            .shape {
                position: absolute; /* Position absolue pour occuper tout l'espace */
                width: 36px; /* S'assure que le cercle correspond exactement au conteneur */
                height: 36px; /* Taille identique à la largeur */
                border-radius: 50%; /* Crée un cercle parfait */
                background-color: var(--state-icon-color); /* Couleur du cercle */
                opacity: 0.2; /* Transparence */
            }

            .icon {
                position: relative; /* Relatif pour rester centré au-dessus du shape */
                z-index: 1; /* S'assure que l'icône est au-dessus du shape */
                width: 24px; /* Taille de l'icône */
                height: 24px; /* Taille de l'icône */
            }

            /* .right: name & percentage */
            .right {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex-grow: 1; /* Prend toute la place restante */
                overflow: hidden; /* Empêche le débordement */
                width:100%;
            }
 
            .name {
                font-size: 1em;
                font-weight: bold;
                color: var(--primary-text-color);
                white-space: nowrap; /* Empêche le retour à la ligne */
                overflow: hidden; /* Cache le contenu débordant */
                text-overflow: ellipsis; /* Ajoute des "..." si le texte est trop long */
                width: 100%; /* Limite la largeur au conteneur parent */
            }

            .secondary_info {
                display: flex; /* Flex container */
                flex-direction: row; /* Dispose les éléments sur une seule ligne */
                align-items: center; /* Centre verticalement les éléments */
                justify-content: flex-start; /* Aligne les éléments à gauche */
                gap: 10px; /* Ajout d'un espace fixe entre le pourcentage et la barre */
            }

            .percentage {
                font-size: 0.9em;
                color: var(--primary-text-color);
                min-width: 40px; /* Largeur minimale pour aligner avec la barre */
                text-align: left; /* Aligner le texte du pourcentage à droite */
            }

            /* Progress bar */
            .progress-bar {
                flex-grow: 1; /* La barre de progression occupe le reste de l'espace */
                height: 8px;
                max-height: 8px; /* Garantit que la hauteur ne dépasse pas cette valeur */
                background-color: var(--divider-color);
                border-radius: 4px;
                overflow: hidden;
                position: relative; /* Position pour que les enfants soient bien alignés */
            }

            .progress-bar-inner {
                height: 100%;
                width: 75%; /* La largeur est mise à jour dynamiquement */
                background-color: var(--primary-color);
                transition: width 0.3s ease;
            }

        `;

        // Inject in the DOM
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(wrapper);
    }

    getCardSize() {
        return 1; // card size
    }
}

EntityProgressCard.version = '1.0.3';
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
