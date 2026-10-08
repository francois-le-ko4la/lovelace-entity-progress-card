/*
 * HA's own reading of a domain/state pair (active, theme color, toggleable),
 * over the HA_CONTEXT mirrors: the card colors and reacts like HA's tiles.
 */

import { HA_CONTEXT, stateColorName, type DomainProfile } from '../utils/ha-context.js';

const NO_PROFILE: DomainProfile = {};
const { stateActivity } = HA_CONTEXT;

const domainProfile = (domain: string | null): DomainProfile =>
  (domain && HA_CONTEXT.domainProfiles[domain]) || NO_PROFILE;

const isToggleDomain = (domain: string | null): boolean => domain !== null && HA_CONTEXT.toggleDomains.has(domain);

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_active.ts
const isStateActive = (domain: string, state: string): boolean => {
  if (stateActivity.timestamp.has(domain)) return state !== HA_CONTEXT.entity.state.unavailable;
  if (state === HA_CONTEXT.entity.state.unavailable || state === HA_CONTEXT.entity.state.unknown) return false;
  if (state === HA_CONTEXT.entity.state.off && !stateActivity.offIsActive.has(domain)) return false;
  const activeOnly = stateActivity.activeOnly[domain];
  if (activeOnly) return activeOnly.includes(state);
  return !stateActivity.inactive[domain]?.includes(state);
};

const asCssVar = (name: string): string => `var(${name})`;
const resolvedColors = new Map<string, string>();

const firstDefined = (...names: (string | false)[]): string | undefined =>
  names.find((name): name is string => name !== false && HA_CONTEXT.stateColorVars.has(name));

// state_color.ts candidate order, the first variable HA defines wins (no
// nested var() fallbacks). Cached per tuple, shared by every card on the page.
const domainStateColor = (domain: string, deviceClass: string | null, state: string, active: boolean): string => {
  const key = `${domain}|${deviceClass ?? ''}|${state}|${active}`;
  let color = resolvedColors.get(key);
  if (color === undefined) {
    const stateKey = state.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const activeKey = active ? 'active' : 'inactive';
    color = asCssVar(
      firstDefined(
        deviceClass !== null && stateColorName(domain, deviceClass, stateKey),
        stateColorName(domain, stateKey),
        stateColorName(domain, activeKey),
      ) ?? stateColorName(activeKey),
    );
    resolvedColors.set(key, color);
  }
  return color;
};

const batteryColor = (state: string): string | null => {
  const value = Number(state);
  if (state === '' || Number.isNaN(value)) return null;
  const step = HA_CONTEXT.batteryColorSteps.find(([threshold]) => value >= threshold);
  return step ? asCssVar(stateColorName(HA_CONTEXT.domains.sensor, HA_CONTEXT.deviceClasses.battery, step[1])) : null;
};

// The one domain shared by every member of a group, as HA colors a group of
// lights like a light.
const groupMemberDomain = (memberIds: unknown): string | null => {
  if (!Array.isArray(memberIds)) return null;
  const domains = new Set(memberIds.map((id) => String(id).split('.')[0]));
  return domains.size === 1 ? [...domains][0] : null;
};

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_color.ts
// null: HA gives this entity no state color.
const stateColor = (
  domain: string,
  deviceClass: string | null,
  state: string,
  groupMembers?: unknown,
): string | null => {
  if (state === HA_CONTEXT.entity.state.unavailable) return asCssVar(stateColorName('unavailable'));
  if (domain === HA_CONTEXT.domains.sensor && deviceClass === HA_CONTEXT.deviceClasses.battery) {
    const color = batteryColor(state);
    if (color) return color;
  }
  const active = isStateActive(domain, state);
  if (domain === HA_CONTEXT.domains.group) {
    const memberDomain = groupMemberDomain(groupMembers);
    if (memberDomain && HA_CONTEXT.stateColoredDomains.has(memberDomain))
      return domainStateColor(memberDomain, deviceClass, state, active);
  }
  return HA_CONTEXT.stateColoredDomains.has(domain) ? domainStateColor(domain, deviceClass, state, active) : null;
};

export { domainProfile, isToggleDomain, isStateActive, stateColor };
