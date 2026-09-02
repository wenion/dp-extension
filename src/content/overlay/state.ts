// overlay/state.ts

import type {
  PanelPage,
  TabState,
} from "@/shared/types";

import type {
  OverlayState,
} from "../types";

export function getCurrentTab(
  state: OverlayState,
): TabState | undefined {
  return state.tabs?.find(
    tab => tab.tabId === state.tabId,
  );
}

export function getNumberOfRecordingTabs(
  state: OverlayState,
): number {
  return state.tabs?.filter(
    tab =>
      tab.recordingScope === "recording",
  ).length ?? 0;
}

export function getPage(
  state: OverlayState,
): PanelPage {
  if (state.notice) {
    return "notice";
  }

  if (state.activeSession?.endedAt) {
    return state.activeSession.uploadStatus;
  }

  if (state.activeSession?.page) {
    return state.activeSession.page;
  }

  return "idle";
}