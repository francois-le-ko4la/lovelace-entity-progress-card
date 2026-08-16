/*
 * Multi-bar orchestrators (V1 skeleton).
 *
 * The child brick is entity-progress-FEATURE: it already renders the bare bar
 * (a <div>, no ha-card frame, bar centered in --feature-height), so there is no
 * card chrome to fight - it's created directly (document.createElement, sync),
 * gets setConfig + hass, and watches/refreshes/more-info's itself. The
 * aggregator only stacks N of them and sizes them (--feature-height per child).
 *
 * The two subclasses differ ONLY in how much of a "host" they need to provide,
 * via two overridable hooks (_wrapFrame/_applySizing):
 *
 * entity-progress-multi-feature (the base's own default) - attached to a tile,
 *   bare render (HA's own hui-card-feature already frames/insets it), and lets
 *   HA size the tile's row via its natural (unconstrained) height - same
 *   auto-growth every feature already gets, so each child just gets a fixed
 *   compact default height.
 * entity-progress-multi-card - standalone, so it must supply its own <ha-card>
 *   frame, and the Sections grid imposes ITS height (getGridOptions) rather
 *   than letting content dictate it - each child gets an equal measured pixel
 *   slice instead.
 *
 * The base is a thin passthrough over HACore (reused for its shadow root,
 * logger and ResourceManager), with the single-bar render/hass path overridden.
 *
 * Skeleton status: structure + wiring are real; heavy/uncertain bits are marked
 * TODO (schema+MultiConfigHelper, height division needs a live check).
 */

import { CARD, META, devName } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HACore } from './core.js';
import { NumberFormatter } from './formatting.js';
import type { HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig } from '../utils/types.js';

type ChildEl = HTMLElement & { hass?: HomeAssistant | null; setConfig?: (config: LovelaceConfig) => void };

// One per entity with show_value: true - the bits #updateValues needs to
// re-format that entity's state on every hass push, without reaching back
// into its (bare, text-less) entity-progress-feature child.
type ValueTarget = {
  entity: string;
  el: HTMLElement;
  decimal: number;
  unit?: string;
  disableUnit: boolean;
  unitSpacing: string;
};

// HA's per-feature row-height variable - read for the row unit, overridden on
// each child to give it its slice (the child feature centers its bar in it).
const FEATURE_HEIGHT_VAR = '--feature-height';

// Minimal own stylesheet (V1). TODO: fold into the shared constructed-sheet
// path the cards use instead of a per-instance <style>.
//
// Bare rules (no wrapper) suit the Feature case: HA's tile feature row
// already provides the horizontal inset and measures our natural height to
// size the tile, so children just stack, no override needed.
//
// The `ha-card.multi-card` descendant rules only match when
// EntityProgressMultiCard's _wrapFrame() adds that wrapper - they turn the
// same bare stack into a self-contained, fixed-height, equally divided card.
const MULTI_CSS = `
  .multi-container { display: flex; flex-direction: column; gap: 0; box-sizing: border-box; }
  /* Homogeneous split, shared by both variants: every bar gets an equal slice
     of the container (whose height is imposed by the grid for the card, and
     derived as N x 42px rows for the feature - see _applySizing). */
  .multi-item { flex: 1 1 0; min-height: 0; overflow: hidden; }
  .multi-item > * { height: 100%; }

  /* show_value: true - bar and value sit side by side, bar gives up the width
     the value needs instead of the value overlaying it (a bare feature bar is
     already thin - overlay text would fight it for contrast at most sizes). */
  .multi-item.with-value { display: flex; align-items: center; gap: var(--epb-spacing, 8px); }
  .multi-item.with-value .multi-bar-box { flex: 1 1 auto; min-width: 0; height: 100%; }
  .multi-value {
    /* Fixed basis (not auto): several bars in the same stack rarely share the
       exact same digit count (900 vs 1600 W) - an auto width lets each one
       claim a different amount of space, so bars meant to read as comparable
       end up different lengths for no meaningful reason. A shared width
       keeps every bar in the stack starting/ending at the same x - overridable
       via --epb-multi-value-width for values that need more room; a value
       wider than this only ever overflows visually (never clipped/ellipsized
       - silently truncating the one thing this option exists to show would
       defeat its own purpose). */
    flex: 0 0 var(--epb-multi-value-width, 30px);
    display: flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
    font-size: var(--epb-name-font-size, var(--ha-font-size-s, 12px));
    font-weight: var(--epb-name-font-weight, var(--ha-font-weight-medium, 500));
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  /* value_position: left (the default) - value comes first in the DOM, so its
     text hugs its own right edge, right up against the bar next to it. */
  .multi-value.align-end { justify-content: flex-end; }

  ha-card.multi-card {
    height: 100%; box-sizing: border-box; overflow: hidden;
    /* A bare <ha-card> only falls back on --ha-card-border-radius (often unset
       by the theme). entity-progress-card matches the theme's own corners via
       --ha-border-radius-lg (see styles.ts's --ha-standard-border-radius) -
       same chain here so the aggregator's frame isn't visually square. */
    border-radius: var(--epb-card-border-radius, var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px)));
  }
  ha-card.multi-card .multi-container {
    height: 100%;
    /* compact vertically (no top/bottom padding), card-like left/right. The
       feature children have no padding, so the aggregator supplies the inset. */
    padding: 0 var(--epb-spacing, 10px);
  }
`;

