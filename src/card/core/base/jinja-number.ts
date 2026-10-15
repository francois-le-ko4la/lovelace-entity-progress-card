import { is, toNumberOrNull } from '../../../utils/common-checks.js';
import { type Config } from '../../../utils/types.js';
import { type ViewCore } from '../../view/core.js';
import { type JinjaNumberProp, JINJA_NUMBER_KEY } from '../core.js';

// Every Jinja-pushed number shares this guard/parse/skip-if-unchanged -
// only `repaint` differs per option.
const applyJinjaNumber = (
  view: ViewCore,
  content: unknown,
  getJinja: (c: Config) => string | undefined,
  viewProp: JinjaNumberProp,
  repaint: () => void,
) => {
  // Defensive: only apply while the option is still in { jinja: "..." } mode:
  // guards against a push landing as the user switches the mode chips away.
  if (!is.nonEmptyString(getJinja(view.config))) return;
  const state = view.jinjaState;
  const value = toNumberOrNull(content);
  const key = JINJA_NUMBER_KEY[viewProp];
  // A result that is no number (an 'unavailable' state) fails like a refusal.
  const failure = value === null ? '' : null;
  if (value === state[viewProp] && failure === state.failure(key)) return;
  state[viewProp] = value;
  state.setFailure(key, failure);
  repaint();
};

export { applyJinjaNumber };
