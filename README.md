# Lovelace Entity Progress Card [![ReadMe](https://img.shields.io/badge/ReadMe-018EF5?logo=readme&logoColor=fff)](https://github.com/francois-le-ko4la/lovelace-entity-progress-card)

[![Static Badge](https://img.shields.io/badge/Home%20Assistant-blue?style=for-the-badge&logo=homeassistant&logoColor=white&color=blue)](https://github.com/francois-le-ko4la/lovelace-entity-progress-card)
[![Static Badge](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=Javascript&logoColor=black&color=%23F7DF1E)](https://github.com/francois-le-ko4la/lovelace-entity-progress-card)
[![Static Badge](https://img.shields.io/badge/Discord-%235865F2?style=for-the-badge&logo=Discord&logoColor=white&color=%235865F2)](https://discord.gg/tyMQ2SfyNG)

A modern Entity progress card for Home Assistant's Lovelace UI.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/thumbnail.png" alt="Default" width="700"/>

## ⚡ Description

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/example.png" alt="Default" width="400"/>

This custom version of the **Bar Card** for Home Assistant allows you to display a simple percentage bar that is quick and easy to integrate into your Lovelace cards. It blends seamlessly with the `Tile`/`Mushroom` look & feel of the latest Home Assistant versions. This card is based on custom CSS and leverages existing code to fine-tune the appearance.

## 🚀 Features

- **Percentage Progress Bar**: Displays the progress of a specified entity in percentage.
- **Seamless Integration with Home Assistant's Modern UI**: Fully aligns with the "Tile" look & feel of recent Home Assistant versions.
- **Dynamic Theme**: Automatically adjusts icons and colors based on the context (e.g., Battery Theme), reflecting the entity's state.
- **Enhanced Customization**: Offers a balanced default setup while allowing users to further tailor the card's behavior and appearance through YAML or the card editor (full details below).
- **Smooth Animations**: Provides HTML elements that facilitate smooth, visually appealing animations, leveraging well-known mechanisms for easy implementation.
- **Interactive Features**: Includes all "xyz_action" option, enabling users to view additional entity details or navigate to another dashboard with a simple click, improving accessibility and usability.
- **Performance Optimized**: Code enhancements ensure better performance and maintainability, offering a more stable and responsive experience.
- **Multi-Language Support**: Provides localized error messages and descriptions, supporting multiple languages 🇬🇧 🇪🇸 🇩🇪 🇮🇹 🇫🇷 🇵🇱 🇳🇱 🇭🇷 🇲🇰 🇵🇹 🇩🇰 🇸🇪 🇳🇴 (bokmål) 🇫🇮 🇷🇴 🇬🇷 🇯🇵 🇰🇷 🇨🇳 🇹🇷 🇸🇦.

## ⚙️ Prerequisites

- HA version: 2024+
- Chrome 92+, Edge 92+, Firefox 90+, Safari 15.4+, Opera 78+

> [!IMPORTANT]
>
> Ensure your Home Assistant instance is up to date to support this custom card.

## 📦 Installation Steps

### HACS Installation (Recommended)

Use this button to add the repository to your HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=francois-le-ko4la&repository=lovelace-entity-progress-card&category=plugin)

> [!TIP]
>
> If you are unable to use the button above, follow the steps below:
>
> - Add this repository to HACS: Go to `HACS` > `Integrations` > `⋮` > `Custom repositories`.
> - Paste the URL of this repository and select `Dashboard` as the category.
> - Install the Entity Progress Card from HACS.

### Manual Installation

1. Download the file `entity-progress-card.js` (from the last version) to the `/config/www/` directory in your Home Assistant setup.
2. Add `/local/entity-progress-card.js` to your Lovelace resources

```yaml
url: /local/entity-progress-card.js
type: module
```

## 📝 Usage

### 🪄 Card Editor

The card editor allows you to quickly set up and customize the card.

![Editor](https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/editor.png)

### 🔧 Parameters

You can customize the card using the following parameters:

#### `entity`

> **`entity`** string _(required)_

Entity ID.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
```

> [!NOTE]
>
> Supported entities are not hardcoded, ensuring flexibility.
> If you need a specific attribute, use the `attribute` parameter.

> [!IMPORTANT]
>
> Timer are supported (1.0.43). `attribute`, `min`, `max` parameters are not considered.

#### `attribute`

> **`attribute`** string _(optional)_

The Home Assistant entity's attribute to display.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.led0
attribute: brightness
```

_Supported entities:_

All entities that have an attribute containing a numeric value are supported.
This allows the card to work with a wide range of sensors, statistics, or other entities exposing numeric data through their attributes.

Defining the attribute with the following is not supported:

- counter
- number
- duration
- timer

_default attribute:_

| entity (supported) | default attribute |
| ------------------ | ----------------- |
| cover.xxx          | current_position  |
| light.xxx          | brightness (%)    |
| fan.xxx            | percentage        |

#### `name`

> **`name`** string _(optional)_

The name displayed on the progress bar. If omitted, the entity's friendly name will be used.

_Default_:

- `<entity_name>`

_Example_:

```yaml
type: custom:entity-progress-card
····
name: ABC
```

#### `unit`

> **`unit`** string _(optional)_

Allows representing standard unit.

_Unit selection_:

- If a `unit` is manually specified in the configuration, it will be used.
- Otherwise, if `max_value` is an entity, the default unit (%) will be used.
- Otherwise, the `unit` is automatically determined based on the current value:
  - If the entity is a `timer` the unit will be 's' (seconds).
  - If the entity is a `duration`:
    By default, the internal value in the card is expressed in seconds.
    If you do not specify a unit, we will display the duration based on what is defined in the Home Assistant entity, using a natural format (e.g., 2h 32min).
    If you want to display the value in seconds, set the unit to 's'.
    If you prefer a HH:MM:SS format, you can use either timer or flextimer.
  - If the entity is a `counter`, no unit ('') will be displayed.
  - Otherwise, the `unit` defined in Home Assistant for the entity will be used (e.g., °C, kWh, etc.).

> [!NOTE]
>
> Specifies the `unit` to display the entity's actual value, ignoring `max_value`. Even if the displayed
> value uses an automatically detected unit, the progress bar still relies on max_value to calculate the
> percentage.

> [!WARNING]
> Setting the unit to % will display the percentage value, while using a different unit will show the value
> of the primary entity.
> Switching between non-percentage units does not affect the displayed numeric value.
> For example, by default, a timer is shown in seconds. If the unit is changed from s (seconds) to min (minutes),
> no conversion is performed (for now), and the value remains unchanged.

_Example_:

```yaml
type: custom:entity-progress-card
····
unit: ABC
```

- `°C` for temperature.
- `kWh` for energy consumption.
- `s` for timer
- `timer` for timer (display HH:MM:SS without unit)
- `flextimer` for timer (same than timer but truncate the display according to the current value)

> [!TIP]
>
> Disabling the Unit: To completely hide the unit from display, set the disable_unit option to true.

#### `unit_spacing` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#unit_spacing-)

> **`unit_spacing`** string ➡️ {`auto`|`space`|`no-sspace`} _(optional, default: `auto`)_

Defines whether a space should appear between numeric values and units, either following locale rules or overriding them explicitly.

- `auto`: Uses locale-specific formatting rules (e.g., France → space, US → no space)
- `space`: Forces a space between number and unit (e.g., 80 %), regardless of locale
- `no-space`: Forces no space between number and unit (e.g., 80%), regardless of locale

#### `decimal`

> **`decimal`** integer _(optional)_

Defines the number of decimal places to display for numerical values.

The `decimal` value will be determined based on the following priority:

- If `decimal` is explicitly set in the YAML configuration, it is used.
- Otherwise, if the entity has a custom `Display Precision` set in Home Assistant (i.e., a value manually configured by the user and different from the default), it is used.
- Otherwise, the `default` number of decimals is selected based on the type of value:
  - If the value represents a `timer`, the timer default is used.
  - If the value represents a `counter`, the counter default is used.
  - If the value represents a `duration`, or if the unit is one of j, d, h, min, s, or ms, the duration default is used.
  - If the unit is `%` (the default unit), the `percentage` default is used.
  - Otherwise, the other default is applied (for units like °C, kWh, etc.).

_Default values:_

- `decimal` = 0 for percentage (%)
- `decimal` = 0 for timers, durations, or time-based units (seconds, minutes, hours, etc.)
- `decimal` = 0 for Counter
- `decimal` = 2 for other unit (°C, kWh...)

_Example_:

```yaml
type: custom:entity-progress-card
····
decimal: 1
```

- `1` for displaying 50.6%.
- `0` for displaying 51%
- `1` for displaying 20.7°C

> [!IMPORTANT]
>
> Before version 1.0.20, the default values were different (2 for percentages
> and 0 for other units). When updating, you will need to adjust the parameter
> according to your needs.

#### `min_value`

> **`min_value`** float _(optional, default: `0`)_

Defines the minimum value to be used when calculating the percentage.

This allows the percentage to be relative to both a minimum (min_value, which represents 0%) and a maximum (max_value, which represents 100%).

This value must be numeric (either a float or an integer).

_Example_:

```yaml
type: custom:entity-progress-card
····
min_value: 10
```

Suppose you are measuring the weight of a connected litter box, where:

- `min_value` = 6 (the minimum weight representing an empty box, i.e., 0%).
- `max_value` = 11 (the maximum weight representing a full box, i.e., 100%).
- `value` = 8 (the current weight).
- `percentage` = 40%

#### `max_value`

> **`max_value`** float|string _(optional, default: `100`)_

Allows representing standard values and calculating the percentage relative to the maximum value.
This value can be numeric (float/int) or an entity and real value must be > 0.

_Default_:

- `100%`

_Example_:

```yaml
type: custom:entity-progress-card
····
max_value: 255
```

- LQI @ 150 (entity) with max_value @ 255 (static value -> max_value = 255)
- A (entity_a) with max_value (entity_b)

#### `max_value_attribute`

> **`max_value_attribute`** string _(optional)_

The Home Assistant `max_value`'s attribute to display.  
`max_value` must be an entity. See `attribute`.

#### `xyz_action` (`tap_action`, `double_tap_action`, `hold_action`, `icon_tap_action`, `icon_double_tap_action`, `icon_hold_action`)

> **`xyz_action`** map ➡️ {action: {`more-info` | `toggle` | `perform-action` | `navigate` | `url` | `assist` | `none`}...} _(optional)_

_`xyz_action`_:

- `tap_action`: Defines the behavior when a user taps on the card. The action could be a navigation, toggle, or any other pre-defined action.
- `double_tap_action`: Defines the behavior when a user double-taps on the card. This can be used to trigger a different action from the regular tap.
- `hold_action`: Defines the behavior when the user holds down (long press) on the card. This is often used for actions that should only be triggered with a longer press.
- `icon_tap_action`: Defines the behavior when the user taps on the icon (typically an icon on a card). This action can be different from the general tap_action of the card.
- `icon_double_tap_action`: Defines the behavior when the user double-taps on the icon. This can be used to trigger an alternative action from the regular icon_tap_action.
- `icon_hold_action`: Defines the behavior when the user holds down (long press) on the icon. This action might be used for a different, more powerful interaction compared to the regular tap or double tap.

> [!NOTE]
>
> `xyz_action` ensures consistency with standard Home Assistant cards, allowing users to switch efficiently and seamlessly to this card.
> All available options and usage details can be found in the official Home Assistant documentation for actions:
> <https://www.home-assistant.io/dashboards/actions/>.
>

_Available actions_:

- **`default`**: The default action.
- **`more-info`**: Opens the entity's information dialog.
- **`toggle`**: Toggles the state of the entity (e.g., turning a light on or off).
- **`perform-action`**: Executes a specific Home Assistant service call or action.
- **`navigate`**: Navigates to a specific Lovelace view (requires `navigation_path`).
- **`url`**: Opens a URL in the browser (requires `url_path`).
- **`assist`**: Triggers a Home Assistant assistant action (like voice interaction).
- **`none`**: Disables the tap action, meaning no action will be triggered.

_Options:_

- `navigation_path` _path_: Lovelace path to navigate to (e.g., /lovelace/lights).
- `url_path` _url_: URL to open when action is 'url' (e.g., <https://example.com>).
...

_Default:_

- tap_action: `more-info`
- hold_action: `none`
- double_tap_action: `none`
- icon_tap_action:
  - `toggle` if the entity is a `light`, `switch`, `fan`, `input_boolean`, or `media_player`
  - `none` otherwise
- icon_hold_action: `none`
- icon_double_tap_action: `none`

> [!NOTE]
> We have merged the functionalities of `navigate_to` and `show_more_info` into `tap_action`.
> Consequently, these two options have been **deprecated**, **disabled**, and will no longer
> be supported in **v1.2.0**.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.living_room
····
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

#### `theme`

> **`theme`** string ➡️ {`optimal_when_low`|`optimal_when_high`|`light`|`temperature`|`humidity`|`pm25`|`voc`} _(optional)_

Allows customization of the progress bar's appearance using a predefined theme.
This theme dynamically adjusts the `icon`, `color` and `bar-color` parameters based on the battery level, eliminating the need for manual adjustments or complex Jinja2 templates.

_Example_:

```yaml
type: custom:entity-progress-card
····
theme: light
```

> [!WARNING]
> The `battery`, `cpu`, and `memory` parameters are deprecated and SHOULD no longer be used.
> Although these parameters are still valid, they MUST be replaced by `optimal_when_low` or `optimal_when_high`.
> These new parameters, introduced in version `1.1.7`, eliminate the need for multiple theme definitions and are sufficient to replace the deprecated themes.

#### `bar_size`

> **`bar_size`** string ➡️ {`small`|`medium`|`large`} _(optional, default: `small`)_

Customizes the appearance of the progress bar by selecting a predefined size.
Choose from small, medium, or large to adjust the visual scale of the bar.

_Example_:

```yaml
type: custom:entity-progress-card
····
bar_size: medium
```

#### `bar_color`

> **`bar_color`** string _(optional, default: `var(--state-icon-color)`)_

The color of the progress bar. Accepts [Token color](#token-color), color names, RGB values, or HEX codes.

_Examples:_ `"blue"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`

```yaml
type: custom:entity-progress-card
····
bar_color: rgb(110, 65, 171)
```

#### `icon`

> **`icon`** string _(optional)_

Overwrites the entity icon.

_Examples:_ `mdi:lightbulb`, `mdi:thermometer`...

```yaml
type: custom:entity-progress-card
····
icon: mdi:grain
```

_Order of Priority for the Icon:_

- Theme/Custom Theme: The icon derived from the theme or style applied to the item.
- Icon Parameter: A custom icon specifically defined for the item.
- Entity icon.

#### `force_circular_background`

> **`force_circular_background`** boolean _(optional)_

This option forces a **circular background** to be displayed behind the icon shown on the card.

HA 2025.3 bring a lot of improvement and change the circular background strategy: <https://www.home-assistant.io/blog/2025/03/05/release-20253/>

This card evaluate HA version and adapt it according to your entity domain and your action strategy. If you want to avoid this strategy you can use this parameter.

When set to `true`, a circular shape will appear behind the icon, regardless of the HA version, entity domain or action defined. This helps create a cleaner, more consistent visual appearance with Mushroom card.

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.living_room
force_circular_background: true
```

#### `color`

> **`color`** string _(optional)_

The color of the icon. Accepts [Token color](#token-color), color names, RGB values, or HEX codes. By default, the color is based on state, domain, and device_class of your entity for `timer`, `cover`, `light`, `fan`, `climate` and `battery`.

_Examples:_ `"green"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`...

```yaml
type: custom:entity-progress-card
····
color: rgb(110, 65, 171)
```

#### `layout`

> **`layout`** string ➡️ {`horizontal`| `vertical`} _(optional, default: `horizontal`)_:

Determines the layout of the elements inside the card. You can choose between different layouts based on your visual preferences:

- `horizontal`: Displays the elements horizontally, with a row layout.
- `vertical`: Displays the elements vertically, with a column layout.

_Examples:_

```yaml
type: custom:entity-progress-card
····
layout: vertical
```

#### `custom_theme` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#custom_theme-)

> **`custom_theme`** map list _(optional)_

Defines a list of custom theme rules based on value ranges. Setting this variable disables the theme variable.  
This variable can only be defined in YAML.

_Map definition:_

- min [number] (required): The minimum value for this range.
- max [number] (required): The maximum value for this range.
- color [string] (required): The color of the icon and the progress bar.
- icon [string] (optional): The icon to display.

_Order of Priority for the Icon:_

- see [`icon`](#icon) parameter.

_Example_:

```yaml
custom_theme:
  - min: 0
    max: 10
    color: yellow
    icon: mdi:abacus
  - min: 10
    max: 20
    color: green
    icon: mdi:ab-testing
  - min: 20
    max: 50
    color: var(--state-icon-color)
    icon: mdi:abacus
```

> [!NOTE]
>
> [`min`, `max`[ / [`min`, `max`) : The range includes the min value but excludes the max value.

> [!IMPORTANT]
>
> Please ensure your themes follow these guidelines: Each interval must be valid, respecting the rule `min` < `max`.
> The transitions between ranges should be seamless, with each max connecting smoothly to the next min to avoid
> gaps or overlaps. If a value falls below the lowest defined interval, the lowest range will be applied, while
> values exceeding the highest interval will use the highest range.
>
> This is an advanced feature that may require some trial and error during customization. For a seamless editing
> experience, if the theme definition is incorrect, the card simulation will revert to a standard configuration
> and ignore the `custom_theme` definition.

> [!TIP]
>
> If you wish to define colors for discontinuous ranges, you will need to create intermediary ranges to ensure
> continuity, using default colors such as `var(--state-icon-color)` for these filler ranges.

```yaml
# Default settings:
#   - Color: var(--state-icon-color)
#   - Icon: mdi:abacus
#
# Specific ranges:
#   - 10 to 20:
#       - Color: green
#       - Icon: mdi:ab-testing
#   - 50 to 60:
#       - Color: red
#       - Icon: mdi:ab-testing
custom_theme:
  # value < 10:
  - min: 0
    max: 10
    color: var(--state-icon-color)
    icon: mdi:abacus
  # 10 <= value < 20:
  - min: 10
    max: 20
    color: green
    icon: mdi:ab-testing
  # 20 <= value < 50:
  - min: 20
   max: 50
   color: var(--state-icon-color)
   icon: mdi:abacus
  # 50 <= value < 60:
  - min: 50
    max: 60
    color: red
    icon: mdi:ab-testing
  # 60 <= value:
  - min: 60
    max: 70
    color: var(--state-icon-color)
    icon: mdi:abacus
```

#### `reverse` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#reverse-)

> **`reverse`** boolean _(optional, default: `false`)_

If set to true, it enables a countdown behavior (typically in seconds or percentage), which is the standard use case for timers.

_default value_:

- If the entity is a `timer` the `reverse` will be `true`
- Otherwise, the `reverse` will be `false`

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.testtimer
icon: mdi:washing-machine
unit: flextimer
name: Remaining Time reverse
reverse: true
```

#### `bar_orientation` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#bar_orientation-)

> **`bar_orientation`** string {`rtl`|`ltr`} _(optional, default: `ltr`)_

Adjusts the progress bar direction to display from right to left.

This is especially useful for timers to visually represent the remaining time.

_default value_:

- If the entity is a `timer` the `bar_orientation` will be 'rtl'
- Otherwise, the `bar_orientation` will be 'ltr'

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.testtimer
icon: mdi:washing-machine
unit: flextimer
name: Remaining Time reverse
bar_orientation: rtl
reverse: true
```

> [!NOTE]
> While this parameter was originally designed for timers, it can be applied to any entity where a reversed progress bar is needed.

#### `hide`

> **`hide`** list _(optional)_:

Defines which elements should be hidden in the card.

The list can contain any of the following elments:

- `icon`: Hides the entity's icon.
- `name`: Hides the entity's name.
- `value`: Hides the current value.
- `secondary_info`: Hides secondary information.
- `progress_bar`: Hides the visual progress bar.

_Example_:

```yaml
type: custom:entity-progress-card
····
hide:
  - icon
  - name
  - secondary_info
```

#### `disable_unit`

> **`disable_unit`** boolean _(optional, default: `false`)_

Disables the display of the unit when set to `true`. If not defined or set to `false`, the unit will be shown.

_Example_:

```yaml
type: custom:entity-progress-card
····
disable_unit: true
```

#### `badge_icon` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#badge_icon-)

> **`badge_icon`** JINJA _(optional)_:

The `badge_icon` option lets you display a dynamic badge, offering a quick status hint or symbolic representation based on logic or sensor values.

This field supports templating using [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/), allowing the icon to be conditionally rendered.

_Example_:

```yaml
type: custom:entity-progress-card
····
badge_icon: >-
  {% if states('sensor.temperature') | float > 30 %}
    mdi:weather-sunny-alert
  {% else %}
    mdi:thermometer
  {% endif %}
```

> [!NOTE]
>
> If the template returns nothing (i.e., empty string or None), the badge will not be displayed.

#### `badge_color` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#badge_color-)

> **`badge_color`** JINJA _(optional)_:

The `badge_color` option lets you setup a dynamic badge's background color, offering a quick status hint or symbolic representation based on logic or sensor values.

This field supports templating using [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/), allowing the icon to be conditionally rendered.

_Example_:

```yaml
type: custom:entity-progress-card
····
badge_color: >-
  {% if states('sensor.temperature') | float > 30 %}
    red
  {% else %}
    green
  {% endif %}
```

#### `name_info` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#name_info-)

> **`name_info`** JINJA _(optional)_:

The `name_info` option allows you to display additional, customizable text or HTML next to the entity’s name. It supports full [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) and inline HTML, enabling you to style or conditionally format the information based on sensor states or logic.

_Useful for adding_:

- Supplementary sensor data
- Conditional status messages
- Inline styling (colors, emphasis, etc.)

_Example_:

```yaml
type: custom:entity-progress-card
····
name_info: >-
  {% if states('sensor.temperature') | float > 25 %}
    <span style="color: red;">{{ states('sensor.temperature') }} °C – Hot</span>
  {% else %}
    <span style="color: blue;">{{ states('sensor.temperature') }} °C – Cool</span>
  {% endif %}
```

> [!NOTE]
>
> - This field supports HTML for advanced formatting.
> - If the template evaluates to an empty string, nothing will be displayed.

#### `custom_info` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#custom_info-)

> **`custom_info`** JINJA _(optional)_:

The `custom_info` option allows you to display additional, customizable text or HTML next to the entity’s value. It supports full [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) and inline HTML, enabling you to style or conditionally format the information based on sensor states or logic.

_Useful for adding_:

- Supplementary sensor data
- Conditional status messages
- Inline styling (colors, emphasis, etc.)

> [!TIP]
>
> The real benefit of using `custom_info` lies in the advanced flexibility of Jinja, which allows for implementing complex logic
> or data transformations around the displayed value. This enables dynamic content tailored to the specific needs of your card and data.
> For simpler cases, however, consider using the `state_content` parameter, which offers a more straightforward solution.

_Example_:

```yaml
type: custom:entity-progress-card
····
custom_info: >-
  {% if states('sensor.temperature') | float > 25 %}
    <span style="color: red;">{{ states('sensor.temperature') }} °C – Hot</span>
  {% else %}
    <span style="color: blue;">{{ states('sensor.temperature') }} °C – Cool</span>
  {% endif %}
```

> [!NOTE]
>
> - This field supports HTML for advanced formatting.
> - If the template evaluates to an empty string, nothing will be displayed.

#### `state_content` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#custom_info-)

> **`state_content`** string|list _(optional)_:

Content to display for the state. Can be state, last_changed, last_updated, or any attribute of the entity. Can be either a string with a single item, or a list of string items. Default depends on the entity domain.

_Behavior_:

- If `state_content` is defined, the card will attempt to use the first listed attribute.
- If the attribute does not exist on the entity, `unknown` will be displayed immediately, and the card will check the next attributes.

_Accepted values_:

- state — Displays the entity's main state.
- current_position — Displays the current position attribute (commonly used for covers, blinds, etc.).
- Other custom attributes from the entity can also be listed.

> [!TIP]
>
> The use of this variable allows for adjusting the displayed information by simply specifying the attributes to
> be shown. This ensures the displayed information aligns with the user's language-specific preferences and is
> coherent with their localization settings.
> For complex cases, however, consider using the `custom_info` parameter, which offers a more straightforward solution.

_Example_:

```yaml
type: custom:entity-progress-card
····
state_content:
  - state
  - current_position
```

> [!NOTE]
>
> - The selected attribute is shown before the main numerical display on the card.
> - If an attribute listed does not exist, the card immediately displays unknown.
> - This feature is useful for adding additional context (e.g., position, status...) to the main progress value.

#### `watermark` [![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#watermark-)

> **`watermark`** map _(optional)_:

The `watermark` option allows you to visually highlight specific value thresholds (low and high) within the progress bar, helping you better interpret the current state at a glance.

_Map definition_:

- `high` (number): The upper value where the bar will start indicating a high zone (0–100).
- `high_color` (string): The CSS color used for the high watermark zone (can be a name or hex).
- `low` (number): The lower value where the bar starts highlighting a low zone (0–100).
- `low_color` (string): The CSS color used for the low watermark zone.
- `type` (string): Defines the style of the watermark overlay.
  - `block` (default): Flat color over the bar
  - `line`: Vertical lines pattern (like a hatch effect)
- `opacity` (number): Adjusts the transparency of the watermark overlay (from 0 = fully transparent to 1 = fully opaque).
- `disable_low` (boolean): If set to true, disables the low watermark display.
- `disable_high` (boolean): If set to true, disables the high watermark display.

_Example_:

```yaml
type: custom:entity-progress-card
····
watermark:
  high: 80          # 🔺 Upper threshold (e.g., max recommended battery level)
  high_color: red   # 🎨 Color to indicate the high watermark zone
  low: 10           # 🔻 Lower threshold (e.g., minimum safe battery level)
  low_color: yellow # 🎨 Color to indicate the low watermark zone
```

Thanks to automatic **unit detection**, the card intelligently interprets your thresholds depending on the entity’s native unit.

### 📎 YAML

Here’s our example of how to use the Custom Bar Card with custom styles:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: rgb(110, 65, 171)
bar_color: rgb(110, 65, 171)
icon_tap_action:
  action: more-info
```

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/RVB.png" alt="Image title" width="250px"/>

Another example with `grid_option` and vertical `layout`:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: yellow
bar_color: green
icon_tap_action:
  action: more-info
layout: vertical
grid_options:
  columns: 3
  rows: 2
```

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/RVB_vertical.png" alt="Image title" width="118px"/>

## Percentage Calculation

This card automatically calculates progress percentages based on the current entity, depending on the type of input it receives:

- Timer:
  If the value represents a timer, the range (min, max) and the current value are taken directly from the timer entity.
  Attribute will not be used.

- Counter or Number value:
  If the value is a counter or a Number ({ value, min, max }), it uses the provided value directly from the entity. The max value can also come from another entity by using max_value.
  Attribute will not be used.

- Other entity:
  If the entity value is a number, it’s treated as the current value. The min and max boundaries are taken from default value (0/100) or configuration or external entities depending on the setup. If max_value is an entity, its current value is used.

## 🧐 Sample Usage

> [!TIP]
> Use Material Design Icons (MDI) for a consistent look. Browse available icons at Material Design Icons.  
> Experiment with color codes like HEX or RGB for precise customization.  
> Combine with other Lovelace cards to create a visually cohesive dashboard.

> [!IMPORTANT]
>
> Below, you'll find examples that highlight the interoperability of this card with other popular Home Assistant projects.
> To replicate these samples, ensure the following are set up:
>
> 📌 vertical-stack-in-card ([GitHub link](https://github.com/ofekashery/vertical-stack-in-card))  
> 📌 auto-entities ([GitHub link](https://github.com/thomasloven/lovelace-auto-entities))  
> 📌 card_mod ([GitHub link](https://github.com/thomasloven/lovelace-card-mod))

### 🔋 Battery dashboard

This card enables the creation of a streamlined battery dashboard by leveraging theme capabilities and `auto-entities` custom card.

```yaml
type: custom:auto-entities
filter:
  include:
    - attributes:
        device_class: battery
      options:
        type: custom:entity-progress-card
        entity: this.entity_id # remove this line with auto-entities v1.14.1+
        theme: optimal_when_high
        icon_tap_action:
          action: more-info
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

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/battery_dashboard.png" alt="Image title" width="500"/>

### 😺 Litter box

Do you want a percentage based on a minimum and maximum quantity? Here’s an example with a litter box:

```yaml
type: custom:entity-progress-card
entity: sensor.petkit_puramax_2_poids_litiere
min_value: 6
max_value: 12
name: Litter
theme: optimal_when_high
grid_options:
  columns: 6
  rows: 1
```

### 🎨 Themes

#### 🔋 Optimal when high (Battery...)

The "Optimal when High" parameter is particularly useful in cases where the system or component in question performs best at higher values. For instance, in the case of battery charge, the device functions more efficiently and with better performance when the battery level is high. By using "Optimal when High," you can set a theme that visually emphasizes and prioritizes states where the value is at its peak.

```yaml
type: custom:entity-progress-card
entity: sensor.in2013_battery_level
theme: optimal_when_high
```

- 0% -> 20%: `red`
- 20% -> 50%: `amber`
- 50% -> 80%: `yellow`
- 80% -> 100%: `green`

> [!NOTE]
>
> The icon is automatically retrieved from the entity but can be overridden using the `icon` parameter.

#### 💽 Optimal when low (CPU, RAM, disk...)

The "Optimal when Low" parameter is particularly valuable for monitoring systems or components that perform best when their values are at a lower level. For example, in the case of memory usage or CPU load, lower values often indicate that the system is running efficiently and not overburdened.

```yaml
type: custom:entity-progress-card
entity: sensor.system_monitor_cpu_usage
theme: optimal_when_low
```

- 0% -> 20%: `green`
- 20% -> 50%: `yellow`
- 50% -> 80%: `amber`
- 80% -> 100%: `red`

> [!NOTE]
>
> The icon is automatically retrieved from the entity but can be overridden using the `icon` parameter.

#### 💡 Light

```yaml
type: custom:entity-progress-card
entity: light.bandeau_led
attribute: brightness
theme: light
icon_tap_action:
  action: more-info
```

The `light` configuration, designed by [@harmonie-durrant](https://github.com/harmonie-durrant), defines how different brightness levels are visually represented using colors and icons.  
This system uses a **linear gradient**, meaning the color transitions smoothly across the brightness percentage range.

The brightness levels and their corresponding colors are as follows:

- **< 25%**: `#4B4B4B` → Dim light (`mdi:lightbulb-outline`)
- **≥ 25%**: `#877F67` → Soft warm light (`mdi:lightbulb-outline`)
- **≥ 50%**: `#C3B382` → Medium warm light (`mdi:lightbulb`)
- **≥ 75%**: `#FFE79E` → Bright warm light (`mdi:lightbulb`)
- **≥ 100%**: `#FFE79E` → Maximum brightness (`mdi:lightbulb`)

The `mdi:lightbulb-outline` icon is used for lower brightness levels, while `mdi:lightbulb` is displayed when the light intensity increases.  
Thanks to the **linear** approach, the brightness smoothly transitions between these levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/light.png" alt="Image title" width="500"/>

#### 🌡️ Temperature

```yaml
type: custom:entity-progress-card
entity: sensor.xxx
attribute: temperature
unit: °C
min_value: -20
max_value: 45
theme: temperature
icon_tap_action:
  action: more-info
```

We can use `min_value` and `max_value` to define the range of values we want to represent with our color gradient.
We use predefined intervals, each associated with a specific color:

- -50°C - -30°C / -58°F - -22°F: `var(--deep-purple-color)`
- -30°C - -15°C / -22°F - 5°F: `var(--dark-blue-color)`
- -15°C - -2°C / 5°F - 28.4°F: `var(--blue-color)`
- -2°C - 2°C / 28.4°F - 35.6°F: `var(--light-blue-color)`
- 2°C - 8°C / 35.6°F - 46.4°F: `var(--cyan-color)`
- 8°C - 16°C / 46.4°F - 60.8°F: `var(--teal-color)`
- 16°C - 18°C / 60.8°F - 64.4°F: `var(--green-teal-color)`
- 18°C - 20°C / 64.4°F - 68°F: `var(--light-green-color)`
- 20°C - 25°C / 68°F - 77°F: `var(--success-color)`
- 25°C - 27°C / 77°F - 80.6°F: `var(--yellow-color)`
- 27°C - 29°C / 80.6°F - 84.2°F: `var(--amber-color)`
- 29°C - 34°C / 84.2°F - 93.2°F: `var(--deep-orange-color)`
- 34°C - 50°C / 93.2°F - 122°F: `var(--red-color)`

> [!IMPORTANT]
>
> Fahrenheit values are converted to apply the correct color.
> Make sure to set your unit to `°F` correctly in order to see the accurate color representation.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/temperature.png" alt="Image title" width="500"/>

#### 💧 Humidity

```yaml
type: custom:entity-progress-card
entity: sensor.xxx
attribute: humidity
theme: humidity
icon_tap_action:
  action: more-info
```

The `humidity` configuration defines how different humidity levels are represented with colors and icons.  
Unlike a linear gradient, this system uses predefined humidity ranges, each associated with a specific color and icon.

The ranges and their corresponding colors are as follows:

- 0% - 23%: `var(--red-color)` → Very dry air
- 23% - 30%: `var(--accent-color)` → Dry air
- 30% - 40%: `var(--yellow-color)` → Slightly dry air
- 40% - 50%: `var(--success-color)` → Optimal humidity
- 50% - 60%: `var(--teal-color)` → Comfortable humidity
- 60% - 65%: `var(--light-blue-color)` → Slightly humid air
- 65% - 80%: `var(--indigo-color)` → Humid air
- 80% - 100%: `var(--deep-purple-color)` → Very humid air

Each range is visually represented using the `mdi:water-percent` icon, ensuring a clear and intuitive display of humidity levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/humidity.png" alt="Image title" width="500"/>

#### 🦠 VOC

```yaml
type: custom:entity-progress-card
entity: sensor.xxx_voc
unit: ppb
decimal: 0
max_value: 300
theme: voc
icon_tap_action:
  action: more-info
```

The `voc` configuration defines how different levels of volatile organic compounds (VOCs) are represented using colors and icons.  
Instead of a linear gradient, this system categorizes VOC levels into predefined ranges, each associated with a specific color for better visualization.

The ranges and their corresponding colors are as follows:

- 0 - 300 ppb: `var(--success-color)` → Good air quality
- 300 - 500 ppb: `var(--yellow-color)` → Acceptable air quality
- 500 - 3000 ppb: `var(--accent-color)` → Moderate air quality
- 3000 - 25000 ppb: `var(--red-color)` → Poor air quality
- 25000 - 50000 ppb: `var(--deep-purple-color)` → Hazardous

> [!IMPORTANT]
>
> The information provided in this HA card is based on thresholds from the following [source](<https://support.getawair.com/hc/en-us/articles/19504367520023-Understanding-Awair-Score-and-Air-Quality-Factors-Measured-By-Awair-Element>).
> This color code is for informational purposes only and should not be taken as professional advice or a standard to follow. It is crucial to consult the device's official documentation or current standards for the most accurate and up-to-date information. In case of any discrepancy between the information provided here and the device's documentation or current standards, the latter shall prevail.
> The lower the value, the better it is generally considered to be.
> With this card you can use `custom_theme` to define your own ranges.

Each range is visually represented using the `mdi:air-filter` icon, ensuring a clear and intuitive display of VOC levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/voc.png" alt="Image title" width="250"/>

#### 🦠 PM 2.5

```yaml
type: custom:entity-progress-card
entity: sensor.xxx_pm25
unit: µg/m³
decimal: 0
max_value: 50
theme: pm25
icon_tap_action:
  action: more-info
```

The `pm25` configuration defines how different concentrations of fine particulate matter (PM2.5) are represented using colors and icons.  
Rather than a linear gradient, this system categorizes PM2.5 levels into predefined ranges, each mapped to a specific color for easy interpretation.

The ranges and their corresponding colors are as follows:

- 0 - 12 µg/m³: `var(--success-color)` → Good air quality
- 12 - 35 µg/m³: `var(--yellow-color)` → Moderate air quality
- 35 - 55 µg/m³: `var(--accent-color)` → Unhealthy for sensitive groups
- 55 - 150 µg/m³: `var(--red-color)` → Unhealthy air quality
- 150 - 200 µg/m³: `var(--deep-purple-color)` → Very unhealthy air quality

> [!IMPORTANT]
>
> The information provided in this HA card is based on thresholds from the following [source](<https://support.getawair.com/hc/en-us/articles/19504367520023-Understanding-Awair-Score-and-Air-Quality-Factors-Measured-By-Awair-Element>).
> This color code is for informational purposes only and should not be taken as professional advice or a standard to follow. It is crucial to consult the device's official documentation or current standards for the most accurate and up-to-date information. In case of any discrepancy between the information provided here and the device's documentation or current standards, the latter shall prevail.
> The lower the value, the better it is generally considered to be.
> With this card you can use `custom_theme` to define your own ranges.

Each range is visually represented using the `mdi:air-filter` icon, ensuring a clear and intuitive display of PM2.5 pollution levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/pm.png" alt="Image title" width="250"/>

### 🕹️ card_mod / animation

We can use `card_mod` to add dynamic animations to the icon, enhancing the visual experience and providing a more engaging user interface.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
name: RVB
icon: mdi:grain
color: rgb(110, 65, 171)
bar_color: rgb(110, 65, 171)
card_mod:
  style: |-
    .icon {
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
> We expose the `.icon` and `.shape` to properly animate the card.

### 🗃️ vertical-stack-in-card

We can use `vertical-stack-in-card` to group multiple cards into a cohesive layout.
This approach is particularly useful when combining custom cards while maintaining a
consistent design. Additionally, we leverage `auto-entities` to dynamically list entities
based on specific attributes or filters, allowing for flexible and automatic card
generation. Finally, `card_mod` is used to remove the borders and shadows, ensuring a
clean and seamless appearance.

_Example_:

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
            entity: this.entity_id # remove this line with auto-entities v1.14.1+
            name: sample
            theme: optimal_when_high
            icon_tap_action:
              action: more-info
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

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/stack.png" alt="Image title" width="500"/>

## 🗒️ Advanced usage

### The Laundry Mystery: Decoding Washer Entities Across Brands

#### Why?

Each washing machine brand has its own way of providing entities in Home Assistant. As a result, you often end up
with multiple entities that have different names depending on the integration used. This can make managing these
entities tricky, especially if you want a simple and clear card to track the standard elements of your washing machine.

The goal here is to simplify the display of important information related to your washing machine, regardless of the brand,
by centralizing key data such as operational status, progress percentage, and remaining time, while maintaining flexibility
to adapt to entity variations based on the integration used.

#### Searching for Entities

Before configuring your card, it's essential to research the specific entities for your washing machine integration.
To do this, you will need to explore Home Assistant's developer tools to pinpoint the necessary information.
Let’s take this personal integration as an example:

- **`sensor.washing_machine_operation_state`**: This entity is very specific to my washing machine brand and the **Home Connect** integration that comes with it. It tracks the machine's operation state (running, paused, etc.).
- **`sensor.washing_machine_progress_current_percentage`**: This is a custom sensor defined in `configuration.yaml`. The integration only reports a percentage when the machine is running. The template sets it to 0% when the integration reports 'unavailable'.
- **`sensor.washing_machine_remaining_program_time`**: This entity shows the estimated time left until the program finishes. However, the entity's name doesn't exactly match what the integration provides.

These entities are crucial for getting a complete overview of the washing machine’s status, but they vary significantly depending on the brand and integration.

#### Setting Up the Card

Once the entities are identified, you can configure your card in YAML to display the necessary information.

Below an example that is currently used:

```yaml
type: custom:entity-progress-card
entity: sensor.washing_machine_progress_current_percentage
name: Washing Machine
color: primary
tap_action:
  action: more-info
icon_tap_action:
  action: more-info
bar_color: primary
bar_size: large
badge_icon: >-
  {% if states('sensor.washing_machine_operation_state') == 'run'
  %}mdi:power-on{% else %}mdi:power-off {% endif %}
badge_color: >-
  {% if states('sensor.washing_machine_operation_state') == 'run' %} blue {%
  else %} disabled {% endif %}
name_info: >-
  {% if has_value('sensor.washing_machine_remaining_program_time') %} ready at
  {{ as_timestamp( states('sensor.washing_machine_remaining_program_time') ) |
  timestamp_custom('%H:%M', true) }}{% endif %}
```

In this example, the card displays:

- The progress percentage
- The operational status
- The remaining time

#### Conclusion

Using Jinja and custom entity configurations in Home Assistant provides advanced flexibility for adapting the card to the specifics of each washing machine.
With this approach, you can create a single card that works with different integrations while displaying relevant information in a clear and consistent
manner.

### Cracking a Complex Case with a Simple Helper

#### Why ?

We want to monitor a process and we have entities for:

- start time: states.sensor.print_puppy_start_time (time)
- finish time: states.sensor.print_puppy_end_time (time)
- and remaining time: sensor.print_puppy_remaining_time (min)

Our goal is to display the percentage of remaining time and show the remaining time in minutes. Unfortunately, the standard usage of this card cannot achieve what we need.
We read the README it seems to be impossible but...

#### Mathematical Model

Using a simple model, we can calculate the percentage of remaining time with:

$$P_{\text{remain}} = \frac{t_{\text{remain}}}{\Delta T} \times 100$$

Where:

- $P_{\text{remain}}$: Percentage of remaining time (the expected result).
- $t_{\text{remain}}$: Remaining time (in minutes).
- $\Delta T$: Total duration of the task (in minutes).

The good news is that we can use an entity to define the `max_value` and dynamically calculate the percentage. Therefore, we need to find a way to determine $\Delta T$.

#### How ?

We'll use a Helper (Number) to handle this calculation. It’s simple to define and can be set up according to various needs.

- Go to `settings` > `Devices and services` > `Helpers` > `Create Helper` > `Template` > `Template a number`
- Define the template to do the delta automatically

  - Choose a name and define your state template:

    ```yaml
    {% set start_time = states.sensor.print_puppy_start_time.state %}
    {% set end_time = states.sensor.print_puppy_end_time.state %}
    {% if start_time and end_time %}
      {{ ((as_datetime(end_time) - as_datetime(start_time)).days * 1440) + ((as_datetime(end_time) - as_datetime(start_time)).seconds / 60) | int }}
    {% else %}
      unknown
    {% endif %}
    ```

    > Check your syntax. Here, we are using entity values; therefore, we access the value through xxx.state. Sometimes, the value will be an attribute.

  - Set the minimum, maximum, step value, and unit accordingly.
  - Check the current value to ensure it’s working properly.

- Define the card:

  ```yaml
  type: custom:entity-progress-card
  entity: sensor.print_puppy_remaining_time
  max_value: number.totaldurationofthetask
  decimal: 0
  bar_color: green
  icon: mdi:clock-end
  ```

#### Conclusion

By implementing this model through the helper, we can accurately calculate and display the percentage of remaining time for any task. This approach provides a dynamic and intuitive way to monitor progress, ensuring that the displayed percentage accurately reflects the time remaining regardless of the task’s total duration. This solution effectively extend our card usage vision, and enhances the user experience.

### Don't Let It Expire !

This example is similar to the previous one that used a Home Assistant helper but relies more on system-level tools—offering potentially greater efficiency at the cost of increased system dependency.
We provide this example for illustration purposes only. Make sure to verify that no integration already exists before attempting this type of deployment. In the epilogue, I’ll suggest a more universal way to achieve the same result.

#### Why?

SSL certificates are critical for securing HTTPS connections. If one expires, it can make your services inaccessible — including your Home Assistant interface when accessed remotely.

The challenge?
Certificates (especially Let's Encrypt) usually last only 90 days, and it's easy to forget when they expire.

👉 The goal here is to automatically track how many days are left (countdown) before your SSL certificate expires and visually display this countdown as a color-coded progress bar in the Lovelace dashboard.

#### How?

Here, we're using a Home Assistant instance running in Docker with access to Linux commands.

We will:

- Create a custom command_line sensor that calculates the number of days until the certificate expires.
- Setup the card with the new sensor.
- Add dynamic color coding to indicate urgency (red when close to expiry, green when safe).

#### Implementation

- Create the command_line sensor, add this to your configuration.yaml (or sensors.yaml if split):

  ```yaml
  sensor:
    - platform: command_line
      name: "SSL Certificate Expiry"
      command: >
        echo $(( ($(date -u -d "$(curl -vI --insecure https://<hostname>:<port> 2>&1 | grep -i 'expire date' | awk -F': ' '{print $2}' | sed -E 's/Jan/01/; s/Feb/02/; s/Mar/03/; s/Apr/04/; s/May/05/; s/Jun/06/; s/Jul/07/; s/Aug/08/; s/Sep/09/; s/Oct/10/; s/Nov/11/; s/Dec/12/' | awk '{print $4"-"$1"-"$2" "$3}')" +%s) - $(date +%s) ) / 86400 ))
      unit_of_measurement: "days"
      scan_interval: 3600
  ```

  You'll need to adjust this part to match your specific environment.

- Add this card to your Lovelace dashboard:

  ```yaml
  type: custom:entity-progress-card
  entity: sensor.ssl_certificate_expiry
  name: SSL Certificate Expiry
  icon: mdi:certificate
  decimal: 0
  min_value: 0
  max_value: 90
  bar_orientation: rtl
  custom_theme:
    - min: 0
      max: 10
      color: red
    - min: 10
      max: 20
      color: yellow-color
    - min: 20
      max: 90
      color: green
  grid_options:
    columns: 12
    rows: 1
  ```

#### Conclusion

With this setup, Home Assistant becomes a proactive security monitor for your SSL certificates. You get a clear visual on how much time is left — and can renew in time to avoid downtime.

This method is reusable for any use case that can be monitored at the system level.

#### Epilogue

It was fun to develop and can certainly be used as-is, but in practice, it relies on Linux system commands, which makes it less portable than the previous examples.

Ultimately, to meet the original goal, we can simply enable the `cert_expiry` integration, which provides the certificate's expiration timestamp in a more standardized and platform-independent way. Home Assistant helpers are powerful tools, and whenever possible, they should be preferred to simplify implementation.

With `cert_expiry` entity we can define a template helper (number) to generate a countdown with :

- create the template helper
- define a name (number.cert_expiry_entity_id)
- define state template

  ```text
  {% set target = states('sensor.<cert_expiry_entity_id>') %}
  {% if target not in ['unknown', 'unavailable'] %}
    {% set target_ts = as_timestamp(target) %}
    {% set now_ts = as_timestamp(now()) %}
    {% set diff = (target_ts - now_ts) / 86400 %}
    {{ diff | round(1) if diff > 0 else 0 }}
  {% else %}
    unknown
  {% endif %}
  ```

- define min/max value: 0 and 90
- step: 1
- unit_of_measurement: days

Create the card:

```yaml
type: custom:entity-progress-card
entity: number.cert_expiry_entity_id
name: SSL Certificate Expiry
icon: mdi:certificate
decimal: 0
bar_orientation: rtl
custom_theme:
  - min: 0
    max: 10
    color: red
  - min: 10
    max: 20
    color: yellow
  - min: 20
    max: 90
    color: green
unit: "%"
state_content: state
grid_options:
  columns: 12
  rows: 1
```

Now you have a working solution that avoids operating system dependencies and is more efficient within Home Assistant's ecosystem.
Obviously, in the case of a Let's Encrypt certificate, it's recommended to :

- have a renewal process in place
- add a trigger to generate an alert before the certificate expires

This topics are beyond the scope of this guide.

## 🎨 Theme

### Token color

This card leverages Home Assistant’s default color system to seamlessly align with your active theme preferences.

When defining a color by name, we utilize the standard CSS color palette, which has evolved over time to include extended color keywords, X11 colors, and SVG colors (updated in 2022: <https://www.w3.org/TR/css-color-3/#svg-color>).

To maintain a consistent look & feel, we translate color names to Home Assistant's color definitions. We provide a list of these colors below. If a color is missing, please do not hesitate to let us know. If you choose a CSS-compatible color name that is not part of this list, the rendering will be as defined by the CSS standard.

| Color name | Card will use |
|---|---|
| primary | var(--primary-color) |
| accent | var(--accent-color) |
| red | var(--red-color) |
| pink | var(--pink-color) |
| purple | var(--purple-color) |
| deep-purple | var(--deep-purple-color) |
| indigo | var(--indigo-color) |
| blue | var(--blue-color) |
| light-blue | var(--light-blue-color) |
| cyan | var(--cyan-color) |
| teal | var(--teal-color) |
| green | var(--green-color) |
| light-green | var(--light-green-color) |
| lime | var(--lime-color) |
| yellow | var(--yellow-color) |
| amber | var(--amber-color) |
| orange | var(--orange-color) |
| deep-orange | var(--deep-orange-color) |
| brown | var(--brown-color) |
| light-grey | var(--light-grey-color) |
| grey | var(--grey-color) |
| dark-grey | var(--dark-grey-color) |
| blue-grey | var(--blue-grey-color) |
| black | var(--black-color) |
| white | var(--white-color) |
| disabled | var(--disabled-color) |

### Adapt to HA custom theme

By default, the progress bar uses a neutral/semi-transparent background color. However, depending on the theme in use, the color
`var(--divider-color)` might not provide enough contrast or might clash with your design (e.g., if your theme heavily uses greens or
dark shades).

We can define the `--epb-progress-bar-background-color` CSS variable. It allows you to customize the background color of the
progress bar, making it easier to visually integrate the card with your Home Assistant theme.

You can define this variable globally in your Home Assistant theme file, so it automatically applies to all instances of the card without needing to configure each one manually.

In your theme YAML:

```yaml
my_custom_theme:
  ····
  # Define a custom background color for the progress bar
  epb-progress-bar-background-color: "rgba(255, 255, 255, 0.12)"
```

> [!NOTE]
>
> When declaring it in your YAML theme file, do not prefix the variable name with `--`.
> Home Assistant handles this automatically.

Once set, the progress bar background will reflect the new color consistently across all cards using this variable.

## Entity Progress Card Template

This card is designed to handle more advanced use cases that aren't fully supported by the base card.
It avoids the need for custom helpers by allowing you to implement your desired mathematical modeling
directly through templating.

### 🎯 Purpose

The Entity Progress Card Template provides maximum flexibility for rendering entities with a customizable
progress bar, using dynamic content and calculations defined within your sensors or templates.

### 🛠️ Available Jinja Variables

| Variable      | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `secondary`   | Renders the secondary content (e.g., unit, status)                           |
| `name`        | Renders the customized entity name                                           |
| `badge_icon`  | Icon shown in the badge (can differ from the main icon)                      |
| `badge_color` | Color of the badge                                                           |
| `icon`        | Main icon                                                                    |
| `percent`     | Numerical value defining the progress (as a percentage)                      |
| `color`       | Dynamic color for icon and shape, adapted automatically using `ThemeManager` |
| `bar_color`   | Progress bar color, also dynamically adapted using `ThemeManager`            |

### ⚙️ Still Supported

The following options remain fully compatible with this new card:

- hide: Hide elements conditionally
- xyz_action: Configure custom actions (tap, hold, etc.)

### 🧠 Why Use This Card?

This card is ideal for situations where:

- You want to show calculated progress (e.g., level, usage, battery life)
- You need to apply dynamic logic or math modeling directly in the card
- The base card doesn't offer the required level of customization

### 👉 Example

```yaml
type: custom:entity-progress-card-dev-template
entity: light.led0
icon: |-
  {% if states('automation.secuswitch') == 'on' %}
    mdi:ab-testing
  {% else %}
    mdi:abacus
  {% endif %}
name: "{{ state_attr('light.led0', 'friendly_name') }}"
secondary: "{{ states('light.led0') }}"
badge_icon: |-
  {% if states('light.led0') == 'on' %}
    mdi:ab-testing
  {% else %}
    mdi:library
  {% endif %}
badge_color: |-
  {% if states('light.led0') == 'on' %}
    green
  {% else %}
    grey
  {% endif %}
percent: |-
  {% if states('light.led0') == 'on' %}
    {{ (state_attr('light.led0', 'brightness') | float * 100 / 255) | round(2) }}
  {% else %}
    0
  {% endif %}
color: |-
  {% if states('light.led0') == 'on' %}
    orange
  {% else %}
    grey
  {% endif %}
bar_color: |-
  {% if states('automation.secuswitch') == 'on' %}
    yellow
  {% else %}
    red
  {% endif %}
watermark:
  low: 10
tap_action:
  action: navigate
  navigation_path: /config
```

## 🌍 Language & Number Support

🌟 Our goal is to make this card a seamless and intuitive tool for users worldwide, eliminating language barriers and ensuring proper data formatting for every region. If you have suggestions for additional languages or formatting improvements, we’re always open to feedback!
To accommodate multilingual environments, the card defaults to the language set in the user's profile for optimal consistency and localization.

### 📖 Text Display

This card supports multiple languages to provide:

- Clear and localized information
- Context-specific error messages

We strive to make this card as inclusive as possible, with support for:

- 🇸🇦 `ar` - العربية (Arabic)
- 🇩🇰 `da` - Dansk
- 🇩🇪 `de` - Deutsch
- 🇬🇷 `el` - Ελληνικά
- 🇬🇧 `en` - English
- 🇫🇮 `fi` - Suomi
- 🇫🇷 `fr` - Français
- 🇭🇷 `hr` - Hrvatski
- 🇮🇹 `it` - Italiano
- 🇯🇵 `ja` - 日本語 (Japanese)
- 🇰🇷 `ko` - 한국어 (Korean)
- 🇲🇰 `mk` - Македонски
- 🇳🇴 `nb` - Norsk Bokmål
- 🇳🇱 `nl` - Nederlands
- 🇵🇱 `pl` - Polski
- 🇵🇹 `pt` - Português
- 🇷🇴 `ro` - Română
- 🇪🇸 `es` - Español
- 🇸🇪 `sv` - Svenska
- 🇹🇷 `tr` - Türkçe
- 🇨🇳 `zh` - 中文 (Chinese)

More languages may be added in the future to enhance accessibility!

### 🔢 Intelligent Number Formatting

Numbers are displayed based on your regional preferences, using:

- Your selected language settings (auto)
- Your specific format (manual selection)
- Or the system-defined format from your Home Assistant user profile

By default, the card uses standard Arabic numerals (0-9) for maximum compatibility.

## Error handling & Troubleshooting

### Error handling

This card includes error handling to prevent visual issues and ensure the UI stays clean and stable.
We handle two main categories of errors in the card:

1. **Configuration Errors**  
   These occur when the card is incorrectly set up in the Lovelace config.  
   Examples:
   - Missing entity ID
   - Invalid or unsupported attributes
   - Incorrect min/max values

2. **Runtime Errors (Entity State Issues)**  
   These happen while the card is running and are related to the entity’s current state.  
   Examples:
   - Entity is not found, unavailable or offline

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/errors.png" alt="Image title" width="500px"/>

### Troubleshooting

- Card not loading? Ensure the resource is correctly added to Lovelace.
- HACS not detecting the card? Clear your browser cache or restart Home Assistant.
- Want more features? Open a GitHub issue with your request!

## 👥 Contributing

Want to improve this card? Contributions are welcome! 🚀

## 📄 License

This project is licensed under the GPL-3.0 license.
