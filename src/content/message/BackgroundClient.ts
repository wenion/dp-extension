import type {
  ContentEvent,
} from "@/shared/message/contentEvents";

function sendContentEvent(
  event: ContentEvent,
) {
  return chrome.runtime.sendMessage(event);
}

export async function connect() {
  return sendContentEvent({
    type: "CONTENT/CONNECT",    
    source: "CONTENT",
  });
}

export function startSession() {
  return sendContentEvent({
    type: "SESSION/START",
    source: "CONTENT",
  })
}

export function expandPanel() {
  return sendContentEvent({
    type: "PANEL/EXPAND",
    source: "CONTENT",
  })
}

export function collapsePanel() {
  return sendContentEvent({
    type: "PANEL/COLLAPSE",
    source: "CONTENT",
  })
}

export function pauseSession() {
  return sendContentEvent({
    type: "SESSION/PAUSE",
    source: "CONTENT",
  })
}

export function resumeSession() {
  return sendContentEvent({
    type: "SESSION/RESUME",
    source: "CONTENT",
  })
}

export function requestSessionEnd() {
  return sendContentEvent({
    type: "SESSION/END_REQUEST",
    source: "CONTENT",
  })
}

export function endSession() {
  return sendContentEvent({
    type: "SESSION/END",
    source: "CONTENT",
  })
}

export function cancelSessionEndRequest() {
  return sendContentEvent({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "CONTENT",
  })
}

export function exitSession() {
  return sendContentEvent({
    type: "SESSION/EXIT",
    source: "CONTENT",
  });
}

export function cancelSessionExitRequest() {
  return sendContentEvent({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "CONTENT",
  })
}

export function completeUploadedSession() {
  return sendContentEvent({
    type: "SESSION/UPLOADED_DONE",
    source: "CONTENT",
  })
}

export function completeUploadFailedSession() {
  return sendContentEvent({
    type: "SESSION/UPLOAD_FAILED_DONE",
    source: "CONTENT",
  })
}

export function includeTab() {
  return sendContentEvent({
    type: "TAB/INCLUDE",
    source: "CONTENT",
  })
}

export function excludeTab() {
  return sendContentEvent({
    type: "TAB/EXCLUDE",
    source: "CONTENT",
  })
}

export function openOptionsPage() {
  return sendContentEvent({
    type: "TAB/OPEN_OPTIONS",
    source: "CONTENT",
  })
}

export function addToAllowlist() {
  return sendContentEvent({
    type: "TAB/ADD_TO_ALLOWLIST",
    source: "CONTENT",
  });
}

export function promptHostPermission() {
  return sendContentEvent({
    type: "TAB/PROMPT_HOST_PERMISSION",
    source: "CONTENT",
  });
}
