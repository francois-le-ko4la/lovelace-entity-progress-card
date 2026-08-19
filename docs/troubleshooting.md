# 🚨 Errors, Deprecations & Troubleshooting

Not all errors are the same — and not every issue means something is broken.

This card is designed to gracefully handle common errors in your Lovelace
configuration or entity state. These are usually minor and expected, and the
card will notify you directly in the UI when they occur (for example, a missing
entity or invalid value).

However, you might encounter a real bug — something unexpected that breaks
functionality and requires further investigation. That’s where troubleshooting
comes in.

## ❗ Error handling

This card includes error handling to prevent visual issues and ensure the UI
stays clean and stable. We handle two main categories of errors in the card:

1. **Configuration Errors** These occur when the card is incorrectly set up in
   the Lovelace config. Examples:
   - Missing entity ID
   - Invalid or unsupported attributes
   - Incorrect min/max values

2. **Runtime Errors (Entity State Issues)** These happen while the card is
   running and are related to the entity’s current state. Examples:
   - Entity is not found, unavailable or offline
   <details>
   <summary><strong>Show the screenshot (click to expand)</strong></summary>
   <!-- markdownlint-disable-next-line MD013 -->
   <img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/errors.png" alt="errors" width="1000px"/>
   </details>

<a id="deprecated-options"></a>

## ⚠️ Deprecated Options

### 📋 What's removed or deprecated

Over time, some configuration options have been deprecated in favor of more
flexible or clearer alternatives. While the card tries to maintain backward
compatibility, these options may stop working in future releases.

In the development of this card, we strive to avoid breaking changes as much as
possible. When such changes are unavoidable, we do our best to support and guide
users through the transition.

In this context, we have two types of deprecated options:

- **Removed**: These were removed to prevent duplication and potential conflicts
  with the new system. It was important to remove them for stability reasons.
- **Deprecated** but still active options: These options may have been used in
  many different cards, and migrating them requires reviewing the configurations
  of all those cards. Therefore, we allow time before disabling them, provide a
  system to detect if you are affected, and will remove them later.

| Option / Value                | Status         | Replacement / Recommended Action                              | Since version | Current Behavior                               |
| ----------------------------- | -------------- | ------------------------------------------------------------- | ------------- | ---------------------------------------------- |
| `navigate_to`                 | **Removed**    | Use `tap_action: navigate`                                    | `v1.2.0`      | Ignored, console warning                       |
| `show_more_info`              | **Removed**    | Use `tap_action: more-info`                                   | `v1.2.0`      | Ignored, console warning                       |
| `theme: 'battery'`            | **Deprecated** | Use `optimal_when_high`                                       | `v1.1.8-11`   | Still works, shows warning                     |
| `theme: 'cpu'`                | **Deprecated** | Use `optimal_when_low`                                        | `v1.1.8-11`   | Still works, shows warning                     |
| `theme: 'memory'`             | **Deprecated** | Use `optimal_when_low`                                        | `v1.1.8-11`   | Still works, shows warning                     |
| `max_value: <entity id>`      | **Deprecated** | Use `max_value: { entity: <id>, attribute: <optional> }`      | `v1.6.0`      | Auto-migrated for the session, console warning |
| `max_value_attribute`         | **Deprecated** | Fold into `max_value: { entity, attribute }`                  | `v1.6.0`      | Auto-migrated for the session, console warning |
| `disable_unit`                | **Deprecated** | Use `hide: ['unit', ...]`                                     | `v1.6.0`      | Auto-migrated for the session, console warning |
| `additions`                   | **Deprecated** | Use `bar_stack: { mode: 'proportional', entities: [...] }`    | `v1.6.0`      | Auto-migrated for the session, console warning |
| `watermark.low: <entity id>`  | **Deprecated** | Use `watermark.low: { entity: <id>, attribute: <optional> }`  | `v1.6.0`      | Auto-migrated for the session, console warning |
| `watermark.high: <entity id>` | **Deprecated** | Use `watermark.high: { entity: <id>, attribute: <optional> }` | `v1.6.0`      | Auto-migrated for the session, console warning |
| `watermark.low_attribute`     | **Deprecated** | Fold into `watermark.low: { entity, attribute }`              | `v1.6.0`      | Auto-migrated for the session, console warning |
| `watermark.high_attribute`    | **Deprecated** | Fold into `watermark.high: { entity, attribute }`             | `v1.6.0`      | Auto-migrated for the session, console warning |

