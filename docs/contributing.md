# Contributing to Entity Progress Card

First off, thank you for considering contributing to Entity Progress Card! 🎉

It's people like you that make Entity Progress Card such a great tool for the
community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of
Conduct]. By participating, you are expected to uphold this code.

**In short: Be respectful, be inclusive, and help create a positive environment
for everyone.**

## How Can I Contribute?

### Reporting Bugs

Not sure it is a bug? Start with the [Errors, Deprecations & Troubleshooting
Guide], then check the existing [GitHub Issues] to avoid duplicates. You don't
need to be technical to report one: open a
[new issue](https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues/new/choose)
and include:

- a clear **title**;
- what you expected, and what you see instead;
- the card's YAML (or the issue report copied from the card editor, see
  [Troubleshooting](troubleshooting.md#copy-the-issue-report-from-the-card-editor));
- your Home Assistant version and browser;
- a screenshot, if you can.

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub Issues]. When creating an
enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the idea**
- **Explain why this enhancement would be useful**

### Contributing Code

- Fix bugs
- Add new features
- Add or improve translations: see [Translations](#translations); the supported
  languages are listed in the [README](../README.md#language-and-numbers)
- Optimize performance

### Documentation

- Fix typos or grammatical errors
- Add missing documentation
- Improve existing documentation
- Add examples or tutorials

## Getting Started

> [!TIP]
>
> **Just fixing or adding a translation?** You don't need anything below — no
> fork/clone, no `npm install`, no tooling. Edit `xx.json` directly in GitHub's
> web editor and open a PR from there. See [Translations](#translations).

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/lovelace-entity-progress-card.git
   cd lovelace-entity-progress-card
   ```

3. Install dependencies (needed to run lint/validate locally, see
   [Testing Your Changes](#testing-your-changes)) — this also installs a
   pre-commit hook (husky + lint-staged) that auto-formats/lints staged
   `src/**/*.{js,ts}` and `*.md` files on every commit:

   ```bash
   npm install
   ```

## Contribution Guidelines

### Code Style

- **TypeScript**
- Custom elements extending **HTMLElement**
- **Clear variable names** and functions
- **Comment only the non-obvious**: a hidden constraint, a bug workaround, a WHY
  a future reader would otherwise miss — not what the code already says by being
  well-named. Terse when a comment is warranted at all.
- **Follow existing code patterns**
- **No runtime dependencies** — the shipped card stays dependency-free (see
  [Design principles](development.md#design-principles)); devDependencies for
  linting/building/testing are fine.

### Translations

**Adding a new language** (none of the existing `translations/*.json` covers it
yet):

- Copy the file `./translations/template.json` and name it with the code Home
  Assistant uses for the language, with the same case (`fr`, `pt-BR`, `zh-Hans`,
  `sr-Latn`): with no matching file, the card shows English
- Fill in all the empty values in `xx.json` with your translations.
- Submit a pull request with your `xx.json`

**Fixing or improving an existing translation** (a typo, an awkward wording, a
missing key added since you last translated):

- Edit `translations/xx.json` directly — no template, no copy, just change the
  value(s) you want to fix.
- Submit a pull request with your change.

> [!NOTE]
>
> **You don't need to know how to code for this.** CI only checks that your JSON
> is well-formed and matches `template.json`'s structure — you don't need to
> touch anything else, and merging translations into the JS bundle is a
> maintainer step done before release. If you made a mistake, the PR checks will
> simply fail and show what's wrong; nothing gets merged broken. Stuck, or the
> error message doesn't make sense? Open a [GitHub issue][GitHub Issues] or ask
> on [Discord] — we'll sort it out together.

### Commit Messages

Use clear and meaningful commit messages:

```text
feat: add watermark support for progress bars
fix: resolve color theme issue with custom themes
docs: update README with new examples
style: improve code formatting
refactor: optimize theme processing logic
test: add validation for custom theme ranges
```

**Format**: `type: description`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Testing Your Changes

The automated tests cover the card's logic, the editors and the documentation
(see the [Quick start](development.md#quick-start)), but none of them sees how a
card looks. Before submitting a PR, check:

**Commands**

- [ ] `npm run check:code` passes locally (syntax, format, lint, types,
      translation structure, unit tests); the pre-commit hook auto-formats
- [ ] `npm run check:push` before pushing — adds knip, the full i18n sync,
      markdown, the DOM mount suite and both builds — CI runs the same check on
      `src/**` changes
- [ ] after adding or changing an option, `npm run docs:options` regenerates
      [`docs/option-map.md`](option-map.md), which a test checks against the
      code

**In Home Assistant**

- [ ] The card loads without console errors
- [ ] Existing features still work, and the new ones work as expected
- [ ] Different themes render correctly
- [ ] Mobile and tablet render correctly
- [ ] Various entity types are supported
- [ ] The documentation is updated

#### Check a change in Home Assistant

1. `npm run build:test` builds `dist/entity-progress-card_dev.js`.
2. Add it as a resource (**Settings** ➡️ **Dashboards** ➡️ **Resources**), as in
   [Testing a Release Candidate](rc-testing.md#advanced-test-the-rc-next-to-the-stable-card).
3. Import [`docs/demo-dashboard-dev.yaml`][demo-dashboard-dev.yaml] as a
   dashboard, and
   [`docs/demo-dashboard-helpers.yaml`][demo-dashboard-helpers.yaml] as a
   `homeassistant: packages:` file (the helpers and scripts it uses).

This showroom has one section per documented option and a non-regression card
per closed bug: it is how every fix gets confirmed. To demonstrate your change,
add a card in both `docs/demo-dashboard.yaml` and `docs/demo-dashboard-dev.yaml`
(the `-dev` file differs only by a `-dev` suffix on every custom card `type:`).
A card proving a past bug stays fixed goes to the `-dev` file alone, in its
"Regression tests" view.

[demo-dashboard-dev.yaml]: demo-dashboard-dev.yaml
[demo-dashboard-helpers.yaml]: demo-dashboard-helpers.yaml

## Community

### Discord Server

Join our [Discord] community for:

- Real-time support and discussions
- Feature brainstorming
- General chat

### Getting Help

- **General questions**: [Discord] #general channel
- **Development help**: [Discord] #dev channel
- **Feature requests**: [Discord] / [GitHub Issues]
- **Bug reports**: [GitHub Issues]

## Questions?

Don't hesitate to ask! We're here to help:

- **[Discord]**: Join our community server
- **[GitHub Issues]**: For specific technical questions

## Thank You

Every contribution, no matter how small, is valuable and appreciated. Whether
you're fixing a typo, adding a feature, or helping other users, you're making
Entity Progress Card better for everyone.

**Happy Contributing!** 🚀

---

_This contribution guide is inspired by open source best practices._

[Discord]: https://discord.gg/tyMQ2SfyNG
[GitHub Issues]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/issues
[Code of Conduct]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/code_of_conduct.md
[Errors, Deprecations & Troubleshooting Guide]:
  https://github.com/francois-le-ko4la/lovelace-entity-progress-card/blob/main/docs/troubleshooting.md
