## What's new

This update is a major evolution for the Entity Progress Card. We’ve focused on
deeper Home Assistant integration, a high-performance rendering engine, and a
brand-new CSS API for effortless styling.

### ⭐ Highlights

#### 🧩 Tile Feature Support

The Entity Progress Card can now be used as a native **Tile Feature**. This
allows you to embed a progress bar directly inside a standard Home Assistant
Tile card.

```yaml
type: tile
entity: sensor.cpu_percent
features:
  - type: custom:entity-progress-feature
    entity: sensor.cpu_percent
```

- Overlay Mode: Anchor the bar to the top or bottom edge of a tile without
  increasing its height.
- Full Power: Supports all standard options, including watermarks, bar effects,
  and Jinja2 templates.

```yaml
features:
  - type: custom:entity-progress-feature
    entity: sensor.cpu_percent
    bar_position: bottom
```

➡️ [Feature]: Adding the progress bar as a feature in a card #95 (@Gunth)

#### ⚡ Performance & Interaction Refactor

We’ve re-engineered the "brain" of the card to be faster and more reliable:

- Native Action Handler: We’ve replaced custom gesture logic with Home
  Assistant’s native system. Tap, hold, and double-tap now behave exactly like
  official cards across all devices.
- GPU-Accelerated Animations: Instead of just changing the width, the bar now
  uses a technical trick (CSS Transforms) that makes the animation much
  smoother.
- Optimized Jinja2: Template processing is now smarter, using high-performance
  "resolvers" to prevent UI stutter when updating multiple cards at once.

#### 🎨 New public CSS API

Internal CSS variables have been renamed and a public API is now exposed via
`--epb-*` variables ([Theme Guide]). Cards can now be styled directly from your
theme YAML or via `card_mod` without any hacks.

Available categories:

- **Dimensions** — size, padding, spacing
- **Border** — radius, width, color
- **Colors** — background, icon, text
- **Progress bar** — fill color, background, height
- **Typography** — font size, weight, color

```yaml
type: custom:entity-progress-card
...
card_mod:
  style: |
    ha-card {
      --epb-progress-bar-size: 42px;
      --epb-progress-bar-radius: 12px;
      ...
    }
```

#### 🎨 `color_mode` — Segmented & Rainbow bar coloring

A new `color_mode` option gives you control over how theme colors are rendered
on the progress bar fill. Three modes are available:

- **`auto`** — the existing behavior: the bar displays the solid color of the
  current theme zone. No visual change for existing configurations.
- **`segment`** — each color zone defined by the active theme is rendered as a
  distinct colored block, visible up to the current entity value. At a glance
  you can see where the entity stands relative to each zone boundary.
- **`rainbow`** — a smooth gradient flows across all visible zone colors,
  transitioning between each zone's color at the correct threshold.

Works with both predefined themes (`optimal_when_high`, `optimal_when_low`, …)
and custom themes defined as arrays. Linear themes (e.g. `light`) are also
supported — zone boundaries are derived automatically by splitting 0–100% into
equal segments based on the number of levels.

Available in the **visual editor** (card, badge, tile feature) — the field
appears automatically when a theme or custom theme is configured.

```yaml
type: custom:entity-progress-card
entity: sensor.battery_level
theme: optimal_when_high
color_mode: segment   # or rainbow
```

### 🚀 New Features

#### 🎯Configurable `center_zero`

`center_zero` now accepts an object in addition to a boolean:

```yaml
center_zero:
  value: 230 # center the bar on a non-zero nominal value
  growth_percent: true # display text as growth % relative to `value`
```

- growth_percent only changes the displayed text; the bar's visual fill still
  reflects distance-to-bound as before. Falls back safely when value is 0. Fully
  backward compatible with center_zero: true/false.
- Added center_zero_value (number) and center_zero_growth_percent (toggle)
  fields to the visual editor, shown only while center_zero is enabled.

➡️ [Feature]: Add a possibility to set a zero value #115 (@aremishevsky)

#### 💧 Watermark improvements

**Smarter value interpretation**

