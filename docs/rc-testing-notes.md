## What's new

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
