import { CARD } from '../../../utils/parameters.js';
import { type Config } from '../../../utils/types.js';
import { cloneValue } from '../../../utils/browser-support.js';
import { DENSITY_COMPACT_BAR_POSITIONS, raisesRainbowFullRow } from '../../config/schema.js';

type GridInputs = {
  config: Config | undefined;
  isHidden: (component: string) => boolean;
  isRing: boolean;
};

const orientationOf = (config: Config) =>
  CARD.layout.orientations[config.layout as keyof typeof CARD.layout.orientations];

const cardSize = (config: Config | undefined): number =>
  config ? (orientationOf(config)?.grid?.grid_rows ?? 1) : CARD.layout.orientations.horizontal.grid.grid_rows;

// issue #133: hiding the icon changes the base rows only, never the extra one
// bar_size/bar_position need. Feeds Sections and HABase's CSS min-height.
const minGridRows = ({ config, isHidden, isRing }: GridInputs): number => {
  if (!config) return CARD.layout.orientations.horizontal.grid.grid_min_rows;
  const layout = orientationOf(config);
  const { hiddenComponent } = CARD.style.dynamic;
  // top/bottom/background overlay the bar on the icon row (styles .content
  // display:none): name and secondary_info hidden leave one icon row.
  const contentCollapsed =
    config.layout === CARD.layout.orientations.vertical.label &&
    DENSITY_COMPACT_BAR_POSITIONS.includes(config.bar_position ?? '') &&
    isHidden(hiddenComponent.name.label) &&
    isHidden(hiddenComponent.secondary_info.label);
  const baseRows = isHidden(hiddenComponent.icon.label) || contentCollapsed ? 1 : layout.grid.grid_min_rows;
  const needsExtraRow =
    // Around the icon, xlarge is a thicker ring, not a taller bar row.
    (config.bar_size === CARD.style.bar.sizeOptions.xlarge && !isRing) ||
    (config.layout === 'horizontal' && config.bar_position === 'below') ||
    (config.layout === 'vertical' &&
      ['default', 'below'].includes(config.bar_position ?? '') &&
      config.bar_size !== CARD.style.bar.sizeOptions.small &&
      config.bar_size !== CARD.style.bar.sizeOptions.xsmall) ||
    raisesRainbowFullRow(config);
  return baseRows + (needsExtraRow ? 1 : 0);
};

// issue #134: a compact card needs one column of width.
const minGridColumns = (config: Config | undefined): number => {
  if (!config) return CARD.layout.orientations.horizontal.grid.grid_min_columns;
  if (config.density === 'compact') return 1;
  return orientationOf(config).grid.grid_min_columns;
};

const cardLayoutOptions = (inputs: GridInputs) => {
  const { config } = inputs;
  if (!config) return CARD.layout.orientations.horizontal.grid;
  const layout = cloneValue(orientationOf(config));
  const rows = minGridRows(inputs);
  const columns = minGridColumns(config);
  layout.grid.grid_min_rows = rows;
  layout.grid.grid_min_columns = columns;
  // compact pins the card to its smallest size, ceiling included; an explicit
  // `grid_options` still wins.
  if (config.density === 'compact') {
    layout.grid.grid_rows = rows;
    layout.grid.grid_columns = columns;
    layout.grid.grid_max_rows = rows;
    layout.grid.grid_max_columns = columns;
  }
  return layout.grid;
};

export { cardLayoutOptions, cardSize, minGridColumns, minGridRows };
export type { GridInputs };
