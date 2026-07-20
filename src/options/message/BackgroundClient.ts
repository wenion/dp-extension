// import type { BackgroundRequest } from "@/shared/message/commands";
import { InjectionResult } from "@/shared/content-script";

export async function initialize() {
  return chrome.runtime.sendMessage({
    type: "APP/GET_INITIAL_STATE",
    source: "OPTIONS",
  });
}

export async function mount() {
  return chrome.runtime.sendMessage({
    type: "APP/MOUNT",
    source: "OPTIONS",
  });
}

export async function refreshSessions() {
  return chrome.runtime.sendMessage({
    type: "SESSIONS/REFRESH",
    source: "OPTIONS",
  });
}

export function startSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/START",
    source: "OPTIONS",
  })
}

export function endSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/END",
    source: "OPTIONS",
  })
}

export function forceEndSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/FORCE_END",
    source: "OPTIONS",
  });
}

export function expand() {
  chrome.runtime.sendMessage({
    type: "PAGE/EXPAND",
    source: "OPTIONS",
  })
}

export function collapse() {
  chrome.runtime.sendMessage({
    type: "PAGE/COLLAPSE",
    source: "OPTIONS",
  })
}

export function pause() {
  chrome.runtime.sendMessage({
    type: "SESSION/PAUSE",
    source: "OPTIONS",
  })
}

export function resume() {
  chrome.runtime.sendMessage({
    type: "SESSION/RESUME",
    source: "OPTIONS",
  })
}

export function stop() {
  chrome.runtime.sendMessage({
    type: "PAGE/STOP",
    source: "OPTIONS",
  })
}

export function cancelStop() {
  chrome.runtime.sendMessage({
    type: "PAGE/BACK",
    source: "OPTIONS",
  })
}

export function finish() {
  chrome.runtime.sendMessage({
    type: "PAGE/FINISH",
    source: "OPTIONS",
  })
}

export function includeTab(tabId: number) {
  chrome.runtime.sendMessage({
    type: "TAB/INCLUDE",
    source: "OPTIONS",
    payload: { tabId },
  })
}

export function excludeTab(tabId: number) {
  chrome.runtime.sendMessage({
    type: "TAB/EXCLUDE",
    source: "OPTIONS",
    payload: { tabId },
  })
}

export async function injectContent(
  tabId: number
): Promise<InjectionResult> {

  return chrome.runtime.sendMessage({
    type: "PAGE/INJECT",
    source: "OPTIONS",
    payload: { tabId },
  })
}

export function renameSession(sessionId: string, newTitle: string) {
  chrome.runtime.sendMessage({
    type: "SESSION/RENAME",
    source: "OPTIONS",
    payload: { sessionId, newTitle },
  })
}

export function retryUpload(sessionId: string) {
  chrome.runtime.sendMessage({
    type: "SESSION/RETRY",
    source: "OPTIONS",
    payload: { sessionId },
  })
}

export function openSession(sessionId: string) {
  chrome.runtime.sendMessage({
    type: "SESSION/OPEN",
    source: "OPTIONS",
    payload: { sessionId },
  })
}