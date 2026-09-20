/*
 * Version string and the card/badge/feature/editor type metadata. No logic,
 * just data. Split out of parameters.ts so the CARD config tree and the
 * dev/debug context can both import it without an import cycle.
 */

// Injected by scripts/build.js. The "-light" bundle carries no editor, so
// every type declares no editor tag: HACore.getConfigElement then returns
// null, which Home Assistant reads as "no visual editor" and answers with its
// own YAML editor (hui-element-editor's `if (this._configElement)`).
declare const __EPB_LIGHT_BUILD__: boolean;

// Inlined at each site rather than wrapped in a helper: esbuild folds the
// constant and drops the dead branch, so a light build carries none of the
// editor tag names at all.
const LIGHT_BUILD = __EPB_LIGHT_BUILD__;

const VERSION = '1.6.3-rc8';

const CARD_DESCRIPTION = 'A cool custom card to show current entity status with a progress bar.';
const BADGE_DESCRIPTION = 'A cool custom badge to show current entity status with a progress bar.';

const META = {
  documentation: `https://github.com/francois-le-ko4la/lovelace-entity-progress-card/tree/${VERSION}`,
  types: {
    card: {
      typeName: 'entity-progress-card',
      name: 'Entity Progress Card',
      description: CARD_DESCRIPTION,
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-card-editor',
    },
    template: {
      typeName: 'entity-progress-card-template',
      name: 'Entity Progress Card (Template)',
      description: CARD_DESCRIPTION,
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-card-template-editor',
    },
    badge: {
      typeName: 'entity-progress-badge',
      name: 'Entity Progress Badge',
      description: BADGE_DESCRIPTION,
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-badge-editor',
    },
    badgeTemplate: {
      typeName: 'entity-progress-badge-template',
      name: 'Entity Progress Badge (Template)',
      description: BADGE_DESCRIPTION,
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-badge-template-editor',
    },
    feature: {
      typeName: 'entity-progress-feature',
      name: 'Entity Progress Feature',
      description: 'A cool custom feature in tile to show current entity status with a progress bar.',
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-feature-editor',
    },
    multiCard: {
      typeName: 'entity-progress-multi-card',
      name: 'Entity Progress Multi Card',
      description: 'Aggregates several entity progress bars in one grid-sized card.',
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-multi-card-editor',
    },
    multiFeature: {
      typeName: 'entity-progress-multi-feature',
      name: 'Entity Progress Multi Feature',
      description: 'Aggregates several entity progress bars in one tile feature.',
      editor: __EPB_LIGHT_BUILD__ ? undefined : 'entity-progress-multi-feature-editor',
    },
  },
};

export { VERSION, META, LIGHT_BUILD };
