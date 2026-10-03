// EPB.doctor.audit(): every card, on every dashboard, carrying an option it
// shouldn't need - read from Home Assistant's own configs, unopened views too.

import { is } from '../utils/common-checks.js';
import { currentHass, type HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig } from '../utils/types.js';
import { deprecatedOptionsOf } from './config-helpers.js';
import { OPTIONS_WITHOUT_EFFECT } from './schema.js';

type Node = Record<string, unknown>;
type Finding = { where: string; notes: string[] };
type Dashboard = { title: string; urlPath: string | null };
// rows: each Multi row's options without effect, by row index.
type Cleanup = { deprecated: string[]; inert: string[]; rows: string[][]; newLook: boolean };

const OURS = 'custom:entity-progress-';
const MULTI = 'custom:entity-progress-multi-';
const SEPARATOR = ' › ';
const NEW_LOOK_NOTE = 'rows show icon, name and value since 1.6.3 - hide: [icon, name, secondary_info] keeps bare bars';

const inertOptionsOf = (config: Node): string[] =>
  OPTIONS_WITHOUT_EFFECT.filter(({ key, hasEffect }) => !is.nullish(config[key]) && !hasEffect(config)).map(
    ({ key }) => key,
  );

const rowsOf = (multi: Node): Node[] =>
  (is.array(multi.entities) ? multi.entities : []).map((row) => (is.plainObject(row) ? row : { entity: row }));

const cleanupOf = (card: Node): Cleanup => {
  const isMulti = is.string(card.type) && card.type.startsWith(MULTI);
  const rows = isMulti ? rowsOf(card) : [];
  return {
    deprecated: deprecatedOptionsOf(card as LovelaceConfig),
    // A Multi's shared level is a partial config: each row is judged whole.
    inert: isMulti ? [] : inertOptionsOf(card),
    rows: rows.map((row) => inertOptionsOf({ ...card, ...row })),
    newLook: isMulti && [card, ...rows].every((level) => level.hide === undefined && level.show_value === undefined),
  };
};

const notesOf = ({ deprecated, inert, rows, newLook }: Cleanup): string[] => [
  ...(deprecated.length > 0 ? [`deprecated: ${deprecated.join(', ')}`] : []),
  ...(inert.length > 0 ? [`no effect: ${inert.join(', ')}`] : []),
  ...rows.flatMap((keys, index) => (keys.length > 0 ? [`row ${index + 1}, no effect: ${keys.join(', ')}`] : [])),
  ...(newLook ? [NEW_LOOK_NOTE] : []),
];

const isSetOn = (level: unknown, key: string): boolean => is.plainObject(level) && level[key] !== undefined;

// Each note at the key it is about, as a dotted path into the card's YAML: a
// row's own key when the row sets it, the shared one otherwise; '' is the card.
const notesByPath = (card: Node): Map<string, string[]> => {
  const { deprecated, inert, rows, newLook } = cleanupOf(card);
  const notes = new Map<string, string[]>();
  const add = (path: string, note: string) => notes.set(path, [...(notes.get(path) ?? []), note]);
  const entities = is.array(card.entities) ? card.entities : [];
  for (const key of deprecated) {
    const rowPaths = entities.flatMap((row, index) => (isSetOn(row, key) ? [`entities.${index}.${key}`] : []));
    const paths = isSetOn(card, key) ? [key, ...rowPaths] : rowPaths;
    if (paths.length === 0) add('', `deprecated: ${key}`);
    for (const path of paths) add(path, 'deprecated');
  }
  for (const key of inert) add(key, 'no effect');
  const inherited = new Map<string, number[]>();
  rows.forEach((keys, index) => {
    for (const key of keys) {
      if (isSetOn(entities[index], key)) add(`entities.${index}.${key}`, 'no effect');
      else inherited.set(key, [...(inherited.get(key) ?? []), index + 1]);
    }
  });
  for (const [key, rowNumbers] of inherited)
    add(key, rowNumbers.length === rows.length ? 'no effect' : `no effect on row ${rowNumbers.join(', ')}`);
  if (newLook) add('', NEW_LOOK_NOTE);
  return notes;
};

