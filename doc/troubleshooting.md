# 🚨 Error handling & Troubleshooting

Not all errors are the same — and not every issue means something is broken.

This card is designed to gracefully handle common errors in your Lovelace configuration or entity state. These are usually minor and expected, and the card will notify you directly in the UI when they occur (for example, a missing entity or invalid value).

However, you might encounter a real bug — something unexpected that breaks functionality and requires further investigation. That’s where troubleshooting comes in.

## ❗ Error handling

This card includes error handling to prevent visual issues and ensure the UI
stays clean and stable. We handle two main categories of errors in the card:

1. **Configuration Errors**
    These occur when the card is incorrectly set up in the Lovelace config.
    Examples:

    - Missing entity ID
    - Invalid or unsupported attributes
    - Incorrect min/max values

2. **Runtime Errors (Entity State Issues)**
    These happen while the card is running and are related to the entity’s
    current state. Examples:
    - Entity is not found, unavailable or offline

<img src="https://raw.githubusercontent.com/francois-le-ko4la/lovelace-entity-progress-card/main/doc/errors.png" alt="Image title" width="500px"/>

## 🐞 Troubleshooting

### Introduction

Despite all efforts to provide a stable and bug-free card, you might still encounter an issue.  

> [!IMPORTANT]
> **Don't panic! And above all, do not delete your dashboards!**  
>
> This card **does not alter** your existing configuration. It only displays entities — nothing is modified,
> removed, or broken in your actual setup.

### ✅ What to do?

#### Try common quick checks first

- **Card not loading?**  
 ➡️ Ensure the resource is properly added to Lovelace.
- **HACS not detecting the card?**  
 ➡️ Try clearing your browser cache or restarting Home Assistant.
- **Still not working?**  
 ➡️ Open your browser’s JavaScript console to check for any errors.  
  <details>
  <summary> How to open the JavaScript console (click to expand)</summary>

  #### 🦊 Firefox

  - **Method 1: Keyboard Shortcut**
    - Press `F12` or `Ctrl + Shift + K` (Mac: `Cmd + Option + K`)
  - **Method 2: Menu Navigation**
    - Click the ≡ menu button (top-right)
    - Go to **Web Developer** → **Web Console**


  #### 🌐 Chrome / Chromium

  - **Method 1: Keyboard Shortcut**
    - Press `F12` or `Ctrl + Shift + J` (Mac: `Cmd + Option + J`)
  - **Method 2: Menu Navigation**
    - Click the ⋮ three-dot menu (top-right)
    - Go to **More tools** → **Developer tools**
    - Select the **Console** tab

  </details>

#### Gather some useful information

- Home Assistant version
- Browser used
- YAML configuration snippets (if relevant)
- Any visible error messages (from the console or logs)

#### Open an issue on GitHub

- Before creating a new issue, please first **check existing issues**
 [here](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues) to see if the problem has
 already been reported.  
- If not, feel free to submit a new issue with all the relevant information.

#### (Optional)

If you recently **updated** the card and the issue started afterward, you can:

- roll back to the **previous working version** using HACS;
- check if a **patch** or fix is already available;
- wait for an update — your dashboards will remain intact.
