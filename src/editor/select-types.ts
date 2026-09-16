// Which dropdown reads which enum. Its own module, DOM-free unlike base.ts.

import { DENSITY_COMPACT_BAR_POSITIONS, type SchemaVariant } from '../card/schema.js';

type SchemaLookup = { variant: SchemaVariant; field: string };
const from = (variant: SchemaVariant, field: string): SchemaLookup => ({ variant, field });

// Option values naming something the field list already names: the label is
// borrowed instead of stored a second time (see EditorBase#localizedOptions).
// Only where every language agreed on the very same string - a near-match would
// silently retranslate it. Here rather than in base.ts so the dropdown test
// reads the same table the editor does.
const BORROWED_OPTION_LABELS: Record<string, Record<string, string>> = {
  hide: { progress_bar: 'shared.bar', shape: 'force_circular_background_mode' },
  status_label_color_source: { bar: 'shared.bar' },
  value_source_mode: { entity: 'shared.ent' },
};

// A bare string names the translation group and offers all of it; a pair adds
// the values to keep, either listed or read off the live schema.
const SELECT_TYPES: Record<string, string | [group: string, keys: readonly string[] | SchemaLookup]> = {
  bar_size: ['bar_size', from('card', 'bar_size')],
  bar_size_no_xlarge: ['bar_size', from('badge', 'bar_size')],
  bar_orientation: ['bar_orientation', from('card', 'bar_orientation')],
  bar_orientation_no_up: ['bar_orientation', from('badge', 'bar_orientation')],
  bar_position: ['bar_position', from('card', 'bar_position')],
  bar_position_no_compact_below: ['bar_position', ['default', 'below', 'top', 'bottom', 'overlay', 'background']],
  bar_position_density_compact: ['bar_position', DENSITY_COMPACT_BAR_POSITIONS],
  bar_position_feature: ['bar_position', from('feature', 'bar_position')],
  bar_color_mode: ['bar_color_mode', from('card', 'bar_color_mode')],
  bar_scale: ['bar_scale', from('card', 'bar_scale')],
  icon_animation: ['icon_animation', from('card', 'icon_animation')],
  alert_highlight: ['alert_highlight', from('card', 'alert_when.highlight')],
  alert_animation: ['alert_animation', from('card', 'alert_when.animation')],
  label_position: ['label_position', from('card', 'status_label.position')],
  status_label_color_source: ['status_label_color_source', from('card', 'status_label.color_source')],
  theme: ['theme', from('card', 'theme')],
  // Template has no min_value/max_value to project a real-value theme onto.
  theme_percent_only: ['theme', from('template', 'theme')],
  unit_spacing: ['unit_spacing', from('card', 'unit_spacing')],
  unit_position: 'unit_position',
  watermark_type: ['watermark_type', from('card', 'watermark.type')],
  watermark_as: 'watermark_as',
  // peak_marker's own enum, reusing watermark_type's labels.
  peak_marker_type: ['watermark_type', from('card', 'peak_marker.type')],
  // The band's: the zone shapes only, same labels again.
  peak_range_type: ['watermark_type', from('card', 'peak_marker.range.type')],
  duration_unit: 'duration_unit',
  trend_indicator_basis: 'trend_indicator_basis',
};

export { SELECT_TYPES, BORROWED_OPTION_LABELS };
export type { SchemaLookup };
