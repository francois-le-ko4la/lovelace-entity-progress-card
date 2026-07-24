/*
 * EntityHelper: resolves a single entity (state, attributes, name tokens,
 * type/timer/duration handling) into renderable values.
 */

import { CARD, CARD_CONTEXT, HA_CONTEXT } from '../utils/parameters.js';
import { assertDefined, is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import { HassProviderSingleton, type EntityState } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';

// One entry of the `name` config option's composition array (see
// EditorFieldsType.entityName / types.stateContent in schema.ts).
type NameToken = { type: string; text?: string };

/**
 * Helper class for managing entities. This class validates and retrieves
 * information from Home Assistant if it's an entity.
 */
// This class's own #value stays genuinely `any` on purpose: an entity's
// value is polymorphic per domain (number, string, timer duration...), same
// rationale as EntityState.attributes in hass-provider.ts - not the same
// case as HomeAssistant/EntityState's own envelope fields, which do have one
// stable shape worth modeling.
class EntityHelper {
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #isValid = false;
  #value: any = {};
  #entityId: string | null = null;
  #attribute: string | null = null;
  #color: string | null = null;
  #subtract = false;
  #isMain = false;
  #state: string | null = null;
  #domain: string | null = null;
  #entityType: string | null = null;
  #entityTypeFlags: Record<string, boolean> = {
    isTimer: false,
    isDuration: false,
    isNumber: false,
    isCounter: false,
    isSynced: false,
  };
  #stateContent: string[] = [];
  #nameTokens: NameToken[] | null = null;
  static #handleRefreshType = new Map<string, (self: EntityHelper) => void>([
    [HA_CONTEXT.entity.type.timer, (self) => self._manageTimerEntity()],
    [HA_CONTEXT.entity.type.duration, (self) => self._manageDurationEntity()],
    [HA_CONTEXT.entity.type.counter, (self) => self._manageCounterAndNumberEntity('minimum', 'maximum')],
    [HA_CONTEXT.entity.type.number, (self) => self._manageCounterAndNumberEntity('min', 'max')],
    [HA_CONTEXT.entity.type.default, (self) => self._manageStdEntity()],
  ]);

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set entityId(newValue: string) {
    this.#entityId = newValue;
    this.#nameTokens = null;
    this.#entityType = null;
    this.#entityTypeFlags.isSynced = false;
    this.#value = 0;
    this.#domain = HassProviderSingleton.getEntityDomain(newValue);
    this.#isValid = this.#hassProvider.hasEntity(this.#entity);
  }

  get entityId(): string | null {
    return this.#entityId;
  }

  // Every other method below only ever runs after entityId has been set (the
  // setter is always the first thing called on a fresh EntityHelper - see
  // EntityOrValue.set value / EntityCollectionHelper.addEntity) - this getter
  // documents and enforces that precondition once, instead of a bare
  // `this.#entityId!` at every hassProvider call site.
  get #entity(): string {
    return assertDefined(this.#entityId, 'EntityHelper method called before entityId was set');
  }

  set attribute(newValue: string | null) {
    this.#attribute = newValue;
  }

  get attribute(): string | null {
    return this.#attribute;
  }

  set color(newValue: string | null) {
    this.#color = newValue ?? null;
  }

  get color(): string | null {
    return this.#color;
  }

  set subtract(newValue: unknown) {
    this.#subtract = Boolean(newValue);
  }

  get subtract(): boolean {
    return this.#subtract;
  }

  set isMain(newValue: unknown) {
    this.#isMain = Boolean(newValue);
  }

  get isMain(): boolean {
    return this.#isMain;
  }

  set nameTokens(tok: unknown) {
    this.#nameTokens = is.nonEmptyArray(tok) ? (tok as NameToken[]) : null;
  }

  get nameTokens(): NameToken[] | null {
    return this.#nameTokens;
  }

  set stateContent(val: string[]) {
    this.#stateContent = val;
  }

  get stateContent(): string[] {
    return this.#stateContent;
  }

  get value(): any {
    return this.#isValid ? this.#value : 0;
  }

  get state(): string | null {
    return this.#state;
  }

  get isValid(): boolean {
    return this.#isValid;
  }

  get isAvailable(): boolean {
    return this.#hassProvider.isEntityAvailable(this.#entity);
  }

  get attributes(): Record<string, number> {
    return this.#isValid &&
      !this.entityType.isCounter &&
      !this.entityType.isNumber &&
      !this.entityType.isDuration &&
      !this.entityType.isTimer
      ? this.#hassProvider.getNumericAttributes(this.#entity)
      : {};
  }

  get hasAttribute(): boolean {
    return this.#isValid && Object.keys(this.attributes).length > 0;
  }

  get defaultAttribute(): string | null {
    return HA_CONTEXT.attributeMapping[this.#domain as keyof typeof HA_CONTEXT.attributeMapping]?.attribute ?? null;
  }

  get name(): string {
    return this.#hassProvider.getEntityProp(this.#entity, 'friendly_name');
  }

  _nameResolver(): string {
    const resolvers: Record<string, (item: NameToken) => string | null> = {
      text: (item) => item.text ?? null,
      entity: () => this.#hassProvider.getEntityName(this.#entity),
      device: () => this.#hassProvider.getEntityDevice(this.#entity),
      area: () => this.#hassProvider.getEntityArea(this.#entity),
      floor: () => this.#hassProvider.getEntityFloor(this.#entity),
    };

    const tokens = assertDefined(this.#nameTokens, 'EntityHelper._nameResolver() called with no tokens set');

    return tokens
      .map((item) => {
        const resolver = resolvers[item.type];
        if (!resolver) return null;
        try {
          return resolver(item);
        } catch {
          return null;
        }
      })
      .filter((v) => is.nonEmptyString(v))
      .join(' ');
  }

  get nameComposition(): string {
    return this.#nameTokens ? this._nameResolver() : this.name;
  }

  get stateObj(): EntityState | null {
    return this.#hassProvider.getEntityStateObj(this.#entity);
  }

  get formatedEntityState(): string {
    return this.#hassProvider.getEntityProp(this.#entity, 'state', true);
  }

  get unit(): string | null {
    if (!this.#isValid) return null;
    if (this.entityType.isTimer) return CARD.config.unit.flexTimer;
    if (this.entityType.isDuration) return CARD.config.unit.second;
    if (this.entityType.isCounter) return CARD.config.unit.disable;

    return this.#hassProvider.getEntityProp(this.#entity, 'unit_of_measurement');
  }

  get precision(): number | null {
    return this.#isValid ? (this.#hassProvider.getEntityProp(this.#entity, 'display_precision') ?? null) : null;
  }

  get entityType(): Record<string, boolean> {
    if (!this.#entityTypeFlags.isSynced) {
      const type = this.getEntityType();
      const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
      this.#entityTypeFlags = { isTimer: false, isDuration: false, isNumber: false, isCounter: false, isSynced: true };
      this.#entityTypeFlags[key] = true;
    }
    return this.#entityTypeFlags;
  }

  get hasShapeByDefault(): boolean {
    return [HA_CONTEXT.entity.type.light, HA_CONTEXT.entity.type.fan].includes(this.#domain as string);
  }

  get defaultColor(): string | null {
    const colorMap: Record<string, string> = {
      [HA_CONTEXT.entity.type.timer]:
        this.value?.state === HA_CONTEXT.entity.state.active ? CARD.style.color.active : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.cover]: this.value > 0 ? CARD.style.color.coverActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.light]: this.value > 0 ? CARD.style.color.lightActive : CARD.style.color.inactive,
      // state, not value: a fan on a dynamic preset (e.g. "auto") is genuinely
      // on but its percentage attribute can legitimately read 0 - the fan
      // decides its own speed rather than reporting a fixed one.
      [HA_CONTEXT.entity.type.fan]:
        this.state === HA_CONTEXT.entity.state.on ? CARD.style.color.fanActive : CARD.style.color.inactive,
      [HA_CONTEXT.entity.type.climate]: this.#getClimateColor(),
      [HA_CONTEXT.entity.class.battery]: this.#getBatteryColor(),
    };

    return (
      colorMap[this.#domain as string] ??
      colorMap[this.#hassProvider.getEntityProp(this.#entity, 'device_class')] ??
      null
    );
  }

  get stateContentToString(): string {
    const results: string[] = [];

    for (const attr of this.#stateContent) {
      switch (attr) {
        case 'state':
          results.push(this.#hassProvider.getEntityProp(this.#entity, 'state', true));
          break;
        case 'device_name':
          results.push(this.#hassProvider.getEntityDevice(this.#entity) ?? '');
          break;
        case 'area_name':
          results.push(this.#hassProvider.getEntityArea(this.#entity) ?? '');
          break;
        default:
          results.push(this.#hassProvider.getEntityProp(this.#entity, attr, true));
          break;
      }
    }

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  getEntityType(): string {
    this.#entityType ??= EntityHelper.#handleRefreshType.has(this.#domain as string)
      ? (this.#domain as string)
      : this.#hassProvider.getEntityProp(this.#entity, 'device_class') === HA_CONTEXT.entity.type.duration &&
          !this.#attribute
        ? HA_CONTEXT.entity.type.duration
        : HA_CONTEXT.entity.type.default;

    return this.#entityType;
  }

  refresh() {
    this.#isValid = this.#hassProvider.hasEntity(this.#entity);

    if (!this.#isValid) {
      this.#state = HA_CONTEXT.entity.state.notFound;
      return;
    }

    if (this.#attribute)
      // CF5 - issue (major) resolved - getEntityAttribute returns null (never
      // undefined) when missing, so this check always passed and invalid
      // attributes produced NaN downstream
      this.#isValid = this.#hassProvider.getEntityAttribute(this.#entity, this.#attribute) !== null;

    this.#state = this.#hassProvider.getEntityProp(this.#entity, 'state');
    if (!this.isValid || !this.isAvailable) return;

    const type = this.getEntityType();
    const handler = assertDefined(
      EntityHelper.#handleRefreshType.get(type) ?? EntityHelper.#handleRefreshType.get(HA_CONTEXT.entity.type.default),
      `EntityHelper: no refresh handler for '${type}' and no default handler registered`,
    );
    handler(this);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _manageStdEntity() {
    this.#attribute =
      this.#attribute ||
      HA_CONTEXT.attributeMapping[this.#domain as keyof typeof HA_CONTEXT.attributeMapping]?.attribute;
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state as string) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entity, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(String(attrValue));
      if (
        this.#domain === HA_CONTEXT.attributeMapping.light.label &&
        this.#attribute === HA_CONTEXT.attributeMapping.light.attribute
      ) {
        this.#value = (100 * this.#value) / 255;
      }
    } else {
      // Si l'attribut n'est pas trouvé, définir un comportement
      this.#value = 0;
      this.#isValid = false;
    }
  }

  _manageTimerEntity() {
    let duration: number;
    let elapsed: number;
    switch (this.#state) {
      case HA_CONTEXT.entity.state.idle: {
        // elapsed/duration aren't real millisecond durations here (no timer
        // is running) - just the generic [0, 100] placeholder range.
        // Pre-multiplied so the shared `/ CARD.config.msFactor` below cancels
        // out to that same [0, 100] range instead of collapsing it to
        // [0, 0.1], which sent anything reading this.#value (e.g. a
        // watermark's high/low position) wildly out of bounds.
        elapsed = CARD.config.value.min * CARD.config.msFactor;
        duration = CARD.config.value.max * CARD.config.msFactor;
        break;
      }
      case HA_CONTEXT.entity.state.active: {
        const finished_at = new Date(this.#hassProvider.getEntityProp(this.#entity, 'finishes_at')).getTime();
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'duration'));
        const started_at = finished_at - duration;
        const now = new Date().getTime();
        elapsed = now - started_at;
        break;
      }
      case HA_CONTEXT.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'remaining'));
        duration = NumberFormatter.convertDuration(this.#hassProvider.getEntityProp(this.#entity, 'duration'));
        elapsed = duration - remaining;
        break;
      }
      default:
        throw new Error('Timer entity - Unknown case');
    }
    this.#value = {
      current: elapsed / CARD.config.msFactor,
      min: CARD.config.value.min,
      max: duration / CARD.config.msFactor,
      state: this.#state,
    };
  }

  _manageCounterAndNumberEntity(min: string, max: string) {
    this.#value = {
      current: parseFloat(this.#state as string),
      min: this.#hassProvider.getEntityAttribute(this.#entity, min),
      max: this.#hassProvider.getEntityAttribute(this.#entity, max),
    };
  }

  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp(this.#entity, 'unit_of_measurement');
    const value = parseFloat(this.#state as string);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never
    // undefined), so the guard never matched and a missing unit crashed in
    // durationToSeconds
    const seconds = is.nullish(unit) ? null : NumberFormatter.durationToSeconds(value, unit);
    this.#value = seconds ?? 0;
    this.#isValid = seconds !== null;
  }

  #getClimateColor(): string {
    const climateColorMap: Record<string, string> = {
      heat_cool: CARD.style.color.active,
      dry: CARD.style.color.climate.dry,
      cool: CARD.style.color.climate.cool,
      heat: CARD.style.color.climate.heat,
      fan_only: CARD.style.color.climate.fanOnly,
    };
    return climateColorMap[this.#state as string] || CARD.style.color.inactive;
  }

  #getBatteryColor(): string {
    if (!this.#value || this.#value <= 30) return CARD.style.color.battery.low;
    if (this.#value <= 70) return CARD.style.color.battery.medium;
    return CARD.style.color.battery.high;
  }
}

export { EntityHelper };
export type { NameToken };
