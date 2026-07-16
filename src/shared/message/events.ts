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

export interface PageMountedEvent {
  type: "PAGE/MOUNTED";
  payload: {
    pageState: PageState;
    mounted: boolean;
    activeSession: Session | undefined;
    tabs: readonly TabState[];
    sessions: readonly Session[];
    // tabId: number;
  };
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

export type EventMessage =
  | SessionUpdatedEvent
  | SessionsUpdatedEvent
  | PageStateUpdatedEvent
  | PageMountedEvent
  | PageUnmountedEvent
  | TabsUpdatedEvent;