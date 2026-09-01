import type {
  ContentState,
  Notification,
  OptionsPage,
  OptionsState,
  Session,
  TabState,
} from "@/shared/types";

/**
 * Messaging contract from Background to Content Script / Options.
 *
 * Each message defines:
 * - payload: data sent by the Background
 * - response: data returned by the receiver
 */
export interface BackgroundProtocol {
  // ===== State =====

  "CONTENT/INITIALIZED": {
    payload: ContentState;
    response: void;
  };

  "OPTIONS/INITIALIZED": {
    payload: OptionsState;
    response: void;
  };

  // ===== Mount =====

  "MOUNT/UPDATED": {
    payload: {
      mounted: boolean;
    };
    response: void;
  };

  // ===== Session =====

  "SESSION/UPDATED": {
    payload: Session | undefined;
    response: void;
  };

  "SESSIONS/UPDATED": {
    payload: readonly Session[];
    response: void;
  };

  // ===== Tabs =====

  "TABS/UPDATED": {
    payload: readonly TabState[];
    response: void;
  };

  // ===== Notifications =====

  "NOTIFICATIONS/UPDATED": {
    payload: {
      notifications: readonly Notification[];
      currentNotification?: Notification;
    };
    response: void;
  };

  "NOTICE/SHOW": {
    payload: string | undefined;
    response: void;
  };

  // ===== Options =====

  "ALLOWLIST/UPDATED": {
    payload: {
      allowlist: readonly string[];
    };
    response: void;
  };

  "EXIT_DIALOG/REQUESTED": {
    payload: void;
    response: void;
  };

  "OPTIONS_PAGE/UPDATED": {
    payload: {
      page?: OptionsPage;
    };
    response: void;
  };

  // ===== System =====

  "PING": {
    payload: void;
    response: void;
  };
}

export type BackgroundMessageType =
  keyof BackgroundProtocol;

export type BackgroundEvent<
  T extends BackgroundMessageType = BackgroundMessageType,
> =
  T extends BackgroundMessageType
    ? BackgroundProtocol[T]["payload"] extends void
      ? {
          type: T;
        }
      : {
          type: T;
          payload: BackgroundProtocol[T]["payload"];
        }
    : never;

export type BackgroundResponse<
  T extends BackgroundMessageType,
> = BackgroundProtocol[T]["response"];
