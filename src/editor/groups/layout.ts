import { CARD, HA_CONTEXT } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { parseLength, serializeLength, convertLengthValue } from '../../utils/length.js';
import {
  DENSITY_MODES,
  HAS_EFFECT,
  YamlSchemaFactory,
  densityOverrides,
  CONTENT_ORDER_TOKENS,
  TEMPLATE_CONTENT_ORDER_TOKENS,
  completeOrder,
  completeLines,
  contentShape,
  contentHoldsBar,
  defaultLines,
  readLines,
  hideTargetOf,
  isHiddenToken,
  type ContentShape,
} from '../../card/config/schema.js';
import { EditorFieldsType, draftToggle, TITLE } from '../fields/base.js';

// A CSS-length option (e.g. min_width) edited as a number+unit composite: a
// slider (value) + a unit dropdown, both virtual over the single string
// config key. A value that isn't a plain number+unit (calc(), auto…) falls
// back to a raw text field. See utils/length.ts. Config stays a string, so
// the schema is unchanged. `badge` narrows the unit list (px/% only) and
// enables the px<->% conversion (its % is redefined, see core.ts / #124).
const lengthField = (
  key: string,
  opts: {
    units: string[];
    convertRef?: number;
    showIf?: (c: LovelaceConfig) => boolean;
    noLabel?: boolean;
    customToggle?: boolean;
  },
  // eslint-disable-next-line sonarjs/max-lines-per-function -- flat decl.
) => {
  const { units, convertRef, showIf, noLabel = false, customToggle = false } = opts;
  const read = (c: LovelaceConfig) => c[key];
  // value omitted clears the key - same object either way, one less literal
  // `undefined` at the call sites that mean "unset".
  const write = (c: LovelaceConfig, value?: unknown) => ({ ...c, [key]: value });
  const parsed = (c: LovelaceConfig) => parseLength(read(c));
  const gate = (c: LovelaceConfig) => (showIf ? showIf(c) : true);
  // The toggle only ever writes the literal 'auto' (see below) - a custom
  // value that came from elsewhere (YAML calc(), an unknown unit…) still
  // falls back to the raw text field below.
  const isAutoToggled = (c: LovelaceConfig) => customToggle && read(c) === 'auto';
  const hasUnit = units.length > 1; // a single unit (e.g. px) needs no dropdown
  // Where the length goes while custom mode holds the key (see below).
  const customDraftKey = `_${key}_length_draft`;
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
        value
          ? { ...write(config, 'auto'), [customDraftKey]: read(config) }
          : { ...write(config, config[customDraftKey]), [customDraftKey]: undefined },
    };
  }
  fields[key] = {
    name: key,
    type: () => `length:${key}`,
    virtual: true,
    noLabel,
    labelKey: key,
    width: hasUnit ? 'grow' : 'full', // leave room for the 90px unit select + gap
    showIf: (c: LovelaceConfig) => !parsed(c).custom && gate(c),
    resolveVirtual: (c: LovelaceConfig) => {
      const parsedLength = parsed(c);
      return parsedLength.custom ? 0 : parsedLength.value;
    },
    onVirtualChange: (value: number, config: LovelaceConfig) => {
      const parsedLength = parsed(config);
      const unit = parsedLength.custom ? units[0] : parsedLength.unit;
      return write(config, serializeLength(value, unit));
    },
  };
  fields[`${key}_custom`] = {
    name: `${key}_custom`,
    target: key,
    type: 'text',
    virtual: true,
    noLabel,
    // Reuses the slider's own label: a `<key>_custom` translation never
    // existed, so this rendered unlabelled.
    labelKey: key,
    showIf: (c: LovelaceConfig) => parsed(c).custom && !isAutoToggled(c) && gate(c),
    resolveVirtual: (c: LovelaceConfig) => (is.string(read(c)) ? (read(c) as string) : ''),
    onVirtualChange: (value: string, config: LovelaceConfig) => write(config, value || undefined),
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
        const parsedLength = parsed(config);
        if (parsedLength.custom) return config;
        const unit = rawUnit || units[0]; // clearing the dropdown falls back to the first unit
        const value = convertLengthValue(parsedLength.value, parsedLength.unit, unit, convertRef);
        return write(config, serializeLength(value, unit));
      },
    };
  }
  return fields;
};

