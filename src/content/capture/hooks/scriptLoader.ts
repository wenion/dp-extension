export const loadScript = (
  scriptPath: string,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(scriptPath);

    script.addEventListener("load", () => {
      script.remove();
      resolve(true);
    }, { once: true });

    script.addEventListener("error", () => {
      script.remove();
      resolve(false);
    }, { once: true });

    (document.head || document.documentElement)
      .appendChild(script);
  });
};