// A Multi has no entity of its own: its first row, and how many follow.
const labelOf = (card: Node): string => {
  if (is.string(card.entity)) return ` (${card.entity})`;
  const rows = rowsOf(card);
  const first = rows[0]?.entity;
  if (!is.string(first)) return '';
  return rows.length > 1 ? ` (${first} +${rows.length - 1})` : ` (${first})`;
};

const walk = (node: unknown, where: string, findings: Finding[]) => {
  if (is.array(node)) {
    for (const item of node) walk(item, where, findings);
    return;
  }
  if (!is.plainObject(node)) return;
  const type = node.type;
  if (is.string(type) && type.startsWith(OURS)) {
    const notes = notesOf(cleanupOf(node));
    if (notes.length > 0)
      findings.push({ where: `${where}${SEPARATOR}${type.replace('custom:', '')}${labelOf(node)}`, notes });
    return;
  }
  for (const value of Object.values(node)) walk(value, where, findings);
};

// One dashboard's config: stacks, sections, badges and tile features alike.
const auditDashboard = (config: unknown, dashboard: string): Finding[] => {
  const findings: Finding[] = [];
  const views = is.plainObject(config) && is.array(config.views) ? config.views : [];
  views.forEach((view, index) => {
    const named = is.plainObject(view) ? [view.title, view.path].find((name) => is.nonEmptyString(name)) : undefined;
    walk(view, `${dashboard}${SEPARATOR}${String(named ?? `view ${index + 1}`)}`, findings);
  });
  return findings;
};

// The default dashboard comes last: when HA lists it too, its own title wins.
// A user refused the list still gets the dashboard on screen.
const dashboardsToRead = async (send: (msg: Node) => Promise<unknown>): Promise<Dashboard[]> => {
  try {
    const listed = (await send({ type: 'lovelace/dashboards/list' })) as { title?: string; url_path: string }[];
    return [
      ...listed.map((entry) => ({ title: entry.title ?? entry.url_path, urlPath: entry.url_path })),
      { title: 'Overview', urlPath: null },
    ];
  } catch {
    const current = window.location.pathname.split('/')[1];
    return [{ title: current, urlPath: current === 'lovelace' ? null : current }];
  }
};

const readFindings = async (connection: HomeAssistant['connection']): Promise<Finding[]> => {
  const send = (msg: Node) => connection.sendMessagePromise(msg);
  const dashboards = await dashboardsToRead(send);
  const configs = await Promise.all(
    dashboards.map(({ urlPath }) => send({ type: 'lovelace/config', url_path: urlPath }).catch(() => null)),
  );
  const seen = new Set<string>();
  return dashboards.flatMap(({ title }, index) => {
    const key = JSON.stringify(configs[index]);
    // An auto-generated dashboard has no config; one read twice counts once.
    if (configs[index] === null || seen.has(key)) return [];
    seen.add(key);
    return auditDashboard(configs[index], title);
  });
};

const summarize = (findings: Finding[]): string[] => [
  ...findings.map(({ where, notes }) => `${where}\n    ${notes.join('\n    ')}`),
  findings.length > 0
    ? `${findings.length} card(s) to review — Migrate config, in each card's editor, rewrites or removes what it can.`
    : 'Nothing to review.',
];

const audit = async (): Promise<string> => {
  const connection = currentHass()?.connection;
  const lines = connection
    ? summarize(await readFindings(connection))
    : ['No Home Assistant connection yet - open a dashboard first.'];
  const report = ['=== Entity Progress Card — audit ===', ...lines].join('\n');
  console.info(report);
  return report;
};

export { auditDashboard, audit, notesByPath, cleanupOf, notesOf };
