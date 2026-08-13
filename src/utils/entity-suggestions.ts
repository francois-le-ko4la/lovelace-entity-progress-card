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
 * Deliberately conservative, per HA's own guidance ("check the domain,
 * device class, or supported features... return null otherwise"): only
 * domains with one clear, unambiguous numeric source are covered. Anything
 * more context-dependent (climate targets, media_player volume vs. position,
 * a text sensor...) is left out rather than guessed - same reasoning
 * `HABase.getStubEntity`'s own narrow regex already follows, just extended to
 * every domain this card actually supports well (see docs/configuration.md's
 * `entity`/`attribute` options), not just the four picked for that one
 * example stub entity.
 */

import type { HomeAssistant, EntityState } from './hass-provider.js';

// No `type` here on purpose - HA requires the suggestion's own config to
// carry a real `type: "custom:..."`, but this module is domain/attribute
// logic only and has no notion of dev-mode `-dev` suffixing - register.ts's
// withSuggestionType injects it, off the same resolved type name every
// other registration field already uses.
interface EntitySuggestionConfig {
  entity: string;
  attribute?: string;
  max_value?: number;
}

interface EntitySuggestion {
  config: EntitySuggestionConfig;
  label?: string;
}

// domain -> the one attribute that reads as a plain number for that domain,
// plus a max_value override when the attribute's own native scale isn't
// 0-100 (light's brightness is 0-255).
const ATTRIBUTE_BY_DOMAIN: Record<string, { attribute: string; max_value?: number }> = {
  cover: { attribute: 'current_position' },
  valve: { attribute: 'current_position' },
  fan: { attribute: 'percentage' },
  light: { attribute: 'brightness', max_value: 255 },
  humidifier: { attribute: 'current_humidity' },
};

// Domains whose own state is already a plain, directly-usable number -
// timer is the one exception (its state is idle/active/paused, never a
// number, but the card has first-class native timer support regardless -
// see ViewCore's own entityType.isTimer handling).
const STATE_DOMAINS = new Set(['sensor', 'number', 'input_number', 'counter']);

const isFiniteNumber = (value: unknown): boolean =>
  (typeof value === 'string' || typeof value === 'number') && value !== '' && Number.isFinite(Number(value));

function resolveEntitySuggestion(hass: HomeAssistant, entityId: string): EntitySuggestion | null {
  const domain = entityId.split('.')[0];
  const state = hass?.states?.[entityId] as EntityState | undefined;
  if (!state) return null;

  if (domain === 'timer') return { config: { entity: entityId } };

  const attributeRule = ATTRIBUTE_BY_DOMAIN[domain];
  if (attributeRule) {
    if (!isFiniteNumber(state.attributes?.[attributeRule.attribute])) return null;
    return {
      config: {
        entity: entityId,
        attribute: attributeRule.attribute,
        ...(attributeRule.max_value ? { max_value: attributeRule.max_value } : {}),
      },
    };
  }

  if (STATE_DOMAINS.has(domain) && isFiniteNumber(state.state)) {
    return { config: { entity: entityId } };
  }

  return null;
}

export { resolveEntitySuggestion };
export type { EntitySuggestion };
