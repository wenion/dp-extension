import "@/styles/globals.css";

const HOST_ID = "trace-capture-overlay";
const STYLE_ID = "trace-capture-style";

export function createHost() {

  const host = document.createElement("div");

  host.id = HOST_ID;
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";

  document.body.appendChild(host);

  return host;
}

export function removeHost(host: HTMLElement | null) {
  host?.remove();
}

export function injectStyle(): HTMLLinkElement {
  const link = document.createElement("link");

  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("content-script.css");

  document.head.appendChild(link);

  return link;
}

export function removeStyle(style: HTMLLinkElement | null)  {
  style?.remove();
}
