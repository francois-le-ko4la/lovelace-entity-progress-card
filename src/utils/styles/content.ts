import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const CONTENT_CSS = css`
/* =============================================================================
   CONTENT SECTION (TEXT CONTENT)
   ============================================================================= */

.${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(var(--name-height) + var(--detail-height));

  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: var(--current-content-flex-grow);
  flex-shrink: 1;
  width: var(--current-content-width);
  /* min-height, not height (issue #131): calibrated for the default font scale,
     so the look is unchanged; a scaled-up OS font size grows the box instead of
     clipping text mid-glyph. Excluded for .vertical.up-orientation.overlay,
     which clears it back to auto - a re-declared height isn't enough, min-height
     keeps applying alongside it and measurably changed this item's size. */
  min-height: var(--current-content-height);
  gap: var(--current-content-gap, 0);
  min-width: 0;
  overflow: hidden;
  position: relative; /* overlay */
}

/* =============================================================================
   DENSITY: SINGLE_LINE
   ============================================================================= */

/* density: single_line lays icon, name, secondary and bar out as four siblings
   on one row. The class sits on .content-section itself (see
   StructureElements.createContent), and only its own direction has to flip -
   everything else is already driven by the vars the base rules read. The bar
   is a sibling of the groups here, not nested inside secondary-info. */
.${CARD.style.dynamic.singleLineRow} {
  /* Same var, same meaning as in .secondary-info below (bar first, text
     second) - only the row it applies to moves up a level here. Its gating
     (horizontal + bar_position: default, see ViewCore#hasReversedSecondaryInfo
     Row) is what single_line forces anyway. */
  flex-direction: var(--secondary-info-row-reverse, row);
  align-items: center;
  /* The stacked name+detail height means nothing on one row - let the row's
     own content decide, so a thin bar can shrink the card with it. */
  --current-content-height: auto;
}

/* Weighted past ha-card.horizontal's own .content-section rule, which zeroes
   the gap: nothing sits side by side in a column, so it had nothing to space.
   Here it is what keeps the bar off the text. */
ha-card.horizontal .${CARD.htmlStructure.sections.content.class}.${CARD.style.dynamic.singleLineRow} {
  --current-content-gap: var(--spacing);
  /* The 56px the horizontal rule deducts is a full-size icon column (36px
     shape + its gaps). A row derives its shape from the height it is given
     (see multi.ts #rowMetrics), so the column can be a third of that - and the
     text was giving up width to an icon no longer there. */
  --current-content-width: calc(100% - var(--shape-default-size) - var(--spacing));
}

/* On a single row the name is another info on the line, not a title above one:
   it takes .secondary-info-value's scale, weight and color so the row reads as
   one sentence. Its own --epb-name-* hooks still come first (theme.md), the
   detail values are only what they now fall back to. */
.${CARD.style.dynamic.singleLineRow} .${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--epb-detail-color, var(--primary-text-color)));
  --text-font-size: var(--epb-name-font-size, var(--epb-detail-font-size, var(--current-row-detail-font-size, var(--ha-font-size-s))));
  --text-font-weight: var(--epb-name-font-weight, var(--epb-detail-font-weight, var(--ha-font-weight-body)));
  --text-height: var(--detail-height);
  --text-line-height: max(var(--detail-height), 1.2em);
  --text-letter-spacing: var(--epb-name-letter-spacing, var(--detail-letter-spacing));
}

/* The group box has to follow its text: a name box still reserving
   --name-height would keep the row taller than the line it holds. */
.${CARD.style.dynamic.singleLineRow} .${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--detail-height);
}

/* The same separator that joins infos inside secondary-info
   (CARD.config.separator), spaces included, now joining the name to it too.
   Carried by the wrapper, which is absent (static hide), display: none
   (dynamic hide) or collapsed (.secondary-info-blank) in every case where
   there is nothing to separate - except a Jinja-driven hide: name, which
   leaves .name in place as a sibling and so needs the override below. */
.${CARD.style.dynamic.singleLineRow}
  .${CARD.htmlStructure.elements.nameContent.class}
  + .${CARD.htmlStructure.elements.secondaryInfo.class}
  .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}::before {
  /* Inline like everything else in .info-row: the row gap it used to sit next
     to is gone with the two boxes it separated. */
  content: var(--current-row-separator, '${CARD.config.separator}');
  white-space: pre;
  color: var(--epb-detail-color, var(--primary-text-color));
  font-size: var(--epb-detail-font-size, var(--current-row-detail-font-size, var(--ha-font-size-s)));
}

ha-card.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.style.dynamic.singleLineRow} {
  --current-row-separator: none;
}

/* .info-row is the row's single ellipsis context: every box under it drops to
   an inline run, so the whole "Name · 45 %" reads as one line truncated once at
   its end instead of each group ellipsing inside its own box. Their widths,
   floors, caps and overflow stop applying by construction - an inline box has
   none of them - which also retires the ones this shape would otherwise fight
   (.secondary-info's min-content, its wrapper's 60% cap). The bar keeps its
   own min(30px, 33%) floor: that coupling is what makes text give way first.
   Deliberately two classes and no .single-line-row scope: at that weight the
   VISIBILITY CONTROLS further down, and .secondary-info-blank, still win their
   display: none by source order. Tightening this selector re-shows every
   hidden box. */
.${CARD.htmlStructure.sections.infoRow.class} :is(
    .${CARD.htmlStructure.elements.nameContent.class},
    .ellipsis-wrapper,
    .${CARD.htmlStructure.elements.secondaryInfo.class},
    .${CARD.htmlStructure.elements.secondaryInfoWrapper.class},
    .${CARD.htmlStructure.elements.secondaryInfoValue.class}
  ) {
  display: inline;
}

/* Nothing left to show is not the same as nothing left to build. With the name
   hidden and the value blanked - .secondary-info-blank, pushed by core.ts's
   _updateSecondaryInfoWrapperVisibility whenever every info line comes out
   empty - both boxes are invisible but .info-row is still a flex item, and
   still claims the row's gap. That gap is what reads as a margin to the left
   of a lone bar. The all-hidden case never gets here: it builds no .info-row
   at all (see StructureElements.createContentBody). */
ha-card.${CARD.style.dynamic.hiddenComponent.name.class}.secondary-info-blank
  .${CARD.htmlStructure.sections.infoRow.class} {
  display: none;
}

/* .ellipsis-wrapper's own width: 100% would pin the text at whatever is left
   after the bar's floor, however short it is; here it is a flex item and the
   bar takes what the text doesn't. The line-height comes back from the
   detail's, since an inline box ignores the min-height its children carry. */
.${CARD.style.dynamic.singleLineRow} .${CARD.htmlStructure.sections.infoRow.class} {
  /* auto by default: the text asks for what it needs and the bar takes the
     rest, so a bar's left edge follows its own row's text. --epb-multi-value
     -width pins that column instead - the hook the Multi carried when it drew
     the value itself (1.6.1/1.6.2), kept under its own name: a stack whose
     bars are meant to be compared needs them to start at the same x. */
  width: var(--epb-multi-value-width, var(${CARD.style.dynamic.alignWidth.var}, auto));
  /* Its own font-size, not the document one it would otherwise inherit: the
     block strut is what floors the line box, so 1.2em there measured ~16px of
     inherited body text and kept the row 8px taller than its slice, whatever
     the spans inside were set to. */
  font-size: var(--epb-detail-font-size, var(--current-row-detail-font-size, var(--ha-font-size-s)));
  /* The 1.2em floor protects a standalone card from OS font scaling (#131).
     A host that imposes the row's height owns that trade instead: it can spend
     the leading on type size, since nothing it does can grow the box anyway. */
  line-height: var(--current-row-line-height, max(var(--detail-height), 1.2em));
}

/* bar_max_width pins the bar, so the text is everything else - one option,
   both halves, and several rows' bars line up at the same x. The bar stops
   growing and takes the width as its basis instead: left growing, it would
   compete with the text for the free space and settle for its half of it,
   never reaching the width asked for. It doesn't shrink either: sharing the
   negative space of a text longer than its room had the bar giving pixels back
   every time the line ellipsed, which is the one thing a pinned width is asked
   to prevent. The text ellipses first, at every width.
   Nothing to do outside single_line, where the two are siblings on one row. */
ha-card.bar-max-width .${CARD.style.dynamic.singleLineRow} .${CARD.htmlStructure.sections.infoRow.class} {
  flex-grow: 1;
}

ha-card.bar-max-width
  .${CARD.style.dynamic.singleLineRow}
  .${CARD.htmlStructure.elements.progressBar.container.class} {
  flex: 0 0 var(${CARD.style.dynamic.progressBar.maxWidth.var}, auto);
}

ha-card.horizontal .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: calc(100% - 56px);
  --current-content-flex-grow: 1;
  --current-content-gap: 0;
  /* Cap the fixed name+detail height (36px) to the card so an explicit small
     card height shrinks the content-section instead of overflowing into the
     card's overflow:hidden and clipping the bar. justify-content:center then
     recenters the visible content (a lone bar) in the reduced box. */
  max-height: 100%;
}

/* hide: icon reclaims the 56px column .content's width otherwise always
   deducts for it (see the base rule above) - consistent with every other
   hide target below: hiding a field always gives its space back, nothing
   stays reserved for something that's gone. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.icon.class} .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
}

/* --current-content-height sums --name-height + --detail-height
   unconditionally - with hide: name the row's DOM goes but its share of that
   height didn't, leaving the survivor centered in empty space (issue #129).
   Horizontal-only: vertical still needs the full box for overlay/background. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

/* Only zero --detail-height when the row actually goes empty: with
   bar_position: default the bar renders inside that same row, so zeroing it
   starved the row and .content's flex-shrink then ate --name-height too (a
   regression from the #129 fix). Hence :not(.default), or the bar hidden too. */
ha-card.horizontal.${CARD.style.dynamic.hiddenComponent.secondary_info.class}:is(:not(.default), .${CARD.style.dynamic.hiddenComponent.progress_bar.class}) .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

ha-card.vertical .${CARD.htmlStructure.sections.content.class} {
  --current-content-width: 100%;
  --current-content-flex-grow: 0;
  --current-content-gap: var(--vertical-gap);
}

ha-card.vertical.default .${CARD.htmlStructure.sections.content.class} {
  /* Includes .content's 2 x 1px flex gaps: without them this floor ran 2px
     short (44px predicted vs 46px measured), so grid_options: rows: auto
     never landed on a clean row multiple. */
  --current-content-height: calc(
    var(--name-height) + var(--detail-height) + var(--progress-size) + (2 * var(--vertical-gap))
  );
}

/* Not .default-scoped (unlike --progress-size below): the base .content
   --name-height/--detail-height sum also applies to bar_position: top/
   bottom/background - .default-only left a hidden row reserved there too,
   stealing space from the icon under a small explicit height (#139). */
ha-card.vertical.${CARD.style.dynamic.hiddenComponent.name.class} .${CARD.htmlStructure.sections.content.class} {
  --name-height: 0px;
}

ha-card.vertical.${CARD.style.dynamic.hiddenComponent.secondary_info.class} .${CARD.htmlStructure.sections.content.class} {
  --detail-height: 0px;
}

/* General, not layout-scoped: name+secondary_info both invisible (explicit
   hide, or secondary_info auto-blanked below) still leaves .content a real
   flex item, biasing the centered icon off (#139). default/overlay/
   compact_below excluded - .content still hosts the bar or fill there. */
ha-card:not(.default):not(.overlay):not(.compact_below).${CARD.style.dynamic.hiddenComponent.name.class}:is(.${CARD.style.dynamic.hiddenComponent.secondary_info.class}, .secondary-info-blank) .${CARD.htmlStructure.sections.content.class} {
  display: none;
}

/* .vertical only: minGridRows()'s 1-row floor (56px default) minus the
   default 36px shape leaves 20px for padding+border - 2px short of the
   usual 2x10px --spacing, so the icon-only row grows past its reserved row.
   9px (not 10px) makes it fit exactly, assuming the default shape size. */
ha-card.vertical:not(.default):not(.overlay):not(.compact_below).${CARD.style.dynamic.hiddenComponent.name.class}:is(.${CARD.style.dynamic.hiddenComponent.secondary_info.class}, .secondary-info-blank) {
  --current-card-padding: 9px;
}

/* Zeroing --progress-size collapses both the content-height formula's share
   and .bar-container's own height, which would otherwise sit there empty. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.progress_bar.class} {
  --progress-size: 0px;
}

/* That padding-top reserves room for the bar below the icon+text block, so it
   goes with the bar. hide: icon gets no equivalent - unrelated to the icon. */
ha-card.vertical.default.${CARD.style.dynamic.hiddenComponent.progress_bar.class} .${CARD.htmlStructure.sections.container.class} {
  --current-container-padding-top: 0;
}

ha-card.type-entities .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.progress-badge .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: unset;
}

.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: var(--progress-size);
}

.vertical.up-orientation.overlay .${CARD.htmlStructure.sections.content.class} {
  --current-content-flex-grow: 1;
  --current-content-width: var(--epb-progress-bar-size, 50%);
  --current-content-height: 100%;
  /* Exclusion from the base rule's min-height (issue #131): the overlay bar
     here is position: absolute; height: 100%, which only resolves against a
     definite height. min-height: auto actually removes the constraint - leaving
     it alongside height measurably changed this item's size next to its
     non-shrinking icon sibling. */
  min-height: auto;
  height: var(--current-content-height);
}

/* === TEXT ELEMENTS === */

.${CARD.htmlStructure.elements.nameContent.class},
.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  /* flex layout, dimensions, overflow, alignment */
  display: flex;
  z-index: 1;
  align-items: var(--group-align-items, center);
  justify-content: var(--group-justify-content, flex-start);
  flex-grow: var(--group-flex-grow, initial);
  width: var(--group-width, auto);
  min-width: var(--group-min-width, 0);
  max-width: var(--group-max-width, none);
  /* min-height + a real line-height, not one pinned to it (issue #131, see
     .content): unchanged at the default font scale, grows only if a larger OS
     font size needs it. Not excluded for .vertical.up-orientation.overlay
     unlike .content: this wrapper isn't a flex item competing with the icon. */
  min-height: var(--group-height);
  line-height: max(var(--group-height), 1.2em);
  overflow: var(--group-overflow, hidden);
  text-align: var(--group-text-align, left);
  box-sizing: var(--group-box-sizing, content-box);
  margin-left: var(--group-margin-left);
  margin-right: var(--group-margin-right);
}

.${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: var(--name-height);
}

.${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-height: var(--detail-height);
  /* 45px, else a quarter - under the bar's 33%: text can ellipsis, a squeezed
     bar means nothing. Lifted on a bar_aligned row, whose column is measured. */
  --group-min-width: var(${CARD.style.dynamic.alignTextFloor.var}, min(45px, 25%));
  --group-max-width: 60%;
}

/* bar_aligned outside single_line: the value beside a default-row bar is the
   column. Scoped to that row: elsewhere the group's 100% must stand. */
ha-card.horizontal.default:not(.xlarge)
  .${CARD.htmlStructure.sections.content.class}:not(.${CARD.style.dynamic.singleLineRow})
  .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-width: var(${CARD.style.dynamic.alignWidth.var}, auto);
}

.progress-badge .${CARD.htmlStructure.elements.nameContent.class} {
  --group-height: 10px;
  font-size: 10px;
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
  --group-max-width: unset;
}

/* Same set as StructureElements.createSecondaryInfo's excludedPositions
   (structure.ts): only bar_position: default puts the bar in .secondary-info's
   row, so every other position gets the row's full width. */
ha-card:is(.vertical, .xlarge, .below, .bottom, .top, .overlay, .background, .${CARD.style.dynamic.barAroundIcon}) .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: 100%;
  --group-max-width: 100%;
}

.row-reverse .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
}

/* bar_position: compact_below (#123) is a real, separate DOM shape, not a CSS
   rearrangement (StructureElements.createContentBody): .name and
   .secondary-info share a wrapper row, the bar is a sibling row below.
   Horizontal-only (schema.ts's INERT_OPTIONS) - vertical already
   stacks the three narrowly, with no shared row to switch to. */
ha-card.horizontal.compact_below .${CARD.htmlStructure.sections.content.class} {
  --current-content-height: calc(
    max(var(--name-height), var(--detail-height)) + var(--current-progress-container-height)
  );
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.sections.nameSecondaryRow.class} {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing);
  /* baseline, not center: .name and .secondary-info-wrapper render at
     different font sizes (--ha-font-size-m vs -s) - centering each box
     still centers two differently-sized line boxes on their own midpoints,
     not on a shared text baseline, leaving the glyphs visibly offset. */
  align-items: baseline;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.nameContent.class} {
  --group-flex-grow: 1;
  --group-min-width: 0;
  --group-max-width: none;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.secondaryInfoWrapper.class} {
  --group-min-width: unset;
  --group-max-width: unset;
}
ha-card.horizontal.compact_below .${CARD.htmlStructure.elements.progressBar.container.class} {
  min-width: unset;
}

.${CARD.layout.orientations.vertical.label} {
  --group-justify-content: center;
  --group-width: 100%;
  --group-max-width: 100%;
  --group-flex-grow: 0;
  --group-text-align: center;
  --group-box-sizing: border-box;
}

.${CARD.layout.orientations.vertical.label} .${CARD.style.bar.sizeOptions.large} {
  --name-height: var(--vertical-name-large-height);
}

.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 7px;
  --group-margin-right: 10px;
}
.vertical.up-orientation.overlay :is(.${CARD.htmlStructure.elements.nameContent.class}, .${CARD.htmlStructure.elements.secondaryInfoWrapper.class}) {
  --group-margin-left: 0;
  --group-margin-right: 0;
}

.ellipsis-wrapper,
.${CARD.htmlStructure.sections.infoRow.class} {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  line-height: 100%;
  width: 100%;
}

.ellipsis-wrapper span {
  display: inline;
}

.${CARD.htmlStructure.elements.nameValue.class},
.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  color: var(--text-color);
  font-size: var(--text-font-size);
  font-weight: var(--text-font-weight);
  /* min-height, not height (issue #131, see .content): --text-height stays the
     floor at the default font scale, a larger OS font size grows this box
     instead of clipping text mid-glyph. Not excluded for vertical+up+overlay -
     see .name-content's comment on why this level has no flex conflict. */
  min-height: var(--text-height);
  line-height: var(--text-line-height);
  letter-spacing: var(--text-letter-spacing);
  margin-right: var(--text-margin-right);
  text-shadow: var(--text-shadow);
}

.${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--primary-text-color));
  --text-font-size: var(--epb-name-font-size, var(--ha-font-size-m));
  --text-font-weight: var(--epb-name-font-weight, var(--ha-font-weight-medium));
  --text-height: var(--name-height);
  /* max(), not a straight swap to another token (issue #131): pinning
     line-height to the box's own px floor clips the text as soon as OS font
     scaling needs a taller line. max() keeps --name-height as the floor and
     only grows past it via the em term, which tracks the real font-size. */
  --text-line-height: max(var(--name-height), 1.2em);
  --text-letter-spacing: var(--epb-name-letter-spacing, var(--name-letter-spacing));
  --text-margin-right: 0;
}

.${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  /* Now a div (see CARD.htmlStructure.elements.secondaryInfoValue): it's the direct
     block-level parent of the extra/main spans, so it - not just the outer
     .ellipsis-wrapper - needs its own single-line ellipsis truncation. */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  --text-color: var(--epb-detail-color, var(--primary-text-color));
  --text-font-size: var(--epb-detail-font-size, var(--current-row-detail-font-size, var(--ha-font-size-s)));
  --text-font-weight: var(--epb-detail-font-weight, var(--ha-font-weight-body));
  --text-height: var(--detail-height);
  /* See .name-value's own --text-line-height comment (issue #131) - same
     max(fixed-floor, em-term) reasoning. */
  --text-line-height: max(var(--detail-height), 1.2em);
  --text-letter-spacing: var(--epb-detail-letter-spacing, var(--detail-letter-spacing));
  --text-margin-right: 0;
}

.progress-badge .${CARD.htmlStructure.elements.nameValue.class} {
  --text-color: var(--epb-name-color, var(--secondary-text-color));
  --text-font-size: var(--epb-name-font-size, 10px);
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: 10px;
  --text-line-height: max(10px, 1.2em);
  --text-margin-right: 5px;
  --text-letter-spacing: var(--name-letter-spacing);
}

.progress-badge .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--primary-text-color);
  --text-font-size: var(--ha-badge-font-size, var(--ha-font-size-s));
  --text-font-weight: var(--ha-font-weight-medium);
  --text-height: var(--text-font-size);
  --text-line-height: var(--ha-line-height-condensed);
  --text-letter-spacing: var(--name-letter-spacing);
}

.type-entities :is(.${CARD.htmlStructure.elements.nameValue.class}, 
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-height: var(--entities-height);
  --text-font-weight: var(--ha-font-weight-normal);
  --text-line-height: var(--ha-line-height-normal);
}

.type-entities .${CARD.htmlStructure.elements.secondaryInfoValue.class} {
  --text-color: var(--secondary-text-color);
  --text-font-size: var(--ha-font-size-m);
}

:is(.overlay, .background).text-shadow :is(.${CARD.htmlStructure.elements.nameValue.class},
                    .${CARD.htmlStructure.elements.secondaryInfoValue.class}) {
  --text-shadow: 1px 1px 2px var(--card-background-color);
}

/* === SECONDARY INFO === */
.${CARD.htmlStructure.elements.secondaryInfo.class} {
  display: flex;
  flex-direction: var(--current-secondary-info-flex-direction);
  align-items: var(--current-secondary-info-align-items);
  /* Same shrink-under-pressure idea as the text/bar min-width coupling above:
     the gap gives up a few px once the row gets tight. */
  gap: min(var(--current-secondary-info-gap, var(--spacing)), 6%);
  width: var(--current-secondary-info-width, auto);
  min-width: var(--current-secondary-info-min-width, auto);
  justify-content: space-between;
}

/* .secondary-info-blank is pushed by
   HABase#_updateSecondaryInfoWrapperVisibility (core.ts) whenever every info
   line is empty, single or multiline - one rule instead of two. Class-based on
   purpose: :has() needs Firefox 121+, past this card's documented 94+ floor. */
.secondary-info-blank .secondary-info-wrapper {
  display: none;
}

.${CARD.layout.orientations.horizontal.label} {
  --current-secondary-info-flex-direction: var(--secondary-info-row-reverse, row);
  --current-secondary-info-align-items: stretch;
  --current-secondary-info-gap: var(--spacing);
  --current-secondary-info-width: auto;
  --current-secondary-info-min-width: auto;
}

.${CARD.layout.orientations.vertical.label} {
  --current-secondary-info-flex-direction: column;
  --current-secondary-info-align-items: center;
  --current-secondary-info-gap: unset;
  --current-secondary-info-width: 100%;
  --current-secondary-info-min-width: 0;
}

.progress-badge {
  --current-secondary-info-gap: 5px;
}

/* === MULTILINE SECONDARY INFO ===
   Two stacked single-line boxes (StructureElements.secondaryInfoLine), each
   with its own ellipsis. --name-height gives its spare 4px to --detail-height
   so the card's total height doesn't change. */
ha-card.info-multiline {
  --name-height: 16px;
  --detail-height: 20px;
}

.info-multiline .secondary-info-wrapper {
  flex-direction: column;
  /* The --group-* indirection .secondary-info-wrapper's base rule already
     reads - keeps this a one-line diff instead of a competing source. */
  --group-justify-content: center;
  --group-align-items: stretch;
  gap: 0;
  /* Without this, mobile/Chromium font-boosting (text autosizing) bumps a small
     declared size up to whatever it judges "readable" for the container width -
     seen in the wild inflating 8px to ~10.5px, which no longer fits the budget. */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.info-multiline .secondary-info-wrapper > .ellipsis-wrapper {
  height: 10px;
  line-height: 0.95;
  margin: 0;
  padding: 0;
}

.info-multiline .secondary-info-wrapper .secondary-info-value {
  --text-height: 10px;
  --text-line-height: 0.95;
  --text-font-size: 10px;
}

.info-multiline .secondary-info .bar-container {
  /* .secondary-info stretches its children by default (see --current-secondary-info-align-items
     above) so the bar would otherwise be pulled to the 2-line wrapper's height. */
  align-self: center;
}
`;

export { CONTENT_CSS };
