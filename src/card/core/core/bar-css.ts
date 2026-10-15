import { CARD } from '../../../utils/parameters.js';
import { type ViewCore } from '../../view/core.js';
import { type DOMHelper, type CacheValue } from '../../dom/dom-helpers.js';

// ViewBase.divergingBarStack's return shape (see view/base.ts).
type DivergingGradients = {
  posGradient: string | null;
  negGradient: string | null;
  posSize: number;
  negSize: number;
};

type BarCssHost = { view: ViewCore; dom: DOMHelper };

type ProgressCssOptions = {
  barColor?: string | null;
  iconColor?: string | null;
  gradient?: string | null;
  diverging?: DivergingGradients | null;
};

// N real fill cells per fillable half, built once per render(); each cell's
// fill is pure CSS off --progress-bar-value (see CHANGELOG.md).
const buildSegmentCells = ({ view, dom, shadow }: BarCssHost & { shadow: ShadowRoot }) => {
  const active = view.isSegmented;
  const count = view.config.bar_segments as number;
  const isCenterZero = Boolean(view.config.center_zero);
  const rounded = active ? Math.round(count) : 0;
  // .bar-segmented only resets .bar's radius and hides .inner (styles.ts).
  dom.toggleClass(CARD.htmlStructure.card.element, 'bar-segmented', active);
  if (!active) return;
  const containerSpec = CARD.htmlStructure.elements.progressBar.segments;
  // center_zero: one N-cell row per arm (.bar-half); --bar-segments stays on
  // .bar, the one ancestor a mark and every cell share.
  const halfSpec = CARD.htmlStructure.elements.progressBar.half;
  const bars = shadow.querySelectorAll<HTMLElement>(
    `.${CSS.escape(CARD.htmlStructure.elements.progressBar.bar.class)}`,
  );
  const cellSpec = CARD.htmlStructure.elements.progressBar.segmentCell;
  bars.forEach((bar) => {
    bar.style.setProperty('--bar-segments', String(rounded));
    const targets = isCenterZero ? Array.from(bar.querySelectorAll(`.${CSS.escape(halfSpec.class)}`)) : [bar];
    targets.forEach((target) => {
      const container = document.createElement(containerSpec.element);
      container.className = containerSpec.class;
      Object.entries(containerSpec.extraAttr ?? {}).forEach(([key, value]) =>
        container.setAttribute(key, String(value)),
      );
      for (let i = 0; i < rounded; i += 1) {
        const cell = document.createElement(cellSpec.element);
        cell.className = cellSpec.class;
        Object.entries(cellSpec.extraAttr ?? {}).forEach(([key, value]) => cell.setAttribute(key, String(value)));
        cell.style.setProperty('--segment-index', String(i));
        container.appendChild(cell);
      }
      // Before .inner/marks: the cells paint an opaque base, so DOM order keeps
      // marks on top.
      target.insertBefore(container, target.firstChild);
    });
  });
};

// bar_stack + center_zero: per-arm gradients/sizes (divergingBarStack),
// removed when not applicable - setStyle() never unsets on its own.
const applyDivergingBarStackCSS = (dom: DOMHelper, cardKey: string, diverging: DivergingGradients | null) => {
  const pb = CARD.style.dynamic.progressBar;
  // Nullish (no bar_stack, or one arm with no gradient) removes; a size of 0
  // is a real value and must still be written.
  (
    [
      [pb.stackGradientPos.var, diverging?.posGradient],
      [pb.stackGradientNeg.var, diverging?.negGradient],
      [pb.stackSizePos.var, diverging?.posSize],
      [pb.stackSizeNeg.var, diverging?.negSize],
    ] as [string, CacheValue][]
  ).forEach(([varName, value]) => dom.setOrRemoveStyle(cardKey, varName, value));
};

const applyProgressCSS = (
  { view, dom }: BarCssHost,
  progressValue: number | null,
  { barColor = null, iconColor = null, gradient = null, diverging = null }: ProgressCssOptions = {},
) => {
  const cardKey = CARD.htmlStructure.card.element;

  // down: the gradients are built for up, and run the other way.
  const flip = (value: string | null): string | null =>
    value && view.isDownBar
      ? value.replace(/to (top|bottom)/g, (way) => (way === 'to top' ? 'to bottom' : 'to top'))
      : value;
  const fillColor = flip(gradient) ?? barColor;
  if (fillColor !== null) dom.setStyle(cardKey, CARD.style.dynamic.progressBar.color.var, fillColor);
  if (iconColor !== null) dom.setStyle(cardKey, CARD.style.dynamic.iconAndShape.color.var, iconColor);

  applyDivergingBarStackCSS(
    dom,
    cardKey,
    diverging && { ...diverging, posGradient: flip(diverging.posGradient), negGradient: flip(diverging.negGradient) },
  );

  if (progressValue !== null) {
    dom.setStyle(cardKey, CARD.style.dynamic.progressBar.value.var, progressValue);
    // The bar's, or the ring's stand-in: only one of them is ever built.
    for (const key of [
      CARD.htmlStructure.elements.progressBar.container.class,
      CARD.htmlStructure.elements.ringProgress.class,
    ]) {
      dom.setAttribute(key, 'aria-valuenow', Math.round(progressValue * 100));
    }
  }
};

export { buildSegmentCells, applyProgressCSS };
export type { DivergingGradients, ProgressCssOptions };
