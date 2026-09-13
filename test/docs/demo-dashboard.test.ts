/*
 * The two demo dashboards are this project's closest thing to an end-to-end
 * suite - but nothing ever confronted what they write with what the card
 * actually reads. A key the schema doesn't know is dropped in silence, and a
 * demo that renders nothing looks like a demo that renders a default: the
 * peak_marker CSS-hook cards spent releases showing no mark at all because
 * their block was missing its required `window`.
 *
 * So: every card in both files goes through the very pipeline the card runs
 * (_customizeConfig, then the schema's parse), and must come out still
 * carrying every option it declared.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load as loadYaml } from 'js-yaml';
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

const FILES = ['docs/demo-dashboard.yaml', 'docs/demo-dashboard-dev.yaml'];

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

// Deliberately deprecated shapes: the -dev file has a whole view exercising
// them, and being rewritten by the migration is the point.
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

type Card = { variant: SchemaVariant; config: LovelaceConfig; file: string };

const collect = (file: string): Card[] => {
  const found: Card[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.type === 'string' && record.type.startsWith('custom:entity-progress')) {
      // The -dev dashboard uses the dev element names, same configs otherwise.
      const typeName = record.type.replace('custom:', '').replace(/-dev$/, '');
      const variant = TYPE_TO_VARIANT.get(typeName);
      if (variant) found.push({ variant, config: record as LovelaceConfig, file });
    }
    Object.values(record).forEach(walk);
  };
  walk(loadYaml(fs.readFileSync(file, 'utf8')));
  return found;
};

const cards = FILES.flatMap(collect);

// An empty array/object says "nothing here", which is what its absence says
// too - not a dropped option.
const isEmpty = (value: unknown) =>
  value === undefined ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && value !== null && Object.keys(value).length === 0);

const describeCard = (card: Card) =>
  `${card.file} · ${card.variant} · ${String(card.config.name ?? card.config.entity ?? '(unnamed)')}`;

describe('the demo dashboards are configs the card actually accepts', () => {
  test('both files hold cards to check', () => {
    assert.ok(cards.length > 500, `only ${cards.length} cards collected - the walk is not finding them`);
  });

  test('no card declares an option the schema then drops', () => {
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
    assert.deepEqual(lost, [], `\n${lost.join('\n')}\n`);
  });
});
