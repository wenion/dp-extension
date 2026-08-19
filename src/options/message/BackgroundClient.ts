import type {
  InjectionResult,
} from "@/shared/content-script";
import type {
  OptionsPage,
  Session,
} from "@/shared/types";
import type {
  OptionsEvent,
} from "@/shared/message/optionsEvents";

function sendOptionsEvent(
  event: OptionsEvent,
) {
  return chrome.runtime.sendMessage(
    event,
  );
}

export async function connect() {
  return sendOptionsEvent({
    type: "OPTIONS/CONNECT",
    source: "OPTIONS",
  });
}

export function startSession() {
  return sendOptionsEvent({
    type: "SESSION/START",
    source: "OPTIONS",
  });
}

export function pauseSession() {
  return sendOptionsEvent({
    type: "SESSION/PAUSE",
    source: "OPTIONS",
  });
}

export function resumeSession() {
  return sendOptionsEvent({
    type: "SESSION/RESUME",
    source: "OPTIONS",
  });
}

export function requestSessionEnd() {
  return sendOptionsEvent({
    type: "SESSION/END_REQUEST",
    source: "OPTIONS",
  });
}

export function endSession() {
  return sendOptionsEvent({
    type: "SESSION/END",
    source: "OPTIONS",
  });
}

export function cancelSessionEndRequest() {
  return sendOptionsEvent({
    type: "SESSION/END_REQUEST_CANCELLED",
    source: "OPTIONS",
  });
}

export function exitSession() {
  return sendOptionsEvent({
    type: "SESSION/EXIT",
    source: "OPTIONS",
  });
}

export function cancelSessionExitRequest() {
  return sendOptionsEvent({
    type: "SESSION/EXIT_REQUEST_CANCELLED",
    source: "OPTIONS",
  });
}

export function completeUploadedSession() {
  return sendOptionsEvent({
    type: "SESSION/UPLOADED_DONE",
    source: "OPTIONS",
  });
}

export function completeUploadFailedSession() {
  return sendOptionsEvent({
    type: "SESSION/UPLOAD_FAILED_DONE",
    source: "OPTIONS",
  });
}

export function includeTab(
  tabId: number,
) {
  return sendOptionsEvent({
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
  return sendOptionsEvent({
    type: "TAB/EXCLUDE",
    source: "OPTIONS",
    payload: {
      tabId,
    },
  });
}

export function permissionGranted(
  origin: string,
): Promise<InjectionResult> {
  return sendOptionsEvent({
    type: "TABS/GRANTED",
    source: "OPTIONS",
    payload: {
      origin,
    },
  });
}

export function setActiveSessionName(
  sessionId: string,
  name: string,
): Promise<Session | undefined> {
  return sendOptionsEvent({
    type: "OPTIONS/NAME_SESSION",
    source: "OPTIONS",
    payload: {
      sessionId,
      name,
    },
  });
}

export async function renameSession(
  sessionId: string,
  name: string,
): Promise<boolean> {
  const response =
    await sendOptionsEvent({
      type: "OPTIONS/RENAME_SESSION",
      source: "OPTIONS",
      payload: {
        sessionId,
        name,
      },
    });

  return response?.success === true;
}

export async function retryUpload(
  sessionId: string,
): Promise<boolean> {
  const response =
    await sendOptionsEvent({
      type: "OPTIONS/RETRY_SESSION",
      source: "OPTIONS",
      payload: {
        sessionId,
      },
    });

  return response?.success === true;
}

export function openSession(
  sessionId: string,
) {
  return sendOptionsEvent({
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
  return sendOptionsEvent({
    type: "OPTIONS/DISMISS_NOTIFICATION",
    source: "OPTIONS",
    payload: {
      notificationId,
    },
  });
}

export async function toggleMount() {
  return sendOptionsEvent({
    type: "OPTIONS/TOGGLE_MOUNT",
    source: "OPTIONS",
  });
}

export async function setOptionsPage(
  page?: OptionsPage,
) {
  return sendOptionsEvent({
    type: "OPTIONS/SET_PAGE",
    source: "OPTIONS",
    payload: {
      page,
    },
  });
}

export async function removeFromAllowlist(
  origin: string,
) {
  return sendOptionsEvent({
    type: "OPTIONS/ALLOWLIST_REMOVE",
    source: "OPTIONS",
    payload: {
      origin,
    },
  });
}
