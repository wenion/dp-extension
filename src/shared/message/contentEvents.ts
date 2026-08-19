import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

export interface ContentConnectEvent {
  type: "CONTENT/CONNECT";
  source: "CONTENT";
}

export interface SessionStartEvent {
  type: "SESSION/START";
  source: "CONTENT";
}

export interface PanelExpandEvent {
  type: "PANEL/EXPAND";
  source: "CONTENT";
}

export interface PanelCollapseEvent {
  type: "PANEL/COLLAPSE";
  source: "CONTENT";
}

export interface SessionPauseEvent {
  type: "SESSION/PAUSE";
  source: "CONTENT";
}

export interface SessionResumeEvent {
  type: "SESSION/RESUME";
  source: "CONTENT";
}

export interface SessionEndRequestEvent {
  type: "SESSION/END_REQUEST";
  source: "CONTENT";
}

export interface SessionEndEvent {
  type: "SESSION/END";
  source: "CONTENT";
}

export interface SessionEndRequestCancelledEvent {
  type: "SESSION/END_REQUEST_CANCELLED";
  source: "CONTENT";
}

export interface SessionExitEvent {
  type: "SESSION/EXIT";
  source: "CONTENT";
}

export interface SessionExitRequestCancelledEvent {
  type: "SESSION/EXIT_REQUEST_CANCELLED";
  source: "CONTENT";
}

export interface SessionUploadedDoneEvent {
  type: "SESSION/UPLOADED_DONE";
  source: "CONTENT";
}

export interface SessionUploadFailedDoneEvent {
  type: "SESSION/UPLOAD_FAILED_DONE";
  source: "CONTENT";
}

export interface TabIncludeEvent {
  type: "TAB/INCLUDE";
  source: "CONTENT";
}

export interface TabExcludeEvent {
  type: "TAB/EXCLUDE";
  source: "CONTENT";
}

export interface TabOpenOptionsEvent {
  type: "TAB/OPEN_OPTIONS";
  source: "CONTENT";
}

export interface TabAddToAllowlistEvent {
  type: "TAB/ADD_TO_ALLOWLIST";
  source: "CONTENT";
}

export interface TabPromptHostPermissionEvent {
  type: "TAB/PROMPT_HOST_PERMISSION";
  source: "CONTENT";
}

export interface TraceUserEvent {
  type: "TRACE/USER";
  source: "CONTENT";
  payload: {
    trace: UserEvent;
  };
}

export interface TraceGoogleEvent {
  type: "TRACE/GOOGLE";
  source: "CONTENT";
  payload: {
    trace: GoogleDocsMeta;
  };
}

export type ContentEvent =
  | ContentConnectEvent
  | SessionStartEvent
  | PanelExpandEvent
  | PanelCollapseEvent
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
  | TabOpenOptionsEvent
  | TabAddToAllowlistEvent
  | TabPromptHostPermissionEvent
  | TraceUserEvent
  | TraceGoogleEvent;
