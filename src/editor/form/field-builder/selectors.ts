import { is } from '../../../utils/common-checks.js';
import { type LovelaceConfig } from '../../../utils/types.js';
import { lengthSliderSelector, lengthUnitSelector } from '../../../utils/length.js';
import { durationSliderSelector } from '../../../utils/duration.js';
import {
  markInner,
  entityOf,
  schemaOptions,
  type WatermarkMark,
  type ValueConfig,
} from '../../../card/config/schema.js';
import { effectiveEntity } from '../../factory.js';
import { SELECT_TYPES, type SchemaLookup } from '../select-types.js';

// watermark.low/.high can be a bare {entity,...} or wrap it one level
// deeper ({value: {entity,...}, as, type, opacity, color}) - unwrap before
// reading .entity, same shape as types.watermarkMark elsewhere.
function watermarkEntity(mark: unknown): string {
  const entity = entityOf(markInner(mark as WatermarkMark) as ValueConfig);
  return is.nonEmptyString(entity) ? entity : '';
}

// `options`: the translated option labels, group -> value -> label.
const selectorForType = (
  type: string,
  config: LovelaceConfig,
  options: Record<string, Record<string, string>>,
): Record<string, unknown> => {
  const buildSelect = (opts: Record<string, string>) => ({
    select: { options: Object.entries(opts).map(([value, label]) => ({ value, label })), mode: 'dropdown' },
  });

  const buildBoxSelect = (
    opts: Record<string, string>,
    imageFn: ((value: string) => Record<string, unknown>) | null = null,
  ) => ({
    // see
    // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
    select: {
      mode: 'box',
      options: Object.entries(opts).map(([value, label]) => ({
        value,
        label,
        ...(imageFn ? { image: imageFn(value) } : {}),
      })),
    },
  });
  // Shared by every "narrower select" below (a schema variant rejecting
  // some enum members) - keeps just the given keys, same translated labels.
  const pickOptions = (source: Record<string, string>, keys: readonly string[]): Record<string, string> =>
    Object.fromEntries(keys.map((key) => [key, source[key]]));
  const tileImage = (value: string) => ({
    // see
    // https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/config-elements/hui-tile-card-editor.ts#L158
    src: `/static/images/form/tile_content_layout_${value}.svg`,
    src_dark: `/static/images/form/tile_content_layout_${value}_dark.svg`,
    flip_rtl: true,
  });

  const selectors: Record<string, () => Record<string, unknown>> = {
    text: () => ({ text: { mode: 'box' } }),
    entity: () => ({ entity: {} }),
    entity_name: () => ({ entity_name: {} }),
    state_content: () => ({ ui_state_content: { allow_context: true } }),
    attribute: () => ({ attribute: { entity_id: effectiveEntity(config) ?? '' } }),
    maxValueAttribute: () => ({ attribute: { entity_id: entityOf(config.max_value) ?? '' } }),
    minValueAttribute: () => ({ attribute: { entity_id: entityOf(config.min_value) ?? '' } }),
    number: () => ({ number: {} }),
    decimal: () => ({ number: { min: 0, max: 10, mode: 'box' } }),
    opacity: () => ({ number: { min: 0, max: 1, step: 0.05, mode: 'box' } }),
    slider: () => ({ number: { min: 0, max: 300, step: 1, mode: 'slider', unit_of_measurement: 'px' } }),
    // Below 2, buildSegmentCells never builds any cell - same
    // floor as its own count >= 2 check.
    bar_segments: () => ({ number: { min: 2, max: 10, step: 1, mode: 'box' } }),
    degrees: () => ({ number: { min: 0, max: 360, step: 1, mode: 'box', unit_of_measurement: '°' } }),
    template: () => ({ template: {} }),
    toggle: () => ({ boolean: {} }),
    action: () => ({ 'ui-action': {} }),
    icon: () => ({ icon: { icon_set: ['mdi'] } }),
    color: () => ({ 'ui-color': {} }),
    // icon/bar color only: left unset, both fall back to the entity's own
    // state color (EntityHelper.defaultColor), so the picker names that
    // fallback as "State (Default)" instead of showing an empty box.
    // Picking it writes `state`, which postProcess drops back to unset -
    // the fallback is per-domain and dynamic, not a value we could store.
    color_state_default: () => ({ 'ui-color': { include_state: true, default_color: 'state' } }),
    default: () => ({ text: { mode: 'box' } }),
    // The one select whose options carry an image, hence not in SELECT_TYPES.
    layout: () => buildBoxSelect(options.layout, tileImage),
    // watermark.low/.high can be a bare {entity,...} or wrap it one level
    // deeper ({value: {entity,...}, as, type, opacity, color}) - unwrap
    // before reading .entity, same shape as types.watermarkMark elsewhere.
    watermarkLowAttribute: () => ({
      attribute: { entity_id: watermarkEntity(config?.watermark?.low) },
    }),
    watermarkHighAttribute: () => ({
      attribute: { entity_id: watermarkEntity(config?.watermark?.high) },
    }),
  };

  // "length" fields (min_width…): a number+unit composite. The slider's
  // range/step/unit follow the current value's unit (see length.ts); the unit
  // list depends on the card type, encoded in the type string by the factory.
  if (type.startsWith('length:')) return lengthSliderSelector(config[type.slice('length:'.length)]);
  if (type.startsWith('lengthUnit:')) return lengthUnitSelector(type.slice('lengthUnit:'.length).split(','));
  // peak_marker.window: the unit is baked into the type string by the
  // factory's own type() function (config-derived, unlike length: above).
  if (type.startsWith('duration:')) return durationSliderSelector(type.slice('duration:'.length));

  const selectSpec = SELECT_TYPES[type];
  if (selectSpec) {
    const [group, source] = is.string(selectSpec) ? [selectSpec, null] : selectSpec;
    const lookup = source && !is.array(source) ? (source as SchemaLookup) : null;
    const keys = lookup ? schemaOptions(lookup.variant, lookup.field) : (source as readonly string[] | null);
    return buildSelect(keys ? pickOptions(options[group], keys) : options[group]);
  }

  return (selectors[type] ?? (() => ({ text: {} })))();
};

export { selectorForType };
