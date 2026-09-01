import type {
  ContentEvent,
  ContentMessageType,
  ContentResponse,
} from "@/shared/messaging/contentProtocol";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

async function sendContentMessage<
  T extends ContentMessageType,
>(
  event: ContentEvent<T>,
): Promise<ContentResponse<T>> {
  return chrome.runtime.sendMessage(event);
}

export function connect() {
  return sendContentMessage({
    type: "CONTENT/CONNECT",
    source: "CONTENT",
  });
}

export function captureStarted() {
  return sendContentMessage({
    type: "CAPTURE/STARTED",
    source: "CONTENT",
  });
}

export function captureStopped() {
  return sendContentMessage({
    type: "CAPTURE/STOPPED",
    source: "CONTENT",
  });
}

export function startSession() {
  return sendContentMessage({
    type: "SESSION/START",
    source: "CONTENT",
  });
}

export function expandPanel() {
  return sendContentMessage({
    type: "PANEL/EXPAND",
    source: "CONTENT",
  });
}

export function collapsePanel() {
  return sendContentMessage({
    type: "PANEL/COLLAPSE",
    source: "CONTENT",
  });
}

export function pauseSession() {
  return sendContentMessage({
    type: "SESSION/PAUSE",
    source: "CONTENT",
  });
}

export function resumeSession() {
  return sendContentMessage({
    type: "SESSION/RESUME",
    source: "CONTENT",
  });
}

export function requestSessionEnd() {
  return sendContentMessage({
    type: "SESSION/END_REQUEST",
    source: "CONTENT",
  });
}

export function endSession() {
  return sendContentMessage({
    type: "SESSION/END",
    source: "CONTENT",
  });
}

export function cancelSessionEndRequest() {
  return sendContentMessage({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "CONTENT",
  });
}

export function exitSession() {
  return sendContentMessage({
    type: "SESSION/EXIT",
    source: "CONTENT",
  });
}

export function cancelSessionExitRequest() {
  return sendContentMessage({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "CONTENT",
  });
}

export function completeUploadedSession() {
  return sendContentMessage({
    type: "SESSION/UPLOADED_DONE",
    source: "CONTENT",
  });
}

export function completeUploadFailedSession() {
  return sendContentMessage({
    type: "SESSION/UPLOAD_FAILED_DONE",
    source: "CONTENT",
  });
}

export function includeTab() {
  return sendContentMessage({
    type: "TAB/INCLUDE",
    source: "CONTENT",
  });
}

export function excludeTab() {
  return sendContentMessage({
    type: "TAB/EXCLUDE",
    source: "CONTENT",
  });
}

export function openOptionsPage() {
  return sendContentMessage({
    type: "TAB/OPEN_OPTIONS",
    source: "CONTENT",
  });
}

export function addToAllowlist() {
  return sendContentMessage({
    type: "TAB/ADD_TO_ALLOWLIST",
    source: "CONTENT",
  });
}

export function promptTemporaryPermission() {
  return sendContentMessage({
    type: "TAB/PROMPT_TEMPORARY_PERMISSION",
    source: "CONTENT",
  });
}

export function promptHostPermission() {
  return sendContentMessage({
    type: "TAB/PROMPT_HOST_PERMISSION",
    source: "CONTENT",
  });
}

export function sendUserTrace(
  trace: UserEvent,
) {
  return sendContentMessage({
    type: "TRACE/USER",
    source: "CONTENT",
    payload: {
      trace,
    },
  });
}

export function sendGoogleDocsTrace(
  trace: GoogleDocsMeta,
) {
  return sendContentMessage({
    type: "TRACE/GOOGLE",
    source: "CONTENT",
    payload: {
      trace,
    },
  });
}
