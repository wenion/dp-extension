import type {
  PageState,
  PageTrigger,
 } from "@/shared/types";

const PAGE_STATE_TRANSITIONS : Record<
  PageState,
  Partial<Record<PageTrigger, PageState>>
> = {
  idle: {
    START_SESSION: "collapsed",
  },

  collapsed: {
    EXPAND: "expanded",
    STOP: "confirm",
    EXIT: "alert",
  },

  expanded: {
    COLLAPSE: "collapsed",
    STOP: "confirm",
    EXIT: "alert",
  },

  confirm: {
    BACK: "expanded",
    END_SESSION: "uploading",
    // UPLOAD: "uploading",
    EXIT: "alert",
  },

  alert: {
    BACK: "expanded",
    END_SESSION: "uploading",
    UPLOAD: "uploading",
  },

  uploading: {
    UPLOADED: "uploaded",
    FORCE_UPLOADED: "forceUploaded",
    UPLOADFAILED: "uploadFailed",
  },

  uploaded: {
    FINISH: "idle",
    EXIT: "idle",
  },

  uploadFailed: {
    FINISH: "idle",
    EXIT: "idle",
  },

  forceUploaded: {
    FINISH: "idle",
  },
};

export function getNextPageState(
  currentState: PageState,
  trigger: PageTrigger,
): PageState | undefined {
  return PAGE_STATE_TRANSITIONS [currentState]?.[trigger];
}