class EntityProgressMultiBase extends HACore {
  static _baseClass: string = META.types.multiFeature.typeName; // per-subclass below
  #config: LovelaceConfig | null = null;
  // Protected (not #-private): MultiCard's _applySizing/_wrapFrame overrides
  // read/append to these directly.
  _children: ChildEl[] = [];
  _container: HTMLElement | null = null;
  // show_value: true targets (see #buildChildren/#updateValues) - separate
  // from _children since a bare entity-progress-feature has no text of its
  // own to hold this.
  _valueTargets: ValueTarget[] = [];
  #rendered = false;
  // Structure signature (entity list). A bare hass update only forwards hass;
  // a change here (entity added/removed/reordered) rebuilds the children.
  #structureKey = '';

  // ─── LIFECYCLE ────────────────────────────────────────────────────────────
  // Overrides HACore's connectedCallback: no _updateDynamicElements /
  // _handleHassUpdate / _watchWebSocket (all single-bar pipeline).
  connectedCallback() {
    this._ensureResourceManager();
    this.render();
    // setConfig (and its sizing pass) usually runs before insertion, where
    // HA's --feature-height row unit can't resolve yet - re-derive in-DOM.
    this._applySizing();
  }

  // ─── CONFIG ───────────────────────────────────────────────────────────────
  // TODO(schema): validate against YamlSchemaFactory.multiCard/.multiFeature,
  // move the defaults-merge into a MultiConfigHelper. Inline for the skeleton.
  setConfig(config: LovelaceConfig) {
    if (!config) throw new Error('setConfig: invalid config');
    this.#config = config;
    const key = EntityProgressMultiBase.#computeStructureKey(config);
    if (key !== this.#structureKey || !this.#rendered) {
      this.#structureKey = key;
      this.reset();
      this.render();
    } else {
      this.#applySharedToChildren();
    }
  }

