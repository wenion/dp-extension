const SVG_NS =
  "http://www.w3.org/2000/svg";

export function createEye(): SVGSVGElement {
  const svg =
    document.createElementNS(
      SVG_NS,
      "svg",
    );

  svg.setAttribute(
    "width",
    "16",
  );

  svg.setAttribute(
    "height",
    "16",
  );

  svg.setAttribute(
    "fill",
    "none",
  );

  svg.setAttribute(
    "viewBox",
    "0 0 16 16",
  );

  const path =
    document.createElementNS(
      SVG_NS,
      "path",
    );

  path.setAttribute(
    "fill",
    "currentColor",
  );

  path.setAttribute(
    "fill-rule",
    "evenodd",
  );

  path.setAttribute(
    "clip-rule",
    "evenodd",
  );

  path.setAttribute(
    "d",
    "M1.87 8.515 1.641 8l.229-.515a6.708 6.708 0 0 1 12.26 0l.228.515-.229.515a6.708 6.708 0 0 1-12.259 0M.5 6.876l-.26.585a1.33 1.33 0 0 0 0 1.079l.26.584a8.208 8.208 0 0 0 15 0l.26-.584a1.33 1.33 0 0 0 0-1.08l-.26-.584a8.208 8.208 0 0 0-15 0M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  );

  svg.appendChild(
    path,
  );

  return svg;
}