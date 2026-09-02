const SVG_NS =
  "http://www.w3.org/2000/svg";

export function createTriangleRightFill(): SVGSVGElement {
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
    "M13.756 10.164c1.665-.962 1.665-3.366 0-4.328L5.251.919C3.584-.045 1.5 1.158 1.5 3.083v9.834c0 1.925 2.084 3.128 3.751 2.164z",
  );

  svg.appendChild(
    path,
  );

  return svg;
}