import { META, suffixedName, HA_CONTEXT } from '../../utils/parameters.js';
import { FeatureView, type ViewBase } from '../view/base.js';
import { DOMHelper } from '../dom/dom-helpers.js';
import { HACore } from '../core/core.js';
import type { LovelaceConfig } from '../../utils/types.js';

/**
 * HA CARD "entity-progress-feature"
 *
 * @extends HACore
 */

class EntityProgressFeatures extends HACore {
  // Narrows HACore's own ViewCore back to ViewBase - this class always uses
  // FeatureView, never one of the template-only views (see
  // EntityProgressCardBase's own _cardView for the same reasoning).
  _cardView: ViewBase = new FeatureView();
  static _baseClass: string = META.types.feature.typeName;
  static _cardElement = 'div';

  // ─── STATIC ───────────────────────────────────────────────────────────────

  // See HABase.getStubConfig for why this is async.
  // skipcq: JS-0116 -- async is intentional, no await by design.
  static async getStubConfig(): Promise<LovelaceConfig> {
    return { type: `custom:${suffixedName(META.types.feature.typeName)}` } as unknown as LovelaceConfig;
  }

  // ─── ENTITY CONTEXT (Tile → Feature) ───────────────────────────────────────
  #rawConfig: LovelaceConfig | null = null;
  #contextEntityId: string | undefined;
  #context: { entity_id?: string } | undefined;

  get context(): { entity_id?: string } | undefined {
    return this.#context;
  }

  // HA sets this from the parent Tile card's own entity, always after
  // setConfig (LovelaceCardFeatureContext.entity_id); config.entity overrides
  // it. Merges into _cardView.config directly, skipping setConfig's own
  // reset()/render() - the DOM built for "no entity yet" is still valid.
  set context(context: { entity_id?: string } | undefined) {
    this.#context = context;
    const entityId = context?.entity_id;
    if (entityId === this.#contextEntityId) return;
    this.#contextEntityId = entityId;
    if (!this.#rawConfig || this.#rawConfig.entity) return;
    const merged = { ...this.#rawConfig, entity: entityId };
    this._cardView.config = merged;
    this._registerWatchedEntities();
    if (this.hass) this._handleHassUpdate();
  }

  setConfig(config: LovelaceConfig) {
    this.#rawConfig = config;
    super.setConfig(config.entity ? config : { ...config, entity: this.#contextEntityId });
  }

  /**
   * Fixes the parent card layout when the feature is used as an overlay.
   *
   * By default, HA increases the card's --row-size by 1 for each feature added,
   * which would make the card taller. This method counteracts that behavior by
   * piercing through multiple Shadow DOM boundaries to directly manipulate the
   * parent card's layout properties.
   *
   * The following adjustments are made: - `.container` and `hui-card-features`
   * are set to `position: static` so the feature can be positioned absolutely
   * relative to `ha-card` - `ha-card` gets `overflow: hidden` to clip the
   * feature to the card's border radius - `--row-size` is decremented by 1 to
   * cancel the extra row reserved by HA
   *
   * A MutationObserver watches for HA re-applying `--row-size`: HA's own
   * `hui-grid-section` recomputes and re-applies it (via a reactive style
   * binding) on every relevant re-render of the tile card, not just once -
   * for instance when a sibling feature's own space requirement legitimately
   * changes (e.g. a native feature's control appearing/disappearing based on
   * entity state, the same way lovelace-mushroom's own getGridOptions()
   * varies with `active`). `--row-size` therefore isn't a constant to offset
   * once and freeze - `targetRowSize` is recomputed from HA's current
   * natural value every time the observer fires. The observer is disconnected
   * for the duration of our own write (and reconnected right after) so it
   * only ever reacts to HA's mutations, never an echo of our own - comparing
   * against a remembered "last value we applied" instead would misfire the
   * moment HA's new natural size happens to numerically match a past one
   * (e.g. growing then shrinking back by exactly 1 row).
   *
   * CF5 - issue (major) resolved - the offset used to be computed once, from
   * the first-seen --row-size, and reapplied forever after regardless of
   * what HA did later. That silently clamped any later legitimate growth in
   * HA's natural row-size back down to the stale first value, which could
   * starve a sibling feature (like a native fan-speed control) of the row
   * space it had actually grown into - reported as that feature disappearing
   * after navigating away and back.
   *
   * Executed once per connection: the observer is tracked by the
   * ResourceManager (disconnected on cleanup) and its presence serves as the
   * re-entry guard.
   *
   * @inspired by hass-progress-bar-feature (MIT License) — Copyright (c) ytilis
   * @see https://github.com/ytilis/hass-progress-bar-feature
   */
  #fixCardStyles() {
    if (!['top', 'bottom'].includes(this._cardView.config.bar_position ?? '')) return;
    // CF5 - issue (medium) resolved - the MutationObserver was never
    // disconnected: it kept observing the external card container after the
    // feature left the DOM (leak + callbacks on a dead element). It is now
    // tracked by the ResourceManager, and its presence replaces the #firstHack
    // guard so a reconnection re-installs it.
    if (!this._resourceManager || this._resourceManager.has('featureRowFix')) return;
    const resourceManager = this._resourceManager;
    const cardContainer = DOMHelper.walkUpThroughShadow(this, '.card');
    if (!cardContainer) return;

    this._dom.register('ext:card', DOMHelper.walkUpThroughShadow(this, 'ha-card') as HTMLElement);
    this._dom.register('ext:container', DOMHelper.walkUpThroughShadow(this, '.container') as HTMLElement);
    this._dom.register('ext:features', DOMHelper.walkUpThroughShadow(this, 'hui-card-features') as HTMLElement);
    this._dom.register('ext:card-container', cardContainer);

    const observerOptions = { attributes: true, attributeFilter: ['style'] };
    let observer: MutationObserver | null = null;
    const fix = () => {
      // Inline, where HA writes it and this observer watches: getComputedStyle
      // would force a style recalculation on every one of HA's re-renders.
      const rowSize = parseInt(cardContainer.style.getPropertyValue(HA_CONTEXT.styles.rowSize));
      if (!rowSize) return;
      const targetRowSize = rowSize - 1;
      // Disconnect first: these 4 writes must not be recorded as mutations
      // to react to, or the next observer callback would treat our own
      // corrected value as a new "natural" one and decrement it again.
      observer?.disconnect();
      this._dom.setStyleNow('ext:card', 'overflow', 'hidden');
      this._dom.setStyleNow('ext:container', 'position', 'static');
      this._dom.setStyleNow('ext:features', 'position', 'static');
      this._dom.setStyleNow('ext:card-container', HA_CONTEXT.styles.rowSize, targetRowSize);
      observer?.observe(cardContainer, observerOptions);
    };

    fix();
    const mutationObserver = new MutationObserver(fix);
    mutationObserver.observe(cardContainer, observerOptions);
    observer = mutationObserver;
    resourceManager.add(() => mutationObserver.disconnect(), 'featureRowFix');
  }

  // ─── HANDLE UPDATE ────────────────────────────────────────────────────────

  _handleHassUpdate() {
    this.#fixCardStyles();
    this.refresh();
    this._manageAutoRefresh();
    this._seedPeakMarkerHistoryOnce();
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────

  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return {
      bar_effect: () => this._refreshBarEffect(content), // base
    };
  }
}

export { EntityProgressFeatures };
