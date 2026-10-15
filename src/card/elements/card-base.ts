import { META, CARD } from '../../utils/parameters.js';
import { CardView, BadgeView, type ViewBase } from '../view/base.js';
import { HABase } from '../core/base.js';
import type { HomeAssistant } from '../../utils/hass-provider.js';
import type { Config } from '../../utils/types.js';
import { jinjaOf } from '../config/schema.js';
import { CARD_LAYOUT_METHODS } from './layout-methods.js';

/**
 * Represents the base class for all standard cards:
 *  - EntityProgressCardBase / "entity-progress-card"
 *  - EntityProgressBadge / "entity-progress-badge"
 *
 * @extends HABase
 */
class EntityProgressCardBase extends HABase {
  // Narrows HABase's own ViewCore back to ViewBase: every concrete subclass
  // of this class (EntityProgressCard/EntityProgressBadge) always assigns a
  // CardView/BadgeView, never one of the template-only views - unlike HABase
  // itself, which EntityProgressTemplateBase also extends. `declare`: both
  // subclasses assign their own real view.
  declare _cardView: ViewBase;
  static _hiddenComponents: { label: string; class?: string }[] = [
    ...super._hiddenComponents,
    CARD.style.dynamic.hiddenComponent.value,
  ];

  static get _loggedMethods() {
    return [...super._loggedMethods, '_getStandardFields', '_renderCustomInfo', '_renderNameInfo'];
  }

  _handleHassUpdate() {
    this.refresh();
    this._manageAutoRefresh();
    this._seedTrendHistoryOnce();
    this._seedPeakMarkerHistoryOnce();
  }

  // trend_indicator.window seeds from HA's own history - Card/Template only
  // (peak_marker's own seeding lives on HACore, which also owns the shared
  // once-per-signature contract both go through).
  _seedTrendHistoryOnce() {
    this._seedFromHistory('trend_indicator', this._cardView.config.trend_indicator, (points) => {
      this._cardView.seedTrend(points.map((p) => ({ t: p.t, percent: this._cardView.percentForRawValue(p.value) })));
      // Same repaint peak_marker's own seeding does: nothing else runs between
      // here and the entity's next state change.
      this._updateTrend();
    });
  }

  // Adds the value text on top of HACore's default tick (refresh + bar CSS,
  // shared with EntityProgressFeatures) - Card/Badge also shows a text value
  // Features don't have. immediate: see _processStandardFields's own
  // comment - the countdown text is a discrete jump each tick, and RAF's
  // frame timing isn't aligned to our wall-clock-second scheduling.
  _onAutoRefreshTick() {
    super._onAutoRefreshTick();
    this._processStandardFields(true);
  }

  // ─── CSS - CUSTOMIZATION ──────────────────────────────────────────────────
  // secondaryInfoError depends on the entity's own state
  // (hasStandardEntityError), not on icon_animation or alert_when - same
  // "static-ish, not Jinja-driven"
  // bucket as HABase's own _staticStyle entries, so it's folded into that
  // layer rather than a new one of its own.
  get _staticStyle(): Map<string, boolean> {
    return new Map([
      ...super._staticStyle,
      [CARD.style.dynamic.secondaryInfoError, this._cardView.hasStandardEntityError],
    ]);
  }

  // ─── STD FIELDS PROCESSING - CUSTOMIZATION ────────────────────────────────
  static _getStandardFields(cardView: ViewBase): { className: string; value: string | null }[] {
    return [
      {
        className: CARD.htmlStructure.elements.nameMain.class,
        value: cardView.name,
      },
      {
        className: CARD.htmlStructure.elements.secondaryInfoMain.class,
        value: cardView.secondaryInfoMain,
      },
    ];
  }

  // ─── JINJA TEMPLATE RENDERING - CUSTOMIZATION ─────────────────────────────
  // _renderJinjaNumber below is Card-only - absent from the template schema.
  _getJinjaHandlers(content: unknown): Record<string, () => void> {
    return {
      ...this._baseJinjaHandlers(content),
      ...this._badgeJinjaHandlers(content),
      custom_info: () => this._renderCustomInfo(content),
      name_info: () => this._renderNameInfo(content),
      min_value: () => this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.min_value), 'minValue'),
      max_value: () => this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.max_value), 'maxValue'),
      ...this._watermarkJinjaHandlers(content),
      'alert_when.above': () =>
        this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.alert_when?.above), 'alertAbove'),
      'alert_when.below': () =>
        this._renderJinjaNumber(content, (c: Config) => jinjaOf(c.alert_when?.below), 'alertBelow'),
    };
  }

  // Repaints only what this field affects: a full refresh() re-ran the whole
  // Jinja scan on every push - one per keystroke - and froze the editor.
  _renderJinjaNumber(
    content: unknown,
    getJinja: (c: Config) => string | undefined,
    viewProp: 'minValue' | 'maxValue' | 'alertAbove' | 'alertBelow',
  ) {
    this._applyJinjaNumber(content, getJinja, viewProp, () => {
      if (viewProp === 'minValue' || viewProp === 'maxValue') {
        // min/max feed the view's progress (via refresh) - the bar's own CSS
        // and secondaryInfoMain (the "45%" label) derive from it.
        this._cardView.refresh(this.hass as HomeAssistant);
        this._updateCSS();
        this._processStandardFields();
      } else {
        // isAlertActive only feeds _alertStyle - no progress, bar CSS or
        // label involvement, and no need to re-walk the other class layers.
        this._applyAlertClasses();
      }
    });
  }

  // Line 1 only gets the &nbsp; spacer in single-line mode, where it precedes
  // the main span on the same line; line 2 always carries main here (card/badge
  // has that slot), unlike Template's own _renderSecondary.
  _renderCustomInfo(content: unknown) {
    const multiline = Boolean(this._cardView.config.multiline);
    this._renderSecondaryLines(content, (line, isSecond) => (isSecond || !multiline ? `${line}&nbsp;` : line));
  }

  _renderNameInfo(content: unknown) {
    this._dom.setHTML(CARD.htmlStructure.elements.nameExtra.class, `&nbsp;${content}`);
  }
}

/**
 * HA CARD "entity-progress-card"
 *
 * @extends EntityProgressCardBase
 */
class EntityProgressCard extends EntityProgressCardBase {
  _cardView = new CardView();
  static _baseClass: string = META.types.card.typeName;

  // ─── STATIC METHODS ───────────────────────────────────────────────────────

  static get _loggedMethods() {
    return [...super._loggedMethods, ...CARD_LAYOUT_METHODS];
  }
}

/**
 * HA CARD "entity-progress-badge"
 *
 * @extends EntityProgressCardBase
 */
class EntityProgressBadge extends EntityProgressCardBase {
  _cardView = new BadgeView();
  static _baseClass: string = META.types.badge.typeName;
  static _structureType = 'badge';
  static _hasInnerBadge = false;
}

export { EntityProgressCard };
export { EntityProgressBadge };
