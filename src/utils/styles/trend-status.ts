import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const TREND_STATUS_CSS = css`
/* =============================================================================
   TREND
   ============================================================================= */

.trend-indicator,
.trend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-size);
  height: var(--badge-size);
}

.trend-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
}

.trend-icon {
  color: var(--epb-trend-icon-color, var(${CARD.style.dynamic.trendIndicator.color.var}, var(--state-icon-color)));
}

/* =============================================================================
   STATUS LABEL
   ============================================================================= */

/* GitHub-label-style pill, mutually exclusive with .trend-indicator
   (schema.ts's HAS_EFFECT.trendIndicator). Same recipe as Primer's own dark-theme issue
   labels (@primer/react IssueLabelToken.module.css): a translucent tint for the
   background, border/text the same hue lightened just enough to stay legible.
   --epb-label-color/-background-color/-border-color override each separately. */
.status-label {
  --label-perceived-lightness: calc(
    ((var(${CARD.style.dynamic.label.r.var}, ${CARD.style.dynamic.label.r.default}) * 0.2126) +
      (var(${CARD.style.dynamic.label.g.var}, ${CARD.style.dynamic.label.g.default}) * 0.7152) +
      (var(${CARD.style.dynamic.label.b.var}, ${CARD.style.dynamic.label.b.default}) * 0.0722)) / 255
  );
  --label-lightness-threshold: 0.6;
  --label-lightness-switch: max(
    0,
    min(calc(1 / (var(--label-lightness-threshold) - var(--label-perceived-lightness))), 1)
  );
  --label-lighten-by: calc(
    ((var(--label-lightness-threshold) - var(--label-perceived-lightness)) * 100) * var(--label-lightness-switch)
  );

  position: absolute;
  top: 4px;
  right: 4px;
  max-width: calc(100% - 8px);
  z-index: 1;
  box-sizing: border-box;
  padding: 0 4px;
  border-radius: 999px;
  /* Same 10px used by multiline's own secondary-info-value (see
     .info-multiline .secondary-info-wrapper .secondary-info-value) - a
     smaller, established "compact text" reference instead of matching
     secondary_info's own full size. */
  font-size: 10px;
  font-weight: var(--ha-font-weight-medium);
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid
    var(
      --epb-label-border-color,
      hsla(
        var(${CARD.style.dynamic.label.h.var}, ${CARD.style.dynamic.label.h.default}),
        calc(var(${CARD.style.dynamic.label.s.var}, ${CARD.style.dynamic.label.s.default}) * 1%),
        calc((var(${CARD.style.dynamic.label.l.var}, ${CARD.style.dynamic.label.l.default}) + var(--label-lighten-by)) * 1%),
        0.3
      )
    );
  background-color: var(
    --epb-label-background-color,
    rgba(
      var(${CARD.style.dynamic.label.r.var}, ${CARD.style.dynamic.label.r.default}),
      var(${CARD.style.dynamic.label.g.var}, ${CARD.style.dynamic.label.g.default}),
      var(${CARD.style.dynamic.label.b.var}, ${CARD.style.dynamic.label.b.default}),
      0.18
    )
  );
  color: var(
    --epb-label-color,
    hsl(
      var(${CARD.style.dynamic.label.h.var}, ${CARD.style.dynamic.label.h.default}),
      calc(var(${CARD.style.dynamic.label.s.var}, ${CARD.style.dynamic.label.s.default}) * 1%),
      calc((var(${CARD.style.dynamic.label.l.var}, ${CARD.style.dynamic.label.l.default}) + var(--label-lighten-by)) * 1%)
    )
  );
}

.status-label:empty {
  display: none;
}

/* label_position: left - swaps which corner the pill sits in (see
   HACore._addBaseClasses). right stays the plain default above, no class
   needed for it. */
ha-card.label-left .status-label {
  right: auto;
  left: 4px;
}
`;

export { TREND_STATUS_CSS };
