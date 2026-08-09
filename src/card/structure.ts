/*
 * Builds the card's raw HTML markup: reusable element templates
 * (StructureElements) and the full per-card-type structure templates
 * (StructureTemplates) assembled from them.
 */

import { CARD, CARD_CONTEXT, CONTENT_SLOT } from '../utils/parameters.js';
import { traceInstance } from '../utils/log.js';

// Shape of every CARD.htmlStructure.sections.*/elements.* entry actually
// passed to Element() below (sections.ripple, the one entry with no `class`,
// is never routed through here - StructureElements.ripple() is a hardcoded
// string instead).
type StructureElementSpec = {
  element: string;
  class: string;
  id?: string;
  extraAttr?: Record<string, string | number>;
};

// The options bag threaded through StructureElements/StructureTemplates -
// every call site only ever fills in a subset of these (layout, barPosition,
// barType, trendIndicator, hasLabel, multiline, barSingleLine), never all at
// once.
type StructureOptions = {
  layout?: string;
  barPosition?: string;
  barType?: string;
  trendIndicator?: boolean;
  hasLabel?: boolean;
  multiline?: boolean;
  barSingleLine?: boolean;
};

const Element = (obj: StructureElementSpec, extraClass = '') => {
  const className = `${obj.class} ${extraClass}`.trim();
  const renderAttrs = (attrsObj: Record<string, string | number> = {}) =>
    Object.entries(attrsObj)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

  return {
    tag: obj.element,
    class: className,
    html: (content = '', attrs: Record<string, string | number> = {}) => {
      const allAttrs = { ...(obj.id ? { id: obj.id } : {}), ...(obj.extraAttr || {}), ...attrs };
      return `<${obj.element} class="${className}" ${renderAttrs(allAttrs)}>${content}</${obj.element}>`;
    },
  };
};

