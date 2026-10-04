// What a card config written down - in a demo dashboard, in a docs example -
// is checked by: found wherever it sits in the YAML, run through the very
// pipeline the card runs (_customizeConfig, then the schema), and must come
// out still carrying every option it declared.

import { YamlSchemaFactory, type SchemaVariant } from '../../src/card/schema.js';
import {
  CardConfigHelper,
  BadgeConfigHelper,
  FeatureConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
  MultiCardConfigHelper,
  MultiFeatureConfigHelper,
  type BaseConfigHelper,
} from '../../src/card/config-helpers.js';
import { META } from '../../src/utils/meta.js';
import type { LovelaceConfig } from '../../src/utils/types.js';

const HELPERS: Record<string, typeof BaseConfigHelper> = {
  card: CardConfigHelper,
  badge: BadgeConfigHelper,
  feature: FeatureConfigHelper,
  template: TemplateConfigHelper,
  badgeTemplate: BadgeTemplateConfigHelper,
  multiCard: MultiCardConfigHelper,
  multiFeature: MultiFeatureConfigHelper,
};

// Home Assistant's own per-card keys, plus the editor's ephemeral ones: never
// this project's to validate.
const FOREIGN_KEYS = new Set(['type', 'card_mod', 'view_layout', 'grid_options', 'layout_options', 'visibility']);

// Deliberately deprecated shapes, shown on purpose where the migration is the
// point (the -dev demo's own view, the docs' migration notes).
const DEPRECATED_KEYS = new Set([
  'show_value',
  'value_position',
  'additions',
  'navigate_to',
  'show_more_info',
  'disable_unit',
  'max_value_attribute',
]);

const TYPE_TO_VARIANT = new Map<string, SchemaVariant>(
  Object.entries(META.types).map(([variant, meta]) => [
    (meta as { typeName: string }).typeName,
    variant as SchemaVariant,
  ]),
);

type Card = { variant: SchemaVariant; config: LovelaceConfig; where: string };

// Every card of ours anywhere in a parsed YAML tree - stacks, auto-entities
// options, tile features included.
const collectCards = (tree: unknown, where: string): Card[] => {
  const found: Card[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.type === 'string' && record.type.startsWith('custom:entity-progress')) {
      // The -dev element names carry the same configs.
      const typeName = record.type.replace('custom:', '').replace(/-dev$/, '');
      const variant = TYPE_TO_VARIANT.get(typeName);
      if (variant) found.push({ variant, config: record as LovelaceConfig, where });
    }
    Object.values(record).forEach(walk);
  };
  walk(tree);
  return found;
};

// An empty array/object says "nothing here", which is what its absence says
// too - not a dropped option.
const isEmpty = (value: unknown) =>
  value === undefined ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && value !== null && Object.keys(value).length === 0);

const describeCard = (card: Card) =>
  `${card.where} · ${card.variant} · ${String(card.config.name ?? card.config.entity ?? '(unnamed)')}`;

// Every declared option the card's own pipeline drops, or the whole config
// when the schema rejects it - one line each, empty when all is kept.
const droppedOptions = (cards: Card[]): string[] => {
  const lost: string[] = [];
  for (const card of cards) {
    const helper = HELPERS[card.variant];
    const parsed = YamlSchemaFactory[card.variant].parse(helper._customizeConfig(card.config)) as {
      config: Record<string, unknown> | null;
    };
    if (!parsed.config) {
      lost.push(`${describeCard(card)} → the whole config was rejected`);
      continue;
    }
    for (const key of Object.keys(card.config)) {
      if (FOREIGN_KEYS.has(key) || DEPRECATED_KEYS.has(key) || key.startsWith('_')) continue;
      if (isEmpty(card.config[key]) || parsed.config[key] !== undefined) continue;
      lost.push(`${describeCard(card)} → \`${key}\` is dropped`);
    }
  }
  return lost;
};

// The docs elide the rest of a config with a line of its own - `...` or
// `····` - which YAML can't read (`...` even ends the document).
const ELISION = /^\s*(\.\.\.|····|…)\s*$/u;
const withoutElisions = (text: string) =>
  text
    .split('\n')
    .filter((line) => !ELISION.test(line))
    .join('\n');

export { collectCards, droppedOptions, withoutElisions, DEPRECATED_KEYS, type Card };
