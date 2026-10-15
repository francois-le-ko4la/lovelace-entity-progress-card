/**
 * Identity tag - behaves exactly like an untagged template literal at
 * runtime. Marks a template literal as CSS so the build script
 * (scripts/build.js) can find and minify it without needing to know each
 * variable/usage by name.
 */
const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, s, i) => acc + s + (i < values.length ? values[i] : ''), '');

export { css };
