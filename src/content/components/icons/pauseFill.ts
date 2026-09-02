const SVG_NS =
  "http://www.w3.org/2000/svg";

export function createPauseFill(): SVGSVGElement {
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
    "d",
    "M5 1.5A1.5 1.5 0 0 1 6.5 3v10A1.5 1.5 0 0 1 5 14.5H3A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5zm8 0A1.5 1.5 0 0 1 14.5 3v10a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 13V3A1.5 1.5 0 0 1 11 1.5z",
  );

  svg.appendChild(
    path,
  );

  return svg;
}