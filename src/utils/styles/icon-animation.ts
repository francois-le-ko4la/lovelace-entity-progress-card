import { css } from './css-tag.js';
import { CARD } from '../parameters.js';

const ICON_ANIMATION_CSS = css`
/**
 * === ICON ANIMATION (icon_animation:
 * spin|pulse|bounce|shake|ping|reveal|washing_machine|battery_charging;
 * battery_charging triggers on a charging attribute, the rest on active
 * state) ===
 */
@keyframes epb-icon-spin {
  to { transform: rotate(360deg); }
}

@keyframes epb-icon-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}

@keyframes epb-icon-bounce {
  0% { transform: scale3d(1, 1, 1); }
  7% { transform: scale3d(1.25, 0.75, 1); }
  10% { transform: scale3d(0.75, 1.25, 1); }
  12% { transform: scale3d(1.15, 0.85, 1); }
  16% { transform: scale3d(0.95, 1.05, 1); }
  19% { transform: scale3d(1.05, 0.95, 1); }
  25% { transform: scale3d(1, 1, 1); }
}

@keyframes epb-icon-shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(0.4px, -0.4px) rotate(-4deg); }
  40% { transform: translate(-0.4px, 0.4px) rotate(4deg); }
  60% { transform: translate(0.4px, 0.4px) rotate(-4deg); }
  80% { transform: translate(-0.4px, -0.4px) rotate(4deg); }
}

/* Shared sonar ring (icon + alert ping). Color via a custom property: a
   color-mix() inside the frame kills the animation on Chrome 92 (issue #128). */
@keyframes epb-ping {
  60% {
    box-shadow: 0 0 0 0 var(--epb-ping-color);
  }
  100% { box-shadow: 0 0 5px var(--epb-ping-spread, 15px) transparent; }
}

@keyframes epb-icon-reveal {
  0% { clip-path: circle(0% at 50% 85%); }
  20% { clip-path: circle(30% at 50% 85%); }
  40% { clip-path: circle(55% at 50% 85%); }
  60% { clip-path: circle(80% at 50% 85%); }
}

/* porthole wipe, mid-cycle only - the implicit 0%/100% (no clip-path, icon
   fully visible) is the resting frame; paired with epb-icon-shake (already
   defined above) on .icon-anim-washing-machine for the drum-spin look */
@keyframes epb-icon-drum {
  50% {
    clip-path: polygon(0 0, 0 100%, 35% 100%, 34% 68%, 60% 41%, 71% 56%, 65% 74%, 47% 79%, 32% 69%, 35% 100%, 100% 100%, 100% 0);
  }
}

/* battery-bolt fill wipe, 80%-100% holds between sweeps. The bolt's edges are
   vars (--epb-charge-x1/x2/y1) so .icon-anim-battery-charging-shifted can
   compensate off-center glyph variants - see ViewCore.isBatteryIconShifted. */
@keyframes epb-icon-charge {
  0%, 80% { clip-path: inset(0 0 0 0); }
  10% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 60%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 60%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  20% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 50%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 50%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  30% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 40%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 40%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  40% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 30%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 30%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  50% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 20%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 20%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  60% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) calc(var(--epb-charge-y1, 29%) + 10%),
      var(--epb-charge-x1, 34%) calc(var(--epb-charge-y1, 29%) + 10%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
  70% {
    clip-path: polygon(
      0% 0%, 0% 100%, var(--epb-charge-x1, 34%) 100%, var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%), var(--epb-charge-x2, 67%) var(--epb-charge-y1, 29%),
      var(--epb-charge-x1, 34%) var(--epb-charge-y1, 29%), var(--epb-charge-x1, 34%) 100%, 100% 100%, 100% 0%
    );
  }
}

.icon-anim-spin .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-spin 2s linear infinite;
}

.icon-anim-pulse .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-pulse 1.6s ease-in-out infinite;
}

.icon-anim-bounce .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-bounce 3s ease infinite;
  transform-origin: 50% 90%;
}

.icon-anim-shake .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 800ms ease-in-out infinite;
  transform-origin: 50% 110%;
}

.icon-anim-ping .${CARD.htmlStructure.elements.shape.class} {
  --epb-ping-color: var(--epb-icon-and-shape-color, var(${CARD.style.dynamic.iconAndShape.color.var}, ${CARD.style.dynamic.iconAndShape.color.default}));

  animation: epb-ping 2s infinite;
  /* box-shadow isn't compositor-only: the browser repaints every frame of the
     infinite animation - will-change isolates that cost to this element. */
  will-change: box-shadow;
}

.icon-anim-washing-machine .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-shake 400ms ease-in-out infinite, epb-icon-drum 2s ease infinite;
  transform-origin: 50% 110%;
}

.icon-anim-reveal .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-reveal 2s steps(1) infinite;
}

.icon-anim-battery-charging .${CARD.htmlStructure.elements.icon.class} {
  animation: epb-icon-charge 3s linear infinite;
}

/* Placeholder offset for battery-charging/battery-bluetooth icon variants -
   needs live tuning against the actual glyph, see ViewCore.isBatteryIconShifted */
.icon-anim-battery-charging-shifted .${CARD.htmlStructure.elements.icon.class} {
  --epb-charge-x1: 17.5%;
  --epb-charge-x2: 50.5%;
  --epb-charge-y1: 25%;
}
`;

export { ICON_ANIMATION_CSS };
