import { environmentReport } from '../utils/diagnostic.js';
import { notesByPath } from '../card/card-audit.js';
import { toYaml } from './yaml-writer.js';
import type { LovelaceConfig } from '../utils/types.js';

const FENCE = '```';

// mdi:bug-outline
const BUG_ICON_PATH =
  'M20,8H17.19C16.74,7.2 16.12,6.5 15.37,6L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.05,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6C7.87,6.5 7.26,7.21 6.81,8H4V10H6.09C6.03,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.03,15.67 6.09,16H4V18H6.81C8.47,20.87 12.14,21.84 15,20.18C15.91,19.66 16.67,18.9 17.19,18H20V16H17.91C17.97,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.97,10.33 17.91,10H20V8M16,15A4,4 0 0,1 12,19A4,4 0 0,1 8,15V11A4,4 0 0,1 12,7A4,4 0 0,1 16,11V15M14,10V12H10V10H14M10,14H14V16H10V14Z';

// Ready to paste into a GitHub issue: the environment dump() prints, then the
// card's YAML with its deprecated options and options without effect marked.
const issueReport = (config: LovelaceConfig): string =>
  [`${FENCE}text`, environmentReport(), FENCE, '', `${FENCE}yaml`, toYaml(config, notesByPath(config)), FENCE, ''].join(
    '\n',
  );

// navigator.clipboard only exists over https: plain http falls back to a
// selected textarea, as Home Assistant's own copyToClipboard does.
const copyText = async (text: string, root: ShadowRoot): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    root.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }
};

export { BUG_ICON_PATH, issueReport, copyText };
