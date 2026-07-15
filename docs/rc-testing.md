# 🧪 Testing a Release Candidate (RC) – Safely

We provide a process designed to be as safe as possible, but please always
verify your backups before proceeding.

> [!WARNING]
>
> **Development Status**
>
> - Release candidate version - not intended for production use
> - Potential bugs and instabilities may occur
> - Features subject to change before final release
> - Thorough testing required before wider deployment

> [!IMPORTANT]
>
> Join the Discord server and go to the #rc-testing channel to:
>
> - Get the latest release candidate info
> - Ask questions and get help from the maintainers and community
> - Check for known issues or required changes

## 🚦 Two ways to test

- **[Method 1 — HACS pre-release](#-method-1--hacs-pre-release-quick-production-install)**:
  installs the RC directly on your production setup, through HACS itself.
  Quickest option, and open to anyone — but it does update your live
  installation, so make sure you have a backup.
- **[Method 2 — Manual isolated install](#-method-2--manual-isolated-install-side-by-side-zero-risk)**:
  the RC runs side-by-side with your stable card, under a different type
  (`custom:entity-progress-card-dev`), with zero risk to your production config.
  Better suited for deeper testing, or if you'd rather not touch your live setup
  at all.

Both are equally welcome — pick whichever fits how you like to test.

### ⚡ Method 1 — HACS pre-release (quick, production install)

> [!WARNING]
>
> This installs the RC over your current version, like any normal HACS update.
> Make sure you have a recent backup/snapshot of your Home Assistant config
> before proceeding, and expect to roll back if something breaks.

#### ⬇️ Install the RC version

- go into the repository in HACS ➡️ click ⋮ (upper right) ➡️ choose
  **Redownload** ➡️ choose **"Need a different version?"**
- The release candidate (e.g. `x.y.z-rcN`) now shows up as a pre release
- Install it like you would any other update, then reload the browser cache
  (**`CTRL`** + **`F5`** or clear cache).

#### 🧪 Test the RC Card in Lovelace

This RC build is the same `custom:entity-progress-card` type as the stable
release — there's no separate `-dev` type here, and nothing to duplicate or
change in your YAML. Your existing cards are already running the RC as soon as
HACS finishes updating.

#### 🧼 Cleanup / Rolling back

If you want to go back to the stable version then use **Redownload** and pick
the latest stable version.

### 🧰 Method 2 — Manual isolated install (side-by-side, zero risk)

> [!WARNING]
>
> To avoid interfering with your HA environment or HACS-installed versions, **do
> not** overwrite the HACS installation. Instead, follow this isolated setup
> process.

#### ⬇️ Install the RC version

We recommend separating the RC version from your main setup by creating a
dedicated test folder.

##### 📁 Create a Test Directory

In your Home Assistant config folder, create a `test` folder.

```sh
mkdir -p config/www/test/
```

> [!NOTE]
>
> This allows for clean separation between official HACS components and manually
> tested files.

##### ⬇️ Download and Add the RC version

- Download the file `entity-progress-card.js` (RC version) to the
  `/config/www/test/` directory in your Home Assistant setup.
- Open the file in a text editor and check the `CARD_CONTEXT` block near the
  top:

  ```js
  const CARD_CONTEXT = {
    dev: true,
    ...
  };
  ```

  `dev: true` is what registers the extra `custom:entity-progress-card-dev`
  type, on top of the regular one — it's what keeps this file isolated from your
  production install. If it reads `dev: false`, set it to `true` yourself and
  save the file before continuing.

- Add `/local/test/entity-progress-card.js` to your Lovelace resources:
  - Go to **Settings** ➡️ **Dashboards** ➡️ **Resources** ➡️ **`⋮`** ➡️ **Add
    Resource**
  - Set:
    - URL: `/local/test/entity-progress-card.js`
    - Type: `JavaScript Module`
  - Save
  - reload the browser cache (**`CTRL`** + **`F5`** or clear cache).

#### 🧪 Test the RC Card in Lovelace

##### How to use the RC version

We strongly recommend duplicating an existing card and modifying only the type.

Your original card:

```yaml
type: custom:entity-progress-card
```

Copy a card or create your test card with:

```yaml
type: custom:entity-progress-card-dev
```

This allows side-by-side testing of the stable and RC versions.

#### 🧼 Cleanup (Optional)

Once you're done testing:

- Remove the resource definition
- Delete the entity-progress-card-dev.js file from /www/test/

## ✅ Testing Checklist

A standard checklist, whichever method you used:

- [ ] Card loads without errors
- [ ] All existing features work as expected
- [ ] New RC features function properly
- [ ] No console errors in browser dev tools
- [ ] Performance is ok
- [ ] Mobile/tablet display works correctly

## 📝 Providing Feedback

Feedback will be done on Discord only. When reporting issues, please include:

- Home Assistant version
- Browser type and version
- Console error messages (if any)
- Card configuration that causes issues
- Screenshots of unexpected behavior