const StructureElements = {
  ripple: () => '<ha-ripple></ha-ripple>',
  container: (options: StructureOptions) =>
    StructureElements.ripple() + Element(CARD.htmlStructure.sections.container, options.layout).html(CONTENT_SLOT),
  belowContainer: () => Element(CARD.htmlStructure.sections.belowContainer).html(CONTENT_SLOT),
  topContainer: () => Element(CARD.htmlStructure.sections.topContainer).html(CONTENT_SLOT),
  backgroundContainer: () => Element(CARD.htmlStructure.sections.backgroundContainer).html(CONTENT_SLOT),
  bottomContainer: () => Element(CARD.htmlStructure.sections.bottomContainer).html(CONTENT_SLOT),

  iconAndShape: () =>
    Element(CARD.htmlStructure.elements.shape).html(
      StructureElements.ripple() + Element(CARD.htmlStructure.elements.icon).html(),
    ),
  badge: () =>
    Element(CARD.htmlStructure.elements.badge.container).html(Element(CARD.htmlStructure.elements.badge.icon).html()),
  nameContent: (minimal = false) =>
    Element(CARD.htmlStructure.elements.nameContent).html(
      Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
        Element(CARD.htmlStructure.elements.nameValue).html(
          Element(CARD.htmlStructure.elements.nameMain).html() +
            (minimal ? '' : Element(CARD.htmlStructure.elements.nameExtra).html()),
        ),
      ),
    ),
  // One line of a multiline secondary-info block: line 1 is always extra-only
  // (never a main, whatever the caller passes); line 2 adds the main span only
  // when this card type actually has one (card/badge: yes, template: no slot at
  // all - see StructureElements.secondaryInfoWrapperMinimal).
  secondaryInfoLine: (index: 1 | 2, hasMain: boolean) => {
    const extraEl =
      index === 1 ? CARD.htmlStructure.elements.secondaryInfoExtra : CARD.htmlStructure.elements.secondaryInfoExtra2;
    const showMain = index === 2 && hasMain;
    return Element(CARD.htmlStructure.elements.ellipsisWrapper, `secondary-info-line-${index}`).html(
      Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
        Element(extraEl).html() + (showMain ? Element(CARD.htmlStructure.elements.secondaryInfoMain).html() : ''),
      ),
    );
  },

  secondaryInfoWrapperMultiline: (hasMain: boolean) =>
    Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
      StructureElements.secondaryInfoLine(1, hasMain) + StructureElements.secondaryInfoLine(2, hasMain),
    ),

  secondaryInfoWrapper: (options: StructureOptions = {}) =>
    options.multiline
      ? StructureElements.secondaryInfoWrapperMultiline(true)
      : Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
          Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
            Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
              Element(CARD.htmlStructure.elements.secondaryInfoExtra).html() +
                Element(CARD.htmlStructure.elements.secondaryInfoMain).html(),
            ),
          ),
        ),

  secondaryInfoWrapperMinimal: (options: StructureOptions = {}) =>
    options.multiline
      ? StructureElements.secondaryInfoWrapperMultiline(false)
      : Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
          Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
            Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
              Element(CARD.htmlStructure.elements.secondaryInfoExtra).html(),
            ),
          ),
        ),

  progressBar: (options: StructureOptions) => {
    const extraClass = options.barPosition === 'overlay' ? 'overlay' : '';
    const isCenterZero = options.barType === 'centerZero';
    // bar_segments' dividers are NOT built here: a variable number of real
    // divs (N+1 for bar_segments: N, including the two edge markers), built
    // directly in JS (HABase#_buildSegmentDividers) after this static
    // template is cloned in, not part of it - see that method's own comment
    // for why (this template is cached per unique options set; bar_segments
    // ranges freely, unlike every other option here).
    const marks =
      Element(CARD.htmlStructure.elements.progressBar.lowWatermark, 'watermark mark').html() +
      Element(CARD.htmlStructure.elements.progressBar.highWatermark, 'watermark mark').html() +
      (isCenterZero ? Element(CARD.htmlStructure.elements.progressBar.zeroMark, 'mark').html() : '');

    const innerHtml = isCenterZero
      ? Element(CARD.htmlStructure.elements.progressBar.half, 'negative-zone').html(
          Element(CARD.htmlStructure.elements.progressBar.inner, 'negative').html(),
        ) +
        Element(CARD.htmlStructure.elements.progressBar.half, 'positive-zone').html(
          Element(CARD.htmlStructure.elements.progressBar.inner, 'positive').html(),
        ) +
        marks
      : Element(CARD.htmlStructure.elements.progressBar.inner, 'positive').html() + marks;

    // valueMarker is a sibling of .bar, not one of the marks nested inside it
    // (see the block above) - .bar has overflow: hidden (needed to clip the
    // fill sweep/segments to its own thin frame), which would clip the
    // marker down to the bar's own height too, drowning it at small
    // bar_size. .bar-container has no such clipping, so the marker can be
    // taller than the (possibly tiny) bar it marks and still read clearly.
    return Element(CARD.htmlStructure.elements.progressBar.container, extraClass).html(
      Element(
        CARD.htmlStructure.elements.progressBar.bar,
        isCenterZero ? CARD.style.dynamic.progressBar.centerZero.class : 'default',
      ).html(innerHtml) + Element(CARD.htmlStructure.elements.progressBar.valueMarker, 'mark').html(),
      isCenterZero ? { 'aria-valuemin': '-100' } : {},
    );
  },

  createSecondaryInfo: (options: StructureOptions, secondaryInfoWrapperFn: (options: StructureOptions) => string) => {
    const { layout = '', barPosition = '' } = options;
    const excludedPositions = ['top', 'bottom', 'below', 'compact_below', 'overlay', 'background'];
    const excludedLayouts = ['vertical'];

    let content = secondaryInfoWrapperFn(options);

    if (!excludedPositions.includes(barPosition) && !excludedLayouts.includes(layout)) {
      content += StructureElements.progressBar(options);
    }

    return Element(CARD.htmlStructure.elements.secondaryInfo).html(content);
  },

  secondaryInfo: (options: StructureOptions) =>
    StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapper),

  secondaryInfoMinimal: (options: StructureOptions) =>
    StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapperMinimal),

  createContent: (options: StructureOptions, rightContent: string) => {
    const isOverlay = options.barPosition === 'overlay';
    const isSingleLine = options.barSingleLine;
    const isVertical = options.layout === 'vertical';
    const isBelowTopOrBottom = ['below', 'top', 'bottom', 'background'].includes(options.barPosition ?? '');

    const extraClass = (isOverlay ? ' overlay' : '') + (isSingleLine ? ' single-line' : '');
    const before = isOverlay ? StructureElements.progressBar(options) : '';
    const after = !isOverlay && !isBelowTopOrBottom && isVertical ? StructureElements.progressBar(options) : '';
    const content = before + rightContent + after;

    return Element(CARD.htmlStructure.sections.content, extraClass).html(content);
  },

  // bar_position: compact_below (#123) - name and secondary_info share one
  // row (their own wrapper, see CARD.htmlStructure.sections.nameSecondaryRow),
  // the bar becomes a separate sibling row below it - a real, explicit
  // structural difference (like below/top/bottom/overlay), not a CSS
  // rearrangement of the default DOM.
  createContentBody: (
    options: StructureOptions,
    nameHtml: string,
    secondaryInfoFn: (options: StructureOptions) => string,
  ) =>
    options.barPosition === 'compact_below'
      ? Element(CARD.htmlStructure.sections.nameSecondaryRow).html(nameHtml + secondaryInfoFn(options)) +
        StructureElements.progressBar(options)
      : nameHtml + secondaryInfoFn(options),

  contentFull: (options: StructureOptions) =>
    StructureElements.createContent(
      options,
      StructureElements.createContentBody(options, StructureElements.nameContent(), StructureElements.secondaryInfo),
    ),
  contentMini: (options: StructureOptions) =>
    StructureElements.createContent(
      options,
      StructureElements.createContentBody(
        options,
        StructureElements.nameContent(true),
        StructureElements.secondaryInfoMinimal,
      ),
    ),

  iconSection: () =>
    Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape() + StructureElements.badge()),
  iconSectionWoBadge: () => Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape()),

  trendIndicator: (options: StructureOptions) =>
    options.trendIndicator
      ? Element(CARD.htmlStructure.elements.trendIndicator.container).html(
          Element(CARD.htmlStructure.elements.trendIndicator.icon).html(),
        )
      : '',

  label: (options: StructureOptions) => (options.hasLabel ? Element(CARD.htmlStructure.elements.label).html() : ''),

  wrapWithBarPosition: (content: string, options: StructureOptions) => {
    const { barPosition = '' } = options;
    const bar = () => StructureElements.progressBar(options);

    const wrap: Record<string, () => { before: string; after: string }> = {
      top: () => ({ before: StructureElements.topContainer().replace(CONTENT_SLOT, bar()), after: '' }),
      bottom: () => ({ before: '', after: StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()) }),
      below: () => ({ before: '', after: StructureElements.belowContainer().replace(CONTENT_SLOT, bar()) }),
      background: () => ({ before: '', after: StructureElements.backgroundContainer().replace(CONTENT_SLOT, bar()) }),
    };

    const { before = '', after = '' } = wrap[barPosition]?.() ?? {};

    return before + content + after;
  },
};

