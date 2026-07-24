/*
 * Shared "phantom brand" types: zero-shape markers that make TypeScript
 * reject the wrong any-shaped value in a slot expecting a specific one
 * (argument-order swaps, wrong-bag mixups), without forcing a full interface
 * onto a genuinely dynamic runtime shape. Same pattern as `EntityState` in
 * hass-provider.ts (whose per-domain `attributes` genuinely vary too much to
 * model), for the editor's own two adjacent `any` bags.
 */

declare const lovelaceConfigBrand: unique symbol;
// The config exactly as Lovelace itself hands it over - setConfig()'s own
// argument (matching custom-card-helpers' LovelaceCardConfig), before
// YamlSchemaFactory validation: may still hold deprecated/legacy shapes (a
// bare max_value string, disable_unit...), and in the editor is merged with
// `_`-prefixed ephemeral UI state (EditorBase#config) that never gets sent
// back to HA. Distinct from `Config` (below) so the two pipeline stages
// can't be swapped positionally - see EditorDOMHelper#_updateField's
// `config` (this one) vs `negotiated` (Config).
type LovelaceConfig = { readonly [lovelaceConfigBrand]: true } & Record<string, any>;

declare const configBrand: unique symbol;
// The negotiated/resolved config: LovelaceConfig after schema validation,
// default-filling, and legacy-shape migration - BaseConfigHelper.config, and
// what ViewCore/HACore read everywhere else. Not just "LovelaceConfig with
// defaults filled in" either - BaseConfigHelper.#resolveConfig layers on
// further derived fields with no LovelaceConfig equivalent at all (e.g.
// `centerZero`, computed from the raw `center_zero` value). Genuinely
// dynamic per card type, kept as Record<string, any>.
type Config = { readonly [configBrand]: true } & Record<string, any>;

declare const fieldDefBrand: unique symbol;
// An editor field definition (EditorFactory's field-tree nodes) - distinct
// from Config/LovelaceConfig so none of the three can be swapped positionally,
// e.g. in EditorDOMHelper#_updateField(name, def, config, ...).
type FieldDef = { readonly [fieldDefBrand]: true } & Record<string, any>;

export type { LovelaceConfig, Config, FieldDef };
