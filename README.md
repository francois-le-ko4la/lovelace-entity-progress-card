# Lovelace Entity Progress Card

Entity progress card for Home Assistant

<img src="./doc/thumbnail.png" alt="Default" width="700"/>

<img src="./doc/example.png" alt="Default" width="400"/>

This custom version of the **Bar Card** for Home Assistant allows you to display a simple percentage bar that is quick and easy to integrate into your Lovelace cards. It blends seamlessly with the `Tile`/`Mushroom` look & feel of the latest Home Assistant versions. This card is based on custom CSS and leverages existing code to fine-tune the appearance.

## 🚀 Features
- **Percentage Progress Bar**: Displays the progress of a specified entity in percentage.
- **Seamless Integration with Home Assistant's Modern UI**: Fully aligns with the "Tile" look & feel of recent Home Assistant versions.
- **Dynamic Theme**: Automatically adjusts icons and colors based on the context (e.g., Battery Theme), reflecting the entity's state.
- **Enhanced Customization**: Offers a balanced default setup while allowing users to further tailor the card's behavior and appearance through YAML or the card editor (full details below).
- **Smooth Animations**: Provides HTML elements that facilitate smooth, visually appealing animations, leveraging well-known mechanisms for easy implementation.
- **Interactive Features**: Includes a "More Info" option, enabling users to view additional entity details or navigate to another dashboard with a simple click, improving accessibility and usability.
- **Performance Optimized**: Code enhancements ensure better performance and maintainability, offering a more stable and responsive experience.
- **Multi-Language Support**: Provides localized error messages and descriptions, supporting multiple languages 🇬🇧🇪🇸🇩🇪🇮🇹🇫🇷.
  
## ⚙️ Prerequisites

- HA version: 2024+
> [!IMPORTANT]
> Ensure your Home Assistant instance is up to date to support this custom card.

## 📦 Installation Steps
### HACS Installation (Recommended)

Use this button to add the repository to your HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=francois-le-ko4la&repository=lovelace-entity-progress-card&category=plugin)

> [!TIP]
> If you are unable to use the button above, follow the steps below:
> 1. Add this repository to HACS by including it as a custom repository:
>   - Go to `HACS` > `Integrations` > `⋮` > `Custom repositories`.
>   - Paste the URL of this repository and select Lovelace as the category.
> 2. Install the Entity Progress Card from HACS.

### Manual Installation

1. Download the file `entity-progress-card.js` to the `/config/www/` directory in your Home Assistant setup.
2. Add `/local/entity-progress-card.js` to your Lovelace resources
```yaml
url: /local/entity-progress-card.js
type: module
```

## 📝 Usage
### Card Editor
The card editor allows you to quickly set up and customize the card.

![Editor](./doc/editor.png)

### Parameters

You can customize the card using the following parameters:

- **`entity`** [entity] *(required)*:  
  The Home Assistant entity to display.
  
  *Example:*
    - `sensor.hp_envy_6400_series_tri_color_cartridge`
  
- **`attribute`** [entity] *(optional)*:  
  The Home Assistant entity's attribute to display.
  
  *Example:*
    - `brightness`
 
  *Supported entities:*
  
  | entity (supported)    | default attribute   |
  | --------------------- | ------------------- |
  | cover.xxx             | current_position    |
  | light.xxx             | brightness (%)      |
  | fan.xxx               | percentage          |
  | climate.xxx           | N/A                 |
  | humidifier.xxx        | N/A                 |
  | media_player.xxx      | N/A                 |
  | vacuum.xxx            | N/A                 |
  | device_tracker.xxx    | N/A                 |
  | weather.xxx           | N/A                 |
  
- **`name`** [string] *(optional)*:  
  The name displayed on the progress bar. If omitted, the entity's friendly name will be used.
  
  *Default:*
    - `<entity_name>`
      
  *Example:*
    - `"RGB Color"`

- **`layout`** [string {`horizontal`| `vertical`}] *(optional)*:  
  Determines the layout of the elements inside the card. You can choose between different layouts based on your visual preferences.
  
  *Default:*
    - `horizontal`
  
  *Examples:*
    - `horizontal`: Displays the elements horizontally, with a row layout (by default, the text and progress bar will be displayed side by side).  
    - `vertical`: Displays the elements vertically, with a column layout (by default, the text and progress bar will be stacked one below the other).

