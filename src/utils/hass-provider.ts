/*
 * HassProviderSingleton: the single shared access point to the live Home
 * Assistant hass object (entity/device/area lookups, localization, number
 * formatting) - every class that needs hass state reads it from here instead of
 * holding its own reference.
 */

import { CARD_CONTEXT, HA_CONTEXT, CARD, SEV } from './parameters.js';
import { TRANSLATIONS } from './translations.js';
import { is, has } from './common-checks.js';
import { Logger, type LoggerInstance } from './log.js';

// Phantom brand (never actually present at runtime) marking a value as "the
// real HA hass object", vs. plain `any`. Shape stays untyped on purpose (see
// #hass below) - the brand only guards against passing some OTHER
// concretely-typed value (e.g. an `entityId: string`) into a `Hass`-typed
// slot, or vice versa, such as an argument-order mixup. It does NOT catch a
// wrong value that is itself already `any` - `any` is assignable to and from
// every type, brands included. That gap closes only as more of the callers
// that currently hand `hass` around untyped (core.js, view.js, editor/base.js)
// get converted to real TypeScript themselves.
declare const hassBrand: unique symbol;
type Hass = { readonly [hassBrand]: true } & Record<string, any>;

// Same phantom-brand pattern, for a single entity's state object
// (`hass.states[entityId]`) - distinct from `Hass` (the root object) so the
// two can't be swapped positionally, e.g. in
// `this.#hass?.formatEntityAttributeValue?.(stateObj, prop)` below.
declare const entityStateBrand: unique symbol;
type EntityState = { readonly [entityStateBrand]: true } & Record<string, any>;

/**
 * Singleton wrapper around Home Assistant's `hass` object: entity/device/
 * area lookups, attribute resolution, localization (`localize()`), and
 * number/relative-time formatting. Accessed via `getInstance()` — the
 * constructor throws if called directly, so every consumer shares the same
 * instance and the same current `hass` reference.
 */
