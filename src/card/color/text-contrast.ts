// text_effect: contrast - black or white text, whichever reads on the bar
// colour under the fill end.

const BLACK = '#000';

const WHITE = '#fff';

// Relative luminance where black and white text contrast equally with the bar.
const LUMINANCE_THRESHOLD = 0.179;

type Rgb = { r: number; g: number; b: number };

const linear = (channel: number): number => {
  const unit = channel / 255;
  return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ({ r, g, b }: Rgb): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

const contrastTextColor = (rgb: Rgb): string => (relativeLuminance(rgb) > LUMINANCE_THRESHOLD ? BLACK : WHITE);

// Top-level comma split: stops such as color-mix(in srgb, a, b) hold commas.
const topLevelParts = (inner: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i += 1) {
    if (inner[i] === '(') depth += 1;
    else if (inner[i] === ')') depth -= 1;
    else if (inner[i] === ',' && depth === 0) {
      parts.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(inner.slice(start));
  return parts;
};

// A clipped gradient's last stop is pinned to the fill end.
const fillEndColor = (gradient: string | null, barColor: string | null): string | null => {
  const open = gradient?.indexOf('(') ?? -1;
  const close = gradient?.lastIndexOf(')') ?? -1;
  if (!gradient || open === -1 || close < open) return barColor;
  const last = topLevelParts(gradient.slice(open + 1, close)).pop() ?? '';
  return last.replace(/(\s+-?[\d.]+(%|px|deg)?)+$/, '').trim() || barColor;
};

export { contrastTextColor, relativeLuminance, fillEndColor };
