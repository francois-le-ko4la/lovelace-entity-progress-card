import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const ALERT_CSS = css`
/* === ALERT (alert_when: {above/below, color, highlight, animation}) ===
   highlight: border colors the border, background tints the card instead.
   ping is border-only (ViewCore.alertAnimation falls back for background).
   Under prefers-reduced-motion the base color stays, so the alert still reads. */
@keyframes epb-alert-border {
  0%, 100% { border-color: var(--alert-color-final); }
  50% { border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0))); }
}

/* Base tier: an opacity-animated ::before overlay instead of animating
   background-color on ha-card each frame, which isn't compositor-only (same
   reasoning as epb-ping's own rewrite above). ha-card goes neutral for the
   duration so the overlay reads the same. The modern tier keeps its original
   color-mix() animation and switches the overlay off instead. */
@keyframes epb-alert-background {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0; }
}

@keyframes epb-alert-background-modern {
  0%, 100% { background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color))); }
  50% { background-color: var(--ha-card-background, var(--card-background-color)); }
}

/* highlight: label's own pill-scoped variant - the card-border modes above
   blink the border, this one blinks the pill instead. */
@keyframes epb-alert-label-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alert-active {
  --alert-color-final: var(--alert-color, var(--error-color, #db4437));
  border-color: var(--alert-color-final);
}

/* :not(.alert-label): that mode neutralizes border-color itself (see
   .alert-active.alert-label below) and animates .status-label instead -
   without this exclusion, the border would still blink/ping underneath a
   pill that's supposed to be carrying the alert on its own. */
.alert-active.alert-anim-blink:not(.alert-label) {
  animation: epb-alert-border 1.2s ease-in-out infinite;
}

.alert-active.alert-anim-ping:not(.alert-label) {
  --epb-ping-color: var(--alert-color-final);

  animation: epb-ping 1.5s ease-out infinite;
  /* Same box-shadow repaint cost as icon-anim-ping above, but on the whole
     card rather than a small icon - more noticeable, so worth the same hint. */
  will-change: box-shadow;
}

/* Same overlay-vs-background-color reasoning as epb-alert-background's own
   comment above - old engines get this fixed-opacity tint instead. */
.alert-active.alert-background {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
  background-color: var(--ha-card-background, var(--card-background-color));
}

.alert-active.alert-background::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--alert-color-final);
  opacity: var(--epb-alert-background-opacity, 0.15);
  pointer-events: none;
}

@supports (background: color-mix(in srgb, red, blue)) {
  .alert-active.alert-background::before {
    content: none;
  }

  .alert-active.alert-background {
    background-color: color-mix(in srgb, var(--alert-color-final) 15%, var(--ha-card-background, var(--card-background-color)));
  }
}

/* Blink: the overlay above swaps its fixed opacity for the animated one
   instead of getting a whole separate layer. */
.alert-active.alert-background.alert-anim-blink::before {
  animation: epb-alert-background 1.2s ease-in-out infinite;
}

@supports (background: color-mix(in srgb, red, blue)) {
  /* Modern tier: the original background-color + color-mix() animation on
     ha-card itself, unchanged - overlay already off (see above). */
  .alert-active.alert-background.alert-anim-blink {
    animation: epb-alert-background-modern 1.2s ease-in-out infinite;
  }
}

/* highlight: label - the status pill (Alert, alert.ts) carries the
   alert, so the card's own border/background stays neutral here and blink/ping
   target .status-label. :not(.alert-label) on the rules above keeps this mode
   from also pulsing a border. --alert-color-final is inherited from
   .alert-active, custom properties crossing the descendant boundary. */
.alert-active.alert-label {
  border-color: var(--epb-card-border-color, var(--ha-card-border-color, var(--divider-color, #e0e0e0)));
}

.alert-active.alert-label.alert-anim-blink .status-label {
  animation: epb-alert-label-blink 1.2s ease-in-out infinite;
}

.alert-active.alert-label.alert-anim-ping .status-label {
  --epb-ping-color: var(--alert-color-final);
  --epb-ping-spread: 8px;

  animation: epb-ping 1.5s ease-out infinite;
  will-change: box-shadow;
}

/* Modern tier for every epb-ping consumer at once: the ring takes a 70% alpha
   wherever color-mix() resolves, staying solid everywhere else (issue #128). */
@supports (background: color-mix(in srgb, red, blue)) {
  .icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
    --epb-ping-color: color-mix(in srgb, var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default})) 70%, transparent);
  }

  .alert-active.alert-anim-ping:not(.alert-label),
  .alert-active.alert-label.alert-anim-ping .status-label {
    --epb-ping-color: color-mix(in srgb, var(--alert-color-final) 70%, transparent);
  }
}
`;

export { ALERT_CSS };
