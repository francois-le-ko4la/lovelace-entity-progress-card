import { CARD, HA_CONTEXT } from '../../../utils/parameters.js';
import { type HomeAssistant, type EntityState } from '../../../utils/hass-provider.js';
import { type LoggerInstance } from '../../../utils/log.js';
import { type DOMHelper } from '../../dom/dom-helpers.js';

// Either a plain <img> (entity_picture) or a <ha-state-icon> (hass/stateObj).
type IconElement = HTMLImageElement | (HTMLElement & { hass: HomeAssistant | null; stateObj: unknown });

type IconManagerDeps = {
  dom: () => DOMHelper;
  hass: () => HomeAssistant | null;
  isConnected: () => boolean;
  log: () => LoggerInstance | null;
};

class IconManager {
  readonly #deps: IconManagerDeps;
  #icon: IconElement | null = null;

  constructor(deps: IconManagerDeps) {
    this.#deps = deps;
  }

  reset() {
    this.#icon = null;
  }

  showPicture(stateObj: EntityState | null, srcPicture: string) {
    this.#deps.log()?.debug('📎 IconManager.showPicture():', { stateObj, srcPicture });

    const pictureAlt = (stateObj?.attributes?.friendly_name as string) || 'Entity picture';
    const iconContainer = this.#deps.dom().get(CARD.htmlStructure.elements.icon.class);
    if (!iconContainer) return;

    if (this.#icon?.tagName !== 'IMG') {
      this.#icon?.remove();
      this.#icon = IconManager.#createImg(pictureAlt);
      iconContainer.replaceChildren(this.#icon);
      this.#deps.dom().setStyle(CARD.htmlStructure.card.element, CARD.style.dynamic.iconAndShape.icon.size.var, '36px');
    }

    const img = this.#icon as HTMLImageElement;
    img.src = srcPicture;
    img.alt = pictureAlt;
  }

  stateObjFor(
    stateObj: EntityState | null,
    curIcon: string | null,
    hasIconOverride: boolean,
    hasPicture: boolean,
  ): unknown {
    this.#deps.log()?.debug('📎 IconManager.stateObjFor():', { stateObj, curIcon, hasIconOverride, hasPicture });

    if (!stateObj) {
      return this.#deps.isConnected()
        ? {
            entity_id: 'sensor.dummy',
            state: 'unknown',
            attributes: {
              icon: curIcon || HA_CONTEXT.icons.helpCircleOutline,
              friendly_name: 'Unknown Entity',
            },
          }
        : null;
    }

    if (!hasIconOverride && !hasPicture) {
      return stateObj;
    }
    if (hasIconOverride) {
      return {
        entity_id: 'sensor.for_picture',
        state: 'on',
        attributes: {
          icon: curIcon,
        },
      };
    }

    const attributes = { ...stateObj.attributes };
    if (hasPicture && !hasIconOverride) {
      delete attributes.entity_picture;
    }

    return {
      ...stateObj,
      attributes,
    };
  }

  showState(iconContainer: HTMLElement, stateObjIcon: unknown) {
    this.#deps.log()?.debug('📎 IconManager.showState():', { iconContainer, stateObjIcon });

    this.#removePicture();

    if (!this.#icon) {
      this.#icon = document.createElement('ha-state-icon') as HTMLElement & {
        hass: HomeAssistant | null;
        stateObj: unknown;
      };
      iconContainer.replaceChildren(this.#icon);
    }

    const stateIcon = this.#icon as HTMLElement & { hass: HomeAssistant | null; stateObj: unknown };
    stateIcon.hass = this.#deps.hass();
    stateIcon.stateObj = stateObjIcon;
  }

  #removePicture() {
    if (this.#icon?.tagName === 'IMG') {
      this.#icon.remove();
      this.#icon = null;
    }
  }

  static #createImg(altText: string, className = 'custom-icon-img'): HTMLImageElement {
    const img = document.createElement('img');
    img.className = className;
    img.decoding = 'async';
    img.alt = altText;
    return img;
  }
}

export { IconManager };
