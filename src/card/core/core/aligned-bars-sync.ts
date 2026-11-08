import { CARD } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import { type ViewCore } from '../../view/core.js';
import { HAS_EFFECT, contentOrderKey } from '../../config/schema.js';
import { type ResourceManager, type DOMHelper } from '../../dom/dom-helpers.js';
import { joinAlignedRows } from '../../dom/aligned-bars.js';

const ALIGNED_BARS_ID = 'alignedBars';

type AlignedBarsHost = {
  element: HTMLElement;
  shadow: ShadowRoot;
  config: ViewCore['config'];
  resourceManager: ResourceManager;
  dom: DOMHelper;
};

// Rebuilt with every render: the text it watches is a new one each time.
const syncAlignedBars = ({ element, shadow, config, resourceManager, dom }: AlignedBarsHost) => {
  // A name gathers every card carrying it; true, the rows of one Multi - a
  // row is told it is one by the wrapper it sits in.
  const inMulti = element.parentElement?.classList.contains(CARD.style.dynamic.multiItem);
  const setting = config.bar_aligned;
  const group = is.nonEmptyString(setting) ? setting : setting === true && inMulti ? element.getRootNode() : null;
  const singleLine = config.density === 'single_line';
  const { infoRow: rowText, contentLine, contentGroup } = CARD.htmlStructure.sections;
  const { secondaryInfoWrapper: valueText } = CARD.htmlStructure.elements;
  // Ordered, the column is the text block before the bar: none when it leads.
  const ordered = contentOrderKey(config) !== undefined;
  const columnSelector =
    (ordered && `.${contentLine.class}.with-bar > .${contentGroup.class}:first-child`) ||
    `.${singleLine ? rowText.class : valueText.class}`;
  const column = group && HAS_EFFECT.barAligned(config) ? shadow.querySelector<HTMLElement>(columnSelector) : null;
  const row =
    singleLine && !ordered
      ? column?.closest<HTMLElement>(`.${CARD.style.dynamic.singleLineRow}`)
      : column?.parentElement;
  if (!group || !column || !row) {
    resourceManager.remove(ALIGNED_BARS_ID);
    return;
  }
  const rows = joinAlignedRows(group, {
    measure: () => {
      // Layout px, like cap: a rect is post-transform (HA's dialog zooms in).
      const scale = row.getBoundingClientRect().width / row.offsetWidth || 1;
      return column.getBoundingClientRect().width / scale;
    },
    cap: () => row.clientWidth / 2,
    apply: (width) => {
      const card = CARD.htmlStructure.card.element;
      dom.setStyleNow(card, CARD.style.dynamic.alignWidth.var, width);
      dom.setStyleNow(card, CARD.style.dynamic.alignTextFloor.var, width ? '0px' : '');
    },
  });
  const texts = new MutationObserver(rows.textChanged);
  texts.observe(column, { characterData: true, childList: true, subtree: true });
  const size = new ResizeObserver(rows.resized);
  size.observe(row);
  resourceManager.add(() => {
    texts.disconnect();
    size.disconnect();
    rows.leave();
  }, ALIGNED_BARS_ID);
};

export { syncAlignedBars };
