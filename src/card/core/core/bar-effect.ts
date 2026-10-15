import { CARD } from '../../../utils/parameters.js';
import { is } from '../../../utils/common-checks.js';
import { type ViewCore } from '../../view/core.js';
import { type DOMHelper } from '../../dom/dom-helpers.js';

// Jinja/YAML bypass the editor's effect guard; incompatible pairs share a CSS
// property, so the first requested wins instead of stylesheet order.
const resolveEffectConflicts = (labels: string[]): string[] => {
  const incompatible: Record<string, string[]> = CARD.style.dynamic.progressBar.effectIncompatibilities;
  const kept: string[] = [];
  for (const label of labels) {
    if (kept.some((keptLabel) => incompatible[keptLabel]?.includes(label))) continue;
    kept.push(label);
  }
  return kept;
};

const applyBarEffects = ({ view, dom }: { view: ViewCore; dom: DOMHelper }, jinjaEffect: string[] | null) => {
  if (!view.barEffectsEnabled) return;
  const isJinja = is.jinja(view.config.bar_effect);
  if (isJinja && !jinjaEffect) return;

  const requested = isJinja
    ? (jinjaEffect ?? [])
    : is.array(view.config.bar_effect)
      ? (view.config.bar_effect as string[])
      : [];
  const resolved = resolveEffectConflicts(requested);

  Object.values(CARD.style.dynamic.progressBar.effect).forEach((effect) => {
    dom.toggleClass(CARD.htmlStructure.card.element, effect.class, resolved.includes(effect.label));
  });
};

// CF5 - issue (critical) resolved - render_template returns native types: a
// template yielding a list (e.g. {{ ['glass'] }}) crashed on .split()
const barEffectsOf = (content: unknown): string[] =>
  (is.array(content) ? content : String(content ?? '').split(',')).map((s: unknown) => String(s).trim());

export { applyBarEffects, barEffectsOf };
