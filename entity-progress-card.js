class EntityProgressCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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
            console.error(`L'entité ${this.config.entity} est introuvable.`);
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
        this.hass = {};
    }
    
    setConfig(config) {
        this.config = config;
        this.render();
    }

    reorderConfig(config) {
        // get grid_options
        const { grid_options, ...rest } = config;
    
        // Recreate the config
        const newConfig = { ...rest };
    
        // put grid_option at the end
        if (grid_options) {
            newConfig.grid_options = grid_options;
        }
    
        return newConfig;
    }

    updateConfigProperty = (key, value) => {
        // update key/value
        this.config[key] = value;
        // reorder
        this.config = this.reorderConfig(this.config);
    }

    render() {
        this.innerHTML = ''; // Reset inner HTML
    
        const container = document.createElement('div');
        container.style.display = "flex";
        container.style.flexDirection = "column";
    
        // Define input fields with descriptions
        const fields = [
            { name: 'entity', label: 'Entity (*)', type: 'text', description: 'Enter an entity from Home Assistant.' },
            { name: 'name', label: 'Name', type: 'text', description: 'Enter a name for the entity.' },
            { name: 'icon', label: 'Icon', type: 'icon', description: 'Choose an icon for the entity.' },
            { name: 'color', label: 'Color', type: 'text', description: 'Enter the main color for the icon.' },
            { name: 'bar_color', label: 'Bar Color', type: 'text', description: 'Enter the color for the bar.' }
        ];

        fields.forEach(field => {
            let inputElement;
            if (field.type === 'dropdown') {
                inputElement = document.createElement('ha-select');
                field.options.forEach(option => {
                    const optionElement = document.createElement('mwc-list-item');
                    optionElement.value = option;
                    optionElement.innerText = option;
                    inputElement.appendChild(optionElement);
                });
                inputElement.value = this.config.mode || field.defaultValue;
            } else if (field.type === 'entity') {
                // Use ha-entity-picker for entity selection
                inputElement = document.createElement('ha-entity-picker');
                inputElement.hass = this.hass;
                inputElement.label = field.label
                inputElement.value = this.config.entity || '';
            } else if (field.type === 'icon') {
                // Use ha-icon-picker for icon selection
                inputElement = document.createElement('ha-icon-picker');
                inputElement.label = field.label
                inputElement.value = this.config.icon || '';
                // Listen for value-changed event to update config
                inputElement.addEventListener('value-changed', (event) => {
                    //this.config = {
                    //    ...this.config,
                    //    icon: event.target.value
                    //};
                    this.updateConfigProperty('icon', event.target.value)
                    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
                });
            } else {
                inputElement = document.createElement('ha-textfield');
                inputElement.type = field.type;
                inputElement.label = field.label
                inputElement.value = this.config[field.name] || field.defaultValue || '';
            }
    
            inputElement.configValue = field.name;
        
            // Listen for change event to update config
            inputElement.addEventListener('change', (event) => {
                const target = event.target;
                //this.config = {
                //    ...this.config,
                //    [target.configValue]: target.value
                //};
                this.updateConfigProperty(target.configValue, target.value)
                this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
            });
        
            // Create a description
            const fieldDescription = document.createElement('span');
            fieldDescription.innerText = field.description;
            fieldDescription.style.fontSize = "12px";
            fieldDescription.style.color = "#888";
            fieldDescription.style.marginBottom = "6px";
        
            container.appendChild(inputElement);
            container.appendChild(fieldDescription);
        });
        this.appendChild(container);
    }
}

customElements.define('entity-progress-card-editor', EntityProgressCardEditor);
