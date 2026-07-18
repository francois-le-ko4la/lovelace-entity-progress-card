/*
 * The concrete per-card-type editor classes: pairs each ConfigHelper with the
 * field set EditorFactory builds for it.
 */

import {
  CardConfigHelper,
  BadgeConfigHelper,
  TemplateConfigHelper,
  BadgeTemplateConfigHelper,
} from '../card/config-helpers.js';
import { EditorBase } from './base.js';
import { EditorFactory } from './factory.js';

/**
 * Visual editor for the standard card type — CardConfigHelper,
 * EditorFactory.build(false, false) field set.
 *
 * @extends EditorBase
 */
class EntityProgressCardEditor extends EditorBase {
  _configHelper = new CardConfigHelper();

  static _fields = EditorFactory.build(false, false);
}

/**
 * Visual editor for the Badge type — BadgeConfigHelper,
 * EditorFactory.build(false, true) field set.
 *
 * @extends EditorBase
 */
class EntityProgressBadgeEditor extends EditorBase {
  _configHelper = new BadgeConfigHelper();

  static _fields = EditorFactory.build(false, true);
}

/**
 * Visual editor for the Jinja-driven Template card — TemplateConfigHelper,
 * EditorFactory.build(true, false) field set.
 *
 * @extends EditorBase
 */

class EntityProgressTemplateEditor extends EditorBase {
  _configHelper = new TemplateConfigHelper();

  static _fields = EditorFactory.build(true, false);
}

/**
 * Visual editor for the Jinja-driven Template badge —
 * BadgeTemplateConfigHelper, EditorFactory.build(true, true) field set.
 *
 * @extends EditorBase
 */

class EntityProgressBadgeTemplateEditor extends EditorBase {
  _configHelper = new BadgeTemplateConfigHelper();

  static _fields = EditorFactory.build(true, true);
}

export { EntityProgressCardEditor };
export { EntityProgressBadgeEditor };
export { EntityProgressTemplateEditor };
export { EntityProgressBadgeTemplateEditor };
