/*
 * The concrete per-card-type editor classes: pairs each ConfigHelper with the
 * field set EditorFactory builds for it.
 */

import {
  CardConfigHelper,
  BadgeConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
  FeatureConfigHelper,
} from '../card/config-helpers.js';
import { EditorBase } from './base.js';
import { EditorFactory } from './factory.js';

class EntityProgressCardEditor extends EditorBase {
  _configHelper = new CardConfigHelper();
  static _fields = EditorFactory.build({ template: false, badge: false });
}

class EntityProgressBadgeEditor extends EditorBase {
  _configHelper = new BadgeConfigHelper();
  static _fields = EditorFactory.build({ template: false, badge: true });
}

class EntityProgressTemplateEditor extends EditorBase {
  _configHelper = new TemplateConfigHelper();
  static _fields = EditorFactory.build({ template: true, badge: false });
}

class EntityProgressBadgeTemplateEditor extends EditorBase {
  _configHelper = new BadgeTemplateConfigHelper();
  static _fields = EditorFactory.build({ template: true, badge: true });
}

class EntityProgressFeatureEditor extends EditorBase {
  _configHelper = new FeatureConfigHelper();
  static _fields = EditorFactory.buildFeature();
}

export { EntityProgressCardEditor };
export { EntityProgressBadgeEditor };
export { EntityProgressTemplateEditor };
export { EntityProgressBadgeTemplateEditor };
export { EntityProgressFeatureEditor };
