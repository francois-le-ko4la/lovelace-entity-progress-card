## What's new

- Added: Card/Badge template now correctly displays colors based on priority —
  entity state color by default, overridden by Jinja `color` / `bar_color`
  parameters when defined.
- General refactoring and stability improvements on logs, Jinja & config management.
- Rename internal CSS variables and expose public CSS variable API — cards can
  now be styled via theme YAML or `card_mod` using `--epb-*` variables (dimensions,
  border, colors, progress bar, typography).

### 🧩 Bug Fixes

- Fixed [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Fixed an issue where the icon would disappear in the editor preview when
  editing a badge template configuration and would not come back until a full
  page reload.
- Fixed: guard against null/undefined config and prevent cascading errors
- fixed(layout): center content vertically in horizontal xlarge card
