import type { Dispose } from "../types";

export function listen<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  listener: (event: DocumentEventMap[K]) => unknown,
  options?: AddEventListenerOptions
): Dispose;

export function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => unknown,
  options?: AddEventListenerOptions
): Dispose;

export function listen(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): Dispose {

  target.addEventListener(type, listener, options);

  return () => {
    target.removeEventListener(type, listener, options);
  };
}
