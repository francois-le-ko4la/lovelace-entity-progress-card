import { CARD } from '../parameters.js';

// glass/gradient/gradient_reverse all paint the same ::before layer - one
// fragment instead of the same 3-class :is() list spelled out 8 times below.
const BAR_EFFECT_GRADIENTS = `:is(.${CARD.style.dynamic.progressBar.effect.glass.class}, .${CARD.style.dynamic.progressBar.effect.gradient.class}, .${CARD.style.dynamic.progressBar.effect.gradientReverse.class})`;

const DOWN_BAR = `.vertical-bar.${CARD.style.dynamic.progressBar.orientation.down}`;

export { BAR_EFFECT_GRADIENTS, DOWN_BAR };
