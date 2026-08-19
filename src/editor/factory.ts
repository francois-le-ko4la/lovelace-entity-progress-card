/*
 * EditorFactory: builds the field-definition tree
 * (general/content/theme/interactions sections) that EditorBase renders, per
 * card type (card/badge/template/badgeTemplate).
 */

import {
  CARD,
  HA_CONTEXT,
  MIN_VALUE_ENTITY_PATH,
  MAX_VALUE_ENTITY_PATH,
  WATERMARK_LOW_ENTITY_PATH,
  WATERMARK_HIGH_ENTITY_PATH,
  ALERT_ABOVE_ENTITY_PATH,
  ALERT_BELOW_ENTITY_PATH,
} from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import type { LovelaceConfig, Config } from '../utils/types.js';
import { availableSpace } from './dom-helper.js';
import { parseLength, serializeLength, convertLengthValue } from '../utils/length.js';

// Field definitions are heterogeneous option bags (showIf/resolveVirtual/
// onVirtualChange/width/target/... vary per field) - kept as `Record<string,
// any>` rather than one interface trying to cover every combination
// EditorBase/EditorDOMHelper actually consume.
const field =
  (type: string) =>
  (name: string, o: Record<string, unknown> = {}) => ({ name, type, ...o });

const EditorFieldsType = {
  entity: field('entity'),
  entityName: field('entity_name'),
  stateContent: field('state_content'),
  text: field('text'),
  number: field('number'),
  slider: field('slider'),
  decimal: field('decimal'),
  toggle: field('toggle'),
  tpl: field('template'),
  action: field('action'),
  select: (name: string, o: Record<string, unknown> = {}) => ({ name, type: name, ...o }),
  templateOrType: (name: string, template: boolean, type: string, o: Record<string, unknown> = {}) =>
    field(template ? 'template' : type)(name, o),
  sectionLabel: field('section_label'),
};

// Shared by min_value/max_value below: both share the exact same explicit
// shape (number (legacy) | { entity, attribute } | { jinja }, see schema.ts
// and config-helpers.js's checkValueConfig) and, unlike watermark.low/high
// (see wmSide below), sit at the top level of the config - one dot-path deep
// at most - so entity/attribute/jinja can stay plain dot-path fields instead
// of virtual ones.
const valueField = (
  key: 'min_value' | 'max_value',
  entityPath: string,
  numberOverrides: Record<string, unknown> = {},
) => {
  const modeType = `${key}_mode`;
  const attrType = `${key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}Attribute`;
  // Ephemeral (see _theme_draft's own precedent) - each holds whatever the
  // OTHER mode last looked like, so switching e.g. jinja -> standard ->
  // jinja again restores the typed template instead of starting blank.
  // Stripped before dispatch, never saved to YAML (any `_`-prefixed key is).
  const numberDraftKey = `_${key}_number_draft`;
  const entityDraftKey = `_${key}_entity_draft`;
  const jinjaDraftKey = `_${key}_jinja_draft`;
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      resolveVirtual: (c: LovelaceConfig) =>
        is.nonEmptyString(c[key]?.jinja) ? 'jinja' : is.plainObject(c[key]) ? 'entity' : 'standard',
      onVirtualChange: (mode: 'entity' | 'jinja' | 'standard', config: LovelaceConfig) => {
        const current = config[key];
        // Whatever `current` already is gets stashed into its own draft
        // slot before switching away - the mode not being entered keeps (or
        // refreshes) its draft, the one being entered consumes its own.
        const numberDraft = is.number(current) ? current : config[numberDraftKey];
        const entityDraft =
          is.plainObject(current) && !is.nonEmptyString(current?.jinja) ? current : config[entityDraftKey];
        const jinjaDraft =
          is.plainObject(current) && is.nonEmptyString(current?.jinja) ? current.jinja : config[jinjaDraftKey];
        if (mode === 'entity') {
          return {
            ...config,
            [key]: entityDraft ?? { entity: '' },
            [numberDraftKey]: numberDraft,
            [entityDraftKey]: undefined,
            [jinjaDraftKey]: jinjaDraft,
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            [key]: jinjaDraft ? { jinja: jinjaDraft } : { jinja: '{{ }}' },
            [numberDraftKey]: numberDraft,
            [jinjaDraftKey]: undefined,
            [entityDraftKey]: entityDraft,
          };
        }
        return {
          ...config,
          [key]: numberDraft,
          [numberDraftKey]: undefined,
          [entityDraftKey]: entityDraft,
          [jinjaDraftKey]: jinjaDraft,
        };
      },
    },
    [key]: EditorFieldsType.number(key, { showIf: (c: LovelaceConfig) => !is.plainObject(c[key]), ...numberOverrides }),
    [entityPath]: EditorFieldsType.entity(entityPath, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => is.plainObject(c[key]) && !is.nonEmptyString(c[key].jinja),
    }),
    [`${key}.attribute`]: EditorFieldsType.select(`${key}.attribute`, {
      type: attrType,
      selectorOf: entityPath,
      labelKey: ['value_shape', 'attribute'],
      showIf: (c: LovelaceConfig) => is.plainObject(c[key]) && is.nonEmptyString(c[key].entity),
    }),
    [`${key}.jinja`]: EditorFieldsType.tpl(`${key}.jinja`, {
      noLabel: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => is.nonEmptyString(c[key]?.jinja),
    }),
  };
};

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

// Shared by watermark.low/high (wmSide) and alert_when.above/below
// (alertField): both are number | { entity, attribute } | { jinja } (see
// schema.ts's numericEntityOrJinja) nested one level under a parent object,
// so entity/attribute/jinja stay virtual fields - the generic nested-field
// machinery only resolves one level of dot-path, and these are already one
// level deep. `isEnabled` folds in the parent's own "on" condition
// (watermark's disable_low/high toggle; alert_when has none). `defaultVal`
// is what 'standard' mode reverts to: a real number for watermark,
// undefined for alert_when.
const nestedValueField = (
  parentKey: string,
  key: string,
  entityPath: string,
  isEnabled: (c: LovelaceConfig) => boolean,
  defaultVal?: number,
) => {
  const modeType = `${parentKey}_${key}_mode`;
  const attrType = `${toCamel(parentKey)}${key.charAt(0).toUpperCase() + key.slice(1)}Attribute`;
  const entityFieldName = `${parentKey}.${key}_entity`;
  const ent = (c: LovelaceConfig) => is.plainObject(c[parentKey]?.[key]) && !is.nonEmptyString(c[parentKey][key].jinja);
  const tpl = (c: LovelaceConfig) => is.nonEmptyString(c[parentKey]?.[key]?.jinja);
  // Same draft precedent as valueField above (min_value/max_value) - flat
  // top-level keys even though the real value lives nested, since drafts are
  // pure ephemeral UI state anyway, never round-tripped as `parentKey.key`.
  const numberDraftKey = `_${parentKey}_${key}_number_draft`;
  const entityDraftKey = `_${parentKey}_${key}_entity_draft`;
  const jinjaDraftKey = `_${parentKey}_${key}_jinja_draft`;
  return {
    // A 2-state toggle can't represent 3 mutually exclusive modes
    // (standard/entity/Jinja) — mirrors min_value_mode/max_value_mode exactly,
    // replacing the previous entity-only toggle.
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      showIf: isEnabled,
      resolveVirtual: (c: LovelaceConfig) => (tpl(c) ? 'jinja' : ent(c) ? 'entity' : 'standard'),
      onVirtualChange: (mode: 'entity' | 'jinja' | 'standard', config: LovelaceConfig) => {
        const current = config[parentKey]?.[key];
        const numberDraft = is.number(current) ? current : config[numberDraftKey];
        const entityDraft =
          is.plainObject(current) && !is.nonEmptyString(current?.jinja) ? current : config[entityDraftKey];
        const jinjaDraft =
          is.plainObject(current) && is.nonEmptyString(current?.jinja) ? current.jinja : config[jinjaDraftKey];
        if (mode === 'entity') {
          return {
            ...config,
            [parentKey]: { ...config[parentKey], [key]: entityDraft ?? { entity: '' } },
            [numberDraftKey]: numberDraft,
            [entityDraftKey]: undefined,
            [jinjaDraftKey]: jinjaDraft,
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            [parentKey]: { ...config[parentKey], [key]: jinjaDraft ? { jinja: jinjaDraft } : { jinja: '{{ }}' } },
            [numberDraftKey]: numberDraft,
            [jinjaDraftKey]: undefined,
            [entityDraftKey]: entityDraft,
          };
        }
        return {
          ...config,
          [parentKey]: { ...config[parentKey], [key]: numberDraft ?? defaultVal },
          [numberDraftKey]: undefined,
          [entityDraftKey]: entityDraft,
          [jinjaDraftKey]: jinjaDraft,
        };
      },
    },
    [`${parentKey}.${key}`]: EditorFieldsType.number(`${parentKey}.${key}`, {
      showIf: (c: LovelaceConfig) => isEnabled(c) && !is.plainObject(c[parentKey]?.[key]),
    }),
    [entityFieldName]: EditorFieldsType.entity(entityFieldName, {
      virtual: true,
      noLabel: true,
      showIf: (c: LovelaceConfig) => isEnabled(c) && ent(c),
      resolveVirtual: (c: LovelaceConfig) => c[parentKey]?.[key]?.entity ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: {
          ...config[parentKey],
          [key]: value ? { ...config[parentKey]?.[key], entity: value } : defaultVal,
        },
      }),
    }),
    [`${parentKey}.${key}_attribute`]: EditorFieldsType.select(`${parentKey}.${key}_attribute`, {
      type: attrType,
      virtual: true,
      selectorOf: entityPath,
      labelKey: ['value_shape', 'attribute'],
      showIf: (c: LovelaceConfig) => isEnabled(c) && ent(c) && is.nonEmptyString(c[parentKey][key]?.entity),
      resolveVirtual: (c: LovelaceConfig) => c[parentKey]?.[key]?.attribute ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: { ...config[parentKey]?.[key], attribute: value || undefined } },
      }),
    }),
    // Virtual (not a plain dot-path field): the template string lives 2 levels
    // deep (<parentKey>.<key>.jinja), one level past what the generic
    // nested-field machinery (#resolveValue/#handleNestedField) resolves — this
    // reads/writes that path directly.
    [`${parentKey}_${key}_jinja`]: EditorFieldsType.tpl(`${parentKey}_${key}_jinja`, {
      noLabel: true,
      virtual: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => isEnabled(c) && tpl(c),
      resolveVirtual: (c: LovelaceConfig) => c[parentKey]?.[key]?.jinja ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: { jinja: value } },
      }),
    }),
  };
};

