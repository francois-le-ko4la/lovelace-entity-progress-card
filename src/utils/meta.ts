/*
 * Version string and the card/badge/feature/editor type metadata. No logic,
 * just data. Split out of parameters.ts so the CARD config tree and the
 * dev/debug context can both import it without an import cycle.
 */

const VERSION = '1.6.3-rc1';

const CARD_DESCRIPTION = 'A cool custom card to show current entity status with a progress bar.';
const BADGE_DESCRIPTION = 'A cool custom badge to show current entity status with a progress bar.';

const META = {
  documentation: `https://github.com/francois-le-ko4la/lovelace-entity-progress-card/tree/${VERSION}`,
  types: {
    card: {
      typeName: 'entity-progress-card',
      name: 'Entity Progress Card',
      description: CARD_DESCRIPTION,
      editor: 'entity-progress-card-editor',
    },
    template: {
      typeName: 'entity-progress-card-template',
      name: 'Entity Progress Card (Template)',
      description: CARD_DESCRIPTION,
      editor: 'entity-progress-card-template-editor',
    },
    badge: {
      typeName: 'entity-progress-badge',
      name: 'Entity Progress Badge',
      description: BADGE_DESCRIPTION,
      editor: 'entity-progress-badge-editor',
    },
    badgeTemplate: {
      typeName: 'entity-progress-badge-template',
      name: 'Entity Progress Badge (Template)',
      description: BADGE_DESCRIPTION,
      editor: 'entity-progress-badge-template-editor',
    },
    feature: {
      typeName: 'entity-progress-feature',
      name: 'Entity Progress Feature',
      description: 'A cool custom feature in tile to show current entity status with a progress bar.',
      editor: 'entity-progress-feature-editor',
    },
    multiCard: {
      typeName: 'entity-progress-multi-card',
      name: 'Entity Progress Multi Card',
      description: 'Aggregates several entity progress bars in one grid-sized card.',
      editor: 'entity-progress-multi-card-editor',
    },
    multiFeature: {
      typeName: 'entity-progress-multi-feature',
      name: 'Entity Progress Multi Feature',
      description: 'Aggregates several entity progress bars in one tile feature.',
      editor: 'entity-progress-multi-feature-editor',
    },
  },
};

export { VERSION, META };
