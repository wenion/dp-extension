import type {
  ContentState,
  Notification,
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
  payload: Session[];
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


// ===== System =====

export interface PingEvent {
  type: "PING";
}


// ===== Background Events =====

export type BackgroundEvent =
  | ContentStateInitializedEvent
  | OptionsStateInitializedEvent
  | PageMountUpdatedEvent
  | SessionUpdatedEvent
  | SessionsUpdatedEvent
  | TabsUpdatedEvent
  | NotificationsUpdatedEvent
  | NoticeUpdatedEvent
  | PingEvent;