const wmSide = (side: 'low' | 'high', defaultVal: number) => {
  const disableKey = `disable_${side}`;
  const entityPath = side === 'low' ? WATERMARK_LOW_ENTITY_PATH : WATERMARK_HIGH_ENTITY_PATH;
  const isEnabled = (c: LovelaceConfig) => Boolean(c.watermark) && !c.watermark?.[disableKey];
  return {
    [`watermark.${disableKey}`]: EditorFieldsType.toggle(`watermark.${disableKey}`, {
      showIf: (c: LovelaceConfig) => Boolean(c.watermark),
    }),
    ...nestedValueField('watermark', side, entityPath, isEnabled, defaultVal),
    [`watermark.${side}_as`]: EditorFieldsType.select(`watermark.${side}_as`, {
      type: 'watermark_as',
      showIf: isEnabled,
      width: availableSpace(),
    }),
    [`watermark.${side}_color`]: EditorFieldsType.templateOrType(`watermark.${side}_color`, false, 'color', {
      showIf: isEnabled,
      width: availableSpace(),
    }),
  };
};

// alert_when.above/.below - same explicit shape as min_value/max_value/
// watermark.low/high, via the shared nestedValueField above. Unlike
// watermark there's no per-side disable toggle or _as/_color options - just
// the value itself - and no numeric default to fall back to (alert_when.
// above/below are genuinely optional).
// Simple mode only - Advanced mode (alert_when.jinja) replaces above/below
// as the trigger entirely, see alertModeField below.
const isAlertSimple = (c: LovelaceConfig) => Boolean(c.alert_when) && !is.nonEmptyString(c.alert_when?.jinja);

const alertField = (side: 'above' | 'below') => {
  const entityPath = side === 'above' ? ALERT_ABOVE_ENTITY_PATH : ALERT_BELOW_ENTITY_PATH;
  return nestedValueField('alert_when', side, entityPath, isAlertSimple);
};

// Shared master on/off toggle - same draft precedent as status_label_toggle.
const alertToggleField = () => ({
  alert_toggle: EditorFieldsType.toggle('alert_toggle', {
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => Boolean(c.alert_when),
    onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
      ...config,
      alert_when: value ? config._alert_when_draft || {} : undefined,
      _alert_when_draft: value ? undefined : (config.alert_when ?? config._alert_when_draft),
    }),
  }),
});

// Simple (above/below) vs Advanced (alert_when.jinja) - unlike valueField's
// standard/entity/jinja triad, this swaps which *fields* are shown rather
// than one field's own representation, so above/below/jinja each keep their
// own draft slot restored on the way back into their mode.
const alertModeField = () => {
  const aboveDraftKey = '_alert_when_above_draft';
  const belowDraftKey = '_alert_when_below_draft';
  const jinjaDraftKey = '_alert_when_jinja_draft';
  return {
    trigger: {
      name: 'trigger',
      type: 'trigger',
      virtual: true,
      showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
      resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c.alert_when?.jinja) ? 'advanced' : 'simple'),
      onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
        const alert = config.alert_when ?? {};
        const aboveDraft = alert.above !== undefined ? alert.above : config[aboveDraftKey];
        const belowDraft = alert.below !== undefined ? alert.below : config[belowDraftKey];
        const jinjaDraft = is.nonEmptyString(alert.jinja) ? alert.jinja : config[jinjaDraftKey];
        return {
          ...config,
          alert_when:
            mode === 'advanced'
              ? { ...alert, above: undefined, below: undefined, jinja: jinjaDraft || '{{ }}' }
              : { ...alert, above: aboveDraft, below: belowDraft, jinja: undefined },
          [aboveDraftKey]: mode === 'advanced' ? aboveDraft : undefined,
          [belowDraftKey]: mode === 'advanced' ? belowDraft : undefined,
          [jinjaDraftKey]: mode === 'advanced' ? undefined : jinjaDraft,
        };
      },
    },
  };
};