<details>
<summary><strong>Show the screenshot (click to expand)</strong></summary>
<!-- markdownlint-disable-next-line MD013 -->
<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/deprecated.png" alt="deprecated" width="1000px"/>
</details>

### 🔄 How migration works

You don't have to rewrite anything by hand:

- **Deprecated** options (table above) keep working exactly as before — the card
  understands them internally and applies the modern equivalent automatically,
  whether or not you ever open the editor.
- **Removed** options (`navigate_to`, `show_more_info`) have had no effect for a
  long time already; migrating just cleans them up rather than guessing a
  replacement for something that hasn't run in years.

When you open the visual editor on a card that still uses a legacy option, a
**Migrate config** button appears in the top-right corner. One click rewrites
your YAML to the current syntax — the rendered card doesn't change, only how
it's written.

As with any edit: check that the card still looks right, and that the values it
displays match what you expect, before saving the dashboard.

## 🐞 Troubleshooting

### Introduction

Despite all efforts to provide a stable and bug-free card, you might still
encounter an issue.

> [!IMPORTANT]
>
> **Don't panic! And above all, do not delete your dashboards!**
>
> This card **does not alter** your existing configuration. It only displays
> entities — nothing is modified, removed, or broken in your actual setup.

<a id="browser-compatibility"></a>

### 🌐 Browser Compatibility

Some issues aren't a bug — the browser is simply below the supported version.

|      Platform       |        Browsers        |                    |                          |                        |                      |
| :-----------------: | :--------------------: | :----------------: | :----------------------: | :--------------------: | :------------------: |
|   ![HA][ha-logo]    | ![Chrome][chrome-logo] | ![Edge][edge-logo] | ![Firefox][firefox-logo] | ![Safari][safari-logo] | ![Opera][opera-logo] |
| **Home Assistant**  |       **Chrome**       |      **Edge**      |       **Firefox**        |       **Safari**       |      **Opera**       |
|      `2024.0+`      |         `98+`          |       `98+`        |          `94+`           |        `15.4+`         |        `84+`         |
| Full visual effects |         `111+`         |       `111+`       |          `113+`          |        `16.2+`         |        `97+`         |

- **First row** — functional minimum: the card loads and works.
- **Second row** — a few purely decorative touches (icon tint, alert/ping pulse,
  bar gradient sheen) need these newer versions; below that they just degrade
  gracefully, same information, less vivid. See the [graphic effects
  compatibility overview] for exactly what's affected on which browser.
