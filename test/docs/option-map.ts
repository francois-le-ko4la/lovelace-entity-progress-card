/*
 * docs/option-map.md, rendered: for every option the schema accepts, where it
 * is edited, read, documented, shown and tested. scripts/option-map.js writes
 * it; option-map.test fails when the committed file no longer matches.
 */

import fs from 'node:fs';
import { load as loadYaml } from 'js-yaml';
import { YamlSchemaFactory, schemaOptions, type SchemaVariant } from '../../src/card/schema.js';
import { EditorFactory } from '../../src/editor/factory.js';
import { collectCards } from './card-configs.js';

const OPTION_MAP = 'docs/option-map.md';
const CONFIGURATION = 'docs/configuration.md';
const DOC_SOURCES = [CONFIGURATION, 'docs/cookbook.md', 'README.md'];
const DEMO = 'docs/demo-dashboard.yaml';

const VARIANTS: [SchemaVariant, string][] = [
  ['card', 'Card'],
  ['template', 'Template'],
  ['badge', 'Badge'],
  ['badgeTemplate', 'Badge Tpl'],
  ['feature', 'Feature'],
  ['multiCard', 'Multi Card'],
  ['multiFeature', 'Multi Feat.'],
];

const FORMS: Record<string, unknown> = {
  card: EditorFactory.build({ template: false, badge: false }),
  template: EditorFactory.build({ template: true, badge: false }),
  badge: EditorFactory.build({ template: false, badge: true }),
  badgeTemplate: EditorFactory.build({ template: true, badge: true }),
  feature: EditorFactory.buildFeature(),
  multiCard: [EditorFactory.buildMulti(false), EditorFactory.buildMultiRow(false)],
  multiFeature: [EditorFactory.buildMulti(true), EditorFactory.buildMultiRow(true)],
};

// Why a variant accepts an option no editor field writes - anything else
// missing from the editor is a gap.
const NOTES: Record<string, string> = {
  disable_unit:
    "Deprecated: migrates to `hide: [unit]`. Kept in the schema only for a Jinja `hide`, which the migration can't edit.",
  layout: 'Badge, Badge Template and Feature accept a single value: nothing to choose.',
  bar_aligned: 'Card and Template take a group name, written in YAML. The Multi variants get a toggle.',
};

type Config = Record<string, unknown>;
type EditState = 'editor' | 'yaml' | 'single';
type Row = {
  key: string;
  section: string | null;
  states: Record<string, EditState>;
  fieldDefault: unknown;
  readers: number;
  examples: number;
  demo: number;
  tests: number;
};

const read = (file: string) => fs.readFileSync(file, 'utf8');

// Every option a field tree writes, by its field name or target.
const writtenKeys = (tree: unknown, keys = new Set<string>()): Set<string> => {
  if (Array.isArray(tree)) {
    for (const node of tree) writtenKeys(node, keys);
    return keys;
  }
  if (!tree || typeof tree !== 'object') return keys;
  const node = tree as Config;
  for (const prop of ['name', 'target']) {
    const value = node[prop];
    if (typeof value === 'string') keys.add(value.split('.')[0]);
  }
  for (const child of Object.values(node)) writtenKeys(child, keys);
  return keys;
};

const yamlCards = (file: string): Config[] => {
  const lines = read(file).split('\n');
  const cards: Config[] = [];
  let start = -1;
  lines.forEach((line, index) => {
    if (start < 0 && /^\s*```yaml\s*$/.test(line)) start = index;
    else if (start >= 0 && /^\s*```\s*$/.test(line)) {
      const text = lines
        .slice(start + 1, index)
        .filter((kept) => !/^\s*(\.\.\.|····|…)\s*$/.test(kept))
        .join('\n');
      if (text.includes('custom:entity-progress'))
        try {
          cards.push(...collectCards(loadYaml(text), file).map((card) => card.config as Config));
        } catch {
          // An invalid block is doc-examples.test's to report, not the map's.
        }
      start = -1;
    }
  });
  return cards;
};

const usedIn = (cards: Config[], key: string) =>
  cards.filter(
    (card) =>
      key in card ||
      (Array.isArray(card.entities) &&
        card.entities.some((row: unknown) => Boolean(row) && typeof row === 'object' && key in (row as Config))),
  ).length;

const tsFiles = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? tsFiles(`${dir}/${entry.name}`)
        : entry.name.endsWith('.ts')
          ? [`${dir}/${entry.name}`]
          : [],
    );

const naming = (files: string[], key: string) =>
  files.filter((file) => new RegExp(`\\b${key}\\b`).test(read(file))).length;

