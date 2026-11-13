/* global document$, renderMathInElement */
// Render the math arithmatex marks (generic mode), on every page change.
document$.subscribe(() => {
  for (const element of document.querySelectorAll(".arithmatex")) {
    renderMathInElement(element, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
    });
  }
});