const EditorFactory = {
  general: (template: boolean) => ({
    flat: true,
    fields: {
      entity: EditorFieldsType.entity('entity', { required: !template }),
      // Off by default: a now()/utcnow()-driven Jinja field already gets a
      // free once-a-minute refresh from HA's own render_template push
      // (issue #127) - this opts into a forced resubscribe every second
      // instead, for a real ticking countdown. Not tied to `entity` being a
      // timer. See schema.ts's fast_refresh.
      ...(template && {
        fast_refresh: EditorFieldsType.toggle('fast_refresh', {
          showIf: (c: LovelaceConfig) => Boolean(c.entity),
        }),
      }),
      ...(!template && {
        attribute: EditorFieldsType.select('attribute', {
          type: 'attribute',
          selectorOf: 'entity',
          showIf: (c: LovelaceConfig) => Boolean(c.entity),
        }),
        bar_stack_mode: {
          name: 'bar_stack_mode',
          type: 'bar_stack_mode',
          virtual: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyArray(c.bar_stack?.entities),
          resolveVirtual: (c: LovelaceConfig) => c.bar_stack?.mode ?? 'stacked',
          onVirtualChange: (mode: 'stacked' | 'proportional' | 'net', config: LovelaceConfig) => ({
            ...config,
            bar_stack: { ...config.bar_stack, mode },
          }),
        },
        // CF5 - issue (major) resolved - a flat 'bar_stack' field name meant
        // the generic round-trip resolver (#resolveValue, run on every
        // setConfig - not just this field's own onChange) read config.bar_stack
        // as a whole (the {mode, entities} object, not the array the row
        // editor's `value` setter expects) and reset it to [] on every single
        // re-render, making any just-added row vanish from the editor
        // immediately. The dot-path name routes through the existing generic
        // nested-field read/write (#resolveValue / #handleNestedField) instead,
        // exactly like watermark.low or min_value.attribute - entities are read
        // from and written to bar_stack.entities directly, and bar_stack.mode
        // is left untouched by construction (no custom onChange/onClear needed
        // to preserve it).
        'bar_stack.entities': {
          name: 'bar_stack.entities',
          type: 'bar_stack_editor',
        },
      }),
    },
  }),

  content: (template: boolean, badge: boolean) => ({
    title: 'editor.title.content',
    icon: HA_CONTEXT.icons.textShort,
    fields: {
      ...(template
        ? {
            name: EditorFieldsType.tpl('name'),
          }
        : {
            name: EditorFieldsType.entityName('name', { context: { entity: 'entity' } }),
            name_info: EditorFieldsType.tpl('name_info', {
              helper: true,
            }),
          }),
      ...(template
        ? {
            secondary: EditorFieldsType.tpl('secondary'),
            // Badge/badgeTemplate opt out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there. density: compact clears it too (see
            // schema.ts's applyDensityRule).
            ...(!badge
              ? {
                  multiline: EditorFieldsType.toggle('multiline', {
                    showIf: (c: LovelaceConfig) => c.density !== 'compact',
                  }),
                }
              : {}),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            // Two half-half rows; unitSpacingShown widens unit/decimal to
            // fill the row once unit_spacing/unit_position hide (hidden unit).
            ...(() => {
              const unitSpacingShown = (c: LovelaceConfig) =>
                !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit')));
              const halfOrFull = (c: LovelaceConfig) =>
                unitSpacingShown(c) ? availableSpace(32, 1 / 2) : availableSpace();
              return {
                unit: EditorFieldsType.text('unit', {
                  width: halfOrFull,
                  placeholder: (_c: LovelaceConfig, neg: Config) => (neg?.resolvedUnit as string) ?? '',
                }),
                unit_position: EditorFieldsType.select('unit_position', {
                  type: 'unit_position',
                  labelKey: 'position',
                  width: availableSpace(32, 1 / 2),
                  showIf: unitSpacingShown,
                }),
                // disable_unit is deprecated (see
                // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
                // another hide target, folded into hide by _customizeConfig.
                // The disable_unit check here only matters for a legacy raw
                // config on first load, before that fold has round-tripped
                // through the editor's own config-changed.
                unit_spacing: EditorFieldsType.select('unit_spacing', {
                  type: 'unit_spacing',
                  width: availableSpace(32, 1 / 2),
                  showIf: unitSpacingShown,
                }),
                decimal: EditorFieldsType.decimal('decimal', {
                  width: halfOrFull,
                  placeholder: (_c: LovelaceConfig, neg: Config) =>
                    neg?.resolvedDecimal == null ? '' : String(neg.resolvedDecimal),
                }),
              };
            })(),
            value_compact: EditorFieldsType.toggle('value_compact'),
            value_sign: EditorFieldsType.toggle('value_sign'),
            // A 2-state toggle can't represent 3 mutually exclusive modes
            // (standard/entity/Jinja) - a single-select chip group replaces
            // the previous pair of toggles, which could both show at once.
            // min_value/max_value's shape is explicit too: a bare number is
            // the fixed value, { entity, attribute }/{ jinja } replace what
            // used to be sniffed at runtime via is.jinja().
            ...valueField('min_value', MIN_VALUE_ENTITY_PATH, {
              default: (c: LovelaceConfig) => (c.center_zero ? -100 : 0),
            }),
            ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info', {
              helper: true,
            }),
            // Badge opts out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there. density: compact clears it too (see
            // schema.ts's applyDensityRule).
            ...(!badge
              ? {
                  multiline: EditorFieldsType.toggle('multiline', {
                    showIf: (c: LovelaceConfig) => c.density !== 'compact',
                  }),
                }
              : {}),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c: LovelaceConfig) =>
                Boolean(c.entity) && HassProviderSingleton.getEntityDomain(c.entity) === 'timer',
            }),
          }),
    },
  }),

  // A theme is either a preset (dropdown, existing behavior) or a custom set of
  // color zones — ThemeManager.configure() always lets a valid custom_theme win
  // over theme when both happen to be set, so the editor makes that an explicit
  // either/or via mode chips rather than letting the two silently race. Pulled
  // out of theme() itself so that factory's own cognitive complexity doesn't
  // grow with this trio's own ternaries. CF5 - issue (major) resolved -
  // switching modes used to hard-clear the field being left behind (theme when
  // entering custom, custom_theme when leaving it), destroying a
  // carefully-built zone list the moment someone peeked at a preset and came
  // back. The inactive side is now parked in a `_`-prefixed draft (same
  // ephemeral mechanism as _visible_actions) and restored when re-selected.
  themeModeFields: (template: boolean) =>
    template
      ? // Template has no custom_theme (no min_value/max_value to project real-value
        // zones onto) - just the plain select, restricted to percent: true
        // themes (see schema.ts's own theme field and base.ts's
        // theme_percent_only selector).
        {
          theme: {
            name: 'theme',
            type: 'theme_percent_only',
            // Without onClear, #handleStdField writes theme: '' instead of
            // deleting the key - every is.nullish(c.theme) check downstream
            // then reads '' as "a theme IS set", stuck permanently since ''
            // persists across reloads. bar_color_mode goes with it, or the
            // stale value would linger in the saved config.
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.theme;
              delete rest.bar_color_mode;
              return rest;
            },
          },
        }
      : {
          theme_mode: {
            name: 'theme_mode',
            type: 'theme_mode',
            labelKey: 'theme',
            virtual: true,
            // is.array (not is.nonEmptyArray): a freshly-entered custom mode
            // starts as an empty [] before the user adds a first zone, and must
            // still read as 'custom'.
            resolveVirtual: (c: LovelaceConfig) => (is.array(c.custom_theme) ? 'custom' : 'preset'),
            onVirtualChange: (mode: 'custom' | 'preset', config: LovelaceConfig) => {
              const wantsCustom = mode === 'custom';
              const nextTheme = wantsCustom ? undefined : (config._theme_draft ?? config.theme);
              // Switching to custom is always "a theme is active" (even an
              // empty just-entered [] counts, see themeActive/resolveVirtual
              // above) - switching to preset only still is if the restored
              // draft actually held a real theme. Neither `theme` nor
              // `custom_theme`'s own onClear runs on this path (both are
              // rewritten inline here, not cleared), so bar_color_mode/
              // interpolate need the same cleanup spelled out again.
              const stillActive = wantsCustom || !is.nullish(nextTheme);
              return {
                ...config,
                theme: nextTheme,
                _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
                custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
                _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
                ...(stillActive ? {} : { bar_color_mode: undefined, interpolate: undefined }),
              };
            },
          },
          theme: EditorFieldsType.select('theme', {
            showIf: (c: LovelaceConfig) => !is.array(c.custom_theme),
            // See the template branch's own onClear above for why this
            // matters: without it, clearing the dropdown writes theme: ''
            // instead of deleting the key, which reads as "a theme IS set"
            // everywhere else that checks is.nullish(c.theme). Removing a
            // theme takes bar_color_mode/interpolate down with it too - both
            // are meaningless without one, and would otherwise linger unseen
            // in the saved config (their own showIf already hides them).
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.theme;
              delete rest.bar_color_mode;
              delete rest.interpolate;
              return rest;
            },
          }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c: LovelaceConfig) => is.array(c.custom_theme),
            // Same reasoning as theme's own onClear right above - a custom
            // theme counts as "a theme is active" too, so losing it should
            // clear bar_color_mode/interpolate the same way.
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.custom_theme;
              delete rest.bar_color_mode;
              delete rest.interpolate;
              return rest;
            },
          },
        },

  // Badge/BadgeTemplate schemas reject some enum members that only make
  // sense with a `layout`/`bar_position` a badge doesn't have (see
  // YamlSchemaFactory.badge) - swaps in the matching restricted select type
  // instead of a range check inline in theme() below.
  badgeRestrictedType: (badge: boolean, restrictedType: string) => (badge ? { type: restrictedType } : {}),

  // A CSS-length option (e.g. min_width) edited as a number+unit composite: a
  // slider (value) + a unit dropdown, both virtual over the single string
  // config key. A value that isn't a plain number+unit (calc(), auto…) falls
  // back to a raw text field. See utils/length.ts. Config stays a string, so
  // the schema is unchanged. `badge` narrows the unit list (px/% only) and
  // enables the px<->% conversion (its % is redefined, see core.ts / #124).
  lengthField: (
    key: string,
    opts: {
      units: string[];
      convertRef?: number;
      showIf?: (c: LovelaceConfig) => boolean;
      noLabel?: boolean;
      customToggle?: boolean;
    },
  ) => {
    const { units, convertRef, showIf, noLabel = false, customToggle = false } = opts;
    const parsed = (c: LovelaceConfig) => parseLength(c[key]);
    const gate = (c: LovelaceConfig) => (showIf ? showIf(c) : true);
    // The toggle only ever writes the literal 'auto' (see below) - a custom
    // value that came from elsewhere (YAML calc(), an unknown unit…) still
    // falls back to the raw text field below.
    const isAutoToggled = (c: LovelaceConfig) => customToggle && c[key] === 'auto';
    const hasUnit = units.length > 1; // a single unit (e.g. px) needs no dropdown
    const fields: Record<string, unknown> = {};
    if (customToggle) {
      // Lets the user reach 'auto' from the slider UI - without this, custom
      // mode (see length.ts) can only be entered by already having a
      // non-number+unit value in the config (e.g. set through YAML), never
      // discoverable from the visual editor alone.
      fields[`${key}_custom_toggle`] = {
        name: `${key}_custom_toggle`,
        target: key,
        type: 'toggle',
        virtual: true,
        showIf: gate,
        resolveVirtual: (c: LovelaceConfig) => parsed(c).custom,
        onVirtualChange: (value: boolean, config: LovelaceConfig) =>
          value ? { ...config, [key]: 'auto' } : { ...config, [key]: undefined },
      };
    }
    fields[key] = {
      name: key,
      type: () => `length:${key}`,
      virtual: true,
      noLabel,
      width: hasUnit ? 'calc(100% - 106px)' : '100%', // leave room for the 90px unit select + gap
      showIf: (c: LovelaceConfig) => !parsed(c).custom && gate(c),
      resolveVirtual: (c: LovelaceConfig) => {
        const parsedLength = parsed(c);
        return parsedLength.custom ? 0 : parsedLength.value;
      },
      onVirtualChange: (value: number, config: LovelaceConfig) => {
        const parsedLength = parseLength(config[key]);
        const unit = parsedLength.custom ? units[0] : parsedLength.unit;
        return { ...config, [key]: serializeLength(value, unit) };
      },
    };
    fields[`${key}_custom`] = {
      name: `${key}_custom`,
      target: key,
      type: 'text',
      virtual: true,
      noLabel,
      showIf: (c: LovelaceConfig) => parsed(c).custom && !isAutoToggled(c) && gate(c),
      resolveVirtual: (c: LovelaceConfig) => (typeof c[key] === 'string' ? c[key] : ''),
      onVirtualChange: (value: string, config: LovelaceConfig) => ({ ...config, [key]: value || undefined }),
    };
    if (hasUnit) {
      fields[`${key}_unit`] = {
        name: `${key}_unit`,
        target: key,
        type: () => `lengthUnit:${units.join(',')}`,
        virtual: true,
        noLabel: true,
        required: true,
        isInGroup: 'length-unit', // CSS aligns it with the (labelled) slider row
        width: '90px',
        showIf: (c: LovelaceConfig) => !parsed(c).custom && gate(c),
        resolveVirtual: (c: LovelaceConfig) => {
          const parsedLength = parsed(c);
          return parsedLength.custom ? units[0] : parsedLength.unit;
        },
        onVirtualChange: (rawUnit: string, config: LovelaceConfig) => {
          const parsedLength = parseLength(config[key]);
          if (parsedLength.custom) return config;
          const unit = rawUnit || units[0]; // clearing the dropdown falls back to the first unit
          const value = convertLengthValue(parsedLength.value, parsedLength.unit, unit, convertRef);
          return { ...config, [key]: serializeLength(value, unit) };
        },
      };
    }
    return fields;
  },

  // Every themeXxxFields() below is pulled out of theme() itself for the same
  // reason as themeModeFields above: keep each conditional block's own
  // ternaries out of theme()'s cognitive complexity budget.

  themeColorModeFields: (template: boolean) =>
    template
      ? {
          // No interpolate here (Template has no such field - schema.ts's
          // own template schema never declared one, unlike Card/Feature) -
          // ViewCore.templateThemeGradient/-DivergingGradient don't support
          // it either. custom_theme doesn't exist on Template (see theme()'s
          // own comment above), so showIf only ever checks c.theme.
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            showIf: (c: LovelaceConfig) => !is.nullish(c.theme),
          }),
        }
      : {
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            // center_zero no longer excludes this - see
            // ViewBase.themeDivergingGradient.
            showIf: (c: LovelaceConfig) => !is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme),
            width: '100%',
            // Selecting a non-auto color mode is incompatible with
            // interpolate: clear it.
            onChange: (value: string | undefined, config: LovelaceConfig) =>
              value && value !== 'auto' ? { ...config, interpolate: undefined } : config,
          }),
          interpolate: EditorFieldsType.toggle('interpolate', {
            showIf: (c: LovelaceConfig) =>
              (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) &&
              (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
            width: '100%',
          }),
        },

  themeCardOnlyFields: (
    template: boolean,
    badge: boolean,
    resetUpIfInvalid: (config: LovelaceConfig) => LovelaceConfig,
  ) =>
    badge
      ? {}
      : {
          // Half-width once a theme is active, to pair with `icon` once
          // `color` hides - same reasoning as bar_size's width function
          // below. Full-width on Template regardless of theme: `icon` is
          // always a full-width Jinja textarea there, never a partner to
          // pair with. Virtual: icon_animation is an enum name |
          // { effect, jinja } (schema.ts's enumOrJinjaTrigger) - this select
          // reads/writes `effect` in both shapes.
          icon_animation: EditorFieldsType.select('icon_animation', {
            virtual: true,
            width: (c: LovelaceConfig) =>
              template || (is.nullish(c.theme) && !is.array(c.custom_theme)) ? '100%' : availableSpace(),
            resolveVirtual: (c: LovelaceConfig) =>
              is.plainObject(c.icon_animation) ? (c.icon_animation.effect ?? '') : (c.icon_animation ?? ''),
            onVirtualChange: (value: string, config: LovelaceConfig) =>
              is.plainObject(config.icon_animation)
                ? { ...config, icon_animation: { ...config.icon_animation, effect: value || undefined } }
                : { ...config, icon_animation: value || undefined },
          }),
          // Switches icon_animation between its plain enum form and { effect,
          // jinja }: on, the jinja condition below decides whether `effect`
          // plays, replacing the automatic entity-based detection
          // (isEntityActive/isWashingMachineActive/isBatteryCharging - see
          // HABase._iconAnimationStyle) once it resolves.
          icon_animation_mode: {
            name: 'icon_animation_mode',
            type: 'icon_animation_mode',
            target: 'icon_animation',
            labelKey: 'trigger',
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => (is.plainObject(c.icon_animation) ? 'template' : 'auto'),
            onVirtualChange: (mode: 'auto' | 'template', config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              const currentJinja = is.plainObject(current) ? current.jinja : undefined;
              return {
                ...config,
                icon_animation:
                  mode === 'template'
                    ? { effect, jinja: currentJinja || config._icon_animation_jinja_draft || '{{ }}' }
                    : effect || undefined,
                // Ephemeral - see valueField's own _<key>_jinja_draft
                // precedent.
                _icon_animation_jinja_draft:
                  mode === 'template' ? undefined : (currentJinja ?? config._icon_animation_jinja_draft),
              };
            },
          },
          icon_animation_jinja: EditorFieldsType.tpl('icon_animation_jinja', {
            target: 'icon_animation',
            virtual: true,
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => is.plainObject(c.icon_animation),
            resolveVirtual: (c: LovelaceConfig) =>
              is.plainObject(c.icon_animation) ? (c.icon_animation.jinja ?? '') : '',
            onVirtualChange: (value: string, config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              return { ...config, icon_animation: { effect, jinja: value || '' } };
            },
          }),
          force_circular_background_mode: {
            name: 'force_circular_background_mode',
            type: 'force_circular_background_mode',
            target: 'force_circular_background',
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => (c.force_circular_background ? 'forced' : 'auto'),
            onVirtualChange: (mode: 'auto' | 'forced', config: LovelaceConfig) => ({
              ...config,
              force_circular_background: mode === 'forced',
            }),
          },
          bar_group: EditorFieldsType.sectionLabel('bar_group'),
          bar_position: EditorFieldsType.select('bar_position', {
            // density: compact is the most restrictive case (top/bottom/
            // background only - see EditorFactory.applyDensityConstraints)
            // and wins outright when active. Otherwise: compact_below only
            // has a distinct effect with layout: horizontal (see
            // resetCompactBelowIfInvalid's own comment) - not offered at all
            // once layout: vertical, same reasoning as bar_orientation's 'up'
            // just above.
            type: (c: LovelaceConfig) =>
              c.density === 'compact'
                ? 'bar_position_density_compact'
                : c.layout === 'vertical'
                  ? 'bar_position_no_compact_below'
                  : 'bar_position',
            labelKey: 'position',
            width: availableSpace(),
            onChange: (_value: unknown, config: LovelaceConfig) => resetUpIfInvalid(config),
          }),
        },

  // Both are badge-only (deleted from the badge schema, see
  // YamlSchemaFactory.badge). bar_single_line only ever applies via .overlay
  // (postProcess forces it back to false for any other bar_position);
  // text_shadow also applies via .background - text sits on top of the bar
  // there too, same legibility need.
  themeSingleLineShadowFields: (badge: boolean) =>
    badge
      ? {}
      : {
          // bar_single_line only ever shows for 'overlay', where text_shadow
          // is always shown too (its own condition includes 'overlay') - so
          // it always has that row partner and can stay a flat half-width.
          // text_shadow itself also shows alone for 'background' (no
          // bar_single_line there), so its own width stays conditional.
          bar_single_line: EditorFieldsType.toggle('bar_single_line', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay',
            width: availableSpace(),
          }),
          text_shadow: EditorFieldsType.toggle('text_shadow', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay' || c.bar_position === 'background',
            width: (c: LovelaceConfig) => (c.bar_position === 'overlay' ? availableSpace() : '100%'),
          }),
        },

  // bar_max_width only affects .horizontal.small/.medium/.large - the other
  // bar_position values render through a separate container, and
  // .horizontal.xlarge has no matching rule either (schema.ts's postProcess
  // clears it server-side for the same reason, this is the editor mirror).
  // Badge/badgeTemplate opt out entirely: without a 'layout' key they never
  // get the 'horizontal' class, so the option would be inert there.
  themeMaxWidthFields: (badge: boolean) => {
    if (badge) return {};
    const barMaxWidthAllowed = (c: LovelaceConfig) =>
      (c.layout ?? 'horizontal') === 'horizontal' &&
      (c.bar_position ?? 'default') === 'default' &&
      (c.bar_size ?? 'small') !== 'xlarge';
    return {
      bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
        virtual: true,
        showIf: barMaxWidthAllowed,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_max_width),
        onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
          ...config,
          bar_max_width: value ? config._bar_max_width_draft || '300px' : undefined,
          _bar_max_width_draft: value ? undefined : (config.bar_max_width ?? config._bar_max_width_draft),
        }),
      }),
      // The toggle above carries the "Bar max width" label, so the slider is
      // noLabel. Same length component as min_width/height, locked to px (a
      // single unit needs no dropdown).
      ...EditorFactory.lengthField('bar_max_width', {
        units: ['px', '%'],
        noLabel: true,
        showIf: (c: LovelaceConfig) => barMaxWidthAllowed(c) && Boolean(c.bar_max_width),
      }),
    };
  },

  // Not gated on `template` - watermarkSchema is the exact same shape for
  // Card and Template (see YamlSchemaFactory.card/.template), and wmSide's
  // toggle/entity/jinja machinery only ever reads config.watermark.*, so
  // nothing here is Card-specific.
  themeWatermarkFields: () => {
    const wm = (extra?: (c: LovelaceConfig) => boolean) => (c: LovelaceConfig) =>
      Boolean(c.watermark) && (extra ? extra(c) : true);
    return {
      watermark_toggle: EditorFieldsType.toggle('watermark_toggle', {
        virtual: true,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.watermark),
        onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
          ...config,
          watermark: value ? config._watermark_draft || {} : undefined,
          _watermark_draft: value ? undefined : (config.watermark ?? config._watermark_draft),
        }),
      }),
      'watermark.type': EditorFieldsType.select('watermark.type', {
        type: 'watermark_type',
        showIf: wm(),
        width: availableSpace(),
      }),
      'watermark.opacity': EditorFieldsType.decimal('watermark.opacity', {
        type: 'opacity',
        showIf: wm(),
        width: availableSpace(),
      }),
      // ── Groupes LOW / HIGH (générés par wmSide) ────────────────────
      ...wmSide('low', 20),
      ...wmSide('high', 80),
      'watermark.line_size': EditorFieldsType.text('watermark.line_size', {
        showIf: wm((c: LovelaceConfig) => c.watermark?.type === 'line'),
      }),
    };
  },

  themeBadgeIconColorFields: (badge: boolean) =>
    badge
      ? {}
      : {
          // badge_icon/badge_color are two independent optional strings, not
          // one nested map - each gets its own collapse-to-reveal toggle
          // instead of one shared toggle forcing both together. "Badge"
          // counts as on whenever EITHER field has a value - existing YAML
          // with only badge_color set still needs an active "Badge" toggle
          // with badge_icon's field visible, empty, ready to fill in.
          // badge_color_toggle nests under it (same showIf condition): a
          // badge color with no badge at all isn't offered as a starting
          // point. Turning "Badge" off clears both fields (the master
          // switch); "Independent color" keeps owning badge_color while
          // "Badge" stays on.
          badge_toggle: EditorFieldsType.toggle('badge_toggle', {
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color),
            // Ephemeral drafts - see valueField's own _<key>_jinja_draft
            // precedent. badge_color_toggle below shares _badge_color_draft:
            // whichever path last cleared badge_color, the same slot
            // restores it.
            onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
              ...config,
              badge_icon: value ? config._badge_icon_draft || '{{ }}' : undefined,
              badge_color: value ? config._badge_color_draft : undefined,
              _badge_icon_draft: value ? undefined : (config.badge_icon ?? config._badge_icon_draft),
              _badge_color_draft: value ? undefined : (config.badge_color ?? config._badge_color_draft),
            }),
          }),
          badge_icon: EditorFieldsType.tpl('badge_icon', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color),
          }),
          badge_color_toggle: EditorFieldsType.toggle('badge_color_toggle', {
            virtual: true,
            showIf: (c: LovelaceConfig) => Boolean(c.badge_icon) || Boolean(c.badge_color),
            resolveVirtual: (c: LovelaceConfig) => Boolean(c.badge_color),
            onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
              ...config,
              badge_color: value ? config._badge_color_draft || '{{ }}' : undefined,
              _badge_color_draft: value ? undefined : (config.badge_color ?? config._badge_color_draft),
            }),
          }),
          badge_color: EditorFieldsType.tpl('badge_color', {
            noLabel: true,
            helper: true,
            helperKey: 'color',
            showIf: (c: LovelaceConfig) => Boolean(c.badge_color),
          }),
        },

  // Template/BadgeTemplate: Jinja-only, no above/below/color/highlight/
  // animation/label - nothing static to pair a mode chip against.
  themeAlertFields: (template: boolean) =>
    template
      ? {
          ...alertToggleField(),
          'alert_when.jinja': EditorFieldsType.tpl('alert_when.jinja', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
          }),
        }
      : {
          ...alertToggleField(),
          ...alertModeField(),
          ...alertField('above'),
          ...alertField('below'),
          'alert_when.jinja': EditorFieldsType.tpl('alert_when.jinja', {
            noLabel: true,
            helper: true,
            showIf: (c: LovelaceConfig) => is.nonEmptyString(c.alert_when?.jinja),
          }),
          'alert_when.color': EditorFieldsType.select('alert_when.color', {
            type: 'color',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
          }),
          'alert_when.highlight': EditorFieldsType.select('alert_when.highlight', {
            type: 'alert_highlight',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
            width: availableSpace(),
          }),
          // 'ping' is selectable with any highlight: it's a box-shadow ring
          // burst around the whole card (see .alert-anim-ping), independent
          // of highlight's border-color/background-color.
          'alert_when.animation': EditorFieldsType.select('alert_when.animation', {
            type: 'alert_animation',
            showIf: (c: LovelaceConfig) => Boolean(c.alert_when),
            width: availableSpace(),
          }),
          // Only shown for highlight: label - a fixed word for the status
          // pill (see schema.ts's alert_when.label), not Jinja like the
          // card-level label field. Full width, own row - unlike
          // color/highlight/animation, it's a free-text field, not a chip
          // pair that benefits from sharing a row.
          'alert_when.label': EditorFieldsType.text('alert_when.label', {
            showIf: (c: LovelaceConfig) => (c.alert_when as { highlight?: string })?.highlight === 'label',
            width: '100%',
          }),
        },

  // frameless/marginless: still valid for badges in the schema (raw YAML
  // still works) and documented as such - just not worth a control in the
  // badge editor, a deliberate choice, not a dead-CSS case. `height` is
  // genuinely deleted from the badge schema (see YamlSchemaFactory.badge).
  themeCardLayoutFields: (badge: boolean) =>
    badge
      ? {}
      : {
          frameless: EditorFieldsType.toggle('frameless', { width: availableSpace() }),
          marginless: EditorFieldsType.toggle('marginless', { width: availableSpace() }),
        },

  // A "Card size" toggle that reveals min_width (+ height on cards) without
  // forcing a value: `_show_size` is ephemeral UI state, same pattern as
  // `_visible_actions`. Also reads as on when a value already exists.
  cardSizeFields: (badge: boolean) => {
    const shown = (c: LovelaceConfig) => Boolean(c._show_size || c.min_width || c.height);
    return {
      card_size_toggle: {
        name: 'card_size_toggle',
        type: 'toggle',
        virtual: true,
        resolveVirtual: shown,
        onVirtualChange: (value: boolean, config: LovelaceConfig) =>
          value
            ? { ...config, _show_size: true }
            : { ...config, _show_size: undefined, min_width: undefined, height: undefined },
      },
      ...EditorFactory.lengthField(
        'min_width',
        badge
          ? { units: ['px', '%'], convertRef: 130, showIf: shown }
          : { units: ['px', 'em', 'rem', '%'], showIf: shown },
      ),
      ...(badge
        ? {}
        : EditorFactory.lengthField('height', { units: ['px', 'em', 'rem', '%'], showIf: shown, customToggle: true })),
    };
  },

  themeLayoutField: (badge: boolean, resetUpIfInvalid: (config: LovelaceConfig) => LovelaceConfig) =>
    badge
      ? {}
      : {
          layout: EditorFieldsType.select('layout', {
            // density: compact only has a meaningful shape in horizontal -
            // see EditorFactory.applyDensityConstraints.
            type: (c: LovelaceConfig) => (c.density === 'compact' ? 'layout_horizontal_only' : 'layout'),
            onChange: (_value: unknown, config: LovelaceConfig) =>
              EditorFactory.resetCompactBelowIfInvalid(resetUpIfInvalid(config)),
          }),
          density_toggle: EditorFieldsType.toggle('density_toggle', {
            virtual: true,
            // Meaningless once layout: vertical is picked.
            showIf: (c: LovelaceConfig) => c.layout !== 'vertical',
            resolveVirtual: (c: LovelaceConfig) => c.density === 'compact',
            // A card already in a Sections view almost always carries its own
            // explicit grid_options (HA writes one when a card is added or
            // dragged to a size) - that stored value always wins over
            // getGridOptions()'s computed default, so shrinking the computed
            // side alone never resizes an existing card. Pin grid_options
            // here instead, the same way the user would by hand: 1
            // column-of-3/1 row, exactly what density: compact always
            // resolves to. Whatever grid_options held before is stashed in
            // _grid_options_draft (ephemeral, same pattern as custom_theme's
            // _theme_draft) and restored once compact is switched back off.
            onVirtualChange: (value: boolean, config: LovelaceConfig): LovelaceConfig => {
              if (value) {
                return {
                  ...EditorFactory.applyDensityConstraints({ ...config, density: 'compact' }),
                  grid_options: { columns: Number(CARD.layout.gridColumnMultiplier), rows: 1 },
                  _grid_options_draft: config.grid_options,
                };
              }
              return {
                ...config,
                density: undefined,
                grid_options: config._grid_options_draft,
                _grid_options_draft: undefined,
              };
            },
          }),
        },

  // 'up' only has a visible effect in these two combinations (see
  // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision) - shared by
  // bar_orientation's own dynamic type in theme() and the reset-on-change
  // hooks on bar_position (theme()) / layout (now in its own layout() panel,
  // see below - lifted out of theme()'s closure so both can reach it).
  upAllowed: (c: LovelaceConfig) =>
    (c.layout === 'vertical' && c.bar_position === 'overlay') || c.bar_position === 'background',

  // Shared by icon/bar_scale (theme()) and themeBarSizingFields below - a
  // built-in theme or a custom_theme zone list, either one counts.
  themeActive: (c: LovelaceConfig) => !is.nullish(c.theme) || is.array(c.custom_theme),

  resetUpIfInvalid: (config: LovelaceConfig) =>
    config.bar_orientation === 'up' && !EditorFactory.upAllowed(config)
      ? { ...config, bar_orientation: 'ltr' }
      : config,

  // Template rejects 'unit'; Badge/BadgeTemplate lack 'shape' (see schema.ts).
  hideChipsItems: (template: boolean, badge: boolean): string[] | undefined => {
    if (badge) return template ? ['icon', 'name', 'value', 'secondary_info', 'progress_bar'] : undefined;
    if (template) return ['icon', 'shape', 'name', 'value', 'secondary_info', 'progress_bar'];
    return ['icon', 'shape', 'name', 'value', 'unit', 'secondary_info', 'progress_bar'];
  },

  // compact_below (#123) mirrors 'up' above: only has a distinct effect with
  // layout: horizontal (see schema.ts's applyCompactBelowRule, the matching
  // save-time safety net) - falls back to 'default', not 'below': the two
  // are different bar placements that only coincide in horizontal.
  resetCompactBelowIfInvalid: (config: LovelaceConfig) =>
    config.bar_position === 'compact_below' && config.layout !== 'horizontal'
      ? { ...config, bar_position: 'default' }
      : config,

  // density: compact (issue #134) forces layout: horizontal and bar_position
  // into {top, bottom, background} - see schema.ts's applyDensityRule, the
  // matching save-time safety net. Applied from density_toggle's own
  // onVirtualChange, the moment it flips on, since layout/bar_position can't
  // drift into an invalid state on their own once compact is active (their
  // choices are already restricted to valid ones).
  applyDensityConstraints: (config: LovelaceConfig): LovelaceConfig => {
    if (config.density !== 'compact') return config;
    const next: LovelaceConfig = { ...config, layout: 'horizontal' };
    if (!['top', 'bottom', 'background'].includes(next.bar_position as string)) {
      next.bar_position = 'top';
    }
    return next;
  },

  // bar_orientation/bar_size/bar_color/bar_segments' row-partner logic
  // pulled out of theme() for the same cognitive-complexity reason as every
  // other themeXxxFields() here.
  // - bar_orientation and bar_size are both a flat half-width, always: on
  //   Card/Template, bar_orientation pairs with bar_position and bar_size
  //   with bar_color/bar_segments; on Badge/Badge Template (no
  //   bar_position), the two just sit next to each other instead.
  // - bar_scale (Card/Badge only) is a flat full width, never paired.
  // - bar_color/bar_segments fill in as bar_size's actual partner: bar_color
  //   hides once a theme is active, bar_segments picks up the slack for
  //   Card/Badge. Template's bar_color is always a full-width Jinja field,
  //   so bar_segments is its only possible partner. Badge Template's
  //   bar_size is already paired with bar_orientation, so bar_segments
  //   never gets a turn there.
  themeBarSizingFields: (template: boolean, badge: boolean, upAllowed: (c: LovelaceConfig) => boolean) => {
    const themeActive = EditorFactory.themeActive;
    // Mirrors bar_size's own showIf below - whenever bar_size is actually
    // visible at all, bar_single_line/text_shadow (the only other fields
    // that could otherwise land between it and bar_segments) are hidden by
    // construction (they need the exact bar_position values excluded here),
    // so bar_size and bar_segments are always neighbors when this is true.
    const barSizeAllowed = (c: LovelaceConfig) => !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position);
    return {
      // Badge has no bar_position (where the label normally sits, see
      // themeCardOnlyFields) - bar_orientation is its first bar field.
      ...(badge ? { bar_group: EditorFieldsType.sectionLabel('bar_group') } : {}),
      bar_orientation: EditorFieldsType.select('bar_orientation', {
        // Badge/Badge Template have no bar_position/layout, so 'up' is
        // statically excluded there; elsewhere, only offered when upAllowed
        // (see postProcess for the matching runtime reset).
        type: badge
          ? 'bar_orientation_no_up'
          : (c: LovelaceConfig) => (upAllowed(c) ? 'bar_orientation' : 'bar_orientation_no_up'),
        width: availableSpace(),
      }),
      bar_size: EditorFieldsType.select('bar_size', {
        ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
        // Flat half for Card/Badge/Badge Template. Plain Template is the one
        // exception: full without a theme (bar_segments, its only possible
        // partner there, has nothing to pair with either then), half once a
        // theme is active (both step into place together).
        width:
          template && !badge ? (c: LovelaceConfig) => (themeActive(c) ? availableSpace() : '100%') : availableSpace(),
        // top/bottom/overlay/background all hard-override the bar's own
        // thickness in CSS regardless of bar_size (see ha-card.overlay,
        // .bottom-container/.top-container, ha-card.background).
        showIf: barSizeAllowed,
      }),
      bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
        showIf: (c: LovelaceConfig) => !themeActive(c),
        // Full-width once bar_size (its row partner) hides for the same
        // bar_position values.
        ...(template
          ? { helper: true, helperKey: 'color' }
          : { width: (c: LovelaceConfig) => (barSizeAllowed(c) ? availableSpace() : '100%') }),
      }),
      ...EditorFactory.themeSingleLineShadowFields(badge),
      bar_segments: EditorFieldsType.number('bar_segments', {
        width: (c: LovelaceConfig) => {
          // Badge Template: bar_size already sits next to bar_orientation
          // (both always half, see above) - bar_segments never gets a turn.
          if (badge && template) return '100%';
          // Badge: flat half, always - bar_scale (below) tags along whenever
          // it's visible too (center_zero off), same as it always has.
          if (badge) return availableSpace();
          // Plain Template: bar_color is always a full-width Jinja field,
          // never a partner - pairs with bar_size instead, which is itself
          // full without a theme (nothing to pair with either then) and
          // half with one (see bar_size's own width above).
          if (template) return themeActive(c) ? availableSpace() : '100%';
          // Card: flat half, always - pairs with bar_scale (below) without a
          // theme, or with bar_size once one hides bar_color (bar_size's own
          // usual partner then) and bar_scale goes full-width itself.
          return availableSpace();
        },
      }),
    };
  },

  theme: (template: boolean, badge: boolean) => {
    const upAllowed = EditorFactory.upAllowed;
    const resetUpIfInvalid = EditorFactory.resetUpIfInvalid;
    return {
      title: 'editor.title.theme',
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...EditorFactory.themeModeFields(template),
        ...EditorFactory.themeColorModeFields(template),
        // Half-width to pair with `color` below - but `color` hides once a
        // theme/custom_theme is active, so `icon` needs to reclaim the full
        // row then. Card: always half now, whether or not `color` is
        // actually showing (matches bar_orientation/bar_size below). Badge
        // keeps the old theme-aware behavior (full once `color` hides).
        icon: EditorFieldsType.templateOrType('icon', template, 'icon', {
          ...(template
            ? { helper: true }
            : {
                width: badge
                  ? (c: LovelaceConfig) => (EditorFactory.themeActive(c) ? '100%' : availableSpace())
                  : availableSpace(),
              }),
        }),
        color: EditorFieldsType.templateOrType('color', template, 'color', {
          showIf: (c: LovelaceConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          ...(template ? { helper: true } : { width: availableSpace() }),
        }),
        ...EditorFactory.themeCardOnlyFields(template, badge, resetUpIfInvalid),
        ...EditorFactory.themeBarSizingFields(template, badge, upAllowed),
        // Not in YamlSchemaFactory.template: percent comes straight from Jinja
        // there, so the log/linear min-max mapping this drives has nothing to
        // act on - showing it would silently do nothing on save (same trap as
        // #111's min_value/max_value on a template card).
        ...(!template
          ? {
              bar_scale: EditorFieldsType.select('bar_scale', {
                // Badge: full without a theme, half once one is active -
                // the opposite of Card's own rule right below.
                // Card: half without a theme (pairs with bar_segments there
                // too), full once one is active (bar_segments goes full then
                // as well - see its own width above).
                width: badge
                  ? (c: LovelaceConfig) => (EditorFactory.themeActive(c) ? availableSpace() : '100%')
                  : (c: LovelaceConfig) => (EditorFactory.themeActive(c) ? '100%' : availableSpace()),
                showIf: (c: LovelaceConfig) => !c.center_zero,
              }),
            }
          : {}),
        ...EditorFactory.themeMaxWidthFields(badge),
        reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', {
          // Badge/Badge Template have neither key at all (always undefined) but
          // structurally render exactly like layout: horizontal + bar_position:
          // default - the (?? 'horizontal') fallback (missing before) is what
          // actually lets it show and work for them, matching bar_position's
          // own fallback right next to it.
          showIf: (c: LovelaceConfig) =>
            (!c.bar_position || c.bar_position === 'default') && (c.layout ?? 'horizontal') === 'horizontal',
        }),
        // Used to be mutually exclusive with bar_color_mode (segment/rainbow
        // had no effect under center_zero, see schema.ts's own former
        // applyBarColorModeRule) - now that ViewBase.themeDivergingGradient
        // supports both together, gating this toggle on bar_color_mode being
        // 'auto' would just hide it (and center_zero_value/growth_percent
        // below) the moment a rainbow/segment theme is picked, with no way to
        // reach it again from the editor.
        center_zero: EditorFieldsType.toggle('center_zero', {
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => Boolean(c.center_zero),
          onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
            ...config,
            center_zero: value ? (is.plainObject(config.center_zero) ? config.center_zero : true) : false,
          }),
        }),
        center_zero_value: EditorFieldsType.number('center_zero_value', {
          target: 'center_zero',
          showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => (is.plainObject(c.center_zero) ? (c.center_zero.value ?? 0) : 0),
          onVirtualChange: (value: number, config: LovelaceConfig) => {
            const growthPercent = is.plainObject(config.center_zero)
              ? Boolean(config.center_zero.growth_percent)
              : false;
            return {
              ...config,
              center_zero: value || growthPercent ? { value: Number(value) || 0, growth_percent: growthPercent } : true,
            };
          },
        }),
        center_zero_growth_percent: EditorFieldsType.toggle('center_zero_growth_percent', {
          target: 'center_zero',
          showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) =>
            is.plainObject(c.center_zero) ? Boolean(c.center_zero.growth_percent) : false,
          onVirtualChange: (value: boolean, config: LovelaceConfig) => {
            const currentValue = is.plainObject(config.center_zero) ? (config.center_zero.value ?? 0) : 0;
            return {
              ...config,
              center_zero: currentValue || value ? { value: currentValue, growth_percent: value } : true,
            };
          },
        }),
        bar_effect_mode: {
          name: 'bar_effect_mode',
          type: 'bar_effect_mode',
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c.bar_effect) ? 'advanced' : 'simple'),
          // Ephemeral - both directions, so switching chips <-> Jinja and
          // back restores whichever shape was left behind either way.
          onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
            const current = config.bar_effect;
            const arrayDraft = is.array(current) ? current : config._bar_effect_array_draft;
            const jinjaDraft = is.nonEmptyString(current) ? current : config._bar_effect_jinja_draft;
            return {
              ...config,
              bar_effect: mode === 'advanced' ? jinjaDraft || '{{ }}' : (arrayDraft ?? []),
              _bar_effect_array_draft: mode === 'advanced' ? arrayDraft : undefined,
              _bar_effect_jinja_draft: mode === 'advanced' ? undefined : jinjaDraft,
            };
          },
        },
        bar_effect_chips: EditorFieldsType.select('bar_effect_chips', {
          type: 'effect_chips',
          target: 'bar_effect',
          showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.bar_effect),
        }),
        bar_effect: EditorFieldsType.tpl('bar_effect', {
          noLabel: true,
          helper: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyString(c.bar_effect),
        }),
        // ── Hide ─────────────────────────────────────────────────────────────
        hide_mode: {
          name: 'hide_mode',
          type: 'hide_mode',
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c.hide) ? 'advanced' : 'simple'),
          // Ephemeral - both directions, same reasoning as bar_effect_mode.
          onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
            const current = config.hide;
            const arrayDraft = is.array(current) ? current : config._hide_array_draft;
            const jinjaDraft = is.nonEmptyString(current) ? current : config._hide_jinja_draft;
            return {
              ...config,
              hide: mode === 'advanced' ? jinjaDraft || '{{ }}' : (arrayDraft ?? []),
              _hide_array_draft: mode === 'advanced' ? arrayDraft : undefined,
              _hide_jinja_draft: mode === 'advanced' ? undefined : jinjaDraft,
            };
          },
        },
        hide_chips: EditorFieldsType.select('hide_chips', {
          type: 'hide_chips',
          target: 'hide',
          showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.hide),
          items: EditorFactory.hideChipsItems(template, badge),
          // Meaningless once unit itself is hidden - drop the stale values
          // instead of leaving them saved but inert.
          onChange: (_value: unknown, config: LovelaceConfig) =>
            is.array(config.hide) && config.hide.includes('unit')
              ? { ...config, unit_spacing: undefined, unit_position: undefined }
              : config,
        }),
        hide: EditorFieldsType.tpl('hide', {
          noLabel: true,
          helper: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyString(c.hide),
        }),
      },
    };
  },

  // Split out of theme() (was its single biggest chunk, ~28 fields between
  // the two): watermark and alert_when are both "react when the value
  // crosses a threshold" markers, a different concern from theme()'s own
  // pure appearance (color/bar shape/layout) - and collapsing this panel
  // while working on the other skips a re-evaluation of all of it on every
  // keystroke elsewhere in the editor, same idea in the other direction.
  markers: (template: boolean, badge: boolean) => ({
    title: 'editor.title.markers',
    icon: HA_CONTEXT.icons.radar,
    fields: {
      ...EditorFactory.themeWatermarkFields(),
      // Jinja-driven, same "react to a condition" concern as watermark/
      // alert_when/status_label below, not theme()'s own pure appearance -
      // moved here from theme() for that reason (see themeBadgeIconColor
      // Fields's own definition, unchanged otherwise).
      ...EditorFactory.themeBadgeIconColorFields(badge),
      // Card + Template only (same scope as trend_indicator, which shares a
      // corner with it, see schema.ts's applyLabelRule): too small a scale
      // to read well on a badge. Lives here, not content(), since it's the
      // same status-pill marker alert_when.highlight: 'label' reuses.
      // status_label_toggle mirrors watermark_toggle/alert_toggle below,
      // same collapse-to-reveal pattern. Ordered before alert_when on
      // purpose: alert_when.highlight: 'label' reuses this pill, reads
      // better once status_label's shape is already established above it.
      ...(!badge
        ? {
            status_label_toggle: EditorFieldsType.toggle('status_label_toggle', {
              virtual: true,
              resolveVirtual: (c: LovelaceConfig) => Boolean(c.status_label),
              // Ephemeral - the whole object (jinja/position/color_source),
              // not just jinja, so re-enabling restores all three.
              onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
                ...config,
                status_label: value ? config._status_label_draft || {} : undefined,
                _status_label_draft: value ? undefined : (config.status_label ?? config._status_label_draft),
              }),
            }),
            'status_label.jinja': EditorFieldsType.tpl('status_label.jinja', {
              noLabel: true,
              helper: true,
              showIf: (c: LovelaceConfig) => Boolean(c.status_label),
            }),
            'status_label.position': EditorFieldsType.select('status_label.position', {
              type: 'label_position',
              width: availableSpace(),
              showIf: (c: LovelaceConfig) => Boolean(c.status_label),
            }),
            // Which color the pill falls back to (see HACore._repaintStatus
            // Label) when its own `jinja` doesn't return an explicit
            // {label, color} - 'bar' by default (schema.ts's own default).
            'status_label.color_source': EditorFieldsType.select('status_label.color_source', {
              type: 'status_label_color_source',
              width: availableSpace(),
              showIf: (c: LovelaceConfig) => Boolean(c.status_label),
            }),
          }
        : {}),
      ...EditorFactory.themeAlertFields(template),
    },
  }),

  // Also split out of theme(): frameless/marginless/height/min_width/layout
  // are the card's own sizing/shape, a different concern from its color/bar
  // appearance above. Smaller win than markers() (5 fields vs ~28) but the
  // same grouping logic - and it's the natural conceptual home for these
  // regardless of the performance angle.
  layout: (badge: boolean) => ({
    title: 'editor.title.layout',
    icon: HA_CONTEXT.icons.aspectRatio,
    fields: {
      ...EditorFactory.themeCardLayoutFields(badge),
      // min_width (+ height on cards) behind a "Card size" reveal toggle. Not
      // gated on `badge` for min_width - valid for badges too (not in
      // YamlSchemaFactory.badge's delete list).
      ...EditorFactory.cardSizeFields(badge),
      ...EditorFactory.themeLayoutField(badge, EditorFactory.resetUpIfInvalid),
    },
  }),

  interactions: (badge: boolean) => {
    // isActive: negotiated action differs from 'none'. isRevealed: manually
    // added via the "+" picker (_visible_actions, ephemeral UI state).
    // Boolean(...) guard: resolveVirtual below only has raw config, where an
    // untouched key is absent (undefined !== 'none' would read as "active").
    const isActive = (key: string) => (_: LovelaceConfig, n: Config) =>
      Boolean(n?.[key]?.action) && n[key].action !== 'none';
    const isRevealed = (key: string) => (c: LovelaceConfig) =>
      Array.isArray(c._visible_actions) && c._visible_actions.includes(key);
    const orRevealed =
      (key: string, pred: (c: LovelaceConfig, n: Config) => boolean) => (c: LovelaceConfig, n: Config) =>
        isRevealed(key)(c) || pred(c, n);
    const optionalKeys = badge
      ? ['hold_action', 'double_tap_action']
      : ['hold_action', 'double_tap_action', 'icon_hold_action', 'icon_double_tap_action'];
    // Hidden = neither active nor revealed. n defaults to c: resolveVirtual
    // has no negotiated, unlike showIf.
    const hiddenKeys = (c: LovelaceConfig, n: Config = c as unknown as Config) =>
      optionalKeys.filter((k) => !isRevealed(k)(c) && !isActive(k)(c, n));
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        tap_action: EditorFieldsType.action('tap_action', { labelKey: 'action.tap' }),
        hold_action: EditorFieldsType.action('hold_action', {
          labelKey: 'action.hold',
          showIf: orRevealed('hold_action', isActive('hold_action')),
        }),
        double_tap_action: EditorFieldsType.action('double_tap_action', {
          labelKey: 'action.double_tap',
          showIf: orRevealed('double_tap_action', isActive('double_tap_action')),
        }),
        ...(!badge
          ? {
              icon_tap_action: EditorFieldsType.action('icon_tap_action', { labelKey: 'action.icon_tap' }),
              icon_hold_action: EditorFieldsType.action('icon_hold_action', {
                labelKey: 'action.icon_hold',
                showIf: orRevealed('icon_hold_action', isActive('icon_hold_action')),
              }),
              icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
                labelKey: 'action.icon_double_tap',
                showIf: orRevealed('icon_double_tap_action', isActive('icon_double_tap_action')),
              }),
            }
          : {}),
        action_picker: {
          name: 'action_picker',
          type: 'action_picker',
          virtual: true,
          items: optionalKeys,
          showIf: (c: LovelaceConfig, n: Config) => hiddenKeys(c, n).length > 0,
          resolveVirtual: (c: LovelaceConfig) => ({
            visible: Array.isArray(c._visible_actions) ? c._visible_actions : [],
            hidden: hiddenKeys(c),
          }),
          onVirtualChange: (value: string[], config: LovelaceConfig) => ({ ...config, _visible_actions: value }),
        },
      },
    };
  },

  build: (template: boolean, badge: boolean) => ({
    general: EditorFactory.general(template),
    content: EditorFactory.content(template, badge),
    theme: EditorFactory.theme(template, badge),
    markers: EditorFactory.markers(template, badge),
    layout: EditorFactory.layout(badge),
    interactions: EditorFactory.interactions(badge),
  }),
};

export { field };
export { EditorFieldsType };
export { wmSide };
export { EditorFactory };
