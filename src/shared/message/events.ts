import type {
  Session,
  PageState,
  TabState,
} from "@/shared/types";

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

// export interface PageMountedUpdatedEvent {
//   type: "PAGE/MOUNTED_UPDATED";
//   payload: boolean;
// }

export interface TabsUpdatedEvent {
  type: "TABS/UPDATED";
  payload: TabState[];
}

export interface SessionsUpdatedEvent {
  type: "SESSIONS/UPDATED";
  payload: Session[];
}

export type EventMessage =
  | SessionUpdatedEvent
  | PageStateUpdatedEvent
  | SessionsUpdatedEvent
  | TabsUpdatedEvent;