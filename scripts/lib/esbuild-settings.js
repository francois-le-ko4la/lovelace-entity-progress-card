'use strict';

// What the card's code is compiled with, wherever it is compiled: the shipped
// bundles (build.js) and the logic tests (test.js) follow the same rules.

// The es2021 floor (#128) is about class static blocks, which break Chrome 92.
// Every other class feature runs natively there, so it's kept native instead of
// being lowered to WeakMap helpers.
const TARGET = 'es2021';
const NATIVE_CLASS_FEATURES = {
  'class-field': true,
  'class-static-field': true,
  'class-private-field': true,
  'class-private-method': true,
  'class-private-accessor': true,
  'class-private-static-field': true,
  'class-private-static-method': true,
  'class-private-static-accessor': true,
  'class-private-brand-check': true,
  'class-static-blocks': false,
};

// __EPB_DEV_BUILD__ is baked in, not read at runtime: true only in *_dev.js.
const devBuildDefine = (isDev) => ({ __EPB_DEV_BUILD__: isDev ? 'true' : 'false' });

module.exports = { TARGET, NATIVE_CLASS_FEATURES, devBuildDefine };
