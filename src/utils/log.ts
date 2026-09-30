/*
 * The debug logger factory - creates a per-class logger gated by
 * CARD_CONTEXT.debug, used to trace lifecycle methods without shipping console
 * noise to every user.
 */

import { SEV, CARD } from './parameters.js';
import { has } from './common-checks.js';

// A notice addressed to the user about their own config - not a runtime error,
// and not gated by the debug flags: the deprecation warnings and the Jinja
// ones share this shape so both read alike in the console.
const cardNotice = (msg: string) => console.warn(`${CARD.console.tag} - ${msg}`);

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
    const currentLevel = levels[level] ?? levels.debug;

    const shouldLog = (logLevel: Level) => levels[logLevel] <= currentLevel;
    const emit = (logLevel: Level, sink: (...args: unknown[]) => void) => (msg: string, data?: unknown) =>
      shouldLog(logLevel) && sink(`[${name}] ${msg}`, ...(data !== undefined ? [data] : []));

    const loggerInstance: LoggerInstance = {
      name,
      level,

      debug: emit(SEV.debug, (...args) => console.debug(...args)),
      info: emit(SEV.info, (...args) => console.info(...args)),
      warning: emit(SEV.warning, (...args) => console.warn(...args)),
      error: emit(SEV.error, (...args) => console.error(...args)),

      wrap<T extends (...args: unknown[]) => unknown>(fn: T, fnName: string): T {
        const logStart = () => shouldLog(SEV.debug) && console.debug(`[${name}] 👉 ${fnName}`);
        const logSuccess = (start: number) =>
          shouldLog(SEV.debug) && console.debug(`[${name}] ✅ ${fnName} (${(performance.now() - start).toFixed(2)}ms)`);
        const logError = (start: number, error: unknown) =>
          shouldLog(SEV.error) &&
          console.error(`[${name}] ❌ ${fnName} failed (${(performance.now() - start).toFixed(2)}ms)`, error);

        return ((...args: unknown[]) => {
          logStart();
          const start = performance.now();
          try {
            const result = fn(...args);
            if (!(result instanceof Promise)) {
              logSuccess(start);
              return result;
            }
            return result.then(
              (value: unknown) => {
                logSuccess(start);
                return value;
              },
              (error: unknown) => {
                logError(start, error);
                throw error;
              },
            );
          } catch (error) {
            logError(start, error);
            throw error;
          }
        }) as T;
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

// Callers name themselves: the prod build minifies class names. An element
// passes its localName - the tag, most-derived for free.
function initLogger(ctx: object, name: string, debugFlag: boolean, methodNames: string[] = []): LoggerInstance {
  const logger = Logger.create(name, debugFlag ? SEV.debug : SEV.info);

  if (debugFlag) {
    logger.wrapAll(ctx as Record<string, unknown>, methodNames);
    logger.debug(`${name} initialized`);
  }

  return logger;
}

// ?debug=instances counter, deliberately cheap so it's safe to call from
// hot-path constructors: disabled, it's a single boolean check with zero
// allocation. Called once from a root class's constructor, so subclasses
// count under the root's name.
const instanceCounts = new Map<string, number>();
function traceInstance(name: string, enabled: boolean): void {
  if (!enabled) return;
  const count = (instanceCounts.get(name) ?? 0) + 1;
  instanceCounts.set(name, count);
  console.debug(`[instances] ${name} instantiated (#${count})`);
}

export { Logger };
export { initLogger };
export { cardNotice };
export { traceInstance };
export type { LoggerInstance };
