/*
 * The view layer: per-card-type classes that expose computed, ready-to-render
 * values (percent, colors, watermark position, trend...) derived from the
 * negotiated config and current entity state.
 */

export { ViewCore } from './view/core.js';
export { ViewBase, CardView, BadgeView, FeatureView } from './view/base.js';
export { type TemplateView, CardTemplateView, BadgeTemplateView } from './view/template.js';
