/*
 * EntityHelper: resolves a single entity (state, attributes, name tokens,
 * value kind) into renderable values.
 */

import { CARD, CARD_CONTEXT, HA_CONTEXT } from '../utils/parameters.js';
import type { ValueKind } from '../utils/ha-context.js';
import { assertDefined, is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import { NumberFormatter } from './formatting.js';
import { domainProfile, stateColor } from './ha-state.js';
import type { NameTokenType } from './schema.js';

// One entry of the `name` config option's composition array (see
// EditorFieldsType.entityName / types.stateContent in schema.ts).
type NameToken = { type: NameTokenType; text?: string };

const KINDS_WITHOUT_HISTORY: ReadonlySet<ValueKind> = new Set(['timer', 'counter', 'duration']);

// A duration sensor reads as seconds for its own state only, not an attribute.
const valueKindOf = (entityId: string, attribute: unknown): ValueKind => {
  const kind = domainProfile(HassProviderSingleton.getEntityDomain(entityId)).kind;
  if (kind) return kind;
  const deviceClass = HassProviderSingleton.getInstance().getEntityProp(entityId, HA_CONTEXT.attributes.deviceClass);
  return deviceClass === HA_CONTEXT.deviceClasses.duration && !is.nonEmptyString(attribute) ? 'duration' : 'default';
};

// This class's own #value stays genuinely `any` on purpose: an entity's
// value is polymorphic per domain (number, string, timer duration...), same
// rationale as EntityState.attributes in hass-provider.ts - not the same
// case as HomeAssistant/EntityState's own envelope fields, which do have one
// stable shape worth modeling.
class EntityHelper {
  #hassProvider: HassProviderSingleton = HassProviderSingleton.getInstance();
  #isValid = false;
  // skipcq: JS-0323 -- entity value is polymorphic (num/str/timer/object)
  #value: any = {};
  #entityId: string | null = null;
  #attribute: string | null = null;
  #color: string | null = null;
  #subtract = false;
  #isMain = false;
  #state: string | null = null;
  #domain: string | null = null;
  #valueKind: ValueKind | null = null;
  // undefined: not resolved since the last refresh.
  #defaultColor: string | null | undefined = undefined;
  #stateContent: string[] = [];
  #nameTokens: NameToken[] | null = null;
  static #refreshByKind: Record<ValueKind, (self: EntityHelper) => void> = {
    timer: (self) => self._manageTimerEntity(),
    duration: (self) => self._manageDurationEntity(),
    counter: (self) => self._manageRangedEntity(),
    number: (self) => self._manageRangedEntity(),
    default: (self) => self._manageStdEntity(),
  };

  constructor() {
    traceInstance('EntityHelper', CARD_CONTEXT.debug.instances);
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set entityId(newValue: string) {
    this.#entityId = newValue;
    this.#nameTokens = null;
    this.#valueKind = null;
    this.#defaultColor = undefined;
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
    this.#valueKind = null;
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

  // skipcq: JS-0323 -- polymorphic entity value (see #value)
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
    return this.#isValid && this.valueKind === 'default' ? this.#hassProvider.getNumericAttributes(this.#entity) : {};
  }

  get #percentMapping() {
    return domainProfile(this.#domain).percent;
  }

  get name(): string {
    return this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.friendlyName);
  }

  _nameResolver(): string {
    const resolvers: Record<NameTokenType, (item: NameToken) => string | null> = {
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

  get formatedEntityState(): string {
    return this.#hassProvider.getEntityProp(this.#entity, 'state', true);
  }

  get unit(): string | null {
    if (!this.#isValid) return null;
    if (this.valueKind === 'timer') return CARD.config.unit.flexTimer;
    if (this.valueKind === 'duration') return CARD.config.unit.second;
    if (this.valueKind === 'counter') return CARD.config.unit.disable;
    // Neither carries unit_of_measurement: climate uses the global unit
    // system, weather its own per-attribute `<attr>_unit` key.
    const mapping = this.#percentMapping;
    if (mapping?.unit === 'system_temperature') return this.#hassProvider.temperatureUnit;
    if (mapping?.unit === 'attribute_suffix') {
      const attr = this.#attribute || mapping.attribute;
      const unitAttr = this.#hassProvider.getEntityAttribute<unknown>(this.#entity, `${attr}_unit`);
      return is.nonEmptyString(unitAttr) ? unitAttr : null;
    }

    return this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.unit);
  }

  get precision(): number | null {
    return this.#isValid
      ? (this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.displayPrecision) ?? null)
      : null;
  }

  get valueKind(): ValueKind {
    this.#valueKind ??= valueKindOf(this.#entity, this.#attribute);
    return this.#valueKind;
  }

  // Read five times per render: resolved once per refresh.
  get defaultColor(): string | null {
    if (this.#defaultColor === undefined) {
      this.#defaultColor =
        this.#domain === null || this.#state === null
          ? null
          : stateColor(
              this.#domain,
              this.#hassProvider.getEntityProp<string>(this.#entity, HA_CONTEXT.attributes.deviceClass) ?? null,
              this.#state,
              this.#hassProvider.getEntityAttribute<unknown>(this.#entity, HA_CONTEXT.attributes.entityId),
            );
    }
    return this.#defaultColor;
  }

  get stateContentToString(): string {
    // Two exceptions, and everything else - 'state' included - read as a
    // plain property. The registry lookups are the only ones that can answer
    // null and need a blank of their own.
    const results = this.#stateContent.map((attr) => {
      if (attr === 'device_name') return this.#hassProvider.getEntityDevice(this.#entity) ?? '';
      if (attr === 'area_name') return this.#hassProvider.getEntityArea(this.#entity) ?? '';
      return this.#hassProvider.getEntityProp(this.#entity, attr, true);
    });

    return results.length !== 0 ? results.join(CARD.config.separator) : '';
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this.#defaultColor = undefined;
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

    EntityHelper.#refreshByKind[this.valueKind](this);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  _manageStdEntity() {
    const mapping = this.#percentMapping;
    this.#attribute = this.#attribute || (mapping?.attribute ?? null);
    if (!this.#attribute) {
      this.#value = parseFloat(this.#state as string) || 0;
      return;
    }

    const attrValue = this.#hassProvider.getEntityAttribute(this.#entity, this.#attribute);

    if (is.numericString(attrValue) || is.number(attrValue)) {
      this.#value = parseFloat(String(attrValue));
      // Only the domain's own default attribute carries the declared scale -
      // any other attribute the user picks is read as-is.
      if (mapping?.scale && this.#attribute === mapping.attribute) {
        this.#value = (100 * this.#value) / mapping.scale;
      }
    } else {
      this.#value = 0;
      this.#isValid = false;
    }
  }

  _manageTimerEntity() {
    let duration: number;
    let elapsed: number;
    let startedAt: number | null = null;
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
        const finished_at = new Date(
          this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.timer.finishesAt),
        ).getTime();
        duration = NumberFormatter.convertDuration(
          this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.timer.duration),
        );
        startedAt = finished_at - duration;
        elapsed = Date.now() - startedAt;
        break;
      }
      case HA_CONTEXT.entity.state.paused: {
        const remaining = NumberFormatter.convertDuration(
          this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.timer.remaining),
        );
        duration = NumberFormatter.convertDuration(
          this.#hassProvider.getEntityProp(this.#entity, HA_CONTEXT.attributes.timer.duration),
        );
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
      startedAt,
    };
  }

  _manageRangedEntity() {
    const [min, max] = assertDefined(domainProfile(this.#domain).range, `EntityHelper: no range for '${this.#domain}'`);
    this.#value = {
      current: parseFloat(this.#state as string),
      min: this.#hassProvider.getEntityAttribute(this.#entity, min),
      max: this.#hassProvider.getEntityAttribute(this.#entity, max),
    };
  }

  _manageDurationEntity() {
    const unit = this.#hassProvider.getEntityProp<string>(this.#entity, HA_CONTEXT.attributes.unit);
    const value = parseFloat(this.#state as string);
    // CF5 - issue (critical) resolved - getEntityProp returns null (never
    // undefined), so the guard never matched and a missing unit crashed in
    // durationToSeconds
    const seconds = is.nullish(unit) ? null : NumberFormatter.durationToSeconds(value, unit);
    this.#value = seconds ?? 0;
    this.#isValid = seconds !== null;
  }
}

// Whether the recorder keeps a numeric history worth reading: none for an
// attribute, nor for a timer, a counter or a duration. The one rule the card
// fetches history by and the editor offers peak_marker by.
const hasUsableHistory = (entity: unknown, attribute?: unknown): entity is string =>
  is.nonEmptyString(entity) &&
  !is.nonEmptyString(attribute) &&
  !KINDS_WITHOUT_HISTORY.has(valueKindOf(entity, attribute));

export { EntityHelper, hasUsableHistory };
export type { NameToken };
