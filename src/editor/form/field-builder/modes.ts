// Mode lists for EntityProgressModeChips (chips.ts): each single-select mode
// field passes its own list instead of a chip subclass per field.
const VALUE_SOURCE_MODES = ['standard', 'entity', 'jinja'];
const THEME_MODE_MODES = ['preset', 'custom'];
const SIMPLE_ADVANCED_MODES = ['simple', 'advanced'];
const ICON_ANIMATION_MODES = ['auto', 'template'];
const CIRCULAR_BACKGROUND_MODES = ['auto', 'forced'];
// The 5 master on/off toggles of markers() - a pill instead of a switch.
const ENABLED_DISABLED_MODES = ['disabled', 'enabled'];

export {
  CIRCULAR_BACKGROUND_MODES,
  ENABLED_DISABLED_MODES,
  ICON_ANIMATION_MODES,
  SIMPLE_ADVANCED_MODES,
  THEME_MODE_MODES,
  VALUE_SOURCE_MODES,
};