function collect(): Row[] {
  const editorKeys = Object.fromEntries(Object.entries(FORMS).map(([variant, form]) => [variant, writtenKeys(form)]));
  const configuration = read(CONFIGURATION);
  const sections = new Set([...configuration.matchAll(/^#{3,4} `([a-z_]+)`/gm)].map((match) => match[1]));
  const docCards = DOC_SOURCES.flatMap(yamlCards);
  const demo = collectCards(loadYaml(read(DEMO)), DEMO).map((card) => card.config as Config);
  const readers = [...tsFiles('src/card'), ...tsFiles('src/utils')];
  const tests = tsFiles('test');

  const keys = new Set(VARIANTS.flatMap(([variant]) => YamlSchemaFactory[variant].fields()));
  return [...keys].sort().map((key) => {
    const variants = VARIANTS.map(([variant]) => variant).filter((variant) =>
      YamlSchemaFactory[variant].fields().includes(key),
    );
    const fieldDefault = variants
      .map((variant) => YamlSchemaFactory[variant].fieldDefault(key))
      .find((value) => value !== undefined);
    const section = sections.has(key) ? key : /_action$/.test(key) && sections.has('xyz_action') ? 'xyz_action' : null;
    return {
      key,
      section,
      states: Object.fromEntries(
        variants.map((variant): [string, EditState] => [
          variant,
          editorKeys[variant].has(key) ? 'editor' : schemaOptions(variant, key).length === 1 ? 'single' : 'yaml',
        ]),
      ),
      fieldDefault,
      readers: naming(readers, key),
      examples: usedIn(docCards, key),
      demo: usedIn(demo, key),
      tests: naming(tests, key),
    };
  });
}

const STATE_MARK: Record<EditState, string> = { editor: '✅', yaml: '📝', single: '➖' };

// Prose lines stay within markdownlint's 80 columns.
const wrap = (words: string[], width = 80) =>
  words
    .reduce(
      (lines: string[], word) => {
        const last = lines[lines.length - 1];
        if (last && `${last} ${word}`.length <= width) lines[lines.length - 1] = `${last} ${word}`;
        else lines.push(word);
        return lines;
      },
      [''],
    )
    .filter(Boolean);

const defaultText = (value: unknown) => {
  // A table cell is never empty: markdownlint's compact table style.
  if (value === undefined || typeof value === 'symbol') return '—';
  return `\`${typeof value === 'object' ? JSON.stringify(value) : String(value)}\``.replace(/\|/g, '\\|');
};

const gapsOf = (rows: Row[]) => ({
  'Editor field missing': rows.filter((row) => !NOTES[row.key] && Object.values(row.states).includes('yaml')),
  'No section in configuration.md': rows.filter((row) => !row.section),
  'Named in no test': rows.filter((row) => row.tests === 0),
  'Not on the demo dashboard': rows.filter((row) => row.demo === 0),
  'No YAML example in the docs': rows.filter((row) => row.examples === 0),
});

function render(rows: Row[]): string {
  const out = [
    '<!-- Generated by `npm run docs:options` (scripts/option-map.js). -->',
    '<!-- Do not edit by hand: the next run overwrites it. -->',
    '',
    '# Option map',
    '',
    ...wrap(
      `Every YAML option the schema accepts, followed across the ${VARIANTS.length} variants, the visual editors, the card's code, the documentation, the demo dashboard and the tests.`.split(
        ' ',
      ),
    ),
    '',
    '## Gaps',
    '',
  ];
  for (const [title, list] of Object.entries(gapsOf(rows))) {
    out.push(`### ${title} (${list.length})`, '');
    out.push(
      ...(list.length
        ? wrap(list.map((row, index) => `\`${row.key}\`${index < list.length - 1 ? ',' : ''}`))
        : ['None.']),
      '',
    );
  }
  out.push(
    '## Matrix',
    '',
    '✅ in the editor · 📝 YAML only · ➖ a single value, nothing to edit ·',
    '· not accepted. _Readers_ (files in `src/card` and `src/utils`) and',
    '_Tests_ (files in `test/`) count the files naming the option, not uses.',
    '',
  );
  const header = ['Option', ...VARIANTS.map(([, label]) => label), 'Default', 'Readers', 'Examples', 'Demo', 'Tests'];
  out.push(
    `| ${header.join(' | ')} |`,
    `| ${header.map((_, index) => (index === 0 || index === 8 ? ':--' : ':-:')).join(' | ')} |`,
  );
  for (const row of rows) {
    const name = row.section ? `[\`${row.key}\`](configuration.md#${row.section})` : `\`${row.key}\``;
    const cells = [
      name + (NOTES[row.key] ? ' ¹' : ''),
      ...VARIANTS.map(([variant]) => (variant in row.states ? STATE_MARK[row.states[variant]] : '·')),
      defaultText(row.fieldDefault),
      row.readers,
      row.examples,
      row.demo,
      row.tests,
    ];
    out.push(`| ${cells.join(' | ')} |`);
  }
  out.push('', '## Notes', '', '¹ Accepted where no editor field writes it, on purpose:', '');
  for (const [key, note] of Object.entries(NOTES))
    out.push(...wrap(`- \`${key}\`: ${note}`.split(' '), 78).map((line, index) => (index ? `  ${line}` : line)));
  return `${out.join('\n')}\n`;
}

const optionMap = (): string => render(collect());

export { optionMap, OPTION_MAP };
