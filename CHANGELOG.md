# 📝 Changelog

All notable changes to the Entity Progress Card are documented here, most recent
first. See [`docs/rc-testing.md`](docs/rc-testing.md) for how to try a release
candidate safely before it becomes stable.

## What's new (1.6.1-rc3)

### ✨ New

- **`entity-progress-multi-card`/`entity-progress-multi-feature` can now show
  each entity's own value next to its bar** (`show_value: true`, shared or per
  item) — a bare bar is enough on its own for something like a printer
  cartridge, but not for values where the number itself matters (energy in
  Watts, a tank in liters…). The bar gives up part of its width for the value
  instead of an overlay - a bare feature bar is already thin enough that
  overlaid text would fight it for contrast. `decimal`/`unit`/`disable_unit`/
  `unit_spacing` all work the same as on the standard card.
  `value_position: left`/`right` (default `left`) picks which side it sits on,
  and every value takes up the same fixed width instead of sizing to its own
  text, so bars meant to read as comparable actually line up regardless of digit
  count. See [`show_value`](docs/configuration.md#multi-show_value).

### 🐛 Fixes

- **`icon_animation: { effect, jinja }` never actually triggered the animation
  on a Template card** (`entity-progress-card-template` and its badge), even for
  a template that always resolves `true`. Every other Jinja-driven option
  re-applies whatever it just changed itself right after resolving (e.g.
  `min_value`/`max_value` call `_updateCSS()`, `alert_when` calls
  `_applyAlertClasses()`) - `icon_animation`'s own handler was missing this and
  only ever set the resolved value, relying on some _other_, unrelated refresh
  to happen to re-check it afterward. A standard card gets one soon enough from
  its regular entity-driven updates, masking the bug there, but a Template card
  has no such incidental refresh to piggyback on, so the animation never
  started. It now re-applies its own CSS classes right after resolving, the same
  way every other option already does.  
  ➡️ [Enhancement]: template/condition to trigger the icon animation directly
  #125 (@FoxP)

- **`center_zero`'s negative arm with `bar_color_mode: segment`/`rainbow` and a
  theme (or `custom_theme`) could render as a single flat color instead of a
  gradient** — e.g. `theme: temperature` with `center_zero: { value: 20 }`
  showed solid blue (or another single theme color) across the whole negative
  arm instead of fading through the zones its actual range covers. Two
  independent bugs combined here, both pre-existing and never exercised until
  now (not related to the `min_value`/`max_value`/theme-scope changes above):
  - The negative arm's projection window is reversed (it grows away from center,
    toward the scale's own low end), which flips the zones' position order
    relative to their value-ascending declaration order (e.g. temperature's
    coldest zone ends up at the _highest_ local position). CSS `linear-gradient`
    clamps any stop whose position is lower than the previous one up to that
    same position — once one out-of-order stop hit, every stop after it
    collapsed onto it. Zones are now sorted by their projected local position
    before building gradient stops (a no-op for the normal, non-reversed
    direction), keeping stops properly ordered either way.
  - Separately, the negative arm's CSS grows in the opposite direction from
    every other bar (it slides toward the low end instead of away from it),
    which puts its "current value" and "zeroValue" ends on the opposite box
    edges from what the gradient math assumes - the real color transitions ended
    up computed entirely outside the visible portion, leaving only a single
    held-flat color showing. The gradient is now painted in the mirrored CSS
    direction for this arm specifically, which corrects this without changing
    any of the position math itself.
- **On a compressed horizontal card, the progress bar could shrink to a
  near-invisible sliver (or get pushed out past the card's edge entirely) while
  the name/secondary-info text next to it never gave up any of its own space.**
  The bar had no minimum width at all, while the text already had one (45px) -
  every bit of horizontal squeeze landed on the bar alone instead of being
  shared. The two now hold coupled, proportional floors: the bar keeps a `30px`
  minimum (`--epb-progress-bar-min-width`, overridable via `card_mod` for anyone
  who wants a different balance) and the text keeps `45px`, but each caps at a
  fraction of the row (33% for the bar, 25% for the text - the bar gets the
  bigger guaranteed share, since a squeezed bar loses its whole purpose as a
  progress indicator while squeezed text still has ellipsis to fall back on)
  once the row can't fit both floors at once, so they can never sum past the
  row's width and force one or the other to overflow. The gap between them (10px
  by default) shrinks the same way under pressure, freeing a few more pixels
  right where the text and bar floors are already fighting for room.
- **The card could clip `name`/`secondary_info` text when the OS or browser's
  own font-size accessibility setting was scaled up** (e.g. Android's system
  "Font size" option) — text rendered larger than the fixed-height row it sat
  in, and got cut off mid-glyph instead of the row growing to fit. `name`/
  `secondary_info` rows now hold a `min-height` (not a fixed `height`) with a
  `line-height` that only ever grows past the default (`max(default, 1.2em)`)
  - identical look at the default font scale, but room to grow instead of clip
    once the actual font is genuinely larger. Not applied to
    `layout: vertical` + `bar_position: overlay` + `bar_orientation: up`: there,
    the text row is a flex item competing with the icon section
    (`flex-shrink: 0`) for space, and letting it grow broke that specific layout
    (confirmed via DevTools computed styles) - it keeps its original
    fixed-height behavior for now (see [`docs/ideas.md`](docs/ideas.md) for a
    possible follow-up).  
    ➡️ [Bug]: Some parts of the card are not visible on Android #131 (@zkurzyns)
- **A percent-based sensor (`unit_of_measurement: "%"`) with `custom_theme`
  zones could stop filling the bar all the way at 100%**, if any zone's `max`
  went past 100 (e.g. a top zone of `80-120` used purely as a color buffer for
  values that might drift slightly above 100). 1.6.1-rc2 had `max_value`
  auto-default from the active theme's/`custom_theme`'s own top zone bound
  whenever left unset, so it picked up `120` here and used it as the bar's own
  fill scale - a `100.0` reading only filled to `100/120 ≈ 83%`. `custom_theme`
  is now dropped from that auto-default entirely - its zones are user-defined
  and may extend past the entity's real range on purpose, with no reliable way
  to tell that apart from a genuine `max_value`. A built-in theme with
  real-world value zones (`temperature`, `voc`, `pm25`) keeps the auto-default
  for `max_value` only - picking one of them is already a deliberate, specific
  choice, so the theme's own top bound is safe to assume as the entity's real
  range; `min_value` stays at its own default (`0`, or the theme's own lowest
  bound with `center_zero` - see [`max_value`](docs/configuration.md#max_value)
  for the full explanation). `bar_color_mode: segment`/`rainbow` always projects
  a theme's zones onto `[min_value, max_value]` - the visible "scope": a
  mismatch between an entity's real range and its theme's/`custom_theme`'s own
  zone scale now only ever clips or shifts which zones are reachable, never the
  fill percentage itself.  
  ➡️ [Bug]: JINJA Should accept more STYLE tags #129 (@emartoni)

### 🧪 Try it: demo dashboard

[`docs/demo-dashboard.yaml`][demo-dashboard.yaml] got several new sections worth
a look:

- **"Error / edge-case states"** — what the card looks like when things go
  wrong: an entity that's `unavailable`, one that's `unknown`, one that doesn't
  exist at all, and a request for an attribute the entity doesn't have. Useful
  to check before reporting something as a bug — it might just be one of these.
- **"Compare with tile"** — the same entity shown with this card side-by-side
  with Home Assistant's own built-in Tile card, across several kinds of entities
  (fan, battery, cover, light, timer, counter), so you can see how the two
  compare at a glance.
- **"custom_theme — use cases"** — color-only zones, color + a per-zone icon
  override, and a full negative/positive range (shown standalone, then with
  `center_zero` at two different zero points), right next to the built-in theme
  examples.

The "Energy (consumption vs production)" example also got a fix: its "Net" bar
now shows the actual balance (production minus consumption) as a single value,
instead of showing both raw numbers stacked on top of each other, which never
actually matched what "Net" was supposed to mean.

Almost every section across the whole dashboard now starts with a small YAML
snippet showing the config it's demonstrating, plus a short note on what changes
from one card to the next — meant to make the dashboard readable on its own, not
just clickable.

## What's new (1.6.1-rc2)

### ✨ New

- **`icon_animation` can now be triggered by a Jinja condition instead of entity
  state** — `{ effect, jinja }`, where `jinja` resolves to `true`/`false` and
  fully replaces the automatic entity-based detection. Covers cases like a plain
  numeric `sensor` with no active/inactive concept at all, which nothing in the
  automatic detection could ever match. See
  [`icon_animation`](docs/configuration.md#icon_animation).  
  ➡️ [Enhancement]: template/condition to trigger the icon animation directly
  #125 (@FoxP)
- **The refresh rate of an active timer's countdown is now driven by what's
  actually displayed, and self-corrects against real time instead of drifting.**
  Standard cards/badges/features refresh every second when `unit` shows seconds
  (`s`/`timer`/`flextimer`), once a minute otherwise (`min`/`h`/ `d`/natural
  format) — replacing the old fixed duration-based formula. Template cards get
  this once-a-minute refresh for free from Home Assistant's own push (no extra
  subscriptions); a new `fast_refresh: true` opts into a forced once-a-second
  refresh for a real ticking `MM:SS` countdown, at a real cost (see
  [`fast_refresh`](docs/configuration.md#fast_refresh)) — not tied to `entity`
  being a `timer`, any `now()`-driven countdown benefits the same way (e.g. a
  sunrise/sunset countdown against `sun.sun`). Every tick, standard or template,
  now lands on a round second/minute boundary and re-aligns itself on every
  cycle, instead of drifting from whatever moment the card happened to load.
  Each tick also does only the minimal work its own display actually needs (the
  bar + value for cards/badges, the bar alone for Tile features, a forced Jinja
  resubscribe for templates) instead of the full
  icon/badge/shape/trend/Jinja-processing pipeline - lighter, and less prone to
  per-tick timing jitter from that pipeline's own variable cost. The bar-only
  part is shared by every card type (defined once, not duplicated per type)
  since it's the one thing a ticking timer always needs to repaint, regardless
  of what else a given card type shows on top. The countdown text itself now
  writes to the DOM immediately instead of through the usual RAF batching (new
  `DOMHelper.setTextNow`, mirroring the existing `setStyleNow`) - a RAF callback
  runs at the next display frame, whose cadence isn't aligned to our
  wall-clock-second scheduling, so batching it reintroduced up to a frame's
  worth of per-tick unevenness on the one thing a ticking countdown makes
  visible (a discrete text jump, unlike the bar's own width change, which
  already glides on its CSS transition regardless of paint timing).
- **Timer/duration seconds were rounded instead of truncated
  (`NumberFormatter.formatTiming`), unlike the hours/minutes next to them, which
  already floored.** A timer at 332.847s truly elapsed floored to minute 5 but
  rounded its seconds to "33", showing `05:33` up to ~500ms before the 33rd
  second had actually passed - a real-value discrepancy against any reference
  that floors (e.g. HA's own Tile), not a timing/jitter issue like the fixes
  above. Seconds now floor the same way hours/minutes do.

### 🐛 Fixes

- **`bar_size: xlarge` (or `bar_position: below`) with the icon hidden got
  squeezed into a single grid row instead of the extra row that size/position
  needs**, cutting the bar off. A 1.6.0 regression - hiding the icon and needing
  an extra row for a large bar were wrongly treated as mutually exclusive
  instead of composing. Fixed for Home Assistant's own Sections grid, and also
  for everywhere else the card can be placed (Masonry, embedded in another
  card) - that fallback sizing had a second, independent copy of the same
  row-count logic (a hardcoded "always 1 row (horizontal) / always 2 rows
  (vertical)"), so the identical squeeze could still happen there even after the
  Sections-only fix, just never reported. Both now read the same row count from
  one place.  
  ➡️ [Bug]: Card not rendering correctly with xlarge bar and icon hidden #133
  (@Ascathon)
- **`bar_size: xsmall` wasn't treated the same as `small` in the card's
  height/grid-row calculation**, even though it's the smaller of the two - a
  vertical card with `bar_size: xsmall` still reserved the extra row meant for
  medium/large/xlarge bars, unlike `small`, which never needed it.
- **`alert_when` with `animation: ping` and `highlight: background` silently
  degraded to `static`** instead of ringing. `ping` animates a `box-shadow`
  around the whole card, independent of `highlight`'s border-color/
  background-color - the two combine fine, the fallback was based on a wrong
  assumption that no matching CSS rule existed.
- **`bar_color_mode: segment`/`rainbow` collapsed to a single flat color with a
  theme whose zones are real-world values instead of `%` (`temperature`, `voc`,
  `pm25`…), or with `custom_theme`, unless `max_value` happened to already match
  the theme's own scale.** Each zone boundary is projected onto the
  `min_value`/`max_value` window to paint the bar - left at the flat `100`
  default while the theme's zones went into the thousands (`voc`), every zone
  past the first got clamped to zero width and filtered out, leaving one color
  for the whole bar. `max_value` now defaults to the active theme's (or
  `custom_theme`'s) own highest zone bound instead of `100` whenever it's left
  unset, so the fill and the color zones share one coherent scale out of the
  box - an explicit `max_value` always overrides this and is used as-is. See
  [`max_value`](docs/configuration.md#max_value).
- **Secondary info (unit/state text) stayed capped at its narrow bar-sharing
  width budget (45px–60%) with `bar_position: below`, `overlay` or
  `background`**, even though the bar renders elsewhere for those positions and
  isn't actually competing for room in that row. `top`/ `bottom` were already
  exempted from that cap; `below`/`overlay`/ `background` share the exact same
  "bar renders elsewhere" condition (see
  `StructureElements.createSecondaryInfo`) but were missing from the CSS rule
  that lifts it.
- **A Jinja-templated countdown (e.g. `secondary: {{ now() - ... }}`) driven by
  an active timer entity froze after a few seconds instead of ticking every
  second.** Home Assistant only pushes a fresh render for a `now()`/`utcnow()`
  template once a minute on its own, absent a state change on the tracked
  entity - the 1.6.0 rewrite removed an incidental resubscribe-on-every-hass-
  update that used to paper over this. Template cards/badges now force a fresh
  render on every tick while their `entity:` is an active timer, the same way
  standard cards already simulate a running timer's local tick.  
  ➡️ Reported alongside [Bug]: "Run" status not catched #127 (@annaoskarson)
- **Hiding `name` or `secondary_info` on a horizontal card left an empty gap
  where the hidden row used to be, instead of shrinking the card.** The content
  area's height was a fixed name+detail sum regardless of which rows were
  actually visible. Fixed for horizontal layout - vertical's ring-shaped bar
  still needs that reserved space, so it's unchanged for now. For a card
  embedded outside Home Assistant's own grid sizing (e.g. as a
  `custom:button-card` field), combine this with `height: auto` (an existing,
  previously-undocumented valid value) and `frameless: true` to get a card that
  shrinks fully to its content instead of stretching to fill the surrounding
  element. With the default `bar_position`, the bar itself shares that row with
  the secondary-info text rather than living in its own container - the first
  pass at this fix zeroed the row's height whenever `secondary_info` was hidden
  regardless, which starved the still-visible bar and shrank the name above it
  too (flex-shrink pulling from the wrong row). Now that height is only
  reclaimed when the row actually goes empty (bar elsewhere, or also hidden via
  `hide: [progress_bar]`).  
  ➡️ Follow-up to [Enhancement]: JINJA Should accept more STYLE tags #129
  (@emartoni)

### 🔧 Improvements

- **The `height` field in the visual editor now has a toggle to switch between
  the slider and a free-text value** (e.g. `auto`, `calc(...)`). Previously that
  mode only activated if the config already held a non-number+unit value (set
  through YAML) - there was no way to reach it from the visual editor alone.
- **`theme: humidity`'s ranges rebalanced.** The comfort zone (40–60%) is now
  one solid `green` band instead of a `green`/`teal` split that read as a
  washed-out green rather than a distinct color, and the remaining ranges now
  mirror symmetrically around it (10/10/10/20 on each side) instead of the old
  lopsided split - a 95% reading (mold/condensation risk) used to land on
  `deep-purple`, which doesn't read as "alert" the way a 15% reading's `red`
  does, understating the actual risk on the humid end. See
  [`theme: humidity`](docs/theme.md#humidity).
- **`bar_position: overlay`'s `name`/`secondary_info` text now keeps 10px of
  breathing room on the right edge**, matching the existing 7px it already had
  on the left, instead of running flush against the card's edge.

### 🧪 Try it: demo dashboard

[`docs/demo-dashboard.yaml`][demo-dashboard.yaml] got a full rebuild — a
comprehensive showroom covering essentially every option in this changelog
(themes, watermarks, `bar_effect`, `icon_animation`, `center_zero`, `bar_stack`,
aggregation, `card_mod`/UIX styling…) plus a regression-test view with one card
per statically-reproducible closed issue. Import it and move the helper sliders
to see everything react live. Two companion files ship alongside it:
[`docs/demo-dashboard-dev.yaml`][demo-dashboard-dev.yaml] (same dashboard,
targeting the `-dev` build for local testing) and
[`docs/demo-dashboard-helpers.yaml`][demo-dashboard-helpers.yaml] (all the demo
helper entities as a drop-in `homeassistant: packages:` file, instead of
creating them one by one).

---

## What's new (1.6.1-rc1)

### ✨ New

- **`entity-progress-multi-card` / `entity-progress-multi-feature`**: aggregate
  several progress bars — each a real, fully-featured bar (its own colors,
  state, more-info tap) — into a single card or a single Tile feature, instead
  of one bar per entity. See
  [Configuration Reference](docs/configuration.md#multi).
- **`bar_size: xsmall`**: a new, thinner bar size (6px) — mainly useful to fit
  more bars in a tight space, e.g. inside `entity-progress-multi-feature`. See
  [`bar_size`](docs/configuration.md#bar_size).
- **Jinja-rendered `name`/`secondary`/`custom_info` now accept more inline
  styles**: `font-size`, `font-weight`, `text-align`, `width`, `display`,
  `position` and `z-index`, on top of the existing `color`/`background-color` —
  enough to build simple multi-column layouts directly in a template.  
  ➡️ [Enhancement]: JINJA Should accept more STYLE tags #129 (@emartoni)

### 🐛 Fixes

- **The card could fail to load entirely on older/embedded browsers** (e.g.
  Chromium-based kiosk panels), even though it worked fine on 1.5.x. The 1.6.0
  build pipeline could emit ES2022-only syntax that these engines can't even
  parse - the whole module failed silently, showing an error card instead of the
  progress bar. The build now targets ES2021 (matching what 1.5.x actually
  required), and a new release-time check (`npm run check:es-target`) catches
  this class of regression before it ever ships again.  
  ➡️ [Browser Support]: chromium 92.0.4515.98 / After upgrade to 1.6.0 it
  stopped working on chromium #128 (@Slomo5)
- **`name: { type: device }` ignored a renamed device.** It only read the
  device's original/manufacturer name, never the name you set yourself in
  Settings → Devices → rename (`name_by_user`) — now it follows the same
  precedence Home Assistant's own UI uses.  
  ➡️ [Bug]: Friendly name is not used #130 (@zkurzyns)

---

## 1.6.0

The biggest release yet for the Entity Progress Card: it now lives **inside Tile
cards**, taps feel native, the bar can be **styled straight from your theme**,
and there's a whole set of new coloring, layout and alerting options — plus more
built-in themes and eleven new languages. Almost all of it can be set up
straight from the visual editor.

### ⭐ Highlights

#### 🧩 Put a progress bar inside a Tile card

The card now works as a native **Tile feature**: add it to any Tile card, or
anchor it to the top/bottom edge as a slim overlay. See [Card types].

➡️ [Feature]: Adding the progress bar as a feature in a card #95 (@Gunth)

#### 🖱️ Taps and gestures feel native

Tap, hold and double-tap now use Home Assistant's own gesture system — same
behavior as official cards, on every device.

#### 🎨 Style it from your theme

Friendly `--epb-*` style variables you can set from your theme or via `card_mod`
— no hacks needed. See the [Theme Guide].

#### 🌈 New bar coloring styles

With a theme active, choose how the bar is painted: distinct blocks (`segment`),
a smooth gradient (`rainbow`), or keep the current look (`auto`). Both `segment`
and `rainbow` now also pair with `center_zero`, theming each arm on its own half
of the range. See [bar_color_mode].

### 🧘 Breaking Changes (Don't Panic)

A few options have a new, clearer syntax. **Your dashboards keep working as they
are** — the card understands the old syntax and converts it on the fly. You'll
just see a gentle reminder in the browser console; update your YAML whenever you
feel like it.

- `max_value: <entity id>` / `max_value_attribute` → folded into [max_value]
- `disable_unit` → folded into [hide]
- `additions` → renamed to [bar_stack]

Prefer not to wait? Open the editor and a **Migrate config** button rewrites
your YAML for you. See [Deprecated Options].

### 🚀 New Features

#### 🔋 Battery-style segmented bar

Display the bar as separate blocks — like battery cells or signal bars. See
[bar_segments].

#### 📊 Bar stack: combine several entities in one bar

`bar_stack` (formerly `additions`) combines several entities into one bar, with
three modes, per-entity colors, and `center_zero` support. See [bar_stack].

#### 🌀 Animated icons

Eight styles are now available (`spin`, `pulse`, `bounce`, `shake`, `ping`,
`reveal`, `washing_machine`, `battery_charging`). Most are active-state only,
but `washing_machine` and `battery_charging` also auto-detect a same-device
entity when `entity` itself doesn't carry the signal — e.g. Tesla Fleet's
separate `sensor.<car>_charging_state`, or a Home Connect/Miele appliance where
`entity` is the progress % and the running state lives on another sensor.
`battery_charging`'s fill sweep even self-adjusts when the shown icon is a
`battery-charging*`/`battery-bluetooth*` MDI variant, so it lines up with that
icon's own glyph instead of assuming a plain `mdi:battery`. See
[icon_animation]. Displaying a real progress percentage for these appliances
(Home Connect, Miele) has its own recipe under [max_value].

#### 🎨 More built-in themes

Beyond the existing presets, 1.6.0 adds a family of **generic threshold themes**
— `critical_when_low`, `critical_when_high`, `critical_when_extreme` — for
anything where only the low end, the high end, or both extremes are a problem
(battery / free disk space, CPU/RAM usage, tank levels, deviation from a
setpoint…). There's also a **virtual `battery_adaptive` theme** that switches on
its own between `critical_when_extreme` while charging (li-ion batteries age
faster held at 100%, so the safe zone is the 30–70% middle) and
`critical_when_low` once unplugged — reusing the same charging detection
`icon_animation: battery_charging` relies on, with no extra entity to configure.
And a new `light` theme rounds things out, with its own palette and a lightbulb
icon that brightens as the value climbs. See the [Theme Guide].

#### 🚨 Get alerted at a glance

Have the card call for attention when a value crosses a limit — a pulsing border
or a tinted background, in the color of your choice, with a `static` / `blink` /
`ping` animation. The threshold itself can be a fixed number, another entity, or
a template. See [alert_when].

➡️ alert_when Function #120 (@AndyDann)

#### 📉 Dynamic min & max

The bar's range no longer has to be fixed numbers: min and max can each follow
another entity or a template. See [min_value] / [max_value].

#### 🎯 Center the bar on any value

`center_zero` can now center the bar on a nominal value other than 0, and
display the deviation as a percentage. See [center_zero].

➡️ [Feature]: Add a possibility to set a zero value #115 (@aremishevsky)

#### 💧 Simpler watermarks

Set `low`/`high` thresholds directly in the sensor's own unit, follow a template
like min/max, or point them at another entity — using the same
`{ entity, attribute }` shape as `min_value`/`max_value`, rather than a bare
entity id paired with a separate attribute key. See [watermark].

➡️ [Enhancement]: Support number entities for watermark low/high values #111
(@Gunth, @GauthierDumont)

#### 📈 Logarithmic bar scale

`bar_scale: log` maps the value to the bar's width on a log scale instead of
linear, for sensors spanning several orders of magnitude. See [bar_scale].

#### 🫥 Hide elements dynamically

`hide` now also accepts a template, so parts of the card can appear and
disappear based on conditions. See [hide].

➡️ [Feature]: Allow dynamically hiding/showing the progress bar #112 (amaurylam)

#### 📐 Better layouts

- Overlay mode (text on the bar) looks much better, especially on vertical
  cards.
- New `background` position: the bar fills the whole card.
- The card automatically matches your theme's corner roundness.

#### 📝 Two-line secondary info

Add `multiline: true` and insert a `<br>` in `custom_info` (or `secondary` on
Template cards) to split it across two lines instead of one — name and progress
bar layout stay untouched. See [multiline].

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

Import [`docs/demo-dashboard.yaml`][demo-dashboard.yaml] and move the sliders to
see the features live.

### ♿ Accessibility

The card now exposes its progress bar using proper ARIA attributes, while
decorative elements are hidden from assistive technologies. Screen readers can
navigate directly to the card and announce progress values correctly.

### 🌐 New Languages

This release adds eleven new languages: ca, es-419, et, hu, lt, lv, pt-BR, sk,
sl, zh-Hans, and zh-Hant — contributions welcome!

### 🛡️ Fixes

Compatible with Home Assistant 2026.2+. The notable fixes over 1.5.2:

- No more crashes with unusual entities (template sensors without an ID, timers
  restoring after a Home Assistant restart, sensors with odd units, timers
  longer than 24 h…) — the card shows a clear message instead of a red error
  screen.
- Tapping a card no longer fires its action twice after navigating between
  views.
- Badge icon and color no longer flicker during state changes.
- A `fan` on a dynamic preset (e.g. `auto`) showed the same grey color as a
  stopped fan — the default color now follows the entity's actual state instead
  of its percentage attribute, which a fan can report as `0` while genuinely on.
- Trend arrows no longer get stuck on template cards.
- A timer card with a watermark configured used to freeze entirely, the bar
  never updating — the combination now works.
- `center_zero` with no `min_value` set used to leave the negative half with no
  range at all — nothing could ever show there. It now defaults `min_value` to
  `-max_value` automatically.  
  ➡️ [Bug]: wrong watermark positions in center_zero mode #114 (@aremishevsky)
- Ripple effect on template cards.  
  ➡️ [Bug]: Ripple effect for hover and tap animations doesn't work on the
  template card. #110 (@WarC0zes)
- Color mappings updated for the built-in themes.  
  ➡️ Merge pull request #116 (@vemboy200)
- The card respects your number format setting (e.g. Swiss format).
- Noticeably faster and lighter on dashboards with many cards.
- Text formatting from templates keeps working, but scripts can no longer be
  injected through entity names or media titles (see [Supported HTML]).
- Badge `min_width` given as a percentage no longer overflows and overlaps
  neighbouring badges — on a badge, `%` is now relative to the badge's default
  width (`120%` = 1.2× the normal size). Cards and templates keep the standard
  CSS `%`. (Existing badge `%` values change meaning — they rendered broken
  before.)  
  ➡️ [Bug]: Bug with minimum width #124 (@vemboy200)
- Changing a sensor's display precision now updates the card immediately,
  instead of only taking effect after a full browser reload.
- The card now loads correctly even when its resource is registered as a classic
  **"JavaScript"** type instead of **"JavaScript Module"**. That deprecated type
  could stop the card from loading and freeze pop-ups opened by browser_mod; the
  card is now safe either way, and prints a console warning when it detects the
  classic type so you can switch it to "JavaScript Module".  
  ➡️ [Bug]: freeze on webawesome / browser_mod pop-ups #108 (@LiMEntal)

### 🧹 Under the hood

- The redundant "(overlay)" hint was dropped from several option labels
  (`bar_orientation: up`, `bar_single_line`, `text_shadow`,
  `bar_position: top`/`bottom`) across all 39 languages — the editor already
  only shows them in the relevant context.
- **The editor gained two more panels** — "Markers & Alerts" (watermark +
  alert_when) and "Layout & Sizing" (frameless / marginless / height / min_width
  / layout) — carved out of "Look & Feel", which had grown to hold most of the
  card's options. Collapsing an unrelated panel now actually skips re-evaluating
  its fields on every keystroke, instead of the whole editor re-walking every
  field regardless of which panel is open — noticeably snappier on large
  configs.
- **The single-file `entity-progress-card.js` monolith is gone.** The card is
  now built from a proper module tree under `src/` (`utils` / `card` / `editor`)
  and assembled by `scripts/build.js` (esbuild bundle + CSS-in-JS minification)
  into the same shipped output — no behavior change intended; card/badge/feature
  registration and the console banner are unchanged.
- **`src/` is now TypeScript**, which caught a handful of latent bugs at compile
  time before they could ever ship.
- **The release process is sturdier**: a `build:prod` mode that forces every
  dev/debug flag off regardless of source state (guarded by
  `npm run check:release-flags`), auto-formatting and linting on every commit
  (Prettier + a pre-commit hook), and HACS distribution served purely from the
  tagged release asset — the same pattern larger HACS plugins use.

Thanks to everyone who reported, tested and contributed 🙏

---

## What's new (1.6.0-rc4)

### 🐛 Fixes

- **`theme: temperature` had a false "yellow → green → yellow" artifact in
  `bar_color_mode: rainbow`**: the 16-20°C range alternated
  green/light-green/green, a repeat that only ever mattered for single-zone icon
  coloring but read as a visual reversal once several zones are shown together
  in a continuous gradient. Zones simplified and rebalanced (symmetric around
  the 0°C freezing point, 9 zones instead of 13).
- **`bar_color_mode: rainbow` washed out wide zones almost instantly** instead
  of showing their real color for any visible stretch - each zone's color now
  peaks at its own midpoint instead of only at its starting edge, so e.g. a
  40-point-wide green band actually looks green in its middle instead of fading
  toward the next color from the first pixel.
- Card-picker preview (`getStubConfig`'s `getStubEntity`) could throw if
  `hass.states` wasn't populated yet when HA builds the "Add Card" gallery - now
  falls back safely instead of a synchronous exception.
- `HassProviderSingleton.getSameDeviceEntities` had a narrow missing-optional-
  chain gap (distinct from the one already fixed in rc3) that could throw if
  `hass.entities` itself was momentarily unavailable.
- `icon_animation: battery_charging`'s shifted-icon detection was too loose
  (`/charging|bluetooth/i` matched the substring anywhere) - tightened to
  `-charging-` as its own segment and `-bluetooth` only at the end of the icon
  name, matching the actual MDI variants that need the fill-wipe compensation.
- `icon_animation: battery_charging`'s fill-wipe alignment on
  `battery-charging-*`/`battery-bluetooth-*` icon variants recalibrated - a new
  `--epb-charge-y1` CSS var (alongside the existing x1/x2) lets the vertical
  position be tuned independently, not just horizontal.
- Editor: `center_zero` (and `center_zero_value`/`center_zero_growth_percent`)
  no longer disappears once a non-`auto` `bar_color_mode` is selected - see the
  new center_zero + themed gradient support below.
- Template card/badge: updating the watermark from a Jinja push called the
  view's `refresh()` with no `hass` argument, silently skipping the hass-side
  half of that refresh instead of actually updating it.
- A themed watermark's type/disable flags were read from two separate,
  uncorrelated checks (`hasWatermark` then a second `watermark` lookup) -
  consolidated into one read so the two can't disagree.

### ✨ New

- **`bar_color_mode: segment`/`rainbow` now works together with `center_zero`**
  (previously mutually exclusive): each arm gets its own themed gradient, scoped
  to its own half of the `min_value`/`max_value` range.
- **Three new generic themes**: `critical_when_low`, `critical_when_high`,
  `critical_when_extreme` - for anything where only the low end, the high end,
  or both extremes are a problem (battery/free disk space, CPU/RAM usage, tank
  levels, deviation from a setpoint...), as opposed to
  `optimal_when_low`/`optimal_when_high`'s evenly-split bands.
- **New virtual theme `battery_adaptive`**: automatically switches between
  `critical_when_extreme` while charging (li-ion batteries age faster held at
  100%, so the safe zone is the 30-70% middle rather than the top) and
  `critical_when_low` once unplugged (only running out matters then) - reuses
  the same charging-state detection `icon_animation: battery_charging` already
  relies on, no extra entity to configure.

### 🧹 Under the hood

- `getStubConfig`/`getCardSize` are now `async`, matching the official
  `custom-card-helpers` `LovelaceCard` interface contract
  (`getCardSize(): number | Promise<number>`) - any future exception here
  becomes an isolated rejected promise instead of a synchronous throw that could
  interrupt HA's own iteration over every registered card type.
- `customElements.define()` calls (main registration plus several editor
  sub-components) now go through one shared, try/catch-protected
  `defineElement()` helper instead of some call sites being guarded and others
  not.
- Battery-charging detection (`isBatteryCharging`) is now computed once per
  refresh - only for cards actually using `icon_animation: battery_charging` or
  `theme: battery_adaptive` - instead of live on every access, which could
  repeat the same same-device entity scan up to 3x per `hass` update.
- The `Hass` type (`utils/hass-provider.ts`) renamed to `HomeAssistant` and
  given a real structural shape (`states`/`entities`/`devices`/`areas`/
  `floors`/`config`/`locale`/`connection`, still permissive via a trailing
  `& Record<string, any>`) instead of a fully opaque blob - caught and fixed
  several missing-optional-chaining bugs immediately once TypeScript could
  actually check field access against it.
- `EntityState` (`hass.states[entityId]`) given the same treatment: a typed
  envelope (`entity_id`/`state`/`last_changed`/`last_updated`/`context`) around
  `attributes`, left as `Record<string, any>` since it genuinely varies per
  domain - the same split Home Assistant's own websocket client uses internally
  (`HassEntityBase` + untyped `attributes`).
- `_cardView` (the base card/badge/feature classes' reference to their own view
  instance) was typed `any` throughout `core.ts`/`cards.ts`, deliberately (some
  concrete views extend `ViewBase`, others extend `ViewCore` directly, so no
  single non-`any` type used to cover every one of them). Now typed as
  `ViewCore` at the shared base with each concrete subclass narrowing it further
  (`ViewBase`, or the new `TemplateView` type for the two template views) -
  surfaced the two bugs above, plus a `Config`/`LovelaceConfig` mismatch in the
  Jinja-number callbacks.
- `RawConfig` renamed to `LovelaceConfig` - matching `custom-card-helpers`' own
  `LovelaceCardConfig` (what `setConfig()` actually receives) rather than a name
  that didn't say what it was raw _from_.
- **The two largest source files were split into focused modules** with no
  change at any import site: `card/value-helpers.ts` (~1770 lines) and
  `utils/parameters.ts` (~980) each became a thin barrel that re-exports from
  per-responsibility siblings (formatting / value primitives / progress math /
  theme manager / entity helpers…, and meta / HA context / card config /
  themes). Verified behavior-neutral - the `value-helpers` split produces a
  byte-identical production bundle. `EPB_DIAG` likewise moved out to its own
  `utils/diagnostic.ts`.

### 🔧 Dev / debug tooling (URL-driven)

- **`dev` and `debug` are now read from the served URL** instead of being edited
  into the source and rebuilt: a `…_dev.js` filename (or `?dev`) enables dev
  mode, and `?debug=area1,area2` turns on per-area console logging at runtime.
  Eight debug areas, including three new probes aimed at issue #108
  (`registration`, `instances`, `interference`) and two previously-dead ones now
  wired (`editor`, `interactionHandler`). A console warning is printed whenever
  a non-shipped configuration is active; normal prod loads stay quiet.
  - Users: how to turn on logging to diagnose an issue →
    [troubleshooting.md](troubleshooting.md#-enable-debug-logging-debug).
  - Maintainers: the full mechanism, all areas, and how to add one →
    [development.md](development.md#logging--debugging).
- **New `?noRegistration` diagnostic mode**: loads the whole module (banner,
  `EPB_DIAG`) but defines zero custom elements and registers nothing with HA — a
  clean A/B for issue #108 (freeze gone with the module inert ⇒ our
  registration; freeze persists ⇒ the mere bundle load). It also fires
  `EPB_DIAG.dump()` automatically right after the banner, since nothing renders
  to prompt for it.
- **Dev builds are now fully isolated from a co-installed prod build**: the
  seven editor sub-components (chips, list editors) were the last elements still
  registering under un-suffixed names, so a `…_dev.js` loaded next to the
  shipped file silently reused prod's copies. They now take the same `-dev`
  suffix as every other element, so dev and prod never share a live class.
- `EPB_DIAG.dump()`'s constructed-CSS line now probes the browser's real
  capability (`supported, none built yet` vs a genuine legacy fallback) instead
  of misreading "no card rendered yet" as a per-card fallback.

---

## What's new (1.6.0-rc3)

### 🐛 Fixes

- Editor: the `hide` chips control let Template/Badge Template select `Unit` — a
  choice their schema always rejected (silently dropped on save, the same "looks
  configurable, silently ignored" trap as elsewhere). Removed for those two.
- Editor: `bar_size` was still offered when `bar_position` is `top`/`bottom`/
  `overlay`/`background` — all four override the bar's thickness themselves, so
  the option had no effect there. Hidden in that case; `bar_color` now takes the
  freed-up width instead of sitting half-empty.
- `bar_max_width` only ever worked with `layout: horizontal` +
  `bar_position: default` + `bar_size` other than `xlarge` — now enforced at the
  config level (cleared automatically outside that combination, not just hidden
  in the editor), so a hand-written YAML config can't end up with a
  silently-ignored value either. See [bar_max_width].
- `bar_orientation: up` now only appears as a choice in the two combinations
  where it actually does anything (`layout: vertical` + `bar_position: overlay`,
  or `bar_position: background` with either layout) — and resets to `ltr`
  automatically if a config drifts outside that. See [bar_orientation].
- `text_shadow` now also applies with `bar_position: background` (previously
  `overlay` only). See [text_shadow].
- `bar_color_mode` (`segment`/`rainbow`) and `interpolate` silently did nothing
  without an active theme (or with `center_zero` on) — both are now cleared
  automatically instead of quietly having no effect. See [bar_color_mode] /
  [interpolate].
- `reverse_secondary_info_row` is now actually functional on Badge and Badge
  Template — a strict equality check meant it could never match their config
  shape, making the option permanently inert there despite validating fine.
- Custom theme editor: adding a new zone was effectively impossible — the row
  vanished the instant you started filling it in, before `min`/`max` were both
  set, because the editor re-read the already-validated (and therefore
  incomplete-zone-stripped) config on every keystroke instead of what you'd
  actually typed.
- `bar_color_mode: segment`/`rainbow` and `bar_stack` color gradients always
  painted left-to-right, even when the bar itself fills bottom-to-top
  (`bar_orientation: up` with `bar_position: overlay` or `background`) — the
  gradient direction now follows the bar's actual fill direction.
- **The fallback icon for an unresolvable entity never rendered.** It was
  reading `HA_CONTEXT.helpCircleOutline` instead of the actual
  `HA_CONTEXT.icons.helpCircleOutline` path, so the "unknown entity" placeholder
  silently ended up with no icon at all. Found by the TypeScript conversion
  below — the wrong path doesn't exist on the real shape, so the compiler
  flagged it immediately.
- Two defensive gaps in `HassProviderSingleton` (`getSameDeviceEntities`,
  `language`) could throw if called in the narrow window before `hass` is ever
  set — both now short-circuit the same way every other accessor here already
  does. Same discovery route as above.
- **Custom theme editor: reopening a card with an incomplete zone (`min` set,
  `max` never filled in) showed `theme_mode` stuck on "Preset"** even though the
  zone list was right there and visible. The schema drops an all-invalid-zones
  `custom_theme` entirely on validation, and the mode chip's very first render
  read the validated config instead of the saved YAML — so it disagreed with the
  zone list (which reads the YAML directly) until the next edit silently fixed
  it. Now reads the same source the zone list always did.
- **`watermark.low`/`watermark.high`'s entity form is now symmetric with
  `min_value`/`max_value`**: `{ entity: ..., attribute: ... }` instead of a bare
  entity-id string paired with a separate `low_attribute`/`high_attribute` key —
  the same explicit-shape reasoning `max_value` already had. The earlier RC form
  is auto-migrated for this session with a console warning. See [watermark].
- **A Jinja-driven watermark or `alert_when` threshold could make the whole card
  falsely report itself unavailable**, hiding the bar entirely — the
  availability check treated any non-entity form (including `{ jinja: ... }`)
  the same as a broken entity reference.
- Editor: `icon_animation` no longer offers `None` as an explicit, oddly
  unlabeled choice in the dropdown - clearing the field (its native selector is
  not required) does the same thing `None` used to.
- **`bar_segments` grid lines could clip through watermark markers, drift out of
  phase with the fill the more segments separated them from the start, and land
  visibly off-center on their own boundary** - the underlying rendering was
  rebuilt around a single, untransformed overlay so the lines stay anchored to
  the bar regardless of the current value, with sizing that scales with
  `bar_size` and is centered precisely on each boundary.

### ✨ New

- **`alert_when.above`/`alert_when.below` can now come from an entity or a Jinja
  template**, not just a fixed number: `{ entity: ..., attribute: ... }` or
  `{ jinja: ... }`, same explicit shape as `min_value`/`max_value`/
  `watermark.low`/`watermark.high`. Existing fixed-number configs keep working
  unchanged. See [alert_when].

### 🧹 Under the hood

- Removed the redundant "(overlay)" hint from several option labels
  (`bar_orientation: up`, `bar_single_line`, `text_shadow`,
  `bar_position: top`/`bottom`) across all 39 languages — the editor already
  only shows them in the relevant context.
- **Editor split into two more panels**: "Markers & Alerts" (watermark +
  alert_when) and "Layout & Sizing" (frameless/marginless/height/min_width/
  layout), both pulled out of "Look & Feel" - which had grown to hold most of
  the card's options. Collapsing an unrelated panel now actually skips
  re-evaluating its fields on every keystroke elsewhere in the form, instead of
  the whole editor re-walking every field regardless of which panel is open.
- A Jinja push to `alert_when`/`min_value`/`max_value`/`watermark` now only
  recomputes the part of the render pipeline it can actually affect (the bar,
  the value label, or the alert's own classes) instead of the full pipeline
  every time.
- `will-change: box-shadow` added to the alert/icon "ping" animations - a ring
  burst that size isn't a compositor-only effect, so this hints the browser to
  isolate the repaint cost up front instead of discovering it on the first
  animated frame.
- **The single-file `entity-progress-card.js` monolith is gone.** The card is
  now developed as a proper module tree under `src/` (`utils`/`card`/`editor`)
  and assembled by `scripts/build.js` (esbuild bundle + CSS-in-JS minification)
  into the same shipped output — no behavior change intended, card/badge/feature
  registration and the console banner are unchanged. Two build modes:
  `build:test` (dev mode, as committed) and `build:prod` (forces dev/debug flags
  off regardless of source state — see `npm run check:release-flags` and
  `scripts/lib/release-flags.js`).
- **HACS distribution changed accordingly**: `hacs.json` no longer declares
  `content_in_root` — there's nothing to serve at the repo root anymore. Tagged
  installs are unaffected (already served from the release asset `release.yaml`
  uploads); this only removes the now-nonexistent default-branch-tracking
  fallback. Same pattern other HACS plugins use (e.g. Mushroom: `src/` +
  release-only, no root file).
- **Class documentation standardized** across all of `src/` to plain JSDoc:
  dropped the old banner-style headers that just repeated the class name, the
  redundant `@class`/`@description` tags, and decorative emoji prefixes. Several
  docblocks left orphaned by the split (describing a class defined in a
  different file than the one they ended up in) were relocated to the right
  place.
- **Two long-standing ESLint complexity warnings fixed** (`schema.js`'s config
  `postProcess`, `factory.js`'s `theme()` field builder) by extracting each
  independent rule/section into its own small named function — same behavior,
  `eslint` now reports 0 warnings.
- **Linting hardened**: `eqeqeq` (smart — bans `==`/`!=` except the `x == null`
  idiom), `no-console` (only the few deliberate uses allowed), strict blank
  lines between every class member, and `eslint-plugin-import-x`'s `no-cycle`
  (no circular imports today; now guarded going forward as `src/` grows).
- **Prettier now formats the JS source too**, not just Markdown — and a
  pre-commit hook (`husky` + `lint-staged`) auto-formats/lints staged files on
  every commit, so this stays consistent without anyone having to remember to
  run it.
- `docs/contributing.md` clarified: comment guidance now matches the project's
  actual terse-comments convention (was previously telling contributors the
  opposite), and the translations section explicitly separates "new language"
  from "fixing an existing one" with a no-coding- required note for
  translation-only contributors.
- **`src/` is now TypeScript** (22 of 23 files; `utils/translations.js` stays
  plain JS — it's generated data with no logic). Mixed `.ts`/`.js` via
  `tsconfig.json`'s `allowJs` and esbuild's native resolution, no separate
  compile step; `npm run type-check` (`tsc`) is wired into `npm run validate`.
  Every conversion was checked against its pre-conversion behavior — the
  data-heavy files and the runtime view/card classes were verified
  byte-identical or behaviorally identical via bundled A/B comparisons, not just
  "it still builds". A handful of small "phantom brand" types (`Hass`/
  `EntityState` in `utils/hass-provider.ts`; `RawConfig`/`Config`/`FieldDef` in
  the new `utils/types.ts` — `RawConfig` being the as-saved YAML, `Config` the
  post-schema-validated one) catch an argument-order mixup between adjacent
  same-shaped bags at compile time without forcing a full interface onto
  genuinely dynamic runtime shapes - which is exactly what surfaced the
  `theme_mode` bug above (`editor/base.ts` was quietly passing the wrong one of
  the two into a field's initial-value resolver).

---

## What's new (1.6.0-rc2)

### 🐛 Fixes

- **Tile Feature: timer progress bar was frozen.** A running `timer` entity
  doesn't push a new state every second — the standard card already simulated
  that tick locally, the Feature never did. Fixed.  
  ➡️ [Bug]: two issues with the timer feature #95 (@GauthierDumont)
- **Tile Feature: a sibling feature (e.g. a native `fan-speed` control) could
  disappear** after navigating away and back. Root cause: the overlay
  (`top`/`bottom`) row-size correction was computed once and frozen forever,
  silently clamping any later legitimate growth in a sibling feature's own
  space. It's now recomputed live against HA's own value each time.  
  ➡️ [Bug]: `fan-speed` disappearing with `bar_position: bottom` #95 (@Gunth)
- **Tile Feature: `bar_size: small` looked lost** in a fixed-height row.
  Feature's row height no longer scales with `bar_size` (HA's own
  `--feature-height`), and the default is now `xlarge` to match.  
  ➡️ #95 (@GauthierDumont, @Gunth)
- **Template card: `percent` above 100% (or below -100% with `center_zero`)
  rendered with an empty gap on one side** instead of a full bar — a regression
  from the switch to a GPU-friendly transform-based fill. Clamped, same as the
  standard card already was. ➡️ [Bug]: Progress bar renders incorrectly when
  percent exceeds 100% #121 (@Gunth)
- **Timer entities: watermark could cover the whole bar while idle**, or jump
  position when the timer started. An idle timer's placeholder range collapsed
  to `[0, 0.1]` instead of `[0, 100]`; separately, a raw watermark value doesn't
  mean anything stable against a timer's own duration (it changes every run) —
  `auto` now behaves like `percent` for timers, so the position stays put
  regardless of state or run length.
- Fixed a case where `bar_size: xlarge` on a Feature could silently force an
  invalid `bar_position: 'below'` into the config.
- Editor: `bar_size`, `bar_segments` were incorrectly hidden for Badge/Badge
  Template despite being fully supported; `bar_scale` was incorrectly shown for
  Template/Badge Template despite having no effect there (the same "looks
  configurable, silently ignored" trap as `min_value`/`max_value` on a template
  card).
- Editor: the watermark section was entirely missing for Template/Badge
  Template, even though the schema has always supported it identically to the
  standard card.  
  ➡️ [Enhancement]: Support number entities for watermark low/high values #111
  (@Gunth, @GauthierDumont)

### ✨ New

- `alert_when.animation`: `static` / `blink` / `ping`, on top of the existing
  `highlight: border/background`. See [alert_when].  
  ➡️ alert_when Function #120 (@AndyDann)

### 🧹 Under the hood

- Card/Template height in a Sections dashboard now follows HA's own
  `--ha-section-grid-row-height` live instead of a hardcoded copy.
- `getGridOptions()` (the current HA sizing API) implemented natively, alongside
  the legacy `getLayoutOptions()` kept for HA < 2024.11.
- A handful of dead CSS variables and a leftover commented-out code block
  removed.

---

## What's new (1.6.0-rc1)

This update is a major evolution for the Entity Progress Card: deeper Home
Assistant integration, a faster rendering engine, and a brand-new CSS API for
effortless styling. Everything below can be set up from the visual editor.

### ⭐ Highlights

#### 🧩 Put a progress bar inside a Tile card

The card now works as a native **Tile feature**: add it to any Tile card, or
anchor it to the top/bottom edge as a slim overlay. See [Card types].

➡️ [Feature]: Adding the progress bar as a feature in a card #95 (@Gunth)

#### 🖱️ Taps and gestures feel native

Tap, hold and double-tap now use Home Assistant's own gesture system — same
behavior as official cards, on every device.

#### 🎨 Style it from your theme

Friendly `--epb-*` style variables you can set from your theme or via `card_mod`
— no hacks needed. See the [Theme Guide].

#### 🌈 New bar coloring styles

With a theme active, choose how the bar is painted: distinct blocks (`segment`),
a smooth gradient (`rainbow`), or keep the current look (`auto`). See
[bar_color_mode].

### 🧘 Breaking Changes (Don't Panic)

A few options have a new, clearer syntax. **Your dashboards keep working as they
are** — the card understands the old syntax and converts it on the fly. You'll
just see a gentle reminder in the browser console; update your YAML whenever you
feel like it.

- `max_value: <entity id>` / `max_value_attribute` → folded into [max_value]
- `disable_unit` → folded into [hide]
- `additions` → renamed to [bar_stack]

Prefer not to wait? Open the editor and a **Migrate config** button rewrites
your YAML for you. See [Deprecated Options].

### 🚀 New Features

#### 🔋 Battery-style segmented bar

Display the bar as separate blocks — like battery cells or signal bars. See
[bar_segments].

#### 📊 Bar stack: combine several entities in one bar

`bar_stack` (formerly `additions`) combines several entities into one bar, with
three modes, per-entity colors, and `center_zero` support. See [bar_stack].

#### 🌀 Animated icons

8 styles now available (`spin`, `pulse`, `bounce`, `shake`, `ping`, `reveal`,
`washing_machine`, `battery_charging`) — most are active-state only, but
`washing_machine` and `battery_charging` also auto-detect a same-device entity
when `entity` itself doesn't carry the signal (e.g. Tesla Fleet's separate
`sensor.<car>_charging_state`, or a Home Connect/Miele appliance where `entity`
is the progress % and the running state lives on another sensor).
`battery_charging`'s fill sweep also self-adjusts when the shown icon is a
`battery-charging*`/`battery-bluetooth*` MDI variant, so it lines up with that
icon's own glyph instead of assuming a plain `mdi:battery`. See
[icon_animation]. Displaying a real progress percentage for these appliances
(Home Connect, Miele) has its own recipe under [max_value].

#### 🚨 Get alerted at a glance

Have the card call for attention when a value crosses a limit — a pulsing border
or a tinted background, in the color of your choice. See [alert_when].

#### 📉 Dynamic min & max

The bar's range no longer has to be fixed numbers: min and max can each follow
another entity or a template. See [min_value] / [max_value].

#### 🎯 Center the bar on any value

`center_zero` can now center the bar on a nominal value other than 0, and
display the deviation as a percentage. See [center_zero].

➡️ [Feature]: Add a possibility to set a zero value #115 (@aremishevsky)

#### 💧 Simpler watermarks

Set `low`/`high` thresholds directly in the sensor's own unit, or follow a
template like min/max. See [watermark].

#### 📈 Logarithmic bar scale

`bar_scale: log` maps the value to the bar's width on a log scale instead of
linear, for sensors spanning several orders of magnitude. See [bar_scale].

#### 🫥 Hide elements dynamically

`hide` now also accepts a template, so parts of the card can appear and
disappear based on conditions. See [hide].

➡️ [Feature]: Allow dynamically hiding/showing the progress bar #112 (amaurylam)

#### 📐 Better layouts

- Overlay mode (text on the bar) looks much better, especially on vertical
  cards.
- New `background` position: the bar fills the whole card.
- The card automatically matches your theme's corner roundness.

#### 📝 Two-line secondary info

Add `multiline: true` and insert a `<br>` in `custom_info` (or `secondary` on
Template cards) to split it across two lines instead of one — name and progress
bar layout stay untouched. See [multiline].

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

Import [`docs/demo-dashboard.yaml`][demo-dashboard.yaml] and move the sliders to
see the features live.

### ♿ Accessibility

The card now exposes its progress bar using proper ARIA attributes, while
decorative elements are hidden from assistive technologies. Screen readers can
navigate directly to the card and announce progress values correctly.

### 🌐 New Languages

This release adds eleven new languages: ca, es-419, et, hu, lt, lv, pt-BR, sk,
sl, zh-Hans, and zh-Hant — contributions welcome!

### 🛡️ Fixes

Compatible with Home Assistant 2026.2+. Among the notable fixes:

- Fixed: No more crashes with unusual entities (template sensors without an ID,
  timers restoring after a Home Assistant restart, sensors with odd units,
  timers longer than 24 h…) — the card shows a clear message instead of a red
  error screen.
- Fixed: A tap could sometimes trigger an action twice after navigating between
  views
- Fixed: Badge icon and color no longer flicker during state changes.
- Fixed: A `fan` on a dynamic preset (e.g. `auto`) showed the same grey color as
  a stopped fan — the default color now follows the entity's actual state
  instead of its percentage attribute, which a fan can report as `0` while
  genuinely on.
- Fixed: Trend arrows no longer get stuck on template cards.
- Fixed: Watermarks are now placed correctly in `center_zero` and for
  `number`/`counter` entities.
- Fixed: A timer card with a watermark configured used to freeze entirely (the
  bar never updated); the combination now works.
- Fixed: A timer's watermark could land at the wrong spot, or cover the whole
  bar while the timer was idle. Timer watermarks are now a stable percentage,
  regardless of the entity's state or how long any given run actually lasts.
- Fixed: `center_zero` with no `min_value` set used to leave the negative half
  with no range at all (nothing could ever show there). It now defaults
  `min_value` to `-max_value` automatically.  
  ➡️ [Bug]: wrong watermark positions in center_zero mode #114 (@aremishevsky)
- Fixed: Ripple effect on template cards. ➡️ [Bug]: Ripple effect for hover and
  tap animations doesn't work on the template card. #110 (@WarC0zes)
- Color mappings updated for the built-in themes  
  ➡️ Merge pull request #116 (@vemboy200)
- The card respects your number format setting (e.g. Swiss format).
- Noticeably faster and lighter on dashboards with many cards.
- Text formatting from templates keeps working, but scripts can no longer be
  injected through entity names or media titles (see [Supported HTML]).

Thanks to everyone who reported, tested and contributed! 🙏

---

## 1.5.2

### What's new

A lot has changed under the hood — and on the surface. From a fully
WebAwesome-compatible editor to live watermarks, smoother animations, and
cleaner docs, this release makes the card feel right at home in any Home
Assistant setup.

I would have loved to include more features in this release, but the WebAwesome
migration forced me to prioritize and ship this update sooner than originally
planned.

#### 🧩 WebAwesome Compatibility

Starting with HA 2026.2.x, Home Assistant introduced significant changes as part
of the migration to Webawesome. With 2026.3.x, the select component in the
visual editor is broken — options can no longer be selected. **Cards/badges are
not affected by this Home Assistant update.** The visual editor has been updated
to use the latest Home Assistant UI components, fully compatible with the new
WebAwesome framework introduced in recent HA versions.

What this means for you:

- The editor now looks and feels consistent with the rest of Home Assistant's UI
- Fields respond correctly to your HA theme (light/dark mode, accent colors)
- Full compatibility with both the old and new HA frontend architecture

➡️ [Bug]: Cannot select a theme from the dropdown #109 (@Ascathon)

#### ⚡ Faster Tap Response

Immediate action on single tap ! Previously, every tap was delayed by 300ms to
wait for a potential double tap — even when no double_tap_action was configured.
This caused a noticeable lag when opening more-info or triggering any tap
action. The card now detects at startup whether a double tap action is
configured. If not, tap actions fire immediately with no delay, matching the
responsiveness of native HA cards.

#### ✨ Smoother Interactions

Better click & tap feedback: The card now uses Home Assistant's native ripple
effect for hover and tap animations.

The effect can be disabled with card_mod:

```yaml
card_mod:
  style: |
    ha-ripple {
      display: none;
    }
```

➡️ [Feature]: Make the hover effect configurable to be able to deactivate #102
(@RkcCorian, @WarC0zes)

#### 🎨 Smooth Color Transitions

New `interpolate` option for custom themes: When using a custom_theme, you can
now enable smooth color transitions between steps. Instead of jumping abruptly
from one color to the next, the icon and progress bar will gradually blend from
one color to the other as the value changes.

➡️ [Enhancement]: Smooth color interpolation between custom_theme ranges #96
(@diegocjorge)

#### ✨ New Bar Effects: shimmer_reverse and gradient_reverse

Two new visual effects are now available as companions to the existing `shimmer`
and `gradient` effects.

- `shimmer_reverse` — same shimmering animation as shimmer, but running in the
  opposite direction.
- `gradient_reverse` — same color gradient as gradient, but fading in the
  opposite direction.

These new effects are independent from `bar_orientation` — you can combine them
freely to achieve the exact visual result you want.

#### 💧 Dynamic Watermarks: Compare your entity against another sensor

Watermark values (low and high) can now be set to any HA entity instead of a
fixed number. This means you can, for example, display your indoor temperature
as a progress bar and mark the current outdoor temperature as a reference line —
updated live as conditions change.

```yaml
watermark:
  low: sensor.outside_temperature
  high: sensor.target_temperature
```

Optionally, you can read from a specific attribute:

```yaml
watermark:
  low: sensor.weather_station
  low_attribute: temperature
```

➡️ [Enhancement]: Make watermark accept a dynamically updating value. #62
(@YamanKoudmani)

#### 📏 Progress Bar Max Width (bar_max_width)

Control the width of your horizontal progress bars ! You can now cap that width
to keep bars more compact or visually balanced.

```yaml
type: custom:entity-progress-card
bar_max_width: 120px
```

➡️ Discord @RKT62

#### 🛠️ Other improvements

- Fix text ellipsis overflow

- Refactor bar effect

- Add Watermark and bar effect on vertical layout and style improvements

  ➡️ [Feature]: bar position #80 (@NfxGT)

- Clean space when a text slot is empty, better space management for the badges

  ➡️ [Bug]: Unable to have secondary info and progres bar at the same time in
  Template Badge #97 (@peyn)

  ➡️ [Bug]: Incorrect styling when secondary info hidden from badge #107
  (Ascathon)

- Better police management on overlay layout

  ➡️ [Bug]: When Bar_position is set to Overlay the overlaid text ends up fuzzy.
  #99 (@bengy70)

- Better card background color management to avoid issue with "glass" theme

  ➡️ [Feature]: Make the hover effect configurable to be able to deactivate #102
  (@RkcCorian)

- Better badge lifecycle management

  ➡️ [Bug]: Badge not cleared #103 (@tieskuh)

- Fix Temperature theme

  ➡️ [Bug]: Temperature theme not always applied #105 (@sgofferj)

- Fix `last_updated`/`state_content` informations

  ➡️ [Bug]: last_updated/last_changed is declared unknown in state_content #106
  (MatzeKitt)

- refactor badge styles

#### 🌍 Multilingual support: Easier to contribute

All translations have been moved to dedicated JSON files under
`./translations/`. If you'd like to add a new language or fix an existing
translation, you no longer need to touch any code — just edit or create a simple
JSON file and submit a pull request.

➡️ Want to help translate the card into your language? Check out the
`contributing.md` guide for instructions.

#### 💥 Breaking change

Some users reported fuzzy text in overlay mode caused by theme-related issues
(light/dark). In certain cases, the shadow was not helpful and could actually
degrade readability.

The text shadow now follows the light/dark theme and is **no longer applied by
default**, giving users full control over this visual effect.

To re-enable the text shadow, add the following to your YAML configuration:

```yaml
type: custom:entity-progress-card
...
bar_position: overlay
text_shadow: true
```

#### 📚 Documentation

- update documentation

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.5.1...1.5.2>

---

## 1.5.1

### What's new

This release is a quick patch based on user feedback. Version 1.5.0 brought
major improvements, and thanks to our testers’ hard work, most issues were
caught—but a few minor glitches still slipped through.

- Improved card styling for better integration with built-in Home Assistant
  cards.
- Fixed background, box-shadow, borders, padding, and margins for a cleaner
  look.
- Enhanced support for frameless and marginless cards.
- Prevented text overflow in top, bottom, and overlay sections.
- Minor visual tweaks for smoother display in various layouts.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.5.0...1.5.1>

---

## 1.5.0

### What's new

**Better, faster, clearer**: new features, enhanced usability, and a full docs
overhaul to make setup and customization effortless.

<img width="494" height="325" alt="image" src="https://github.com/user-attachments/assets/bb528241-11ee-4902-b376-b785880b5223"
/>

#### 🆕 New Feature

- Badge Template: Added  
  ➡️ [Feature]: Entity Progress Badge Template #79 (@Pulpyyyy)
- Progress Bar Positioning  
  New parameter: `bar_position` with the following options:
  - `default`: standard position
  - `top`: at the top of the card
  - `bottom`: at the bottom of the card
  - `overlay`: overlaid on top of the content

  ➡️ [Feature]: Add option to show progress bar along bottom (or top) border of
  card #73 (@Valdorama)  
  ➡️ [Enhancement]: Style for XL bar #76 (@yduke)  
  ➡️ [Feature]: bar position #80 (@NfxGT) (soon!)

- `bar_effect`: added support for `center_zero` (effect: 'radius', 'glass',
  'gradient')
- Single-Line Mode for Overlay Bars  
  New parameter: `bar_single_line` (for overlay mode bars only)

- Trend Indicator New parameter: trend_indicator (boolean) Displays trend icons:
  - mdi:chevron-up-box: upward trend
  - mdi:chevron-down-box: downward trend
  - mdi:equal-box: stable trend Automatically positioned at the top right of the
    card

  ➡️ [Feature]: trend indicator #82

- Enhanced validation system added:
  - YAML is fully analyzed and failback applyed.
  - Many new error messages have been introduced to handle cases such as:
    - Missing properties,
    - Invalid types (string, number, boolean, array, object),
    - Malformed entity IDs,
    - Discontinuous or inconsistent ranges (min > max),
    - Invalid theme, icon, or state contents,
    - Automatic application of default values.
  - deprecated parameters: Warn in JavaScript console when using deprecated
    parameters.

- Multilingual support: Extended and fixed
  - Extended: All new error messages have been translated into over 20
    languages, including now
    - 🇻🇳 Vietnamese (vi)
    - 🇷🇺 Русский (ru)
    - 🇹🇭 Thai (th)
    - 🇮🇩 Indonesian (id)
    - 🇺🇦 Ukrainian (uk)
    - 🇮🇳 Hindi (hi)
    - 🇨🇿 Czech (cs)
    - 🇧🇩 Bengali (bn)
  - Fix Small/Medium/Large translation
- Card Template: Added the `force_circular_background` option in the template  
  ➡️ [Feature]: Add force_circular_background: true in the template card options
  #83
- Editor: Added new `xlarge` size option for the bar.
- Accessibility: respects the “Reduce Motion” setting (iOS/macOS, Android,
  Windows) to limit animations and prevent dizziness, migraines, or
  distractions.

#### 🎨 Style Improvements

##### Major CSS Refactoring

- **Complete CSS reorganization**: Restructured the entire stylesheet with clear
  section headers and improved organization
- **CSS Custom Properties migration**: Converted hardcoded values to CSS custom
  properties for better maintainability and theming
- **Modular approach**: Split CSS into logical sections (Base Card, Main
  Container, Progress Bar, etc.)

##### Enhanced Layout System

- **Flexible container system**: Introduced variables for dynamic layout control
- **Improved vertical/horizontal layouts**: Better separation of concerns
  between orientation-specific styles
- **Responsive design improvements**: Enhanced responsiveness across different
  card types and sizes
- **Enhanced center_zero support**: Improved bar effects (radius, glass,
  gradient) compatibility with center_zero mode
- **Effect rendering**: Better handling of gradient and glass effects for both
  positive and negative progress values

#### Performance

- **Optimized CSS**: More efficient CSS structure with reduced redundancy
- **Better rendering**: Improved layout calculations and rendering performance

#### 🐞 Bug Fixes

- **Fixed** [Bug]: icons not loading in the application #86 (@jarzebski)
- **Fixed** [Bug]: Card shows “Configuration error” when conditionally
  re-displayed via visibility and input_text helper #87
- **Fixed** [Bug]: Icon container not found for _showIcon #88 (@golles)
- **Fixed** duplicate registration error during upgrade: Resolved "Failed to
  execute 'define' on 'CustomElementRegistry': the name has already been used"
  by adding existence check before registration
- **Improved** error handling: Added null safety check to prevent "Cannot read
  properties of null (reading 'addEventListener')" errors

#### 📚 Documentation

- **migrate** `doc/` to `docs/`
- **Improved** Navigation:
  - New simplified table of contents
  - Clearer titles and structure throughout
    - Description + Features → Description & features
    - All card types (Standard, Template, Badge) now live under one section
  - YAML options now shown in smart tables
  - Collapsible sections to keep things clean
- **Added**: 🙏 Credits
- **Added**: Theme documentation - `docs/theme.md`
- **Added**: Full Configuration Reference - `docs/configuration.md`
  - full update with conventions, matrix, description to use it efficiently
- **Added**: Troubleshooting Guide - `docs/troubleshooting.md`
- **Added**: Contributing guide - `docs/contributing.md`
- **Added**: Release Candidate Guide - `docs/rc-testing.md`
- **Added**: Code of Conduct - `docs/code_of_conduct.md`
- Update README.md by @jam3sward in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/84>
- typo fix: optionnal > optional by @blobberbun in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/90>

This docs update dramatically improves usability:

- Easier for newcomers
- More maintainable
- Looks great across all devices

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.12...1.5.0>

---

## 1.4.12

### What's new

This release includes support for Jinja templates in bar_effect, bug fixes
related to the editor, and several internal refinements to prepare the upcoming
1.5 release.

#### 🆕 New Feature

**Jinja support for `bar_effect`** (card, badge and template card)

- You can now use [Jinja2](https://jinja.palletsprojects.com/) templates in the
  `bar_effect` configuration.
- This allows for dynamic visual effects based on entity states or conditions.

**Example:**

```yaml
bar_effect: |-
  {% if states(xxx) | float > 22 %}
    shimmer, gradient
  {% else %}
    gradient
  {% endif %}
```

#### 🐞 Bug Fixes

- A test was incorrectly adapted during the refactor in version 1.4.11, leading
  to a bug in the editor UI where the max_value field was not handled properly.
  This has now been fixed and validated.

#### 🧼 Code Refactoring

- Minor refactors around conditional checks and effect rendering functions.
- Prepare the 1.5 version ^^

#### 📚 Documentation

- Updated README.md to reflect the new Jinja capability for bar_effect, with
  usage examples.
- See: <https://github.com/francois-le-ko4la/lovelace-entity-progress-card>

➡️ **Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.11...1.4.12>

---

## 1.4.11

### What's new

#### 🆕 New Features

- **Zero Marker (`zeroMark`) for `zero_center` mode**  
  Visually marks the center point (zero) on the progress bar.  
  Especially useful for cards configured with `zero_center` layout.
  [[Feature]: Centered Zero Point](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/50)
  (@Rijswijker)

- **Support for `entity_picture` in template cards**  
  Template-based cards can now properly display entity pictures, improving
  customization and context.
  [[Feature]: Add entity picture option](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/77)
  (@WarC0zes)

- **Enhanced Jinja templating support**  
  The Jinja rendering context now includes `entity` automatically.  
  Icon rendering via Jinja is more robust with improved error fallback on first
  load.
  [[Feature]: template card; add entity variable](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/78)
  (@golles)

#### 🎨 UI/UX Improvements

- **CSS refactor using `:is(...)` and cleanup**  
  Simplified and maintainable CSS with better browser compatibility and fewer
  redundant selectors.

- **Unified progress bar sizing**

- **Improved layout behavior**  
  Better alignment and spacing in both vertical and horizontal orientations.  
  Enhanced readability in compact or dynamic configurations.

#### 🐞 Bug Fixes

- Fixed graphical glitches in certain layouts or edge cases.
  [[Bug]: Bar Effect: Radius, doesnt apply to lower corner on small and medium bar size](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/75)
  (@Duncan1106)

- Resolved icon rendering issues with some template-based entities.
  [[Bug]: Icon - Priority of entity icon higher than specified onebug](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/70)
  (@nicknol)

- Removed unused or outdated visibility-related styles.

- Fixed fallback behavior when a Jinja-rendered icon is invalid or missing.

#### 📚 README Updates

- Content Updated

➡️ **Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.10...1.4.11>

---

## 1.4.10

### What's new

This version introduces numerous visual, technical, and functional improvements
for greater display flexibility and enhanced stability.

#### ✅ New Features

- Progress Bar XL Size A new parameter value (`bar_size` = xlarge) for the
  progress bar provides enhanced visual clarity. ➡️ The progress bar can now be
  displayed below the main content, especially in horizontal layout. ➡️ The card
  automatically adjusts its size to fit this new layout seamlessly.
  <img width="363" alt="image" src="https://github.com/user-attachments/assets/093793a6-b480-40cf-8c3f-9ca9bed9e572"
  />

#### 🛠 Improvements

- `center_zero` Enhancement When `center_zero` is enabled, the default
  `min_value` is now `-100`, offering a clearer and more intuitive display.
- Icon Support Improved rendering of entity icons and support for custom images.
  [[Bug]: Icon - Priority of entity icon higher than specified onebug](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/70)
  (@nicknol)
- Data Handling Better compatibility with various data types (string, number,
  etc.) for more robust configuration.
- Design & Responsiveness ➡️ Smoother and more adaptive layouts, especially in
  vertical orientation. ➡️ Refactored for greater flexibility and
  future-proofing.
- Code Optimization Cleaner structure, reusable utilities, and improved
  maintainability.

#### 🐞 Fixes

- Card Height Fixed an issue where the card height didn’t adjust correctly due
  to a CSS typo.
- Badge Resolved visual glitches in the badge editor preview and badge
  rendering.
- WebSocket to restart update process Improved initialization and management for
  enhanced stability.

#### 📚 README Updates

- Content Updated — refreshed documentation on `bar_size` and `min_value`
- Update browser compatibility matrix
  [[Bug]: Chrome WebView 92.0.4515.105 on Android 10 ReferenceError: structuredClone is not defined](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/74)
  (@WarC0zes)

  |                             Platform                             |                                             Browsers                                              |                                                                                             |                                                                                                      |                                                                                                   |                                                                                                |
  | :--------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------: |
  | ![HA](https://avatars.githubusercontent.com/u/13844975?s=64&v=4) | ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_64x64.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_64x64.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_64x64.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_64x64.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_64x64.png) |
  |                        **Home Assistant**                        |                                            **Chrome**                                             |                                          **Edge**                                           |                                             **Firefox**                                              |                                            **Safari**                                             |                                           **Opera**                                            |
  |                            `2024.0+`                             |                                               `98+`                                               |                                            `98+`                                            |                                                `94+`                                                 |                                              `15.4+`                                              |                                             `84+`                                              |

➡️ **Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.9...1.4.10>

---

## 1.4.9

### What's new

This nightly update brings useful improvements and important fixes to enhance
stability and customization.

#### ✨ Improvements

- height: added. Sets the height (e.g., 120px, 10em, 30%) for the card. Useful
  for ensuring consistent layout in horizontal stacks or grids.

#### 🐞 Bug Fixes

- Fix warning on Chrome: mouse event / passive: true
- [[Bug]: Secondary info cannot be a sensor value](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/71)
  (@vogtmh)
- [[Bug]: disable_unit: true messing up custom theme](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/68)
  (@nicknol)
- [[Enhancement]: Changing the height of the card](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/64)
  (@DaN660)
- [[Bug]: blank dashboard](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/66)[bug](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/66)
  (@Cptkex82, @awlobo, @vogtmh)

Thank you @mooseBringer for your help on discord.

#### 📚 README Updates

- Content Updated — refreshed documentation for better clarity and accuracy.
- Reorganized Structure — improved layout for easier navigation and
  understanding. Update README.md by @Duncan1106 in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/69>

#### 🚀 New Contributors

- @Duncan1106 made their first contribution in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/69>

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)
➡️ **Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.8...1.4.9>

---

## 1.4.8

### What's new

This update brings a cleaner look, smarter layout options, and more control
through new YAML parameters. Small tweaks, big impact—your cards just got more
powerful and more flexible.

#### ✨ Improvements

- Zero-centered progress bars (card/template) Easily display values that move
  around zero—perfect for showing deltas, gains/losses, or directional trends.
  Watermarks have been adjusted to support center_zero mode. 🔧 New YAML option:
  `center_zero` 📄 [Feature]: Centered Zero Point #50 (@Rijswijker)
  <img width="254" alt="Screenshot 2025-06-29 at 01 50 02" src="https://github.com/user-attachments/assets/fce9ca77-8493-4a22-a066-3e695d2b2962"
  />
- Multiple entities support (card) Group several entities into a single card,
  complete with auto-totaling and dynamic gradient coloring to visualize each
  contribution. 🔧 New YAML option: `additions` 📄 [Enhancement]: Visualization
  of Total and Partial Values in Single Bar #61 (@jam3sward)
  <!-- markdownlint-disable-next-line MD013 -->
  <img width="245" alt="Screenshot 2025-06-29 at 01 41 53" src="https://github.com/user-attachments/assets/383f7c2d-7cd7-4198-92a6-c4905b6a76ad" />
- Multiline secondary info (template) Support for line breaks in secondary info
  using `br` tag, letting you display richer, clearer context. 📄 [Enhancement]:
  Multiline Secondary for entity-progress-card-template #60 (@Duncan1106)
  <img width="237" alt="Screenshot 2025-06-29 at 01 39 23" src="https://github.com/user-attachments/assets/6b07ecf9-47eb-4e39-9106-aa89532d6fda"
  />
- Marginless mode (template/card) Remove vertical padding for a more compact
  look. 🔧 New YAML option: `marginless` 📄 [Enhancement]: Changing the height
  of the card #64 (@DaN660)
  <img width="796" alt="Screenshot 2025-06-29 at 01 46 15" src="https://github.com/user-attachments/assets/ee2e8ad7-6fcd-4f6e-93b6-11d09bd3e8a8"
  />

#### 🐞 Bug Fixes

- `unit_spacing`: regression fixed Units are now correctly spaced next to values
  again.
- Custom minimum width (template/card/badge) Set a minimum card width to ensure
  consistent layouts. 🔧 New YAML option: `min_width` 📄 [Bug]: hiding the name
  hides the bar #63 (@dougyip)
  <img width="490" alt="Screenshot 2025-06-29 at 01 43 36" src="https://github.com/user-attachments/assets/4ade5a82-be8e-4096-86ae-39a8ed6947b2"
  />
- 💅 Minor CSS refinements for better alignment in vertical layouts.

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.7...1.4.8>

---

## 1.4.7

### What's new

#### 🌈 New Visual Effects for Progress Bars

##### outer border-radius

Normalized outer border-radius based on component size (small, medium, large).

<img width="765" alt="image" src="https://github.com/user-attachments/assets/28df779d-b77d-434c-87c6-ce7c5381765b"
/>

##### Visual Styles for Progress Fill

You can now customize the look of the progress bar using new visual styles:

- `radius` – rounded corners
- `glass` – frosted glass effect
- `gradient` – soft color gradients
- `shimmer` – animated shimmering

![image](https://github.com/user-attachments/assets/bb77ee07-2ff7-4273-8da2-c09fc8549669)

👉 Enable with the new `bar_effect` option.  
➡️ **Documentation**:
[the bar_effect docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#bar_effect)

#### 💧 Redesigned Watermarks

New watermark types provide more visual flexibility:

- `blended` (default): A subtle colored overlay that merges with the bar’s
  colors for a more integrated look.
- `area`: A soft transparent shape placed over the bar, without blending into
  the bar's colors.
- `striped`: Diagonal stripes for a patterned effect.
- `triangle`: Triangle shapes as a watermark.
- `round`: Rounded shapes applied as a watermark.
- `line`: Vertical lines pattern (like a hatch effect).

👉 Cleaner and more dynamic rendering.

<img width="517" alt="image" src="https://github.com/user-attachments/assets/95eb30fd-cd8a-4779-ac0b-3b7e80dfcb64"
/>

👉 Request:

- #57 Watermark: opacity (@WaterInTheLake)
- #58 Watermark: line width (@WaterInTheLake)

➡️ **Documentation**:
[the watermark docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#watermark-)

#### 🧩 Technical Improvements

##### 🏗 Full Refactor

- Modular rewrite for both cards and badges
- New config system with automatic validation

##### ⚙️ Better Maintainability

- Reduced code duplication
- Dynamic CSS class handling for flexibility
- Foundation laid for future features

#### 🔧 Migration Notes

No changes required to existing configurations.

To use new effects, add this to your card config:

```yaml
type: 'custom:entity-progress-card'
entity: sensor.battery_level
bar_effect:
  - shimmer
  - radius
```

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.6...1.4.7>

---

## 1.4.6

### What's new

#### 🎨 Editor Improvements

- Cleaned the editor logic with proper separation of **rendering methods**.
- Improved **accordion sections** animation
- Improved behavior of **toggle switches** and dynamic `hide` logic in the
  config editor.

#### 🏷️ Badge Component

- Standardized dimensions (width/height),
- Improved icon and text alignment,
- Better visual consistency in compact layouts.

#### 🐞 Bug Fixes

- #56 Text on Badge is nearly unreadable (@sphings79)
- Resolved potential **duplicate event listener** issues in the editor.

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.5...1.4.6>

---

## 1.4.5

### What's new

#### 🚀 Improvements

##### 🎨 `entity-progress-card`

If the entity has an entity_picture attribute then a picture is shown, instead
of an icon.

- #55 Allow image instead of icon (@netsoft-ruidias)

##### 🎨 `entity-progress-card` & `template`

`reverse_secondary_info_row`: added. Reverses the order of the progress bar and
the secondary info when using a horizontal layout.

- #52 add options to display values on right side and adjust font size
  (@jamesvert)

##### 📖 Extended support for frameless

- Enhanced documentation now details compatibility with various card types
  (entities, vertical-stack, etc.).
- Clearer guidance on when this option needs to be explicitly set.

##### ⚙️ CSS Optimizations

- Improved vertical layout handling:
  - Adjustments to margins, heights, and alignments.
  - Centered and responsive display.
- Renaming from formats like hide_icon → hide-icon for better consistency.
- Refactoring of CSS variables (--epb-*) for improved clarity and customization.
- manage all ellipsis with the same methodology

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.4...1.4.5>

---

## 1.4.4

### What's new

#### 🚀 Improvements

🎨 Enhanced Frameless Mode Integration:

- Better compatibility with `entities` and `vertical-stack-in-card` cards when
  using frameless mode.
- Automatic detection with `entities` card and aligned look & feel
- Shadow has been removed to avoid glitch [Feature]: Add entity_row option -
  frameless #45

🎨 Major CSS Optimizations

- Complete CSS reorganization
- Enhanced entity support
- Better orientation handling
- Optimized transitions
- Improved accessibility

✏️ Editor Improvements

- Redesigned user interface 💫 with a more modern design
- Centralized CSS variables 🎛️ for easier maintenance
- Bug fixes 🐛 (typo align-item → align-items)
- Better organization 📁 of accordion styles

⚡Performance Optimizations

- Advanced throttling system 🚦 to limit frequent updates
- Enhanced resource management 🔧 with optimized ResourceManager
- Reduced unnecessary re-renders 🎯 through better change tracking

🔄 CI/CD Configuration

- Added GitHub workflow 🔄 for automatic stale issue management
- Automatic closure after 15 days of inactivity with reopening capability ⏰

🐞 Bug Fixes

- [Bug #53] Fixed an issue where custom theme icons were not displaying
  correctly.
- Improved Jinja processing 🔧 for templates During the copy-paste operation,
  the embedded template card displayed the Jinja syntax rather than the rendered
  output.
- Better validation ✅ of configuration fields
- Fixed demo mode handling 🎮

✅ Take away

- Enhanced user experience 😊 in the editor
- Better compatibility 🤝 with different Home Assistant card
- Improved performance 🚀 through throttling and optimized resource management
- Easier maintenance 🔧 with clearer CSS structure

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.3...1.4.4>

---

## 1.4.3

### What's new

This update brings you more control and clarity under the hood:

- Updated internal code documentation for better clarity and maintainability.
- Changed logging strategy in development mode for enhanced debugging.

🧪 Feature Enhancements

- Performance improvements: finer tracking of state changes before triggering
  updates. Added a ChangeTracker class to detect and handle changes in the hass
  state efficiently.
- Reworked theme and color management with a cleaner, more dynamic ThemeManager.
  Vertical layout icons with hidden icons now support a single-line display.
  This new feature may cause automatic resizing if your layout is not fixed and
  you intend to maintain two or more rows without icons. **Don't panic!** You
  can adjust your grid setup to your requirements in the card editor. request:
  @Lemonadel
  [#47](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/47)

🎨 UI/UX Improvements

- Added structured comments, emoji tags (🛠️, 📦, ✅), and well-documented class
  sections (// === SECTION ===) to improve readability.
- Improved the configuration editor (EntityProgressCardEditor) with:
  - Better event handling
  - Clear mapping of editor fields
  - Automatic updates and validation
- Introduced demo mode for templates (EntityProgressTemplate), simulating entity
  values for preview.

🔄 CI/CD Configuration

- Updated the release.yaml workflow to:
  - Automatically clean up .js files from logger/debug-related patterns.
  - Enforce code style (e.g., removing trailing spaces).

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.2...1.4.3>

---

## 1.4.2

### What's new

Transform your dashboard experience with the latest Entity Progress Card – where
beautiful design meets powerful functionality, giving you the tools to create
interfaces that truly reflect your vision.

### 🎯 New "Badge" Mode

A more compact version of the card is now available: perfect for badge-style
views (e.g., in previews or condensed dashboards). It displays key information
in a smaller, cleaner format.

- request: @peyn
  [#43](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/43)
- Documentation:
  [the entity-progress-badge docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#entity-progress-badge)

### 🖼 "Frameless" Option

- `frameless`: added You can now enable a frameless mode without borders and
  background (frameless) for even smoother integration into your existing card.
  - request: @davidlb
    [#45](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/45)
  - Documentation:
    [the frameless docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#frameless-)

### 🎨 Extended Color Customization

Custom themes can now handle separately: added

- icon color (icon_color)
- progress bar color (bar_color)
- background color (color)
  - request: @LeCreepyboy
    [#49](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/49)
  - Documentation:
    [the custom_theme docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#custom_theme-)

💅 Visual Improvements

- Better color management with transparency support
- Icon is now better positioned and more visible
- Shrink card if icon is hidden and layout is vertical
  - request: @Lemonadel
    [#47](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/47)

⚙️ Performance and Reliability

- Faster and smoother rendering thanks to optimized DOM management
- Better compatibility with Home Assistant dynamic updates
- Improved error handling (standard error + network)
  - bug: @mooseBringer
    [#48](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/48)

To enjoy all these new features, remember to clear your browser cache if
necessary after the update. Need help or a configuration example? Check out the
updated documentation or ask questions!

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.1...1.4.2>

---

## 1.4.1

### What's New

We're excited to roll out a new update for the Entity Progress Card Template,
continuing our mission to make your dashboards more flexible, expressive, and
visually refined.

#### 🌈 Improvements

This release brings several key enhancements:

- Improved display in the card gallery Your card now integrates more smoothly
  into the card selector interface, with a cleaner, more informative preview.
- New standard parameters support We’ve introduced additional layout and style
  customization options to better fit your UI needs:

  | Variable        | Description                                               |
  | --------------- | --------------------------------------------------------- |
  | bar_orientation | Define the direction of the progress bar (e.g., ltr, rtl) |
  | bar_size        | Customize the size or thickness of the progress bar       |
  | layout          | Adjust the overall layout (e.g., horizontal, vertical)    |

Stay inspired, and keep building ✨

➡️ **Documentation**:
[entity-progress-card GitHub repo](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.4.0...1.4.1>

---

## 1.4.0

### What's new

🆕 New Card: Entity Progress Card Template

We’re excited to introduce a powerful new addition to our card library: the
Entity Progress Card Template.

This card is designed to handle more advanced use cases that aren't fully
supported by the base card. It avoids the need for custom helpers by allowing
you to implement your desired mathematical modeling directly through templating.

🧠 Why Use This Card?

This card is ideal for situations where:

- You want to show calculated progress (e.g., level, usage, battery life)
- You need to apply dynamic logic or math modeling directly in the card
- The base card doesn't offer the required level of customization

➡️ **Documentation**:
[the entity-progress-card-template docs](https://github.com/francois-le-ko4la/lovelace-entity-progress-card?tab=readme-ov-file#entity-progress-card-template)  
➡️
**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.14...1.4.0>

---

## 1.3.14

### What's new

Small improvements to prepare the future.

- Code optimizations across the application.
- Fixed a side effect introduced by a previous optimization that affected select
  fields.
- Preparation for version 1.4 to support upcoming changes.

---

## 1.3.13

### What's new

Some users have reported issues with toggle components not behaving as expected
in certain cases.

🔧 update to enhance the stability and reliability of toggle functionality
across the interface. 🔧 reduce DOM update during YAML edit

This improvement addresses inconsistencies and ensures a smoother, more
predictable user experience.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.12...1.3.13>

---

## 1.3.12

### What's new

**`min_value` Strikes Back**

Turns out, `min_value` went undercover due to a sneaky little typo. It almost
got away with it too—until we caught it red-handed in the middle of a bug
report.

Apologies to anyone who tried to set a minimum value and got a maximum headache
instead.

---

## 1.3.11

### What's new

🛠️ Bug Fix

- Default Icon Handling: Fixed an issue where, in certain cases, the displayed
  icon no longer matched the entity when its state changed.
- Default name Handling
- Minification

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.10...1.3.11>

---

## 1.3.10

### What's new – _Clicks Under Control_

This patch release fixes the click chaos introduced in 1.3.8. Turns out, one
misbehaving variable caused a few taps to go on strike.

#### 🐛 What was broken in 1.3.8/1.3.9

- `icon hold` didn’t hold up
- `icon double tap` double-failed
- regular `double tap` got confused

All thanks to a variable that thought it was smarter than it really was.

#### 🔧 What’s fixed

- Corrected the logic to properly fallback to the card-level action when icon
  actions are set to `none` or not defined.

#### 🕵️‍♂️ Special thanks

Big thanks to **@Duncan1106** for catching the
[issue](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/40)
before it spiraled further.  
My tests clearly need a caffeine upgrade. ☕

Back to clicking with confidence!

---

## 1.3.9

### What's new

**Crafted, tested, tuned, and rethought...**

#### 🔢 Improved Attribute Handling

Better support for attributes containing numeric values, including strings that
represent value.

#### 🛠️ Accordion (Editor) – Smoother Animation

Refined animation behavior with adjusted speed and removal of visual glitches.

#### 📚 Documentation Update

Updated final card for the advanced guide: “Cracking a Complex Case with a
Simple Helper.”

#### ⚙️ General Optimization

Code cleanup and performance improvements.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.8...1.3.9>

---

## 1.3.8

### What's new

Bringing clarity, consistency, and control — this update refines the experience
from card display to editor behavior, introduces smarter defaults, and empowers
developers with targeted debugging tools. Let’s dive into what’s new.

#### 🚀 Features & Improvements

- 🗺️ Card
  - Ellipsis: fixed only one ellipsis is now displayed in the information
    section.
  - Font / Font Size: uses global variables to ensure consistent styling across
    the interface.
- 🛠️ Editor
  - GUI Update from YAML: fixed deletions made in YAML are now correctly
    reflected when switching to the graphical editor.
  - Attribute Selection: disabled for Counter, Number, Timer, and Duration
    entities.
  - YAML to entity-progress-card Conversion: fixed no more errors, and the
    graphical editor is correctly generated.
  - Accordion: improved more natural opening behavior.
- 🔢 Number: added added support for number value.
- 📈 max_value: Improved now properly supports Counter, Number, and Duration
  entities.
- 🎯 xyz_action: defaults added
  - tap_action: `more-info`
  - hold_action: `none`
  - double_tap_action: `none`
  - icon_tap_action:
    - `toggle` if the entity is a `light`, `switch`, `fan`, `input_boolean`, or
      `media_player`
    - `none` otherwise
  - icon_hold_action: `none`
  - icon_double_tap_action: `none`

#### 📚 Documentation

- Added new section: "Percentage Calculation"
- Added advanced example: Don't Let It Expire!
- Added new section: "Token Color"
- Simplified option descriptions
- Standardized typing using Home Assistant conventions
- Replaced color definitions with token color
- Minor cosmetic adjustments

#### ⚙️ Optimization

- More robust handling of default values
- More reliable editor updates
- Debug mode: can be selectively enabled for card, editor, or resource manager

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.7...1.3.8>

---

## 1.3.7

### What's new

This release focuses on improving visual consistency, usability, and
performance, with better icon support, refined animations, enhanced
configuration handling, and updated documentation.

#### 🚀 Features & Improvements

- Entity Icon Handling
  - Improved icon retrieval: certain MDI icons previously not displayed
    correctly are now fully supported when defined in Home Assistant.
  - Enhanced clickable area: better interaction zone around the icon.

- decimal Handling Anticipates formatting needs without requiring manual
  configuration.

- Editor: Accordion Animation Refined animation for a smoother and more natural
  transition.

- Editor: Select Fields  
  Fixed display and behavior of select fields in the card editor.

#### ⚙️ Optimization

- Simplified internal icon handling logic.
- Improved code syntax for better readability and maintainability.
- Removed unused variables.
- Optimized conditional checks for performance.

#### 📚 Documentation

- Updated content to reflect recent changes and improvements.
- Refreshed screenshots to match the latest UI and features.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.6...1.3.7>

---

## 1.3.6

### What's new

We’ve added a new configuration option: unit_spacing, allowing you to control
the presence of a space between numeric values and their units (e.g., %, °C, €,
etc.).

This enhancement gives users more flexibility and control over how numeric units
are formatted — whether you want to follow locale standards or override them
explicitly.

```yaml
unit_spacing: 'auto' | 'space' | 'no-space'
```

- `auto` (default) — Automatically applies the correct spacing based on the
  user’s locale (e.g., 80 % in French, 80% in English-US).
- `space` — Always adds a space between number and unit (e.g., 80 %), regardless
  of locale.
- `no-space` — Always removes the space (e.g., 80%), even if the locale normally
  includes it.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.5...1.3.6>

---

## 1.3.5

### What's new

**🌱 A Fresh Breath for a Growing Card**

As this card continues to evolve and gain more features, it became clear that a
bit of housekeeping was long overdue. With every added function, keeping the
codebase clean, efficient, and aligned with Home Assistant standards is
essential—not just for performance, but for maintainability and user experience.
This release is a step in that direction.

#### 🧾 Improved Unit Formatting

The separator between the value and its unit now uses a standard space instead
of a non-breaking space, aligning the display behavior with Home Assistant’s
native cards for a more consistent look.

#### 🧩 Refined Accordion Effect

The accordion animation and behavior have been optimized for a smoother, more
polished interaction experience.

#### 🧹 Code Quality Boost (ESLint + DeepSource)

- Function Splitting & Performance Optimization A function that had grown too
  complex over time was split into smaller, more manageable parts. This
  structural change not only improves current performance but also lays a safer
  foundation for future releases.
- Significant code clean-up and optimization have been carried out. To maintain
  a high-quality codebase, we use ESLint locally during development and we've
  integrated DeepSource for static analysis. DeepSource now performs an
  additional validation step upon each commit, helping prevent bugs before any
  release process begins.

---

## 1.3.4

### What's new

This release focuses on performance refinement and intelligent memory
management, making your interface lighter, faster, and more responsive. With an
internal resource manager now steering the card's behavior, we aim to
future-proof its evolution while keeping it lean.

#### 🚀 Improvements

- Memory Optimization – Enhanced The progressive addition of new concepts now
  requires a dedicated internal resource manager. This change significantly
  optimizes how resources are handled, resulting in better performance and lower
  memory usage.

- Icon Detection – Smarter Automatic icon selection has been improved for
  several device classes: `curtain`, `blind`, `garage`, `gate`, `shutter`,
  `window`, `door`, `shade`, and `damper`. These now visually reflect their
  real-world state with greater accuracy.

#### 🐞 Bug Fixes

- Precision Regression – Fixed Addressed a regression that affected the accuracy
  of displayed values.

- Color Handling – Resolved Fixed a bug causing incorrect color rendering in
  certain states.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.3...1.3.4>

---

## 1.3.3

### What's new ?

**A smarter, more human, and more intuitive card.**

This version marks a major step toward a card that’s easier to configure, more
aligned with Home Assistant standards, and richer in features. We worked to make
it "speak your language" — less manual setup, more intelligence by default, and
an ever-stronger attention to detail.

Thank you all for your feedback and support! 🚀

#### 🔥 New Features

- `state_content`: Added
  - Allows you to add Home Assistant attributes before the main value directly
    through a simple YAML description.
  - Complements the `custom_info` field by offering a quick, native method.

- Duration: Added
  - Displays durations in a human-readable format, e.g., 3h 4min instead of
    11,040s. (@mill1000
    [feature request #33](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/33))

- Unit Typography : Fixed
  - Automatically adds the correct typographic space between the value and unit
    (5 s instead of 5s).
  - Respects local conventions according to Home Assistant's language settings.
    If you notice any issues, please let us know via Discord or GitHub!

#### 🔄 Improvements

- Hide
  - Added the ability to hide both the value and the unit when `state_content`
    or `custom_info` is enough.
  - Enables customized displays without redundancy.
- Timer
  - Default behavior updated to avoid manual configuration:
    - Reverse countdown (`reverse` = true) is now the default to match the
      "Tile" style.
    - Progress bar orientation is now RTL (right-to-left) by default.
- Unit
  - Unit detection improved:
    - Counter: `unit` disabled by default to avoid unnecessary clutter.
    - Duration: support for timer and flexTimer. (@mill1000
      [feature request #33](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/33))
    - Timer: now displays by default in flexTimer, with an inactive state
      instead of showing 0 s.
- Error Messages
  - Lighter DOM by default for better performance.
  - Home Assistant color codes are now used for visual consistency.

#### 📚 Documentation

- Added all the new parameters (state_content, etc.).
- New advanced guide: "Washing Machine example" (@erikgeurts) to show how to use
  it with multiple entities.
- Clarified unit management between automatic and manual modes.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.2...1.3.3>

---

## 1.3.2

### What's new

_“Details matter. It’s not just what it looks like and feels like. Design is how
it works.” – Steve Jobs_

This release focuses on giving you more **control** over the look of your card
and **flexibility** in how your data is presented — all while keeping the card
clean and intuitive.

#### 🎨 Color Parameter Support

You can now customize the bar's background color using **theme-aware color
variables**:

- `--epb-progress-bar-background-color`

This allows for:

- Deeper theme integration
- Better readability with custom Theme
- More consistent appearance across your dashboard

#### 🏷️ `name_option` Parameter

A new `name_option` parameter is introduced to control how the **entity name**
is rendered. It’s ideal for:

- Appending dynamic context via Jinja
- Displaying a more descriptive label

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.1...1.3.2>

---

## 1.3.1

### What's new

**Small details make great experiences.**

The badge option has been split into two distinct and more flexible parameters:

- `badge_icon` – Defines the icon to display (e.g. mdi:battery), supports Jinja
  templating.
- `badge_color` – Controls the background and icon color, also supports Jinja
  and CSS color values.

This change brings the configuration closer to the standard used by cards like
Mushroom Template, ensuring more consistency and customization freedom.

✅ You can now:

- Dynamically adjust the icon based on entity state
- Define custom background/icon colors for better visual feedback

_Example:_

```yaml
badge_icon: >-
  {% if is_state('binary_sensor.piglet_charging','on') %}
    mdi:battery-charging
  {% endif %}
badge_color: >-
  {% if is_state('binary_sensor.piglet_charging','on') %}
    green
  {% else %}
    gray
  {% endif %}
```

(@erikgeurts
[feature request #26](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/26))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.3.0...1.3.1>

---

## 1.3.0

### What's new

**Express More, With Less Effort !**

As this card continues to evolve, the mission remains the same: simplicity
first, flexibility when you need it. With version 1.3.0 and beyond, we’ve opened
the door to greater expressiveness—without sacrificing ease of use.

🚀 This release introduces new capabilities designed to offer more control and
customization right where you need it most: the visual layer.

✨ Say hello to:

- `disable_low` and `disable_high` for watermarks (@erikgeurts
  [feature request #31](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/31))
- The `custom_info` option for dynamic inline text (@pterisaur
  [feature request #25](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/25))
- The `badge` option for icon overlays driven by real-time state (@erikgeurts
  [feature request #26](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/26))

These new options empower you to present context-sensitive data beautifully and
meaningfully, while keeping your card configuration clean.

🙏 Big shoutout to everyone dropping feature requests and steady feedback on
github/discord — you're the real MVPs making this card smarter, slicker, and
better every version! 💪✨ Special thanks to: @meoller, @mill1000, @Ascathon,
@harmonie-durrant, @nortuzar, @Jezza34000, @hanfreakingsolo, @Duncan1106,
@pterisaur, @ond000, @meirlo, @afkdk, @c4weddell, @saya6k, @erikgeurts,
@FrankJaco, @ripvega, @poiromaniax 🙌

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.8...1.3.0>

---

## 1.2.8

### What's new ?

#### 🚀 Features & Improvements

- 🎨 Improved color blending for watermark overlays (@erikgeurts
  [feature request #28](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/28))
  Enhanced visual mix between the progress bar and watermark zones for better
  clarity and aesthetics.
- 🧩 Added "simple line" style for watermark (@erikgeurts
  [feature request #28](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/28))
  New visual option to display threshold zones using clean vertical lines.

#### 🐛 Bug Fixes

- 🔧 Fixed attribute handling logic (@hanfreakingsolo
  [issue #30](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/30))
  Corrected an issue where non-numeric attributes could interfere with rendering
  or calculations.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.7...1.2.8>

---

## 1.2.7

### What's new ?

#### Watermark

The `entity-progress-card` just got **smarter** with a new update to the
`watermark` feature! 🎉

You can now define `low` and `high` watermark thresholds using either:

- ✅ **Absolute values** (e.g., 3.7 for volts)
- ✅ **Percentages** (e.g., 20%)

Thanks to automatic **unit detection**, the card intelligently interprets your
thresholds depending on the entity’s native unit.

- If the entity unit is V or °C, absolute values like 3.7 will be interpreted
  directly.
- If you use a %, it’ll be treated as a percentage of 0–100.

This makes the card way more flexible:

- 🔋 For battery sensors, use percentages (20%, 80%)
- 🌡️ For temperatures or voltages, use real-world values (18°C, 3.7V, etc.)

📦 This update enhances readability and customization while keeping your config
intuitive and powerful.

#### 🧹 Bonus: Cleaner Build for Production

The build process now automatically removes debug calls that aren't used &
needed in production, making the file lighter and cleaner.

Enjoy the boost! 🚀💚

(@erikgeurts
[feature request #28](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/28))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.6...1.2.7>

---

## 1.2.6

### What's changed ?

We're excited to introduce **`watermark` support** in `entity-progress-card`!  
This feature adds visual **threshold indicators** directly into the progress
bar, making it easier to understand when a value is outside of a recommended
range.

#### 🔧 YAML Configuration

```yaml
watermark:
  high: 80
  high_color: red
  low: 10
  low_color: yellow
```

#### 🧩 What it does

- 🎯 Highlights the low zone (e.g., <10%) and high zone (e.g., >80%) directly on
  the bar.
- 🎨 Fully customizable colors for each zone.
- ✨ Brings visual awareness to optimal operating ranges — especially useful for
  batteries, sensors, and more.

#### ✅ Example Use Case

For a battery:

- 🔻 Under 10%: background turns yellow → needs charging!
- 🔺 Over 80%: red overlay → avoid charging further to preserve battery health.

This makes it super clear where the value stands at a glance!

(@afkdk
[feature request #21](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/21))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.5...1.2.6>

---

## 1.2.5

### What's changed ?

Full Support for All User Actions on Cards 🎉

We're excited to announce that in this update, all user actions on cards are now
fully supported! 🥳 Every possible interaction is covered, offering complete
flexibility to customize card behaviors to fit your needs. Here’s a quick
overview of the actions now fully available:

- `tap_action`: 🎯 Defines the action when a user taps the card. Perfect for
  quick interactions!
- `double_tap_action`: 👆 Double tap for a distinct action, allowing for even
  more interaction possibilities.
- `hold_action`: ⏳ Trigger an action when the user holds down on the card. A
  great way to enable long-press functionality.
- `icon_tap_action`: 🌟 Tap the icon on the card to trigger a special action.
  Customization at your fingertips!
- `icon_double_tap_action`: 💥 Double tap the icon to perform a unique action.
  More options, more fun!
- `icon_hold_action`: ✋ Hold the icon to execute an action. For those who like
  to press and hold!

All these actions can now be configured to do awesome things like:

- Displaying more info 📚
- Navigating to different pages 🚀
- Executing custom commands ⚡️ ...

This update boosts the customizability and rich interactions of your cards, so
you can personalize your experience like never before! 🔧🔮

(@Duncan1106
[feature request #27](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/27))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.4...1.2.5>

---

## 1.2.4

### What's changed ?

This patch fixes an issue affecting the icon_tap_action behavior in the previous
version.

🐞 Bug Fix: icon_tap_action Handling (@Duncan1106
[issue #27](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/27))
The previous version only triggered the more-info action, regardless of the
configured icon_tap_action. Despite thorough testing, this bug slipped through
and went unnoticed until now. It has been fully resolved, and custom tap actions
are now handled as expected.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.3...1.2.4>

---

## 1.2.3

### What's changed ?

We’re excited to announce a new release focused on code quality improvements and
enhanced user interaction. This update marks an important step toward
industrializing the package for more efficient distribution and maintenance,
while also improving usability.

#### 🏭 Package Industrialization

- Code Minification: The source code is now minified, resulting in faster load
  times and a more optimized deployment.
- Automatic Code Deployment: The latest code is now automatically published,
  streamlining the release process and reducing the risk of inconsistencies.

#### 🖱️ Mouse Handling Fix

- Improved Mouse Support: Enhanced mouse handling logic to better cover a wider
  range of user interactions and edge cases. (@Duncan1106
  [issue #27](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/27))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.2...1.2.3>

---

## 1.2.2

### What's changed ?

This release brings significant improvements in interaction customization,
visual consistency, and language support. It also aligns with the latest Home
Assistant 2025.3 standards while simplifying configuration for both users and
developers.

#### 🆕 New Interactions

- New interaction options offer more flexibility in how the card responds to
  user input:
  - hold_action – Defines the behavior when the card is long-pressed. (@meirlo
    [feature request #22](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/22))
  - icon_tap_action – Defines the behavior when the icon is tapped. (@meirlo
    [feature request #22](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/22))

#### 🎨 Look & Feel Enhancements

Visual improvements bring the card in line with Home Assistant’s current design
standards:

- 🌈 Default use of Home Assistant color names, making them easier to integrate.
  (@pterisaur
  [feature request #24](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/24))
- 🔵 The circular background behavior now matches HA 2025.3's updated visual
  norms.
- 🌀 force_circular_background – New property that forces a circular icon
  background, helpful to override Home Assistant's automatic behavior.
  (@pterisaur
  [feature request #24](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/24))

#### 🌍 Language Support

Eight new languages have been added to improve accessibility and localization:

- 🇹🇷 Turkish (tr)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇬🇷 Greek (el)
- 🇫🇮 Finnish (fi)
- 🇷🇴 Romanian (ro)

#### 📚 Documentation Updates

The documentation has been expanded and improved:

- Includes new properties: hold_action, icon_tap_action, and
  force_circular_background.
- Clear explanations of behavior and configuration options.
- Updated examples and visuals reflecting the new look and features.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.1...1.2.2>

---

## 1.2.1

### What's changed ?

This update introduces several improvements to the card component, enhancing
user interaction, visual design, and integration with Home Assistant's features.
Key improvements include better handling of colors, improved spacing between
components, streamlined code for easier maintenance, and more comprehensive
support for `tap_action` events. Below is a detailed breakdown of the changes.

#### 🎨 Color & Bar Color: _Improved_

- ✅ Added **Reset (✕)** button to revert to the default color.
- ✅ Display of **current color** (live preview).
- ✅ Support for **YAML-defined colors**: displayed when specified.
- ✅ Improved **dropdown placement and size** for a smoother user experience.
  (@erikgeurts
  [issue #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20))

#### 📐 Space Between Components: _Improved_

- ✅ Consistent spacing between all components.
- ➕ Enhanced readability and overall layout.

#### 👆 `tap_action`: _Improved & Complete_

- ✅ **Full Home Assistant action support**:
  - 💡 Proper handling of tap action. (@meirlo
    [feature request #22](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/22))

#### 🧹 Unnecessary descriptions: _Removed_

- ✅ Cleaned up the GUI.
- 🔍 **Improved readability** through clearer and more descriptive labels.

#### 🧹 Code cleanup and improvement

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.2.0...1.2.1>

---

## 1.2.0

### What's changed ?

**Please, read this release note before upgrade...**

#### 🚀 Important Change: `tap_action` Replaces `navigate_to` and `show_more_info`

##### Why ?

This update brings significant improvements (@meirlo
[feature request #22](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/22)),
allowing for:  
✅ **Better scalability** for future enhancements  
✅ **A more natural user experience**, reducing confusion  
✅ **Easier migration** from another card to this one

We have merged the functionalities of `navigate_to` and `show_more_info` into
`tap_action`. As a result, these two options are now **deprecated**,
**disabled**, and **will no longer be maintained** in future updates.

##### 🔄 Impact on Updates

This change requires updating any configuration that currently uses
`navigate_to` or `show_more_info` to instead use `tap_action`.

**Default behaviors remain unchanged**—by default, `tap_action` will still show
the `more_info` dialog.

⚠️ **To ensure a smooth transition**, we recommend updating your configuration
**as soon as possible after upgrading**.  
If you want to keep all features intact, you can add the `tap_action` parameter
**before the upgrade**. You’ll find all the necessary details in the README.

This update required a lot of **time and testing** to make sure you'll enjoy it!
🎉  
If you encounter any issues, feel free to open a request on **GitHub** or join
the **Discord** community for discussions.

---

##### 🎨 Theme Management

We've improved the decision criteria for selecting the appropriate theme
behavior (based on **value** or **percentage**).  
This allows for greater flexibility and better coverage of various use
cases—without requiring complex setup! (@ond000
[feature request #23](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/23))

---

### ❓ FAQ

#### **Q: Why wasn’t this done from the start? / Why make this change now?**

Originally, there were **fewer features to manage**. However, as the card
evolved far beyond my initial expectations, it became clear that a **deeper
overhaul** was needed.  
The complete **revamp of the card editor** now allows for **better functionality
coverage** and **more efficient configuration management**.

#### **Q: What’s the concrete impact if I update?**

The old configuration parameters are now **deprecated** and **no longer usable**
in this version.  
The best solution is to use the **editor** to update your settings easily after
the upgrade or through the YAML editor before the upgrade.

#### **Q: What happens if I don’t update my configuration?**

If your configuration still contains navigate_to or show_more_info, it will no
longer work after this update.

#### **Q: How do I migrate from navigate_to to tap_action?**

If your previous configuration used:

```yaml
navigate_to: /lovelace/view
```

You should replace it with:

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/view
```

Check the README for more migration examples!

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.11...1.2.0>

---

## 1.1.11

### What's changed ?

**Enhancements**

- Field Select Sizing We have adjusted the dimensions of select fields to ensure
  they have reasonable sizes on screen. This prevents any clipping or overflow,
  providing a better user experience, especially across various screen
  resolutions.

**Removals**

- Removal of "battery", "cpu", and "memory" themes in the graphical editor The
  "battery", "cpu", and "memory" themes have been removed from the graphical
  editor. This change helps streamline the interface and eliminates redundant
  elements that are no longer used in the current version of the product. if you
  are still using this themes, the card will automatically select the right
  theme to avoid breaking change.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.10...1.1.11>

---

## 1.1.10

### What's changed ?

🔢 Intelligent Number Formatting

Numbers are displayed based on your regional preferences (@erikgeurts
[feature request #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20)),
using:

- Your selected language settings (auto)
- Your specific format (manual selection)
- Or the system-defined format from your Home Assistant user profile
  (system/browser language)

By default, the card uses standard Arabic numerals (0-9) for maximum
compatibility.

This modification ensures that all needs are covered.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.9...1.1.10>

---

## 1.1.9

### What's changed ?

This update improves the way numbers are formatted by taking into account both
the language and number format preferences set in Home Assistant. Previously,
only the language setting was considered, which could lead to inconsistencies in
numerical displays.

Now, the system dynamically applies the correct number format based on the
user's locale settings, ensuring a more accurate and localized experience.
(@erikgeurts
[feature request #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.8...1.1.9>

---

## 1.1.8

### What's changed ?

We enhanced the efficiency of theming by introducing two generic themes that
cover more use cases while simplifying customization. Instead of defining
multiple specific themes (e.g., battery, CPU, memory), we now provide with
1.1.7:

- `optimal_when_low` → Best when values are low (e.g., CPU/memory usage).
- `optimal_when_high` → Best when values are high (e.g., battery charge).

These new parameters allow for a more flexible and scalable way to define
themes, reducing redundancy while improving user control over the look and feel
of the card. (@erikgeurts
[feature request #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20))

📌 Support for Entities Without a Unit is live now !

In addition to these optimizations, we now extend theme compatibility to
entities without a unit of measurement. This means that even entities that do
not report a percentage or specific unit can still benefit from the new
optimal_when_low and optimal_when_high themes, ensuring broader support across
various Home Assistant entities.

✔️ Entities without a unit of measurement (e.g., status indicators, counters).
✔️ Entities where the unit is disabled (giving users more control over their
display).

These improvements make the card more adaptable, efficient, and user-friendly
while maintaining backward compatibility. 🎨🚀 (@erikgeurts
[feature request #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.7...1.1.8>

---

## 1.1.7

### What's changed ?

This update focuses on improving the visual customization of the card by
introducing new theme parameters. These changes are aimed at providing users
with more flexible and generic theme options, making it easier to manage the
appearance of the card across different scenarios. By adding these new theme
options, we aim to simplify the customization process and offer themes that can
cover a broader range of use cases, especially for devices or entities like
battery, CPU, and memory.

#### New Parameters

- **`optimal_when_low`**: A new theme parameter indicating that the optimal
  state occurs when the value is low (e.g., for memory or CPU usage, where lower
  values are better).
- **`optimal_when_high`**: A new theme parameter indicating that the optimal
  state occurs when the value is high (e.g., for battery, where a higher charge
  is better).

These new parameters replace the previous, more specific themes (e.g.,
`battery`, `cpu`, and `memory`), allowing users to define themes with less
redundancy and more flexibility. (@erikgeurts
[feature request #20](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/20))

#### Modifications to the README

- **Introduction of New Parameters**: The README has been updated to reflect the
  introduction of the new `optimal_when_low` and `optimal_when_high` parameters.
  These changes were made to improve the explanation of the theme system and
  highlight the benefits of using these more general parameters.
- **Updated Example Code**: The README now includes updated example code
  demonstrating how to use the new parameters in the configuration. This makes
  it easier for users to see how to implement the new themes in their setups.
- **Icon Handling Clarification**: We clarified that icons are automatically
  retrieved from the entity but can be overridden using the `icon` parameter.
  This allows users to customize the icon based on their preferences, providing
  greater flexibility in the visual presentation.

#### Deprecations

- **`battery`, `cpu`, and `memory` themes**: These themes are now deprecated and
  should no longer be used. While these parameters are still valid, they must be
  replaced by `optimal_when_low` or `optimal_when_high` in future
  implementations.
- **Reason for Deprecation**: The introduction of `optimal_when_low` and
  `optimal_when_high` eliminates the need for multiple, specific theme
  definitions. These new parameters are more versatile and can handle a wider
  range of use cases, simplifying the overall theme system.

---

## 1.1.6

### What's changed ?

As part of ongoing improvements, several key optimizations and fixes have been
implemented to enhance code quality, maintainability, and performance.

- decimal: Improved. Default value for timer is now 0. Because, well… it
  probably should have been from the start! 😆
- Glitch fixes:
  - Standard entity errors (Unknown, Not Found, Unavailable): Handle ellipsis
    for better readability.
  - Parameter errors (max_value, entity required...): Adjust vertical layout
- Code optimization
  - Test optimization to secure the code
  - Strengthened encapsulation to support future evolution
  - Changed tab size from 4 to 2 characters to reduce file size
  - Overall cleanup
- README: Updated.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.5...1.1.6>

---

## 1.1.5

### What's changed ?

This update brings several visual and functional enhancements to optimize the
user experience and streamline management within the editor. The following
changes have been added or improved:

- Cosmetic glitch: Fixed.
  - Updated the documentation link to ensure a consistent appearance (light
    mode).
  - Smoothened accordion animation for better transitions.
  - Improved element layout when one of the elements is hidden.
- New Editor Features:
  - `hide`: Added. This feature allows elements to be hidden within the editor,
    providing more flexibility in content management.
  - `disable_unit`: Added. This option enables the disabling of specific units
    in the editor, offering greater control over the displayed.

<img width="499" alt="Screenshot 2025-03-22 at 17 06 32" src="https://github.com/user-attachments/assets/f4058079-8625-40c0-96c3-1f86616cb3e2"
/>

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.4...1.1.5>

---

## 1.1.4

### What's changed ?

- Auto `attribute`/`max_value_attribute`: Added. The default attribute is now
  automatically selected based on the defined entity.
- Cosmetic glitch: Fixed. Updated the accordion background, color, and border
  radius for a consistent appearance.
- `decimal`: Fixed (regression). When the decimal value was set to 0, it would
  not properly override the default HA value. (@Ascathon
  [issue #7](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/7))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.3...1.1.4>

---

## 1.1.3

### What's changed ?

🌟 New Editing Interface with Integrated Accordions

I have completely redesigned the editing card by introducing an accordion system
to group options more efficiently and intuitively. 💡 Benefits:

- 📌 Closer to "tile" cards: The appearance and organization are now more
  consistent with other "tile" style cards.
- ✅ Easier to use: The interface is clearer, and settings are more accessible.
- 📈 Improved scalability: This new system is designed to facilitate adding new
  options in the future without compromising the user experience.

The code has been entirely rethought and optimized to provide an even more
efficient user experience. 🚀

- `max_value_attribute`: Added - (@saya6k
  [feature request #18](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/18))
- `attribute` list: Fixed
- `null issue`: Fixed - (@c4weddell
  [issue #19](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/19))

![editor](https://github.com/user-attachments/assets/54a2c147-fb28-4150-b9b7-bc051de6b87d)

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.2...1.1.3>

---

## 1.1.2

### What's changed ?

We’re rolling out this update to the error messages on the cards to reflect the
new style. This change brings a cleaner, more consistent look that aligns with
the latest updates in Home Assistant 2025.3. You’ll notice updated error
messages for cases like "unavailable," "not found," and "unknown" now presented
in a more compliant manner.

- Specific message (decimal error...) remains the same.
- “Unavailable”, “Not Found”, and "Unknown" states follow the design policy.

This is just another step in making your experience with this card more polished
and consistent!

![image](https://github.com/user-attachments/assets/485bb518-7fd4-4079-9b4e-509e373ec454)

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.1...1.1.2>

---

## 1.1.1

### What's changed ?

- `decimal`: Fixed. When the decimal value was set to 0, the Editor did not
  update correctly and displayed an empty string (''). Additionally, the decimal
  value was not properly applied to the card.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.1.0...1.1.1>

---

## 1.1.0

### What's changed

🥳 We are finally moving to version **1.1.0** (about time!) since the core
features planned for this card have been developed, and now we're diving into
more advanced features and use cases. It also marks the shift to the new Home
Assistant 2025.3 look & feel, with support for multiple entities: battery,
cover, timer, counter, fan, sensor... basically, if it exists, we probably
support it. 😉

- `Default action`: `more info` now works by default!
- `Shape`: Fixed. Aligned with the shiny new Home Assistant tile policy.
- `Default color` / `default icon`: Improved for `battery`, `cover`, `timer`,
  `counter`, `fan`, `sensor`...
- `Default bar color`: Matches the default icon color, because consistency is
  classy.

The result (entity-progress-card / tile):
<img width="509" alt="image" src="https://github.com/user-attachments/assets/1c2d240e-a2d9-442c-beb7-982dcbe99ebd"
/>

#### FAQ

- **Is there a breaking change?** No, none at all. All functionalities remain
  intact.
- **If I update, will my settings be ignored?** Nope! I’ve put a lot of effort
  into refining the default settings. The look has subtly evolved to be more
  consistent, but everything is still fully customizable through your color/icon
  settings.
- **Great, but if I update, I want my setup to match the example. How can I do
  that?** To match the example, you need to adjust the tap action configuration
  and set it to the default to enable standard shape handling. If you want to
  use the default colors/icons, you’ll need to remove your custom settings,
  allowing the card to decide and then fine-tune based on your needs.
- **I actually prefer having the shape all the time. How can I achieve that?**
  According to the new policy, the shape is meant to indicate interaction. For
  instance, using more_info will ensure the shape is displayed.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.52...1.1.0>

---

## 1.0.52

### What's changed

From the very beginning of this card, one of the core principles was to align as
closely as possible with the look & feel of HA cards. Since the latest HA
version 2025.3, there have been numerous valuable changes. One seemingly minor
change is the way icon shapes are handled: a shape will now be displayed around
the icon if it has a clickable action assigned. To stay aligned with the HA look
& feel while maintaining compatibility with previous versions, this update
handles the following cases:

- If HA < 2025.3 → No changes
- If HA ≥ 2025.3 → The shape will be visible if you define a click behavior
  (`navigate_to`, `show_more_info`).

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.51...1.0.52>

---

## 1.0.51

### What's changed

- bug fix: fix a null value with unavailable entity

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.50...1.0.51>

---

## 1.0.50

### What's Changed

- `disable_unit`: Fixed. (@erikgeurts
  [issue #15](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/15))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.49...1.0.50>

---

## 1.0.49

### What's Changed

- `disable_unit`: Added. (@erikgeurts
  [issue #15](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/15))
  - Disables the display of the unit when set to true. If not defined or set to
    false, the unit will be shown.
- `update documentation`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.48...1.0.49>

---

## 1.0.48

### What's Changed

- `hide`: Added Defines which elements should be hidden in the card. The array
  can contain any of the following values:
  - icon → Hides the entity's icon.
  - name → Hides the entity's name.
  - secondary_info → Hides secondary information related to the entity.
  - progress_bar → Hides the progress bar display.
- `update documentation`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.47...1.0.48>

---

## 1.0.47

### What's Changed

- `Timer support`: Improved.
  ([issue #14](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/14))
  - add `bar_orientation`: Allows the progress bar to be displayed from right to
    left, useful for timers.
- `hover effect`: Added.
  - The background color now changes when the mouse hovers over the card,
    dynamically using the icon's color.
  - This effect applies only if the card has a `navigate_to` or `show_more_info`
    parameter, ensuring a visual cue for interactive elements.
- `documentation update`
- `code cleanup`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.46...1.0.47>

---

## 1.0.46

### What's Changed

- `Timer support`: Improved.
  ([issue #14](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/14))
  - fix timer display
- `icon`: Improved. Better default icon management.
- `documentation update`
- `code cleanup`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.45...1.0.46>

---

## 1.0.45

### What's Changed

- `Timer support`: Improved. (request from @FrankJaco,
  <!-- markdownlint-disable-next-line MD013 -->
  [issue #14](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/14))
  - unit management
  - `%`: show the ratio
  - `s`: show the seconds
  - `timer`: show HH:MM:SS (standard)
  - `flextimer`: same than timer but truncate the display according to the
    current value
- `Documentation update`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.44...1.0.45>

---

## 1.0.44

### What's Changed

- `Timer support`: Improved. (request from @FrankJaco here:
  [issue #14](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/14))
  - `unit`: % or s. (fix ms issue)
  - `Badge` management: Added. Play/Pause icon according to the timer state.
  - `reverse` parameter: Added. reverse parameter to allow a countdown.
- `Documentation update`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.43...1.0.44>

---

## 1.0.43

### What's Changed

- `Timer support`: Added. Manage the timer entity state and animate the bar
  accordingly. (request from @FrankJaco here:
  [issue #14](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/14))
- `CSS`: Improved. Remove hardcoded values using parameters
- `Documentation update`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.42...1.0.43>

---

## 1.0.42

### What's Changed

- `Multi-Language Support`:
  - Added. 🇭🇷 🇵🇱 🇳🇱 🇲🇰 🇵🇹 🇩🇰 🇳🇴 🇸🇪
  - The language selection, previously handled in the server configuration, is
    now managed in the user configuration to support multilingual usage.
- `Card height`: Fixed. Occasionally appears "squashed" with @poiromaniax. (see
  [issue #12](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/12))
- `Code cleanup`:
  - Reorganize parameters for better structure.
  - Remove duplicate or unnecessary code.
  - Refactor class for improved readability and understanding.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.41...1.0.42>

---

## 1.0.41

### What's Changed

- `icon`: Added flexibility. Default icon is also selected with device_class
  _Order of Priority for the Icon:_
  - Theme/Custom Theme: The icon derived from the theme or style applied to the
    item.
  - Icon Parameter: A custom icon specifically defined for the item.
  - Icon Associated with the Entity: The icon directly linked or representative
    of the entity.
  - Icon Associated with the Entity's device_class: temperature, humidity...
  - Default: The icon used by default if no other is specified.
- `badges`: Improved. The badge system has been enhanced for better handling of
  three distinct states:
  - Description:
    1. **Unavailable**:
       - **Badge Color**: Orange
       - **Icon Color**: Grey
       - **Additional Info**: Secondary information displayed.

    2. **Not Found**:
       - **Badge Color**: Red
       - **Icon Color**: Grey
       - **Additional Info**: Secondary information displayed.

    3. **Unknown**:
       - **Badge Color**: None (no badge shown)
       - **Icon Color**: Blue
       - **Additional Info**: Secondary information displayed.
  - Example
    <img width="256" alt="badges" src="https://github.com/user-attachments/assets/ce7b186b-4baa-4d48-9ebe-9b2fc7421b35"
    />

- `Code optimisation`

---

## 1.0.40

### What's Changed

- `icon`: Added flexibility. TY @Jezza34000
  - `icon` defined in custom_theme is now optional _Order of Priority for the
    Icon:_
    - Theme/Custom Theme: The icon derived from the theme or style applied to
      the item.
    - Icon Parameter: A custom icon specifically defined for the item.
    - Icon Associated with the Entity: The icon directly linked or
      representative of the entity.
    - Default: The icon used by default if no other is specified.
- `discord server`: Created. Link in the README

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.39...1.0.40>

---

## 1.0.39

### What's Changed

- `Vertical Layout`: Fixed a minor regression (on 1.0.38) affecting the vertical
  layout styling.
- `Theme Selector`: Improved. Better design for a better experience.
- `CSS Optimization`: Added a dedicated icon class in the CSS (editor) to
  minimize unnecessary DOM modifications and improve styling consistency.
- `Code Cleanup`: Enhanced code readability and maintainability:
  - Reformatted arrays for consistency.
  - Removed unecessary comments
  - Removed last hardcoded values to improve flexibility.
  - Resolved minor syntax issues for cleaner execution.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.38...1.0.39>

---

## 1.0.38

### What's Changed

- `Entity Statuses`: Added handling for `unavailable` and `unknown` statuses.
  - Displays the status text instead of the percentage when the entity is
    unavailable or unknown.
  - Icon is greyed out, and an orange badge with an exclamation mark is shown
    for unavailable entities.

- `Error Message Style`: Fixed
  - Fixed an issue where error messages were difficult to read in themes other
    than dark mode.

- `CSS`: Improved styling by using more dynamic CSS rather than relying on
  JavaScript.

- `Performance`:
  - Offloaded more responsibilities to CSS, reducing unnecessary HTML DOM
    modifications.
  - Optimized stored objects to reduce RAM usage.
  - Added additional checks to determine if HTML updates are needed, improving
    efficiency.

- `Code Cleanup`: Improved code for better readability and maintainability.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.37...1.0.38>

---

## 1.0.37

### What's Changed

- `custom_theme`: Fixed. Under rare (and slightly amusing) circumstances, the
  evaluated value could exceed the theme's defined limits, or your custom
  theme's min/max intervals could have accidentally become incorrect, breaking
  your theme's interval continuity. 😅
  - Validation that `min` < `max`: No more topsy-turvy intervals—each range must
    make logical sense now!
  - Validation of `min`/`max` continuity: Every `max` max should flow seamlessly
    to the next min without any annoying gaps or overlaps.
  - Graceful boundary handling: If the evaluated value falls below the theme's
    defined intervals, we’ll gracefully default to the lowest definition.
    Similarly, values exceeding the theme will align with the highest
    definition.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.36...1.0.37>

---

## 1.0.36

### What's Changed

- Vertical/Horizontal `Layout`: Fixed. Simplified styles and minor bug fixes for
  better consistency.
- Horizontal `Layout`: Fixed. Now more aligned with a tile-based theme.
- `Percentage`: Fixed. Negative percentages previously caused some fun but
  unexpected visual behaviors, which have now been fixed.
- `Performance`: Improved. Optimizations for improved efficiency on bar
  animation.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.35...1.0.36>

---

## 1.0.35

### What's Changed

- `theme`: Added temperature range (temperature theme) to get a beter color
  management between -50°C and 8°C.
- `cleanup`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.34...1.0.35>

---

## 1.0.34

### What's Changed

- `custom_theme`: Added. Anticipating every possible theming need is
  unrealistic. While predefined themes cover common use cases, some scenarios
  require greater flexibility. To accommodate this, I have introduced this
  option for advanced use cases, enabling users to define custom themes tailored
  to their specific requirements.
- `Vertical layout`: Fixed. Fine-tuned to manage the vertical layout using CSS
  mechanisms.
- `JS vs CSS`: Improved. Now handles component visibility (Show/Hide) using CSS,
  reducing JavaScript execution, improving performance, and enhancing
  maintainability by leveraging native browser rendering optimizations.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.33...1.0.34>

---

## 1.0.33

### What's Changed

- Mouse pointer fix: Fixed a bug where the pointer incorrectly indicated that
  the card was clickable regardless of the configuration.
- Error handling: Added an error message when an attribute is incorrect.
- Code and performance improvements:
  - Enabled Shadow DOM for the editor to prevent style conflicts.
  - Improved CSS for better readability and maintainability.
  - Optimized some checks to speed up processing.
  - Removed the last hardcoded values.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.32...1.0.33>

---

## 1.0.32

### What's Changed

- `Theme`: Added CPU/RAM themes. Feature requested in "Consumption theme /
  battery inverse colors" by @nortuzar (see
  [issue #9](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/9))

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.31...1.0.32>

---

## 1.0.31

### What's Changed

- Performance: Avoid DOM updates when values remain unchanged.
- Customization: Added bar_size parameter.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.30...1.0.31>

---

## 1.0.30

### What's Changed

- `Theme`: Added support for `°F` in the `temperature` theme.
- `Unit`: Added automatic unit configuration based on entity attributs.
- `Documentation`: Updated and enhanced.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.29...1.0.30>

---

## 1.0.29

### What's Changed

- `Theme`:
  - Improved Temperature/Humidity themes
  - Added VOC/PM 2.5 themes
- `Documentation`: updated and improved

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.28...1.0.29>

---

## 1.0.28

### What's Changed

- `Language support`: Fixed Italian language 🇬🇧 🇪🇸 🇩🇪 🇮🇹 🇫🇷
- `Theme`: Added Temperature/Humidity theme

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.27...1.0.28>

---

## 1.0.27

### What's Changed

- `Language support`: Added Italian 🇬🇧 🇪🇸 🇩🇪 🇮🇹 🇫🇷
- `Attribute support` : Added attribute support for cover, light, fan, climate,
  humidifier, media_player, vacuum, device_tracker, and weather.
- `Code optimization`: Perform code cleanup to enhance readability, remove
  redundant code, and optimize performance.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.26...1.0.27>

---

## 1.0.26

### What's Changed

- `Editor`:
  - `Language support`: Added translated labels for Theme choices to support
    multiple languages 🇬🇧 🇪🇸 🇩🇪 🇫🇷
  - `Documentation` : Added a direct link to access the documentation.
- `Theme` improvements:
  - Fix the color scheme to match the existing battery theme.
  - When the entity provide a `battery*` icon, we use the device's charging icon
    to display its current charging status. This will provide a more visually
    informative representation of the battery level.
- `Card` Improvements: Adjust the card's corner radius to align with the
  standard Home Assistant card radius for a consistent look and feel.
- `Error Handling`: Implement more robust error handling to catch and manage
  potential errors effectively.
- `Code optimization`: Perform code cleanup to enhance readability, remove
  redundant code, and optimize performance.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.25...1.0.26>

---

## 1.0.25

### What's Changed

- `Language support`: Added translated labels for color choices to support
  multiple languages 🇬🇧 🇪🇸 🇩🇪 🇫🇷
- `Icons for Layout Options`: Added meaningful icons (`mdi-`) for layout choices
  to improve user experience.
- `Code optimization`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.24...1.0.25>

---

## 1.0.24

### What's Changed

- `Fix`: Resolved the issue described in "Card editor does one update and
  nothing else unless opened again" by @harmonie-durrant (see
  [issue #8](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/8)).
  - Split configuration management to enhance safety and prevent conflicts.
  - Simultaneous update management
- `Code Optimization`: Improved overall code performance and reduced complexity.
- `Debug mode`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.23...1.0.24>

---

## 1.0.23

### What's Changed

- `navigate_to`: fix a security-related issue when using navigate_to with an
  external URL (e.g., <http://example.com/>).

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.22...1.0.23>

---

## 1.0.22

### What's Changed

- `YAML Editor`: Dynamically refresh the visual editor with accurate parameters
  sourced from the YAML editor.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.21...1.0.22>

---

## 1.0.21

### What's Changed

- `Editor`: Reorganized configuration settings for better clarity
- `Editor`: Consolidated all settings within the visual editor, including:
  - Added `min_value`
  - Added `max_value`
  - Added `decimal`
  - Added `unit`
- `README`: Updated to reflect the changes accordingly

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.20...1.0.21>

---

## 1.0.20

### What's Changed

- `navigate_to`: add this parameter to specifie a URL to navigate to when the
  card is clicked.
- `decimal`: ⚠️ default value as been changed. ⚠️
  - Why? The default values for decimal have been carefully chosen to balance
    both functionality and aesthetics, ensuring the card remains visually
    appealing and easy to read in most cases. For percentage-based measurements,
    such as battery levels, the default is set to 0, as it is rarely meaningful
    to know the battery level down to a tenth of a percent (e.g., 82.3% vs.
    82%). This avoids unnecessary precision, keeping the display clean and
    focused. In contrast, for other units like temperatures (°C) or energy
    consumption (kWh), the default is set to 2 to provide more detailed
    information where it might actually be relevant or actionable (e.g., 23.45
    kWh). This distinction ensures that the data displayed aligns with typical
    expectations and practical usage, while allowing users the flexibility to
    customize the precision if their specific use case requires it.
  - Impact? No **real** impact if you use the decimal or HASS precisision
    parameter. The default value can be override with `decimal` parameter to
    change and customize it.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.19...1.0.20>

---

## 1.0.19

### What's Changed

`min_value`: add this parameter to define the minimum value to be used when
calculating the percentage

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.18...1.0.19>

---

## 1.0.18

### What's Changed

`More info`: Added the ability to click on the card to display additional
information. (discussion with @mill1000 & @Ascathon in
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/5>)
`Animation`: Expose the `ha-icon` and `ha-shape` elements to enable proper card
animation.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.17...1.0.18>

---

## 1.0.17

### What's Changed

- `decimal`: fix this parameter to define the number of decimal places to
  display for numerical values. Discussion with @Ascathon in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/7>

Defines the number of decimal places to display for numerical values. The
decimal value will be determined based on the following priority:

- Display Precision from the entity (if defined in Home Assistant).
- decimal setting in the YAML configuration.
- Default Value (if no other value is set).

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.16...1.0.17>

---

## 1.0.16

### What's Changed

- `decimal`: add this parameter to define the number of decimal places to
  display for numerical values. Discussion with @Ascathon in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/7>
- `code cleanup`: rebuild internal check to improve the scalability

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.15...1.0.16>

---

## 1.0.15

### What's Changed

- `CSS`: fix Extra padding around card when placed in section with width of 2 or
  more in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/6>
- `Language support`: translate the layout choice 🇬🇧 🇪🇸 🇩🇪 🇫🇷
- `Theme`: merge the logic btw `Battery` and `Light` and make it scalable
- `code cleanup`
- `repository cleanup`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.14...1.0.15>

---

## 1.0.14

### What's Changed

- `Unavailable status`: Check the current entity/entities status and display an
  unavailability message if the entity/entities is unavailable
- `Bug fix`: Fix the Theme logic to avoid issue with max_value
- `Bug fix`: Fix custom unit by @harmonie-durrant in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/4>
- `README`: Add README images by @harmonie-durrant in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/4>
- `README`: Improve parameter description
- `Code cleanup`

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.13...1.0.14>

---

## 1.0.13

### What's Changed

- `max_value`: use another entity to define dynamically the max_value requested
  in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/3>
- `unit`: we are able to change the default unit - '%' -> 'XYZ' (nice suggestion
  from @harmonie-durrant)
- `error message`: logic improvement
- `README`: Enhance the README by providing a clearer explanation of the
  parameter types and their expected values.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.12...1.0.13>

---

## 1.0.12

### What's Changed

- `Language Support`: Added German 🇩🇪 to the interface.
- `Editor Enhancements`: improved error messages.
- `Optimization`: Improved logic to eliminate unnecessary refresh.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.11...1.0.12>

---

## 1.0.11

### Bug fix

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.10...1.0.11>

---

## 1.0.10

### What's Changed

- Language: take current language information from HA config 🇬🇧 🇪🇸 🇫🇷
- Percentage label: Limit 2 digits digits after the decimal point. TY Hypfer !
- max_value: to manage a stndard value and build a percentage.
- New theme: Add light theme 💡 by @harmonie-durrant in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/2>

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.9...1.0.10>

---

## 1.0.9

### What's Changed

- Automatically adapts to the user's language for error messages and
  descriptions, ensuring a localized experience. 🇬🇧 🇪🇸 🇫🇷
- HACS better support by @harmonie-durrant in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/1>

### New Contributors

- @harmonie-durrant made their first contribution in
  <https://github.com/francois-le-ko4la/lovelace-entity-progress-card/pull/1>

TY!

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.8...1.0.9>

---

## 1.0.8

### What's New and Improved

- `CSS`: Resolved CSS issues for the vertical layout, ensuring better display
  and functionality.
- `Layout size`: Synchronized `getCardSize()` and `getLayoutOptions()` to ensure
  the layout size dynamically adapts to the selected layout for improved
  consistency and accuracy.
- `Enhanced README Documentation`: Added a YAML example demonstrating how to
  configure the vertical layout for easier implementation.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.7...1.0.8>

---

## 1.0.7

### What's New and Improved

- `Added layout Parameter`: Now you can customize the arrangement of elements
  within the card! Choose between a `horizontal` or `vertical` layout to match
  your design preferences and create visually appealing displays. Whether you
  prefer a side-by-side layout or a stacked configuration, the choice is yours.

- `Enhanced README Documentation`: We've expanded the README with practical use
  cases and detailed examples to help you get the most out of the card. Whether
  you're new to Home Assistant or a seasoned user, these additions will guide
  you through configuring and customizing your card effortlessly.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.6...1.0.7>

---

## 1.0.6

### What's New and Improved

- Editor: Enhanced YAML management, automatically removing empty keys.
- Entity (Editor): Use ha-entity-picker for a smoother user experience.
- Theme (Editor): Added a theme selection dropdown.
- Theme: Improved theme management for better flexibility.
- Size: Improved the default card size for better appearance and usability.
- Code Cleanup: Refined code structure and removed redundancies.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.5...1.0.6>

---

## 1.0.5

### What's New and Improved

- Introduced a Battery Theme: Simplifies creating a battery dashboard by
  automatically applying appropriate iconography and colors without requiring
  Jinja2 coding.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.4...1.0.5>

---

## 1.0.4

### What's New and Improved

This version introduces significant changes aimed at improving performance,
error handling, and code readability. Below are the key updates:

- `Centralized DOM References`: Introduced the _elements property to store
  references to DOM elements. This allows for more efficient and organized
  updates to the card's components.
- `Optimized Card Construction`:
  - Added the _isBuilt flag to prevent unnecessary card reconstruction after the
    initial configuration.
  - The card's content is only built once, even during successive updates.
- `Dynamic Element Updates`
  - New _updateDynamicElements method to dynamically update card elements (icon,
    name, progress bar, percentage, etc.) based on the entity state.
  - New _updateElement method to centralize and simplify the logic for updating
    individual elements.
- `Improved Error Handling`: Added a ha-alert component to display user-friendly
  error messages if the specified entity is not found in the configuration.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.3...1.0.4>

---

## 1.0.3

### Improvements and Enhancements

This release introduces significant improvements to the codebase and user
experience:

- `Code`: Cleanup and refactoring
- `Enhanced Editor Interface`: Added a color list to pick a standard color.
  Improved performance with fragment strategy.
- `Browser console`: This module creates an info event to log the card's status,
  providing feedback on its version and README access.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.2...1.0.3>

---

## 1.0.2

### Improvements and Enhancements

This release introduces significant improvements to the codebase and user
experience:

- Code Cleanup: Streamlined the code by removing redundancies and improving
  structure for better maintainability and performance.
- Less Aggressive Rendering: Optimized the rendering process to reduce
  unnecessary refreshes, ensuring smoother performance.
- Enhanced Editor Interface: Updated the editing interface for a more responsive
  and natural user experience, improving usability and efficiency.

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.1...1.0.2>

---

## 1.0.1

- improve the README
- clean the code
- add hacs.json

**Full Changelog**:
<https://github.com/francois-le-ko4la/lovelace-entity-progress-card/compare/1.0.0...1.0.1>

---

## 1.0.0

**Full Changelog**:
<https://github.com/francois-le-ko4la/hass-entity-progress-card/commits/1.0.0>

<!-- Links -->

[Supported HTML]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#supported-html
[Theme Guide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/theme.md
[Deprecated Options]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/troubleshooting.md#deprecated-options
[bar_stack]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_stack
[max_value]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#max_value
[demo-dashboard.yaml]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/demo-dashboard.yaml
[demo-dashboard-dev.yaml]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/demo-dashboard-dev.yaml
[demo-dashboard-helpers.yaml]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/demo-dashboard-helpers.yaml
[hide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#hide
[Card types]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#standard
[bar_color_mode]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_color_mode
[bar_segments]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_segments
[icon_animation]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#icon_animation
[alert_when]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#alert_when
[min_value]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#min_value
[center_zero]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#center_zero
[watermark]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#watermark
[bar_scale]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_scale
[multiline]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#multiline
[bar_max_width]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_max_width
[bar_orientation]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#bar_orientation
[text_shadow]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#text_shadow
[interpolate]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/configuration.md#interpolate