  // Each child feature config = shared top-level options merged under the
  // per-entity item (item wins). No type/frame injection: a feature is already
  // a bare bar in a <div>. bar_size defaults to 'small' here (not the
  // standalone Feature schema's own 'xlarge' default, tuned for its fixed 42px
  // row - see schema.ts) since our own row height is derived FROM bar_size
  // (see #barSizeFor), so a compact stack needs a compact default too. Still
  // overridable, shared or per-item.
  get #childConfigs(): LovelaceConfig[] {
    const config = this.#config;
    if (!config || !is.array(config.entities)) return [];
    // Shared defaults = top-level keys except our own (entities/rows/type).
    const shared: Record<string, unknown> = { bar_size: 'small' };
    for (const [key, value] of Object.entries(config)) {
      if (key !== 'entities' && key !== 'rows' && key !== 'type') shared[key] = value;
    }
    return (config.entities as Record<string, unknown>[]).map(
      (item) =>
        ({
          ...shared,
          ...(is.plainObject(item) ? item : { entity: item }),
        }) as unknown as LovelaceConfig,
    );
  }

  static #computeStructureKey(config: LovelaceConfig): string {
    const entities = is.array(config.entities) ? config.entities : [];
    return entities.map((e: unknown) => (is.plainObject(e) ? String(e.entity ?? '') : String(e))).join(' ');
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  render() {
    if (this.#rendered) return;
    this.#rendered = true;
    const style = document.createElement('style');
    style.textContent = MULTI_CSS;
    this._container = document.createElement('div');
    this._container.className = 'multi-container';
    this._shadow.replaceChildren(style, this._wrapFrame(this._container));
    this.#buildChildren();
  }

  // Hook: default (Feature) renders bare - HA's own tile feature row already
  // provides the frame/inset (see MULTI_CSS). MultiCard overrides this to
  // supply its own <ha-card> frame (it has no host card to sit inside).
  _wrapFrame(container: HTMLElement): HTMLElement {
    this._log?.debug('multi: bare render, no frame (Feature default)');
    return container;
  }

  // Children are our own entity-progress-feature elements - defined at module
  // load, so document.createElement + setConfig + hass is synchronous (no
  // loadCardHelpers). setConfig before append so connectedCallback renders with
  // the config already in place.
  #buildChildren() {
    const container = this._container;
    if (!container) return;
    const tag = devName(META.types.feature.typeName);
    this._valueTargets = [];
    this._children = this.#childConfigs.map((childConfig) => {
      const child = document.createElement(tag) as ChildEl;
      child.setConfig?.(childConfig);
      if (this.hass) child.hass = this.hass;
      const wrapper = document.createElement('div');
      wrapper.className = 'multi-item';
      if (childConfig.show_value && is.nonEmptyString(childConfig.entity as string)) {
        wrapper.classList.add('with-value');
        const barBox = document.createElement('div');
        barBox.className = 'multi-bar-box';
        barBox.append(child);
        const valueEl = document.createElement('span');
        valueEl.className = 'multi-value';
        // 'left' (default): value first, text hugs its own right edge (next
        // to the bar) via .align-end. 'right': bar first, value's default
        // left-alignment already hugs the bar on its other side.
        const onLeft = childConfig.value_position !== 'right';
        if (onLeft) {
          valueEl.classList.add('align-end');
          wrapper.append(valueEl, barBox);
        } else {
          wrapper.append(barBox, valueEl);
        }
        this._valueTargets.push({
          entity: childConfig.entity as string,
          el: valueEl,
          decimal: is.unsignedInteger(childConfig.decimal)
            ? (childConfig.decimal as number)
            : CARD.config.decimal.other,
          unit: childConfig.unit as string | undefined,
          disableUnit: Boolean(childConfig.disable_unit),
          unitSpacing: is.nonEmptyString(childConfig.unit_spacing as string)
            ? (childConfig.unit_spacing as string)
            : CARD.config.unit.unitSpacing.auto,
        });
      } else {
        wrapper.append(child);
      }
      container.append(wrapper);
      return child;
    });
    this.#updateValues();
    this._applySizing();
  }

  // Formats and writes each show_value target's text - called whenever the
  // underlying state could have changed (every hass push), independently of
  // the bare feature children (which have no text of their own to read this
  // back from, see YamlSchemaFactory.feature).
  #updateValues() {
    for (const target of this._valueTargets) {
      const stateObj = this._hassProvider.getEntityStateObj(target.entity);
      if (!stateObj) {
        target.el.textContent = '';
        continue;
      }
      const raw = stateObj.state;
      const numeric = parseFloat(raw);
      const unit = target.disableUnit
        ? ''
        : (target.unit ?? (this._hassProvider.getEntityAttribute<string>(target.entity, 'unit_of_measurement') || ''));
      target.el.textContent = Number.isFinite(numeric)
        ? NumberFormatter.formatValueAndUnit(
            numeric,
            target.decimal,
            unit,
            this._hassProvider.language,
            target.unitSpacing,
          )
        : raw;
    }
  }

  // Same-structure config edits (e.g. changing a shared bar_size at the top
  // level) re-configure the children in place - and must re-derive the row
  // count/slices too, or they stay sized for the previous bar_size.
  #applySharedToChildren() {
    const configs = this.#childConfigs;
    this._children.forEach((child, index) => {
      const childConfig = configs[index];
      if (childConfig) child.setConfig?.(childConfig);
    });
    this._applySizing();
  }

  // HA's row unit for features (--feature-height, 42px by default) - kept
  // untouched as the unit. Only resolvable from the DOM once connected;
  // before that, fall back to HA's own default.
  #featureRowPx(): number {
    const raw = parseFloat(getComputedStyle(this).getPropertyValue(FEATURE_HEIGHT_VAR));
    return Number.isFinite(raw) && raw > 0 ? raw : 42;
  }

  // Default (Feature) sizing - always exactly ONE HA feature row, never more.
  // An earlier attempt let the container grow to N rows and relied on HA's
  // hui-grid-section measuring that height to reserve them - live testing
  // showed this doesn't work reliably. So this deliberately does NOT try to
  // span multiple rows: bars split evenly within one fixed row and get
  // thinner instead of overflowing (pick `xsmall` for more entities in the
  // same row). Revisit only after confirming HA's real row-reservation
  // mechanism (#126).
  _applySizing() {
    const container = this._container;
    const count = this._children.length;
    if (!container || count === 0) return;
    const total = this.#featureRowPx();
    container.style.height = `${total}px`;
    const per = total / count;
    for (const child of this._children) child.style.setProperty(FEATURE_HEIGHT_VAR, `${per}px`);
  }

  // ─── HASS PASSTHROUGH (no ChangeTracker, no bar pipeline) ─────────────────
  set hass(hass: HomeAssistant) {
    if (!hass) return;
    this._hassProvider.hass = hass;
    for (const child of this._children) child.hass = hass;
    this.#updateValues();
  }

  get hass(): HomeAssistant | null {
    return this._hassProvider.hass;
  }

  // HACore hooks that assume a single-bar DOM - neutralized here (defensive: no
  // multi path calls them, but the base versions throw / hit _updateCSS).
  _handleHassUpdate() {
    this._log?.debug('multi: hass is forwarded to children, no bar pipeline');
  }

  _updateDynamicElements() {
    this._log?.debug('multi: no single-bar DOM to update');
  }

  reset() {
    this.#rendered = false;
    this._resourceManager?.remove('multiDivideHeight');
    this._children = [];
    this._valueTargets = [];
    this._container = null;
    this._shadow.replaceChildren();
  }

  // Rows the aggregator occupies: explicit `rows`, else one per entity.
  get _rows(): number {
    const config = this.#config;
    if (config && is.number(config.rows)) return config.rows;
    return is.array(config?.entities) ? Math.max(1, config.entities.length) : 1;
  }
}

