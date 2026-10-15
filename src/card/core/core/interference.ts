// ?debug=interference: report host attribute changes made from outside
// (card-mod &c). A reparent is covered by adoptedCallback.
const watchInterference = (host: HTMLElement): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'attributes') continue;
      const attr = mutation.attributeName ?? '';
      console.debug(
        `[interference] <${host.localName}> attribute "${attr}" changed externally: "${mutation.oldValue}" → "${host.getAttribute(attr)}"`,
      );
    }
  });
  observer.observe(host, { attributes: true, attributeOldValue: true });
  return observer;
};

export { watchInterference };