// Not on a badge: without a 'layout' key it never gets the 'horizontal'
// class, so the option would be inert there.
const themeMaxWidthFields = (badge: boolean) => {
  if (badge) return {};
  return {
    bar_max_width_toggle: EditorFieldsType.toggle('bar_max_width_toggle', {
      virtual: true,
      showIf: HAS_EFFECT.barMaxWidth,
      resolveVirtual: (c: LovelaceConfig) => Boolean(c.bar_max_width),
      onVirtualChange: draftToggle('bar_max_width', () => '300px'),
    }),
    // The toggle above carries the "Bar max width" label, so the slider is
    // noLabel. Same length component as min_width/height, locked to px (a
    // single unit needs no dropdown).
    ...lengthField('bar_max_width', {
      units: ['px', '%'],
      noLabel: true,
      showIf: (c: LovelaceConfig) => HAS_EFFECT.barMaxWidth(c) && Boolean(c.bar_max_width),
    }),
  };
};

// frameless/marginless: still valid for badges in the schema (raw YAML
// still works) and documented as such - just not worth a control in the
// badge editor, a deliberate choice, not a dead-CSS case. `height` is
// genuinely deleted from the badge schema (see YamlSchemaFactory.badge).
// A badge takes both too (YamlSchemaFactory.badge keeps them).
const themeCardLayoutFields = () => ({
  frameless: EditorFieldsType.toggle('frameless', { width: 'half' }),
  marginless: EditorFieldsType.toggle('marginless', { width: 'half' }),
});

// A "Card size" toggle that reveals min_width (+ height on cards) without
// forcing a value: `_show_size` is ephemeral UI state, same pattern as
// `_visible_actions`. Also reads as on when a value already exists.
const cardSizeFields = (badge: boolean) => {
  const shown = (c: LovelaceConfig) => Boolean(c._show_size || c.min_width || c.height);
  // Both lengths parked together while the section is off - same draft
  // precedent as every other toggle here, and closing the section used to
  // discard them outright.
  const draftKey = '_card_size_draft';
  const draftOf = (c: LovelaceConfig) => (is.plainObject(c[draftKey]) ? (c[draftKey] as object) : null);
  return {
    card_size_toggle: {
      name: 'card_size_toggle',
      type: 'toggle',
      virtual: true,
      resolveVirtual: shown,
      onVirtualChange: (value: boolean, config: LovelaceConfig) =>
        value
          ? {
              ...config,
              _show_size: true,
              // Nothing parked: open on the height the card already has, so
              // one opts into fixing it rather than inheriting a number.
              ...(draftOf(config) ?? (badge ? {} : { height: 'auto' })),
              [draftKey]: undefined,
            }
          : {
              ...config,
              _show_size: undefined,
              min_width: undefined,
              height: undefined,
              [draftKey]: { min_width: config.min_width, height: config.height },
            },
    },
    ...lengthField(
      'min_width',
      badge
        ? { units: ['px', '%'], convertRef: 130, showIf: shown }
        : { units: ['px', 'em', 'rem', '%'], showIf: shown },
    ),
    ...(badge ? {} : lengthField('height', { units: ['px', 'em', 'rem', '%'], showIf: shown, customToggle: true })),
  };
};

// The schema's own densityOverrides (issue #134), applied the moment density
// changes; a forced default is written as no key, like an emptied field.
const applyDensityConstraints = (config: LovelaceConfig): LovelaceConfig => {
  const next = { ...config };
  for (const [key, value] of Object.entries(densityOverrides(config))) {
    if (value === YamlSchemaFactory.card.fieldDefault(key)) Reflect.deleteProperty(next, key);
    else next[key] = value;
  }
  return next;
};

// single_line is a horizontal row, single_column a vertical stack: each the
// density the other layout cannot offer (densityOverrides).
const otherLayoutDensity = (layout: unknown) =>
  layout === CARD.layout.orientations.vertical.label ? 'single_line' : 'single_column';

