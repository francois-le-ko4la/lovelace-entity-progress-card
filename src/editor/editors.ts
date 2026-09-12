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
  MultiCardConfigHelper,
  MultiFeatureConfigHelper,
  MultiRowConfigHelper,
  MultiFeatureRowConfigHelper,
} from '../card/config-helpers.js';
import { EditorBase } from './base.js';
import {
  MULTI_CARD_ROW_EDITOR_NAME,
  MULTI_FEATURE_ROW_EDITOR_NAME,
  EDIT_ROW_EVENT,
  buildIconButton,
  BACK_ICON_PATH,
} from './list-editors.js';
import { CONFIG_CHANGED_EVENT } from '../utils/parameters.js';
import { cascade, sharedOf, rowsOf, isRowOption } from './multi-cascade.js';
import type { HomeAssistant } from '../utils/hass-provider.js';
import type { LovelaceConfig } from '../utils/types.js';
import { defineElement } from '../utils/register.js';
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

type SubEditorElement = HTMLElement & {
  hass?: HomeAssistant | null;
  setConfig?: (config: LovelaceConfig) => void;
};

/**
 * Hosts the row list and, when a row is opened, its whole editor in place of
 * its own form. The swap happens here rather than inside the list because the
 * list is one field of this form: swapping in place would leave these panels
 * stacked under the row's own.
 *
 * @extends EditorBase
 */
class MultiEditorBase extends EditorBase {
  // Per-subclass like the aggregators' own _forcedHide (multi.ts): a Feature's
  // rows and a Card's rows are not the same schema, so they are not the same
  // editor either - the chips alone would give it away.
  static _rowEditorTag: string = MULTI_CARD_ROW_EDITOR_NAME;
  #sub: SubEditorElement | null = null;
  #back: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(EDIT_ROW_EVENT, this.#onEditRow as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(EDIT_ROW_EVENT, this.#onEditRow as EventListener);
  }

  #onEditRow = (event: Event) => {
    event.stopPropagation();
    this.#openRow(((event as CustomEvent).detail as { index: number }).index);
  };

  #openRow(index: number) {
    const config = this._rawConfig;
    const shared = sharedOf(config);
    const row = rowsOf(config)[index];
    if (!row) return;

    const tag = (this.constructor as typeof MultiEditorBase)._rowEditorTag;
    const sub = document.createElement(tag) as SubEditorElement;
    sub.hass = this.hass as HomeAssistant;
    // The row's effective config, not its overrides: what it shows is what
    // that row actually renders.
    sub.setConfig?.({ ...shared, ...row } as unknown as LovelaceConfig);
    // EditorBase dispatches config-changed bubbling AND composed: left alone
    // it reaches Home Assistant, which reads one row as the whole card.
    sub.addEventListener(CONFIG_CHANGED_EVENT, (e: Event) => {
      e.stopPropagation();
      this.#writeRow(index, (e as CustomEvent).detail.config as LovelaceConfig);
    });

    const back = document.createElement('div');
    back.className = 'back-bar';
    const title = document.createElement('span');
    title.className = 'back-title';
    title.textContent = String(row.entity ?? `#${index + 1}`);
    back.append(
      buildIconButton(BACK_ICON_PATH, 'Back', () => this.#closeRow()),
      title,
    );

    const form = this._formEl;
    if (form) form.style.display = 'none';
    this.#sub = sub;
    this.#back = back;
    this.shadowRoot?.append(back, sub);
  }

  #closeRow() {
    this.#sub?.remove();
    this.#back?.remove();
    this.#sub = null;
    this.#back = null;
    const form = this._formEl;
    if (form) form.style.display = '';
  }

  #writeRow(index: number, rowConfig: LovelaceConfig) {
    const config = this._rawConfig;
    const rows = rowsOf(config);
    rows[index] = Object.fromEntries(Object.entries(rowConfig).filter(([key]) => isRowOption(key) || key === 'entity'));
    const next = cascade({ ...config, entities: rows } as unknown as LovelaceConfig);
    this._applyConfigPatch(next);

    // Home Assistant closes this loop for a top-level editor: config-changed
    // goes out, setConfig comes back, the fields re-read themselves. Nothing
    // does that for a sub-editor whose event is caught here, so its own fields
    // kept showing what they held before the write - a hide chip clicked on,
    // the icon gone from the card, and the chip still dark. Feeding the row
    // back is also what shows the cascade's own moves.
    const written = rowsOf(next)[index];
    if (written) this.#sub?.setConfig?.({ ...sharedOf(next), ...written } as unknown as LovelaceConfig);
  }
}

class EntityProgressMultiCardEditor extends MultiEditorBase {
  _configHelper = new MultiCardConfigHelper();
  static _fields = EditorFactory.buildMulti(false);
}

class EntityProgressMultiFeatureEditor extends MultiEditorBase {
  static _rowEditorTag = MULTI_FEATURE_ROW_EDITOR_NAME;
  _configHelper = new MultiFeatureConfigHelper();
  static _fields = EditorFactory.buildMulti(true);
}

/**
 * One Multi row, edited on its own behind the list's pencil. A plain
 * EditorBase like every other editor here - the row IS a card, so nothing
 * about it needs a second mechanism. Defined by hand rather than through
 * RegistrationHelper: HA never asks for it, its own list does.
 */
class EntityProgressMultiCardRowEditor extends EditorBase {
  _configHelper = new MultiRowConfigHelper();
  static _fields = EditorFactory.buildMultiRow(false);
}

class EntityProgressMultiFeatureRowEditor extends EditorBase {
  _configHelper = new MultiFeatureRowConfigHelper();
  static _fields = EditorFactory.buildMultiRow(true);
}

defineElement(MULTI_CARD_ROW_EDITOR_NAME, EntityProgressMultiCardRowEditor);
defineElement(MULTI_FEATURE_ROW_EDITOR_NAME, EntityProgressMultiFeatureRowEditor);

export { EntityProgressCardEditor };
export { EntityProgressBadgeEditor };
export { EntityProgressTemplateEditor };
export { EntityProgressBadgeTemplateEditor };
export { EntityProgressFeatureEditor };
export { EntityProgressMultiCardEditor };
export { EntityProgressMultiFeatureEditor };
