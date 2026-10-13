import { test } from 'node:test';
import assert from 'node:assert/strict';

const MEMBERS = [
  'applyDensityConstraints',
  'badgeRestrictedType',
  'barEffectFields',
  'build',
  'buildFeature',
  'buildMulti',
  'buildMultiRow',
  'cardSizeFields',
  'content',
  'general',
  'hideChipsItems',
  'interactions',
  'layout',
  'lengthField',
  'markerPanels',
  'markers',
  'peakMarkerFields',
  'statusLabelFields',
  'theme',
  'themeActive',
  'themeAlertFields',
  'themeBadgeIconColorFields',
  'themeBarSizingFields',
  'themeCardLayoutFields',
  'themeCardOnlyFields',
  'themeColorModeFields',
  'themeLayoutField',
  'themeMaxWidthFields',
  'themeModeFields',
  'themeSingleLineShadowFields',
  'themeWatermarkFields',
  'trendIndicatorFields',
];

test('factory.js keeps its public surface', async () => {
  const factory = await import('../../src/editor/factory.js');
  assert.deepEqual(Object.keys(factory).sort(), ['CONTEXT_ENTITY_KEY', 'EditorFactory', 'effectiveEntity']);
});

test('EditorFactory keeps its members', async () => {
  const factory = await import('../../src/editor/factory.js');
  assert.deepEqual(Object.keys(factory.EditorFactory).sort(), MEMBERS);
});
