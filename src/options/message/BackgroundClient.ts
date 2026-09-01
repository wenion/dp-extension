import type {
  OptionsPage,
  Session,
} from "@/shared/types";

import type {
  OptionsEvent,
  OptionsMessageType,
  OptionsResponse,
} from "@/shared/messaging/optionsProtocol";

async function sendOptionsMessage<
  T extends OptionsMessageType,
>(
  event: OptionsEvent<T>,
): Promise<OptionsResponse<T>> {
  return chrome.runtime.sendMessage(event);
}

export async function connect() {
  return sendOptionsMessage({
    type: "OPTIONS/CONNECT",
    source: "OPTIONS",
  });
}

export function startSession() {
  return sendOptionsMessage({
    type: "SESSION/START",
    source: "OPTIONS",
  });
}

export function pauseSession() {
  return sendOptionsMessage({
    type: "SESSION/PAUSE",
    source: "OPTIONS",
  });
}

export function resumeSession() {
  return sendOptionsMessage({
    type: "SESSION/RESUME",
    source: "OPTIONS",
  });
}

export function requestSessionEnd() {
  return sendOptionsMessage({
    type: "SESSION/END_REQUEST",
    source: "OPTIONS",
  });
}

export function endSession() {
  return sendOptionsMessage({
    type: "SESSION/END",
    source: "OPTIONS",
  });
}

export function cancelSessionEndRequest() {
  return sendOptionsMessage({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "OPTIONS",
  });
}

export function exitSession() {
  return sendOptionsMessage({
    type: "SESSION/EXIT",
    source: "OPTIONS",
  });
}

export function cancelSessionExitRequest() {
  return sendOptionsMessage({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "OPTIONS",
  });
}

export function completeUploadedSession() {
  return sendOptionsMessage({
    type: "SESSION/UPLOADED_DONE",
    source: "OPTIONS",
  });
}

export function completeUploadFailedSession() {
  return sendOptionsMessage({
    type: "SESSION/UPLOAD_FAILED_DONE",
    source: "OPTIONS",
  });
}

export function includeTab(
  tabId: number,
) {
  return sendOptionsMessage({
    type: "TAB/INCLUDE",
    source: "OPTIONS",
    payload: {
      tabId,
    },
  });
}

export function excludeTab(
  tabId: number,
) {
  return sendOptionsMessage({
    type: "TAB/EXCLUDE",
    source: "OPTIONS",
    payload: {
      tabId,
    },
  });
}

export async function setActiveSessionName(
  sessionId: string,
  name: string,
): Promise<Session | undefined> {
  const response =
    await sendOptionsMessage({
      type: "OPTIONS/NAME_SESSION",
      source: "OPTIONS",
      payload: {
        sessionId,
        name,
      },
    });

  return response;
}

export async function renameSession(
  sessionId: string,
  name: string,
): Promise<boolean> {
  return sendOptionsMessage({
    type: "OPTIONS/RENAME_SESSION",
    source: "OPTIONS",
    payload: {
      sessionId,
      name,
    },
  });
}

export async function retryUpload(
  sessionId: string,
): Promise<boolean> {
  return sendOptionsMessage({
    type: "OPTIONS/RETRY_SESSION",
    source: "OPTIONS",
    payload: {
      sessionId,
    },
  });
}

export function openSession(
  sessionId: string,
) {
  return sendOptionsMessage({
    type: "OPTIONS/OPEN_SESSION",
    source: "OPTIONS",
    payload: {
      sessionId,
    },
  });
}

export async function dismissNotification(
  notificationId: string,
) {
  return sendOptionsMessage({
    type: "OPTIONS/DISMISS_NOTIFICATION",
    source: "OPTIONS",
    payload: {
      notificationId,
    },
  });
}

export async function toggleMount() {
  return sendOptionsMessage({
    type: "OPTIONS/TOGGLE_MOUNT",
    source: "OPTIONS",
  });
}

export async function setOptionsPage(
  page?: OptionsPage,
) {
  return sendOptionsMessage({
    type: "OPTIONS/SET_PAGE",
    source: "OPTIONS",
    payload: {
      page,
    },
  });
}

export async function promptTemporaryPermission(
  tabId: number,
) {
  return sendOptionsMessage({
    type: "OPTIONS/PROMPT_TEMPORARY_PERMISSION",
    source: "OPTIONS",
    payload: {
      tabId,
    },
  });
}

export async function addToAllowlist(
  origin: string,
) {
  return sendOptionsMessage({
    type: "OPTIONS/ALLOWLIST_ADD",
    source: "OPTIONS",
    payload: {
      origin,
    },
  });
}

export async function removeFromAllowlist(
  origin: string,
) {
  return sendOptionsMessage({
    type: "OPTIONS/ALLOWLIST_REMOVE",
    source: "OPTIONS",
    payload: {
      origin,
    },
  });
}
