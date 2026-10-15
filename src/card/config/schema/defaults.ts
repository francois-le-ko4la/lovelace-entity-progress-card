import { YamlSchemaFactory } from './variants.js';
import { PEAK_WINDOW_DEFAULT, PEAK_RANGE_TYPE_DEFAULT, ACTION_FIELDS } from './enums.js';

// Each YamlSchemaFactory getter rebuilds its whole schema on access - cached
// here so a caller can ask per field without paying for it every time.
type SchemaVariant =
  | 'card'
  | 'template'
  | 'badge'
  | 'badgeTemplate'
  | 'feature'
  | 'multiRow'
  | 'multiFeatureRow'
  | 'multiAggregator'
  | 'multiCard'
  | 'multiFeature';

const SCHEMA_CACHE = new Map<SchemaVariant, { fieldOptions: (name: string) => readonly unknown[] | undefined }>();

const schemaOptions = (variant: SchemaVariant, field: string): readonly string[] => {
  let schema = SCHEMA_CACHE.get(variant);
  if (!schema) {
    schema = YamlSchemaFactory[variant];
    SCHEMA_CACHE.set(variant, schema);
  }
  return (schema.fieldOptions(field) as readonly string[] | undefined) ?? [];
};

// Computed once at module load, straight off the live schema - only what the
// schema deliberately leaves absent is written in by hand below, and each one
// says why.
const SCHEMA_DEFAULTS = {
  watermark: {
    ...(YamlSchemaFactory.card.fieldDefault('watermark') as {
      low: number;
      high: number;
      line_size: string;
      as: string;
    }),
    // Genuinely absent from the schema, not an oversight: it lets the editor
    // tell "inert" apart from "still in use by one side" (see watermarkSchema).
    opacity: 0.8,
    type: 'blended',
  },
  peakMarker: {
    ...(YamlSchemaFactory.card.fieldDefault('peak_marker') as {
      window: number;
      type: string;
      opacity: number;
      line_size: string;
    }),
    // The same window the schema defaults to, in the spelling the editor
    // writes - the schema's own copy is already in seconds.
    window: PEAK_WINDOW_DEFAULT,
    // range's own, since it can't inherit the family's: 'line' is not a zone
    // (see types.peakZone).
    rangeType: PEAK_RANGE_TYPE_DEFAULT,
  },
  trendIndicator: {
    ...(YamlSchemaFactory.card.fieldDefault('trend_indicator') as {
      basis: string;
      threshold: number;
      colored: boolean;
    }),
    // Optional within Advanced (its own reveal toggle), so no schema default
    // to read - this is what the editor offers when the toggle goes on.
    window: '2h',
  },
  actions: Object.fromEntries(
    ACTION_FIELDS.map((key) => [key, (YamlSchemaFactory.card.fieldDefault(key) as { action: string }).action]),
  ) as Record<string, string>,
};

export { schemaOptions, SCHEMA_DEFAULTS };
export type { SchemaVariant };
