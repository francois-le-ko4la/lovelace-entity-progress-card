// The three HA asks a full card for and never a badge or a feature. Shared
// because Card and TemplateCard have no common ancestor below HABase, so
// nothing else keeps the two lists in step.
const CARD_LAYOUT_METHODS = ['getCardSize', 'getLayoutOptions', 'getGridOptions'] as const;

export { CARD_LAYOUT_METHODS };
