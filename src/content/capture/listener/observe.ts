import type { Dispose } from "../types";

export function observe(
  target: Node,
  config: MutationObserverInit,
  callback: MutationCallback
): Dispose {

  const observer = new MutationObserver(callback);

  observer.observe(target, config);

  return () => observer.disconnect();

}