- **Older Chromium (e.g. Chrome 92, common on embedded/kiosk panels)** — best
  effort only: the card itself loads and works (see [issue #128]), but matching
  this version isn't a guarantee, just a courtesy where it's cheap.

### ✅ What to do?

#### Try common quick checks first

- **Already on the latest version?**  
  ➡️ Check your installed version against the [latest release] — HACS flags an
  update when one is available. HACS can lag before it shows a new release
  though: if your version looks outdated but no update is offered, open the card
  in HACS and use **⋮ → Redownload** to force a fresh install of the current
  release rather than waiting.
- **A pre-release (RC) already fixes it?**  
  ➡️ Patches and new features often ship first as a release candidate
  (`x.y.z-rcN`) before the stable release. Check [all releases] (includes
  pre-releases) — your issue may already be fixed there.
- **Card not loading?**  
  ➡️ Ensure the resource is properly added to Lovelace.
- **HACS not detecting the card?**  
  ➡️ Try clearing your browser cache or restarting Home Assistant.
- **Card missing gradients/pulse animations, or looks a bit flat?**  
  ➡️ Likely just an older browser — see
  [Browser Compatibility](#browser-compatibility) above.
- **Card not rendering, a `Cannot use 'import.meta' outside a module` error, or
  pop-ups (e.g. browser_mod) freezing?**  
  ➡️ Your resource is registered as a classic **"JavaScript"** type (deprecated
  by Home Assistant) instead of **"JavaScript Module"**. HA loads classic
  scripts differently, and older builds couldn't survive it — the card failed to
  load and could freeze browser_mod pop-ups (see [issue #108]). **Fix:**
  Settings → Dashboards → ⋮ → Resources, open the entry, set **Resource type →
  JavaScript Module**, then hard-refresh. (Recent builds load correctly either
  way and print a console warning when they detect the classic type.)
- **Still not working?**  
  ➡️ Open your browser’s JavaScript console to check for any errors.

<!-- prettier-ignore-start -->
<!-- markdownlint-disable MD007 MD022 MD023 -->

   <details>
   <summary> How to open the JavaScript console (click to expand)</summary>

  #### 🦊 Firefox

  - **Method 1: Keyboard Shortcut**
    - Press **`F12`** or **`Ctrl`** + **`Shift`** + **`K`** (Mac: **`⌘`** +
      **`⌥`** + **`K`**)
  - **Method 2: Menu Navigation**
    - Click the **`≡`** menu button (top-right)
    - Go to **Web Developer** → **Web Console**

  #### 🌐 Chrome / Chromium

  - **Method 1: Keyboard Shortcut**
    - Press **`F12`** or **`Ctrl`** + **`Shift`** + **`J`** (Mac: **`⌘`** +
      **`⌥`** + **`J`**)
  - **Method 2: Menu Navigation**
    - Click the **`⋮`** three-dot menu (top-right)
    - Go to **More tools** ➡️ **Developer tools**
    - Select the **Console** tab

  #### 🧭 Safari

  - **Method 1: Keyboard Shortcut**
    - Press Mac: **`⌘`** + **`⌥`** + **`C`**
  - **Method 2: Menu Navigation**  
    Enable the Develop menu first (if not already enabled):
    - Go to **Safari** ➡️ **Preferences** ➡️ **Advanced**
    - Check **Show Develop menu in menu bar**
    - Click **Develop** ➡️ **Show JavaScript Console**

  #### 🐘 Opera

  - **Method 1: Keyboard Shortcut**  
    Press **`Ctrl`** + **`Shift`** + **`I`** (Mac: **`⌘`** + **`⌥`** + **`I`**)
  - **Method 2: Menu Navigation**  
    Click the O menu button (top-left)  
    Go to **Developer** ➡️ **Developer tools**  
    Select the **Console** tab

  #### 🧱 Edge

  - **Method 1: Keyboard Shortcut**  
    Press **`F12`** or **`Ctrl`** + **`Shift`** + **`I`** (Mac: **`⌘`** +
    **`⌥`** + **`I`**)
  - **Method 2: Menu Navigation**  
    Click the **`⋯`** three-dot menu (top-right)  
    Go to **More tools** ➡️ **Developer tools**  
    Select the **Console** tab

  </details>

<!-- markdownlint-enable MD007 MD022 MD023 -->
<!-- prettier-ignore-end -->

#### Gather some useful information

- Home Assistant version
- Browser used
- YAML configuration snippets (if relevant)
- Any visible error messages (from the console or logs)

#### 🩺 Run the built-in diagnostic

The card ships with a small diagnostic helper that collects most of the
information above in one shot. Open your browser's developer console (`F12` or
`Ctrl`/`Cmd` + `Shift` + `I`, then the **Console** tab) on a dashboard that has
the card, and run:

```js
EPB_DIAG.dump();
```

It prints an anonymized report — card and Home Assistant versions, browser, dark
mode / reduced motion status, registered card types, and whether the required HA
components (`ha-card`, `ha-selector`, `action-handler`) are present — ready to
copy/paste into your issue.

It also flags a **duplicate resource load** on its own
(`duplicate load: ⚠️ YES`) — a common, hard-to-diagnose cause of erratic
behavior where the card ends up installed **twice** (e.g. via HACS _and_ a
leftover manual resource in **Settings → Dashboards → Resources**). If you see
this warning, remove the extra resource entry first — it resolves most
"impossible to reproduce" issues on its own.

#### 🔎 Enable debug logging (`?debug=…`)

For harder cases, the card can print detailed per-area logs to the browser
console — no special build required. Add a `?debug=…` query to the card's
resource URL in **Settings → Dashboards → ⋮ → Resources**, e.g.:

```text
/hacsfiles/lovelace-entity-progress-card/entity-progress-card.js?debug=card,registration
```

Reload the page (a hard refresh, `Ctrl`/`Cmd` + `Shift` + `R`). A console
warning confirms which areas are active. Available areas (comma-separated, or
`all`):

| Area                 | What it logs                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `card`               | Card lifecycle — connect / disconnect / **document move** / config / refresh, with timing |
| `registration`       | Custom-element registration order, duplicates, and card-picker entries                    |
| `instances`          | A per-class object-creation counter (spot leaks / over-rendering)                         |
| `interference`       | When **another module** changes this card's host element from outside                     |
| `editor`             | The visual editor: config in, `config-changed` out                                        |
| `interactionHandler` | tap / hold / double-tap action resolution                                                 |
| `hass`               | First hass, HA core version, language changes                                             |
| `ressourceManager`   | Timers / listeners / template subscriptions                                               |

For a card that misbehaves only when other cards/modules are present,
`?debug=card,registration,interference` is the most useful combination — it
shows lifecycle churn, registration problems, and outside interference at once.
Copy the console output into your issue.

> [!NOTE]
>
> `?debug=…` only turns logging on — it changes nothing else, and has no effect
> when the query is absent. Remove it once you're done.

#### Open an issue on GitHub

You don’t need to be a developer to report an issue! Whether you're a beginner
or an advanced user, your feedback is valuable!

- Before creating a new issue, please first
  **[check existing issues](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues)**
  to see if the problem has already been reported.
- If not, feel free to
  **[submit a new issue](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues)**
  with all the relevant information.

> [!NOTE]
>
> When opening an issue, try to include as much information as possible.
>
> The more context you provide, the faster and more accurately I can help -
> we’ll troubleshoot it together!
>
> To help you out, I’ve set up a simple system that asks you the right questions
> and guides you through the process of creating a useful issue.

  <details>
  <summary><strong>Show the screenshot (click to expand)</strong></summary>
  <!-- markdownlint-disable-next-line MD013 -->
  <img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/images/create_issue.png" alt="create issue" width="750px"/>
  </details>

#### (Optional) roll back

If you recently **updated** the card and the issue started afterward, you can:

- roll back to the **previous working version** using HACS;
- check if a **patch** or fix is already available;
- wait for an update — your dashboards will remain intact.

---

_This troubleshooting guide is inspired by open source best practices._

[latest release]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/releases/latest
[all releases]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/releases
[issue #108]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/108
[issue #128]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/128
[graphic effects compatibility overview]:
  https://htmlpreview.github.io/?https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/docs/graphic-effects-compatibility.html
[ha-logo]: https://avatars.githubusercontent.com/u/13844975?s=64&v=4
[chrome-logo]:
  https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_64x64.png
[edge-logo]:
  https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_64x64.png
[firefox-logo]:
  https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_64x64.png
[safari-logo]:
  https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_64x64.png
[opera-logo]:
  https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_64x64.png
