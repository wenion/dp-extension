export async function connect() {
  return chrome.runtime.sendMessage({
    type: "CONTENT/CONNECT",    
    source: "CONTENT",
  });
}

export function startSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/START",
    source: "CONTENT",
  })
}

export function expandPanel() {
  chrome.runtime.sendMessage({
    type: "PANEL/EXPAND",
    source: "CONTENT",
  })
}

export function collapsePanel() {
  chrome.runtime.sendMessage({
    type: "PANEL/COLLAPSE",
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

export function requestSessionEnd() {
  chrome.runtime.sendMessage({
    type: "SESSION/END_REQUEST",
    source: "CONTENT",
  })
}

export function endSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/END",
    source: "CONTENT",
  })
}

export function cancelSessionEndRequest() {
  chrome.runtime.sendMessage({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "CONTENT",
  })
}

export function exitSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT",
    source: "CONTENT",
  });
}

export function cancelSessionExitRequest() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "CONTENT",
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
