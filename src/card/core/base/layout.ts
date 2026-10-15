import { CARD } from '../../../utils/parameters.js';
import { type ViewCore } from '../../view/core.js';

// The 12-column grid numbers HA's getGridOptions asks for, off the same
// cardLayoutOptions the older 4-column getLayoutOptions returns.
const gridOptionsOf = (view: ViewCore) => {
  const { grid_rows, grid_min_rows, grid_max_rows, grid_columns, grid_min_columns, grid_max_columns } =
    view.cardLayoutOptions;
  const multiplier = CARD.layout.gridColumnMultiplier;
  return {
    rows: grid_rows,
    min_rows: grid_min_rows,
    columns: grid_columns * multiplier,
    min_columns: grid_min_columns * multiplier,
    // undefined means "no ceiling": left out, so HA reads it as never set.
    ...(grid_max_rows !== undefined ? { max_rows: grid_max_rows } : {}),
    ...(grid_max_columns !== undefined ? { max_columns: grid_max_columns * multiplier } : {}),
  };
};

export { gridOptionsOf };
