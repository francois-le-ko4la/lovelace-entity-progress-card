import { ALERT_ABOVE_ENTITY_PATH, ALERT_BELOW_ENTITY_PATH } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { statusLabelObj, rewrapStatusLabel, HAS_EFFECT, BAR_AROUND_ICON } from '../../card/config/schema.js';
import { resolveCenterZero } from '../../card/config/config-helpers.js';
import { nestedValueField } from './value.js';
import {
  isAlertSimple,
  enabledToggleField,
  draftToggle,
  EditorFieldsType,
  DENSITY_SINGLE_ROW,
  writeCenterZero,
} from './base.js';

const alertField = (side: 'above' | 'below') => {
  const entityPath = side === 'above' ? ALERT_ABOVE_ENTITY_PATH : ALERT_BELOW_ENTITY_PATH;
  return nestedValueField('alert_when', side, entityPath, isAlertSimple);
};

// Shared master on/off toggle - same draft precedent as status_label_toggle.
const alertToggleField = () => ({
  ...enabledToggleField(
    'alert_when.toggle',
    (c) => Boolean(c.alert_when),
    draftToggle('alert_when', () => ({})),
    { noLabel: true },
  ),
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

// Auto (the domain's own shape) vs always Forced - an Auto/Forced pill
// rather than a switch, like every other master toggle. Its own field so
// theme() and buildMulti() share one definition.
const circularBackgroundField = () => ({
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
});

// center_zero: boolean | {value, growth_percent} - shared by theme() and
// Feature's own build below, no template/badge distinction needed.
// Badge and badgeTemplate opt out (see YamlSchemaFactory's own
// .delete(['multiline'])): the row is too small for a second line there.
// density: compact/single_line clear it too (see schema.ts's applyDensityRule).
const multilineField = (badge: boolean) =>
  badge
    ? {}
    : {
        multiline: EditorFieldsType.toggle('multiline', {
          showIf: (c: LovelaceConfig) => !DENSITY_SINGLE_ROW.includes(c.density as string),
        }),
      };

const centerZeroFields = () => ({
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
    resolveVirtual: (c: LovelaceConfig) => resolveCenterZero(c.center_zero).zeroValue,
    onVirtualChange: (value: number, config: LovelaceConfig) =>
      writeCenterZero(config, Number(value) || 0, resolveCenterZero(config.center_zero).growthPercent),
  }),
  center_zero_growth_percent: EditorFieldsType.toggle('center_zero_growth_percent', {
    target: 'center_zero',
    showIf: (c: LovelaceConfig) => Boolean(c.center_zero),
    virtual: true,
    resolveVirtual: (c: LovelaceConfig) => resolveCenterZero(c.center_zero).growthPercent,
    onVirtualChange: (value: boolean, config: LovelaceConfig) =>
      writeCenterZero(config, resolveCenterZero(config.center_zero).zeroValue, value),
  }),
});

const barScaleField = () => ({
  bar_scale: EditorFieldsType.select('bar_scale', { width: 'half', showIf: (c: LovelaceConfig) => !c.center_zero }),
});

const barSegmentsField = () => ({
  bar_segments: EditorFieldsType.number('bar_segments', {
    type: 'bar_segments',
    width: 'half',
    showIf: HAS_EFFECT.barSegments,
  }),
});

const barRingFields = () => {
  const field = (key: 'start' | 'gap') => ({
    [`bar_ring.${key}`]: EditorFieldsType.number(`bar_ring.${key}`, {
      type: 'degrees',
      labelKey: `bar_ring_${key}`,
      width: 'half',
      showIf: (c: LovelaceConfig) => c.bar_position === BAR_AROUND_ICON,
    }),
  });
  return { ...field('start'), ...field('gap') };
};

// Virtual: status_label's bare-string shorthand is past what the generic
// dot-path machinery reads (see statusLabelObj/rewrapStatusLabel, schema.ts).
const statusLabelField = (
  key: 'jinja' | 'position' | 'color_source',
  fallback: string,
  opts: Record<string, unknown>,
) => {
  const name = `status_label.${key}`;
  return {
    [name]: {
      name,
      virtual: true,
      showIf: (c: LovelaceConfig) => Boolean(c.status_label),
      resolveVirtual: (c: LovelaceConfig) => statusLabelObj(c.status_label)[key] ?? fallback,
      onVirtualChange: (value: string, config: LovelaceConfig) => {
        const patch: Partial<Record<typeof key, string>> = {};
        patch[key] = value;
        return { ...config, status_label: rewrapStatusLabel(config.status_label, patch) };
      },
      ...opts,
    },
  };
};

export {
  alertField,
  alertToggleField,
  alertModeField,
  circularBackgroundField,
  multilineField,
  centerZeroFields,
  barScaleField,
  barSegmentsField,
  barRingFields,
  statusLabelField,
};
