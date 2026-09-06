/*
 * Installs a happy-dom window as the global environment so a test can mount
 * the card's real custom elements. Imported for its side effect, and always
 * FIRST: src/ modules register their elements at module-evaluation time, so
 * customElements/HTMLElement must exist before any of them is imported.
 */

import { Window } from 'happy-dom';

// Copied as-is. Binding a constructor to the window would break `class X
// extends HTMLElement`: a bound function carries no usable prototype, so the
// custom element ends up outside the HTMLElement chain (no .style, and
// `instanceof HTMLElement` false).
const BROWSER_GLOBALS = [
  'window',
  'document',
  'customElements',
  'navigator',
  'location',
  'HTMLElement',
  'HTMLTemplateElement',
  'Element',
  'Node',
  'ShadowRoot',
  'DocumentFragment',
  'CSSStyleSheet',
  'CSS',
  'CustomEvent',
  'Event',
  'MutationObserver',
  'ResizeObserver',
] as const;

// Free functions that genuinely need `this` to be the window.
const BOUND_GLOBALS = ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia'] as const;

const win = new Window({ url: 'https://localhost/' }) as unknown as Record<string, unknown>;
const target = globalThis as unknown as Record<string, unknown>;

// defineProperty, not assignment: Node exposes some of these (navigator) as
// getter-only globals, which a plain assignment throws on.
const define = (key: string, value: unknown) =>
  Object.defineProperty(target, key, { value, writable: true, configurable: true });

for (const key of BROWSER_GLOBALS) {
  if (win[key] !== undefined) define(key, win[key]);
}
for (const key of BOUND_GLOBALS) {
  const fn = win[key];
  if (typeof fn === 'function') define(key, (fn as (...a: unknown[]) => unknown).bind(win));
}

// DOMHelper batches its writes into a requestAnimationFrame (see
// src/card/dom-helpers.ts), so nothing it sets is in the DOM synchronously.
// Every assertion on rendered text has to go through this first.
//
// waitUntilComplete drains happy-dom own timer and animation-frame queues,
// deterministically. A fixed sleep was measurably flaky: with seven elements
// mounted earlier in the same file, 60ms was not enough and 200ms was - a CI
// runner would have found the boundary somewhere else again.
const flushFrames = () => (win.happyDOM as { waitUntilComplete: () => Promise<void> }).waitUntilComplete();

export { flushFrames };
