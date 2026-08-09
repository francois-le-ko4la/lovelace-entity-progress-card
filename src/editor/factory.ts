/*
 * EditorFactory: builds the field-definition tree
 * (general/content/theme/interactions sections) that EditorBase renders, per
 * card type (card/badge/template/badgeTemplate).
 */

import {
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
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      resolveVirtual: (c: LovelaceConfig) =>
        is.nonEmptyString(c[key]?.jinja) ? 'jinja' : is.plainObject(c[key]) ? 'entity' : 'standard',
      onVirtualChange: (mode: 'entity' | 'jinja' | 'standard', config: LovelaceConfig) => {
        if (mode === 'entity') {
          return { ...config, [key]: is.nonEmptyString(config[key]?.entity) ? config[key] : { entity: '' } };
        }
        if (mode === 'jinja') {
          return { ...config, [key]: is.nonEmptyString(config[key]?.jinja) ? config[key] : { jinja: '{{ }}' } };
        }
        return { ...config, [key]: undefined };
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
      showIf: (c: LovelaceConfig) => is.plainObject(c[key]) && is.nonEmptyString(c[key].entity),
    }),
    [`${key}.jinja`]: EditorFieldsType.tpl(`${key}.jinja`, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => is.nonEmptyString(c[key]?.jinja),
    }),
  };
};

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

