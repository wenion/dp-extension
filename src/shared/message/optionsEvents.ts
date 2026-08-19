import type {
  OptionsPage,
} from "@/shared/types";

export interface SessionStartEvent {
  type: "SESSION/START";
  source: "OPTIONS";
}

export interface SessionPauseEvent {
  type: "SESSION/PAUSE";
  source: "OPTIONS";
}

export interface SessionResumeEvent {
  type: "SESSION/RESUME";
  source: "OPTIONS";
}

export interface SessionEndRequestEvent {
  type: "SESSION/END_REQUEST";
  source: "OPTIONS";
}

export interface SessionEndEvent {
  type: "SESSION/END";
  source: "OPTIONS";
}

export interface SessionEndRequestCancelledEvent {
  type: "SESSION/END_REQUEST_CANCELLED";
  source: "OPTIONS";
}

export interface SessionExitEvent {
  type: "SESSION/EXIT";
  source: "OPTIONS";
}

export interface SessionExitRequestCancelledEvent {
  type: "SESSION/EXIT_REQUEST_CANCELLED";
  source: "OPTIONS";
}

export interface SessionUploadedDoneEvent {
  type: "SESSION/UPLOADED_DONE";
  source: "OPTIONS";
}

export interface SessionUploadFailedDoneEvent {
  type: "SESSION/UPLOAD_FAILED_DONE";
  source: "OPTIONS";
}

export interface TabIncludeEvent {
  type: "TAB/INCLUDE";
  source: "OPTIONS";
  payload: {
    tabId: number;
  };
}

export interface TabExcludeEvent {
  type: "TAB/EXCLUDE";
  source: "OPTIONS";
  payload: {
    tabId: number;
  };
}

export interface TabsGrantedEvent {
  type: "TABS/GRANTED";
  source: "OPTIONS";
  payload: {
    origin: string;
  };
}

export interface OptionsConnectEvent {
  type: "OPTIONS/CONNECT";
  source: "OPTIONS";
}

export interface OptionsSessionNameEvent {
  type: "OPTIONS/NAME_SESSION";
  source: "OPTIONS";
  payload: {
    sessionId: string;
    name: string;
  };
}

export interface OptionsSessionRenameEvent {
  type: "OPTIONS/RENAME_SESSION";
  source: "OPTIONS";
  payload: {
    sessionId: string;
    name: string;
  };
}

export interface OptionsSessionRetryEvent {
  type: "OPTIONS/RETRY_SESSION";
  source: "OPTIONS";
  payload: {
    sessionId: string;
  };
}

export interface OptionsSessionOpenEvent {
  type: "OPTIONS/OPEN_SESSION";
  source: "OPTIONS";
  payload: {
    sessionId: string;
  };
}

export interface OptionsNotificationDismissEvent {
  type: "OPTIONS/DISMISS_NOTIFICATION";
  source: "OPTIONS";
  payload: {
    notificationId: string;
  };
}

export interface OptionsToggleMountEvent {
  type: "OPTIONS/TOGGLE_MOUNT";
  source: "OPTIONS";
}

export interface OptionsPageSetEvent {
  type: "OPTIONS/SET_PAGE";
  source: "OPTIONS";
  payload: {
    page?: OptionsPage;
  };
}

export interface AllowlistRemoveEvent {
  type: "OPTIONS/ALLOWLIST_REMOVE";
  source: "OPTIONS";
  payload: {
    origin: string;
  };
}

export type OptionsEvent =
  | SessionStartEvent
  | SessionPauseEvent
  | SessionResumeEvent
  | SessionEndRequestEvent
  | SessionEndEvent
  | SessionEndRequestCancelledEvent
  | SessionExitEvent
  | SessionExitRequestCancelledEvent
  | SessionUploadedDoneEvent
  | SessionUploadFailedDoneEvent
  | TabIncludeEvent
  | TabExcludeEvent
  | TabsGrantedEvent

  | OptionsConnectEvent
  | OptionsSessionNameEvent
  | OptionsSessionRenameEvent
  | OptionsSessionRetryEvent
  | OptionsSessionOpenEvent
  | OptionsNotificationDismissEvent
  | OptionsToggleMountEvent
  | OptionsPageSetEvent
  | AllowlistRemoveEvent;
