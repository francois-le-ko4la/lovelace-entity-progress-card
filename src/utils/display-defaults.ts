/*
 * Shared resolution of the *effective* unit/decimal a card displays when the
 * user leaves those options unset. The default is entity-derived (its
 * unit_of_measurement / display_precision / type), so it can't be a plain
 * schema default - it's computed here from primitives supplied by the caller.
 *
 * Two call sites, one logic: ViewCore resolves it live at render (from its
 * refreshed _currentValue); BaseConfigHelper resolves it once per set config
 * into the negotiated config (resolvedUnit/resolvedDecimal) so the editor can
 * show it as a greyed placeholder without writing a YAML key.
 */

import { CARD } from './parameters.js';
import { is } from './common-checks.js';

// Units that read as a duration even when the entity isn't typed as one.
const DURATION_UNITS = ['j', 'd', 'h', 'min', 's', 'ms', 'μs'];

type EntityTypeFlags = { isTimer?: boolean; isCounter?: boolean; isDuration?: boolean };

const resolveDisplayUnit = (
  configUnit: string | undefined,
  maxIsEntity: boolean,
  entityUnit: string | null,
): string => {
  if (configUnit) return configUnit;
  if (maxIsEntity) return CARD.config.unit.default;
  return entityUnit === null ? CARD.config.unit.default : entityUnit;
};

const resolveDisplayDecimal = (
  configDecimal: unknown,
  configUnit: string | undefined,
  resolvedUnit: string,
  entityPrecision: number | null,
  entityType: EntityTypeFlags,
  entityUnit: string | null,
): number => {
  if (is.unsignedInteger(configDecimal)) return configDecimal;
  if (entityPrecision) return entityPrecision;
  if (entityType.isTimer) return CARD.config.decimal.timer;
  if (entityType.isCounter) return CARD.config.decimal.counter;
  if (entityType.isDuration) return CARD.config.decimal.duration;
  if (DURATION_UNITS.includes(entityUnit as string)) return CARD.config.decimal.duration;
  if (configUnit)
    return configUnit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
  return resolvedUnit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
};

export { resolveDisplayUnit, resolveDisplayDecimal };
export type { EntityTypeFlags };