// Shared by watermark.low/high (wmSide) and alert_when.above/below
// (alertField): both are number (fixed) | { entity, attribute } | { jinja }
// (see schema.ts's numericEntityOrJinja) nested one level under a parent
// object, so entity/attribute/jinja have to stay virtual fields rather than
// plain dot-path ones (unlike min_value.entity/max_value.entity, see
// valueField above): the generic nested-field machinery (#resolveValue/
// #handleNestedField) only resolves one level of dot-path, and these are
// already one level deep under their parent. `isEnabled` folds in whatever
// extra condition gates the parent being "on" for a given caller
// (watermark's own disable_low/high toggle; alert_when has none, just
// Boolean(c.alert_when)). `defaultVal` is what 'standard' mode - and
// clearing the entity picker - revert to: a real number for watermark,
// undefined for alert_when (genuinely optional, no default).
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
        if (mode === 'entity') {
          return {
            ...config,
            [parentKey]: {
              ...config[parentKey],
              [key]: is.nonEmptyString(config[parentKey]?.[key]?.entity) ? config[parentKey][key] : { entity: '' },
            },
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            [parentKey]: {
              ...config[parentKey],
              [key]: is.nonEmptyString(config[parentKey]?.[key]?.jinja) ? config[parentKey][key] : { jinja: '{{ }}' },
            },
          };
        }
        return { ...config, [parentKey]: { ...config[parentKey], [key]: defaultVal } };
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
const alertField = (side: 'above' | 'below') => {
  const entityPath = side === 'above' ? ALERT_ABOVE_ENTITY_PATH : ALERT_BELOW_ENTITY_PATH;
  return nestedValueField('alert_when', side, entityPath, (c: LovelaceConfig) => Boolean(c.alert_when));
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
            name_info: EditorFieldsType.tpl('name_info'),
          }),
      ...(template
        ? {
            secondary: EditorFieldsType.tpl('secondary'),
            // Badge/badgeTemplate opt out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there.
            ...(!badge ? { multiline: EditorFieldsType.toggle('multiline') } : {}),
            percent: EditorFieldsType.tpl('percent'),
          }
        : {
            unit: EditorFieldsType.text('unit', {
              width: availableSpace(32, 1 / 3),
              placeholder: (_c: LovelaceConfig, neg: Config) => (neg?.resolvedUnit as string) ?? '',
            }),
            // disable_unit is deprecated (see
            // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
            // another hide target, folded into hide by _customizeConfig. The
            // disable_unit check here only matters for a legacy raw config on
            // first load, before that fold has round-tripped through the
            // editor's own config-changed.
            unit_spacing: EditorFieldsType.select('unit_spacing', {
              type: 'unit_spacing',
              width: availableSpace(32, 1 / 3),
              showIf: (c: LovelaceConfig) => !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit'))),
            }),
            decimal: EditorFieldsType.decimal('decimal', {
              width: availableSpace(32, 1 / 3),
              placeholder: (_c: LovelaceConfig, neg: Config) =>
                neg?.resolvedDecimal == null ? '' : String(neg.resolvedDecimal),
            }),
            // A 2-state toggle can't represent 3 mutually exclusive modes
            // (standard/entity/Jinja) — a single-select chip group replaces
            // the previous pair of toggles, which could both show at once and
            // left the mode ambiguous. min_value/max_value's config shape is
            // also explicit rather than sniffed: a bare number is the fixed
            // value (legacy, unchanged), and { entity, attribute } / { jinja }
            // replace what used to be a single overloaded string disambiguated
            // at runtime by an is.jinja() regex test.
            ...valueField('min_value', MIN_VALUE_ENTITY_PATH, {
              default: (c: LovelaceConfig) => (c.center_zero ? -100 : 0),
            }),
            ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info'),
            // Badge opts out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there.
            ...(!badge ? { multiline: EditorFieldsType.toggle('multiline') } : {}),
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
  // back. The inactive side is now parked in a `_`-prefixed draft
  // (session-only, stripped before dispatch by #sendConfig, same mechanism as
  // _show_all_actions) and restored when its mode is selected again.
  themeModeFields: (template: boolean) =>
    template
      ? {}
      : {
          theme_mode: {
            name: 'theme_mode',
            type: 'theme_mode',
            virtual: true,
            // is.array (not is.nonEmptyArray): a freshly-entered custom mode
            // starts as an empty [] before the user adds a first zone, and must
            // still read as 'custom'.
            resolveVirtual: (c: LovelaceConfig) => (is.array(c.custom_theme) ? 'custom' : 'preset'),
            onVirtualChange: (mode: 'custom' | 'preset', config: LovelaceConfig) => {
              const wantsCustom = mode === 'custom';
              return {
                ...config,
                theme: wantsCustom ? undefined : (config._theme_draft ?? config.theme),
                _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
                custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
                _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
              };
            },
          },
          theme: EditorFieldsType.select('theme', { showIf: (c: LovelaceConfig) => !is.array(c.custom_theme) }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c: LovelaceConfig) => is.array(c.custom_theme),
            onClear: (config: LovelaceConfig) => {
              const rest = { ...config };
              delete rest.custom_theme;
              return rest;
            },
          },
        },

  // Badge/BadgeTemplate schemas reject some enum members that only make
  // sense with a `layout`/`bar_position` a badge doesn't have (see
  // YamlSchemaFactory.badge) - swaps in the matching restricted select type
  // instead of a range check inline in theme() below.
  badgeRestrictedType: (badge: boolean, restrictedType: string) => (badge ? { type: restrictedType } : {}),

  // Per-variant width overrides (Card/Badge/Template/BadgeTemplate) below
  // read oddly as inline ternaries repeated per field - one named condition
  // per field instead.
  widthUnless: (condition: boolean) => (condition ? {} : { width: availableSpace() }),

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
  // reason as themeModeFields/widthUnless above: keep each conditional
  // block's own ternaries out of theme()'s cognitive complexity budget.

  themeColorModeFields: (template: boolean) =>
    template
      ? {}
      : {
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            // center_zero no longer excludes this - see
            // ViewBase.themeDivergingGradient.
            showIf: (c: LovelaceConfig) => !is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme),
            // Selecting a non-auto color mode is incompatible with
            // interpolate: clear it.
            onChange: (value: string | undefined, config: LovelaceConfig) =>
              value && value !== 'auto' ? { ...config, interpolate: undefined } : config,
          }),
          interpolate: EditorFieldsType.toggle('interpolate', {
            showIf: (c: LovelaceConfig) =>
              (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) &&
              (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
          }),
        },

  themeCardOnlyFields: (badge: boolean, resetUpIfInvalid: (config: LovelaceConfig) => LovelaceConfig) =>
    badge
      ? {}
      : {
          // Half-width once a theme is active, to pair with `icon` once
          // `color` (icon's usual partner) hides. Virtual: icon_animation is
          // an enum name | { effect, jinja } (see schema.ts's
          // enumOrJinjaTrigger) - this same select reads/writes `effect` in
          // both shapes so the dropdown stays a single control regardless of
          // mode.
          icon_animation: EditorFieldsType.select('icon_animation', {
            virtual: true,
            width: (c: LovelaceConfig) =>
              !is.nullish(c.theme) || is.array(c.custom_theme) ? availableSpace() : '100%',
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
          icon_animation_jinja_toggle: EditorFieldsType.toggle('icon_animation_jinja_toggle', {
            target: 'icon_animation',
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => is.plainObject(c.icon_animation),
            onVirtualChange: (value: boolean, config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              return {
                ...config,
                icon_animation: value
                  ? { effect, jinja: is.nonEmptyString(current?.jinja) ? current.jinja : '{{ }}' }
                  : effect || undefined,
              };
            },
          }),
          icon_animation_jinja: EditorFieldsType.tpl('icon_animation_jinja', {
            target: 'icon_animation',
            virtual: true,
            noLabel: true,
            showIf: (c: LovelaceConfig) => is.plainObject(c.icon_animation),
            resolveVirtual: (c: LovelaceConfig) =>
              is.plainObject(c.icon_animation) ? (c.icon_animation.jinja ?? '') : '',
            onVirtualChange: (value: string, config: LovelaceConfig) => {
              const current = config.icon_animation;
              const effect = is.plainObject(current) ? current.effect : current;
              return { ...config, icon_animation: { effect, jinja: value || '' } };
            },
          }),
          force_circular_background: EditorFieldsType.toggle('force_circular_background'),
          bar_position: EditorFieldsType.select('bar_position', {
            // compact_below only has a distinct effect with layout: horizontal
            // (see resetCompactBelowIfInvalid's own comment) - not offered at
            // all once layout: vertical, same reasoning as bar_orientation's
            // 'up' just above.
            type: (c: LovelaceConfig) => (c.layout === 'vertical' ? 'bar_position_no_compact_below' : 'bar_position'),
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
          bar_single_line: EditorFieldsType.toggle('bar_single_line', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay',
          }),
          text_shadow: EditorFieldsType.toggle('text_shadow', {
            showIf: (c: LovelaceConfig) => c.bar_position === 'overlay' || c.bar_position === 'background',
          }),
        },

  // bar_max_width only affects .horizontal.small/.medium/.large (see the CSS
  // rule on .progress-container) - 'below'/'top'/'bottom'/'overlay'/
  // 'background' all render through a separate container element instead,
  // and .horizontal.xlarge has no matching max-width rule either (see the
  // schema's own postProcess, which clears bar_max_width server-side for the
  // same reason - this is just the editor mirror of it). Badge/badgeTemplate
  // opt out entirely (see their own .delete(['bar_max_width'])): without a
  // 'layout' key they never get the 'horizontal' class, so the option would
  // be inert there.
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
          bar_max_width: value ? '300px' : undefined,
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
          watermark: value ? {} : undefined,
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
          badge_icon: EditorFieldsType.tpl('badge_icon'),
          badge_color: EditorFieldsType.tpl('badge_color'),
        },

  // Alert (alert_when) — not in the template schema.
  themeAlertFields: (template: boolean) =>
    template
      ? {}
      : {
          alert_toggle: EditorFieldsType.toggle('alert_toggle', {
            virtual: true,
            resolveVirtual: (c: LovelaceConfig) => Boolean(c.alert_when),
            onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
              ...config,
              alert_when: value ? {} : undefined,
            }),
          }),
          ...alertField('above'),
          ...alertField('below'),
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
  // forcing a value: `_show_size` is ephemeral UI state (stripped before
  // config-changed, never saved to YAML), same pattern as `_show_all_actions`.
  // The toggle also reads as on when a value already exists (YAML round-trip).
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
            onChange: (_value: unknown, config: LovelaceConfig) =>
              EditorFactory.resetCompactBelowIfInvalid(resetUpIfInvalid(config)),
          }),
        },

  // 'up' only has a visible effect in these two combinations (see
  // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision) - shared by
  // bar_orientation's own dynamic type in theme() and the reset-on-change
  // hooks on bar_position (theme()) / layout (now in its own layout() panel,
  // see below - lifted out of theme()'s closure so both can reach it).
  upAllowed: (c: LovelaceConfig) =>
    (c.layout === 'vertical' && c.bar_position === 'overlay') || c.bar_position === 'background',

  resetUpIfInvalid: (config: LovelaceConfig) =>
    config.bar_orientation === 'up' && !EditorFactory.upAllowed(config)
      ? { ...config, bar_orientation: 'ltr' }
      : config,

  // compact_below (#123) mirrors 'up' above: only has a distinct effect with
  // layout: horizontal (see schema.ts's applyCompactBelowRule, the matching
  // save-time safety net) - falls back to 'default', not 'below': the two
  // are different bar placements that only coincide in horizontal.
  resetCompactBelowIfInvalid: (config: LovelaceConfig) =>
    config.bar_position === 'compact_below' && config.layout !== 'horizontal'
      ? { ...config, bar_position: 'default' }
      : config,

  theme: (template: boolean, badge: boolean) => {
    const upAllowed = EditorFactory.upAllowed;
    const resetUpIfInvalid = EditorFactory.resetUpIfInvalid;
    return {
      title: 'editor.title.theme',
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...EditorFactory.themeModeFields(template),
        ...EditorFactory.themeColorModeFields(template),
        icon: EditorFieldsType.templateOrType('icon', template, 'icon', template ? {} : { width: availableSpace() }),
        color: EditorFieldsType.templateOrType('color', template, 'color', {
          showIf: (c: LovelaceConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          ...(template ? {} : { width: availableSpace() }),
        }),
        ...EditorFactory.themeCardOnlyFields(badge, resetUpIfInvalid),
        bar_orientation: EditorFieldsType.select('bar_orientation', {
          // Badge/Badge Template have no bar_position/layout, so 'up' is
          // statically excluded there; elsewhere, only offered when upAllowed
          // (see postProcess for the matching runtime reset).
          type: badge
            ? 'bar_orientation_no_up'
            : (c: LovelaceConfig) => (upAllowed(c) ? 'bar_orientation' : 'bar_orientation_no_up'),
          // Half-width everywhere except plain Badge (full-width there).
          ...EditorFactory.widthUnless(badge && !template),
        }),
        bar_size: EditorFieldsType.select('bar_size', {
          ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
          // Full-width for Template/Badge Template (bar_color is a Jinja field
          // there, no row partner) or once a theme is active (bar_color hides).
          width: (c: LovelaceConfig) =>
            template || !is.nullish(c.theme) || is.array(c.custom_theme) ? '100%' : availableSpace(),
          // top/bottom/overlay/background all hard-override the bar's own
          // thickness in CSS regardless of bar_size (see ha-card.overlay,
          // .bottom-container/.top-container, ha-card.background).
          showIf: (c: LovelaceConfig) => !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position),
        }),
        bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
          showIf: (c: LovelaceConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          // Full-width once bar_size (its row partner) hides for the same
          // bar_position values.
          ...(template
            ? {}
            : {
                width: (c: LovelaceConfig) =>
                  ['top', 'bottom', 'overlay', 'background'].includes(c.bar_position) ? '100%' : availableSpace(),
              }),
        }),
        ...EditorFactory.themeSingleLineShadowFields(badge),
        bar_segments: EditorFieldsType.number('bar_segments', {
          // Full-width for Template/Badge Template: bar_scale (its row partner
          // below) doesn't exist there at all.
          ...(template ? { width: '100%' } : { width: availableSpace() }),
        }),
        // Not in YamlSchemaFactory.template: percent comes straight from Jinja
        // there, so the log/linear min-max mapping this drives has nothing to
        // act on - showing it would silently do nothing on save (same trap as
        // #111's min_value/max_value on a template card).
        ...(!template
          ? {
              bar_scale: EditorFieldsType.select('bar_scale', {
                width: availableSpace(),
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
        bar_effect_jinja: EditorFieldsType.toggle('bar_effect_jinja', {
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => is.nonEmptyString(c.bar_effect),
          onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
            ...config,
            bar_effect: value ? '{{ }}' : [],
          }),
        }),
        bar_effect_chips: EditorFieldsType.select('bar_effect_chips', {
          type: 'effect_chips',
          target: 'bar_effect',
          showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.bar_effect),
        }),
        bar_effect: EditorFieldsType.tpl('bar_effect', {
          noLabel: true,
          showIf: (c: LovelaceConfig) => is.nonEmptyString(c.bar_effect),
        }),
        // ── Badge fields ─────────────────────────────────────────────────────
        ...EditorFactory.themeBadgeIconColorFields(badge),
        // ── Hide ─────────────────────────────────────────────────────────────
        hide_jinja: EditorFieldsType.toggle('hide_jinja', {
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => is.nonEmptyString(c.hide),
          onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
            ...config,
            hide: value ? '{{ }}' : [],
          }),
        }),
        hide_chips: EditorFieldsType.select('hide_chips', {
          type: 'hide_chips',
          target: 'hide',
          showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.hide),
          // Template/BadgeTemplate schemas reject 'unit' (see
          // YamlSchemaFactory.template) - no separate unit field there, the
          // value comes straight from Jinja `percent`.
          ...(template ? { items: ['icon', 'name', 'value', 'secondary_info', 'progress_bar'] } : {}),
        }),
        hide: EditorFieldsType.tpl('hide', { noLabel: true, showIf: (c: LovelaceConfig) => is.nonEmptyString(c.hide) }),
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
      // Card + Template only (same scope as trend_indicator, which the two
      // share a corner with - see schema.ts's applyLabelRule): too small a
      // scale to read well on a badge, same reasoning as trend_indicator's
      // own badge exclusion. Lives here (not content()) because it's the
      // same status-pill marker alert_when.highlight: 'label' reuses - a
      // "react to a condition" concern, not the card's core entity/display
      // content. status_label_toggle mirrors watermark_toggle/alert_toggle
      // below - same collapse-to-reveal pattern, for consistency (the
      // dot-path fields below would otherwise auto-create the parent object
      // on first write with no toggle at all, unlike its two siblings here).
      // Ordered before alert_when on purpose: alert_when.highlight: 'label'
      // reuses this same pill, reads better once status_label's own shape is
      // already established above it.
      ...(!badge
        ? {
            status_label_toggle: EditorFieldsType.toggle('status_label_toggle', {
              virtual: true,
              resolveVirtual: (c: LovelaceConfig) => Boolean(c.status_label),
              onVirtualChange: (value: boolean, config: LovelaceConfig) => ({
                ...config,
                status_label: value ? {} : undefined,
              }),
            }),
            'status_label.jinja': EditorFieldsType.tpl('status_label.jinja', {
              noLabel: true,
              showIf: (c: LovelaceConfig) => Boolean(c.status_label),
            }),
            'status_label.position': EditorFieldsType.select('status_label.position', {
              type: 'label_position',
              width: '100%',
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
    // isActive: show a field only if its negotiated action differs from the
    // 'none' default. orAll: also show when the "show all" toggle
    // (_show_all_actions) is on. _show_all_actions is ephemeral UI state:
    // stored in raw config with _ prefix, stripped before config-changed
    // dispatch, never saved to YAML. tap_action and icon_tap_action are always
    // visible (no showIf): - tap_action default is 'more-info' — always
    // relevant. - icon_tap_action default depends on the entity domain: 'none'
    // for most entities, 'toggle' for lights, switches, etc. (patched at
    // validation time via toggleDomain). Always showing it lets the hint reveal
    // the effective default.
    const isActive = (key: string) => (_: LovelaceConfig, n: Config) => n?.[key]?.action !== 'none';
    const orAll = (pred: (c: LovelaceConfig, n: Config) => boolean) => (c: LovelaceConfig, n: Config) =>
      Boolean(c._show_all_actions) || pred(c, n);
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        show_all_actions: {
          name: 'show_all_actions',
          type: 'toggle',
          virtual: true,
          resolveVirtual: (c: LovelaceConfig) => Boolean(c._show_all_actions),
          onVirtualChange: (value: boolean, config: LovelaceConfig) => ({ ...config, _show_all_actions: value }),
        },
        tap_action: EditorFieldsType.action('tap_action'),
        hold_action: EditorFieldsType.action('hold_action', { showIf: orAll(isActive('hold_action')) }),
        double_tap_action: EditorFieldsType.action('double_tap_action', {
          showIf: orAll(isActive('double_tap_action')),
        }),
        ...(!badge
          ? {
              icon_tap_action: EditorFieldsType.action('icon_tap_action'),
              icon_hold_action: EditorFieldsType.action('icon_hold_action', {
                showIf: orAll(isActive('icon_hold_action')),
              }),
              icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
                showIf: orAll(isActive('icon_double_tap_action')),
              }),
            }
          : {}),
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