const themeLayoutField = (badge: boolean) =>
  badge
    ? {}
    : {
        layout: EditorFieldsType.select('layout', {
          // A new layout wins over the density bound to the other one rather
          // than being undone by applyDensityConstraints: back to default.
          onChange: (value: unknown, config: LovelaceConfig) =>
            config.density === otherLayoutDensity(value) ? { ...config, density: undefined } : config,
        }),
        density: {
          name: 'density',
          type: 'density',
          virtual: true,
          modes: (c: LovelaceConfig) => DENSITY_MODES.filter((mode) => mode !== otherLayoutDensity(c.layout)),
          // 'default' resolves to no key at all, so a card that never left
          // it keeps a clean YAML.
          resolveVirtual: (c: LovelaceConfig) => (c.density as string) ?? 'default',
          onVirtualChange: (value: string, config: LovelaceConfig): LovelaceConfig => {
            const next = applyDensityConstraints({
              ...config,
              density: value === 'default' ? undefined : value,
            });
            // A card in a Sections view carries its own explicit
            // grid_options, which always wins over getGridOptions()'s
            // computed default - so compact has to pin it by hand and stash
            // the previous value in _grid_options_draft (ephemeral, same
            // pattern as custom_theme's _theme_draft). single_line doesn't:
            // layout: horizontal is already 1 row / 2 columns.
            if (value === 'compact') {
              return {
                ...next,
                grid_options: { columns: Number(CARD.layout.gridColumnMultiplier), rows: 1 },
                _grid_options_draft: config.grid_options,
              };
            }
            return config.density === 'compact'
              ? { ...next, grid_options: config._grid_options_draft, _grid_options_draft: undefined }
              : next;
          },
        },
      };

const writeOrder = (config: LovelaceConfig, order: unknown, standard: unknown) => ({
  ...config,
  content_order: JSON.stringify(order) === JSON.stringify(standard) ? undefined : order,
});

// A ✕ hides its chip, a hidden one picked again shows it: in a list hide only,
// never a Jinja one (null: refused).
const toggleHidden = (
  config: LovelaceConfig,
  value: readonly string[],
  shown: readonly string[],
  template: boolean,
): LovelaceConfig | null => {
  const removed = shown.filter((token) => !value.includes(token));
  const added = value.filter((token) => isHiddenToken(config, token, template));
  if (removed.length === 0 && added.length === 0) return config;
  if (is.jinja(config.hide)) return null;
  const unhidden = added.map((token) => hideTargetOf(token, template));
  // Hidden by its group (hide: [secondary_info]): only that chip can show it.
  if (unhidden.some((target) => !(config.hide as unknown[]).includes(target))) return null;
  const hide = [
    ...(is.array(config.hide) ? (config.hide as string[]) : []).filter((target) => !unhidden.includes(target)),
    ...removed.map((token) => hideTargetOf(token, template)),
  ];
  return { ...config, hide: hide.length > 0 ? hide : undefined };
};

const flatOrderField = (
  name: string,
  type: string,
  tokens: readonly string[],
  shape: ContentShape,
  template: boolean,
) => {
  const tokensOf = (c: LovelaceConfig) => tokens.filter((token) => !isHiddenToken(c, token, template));
  return {
    name,
    type,
    target: 'content_order',
    noLabel: true,
    virtual: true,
    showIf: (c: LovelaceConfig) => contentShape(c) === shape,
    resolveVirtual: (c: LovelaceConfig) =>
      completeOrder(is.array(c.content_order) ? readLines(c.content_order, shape)[0] : [], tokensOf(c)),
    onVirtualChange: (value: unknown, config: LovelaceConfig): LovelaceConfig | null => {
      if (!is.array(value)) return null;
      const next = toggleHidden(config, value as string[], tokensOf(config), template);
      return next && writeOrder(next, value, tokensOf(next));
    },
  };
};

