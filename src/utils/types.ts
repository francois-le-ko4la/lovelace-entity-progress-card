/*
 * Shared "phantom brand" types: zero-shape markers that make TypeScript
 * reject the wrong any-shaped value in a slot expecting a specific one
 * (argument-order swaps, wrong-bag mixups), without forcing a full interface
 * onto a genuinely dynamic runtime shape. Same pattern as `EntityState` in
 * hass-provider.ts (whose per-domain `attributes` genuinely vary too much to
 * model), for the editor's own two adjacent `any` bags. Config itself isn't
 * dynamic anymore (see its own comment below) - derived from schema.ts.
 */

import type { Infer, YamlSchemaFactory } from '../card/schema.js';

declare const lovelaceConfigBrand: unique symbol;
// The config exactly as Lovelace hands it over - setConfig()'s own argument,
// before YamlSchemaFactory validation: may still hold deprecated shapes, and
// in the editor is merged with `_`-prefixed ephemeral UI state that never
// gets sent back to HA. Distinct from `Config` below so the two pipeline
// stages can't be swapped positionally.
// skipcq: JS-0323 -- deliberate dynamic config bag (see above)
type LovelaceConfig = { readonly [lovelaceConfigBrand]: true } & Record<string, any>;

declare const configBrand: unique symbol;
// The negotiated/resolved config: LovelaceConfig after schema validation,
// default-filling, and legacy-shape migration - what ViewCore/HACore read
// everywhere. Derived from YamlSchemaFactory (schema.ts's Infer<>) instead
// of hand-maintained. The one deliberate exception to utils/ never importing
// from card/: the import is type-only, erased at compile time.
//
// A *union* of the five card-type shapes (tried first) doesn't work: shared
// code reads fields only some types declare, and TS only lets you read a
// union property when every member has it. Intersecting the five instead
// (all optional via Partial) matches the real runtime pattern: shared code
// reads whatever field it wants and lets `undefined` flow through safely.
type Config = { readonly [configBrand]: true } & Partial<
  Infer<typeof YamlSchemaFactory.card> &
    Infer<typeof YamlSchemaFactory.badge> &
    Infer<typeof YamlSchemaFactory.template> &
    Infer<typeof YamlSchemaFactory.badgeTemplate> &
    Infer<typeof YamlSchemaFactory.feature>
>;

declare const fieldDefBrand: unique symbol;
// An editor field definition (EditorFactory's field-tree nodes) - distinct
// from Config/LovelaceConfig so none of the three can be swapped positionally,
// e.g. in EditorDOMHelper#_updateField(name, def, config, ...).
// skipcq: JS-0323 -- deliberate dynamic field-definition bag (see above)
type FieldDef = { readonly [fieldDefBrand]: true } & Record<string, any>;

export type { LovelaceConfig, Config, FieldDef };
