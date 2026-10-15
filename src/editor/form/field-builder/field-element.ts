import { is } from '../../../utils/common-checks.js';
import { type HomeAssistant } from '../../../utils/hass-provider.js';
import { type FieldDef } from '../../../utils/types.js';

// An HTMLElement plus whichever of these its family (ha-selector, chips, list
// editors) implements; too varied to model more precisely.
type EditorFieldElement = HTMLElement & {
  label?: string;
  value: unknown;
  hass?: HomeAssistant | null;
  isInverted?: boolean;
  context?: Record<string, unknown>;
  selector?: Record<string, unknown>;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  items?: unknown;
  modes?: string[];
  setLabels?: (labels: unknown) => void;
  setAddLabel?: (label: string) => void;
  buttonLabel?: string;
  actionLabels?: Record<string, string>;
  _fieldDef?: FieldDef;
};

// full (default) | half | grow | a px string of its own - see EDITOR_BASE_STYLE
// for what each one does to the row.
const applyFieldWidth = (el: HTMLElement, width: unknown): void => {
  const value = is.string(width) ? width : 'full';
  if (value === 'half' || value === 'grow' || value === 'full') {
    el.classList.add(`field-${value}`);
    return;
  }
  el.classList.add('field-fixed');
  el.style.width = value;
};

const createFieldEl = (field: FieldDef, tagName: string): EditorFieldElement => {
  const el = document.createElement(tagName) as EditorFieldElement;
  el.id = field.name;
  applyFieldWidth(el, field.width);
  return el;
};

export { applyFieldWidth, createFieldEl };
export type { EditorFieldElement };
