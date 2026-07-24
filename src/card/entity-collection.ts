/*
 * EntityCollectionHelper: aggregates multiple entities (bar_stack) into
 * stacked/proportional/net magnitudes and diverging gradients.
 */

import { CARD_CONTEXT } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { traceInstance } from '../utils/log.js';
import { ThemeManager } from './theme-manager.js';
import { EntityHelper } from './entity-helper.js';

/**
 * Helper class for managing entities collection.
 */

class EntityCollectionHelper {
  #entities: EntityHelper[] = [];
  #mode = 'stacked';

  constructor() {
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  static #numericValue(helper: EntityHelper): number {
    const value = helper.value;
    return is.number(value) ? value : (value?.current ?? 0);
  }

  // Width/share math always wants a magnitude - a negative raw value must never
  // turn into a negative width (nonsensical for a gradient stop or an arm
  // size).
  static #magnitude(helper: EntityHelper): number {
    return Math.abs(EntityCollectionHelper.#numericValue(helper));
  }

  // An entity counts as a negative contributor if explicitly marked `subtract`,
  // or if its own raw value is already negative (e.g. a grid-power sensor
  // signed by convention - see the `net` mode note in configuration.md).
  // Checking both - rather than just blindly negating when `subtract` is set -
  // means `subtract: true` on an already-negative value can't double-negate it
  // back to positive.
  static #isNegative(helper: EntityHelper): boolean {
    return helper.subtract || EntityCollectionHelper.#numericValue(helper) < 0;
  }

  static #magnitudeSum(entities: EntityHelper[]): number {
    return entities.reduce((sum, helper) => sum + EntityCollectionHelper.#magnitude(helper), 0);
  }

  static #splitByNegative(entities: EntityHelper[]): { positive: EntityHelper[]; negative: EntityHelper[] } {
    return {
      positive: entities.filter((helper) => !EntityCollectionHelper.#isNegative(helper)),
      negative: entities.filter((helper) => EntityCollectionHelper.#isNegative(helper)),
    };
  }

  set mode(newMode: string) {
    this.#mode = ['proportional', 'net'].includes(newMode) ? newMode : 'stacked';
  }

  get mode(): string {
    return this.#mode;
  }

  addEntity(
    entityId: string,
    attribute: string | null = null,
    color: string | null = null,
    subtract = false,
    isMain = false,
  ) {
    const helper = new EntityHelper();
    helper.entityId = entityId;
    if (attribute) helper.attribute = attribute;
    if (color) helper.color = color;
    helper.subtract = subtract;
    helper.isMain = isMain;
    this.#entities.push(helper);
  }

  refreshAll() {
    this.#entities.forEach((helper) => helper.refresh());
  }

  // Plain magnitude sum, mode-agnostic - the fill amount for
  // 'stacked'/'proportional' (both centered and not) and the non-centered
  // text/value. See getNetValue() for the sign-aware total ('net' mode, and
  // 'stacked'/'proportional' + center_zero's label).
  getTotalValue(): number {
    return EntityCollectionHelper.#magnitudeSum(this.getAvailableEntities());
  }

  getAvailableEntities(): EntityHelper[] {
    return this.#entities.filter((helper) => helper.isValid && helper.isAvailable);
  }

  // Algebraic total (positive arm's magnitude sum minus negative arm's): 'net'
  // mode's own total, and also what 'stacked'/'proportional' should show as
  // their text/value once center_zero splits them into two arms - a single flat
  // "88%" reading makes no sense once the bar itself is showing two
  // independent, possibly-opposing lengths (see ViewBase).
  getNetValue(): number {
    const { positive, negative } = EntityCollectionHelper.#splitByNegative(this.getAvailableEntities());
    return EntityCollectionHelper.#magnitudeSum(positive) - EntityCollectionHelper.#magnitudeSum(negative);
  }

  // Auto-shaded fallback (darkest -> pure base color, by position among
  // entities lacking an explicit color) for an entity with no color override -
  // the only differentiation available before bar_stack.entities[].color
  // existed. The main entity is never part of this: it always keeps its own
  // negotiated curColor, unshaded, regardless of its position in the collection
  // (index 0 in 'stacked', last in 'proportional' - shading by raw position
  // used to darken whichever one landed first).
  static #entityColor(helper: EntityHelper, index: number, total: number, curColor: string): string {
    if (helper.isMain) return curColor;
    if (helper.color) return ThemeManager.adaptColor(helper.color) ?? curColor;
    const whitePercent = Math.round((1 - index / (total - 1 || 1)) * 50); // de 50 → 0
    return `color-mix(in srgb, ${curColor} ${100 - whitePercent}%, black ${whitePercent}%)`;
  }

  getEntitiesColor(curColor: string | null, progressRatio = 1, range = 0, isVertical = false): string | null {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;
    return this.#mode === 'stacked'
      ? EntityCollectionHelper.#stackedGradient(available, curColor, progressRatio, range, isVertical)
      : EntityCollectionHelper.#proportionalGradient(available, curColor, progressRatio, range, isVertical);
  }

  // 'stacked'/'proportional' + center_zero only ('net' has its own
  // single-segment path, see ViewBase.barColor): entities split into two
  // independent arms (see #splitByNegative), each laid out with the exact same
  // per-mode algorithm as the non-centered case (on magnitudes, see
  // #magnitude), just scoped to its own half-range (max-zeroValue /
  // zeroValue-min).
  getDivergingGradients(curColor: string | null, { min, max, zeroValue }: Record<string, number>, isVertical = false) {
    const available = this.getAvailableEntities();
    if (!available.length || !curColor) return null;

    const build =
      this.#mode === 'stacked' ? EntityCollectionHelper.#stackedGradient : EntityCollectionHelper.#proportionalGradient;
    const arm = (entities: EntityHelper[], range: number) => {
      if (!entities.length || range <= 0) return { gradient: null, size: 0 };
      const size = Math.min(1, Math.max(0, EntityCollectionHelper.#magnitudeSum(entities) / range));
      return { gradient: build(entities, curColor, size, range, isVertical), size };
    };

    const { positive, negative } = EntityCollectionHelper.#splitByNegative(available);
    const pos = arm(positive, max - zeroValue);
    const neg = arm(negative, zeroValue - min);
    return { posGradient: pos.gradient, negGradient: neg.gradient, posSize: pos.size, negSize: neg.size };
  }

  // 'proportional' mode (legacy `additions` behavior, a.k.a. "100% stacked"):
  // each entity's share is renormalized against the combined total, so the
  // visible fill is always divided between entities regardless of how that
  // total compares to min_value/max_value.
  static #proportionalGradient(
    available: EntityHelper[],
    curColor: string,
    progressRatio: number,
    _range: number,
    isVertical = false,
  ): string | null {
    const total = EntityCollectionHelper.#magnitudeSum(available);
    if (total === 0) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops: string[] = [];
    // With translateX-based fill, the inner element is 100% wide but only the
    // rightmost progressRatio% is visible. Segment stops must be offset so that
    // they land inside the visible portion instead of starting from position 0.
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    available.forEach((helper) => {
      const share = (EntityCollectionHelper.#magnitude(helper) / total) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = currentPosition + share * progressRatio;

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    });

    return `linear-gradient(${isVertical ? 'to top' : 'to right'}, ${gradientStops.join(', ')})`;
  }

  // 'stacked' mode: each entity occupies its own literal width on the card's
  // min_value/ max_value scale (not renormalized against the others) - entities
  // placed in list order, starting right after the previous one. Leftover space
  // past the last entity stays empty (no gap-filling color), and entities are
  // clipped/skipped once the cumulative width reaches 100% instead of shrinking
  // everyone to fit.
  static #stackedGradient(
    available: EntityHelper[],
    curColor: string,
    progressRatio: number,
    range: number,
    isVertical = false,
  ): string | null {
    if (!range) return null;

    const shadeTotal = available.filter((helper) => !helper.isMain).length;
    let shadeIndex = 0;
    const gradientStops: string[] = [];
    const offset = (1 - progressRatio) * 100;
    let currentPosition = offset;

    for (let i = 0; i < available.length && currentPosition < 100; i++) {
      const helper = available[i];
      const width = (EntityCollectionHelper.#magnitude(helper) / range) * 100;
      const color = EntityCollectionHelper.#entityColor(helper, shadeIndex, shadeTotal, curColor);
      if (!helper.isMain) shadeIndex++;
      const end = Math.min(100, currentPosition + width);

      gradientStops.push(`${color} ${currentPosition.toFixed(2)}%`, `${color} ${end.toFixed(2)}%`);
      currentPosition = end;
    }

    return gradientStops.length
      ? `linear-gradient(${isVertical ? 'to top' : 'to right'}, ${gradientStops.join(', ')})`
      : null;
  }

  get count(): number {
    return this.#entities.length;
  }

  clear() {
    this.#entities = [];
  }
}

export { EntityCollectionHelper };
