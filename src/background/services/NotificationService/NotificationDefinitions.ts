// NotificationDefinitions.ts

import {
  type Notification,
  NotificationAction,
  NotificationLevel,
} from "@/shared/types";

export interface NotificationDefinition {
  level: NotificationLevel;
  title: string;
  message: string;
  action?: Notification["action"];
}

export const NotificationDefinitions: Record<
  string,
  NotificationDefinition
> = {
  HostPermissionRequired: {
    level: NotificationLevel.Error,
    title: "Permission required",
    message: "Please grant host permission to enable recording.",
    action: {
      type: NotificationAction.GrantHostPermission,
      label: "Grant permission",
    },
  },

  NotLoggedIn: {
    level: NotificationLevel.Error,
    title: "Sign in required",
    message: "Please sign in to continue.",
    action: {
      type: NotificationAction.SignIn,
      label: "Sign in",
    },
  },

  RenameFailed: {
    level: NotificationLevel.Error,
    title: "Rename failed",
    message: "Unable to rename the session. Please try again.",
  },

  ReuploadFailed: {
    level: NotificationLevel.Error,
    title: "Upload failed",
    message: "Unable to upload the session. Please try again.",
  },

  NoSessionFound: {
    level: NotificationLevel.Error,
    title: "No session found",
    message: "No active session was found. Please start a new recording.",
  },
} as const;

// export type NotificationDefinition =
//   (typeof NotificationDefinitions)[keyof typeof NotificationDefinitions];
