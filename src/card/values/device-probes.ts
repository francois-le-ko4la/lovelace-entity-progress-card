/*
 * Status probes that read the card's entity first, then its device's siblings:
 * charging (battery_adaptive, battery_charging) and a washing appliance.
 */

import { HA_CONTEXT } from '../../utils/parameters.js';
import { HassProviderSingleton } from '../../utils/hass-provider.js';

type Probe = (hassProvider: HassProviderSingleton, entityId: string) => boolean;

// The card's own entity first, so a sibling never shadows a signal already on
// it; availability is checked here, not by the probes.
const entityOrSameDevice = (entity: string, probe: Probe): boolean => {
  const hassProvider = HassProviderSingleton.getInstance();
  const ask = (id: string) => hassProvider.isEntityAvailable(id) && probe(hassProvider, id);
  return ask(entity) || hassProvider.getSameDeviceEntities(entity).some(ask);
};

// A text status (Tesla Fleet) or a battery_charging binary_sensor (BYD); the
// device class keeps a bare 'on' from matching any on/off entity.
const entityReportsCharging: Probe = (hassProvider, entityId) => {
  const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
  if (HA_CONTEXT.integrations.charging.states.has(state)) return true;
  if (
    state === HA_CONTEXT.entity.state.on &&
    hassProvider.getEntityProp(entityId, HA_CONTEXT.attributes.deviceClass) === HA_CONTEXT.deviceClasses.batteryCharging
  )
    return true;
  return HA_CONTEXT.integrations.charging.attributes.some((attr) => {
    const value = hassProvider.getEntityAttribute(entityId, attr);
    return value === true || String(value).toLowerCase() === 'charging';
  });
};

// Home Connect ('run') and Miele ('in_use') report on plain sensors, which
// isEntityActive's domain gate excludes.
const sensorReportsWashing: Probe = (hassProvider, entityId) => {
  if (HassProviderSingleton.getEntityDomain(entityId) !== HA_CONTEXT.domains.sensor) return false;
  const state = String(hassProvider.getEntityProp(entityId, 'state') ?? '').toLowerCase();
  return HA_CONTEXT.integrations.washing.states.has(state);
};

// The progress value is often not the status entity: scan every sibling.
const computeIsBatteryCharging = (entity: string): boolean => entityOrSameDevice(entity, entityReportsCharging);

const isWashingSensorActive = (entity: string): boolean => entityOrSameDevice(entity, sensorReportsWashing);

export { computeIsBatteryCharging, isWashingSensorActive };
