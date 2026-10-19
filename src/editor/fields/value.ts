import { CARD, MIN_VALUE_ENTITY_PATH, MAX_VALUE_ENTITY_PATH } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig, type Config } from '../../utils/types.js';
import { ownRangeOf } from '../../card/values/entity-helper.js';
import { ProgressMath } from '../../card/view/progress-math.js';
import { parseDuration, serializeDuration } from '../../utils/duration.js';
import {
  entityOf,
  attributeOf,
  jinjaOf,
  isMarkOverride,
  markInner,
  type ValueConfig,
  type WatermarkMark,
} from '../../card/config/schema.js';
import { toCamel, SHARED_VALUE_LABEL, EditorFieldsType, LABEL_ATTRIBUTE } from './base.js';

type ValueSource = 'standard' | 'entity' | 'jinja';

const valueSourceOf = (value: unknown): ValueSource => {
  if (!is.plainObject(value)) return 'standard';
  return is.nonEmptyString(jinjaOf(value as ValueConfig)) ? 'jinja' : 'entity';
};

// Standard/entity/Jinja: a 2-state toggle can't express three mutually
// exclusive shapes of one value (min_value/max_value below, watermark.low/
// high and alert_when.above/below via nestedValueField). The mode left
// behind is stashed in its own `_..._draft` key and restored when
// re-entered; `read`/`write` are the only per-call-site difference.
const valueModeField = (
  modeType: string,
  read: (c: LovelaceConfig) => unknown,
  write: (c: LovelaceConfig, value: unknown) => Record<string, unknown>,
  draftPrefix: string,
  opts: { showIf?: (c: LovelaceConfig) => boolean; standardDefault?: number } = {},
) => {
  const numberDraftKey = `_${draftPrefix}_number_draft`;
  const entityDraftKey = `_${draftPrefix}_entity_draft`;
  const jinjaDraftKey = `_${draftPrefix}_jinja_draft`;
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      ...(opts.showIf && { showIf: opts.showIf }),
      resolveVirtual: (c: LovelaceConfig) => valueSourceOf(read(c)),
      onVirtualChange: (mode: ValueSource, config: LovelaceConfig) => {
        const current = read(config);
        const source = valueSourceOf(current);
        // Whatever `current` already is gets stashed into its own draft
        // slot before switching away - the mode not being entered keeps (or
        // refreshes) its draft, the one being entered consumes its own.
        const numberDraft = is.number(current) ? current : config[numberDraftKey];
        const entityDraft = source === 'entity' ? current : config[entityDraftKey];
        const jinjaDraft = source === 'jinja' ? jinjaOf(current as ValueConfig) : config[jinjaDraftKey];
        if (mode === 'entity') {
          return {
            ...config,
            ...write(config, entityDraft ?? { entity: '' }),
            [numberDraftKey]: numberDraft,
            [entityDraftKey]: undefined,
            [jinjaDraftKey]: jinjaDraft,
          };
        }
        if (mode === 'jinja') {
          return {
            ...config,
            ...write(config, jinjaDraft ? { jinja: jinjaDraft } : { jinja: '{{ }}' }),
            [numberDraftKey]: numberDraft,
            [jinjaDraftKey]: undefined,
            [entityDraftKey]: entityDraft,
          };
        }
        return {
          ...config,
          ...write(config, numberDraft ?? opts.standardDefault),
          [numberDraftKey]: undefined,
          [entityDraftKey]: entityDraft,
          [jinjaDraftKey]: jinjaDraft,
        };
      },
    },
  };
};

// What the card draws from when min_value/max_value is unset: the entity's own
// range (input_number, number, counter, through the card's own ownRangeOf and
// ProgressMath.ownRangeMin), else the negotiated config's (center_zero moves
// the default min to -max), else the card's default.
const unsetBoundOf = (config: LovelaceConfig, negotiated: Config, key: 'min_value' | 'max_value'): number => {
  const side = key === 'min_value' ? 'min' : 'max';
  const negotiatedBound = negotiated?.[key];
  const fallback = is.number(negotiatedBound) ? negotiatedBound : CARD.config.value[side];
  const own = ownRangeOf(config.entity);
  if (!own) return fallback;
  const bound =
    side === 'max'
      ? own.max
      : ProgressMath.ownRangeMin(
          own.min,
          is.number(config.max_value) ? config.max_value : unsetBoundOf(config, negotiated, 'max_value'),
          negotiated?.centerZero ?? { enabled: false, zeroValue: 0 },
        );
  return is.number(bound) ? bound : fallback;
};

