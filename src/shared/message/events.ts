import type {
  Notification,
  OptionsState,
  PageState,
  Session,
  TabState,
} from "@/shared/types";

export interface PageStateInitedEvent {
  type: "OPTIONS/INITIALIZED";
  payload: OptionsState;
}

export interface SessionUpdatedEvent {
  type: "SESSION/UPDATED";
  payload: Session;
}

export interface PageStateUpdatedEvent {
  type: "PAGE_STATE/UPDATED";
  payload: PageState;
}

// export interface TabStateUpdatedEvent {
//   type: "TAB_STATE/UPDATED";
//   payload: TabState;
// }

export interface PageMountedEvent {
  type: "PAGE/MOUNTED";
}

export interface PageUnmountedEvent {
  type: "PAGE/UNMOUNTED";
}

export interface TabsUpdatedEvent {
  type: "TABS/UPDATED";
  payload: TabState[];
}

export interface SessionsUpdatedEvent {
  type: "SESSIONS/UPDATED";
  payload: Session[];
}

export interface NotificationsUpdatedEvent {
  type: "NOTIFICATIONS/UPDATED";
  payload: {
    notifications: Notification[],
    currentNotification?: Notification,
  }
}

export type EventMessage =
  | NotificationsUpdatedEvent
  | PageStateInitedEvent
  | SessionUpdatedEvent
  | SessionUpdatedEvent
  | SessionsUpdatedEvent
  | PageStateUpdatedEvent
  | PageMountedEvent
  | PageUnmountedEvent
  | TabsUpdatedEvent;
