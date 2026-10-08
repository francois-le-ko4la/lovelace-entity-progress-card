/*
 * ChangeTracker: detects whether a hass update actually changed anything this
 * card watches, so a redundant refresh can be skipped.
 */

import { CARD_CONTEXT, HA_CONTEXT, SEV } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { Logger, traceInstance, type LoggerInstance } from '../utils/log.js';
import { sameDeviceEntities, type EntityState, type HomeAssistant } from '../utils/hass-provider.js';

// What the display reads from hass besides states. HA replaces each only when
// it changes - its formatters a moment after the language they speak.
const CONTEXT_KEYS = [
  'language',
  'locale',
  'localize',
  'formatEntityState',
  'formatEntityAttributeValue',
  'devices',
  'areas',
  'floors',
  'config',
] as const;

class ChangeTracker {
  #debug = CARD_CONTEXT.debug.hass;
  #log: LoggerInstance;
  #firstTime = true;
  #watchedEntities = new Set<string>();
  #sameDeviceOf = new Set<string>();
  #entityCache: Record<string, EntityState | null> = {};
  #registryCache: Record<string, unknown[]> = {};
  #contextCache: unknown[] = [];
  #updated = false;
  #hassState = { isUpdated: false };

  constructor() {
    this.#log = Logger.create('ChangeTracker', this.#debug ? SEV.debug : SEV.info);
    traceInstance('ChangeTracker', CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hassState(hass: HomeAssistant) {
    this.#updated = false;
    if (!hass) return;

    if (this._hasChanged(hass)) {
      this._updateCache(hass);
      this.#updated = true;
      this.#log.debug('HASS need update...!');
    }
    this.#hassState = { isUpdated: this.#updated };
  }

  get hassState(): { isUpdated: boolean } {
    return this.#hassState;
  }

  get isUpdated(): boolean {
    return this.#updated;
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _hasChanged(newHass: HomeAssistant): boolean {
    if (this.#firstTime) {
      this.#firstTime = false;
      return true;
    }
    // CF5 - issue (perf) resolved - previously returned true, running the full
    // refresh pipeline on every hass update of the whole install for cards with
    // no watched entity (Jinja-only template cards). Their content arrives
    // exclusively via push template subscriptions; nothing in the pipeline
    // reads hass directly. If a future render path does, revisit this.
    if (!is.nonEmptySet(this.#watchedEntities)) return false;
    if (CONTEXT_KEYS.some((key, index) => newHass?.[key] !== this.#contextCache[index])) return true;

    for (const entityId of this.#entitiesToCheck(newHass)) {
      // CF5 - issue (perf) resolved - HA state objects are immutable (the
      // frontend swaps in a new object on every change), so a reference check
      // replaces the two full JSON.stringify serializations previously run per
      // entity on every hass update
      if ((newHass?.states?.[entityId] ?? null) !== this.#entityCache?.[entityId]) return true;
      // CF5 - issue (medium) resolved - registry fields live in the registry,
      // not the state object: compared by value, normalized like the cache (a
      // raw `undefined` against a cached `null` read as a change).
      const entry = newHass?.entities?.[entityId];
      const cached = this.#registryCache[entityId];
      if (HA_CONTEXT.registryFields.some((field, index) => (entry?.[field] ?? null) !== cached?.[index])) return true;
    }

    return false;
  }

  _updateCache(hass: HomeAssistant) {
    this.#entityCache = {};
    this.#registryCache = {};
    this.#contextCache = CONTEXT_KEYS.map((key) => hass?.[key]);
    for (const entityId of this.#entitiesToCheck(hass)) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
      const entry = hass.entities?.[entityId];
      this.#registryCache[entityId] = HA_CONTEXT.registryFields.map((field) => entry?.[field] ?? null);
    }
  }

  #entitiesToCheck(hass: HomeAssistant): Set<string> {
    if (this.#sameDeviceOf.size === 0) return this.#watchedEntities;
    const entityIds = new Set(this.#watchedEntities);
    for (const entityId of this.#sameDeviceOf) {
      for (const sibling of sameDeviceEntities(hass?.entities, entityId)) entityIds.add(sibling);
    }
    return entityIds;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  watchEntity(entityId: string) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }

  // For a detection that reads a status entity on entityId's device rather
  // than entityId itself (washing_machine, battery_charging).
  watchSameDevice(entityId: string) {
    if (entityId) this.#sameDeviceOf.add(entityId);
  }

  resetWatchedEntities() {
    this.#watchedEntities.clear();
    this.#sameDeviceOf.clear();
  }
}

export { ChangeTracker };
