import { CARD_CONTEXT } from '../../../utils/parameters.js';
import { is, assertDefined } from '../../../utils/common-checks.js';
import { initLogger, type LoggerInstance } from '../../../utils/log.js';

type CleanupFn = () => void;

class ResourceManager {
  #debug = CARD_CONTEXT.debug.ressourceManager;
  #log: LoggerInstance | null = null;
  #resources = new Map<string, CleanupFn>();
  #throttles = new Map<string, { lastCall: number }>();

  constructor() {
    this.#log = initLogger(this, 'ResourceManager', this.#debug, ['add', 'remove', 'cleanup']);
  }

  // ─── PUBLIC API METHODS ───────────────────────────────────────────────────

  add(cleanupFn: CleanupFn, id?: string): string {
    if (!is.func(cleanupFn)) {
      throw new Error('Resource must be a function');
    }
    const finalId = id || this.#generateUniqueId();
    if (this.#resources.has(finalId)) {
      this.remove(finalId);
      this.#log?.debug(`Remove: ${finalId}`);
    }
    this.#resources.set(finalId, cleanupFn);
    this.#log?.debug(`Set: ${finalId}`);

    return finalId;
  }

  has(id: string): boolean {
    return this.#resources.has(id);
  }

  setTimeout(handler: () => void, timeout: number, id?: string): string {
    this.#log?.debug('Starting timeout with id:', id);
    const finalId = id || this.#generateUniqueId();
    // Dropped before the handler runs, which may re-arm the same id.
    const timerId = setTimeout(() => {
      this.#resources.delete(finalId);
      handler();
    }, timeout);
    this.#log?.debug('Timeout started with timerId:', timerId);
    return this.add(() => clearTimeout(timerId), finalId);
  }

  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    id?: string,
  ): string {
    target.addEventListener(event, handler, options);
    return this.add(() => target.removeEventListener(event, handler, options), id);
  }

  addSubscription(unsubscribeFn: () => void, id?: string): string {
    return this.add(() => {
      unsubscribeFn();
    }, id);
  }

  throttle(fn: () => void, delay: number, id: string) {
    const context = this.#ensureThrottleState(id, 'throttle');
    const now = Date.now();

    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      fn();
      this.#log?.debug('Throttle function - ', id);
    }
  }

  throttleDebounce(fn: () => void, delay: number, id: string) {
    const now = Date.now();
    const keys = {
      throttle: `${id}-throttle`,
      debounce: `${id}-debounce`,
    };

    // Throttle — exec if time is over
    const context = this.#ensureThrottleState(keys.throttle, 'throttleDebounce');

    // CF5 - issue (medium) resolved - the trailing timer was scheduled
    // unconditionally, so a single isolated call always ran fn() twice (leading
    // + trailing). The trailing run now only catches calls rejected by the
    // throttle, and a leading run cancels any pending trailing.
    if (now - context.lastCall >= delay) {
      context.lastCall = now;
      if (this.#resources.has(keys.debounce)) this.remove(keys.debounce);
      fn();
      this.#log?.debug('ThrottleDebounce immediate - ', id);
      return;
    }

    // Debounce — catch up throttled calls after delay
    if (this.#resources.has(keys.debounce)) {
      this.remove(keys.debounce);
    }
    this.setTimeout(
      () => {
        context.lastCall = Date.now();
        fn();
        this.#log?.debug('ThrottleDebounce trailing - ', id);
      },
      delay,
      keys.debounce,
    );
  }

  resetThrottle(id: string) {
    this.#throttles.delete(id);
  }

  // Shared by throttle/throttleDebounce - lazily creates and registers the
  // throttle-state entry for `id`, then returns it.
  #ensureThrottleState(id: string, caller: string): { lastCall: number } {
    if (!this.#throttles.has(id)) {
      this.#throttles.set(id, { lastCall: 0 });
      this.add(() => this.resetThrottle(id), id);
    }
    return assertDefined(this.#throttles.get(id), `ResourceManager.${caller}: no throttle state for '${id}'`);
  }

  remove(id: string) {
    const cleanupFn = this.#resources.get(id);
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while removing '${id}'`, e);
      }
      this.#resources.delete(id);
      this.#log?.debug(`Removed: ${id}`);
    }
  }

  cleanup() {
    for (const [id, cleanupFn] of this.#resources) {
      try {
        cleanupFn();
      } catch (e) {
        console.error(`[ResourceManager] Error while clearing '${id}'`, e);
      }
      this.#log?.debug(`Cleared: ${id}`);
    }
    this.#resources.clear();
    this.#throttles.clear();
    this.#log?.debug('All resources cleared.');
  }

  // ─── PRIVATE METHODS ──────────────────────────────────────────────────────

  #generateUniqueId(): string {
    let id: string;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.#resources.has(id));
    return id;
  }
}

export { ResourceManager };
