import { is } from '../utils/common-checks.js';
import { HA_CONTEXT } from '../utils/parameters.js';
import { EntityHelper } from './entity-helper.js';

// A min/max/watermark/alert_when end: a number, an entity, or nothing (unset,
// or fed by a Jinja subscription). Decided once, from the config.
type Bound = EntityHelper | number | null;

// number (legacy) | {entity, attribute} | {jinja}
type BoundConfig = number | { entity?: string; attribute?: string; jinja?: string } | null | undefined;

function boundFrom(cfg: BoundConfig, fallback: number | null): Bound {
  const fields = is.plainObject(cfg) ? cfg : null;
  const value = fields ? (fields.jinja ? null : (fields.entity ?? fallback)) : ((cfg as number | null) ?? fallback);
  if (is.string(value)) {
    const entity = new EntityHelper();
    entity.entityId = value;
    entity.attribute = fields?.attribute ?? null;
    return entity;
  }
  return is.number(value) ? value : null;
}

const isEntityBound = (bound: Bound): bound is EntityHelper => bound instanceof EntityHelper;

function boundValue(bound: Bound): number | null {
  return isEntityBound(bound) ? bound.current : bound;
}

const boundState = (bound: Bound): string | null => (isEntityBound(bound) ? bound.state : null);

const isFaultState = (state: string | null): state is string => {
  const { unavailable, unknown, notFound } = HA_CONTEXT.entity.state;
  return state === unavailable || state === unknown || state === notFound;
};

// Only an entity can be in a fault state: a number or nothing is always usable.
const boundUsable = (bound: Bound): boolean => !isEntityBound(bound) || !isFaultState(bound.state);

// A bound in a fault state reads as unset: its 0 is not a value.
const usableBoundValue = (bound: Bound) => (boundUsable(bound) ? boundValue(bound) : null);

function refreshBound(bound: Bound): void {
  if (isEntityBound(bound)) bound.refresh();
}

export { boundFrom, boundValue, boundState, boundUsable, usableBoundValue, isFaultState, refreshBound, isEntityBound };
export type { Bound };
