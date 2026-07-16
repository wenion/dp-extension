// import type { BackgroundRequest } from "@/shared/message/commands";

export async function initialize() {
  return chrome.runtime.sendMessage({
    type: "APP/GET_INITIAL_STATE",    
    source: "CONTENT",
  });
}

export function startSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/START",
    source: "CONTENT",
  })
}

export function endSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/END",
    source: "CONTENT",
  })
}

export function expand() {
  chrome.runtime.sendMessage({
    type: "PAGE/EXPAND",
    source: "CONTENT",
  })
}

export function collapse() {
  chrome.runtime.sendMessage({
    type: "PAGE/COLLAPSE",
    source: "CONTENT",
  })
}

export function pauseSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/PAUSE",
    source: "CONTENT",
  })
}

export function resumeSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/RESUME",
    source: "CONTENT",
  })
}

export function stop() {
  chrome.runtime.sendMessage({
    type: "PAGE/STOP",
    source: "CONTENT",
  })
}

export function cancelStop() {
  chrome.runtime.sendMessage({
    type: "PAGE/BACK",
    source: "CONTENT",
  })
}

export function finish() {
  chrome.runtime.sendMessage({
    type: "PAGE/FINISH",
    source: "CONTENT",
  })
}

export function includeTab() {
  chrome.runtime.sendMessage({
    type: "TAB/INCLUDE",
    source: "CONTENT",
  })
}

export function excludeTab() {
  chrome.runtime.sendMessage({
    type: "TAB/EXCLUDE",
    source: "CONTENT",
  })
}

export function openOptionsPage() {
  chrome.runtime.sendMessage({
    type: "TAB/OPEN_OPTIONS",
    source: "CONTENT",
  })
}
