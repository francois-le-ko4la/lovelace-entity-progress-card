/*
 * EditorFactory: builds the field-definition tree
 * (general/content/theme/interactions sections) that EditorBase renders, per
 * card type (card/badge/template/badgeTemplate).
 */

import { HA_CONTEXT, MIN_VALUE_ENTITY_PATH, MAX_VALUE_ENTITY_PATH } from '../utils/parameters.js';
import { is } from '../utils/common-checks.js';
import { HassProviderSingleton } from '../utils/hass-provider.js';
import type { RawConfig, Config } from '../utils/types.js';
import { availableSpace } from './dom-helper.js';

// Field definitions are heterogeneous option bags (showIf/resolveVirtual/
// onVirtualChange/width/target/... vary per field) - kept as `Record<string,
// any>` rather than one interface trying to cover every combination
// EditorBase/EditorDOMHelper actually consume.
const field =
  (type: string) =>
  (name: string, o: Record<string, any> = {}) => ({ name, type, ...o });

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
  select: (name: string, o: Record<string, any> = {}) => ({ name, type: name, ...o }),
  templateOrType: (name: string, template: boolean, type: string, o: Record<string, any> = {}) =>
    field(template ? 'template' : type)(name, o),
};

const wmSide = (side: string, defaultVal: any) => {
  const disableKey = `disable_${side}`;
  const attrType = `watermark${side.charAt(0).toUpperCase() + side.slice(1)}Attribute`;
  const modeType = `watermark_${side}_mode`;
  const wm = (extra: (c: RawConfig) => boolean) => (c: RawConfig) => Boolean(c.watermark) && extra(c);
  const on = (c: RawConfig) => !c.watermark?.[disableKey];
  const ent = (c: RawConfig) => is.string(c.watermark?.[side]);
  const tpl = (c: RawConfig) => is.nonEmptyString(c.watermark?.[side]?.jinja);
  return {
    [`watermark.${disableKey}`]: EditorFieldsType.toggle(`watermark.${disableKey}`, {
      showIf: (c: RawConfig) => Boolean(c.watermark),
    }),
    // A 2-state toggle can't represent 3 mutually exclusive modes
    // (standard/entity/Jinja) — mirrors min_value_mode/max_value_mode exactly,
    // replacing the previous entity-only toggle.
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      showIf: wm(on),
      resolveVirtual: (c: RawConfig) => (tpl(c) ? 'jinja' : ent(c) ? 'entity' : 'standard'),
      onVirtualChange: (mode: any, config: RawConfig) => {
        const attrKey = `${side}_attribute`;
        if (mode === 'entity') {
          return {
            ...config,
            watermark: {
              ...config.watermark,
              [side]: is.string(config.watermark?.[side]) ? config.watermark[side] : '',
            },
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            watermark: {
              ...config.watermark,
              [side]: is.nonEmptyString(config.watermark?.[side]?.jinja) ? config.watermark[side] : { jinja: '{{ }}' },
              [attrKey]: undefined,
            },
          };
        }
        return { ...config, watermark: { ...config.watermark, [side]: defaultVal, [attrKey]: undefined } };
      },
    },
    [`watermark.${side}`]: EditorFieldsType.number(`watermark.${side}`, {
      showIf: wm((c: RawConfig) => on(c) && !ent(c) && !tpl(c)),
    }),
    [`watermark.${side}_entity`]: EditorFieldsType.entity(`watermark.${side}_entity`, {
      virtual: true,
      noLabel: true,
      showIf: wm((c: RawConfig) => on(c) && ent(c)),
      resolveVirtual: (c: RawConfig) => (is.string(c.watermark?.[side]) ? c.watermark[side] : ''),
      onVirtualChange: (value: any, config: RawConfig) => ({
        ...config,
        watermark: {
          ...config.watermark,
          [side]: value || defaultVal,
          ...(!value ? { [`${side}_attribute`]: undefined } : {}),
        },
      }),
    }),
    [`watermark.${side}_attribute`]: EditorFieldsType.select(`watermark.${side}_attribute`, {
      type: attrType,
      selectorOf: `watermark.${side}`,
      showIf: wm((c: RawConfig) => on(c) && ent(c) && c.watermark[side] !== ''),
    }),
    // Virtual (not a plain dot-path field): the template string lives 2 levels
    // deep (watermark.<side>.jinja), one level past what the generic
    // nested-field machinery (#resolveValue/#handleNestedField) resolves — this
    // reads/writes that path directly.
    [`watermark_${side}_jinja`]: EditorFieldsType.tpl(`watermark_${side}_jinja`, {
      noLabel: true,
      virtual: true,
      showIf: wm((c: RawConfig) => on(c) && tpl(c)),
      resolveVirtual: (c: RawConfig) => c.watermark?.[side]?.jinja ?? '',
      onVirtualChange: (value: any, config: RawConfig) => ({
        ...config,
        watermark: { ...config.watermark, [side]: { jinja: value } },
      }),
    }),
    [`watermark.${side}_as`]: EditorFieldsType.select(`watermark.${side}_as`, {
      type: 'watermark_as',
      showIf: wm(on),
      width: availableSpace(),
    }),
    [`watermark.${side}_color`]: EditorFieldsType.templateOrType(`watermark.${side}_color`, false, 'color', {
      showIf: wm(on),
      width: availableSpace(),
    }),
  };
};

