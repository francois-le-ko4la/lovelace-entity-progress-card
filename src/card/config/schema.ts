/*
 * The YAML config validation layer: the struct/types primitives, and
 * YamlSchemaFactory - the per-card-type
 * (card/badge/template/badgeTemplate/feature) schema definitions built from
 * them.
 */

export {
  THEME_ALIASES,
  rawThemeRange,
  BAR_AROUND_ICON,
  BAR_SIZES,
  BAR_POSITIONS,
  MARK_TYPES,
  MARK_ZONE_TYPES,
  DENSITY_COMPACT_BAR_POSITIONS,
  ICON_ANIMATIONS,
  OWN_TRIGGER_ANIMATIONS,
  ACTION_FIELDS,
  DENSITY_MODES,
  ROW_IDENTITY_FIELDS,
  AGGREGATOR_FIELDS,
  PEAK_RANGE_TYPE_DEFAULT,
} from './schema/enums.js';
export {
  type ValueConfig,
  entityOf,
  attributeOf,
  jinjaOf,
  markInner,
  markShown,
  markValue,
  MARK_FIELDS,
  markIds,
  peakMarkShown,
  isMarkOverride,
  type MarkField,
  type MarkFamily,
  type MarkId,
  type PeakPoint,
  statusLabelObj,
  rewrapStatusLabel,
  type WatermarkMark,
  type PeakMark,
} from './schema/marks.js';
export {
  translateOrientation,
  HAS_EFFECT,
  raisesRainbowFullRow,
  densityOverrides,
  densityForcedHide,
  OPTIONS_WITHOUT_EFFECT,
} from './schema/rules.js';
export { type Infer, isToggleDomainEntity } from './schema/struct.js';
export { YamlSchemaFactory } from './schema/variants.js';
export { schemaOptions, type SchemaVariant, SCHEMA_DEFAULTS } from './schema/defaults.js';
export { MARK_FACTORIZATION } from './schema/factorization.js';
