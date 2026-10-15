import { HA_CONTEXT } from '../../../utils/parameters.js';

type HaSvgIconElement = HTMLElement & { path: string };

// mdi:plus - shared by every "+ Add ..." button built in this file.
const ADD_ICON_PATH = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
// mdi:close-circle-outline - shared by every row's own "Delete" button.
const DELETE_ICON_PATH =
  'M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,18.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z';

// mdi:pencil / mdi:arrow-left - the row's own sub-editor, opened and left.
const EDIT_ICON_PATH =
  'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z';

const BACK_ICON_PATH = 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z';

// Every icon button in this file is the same borderless 28px circle (.del-btn
// carries its look, see ROW_DELETE_STYLE) - only path, tooltip and callback
// differ, so delete/edit/back are one builder rather than three copies.
const buildIconButton = (path: string, title: string, onClick: () => void): HTMLElement => {
  const btn = document.createElement('button');
  btn.className = 'del-btn';
  btn.title = title;
  const icon = document.createElement(HA_CONTEXT.elements.svgIcon) as HaSvgIconElement;
  icon.path = path;
  btn.appendChild(icon);
  btn.addEventListener('click', onClick);
  return btn;
};

const buildDeleteButton = (onDelete: () => void): HTMLElement => buildIconButton(DELETE_ICON_PATH, 'Delete', onDelete);

// Same "+ Add ..." button everywhere it's built - only label/callback differ.
// appearance="filled" matches ha-form-optional_actions.ts's own add button.
const buildAddButton = (label: string, onClick: (e: MouseEvent) => void): HTMLElement => {
  const btn = document.createElement('ha-button');
  btn.setAttribute('appearance', 'filled');
  btn.setAttribute('size', 's');
  const addIcon = document.createElement(HA_CONTEXT.elements.svgIcon) as HaSvgIconElement;
  addIcon.setAttribute('slot', 'start');
  addIcon.path = ADD_ICON_PATH;
  btn.appendChild(addIcon);
  btn.append(label);
  btn.addEventListener('click', onClick);
  return btn;
};

export { buildIconButton, buildDeleteButton, buildAddButton, EDIT_ICON_PATH, BACK_ICON_PATH };
