/*
 * The concrete per-card-type editor classes: pairs each ConfigHelper with the
 * field set EditorFactory builds for it.
 */

import { CardConfigHelper, BadgeConfigHelper, TemplateConfigHelper, BadgeTemplateConfigHelper } from '../card/config-helpers.js';
import { EditorBase } from './base.js';
import { EditorFactory } from './factory.js';

class EntityProgressCardEditor extends EditorBase {
  _configHelper = new CardConfigHelper();
  static _fields = EditorFactory.build(false, false);
}

/******************************************************************************
 * 🛠️ EntityProgressBadgeEditor
 * ============================================================================
 */
class EntityProgressBadgeEditor extends EditorBase {
  _configHelper = new BadgeConfigHelper();
  static _fields = EditorFactory.build(false, true);
}

/******************************************************************************
 * 🛠️ EntityProgressTemplateEditor
 * ============================================================================
 */

class EntityProgressTemplateEditor extends EditorBase {
  _configHelper = new TemplateConfigHelper();
  static _fields = EditorFactory.build(true, false);
}

/******************************************************************************
 * 🛠️ EntityProgressBadgeTemplateEditor
 * ============================================================================
 */

class EntityProgressBadgeTemplateEditor extends EditorBase {
  _configHelper = new BadgeTemplateConfigHelper();
  static _fields = EditorFactory.build(true, true);
}

export { EntityProgressCardEditor };
export { EntityProgressBadgeEditor };
export { EntityProgressTemplateEditor };
export { EntityProgressBadgeTemplateEditor };