`low` and `high` are now always expressed in the entity's native unit, on the
same scale as `min_value`/`max_value`. The card converts them to a bar position
automatically — whether your sensor is in `°C`, `W`, `%`, or any other unit,
you just set the threshold value and the card handles the rest.

This also applies to `center_zero` mode: values are mapped to the correct visual
half (left for negative, right for positive) regardless of whether the range is
symmetric or not.

**New `low_as` / `high_as` keys**

For cases where you want to pin a watermark at an exact bar position regardless
of the entity scale, you can now set `low_as: percent` or `high_as: percent`.
The value is then used as a direct percentage (0–100) of the bar, bypassing
any unit conversion. Each threshold is configured independently.

```yaml
watermark:
  low: 25
  low_as: percent   # fixed at 25 % of the bar
  high: 3700        # in entity unit (e.g. W), converted automatically
```

The default is `auto`, which keeps the existing behaviour — no breaking changes.

#### 🧩 `hide` now supports Jinja templates

You can now hide card elements dynamically using a Jinja template, just like
bar_effect already does — instead of being limited to a static list.

In the visual editor, a new "Hide (Jinja mode)" toggle lets you switch between
the classic toggles and a free-form Jinja field:

- Enabling it gives you an empty {{ }} template to fill in.
- Disabling it clears the template and restores the per-element toggle.

No breaking changes — existing hide: [...] array configs work exactly as before.

➡️ [Feature]: Allow dynamically hiding/showing the progress bar #112 (amaurylam)

#### 📐 Improved progress bar layouts

If you like putting your text directly on top of the progress bar (Overlay
mode), this update is for you.

- Major improvements to the progress bar `overlay` layout, especially for
  vertical cards.
- Added a new `background` position for the progress bar. In this mode, the bar
  expands to fill the entire card
- Progress bar sizing and spacing are now more consistent across layouts.
- Improved support for overlay mode with better alignment and transitions.
- Text over the Bar: Improved "Text Shadow" support.
- Smart Cornering: The card now automatically matches the "Border Radius" (the
  roundness of the corners) of your specific Home Assistant theme. It will look
  like it truly belongs in your dashboard.
- Extended HA color usable in the YAML editor: see theme guide.

The `below` position is no longer just a hidden workaround for `xlarge` bar
size. It is now a fully supported layout option for both horizontal and vertical
cards, placing the progress bar below the card content as a dedicated row.

- `bar_position: below` is now available in both `horizontal` and `vertical`
  layouts
- `bar_size: xlarge` automatically sets `bar_position: below` regardless of
  layout, ensuring the oversized bar always renders correctly without manual
  configuration

the default badge color has been changed to transparent to prevent any unwanted
visual glitches or “flash” effects during state transitions.

### 🎨 Visual Editor improvements

The visual editor (GUI) has been redesigned to be more intuitive:

- Dynamic Fields: Improved the logic that shows or hides fields based on the
  current configuration (e.g., attribute selectors now appear only after an
  entity is selected).
- Toggles: Relocated toggle switches to improve readability, replacing complex
  option lists with simple Show/Hide switches.
- Max Value Entity: Added better support for using a second entity or a specific
  attribute as the maximum value for the progress bar.
- added: `badge_color`, `badge_icon`, `bar_effect`, `bar_orientation`,
  `bar_position`, `bar_single_line`, `center_zero`, `center_zero`/`value`,
  `center_zero`/`growth_percent`, `state_content`, `text_shadow`,
  `reverse_secondary_info_row`.
- Name Composition: Implemented a "Token" system for the name field. It now
  supports dynamic arrays (tokens) instead of just static strings.
- Updated the layout selector to use a box mode, utilizing standard Home
  Assistant tile layout SVGs for a more native look.
- New Resolvers: Added helper methods to fetch specific Home Assistant metadata
- Validation: Refined the bar_position and bar_size logic to prevent conflicts
  when using full-card layouts.
