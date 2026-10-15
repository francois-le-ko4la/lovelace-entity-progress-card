import { HA_CONTEXT } from '../../utils/parameters.js';
import { is } from '../../utils/common-checks.js';
import { type LovelaceConfig } from '../../utils/types.js';
import { HAS_EFFECT, BAR_AROUND_ICON } from '../../card/config/schema.js';
import { EditorFieldsType, animationEffect, LABEL_POSITION, LABEL_COLOR, TITLE, cardVariant } from '../fields/base.js';
import {
  circularBackgroundField,
  barSegmentsField,
  barRingFields,
  barScaleField,
  centerZeroFields,
} from '../fields/misc.js';
import { arrayOrJinjaModeField } from '../fields/value.js';
import { themeMaxWidthFields } from './layout.js';
import { hideChipsItems } from './general.js';

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
const themeModeFields = (template: boolean) =>
  template
    ? // Template has no custom_theme (no min_value/max_value to project real-value
      // zones onto) - just the plain select, restricted to percent: true
      // themes (see schema.ts's own theme field and base.ts's
      // theme_percent_only selector).
      {
        theme: {
          name: 'theme',
          type: 'theme_percent_only',
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
            return {
              ...config,
              theme: nextTheme,
              _theme_draft: wantsCustom ? (config.theme ?? config._theme_draft) : undefined,
              custom_theme: wantsCustom ? (config._custom_theme_draft ?? config.custom_theme ?? []) : undefined,
              _custom_theme_draft: wantsCustom ? undefined : (config.custom_theme ?? config._custom_theme_draft),
            };
          },
        },
        theme: EditorFieldsType.select('theme', {
          showIf: (c: LovelaceConfig) => !is.array(c.custom_theme),
        }),
        custom_theme: {
          name: 'custom_theme',
          type: 'custom_theme_editor',
          showIf: (c: LovelaceConfig) => is.array(c.custom_theme),
        },
      };

// Badge/BadgeTemplate schemas reject some enum members that only make
// sense with a `layout`/`bar_position` a badge doesn't have (see
// YamlSchemaFactory.badge) - swaps in the matching restricted select type
// instead of a range check inline in theme() below.
const badgeRestrictedType = (badge: boolean, restrictedType: string) => (badge ? { type: restrictedType } : {});

// Every themeXxxFields() below is pulled out of theme() itself for the same
// reason as themeModeFields above: keep each conditional block's own
// ternaries out of theme()'s cognitive complexity budget.
const themeColorModeFields = (template: boolean) =>
  template
    ? {
        // No interpolate here (Template has no such field - schema.ts's
        // own template schema never declared one, unlike Card/Feature) -
        // TemplateViewBase's templateThemeGradient/-DivergingGradient don't
        // support it either. custom_theme doesn't exist on Template (see
        // theme()'s own comment above), so showIf only ever checks c.theme.
        bar_color_mode: EditorFieldsType.select('bar_color_mode', {
          showIf: (c: LovelaceConfig) => !is.nullish(c.theme),
        }),
      }
    : {
        bar_color_mode: EditorFieldsType.select('bar_color_mode', {
          showIf: HAS_EFFECT.barColorMode,
          width: 'full',
        }),
        interpolate: EditorFieldsType.toggle('interpolate', {
          showIf: HAS_EFFECT.interpolate,
          width: 'full',
        }),
      };

const themeCardOnlyFields = (template: boolean, badge: boolean) =>
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
          // Template's own icon is a full-width Jinja textarea, never a row
          // partner - everywhere else this pairs with whatever is beside it,
          // and stretches by itself when nothing is (see EDITOR_BASE_STYLE).
          width: template ? 'full' : 'half',
          resolveVirtual: (c: LovelaceConfig) => animationEffect(c.icon_animation) ?? '',
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
            const effect = animationEffect(current);
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
          onVirtualChange: (value: string, config: LovelaceConfig) => ({
            ...config,
            icon_animation: { effect: animationEffect(config.icon_animation), jinja: value || '' },
          }),
        }),
        ...circularBackgroundField(),
        bar_group: EditorFieldsType.sectionLabel('bar_group', { labelKey: 'shared.bar' }),
        bar_position: EditorFieldsType.select('bar_position', {
          // density: compact is the most restrictive case (top/bottom/
          // background only, see EditorFactory.applyDensityConstraints) and
          // wins outright; single_line has no placement to pick at all.
          // Otherwise compact_below only has a distinct effect with layout:
          // horizontal - not offered once vertical, same reasoning as
          // bar_orientation's 'up' just above.
          type: (c: LovelaceConfig) =>
            c.density === 'compact'
              ? 'bar_position_density_compact'
              : c.layout === 'vertical'
                ? 'bar_position_no_compact_below'
                : 'bar_position',
          labelKey: LABEL_POSITION,
          width: 'half',
          showIf: (c: LovelaceConfig) => c.density !== 'single_line',
        }),
      };

// Not on a badge: both are deleted from its schema (YamlSchemaFactory.badge).
const themeSingleLineShadowFields = (badge: boolean) =>
  badge
    ? {}
    : {
        // Both full width (the default): text_shadow shows alone under
        // 'background', where bar_single_line does not - and a half-width
        // toggle alone on its row only reads as a hole beside a long label.
        bar_single_line: EditorFieldsType.toggle('bar_single_line', { showIf: HAS_EFFECT.barSingleLine }),
        text_shadow: EditorFieldsType.toggle('text_shadow', { showIf: HAS_EFFECT.textShadow }),
      };

