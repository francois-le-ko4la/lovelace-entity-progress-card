/*
 * The debug logger factory - creates a per-class logger gated by
 * CARD_CONTEXT.debug, used to trace lifecycle methods without shipping console
 * noise to every user.
 */

import { SEV } from './parameters.js';
import { has } from './common-checks.js';

type Level = 'info' | 'warning' | 'error' | 'debug';

interface LoggerInstance {
  name: string;
  level: Level;
  debug: (msg: string, data?: unknown) => void;
  info: (msg: string, data?: unknown) => void;
  warning: (msg: string, data?: unknown) => void;
  error: (msg: string, data?: unknown) => void;
  wrap: <T extends (...args: unknown[]) => unknown>(fn: T, fnName: string) => T;
  wrapAll: (ctx: Record<string, unknown>, methodNames: string[]) => void;
}

const Logger = {
  create(name: string, level: Level = SEV.debug): LoggerInstance {
    const levels = { error: 0, warning: 1, info: 2, debug: 3 };
    const currentLevel = levels[level] || 3;

    const shouldLog = (logLevel: Level) => levels[logLevel] <= currentLevel;

    const loggerInstance: LoggerInstance = {
      name,
      level,

      debug: (msg, data) =>
        shouldLog(SEV.debug) && console.debug(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      info: (msg, data) =>
        shouldLog(SEV.info) && console.info(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      warning: (msg, data) =>
        shouldLog(SEV.warning) && console.warn(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),
      error: (msg, data) =>
        shouldLog(SEV.error) && console.error(`[${name}] ${msg}`, ...(data !== undefined ? [data] : [])),

      wrap<T extends (...args: unknown[]) => unknown>(fn: T, fnName: string): T {
        const isAsync = fn.constructor.name === 'AsyncFunction';

        const logStart = () => shouldLog(SEV.debug) && console.debug(`[${name}] 👉 ${fnName}`);
        const logSuccess = (start: number) =>
          shouldLog(SEV.debug) && console.debug(`[${name}] ✅ ${fnName} (${(performance.now() - start).toFixed(2)}ms)`);
        const logError = (start: number, error: unknown) =>
          shouldLog(SEV.error) &&
          console.error(`[${name}] ❌ ${fnName} failed (${(performance.now() - start).toFixed(2)}ms)`, error);

        if (isAsync) {
          return (async (...args: unknown[]) => {
            logStart();
            const start = performance.now();
            try {
              const result = await fn(...args);
              logSuccess(start);
              return result;
            } catch (error) {
              logError(start, error);
              throw error;
            }
          }) as T;
        } else {
          return ((...args: unknown[]) => {
            logStart();
            const start = performance.now();
            try {
              const result = fn(...args);
              logSuccess(start);
              return result;
            } catch (error) {
              logError(start, error);
              throw error;
            }
          }) as T;
        }
      },

      wrapAll: (ctx, methodNames) => {
        methodNames.forEach((method) => {
          if (has.method(ctx, method)) {
            const fn = ctx[method] as (...args: unknown[]) => unknown;
            ctx[method] = loggerInstance.wrap(fn.bind(ctx), method);
          }
        });
      },
    };

    return loggerInstance;
  },
};

function initLogger(ctx: object, debugFlag: boolean, methodNames: string[] = []): LoggerInstance {
  const className = ctx.constructor.name;
  const logger = Logger.create(className, debugFlag ? SEV.debug : SEV.info);

  if (debugFlag) {
    logger.wrapAll(ctx as Record<string, unknown>, methodNames);
    logger.debug(`${className} initialized`);
  }

  return logger;
}

// ?debug=instances counter, kept deliberately cheap so it's safe to call from
// hot-path constructors (EntityHelper/EntityOrValue & co are re-created every
// refresh): when disabled it's a single boolean check with zero allocation.
// Call it once per inheritance tree - from the root class's constructor - and
// `this.constructor.name` reports the actual most-derived class, so a subclass
// needs no call of its own (and would only double-count if it added one).
// constructor.name survives esbuild's prod minify (verified), so counts stay
// readable even when ?debug=instances is used against the shipped build.
const instanceCounts = new Map<string, number>();
function traceInstance(instance: object, enabled: boolean): void {
  if (!enabled) return;
  const className = instance.constructor.name;
  const count = (instanceCounts.get(className) ?? 0) + 1;
  instanceCounts.set(className, count);
  console.debug(`[instances] ${className} instantiated (#${count})`);
}

export { Logger };
export { initLogger };
export { traceInstance };
export type { LoggerInstance };
