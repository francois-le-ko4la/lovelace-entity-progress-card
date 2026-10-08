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

import { CARD, HA_CONTEXT } from './parameters.js';
import { is } from './common-checks.js';
import type { ValueKind } from './ha-context.js';

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
  {
    configUnit,
    resolvedUnit,
    entityPrecision,
    valueKind,
    entityUnit,
  }: {
    configUnit: string | undefined;
    resolvedUnit: string;
    entityPrecision: number | null;
    valueKind: ValueKind;
    entityUnit: string | null;
  },
): number => {
  if (is.unsignedInteger(configDecimal)) return configDecimal;
  if (entityPrecision) return entityPrecision;
  if (valueKind === 'timer') return CARD.config.decimal.timer;
  if (valueKind === 'counter') return CARD.config.decimal.counter;
  if (valueKind === 'duration') return CARD.config.decimal.duration;
  // A duration unit, even when the entity isn't typed as one.
  if (entityUnit !== null && HA_CONTEXT.durationUnits.has(entityUnit)) return CARD.config.decimal.duration;
  // ||, never ??: the disable unit is the empty string, and an explicit
  // `unit: ''` has always fallen through to the resolved one.
  const unit = configUnit || resolvedUnit;
  return unit === CARD.config.unit.default ? CARD.config.decimal.percentage : CARD.config.decimal.other;
};

export { resolveDisplayUnit, resolveDisplayDecimal };