// What the color pickers give way to: a custom theme counts from the moment
// it is entered, zones or not (unlike HAS_EFFECT.barColorMode).
const themeActive = (c: LovelaceConfig) => !is.nullish(c.theme) || is.array(c.custom_theme);

// bar_orientation/bar_size/bar_color/bar_segments/bar_scale's row-partner
// logic, pulled out of theme() for the same cognitive-complexity reason as
// every other themeXxxFields() here. See each field's own width comment
// for its pairing - bar_orientation stays a flat half, always.
const themeBarSizingFields = (template: boolean, badge: boolean) => {
  return {
    // A badge's bar_position (inline or around its icon) sits here, not in
    // themeCardOnlyFields, which carries every other card's.
    ...(badge
      ? {
          bar_group: EditorFieldsType.sectionLabel('bar_group', { labelKey: 'shared.bar' }),
          bar_position: EditorFieldsType.select('bar_position', {
            type: 'bar_position_badge',
            labelKey: LABEL_POSITION,
            width: 'half',
          }),
        }
      : {}),
    bar_orientation: EditorFieldsType.select('bar_orientation', {
      // Around the icon the ring turns clockwise or not; Badge/Badge Template
      // have no bar_position/layout besides it: 'up' never applies.
      type: (c: LovelaceConfig) => {
        if (c.bar_position === BAR_AROUND_ICON) return 'bar_orientation_ring';
        return !badge && HAS_EFFECT.barOrientationUp(c) ? 'bar_orientation' : 'bar_orientation_no_up';
      },
      width: 'half',
    }),
    bar_size: EditorFieldsType.select('bar_size', {
      ...badgeRestrictedType(badge, 'bar_size_no_xlarge'),
      width: 'half',
      // Shown, it always sits next to bar_segments: bar_single_line and
      // text_shadow need the very positions it is hidden in.
      showIf: HAS_EFFECT.barSize,
    }),
    bar_color: EditorFieldsType.templateOrType('bar_color', template, 'color_state_default', {
      // One 'Color' label for every color field: the panel it sits in says
      // which color it is, the field name would only repeat it.
      labelKey: LABEL_COLOR,
      showIf: (c: LovelaceConfig) => !themeActive(c),
      // Full-width once bar_size (its row partner) hides for the same
      // bar_position values.
      ...(template ? { helper: true, helperKey: 'color' } : { width: 'half' }),
    }),
    ...themeSingleLineShadowFields(badge),
    ...barSegmentsField(),
    ...barRingFields(),
  };
};

// Simple (chips) vs Advanced (Jinja) - shared verbatim by theme() and
// buildFeature() below.
const barEffectFields = () => ({
  ...arrayOrJinjaModeField('bar_effect'),
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
});

const theme = (template: boolean, badge: boolean) => {
  return {
    title: TITLE.theme,
    icon: HA_CONTEXT.icons.listBox,
    fields: {
      ...themeModeFields(template),
      ...themeColorModeFields(template),
      // Pendant to bar_group below: the panel runs theme, then the icon, then
      // the bar, and only the bar half said so.
      // The heading over the icon fields says the same word the icon field
      // itself does - one key, two places.
      icon_group: EditorFieldsType.sectionLabel('icon_group', { labelKey: 'icon' }),
      // Half-width to pair with `color` below - but `color` hides once a
      // theme/custom_theme is active, so `icon` needs to reclaim the full
      // row then. Card: always half now, whether or not `color` is
      // actually showing (matches bar_orientation/bar_size below). Badge
      // keeps the old theme-aware behavior (full once `color` hides).
      icon: EditorFieldsType.templateOrType('icon', template, 'icon', {
        ...(template
          ? // Right under the icon_group heading, which already says 'Icon' -
            // labelling it too said the word twice in a row.
            { helper: true, noLabel: true }
          : {
              width: 'half',
            }),
      }),
      color: EditorFieldsType.templateOrType('color', template, 'color_state_default', {
        labelKey: LABEL_COLOR,
        showIf: (c: LovelaceConfig) => !themeActive(c),
        ...(template ? { helper: true } : { width: 'half' }),
      }),
      ...themeCardOnlyFields(template, badge),
      ...themeBarSizingFields(template, badge),
      // Not in YamlSchemaFactory.template: percent comes straight from Jinja
      // there, so the log/linear min-max mapping this drives has nothing to
      // act on - showing it would silently do nothing on save (same trap as
      // #111's min_value/max_value on a template card).
      ...(!template ? barScaleField() : {}),
      ...themeMaxWidthFields(badge),
      reverse_secondary_info_row: EditorFieldsType.toggle('reverse_secondary_info_row', {
        showIf: HAS_EFFECT.reverseSecondaryInfoRow,
      }),
      // Used to be mutually exclusive with bar_color_mode (segment/rainbow
      // had no effect under center_zero) - now that
      // ViewBase.themeDivergingGradient supports both together, gating
      // this on bar_color_mode would just hide it with no way back.
      ...centerZeroFields(),
      ...barEffectFields(),
      // ── Hide ─────────────────────────────────────────────────────────────
      ...arrayOrJinjaModeField('hide'),
      hide_chips: EditorFieldsType.select('hide_chips', {
        type: 'hide_chips',
        target: 'hide',
        showIf: (c: LovelaceConfig) => !is.nonEmptyString(c.hide),
        items: hideChipsItems(cardVariant(template, badge)),
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
};

export {
  themeModeFields,
  badgeRestrictedType,
  themeColorModeFields,
  themeCardOnlyFields,
  themeSingleLineShadowFields,
  themeActive,
  themeBarSizingFields,
  barEffectFields,
  theme,
};
