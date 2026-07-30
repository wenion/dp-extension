import { InjectionResult } from "@/shared/content-script";
import type { Session } from "@/shared/types";

export async function connect() {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/CONNECT",
    source: "OPTIONS",
  });
}

export async function mount() {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/MOUNT",
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

export function exit() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT",
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

export function finishUploaded() {
  chrome.runtime.sendMessage({
    type: "SESSION/FINISH_UPLOADED",
    source: "OPTIONS",
  })
}

export function finishFailed() {
  chrome.runtime.sendMessage({
    type: "SESSION/FINISH_FAILED",
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

export async function permissionGranted(
  origin: string
): Promise<InjectionResult> {
  return chrome.runtime.sendMessage({
    type: "TABS/GRANTED",
    source: "OPTIONS",
    payload: { origin },
  })
}

export function nameSession(
  sessionId: string,
  newTitle: string
): Promise<Session | undefined>  {
  return chrome.runtime.sendMessage({
    type: "SESSION/NAME",
    source: "OPTIONS",
    payload: { sessionId, newTitle },
  })
}

export function renameSession(
  sessionId: string,
  newTitle: string
): Promise<Session | undefined>  {
  return chrome.runtime.sendMessage({
    type: "SESSION/RENAME",
    source: "OPTIONS",
    payload: { sessionId, newTitle },
  })
}

export function retryUpload(
  sessionId: string,
): Promise<Session | undefined> {
  return chrome.runtime.sendMessage({
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

export async function dismissNotification(
  notificationId: string,
) {
  return chrome.runtime.sendMessage({
    type: "NOTIFICATION/DISMISS",
    source: "OPTIONS",
    payload: { notificationId },
  });
}
