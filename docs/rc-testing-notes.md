## What's new

A lot has changed under the hood — and on the surface. From a fully
WebAwesome-compatible editor to live watermarks, smoother animations, and
cleaner docs, this release makes the card feel right at home in any Home
Assistant setup.

I would have loved to include more features in this release, but the
WebAwesome migration forced me to prioritize and ship this update sooner
than originally planned.

### 🧩 WebAwesome Compatibility

Starting with HA 2026.2.x, Home Assistant introduced significant changes as
part of the migration to Webawesome. With 2026.3.x, the select component in the
visual editor is broken — options can no longer be selected.
**Cards/badges are not affected by this Home Assistant update.**
The visual editor has been updated to use the latest Home Assistant UI
components, fully compatible with the new WebAwesome framework introduced in
recent HA versions.

What this means for you:

- The editor now looks and feels consistent with the rest of Home Assistant's UI
- Fields respond correctly to your HA theme (light/dark mode, accent colors)
- Full compatibility with both the old and new HA frontend architecture

### ⚡ Faster Tap Response

Immediate action on single tap ! Previously, every tap was delayed by 300ms to
wait for a potential double tap — even when no double_tap_action was configured.
This caused a noticeable lag when opening more-info or triggering any tap
action. The card now detects at startup whether a double tap action is
configured. If not, tap actions fire immediately with no delay, matching the
responsiveness of native HA cards.

### ✨ Smoother Interactions

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
(RkcCorian)

### 🎨 Smooth Color Transitions

New `interpolate` option for custom themes: When using a custom_theme, you can
now enable smooth color transitions between steps. Instead of jumping abruptly
from one color to the next, the icon and progress bar will gradually blend from
one color to the other as the value changes.

➡️ [Enhancement]: Smooth color interpolation between custom_theme ranges #96
(@diegocjorge)

### ✨ New Bar Effects: shimmer_reverse and gradient_reverse

Two new visual effects are now available as companions to the existing `shimmer`
and `gradient` effects.

- `shimmer_reverse` — same shimmering animation as shimmer, but running in the
  opposite direction.
- `gradient_reverse` — same color gradient as gradient, but fading in the
  opposite direction.

These new effects are independent from `bar_orientation` — you can combine them
freely to achieve the exact visual result you want.

### 💧 Dynamic Watermarks: Compare your entity against another sensor

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

### 📏 Progress Bar Max Width (bar_max_width)

Control the width of your horizontal progress bars !
You can now cap that width to keep bars more compact or visually balanced.

```yaml
type: custom:entity-progress-card
bar_max_width: 120px
```

➡️ Discord @RKT62

### 🛠️ Other improvements

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

### 🌍 Multilingual support: Easier to contribute

All translations have been moved to dedicated JSON files under
`./translations/`. If you'd like to add a new language or fix an existing
translation, you no longer need to touch any code — just edit or create a simple
JSON file and submit a pull request.

➡️ Want to help translate the card into your language? Check out the
`contributing.md` guide for instructions.

### 📚 Documentation

- update documentation
