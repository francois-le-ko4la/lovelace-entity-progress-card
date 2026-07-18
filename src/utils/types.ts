/*
 * Shared "phantom brand" types: zero-shape markers that make TypeScript
 * reject the wrong any-shaped value in a slot expecting a specific one
 * (argument-order swaps, wrong-bag mixups), without forcing a full interface
 * onto a genuinely dynamic runtime shape. Same pattern as `Hass`/
 * `EntityState` in hass-provider.ts, for the editor's own two adjacent `any`
 * bags.
 */

declare const rawConfigBrand: unique symbol;
// The config as received from setConfig()/config-changed, before
// YamlSchemaFactory validation: may still hold deprecated/legacy shapes
// (a bare max_value string, disable_unit...), and in the editor is merged
// with `_`-prefixed ephemeral UI state (EditorBase#config). Distinct from
// `Config` (below) so the two pipeline stages can't be swapped positionally -
// see EditorDOMHelper#_updateField's `config` (raw) vs `negotiated` (Config).
type RawConfig = { readonly [rawConfigBrand]: true } & Record<string, any>;

declare const configBrand: unique symbol;
// The negotiated/resolved config: RawConfig after schema validation,
// default-filling, and legacy-shape migration - BaseConfigHelper.config,
// and what ViewCore/HACore read everywhere else. Genuinely dynamic per card
// type, kept as Record<string, any>.
type Config = { readonly [configBrand]: true } & Record<string, any>;

declare const fieldDefBrand: unique symbol;
// An editor field definition (EditorFactory's field-tree nodes) - distinct
// from Config/RawConfig so none of the three can be swapped positionally,
// e.g. in EditorDOMHelper#_updateField(name, def, config, ...).
type FieldDef = { readonly [fieldDefBrand]: true } & Record<string, any>;

export type { RawConfig, Config, FieldDef };
