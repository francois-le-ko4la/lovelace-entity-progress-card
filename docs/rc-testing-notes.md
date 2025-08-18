
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
- `bar_effect`: added support for `center_zero` (effect: 'radius', 'glass', 'gradient')
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
- Accessibility: respects the “Reduce Motion” setting (iOS/macOS, Android, Windows) to limit animations and prevent dizziness, migraines, or distractions.

### 🎨 Style Improvements

#### Major CSS Refactoring

- **Complete CSS reorganization**: Restructured the entire stylesheet with clear section headers and improved organization
- **CSS Custom Properties migration**: Converted hardcoded values to CSS custom properties for better maintainability and theming
- **Modular approach**: Split CSS into logical sections (Base Card, Main Container, Progress Bar, etc.)

#### Enhanced Layout System

- **Flexible container system**: Introduced variables for dynamic layout control
- **Improved vertical/horizontal layouts**: Better separation of concerns between orientation-specific styles
- **Responsive design improvements**: Enhanced responsiveness across different card types and sizes
- **Enhanced center_zero support**: Improved bar effects (radius, glass, gradient) compatibility with center_zero mode
- **Effect rendering**: Better handling of gradient and glass effects for both positive and negative progress values

### Performance

- **Optimized CSS**: More efficient CSS structure with reduced redundancy
- **Better rendering**: Improved layout calculations and rendering performance

### 🐞 Bug Fixes

- **Fixed** [Bug]: icons not loading in the application #86 (@jarzebski)
- **Fixed** [Bug]: Card shows “Configuration error” when conditionally re-displayed via visibility and input_text helper #87
- **Fixed** [Bug]: Icon container not found for _showIcon #88 (@golles)
- **Fixed** duplicate registration error during upgrade: Resolved "Failed to execute 'define' on 'CustomElementRegistry': the name has already been used" by adding existence check before registration
- **Improved** error handling: Added null safety check to prevent "Cannot read properties of null (reading 'addEventListener')" errors

### 📚 Documentation

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
- **Added**: Code of Conduct - `docs/code_of_conduct.md`
- **Added**: Code of Conduct - `docs/code_of_conduct.md`
- **Added**: Release Candidate Guide - `docs/rc-testing.md`

This docs update dramatically improves usability:

- Easier for newcomers
- More maintainable
- Looks great across all devices
