import type {
  ContentState,
  Notification,
  OptionsPage,
  OptionsState,
  Session,
  TabState,
} from "@/shared/types";


// ===== State =====

export interface ContentStateInitializedEvent {
  type: "CONTENT/INITIALIZED";
  payload: ContentState;
}

export interface OptionsStateInitializedEvent {
  type: "OPTIONS/INITIALIZED";
  payload: OptionsState;
}


// ===== Mount =====

export interface PageMountUpdatedEvent {
  type: "MOUNT/UPDATED";
  payload: {
    mounted: boolean;
  };
}


// ===== Session =====

export interface SessionUpdatedEvent {
  type: "SESSION/UPDATED";
  payload?: Session;
}

export interface SessionsUpdatedEvent {
  type: "SESSIONS/UPDATED";
  payload: readonly Session[];
}


// ===== Tabs =====

export interface TabsUpdatedEvent {
  type: "TABS/UPDATED";
  payload: readonly TabState[];
}


// ===== Notifications =====

export interface NotificationsUpdatedEvent {
  type: "NOTIFICATIONS/UPDATED";
  payload: {
    notifications: readonly Notification[];
    currentNotification?: Notification;
  };
}

export interface NoticeUpdatedEvent {
  type: "NOTICE/SHOW";
  payload?: string;
}


// ===== Options =====

export interface AllowlistUpdatedEvent {
  type: "ALLOWLIST/UPDATED";
  payload: {
    allowlist: readonly string[];
  };
}

export interface ExitDialogRequestedEvent {
  type: "EXIT_DIALOG/REQUESTED";
}

export interface OptionsPageUpdatedEvent {
  type: "OPTIONS_PAGE/UPDATED";
  payload: {
    page?: OptionsPage;
  };
}


// ===== System =====

export interface PingEvent {
  type: "PING";
}


// ===== Background Events =====

export type BackgroundEvent =
  | ContentStateInitializedEvent
  | OptionsStateInitializedEvent
  | PageMountUpdatedEvent
  | OptionsPageUpdatedEvent
  | AllowlistUpdatedEvent
  | ExitDialogRequestedEvent
  | SessionUpdatedEvent
  | SessionsUpdatedEvent
  | TabsUpdatedEvent
  | NotificationsUpdatedEvent
  | NoticeUpdatedEvent
  | PingEvent;