- **`icon`** [string] *(optional)*:  
  The icon associated with the entity. Supports Material Design Icons (MDI).
  
  *Examples:* `mdi:lightbulb`, `mdi:thermometer`

- **`color`** [string] *(optional)*:  
  The color of the icon. Accepts color names, RGB values, or HEX codes.
  
  *Default:*
    - `var(--state-icon-color)`

  *Examples:* `"green"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`

- **`bar-color`** [string] *(optional)*:  
  The color of the progress bar. Accepts color names, RGB values, or HEX codes.
  
  *Default:*
    - `var(--state-icon-color)`

  *Examples:* `"blue"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`

- **`theme`** [string {`battery`|`light`}] *(optional)*:  
  Allows customization of the progress bar's appearance using a predefined theme.
  This theme dynamically adjusts the `icon`, `color` and `bar-color` parameters based on the battery level, eliminating the need for manual adjustments or complex Jinja2 templates.  
  *Example:*
    - `battery`
    - `light`

- **`max_value`** [numeric/entity] *(optional)*:  
  Allows representing standard values and calculating the percentage relative to the maximum value.
  This value can be numeric (float/int) or an entity and real value must be > 0.
  
  *Default:*
    - `100%`

  *Example:*
    - LQI @ 150 (entity) with max_value @ 255 (static value -> max_value = 255)
    - A (entity_a) with max_value (entity_b)

- **`min_value`** [numeric] *(optional)*:  
  Defines the minimum value to be used when calculating the percentage.  
  This allows the percentage to be relative to both a minimum (min_value, which represents 0%) and a maximum (max_value, which represents 100%).  
  This value must be numeric (either a float or an integer).

  *Default:*
    - `0`

  *Example:*
    Suppose you are measuring the weight of a connected litter box, where:
    - `min_value` = 6 (the minimum weight representing an empty box, i.e., 0%).
    - `max_value` = 11 (the maximum weight representing a full box, i.e., 100%).
    - `value` = 8 (the current weight).
    - `percentage` = 40%

- **`unit`** [string] *(optional)*:  
  Allows representing standard unit.  
  Specifies the unit to display the entity's actual value, ignoring max_value. The max_value is still used for the progress bar representation.
  
  *Default:*
    - `%`
      
  *Example:*
    - `°C` for temperature.
    - `kWh` for energy consumption.
    
- **`decimal`** [int >=0] *(optional)*:  
  Defines the number of decimal places to display for numerical values.  
  The `decimal` value will be determined based on the following priority:
  - `Display Precision` from the entity (if defined in Home Assistant).
  - `decimal` setting in the YAML configuration.
  - `Default Value` (if no other value is set).
  
  *Default values:*
    - `decimal` = 0 for percentage (%)
    - `decimal` = 2 for other unit (°C, kWh...)

  *Example:*  
    - `1` for displaying 50.6%.
    - `0` for displaying 51%
    -  `1` for displaying 20.7°C

> [!IMPORTANT]
> Before version 1.0.20, the default values were different (2 for percentages
> and 0 for other units). When updating, you will need to adjust the parameter
> according to your needs.

- **`navigate_to`** [string] *(optional)*:  
  Specifies a URL to navigate to when the card is clicked.
  If defined, clicking the card will redirect to the specified location.
  This parameter takes precedence over show_more_info if both are defined.

  *Default values:*
    - `null` (no navigation).

  *Example:*
    - `/lovelace/dashboard` to navigate to another Home Assistant dashboard ("dashboard").
    - `/lovelace/5` to navigate to another Home Assistant dashboard (5).
    - `https://example.com` to open an external link.

- **`show_more_info`** [boolean] *(optional)*:  
  Determines whether clicking on the card will open the entity's "more info" dialog in Home Assistant.  
  Defaults to true. If set to false, clickingthe card will not trigger any "more info" action.
  
  *Default:*
    - `true`
  
  *Example:*
    - `true` to enable "more info" on click.
    - `false` to disable the "more info" dialog.
  
