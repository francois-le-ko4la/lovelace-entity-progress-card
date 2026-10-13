/*
 * EditorFactory: builds the field-definition tree
 * (general/content/theme/interactions sections) that EditorBase renders, per
 * card type (card/badge/template/badgeTemplate).
 */

import { general, content, hideChipsItems, interactions } from './groups/general.js';
import {
  themeModeFields,
  badgeRestrictedType,
  themeColorModeFields,
  themeCardOnlyFields,
  themeSingleLineShadowFields,
  themeActive,
  themeBarSizingFields,
  barEffectFields,
  theme,
} from './groups/theme.js';
import {
  lengthField,
  themeMaxWidthFields,
  themeCardLayoutFields,
  cardSizeFields,
  themeLayoutField,
  applyDensityConstraints,
  layout,
} from './groups/layout.js';
import {
  themeWatermarkFields,
  peakMarkerFields,
  trendIndicatorFields,
  themeBadgeIconColorFields,
  themeAlertFields,
  statusLabelFields,
  markerPanels,
  markers,
} from './groups/markers.js';
import { build, buildFeature, buildMulti, buildMultiRow } from './groups/build.js';

const EditorFactory = {
  general,
  content,
  themeModeFields,
  badgeRestrictedType,
  lengthField,
  themeColorModeFields,
  themeCardOnlyFields,
  themeSingleLineShadowFields,
  themeMaxWidthFields,
  themeWatermarkFields,
  peakMarkerFields,
  trendIndicatorFields,
  themeBadgeIconColorFields,
  themeAlertFields,
  themeCardLayoutFields,
  cardSizeFields,
  themeLayoutField,
  themeActive,
  hideChipsItems,
  applyDensityConstraints,
  themeBarSizingFields,
  barEffectFields,
  theme,
  statusLabelFields,
  markerPanels,
  markers,
  layout,
  interactions,
  build,
  buildFeature,
  buildMulti,
  buildMultiRow,
};

export { EditorFactory };
export { effectiveEntity, CONTEXT_ENTITY_KEY } from './fields/base.js';
