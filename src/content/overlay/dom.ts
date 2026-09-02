const HOST_ID = "trace-capture-overlay";
const STYLE_ID = "trace-capture-style";
const ROOT_ID = "trace-capture-root";

export function createHost(): HTMLDivElement {
  const host = document.createElement("div");

  host.id = HOST_ID;
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";

  document.body.appendChild(host);

  return host;
}

export function createShadowRoot(
  host: HTMLDivElement,
): ShadowRoot {
  return host.attachShadow({
    mode: "open",
  });
}

export function createContainer(
  shadowRoot: ShadowRoot,
): HTMLDivElement {
  const container = document.createElement("div");

  container.id = ROOT_ID;
  shadowRoot.appendChild(container);

  return container;
}

export function injectStyle(
  shadowRoot: ShadowRoot,
): HTMLLinkElement {
  const link = document.createElement("link");

  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL(
    "content-script.css",
  );

  shadowRoot.appendChild(link);

  return link;
}

export function removeHost(
  host: HTMLDivElement | null,
) {
  host?.remove();
}
