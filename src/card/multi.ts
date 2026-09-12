/*
 * Multi-bar orchestrators (V1 skeleton).
 *
 * The child brick is entity-progress-CARD in density: single_line - one row
 * holding icon, name, value and bar, frameless so there is no nested card
 * chrome to fight. It's created directly (document.createElement, sync), gets
 * setConfig + hass, and watches/refreshes/more-info's itself - including its
 * own text, which is why the aggregator no longer formats any. It only stacks
 * N of them and gives each one its slice (--card-height per child).
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
import { MultiCardConfigHelper, MultiFeatureConfigHelper, type BaseConfigHelper } from './config-helpers.js';
import type { HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig } from '../utils/types.js';

type ChildEl = HTMLElement & { hass?: HomeAssistant | null; setConfig?: (config: LovelaceConfig) => void };

// HA's per-feature row-height variable - read for the container's own row
// unit only (see #featureRowPx); the children are cards, sized by the var
// below.
const FEATURE_HEIGHT_VAR = '--feature-height';

// The same var an explicit `height:` writes inline on a standalone card (see
// styles.ts's ha-card height rule). Custom properties cross a shadow boundary,
// so setting it on the child host reaches its own ha-card.
const CARD_HEIGHT_VAR = CARD.style.dynamic.card.height.var;

// What never travels down to a row: the aggregator's own keys, plus the
// derived ones the negotiated config carries (a child re-derives its own).
// Everything else at the top level is a row option shared by every row.
// 24 out of a 36px shape: the glyph's job is to sit inside the circle with
// room to spare. Without a circle there is nothing to shrink for, so it takes
// the same box as the text beside it - which is what makes the two read as one
// row, and gives back the third of the height the shape was costing.
const shapedIconSize = (_per: number, shape: number) => Math.min(24, (shape * 2) / 3);
const bareIconSize = (per: number) => Math.min(16, per);

const NOT_ROW_OPTIONS = new Set(['entities', 'rows', 'type', 'centerZero', 'resolvedUnit', 'resolvedDecimal']);

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
  /* Without this the host stays inline: ha-card.multi-card's own height: 100%
     then resolves against nothing and falls back to its content, which is what
     leaves the stack sitting low in the grid item instead of filling it. */
  :host { display: block; height: 100%; }
  /* overflow: hidden is the Feature's guarantee, not decoration: _applySizing
     pins this box to exactly ONE HA feature row, and a child that asks for
     more must be clipped rather than grow the tile past the row HA reserved. */
  .multi-container { display: flex; flex-direction: column; gap: 0; box-sizing: border-box; overflow: hidden; }
  /* Homogeneous split, shared by both variants: every bar gets an equal slice
     of the container (whose height is imposed by the grid for the card, and
     derived as N x 42px rows for the feature - see _applySizing). */
  .multi-item { flex: 1 1 0; min-height: 0; overflow: hidden; }
  /* display: block, not just height: a custom element host defaults to
     inline, where height: 100% applies to nothing and each row adds a baseline
     gap - enough of them and the stack outgrows its container. */
  .multi-item > * { display: block; height: 100%; }

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
  // Negotiated, not raw: the helper runs the aggregator's own schema (which
  // also migrates show_value, see config-helpers.ts) and what comes out is
  // what every row inherits.
  setConfig(config: LovelaceConfig) {
    if (!config) throw new Error('setConfig: invalid config');
    this._configHelper.config = config;
    this.#config = this._configHelper.config as unknown as LovelaceConfig;
    const key = EntityProgressMultiBase.#computeStructureKey(config);
    if (key !== this.#structureKey || !this.#rendered) {
      this.#structureKey = key;
      this.reset();
      this.render();
    } else {
      this.#applySharedToChildren();
    }
  }

  // Each child config = the shared top-level options merged under the
  // per-entity item (item wins), then given the row shape. bar_size defaults
  // to 'small' (not the card schema's own default): a stack of N rows needs a
  // compact one. Still overridable, shared or per-item.
  get #childConfigs(): LovelaceConfig[] {
    const config = this.#config;
    if (!config || !is.array(config.entities)) return [];
    const shared: Record<string, unknown> = { bar_size: 'small' };
    for (const [key, value] of Object.entries(config)) {
      if (!NOT_ROW_OPTIONS.has(key)) shared[key] = value;
    }
    return (config.entities as Record<string, unknown>[]).map((item) =>
      this.#toRowConfig({
        ...shared,
        ...(is.plainObject(item) ? item : { entity: item }),
      }),
    );
  }

  // The row shape itself, which is the aggregator's to impose and not the
  // user's - hence absent from YamlSchemaFactory.multiRow. Nothing else is
  // translated here any more: a row speaks the card's own vocabulary.
  #toRowConfig(row: Record<string, unknown>): LovelaceConfig {
    const hide = new Set([...(is.array(row.hide) ? (row.hide as string[]) : []), ...this.forcedHide]);
    return {
      ...row,
      ...(hide.size > 0 ? { hide: [...hide] } : {}),
      density: 'single_line',
      frameless: true,
      marginless: true,
    } as unknown as LovelaceConfig;
  }

  static #computeStructureKey(config: LovelaceConfig): string {
    const entities = is.array(config.entities) ? config.entities : [];
    return entities.map((e: unknown) => (is.plainObject(e) ? String(e.entity ?? '') : String(e))).join(' ');
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
    const tag = devName(META.types.card.typeName);
    this._children = this.#childConfigs.map((childConfig) => {
      const child = document.createElement(tag) as ChildEl;
      child.setConfig?.(childConfig);
      if (this.hass) child.hass = this.hass;
      // The wrapper, not the child, carries the equal-slice flex: a card host
      // has its own layout to keep out of.
      const wrapper = document.createElement('div');
      wrapper.className = 'multi-item';
      wrapper.append(child);
      container.append(wrapper);
      return child;
    });
    this._applySizing();
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
  // span multiple rows: rows split evenly within one fixed row and get
  // shorter instead of overflowing (pick `xsmall` for more entities in the
  // same row, and expect the text to give way before the bar does). Revisit
  // only after confirming HA's real row-reservation mechanism (#126).
  _applySizing() {
    const container = this._container;
    if (!container || this._children.length === 0) return;
    const total = this.#featureRowPx();
    container.style.height = `${total}px`;
    this._distributeHeight(total);
  }

  // Equal slice of `total` px per child - shared with MultiCard's measured-
  // container sizing. A card stands at its own natural height otherwise, so
  // the slice has to be handed to it explicitly (see CARD_HEIGHT_VAR).
  _distributeHeight(total: number) {
    const count = this._children.length;
    if (!total || count === 0) return;
    const per = total / count;
    for (const child of this._children) {
      child.style.setProperty(CARD_HEIGHT_VAR, `${per}px`);
      for (const [name, value] of Object.entries(this.rowMetrics(per))) {
        child.style.setProperty(name, value);
      }
    }
  }

  // A standalone card sizes its row from its own defaults; a Multi row has its
  // height imposed instead, so everything that would otherwise overflow it is
  // derived from the slice. Ratios, not constants: they are the card's own
  // defaults at a full-size row (36px shape, 24px icon inside it, 16px text
  // box, 12px type) and shrink with it, capped so a tall row never grows past
  // what the card would have done on its own. --current-row-* sits behind the
  // matching --epb-* hook (see styles.ts), so a user override still wins.
  rowMetrics(per: number): Record<string, string> {
    const shape = Math.min(36, per);
    return {
      '--current-row-shape-size': `${shape}px`,
      '--current-row-icon-size': `${(this.constructor as typeof EntityProgressMultiBase)._iconSize(per, shape)}px`,
      '--current-row-detail-height': `${Math.min(16, per)}px`,
      '--current-row-bar-box': `${Math.min(16, per)}px`,
      // The line box IS the slice here, so the only leading left to keep is
      // what the descenders need - 1.1, not .info-row's own 1.2em floor, which
      // guards against something (OS font scaling) that cannot move a row
      // whose height is imposed. Worth ~10% of type size at four rows.
      '--current-row-line-height': `${per}px`,
      '--current-row-detail-font-size': `${Math.min(12, per / 1.1)}px`,
    };
  }

  // ─── HASS PASSTHROUGH (no ChangeTracker, no bar pipeline) ─────────────────
  set hass(hass: HomeAssistant) {
    if (!hass) return;
    this._hassProvider.hass = hass;
    for (const child of this._children) child.hass = hass;
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
    this._container = null;
    this._shadow.replaceChildren();
  }

  // Hook: what this aggregator takes off every row whatever the config says.
  // Nothing for the Card, which has the room for all of it. Static + getter,
  // same pattern as HABase._hiddenComponents: a subclass declares the list,
  // the getter reaches it through the instance.
  static _forcedHide: string[] = [];
  // Per-subclass like _forcedHide above: a Feature draws no shape, so its
  // glyph is not sized to fit one.
  static _iconSize: (per: number, shape: number) => number = shapedIconSize;
  // Per-subclass: each aggregator validates against its own schema variant.
  declare _configHelper: BaseConfigHelper;

  get forcedHide(): string[] {
    return (this.constructor as typeof EntityProgressMultiBase)._forcedHide;
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
  _configHelper = new MultiCardConfigHelper();

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
    if (!container || this._children.length === 0) return;
    const apply = () => this._distributeHeight(container.clientHeight);
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
  // A few px of icon can't carry a circular background - the schema drops the
  // option (YamlSchemaFactory.multiFeature), this drops the shape itself.
  static _forcedHide: string[] = ['shape'];
  static _iconSize = bareIconSize;
  _configHelper = new MultiFeatureConfigHelper();

  // skipcq: JS-0116 -- async matches the custom-card-helpers contract
  static async getStubConfig(): Promise<LovelaceConfig> {
    return { type: `custom:${devName(META.types.multiFeature.typeName)}`, entities: [] } as unknown as LovelaceConfig;
  }
}

export { EntityProgressMultiCard, EntityProgressMultiFeature };
