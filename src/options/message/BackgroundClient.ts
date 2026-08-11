import { InjectionResult } from "@/shared/content-script";
import type { Session } from "@/shared/types";

export async function connect() {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/CONNECT",
    source: "OPTIONS",
  });
}

export function startSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/START",
    source: "OPTIONS",
  })
}

export function pauseSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/PAUSE",
    source: "OPTIONS",
  })
}

export function resumeSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/RESUME",
    source: "OPTIONS",
  })
}

export function requestSessionEnd() {
  chrome.runtime.sendMessage({
    type: "SESSION/END_REQUEST",
    source: "OPTIONS",
  })
}

export function endSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/END",
    source: "OPTIONS",
  })
}

export function cancelSessionEndRequest() {
  chrome.runtime.sendMessage({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "OPTIONS",
  })
}

export function exitSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT",
    source: "OPTIONS",
  });
}

export function cancelSessionExitRequest() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "OPTIONS",
  })
}

export function completeUploadedSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/UPLOADED_DONE",
    source: "CONTENT",
  })
}

export function completeUploadFailedSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/UPLOAD_FAILED_DONE",
    source: "CONTENT",
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

export function setActiveSessionName(
  sessionId: string,
  newTitle: string
): Promise<Session | undefined>  {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/NAME_SESSION",
    source: "OPTIONS",
    payload: { sessionId, newTitle },
  })
}

export function renameSession(
  sessionId: string,
  newTitle: string
): Promise<Session | undefined>  {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/RENAME_SESSION",
    source: "OPTIONS",
    payload: { sessionId, newTitle },
  })
}

export function retryUpload(
  sessionId: string,
): Promise<Session | undefined> {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/RETRY_SESSION",
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
    type: "OPTIONS/DISMISS_NOTIFICATION",
    source: "OPTIONS",
    payload: { notificationId },
  });
}

export async function toggleMount() {
  return chrome.runtime.sendMessage({
    type: "OPTIONS/TOGGLE_MOUNT",
    source: "OPTIONS",
  });
}
