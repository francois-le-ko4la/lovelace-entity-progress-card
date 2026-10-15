import { suffixedName } from '../../../utils/parameters.js';
import { MULTI_ROW_EDITOR_STYLE } from '../../../utils/styles/editor.js';
import { defineElement } from '../../../utils/register.js';
import { ListEditorBase, EDIT_ROW_EVENT } from './base.js';
import { buildIconButton, buildDeleteButton, EDIT_ICON_PATH } from './buttons.js';

/**
 * Custom element that renders the Multi aggregators' `entities` list — one
 * row per entity. Deliberately a short field set, not the row schema's forty:
 * a row IS a whole card (see multi.ts), so generating its full editor per row
 * would just be the card editor repeated N times. What stays here is what
 * makes a row differ from its siblings; everything else is a shared default at
 * the aggregator's top level.
 *
 * @extends ListEditorBase
 */
class EntityProgressMultiRowEditor extends ListEditorBase {
  static ELEMENT_NAME = suffixedName('entity-progress-multi-row-editor');
  _addLabel = 'Add entity';

  _buildDOM() {
    this._buildListScaffold(MULTI_ROW_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows((item) => Boolean(item.entity));
  }

  _rowClass = 'row-card';

  // The entity stays inline: picking one is the whole point of adding a row,
  // and a brand-new row has no title to show behind a pencil yet. Everything
  // else a row can carry is edited whole, in the sub-editor its own host
  // opens - this list only says which row was asked for.
  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    const main = document.createElement('div');
    main.className = 'row-main';
    main.appendChild(this._entityField(item, index));
    return [
      main,
      buildIconButton(EDIT_ICON_PATH, 'Edit', () => this.#requestEdit(index)),
      buildDeleteButton(() => this._deleteRow(index)),
    ];
  }

  // Asked of the host, not done here: the row's editor replaces the whole
  // form, and this list is only one field inside it - swapping in place would
  // leave the host's own panels stacked underneath.
  #requestEdit(index: number) {
    this.dispatchEvent(new CustomEvent(EDIT_ROW_EVENT, { detail: { index }, bubbles: true, composed: true }));
  }
}

defineElement(EntityProgressMultiRowEditor.ELEMENT_NAME, EntityProgressMultiRowEditor);

export { EntityProgressMultiRowEditor };