// A chip row per line (horizontal: two; stack: one more, empty, to open a new
// line). A chip picked in a row leaves the others.
const lineOrderFields = (type: string, tokens: readonly string[], template: boolean) => {
  const linesShape = (c: LovelaceConfig) => contentShape(c) === 'lines';
  const shapeOf = (c: LovelaceConfig) => (linesShape(c) ? 'lines' : 'stack');
  // The bar is a chip only where it sits among the texts.
  const tokensOf = (c: LovelaceConfig) =>
    tokens.filter((token) => (contentHoldsBar(c) || token !== 'bar') && !isHiddenToken(c, token, template));
  const current = (c: LovelaceConfig): string[][] => {
    const shape = shapeOf(c);
    const lines = is.array(c.content_order)
      ? completeLines(readLines(c.content_order, shape, contentHoldsBar(c)), tokensOf(c))
      : defaultLines(tokensOf(c), shape);
    return shape === 'lines' && lines.length < 2 ? [...lines, []] : lines;
  };
  const rows = (c: LovelaceConfig) => {
    const lines = current(c);
    if (linesShape(c)) return 2;
    return Math.min(tokensOf(c).length, lines.length + ((lines[lines.length - 1]?.length ?? 0) > 0 ? 1 : 0));
  };
  const lineField = (index: number) => ({
    name: `content_order_line_${index + 1}`,
    type: (c: LovelaceConfig) => (contentHoldsBar(c) ? type : `${type}_no_bar`),
    target: 'content_order',
    virtual: true,
    showIf: (c: LovelaceConfig) => ['lines', 'stack'].includes(contentShape(c) ?? '') && index < rows(c),
    resolveVirtual: (c: LovelaceConfig) => current(c)[index] ?? [],
    onVirtualChange: (value: unknown, config: LovelaceConfig): LovelaceConfig | null => {
      const lines = current(config);
      if (!is.array(value)) return null;
      const hidden = toggleHidden(config, value as string[], lines[index] ?? [], template);
      if (!hidden) return null;
      const next = Array.from({ length: Math.max(lines.length, index + 1) }, (_, row) =>
        row === index ? (value as string[]) : (lines[row] ?? []).filter((token) => !value.includes(token)),
      );
      const written = linesShape(config) ? next : next.filter((line) => line.length > 0);
      return writeOrder(hidden, written, defaultLines(tokensOf(hidden), shapeOf(config)));
    },
  });
  return {
    content_order_group: EditorFieldsType.sectionLabel('content_order_group', {
      labelKey: 'content_order',
      showIf: (c: LovelaceConfig) => contentShape(c) !== null,
    }),
    ...Object.fromEntries(tokens.map((_, index) => [`content_order_line_${index + 1}`, lineField(index)])),
  };
};

const contentOrderField = (template: boolean, badge: boolean) => {
  if (badge) return {};
  const tokens = template ? TEMPLATE_CONTENT_ORDER_TOKENS : CONTENT_ORDER_TOKENS;
  const type = template ? 'content_order_template' : 'content_order';
  return {
    ...lineOrderFields(type, tokens, template),
    content_order_row: flatOrderField(
      'content_order_row',
      `${type}_no_bar`,
      tokens.filter((token) => token !== 'bar'),
      'line',
      template,
    ),
    content_order_single_line: flatOrderField('content_order_single_line', type, tokens, 'row', template),
  };
};

// Also split out of theme(): frameless/marginless/height/min_width/layout
// are the card's own sizing/shape, a different concern from its color/bar
// appearance above. Smaller win than markers() (5 fields vs ~28) but the
// same grouping logic - and it's the natural conceptual home for these
// regardless of the performance angle.
const layout = (badge: boolean) => ({
  title: TITLE.layout,
  icon: HA_CONTEXT.icons.aspectRatio,
  // Shape, then size, then frame: layout governs density (whose own chip
  // list answers to it), size only means something once the shape is
  // settled, and frameless/marginless change nothing inside the card.
  fields: {
    ...themeLayoutField(badge),
    // min_width (+ height on cards) behind a "Card size" reveal toggle. Not
    // gated on `badge` for min_width - valid for badges too (not in
    // YamlSchemaFactory.badge's delete list).
    ...cardSizeFields(badge),
    ...themeCardLayoutFields(),
  },
});

export {
  contentOrderField,
  lengthField,
  themeMaxWidthFields,
  themeCardLayoutFields,
  cardSizeFields,
  themeLayoutField,
  applyDensityConstraints,
  layout,
};
