<a id="top"></a>

# ⚙️ Full Configuration Reference

- [⚙️ Full Configuration Reference](#️-full-configuration-reference)
  - [Introduction](#introduction)
  - [Conventions](#conventions)
    - [Input types](#input-types)
      - [String](#string)
      - [Float](#float)
      - [Integer](#integer)
      - [Boolean](#boolean)
      - [List (Array)](#list-array)
      - [Map (Object)](#map-object)
      - [JINJA](#jinja)
    - [Option description](#option-description)
      - [Structure](#structure)
      - [Badges](#badges)
        - [Compatibility](#compatibility)
        - [YAML Only](#yaml-only)
      - [Parameter specification](#parameter-specification)
        - [Supported values](#supported-values)
        - [Jinja](#jinja)
      - [Typical description](#typical-description)
  - [🧩 entity-progress-card / entity-progress-badge / entity-progress-feature](#standard)
    - [Data Options](#data-options)
      - [`entity`](#entity)
      - [`attribute`](#attribute)
      - [`name`](#name)
      - [`unit`](#unit)
      - [`decimal`](#decimal)
      - [`min_value`](#min_value)
      - [`max_value`](#max_value)
      - [`reverse`](#reverse)
      - [`state_content`](#state_content)
      - [`custom_info`](#custom_info)
      - [`multiline`](#multiline)
      - [`name_info`](#name_info)
      - [`bar_stack`](#bar_stack)
    - [Styling Options](#styling-options)
      - [`icon`](#icon)
      - [`color`](#color)
      - [`icon_animation`](#icon_animation)
      - [`badge_icon`](#badge_icon)
      - [`badge_color`](#badge_color)
      - [`bar_color`](#bar_color)
      - [`bar_size`](#bar_size)
      - [`bar_position`](#bar_position)
      - [`bar_single_line`](#bar_single_line)
      - [`bar_segments`](#bar_segments)
      - [`bar_effect`](#bar_effect)
      - [`bar_color_mode`](#bar_color_mode)
      - [`bar_scale`](#bar_scale)
      - [`bar_max_width`](#bar_max_width)
      - [`bar_orientation`](#bar_orientation)
      - [`force_circular_background`](#force_circular_background)
      - [`trend_indicator`](#trend_indicator)
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
      - [`interpolate`](#interpolate)
      - [`hide`](#hide)
      - [`disable_unit`](#disable_unit)
      - [`watermark`](#watermark)
      - [`alert_when`](#alert_when)
    - [Behavior And Actions](#behavior-and-actions)
      - [`xyz_action`](#xyz_action)
  - [🧩 entity-progress-card-template / entity-progress-badge-template](#template)
    - [Common options](#common-options)
    - [Specific options](#specific-options)
      - [`name` (Jinja)](#name-jinja)
      - [`icon` (Jinja)](#icon-jinja)
      - [`secondary` (Jinja)](#secondary-jinja)
      - [`percent` (Jinja)](#percent-jinja)
      - [`color` (Jinja)](#color-jinja)
      - [`bar_color` (Jinja)](#bar_color-jinja)

## Introduction

This document provides an in-depth overview of all available options,
accompanied by detailed examples to help you configure the system precisely to
your needs. Whether you’re optimizing for customizing features, or ensuring
compatibility, this guide will serve as your comprehensive reference.

## Conventions

In this documentation, the following types are used to describe configuration
parameters. Here is what they mean:

### Input types

#### String

A sequence of characters, including letters, numbers, or symbols.

Example:

```yaml
option: 'xyz'
```

[🔼 Back to top]

#### Float

A number that may include a decimal point (e.g., 3.14). Can also represent
negative values.

_Example_:

```yaml
option: -1.3
```

[🔼 Back to top]

#### Integer

A whole number. In this context, only positive integers are allowed (i.e., no
decimals, no negatives).

_Example_:

```yaml
option: 1
```

[🔼 Back to top]

#### Boolean

A value that can be either `true` or `false`. It is typically used for toggling
features on or off.

_Example_:

```yaml
option: true
```

[🔼 Back to top]

#### List (Array)

An ordered collection of elements, which can contain multiple values. Each
element can be of any type. In YAML, this corresponds to a list indicated with
dashes (`-`).

_Example_:

```yaml
option:
  - item1
  - item2
  - item3
```

[🔼 Back to top]

#### Map (Object)

A set of key-value pairs, also called a dictionary or map. Each key is
associated with a value that can be of any type.

_Example_:

```yaml
object:
  key1: value1
  key2: value2
```

[🔼 Back to top]

#### JINJA

A static string or a Jinja template.

This field supports templating using [Home Assistant Jinja2
templates][ha-jinja], allowing the option to be conditionally rendered.

The expression is evaluated in the context of the entity's state and attributes.
The keyword `entity` can be used to represent the entity defined at the card
level, so you don't have to repeat the entity ID in every Jinja field.

> [!IMPORTANT]
>
> `entity` is only defined when the card's own `entity` option is set. If it's
> omitted, `entity` doesn't exist in the template context at all (not an empty
> string) — using it then raises a Jinja error rather than rendering nothing.

_Example_:

```yaml
type: custom:entity-progress-card-template
entity: sensor.sma_current_day_yield
secondary: '{{ states(entity, with_unit=True) }}'
```

##### Supported HTML

Fields that render Jinja results as HTML (`name`, `secondary`, `custom_info`,
`name_info`) are **sanitized** before injection. Only the following markup is
kept — everything else is stripped while its text content is preserved:

- **Tags**: `<b>`, `<i>`, `<u>`, `<span>`, `<div>`
- **Attributes**: `class`, and `style` limited to `color` and `background-color`

Scripts, event handlers (`onclick`, `onerror`, …), iframes, links and images are
always removed. This protects your dashboard when a template interpolates
strings you don't control (media titles, network device names, …).

> [!NOTE]
>
> `<br>` is not in that list — it's handled separately, only on
> `custom_info`/`secondary`, only when [`multiline`](#multiline) is `true`. Any
> other `<br>` (including in `name`/`name_info`, which have no multiline mode at
> all) is stripped rather than kept, since none of these fields can wrap onto a
> second line outside that one opt-in case.

_Example_:

```yaml
option: "{{ state_attr('sensor.temperature', 'unit_of_measurement') }}"
```

[🔼 Back to top]

### Option description

#### Structure

Each configuration option in this documentation follows a consistent structure
to ensure clarity and ease of use:

- **Title**  
  The name of the option, as used in the configuration file.

- **Badge**  
  Badge to identify the compatibility

- **Parameter specification**  
  This format provides a quick reference for parameter types, valid values, and
  default settings without reading full descriptions.

- **Description**  
  A detailed explanation of what the option does, how it behaves, and any
  specific behavior or rules. If the option supports special values (e.g.,
  `auto`, `null`, etc.), they should be mentioned here.

- **Example**  
  A concrete configuration snippet in YAML showing how the option is typically
  used. When possible, the example should reflect a realistic or common use
  case.

- **Notes** _(optional)_  
  Any additional details, edge cases, limitations, or version compatibility
  notes that may help advanced users or clarify uncommon behavior.

[🔼 Back to top]

#### Badges

##### Compatibility

Throughout this documentation, compatibility badges indicate which components
work with specific configuration options:

| Badge                                                    | Component                     | Description                                          |
| :------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| [![Card OK][Card-OK]](#compatibility)                    | **Card Compatible**           | This option works with the main card display         |
| [![Badge OK][Badge-OK]](#compatibility)                  | **Badge Compatible**          | This option works with the card badge feature        |
| [![Feature OK][Feature-OK]](#compatibility)              | **Tile Feature Compatible**   | This option works with the tile feature              |
| [![Template OK][Template-OK]](#compatibility)            | **Template Compatible**       | This option supports Jinja2 templating               |
| [![Badge Template OK][BadgeTemplate-OK]](#compatibility) | **Badge Template Compatible** | This option supports Jinja2 templating within badges |

##### YAML Only

The following badge is used throughout this documentation:

[![YAML Only][yaml-only]](#yaml-only)

These options are not available in the visual card editor and must be configured
manually in YAML mode.

[🔼 Back to top]

#### Parameter specification

This syntax provides an instant overview of configuration options, making it
easier to set up parameters correctly.

##### Supported values

When an option only accepts a predefined set of values, we indicate it using the
➡️ symbol, followed by the list of allowed choices.

_Example_:

> **`layout`** [String] ➡️ {`horizontal`| `vertical`} _(optional, default:
> `horizontal`)_:

##### Jinja

When an option supports a Jinja template, we use the ➡️ symbol to indicate the
type of value that the Jinja expression must return. This helps ensure the
template produces the correct data type expected by the configuration.

_Example_:

> **`name`** [JINJA] ➡️ string

[🔼 Back to top]

#### Typical description

**`title`**

[![Card OK][Card-OK]](#compatibility)

> **`option`** type _(required/optional, default: xyz)_

Description of this awesome option.

_Example_:

```yaml
option: sensor.hp_envy_6400_series_tri_color_cartridge
```

> [!NOTE]
>
> the most important note!

[🔼 Back to top]

<a id="standard"></a>

## 🧩 entity-progress-card / entity-progress-badge / entity-progress-feature

### Data Options

Options related to entity data, attributes, value display logic, and metadata.

#### `entity`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`entity`** [String] _(required)_

Entity ID.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
```

> [!NOTE]
>
> This parameter is optional with `entity-progress-card-template` and
> `entity-progress-badge-template`

> [!NOTE]
>
> Supported entities are not hardcoded, ensuring flexibility. If you need a
> specific attribute, use the `attribute` parameter.

> [!IMPORTANT]
>
> Timers are supported (1.0.43). `attribute`, `min`, `max` parameters are not
> considered.

[🔼 Back to top]

#### `attribute`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`attribute`** [String] _(optional)_

The Home Assistant entity's attribute to display.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.led0
attribute: brightness
```

_Supported entities:_

All entities that have an attribute containing a numeric value are supported.
This allows the card to work with a wide range of sensors, statistics, or other
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

[🔼 Back to top]

#### `name`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`name`** [String] _(optional)_

The name displayed on the progress bar. If omitted, the entity's `friendly name`
will be used.

_Default_:

- `<entity_name>`

_Simple Usage_:

You can provide a simple string for a static label.

```yaml
type: custom:entity-progress-card
····
name: ABC
```

_Advanced Usage_:

To build a dynamic name, you can provide a list of objects. This allows you to
combine static text with Home Assistant metadata. Elements are concatenated with
a space automatically.

```yaml
type: custom:entity-progress-card
····
name:
  - type: text
    text: my text
  - type: area
  - type: device
  - type: entity
  - type: floor
```

_Accepted types_:

| Type   | Description                                                        |
| ------ | ------------------------------------------------------------------ |
| text   | Displays static text. Requires the `text` key.                     |
| entity | Displays the name of the card's configured entity.                 |
| area   | Displays the name of the Area associated with the entity.          |
| device | Displays the name of the Device associated with the entity.        |
| floor  | Displays the name of the Floor where the entity's area is located. |

[🔼 Back to top]

#### `unit`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`unit`** [String] _(optional)_

Allows representing standard unit.

_Unit selection_:

- If a `unit` is manually specified in the configuration, it will be used.
- Otherwise, if `max_value` is an entity, the default unit (%) will be used.
- Otherwise, the `unit` is automatically determined based on the current value:
  - If the entity is a `timer` the unit will be 's' (seconds).
  - If the entity is a `duration`: By default, the internal value in the card is
    expressed in seconds. If you do not specify a unit, we will display the
    duration based on what is defined in the Home Assistant entity, using a
    natural format (e.g., 2h 32min). If you want to display the value in
    seconds, set the unit to 's'. If you prefer a HH:MM:SS format, you can use
    either timer or flextimer.
  - If the entity is a `counter`, no unit ('') will be displayed.
  - Otherwise, the `unit` defined in Home Assistant for the entity will be used
    (e.g., °C, kWh, etc.).

> [!NOTE]
>
> Specifies the `unit` to display the entity's actual value, ignoring
> `max_value`. Even if the displayed value uses an automatically detected unit,
> the progress bar still relies on max_value to calculate the percentage.

> [!WARNING]
>
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
- `flextimer` for timer (same as timer but truncate the display according to the
  current value)

> [!TIP]
>
> Disabling the Unit: To completely hide the unit from display, use
> `hide: ['unit']` (see [`hide`](#hide)).

[🔼 Back to top]

#### `decimal`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`decimal`** [Integer] _(optional)_

Defines the number of decimal places to display for numerical values.

The `decimal` value will be determined based on the following priority:

- If `decimal` is explicitly set in the YAML configuration, it is used.
- Otherwise, if the entity has a custom `Display Precision` set in Home
  Assistant (i.e., a value manually configured by the user and different from
  the default), it is used.
- Otherwise, the `default` number of decimals is selected based on the type of
  value:
  - If the value represents a `timer`, the timer default is used.
  - If the value represents a `counter`, the counter default is used.
  - If the value represents a `duration`, or if the unit is one of j, d, h, min,
    s, or ms, the duration default is used.
  - If the unit is `%` (the default unit), the `percentage` default is used.
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

[🔼 Back to top]

#### `min_value`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`min_value`** [Float]|[Map] _(optional, default: `0` or `-100`)_

Defines the minimum value to be used when calculating the percentage.

This allows the percentage to be relative to both a minimum (`min_value`, which
represents 0%) and a maximum (`max_value`, which represents 100%).

When `center_zero` is enabled and `min_value` isn't set, it defaults to the
negative of `max_value` instead of `0` — e.g. `-100` if `max_value` is also left
at its default, or `-3000` if `max_value: 3000`. Without this, the negative half
would have no range at all (`0` to `0`) and could never show anything. Set
`min_value` explicitly (even to `0`) to override this.

`min_value` accepts three forms — like `max_value`, each mode uses its own
explicit key, so there is nothing to guess from the value's shape:

- a fixed numeric value (float or integer) — same as before,
- `{ entity: ..., attribute: ... }` — an entity ID whose state is used as the
  minimum (`attribute` is optional, to read a specific attribute instead of the
  state),
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, a chip selector (Fixed value / Entity / Template) lets you
switch between the three modes.

> [!NOTE]
>
> The Jinja mode is available on the Card and the Badge. On the Tile Feature,
> only the fixed value and entity modes apply.

_Fixed value example_:

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

_Entity example_:

```yaml
type: custom:entity-progress-card
····
min_value:
  entity: sensor.night_baseline_power
  attribute: today  # optional
```

_Jinja example_:

```yaml
type: custom:entity-progress-card
····
min_value:
  jinja: "{{ states('input_number.floor') | float }}"
```

[🔼 Back to top]

#### `max_value`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`max_value`** [Float]|[Map] _(optional, default: `100`)_

Allows representing standard values and calculating the percentage relative to
the maximum value. Real value must be > 0.

`max_value` accepts three forms — like `min_value`, each mode uses its own
explicit key, so there is nothing to guess from the value's shape:

- a fixed numeric value (float or integer) — same as before,
- `{ entity: ..., attribute: ... }` — an entity ID whose state is used as the
  maximum (`attribute` is optional, to read a specific attribute instead of the
  state),
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, a chip selector (Fixed value / Entity / Template) lets you
switch between the three modes.

> [!NOTE]
>
> The Jinja mode is available on the Card and the Badge. On the Tile Feature,
> only the fixed value and entity modes apply.

> [!IMPORTANT]
>
> Prior to 1.6, `max_value` also accepted a bare entity ID string
> (`max_value: sensor.xxx`), disambiguated from a fixed value at runtime by its
> type. **This form is deprecated** (a console warning is logged) but still
> works — it is automatically migrated to the map form for you, together with
> the also-deprecated `max_value_attribute` option. Please update your YAML to
> the new form when convenient.

_Default_:

- `100`

_Fixed value example_:

```yaml
type: custom:entity-progress-card
····
max_value: 255
```

_Entity example_:

```yaml
type: custom:entity-progress-card
····
max_value:
  entity: sensor.total_capacity
  attribute: today  # optional
```

_Jinja example_:

```yaml
type: custom:entity-progress-card
····
max_value:
  jinja: "{{ states('input_number.ceiling') | float }}"
```

_Appliance progress example_:

Some appliance integrations expose a ready-made percentage — Home Connect
(Bosch/Siemens) has `sensor.<appliance>_program_progress` (0-100 %), so `entity`
alone is enough, no `max_value` needed:

```yaml
type: custom:entity-progress-card
entity: sensor.washing_machine_program_progress
```

Miele doesn't expose a percentage, but does expose `elapsed_time` and
`remaining_time` (minutes) — combine them into a dynamic `max_value` so elapsed
time becomes the progress. `unit: '%'` is required here: `entity` has
`device_class: duration`, and without an explicit `unit` the card shows the
elapsed time itself (e.g. "23 min") instead of the percentage — the bar fill is
correct either way, only the text label is affected:

```yaml
type: custom:entity-progress-card
entity: sensor.washing_machine_elapsed_time
unit: '%'
max_value:
  jinja: >
    {{ (states('sensor.washing_machine_elapsed_time') | float(0))
       + (states('sensor.washing_machine_remaining_time') | float(0)) }}
```

[🔼 Back to top]

#### `reverse`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`reverse`** [Boolean] _(optional, default: `false`)_

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

[🔼 Back to top]

#### `state_content`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`state_content`** [String]|[List] _(optional)_:

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
- current_position — Displays the current position attribute (commonly used for
  covers, blinds, etc.).
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
> - If an attribute listed does not exist, the card immediately displays
>   unknown.
> - This feature is useful for adding additional context (e.g., position,
>   status...) to the main progress value.

[🔼 Back to top]

#### `custom_info`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`custom_info`** [JINJA] _(optional)_:

The `custom_info` option allows you to display additional, customizable text or
HTML next to the entity’s value. It supports full [JINJA] and inline HTML,
enabling you to style or conditionally format the information based on sensor
states or logic.

See [JINJA].

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
> - This field supports HTML for advanced formatting — see
>   [Supported HTML](#supported-html) for the allowed tags and styles.
> - If the template evaluates to an empty string, nothing will be displayed.

[🔼 Back to top]

#### `multiline`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`multiline`** [Boolean] _(optional, default: `false`)_:

Splits [`custom_info`](#custom_info) (or [`secondary`](#secondary-jinja) on
Template cards) across two lines instead of one. Insert a `<br>` (or `<br />`)
in the Jinja output at the point where the second line should start.

- Only the first `<br>` is honored — anything after a second one is discarded.
- When `multiline` is `false` (the default), any `<br>` in the output is
  stripped and the text stays on a single, ellipsis-truncated line.
- Not available on `entity-progress-badge` / `entity-progress-badge-template`:
  the row is too small to fit a second line.

_Example_:

```yaml
type: custom:entity-progress-card
····
multiline: true
custom_info: >-
  {% if states('sensor.temperature') | float > 25 %}
    <span style="color: red;">{{ states('sensor.temperature') }} °C</span><br>– Hot
  {% else %}
    <span style="color: blue;">{{ states('sensor.temperature') }} °C</span><br>– Cool
  {% endif %}
```

[🔼 Back to top]

#### `name_info`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`name_info`** [JINJA] _(optional)_:

The `name_info` option allows you to display additional, customizable text or
HTML next to the entity’s name. It supports full [JINJA] and inline HTML,
enabling you to style or conditionally format the information based on sensor
states or logic.

See [JINJA].

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
> - This field supports HTML for advanced formatting — see
>   [Supported HTML](#supported-html) for the allowed tags and styles.
> - If the template evaluates to an empty string, nothing will be displayed.

[🔼 Back to top]

#### `bar_stack`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`bar_stack`** [Map] _(optional)_

Combines several entities into the same progress bar. Available in the visual
editor via a dedicated row editor (entity/attribute/color/subtract per row) and
a Stacked/Proportional/Net mode switch.

| Key        | Type                               | Default   | Description                                                                                                                                                                                                            |
| ---------- | ---------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`     | `stacked` / `proportional` / `net` | `stacked` | See below                                                                                                                                                                                                              |
| `entities` | List                               | —         | Each entry: `entity` _(required)_, `attribute` _(optional)_, `color` _(optional, falls back to an automatic shade of the main entity's own color; ignored in `net` mode)_, `subtract` _(optional boolean — see below)_ |

- **`stacked`**: each entity keeps its own literal width on the
  `min_value`/`max_value` scale, placed one after another (see _Order_ below).
  Space left over past the last entity stays empty — useful for a breakdown that
  doesn't necessarily add up to the full range (e.g. a home battery's charged /
  reserved capacity, with the remainder implicitly "free").
- **`proportional`**: the main entity and every `entities` value are added
  together to drive the bar, and each segment's width is its _share_ of that
  combined total — the bar is always filled edge-to-edge, like a "100% stacked"
  chart in a spreadsheet. Useful for combining several sensors toward one shared
  target (e.g. several circuits against a breaker limit).
- **`net`**: the main entity and every `entities` value are added into a single
  algebraic total, rendered as one plain segment (no per-entity breakdown, no
  per-entity `color`) — the normal bar color/theme applies as if `bar_stack`
  weren't there at all. Combined with `center_zero`, this is the way to show a
  balance that can go either way — e.g. grid consumption minus solar production,
  positive when you're drawing from the grid, negative when you're exporting
  surplus.

`subtract: true` on an entity means "this value counts against the total instead
of with it" — what that looks like depends on the mode:

- In **`net`**, it's subtracted from the algebraic total (see the example
  below).
- In **`stacked`/`proportional`** _combined with `center_zero`_, entities split
  into two independent arms instead of a single breakdown: every entity goes to
  the _positive_ arm (growing right from the zero point) by default — except the
  main entity, which is always positive — and to the _negative_ arm (growing
  left) if it's marked `subtract` **or its own raw value is already negative**
  (see below). Both arms render and fill independently — e.g. a consumption arm
  and a production arm both visible at once, each showing its own true length,
  rather than one value canceling the other out.
- Without `center_zero`, `subtract` has no effect on `stacked`/`proportional`
  (there's only one direction to place segments in) — every entity contributes
  its magnitude regardless of sign.

> [!IMPORTANT]
>
> `subtract` always makes a value _count negatively_ — it never blindly flips
> whatever sign the sensor already reports. An entity that already reports a
> negative number (e.g. a Linky/DSMR-style signed grid sensor, see the note
> below) counts as negative on its own, with or without `subtract: true`;
> marking it `subtract` too would not double-negate it back to positive. This
> also means a plain, always-positive sensor never needs `subtract` to be read
> as negative — only a value that should be negative but happens to come from an
> always-positive sensor does.

> [!NOTE]
>
> `stacked`/`proportional` only look different once the entities overflow the
> bar's range (sum of values > `max_value`, or > half-range per arm when
> centered): `stacked` keeps every entity's true width and truncates whoever
> doesn't fit, so you can see at a glance that something doesn't fit;
> `proportional` shrinks everyone by the same ratio so the bar (or that arm)
> always reads as "100%", but two entities that individually overflow can look
> identical to two that fit exactly. Below that overflow point, both modes
> render the same widths. `net` doesn't have this ambiguity, since it never
> renders more than one segment.

**Order**: the main entity is always first, followed by `entities` in list order
— the same rule for both `stacked` and `proportional`. The one exception:
without `center_zero`, an entity marked `subtract` renders before the main
entity instead of after, as a visual sign that something atypical is configured
(`subtract` otherwise has no visible effect in that case — see above). This only
looks at the `subtract` flag, not at whether the entity's own live value happens
to be negative — the two are otherwise treated the same (see the `subtract` note
above), but this particular rule is decided before any entity state is
available, so only the flag can be checked.

**Color**: the main entity always renders in its own negotiated color, never
auto-shaded, regardless of where it falls in that order. Only `entities` items
without an explicit `color` are auto-shaded (darkest to full color), and that
shading is positioned only among themselves — the main entity never takes up a
"slot" in it.

**Label**: with `center_zero`, the displayed value switches to the algebraic
total (positive entities minus negative ones — the same number `net` mode always
shows) instead of the plain sum, since a single flat percentage stops meaning
anything once the bar itself is showing two independent, possibly-opposing arms.
Without `center_zero`, the displayed value stays the plain sum, matching what
the bar visually adds up to.

_Example (`stacked`, home battery breakdown)_:

```yaml
type: custom:entity-progress-card
entity: sensor.battery_storage_soc # charged, e.g. 60
bar_stack:
  entities:
    - entity: sensor.battery_storage_reserved # e.g. 20, locked
      color: orange
```

_Example (`proportional`, combined circuits)_:

```yaml
type: custom:entity-progress-card
entity: sensor.circuit_a_power
max_value: 3000
bar_stack:
  mode: proportional
  entities:
    - entity: sensor.circuit_b_power
    - entity: sensor.circuit_c_power
```

_Example (`net`, grid balance centered on zero)_:

```yaml
type: custom:entity-progress-card
entity: sensor.grid_consumption_power # always >= 0
min_value: -3000
max_value: 3000
center_zero: true
bar_stack:
  mode: net
  entities:
    - entity: sensor.solar_production_power # always >= 0
      subtract: true
```

> [!NOTE]
>
> There's no single Home Assistant-wide sign convention for grid power sensors.
> Some integrations (e.g. Linky, DSMR/P1 smart meters) already report a single
> signed value — positive while importing, negative while exporting — in which
> case `net` isn't even needed: just point `entity` at it directly with
> `center_zero`. `net` is for the common case of two separate, always-positive
> sensors (consumption and production) that need to be combined into that same
> signed balance.

_Example (`stacked` + `center_zero`, consumption and production shown at once)_:

```yaml
type: custom:entity-progress-card
entity: sensor.grid_consumption_power # always >= 0, positive arm
min_value: -3000
max_value: 3000
center_zero: true
bar_stack:
  entities:
    - entity: sensor.solar_production_power # always >= 0, negative arm
      subtract: true
      color: green
```

Unlike the `net` example above, this doesn't collapse both sensors into a single
balance — it draws a consumption bar growing right and a production bar growing
left, each at its own true length, so you can compare the two at a glance
instead of only seeing their difference.

> [!IMPORTANT]
>
> Prior to 1.6, this feature was a bare list under the `additions` key
> (`additions: [{entity, attribute}]`). **This form is deprecated** (a console
> warning is logged) but still works — it is automatically migrated to
> `bar_stack: { mode: proportional, entities: [...] }`, which computes the exact
> same values as before. The only visible difference is segment _order_:
> `additions` always drew its entities before the main one, whereas the migrated
> form now follows the same main-first order as everything else (see _Order_
> above) — colors and proportions are unaffected. Please update your YAML to the
> new form when convenient.

### Styling Options

Customize the look and feel: icons, layout, colors, sizes, and visual themes.

[🔼 Back to top]

#### `icon`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`icon`** [String] _(optional)_

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

[🔼 Back to top]

#### `color`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`color`** [String] _(optional)_

The color of the icon. Accepts [Token color][token-color], color names, RGB
values, or HEX codes. By default, the color is based on state, domain, and
device_class of your entity for `timer`, `cover`, `light`, `fan`, `climate` and
`battery`.

_Examples:_ `"green"`, `"rgb(68, 115, 158)"`, `"#FF5733"`,
`var(--state-icon-color)`...

```yaml
type: custom:entity-progress-card
····
color: rgb(110, 65, 171)
```

[🔼 Back to top]

#### `icon_animation`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`icon_animation`** [String] ➡️
> {`none`|`spin`|`pulse`|`bounce`|`shake`|`ping`|`reveal`|`washing_machine`|`battery_charging`}
> _(optional, default: `none`)_

Animates the icon while the entity is in an active state — a spinning fan, a
pulsing media player icon...

Most options only play while the entity is genuinely "active": they are
automatically disabled for entities without an active/inactive concept (plain
sensors, numbers, batteries...) and for entities in a resting state (`off`,
`idle`, `paused`, `closed`, `locked`, ...). `washing_machine` and
`battery_charging` are the two exceptions.

`washing_machine` also triggers when `entity` — or another `sensor` on the same
device, since `entity` is often the progress percentage rather than the status
itself (see [max_value] below) — has a state of exactly `run` or `in_use` (see
the table below). No config needed: every same-device sensor is checked
automatically, the same way `battery_charging` resolves its own status entity. A
`binary_sensor`/`switch` based setup (e.g. a smart-plug power monitor) keeps
working as before, with no extra state check needed.

Verified against these appliance integrations:

| Brand                                            | Entity                                                                 | Recognized as running |
| ------------------------------------------------ | ---------------------------------------------------------------------- | --------------------- |
| Home Connect, Bosch/Siemens ([official HA core]) | `sensor.<appliance>_operation_state` (`device_class: enum`)            | state `run`           |
| Miele ([official HA core])                       | `sensor.<appliance>_status` (`device_class: enum`, key `state_status`) | state `in_use`        |

`battery_charging` has no active/inactive concept to key off at all, so it
instead considers the entity charging when either is true:

- its own state is one of `charging`, `charge_in_progress`,
  `v2g_charging_normal`, `charging (ac)`, `charging (dc)`,
  `super offboard charging`, or
- it's a `binary_sensor` with `device_class: battery_charging` and its state is
  `on`, or
- one of these attributes is present and truthy: `battery_charging`, `charging`,
  `is_charging` (boolean `true`, or a `'charging'`-valued string).

Most integrations split this across two entities on the same device: one
reporting the battery percentage (the `entity` you point the card at) and one
reporting the charging status. If `entity` doesn't itself report charging, the
card checks every other entity on the same device against the rules above — no
extra config needed, and no assumption about how that entity is named (Home
Assistant's own Companion App, for example, calls its charging-status sensor
`battery_state`, with no "charging" anywhere in its entity_id). All options
respect the system-level "Reduce Motion" accessibility setting (see
[Accessibility] in the README).

Verified against these integrations:

| Brand                                                          | Main entity (`entity`, the %)                                            | Charging-status entity (auto-detected)                                                                                                | Recognized as charging                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Tesla Fleet ([official HA core])                               | `sensor.<car>_battery` (`device_class: battery`)                         | `sensor.<car>_charging_state` (`device_class: enum`)                                                                                  | state `charging`                                                                       |
| Renault ([official HA core])                                   | `sensor.<car>_battery` (key `battery_level`, `device_class: battery`)    | `binary_sensor.<car>_charging` (`device_class: battery_charging`) **or** `sensor.<car>_charge_state` (key `charge_state`)             | binary_sensor state `on`, or sensor state `charge_in_progress` / `v2g_charging_normal` |
| BYD ([jkaberg/hass-byd-vehicle])                               | `sensor` key `elec_percent` (`device_class: battery`)                    | `binary_sensor` key `is_charging` (`device_class: battery_charging`)                                                                  | state `on`                                                                             |
| MG SAIC ([townsmcp/mg-saic-ha])                                | "State of Charge" sensor (key `bmsPackSOCDsp`, `device_class: battery`)  | "Charging Status" sensor (key `bmsChrgSts`)                                                                                           | state `Charging (AC)` / `Charging (DC)` / `Charging` / `Super Offboard Charging`       |
| Xpeng, Enode-based ([mnordseth/xpeng-homeassistant])           | "battery" sensor (`device_class: battery`)                               | "charging" binary_sensor (`device_class: battery_charging`)                                                                           | state `on`                                                                             |
| Toyota ([pytoyoda/ha_toyota])                                  | "Battery Level" sensor (key `battery_level`, `device_class: battery`)    | "Charging Status" sensor (key `charging_status`, `device_class: enum`)                                                                | state `charging`                                                                       |
| Volkswagen We Connect ID ([mitch-dc/volkswagen_we_connect_id]) | "State of Charge" sensor (key `currentSOC_pct`, `device_class: battery`) | "Charging State" sensor (key `chargingState`)                                                                                         | state `charging`                                                                       |
| Home Assistant Companion App ([official HA core])              | `sensor.<device>_battery_level` (`device_class: battery`)                | `sensor.<device>_battery_state` (key `battery_state`, `device_class: enum`) — disabled by default, enable it in the entity's settings | state `charging`                                                                       |

Since detection reads state/attribute values, not entity_id or brand, any other
integration following the same conventions — a `battery_charging`-class
`binary_sensor`, or a same-device `sensor`/attribute whose state is an exact
match from the list earlier in this section — is detected automatically too,
without a code change.

The fill animation itself is drawn by the card (a clip-path sweep), not by the
icon — it's calibrated for the plain `mdi:battery` outline. If the icon actually
shown (your `icon:` override, or the entity's own native icon) contains
`charging` or `bluetooth` (e.g. `mdi:battery-charging-80`,
`mdi:battery-charging-wireless`, `mdi:battery-bluetooth`), the icon already
draws its own bolt/bluetooth glyph at a different position, so the card
automatically nudges the sweep to compensate instead of changing the icon. This
compensation is tuned against MDI's `battery-charging*` icons; other icon packs,
or `battery-bluetooth*`, aren't verified and may not line up.

_Example_:

```yaml
type: custom:entity-progress-card
entity: fan.living_room
icon_animation: spin
```

_Options_:

| option             | description                                                                                 |
| :----------------- | :------------------------------------------------------------------------------------------ |
| `none`             | No animation (default)                                                                      |
| `spin`             | Continuous rotation                                                                         |
| `pulse`            | Gentle scale/opacity pulse                                                                  |
| `bounce`           | Squash-and-stretch bounce                                                                   |
| `shake`            | Small vibration jitter                                                                      |
| `ping`             | Expanding ring pulse around the icon's shape                                                |
| `reveal`           | Icon grows into view in circular steps                                                      |
| `washing_machine`  | Shake + porthole wipe, for washer/dryer entities                                            |
| `battery_charging` | Sweeping fill wipe, active while charging (device battery attribute or EV `charging` state) |

[🔼 Back to top]

#### `badge_icon`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`badge_icon`** [JINJA] _(optional)_:

The `badge_icon` option lets you display a dynamic badge, offering a quick
status hint or symbolic representation based on logic or sensor values.

See [JINJA].

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
> If the template returns nothing (i.e., empty string or None), the badge will
> not be displayed.

[🔼 Back to top]

#### `badge_color`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`badge_color`** [JINJA] _(optional)_:

The `badge_color` option lets you setup a dynamic badge's background color,
offering a quick status hint or symbolic representation based on logic or sensor
values.

See [JINJA].

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

[🔼 Back to top]

#### `bar_color`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`bar_color`** [String] _(optional, default: `var(--state-icon-color)`)_

The color of the progress bar. Accepts [Token color][token-color], color names,
RGB values, or HEX codes.

_Examples:_ `"blue"`, `"rgb(68, 115, 158)"`, `"#FF5733"`,
`var(--state-icon-color)`

```yaml
type: custom:entity-progress-card
····
bar_color: rgb(110, 65, 171)
```

[🔼 Back to top]

#### `bar_size`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_size`** [String] ➡️ {`small`|`medium`|`large`|`xlarge`} _(optional,
> default: `small`, `xlarge` for the Tile Feature)_

Customizes the appearance of the progress bar by selecting a predefined size.
Choose from small, medium, or large to adjust the visual scale of the bar.

> [!NOTE]
>
> The Tile Feature defaults to `xlarge` instead of `small`: unlike Card/Badge/
> Template, its row height is fixed (it doesn't grow or shrink with `bar_size`),
> so a thin `small` bar looks lost inside that space.

> [!IMPORTANT]
>
> Badge and Badge Template don't offer `xlarge` ({`small`|`medium`|`large`}
> only): it sets a fixed 42px bar height, taller than a badge's entire height
> (`--ha-badge-size`, 36px by default), so it would overflow the badge.

> [!IMPORTANT]
>
> If [`bar_position`](#bar_position) is `top`, `bottom`, `overlay`, or
> `background`, `bar_size` is ignored: each of these positions sets its own
> fixed bar thickness. `default` and `below` still honor `bar_size` normally.

_Example_:

```yaml
type: custom:entity-progress-card
····
bar_size: medium
```

[🔼 Back to top]

#### `bar_position`

[![Card OK][Card-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`bar_position`** [String] _(optional, default: "default")_

Defines the position of the progress bar within the card.

> [!WARNING]
>
> If `bar_position` is `top`, `bottom`, `overlay`, or `background`, the
> `bar_size` option is ignored (see [`bar_size`](#bar_size)). `below` still
> honors it.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.led0
bar_position: overlay
```

_Options:_

| option       | description                                                     | Card | Template | Feature |
| :----------- | :-------------------------------------------------------------- | :--: | :------: | :-----: |
| `default`    | Standard position (inline with content)                         |  ✅  |    ✅    |   ✅    |
| `below`      | Below the content as a dedicated row                            |  ✅  |    ✅    |    —    |
| `top`        | At the top of the card edge                                     |  ✅  |    ✅    |   ✅    |
| `bottom`     | At the bottom of the card edge                                  |  ✅  |    ✅    |   ✅    |
| `overlay`    | Overlaid on top of the content                                  |  ✅  |    ✅    |    —    |
| `background` | Fills the entire card as a background layer, behind the content |  ✅  |    ✅    |    —    |

> [!NOTE]
>
> The Tile Feature only supports `default`/`top`/`bottom`: it's a single row
> added to an existing Tile card, not a full card with its own dedicated rows or
> content to overlay/background — `below`, `overlay`, and `background` don't
> apply to that context. Badge and Badge Template don't have this option at all.

_Default value_:

- `default`

[🔼 Back to top]

#### `bar_single_line`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`bar_single_line`** [Boolean] _(optional, default: false)_

Enables single-line mode for overlay bars, showing the progress bar in a more
compact layout.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.led0
bar_position: overlay
bar_single_line: true
```

_Options_:

| option  | description                                          |
| :------ | :--------------------------------------------------- |
| `true`  | Display the overlay bar in single-line mode          |
| `false` | Display the overlay bar in default multi-line layout |

_Default value_:

- `false`

[🔼 Back to top]

#### `bar_segments`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_segments`** [Integer] _(optional)_

Renders the progress bar as discrete blocks — like battery cells or a signal
strength indicator — instead of a continuous fill. Both the track and the fill
are segmented, so gaps are visible in both the empty and filled portions of the
bar.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.battery
bar_segments: 10
```

Works with any bar orientation, size, and color mode/effect. The visual editor
exposes this as a numeric field.

[🔼 Back to top]

#### `bar_effect`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_effect`** [String] or [List] or [JINJA] _(optional)_

Defines visual effects applied to the progress bar. You can use a single effect
or combine multiple in a list.

- If a **[String]** is provided (e.g. `"gradient"`), only one effect is applied.
- If a **[List]** is provided (e.g. `["radius", "shimmer"]`), effects are
  combined.
- If using a **[JINJA] template**, it should return either:
  - a single effect string (`shimmer`)
  - or a comma-separated string (`"gradient, shimmer"`)

_Available options_:

- radius: rounds the corners of the progress bar
- glass: adds a frosted glass effect to the progress bar
- gradient: applies a color gradient to the progress bar
- gradient_reverse: applies a color gradient to the progress bar (fading in the
  opposite direction)
- shimmer: adds a shimmering light animation across the bar
- shimmer_reverse: adds a shimmering light animation across the bar (running in
  the opposite direction)

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

> [!NOTE]
>
> The shimmer effect is disabled when center_zero is enabled (center_zero =
> true).

_Effect incompatibilities_ — some effects cannot be combined:

| Effect selected    | Incompatible with              |
| ------------------ | ------------------------------ |
| `glass`            | `gradient`, `gradient_reverse` |
| `gradient`         | `gradient_reverse`, `glass`    |
| `gradient_reverse` | `gradient`, `glass`            |
| `shimmer`          | `shimmer_reverse`              |
| `shimmer_reverse`  | `shimmer`                      |

The visual editor enforces these rules automatically by hiding incompatible
chips when a conflicting effect is active.

[🔼 Back to top]

#### `bar_color_mode`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`bar_color_mode`** [String] ➡️ {`auto`|`segment`|`rainbow`} _(optional,
> default: `auto`)_

Controls how theme colors are applied to the progress bar fill.

- `auto` — default behavior: the bar is filled with the solid color of the
  current theme zone. No change from previous versions.
- `segment` — each color zone defined by the theme is rendered as a distinct
  colored block, visible up to the current value. Useful to see at a glance how
  far through each zone the entity has progressed.
- `rainbow` — the bar displays a smooth color gradient across all visible zones,
  transitioning between each zone's color up to the current value.

> [!NOTE]
>
> `bar_color_mode` has no effect when `center_zero` is enabled — that mode
> always uses `auto` coloring. It also requires an active [`theme`](#theme) or
> [`custom_theme`](#custom_theme) — `segment`/`rainbow` paint theme zones, so
> without either one, `bar_color_mode` is reset to `auto` automatically. For
> linear themes (e.g. `light`), zone boundaries are derived automatically by
> splitting 0–100% into equal segments (5 levels → 0–20%, 20–40%, …).

> [!NOTE]
>
> With [`custom_theme`](#custom_theme), a zone without its own
> `color`/`bar_color` doesn't render as a flat neutral stop in `segment`/
> `rainbow` mode — it falls back to the entity's own negotiated color (e.g. a
> cover is pink open / grey closed) before the card's generic default, the same
> fallback chain the single-color `auto` mode already uses.

_Examples_:

```yaml
type: custom:entity-progress-card
entity: sensor.battery_level
theme: optimal_when_high
bar_color_mode: segment
```

```yaml
type: custom:entity-progress-card
entity: sensor.battery_level
custom_theme:
  - min: 0
    max: 20
    color: red
  - min: 20
    max: 80
    color: green
  - min: 80
    max: 100
    color: orange
bar_color_mode: rainbow
```

[🔼 Back to top]

#### `bar_scale`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`bar_scale`** [String] ➡️ {`linear`|`log`} _(optional, default: `linear`)_

Controls how the value maps to the bar's fill width.

- `linear` (default) — no change from previous versions: the fill width is
  directly proportional to the value.
- `log` — the fill width follows a base-10 logarithmic scale instead. Useful for
  values that span several orders of magnitude (illuminance in lux, network
  throughput, particle counts…), where a linear bar would make everything below
  the top of the range look empty.

Watermarks, theme zones and marks all stay visually consistent with the chosen
scale — they share the same value → position math as the bar fill.

> [!NOTE]
>
> `log` requires a strictly positive range (`min_value > 0` and
> `max_value > min_value`) and has no meaning combined with `center_zero` (there
> is no logarithm of a range that crosses zero). Either condition falls back to
> `linear` automatically — no error, no broken bar.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.living_room_illuminance
min_value: 1
max_value: 100000
bar_scale: log
```

[🔼 Back to top]

#### `bar_max_width`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`bar_max_width`** [String] _(optional)_

Limits the maximum width of the progress bar in horizontal layout.

> [!IMPORTANT]
>
> Only applies with [`layout`](#layout): `horizontal`,
> [`bar_position`](#bar_position): `default` (or unset), and
> [`bar_size`](#bar_size) set to `small`, `medium`, or `large` (not `xlarge`).
> Outside this combination the option is cleared automatically — it has no
> effect anywhere else.

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.testtimer
bar_max_width: 100px
```

[🔼 Back to top]

#### `bar_orientation`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_orientation`** [String] {`rtl`|`ltr`|`up`} _(optional, default: `ltr`)_

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

> [!IMPORTANT]
>
> `up` only has a visible effect in two combinations: [`layout`](#layout):
> `vertical` with [`bar_position`](#bar_position): `overlay`, or `bar_position`:
> `background` (this one works with either layout). Badge, Badge Template, and
> the Tile Feature don't offer `up` at all ({`rtl`|`ltr`} only): none of them
> have a `layout` option, and their `bar_position` values never include
> `overlay` or `background`.

[🔼 Back to top]

#### `force_circular_background`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`force_circular_background`** [Boolean] _(optional, default: false)_

This option forces a **circular background** to be displayed behind the icon
shown on the card.

HA 2025.3 brings a lot of improvements and changes the circular background
strategy: <https://www.home-assistant.io/blog/2025/03/05/release-20253/>

This card evaluates the HA version and adapts to it according to your entity
domain and your action strategy. If you want to avoid this strategy you can use
this parameter.

When set to `true`, a circular shape will appear behind the icon, regardless of
the HA version, entity domain or action defined. This helps create a cleaner,
more consistent visual appearance with Mushroom card.

_Example_:

```yaml
type: custom:entity-progress-card
entity: timer.living_room
force_circular_background: true
```

[🔼 Back to top]

#### `trend_indicator`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`trend_indicator`** [Boolean] _(optional, default: false)_

Displays trend icons indicating the direction of the entity's value. Icons are
automatically positioned at the top right of the card.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
trend_indicator: true
```

_Icons_:

| icon                   | meaning        |
| :--------------------- | :------------- |
| `mdi:chevron-up-box`   | Upward trend   |
| `mdi:chevron-down-box` | Downward trend |
| `mdi:equal-box`        | Stable trend   |

_Default value_:

- `false`

[🔼 Back to top]

#### `text_shadow`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`text_shadow`** [Boolean] _(optional, default: false)_

Displays a shadow behind the text when [`bar_position`](#bar_position) is set to
`overlay` or `background`, improving readability over colored or gradient
backgrounds.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
····
bar_position: overlay
text_shadow: true
```

_Default value_:

- `false`

[🔼 Back to top]

#### `layout`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`layout`** [String] ➡️ {`horizontal`| `vertical`} _(optional, default:
> `horizontal`)_:

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

[🔼 Back to top]

#### `frameless`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`frameless`** [Boolean] _(optional, default: false)_

Allows you to remove the default Lovelace card styling: the border and
background color. When set to `true`, the card blends seamlessly into the
interface or can be embedded in other designs without visual interference.

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

[🔼 Back to top]

#### `marginless`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`marginless`** [Boolean] _(optional, default: false)_

Removes vertical margin, creating a more compact layout.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
marginless: true
```

[🔼 Back to top]

#### `height`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`height`** [String] (optional)

Sets the height (e.g., 120px, 10em, 30%) for the card. Useful for ensuring
consistent layout in horizontal stacks or grids.

> [!NOTE]
>
> If the main objective is to reduce the size, test the `marginless` parameter
> before adjusting the `height`.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
height: 140px
```

[🔼 Back to top]

#### `min_width`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`min_width`** [String] (optional)

Sets a minimum width (e.g., 120px, 10em, 30%) for the card, badge or template.
Useful for ensuring consistent layout in horizontal stacks or grids.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
min_width: 140px
```

[🔼 Back to top]

#### `reverse_secondary_info_row`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`reverse_secondary_info_row`** [Boolean] _(optional, default: false)_

Reverses the order of the progress bar and the secondary info when using a
horizontal layout.

When set to `true`, the secondary info appears to the right of the progress bar
instead of the left. Useful for emphasizing the progress visually by aligning it
first, or for adapting to specific design preferences.

> [!IMPORTANT]
>
> Only applies with [`layout`](#layout): `horizontal` and
> [`bar_position`](#bar_position): `default` (or unset) — `layout: vertical`
> always renders the secondary info in a column regardless of this option,
> ignoring it entirely. Outside that combination, `reverse_secondary_info_row`
> is disabled automatically.

```yaml
type: custom:entity-progress-card
entity: timer.living_room
reverse_secondary_info_row: true
```

[🔼 Back to top]

#### `unit_spacing`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`unit_spacing`** [String] ➡️ {`auto`|`space`|`no-space`} _(optional,
> default: `auto`)_

Defines whether a space should appear between numeric values and units, either
following locale rules or overriding them explicitly.

- `auto`: Uses locale-specific formatting rules (e.g., France → space, US → no
  space)
- `space`: Forces a space between number and unit (e.g., 80 %), regardless of
  locale
- `no-space`: Forces no space between number and unit (e.g., 80%), regardless of
  locale

[🔼 Back to top]

#### `center_zero`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`center_zero`** [Boolean | Object] _(optional, default: `false`)_

Centers the progress bar at zero, allowing for better visualization of values
that fluctuate around zero (e.g., positive/negative changes).

By default, the center point is `0`. If your sensor has a non-zero nominal value
(e.g., a voltage sensor around `230V`, or a pressure sensor with a non-zero
baseline), you can pass an object instead of `true` to customize the center
point and how the value is displayed.

| Property         | Type    | Default | Description                                                                                                          |
| ---------------- | ------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `value`          | Number  | `0`     | The reference value used as the center point of the bar.                                                             |
| `growth_percent` | Boolean | `false` | When `true`, the displayed percentage shows growth/decrease **relative to `value`** instead of the bar's fill ratio. |

> ⚠️ The bar's visual fill always reflects the distance from `value` to the
> nearest bound (`min_value`/`max_value`). `growth_percent` only changes the
> **displayed text**, not the bar itself.

_Example — simple boolean (centered at 0)_:

```yaml
type: custom:entity-progress-card
entity: sensor.energy_balance
center_zero: true
```

_Example — custom center value (e.g., nominal voltage)_:

```yaml
type: custom:entity-progress-card
entity: sensor.voltage
center_zero:
  value: 230
```

With the example above, a sensor reading `236` will show a bar filled relative
to the `230`–`max_value` range, but the displayed text will be `236` (the raw
value), unless `growth_percent` is enabled (see below).

_Example — custom center value with growth percentage display_:

```yaml
type: custom:entity-progress-card
entity: cover.cuisine
attribute: current_position
center_zero:
  value: 60
  growth_percent: true
```

With `value: 60` and `growth_percent: true`, a cover at `66%` will display
`+10%` (i.e. `(66 - 60) / 60 * 100`), representing how far the current value has
grown relative to the center point — rather than the bar's raw fill ratio.

[🔼 Back to top]

#### `theme`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`theme`** [String] ➡️ {`optimal_when_low`|`optimal_when_high`|`light`|
> `temperature`|`humidity`|`pm25`|`voc`} _(optional)_

Allows customization of the progress bar's appearance using a predefined theme.
This theme dynamically adjusts the `icon`, `color` and `bar-color` parameters
based on the battery level, eliminating the need for manual adjustments or
complex Jinja2 templates.

_Example_:

```yaml
type: custom:entity-progress-card
····
theme: light
```

> [!WARNING]
>
> The `battery`, `cpu`, and `memory` parameters are deprecated and SHOULD no
> longer be used. Although these parameters are still valid, they MUST be
> replaced by `optimal_when_low` or `optimal_when_high`. These new parameters,
> introduced in version `1.1.7`, eliminate the need for multiple theme
> definitions and are sufficient to replace the deprecated themes.

[🔼 Back to top]

#### `custom_theme`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`custom_theme`** [List] of [Map] _(optional)_

Defines a list of custom theme rules based on value ranges. Setting this
variable disables the `theme` variable.

In the visual editor, a chip selector (Preset / Custom) switches between the
`theme` dropdown and this list of zones — each zone is its own row with min,
max, colors and an icon.

_Map definition:_

- min [number] (required): The minimum value for this range.
- max [number] (required): The maximum value for this range.
- color [string] (optional): The color of the icon and the progress bar.
- icon_color [string] (optional): Color specifically for the icon, overrides
  `color`.
- bar_color [string] (optional): Color specifically for the progress bar,
  overrides `color`.
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
> [`min`, `max`[ / [`min`, `max`) : The range includes the min value but
> excludes the max value.

> [!IMPORTANT]
>
> Each zone only needs a valid `min` < `max` to be taken into account — a zone
> missing `min`/`max`, or with `min` >= `max`, is ignored on its own without
> affecting the rest of the list. Zones don't need to be contiguous or declared
> in order: gaps between zones are allowed, and the list is sorted by `min`
> automatically.
>
> - Below the lowest zone or above the highest one, the closest edge zone is
>   used (same as before).
> - Inside a **gap** between two zones, `custom_theme` disengages entirely for
>   that value instead of guessing a color: the icon and colors fall back to
>   [`color`](#color)/[`icon`](#icon) if set, then to the entity's own default.
> - If two zones **overlap**, the one with the lowest `min` wins.
>
> This tolerant behavior is what makes the visual editor's row-by-row workflow
> practical — an unfinished zone (still missing a color, or not yet connected to
> its neighbor) never breaks the rest of your custom theme.

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

[🔼 Back to top]

#### `interpolate`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)

> **`interpolate`** [Boolean] _(optional, default: `false`)_

Enables smooth color transition between consecutive steps of a custom theme.
When set to true, the icon and bar colors are interpolated between the current
step and the next one based on the current value's position within the step
range.

> [!NOTE]
>
> Requires an active [`theme`](#theme) or [`custom_theme`](#custom_theme), and
> [`bar_color_mode`](#bar_color_mode) set to `auto` (the default) — outside
> either condition, `interpolate` is disabled automatically.

_Example_:

```yaml
type: custom:entity-progress-card
····
custom_theme:
  - min: 0
    max: 20
    color: "#4caf50"
  - min: 20
    max: 70
    color: "#ffeb3b"
  - min: 70
    max: 100
    color: "#f44336"
interpolate: true
```

[🔼 Back to top]

#### `hide`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`hide`** [List] or [JINJA] (optional):

Defines which elements should be hidden in the card.

`hide` accepts either:

- a list of elements to hide (static configuration), or
- a Jinja template that dynamically returns a list of elements based on the
  current state.

When using the list syntax, the following elements are available:

- icon: Hides the entity icon.
- name: Hides the entity name.
- value: Hides the current value.
- unit: Hides the unit (Card/Badge only — replaces the deprecated `disable_unit`
  option, see [Deprecated Options]).
- secondary_info: Hides the secondary information.
- progress_bar: Hides the visual progress bar.

_Static example_:

```yaml
type: custom:entity-progress-card
...
hide:
  - icon
  - name
  - secondary_info
```

_Dynamic (Jinja) example_:

```yaml
type: custom:entity-progress-card
...
hide: >
  {% if is_state('input_boolean.simple_mode', 'on') %}
    secondary_info, progress_bar
  {% endif %}
```

The template must return a list containing any combination of the supported
element names.

[🔼 Back to top]

#### `disable_unit`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`disable_unit`** [Boolean] _(optional, default: `false`)_

> [!IMPORTANT]
>
> **Deprecated since 1.6.0** (a console warning is logged) — use
> [`hide: ['unit']`](#hide) instead. `disable_unit` still works and is
> automatically migrated for the session, but please update your YAML to the new
> form when convenient. See [Deprecated Options].

Disables the display of the unit when set to `true`. If not defined or set to
`false`, the unit will be shown.

_Example_:

```yaml
type: custom:entity-progress-card
····
disable_unit: true
```

[🔼 Back to top]

#### `watermark`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`watermark`** [Map] _(optional)_

The `watermark` option allows you to visually highlight specific value
thresholds (low and high) within the progress bar, helping you better interpret
the current state at a glance.

_Map definition_:

- `high` (number/entity/template): The upper threshold value. How it is
  interpreted depends on `high_as` (see below).
- `high_as` (string): Controls how `high` is interpreted.
  - `auto` (default): value in the entity’s own unit and scale (same as
    `min_value`/`max_value`) — the card converts it to a bar position.
  - `percent`: value is a direct bar position (0–100), bypassing any unit
    conversion.
- `high_attribute`: Entity’s attribute to use as the high threshold.
- `high_color` (string): The CSS color used for the high watermark zone (name or
  hex).
- `low` (number/entity/template): The lower threshold value. How it is
  interpreted depends on `low_as` (see below).
- `low_as` (string): Controls how `low` is interpreted.
  - `auto` (default): value in the entity’s own unit and scale (same as
    `min_value`/`max_value`) — the card converts it to a bar position.
  - `percent`: value is a direct bar position (0–100), bypassing any unit
    conversion.
- `low_attribute`: Entity’s attribute to use as the low threshold.
- `low_color` (string): The CSS color used for the low watermark zone.
- `type` (string): Defines the style of the watermark overlay.
  - `blended` (default): A subtle colored overlay that merges with the bar’s
    colors for a more integrated look.
  - `area`: A soft transparent shape placed over the bar, without blending into
    the bar’s colors.
  - `striped`: Diagonal stripes for a patterned effect.
  - `triangle`: Triangle shapes as a watermark.
  - `round`: Rounded shapes applied as a watermark.
  - `line`: Vertical lines pattern (like a hatch effect).
- `line_size` (string): Defines the thickness of the lines when the watermark
  type is `line` (e.g., `"3px"`).
- `opacity` (number): Adjusts the transparency of the watermark overlay (from 0
  = fully transparent to 1 = fully opaque).
- `disable_low` (boolean): If set to true, disables the low watermark display.
- `disable_high` (boolean): If set to true, disables the high watermark display.

`low` and `high` each accept three forms — like `min_value`/`max_value`, a
`{ jinja: ... }` map is explicit rather than sniffed from a bare string (an
entity ID and a Jinja template are both strings):

- a fixed numeric value — same as before,
- an entity ID (string) — same as before, optionally paired with
  `low_attribute`/`high_attribute`,
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, a chip selector (Fixed value / Entity / Template) lets you
switch between the three modes, mirroring `min_value`/`max_value`.

> [!NOTE]
>
> The Jinja mode for `low`/`high` is available on the Card and the Badge only.
> On the Tile Feature and the Template card, only the fixed value and entity
> modes apply.

_Jinja example_:

```yaml
type: custom:entity-progress-card
····
watermark:
  low:
    jinja: "{{ states('input_number.night_floor') | float }}"
  high: 80
```

**Value interpretation**

`low` and `high` are always expressed in the **entity’s native unit**, on the
same scale defined by `min_value` and `max_value`. The card converts them to a
bar position automatically — they are never raw percentages of the bar.

> [!IMPORTANT]
>
> For a `timer` entity, `auto` behaves like `percent` instead: a timer's `max`
> is the running instance's actual duration, not a stable scale — a 20-minute
> run and a 5-minute run have a different `max`, so a raw value would land at a
> different position every time. `auto` keeps `low`/`high` as a stable
> percentage of the bar for timers, regardless of how long any given run is.

| Scenario                                                 | `low_as` / `high_as` | `low` / `high` unit       | Example                                                          |
| -------------------------------------------------------- | -------------------- | ------------------------- | ---------------------------------------------------------------- |
| Percentage sensor (`%`), default range 0–100             | `auto`               | Percentage (0–100)        | `low: 20` → marker at 20 % on the bar                            |
| Percentage sensor (`%`), custom range `min=-100 max=100` | `auto`               | Same custom scale         | `low: 10` → marker at 55 % visually                              |
| Temperature sensor (`°C`), `min=-10 max=50`              | `auto`               | °C                        | `low: -5` → marker at −5 °C                                      |
| Power sensor (`W`), `min=-7000 max=7000`                 | `auto`               | W                         | `low: -3700` → marker at −3700 W                                 |
| `max_value` is another entity (bar shows %)              | `auto`               | Still the entity’s unit   | `low: 20` means 20 °C even if bar shows %                        |
| `center_zero: true`                                      | `auto`               | Entity’s unit, full range | `low: -5` on a −10…50 scale → placed in the left (negative) half |
| Any sensor, explicit bar position                        | `percent`            | Bar position (0–100)      | `low: 25, low_as: percent` → marker fixed at 25 % of the bar     |

> **`center_zero` note** — The bar is split into two visual halves: left (min →
> zero) and right (zero → max). `low`/`high` values are mapped to their correct
> half automatically regardless of whether the range is symmetric or not. With
> `low_as: percent` / `high_as: percent`, the value is a direct position on the
> full bar (0 = left edge, 100 = right edge), bypassing the two-half mapping.

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

[🔼 Back to top]

#### `alert_when`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`alert_when`** [Map] _(optional)_

Draws attention to the card when the value crosses a threshold — a step further
than theme colors: the card itself reacts, which is more noticeable on a
wall-mounted dashboard.

_Map definition_:

- `above` (number): Alert when the value goes above this threshold.
- `below` (number): Alert when the value goes below this threshold.
- `color` (string): CSS color used for the alert (name or hex). Defaults to the
  theme's error color.
- `highlight` (string): What reacts to the alert.
  - `border` (default): The card border takes the alert color.
  - `background`: A tint of the card background instead — the border stays
    neutral.
- `animation` (string, optional): How that reaction moves. If omitted, it
  defaults to `blink` for `border` and `static` for `background` (this matches
  the behavior before `animation` existed, so old configs are unaffected).
  - `static`: No motion — steady color.
  - `blink`: Pulses between the alert color and the resting color.
  - `ping`: A ring bursts from the card border. Border-only: combined with
    `highlight: background` it has no matching effect and falls back to
    `static`.

`above` and `below` are expressed in the entity's native unit, on the same scale
as `min_value`/`max_value` — like `watermark.low`/`watermark.high`. Both can be
combined; the alert triggers if either condition is met.

`blink` and `ping` are disabled automatically when the system-level "Reduce
Motion" accessibility setting is on (see [Accessibility] in the README) — the
border or background then stays statically colored, so the alert remains visible
without the motion.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  above: 80
  color: red
  highlight: border
  animation: ping
```

[🔼 Back to top]

### Behavior And Actions

Define interactions on tap, double tap, or hold gestures.

[🔼 Back to top]

#### `xyz_action`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`xyz_action`** [map] ➡️ {action: {`more-info` | `toggle` | `perform-action`
> | `navigate` | `url` | `assist` | `none`}...} _(optional)_

_`xyz_action`_:

- `tap_action`: Defines the behavior when a user taps on the card. The action
  could be a navigation, toggle, or any other pre-defined action.
- `double_tap_action`: Defines the behavior when a user double-taps on the card.
  This can be used to trigger a different action from the regular tap.
- `hold_action`: Defines the behavior when the user holds down (long press) on
  the card. This is often used for actions that should only be triggered with a
  longer press.
- `icon_tap_action`: Defines the behavior when the user taps on the icon
  (typically an icon on a card). This action can be different from the general
  tap_action of the card.
- `icon_double_tap_action`: Defines the behavior when the user double-taps on
  the icon. This can be used to trigger an alternative action from the regular
  icon_tap_action.
- `icon_hold_action`: Defines the behavior when the user holds down (long press)
  on the icon. This action might be used for a different, more powerful
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
  <https://example.com>). ...

_Default:_

- tap_action: `more-info`
- hold_action: `none`
- double_tap_action: `none`
- icon_tap_action:
  - `toggle` if the entity is a `light`, `switch`, `fan`, `input_boolean`, or
    `media_player`
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
>
> It's possible to specify a different entity for an action. For example, this
> can be useful if you want the `more-info` popup to display information for a
> different entity to the one used in the progress card. As shown below, the
> progress card shows a stacked bar chart with `pv1_power` and `pv2_power`, but
> displays `pv_total_power` when tapped.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.pv1_power
bar_stack:
  entities:
    - entity: sensor.pv2_power
····
tap_action:
  action: more-info
  entity: sensor.pv_total_power
```

<a id="template"></a>

## 🧩 entity-progress-card-template / entity-progress-badge-template

### Common options

These options are the same as those of the `entity-progress-card` and are
available for Templates as well:

| **Option**                   | **Type**           | **Default**  | **Description**                   | **Link**                                   |
| :--------------------------- | :----------------- | :----------- | :-------------------------------- | :----------------------------------------- |
| **Data Options**             |                    |              |                                   |                                            |
| `entity`                     | string (optional)  | —            | Main entity ID                    | [Config Ref.](#entity)                     |
| **Styling Options**          |                    |              |                                   |                                            |
| `badge_icon`                 | Jinja (optional)   | —            | Dynamic badge icon                | [Config Ref.](#badge_icon)                 |
| `badge_color`                | Jinja (optional)   | —            | Dynamic badge color               | [Config Ref.](#badge_color)                |
| `bar_size`                   | string (optional)  | `small`      | Size of the progress bar          | [Config Ref.](#bar_size)                   |
| `bar_position`               | string (optional)  | `default`    | Position of the progress bar      | [Config Ref.](#bar_position)               |
| `bar_single_line`            | boolean (optional) | `false`      | single-line mode for overlay bars | [Config Ref.](#bar_single_line)            |
| `bar_segments`               | integer (optional) | —            | Render bar as discrete segments   | [Config Ref.](#bar_segments)               |
| `bar_effect`                 | string/list/jinja  | —            | Visual effects for the bar        | [Config Ref.](#bar_effect)                 |
| `bar_max_width`              | string (optional)  | -            | Limits the max width of the bar   | [Config Ref.](#bar_max_width)              |
| `bar_orientation`            | string (optional)  | `ltr`        | Bar direction                     | [Config Ref.](#bar_orientation)            |
| `bar_scale`                  | string (optional)  | `linear`     | Value-to-width mapping            | [Config Ref.](#bar_scale)                  |
| `icon_animation`             | string (optional)  | `none`       | Animate icon on active state      | [Config Ref.](#icon_animation)             |
| `force_circular_background`  | boolean (optional) | `false`      | Force icon circle background      | [Config Ref.](#force_circular_background)  |
| `trend_indicator`            | string (optional)  | `false`      | Displays trend icons.             | [Config Ref.](#trend_indicator)            |
| `layout`                     | string (optional)  | `horizontal` | Layout direction                  | [Config Ref.](#layout)                     |
| `frameless`                  | boolean (optional) | `false`      | Remove card frame                 | [Config Ref.](#frameless)                  |
| `marginless`                 | boolean (optional) | `false`      | Remove top/bottom margin          | [Config Ref.](#marginless)                 |
| `height`                     | string (optional)  | —            | Card height                       | [Config Ref.](#height)                     |
| `min_width`                  | string (optional)  | —            | Minimum width                     | [Config Ref.](#min_width)                  |
| `reverse_secondary_info_row` | boolean (optional) | `false`      | Flip info bar layout              | [Config Ref.](#reverse_secondary_info_row) |
| `multiline`                  | boolean (optional) | `false`      | Split secondary text on 2 lines   | [Config Ref.](#multiline)                  |
| `center_zero`                | boolean (optional) | `false`      | Center the bar on 0               | [Config Ref.](#center_zero)                |
| `hide`                       | list (optional)    | —            | Hide parts of the card            | [Config Ref.](#hide)                       |
| `watermark`                  | map (optional)     | —            | Adds min/max overlays             | [Config Ref.](#watermark)                  |
| **Behavior And Actions**     |                    |              |                                   |                                            |
| `xyz_action`                 | map (optional)     | see defaults | Tap/double/hold actions           | [Config Ref.](#xyz_action)                 |

[🔼 Back to top]

### Specific options

#### `name` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`name`** [JINJA] ➡️ [String]

Dynamically generates the name using [JINJA] templates. We can access entity
states and attributes to create context-aware names.

See [`name`](#name). See [JINJA].

_Example_:

```yaml
name:
  "{{ state_attr('sensor.battery_level', 'friendly_name') }} ({{
  states('sensor.battery_level') }}%)"
```

[🔼 Back to top]

#### `icon` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`icon`** [JINJA] ➡️ [String]

Conditionally sets the card icon based on entity state or attributes. Useful for
dynamic icon changes.

_Order of Priority for the Icon:_

- Icon ([JINJA]): A custom icon defined with a [JINJA] expression.
- Entity icon.

See [`icon`](#icon). See [JINJA].

_Example_:

```yaml
icon: >-
  {% if states('sensor.battery_level') | int > 50 %}
    mdi:battery-high
  {% else %}
    mdi:battery-low
  {% endif %}
```

[🔼 Back to top]

#### `secondary` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`secondary`** [JINJA] ➡️ [String]

Renders the secondary content (e.g., unit, status, additional info) using
templates for dynamic secondary text display.

_Example_:

```yaml
secondary: >-
  Last updated: {{ relative_time(states.sensor.temperature.last_changed) }} ago
  ({{ states('sensor.temperature') }}°C)
```

[🔼 Back to top]

#### `percent` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`percent`** [JINJA] ➡️ [Float]

Calculates the progress percentage using templates. Enables complex calculations
from multiple entities or custom formulas.

_Example_:

A simple example:

```yaml
percent: >-
  {% set used = states('sensor.disk_used') | int %} {% set total =
  states('sensor.disk_total') | int %} {{ (used / total * 100) | round(1) }}
```

Another example, to manage sensor availability and min/max:

```yaml
percent: >-
  {% set temp_state = states('sensor.lounge_temp_temperature') %} {% set max =
  22 %} {% set min = -10 %} {{ ((temp_state | float - min) / (max - min) * 100)
  | round(1) if temp_state not in ['unknown', 'unavailable', 'none'] else 0 }}
```

[🔼 Back to top]

#### `color` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`color`** [JINJA] ➡️ [String]

Dynamically sets the icon color based on conditions. Useful for visual feedback
based on entity states.

See [`color`](#color).

_Example_:

```yaml
color: >-
  {% if states('sensor.xyz') | int > 100 %}
    red
  {% elif states('sensor.xyz') | int > 50 %}
    orange
  {% else %}
    green
  {% endif %}
```

[🔼 Back to top]

#### `bar_color` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_color`** [JINJA] ➡️ [String]

Conditionally sets the progress bar color using templates. Supports gradients
and complex color logic.

See [`bar_color`](#bar_color).

_Example_:

```yaml
bar_color: >-
  {% set level = states('sensor.battery_level') | int %} {% if level > 80 %}
    linear-gradient(90deg, lightgreen, green)
  {% elif level > 20 %}
    linear-gradient(90deg, yellow, orange)
  {% else %}
    linear-gradient(90deg, orange, red)
  {% endif %}
```

[🔼 Back to top]

---

_This reference guide is adapted for entity-progress-card._

[🔼 Back to top]: #top
[yaml-only]: https://img.shields.io/badge/YAML-Only-orange.svg?style=flat
[Card-OK]: https://img.shields.io/badge/Card-OK-green.svg?style=flat
[Badge-OK]: https://img.shields.io/badge/Badge-OK-green.svg?style=flat
[Feature-OK]: https://img.shields.io/badge/Feature-OK-blue.svg?style=flat
[Template-OK]: https://img.shields.io/badge/Template-OK-green.svg?style=flat
[BadgeTemplate-OK]:
  https://img.shields.io/badge/Badge%20Template-OK-green.svg?style=flat
[String]: #string
[Float]: #float
[Integer]: #integer
[Boolean]: #boolean
[List]: #list-array
[Map]: #map-object
[JINJA]: #jinja
[ha-jinja]: https://www.home-assistant.io/docs/configuration/templating/
[Deprecated Options]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/troubleshooting.md#deprecated-options
[token-color]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/theme.md#token-color
[Accessibility]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/README.md#accessibility
[official HA core]:
  https://github.com/home-assistant/core/tree/dev/homeassistant/components
[jkaberg/hass-byd-vehicle]: https://github.com/jkaberg/hass-byd-vehicle
[townsmcp/mg-saic-ha]: https://github.com/townsmcp/mg-saic-ha
[mnordseth/xpeng-homeassistant]:
  https://github.com/mnordseth/xpeng-homeassistant
[pytoyoda/ha_toyota]: https://github.com/pytoyoda/ha_toyota
[mitch-dc/volkswagen_we_connect_id]:
  https://github.com/mitch-dc/volkswagen_we_connect_id
