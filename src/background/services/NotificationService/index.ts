import type { NotificationRepository } from "../../repositories/NotificationRepository";
import type { ContentScriptClient } from "../../clients/ContentScriptClient";

import {
  NotificationLevel,
  type Notification
} from "@/shared/types";

import type { NotificationDefinition } from "./NotificationDefinitions";

export class NotificationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly contentScriptClient: ContentScriptClient;
  
  constructor(
    notificationRepository: NotificationRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.notificationRepository = notificationRepository;
    this.contentScriptClient = contentScriptClient;
  }

  getNotifications(): readonly Notification[] {
    return this.notificationRepository.getAll();
  }

  getCurrentNotification(): Notification | undefined {
    return this.notificationRepository.getCurrent();
  }

  async notify(
    definition: NotificationDefinition,
    options?: {
      tabId?: number;
    },
  ): Promise<void> {
    await this.present(
      definition.level,
      definition.title,
      definition.message,
      {
        ...options,
        action: definition.action && {
          ...definition.action,
          tabId: options?.tabId,
        },
      },
    );
  }

  private present(
    level: NotificationLevel,
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      action?: Notification["action"];
    },
  ) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),

      level,
      title,
      message,

      dismissible: options?.dismissible ?? true,
      expiresAt: options?.expiresAt,

      action: options?.action,
    };

    this.notificationRepository.set(notification);

    this.notificationRepository.setCurrent(notification.id);

    this.notifyNotificationsUpdated();
  }

  dismiss(): void {
    this.notificationRepository.clearCurrent();

    this.notifyNotificationsUpdated();
  }

  clear(): void {
    this.notificationRepository.clear();

    this.notifyNotificationsUpdated();
  }

  private notifyNotificationsUpdated(): void {
    this.contentScriptClient.broadcast({
      type: "NOTIFICATIONS/UPDATED",
      payload: {
        notifications: this.getNotifications(),
        currentNotification: this.getCurrentNotification(),
      },
    });
  }

  private async notifyNotificationPresented() {
    // openOptionsPage()
  }
}
