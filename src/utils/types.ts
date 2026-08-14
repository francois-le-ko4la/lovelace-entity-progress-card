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
// The config exactly as Lovelace itself hands it over - setConfig()'s own
// argument (matching custom-card-helpers' LovelaceCardConfig), before
// YamlSchemaFactory validation: may still hold deprecated/legacy shapes (a
// bare max_value string, disable_unit...), and in the editor is merged with
// `_`-prefixed ephemeral UI state (EditorBase#config) that never gets sent
// back to HA. Distinct from `Config` (below) so the two pipeline stages
// can't be swapped positionally - see EditorDOMHelper#_updateField's
// `config` (this one) vs `negotiated` (Config).
// skipcq: JS-0323 -- deliberate dynamic config bag (see above)
type LovelaceConfig = { readonly [lovelaceConfigBrand]: true } & Record<string, any>;

declare const configBrand: unique symbol;
// The negotiated/resolved config: LovelaceConfig after schema validation,
// default-filling, and legacy-shape migration - BaseConfigHelper.config, and
// what ViewCore/HACore read everywhere else. Derived straight from
// YamlSchemaFactory (schema.ts's Infer<>) instead of hand-maintained as a
// separate blob. This is the one deliberate exception to utils/ never
// importing from card/: the import is type-only (erased at compile time,
// zero runtime/bundle cost), and Config's own source of truth genuinely
// lives in schema.ts now.
//
// A *union* of the five card-type shapes (the first thing tried) doesn't
// work here: HACore#_addBaseClasses and friends are shared by all five
// concrete types and read fields only some of them actually declare (e.g.
// `layout`, deleted from badge's own schema) - TypeScript only lets you
// read a property off a union when every member has it. Intersecting the
// five instead (every field from every schema, all optional via Partial)
// matches the real runtime pattern: shared code reads whatever field it
// wants and lets `undefined` flow through comparisons/optional chains
// safely, the same way plain JS always did before this was typed at all.
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