class HassProviderSingleton {
  static #instance: HassProviderSingleton | null = null;
  static #allowInit = false;
  static #entityMap: Record<string, { source: 'attribute' | 'state' | 'entity' }> = {
    device_class: { source: 'attribute' },
    friendly_name: { source: 'attribute' },
    icon: { source: 'attribute' },
    unit_of_measurement: { source: 'attribute' },
    finishes_at: { source: 'attribute' },
    duration: { source: 'attribute' },
    remaining: { source: 'attribute' },
    entity_picture: { source: 'attribute' },
    state: { source: 'state' },
    last_changed: { source: 'state' },
    last_updated: { source: 'state' },
    display_precision: { source: 'entity' },
  };
  #debug = CARD_CONTEXT.debug.hass;
  #log: LoggerInstance | null = null;
  // The actual Home Assistant `hass` object - a huge, versioned, externally
  // owned shape (see home-assistant-frontend). Deliberately untyped: modeling
  // it precisely isn't worth it for the handful of properties read below,
  // all already defensively optional-chained against a missing/partial hass.
  #hass: Hass | null = null;
  #isValid = false;
  #translations: Record<string, any> = {};
  #rtf: Intl.RelativeTimeFormat | null = null;
  #rtfLanguage: string | null = null;

  constructor() {
    if (!HassProviderSingleton.#allowInit) {
      throw new Error('Use HassProviderSingleton.getInstance() instead of new.');
    }
    this.#log = Logger.create('HassProviderSingleton', this.#debug ? SEV.debug : SEV.info);
    HassProviderSingleton.#allowInit = false;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set hass(hass: Hass) {
    if (!hass) return;
    const firstHass = this.#hass === null;
    const previousLanguage = this.language;
    this.#hass = hass;
    const currentLanguage = this.language;
    if (firstHass || previousLanguage !== currentLanguage) this.#loadTranslations(currentLanguage);
    this.#isValid = true;
    this.#log?.debug('HASS updated!');
  }

  get hass(): Hass | null {
    return this.#hass;
  }

  get isValid() {
    return this.#isValid;
  }

  get language(): string {
    return this.#hass?.language in TRANSLATIONS ? this.#hass?.language : CARD.config.language;
  }

  getMessage(code: string): string {
    return this.localize('card.msg')[code] || `Unknown message code: ${code}`;
  }

  get numberFormat() {
    const localeFromLang = (lang: string) => {
      try {
        return new Intl.NumberFormat(lang).resolvedOptions().locale;
      } catch {
        return 'en-US';
      }
    };
    const userDef = this.#hass?.locale?.number_format;
    const numberFormatMap: Record<string, string> = {
      ...HA_CONTEXT.numberFormat,
      language: localeFromLang(this.language),
      system: Intl.NumberFormat().resolvedOptions().locale,
      none: 'en',
    };
    return numberFormatMap[userDef] || localeFromLang(this.language);
  }

  get version(): string | null {
    return this.#hass?.config?.version ?? null;
  }

  get hasNewShapeStrategy(): boolean {
    const [year, month] = (this.version ?? '0.0').split('.').map(Number);
    return year > 2025 || (year === 2025 && month >= 3);
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  localize(key: string): any {
    const result = key.split('.').reduce((obj, k) => obj?.[k], this.#translations);
    return result ?? key;
  }

  static getInstance(): HassProviderSingleton {
    if (!HassProviderSingleton.#instance) {
      HassProviderSingleton.#allowInit = true;
      HassProviderSingleton.#instance = new HassProviderSingleton();
    }
    return HassProviderSingleton.#instance;
  }

  getEntityProp(entityId: string, prop: string, format = false): any {
    return format ? this.#formatEntityProp(entityId, prop) : this.#resolveEntityProp(entityId, prop);
  }

  #resolveEntityProp(entityId: string, prop: string): any {
    const mapping = HassProviderSingleton.#entityMap[prop];
    if (!mapping) return null;

    const resolvers: Record<string, () => any> = {
      attribute: () => this.getEntityAttribute(entityId, prop),
      state: () => this.getEntityStateObj(entityId)?.[prop] ?? null,
      entity: () => this.#hass?.entities?.[entityId]?.[prop] ?? null,
    };

    return resolvers[mapping.source]?.() ?? null;
  }

  #formatEntityProp(entityId: string, prop: string): any {
    if (prop === 'last_changed' || prop === 'last_updated')
      return this.getRelativeTime(this.#resolveEntityProp(entityId, prop));

    const stateObj = this.getEntityStateObj(entityId);
    if (prop === 'state')
      return stateObj ? (this.#hass?.formatEntityState?.(stateObj) ?? '') : this.localize('card.msg.entityNotFound');

    return this.#hass?.formatEntityAttributeValue?.(stateObj, prop) ?? '';
  }

  hasEntity(entityId: string): boolean {
    return entityId in (this.#hass?.states || {});
  }

  getEntityStateObj(entityId: string): EntityState | null {
    return this.#hass?.states?.[entityId] ?? null;
  }

  #getAttributes(entityId: string): Record<string, any> {
    return this.getEntityStateObj(entityId)?.attributes ?? {};
  }

  getEntityAttribute(entityId: string, attribute: string): any {
    if (!attribute) return null;
    const attributes = this.#getAttributes(entityId);
    return attribute in attributes ? attributes[attribute] : null;
  }

  getEntityName(entityId: string): string | null {
    // CF5 - issue (critical) resolved - entities without unique_id are absent
    // from hass.entities; missing optional chaining crashed name tokens (type:
    // entity)
    return this.#hass?.entities?.[entityId]?.name ?? null;
  }

  getEntityDevice(entityId: string): string | null {
    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return null;
    return this.#hass?.devices?.[deviceId]?.name ?? null;
  }

  // Used by ViewCore.isBatteryCharging/isWashingMachineActive to look at
  // other entities on the same device as the card's own `entity`, each then
  // filtering by state, not by entity_id: an id-based guess (e.g. requiring
  // "charg" in the name) misses integrations that don't name their status
  // entity after what it reports - Home Assistant's own Companion App calls
  // its charging-status sensor battery_state, not anything containing
  // "charg".
  getSameDeviceEntities(entityId: string): string[] {
    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return [];
    return Object.keys(this.#hass?.entities ?? {}).filter(
      (id) => id !== entityId && this.#hass?.entities[id].device_id === deviceId,
    );
  }

  getEntityArea(entityId: string): string | null {
    const entityAreaId = this.#hass?.entities?.[entityId]?.area_id;
    if (entityAreaId) return this.#hass?.areas?.[entityAreaId]?.name ?? null;

    const deviceId = this.#hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return null;
    const deviceAreaId = this.#hass?.devices?.[deviceId]?.area_id;
    return this.#hass?.areas?.[deviceAreaId]?.name ?? null;
  }

  getEntityFloor(entityId: string): string | null {
    const areaId =
      this.#hass?.entities?.[entityId]?.area_id ??
      this.#hass?.devices?.[this.#hass?.entities?.[entityId]?.device_id]?.area_id;
    if (!areaId) return null;
    const floorId = this.#hass?.areas?.[areaId]?.floor_id;
    return this.#hass?.floors?.[floorId]?.name ?? null;
  }

  static getEntityDomain(entityId: unknown): string | null {
    return is.string(entityId) && entityId.includes('.') ? entityId.split('.')[0] : null;
  }

  isEntityAvailable(entityId: string): boolean {
    const state = this.getEntityStateObj(entityId)?.state;
    return state !== 'unavailable' && state !== 'unknown';
  }

  getRelativeTime(curTime: string | null): string {
    if (!curTime) return '';

    const startTime = new Date(curTime).getTime();
    const now = Date.now();
    const diffInSeconds = Math.floor((startTime - now) / 1000);

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    // 'second' (last entry) always matches, so find() never returns
    // undefined - the array can't run out without a hit.
    const { unit, seconds } = units.find(({ unit: u, seconds: s }) => Math.abs(diffInSeconds) >= s || u === 'second')!;
    const value = Math.round(diffInSeconds / seconds);
    return this.#getRelativeTimeFormat().format(value, unit);
  }

  getNumericAttributes(entityId: string): Record<string, number> {
    return Object.fromEntries(
      Object.entries(this.#getAttributes(entityId))
        .filter(([, val]) => is.number(val) || is.numericString(val))
        .map(([key, val]) => [key, is.number(val) ? val : parseFloat(val)]),
    );
  }

  #loadTranslations(lang: string) {
    const curLanguage = has.own(TRANSLATIONS, lang) ? lang : CARD.config.language;
    this.#translations = TRANSLATIONS[curLanguage as keyof typeof TRANSLATIONS];
  }

  #getRelativeTimeFormat(): Intl.RelativeTimeFormat {
    if (!this.#rtf || this.#rtfLanguage !== this.language) {
      this.#rtfLanguage = this.language;
      this.#rtf = new Intl.RelativeTimeFormat(this.language, { numeric: 'auto' });
    }
    return this.#rtf;
  }
}

export { HassProviderSingleton };
export type { Hass, EntityState };
