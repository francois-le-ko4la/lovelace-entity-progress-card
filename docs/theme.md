<a id="top"></a>

# 🎨 Themes

Jump to the specific section:

- [Token color](#token-color)
- [Predefined theme](#predefined-theme)
  - 🔋 [Optimal when high (Battery...)](#optimal-high)
  - 💽 [Optimal when low (CPU, RAM, disk...)](#optimal-low)
  - 💡 [Light](#light)
  - 🌡️ [Temperature](#temperature)
  - 💧 [Humidity](#humidity)
  - 🦠 [VOC](#voc)
  - 🦠 [PM 2.5](#pm25)
- [Adapt to HA custom theme](#adapt-to-ha-custom-theme)
  - [CSS variables](#css)
  - [Usage](#usage)

## Token color

This card leverages Home Assistant’s default color system to seamlessly align
with your active theme preferences.

When defining a color by name, we utilize the standard CSS color palette, which
has evolved over time to include extended color keywords, X11 colors, and SVG
colors (updated in 2022: <https://www.w3.org/TR/css-color-3/#svg-color>).

To maintain a consistent look & feel, we translate color names to Home
Assistant's color definitions. We provide a list of these colors below. If a
color is missing, please do not hesitate to let us know. If you choose a
CSS-compatible color name that is not part of this list, the rendering will be
as defined by the CSS standard.

| **Color Name** | **Mapped CSS Variable**    |
| :------------- | :------------------------- |
| `primary`      | `var(--primary-color)`     |
| `accent`       | `var(--accent-color)`      |
| `red`          | `var(--red-color)`         |
| `pink`         | `var(--pink-color)`        |
| `purple`       | `var(--purple-color)`      |
| `deep-purple`  | `var(--deep-purple-color)` |
| `indigo`       | `var(--indigo-color)`      |
| `blue`         | `var(--blue-color)`        |
| `light-blue`   | `var(--light-blue-color)`  |
| `cyan`         | `var(--cyan-color)`        |
| `teal`         | `var(--teal-color)`        |
| `green`        | `var(--green-color)`       |
| `light-green`  | `var(--light-green-color)` |
| `lime`         | `var(--lime-color)`        |
| `yellow`       | `var(--yellow-color)`      |
| `amber`        | `var(--amber-color)`       |
| `orange`       | `var(--orange-color)`      |
| `deep-orange`  | `var(--deep-orange-color)` |
| `brown`        | `var(--brown-color)`       |
| `light-grey`   | `var(--light-grey-color)`  |
| `grey`         | `var(--grey-color)`        |
| `dark-grey`    | `var(--dark-grey-color)`   |
| `blue-grey`    | `var(--blue-grey-color)`   |
| `black`        | `var(--black-color)`       |
| `white`        | `var(--white-color)`       |
| `disabled`     | `var(--disabled-color)`    |

[🔼 Back to top]

## Predefined theme

Predefined themes (Card and Badge) are built-in Lovelace themes provided by
default. They allow you to quickly apply a consistent and visually appealing
style to your dashboard or badge without any manual configuration. These themes
are ideal for getting an immediate result and improving the look and feel of
your interface with minimal effort.

<a id="optimal-high"></a>

### 🔋 Optimal when high (Battery...)

The "Optimal when High" parameter is particularly useful in cases where the
system or component in question performs best at higher values. For instance, in
the case of battery charge, the device functions more efficiently and with
better performance when the battery level is high. By using "Optimal when High,"
you can set a theme that visually emphasizes and prioritizes states where the
value is at its peak.

```yaml
type: custom:entity-progress-card
entity: sensor.in2013_battery_level
theme: optimal_when_high
```

| **Percentage Range** | **Color** | **Description** _(optional)_ |
| :------------------- | :-------- | :--------------------------- |
| 0% – 20%             | `red`     | Critical / Very low          |
| 20% – 50%            | `amber`   | Low                          |
| 50% – 80%            | `yellow`  | Moderate                     |
| 80% – 100%           | `green`   | Optimal / High               |

> [!NOTE]
>
> The icon is automatically retrieved from the entity but can be overridden
> using the `icon` parameter.

[🔼 Back to top]

<a id="optimal-low"></a>

### 💽 Optimal when low (CPU, RAM, disk...)

The "Optimal when Low" parameter is particularly valuable for monitoring systems
or components that perform best when their values are at a lower level. For
example, in the case of memory usage or CPU load, lower values often indicate
that the system is running efficiently and not overburdened.

```yaml
type: custom:entity-progress-card
entity: sensor.system_monitor_cpu_usage
theme: optimal_when_low
```

| **Percentage Range** | **Color** | **Description** _(optional)_ |
| :------------------- | :-------- | :--------------------------- |
| 0% – 20%             | `green`   | Low level / Safe             |
| 20% – 50%            | `yellow`  | Moderate                     |
| 50% – 80%            | `amber`   | Elevated                     |
| 80% – 100%           | `red`     | High / Critical              |

> [!NOTE]
>
> The icon is automatically retrieved from the entity but can be overridden
> using the `icon` parameter.

[🔼 Back to top]

<a id="light"></a>

### 💡 Light

```yaml
type: custom:entity-progress-card
entity: light.bandeau_led
attribute: brightness
theme: light
icon_tap_action:
  action: more-info
```

The `light` configuration, designed by
[@harmonie-durrant](https://github.com/harmonie-durrant), defines how different
brightness levels are visually represented using colors and icons. This system
uses a **linear gradient**, meaning the color transitions smoothly across the
brightness percentage range.

The brightness levels and their corresponding colors are as follows:

| **Brightness Level** | **Color Code** | **Description**    | **Icon**                |
| :------------------- | :------------- | :----------------- | :---------------------- |
| < 25%                | `#4B4B4B`      | Dim light          | `mdi:lightbulb-outline` |
| ≥ 25%                | `#877F67`      | Soft warm light    | `mdi:lightbulb-outline` |
| ≥ 50%                | `#C3B382`      | Medium warm light  | `mdi:lightbulb`         |
| ≥ 75%                | `#FFE79E`      | Bright warm light  | `mdi:lightbulb`         |
| ≥ 100%               | `#FFE79E`      | Maximum brightness | `mdi:lightbulb`         |

The `mdi:lightbulb-outline` icon is used for lower brightness levels, while
`mdi:lightbulb` is displayed when the light intensity increases. Thanks to the
**linear** approach, the brightness smoothly transitions between these levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/light.png" alt="Image title" width="500"/>

[🔼 Back to top]

<a id="temperature"></a>

### 🌡️ Temperature

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

We can use `min_value` and `max_value` to define the range of values we want to
represent with our color gradient. We use predefined intervals, each associated
with a specific color:

| **Temperature Range (°C / °F)** | **Color Variable**         | **Description** |
| :------------------------------ | :------------------------- | :-------------- |
| -50°C – -30°C / -58°F – -22°F   | `var(--deep-purple-color)` | Extremely cold  |
| -30°C – -15°C / -22°F – 5°F     | `var(--dark-blue-color)`   | Very cold       |
| -15°C – -2°C / 5°F – 28.4°F     | `var(--blue-color)`        | Cold            |
| -2°C – 2°C / 28.4°F – 35.6°F    | `var(--light-blue-color)`  | Chilly          |
| 2°C – 8°C / 35.6°F – 46.4°F     | `var(--cyan-color)`        | Cool            |
| 8°C – 16°C / 46.4°F – 60.8°F    | `var(--teal-color)`        | Mild            |
| 16°C – 18°C / 60.8°F – 64.4°F   | `var(--green-teal-color)`  | Slightly warm   |
| 18°C – 20°C / 64.4°F – 68°F     | `var(--light-green-color)` | Comfortable     |
| 20°C – 25°C / 68°F – 77°F       | `var(--success-color)`     | Optimal         |
| 25°C – 27°C / 77°F – 80.6°F     | `var(--yellow-color)`      | Warm            |
| 27°C – 29°C / 80.6°F – 84.2°F   | `var(--amber-color)`       | Hot             |
| 29°C – 34°C / 84.2°F – 93.2°F   | `var(--deep-orange-color)` | Very hot        |
| 34°C – 50°C / 93.2°F – 122°F    | `var(--red-color)`         | Extremely hot   |

> [!IMPORTANT]
>
> Fahrenheit values are converted to apply the correct color. Make sure to set
> your unit to `°F` correctly in order to see the accurate color representation.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/temperature.png" alt="Image title" width="500"/>

[🔼 Back to top]

<a id="humidity"></a>

### 💧 Humidity

```yaml
type: custom:entity-progress-card
entity: sensor.xxx
attribute: humidity
theme: humidity
icon_tap_action:
  action: more-info
```

The `humidity` configuration defines how different humidity levels are
represented with colors and icons. Unlike a linear gradient, this system uses
predefined humidity ranges, each associated with a specific color and icon.

The ranges and their corresponding colors are as follows:

| **Humidity Range** | **Color Variable**         | **Description**      |
| :----------------- | :------------------------- | :------------------- |
| 0% – 23%           | `var(--red-color)`         | Very dry air         |
| 23% – 30%          | `var(--accent-color)`      | Dry air              |
| 30% – 40%          | `var(--yellow-color)`      | Slightly dry air     |
| 40% – 50%          | `var(--success-color)`     | Optimal humidity     |
| 50% – 60%          | `var(--teal-color)`        | Comfortable humidity |
| 60% – 65%          | `var(--light-blue-color)`  | Slightly humid air   |
| 65% – 80%          | `var(--indigo-color)`      | Humid air            |
| 80% – 100%         | `var(--deep-purple-color)` | Very humid air       |

Each range is visually represented using the `mdi:water-percent` icon, ensuring
a clear and intuitive display of humidity levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/humidity.png" alt="Image title" width="500"/>

[🔼 Back to top]

<a id="voc"></a>

### 🦠 VOC

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

The `voc` configuration defines how different levels of volatile organic
compounds (VOCs) are represented using colors and icons. Instead of a linear
gradient, this system categorizes VOC levels into predefined ranges, each
associated with a specific color for better visualization.

The ranges and their corresponding colors are as follows:

| **TVOC Range (ppb)** | **Color Variable**         | **Description**        |
| :------------------- | :------------------------- | :--------------------- |
| 0 – 300              | `var(--success-color)`     | Good air quality       |
| 300 – 500            | `var(--yellow-color)`      | Acceptable air quality |
| 500 – 3000           | `var(--accent-color)`      | Moderate air quality   |
| 3000 – 25,000        | `var(--red-color)`         | Poor air quality       |
| 25,000 – 50,000      | `var(--deep-purple-color)` | Hazardous              |

> [!IMPORTANT]
>
> The information provided in this HA card is based on thresholds from the
> following
> [source](https://support.getawair.com/hc/en-us/articles/19504367520023-Understanding-Awair-Score-and-Air-Quality-Factors-Measured-By-Awair-Element).
> This color code is for informational purposes only and should not be taken as
> professional advice or a standard to follow. It is crucial to consult the
> device's official documentation or current standards for the most accurate and
> up-to-date information. In case of any discrepancy between the information
> provided here and the device's documentation or current standards, the latter
> shall prevail. The lower the value, the better it is generally considered to
> be. With this card you can use `custom_theme` to define your own ranges.

Each range is visually represented using the `mdi:air-filter` icon, ensuring a
clear and intuitive display of VOC levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/voc.png" alt="Image title" width="250"/>

[🔼 Back to top]

<a id="pm25"></a>

### 🦠 PM 2.5

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

The `pm25` configuration defines how different concentrations of fine
particulate matter (PM2.5) are represented using colors and icons. Rather than a
linear gradient, this system categorizes PM2.5 levels into predefined ranges,
each mapped to a specific color for easy interpretation.

The ranges and their corresponding colors are as follows:

| **PM2.5 Range (µg/m³)** | **Color Variable**         | **Description**                |
| :---------------------- | :------------------------- | :----------------------------- |
| 0 – 12                  | `var(--success-color)`     | Good air quality               |
| 12 – 35                 | `var(--yellow-color)`      | Moderate air quality           |
| 35 – 55                 | `var(--accent-color)`      | Unhealthy for sensitive groups |
| 55 – 150                | `var(--red-color)`         | Unhealthy air quality          |
| 150 – 200               | `var(--deep-purple-color)` | Very unhealthy air quality     |

> [!IMPORTANT]
>
> The information provided in this HA card is based on thresholds from the
> following
> [source](https://support.getawair.com/hc/en-us/articles/19504367520023-Understanding-Awair-Score-and-Air-Quality-Factors-Measured-By-Awair-Element).
> This color code is for informational purposes only and should not be taken as
> professional advice or a standard to follow. It is crucial to consult the
> device's official documentation or current standards for the most accurate and
> up-to-date information. In case of any discrepancy between the information
> provided here and the device's documentation or current standards, the latter
> shall prevail. The lower the value, the better it is generally considered to
> be. With this card you can use `custom_theme` to define your own ranges.

Each range is visually represented using the `mdi:air-filter` icon, ensuring a
clear and intuitive display of PM2.5 pollution levels.

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/pm.png" alt="Image title" width="250"/>
</details>

[🔼 Back to top]

## Adapt to HA custom theme

<a id="css"></a>

### CSS variables

| Variable                              | Target       | Category   | Description                                         | Example     |
| ------------------------------------- | ------------ | ---------- | --------------------------------------------------- | ----------- |
| `--epb-card-height`                   | Card         | Dimension  | Card height                                         | `80px`      |
| `--epb-card-width`                    | Card         | Dimension  | Card width                                          | `300px`     |
| `--epb-card-border-width`             | Card         | Border     | Border thickness                                    | `2px`       |
| `--epb-card-border-color`             | Card         | Border     | Border color                                        | `#ff6600`   |
| `--epb-card-border-radius`            | Card         | Border     | Card corner radius                                  | `20px`      |
| `--epb-card-border-style`             | Card         | Border     | Border style                                        | `dashed`    |
| `--epb-card-font-family`              | Card         | Typography | Card font family                                    | `monospace` |
| `--epb-progress-bar-color`            | Progress Bar | Color      | Progress bar fill color                             | `#ff6600`   |
| `--epb-progress-bar-background-color` | Progress Bar | Color      | Progress bar background color                       | `#333333`   |
| `--epb-progress-bar-size`             | Progress Bar | Dimension  | Forces the bar fill size (overrides computed value) | `60%`       |
| `--epb-progress-bar-radius`           | Progress Bar | Border     | Progress bar container border radius                | `4px`       |
| `--epb-progress-inner-radius`         | Progress Bar | Border     | Progress bar inner fill border radius               | `4px`       |
| `--epb-icon-and-shape-color`          | Icon         | Color      | Icon and shape background color                     | `#ff6600`   |
| `--epb-name-color`                    | Name         | Color      | Name color                                          | `#ffffff`   |
| `--epb-name-font-size`                | Name         | Typography | Name font size                                      | `16px`      |
| `--epb-name-font-weight`              | Name         | Typography | Name font weight                                    | `700`       |
| `--epb-name-letter-spacing`           | Name         | Typography | Name letter spacing                                 | `2px`       |
| `--epb-detail-color`                  | Detail       | Color      | Detail color                                        | `#aaaaaa`   |
| `--epb-detail-font-size`              | Detail       | Typography | Detail font size                                    | `12px`      |
| `--epb-detail-font-weight`            | Detail       | Typography | Detail font weight                                  | `300`       |
| `--epb-detail-letter-spacing`         | Detail       | Typography | Detail letter spacing                               | `1px`       |
| `--epb-watermark-line-size`           | Watermark    | Dimension  | Line watermark thickness                            | `3px`       |
| `--epb-watermark-opacity`             | Watermark    | Opacity    | Watermark opacity                                   | `0.5`       |
| `--epb-low-watermark-color`           | Watermark    | Color      | Low watermark color                                 | `#ff0000`   |
| `--epb-high-watermark-color`          | Watermark    | Color      | High watermark color                                | `#00ff00`   |
| `--epb-zero-mark-width`               | Marker       | Dimension  | Zero marker thickness                               | `2px`       |
| `--epb-zero-mark-color`               | Marker       | Color      | Zero marker color                                   | `#ff0000`   |

<a id="usage"></a>

### Usage

#### Theme

The progress bar background defaults to `var(--divider-color)`, a neutral
semi-transparent color. Depending on your Home Assistant theme, this may lack
contrast or clash with your design.

You can override it globally by defining `--epb-progress-bar-background-color`
directly in your theme YAML — no need to configure each card individually:

```yaml
my_custom_theme:
  # ...
  epb-progress-bar-background-color: 'rgba(255, 255, 255, 0.12)'
```

> [!NOTE] When declaring CSS variables in a theme YAML file, omit the `--`
> prefix — Home Assistant adds it automatically.

This applies to all cards using that theme.

#### card_mod

All public CSS variables can also be scoped to a single card using
[card_mod](https://github.com/thomasloven/lovelace-card-mod):

```yaml
type: custom:entity-progress-card
entity: sensor.battery
card_mod:
  style: |
    ha-card {
      --epb-card-height: 80px;
      --epb-card-width: 300px;

      --epb-card-border-width: 2px;
      --epb-card-border-color: #ff6600;
      --epb-card-border-radius: 20px;
      --epb-card-border-style: dashed;

      --epb-progress-bar-color: #ff6600;
      --epb-progress-bar-background-color: #333333;
      --epb-icon-and-shape-color: #ff6600;
      --epb-low-watermark-color: #ff0000;
      --epb-high-watermark-color: #00ff00;
      --epb-watermark-opacity: 0.5;
      --epb-watermark-line-size: 3px;
      --epb-zero-mark-width: 2px;

      --epb-progress-bar-size: 60%;
      --epb-progress-bar-radius: 4px;
      --epb-progress-inner-radius: 4px;

      --epb-card-font-family: monospace;
      --epb-name-color: #ffffff;
      --epb-name-font-size: 16px;
      --epb-name-font-weight: 700;
      --epb-name-letter-spacing: 2px;

      --epb-detail-color: #aaaaaa;
      --epb-detail-font-size: 12px;
      --epb-detail-font-weight: 300;
      --epb-detail-letter-spacing: 1px;
    }
```

[🔼 Back to top]

## card_mod and card structure

### Class Name Updates & Migration Guide (v1.5.3+)

This project has evolved with new use cases, which means that the original class
names needed to be revisited. The goal of this update is to simplify the
identification of elements within the cards, making it easier to understand and
maintain.

These changes also prepare the codebase for future releases, ensuring
consistency and flexibility for upcoming features.

To help you transition to this new class naming scheme, you will find the table
below, which shows the mapping between the old and new class names. This should
guide you in updating your custom card modifications.

| **Old Class**                    | **New Class**            | **Notes / Usage**                                    |
| -------------------------------- | ------------------------ | ---------------------------------------------------- |
| `name-group`                     | `name`                   | Main container for the name block                    |
| `name-combined`                  | `name-value`             | Displays the combined main and extra name            |
| `name`                           | `name-main`              | Main name text                                       |
| `name-custom-info`               | `name-extra`             | Extra name info, appended after main name            |
| `secondary-info-detail-group`    | `secondary-info-wrapper` | Container for secondary info (state/progress/custom) |
| `secondary-info-detail-combined` | `secondary-info-value`   | Displays main + extra secondary info                 |
| `state-and-progress-info`        | `secondary-info-main`    | Main secondary info (was progress/state)             |
| `secondary-info-custom-info`     | `secondary-info-extra`   | Extra secondary info (was custom info)               |
| `progress-bar-container`         | `bar-container`          | Progress bar wrapper                                 |
| `progress-bar-inner`             | `inner`                  | Single inner bar element (positive/negative unified) |
| `progress-bar-low-zero`          | `zero`                   | Zero mark for center-zero bars                       |
| `progress-bar-low-wm`            | `low`                    | Low watermark marker                                 |
| `progress-bar-high-wm`           | `high`                   | High watermark marker                                |

[🔼 Back to top]

### DOM

#### entity-progress-card

```text
ha-card.entity-progress-card...
 ├─ ha-ripple
 ├─ div.container
 │   ├─ div.trend-indicator (optional)
 │   │   └─ ha-icon.trend-icon
 │   ├─ div.icon-section
 │   │   ├─ shape.shape
 │   │   │   ├─ ha-ripple
 │   │   │   └─ div.icon
 │   │   │       └─ ha-state-icon
 │   │   └─ div.badge (optional)
 │   │       └─ ha-icon.badge-icon
 │   └─ div.content-section
 │       ├─ div.name
 │       │   └─ div.ellipsis-wrapper
 │       │       └─ span.name-value
 │       │           ├─ span.name-main
 │       │           └─ span.name-extra (optional)
 │       └─ div.secondary-info
 │           └─ div.secondary-info-group
 │               └─ div.ellipsis-wrapper
 │                   └─ span.secondary-info-value
 │                       ├─ span.secondary-info-main
 │                       └─ span.secondary-info-extra (optional)
 └─ div.top-container / div.bottom-container / div.below-container (depends on barPosition)
     └─ div.bar-container
         └─ div.progress-bar.default / center-zero (depends on bar type)
             ├─ div.inner
             ├─ div.low.watermark.mark
             ├─ div.high.watermark.mark
             └─ div.zero.mark (if center-zero)
```

#### Template

```text
ha-card...
 ├─ ha-ripple
 ├─ div.container
 │   ├─ div.trend-indicator (optional)
 │   │   └─ ha-icon.trend-icon
 │   ├─ div.icon-section
 │   │   ├─ shape.shape
 │   │   │   ├─ ha-ripple
 │   │   │   └─ div.icon
 │   │   │       └─ ha-state-icon
 │   │   └─ div.badge (optional)
 │   │       └─ ha-icon.badge-icon
 │   └─ div.content-section
 │       ├─ div.name
 │       │   └─ div.ellipsis-wrapper
 │       │       └─ span.name-value
 │       │           ├─ span.name-main
 │       │           └─ span.name-extra (optional)
 │       └─ div.secondary-info
 │           └─ div.secondary-info-group
 │               └─ div.ellipsis-wrapper
 │                   └─ span.secondary-info-value
 │                       ├─ span.secondary-info-main
 │                       └─ span.secondary-info-extra (optional)
 └─ div.top-container / div.bottom-container / div.below-container (if barPosition)
     └─ div.bar-container
         └─ div.progress-bar.default / center-zero
             ├─ div.inner
             ├─ div.low.watermark.mark
             ├─ div.high.watermark.mark
             └─ div.zero.mark (if center-zero)
```

#### Badge

```text
ha-card...
 ├─ div.container
 │   ├─ div.icon-section
 │   │   └─ shape.shape
 │   │       ├─ ha-ripple
 │   │       └─ div.icon
 │   │           └─ ha-state-icon
 │   └─ div.content-section
 │       ├─ div.name
 │       │   └─ div.ellipsis-wrapper
 │       │       └─ span.name-value
 │       │           ├─ span.name-main
 │       │           └─ span.name-extra (optional)
 │       └─ div.secondary-info
 │           └─ div.secondary-info-group
 │               └─ div.ellipsis-wrapper
 │                   └─ span.secondary-info-value
 │                       ├─ span.secondary-info-main
 │                       └─ span.secondary-info-extra (optional)

```

#### Center-Zero / Vertical Bars (Additional Variants)

```text
ha-card...
 ├─ div.container
 │   ├─ div.icon-section (optional)
 │   └─ div.content-section
 │       ├─ div.name
 │       │   └─ span.name-value
 │       └─ div.secondary-info
 │           └─ span.secondary-info-value
 └─ div.bar-container.vertical / top / bottom / below
     └─ div.progress-bar.center-zero
         ├─ div.inner
         ├─ div.low.watermark.mark
         ├─ div.high.watermark.mark
         └─ div.zero.mark
```


[🔼 Back to top]

[🔼 Back to top]: #top