const valueField = (key: 'min_value' | 'max_value', entityPath: string) => {
  const modeType = `${key}_mode`;
  const attrType = `${toCamel(key)}Attribute`;
  const modeFields = valueModeField(
    modeType,
    (c) => c[key],
    (_config, v) => ({ [key]: v }),
    key,
  );
  return {
    ...modeFields,
    // The source selector carries the option name; the inputs under it are the
    // same value read three ways, so they go unlabelled like the entity one.
    [modeType]: { ...modeFields[modeType], labelKey: SHARED_VALUE_LABEL[key] },
    [key]: EditorFieldsType.number(key, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'standard',
      // Empty until the user types one: the greyed hint is the range in use.
      placeholder: (c: LovelaceConfig, negotiated: Config) => String(unsetBoundOf(c, negotiated, key)),
      virtual: true,
      resolveVirtual: (c: LovelaceConfig) => (is.number(c[key]) ? c[key] : ''),
      onVirtualChange: (value: number | '', config: LovelaceConfig) => ({
        ...config,
        [key]: is.number(value) ? value : undefined,
      }),
    }),
    [entityPath]: EditorFieldsType.entity(entityPath, {
      noLabel: true,
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'entity',
    }),
    [`${key}.attribute`]: EditorFieldsType.select(`${key}.attribute`, {
      type: attrType,
      selectorOf: entityPath,
      labelKey: LABEL_ATTRIBUTE,
      showIf: (c: LovelaceConfig) => is.nonEmptyString(entityOf(c[key])),
    }),
    [`${key}.jinja`]: EditorFieldsType.tpl(`${key}.jinja`, {
      noLabel: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => valueSourceOf(c[key]) === 'jinja',
    }),
  };
};

const valueRangeFields = () => ({
  ...valueField('min_value', MIN_VALUE_ENTITY_PATH),
  ...valueField('max_value', MAX_VALUE_ENTITY_PATH),
});

// Shared by watermark.low/high and alert_when.above/below.
const nestedValueField = (
  parentKey: string,
  key: string,
  entityPath: string,
  isEnabled: (c: LovelaceConfig) => boolean,
  defaultVal?: number,
  nestedUnder?: string,
  // eslint-disable-next-line max-params -- 4 required + 2 defaulted trailing.
) => {
  // Dot form: slots this virtual field's own translation next to its sibling
  // low_toggle/above, same parentKey.key group - not an untied flat key.
  const modeType = `${parentKey}.${key}_mode`;
  const attrType = `${toCamel(`${parentKey}_${key}`)}Attribute`;
  const entityFieldName = `${parentKey}.${key}_entity`;
  // readValue/writeValue: with nestedUnder (watermark.low/.high - the value
  // sits one level deeper than alert_when.above/.below's, wrapped alongside
  // as/opacity/color siblings, see types.watermarkMark), a short-form value
  // (no wrapper) still reads fine, but every write settles into the wrapped
  // form from then on, preserving whatever siblings already exist.
  // markInner/isMarkOverride (not a bare nestedUnder-in-raw check): the only
  // real caller here is watermark, and an override object with no `value` set
  // yet (type/color touched first) must still read/write as one - see
  // schema.ts's own isMarkOverride comment for why the naive check broke it.
  const readValue = (c: LovelaceConfig): ValueConfig => {
    const raw = c[parentKey]?.[key];
    if (!nestedUnder) return raw;
    return markInner(raw as WatermarkMark) as ValueConfig;
  };
  const writeValue = (c: LovelaceConfig, newValue: unknown) => {
    if (!nestedUnder) return { ...c[parentKey], [key]: newValue };
    const raw = c[parentKey]?.[key];
    const wrapper = isMarkOverride(raw as WatermarkMark) ? raw : {};
    return { ...c[parentKey], [key]: { ...wrapper, [nestedUnder]: newValue } };
  };
  const source = (c: LovelaceConfig) => valueSourceOf(readValue(c));
  return {
    ...valueModeField(modeType, readValue, (c, v) => ({ [parentKey]: writeValue(c, v) }), `${parentKey}_${key}`, {
      showIf: isEnabled,
      standardDefault: defaultVal,
    }),
    [`${parentKey}.${key}`]: EditorFieldsType.number(`${parentKey}.${key}`, {
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'standard',
      // defaultVal is only ever a real number for watermark (alert_when's own
      // above/below have none) - shows once the mark has no explicit value.
      ...(is.number(defaultVal) && { placeholder: () => String(defaultVal) }),
      // nestedUnder only: parentKey.key is now 2 levels past the value (see
      // writeValue) - past what the generic dot-path field resolves, so this
      // goes through the same virtual read/write as every other field here.
      ...(nestedUnder && {
        virtual: true,
        resolveVirtual: (c: LovelaceConfig) => (is.number(readValue(c)) ? readValue(c) : ''),
        onVirtualChange: (value: number, config: LovelaceConfig) => ({
          ...config,
          [parentKey]: writeValue(config, value),
        }),
      }),
    }),
    [entityFieldName]: EditorFieldsType.entity(entityFieldName, {
      virtual: true,
      noLabel: true,
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'entity',
      resolveVirtual: (c: LovelaceConfig) => entityOf(readValue(c)) ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, value ? { ...(readValue(config) as object), entity: value } : defaultVal),
      }),
    }),
    [`${parentKey}.${key}_attribute`]: EditorFieldsType.select(`${parentKey}.${key}_attribute`, {
      type: attrType,
      virtual: true,
      selectorOf: entityPath,
      labelKey: LABEL_ATTRIBUTE,
      showIf: (c: LovelaceConfig) =>
        isEnabled(c) && source(c) === 'entity' && is.nonEmptyString(entityOf(readValue(c))),
      resolveVirtual: (c: LovelaceConfig) => attributeOf(readValue(c)) ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, { ...(readValue(config) as object), attribute: value || undefined }),
      }),
    }),
    // Virtual (not a plain dot-path field): the template string lives 2 levels
    // deep (<parentKey>.<key>.jinja, one more with nestedUnder), past what the
    // generic nested-field machinery (#resolveValue/#handleNestedField)
    // resolves — this reads/writes that path directly.
    [`${parentKey}_${key}_jinja`]: EditorFieldsType.tpl(`${parentKey}_${key}_jinja`, {
      noLabel: true,
      virtual: true,
      helper: true,
      helperKey: 'returns_number',
      showIf: (c: LovelaceConfig) => isEnabled(c) && source(c) === 'jinja',
      resolveVirtual: (c: LovelaceConfig) => jinjaOf(readValue(c)) ?? '',
      onVirtualChange: (value: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: writeValue(config, { jinja: value }),
      }),
    }),
  };
};

