## What's new

### 🧩 Tile Feature Support

Entity Progress Card can now be used as a native **tile feature**, displayed
as a progress bar directly embedded inside a Home Assistant tile card.
```yaml
type: tile
entity: sensor.cpu_percent
features:
  - type: custom:entity-progress-feature
    entity: sensor.cpu_percent
```

The feature supports all standard progress bar options including watermarks,
bar effects, center-zero mode, and Jinja2 templates.

A dedicated overlay mode is also available, allowing the progress bar to be
anchored to the top or bottom edge of the tile card without increasing its
height:
```yaml
features:
  - type: custom:entity-progress-feature
    entity: sensor.cpu_percent
    bar_position: bottom
```

### ⚡ Action Handler Refactoring

Replaced the custom gesture detection system (pointer events, timers, click
counting) with Home Assistant's native `action-handler`. Tap, hold and
double tap are now fully delegated to HA's internal system, ensuring
consistent behavior across all platforms (browser, mobile app, tablet).

### 🎨 Public CSS Variable API

Internal CSS variables have been renamed and a public API is now exposed via
`--epb-*` variables. Cards can now be styled directly from your theme YAML or
via `card_mod` without any hacks.

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

### 📐 `below` Bar Position — Now a First-Class Layout

The `below` position is no longer just a hidden workaround for `xlarge` bar size.
It is now a fully supported layout option for both horizontal and vertical cards,
placing the progress bar below the card content as a dedicated row.

- `bar_position: below` is now available in both `horizontal` and `vertical` layouts
- `bar_size: xlarge` automatically sets `bar_position: below` regardless of layout,
  ensuring the oversized bar always renders correctly without manual configuration

### 🧩 Improvements and Bug Fixes

- General refactoring and stability improvements on logs, Jinja & config management.
- Added: Card/Badge template now correctly displays colors based on priority —
  entity state color by default, overridden by Jinja `color` / `bar_color`
  parameters when defined.
- Fixed [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Fixed an issue where the icon would disappear in the editor preview when
  editing a badge template configuration and would not come back until a full
  page reload.
- Fixed: guard against null/undefined config and prevent cascading errors
- fixed(layout): center content vertically in horizontal xlarge card
