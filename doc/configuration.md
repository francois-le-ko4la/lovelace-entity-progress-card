<a id="top"></a>

# ⚙️ Full Configuration Reference

- [⚙️ Full Configuration Reference](#️-full-configuration-reference)
  - [🧩 entity-progress-card / entity-progress-badge](#-entity-progress-card--entity-progress-badge)
    - [Data Options](#data-options)
      - [`entity`](#entity)
      - [`attribute`](#attribute)
      - [`name`](#name)
      - [`unit`](#unit)
      - [`decimal`](#decimal)
      - [`min_value`](#min_value)
      - [`max_value`](#max_value)
      - [`max_value_attribute`](#max_value_attribute)
      - [`reverse`](#reverse)
      - [`state_content`](#state_content)
      - [`custom_info`](#custom_info)
      - [`name_info`](#name_info)
      - [`additions`](#additions)
    - [Styling Options](#styling-options)
      - [`icon`](#icon)
      - [`color`](#color)
      - [`badge_icon`](#badge_icon)
      - [`badge_color`](#badge_color)
      - [`bar_color`](#bar_color)
      - [`bar_size`](#bar_size)
      - [`bar_effect`](#bar_effect)
      - [`bar_orientation`](#bar_orientation)
      - [`force_circular_background`](#force_circular_background)
      - [`layout`](#layout)
      - [`frameless`](#frameless)
      - [`marginless`](#marginless)
      - [`height`](#height)
      - [`min_width`](#min_width)
      - [`reverse_secondary_info_row`](#reverse_secondary_info_row)
      - [`unit_spacing`](#unit_spacing)
      - [`center_zero`](#center_zero)
      - [`theme`](#theme)
      - [`custom_theme`](#custom_theme)
      - [`hide`](#hide)
      - [`disable_unit`](#disable_unit)
      - [`watermark`](#watermark)
    - [Behavior And Actions](#behavior-and-actions)
      - [`xyz_action`](#xyz_action)
  - [🧩 entity-progress-card-template](#-entity-progress-card-template)
    - [Common options](#common-options)
    - [Specific options](#specific-options)
      - [`name` (Jinja)](#name-jinja)
      - [`icon` (Jinja)](#icon-jinja)
      - [`secondary` (Jinja)](#secondary-jinja)
      - [`badge_icon` (Jinja)](#badge_icon-jinja)
      - [`badge_color` (Jinja)](#badge_color-jinja)
      - [`percent` (Jinja)](#percent-jinja)
      - [`color` (Jinja)](#color-jinja)
      - [`bar_color` (Jinja)](#bar_color-jinja)

<a id="-entity-progress-card--entity-progress-badge"></a>

## 🧩 entity-progress-card / entity-progress-badge

### Data Options

Options related to entity data, attributes, value display logic, and metadata.

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
> Supported entities are not hardcoded, ensuring flexibility. If you need a
> specific attribute, use the `attribute` parameter.

> [!IMPORTANT]
>
> Timer are supported (1.0.43). `attribute`, `min`, `max` parameters are not
> considered.

[🔼 Back to top](#top)

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

All entities that have an attribute containing a numeric value are supported. This
allows the card to work with a wide range of sensors, statistics, or other
entities exposing numeric data through their attributes.

Defining the attribute with the following is not supported:

- counter
- number
- duration
- timer

_default attribute:_

| entity (supported) | default attribute |
| :----------------- | :---------------- |
| cover.xxx          | current_position  |
| light.xxx          | brightness (%)    |
| fan.xxx            | percentage        |

[🔼 Back to top](#top)

#### `name`

> **`name`** string _(optional)_

The name displayed on the progress bar. If omitted, the entity's friendly name
will be used.

_Default_:

- `<entity_name>`

_Example_:

```yaml
type: custom:entity-progress-card
····
name: ABC
```

[🔼 Back to top](#top)

#### `unit`

> **`unit`** string _(optional)_

Allows representing standard unit.

_Unit selection_:

- If a `unit` is manually specified in the configuration, it will be used.
- Otherwise, if `max_value` is an entity, the default unit (%) will be used.
- Otherwise, the `unit` is automatically determined based on the current value:
  - If the entity is a `timer` the unit will be 's' (seconds).
  - If the entity is a `duration`:
    By default, the internal value in the card is expressed in seconds. If
    you do not specify a unit, we will display the duration based on what
    is defined in the Home Assistant entity, using a natural format (e.g.,
    2h 32min). If you want to display the value in seconds, set the unit
    to 's'. If you prefer a HH:MM:SS format, you can use either timer or
    flextimer.
  - If the entity is a `counter`, no unit ('') will be displayed.
  - Otherwise, the `unit` defined in Home Assistant for the entity will be
    used (e.g., °C, kWh, etc.).

> [!NOTE]
>
> Specifies the `unit` to display the entity's actual value, ignoring
> `max_value`. Even if the displayed value uses an automatically detected unit,
> the progress bar still relies on max_value to calculate the percentage.

> [!WARNING]
> Setting the unit to % will display the percentage value, while using a
> different unit will show the value of the primary entity. Switching between
> non-percentage units does not affect the displayed numeric value. For example,
> by default, a timer is shown in seconds. If the unit is changed from s
> (seconds) to min (minutes), no conversion is performed (for now), and the
> value remains unchanged.

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
- `flextimer` for timer (same than timer but truncate the display according to
  the current value)

> [!TIP]
>
> Disabling the Unit: To completely hide the unit from display, set the
> disable_unit option to true.

[🔼 Back to top](#top)

#### `decimal`

> **`decimal`** integer _(optional)_

Defines the number of decimal places to display for numerical values.

The `decimal` value will be determined based on the following priority:

- If `decimal` is explicitly set in the YAML configuration, it is used.
- Otherwise, if the entity has a custom `Display Precision` set in Home
  Assistant (i.e., a value manually configured by the user and different from
  the default), it is used.
- Otherwise, the `default` number of decimals is selected based on the type
  of value:
  - If the value represents a `timer`, the timer default is used.
  - If the value represents a `counter`, the counter default is used.
  - If the value represents a `duration`, or if the unit is one of j, d, h,
    min, s, or ms, the duration default is used.
  - If the unit is `%` (the default unit), the `percentage` default is
    used.
  - Otherwise, the other default is applied (for units like °C, kWh, etc.).

_Default values:_

- `decimal` = 0 for percentage (%)
- `decimal` = 0 for timers, durations, or time-based units (seconds, minutes,
  hours, etc.)
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

[🔼 Back to top](#top)

#### `min_value`

> **`min_value`** float _(optional, default: `0` or `-100`)_

Defines the minimum value to be used when calculating the percentage.

This allows the percentage to be relative to both a minimum (`min_value`, which
represents 0%) and a maximum (`max_value`, which represents 100%).

When `center_zero` is enabled, the default `min_value` is -100, offering a clearer and more intuitive display.

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

[🔼 Back to top](#top)

#### `max_value`

> **`max_value`** float|string _(optional, default: `100`)_

Allows representing standard values and calculating the percentage relative to
the maximum value. This value can be numeric (float/int) or an entity and real
value must be > 0.

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

[🔼 Back to top](#top)

#### `max_value_attribute`

> **`max_value_attribute`** string _(optional)_

The Home Assistant `max_value`'s attribute to display. `max_value` must be an
entity. See `attribute`.

[🔼 Back to top](#top)

#### `reverse`

[![Static Badge - reverse](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#reverse)

> **`reverse`** boolean _(optional, default: `false`)_

If set to true, it enables a countdown behavior (typically in seconds or
percentage), which is the standard use case for timers.

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

[🔼 Back to top](#top)

#### `state_content`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#state_content)

> **`state_content`** string|list _(optional)_:

Content to display for the state. Can be state, last_changed, last_updated, or
any attribute of the entity. Can be either a string with a single item, or a
list of string items. Default depends on the entity domain.

_Behavior_:

- If `state_content` is defined, the card will attempt to use the first listed
  attribute.
- If the attribute does not exist on the entity, `unknown` will be displayed
  immediately, and the card will check the next attributes.

_Accepted values_:

- state — Displays the entity's main state.
- current_position — Displays the current position attribute (commonly used
  for covers, blinds, etc.).
- Other custom attributes from the entity can also be listed.

> [!TIP]
>
> The use of this variable allows for adjusting the displayed information by
> simply specifying the attributes to be shown. This ensures the displayed
> information aligns with the user's language-specific preferences and is
> coherent with their localization settings. For complex cases, however,
> consider using the `custom_info` parameter, which offers a more
> straightforward solution.

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
> - The selected attribute is shown before the main numerical display on the
>   card.

- If an attribute listed does not exist, the card immediately displays
  unknown.
- This feature is useful for adding additional context (e.g., position,
  status...) to the main progress value.

[🔼 Back to top](#top)

#### `custom_info`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#custom_info)

> **`custom_info`** JINJA _(optional)_:

The `custom_info` option allows you to display additional, customizable text or
HTML next to the entity’s value. It supports full [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) and inline HTML, enabling you to style or conditionally format the
information based on sensor states or logic.
The keyword `entity` can be used to represent the entity defined at the card level.

_Useful for adding_:

- Supplementary sensor data
- Conditional status messages
- Inline styling (colors, emphasis, etc.)

> [!TIP]
>
> The real benefit of using `custom_info` lies in the advanced flexibility of
> Jinja, which allows for implementing complex logic or data transformations
> around the displayed value. This enables dynamic content tailored to the
> specific needs of your card and data. For simpler cases, however, consider
> using the `state_content` parameter, which offers a more straightforward
> solution.

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

[🔼 Back to top](#top)

#### `name_info`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#name_info)

> **`name_info`** JINJA _(optional)_:

The `name_info` option allows you to display additional, customizable text or
HTML next to the entity’s name. It supports full [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) and inline HTML, enabling you to style or conditionally format the
information based on sensor states or logic.
The keyword `entity` can be used to represent the entity defined at the card level.

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

[🔼 Back to top](#top)

#### `additions`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#additions)

> **`additions`** list _(optional)_

Displays multiple entities within the same card. Each entry follows the same
structure (`entity`/`attribute`) as a primary entity. Used to show combined
values and gradients.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.solar_power
additions:
  - entity: sensor.battery_power
  - entity: sensor.grid_power
    attribute: current_value
```

### Styling Options

Customize the look and feel: icons, layout, colors, sizes, and visual themes.

[🔼 Back to top](#top)

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

- Theme/Custom Theme: The icon derived from the theme or style applied to the
  item.
- Icon Parameter: A custom icon specifically defined for the item.
- Entity icon.

[🔼 Back to top](#top)

#### `color`

> **`color`** string _(optional)_

The color of the icon. Accepts [Token color](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/doc/theme.md#token-color),
color names, RGB values, or HEX codes. By default, the color is based on state, domain, and
device_class of your entity for `timer`, `cover`, `light`, `fan`, `climate` and `battery`.

_Examples:_ `"green"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`...

```yaml
type: custom:entity-progress-card
····
color: rgb(110, 65, 171)
```

[🔼 Back to top](#top)

#### `badge_icon`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#badge_icon)

> **`badge_icon`** JINJA _(optional)_:

The `badge_icon` option lets you display a dynamic badge, offering a quick
status hint or symbolic representation based on logic or sensor values.

This field supports templating using [Home Assistant Jinja2 s](https://www.home-assistant.io/docs/configuration/templating/), allowing the icon to be conditionally rendered. The keyword `entity` can be used to represent the entity defined at the card level.

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
> If the returns nothing (i.e., empty string or None), the badge will
> not be displayed.

[🔼 Back to top](#top)

#### `badge_color`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#badge_color)

> **`badge_color`** JINJA _(optional)_:

The `badge_color` option lets you setup a dynamic badge's background color,
offering a quick status hint or symbolic representation based on logic or
sensor values.

This field supports templating using [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/), allowing the icon to be conditionally rendered. The keyword `entity` can be used to represent the entity defined at the card level.

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

[🔼 Back to top](#top)

#### `bar_color`

> **`bar_color`** string _(optional, default: `var(--state-icon-color)`)_

The color of the progress bar. Accepts [Token color](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/doc/theme.md#token-color), color names,
RGB values, or HEX codes.

_Examples:_ `"blue"`, `"rgb(68, 115, 158)"`, `"#FF5733"`, `var(--state-icon-color)`

```yaml
type: custom:entity-progress-card
····
bar_color: rgb(110, 65, 171)
```

[🔼 Back to top](#top)

#### `bar_size`

> **`bar_size`** string ➡️ {`small`|`medium`|`large`|`xlarge`} _(optional, default: `small`)_

Customizes the appearance of the progress bar by selecting a predefined size.
Choose from small, medium, or large to adjust the visual scale of the bar.

_Example_:

```yaml
type: custom:entity-progress-card
····
bar_size: medium
```

`xlarge` can only be configured via YAML, and the interface automatically adjusts to accommodate the size of the progress bar.

[🔼 Back to top](#top)

#### `bar_effect`

> **`bar_effect`** string or list or JINJA _(optional)_

Defines visual effects applied to the progress bar. You can use a single effect
or combine multiple in a list.

_Available options_:

- radius: rounds the corners of the progress bar
- glass: adds a frosted glass effect to the progress bar
- gradient: applies a color gradient to the progress bar
- shimmer: adds a shimmering light animation across the bar

_Examples_:

```yaml
type: custom:entity-progress-card
····
bar_effect: radius
```

```yaml
type: custom:entity-progress-card
····
bar_effect:
  - radius
  - shimmer
  - gradient
```

```yaml
····
bar_effect: |-
  {% if states(xxx) | float > 22 %}
    shimmer, gradient
  {% else %}
    gradient
  {% endif %}
```

[🔼 Back to top](#top)

#### `bar_orientation`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#bar_orientation)

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
>
> While this parameter was originally designed for timers, it can be applied to
> any entity where a reversed progress bar is needed.

[🔼 Back to top](#top)

#### `force_circular_background`

> **`force_circular_background`** boolean _(optional: false)_

This option forces a **circular background** to be displayed behind the icon shown
on the card.

HA 2025.3 bring a lot of improvement and change the circular background
strategy: <https://www.home-assistant.io/blog/2025/03/05/release-20253/>

This card evaluate HA version and adapt it according to your entity domain and
your action strategy. If you want to avoid this strategy you can use this
parameter.

When set to `true`, a circular shape will appear behind the icon, regardless of
the HA version, entity domain or action defined. This helps create a cleaner,
more consistent visual appearance with Mushroom card.

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.living_room
force_circular_background: true
```

[🔼 Back to top](#top)

#### `layout`

> **`layout`** string ➡️ {`horizontal`| `vertical`} _(optional, default: `horizontal`)_:

Determines the layout of the elements inside the card. You can choose between
different layouts based on your visual preferences:

- `horizontal`: Displays the elements horizontally, with a row layout.
- `vertical`: Displays the elements vertically, with a column layout.

_Examples:_

```yaml
type: custom:entity-progress-card
····
layout: vertical
```

[🔼 Back to top](#top)

#### `frameless`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#frameless)

> **`frameless`** boolean _(optional, default: false)_

Allows you to remove the default Lovelace card styling: the border and background
color. When set to `true`, the card blends seamlessly into the interface or can
be embedded in other designs without visual interference.

_Compatibility_:

| **Card**                 | **Compatible**       | **Notes**                                                                                          |
| :----------------------- | :------------------- | :------------------------------------------------------------------------------------------------- |
| `entities`               | ✅ Yes               | Automatically detected and styled. No need to set `frameless`.                                     |
| `vertical-stack-in-card` | ✅ Yes               | Automatically detected and styled. No need to set `frameless`.                                     |
| `vertical-stack`         | ✅ Yes               | Rendered with a frame by default — use `frameless` to remove it if desired.                        |
| `horizontal-stack`       | ⚠️ Yes, with caveats | Only works reliably in Masonry view. Rendered with a frame by default — use `frameless` if needed. |

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.living_room
frameless: true
```

[🔼 Back to top](#top)

#### `marginless`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#marginless)

> **`marginless`** boolean _(optional, default: false)_

Removes vertical margin, creating a more compact layout.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
marginless: true
```

[🔼 Back to top](#top)

#### `height`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#height)

> **`height`** string (optional)

Sets the height (e.g., 120px, 10em, 30%) for the card.
Useful for ensuring consistent layout in horizontal stacks or grids.

> [!NOTE]
>
> If the main objective is to reduce the size, test the `marginless` parameter before adjusting the `height`.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
height: 140px
```

[🔼 Back to top](#top)

#### `min_width`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#min_width)

> **`min_width`** string (optional)

Sets a minimum width (e.g., 120px, 10em, 30%) for the card, badge or template.
Useful for ensuring consistent layout in horizontal stacks or grids.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
min_width: 140px
```

[🔼 Back to top](#top)

#### `reverse_secondary_info_row`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#reverse_secondary_info_row)

> **`reverse_secondary_info_row`** boolean _(optional, default: false)_

Reverses the order of the progress bar and the secondary info when using a
horizontal layout.

When set to `true`, the secondary info appears to the right of the progress bar
instead of the left. Useful for emphasizing the progress visually by aligning
it first, or for adapting to specific design preferences.

```yaml
type: custom:entity-progress-card
entity: timer.living_room
reverse_secondary_info_row: true
```

[🔼 Back to top](#top)

#### `unit_spacing`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#unit_spacing)

> **`unit_spacing`** string ➡️ {`auto`|`space`|`no-space`} _(optional, default: `auto`)_

Defines whether a space should appear between numeric values and units, either
following locale rules or overriding them explicitly.

- `auto`: Uses locale-specific formatting rules (e.g., France → space, US → no
  space)
- `space`: Forces a space between number and unit (e.g., 80 %), regardless of
  locale
- `no-space`: Forces no space between number and unit (e.g., 80%), regardless
  of locale

[🔼 Back to top](#top)

#### `center_zero`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#center_zero)

> **`center_zero`** boolean _(optional, default: `false`)_

Centers the progress bar at zero, allowing for better visualization of values that
fluctuate around zero (e.g., positive/negative changes).

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.energy_balance
center_zero: true
```

[🔼 Back to top](#top)

#### `theme`

> **`theme`** string ➡️ {`optimal_when_low`|`optimal_when_high`|`light`|`temperature`|`humidity`|`pm25`|`voc`} _(optional)_

Allows customization of the progress bar's appearance using a predefined theme.
This theme dynamically adjusts the `icon`, `color` and `bar-color` parameters
based on the battery level, eliminating the need for manual adjustments or
complex Jinja2 s.

_Example_:

```yaml
type: custom:entity-progress-card
····
theme: light
```

> [!WARNING]
> The `battery`, `cpu`, and `memory` parameters are deprecated and SHOULD no
> longer be used. Although these parameters are still valid, they MUST be
> replaced by `optimal_when_low` or `optimal_when_high`. These new parameters,
> introduced in version `1.1.7`, eliminate the need for multiple theme
> definitions and are sufficient to replace the deprecated themes.

[🔼 Back to top](#top)

#### `custom_theme`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#custom_theme)

> **`custom_theme`** map list _(optional)_

Defines a list of custom theme rules based on value ranges. Setting this
variable disables the theme variable. This variable can only be defined in
YAML.

_Map definition:_

- min [number] (required): The minimum value for this range.
- max [number] (required): The maximum value for this range.
- color [string] (\*): The color of the icon and the progress bar.
- icon_color [string] (\*): Color specifically for the icon.
- bar_color [string] (\*): Color specifically for the progress bar.
- icon [string] (optional): The icon to display.

(\*): each object in the custom_theme list must contain at least one of this
following color-related keys.

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
> [`min`, `max`[ / [`min`, `max`) : The range includes the min value but
> excludes the max value.

> [!IMPORTANT]
>
> Please ensure your themes follow these guidelines: Each interval must be
> valid, respecting the rule `min` < `max`. The transitions between ranges
> should be seamless, with each max connecting smoothly to the next min to avoid
> gaps or overlaps. If a value falls below the lowest defined interval, the
> lowest range will be applied, while values exceeding the highest interval will
> use the highest range.
>
> This is an advanced feature that may require some trial and error during
> customization. For a seamless editing experience, if the theme definition is
> incorrect, the card simulation will revert to a standard configuration and
> ignore the `custom_theme` definition.

> [!TIP]
>
> If you wish to define colors for discontinuous ranges, you will need to create
> intermediary ranges to ensure continuity, using default colors such as
> `var(--state-icon-color)` for these filler ranges.

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

[🔼 Back to top](#top)

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

[🔼 Back to top](#top)

#### `disable_unit`

> **`disable_unit`** boolean _(optional, default: `false`)_

Disables the display of the unit when set to `true`. If not defined or set to
`false`, the unit will be shown.

_Example_:

```yaml
type: custom:entity-progress-card
····
disable_unit: true
```

[🔼 Back to top](#top)

#### `watermark`

[![Static Badge](https://img.shields.io/badge/YAML-Only-orange.svg?style=flat)](#watermark)

> **`watermark`** map _(optional)_:

The `watermark` option allows you to visually highlight specific value
thresholds (low and high) within the progress bar, helping you better interpret
the current state at a glance.

_Map definition_:

- `high` (number): The upper value where the bar will start indicating a high
  zone (0–100).
- `high_color` (string): The CSS color used for the high watermark zone (can
  be a name or hex).
- `low` (number): The lower value where the bar starts highlighting a low zone
  (0–100).
- `low_color` (string): The CSS color used for the low watermark zone.
- `type` (string): Defines the style of the watermark overlay.
  - `blended` (default): A subtle colored overlay that merges with the
    bar’s colors for a more integrated look.
  - `area`: A soft transparent shape placed over the bar, without blending
    into the bar's colors.
  - `striped`: Diagonal stripes for a patterned effect.
  - `triangle`: Triangle shapes as a watermark.
  - `round`: Rounded shapes applied as a watermark.
  - `line`: Vertical lines pattern (like a hatch effect).
- `line_size` (string): Defines the thickness of the lines when the watermark
  type is 'line' (e.g., "3px").
- `opacity` (number): Adjusts the transparency of the watermark overlay (from
  0 = fully transparent to 1 = fully opaque).
- `disable_low` (boolean): If set to true, disables the low watermark display.
- `disable_high` (boolean): If set to true, disables the high watermark
  display.

_Example_:

```yaml
type: custom:entity-progress-card
····
watermark:
  type: striped     # red and yellow stripes
  high: 80          # 🔺 Upper threshold (e.g., max recommended battery level)
  high_color: red   # 🎨 Color to indicate the high watermark zone
  low: 10           # 🔻 Lower threshold (e.g., minimum safe battery level)
  low_color: yellow # 🎨 Color to indicate the low watermark zone
```

Thanks to automatic **unit detection**, the card intelligently interprets your
thresholds depending on the entity’s native unit.

### Behavior And Actions

Define interactions on tap, double tap, or hold gestures.

[🔼 Back to top](#top)

#### `xyz_action`

> **`xyz_action`** map ➡️ {action: {`more-info` | `toggle` | `perform-action` | `navigate` | `url` | `assist` | `none`}...} _(optional)_

_`xyz_action`_:

- `tap_action`: Defines the behavior when a user taps on the card. The action
  could be a navigation, toggle, or any other pre-defined action.
- `double_tap_action`: Defines the behavior when a user double-taps on the
  card. This can be used to trigger a different action from the regular tap.
- `hold_action`: Defines the behavior when the user holds down (long press) on
  the card. This is often used for actions that should only be triggered with a
  longer press.
- `icon_tap_action`: Defines the behavior when the user taps on the icon
  (typically an icon on a card). This action can be different from the
  general tap_action of the card.
- `icon_double_tap_action`: Defines the behavior when the user double-taps on
  the icon. This can be used to trigger an alternative action from the regular
  icon_tap_action.
- `icon_hold_action`: Defines the behavior when the user holds down (long
  press) on the icon. This action might be used for a different, more powerful
  interaction compared to the regular tap or double tap.

> [!NOTE]
>
> `xyz_action` ensures consistency with standard Home Assistant cards, allowing
> users to switch efficiently and seamlessly to this card. All available options
> and usage details can be found in the official Home Assistant documentation
> for actions: <https://www.home-assistant.io/dashboards/actions/>.

> [!IMPORTANT]
>
> `icon_*_action` is not supported for badges.

_Available actions_:

- **`default`**: The default action.
- **`more-info`**: Opens the entity's information dialog.
- **`toggle`**: Toggles the state of the entity (e.g., turning a light on or
  off).
- **`perform-action`**: Executes a specific Home Assistant service call or
  action.
- **`navigate`**: Navigates to a specific Lovelace view (requires
  `navigation_path`).
- **`url`**: Opens a URL in the browser (requires `url_path`).
- **`assist`**: Triggers a Home Assistant assistant action (like voice
  interaction).
- **`none`**: Disables the tap action, meaning no action will be triggered.

_Options:_

- `navigation_path` _path_: Lovelace path to navigate to (e.g.,
  /lovelace/lights).
- `url_path` _url_: URL to open when action is 'url' (e.g.,
  <https://example.com>).
  ...

_Default:_

- tap_action: `more-info`
- hold_action: `none`
- double_tap_action: `none`
- icon_tap_action:
  - `toggle` if the entity is a `light`, `switch`, `fan`, `input_boolean`,
    or `media_player`
  - `none` otherwise
- icon_hold_action: `none`
- icon_double_tap_action: `none`

> [!NOTE]
>
> We have merged the functionalities of `navigate_to` and `show_more_info` into
> `tap_action`. Consequently, these two options have been **deprecated**,
> **disabled**, and will no longer be supported in **v1.2.0**.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.living_room
····
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

> [!NOTE]
> It's possible to specify a different entity for an action. For example, this can be useful if you want the `more-info`
> popup to display information for a different entity to the one used in the progress card. As shown below, the progress
> card shows a stacked bar chart with `pv1_power` and `pv2_power`, but displays `pv_total_power` when tapped.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.pv1_power
additions:
  - entity: sensor.pv2_power
····
tap_action:
  action: more-info
  entity: sensor.pv_total_power
```

## 🧩 entity-progress-card-template

### Common options

These options are the same as those of the `entity-progress-card` and are available for templates as well:

| **Option**                  | **Description**                                                                              | **Documentation**                   |
| :-------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------------- |
| **Data Options**            |                                                                                              |                                     |
| `entity`                    | Entity ID.                                                                                   | [Link](#entity)                     |
| **Styling Options**         |                                                                                              |                                     |
| `bar_size`                  | Customize the size or thickness of the progress bar.                                         | [Link](#bar_size)                   |
| `bar_orientation`           | Define the direction of the progress bar (e.g., `ltr`, `rtl`).                               | [Link](#bar_orientation)            |
| `force_circular_background` | Force icon circle background.                                                                | [Link](#force_circular_background)  |
| `layout`                    | Adjust the overall layout (e.g., `horizontal`, `vertical`).                                  | [Link](#layout)                     |
| `frameless`                 | Remove the default card border and background for a seamless, flat appearance.               | [Link](#frameless)                  |
| `marginless`                | Remove vertical margin for a more compact template display.                                  | [Link](#marginless)                 |
| `min_width`                 | Set a minimum width for the template to ensure consistent layout.                            | [Link](#min_width)                  |
| `reverse_secondary_info_row`| Flip info bar layout.                                                                        | [Link](#reverse_secondary_info_row) |
| `center_zero`               | Center the bar on 0.                                                                         | [Link](#center_zero)                |
| `hide`                      | Hide parts of the card.                                                                      | [Link](#hide)                       |
| `watermark`                 | Adds min/max overlays.                                                                       | [Link](#watermark)                  |
| **Behavior & Actions**      |                                                                                              |                                     |
| `xyz_action`                | Configure custom actions (e.g., `tap`, `hold`, etc.).                                        | [Link](#xyz_action)                 |

### Specific options

#### `name` (Jinja)

> **`name`** JINJA ➡️ string

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`name`](#name).

[🔼 Back to top](#top)

#### `icon` (Jinja)

> **`icon`** JINJA ➡️ string  

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`icon`](#icon).

[🔼 Back to top](#top)

#### `secondary` (Jinja)

> **`secondary`** JINJA ➡️ string

Renders the secondary content (e.g., unit, status, additional info).

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).

[🔼 Back to top](#top)

#### `badge_icon` (Jinja)

> **`badge_icon`** JINJA ➡️ string

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`badge_icon`](#badge_icon).

[🔼 Back to top](#top)

#### `badge_color` (Jinja)

> **`badge_color`** JINJA ➡️ string

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`badge_color`](#badge_color).

[🔼 Back to top](#top)

#### `percent` (Jinja)

> **`percent`** JINJA ➡️ numeric

Numerical value representing the progress state.

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).

[🔼 Back to top](#top)

#### `color` (Jinja)

> **`color`** JINJA ➡️ string

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`color`](#color).

[🔼 Back to top](#top)

#### `bar_color` (Jinja)

> **`bar_color`** JINJA ➡️ string

The result of jinja expression should be a string.

See [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/).  
See [`bar_color`](#bar_color).

[🔼 Back to top](#top)