### YAML
Here’s our example of how to use the Custom Bar Card with custom styles:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: rgb(110, 65, 171)
bar_color: rgb(110, 65, 171)
```

<img src="./doc/RVB.png" alt="Image title" width="250px"/>

Another example with `grid_option` and vertical `layout`:
```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: yellow
bar_color: green
layout: vertical
grid_options:
  columns: 3
  rows: 2
```

<img src="./doc/RVB_vertical.png" alt="Image title" width="118px"/>

## 💡 Sample Usage

> [!TIP]
>  - Use Material Design Icons (MDI) for a consistent look. Browse available icons at Material Design Icons.
>  - Experiment with color codes like HEX or RGB for precise customization.
>  - Combine with other Lovelace cards to create a visually cohesive dashboard.

> [!IMPORTANT]
>
> Below, you'll find examples that highlight the interoperability of this card with other popular Home Assistant projects.
> To replicate these samples, ensure the following are set up:
>
>  - vertical-stack-in-card ([GitHub link](https://github.com/ofekashery/vertical-stack-in-card))
>  - auto-entities ([GitHub link](https://github.com/thomasloven/lovelace-auto-entities))
>  - card_mod ([GitHub link](https://github.com/thomasloven/lovelace-card-mod))

### Battery dashboard

This card enables the creation of a streamlined battery dashboard by leveraging theme capabilities and `auto-entities` custom card.

```yaml
type: custom:auto-entities
filter:
  include:
    - attributes:
        device_class: battery
      options:
        type: custom:entity-progress-card
        entity: this.entity_id
        theme: battery
card:
  square: false
  type: grid
  columns: 2
show_empty: true
card_param: cards
sort:
  method: state
  numeric: true
  ignore_case: false
```

<img src="./doc/battery_dashboard.png" alt="Image title" width="500"/>

### litter box

Do you want a percentage based on a minimum and maximum quantity? Here’s an example with a litter box:

```yaml
type: custom:entity-progress-card
entity: sensor.petkit_puramax_2_litter_weight
max_value: 12
min_value: 6
name: Litière
bar_color: var(--disabled-color)
grid_options:
  columns: 6
  rows: 1
