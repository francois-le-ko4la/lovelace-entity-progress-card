/*
 * Entity Progress Card - a set of custom Lovelace elements for Home Assistant
 * that show an entity's value as a progress bar with an icon, name and
 * secondary info. Author: ko4la. Docs & source:
 * https://github.com/francois-le-ko4la/lovelace-entity-progress-card/
 *
 * Ships five element types from one bundle: the card, a badge, an in-tile
 * feature, and Jinja-template variants of the card and badge - each with its
 * own visual editor. Zero runtime dependencies (no Lit, no external sanitizer,
 * no CDN request): plain HTMLElement subclasses with hand-rolled batching/
 * change-tracking/style-sharing helpers. Highlights: entity-, number- or
 * Jinja-driven min/max/watermark/alert thresholds; theme presets and custom
 * themes with segment/rainbow gradients; center-zero diverging bars; bar_stack
 * aggregation; URL-derived per-area console logging and dev mode (?debug=…,
 * ?dev=true); and the window.EPB console helper (EPB.help()).
 *
 * This file is the bundle's entry point. The visual editors ship beside it, in
 * a file of their own (src/editor/entry.ts), loaded the first time one opens.
 */

import { bootstrap } from './bootstrap.js';

bootstrap();
