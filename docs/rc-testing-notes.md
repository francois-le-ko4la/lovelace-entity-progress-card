## What's new

This update is a major evolution for the Entity Progress Card. We’ve focused on
deeper Home Assistant integration, a high-performance rendering engine, and a
brand-new CSS API for effortless styling.

### 🧩 Tile Feature Support

New: Tile Feature Support

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

⚡ Performance & Interaction Refactor

We’ve re-engineered the "brain" of the card to be faster and more reliable:

- Native Action Handler: We’ve replaced custom gesture logic with Home
  Assistant’s native system. Tap, hold, and double-tap now behave exactly like
  official cards across all devices.
- GPU-Accelerated Animations: Instead of just changing the width, the bar now
  uses a technical trick (CSS Transforms) that makes the animation much smoother
  and uses less "brainpower" from your phone or computer.
- Optimized Jinja2: Template processing is now smarter, using high-performance
  "resolvers" to prevent UI stutter when updating multiple cards at once.

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

The `below` position is no longer just a hidden workaround for `xlarge` bar
size. It is now a fully supported layout option for both horizontal and vertical
cards, placing the progress bar below the card content as a dedicated row.

- `bar_position: below` is now available in both `horizontal` and `vertical`
  layouts
- `bar_size: xlarge` automatically sets `bar_position: below` regardless of
  layout, ensuring the oversized bar always renders correctly without manual
  configuration

### ✨ Visual Polish & bar_position

If you like putting your text directly on top of the progress bar (Overlay
mode), this update is for you.

- Major improvements to the progress bar `overlay` layout, especially for vertical
  cards.
- Added a new `background` position for the progress bar. In this mode, the bar
  expands to fill the entire card
- Progress bar sizing and spacing are now more consistent across layouts.
- Improved support for overlay mode with better alignment and transitions.
- Text over the Bar: Improved "Text Shadow" support.
- Smart Cornering: The card now automatically matches the "Border Radius" (the
  roundness of the corners) of your specific Home Assistant theme. It will look
  like it truly belongs in your dashboard.
- Extended HA color usable in the YAML editor: see theme guide.

### 🎨 Improved Editor Experience

The visual editor (GUI) has been redesigned to be more intuitive:

- Dynamic Fields: Improved the logic that shows or hides fields based on the
  current configuration (e.g., attribute selectors now appear only after an
  entity is selected).
- Toggles: Relocated toggle switches to improve readability, replacing complex
  option lists with simple Show/Hide switches.
- Max Value Entity: Added better support for using a second entity or a specific
  attribute as the maximum value for the progress bar.
- added: `badge_color`, `badge_icon`, `bar_effect`, `bar_orientation`,
  `bar_position`, `bar_single_line`, `center_zero`, `state_content`,
  `text_shadow`, `reverse_secondary_info_row`.
- Name Composition: Implemented a "Token" system for the name field. It now
  supports dynamic arrays (tokens) instead of just static strings.
- Updated the layout selector to use a box mode, utilizing standard Home
  Assistant tile layout SVGs for a more native look.
- New Resolvers: Added helper methods to fetch specific Home Assistant metadata
- Validation: Refined the bar_position and bar_size logic to prevent conflicts
  when using full-card layouts.

### 🗣️ Accessibility improvements

The card now properly exposes its progress bar to screen readers via ARIA
attributes (role="progressbar", aria-valuemin, aria-valuemax, aria-valuenow).
The icon section and decorative elements are marked as aria-hidden to avoid
noise for assistive technologies. The card is exposed as a named region,
allowing screen readers to navigate into its content and read the progress
value directly.

### 🌐 Expanded Language Support

This release adds six new languages, making the interface more accessible
worldwide:

- 🇦🇩 ca – Catalan / Català
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

- 2026.2 Compatibility: Updated selectors and form elements to ensure full
  compatibility with the latest Home Assistant frontend changes.
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
  - Progress bars: Now use a unified "inner" element instead of separate
    positive/negative bars. Zero, low, and high markers have simpler classes.
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
- Fixed [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Fixed an issue where the icon would disappear in the editor preview when
  editing a badge template configuration and would not come back until a full
  page reload.
- Fixed: guard against null/undefined config and prevent cascading errors
- fixed(layout): center content vertically in horizontal xlarge card 🎨
  Improvements