```

### Temperature

```yaml
type: custom:entity-progress-card
entity: sensor.xxx
attribute: temperature
unit: °C
min_value: -20
max_value: 45
theme: temperature
```

We can use `min_value` and `max_value` to define the range of values we want to represent with our color gradient.
We use predefined intervals, each associated with a specific color:

*   -50°C - 8°C:  `var(--deep-purple-color)`
*   8°C - 16°C:   `var(--indigo-color)`
*   16°C - 18°C:  `var(--light-blue-color)`
*   18°C - 20°C:  `var(--teal-color)`
*   20°C - 25°C:  `var(--success-color)`
*   25°C - 27°C:  `var(--yellow-color)`
*   27°C - 29°C:  `var(--accent-color)`
*   29°C - 34°C:  `var(--deep-orange-color)`
*   34°C - 100°C: `var(--red-color)`

<img src="./doc/temperature.png" alt="Image title" width="500"/>

### Humidity

```yaml
type: custom:entity-progress-card
entity: sensor.xxx
attribute: humidity
theme: humidity
```

The `humidity` configuration defines how different humidity levels are represented with colors and icons.  
Unlike a linear gradient, this system uses predefined humidity ranges, each associated with a specific color and icon.  

The ranges and their corresponding colors are as follows:

*   0% - 23%:   `var(--red-color)` → Very dry air  
*   23% - 30%:  `var(--accent-color)` → Dry air  
*   30% - 40%:  `var(--yellow-color)` → Slightly dry air  
*   40% - 50%:  `var(--success-color)` → Optimal humidity  
*   50% - 60%:  `var(--teal-color)` → Comfortable humidity  
*   60% - 65%:  `var(--light-blue-color)` → Slightly humid air  
*   65% - 80%:  `var(--indigo-color)` → Humid air  
*   80% - 100%: `var(--deep-purple-color)` → Very humid air  

Each range is visually represented using the `mdi:water-percent` icon, ensuring a clear and intuitive display of humidity levels.

<img src="./doc/humidity.png" alt="Image title" width="500"/>

### VOC

```yaml
type: custom:entity-progress-card
entity: sensor.xxx_voc
unit: ppb
decimal: 0
max_value: 300
theme: voc
```

The `voc` configuration defines how different levels of volatile organic compounds (VOCs) are represented using colors and icons.  
Instead of a linear gradient, this system categorizes VOC levels into predefined ranges, each associated with a specific color for better visualization.  

The ranges and their corresponding colors are as follows:

*   0 - 300 ppb:     `var(--success-color)` → Excellent air quality  
*   300 - 500 ppb:   `var(--yellow-color)` → Good air quality  
*   500 - 3000 ppb:  `var(--accent-color)` → Moderate air quality  
*   3000 - 25000 ppb: `var(--red-color)` → Poor air quality  
*   25000 - 50000 ppb: `var(--deep-purple-color)` → Very poor air quality  

Each range is visually represented using the `mdi:air-filter` icon, ensuring a clear and intuitive display of VOC levels.

<img src="./doc/voc.png" alt="Image title" width="500"/>

### PM 2.5

```yaml
type: custom:entity-progress-card
entity: sensor.xxx_pm25
unit: µg/m³
decimal: 0
max_value: 50
theme: pm25
```

The `pm25` configuration defines how different concentrations of fine particulate matter (PM2.5) are represented using colors and icons.  
Rather than a linear gradient, this system categorizes PM2.5 levels into predefined ranges, each mapped to a specific color for easy interpretation.  

The ranges and their corresponding colors are as follows:

*   0 - 12 µg/m³:   `var(--success-color)` → Good air quality  
*   12 - 35 µg/m³:  `var(--yellow-color)` → Moderate air quality  
*   35 - 55 µg/m³:  `var(--accent-color)` → Unhealthy for sensitive groups  
*   55 - 150 µg/m³: `var(--red-color)` → Unhealthy air quality  
*   150 - 200 µg/m³: `var(--deep-purple-color)` → Very unhealthy air quality  

Each range is visually represented using the `mdi:air-filter` icon, ensuring a clear and intuitive display of PM2.5 pollution levels.

<img src="./doc/voc.png" alt="Image title" width="500"/>

### card_mod / animation

We can use `card_mod` to add dynamic animations to the icon, enhancing the visual experience and providing a more engaging user interface.

*Example:*
```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: rgb(110, 65, 171)
bar_color: rgb(110, 65, 171)
card_mod:
  style: |-
    ha-icon {
      animation: boing 3s ease infinite;
      transform-origin: 50% 90%;
    }
    @keyframes boing {
      0% { transform: scale3d(1, 1, 1); }
      7% { transform: scale3d(1.25, 0.75, 1); }
      10% { transform: scale3d(0.75, 1.25, 1); }
      12% { transform: scale3d(1.15, 0.85, 1); }
      16% { transform: scale3d(0.95, 1.05, 1); }
      19% { transform: scale3d(1.05, 0.95, 1); }
      25% { transform: scale3d(1, 1, 1); }
    }
```
> [!TIP]
> We expose the `ha-icon` and `ha-shape` elements to properly animate the card.

### vertical-stack-in-card

We can use `vertical-stack-in-card` to group multiple cards into a cohesive layout.
This approach is particularly useful when combining custom cards while maintaining a
consistent design. Additionally, we leverage `auto-entities` to dynamically list entities
based on specific attributes or filters, allowing for flexible and automatic card
generation. Finally, `card_mod` is used to remove the borders and shadows, ensuring a
clean and seamless appearance.

*Example:*
```yaml
type: custom:vertical-stack-in-card
cards:
  - type: custom:auto-entities
    filter:
      include:
        - attributes:
            device_class: battery
          options:
            type: custom:entity-progress-card
            entity: this.entity_id
            name: sample
            theme: battery
            card_mod:
              style:
                .: |-
                  :host {
                    --ha-card-border-width: 0px !important; /* Forcer la suppression des bordures */
                    box-shadow: none !important; /* Supprimer l'ombre pour enlever tout contour */
                  }
    sort:
      method: friendly_name
    card:
      square: false
      type: grid
      columns: 2
    card_param: cards
```
<img src="./doc/stack.png" alt="Image title" width="500"/>
