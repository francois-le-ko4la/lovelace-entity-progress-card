## What's new

This update is a major evolution for the Entity Progress Card: deeper Home
Assistant integration, a faster rendering engine, and a brand-new CSS API for
effortless styling. Everything below can be set up from the visual editor.

### ⭐ Highlights

#### 🧩 Put a progress bar inside a Tile card

The card now works as a native **Tile feature**: add it to any Tile card and get
a progress bar inside it — or anchor the bar to the top or bottom edge of the
tile as a slim overlay.

```yaml
type: tile
entity: sensor.cpu_percent
features:
  - type: custom:entity-progress-feature
    entity: sensor.cpu_percent
```

➡️ [Feature]: Adding the progress bar as a feature in a card #95 (@Gunth)

#### 🖱️ Taps and gestures feel native

Tap, hold and double-tap now use Home Assistant's own gesture system — they
behave exactly like official cards on every device. Animations are noticeably
smoother too, even on large dashboards.

#### 🎨 Style it from your theme

Want a thicker bar? Rounder corners? Different colors? The card now exposes
friendly `--epb-*` style variables you can set from your theme or via `card_mod`
— no hacks needed. See the [Theme Guide].

#### 🌈 New bar coloring styles

With a theme active, choose how the bar is painted (`bar_color_mode`):

- `segment` — each color zone appears as a distinct block,
- `rainbow` — a smooth gradient through all the zone colors,
- or keep `auto` — the current look, nothing changes if you do nothing.

### 🧘 Breaking Changes (Don't Panic)

A few options have a new, clearer syntax. **Your dashboards keep working as
they are** — the card understands the old syntax and converts it on the fly.
You'll just see a gentle reminder in the browser console; update your YAML
whenever you feel like it.

- `max_value: <entity id>` / `max_value_attribute` → folded into [max_value]
- `disable_unit` → folded into [hide]
- `additions` → renamed to [bar_stack]

### 🚀 New Features

#### 🔋 Battery-style segmented bar

Display the bar as separate blocks — like battery cells or signal bars — with
`bar_segments: 10`. Works in every orientation, with every effect and color
mode.

#### 📊 Bar stack: combine several entities in one bar

`bar_stack` (formerly `additions`) combines several entities into one bar,
with three modes (`stacked`, `proportional`, `net`), per-entity colors, and
`center_zero` support for values that can go either way — switchable from
the visual editor on the Card and the Badge (YAML only on the Tile
Feature). Full details in the [bar_stack] reference.

#### 🌀 Animated icons

Make the icon spin while the fan is running, or pulse while music plays:
`icon_animation: spin` / `pulse`. The animation stops by itself when the entity
is off, and respects your device's "reduce motion" setting.

#### 🚨 Get alerted at a glance

Have the card call for attention when a value crosses a limit — a pulsing border
or a tinted background, in the color of your choice:

```yaml
alert_when:
  above: 90
```

#### 📉 Dynamic min & max

The bar's range no longer has to be fixed numbers: min and max can each follow
another entity or a template. Pick the mode with the new selector chips in the
editor (Fixed value / Entity / Template).

#### 🎯 Center the bar on any value

`center_zero` can now center the bar on a nominal value other than 0 (say, 230
V) and even display the deviation as a percentage.

➡️ [Feature]: Add a possibility to set a zero value #115 (@aremishevsky)

#### 💧 Simpler watermarks

Set your `low`/`high` thresholds directly in the sensor's own unit (°C, W, %…) —
the card places them on the bar for you. Prefer a fixed position?
`low_as: percent` / `high_as: percent` are there for that.

#### 🫥 Hide elements dynamically

The `hide` option now also accepts a template, so parts of the card can appear
and disappear based on conditions.

➡️ [Feature]: Allow dynamically hiding/showing the progress bar #112 (amaurylam)

#### 📐 Better layouts

- Overlay mode (text on the bar) looks much better, especially on vertical
  cards.
- New `background` position: the bar fills the whole card.
- The card automatically matches your theme's corner roundness.

### 🎨 A friendlier visual editor

Almost every option can now be configured without touching YAML:

- clear mode chips for min/max values (Fixed value / Entity / Template),
- custom color zones (`custom_theme`) — previously YAML-only — now have their
  own row editor, with a chip switch between Preset and Custom theme,
- an Interactions panel that shows what the default action actually is, and
  keeps rarely-used actions out of the way until you need them,
- a more native Home Assistant look & feel throughout.

### 🩺 Something wrong? Ask the card

Run `EPB_DIAG.dump()` in your browser console: it prints everything useful for a
bug report (versions, browser, common installation problems) — and it even
detects on its own whether the card is accidentally installed twice.

### 🧪 Try it: demo dashboard

Import [`docs/demo-dashboard.yaml`](demo-dashboard.yaml) and move the sliders to
see the features live.

### ♿ Accessibility

The card now exposes its progress bar using proper ARIA attributes, while
decorative elements are hidden from assistive technologies. Screen readers can
navigate directly to the card and announce progress values correctly.

### 🌐 New Languages

This release adds six new languages: ca, es-419, et, hu, lt, lv, pt-BR, sk, sl,
zh-Hans, and zh-Hant — contributions welcome!

### 🛡️ Fixes

Compatible with Home Assistant 2026.2+. Among the notable fixes:

- Fixed: No more crashes with unusual entities (template sensors without an ID,
  timers restoring after a Home Assistant restart, sensors with odd units,
  timers longer than 24 h…) — the card shows a clear message instead of a red
  error screen.
- Fixed: A tap could sometimes trigger an action twice after navigating between
  views
- Fixed: Badge icon and color no longer flicker during state changes.
- Fixed: Trend arrows no longer get stuck on template cards.
- Fixed: Watermarks are now placed correctly in `center_zero` and for
  `number`/`counter` entities.
- Fixed: `center_zero` with no `min_value` set used to leave the negative half
  with no range at all (nothing could ever show there). It now defaults
  `min_value` to `-max_value` automatically.  
  ➡️ [Bug]: wrong watermark positions in center_zero mode #114 (@aremishevsky)
- Fixed: Ripple effect on template cards.
  ➡️ [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Color mappings updated for the built-in themes  
  ➡️ Merge pull request #116 (@vemboy200)
- The card respects your number format setting (e.g. Swiss format).
- Noticeably faster and lighter on dashboards with many cards.
- Text formatting from templates keeps working, but scripts can no longer be
  injected through entity names or media titles (see [Supported HTML]).

Thanks to everyone who reported, tested and contributed! 🙏

<!-- Links -->

[Supported HTML]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#supported-html
[Theme Guide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/theme.md
[bar_stack]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_stack
[max_value]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#max_value
[hide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#hide
