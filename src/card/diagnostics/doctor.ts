// EPB.doctor.cards(), .inspect(), .jinja(), .history() and .copy(): the cards
// of ours on this page, through every shadow root, and what one of them made
// of its config.

import { META, suffixedName } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { environmentReport } from '../../utils/diagnostic.js';
import type { LovelaceConfig } from '../../utils/types.js';
import { cleanupOf, notesByPath, notesOf } from './card-audit.js';
import { toYaml } from './yaml-writer.js';

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
  faultyEntity?: { role: string; jinja?: string } | null;
  drawnFrom?: { value: number; min: number; max: number };
  _currentValue?: { reading?: unknown; state?: unknown };
  peakSamples?: Sample[];
  _trendTracker?: { samples: Sample[] } | null;
};
type Sample = { t: number; value: number };
type InspectedCard = HTMLElement & {
  _givenConfig?: Node | null;
  _jinjaSubscriptions?: { diagnose: () => Node[] };
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
  const fault = view.faultyEntity;
  const blamed =
    fault && fault.role !== 'entity' ? ` (${fault.role}${fault.jinja === undefined ? '' : ', Jinja'})` : '';
  if (view.isNotFound) return `🚫 not found${blamed}`;
  if (view.isUnavailable) return `⏳ unavailable${blamed}`;
  if (view.isUnknown) return `❓ unknown${blamed}`;
  return '✅ ok';
};

const detailsOf = (view: InspectedView, cleanup: Cleanup): string => {
  const message = view.msg?.content;
  return [...(message ? [message] : []), ...(cleanup ? notesOf(cleanup) : [])].join('; ');
};

// Empty when there is nothing to compute: no percent (template view), an
// entity without a state or a degenerate range.
const drawnOf = (view: InspectedView): string => {
  const drawn = view.drawnFrom;
  if (view.isNotFound || view.isUnavailable || view.isUnknown) return '';
  if (!drawn || !is.number(view.percent) || drawn.min === drawn.max) return '';
  return `min ${drawn.min} · max ${drawn.max} · value ${drawn.value} · ${Math.round(view.percent * 10) / 10}%`;
};

// What the debug button of the editor adds to its report: the preview card of
// the dialog the editor sits in. Empty when there is no such dialog.
const drawnOfPreview = (editor: HTMLElement): string => {
  let root = editor.getRootNode();
  while (root instanceof ShadowRoot && root.host.localName !== 'hui-dialog-edit-card') root = root.host.getRootNode();
  if (!(root instanceof ShadowRoot)) return '';
  const [preview] = collect(root, []);
  return preview ? (safely(() => drawnOf(viewOf(preview))) as string) : '';
};

const rowOf = (card: HTMLElement) => {
  const view = viewOf(card);
  const cleanup = cleanupOfCard(card);
  const config = view.config ?? {};
  return {
    type: card.localName,
    entity: is.string(config.entity) ? config.entity : '',
    name: safely(() => view.name ?? ''),
    value: safely(() => view._currentValue?.reading ?? ''),
    percent: safely(() => (is.number(view.percent) ? Math.round(view.percent * 10) / 10 : '')),
    drawn: safely(() => drawnOf(view)),
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

const FENCE = '```';

// Ready to paste into a GitHub issue: the environment dump() prints, then the
// card's YAML with its deprecated options and options without effect marked.
const issueReportFor = (config: LovelaceConfig, drawn: string): string =>
  [
    `${FENCE}text`,
    environmentReport(),
    FENCE,
    '',
    `${FENCE}yaml`,
    toYaml(config, notesByPath(config)),
    ...(drawn ? [`# drawn from: ${drawn}`] : []),
    FENCE,
    '',
  ].join('\n');

const cardAt = (target: unknown): InspectedCard | null => {
  const card = is.number(target) ? (collect(document, [])[target] ?? null) : hostCardOf(target);
  if (!card) console.warn('No card of ours there - doctor.cards() lists them, by number.');
  return card;
};

const jinja = (target: unknown): Node[] | null => {
  const card = cardAt(target);
  if (!card) return null;
  const rows = card._jinjaSubscriptions?.diagnose() ?? [];
  // eslint-disable-next-line no-console -- a console command's own table
  if (rows.length > 0) console.table(rows);
  else console.info('No Jinja field in this card.');
  return rows;
};

const samplesTable = (samples: Sample[]) =>
  samples.map(({ t, value }) => ({ time: new Date(t).toLocaleString(), value }));

// trend_indicator's samples are percents, peak_marker's the raw readings.
const history = (target: unknown): Node | null => {
  const card = cardAt(target);
  if (!card) return null;
  const view = viewOf(card);
  const report = {
    trend: samplesTable(view._trendTracker?.samples ?? []),
    peak: samplesTable(view.peakSamples ?? []),
  };
  console.info(`trend_indicator: ${report.trend.length} sample(s), %`);
  // eslint-disable-next-line no-console -- a console command's own table
  if (report.trend.length > 0) console.table(report.trend);
  console.info(`peak_marker: ${report.peak.length} sample(s), raw values`);
  // eslint-disable-next-line no-console -- a console command's own table
  if (report.peak.length > 0) console.table(report.peak);
  return report;
};

// From the console, the page has no focus: the clipboard refuses, and the
// report stays printed and returned, for DevTools' own copy($_).
const copy = (target: unknown): string | null => {
  const card = cardAt(target);
  if (!card) return null;
  const view = viewOf(card);
  const config = (card._givenConfig ?? view.config ?? {}) as LovelaceConfig;
  const report = issueReportFor(config, safely(() => drawnOf(view)) as string);
  console.info(report);
  navigator.clipboard?.writeText(report).then(
    () => console.info('Copied to the clipboard.'),
    () => console.info('Not copied (the page needs focus): run copy($_) right after this command.'),
  );
  return report;
};

const inspect = (target: unknown): Node | null => {
  const all = collect(document, []);
  const card = cardAt(target);
  if (!card) return null;
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

export { cards, inspect, jinja, history, copy, drawnOfPreview, issueReportFor };
