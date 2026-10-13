// Recorder history behind peak_marker and trend_indicator: one fetch per
// window, shared while in flight, and the once-per-signature seeding contract.

import { is } from '../utils/common-checks.js';
import { HA_CONTEXT, CARD } from '../utils/parameters.js';
import { hasUsableHistory } from './entity-helper.js';
import type { HomeAssistant } from '../utils/hass-provider.js';
import type { LoggerInstance } from '../utils/log.js';
import type { Config } from '../utils/types.js';

export type HistoryPoint = { t: number; value: number };

type HistorySeedingHost = {
  config: () => Config;
  hass: () => HomeAssistant | undefined | null;
  log: () => LoggerInstance | null;
};

export class HistorySeeding {
  readonly #host: HistorySeedingHost;
  // One entry per history-backed feature (peak_marker, trend_indicator).
  #signatures = new Map<string, string>();
  // Shares one in-flight WS call when trend/peak_marker share a window.
  #inFlight = new Map<number, Promise<HistoryPoint[]>>();

  constructor(host: HistorySeedingHost) {
    this.#host = host;
  }

  // null when `window` or `entity` is absent/invalid (nothing to seed yet -
  // Feature's own entity can still be pending its parent Tile's context).
  signature(window: unknown): string | null {
    const config = this.#host.config();
    if (!is.number(window) || !config.entity) return null;
    return `${config.entity} ${config.attribute ?? ''} ${window}`;
  }

  // Runs once per (entity, attribute, window) and drops a reply whose signature
  // moved in flight: one race guard shared by every feature, `apply` is theirs.
  seed(key: string, config: unknown, apply: (points: HistoryPoint[]) => void, onStart?: () => void) {
    const window = is.plainObject(config) ? config.window : undefined;
    const signature = this.signature(window);
    if (signature === null || signature === this.#signatures.get(key)) return;
    this.#signatures.set(key, signature);
    onStart?.();
    this.fetch(window as number)
      .then((points) => {
        if (points.length && signature === this.#signatures.get(key)) apply(points);
      })
      .catch(() => {
        // best-effort: the feature simply goes unseeded, the card is unaffected
      });
  }

  async fetch(windowSeconds: number): Promise<HistoryPoint[]> {
    const cached = this.#inFlight.get(windowSeconds);
    if (cached) return await cached;
    const promise = this.#fetchUncached(windowSeconds).finally(() => this.#inFlight.delete(windowSeconds));
    this.#inFlight.set(windowSeconds, promise);
    return await promise;
  }

  // [] when the entity is ineligible (attribute:, timer/counter/duration: the
  // recorder keeps no history for them) or there is no live connection.
  async #fetchUncached(windowSeconds: number): Promise<HistoryPoint[]> {
    const log = this.#host.log();
    const { entity, attribute } = this.#host.config();
    if (!hasUsableHistory(entity, attribute)) {
      log?.debug('_fetchHistory: ineligible', { entity, attribute });
      return [];
    }

    const hass = this.#host.hass();
    if (!hass?.connection?.connected) {
      log?.debug('_fetchHistory: no live connection', { connected: hass?.connection?.connected });
      return [];
    }

    const cappedWindow = Math.min(windowSeconds, CARD.config.history.maxWindowSeconds);
    // Compressed-state reply (s/lu, not state/last_updated; lu is epoch
    // seconds) - see history/websocket_api.py's _history_compressed_state().
    const result = (await hass.connection.sendMessagePromise({
      type: HA_CONTEXT.ws.historyDuringPeriod,
      start_time: new Date(Date.now() - cappedWindow * 1000).toISOString(),
      entity_ids: [entity],
      no_attributes: true,
    })) as Record<string, { s: string; lu: number }[]> | undefined;
    log?.debug('_fetchHistory: raw result', result);

    const points = (result?.[entity] ?? [])
      .map((point) => {
        const value = Number(point.s);
        const timestamp = point.lu * 1000;
        return Number.isFinite(value) && Number.isFinite(timestamp) ? { t: timestamp, value } : null;
      })
      .filter((point): point is HistoryPoint => point !== null);
    log?.debug(`_fetchHistory: ${points.length} usable point(s)`);
    return points;
  }
}
