const SVG_NS =
  "http://www.w3.org/2000/svg";

export function createCircleCheck(
  size = 16,
): SVGSVGElement {
  const svg =
    document.createElementNS(
      SVG_NS,
      "svg",
    );

  svg.setAttribute(
    "width",
    String(size),
  );

  svg.setAttribute(
    "height",
    String(size),
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
    "M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m-3.9-1.55a.75.75 0 1 0-1.2-.9L7.419 8.858 6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z",
  );

  svg.appendChild(
    path,
  );

  return svg;
}