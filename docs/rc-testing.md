# 🧪 Testing a Release Candidate (RC) – Safely

We provide a process designed to be as safe as possible, but please always verify your backups before proceeding.

> [!WARNING]
> **Development Status**
>
> - Release candidate version - not intended for production use / Avoid use on critical production machines
> - Potential bugs and instabilities may occur
> - Features subject to change before final release
> - Thorough testing required before wider deployment

> [!IMPORTANT]
> Join the Discord server and go to the #rc-testing channel to:
>
> - Get the latest release candidate info
> - Ask questions and get help from the maintainers and community
> - Check for known issues or required changes

> [!WARNING]
> To avoid interfering with your HA environment or HACS-installed versions,
> **do not** overwrite the HACS installation. Instead, follow this isolated setup process.

## ⬇️ Install the RC version

We recommend separating the RC version from your main setup by creating a dedicated test folder.

### 📁 Create a Test Directory

In your Home Assistant config folder, create a `test` folder.

```sh
mkdir -p config/www/test/
```

> [!NOTE]
> This allows for clean separation between official HACS components and manually tested files.

### ⬇️ Download and Add the RC version

- Download the file `entity-progress-card.js` (RC version) to the
    `/config/www/test/` directory in your Home Assistant setup.
- Add `/local/test/entity-progress-card.js` to your Lovelace resources:
  - Go to **Settings** ➡️ **Dashboards** ➡️ **Resources** ➡️ **`⋮`** ➡️ **Add Resource**
  - Set :
    - URL: `/local/test/entity-progress-card.js`
    - Type: `JavaScript Module`
  - Save
  - reload the browser cache (**`CTRL`** + **`F5`** or clear cache).

## 🧪 Test the RC Card in Lovelace

### How to use the RC version

We strongly recommend duplicating an existing card and modifying only the type.  

Your original card use:

```yaml
type: custom:entity-progress-card
```

Copy a card or create your test card with:

```yaml
type: custom:entity-progress-card-dev
```

This allows side-by-side testing of the stable and RC versions.

### ✅ Testing Checklist

A standard checklist:

- [ ] Card loads without errors
- [ ] All existing features work as expected
- [ ] New RC features function properly
- [ ] No console errors in browser dev tools
- [ ] Performance is ok
- [ ] Mobile/tablet display works correctly

### 📝 Providing Feedback

Feedback will be done on Discord only. When reporting issues, please include:

- Home Assistant version
- Browser type and version
- Console error messages (if any)
- Card configuration that causes issues
- Screenshots of unexpected behavior

## 🧼 Cleanup (Optional)

Once you're done testing:

- Remove the resource definition
- Delete the entity-progress-card-dev.js file from /www/test/
