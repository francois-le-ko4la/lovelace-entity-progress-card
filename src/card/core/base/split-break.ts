// Splits Jinja-sourced HTML at its first <br> for the two-line secondary info.

const BREAK_RE = /<br\s*\/?>/gi;

// Tree-aware: both halves re-wrap the ancestors the break sat in, so nested
// tags keep their attributes. Returns [html, null] when there is no <br>.
const domSplitOnce = (html: string): [string, string | null] => {
  // Non-global on purpose: .test() on the /g BREAK_RE would carry lastIndex
  // into the next call (this runs twice per render).
  if (!/<br\s*\/?>/i.test(html)) return [html, null];

  const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body;
  let found = false;
  const split = (node: Node): [Node, Node] => {
    const before = node.cloneNode(false);
    const after = node.cloneNode(false);
    for (const child of Array.from(node.childNodes)) {
      if (found) {
        after.appendChild(child.cloneNode(true));
      } else if (child.nodeName === 'BR') {
        found = true;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const [childBefore, childAfter] = split(child);
        before.appendChild(childBefore);
        if (found) after.appendChild(childAfter);
      } else {
        before.appendChild(child.cloneNode(true));
      }
    }
    return [before, after];
  };

  const [before, after] = split(root);
  return [(before as Element).innerHTML, (after as Element).innerHTML];
};

// `multiline` off strips every <br>; on keeps the first and drops the rest.
const splitAtFirstBreak = (content: unknown, multiline: boolean): [string, string | null] => {
  const html = String(content);
  if (!multiline) return [html.replace(BREAK_RE, ''), null];

  const [before, afterRaw] = domSplitOnce(html);
  if (afterRaw === null) return [before, null];
  const [after] = domSplitOnce(afterRaw);
  return [before, after];
};

export { splitAtFirstBreak };