const EditorFactory = {
  general: (template: boolean) => ({
    flat: true,
    fields: {
      entity: EditorFieldsType.entity('entity', { required: !template }),
      ...(!template && {
        attribute: EditorFieldsType.select('attribute', {
          type: 'attribute',
          selectorOf: 'entity',
          showIf: (c: RawConfig) => Boolean(c.entity),
        }),
        bar_stack_mode: {
          name: 'bar_stack_mode',
          type: 'bar_stack_mode',
          virtual: true,
          showIf: (c: RawConfig) => is.nonEmptyArray(c.bar_stack?.entities),
          resolveVirtual: (c: RawConfig) => c.bar_stack?.mode ?? 'stacked',
          onVirtualChange: (mode: any, config: RawConfig) => ({ ...config, bar_stack: { ...config.bar_stack, mode } }),
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
            unit: EditorFieldsType.text('unit', { width: availableSpace(32, 1 / 3) }),
            // disable_unit is deprecated (see
            // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
            // another hide target, folded into hide by _customizeConfig. The
            // disable_unit check here only matters for a legacy raw config on
            // first load, before that fold has round-tripped through the
            // editor's own config-changed.
            unit_spacing: EditorFieldsType.select('unit_spacing', {
              type: 'unit_spacing',
              width: availableSpace(32, 1 / 3),
              showIf: (c: RawConfig) => !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit'))),
            }),
            decimal: EditorFieldsType.decimal('decimal', { width: availableSpace(32, 1 / 3) }),
            // A 2-state toggle can't represent 3 mutually exclusive modes
            // (standard/entity/ Jinja) — a single-select chip group replaces
            // the previous pair of toggles, which could both show at once and
            // left the mode ambiguous. min_value's config shape is also
            // explicit rather than sniffed: a bare number is the fixed value
            // (legacy, unchanged), and { entity, attribute } / { jinja }
            // replace what used to be a single overloaded string disambiguated
            // at runtime by an is.jinja() regex test. This removes that
            // sniffing entirely and reuses the codebase's existing nested
            // dotted-field machinery (like watermark.*).
            min_value_mode: {
              name: 'min_value_mode',
              type: 'min_value_mode',
              virtual: true,
              resolveVirtual: (c: RawConfig) =>
                is.nonEmptyString(c.min_value?.jinja) ? 'jinja' : is.plainObject(c.min_value) ? 'entity' : 'standard',
              onVirtualChange: (mode: any, config: RawConfig) => {
                if (mode === 'entity') {
                  return {
                    ...config,
                    min_value: is.nonEmptyString(config.min_value?.entity) ? config.min_value : { entity: '' },
                  };
                }
                if (mode === 'jinja') {
                  return {
                    ...config,
                    min_value: is.nonEmptyString(config.min_value?.jinja) ? config.min_value : { jinja: '{{ }}' },
                  };
                }
                return { ...config, min_value: undefined };
              },
            },
            min_value: EditorFieldsType.number('min_value', {
              default: (c: RawConfig) => (c.center_zero ? -100 : 0),
              showIf: (c: RawConfig) => !is.plainObject(c.min_value),
            }),
            [MIN_VALUE_ENTITY_PATH]: EditorFieldsType.entity(MIN_VALUE_ENTITY_PATH, {
              noLabel: true,
              showIf: (c: RawConfig) => is.plainObject(c.min_value) && !is.nonEmptyString(c.min_value.jinja),
            }),
            'min_value.attribute': EditorFieldsType.select('min_value.attribute', {
              type: 'minValueAttribute',
              selectorOf: MIN_VALUE_ENTITY_PATH,
              showIf: (c: RawConfig) => is.plainObject(c.min_value) && is.nonEmptyString(c.min_value.entity),
            }),
            'min_value.jinja': EditorFieldsType.tpl('min_value.jinja', {
              noLabel: true,
              showIf: (c: RawConfig) => is.nonEmptyString(c.min_value?.jinja),
            }),
            // Explicit map shape (mirrors min_value): max_value: 10 | { entity,
            // attribute } | { jinja }. Reuses the codebase's nested
            // dotted-field machinery instead of a target-based flat field, so
            // sibling keys (attribute) merge naturally on write.
            max_value_mode: {
              name: 'max_value_mode',
              type: 'max_value_mode',
              virtual: true,
              resolveVirtual: (c: RawConfig) =>
                is.nonEmptyString(c.max_value?.jinja) ? 'jinja' : is.plainObject(c.max_value) ? 'entity' : 'standard',
              onVirtualChange: (mode: any, config: RawConfig) => {
                if (mode === 'entity') {
                  return {
                    ...config,
                    max_value: is.nonEmptyString(config.max_value?.entity) ? config.max_value : { entity: '' },
                  };
                }
                if (mode === 'jinja') {
                  return {
                    ...config,
                    max_value: is.nonEmptyString(config.max_value?.jinja) ? config.max_value : { jinja: '{{ }}' },
                  };
                }
                return { ...config, max_value: undefined };
              },
            },
            max_value: EditorFieldsType.number('max_value', { showIf: (c: RawConfig) => !is.plainObject(c.max_value) }),
            [MAX_VALUE_ENTITY_PATH]: EditorFieldsType.entity(MAX_VALUE_ENTITY_PATH, {
              noLabel: true,
              showIf: (c: RawConfig) => is.plainObject(c.max_value) && !is.nonEmptyString(c.max_value.jinja),
            }),
            'max_value.attribute': EditorFieldsType.select('max_value.attribute', {
              type: 'maxValueAttribute',
              selectorOf: MAX_VALUE_ENTITY_PATH,
              showIf: (c: RawConfig) => is.plainObject(c.max_value) && is.nonEmptyString(c.max_value.entity),
            }),
            'max_value.jinja': EditorFieldsType.tpl('max_value.jinja', {
              noLabel: true,
              showIf: (c: RawConfig) => is.nonEmptyString(c.max_value?.jinja),
            }),
            state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
            custom_info: EditorFieldsType.tpl('custom_info'),
            // Badge opts out (see YamlSchemaFactory's own
            // .delete(['multiline'])): the row is too small for a second line
            // there.
            ...(!badge ? { multiline: EditorFieldsType.toggle('multiline') } : {}),
            reverse: EditorFieldsType.toggle('reverse', {
              showIf: (c: RawConfig) =>
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
            resolveVirtual: (c: RawConfig) => (is.array(c.custom_theme) ? 'custom' : 'preset'),
            onVirtualChange: (mode: any, config: RawConfig) => {
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
          theme: EditorFieldsType.select('theme', { showIf: (c: RawConfig) => !is.array(c.custom_theme) }),
          custom_theme: {
            name: 'custom_theme',
            type: 'custom_theme_editor',
            showIf: (c: RawConfig) => is.array(c.custom_theme),
            onClear: (config: RawConfig) => {
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
  widthUnless: (condition: any) => (condition ? {} : { width: availableSpace() }),

  // Every themeXxxFields() below is pulled out of theme() itself for the same
  // reason as themeModeFields/widthUnless above: keep each conditional
  // block's own ternaries out of theme()'s cognitive complexity budget.

  themeColorModeFields: (template: boolean) =>
    template
      ? {}
      : {
          bar_color_mode: EditorFieldsType.select('bar_color_mode', {
            showIf: (c: RawConfig) => (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) && !c.center_zero,
            // Selecting a non-auto color mode is incompatible with
            // interpolate: clear it.
            onChange: (value: any, config: RawConfig) =>
              value && value !== 'auto' ? { ...config, interpolate: undefined } : config,
          }),
          interpolate: EditorFieldsType.toggle('interpolate', {
            showIf: (c: RawConfig) =>
              (!is.nullish(c.theme) || is.nonEmptyArray(c.custom_theme)) &&
              (is.nullish(c.bar_color_mode) || c.bar_color_mode === 'auto'),
          }),
        },

  themeCardOnlyFields: (badge: boolean, resetUpIfInvalid: (config: RawConfig) => any) =>
    badge
      ? {}
      : {
          // Half-width once a theme is active, to pair with `icon` once
          // `color` (icon's usual partner) hides.
          icon_animation: EditorFieldsType.select('icon_animation', {
            width: (c: RawConfig) => (!is.nullish(c.theme) || is.array(c.custom_theme) ? availableSpace() : '100%'),
          }),
          force_circular_background: EditorFieldsType.toggle('force_circular_background'),
          bar_position: EditorFieldsType.select('bar_position', {
            width: availableSpace(),
            onChange: (value: any, config: RawConfig) => resetUpIfInvalid(config),
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
            showIf: (c: RawConfig) => c.bar_position === 'overlay',
          }),
          text_shadow: EditorFieldsType.toggle('text_shadow', {
            showIf: (c: RawConfig) => c.bar_position === 'overlay' || c.bar_position === 'background',
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
    const barMaxWidthAllowed = (c: RawConfig) =>
      (c.layout ?? 'horizontal') === 'horizontal' &&
      (c.bar_position ?? 'default') === 'default' &&
      (c.bar_size ?? 'small') !== 'xlarge';
    return {
      bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
        virtual: true,
        showIf: barMaxWidthAllowed,
        resolveVirtual: (c: RawConfig) => Boolean(c.bar_max_width),
        onVirtualChange: (value: any, config: RawConfig) => ({
          ...config,
          bar_max_width: value ? '300px' : undefined,
        }),
      }),
      bar_max_width: EditorFieldsType.slider('bar_max_width', {
        virtual: true,
        // The toggle right above already carries this label ("Bar max
        // width") - repeating it on the slider itself is redundant.
        noLabel: true,
        showIf: (c: RawConfig) => barMaxWidthAllowed(c) && Boolean(c.bar_max_width),
        resolveVirtual: (c: RawConfig) => parseInt(c.bar_max_width) || 0,
        onVirtualChange: (value: any, config: RawConfig) => ({
          ...config,
          bar_max_width: value ? `${value}px` : undefined,
        }),
      }),
    };
  },

  // Not gated on `template` - watermarkSchema is the exact same shape for
  // Card and Template (see YamlSchemaFactory.card/.template), and wmSide's
  // toggle/entity/jinja machinery only ever reads config.watermark.*, so
  // nothing here is Card-specific.
  themeWatermarkFields: () => {
    const wm = (extra?: (c: RawConfig) => boolean) => (c: RawConfig) =>
      Boolean(c.watermark) && (extra ? extra(c) : true);
    return {
      watermark_toggle: EditorFieldsType.toggle('watermark_toggle', {
        virtual: true,
        resolveVirtual: (c: RawConfig) => Boolean(c.watermark),
        onVirtualChange: (value: any, config: RawConfig) => ({
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
        showIf: wm((c: RawConfig) => c.watermark?.type === 'line'),
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
            resolveVirtual: (c: RawConfig) => Boolean(c.alert_when),
            onVirtualChange: (value: any, config: RawConfig) => ({
              ...config,
              alert_when: value ? {} : undefined,
            }),
          }),
          'alert_when.above': EditorFieldsType.number('alert_when.above', {
            showIf: (c: RawConfig) => Boolean(c.alert_when),
            width: availableSpace(),
          }),
          'alert_when.below': EditorFieldsType.number('alert_when.below', {
            showIf: (c: RawConfig) => Boolean(c.alert_when),
            width: availableSpace(),
          }),
          'alert_when.color': EditorFieldsType.select('alert_when.color', {
            type: 'color',
            showIf: (c: RawConfig) => Boolean(c.alert_when),
          }),
          'alert_when.highlight': EditorFieldsType.select('alert_when.highlight', {
            type: 'alert_highlight',
            showIf: (c: RawConfig) => Boolean(c.alert_when),
            width: availableSpace(),
          }),
          // Leaving 'ping' selectable even with highlight: background is
          // intentional - ViewCore.alertAnimation degrades that combination
          // to 'static' rather than doing nothing, same as other
          // invalid-combination fallbacks in this codebase (e.g. bar_scale
          // log outside a valid range).
          'alert_when.animation': EditorFieldsType.select('alert_when.animation', {
            type: 'alert_animation',
            showIf: (c: RawConfig) => Boolean(c.alert_when),
            width: availableSpace(),
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
          height: EditorFieldsType.text('height', { width: availableSpace() }),
        },

  themeLayoutField: (badge: boolean, resetUpIfInvalid: (config: RawConfig) => any) =>
    badge
      ? {}
      : {
          layout: EditorFieldsType.select('layout', {
            onChange: (value: any, config: RawConfig) => resetUpIfInvalid(config),
          }),
        },

  theme: (template: boolean, badge: boolean) => {
    // 'up' only has a visible effect in these two combinations (see
    // HACore#_addBaseClasses's vertical-bar/horizontal-bar decision) - shared
    // by bar_orientation's own dynamic type below and the reset-on-change
    // hooks on bar_position/layout.
    const upAllowed = (c: RawConfig) =>
      (c.layout === 'vertical' && c.bar_position === 'overlay') || c.bar_position === 'background';
    const resetUpIfInvalid = (config: RawConfig) =>
      config.bar_orientation === 'up' && !upAllowed(config) ? { ...config, bar_orientation: 'ltr' } : config;
    return {
      title: 'editor.title.theme',
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...EditorFactory.themeModeFields(template),
        ...EditorFactory.themeColorModeFields(template),
        icon: EditorFieldsType.templateOrType('icon', template, 'icon', template ? {} : { width: availableSpace() }),
        color: EditorFieldsType.templateOrType('color', template, 'color', {
          showIf: (c: RawConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          ...(template ? {} : { width: availableSpace() }),
        }),
        ...EditorFactory.themeCardOnlyFields(badge, resetUpIfInvalid),
        bar_orientation: EditorFieldsType.select('bar_orientation', {
          // Badge/Badge Template have no bar_position/layout, so 'up' is
          // statically excluded there; elsewhere, only offered when upAllowed
          // (see postProcess for the matching runtime reset).
          type: badge
            ? 'bar_orientation_no_up'
            : (c: RawConfig) => (upAllowed(c) ? 'bar_orientation' : 'bar_orientation_no_up'),
          // Half-width everywhere except plain Badge (full-width there).
          ...EditorFactory.widthUnless(badge && !template),
        }),
        bar_size: EditorFieldsType.select('bar_size', {
          ...EditorFactory.badgeRestrictedType(badge, 'bar_size_no_xlarge'),
          // Full-width for Template/Badge Template (bar_color is a Jinja field
          // there, no row partner) or once a theme is active (bar_color hides).
          width: (c: RawConfig) =>
            template || !is.nullish(c.theme) || is.array(c.custom_theme) ? '100%' : availableSpace(),
          // top/bottom/overlay/background all hard-override the bar's own
          // thickness in CSS regardless of bar_size (see ha-card.overlay,
          // .bottom-container/.top-container, ha-card.background).
          showIf: (c: RawConfig) => !['top', 'bottom', 'overlay', 'background'].includes(c.bar_position),
        }),
        bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color', {
          showIf: (c: RawConfig) => is.nullish(c.theme) && !is.array(c.custom_theme),
          // Full-width once bar_size (its row partner) hides for the same
          // bar_position values.
          ...(template
            ? {}
            : {
                width: (c: RawConfig) =>
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
                showIf: (c: RawConfig) => !c.center_zero,
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
          showIf: (c: RawConfig) =>
            (!c.bar_position || c.bar_position === 'default') && (c.layout ?? 'horizontal') === 'horizontal',
        }),
        center_zero: EditorFieldsType.toggle('center_zero', {
          virtual: true,
          showIf: (c: RawConfig) => c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode),
          resolveVirtual: (c: RawConfig) => Boolean(c.center_zero),
          onVirtualChange: (value: any, config: RawConfig) => ({
            ...config,
            center_zero: value ? (is.plainObject(config.center_zero) ? config.center_zero : true) : false,
          }),
        }),
        center_zero_value: EditorFieldsType.number('center_zero_value', {
          target: 'center_zero',
          showIf: (c: RawConfig) =>
            Boolean(c.center_zero) && (c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode)),
          virtual: true,
          resolveVirtual: (c: RawConfig) => (is.plainObject(c.center_zero) ? (c.center_zero.value ?? 0) : 0),
          onVirtualChange: (value: any, config: RawConfig) => {
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
          showIf: (c: RawConfig) =>
            Boolean(c.center_zero) && (c.bar_color_mode === 'auto' || is.nullish(c.bar_color_mode)),
          virtual: true,
          resolveVirtual: (c: RawConfig) =>
            is.plainObject(c.center_zero) ? Boolean(c.center_zero.growth_percent) : false,
          onVirtualChange: (value: any, config: RawConfig) => {
            const currentValue = is.plainObject(config.center_zero) ? (config.center_zero.value ?? 0) : 0;
            return {
              ...config,
              center_zero: currentValue || value ? { value: currentValue, growth_percent: value } : true,
            };
          },
        }),
        bar_effect_jinja: EditorFieldsType.toggle('bar_effect_jinja', {
          virtual: true,
          resolveVirtual: (c: RawConfig) => is.nonEmptyString(c.bar_effect),
          onVirtualChange: (value: any, config: RawConfig) => ({
            ...config,
            bar_effect: value ? '{{ }}' : [],
          }),
        }),
        bar_effect_chips: EditorFieldsType.select('bar_effect_chips', {
          type: 'effect_chips',
          target: 'bar_effect',
          showIf: (c: RawConfig) => !is.nonEmptyString(c.bar_effect),
        }),
        bar_effect: EditorFieldsType.tpl('bar_effect', {
          noLabel: true,
          showIf: (c: RawConfig) => is.nonEmptyString(c.bar_effect),
        }),
        // ── Watermark ────────────────────────────────────────────────────────
        ...EditorFactory.themeWatermarkFields(),
        // ── Badge fields ─────────────────────────────────────────────────────
        ...EditorFactory.themeBadgeIconColorFields(badge),
        // ── Hide ─────────────────────────────────────────────────────────────
        hide_jinja: EditorFieldsType.toggle('hide_jinja', {
          virtual: true,
          resolveVirtual: (c: RawConfig) => is.nonEmptyString(c.hide),
          onVirtualChange: (value: any, config: RawConfig) => ({
            ...config,
            hide: value ? '{{ }}' : [],
          }),
        }),
        hide_chips: EditorFieldsType.select('hide_chips', {
          type: 'hide_chips',
          target: 'hide',
          showIf: (c: RawConfig) => !is.nonEmptyString(c.hide),
          // Template/BadgeTemplate schemas reject 'unit' (see
          // YamlSchemaFactory.template) - no separate unit field there, the
          // value comes straight from Jinja `percent`.
          ...(template ? { items: ['icon', 'name', 'value', 'secondary_info', 'progress_bar'] } : {}),
        }),
        hide: EditorFieldsType.tpl('hide', { noLabel: true, showIf: (c: RawConfig) => is.nonEmptyString(c.hide) }),
        ...EditorFactory.themeAlertFields(template),
        // ── Card-only layout options ──────────────────────────────────────
        ...EditorFactory.themeCardLayoutFields(badge),
        // Not gated on `badge` - valid for badges too (not in
        // YamlSchemaFactory.badge's delete list), unlike its former neighbors
        // above.
        min_width: EditorFieldsType.text('min_width', EditorFactory.widthUnless(badge)),
        // ── Layout (always last) ──────────────────────────────────────────
        ...EditorFactory.themeLayoutField(badge, resetUpIfInvalid),
      },
    };
  },

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
    const isActive = (key: string) => (_: RawConfig, n: Config) => n?.[key]?.action !== 'none';
    const orAll = (pred: (c: RawConfig, n: Config) => boolean) => (c: RawConfig, n: Config) =>
      Boolean(c._show_all_actions) || pred(c, n);
    return {
      title: 'editor.title.interaction',
      icon: HA_CONTEXT.icons.gestureTapHold,
      fields: {
        show_all_actions: {
          name: 'show_all_actions',
          type: 'toggle',
          virtual: true,
          resolveVirtual: (c: RawConfig) => Boolean(c._show_all_actions),
          onVirtualChange: (value: any, config: RawConfig) => ({ ...config, _show_all_actions: value }),
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
    interactions: EditorFactory.interactions(badge),
  }),
};

export { field };
export { EditorFieldsType };
export { wmSide };
export { EditorFactory };
