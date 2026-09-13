/*
 * getEntitySuggestion support (HA 2026.6+, "Pick a card, any card"): when an
 * entity is picked in the dashboard's entity-first card picker, HA calls this
 * to ask each opted-in custom card for a ready-to-preview config for that
 * specific entity - see https://developers.home-assistant.io/blog/2026/05/27/custom-card-suggestions/.
 *
 * Card/Badge only (see index.ts) - Template/Badge Template need a Jinja
 * `percent:` written by hand to render anything meaningful; a zero-config
 * suggestion for those would just show a static, misleading preview instead
 * of a working one.
 *
 * Domain coverage is HA_CONTEXT.attributeMapping, the same table the card
 * itself reads for a default attribute, so a picked entity and a
 * hand-written one resolve to the same value. Anything outside it returns
 * null, per HA's own guidance ("check the domain, device class, or supported
 * features... return null otherwise").
 */

import { HA_CONTEXT } from './parameters.js';
import type { HomeAssistant, EntityState } from './hass-provider.js';

// No `type` here on purpose - HA requires the suggestion's own config to
// carry a real `type: "custom:..."`, but this module is domain/attribute
// logic only and has no notion of dev-mode `-dev` suffixing - register.ts's
// withSuggestionType injects it, off the same resolved type name every
// other registration field already uses.
interface EntitySuggestionConfig {
  entity: string;
  attribute?: string;
}

interface EntitySuggestion {
  config: EntitySuggestionConfig;
  label?: string;
}

const isFiniteNumber = (value: unknown): boolean =>
  (typeof value === 'string' || typeof value === 'number') && value !== '' && Number.isFinite(Number(value));

function resolveEntitySuggestion(hass: HomeAssistant, entityId: string): EntitySuggestion | null {
  const domain = entityId.split('.')[0];
  const state = hass?.states?.[entityId] as EntityState | undefined;
  if (!state) return null;

  // timer's state is idle/active/paused, never a number - the card reads its
  // duration natively instead (see ViewCore's own entityType.isTimer path).
  if (domain === HA_CONTEXT.entity.type.timer) return { config: { entity: entityId } };

  const mapping = HA_CONTEXT.attributeMapping[domain];
  if (mapping) {
    // The card normalizes a scaled attribute (brightness, volume_level) to
    // 0-100 itself - a max_value here would scale it a second time.
    const attribute = mapping.suggest ?? mapping.attribute;
    if (!isFiniteNumber(state.attributes?.[attribute])) return null;
    return { config: { entity: entityId, attribute } };
  }

  if (HA_CONTEXT.stateDomains.includes(domain) && isFiniteNumber(state.state)) {
    return { config: { entity: entityId } };
  }

  return null;
}

export { resolveEntitySuggestion };
export type { EntitySuggestion };
