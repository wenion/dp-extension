import type {
  ActiveSession,
  TabState,
} from "@/shared/types";

export type OverlayState = {
  activeSession?: ActiveSession;
  tabs: readonly TabState[];
  tabId?: number;
}
