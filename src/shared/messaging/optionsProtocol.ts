import type {
  OptionsPage,
  OptionsState,
  Session,
} from "@/shared/types";

/**
 * Defines the messaging contract from Options Page to Background.
 *
 * Each message specifies:
 * - request: data sent by the Options Page
 * - response: data returned by the Background
 */
export interface OptionsProtocol {
  // ===== Session =====

  "SESSION/START": {
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

  // ===== Tabs =====

  "TAB/INCLUDE": {
    request: {
      tabId: number;
    };
    response: void;
  };

  "TAB/EXCLUDE": {
    request: {
      tabId: number;
    };
    response: void;
  };

  "OPTIONS/CONNECT": {
    request: void;
    response: OptionsState;
  };

  "OPTIONS/NAME_SESSION": {
    request: {
      sessionId: string;
      name: string;
    };
    response: Session | undefined;
  };

  "OPTIONS/RENAME_SESSION": {
    request: {
      sessionId: string;
      name: string;
    };
    response: boolean;
  };

  "OPTIONS/RETRY_SESSION": {
    request: {
      sessionId: string;
    };
    response: boolean;
  };

  "OPTIONS/OPEN_SESSION": {
    request: {
      sessionId: string;
    };
    response: void;
  };

  "OPTIONS/DISMISS_NOTIFICATION": {
    request: {
      notificationId: string;
    };
    response: void;
  };

  "OPTIONS/TOGGLE_MOUNT": {
    request: void;
    response: void;
  };

  "OPTIONS/SET_PAGE": {
    request: {
      page?: OptionsPage;
    };
    response: void;
  };

  "OPTIONS/PROMPT_TEMPORARY_PERMISSION": {
    request: {
      tabId: number;
    };
    response: void;
  };

  "OPTIONS/ALLOWLIST_ADD": {
    request: {
      origin: string;
    };
    response: void;
  };

  "OPTIONS/ALLOWLIST_REMOVE": {
    request: {
      origin: string;
    };
    response: void;
  };
}

export type OptionsMessageType =
  keyof OptionsProtocol;

export type OptionsEvent<
  T extends OptionsMessageType = OptionsMessageType,
> =
  T extends OptionsMessageType
    ? OptionsProtocol[T]["request"] extends void
      ? {
          type: T;
          source: "OPTIONS";
        }
      : {
          type: T;
          source: "OPTIONS";
          payload: OptionsProtocol[T]["request"];
        }
    : never;

export type OptionsResponse<
  T extends OptionsMessageType,
> = OptionsProtocol[T]["response"];
