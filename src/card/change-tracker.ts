/*
 * ChangeTracker: detects whether a hass update actually changed anything this
 * card watches, so a redundant refresh can be skipped.
 */

import { CARD_CONTEXT, SEV } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { Logger, traceInstance, type LoggerInstance } from '../utils/log.js';
import type { EntityState, HomeAssistant } from '../utils/hass-provider.js';

/**
 */
class ChangeTracker {
  #debug = CARD_CONTEXT.debug.hass;
  #log: LoggerInstance;
  #firstTime = true;
  #watchedEntities = new Set<string>();
  #entityCache: Record<string, EntityState | null> = {};
  #precisionCache: Record<string, unknown> = {};
  #updated = false;
  #hassState = { isUpdated: false };

  constructor() {
    this.#log = Logger.create('ChangeTracker', this.#debug ? SEV.debug : SEV.info);
    traceInstance(this, CARD_CONTEXT.debug.instances);
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

    for (const entityId of this.#watchedEntities) {
      const newState = newHass?.states?.[entityId];

      if (!newState) return true;
      // CF5 - issue (perf) resolved - HA state objects are immutable (the
      // frontend swaps in a new object on every change), so a reference check
      // replaces the two full JSON.stringify serializations previously run per
      // entity on every hass update
      if (newState !== this.#entityCache?.[entityId]) return true;
      // CF5 - issue (medium) resolved - display_precision lives in the entity
      // registry (hass.entities), not the state object, so changing it doesn't
      // swap the state reference above - the card rendered stale precision till
      // a reload. Compared by value (not the entity entry reference, which HA
      // can swap on unrelated registry changes).
      if (newHass?.entities?.[entityId]?.display_precision !== this.#precisionCache?.[entityId]) return true;
    }

    return false;
  }

  _updateCache(hass: HomeAssistant) {
    this.#entityCache = {};
    this.#precisionCache = {};
    for (const entityId of this.#watchedEntities) {
      this.#entityCache[entityId] = hass.states?.[entityId] ?? null;
      this.#precisionCache[entityId] = hass.entities?.[entityId]?.display_precision ?? null;
    }
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  watchEntity(entityId: string) {
    if (entityId) {
      this.#watchedEntities.add(entityId);
    }
  }

  resetWatchedEntities() {
    this.#watchedEntities.clear();
  }
}

export { ChangeTracker };
