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

Import [`docs/demo-dashboard.yaml`](demo-dashboard.yaml) and move the sliders to
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
