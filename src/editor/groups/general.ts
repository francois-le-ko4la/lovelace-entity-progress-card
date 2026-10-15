import { HA_CONTEXT } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { HassProviderSingleton } from '../../utils/hass-provider.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { schemaOptions, type SchemaVariant } from '../../card/config/schema.js';
import { domainProfile } from '../../card/values/ha-state.js';
import {
  EditorFieldsType,
  LABEL_ATTRIBUTE,
  effectiveEntity,
  TITLE,
  LABEL_POSITION,
  HIDE_DISPLAY_ORDER,
} from '../fields/base.js';
import { multilineField } from '../fields/misc.js';
import { valueRangeFields } from '../fields/value.js';

const general = (template: boolean) => ({
  flat: true,
  fields: {
    entity: EditorFieldsType.entity('entity', { labelKey: 'shared.ent', required: !template }),
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
        labelKey: LABEL_ATTRIBUTE,
        showIf: (c: LovelaceConfig) => Boolean(effectiveEntity(c)),
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
});

const content = (template: boolean, badge: boolean) => ({
  title: TITLE.content,
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
          ...multilineField(badge),
          percent: EditorFieldsType.tpl('percent'),
        }
      : {
          ...(() => {
            // disable_unit is deprecated (see
            // BaseConfigHelper.#logDeprecatedOption): 'unit' is now just
            // another hide target, folded into hide by _customizeConfig.
            // The disable_unit check here only matters for a legacy raw
            // config on first load, before that fold has round-tripped
            // through the editor's own config-changed.
            const unitSpacingShown = (c: LovelaceConfig) =>
              !(c.disable_unit || (is.array(c.hide) && c.hide.includes('unit')));
            return {
              decimal: EditorFieldsType.decimal('decimal', {
                width: 'half',
                placeholder: (_c: LovelaceConfig, neg: Config) =>
                  neg?.resolvedDecimal == null ? '' : String(neg.resolvedDecimal),
              }),
              unit: EditorFieldsType.text('unit', {
                width: 'half',
                placeholder: (_c: LovelaceConfig, neg: Config) => (neg?.resolvedUnit as string) ?? '',
              }),
              unit_position: EditorFieldsType.select('unit_position', {
                type: 'unit_position',
                labelKey: LABEL_POSITION,
                width: 'half',
                showIf: unitSpacingShown,
              }),
              unit_spacing: EditorFieldsType.select('unit_spacing', {
                type: 'unit_spacing',
                width: 'half',
                showIf: unitSpacingShown,
              }),
            };
          })(),
          value_compact: EditorFieldsType.toggle('value_compact'),
          value_sign: EditorFieldsType.toggle('value_sign'),
          ...valueRangeFields(),
          state_content: EditorFieldsType.stateContent('state_content', { context: { filter_entity: 'entity' } }),
          custom_info: EditorFieldsType.tpl('custom_info', {
            helper: true,
          }),
          ...multilineField(badge),
          reverse: EditorFieldsType.toggle('reverse', {
            showIf: (c: LovelaceConfig) => {
              const entity = effectiveEntity(c);
              return (
                entity !== undefined && domainProfile(HassProviderSingleton.getEntityDomain(entity)).kind === 'timer'
              );
            },
          }),
        }),
  },
});

// Template rejects 'unit'; Badge/BadgeTemplate lack 'shape' (see schema.ts).
// The set is the schema's own hide list for that variant - only the order is
// the editor's: shape sits next to the icon it draws behind, not last where
// it happened to be appended.
const hideChipsItems = (variant: SchemaVariant): string[] => {
  const allowed = new Set(schemaOptions(variant, 'hide'));
  return HIDE_DISPLAY_ORDER.filter((item) => allowed.has(item));
};

// `iconActions`: the icon's own gestures, and the "+" picker entries that
// would offer them back. Off for a badge, and for a Multi Feature row whose
// icon is a few pixels wide (YamlSchemaFactory.multiFeatureRow drops them
// from its schema too).
const interactions = (badge: boolean, iconActions = !badge) => {
  // isActive: negotiated action differs from 'none'. isRevealed: manually
  // added via the "+" picker (_visible_actions, ephemeral UI state).
  // Boolean(...) guard: resolveVirtual below only has raw config, where an
  // untouched key is absent (undefined !== 'none' would read as "active").
  const isActive = (key: string) => (_: LovelaceConfig, n: Config) =>
    Boolean(n?.[key]?.action) && n[key].action !== 'none';
  const isRevealed = (key: string) => (c: LovelaceConfig) =>
    is.array(c._visible_actions) && c._visible_actions.includes(key);
  const isShown = (key: string) => (c: LovelaceConfig, n: Config) => isRevealed(key)(c) || isActive(key)(c, n);
  const optionalKeys = iconActions
    ? ['hold_action', 'double_tap_action', 'icon_hold_action', 'icon_double_tap_action']
    : ['hold_action', 'double_tap_action'];
  // Hidden = neither active nor revealed. n defaults to c: resolveVirtual
  // has no negotiated, unlike showIf.
  const hiddenKeys = (c: LovelaceConfig, n: Config = c as unknown as Config) =>
    optionalKeys.filter((k) => !isShown(k)(c, n));
  return {
    title: TITLE.interaction,
    icon: HA_CONTEXT.icons.gestureTapHold,
    fields: {
      tap_action: EditorFieldsType.action('tap_action', { labelKey: 'action.tap' }),
      hold_action: EditorFieldsType.action('hold_action', {
        labelKey: 'action.hold',
        showIf: isShown('hold_action'),
      }),
      double_tap_action: EditorFieldsType.action('double_tap_action', {
        labelKey: 'action.double_tap',
        showIf: isShown('double_tap_action'),
      }),
      ...(iconActions
        ? {
            icon_tap_action: EditorFieldsType.action('icon_tap_action', { labelKey: 'action.icon_tap' }),
            icon_hold_action: EditorFieldsType.action('icon_hold_action', {
              labelKey: 'action.icon_hold',
              showIf: isShown('icon_hold_action'),
            }),
            icon_double_tap_action: EditorFieldsType.action('icon_double_tap_action', {
              labelKey: 'action.icon_double_tap',
              showIf: isShown('icon_double_tap_action'),
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
          visible: is.array(c._visible_actions) ? c._visible_actions : [],
          hidden: hiddenKeys(c),
        }),
        onVirtualChange: (value: string[], config: LovelaceConfig) => ({ ...config, _visible_actions: value }),
      },
    },
  };
};

export { general, content, hideChipsItems, interactions };
