export const injectPageScript = (onLoad?: () => void) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("injected.js");

  script.addEventListener("load", () => {
    try {
      onLoad?.();
    } finally {
      script.remove();
    }
  });

  (document.head || document.documentElement).appendChild(script);
}
