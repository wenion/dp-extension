import type {
  ActiveSession,
  TabState,
} from "@/shared/types";

export type DialogState = {
  message: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

export type OverlayState = {
  activeSession?: ActiveSession;
  tabs: readonly TabState[];
  tabId?: number;
}
