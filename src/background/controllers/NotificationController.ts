import { NotificationAction } from "@/shared/types";

import type { NotificationService } from "../services/NotificationService";

export class NotificationController {
  private notificationService: NotificationService;
  constructor(
    notificationService: NotificationService,
  ) {
    this.notificationService = notificationService;
  }

  async dismissNotification(
    notificationId: string,
  ) {
    await this.notificationService.dismiss(notificationId);
  }

  async showHostPermissionRequired(
    tabId: number,
  ): Promise<void> {
    await this.notificationService.error(
      "Permission required",
      "Please grant host permission to enable recording.",
      {
        tabId,
        action: {
          type: NotificationAction.GrantHostPermission,
          label: "Grant permission",
        },
      },
    );
  }

  async showNotLoggedIn(): Promise<void> {
    await this.notificationService.error(
      "Sign in required",
      "Please sign in to continue.",
      {
        action: {
          type: NotificationAction.SignIn,
          label: "Sign in",
        },
      },
    );
  }

  async showRenameFailed(): Promise<void> {
    await this.notificationService.error(
      "Rename failed",
      "Unable to rename the session. Please try again.",
    );
  }

  async showReuploadFailed(): Promise<void> {
    await this.notificationService.error(
      "Upload failed",
      "Unable to upload the session. Please try again.",
    );
  }
}
