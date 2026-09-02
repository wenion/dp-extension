const SVG_NS =
  "http://www.w3.org/2000/svg";

export function createLayoutHeader(): SVGSVGElement {
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
    "M4 3.5h8A1.5 1.5 0 0 1 13.5 5v.5h-11V5A1.5 1.5 0 0 1 4 3.5M2.5 7v4A1.5 1.5 0 0 0 4 12.5h8a1.5 1.5 0 0 0 1.5-1.5V7zM1 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3z",
  );

  svg.appendChild(
    path,
  );

  return svg;
}