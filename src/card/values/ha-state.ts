/*
 * HA's own reading of a domain/state pair (active, theme color, toggleable),
 * over the HA_CONTEXT mirrors: the card colors and reacts like HA's tiles.
 */

import { HA_CONTEXT, stateColorName, type DomainProfile } from '../../utils/ha-context.js';

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

// hui-tile-card.ts _computeStateColor: a light's own rgb_color, lifted when too
// pale to read on the card (HSV: white keeps its hue at V 225, pastels get S 0.4).
const lightColor = (rgb: unknown): string | null => {
  if (!Array.isArray(rgb) || rgb.length !== 3 || !rgb.every(Number.isFinite)) return null;
  const [red, green, blue] = rgb as [number, number, number];
  let value = Math.max(red, green, blue);
  const chroma = value - Math.min(red, green, blue);
  let saturation = value && chroma / value;
  let sextant = 0;
  if (chroma) {
    if (value === red) sextant = (green - blue) / chroma;
    else sextant = value === green ? 2 + (blue - red) / chroma : 4 + (red - green) / chroma;
  }
  if (sextant < 0) sextant += 6;
  if (saturation < 0.1) value = 225;
  else if (saturation < 0.4) saturation = 0.4;
  const channel = (offset: number): string => {
    const k = (offset + sextant) % 6;
    const level = value - value * saturation * Math.max(Math.min(k, 4 - k, 1), 0);
    return Math.round(level).toString(16).padStart(2, '0');
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
};

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_color.ts
// null: HA gives this entity no state color.
const stateColor = (
  domain: string,
  deviceClass: string | null,
  state: string,
  groupMembers?: unknown,
  rgbColor?: unknown,
): string | null => {
  if (state === HA_CONTEXT.entity.state.unavailable) return asCssVar(stateColorName('unavailable'));
  const active = isStateActive(domain, state);
  if (domain === HA_CONTEXT.domains.light && active) {
    const color = lightColor(rgbColor);
    if (color) return color;
  }
  if (domain === HA_CONTEXT.domains.sensor && deviceClass === HA_CONTEXT.deviceClasses.battery) {
    const color = batteryColor(state);
    if (color) return color;
  }
  if (domain === HA_CONTEXT.domains.group) {
    const memberDomain = groupMemberDomain(groupMembers);
    if (memberDomain && HA_CONTEXT.stateColoredDomains.has(memberDomain))
      return domainStateColor(memberDomain, deviceClass, state, active);
  }
  return HA_CONTEXT.stateColoredDomains.has(domain) ? domainStateColor(domain, deviceClass, state, active) : null;
};

export { domainProfile, isToggleDomain, isStateActive, stateColor };