// A duration string ("2h") nested one level under parentKey, as a
// number+unit composite - same slider+dropdown split as lengthField, minus
// the calc()/custom fallback (types.duration only ever produces this shape).
// Shared by peak_marker.window (required) and trend_indicator.window
// (optional, gated by its own reveal toggle) - showIf decides which.
const durationFields = (parentKey: string, key: string, showIf: (c: LovelaceConfig) => boolean) => {
  const fullKey = `${parentKey}.${key}`;
  const parsed = (c: LovelaceConfig) => parseDuration(c[parentKey]?.[key]);
  return {
    [fullKey]: {
      name: fullKey,
      type: (c: LovelaceConfig) => `duration:${parsed(c).unit}`,
      virtual: true,
      labelKey: 'window',
      width: 'grow',
      showIf,
      resolveVirtual: (c: LovelaceConfig) => parsed(c).value,
      onVirtualChange: (value: number, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: serializeDuration(value, parsed(config).unit) },
      }),
    },
    [`${fullKey}_unit`]: {
      name: `${fullKey}_unit`,
      type: 'duration_unit',
      virtual: true,
      noLabel: true,
      required: true,
      isInGroup: 'length-unit',
      width: '90px',
      showIf,
      resolveVirtual: (c: LovelaceConfig) => parsed(c).unit,
      onVirtualChange: (unit: string, config: LovelaceConfig) => ({
        ...config,
        [parentKey]: { ...config[parentKey], [key]: serializeDuration(parsed(config).value, unit) },
      }),
    },
  };
};

// Simple (array) vs Advanced (Jinja string) toggle, shared by bar_effect_mode
// and hide_mode below - restores whichever shape was left behind via its own
// draft.
const arrayOrJinjaModeField = (key: string) => {
  const modeType = `${key}_mode`;
  const arrayDraftKey = `_${key}_array_draft`;
  const jinjaDraftKey = `_${key}_jinja_draft`;
  return {
    [modeType]: {
      name: modeType,
      type: modeType,
      virtual: true,
      resolveVirtual: (c: LovelaceConfig) => (is.nonEmptyString(c[key]) ? 'advanced' : 'simple'),
      onVirtualChange: (mode: 'simple' | 'advanced', config: LovelaceConfig) => {
        const current = config[key];
        const arrayDraft = is.array(current) ? current : config[arrayDraftKey];
        const jinjaDraft = is.nonEmptyString(current) ? current : config[jinjaDraftKey];
        return {
          ...config,
          [key]: mode === 'advanced' ? jinjaDraft || '{{ }}' : (arrayDraft ?? []),
          [arrayDraftKey]: mode === 'advanced' ? arrayDraft : undefined,
          [jinjaDraftKey]: mode === 'advanced' ? undefined : jinjaDraft,
        };
      },
    },
  };
};

export { valueRangeFields, nestedValueField, durationFields, arrayOrJinjaModeField };
