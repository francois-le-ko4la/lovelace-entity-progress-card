// The editor file's entry point, imported by HACore.getConfigElement the first
// time an editor opens: each card type's editor, under its META tag.

import { META, devName } from '../utils/parameters.js';
import { defineElement } from '../utils/register.js';
import {
  EntityProgressCardEditor,
  EntityProgressBadgeEditor,
  EntityProgressTemplateEditor,
  EntityProgressBadgeTemplateEditor,
  EntityProgressFeatureEditor,
  EntityProgressMultiCardEditor,
  EntityProgressMultiFeatureEditor,
} from './editors.js';

const EDITORS: Record<keyof typeof META.types, CustomElementConstructor> = {
  card: EntityProgressCardEditor,
  badge: EntityProgressBadgeEditor,
  template: EntityProgressTemplateEditor,
  badgeTemplate: EntityProgressBadgeTemplateEditor,
  feature: EntityProgressFeatureEditor,
  multiCard: EntityProgressMultiCardEditor,
  multiFeature: EntityProgressMultiFeatureEditor,
};

for (const [type, editor] of Object.entries(EDITORS)) {
  defineElement(devName(META.types[type as keyof typeof META.types].editor), editor);
}