const StructureTemplates = {
  card: (options: StructureOptions = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.label(options) +
          StructureElements.iconSection() +
          StructureElements.contentFull(options),
      ),
      options,
    );
  },

  badge: (options: StructureOptions = {}) => {
    return StructureElements.container(options).replace(
      CONTENT_SLOT,
      StructureElements.iconSectionWoBadge() + StructureElements.contentFull(options),
    );
  },

  template: (options: StructureOptions = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.label(options) +
          StructureElements.iconSection() +
          StructureElements.contentMini(options),
      ),
      options,
    );
  },
  feature: (options: StructureOptions = {}) => {
    const { barPosition = '' } = options;
    const bar = () => StructureElements.progressBar(options);

    const containers: Record<string, () => string> = {
      top: () => StructureElements.topContainer().replace(CONTENT_SLOT, bar()),
      bottom: () => StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()),
    };

    return containers[barPosition]?.() ?? bar();
  },
};

/**
 * Builds and caches a card type's DOM structure (`StructureTemplates[
 * cardType]`) as a `<template>`, cloned on each `render()`/`clone()` call
 * instead of re-parsing `innerHTML` every time. Cached per unique structure
 * options (barType, barPosition, layout, ...), since the markup only depends
 * on those, not on the entity's live state.
 */
class ObjStructure {
  // CF5 - issue (perf) resolved - card.innerHTML re-parsed the full HTML string
  // on every render (each card creation, each editor keystroke). The structure
  // is now built once per unique option set into a <template> and cloned
  // (~5-10x faster than parsing). The DOM depends on the config's structure
  // options (barType, barPosition, layout, ...), so the cache is keyed on the
  // exact options object: any setConfig producing different structure options
  // gets its own template, identical configs share one.
  #templates = new Map<string, HTMLTemplateElement>();
  _cardType: string;

  constructor(cardType: string) {
    this._cardType = cardType;
    traceInstance(this, CARD_CONTEXT.debug.instances);
  }

  render(options: StructureOptions = {}): string {
    return (StructureTemplates as Record<string, (options: StructureOptions) => string>)[this._cardType](options);
  }

  clone(options: StructureOptions = {}): Node {
    // Options are small flat objects of primitives built in a fixed key order
    // by each class's _structureOptions getter -> JSON is a stable cache key.
    // The option space is bounded (a handful of enums/booleans), so is the
    // cache.
    const key = JSON.stringify(options);
    let tpl = this.#templates.get(key);
    if (!tpl) {
      tpl = document.createElement('template');
      tpl.innerHTML = this.render(options);
      this.#templates.set(key, tpl);
    }
    return tpl.content.cloneNode(true);
  }
}

export { ObjStructure };
export { Element };
export { StructureElements };
export { StructureTemplates };
export type { StructureOptions };
