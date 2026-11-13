# Testing a Release Candidate (RC)

A release candidate (RC) is the next version, published as a pre-release before
everyone gets it. Testing it helps catch problems before the stable release.

> [!WARNING]
>
> An RC may contain bugs, and its features can still change before the stable
> release. Make sure you have a recent backup of Home Assistant before you
> install one.

## Install the RC

The RC installs like any update, over your current version: your existing cards
run it right away, with nothing to change in their YAML.

- **HACS** (Home Assistant before 2026.11): **HACS** in the sidebar, search for
  the card, then **⋮** ➡️ **Redownload** ➡️ **Need a different version?**, and
  pick the release candidate (`x.y.z-rcN`).
- **Marketplace** (HACS's name from Home Assistant 2026.11): **Settings** ➡️
  **Marketplace**, search for the card, then **⋮** ➡️ **Install another
  version**, and pick the release candidate (`x.y.z-rcN`).

Then refresh the page without the cache: `Ctrl` + `F5` (`Cmd` + `Shift` + `R` on
a Mac), or clear the browser cache.

## Go back to the stable version

Use **Redownload** (HACS) or **Install another version** (Marketplace) again and
pick the latest version without `-rc` in its name, or restore your backup. Your
dashboards stay as they are.

## Advanced: test the RC next to the stable card

To try an RC without touching your live cards, load it a second time under its
own name. Your existing cards keep the stable version.

<details>
<summary>Show the steps</summary>

This needs access to your Home Assistant files (the File editor or Samba add-on,
or a terminal).

1. From the RC's page on
   [GitHub releases](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/releases),
   download:
   - `entity-progress-card.js` (required);
   - `entity-progress-card-editor.js`, the visual editor (without it, Home
     Assistant shows its YAML editor for the test cards);
   - the file of your language, e.g. `entity-progress-card-fr.json` (without it,
     the visual editor is in English).

   If unsure, download them all.

2. Put them in a new folder, `/config/www/test/` (in a terminal:
   `mkdir -p /config/www/test`). Home Assistant serves the `www` folder as
   `/local/`.
3. Add a resource: **Settings** ➡️ **Dashboards** ➡️ **Resources** ➡️ **⋮** ➡️
   **Add resource**, with the URL
   `/local/test/entity-progress-card.js?suffix=rc` and the type
   `JavaScript Module`. Then refresh the page without the cache.
4. Duplicate a card, open it in the card editor, select **Show code editor** and
   add `-rc` at the end of its type: `custom:entity-progress-card-rc` (the same
   for the other variants, e.g. `custom:entity-progress-feature-rc`). The stable
   and RC cards now run side by side.

`?suffix=rc` gives every element of this copy an `-rc` name
(`custom:entity-progress-card-rc`, `custom:entity-progress-feature-rc`…). Any
lowercase word or number works (`?suffix=test`), up to 16 characters. In the
browser console, this copy's diagnostic helper is `EPB_RC`.

You can load several copies side by side, each with its own suffix, next to the
version installed through HACS or the Marketplace.

When you're done, remove the resource, delete the files from
`/config/www/test/`, and delete the `-rc` cards (they show an error once the
resource is gone).

</details>