- Both `hide` and `bar_effect` accept an array _or_ a Jinja template. The editor
  now exposes a dedicated **toggle** to switch into Jinja mode (mirroring the
  existing `bar_effect_jinja` pattern, now also applied to `hide` via
  `hide_jinja`):
  - Toggling on initializes an empty `{{ }}` template field for you to fill in.
  - Toggling off resets to `[]` and restores the per-item toggles.
  - The toggle/field labels are now distinguishable in the UI (e.g. _"Bar effect
    (Jinja mode)"_ vs _"Hide (Jinja mode)"_ — previously both showed an
    ambiguous "Enable Jinja").

### ♿ Accessibility

Accessibility has been significantly improved.

The card now exposes its progress bar using proper ARIA attributes, while
decorative elements are hidden from assistive technologies. Screen readers can
navigate directly to the card and announce progress values correctly.

### 🌐 Expanded Language Support

This release adds six new languages, making the interface more accessible
worldwide:

- <img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/refs/heads/main/docs/images/ca.svg" alt="" width="14px" />
  ca – Catalan / Català
- 🌎 es-419 – Spanish (Latin America) / Español (Latinoamérica)
- 🇭🇺 hu – Hungarian / Magyar
- 🇸🇰 sk – Slovak / Slovenčina
- 🇸🇮 sl – Slovene / Slovenščina
- 🇱🇹 lt – Lithuanian / Lietuvių
- 🇱🇻 lv – Latvian / Latviešu
- 🇪🇪 et – Estonian / Eesti
- 🇧🇷 pt-BR – Brazilian Portuguese / Português (Brasil)
- 🇨🇳 zh-Hans – Simplified Chinese / 简体中文
- 🇹🇼 zh-Hant – Traditional Chinese / 繁體中文

✅ You can contribute by adding more languages or fixing any mistakes.

### 🛡️ Stability & Fixes

#### 2026.2+ Compatibility:

Updated selectors and form elements to ensure full compatibility with the latest
Home Assistant frontend changes.

#### Badge Icon/Color - Visual stability improvements (anti-flicker fixes)

This release includes several important improvements aimed at enhancing visual
stability and eliminating flickering cases during dynamic UI updates,
particularly around badge rendering and state transitions.

The badge is now displayed even when there is no overlap between the icon and
color states, as shown in the example below.

```yaml
badge_icon: |-
  {% if states('input_boolean.xxx') == 'on' %}
    mdi:play
  {% endif %}
badge_color: |-
  {% if states('input_boolean.xxx') == 'on' %}
    orange
  {% else %}
    disabled 
  {% endif %}
```

#### Other fixes:

- Fixed watermark positions in `center_zero` mode
  ➡️ [Bug]: wrong watermark positions in center_zero mode #114 (@aremishevsky)
- Fixed watermark support for `number` and `counter`
  
- Update color mappings for various thresholds  
  ➡️ Merge pull request #116 (@vemboy200)
- Bug Fixes: Resolved issues related to accordion animations in the editor and
  CSS variable propagation removing home-made accordion and using native HA
  component.
- Performance Optimization: Improved DOM management and rendering logic to
  ensure smoother updates.
- Card structure refactor
  - The way names, secondary info, and progress bars are organized has been
    simplified and renamed for clarity.
  - Card spacing and padding are now more consistent in all layouts.
  - Improved grid layout behavior for vertical cards.
- Reduced CSS complexity which improves browser rendering performance.
  - Watermark and zero mark rendering has been redesigned to be more flexible.
  - Improved support for low/high watermark visual styles (area, line, round,
    striped, triangle, etc.).
  - Removed duplication and cleanup
- General refactoring and stability improvements on logs, Jinja & config
  management.
- Added: Card/Badge template now correctly displays colors based on priority —
  entity state color by default, overridden by Jinja `color` / `bar_color`
  parameters when defined.
- Added: The card now respects the user `quote_decimal` / Swiss format setting.
- Fixed Ripple effect for hover and tap animations  
  ➡️ [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Fixed an issue where the icon would disappear in the editor preview when
  editing a badge template configuration and would not come back until a full
  page reload.
- Fixed: guard against null/undefined config and prevent cascading errors
- fixed(layout): center content vertically in horizontal xlarge card 🎨
  Improvements

<!-- Links -->

[Theme Guide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/theme.md
