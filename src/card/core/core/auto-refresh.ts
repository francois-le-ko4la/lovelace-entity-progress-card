import { is } from '../../../utils/common-checks.js';
import { type ViewCore } from '../../view/core.js';
import { type ResourceManager } from '../../dom/dom-helpers.js';

type AutoRefreshDeps = {
  view: () => ViewCore;
  resourceManager: () => ResourceManager | null;
  onTick: () => void;
};

const TIMER_ID = 'autoRefresh';

// What moves with no state change gets a local tick: one setTimeout to the
// view's nextTickAt. Owned by HACore, not HABase, so Features have it too.
class AutoRefresh {
  readonly #deps: AutoRefreshDeps;
  #tickAt: number | null = null;

  constructor(deps: AutoRefreshDeps) {
    this.#deps = deps;
  }

  // After every hass update and every tick. An earlier deadline - a relative
  // time turning fresh - re-arms at once; a later one waits for the armed tick.
  // CF5 - issue (major) resolved - set hass calls _handleHassUpdate before
  // _ensureResourceManager: with an active timer entity and hass assigned
  // before connectedCallback (standard Lovelace order), the resource manager
  // was still null and .has() crashed.
  manage() {
    const at = this.#deps.view().nextTickAt(Date.now());
    if (!is.number(at)) this.#stop();
    else if (!this.#deps.resourceManager()?.has(TIMER_ID) || at < (this.#tickAt ?? Infinity)) this.#start(at);
  }

  #start(at: number) {
    const resources = this.#deps.resourceManager();
    if (!resources) return;
    this.#tickAt = at;
    resources.setTimeout(() => this.#onDue(at), at - Date.now(), TIMER_ID);
  }

  // A timer firing a hair early, while the text would still read the old value,
  // only re-arms - from the clock, so one set back re-grids instead of waiting.
  #onDue(at: number) {
    if (Date.now() >= at) this.#deps.onTick();
    this.manage();
  }

  #stop() {
    this.#tickAt = null;
    this.#deps.resourceManager()?.remove(TIMER_ID);
  }
}

export { AutoRefresh };
