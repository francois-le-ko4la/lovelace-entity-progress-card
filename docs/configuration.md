<a id="top"></a>

# Full Configuration Reference

## Introduction

Install the card first: see the [README](../README.md).

This page lists every option of the card, one by one, with an example. An entity
is one thing Home Assistant tracks, such as a sensor or a light: the card shows
one as a bar.

- Want a finished look? Copy a card from the Cookbook's
  [Recreate the Showcase](cookbook.md#recreate-the-showcase), then tweak it
  here.
- Want to see an effect first? Open the Cookbook's
  [Visual Effects](cookbook.md#visual-effects).

The visual editor (the form that opens when you edit a card) sets most options
for you; YAML is the text view of the same settings. To paste an example:

1. Select Edit dashboard, then select the card to edit (or add a new one): the
   card editor opens.
2. In the card editor, select Show code editor.
3. Paste (for a partial example, add only its lines), then Save.

In an example, `# ...your other options` stands for the rest of your card: add
only the new lines to your own YAML, don't replace it. An example that names an
entity, without that line, is a complete card: paste it as a new card.

Options only change how the card looks, except [actions](#behavior-and-actions),
which decide what a tap does, such as switching a light. To undo a change,
remove it and save, or close the editor without saving.

The card shows an error or looks wrong? See
[Troubleshooting](troubleshooting.md#what-you-see-and-what-to-do): it lists each
message the card shows and what to do.

- **[I want to…](#i-want-to)**: find an option from what you want to see, such
  as a bar red under 20 % or the time left.
- **[Conventions](#conventions)**: how an option is written, and what the
  [compatibility labels](#compatibility) under each option name mean. Using the
  normal card? Look for the Card OK label.
- **[Card, Badge and Tile Feature](#standard)**: the options of the card, the
  badge and the tile feature: [data](#data-options), [styling](#styling-options)
  and [actions](#behavior-and-actions).
- **[Template and Badge Template](#template)**: most of the card's options, plus
  fields written in [Jinja](#jinja), a small formula in double braces
  (`{{ … }}`).
- **[Multi-Card and Multi-Feature](#multi)**: several entities in one card or
  one tile feature.

For which variant accepts which option, and whether its visual editor offers it,
see the [option map](option-map.md).

## I want to…

Start from what you want to see: each link opens the option that does it.

| I want to…                                         | Options                                                                                           |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| My card shows an error or looks wrong              | [Troubleshooting](troubleshooting.md#what-you-see-and-what-to-do)                                 |
| Show an attribute instead of the state             | [`attribute`](#attribute)                                                                         |
| Rename the card                                    | [`name`](#name)                                                                                   |
| Change or hide the unit                            | [`unit`](#unit), [`hide`](#hide) (`unit`)                                                         |
| Set the bar's range (0 to 100, or other)           | [`min_value`](#min_value), [`max_value`](#max_value)                                              |
| Choose the text shown                              | [`state_content`](#state_content), [`name_info`](#name_info), [`custom_info`](#custom_info)       |
| Split or round the text                            | [`multiline`](#multiline), [`decimal`](#decimal)                                                  |
| Color by value, my own limits (red under 20 %)     | [`custom_theme`](#custom_theme)                                                                   |
| Color by value, a ready-made scale                 | [`theme`](#theme), [`bar_color_mode`](#bar_color_mode), [`interpolate`](#interpolate)             |
| Color the bar with one color                       | [`bar_color`](#bar_color)                                                                         |
| Change the icon                                    | [`icon`](#icon), [`color`](#color)                                                                |
| Animate the icon or its background                 | [`icon_animation`](#icon_animation), [`force_circular_background`](#force_circular_background)    |
| Add a badge in the icon's corner                   | [`badge_icon`](#badge_icon), [`badge_color`](#badge_color)                                        |
| Size the bar                                       | [`bar_size`](#bar_size), [`bar_max_width`](#bar_max_width), [`bar_single_line`](#bar_single_line) |
| Place the bar                                      | [`bar_position`](#bar_position), [`bar_orientation`](#bar_orientation)                            |
| Add bar effects                                    | [`bar_effect`](#bar_effect), [`bar_segments`](#bar_segments), [`bar_ring`](#bar_ring)             |
| Use a log scale                                    | [`bar_scale`](#bar_scale)                                                                         |
| Line up bars across cards                          | [`bar_aligned`](#bar_aligned)                                                                     |
| Add markers                                        | [`watermark`](#watermark), [`peak_marker`](#peak_marker), [`trend_indicator`](#trend_indicator)   |
| Add alerts and labels                              | [`alert_when`](#alert_when), [`status_label`](#status_label)                                      |
| Format the value                                   | [`value_compact`](#value_compact), [`value_sign`](#value_sign)                                    |
| Place the unit                                     | [`unit_position`](#unit_position), [`unit_spacing`](#unit_spacing)                                |
| Keep text readable over the bar                    | [`text_effect`](#text_effect), [`bar_position`](#bar_position)                                    |
| Show a timer helper's countdown (a `timer` entity) | [`unit`](#unit) (`timer`, `flextimer`), [`reverse`](#reverse)                                     |
| Show an appliance's progress or time left          | [appliance example](#appliance-progress)                                                          |
| Animate a washing machine's icon                   | [`icon_animation`](#icon_animation) (`washing_machine`)                                           |
| Arrange the card                                   | [`layout`](#layout), [`density`](#density)                                                        |
| Reorder the lines                                  | [`content_order`](#content_order), [`reverse_secondary_info_row`](#reverse_secondary_info_row)    |
| Size the card                                      | [`height`](#height), [`min_width`](#min_width)                                                    |
| Remove the frame or margins                        | [`frameless`](#frameless), [`marginless`](#marginless)                                            |
| Center the bar on zero                             | [`center_zero`](#center_zero)                                                                     |
| Hide parts of the card                             | [`hide`](#hide)                                                                                   |
| Put several entities in one bar                    | [`bar_stack`](#bar_stack)                                                                         |
| Show several bars in one card                      | [Multi-Card and Multi-Feature](#multi)                                                            |
| Color from a condition                             | [Template](#template): `color`, `bar_color` in Jinja (not in a Multi-Card row)                    |
| Write a Template card's text, percent or refresh   | [`secondary`](#secondary-jinja), [`percent`](#percent-jinja), [`fast_refresh`](#fast_refresh)     |
| Change what a tap does (actions)                   | [`tap_action`, `hold_action`, `double_tap_action`](#xyz_action)                                   |

[🔼 Back to top]

## Conventions

This section explains how each option below is written.

### Reading an option

#### Overview

Each option starts with its [compatibility labels](#compatibility), then a
one-line summary:

> **`layout`** [String] ➡️ {`horizontal`|`vertical`} _(optional, default:
> `horizontal`)_

- **`layout`**: the option's name, as you write it in YAML.
- **[String]**: the type of value it takes (see [Input types](#input-types)).
- **➡️ {…}**: pick one of these values; `|` means "or".
- **_(optional, default: …)_**: you can leave it out, the card then uses the
  default; _(required)_ means the card needs it.

Then come a description, a YAML example, and notes for special cases.

#### Jinja signatures

For a Jinja field, ➡️ names what the template must produce: `[JINJA] ➡️ string`
means text.

_Example_:

> **`name`** [JINJA] ➡️ string

[🔼 Back to top]

### Input types

#### Standard types

These types describe what each option accepts.

<a id="string"></a> <a id="float"></a> <a id="integer"></a> <a id="boolean"></a>
<a id="list-array"></a> <a id="map-object"></a>

| Type         | Meaning                                        | Example                    |
| :----------- | :--------------------------------------------- | :------------------------- |
| String       | Text: letters, numbers or symbols              | `option: 'xyz'`            |
| Float        | A number, decimals and negatives allowed       | `option: -1.3`             |
| Integer      | A whole number, 0 or more                      | `option: 1`                |
| Boolean      | `true` or `false`, to turn something on or off | `option: true`             |
| List (Array) | Several values, each on its own line after `-` | `option: [item1, item2]`   |
| Map (Object) | Named values, one `key: value` per line        | `option: { key1: value1 }` |

A list or a map can also be written over several lines:

```yaml
option:
  - item1
  - item2
object:
  key1: value1
  key2: value2
```

[🔼 Back to top]

#### JINJA

A fixed text, or a Jinja template: a small formula between double braces, such
as `{{ states('sensor.phone_battery') }}`.

This field supports templating using [Home Assistant Jinja2
templates][ha-jinja], allowing the option to be conditionally rendered.

The only variable the card provides is `entity`: read states and attributes with
Home Assistant's own functions (`states()`, `state_attr()`…). The keyword
`entity` can be used to represent the entity defined at the card level, so you
don't have to repeat the entity ID in every Jinja field.

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

> [!TIP]
>
> In the visual editor (HA 2026.2+), every Jinja field has a bug icon (🐛) in
> its top-right corner — click it to test your template live: it shows the exact
> value your expression currently renders to (or the error, if it doesn't
> parse), right below the field, without saving the card first. On an older Home
> Assistant, save the card and check the result instead.

##### Supported HTML

Fields that render Jinja results as HTML (`name`, `secondary`, `custom_info`,
`name_info`) are **sanitized** before injection. Only the following markup is
kept — everything else is stripped while its text content is preserved:

- **Tags**: `<b>`, `<i>`, `<u>`, `<span>`, `<div>`
- **Attributes**: `class`, and `style` limited to `color`, `background-color`,
  `font-size`, `font-weight`, `text-align`, `width`, `display`, `position` and
  `z-index`

Event handlers (`onclick`, `onerror`, …) are always removed. Any other tag,
links and images included, is unwrapped and keeps its text; `script`, `style`,
`iframe`, `object`, `embed`, `template`, `noscript` and comments are removed
with their content. This protects your dashboard when a template interpolates
strings you don't control (media titles, network device names, …).

> [!NOTE]
>
> `<br>` is not in that list — it's handled separately, only on
> `custom_info`/`secondary`, only when [`multiline`](#multiline) is `true`. Any
> other `<br>` (including in `name`/`name_info`, which have no multiline mode at
> all) is stripped rather than kept, since none of these fields can wrap onto a
> second line outside that one opt-in case.

##### Returning a native type (not just text)

You only need this for [`bar_effect`](#bar_effect),
[`status_label`](#status_label) and [`badge_icon`](#badge_icon), when a template
must return a list or an object instead of text, and for
[`icon_animation`](#icon_animation), whose `jinja` must return a boolean. Home
Assistant then keeps the template's _native_ type (list, dict, number, boolean…)
instead of turning it into text.

This only works when the rendered output is a **single expression** - either a
bare `{{ ... }}` on its own, or an `{% if %}` / `{% elif %}` / `{% else %}`
block where each branch is itself just one `{{ ... }}` (the tags themselves
produce no text, so the actual output is still a single expression, whichever
branch runs).

_Examples_:

```yaml
# inline conditional expression
option: "{{ ['shimmer', 'gradient'] if states(entity) | float > 22 else ['gradient'] }}"
```

```yaml
# block form - just as valid, often more readable with more than two cases
option: |-
  {% if states(entity) | float > 22 %}
    {{ ['shimmer', 'gradient'] }}
  {% else %}
    {{ ['gradient'] }}
  {% endif %}
```

> [!NOTE]
>
> Any text around the expression - even one word or a punctuation mark outside
> the `{{ }}` - turns the result back into plain text.

[`bar_effect`](#bar_effect) is one such field - a template can return a real
list (`{{ ['shimmer', 'gradient'] }}`) instead of the comma-separated string
form shown in its own examples above. [`status_label`](#status_label)'s `jinja`
is another - it can return a `{label, color}` object to set the pill's color
directly instead of following the progress bar's own color.
[`badge_icon`](#badge_icon) is a third - it can return a `{icon, color}` object
to drive both the badge's icon and color from one condition instead of two.

[🔼 Back to top]

### Value shapes & shortcuts

Some options accept a number, another entity or a template, and some accept a
one-word shortcut. This section explains each form once; you can skip it, as
each option's own section shows its full YAML.

#### The value/entity/Jinja shape

[`min_value`](#min_value), [`max_value`](#max_value),
[`alert_when`](#alert_when)'s `above`/`below`, and the value inside
[`watermark`](#watermark)'s `low`/`high` all accept the same three forms:

- A plain number: `min_value: 10`
- Another entity's state, optionally a specific attribute:
  `min_value: { entity: sensor.foo, attribute: bar }`. Without `attribute`, the
  domains of the [default attribute table](#attribute) read that attribute (a
  light's `brightness`, a cover's `current_position`…).
- A Jinja template: `min_value: { jinja: '{{ ... }}' }`

#### Shortcuts for marks

[`watermark`](#watermark)'s `low`/`high` and [`peak_marker`](#peak_marker)'s
`min`/`max`/`average`/`range` are both a "mark" (a line or dot on the bar): a
per-item override object (`type`/`opacity`/`color`/`line_size`; `range` takes no
`line_size`) that falls back to the feature's own shared defaults until it sets
its own. Both also accept a single-word shorthand instead of the full object —
but the shorthand isn't the same _kind_ of value in both:

| Option                                       | Shorthand is a... | Why                                                                                |
| -------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `watermark.low`/`.high`                      | **value**         | the threshold is the whole point — where the mark sits is what you're setting      |
| `peak_marker.min`/`.max`/`.average`/`.range` | **color**         | the value comes from history automatically — color is the only knob worth one word |

#### One-line form

[`badge_icon`](#badge_icon)/[`badge_color`](#badge_color) are plain Jinja
strings. [`status_label`](#status_label) is a Map, but takes the same one-line
form: a plain string is shorthand for `{ jinja: '...' }`, covering most cases,
and the full Map form is there whenever `position`/`color_source` are actually
needed.

[🔼 Back to top]

<a id="badges"></a> <a id="compatibility"></a>

### Compatibility labels

Using the normal card? Look for the Card OK label; the others are for the other
kinds of element.

Under each option name, small colored labels show which kinds of element accept
it. No label for an element means the option does nothing there, with one
exception: a Multi-Card or Multi-Feature row also takes the card options listed
in [Multi-Card and Multi-Feature](#multi). The [option map](option-map.md) has
the full matrix.

| Label                                                    | Component                     | Description                                   |
| :------------------------------------------------------- | ----------------------------- | --------------------------------------------- |
| [![Card OK][Card-OK]](#compatibility)                    | **Card Compatible**           | This option works with the main card display  |
| [![Badge OK][Badge-OK]](#compatibility)                  | **Badge Compatible**          | This option works with the card badge feature |
| [![Feature OK][Feature-OK]](#compatibility)              | **Tile Feature Compatible**   | This option works with the tile feature       |
| [![Template OK][Template-OK]](#compatibility)            | **Template Compatible**       | This option works with the card template      |
| [![Badge Template OK][BadgeTemplate-OK]](#compatibility) | **Badge Template Compatible** | This option works with the badge template     |
| [![Multi-Card OK][MultiCard-OK]](#compatibility)         | **Multi-Card Compatible**     | This option works with the multi-card         |
| [![Multi-Feature OK][MultiFeature-OK]](#compatibility)   | **Multi-Feature Compatible**  | This option works with the multi-feature      |
| [![YAML Only][yaml-only]](#yaml-only)                    | **YAML Only**                 | Not in the visual editor: set it in YAML      |

#### Feature hosts

`entity-progress-feature` and `entity-progress-multi-feature` are card features:
they sit in a host card's `features:` list. If you only use the card or the
badge, you can skip this table.

| Host card                   | Tested | Notes                                                                                                                     |
| --------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------- |
| Tile (Home Assistant)       | ✅ Yes | Takes the tile's entity when the feature sets none; `bar_position: top`/`bottom` included.                                |
| Mushroom Template card (v5) | ✅ Yes | YAML and visual editor, with or without a card entity; `features_position` `bottom` or `inline`, `top`/`bottom` included. |

#### YAML Only

The following label is used throughout this documentation:

[![YAML Only][yaml-only]](#yaml-only)

These options are not available in the visual card editor and must be configured
manually in YAML mode.

[🔼 Back to top]

<a id="standard"></a>

## Card, Badge and Tile Feature

Options of three kinds of element: the card (`custom:entity-progress-card`), the
badge (`custom:entity-progress-badge`) and the tile feature
(`custom:entity-progress-feature`, in a Tile card's `features:`). The labels
under each option name say which of them accept it
([Compatibility labels](#compatibility)): using the normal card, look for the
Card label.

### Data Options

Options related to entity data, attributes, value display logic, and metadata.

#### `entity`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`entity`** [String] _(required; optional on the tile feature, which then
> takes the Tile card's entity)_

The entity the card shows, such as `sensor.phone_battery`. In the visual editor,
pick it from the list.

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.hp_envy_6400_series_tri_color_cartridge
```

> [!NOTE]
>
> This option is optional with `custom:entity-progress-card-template` and
> `custom:entity-progress-badge-template`.

> [!NOTE]
>
> Any entity with a number as its state works (sensors, `number`,
> `input_number`, `counter`, `timer`...). To read one of its attributes instead,
> use [`attribute`](#attribute).

> [!IMPORTANT]
>
> Timers are supported (since 1.0.43). `attribute`, `min_value` and `max_value`
> are ignored for a timer.

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

`attribute` is ignored on these entities, which use their own value and range
(it must still exist on the entity, or the card shows an attribute-not-found
error):

- counter
- number, input_number
- timer

On a duration sensor, an attribute is read as a plain number, without duration
conversion.

_default attribute:_

| entity (supported) | default attribute   |
| :----------------- | :------------------ |
| climate.xxx        | temperature         |
| cover.xxx          | current_position    |
| fan.xxx            | percentage          |
| humidifier.xxx     | current_humidity    |
| light.xxx          | brightness          |
| media_player.xxx   | volume_level        |
| valve.xxx          | current_position    |
| water_heater.xxx   | current_temperature |
| weather.xxx        | temperature         |

`brightness` (0-255) and `volume_level` (0-1) are rescaled to 0-100 by the card,
so their `max_value` stays on the usual percentage scale - setting
`max_value: 255` divides the bar a second time. With the attribute written
explicitly (`attribute: brightness`), a `max_value` equal to that native scale
is dropped instead, silently (the editor's Migrate button lists it).

[🔼 Back to top]

#### `name`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`name`** [String] _(optional)_

On the Template and Badge Template, `name` is a Jinja string: see
[`name` (Jinja)](#name-jinja).

The name displayed on the progress bar. If omitted, the entity's `friendly name`
will be used.

_Default_:

- `<entity_name>`

_Simple Usage_:

You can provide a simple string for a static label.

```yaml
type: custom:entity-progress-card
# ...your other options
name: ABC
```

_Advanced Usage_:

To build a dynamic name, you can provide a list of objects. This allows you to
combine static text with Home Assistant metadata. Elements are concatenated with
a space automatically.

```yaml
type: custom:entity-progress-card
# ...your other options
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

A single object (`name: { type: area }`) is shorthand for a one-item list. An
unknown `type`, or a `text` item without its `text`, drops the whole `name`: the
card stays valid and shows the entity's own name.

[🔼 Back to top]

#### `unit`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`unit`** [String] _(optional)_

The text shown after the value, such as `°C` or `kWh`. Without it, the card uses
the entity's own unit.

| `unit`      | Shown as                                           |
| :---------- | :------------------------------------------------- |
| `°C`, `kWh` | the value, followed by that unit                   |
| `%`         | the percentage between `min_value` and `max_value` |
| `timer`     | a timer as HH:MM:SS                                |
| `flextimer` | a timer as `42s`, then `05:03`, then `01:02:03`    |

`timer` and `flextimer` apply to `timer` entities and duration sensors; on any
other entity they show as plain text.

_Unit selection_:

- If a `unit` is manually specified in the configuration, it will be used.
- Otherwise, if `max_value` is an entity, the default unit (%) will be used.
- Otherwise, the `unit` is automatically determined based on the current value:
  - If the entity is a `timer`, it is shown as `flextimer`, with its minimum and
    maximum in seconds.
  - If the entity is a `duration` (`device_class: duration`, or a time
    `unit_of_measurement`): the card works in the entity's own unit (e.g., `h`),
    and `min_value`, `max_value`, `watermark` and `alert_when` are read in that
    unit. Without a `unit`, the duration is displayed in a natural format (e.g.,
    2h 32min). A time `unit` (`d`, `h`, `min`, `s`, `ms`, `μs`) converts the
    value, and the minimum and maximum are then read in that unit.
  - If the entity is a `counter`, no unit ('') will be displayed.
  - If the entity is a `climate`, Home Assistant's temperature unit is used; a
    `weather` entity uses its `<attribute>_unit` attribute (e.g.
    `temperature_unit`).
  - Otherwise, the `unit` defined in Home Assistant for the entity will be used
    (e.g., °C, kWh, etc.).

> [!NOTE]
>
> Specifies the `unit` to display the entity's actual value, ignoring
> `max_value`. Even if the displayed value uses an automatically detected unit,
> the progress bar still relies on max_value to calculate the percentage.

> [!NOTE]
>
> While an active `timer` entity counts down, the card refreshes its display the
> moment the value shown changes: every second, or with `unit: '%'` at each new
> percentage step (never more than once a second) — no extra config needed, this
> follows `unit` and `decimal` automatically.

> [!WARNING]
>
> A time `unit` converts a duration sensor, not a `timer` entity: on a timer,
> `s`, `min` or `h` show its seconds unchanged. To show a timer as a time, use
> `timer` or `flextimer`.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
unit: timer # a timer as HH:MM:SS
```

To hide the unit, use `hide: ['unit']` (see [`hide`](#hide)).

[🔼 Back to top]

#### `decimal`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`decimal`** [Integer] _(optional)_

Defines the number of decimal places to display for numerical values.

The `decimal` value will be determined based on the following priority:

- If `decimal` is explicitly set in the YAML configuration, it is used.
- Otherwise, if the entity has a custom `Display Precision` set in Home
  Assistant (i.e., a value manually configured by the user and different from
  the default), it is used. A Display Precision of 0 is not used: the default
  below applies.
- Otherwise, the `default` number of decimals is selected based on the type of
  value:
  - If the value represents a `timer`, the timer default is used.
  - If the value represents a `counter`, the counter default is used.
  - If the value represents a `duration`, or if the entity's own unit (not the
    `unit` option) is one of d (or `j`, the French abbreviation), h, min, s, ms,
    or μs, the duration default is used. A duration with no `unit` option shows
    Home Assistant's own formatted state, where `decimal` doesn't apply.
  - If the unit is `%` (the default unit), the `percentage` default is used.
  - Otherwise, the other default is applied (for units like °C, kWh, etc.).

_Default values:_

| Value                                   | `decimal` |
| :-------------------------------------- | :-------- |
| Percentage (%)                          | `0`       |
| Timer, duration, time units (s, min, h) | `0`       |
| Counter                                 | `0`       |
| Other units (°C, kWh...)                | `2`       |

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`min_value`** [Float]|[Map] _(optional, default: `0`; minus `max_value` with
> `center_zero`)_

Defines the minimum value to be used when calculating the percentage.

This allows the percentage to be relative to both a minimum (`min_value`, which
represents 0%) and a maximum (`max_value`, which represents 100%).

`min_value` accepts three forms — like `max_value`, each mode uses its own
explicit key, so there is nothing to guess from the value's shape (see
[Value shapes & shortcuts](#value-shapes--shortcuts) — the same shape is reused
by several other options):

- a fixed number, such as `10`,
- `{ entity: ..., attribute: ... }` — an entity ID whose state is used as the
  minimum (`attribute` is optional, to read a specific attribute instead of the
  state),
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, three buttons (Fixed value / Entity / Template) let you
switch between the three modes.

> [!NOTE]
>
> A `counter`, `number` or `input_number` carries its own range, which the card
> uses when you set no bounds — see
> [`counter` and `number` entities](#counter-number-range).

_Fixed value example_:

```yaml
type: custom:entity-progress-card
# ...your other options
min_value: 10
```

Suppose you are measuring the weight of a connected litter box, where:

- `min_value` = 6 (the minimum weight representing an empty box, i.e., 0%).
- `max_value` = 11 (the maximum weight representing a full box, i.e., 100%).
- the current weight is 8,
- so the bar shows 40 %.

_Entity example_:

```yaml
type: custom:entity-progress-card
# ...your other options
min_value:
  entity: sensor.night_baseline_power
  attribute: today  # optional
```

_Jinja example_:

```yaml
type: custom:entity-progress-card
# ...your other options
min_value:
  jinja: "{{ states('input_number.floor') | float }}"
```

**Edge cases: `center_zero` and themes**

When `center_zero` is enabled and `min_value` isn't set, it defaults to the
negative of `max_value` instead of `0` — e.g. `-100` if `max_value` is also left
at its default, or `-3000` if `max_value: 3000` (`-100` when `max_value` comes
from an entity or Jinja). Without this, the negative half would have no range at
all (`0` to `0`) and could never show anything. Set `min_value` explicitly (even
to `0`) to override this.

> [!NOTE]
>
> Outside `center_zero`, `min_value` always stays at its own default (`0`) even
> with a built-in real-world-value theme active (e.g. `temperature`, whose zones
> reach down to `-50°C`) — only `max_value` defaults from the theme (see its own
> section below). `[min_value, max_value]` is the visible "scope" a theme's
> zones get projected across (see [`bar_color_mode`](#bar_color_mode)
> `segment`/`rainbow`): by default that scope is the theme's positive branch
> only (`0` to `max_value`), which is assumed to be what's actually in view
> unless you explicitly widen `min_value` yourself. Pulling `min_value` down to
> the theme's own lowest bound automatically would instead stretch the _entire_
> theme range (including zones for values the entity may never reach) across the
> visible bar.
>
> With `center_zero` active and a built-in real-world-value theme, the
> negative-branch default described above (negative of `max_value`) is instead
> the theme's own lowest zone bound (e.g. `-50` for `temperature`, not `-100`) —
> the theme already defines how far its negative branch realistically extends,
> which is a better default than an arbitrary mirror of `max_value`.

[🔼 Back to top]

#### `max_value`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`max_value`** [Float]|[Map] _(optional, default: `100`)_

Allows representing standard values and calculating the percentage relative to
the maximum value. It must differ from `min_value`: equal bounds show `Div0`.

`max_value` accepts three forms — like `min_value`, each mode uses its own
explicit key, so there is nothing to guess from the value's shape (see
[Value shapes & shortcuts](#value-shapes--shortcuts)):

- a fixed number, such as `10`,
- `{ entity: ..., attribute: ... }` — an entity ID whose state is used as the
  maximum (`attribute` is optional, to read a specific attribute instead of the
  state),
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, three buttons (Fixed value / Entity / Template) let you
switch between the three modes.

<a id="counter-number-range"></a>

##### `counter`, `number` and `input_number` entities bring their own range

A [`counter`](https://www.home-assistant.io/integrations/counter/) carries
`minimum`/`maximum`, and a
[`number`](https://www.home-assistant.io/integrations/number/) or `input_number`
carries `min`/`max`. The card reads those attributes and scales the bar on them,
so such an entity needs no bounds at all to render correctly.

Write `min_value` or `max_value` yourself and **yours wins** — fixed value,
entity or Jinja alike. The entity's own range is a default, not a ceiling you
are stuck with.

With [`center_zero`](#center_zero) and no `min_value`, the entity's own minimum
stays when it already reaches below the zero point (a `number` from `-50` to
`10`). Otherwise the card mirrors the maximum, as for any other entity: a
`counter` from `0` to `10` runs from `-10` to `10`.

That distinction matters because a native range is often a **device limit**
rather than a display range: an inverter's power limit stops at the hardware's
rated output. Reading against a manufacturer's maximum is rarely what a
dashboard is for.

```yaml
type: custom:entity-progress-card
entity: number.inverter_limit_absolute
# The entity reports its own max - the inverter's rating. The bar reads
# against 1000 instead.
max_value: 1000
min_value: 0
```

> [!IMPORTANT]
>
> Prior to 1.6, `max_value` also accepted a bare entity ID string
> (`max_value: sensor.xxx`), disambiguated from a fixed value at runtime by its
> type. **This form is deprecated** (a console warning is logged) but still
> works — it is automatically migrated to the map form for you, together with
> the also-deprecated `max_value_attribute` option. Please update your YAML to
> the new form when convenient.

_Default_:

- `100`, unless a built-in `theme` with real-world value zones (not `%`-based —
  e.g. `temperature`, `voc`, `pm25`) is active and `max_value` is left unset:
  then it defaults to that theme's own highest zone bound instead (see the note
  below). `custom_theme` never changes this default — see the note. `min_value`
  is unaffected either way — see its own section above.

> [!NOTE]
>
> Some built-in themes (`temperature`, `voc`, `pm25`…) define their color zones
> in real-world units, not `%` — e.g. `temperature`'s zones span `-50°C` to
> `100°C`. Since picking one of these themes is already a deliberate choice tied
> to that specific kind of entity, `max_value` is safe to assume from the
> theme's own scale: when it's left unset with one of these themes active, it
> automatically defaults to the theme's own highest zone bound instead of `100`,
> so a plain `theme: voc` with no other config already fills correctly
> (`min_value` stays `0` by default — see its own section above for why, and for
> the `center_zero` case). Setting `max_value` explicitly (to any value,
> including `100`) always overrides this and is used as-is.
>
> [`bar_color_mode`](#bar_color_mode) `segment`/`rainbow` projects a theme's
> zones onto `[min_value, max_value]` — that range is the visible "scope": zones
> (or the parts of zones) that fall inside it get stretched proportionally
> across the bar, and anything outside it is clipped or omitted, not stretched
> to fit. This is what makes the zone at a given fill level match the raw value
> it represents — e.g. with `theme: temperature`'s default scope (`0` to `100`),
> a `35°C` reading lands in the zone that's genuinely at 35% of that scope.
> Widening `min_value` (or enabling `center_zero`) widens the scope, and with
> it, which of the theme's zones become reachable. See [`theme`](theme.md) for
> each built-in theme's own zone ranges.
>
> `custom_theme` zones are real values too, but never drive `max_value`'s
> default: their bounds are entirely user-defined and may intentionally extend
> past the entity's real range (e.g. a color safety-margin zone on a percent
> sensor that could technically read slightly above 100) without meaning to
> redefine what counts as "full". `max_value` stays whatever you set (or the
> flat `100` default) regardless of `custom_theme`'s zones — the same
> `[min_value, max_value]` scope still applies to its zones for
> `segment`/`rainbow`, so set both yourself if your entity's real range doesn't
> match your zones' own scale.

_Fixed value example_:

```yaml
type: custom:entity-progress-card
# ...your other options
max_value: 255
```

_Entity example_:

```yaml
type: custom:entity-progress-card
# ...your other options
max_value:
  entity: sensor.total_capacity
  attribute: today  # optional
```

_Jinja example_:

```yaml
type: custom:entity-progress-card
# ...your other options
max_value:
  jinja: "{{ states('input_number.ceiling') | float }}"
```

<a id="appliance-progress"></a>

##### Appliance progress

Replace the sensor names below with yours: in Home Assistant, **Settings** ➡️
**Devices & services** ➡️ **Entities**, search for your appliance, open the
entity, and copy its Entity ID, such as `sensor.dishwasher_remaining_time`, from
its settings (gear icon). No sensor with "remaining", "progress" or "time" in
its name? Your appliance doesn't report its progress to Home Assistant, and the
card can't show it.

If your appliance only gives the time left (such as
`sensor.dishwasher_remaining_time`, in minutes), the card shows it as a duration
(`1h 12min`). Set `max_value` to your longest program, in the sensor's unit, so
the bar empties as the time runs out:

```yaml
type: custom:entity-progress-card
entity: sensor.dishwasher_remaining_time
max_value: 180 # the longest program, in minutes
```

Take the longest program from the appliance's manual; if the bar stays full for
a while at the start, raise the number. If you see a plain number instead of
`1h 12min`, the sensor isn't a duration: add `unit: min`.

If your appliance has a percentage sensor, this is all you need. Home Connect
(Bosch/Siemens) has `sensor.<appliance>_program_progress` (0-100 %), so `entity`
alone is enough, no `max_value` needed:

```yaml
type: custom:entity-progress-card
entity: sensor.washing_machine_program_progress
```

If the appliance gives an elapsed and a remaining time, as Miele does (in
minutes), add them up into `max_value`: the bar then shows the share done. Set
`unit: '%'` to read a percentage rather than the elapsed time:

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`reverse`** [Boolean] _(optional, default: `false`)_

For a `timer` entity only: `true` shows the time remaining (a countdown),
`false` (the default) the time elapsed. It has no effect on other entities. An
idle timer is never reversed: it shows its state text instead of a time. The
Tile Feature has no `reverse`: a timer there always shows the time remaining.

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`state_content`** [String]|[List] _(optional)_

What to show next to the value: `state`, `last_changed`, `last_updated` (shown
as a relative time), `device_name`, `area_name`, or any attribute of the entity.
Give one item, or a list. Every listed item is shown, in order, separated by
`·`. Without it, nothing extra is shown.

_Accepted values_:

- state — Displays the entity's main state.
- current_position — Displays the current position attribute (commonly used for
  covers, blinds, etc.).
- Other custom attributes from the entity can also be listed.

> [!TIP]
>
> Attributes listed here are shown in your language and format, as Home
> Assistant displays them. For free text, use [`custom_info`](#custom_info).

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
state_content:
  - state
  - current_position
```

> [!NOTE]
>
> - The listed items are shown before the main value by default;
>   [`content_order`](#content_order) can move them.
> - Check the attribute names in **Settings** ➡️ **Tools** ➡️ **States**: a name
>   the entity doesn't have shows no value.

[🔼 Back to top]

#### `custom_info`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

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
# ...your other options
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

> [!NOTE]
>
> [`density: compact`](#density), [`single_line`](#density) and
> [`single_column`](#density) all clear this option and hide the field from the
> editor while active.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

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
# ...your other options
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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_stack`** [Map] _(optional)_

Combines several entities into the same progress bar. Available in the visual
editor via a dedicated row editor (entity/attribute/color/subtract per row) and
a Stacked/Proportional/Net mode switch.

[Preview in the Cookbook](cookbook.md#effect-bar-stack).

| Mode                    | What it looks like                                                   | Use it for                                          |
| :---------------------- | :------------------------------------------------------------------- | :-------------------------------------------------- |
| `stacked` (the default) | Segments one after another, each at its real size; the rest is empty | A breakdown that may not fill the range (a battery) |
| `proportional`          | Segments share the filled part, each by its part of the total        | Several sensors toward one limit (circuits)         |
| `net`                   | One plain segment: the total, subtractions included                  | A balance that goes either way (grid minus solar)   |

| Key        | Type                               | Default   | Description                                                                                                                                                                                                            |
| ---------- | ---------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`     | `stacked` / `proportional` / `net` | `stacked` | See below                                                                                                                                                                                                              |
| `entities` | List                               | —         | Each entry: `entity` _(required)_, `attribute` _(optional)_, `color` _(optional, falls back to an automatic shade of the main entity's own color; ignored in `net` mode)_, `subtract` _(optional boolean — see below)_ |

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

Details per mode:

- **`stacked`**: each entity at its true width on the `min_value`/`max_value`
  scale, one after another (see _Order_ below); the rest stays empty.
- **`proportional`**: each entity takes its share of the filled part; the bar is
  full only once the total reaches `max_value`.
- **`net`**: one segment for the total, in the bar's own color or theme (no
  per-entity `color`); with `center_zero`, a balance that goes either way.

**`subtract` and overflow**

`subtract: true` on an entity means "this value counts against the total instead
of with it" — what that looks like depends on the mode:

- In **`net`**, it's subtracted from the algebraic total (see the `net` example
  above).
- In **`stacked`/`proportional`** _combined with `center_zero`_, entities split
  into two independent arms instead of a single breakdown: every entity goes to
  the _positive_ arm (growing right from the zero point) by default, and to the
  _negative_ arm (growing left) if it's marked `subtract` **or its own raw value
  is already negative** — the main entity included (see below). Both arms render
  and fill independently — e.g. a consumption arm and a production arm both
  visible at once, each showing its own true length, rather than one value
  canceling the other out.
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

An entry without a valid `entity` is skipped, and an unavailable entity is left
out of the totals.

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

[🔼 Back to top]

### Styling Options

Customize the look and feel: icons, layout, colors, sizes, and visual themes. To
line up bars across cards, see [`bar_aligned`](#bar_aligned) (in the Multi
section).

[🔼 Back to top]

#### `icon`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)

> **`icon`** [String] _(optional)_

Replaces the entity's icon with the one you choose.

_Examples:_ `mdi:lightbulb`, `mdi:thermometer`...

```yaml
type: custom:entity-progress-card
# ...your other options
icon: mdi:grain
```

_Order of Priority for the Icon:_

- An entity that doesn't exist always shows `mdi:help`, before anything else.
- Theme/Custom Theme: The icon derived from the theme or style applied to the
  item.
- Icon Parameter: A custom icon specifically defined for the item.
- The entity's picture (`entity_picture`), when it has one and no `icon` is set.
- Entity icon.

[🔼 Back to top]

#### `color`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`color`** [String] _(optional)_

The color of the icon. Accepts [color names][token-color], CSS color names, RGB
values, or HEX codes. By default, the color is the one Home Assistant's theme
gives the entity, by domain, device_class and state (31 domains, plus battery
levels), as on its tiles. Other entities use `var(--state-icon-color)`. An
active [`theme`](#theme) or [`custom_theme`](#custom_theme) takes precedence. An
unavailable or missing entity always shows its fixed fault color, whatever
`color` says.

_Examples:_ `"green"`, `"rgb(68, 115, 158)"`, `"#FF5733"`,
`var(--state-icon-color)`...

```yaml
type: custom:entity-progress-card
# ...your other options
color: rgb(110, 65, 171)
```

> [!NOTE]
>
> A Multi-Card or Multi-Feature row takes a plain value here, no Jinja (see
> [Multi-Card and Multi-Feature](#multi)).

[🔼 Back to top]

#### `icon_animation`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`icon_animation`** [String]|[Map] ➡️
> {`spin`|`pulse`|`bounce`|`shake`|`ping`|`reveal`|`washing_machine`|`battery_charging`}
> _(optional — omit for no animation; `none` is deprecated)_

Makes the icon move while the device is running: a spinning fan, a pulsing media
player. The animation stops when the device stops.

[Preview in the Cookbook](cookbook.md#effect-icon-animation).

_Example_:

```yaml
type: custom:entity-progress-card
entity: fan.living_room
icon_animation: spin
```

_Options_:

| option             | description                                                                                 |
| :----------------- | :------------------------------------------------------------------------------------------ |
| `spin`             | Continuous rotation                                                                         |
| `pulse`            | Gentle scale/opacity pulse                                                                  |
| `bounce`           | Squash-and-stretch bounce                                                                   |
| `shake`            | Small vibration jitter                                                                      |
| `ping`             | Expanding ring pulse around the icon's shape                                                |
| `reveal`           | Icon grows into view in circular steps                                                      |
| `washing_machine`  | Shake + porthole wipe, for washer/dryer entities                                            |
| `battery_charging` | Sweeping fill wipe, active while charging (device battery attribute or EV `charging` state) |

**When an animation plays**

Most animations only play while the entity is genuinely "active": they are
automatically disabled for entities without an active/inactive concept (plain
sensors, numbers, batteries...) and for entities in a resting state (`off`,
`idle`, `paused`, `closed`, `locked`, ...). `washing_machine` and
`battery_charging` are the two exceptions.

`washing_machine` also triggers when `entity` — or another `sensor` on the same
device, since `entity` is often the progress percentage rather than the status
itself (see [`max_value`](#max_value)) — has a state of `run` or `in_use`
(case-insensitive; the same-device check reads `sensor` entities only, see the
table below). No config needed: every same-device sensor is checked
automatically, the same way `battery_charging` resolves its own status entity. A
`binary_sensor`/`switch` based setup (e.g. a smart-plug power monitor) keeps
working as before, with no extra state check needed.

Verified against these appliance integrations:

| Brand                                            | Entity                                                                 | Recognized as running |
| ------------------------------------------------ | ---------------------------------------------------------------------- | --------------------- |
| Home Connect, Bosch/Siemens ([official HA core]) | `sensor.<appliance>_operation_state` (`device_class: enum`)            | state `run`           |
| Miele ([official HA core])                       | `sensor.<appliance>_status` (`device_class: enum`, key `state_status`) | state `in_use`        |
| Samsung SmartThings ([official HA core])         | `sensor.<appliance>_machine_state` (`device_class: enum`)              | state `run`           |

`battery_charging` has no active/inactive concept to key off at all, so it
instead considers the entity charging when either is true:

- its own state is one of `charging`, `charge_in_progress`,
  `v2g_charging_normal`, `charging (ac)`, `charging (dc)`,
  `super offboard charging`, or
- it has `device_class: battery_charging` and its state is `on` (any domain), or
- one of these attributes is boolean `true` or the string `charging`:
  `battery_charging`, `charging`, `is_charging`.

State and string comparisons are case-insensitive.

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
shown (your `icon:` override, else the entity's `icon` attribute) contains
`-charging-` or ends with `-bluetooth` (e.g. `mdi:battery-charging-80`,
`mdi:battery-charging-wireless`, `mdi:battery-bluetooth`; a plain
`mdi:battery-charging` is not shifted), the icon already draws its own
bolt/bluetooth glyph at a different position, so the card automatically nudges
the sweep to compensate instead of changing the icon. This compensation is tuned
against MDI's `battery-charging*` icons; other icon packs, or
`battery-bluetooth*`, aren't verified and may not line up.

**Triggering an animation from a condition instead of entity state**

`icon_animation` also accepts a Map form — `{ effect, jinja }` — for cases the
automatic detection above doesn't cover (e.g. a plain `sensor` with a numeric
value, no active/inactive concept at all). It fully replaces the automatic
detection: `effect` plays exactly when `jinja` resolves to `true`, nothing else
is checked.

_Map definition_:

- `effect` (string, optional): any value from the table above. No animation
  plays until one is chosen.
- `jinja` (JINJA): a boolean-evaluating expression.

> [!IMPORTANT]
>
> `jinja` must return a native boolean: a bare `{{ ... }}` expression, or a
> `{% if %}` block whose every branch is a single `{{ ... }}` (see
> [Returning a native type](#returning-a-native-type-not-just-text)). A block
> that writes `true`/`false` as text, or a plain string like `"true"`, comes
> back as the word `"true"`/`"false"`, which the card does not read as a
> boolean: the animation never plays (no fallback to the automatic detection,
> and no error).
>
> ```yaml
> # correct - a single boolean expression
> jinja: "{{ states('sensor.x')|float(0) > 3 }}"
>
> # correct - a single boolean expression comparing a state
> jinja: "{{ states('sensor.dishwasher_operation_state') | lower == 'run' }}"
>
> # correct - each branch is a single expression
> jinja: >-
>   {% if is_state('sensor.x', 'on') %}{{ true }}{% else %}{{ false }}{% endif %}
>
> # wrong - the block writes the words true/false as text
> jinja: >-
>   {% if states('sensor.x')|float(0) > 3 %}true{% else %}false{% endif %}
>
> # wrong - a literal string, not a template at all
> jinja: "true"
> ```

_Example_:

```yaml
type: custom:entity-progress-card-template
entity: sensor.robot_piscine_heures_de_filtrage_recommandees
icon_animation:
  effect: spin
  jinja: "{{ states('sensor.robot_piscine_heures_de_filtrage_recommandees')|float(0) > 3 }}"
```

[🔼 Back to top]

#### `badge_icon`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`badge_icon`** [JINJA] _(optional)_:

The `badge_icon` option lets you display a dynamic badge, offering a quick
status hint or symbolic representation based on logic or sensor values.

See [JINJA]. The template must return an `mdi:` icon name. While the card's own
alert badge shows, `badge_icon` and `badge_color` are hidden;
[`badge_color`](#badge_color) alone shows a plain colored badge.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
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

> [!TIP]
>
> `badge_icon` can also resolve to a native `{icon, color}` object instead of
> just an icon name, to set both from the same condition instead of writing it
> twice across `badge_icon` and [`badge_color`](#badge_color) — which then
> stands down while `badge_icon`'s object provides its own `color`. Omit `color`
> (or leave it empty) from the object and [`badge_color`](#badge_color) takes
> back over automatically, if configured. See
> [Returning a native type](#returning-a-native-type-not-just-text) for the
> Jinja syntax this needs.
>
> ```yaml
> badge_icon: >-
>   {{ {'icon': 'mdi:weather-sunny-alert', 'color': '#ff0000'}
>      if states('sensor.temperature') | float > 30
>      else {'icon': 'mdi:thermometer', 'color': '#4caf50'} }}
> ```

> [!TIP]
>
> Either key can be left out of the object - only `color` (no `icon`) is handy
> to set the badge's color alone from `badge_icon`, without an icon of its own:
>
> ```yaml
> badge_icon: "{{ {'color': '#ff0000'} if is_state('binary_sensor.door', 'on') else {} }}"
> ```

[🔼 Back to top]

#### `badge_color`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`badge_color`** [JINJA] _(optional)_:

The `badge_color` option lets you setup a dynamic badge's background color,
offering a quick status hint or symbolic representation based on logic or sensor
values.

See [JINJA].

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_color`** [String] _(optional, default: the entity's state color)_

The color of the progress bar. Accepts [color names][token-color], CSS color
names, RGB values, or HEX codes. By default, it follows the same state color as
[`color`](#color). An active [`theme`](#theme) or
[`custom_theme`](#custom_theme) takes precedence. An unavailable or missing
entity draws a grey bar, an `unknown` one the default color, whatever
`bar_color` says.

_Examples:_ `"blue"`, `"rgb(68, 115, 158)"`, `"#FF5733"`,
`var(--state-icon-color)`

```yaml
type: custom:entity-progress-card
# ...your other options
bar_color: rgb(110, 65, 171)
```

> [!NOTE]
>
> A Multi-Card or Multi-Feature row takes a plain value here, no Jinja (see
> [Multi-Card and Multi-Feature](#multi)).

[🔼 Back to top]

#### `bar_size`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_size`** [String] ➡️ {`xsmall`|`small`|`medium`|`large`|`xlarge`}
> _(optional, default: `small`, `xlarge` for the Tile Feature, `small` in a
> Multi)_

Sets how thick the bar is, from `xsmall` (a thin line) to `xlarge` (a thick
band). `xsmall` packs more bars in a tight space, such as an
[`entity-progress-multi-feature`](#multi).

> [!NOTE]
>
> The Tile Feature defaults to `xlarge` instead of `small`: unlike Card/Badge/
> Template, its row height is fixed (it doesn't grow or shrink with `bar_size`),
> so a thin `small` bar looks lost inside that space.

> [!IMPORTANT]
>
> Badge and Badge Template don't offer `xlarge` ({`xsmall`|`small`|`medium`|
> `large`} only): it sets a fixed 42px bar height, taller than a badge's entire
> height (`--ha-badge-size`, 36px by default), so it would overflow the badge.

> [!IMPORTANT]
>
> If [`bar_position`](#bar_position) is `top`, `bottom`, `overlay`, or
> `background`, `bar_size` is ignored: each of these positions sets its own
> fixed bar thickness. `default` and `below` still honor `bar_size` normally,
> except an upright bar (`bar_orientation: up`/`down`) in the default stack of
> `layout: vertical`, which takes the column's height.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
bar_size: medium
```

[🔼 Back to top]

#### `bar_position`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`bar_position`** [String] ➡️ {`default`|`below`|`compact_below`|`top`|
> `bottom`|`overlay`|`background`|`icon`} _(optional, default: `default`)_

Defines the position of the progress bar within the card, or puts it around the
icon (`icon`, see below).

_Options:_

| option          | description                                                          | Card | Template | Feature |
| :-------------- | :------------------------------------------------------------------- | :--: | :------: | :-----: |
| `default`       | Standard position (inline with content)                              |  ✅  |    ✅    |   ✅    |
| `below`         | Below the content as a dedicated row                                 |  ✅  |    ✅    |    —    |
| `compact_below` | Like `below`, but `name`/value share one row (value right-justified) |  ✅  |    ✅    |    —    |
| `top`           | At the top of the card edge                                          |  ✅  |    ✅    |   ✅    |
| `bottom`        | At the bottom of the card edge                                       |  ✅  |    ✅    |   ✅    |
| `overlay`       | Overlaid on top of the content                                       |  ✅  |    ✅    |    —    |
| `background`    | Fills the entire card as a background layer, behind the content      |  ✅  |    ✅    |    —    |
| `icon`          | A ring around the icon, in place of the bar — see below              |  ✅  |    ✅    |    —    |

> [!WARNING]
>
> If `bar_position` is `top`, `bottom`, `overlay`, or `background`, the
> `bar_size` option is ignored (see [`bar_size`](#bar_size)). `below` still
> honors it.

A Multi-Card takes `default` and `overlay` only, set at the top level (see
[`layout` and `bar_position`](#multi-layout)); a Multi-Feature has no
`bar_position`.

> [!NOTE]
>
> Some combinations change `bar_position` on their own:
> [`density: single_column`](#density) keeps `overlay` and turns anything else
> into `default`; `icon` falls back to `default` when [`hide`](#hide) contains
> `progress_bar`; with `bar_size: xlarge`, `default` and `compact_below` become
> `below` (not on the Tile Feature, nor with `density: single_line` or
> `single_column`, which draw `xlarge` as `large`).

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.phone_battery
bar_position: overlay
```

> [!NOTE]
>
> The Tile Feature only supports `default`/`top`/`bottom`: it's a single row
> added to an existing Tile card, not a full card with its own dedicated rows or
> content to overlay/background — `below`, `compact_below`, `overlay`,
> `background` and `icon` don't apply to that context. Badge and Badge Template
> take `default` and `icon` only.

**`icon`: a ring around the icon**

The bar becomes a ring around the icon, filling clockwise from the top. The card
keeps its size and its text; only the straight bar goes.

- [`bar_size`](#bar_size) sets the ring's thickness. On a card the ring keeps
  one outer size and the icon's circle gives way inside it; on a badge the ring
  goes around the icon, 1px thicker than a card's for `xsmall`, `small` and
  `medium`, the same for `large`. `xlarge` adds no row here.
- [`bar_orientation`](#bar_orientation) `counterclockwise` turns it
  counter-clockwise.
- [`bar_color`](#bar_color), [`theme`](#theme) and
  [`bar_color_mode`](#bar_color_mode) color it: `segment` and `rainbow` show
  each zone at its place round the ring, `rainbow_full` paints every zone all
  the way round with a pin at the value.
- [`watermark`](#watermark) and [`peak_marker`](#peak_marker) are drawn on the
  ring: a zone as an arc, a point as a tick across it. On a ring, `striped` and
  `blended` read as `area`, `triangle` and `round` as the same pin.
- It fills from empty when the card appears and follows each change, like the
  bar.
- [`center_zero`](#center_zero) puts the zero at the middle of the arc.
- [`bar_segments`](#bar_segments) cuts the arc into blocks (with `center_zero`,
  that many per arm).
- [`bar_effect`](#bar_effect) takes `glass`, `gradient` and `gradient_reverse`;
  `radius`, `shimmer`, `shimmer_reverse` and `wave` have no effect here.
- `bar_orientation: ltr`/`rtl` read as `clockwise`/`counterclockwise`.
- [`bar_stack`](#bar_stack) has no effect here yet.

```yaml
type: custom:entity-progress-card
entity: sensor.phone_battery
bar_position: icon
bar_size: medium
theme: optimal_when_high
bar_color_mode: segment
```

> [!NOTE]
>
> `compact_below` only has a distinct effect with `layout: horizontal` (the
> default) — reuses the dead space to the right of `name` for the value/unit
> instead of leaving it blank, freeing the bar below to use the card's full
> width. With `layout: vertical`, where there's no such row to reuse, it
> silently falls back to `default`. With [`bar_size`](#bar_size) `xlarge`, it
> falls back to `below` instead — same as `default` does at that size, the
> shared name/secondary_info row reads as too tight above a bar that large.

> [!NOTE]
>
> [`density: compact`](#density) restricts this to `top`, `bottom`, `background`
> or `icon` — any other value falls back to `top` while `compact` is active.
> [`density: single_line`](#density) clears it back to `default` instead: the
> bar sits in the row itself there.

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

[🔼 Back to top]

#### `bar_segments`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_segments`** [Integer] _(optional)_

Renders the progress bar as discrete blocks — like battery cells or a signal
strength indicator — instead of a continuous fill. Both the track and the fill
are segmented, so gaps are visible in both the empty and filled portions of the
bar. With [`center_zero`](#center_zero), each arm is segmented independently.
The number is rounded; below 2, the bar stays continuous.

[Preview in the Cookbook](cookbook.md#effect-bar-segments).

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.battery
bar_segments: 10
```

Works with any bar orientation, size and effect, and with every color mode but
`rainbow_full` (see the note below). The visual editor offers a numeric field
from 2 to 10; YAML accepts any number of 2 or more.

> [!NOTE]
>
> `bar_segments` doesn't combine with [`bar_color_mode`](#bar_color_mode)
> `rainbow_full` (no single fill fraction to cut into cells — the whole track is
> always shown, with a moving marker instead) or [`bar_stack`](#bar_stack) (one
> fill fraction per entity, not one for the whole bar) — either one clears
> `bar_segments` automatically.

[🔼 Back to top]

#### `bar_ring`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_ring`** [Object] _(optional)_

Shapes the ring drawn by [`bar_position: icon`](#bar_position). It has no effect
with any other `bar_position`, so none in a Multi-Card or Multi-Feature, whose
rows can't use `icon`.

[Preview in the Cookbook](cookbook.md#effect-bar-ring).

- `start` [Number] _(default: 0)_: where the ring begins, in degrees clockwise
  from the top. With [`center_zero`](#center_zero), it places the zero instead
  and the arc is centred on it.
- `gap` [Number] _(default: 0)_: the part of the circle left open, in degrees (0
  to 330, clamped).
- `softness` [Number] _(default: 1)_: the width of the ring's inner edge blend,
  in px; `0` for a hard edge (negative values count as `0`). Unset, the theme's
  `--epb-ring-softness` applies ([theme](theme.md)).

The fill, the theme zones, the watermarks, the peak markers and the
`rainbow_full` marker all follow the arc. The ring fills clockwise from `start`;
[`bar_orientation`](#bar_orientation) `counterclockwise` reverses it.

_Example_ (thermostat dial, open at the bottom):

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
bar_position: icon
bar_ring:
  start: 225
  gap: 90
```

[🔼 Back to top]

#### `bar_effect`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_effect`** [String] or [List] or [JINJA] _(optional)_

Defines visual effects applied to the progress bar. You can use a single effect
or combine multiple in a list.

[Preview in the Cookbook](cookbook.md#effect-bar-effects).

- If a **[String]** is provided (e.g. `"gradient"`), only one effect is applied.
- If a **[List]** is provided (e.g. `["radius", "shimmer"]`), effects are
  combined.
- If using a **[JINJA] template**, it should return either:
  - a single effect string (`shimmer`)
  - or a comma-separated string (`"gradient, shimmer"`)

_Available options_:

- `radius`: rounds the corners of the progress bar
- `glass`: adds a frosted glass effect to the progress bar
- `gradient`: applies a color gradient to the progress bar
- `gradient_reverse`: applies a color gradient to the progress bar (fading in
  the opposite direction)
- `shimmer`: adds a shimmering light animation across the bar
- `shimmer_reverse`: adds a shimmering light animation across the bar (running
  in the opposite direction)
- `wave`: turns an upward fill into water, with a moving wave on top and rising
  bubbles (`bar_orientation: up` with `bar_position: background`, `overlay` in
  `layout: vertical`, or the upright bar of `layout: vertical`)

_Examples_:

```yaml
type: custom:entity-progress-card
# ...your other options
bar_effect: radius
```

```yaml
type: custom:entity-progress-card
# ...your other options
bar_effect:
  - radius
  - shimmer
  - gradient
```

```yaml
# ...your other options
bar_effect: |-
  {% if states('sensor.xxx') | float(0) > 22 %}
    shimmer, gradient
  {% else %}
    gradient
  {% endif %}
```

_Effect incompatibilities_ — some effects cannot be combined:

| Effect selected    | Incompatible with                                            |
| ------------------ | ------------------------------------------------------------ |
| `glass`            | `gradient`, `gradient_reverse`                               |
| `gradient`         | `gradient_reverse`, `glass`, `wave`                          |
| `gradient_reverse` | `gradient`, `glass`, `wave`                                  |
| `shimmer`          | `shimmer_reverse`, `wave`                                    |
| `shimmer_reverse`  | `shimmer`, `wave`                                            |
| `wave`             | `gradient`, `gradient_reverse`, `shimmer`, `shimmer_reverse` |

The visual editor enforces these rules automatically by hiding incompatible
chips when a conflicting effect is active. In YAML or Jinja, the first effect
listed wins and the incompatible ones after it are ignored. An unknown effect
name is ignored. The visual editor offers `glass`, `gradient` and
`gradient_reverse` only with `bar_color_mode: auto`.

[🔼 Back to top]

#### `bar_color_mode`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_color_mode`** [String] ➡️ {`auto`|`segment`|`rainbow`|`rainbow_full`}
> _(optional, default: `auto`)_

Controls how theme colors are applied to the progress bar fill.

Preview in the Cookbook: [`segment`](cookbook.md#effect-segment),
[`rainbow_full`](cookbook.md#effect-rainbow).

- `auto` — default behavior: the bar is filled with the solid color of the
  current theme zone. No change from previous versions.
- `segment` — each color zone defined by the theme is rendered as a distinct
  colored block, visible up to the current value. Useful to see at a glance how
  far through each zone the entity has progressed.
- `rainbow` — the bar displays a smooth color gradient across all visible zones,
  transitioning between each zone's color up to the current value.
- `rainbow_full` — the track always shows the theme's complete gradient, end to
  end, regardless of the current value — like a hue-picker strip. A small
  pill-shaped marker slides along it to show where the current value sits.
  Useful when the zones themselves (not how full the bar is) are what matters at
  a glance.

> [!NOTE]
>
> `bar_color_mode` requires an active [`theme`](#theme) or
> [`custom_theme`](#custom_theme) — `segment`/`rainbow` paint theme zones, so
> without either one, `bar_color_mode` is reset to `auto` automatically. For
> linear themes (e.g. `light`), zone boundaries are derived automatically by
> splitting 0–100% into equal segments (5 levels → 0–20%, 20–40%, …).

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

```yaml
type: custom:entity-progress-card
entity: sensor.living_room_temperature
theme: temperature
max_value: 40
bar_color_mode: rainbow_full
```

**Edge cases: `bar_color_mode`**

- `bar_color_mode` also works with [`center_zero`](#center_zero): each arm
  (positive/negative) gets its own independent gradient. A percentage theme
  reads each arm's own 0–100% (the negative arm takes the first zone's color); a
  theme in raw units is projected onto that arm's half of the
  `min_value`/`max_value` scale — `rainbow_full` included (each arm always shows
  its own half of the theme in full, and the marker slides from one end of the
  bar to the other through the visual center, which always represents zero
  regardless of where `center_zero_value` actually sits numerically).
  [`bar_stack`](#bar_stack) is the one combination that doesn't apply: several
  entities, no single position for one marker — so `rainbow_full` falls back to
  plain `rainbow` automatically there.
- On Template/Badge Template: only a built-in [`theme`](#theme) applies
  (`custom_theme` doesn't exist there); with `center_zero`, `percent` is the
  -100%/+100% scale and each arm reads its own 0-100% of the theme, as on a
  card. `bar_stack` doesn't exist on Template either, so `rainbow_full` is
  always available.
- `rainbow_full`'s marker can be restyled by overriding
  `--epb-rainbow-marker-size` (default `5px` for `bar_size: xsmall`/`small`,
  `7px`/`9px`/`12px` for `medium`/`large`/`xlarge`),
  `--epb-rainbow-marker-color` (default: whatever color the icon currently
  shows), `--epb-rainbow-marker-border-color` (default a translucent white ring)
  and `--epb-rainbow-marker-border-width` (default `1px`/`1.5px`/`2px`/`3px`,
  same `bar_size` breakpoints as the width).
- Zone boundaries are always projected onto the `min_value`/`max_value` scale —
  for a theme whose zones are real-world values rather than `%` (`temperature`,
  `voc`…) or a `custom_theme`, that scale decides which part of the theme shows.
  A predefined theme raises the default `max_value` to its own top bound (see
  [`max_value`](#max_value)); `min_value` stays `0` unless you set it (see
  [`min_value`](#min_value)), so set it to show zones below zero.
- With [`custom_theme`](#custom_theme), a zone without its own
  `color`/`bar_color` doesn't render as a flat neutral stop in `segment`/
  `rainbow` mode — it falls back to the entity's own negotiated color (e.g. a
  cover is pink open / grey closed) before the card's generic default, the same
  fallback chain the single-color `auto` mode already uses.

[🔼 Back to top]

#### `bar_scale`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_max_width`** [String] _(optional)_

Limits the maximum width of the progress bar in horizontal layout.

> [!IMPORTANT]
>
> Only applies with [`layout`](#layout): `horizontal`,
> [`bar_position`](#bar_position): `default` (or unset), and
> [`bar_size`](#bar_size) set to `xsmall`, `small`, `medium`, or `large` (not
> `xlarge`). Outside this combination the option is cleared automatically — it
> has no effect anywhere else.

In [`density: single_line`](#density) — the shape a [Multi](#multi) row is built
on — it stops being only a cap: the bar takes exactly this width, and the text
beside it takes everything else. That is what lines a stack's bars up at the
same x instead of each one starting where its own row's text ends. On a card too
narrow to hold both, the text ellipses first and the bar keeps its width;
without `bar_max_width` the opposite still holds, the bar giving ground down to
its own floor while the text keeps its space. Every other shape keeps the plain
cap described above: the bar sits in the content column there, with no
horizontal room to hand over.

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_orientation`** [String]
> {`rtl`|`ltr`|`up`|`down`|`clockwise`|`counterclockwise`} _(optional, default:
> `ltr`)_

Adjusts the progress bar direction to display from right to left. `up` fills a
vertical bar from the bottom, `down` from the top. They apply to
[`bar_position`](#bar_position) `overlay` with `layout: vertical`, to
`background`, and to `default` with `layout: vertical`: there the bar stands
upright in the stack, its texts outside it, in the order
[`content_order`](#content_order) sets; [`bar_size`](#bar_size) is ignored and
the card takes one more grid row.

With [`bar_position: icon`](#bar_position), the ring takes `clockwise` (default)
or `counterclockwise`; `ltr` and `rtl` are read as those two, and the editor
translates between the two families when `bar_position` changes.

This is especially useful for timers to visually represent the remaining time.

The default is `ltr` for every entity, timers included: set `rtl` yourself for a
timer.

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
> `up` and `down` only have a visible effect in three combinations:
> [`layout`](#layout): `vertical` with [`bar_position`](#bar_position):
> `overlay`, `bar_position`: `background` (either layout), and
> `layout: vertical` with `bar_position: default` (the upright stack; not with
> `bar_size: xlarge`, which turns `default` into `below`). Badge, Badge
> Template, and the Tile Feature don't offer `up` or `down`: the Tile Feature
> takes `ltr`/`rtl`, the badges also take `clockwise`/`counterclockwise` (with
> `bar_position: icon`). In a Multi-Feature or a horizontal Multi-Card, rows
> stay `ltr`/`rtl`: `up`/`down` only act in a Multi-Card with
> `layout: vertical`.

[🔼 Back to top]

#### `force_circular_background`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`force_circular_background`** [Boolean] _(optional, default: false)_

This option forces a **circular background** to be displayed behind the icon
shown on the card.

[Preview in the Cookbook](cookbook.md#effect-force-circular-background).

It also comes out on its own under [`bar_position: background`](#bar_position),
where the bar fills the whole card: the disc protects the icon from a fill that
usually carries the icon's own color.

HA 2025.3 brings a lot of improvements and changes the circular background
strategy: <https://www.home-assistant.io/blog/2025/03/05/release-20253/>

This card evaluates the HA version and adapts to it according to your entity
domain and your action strategy. If you want to avoid this strategy you can use
this parameter.

When set to `true`, a circular shape will appear behind the icon, regardless of
the HA version, entity domain or action defined (unless `hide` lists `shape`).
This helps create a cleaner, more consistent visual appearance with Mushroom
card.

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`trend_indicator`** [Boolean | Object] _(optional, default: false)_

Displays a trend icon indicating the direction of the entity's value, positioned
at the top right of the card.

[Preview in the Cookbook](cookbook.md#effect-trend-indicator).

What it actually follows is the **bar's own percentage**, not the entity's raw
state — the value already projected between [`min_value`](#min_value) and
[`max_value`](#max_value). Changing either of those changes the deltas it
measures. On the Template card, that percentage is the Jinja
[`percent`](#percent-jinja) result, and a sample is recorded only when that
template resolves: the entity declared alongside it never enters the
calculation, and the sampling rate is the template's own, not the card's refresh
tick.

_Example — simple boolean_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
trend_indicator: true
```

`true` compares each new value against the previous one, with a built-in dead
zone of 1 percentage point so it doesn't flip on pure sensor noise (an object
without `threshold` has none). For a time-windowed comparison instead, pass an
object:

| Property     | Type    | Default   | Description                                                                                                                |
| ------------ | ------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `window`     | String  | —         | How far back: a number followed by `s`, `min`, `h` or `d` (`'30s'`, `'1.5h'`); anything else is rejected.                  |
| `basis`      | String  | `average` | `average` (smooths noise), `edge` (vs. the oldest sample in the window), or `slope` (fits a trend line across the window). |
| `threshold`  | Number  | `0`       | Dead zone in percentage points — a smaller change reads as stable.                                                         |
| `colored`    | Boolean | `false`   | Tint the icon with its current icon color instead of a fixed neutral.                                                      |
| `up_color`   | String  | —         | Explicit color when trending up, overriding `colored`.                                                                     |
| `down_color` | String  | —         | Explicit color when trending down, overriding `colored`.                                                                   |
| `flat_color` | String  | —         | Explicit color when stable, overriding `colored`.                                                                          |

Each `basis` turns the window's samples into one delta, then compares it to
`threshold`:

- `average`: the current value against the **mean of every earlier sample**.
  Reads as "above its own recent norm" more than as a direction — a dip that has
  since recovered leaves the mean below the current value, so it still reads up.
- `edge`: the current value against the **oldest sample** in the window. Only
  the two ends count, so a window that dipped and came back reads flat — and a
  single odd reading at either end decides on its own.
- `slope`: the least-squares slope across **every** sample, scaled to the time
  the samples actually cover (oldest to newest), not the configured `window`.
  The same dip-and-back window reads flat because the fitted line is flat, and
  one outlier can't tip it.

On a steady climb all three read up — `average` with the smallest delta (its
mean follows the value), `edge` with the largest.

> [!NOTE]
>
> Without a `window`, the three are equivalent: only two samples are kept (the
> previous render and the current one), and all three reduce to _current −
> previous_. `basis` only starts to mean something once a window is set.

_Example — time-windowed, theme-colored_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
trend_indicator:
  window: 2h
  basis: slope
  threshold: 1
  colored: true
```

In the visual editor, switching to **Advanced** starts with `window: 2h` and
`threshold: 1` (the same dead zone as `true`). `window` is the one setting that
changes what the indicator measures: history over that span instead of the
previous render alone. Turn **Use a time window** off to keep the point-to-point
comparison and only use Advanced's other settings.

> ℹ️ For entities read from their state (no `attribute` override, not a `timer`
> or `counter`), `window` seeds itself once from Home Assistant's own recorder
> history on load (capped at 7 days), so a long window isn't empty right after a
> dashboard reload. An `attribute`-based percent (including a light, cover or
> fan read on its default attribute), `timer`/`counter` entities, and the
> Template variant's Jinja `percent` have no equivalent in HA's history — those
> fall back to live sampling only, showing the stable icon until two samples
> exist.

_Icons_:

| icon                    | meaning                                  |
| :---------------------- | :--------------------------------------- |
| `mdi:chevron-up-box`    | Upward trend                             |
| `mdi:chevron-down-box`  | Downward trend                           |
| `mdi:equal-box`         | Stable trend, or not enough data yet     |
| `mdi:progress-question` | Template only: `percent` is not a number |

[🔼 Back to top]

#### `peak_marker`

[![Card OK][Card-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`peak_marker`** [Object] _(optional)_

Marks the minimum, maximum, and average value observed over a time window,
directly on the bar — reads at a glance where the current value sits relative to
its own recent history. `range` paints the band between the minimum and the
maximum instead: the span the value actually travelled. All four are absent by
default (no mark shown) — set one to opt it in.

[Preview in the Cookbook](cookbook.md#effect-peak-marker).

The window slides: a new reading moves the marks at once, and a value that ages
out of the window stops counting within a minute. The average weighs each value
by how long it held — the same time-weighted mean as Home Assistant's own
statistics — so an hour of rapid changes doesn't outweigh a day at one value.

| Property    | Type                    | Default | Description                                                                      |
| ----------- | ----------------------- | ------- | -------------------------------------------------------------------------------- |
| `window`    | String                  | `2h`    | How far back to look: `'30s'`, `'5min'`, `'2h'`, `'1d'`.                         |
| `type`      | String                  | `line`  | Default mark shape (see the six below), for every mark that doesn't override it. |
| `opacity`   | Number                  | `0.8`   | Default opacity, applied to every mark that doesn't override it.                 |
| `color`     | String                  | —       | Default color, applied to every mark that doesn't override it.                   |
| `line_size` | String                  | `1px`   | Thickness of a mark drawn as a `line`, for every mark that doesn't override it.  |
| `min`       | Boolean\|String\|Object | —       | Shows the minimum mark. See below.                                               |
| `max`       | Boolean\|String\|Object | —       | Shows the maximum mark. See below.                                               |
| `average`   | Boolean\|String\|Object | —       | Shows the average mark. See below.                                               |
| `range`     | Boolean\|String\|Object | —       | Shows the band from minimum to maximum. See below.                               |

`min`/`max`/`average` each accept:

- `true` — shown, using the top-level `type`/`opacity`/`color`.
- `false` — explicitly hidden (same as leaving it unset).
- a color string — shorthand for `{ color: '...' }`, overriding the top-level
  `color` for this mark only.
- an object `{ type, opacity, color, line_size }` — overrides just that mark,
  falling back to the top-level `type`/`opacity`/`color`/`line_size` for
  whatever's left out.

A color, not a value: unlike [`watermark`](#watermark)'s marks, the position
here always comes from history — see
[Value shapes & shortcuts](#value-shapes--shortcuts) for why the two shorthands
differ.

`type` takes the same six shapes as [`watermark`](#watermark): `line`, `round`
and `triangle` draw a point, `area`, `blended` and `striped` fill a region. A
filled `min` covers everything below it, a filled `max` everything above — the
zones the value never reached. `range` is the reverse: the zone it did.

`range` takes the same forms as the three marks above, minus `line_size` (a band
has no line) and with zone shapes only (`area`, `blended`, `striped`, default
`area`). It takes the top-level `opacity` and `color`, never the top-level
`type`. It doesn't need `min` or `max` to be shown — both are measured whether
or not their own marks are drawn — so a band alone is a valid configuration.

_Example — the travelled range alone, no marks_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
peak_marker:
  window: 1d
  range:
    type: striped
    color: dodgerblue
    opacity: 0.25
```

_Example — same shape and opacity for all three_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
peak_marker:
  window: 1d
  type: round
  min: true
  max: true
  average: '#888'
```

_Example — per-mark overrides_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
peak_marker:
  window: 1d
  min: dodgerblue
  max:
    type: triangle
    color: tomato
    opacity: 0.5
```

> ℹ️ Same history source as [`trend_indicator`](#trend_indicator)'s own
> `window`: entities read from their state (no `attribute` override) only —
> `attribute`-based percent (including a light, cover or fan read on its default
> attribute) and `timer`/`counter` entities have no history to read from: no
> startup seeding there, the marks only follow the live value. The history
> loaded on startup is capped at 7 days
> (`'604800s'`/`'10080min'`/`'168h'`/`'7d'` are the same limit), and the visual
> editor's slider stops there. A longer `window` typed in YAML is kept, but only
> fills beyond 7 days as the card runs. The visual editor also won't offer to
> enable `peak_marker` at all for an ineligible entity — it shows why instead of
> a toggle that would silently do nothing.

[🔼 Back to top]

#### `status_label`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`status_label`** [String|Map] _(optional)_

Displays a GitHub-label-style status pill — a short piece of text describing the
current status at a glance (e.g. `hot`, `critical`, `ok`). Unlike
[`custom_info`](#custom_info)/[`name_info`](#name_info), the pill's text is
plain (no inline HTML/styling): its colors are picked automatically instead,
using the same recipe GitHub's own issue labels use — background is a
translucent tint of whatever color the progress bar currently shows (theme zone,
`custom_theme` zone, or a plain `bar_color` override, whichever applies), and
the border/text are that same color, lightened just enough to stay readable
against the card.

[Preview in the Cookbook](cookbook.md#effect-status-label).

A plain string is shorthand for `{ jinja: '...' }`, covering most cases. Use the
full Map form below whenever you also need `position`/`color_source` (see
[Value shapes & shortcuts](#value-shapes--shortcuts)):

```yaml
status_label: "{{ 'hot' if states('sensor.temperature') | float > 30 else 'ok' }}"
```

_Map definition_ — use this form to also set `position`/`color_source`:

- `jinja` (JINJA): The pill's text. No separate toggle to show/hide the pill —
  an empty resolved value simply shows nothing. See [JINJA].
- `position` (string, optional): Which top corner the pill sits in — `left` or
  `right` (default).
- `color_source` (string, optional): Which color the pill follows when `jinja`
  doesn't return an explicit `{label, color}` — `bar` (default, the progress
  bar's own color) or `icon` (the icon's own color instead).

> [!TIP]
>
> Works the same way with a built-in `theme`, a `custom_theme`, or no theme at
> all — write your own condition on the entity's value/state/attributes, there's
> no zone list to keep in sync with anything.

> [!TIP]
>
> `jinja` can also resolve to a native `{label, color}` object instead of plain
> text, to pick the pill's color directly rather than following the bar's own
> color — handy when the pill's own condition doesn't match the bar's (e.g. a
> `theme`-driven bar color, but a status label with its own separate logic).
> Omit `color` (or leave it empty) from the object and the pill falls back to
> the color [`color_source`](#status_label) picks (the bar's by default). See
> [Returning a native type](#returning-a-native-type-not-just-text) for the
> Jinja syntax this needs (a single `{{ expression }}`, or each branch of a
> block `{% if %}`).
>
> ```yaml
> status_label:
>   jinja: "{{ {'label': 'hot', 'color': '#ff0000'} if is_state('sensor.status', 'hot') else {'label': 'ok', 'color': '#00ff00'} }}"
> ```

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
theme: temperature
status_label:
  jinja: >-
    {% set t = states('sensor.temperature') | float %}
    {% if t > 30 %}hot{% elif t < 10 %}cold{% else %}ok{% endif %}
  position: right
```

> [!NOTE]
>
> `status_label` and [`trend_indicator`](#trend_indicator) share the same corner
> — a `status_label` with a `jinja` forces `trend_indicator` off, whatever its
> `position`.
>
> With `bar_position: compact_below` or `background`, the pill can end up
> sharing space with `secondary_info` or sitting over the bar itself — adjust
> `height`/`min_width` or override `--epb-label-background-color` if it needs
> more room to stand out.

> [!TIP]
>
> [`alert_when`](#alert_when) can drive this same pill directly
> (`highlight: label`) — only shown while the alert is active, using
> `alert_when`'s own `color`/`label` instead of a Jinja condition you'd
> otherwise have to write yourself. `alert_when` doesn't have its own `position`
> — it follows whatever `status_label.position` (or the default `right`) is
> already set to. While the alert is active, its pill hides `trend_indicator` in
> the same corner.

[🔼 Back to top]

#### `text_effect`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`text_effect`** [String] ➡️ {`none` | `shadow` | `halo` | `outline` |
> `plate` | `contrast`} _(optional, default: `none`)_

Keeps the text readable over the bar when [`bar_position`](#bar_position) is
`overlay` or `background`; set elsewhere, it has no effect. In a Multi, that
means a Multi-Card with `layout: vertical` and `bar_position: overlay` only.

| Value      | Look                                                        |
| ---------- | ----------------------------------------------------------- |
| `none`     | Plain text.                                                 |
| `shadow`   | Soft drop shadow.                                           |
| `halo`     | Even glow around each glyph.                                |
| `outline`  | Stroke around each glyph.                                   |
| `plate`    | Translucent pill behind the text.                           |
| `contrast` | Black or white text, from the bar color under the fill end. |

`contrast` overrides the text color (`--epb-name-color`, `--epb-detail-color`).
With a theme gradient (`bar_color_mode: segment` or `rainbow`), it reads the
color at the end of the fill, so the text flips as the value crosses the
light/dark threshold.

Style hooks (`shadow`, `halo`, `outline`, `plate`): `--epb-text-effect-color`
(default: the card background), `--epb-text-effect-size` (default: `1px`) and
`--epb-text-effect-blur`. Set them in your Home Assistant theme or with
`card_mod`: see the [Theme Guide](theme.md#restyle-with-css-variables-advanced).

_Example_:

```yaml
type: custom:entity-progress-card
entity: sensor.temperature
# ...your other options
bar_position: overlay
text_effect: halo
```

[🔼 Back to top]

#### `text_shadow`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`text_shadow`** [Boolean] _(optional, default: `false`)_

> [!IMPORTANT]
>
> **Deprecated since 1.6.4** (a console warning is logged) — use
> [`text_effect: shadow`](#text_effect) instead. `text_shadow: true` is
> automatically migrated for the session, unless `text_effect` is already set;
> `false` is dropped. Multi-Card and Multi-Feature migrate it too, at both
> levels. See [Deprecated Options].

[🔼 Back to top]

#### `density`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)

> **`density`** [String] ➡️ {`default` | `compact` | `single_line` |
> `single_column`} _(optional, default: `default`)_:

A preset that reshapes the card into a smaller footprint. Rather than juggling
`layout`/`bar_position`/`hide`/`multiline` by hand to get there, each value sets
them for you.

[Preview in the Cookbook](cookbook.md#effect-density-compact).

##### `compact`

The smallest useful footprint for whichever [`layout`](#layout) is already set:

- `layout: horizontal` (the default): narrows the card to a single column,
  `name`/`value` still shown.
- `layout: vertical`: has no matching narrow shape, so `name`/`secondary_info`
  are forced hidden instead, down to a single grid row (icon + thin bar only)
  - the editor greys them out under [`hide`](#hide) to match, even behind a
    Jinja `hide` template (its own result never overrides this).
- Either way, restricts [`bar_position`](#bar_position) to `top`, `bottom`,
  `background` or `icon` - any other value (including the `default` position)
  falls back to `top`.
- Clears [`multiline`](#multiline) - the field is hidden from the editor while
  `compact` is active.

[`status_label`](#status_label) and [`trend_indicator`](#trend_indicator) still
work as usual under `compact` - both fit fine in the corner of a narrow card.

[`bar_max_width`](#bar_max_width) and
[`reverse_secondary_info_row`](#reverse_secondary_info_row) don't need clearing
explicitly: both already turn themselves off outside `bar_position: default`,
which `compact` never allows. Likewise, `bar_size` has no effect on
`top`/`bottom`/`background` bars, so it's a no-op rather than something that
needs to be forced.

> [!NOTE]
>
> In a Sections view, `compact` pins the card's size outright - both the minimum
> it's allowed to shrink to _and_ the default/maximum it's born and capped at -
> instead of just narrowing how far a manual resize could go. Turning it on
> through the visual editor writes an explicit
> `grid_options: { columns: 3, rows: 1 }` into the card's own config (the
> previous `grid_options`, if any, comes back automatically the moment `compact`
> is switched back off) - a card already placed with its own size otherwise
> keeps that size regardless of `compact` (like [`height`](#height), an explicit
> override always wins), so pinning it this way is the only way to actually
> resize an existing card, not just a new one. Written directly in YAML instead,
> `compact` only affects a fresh card's own computed default/minimum/maximum,
> without touching `grid_options` on your behalf - set it yourself
> (`grid_options: { columns: 3, rows: 1 }`) if you want the same pinned effect
> there too.

##### `single_line`

Lays icon, name, secondary info and bar out as four siblings on one row, instead
of stacking the name/value block beside the icon. Nothing the card already
displays is dropped - it is the same content on a single line:

- Forces [`layout`](#layout)`: horizontal` - the row has no vertical shape. In
  the visual editor the two settle it between them: `single_line` is not offered
  while the layout is vertical, and picking vertical on a `single_line` card
  puts the density back to `default`.
- Puts the bar back in the row itself, so [`bar_position`](#bar_position) is
  cleared to `default`: the standalone `top`/`bottom`/`background`/`overlay`
  containers are a different placement altogether, and aren't offered.
- [`bar_size`](#bar_size) `xlarge` is drawn as `large`: `xlarge` would move the
  bar below the text.
- Clears [`multiline`](#multiline) - there is no second line to wrap onto.
- [`reverse_secondary_info_row`](#reverse_secondary_info_row) reverses the whole
  row here: the bar first, then the text.
- Unlike `compact`, forces nothing under [`hide`](#hide): trim the row down to
  whatever you want, a bar on its own included.
- The name takes secondary info's own type scale, weight and color: on one row
  it reads as another info on the line, not a title above one. The
  `--epb-name-*` hooks ([Theme](theme.md)) still override it - they just fall
  back to the `--epb-detail-*` values instead of the title ones.
- A name _and_ a secondary info on the same row are joined by the same `·`
  separator that already joins infos inside secondary info - it only appears
  when both are actually there. The row is one text line: it truncates once, at
  its end, rather than each field ellipsing inside its own box.

Unlike `compact`, it doesn't touch `grid_options`: `layout: horizontal` already
resolves to a single grid row.

##### `single_column`

The vertical twin of `single_line`: icon, name, value, then the bar standing
upright under them, as one column. It is the shape a column of a
[Multi in `layout: vertical`](#multi-layout) takes.

- Forces [`layout`](#layout)`: vertical`. In the visual editor `single_column`
  is offered only while the layout is vertical, and picking horizontal puts the
  density back to `default`.
- [`bar_position`](#bar_position) is `default`, or `overlay` to put the bar
  behind the texts; any other value falls back to `default`.
- [`bar_orientation`](#bar_orientation) is `up`, or `down` to fill from the top;
  any other value falls back to `up`.
- [`bar_size`](#bar_size) `xlarge` is drawn as `large`.
- Clears [`multiline`](#multiline).
- [`content_order`](#content_order) takes the lines of a `vertical` card.

_Examples:_

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
density: compact
```

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
layout: vertical
density: compact
```

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
density: single_line
bar_size: small
```

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_usage
density: single_column
```

[🔼 Back to top]

#### `layout`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`layout`** [String] ➡️ {`horizontal`| `vertical`} _(optional, default:
> `horizontal`)_:

Determines the layout of the elements inside the card. You can choose between
different layouts based on your visual preferences:

- `horizontal`: the icon on the left, the name and value beside it, the bar
  under them.
- `vertical`: the icon on top, then the texts and the bar stacked under it.

> [!NOTE]
>
> [`density: compact`](#density) works with either value - it hides
> `name`/`secondary_info` instead of narrowing the column once this is
> `vertical`, since vertical has no matching narrow shape of its own.
> [`density: single_line`](#density) forces `horizontal` outright,
> `single_column` forces `vertical`.

_Examples:_

```yaml
type: custom:entity-progress-card
# ...your other options
layout: vertical
```

[🔼 Back to top]

#### `content_order`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`content_order`** [List] of lines ➡️
> {`name`|`name_info`|`info`|`state_content`|`value`|`bar`} _(optional, default:
> the layout's own lines)_

Places each block of the card on a line of your choice. `name_info` is the
[`name_info`](#name_info) text, `info` the [`custom_info`](#custom_info) (or
Template's `secondary`) one, `state_content` the
[`state_content`](#state_content) text, `value` the entity's value. Each line
takes a style of its own: the first the name's, the next ones the secondary
info's, whatever block they hold.

| Layout                                                                    | Lines             | Default                                                    |
| ------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------- |
| `vertical`, `bar_position: default`                                       | stacked, centered | `[[name, name_info], [info, state_content, value], [bar]]` |
| `horizontal`, `bar_position: default`                                     | two               | `[[name, name_info], [info, state_content, value, bar]]`   |
| `horizontal`, [`bar_position: compact_below`](#bar_position)              | one, over the bar | `[[name, name_info, info, state_content, value]]`          |
| [`density: single_line`](#density)                                        | one, bar in it    | `[[name, name_info, info, state_content, value, bar]]`     |
| either, `bar_position: below`, `top`, `bottom`, `overlay` or `background` | as above, no bar  | `[[name, name_info], [info, state_content, value]]`        |

- A partial list is enough: a block it leaves out goes next to its host
  (`name_info` after `name`, `value` after `info`, `state_content` before
  `value`), `bar` on a line of its own, any other at the end of the last line.
- A plain list is one line in horizontal, one block per line in vertical:
  `[bar, name, value]` stacks the three.
- In horizontal a third line joins the second. Where the bar is drawn outside
  the text (`compact_below`, `below`, `top`, `bottom`, `overlay`, `background`),
  a `bar` in the list is ignored.
- Two texts of a line are `·` apart, a blank one skipped; a `value` closing a
  horizontal line sits at its right end.
- [`text_effect`](#text_effect) applies to each text of an `overlay` or
  `background` card.
- Template has no `name_info`, `state_content` or `value` block.
- It only orders: hiding a block is [`hide`](#hide)'s job. In the editor, a
  block's ✕ adds it to a list `hide` (never to a Jinja one), and picking it
  again takes it back out. A text with no field behind it (no `name_info`,
  `custom_info` or `state_content`) takes no room.
- An ordered row places its own bar:
  [`reverse_secondary_info_row`](#reverse_secondary_info_row) has no effect.
- [`bar_aligned`](#bar_aligned) measures the text block before the bar; a line
  opening on the bar has nothing to align.
- A [Multi](#multi) row is a `single_line` one (`single_column` in a Multi-Card
  with `layout: vertical`), top level for every row or on a single row.

> [!NOTE]
>
> Ignored with `bar_position: icon` or `density: compact`. In the visual editor
> each line is a row of chips, dragged into place (Home Assistant 2023.9 or
> later); picking a chip in a row moves it out of the others. In vertical, an
> empty last row opens a new line.

_Examples_:

```yaml
type: custom:entity-progress-card
entity: sensor.battery
layout: vertical
bar_orientation: up
content_order:
  - [name]
  - [bar]
  - [value]
```

```yaml
type: custom:entity-progress-card
entity: sensor.battery
content_order:
  - [name, value]
  - [info, bar]
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

For how this behaves once embedded in `entities`, `grid`, `vertical-stack`,
`horizontal-stack`, etc. - and how sizing works in Sections/Masonry/embedded
contexts generally - see [Card sizing] in the Theme Guide.

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

Removes the space above and below the content, so the card is shorter.

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

`auto` is also a valid value: the card shrinks to fit its content instead of
stretching to fill its parent. Combine it with `marginless: true` and
`frameless: true` for a fully compact card - useful when embedding the card
outside Home Assistant's own grid sizing, e.g. as a `custom:button-card` field.
The visual editor's **Card size** toggle starts at `height: auto`.

> [!NOTE]
>
> If the main objective is to reduce the size, test the `marginless` parameter
> before adjusting the `height`.

> [!NOTE]
>
> **Left unset**, the card's height is a **floor, not a fixed size** - it never
> shrinks below what a Sections/Masonry layout computes for it, but it can still
> grow taller if the content genuinely needs more room (e.g. a larger OS/browser
> text-size accessibility setting). This is on purpose: it stops text from
> getting silently clipped.
>
> **Set explicitly**, `height` wins outright as the card's **exact** height,
> everywhere - a Sections view, Masonry, embedded in any other card. Nothing
> protects against it being too small for the actual content once you've set
> it - that trade-off is yours to make on purpose.

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

Sets a minimum width for the card, badge or template. Absolute units (`px`,
`em`, `rem`) work everywhere and are the safest choice — e.g.
`min_width: 140px`.

> [!IMPORTANT]
>
> **Percentages behave differently by type:**
>
> - **Card / template**: `%` is the standard CSS `min-width`, i.e. relative to
>   the **parent container** (the grid cell / stack). A value over `100%`
>   therefore overflows its container.
> - **Badge / badge template**: `%` is relative to the **badge's default
>   width**, not the parent. So `min_width: 120%` makes the badge 1.2× its
>   normal size (no overflow), and `100%` is the default badge width.

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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`reverse_secondary_info_row`** [Boolean] _(optional, default: false)_

Reverses the order of the progress bar and the secondary info when using a
horizontal layout.

When set to `true`, the secondary info appears to the right of the progress bar
instead of the left. Useful for emphasizing the progress visually by aligning it
first, or for adapting to specific design preferences.

> [!IMPORTANT]
>
> Only applies with [`layout`](#layout): `horizontal` and
> [`bar_position`](#bar_position): `default` (or unset), and not
> `bar_size: xlarge` (which turns `default` into `below`) — `layout: vertical`
> always renders the secondary info in a column regardless of this option,
> ignoring it entirely. Outside that combination, `reverse_secondary_info_row`
> is disabled automatically. It is also disabled when a
> [`content_order`](#content_order) different from the layout's default is set.

> [!NOTE]
>
> Under [`density: single_line`](#density) it reverses the whole row rather than
> just the secondary info: the bar comes first, icon aside, and the text
> follows. Same meaning, one level up - and `single_line` forces exactly the
> `horizontal` + `default` combination this option needs anyway.

```yaml
type: custom:entity-progress-card
entity: timer.living_room
reverse_secondary_info_row: true
```

[🔼 Back to top]

#### `unit_spacing`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`unit_spacing`** [String] ➡️ {`auto`|`space`|`no-space`} _(optional,
> default: `auto`)_

Whether a space appears between the value and its unit, following the language's
own convention or overriding it.

- `auto`: follows the interface language, the same rule Home Assistant applies
  to a native tile. Three cases: a duration sticks to its value (`45min`, `2h`),
  the degree sign does too (`45°`), and everything else takes a space (`42 kWh`,
  `22 °C`). The percent sign is the one that varies — `42 %` in Catalan, Czech,
  Danish, Finnish, French, German, Croatian, Lithuanian, Macedonian, Norwegian,
  Romanian, Russian, Slovak, Slovenian, Spanish (except Latin American `es-419`)
  and Swedish, `42%` elsewhere.
- `space`: always a space (`80 %`), whatever the language
- `no-space`: never a space (`80%`), whatever the language

> [!NOTE]
>
> The compact duration is this card's one deliberate departure: SI, and Home
> Assistant, would write `45 min`. A bar has less room than a sentence, and
> `1h23min` reads better on one.

[🔼 Back to top]

#### `unit_position`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`unit_position`** [String] ➡️ {`after`|`before`} _(optional, default:
> `after`)_

Places the unit before the value instead of after - useful for currency symbols
(`$100` rather than `100$`). Has no effect once `unit` is empty or hidden, nor
on a `timer` entity, whose value reads as a clock; a duration sensor (`min`,
`h`, `s`) does follow it.

[Preview in the Cookbook](cookbook.md#format-unit-position).

```yaml
type: custom:entity-progress-card
entity: sensor.account_balance
unit: $
unit_position: before
unit_spacing: no-space
```

[🔼 Back to top]

#### `value_compact`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`value_compact`** [Boolean] _(optional, default: `false`)_

Keeps a value readable whatever its magnitude, so a sensor that swings across
the day doesn't force you to pick one unit and live with it (timers and
durations are left as they are). What it does depends on whether there is a
unit:

[Preview in the Cookbook](cookbook.md#format-value-compact).

**With a unit that takes an SI prefix** — `W`, `Wh`, `VA`, `var`, `J`, `Hz`,
`B`, `bit`, `A`, `V`, `Ω`, `Pa` — the scale moves into the unit and the number
stays plain:

| value       | shown as |
| ----------- | -------- |
| `25 W`      | `25 W`   |
| `1500 W`    | `1.5 kW` |
| `1500000 W` | `1.5 MW` |
| `0.5 W`     | `500 mW` |

A prefix already on the unit is carried rather than doubled: an entity reading
`1500 kW` shows `1.5 MW`. SI prefixes are spelled the same in every language, so
this reads identically in all 41. Prefixes go from `m` (milli) to `T` (tera): a
smaller or larger value keeps the nearest one.

**Without a unit** (a `counter`, or a unit hidden with `hide: [unit]`), the
number itself is abbreviated with the suffix of your Home Assistant number
format (by default, your language): `1200` becomes `1.2K` in English, `1,2 k` in
French, `1,2 тыс.` in Russian; `1500` with `W` hidden reads `1.5K`. A sensor
that reports no unit at all shows the bar's percentage instead (see
[`unit`](#unit)): there is nothing to compact.

**With any other unit** — `%`, `°C`, `m³`, `ppm`, `hPa` — nothing changes.
Prefixing them would be wrong (`km³` is 10⁹ m³, not 10³) or meaningless, and
abbreviating the number alone would strand it from its unit.

A compacted value keeps three significant digits (`1650 W` → `1.65 kW`), even
with a lower `decimal`; trailing zeros are trimmed: `1.5 kW`, never `1.50 kW`.

```yaml
type: custom:entity-progress-card
entity: sensor.washing_machine_power
max_value: 2500
value_compact: true
```

> [!TIP]
>
> If a sensor sits in a stable range, Home Assistant can convert it once and for
> all instead: open the entity's settings and pick the unit you want. That is
> the better answer for a meter that always reads in kilowatts. `value_compact`
> is for the ones that move.

[🔼 Back to top]

#### `value_sign`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`value_sign`** [Boolean] _(optional, default: `false`)_

Forces an explicit `+`/`-` sign on the displayed value, even when it's
positive - `42` becomes `+42`. Zero stays unsigned, and a `timer` entity (clock
display) is never signed. Most useful on
`center_zero`/`bar_stack: { mode: net }` cards, where the sign clarifies the
direction of a delta at a glance.

[Preview in the Cookbook](cookbook.md#format-value-sign).

```yaml
type: custom:entity-progress-card
entity: input_number.epb_demo_power
center_zero: true
min_value: -3000
max_value: 3000
value_sign: true
```

[🔼 Back to top]

#### `center_zero`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`center_zero`** [Boolean | Object] _(optional, default: `false`)_

Centers the progress bar at zero, allowing for better visualization of values
that fluctuate around zero (e.g., positive/negative changes).

[Preview in the Cookbook](cookbook.md#effect-center-zero).

By default, the center point is `0`. If your sensor has a non-zero nominal value
(e.g., a voltage sensor around `230V`, or a pressure sensor with a non-zero
baseline), you can pass an object instead of `true` to customize the center
point and how the value is displayed.

| Property         | Type    | Default | Description                                                                                                          |
| ---------------- | ------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `value`          | Number  | `0`     | The reference value used as the center point of the bar.                                                             |
| `growth_percent` | Boolean | `false` | When `true`, the displayed percentage shows growth/decrease **relative to `value`** instead of the bar's fill ratio. |

> [!WARNING]
>
> The bar's visual fill always reflects the distance from `value` to the bound
> on the reading's side (`max_value` above it, `min_value` below it).
> `growth_percent` only changes the **displayed text**, not the bar itself. It
> only applies when the value shows as `%`; with `value: 0`, the regular
> percentage is shown.

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
min_value: 210
max_value: 250
center_zero:
  value: 230
```

`max_value` must be above `value`, and without `min_value` the negative side
defaults to `-max_value`: set both for a sensor with a non-zero baseline. With
the example above, a sensor reading `236` will show a bar filled relative to the
`230`–`250` range, but the displayed text will be `236` (the raw value):
`growth_percent` only changes a value shown as `%` (see below).

_Example — custom center value with growth percentage display_:

```yaml
type: custom:entity-progress-card
entity: cover.cuisine
attribute: current_position
center_zero:
  value: 60
  growth_percent: true
```

With `value: 60` and `growth_percent: true`, a cover at `66%` will display `10%`
(`+10%` with [`value_sign`](#value_sign); i.e. `(66 - 60) / 60 * 100`),
representing how far the current value has grown relative to the center point —
rather than the bar's raw fill ratio.

[🔼 Back to top]

#### `theme`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`theme`** [String] ➡️ {`battery_adaptive`|`critical_when_low`|
> `optimal_when_low`|`critical_when_high`|`optimal_when_high`|
> `critical_when_extreme`|`critical_when_extreme_center`|`light`|
> `temperature`|`humidity`|`voc`|`pm25`} _(optional)_

Allows customization of the progress bar's appearance using a predefined theme.
This theme dynamically adjusts the `icon`, `color` and `bar_color` options from
the current value, eliminating the need for manual adjustments or complex Jinja2
templates. Each theme's colors and limits:
[Predefined themes](theme.md#predefined-themes); your own limits (e.g. red under
20 %): [`custom_theme`](#custom_theme).

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
theme: light
```

For your own limits (a battery red under 20 %), use
[`custom_theme`](#custom_theme): its first example does exactly that.

> [!WARNING]
>
> The theme values `battery`, `cpu` and `memory` are deprecated (since `1.1.7`).
> They still work: replace `battery` with `optimal_when_high`, and `cpu` or
> `memory` with `optimal_when_low`. See
> [Deprecated options](troubleshooting.md#deprecated-options).

> [!NOTE]
>
> On Template/Badge Template, only percentage-based themes are available -
> `battery_adaptive`, `critical_when_low`, `optimal_when_low`,
> `critical_when_high`, `optimal_when_high`, `critical_when_extreme`,
> `critical_when_extreme_center`, `light` and `humidity`. `temperature`, `voc`
> and `pm25` are excluded: their zones are defined in raw values (°C, ppb,
> µg/m³...) projected against `min_value`/`max_value`, which Template has no
> equivalent of - it only ever has the already-computed `percent` Jinja field,
> so only themes whose zones are already expressed as a 0-100% scale apply. When
> set, `theme` wins over `color`/`bar_color` and also enables
> [`bar_color_mode`](#bar_color_mode) (`interpolate` isn't available there,
> unlike Card/Feature).

[Preview in the Theme Guide](theme.md#predefined-themes).

[🔼 Back to top]

#### `custom_theme`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`custom_theme`** [List] of [Map] _(optional)_

Your own color zones: each zone sets the color (and icon) the card takes between
two values. Setting `custom_theme` turns `theme` off.

[Preview in the Cookbook](cookbook.md#effect-custom-theme).

_Simple example_: a battery red under 20 %, green above. Zones use the entity's
own value, 0-100 for a battery.

```yaml
type: custom:entity-progress-card
entity: sensor.phone_battery
custom_theme:
  - min: 0
    max: 20
    color: red
  - min: 20
    max: 100
    color: green
```

In the visual editor, two buttons (Preset / Custom) switch between the `theme`
dropdown and this list of zones — each zone is its own row with min, max, colors
and an icon.

_Map definition:_

- min [number] (required): The minimum value for this range.
- max [number] (required): The maximum value for this range.
- color [string] (optional): The color of the icon and the progress bar: any
  value accepted by [`color`](#color).
- icon_color [string] (optional): Color specifically for the icon, overrides
  `color`.
- bar_color [string] (optional): Color specifically for the progress bar,
  overrides `color`.
- icon [string] (optional): The icon to display.

_Order of Priority for the Icon:_

- see [`icon`](#icon) parameter.

_Example with icons_ (one icon per zone):

```yaml
type: custom:entity-progress-card
# ...your other options
custom_theme:
  - min: 0
    max: 20
    color: red
    icon: mdi:battery-alert
  - min: 20
    max: 60
    color: orange
    icon: mdi:battery-50
  - min: 60
    max: 100
    color: green
    icon: mdi:battery
```

> [!NOTE]
>
> A zone includes its `min` but not its `max`: in the examples above, a value of
> exactly 20 falls in the zone that starts at 20.

> [!IMPORTANT]
>
> Each zone only needs a valid `min` < `max` to be taken into account — a zone
> missing `min`/`max`, or with `min` >= `max`, is ignored on its own without
> affecting the rest of the list. Zones don't need to be contiguous or declared
> in order: gaps between zones are allowed, and the list is sorted by `min`
> automatically.
>
> - Below the lowest zone or above the highest one, the closest zone is used.
> - In a **gap** between two zones, `custom_theme` is not used: the card takes
>   [`color`](#color)/[`icon`](#icon) if set, else the entity's own default.
> - If two zones **overlap**, the one with the lowest `min` wins.

[🔼 Back to top]

#### `interpolate`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`interpolate`** [Boolean] _(optional, default: `false`)_

Enables smooth color transition between consecutive steps of a custom theme.
When set to true, the icon and bar colors are interpolated between the current
step and the next one based on the current value's position within the step
range.

[Preview in the Cookbook](cookbook.md#effect-interpolate).

> [!NOTE]
>
> Requires an active [`theme`](#theme) or [`custom_theme`](#custom_theme), and
> [`bar_color_mode`](#bar_color_mode) set to `auto` (the default) — outside
> either condition, `interpolate` is disabled automatically.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
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
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`hide`** [List] or [JINJA] (optional):

Defines which elements should be hidden in the card.

[Preview in the Cookbook](cookbook.md#effect-hide-shape).

`hide` accepts either:

- a list of elements to hide (static configuration), or
- a Jinja template that dynamically returns a list of elements based on the
  current state (a list, or names separated by commas; unknown names are
  ignored).

When using the list syntax, the following elements are available:

- `icon`: Hides the entity icon.
- `name`: Hides the entity name.
- `value`: Hides the current value.
- `unit`: Hides the unit (Card, Badge and Multi rows; not Template — replaces
  the deprecated `disable_unit` option, see [Deprecated Options]).
- `secondary_info`: Hides the secondary information.
- `progress_bar`: Hides the visual progress bar.
- `shape`: Hides the circular shape behind the icon, keeping the icon itself
  visible (Card, Template and Multi-Card rows only).
- `name_info`: Hides [`name_info`](#name_info) only (Card, Badge and Multi
  rows).
- `info`: Hides [`custom_info`](#custom_info) only (Card, Badge and Multi rows).
- `state_content`: Hides [`state_content`](#state_content) only (Card, Badge and
  Multi rows).

In a Multi-Feature, rows default to `hide: [icon, name]`; set `hide: []` to show
them again (see [Multi-Card and Multi-Feature](#multi)).

> [!NOTE]
>
> `shape` is new in 1.6.2. Card, Template and Multi-Card only — the badges and
> the Multi-Feature have no shape by default (see
> [`force_circular_background`](#force_circular_background)).

> [!NOTE]
>
> [`density: compact`](#density) with `layout: vertical` forces `name` and
> `secondary_info` hidden regardless of this option — even a Jinja `hide`
> template's own result never brings them back. `value`/`unit` only ever affect
> text rendered inside that same row, so they're moot there too - the editor
> drops both chips instead of showing them with no visible effect.

_Static example_:

```yaml
type: custom:entity-progress-card
# ...your other options
hide:
  - icon
  - name
  - secondary_info
```

_Dynamic (Jinja) example_:

```yaml
type: custom:entity-progress-card
# ...your other options
hide: >
  {% if is_state('input_boolean.simple_mode', 'on') %}
    secondary_info, progress_bar
  {% endif %}
```

The template must return either form, both are equivalent:

- a comma-separated string, as in the example above
  (`secondary_info, progress_bar`), or
- a native Jinja list (`{{ ['secondary_info', 'progress_bar'] }}`).

Any combination of the supported element names, in either form.

[🔼 Back to top]

#### `disable_unit`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`disable_unit`** [Boolean] _(optional, default: `false`)_

> [!IMPORTANT]
>
> **Deprecated since 1.6.0** (a console warning is logged) — use
> [`hide: ['unit']`](#hide) instead. `disable_unit` still works and is
> automatically migrated for the session (unless `hide` is a Jinja template:
> then `disable_unit` stays and is still honored), but please update your YAML
> to the new form when convenient. See [Deprecated Options].

Disables the display of the unit when set to `true`. If not defined or set to
`false`, the unit will be shown.

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
disable_unit: true
```

[🔼 Back to top]

#### `watermark`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Feature OK][Feature-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`watermark`** [Map] _(optional)_

The `watermark` option allows you to visually highlight specific value
thresholds (low and high) within the progress bar, helping you better interpret
the current state at a glance.

[Preview in the Cookbook](cookbook.md#effect-watermark).

_Map definition_:

- `low` / `high` (Boolean|Number|Object): The lower/upper threshold. Both
  default to showing (`low: 20`, `high: 80`) the moment `watermark` is
  configured at all — see below for the accepted shapes.
- `type` (string): Default style, used by whichever of `low`/`high` doesn't
  override its own.
  - `blended` (default): A subtle colored overlay that merges with the bar’s
    colors for a more integrated look.
  - `area`: A soft transparent shape placed over the bar, without blending into
    the bar’s colors.
  - `striped`: Diagonal stripes for a patterned effect.
  - `triangle`: Triangle shapes as a watermark.
  - `round`: Rounded shapes applied as a watermark.
  - `line`: Vertical lines pattern (like a hatch effect).
- `line_size` (string, default `1px`): Thickness of the lines when a side's
  effective type (its own, or the default above) is `line` (e.g., `"3px"`) -
  used by whichever of `low`/`high` doesn't override it.
- `as` (string, default `auto`): How `low`/`high`'s own `value` is read, for
  whichever of them doesn't override it - see the per-side `as` below.
- `opacity` (number, default `0.8`): Default transparency (0 = fully transparent
  to 1 = fully opaque), used by whichever of `low`/`high` doesn't override it.
- `color` (string, optional): Default CSS color, used by whichever of
  `low`/`high` doesn't override it. Falls back to Home Assistant's red
  (`--red-color`) if not set either; `--epb-low-watermark-color` /
  `--epb-high-watermark-color` override it ([theme](theme.md)).

`low`/`high` each accept (see
[Value shapes & shortcuts](#value-shapes--shortcuts) for why this shorthand is a
value, unlike [`peak_marker`](#peak_marker)'s):

- `false` — hides that side entirely; `true` shows it at its default (`20` /
  `80`).
- a fixed numeric value, `{ entity: ..., attribute: ... }`, or `{ jinja: ... }`
  — shown, using `watermark`'s own `type`/`opacity`/`color`.
- `{ value: ..., as, type, opacity, color, line_size }` — full control over just
  that side, each falling back to `watermark`'s own value when omitted:
  - `value`: the threshold itself, same three forms as above (fixed number,
    entity, or Jinja).
  - `as` (string): how `value` is interpreted.
    - `auto` (default): value in the entity’s own unit and scale (same as
      `min_value`/`max_value`) — the card converts it to a bar position.
    - `percent`: value is a direct bar position (0–100), bypassing any unit
      conversion.
  - `type` (string, optional): overrides `watermark.type` for this side only.
  - `opacity` (number, optional): overrides `watermark.opacity` for this side
    only.
  - `color` (string, optional): overrides `watermark.color` for this side only.
  - `line_size` (string, optional): overrides `watermark.line_size` for this
    side only - only read when this side ends up drawn as a `line`.

In the visual editor, three buttons (Fixed value / Entity / Template) let you
switch `value`'s mode, mirroring `min_value`/`max_value`; a "Low
threshold"/"High threshold" toggle replaces the old
`disable_low`/`disable_high`. Each side's own Type/Line size/Opacity/Color
fields show the global value until you pick something else for that side — once
**both** sides have their own value for a given field, the global one is dropped
(nothing reads it anymore); its editor field then shows a greyed placeholder
(`blended`/`0.8`) instead of a live value nothing reads. Line size only appears
for a mark actually drawn as a `line`, and a hidden side has no say in any of
this — one value shared by the sides still shown is enough for it to move up.

> [!NOTE]
>
> The Jinja mode for `low`/`high` is available on every variant: the Card, the
> Badge, the Template card, the Badge Template and the Tile Feature.

> [!IMPORTANT]
>
> Three earlier shapes are deprecated (console warning logged) but still work —
> automatically migrated for the session:
>
> - A bare entity ID string for `low`/`high` (`watermark: { low: sensor.xxx }`,
>   pre-`1.6.0`), paired with a separate `low_attribute`/`high_attribute` key.
> - `low_as`/`high_as`/`low_color`/`high_color` as sibling keys of `watermark` —
>   now `as`/`color` inside `low`/`high`'s own object form.
> - `disable_low`/`disable_high: true` — now `low`/`high: false`.
>
> Please update your YAML to the new form when convenient.

_Entity example_:

```yaml
type: custom:entity-progress-card
# ...your other options
watermark:
  low:
    entity: sensor.night_baseline_power
    attribute: today # optional
  high: 80
```

_Jinja example_:

```yaml
type: custom:entity-progress-card
# ...your other options
watermark:
  low:
    jinja: "{{ states('input_number.night_floor') | float }}"
  high: 80
```

_Entity value with overrides example_ — combining an entity-sourced `value` with
`as`/`color` requires the full `{ value: ..., as, color }` form; a flattened
`{ entity: ..., as: ..., color: ... }` (no `value` wrapper) is normalized to
this shape internally, but writing it out explicitly is clearer:

```yaml
type: custom:entity-progress-card
# ...your other options
watermark:
  high:
    value:
      entity: sensor.monthly_target_percentage
    as: percent # sensor already reports a bar position (0–100), not a raw unit to convert
    color: '#c6a445'
```

**Value interpretation**

`low` and `high` are always expressed in the **entity’s native unit**, on the
same scale defined by `min_value` and `max_value`. The card converts them to a
bar position automatically — they are never raw percentages of the bar. On
Template and Badge Template, which have no `min_value`/`max_value`, `low`/`high`
are always a bar position (0-100, or -100 to 100 with `center_zero`) and `as`
has no effect.

> [!IMPORTANT]
>
> For a `timer` entity, `low`/`high` are always read as a percentage of the bar,
> whatever `as` says: a timer's `max` is the running instance's actual duration,
> not a stable scale — a 20-minute run and a 5-minute run have a different
> `max`, so a raw value would land at a different position every time. `auto`
> keeps `low`/`high` as a stable percentage of the bar for timers, regardless of
> how long any given run is.

| Scenario                                                 | `as`      | `low` / `high` unit       | Example                                                             |
| -------------------------------------------------------- | --------- | ------------------------- | ------------------------------------------------------------------- |
| Percentage sensor (`%`), default range 0–100             | `auto`    | Percentage (0–100)        | `low: 20` → marker at 20 % on the bar                               |
| Percentage sensor (`%`), custom range `min=-100 max=100` | `auto`    | Same custom scale         | `low: 10` → marker at 55 % visually                                 |
| Temperature sensor (`°C`), `min=-10 max=50`              | `auto`    | °C                        | `low: -5` → marker at −5 °C                                         |
| Power sensor (`W`), `min=-7000 max=7000`                 | `auto`    | W                         | `low: -3700` → marker at −3700 W                                    |
| `max_value` is another entity (bar shows %)              | `auto`    | Still the entity’s unit   | `low: 20` means 20 °C even if bar shows %                           |
| `center_zero: true`                                      | `auto`    | Entity’s unit, full range | `low: -5` on a −10…50 scale → placed in the left (negative) half    |
| Any sensor, explicit bar position                        | `percent` | Bar position (0–100)      | `low: { value: 25, as: percent }` → marker fixed at 25 % of the bar |

> **`center_zero` note** — The bar is split into two visual halves: left (min →
> zero) and right (zero → max). `low`/`high` values are mapped to their correct
> half automatically regardless of whether the range is symmetric or not. With
> `as: percent`, the value is a direct position on the full bar, bypassing the
> two-half mapping: -100 is the left edge, 0 the center and 100 the right edge
> (`25` lands at 62.5 % of the width).

_Example_:

```yaml
type: custom:entity-progress-card
# ...your other options
watermark:
  type: striped # red and yellow stripes
  high:
    value: 80 # 🔺 Upper threshold (e.g., max recommended battery level)
    color: red # 🎨 Color to indicate the high watermark zone
  low:
    value: 10 # 🔻 Lower threshold (e.g., minimum safe battery level)
    color: yellow # 🎨 Color to indicate the low watermark zone
```

[🔼 Back to top]

#### `alert_when`

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`alert_when`** [Map] _(optional)_

Makes the card stand out when the value goes above or below a limit: unlike
theme colors, the card itself changes (border, background, a label), which is
easier to notice on a wall-mounted dashboard.

[Preview in the Cookbook](cookbook.md#effect-alert-when).

> [!NOTE]
>
> Template and Badge Template only have the `jinja` field (since 1.6.2). Return
> the object form: a plain `true` triggers too, with the default `border` and
> the theme's error color.

_Map definition_:

- `above` (Float|Map): Alert when the value goes above this threshold. Ignored
  when `jinja` is set (see below). Same value/entity/Jinja shape as
  [`min_value`](#min_value) — see
  [Value shapes & shortcuts](#value-shapes--shortcuts).
- `below` (Float|Map): Alert when the value goes below this threshold. Ignored
  when `jinja` is set. Same shape as `above`.
- `jinja` (string, optional): replaces `above`/`below` as the trigger entirely.
  Returns either:
  - `true`/`false`: just triggers or clears the alert, `color`/`highlight`/
    `animation`/`label` below stay as configured.
  - an object with any of `{color, animation, highlight, label}`: triggers the
    alert **and** overrides those fields at this update; a key left out keeps
    its value below.
- `color` (string): CSS color used for the alert (name or hex). Defaults to the
  theme's error color for `border`/`background`; with `highlight: label`, the
  pill takes the state icon color.
- `highlight` (string): What reacts to the alert.
  - `border` (default): The card border takes the alert color.
  - `background`: A tint of the card background instead — the border stays
    neutral.
  - `label`: Shows the [`status_label`](#status_label) status pill instead of
    touching the border/background at all — only while the alert is active. Uses
    `label` below for the pill's text, and `color` for its color (same
    GitHub-label-style rendering as the standalone `status_label` option). Takes
    over the pill from a plain `status_label` Jinja template if both happen to
    be set.
- `label` (string, optional): Fixed text shown in the pill when
  `highlight: label` and the alert is active (e.g. `"HIGH"`). Plain text, not
  Jinja — chosen once alongside the threshold itself. No effect with any other
  `highlight` value.
- `animation` (string, optional): How that reaction moves. If omitted, it
  defaults to `blink` for `border`/`label` and `static` for `background` (this
  matches the behavior before `animation` existed, so old configs are
  unaffected).
  - `static`: No motion — steady color.
  - `blink`: Pulses between the alert color and the resting color (the pill's
    own opacity, with `highlight: label`).
  - `ping`: A ring bursts around the whole card, or around the pill with
    `highlight: label` — independent of the border/background/pill color itself.

`above`/`below` are expressed in the entity's native unit, on the same scale as
`min_value`/`max_value` — like `watermark.low`/`watermark.high`. Both can be
combined; the alert triggers if either condition is met.

`above`/`below` accept three forms — same explicit shape as
`min_value`/`max_value`/`watermark.low`/`watermark.high`, each mode uses its own
explicit key, so there is nothing to guess from the value's shape:

- a fixed number, such as `10`,
- `{ entity: ..., attribute: ... }` — an entity ID whose state is used as the
  threshold (`attribute` is optional, to read a specific attribute instead of
  the state),
- `{ jinja: ... }` — a Jinja template that dynamically returns a number.

In the visual editor, three buttons (Fixed value / Entity / Template) let you
switch between the three modes, same as `min_value`/`max_value`. A second,
top-level chip (Simple / Advanced) switches between `above`/`below` and `jinja`
— Advanced hides `above`/`below` entirely.

`blink` and `ping` are disabled automatically when the system-level "Reduce
Motion" accessibility setting is on (see [Accessibility] in the README) — the
border or background then stays statically colored, so the alert remains visible
without the motion.

_Fixed value example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  above: 80
  color: red
  highlight: border
  animation: ping
```

_`highlight: label` example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  above: 80
  color: red
  highlight: label
  label: 'HIGH'
```

> [!NOTE]
>
> Like [`status_label`](#status_label) itself, `highlight: label` has no visible
> effect on a Badge — accepted, just as inert as `status_label` would be there.

_Entity example_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  above:
    entity: sensor.cpu_temperature_limit
  color: red
```

_Advanced (Jinja trigger) example — plain boolean_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  jinja: >-
    {{ states('sensor.cpu_temperature') | float > 80 and
       is_state('input_boolean.alerts_enabled', 'on') }}
  color: red
  highlight: border
  animation: ping
```

_Advanced (Jinja trigger) example — object, partial override_:

```yaml
type: custom:entity-progress-card
entity: sensor.cpu_temperature
alert_when:
  jinja: >-
    {% set t = states('sensor.cpu_temperature') | float %}
    {% if t > 90 %}{{ {'color': 'red', 'animation': 'ping'} }}
    {% elif t > 80 %}{{ {'color': 'orange'} }}
    {% else %}false{% endif %}
  color: red
  animation: static
```

The 80-90°C range only overrides `color` — `animation` falls back to the
`static` set above; past 90°C both are overridden.

_Template example — object return, the only form worth using here since there's
no static `color`/`highlight` to fall back to_:

```yaml
type: custom:entity-progress-card-template
percent: "{{ states('sensor.cpu_temperature') | float }}"
alert_when:
  jinja: >-
    {% set t = states('sensor.cpu_temperature') | float %}
    {% if t > 80 %}{{ {'color': 'red', 'highlight': 'background', 'animation': 'ping'} }}
    {% else %}false{% endif %}
```

[🔼 Back to top]

### Behavior And Actions

Define interactions on tap, double tap, or hold gestures.

[🔼 Back to top]

<a id="xyz_action"></a>

#### `tap_action`, `hold_action`, `double_tap_action` (`xyz_action`)

[![Card OK][Card-OK]](#compatibility) [![Badge OK][Badge-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`xyz_action`** [Map] ➡️ {action: {`more-info` | `toggle` | `perform-action`
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
> `icon_*_action` is only available on Card, Template and Multi-Card (not the
> badges, the Tile Feature or the Multi-Feature).

_Available actions_:

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
- `perform_action` _action_, `data` _map_, `target` _map_: the action to run
  when action is `perform-action` (e.g. `perform_action: light.turn_on`).

_Default:_

- tap_action: `more-info`
- hold_action: `none`
- double_tap_action: `none`
- icon_tap_action: depends on the entity's domain, like Home Assistant's tile
  card (see the table below)
- icon_hold_action: `none`
- icon_double_tap_action: `none`

_Default `icon_tap_action` by entity:_

| Entity domain                                                                                              | Default `icon_tap_action` |
| ---------------------------------------------------------------------------------------------------------- | ------------------------- |
| `light`, `switch`, `fan`, `input_boolean`, `group`, `automation`, `humidifier`, `valve`                    | `toggle`                  |
| `button`, `input_button`                                                                                   | `toggle` (presses it)     |
| `scene`                                                                                                    | `toggle` (activates it)   |
| any other (`sensor`, `media_player`, `remote`, `siren`, `vacuum`, `water_heater`, `cover`, `climate`, ...) | `none`                    |

Any `icon_tap_action` you set replaces the default. When the icon's action is
`none`, a tap, hold or double tap on the icon runs the card's own action
(`tap_action`, …).

> [!NOTE]
>
> We have merged the functionalities of `navigate_to` and `show_more_info` into
> `tap_action`. Both were removed in **v1.2.0** (a console notice is logged):
> use `tap_action`.

_Example_:

```yaml
type: custom:entity-progress-card
entity: light.living_room
# ...your other options
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
# ...your other options
tap_action:
  action: more-info
  entity: sensor.pv_total_power
```

<a id="template"></a>

## Template and Badge Template

Options of the card template (`custom:entity-progress-card-template`) and the
badge template (`custom:entity-progress-badge-template`): the
[common options](#common-options) of the card, plus the fields written in Jinja
([specific options](#specific-options)). The labels under each option name say
which of them accept it ([Compatibility labels](#compatibility)).

> [!TIP]
>
> In the visual editor (HA 2026.2+), the bug icon (🐛) next to a Jinja field
> shows what your template gives, before you save ([details](#jinja)).

### Common options

These options work as on the card, except:

- `theme`: percentage themes only;
- `alert_when`: its `jinja` field only;
- `hide`: no `unit`, `name_info`, `info` (`custom_info`) or `state_content`;
- `content_order`: no `name_info`, `state_content` or `value`.

The Badge Template is narrower still: no `badge_icon`, `badge_color`,
`force_circular_background`, `density`, `height`, `multiline`, `content_order`,
`icon_animation`, `bar_aligned`, `bar_max_width`, `bar_single_line`,
`text_effect`, `text_shadow`, `trend_indicator`, `status_label` or icon actions;
`layout` is always `horizontal`, `bar_position` is `default` or `icon`,
`bar_orientation` has no `up`/`down`, `bar_size` has no `xlarge` and `hide` has
no `shape`.

These card options don't exist on a Template, whose Jinja fields replace them
(see [Specific options](#specific-options)): `attribute`, `min_value`,
`max_value`, `reverse`, `decimal`, `unit`, `unit_spacing`, `unit_position`,
`value_compact`, `value_sign`, `disable_unit`, `bar_scale`, `bar_stack`,
`peak_marker`, `name_info`, `custom_info`, `state_content`, `custom_theme` and
`interpolate`.

`entity` is optional on a Template: it gives the default icon, the state color
of the icon and bar (unless `color`, `bar_color` or `theme` is set) and the
target of the default `more-info` tap.

| **Option**                                                  | **Type**                  | **Default**  | **Description**                       |
| :---------------------------------------------------------- | :------------------------ | :----------- | :------------------------------------ |
| **Data Options**                                            |                           |              |                                       |
| [`entity`](#entity)                                         | string (optional)         | —            | Main entity ID                        |
| **Styling Options**                                         |                           |              |                                       |
| [`badge_icon`](#badge_icon)                                 | Jinja (optional)          | —            | Dynamic badge icon                    |
| [`badge_color`](#badge_color)                               | Jinja (optional)          | —            | Dynamic badge color                   |
| [`bar_size`](#bar_size)                                     | string (optional)         | `small`      | Size of the progress bar              |
| [`bar_position`](#bar_position)                             | string (optional)         | `default`    | Position of the progress bar          |
| [`bar_single_line`](#bar_single_line)                       | boolean (optional)        | `false`      | single-line mode for overlay bars     |
| [`bar_segments`](#bar_segments)                             | integer (optional)        | —            | Render bar as discrete segments       |
| [`bar_ring`](#bar_ring)                                     | object (optional)         | —            | Start, gap and edge of the ring       |
| [`bar_effect`](#bar_effect)                                 | string/list/Jinja (opt.)  | —            | Visual effects for the bar            |
| [`bar_color_mode`](#bar_color_mode)                         | string (optional)         | `auto`       | Bar fill color rendering mode         |
| [`bar_max_width`](#bar_max_width)                           | string (optional)         | —            | Limits the max width of the bar       |
| [`bar_aligned`](#bar_aligned)                               | boolean/string (optional) | `false`      | Bars start at the same x              |
| [`bar_orientation`](#bar_orientation)                       | string (optional)         | `ltr`        | Bar direction                         |
| [`icon_animation`](#icon_animation)                         | string (optional)         | —            | Animate icon on active state          |
| [`force_circular_background`](#force_circular_background)   | boolean (optional)        | `false`      | Force icon circle background          |
| [`trend_indicator`](#trend_indicator)                       | boolean/map (optional)    | `false`      | Displays trend icons.                 |
| [`status_label`](#status_label)                             | string/Map (optional)     | —            | Status pill on the card               |
| [`text_effect`](#text_effect)                               | string (optional)         | `none`       | Text readability effect (overlay)     |
| [`density`](#density)                                       | string (optional)         | `default`    | Smaller footprint preset              |
| [`layout`](#layout)                                         | string (optional)         | `horizontal` | Layout direction                      |
| [`frameless`](#frameless)                                   | boolean (optional)        | `false`      | Remove card frame                     |
| [`marginless`](#marginless)                                 | boolean (optional)        | `false`      | Remove top/bottom margin              |
| [`height`](#height)                                         | string (optional)         | —            | Card height                           |
| [`min_width`](#min_width)                                   | string (optional)         | —            | Minimum width                         |
| [`reverse_secondary_info_row`](#reverse_secondary_info_row) | boolean (optional)        | `false`      | Flip info bar layout                  |
| [`multiline`](#multiline)                                   | boolean (optional)        | `false`      | Split secondary text on 2 lines       |
| [`content_order`](#content_order)                           | list (optional)           | layout's own | Order of name, infos, value, bar      |
| [`center_zero`](#center_zero)                               | boolean/map (optional)    | `false`      | Center the bar on 0                   |
| [`theme`](#theme)                                           | string (optional)         | —            | Preset theme (percentage themes only) |
| [`hide`](#hide)                                             | list/Jinja (optional)     | —            | Hide parts of the card                |
| [`watermark`](#watermark)                                   | map (optional)            | —            | Adds min/max overlays                 |
| [`alert_when`](#alert_when)                                 | map (optional)            | —            | Highlight card (Jinja only)           |
| **Behavior And Actions**                                    |                           |              |                                       |
| [`xyz_action`](#xyz_action)                                 | map (optional)            | see defaults | Tap/double/hold actions               |

`name`, `icon`, `color`, `bar_color`, `secondary`, `percent` and `fast_refresh`
are in [Specific options](#specific-options).

[🔼 Back to top]

### Specific options

#### `fast_refresh`

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`fast_refresh`** [Boolean] _(optional, default: `false`)_

Any Jinja field using `now()`/`utcnow()` (e.g. a `secondary: {{ ... }}`
countdown) already gets a free refresh once a minute — Home Assistant pushes it
on its own, no config needed. Set `fast_refresh: true` to instead force a
refresh every second, for a real ticking `MM:SS` countdown. This isn't tied to
`entity` being a `timer` — it works the same for any `now()`-based countdown,
e.g. against `sun.sun` for a sunrise/sunset countdown, or an `input_datetime`.

There's a real cost to this: it resubscribes every Jinja field on the card once
a second for as long as `fast_refresh` is on, instead of relying on the single
persistent, free push. Leave it off unless you actually need second-level
ticking.

_Example_:

```yaml
type: custom:entity-progress-card-template
entity: timer.dishwasher
fast_refresh: true
secondary: >-
  {% set remaining = as_datetime(state_attr('timer.dishwasher', 'finishes_at'))
  - now() %}
  {{ '%02d:%02d' % (remaining.seconds // 60, remaining.seconds % 60) }}
```

_Example (non-timer entity)_:

```yaml
type: custom:entity-progress-card-template
entity: sun.sun
fast_refresh: true
secondary: >-
  {% set next_rising = as_datetime(state_attr('sun.sun', 'next_rising')) %}
  {% set remaining = next_rising - now() %}
  {{ '%02d:%02d:%02d' % (remaining.seconds // 3600, (remaining.seconds % 3600) // 60, remaining.seconds % 60) }}
```

[🔼 Back to top]

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

<a id="secondary"></a>

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

<a id="percent"></a>

#### `percent` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`percent`** [JINJA] ➡️ [Float]

Calculates the progress percentage using templates. Enables complex calculations
from multiple entities or custom formulas. Expected 0-100 (-100 to 100 with
[`center_zero`](#center_zero)); values outside are clamped. An empty or
non-numeric result is drawn as 0 %.

_Example_:

A simple example:

```yaml
percent: >-
  {% set used = states('sensor.disk_used') | int %} {% set total =
  states('sensor.disk_total') | int %} {{ (used / total * 100) | round(1) if total > 0 else 0 }}
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

> [!NOTE]
>
> Template and Badge Template only: a Multi-Card row takes a plain color (see
> [Multi-Card and Multi-Feature](#multi)).

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

When [`theme`](#theme) is set, `color` is ignored: the theme colors the icon.

[🔼 Back to top]

#### `bar_color` (Jinja)

[![Template OK][Template-OK]](#compatibility)
[![Badge Template OK][BadgeTemplate-OK]](#compatibility)

> **`bar_color`** [JINJA] ➡️ [String]

Conditionally sets the progress bar color using templates. Supports gradients
and complex color logic.

See [`bar_color`](#bar_color).

> [!NOTE]
>
> Template and Badge Template only: a Multi-Card row takes a plain color (see
> [Multi-Card and Multi-Feature](#multi)).

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

When [`theme`](#theme) is set, `bar_color` is ignored: the theme colors the bar.

[🔼 Back to top]

<a id="multi"></a>

## Multi-Card and Multi-Feature

Options of the multi-card (`custom:entity-progress-multi-card`) and the
multi-feature (`custom:entity-progress-multi-feature`, in a Tile card's
`features:`): several bars, one line per entity, for example every battery of
the house. The labels below mark the options specific to Multi; **a row also
takes the card's own options (see below), whatever their labels.**

Specific to Multi: [`entities`](#multi-entities), [`rows`](#multi-rows),
[`layout` and `bar_position`](#multi-layout) and [`bar_aligned`](#bar_aligned).

_Minimal example_:

```yaml
type: custom:entity-progress-multi-card
entities:
  - sensor.phone_battery
  - sensor.tablet_battery
```

Each row is a real [`entity-progress-card`](#standard) in
[`density: single_line`](#density) (`single_column` with
[`layout: vertical`](#multi-layout)) — icon, name, value and bar on one line —
so it keeps its own more-info tap, colors, state and text. The aggregator only
stacks them and divides the available height between them.

> [!NOTE]
>
> New in 1.6.1. Both have a visual editor since 1.6.3: an entity list you can
> add to, reorder and delete from, and a pencil on each row that opens that
> row's own configuration. An option set on enough rows moves up to the card as
> a shared default on its own.

Because a row is a whole card, every row option it accepts is the card's own:
[`hide`](#hide), [`unit`](#unit), [`decimal`](#decimal),
[`watermark`](#watermark), [`alert_when`](#alert_when) and the rest. What it
does **not** accept is anything the row shape settles on its behalf: `layout`,
`bar_position`, `bar_single_line`, `density`, `frameless`, `marginless`,
`multiline`, `height` and `min_width`: the editor doesn't offer them on a row,
and only `layout` and `bar_position` come from the Multi-Card's top level; the
row shape overrides `density`, `bar_position`, `frameless`, `marginless`,
`layout` and `multiline`. Written by hand on a single row, `height`, `min_width`
and `bar_single_line` still reach that row's card: don't set them. The
multi-card sets [`layout` and `bar_position`](#multi-layout) for all its rows at
once.

> [!NOTE]
>
> No Jinja on a row's [`color`](#color) or [`bar_color`](#bar_color): both are
> plain values, as on the card ([`hide`](#hide) still takes a template). For a
> color that follows the value, use [`theme`](#theme) or
> [`custom_theme`](#custom_theme); for one that depends on a condition, stack
> [Template](#template) cards instead of a Multi-Card, and give them one
> [`bar_aligned`](#bar_aligned) name to keep the bars lined up.

A stack's bars start at the same x on their own: [`bar_aligned`](#bar_aligned),
on by default, gives every row the text column of the widest.
[`bar_max_width`](#bar_max_width) is the exception worth knowing: a row does
take it, and it pins the bar instead, the text taking what is left (neither has
an effect with `layout: vertical`). Set once at the top level, it applies to
every row. The CSS hook `--epb-multi-value-width` pins the text column to a
fixed width on any `single_line` row without a [`content_order`](#content_order)
(in a Multi or not; no effect with `layout: vertical`), over `bar_aligned`; next
to `bar_max_width`, the bar keeps its width and the text column takes the rest —
in your Home Assistant theme (`epb-multi-value-width: 120px`), every card using
that theme gets it, no `card_mod` needed.

> [!IMPORTANT]
>
> `entity-progress-multi-feature` is the tight one. Its rows split a **single**
> 42px feature row between them, so everything scales down with the row height:
> the icon, the text and the bar's own box.
>
> Because of that:
>
> - Its rows default to `hide: [icon, name]`: a bar and its value. Get the rest
>   back with `hide: []`, or name what you want gone.
> - No tap/hold/double-tap on the icon, and no
>   [`force_circular_background`](#force_circular_background) (nor `shape` as a
>   [`hide`](#hide) target): the icon is too small.
> - No [`trend_indicator`](#trend_indicator), [`status_label`](#status_label),
>   [`badge_icon`](#badge_icon) / [`badge_color`](#badge_color): a row has no
>   corner for them.
> - No [`alert_when`](#alert_when): its frame and ring have no room inside the
>   Tile.
>
> `entity-progress-multi-card` has the room and keeps all of it, hiding nothing
> by default.

<a id="multi-entities"></a>

### `entities`

[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`entities`** [List] ➡️ list of maps _(required: without it the card is
> empty)_

Each item is a row config — at minimum an `entity` (a bare entity id is accepted
as shorthand for `entity: …`), plus any card option except `layout`,
`bar_position`, `bar_single_line`, `density`, `frameless`, `marginless`,
`multiline`, `height` and `min_width`. Any option set at the **top level** of
the multi config (outside `entities`) is applied to every row as a shared
default; a row can override it individually. A top-level `name`, `icon` or
`attribute` is copied into each row that has none (the row's own value wins); a
top-level `entity` is ignored. A row without an `entity` is skipped. A
Multi-Feature's editor and top level also leave out the options listed in the
note above.

`bar_size` defaults to `small` for every item unless set otherwise. Pick
`xsmall` (see [`bar_size`](#bar_size)) to fit more bars in the same space.

_Example (`entity-progress-multi-card`, standalone)_:

```yaml
type: custom:entity-progress-multi-card
bar_size: small # the default in a Multi, shown for clarity
entities:
  - entity: sensor.printer_black_cartridge
    bar_color: black
  - entity: sensor.printer_cyan_cartridge
    bar_color: cyan
  - entity: sensor.printer_magenta_cartridge
    bar_color: magenta
  - entity: sensor.printer_yellow_cartridge
    bar_color: yellow
```

_Example (`entity-progress-multi-feature`, inside a Tile card)_:

```yaml
type: tile
entity: sensor.printer
features:
  - type: custom:entity-progress-multi-feature
    bar_size: xsmall
    entities:
      - entity: sensor.printer_black_cartridge
        bar_color: black
      - entity: sensor.printer_cyan_cartridge
        bar_color: cyan
      - entity: sensor.printer_magenta_cartridge
        bar_color: magenta
      - entity: sensor.printer_yellow_cartridge
        bar_color: yellow
```

> [!IMPORTANT]
>
> `entity-progress-multi-feature` always fits its bars into a **single** Tile
> feature row (HA's own `--feature-height`, 42px by default) — it never spans
> multiple rows. With too many entities for the chosen `bar_size`, rows get
> shorter rather than overflowing, and the text gives way before the bar does;
> switch to `xsmall` to comfortably fit more.

[🔼 Back to top]

<a id="multi-value"></a> <a id="multi-show_value"></a>

### Value and text of a row

A row shows its entity's value by default — it is a whole card, with its own
text. Take it off with [`hide`](#hide), top level for every row or on a single
row:

```yaml
type: custom:entity-progress-multi-card
hide:
  - value
entities:
  - entity: sensor.printer_black_cartridge
    bar_color: black
```

[`decimal`](#decimal), [`unit`](#unit) and [`unit_spacing`](#unit_spacing) work
as on a standalone card and can be set per row; to drop the unit, use
`hide: [unit]` (`disable_unit` is deprecated).

Which side of the bar the text sits on is
[`reverse_secondary_info_row`](#reverse_secondary_info_row), the card's own
option — a row takes it like any other, top level for every row or on a single
row. Left unset, icon, name and value come first and the bar takes the rest of
the row; set to `true`, the bar comes first and the text follows it. It has no
effect with `layout: vertical`.

```yaml
type: custom:entity-progress-multi-card
reverse_secondary_info_row: true
entities:
  - entity: sensor.printer_black_cartridge
```

For any other order, [`content_order`](#content_order) takes one line, as on a
`single_line` card, and replaces `reverse_secondary_info_row`:

```yaml
type: custom:entity-progress-multi-card
content_order: [[value, name, bar]]
entities:
  - entity: sensor.printer_black_cartridge
```

> [!IMPORTANT]
>
> **`value_position` is deprecated since 1.6.3** (a console warning is logged) —
> use [`reverse_secondary_info_row`](#reverse_secondary_info_row) instead
> (`right` becomes `true`). It still works and is automatically migrated for the
> session, at the top level and per row; the editor's **Migrate config** button
> writes the new form into your YAML for good. See [Deprecated Options].

> [!IMPORTANT]
>
> **`show_value` is deprecated.** It existed when a row was a bare bar that
> could not print anything else, so showing a value had to be opted into. A row
> is a whole card now — icon, name, value, bar — and the option collapses into
> [`hide`](#hide).
>
> It is migrated for the session to the `hide` list that keeps its look (`true`
> → `hide: [icon, name]`; `false` also adds `secondary_info`). See [Deprecated >
> Options].

[🔼 Back to top]

<a id="multi-rows"></a>

### `rows`

[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`rows`** [Integer] _(optional, default: one row per entity, `3` with
> `layout: vertical`)_

`entity-progress-multi-card` only: the multi-feature always fills one tile row.
Sets how many Sections grid rows the card occupies (see Home Assistant's own
`grid_options`). Unlike the Tile feature, a card in the Sections grid can
reliably span multiple rows, so bars are evenly divided across the full,
measured height instead of being capped to one row. The card always takes the
full section width (12 grid columns) and at least 1 row.

_Example_:

```yaml
type: custom:entity-progress-multi-card
rows: 2
entities:
  - entity: sensor.printer_black_cartridge
  - entity: sensor.printer_cyan_cartridge
  - entity: sensor.printer_magenta_cartridge
  - entity: sensor.printer_yellow_cartridge
```

[🔼 Back to top]

<a id="multi-layout"></a>

### `layout` and `bar_position`

[![Multi-Card OK][MultiCard-OK]](#compatibility)

> **`layout`** [String] ➡️ `horizontal` | `vertical` _(optional, default:
> `horizontal`)_
>
> **`bar_position`** [String] ➡️ `default` | `overlay` _(optional, default:
> `default`)_

`entity-progress-multi-card` only (the multi-feature stays horizontal), set at
the top level. `vertical` turns the rows into columns side by side, each one a
[`density: single_column`](#density) card, as `horizontal` makes each row a
`single_line` one: icon, name and value, then the bar standing upright under
them. With `bar_position: overlay`, the bar fills the column behind the texts.
`bar_position` only applies with `vertical`.

The bar fills from the bottom; a row set to
[`bar_orientation: down`](#bar_orientation) fills from the top. Left unset,
[`rows`](#multi-rows) defaults to 3. [`content_order`](#content_order) takes the
lines of a `vertical` card.

_Example_:

```yaml
type: custom:entity-progress-multi-card
layout: vertical
entities:
  - entity: sensor.printer_black_cartridge
  - entity: sensor.printer_cyan_cartridge
  - entity: sensor.printer_magenta_cartridge
  - entity: sensor.printer_yellow_cartridge
```

[🔼 Back to top]

### `bar_aligned`

[![Card OK][Card-OK]](#compatibility)
[![Template OK][Template-OK]](#compatibility)
[![Multi-Card OK][MultiCard-OK]](#compatibility)
[![Multi-Feature OK][MultiFeature-OK]](#compatibility)

> **`bar_aligned`** [Boolean | String] ➡️ _(optional, default: `true` on a
> Multi, `false` on a card)_

Not on the tile feature or the badges. Lines bars up at the same x: every row of
a group takes the text column of its widest row, whatever each one prints —
`9 %` and `78 %`, `900 W` and `1600 W`.

- **`true`**, a Multi's default: its own rows form the group, and no other
  card's. `bar_aligned: false` lets each row size its own text.
- **A name** (`bar_aligned: batteries`): every row and every card of the page
  carrying that name forms one group, across cards — a Multi and the cards
  beside it, a `vertical-stack-in-card`, everything an `auto-entities`
  generates. Cards without the name, or with another one, stay out of it. A name
  is written in YAML. On a Multi, the visual editor's toggle leaves the option
  unset when on (the Multi's default `true`) or restores a name an earlier off
  parked, and writes `false` when off; it is hidden while `bar_max_width` is
  set. Card and Template have no toggle.

The column follows the text as it grows — a longer name, another unit, a value
reaching 100 % — at once. When the text gets shorter, it waits: only a narrower
text that holds for 30 seconds tightens it, so a value changing every second
doesn't move the bars every second, and a wall panel that never reloads doesn't
keep the width of a long text gone by. A resize or a config change measures it
from scratch.

- It needs text beside the bar: a [`density: single_line`](#density) row (every
  row of a horizontal Multi; not with `layout: vertical`), or a card in the
  default shape — `layout: horizontal`, `bar_position: default`, not
  `bar_size: xlarge` — where the value sits next to the bar. Elsewhere the bar
  has a row of its own and already starts at the same x. A lone card with `true`
  has no one to line up with.
- Keep one shape per group: a single-line row measures its name and value, a
  default card its value alone.
- The column never takes more than half of a row; longer text ellipses.
- [`bar_max_width`](#bar_max_width) pins the bar instead, and wins:
  `bar_aligned` does nothing next to it. `--epb-multi-value-width` wins over
  `bar_aligned`, not over `bar_max_width`.

_Examples_:

```yaml
type: custom:entity-progress-multi-card
bar_aligned: false # each row sizes its own text
entities:
  - sensor.phone_battery
  - sensor.tablet_battery
  - sensor.living_room_remote_battery
```

```yaml
type: custom:auto-entities
filter:
  include:
    - attributes:
        device_class: battery
      options:
        type: custom:entity-progress-card
        bar_aligned: batteries
card:
  type: custom:vertical-stack-in-card
card_param: cards
```

[🔼 Back to top]

---

Next: the [Cookbook](cookbook.md), with a capture of the main effects.

[🔼 Back to top]: #top
[yaml-only]: https://img.shields.io/badge/YAML-Only-orange.svg?style=flat
[Card-OK]: https://img.shields.io/badge/Card-OK-green.svg?style=flat
[Badge-OK]: https://img.shields.io/badge/Badge-OK-green.svg?style=flat
[Feature-OK]: https://img.shields.io/badge/Feature-OK-blue.svg?style=flat
[Template-OK]: https://img.shields.io/badge/Template-OK-green.svg?style=flat
[BadgeTemplate-OK]:
  https://img.shields.io/badge/Badge%20Template-OK-green.svg?style=flat
[MultiCard-OK]:
  https://img.shields.io/badge/Multi--Card-OK-purple.svg?style=flat
[MultiFeature-OK]:
  https://img.shields.io/badge/Multi--Feature-OK-purple.svg?style=flat
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
[Card sizing]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/theme.md#card-sizing
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
