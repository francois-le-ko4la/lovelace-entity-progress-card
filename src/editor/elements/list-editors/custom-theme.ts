import { suffixedName } from '../../../utils/parameters.js';
import { CUSTOM_THEME_EDITOR_STYLE } from '../../../utils/styles/editor.js';
import { is } from '../../../utils/common-checks.js';
import { defineElement } from '../../../utils/register.js';
import { ListEditorBase, type HaSelectorElement } from './base.js';

// One custom_theme zone, same "partially filled while editing" caveat.
type CustomThemeZone = {
  min?: number;
  max?: number;
  color?: string;
  icon_color?: string;
  bar_color?: string;
  icon?: string;
};

/**
 * Custom element that renders an editable list of custom_theme zones, each a
 * contiguous { min, max, color?, icon_color?, bar_color?, icon? } range.
 * Mirrors EntityProgressBarStackEditor's row-list pattern (label, list, add
 * button, value-changed with the filtered array), with a richer per-row form.
 *
 * @extends HTMLElement
 */

class EntityProgressCustomThemeEditor extends ListEditorBase {
  static ELEMENT_NAME = suffixedName('entity-progress-custom-theme-editor');
  _addLabel = 'Add zone';

  _buildDOM() {
    this._buildListScaffold(CUSTOM_THEME_EDITOR_STYLE, this._addLabel);
  }

  _dispatch() {
    this._dispatchRows(
      (item) =>
        is.number(item.min) ||
        is.number(item.max) ||
        Boolean(item.color || item.icon_color || item.bar_color || item.icon),
    );
  }

  #numberField(item: CustomThemeZone, index: number, key: 'min' | 'max'): HaSelectorElement {
    return this._buildSelectorField({
      selector: { number: {} },
      label: key === 'min' ? 'Min' : 'Max',
      value: is.number(item[key]) ? item[key] : undefined,
      onChange: (value) => this._updateItem(index, { [key]: is.number(value) ? value : undefined }),
    });
  }

  #iconField(item: CustomThemeZone, index: number): HaSelectorElement {
    return this._buildSelectorField({
      selector: { icon: { icon_set: ['mdi'] } },
      label: 'Icon',
      fullWidth: true,
      value: item.icon ?? '',
      onChange: (value) => this._updateItem(index, { icon: (value as string) || undefined }),
    });
  }

  _rowClass = 'zone';

  _buildRow(item: Record<string, unknown>, index: number): Node[] {
    const numbers = document.createElement('div');
    numbers.className = 'numbers-row';
    numbers.append(this.#numberField(item, index, 'min'), this.#numberField(item, index, 'max'));

    return [
      this._buildRowHeader('zone-header', 'zone-title', `Zone ${index + 1}`, index),
      numbers,
      this.#iconField(item, index),
      this._colorField(index, 'color', 'Icon & bar color', item.color),
      this._colorField(index, 'icon_color', 'Icon color', item.icon_color),
      this._colorField(index, 'bar_color', 'Bar color', item.bar_color),
    ];
  }
}

defineElement(EntityProgressCustomThemeEditor.ELEMENT_NAME, EntityProgressCustomThemeEditor);

export { EntityProgressCustomThemeEditor };
