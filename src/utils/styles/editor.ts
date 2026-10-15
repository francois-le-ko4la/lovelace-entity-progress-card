/*
 * Stylesheets of the visual editor's components. Split from styles.ts so the
 * card bundle does not carry them.
 */

// Local on purpose: the editor bundle reaches styles.ts through the host table,
// which the build's CSS pass cannot evaluate (scripts/lib/inline-css.js).
const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, s, i) => acc + s + (i < values.length ? values[i] : ''), '');

// Shared by CHIPS_HOST_STYLE/BAR_STACK_EDITOR_STYLE/CUSTOM_THEME_EDITOR_STYLE
// below - each is its own shadow root's stylesheet, so plain string sharing
// (not a CSS-level mechanism) is enough, no cascade-order risk.
const LABEL_STYLE = `.lbl {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
    padding-bottom: 4px;
  }`;

// Shared by BAR_STACK_EDITOR_STYLE/CUSTOM_THEME_EDITOR_STYLE below - each
// row's own delete button and the "+ Add..." row beneath the list.
const ROW_DELETE_STYLE = `.del-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    box-sizing: border-box;
  }
  .del-btn:hover { color: var(--primary-color); }
  .del-btn ha-svg-icon { width: 16px; height: 16px; }
  .add-row { display: flex; justify-content: flex-start; margin-top: 4px; }`;

const CHIPS_HOST_STYLE = css`
  :host {
    display: block;
    width: 100%;
    /* "loud" = selected, "normal" = standby (ha-button.ts's own mapping). */
    --chip-accent: var(--wa-color-brand-fill-loud, var(--primary-color));
    --chip-accent-text: var(--wa-color-brand-on-loud, var(--text-primary-color, #fff));
    --chip-standby: var(--wa-color-brand-fill-normal, var(--secondary-background-color));
    --chip-standby-text: var(--wa-color-brand-on-normal, var(--primary-text-color));
    --chip-standby-hover: var(--ha-color-fill-primary-normal-hover, var(--divider-color));
    --chip-accent-hover: var(--ha-color-fill-primary-loud-hover, var(--primary-color));
  }
  ${LABEL_STYLE}
  /* Segmented (2-mode) sets read as one control, not a stacked list - label
     and pill share a row, set on the host itself (see chips.ts). */
  :host(.inline-row) { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  :host(.inline-row) .lbl {
    padding-bottom: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* margin-left: auto, not justify-content: flex-end on the host: with a label
     the host's own space-between already puts the chips on the right, and
     without one (the master Enabled/Disabled pills, whose panel title names
     them - see enabledToggleField) the auto margin is what keeps them there
     instead of letting the only child sit at the start of the row. */
  :host(.inline-row) .chip-set.segmented { flex-shrink: 0; margin-left: auto; }
  .chip-set { display: flex; flex-wrap: wrap; gap: 8px; }
  /* Solid standby/accent fills everywhere, not an opacity-layer tint -
     that layer didn't repaint live on a theme switch (see :host's tokens). */
  .chip { position: relative; display: inline-flex; align-items: center; height: 32px; padding: 0 16px; box-sizing: border-box;
    border: none; border-radius: 8px; font-family: inherit; font-size: 14px; line-height: 1; font-weight: 500; cursor: pointer;
    background: var(--chip-standby); color: var(--chip-standby-text);
    transition: background-color 0.15s; }
  .chip:hover { background: var(--chip-standby-hover); }
  .chip.selected { background: var(--chip-accent); color: var(--chip-accent-text); font-weight: 700; }
  .chip.selected:hover { background: var(--chip-accent-hover); }
  .chip.forced { cursor: default; opacity: 0.7; }
  .chip.forced:hover { background: var(--chip-accent); }
  /* 2-mode sets fuse into one pill instead of separate chips. */
  .chip-set.segmented { display: inline-flex; flex-wrap: nowrap; gap: 0; border-radius: 999px; overflow: hidden; }
  .chip-set.segmented .chip { border-radius: 0; }
`;

const BAR_STACK_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  ${LABEL_STYLE}
  .row-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .row-header { display: flex; align-items: center; justify-content: space-between; }
  .row-title { font-size: 0.9rem; color: var(--secondary-text-color); }
  ${ROW_DELETE_STYLE}
