import type {
  ContentState,
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

/**
 * Messaging contract from Content Script to Background.
 *
 * Each message defines:
 * - request: data sent by the Content Script
 * - response: data returned by the Background
 */
export interface ContentProtocol {
  "CONTENT/CONNECT": {
    request: void;
    response: ContentState;
  };

  "CAPTURE/STARTED": {
    request: void;
    response: void;
  };

  "CAPTURE/STOPPED": {
    request: void;
    response: void;
  };

  "SESSION/START": {
    request: void;
    response: void;
  };

  "PANEL/EXPAND": {
    request: void;
    response: void;
  };

  "PANEL/COLLAPSE": {
    request: void;
    response: void;
  };

  "SESSION/PAUSE": {
    request: void;
    response: void;
  };

  "SESSION/RESUME": {
    request: void;
    response: void;
  };

  "SESSION/END_REQUEST": {
    request: void;
    response: void;
  };

  "SESSION/END": {
    request: void;
    response: void;
  };

  "SESSION/END_REQUEST_CANCELLED": {
    request: void;
    response: void;
  };

  "SESSION/EXIT": {
    request: void;
    response: void;
  };

  "SESSION/EXIT_REQUEST_CANCELLED": {
    request: void;
    response: void;
  };

  "SESSION/UPLOADED_DONE": {
    request: void;
    response: void;
  };

  "SESSION/UPLOAD_FAILED_DONE": {
    request: void;
    response: void;
  };

  "TAB/INCLUDE": {
    request: void;
    response: void;
  };

  "TAB/EXCLUDE": {
    request: void;
    response: void;
  };

  "TAB/OPEN_OPTIONS": {
    request: void;
    response: void;
  };

  "TAB/ADD_TO_ALLOWLIST": {
    request: void;
    response: void;
  };

  "TAB/PROMPT_TEMPORARY_PERMISSION": {
    request: void;
    response: void;
  };

  "TAB/PROMPT_HOST_PERMISSION": {
    request: void;
    response: void;
  };

  "TRACE/USER": {
    request: {
      trace: UserEvent;
    };
    response: void;
  };

  "TRACE/GOOGLE": {
    request: {
      trace: GoogleDocsMeta;
    };
    response: void;
  };
}

export type ContentMessageType =
  keyof ContentProtocol;

export type ContentEvent<
  T extends ContentMessageType = ContentMessageType,
> =
  T extends ContentMessageType
    ? ContentProtocol[T]["request"] extends void
      ? {
          type: T;
          source: "CONTENT";
        }
      : {
          type: T;
          source: "CONTENT";
          payload: ContentProtocol[T]["request"];
        }
    : never;

export type ContentResponse<
  T extends ContentMessageType,
> = ContentProtocol[T]["response"];
