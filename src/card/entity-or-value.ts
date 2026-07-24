/*
 * EntityOrValue: a value slot that is either a fixed number (ValueHelper) or an
 * entity (EntityHelper), delegating to whichever is currently active.
 */

import { CARD_CONTEXT } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import type { EntityState } from '../utils/hass-provider.js';
import { ValueHelper } from './value-primitives.js';
import { EntityHelper, type NameToken } from './entity-helper.js';

/**
 * Represents either an entity ID or a direct value. This class validates the
 * provided value and retrieves information from Home Assistant if it's an
 * entity.
 */
class EntityOrValue {
  #activeHelper: EntityHelper | ValueHelper | null = null;

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  // TypeScript narrows the union on `instanceof` directly, so this needs no
  // separate #isEntity discriminant flag (and no `as EntityHelper` cast at
  // the call sites): the returned value is already typed EntityHelper.
  #entity(): EntityHelper | null {
    return this.#activeHelper instanceof EntityHelper ? this.#activeHelper : null;
  }

  // ─── PUBLIC GETTERS / SETTERS ─────────────────────────────────────────────

  set value(newValue: unknown) {
    if (is.string(newValue)) {
      if (!(this.#activeHelper instanceof EntityHelper)) this.#activeHelper = new EntityHelper();
      this.#activeHelper.entityId = newValue;
    } else if (is.number(newValue)) {
      if (!(this.#activeHelper instanceof ValueHelper)) this.#activeHelper = new ValueHelper();
      this.#activeHelper.value = newValue;
    } else {
      this.#activeHelper = null;
    }
  }

  // skipcq: JS-0323 -- delegates to the polymorphic entity value
  get value(): any {
    return this.#activeHelper?.value ?? null;
  }

  get isEntity(): boolean {
    return this.#activeHelper instanceof EntityHelper;
  }

  get isValid(): boolean {
    return this.#activeHelper?.isValid ?? false;
  }

  get isAvailable(): boolean {
    const entity = this.#entity();
    if (entity) return entity.isAvailable || entity.isValid;
    return this.#activeHelper?.isValid ?? false;
  }

  get state(): string | null {
    return this.#entity()?.state ?? null;
  }

  get precision(): number | null {
    return this.#entity()?.precision ?? null;
  }

  get name(): string | null {
    return this.#entity()?.name ?? null;
  }

  get nameComposition(): string | null {
    return this.#entity()?.nameComposition ?? null;
  }

  get formatedEntityState(): string | null {
    return this.#entity()?.formatedEntityState ?? null;
  }

  get stateContent(): string[] | null {
    return this.#entity()?.stateContent ?? null;
  }

  set stateContent(newValue: string[]) {
    const entity = this.#entity();
    if (entity) entity.stateContent = newValue;
  }

  get stateContentToString(): string | null {
    return this.#entity()?.stateContentToString ?? null;
  }

  get entityType(): Record<string, boolean> {
    return (
      this.#entity()?.entityType ?? {
        isTimer: false,
        isDuration: false,
        isNumber: false,
        isCounter: false,
        isSynced: false,
      }
    );
  }

  get hasShapeByDefault(): boolean {
    return this.#entity()?.hasShapeByDefault ?? false;
  }

  get defaultColor(): string | null | false {
    return this.#entity()?.defaultColor ?? false;
  }

  get hasAttribute(): boolean {
    return this.#entity()?.hasAttribute ?? false;
  }

  get defaultAttribute(): string | null {
    return this.#entity()?.defaultAttribute ?? null;
  }

  get attributes(): Record<string, number> | null {
    return this.#entity()?.attributes ?? null;
  }

  get unit(): string | null {
    return this.#entity()?.unit ?? null;
  }

  get stateObj(): EntityState | null {
    return this.#entity()?.stateObj ?? null;
  }

  get nameTokens(): NameToken[] | null {
    return this.#entity()?.nameTokens ?? null;
  }

  set nameTokens(tok: unknown) {
    const entity = this.#entity();
    if (entity) entity.nameTokens = tok;
  }

  get attribute(): string | null {
    return this.#entity()?.attribute ?? null;
  }

  set attribute(newValue: string | null) {
    const entity = this.#entity();
    if (entity) entity.attribute = newValue;
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  refresh() {
    this.#entity()?.refresh();
  }
}

export { EntityOrValue };