class EntityProgressMultiCard extends EntityProgressMultiBase {
  static _baseClass: string = META.types.multiCard.typeName;

  // Snap to the Sections grid: one grid item, `_rows` tall. TODO(live): tune
  // columns / min_rows against real section layouts.
  getGridOptions() {
    return { rows: this._rows, min_rows: 1, columns: 12 };
  }

  // Unlike a Feature (which lets HA size the tile row to its natural height),
  // the Sections grid imposes OUR height via getGridOptions above - we must
  // fit it, not declare it. So each child gets an equal PIXEL slice of the
  // measured container instead of the base's fixed compact default. A `%`
  // would be unreliable (min-height:% doesn't resolve on a flex item), hence a
  // measured px value, recomputed on resize (the grid can resize us later).
  // Cleanup tracked by the ResourceManager.
  _wrapFrame(container: HTMLElement): HTMLElement {
    this._log?.debug('multi: wrapping in ha-card (Card frame)');
    const card = document.createElement('ha-card');
    card.className = 'multi-card';
    card.append(container);
    return card;
  }

  _applySizing() {
    const container = this._container;
    const children = this._children;
    if (!container || children.length === 0) return;
    const apply = () => {
      const total = container.clientHeight;
      const count = children.length;
      if (!total || count === 0) return;
      const per = total / count;
      for (const child of children) child.style.setProperty(FEATURE_HEIGHT_VAR, `${per}px`);
    };
    requestAnimationFrame(apply);
    const observer = new ResizeObserver(apply);
    observer.observe(container);
    // _applySizing can now re-run on shared config edits - drop the previous
    // observer first so they don't pile up under the same id.
    this._resourceManager?.remove('multiDivideHeight');
    this._resourceManager?.add(() => observer.disconnect(), 'multiDivideHeight');
  }

  // skipcq: JS-0116 -- async matches the custom-card-helpers contract
  static async getStubConfig(): Promise<LovelaceConfig> {
    return { type: `custom:${devName(META.types.multiCard.typeName)}`, entities: [] } as unknown as LovelaceConfig;
  }
}

// No --row-size handling needed here (unlike EntityProgressFeatures'
// #fixCardStyles, which only corrects it for the top/bottom OVERLAY position):
// for the default in-flow position, HA's hui-grid-section already grows the
// tile's --row-size to match the natural, unconstrained height of the whole
// hui-card-features area - exactly like it does for a single ordinary
// feature or several native ones stacked. Nothing to fight; this class only
// needs the base's defaults (bare render, fixed compact per-child height).
class EntityProgressMultiFeature extends EntityProgressMultiBase {
  static _baseClass: string = META.types.multiFeature.typeName;

  // skipcq: JS-0116 -- async matches the custom-card-helpers contract
  static async getStubConfig(): Promise<LovelaceConfig> {
    return { type: `custom:${devName(META.types.multiFeature.typeName)}`, entities: [] } as unknown as LovelaceConfig;
  }
}

export { EntityProgressMultiBase, EntityProgressMultiCard, EntityProgressMultiFeature };