`;

// The bar-stack list plus what only a pencil-per-row list needs: the row's
// own inline picker sharing its header, and the sub-editor's back bar.
const MULTI_ROW_EDITOR_STYLE = css`
  ${BAR_STACK_EDITOR_STYLE}
  .row-card { flex-direction: row; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px 12px; }
  .row-main { flex: 1 1 auto; min-width: 0; }
  .back-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .back-title { font-size: 0.9rem; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const ACTION_PICKER_STYLE = css`
  :host { display: block; width: 100%; }
  .picker { position: relative; display: inline-flex; }
  .menu {
    display: none;
    position: absolute;
    bottom: calc(100% + 4px);
    left: 0;
    z-index: 10;
    flex-direction: column;
    gap: 2px;
    width: max-content;
    min-width: 200px;
    max-width: min(90vw, 320px);
    padding: 4px;
    box-sizing: border-box;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
  }
  .menu.open { display: flex; }
  .menu-item {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    color: var(--primary-text-color);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .menu-item:hover, .menu-item:focus-visible { background: var(--secondary-background-color); }
`;

const CUSTOM_THEME_EDITOR_STYLE = css`
  :host { display: block; width: 100%; }
  ${LABEL_STYLE}
  .zone {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .zone-header { display: flex; align-items: center; justify-content: space-between; }
  .zone-title { font-size: 0.9rem; color: var(--secondary-text-color); }
  .numbers-row { display: flex; gap: 16px; }
  .numbers-row > * { width: calc((100% - 16px) * 0.5); }
  ${ROW_DELETE_STYLE}
`;

const EDITOR_BASE_STYLE = css`
  /* 24px, like everything Home Assistant stacks in a card editor: ha-form gives
     every child but the last a 24px margin-bottom, which is what separates two
     expandable panels there, and hui-tile-card-editor adds the same 24px under
     its own form blocks. That covers both what sits between our panels and the
     flat fields above them. padding-bottom repeats it so the last panel doesn't
     sit flush against the editor's bottom edge. */
  .editor {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 24px;
    /* ha-input pads itself with var(--ha-input-padding-bottom, --ha-space-2)
       - 8px of reserved hint line inside a field that is already 56px tall,
       which made a number selector's row sit one notch lower than the selects
       beside it. A custom property crosses the shadow boundary its padding
       lives behind; our own rows carry their spacing themselves (see
       .panel-body's gap). */
    --ha-input-padding-bottom: 0;
    /* ha-expansion-panel pads its own .container with
       var(--expansion-panel-content-padding, 0 8px), which lands on top of the
       12px .panel-body sets for itself. HA zeroes the same variable in
       config-elements-style for exactly this reason - the panel holds the
       content, the content decides its own inset. */
    --expansion-panel-content-padding: 0;
  }
  /* Home Assistant's own form spacing, so a panel of ours sits in a dialog
     next to a native one without reading as a different form: 24px between
     rows (ha-form gives every child but the last a 24px margin-bottom, and
     ha-form-grid sets grid-row-gap to --ha-space-6), 8px between two fields
     on the same row (its grid-column-gap, --ha-space-2), and 12px inside the
     panel itself (config-elements-style's own ha-expansion-panel .content).
     The same 24 works here only because ha-input's own hint padding is off
     (see --ha-input-padding-bottom on .editor): with it on, a number selector
     sat 8px lower than the selects beside it and the whole panel read as
     over-spaced. */
  /* align-items: flex-end - two fields on one row don't share a height (a
     slider carries its label above it, a select doesn't); centered, they drift
     apart. On the container rather than on each child. */
  .panel-body { display: flex; flex-direction: row; gap: 24px 8px; flex-wrap: wrap; align-items: flex-end; align-content: flex-start; padding: 12px; }
  /* min-width: auto (flex default) lets a narrow field wrap its label to
     2 lines instead of eliding - throws its row height off from siblings. */
  .panel-body > * { min-width: 0; }
  /* Row packing, decided by the engine rather than computed per field: a
     half basis fits exactly two per row with the gap, and the flex-grow is
     what makes a field left alone on its row - last one, or the one before a
     full-width neighbour - take the whole width by itself. Widths used to be
     a function of the config in JS (which of my neighbours are visible right
     now?), and every one of those functions was wrong in some state. */
  .panel-body > .field-full { flex: 0 0 100%; }
  .panel-body > .field-half { flex: 1 1 calc(50% - 4px); }
  /* The slider half of a number+unit composite: takes what its unit select
     leaves, whatever that select's own width is. */
  .panel-body > .field-grow { flex: 1 1 auto; }
  /* A unit select and nothing else - its own px width, never stretched. */
  .panel-body > .field-fixed { flex: 0 0 auto; }
  .panel-body ha-selector.field-toggle { margin-block: -18px; }
  .section-label {
    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--primary-text-color);
  }
  .editor-header { display: flex; align-items: center; }
  .editor-header > ha-button { margin-inline-start: auto; }
  ${ROW_DELETE_STYLE}
`;

export { CHIPS_HOST_STYLE };
export { MULTI_ROW_EDITOR_STYLE };
export { BAR_STACK_EDITOR_STYLE };
export { ACTION_PICKER_STYLE };
export { CUSTOM_THEME_EDITOR_STYLE };
export { EDITOR_BASE_STYLE };
