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

export interface OverlayState {
  activeSession?: ActiveSession;
  tabs?: readonly TabState[];
  tabId?: number;
  notice?: string;
}

export interface ContentStoreState
  extends OverlayState {
    mount?: boolean;
  }
