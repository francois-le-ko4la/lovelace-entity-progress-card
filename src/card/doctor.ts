// EPB.doctor.cards() and .inspect(): the cards of ours on this page, through
// every shadow root, and what one of them made of its config.

import { META, suffixedName } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { cleanupOf, notesOf } from './card-audit.js';

type Node = Record<string, unknown>;
// Read loosely: a template view has no percent, an unrendered card no view.
type InspectedView = {
  config?: Node;
  name?: string | null;
  percent?: number;
  msg?: { content: string; sev: string } | null;
  hasValidatedConfig?: boolean;
  isNotFound?: boolean;
  isUnavailable?: boolean;
  isUnknown?: boolean;
  drawnFrom?: Node;
  _currentValue?: { value?: unknown; state?: unknown };
};

const OUR_TAGS = new Set(Object.values(META.types).map(({ typeName }) => suffixedName(typeName)));

const isOurs = (node: unknown): node is HTMLElement => node instanceof HTMLElement && OUR_TAGS.has(node.localName);

// Home Assistant nests a card a dozen shadow roots deep; a Multi's rows are
// cards of ours inside its own.
const collect = (root: Document | ShadowRoot, found: HTMLElement[]): HTMLElement[] => {
  for (const element of root.querySelectorAll('*')) {
    if (isOurs(element)) found.push(element);
    if (element.shadowRoot) collect(element.shadowRoot, found);
  }
  return found;
};

const viewOf = (card: HTMLElement): InspectedView =>
  (card as HTMLElement & { _cardView?: InspectedView })._cardView ?? {};

// An unrendered card's getter may throw: the doctor reports, never breaks.
const safely = <T>(read: () => T): T | string => {
  try {
    return read();
  } catch (error) {
    return `(${(error as Error).message})`;
  }
};

// The card a selected element belongs to, climbing out of shadow roots.
const hostCardOf = (node: unknown): HTMLElement | null => {
  let current: unknown = node;
  while (current) {
    if (isOurs(current)) return current;
    current = current instanceof ShadowRoot ? current.host : (current as { parentNode?: unknown }).parentNode;
  }
  return null;
};

const outerCardOf = (card: HTMLElement): string => {
  const root = card.getRootNode();
  return root instanceof ShadowRoot && isOurs(root.host) ? root.host.localName : '';
};

// Worst first: a card has one config state, its details list every finding.
type Cleanup = ReturnType<typeof cleanupOf> | null;

const cleanupOfCard = (card: HTMLElement): Cleanup => {
  const given = (card as HTMLElement & { _givenConfig?: Node | null })._givenConfig;
  return given ? cleanupOf(given) : null;
};

const configStateOf = (view: InspectedView, cleanup: Cleanup): string => {
  if (view.hasValidatedConfig === false) return '❌ invalid';
  if (cleanup?.deprecated.length) return '⚠️ deprecated';
  if (cleanup && (cleanup.inert.length > 0 || cleanup.rows.some((keys) => keys.length > 0))) return '🧹 no effect';
  if (cleanup?.newLook) return '🎨 new look';
  return '✅ ok';
};

const entityStateOf = (view: InspectedView): string => {
  if (!is.string(view.config?.entity)) return '';
  if (view.isNotFound) return '🚫 not found';
  if (view.isUnavailable) return '⏳ unavailable';
  if (view.isUnknown) return '❓ unknown';
  return '✅ ok';
};

const detailsOf = (view: InspectedView, cleanup: Cleanup): string => {
  const message = view.msg?.content;
  return [...(message ? [message] : []), ...(cleanup ? notesOf(cleanup) : [])].join('; ');
};

const rowOf = (card: HTMLElement) => {
  const view = viewOf(card);
  const cleanup = cleanupOfCard(card);
  const config = view.config ?? {};
  return {
    type: card.localName,
    entity: is.string(config.entity) ? config.entity : '',
    name: safely(() => view.name ?? ''),
    value: safely(() => view._currentValue?.value ?? ''),
    percent: safely(() => (is.number(view.percent) ? Math.round(view.percent * 10) / 10 : '')),
    config: safely(() => configStateOf(view, cleanup)),
    'entity state': safely(() => entityStateOf(view)),
    details: safely(() => detailsOf(view, cleanup)),
    inside: outerCardOf(card),
  };
};

const cards = (): HTMLElement[] => {
  const found = collect(document, []);
  // eslint-disable-next-line no-console -- a console command's own table
  console.table(found.map(rowOf));
  return found;
};

const inspect = (target: unknown): Node | null => {
  const all = collect(document, []);
  const card = is.number(target) ? (all[target] ?? null) : hostCardOf(target);
  if (!card) {
    console.warn('No card of ours there - doctor.cards() lists them, by number.');
    return null;
  }
  const view = viewOf(card);
  const report: Node = {
    index: all.indexOf(card),
    ...rowOf(card),
    drawnFrom: safely(() => view.drawnFrom ?? null),
    keptConfig: view.config ?? null,
    element: card,
  };
  console.info(report);
  return report;
};

export { cards, inspect };
