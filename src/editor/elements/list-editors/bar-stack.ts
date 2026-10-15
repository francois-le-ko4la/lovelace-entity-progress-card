import { suffixedName } from '../../../utils/parameters.js';
import { BAR_STACK_EDITOR_STYLE } from '../../../utils/styles/editor.js';
import { defineElement } from '../../../utils/register.js';
import { ListEditorBase, type HaSelectorElement } from './base.js';

// One row of bar_stack.entities, as built up field-by-field by the editor -
// unlike the fully-validated shape the schema produces, a row here can be
// partially empty ({}) while the user is still filling it in.
type BarStackRow = { entity?: string; attribute?: string; color?: string; subtract?: boolean };

/**
 * ListEditorBase for `bar_stack.entities`: each row is an additional
 * entity (with `attribute`/`color`/`subtract`) aggregated into the bar
 * alongside the card's main entity.
 *
 * @extends ListEditorBase
 */
class EntityProgressBarStackEditor extends ListEditorBase {
  static ELEMENT_NAME = suffixedName('entity-progress-bar-stack-editor');
  _addLabel = 'Add entity';

  _buildDOM() {
    this._buildListScaffold(BAR_STACK_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows((item) => Boolean(item.entity));
  }

  #attributeField(item: BarStackRow, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { attribute: { entity_id: item.entity ?? '' } },
      value: item.attribute ?? '',
      required: false,
      fullWidth: true,
      onChange: (value) => this._updateItem(index, { attribute: (value as string) || undefined }),
    });
  }

  // 'net': subtracted from the algebraic total. 'stacked'/'proportional' +
  // center_zero: placed on the negative arm instead of the positive one. No
  // effect otherwise (harmless no-op) - kept simple rather than conditionally
  // hiding this per-row based on sibling fields (mode, center_zero) the row
  // editor doesn't otherwise need to know about.
  #subtractField(item: BarStackRow, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { boolean: {} },
      label: 'Subtract / negative side',
      fullWidth: true,
      value: item.subtract ?? false,
      onChange: (value) => this._updateItem(index, { subtract: value || undefined }),
    });
  }

  _rowClass = 'row-card';

  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    return [
      this._buildRowHeader('row-header', 'row-title', `#${index + 1}`, index),
      this._entityField(item, index),
      // Nothing to pick an attribute on until an entity is chosen.
      ...(item.entity ? [this.#attributeField(item, index)] : []),
      this._colorField(index, 'color', 'Color', item.color),
      this.#subtractField(item, index),
    ];
  }
}

defineElement(EntityProgressBarStackEditor.ELEMENT_NAME, EntityProgressBarStackEditor);

export { EntityProgressBarStackEditor };
