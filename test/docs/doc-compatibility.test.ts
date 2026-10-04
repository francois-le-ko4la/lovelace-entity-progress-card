/*
 * Each option section of the reference carries one badge per variant it works
 * on. The schema is what each variant accepts; the badges must say the same.
 * A hybrid (`name`: text on the card, Jinja on a template) is documented twice,
 * so each (option, variant) pair is owed exactly one badge across its sections.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { YamlSchemaFactory, schemaOptions } from '../../src/card/schema.js';

const DOC = 'docs/configuration.md';
const text = fs.readFileSync(DOC, 'utf8');

const BADGES = {
  Card: 'card',
  Badge: 'badge',
  Feature: 'feature',
  Template: 'template',
  BadgeTemplate: 'badgeTemplate',
} as const;
type Variant = (typeof BADGES)[keyof typeof BADGES];
const VARIANTS = Object.values(BADGES);

// One section documents every `*_action` key at once: a badge there says the
// variant takes some of them.
const GROUPED: Record<string, RegExp> = { xyz_action: /_action$/ };
const groupOf = (option: string) => Object.keys(GROUPED).find((group) => GROUPED[group].test(option));

const accepted = (variant: Variant, option: string) => YamlSchemaFactory[variant].fields().includes(option);
const options = [...new Set(VARIANTS.flatMap((variant) => YamlSchemaFactory[variant].fields()))];

// Badges per (option, variant), counted over every section naming the option.
const badges = new Map<string, number>();
const documented = new Set<string>();
const sections = text.split(/^#{3,4} `([a-z_]+)`(?: \(Jinja\))?$/m);
for (let index = 1; index < sections.length; index += 2) {
  const heading = sections[index];
  const body = sections[index + 1].split(/^#{2,4} /m)[0];
  if (GROUPED[heading]) for (const option of options) if (GROUPED[heading].test(option)) documented.add(option);
  documented.add(heading);
  for (const [badge, variant] of Object.entries(BADGES))
    // The usage, `[![…][Card-OK]]`, not the link definitions closing the file.
    if (body.includes(`][${badge}-OK]`))
      badges.set(`${heading}|${variant}`, (badges.get(`${heading}|${variant}`) ?? 0) + 1);
}

const acceptedBy = (variant: Variant, heading: string) =>
  GROUPED[heading]
    ? options.some((option) => GROUPED[heading].test(option) && accepted(variant, option))
    : accepted(variant, heading);

describe('configuration.md compatibility badges match the schema', () => {
  const headings = [...options.filter((name) => !groupOf(name)), ...Object.keys(GROUPED)];
  for (const option of headings.filter((name) => documented.has(name)).sort())
    test(option, () => {
      for (const variant of VARIANTS) {
        // A single accepted value leaves nothing to set there: either way.
        if (accepted(variant, option) && schemaOptions(variant, option).length === 1) continue;
        assert.equal(
          badges.get(`${option}|${variant}`) ?? 0,
          acceptedBy(variant, option) ? 1 : 0,
          acceptedBy(variant, option)
            ? `${variant} accepts ${option}: one section should carry its badge`
            : `${variant} rejects ${option}: no section should carry its badge`,
        );
      }
    });

  test('every option a variant accepts has a section', () => {
    assert.deepEqual(
      options.filter((option) => !documented.has(option)),
      [],
    );
  });
});
