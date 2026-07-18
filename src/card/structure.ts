/*
 * Builds the card's raw HTML markup: reusable element templates
 * (StructureElements) and the full per-card-type structure templates
 * (StructureTemplates) assembled from them.
 */

import { CARD, CONTENT_SLOT } from '../utils/parameters.js';

// `obj` shapes come from CARD.htmlStructure.* - heterogeneous (some carry
// `id`/`extraAttr`, most don't) and `options` bags vary per call site (layout,
// barPosition, barType, trendIndicator, multiline, barSingleLine...token
// subsets, never all at once) - deliberately loose rather than modeling every
// combination as its own interface.
const Element = (obj: any, extraClass = '') => {
  const className = `${obj.class} ${extraClass}`.trim();
  const renderAttrs = (attrsObj: Record<string, any> = {}) =>
    Object.entries(attrsObj)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

  return {
    tag: obj.element,
    class: className,
    html: (content = '', attrs: Record<string, any> = {}) => {
      const allAttrs = { ...(obj.id ? { id: obj.id } : {}), ...(obj.extraAttr || {}), ...attrs };
      return `<${obj.element} class="${className}" ${renderAttrs(allAttrs)}>${content}</${obj.element}>`;
    },
  };
};

const StructureElements = {
  ripple: () => '<ha-ripple></ha-ripple>',
  container: (options: any) =>
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

  secondaryInfoWrapper: (options: any = {}) =>
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

  secondaryInfoWrapperMinimal: (options: any = {}) =>
    options.multiline
      ? StructureElements.secondaryInfoWrapperMultiline(false)
      : Element(CARD.htmlStructure.elements.secondaryInfoWrapper).html(
          Element(CARD.htmlStructure.elements.ellipsisWrapper).html(
            Element(CARD.htmlStructure.elements.secondaryInfoValue).html(
              Element(CARD.htmlStructure.elements.secondaryInfoExtra).html(),
            ),
          ),
        ),

  progressBar: (options: any) => {
    const extraClass = options.barPosition === 'overlay' ? 'overlay' : '';
    const isCenterZero = options.barType === 'centerZero';
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

    return Element(CARD.htmlStructure.elements.progressBar.container, extraClass).html(
      Element(
        CARD.htmlStructure.elements.progressBar.bar,
        isCenterZero ? CARD.style.dynamic.progressBar.centerZero.class : 'default',
      ).html(innerHtml),
      isCenterZero ? { 'aria-valuemin': '-100' } : {},
    );
  },

  createSecondaryInfo: (options: any, secondaryInfoWrapperFn: (options: any) => string) => {
    const { layout, barPosition } = options;
    const excludedPositions = ['top', 'bottom', 'below', 'overlay', 'background'];
    const excludedLayouts = ['vertical'];

    let content = secondaryInfoWrapperFn(options);

    if (!excludedPositions.includes(barPosition) && !excludedLayouts.includes(layout)) {
      content += StructureElements.progressBar(options);
    }

    return Element(CARD.htmlStructure.elements.secondaryInfo).html(content);
  },

  secondaryInfo: (options: any) =>
    StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapper),

  secondaryInfoMinimal: (options: any) =>
    StructureElements.createSecondaryInfo(options, StructureElements.secondaryInfoWrapperMinimal),

  createContent: (options: any, rightContent: string) => {
    const isOverlay = options.barPosition === 'overlay';
    const isSingleLine = options.barSingleLine;
    const isVertical = options.layout === 'vertical';
    const isBelowTopOrBottom = ['below', 'top', 'bottom', 'background'].includes(options.barPosition);

    const extraClass = (isOverlay ? ' overlay' : '') + (isSingleLine ? ' single-line' : '');
    const before = isOverlay ? StructureElements.progressBar(options) : '';
    const after = !isOverlay && !isBelowTopOrBottom && isVertical ? StructureElements.progressBar(options) : '';
    const content = before + rightContent + after;

    return Element(CARD.htmlStructure.sections.content, extraClass).html(content);
  },

  contentFull: (options: any) =>
    StructureElements.createContent(
      options,
      StructureElements.nameContent() + StructureElements.secondaryInfo(options),
    ),
  contentMini: (options: any) =>
    StructureElements.createContent(
      options,
      StructureElements.nameContent(true) + StructureElements.secondaryInfoMinimal(options),
    ),

  iconSection: () =>
    Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape() + StructureElements.badge()),
  iconSectionWoBadge: () => Element(CARD.htmlStructure.sections.icon).html(StructureElements.iconAndShape()),

  trendIndicator: (options: any) =>
    options.trendIndicator
      ? Element(CARD.htmlStructure.elements.trendIndicator.container).html(
          Element(CARD.htmlStructure.elements.trendIndicator.icon).html(),
        )
      : '',

  wrapWithBarPosition: (content: string, options: any) => {
    const { barPosition } = options;
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
  card: (options: any = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.iconSection() +
          StructureElements.contentFull(options),
      ),
      options,
    );
  },

  badge: (options: any = {}) => {
    return StructureElements.container(options).replace(
      CONTENT_SLOT,
      StructureElements.iconSectionWoBadge() + StructureElements.contentFull(options),
    );
  },

  template: (options: any = {}) => {
    return StructureElements.wrapWithBarPosition(
      StructureElements.container(options).replace(
        CONTENT_SLOT,
        StructureElements.trendIndicator(options) +
          StructureElements.iconSection() +
          StructureElements.contentMini(options),
      ),
      options,
    );
  },
  feature: (options: any = {}) => {
    const { barPosition } = options;
    const bar = () => StructureElements.progressBar(options);

    const containers: Record<string, () => string> = {
      top: () => StructureElements.topContainer().replace(CONTENT_SLOT, bar()),
      bottom: () => StructureElements.bottomContainer().replace(CONTENT_SLOT, bar()),
    };

    return containers[barPosition]?.() ?? bar();
  },
};

export { Element };
export { StructureElements };
export { StructureTemplates };
