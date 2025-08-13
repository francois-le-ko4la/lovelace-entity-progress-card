
## What's new

**Better, faster, clearer**: new features, enhanced usability, and a full docs overhaul to make setup and customization effortless.

### 🆕 New Feature

- Badge Template: Added  
  ➡️ [Feature]: Entity Progress Badge Template #79 (@Pulpyyyy)
- Progress Bar Positioning  
  New parameter: `bar_position` with the following options:
  - `default`: standard position
  - `top`: at the top of the card
  - `bottom`: at the bottom of the card
  - `overlay`: overlaid on top of the content

  ➡️ [Feature]: Add option to show progress bar along bottom (or top) border of card #73 (@Valdorama)  
  ➡️ [Enhancement]: Style for XL bar #76 (@yduke)  
  ➡️ [Feature]: bar position #80 (@NfxGT) (soon!)  

- Single-Line Mode for Overlay Bars  
  New parameter: `bar_single_line` (for overlay mode bars only)

- Trend Indicator
  New parameter: trend_indicator (boolean)
  Displays trend icons:
  - mdi:chevron-up-box: upward trend
  - mdi:chevron-down-box: downward trend
  - mdi:equal-box: stable trend
  Automatically positioned at the top right of the card  

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
  - deprecated parameters: Warn in JavaScript console when using deprecated parameters.

- Multilingual support: Extended and fixed
  - Extended:
    All new error messages have been translated into over 20 languages, including now
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
  ➡️ [Feature]: Add force_circular_background: true in the template card options #83
- Editor: Added new `xlarge` size option for the bar.

### 🐞 Bug Fixes

- fixed [Bug]: icons not loading in the application #86 (@jarzebski)
- fixed [Bug]: Card shows “Configuration error” when conditionally re-displayed via visibility and input_text helper #87
- fixed [Bug]: Icon container not found for _showIcon #88 (@golles)

### 📚 Documentation

- Navigation improvements:
  - New simplified table of contents
  - Clearer titles and structure throughout
    - Description + Features → Description & features
    - All card types (Standard, Template, Badge) now live under one section
  - YAML options now shown in smart tables
  - Collapsible sections to keep things clean

- Added: 🙏 Credits
- Added: Theme documentation - `theme.md`
- Added: Full Configuration Reference - `configuration.md`
  - full update with conventions, matrix, description to use it efficiently
- Added: Troubleshooting Guide - `troubleshooting.md`

- migrate `doc/` to `docs/`

This docs update dramatically improves usability:

- Easier for newcomers
- More maintainable
- Looks great across all devices
