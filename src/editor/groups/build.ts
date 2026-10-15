import { HA_CONTEXT } from '../../utils/parameters.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { HAS_EFFECT } from '../../card/config/schema.js';
import {
  gateOnHide,
  EditorFieldsType,
  TITLE,
  LABEL_COLOR,
  LABEL_POSITION,
  dropFields,
  MARKER_SECTIONS,
  FEATURE_ROW_DROPPED_SECTIONS,
} from '../fields/base.js';
import { general, content, interactions } from './general.js';
import { theme, themeModeFields, themeColorModeFields, themeActive, barEffectFields } from './theme.js';
import { markers, markerPanels, peakMarkerFields } from './markers.js';
import { layout } from './layout.js';
import { valueRangeFields } from '../fields/value.js';
import { barSegmentsField, barScaleField, centerZeroFields } from '../fields/misc.js';

// Named at this one external entry point (editors.ts) so a call site reads
// as a card variant, not two opaque booleans - every internal helper below
// keeps taking plain template/badge booleans, unchanged.
const build = ({ template, badge }: { template: boolean; badge: boolean }) =>
  gateOnHide({
    general: general(template),
    content: content(template, badge),
    theme: theme(template, badge),
    ...markers(template, badge),
    interactions: interactions(badge),
    // Last on purpose: the card's own frame and sizing, after everything
    // that fills it.
    layout: layout(badge),
  });

// Feature's own schema (YamlSchemaFactory.feature) has none of Card's
// name/hide/actions/layout fields - built from the same shared field
// helpers instead of reusing Card's own template/badge-shaped sections.
const buildFeature = () => {
  const generalFields = general(false);
  // Defaults to the parent Tile's own entity at runtime (see
  // EntityProgressFeatures's `set context`) - only override to show another.
  const entity = EditorFieldsType.entity('entity', {
    labelKey: 'shared.ent',
    required: false,
    helper: true,
    helperKey: 'feature_entity',
  });
  return {
    general: { ...generalFields, fields: { ...generalFields.fields, entity } },
    content: {
      title: TITLE.content,
      icon: HA_CONTEXT.icons.textShort,
      fields: valueRangeFields(),
    },
    theme: {
      title: TITLE.theme,
      icon: HA_CONTEXT.icons.listBox,
      fields: {
        ...themeModeFields(false),
        ...themeColorModeFields(false),
        bar_color: EditorFieldsType.templateOrType('bar_color', false, 'color_state_default', {
          labelKey: LABEL_COLOR,
          showIf: (c: LovelaceConfig) => !themeActive(c),
          width: 'half',
        }),
        bar_orientation: EditorFieldsType.select('bar_orientation', {
          type: 'bar_orientation_no_up',
          width: 'half',
        }),
        bar_size: EditorFieldsType.select('bar_size', { width: 'half', showIf: HAS_EFFECT.barSize }),
        bar_position: EditorFieldsType.select('bar_position', {
          type: 'bar_position_feature',
          labelKey: LABEL_POSITION,
          width: 'half',
        }),
        ...barSegmentsField(),
        ...barScaleField(),
        ...centerZeroFields(),
        ...barEffectFields(),
      },
    },
    ...markerPanels(peakMarkerFields()),
  };
};

// Hand-composed like buildFeature() above, and for the same reason: the
// Multi's schema is card-shaped but drops whole families of fields (layout,
// frame, Jinja text - see YamlSchemaFactory.multiRow), so reusing build()'s
// own sections would offer options its schema rejects on save. Every field
// here comes from the same shared helpers the card uses, never a copy.
// What is NOT here is deliberate: the per-row options live in the rows list
// (see EntityProgressMultiRowEditor), everything at this level is a shared
// default a row may override.
// The aggregator's own form, and nothing else: what a row can carry is
// edited on the row (see buildMultiRow), then factorised up by the editor
// once every row agrees on it (see MultiEditorBase). A shared option set
// here instead would be a second place to change the same thing, and the
// two would drift.
const buildMulti = (feature: boolean) => ({
  general: {
    flat: true,
    fields: {
      entities: { name: 'entities', type: 'multi_row_editor' },
    },
  },
  // The aggregator's own: rows, the grid span a Feature doesn't have (one HA
  // row, see _applySizing), and bar_aligned, which lines its rows up.
  layout: {
    title: TITLE.layout,
    icon: HA_CONTEXT.icons.aspectRatio,
    fields: {
      ...(feature ? {} : { rows: EditorFieldsType.number('rows', { width: 'half' }) }),
      // On when unset (the Multi's default); off writes false. A name written
      // in YAML survives an off/on. bar_max_width leaves nothing to align.
      bar_aligned: EditorFieldsType.toggle('bar_aligned', {
        virtual: true,
        showIf: (c: LovelaceConfig) => !c.bar_max_width,
        resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_aligned ?? true),
        onVirtualChange: (value: boolean, config: LovelaceConfig): LovelaceConfig => ({
          ...config,
          bar_aligned: value ? config._bar_aligned_draft : false,
          _bar_aligned_draft: value ? undefined : config.bar_aligned,
        }),
      }),
    },
  },
});

// One row, edited whole behind the list's pencil - and a row IS a card
// (multi.ts), so this is the card's own form minus what the row shape
// settles for it, never a second form written by hand. Anything hand-written
// here would drift the day a card option moves section, gains a placeholder
// or grows a simple/advanced switch - which is exactly what it did.
const buildMultiRow = (feature: boolean) => {
  const card = build({ template: false, badge: false });
  // The frame, the layout and where the bar sits are the aggregator's, not
  // the row's (YamlSchemaFactory.multiRow deletes the same set).
  // Key order is panel order (see EditorBase's own render loop) - the card's
  // own, minus the layout panel it no longer owns.
  return {
    general: card.general,
    content: dropFields(card.content, ['multiline']),
    theme: dropFields(card.theme, [
      'bar_position',
      // A few px of icon can't carry a circular background - gone from the
      // Feature row's own schema too (multiFeatureRow).
      ...(feature ? ['force_circular_background_mode'] : []),
    ]),
    ...Object.fromEntries(
      MARKER_SECTIONS.filter((key) => key in card && !(feature && FEATURE_ROW_DROPPED_SECTIONS.includes(key))).map(
        (key) => [key, card[key]],
      ),
    ),
    // Not dropFields(card.interactions): the "+" picker carries its own list
    // of optional actions, which has to lose the icon's too.
    interactions: feature ? interactions(false, false) : card.interactions,
  };
};

export { build, buildFeature, buildMulti, buildMultiRow };
